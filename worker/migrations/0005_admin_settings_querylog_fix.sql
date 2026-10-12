-- Migration 0005: schema drift fixes found against the live D1 (2026-10-12)
--
-- Live D1 was missing columns/values the deployed-next code depends on:
--   * users.is_admin          -> every /admin/* route checks it
--   * users.tier_upgraded_at  -> written by /admin/users/:id/upgrade-tier
--   * query_logs CHECK lacked 'numerology' and 'kp_query_natural', so those
--     inserts were rejected (silently -- callers wrap logging in try/catch)
-- Adds app_settings (key/value, editable from the admin panel) so business
-- values such as the WhatsApp number are not hardcoded in the frontend.
--
-- SUPERSEDES 0002 (its CHECK list is a subset of the one below). On a fresh
-- database apply 0001, 0003, 0004, 0005 and skip 0002.
--
-- NOT idempotent: ALTER TABLE ADD COLUMN fails if the column exists. Apply once.
-- Backup of query_logs taken before applying: db/backups/query_logs_2026-10-12_pre-0002.json

ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN tier_upgraded_at TEXT;

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_by  INTEGER,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Click-to-chat number, international format without "+" (wa.me format).
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('whatsapp_number', '919669756111');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('contact_phone', '919669756111');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('contact_email', 'info@occultviision.com');

-- query_logs: rebuild with the full query_type list.
ALTER TABLE query_logs RENAME TO query_logs_bak;

CREATE TABLE query_logs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL REFERENCES users(id),
    kundali_id        INTEGER REFERENCES kundalis(id),
    query_type        TEXT NOT NULL
                        CHECK (query_type IN (
                            'general_lookup',
                            'kp_query_window',
                            'kp_query_natural',
                            'date_scanner',
                            'professional_muhurta',
                            'muhurta_scan',
                            'numerology'
                        )),
    activity_category TEXT,
    resolved_houses   TEXT,
    verdict           TEXT,
    confidence_pct    INTEGER,
    muhurta_pct       INTEGER,
    queried_at        TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged    INTEGER NOT NULL DEFAULT 1
);

INSERT INTO query_logs
    (id, user_id, kundali_id, query_type, activity_category, resolved_houses,
     verdict, confidence_pct, muhurta_pct, queried_at, points_charged)
SELECT
    id, user_id, kundali_id, query_type, activity_category, resolved_houses,
    verdict, confidence_pct, muhurta_pct, queried_at, points_charged
FROM query_logs_bak;

DROP TABLE query_logs_bak;

CREATE INDEX IF NOT EXISTS idx_query_logs_user_time ON query_logs(user_id, queried_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_logs_kundali   ON query_logs(kundali_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_type      ON query_logs(query_type, queried_at DESC);
