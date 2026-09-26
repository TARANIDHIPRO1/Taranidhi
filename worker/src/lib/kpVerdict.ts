// KP Promise/Denied Verdict Engine -- ARCHITECTURE.md Section 2, steps 4-5.
//
// Given a natal chart and a house number, determines whether that house's
// matter is "Promised" or "Denied" using the KP sub-lord methodology:
//
//   1. Find the sub-lord of the relevant house cusp.
//   2. Check the sub-lord's star-lord's house significances -- specifically,
//      whether the star-lord (nakshatra dispositor of the sub-lord) signifies
//      houses favorable to the matter.
//   3. Apply Navtara check on the sub-lord planet relative to natal Moon's
//      nakshatra.
//   4. Check current Mahadasha/Antardasha lords' relation to the queried house.
//   5. (Future) Gochar/transit check.
//
// DESIGN DECISIONS FLAGGED (must NOT be silently guessed):
//   - Multi-house combination: when an activity maps to >1 house, how to
//     combine per-house verdicts (AND vs average) is NOT YET DECIDED.
//     This module returns per-house verdicts; the caller/route must NOT
//     combine them until the domain owner specifies the rule.
//   - Dasha weighting: the qualitative hierarchy (dasha > transit) is
//     classical. Any numeric split (30/50/20 etc.) is proprietary and
//     labeled as such.
//   - Confidence labels: not yet defined by the domain owner. This module
//     returns a raw favorability breakdown, not a confidence label.
//   - Karyesh-Bala reversal: for 6th/8th/12th house matters (debt, surgery,
//     occult study, court cases), "strength" of those houses is WANTED,
//     not feared. This inversion is flagged in houseActivityMap.ts notes
//     but NOT yet implemented as an automatic reversal in the verdict logic.

import { getSubLordChain, solvePlacidusCusps, type SubLordChain, type PlacidusCusps } from "./kp";
import {
  trueSiderealLongitude,
  rahuLongitude,
  julianDayFromUtc,
  getCurrentDasha,
  buildRealChart,
  type RealChart,
  type DashaPeriod,
} from "./astro";
import { computeTara } from "./muhurta";

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

// ── KP Significator Logic ──
//
// In KP, a planet signifies houses through its position:
//   1. Houses owned by the planet's star-lord (nakshatra dispositor)
//   2. Houses occupied by the planet's star-lord
//   3. Houses owned by the planet itself
//   4. Houses occupied by the planet itself
//
// For the sub-lord-based verdict: we check whether the sub-lord of the
// queried house cusp signifies houses FAVORABLE to the matter.

const SIGN_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

/** Which sign(s) does this planet own? Returns sign indices (0-11). */
function signsOwnedBy(planet: string): number[] {
  const owned: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (SIGN_LORDS[i] === planet) owned.push(i);
  }
  // Rahu co-rules Aquarius (10), Ketu co-rules Scorpio (7) in KP tradition
  if (planet === "Rahu") owned.push(10);
  if (planet === "Ketu") owned.push(7);
  return owned;
}

/** Which house does a given sidereal longitude fall in, given the 12 Placidus cusps?
 *  Returns house number 1-12. */
function houseOfLongitude(lon: number, cusps: number[]): number {
  const l = norm360(lon);
  for (let i = 0; i < 12; i++) {
    const start = cusps[i]!;
    const end = cusps[(i + 1) % 12]!;
    if (end > start) {
      if (l >= start && l < end) return i + 1;
    } else {
      // Cusp wraps around 360°
      if (l >= start || l < end) return i + 1;
    }
  }
  return 1; // Fallback (shouldn't reach here with valid cusps)
}

/** Houses owned by a planet (which houses have their cusp in a sign owned by this planet). */
function housesOwnedBy(planet: string, cusps: number[]): number[] {
  const ownedSigns = signsOwnedBy(planet);
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const cuspSign = Math.floor(cusps[i]! / 30);
    if (ownedSigns.includes(cuspSign)) houses.push(i + 1);
  }
  return houses;
}

export interface PlanetSignificance {
  planet: string;
  /** Houses signified through star-lord (nakshatra dispositor) ownership. */
  starLordOwnsHouses: number[];
  /** House occupied by the star-lord. */
  starLordOccupiesHouse: number;
  /** Houses signified through the planet's own ownership. */
  planetOwnsHouses: number[];
  /** House occupied by the planet itself. */
  planetOccupiesHouse: number;
  /** All houses this planet signifies (union of above). */
  allSignifiedHouses: number[];
}

