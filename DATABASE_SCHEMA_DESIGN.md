# OCCULTVIISION KAALCHAKRA PRO — DATABASE SCHEMA DESIGN
## v1.0 (SQL-agnostic, PostgreSQL/MySQL compatible)
**Status:** Final (Sep 29, 2026)  
**Owner:** Claude  
**Engine:** PostgreSQL 14+ recommended (JSONB support for flexible birth chart storage)  
**Tables:** 7 core + 3 junction tables

---

## DESIGN PRINCIPLES

1. **Immutable Birth Charts:** Once stored, a user's birth chart never changes (audit trail for legal B2B)
2. **Event Categories Locked:** 9 categories × 400-475 events (loaded via admin endpoint)
3. **Doshas as Lookup Table:** 21 doshas with detection rules + penalty weights (read-heavy, write-rarely)
4. **Muhurta Slots Ephemeral:** Not stored; computed on-demand (reduces storage, ensures freshness)
5. **Timezone Agnostic:** All dates/times stored in UTC; frontend converts for display
6. **Float Precision:** Degrees stored as DECIMAL(10,7) for ±0.0001° accuracy

---

## TABLE 1: `users` (User Accounts)

**Purpose:** Store user profile + birth chart (for muhurta personalization)  
**Rows:** 1K-10K initially; 100K+ by 2028  

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,        -- "user_001" | email | UUID
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),                           -- "+91-XXXXXXXXXX" (optional)
  
  -- Birth Chart (One-time entry)
  birth_date DATE NOT NULL,                    -- "1973-04-08"
  birth_time TIME(3) NOT NULL,                 -- "11:45:30.000" (UTC, converted from IST)
  birth_latitude DECIMAL(9,6) NOT NULL,       -- 23.250500
  birth_longitude DECIMAL(10,6) NOT NULL,     -- 77.406500
  birth_timezone VARCHAR(50) DEFAULT 'UTC+5:30',  -- "Asia/Kolkata"
  birth_location_name VARCHAR(255),             -- "Bhopal"
  
  -- Preferences
  ayanamsha VARCHAR(20) DEFAULT 'lahiri',      -- "lahiri" | "kkp_new"
  house_system VARCHAR(20) DEFAULT 'placidus', -- "placidus" | "porphyry"
  display_timezone VARCHAR(50) DEFAULT 'UTC+5:30',
  language VARCHAR(10) DEFAULT 'en',           -- "en" | "hi" (v6.1)
  
  -- Subscription
  tier VARCHAR(20) DEFAULT 'free',             -- "free" | "premium" | "enterprise" (v6.1)
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_tier (tier)
);
```

**Sample Row:**
```
id: 1
user_id: "user_001"
email: "naveen@occultviision.com"
birth_date: "1973-04-08"
birth_time: "06:15:30"  (11:45 IST = 06:15 UTC)
birth_latitude: 23.250500
birth_longitude: 77.406500
ayanamsha: "lahiri"
tier: "premium"
```

---

## TABLE 2: `events` (400 Life Events + Significations)

**Purpose:** Master catalog of all events (property, marriage, business, etc.)  
**Rows:** 400-475 (loaded once via admin endpoint)  
**Usage:** Read-heavy; write rarely (only during v6.1+ event library updates)

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(100) UNIQUE NOT NULL,      -- "PROPERTY_DEED_001"
  event_name VARCHAR(255) NOT NULL,           -- "Property Deed Registration"
  category VARCHAR(50) NOT NULL,              -- "Property" | "Marriage" | "Business" | ...
  sub_category VARCHAR(100),                  -- "Deed Registration" (optional)
  
  -- Signification (Bhavas & Karakas)
  primary_bhavas VARCHAR(50),                 -- "2,4,7,8" (comma-separated)
  karakas VARCHAR(100),                       -- "Venus,Mercury,Saturn"
  timing_lord VARCHAR(30),                    -- "Jupiter" (major dasha preference)
  timing_sub_lord VARCHAR(30),                -- (antar dasha preference)
  
  -- Muhurta Requirements
  favorable_tithi TEXT,                       -- JSON: ["Shukla Paksha", ...]
  favorable_vara TEXT,                        -- JSON: ["Wednesday", "Friday"]
  favorable_nakshatra TEXT,                   -- JSON: ["Rohini", "Hasta"]
  unfavorable_yoga TEXT,                      -- JSON: ["Parivraya"]
  
  -- KP-Specific Requirements
  csl_house_requirement VARCHAR(100),         -- "1,2,4,10,11" (avoid 6,8,12)
  csl_sub_lord_preference VARCHAR(100),       -- "Benefic" | specific planets
  
  -- Dosha Avoidance
  critical_doshas_to_avoid TEXT,              -- JSON: ["Panchaka", "Mrityu Bana"]
  major_doshas_to_avoid TEXT,                 -- JSON: ["Chandra Ashtam"]
  
  -- MPI Thresholds (guidance for backend)
  minimum_mpi_score INT DEFAULT 60,           -- Minimum acceptable MPI
  ideal_mpi_score INT DEFAULT 75,             -- Recommended target
  exceptional_mpi_score INT DEFAULT 85,      -- Excellent threshold
  
  -- Long-form explanation
  description TEXT,
  notes TEXT,
  
  -- Reference Case (Optional)
  reference_case_date DATE,
  reference_case_time TIME(3),
  reference_case_mpi INT,
  reference_case_outcome VARCHAR(20),        -- "Success" | "Partial" | "Failure"
  reference_case_notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_event_id (event_id),
  FULLTEXT INDEX idx_search (event_name, description)
);
```

