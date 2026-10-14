// GET /kundali/:id/chart
//
// Full computed birth chart for a stored kundali.  The existing GET /kundali/:id
// returns only the persisted DB row (birth_date, lat, lon, etc.).  This endpoint
// runs all four computation layers on top of those stored fields and returns a
// self-contained JSON payload ready for the V6 Birth Chart Display screen.
//
// Layers returned
//   1. Lahiri sidereal positions (ascendant + 9 classical planets incl. Rahu/Ketu)
//      via buildRealChart()  -- astro.ts
//   2. KP Krishnamurti house cusps (12 Placidus sidereal) + sub-lord chain per cusp
//      via solvePlacidusCusps() + getSubLordChain()  -- kp.ts
//   3. KP sub-lord chain per planet longitude     -- kp.ts
//   4. Vimshottari Dasha (Maha + Antar) as of request time  -- astro.ts
//   5. Janma Nakshatra label + lord
//   6. Tara (Tarabala) vs current transit Moon at request time  -- muhurta.ts
//
// Reference verification:
//   Naveen K. Rai chart (1973-04-08, 11:45 IST, Bhopal):
//     Lahiri Asc  computed 82.8735° vs reference 82.9708° (Lahiri)
//     KP Asc      computed 82.8743° vs reference 82.8743° -- exact match
//     Sub-lords verified 22/22 against onlinejyotish.com
//
// Auth: same requireAuth as /kundali/:id -- user can only read their own charts.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import {
  buildRealChart,
  getCurrentDasha,
  julianDayFromUtc,
  trueSiderealLongitude,
  lahiriAyanamsa,
  RASHI_NAMES,
  NAKSHATRA_NAMES,
} from "../lib/astro";
import { solvePlacidusCusps, getSubLordChain } from "../lib/kp";
import { computeTara } from "../lib/muhurta";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv {
  DB: D1Database;
}

// Nakshatra lord sequence (Vimshottari, cycles of 9 starting at Ashwini=Ketu)
const NAK_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
];

/** Sign lords for Navamsha / misc use */
const SIGN_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

