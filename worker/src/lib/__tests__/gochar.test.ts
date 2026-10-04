import { describe, it, expect } from "vitest";
import {
  positionFromMoon,
  evaluatePlanetGochar,
  analyzeGochar,
  gocharToAdjustmentValue,
  GOCHAR_FAVORABLE_HOUSES,
  SADE_SATI_POSITIONS,
  DHAIYA_POSITIONS,
  GURU_GOCHAR_BEST,
} from "../gochar";

// ── Reference: Naveen's natal Moon ──────────────────────────────────────────
// Naveen birth: 1973-04-08, Bhopal — Moon Nakshatra from astro.ts
// For testing we use Moon in Taurus (1) as the natal reference.
const NATAL_MOON = 1; // Taurus (index 1)

// ── positionFromMoon() ───────────────────────────────────────────────────────
describe("positionFromMoon()", () => {
  it("same sign = position 1", () => {
    expect(positionFromMoon(1, 1)).toBe(1);
  });

  it("one sign ahead = position 2", () => {
    expect(positionFromMoon(2, 1)).toBe(2);
  });

  it("11 signs ahead = position 12", () => {
    expect(positionFromMoon(0, 1)).toBe(12);
  });

  it("6 signs ahead = position 7 (opposition)", () => {
    expect(positionFromMoon(7, 1)).toBe(7);
  });

  it("wraps correctly: transit rashi 0, natal 6 = position 7", () => {
    expect(positionFromMoon(0, 6)).toBe(7);
  });

  it("all 12 positions are unique and cover 1–12", () => {
    const results = new Set<number>();
    for (let t = 0; t < 12; t++) results.add(positionFromMoon(t, 0));
    expect(results.size).toBe(12);
    for (let p = 1; p <= 12; p++) expect(results).toContain(p);
  });
});

// ── GOCHAR_FAVORABLE_HOUSES ──────────────────────────────────────────────────
describe("GOCHAR_FAVORABLE_HOUSES", () => {
  it("Sun favorable in 3, 6, 10, 11 (Phaladeepika 26.5)", () => {
    const sun = GOCHAR_FAVORABLE_HOUSES.Sun;
    expect(sun.has(3)).toBe(true);
    expect(sun.has(6)).toBe(true);
    expect(sun.has(10)).toBe(true);
    expect(sun.has(11)).toBe(true);
    expect(sun.size).toBe(4);
  });

  it("Moon favorable in 1, 3, 6, 7, 10, 11 (Phaladeepika 26.7)", () => {
    const moon = GOCHAR_FAVORABLE_HOUSES.Moon;
    [1, 3, 6, 7, 10, 11].forEach(p => expect(moon.has(p)).toBe(true));
    expect(moon.size).toBe(6);
  });

  it("Mars favorable in 3, 6, 11 only (Phaladeepika 26.9)", () => {
    const mars = GOCHAR_FAVORABLE_HOUSES.Mars;
    [3, 6, 11].forEach(p => expect(mars.has(p)).toBe(true));
    expect(mars.size).toBe(3);
  });

  it("Mercury favorable in 2, 4, 6, 8, 10, 11 (Phaladeepika 26.11)", () => {
    const merc = GOCHAR_FAVORABLE_HOUSES.Mercury;
    [2, 4, 6, 8, 10, 11].forEach(p => expect(merc.has(p)).toBe(true));
    expect(merc.size).toBe(6);
  });

  it("Jupiter favorable in 2, 5, 7, 9, 11 (Phaladeepika 26.13)", () => {
    const jup = GOCHAR_FAVORABLE_HOUSES.Jupiter;
    [2, 5, 7, 9, 11].forEach(p => expect(jup.has(p)).toBe(true));
    expect(jup.size).toBe(5);
  });

  it("Venus favorable in 1,2,3,4,5,8,9,11,12 (Phaladeepika 26.15)", () => {
    const ven = GOCHAR_FAVORABLE_HOUSES.Venus;
    [1, 2, 3, 4, 5, 8, 9, 11, 12].forEach(p => expect(ven.has(p)).toBe(true));
    // unfavorable: 6, 7, 10
    [6, 7, 10].forEach(p => expect(ven.has(p)).toBe(false));
    expect(ven.size).toBe(9);
  });

  it("Saturn favorable in 3, 6, 11 only (Phaladeepika 26.17)", () => {
    const sat = GOCHAR_FAVORABLE_HOUSES.Saturn;
    [3, 6, 11].forEach(p => expect(sat.has(p)).toBe(true));
    expect(sat.size).toBe(3);
  });
});