**Sample Row:**
```
id: 1
event_id: "PROPERTY_DEED_001"
event_name: "Property Deed Registration"
category: "Property"
primary_bhavas: "2,4,7,8"
karakas: "Venus,Mercury,Saturn"
favorable_vara: ["Wednesday", "Friday"]
csl_house_requirement: "1,2,4,10,11"
minimum_mpi_score: 60
ideal_mpi_score: 75
critical_doshas_to_avoid: ["Panchaka", "Mrityu Bana"]
```

---

## TABLE 3: `doshas` (21 Dosha Definitions + Detection Rules)

**Purpose:** Store dosha metadata + penalty weights (read-heavy, write-rarely)  
**Rows:** 21 (static; loaded once)

```sql
CREATE TABLE doshas (
  id SERIAL PRIMARY KEY,
  dosha_id VARCHAR(50) UNIQUE NOT NULL,       -- "panchaka" | "ganda_moola" | ...
  dosha_name VARCHAR(100) NOT NULL,           -- "Panchaka" | "Ganda Moola"
  
  -- Classification
  tier VARCHAR(20) NOT NULL,                  -- "critical" | "major" | "minor"
  
  -- Definition & Logic
  definition TEXT NOT NULL,                   -- Classical Jyotish definition
  detection_rule TEXT NOT NULL,               -- Pseudocode for detection (e.g., "When Moon in Krittika")
  
  -- Penalty & Veto
  penalty_weight DECIMAL(3,2) NOT NULL,      -- 0-1.0 (weight in MPI calculation)
  hard_gate BOOLEAN DEFAULT FALSE,            -- true = auto-reject (don't just penalize)
  
  -- Mitigation
  mitigation_possible BOOLEAN,                -- Can this dosha be overcome?
  mitigation_methods TEXT,                    -- JSON: ["Jupiter association", "CSL purity"]
  
  -- Classical Reference
  source VARCHAR(100),                        -- "Lagadha" | "Varahamihira" | "KP"
  citation TEXT,                              -- Book/chapter/shloka reference
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tier (tier),
  INDEX idx_dosha_id (dosha_id)
);
```

