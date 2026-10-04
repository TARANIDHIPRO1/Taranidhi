// ──────────────────────────────────────────────────────────────────────────────
// GOCHAR (Transit) Analysis Engine
//
// PRIMARY SOURCE:
//   Phaladeepika (Mantresvara, ~1100 CE), Chapter 26 — "Gochar Phala"
//   Verse-by-verse table of favorable/unfavorable house positions for each of
//   the 7 classical planets transiting from the natal Moon sign.
//
// SECONDARY SOURCES:
//   BPHS (Parashara), Gochar Adhyaya — corroborates favorable house sets.
//   Sarvartha Chintamani — cross-check on Sade Sati and Guru Gochar.
//   Jataka Parijata — Vedha positions (partially implemented; see VEDHA NOTE).
//
// SYSTEM:
//   Transit planet positions are evaluated from the natal (Janma) Moon rashi.
//   "Position from Moon" = (transitRashi - natalMoonRashi + 12) % 12, then +1
//   so range is 1–12 (house 1 = same sign as natal Moon, 12 = sign before it).
//
// VEDHA NOTE:
//   Classical texts define a "Vedha" (obstruction) system where a second
//   planet in a specific position cancels the favorable effect of the first.
//   E.g., Jupiter favorable in 2nd is cancelled if Mars is also in 2nd.
//   Full 7×7 Vedha matrix implementation is deferred (needs 35+ source citations).
//   Partial Vedha for Sade Sati is implemented (Jupiter in 11th partially reduces it).
//
// SPECIAL CONDITIONS:
//   Sade Sati   — Saturn in 12th, 1st, or 2nd from natal Moon (7.5 year cycle)
//   Ashtama Shani — Saturn in 8th from natal Moon
//   Kantaka Shani — Saturn in 4th from natal Moon  [some texts use 5th]
//   Dhaiya      — Saturn in 4th or 8th from natal Moon (generic term)
//   Guru Gochar — Jupiter in 5th or 9th from natal Moon (best positions)
//   Ashtama Guru — Jupiter in 8th from natal Moon (unfavorable)
// ──────────────────────────────────────────────────────────────────────────────

export type GocharPlanet = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

/** Transit positions (rashi 0–11) for each classical planet at the query time. */
export type TransitPlanetRashis = Partial<Record<GocharPlanet, number>>;

/** Result for one planet's Gochar evaluation. */
export interface PlanetGocharResult {
  planet: GocharPlanet;
  /** Transit rashi (0–11). */
  transitRashi: number;
  /** Position from natal Moon (1–12). */
  positionFromMoon: number;
  /** Whether this position is classical favorable. */
  favorable: boolean;
  /** Raw score contribution (can be negative). */
  score: number;
  /** Special condition flag if any. */
  specialCondition: string | null;
  /** Human-readable note. */
  note: string;
}

/** Aggregate Gochar analysis result. */
export interface GocharResult {
  /** Natal Moon rashi (0–11) used for all calculations. */
  natalMoonRashi: number;
  /** Per-planet results for each planet provided. */
  planets: PlanetGocharResult[];
  /** Special conditions active (Sade Sati, Guru Gochar, etc.). */
  specialConditions: string[];
  /** Net score across all evaluated planets. Replaces flat +20/-25 placeholder. */
  totalScore: number;
  /** Severity level for display. */
  severity: "very_favorable" | "favorable" | "neutral" | "unfavorable" | "very_unfavorable";
  /** Short diagnostic summary. */
  summary: string;
}