// ── Special condition constants ───────────────────────────────────────────────
describe("Special condition constants", () => {
  it("Sade Sati covers positions 12, 1, 2", () => {
    expect(SADE_SATI_POSITIONS.has(12)).toBe(true);
    expect(SADE_SATI_POSITIONS.has(1)).toBe(true);
    expect(SADE_SATI_POSITIONS.has(2)).toBe(true);
    expect(SADE_SATI_POSITIONS.size).toBe(3);
  });

  it("Dhaiya covers 4th and 8th", () => {
    expect(DHAIYA_POSITIONS.has(4)).toBe(true);
    expect(DHAIYA_POSITIONS.has(8)).toBe(true);
    expect(DHAIYA_POSITIONS.size).toBe(2);
  });

  it("Guru Gochar best = 5th and 9th", () => {
    expect(GURU_GOCHAR_BEST.has(5)).toBe(true);
    expect(GURU_GOCHAR_BEST.has(9)).toBe(true);
    expect(GURU_GOCHAR_BEST.size).toBe(2);
  });
});

// ── evaluatePlanetGochar() ───────────────────────────────────────────────────
describe("evaluatePlanetGochar() — Saturn special conditions", () => {
  it("Saturn in same rashi as natal Moon = Sade Sati peak", () => {
    const r = evaluatePlanetGochar("Saturn", NATAL_MOON, NATAL_MOON); // pos = 1
    expect(r.positionFromMoon).toBe(1);
    expect(r.specialCondition).toBe("Sade Sati (Peak)");
    expect(r.score).toBe(-20);
    expect(r.favorable).toBe(false);
  });

  it("Saturn in sign before natal Moon = Sade Sati start (pos 12)", () => {
    const transitRashi = (NATAL_MOON - 1 + 12) % 12; // one sign before
    const r = evaluatePlanetGochar("Saturn", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(12);
    expect(r.specialCondition).toBe("Sade Sati");
    expect(r.score).toBe(-14);
  });

  it("Saturn in sign after natal Moon = Sade Sati exit (pos 2)", () => {
    const transitRashi = (NATAL_MOON + 1) % 12;
    const r = evaluatePlanetGochar("Saturn", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(2);
    expect(r.specialCondition).toBe("Sade Sati");
    expect(r.score).toBe(-14);
  });

  it("Saturn in 4th from natal Moon = Kantaka Shani", () => {
    const transitRashi = (NATAL_MOON + 3) % 12; // position 4
    const r = evaluatePlanetGochar("Saturn", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(4);
    expect(r.specialCondition).toBe("Kantaka Shani");
    expect(r.score).toBe(-10);
  });

  it("Saturn in 8th from natal Moon = Ashtama Shani", () => {
    const transitRashi = (NATAL_MOON + 7) % 12; // position 8
    const r = evaluatePlanetGochar("Saturn", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(8);
    expect(r.specialCondition).toBe("Ashtama Shani");
    expect(r.score).toBe(-10);
  });

  it("Saturn in 3rd from natal Moon = favorable (no special condition)", () => {
    const transitRashi = (NATAL_MOON + 2) % 12; // position 3
    const r = evaluatePlanetGochar("Saturn", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(3);
    expect(r.favorable).toBe(true);
    expect(r.specialCondition).toBeNull();
    expect(r.score).toBeGreaterThan(0);
  });
});

describe("evaluatePlanetGochar() — Jupiter special conditions", () => {
  it("Jupiter in 9th from natal Moon = Guru Gochar (score 16)", () => {
    const transitRashi = (NATAL_MOON + 8) % 12; // position 9
    const r = evaluatePlanetGochar("Jupiter", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(9);
    expect(r.specialCondition).toBe("Guru Gochar");
    expect(r.score).toBe(16);
  });

  it("Jupiter in 5th from natal Moon = Guru Gochar (score 18)", () => {
    const transitRashi = (NATAL_MOON + 4) % 12; // position 5
    const r = evaluatePlanetGochar("Jupiter", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(5);
    expect(r.specialCondition).toBe("Guru Gochar");
    expect(r.score).toBe(18);
  });

  it("Jupiter in 8th from natal Moon = Ashtama Guru (score -10)", () => {
    const transitRashi = (NATAL_MOON + 7) % 12;
    const r = evaluatePlanetGochar("Jupiter", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(8);
    expect(r.specialCondition).toBe("Ashtama Guru");
    expect(r.score).toBe(-10);
  });

  it("Jupiter in 11th from natal Moon = favorable (no special label)", () => {
    const transitRashi = (NATAL_MOON + 10) % 12;
    const r = evaluatePlanetGochar("Jupiter", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(11);
    expect(r.favorable).toBe(true);
    expect(r.specialCondition).toBeNull();
    expect(r.score).toBeGreaterThan(0);
  });
});

describe("evaluatePlanetGochar() — Moon special conditions", () => {
  it("Transit Moon in 8th from natal Moon = Ashtama Chandra", () => {
    const transitRashi = (NATAL_MOON + 7) % 12;
    const r = evaluatePlanetGochar("Moon", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(8);
    expect(r.specialCondition).toBe("Ashtama Chandra");
    expect(r.score).toBe(-8);
  });

  it("Transit Moon in 11th from natal Moon = favorable", () => {
    const transitRashi = (NATAL_MOON + 10) % 12;
    const r = evaluatePlanetGochar("Moon", transitRashi, NATAL_MOON);
    expect(r.positionFromMoon).toBe(11);
    expect(r.favorable).toBe(true);
    expect(r.score).toBeGreaterThan(0);
  });
});

describe("evaluatePlanetGochar() — general planets", () => {
  it("Sun in 3rd from natal Moon = favorable", () => {
    const r = evaluatePlanetGochar("Sun", (NATAL_MOON + 2) % 12, NATAL_MOON);
    expect(r.favorable).toBe(true);
    expect(r.score).toBeGreaterThan(0);
    expect(r.specialCondition).toBeNull();
  });

  it("Sun in 8th from natal Moon = unfavorable", () => {
    const r = evaluatePlanetGochar("Sun", (NATAL_MOON + 7) % 12, NATAL_MOON);
    expect(r.favorable).toBe(false);
    expect(r.score).toBeLessThan(0);
  });

  it("Venus in 12th from natal Moon = favorable (unusual — Venus likes 12th)", () => {
    const r = evaluatePlanetGochar("Venus", (NATAL_MOON - 1 + 12) % 12, NATAL_MOON);
    expect(r.positionFromMoon).toBe(12);
    expect(r.favorable).toBe(true);
    expect(r.score).toBeGreaterThan(0);
  });

  it("Venus in 7th from natal Moon = unfavorable", () => {
    const r = evaluatePlanetGochar("Venus", (NATAL_MOON + 6) % 12, NATAL_MOON);
    expect(r.positionFromMoon).toBe(7);
    expect(r.favorable).toBe(false);
    expect(r.score).toBeLessThan(0);
  });

  it("Mercury in 4th from natal Moon = favorable", () => {
    const r = evaluatePlanetGochar("Mercury", (NATAL_MOON + 3) % 12, NATAL_MOON);
    expect(r.positionFromMoon).toBe(4);
    expect(r.favorable).toBe(true);
    expect(r.score).toBeGreaterThan(0);
  });
});

// ── analyzeGochar() ──────────────────────────────────────────────────────────
describe("analyzeGochar()", () => {
  it("all planets in favorable positions → very_favorable", () => {
    // Put Jupiter in 9th (Guru Gochar), Saturn in 11th, others in favorable spots
    const transitRashis = {
      Jupiter: (NATAL_MOON + 8) % 12,   // pos 9 — Guru Gochar
      Saturn:  (NATAL_MOON + 10) % 12,  // pos 11 — favorable
      Moon:    (NATAL_MOON + 10) % 12,  // pos 11 — favorable
      Sun:     (NATAL_MOON + 2) % 12,   // pos 3 — favorable
    };
    const r = analyzeGochar(NATAL_MOON, transitRashis);
    expect(r.totalScore).toBeGreaterThan(20);
    expect(r.severity).toBe("very_favorable");
    expect(r.specialConditions).toContain("Guru Gochar");
  });

  it("Sade Sati alone → very_unfavorable", () => {
    const r = analyzeGochar(NATAL_MOON, {
      Saturn: NATAL_MOON, // pos 1 = Sade Sati peak
    });
    expect(r.specialConditions).toContain("Sade Sati (Peak)");
    expect(r.severity).toBe("very_unfavorable");
  });

  it("Sade Sati + Guru Gochar 11th → partial relief applied", () => {
    const withGuru = analyzeGochar(NATAL_MOON, {
      Saturn:  NATAL_MOON,              // Sade Sati peak (-20)
      Jupiter: (NATAL_MOON + 10) % 12, // pos 11 → partial Vedha relief (+6)
    });
    const withoutGuru = analyzeGochar(NATAL_MOON, {
      Saturn: NATAL_MOON, // Sade Sati peak only
    });
    expect(withGuru.totalScore).toBeGreaterThan(withoutGuru.totalScore);
    expect(withGuru.specialConditions).toContain("Guru partial Vedha relief (11th)");
  });

  it("missing planets are skipped (no error)", () => {
    const r = analyzeGochar(NATAL_MOON, { Moon: (NATAL_MOON + 10) % 12 });
    expect(r.planets).toHaveLength(1);
    expect(r.planets[0]!.planet).toBe("Moon");
  });

  it("empty transit rashis = 0 score, neutral severity", () => {
    const r = analyzeGochar(NATAL_MOON, {});
    expect(r.totalScore).toBe(0);
    expect(r.severity).toBe("neutral");
    expect(r.planets).toHaveLength(0);
    expect(r.specialConditions).toHaveLength(0);
  });

  it("natalMoonRashi is preserved in result", () => {
    const r = analyzeGochar(5, { Jupiter: 8 });
    expect(r.natalMoonRashi).toBe(5);
  });

  it("planets appear in priority order (Jupiter first, then Saturn)", () => {
    const r = analyzeGochar(NATAL_MOON, {
      Saturn:  0,
      Jupiter: 3,
      Moon:    5,
      Sun:     7,
    });
    expect(r.planets[0]!.planet).toBe("Jupiter");
    expect(r.planets[1]!.planet).toBe("Saturn");
    expect(r.planets[2]!.planet).toBe("Moon");
    expect(r.planets[3]!.planet).toBe("Sun");
  });

  it("summary mentions planet count and score", () => {
    const r = analyzeGochar(NATAL_MOON, { Jupiter: (NATAL_MOON + 8) % 12 });
    expect(r.summary).toContain("1 planets evaluated");
    expect(r.summary).toContain("Gochar score");
  });
});

// ── gocharToAdjustmentValue() ────────────────────────────────────────────────
describe("gocharToAdjustmentValue()", () => {
  it("clamps very high scores to +30", () => {
    const r = analyzeGochar(NATAL_MOON, {
      Jupiter: (NATAL_MOON + 8) % 12,  // Guru Gochar +16
      Saturn:  (NATAL_MOON + 10) % 12, // favorable +18
      Moon:    (NATAL_MOON + 10) % 12, // favorable +10
      Sun:     (NATAL_MOON + 2) % 12,  // favorable
      Venus:   (NATAL_MOON + 1) % 12,  // favorable
    });
    const adj = gocharToAdjustmentValue(r);
    expect(adj).toBeLessThanOrEqual(30);
    expect(adj).toBeGreaterThan(0);
  });

  it("clamps very low scores to -30", () => {
    const r = analyzeGochar(NATAL_MOON, {
      Saturn:  NATAL_MOON,             // Sade Sati peak -20
      Jupiter: (NATAL_MOON + 7) % 12, // Ashtama Guru -10
      Moon:    (NATAL_MOON + 7) % 12, // Ashtama Chandra -8
      Sun:     (NATAL_MOON + 1) % 12, // unfavorable
      Mars:    (NATAL_MOON + 1) % 12, // unfavorable
    });
    const adj = gocharToAdjustmentValue(r);
    expect(adj).toBeGreaterThanOrEqual(-30);
    expect(adj).toBeLessThan(0);
  });

  it("zero score → 0 adjustment", () => {
    const adj = gocharToAdjustmentValue({
      natalMoonRashi: 0,
      planets: [],
      specialConditions: [],
      totalScore: 0,
      severity: "neutral",
      summary: "",
    });
    expect(adj).toBe(0);
  });
});
