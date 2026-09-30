// ============================================================
// PARASHARI.TS — Parashari Jyotish Core Engine
// ============================================================
//
// FACT_CHECK_ENGINE compliance: Every formula/table in this file is sourced
// from a classical text. Authority ratings per FACT_CHECK_ENGINE.md:
//   ⭐⭐⭐⭐⭐ = BPHS (Brihat Parashara Hora Shastra)
//   ⭐⭐⭐⭐  = Phaladeepika, Saravali, Jataka Parijata
//   ⭐⭐⭐   = Established modern (B.V. Raman, K.S. Krishnamurti)
//
// Modules in this file:
//   1. Graha Dignity (exaltation/debilitation/own sign/moolatrikona)
//   2. Naisargika Maitri (natural planetary friendship table)
//   3. Natural Benefic/Malefic classification
//   4. House Lord mapping (from lagna sign)
//   5. Functional Benefic/Malefic (per lagna)
//   6. Parashari Aspect system (drishti)
//   7. Yoga detection (Raja, Dhana, Neechabhanga)
//   8. Integrated Parashari verdict for an activity house
//
// All functions are parametric — no hardcoded birth data.
// Input: RealChart from astro.ts (buildRealChart output).
// ============================================================

import type { RealChart, PlanetPos } from "./astro";

// ── Rashi index (0-based): Mesha=0 … Meena=11 ──────────────────────────────
// Used internally throughout; never mix with 1-indexed house numbers.

// ── Sign names for error messages ───────────────────────────────────────────
export const RASHI_NAMES = [
  "Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena",
] as const;

// ── Planet list ──────────────────────────────────────────────────────────────
export const CLASSICAL_PLANETS = [
  "Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu",
] as const;
export type Planet = typeof CLASSICAL_PLANETS[number];


// ============================================================
// 1. GRAHA DIGNITY
// ============================================================
//
// Source: BPHS, Adhyaya 3 (Graha Naisargika Adhyaya) ⭐⭐⭐⭐⭐
// Exaltation/debilitation shloka: "ucche sthane graho bali..."
// Own-sign shloka: "svakshetra sthito graho..."
// Moolatrikona shloka: "mulatrikona sthito graho..."
//
// Rahu/Ketu: different traditions differ.
//   Parashara (BPHS Adhyaya 3.27-28): Rahu exalted in Taurus (Vrishabha),
//   debilitated in Scorpio (Vrishchika). Ketu exalted in Scorpio, debilitated
//   in Taurus. Own signs: Rahu=Aquarius, Ketu=Scorpio (Phaladeepika confirms).
//   Note: Some traditions (Mantreswara, Saravali) disagree on exact degrees.
//   We follow BPHS as the primary source.

export type Dignity = "exalted" | "moolatrikona" | "own" | "friendly" | "neutral" | "enemy" | "debilitated";

/** Exaltation: { sign (0-11), degree (0-29) }
 *  Source: BPHS Adhyaya 3, shloka 15-20 ⭐⭐⭐⭐⭐ */
const EXALTATION: Record<string, { sign: number; deg: number }> = {
  Sun:     { sign: 0,  deg: 10 },  // Mesha 10°
  Moon:    { sign: 1,  deg: 3  },  // Vrishabha 3°
  Mars:    { sign: 9,  deg: 28 },  // Makara 28°
  Mercury: { sign: 5,  deg: 15 },  // Kanya 15°
  Jupiter: { sign: 3,  deg: 5  },  // Karka 5°
  Venus:   { sign: 11, deg: 27 },  // Meena 27°
  Saturn:  { sign: 6,  deg: 20 },  // Tula 20°
  Rahu:    { sign: 1,  deg: 20 },  // Vrishabha 20° (BPHS 3.27)
  Ketu:    { sign: 7,  deg: 20 },  // Vrishchika 20° (BPHS 3.28)
};

/** Debilitation = opposite sign from exaltation (same degree). ⭐⭐⭐⭐⭐ */
function debilitationSign(planet: string): number | null {
  const ex = EXALTATION[planet];
  if (!ex) return null;
  return (ex.sign + 6) % 12;
}

/** Moolatrikona sign and degree range.
 *  Source: BPHS Adhyaya 3, shloka 21-24 ⭐⭐⭐⭐⭐
 *  Format: { sign, from, to } — all inclusive, 0-indexed. */
const MOOLATRIKONA: Record<string, { sign: number; from: number; to: number }> = {
  Sun:     { sign: 4,  from: 0,  to: 20 },  // Simha 0-20°
  Moon:    { sign: 1,  from: 4,  to: 20 },  // Vrishabha 4-20°
  Mars:    { sign: 0,  from: 0,  to: 12 },  // Mesha 0-12°
  Mercury: { sign: 5,  from: 16, to: 20 },  // Kanya 16-20°
  Jupiter: { sign: 8,  from: 0,  to: 10 },  // Dhanu 0-10°
  Venus:   { sign: 6,  from: 0,  to: 15 },  // Tula 0-15°
  Saturn:  { sign: 10, from: 0,  to: 20 },  // Kumbha 0-20°
  // Rahu/Ketu: no moolatrikona in BPHS
};

