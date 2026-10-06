import { describe, it, expect } from "vitest";
import { getTaraUpaya, PLANET_SUBSTITUTE } from "../upaya";

describe("upaya (Muhurta Chintamani Gochara v.10-13)", () => {
  it("maps Tara dosha to the book's remedy", () => {
    expect(getTaraUpaya(7)?.action).toMatch(/sesame.*gold/i);
    expect(getTaraUpaya(3)?.action).toMatch(/jaggery/i);
    expect(getTaraUpaya(1)?.action).toMatch(/vegetables/i);
    expect(getTaraUpaya(5)?.action).toMatch(/salt/i);
  });
  it("has no remedy for good taras", () => {
    for (const n of [2, 4, 6, 8, 9]) expect(getTaraUpaya(n)).toBeNull();
  });
  it("every entry is premium and cited", () => {
    for (const u of Object.values(PLANET_SUBSTITUTE)) { expect(u.tier).toBe("premium"); expect(u.source).toMatch(/MC/); }
  });
});

import { getUpayaForTara } from "../upaya";
describe("getUpayaForTara", () => {
  it("cycle 1 Vadha (7th star) -> sesame with gold", () => {
    const r = getUpayaForTara(0, 6);
    expect(r.tara.position).toBe(7);
    expect(r.upaya?.action).toMatch(/sesame/i);
  });
  it("cycle 3 Vadha -> no remedy; Janma always has one", () => {
    expect(getUpayaForTara(0, 24).tara.cycle).toBe(3);
    expect(getUpayaForTara(0, 24).upaya).toBeNull();
    expect(getUpayaForTara(0, 0).upaya?.action).toMatch(/vegetables/i);
  });
  it("good tara (Sampat) -> none", () => { expect(getUpayaForTara(0, 1).upaya).toBeNull(); });
});
