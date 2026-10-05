// Ashtakavarga BAV + SAV — full test suite
//
// Verification approach:
//   1. Classical totals — each planet's BAV.total must match expected sum
//      from BPHS tables (independent of natal chart positions)
//   2. Spot values — specific sign bindus from an all-Aries chart (deterministic)
//   3. Integration — SAV total, relative strengths
//   4. Helpers — getSAVStrength, bavToMuhurtaAdjustment, getTransitBindus
//   5. Backward compat — computeChandrashtakavarga

import { describe, it, expect } from "vitest";
import {
  computeAshtakavarga,
  computeChandrashtakavarga,
  getTransitBindus,
  getSAVStrength,
  bavToMuhurtaAdjustment,
  type AshtakavargaResult,
  type AshtakaPlanet,
} from "../ashtakwarga";
import type { RealChart } from "../astro";

// ─── Mock Chart Helpers ──────────────────────────────────────────────────────

/** Build a minimal RealChart with all 7 planets at the same rashi */
function makeChart(allRashi: number): RealChart {
  const planets = (
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const
  ).map((name) => ({
    planet: name,
    rashi: allRashi,
    degree: 0,
    longitude: allRashi * 30,
    isRetrograde: false,
    nakshatra: 0,
    pada: 1,
    nakshatraLord: "Ketu" as const,
    subLord: "Ketu" as const,
  }));

  return {
    planets,
    lagnaRashi: allRashi,
    lagnaLongitude: allRashi * 30,
    ascendantDegree: 0,
    julianDay: 0,
  } as unknown as RealChart;
}

/** Build chart with individually specified natal signs */
function makeChartCustom(signs: Partial<Record<string, number>>, lagnaRashi = 0): RealChart {
  const planets = (
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const
  ).map((name) => ({
    planet: name,
    rashi: signs[name] ?? 0,
    degree: 0,
    longitude: (signs[name] ?? 0) * 30,
    isRetrograde: false,
    nakshatra: 0,
    pada: 1,
    nakshatraLord: "Ketu" as const,
    subLord: "Ketu" as const,
  }));

  return {
    planets,
    lagnaRashi,
    lagnaLongitude: lagnaRashi * 30,
    ascendantDegree: 0,
    julianDay: 0,
  } as unknown as RealChart;
}

// ─── All-Aries chart (most deterministic for spot tests) ────────────────────
const ARIES_CHART = makeChart(0);

// ─── Classical Totals Tests ──────────────────────────────────────────────────
//
// When ALL 8 references are present, each planet's total = sum of |favorableHouses[ref]|
// This is chart-position independent — it only depends on the BAV table itself.

describe("computeAshtakavarga() — classical totals (BPHS Santhanam)", () => {
  const bav = computeAshtakavarga(ARIES_CHART);

  it("Sun BAV total = 48", () => {
    expect(bav.sun.total).toBe(48);
  });

  it("Moon BAV total = 48", () => {
    expect(bav.moon.total).toBe(48);
  });

  it("Mars BAV total = 42 (BPHS Santhanam edition)", () => {
    // Note: older editions quote 39; difference is in Mars-from-Lagna house count
    expect(bav.mars.total).toBe(42);
  });

  it("Mercury BAV total = 54", () => {
    expect(bav.mercury.total).toBe(54);
  });

  it("Jupiter BAV total = 56", () => {
    expect(bav.jupiter.total).toBe(56);
  });

  it("Venus BAV total = 52", () => {
    expect(bav.venus.total).toBe(52);
  });

  it("Saturn BAV total = 40", () => {
    expect(bav.saturn.total).toBe(40);
  });

  it("SAV total = 340 (sum of all 7 BAV totals)", () => {
    expect(bav.savTotal).toBe(340);
    expect(bav.savTotal).toBe(
      bav.sun.total + bav.moon.total + bav.mars.total +
      bav.mercury.total + bav.jupiter.total + bav.venus.total +
      bav.saturn.total
    );
  });
});

// ─── BAV Structure Tests ─────────────────────────────────────────────────────

