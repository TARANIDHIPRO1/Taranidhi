/**
 * PANCHA PAKSHI (5-Bird Cycles)
 *
 * Vedic timing technique providing ultra-precise muhurta windows.
 * Birds cycle through 24 hours in 5 phases = 4.8 hours per bird.
 *
 * Implementation: Naveen K. Rai's proprietary system
 * Birds: Pheasant, Hamsa, Mayur, Uluk, Shukar
 * Cycle: 4.8 hours (288 minutes) per bird
 * Precision windows: 10-minute, 7-9 minute, and 1-hour variants
 *
 * Usage in Muhurta Scanning:
 *   const pakshi = getPakshiAtTime(now);
 *   console.log(`${pakshi.bird} is active (${pakshi.precisionMinutes}-min window)`);
 */

/**
 * Pancha Pakshi bird names (Naveen's system)
 * Order cycles through 24 hours
 */
export const PAKSHI_NAMES = [
  "Pheasant",   // 0: 00:00 - 04:48
  "Hamsa",      // 1: 04:48 - 09:36
  "Mayur",      // 2: 09:36 - 14:24
  "Uluk",       // 3: 14:24 - 19:12
  "Shukar",     // 4: 19:12 - 24:00
] as const;

export type PakshiBird = typeof PAKSHI_NAMES[number];

/**
 * CONSTANTS
 */
const PAKSHI_CYCLE_MINUTES = 288; // 4.8 hours = 288 minutes
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Precision window variants (Naveen's proprietary specification)
 * Different event types get different precision requirements
 */
export const PRECISION_WINDOWS = {
  CRITICAL: 10,    // Marriage, major business launches (±10 minutes)
  STANDARD: 30,    // Most events (±30 minutes, documented as "7-9 minute" in notes)
  GENERAL: 60,     // General auspicious checking (±1 hour)
} as const;

export interface PakshiWindow {
  bird: PakshiBird;
  birdIndex: number;           // 0-4
  startTime: Date;             // Start of bird's 4.8-hour cycle
  endTime: Date;               // End of bird's 4.8-hour cycle
  precisionMinutes: number;    // Window width (10, 30, or 60)
  timeToCenter: number;        // Minutes until center of bird window
  confidence: "high" | "medium" | "low"; // Based on distance from center
}

/**
 * Get the active Pancha Pakshi bird and its window at a given time
 *
 * @param now - Current date/time
 * @param precisionType - 'CRITICAL' | 'STANDARD' | 'GENERAL' (default: STANDARD)
 * @returns PakshiWindow object with bird name, window times, and confidence
 *
 * EXAMPLE:
 *   const now = new Date();
 *   const pakshi = getPakshiAtTime(now, 'CRITICAL');
 *   console.log(`${pakshi.bird} active, window: ${pakshi.precisionMinutes} min`);
 */
export function getPakshiAtTime(
  now: Date,
  precisionType: keyof typeof PRECISION_WINDOWS = "STANDARD"
): PakshiWindow {
  if (!now || isNaN(now.getTime())) {
    throw new Error(`Invalid date: ${now}`);
  }

  // Calculate minutes since midnight UTC
  const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const msSinceMidnight = now.getTime() - midnightUTC.getTime();
  const minutesSinceMidnight = Math.floor(msSinceMidnight / MINUTE_MS);

  // Which bird cycle are we in? (0-4)
  const birdIndex = Math.floor(minutesSinceMidnight / PAKSHI_CYCLE_MINUTES) % 5;
  const bird = PAKSHI_NAMES[birdIndex];

  // When does this bird cycle start/end?
  const cycleStartMinutes = birdIndex * PAKSHI_CYCLE_MINUTES;
  const cycleEndMinutes = cycleStartMinutes + PAKSHI_CYCLE_MINUTES;

  const startTime = new Date(midnightUTC.getTime() + cycleStartMinutes * MINUTE_MS);
  const endTime = new Date(midnightUTC.getTime() + cycleEndMinutes * MINUTE_MS);

  // Where are we in this bird's cycle?
  const minutesIntoCycle = minutesSinceMidnight - cycleStartMinutes;
  const cycleCenter = PAKSHI_CYCLE_MINUTES / 2;
  const distanceFromCenter = Math.abs(minutesIntoCycle - cycleCenter);

  // Confidence decreases as we move away from cycle center
  let confidence: "high" | "medium" | "low";
  if (distanceFromCenter < cycleCenter * 0.25) {
    confidence = "high";   // Center 50% of window
  } else if (distanceFromCenter < cycleCenter * 0.5) {
    confidence = "medium"; // Next 25% on each side
  } else {
    confidence = "low";    // Outer 25% (approaching next bird)
  }

  const precisionMinutes = PRECISION_WINDOWS[precisionType];
  const timeToCenter = cycleCenter - minutesIntoCycle;

  return {
    bird,
    birdIndex,
    startTime,
    endTime,
    precisionMinutes,
    timeToCenter,
    confidence,
  };
}

/**
 * Get Pancha Pakshi recommendation for a time range
 *
 * Useful for UI display: "Best muhurta windows in next 7 days"
 *
 * @param startDate - Range start
 * @param endDate - Range end
 * @param precisionType - Window precision requirement
 * @returns Array of optimal windows (one per bird per day)
 */
export function getPakshiRecommendations(
  startDate: Date,
  endDate: Date,
  precisionType: keyof typeof PRECISION_WINDOWS = "STANDARD"
): PakshiWindow[] {
  const recommendations: PakshiWindow[] = [];
  const current = new Date(startDate);

  // Iterate through each day in the range
  while (current <= endDate) {
    // Get the center point of each bird cycle for this day
    for (let birdIdx = 0; birdIdx < 5; birdIdx++) {
      const midnightUTC = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), 0, 0, 0));
      const cycleStartMinutes = birdIdx * PAKSHI_CYCLE_MINUTES;
      const centerTime = new Date(midnightUTC.getTime() + (cycleStartMinutes + PAKSHI_CYCLE_MINUTES / 2) * MINUTE_MS);

      if (centerTime >= startDate && centerTime <= endDate) {
        recommendations.push(getPakshiAtTime(centerTime, precisionType));
      }
    }

    // Move to next day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return recommendations;
}