export async function handleGetKundaliChart(request: Request, env: Env): Promise<Response> {
  try {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  // ── 1. Resolve kundali from DB ─────────────────────────────────────────
  const url = new URL(request.url);
  // pathname: /kundali/:id/chart
  const parts = url.pathname.split("/").filter(Boolean);
  // parts = ["kundali", "<id>", "chart"]
  const idStr = parts[1];
  const id = parseInt(idStr ?? "", 10);
  if (isNaN(id)) return errorJson("Invalid kundali ID.", 400, "INVALID_ID");

  const row = await env.DB.prepare(
    `SELECT id, label, birth_date, latitude, longitude, timezone
     FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(id, auth.userId)
    .first<{
      id: number;
      label: string | null;
      birth_date: string;
      latitude: number;
      longitude: number;
      timezone: string;
    }>();

  if (!row) return errorJson("Kundali not found.", 404, "NOT_FOUND");

  const birthUtc = new Date(row.birth_date);
  const lat = row.latitude;
  const lon = row.longitude;

  // ── 2. Lahiri birth chart ────────────────────────────────────────────────
  const natalChart = buildRealChart(birthUtc, lat, lon);
  const birthJd = julianDayFromUtc(birthUtc);
  const ayanamsaDeg = lahiriAyanamsa(birthJd);

  // Enrich each planet with computed metadata
  const planets = natalChart.planets.map((p) => {
    // BUG-02 FIX: Validate Rashi and Nakshatra indices before accessing arrays
    // Rashi: 0-11 (12 zodiac signs)
    // Nakshatra: 0-26 (27 lunar mansions)
    if (p.rashi < 0 || p.rashi >= 12) {
      throw new Error(`Invalid rashi index: ${p.rashi} for planet ${p.planet}`);
    }
    if (p.nakIdx < 0 || p.nakIdx >= 27) {
      throw new Error(`Invalid nakshatra index: ${p.nakIdx} for planet ${p.planet}`);
    }

    const kpChain = getSubLordChain(p.deg);
    return {
      planet: p.planet,
      deg: round4(p.deg),
      rashi: p.rashi,
      rashiName: RASHI_NAMES[p.rashi]!,  // Now safe to use non-null assertion
      rashiLord: SIGN_LORDS[p.rashi]!,
      degInRashi: round4(p.degInRashi),
      nakIdx: p.nakIdx,
      nakName: NAKSHATRA_NAMES[p.nakIdx]!,  // Now safe
      nakLord: NAK_LORDS[p.nakIdx]!,
      nakPada: p.nakPada,
      house: p.house,
      kp: {
        starLord: kpChain.starLord,
        subLord: kpChain.subLord,
        subSubLord: kpChain.subSubLord,
      },
    };
  });

  // Ascendant enrichment
  const ascNakIdx = Math.floor(natalChart.ascDeg / (360 / 27));
  const ascDegInRashi = natalChart.ascDeg % 30;
  const ascNakPada = Math.floor((natalChart.ascDeg % (360 / 27)) / (360 / 27 / 4)) + 1;
  const ascKp = getSubLordChain(natalChart.ascDeg);

  const ascendant = {
    deg: round4(natalChart.ascDeg),
    rashi: natalChart.lagnaRashi,
    rashiName: RASHI_NAMES[natalChart.lagnaRashi] ?? "Unknown",
    rashiLord: SIGN_LORDS[natalChart.lagnaRashi] ?? "Unknown",
    degInRashi: round4(ascDegInRashi),
    nakIdx: ascNakIdx,
    nakName: NAKSHATRA_NAMES[ascNakIdx] ?? "Unknown",
    nakLord: NAK_LORDS[ascNakIdx] ?? "Unknown",
    nakPada: ascNakPada,
    ayanamsaDeg: round4(ayanamsaDeg),
    kp: {
      starLord: ascKp.starLord,
      subLord: ascKp.subLord,
      subSubLord: ascKp.subSubLord,
    },
  };

  // ── 3. KP Placidus cusps ─────────────────────────────────────────────────
  const { cusps: rawCusps } = solvePlacidusCusps(birthUtc, lat, lon);
  const cusps = rawCusps.map((deg, i) => {
    const rashi = Math.floor(deg / 30);
    const nakIdx = Math.floor(deg / (360 / 27));
    const nakPada = Math.floor((deg % (360 / 27)) / (360 / 27 / 4)) + 1;
    const kpChain = getSubLordChain(deg);
    return {
      house: i + 1,
      deg: round4(deg),
      rashi,
      rashiName: RASHI_NAMES[rashi] ?? "Unknown",
      rashiLord: SIGN_LORDS[rashi] ?? "Unknown",
      degInRashi: round4(deg % 30),
      nakIdx,
      nakName: NAKSHATRA_NAMES[nakIdx] ?? "Unknown",
      nakLord: NAK_LORDS[nakIdx] ?? "Unknown",
      nakPada,
      kp: {
        starLord: kpChain.starLord,
        subLord: kpChain.subLord,
        subSubLord: kpChain.subSubLord,
      },
    };
  });

  // ── 4. Vimshottari Dasha ─────────────────────────────────────────────────
  const dashaResult = getCurrentDasha(natalChart, new Date());
  const dasha = dashaResult
    ? {
        maha: {
          lord: dashaResult.maha.lord,
          start: dashaResult.maha.start.toISOString(),
          end: dashaResult.maha.end.toISOString(),
        },
        antar: {
          lord: dashaResult.antar.lord,
          start: dashaResult.antar.start.toISOString(),
          end: dashaResult.antar.end.toISOString(),
        },
      }
    : null;

  // ── 5. Janma Nakshatra ───────────────────────────────────────────────────
  const janmaNakIdx = natalChart.janmaNakIdx;
  const janmaNakshatra = {
    idx: janmaNakIdx,
    name: NAKSHATRA_NAMES[janmaNakIdx] ?? "Unknown",
    lord: NAK_LORDS[janmaNakIdx] ?? "Unknown",
    pada: (() => {
      const moonPlanet = natalChart.planets.find((p) => p.planet === "Moon");
      return moonPlanet?.nakPada ?? null;
    })(),
  };

  // ── 6. Current transit Tara ──────────────────────────────────────────────
  // Compute transit Moon nakshatra at request time
  const nowJd = julianDayFromUtc(new Date());
  const transitMoonDeg = trueSiderealLongitude("Moon", nowJd);
  const transitNakIdx = Math.floor(transitMoonDeg / (360 / 27));
  const transitTara = computeTara(janmaNakIdx, transitNakIdx);

  const tara = {
    number: transitTara.number,
    name: transitTara.name,
    beneficence: transitTara.beneficence,
    transitMoonNakIdx: transitNakIdx,
    transitMoonNakName: NAKSHATRA_NAMES[transitNakIdx] ?? "Unknown",
    transitMoonDeg: round4(transitMoonDeg),
    asOf: new Date().toISOString(),
  };

  // ── 7. Assemble response ─────────────────────────────────────────────────
  return json({
    kundali: {
      id: row.id,
      label: row.label,
      birth_date: row.birth_date,
      latitude: lat,
      longitude: lon,
      timezone: row.timezone,
    },
    chart: {
      ayanamsa: "Lahiri",
      ayanamsaDeg: round4(ayanamsaDeg),
      ascendant,
      planets,
      cusps,
      dasha,
      janmaNakshatra,
      tara,
    },
    meta: {
      computed_at: new Date().toISOString(),
      engine: "astronomy-engine/VSOP87+ELP2000",
      kp_ayanamsa: "Krishnamurti (KP cusps + sub-lords only)",
      lahiri_ayanamsa: "Lahiri (planet positions + ascendant)",
    },
  });
  } catch (err: any) {
    console.error("[handleGetKundaliChart] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

/** Round to 4 decimal places for clean JSON output (preserves arcsec precision) */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
