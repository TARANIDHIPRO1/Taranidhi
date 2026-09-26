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

// ── Panchaka Dosha ──
// ARCHITECTURE.md Section 4: "Nakshatra-window check (last 2 padas of
// Dhanishtha through Revati). Note the Monday exception: Raj Panchak is
// actually auspicious for government/property work -- do not treat all 5
// weekday variants as uniformly inauspicious."
//
// The window itself (last 2 padas of Dhanishtha idx 22 through the end of
// Revati idx 26) is directly from ARCHITECTURE.md. The specific
// weekday-name-to-effect table below (Rog/Raj/Agni/Chor/Mrityu Panchak) is
// NOT separately confirmed in ARCHITECTURE.md beyond the Monday=Raj Panchak
// example -- it's the commonly-published Panchang convention (5 of 7
// weekdays carry a named effect; Wednesday/Thursday classically carry none).
// Flagging this rather than presenting it as independently verified: confirm
// against a primary source before this feeds paid scoring.
const PANCHAKA_NAK_START = 22; // Dhanishtha
const PANCHAKA_NAK_LAST = 26; // Revati
const PANCHAKA_WEEKDAY_NAME: Record<number, { name: string; auspicious: boolean; note: string }> = {
  0: { name: "Rog Panchak", auspicious: false, note: "Commonly associated with illness -- avoid health-sensitive starts." },
  1: { name: "Raj Panchak", auspicious: true, note: "Exception: auspicious, particularly for government/property/authority-related work." },
  2: { name: "Agni Panchak", auspicious: false, note: "Commonly associated with fire/accident risk -- avoid construction, kitchen work." },
  3: { name: "", auspicious: true, note: "No named Panchak effect classically assigned to Wednesday." },
  4: { name: "", auspicious: true, note: "No named Panchak effect classically assigned to Thursday." },
  5: { name: "Chor Panchak", auspicious: false, note: "Commonly associated with theft/loss risk." },
  6: { name: "Mrityu Panchak", auspicious: false, note: "Commonly considered the most severe variant -- avoid important starts." },
};

export interface PanchakaResult {
  active: boolean;
  name: string;
  auspicious: boolean;
  note: string;
}

export function getPanchakaDosha(currentNakIdx: number, currentNakDeg: number, dow: number): PanchakaResult {
  const nakWidth = 360 / 27;
  const inWindow =
    (currentNakIdx === PANCHAKA_NAK_START && currentNakDeg >= nakWidth / 2) || // last 2 of 4 padas
    (currentNakIdx > PANCHAKA_NAK_START && currentNakIdx <= PANCHAKA_NAK_LAST);
  if (!inWindow) {
    return { active: false, name: "", auspicious: true, note: "Not in the Panchaka nakshatra window." };
  }
  const variant = PANCHAKA_WEEKDAY_NAME[dow]!;
  return { active: true, name: variant.name, auspicious: variant.auspicious, note: variant.note };
}

// ── Ganda Moola ──
// ARCHITECTURE.md Section 4: "Nakshatra-based check: Ashwini, Ashlesha,
// Magha, Jyeshtha, Mula, Revati. Distinct from Panchaka (different 6
// nakshatras, different rule)." Directly from ARCHITECTURE.md -- no
// additional weekday or degree conditions documented, so none are applied
// here.
const GANDA_MOOLA_NAKS = new Set([0, 8, 9, 17, 18, 26]); // Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati

export function getGandaMoola(currentNakIdx: number): { active: boolean; note: string } {
  const active = GANDA_MOOLA_NAKS.has(currentNakIdx);
  return {
    active,
    note: active
      ? `${NAKSHATRA_NAMES[currentNakIdx]} is a Ganda Moola nakshatra -- classically considered inauspicious for new beginnings.`
      : "Not a Ganda Moola nakshatra.",
  };
}

// ── Dishashool ──
// ARCHITECTURE.md Section 4: "Weekday-based travel-direction table. Low
// effort, no ephemeris dependency, not yet on the build schedule but cheap
// to add." ARCHITECTURE.md does not itself give the day->direction mapping,
// so the table below is the commonly-published Panchang convention (Drik
// Panchang and most Hindu almanacs agree on it), not something confirmed by
// ARCHITECTURE.md's own research pass -- flag as unverified-against-a-
// primary-source, same caveat as the Panchaka weekday-name table above.
const DISHASHOOL_BY_WEEKDAY: Record<number, string> = {
  0: "West", // Sunday
  1: "East", // Monday
  2: "North", // Tuesday
  3: "North", // Wednesday
  4: "South", // Thursday
  5: "West", // Friday
  6: "East", // Saturday
};

export function getDishashool(dow: number): { direction: string; note: string } {
  const direction = DISHASHOOL_BY_WEEKDAY[dow]!;
  return {
    direction,
    note: `Travel toward ${direction} is classically inauspicious today -- if travel that direction is unavoidable, a remedy (e.g. a specific food item before departure) is traditionally prescribed, not modeled here.`,
  };
}