**Sample Rows:**
```
1. dosha_id: "panchaka"
   dosha_name: "Panchaka"
   tier: "critical"
   penalty_weight: 0.20
   hard_gate: true  (auto-reject)
   detection_rule: "Moon in Krittikas, Rohini, Mrigashira, Jyeshtha, Revati"

2. dosha_id: "ganda_moola"
   dosha_name: "Ganda Moola"
   tier: "critical"
   penalty_weight: 0.15
   hard_gate: true
   
3. dosha_id: "chandra_ashtam"
   dosha_name: "Chandra Ashtam"
   tier: "major"
   penalty_weight: 0.10
   hard_gate: false
```

---

## TABLE 4: `event_dosha_rules` (Junction: Events ↔ Doshas)

**Purpose:** Map which doshas apply to which events (e.g., Panchaka is critical for Property Deed)  
**Rows:** ~100-150 (most events avoid 5-10 doshas)

```sql
CREATE TABLE event_dosha_rules (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL,                      -- FK → events.id
  dosha_id INT NOT NULL,                      -- FK → doshas.id
  
  is_critical_for_event BOOLEAN DEFAULT FALSE, -- true = hard veto for this event
  custom_penalty_weight DECIMAL(3,2),         -- Override dosha's default weight for this event
  
  notes TEXT,                                  -- Event-specific guidance
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (dosha_id) REFERENCES doshas(id) ON DELETE CASCADE,
  UNIQUE KEY (event_id, dosha_id),
  INDEX idx_event_id (event_id),
  INDEX idx_dosha_id (dosha_id)
);
```

**Sample Rows:**
```
event_id: 1 (Property Deed)  →  dosha_id: 1 (Panchaka)
  is_critical_for_event: true (hard veto for property)
  
event_id: 1 (Property Deed)  →  dosha_id: 2 (Ganda Moola)
  is_critical_for_event: true
```

---

## TABLE 5: `user_preferences` (User Settings, Derived)

**Purpose:** Store user's personalized settings (can be inlined into `users`, but separated for clarity)  
**Rows:** 1 per user  

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,                -- FK → users.id
  
  -- Calculation Preferences
  ayanamsha VARCHAR(20) DEFAULT 'lahiri',
  house_system VARCHAR(20) DEFAULT 'placidus',
  
  -- Muhurta Preferences
  doshas_tier VARCHAR(20) DEFAULT 'critical', -- "critical" = 3 only; "full" = 21
  include_tara BOOLEAN DEFAULT TRUE,
  include_uphora BOOLEAN DEFAULT TRUE,
  include_ashtakavarga BOOLEAN DEFAULT TRUE,
  
  mpi_threshold INT DEFAULT 60,               -- Min acceptable MPI score
  
  -- UI Preferences
  display_timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

---

## TABLE 6: `muhurta_queries` (Activity Log; Optional, for Analytics)

**Purpose:** Track user's muhurta queries (for analytics + debugging)  
**Rows:** ~10K/day (high-volume log)  
**Retention:** 30-90 days (archivable)

```sql
CREATE TABLE muhurta_queries (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL,                       -- FK → users.id
  event_id INT,                               -- FK → events.id (nullable if free-text)
  event_type VARCHAR(100),                    -- Event name (if not matched to DB)
  
  query_date_start DATE NOT NULL,
  query_date_end DATE NOT NULL,
  query_duration_hours INT,
  
  -- Request Parameters
  doshas_tier VARCHAR(20),                    -- What was queried
  include_tara BOOLEAN,
  include_uphora BOOLEAN,
  
  -- Results Summary
  golden_slots_found INT,
  best_mpi_score INT,
  
  -- Audit
  query_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INT,                       -- Backend latency (for perf monitoring)
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  INDEX idx_user_id (user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_query_timestamp (query_timestamp)
);
```

---

## TABLE 7: `admin_logs` (Admin Actions; for Audit Trail)