/** Get the sidereal longitude of a planet at a given JD, handling Rahu/Ketu. */
function getPlanetLongitude(planet: string, jd: number): number {
  if (planet === "Rahu") return rahuLongitude(jd);
  if (planet === "Ketu") return norm360(rahuLongitude(jd) + 180);
  return trueSiderealLongitude(planet, jd);
}

/** Compute which houses a planet signifies in the KP system. */
export function computeSignificance(
  planet: string,
  planetLonDeg: number,
  cusps: number[],
  allPlanetLons: Record<string, number>
): PlanetSignificance {
  // Planet's nakshatra → star-lord
  const chain = getSubLordChain(planetLonDeg);
  const starLord = chain.starLord;

  // Star-lord's position (we need it to find which house it occupies)
  const starLordLon = allPlanetLons[starLord];
  if (starLordLon === undefined) {
    throw new Error(`Star lord "${starLord}" not found in planet positions`);
  }

  const starLordOwnsHouses = housesOwnedBy(starLord, cusps);
  const starLordOccupiesHouse = houseOfLongitude(starLordLon, cusps);

  const planetOwnsHouses = housesOwnedBy(planet, cusps);
  const planetOccupiesHouse = houseOfLongitude(planetLonDeg, cusps);

  const allSet = new Set([
    ...starLordOwnsHouses,
    starLordOccupiesHouse,
    ...planetOwnsHouses,
    planetOccupiesHouse,
  ]);

  return {
    planet,
    starLordOwnsHouses,
    starLordOccupiesHouse,
    planetOwnsHouses,
    planetOccupiesHouse,
    allSignifiedHouses: [...allSet].sort((a, b) => a - b),
  };
}

// ── KP Favorable House Groups ──
// Classical KP groupings: houses that support vs oppose a matter.
// For a given queried house H:
//   Favorable: the trikona (1st/5th/9th from H) and the 11th from H
//   Unfavorable: the 6th/8th/12th from H (dusthana)
// BUT: Karyesh-Bala reversal applies when the queried matter IS about
// 6th/8th/12th house matters — flagged but not auto-reversed here.

function favorableHousesFor(queriedHouse: number): number[] {
  // Trikona from the queried house + 11th (gains) from it
  const offsets = [0, 4, 8, 10]; // 1st, 5th, 9th, 11th from H (0-indexed offsets)
  return offsets.map((o) => ((queriedHouse - 1 + o) % 12) + 1);
}

function unfavorableHousesFor(queriedHouse: number): number[] {
  // Dusthana: 6th, 8th, 12th from the queried house
  const offsets = [5, 7, 11]; // 6th, 8th, 12th from H (0-indexed offsets)
  return offsets.map((o) => ((queriedHouse - 1 + o) % 12) + 1);
}

// ── Single-House Verdict ──

export interface HouseVerdict {
  house: number;
  /** The sub-lord of this house cusp. */
  cuspSubLord: string;
  /** Sub-lord chain details for the cusp. */
  cuspChain: SubLordChain;
  /** Which houses the cusp sub-lord signifies. */
  subLordSignificance: PlanetSignificance;
  /** Does the sub-lord signify the queried house itself? (Strong promise indicator.) */
  subLordSignifiesQueriedHouse: boolean;
  /** Does the sub-lord signify favorable houses (trikona/11th from queried house)? */
  subLordSignifiesFavorable: boolean;
  /** Does the sub-lord signify unfavorable houses (6/8/12 from queried house)? */
  subLordSignifiesUnfavorable: boolean;
  /** Navtara of the sub-lord planet relative to natal Moon's nakshatra. */
  navtara: { number: number; name: string; isBenefic: boolean };
  /** Raw verdict: "promised" or "denied". */
  verdict: "promised" | "denied";
  /** Breakdown of favorable vs unfavorable house counts for transparency. */
  favorableCount: number;
  unfavorableCount: number;
}

