-- BASE SCHEMA: users, devices, sessions (MUST RUN FIRST - migration 0000)
-- These tables form the foundation for all other tables.

-- Users table: core authentication
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number    TEXT    NOT NULL UNIQUE,  -- +91XXXXXXXXXX (E.164)
  tier            TEXT    NOT NULL DEFAULT 'free',  -- free, premium, hospital
  trial_used      INTEGER NOT NULL DEFAULT 0,  -- boolean: has user claimed free trial?
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Devices table: device fingerprints for device-level trial tracking
CREATE TABLE IF NOT EXISTS devices (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  fingerprint_hash TEXT   NOT NULL UNIQUE,  -- SHA-256(browser UA + screen + tz + ...)
  claimed_trial   INTEGER NOT NULL DEFAULT 0,  -- boolean: has this device claimed trial?
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table: JWT session tokens for auth
CREATE TABLE IF NOT EXISTS sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  token           TEXT    NOT NULL UNIQUE,  -- JWT bearer token
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at      TEXT    NOT NULL,  -- ISO datetime when token expires
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Kundalis table: birth charts (with foreign key to users)
CREATE TABLE IF NOT EXISTS kundalis (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  name            TEXT    NOT NULL,
  birth_date      TEXT    NOT NULL,  -- ISO datetime (UTC)
  latitude        REAL    NOT NULL,
  longitude       REAL    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for lookups
CREATE INDEX IF NOT EXISTS idx_users_phone      ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_devices_user     ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_print    ON devices(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_kundalis_user    ON kundalis(user_id);
