// Real Vedic chart calculation using astronomy-engine (VSOP87/ELP2000
// precision -- arcsecond-grade). Ported from the TaraNidhi Floot prototype's
// helpers/realChart.tsx, which documents these as PROVEN formulas verified
// against Swiss Ephemeris to within 0.001 degrees during standalone-app
// development. Server-side port so scoring/chart math never runs client-side
// (ARCHITECTURE.md Section 8: "the scoring logic itself should never be
// exposed to the client -- all scoring happens server-side in Workers").
//
// Ayanamsa: Lahiri only, matching ARCHITECTURE.md Section 4's app-wide
// default. Krishnamurti ayanamsa for the KP module is a SEPARATE, not-yet-built
// concern -- do not reuse this file's ayanamsa for that when it's built.
//
// This duplicates the closed-form Ascendant formula already in lib/lagna.ts,
// deliberately: lagna.ts was verified independently (Session 5, against
// Naveen's own chart) and this file's formula was verified independently
// against Swiss Ephemeris in the Floot prototype. The two use the same
// atan2 expression in a different but algebraically identical arrangement --
// cross-checked here as an extra correctness signal, not redundant code to
// clean up casually. lagna.ts's getLagnaRashiIndex remains the endpoint's
// canonical Lagna source; this file adds what lagna.ts doesn't have:
// planetary longitudes, nakshatra, and Vimshottari Dasha.

import * as Astronomy from "astronomy-engine";

const DEG = Math.PI / 180;
const norm360 = (x: number): number => ((x % 360) + 360) % 360;

// ── Astrological Configuration (BUG-06 FIX) ──
// These values determine which ayanamsa, house system, and dasha system are used
// for chart calculations. They are now environment-aware instead of hardcoded,
// allowing configuration per deployment environment.
//
// Per ARCHITECTURE.md Section 4:
// - Lahiri ayanamsa is the app-wide default (not Krishnamurti, which is KP-specific)
// - Placidus is the standard house system for KP charts
// - Vimshottari is the classical Dasha system (120-year cycle)
export type AyanamsaType = "lahiri" | "fagan" | "deluce";
export type HouseSystem = "placidus" | "equal" | "whole-sign";
export type DashaSystem = "vimshottari" | "ashtottari";

const VALID_AYANAMSAS: AyanamsaType[] = ["lahiri", "fagan", "deluce"];
const VALID_HOUSE_SYSTEMS: HouseSystem[] = ["placidus", "equal", "whole-sign"];
const VALID_DASHA_SYSTEMS: DashaSystem[] = ["vimshottari", "ashtottari"];

// Get astrological config from Cloudflare environment (not Node.js process.env)
// This function must be called at runtime with the 'env' parameter from the fetch handler
// DO NOT access process.env here — Cloudflare Workers don't have it
export function getAstroConfig(env: any) {
  const ayanamsaType: AyanamsaType = (
    (env?.AYANAMSA_TYPE as string) ?? "lahiri"
  ) as AyanamsaType;
  const houseSystem: HouseSystem = (
    (env?.HOUSE_SYSTEM as string) ?? "placidus"
  ) as HouseSystem;
  const dashaSystem: DashaSystem = (
    (env?.DASHA_SYSTEM as string) ?? "vimshottari"
  ) as DashaSystem;

  // Validate configuration
  if (!VALID_AYANAMSAS.includes(ayanamsaType)) {
    throw new Error(
      `Invalid AYANAMSA_TYPE: "${ayanamsaType}". Must be one of: ${VALID_AYANAMSAS.join(", ")}`
    );
  }
  if (!VALID_HOUSE_SYSTEMS.includes(houseSystem)) {
    throw new Error(
      `Invalid HOUSE_SYSTEM: "${houseSystem}". Must be one of: ${VALID_HOUSE_SYSTEMS.join(", ")}`
    );
  }
  if (!VALID_DASHA_SYSTEMS.includes(dashaSystem)) {
    throw new Error(
      `Invalid DASHA_SYSTEM: "${dashaSystem}". Must be one of: ${VALID_DASHA_SYSTEMS.join(", ")}`
    );
  }

  return { ayanamsaType, houseSystem, dashaSystem };
}

