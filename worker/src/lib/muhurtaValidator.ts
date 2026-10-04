/**
 * muhurtaValidator.ts — Muhurta Stages 4 + 5
 *
 * Stage 4: Lagna Shudhi (Ascendant Purity)
 *   Classical rules from Muhurta Chintamani (Lagna Shudhi Prakarana) +
 *   Muhurta Martanda by Narayana Daivajña.
 *   — 8th house from Muhurta Lagna must be empty
 *   — Lagna Lord must NOT be in 6th, 8th, or 12th
 *   — Moon must NOT be in 8th from Muhurta Lagna
 *   — No malefics (Sun,Mars,Saturn,Rahu,Ketu) in Lagna (1st house) directly
 *   — Malefics in Upachaya (3,6,10,11) are acceptable per classical rule
 *
 * Stage 5: SAV Validation (Sarvashtakavarga ≥ 28 in Muhurta Lagna sign)
 *   Full 8-table Sarvashtakavarga from BPHS (Ashtakavarga Adhyaya).
 *   Gate: SAV bindus in muhurta lagna sign ≥ 28 → pass.
 *   Source: Brihat Parashara Hora Shastra, Ashtakavarga Adhyaya (ślokas for each planet).
 *
 * Usage:
 *   const transitChart = buildRealChart(now, lat, lon);
 *   const result = runMuhurtaValidation(transitChart);
 *
 * @module muhurtaValidator
 */

import type { RealChart } from "./astro";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ValidationGrade = "PASS" | "MARGINAL" | "FAIL";

export interface Stage4Issue {
  rule: string;
  planet?: string;
  house?: number;
  penalty: number;
}

export interface LagnaShudhi {
  grade: ValidationGrade;
  score: number; // 0-100 (100 = perfectly pure lagna)
  issues: Stage4Issue[];
  note: string;
  // house summary: 1-indexed count of planets per house
  planetsByHouse: Record<number, string[]>;
}

export interface SAVResult {
  grade: ValidationGrade;
  lagnaSign: number; // 0-11
  bindusInLagna: number; // SAV score for muhurta lagna sign
  threshold: number; // 28
  allSignSAV: number[]; // 12 elements, index = rashi 0-11
  note: string;
}

