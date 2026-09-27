-- OCCULTVIISION / TaraNidhi -- Cloudflare D1 schema, draft v1
-- Reflects docs/ARCHITECTURE.md. Do not add columns/tables that contradict that
-- document without updating it first -- this file and the architecture doc must
-- stay in sync.

PRAGMA foreign_keys = ON;

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number    TEXT NOT NULL UNIQUE,       -- OTP-verified, used for login
    email           TEXT,
    tier            TEXT NOT NULL DEFAULT 'basic'
                        CHECK (tier IN ('basic', 'premium', 'ultra')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    is_active       INTEGER NOT NULL DEFAULT 1,   -- 0 = deactivated (soft delete)
    deactivated_at  TEXT,
    -- Admin-panel access (ARCHITECTURE.md Section 9: "least privilege" --
    -- this flags a support/ops account for the read-mostly Admin API in
    -- routes/admin.ts, it is NOT the same thing as a Cloudflare/GitHub/
    -- Razorpay credential, which Section 9 already covers separately.
    -- Nobody is granted this by default; set it directly in D1 for the
    -- account owner (Naveen) and any collaborator who genuinely needs it.
    is_admin        INTEGER NOT NULL DEFAULT 0
);

-- Device fingerprints are tracked separately from users so a fingerprint can be
-- blacklisted for trial-eligibility even after the user record is soft-deleted.
CREATE TABLE device_fingerprints (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint_hash    TEXT NOT NULL UNIQUE,
    first_seen_user_id  INTEGER REFERENCES users(id),
    trial_used          INTEGER NOT NULL DEFAULT 0,   -- 1 once a trial has ever been granted on this device
    blacklisted         INTEGER NOT NULL DEFAULT 0,   -- set 1 on deactivate-and-rejoin abuse detection
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Links a user session/signup to the device it came from. A phone number ALONE is
-- not sufficient for trial-eligibility checks -- see ARCHITECTURE.md Section 8.
CREATE TABLE user_devices (
    user_id         INTEGER NOT NULL REFERENCES users(id),
    fingerprint_id  INTEGER NOT NULL REFERENCES device_fingerprints(id),
    linked_at       TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, fingerprint_id)
);

-- ============================================================
-- KUNDALI / NATAL CHART DATA
-- ============================================================

CREATE TABLE kundalis (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    label               TEXT,                       -- e.g. "Self", "Spouse" -- for multi-kundali tiers
    birth_date          TEXT NOT NULL,               -- ISO datetime (YYYY-MM-DDTHH:MM:SS)
    latitude            REAL NOT NULL,
    longitude           REAL NOT NULL,
    timezone            TEXT NOT NULL,              -- IANA timezone e.g. "Asia/Kolkata"
    janma_nakshatra_idx INTEGER,                     -- 0-26, required for Tarabala/Dasha -- must be populated on save
    lagna_rashi_idx     INTEGER,                      -- 0-11, from the existing closed-form Lagna formula (Lahiri)
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Enforce the multi-kundali tier limit at the application layer (count of rows per
-- user_id vs. tier limit), not here -- SQLite CHECK constraints can't reference
-- other rows.

-- ============================================================
-- WALLET / POINTS LEDGER
-- ============================================================
-- This is a FIFO batch ledger, NOT a single balance column. See ARCHITECTURE.md
-- Section 6 -- a simple integer balance cannot represent per-batch 1-year expiry.

CREATE TABLE wallet_ledger (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    source          TEXT NOT NULL
                        CHECK (source IN ('free_trial', 'subscription_package',
                                           'referral_commission', 'purchased_topup')),
    amount_granted  INTEGER NOT NULL,               -- points originally granted in this batch
    amount_remaining INTEGER NOT NULL,               -- decremented as this batch is consumed (FIFO)
    granted_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,                   -- free_trial: granted_at + 3 days
                                                        -- everything else: granted_at + 1 year
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'depleted', 'clawed_back')),
    -- Only populated when source = 'referral_commission':
    referral_id     INTEGER REFERENCES referrals(id),
    holding_until   TEXT                              -- referral commission not spendable until this timestamp
                                                        -- (chargeback holding period, ARCHITECTURE.md Section 7)
);

