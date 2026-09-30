// Chandrashtakavarga -- Moon's Ashtakavarga (benefic bindu count, 0-8)
//
// Source: Brihat Parashara Hora Shastra (BPHS), Ashtakavarga Adhyaya.
// The Chandrashtakavarga counts how many of 8 reference points (7 planets +
// Lagna) cast a benefic point into the sign where the transit Moon falls.
//
// For each reference R at natal sign S_R, we look at the house position H of
// the current transit Moon's sign from S_R (counting S_R itself as house 1).
// If H is in the benefic house list for R, add 1 bindu.
//
// Classical benefic house lists (BPHS, Chandrashtakavarga shloka):
//   Moon's own:  1, 3, 6, 7, 10, 11
//   Sun:         3, 6, 10, 11, 12
//   Mars:        2, 3, 5, 6, 9, 10, 11
//   Mercury:     1, 3, 4, 5, 7, 8, 10, 11
//   Jupiter:     1, 4, 7, 8, 10, 11, 12
//   Venus:       3, 4, 5, 7, 9, 10, 11
//   Saturn:      3, 5, 6, 11
//   Lagna:       3, 6, 10, 11
//
// Maximum score = 8 (all 8 contribute). Typical scores 3-5 are neutral.
// Score ≥ 5 → strengthened transit; ≤ 2 → weakened transit.

import type { RealChart } from "./astro";

// House lists from BPHS (1-indexed; H = (transit_sign - natal_sign + 12) % 12 + 1)
const CHANDRA_BENEFIC_HOUSES: Record<string, Set<number>> = {
  Moon:    new Set([1, 3, 6, 7, 10, 11]),
  Sun:     new Set([3, 6, 10, 11, 12]),
  Mars:    new Set([2, 3, 5, 6, 9, 10, 11]),
  Mercury: new Set([1, 3, 4, 5, 7, 8, 10, 11]),
  Jupiter: new Set([1, 4, 7, 8, 10, 11, 12]),
  Venus:   new Set([3, 4, 5, 7, 9, 10, 11]),
  Saturn:  new Set([3, 5, 6, 11]),
  Lagna:   new Set([3, 6, 10, 11]),
};

/**
 * Compute Chandrashtakavarga bindu count for the Moon's current transit sign.
 *
 * @param natalChart  Birth chart built by buildRealChart() -- used for natal planet positions.
 * @param transitMoonRashi  Current Moon's sign (0-11, sidereal).
 * @returns  Bindu count 0-8.
 */
export function computeChandrashtakavarga(natalChart: RealChart, transitMoonRashi: number): number {
  let bindus = 0;

  // 7 planets from natal chart
  for (const ref of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const) {
    const planet = natalChart.planets.find((p) => p.planet === ref);
    if (!planet) continue;
    const natalSign = planet.rashi; // 0-11
    const housePos = (transitMoonRashi - natalSign + 12) % 12 + 1; // 1-12
    const beneficSet = CHANDRA_BENEFIC_HOUSES[ref];
    if (beneficSet && beneficSet.has(housePos)) {
      bindus += 1;
    }
  }

  // Lagna reference
  const lagnaSign = natalChart.lagnaRashi; // 0-11
  const lagnaHouse = (transitMoonRashi - lagnaSign + 12) % 12 + 1;
  if (CHANDRA_BENEFIC_HOUSES["Lagna"]!.has(lagnaHouse)) {
    bindus += 1;
  }

  return Math.min(bindus, 8); // guard: should never exceed 8
}
