// Navtara Chakra (Tarabala) — full test suite for calculateNavtara()
//
// Sources: Muhurta-Chintamani (primary), Chugh, NAVTARA_MASTER_RULESET_V2
//
// Key formula:
//   distance     = ((queryNak - birthNak) mod 27 + 27) mod 27 + 1   → 1..27
//   cycle        = ceil(distance / 9)                                 → 1, 2, 3
//   taraPosition = ((distance - 1) mod 9) + 1                        → 1..9
//
// Cycle rules (Muhurta-Chintamani):
//   Cycle 1: Vipat(3), Pratyari(5), Vadha(7) wholly adverse
//   Cycle 2: Vipat/Pratyari/Vadha partially adverse, partially benefic (zone by degree)
//   Cycle 3: Vipat(3), Pratyari(5), Vadha(7) wholly FAVOURABLE (full reversal)

import { describe, it, expect } from "vitest";
import {
  calculateNavtara,
  getNavtaraScore,
  type NavtaraResult,
  type NavtaraName,
  type NavtaraQuality,
} from "../muhurta";

// ─── Test Helpers ────────────────────────────────────────────────────────────

/** Expected Tara for each position 1-9 */
const TARA_AT_POSITION: Record<number, NavtaraName> = {
  1: "Janma",
  2: "Sampat",
  3: "Vipat",
  4: "Kshema",
  5: "Pratyari",
  6: "Sadhaka",
  7: "Vadha",
  8: "Mitra",
  9: "Parama Mitra",
};

/** Base quality for each position (cycle 1 standard) */
const BASE_QUALITY_AT_POSITION: Record<number, NavtaraQuality> = {
  1: "neutral",
  2: "benefic",
  3: "malefic",
  4: "benefic",
  5: "malefic",
  6: "benefic",
  7: "most_malefic",
  8: "benefic",
  9: "most_benefic",
};

// ─── Distance & Position Formula ─────────────────────────────────────────────

describe("calculateNavtara() — distance, cycle, position formula", () => {
  it("same nakshatra → distance=1, cycle=1, position=1 (Janma)", () => {
    const r = calculateNavtara(0, 0);
    expect(r.distance).toBe(1);
    expect(r.cycle).toBe(1);
    expect(r.position).toBe(1);
    expect(r.name).toBe("Janma");
  });

  it("next nakshatra → distance=2, Sampat", () => {
    const r = calculateNavtara(0, 1);
    expect(r.distance).toBe(2);
    expect(r.cycle).toBe(1);
    expect(r.position).toBe(2);
    expect(r.name).toBe("Sampat");
  });

  it("distance=9 → Parama Mitra (end of cycle 1)", () => {
    const r = calculateNavtara(0, 8);
    expect(r.distance).toBe(9);
    expect(r.cycle).toBe(1);
    expect(r.position).toBe(9);
    expect(r.name).toBe("Parama Mitra");
  });

  it("distance=10 → cycle 2, position=1, Janma again", () => {
    const r = calculateNavtara(0, 9);
    expect(r.distance).toBe(10);
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(1);
    expect(r.name).toBe("Janma");
  });

  it("distance=18 → end of cycle 2, Parama Mitra", () => {
    const r = calculateNavtara(0, 17);
    expect(r.distance).toBe(18);
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(9);
    expect(r.name).toBe("Parama Mitra");
  });

  it("distance=19 → cycle 3, position=1, Janma", () => {
    const r = calculateNavtara(0, 18);
    expect(r.distance).toBe(19);
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(1);
    expect(r.name).toBe("Janma");
  });

  it("distance=27 → end of cycle 3, Parama Mitra", () => {
    const r = calculateNavtara(0, 26);
    expect(r.distance).toBe(27);
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(9);
    expect(r.name).toBe("Parama Mitra");
  });

  it("wrap-around: birthNak=5, queryNak=3 → distance=((3-5+27)%27)+1=26", () => {
    const r = calculateNavtara(5, 3);
    expect(r.distance).toBe(26);
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(8);
    expect(r.name).toBe("Mitra");
  });

  it("birthNak=26 (Revati), queryNak=0 (Ashwini) → distance=2, Sampat", () => {
    const r = calculateNavtara(26, 0);
    expect(r.distance).toBe(2);
    expect(r.cycle).toBe(1);
    expect(r.position).toBe(2);
    expect(r.name).toBe("Sampat");
  });

  it("all 9 positions in cycle 1 — birth=Ashwini(0)", () => {
    for (let pos = 1; pos <= 9; pos++) {
      const r = calculateNavtara(0, pos - 1);
      expect(r.position).toBe(pos);
      expect(r.cycle).toBe(1);
      expect(r.name).toBe(TARA_AT_POSITION[pos]);
    }
  });
});

