-- Migration: saved_muhurtas table for storing user-saved muhurta calculations
-- Purpose: Users can save muhurta query results for later reference, comparison, and sharing
--          Stores both the query parameters and the computed muhurta results
--          Auspiciousness_score (0-100) allows ranking and filtering by quality
--
-- Applied via: wrangler d1 execute occultviision-db --file=migrations/0007_saved_muhurtas.sql

CREATE TABLE IF NOT EXISTS saved_muhurtas (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL,

  -- Query Parameters (what the user was looking for)
  query_params          TEXT NOT NULL,  -- JSON: {purpose, start_date, end_date, preferences, location}

  -- Calculated Results (what was found)
  result_data           TEXT NOT NULL,  -- JSON: {muhurtas[], scores, rejected_times, notes}

  -- Quality Score
  auspiciousness_score  INTEGER,        -- 0-100 scale (based on Tarabala, yoga, tithi quality)

  -- Timestamps
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_saved_muhurtas_user_id    ON saved_muhurtas(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_muhurtas_created    ON saved_muhurtas(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_muhurtas_score      ON saved_muhurtas(auspiciousness_score);
CREATE INDEX IF NOT EXISTS idx_saved_muhurtas_user_score ON saved_muhurtas(user_id, auspiciousness_score);
