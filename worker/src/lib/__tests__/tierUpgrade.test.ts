import { describe, it, expect } from "vitest";
import { determineTierUpgrade, validateTierUpgradeLogic } from "../tierUpgrade";

describe("tierUpgrade", () => {
  describe("determineTierUpgrade", () => {
    it("should upgrade to premium on new_activation", () => {
      expect(determineTierUpgrade("basic", "new_activation")).toBe("premium");
    });

    it("should not downgrade on new_activation if already premium", () => {
      expect(determineTierUpgrade("premium", "new_activation")).toBe("premium");
    });

    it("should preserve tier on renewal", () => {
      expect(determineTierUpgrade("basic", "renewal")).toBeNull();
      expect(determineTierUpgrade("premium", "renewal")).toBeNull();
      expect(determineTierUpgrade("ultra", "renewal")).toBeNull();
    });

    it("should preserve tier on topup", () => {
      expect(determineTierUpgrade("basic", "topup")).toBeNull();
      expect(determineTierUpgrade("premium", "topup")).toBeNull();
      expect(determineTierUpgrade("ultra", "topup")).toBeNull();
    });
  });

  describe("validateTierUpgradeLogic", () => {
    it("should pass all validation tests", () => {
      const result = validateTierUpgradeLogic();
      expect(result.failed).toBe(0);
      expect(result.passed).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });
  });
});
