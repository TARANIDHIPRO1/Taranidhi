// GET /muhurta/now -- current Hora/Uphora/Rahu-Kaal for a location, with
// personalized Tarabala-gated scoring when a saved kundali_id is given.
//
// This is the first real consumer of lib/muhurta.ts + lib/horaScoring.ts
// (ported from the verified TaraNidhi Floot prototype) inside the Worker,
// per ARCHITECTURE.md Section 8: scoring must run server-side, never on the
// client. It is intentionally a "3-layer" score (Purpose, Functional-Nature,
// Tarabala) -- see lib/horaScoring.ts header for what's still missing
// (Chandrabala-Gate, Lagna-Gate, Dasha-Gate) before this can be called the
// complete Hora Matrix.
//
// NOT yet wired: query_logs insertion / wallet point debit for this lookup
// (ARCHITECTURE.md Section 5: general lookups cost 1 point on Basic tier).
// This endpoint is free to call for now -- ARCHITECTURE.md Task backlog
// tracks wiring the wallet debit once the wallet debit function exists.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { trueSiderealLongitude, realSunriseSunset, julianDayFromUtc, NAKSHATRA_NAMES } from "../lib/astro";
import { buildHoraWindows, getActiveHora, buildUphoras, getActiveUphora, getRahuKaal, isWithinRahuKaal, computeTara } from "../lib/muhurta";
import { scoreHora, type LagnaOnlyChart } from "../lib/horaScoring";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv {
  DB: D1Database;
}

export async function handleMuhurtaNow(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const purpose = url.searchParams.get("purpose") ?? "general";
  const kundaliIdParam = url.searchParams.get("kundali_id");

  const lat = latParam !== null ? Number(latParam) : NaN;
  const lon = lonParam !== null ? Number(lonParam) : NaN;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return errorJson("lat query param is required and must be between -90 and 90.", 400, "INVALID_LAT");
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return errorJson("lon query param is required and must be between -180 and 180.", 400, "INVALID_LON");
  }

  let lagnaOnlyChart: LagnaOnlyChart | null = null;
  let janmaNakIdx: number | null = null;

  if (kundaliIdParam !== null) {
    const kundaliId = Number(kundaliIdParam);
    if (!Number.isInteger(kundaliId)) {
      return errorJson("kundali_id must be an integer.", 400, "INVALID_KUNDALI_ID");
    }
    // Scoped to the caller's own kundali -- never let one user personalize a
    // score using another user's saved birth data.
    const row = await env.DB.prepare(
      `SELECT lagna_rashi_idx, janma_nakshatra_idx FROM kundalis WHERE id = ? AND user_id = ?`
    )
      .bind(kundaliId, auth.userId)
      .first<{ lagna_rashi_idx: number | null; janma_nakshatra_idx: number | null }>();
    if (!row) {
      return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");
    }
    if (row.lagna_rashi_idx !== null) lagnaOnlyChart = { lagnaRashi: row.lagna_rashi_idx };
    janmaNakIdx = row.janma_nakshatra_idx;
  }

  const now = new Date();
  const { sunrise, sunset, nextSunrise } = realSunriseSunset(now, lat, lon);
  const horaWindows = buildHoraWindows(sunrise, sunset, nextSunrise, now);
  const activeHora = getActiveHora(horaWindows, now);
  const activeUphora = activeHora ? getActiveUphora(buildUphoras(activeHora), now) : null;

  const rahuKaal = getRahuKaal(sunrise, sunset, now.getUTCDay());
  const inRahuKaal = isWithinRahuKaal(now, rahuKaal);

  const jd = julianDayFromUtc(now);
  const moonLon = trueSiderealLongitude("Moon", jd);
  const currentNakIdx = Math.floor(moonLon / (360 / 27));
  const currentNakDeg = moonLon % (360 / 27);

  let tara: { number: number; name: string; isBenefic: boolean } | null = null;
  if (janmaNakIdx !== null) {
    tara = computeTara(janmaNakIdx, currentNakIdx);
  }

  let score: ReturnType<typeof scoreHora> | null = null;
  if (activeHora) {
    score = scoreHora(activeHora.lord, purpose, lagnaOnlyChart, janmaNakIdx, currentNakIdx, currentNakDeg);
  }

  return json({
    as_of: now.toISOString(),
    location: { lat, lon },
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    active_hora: activeHora
      ? { lord: activeHora.lord, start: activeHora.start.toISOString(), end: activeHora.end.toISOString(), is_daytime: activeHora.isDaytime }
      : null,
    active_uphora: activeUphora
      ? { sub: activeUphora.sub, start: activeUphora.start.toISOString(), end: activeUphora.end.toISOString() }
      : null,
    rahu_kaal: { start: rahuKaal.start.toISOString(), end: rahuKaal.end.toISOString(), active_now: inRahuKaal },
    current_nakshatra: { idx: currentNakIdx, name: NAKSHATRA_NAMES[currentNakIdx] },
    tara,
    score,
    personalized: lagnaOnlyChart !== null || janmaNakIdx !== null,
  });
}
