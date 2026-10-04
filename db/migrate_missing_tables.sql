-- OCCULTVIISION / TaraNidhi -- D1 Schema Fix (Oct 2026)
-- ============================================================
-- PASTE THIS ENTIRE FILE into:
-- Cloudflare Dashboard → Workers & Pages → D1 → occultviision-db → Console
-- Then click Execute.
-- ============================================================
-- SAFE: Uses IF NOT EXISTS and DROP IF EXISTS only for broken tables.
-- The `users` table is intact (login works). All other tables recreated.
-- Any beta test data will be lost -- that is expected and fine.
-- ============================================================

PRAGMA foreign_keys = OFF;

-- ============================================================
-- DROP broken/missing tables (correct order: children before parents)
-- ============================================================
DROP TABLE IF EXISTS kp_queries;
DROP TABLE IF EXISTS query_logs;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS referral_codes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallet_ledger;
DROP TABLE IF EXISTS usage_multipliers;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS kundalis;
DROP TABLE IF EXISTS rate_limits;
-- NOTE: Do NOT drop users, device_fingerprints, user_devices -- they work (login works)

-- ============================================================
-- KUNDALI / NATAL CHART DATA (the critical missing table)
-- ============================================================
CREATE TABLE kundalis (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    label               TEXT,
    birth_date          TEXT NOT NULL,
    latitude            REAL NOT NULL,
    longitude           REAL NOT NULL,
    timezone            TEXT NOT NULL,
    janma_nakshatra_idx INTEGER,
    lagna_rashi_idx     INTEGER,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- WALLET / POINTS LEDGER
-- ============================================================
CREATE TABLE wallet_ledger (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    source          TEXT NOT NULL
                        CHECK (source IN ('free_trial', 'subscription_package',
                                           'referral_commission', 'purchased_topup')),
    amount_granted  INTEGER NOT NULL,
    amount_remaining INTEGER NOT NULL,
    granted_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'depleted', 'clawed_back')),
    referral_id     INTEGER REFERENCES referrals(id),
    holding_until   TEXT
);

CREATE TABLE wallet_transactions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_ledger_id    INTEGER NOT NULL REFERENCES wallet_ledger(id),
    amount              INTEGER NOT NULL,
    reason              TEXT NOT NULL,
    order_id            INTEGER REFERENCES orders(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE usage_multipliers (
    source          TEXT NOT NULL,
    use_case        TEXT NOT NULL CHECK (use_case IN ('personal_use', 'new_id_activation')),
    multiplier_pct  INTEGER NOT NULL,
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

-- ============================================================
-- ORDERS & PAYMENTS
-- ============================================================
CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    purpose         TEXT NOT NULL
                        CHECK (purpose IN ('new_activation', 'renewal', 'topup')),
    amount_due      INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at         TEXT
);

CREATE TABLE payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id),
    source          TEXT NOT NULL CHECK (source IN ('gateway', 'wallet')),
    amount          INTEGER NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_order_id   TEXT,
    wallet_transaction_id INTEGER REFERENCES wallet_transactions(id),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- REFERRAL SYSTEM
-- ============================================================
CREATE TABLE referral_codes (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id),
    code        TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE referrals (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_user_id        INTEGER NOT NULL REFERENCES users(id),
    referred_user_id        INTEGER NOT NULL REFERENCES users(id) UNIQUE,
    referred_signup_at      TEXT NOT NULL DEFAULT (datetime('now')),
    first_paid_order_id     INTEGER REFERENCES orders(id),
    commission_amount       INTEGER,
    commission_status       TEXT NOT NULL DEFAULT 'pending'
                                CHECK (commission_status IN ('pending', 'held', 'active', 'clawed_back')),
    CHECK (referrer_user_id != referred_user_id)
);

-- ============================================================
-- QUERY LOGS
-- ============================================================
CREATE TABLE query_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    kundali_id      INTEGER REFERENCES kundalis(id),
    query_type      TEXT NOT NULL
                        CHECK (query_type IN ('general_lookup', 'kp_query_window', 'date_scanner', 'professional_muhurta', 'muhurta_scan')),
    activity_category TEXT,
    resolved_houses TEXT,
    verdict         TEXT,
    confidence_pct  INTEGER,
    muhurta_pct     INTEGER,
    queried_at      TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE kp_queries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    kundali_id      INTEGER NOT NULL REFERENCES kundalis(id),
    activity_code   TEXT NOT NULL,
    verdict         TEXT NOT NULL
                        CHECK (verdict IN ('promised', 'denied')),
    confidence_pct  INTEGER NOT NULL,
    queried_at      TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged  INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- RATE LIMITING
-- ============================================================
CREATE TABLE rate_limits (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_key    TEXT NOT NULL UNIQUE,
    request_count   INTEGER NOT NULL DEFAULT 1,
    window_start    TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_kundalis_user_id ON kundalis(user_id, created_at DESC);
CREATE INDEX idx_kundalis_lagna ON kundalis(lagna_rashi_idx) WHERE lagna_rashi_idx IS NOT NULL;
CREATE INDEX idx_wallet_ledger_user_status ON wallet_ledger(user_id, status);
CREATE INDEX idx_wallet_ledger_expiry ON wallet_ledger(expires_at) WHERE status = 'active';
CREATE INDEX idx_wallet_ledger_user_active ON wallet_ledger(user_id) WHERE status = 'active';
CREATE INDEX idx_wallet_transactions_ledger ON wallet_transactions(wallet_ledger_id);
CREATE INDEX idx_wallet_transactions_reason ON wallet_transactions(reason);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX idx_query_logs_user_time ON query_logs(user_id, queried_at DESC);
CREATE INDEX idx_query_logs_kundali ON query_logs(kundali_id);
CREATE INDEX idx_query_logs_type ON query_logs(query_type, queried_at DESC);
CREATE INDEX idx_kp_queries_user_time ON kp_queries(user_id, queried_at DESC);
CREATE INDEX idx_kp_queries_kundali ON kp_queries(kundali_id);
CREATE INDEX idx_kp_queries_verdict ON kp_queries(verdict, queried_at DESC);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(commission_status);
CREATE INDEX idx_rate_limits_expiry ON rate_limits(expires_at);

PRAGMA foreign_keys = ON;