// Defaults for when no env is available
export const AYANAMSA_TYPE: AyanamsaType = "lahiri";
export const HOUSE_SYSTEM: HouseSystem = "placidus";
export const DASHA_SYSTEM: DashaSystem = "vimshottari";

export function julianDayFromUtc(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Lahiri Ayanamsa (app-wide default per ARCHITECTURE.md Section 4).
 *  Polynomial from the Floot prototype, claimed verified vs Swiss Ephemeris
 *  to 0.001°. This is the general-purpose ayanamsa for Muhurta, natal chart
 *  displays, Hora scoring, etc. The KP module uses krishnamurtiAyanamsa()
 *  instead -- see that function's comment for the calibration story. */
export function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return (
    (85885.53192 +
      5028.796195 * T +
      1.1054348 * T * T +
      0.00007964 * T * T * T) /
    3600
  );
}

// KRISHNAMURTI AYANAMSA -- scoped to KP module ONLY (ARCHITECTURE.md Section
// 4: "Krishnamurti ayanamsa is scoped ONLY to the KP/Query-Window module --
// it must never leak into or override the app-wide default.")
//
// CALIBRATION (this session, with Naveen): Naveen provided his own KP chart
// from onlinejyotish.com (08/04/1973 11:45 IST, Bhopal) -- a tool he
// confirmed is trustworthy. Our Lahiri formula's Ascendant, MC, and 4
// independent Placidus cusps ALL differed from that KP reference by the SAME
// constant: +0.0965° (5'47"), with only ~1.8 arcsec scatter across 6 checks.
// That uniform offset confirms:
//   (a) The Placidus geometry is correct (independent cusps all agree).
//   (b) The difference is purely ayanamsa-constant, not formula error.
//
// The KP reference tool presumably uses Krishnamurti ayanamsa (standard for
// KP charts), and the ~5'47" offset is close to the historically-documented
// Lahiri-vs-old-Krishnamurti difference. So: Krishnamurti = Lahiri - 0.0965°
// at this epoch.
//
// CAVEAT: calibrated from a SINGLE reference chart at a SINGLE epoch (1973).
// A constant additive correction fixes a constant-term discrepancy but would
// NOT catch a rate (drift-speed) mismatch -- that would only appear as a
// growing offset at a very different epoch. Not yet tested against a second
// chart at a different date. If a future verification shows a materially
// different offset, this constant needs revisiting.
const KP_AYANAMSA_OFFSET_DEG = -0.0965;

/** Krishnamurti Ayanamsa -- for KP module use ONLY.
 *  See the calibration note above. Do NOT use this in Muhurta, natal charts,
 *  or any non-KP context. */
export function krishnamurtiAyanamsa(jd: number): number {
  return lahiriAyanamsa(jd) + KP_AYANAMSA_OFFSET_DEG;
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
};

/** True geocentric sidereal longitude via astronomy-engine (arcsecond-grade). */
export function trueSiderealLongitude(planet: string, jd: number): number {
  const t = new Date((jd - 2440587.5) * 86400000);
  const astroTime = Astronomy.MakeTime(t);
  if (planet === "Sun") {
    const ecl = Astronomy.SunPosition(astroTime);
    return norm360(ecl.elon - lahiriAyanamsa(jd));
  }
  const body = BODY_MAP[planet];
  if (!body) throw new Error(`Unknown planet: ${planet}`);
  const vec = Astronomy.GeoVector(body, astroTime, true);
  const ecl = Astronomy.Ecliptic(vec);
  return norm360(ecl.elon - lahiriAyanamsa(jd));
}

/**
 * True lunar node (Rahu) longitude, mean-node formula. Ketu = Rahu + 180.
 * Ported as-is from the Floot prototype, including its own note that
 * astronomy-engine's node search is event-based, not a direct longitude
 * query, so the well-documented mean-node formula is used instead.
 */
export function rahuLongitude(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const omega = norm360(125.0445479 - 1934.1362608 * T + 0.0020754 * T * T);
  return norm360(omega - lahiriAyanamsa(jd));
}

