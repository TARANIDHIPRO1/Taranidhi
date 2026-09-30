/**
 * knowledgeSearch.ts — Verified Jyotish Knowledge Search + Cache Engine
 *
 * Architecture:
 *   1. Incoming query → SHA-256 hash → D1 cache lookup
 *   2. Cache HIT  → serve immediately (0 API cost, <10ms)
 *   3. Cache MISS → Brave Search API (domain-restricted to verified sources)
 *   4. Parse results → synthesize answer → save to D1 → serve
 *
 * Source whitelist tiers:
 *   5 ⭐⭐⭐⭐⭐ Classical texts  — sacred-texts.com, wisdomlib.org
 *   4 ⭐⭐⭐⭐   Verified Jyotish — vedicastrologer.org, saptarishisastrology.com
 *   3 ⭐⭐⭐     Good Jyotish     — astrojyoti.com, astrovidya.com, jyotishvidya.com
 *
 * BRAVE_SEARCH_API_KEY env var required. If not set → returns graceful fallback.
 * Free tier: 2,000 queries/month. Rate: 1 req/s.
 */

// ── Verified Source Whitelist ────────────────────────────────────────────────

interface VerifiedSource {
  domain: string;
  tier: number;
  label: string;
}

const VERIFIED_SOURCES: VerifiedSource[] = [
  // Tier 5 — Classical texts (BPHS, Saravali, Phaladeepika)
  { domain: "sacred-texts.com",          tier: 5, label: "Sacred Texts (Classical)" },
  { domain: "wisdomlib.org",              tier: 5, label: "Wisdom Library (Classical)" },

  // Tier 4 — Verified KP + Parashari research
  { domain: "vedicastrologer.org",        tier: 4, label: "Vedic Astrologer (KP)" },
  { domain: "saptarishisastrology.com",   tier: 4, label: "Saptarishi Research Journal" },
  { domain: "hindupedia.com",             tier: 4, label: "Hindupedia (Shastra)" },

  // Tier 3 — Good Jyotish content
  { domain: "astrojyoti.com",             tier: 3, label: "AstroJyoti" },
  { domain: "astrovidya.com",             tier: 3, label: "AstroVidya" },
  { domain: "jyotishvidya.com",           tier: 3, label: "Jyotish Vidya" },
  { domain: "vaastu.com",                 tier: 3, label: "Vaastu (for Vastu queries)" },
];

/** Build Brave Search 'goggles' site filter — restricts to whitelist only */
function buildSiteFilter(): string {
  return VERIFIED_SOURCES.map(s => `site:${s.domain}`).join(" OR ");
}

/** Get trust tier for a URL's domain */
function getTierForUrl(url: string): number {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const source = VERIFIED_SOURCES.find(s => domain.includes(s.domain));
    return source?.tier ?? 3;
  } catch {
    return 3;
  }
}

/** Get label for a URL's domain */
function getLabelForUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const source = VERIFIED_SOURCES.find(s => domain.includes(s.domain));
    return source?.label ?? domain;
  } catch {
    return url;
  }
}

// ── SHA-256 Hash (Web Crypto API — available in CF Workers) ─────────────────

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Normalize query: lowercase, collapse whitespace, trim */
function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeSource {
  url:     string;
  title:   string;
  excerpt: string;
  domain:  string;
  tier:    number;
  label:   string;
}

export interface KnowledgeAnswer {
  query_hash:  string;
  query_text:  string;
  answer_text: string;
  sources:     KnowledgeSource[];
  trust_tier:  number;   // max tier across sources
  from_cache:  boolean;
  searched_at: string;   // ISO timestamp
}

interface BraveSearchResult {
  title:       string;
  url:         string;
  description: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
  };
}

// ── D1 Cache ─────────────────────────────────────────────────────────────────

interface CacheRow {
  query_hash:   string;
  query_text:   string;
  answer_text:  string;
  sources_json: string;
  trust_tier:   number;
}

export async function cacheGet(
  queryHash: string,
  db: D1Database
): Promise<KnowledgeAnswer | null> {
  const row = await db
    .prepare(`SELECT * FROM knowledge_cache WHERE query_hash = ?`)
    .bind(queryHash)
    .first<CacheRow>();

  if (!row) return null;

  // Increment use_count (fire-and-forget)
  db.prepare(`UPDATE knowledge_cache SET use_count = use_count + 1 WHERE query_hash = ?`)
    .bind(queryHash)
    .run()
    .catch(() => {/* non-critical */});

  return {
    query_hash:  row.query_hash,
    query_text:  row.query_text,
    answer_text: row.answer_text,
    sources:     JSON.parse(row.sources_json) as KnowledgeSource[],
    trust_tier:  row.trust_tier,
    from_cache:  true,
    searched_at: new Date().toISOString(),
  };
}