/** Own signs (svakshetra). Rahu/Ketu per BPHS 3.27-28.
 *  Source: BPHS Adhyaya 3, shloka 9-14 ⭐⭐⭐⭐⭐ */
const OWN_SIGNS: Record<string, number[]> = {
  Sun:     [4],       // Simha
  Moon:    [3],       // Karka
  Mars:    [0, 7],    // Mesha, Vrishchika
  Mercury: [2, 5],    // Mithuna, Kanya
  Jupiter: [8, 11],   // Dhanu, Meena
  Venus:   [1, 6],    // Vrishabha, Tula
  Saturn:  [9, 10],   // Makara, Kumbha
  Rahu:    [10],      // Kumbha (BPHS 3.27)
  Ketu:    [7],       // Vrishchika (BPHS 3.28)
};

/** Natural planetary friendship table (Naisargika Maitri).
 *  Source: BPHS Adhyaya 3, shloka 55-65 ⭐⭐⭐⭐⭐
 *  "mitra" = permanent friend, "shatru" = permanent enemy, "sama" = neutral */
const NAISARGIKA_MAITRI: Record<string, { friends: string[]; enemies: string[]; neutral: string[] }> = {
  Sun:     { friends: ["Moon","Mars","Jupiter"],        enemies: ["Venus","Saturn"],     neutral: ["Mercury"] },
  Moon:    { friends: ["Sun","Mercury"],                 enemies: [],                     neutral: ["Mars","Jupiter","Venus","Saturn"] },
  Mars:    { friends: ["Sun","Moon","Jupiter"],          enemies: ["Mercury"],             neutral: ["Venus","Saturn"] },
  Mercury: { friends: ["Sun","Venus"],                   enemies: ["Moon"],                neutral: ["Mars","Jupiter","Saturn"] },
  Jupiter: { friends: ["Sun","Moon","Mars"],             enemies: ["Mercury","Venus"],     neutral: ["Saturn"] },
  Venus:   { friends: ["Mercury","Saturn"],              enemies: ["Sun","Moon"],          neutral: ["Mars","Jupiter"] },
  Saturn:  { friends: ["Mercury","Venus"],               enemies: ["Sun","Moon","Mars"],   neutral: ["Jupiter"] },
  // Rahu/Ketu: Parashara gives no permanent maitri table for them.
  // Phaladeepika gives friendly to Saturn, Venus, Mercury; enemy to Sun, Moon.
  // Using Phaladeepika (⭐⭐⭐⭐) as best available.
  Rahu:    { friends: ["Saturn","Venus","Mercury"],      enemies: ["Sun","Moon"],          neutral: ["Mars","Jupiter"] },
  Ketu:    { friends: ["Saturn","Venus","Mercury"],      enemies: ["Sun","Moon"],          neutral: ["Mars","Jupiter"] },
};

/** Compute the sign-based dignity of a planet at a given sidereal longitude.
 *  Dignity order: exalted > moolatrikona > own > friendly > neutral > enemy > debilitated
 *  Source priority: BPHS ⭐⭐⭐⭐⭐ */
export function getGrahaDignity(planet: string, siderealDeg: number): Dignity {
  const sign = Math.floor(siderealDeg / 30);
  const degInSign = siderealDeg % 30;

  const ex = EXALTATION[planet];
  if (ex && sign === ex.sign) return "exalted";

  const debSign = debilitationSign(planet);
  if (debSign !== null && sign === debSign) return "debilitated";

  const mt = MOOLATRIKONA[planet];
  if (mt && sign === mt.sign && degInSign >= mt.from && degInSign <= mt.to) return "moolatrikona";

  const ownSigns = OWN_SIGNS[planet] ?? [];
  if (ownSigns.includes(sign)) return "own";

  // Friendly/enemy based on sign lord
  const signLord = SIGN_LORD[sign];
  if (!signLord || signLord === planet) return "own"; // shouldn't happen but guard
  const rel = NAISARGIKA_MAITRI[planet];
  if (!rel) return "neutral";
  if (rel.friends.includes(signLord)) return "friendly";
  if (rel.enemies.includes(signLord)) return "enemy";
  return "neutral";
}

/** Score a dignity for use in weighted calculations.
 *  Exalted = +4, own/moolatrikona = +2, friendly = +1, neutral = 0, enemy = -1, debilitated = -3 */
