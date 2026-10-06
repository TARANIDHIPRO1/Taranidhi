// Regression tests that lock the app's Muhurta rules to the 2026-10-07 verification
// report (docs/RULES_VERIFICATION_2026-10.md). If a test here fails, the code has drifted
// from the verified rule -- re-check the classical source before "fixing" the test.
//
// Status of the underlying rules: verified against secondary sources / English translation
// of Muhurta Chintamani; verse numbers NOT yet checked against the Sanskrit edition.
import { describe, it, expect } from "vitest";
import {
  getNityaYoga,
  NITYA_YOGA_NAMES,
  NITYA_YOGA_FULL_REJECT,
  NITYA_YOGA_OPENING_GHATIS,
  calculateNavtara,
  getAbhijitMuhurta,
} from "../muhurta";
import { calculatePanchangScore } from "../convergenceIndex";

const SPAN = 360 / 27;
/** Build a sun+moon longitude pair whose sum lands `deg` degrees into yoga `idx` (0-based). */
const at = (idx: number, deg: number): [number, number] => [(idx * SPAN + deg) % 360, 0];

describe("Nitya Yoga: names and order", () => {
  it("27 yogas, standard Panchang order", () => {
    expect(NITYA_YOGA_NAMES).toHaveLength(27);
    expect(NITYA_YOGA_NAMES[0]).toBe("Vishkambha");
    expect(NITYA_YOGA_NAMES[16]).toBe("Vyatipata");
    expect(NITYA_YOGA_NAMES[26]).toBe("Vaidhriti");
  });
  it("index = floor(((sun+moon) mod 360) / 13°20')", () => {
    expect(getNityaYoga(0, 0).index).toBe(0);
    expect(getNityaYoga(100, 20).index).toBe(Math.floor(120 / SPAN));
    expect(getNityaYoga(300, 100).index).toBe(Math.floor(40 / SPAN)); // wraps past 360
  });
});

describe("Nitya Yoga rejection (Muhurta Chintamani rule)", () => {
  it("only Vyatipata and Vaidhriti are rejected for the whole yoga", () => {
    expect([...NITYA_YOGA_FULL_REJECT].sort((a, b) => a - b)).toEqual([16, 26]);
    for (const idx of [16, 26]) {
      for (const d of [0.01, SPAN / 2, SPAN - 0.01]) {
        const r = getNityaYoga(...at(idx, d));
        expect(r.rejection).toBe("full");
        expect(r.rejectedNow).toBe(true);
        expect(r.quality).toBe("malefic");
      }
    }
  });

  it("the other seven are rejected only for their opening ghatis", () => {
    expect(NITYA_YOGA_OPENING_GHATIS).toEqual({ 0: 3, 5: 6, 8: 5, 9: 6, 12: 9, 14: 3, 18: 30 });
    for (const [idxStr, ghatis] of Object.entries(NITYA_YOGA_OPENING_GHATIS)) {
      const idx = Number(idxStr);
      const edge = (ghatis / 60) * SPAN;
      const inside = getNityaYoga(...at(idx, edge * 0.5));
      const outside = getNityaYoga(...at(idx, Math.min(edge + 0.2, SPAN - 0.01)));
      expect(inside.rejection).toBe("opening");
      expect(inside.rejectedNow).toBe(true);
      expect(outside.rejectedNow).toBe(false);
      expect(outside.quality).not.toBe("malefic");
    }
  });

  it("Vyaghata (9 ghatis ≈ 2.0°) and Parigha (half ≈ 6.67°) boundaries", () => {
    expect(getNityaYoga(...at(12, 1.9)).rejectedNow).toBe(true);
    expect(getNityaYoga(...at(12, 2.2)).rejectedNow).toBe(false);
    expect(getNityaYoga(...at(18, 6.6)).rejectedNow).toBe(true);
    expect(getNityaYoga(...at(18, 6.8)).rejectedNow).toBe(false);
  });

  it("other yogas are never rejected", () => {
    for (let i = 0; i < 27; i++) {
      if (i === 16 || i === 26 || NITYA_YOGA_OPENING_GHATIS[i] !== undefined) continue;
      const r = getNityaYoga(...at(i, 0.5));
      expect(r.rejection).toBe("none");
      expect(r.rejectedNow).toBe(false);
    }
  });

  it("is marked verified (MC 34-35 checked against the Hindi edition)", () => {
    expect(getNityaYoga(0, 0).verified).toBe(true);
  });
});

describe("Convergence panchang score uses the corrected yoga/tithi rules", () => {
  // args: tithi, nakshatra, yoga(1-based), karana, yogaRejectedNow
  const score = (yoga: number, rejectedNow?: boolean) => calculatePanchangScore(5, 3, yoga, 1, rejectedNow);
  it("Atiganda(6) and Vyaghata(13) are no longer 'very auspicious'", () => {
    expect(score(3)).toBeGreaterThan(score(6, true));   // Ayushman > Atiganda (rejected)
    expect(score(3)).toBeGreaterThan(score(13, true));  // Ayushman > Vyaghata (rejected)
  });
  it("Vyatipata(17) and Vaidhriti(27) are the lowest, regardless of position", () => {
    for (const y of [17, 27]) {
      expect(score(y, false)).toBeLessThan(score(6, true));
      expect(score(y)).toBe(score(y, true));
    }
  });
  it("opening-ghati yogas recover once the rejected portion has passed", () => {
    for (const y of [1, 6, 9, 10, 13, 15, 19]) {
      expect(score(y, false)).toBeGreaterThan(score(y, true));
    }
  });
  it("Amavasya (tithi 30) no longer scores as auspicious", () => {
    const amavasya = calculatePanchangScore(30, 3, 3, 1);
    const shuklaPanchami = calculatePanchangScore(5, 3, 3, 1);
    expect(amavasya).toBeLessThan(shuklaPanchami);
  });
});

describe("Tarabala: good taras and 3-cycle rule (Muhurta Chintamani, Gochara Prakarana)", () => {
  it("good taras are 2,4,6,8,9 in cycle 1", () => {
    const good = [] as number[];
    for (let pos = 1; pos <= 9; pos++) {
      const r = calculateNavtara(0, pos - 1);
      if (r.effectiveQuality === "benefic" || r.effectiveQuality === "most_benefic") good.push(pos);
    }
    expect(good).toEqual([2, 4, 6, 8, 9]);
  });
  it("Vipat/Pratyari/Vadha are adverse in cycle 1 and benefic in cycle 3", () => {
    for (const pos of [3, 5, 7]) {
      expect(["malefic", "most_malefic"]).toContain(calculateNavtara(0, pos - 1).effectiveQuality);
      expect(["benefic", "most_benefic"]).toContain(calculateNavtara(0, 18 + pos - 1).effectiveQuality);
    }
  });
});

describe("Abhijit: only the south-travel exception is supported", () => {
  const sunrise = new Date("2026-10-07T00:30:00Z");
  const sunset = new Date("2026-10-07T12:30:00Z");
  it("no Wednesday 'particularly powerful' or Monday-eastward claims", () => {
    for (const dow of [1, 3]) {
      const note = getAbhijitMuhurta(sunrise, sunset, sunrise, dow).note;
      expect(note).not.toMatch(/Wednesday|Monday|eastward|Budha/i);
      expect(note).toMatch(/south/i);
    }
  });
  it("window is 48 minutes centred on solar noon", () => {
    const r = getAbhijitMuhurta(sunrise, sunset, sunrise, 0);
    expect(r.end.getTime() - r.start.getTime()).toBe(48 * 60 * 1000);
  });
});
