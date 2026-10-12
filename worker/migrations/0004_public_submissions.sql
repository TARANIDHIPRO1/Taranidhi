-- Migration 0004: public website submissions (Task 78)
-- Created: 2026-10-12
--
-- contact_messages : enquiries from the website contact form.
-- testimonials     : client feedback submitted on the website. Nothing is
--                    shown publicly until an admin approves it AND the
--                    submitter ticked the publish-consent box.
--
-- Additive only (CREATE ... IF NOT EXISTS). Safe to run more than once.

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,              -- 10-digit Indian mobile, no +91
  topic       TEXT    NOT NULL DEFAULT 'other',
  message     TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_status_created
  ON contact_messages (status, created_at DESC);

CREATE TABLE IF NOT EXISTS testimonials (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,         -- display name as submitted
  city             TEXT    NOT NULL DEFAULT '',
  service          TEXT    NOT NULL DEFAULT 'other',
  rating           INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  quote            TEXT    NOT NULL,
  phone            TEXT    NOT NULL,         -- private: for verification only, never returned publicly
  consent_publish  INTEGER NOT NULL CHECK (consent_publish = 1),
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by      INTEGER,
  reviewed_at      TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status_created
  ON testimonials (status, created_at DESC);