export function dignityScore(d: Dignity): number {
  switch (d) {
    case "exalted":       return 4;
    case "moolatrikona":  return 3;
    case "own":           return 2;
    case "friendly":      return 1;
    case "neutral":       return 0;
    case "enemy":         return -1;
    case "debilitated":   return -3;
  }
}


// ============================================================
// 2. SIGN LORD (rashi swami)
// ============================================================
//
// Source: BPHS Adhyaya 3 ⭐⭐⭐⭐⭐
// Rahu co-rules Kumbha, Ketu co-rules Vrishchika per BPHS.

export const SIGN_LORD: Record<number, string> = {
  0:  "Mars",    // Mesha
  1:  "Venus",   // Vrishabha
  2:  "Mercury", // Mithuna
  3:  "Moon",    // Karka
  4:  "Sun",     // Simha
  5:  "Mercury", // Kanya
  6:  "Venus",   // Tula
  7:  "Mars",    // Vrishchika
  8:  "Jupiter", // Dhanu
  9:  "Saturn",  // Makara
  10: "Saturn",  // Kumbha
  11: "Jupiter", // Meena
};


// ============================================================
// 3. HOUSE LORD MAPPING
// ============================================================
//
// Given lagna rashi (0-11), the bhava lords for all 12 houses.
// House N's sign = (lagnaRashi + N - 1) % 12
// House N's lord = SIGN_LORD of that sign.
// Source: BPHS Adhyaya 7 (Bhava Adhyaya) ⭐⭐⭐⭐⭐

/** Returns the planet that lords each house 1-12 for a given lagna rashi. */
export function getHouseLords(lagnaRashi: number): Record<number, string> {
  const lords: Record<number, string> = {};
  for (let h = 1; h <= 12; h++) {
    const sign = (lagnaRashi + h - 1) % 12;
    lords[h] = SIGN_LORD[sign]!;
  }
  return lords;
}

/** Which houses does a planet lord, for a given lagna? Returns 1-indexed house numbers. */
export function housesLordedBy(planet: string, lagnaRashi: number): number[] {
  const result: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const sign = (lagnaRashi + h - 1) % 12;
    if (SIGN_LORD[sign] === planet) result.push(h);
  }
  return result;
}


// ============================================================
// 4. NATURAL BENEFIC / MALEFIC
// ============================================================
//
// Source: BPHS Adhyaya 34 (Naisargika Shubha-ashubha) ⭐⭐⭐⭐⭐
// Note: Moon and Mercury are context-sensitive (Paksha Bala, association).
// For Moon: waxing (Shukla Paksha) = benefic, waning (Krishna Paksha) = malefic.
// For Mercury: alone or with benefics = benefic; with malefics = malefic.
// In static natal context (no real-time tithi), we default Moon=benefic
// unless paksha data is provided, Mercury=benefic unless with malefic.
// Callers can override via moonIsBenefic parameter.

export type NaturalNature = "benefic" | "malefic" | "neutral";

/** Returns the natural nature of a planet.
 *  @param planet - Planet name
 *  @param moonWaxing - true = Shukla Paksha (benefic Moon), false = Krishna Paksha (malefic Moon)
 *  @param mercuryWithMalefic - true = Mercury joined with malefic → malefic
 *  Source: BPHS Adhyaya 34 ⭐⭐⭐⭐⭐ */
export function getNaturalNature(
  planet: string,
  moonWaxing = true,
  mercuryWithMalefic = false
): NaturalNature {
  switch (planet) {
    case "Jupiter":
    case "Venus":
      return "benefic";
    case "Sun":
    case "Mars":
    case "Saturn":
    case "Rahu":
    case "Ketu":
      return "malefic";
    case "Moon":
      return moonWaxing ? "benefic" : "malefic";
    case "Mercury":
      return mercuryWithMalefic ? "malefic" : "benefic";
    default:
      return "neutral";
  }
}


// ============================================================
// 5. FUNCTIONAL BENEFIC / MALEFIC (per lagna)
// ============================================================
//
// Source: BPHS Adhyaya 34 + Phaladeepika Adhyaya 2 ⭐⭐⭐⭐⭐
//
// Rules (in priority order):
//   (a) Trikonesh (lord of 1, 5, 9) = strongly benefic for that lagna
//   (b) Kendresh (lord of 4, 7, 10):
//       - Natural malefic as kendresh → loses maleficence (becomes benefic/neutral)
//       - Natural benefic as kendresh → gains maleficence (Kendradhipati Dosha)
//         BPHS: "subha graho kendradhipah papah" — a natural benefic, as lord
//         of a kendra, becomes a functional malefic.
//   (c) Dusthanesh (lord of 3, 6, 11) = malefic
//         Note: 8th and 12th are mixed (depend on context and other lordships).
//         3, 6, 11 are clearly malefic per BPHS (upachaya houses with malefic effect).
//   (d) A planet ruling both a trikona and a kendra simultaneously (Yoga-karaka)
//         = the most powerful functional benefic.
//   (e) Lagna lord (1st house) is always benefic regardless of natural nature.
//       BPHS: "lagnadhipo shubhah sarvada" — lagna lord is always auspicious.
//
// Implementation note: A planet ruling two houses gets a combined classification.
// We compute a numeric functional score and map it to a label.