describe("computeAshtakavarga() — structure", () => {
  const bav = computeAshtakavarga(ARIES_CHART);

  it("each BAV has 12 bindus entries", () => {
    for (const p of ["sun","moon","mars","mercury","jupiter","venus","saturn"] as const) {
      expect(bav[p].bindus).toHaveLength(12);
    }
  });

  it("SAV array has 12 entries", () => {
    expect(bav.sav).toHaveLength(12);
  });

  it("each bindu value is 0-8", () => {
    for (const p of ["sun","moon","mars","mercury","jupiter","venus","saturn"] as const) {
      bav[p].bindus.forEach(b => {
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(8);
      });
    }
  });

  it("each SAV bindu value is 0-56 (max 7 planets × 8)", () => {
    bav.sav.forEach(b => {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(56);
    });
  });

  it("SAV[sign] = sum of all 7 planet BAVs at that sign", () => {
    for (let i = 0; i < 12; i++) {
      const expected =
        bav.sun.bindus[i]! + bav.moon.bindus[i]! + bav.mars.bindus[i]! +
        bav.mercury.bindus[i]! + bav.jupiter.bindus[i]! +
        bav.venus.bindus[i]! + bav.saturn.bindus[i]!;
      expect(bav.sav[i]).toBe(expected);
    }
  });

  it("planet field matches key", () => {
    expect(bav.sun.planet).toBe("Sun");
    expect(bav.moon.planet).toBe("Moon");
    expect(bav.mars.planet).toBe("Mars");
    expect(bav.mercury.planet).toBe("Mercury");
    expect(bav.jupiter.planet).toBe("Jupiter");
    expect(bav.venus.planet).toBe("Venus");
    expect(bav.saturn.planet).toBe("Saturn");
  });

  it("total === sum of 12 bindus", () => {
    for (const p of ["sun","moon","mars","mercury","jupiter","venus","saturn"] as const) {
      const sum = [...bav[p].bindus].reduce((a, b) => a + b, 0);
      expect(bav[p].total).toBe(sum);
    }
  });
});

// ─── Spot Value Tests (all-Aries chart) ──────────────────────────────────────
//
// When all refs are at rashi 0 (Aries) and transit sign = T,
// house position from ALL refs = T+1 (since (T-0+12)%12+1 = T+1 for T<12)
// We can manually verify which references contribute.