**Purpose:** Log all admin operations (event bulk loads, dosha updates, user tier changes)  
**Rows:** ~100/month initially

```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INT,                          -- FK → users.id (if admin is a user)
  action VARCHAR(100) NOT NULL,               -- "events_bulk_load" | "dosha_update" | "user_tier_change"
  
  table_affected VARCHAR(50),                 -- "events" | "doshas" | "users"
  rows_affected INT,
  
  details JSON,                               -- Raw request/response for reconstruction
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## INDEXES (Performance Optimization)

| Table | Index | Columns | Type | Use Case |
|-------|-------|---------|------|----------|
| users | idx_user_id | user_id | UNIQUE | Fast user lookup |
| users | idx_email | email | UNIQUE | Login by email |
| users | idx_tier | tier | | Filter free vs premium |
| events | idx_category | category | | Filter by event type |
| events | idx_event_id | event_id | UNIQUE | Quick event lookup |
| events | idx_search | event_name, description | FULLTEXT | Search by keyword |
| doshas | idx_tier | tier | | Filter by severity |
| doshas | idx_dosha_id | dosha_id | UNIQUE | Quick dosha lookup |
| muhurta_queries | idx_user_id | user_id | | User activity log |
| muhurta_queries | idx_query_timestamp | query_timestamp | | Time-based analytics |

---

## ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ user_id     │
│ email       │
│ birth_*     │──┐
└─────────────┘  │
       │         │
       │   ┌─────┴──────────────────────┐
       │   │                            │
┌──────┴───┴──────┐         ┌───────────┴──────┐
│ muhurta_queries │         │ user_preferences │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ user_id (FK)    │         │ user_id (FK)     │
│ event_id (FK)   │         │ ayanamsha        │
│ query_*         │         │ doshas_tier      │
└─────────────────┘         └──────────────────┘
       │
       └─────────────┐
                     │
            ┌────────┴─────────┐
            │                  │
       ┌────┴─────┐      ┌─────┴───────┐
       │  events  │      │    doshas   │
       ├──────────┤      ├─────────────┤
       │ id (PK)  │      │ id (PK)     │
       │ event_id │      │ dosha_id    │
       │ category │      │ tier        │
       │ karakas  │      │ penalty_w.. │
       └────┬─────┘      └─────┬───────┘
            │                  │
            └──────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
   ┌──────┴──────────┐  ┌───────┴──────────┐
   │ event_dosha_*   │  │ admin_logs       │
   ├─────────────────┤  ├──────────────────┤
   │ id (PK)         │  │ id (PK)          │
   │ event_id (FK)   │  │ admin_user_id    │
   │ dosha_id (FK)   │  │ action           │
   │ is_critical_*   │  │ details (JSON)   │
   └─────────────────┘  └──────────────────┘
```

---

## DATA LOADING STRATEGY

### Phase 1: Manual (Sep 29)
```sql
-- Load 21 doshas (from research files)
INSERT INTO doshas (dosha_id, dosha_name, tier, detection_rule, penalty_weight, hard_gate)
VALUES
  ('panchaka', 'Panchaka', 'critical', 'Moon in Krittika/Rohini/Mrigashira/Jyeshtha/Revati', 0.20, true),
  ('ganda_moola', 'Ganda Moola', 'critical', 'Moon in Ashwini/Magha/Jyeshtha', 0.15, true),
  ... (18 more)
;
```

### Phase 2: Bulk Load (Oct 1, Week 1)
```sql
-- Load 400 events (via admin endpoint)
INSERT INTO events (event_id, event_name, category, signification, muhurta_requirements)
SELECT * FROM staged_events_v1;
```

### Phase 3: Junction Tables (Oct 1, Week 1)
```sql
-- Map events ↔ doshas
INSERT INTO event_dosha_rules (event_id, dosha_id, is_critical_for_event)
SELECT e.id, d.id, CASE WHEN e.critical_doshas LIKE CONCAT('%', d.dosha_id, '%') THEN true ELSE false END
FROM events e CROSS JOIN doshas d;
```