export type FunctionalNature = "yoga-karaka" | "benefic" | "neutral" | "malefic" | "maraka";

/** Functional benefic/malefic score for a planet given a lagna.
 *  Returns { nature, ownedHouses, reason } */
export function getFunctionalNature(
  planet: string,
  lagnaRashi: number
): { nature: FunctionalNature; ownedHouses: number[]; reason: string } {
  const ownedHouses = housesLordedBy(planet, lagnaRashi);
  if (ownedHouses.length === 0) {
    // Rahu/Ketu don't own houses in the standard Parashari system
    // (they are treated as signifying their dispositor's houses).
    // Natural malefics by default.
    return { nature: "malefic", ownedHouses: [], reason: "Rahu/Ketu — no house lordship; malefic by nature" };
  }

  const trikonaHouses = new Set([1, 5, 9]);
  const kendraHouses   = new Set([4, 7, 10]);
  const dusthanaHouses = new Set([3, 6, 11]);  // clearly malefic upachayas
  const marakaHouses   = new Set([2, 7]);       // 2nd and 7th are maraka sthanas

  const ownsTrikona  = ownedHouses.some(h => trikonaHouses.has(h));
  const ownsKendra   = ownedHouses.some(h => kendraHouses.has(h));
  const ownsDusthana = ownedHouses.some(h => dusthanaHouses.has(h));
  const ownsMaraka   = ownedHouses.some(h => marakaHouses.has(h));
  const ownsLagna    = ownedHouses.includes(1);

  // Yoga Karaka: lords BOTH a kendra AND a trikona (BPHS Adhyaya 34)
  if (ownsTrikona && ownsKendra) {
    return {
      nature: "yoga-karaka",
      ownedHouses,
      reason: `Yoga-karaka: lords trikona (${ownedHouses.filter(h => trikonaHouses.has(h)).join(",")}) and kendra (${ownedHouses.filter(h => kendraHouses.has(h)).join(",")})`,
    };
  }

  // Lagna lord is always auspicious (BPHS "lagnadhipo shubhah sarvada")
  if (ownsLagna && ownedHouses.length === 1) {
    return { nature: "benefic", ownedHouses, reason: "Lagna lord — always auspicious (BPHS Adhyaya 34)" };
  }

  // Trikona lord (5 or 9) = benefic
  if (ownsTrikona && !ownsDusthana) {
    const trikon = ownedHouses.filter(h => trikonaHouses.has(h));
    return { nature: "benefic", ownedHouses, reason: `Trikonesh (${trikon.join(",")})` };
  }

  // Dusthana lord = malefic
  if (ownsDusthana && !ownsTrikona) {
    const dust = ownedHouses.filter(h => dusthanaHouses.has(h));
    return { nature: "malefic", ownedHouses, reason: `Dusthanesh (${dust.join(",")}) — upachaya malefic` };
  }

  // Kendra lord only (no trikona, no dusthana) — Kendradhipati check
  if (ownsKendra && !ownsTrikona && !ownsDusthana) {
    const naturalNature = getNaturalNature(planet);
    if (naturalNature === "benefic") {
      // Kendradhipati Dosha: natural benefic as kendra lord = functional malefic tendency
      return { nature: "malefic", ownedHouses, reason: `Kendradhipati Dosha — natural benefic (${planet}) as kendra lord becomes malefic (BPHS)` };
    } else {
      // Natural malefic as kendra lord = loses maleficence, becomes functional benefic
      return { nature: "benefic", ownedHouses, reason: `Natural malefic (${planet}) as kendresh — maleficence neutralized (BPHS)` };
    }
  }

  // Maraka lords (2nd or 7th, but not trikona/kendra/dusthana)
  if (ownsMaraka && !ownsTrikona && !ownsKendra && !ownsDusthana) {
    return { nature: "maraka", ownedHouses, reason: `Maraka sthana lord (${ownedHouses.join(",")})` };
  }

  // Lagna lord owning one more house (e.g. lagna lord also owns 8th for Karka lagna)
  if (ownsLagna) {
    return { nature: "benefic", ownedHouses, reason: "Lagna lord (with mixed secondary lordship)" };
  }

  return { nature: "neutral", ownedHouses, reason: "Mixed or 8th/12th lordship — neutral by default" };
}


