// GET /numerology -- Chaldean + Pythagorean numerology for a date/time.
//
// Wires the fully-implemented lib/numerology.ts (359 lines, Phase 2 complete)
// as a public API endpoint. Supports both systems simultaneously and returns
// muhurta compatibility score, lucky attributes, and recommendations.
//
// Auth: required (session token). Billing: 1 point per query (Basic tier);
// Premium/Ultra unlimited -- same model as /muhurta/now.
//
// Query params:
//   date    YYYY-MM-DD  (required) -- the date to analyse
//   time    HH:MM       (required) -- the time to analyse (IST, 24-hour)
//   system  Chaldean | Pythagorean (optional, default: Pythagorean)
//
// Source: lib/numerology.ts -- Chaldean/Pythagorean numerology (modern; not a classical Muhurta rule).

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { calculateNumerology, type NumerologySystem } from "../lib/numerology";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

const NUMEROLOGY_COST  = 1;
const UNLIMITED_TIERS  = new Set(["premium", "ultra"]);

const DATE_RE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const VALID_SYSTEMS: NumerologySystem[] = ["Chaldean", "Pythagorean"];

export async function handleGetNumerology(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url    = new URL(request.url);
  const date   = url.searchParams.get("date") ?? "";
  const time   = url.searchParams.get("time") ?? "";
  const rawSys = url.searchParams.get("system") ?? "Pythagorean";

  // ── Input validation ─────────────────────────────────────────────────────
  if (!DATE_RE.test(date)) {
    return errorJson("date query param is required in YYYY-MM-DD format.", 400, "INVALID_DATE");
  }
  if (!TIME_RE.test(time)) {
    return errorJson("time query param is required in HH:MM format (24-hour).", 400, "INVALID_TIME");
  }
  // Validate date is a real calendar date (no Feb 30 etc.)
  const dateObj = new Date(`${date}T${time}:00Z`);
  if (isNaN(dateObj.getTime())) {
    return errorJson("date/time combination is not a valid calendar date.", 400, "INVALID_DATETIME");
  }
  const system: NumerologySystem = VALID_SYSTEMS.includes(rawSys as NumerologySystem)
    ? (rawSys as NumerologySystem)
    : "Pythagorean";

  // ── Billing ──────────────────────────────────────────────────────────────
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");

  const isUnlimited = UNLIMITED_TIERS.has(user.tier);
  if (!isUnlimited) {
    // debitWallet returns {success, message} -- does NOT throw InsufficientBalanceError.
    // Check return value explicitly.
    const debitResult = await debitWallet(env, auth.userId, NUMEROLOGY_COST, "query");
    if (!debitResult.success) {
      return errorJson(
        `Insufficient points balance. Top up or upgrade your tier.`,
        402,
        "INSUFFICIENT_BALANCE"
      );
    }
  }

  // ── Calculation ──────────────────────────────────────────────────────────
  const result = await calculateNumerology(date, time, system);

  // ── Query log (non-fatal: wrapped in try/catch) ───────────────────────────
  // Uses 'general_lookup' until migration 0002 adds 'numerology' to the
  // query_type CHECK constraint on query_logs. After migration is applied by
  // Naveen, change this back to 'numerology'.
  // TODO: change to 'numerology' after migration 0002_query_logs_add_numerology.sql is applied.
  try {
    await env.DB.prepare(
      `INSERT INTO query_logs (user_id, kundali_id, query_type, muhurta_pct, points_charged)
       VALUES (?, NULL, 'general_lookup', ?, ?)`
    )
      .bind(auth.userId, result.muhurtaScore, isUnlimited ? 0 : NUMEROLOGY_COST)
      .run();
  } catch (_logErr) {
    // Logging is supplemental — never fail the primary response for it.
    console.error("[numerology] query_log insert failed:", _logErr);
  }

  return json({
    date:                  result.date,
    time:                  result.time,
    system_used:           system,
    chaldean: {
      number:              result.chaldeanNumber,
      meaning:             result.chaldeanMeaning,
      ruling_planet:       result.chaldeanRulingPlanet,
    },
    pythagorean: {
      number:              result.pythagoreanNumber,
      meaning:             result.pythagoreanMeaning,
      ruling_planet:       result.pythagoreanRulingPlanet,
    },
    lucky_attributes: {
      colors:              result.luckyColors,
      metals:              result.luckyMetals,
      gems:                result.luckyGems,
    },
    recommendations:       result.recommendations,
    muhurta_score:         result.muhurtaScore,   // 0-100 numerological auspiciousness
    confidence:            result.confidence,
    source:                "Chaldean system (ancient Babylonian-Vedic); Pythagorean system (ancient Greek)",
  });
}