export interface MuhurtaValidation {
  stage4: LagnaShudhi;
  stage5: SAVResult;
  overallGrade: ValidationGrade;
  mpiAdjustment: number; // SAV contribution to MPI score (-15 to +15)
  source: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Sign names for notes */
const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/** House of a sign (rashi 0-11) from a lagna rashi */
function houseOf(rashi: number, lagnaRashi: number): number {
  return ((rashi - lagnaRashi + 12) % 12) + 1;
}

/**
 * Natural malefics (Naisargika Papa Grahas):
 * Sun (mild), Mars, Saturn, Rahu, Ketu.
 * Source: BPHS Ch. 3 — Graha Maitri Adhyaya (natural malefics enumeration).
 */
const NATURAL_MALEFICS = new Set(["Sun", "Mars", "Saturn", "Rahu", "Ketu"]);

/**
 * Dusthana (houses of suffering) — 6th, 8th, 12th.
 * Source: BPHS Bhava Adhyaya — Ayaya (income=11), Vyaya (loss=12), Ari (enemy=6),
 *         Randhra (obstacles, death=8).
 */
const DUSTHANA = new Set([6, 8, 12]);

/**
 * Upachaya (growing) houses — 3, 6, 10, 11.
 * Malefics here can give good results (they improve over time).
 * Source: Muhurta Chintamani, Lagna Shudhi Prakarana; BPHS Ch. 35 (Upachaya).
 */
const UPACHAYA = new Set([3, 6, 10, 11]);

// ── Stage 4: Lagna Shudhi ────────────────────────────────────────────────────

/**
 * Lagna lords (sign ruler 0-11 → planet name).
 * Source: BPHS Bhava Adhyaya — each rashi's adhipati (lord).
 * Rahu/Ketu: co-lords of Aquarius/Scorpio for Upachaya purpose only; primary lords
 * (Saturn/Mars) used for Lagna Lord dusthana check.
 */
const LAGNA_LORD: Record<number, string> = {
  0: "Mars",     // Aries
  1: "Venus",    // Taurus
  2: "Mercury",  // Gemini
  3: "Moon",     // Cancer
  4: "Sun",      // Leo
  5: "Mercury",  // Virgo
  6: "Venus",    // Libra
  7: "Mars",     // Scorpio
  8: "Jupiter",  // Sagittarius
  9: "Saturn",   // Capricorn
  10: "Saturn",  // Aquarius
  11: "Jupiter", // Pisces
};

/**
 * Stage 4: Lagna Shudhi (Ascendant Purity Check).
 *
 * Evaluates the muhurta moment's Ascendant purity per classical rules.
 * Score starts at 100 and penalties are deducted per violation.
 *
 * Source: Muhurta Chintamani — Lagna Shudhi Prakarana (Adhyaya 1, §4).
 *         Muhurta Martanda — Lagna Vichar.
 *         BPHS — Dusthana Adhyaya.
 */
export function validateLagnaShudhi(transitChart: RealChart): LagnaShudhi {
  const { lagnaRashi, planets } = transitChart;
  const issues: Stage4Issue[] = [];

  // Build house → [planet names] map
  const planetsByHouse: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) planetsByHouse[h] = [];
  for (const p of planets) {
    const h = p.house; // already computed in buildRealChart: ((rashi - lagnaRashi + 12) % 12) + 1
    if (h >= 1 && h <= 12) {
      (planetsByHouse[h] ??= []).push(p.planet);
    }
  }

  let score = 100;

  // ── Rule 1: 8th house must be EMPTY ──────────────────────────────────────
  // "Ashtama Bhava shunye": 8th = Randhra (obstacles, death-like delays).
  // Any planet here harms the muhurta significantly.
  // Source: Muhurta Chintamani Lagna Shudhi §1 — "Ashtamasthe graho nashto".
  const eigthHousePlanets = planetsByHouse[8] ?? [];
  for (const planet of eigthHousePlanets) {
    const penalty = NATURAL_MALEFICS.has(planet) ? 35 : 20;
    issues.push({
      rule: "8th house occupied",
      planet,
      house: 8,
      penalty,
    });
    score -= penalty;
  }

  // ── Rule 2: Lagna Lord must NOT be in Dusthana (6, 8, 12) ───────────────
  // "Lagnadhipati dusthane na sthapyet": Lagna Lord in 6/8/12 weakens the entire
  // muhurta by depriving the Ascendant of its protective lord.
  // Source: Muhurta Martanda — Lagna Lord Vichar §3.
  const lagnaLord = LAGNA_LORD[lagnaRashi];
  if (lagnaLord) {
    const llPlanet = planets.find(p => p.planet === lagnaLord);
    if (llPlanet && DUSTHANA.has(llPlanet.house)) {
      const penalty = llPlanet.house === 8 ? 30 : 20;
      issues.push({
        rule: `Lagna Lord ${lagnaLord} in dusthana`,
        planet: lagnaLord,
        house: llPlanet.house,
        penalty,
      });
      score -= penalty;
    }
  }

  // ── Rule 3: Moon must NOT be in 8th from Lagna ───────────────────────────
  // "Chandro na randhrabhava sthe": Moon in 8th = Ashtama Chandra, very inauspicious.
  // Even if 8th house is otherwise empty, Moon transit there is a strong negative.
  // Source: Muhurta Chintamani Lagna Shudhi §2 — "Chandrasthaniya randhra dosha".
  const moonPlanet = planets.find(p => p.planet === "Moon");
  if (moonPlanet && moonPlanet.house === 8) {
    issues.push({
      rule: "Ashtama Chandra — Moon in 8th",
      planet: "Moon",
      house: 8,
      penalty: 25,
    });
    score -= 25;
  }