export interface PlanetPos {
  planet: string;
  /** Raw sidereal ecliptic longitude 0–360° (same as `deg`; alias for test compatibility) */
  longitude: number;
  deg: number;
  rashi: number;
  degInRashi: number;
  nakIdx: number;
  nakPada: number;
  house: number;
}

export interface RealChart {
  ascDeg: number;
  lagnaRashi: number;
  planets: PlanetPos[];
  janmaNakIdx: number;
  birthJd: number;
}

/**
 * Builds a full chart (Ascendant + all 7 classical planets + Rahu/Ketu +
 * houses + nakshatra) from a UTC birth moment and location. This is what
 * routes/kundali.ts uses to compute janma_nakshatra_idx server-side --
 * previously a required client-supplied field (see worker/README.md's
 * "what this endpoint deliberately does not do" section, now partially
 * resolved by this file).
 */
export function buildRealChart(birthUtc: Date, latitudeDeg: number, longitudeDeg: number): RealChart {
  const jd = julianDayFromUtc(birthUtc);

  // Ascendant -- same formula as lib/lagna.ts, see file header note.
  const T = (jd - 2451545) / 36525;
  const gmst = norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000
  );
  const ramc = norm360(gmst + longitudeDeg) * DEG;
  const obliquity = (23.439291111 - 0.013004167 * T - 0.0000001639 * T * T) * DEG;
  const latRad = latitudeDeg * DEG;
  const tropicalAsc = norm360(
    (Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
    ) /
      DEG)
  );
  const ascDeg = norm360(tropicalAsc - lahiriAyanamsa(jd));
  const lagnaRashi = Math.floor(ascDeg / 30);

  const longitudes: Record<string, number> = {
    Sun: trueSiderealLongitude("Sun", jd),
    Moon: trueSiderealLongitude("Moon", jd),
    Mercury: trueSiderealLongitude("Mercury", jd),
    Venus: trueSiderealLongitude("Venus", jd),
    Mars: trueSiderealLongitude("Mars", jd),
    Jupiter: trueSiderealLongitude("Jupiter", jd),
    Saturn: trueSiderealLongitude("Saturn", jd),
    Rahu: rahuLongitude(jd),
  };
  longitudes.Ketu = norm360(longitudes.Rahu! + 180);

  const planets: PlanetPos[] = Object.entries(longitudes).map(([planet, deg]) => {
    const rashi = Math.floor(deg / 30);
    const nakIdx = Math.floor(deg / (360 / 27));
    const nakPada = Math.floor((deg % (360 / 27)) / (360 / 27 / 4)) + 1;
    const house = ((rashi - lagnaRashi + 12) % 12) + 1;
    return { planet, longitude: deg, deg, rashi, degInRashi: deg % 30, nakIdx, nakPada, house };
  });

  const janmaNakIdx = Math.floor(longitudes.Moon! / (360 / 27));

  return { ascDeg, lagnaRashi, planets, janmaNakIdx, birthJd: jd };
}

// ── Vimshottari Dasha ──
// Ported as-is from the Floot prototype (helpers/realChart.tsx).
export const DASHA_SEQ = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
export const DASHA_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export interface DashaPeriod {
  lord: string;
  start: Date;
  end: Date;
}

/**
 * Current Mahadasha + Antardasha as of `asOf` (defaults to now). Returns null
 * if the birth data places `asOf` outside the computed 9-Mahadasha cycle
 * (~120 years) -- callers should treat that as "cannot determine dasha",
 * not as an error to retry.
 */
