import { describe, it, expect } from "vitest";
import {
  CHALDEAN,
  buildHoras,
  buildUphoras,
  getCurrentHora,
  getCurrentUphora,
  getCurrentHoraUphora,
} from "../upahora";

// ── Reference times: Oct 5 2026, Bhopal (23.2505°N, 77.4065°E) ──
// Approximate sunrise/sunset — actual values from astro engine
// Sunday Oct 5 = weekday 0
const SR  = new Date("2026-10-05T01:05:00Z"); // ~06:35 IST
const SS  = new Date("2026-10-05T12:41:00Z"); // ~18:11 IST
const NSR = new Date("2026-10-06T01:06:00Z"); // next day sunrise

describe("CHALDEAN sequence", () => {
  it("has exactly 7 planets", () => {
    expect(CHALDEAN).toHaveLength(7);
  });

  it("starts with Sun (fastest apparent motion)", () => {
    expect(CHALDEAN[0]).toBe("Sun");
  });

  it("ends with Mars (slowest apparent motion)", () => {
    expect(CHALDEAN[6]).toBe("Mars");
  });

  it("contains all 7 classical planets exactly once", () => {
    const expected = new Set(["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"]);
    const actual = new Set(CHALDEAN);
    expect(actual).toEqual(expected);
  });
});

describe("buildHoras()", () => {
  const horas = buildHoras(0, SR, SS, NSR); // Sunday

  it("returns exactly 24 horas", () => {
    expect(horas).toHaveLength(24);
  });

  it("Sunday first hora is Sun (day lord for Sunday)", () => {
    expect(horas[0]!.lord).toBe("Sun");
  });

  it("first 12 horas are day horas", () => {
    horas.slice(0, 12).forEach(h => expect(h.isNight).toBe(false));
  });

  it("last 12 horas are night horas", () => {
    horas.slice(12).forEach(h => expect(h.isNight).toBe(true));
  });

  it("first hora starts at sunrise", () => {
    expect(horas[0]!.start.getTime()).toBe(SR.getTime());
  });

  it("hora 12 starts at sunset", () => {
    expect(horas[12]!.start.getTime()).toBe(SS.getTime());
  });

  it("last hora ends at next sunrise", () => {
    expect(horas[23]!.end.getTime()).toBe(NSR.getTime());
  });

  it("each consecutive hora is contiguous (no gap)", () => {
    for (let i = 0; i < 23; i++) {
      expect(horas[i]!.end.getTime()).toBe(horas[i + 1]!.start.getTime());
    }
  });

  it("lords cycle through Chaldean sequence", () => {
    // Sunday starts at Sun (CHALDEAN index 0)
    const sunIdx = CHALDEAN.indexOf("Sun");
    horas.forEach((h, i) => {
      expect(h.lord).toBe(CHALDEAN[(sunIdx + i) % 7]);
    });
  });

  it("Monday first hora is Moon", () => {
    const monHoras = buildHoras(1, SR, SS, NSR);
    expect(monHoras[0]!.lord).toBe("Moon");
  });

  it("Saturday first hora is Saturn", () => {
    const satHoras = buildHoras(6, SR, SS, NSR);
    expect(satHoras[0]!.lord).toBe("Saturn");
  });
});