// ── Classical favorable house positions from natal Moon ───────────────────────
// Source: Phaladeepika Ch.26, verse citations below.
//
//   Sun:     3, 6, 10, 11  (Phaladeepika 26.5)
//   Moon:    1, 3, 6, 7, 10, 11 (Phaladeepika 26.7)
//   Mars:    3, 6, 11  (Phaladeepika 26.9)
//   Mercury: 2, 4, 6, 8, 10, 11 (Phaladeepika 26.11)
//   Jupiter: 2, 5, 7, 9, 11 (Phaladeepika 26.13)
//   Venus:   1, 2, 3, 4, 5, 8, 9, 11, 12 (Phaladeepika 26.15)
//   Saturn:  3, 6, 11  (Phaladeepika 26.17)
export const GOCHAR_FAVORABLE_HOUSES: Record<GocharPlanet, ReadonlySet<number>> = {
  Sun:     new Set([3, 6, 10, 11]),
  Moon:    new Set([1, 3, 6, 7, 10, 11]),
  Mars:    new Set([3, 6, 11]),
  Mercury: new Set([2, 4, 6, 8, 10, 11]),
  Jupiter: new Set([2, 5, 7, 9, 11]),
  Venus:   new Set([1, 2, 3, 4, 5, 8, 9, 11, 12]),
  Saturn:  new Set([3, 6, 11]),
};

// ── Planet weights ─────────────────────────────────────────────────────────────
// Jupiter and Saturn dominate Gochar importance in classical texts.
// Moon changes every 2.5 days — moderate weight.
// Sun, Mars, Mercury, Venus — background influence.
const PLANET_WEIGHT: Record<GocharPlanet, number> = {
  Jupiter: 9,  // Guru — most auspicious outer planet; Guru Gochar can transform life
  Saturn:  9,  // Shani — Sade Sati is the most feared transit condition
  Moon:    5,  // Transits every 2.5 days; strong day-to-day influence on muhurta
  Sun:     4,  // Annual transit; marks seasons
  Mars:    4,  // 1.5-year transit; influences energy and conflict
  Mercury: 3,  // ~1 month transit; intellect and communication
  Venus:   3,  // ~1 month transit; creativity and relationships
};

// ── Special condition thresholds ───────────────────────────────────────────────
/** Saturn Sade Sati: positions 12, 1, 2 from natal Moon (7.5-year cycle). */
export const SADE_SATI_POSITIONS: ReadonlySet<number> = new Set([12, 1, 2]);

/** Dhaiya (2.5 years, partial trouble): Saturn in 4th or 8th from natal Moon. */
export const DHAIYA_POSITIONS: ReadonlySet<number> = new Set([4, 8]);

/** Guru Gochar best: Jupiter in 5th or 9th from natal Moon. */
export const GURU_GOCHAR_BEST: ReadonlySet<number> = new Set([5, 9]);

/** Guru Gochar good: Jupiter in 2nd, 7th, 11th from natal Moon. */
export const GURU_GOCHAR_GOOD: ReadonlySet<number> = new Set([2, 7, 11]);

/** Ashtama Guru: Jupiter in 8th from natal Moon (unfavorable). */
export const ASHTAMA_GURU_POSITION = 8;

/** Ashtama Chandra: Moon in 8th from natal Moon (unfavorable). */
export const ASHTAMA_CHANDRA_POSITION = 8;

// ── Score tables ──────────────────────────────────────────────────────────────
// Each position 1–12 maps to a base score for each planet.
// These refine the simple favorable/unfavorable binary.
// Source: Phaladeepika Ch.26 qualitative descriptions converted to scale.
//
// Encoding:
//   +2 = strongly favorable
//   +1 = mildly favorable
//    0 = mixed / neutral
//   -1 = mildly unfavorable
//   -2 = strongly unfavorable

const POSITION_SCORES: Record<GocharPlanet, Record<number, number>> = {
  Sun: {
     1: -1, 2: -2, 3: +2, 4: -1, 5: -1, 6: +2,
     7: -1, 8: -2, 9: -1, 10: +2, 11: +2, 12: -1,
  },
  Moon: {
     1: +1, 2: -2, 3: +2, 4: -1, 5: -1, 6: +2,
     7: +1, 8: -2, 9: -1, 10: +1, 11: +2, 12: -1,
  },
  Mars: {
     1: -1, 2: -2, 3: +2, 4: -2, 5: -1, 6: +2,
     7: -1, 8: -2, 9: -1, 10: -1, 11: +2, 12: -2,
  },
  Mercury: {
     1: -1, 2: +1, 3: -1, 4: +2, 5: -1, 6: +2,
     7: -1, 8: +1, 9: -1, 10: +2, 11: +2, 12: -1,
  },
  Jupiter: {
     1: -1, 2: +1, 3: -2, 4: -2, 5: +2, 6: -1,
     7: +1, 8: -2, 9: +2, 10: -1, 11: +1, 12: -2,
  },
  Venus: {
     1: +1, 2: +2, 3: +2, 4: +1, 5: +1, 6: -1,
     7: -2, 8: +1, 9: +2, 10: -1, 11: +2, 12: +1,
  },
  Saturn: {
     1: -2, 2: -2, 3: +2, 4: -2, 5: -1, 6: +2,
     7: -1, 8: -2, 9: -1, 10: -1, 11: +2, 12: -2,
  },
};