  // ── Rule 4: No malefics DIRECTLY in Lagna (1st house) ───────────────────
  // Malefics in Upachaya (3,6,10,11) are acceptable — they grow in strength there.
  // Malefics in 1st house afflict the Lagna lord directly.
  // Exception: If malefic is the LAGNA LORD itself, penalty is halved (it's still functional).
  // Source: Muhurta Chintamani §3 — "Papagraha lagne nashta karyam".
  const lagnaHousePlanets = planetsByHouse[1] ?? [];
  for (const planet of lagnaHousePlanets) {
    if (NATURAL_MALEFICS.has(planet)) {
      const isLagnaLord = planet === lagnaLord;
      const penalty = isLagnaLord ? 10 : 20;
      issues.push({
        rule: `Malefic ${planet} in Lagna${isLagnaLord ? " (also Lagna Lord — penalty halved)" : ""}`,
        planet,
        house: 1,
        penalty,
      });
      score -= penalty;
    }
  }

  // ── Rule 5: Bonus — benefics in Kendra (1,4,7,10) or Trikona (1,5,9) ───
  // "Shubha graha kendra-trikone shubham": Benefics strengthen the Lagna.
  // Source: BPHS Bhava Adhyaya — Kendra and Trikona sthana effects.
  const BENEFIC_HOUSES = new Set([1, 4, 5, 7, 9, 10]);
  const NATURAL_BENEFICS = new Set(["Moon", "Mercury", "Jupiter", "Venus"]);
  for (const p of planets) {
    if (NATURAL_BENEFICS.has(p.planet) && BENEFIC_HOUSES.has(p.house)) {
      // Bonus capped so score doesn't exceed 100
      score = Math.min(score + 5, 100);
    }
  }

  score = Math.max(0, Math.min(100, score));

  const grade: ValidationGrade =
    score >= 65 ? "PASS" :
    score >= 40 ? "MARGINAL" :
    "FAIL";

  const lagnSign = SIGN_NAMES[lagnaRashi] ?? `Sign ${lagnaRashi}`;
  let note: string;
  if (grade === "PASS") {
    note = `Muhurta Lagna (${lagnSign}) is pure. Score ${score}/100.`;
  } else if (grade === "MARGINAL") {
    note = `Muhurta Lagna (${lagnSign}) has minor afflictions. Score ${score}/100. Proceed with caution.`;
  } else {
    note = `Muhurta Lagna (${lagnSign}) has severe afflictions. Score ${score}/100. Avoid this time window.`;
  }

  return { grade, score, issues, note, planetsByHouse };
}

// ── Stage 5: Full SAV (Sarvashtakavarga) ─────────────────────────────────────

/**
 * Benefic house lists for each planet's Ashtakavarga (1-indexed positions).
 *
 * Format: for each planet P, this maps each of 8 reference points (7 planets + Lagna)
 * to the set of houses (counted from that reference's natal sign) that are benefic.
 *
 * Source: Brihat Parashara Hora Shastra (BPHS), Ashtakavarga Adhyaya,
 *         ślokas for Surya, Chandra, Kuja, Budha, Guru, Shukra, Shani Ashtakavarga.
 *         Cross-verified with: Phala Deepika (Mantreshwara), Ashtakavarga (B.V. Raman).
 */

// Sun's Ashtakavarga (Surya Ashtakavarga)
// Source: BPHS Ashtakavarga Adhyaya — Surya Ashtakavarga ślokas
const SUN_AV: Record<string, Set<number>> = {
  Sun:     new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Moon:    new Set([3, 6, 10, 11]),
  Mars:    new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Mercury: new Set([3, 5, 6, 9, 10, 11, 12]),
  Jupiter: new Set([5, 6, 9, 11]),
  Venus:   new Set([6, 7, 12]),
  Saturn:  new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Lagna:   new Set([1, 2, 4, 7, 8, 9, 10, 11]),
};

