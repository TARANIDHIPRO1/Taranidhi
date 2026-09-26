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

export function julianDayFromUtc(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Lahiri Ayanamsa -- see file header: verified vs Swiss Ephemeris in the prototype. */
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
    return { planet, deg, rashi, degInRashi: deg % 30, nakIdx, nakPada, house };
  });

  const janmaNakIdx = Math.floor(longitudes.Moon! / (360 / 27));

  return { ascDeg, lagnaRashi, planets, janmaNakIdx, birthJd: jd };
}

// ── Vimshottari Dasha ──
// Ported as-is from the Floot prototype (helpers/realChart.tsx).
const DASHA_SEQ = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<string, number> = {
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
  const degInNak = moonPlanet ? moonPlanet.deg % (360 / 27) : 0;
  const fractionElapsed = degInNak / (360 / 27);

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