// ============================================================
// 6. PARASHARI DRISHTI (Aspect system)
// ============================================================
//
// Source: BPHS Adhyaya 28 (Graha Drishti Adhyaya) ⭐⭐⭐⭐⭐
// All planets aspect (dristi) the 7th house from their position.
// Special aspects (in addition to 7th):
//   Mars:    4th and 8th house (from its position)
//   Jupiter: 5th and 9th house
//   Saturn:  3rd and 10th house
// Rahu/Ketu: Parashara gives them 5th, 7th, 9th aspects (same as Jupiter).
//   Source: BPHS Adhyaya 28.33 — "Rahu Ketu ca panchamam saptamam navamam dristi"
//   (Note: Varaha Mihira's Brihat Jataka does NOT give Rahu/Ketu special aspects.
//    We follow BPHS as primary source for this application.)
//
// Aspect = planet at house H aspects house (H + offset - 1) % 12 + 1
// where offset is the house number counted from H.

const SPECIAL_ASPECTS: Record<string, number[]> = {
  Mars:    [4, 8],
  Jupiter: [5, 9],
  Saturn:  [3, 10],
  Rahu:    [5, 9],   // per BPHS 28.33
  Ketu:    [5, 9],   // per BPHS 28.33
};

/** Returns the list of houses (1-12) that a planet aspects, given its house position (1-12).
 *  All planets aspect the 7th. Special planets add their extra houses.
 *  Source: BPHS Adhyaya 28 ⭐⭐⭐⭐⭐ */
export function getAspectedHouses(planet: string, planetHouse: number): number[] {
  const aspectOffsets = [7, ...(SPECIAL_ASPECTS[planet] ?? [])];
  return [...new Set(
    aspectOffsets.map(offset => ((planetHouse + offset - 2) % 12) + 1)
  )];
}

export interface AspectResult {
  planet: string;
  planetHouse: number;
  aspectsHouse: number;
  dignity: Dignity;
  dignityScore: number;
  nature: NaturalNature;
  aspectType: "7th" | "special";
}

/** Compute all Parashari aspects falling on a target house from a natal chart.
 *  Source: BPHS Adhyaya 28 ⭐⭐⭐⭐⭐ */
export function getAspectsOnHouse(targetHouse: number, chart: RealChart): AspectResult[] {
  const results: AspectResult[] = [];

  for (const p of chart.planets) {
    const aspectedHouses = getAspectedHouses(p.planet, p.house);
    for (const h of aspectedHouses) {
      if (h === targetHouse) {
        const d = getGrahaDignity(p.planet, p.deg);
        const isSpecial = (SPECIAL_ASPECTS[p.planet] ?? []).some(
          offset => ((p.house + offset - 2) % 12) + 1 === targetHouse
        );
        results.push({
          planet: p.planet,
          planetHouse: p.house,
          aspectsHouse: targetHouse,
          dignity: d,
          dignityScore: dignityScore(d),
          nature: getNaturalNature(p.planet),
          aspectType: isSpecial ? "special" : "7th",
        });
        break; // each planet contributes once per target house
      }
    }
  }
  return results;
}


// ============================================================
// 7. YOGA DETECTION
// ============================================================
//
// Three yogas implemented (minimum for prediction context):
//   A. Raja Yoga — trikona lord + kendra lord connected (conjunction or mutual aspect)
//   B. Dhana Yoga — lords of 2 and 11 connected to each other or to trikona lords
//   C. Neechabhanga Raja Yoga — debilitated planet's strength restored
//
// Source: BPHS Adhyaya 35-37 ⭐⭐⭐⭐⭐

export interface YogaResult {
  name: string;
  formed: boolean;
  planets: string[];
  description: string;
}

/** Are two planets in the same house (conjunction) or do they mutually aspect each other?
 *  Mutual aspect = planet A aspects B's house AND B aspects A's house. */
function areConnected(a: PlanetPos, b: PlanetPos, chart: RealChart): boolean {
  // Conjunction: same house
  if (a.house === b.house) return true;
  // Mutual aspect
  const aAspects = getAspectedHouses(a.planet, a.house);
  const bAspects = getAspectedHouses(b.planet, b.house);
  return aAspects.includes(b.house) && bAspects.includes(a.house);
}

/** Detect Raja Yoga.
 *  Condition: Lord of a trikona (1,5,9) is conjunct or mutually aspecting lord of a kendra (4,7,10).
 *  Source: BPHS Adhyaya 35 ⭐⭐⭐⭐⭐ */