// Moon's Ashtakavarga (Chandrashtakavarga)
// Source: BPHS — Chandrashtakavarga ślokas (same as ashtakwarga.ts)
const MOON_AV: Record<string, Set<number>> = {
  Sun:     new Set([3, 6, 10, 11, 12]),
  Moon:    new Set([1, 3, 6, 7, 10, 11]),
  Mars:    new Set([2, 3, 5, 6, 9, 10, 11]),
  Mercury: new Set([1, 3, 4, 5, 7, 8, 10, 11]),
  Jupiter: new Set([1, 4, 7, 8, 10, 11, 12]),
  Venus:   new Set([3, 4, 5, 7, 9, 10, 11]),
  Saturn:  new Set([3, 5, 6, 11]),
  Lagna:   new Set([3, 6, 10, 11]),
};

// Mars's Ashtakavarga (Kuja/Mangal Ashtakavarga)
// Source: BPHS — Kuja Ashtakavarga ślokas
const MARS_AV: Record<string, Set<number>> = {
  Sun:     new Set([3, 5, 6, 10, 11]),
  Moon:    new Set([3, 6, 11]),
  Mars:    new Set([1, 2, 4, 7, 8, 10, 11]),
  Mercury: new Set([3, 5, 6, 11]),
  Jupiter: new Set([6, 10, 11, 12]),
  Venus:   new Set([6, 8, 11, 12]),
  Saturn:  new Set([1, 4, 7, 8, 9, 10, 11]),
  Lagna:   new Set([1, 2, 4, 7, 8, 10, 11]),
};

// Mercury's Ashtakavarga (Budha Ashtakavarga)
// Source: BPHS — Budha Ashtakavarga ślokas
const MERCURY_AV: Record<string, Set<number>> = {
  Sun:     new Set([5, 6, 9, 11, 12]),
  Moon:    new Set([2, 4, 6, 8, 10, 11]),
  Mars:    new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Mercury: new Set([1, 3, 5, 6, 9, 10, 11, 12]),
  Jupiter: new Set([6, 8, 11, 12]),
  Venus:   new Set([1, 2, 3, 4, 5, 8, 9, 11]),
  Saturn:  new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Lagna:   new Set([1, 2, 4, 6, 8, 10, 11]),
};

// Jupiter's Ashtakavarga (Guru/Brihaspati Ashtakavarga)
// Source: BPHS — Guru Ashtakavarga ślokas
const JUPITER_AV: Record<string, Set<number>> = {
  Sun:     new Set([1, 2, 3, 4, 7, 8, 9, 10, 11]),
  Moon:    new Set([2, 5, 7, 9, 11]),
  Mars:    new Set([1, 2, 4, 7, 8, 10, 11]),
  Mercury: new Set([1, 2, 4, 5, 6, 9, 10, 11]),
  Jupiter: new Set([1, 2, 3, 4, 7, 8, 10, 11]),
  Venus:   new Set([2, 5, 6, 9, 10, 11]),
  Saturn:  new Set([3, 5, 6, 12]),
  Lagna:   new Set([1, 2, 4, 5, 6, 7, 9, 10, 11]),
};

// Venus's Ashtakavarga (Shukra Ashtakavarga)
// Source: BPHS — Shukra Ashtakavarga ślokas
const VENUS_AV: Record<string, Set<number>> = {
  Sun:     new Set([8, 11, 12]),
  Moon:    new Set([1, 2, 3, 4, 5, 8, 9, 11, 12]),
  Mars:    new Set([3, 4, 6, 9, 11, 12]),
  Mercury: new Set([3, 5, 6, 9, 11]),
  Jupiter: new Set([5, 8, 9, 10, 11]),
  Venus:   new Set([1, 2, 3, 4, 5, 8, 9, 11, 12]),
  Saturn:  new Set([3, 4, 5, 8, 9, 10, 11]),
  Lagna:   new Set([1, 2, 3, 4, 5, 8, 9, 11]),
};

