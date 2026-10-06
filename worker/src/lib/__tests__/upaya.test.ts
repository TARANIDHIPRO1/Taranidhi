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