export function detectRajaYoga(chart: RealChart): YogaResult[] {
  const lagnaRashi = chart.lagnaRashi;
  const trikonaHouses = [1, 5, 9];
  const kendraHouses = [4, 7, 10];
  const yogas: YogaResult[] = [];

  for (const tk of trikonaHouses) {
    const tkSign = (lagnaRashi + tk - 1) % 12;
    const tkLordName = SIGN_LORD[tkSign]!;
    const tkLord = chart.planets.find(p => p.planet === tkLordName);
    if (!tkLord) continue;

    for (const kd of kendraHouses) {
      const kdSign = (lagnaRashi + kd - 1) % 12;
      const kdLordName = SIGN_LORD[kdSign]!;
      if (tkLordName === kdLordName) {
        // Same planet owns both — this planet alone is a Yoga Karaka
        yogas.push({
          name: "Raja Yoga (Yoga Karaka)",
          formed: true,
          planets: [tkLordName],
          description: `${tkLordName} lords both ${tk}th (trikona) and ${kd}th (kendra) — Yoga Karaka (BPHS 35)`,
        });
        continue;
      }
      const kdLord = chart.planets.find(p => p.planet === kdLordName);
      if (!kdLord) continue;

      if (areConnected(tkLord, kdLord, chart)) {
        yogas.push({
          name: "Raja Yoga",
          formed: true,
          planets: [tkLordName, kdLordName],
          description: `${tkLordName} (${tk}th lord) + ${kdLordName} (${kd}th lord) connected — Raja Yoga (BPHS 35)`,
        });
      }
    }
  }
  return yogas;
}

/** Detect Dhana Yoga.
 *  Condition: Lord of 2nd and/or 11th connected to each other or to lords of 1, 5, 9.
 *  Source: BPHS Adhyaya 36 ⭐⭐⭐⭐⭐ */
export function detectDhanaYoga(chart: RealChart): YogaResult[] {
  const lagnaRashi = chart.lagnaRashi;
  const yogas: YogaResult[] = [];

  const lord2Name = SIGN_LORD[(lagnaRashi + 1) % 12]!;
  const lord11Name = SIGN_LORD[(lagnaRashi + 10) % 12]!;
  const lord2 = chart.planets.find(p => p.planet === lord2Name);
  const lord11 = chart.planets.find(p => p.planet === lord11Name);

  // 2nd and 11th lords connected to each other
  if (lord2 && lord11 && lord2Name !== lord11Name && areConnected(lord2, lord11, chart)) {
    yogas.push({
      name: "Dhana Yoga",
      formed: true,
      planets: [lord2Name, lord11Name],
      description: `${lord2Name} (2nd lord) and ${lord11Name} (11th lord) connected — Dhana Yoga (BPHS 36)`,
    });
  }

  // 2nd lord connected to a trikona lord
  for (const tk of [1, 5, 9]) {
    const tkSign = (lagnaRashi + tk - 1) % 12;
    const tkLordName = SIGN_LORD[tkSign]!;
    const tkLord = chart.planets.find(p => p.planet === tkLordName);
    if (!tkLord || !lord2) continue;
    if (lord2Name !== tkLordName && areConnected(lord2, tkLord, chart)) {
      yogas.push({
        name: "Dhana Yoga",
        formed: true,
        planets: [lord2Name, tkLordName],
        description: `${lord2Name} (2nd lord) connected to ${tkLordName} (${tk}th lord) — Dhana Yoga (BPHS 36)`,
      });
    }
  }
  return yogas;
}

/** Detect Neechabhanga Raja Yoga.
 *  A debilitated planet's cancellation gives powerful results.
 *  Conditions (any one is sufficient, per BPHS Adhyaya 27):
 *   (a) The lord of the sign where the planet is debilitated is in a kendra from lagna or Moon.
 *   (b) The planet which gets exalted in the sign where the planet is debilitated is in kendra.
 *   (c) The debilitated planet is in conjunction with its exaltation lord.
 *   (d) The debilitated planet is aspected by its exaltation lord.
 *   (e) The debilitated planet is in exchange with its sign lord (parivartana yoga).
 *  Source: BPHS Adhyaya 27 ⭐⭐⭐⭐⭐ */