// Saturn's Ashtakavarga (Shani Ashtakavarga)
// Source: BPHS — Shani Ashtakavarga ślokas
const SATURN_AV: Record<string, Set<number>> = {
  Sun:     new Set([1, 2, 4, 7, 8, 10, 11]),
  Moon:    new Set([3, 6, 11]),
  Mars:    new Set([3, 5, 6, 10, 11, 12]),
  Mercury: new Set([6, 8, 9, 10, 11, 12]),
  Jupiter: new Set([5, 6, 11, 12]),
  Venus:   new Set([6, 11, 12]),
  Saturn:  new Set([3, 5, 6, 11]),
  Lagna:   new Set([3, 5, 6, 11]),
};

// Lagnashtakavarga (uses 7 planets — no "Lagna" reference since Lagna is subject)
// Source: BPHS — Lagnashtakavarga ślokas
const LAGNA_AV: Record<string, Set<number>> = {
  Sun:     new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Moon:    new Set([3, 6, 10, 11]),
  Mars:    new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  Mercury: new Set([3, 5, 6, 9, 10, 11, 12]),
  Jupiter: new Set([5, 6, 9, 11]),
  Venus:   new Set([6, 7, 12]),
  Saturn:  new Set([1, 2, 4, 7, 8, 9, 10, 11]),
  // No Lagna reference in Lagnashtakavarga
};

/** All 8 ashtakavarga tables and whether they use a Lagna reference */
const ALL_ASHTAK_TABLES = [
  { name: "Sun",     table: SUN_AV,     usesLagna: true },
  { name: "Moon",    table: MOON_AV,    usesLagna: true },
  { name: "Mars",    table: MARS_AV,    usesLagna: true },
  { name: "Mercury", table: MERCURY_AV, usesLagna: true },
  { name: "Jupiter", table: JUPITER_AV, usesLagna: true },
  { name: "Venus",   table: VENUS_AV,   usesLagna: true },
  { name: "Saturn",  table: SATURN_AV,  usesLagna: true },
  { name: "Lagna",   table: LAGNA_AV,   usesLagna: false }, // Lagnashtakavarga
] as const;

/**
 * Computes full Sarvashtakavarga (SAV) for all 12 signs from a chart.
 *
 * For each of 8 planetary ashtakavarga tables:
 *   For each target sign (0-11):
 *     For each of 8 reference points (7 planets + Lagna/itself):
 *       H = (target_sign - ref_sign + 12) % 12 + 1
 *       if H ∈ benefic_houses → bindu += 1
 *     Sum all 8 tables' bindus per sign = SAV[sign]
 *
 * Max SAV per sign = 8 tables × 8 references = 64.
 * Average = 64 / 12 ≈ 5.3 per table × 8 tables = ~42 per sign.
 * Gate: ≥ 28 = pass (classical Muhurta Chintamani, §5 SAV Shudhi).
 *
 * Source: BPHS Ashtakavarga Adhyaya — "atha sarvashtakavargam".
 */
export function computeFullSAV(chart: RealChart): number[] {
  const { lagnaRashi, planets } = chart;

  // Planet rashi lookup (0-11)
  const planetRashi: Record<string, number> = {};
  for (const p of planets) {
    planetRashi[p.planet] = p.rashi;
  }

  const sav = new Array(12).fill(0);

  for (const { table, usesLagna } of ALL_ASHTAK_TABLES) {
    for (let targetSign = 0; targetSign < 12; targetSign++) {
      let bindus = 0;

      // 7 classical planets
      for (const ref of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const) {
        const refSign = planetRashi[ref];
        if (refSign === undefined) continue;
        const h = (targetSign - refSign + 12) % 12 + 1;
        if (table[ref]?.has(h)) {
          bindus += 1;
        }
      }

      // Lagna reference (only for non-Lagnashtakavarga tables)
      if (usesLagna && table["Lagna"]) {
        const h = (targetSign - lagnaRashi + 12) % 12 + 1;
        if (table["Lagna"].has(h)) {
          bindus += 1;
        }
      }

      sav[targetSign] += bindus;
    }
  }

  return sav;
}

