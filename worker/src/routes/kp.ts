// GET /kp/chart -- KP cusps + planet/cusp sub-lords for a saved kundali.
//
// This is the KP Engine's foundation layer (ARCHITECTURE.md Section 2 step
// 4's "house-cusp nakshatra -> sub-lord" and "significators" groundwork),
// NOT the full Promise/Denied verdict pipeline. Still missing, tracked
// separately: Navtara-of-sub-lord relation, Mahadasha/Antardasha check,
// Gochar check, and the final verdict+confidence combination -- those need
// the House-Activity taxonomy (docs/HOUSE_ACTIVITY_MAPPING.md) wired in
// first, which is its own not-yet-built piece. See lib/kp.ts's header for
// the verification status (and the one open ayanamsa-precision question)
// behind the numbers this endpoint returns.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { trueSiderealLongitude, julianDayFromUtc, rahuLongitude, RASHI_NAMES } from "../lib/astro";
import { solvePlacidusCusps, getSubLordChain, DEFAULT_AYANAMSA_CAVEAT } from "../lib/kp";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv {
  DB: D1Database;
}

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const HOUSE_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export async function handleGetKpChart(request: Request, env: Env, kundaliId: number): Promise<Response> {
  try {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const row = await env.DB.prepare(
    `SELECT birth_date, latitude, longitude FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(kundaliId, auth.userId)
    .first<{ birth_date: string; latitude: number; longitude: number }>();
  if (!row) return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");

  const birthUtc = new Date(row.birth_date);
  if (Number.isNaN(birthUtc.getTime())) {
    return errorJson("Stored birth date/time could not be parsed.", 500, "INVALID_BIRTH_DATA");
  }

  const { cusps } = solvePlacidusCusps(birthUtc, row.latitude, row.longitude);
  const jd = julianDayFromUtc(birthUtc);

  const houseCusps = cusps.map((deg, i) => {
    const chain = getSubLordChain(deg);
    return {
      house: HOUSE_NUMERALS[i],
      sign: RASHI_NAMES[Math.floor(deg / 30)],
      deg_in_sign: Math.round((deg % 30) * 10000) / 10000,
      sign_lord: signLordOf(Math.floor(deg / 30)),
      star_lord: chain.starLord,
      sub_lord: chain.subLord,
      sub_sub_lord: chain.subSubLord,
    };
  });

  const planetLongitudes: Record<string, number> = {};
  for (const p of PLANETS) planetLongitudes[p] = trueSiderealLongitude(p, jd);
  planetLongitudes.Rahu = rahuLongitude(jd);
  planetLongitudes.Ketu = norm360(planetLongitudes.Rahu + 180);

  const planetSubLords = Object.entries(planetLongitudes).map(([planet, deg]) => {
    const chain = getSubLordChain(deg);
    return {
      planet,
      sign: RASHI_NAMES[Math.floor(deg / 30)],
      deg_in_sign: Math.round((deg % 30) * 10000) / 10000,
      sign_lord: signLordOf(Math.floor(deg / 30)),
      star_lord: chain.starLord,
      sub_lord: chain.subLord,
      sub_sub_lord: chain.subSubLord,
    };
  });

  return json({
    kundali_id: kundaliId,
    ayanamsa_caveat: DEFAULT_AYANAMSA_CAVEAT,
    house_cusps: houseCusps,
    planet_sub_lords: planetSubLords,
  });
  } catch (err: any) {
    console.error("[handleGetKpChart] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

const SIGN_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];
function signLordOf(rashiIdx: number): string {
  return SIGN_LORDS[rashiIdx]!;
}