// ─── Base Qualities (Cycle 1) ─────────────────────────────────────────────────

describe("calculateNavtara() — base qualities (cycle 1)", () => {
  it("all 9 positions have correct base quality", () => {
    for (let pos = 1; pos <= 9; pos++) {
      const r = calculateNavtara(0, pos - 1);
      expect(r.cycle).toBe(1);
      expect(r.baseQuality).toBe(BASE_QUALITY_AT_POSITION[pos]);
    }
  });

  it("cycle 1 effectiveQuality = baseQuality for positions 1,2,4,6,8,9", () => {
    const unaffectedPositions = [1, 2, 4, 6, 8, 9];
    for (const pos of unaffectedPositions) {
      const r = calculateNavtara(0, pos - 1);
      expect(r.effectiveQuality).toBe(r.baseQuality);
    }
  });

  it("cycle 1: Vipat(3) base and effective = malefic", () => {
    const r = calculateNavtara(0, 2); // position 3
    expect(r.baseQuality).toBe("malefic");
    expect(r.effectiveQuality).toBe("malefic");
    expect(r.cycle).toBe(1);
  });

  it("cycle 1: Pratyari(5) base and effective = malefic", () => {
    const r = calculateNavtara(0, 4); // position 5
    expect(r.baseQuality).toBe("malefic");
    expect(r.effectiveQuality).toBe("malefic");
    expect(r.cycle).toBe(1);
  });

  it("cycle 1: Vadha(7) base and effective = most_malefic", () => {
    const r = calculateNavtara(0, 6); // position 7
    expect(r.baseQuality).toBe("most_malefic");
    expect(r.effectiveQuality).toBe("most_malefic");
    expect(r.cycle).toBe(1);
  });
});

// ─── Cycle 2 Rules ───────────────────────────────────────────────────────────

describe("calculateNavtara() — cycle 2 zone rules (Muhurta-Chintamani)", () => {
  // Cycle 2 positions 1,2,4,6,8,9 unchanged
  it("cycle 2: Janma(pos 1) quality unchanged = neutral", () => {
    const r = calculateNavtara(0, 9); // distance=10, cycle=2, pos=1
    expect(r.cycle).toBe(2);
    expect(r.effectiveQuality).toBe("neutral");
  });

  it("cycle 2: Sampat(pos 2) quality unchanged = benefic", () => {
    const r = calculateNavtara(0, 10);
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(2);
    expect(r.effectiveQuality).toBe("benefic");
  });

  // Cycle 2 positions 3, 5, 7 → mixed (zone pending degree data)
  it("cycle 2: Vipat(3) → mixed (zone by nakshatra degree, not yet wired)", () => {
    const r = calculateNavtara(0, 11); // cycle=2, pos=3
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(3);
    expect(r.effectiveQuality).toBe("mixed");
    expect(r.cycleRule).toMatch(/cycle 2/i);
    expect(r.cycleRule).toMatch(/vipat/i);
  });

  it("cycle 2: Pratyari(5) → mixed", () => {
    const r = calculateNavtara(0, 13); // cycle=2, pos=5
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(5);
    expect(r.effectiveQuality).toBe("mixed");
  });

  it("cycle 2: Vadha(7) → mixed", () => {
    const r = calculateNavtara(0, 15); // cycle=2, pos=7
    expect(r.cycle).toBe(2);
    expect(r.position).toBe(7);
    expect(r.effectiveQuality).toBe("mixed");
  });

  it("cycle 2: score = 0 for mixed positions (neutral pending zone resolution)", () => {
    for (const offset of [11, 13, 15]) {
      const r = calculateNavtara(0, offset);
      expect(r.score).toBe(0);
    }
  });
});

