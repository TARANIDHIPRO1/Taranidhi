// Closed-form Lagna (Ascendant) calculation -- Lahiri ayanamsa, no ephemeris
// dependency. This is the server-side port of the formula already verified
// in the earlier single-file artifact against Naveen's own birth chart
// (08/04/1973, 06:15 UTC, Bhopal -> Mithuna/Gemini). See ARCHITECTURE.md
// Section 4: "Cusps are computable from RAMC + obliquity + latitude via
// iterative solve -- same input tier as the existing Lagna formula."
//
// VERIFIED (Session 5, this file): getLagnaRashiIndex(new Date("1973-04-08T06:15:00Z"),
// 23.2599, 77.4126) returns 2 (Mithuna/Gemini, 0-indexed from Mesha=0), matching
// the expected result. Run against Node directly, not inside the Worker runtime --
// re-verify after any change to this file using the same test case.
//
// Note on the ascendant formula's sign convention: the commonly-quoted textbook
// form (tan(Asc) = -cos(RAMC) / (sin(eps)*tan(lat) + cos(eps)*sin(RAMC))) produced
// a result exactly 180 degrees off in testing. The corrected form below negates
// both atan2 components relative to that textbook form -- this is what actually
// reproduced the verified test case, so trust the code, not the textbook phrasing,
// if the two ever seem to disagree during future edits.
//
// Ayanamsa note: this uses the documented IAE-based polynomial (Pani et al.,
// Orissa Journal of Physics, 2024) reproduced in the Session 5 research --
// NOT the Swiss Ephemeris standard value. The two differ by ~14 arcseconds
// at any given date. That's not enough to change a rashi (30deg = 108000
// arcsec) except within ~14" of a sign boundary, so it's acceptable for
// Lagna-rashi purposes but would matter for KP sub-lord boundaries (which
// can be as narrow as ~40'). When the KP module is built, it needs the
// Krishnamurti ayanamsa specifically (ARCHITECTURE.md Section 4), scoped
// separately from this -- do not reuse this function for that.

const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

function toJulianDayUTC(date: Date): number {
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hourFrac =
    date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;

  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    hourFrac +
    B -
    1524.5
  );
}

function julianCenturiesFromJ2000(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Greenwich Mean Sidereal Time, in degrees. Meeus formula. */
function gmstDegrees(jd: number): number {
  const T = julianCenturiesFromJ2000(jd);
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalizeDegrees(gmst);
}

/** Mean obliquity of the ecliptic, in degrees. */
function meanObliquityDegrees(T: number): number {
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

/**
 * Lahiri ayanamsa in degrees, via the documented IAE polynomial
 * (Pani et al. 2024) -- see file header note on the ~14" SE offset.
 */
function lahiriAyanamsaDegrees(T: number): number {
  const arcsec =
    85885.53192 +
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T * T * T -
    0.000023857 * T * T * T * T -
    0.0000000383 * T * T * T * T * T;
  return arcsec / 3600;
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Computes the sidereal (Lahiri) Ascendant longitude in degrees [0, 360).
 *
 * @param date       Birth date+time as a UTC Date object (caller must
 *                    convert local birth time to UTC before calling this --
 *                    this function does no timezone handling itself).
 * @param latitudeDeg  Birth latitude, positive north.
 * @param longitudeDeg Birth longitude, positive east.
 */
export function getSiderealAscendantDegrees(
  date: Date,
  latitudeDeg: number,
  longitudeDeg: number
): number {
  const jd = toJulianDayUTC(date);
  const T = julianCenturiesFromJ2000(jd);

  const gmst = gmstDegrees(jd);
  const lst = normalizeDegrees(gmst + longitudeDeg); // Local Sidereal Time in degrees
  const ramcRad = lst * DEG2RAD; // Right Ascension of the Midheaven

  const obliquityRad = meanObliquityDegrees(T) * DEG2RAD;
  const latRad = latitudeDeg * DEG2RAD;

  // Tropical Ascendant formula, solved via atan2 for correct quadrant
  // handling. See file header note: this sign convention is the one that
  // reproduced the verified test case, not the textbook-quoted form.
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(obliquityRad) * Math.tan(latRad) + Math.cos(obliquityRad) * Math.sin(ramcRad));
  const ascTropicalDeg = normalizeDegrees(Math.atan2(y, x) * RAD2DEG);

  const ayanamsa = lahiriAyanamsaDegrees(T);
  return normalizeDegrees(ascTropicalDeg - ayanamsa);
}

/** Returns the Lagna rashi index, 0 = Mesha (Aries) ... 11 = Meena (Pisces). */
export function getLagnaRashiIndex(date: Date, latitudeDeg: number, longitudeDeg: number): number {
  const siderealAsc = getSiderealAscendantDegrees(date, latitudeDeg, longitudeDeg);
  return Math.floor(siderealAsc / 30) % 12;
}

export function getLagnaRashiName(date: Date, latitudeDeg: number, longitudeDeg: number): string {
  return RASHI_NAMES[getLagnaRashiIndex(date, latitudeDeg, longitudeDeg)]!;
}
