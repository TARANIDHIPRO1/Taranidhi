import { describe, it, expect } from "vitest";
import { getDailyMuhurtaWindows } from "../muhurta";
import { realSunriseSunset } from "../astro";

const MIN = 60000;
const at = (h: number, m = 0, dayOffset = 0) =>
  new Date(Date.UTC(2026, 2, 20 + dayOffset, h, m));

describe("getDailyMuhurtaWindows -- synthetic 12h day / 12h night (48-min muhurtas)", () => {
  const w = getDailyMuhurtaWindows(at(6), at(18), at(6, 0, 1));

  it("Abhijit = 8th day muhurta, 11:36-12:24, centred on noon", () => {
    expect(w.abhijit.start).toEqual(at(11, 36));
    expect(w.abhijit.end).toEqual(at(12, 24));
  });
  it("Vijaya = 11th day muhurta, 14:00-14:48", () => {
    expect(w.vijaya.start).toEqual(at(14, 0));
    expect(w.vijaya.end).toEqual(at(14, 48));
  });
  it("Brahma = 04:24-05:12 (96 to 48 min before sunrise)", () => {
    expect(w.brahma.start).toEqual(at(4, 24));
    expect(w.brahma.end).toEqual(at(5, 12));
  });
  it("Nishita = 8th night muhurta, 23:36-00:24, centred on midnight", () => {
    expect(w.nishita.start).toEqual(at(23, 36));
    expect(w.nishita.end).toEqual(at(0, 24, 1));
  });
});

describe("getDailyMuhurtaWindows -- variable day length", () => {
  it("scales muhurta length with the day (10h day -> 40-min muhurtas)", () => {
    const w = getDailyMuhurtaWindows(at(7), at(17), at(7, 0, 1));
    expect(w.abhijit.end.getTime() - w.abhijit.start.getTime()).toBe(40 * MIN);
    expect(w.vijaya.end.getTime() - w.vijaya.start.getTime()).toBe(40 * MIN);
    // Abhijit stays centred on the sunrise/sunset midpoint (12:00).
    expect((w.abhijit.start.getTime() + w.abhijit.end.getTime()) / 2).toBe(at(12).getTime());
  });
  it("Brahma stays a fixed 48 minutes regardless of day length", () => {
    const w = getDailyMuhurtaWindows(at(7), at(17), at(7, 0, 1));
    expect(w.brahma.end.getTime() - w.brahma.start.getTime()).toBe(48 * MIN);
  });
  it("rejects non-monotonic inputs", () => {
    expect(() => getDailyMuhurtaWindows(at(18), at(6), at(6, 0, 1))).toThrow();
    expect(() => getDailyMuhurtaWindows(at(6), at(18), at(12))).toThrow();
  });
});

describe("getDailyMuhurtaWindows -- real Bhopal sunrise/sunset", () => {
  // Equinox, solstices, and a 2026 Oct date (today's session date).
  const dates = [
    new Date(Date.UTC(2026, 2, 20, 6)),
    new Date(Date.UTC(2026, 5, 21, 6)),
    new Date(Date.UTC(2026, 9, 3, 6)),
    new Date(Date.UTC(2026, 11, 21, 6)),
  ];
  for (const d of dates) {
    it(`windows are ordered and non-overlapping on ${d.toISOString().slice(0, 10)}`, () => {
      const { sunrise, sunset, nextSunrise } = realSunriseSunset(d, 23.2505, 77.4065);
      const w = getDailyMuhurtaWindows(sunrise, sunset, nextSunrise);
      expect(w.brahma.end.getTime()).toBeLessThan(sunrise.getTime());
      expect(w.abhijit.start.getTime()).toBeGreaterThan(sunrise.getTime());
      expect(w.abhijit.end.getTime()).toBeLessThanOrEqual(w.vijaya.start.getTime());
      expect(w.vijaya.end.getTime()).toBeLessThan(sunset.getTime());
      expect(w.nishita.start.getTime()).toBeGreaterThan(sunset.getTime());
      expect(w.nishita.end.getTime()).toBeLessThan(nextSunrise.getTime());
      const mid = (sunrise.getTime() + sunset.getTime()) / 2;
      expect((w.abhijit.start.getTime() + w.abhijit.end.getTime()) / 2).toBeCloseTo(mid, -2);
    });
  }
});