// ─── Cycle 3 Reversal Rules ───────────────────────────────────────────────────

describe("calculateNavtara() — cycle 3 reversal (Muhurta-Chintamani)", () => {
  // Positions 1,2,4,6,8,9 unchanged in cycle 3
  it("cycle 3: Sadhaka(6) remains benefic", () => {
    const r = calculateNavtara(0, 23); // distance=24, cycle=3, pos=6
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(6);
    expect(r.effectiveQuality).toBe("benefic");
  });

  it("cycle 3: Parama Mitra(9) remains most_benefic", () => {
    const r = calculateNavtara(0, 26); // distance=27, cycle=3, pos=9
    expect(r.cycle).toBe(3);
    expect(r.effectiveQuality).toBe("most_benefic");
  });

  // Cycle 3 reversal: positions 3, 5, 7 wholly favourable
  it("cycle 3: Vipat(3) → benefic (full reversal)", () => {
    const r = calculateNavtara(0, 20); // distance=21, cycle=3, pos=3
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(3);
    expect(r.baseQuality).toBe("malefic");    // base unchanged
    expect(r.effectiveQuality).toBe("benefic");  // effective reversed
    expect(r.cycleRule).toMatch(/cycle 3/i);
    expect(r.cycleRule).toMatch(/favourable/i);
  });

  it("cycle 3: Pratyari(5) → benefic (full reversal)", () => {
    const r = calculateNavtara(0, 22); // distance=23, cycle=3, pos=5
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(5);
    expect(r.baseQuality).toBe("malefic");
    expect(r.effectiveQuality).toBe("benefic");
  });

  it("cycle 3: Vadha(7) → most_benefic (complete reversal to highest grade)", () => {
    const r = calculateNavtara(0, 24); // distance=25, cycle=3, pos=7
    expect(r.cycle).toBe(3);
    expect(r.position).toBe(7);
    expect(r.baseQuality).toBe("most_malefic");
    expect(r.effectiveQuality).toBe("most_benefic"); // Vadha → Parama Mitra grade
  });

  it("cycle 3: reversed Vipat has positive score", () => {
    const r = calculateNavtara(0, 20);
    expect(r.score).toBeGreaterThan(0);
  });

  it("cycle 3: reversed Pratyari has positive score", () => {
    const r = calculateNavtara(0, 22);
    expect(r.score).toBeGreaterThan(0);
  });

  it("cycle 3: reversed Vadha has score = +2 (Parama Mitra grade)", () => {
    const r = calculateNavtara(0, 24);
    expect(r.score).toBe(2);
  });
});

// ─── Raw Score Table ──────────────────────────────────────────────────────────