describe("computeAshtakavarga() — spot values (all-Aries natal chart)", () => {
  const bav = computeAshtakavarga(ARIES_CHART);

  // ── Sun BAV spot tests ──────────────────────────────────────────────────
  // Transit Aries (T=0 → house=1):
  //   Sun{1,2,4,7,8,9,10,11}→YES, Moon{3,6,10,11}→NO, Mars{1,2,4,7,8,9,10,11}→YES
  //   Mercury{3,5,6,9,10,11,12}→NO, Jupiter{5,6,9,11}→NO, Venus{6,7,12}→NO
  //   Saturn{1,2,4,7,8,9,10,11}→YES, Lagna{3,4,6,10,11,12}→NO → total=3
  it("Sun BAV at Aries (rashi 0) = 3", () => {
    expect(bav.sun.bindus[0]).toBe(3);
  });

  // Transit Gemini (T=2 → house=3):
  //   Sun{1,2,4,...}→NO, Moon{3,6,10,11}→YES, Mars{1,2,4,...}→NO
  //   Mercury{3,5,6,...}→YES, Jupiter{5,6,9,11}→NO, Venus{6,7,12}→NO
  //   Saturn{1,2,4,...}→NO, Lagna{3,4,6,10,11,12}→YES → total=3
  it("Sun BAV at Gemini (rashi 2) = 3", () => {
    expect(bav.sun.bindus[2]).toBe(3);
  });

  // Transit Libra (T=6 → house=7):
  //   Sun{1,2,4,7,8,9,10,11}→YES, Moon{3,6,10,11}→NO, Mars{1,2,4,7,8,9,10,11}→YES
  //   Mercury{3,5,6,9,10,11,12}→NO, Jupiter{5,6,9,11}→NO, Venus{6,7,12}→YES
  //   Saturn{1,2,4,7,8,9,10,11}→YES, Lagna{3,4,6,10,11,12}→NO → total=4
  it("Sun BAV at Libra (rashi 6) = 4", () => {
    expect(bav.sun.bindus[6]).toBe(4);
  });

  // ── Moon BAV spot tests ─────────────────────────────────────────────────
  // Transit Aries (T=0 → house=1):
  //   Sun{3,6,10,11,12}→NO, Moon{1,3,6,7,10,11}→YES, Mars{2,3,5,6,9,10,11}→NO
  //   Mercury{1,3,4,5,7,8,10,11}→YES, Jupiter{1,4,7,8,10,11,12}→YES
  //   Venus{3,4,5,7,9,10,11}→NO, Saturn{3,5,6,11}→NO, Lagna{3,6,10,11}→NO → total=3
  it("Moon BAV at Aries (rashi 0) = 3", () => {
    expect(bav.moon.bindus[0]).toBe(3);
  });

  // Transit Cancer (T=3 → house=4):
  //   Sun{3,6,10,11,12}→NO, Moon{1,3,6,7,10,11}→NO, Mars{2,3,5,6,9,10,11}→NO
  //   Mercury{1,3,4,5,7,8,10,11}→YES, Jupiter{1,4,7,8,10,11,12}→YES
  //   Venus{3,4,5,7,9,10,11}→YES, Saturn{3,5,6,11}→NO, Lagna{3,6,10,11}→NO → total=3
  it("Moon BAV at Cancer (rashi 3) = 3", () => {
    expect(bav.moon.bindus[3]).toBe(3);
  });

  // ── Jupiter BAV spot tests ──────────────────────────────────────────────
  // Transit Aries (T=0 → house=1):
  //   Sun{1,2,3,4,7,8,9,10,11}→YES, Moon{2,5,7,9,11}→NO, Mars{1,2,4,7,8,10,11}→YES
  //   Mercury{1,2,4,5,6,9,10,11}→YES, Jupiter{1,2,3,4,7,8,10,11}→YES
  //   Venus{2,5,6,9,10,11}→NO, Saturn{3,5,6,12}→NO, Lagna{1,2,4,5,6,7,9,10,11}→YES
  //   → total=5
  it("Jupiter BAV at Aries (rashi 0) = 5", () => {
    expect(bav.jupiter.bindus[0]).toBe(5);
  });

  // Transit Taurus (T=1 → house=2):
  //   Sun{1,2,3,4,7,8,9,10,11}→YES, Moon{2,5,7,9,11}→YES, Mars{1,2,4,7,8,10,11}→YES
  //   Mercury{1,2,4,5,6,9,10,11}→YES, Jupiter{1,2,3,4,7,8,10,11}→YES
  //   Venus{2,5,6,9,10,11}→YES, Saturn{3,5,6,12}→NO, Lagna{1,2,4,5,6,7,9,10,11}→YES
  //   → total=7
  it("Jupiter BAV at Taurus (rashi 1) = 7", () => {
    expect(bav.jupiter.bindus[1]).toBe(7);
  });

  // ── Saturn BAV spot tests ───────────────────────────────────────────────
  // Transit Gemini (T=2 → house=3):
  //   Sun{1,2,4,7,8,10,11}→NO, Moon{3,6,11}→YES, Mars{3,5,6,10,11,12}→YES
  //   Mercury{6,8,9,10,11,12}→NO, Jupiter{5,6,11,12}→NO, Venus{6,11,12}→NO
  //   Saturn{3,5,6,11}→YES, Lagna{1,2,4,7,8,10,11}→NO → total=3
  it("Saturn BAV at Gemini (rashi 2) = 3", () => {
    expect(bav.saturn.bindus[2]).toBe(3);
  });

  // Transit Capricorn (T=9 → house=10):
  //   Sun{1,2,4,7,8,10,11}→YES, Moon{3,6,11}→NO, Mars{3,5,6,10,11,12}→YES
  //   Mercury{6,8,9,10,11,12}→YES, Jupiter{5,6,11,12}→NO, Venus{6,11,12}→NO
  //   Saturn{3,5,6,11}→NO, Lagna{1,2,4,7,8,10,11}→YES → total=4
  it("Saturn BAV at Capricorn (rashi 9) = 4", () => {
    expect(bav.saturn.bindus[9]).toBe(4);
  });

  // ── Venus BAV spot tests ────────────────────────────────────────────────
  // Transit Aries (T=0 → house=1):
  //   Sun{8,11,12}→NO, Moon{1,2,3,4,5,8,9,11,12}→YES, Mars{3,4,6,9,11,12}→NO
  //   Mercury{3,5,6,9,11}→NO, Jupiter{5,8,9,10,11}→NO, Venus{1,2,3,4,5,8,9,10,11}→YES
  //   Saturn{3,4,5,8,9,10,11}→NO, Lagna{1,2,3,4,5,8,9,11}→YES → total=3
  it("Venus BAV at Aries (rashi 0) = 3", () => {
    expect(bav.venus.bindus[0]).toBe(3);
  });

  // Transit Leo (T=4 → house=5):
  //   Sun{8,11,12}→NO, Moon{1,2,3,4,5,8,9,11,12}→YES, Mars{3,4,6,9,11,12}→NO
  //   Mercury{3,5,6,9,11}→YES, Jupiter{5,8,9,10,11}→YES, Venus{1,2,3,4,5,8,9,10,11}→YES
  //   Saturn{3,4,5,8,9,10,11}→YES, Lagna{1,2,3,4,5,8,9,11}→YES → total=6
  it("Venus BAV at Leo (rashi 4) = 6", () => {
    expect(bav.venus.bindus[4]).toBe(6);
  });
});

