/**
 * knowledge.ts — Verified Jyotish Knowledge Search routes
 *
 * POST /knowledge/query   — search or cache-hit for a Jyotish question
 * GET  /knowledge/sources — list the verified source whitelist (public, no auth)
 *
 * Architecture:
 *   1. Auth required for /knowledge/query (authenticated users only)
 *   2. Cache-first: SHA-256(normalized_query) → D1 lookup → serve if hit
 *   3. Cache-miss: Brave Search (domain-restricted to verified sources)
 *   4. Results cached in D1 for future queries
 *
 * BRAVE_SEARCH_API_KEY wrangler secret must be set in production.
 * Graceful fallback if not set.
 */

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { json, errorJson } from "../lib/response";
import {
  knowledgeSearch,
  listKnowledgeCache,
  deleteKnowledgeCacheEntry,
  type KnowledgeSearchEnv,
} from "../lib/knowledgeSearch";

export interface Env extends AuthEnv {
  DB: D1Database;
  BRAVE_SEARCH_API_KEY?: string;
}

/** Verified source whitelist — mirrors knowledgeSearch.ts tiers */
const SOURCE_WHITELIST = [
  { domain: "sacred-texts.com",        tier: 5, label: "Sacred Texts",           note: "BPHS, Saravali, Phaladeepika (classical)" },
  { domain: "wisdomlib.org",            tier: 5, label: "Wisdom Library",          note: "Sanskrit commentaries (classical)" },
  { domain: "vedicastrologer.org",      tier: 4, label: "Vedic Astrologer (KP)",   note: "K.S. Krishnamurti KP system" },
  { domain: "saptarishisastrology.com", tier: 4, label: "Saptarishi Research",     note: "Peer-reviewed Jyotish journal" },
  { domain: "hindupedia.com",           tier: 4, label: "Hindupedia",              note: "Shastra encyclopaedia" },
  { domain: "astrojyoti.com",           tier: 3, label: "AstroJyoti",              note: "Verified Jyotish content" },
  { domain: "astrovidya.com",           tier: 3, label: "AstroVidya",              note: "Verified Jyotish content" },
  { domain: "jyotishvidya.com",         tier: 3, label: "Jyotish Vidya",           note: "Verified Jyotish content" },
  { domain: "vaastu.com",              tier: 3, label: "Vaastu.com",              note: "Vastu shastra queries" },
];

// ── POST /knowledge/query ────────────────────────────────────────────────────

/**
 * POST /knowledge/query
 *
 * Body:
 *   { query: string, context?: { kundali_id?: number, planet?: string, house?: number } }
 *
 * Response:
 *   { query_hash, query_text, answer_text, sources[], trust_tier, from_cache, searched_at }
 */
export async function handleKnowledgeQuery(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: { query?: string; context?: Record<string, unknown> };
  try {
    body = (await request.json()) as { query?: string; context?: Record<string, unknown> };
  } catch {
    return errorJson("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const { query } = body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return errorJson("query is required and must be a non-empty string.", 400, "MISSING_QUERY");
  }

  // Hard cap on query length — prevents abuse / ridiculous search strings
  if (query.length > 500) {
    return errorJson("query must be 500 characters or fewer.", 400, "QUERY_TOO_LONG");
  }

  const searchEnv: KnowledgeSearchEnv = {
    DB: env.DB,
    BRAVE_SEARCH_API_KEY: env.BRAVE_SEARCH_API_KEY,
  };

  const result = await knowledgeSearch(query, searchEnv);

  return json({
    ok:          true,
    query_hash:  result.query_hash,
    query_text:  result.query_text,
    answer_text: result.answer_text,
    sources:     result.sources,
    trust_tier:  result.trust_tier,
    from_cache:  result.from_cache,
    searched_at: result.searched_at,
  });
}

// ── GET /knowledge/sources ───────────────────────────────────────────────────

/** GET /knowledge/sources — public endpoint, lists the verified source whitelist */
export async function handleKnowledgeSources(_request: Request, _env: Env): Promise<Response> {
  return json({
    ok:      true,
    sources: SOURCE_WHITELIST,
    total:   SOURCE_WHITELIST.length,
    tiers: {
      5: "Classical texts — highest authority (BPHS, Saravali, Phaladeepika)",
      4: "Verified Jyotish research — peer-reviewed or KP system primary sources",
      3: "Good Jyotish content — reputable, reviewed",
    },
  });
}

// ── GET /knowledge/cache (admin) ─────────────────────────────────────────────

/** GET /knowledge/cache?limit=50 — list cached queries, admin-only */
export async function handleKnowledgeCache(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  // Simple admin check: role must be 'admin' in the users table
  const user = await env.DB.prepare(`SELECT role FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ role: string }>();
  if (!user || user.role !== "admin") {
    return errorJson("Admin access required.", 403, "FORBIDDEN");
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const rows = await listKnowledgeCache(env.DB, limit);

  return json({ ok: true, total: rows.length, entries: rows });
}

// ── DELETE /knowledge/cache/:hash (admin) ────────────────────────────────────

/** DELETE /knowledge/cache/:hash — remove a bad cached answer, admin-only */
export async function handleDeleteKnowledgeCacheEntry(
  request: Request,
  env: Env,
  queryHash: string
): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const user = await env.DB.prepare(`SELECT role FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ role: string }>();
  if (!user || user.role !== "admin") {
    return errorJson("Admin access required.", 403, "FORBIDDEN");
  }

  if (!queryHash || !/^[0-9a-f]{64}$/.test(queryHash)) {
    return errorJson("Invalid query hash (must be 64-char hex).", 400, "INVALID_HASH");
  }

  const deleted = await deleteKnowledgeCacheEntry(queryHash, env.DB);
  if (!deleted) {
    return errorJson(`No cache entry found for hash: ${queryHash}`, 404, "NOT_FOUND");
  }

  return json({ ok: true, deleted_hash: queryHash });
}
