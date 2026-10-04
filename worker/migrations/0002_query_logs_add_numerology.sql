-- Migration 0002: Add 'numerology' to query_logs.query_type CHECK constraint.
--
-- SQLite cannot ALTER a CHECK constraint in place. Standard workaround:
-- 1. Rename the existing table (preserving all data + indexes on old name)
-- 2. Re-create query_logs with the expanded CHECK list
-- 3. Copy all rows from the backup
-- 4. Drop indexes on the backup name (they were created for the old table)
-- 5. Drop the backup table
--
-- The expanded CHECK now allows:
--   general_lookup | kp_query_window | date_scanner |
--   professional_muhurta | muhurta_scan | numerology
--
-- PRAGMA foreign_keys is kept OFF during the swap (SQLite default in D1).

-- Step 1: Rename existing table to backup
ALTER TABLE query_logs RENAME TO query_logs_bak;

-- Step 2: Re-create with updated CHECK constraint
CREATE TABLE query_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    kundali_id      INTEGER REFERENCES kundalis(id),
    query_type      TEXT NOT NULL
                        CHECK (query_type IN (
                            'general_lookup',
                            'kp_query_window',
                            'date_scanner',
                            'professional_muhurta',
                            'muhurta_scan',
                            'numerology'
                        )),
    activity_category TEXT,
    resolved_houses TEXT,
    verdict         TEXT,
    confidence_pct  INTEGER,
    muhurta_pct     INTEGER,
    queried_at      TEXT NOT NULL DEFAULT (datetime('now')),
    points_charged  INTEGER NOT NULL DEFAULT 1
);

-- Step 3: Copy existing rows
INSERT INTO query_logs
    (id, user_id, kundali_id, query_type, activity_category, resolved_houses,
     verdict, confidence_pct, muhurta_pct, queried_at, points_charged)
SELECT
    id, user_id, kundali_id, query_type, activity_category, resolved_houses,
    verdict, confidence_pct, muhurta_pct, queried_at, points_charged
FROM query_logs_bak;

-- Step 4: Recreate indexes on new table
CREATE INDEX IF NOT EXISTS idx_query_logs_user_time ON query_logs(user_id, queried_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_logs_kundali   ON query_logs(kundali_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_type      ON query_logs(query_type, queried_at DESC);

-- Step 5: Drop backup
DROP TABLE query_logs_bak;
