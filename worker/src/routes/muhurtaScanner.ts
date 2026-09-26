// GET /muhurta/scan -- Date/Muhurta Scanner.
//
// ARCHITECTURE.md Section 4: "A separate module from Query Window. Scans a
// date range (past 30 days, future up to 1 year) using the Hora/Navtara/
// Gochar election-style engine (continuous score, not a KP verdict) to find
// the best window in that range."
//
// Strategy: sample every 30 minutes across the requested range (daytime
// hours only — 5am to 10pm local), score each sample using the existing
// scoreHora() pipeline, and return the top-N windows grouped by day.
//
// This is a computationally expensive endpoint: a 30-day range at 30-minute
// intervals over ~17 daytime hours = ~1020 sample points, each requiring
// sunrise/sunset + hora calculation + scoring. For a 1-year range that's
// ~12,000 points. Workers have a 30-second CPU time limit, so we cap the
// range and sample coarsely.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { json, errorJson } from "../lib/response";
import {
  trueSiderealLongitude,
  realSunriseSunset,
  julianDayFromUtc,
  buildRealChart,
  getCurrentDasha,
  NAKSHATRA_NAMES,
} from "../lib/astro";
import {
  buildHoraWindows,
  getActiveHora,
  computeTara,
  getPanchakaDosha,
  getGandaMoola,
  getDishashool,
} from "../lib/muhurta";
import { scoreHora, type LagnaOnlyChart, type DashaContext, type ChandrabalaContext } from "../lib/horaScoring";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

// Scanning cost: higher than a single lookup because it's compute-intensive.
const SCAN_COST = 5;
const UNLIMITED_TIERS = new Set(["premium", "ultra"]);

// Sampling: every 30 min, daytime only (05:00-22:00 local approximation via
// longitude-based offset). Max range: 90 days (to stay within Worker CPU budget).
const SAMPLE_INTERVAL_MS = 30 * 60 * 1000;
const MAX_RANGE_DAYS = 90;
const MAX_RESULTS = 20;

// Approximate local hour from UTC using longitude (15° per hour offset).
// Not timezone-accurate (DST, political boundaries) but good enough to skip
// the deep-night hours where no one is scheduling muhurtas.
function approxLocalHour(utcDate: Date, longitudeDeg: number): number {
  const utcHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60;
  const offset = longitudeDeg / 15;
  return ((utcHour + offset) % 24 + 24) % 24;
}

interface ScanResult {
  timestamp: string;
  score: number;
  hora_lord: string;
  purpose_label: string;
  nakshatra: string;
  tara: { number: number; name: string; isBenefic: boolean } | null;
  panchaka_active: boolean;
  ganda_moola: boolean;
  dishashool_direction: string | null;
}