export async function cachePut(
  queryHash: string,
  queryText: string,
  answerText: string,
  sources: KnowledgeSource[],
  trustTier: number,
  db: D1Database
): Promise<void> {
  await db
    .prepare(`
      INSERT OR REPLACE INTO knowledge_cache
        (query_hash, query_text, answer_text, sources_json, trust_tier)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(queryHash, queryText, answerText, JSON.stringify(sources), trustTier)
    .run();
}

// ── Brave Search API ─────────────────────────────────────────────────────────

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";
const MAX_RESULTS   = 5;   // per query — enough for good synthesis
const MAX_EXCERPT   = 400; // chars — keep answer concise

async function fetchBraveResults(
  query: string,
  apiKey: string
): Promise<BraveSearchResult[]> {
  const siteFilter = buildSiteFilter();
  const fullQuery  = `${siteFilter} ${query}`;

  const params = new URLSearchParams({
    q:     fullQuery,
    count: String(MAX_RESULTS),
    search_lang: "en",
    country: "IN",
    safesearch: "off",
    text_decorations: "false",
    spellcheck: "false",
  });

  const res = await fetch(`${BRAVE_API_URL}?${params}`, {
    headers: {
      "Accept":               "application/json",
      "Accept-Encoding":      "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Brave API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as BraveSearchResponse;
  return data.web?.results ?? [];
}

/** Synthesize a clean answer from multiple source excerpts */
function synthesizeAnswer(
  query: string,
  results: BraveSearchResult[]
): string {
  if (results.length === 0) {
    return `No verified Jyotish source found for: "${query}". Try rephrasing or consult a classical text directly.`;
  }

  // Lead with top result, add additional perspectives
  const parts: string[] = [];
  for (const r of results) {
    const excerpt = r.description?.slice(0, MAX_EXCERPT) ?? "";
    if (excerpt.length > 20) {
      parts.push(`${excerpt}`);
    }
  }

  return parts.length > 0
    ? parts.join("\n\n---\n\n")
    : `Found ${results.length} result(s) but excerpts were too short. Visit the source URLs directly.`;
}

// ── Main Entry Point ─────────────────────────────────────────────────────────

export interface KnowledgeSearchEnv {
  DB: D1Database;
  BRAVE_SEARCH_API_KEY?: string;
}

export async function knowledgeSearch(
  rawQuery: string,
  env: KnowledgeSearchEnv
): Promise<KnowledgeAnswer> {
  const normalized = normalizeQuery(rawQuery);
  const queryHash  = await sha256Hex(normalized);

  // 1. Cache check
  const cached = await cacheGet(queryHash, env.DB);
  if (cached) return cached;

  // 2. API key check
  if (!env.BRAVE_SEARCH_API_KEY) {
    return {
      query_hash:  queryHash,
      query_text:  rawQuery,
      answer_text: "Web search is not configured yet. BRAVE_SEARCH_API_KEY is missing. Contact administrator.",
      sources:     [],
      trust_tier:  0,
      from_cache:  false,
      searched_at: new Date().toISOString(),
    };
  }

  // 3. Brave Search — verified sources only
  let results: BraveSearchResult[];
  try {
    results = await fetchBraveResults(normalized, env.BRAVE_SEARCH_API_KEY);
  } catch (err) {
    return {
      query_hash:  queryHash,
      query_text:  rawQuery,
      answer_text: `Search temporarily unavailable: ${(err as Error).message}`,
      sources:     [],
      trust_tier:  0,
      from_cache:  false,
      searched_at: new Date().toISOString(),
    };
  }

  // 4. Map results to KnowledgeSource
  const sources: KnowledgeSource[] = results
    .filter(r => r.url && r.title)
    .map(r => ({
      url:     r.url,
      title:   r.title,
      excerpt: r.description?.slice(0, MAX_EXCERPT) ?? "",
      domain:  new URL(r.url).hostname.replace(/^www\./, ""),
      tier:    getTierForUrl(r.url),
      label:   getLabelForUrl(r.url),
    }));

  const trustTier  = sources.length > 0
    ? Math.max(...sources.map(s => s.tier))
    : 0;

  const answerText = synthesizeAnswer(normalized, results);

  // 5. Cache for future queries (fire-and-forget on error)
  await cachePut(queryHash, rawQuery, answerText, sources, trustTier, env.DB)
    .catch(err => console.error("[knowledge_cache] cachePut failed:", err));

  return {
    query_hash:  queryHash,
    query_text:  rawQuery,
    answer_text: answerText,
    sources,
    trust_tier:  trustTier,
    from_cache:  false,
    searched_at: new Date().toISOString(),
  };
}

/** List all cached entries (admin use) */
export async function listKnowledgeCache(
  db: D1Database,
  limit = 50
): Promise<CacheRow[]> {
  const rows = await db
    .prepare(`
      SELECT query_hash, query_text, answer_text, sources_json, trust_tier, use_count, created_at
      FROM knowledge_cache
      ORDER BY use_count DESC, created_at DESC
      LIMIT ?
    `)
    .bind(limit)
    .all<CacheRow>();
  return rows.results ?? [];
}

/** Delete a specific cached entry (admin use — to remove bad answers) */
export async function deleteKnowledgeCacheEntry(
  queryHash: string,
  db: D1Database
): Promise<boolean> {
  const result = await db
    .prepare(`DELETE FROM knowledge_cache WHERE query_hash = ?`)
    .bind(queryHash)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}
