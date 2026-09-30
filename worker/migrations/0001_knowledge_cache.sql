-- Migration: knowledge_cache table
-- Purpose: Store verified web-search results from curated Jyotish sources.
--          Cache prevents repeat API calls for same query.
--          trust_tier maps to verified source whitelist tiers (5=classical, 4=verified, 3=good).
--
-- Applied via: wrangler d1 execute occultviision-db --file=migrations/0001_knowledge_cache.sql

CREATE TABLE IF NOT EXISTS knowledge_cache (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  query_hash    TEXT    NOT NULL UNIQUE,  -- SHA-256(normalized_query), hex string
  query_text    TEXT    NOT NULL,         -- original query as submitted
  answer_text   TEXT    NOT NULL,         -- synthesized answer from sources
  sources_json  TEXT    NOT NULL,         -- JSON: [{url, title, excerpt, domain, tier}]
  trust_tier    INTEGER NOT NULL,         -- 5=classical text, 4=verified, 3=good
  use_count     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_knowledge_hash ON knowledge_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_knowledge_tier  ON knowledge_cache(trust_tier);
