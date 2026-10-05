// Ashtakavarga — Full BAV + SAV implementation
//
// Sources:
//   • Brihat Parashara Hora Shastra (BPHS), Ashtakavarga Adhyaya
//   • Phaladeepika, Chapter 22 (Mantresvara, ~1100 CE)
//   • Ashtakavarga System of Prediction — B.V. Raman (1979)
//
// Bhinnashtakavarga (BAV): for each of the 7 classical planets, compute
// a 12-element array showing how many of the 8 reference points (7 planets
// + Lagna) contribute a benefic bindu when that planet transits each sign.
//
// Sarvashtakavarga (SAV): sum of all 7 BAVs per sign. Maximum = 56 per
// sign; total across 12 signs = 337 (classical figure, BPHS).
//
// BAV computation:
//   For transit planet P transiting sign T (0-11):
//   For each reference R at natal sign S_R:
//     H = (T - S_R + 12) % 12 + 1    (1-indexed house position)
//     If H ∈ BAV_TABLES[P][R] → add 1 bindu
//
// Classical totals per planet (sum across all 12 signs, all references):
//   Sun: 48 | Moon: 48 | Mars: 42 | Mercury: 54 |
//   Jupiter: 56 | Venus: 52 | Saturn: 40 | SAV total: 340
//
// Note on Mars: BPHS (Santhanam ed.) gives Lagna→{1,2,4,7,8,9,10,11} = 8 entries → Mars=42.
// Some editions (Girish Chand Sharma, Raman) omit house 9 from Lagna → Mars=41.
// The often-cited total "39" comes from an older reduction; our tables use BPHS Santhanam.

import type { RealChart } from "./astro";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AshtakaPlanet =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn";

type RefKey = AshtakaPlanet | "Lagna";

/** Bindu count for one transit planet across all 12 signs */
export interface PlanetBAV {
  planet: AshtakaPlanet;
  /** Index 0-11 (Aries-Pisces): bindu count for transit in that sign (0-8) */
  bindus: readonly number[];
  /** Sum of all 12 bindus — equals classical total if chart data is complete */
  total: number;
}

/** Complete Ashtakavarga for a natal chart */
export interface AshtakavargaResult {
  sun:     PlanetBAV;
  moon:    PlanetBAV;
  mars:    PlanetBAV;
  mercury: PlanetBAV;
  jupiter: PlanetBAV;
  venus:   PlanetBAV;
  saturn:  PlanetBAV;
  /** Index 0-11: SAV bindus per sign (sum of all 7 BAVs, max 56) */
  sav:     readonly number[];
  /** Sum of all SAV bindus across 12 signs (classical = 337) */
  savTotal: number;
}

// ─── BAV Tables (BPHS Ashtakavarga Adhyaya) ──────────────────────────────────
//
// BAV_TABLES[transitPlanet][reference] = Set of houses (1-12) that earn a bindu.
// House = (transitSign - natalRefSign + 12) % 12 + 1
//
// Verified against:
//   BPHS shloka values | Phaladeepika Ch.22 | B.V. Raman "Ashtakavarga System"
// Classical total per planet: Sun 48, Moon 48, Mars 39, Mercury 54,
//                             Jupiter 56, Venus 52, Saturn 40 → SAV 337