/** Evaluate a single house for Promise/Denied. */
export function evaluateHouse(
  house: number, // 1-12
  cusps: number[], // 12 Placidus cusps (sidereal, from KP engine)
  allPlanetLons: Record<string, number>, // all 9 planet sidereal longitudes
  janmaNakIdx: number // natal Moon's nakshatra index (for Navtara)
): HouseVerdict {
  const cuspDeg = cusps[house - 1]!;
  const cuspChain = getSubLordChain(cuspDeg);
  const subLord = cuspChain.subLord;

  // Get the sub-lord planet's longitude
  const subLordLon = allPlanetLons[subLord];
  if (subLordLon === undefined) {
    throw new Error(`Sub-lord "${subLord}" not found in planet positions`);
  }

  // Compute which houses the sub-lord signifies
  const subLordSignificance = computeSignificance(subLord, subLordLon, cusps, allPlanetLons);

  // Check favorable/unfavorable signification
  const favorable = favorableHousesFor(house);
  const unfavorable = unfavorableHousesFor(house);

  const favorableCount = subLordSignificance.allSignifiedHouses.filter((h) =>
    favorable.includes(h)
  ).length;
  const unfavorableCount = subLordSignificance.allSignifiedHouses.filter((h) =>
    unfavorable.includes(h)
  ).length;
  const subLordSignifiesQueriedHouse = subLordSignificance.allSignifiedHouses.includes(house);

  // Navtara of the sub-lord planet (where the sub-lord sits, relative to
  // natal Moon's nakshatra — reusing the existing Navtara logic per
  // ARCHITECTURE.md Section 2 step 4)
  const subLordNakIdx = Math.floor(subLordLon / (360 / 27));
  const navtara = computeTara(janmaNakIdx, subLordNakIdx);

  // Verdict logic:
  // - If sub-lord signifies more favorable houses than unfavorable → Promised
  // - If sub-lord signifies more unfavorable than favorable → Denied
  // - Tie-break: Navtara benefic → Promised, malefic → Denied
  // - If sub-lord directly signifies the queried house itself, that's a
  //   strong positive signal (adds to favorable count conceptually)
  let effectiveFavorable = favorableCount + (subLordSignifiesQueriedHouse ? 1 : 0);
  const verdict: "promised" | "denied" =
    effectiveFavorable > unfavorableCount
      ? "promised"
      : effectiveFavorable < unfavorableCount
        ? "denied"
        : navtara.isBenefic
          ? "promised"
          : "denied";

  return {
    house,
    cuspSubLord: subLord,
    cuspChain,
    subLordSignificance,
    subLordSignifiesQueriedHouse,
    subLordSignifiesFavorable: favorableCount > 0,
    subLordSignifiesUnfavorable: unfavorableCount > 0,
    navtara,
    verdict,
    favorableCount,
    unfavorableCount,
  };
}

// ── Dasha Context for KP ──

export interface KpDashaCheck {
  mahaLord: string;
  antarLord: string;
  /** Does the Mahadasha lord signify the queried house? */
  mahaSignifiesHouse: boolean;
  /** Does the Antardasha lord signify the queried house? */
  antarSignifiesHouse: boolean;
  /** Dasha support level. */
  support: "strong" | "partial" | "none";
}

/** Check whether current Dasha lords support the queried house. */
export function checkDashaSupport(
  house: number,
  dasha: { maha: DashaPeriod; antar: DashaPeriod },
  cusps: number[],
  allPlanetLons: Record<string, number>
): KpDashaCheck {
  const mahaLon = allPlanetLons[dasha.maha.lord];
  const antarLon = allPlanetLons[dasha.antar.lord];

  if (mahaLon === undefined || antarLon === undefined) {
    return {
      mahaLord: dasha.maha.lord,
      antarLord: dasha.antar.lord,
      mahaSignifiesHouse: false,
      antarSignifiesHouse: false,
      support: "none",
    };
  }

  const mahaSig = computeSignificance(dasha.maha.lord, mahaLon, cusps, allPlanetLons);
  const antarSig = computeSignificance(dasha.antar.lord, antarLon, cusps, allPlanetLons);

  const mahaSignifiesHouse = mahaSig.allSignifiedHouses.includes(house);
  const antarSignifiesHouse = antarSig.allSignifiedHouses.includes(house);

  // OccultVIISION proprietary weighting: strong = both signify, partial = one, none = neither.
  // The qualitative hierarchy (dasha determines what is promised; transit can only trigger
  // what dasha permits) is classical. This specific labeling is proprietary.
  const support: "strong" | "partial" | "none" =
    mahaSignifiesHouse && antarSignifiesHouse
      ? "strong"
      : mahaSignifiesHouse || antarSignifiesHouse
        ? "partial"
        : "none";

  return { mahaLord: dasha.maha.lord, antarLord: dasha.antar.lord, mahaSignifiesHouse, antarSignifiesHouse, support };
}

// ── Full KP Query Result ──

export interface KpQueryResult {
  /** Activity slug from the house-activity map. */
  activitySlug: string;
  /** Per-house verdicts (one for each house the activity maps to). */
  houseVerdicts: HouseVerdict[];
  /** Dasha support for each queried house (if natal chart available). */
  dashaChecks: KpDashaCheck[] | null;
  /** WARNING: multi-house combination is NOT YET DECIDED.
   *  This field is null until the domain owner specifies AND vs average.
   *  Callers MUST show per-house verdicts separately until then. */
  combinedVerdict: null;
  /** The ayanamsa caveat to surface in the response. */
  ayanamsaCaveat: string;
}
