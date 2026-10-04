import { describe, it, expect } from "vitest";
import { buildRealChart, getCurrentDasha, DASHA_SEQ, DASHA_YEARS } from "../astro";
import type { DashaPeriod } from "../astro";
import { getDashaChain, listSubPeriods } from "../dasha";

// Naveen's reference chart: 1973-04-08 11:45 IST (06:15 UTC), Bhopal.
const REF_DATE = new Date("1973-04-08T06:15:00Z");
const chart = buildRealChart(REF_DATE, 23.2505, 77.4065);

const DAY_MS = 86400000;
const YEAR_MS = 365.25 * DAY_MS; // same year length as astro.ts
const dur = (p: { start: Date; end: Date }) => p.end.getTime() - p.start.getTime();

const SAMPLE_DATES = [
  "1973-04-08T06:15:00Z",
  "1985-07-01T00:00:00Z",
  "1999-12-31T23:59:59Z",
  "2010-02-14T12:00:00Z",
  "2026-10-05T00:00:00Z",
  "2040-06-15T08:30:00Z",
  "2055-01-01T00:00:00Z",
].map((s) => new Date(s));

describe("getDashaChain", () => {
  it("(a) levels 1-2 equal getCurrentDasha maha/antar for several dates", () => {
    for (const d of SAMPLE_DATES) {
      const base = getCurrentDasha(chart, d)!;
      const chain = getDashaChain(chart, d)!;
      expect(base).not.toBeNull();
      expect(chain[0]!.level).toBe("maha");
      expect(chain[0]!.lord).toBe(base.maha.lord);
      expect(chain[0]!.start.getTime()).toBe(base.maha.start.getTime());
      expect(chain[0]!.end.getTime()).toBe(base.maha.end.getTime());
      expect(chain[1]!.level).toBe("antar");
      expect(chain[1]!.lord).toBe(base.antar.lord);
      expect(chain[1]!.start.getTime()).toBe(base.antar.start.getTime());
      expect(chain[1]!.end.getTime()).toBe(base.antar.end.getTime());
    }
  });

  it("returns 5 entries with the right level names by default", () => {
    const chain = getDashaChain(chart, SAMPLE_DATES[4])!;
    expect(chain.map((c) => c.level)).toEqual(["maha", "antar", "pratyantar", "sookshma", "prana"]);
  });

  it("honours depth 1..5 and clamps out-of-range depth", () => {
    const d = SAMPLE_DATES[3]!;
    for (let depth = 1; depth <= 5; depth++) {
      expect(getDashaChain(chart, d, depth)!.length).toBe(depth);
    }
    expect(getDashaChain(chart, d, 0)!.length).toBe(1);
    expect(getDashaChain(chart, d, 99)!.length).toBe(5);
  });

  it("every level contains asOf (half-open) and is nested in its parent", () => {
    for (const d of SAMPLE_DATES) {
      const chain = getDashaChain(chart, d)!;
      for (let i = 0; i < chain.length; i++) {
        expect(chain[i]!.start.getTime()).toBeLessThanOrEqual(d.getTime());
        expect(chain[i]!.end.getTime()).toBeGreaterThan(d.getTime());
        if (i > 0) {
          expect(chain[i]!.start.getTime()).toBeGreaterThanOrEqual(chain[i - 1]!.start.getTime());
          expect(chain[i]!.end.getTime()).toBeLessThanOrEqual(chain[i - 1]!.end.getTime());
        }
      }
    }
  });

  it("(c) durations of levels 3-5 match product-of-years/120^(n-1) on the real chart", () => {
    // Independent arithmetic: level-n duration (years) =
    //   Y(maha)*Y(antar)*...*Y(lvl n) / 120^(n-1), where Y(x)=DASHA_YEARS[x].
    // Level 2: Y(maha)*Y(antar)/120. Level 3: Y1*Y2*Y3/120^2. Etc.
    for (const d of SAMPLE_DATES) {
      const chain = getDashaChain(chart, d)!;
      let prod = 1;
      chain.forEach((c, i) => {
        prod *= DASHA_YEARS[c.lord]!;
        const expectedMs = (prod / Math.pow(120, i)) * YEAR_MS;
        // levels 1-2 come from getCurrentDasha (float cursor, <=1ms trunc); allow 5ms
        expect(Math.abs(dur(c) - expectedMs)).toBeLessThanOrEqual(5);
      });
    }
  });

  it("(e) before the cycle start and after ~120y returns null", () => {
    expect(getDashaChain(chart, new Date("1800-01-01T00:00:00Z"))).toBeNull();
    expect(getDashaChain(chart, new Date("2300-01-01T00:00:00Z"))).toBeNull();
    // same contract as getCurrentDasha
    expect(getCurrentDasha(chart, new Date("2300-01-01T00:00:00Z"))).toBeNull();
  });

  it("(d) maha boundary: exactly at maha end belongs to the next maha", () => {
    const base = getCurrentDasha(chart, new Date("2026-10-05T00:00:00Z"))!;
    const endMs = base.maha.end.getTime();
    const before = getDashaChain(chart, new Date(endMs - 1))!;
    const at = getDashaChain(chart, new Date(endMs))!;
    expect(before[0]!.lord).toBe(base.maha.lord);
    expect(at[0]!.start.getTime()).toBe(endMs);
    const nextLord = DASHA_SEQ[(DASHA_SEQ.indexOf(base.maha.lord) + 1) % 9];
    expect(at[0]!.lord).toBe(nextLord);
    // new maha starts with its own lord at every level
    for (const c of at) expect(c.lord).toBe(nextLord);
    expect(at.every((c) => c.start.getTime() === endMs)).toBe(true);
  });

  it("(d) sub-period boundary: exact end of a prana is the start of the next prana", () => {
    const chain = getDashaChain(chart, SAMPLE_DATES[4])!;
    const prana = chain[4]!;
    const endMs = prana.end.getTime();
    const atEnd = getDashaChain(chart, new Date(endMs))!;
    const beforeEnd = getDashaChain(chart, new Date(endMs - 1))!;
    expect(beforeEnd[4]!.start.getTime()).toBe(prana.start.getTime());
    expect(atEnd[4]!.start.getTime()).toBe(endMs);
    expect(atEnd[4]!.start.getTime()).not.toBe(prana.start.getTime());
  });

  it("(d) exactly at a start belongs to that period", () => {
    const chain = getDashaChain(chart, SAMPLE_DATES[2])!;
    const sook = chain[3]!;
    const atStart = getDashaChain(chart, sook.start)!;
    expect(atStart[3]!.start.getTime()).toBe(sook.start.getTime());
    expect(atStart[3]!.lord).toBe(sook.lord);
  });
});