// ─── Multi-Sign Natal Chart Test ─────────────────────────────────────────────
//
// Verify that different natal positions produce different (and correct) BAV values.
// Chart: Sun=0(Aries), Moon=3(Cancer), Mars=6(Libra), Mercury=9(Capricorn),
//        Jupiter=0(Aries), Venus=3(Cancer), Saturn=6(Libra), Lagna=9(Capricorn)

describe("computeAshtakavarga() — varied natal positions", () => {
  const chart = makeChartCustom({
    Sun: 0, Moon: 3, Mars: 6, Mercury: 9,
    Jupiter: 0, Venus: 3, Saturn: 6,
  }, 9);
  const bav = computeAshtakavarga(chart);

  it("BAV totals are still classically correct (position-invariant)", () => {
    expect(bav.sun.total).toBe(48);
    expect(bav.moon.total).toBe(48);
    expect(bav.mercury.total).toBe(54);
    expect(bav.jupiter.total).toBe(56);
    expect(bav.venus.total).toBe(52);
    expect(bav.saturn.total).toBe(40);
  });

  it("SAV total is classically correct", () => {
    expect(bav.savTotal).toBe(340);
  });

  it("SAV values differ from all-Aries chart (positions affect distribution)", () => {
    const ariesBav = computeAshtakavarga(ARIES_CHART);
    // The totals are equal but distributions differ
    const differentDistribution = bav.sav.some((v, i) => v !== ariesBav.sav[i]);
    expect(differentDistribution).toBe(true);
  });
});

// ─── Missing Planet Graceful Handling ────────────────────────────────────────

describe("computeAshtakavarga() — missing planets", () => {
  it("chart with only some planets returns lower totals (missing refs skipped)", () => {
    // Chart missing Venus and Saturn
    const partialChart: RealChart = {
      planets: [
        { planet: "Sun",     rashi: 0, degree: 0, longitude: 0, isRetrograde: false, nakshatra: 0, pada: 1, nakshatraLord: "Ketu", subLord: "Ketu" },
        { planet: "Moon",    rashi: 0, degree: 0, longitude: 0, isRetrograde: false, nakshatra: 0, pada: 1, nakshatraLord: "Ketu", subLord: "Ketu" },
        { planet: "Mars",    rashi: 0, degree: 0, longitude: 0, isRetrograde: false, nakshatra: 0, pada: 1, nakshatraLord: "Ketu", subLord: "Ketu" },
        { planet: "Mercury", rashi: 0, degree: 0, longitude: 0, isRetrograde: false, nakshatra: 0, pada: 1, nakshatraLord: "Ketu", subLord: "Ketu" },
        { planet: "Jupiter", rashi: 0, degree: 0, longitude: 0, isRetrograde: false, nakshatra: 0, pada: 1, nakshatraLord: "Ketu", subLord: "Ketu" },
        // Venus and Saturn missing
      ],
      lagnaRashi: 0,
      lagnaLongitude: 0,
      ascendantDegree: 0,
      julianDay: 0,
    } as unknown as RealChart;

    const bav = computeAshtakavarga(partialChart);
    // Sun total should be less than 48 (missing Venus=3 + Saturn=8 contributions)
    expect(bav.sun.total).toBeLessThan(48);
    // Bindus array still has 12 entries
    expect(bav.sun.bindus).toHaveLength(12);
  });
});