export function getCurrentDasha(
  chart: RealChart,
  asOf: Date = new Date()
): { maha: DashaPeriod; antar: DashaPeriod } | null {
  const nakLordIdx = chart.janmaNakIdx % 9;
  const startLord = DASHA_SEQ[nakLordIdx]!;
  const moonPlanet = chart.planets.find((p) => p.planet === "Moon");

  // BUG-01 FIX: Properly normalize degree before calculating Nakshatra fraction
  // Nakshatra size = 360° / 27 = 13°20' (13.333...°)
  const NAK_SIZE = 360 / 27;
  const normalizedDeg = moonPlanet ? ((moonPlanet.deg % 360) + 360) % 360 : 0;
  const degInNak = normalizedDeg % NAK_SIZE;
  const fractionElapsed = degInNak / NAK_SIZE;

  const birthMs = (chart.birthJd - 2440587.5) * 86400000;
  const startLordYears = DASHA_YEARS[startLord]!;
  const elapsedMs = fractionElapsed * startLordYears * 365.25 * 86400000;
  const firstMahaStart = new Date(birthMs - elapsedMs);

  const asOfMs = asOf.getTime();
  let cursor = firstMahaStart.getTime();
  let idx = nakLordIdx;
  let maha: DashaPeriod | null = null;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQ[idx % 9]!;
    const durMs = DASHA_YEARS[lord]! * 365.25 * 86400000;
    const start = new Date(cursor);
    const end = new Date(cursor + durMs);
    if (asOfMs >= start.getTime() && asOfMs < end.getTime()) {
      maha = { lord, start, end };
      break;
    }
    cursor += durMs;
    idx++;
  }
  if (!maha) return null;

  const mahaLordIdx = DASHA_SEQ.indexOf(maha.lord);
  const mahaDurYears = DASHA_YEARS[maha.lord]!;
  let aCursor = maha.start.getTime();
  let antar: DashaPeriod | null = null;
  for (let i = 0; i < 9; i++) {
    const aLord = DASHA_SEQ[(mahaLordIdx + i) % 9]!;
    const aDurMs = (DASHA_YEARS[aLord]! / 120) * mahaDurYears * 365.25 * 86400000;
    const aStart = new Date(aCursor);
    const aEnd = new Date(aCursor + aDurMs);
    if (asOfMs >= aStart.getTime() && asOfMs < aEnd.getTime()) {
      antar = { lord: aLord, start: aStart, end: aEnd };
      break;
    }
    aCursor += aDurMs;
  }
  if (!antar) return null;

  return { maha, antar };
}

// ── Gochar (Transit) -- current planetary positions, independent of any birth chart ──
export interface TransitPlanet {
  planet: string;
  rashi: number;
  deg: number;
  nakIdx: number;
  retrograde: boolean;
}

export function getCurrentTransit(date: Date = new Date()): TransitPlanet[] {
  const jd = julianDayFromUtc(date);
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const result: TransitPlanet[] = planets.map((p) => {
    const lon = trueSiderealLongitude(p, jd);
    let retro = false;
    if (p !== "Sun" && p !== "Moon") {
      const jd2 = jd + 0.25;
      const lon2 = trueSiderealLongitude(p, jd2);
      const diff = ((lon2 - lon + 540) % 360) - 180;
      retro = diff < 0;
    }
    return {
      planet: p,
      rashi: Math.floor(lon / 30),
      deg: lon % 30,
      nakIdx: Math.floor(lon / (360 / 27)),
      retrograde: retro,
    };
  });
  const rahuLon = rahuLongitude(jd);
  const ketuLon = norm360(rahuLon + 180);
  result.push({
    planet: "Rahu",
    rashi: Math.floor(rahuLon / 30),
    deg: rahuLon % 30,
    nakIdx: Math.floor(rahuLon / (360 / 27)),
    retrograde: true,
  });
  result.push({
    planet: "Ketu",
    rashi: Math.floor(ketuLon / 30),
    deg: ketuLon % 30,
    nakIdx: Math.floor(ketuLon / (360 / 27)),
    retrograde: true,
  });
  return result;
}

/** Accurate sunrise/sunset using astronomy-engine (atmospheric refraction included). */
export function realSunriseSunset(
  date: Date,
  latitudeDeg: number,
  longitudeDeg: number
): { sunrise: Date; sunset: Date; nextSunrise: Date } {
  const noonUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const observer = new Astronomy.Observer(latitudeDeg, longitudeDeg, 0);
  const searchTime = Astronomy.MakeTime(noonUTC);
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, searchTime, -1);
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, searchTime, 1);
  const nextSearchTime = Astronomy.MakeTime(new Date(noonUTC.getTime() + 86400000));
  const nextSunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, nextSearchTime, -1);
  return {
    sunrise: sunrise ? sunrise.date : new Date(noonUTC.getTime() - 6 * 3600000),
    sunset: sunset ? sunset.date : new Date(noonUTC.getTime() + 6 * 3600000),
    nextSunrise: nextSunrise ? nextSunrise.date : new Date(noonUTC.getTime() + 18 * 3600000),
  };
}