describe("listSubPeriods", () => {
  const mk = (lord: string, years: number): DashaPeriod => ({
    lord,
    start: new Date("2000-01-01T00:00:00Z"),
    end: new Date(Date.UTC(2000, 0, 1) + years * YEAR_MS),
  });

  it("(b) returns 9 children, first child lord == parent lord, DASHA_SEQ order", () => {
    for (const lord of DASHA_SEQ) {
      const kids = listSubPeriods(mk(lord, DASHA_YEARS[lord]!));
      expect(kids).toHaveLength(9);
      expect(kids[0]!.lord).toBe(lord);
      const i0 = DASHA_SEQ.indexOf(lord);
      kids.forEach((k, i) => expect(k.lord).toBe(DASHA_SEQ[(i0 + i) % 9]));
    }
  });

  it("(b) children tile the parent exactly: contiguous, first.start==start, last.end==end, sum==parent", () => {
    for (const lord of DASHA_SEQ) {
      const parent = mk(lord, DASHA_YEARS[lord]!);
      const kids = listSubPeriods(parent);
      expect(kids[0]!.start.getTime()).toBe(parent.start.getTime());
      expect(kids[8]!.end.getTime()).toBe(parent.end.getTime());
      for (let i = 1; i < 9; i++) {
        expect(kids[i]!.start.getTime()).toBe(kids[i - 1]!.end.getTime());
      }
      expect(kids.reduce((s, k) => s + dur(k), 0)).toBe(dur(parent));
    }
  });

  it("tiles exactly even for an awkward non-round parent duration", () => {
    const parent: DashaPeriod = {
      lord: "Rahu",
      start: new Date(1234567891234),
      end: new Date(1234567891234 + 123456789),
    };
    const kids = listSubPeriods(parent);
    expect(kids[8]!.end.getTime()).toBe(parent.end.getTime());
    expect(kids.reduce((s, k) => s + dur(k), 0)).toBe(123456789);
    kids.forEach((k) => expect(dur(k)).toBeGreaterThan(0));
  });

  it("(c) Mercury maha (17y) -> Mercury antar = 17*17/120 y = 289/120 y = 879.64375 d", () => {
    // 289 * 365.25 = 105557.25 ; / 120 = 879.64375 days
    const kids = listSubPeriods(mk("Mercury", 17));
    expect(kids[0]!.lord).toBe("Mercury");
    expect(Math.abs(dur(kids[0]!) / DAY_MS - 879.64375)).toBeLessThan(1e-6);
  });

  it("(c) Mercury^4 sookshma = 17^3/120^2 y -> 17^4/120^3 y, hand-computed", () => {
    // Level durations for Mercury-Mercury-Mercury-Mercury-Mercury, starting from
    // a 17-year Mercury maha:
    //  antar      17^2/120      = 289/120          y = 879.64375 d
    //  pratyantar 17^3/120^2    = 4913/14400       y -> 4913*365.25 = 1,794,473.25 ; /14400 = 124.616197... d
    //  sookshma   17^4/120^3    = 83521/1,728,000  y -> 83521*365.25 = 30,506,045.25 ; /1,728,000 = 17.65397... d
    //  prana      17^5/120^4    = 1,419,857/207,360,000 y -> *365.25 = 518,602,769.25 ; /207,360,000 = 2.500977... d
    const maha = mk("Mercury", 17);
    const antar = listSubPeriods(maha)[0]!;
    const prat = listSubPeriods(antar)[0]!;
    const sook = listSubPeriods(prat)[0]!;
    const prana = listSubPeriods(sook)[0]!;
    expect(prat.lord).toBe("Mercury");
    expect(Math.abs(dur(prat) / DAY_MS - 1794473.25 / 14400)).toBeLessThan(1e-6);
    expect(Math.abs(dur(sook) / DAY_MS - 30506045.25 / 1728000)).toBeLessThan(1e-6);
    expect(Math.abs(dur(prana) / DAY_MS - 518602769.25 / 207360000)).toBeLessThan(1e-6);
    // sanity of the written-out decimals
    expect(dur(prat) / DAY_MS).toBeCloseTo(124.6162, 3);
    expect(dur(sook) / DAY_MS).toBeCloseTo(17.654, 3);
    expect(dur(prana) / DAY_MS).toBeCloseTo(2.501, 3);
  });

  it("(c) Sun-in-Sun-in-Sun pratyantar = 6^3/120^2 y = 216/14400 y = 5.47875 d (shortest maha lord)", () => {
    // 216*365.25 = 78,894 ; /14400 = 5.47875 d
    const maha = mk("Sun", 6);
    const sunAntar = listSubPeriods(maha)[0]!;
    const sunPrat = listSubPeriods(sunAntar)[0]!;
    expect(sunPrat.lord).toBe("Sun");
    expect(Math.abs(dur(sunPrat) / DAY_MS - 78894 / 14400)).toBeLessThan(1e-6);
  });

  it("(c) Venus maha: Venus antar is 20*20/120 = 10/3 y, Ketu antar (last) is 20*7/120 = 7/6 y", () => {
    const kids = listSubPeriods(mk("Venus", 20));
    expect(kids[0]!.lord).toBe("Venus");
    expect(Math.abs(dur(kids[0]!) / YEAR_MS - 10 / 3)).toBeLessThan(1e-9);
    expect(kids[1]!.lord).toBe("Sun"); // sequence after Venus is Sun
    expect(Math.abs(dur(kids[1]!) / YEAR_MS - (20 * 6) / 120)).toBeLessThan(1e-9);
    expect(kids[8]!.lord).toBe("Ketu"); // sequence wraps: Venus..Mercury, Ketu is 9th
    expect(Math.abs(dur(kids[8]!) / YEAR_MS - (20 * 7) / 120)).toBeLessThan(1e-9);
  });

  it("throws on an unknown lord", () => {
    expect(() => listSubPeriods(mk("Pluto", 1))).toThrow();
  });
});

describe("level 3-5 duration extremes over all 9^n lord combinations", () => {
  it("min/max equal Sun^n and Venus^n analytic values (enumerated independently)", () => {
    const ys = DASHA_SEQ.map((l) => DASHA_YEARS[l]!);
    for (const n of [3, 4, 5]) {
      let mn = Infinity;
      let mx = -Infinity;
      const walk = (k: number, prod: number) => {
        if (k === n) {
          const y = prod / Math.pow(120, n - 1);
          mn = Math.min(mn, y);
          mx = Math.max(mx, y);
          return;
        }
        for (const y of ys) walk(k + 1, prod * y);
      };
      walk(0, 1);
      expect(mn).toBeCloseTo(Math.pow(6, n) / Math.pow(120, n - 1), 12);
      expect(mx).toBeCloseTo(Math.pow(20, n) / Math.pow(120, n - 1), 12);
    }
  });
});