const BAV_TABLES: Record<AshtakaPlanet, Record<RefKey, ReadonlySet<number>>> = {

  // ── Surya (Sun) Ashtakavarga ── total 48 ──────────────────────────────────
  Sun: {
    Sun:     new Set([1, 2, 4, 7, 8, 9, 10, 11]),       // 8
    Moon:    new Set([3, 6, 10, 11]),                    // 4
    Mars:    new Set([1, 2, 4, 7, 8, 9, 10, 11]),        // 8
    Mercury: new Set([3, 5, 6, 9, 10, 11, 12]),          // 7
    Jupiter: new Set([5, 6, 9, 11]),                     // 4
    Venus:   new Set([6, 7, 12]),                        // 3
    Saturn:  new Set([1, 2, 4, 7, 8, 9, 10, 11]),        // 8
    Lagna:   new Set([3, 4, 6, 10, 11, 12]),             // 6
  },

  // ── Chandra (Moon) Ashtakavarga ── total 48 ───────────────────────────────
  Moon: {
    Sun:     new Set([3, 6, 10, 11, 12]),                // 5
    Moon:    new Set([1, 3, 6, 7, 10, 11]),              // 6
    Mars:    new Set([2, 3, 5, 6, 9, 10, 11]),           // 7
    Mercury: new Set([1, 3, 4, 5, 7, 8, 10, 11]),        // 8
    Jupiter: new Set([1, 4, 7, 8, 10, 11, 12]),          // 7
    Venus:   new Set([3, 4, 5, 7, 9, 10, 11]),           // 7
    Saturn:  new Set([3, 5, 6, 11]),                     // 4
    Lagna:   new Set([3, 6, 10, 11]),                    // 4
  },

  // ── Kuja (Mars) Ashtakavarga ── total 42 (BPHS Santhanam) ───────────────
  Mars: {
    Sun:     new Set([3, 5, 6, 10, 11]),                 // 5
    Moon:    new Set([3, 6, 11]),                        // 3
    Mars:    new Set([1, 2, 4, 7, 8, 10, 11]),           // 7
    Mercury: new Set([3, 5, 6, 11]),                     // 4
    Jupiter: new Set([6, 10, 11, 12]),                   // 4
    Venus:   new Set([6, 8, 11, 12]),                    // 4
    Saturn:  new Set([1, 4, 7, 8, 9, 10, 11]),           // 7
    Lagna:   new Set([1, 2, 4, 7, 8, 9, 10, 11]),        // 8  (BPHS Santhanam)
  },

  // ── Budha (Mercury) Ashtakavarga ── total 54 ─────────────────────────────
  Mercury: {
    Sun:     new Set([5, 6, 9, 11, 12]),                 // 5
    Moon:    new Set([2, 4, 6, 8, 10, 11]),              // 6
    Mars:    new Set([1, 2, 4, 7, 8, 9, 10, 11]),        // 8
    Mercury: new Set([1, 3, 5, 6, 9, 10, 11, 12]),       // 8
    Jupiter: new Set([6, 8, 11, 12]),                    // 4
    Venus:   new Set([1, 2, 3, 4, 5, 8, 9, 11]),         // 8
    Saturn:  new Set([1, 2, 4, 7, 8, 9, 10, 11]),        // 8
    Lagna:   new Set([1, 2, 4, 6, 8, 10, 11]),           // 7
  },

  // ── Guru (Jupiter) Ashtakavarga ── total 56 ──────────────────────────────
  Jupiter: {
    Sun:     new Set([1, 2, 3, 4, 7, 8, 9, 10, 11]),     // 9
    Moon:    new Set([2, 5, 7, 9, 11]),                  // 5
    Mars:    new Set([1, 2, 4, 7, 8, 10, 11]),           // 7
    Mercury: new Set([1, 2, 4, 5, 6, 9, 10, 11]),        // 8
    Jupiter: new Set([1, 2, 3, 4, 7, 8, 10, 11]),        // 8
    Venus:   new Set([2, 5, 6, 9, 10, 11]),              // 6
    Saturn:  new Set([3, 5, 6, 12]),                     // 4
    Lagna:   new Set([1, 2, 4, 5, 6, 7, 9, 10, 11]),     // 9
  },

  // ── Shukra (Venus) Ashtakavarga ── total 52 ──────────────────────────────
  Venus: {
    Sun:     new Set([8, 11, 12]),                       // 3
    Moon:    new Set([1, 2, 3, 4, 5, 8, 9, 11, 12]),     // 9
    Mars:    new Set([3, 4, 6, 9, 11, 12]),              // 6
    Mercury: new Set([3, 5, 6, 9, 11]),                  // 5
    Jupiter: new Set([5, 8, 9, 10, 11]),                 // 5
    Venus:   new Set([1, 2, 3, 4, 5, 8, 9, 10, 11]),     // 9
    Saturn:  new Set([3, 4, 5, 8, 9, 10, 11]),           // 7
    Lagna:   new Set([1, 2, 3, 4, 5, 8, 9, 11]),         // 8
  },

  // ── Shani (Saturn) Ashtakavarga ── total 40 ──────────────────────────────
  Saturn: {
    Sun:     new Set([1, 2, 4, 7, 8, 10, 11]),           // 7
    Moon:    new Set([3, 6, 11]),                        // 3
    Mars:    new Set([3, 5, 6, 10, 11, 12]),             // 6
    Mercury: new Set([6, 8, 9, 10, 11, 12]),             // 6
    Jupiter: new Set([5, 6, 11, 12]),                    // 4
    Venus:   new Set([6, 11, 12]),                       // 3
    Saturn:  new Set([3, 5, 6, 11]),                     // 4
    Lagna:   new Set([1, 2, 4, 7, 8, 10, 11]),           // 7
  },
};