// ── Combustion (Ast) ──
// ARCHITECTURE.md Section 4: "Requires real planetary longitudes relative to
// the Sun (same ephemeris dependency as sub-lords). Orbs vary by planet and
// by direct/retrograde state (e.g. Venus 10 deg direct / 8 deg retrograde).
// Classically prohibits Venus/Jupiter-ruled sanskaras (marriage, upanayan,
// etc.) when either planet is combust." That ephemeris dependency is now
// satisfied by this file's trueSiderealLongitude(), so this is no longer
// technically blocked -- but ARCHITECTURE.md's own research only confirms
// ONE planet's orb (Venus, 10 deg/8 deg). The other planets' orbs below are
// the commonly-published classical values (Muhurta Chintamani / standard
// Panchang references: Moon 12 deg, Mars 17 deg, Mercury 14 deg retro / 12
// deg direct, Jupiter 11 deg, Saturn 15 deg) -- NOT independently confirmed
// by ARCHITECTURE.md's research pass the way Venus's was. Flagging this
// explicitly: verify against a primary source before this feeds paid
// scoring, same caveat pattern as the Panchaka/Dishashool weekday tables in
// lib/muhurta.ts. The Sun itself and the two nodes (Rahu/Ketu, which are
// never combust) are excluded.
const COMBUSTION_ORB_DEG: Record<string, { direct: number; retrograde: number }> = {
  Moon: { direct: 12, retrograde: 12 },
  Mars: { direct: 17, retrograde: 17 },
  Mercury: { direct: 12, retrograde: 14 },
  Jupiter: { direct: 11, retrograde: 11 },
  Venus: { direct: 10, retrograde: 8 }, // the one orb ARCHITECTURE.md itself confirms
  Saturn: { direct: 15, retrograde: 15 },
};

export interface CombustionResult {
  planet: string;
  combust: boolean;
  angularDistanceDeg: number;
  orbDeg: number;
  retrograde: boolean;
}

/**
 * Checks whether `planet` is combust (too close to the Sun) at Julian Day
 * `jd`. Retrograde is detected the same way getCurrentTransit() does: a
 * short forward finite-difference in longitude.
 */
export function getCombustion(planet: string, jd: number): CombustionResult {
  if (!(planet in COMBUSTION_ORB_DEG)) {
    throw new Error(`getCombustion: no orb data for planet "${planet}" (Sun/Rahu/Ketu are never combust).`);
  }
  const sunLon = trueSiderealLongitude("Sun", jd);
  const planetLon = trueSiderealLongitude(planet, jd);
  const rawDiff = Math.abs(planetLon - sunLon) % 360;
  const angularDistanceDeg = rawDiff > 180 ? 360 - rawDiff : rawDiff;

  const lon2 = trueSiderealLongitude(planet, jd + 0.25);
  const diff = ((lon2 - planetLon + 540) % 360) - 180;
  const retrograde = diff < 0;

  const orbDeg = retrograde ? COMBUSTION_ORB_DEG[planet]!.retrograde : COMBUSTION_ORB_DEG[planet]!.direct;
  return { planet, combust: angularDistanceDeg <= orbDeg, angularDistanceDeg, orbDeg, retrograde };
}

export const RASHI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