export async function handleMuhurtaScan(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const purpose = url.searchParams.get("purpose") ?? "general";
  const kundaliIdParam = url.searchParams.get("kundali_id");
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const topNParam = url.searchParams.get("top_n");

  const lat = latParam !== null ? Number(latParam) : NaN;
  const lon = lonParam !== null ? Number(lonParam) : NaN;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return errorJson("lat is required and must be between -90 and 90.", 400, "INVALID_LAT");
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return errorJson("lon is required and must be between -180 and 180.", 400, "INVALID_LON");
  }

  const now = new Date();
  const from = fromParam ? new Date(fromParam) : now;
  const to = toParam ? new Date(toParam) : new Date(now.getTime() + 30 * 86400000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return errorJson("from/to must be valid ISO dates.", 400, "INVALID_DATE");
  }
  if (to.getTime() <= from.getTime()) {
    return errorJson("'to' must be after 'from'.", 400, "INVALID_RANGE");
  }
  const rangeDays = (to.getTime() - from.getTime()) / 86400000;
  if (rangeDays > MAX_RANGE_DAYS) {
    return errorJson(`Range cannot exceed ${MAX_RANGE_DAYS} days.`, 400, "RANGE_TOO_LARGE");
  }

  // Past limit: 30 days
  const minAllowed = new Date(now.getTime() - 30 * 86400000);
  if (from.getTime() < minAllowed.getTime()) {
    return errorJson("Cannot scan more than 30 days in the past.", 400, "TOO_FAR_PAST");
  }
  // Future limit: 1 year
  const maxAllowed = new Date(now.getTime() + 365 * 86400000);
  if (to.getTime() > maxAllowed.getTime()) {
    return errorJson("Cannot scan more than 1 year in the future.", 400, "TOO_FAR_FUTURE");
  }

  const topN = topNParam ? Math.min(Math.max(1, Number(topNParam)), MAX_RESULTS) : 10;

  // Load kundali if provided (for personalized scoring)
  let lagnaOnlyChart: LagnaOnlyChart | null = null;
  let janmaNakIdx: number | null = null;
  let dashaContext: DashaContext | null = null;
  let natalMoonRashi: number | null = null;

  if (kundaliIdParam !== null) {
    const kundaliId = Number(kundaliIdParam);
    if (!Number.isInteger(kundaliId)) {
      return errorJson("kundali_id must be an integer.", 400, "INVALID_KUNDALI_ID");
    }
    const row = await env.DB.prepare(
      `SELECT lagna_rashi_idx, janma_nakshatra_idx, birth_date, birth_time, birth_place_lat, birth_place_lon
       FROM kundalis WHERE id = ? AND user_id = ?`
    )
      .bind(kundaliId, auth.userId)
      .first<{
        lagna_rashi_idx: number | null;
        janma_nakshatra_idx: number | null;
        birth_date: string;
        birth_time: string;
        birth_place_lat: number;
        birth_place_lon: number;
      }>();
    if (!row) return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");

    if (row.lagna_rashi_idx !== null) lagnaOnlyChart = { lagnaRashi: row.lagna_rashi_idx };
    janmaNakIdx = row.janma_nakshatra_idx;

    const birthUtc = new Date(`${row.birth_date}T${row.birth_time}Z`);
    if (!Number.isNaN(birthUtc.getTime())) {
      const natalChart = buildRealChart(birthUtc, row.birth_place_lat, row.birth_place_lon);
      const natalMoon = natalChart.planets.find((p) => p.planet === "Moon");
      if (natalMoon) natalMoonRashi = natalMoon.rashi;

      // Dasha context: compute once at the midpoint of the scan range for
      // a reasonable approximation (dasha periods are months-to-years long,
      // so the same lord likely covers the entire scan range).
      const midpoint = new Date((from.getTime() + to.getTime()) / 2);
      const dasha = getCurrentDasha(natalChart, midpoint);
      dashaContext = { mahaLord: dasha?.maha.lord ?? null, antarLord: dasha?.antar.lord ?? null };
    }
  }

  // Billing
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");

  if (!UNLIMITED_TIERS.has(user.tier)) {
    try {
      await debitWallet(env, auth.userId, SCAN_COST, "query");
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return errorJson(
          `Insufficient points balance (have ${err.available}, need ${err.requested}). Scan costs ${SCAN_COST} points.`,
          402,
          "INSUFFICIENT_BALANCE"
        );
      }
      throw err;
    }
  }

  // ── Scan loop ──
  // Cache sunrise/sunset per day to avoid recomputing for every 30-min sample.
  const sunCache = new Map<string, { sunrise: Date; sunset: Date; nextSunrise: Date }>();
  function getSunTimes(sampleDate: Date): { sunrise: Date; sunset: Date; nextSunrise: Date } {
    const dayKey = `${sampleDate.getUTCFullYear()}-${sampleDate.getUTCMonth()}-${sampleDate.getUTCDate()}`;
    let cached = sunCache.get(dayKey);
    if (!cached) {
      cached = realSunriseSunset(sampleDate, lat, lon);
      sunCache.set(dayKey, cached);
    }
    return cached;
  }

  const allResults: ScanResult[] = [];

  for (let t = from.getTime(); t <= to.getTime(); t += SAMPLE_INTERVAL_MS) {
    const sampleTime = new Date(t);
    const localHour = approxLocalHour(sampleTime, lon);

    // Skip deep night (before 5am or after 10pm local) — nobody is scheduling muhurtas then.
    if (localHour < 5 || localHour >= 22) continue;

    const { sunrise, sunset, nextSunrise } = getSunTimes(sampleTime);
    const horaWindows = buildHoraWindows(sunrise, sunset, nextSunrise, sampleTime);
    const activeHora = getActiveHora(horaWindows, sampleTime);
    if (!activeHora) continue;

    const jd = julianDayFromUtc(sampleTime);
    const moonLon = trueSiderealLongitude("Moon", jd);
    const currentNakIdx = Math.floor(moonLon / (360 / 27));
    const currentNakDeg = moonLon % (360 / 27);

    let chandrabalaContext: ChandrabalaContext | null = null;
    if (natalMoonRashi !== null) {
      chandrabalaContext = { natalMoonRashi, currentMoonRashi: Math.floor(moonLon / 30) };
    }

    const score = scoreHora(
      activeHora.lord,
      purpose,
      lagnaOnlyChart,
      janmaNakIdx,
      currentNakIdx,
      currentNakDeg,
      dashaContext,
      chandrabalaContext
    );

    const tara = janmaNakIdx !== null ? computeTara(janmaNakIdx, currentNakIdx) : null;
    const panchaka = getPanchakaDosha(currentNakIdx, currentNakDeg, sampleTime.getUTCDay());
    const gandaMoola = getGandaMoola(currentNakIdx);
    const dishashool = getDishashool(sampleTime.getUTCDay());

    allResults.push({
      timestamp: sampleTime.toISOString(),
      score: score.score,
      hora_lord: activeHora.lord,
      purpose_label: purpose,
      nakshatra: NAKSHATRA_NAMES[currentNakIdx]!,
      tara,
      panchaka_active: panchaka.active,
      ganda_moola: gandaMoola.active,
      dishashool_direction: dishashool.direction,
    });
  }

  // Sort by score descending, take top N
  allResults.sort((a, b) => b.score - a.score);
  const topResults = allResults.slice(0, topN);

  // Group by day for readability
  const byDay = new Map<string, ScanResult[]>();
  for (const r of topResults) {
    const dayKey = r.timestamp.slice(0, 10);
    const list = byDay.get(dayKey) ?? [];
    list.push(r);
    byDay.set(dayKey, list);
  }

  const grouped = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, windows]) => ({
      date,
      windows: windows.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    }));

  await env.DB.prepare(
    `INSERT INTO query_logs (user_id, kundali_id, query_type, points_charged)
     VALUES (?, ?, 'muhurta_scan', ?)`
  )
    .bind(auth.userId, kundaliIdParam ? Number(kundaliIdParam) : null, UNLIMITED_TIERS.has(user.tier) ? 0 : SCAN_COST)
    .run();

  return json({
    scan_range: { from: from.toISOString(), to: to.toISOString() },
    purpose,
    samples_evaluated: allResults.length,
    top_n: topN,
    personalized: lagnaOnlyChart !== null || janmaNakIdx !== null,
    results: grouped,
  });
}