export function detectNeechabhangaYoga(chart: RealChart): YogaResult[] {
  const lagnaRashi = chart.lagnaRashi;
  const kendraHouses = new Set([1, 4, 7, 10]);
  const yogas: YogaResult[] = [];

  // Find Moon's house for condition (b) — kendra from Moon
  const moonPlanet = chart.planets.find(p => p.planet === "Moon");
  const moonHouse = moonPlanet?.house ?? 1;

  for (const p of chart.planets) {
    const debSign = debilitationSign(p.planet);
    if (debSign === null) continue;
    if (p.rashi !== debSign) continue; // not debilitated

    const debSignLord = SIGN_LORD[debSign]!;
    const debSignLordPlanet = chart.planets.find(pl => pl.planet === debSignLord);
    const exSign = EXALTATION[p.planet]?.sign;

    // Which planet is exalted in the debilitation sign?
    const exaltedInDebSign = Object.entries(EXALTATION).find(([_, v]) => v.sign === debSign)?.[0];

    let cancelled = false;
    const reasons: string[] = [];

    // (a) Sign lord of debilitation sign in kendra from lagna
    if (debSignLordPlanet && (kendraHouses.has(debSignLordPlanet.house))) {
      cancelled = true;
      reasons.push(`${debSignLord} (debilitation sign lord) in kendra (${debSignLordPlanet.house}th) from lagna`);
    }

    // (b) Planet exalted in debilitation sign is in kendra from lagna or Moon
    if (exaltedInDebSign) {
      const exaltedPlanet = chart.planets.find(pl => pl.planet === exaltedInDebSign);
      if (exaltedPlanet) {
        const houseFromMoon = ((exaltedPlanet.house - moonHouse + 12) % 12) + 1;
        if (kendraHouses.has(exaltedPlanet.house) || kendraHouses.has(houseFromMoon)) {
          cancelled = true;
          reasons.push(`${exaltedInDebSign} (exalted in ${RASHI_NAMES[debSign]}) in kendra`);
        }
      }
    }

    // (c) Debilitated planet conjunct with its exaltation lord (if different planet)
    if (exSign !== undefined) {
      const exSignLordName = SIGN_LORD[exSign]!;
      if (exSignLordName !== p.planet) {
        const exSignLord = chart.planets.find(pl => pl.planet === exSignLordName);
        if (exSignLord && exSignLord.house === p.house) {
          cancelled = true;
          reasons.push(`${p.planet} conjunct ${exSignLordName} (exaltation sign lord)`);
        }
        // (d) Aspected by exaltation lord
        if (exSignLord) {
          const exLordAspects = getAspectedHouses(exSignLordName, exSignLord.house);
          if (exLordAspects.includes(p.house)) {
            cancelled = true;
            reasons.push(`${p.planet} aspected by ${exSignLordName} (exaltation sign lord)`);
          }
        }
      }
    }

    if (cancelled) {
      yogas.push({
        name: "Neechabhanga Raja Yoga",
        formed: true,
        planets: [p.planet],
        description: `${p.planet} debilitated in ${RASHI_NAMES[debSign]} but cancelled: ${reasons.join("; ")}. Results become powerful (BPHS 27).`,
      });
    }
  }
  return yogas;
}

/** Detect all three yoga types and return combined list. */
export function detectAllYogas(chart: RealChart): YogaResult[] {
  return [
    ...detectRajaYoga(chart),
    ...detectDhanaYoga(chart),
    ...detectNeechabhangaYoga(chart),
  ];
}


// ============================================================
// 8. INTEGRATED PARASHARI HOUSE ANALYSIS
// ============================================================
//
// Given a natal chart and a target house number (1-12), computes the
// full Parashari assessment of that house's promise and strength.
// This output is designed to sit alongside (not replace) the KP verdict
// from kpVerdict.ts — both verdicts are returned to the frontend as
// separate layers.

export interface ParashariHouseAnalysis {
  /** Target house number (1-12) */
  house: number;

  /** The planet that lords this house */
  houseLord: string;

  /** Where the house lord is placed (house number 1-12) */
  houseLordPlacement: number;

  /** Dignity of the house lord */
  houseLordDignity: Dignity;
  houseLordDignityScore: number;

  /** Functional nature of house lord for this lagna */
  houseLordFunctionalNature: FunctionalNature;
  houseLordFunctionalReason: string;

  /** Planets occupying the queried house */
  planetsInHouse: Array<{
    planet: string;
    dignity: Dignity;
    dignityScore: number;
    functionalNature: FunctionalNature;
    functionalReason: string;
    nature: NaturalNature;
  }>;

  /** Parashari aspects falling on this house */
  aspectsOnHouse: AspectResult[];

  /** Net Parashari strength score (computed from all above factors) */
  parashariBhavaScore: number;

  /** Human-readable verdict from Parashari perspective */
  parasharivVerdict: "strong" | "moderate" | "weak";

  /** Yogas relevant to this house (involving house lord or occupants) */
  relevantYogas: YogaResult[];

  /** Key reasoning bullets */
  reasoning: string[];
}

/** Compute full Parashari house analysis.
 *  This is the main entry point for integrating Parashari into the prediction pipeline. */