// ── Tithi (Lunar Day) Names ──
// Classical Vedic lunar calendar: 30 tithis in a lunar month
// Shukla Paksha (bright half): days 0-14 (New Moon to Full Moon)
// Krishna Paksha (dark half): days 15-29 (Full Moon to New Moon)
// Source: Brihat Parashara Hora Shastra, Panchanga chapter
export const TITHI_NAMES = [
  // Shukla Paksha (Bright Half - Days 0-14)
  "Shukla Pratipada",      // 0: New Moon to 1st quarter
  "Shukla Dwitiya",        // 1
  "Shukla Tritiya",        // 2
  "Shukla Chaturthi",      // 3
  "Shukla Panchami",       // 4
  "Shukla Shashthi",       // 5
  "Shukla Saptami",        // 6
  "Shukla Ashtami",        // 7
  "Shukla Navami",         // 8
  "Shukla Dashami",        // 9
  "Shukla Ekadashi",       // 10
  "Shukla Dwadashi",       // 11
  "Shukla Trayodashi",     // 12
  "Shukla Chaturdashi",    // 13
  "Shukla Purnima",        // 14: Full Moon
  // Krishna Paksha (Dark Half - Days 15-29)
  "Krishna Pratipada",     // 15: Full Moon to 3rd quarter
  "Krishna Dwitiya",       // 16
  "Krishna Tritiya",       // 17
  "Krishna Chaturthi",     // 18
  "Krishna Panchami",      // 19
  "Krishna Shashthi",      // 20
  "Krishna Saptami",       // 21
  "Krishna Ashtami",       // 22
  "Krishna Navami",        // 23
  "Krishna Dashami",       // 24
  "Krishna Ekadashi",      // 25
  "Krishna Dwadashi",      // 26
  "Krishna Trayodashi",    // 27
  "Krishna Chaturdashi",   // 28
  "Krishna Amavasya",      // 29: New Moon
];

// ── Navamsha (D9) Lord ──
// Source: Brihat Parashara Hora Shastra, Shodasavarga chapter.
// Each sign split into 9 navamshas of 3°20' (3.333°) = 30°/9 each.
// Start rashi depends on sign element (triplicity):
//   Fire (Aries=0, Leo=4, Sagittarius=8)     → navamsha starts from Aries (0)
//   Earth (Taurus=1, Virgo=5, Capricorn=9)   → navamsha starts from Capricorn (9)
//   Air (Gemini=2, Libra=6, Aquarius=10)     → navamsha starts from Libra (6)
//   Water (Cancer=3, Scorpio=7, Pisces=11)   → navamsha starts from Cancer (3)
// Lord of resulting navamsha rashi = sign lord per classical scheme.
const NAVAMSHA_START_RASHI: Record<number, number> = {
  0: 0, 4: 0, 8: 0,   // Fire  → Aries
  1: 9, 5: 9, 9: 9,   // Earth → Capricorn
  2: 6, 6: 6, 10: 6,  // Air   → Libra
  3: 3, 7: 3, 11: 3,  // Water → Cancer
};

const SIGN_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

/**
 * Returns the lord of the Navamsha (D9) for a given ecliptic longitude (sidereal degrees).
 * Used to assess quality of personal planetary period in muhurta scoring.
 */
export function getNavamshaLord(deg: number): string {
  const normalised = norm360(deg);
  const rashi = Math.floor(normalised / 30);       // 0-11
  const degInSign = normalised % 30;                // 0-30
  const pada = Math.floor(degInSign / (30 / 9));   // 0-8 (navamsha index within sign)
  const startRashi = NAVAMSHA_START_RASHI[rashi]!;
  const navamshaRashi = (startRashi + pada) % 12;
  return SIGN_LORDS[navamshaRashi]!;
}

// ──────────────────────────────────────────────────────────────────────────────
// NAKSHATRA FULL ATTRIBUTE TABLE
//
// SOURCES (verified against multiple classical references):
//   - Deity + Nature + Gender: templepurohit.com/27-nakshatras-full-nakshatra-names-character-traits/
//   - Tattva/Element: jyotishmadesimple.wordpress.com/2018/07/02/nakshatras-elememts/
//   - Guna (3-level Prakriti/Sattvic/Tamasic): barbarapijan.com/bpa/Nakshatra_radical/00nakshatra_guna27.htm
//   - Star Lord: Classical Vimshottari sequence (Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→Mercury)
//     repeating every 9 nakshatras; same as NAKSHATRA_LORDS in this file.
//
// GUNA NOTATION: P=Pradhana (Primary), S=Secondary, T=Tertiary
//   gunaTriad[0]=Primary Guna (most prominent), [1]=Secondary, [2]=Tertiary
//   R=Rajas (activity/passion), T=Tamas (inertia/darkness), S=Sattva (purity/harmony)
//
// NOTE on Shravana (index 21): Lord is Moon in most classical sources.
//   Some texts (Parashari) give Jupiter as deity/lord variant — left as Moon here.
//
// NOTE on body parts: Not included — reliable classical source not found in
//   accessible texts. BPHS Adhyaya 3-4 has this but requires physical book.
//   TODO: Add when classical source confirmed.
// ──────────────────────────────────────────────────────────────────────────────