// ── Core calculation ──────────────────────────────────────────────────────────

/**
 * Calculate transit position (1–12) of a planet from the natal Moon sign.
 *
 * @param transitRashi   Transit planet's rashi (0–11)
 * @param natalMoonRashi Natal Moon's rashi (0–11)
 * @returns Position 1–12 (1 = same sign as natal Moon)
 */
export function positionFromMoon(transitRashi: number, natalMoonRashi: number): number {
  return ((transitRashi - natalMoonRashi + 12) % 12) + 1;
}

/**
 * Evaluate a single planet's Gochar result.
 *
 * @param planet         The classical planet
 * @param transitRashi   Transit rashi (0–11)
 * @param natalMoonRashi Natal Moon rashi (0–11)
 */
export function evaluatePlanetGochar(
  planet: GocharPlanet,
  transitRashi: number,
  natalMoonRashi: number
): PlanetGocharResult {
  const pos = positionFromMoon(transitRashi, natalMoonRashi);
  const isFavorable = GOCHAR_FAVORABLE_HOUSES[planet].has(pos);
  const baseMultiplier = PLANET_WEIGHT[planet];
  const posScore = POSITION_SCORES[planet][pos] ?? 0;
  let score = posScore * baseMultiplier;
  let specialCondition: string | null = null;
  let note: string;

  // ── Special conditions override / amplify base score ──
  if (planet === "Saturn") {
    if (SADE_SATI_POSITIONS.has(pos)) {
      specialCondition = pos === 1 ? "Sade Sati (Peak)" : "Sade Sati";
      // Sade Sati peak (1st house) is worst; 12th and 2nd are entry/exit phases
      score = pos === 1 ? -20 : -14;
      note = pos === 12
        ? `Sade Sati starting (Saturn entering pre-natal Moon sign). Challenging 2.5-year phase begins.`
        : pos === 1
        ? `Sade Sati peak — Saturn directly over natal Moon sign. Most challenging phase.`
        : `Sade Sati exit phase — Saturn moving past natal Moon sign. Difficulties easing.`;
    } else if (DHAIYA_POSITIONS.has(pos)) {
      specialCondition = pos === 4 ? "Kantaka Shani" : "Ashtama Shani";
      score = -10;
      note = pos === 4
        ? `Kantaka Shani — Saturn in 4th from natal Moon. 2.5-year challenge to domestic life.`
        : `Ashtama Shani — Saturn in 8th from natal Moon. Obstacles to longevity matters.`;
    } else if (isFavorable) {
      note = `Saturn in favorable ${pos}th house from natal Moon. ${pos === 11 ? "Gains and rewards indicated." : pos === 3 ? "Courage and effort rewarded." : "Obstacles reduced."}`;
    } else {
      note = `Saturn in ${pos}th from natal Moon. Mixed or unfavorable transit.`;
    }
  } else if (planet === "Jupiter") {
    if (GURU_GOCHAR_BEST.has(pos)) {
      specialCondition = "Guru Gochar";
      score = pos === 5 ? 18 : 16; // 9th = dharma house, 5th = punya/children
      note = pos === 5
        ? `Guru Gochar — Jupiter in 5th (Punya). Excellent for auspicious events, children, investments.`
        : `Guru Gochar — Jupiter in 9th (Dharma). Most auspicious for spiritual, legal, and religious acts.`;
    } else if (pos === ASHTAMA_GURU_POSITION) {
      specialCondition = "Ashtama Guru";
      score = -10;
      note = `Ashtama Guru — Jupiter in 8th from natal Moon. Unfavorable for new ventures.`;
    } else if (isFavorable) {
      note = `Jupiter in favorable ${pos}th from natal Moon. ${pos === 2 ? "Wealth and speech improve." : pos === 7 ? "Partnerships supported." : "Gains and opportunities."} `;
    } else {
      note = `Jupiter in ${pos}th from natal Moon. Unfavorable transit.`;
    }
  } else if (planet === "Moon" && pos === ASHTAMA_CHANDRA_POSITION) {
    specialCondition = "Ashtama Chandra";
    score = -8;
    note = `Ashtama Chandra — transit Moon in 8th from natal Moon. Avoid critical decisions today.`;
  } else {
    // Generic favorable/unfavorable note
    const rashiName = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ][transitRashi] ?? `Rashi ${transitRashi}`;
    note = isFavorable
      ? `${planet} in ${rashiName} (${pos}th from natal Moon) — favorable transit.`
      : `${planet} in ${rashiName} (${pos}th from natal Moon) — unfavorable transit.`;
  }

  return { planet, transitRashi, positionFromMoon: pos, favorable: isFavorable, score, specialCondition, note };
}