-- Every debit/consumption from the ledger, for audit and to make FIFO consumption
-- traceable (which batch(es) a given query/activation actually drew from).
CREATE TABLE wallet_transactions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_ledger_id    INTEGER NOT NULL REFERENCES wallet_ledger(id),
    amount              INTEGER NOT NULL,             -- negative for debit, positive for credit/grant
    reason              TEXT NOT NULL,                -- 'query', 'report_generation', 'new_id_activation', 'grant', 'expiry', 'clawback'
    order_id            INTEGER REFERENCES orders(id),  -- if this transaction funded an order
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Encodes the 100%/50% effective-value rule for referral-commission points used
-- toward new-ID activation (personal use = 100%, activation use = 50%, per
-- Naveen's explicit clarification). Kept as data, not hard-coded, so the rule can
-- be adjusted without a code deploy.
CREATE TABLE usage_multipliers (
    source          TEXT NOT NULL,
    use_case        TEXT NOT NULL CHECK (use_case IN ('personal_use', 'new_id_activation')),
    multiplier_pct  INTEGER NOT NULL,                 -- e.g. 100, 50
    PRIMARY KEY (source, use_case)
);

INSERT INTO usage_multipliers (source, use_case, multiplier_pct) VALUES
    ('referral_commission', 'personal_use', 100),
    ('referral_commission', 'new_id_activation', 50),
    ('subscription_package', 'personal_use', 100),
    ('subscription_package', 'new_id_activation', 100),
    ('purchased_topup', 'personal_use', 100),
    ('purchased_topup', 'new_id_activation', 100),
    ('free_trial', 'personal_use', 100),
    ('free_trial', 'new_id_activation', 100);
-- NOTE: purchased_topup and free_trial multipliers for new_id_activation are
-- assumed 100% by default (not explicitly discussed) -- confirm with domain owner
-- before relying on this in production. Flagged in ARCHITECTURE.md as an
-- unconfirmed assumption.

-- ============================================================
-- ORDERS & PAYMENTS (rail-agnostic, see ARCHITECTURE.md Section 6)
-- ============================================================

CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    purpose         TEXT NOT NULL
                        CHECK (purpose IN ('new_activation', 'renewal', 'topup')),
    amount_due      INTEGER NOT NULL,                 -- in paise, to avoid float rounding issues
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at         TEXT
);

-- An order can be funded by more than one payment row (split wallet + gateway
-- funding, per ARCHITECTURE.md Section 6). Sum of completed payments for an order
-- must equal amount_due before the order is marked 'paid'.
CREATE TABLE payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id),
    source          TEXT NOT NULL CHECK (source IN ('gateway', 'wallet')),
    amount          INTEGER NOT NULL,                 -- in paise
    -- gateway-specific fields, NULL when source = 'wallet':
    razorpay_payment_id TEXT,
    razorpay_order_id   TEXT,
    -- wallet-specific fields, NULL when source = 'gateway':
    wallet_transaction_id INTEGER REFERENCES wallet_transactions(id),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- REFERRAL SYSTEM (single-level only, see ARCHITECTURE.md Section 7)
-- ============================================================

CREATE TABLE referral_codes (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id),
    code        TEXT NOT NULL UNIQUE,     -- cryptographically random, NOT sequential -- see anti-abuse notes
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE referrals (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_user_id        INTEGER NOT NULL REFERENCES users(id),
    referred_user_id        INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        -- UNIQUE enforces: a referred user has exactly one referrer, first-touch,
        -- locked at signup -- prevents last-click attribution theft.
    referred_signup_at      TEXT NOT NULL DEFAULT (datetime('now')),
    first_paid_order_id     INTEGER REFERENCES orders(id),  -- the triggering purchase; commission fires on THIS, not on signup
    commission_amount       INTEGER,                         -- points granted, once triggered
    commission_status       TEXT NOT NULL DEFAULT 'pending'
                                CHECK (commission_status IN ('pending', 'held', 'active', 'clawed_back')),
    -- pending: no qualifying purchase yet
    -- held: purchase happened, commission granted into wallet_ledger but inside holding period
    -- active: holding period passed, spendable
    -- clawed_back: triggering payment was refunded/disputed within holding period
    CHECK (referrer_user_id != referred_user_id)
);

