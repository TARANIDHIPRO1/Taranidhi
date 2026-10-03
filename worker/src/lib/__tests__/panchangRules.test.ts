import { describe, it, expect } from "vitest";
import { getYamghanda, getGulikaKaal, getRahuKaal, getKarana, isVishtiKarana, getYoga, getChoghadiya } from "../muhurta";

// Synthetic equinox-style day: 06:00-18:00 UTC => 1.5h Rahu/Yama/Gulika parts.
const D = (h: number, m = 0, day = 20) => new Date(Date.UTC(2026, 2, day, h, m));
const SR = D(6), SS = D(18), NSR = D(6, 0, 21);
const span = (w: { start: Date; end: Date }) => [w.start, w.end].map((d) => d.toISOString().slice(11, 16)).join("-");

describe("Rahu / Yamaganda / Gulika -- classical weekday tables (06:00-18:00 day)", () => {
  // Classical, as commonly published (Sun..Sat).
  const rahu = ["16:30-18:00", "07:30-09:00", "15:00-16:30", "12:00-13:30", "13:30-15:00", "10:30-12:00", "09:00-10:30"];
  const yama = ["12:00-13:30", "10:30-12:00", "09:00-10:30", "07:30-09:00", "06:00-07:30", "15:00-16:30", "13:30-15:00"];
  const gulika = ["15:00-16:30", "13:30-15:00", "12:00-13:30", "10:30-12:00", "09:00-10:30", "07:30-09:00", "06:00-07:30"];
  for (let dow = 0; dow < 7; dow++) {
    it(`weekday ${dow}`, () => {
      expect(span(getRahuKaal(SR, SS, dow))).toBe(rahu[dow]);
      expect(span(getYamghanda(SR, SS, dow))).toBe(yama[dow]);
      expect(span(getGulikaKaal(SR, SS, dow))).toBe(gulika[dow]);
    });
  }
  it("no weekday has Rahu, Yamaganda and Gulika overlapping", () => {
    for (let dow = 0; dow < 7; dow++) {
      const w = [getRahuKaal(SR, SS, dow), getYamghanda(SR, SS, dow), getGulikaKaal(SR, SS, dow)];
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
        expect(w[i]!.end.getTime() <= w[j]!.start.getTime() || w[j]!.end.getTime() <= w[i]!.start.getTime()).toBe(true);
      }
    }
  });
});

describe("Karana / Vishti (Bhadra)", () => {
  // Classical Bhadra placements: [tithi 1-30, half 1|2].
  const BHADRA = new Set(["4-2", "8-1", "11-2", "15-1", "18-2", "22-1", "25-2", "29-1"]);
  it("Vishti occurs in exactly the 8 classical half-tithis", () => {
    const found = new Set<string>();
    for (let n = 0; n < 60; n++) {
      const elong = n * 6 + 3; // mid of the half-tithi
      if (isVishtiKarana(elong, 0)) found.add(`${Math.floor(n / 2) + 1}-${(n % 2) + 1}`);
    }
    expect(found).toEqual(BHADRA);
  });
  it("names the full 60-karana cycle correctly", () => {
    const at = (k: number) => getKarana(k * 6 + 3, 0).name;
    expect(at(0)).toBe("Kimstughna");
    expect(at(1)).toBe("Bava");
    expect(at(6)).toBe("Vanija");
    expect(at(7)).toBe("Vishti");
    expect(at(8)).toBe("Bava");
    expect(at(56)).toBe("Vishti");
    expect(at(57)).toBe("Shakuni");
    expect(at(58)).toBe("Chatushpada");
    expect(at(59)).toBe("Naga");
  });
  it("handles Moon behind Sun in longitude (wrap-around)", () => {
    expect(getKarana(3, 350).index).toBe(Math.floor(((3 - 350 + 360) % 360) / 6));
  });
});

describe("Yoga", () => {
  it("27 yogas of 13°20' each, sidereal sum", () => {
    expect(getYoga(0, 0).name).toBe("Vishkambha");
    expect(getYoga(13.4, 0).name).toBe("Priti");
    const v = getYoga(16 * (360 / 27) + 1, 0);
    expect(v.name).toBe("Vyatipata");
    expect(v.mahadosha).toBe(true);
    const w = getYoga(359, 0);
    expect(w.name).toBe("Vaidhriti");
    expect(w.number).toBe(27);
    expect(w.mahadosha).toBe(true);
  });
  it("wraps when Sun+Moon exceeds 360", () => {
    expect(getYoga(300, 100).number).toBe(getYoga(40, 0).number);
  });
  it("exactly 9 inauspicious yogas, 2 of them mahadosha", () => {
    const seen = new Map<string, ReturnType<typeof getYoga>>();
    for (let i = 0; i < 27; i++) seen.set(getYoga(i * (360 / 27) + 1, 0).name, getYoga(i * (360 / 27) + 1, 0));
    expect(seen.size).toBe(27);
    expect([...seen.values()].filter((y) => y.inauspicious).length).toBe(9);
    expect([...seen.values()].filter((y) => y.mahadosha).length).toBe(2);
  });
});

describe("Choghadiya", () => {
  // Day tables Sun..Sat as published; night first-segment lord Sun..Sat.
  const DAY = [
    "Udveg Char Labh Amrit Kaal Shubh Rog Udveg",
    "Amrit Kaal Shubh Rog Udveg Char Labh Amrit",
    "Rog Udveg Char Labh Amrit Kaal Shubh Rog",
    "Labh Amrit Kaal Shubh Rog Udveg Char Labh",
    "Shubh Rog Udveg Char Labh Amrit Kaal Shubh",
    "Char Labh Amrit Kaal Shubh Rog Udveg Char",
    "Kaal Shubh Rog Udveg Char Labh Amrit Kaal",
  ];
  const NIGHT_FIRST = ["Shubh", "Char", "Kaal", "Udveg", "Amrit", "Rog", "Labh"];
  for (let dow = 0; dow < 7; dow++) {
    it(`weekday ${dow}: day table and night start`, () => {
      const s = getChoghadiya(SR, SS, NSR, dow);
      expect(s.filter((x) => x.isDaytime).map((x) => x.name).join(" ")).toBe(DAY[dow]);
      expect(s.filter((x) => !x.isDaytime)[0]!.name).toBe(NIGHT_FIRST[dow]);
    });
  }
  it("Sunday and Monday night sequences", () => {
    const night = (dow: number) => getChoghadiya(SR, SS, NSR, dow).filter((x) => !x.isDaytime).map((x) => x.name).join(" ");
    expect(night(0)).toBe("Shubh Amrit Char Rog Kaal Labh Udveg Shubh");
    expect(night(1)).toBe("Char Rog Kaal Labh Udveg Shubh Amrit Char");
  });
  it("8 equal day slots and 8 equal night slots, contiguous", () => {
    const s = getChoghadiya(D(6, 12), D(17, 58), D(6, 14, 21), 3);
    expect(s.length).toBe(16);
    for (let i = 1; i < 8; i++) expect(s[i]!.start.getTime()).toBe(s[i - 1]!.end.getTime());
    for (let i = 9; i < 16; i++) expect(s[i]!.start.getTime()).toBe(s[i - 1]!.end.getTime());
    expect(s[7]!.end.getTime()).toBe(D(17, 58).getTime());
    expect(s[15]!.end.getTime()).toBe(D(6, 14, 21).getTime());
  });
  it("rejects non-monotonic inputs", () => {
    expect(() => getChoghadiya(SS, SR, NSR, 0)).toThrow();
  });
});