/**
 * Full Gochar analysis for a muhurta query.
 *
 * Pass as many transit planet rashis as are available.
 * Missing planets are skipped (no partial credit either way).
 *
 * @param natalMoonRashi  Natal Moon's rashi (0–11)
 * @param transitRashis   Current transit positions of each planet (0–11 per planet)
 * @returns               GocharResult with per-planet breakdown and total score
 */
export function analyzeGochar(
  natalMoonRashi: number,
  transitRashis: TransitPlanetRashis
): GocharResult {
  const planets: PlanetGocharResult[] = [];
  const specialConditions: string[] = [];
  let totalScore = 0;

  const PLANET_ORDER: GocharPlanet[] = ["Jupiter", "Saturn", "Moon", "Sun", "Mars", "Mercury", "Venus"];

  for (const planet of PLANET_ORDER) {
    const rashi = transitRashis[planet];
    if (rashi === undefined || rashi === null) continue;

    const result = evaluatePlanetGochar(planet, rashi, natalMoonRashi);
    planets.push(result);
    totalScore += result.score;

    if (result.specialCondition) {
      specialConditions.push(result.specialCondition);
    }
  }

  // ── Partial Vedha: Jupiter in 11th partially reduces Sade Sati ─────────────
  // Source: Sarvartha Chintamani — "Even in Sade Sati, Guru in 11th gives relief."
  const hasSadeSati = specialConditions.some(c => c.startsWith("Sade Sati"));
  const jupitersResult = planets.find(p => p.planet === "Jupiter");
  if (hasSadeSati && jupitersResult?.positionFromMoon === 11) {
    totalScore += 6; // partial relief
    specialConditions.push("Guru partial Vedha relief (11th)");
  }

  // ── Severity classification ────────────────────────────────────────────────
  let severity: GocharResult["severity"];
  if (totalScore >= 20)       severity = "very_favorable";
  else if (totalScore >= 8)   severity = "favorable";
  else if (totalScore >= -7)  severity = "neutral";
  else if (totalScore >= -18) severity = "unfavorable";
  else                        severity = "very_unfavorable";

  // ── Summary ───────────────────────────────────────────────────────────────
  const specialNote = specialConditions.length > 0
    ? ` Active: ${specialConditions.join(", ")}.`
    : "";
  const summary = `Gochar score ${totalScore > 0 ? "+" : ""}${totalScore} (${planets.length} planets evaluated).${specialNote}`;

  return { natalMoonRashi, planets, specialConditions, totalScore, severity, summary };
}

/**
 * Convenience: convert GocharResult to the point value used by the
 * PersonalAdjustment interface in professionalMuhurta.ts.
 *
 * The raw totalScore is on a roughly ±60 scale; we cap to ±30 to stay
 * within the PersonalAdjustment range without dominating the final score.
 */
export function gocharToAdjustmentValue(result: GocharResult): number {
  return Math.max(-30, Math.min(30, result.totalScore));
}
