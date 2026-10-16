-- Migration: events table for user activity tracking
-- Purpose: Track all user interactions with the app (queries, births charts, muhurta requests, payments)
--          Enables audit logging, analytics, and user activity history reconstruction.
--          Event types: 'birth_chart', 'muhurta_query', 'payment', 'export', 'admin_action'
--
-- Applied via: wrangler d1 execute occultviision-db --file=migrations/0006_events_table.sql

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  event_type    VARCHAR(50) NOT NULL,  -- 'birth_chart', 'muhurta_query', 'payment', 'export', 'admin_action'
  muhurta_id    INTEGER,               -- Reference to muhurta (if applicable), nullable
  event_date    TEXT NOT NULL,         -- ISO 8601 timestamp (UTC)
  event_data    TEXT NOT NULL DEFAULT '{}',  -- JSON payload: query params, results, metadata
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_user_id    ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type       ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date       ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_user_type  ON events(user_id, event_type);