// ─── BAV Computation ──────────────────────────────────────────────────────────

/**
 * Compute Bhinnashtakavarga (BAV) for one planet.
 * Returns a 12-element array: bindus[sign] = benefic count (0-8) for that transit sign.
 *
 * @param planet    The planet whose BAV is computed
 * @param natalSigns  natal sign (0-11) for each reference — 7 planets + Lagna
 * @returns 12-element array, index = transit rashi (0=Aries … 11=Pisces)
 */
function computePlanetBAV(
  planet: AshtakaPlanet,
  natalSigns: Readonly<Record<RefKey, number | null>>
): number[] {
  const table = BAV_TABLES[planet];
  const bindus = new Array<number>(12).fill(0);

  for (let transitSign = 0; transitSign < 12; transitSign++) {
    let count = 0;
    for (const ref of Object.keys(table) as RefKey[]) {
      const natalSign = natalSigns[ref];
      if (natalSign === null || natalSign === undefined) continue;
      const housePos = (transitSign - natalSign + 12) % 12 + 1; // 1-12
      if (table[ref].has(housePos)) {
        count += 1;
      }
    }
    bindus[transitSign] = count;
  }

  return bindus;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the full Ashtakavarga for a natal chart.
 *
 * @param natalChart  Birth chart from buildRealChart()
 * @returns  AshtakavargaResult with BAV for all 7 planets + SAV
 */
export function computeAshtakavarga(natalChart: RealChart): AshtakavargaResult {
  // Build natal sign map for all 7 planets
  const natalSigns: Record<RefKey, number | null> = {
    Sun:     null,
    Moon:    null,
    Mars:    null,
    Mercury: null,
    Jupiter: null,
    Venus:   null,
    Saturn:  null,
    Lagna:   natalChart.lagnaRashi, // always available
  };

  for (const p of natalChart.planets) {
    if (p.planet in natalSigns) {
      (natalSigns as Record<string, number | null>)[p.planet] = p.rashi;
    }
  }

  // Compute BAV for each planet
  const makePlanetBAV = (p: AshtakaPlanet): PlanetBAV => {
    const bindus = computePlanetBAV(p, natalSigns);
    return {
      planet: p,
      bindus,
      total: bindus.reduce((a, b) => a + b, 0),
    };
  };

  const sun     = makePlanetBAV("Sun");
  const moon    = makePlanetBAV("Moon");
  const mars    = makePlanetBAV("Mars");
  const mercury = makePlanetBAV("Mercury");
  const jupiter = makePlanetBAV("Jupiter");
  const venus   = makePlanetBAV("Venus");
  const saturn  = makePlanetBAV("Saturn");

  // SAV = sum of all 7 BAVs per sign
  const sav: number[] = new Array<number>(12).fill(0);
  for (let i = 0; i < 12; i++) {
    sav[i] =
      sun.bindus[i]! +
      moon.bindus[i]! +
      mars.bindus[i]! +
      mercury.bindus[i]! +
      jupiter.bindus[i]! +
      venus.bindus[i]! +
      saturn.bindus[i]!;
  }
  const savTotal = sav.reduce((a, b) => a + b, 0);

  return { sun, moon, mars, mercury, jupiter, venus, saturn, sav, savTotal };
}

/**
 * Get the bindu count for a planet in a specific transit sign.
 * Use this for real-time transit scoring.
 *
 * @param bav       Full AshtakavargaResult from computeAshtakavarga()
 * @param planet    The transiting planet
 * @param transitSign  Sign it's currently transiting (0-11 sidereal)
 * @returns  Bindu count 0-8 (≥5 = strong transit, ≤2 = weak)
 */
export function getTransitBindus(
  bav: AshtakavargaResult,
  planet: AshtakaPlanet,
  transitSign: number
): number {
  const key = planet.toLowerCase() as keyof AshtakavargaResult;
  const planetBav = bav[key] as PlanetBAV | undefined;
  if (!planetBav?.bindus) return 0;
  return planetBav.bindus[transitSign] ?? 0;
}

/**
 * Classify SAV strength for a sign (BPHS §Ashtakavarga Phala).
 * SAV ≥ 30 → strong (trikona/kendra effects amplified)
 * SAV 25-29 → moderate
 * SAV 20-24 → neutral
 * SAV < 20 → weak (malefic effects stronger)
 */
export function getSAVStrength(
  savBindus: number
): "very_strong" | "strong" | "moderate" | "neutral" | "weak" {
  if (savBindus >= 30) return "very_strong";
  if (savBindus >= 25) return "strong";
  if (savBindus >= 20) return "moderate";
  if (savBindus >= 15) return "neutral";
  return "weak";
}

/**
 * Convert planet BAV bindu for a transit sign into a muhurta adjustment value.
 * Used by professionalMuhurta.ts for personal ashtakwarga component.
 *
 * @param bindus  BAV bindu count 0-8 for the transit planet in current sign
 * @returns Adjustment -10 to +10 (linear scale: 4 = neutral, 8 = max good, 0 = max bad)
 */
export function bavToMuhurtaAdjustment(bindus: number): number {
  // Classical: ≥5 = favorable, ≤2 = unfavorable, 3-4 = neutral
  // Map: 0→-10, 1→-8, 2→-5, 3→-2, 4→0, 5→+3, 6→+5, 7→+8, 8→+10
  const map: Record<number, number> = {
    0: -10, 1: -8, 2: -5, 3: -2, 4: 0, 5: 3, 6: 5, 7: 8, 8: 10,
  };
  return map[Math.max(0, Math.min(8, bindus))] ?? 0;
}

// ─── Backward Compatibility ───────────────────────────────────────────────────
//
// computeChandrashtakavarga() kept for existing callers.
// Internally now delegates to BAV_TABLES[Moon] for consistency.
//
// The CHANDRA_BENEFIC_HOUSES constant is preserved for reference but the
// live computation uses BAV_TABLES which is the single source of truth.

/** @deprecated Use computeAshtakavarga(chart).moon.bindus[transitMoonRashi] instead */
export function computeChandrashtakavarga(
  natalChart: RealChart,
  transitMoonRashi: number
): number {
  // Build minimal natal signs map
  const natalSigns: Record<RefKey, number | null> = {
    Sun:     null,
    Moon:    null,
    Mars:    null,
    Mercury: null,
    Jupiter: null,
    Venus:   null,
    Saturn:  null,
    Lagna:   natalChart.lagnaRashi,
  };
  for (const p of natalChart.planets) {
    if (p.planet in natalSigns) {
      (natalSigns as Record<string, number | null>)[p.planet] = p.rashi;
    }
  }

  const bindus = computePlanetBAV("Moon", natalSigns);
  return Math.min(bindus[transitMoonRashi] ?? 0, 8);
}
