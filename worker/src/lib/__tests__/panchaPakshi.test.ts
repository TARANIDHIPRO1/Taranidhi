/**
 * PANCHA PAKSHI TEST SUITE
 *
 * Tests for 5-bird cycle calculations
 * Verification against historical muhurtas needed from Naveen's practice
 */

import { describe, it, expect } from "vitest";
import {
  getPakshiAtTime,
  getPakshiRecommendations,
  getPakshiDaySchedule,
  isOptimalPakshiTime,
  validatePakshiTestCase,
  scorePakshiFavorability,
  formatPakshiWindow,
  PAKSHI_NAMES,
  PRECISION_WINDOWS,
} from "../panchaPakshi";

describe("Pancha Pakshi System", () => {
  /**
   * Test 1: Bird cycle timing (4.8 hours per bird)
   * Expected: Each bird active for exactly 288 minutes
   */
  it("cycles through 5 birds in exactly 24 hours", () => {
    // Test at each bird boundary
    const testDate = new Date("2026-09-28T00:00:00Z"); // Midnight UTC

    for (let birdIdx = 0; birdIdx < 5; birdIdx++) {
      const startOfCycle = new Date(testDate.getTime() + birdIdx * 288 * 60 * 1000);
      const endOfCycle = new Date(startOfCycle.getTime() + 288 * 60 * 1000);

      const pakshiAtStart = getPakshiAtTime(startOfCycle);
      const pakshiAtEnd = getPakshiAtTime(new Date(endOfCycle.getTime() - 1000)); // 1 sec before end

      expect(pakshiAtStart.bird).toBe(PAKSHI_NAMES[birdIdx]);
      expect(pakshiAtEnd.bird).toBe(PAKSHI_NAMES[birdIdx]);
    }
  });

  /**
   * Test 2: Correct bird identification
   * Times and expected birds
   */
  it("identifies correct bird for known times", () => {
    const tests = [
      { time: "2026-09-28T02:00:00Z", expectedBird: "Pheasant" },      // 02:00 UTC
      { time: "2026-09-28T07:00:00Z", expectedBird: "Hamsa" },        // 07:00 UTC
      { time: "2026-09-28T12:00:00Z", expectedBird: "Mayur" },        // 12:00 UTC
      { time: "2026-09-28T17:00:00Z", expectedBird: "Uluk" },         // 17:00 UTC
      { time: "2026-09-28T22:00:00Z", expectedBird: "Shukar" },       // 22:00 UTC
    ];

    for (const test of tests) {
      const pakshi = getPakshiAtTime(new Date(test.time));
      expect(pakshi.bird).toBe(test.expectedBird);
    }
  });

  /**
   * Test 3: Precision windows (CRITICAL, STANDARD, GENERAL)
   */
  it("respects precision window types", () => {
    const testTime = new Date("2026-09-28T06:00:00Z"); // Hamsa cycle

    const critical = getPakshiAtTime(testTime, "CRITICAL");
    const standard = getPakshiAtTime(testTime, "STANDARD");
    const general = getPakshiAtTime(testTime, "GENERAL");

    expect(critical.precisionMinutes).toBe(PRECISION_WINDOWS.CRITICAL);  // 10
    expect(standard.precisionMinutes).toBe(PRECISION_WINDOWS.STANDARD);  // 30
    expect(general.precisionMinutes).toBe(PRECISION_WINDOWS.GENERAL);    // 60
  });

  /**
   * Test 4: Confidence calculation (center vs edges)
   */
  it("calculates confidence based on distance from cycle center", () => {
    const baseTime = new Date("2026-09-28T00:00:00Z"); // Start of Pheasant cycle

    // Pheasant cycle center: 144 minutes (2:24 UTC)
    const centerTime = new Date(baseTime.getTime() + 144 * 60 * 1000);
    const nearCenterTime = new Date(baseTime.getTime() + 130 * 60 * 1000); // 14 min before center
    const edgeTime = new Date(baseTime.getTime() + 20 * 60 * 1000);        // Near start

    const centerPakshi = getPakshiAtTime(centerTime);
    const nearCenterPakshi = getPakshiAtTime(nearCenterTime);
    const edgePakshi = getPakshiAtTime(edgeTime);

    expect(centerPakshi.confidence).toBe("high");
    expect(nearCenterPakshi.confidence).toBe("high");
    expect(edgePakshi.confidence).toBe("low");
  });

  /**
   * Test 5: Optimal window detection
   */
  it("correctly identifies optimal vs non-optimal times", () => {
    const baseTime = new Date("2026-09-28T00:00:00Z"); // Start of Pheasant

    // Center of Pheasant cycle (optimal for CRITICAL)
    const centerTime = new Date(baseTime.getTime() + 144 * 60 * 1000);

    // Far from center (non-optimal for CRITICAL)
    const edgeTime = new Date(baseTime.getTime() + 10 * 60 * 1000);

    expect(isOptimalPakshiTime(centerTime, "CRITICAL")).toBe(true);
    expect(isOptimalPakshiTime(edgeTime, "CRITICAL")).toBe(false);
  });

  /**
   * Test 6: Daily schedule generation
   */
  it("generates complete 5-bird schedule for a day", () => {
    const schedule = getPakshiDaySchedule(new Date("2026-09-28T00:00:00Z"));

    expect(schedule).toHaveLength(5);
    expect(schedule[0]?.bird).toBe("Pheasant");
    expect(schedule[1]?.bird).toBe("Hamsa");
    expect(schedule[2]?.bird).toBe("Mayur");
    expect(schedule[3]?.bird).toBe("Uluk");
    expect(schedule[4]?.bird).toBe("Shukar");
  });

  /**
   * Test 7: Recommendations for date range
   */
  it("generates recommendations across multiple days", () => {
    const startDate = new Date("2026-09-28T00:00:00Z");
    const endDate = new Date("2026-10-02T23:59:59Z");

    const recs = getPakshiRecommendations(startDate, endDate, "CRITICAL");

    // 5 days × 5 birds = 25 recommendations
    expect(recs.length).toBeGreaterThanOrEqual(20);
    expect(recs.length).toBeLessThanOrEqual(25);
  });

  /**
   * Test 8: Favorability scoring (0-100)
   */
  it("scores favorability from 0 (edges) to 100 (center)", () => {
    const baseTime = new Date("2026-09-28T00:00:00Z");

    // Center: should score ~100
    const centerTime = new Date(baseTime.getTime() + 144 * 60 * 1000);
    const centerScore = scorePakshiFavorability(centerTime, "STANDARD");
    expect(centerScore).toBeGreaterThan(95);

    // Near edge: should score low
    const edgeTime = new Date(baseTime.getTime() + 10 * 60 * 1000);
    const edgeScore = scorePakshiFavorability(edgeTime, "STANDARD");
    expect(edgeScore).toBeLessThan(30);

    // Outside window: should be 0
    const outsideTime = new Date(baseTime.getTime() + 200 * 60 * 1000); // Outside CRITICAL window
    const outsideScore = scorePakshiFavorability(outsideTime, "CRITICAL");
    expect(outsideScore).toBe(0);
  });

  /**
   * Test 9: Test case validation
   * SETUP FOR HISTORICAL VERIFICATION (needs Naveen's data)
   */
  it("validates against historical muhurtas", () => {
    // Example from Naveen's practice (placeholder - needs real data)
    const testCases = [
      {
        time: new Date("2026-09-28T06:30:00Z"),
        expectedBird: "Hamsa" as const,
        precision: "STANDARD" as const,
      },
      // ADD MORE TEST CASES FROM YOUR PRACTICE
      // Format: { time: new Date("YYYY-MM-DDTHH:MM:SSZ"), expectedBird: "BirdName", precision: "CRITICAL"|"STANDARD"|"GENERAL" }
    ];

    for (const test of testCases) {
      const result = validatePakshiTestCase(test.time, test.expectedBird, test.precision);
      if (!result.pass) {
        console.log(`❌ Test failed: ${result.error}`);
      }
      expect(result.pass).toBe(true);
    }
  });

  /**
   * Test 10: Format output for UI/logging
   */
  it("formats window data for display", () => {
    const pakshi = getPakshiAtTime(new Date("2026-09-28T12:00:00Z"));
    const formatted = formatPakshiWindow(pakshi);

    expect(formatted).toContain(pakshi.bird);
    expect(formatted).toContain(String(pakshi.precisionMinutes));
    expect(formatted).toContain(pakshi.confidence);
  });

  /**
   * Test 11: Edge case - midnight transition
   */
  it("handles midnight correctly", () => {
    const justBeforeMidnight = new Date("2026-09-28T23:59:59Z");
    const justAfterMidnight = new Date("2026-09-29T00:00:01Z");

    const beforePakshi = getPakshiAtTime(justBeforeMidnight);
    const afterPakshi = getPakshiAtTime(justAfterMidnight);

    // Shukar ends at midnight, Pheasant starts
    expect(beforePakshi.bird).toBe("Shukar");
    expect(afterPakshi.bird).toBe("Pheasant");
  });

  /**
   * Test 12: Error handling
   */
  it("throws on invalid dates", () => {
    expect(() => getPakshiAtTime(new Date("invalid"))).toThrow();
    expect(() => getPakshiAtTime(null as any)).toThrow();
  });
});

/**
 * TEMPLATE FOR NAVEEN'S TEST CASES
 *
 * Copy this template for each historical muhurta you want to verify:
 */

describe("Pancha Pakshi - Historical Verification (Naveen's Practice)", () => {
  it.skip("TODO: Add test case from your practice record", () => {
    // Template for Naveen to fill in:
    // const testTime = new Date("YYYY-MM-DDTHH:MM:SSZ");
    // const expectedBird = "Hamsa"; // From your practice records
    // const precisionType = "CRITICAL"; // Event type
    // const result = validatePakshiTestCase(testTime, expectedBird, precisionType);
    // expect(result.pass).toBe(true);
  });

  // ADD 10 MORE TEST CASES LIKE ABOVE
  // Each one verifies a real muhurta from your practice where you know:
  //   - Exact date/time
  //   - Which bird was active
  //   - Whether it matched your prediction
});