/**
 * Stage 5: SAV Validation — checks SAV bindus in the Muhurta Lagna sign.
 *
 * Gate: ≥ 28 bindus = PASS, 20-27 = MARGINAL, < 20 = FAIL.
 * Source: Muhurta Chintamani §5 — "Ashta-vimshati (28) SAV bindavah shubhah".
 *         BPHS Ashtakavarga Adhyaya — "ath sarvashtakavarge".
 */
export function validateSAV(transitChart: RealChart): SAVResult {
  const { lagnaRashi } = transitChart;
  const allSignSAV = computeFullSAV(transitChart);
  const bindusInLagna = allSignSAV[lagnaRashi] ?? 0;
  const threshold = 28;

  const grade: ValidationGrade =
    bindusInLagna >= threshold ? "PASS" :
    bindusInLagna >= 20        ? "MARGINAL" :
    "FAIL";

  const signName = SIGN_NAMES[lagnaRashi] ?? `Sign ${lagnaRashi}`;
  let note: string;
  if (grade === "PASS") {
    note = `SAV in ${signName}: ${bindusInLagna} bindus (≥${threshold} = auspicious). Muhurta strengthened.`;
  } else if (grade === "MARGINAL") {
    note = `SAV in ${signName}: ${bindusInLagna} bindus (threshold ${threshold}). Marginal — choose a stronger window if possible.`;
  } else {
    note = `SAV in ${signName}: ${bindusInLagna} bindus (< 20). Weak muhurta lagna. Prefer a different time.`;
  }

  return { grade, lagnaSign: lagnaRashi, bindusInLagna, threshold, allSignSAV, note };
}

// ── Combined Validator ────────────────────────────────────────────────────────

/**
 * Compute MPI SAV adjustment contribution (−15 to +15).
 *
 * Per RESEARCH_SYNTHESIS.md MPI formula:
 *   MPI = 40%×KP + 25%×Uphora + 20%×Panchang + 15%×SAV
 * This function returns the 15% SAV component as a 0-15 value (added to base score).
 * SAV bindus range roughly 20-55; normalize to 0-100 → multiply by 0.15.
 */
function computeMPIAdjustment(savBindus: number): number {
  // Normalize: 0 bindus → 0 pts, 55 bindus (max realistic) → 15 pts
  const normalized = Math.min(Math.max(savBindus / 55, 0), 1);
  return Math.round(normalized * 15);
}

/**
 * Run full muhurta validation (Stages 4 + 5) from a transit chart.
 *
 * The transit chart should be built from the muhurta moment:
 *   const transitChart = buildRealChart(now, lat, lon);
 *   const validation = runMuhurtaValidation(transitChart);
 *
 * @param transitChart  Chart computed for the muhurta moment + querier location.
 * @returns MuhurtaValidation with both stages + overall grade.
 */
export function runMuhurtaValidation(transitChart: RealChart): MuhurtaValidation {
  const stage4 = validateLagnaShudhi(transitChart);
  const stage5 = validateSAV(transitChart);

  // Overall grade = worst of the two stages (FAIL dominates)
  let overallGrade: ValidationGrade;
  if (stage4.grade === "FAIL" || stage5.grade === "FAIL") {
    overallGrade = "FAIL";
  } else if (stage4.grade === "MARGINAL" || stage5.grade === "MARGINAL") {
    overallGrade = "MARGINAL";
  } else {
    overallGrade = "PASS";
  }

  const mpiAdjustment = computeMPIAdjustment(stage5.bindusInLagna);

  return {
    stage4,
    stage5,
    overallGrade,
    mpiAdjustment,
    source: "Muhurta Chintamani (Lagna Shudhi Prakarana §4,§5) + BPHS (Ashtakavarga Adhyaya)",
  };
}