describe("buildUphoras()", () => {
  const horas = buildHoras(0, SR, SS, NSR);
  const hora0 = horas[0]!; // Sun hora

  it("returns exactly 7 uphoras", () => {
    expect(buildUphoras(hora0)).toHaveLength(7);
  });

  it("first uphora lord = hora lord (Sun starts Sun uphora)", () => {
    expect(buildUphoras(hora0)[0]!.lord).toBe("Sun");
  });

  it("uphora lords cycle through Chaldean from hora lord", () => {
    const uphoras = buildUphoras(hora0);
    const sunIdx = CHALDEAN.indexOf("Sun");
    uphoras.forEach((u, i) => {
      expect(u.lord).toBe(CHALDEAN[(sunIdx + i) % 7]);
    });
  });

  it("7 uphora durations sum exactly to hora duration", () => {
    const hDur = hora0.end.getTime() - hora0.start.getTime();
    const uDur = buildUphoras(hora0).reduce((sum, u) => sum + u.durationMs, 0);
    // Allow 1ms rounding tolerance
    expect(Math.abs(uDur - hDur)).toBeLessThanOrEqual(1);
  });

  it("uphoras are contiguous (no gap)", () => {
    const uphoras = buildUphoras(hora0);
    for (let i = 0; i < 6; i++) {
      expect(uphoras[i]!.end.getTime()).toBe(uphoras[i + 1]!.start.getTime());
    }
  });

  it("first uphora starts at hora start", () => {
    expect(buildUphoras(hora0)[0]!.start.getTime()).toBe(hora0.start.getTime());
  });

  it("last uphora ends at hora end", () => {
    const uphoras = buildUphoras(hora0);
    expect(uphoras[6]!.end.getTime()).toBe(hora0.end.getTime());
  });

  it("each uphora duration = horaDuration / 7 (within 1ms)", () => {
    const hDur = hora0.end.getTime() - hora0.start.getTime();
    const expected = hDur / 7;
    buildUphoras(hora0).forEach(u => {
      expect(Math.abs(u.durationMs - expected)).toBeLessThanOrEqual(1);
    });
  });

  it("Venus hora uphora[0] = Venus, uphora[1] = Mercury", () => {
    const venusHora = horas.find(h => h.lord === "Venus")!;
    const ups = buildUphoras(venusHora);
    expect(ups[0]!.lord).toBe("Venus");
    expect(ups[1]!.lord).toBe("Mercury");
  });

  it("positions are 0-indexed 0 through 6", () => {
    const uphoras = buildUphoras(hora0);
    uphoras.forEach((u, i) => expect(u.position).toBe(i));
  });
});

describe("getCurrentHora()", () => {
  const horas = buildHoras(0, SR, SS, NSR);

  it("returns correct hora for a time in first hora", () => {
    const t = new Date(SR.getTime() + 10 * 60 * 1000); // 10min after sunrise
    const h = getCurrentHora(horas, t);
    expect(h).not.toBeNull();
    expect(h!.index).toBe(0);
    expect(h!.lord).toBe("Sun");
  });

  it("returns correct hora for a time in last day hora", () => {
    const t = new Date(SS.getTime() - 5 * 60 * 1000); // 5min before sunset
    const h = getCurrentHora(horas, t);
    expect(h).not.toBeNull();
    expect(h!.index).toBe(11);
  });

  it("start boundary: hora start belongs to that hora", () => {
    const h = getCurrentHora(horas, horas[3]!.start);
    expect(h!.index).toBe(3);
  });

  it("end boundary: hora end instant belongs to NEXT hora", () => {
    const endOfHora3 = horas[3]!.end;
    const h = getCurrentHora(horas, endOfHora3);
    // end instant = start of hora 4 → belongs to hora 4
    expect(h!.index).toBe(4);
  });

  it("returns null outside the 24-hora window", () => {
    const before = new Date(SR.getTime() - 1000);
    expect(getCurrentHora(horas, before)).toBeNull();
  });
});

describe("getCurrentUphora()", () => {
  const horas = buildHoras(0, SR, SS, NSR);
  const hora0 = horas[0]!;
  const uphoras = buildUphoras(hora0);

  it("finds correct uphora for mid-point of first uphora", () => {
    const midMs = uphoras[0]!.start.getTime() + uphoras[0]!.durationMs / 2;
    const u = getCurrentUphora(uphoras, new Date(midMs));
    expect(u).not.toBeNull();
    expect(u!.position).toBe(0);
  });

  it("returns null for a time outside this hora's uphoras", () => {
    const outside = new Date(hora0.end.getTime() + 1000);
    expect(getCurrentUphora(uphoras, outside)).toBeNull();
  });
});

describe("getCurrentHoraUphora() convenience", () => {
  it("returns non-null hora and uphora for a time during daylight", () => {
    const t = new Date(SR.getTime() + 90 * 60 * 1000); // 90min after sunrise
    const result = getCurrentHoraUphora(0, SR, SS, NSR, t);
    expect(result.hora).not.toBeNull();
    expect(result.uphora).not.toBeNull();
    expect(result.allHoras).toHaveLength(24);
  });

  it("uphora lord is valid Chaldean planet", () => {
    const t = new Date(SR.getTime() + 30 * 60 * 1000);
    const { uphora } = getCurrentHoraUphora(0, SR, SS, NSR, t);
    expect(CHALDEAN).toContain(uphora?.lord);
  });
});