// ─── getTransitBindus() ───────────────────────────────────────────────────────

describe("getTransitBindus()", () => {
  const bav = computeAshtakavarga(ARIES_CHART);

  it("returns same value as direct BAV access", () => {
    for (let sign = 0; sign < 12; sign++) {
      expect(getTransitBindus(bav, "Sun", sign)).toBe(bav.sun.bindus[sign]);
      expect(getTransitBindus(bav, "Jupiter", sign)).toBe(bav.jupiter.bindus[sign]);
      expect(getTransitBindus(bav, "Saturn", sign)).toBe(bav.saturn.bindus[sign]);
    }
  });

  it("returns 0 for invalid sign (out of range)", () => {
    expect(getTransitBindus(bav, "Moon", 12)).toBe(0);
    expect(getTransitBindus(bav, "Moon", -1)).toBe(0);
  });

  it("works for all 7 planets", () => {
    const planets: AshtakaPlanet[] = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
    planets.forEach(p => {
      expect(typeof getTransitBindus(bav, p, 0)).toBe("number");
    });
  });
});

// ─── getSAVStrength() ─────────────────────────────────────────────────────────

describe("getSAVStrength()", () => {
  it("≥30 = very_strong", () => {
    expect(getSAVStrength(30)).toBe("very_strong");
    expect(getSAVStrength(56)).toBe("very_strong"); // max possible
  });

  it("25-29 = strong", () => {
    expect(getSAVStrength(29)).toBe("strong");
    expect(getSAVStrength(25)).toBe("strong");
  });

  it("20-24 = moderate", () => {
    expect(getSAVStrength(24)).toBe("moderate");
    expect(getSAVStrength(20)).toBe("moderate");
  });

  it("15-19 = neutral", () => {
    expect(getSAVStrength(19)).toBe("neutral");
    expect(getSAVStrength(15)).toBe("neutral");
  });

  it("<15 = weak", () => {
    expect(getSAVStrength(14)).toBe("weak");
    expect(getSAVStrength(0)).toBe("weak");
  });

  it("boundary: 30 is very_strong, 29 is strong", () => {
    expect(getSAVStrength(30)).toBe("very_strong");
    expect(getSAVStrength(29)).toBe("strong");
  });

  it("boundary: 25 is strong, 24 is moderate", () => {
    expect(getSAVStrength(25)).toBe("strong");
    expect(getSAVStrength(24)).toBe("moderate");
  });
});

// ─── bavToMuhurtaAdjustment() ─────────────────────────────────────────────────