---

## QUERY PATTERNS (Optimized for Backend API)

### Query 1: Get User's Birth Chart
```sql
SELECT id, email, birth_date, birth_time, birth_latitude, birth_longitude, 
       ayanamsha, house_system
FROM users
WHERE user_id = ?;
```
**Index:** idx_user_id → **Latency:** <1ms

---

### Query 2: Search Events by Category
```sql
SELECT event_id, event_name, category, karakas, favorable_nakshatra, 
       minimum_mpi_score
FROM events
WHERE category = ? AND (sub_category = ? OR ? IS NULL)
LIMIT ? OFFSET ?;
```
**Index:** idx_category → **Latency:** 10-50ms

---

### Query 3: Get Dosha Details (for `/api/v1/doshas/:id`)
```sql
SELECT dosha_id, dosha_name, tier, definition, penalty_weight, hard_gate, 
       mitigation_methods
FROM doshas
WHERE dosha_id = ?;
```
**Index:** idx_dosha_id → **Latency:** <5ms

---

### Query 4: Event Dosha Rules (for muhurta stage 2)
```sql
SELECT d.dosha_id, d.dosha_name, d.penalty_weight, edr.is_critical_for_event
FROM event_dosha_rules edr
JOIN doshas d ON edr.dosha_id = d.id
WHERE edr.event_id = (SELECT id FROM events WHERE event_id = ?);
```
**Index:** idx_event_id → **Latency:** 5-20ms

---

### Query 5: User Preferences (for muhurta personalization)
```sql
SELECT doshas_tier, include_tara, include_uphora, mpi_threshold
FROM user_preferences
WHERE user_id = ?;
```
**Index:** idx_user_id → **Latency:** <2ms

---

## MIGRATION STRATEGY

### Week 0 (Sep 29):
- [ ] Create all 7 tables + indexes
- [ ] Load 21 doshas
- [ ] Create test user (Naveen)

### Week 1 (Oct 1):
- [ ] Load 400 events
- [ ] Build event_dosha_rules junction table
- [ ] Test searches

### Week 2-4:
- [ ] Monitor query performance
- [ ] Archive old muhurta_queries (daily batch)
- [ ] Add table sharding if needed (horizontal scaling post-v6)

---

## SCALING NOTES (Post-v6)

1. **Users Table:** Add sharding by `user_id % 4` (columns: `shard_id`)
2. **Events Table:** Read-only after v6 MVP; use Redis caching layer
3. **Muhurta Queries:** Archive to separate database (time-series DB) after 90 days
4. **Doshas Table:** Cache in-memory (21 rows = <10KB)

---

## BACKUP & DISASTER RECOVERY

- **Frequency:** Daily snapshots (events table weekly only, since it's mostly static)
- **Retention:** 30 days
- **RTO:** <4 hours (restore from snapshot)
- **RPO:** <1 hour (transaction logs)

---

## Database Selection Rationale

### PostgreSQL (Recommended)
- ✅ JSONB support (flexible event signification storage)
- ✅ Full-text search (event name + description)
- ✅ ACID transactions (critical for audit trail)
- ✅ Generous free tier (AWS RDS, DigitalOcean)

### Alternative: MySQL
- ✅ Simpler setup, faster for reads
- ❌ Weaker JSON support (no native JSONB)
- ✅ Works, but less ideal

### Not Recommended: SQLite
- ❌ Single-user locking (concurrent muhurta queries will bottleneck)
- ❌ No JSON support (would need TEXT + parsing)
- ✅ Fine for Phase 0 prototyping, not for v6 MVP

---

**Decision (Pending Questionnaire #2):** Database choice (PostgreSQL vs MySQL) confirmed by backend infrastructure section.