-- ============================================================
-- QUERY LOGS (feeds both the Universal KP Engine's output history and future
-- admin-panel analytics; also the substrate for the API-scraping rate-limit checks)
-- ============================================================

CREATE TABLE query_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    kundali_id      INTEGER REFERENCES kundalis(id),
    query_type      TEXT NOT NULL
                        CHECK (query_type IN ('general_lookup', 'kp_query_window', 'date_scanner')),
    activity_category TEXT,               -- foreign-key-in-spirit to HOUSE_ACTIVITY_MAPPING.md row, stored as text since that table is not yet in DB form
    resolved_houses TEXT,                 -- JSON array, e.g. "[6]" or "[5,7]"
    verdict         TEXT,                 -- for kp_query_window: 'promised' / 'denied'
    confidence_pct  INTEGER,              -- for kp_query_window
    muhurta_pct     INTEGER,              -- for general_lookup / date_scanner: the continuous score
    queried_at      TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged  INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- KP QUERY LOGS (distinct from general query_logs, for analytics)
-- ============================================================

CREATE TABLE kp_queries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    kundali_id      INTEGER NOT NULL REFERENCES kundalis(id),
    activity_code   TEXT NOT NULL,                   -- from HOUSE_ACTIVITY_MAPPING
    verdict         TEXT NOT NULL
                        CHECK (verdict IN ('promised', 'denied')),
    confidence_pct  INTEGER NOT NULL,
    queried_at      TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged  INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- RATE LIMITING (ephemeral, can also live in KV, but D1 provides durability)
-- ============================================================

CREATE TABLE rate_limits (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_key    TEXT NOT NULL UNIQUE,         -- "user:123:kp_query" or "ip:203.0.113.1:api"
    request_count   INTEGER NOT NULL DEFAULT 1,
    window_start    TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL
);

-- ============================================================
-- INDEXES (scaled for 1M users/year)
-- ============================================================

-- User lookups
CREATE INDEX idx_users_phone ON users(phone_number);

-- Kundali queries
CREATE INDEX idx_kundalis_user_id ON kundalis(user_id, created_at DESC);
CREATE INDEX idx_kundalis_lagna ON kundalis(lagna_rashi_idx) WHERE lagna_rashi_idx IS NOT NULL;

-- Wallet & points
CREATE INDEX idx_wallet_ledger_user_status ON wallet_ledger(user_id, status);
CREATE INDEX idx_wallet_ledger_expiry ON wallet_ledger(expires_at) WHERE status = 'active';
CREATE INDEX idx_wallet_ledger_user_active ON wallet_ledger(user_id) WHERE status = 'active';
CREATE INDEX idx_wallet_transactions_ledger ON wallet_transactions(wallet_ledger_id);
CREATE INDEX idx_wallet_transactions_reason ON wallet_transactions(reason);

-- Orders & payments
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- Query logs (analytics + rate limiting)
CREATE INDEX idx_query_logs_user_time ON query_logs(user_id, queried_at DESC);
CREATE INDEX idx_query_logs_kundali ON query_logs(kundali_id);
CREATE INDEX idx_query_logs_type ON query_logs(query_type, queried_at DESC);
CREATE INDEX idx_kp_queries_user_time ON kp_queries(user_id, queried_at DESC);
CREATE INDEX idx_kp_queries_kundali ON kp_queries(kundali_id);
CREATE INDEX idx_kp_queries_verdict ON kp_queries(verdict, queried_at DESC);

-- Referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(commission_status);

-- Device & security
CREATE INDEX idx_device_fingerprints_trial ON device_fingerprints(trial_used, blacklisted);
CREATE INDEX idx_user_devices_fingerprint ON user_devices(fingerprint_id);

-- Rate limiting
CREATE INDEX idx_rate_limits_expiry ON rate_limits(expires_at);