describe("bavToMuhurtaAdjustment()", () => {
  it("0 bindus = -10 (worst)", () => {
    expect(bavToMuhurtaAdjustment(0)).toBe(-10);
  });

  it("4 bindus = 0 (neutral)", () => {
    expect(bavToMuhurtaAdjustment(4)).toBe(0);
  });

  it("8 bindus = +10 (best)", () => {
    expect(bavToMuhurtaAdjustment(8)).toBe(10);
  });

  it("adjustments are monotonically increasing", () => {
    let prev = bavToMuhurtaAdjustment(0);
    for (let i = 1; i <= 8; i++) {
      const curr = bavToMuhurtaAdjustment(i);
      expect(curr).toBeGreaterThan(prev);
      prev = curr;
    }
  });

  it("values are in range -10 to +10", () => {
    for (let i = 0; i <= 8; i++) {
      const val = bavToMuhurtaAdjustment(i);
      expect(val).toBeGreaterThanOrEqual(-10);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it("clamps values below 0", () => {
    expect(bavToMuhurtaAdjustment(-1)).toBe(bavToMuhurtaAdjustment(0));
  });

  it("clamps values above 8", () => {
    expect(bavToMuhurtaAdjustment(9)).toBe(bavToMuhurtaAdjustment(8));
  });

  it("≥5 bindus produces positive adjustment", () => {
    expect(bavToMuhurtaAdjustment(5)).toBeGreaterThan(0);
    expect(bavToMuhurtaAdjustment(6)).toBeGreaterThan(0);
    expect(bavToMuhurtaAdjustment(7)).toBeGreaterThan(0);
  });

  it("≤2 bindus produces negative adjustment", () => {
    expect(bavToMuhurtaAdjustment(1)).toBeLessThan(0);
    expect(bavToMuhurtaAdjustment(2)).toBeLessThan(0);
  });
});

// ─── Backward Compatibility: computeChandrashtakavarga() ────────────────────

describe("computeChandrashtakavarga() backward compat", () => {
  it("returns integer 0-8", () => {
    for (let sign = 0; sign < 12; sign++) {
      const result = computeChandrashtakavarga(ARIES_CHART, sign);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(8);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("matches computeAshtakavarga().moon.bindus[sign]", () => {
    const bav = computeAshtakavarga(ARIES_CHART);
    for (let sign = 0; sign < 12; sign++) {
      expect(computeChandrashtakavarga(ARIES_CHART, sign)).toBe(bav.moon.bindus[sign]);
    }
  });

  it("Moon BAV total across all signs = 48 (backward compat sum)", () => {
    let total = 0;
    for (let sign = 0; sign < 12; sign++) {
      total += computeChandrashtakavarga(ARIES_CHART, sign);
    }
    expect(total).toBe(48);
  });

  it("works with varied natal chart positions", () => {
    const variedChart = makeChartCustom({ Sun: 1, Moon: 4, Mars: 7, Mercury: 10, Jupiter: 2, Venus: 5, Saturn: 8 }, 11);
    for (let sign = 0; sign < 12; sign++) {
      const compat = computeChandrashtakavarga(variedChart, sign);
      const modern = computeAshtakavarga(variedChart).moon.bindus[sign]!;
      expect(compat).toBe(modern);
    }
  });
});

// ─── Integration: Practical Muhurta Scenario ─────────────────────────────────

describe("Integration: BAV for transit scoring", () => {
  it("Saturn transit in its own BAV-strong sign is favorable", () => {
    // For all-Aries natal chart, find Saturn's strongest transit sign
    const bav = computeAshtakavarga(ARIES_CHART);
    const maxSaturnBindus = Math.max(...bav.saturn.bindus);
    expect(maxSaturnBindus).toBeGreaterThanOrEqual(5); // At least one sign should be strong
  });

  it("Jupiter's average BAV across 12 signs is highest (most benefic planet)", () => {
    const bav = computeAshtakavarga(ARIES_CHART);
    const jupiterAvg = bav.jupiter.total / 12;
    const saturnAvg  = bav.saturn.total / 12;
    const marsAvg    = bav.mars.total / 12;
    expect(jupiterAvg).toBeGreaterThan(saturnAvg);
    expect(jupiterAvg).toBeGreaterThan(marsAvg);
  });

  it("SAV average per sign ≈ 28.3 (340/12)", () => {
    const bav = computeAshtakavarga(ARIES_CHART);
    const avg = bav.savTotal / 12;
    expect(avg).toBeCloseTo(340 / 12, 1);
  });

  it("bavToMuhurtaAdjustment produces meaningful boost for Jupiter in strong sign", () => {
    const bav = computeAshtakavarga(ARIES_CHART);
    const jupiterSign1Bindus = bav.jupiter.bindus[1]!; // Taurus = 7 bindus
    const adjustment = bavToMuhurtaAdjustment(jupiterSign1Bindus);
    expect(adjustment).toBeGreaterThan(0); // Should be +8
  });
});