describe("calculateNavtara() — rawScore (Tara Bala percentage)", () => {
  const EXPECTED_RAW_SCORES: Record<number, number> = {
    1: 20,   // Janma
    2: 95,   // Sampat
    3: 15,   // Vipat (cycle 1)
    4: 90,   // Kshema
    5: 10,   // Pratyari (cycle 1)
    6: 85,   // Sadhaka
    7:  5,   // Vadha (cycle 1)
    8: 80,   // Mitra
    9: 100,  // Parama Mitra
  };

  it("cycle 1 raw scores match DOCX table", () => {
    for (const [pos, expected] of Object.entries(EXPECTED_RAW_SCORES)) {
      const posNum = parseInt(pos);
      const r = calculateNavtara(0, posNum - 1);
      expect(r.rawScore).toBe(expected);
    }
  });

  it("cycle 3: Vipat(3) rawScore = 85 (Kshema-grade reversal)", () => {
    const r = calculateNavtara(0, 20); // cycle=3, pos=3
    expect(r.rawScore).toBe(85);
  });

  it("cycle 3: Pratyari(5) rawScore = 80 (Mitra-grade reversal)", () => {
    const r = calculateNavtara(0, 22); // cycle=3, pos=5
    expect(r.rawScore).toBe(80);
  });

  it("cycle 3: Vadha(7) rawScore = 100 (Parama Mitra-grade reversal)", () => {
    const r = calculateNavtara(0, 24); // cycle=3, pos=7
    expect(r.rawScore).toBe(100);
  });

  it("rawScore is always 5-100", () => {
    for (let birth = 0; birth < 27; birth++) {
      for (let query = 0; query < 27; query++) {
        const r = calculateNavtara(birth, query);
        expect(r.rawScore).toBeGreaterThanOrEqual(5);
        expect(r.rawScore).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ─── Score Values ─────────────────────────────────────────────────────────────

describe("calculateNavtara() — convergence score (-2 to +2)", () => {
  it("Janma → score 0 (neutral)", () => {
    expect(calculateNavtara(0, 0).score).toBe(0);
  });

  it("Sampat → score +1", () => {
    expect(calculateNavtara(0, 1).score).toBe(1);
  });

  it("Vipat (cycle 1) → score -1", () => {
    expect(calculateNavtara(0, 2).score).toBe(-1);
  });

  it("Kshema → score +1", () => {
    expect(calculateNavtara(0, 3).score).toBe(1);
  });

  it("Pratyari (cycle 1) → score -1", () => {
    expect(calculateNavtara(0, 4).score).toBe(-1);
  });

  it("Sadhaka → score +2", () => {
    expect(calculateNavtara(0, 5).score).toBe(2);
  });

  it("Vadha (cycle 1) → score -2", () => {
    expect(calculateNavtara(0, 6).score).toBe(-2);
  });

  it("Mitra → score +1", () => {
    expect(calculateNavtara(0, 7).score).toBe(1);
  });

  it("Parama Mitra → score +2", () => {
    expect(calculateNavtara(0, 8).score).toBe(2);
  });

  it("score is always -2 to +2 across all 27×27 combinations", () => {
    for (let birth = 0; birth < 27; birth++) {
      for (let query = 0; query < 27; query++) {
        const r = calculateNavtara(birth, query);
        expect(r.score).toBeGreaterThanOrEqual(-2);
        expect(r.score).toBeLessThanOrEqual(2);
      }
    }
  });
});

// ─── getNavtaraScore() Shorthand ─────────────────────────────────────────────

describe("getNavtaraScore()", () => {
  it("returns same value as calculateNavtara().score", () => {
    for (let birth = 0; birth < 27; birth += 3) {
      for (let query = 0; query < 27; query += 3) {
        expect(getNavtaraScore(birth, query)).toBe(calculateNavtara(birth, query).score);
      }
    }
  });

  it("Sadhaka (pos 6) = +2", () => {
    expect(getNavtaraScore(0, 5)).toBe(2);
  });

  it("Vadha cycle 1 = -2", () => {
    expect(getNavtaraScore(0, 6)).toBe(-2);
  });

  it("Vadha cycle 3 = +2 (reversed)", () => {
    expect(getNavtaraScore(0, 24)).toBe(2); // distance=25, cycle=3, pos=7
  });

  it("cycle 2 mixed = 0", () => {
    expect(getNavtaraScore(0, 15)).toBe(0); // Vadha in cycle 2
  });
});

// ─── Result Structure ─────────────────────────────────────────────────────────

describe("calculateNavtara() — result fields", () => {
  it("result has all required fields", () => {
    const r = calculateNavtara(7, 14);
    expect(typeof r.distance).toBe("number");
    expect(typeof r.cycle).toBe("number");
    expect(typeof r.position).toBe("number");
    expect(typeof r.name).toBe("string");
    expect(typeof r.baseQuality).toBe("string");
    expect(typeof r.effectiveQuality).toBe("string");
    expect(typeof r.cycleRule).toBe("string");
    expect(typeof r.meaning).toBe("string");
    expect(typeof r.recommendation).toBe("string");
    expect(typeof r.score).toBe("number");
    expect(typeof r.rawScore).toBe("number");
  });

  it("cycleRule is non-empty string for all combinations", () => {
    for (let birth = 0; birth < 27; birth += 5) {
      for (let query = 0; query < 27; query += 5) {
        const r = calculateNavtara(birth, query);
        expect(r.cycleRule.length).toBeGreaterThan(0);
      }
    }
  });

  it("meaning and recommendation are non-empty for all 9 positions", () => {
    for (let pos = 1; pos <= 9; pos++) {
      const r = calculateNavtara(0, pos - 1);
      expect(r.meaning.length).toBeGreaterThan(0);
      expect(r.recommendation.length).toBeGreaterThan(0);
    }
  });

  it("distance is always 1-27", () => {
    for (let birth = 0; birth < 27; birth++) {
      for (let query = 0; query < 27; query++) {
        const r = calculateNavtara(birth, query);
        expect(r.distance).toBeGreaterThanOrEqual(1);
        expect(r.distance).toBeLessThanOrEqual(27);
      }
    }
  });

  it("cycle is always 1, 2, or 3", () => {
    for (let birth = 0; birth < 27; birth++) {
      for (let query = 0; query < 27; query++) {
        const r = calculateNavtara(birth, query);
        expect([1, 2, 3]).toContain(r.cycle);
      }
    }
  });

  it("position is always 1-9", () => {
    for (let birth = 0; birth < 27; birth++) {
      for (let query = 0; query < 27; query++) {
        const r = calculateNavtara(birth, query);
        expect(r.position).toBeGreaterThanOrEqual(1);
        expect(r.position).toBeLessThanOrEqual(9);
      }
    }
  });
});

// ─── Naveen's Chart Spot-check ────────────────────────────────────────────────
// Birth: 1973-04-08, Bhopal; Moon nakshatra to be verified from astro.ts
// Cross-reference: onlinejyotish.com results
//
// Note: Exact birth nakshatra index requires running calculatePlanetaryPositions().
// Tests here use the formula properties that are chart-independent.

describe("calculateNavtara() — real-world scenario cross-checks", () => {
  it("complete 27-nakshatra sweep: exactly 3 cycles of 9 positions", () => {
    let cycle1Count = 0;
    let cycle2Count = 0;
    let cycle3Count = 0;
    for (let query = 0; query < 27; query++) {
      const r = calculateNavtara(0, query);
      if (r.cycle === 1) cycle1Count++;
      else if (r.cycle === 2) cycle2Count++;
      else if (r.cycle === 3) cycle3Count++;
    }
    // Each cycle gets exactly 9 nakshatras
    expect(cycle1Count).toBe(9);
    expect(cycle2Count).toBe(9);
    expect(cycle3Count).toBe(9);
  });

  it("in a full 27-nakshatra sweep, Vadha occurs exactly 3 times (once per cycle)", () => {
    const vadhaResults = [];
    for (let query = 0; query < 27; query++) {
      const r = calculateNavtara(0, query);
      if (r.position === 7) vadhaResults.push(r);
    }
    expect(vadhaResults).toHaveLength(3);
    expect(vadhaResults[0]!.cycle).toBe(1);
    expect(vadhaResults[1]!.cycle).toBe(2);
    expect(vadhaResults[2]!.cycle).toBe(3);
    // Qualities: malefic → mixed → most_benefic
    expect(vadhaResults[0]!.effectiveQuality).toBe("most_malefic");
    expect(vadhaResults[1]!.effectiveQuality).toBe("mixed");
    expect(vadhaResults[2]!.effectiveQuality).toBe("most_benefic");
  });

  it("Parama Mitra always has score +2 regardless of cycle (never affected by cycle rule)", () => {
    for (let query = 0; query < 27; query++) {
      const r = calculateNavtara(0, query);
      if (r.position === 9) {
        expect(r.score).toBe(2);
        expect(r.effectiveQuality).toBe("most_benefic");
      }
    }
  });

  it("Sadhaka always has score +2 regardless of cycle (never affected by cycle rule)", () => {
    for (let query = 0; query < 27; query++) {
      const r = calculateNavtara(0, query);
      if (r.position === 6) {
        expect(r.score).toBe(2);
        expect(r.effectiveQuality).toBe("benefic");
      }
    }
  });
});