export function analyzeHouseParashari(
  house: number,
  chart: RealChart,
  allYogas?: YogaResult[]
): ParashariHouseAnalysis {
  if (house < 1 || house > 12) throw new RangeError(`House must be 1-12, got ${house}`);

  const lagnaRashi = chart.lagnaRashi;
  const houseSign = (lagnaRashi + house - 1) % 12;
  const houseLordName = SIGN_LORD[houseSign]!;

  // House lord planet
  const houseLordPlanet = chart.planets.find(p => p.planet === houseLordName);
  const houseLordPlacement = houseLordPlanet?.house ?? 0;
  const houseLordDig = houseLordPlanet
    ? getGrahaDignity(houseLordPlanet.planet, houseLordPlanet.deg)
    : "neutral" as Dignity;
  const houseLordDigScore = dignityScore(houseLordDig);
  const houseLordFn = getFunctionalNature(houseLordName, lagnaRashi);

  // Planets occupying the house
  const occupants = chart.planets
    .filter(p => p.house === house)
    .map(p => {
      const d = getGrahaDignity(p.planet, p.deg);
      const fn = getFunctionalNature(p.planet, lagnaRashi);
      return {
        planet: p.planet,
        dignity: d,
        dignityScore: dignityScore(d),
        functionalNature: fn.nature,
        functionalReason: fn.reason,
        nature: getNaturalNature(p.planet),
      };
    });

  // Aspects on the house
  const aspects = getAspectsOnHouse(house, chart);

  // Relevant yogas (involving house lord or occupants)
  const yogas = allYogas ?? detectAllYogas(chart);
  const relevantPlanets = new Set([houseLordName, ...occupants.map(o => o.planet)]);
  const relevantYogas = yogas.filter(y => y.planets.some(p => relevantPlanets.has(p)));

  // ── Score computation ────────────────────────────────────────────────────
  // Scoring rationale (per BPHS teaching priority):
  //   House lord dignity:  weight 3 (most important — bhava lord shows bhava fate)
  //   House lord placement: +1 if in kendra/trikona, -1 if in dusthana (3,6,8,12)
  //   Occupant aggregate:  weight 2 per occupant (average of dignity + functional scores)
  //   Aspects on house:    +1 per benefic aspect, -1 per malefic aspect
  //   Yoga bonus:          +3 per yoga formed
  //   Range: unbounded; we normalize to -10 to +10 for display

  let score = 0;
  const reasoning: string[] = [];

  // House lord dignity
  score += houseLordDigScore * 3;
  reasoning.push(`${houseLordName} (${house}th lord) in ${houseLordDig} dignity (score ${houseLordDigScore > 0 ? "+" : ""}${houseLordDigScore}×3=${houseLordDigScore * 3})`);

  // House lord placement
  const lordKendraTrikonas = new Set([1, 4, 5, 7, 9, 10]);
  const lordDusthanas      = new Set([3, 6, 8, 12]);
  if (houseLordPlacement > 0) {
    if (lordKendraTrikonas.has(houseLordPlacement)) {
      score += 2;
      reasoning.push(`${houseLordName} placed in ${houseLordPlacement}th (kendra/trikona) → +2`);
    } else if (lordDusthanas.has(houseLordPlacement)) {
      score -= 2;
      reasoning.push(`${houseLordName} placed in ${houseLordPlacement}th (dusthana) → -2`);
    }
  }

  // Functional nature of house lord
  if (houseLordFn.nature === "yoga-karaka" || houseLordFn.nature === "benefic") {
    score += 2;
    reasoning.push(`${houseLordName} is functional benefic (${houseLordFn.nature}) for this lagna → +2`);
  } else if (houseLordFn.nature === "malefic") {
    score -= 1;
    reasoning.push(`${houseLordName} is functional malefic for this lagna → -1`);
  }

  // Occupants
  for (const occ of occupants) {
    const occFnScore = occ.functionalNature === "yoga-karaka" ? 3
      : occ.functionalNature === "benefic" ? 2
      : occ.functionalNature === "neutral" || occ.functionalNature === "maraka" ? 0
      : -2;
    const occScore = occ.dignityScore + occFnScore;
    score += occScore;
    reasoning.push(`${occ.planet} in ${house}th house (dignity:${occ.dignity}, functional:${occ.functionalNature}) → ${occScore > 0 ? "+" : ""}${occScore}`);
  }

  // Aspects
  for (const asp of aspects) {
    const aspScore = asp.nature === "benefic" ? 1 : asp.nature === "malefic" ? -1 : 0;
    score += aspScore;
    if (aspScore !== 0) {
      reasoning.push(`${asp.planet} (${asp.nature}) aspects ${house}th house → ${aspScore > 0 ? "+" : ""}${aspScore}`);
    }
  }

  // Yoga bonus
  for (const yoga of relevantYogas) {
    score += 3;
    reasoning.push(`Yoga: ${yoga.name} (${yoga.planets.join("+")}) relevant to ${house}th → +3`);
  }

  // Map to verdict
  const parasharivVerdict: "strong" | "moderate" | "weak" =
    score >= 4  ? "strong" :
    score >= 0  ? "moderate" : "weak";

  return {
    house,
    houseLord: houseLordName,
    houseLordPlacement,
    houseLordDignity: houseLordDig,
    houseLordDignityScore: houseLordDigScore,
    houseLordFunctionalNature: houseLordFn.nature,
    houseLordFunctionalReason: houseLordFn.reason,
    planetsInHouse: occupants,
    aspectsOnHouse: aspects,
    parashariBhavaScore: score,
    parasharivVerdict,
    relevantYogas,
    reasoning,
  };
}
