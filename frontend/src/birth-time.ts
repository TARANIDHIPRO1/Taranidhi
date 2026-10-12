/**
 * Convert a birth "wall clock" time (what the person writes down: date + time
 * in the place's timezone) into a UTC instant.
 *
 * Replaces the old kundali-form logic, which measured the timezone offset
 * using `new Date()` (the moment the form was submitted). That made every
 * saved birth time equal to the submission time, whatever was entered.
 *
 * Method: treat the wall time as if it were UTC, ask Intl what wall time that
 * instant shows in `timeZone`, and correct by the difference. A second pass
 * handles offsets that change near the date (DST, historical changes such as
 * India's +06:30 war time in 1942–45). Uses the IANA tz database built into
 * the browser, so historical offsets are respected. Independent of the
 * device's own timezone.
 */

export interface WallTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;  // 0-23
  minute: number;
}

function wallTimeOf(instantMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(instantMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // Wall time expressed as if it were UTC, for arithmetic.
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

/** Throws RangeError for an unknown time zone or an impossible date/time. */
export function wallTimeToUtc(w: WallTime, timeZone: string): Date {
  const { year, month, day, hour, minute } = w;
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const check = new Date(asUtc);
  if (
    !Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) ||
    !Number.isInteger(hour) || !Number.isInteger(minute) ||
    check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day ||
    hour < 0 || hour > 23 || minute < 0 || minute > 59
  ) {
    throw new RangeError(`Invalid date/time: ${year}-${month}-${day} ${hour}:${minute}`);
  }
  // Validates the zone name (throws RangeError if unknown).
  new Intl.DateTimeFormat("en-US", { timeZone }).format(0);

  let guess = asUtc - (wallTimeOf(asUtc, timeZone) - asUtc);
  // Second pass: the offset at the corrected instant may differ (DST edge).
  const offset2 = wallTimeOf(guess, timeZone) - guess;
  guess = asUtc - offset2;
  return new Date(guess);
}

/** "1973-04-08" + "11:45" -> WallTime, or null if the strings are malformed. */
export function parseWallTime(date: string, time: string): WallTime | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const t = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time.trim());
  if (!d || !t) return null;
  return { year: +d[1]!, month: +d[2]!, day: +d[3]!, hour: +t[1]!, minute: +t[2]! };
}