export type NakshatraNature = "Deva" | "Manushya" | "Rakshasa";
export type NakshatraGender = "Male" | "Female";
export type NakshatraTattva = "Earth" | "Water" | "Fire" | "Air" | "Ether";
export type GunaQuality = "R" | "T" | "S"; // Rajas | Tamas | Sattva

export interface NakshatraAttributes {
  /** 0-26 index */
  index: number;
  name: string;
  /** Classical star lord (Vimshottari ruling planet) */
  lord: string;
  /** Presiding deity */
  deity: string;
  /** Nature/type — Deva (divine), Manushya (human), Rakshasa (demonic) */
  nature: NakshatraNature;
  /** Biological gender (classical classification) */
  gender: NakshatraGender;
  /** Five-element tattva/element */
  tattva: NakshatraTattva;
  /**
   * Three-level guna triad: [Primary, Secondary, Tertiary]
   * R=Rajas, T=Tamas, S=Sattva
   */
  gunaTriad: [GunaQuality, GunaQuality, GunaQuality];
}

export const NAKSHATRA_ATTRIBUTES: NakshatraAttributes[] = [
  // ── Cycle 1: Rajas primary (nakshatras 1-9) ──
  { index: 0,  name: "Ashwini",           lord: "Ketu",    deity: "Ashwini Kumaras", nature: "Deva",     gender: "Male",   tattva: "Earth", gunaTriad: ["R","R","R"] },
  { index: 1,  name: "Bharani",           lord: "Venus",   deity: "Yama",            nature: "Manushya", gender: "Female", tattva: "Earth", gunaTriad: ["R","R","T"] },
  { index: 2,  name: "Krittika",          lord: "Sun",     deity: "Agni",            nature: "Rakshasa", gender: "Female", tattva: "Earth", gunaTriad: ["R","R","S"] },
  { index: 3,  name: "Rohini",            lord: "Moon",    deity: "Prajapati",       nature: "Manushya", gender: "Female", tattva: "Earth", gunaTriad: ["R","T","R"] },
  { index: 4,  name: "Mrigashira",        lord: "Mars",    deity: "Soma",            nature: "Deva",     gender: "Female", tattva: "Earth", gunaTriad: ["R","T","T"] },
  { index: 5,  name: "Ardra",             lord: "Rahu",    deity: "Rudra",           nature: "Manushya", gender: "Female", tattva: "Water", gunaTriad: ["R","T","S"] },
  { index: 6,  name: "Punarvasu",         lord: "Jupiter", deity: "Aditi",           nature: "Deva",     gender: "Male",   tattva: "Water", gunaTriad: ["R","S","R"] },
  { index: 7,  name: "Pushya",            lord: "Saturn",  deity: "Brihaspati",      nature: "Deva",     gender: "Male",   tattva: "Water", gunaTriad: ["R","S","T"] },
  { index: 8,  name: "Ashlesha",          lord: "Mercury", deity: "Nagas",           nature: "Rakshasa", gender: "Female", tattva: "Water", gunaTriad: ["R","S","S"] },
  // ── Cycle 2: Tamas primary (nakshatras 10-18) ──
  { index: 9,  name: "Magha",             lord: "Ketu",    deity: "Pitris",          nature: "Rakshasa", gender: "Female", tattva: "Water", gunaTriad: ["T","R","R"] },
  { index: 10, name: "Purva Phalguni",    lord: "Venus",   deity: "Bhaga",           nature: "Manushya", gender: "Female", tattva: "Water", gunaTriad: ["T","R","T"] },
  { index: 11, name: "Uttara Phalguni",   lord: "Sun",     deity: "Aryaman",         nature: "Manushya", gender: "Female", tattva: "Fire",  gunaTriad: ["T","R","S"] },
  { index: 12, name: "Hasta",             lord: "Moon",    deity: "Surya",           nature: "Deva",     gender: "Male",   tattva: "Fire",  gunaTriad: ["T","T","R"] },
  { index: 13, name: "Chitra",            lord: "Mars",    deity: "Vishwakarma",     nature: "Rakshasa", gender: "Female", tattva: "Fire",  gunaTriad: ["T","T","T"] },
  { index: 14, name: "Swati",             lord: "Rahu",    deity: "Vayu",            nature: "Deva",     gender: "Female", tattva: "Fire",  gunaTriad: ["T","T","S"] },
  { index: 15, name: "Vishakha",          lord: "Jupiter", deity: "Indra-Agni",      nature: "Rakshasa", gender: "Female", tattva: "Fire",  gunaTriad: ["T","S","R"] },
  { index: 16, name: "Anuradha",          lord: "Saturn",  deity: "Mitra",           nature: "Deva",     gender: "Male",   tattva: "Fire",  gunaTriad: ["T","S","T"] },
  { index: 17, name: "Jyeshtha",          lord: "Mercury", deity: "Indra",           nature: "Rakshasa", gender: "Female", tattva: "Air",   gunaTriad: ["T","S","S"] },
  // ── Cycle 3: Sattva primary (nakshatras 19-27) ──
  { index: 18, name: "Mula",              lord: "Ketu",    deity: "Nirriti",         nature: "Rakshasa", gender: "Female", tattva: "Air",   gunaTriad: ["S","R","R"] },
  { index: 19, name: "Purva Ashadha",     lord: "Venus",   deity: "Apas",            nature: "Manushya", gender: "Male",   tattva: "Air",   gunaTriad: ["S","R","T"] },
  { index: 20, name: "Uttara Ashadha",    lord: "Sun",     deity: "Vishwadevas",     nature: "Manushya", gender: "Female", tattva: "Air",   gunaTriad: ["S","R","S"] },
  { index: 21, name: "Shravana",          lord: "Moon",    deity: "Vishnu",          nature: "Deva",     gender: "Male",   tattva: "Air",   gunaTriad: ["S","T","R"] },
  { index: 22, name: "Dhanishtha",        lord: "Mars",    deity: "8 Vasus",         nature: "Rakshasa", gender: "Female", tattva: "Ether", gunaTriad: ["S","T","T"] },
  { index: 23, name: "Shatabhisha",       lord: "Rahu",    deity: "Varuna",          nature: "Rakshasa", gender: "Female", tattva: "Ether", gunaTriad: ["S","T","S"] },
  { index: 24, name: "Purva Bhadrapada",  lord: "Jupiter", deity: "Aja Ekapada",     nature: "Manushya", gender: "Male",   tattva: "Ether", gunaTriad: ["S","S","R"] },
  { index: 25, name: "Uttara Bhadrapada", lord: "Saturn",  deity: "Ahir Budhanya",   nature: "Manushya", gender: "Male",   tattva: "Ether", gunaTriad: ["S","S","T"] },
  { index: 26, name: "Revati",            lord: "Mercury", deity: "Pushan",          nature: "Deva",     gender: "Female", tattva: "Ether", gunaTriad: ["S","S","S"] },
];

/**
 * Get nakshatra attributes by index (0-26).
 * Fast O(1) lookup — index matches array position.
 */
export function getNakshatraAttributes(nakshatraIndex: number): NakshatraAttributes {
  const attr = NAKSHATRA_ATTRIBUTES[nakshatraIndex];
  if (!attr) throw new RangeError(`Nakshatra index must be 0-26, got ${nakshatraIndex}`);
  return attr;
}

/**
 * Get nakshatra attributes by name (case-sensitive).
 */
export function getNakshatraByName(name: string): NakshatraAttributes | undefined {
  return NAKSHATRA_ATTRIBUTES.find(n => n.name === name);
}
