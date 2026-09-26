// POST /kp/query -- KP Promise/Denied verdict for an activity.
//
// ARCHITECTURE.md Section 2 steps 2-5: user picks an activity → house
// mapping resolves the house(s) → KP engine evaluates each house →
// per-house verdicts returned.
//
// IMPORTANT: multi-house combination logic is NOT YET DECIDED (see
// ARCHITECTURE.md). This endpoint returns per-house verdicts separately.
// The frontend MUST show them as separate cards until the domain owner
// specifies the combination rule.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { json, errorJson } from "../lib/response";
import { getHouseMapping, HOUSE_ACTIVITY_MAP, getCategories, getMappingsForCategory } from "../lib/houseActivityMap";
import { solvePlacidusCusps, getSubLordChain, DEFAULT_AYANAMSA_CAVEAT } from "../lib/kp";
import { evaluateHouse, checkDashaSupport, type KpQueryResult } from "../lib/kpVerdict";
import {
  trueSiderealLongitude,
  rahuLongitude,
  julianDayFromUtc,
  buildRealChart,
  getCurrentDasha,
  lahiriAyanamsa,
  krishnamurtiAyanamsa,
} from "../lib/astro";

export interface Env extends AuthEnv {
  DB: D1Database;
}

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/** POST /kp/query -- expects JSON body { kundali_id: number, activity_slug: string } */
export async function handleKpQuery(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: { kundali_id?: number; activity_slug?: string };
  try {
    body = (await request.json()) as { kundali_id?: number; activity_slug?: string };
  } catch {
    return errorJson("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const { kundali_id, activity_slug } = body;
  if (!kundali_id || !activity_slug) {
    return errorJson("Both kundali_id and activity_slug are required.", 400, "MISSING_FIELDS");
  }

  // Look up the activity in the house-activity map
  const mapping = getHouseMapping(activity_slug);
  if (!mapping) {
    return errorJson(
      `Unknown activity slug: "${activity_slug}". Use GET /kp/activities for the list.`,
      400,
      "UNKNOWN_ACTIVITY"
    );
  }

  // Load the kundali
  const row = await env.DB.prepare(
    `SELECT birth_date, birth_time, birth_place_lat, birth_place_lon FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(kundali_id, auth.userId)
    .first<{ birth_date: string; birth_time: string; birth_place_lat: number; birth_place_lon: number }>();
  if (!row) return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");

  const birthUtc = new Date(`${row.birth_date}T${row.birth_time}Z`);
  if (Number.isNaN(birthUtc.getTime())) {
    return errorJson("Stored birth date/time could not be parsed.", 500, "INVALID_BIRTH_DATA");
  }

  // Compute KP cusps (using Krishnamurti ayanamsa, scoped to KP only)
  const { cusps } = solvePlacidusCusps(birthUtc, row.birth_place_lat, row.birth_place_lon);
  const jd = julianDayFromUtc(birthUtc);

  // Compute planet longitudes using Krishnamurti ayanamsa for KP context
  const kpAyanamsa = krishnamurtiAyanamsa(jd);
  // We need sidereal positions consistent with KP cusps, so we recompute
  // using the same ayanamsa the cusps use. The trueSiderealLongitude() in
  // astro.ts uses Lahiri, so we need to adjust by the offset.
  const lahiri = lahiriAyanamsa(jd);
  const ayanamsaDiff = lahiri - kpAyanamsa; // positive: Lahiri > Krishnamurti

  const allPlanetLons: Record<string, number> = {};
  for (const p of PLANETS) {
    // trueSiderealLongitude uses Lahiri; add the diff to get Krishnamurti-based
    allPlanetLons[p] = norm360(trueSiderealLongitude(p, jd) + ayanamsaDiff);
  }
  allPlanetLons["Rahu"] = norm360(rahuLongitude(jd) + ayanamsaDiff);
  allPlanetLons["Ketu"] = norm360(allPlanetLons["Rahu"]! + 180);

  // Natal Moon's nakshatra index (for Navtara of sub-lord)
  const moonLon = allPlanetLons["Moon"]!;
  const janmaNakIdx = Math.floor(moonLon / (360 / 27));

  // Evaluate each house the activity maps to
  const houseVerdicts = mapping.houses.map((house) =>
    evaluateHouse(house, cusps, allPlanetLons, janmaNakIdx)
  );

  // Dasha check: use the Lahiri-based natal chart for dasha (dasha is
  // time-based, not position-based, so ayanamsa doesn't affect the dasha
  // period itself -- only which nakshatra the Moon was in at birth, which
  // determines the starting lord). For KP consistency, we use the KP Moon
  // position to determine the starting lord.
  const natalChart = buildRealChart(birthUtc, row.birth_place_lat, row.birth_place_lon);
  // Override janmaNakIdx with KP-consistent value
  const kpNatalChart = { ...natalChart, janmaNakIdx };
  const now = new Date();
  const dasha = getCurrentDasha(kpNatalChart, now);

  let dashaChecks: ReturnType<typeof checkDashaSupport>[] | null = null;
  if (dasha) {
    dashaChecks = mapping.houses.map((house) =>
      checkDashaSupport(house, dasha, cusps, allPlanetLons)
    );
  }

  const result: KpQueryResult = {
    activitySlug: activity_slug,
    houseVerdicts,
    dashaChecks,
    combinedVerdict: null, // NOT YET DECIDED -- see module header
    ayanamsaCaveat: DEFAULT_AYANAMSA_CAVEAT,
  };

  return json({
    ...result,
    _multi_house_warning:
      mapping.houses.length > 1
        ? "This activity maps to multiple houses. Per-house verdicts are shown " +
          "separately because the combination rule (AND vs weighted average) has " +
          "not been decided by the domain owner. Do NOT combine them client-side."
        : undefined,
  });
}

/** GET /kp/activities -- list all available activity slugs grouped by category. */
export async function handleListActivities(_request: Request, _env: Env): Promise<Response> {
  const categories = getCategories();
  const result = categories.map((cat) => ({
    category: cat,
    activities: getMappingsForCategory(cat).map((m) => ({
      slug: m.slug,
      label: m.label,
      houses: m.houses,
      notes: m.notes || null,
    })),
  }));
  return json({ categories: result });
}