/**
 * Determine if a specific time falls within an optimal Pancha Pakshi window
 *
 * @param time - Time to check
 * @param precisionType - Required precision
 * @returns true if time is within the precision window, false otherwise
 */
export function isOptimalPakshiTime(
  time: Date,
  precisionType: keyof typeof PRECISION_WINDOWS = "STANDARD"
): boolean {
  const pakshi = getPakshiAtTime(time, precisionType);
  const precisionMs = pakshi.precisionMinutes * MINUTE_MS;
  const cycleCenter = new Date(pakshi.startTime.getTime() + (PAKSHI_CYCLE_MINUTES / 2) * MINUTE_MS);

  // Check if time is within ±precisionMinutes of cycle center
  const distanceMs = Math.abs(time.getTime() - cycleCenter.getTime());
  return distanceMs <= precisionMs;
}

/**
 * Get all 5 bird cycles for a given day
 *
 * Useful for displaying full Pancha Pakshi schedule
 *
 * @param date - The date to calculate for (time portion ignored, uses UTC midnight)
 * @returns Array of 5 PakshiWindow objects (one per bird, in order)
 */
export function getPakshiDaySchedule(date: Date): PakshiWindow[] {
  const schedule: PakshiWindow[] = [];
  const midnightUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));

  for (let birdIdx = 0; birdIdx < 5; birdIdx++) {
    const cycleStartMinutes = birdIdx * PAKSHI_CYCLE_MINUTES;
    const cycleCenter = new Date(midnightUTC.getTime() + (cycleStartMinutes + PAKSHI_CYCLE_MINUTES / 2) * MINUTE_MS);
    schedule.push(getPakshiAtTime(cycleCenter, "STANDARD"));
  }

  return schedule;
}

/**
 * Validate test case: Compare calculated bird with expected bird
 *
 * For verification against historical muhurtas
 *
 * @param testTime - Time to calculate
 * @param expectedBird - What bird should be active (from practice records)
 * @param precisionType - Precision requirement for this event
 * @returns {pass: boolean, actual: PakshiBird, error: string|null}
 */
export function validatePakshiTestCase(
  testTime: Date,
  expectedBird: PakshiBird,
  precisionType: keyof typeof PRECISION_WINDOWS = "STANDARD"
): { pass: boolean; actual: PakshiBird; error: string | null } {
  try {
    const pakshi = getPakshiAtTime(testTime, precisionType);

    if (pakshi.bird === expectedBird) {
      return { pass: true, actual: pakshi.bird, error: null };
    } else {
      return {
        pass: false,
        actual: pakshi.bird,
        error: `Expected ${expectedBird}, got ${pakshi.bird}. Confidence: ${pakshi.confidence}, Distance from center: ${Math.abs(pakshi.timeToCenter)} min`,
      };
    }
  } catch (err) {
    return {
      pass: false,
      actual: "Pheasant",
      error: `Calculation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Score a time for Pancha Pakshi favorability (0-100)
 *
 * Used in convergence index calculation
 *
 * @param time - Time to score
 * @param precisionType - Event precision requirement
 * @returns Score from 0 (outer edge) to 100 (cycle center)
 */
export function scorePakshiFavorability(
  time: Date,
  precisionType: keyof typeof PRECISION_WINDOWS = "STANDARD"
): number {
  const pakshi = getPakshiAtTime(time, precisionType);
  const precisionMs = pakshi.precisionMinutes * MINUTE_MS;
  const cycleCenter = new Date(pakshi.startTime.getTime() + (PAKSHI_CYCLE_MINUTES / 2) * MINUTE_MS);

  const distanceMs = Math.abs(time.getTime() - cycleCenter.getTime());

  // Linear score: 100 at center, 0 at ±precisionMinutes
  if (distanceMs > precisionMs) {
    return 0; // Outside optimal window
  }

  return Math.round(100 * (1 - distanceMs / precisionMs));
}

/**
 * Export schedule for display/logging
 *
 * @param pakshi - PakshiWindow to format
 * @returns Human-readable string
 */
export function formatPakshiWindow(pakshi: PakshiWindow): string {
  const start = pakshi.startTime.toISOString().split("T")[1]?.substring(0, 5) || "";
  const end = pakshi.endTime.toISOString().split("T")[1]?.substring(0, 5) || "";
  return `${pakshi.bird} (${start}-${end} UTC) - ${pakshi.precisionMinutes}min window, ${pakshi.confidence} confidence`;
}
