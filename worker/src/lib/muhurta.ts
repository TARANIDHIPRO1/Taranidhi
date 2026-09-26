// Hora/Uphora/Tarabala/Rahu-Kaal -- ported from the TaraNidhi Floot
// prototype's helpers/vedicCalc.tsx, which notes the Hora-lord rotation,
// Uphora sub-division, and Tarabala formulas as "confirmed from the prior
// TaraNidhi build" (the verified single-file PWA artifact). Server-side port
// so this runs in the Worker, not the client (ARCHITECTURE.md Section 8).
//
// Ayanamsa: Lahiri, app-wide default per ARCHITECTURE.md Section 4.
//
// NOT yet ported from the prototype (still TODO, tracked in the KP Engine /
// Muhurta engine backlog): Panchang's tithi/nakshatra here still uses the
// prototype's own quick-approximation formulas (not astronomy-engine) --
// good enough for a Panchang display, but do not reuse for anything
// correctness-critical (Tarabala below uses the same underlying moon
// nakshatra approximation deliberately, matching what the prototype did,
// but this should be upgraded to lib/astro.ts's astronomy-engine-based
// moon longitude before this feeds real scoring in production).

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

export const TARA_NAMES = ["", "Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhak", "Vadha", "Mitra", "Atimitra"];
export const TARA_BENEFIC = new Set([2, 4, 6, 8, 9]);

/** Classical Chaldean order -- same sequence the Hora-lord rotation and
 *  Uphora sub-division both use. Confirmed from the prior TaraNidhi build. */
export const CHRONO = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

const HORA_LORDS_BY_WEEKDAY: Record<number, string[]> = {
  0: ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"], // Sunday
  1: ["Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury"], // Monday
  2: ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"], // Tuesday
  3: ["Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus"], // Wednesday
  4: ["Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn"], // Thursday
  5: ["Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun"], // Friday
  6: ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"], // Saturday
};

export interface HoraWindow {
  lord: string;
  start: Date;
  end: Date;
  isDaytime: boolean;
}

/** Build all 24 hora windows for a given day using real sunrise/sunset. */
export function buildHoraWindows(sunrise: Date, sunset: Date, nextSunrise: Date, date: Date): HoraWindow[] {
  const dow = date.getUTCDay();
  const lordSeq = HORA_LORDS_BY_WEEKDAY[dow]!;
  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = nextSunrise.getTime() - sunset.getTime();
  const dayHoraMs = dayMs / 12;
  const nightHoraMs = nightMs / 12;
  const windows: HoraWindow[] = [];
  for (let i = 0; i < 12; i++) {
    const s = new Date(sunrise.getTime() + i * dayHoraMs);
    const e = new Date(s.getTime() + dayHoraMs);
    windows.push({ lord: lordSeq[i % 7]!, start: s, end: e, isDaytime: true });
  }
  for (let i = 0; i < 12; i++) {
    const s = new Date(sunset.getTime() + i * nightHoraMs);
    const e = new Date(s.getTime() + nightHoraMs);
    windows.push({ lord: lordSeq[(12 + i) % 7]!, start: s, end: e, isDaytime: false });
  }
  return windows;
}

export function getActiveHora(windows: HoraWindow[], now: Date): HoraWindow | null {
  const t = now.getTime();
  return windows.find((w) => t >= w.start.getTime() && t < w.end.getTime()) ?? null;
}

export interface Uphora {
  sub: string;
  start: Date;
  end: Date;
  index: number;
}

/**
 * Divide one Hora into its 7 Uphora sub-periods. Confirmed formula from the
 * prior TaraNidhi build: lord-sequence starts at the Hora's own lord and
 * cycles through CHRONO, duration = Hora-duration / 7.
 */
export function buildUphoras(hora: HoraWindow): Uphora[] {
  const base = CHRONO.indexOf(hora.lord);
  const dur = (hora.end.getTime() - hora.start.getTime()) / 7;
  return Array.from({ length: 7 }, (_, i) => ({
    sub: CHRONO[(base + i) % 7]!,
    start: new Date(hora.start.getTime() + i * dur),
    end: new Date(hora.start.getTime() + (i + 1) * dur),
    index: i,
  }));
}

export function getActiveUphora(uphoras: Uphora[], now: Date): Uphora | null {
  const t = now.getTime();
  return uphoras.find((u) => t >= u.start.getTime() && t < u.end.getTime()) ?? null;
}

/**
 * Compute Tara from Janma-Nakshatra and current Nakshatra. Personalized per
 * user -- each user's Tara is unique to their own birth star.
 */
export function computeTara(
  janmaNakIdx: number,
  currentNakIdx: number
): { number: number; name: string; isBenefic: boolean } {
  const count = ((currentNakIdx - janmaNakIdx + 27) % 27) + 1;
  const taraNum = ((count - 1) % 9) + 1;
  return { number: taraNum, name: TARA_NAMES[taraNum]!, isBenefic: TARA_BENEFIC.has(taraNum) };
}

/**
 * Rahu Kaal -- standard classical formula. Daytime (sunrise->sunset) split
 * into 8 equal parts; Rahu Kaal occupies a fixed part-index per weekday,
 * universally agreed across Panchang traditions.
 */
const RAHU_KAAL_PART_BY_WEEKDAY: Record<number, number> = {
  0: 7, // Sunday   -- 8th part
  1: 1, // Monday   -- 2nd part
  2: 6, // Tuesday  -- 7th part
  3: 4, // Wednesday-- 5th part
  4: 5, // Thursday -- 6th part
  5: 3, // Friday   -- 4th part
  6: 2, // Saturday -- 3rd part
};

export function getRahuKaal(sunrise: Date, sunset: Date, dow: number): { start: Date; end: Date } {
  const partMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const part = RAHU_KAAL_PART_BY_WEEKDAY[dow]!;
  const start = new Date(sunrise.getTime() + part * partMs);
  const end = new Date(start.getTime() + partMs);
  return { start, end };
}

export function isWithinRahuKaal(now: Date, rahuKaal: { start: Date; end: Date }): boolean {
  const t = now.getTime();
  return t >= rahuKaal.start.getTime() && t < rahuKaal.end.getTime();
}
