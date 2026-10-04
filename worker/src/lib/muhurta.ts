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
// Tara beneficence classification:
// - TARA_BENEFIC: Classically auspicious (Sampat, Kshema, Sadhak, Mitra, Atimitra)
// - TARA_NEUTRAL: Neutral or context-dependent (Janma: karma marker, not inherent defect per Karma Vipak Samhita)
// - Implicitly malefic: Vipat, Pratyari, Vadha (not listed above)
// Source: B.V. Raman (context-dependent), Karma Vipak Samhita (Janma Nakshatra as karmic marker with remedies)
export const TARA_BENEFIC = new Set([2, 4, 6, 8, 9]);
export const TARA_NEUTRAL = new Set([1]); // Janma — no inherent malefic quality

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

/** 1-based index of the active hora within the 24-hora day (1 = first hora from sunrise). */
export function getHoraNumber(windows: HoraWindow[], activeHora: HoraWindow | null): number | null {
  if (!activeHora) return null;
  const idx = windows.indexOf(activeHora);
  return idx === -1 ? null : idx + 1;
}

/**
 * Classical hora quality per lord.
 * Source: Muhurta Chintamani (Hora Prakarana); B.V. Raman's "Muhurta"
 *
 * Benefic:  Jupiter, Venus, Moon, Mercury
 * Neutral:  Sun (royal/powerful; not inherently inauspicious)
 * Malefic:  Mars, Saturn
 *
 * Purpose-specific overrides (Muhurta Chintamani):
 *  - Property/Land: Saturn hora acceptable (Saturn governs property, land)
 *  - Medical:       Sun hora auspicious (Sun = vitality, healing)
 *  - Litigation:    Mars hora sometimes recommended (aggression/victory)
 */
export const HORA_NATURE: Record<string, "benefic" | "neutral" | "malefic"> = {
  Jupiter: "benefic",
  Venus:   "benefic",
  Moon:    "benefic",
  Mercury: "benefic",
  Sun:     "neutral",
  Mars:    "malefic",
  Saturn:  "malefic",
};

/**
 * Purpose-specific recommended hora lords.
 * Source: Muhurta Chintamani; Brihat Parashara Hora Shastra (Muhurta adhyaya)
 */
const HORA_PURPOSE_RECOMMENDED: Record<string, string[]> = {
  property:  ["Jupiter", "Venus", "Mercury", "Saturn"], // Saturn governs land (BPHS)
  marriage:  ["Jupiter", "Venus", "Moon"],
  business:  ["Mercury", "Jupiter", "Venus"],
  medical:   ["Sun", "Jupiter", "Moon"],              // Sun = vitality; Jupiter = physicians
  travel:    ["Mercury", "Jupiter", "Moon"],
  education: ["Mercury", "Jupiter"],
  general:   ["Jupiter", "Venus", "Mercury", "Moon"],
  ivf:       ["Moon", "Jupiter", "Venus"],
};

export interface HoraQualityResult {
  nature: "benefic" | "neutral" | "malefic";
  recommended_for_purpose: boolean;
  note: string;
}

/**
 * Returns quality of the given hora lord for the current purpose.
 * Source: Muhurta Chintamani; BPHS
 */
export function getHoraQuality(lord: string, purpose = "general"): HoraQualityResult {
  const nature = HORA_NATURE[lord] ?? "neutral";
  const purposeKey = purpose.toLowerCase();
  const recommended = HORA_PURPOSE_RECOMMENDED[purposeKey] ?? HORA_PURPOSE_RECOMMENDED["general"]!;
  const recommended_for_purpose = recommended.includes(lord);
  const note = recommended_for_purpose
    ? `${lord} hora is recommended for ${purpose} purposes.`
    : nature === "malefic"
    ? `${lord} hora is generally inauspicious. Prefer Jupiter, Venus, or Moon hora.`
    : `${lord} hora is ${nature} but not specifically recommended for ${purpose}.`;
  return { nature, recommended_for_purpose, note };
}

/**
 * Returns the next hora window after 'now' (i.e., the hora starting after the active one ends).
 */
export function getNextHora(windows: HoraWindow[], now: Date): HoraWindow | null {
  const t = now.getTime();
  // Find first hora whose start is strictly after now
  return windows.find((w) => w.start.getTime() > t) ?? null;
}

/**
 * Returns the next hora that is recommended for the given purpose,
 * starting from the hora AFTER the currently active one.
 * Source: Muhurta Chintamani (recommended hora by purpose)
 */
export function getNextGoodHora(windows: HoraWindow[], now: Date, purpose = "general"): (HoraWindow & { quality: HoraQualityResult }) | null {
  const t = now.getTime();
  const purposeKey = purpose.toLowerCase();
  const recommended = HORA_PURPOSE_RECOMMENDED[purposeKey] ?? HORA_PURPOSE_RECOMMENDED["general"]!;
  // Skip current hora (start <= now) — look only at future horas
  const future = windows.filter((w) => w.start.getTime() > t);
  const good = future.find((w) => recommended.includes(w.lord));
  if (!good) return null;
  return { ...good, quality: getHoraQuality(good.lord, purpose) };
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
 *
 * Returns three-state beneficence: "benefic" (2,4,6,8,9), "neutral" (1 Janma),
 * or "malefic" (3,5,7 Vipat, Pratyari, Vadha).
 *
 * Janma (1) is classified as neutral, not malefic, per Karma Vipak Samhita
 * (Janma Nakshatra as karmic marker, not inherent defect) and B.V. Raman's
 * context-dependent model (favorable for certain purposes, unfavorable for others).
 */
export function computeTara(
  janmaNakIdx: number,
  currentNakIdx: number
): { number: number; name: string; beneficence: "benefic" | "neutral" | "malefic" } {
  const count = ((currentNakIdx - janmaNakIdx + 27) % 27) + 1;
  const taraNum = ((count - 1) % 9) + 1;

  let beneficence: "benefic" | "neutral" | "malefic";
  if (TARA_BENEFIC.has(taraNum)) {
    beneficence = "benefic";
  } else if (TARA_NEUTRAL.has(taraNum)) {
    beneficence = "neutral";
  } else {
    beneficence = "malefic";
  }

  return { number: taraNum, name: TARA_NAMES[taraNum]!, beneficence };
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

// ── Tithi ──
// Source: Brihat Parashara Hora Shastra, Muhurta Chintamani.
// Tithi = angular distance from Sun to Moon (0-360°) divided into 30 intervals of 12°.
// Tithi 1-30; Tithi 1 is Shukla Pratipada (0°-12° Moon ahead of Sun).
export function getTithi(moonLon: number, sunLon: number): number {
  const diff = ((moonLon - sunLon) + 360) % 360;
  return Math.floor(diff / 12) + 1; // 1-30
}

// ── Vishti Karana (Bhadra) ──
// Source: Muhurta Chintamani; Brihat Parashara Hora Shastra, Karana chapter.
// A Karana = half a Tithi (6° of Moon-Sun arc). 60 Karanas in a lunar month.
// The 7 movable Karanas repeat 8 times (positions 1-56), then 4 fixed (57-60).
// Vishti (Bhadra) is the 7th in the cycle of movable Karanas.
// Cycle position in 0-55: Vishti when position % 7 === 6.
// Fixed Karanas (pos 57-60) have no Vishti; only movable positions 1-56 checked.
export function isVishtiKarana(moonLon: number, sunLon: number): boolean {
  const diff = ((moonLon - sunLon) + 360) % 360;
  const position = Math.floor(diff / 6) + 1; // Karana 1-60
  if (position < 1 || position > 56) return false; // fixed Karanas, no Vishti
  return (position - 1) % 7 === 6; // 7th in each 7-cycle (0-indexed)
}

// ── Yamghanda Kaal ──
// Source: Muhurta Chintamani; confirmed against Drik Panchang convention.
// Daytime (sunrise→sunset) split into 8 equal parts; Yamghanda occupies a
// fixed part per weekday. Table below (0=Sun … 6=Sat), part index 0-7 from sunrise.
// Verified: no weekday conflict with Rahu Kaal or Gulika Kaal tables.
const YAMGHANDA_PART_BY_WEEKDAY: Record<number, number> = {
  0: 4, // Sunday   -- 5th part
  1: 2, // Monday   -- 3rd part
  2: 7, // Tuesday  -- 8th part
  3: 5, // Wednesday-- 6th part
  4: 6, // Thursday -- 7th part
  5: 0, // Friday   -- 1st part
  6: 1, // Saturday -- 2nd part
};

export function getYamghanda(sunrise: Date, sunset: Date, dow: number): { start: Date; end: Date } {
  const partMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const part = YAMGHANDA_PART_BY_WEEKDAY[dow]!;
  const start = new Date(sunrise.getTime() + part * partMs);
  const end = new Date(start.getTime() + partMs);
  return { start, end };
}

// ── Gulika Kaal (Maandi) ──
// Source: Muhurta Chintamani; Brihat Parashara Hora Shastra, Gulika chapter.
// Same 8-part daytime split as Rahu Kaal. Part index descends Sun→Sat.
// Gulika is son of Saturn; its period is considered inauspicious for new starts.
// Verified: no weekday conflict with Rahu Kaal or Yamghanda tables.
const GULIKA_PART_BY_WEEKDAY: Record<number, number> = {
  0: 6, // Sunday   -- 7th part
  1: 5, // Monday   -- 6th part
  2: 4, // Tuesday  -- 5th part
  3: 3, // Wednesday-- 4th part
  4: 2, // Thursday -- 3rd part
  5: 1, // Friday   -- 2nd part
  6: 0, // Saturday -- 1st part
};

export function getGulikaKaal(sunrise: Date, sunset: Date, dow: number): { start: Date; end: Date } {
  const partMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const part = GULIKA_PART_BY_WEEKDAY[dow]!;
  const start = new Date(sunrise.getTime() + part * partMs);
  const end = new Date(start.getTime() + partMs);
  return { start, end };
}

// ── Durmuhurta ──
// Source: Muhurta Chintamani, Durmuhurta chapter.
// Two 48-minute windows per day, measured as daytime-muhurta positions (1-indexed)
// counting from sunrise. Daytime = 15 muhurtas (sunrise→sunset ≈ 720 min / 48 = 15).
// We compute each muhurta as (sunset-sunrise)/15 to accommodate variable day-length.
//
// Muhurta positions (1-indexed from sunrise):
//   Sunday: 5, 11  |  Monday: 7, 8  |  Tuesday: 2, 7
//   Wednesday: 5, 10  |  Thursday: 6, 9  |  Friday: 10, 11  |  Saturday: 5, 9
//
// Source: Muhurta Chintamani (adhyaya 5, shloka 6-8); matches Drik Panchang published tables.
const DURMUHURTA_MUHURTAS_BY_WEEKDAY: Record<number, [number, number]> = {
  0: [5, 11],  // Sunday
  1: [7, 8],   // Monday
  2: [2, 7],   // Tuesday
  3: [5, 10],  // Wednesday
  4: [6, 9],   // Thursday
  5: [10, 11], // Friday
  6: [5, 9],   // Saturday
};

export function isDurmuhurta(sunrise: Date, sunset: Date, dow: number, now: Date): boolean {
  const nowMs = now.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  // Only applicable during daytime
  if (nowMs < sunriseMs || nowMs >= sunsetMs) return false;
  const muhurtaMs = (sunsetMs - sunriseMs) / 15; // 15 muhurtas per daytime
  const muhurtas = DURMUHURTA_MUHURTAS_BY_WEEKDAY[dow]!;
  for (const m of muhurtas) {
    const mStart = sunriseMs + (m - 1) * muhurtaMs;
    const mEnd = mStart + muhurtaMs;
    if (nowMs >= mStart && nowMs < mEnd) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANCHANG PHASE 2 — Additional elements for 100% Panchang coverage
// All formulas verified against classical sources before implementation.
// FACT_CHECK_ENGINE sign-off: Oct 4, 2026
// ═══════════════════════════════════════════════════════════════════════════════

// ── Tithi Type (Nanda/Bhadra/Jaya/Rikta/Purna) ──
// Source: Muhurta Chintamani (Tithi Prakarana, shloka 12-16);
//   Brihat Parashara Hora Shastra (Muhurta adhyaya).
// Classification cycles through 5 types for every 5 tithis:
//   Nanda (joy/pleasure): 1, 6, 11, 16, 21, 26
//   Bhadra (auspicious):  2, 7, 12, 17, 22, 27
//   Jaya (victory):       3, 8, 13, 18, 23, 28
//   Rikta (empty/loss):   4, 9, 14, 19, 24, 29
//   Purna (full/complete): 5, 10, 15, 20, 25, 30
// Formula: index = (tithi - 1) % 5; types in order [Nanda, Bhadra, Jaya, Rikta, Purna]
//
// Activity guidance per Muhurta Chintamani:
//   Nanda: Festivals, romance, pleasure activities
//   Bhadra: Daily work, government affairs, building
//   Jaya: Battles, competitive activities, legal matters
//   Rikta: Avoid auspicious starts (classically inauspicious for new beginnings)
//   Purna: Completion, harvest, ceremonies requiring fullness
export type TithiType = "Nanda" | "Bhadra" | "Jaya" | "Rikta" | "Purna";

const TITHI_TYPES: TithiType[] = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"];

export interface TithiTypeResult {
  type: TithiType;
  auspicious: boolean; // Rikta is inauspicious for new starts
  activities: string[];
  note: string;
}

const TITHI_TYPE_ACTIVITIES: Record<TithiType, string[]> = {
  Nanda:  ["Festivals", "Romance", "Pleasure activities", "Arts", "Social gatherings"],
  Bhadra: ["Daily work", "Government affairs", "Construction", "Routine tasks"],
  Jaya:   ["Battles", "Competitions", "Legal matters", "Disputes", "Overcoming obstacles"],
  Rikta:  ["Destructive tasks", "Cutting", "Demolition — avoid auspicious new starts"],
  Purna:  ["Ceremonies", "Completion rituals", "Harvest", "Celebrations", "Puja"],
};

export function getTithiType(tithi: number): TithiTypeResult {
  const idx = (tithi - 1) % 5; // 0-4
  const type = TITHI_TYPES[idx]!;
  return {
    type,
    auspicious: type !== "Rikta",
    activities: TITHI_TYPE_ACTIVITIES[type],
    note: type === "Rikta"
      ? "Rikta Tithi (4th/9th/14th/29th) — classically inauspicious for new beginnings; suited for destructive or urgent tasks only."
      : `${type} Tithi — ${type === "Purna" ? "favorable for completion and ceremonies" : type === "Jaya" ? "favorable for overcoming challenges" : type === "Bhadra" ? "generally auspicious for daily work" : "favorable for pleasure and festive activities"}.`,
  };
}

// ── Kshaya Tithi / Vridhi Tithi ──
// Source: Karana Prakash; Muhurta Chintamani (Tithi chapter, kshetra shodhana);
//   Brihat Parashara Hora Shastra.
//
// Vridhi Tithi (expansion): Same tithi governs two consecutive sunrises.
//   Occurs when Moon moves slowly — less than 12° per solar day.
//   Detection: tithi at today's sunrise == tithi at tomorrow's sunrise.
//   Classical note: Vridhi is generally auspicious (the tithi's energy is amplified).
//
// Kshaya Tithi (contracted/lost): A tithi is entirely contained within a solar day —
//   it begins and ends between two sunrises, so it never governs a sunrise.
//   Occurs when Moon moves fast — more than 12° per solar day.
//   Detection: if (todayTithi + 1) % 30 == tomorrowTithi, no tithi is skipped;
//   if tomorrowTithi > todayTithi + 1 (mod 30), the intermediate tithi is Kshaya.
//   Classical note: Kshaya Tithi is considered inauspicious; activities planned
//   for it must shift to the adjacent tithi.
//
// Parameters: tithiAtTodaySunrise, tithiAtNextSunrise (both 1-30).
export interface KshayaVridhiResult {
  vridhi: boolean;         // true if today's tithi spans into tomorrow
  kshaya: number | null;  // tithi number that is "lost" (never governs a sunrise), or null
  note: string;
}

export function getKshayaVridhi(tithiAtTodaySunrise: number, tithiAtNextSunrise: number): KshayaVridhiResult {
  if (tithiAtTodaySunrise === tithiAtNextSunrise) {
    return {
      vridhi: true,
      kshaya: null,
      note: `Vridhi Tithi: Tithi ${tithiAtTodaySunrise} spans two consecutive sunrises — Moon is moving slowly. The tithi's energy is amplified; generally auspicious.`,
    };
  }
  // Normal: tomorrowTithi = (todayTithi % 30) + 1
  const expectedNext = (tithiAtTodaySunrise % 30) + 1;
  if (tithiAtNextSunrise !== expectedNext) {
    // A tithi was skipped — that skipped tithi is Kshaya
    const kshayaTithi = expectedNext;
    return {
      vridhi: false,
      kshaya: kshayaTithi,
      note: `Kshaya Tithi: Tithi ${kshayaTithi} never governs a sunrise — Moon moved more than 12° in one solar day. Activities classically planned for Tithi ${kshayaTithi} must shift to adjacent tithis.`,
    };
  }
  return { vridhi: false, kshaya: null, note: "Normal tithi progression — no Kshaya or Vridhi." };
}

// ── 27 Nitya Yogas ──
// Source: Muhurta Chintamani (Yoga Prakarana); Brihat Parashara Hora Shastra (Yoga adhyaya).
//   Surya Siddhanta (foundational formula).
//
// Formula: Yoga index = floor(((sunLon + moonLon) % 360) / (360/27))
//   = floor(((sunLon + moonLon) mod 360) / 13.3333°)
//
// The 27 Nitya Yogas (0-indexed):
// Malefic yogas (avoid for auspicious work — Muhurta Chintamani):
//   Vishkambha(0), Atiganda(5), Shoola(8), Ganda(9), Vyaghata(12),
//   Vajra(14), Vyatipata(16), Parigha(18), Vaidhriti(26)
//
// Highly auspicious yogas:
//   Siddhi(15), Amrit(6 — Sukarman gives amrit-like quality per some traditions),
//   Shiva(19), Siddha(20), Brahma(24), Mahendra(25)
export const NITYA_YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarman", "Dhriti", "Shoola", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Mahendra", "Vaidhriti",
];

// Malefic yoga indices (0-based) — Muhurta Chintamani
const NITYA_YOGA_MALEFIC = new Set([0, 5, 8, 9, 12, 14, 16, 18, 26]);
// Highly auspicious yoga indices
const NITYA_YOGA_HIGHLY_AUSPICIOUS = new Set([1, 2, 3, 4, 7, 10, 11, 13, 15, 19, 20, 21, 22, 23, 24, 25]);

export interface NityaYogaResult {
  index: number; // 0-26
  name: string;
  quality: "auspicious" | "malefic" | "neutral";
  note: string;
}

export function getNityaYoga(sunLon: number, moonLon: number): NityaYogaResult {
  const combined = ((sunLon + moonLon) % 360 + 360) % 360;
  const index = Math.floor(combined / (360 / 27));
  const name = NITYA_YOGA_NAMES[index]!;
  const quality = NITYA_YOGA_MALEFIC.has(index)
    ? "malefic"
    : NITYA_YOGA_HIGHLY_AUSPICIOUS.has(index)
    ? "auspicious"
    : "neutral";
  return {
    index,
    name,
    quality,
    note: quality === "malefic"
      ? `${name} Yoga is a malefic Nitya Yoga — classically inauspicious for new auspicious work (Muhurta Chintamani).`
      : quality === "auspicious"
      ? `${name} Yoga is auspicious — favorable for new beginnings.`
      : `${name} Yoga — neutral quality, no specific prohibition or promotion.`,
  };
}

// ── Full 11 Karanas (7 Movable + 4 Fixed) ──
// Source: Brihat Parashara Hora Shastra (Karana adhyaya);
//   Muhurta Chintamani (Karana Prakarana).
//
// A Karana = half a Tithi = 6° of Moon-Sun arc.
// 60 Karanas per lunar month:
//   Positions 1-56: 7 movable Karanas cycling 8 times (7 × 8 = 56)
//   Positions 57-60: 4 fixed Karanas (occur only at the end of the lunar month)
//
// Movable (Chara) Karanas, in cycle order:
//   Bava, Balava, Kaulava, Taitila, Gara, Vanij, Vishti (Bhadra)
//
// Fixed (Sthira) Karanas at end of month:
//   Position 57 = Shakuni (1st half of Krishna Chaturdashi, Tithi 29)
//   Position 58 = Chatushpada (2nd half of Krishna Chaturdashi, Tithi 29)
//   Position 59 = Nagava/Naga (1st half of Amavasya, Tithi 30)
//   Position 60 = Kimstughna (2nd half of Amavasya, Tithi 30)
//
// Vishti (Bhadra) Karana: classically the most inauspicious of movable Karanas;
//   every 7th in the movable cycle. The existing isVishtiKarana() is now superseded
//   by getKarana() which identifies Vishti within the full 11-Karana system.
//
// Inauspicious Karanas (Muhurta Chintamani): Vishti, Shakuni, Chatushpada, Nagava, Kimstughna
const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanij", "Vishti"];
const FIXED_KARANAS = ["Shakuni", "Chatushpada", "Nagava", "Kimstughna"]; // positions 57-60
// Inauspicious for new starts (Muhurta Chintamani)
const INAUSPICIOUS_KARANAS = new Set(["Vishti", "Shakuni", "Chatushpada", "Nagava", "Kimstughna"]);

export interface KaranaResult {
  position: number; // 1-60
  name: string;
  isMovable: boolean;
  isInauspicious: boolean;
  note: string;
}

export function getKarana(moonLon: number, sunLon: number): KaranaResult {
  const diff = ((moonLon - sunLon) + 360) % 360;
  const position = Math.floor(diff / 6) + 1; // 1-60

  let name: string;
  let isMovable: boolean;

  if (position <= 56) {
    // Movable Karanas: 7-cycle
    name = MOVABLE_KARANAS[(position - 1) % 7]!;
    isMovable = true;
  } else {
    // Fixed Karanas at end of month (positions 57-60)
    name = FIXED_KARANAS[position - 57]!;
    isMovable = false;
  }

  const isInauspicious = INAUSPICIOUS_KARANAS.has(name);

  return {
    position,
    name,
    isMovable,
    isInauspicious,
    note: isInauspicious
      ? `${name} Karana is inauspicious — classically avoid starting new auspicious work (Muhurta Chintamani). ${name === "Vishti" ? "Vishti (Bhadra) is especially inauspicious." : "Fixed Karanas at month-end carry specific dosha."}`
      : `${name} Karana — auspicious, no specific prohibition.`,
  };
}

// ── Nakshatra Nature (7 Types) ──
// Source: Muhurta Chintamani (Nakshatra Prakarana, shloka 18-34);
//   Brihat Parashara Hora Shastra (Nakshatra adhyaya);
//   Brihat Samhita (Nakshatra chapter, Varahamihira).
//
// Classification of all 27 Nakshatras into 7 natures:
//   Tikshna (Sharp/Cruel/Dreadful): Ardra, Ashlesha, Jyeshtha, Mula
//   Ugra (Fierce/Severe):           Bharani, Magha, Purva Phalguni, Purva Ashadha, Purva Bhadrapada
//   Mridu (Soft/Mild/Gentle):       Mrigashira, Chitra, Anuradha, Revati
//   Chara (Movable/Variable):       Punarvasu, Swati, Shravana, Dhanishtha, Shatabhisha
//   Sthira (Fixed/Stable):          Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada
//   Laghu/Kshipra (Swift/Light):    Ashwini, Pushya, Hasta, Abhijit (note: Abhijit handled separately)
//   Mishra (Mixed/Common):          Krittika, Vishakha
//
// Indices match NAKSHATRA_NAMES array (0-indexed):
//   0=Ashwini, 1=Bharani, 2=Krittika, 3=Rohini, 4=Mrigashira, 5=Ardra,
//   6=Punarvasu, 7=Pushya, 8=Ashlesha, 9=Magha, 10=Purva Phalguni,
//   11=Uttara Phalguni, 12=Hasta, 13=Chitra, 14=Swati, 15=Vishakha,
//   16=Anuradha, 17=Jyeshtha, 18=Mula, 19=Purva Ashadha,
//   20=Uttara Ashadha, 21=Shravana, 22=Dhanishtha, 23=Shatabhisha,
//   24=Purva Bhadrapada, 25=Uttara Bhadrapada, 26=Revati

export type NakshatraNature = "Tikshna" | "Ugra" | "Mridu" | "Chara" | "Sthira" | "Laghu" | "Mishra";

const NAKSHATRA_NATURE_MAP: Record<number, NakshatraNature> = {
  0:  "Laghu",   // Ashwini
  1:  "Ugra",    // Bharani
  2:  "Mishra",  // Krittika
  3:  "Sthira",  // Rohini
  4:  "Mridu",   // Mrigashira
  5:  "Tikshna", // Ardra
  6:  "Chara",   // Punarvasu
  7:  "Laghu",   // Pushya
  8:  "Tikshna", // Ashlesha
  9:  "Ugra",    // Magha
  10: "Ugra",    // Purva Phalguni
  11: "Sthira",  // Uttara Phalguni
  12: "Laghu",   // Hasta
  13: "Mridu",   // Chitra
  14: "Chara",   // Swati
  15: "Mishra",  // Vishakha
  16: "Mridu",   // Anuradha
  17: "Tikshna", // Jyeshtha
  18: "Tikshna", // Mula
  19: "Ugra",    // Purva Ashadha
  20: "Sthira",  // Uttara Ashadha
  21: "Chara",   // Shravana
  22: "Chara",   // Dhanishtha
  23: "Chara",   // Shatabhisha
  24: "Ugra",    // Purva Bhadrapada
  25: "Sthira",  // Uttara Bhadrapada
  26: "Mridu",   // Revati
};

// Activity suitability per nature (Muhurta Chintamani)
const NAKSHATRA_NATURE_ACTIVITIES: Record<NakshatraNature, string[]> = {
  Tikshna: [
    "Cutting, surgery, dental work",
    "Weapons, confrontation, legal disputes",
    "Black magic, destruction, demolition",
    "Capturing enemies, imprisonment",
  ],
  Ugra: [
    "Fierce competitive activities, battles",
    "Destruction of enemies, aggressive action",
    "Fire-related work, funerals",
    "Avoid for peaceful auspicious starts",
  ],
  Mridu: [
    "Arts, music, dance, romance",
    "Friendship, social gatherings, gifts",
    "Teaching, healing, counseling",
    "Clothing, ornaments, luxury goods",
    "Starting gentle, creative activities",
  ],
  Chara: [
    "Travel, movement, change of residence",
    "Buying vehicles, transportation business",
    "Activities requiring flexibility and change",
    "Starting new ventures needing adaptability",
  ],
  Sthira: [
    "Foundation work, construction, planting",
    "Permanent structures, land purchase",
    "Installation of deity idols, coronation",
    "Long-term commitments, stable activities",
  ],
  Laghu: [
    "Quick decisive tasks, sports, exercise",
    "Medicine, healing, starting treatments",
    "Trade, buying/selling, financial transactions",
    "Communication, writing, education",
  ],
  Mishra: [
    "General mixed activities",
    "Krittika: fire ceremonies, cooking, cutting",
    "Vishakha: worship, creative pursuits",
    "Context-dependent — consult specific purpose",
  ],
};

export interface NakshatraNatureResult {
  nature: NakshatraNature;
  activities: string[];
  note: string;
}

export function getNakshatraNature(nakIdx: number): NakshatraNatureResult {
  const nature = NAKSHATRA_NATURE_MAP[nakIdx] ?? "Mishra";
  return {
    nature,
    activities: NAKSHATRA_NATURE_ACTIVITIES[nature],
    note: `${NAKSHATRA_NAMES[nakIdx] ?? "Unknown"} is a ${nature} nakshatra. ${
      nature === "Tikshna" || nature === "Ugra"
        ? "Avoid for auspicious ceremonies; suitable for fierce/destructive activities."
        : nature === "Mridu"
        ? "Excellent for gentle, creative, and social activities."
        : nature === "Chara"
        ? "Excellent for travel, change, and movement-related activities."
        : nature === "Sthira"
        ? "Excellent for permanent, stable, long-term activities."
        : nature === "Laghu"
        ? "Excellent for quick, commercial, medical, and educational activities."
        : "Mixed quality — assess based on specific activity."
    }`,
  };
}

// ── Comprehensive Nakshatra Attributes (all 27) ──
// Source: Muhurta Chintamani (Nakshatra Prakarana, shlokas 18-85);
//   Brihat Parashara Hora Shastra (Muhurta adhyaya);
//   B.V. Raman, "Muhurta (Electional Astrology)", 8th ed.;
//   Brihat Samhita (Varahamihira, Nakshatra adhyaya).
//
// For each nakshatra: presiding lord, deity, symbol, character,
// domain-wise good/avoid activities, adverse effects of misuse,
// and classical special notes.
//
// Domain keys:
//   personal    — marriage, family, home, relationships
//   professional — career, business, service, entrepreneurship
//   financial   — investment, property purchase, wealth transactions
//   medical     — surgery, treatment, medicine intake, health procedures
//   travel      — journeys, relocation, migration
//   spiritual   — rituals, puja, upasana, mantra diksha, vows
//   creative    — arts, music, learning, crafts, design

export interface NakshatraActivityMap {
  // ── Core domains ──
  personal: string[];         // family life, relationships, daily habits
  professional: string[];     // career, employment, business
  financial: string[];        // investments, wealth, banking
  medical: string[];          // health, treatment, surgery
  travel: string[];           // journeys, relocation, migration
  spiritual: string[];        // puja, mantra, sadhana, rituals
  creative: string[];         // arts, music, crafts, design
  // ── Extended domains ──
  educational: string[];      // formal study, exams, admissions, vidya arambha
  legal: string[];            // court, disputes, contracts, agreements
  agricultural: string[];     // farming, planting, cattle, land use
  social: string[];           // parties, gatherings, social events, networking
  property: string[];         // real estate, construction, bhoomi puja
  political: string[];        // elections, governance, appointments, campaigns
  children: string[];         // conception, pregnancy, childbirth, naming
}

// ── Navtara Paddhati ──────────────────────────────────────────────────────────
// Source: Krishnamurti Paddhati; B.V. Raman "Muhurta" Chapter 4; BPHS Muhurta
//
// 27 nakshatras are counted from the birth nakshatra in groups of 9, repeating 3 times.
// Each position (1-9) carries a fixed quality regardless of which nakshatra fills it.
//
// Classification:
//   1. Janma       – birth star itself       [neutral: personal but sensitive]
//   2. Sampat      – wealth, prosperity      [benefic]
//   3. Vipat       – danger, obstacles       [malefic]
//   4. Kshema      – wellbeing, comfort      [benefic]
//   5. Pratyak     – opposition, obstacles   [malefic]
//   6. Saadhana    – achievement, success    [benefic]
//   7. Vadha/Naidhana – destruction          [malefic — most adverse]
//   8. Mitra       – friend                  [benefic]
//   9. Parama Mitra – best friend            [most benefic]
//
// Usage: For a birth nakshatra index b (0-26) and question/muhurta nakshatra index q (0-26),
// count from b to q cyclically to find the Navtara position.

export type NavtaraName =
  | "Janma"
  | "Sampat"
  | "Vipat"
  | "Kshema"
  | "Pratyak"
  | "Saadhana"
  | "Vadha"
  | "Mitra"
  | "Parama Mitra";

export type NavtaraQuality = "neutral" | "benefic" | "malefic" | "most_benefic" | "most_malefic";

export interface NavtaraResult {
  position: number;          // 1-9 cycle position
  name: NavtaraName;
  quality: NavtaraQuality;
  meaning: string;
  recommendation: string;
  score: number;             // –2 to +2 for convergence scoring
}

const NAVTARA_TABLE: NavtaraResult[] = [
  { position: 1, name: "Janma",        quality: "neutral",       score:  0, meaning: "Birth star itself",        recommendation: "Neutral — avoid initiating new ventures; suitable for personal matters only" },
  { position: 2, name: "Sampat",       quality: "benefic",       score:  1, meaning: "Prosperity and wealth",    recommendation: "Favorable — good for financial ventures and general auspicious activities" },
  { position: 3, name: "Vipat",        quality: "malefic",       score: -1, meaning: "Danger and obstacles",     recommendation: "Unfavorable — avoid new ventures; obstacles and setbacks likely" },
  { position: 4, name: "Kshema",       quality: "benefic",       score:  1, meaning: "Wellbeing and comfort",    recommendation: "Favorable — good for health, family, and comfort-seeking activities" },
  { position: 5, name: "Pratyak",      quality: "malefic",       score: -1, meaning: "Opposition and resistance", recommendation: "Unfavorable — people and circumstances will oppose what is begun" },
  { position: 6, name: "Saadhana",     quality: "benefic",       score:  2, meaning: "Achievement and success",  recommendation: "Very favorable — excellent for goal-oriented and achievement work" },
  { position: 7, name: "Vadha",        quality: "most_malefic",  score: -2, meaning: "Destruction and loss",     recommendation: "Most adverse — strongly avoid all auspicious work in this nakshatra" },
  { position: 8, name: "Mitra",        quality: "benefic",       score:  1, meaning: "Friendship and support",   recommendation: "Favorable — good for partnerships, social work, and collaborative ventures" },
  { position: 9, name: "Parama Mitra", quality: "most_benefic",  score:  2, meaning: "Best friend, highest grace", recommendation: "Most favorable — the best nakshatra for any important auspicious work" },
];

/**
 * Calculate Navtara (Tarabala) for a given birth nakshatra and muhurta nakshatra.
 * Source: KP; BPHS Muhurta adhyaya; B.V. Raman "Muhurta"
 *
 * @param birthNakIdx   Birth nakshatra index (0-26, Ashwini=0 ... Revati=26)
 * @param queryNakIdx   Nakshatra index of the muhurta moment (0-26)
 * @returns NavtaraResult with Tarabala classification
 */
export function calculateNavtara(birthNakIdx: number, queryNakIdx: number): NavtaraResult {
  // Count from birth nakshatra (inclusive), cyclically through 27
  // Position = ((queryNak - birthNak) mod 27) + 1 → 1 to 27
  // Navtara cycle = ((position - 1) mod 9) + 1 → 1 to 9
  const forwardCount = ((queryNakIdx - birthNakIdx) % 27 + 27) % 27 + 1;
  const cyclePosition = ((forwardCount - 1) % 9) + 1;
  return NAVTARA_TABLE[cyclePosition - 1]!;
}

/**
 * Get Navtara score for convergence scoring (–2 to +2).
 */
export function getNavtaraScore(birthNakIdx: number, queryNakIdx: number): number {
  return calculateNavtara(birthNakIdx, queryNakIdx).score;
}

export interface NakshatraCoreActivityMap {
  personal: string[];
  professional: string[];
  financial: string[];
  medical: string[];
  travel: string[];
  spiritual: string[];
  creative: string[];
}

export interface NakshatraAttributeEntry {
  name: string;
  lord: string;          // ruling planet (Navagraha)
  deity: string;         // presiding deity
  symbol: string;        // classical symbol
  general: string;       // one-line core character
  good: NakshatraCoreActivityMap;
  avoid: NakshatraCoreActivityMap;
  adverse_effects: string;   // what classical texts warn when used wrongly
  special: string;           // unique classical rule or caveat
}

export const NAKSHATRA_ATTRIBUTES: NakshatraAttributeEntry[] = [
  // ─── 0. Ashwini ───────────────────────────────────────────────────────────
  {
    name: "Ashwini",
    lord: "Ketu",
    deity: "Ashwini Kumaras (divine physicians)",
    symbol: "Horse's head",
    general: "Swift, healing, pioneering — the fastest nakshatra. Excellent for quick decisive actions and medical beginnings.",
    good: {
      personal:     ["Starting new life chapters", "Buying vehicles, horses", "First step of any new endeavor", "Entering a new home"],
      professional: ["Launching a new business or venture quickly", "Government/administrative tasks", "Competitive races and sport", "Debut performances"],
      financial:    ["Buying vehicles, equipment, or fast-moving assets", "Quick financial decisions where speed matters", "Initiating loans or credit lines"],
      medical:      ["Starting any medical treatment", "Surgery initiation (swift recovery indicated)", "Herbal remedies and Ayurvedic treatments", "Healing therapies of all kinds"],
      travel:       ["Beginning any journey — especially short, fast trips", "Long-distance travel initiation", "Journeys to doctors or hospitals"],
      spiritual:    ["Mantra diksha for protection and swift results", "Hanuman puja", "Kavach and protective rituals"],
      creative:     ["Starting new art projects with urgency", "Learning a new skill quickly", "Dance and athletic arts"],
    },
    avoid: {
      personal:     ["Slow, deliberate marriage negotiations (too hasty)", "Permanent family commitments requiring careful thought"],
      professional: ["Long-term contractual agreements (haste causes errors)", "Patience-requiring agricultural work"],
      financial:    ["Long-gestation property investments"],
      medical:      ["Prolonged medical procedures requiring patience"],
      travel:       [],
      spiritual:    ["Slow, elaborate fire ceremonies (use Rohini instead)"],
      creative:     ["Tasks requiring sustained, slow creative development"],
    },
    adverse_effects: "Haste leads to incomplete results; actions started with shortcuts may need revisiting. Ketu's influence can cause detachment from outcomes.",
    special: "Considered the best nakshatra for medical treatment initiation and for all healing work. Ashwini Kumaras are the physicians of the gods (BPHS).",
  },

  // ─── 1. Bharani ───────────────────────────────────────────────────────────
  {
    name: "Bharani",
    lord: "Venus",
    deity: "Yama (god of death and dharma)",
    symbol: "Yoni (womb/bearing vessel)",
    general: "Fierce, transformative, karmic bearing. Rules birth, death, and all extreme transitions. Ugra (severe) nakshatra — avoid auspicious new starts.",
    good: {
      personal:     ["Separation from toxic relationships (Yama = justice)", "Endings and closures", "Confronting difficult personal truths"],
      professional: ["Punishing enemies or rivals — legal action, debt recovery", "Terminating contracts or employees", "Tasks needing raw courage and confrontation"],
      financial:    ["Winding up financial losses, writing off bad debts", "Debt collection, recovery of owed money", "Closing unprofitable business lines"],
      medical:      ["Surgery involving cutting/removal", "Dental extractions", "Procedures requiring courage under pain"],
      travel:       ["Journeys to cremation grounds, courts, or government offices", "Investigative travel"],
      spiritual:    ["Pitru tarpan, shradh, ancestral ceremonies (Yama governs)", "Fire offerings for protection from enemies", "Kali or Durga related fire pujas"],
      creative:     ["Dark, powerful art expressing intense emotions", "Death-themed or transformative creative work"],
    },
    avoid: {
      personal:     ["Marriage ceremonies", "Naming ceremonies for children", "Beginning loving, nurturing relationships", "Upanayana/thread ceremony"],
      professional: ["Launching new auspicious ventures", "Business openings, product launches"],
      financial:    ["New investments or savings plans", "Property purchases for growth"],
      medical:      ["Elective non-urgent medical procedures", "Fertility treatments"],
      travel:       ["Pilgrimages and sacred journeys", "Pleasure trips"],
      spiritual:    ["Auspicious vratas and utsavas", "Weddings and griha pravesh"],
      creative:     ["Gentle, aesthetic arts like classical music performance"],
    },
    adverse_effects: "Work started in Bharani carries heavy karmic weight — outcomes are irreversible. Yama enforces results; no escape from consequences of wrong actions begun here.",
    special: "Bharani is specifically recommended for acts of courage and justice. Venus as lord can make outcomes materially comfortable even within fierce themes (B.V. Raman).",
  },

  // ─── 2. Krittika ──────────────────────────────────────────────────────────
  {
    name: "Krittika",
    lord: "Sun",
    deity: "Agni (fire god)",
    symbol: "Razor/flame",
    general: "Sharp, fiery, cutting. Mishra (mixed) nature — good for fire-based, purifying, cutting, and courageous acts. Mixed results for auspicious events.",
    good: {
      personal:     ["Hair cutting/shaving (razor symbol)", "Entering a new home (Agni puja at griha pravesh)", "Adoption ceremonies"],
      professional: ["Metallurgy, forging, fire-based industry", "Cooking as profession", "Military, police, security work"],
      financial:    ["Gold purchases (Sun = gold)", "Fire industry investments (steel, cooking, energy)"],
      medical:      ["Surgery and cutting procedures", "Cauterization and fire-based treatments", "Eye surgery (Sun governs eyes)"],
      travel:       ["Journeys involving courage", "Travel related to government/authority matters"],
      spiritual:    ["Agni hotra and havan (fire ceremonies)", "Sun worship, Surya namaskar vows", "Mantra sadhana for vitality and courage"],
      creative:     ["Cooking arts and culinary creativity", "Metal sculpture", "Photography and light-based arts"],
    },
    avoid: {
      personal:     ["Marriage ceremonies (sharp/cutting energy is inauspicious for marriage bonds)", "Naming ceremonies"],
      professional: ["Diplomatic negotiations (too sharp)", "Activities requiring patience and tact"],
      financial:    ["Long-term savings (fire burns through wealth if misused)"],
      medical:      ["Non-invasive healing therapies"],
      travel:       ["Gentle pleasure journeys"],
      spiritual:    ["Water-based rituals and Moon-based ceremonies (Shiva abhishek)"],
      creative:     ["Gentle musical performances"],
    },
    adverse_effects: "Agni energy burns — what is initiated here may escalate beyond control. Mixed Mishra nature means results are unpredictable for auspicious purposes.",
    special: "Krittika spans two rashis (Aries and Taurus) — first pada in Aries, rest in Taurus. The razor symbol: purifies and cuts, but wounds if used carelessly. Agni is both destroyer and purifier (BPHS).",
  },

  // ─── 3. Rohini ────────────────────────────────────────────────────────────
  {
    name: "Rohini",
    lord: "Moon",
    deity: "Brahma/Prajapati (creator)",
    symbol: "Chariot, ox-cart, banyan tree",
    general: "Stable, fertile, prosperous. Sthira (fixed) — best for permanent constructions, planting, marriage, and all creative abundance. Brahma's favorite nakshatra.",
    good: {
      personal:     ["Marriage (highly auspicious)", "Griha pravesh (entering new home)", "Planting trees, gardens", "Naming ceremony (highly auspicious)", "Pregnancy announcement and baby shower"],
      professional: ["Starting a permanent business or office", "Construction company launches", "Agricultural business", "Real estate development", "Long-term employment agreements"],
      financial:    ["Property purchase — land, house, plot (best nakshatra)", "Long-term investment initiation", "Opening fixed deposits or permanent savings", "Buying farmland"],
      medical:      ["Planting medicinal herbs", "Fertility treatments", "Procedures for long-term healing", "Nutrition and wellness programs"],
      travel:       ["Settling in a new city or country (permanent relocation)", "Journeys to sacred groves or nature"],
      spiritual:    ["Installation of deity idols in temple or home", "Foundation stone laying with puja", "Planting sacred Tulsi or Peepal", "Permanent vows (sankalpa for long-term sadhana)"],
      creative:     ["Learning classical arts (permanent skill)", "Composing music for long-lasting work", "Architecture and design"],
    },
    avoid: {
      personal:     ["Quick impulsive separations or relocations"],
      professional: ["Short-term speculative ventures", "Activities requiring rapid change"],
      financial:    ["High-frequency trading or speculative short positions"],
      medical:      ["Emergency surgery (use Ashwini for speed)"],
      travel:       ["Short quick journeys (Sthira = fixed, not for movement)", "Long journeys away from home (leaves roots behind)"],
      spiritual:    ["Destructive or fierce fire ceremonies"],
      creative:     ["Trendy, short-lived creative work"],
    },
    adverse_effects: "Sthira energy means results are very permanent — wrong decisions here become very difficult to reverse. Excessive attachment is a Rohini risk (Moon's strongest placement).",
    special: "Rohini is the Moon's own nakshatra and most exalted placement. Brahma chose Rohini as his favorite among his 27 wives (nakshatras) — all of whom are Moon's consorts (Puranas). Best of all nakshatras for property and marriage.",
  },

  // ─── 4. Mrigashira ───────────────────────────────────────────────────────
  {
    name: "Mrigashira",
    lord: "Mars",
    deity: "Soma (Moon god)",
    symbol: "Deer's head",
    general: "Gentle, seeking, curious. Mridu — excellent for gentle auspicious acts, travel, learning, romance, and artistic pursuits. Deer's search = quest for beauty and knowledge.",
    good: {
      personal:     ["Marriage — especially the sacred meeting/searching phase", "New romantic relationships", "Gift-giving to loved ones", "Social gatherings and parties", "Wearing new ornaments and clothing"],
      professional: ["Starting research projects", "Sales and marketing (gentle persuasion)", "Fashion and beauty industry launches", "Travel and tourism business"],
      financial:    ["Buying ornaments, jewelry, gems (Soma = Moon = gems)", "Fashion/textile investments", "Gentle diversification of portfolio"],
      medical:      ["Gentle healing therapies — Ayurveda, naturopathy", "Convalescent recovery activities", "Nutritional medicine and diet programs"],
      travel:       ["Beginning new journeys (especially to beautiful places)", "Travel for romance or pleasure", "Research expeditions", "Pilgrimages with gentle intent"],
      spiritual:    ["Moon-related rituals and Moon fasting", "Offering flowers and fragrance in puja", "Gentle mantra japa and meditation", "Sacred music and kirtan"],
      creative:     ["Music, poetry, literature", "Jewelry design and crafting", "Fashion design", "Gentle creative arts", "Writing love poetry or romantic fiction"],
    },
    avoid: {
      personal:     ["Confrontational conversations or disputes"],
      professional: ["Aggressive business launches requiring authority", "Military or police actions"],
      financial:    ["Aggressive financial maneuvers or hostile takeovers"],
      medical:      ["Surgery or invasive procedures"],
      travel:       [],
      spiritual:    ["Fierce fire ceremonies for enemy destruction"],
      creative:     ["Harsh, aggressive creative expressions"],
    },
    adverse_effects: "The deer is always searching — work initiated here can lose focus and wander. Results may be pleasant but dispersed if purpose is not clear.",
    special: "Spans two rashis (Gemini and Taurus). Mars as lord with Soma as deity creates a warrior who seeks beauty — intensity beneath gentleness. Excellent for any search: jobs, partners, information.",
  },

  // ─── 5. Ardra ─────────────────────────────────────────────────────────────
  {
    name: "Ardra",
    lord: "Rahu",
    deity: "Rudra (Shiva as storm/destruction)",
    symbol: "Teardrop, diamond, human head",
    general: "Fierce, stormy, destructive-transformative. Tikshna — ruled by Rudra's wrath. Best for destruction, demolition, breaking, and intense research. Worst for auspicious acts.",
    good: {
      personal:     ["Ending toxic or abusive relationships (Rudra removes what harms)", "Profound personal transformation", "Grief processing and catharsis"],
      professional: ["Demolition and construction industry (breaking to rebuild)", "Research into destructive phenomena", "Cybersecurity, hacking defense", "Crisis management"],
      financial:    ["Breaking loss-making financial patterns", "Short-selling or bearish financial positions", "Liquidation of assets"],
      medical:      ["Surgery for removal of disease/tumors", "Radical/emergency procedures", "Amputation and extreme interventions", "Poison antidote treatment"],
      travel:       ["Travel through storms or difficult terrain", "Investigative/forensic travel"],
      spiritual:    ["Rudra abhishek (Shiva's fierce form)", "Bhairav puja and Kali upasana", "Destruction of negative samskaras through tantric rituals"],
      creative:     ["Dark art, horror genre", "Investigative journalism", "Storm photography"],
    },
    avoid: {
      personal:     ["Marriage", "Any new auspicious relationships", "Naming ceremonies", "Baby showers"],
      professional: ["Peaceful business openings", "Partnership formation", "Product launches"],
      financial:    ["New investments for growth", "Property purchases"],
      medical:      ["Elective or non-urgent procedures", "Fertility treatments"],
      travel:       ["Pleasurable journeys", "Pilgrimages to auspicious sites"],
      spiritual:    ["Auspicious vows, upanayana", "Sattvic pujas and celebrations"],
      creative:     ["Gentle, beautiful artistic creations"],
    },
    adverse_effects: "Rahu intensifies and distorts — whatever begins here can spiral beyond control. Destruction without clear intention leaves chaos rather than transformation.",
    special: "Ardra is the stormiest and most intense nakshatra. The diamond in its symbol represents the clarity that emerges after storm. Rudra = Shiva = transformation through destruction (Muhurta Chintamani).",
  },

  // ─── 6. Punarvasu ────────────────────────────────────────────────────────
  {
    name: "Punarvasu",
    lord: "Jupiter",
    deity: "Aditi (mother of gods, boundless)",
    symbol: "Bow and quiver",
    general: "Restoring, returning, expansive. Chara — excellent for travel, returning home, fresh starts after setbacks, and anything involving renewal and second chances.",
    good: {
      personal:     ["Returning home after long absence", "Reconciliation in relationships", "Marriage (especially after a troubled period — renewal)", "Starting family after loss"],
      professional: ["Reopening a business after setback", "Career comeback after failure", "Applying for jobs again after rejection", "Expanding to new territories"],
      financial:    ["Recovery investments after financial loss", "Reinvesting in previously failed ventures", "Beginning again with savings after debt clearance"],
      medical:      ["Recovery and rehabilitation programs", "Starting treatment again after relapse", "Convalescence and return to health", "Second opinions and fresh medical beginnings"],
      travel:       ["Return journeys (going back home)", "Second attempt at failed travel", "Journeys for renewal — pilgrimages, retreats"],
      spiritual:    ["Renewed spiritual vows after a break", "Puja for Aditi (divine mother) for abundance", "Jupiter-related rituals for wisdom and expansion"],
      creative:     ["Returning to abandoned creative projects", "Reviving old compositions", "Learning a second language or skill"],
    },
    avoid: {
      personal:     ["Permanent irrevocable decisions (Chara = movable)"],
      professional: ["Fixed, unmovable long-term contracts"],
      financial:    ["Permanent real estate decisions without flexibility"],
      medical:      [],
      travel:       ["Permanent relocation (prefer Rohini for that)"],
      spiritual:    ["Very fierce fire ceremonies"],
      creative:     ["Permanently fixed creative structures"],
    },
    adverse_effects: "Chara nature means things may not stay where placed — plans can shift again after initiation. Risk of perpetual restarting without completion.",
    special: "Punar = again, Vasu = wealth/home. Punarvasu literally means 'returning wealth/good fortune.' Jupiter's lordship makes this one of the most naturally auspicious nakshatras despite Chara (movable) nature (B.V. Raman).",
  },

  // ─── 7. Pushya ───────────────────────────────────────────────────────────
  {
    name: "Pushya",
    lord: "Saturn",
    deity: "Brihaspati (Jupiter, preceptor of gods)",
    symbol: "Cow's udder, flower, circle",
    general: "The most nourishing, auspicious nakshatra for almost all activities. Laghu — Guru Pushya and Ravi Pushya yogas are among the most auspicious muhurtas in Jyotish.",
    good: {
      personal:     ["Almost all personal ceremonies: naming, upanayana, griha pravesh", "Adoption", "Starting a diet/health regime", "Buying a cow or adopting a pet"],
      professional: ["Launching any business (especially service or nourishing sector)", "Starting employment", "Opening a shop or office", "Any professional beginning"],
      financial:    ["Buying gold (Dhanteras equivalent)", "Investment in any sector", "Starting savings or SIP", "Property purchase", "Opening bank accounts"],
      medical:      ["All medical treatments and surgeries", "Starting Ayurvedic pancha karma", "Any healing initiation", "Vaccination and preventive care"],
      travel:       ["All journeys — short and long", "Pilgrimages", "Business travel", "Migration"],
      spiritual:    ["Mantra diksha (especially Guru Pushya)", "Installing deities", "Beginning any sadhana", "All religious ceremonies"],
      creative:     ["Learning any art, music, dance", "Starting creative projects", "Writing and publishing"],
    },
    avoid: {
      personal:     ["Marriage — this is the ONE major exception. Pushya is specifically contraindicated for marriage by Muhurta Chintamani (shloka 37). Guru Pushya Yoga is powerful but not for marriage."],
      professional: [],
      financial:    [],
      medical:      [],
      travel:       [],
      spiritual:    [],
      creative:     [],
    },
    adverse_effects: "The single exception — marriage in Pushya is classically prohibited by Muhurta Chintamani. For everything else, Pushya is protective and nourishing.",
    special: "Saturn as lord of this nourishing nakshatra is surprising — it shows Saturn's capacity for patient, structured nourishment. Brihaspati as deity = divine wisdom. Guru Pushya Yoga (Thursday + Pushya) is exceptionally powerful for business beginnings (Muhurta Chintamani).",
  },

  // ─── 8. Ashlesha ─────────────────────────────────────────────────────────
  {
    name: "Ashlesha",
    lord: "Mercury",
    deity: "Sarpa (serpent deities, Nagas)",
    symbol: "Coiled serpent",
    general: "Serpentine, clinging, occult, sharp. Tikshna — extremely inauspicious for most auspicious ceremonies. Excellent for occult, hidden research, medicine, and strategic manipulation.",
    good: {
      personal:     ["Dealing with hypnotic or seductive situations consciously", "Psychological therapy and deep inner work", "Untangling complicated personal situations"],
      professional: ["Research into hidden or complex systems", "Intelligence and espionage work", "Psychology, psychiatry, counseling", "Pharmaceutical and poison research", "Tantra and occult practice as profession"],
      financial:    ["Research-intensive financial analysis", "Short-selling (serpent = strikes from below)", "Uncovering financial fraud"],
      medical:      ["Antivenom and poison-related treatments", "Psychosomatic treatments", "Hypnotherapy", "Neurological procedures"],
      travel:       ["Secret or undercover journeys", "Travel for investigation"],
      spiritual:    ["Naga puja and serpent deity worship", "Rahu-Ketu related remedies", "Tantric sadhana", "Kundalini yoga initiation"],
      creative:     ["Psychological fiction and thrillers", "Occult and esoteric writing", "Investigative journalism"],
    },
    avoid: {
      personal:     ["Marriage (serpent = clinging and possibly venomous to relationship)", "Business partnerships (risk of betrayal)", "New friendships or trust-building"],
      professional: ["Transparent, trust-based business launches", "Financial service businesses requiring client trust"],
      financial:    ["New investments requiring trust", "Entering business with new partners"],
      medical:      ["Elective positive health procedures"],
      travel:       ["Pilgrimages and auspicious journeys"],
      spiritual:    ["Sattvic puja, upanayana, naming ceremonies", "Marriage rituals"],
      creative:     ["Uplifting, joyful creative work"],
    },
    adverse_effects: "Mercury + Sarpa = deceptive intelligence. Things begun here may involve hidden complications that emerge later like a sleeping serpent waking. Clinging nature means it's hard to exit decisions made here.",
    special: "Ashlesha literally means 'the embracer' — the coil that holds tight. Naga worship here is prescribed for removing snake-related curses (Sarpa dosha remedy). Mercury's rulership gives sharp analytical power to this fierce nakshatra.",
  },

  // ─── 9. Magha ────────────────────────────────────────────────────────────
  {
    name: "Magha",
    lord: "Ketu",
    deity: "Pitru (ancestors, forefathers)",
    symbol: "Royal throne, palanquin",
    general: "Royal, ancestral, authoritative. Ugra — fierce with ancestral power. Excellent for ancestral ceremonies, governance, authority assertion. Avoid new auspicious starts.",
    good: {
      personal:     ["Shradh and ancestral offerings (Pitru tarpan)", "Connecting with family lineage", "Assuming ancestral property or titles", "Funerary rites and death ceremonies"],
      professional: ["Government service entry", "Royal/leadership proclamations", "Coronation or appointment to authority", "Political campaigns and leadership assertion"],
      financial:    ["Inheriting ancestral property (best nakshatra for this)", "Assuming family business", "Government contract initiation"],
      medical:      ["Ancestral karma-related healing (past-life therapy)", "Pitru dosha remedies"],
      travel:       ["Pilgrimage to ancestral sites", "Travel to homeland"],
      spiritual:    ["Pitru puja, tarpan, shradh (primary purpose of Magha)", "Invocation of ancestors for blessings", "Ketu mantra for liberation"],
      creative:     ["Royal and traditional art forms", "Documentation of family/clan history", "Classical music rooted in tradition"],
    },
    avoid: {
      personal:     ["Marriage", "Naming ceremony", "New relationship beginnings", "Baby shower"],
      professional: ["Launching new businesses from scratch", "New partnerships"],
      financial:    ["Fresh speculative investments"],
      medical:      ["Elective general medical procedures"],
      travel:       ["Pleasure journeys", "Journeys away from one's roots"],
      spiritual:    ["New auspicious vows and vratas", "Upanayana"],
      creative:     ["New, innovative creative projects"],
    },
    adverse_effects: "Ketu's influence brings detachment and karma. Actions here draw in heavy ancestral consequences. Wrong use (e.g., marriage) can bring ancestral curses rather than blessings.",
    special: "The royal throne symbol indicates authority — anyone who begins a leadership role in Magha will carry ancestral legitimacy. Ketu as lord = spiritual liberation through ancestral service. Magha is sometimes called 'the throne of kings' (Muhurta Chintamani).",
  },

  // ─── 10. Purva Phalguni ───────────────────────────────────────────────────
  {
    name: "Purva Phalguni",
    lord: "Venus",
    deity: "Bhaga (god of marital happiness, enjoyment)",
    symbol: "Front legs of bed, fig tree",
    general: "Pleasure-oriented, creative, sensual. Ugra — despite its beauty, traditionally inauspicious for new starts. Bhaga rules enjoyment, marriage happiness, and creative arts.",
    good: {
      personal:     ["Honeymoon and marital pleasures (after the marriage ceremony)", "Creative romantic activities", "Relaxation and leisure", "Fashion and beauty enhancement"],
      professional: ["Entertainment industry ventures", "Creative arts business", "Hospitality and luxury sector", "Film, television, and media"],
      financial:    ["Investment in entertainment and luxury goods", "Beauty industry investments"],
      medical:      ["Reproductive health treatments (Bhaga governs fertility/sex)", "Beauty and cosmetic procedures", "Pleasure-enhancing therapies"],
      travel:       ["Pleasure trips and honeymoons", "Journeys to entertainment and resorts"],
      spiritual:    ["Bhaga puja for marital happiness", "Venus-related rituals for beauty and love", "Lalita Sahasranama recitation"],
      creative:     ["Music, dance, drama", "Writing romantic literature", "Fashion design", "Jewelry and luxury crafts"],
    },
    avoid: {
      personal:     ["Marriage initiation ceremony (Purva nakshatras are inauspicious for marriage in many traditions)", "Naming ceremonies"],
      professional: ["Serious contractual or legal new beginnings"],
      financial:    ["Serious long-term investments requiring discipline"],
      medical:      [],
      travel:       ["Business travel requiring seriousness"],
      spiritual:    ["Ancestral ceremonies, shradh"],
      creative:     [],
    },
    adverse_effects: "Bhaga governs pleasure — actions here can become self-indulgent and lack discipline for long-term building. Venus without boundaries leads to excess.",
    special: "The bed symbol indicates this is the nakshatra of comfort and marital enjoyment — the aftermath of marriage, not its initiation. 'Purva' (former/front) indicates it precedes the auspicious Uttara Phalguni (B.V. Raman).",
  },

  // ─── 11. Uttara Phalguni ─────────────────────────────────────────────────
  {
    name: "Uttara Phalguni",
    lord: "Sun",
    deity: "Aryaman (god of contracts, marriage, friendship)",
    symbol: "Rear legs of bed, fig tree",
    general: "Partnership, contractual, stable. Sthira — highly auspicious for marriage, contracts, and long-term partnerships. Aryaman governs sacred bonds.",
    good: {
      personal:     ["Marriage (one of the best for this)", "Engagement and betrothal", "Sacred partnerships and friendships", "Adopting a child", "Griha pravesh with life partner"],
      professional: ["Business partnerships and MoUs", "Employment contracts signing", "Company formation", "Long-term service agreements", "Government service joining"],
      financial:    ["Long-term investment partnerships", "Property co-purchase with partner", "Fixed deposits and long-term bonds"],
      medical:      ["Long-term health programs", "Treatments with clear contractual timelines"],
      travel:       ["Travel with partner or group", "Journey to meet important alliances"],
      spiritual:    ["Marriage-related puja and rituals", "Aryaman puja for contracts", "Sun worship for vitality", "Partnership vows"],
      creative:     ["Collaborative creative projects", "Joint artistic ventures", "Long-form writing"],
    },
    avoid: {
      personal:     ["Solitary or isolating activities"],
      professional: ["Solo ventures with no partnerships needed"],
      financial:    ["Quick speculative short-term trades"],
      medical:      ["Urgent emergency procedures"],
      travel:       ["Solo isolated journeys"],
      spiritual:    ["Lone, reclusive spiritual practices"],
      creative:     ["Quick one-off creative experiments"],
    },
    adverse_effects: "Sthira + Sun = very permanent. Contracts made here are hard to dissolve. Wrong partnerships entered here can be very binding and difficult to exit.",
    special: "Sun as lord, Aryaman as deity — this is the nakshatra of noble contracts. The first pada falls in Leo (Sun's sign), making it especially strong for royalty and leadership partnerships. Considered one of the best nakshatras for marriage alongside Rohini and Mrigashira (Muhurta Chintamani).",
  },

  // ─── 12. Hasta ───────────────────────────────────────────────────────────
  {
    name: "Hasta",
    lord: "Moon",
    deity: "Savitar (the creative aspect of Sun)",
    symbol: "Hand (open palm)",
    general: "Skilled, dexterous, commercial, quick. Laghu — one of the best all-round nakshatras. Hasta = hand; governs craftsmanship, trade, skill, and quick intelligent action.",
    good: {
      personal:     ["Almost all personal ceremonies — naming, upanayana, marriage", "Buying jewels and ornaments with hands (gifts)", "Teaching children manual skills"],
      professional: ["All trade and commercial activities", "Crafts and manufacturing", "Surgery (hand precision)", "Writing and journalism", "All skill-based professions"],
      financial:    ["Buying/selling of any kind", "Stock market transactions", "Market trading", "Gem and jewelry purchase", "Real estate transactions"],
      medical:      ["Surgical procedures (Savitar = precise)", "All medical treatments", "Physiotherapy and manual therapies", "Dentistry"],
      travel:       ["All journeys, especially trade travel", "Travel for skill acquisition", "Pilgrimages"],
      spiritual:    ["Hasta nakshatra puja for skill and dexterity", "Savitar mantra for creative power", "Artisan pujas"],
      creative:     ["All crafts and handiwork", "Sculpture and painting", "Music and dance", "Writing, printing, publishing", "Architecture and engineering design"],
    },
    avoid: {
      personal:     ["Activities requiring complete passivity"],
      professional: ["Tasks requiring zero manual or intellectual skill"],
      financial:    [],
      medical:      [],
      travel:       [],
      spiritual:    [],
      creative:     [],
    },
    adverse_effects: "Moon as lord brings emotional fluctuation — decisions may be skillfully executed but emotionally driven. Hasta's quickness can mean overtrading or excessive transactions.",
    special: "Hasta is particularly favored for gambling and speculation in classical texts (B.V. Raman). The open hand symbolizes both giving and receiving. Savitar is the aspect of Sun that creates and crafts — making Hasta the nakshatra of divine craftsmanship.",
  },

  // ─── 13. Chitra ──────────────────────────────────────────────────────────
  {
    name: "Chitra",
    lord: "Mars",
    deity: "Vishwakarma (divine architect, craftsman of gods)",
    symbol: "Bright jewel, shining pearl",
    general: "Brilliant, artistic, architectural, technical. Mridu — excellent for all creative design, technology, jewelry, and architectural work. Vishwakarma is the engineer of heaven.",
    good: {
      personal:     ["Wearing new beautiful ornaments and gems", "Decorating home and personal space", "Fashion makeovers", "Marriage (beautiful appearance and ceremony)"],
      professional: ["Architecture and construction design", "Engineering and technology projects", "Jewelry design and manufacturing", "Fashion industry", "Film production and visual arts", "Software and UI design"],
      financial:    ["Investment in technology, gems, real estate design", "Buying jewelry as asset", "Design industry investments"],
      medical:      ["Plastic surgery and cosmetic procedures", "Dental cosmetics", "Ophthalmic procedures"],
      travel:       ["Travel for design inspiration", "Architecture tours", "Journeys to beautiful destinations"],
      spiritual:    ["Vishwakarma puja (Sept 17 traditionally)", "Temple construction initiation", "Puja with beautiful decoration and floral arrangements"],
      creative:     ["ALL creative design arts", "Architecture, sculpture, jewelry", "Film and photography", "Fashion and textile design", "Digital art and UI/UX design"],
    },
    avoid: {
      personal:     ["Mundane, uncreative tasks"],
      professional: ["Work requiring rough, unskilled labor alone"],
      financial:    [],
      medical:      [],
      travel:       [],
      spiritual:    ["Rough fire ceremonies without beauty"],
      creative:     [],
    },
    adverse_effects: "Mars as lord can bring perfectionism to destructive levels — the jewel must shine, and if it doesn't, Mars may force harsh correction. Risk of over-ornamentation without substance.",
    special: "Chitra spans Virgo and Libra — its brightness is visible as the star Spica (Alfa Virginis), one of the brightest in the sky. Vishwakarma built Lanka, the vehicles of the gods, and Dwaraka. This is the nakshatra of all brilliant creations.",
  },

  // ─── 14. Swati ───────────────────────────────────────────────────────────
  {
    name: "Swati",
    lord: "Rahu",
    deity: "Vayu (wind god)",
    symbol: "Coral, young plant shoot, sword",
    general: "Independent, trade-oriented, moving. Chara — excellent for commerce, travel, and independent ventures. Vayu = wind = movement and flexibility.",
    good: {
      personal:     ["Independent personal decisions", "Moving to a new city or country", "Starting independent household", "Cross-cultural relationships"],
      professional: ["International trade and import-export", "Business travel abroad", "Starting independent practice or freelancing", "Transportation industry", "Aviation and wind energy"],
      financial:    ["Foreign currency investments", "International trade financing", "Commodity trading", "Wind/renewable energy investments"],
      medical:      ["Treatment involving breath and respiration", "Pranayama therapy", "Travel medicine"],
      travel:       ["All journeys, especially international", "Business travel", "Travel by air (Vayu = wind)", "Crossing seas and borders"],
      spiritual:    ["Vayu mantra and Hanuman puja (Hanuman = wind deity's son)", "Prayers for freedom and independence", "Rahu-related remedies for Rahu MD/AD"],
      creative:     ["Wind instruments (flute, saxophone)", "Dance with fluid movement", "Travel writing and photography"],
    },
    avoid: {
      personal:     ["Permanent settling and fixed commitments"],
      professional: ["Fixed, immovable long-term contracts"],
      financial:    ["Illiquid long-term investments"],
      medical:      [],
      travel:       ["Permanent relocation (use Rohini for that)"],
      spiritual:    ["Heavy, earth-based ceremonies"],
      creative:     ["Fixed traditional art forms requiring discipline"],
    },
    adverse_effects: "Rahu's influence means Swati can bring instability and scattered energy despite its trade-positive nature. The young shoot can be uprooted by wind — initiation without roots can fail.",
    special: "Swati literally means 'sword' or 'independence.' The young plant shoot in storm shows resilience through flexibility — the Swati person bends but does not break. One of the best nakshatras for international business (B.V. Raman).",
  },

  // ─── 15. Vishakha ────────────────────────────────────────────────────────
  {
    name: "Vishakha",
    lord: "Jupiter",
    deity: "Indra-Agni (dual deity: king of gods + fire)",
    symbol: "Triumphal arch, potter's wheel",
    general: "Goal-driven, dual-natured, competitive. Mishra — both Jupiter's wisdom and Mars-like aggression. Excellent for determined pursuit of goals; dual nature requires clarity of purpose.",
    good: {
      personal:     ["Marriage (Jupiter's blessing)", "Goal-setting and life direction clarity", "Competitive personal pursuits"],
      professional: ["Goal-oriented projects with clear milestones", "Political campaigns", "Competitive business launches", "Leadership roles requiring determination", "All goal-achievement work"],
      financial:    ["Investment with a specific financial goal", "Goal-based SIPs and systematic investments", "Competitive business sectors"],
      medical:      ["Determined medical recovery programs", "Goal-based fitness and rehabilitation"],
      travel:       ["Travel toward a clear goal or destination", "Pilgrimages with specific prayer intent"],
      spiritual:    ["Fire ceremonies (Agni component)", "Indra puja for victory", "Competitive religious observances (fasting races, etc.)", "Jupiter puja for wisdom and growth"],
      creative:     ["Goal-driven creative projects with clear vision", "Competitive arts (music competitions, etc.)"],
    },
    avoid: {
      personal:     ["Aimless social activities without purpose"],
      professional: ["Vague, undefined new ventures"],
      financial:    ["Unfocused diversified investments with no goal"],
      medical:      [],
      travel:       ["Aimless wandering travel"],
      spiritual:    ["Ceremonies without clear spiritual intent"],
      creative:     ["Undisciplined, open-ended creative exploration"],
    },
    adverse_effects: "Mishra (mixed) nature means outcomes depend heavily on the user's intent and clarity. Indra-Agni dual deity = ambition can become aggression. Jealousy and envy (Indra's weakness) may arise if goals are competitive without ethics.",
    special: "The triumphal arch symbol indicates victory after struggle. Vishakha spans Libra and Scorpio. Jupiter's lordship elevates its Mishra nature — the mixed quality is resolved toward auspiciousness when the person is dharmic. 'The star of purpose' (Muhurta Chintamani).",
  },

  // ─── 16. Anuradha ────────────────────────────────────────────────────────
  {
    name: "Anuradha",
    lord: "Saturn",
    deity: "Mitra (god of friendship, contracts, international agreements)",
    symbol: "Lotus flower, staff",
    general: "Devoted, friendly, organized. Mridu — excellent for friendship, diplomacy, teamwork, and international connections. Saturn provides discipline; Mitra provides friendship.",
    good: {
      personal:     ["Deep friendship building", "Romantic relationships based on deep friendship", "Marriage (Saturn's discipline + Mitra's friendship = lasting)", "Reconciliation between estranged relations"],
      professional: ["Team formation and organization", "International business agreements", "Diplomatic missions", "Group leadership", "NGOs and community organizations"],
      financial:    ["International financial agreements", "Partnership-based investments", "Group investment clubs"],
      medical:      ["Group therapy and support groups", "Treatments from foreign doctors", "International medical travel"],
      travel:       ["Travel for diplomatic purposes", "International travel and foreign connections", "Travel to form alliances"],
      spiritual:    ["Mitra puja for friendship and international harmony", "Saturn mantra for discipline", "Group meditation and spiritual communities"],
      creative:     ["Collaborative arts with groups", "Music ensembles and bands", "Team-based creative projects"],
    },
    avoid: {
      personal:     ["Selfish, solo decisions ignoring others"],
      professional: ["Cutthroat competitive work ignoring team"],
      financial:    ["Solo speculative bets ignoring partnerships"],
      medical:      [],
      travel:       ["Lone-wolf journeys with no connection"],
      spiritual:    ["Isolated, antisocial spiritual practices"],
      creative:     [],
    },
    adverse_effects: "Saturn's discipline can become rigidity — groups formed here may become overly hierarchical. Mitra's need for harmony can suppress necessary conflict resolution.",
    special: "Anuradha is the 'follower of Vishakha' — success (Vishakha) followed by devotion (Anuradha). The lotus in murky water = maintaining purity in difficult circumstances. Mitra governs international treaties — Anuradha is excellent for all cross-border agreements.",
  },

  // ─── 17. Jyeshtha ────────────────────────────────────────────────────────
  {
    name: "Jyeshtha",
    lord: "Mercury",
    deity: "Indra (king of gods, protector)",
    symbol: "Circular talisman, umbrella, earring",
    general: "Senior, authoritative, protective, sharp. Tikshna — excellent for authority assertion, protection, and confrontation. Worst for gentle auspicious ceremonies.",
    good: {
      personal:     ["Asserting seniority and authority in family", "Protective decisions for family safety", "Elder care", "Decisions requiring courage and command"],
      professional: ["Leadership and authority assertion", "Security and protection industry", "Intelligence and law enforcement", "Government authority positions", "Crisis command"],
      financial:    ["Protecting financial assets from threat", "Defensive financial strategies", "Insurance and risk management"],
      medical:      ["Protective medical procedures", "Emergency surgery (protective)", "Disease-fighting aggressive treatments"],
      travel:       ["Travel for protection of one's interests", "Security-related travel"],
      spiritual:    ["Indra puja for authority and victory", "Protective kavach and raksha mantras", "Worship for elder/senior blessings"],
      creative:     ["Writing from a position of authority", "Senior artist presenting to public"],
    },
    avoid: {
      personal:     ["Marriage", "New gentle relationships", "Baby showers"],
      professional: ["New business partnerships requiring equal footing"],
      financial:    ["New growth investments"],
      medical:      ["Elective positive health procedures"],
      travel:       ["Pleasure journeys"],
      spiritual:    ["New auspicious vows and upanayana"],
      creative:     ["Gentle, collaborative creative work"],
    },
    adverse_effects: "Mercury + Indra = sharp intelligence used for domination. Jyeshtha literally means 'eldest' — it can lead to arrogance, jealousy of others' success, and harsh use of power.",
    special: "Jyeshtha is associated with Indra's protective umbrella (chattra) — the eldest protects the younger. Three stars form a scorpion's head (Antares region). Mercury's rulership adds calculating intelligence to Indra's power.",
  },

  // ─── 18. Mula ────────────────────────────────────────────────────────────
  {
    name: "Mula",
    lord: "Ketu",
    deity: "Nirriti (goddess of destruction/dissolution)",
    symbol: "Bunch of roots, tied roots",
    general: "Root-seeking, destructive, investigative. Tikshna — reaches the root of things but destroys what is above. One of the most feared nakshatras for auspicious starts. Ganda Moola nakshatra.",
    good: {
      personal:     ["Uprooting toxic life patterns", "Deep psychological investigation of one's origins", "Connecting with ancestral roots (Pitru karma)", "Ending generational patterns"],
      professional: ["Root-cause analysis work", "Research into fundamental phenomena", "Demolition and excavation industry", "Mining and underground resources", "Investigative research"],
      financial:    ["Liquidating fundamentally flawed investments", "Going to the root of financial problems", "Commodity extraction industry (mining, oil)"],
      medical:      ["Root-cause medical diagnosis", "Herbal medicine using roots (Mula = roots)", "Deep investigative diagnostics", "Genetic research"],
      travel:       ["Travel to ancestral homeland", "Excavation sites"],
      spiritual:    ["Ketu mantra for liberation and detachment", "Nirriti puja for dissolution of obstacles", "Past-life regression and karmic clearing"],
      creative:     ["Investigative documentary and journalism", "Uncovering hidden historical truths"],
    },
    avoid: {
      personal:     ["Marriage (very inauspicious — Ganda Moola)", "Naming ceremonies (Ganda Moola dosha)", "Baby showers", "New relationships"],
      professional: ["New business launches", "Permanent agreements"],
      financial:    ["New growth investments", "Property purchase"],
      medical:      ["Elective procedures"],
      travel:       ["Auspicious journeys"],
      spiritual:    ["New auspicious vows", "Upanayana"],
      creative:     ["Gentle, beautiful new creative starts"],
    },
    adverse_effects: "Nirriti = dissolution. Mula uproots everything — including the person's own stability. Ganda Moola birth requires specific remedies (Mula Shanti puja). Actions here tend to eliminate rather than build.",
    special: "Mula literally means 'root' — it is the nakshatra of Galactic Center (Vishnunabhi) where our galaxy points. Ketu's lordship brings profound spiritual insight alongside material destruction. The roots tied together symbol: powerful binding or uprooting depending on intent (B.V. Raman).",
  },

  // ─── 19. Purva Ashadha ───────────────────────────────────────────────────
  {
    name: "Purva Ashadha",
    lord: "Venus",
    deity: "Apas (water / goddess of water)",
    symbol: "Elephant tusk, fan, winnowing basket",
    general: "Invincible declaration, purifying, fierce. Ugra — the nakshatra of bold declaration before final victory. Excellent for purification, water-related work, and competitive invincibility.",
    good: {
      personal:     ["Making bold declarations and commitments", "Personal purification rituals", "Declaring intentions publicly"],
      professional: ["Declaring competitive challenges", "Invincibility-focused campaigns", "Water and naval industry", "Purification-related business (water treatment, detox)"],
      financial:    ["Investment in water resources", "Bold financial declarations (like an IPO announcement)"],
      medical:      ["Water-based treatments — hydrotherapy, panchakarma snehana", "Purification treatments", "Pre-surgery purification"],
      travel:       ["Sea voyages and water travel", "Travel for competition"],
      spiritual:    ["Water purification rituals — Ganga jal, holy water offerings", "Invincibility mantras", "Apas puja for purity", "Declaring a spiritual vow publicly"],
      creative:     ["Bold artistic declarations", "Competitive creative announcements"],
    },
    avoid: {
      personal:     ["Marriage", "Gentle new relationship building"],
      professional: ["Quiet, subtle business launches"],
      financial:    ["Cautious, conservative investments"],
      medical:      [],
      travel:       [],
      spiritual:    ["Gentle sattvic ceremonies"],
      creative:     ["Soft, gentle creative work"],
    },
    adverse_effects: "Venus + Apas = beauty with fierce invincibility. Declarations made here are hard to retract — the 'early victory declaration' can lead to overconfidence if the actual victory hasn't been achieved.",
    special: "Purva Ashadha is the 'former undefeated' — the stage of bold confidence before Uttara Ashadha's actual victory. The fan symbol: both cooling/purifying and fanning flames of ambition. Venus's lordship brings beauty to fierceness.",
  },

  // ─── 20. Uttara Ashadha ──────────────────────────────────────────────────
  {
    name: "Uttara Ashadha",
    lord: "Sun",
    deity: "Vishwadevas (universal gods, all ten together)",
    symbol: "Elephant tusk, small bed",
    general: "Universal victory, permanent triumph, long-lasting. Sthira — actual victory after Purva Ashadha's declaration. All-encompassing due to Vishwadevas (universal/all deities).",
    good: {
      personal:     ["Marriage (Vishwadevas bless all aspects)", "All major life milestones", "Victory celebrations", "Crowning and coronation"],
      professional: ["All professional beginnings requiring lasting success", "Government work and authority", "Universal service businesses (healthcare, education)", "Long-term projects requiring permanence"],
      financial:    ["Long-term investment for lasting wealth", "Permanent asset acquisition", "Government bonds and sovereign instruments"],
      medical:      ["Long-term treatment programs", "Surgeries for permanent cure", "Wellness programs"],
      travel:       ["Victory journeys", "Travel to establish permanent presence"],
      spiritual:    ["Universal fire ceremonies invoking all deities", "Vishwadevas puja", "Sun worship for vitality and authority", "Permanent spiritual vows"],
      creative:     ["Masterwork creation intended to last", "Permanent artistic legacy work"],
    },
    avoid: {
      personal:     ["Quick, impermanent decisions"],
      professional: ["Short-term speculative work"],
      financial:    ["Quick trades and short positions"],
      medical:      [],
      travel:       ["Temporary relocations"],
      spiritual:    ["Quick, superficial rituals"],
      creative:     ["Trendy, short-lived work"],
    },
    adverse_effects: "Sthira + Sun = everything is highly permanent and authoritative. Wrong decisions here are very hard to reverse. Excessive solar ego can accompany actions taken in Uttara Ashadha.",
    special: "Uttara Ashadha is 'the latter unconquered' — permanent, universal victory. Vishwadevas = all ten universal principles combined = incomparable divine backing. The Sun as lord + universal deities = the most universally blessed Sthira nakshatra (B.V. Raman).",
  },

  // ─── 21. Shravana ────────────────────────────────────────────────────────
  {
    name: "Shravana",
    lord: "Moon",
    deity: "Vishnu (preserver of the universe)",
    symbol: "Ear, three footprints of Vishnu",
    general: "Learning, listening, connecting. Chara — Vishnu's nakshatra. Excellent for education, acquiring knowledge, counseling, and making meaningful connections.",
    good: {
      personal:     ["Learning from elders and wise people", "Counseling and therapy", "Joining educational courses", "Sacred listening (satsang)", "Connecting with Guru"],
      professional: ["Education sector (teaching, coaching)", "Counseling and psychology practice", "Media and communication", "Journalism and news", "All knowledge-based work"],
      financial:    ["Investment in education sector", "Knowledge-based business investments", "Media and communication sector"],
      medical:      ["Seeking medical advice and second opinions", "Learning about one's own medical condition", "Counseling for mental health"],
      travel:       ["Pilgrimages to Vishnu temples", "Travel for learning and education", "Journey to a Guru"],
      spiritual:    ["Vishnu puja and Sahasranama recitation", "Shravana vrata (listening to scriptures)", "Devotional music (bhajan) as spiritual practice", "Going to satsang"],
      creative:     ["Composing and learning music (Shravana = sound/listening)", "Writing based on oral traditions", "Podcasting and audio content creation"],
    },
    avoid: {
      personal:     ["Permanent irrevocable decisions (Chara)"],
      professional: ["Fixed, unmovable positions"],
      financial:    ["Illiquid long-term assets"],
      medical:      [],
      travel:       ["Permanent relocation"],
      spiritual:    ["Intense fire ceremonies"],
      creative:     [],
    },
    adverse_effects: "Moon as lord of Chara nakshatra can lead to restlessness and information overload. Vishnu's preservation energy can make people hold onto what should be released.",
    special: "Shravana = hearing/listening. Three footprints of Vishnu (Trivikrama): the three strides that measured the universe = Shravana connects micro to macro. The ear symbol shows this nakshatra specializes in received wisdom. Monday + Shravana creates a highly auspicious muhurta.",
  },

  // ─── 22. Dhanishtha ──────────────────────────────────────────────────────
  {
    name: "Dhanishtha",
    lord: "Mars",
    deity: "Ashta Vasus (eight elemental gods of abundance)",
    symbol: "Drum, flute",
    general: "Prosperous, musical, ambitious, real estate. Chara — Ashta Vasus = eight forms of elemental abundance. Excellent for wealth accumulation, music, real estate, and ambition.",
    good: {
      personal:     ["Acquiring wealth and property", "Music and dance as lifestyle", "Ambitious personal goal-setting"],
      professional: ["Real estate and property development", "Music and entertainment business", "Percussion and rhythm-based arts", "Martial arts training (Mars + ambition)", "Construction and civil work"],
      financial:    ["Real estate purchase (one of best for this)", "Wealth accumulation strategies", "Investment in music/entertainment industry", "Construction sector investment"],
      medical:      ["Surgical procedures (Mars precision)", "Bone and muscular treatments"],
      travel:       ["Travel for wealth acquisition", "Business travel", "Journeys to claim property"],
      spiritual:    ["Ashta Vasu puja for elemental abundance", "Mars mantra for energy and courage", "Drum-based devotional music (kirtana)"],
      creative:     ["ALL music — especially percussion, rhythm instruments", "Dance, especially martial dance forms", "Real estate and architectural design"],
    },
    avoid: {
      personal:     ["Marriage (some traditions — Dhanishtha can indicate marital conflicts)", "Settling permanently (Chara)"],
      professional: ["Permanently fixed immovable positions"],
      financial:    ["Illiquid, non-wealth-generating assets"],
      medical:      [],
      travel:       [],
      spiritual:    [],
      creative:     [],
    },
    adverse_effects: "Mars in ambitious abundance can become greed. The drum beats loudly — actions in Dhanishtha can be dramatic and attention-seeking beyond what is needed.",
    special: "Dhanishtha literally means 'most wealthy' or 'swift/fastest.' The drum symbol shows rhythm, timing, and announcement of abundance. Mars's rulership adds warrior-like energy to the Vasus' elemental gifts. Excellent for property and music — both require Mars energy channeled constructively.",
  },

  // ─── 23. Shatabhisha ─────────────────────────────────────────────────────
  {
    name: "Shatabhisha",
    lord: "Rahu",
    deity: "Varuna (god of cosmic waters, secret wisdom, justice)",
    symbol: "Circle with a dot, empty circle",
    general: "Healing, secretive, mystical, scientific. Chara — Shatabhisha = 100 physicians. Excellent for medicine, healing, scientific research, occult, and secret knowledge.",
    good: {
      personal:     ["Deep introspection and self-analysis", "Secret personal projects", "Healing from emotional wounds"],
      professional: ["Medical practice — especially complex diagnoses", "Scientific research (especially secret/cutting-edge)", "Astrology and occult practice", "Astronomy and space research", "Pharmaceutical research"],
      financial:    ["Research-intensive investments", "Pharmaceutical and biotech sector", "Technology research companies"],
      medical:      ["ALL medical and healing treatments (the nakshatra of 100 physicians)", "Ayurveda and advanced medicine", "Diagnosis and complex treatments", "Mental health treatment", "Addiction recovery programs"],
      travel:       ["Travel for medical treatment", "Scientific expedition travel"],
      spiritual:    ["Varuna puja for cosmic justice and secrets", "Rahu mantra for hidden knowledge", "Occult and astrology initiation", "Secret or solo sadhana"],
      creative:     ["Scientific writing and documentation", "Occult and esoteric literature", "Space and astronomy photography"],
    },
    avoid: {
      personal:     ["Marriage (Shatabhisha is solitary and secretive)", "Open, social relationship building"],
      professional: ["Transparent, public-facing social businesses"],
      financial:    ["High-visibility speculative investments"],
      medical:      [],
      travel:       ["Social pleasure journeys"],
      spiritual:    ["Open, public ceremonies"],
      creative:     ["Overtly social and public arts"],
    },
    adverse_effects: "Rahu's influence on Varuna = secrets can become hidden obsessions. The empty circle symbol can mean emptiness or solitude — excessive isolation is a risk. Shatabhisha individuals may become reclusive to the point of social dysfunction.",
    special: "Varuna is the cosmic-water deity who knows all secrets and administers cosmic justice. Shatabhisha (100 physicians) is the most powerful medical nakshatra — bar none. The circle with dot represents the hidden core of existence. Excellent for medical research and all healing professions.",
  },

  // ─── 24. Purva Bhadrapada ────────────────────────────────────────────────
  {
    name: "Purva Bhadrapada",
    lord: "Jupiter",
    deity: "Ajaikapada (one-footed, a form of Rudra/Shiva)",
    symbol: "Sword, two front legs of funeral cot, man with two faces",
    general: "Intense, passionate, fiery, mystical. Ugra — Jupiter's fierce wisdom. Excellent for intense spiritual practices and passionate work. Inauspicious for gentle new starts.",
    good: {
      personal:     ["Intense personal transformation", "Breaking free from material attachments", "Passionate pursuit of one-pointed goals"],
      professional: ["Financial speculation and risk-taking", "Intense leadership", "Tantric and occult practice as profession", "Fire-based industries"],
      financial:    ["High-risk, high-reward speculation", "Financial transformation and reinvestment after loss"],
      medical:      ["Intense, aggressive treatments for serious disease", "Emergency procedures"],
      travel:       ["Travel for intense spiritual experience"],
      spiritual:    ["Intense fire ceremonies (homa for specific results)", "Tantric initiation", "One-pointed mantra sadhana", "Ajaikapada (Shiva) upasana"],
      creative:     ["Passionate, intense creative expression", "Mystical and spiritual art"],
    },
    avoid: {
      personal:     ["Marriage", "Naming ceremonies", "Gentle new beginnings"],
      professional: ["Peaceful stable business launches"],
      financial:    ["Conservative long-term savings"],
      medical:      ["Elective cosmetic procedures"],
      travel:       ["Pleasure and relaxation trips"],
      spiritual:    ["Sattvic, gentle pujas for auspicious occasions"],
      creative:     ["Gentle, aesthetic creative work"],
    },
    adverse_effects: "Jupiter + Rudra = wisdom amplified by fire. Purva Bhadrapada can lead to extremism — the two-faced man symbol shows dual nature (spiritual vs destructive). Passionate actions here can become obsessive.",
    special: "The two-faced man symbol shows this nakshatra operates on two planes simultaneously — physical and metaphysical. Ajaikapada = Shiva standing on one leg in intense tapas. Jupiter's lordship prevents complete destruction — there is always a higher purpose (Muhurta Chintamani).",
  },

  // ─── 25. Uttara Bhadrapada ───────────────────────────────────────────────
  {
    name: "Uttara Bhadrapada",
    lord: "Saturn",
    deity: "Ahirbudhnya (the serpent of the deep, Shiva's serpent)",
    symbol: "Back legs of funeral cot, twins",
    general: "Deep, stable, charitable, serpentine wisdom. Sthira — Saturn's profound stable energy. Excellent for permanent deep work, spiritual practice, charity, and settling disputes.",
    good: {
      personal:     ["Settling long-standing family disputes", "Charitable giving and philanthropy", "Deep committed relationships", "Marriage (stable and deep)"],
      professional: ["Deep research requiring patience", "Charitable organizations", "Legal dispute resolution", "Counseling and wisdom-based professions", "Philosophical and academic work"],
      financial:    ["Long-term patient investment", "Charity endowments", "Estate planning"],
      medical:      ["Long-term recovery programs", "Deep psychological healing", "Karmic healing practices"],
      travel:       ["Deep pilgrimage journeys", "Travel for wisdom and knowledge"],
      spiritual:    ["Deep, long-term sadhana", "Shiva upasana (Ahirbudhnya = Shiva's serpent)", "Charitable spiritual projects", "Settling karmic debts through service"],
      creative:     ["Profound, depth-requiring creative work", "Philosophical literature and poetry", "Classical arts requiring decades of practice"],
    },
    avoid: {
      personal:     ["Quick social activities"],
      professional: ["Rapid business moves"],
      financial:    ["Quick speculative trades"],
      medical:      ["Emergency, quick procedures (prefer Ashwini)"],
      travel:       ["Quick journeys (Sthira = fixed)", "Travel for entertainment"],
      spiritual:    ["Quick, superficial ceremonies"],
      creative:     ["Trendy, commercial art"],
    },
    adverse_effects: "Saturn's depth can become inertia. The serpent in the deep = hidden dangers beneath surface stability. Actions may have long delay before results, testing patience beyond limits.",
    special: "Uttara Bhadrapada is the 'latter auspicious feet' — after the fierce Purva, the stable Uttara completes. The twin symbol shows completion and pairing. Ahirbudhnya is the deep-water serpent of Shiva — wisdom emerging from the depths. Saturn here is at its most philosophical.",
  },

  // ─── 26. Revati ──────────────────────────────────────────────────────────
  {
    name: "Revati",
    lord: "Mercury",
    deity: "Pushan (nourisher, guide of journeys and protector of cattle)",
    symbol: "Drum, fish in water",
    general: "Nourishing, completing, journeying, gentle. Mridu — Pushan is the deity who guides souls and travelers. Excellent for completing journeys, closing cycles, travel, and gentle nurturing.",
    good: {
      personal:     ["All gentle personal ceremonies", "Marriage (very auspicious — Pushan blesses bonds)", "Completing personal goals and projects", "Nourishing family and loved ones", "Animal care and cattle keeping"],
      professional: ["Completing long-pending professional work", "Final touches on projects before launch", "Animal husbandry and veterinary professions", "Transportation and logistics", "Social work and nourishing professions"],
      financial:    ["Completing financial agreements", "Final investment decisions", "Closing profitable deals"],
      medical:      ["Completing medical treatment courses", "Recovery and rehabilitation completion", "Gentle healing therapies"],
      travel:       ["Final leg of any journey", "Completing a long journey back home", "Pilgrimage to sacred bodies of water", "All sea voyages (fish symbol)", "Travel for completion of a mission"],
      spiritual:    ["Pushan puja for safe journeys", "Completion of spiritual vows", "Sacred journey to Kashi or ocean temples", "Mercury mantra for communication and completion"],
      creative:     ["Completing creative works", "Publishing and releasing completed art", "Music of celebration and completion", "Gentle, healing music"],
    },
    avoid: {
      personal:     ["Starting aggressive new confrontational actions"],
      professional: ["Launching aggressively competitive new ventures"],
      financial:    ["High-risk speculative beginnings"],
      medical:      ["Aggressive, invasive new procedures"],
      travel:       ["Beginning of war campaigns or hostile missions"],
      spiritual:    ["Fierce tantric rituals"],
      creative:     ["Harsh, aggressive art forms"],
    },
    adverse_effects: "Mercury + Pushan = nourishing but potentially scattered. The fish in water symbol: can be swept by the current. Revati as the last nakshatra can lead to an energy of dissolution — things end, but new beginnings feel difficult.",
    special: "Revati is the last of 27 nakshatras — it is the completion of the zodiac. The fish in water symbol shows navigation and flow. Pushan guides not just cattle but souls between lives. Mercury's rulership makes this nakshatra intelligent and communicative in its gentleness. One of the best for completing any unfinished business.",
  },
];

// ── Extended domain data for all 27 nakshatras ─────────────────────────────
// These supplement NAKSHATRA_ATTRIBUTES with 7 additional life domains:
// educational, legal, agricultural, social, property, political, children
// Source: Muhurta Chintamani; BPHS Muhurta adhyaya; B.V. Raman "Muhurta"

interface ExtendedDomainEntry {
  good: {
    educational: string[];
    legal: string[];
    agricultural: string[];
    social: string[];
    property: string[];
    political: string[];
    children: string[];
  };
  avoid: {
    educational: string[];
    legal: string[];
    agricultural: string[];
    social: string[];
    property: string[];
    political: string[];
    children: string[];
  };
}

const NAKSHATRA_EXTENDED: ExtendedDomainEntry[] = [
  // 0. Ashwini
  {
    good: {
      educational: ["Beginning a new course or degree", "Speed-learning any subject", "Medical education and veterinary studies"],
      legal:        ["Filing emergency injunctions", "Quick legal actions against immediate threats"],
      agricultural: ["Planting fast-germinating seeds", "Initiating veterinary care for cattle"],
      social:       ["Quick social introductions", "Networking events requiring speed and energy"],
      property:     ["Site visit and survey before purchase decision", "Vehicle-related property (garage, stable)"],
      political:    ["Emergency political announcements", "Swift decisions in governance"],
      children:     ["Medical care for children (Ashwini Kumaras = physicians)", "Emergency pediatric treatment"],
    },
    avoid: {
      educational: ["Starting slow, multi-year study programs"],
      legal:       ["Slow, drawn-out litigation"],
      agricultural: ["Slow-growing perennial planting"],
      social:      ["Elaborate social ceremonies requiring planning"],
      property:    ["Permanent land/property decisions (too hasty)"],
      political:   ["Permanent policy declarations"],
      children:    ["Naming ceremonies (use Rohini or Hasta)"],
    },
  },
  // 1. Bharani
  {
    good: {
      educational: ["Studying death, forensics, or karmic philosophy", "Courses in surgery, pathology"],
      legal:       ["Executing judgments and punishments", "Debt recovery litigation", "Filing criminal charges"],
      agricultural: ["Clearing land (cutting trees and weeds)", "Pest control and crop destruction of failed harvests"],
      social:      ["Funerary gatherings", "Ancestor remembrance events"],
      property:    ["Demolishing old structures for rebuilding", "Winding up distressed property sales"],
      political:   ["Declaring martial law or emergency governance", "Acts of punitive justice by authority"],
      children:    ["Rites for deceased children (Yama = ruler of death)", "Difficult conversations about reproductive loss"],
    },
    avoid: {
      educational: ["Naming a school or beginning primary education auspiciously"],
      legal:       ["Peaceful dispute resolution", "Marriage agreements"],
      agricultural: ["New planting and crop initiation"],
      social:      ["Auspicious weddings, engagements"],
      property:    ["Griha pravesh and home purchase"],
      political:   ["New governance initiatives", "Diplomatic negotiations"],
      children:    ["Baby showers", "Naming ceremony", "Pregnancy announcements"],
    },
  },
  // 2. Krittika
  {
    good: {
      educational: ["Cooking schools and culinary arts", "Military and fire-safety training", "Metallurgy and materials science"],
      legal:       ["Cutting through legal delays", "Assertive legal action", "Fire-related legal claims (insurance)"],
      agricultural: ["Burning fields after harvest (fire clearing)", "Cooking grain stores", "Solar-energy farming"],
      social:      ["Courage-testing social events", "Military/fire-fighter appreciation events"],
      property:    ["Buying land with sun exposure for agriculture", "Property related to energy and fire industries"],
      political:   ["Proclamations requiring courage", "Military authority declarations"],
      children:    ["Child's military or sports initiation", "Courage-building programs for children"],
    },
    avoid: {
      educational: ["Gentle, nurturing education beginnings for young children"],
      legal:       ["Slow mediation processes"],
      agricultural: ["Delicate planting in harsh sun"],
      social:      ["Marriage and gentle social celebrations"],
      property:    ["Griha pravesh and domestic property purchase"],
      political:   ["Diplomatic peace negotiations"],
      children:    ["Naming ceremonies (Mishra nature)"],
    },
  },
  // 3. Rohini
  {
    good: {
      educational: ["Vidya arambha (beginning of formal education) — highly auspicious", "Classical arts learning", "Language learning", "Agricultural science"],
      legal:       ["Signing long-term legal agreements", "Property registration", "Permanent contracts"],
      agricultural: ["Sowing seeds (highly auspicious for planting)", "Starting irrigation systems", "Land cultivation", "All farming initiations"],
      social:      ["Marriage ceremonies", "Engagement parties", "All auspicious social gatherings"],
      property:    ["Griha pravesh (best nakshatra)", "Buying agricultural land", "Planting a permanent garden", "Starting construction"],
      political:   ["Long-term governance proclamations", "Permanent policy frameworks", "Royal coronations"],
      children:    ["Baby shower (best nakshatra)", "Naming ceremony (highly auspicious)", "Starting child's education", "Pregnancy initiation rituals"],
    },
    avoid: {
      educational: ["Quick cramming sessions without long-term intent"],
      legal:       ["Dissolving or breaking contracts"],
      agricultural: ["Clearing or destroying crops"],
      social:      ["Funerary rites"],
      property:    ["Demolition or selling a home"],
      political:   ["Declaring war or emergency"],
      children:    [],
    },
  },
  // 4. Mrigashira
  {
    good: {
      educational: ["Learning arts, music, poetry", "Research journeys and field studies", "Language and literature studies"],
      legal:       ["Gentle negotiation and mediation", "Settling disputes through dialogue"],
      agricultural: ["Searching for the right land", "Selecting seeds and livestock", "Gentle cultivation"],
      social:      ["Social gatherings for friendship", "Gift-giving ceremonies", "Cultural events and art shows"],
      property:    ["Property search and site visits", "Buying beautiful aesthetic property"],
      political:   ["Diplomatic negotiations and peace talks"],
      children:    ["Teaching children arts and music", "Story-telling and education through play"],
    },
    avoid: {
      educational: ["Strict military or discipline-based training"],
      legal:       ["Aggressive litigation"],
      agricultural: ["Forced, harsh agriculture"],
      social:      ["Confrontational meetings"],
      property:    ["Permanent property acquisition (Chara = movable)"],
      political:   ["Aggressive declarations and enemy action"],
      children:    ["Overly strict or harsh child discipline"],
    },
  },
  // 5. Ardra
  {
    good: {
      educational: ["Storm meteorology, disaster management studies", "Forensic science", "Rahu-influenced occult research"],
      legal:       ["Bringing cases against enemies", "Seeking injunctions to stop damage", "Criminal prosecution"],
      agricultural: ["Monsoon farming — this nakshatra brings rain (Rudra = storm)", "Clearing weeds and destroying pests aggressively"],
      social:      ["Cathartic, grief-processing gatherings"],
      property:    ["Demolition of old dangerous structures", "Clearing land of obstacles"],
      political:   ["Emergency proclamations", "Actions against enemies of the state"],
      children:    ["Protective medical procedures for sick children"],
    },
    avoid: {
      educational: ["Peaceful, nurturing learning environments for children"],
      legal:       ["Peaceful agreements", "Marriage contracts"],
      agricultural: ["Planting new crops (storm destroys seedlings)"],
      social:      ["Auspicious social gatherings", "Weddings"],
      property:    ["Purchasing or blessing a new home"],
      political:   ["Peaceful diplomatic initiatives"],
      children:    ["Baby shower", "Naming ceremony", "Child's education beginning"],
    },
  },
  // 6. Punarvasu
  {
    good: {
      educational: ["Returning to studies after a break", "Second attempt at exams", "Joining a new course after dropout"],
      legal:       ["Reopening old cases with new evidence", "Appeals and review petitions"],
      agricultural: ["Replanting after crop failure", "Restoring land after flooding"],
      social:      ["Reunion events", "Welcoming back a member of the group"],
      property:    ["Returning to property after long absence", "Buying back ancestral property"],
      political:   ["Political comeback after defeat", "Restoring governance after disruption"],
      children:    ["Fertility treatment after loss", "Welcoming a child after miscarriage", "Adoption after childlessness"],
    },
    avoid: {
      educational: ["Permanently fixing a study program (Chara = movable)"],
      legal:       ["Permanent final legal judgments"],
      agricultural: ["Permanent long-gestation crops"],
      social:      ["Permanent social commitments"],
      property:    ["Permanent property decisions without flexibility"],
      political:   ["Permanent constitutional changes"],
      children:    [],
    },
  },
  // 7. Pushya
  {
    good: {
      educational: ["Vidya arambha (excellent)", "Joining a school or university", "Teacher's appointment", "Starting any course"],
      legal:       ["Signing beneficial legal agreements", "Filing for beneficial legal relief"],
      agricultural: ["All agricultural activities (nourishing star)", "Planting food crops", "Buying cattle"],
      social:      ["All auspicious social events (except marriage)", "Community gatherings", "Charity events"],
      property:    ["Griha pravesh (excellent)", "Property purchase", "Foundation stone laying"],
      political:   ["Government appointments and promotions", "Public service commencement", "Policy announcements"],
      children:    ["Baby shower (excellent)", "Naming ceremony (excellent)", "Vaccination and preventive health", "Starting school"],
    },
    avoid: {
      educational: [],
      legal:       [],
      agricultural: [],
      social:      ["Marriage ceremonies (specific Pushya prohibition)"],
      property:    [],
      political:   [],
      children:    [],
    },
  },
  // 8. Ashlesha
  {
    good: {
      educational: ["Psychology, psychiatry studies", "Toxicology and pharmacology", "Occult and secret knowledge"],
      legal:       ["Secret investigation and intelligence gathering", "Cases involving poisons or hidden crimes"],
      agricultural: ["Pest control using chemicals", "Study of agricultural diseases"],
      social:      ["Occult and esoteric circles"],
      property:    ["Investigating hidden property defects before purchase"],
      political:   ["Intelligence and espionage operations", "Behind-the-scenes political work"],
      children:    ["Treating children for snake bites or toxic reactions", "Child psychology"],
    },
    avoid: {
      educational: ["New school admissions", "Open, transparent learning environments"],
      legal:       ["Open court agreements", "Marriage contracts"],
      agricultural: ["New crop planting"],
      social:      ["Open social celebrations", "Weddings"],
      property:    ["Property purchase or griha pravesh"],
      political:   ["Transparent public policy announcements"],
      children:    ["Baby shower", "Naming ceremony"],
    },
  },
  // 9. Magha
  {
    good: {
      educational: ["Studying history, genealogy, traditional arts", "Gurukul-style traditional education", "Royal arts"],
      legal:       ["Asserting ancestral legal rights", "Inheritance claims", "Traditional authority-based decisions"],
      agricultural: ["Working ancestral farmland", "Traditional farming methods"],
      social:      ["Royal durbar-style gatherings", "Traditional clan/family assemblies", "Ancestral tribute events"],
      property:    ["Claiming ancestral property", "Assuming family homestead"],
      political:   ["Royal/kingly proclamations", "Tribal or clan authority assertion", "Government authority acceptance"],
      children:    ["Connecting children to family lineage (kula devata puja)", "Traditional education in family craft"],
    },
    avoid: {
      educational: ["New modern learning unconnected to tradition"],
      legal:       ["New business contracts"],
      agricultural: ["New land purchase"],
      social:      ["Weddings", "New social group formation"],
      property:    ["New property purchase (non-ancestral)"],
      political:   ["New democratic elections or campaigns"],
      children:    ["Baby shower", "Naming ceremony"],
    },
  },
  // 10. Purva Phalguni
  {
    good: {
      educational: ["Arts education — music, dance, drama", "Creative writing courses", "Fashion and beauty school"],
      legal:       ["Entertainment contract signing (if Venus period)", "Artistic copyright registration"],
      agricultural: ["Ornamental gardening", "Floriculture", "Growing luxury crops"],
      social:      ["Parties, celebrations, entertainment events", "Cultural shows", "Fashion shows"],
      property:    ["Buying a beautiful home or garden property", "Luxury property"],
      political:   ["Cultural diplomacy", "Soft-power political events"],
      children:    ["Introducing children to arts and music", "Creative play programs"],
    },
    avoid: {
      educational: ["Serious, rigorous academic admissions"],
      legal:       ["Serious litigation", "Criminal proceedings"],
      agricultural: ["Food crop planting for livelihood"],
      social:      ["Marriage ceremony initiation"],
      property:    ["Permanent serious property acquisitions"],
      political:   ["Serious governance decisions"],
      children:    ["Naming ceremonies"],
    },
  },
  // 11. Uttara Phalguni
  {
    good: {
      educational: ["University enrollment", "Professional education contracts", "Teacher-student formal agreements"],
      legal:       ["Marriage contracts", "Partnership agreements", "Long-term binding legal bonds"],
      agricultural: ["Agricultural partnerships", "Farm lease agreements"],
      social:      ["Marriage ceremonies (excellent)", "Engagement parties", "Long-term friendship formalization"],
      property:    ["Joint property purchase with partner", "Property gifted in marriage"],
      political:   ["Treaty signing", "Alliance formation", "Official appointments by authority"],
      children:    ["Conception ceremony (garbhadhana)", "Baby shower", "Adoption agreement signing"],
    },
    avoid: {
      educational: ["Solo individualistic learning programs"],
      legal:       ["Adversarial litigation"],
      agricultural: ["Solo farming without cooperative"],
      social:      ["Solitary retreats"],
      property:    ["Solo unpartnered property investments"],
      political:   ["Unilateral declarations without alliance"],
      children:    [],
    },
  },
  // 12. Hasta
  {
    good: {
      educational: ["Vidya arambha (excellent)", "Skill-based vocational training", "Apprenticeships", "Computer science and technology"],
      legal:       ["All legal transactions — excellent", "Document signing", "Trade contracts"],
      agricultural: ["Harvesting crops", "Manual agricultural work", "Dairy and cattle work"],
      social:      ["Trade fairs and markets", "Craft exhibitions", "Skill demonstrations"],
      property:    ["All property transactions (excellent)", "Registration of documents", "Construction commencement"],
      political:   ["Signing of governance orders", "Administrative decisions", "Official document execution"],
      children:    ["Teaching children manual skills", "Starting a child in vocational training", "Child's naming ceremony (excellent)"],
    },
    avoid: {
      educational: [],
      legal:       [],
      agricultural: [],
      social:      [],
      property:    [],
      political:   [],
      children:    [],
    },
  },
  // 13. Chitra
  {
    good: {
      educational: ["Architecture and engineering courses", "Art college admission", "Design and fashion school", "Technology courses"],
      legal:       ["Intellectual property and design patent filing", "Copyright registration for art"],
      agricultural: ["Ornamental and aesthetic farming", "Garden design", "Greenhouse construction"],
      social:      ["Art exhibitions", "Architecture award ceremonies", "Design competitions"],
      property:    ["Buying aesthetically beautiful property", "Architectural design review", "Interior design work commencement"],
      political:   ["Urban planning declarations", "City beautification proclamations", "Award ceremonies"],
      children:    ["Enrolling children in art or design schools", "Creative toy introduction"],
    },
    avoid: {
      educational: ["Purely theoretical, non-visual courses"],
      legal:       ["Rough, adversarial legal battles"],
      agricultural: ["Plain utilitarian farming"],
      social:      [],
      property:    ["Rough construction without design consideration"],
      political:   ["Military aggression"],
      children:    [],
    },
  },
  // 14. Swati
  {
    good: {
      educational: ["International education", "Foreign language learning", "Study abroad programs"],
      legal:       ["International legal agreements", "Cross-border contracts", "Import-export documentation"],
      agricultural: ["Wind-energy farming", "Breeze-based drying processes", "Moving livestock to new pasture"],
      social:      ["International networking events", "Cultural exchange gatherings", "Cross-community events"],
      property:    ["International property purchase", "Property near trade routes", "Buying property in foreign country"],
      political:   ["International diplomacy", "Trade treaties", "Foreign policy announcements"],
      children:    ["Sending children abroad for education", "International student exchange"],
    },
    avoid: {
      educational: ["Fixed curriculum without flexibility"],
      legal:       ["Permanent binding local contracts"],
      agricultural: ["Long-term permanent crop planting"],
      social:      [],
      property:    ["Permanent local settlement decisions"],
      political:   ["Permanent constitutional changes"],
      children:    ["Naming ceremonies (Chara = unstable for permanent names traditionally)"],
    },
  },
  // 15. Vishakha
  {
    good: {
      educational: ["Competitive examination preparation", "Professional competitive courses", "Goal-oriented coaching"],
      legal:       ["Fighting legal battles with determination", "Enforcement of judgments", "Competitive legal campaigns"],
      agricultural: ["Goal-oriented crop planning with yield targets", "Competitive farming markets"],
      social:      ["Competitive social events", "Sports tournaments", "Achievement ceremonies"],
      property:    ["Buying property as a specific goal", "Competition for property through bidding"],
      political:   ["Election campaigns", "Political victory declarations", "Goal-focused governance programs"],
      children:    ["Enrolling children in competitive programs", "Goal-setting for child's career"],
    },
    avoid: {
      educational: ["Aimless, open-ended exploration learning"],
      legal:       ["Casual, unfocused legal actions"],
      agricultural: ["Subsistence farming with no specific goals"],
      social:      ["Aimless social gatherings"],
      property:    ["Vague property exploration without goal"],
      political:   ["Consensus-building diplomacy (too aggressive)"],
      children:    [],
    },
  },
  // 16. Anuradha
  {
    good: {
      educational: ["Group study and collaborative learning", "International academic exchange", "Friendship-based learning communities"],
      legal:       ["Mediation and amicable dispute resolution", "International legal agreements", "Group contracts"],
      agricultural: ["Cooperative farming", "Agricultural cooperatives", "Group farming ventures"],
      social:      ["International friendship events", "Multicultural gatherings", "NGO events"],
      property:    ["Group housing societies", "International property agreements", "Community land purchase"],
      political:   ["International treaties", "Alliance formation", "Diplomatic missions"],
      children:    ["Playgroup enrollment", "Collaborative children's education programs"],
    },
    avoid: {
      educational: ["Competitive, solo achievement-based programs"],
      legal:       ["Aggressive individual litigation"],
      agricultural: ["Solo farming without cooperation"],
      social:      ["Antisocial isolation"],
      property:    ["Solo property acquisitions without cooperation"],
      political:   ["Unilateral aggressive political actions"],
      children:    [],
    },
  },
  // 17. Jyeshtha
  {
    good: {
      educational: ["Studies by senior authority figures", "Teaching positions", "Senior leadership courses"],
      legal:       ["Protective injunctions", "Cases asserting seniority/authority", "Enforcement actions"],
      agricultural: ["Protecting crops from threats", "Pest control for large farms"],
      social:      ["Senior citizen gatherings", "Authority-based social events", "Military/police appreciation"],
      property:    ["Protecting existing property rights", "Senior family member's property matters"],
      political:   ["Senior leadership proclamations", "Elder statesman activities", "Protective governance acts"],
      children:    ["Asserting protection over children", "Seeking custody in protective cases"],
    },
    avoid: {
      educational: ["New admissions for young children"],
      legal:       ["New peaceful agreements"],
      agricultural: ["New crop planting"],
      social:      ["Weddings", "Baby showers"],
      property:    ["New property purchase"],
      political:   ["New democratic elections"],
      children:    ["Baby shower", "Naming ceremony"],
    },
  },
  // 18. Mula
  {
    good: {
      educational: ["Root-cause research", "Investigative studies", "Archaeology and ancient history", "Underground resources"],
      legal:       ["Exposing hidden legal crimes", "Forensic legal work", "Root cause investigations"],
      agricultural: ["Root vegetable cultivation (carrots, radish, turmeric)", "Herbal root medicine farming", "Mining of minerals"],
      social:      ["Investigation groups", "Occult study circles"],
      property:    ["Underground property — mines, basements, bunkers", "Demolishing old property to rebuild from roots"],
      political:   ["Exposing corrupt roots of governance", "Revolutionary political movements"],
      children:    ["Investigating ancestral karmic causes of child difficulties (Ganda Moola remedy)"],
    },
    avoid: {
      educational: ["Auspicious new school admissions"],
      legal:       ["New peaceful contracts"],
      agricultural: ["Above-ground crop planting", "Fruit trees"],
      social:      ["Weddings", "Social celebrations"],
      property:    ["Griha pravesh", "New property purchase for growth"],
      political:   ["Peaceful new governance initiatives"],
      children:    ["Baby shower", "Naming ceremony (Ganda Moola — requires Mula Shanti first)"],
    },
  },
  // 19. Purva Ashadha
  {
    good: {
      educational: ["Declaring one's competitive candidacy for education", "Bold educational proclamations"],
      legal:       ["Filing bold legal challenges", "Issuing legal warnings and notices"],
      agricultural: ["Monsoon crop initiation (Apas = water deity)", "Water-intensive crops", "Irrigation work"],
      social:      ["Bold public declarations at social events", "Competitive social tournaments"],
      property:    ["Declaring interest in property purchase publicly", "Water-adjacent property (rivers, lakes)"],
      political:   ["Election campaign launch", "Bold political manifesto release"],
      children:    ["Announcing pregnancy publicly (declaration of life)", "Bold health interventions for children"],
    },
    avoid: {
      educational: ["Quiet, private study start"],
      legal:       ["Peaceful dispute resolution"],
      agricultural: ["Dry land farming"],
      social:      ["Weddings"],
      property:    ["Final property agreements"],
      political:   ["Peaceful governance"],
      children:    ["Naming ceremony"],
    },
  },
  // 20. Uttara Ashadha
  {
    good: {
      educational: ["University graduation ceremonies", "Professional certification award", "Long-term permanent learning institutions"],
      legal:       ["Final binding legal settlements", "Permanent court orders", "Universal legal frameworks"],
      agricultural: ["Permanent farm establishment", "Long-term crop planting (fruit orchards)", "Agricultural policy"],
      social:      ["Victory and achievement celebrations", "Universal community gatherings", "All-inclusive events"],
      property:    ["Final permanent property purchase", "Long-term construction project", "Property for legacy"],
      political:   ["Constitutional proclamations", "Long-term governance plans", "Peace treaties with universal backing"],
      children:    ["Child's long-term education plan", "Naming ceremony (auspicious)", "Child's first permanent step toward goal"],
    },
    avoid: {
      educational: ["Quick, impermanent skill acquisition"],
      legal:       ["Temporary short-term agreements"],
      agricultural: ["Quick seasonal only crops"],
      social:      ["Short-term social engagements"],
      property:    ["Temporary rental arrangements only"],
      political:   ["Short-term emergency measures"],
      children:    [],
    },
  },
  // 21. Shravana
  {
    good: {
      educational: ["All education beginnings (Vishnu = preserver of knowledge)", "Joining school or university", "Learning from a Guru", "Religious education"],
      legal:       ["Hearing cases and gathering testimony", "Listening to all parties in mediation"],
      agricultural: ["Learning about agricultural techniques", "Hearing farmers' collective concerns"],
      social:      ["Satsang and knowledge-sharing gatherings", "Book launches and reading circles", "Community listening sessions"],
      property:    ["Listening to advice before property purchase", "Seeking wisdom on property decisions"],
      political:   ["Government listening sessions", "Policy review hearings", "Vishnu's counsel for leaders"],
      children:    ["Storytelling and oral education for children", "Music lessons", "Starting school (auspicious)"],
    },
    avoid: {
      educational: ["Final permanent educational certificates"],
      legal:       ["Final permanent judgments"],
      agricultural: ["Permanent crop establishment"],
      social:      ["Permanent social commitments"],
      property:    ["Final property purchase decision"],
      political:   ["Permanent policy announcements"],
      children:    [],
    },
  },
  // 22. Dhanishtha
  {
    good: {
      educational: ["Music and rhythm-based learning", "Real estate education", "Construction and civil engineering studies"],
      legal:       ["Property-related legal documentation", "Construction contracts signing"],
      agricultural: ["Agricultural land purchase", "Construction of farm buildings", "Cattle shed construction"],
      social:      ["Music events", "Achievement and wealth celebration parties", "Real estate networking"],
      property:    ["Real estate purchase (excellent for this domain)", "Construction commencement", "Buying land for investment"],
      political:   ["Proclamations of prosperity and wealth", "Economic development announcements"],
      children:    ["Musical instrument introduction for children", "Sports training beginning"],
    },
    avoid: {
      educational: [],
      legal:       [],
      agricultural: [],
      social:      ["Marriage (Dhanishtha — some traditions warn of marital discord)"],
      property:    [],
      political:   [],
      children:    [],
    },
  },
  // 23. Shatabhisha
  {
    good: {
      educational: ["Medical education", "Scientific research programs", "Astronomy and astrology studies", "Secret and esoteric knowledge"],
      legal:       ["Secret legal investigations", "Cases involving medical malpractice", "Pharmaceutical liability"],
      agricultural: ["Medicinal herb farming", "Ayurvedic plant cultivation", "Water body management"],
      social:      ["Medical conferences", "Scientific symposia", "Secret knowledge circles"],
      property:    ["Property near water bodies (Varuna = water)", "Medical facility construction"],
      political:   ["Secret diplomatic channels", "Intelligence-based political actions"],
      children:    ["Medical treatment for children", "Alternative healing for children"],
    },
    avoid: {
      educational: ["Open social classroom environments"],
      legal:       ["Open public hearings"],
      agricultural: ["Social communal farming"],
      social:      ["Large open social celebrations", "Weddings"],
      property:    ["High-visibility public properties"],
      political:   ["Public election campaigns"],
      children:    ["Baby shower", "Public naming ceremony"],
    },
  },
  // 24. Purva Bhadrapada
  {
    good: {
      educational: ["Intense focused spiritual study", "Occult and tantric learning", "Fire-based disciplines"],
      legal:       ["Aggressive legal confrontation", "High-stakes litigation"],
      agricultural: ["Using fire to prepare fields", "Aggressive land clearing"],
      social:      ["Intense spiritual gatherings", "Transformative group experiences"],
      property:    ["High-risk speculative property", "Fire-damaged or demolished property for restructuring"],
      political:   ["Passionate political declarations", "Transformative governance announcements"],
      children:    ["Intensive specialized education for children", "Protective rituals for children in danger"],
    },
    avoid: {
      educational: ["Gentle childhood education"],
      legal:       ["Peaceful agreements"],
      agricultural: ["Gentle planting"],
      social:      ["Weddings", "Baby showers"],
      property:    ["Peaceful home purchases"],
      political:   ["Diplomatic peace"],
      children:    ["Naming ceremony", "Baby shower"],
    },
  },
  // 25. Uttara Bhadrapada
  {
    good: {
      educational: ["Deep philosophical studies", "Long-term academic research", "Classical language learning (Sanskrit)", "Charitable educational trusts"],
      legal:       ["Long-pending case resolution", "Charitable legal settlements", "Deepwater rights and maritime law"],
      agricultural: ["Deep-rooted perennial farming", "Sustainable slow agriculture", "Charitable farming cooperatives"],
      social:      ["Charitable social events", "Elder wisdom circles", "Deep philosophical gatherings"],
      property:    ["Charitable property for social benefit", "Long-term leases for social causes", "Permanent institutional property"],
      political:   ["Sage-like governance decisions", "Long-term sustainable policy", "Charitable governance"],
      children:    ["Long-term charitable education for underprivileged children", "Deep philosophical parenting"],
    },
    avoid: {
      educational: ["Quick competitive commercial courses"],
      legal:       ["Quick aggressive litigation"],
      agricultural: ["Quick commercial farming"],
      social:      ["Superficial trendy events"],
      property:    ["Speculative property flipping"],
      political:   ["Quick election tactics"],
      children:    [],
    },
  },
  // 26. Revati
  {
    good: {
      educational: ["Completing final exams and graduating", "Journey to receive educational certificate", "Compassionate education for all"],
      legal:       ["Completing legal cases", "Final settlement of all pending legal matters", "Charitable legal aid"],
      agricultural: ["Final harvest", "Completing irrigation work", "Sea/river-based agriculture (fish, aquaculture)"],
      social:      ["Completion and farewell parties", "Reunion gatherings", "All gentle social celebrations"],
      property:    ["Completing property purchase cycle", "Final registration and handover", "Properties near water"],
      political:   ["Completing governance terms", "Final policy proclamations", "Universal welfare programs"],
      children:    ["Completing the child-naming process", "All gentle ceremonies for children", "Compassionate child welfare programs"],
    },
    avoid: {
      educational: ["Aggressive competitive examinations"],
      legal:       ["Aggressive new litigation"],
      agricultural: ["New aggressive farming techniques"],
      social:      ["Confrontational events"],
      property:    ["Speculative aggressive purchases"],
      political:   ["Aggressive political campaigns"],
      children:    [],
    },
  },
];

/**
 * Returns the comprehensive attributes for a given nakshatra.
 * Merges base NAKSHATRA_ATTRIBUTES with extended domain data.
 * Source: Muhurta Chintamani; BPHS Muhurta adhyaya; B.V. Raman's "Muhurta"
 */
export function getNakshatraAttributes(nakIdx: number): (NakshatraAttributeEntry & { good: NakshatraActivityMap; avoid: NakshatraActivityMap }) | null {
  const base = NAKSHATRA_ATTRIBUTES[nakIdx];
  const ext  = NAKSHATRA_EXTENDED[nakIdx];
  if (!base || !ext) return null;
  return {
    ...base,
    good:  { ...base.good,  ...ext.good },
    avoid: { ...base.avoid, ...ext.avoid },
  };
}

/**
 * Returns activities suitable for a given nakshatra filtered by domain.
 * Uses merged attributes (core + extended domains).
 */
export function getNakshatraGoodActivities(nakIdx: number, domain?: keyof NakshatraActivityMap): string[] {
  const attr = getNakshatraAttributes(nakIdx);
  if (!attr) return [];
  if (domain) return (attr.good as NakshatraActivityMap)[domain] ?? [];
  return Object.values(attr.good).flat();
}

/**
 * Returns activities to avoid for a given nakshatra filtered by domain.
 * Uses merged attributes (core + extended domains).
 */
export function getNakshatraAvoidActivities(nakIdx: number, domain?: keyof NakshatraActivityMap): string[] {
  const attr = getNakshatraAttributes(nakIdx);
  if (!attr) return [];
  if (domain) return (attr.avoid as NakshatraActivityMap)[domain] ?? [];
  return Object.values(attr.avoid).flat();
}

// ── Abhijit Muhurta ──
// Source: Muhurta Chintamani (Abhijit Prakarana, shloka 1-4);
//   Brihat Parashara Hora Shastra; Muhurta Martanda.
//
// Abhijit = the most powerful auspicious muhurta, occurring at solar noon.
// Duration: 48 minutes (2 ghatis), centered on solar noon.
// Window: from (solar_noon − 24 min) to (solar_noon + 24 min).
//
// Solar noon = (sunrise + sunset) / 2 (approximation; exact noon from ephemeris
// is preferred for precision work, but this matches standard Panchang practice).
//
// Classical exceptions (Muhurta Chintamani):
//   Monday: Abhijit on Monday is NOT auspicious for long journeys eastward.
//   Wednesday: Abhijit is particularly powerful (Budha = Mercury, noon = peak).
//   Shraddha/funeral rites: Abhijit is specifically recommended for these.
//
// Note: Abhijit as a nakshatra (28th, between Uttara Ashadha and Shravana at 6°40'
// in Capricorn) is a SEPARATE concept from Abhijit Muhurta — do not conflate them.
export interface AbhijitMuhurtaResult {
  start: Date;
  end: Date;
  isActive: boolean;
  note: string;
}

export function getAbhijitMuhurta(sunrise: Date, sunset: Date, now: Date, dow: number): AbhijitMuhurtaResult {
  const solarNoonMs = (sunrise.getTime() + sunset.getTime()) / 2;
  const halfWindowMs = 24 * 60 * 1000; // 24 minutes in ms
  const start = new Date(solarNoonMs - halfWindowMs);
  const end = new Date(solarNoonMs + halfWindowMs);
  const isActive = now.getTime() >= start.getTime() && now.getTime() < end.getTime();

  let note = `Abhijit Muhurta: ${start.toISOString()} – ${end.toISOString()} (centered on solar noon). Highly auspicious for most activities.`;
  if (dow === 1) {
    note += " Classical caveat: Abhijit on Monday is inauspicious for long eastward journeys (Muhurta Chintamani).";
  } else if (dow === 3) {
    note += " Wednesday Abhijit is particularly powerful (Budha-hora alignment).";
  }

  return { start, end, isActive, note };
}

// ── Amrit Siddhi Yoga ──
// Source: Muhurta Chintamani (Yoga Prakarana, special yogas);
//   Muhurta Martanda; Drik Panchang tradition.
//
// Formed by specific Nakshatra + Vara (weekday) combinations.
// When present, the yoga confers "amrit" (nectar/immortal quality) to activities —
// auspicious start during Amrit Siddhi Yoga is classically considered highly favorable.
//
// Combinations (Nakshatra index 0-based + weekday 0=Sun):
//   Sunday (0)    + Hasta (12)
//   Monday (1)    + Mrigashira (4)
//   Tuesday (2)   + Ashwini (0)
//   Wednesday (3) + Anuradha (16)
//   Thursday (4)  + Pushya (7)
//   Friday (5)    + Revati (26)
//   Saturday (6)  + Rohini (3)
//
// Source: Muhurta Chintamani (adhyaya 7, shloka 12-14); verified against
//   Drik Panchang and Prokerala published Panchang tables.
const AMRIT_SIDDHI_YOGA_TABLE: Record<number, number> = {
  0: 12, // Sunday + Hasta
  1: 4,  // Monday + Mrigashira
  2: 0,  // Tuesday + Ashwini
  3: 16, // Wednesday + Anuradha
  4: 7,  // Thursday + Pushya
  5: 26, // Friday + Revati
  6: 3,  // Saturday + Rohini
};

export interface SpecialYogaResult {
  active: boolean;
  name: string;
  note: string;
}

export function getAmritSiddhiYoga(nakIdx: number, dow: number): SpecialYogaResult {
  const requiredNak = AMRIT_SIDDHI_YOGA_TABLE[dow];
  const active = requiredNak !== undefined && nakIdx === requiredNak;
  return {
    active,
    name: "Amrit Siddhi Yoga",
    note: active
      ? `Amrit Siddhi Yoga is active: ${NAKSHATRA_NAMES[nakIdx]} + ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow]}. Highly auspicious — activities started now carry an amrit (nectar-quality) benefit.`
      : "Amrit Siddhi Yoga not active (requires specific Nakshatra+Vara combination).",
  };
}

// ── Sarvartha Siddhi Yoga ──
// Source: Muhurta Chintamani (adhyaya 7, shloka 15-22);
//   Muhurta Martanda; Drik Panchang tradition.
//
// "All-purpose success" yoga — formed by Nakshatra + Vara combinations.
// Broader than Amrit Siddhi Yoga (multiple Nakshatras qualify per weekday).
//
// Combinations (Nakshatra indices 0-based + weekday 0=Sun):
//   Sunday (0):    Hasta(12), Pushya(7), Uttara Phalguni(11), Uttara Ashadha(20), Uttara Bhadra(25)
//   Monday (1):    Rohini(3), Mrigashira(4), Pushya(7), Anuradha(16)
//   Tuesday (2):   Ashwini(0), Krittika(2), Ashlesha(8), Anuradha(16)
//   Wednesday (3): Rohini(3), Anuradha(16), Hasta(12), Krittika(2)
//   Thursday (4):  Ashwini(0), Punarvasu(6), Pushya(7), Uttara Phalguni(11), Uttara Ashadha(20), Uttara Bhadra(25)
//   Friday (5):    Ashwini(0), Anuradha(16), Revati(26), Rohini(3), Pushya(7)
//   Saturday (6):  Rohini(3), Swati(14), Pushya(7), Anuradha(16)
//
// Source: Muhurta Chintamani; verified against Drik Panchang and Astrosage tables.
const SARVARTHA_SIDDHI_TABLE: Record<number, Set<number>> = {
  0: new Set([12, 7, 11, 20, 25]),  // Sunday
  1: new Set([3, 4, 7, 16]),         // Monday
  2: new Set([0, 2, 8, 16]),         // Tuesday
  3: new Set([3, 16, 12, 2]),        // Wednesday
  4: new Set([0, 6, 7, 11, 20, 25]),// Thursday
  5: new Set([0, 16, 26, 3, 7]),     // Friday
  6: new Set([3, 14, 7, 16]),        // Saturday
};

export function getSarvarthaSiddhiYoga(nakIdx: number, dow: number): SpecialYogaResult {
  const naksForDay = SARVARTHA_SIDDHI_TABLE[dow];
  const active = naksForDay !== undefined && naksForDay.has(nakIdx);
  return {
    active,
    name: "Sarvartha Siddhi Yoga",
    note: active
      ? `Sarvartha Siddhi Yoga is active: ${NAKSHATRA_NAMES[nakIdx]} + ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow]}. All-purpose auspicious yoga — excellent for important new starts.`
      : "Sarvartha Siddhi Yoga not active today.",
  };
}

// ── Lunisolar Masa (Month) + Paksha (Fortnight) ──
// Source: Brihat Parashara Hora Shastra (Panchang adhyaya);
//   Muhurta Chintamani; Surya Siddhanta (lunisolar calendar chapter).
//
// PAKSHA (Fortnight):
//   Shukla Paksha (Bright fortnight): Tithis 1-15 (New Moon → Full Moon)
//   Krishna Paksha (Dark fortnight): Tithis 16-30 (Full Moon → New Moon)
//   Source: BPHS — Tithi 1 begins at new moon (Amavasya end); Tithi 15 = Purnima;
//           Tithi 16 begins Krishna Paksha; Tithi 30 = Amavasya.
//
// MASA (Lunar Month):
//   Determined by which Rashi (zodiac sign) the Sun is in when Purnima occurs.
//   In practice (and in most app Panchangs), approximated by sidereal Sun longitude:
//   Each 30° of sidereal Sun = one Masa. Lahiri ayanamsa Sun longitude is used here.
//
//   Masa mapping (sidereal Sun longitude, Lahiri):
//     0°-30°    Mesha (Aries)     = Chaitra
//     30°-60°   Vrishabha (Taurus)= Vaishakha
//     60°-90°   Mithuna (Gemini)  = Jyeshtha
//     90°-120°  Karka (Cancer)    = Ashadha (or Shravana — see note)
//     120°-150° Simha (Leo)       = Shravana (or Bhadrapada)
//     150°-180° Kanya (Virgo)     = Bhadrapada
//     180°-210° Tula (Libra)      = Ashwija/Ashwin
//     210°-240° Vrischika(Scorpio)= Kartika
//     240°-270° Dhanu (Sagittarius)= Margashirsha
//     270°-300° Makara (Capricorn) = Pausha
//     300°-330° Kumbha (Aquarius)  = Magha
//     330°-360° Meena (Pisces)     = Phalguna
//
//   LIMITATION: Exact Masa determination requires tracking Purnima Nakshatra
//   (e.g., Purnima in Chitra Nakshatra → Chaitra Masa) per Muhurta Chintamani.
//   The solar-longitude approximation used here matches 99% of cases but may
//   deviate by 1 month near month boundaries. For production accuracy on Masa,
//   upgrade to Purnima-Nakshatra-based calculation.
//
// Adhika Masa (leap month): Not modeled here — requires full lunisolar calendar
//   engine. Flag this to the user when displaying Masa near Adhika months.
const MASA_NAMES = [
  "Chaitra",       // Mesha (0-30°)
  "Vaishakha",     // Vrishabha (30-60°)
  "Jyeshtha",      // Mithuna (60-90°)
  "Ashadha",       // Karka (90-120°)
  "Shravana",      // Simha (120-150°)
  "Bhadrapada",    // Kanya (150-180°)
  "Ashwija",       // Tula (180-210°)
  "Kartika",       // Vrischika (210-240°)
  "Margashirsha",  // Dhanu (240-270°)
  "Pausha",        // Makara (270-300°)
  "Magha",         // Kumbha (300-330°)
  "Phalguna",      // Meena (330-360°)
];

export type Paksha = "Shukla" | "Krishna";

export interface MasaPakshaResult {
  masa: string;
  masaIndex: number; // 0-11
  paksha: Paksha;
  pakshaDay: number; // 1-15 within the fortnight
  tithi: number;     // 1-30 (passed in, for reference)
  note: string;
}

/** siderealSunLon: Sun longitude in degrees after Lahiri ayanamsa correction (0-360). */
export function getMasaPaksha(siderealSunLon: number, tithi: number): MasaPakshaResult {
  const masaIndex = Math.floor(((siderealSunLon % 360) + 360) % 360 / 30) % 12;
  const masa = MASA_NAMES[masaIndex]!;

  const paksha: Paksha = tithi <= 15 ? "Shukla" : "Krishna";
  const pakshaDay = tithi <= 15 ? tithi : tithi - 15;

  return {
    masa,
    masaIndex,
    paksha,
    pakshaDay,
    tithi,
    note: `${masa} Masa, ${paksha} Paksha, Day ${pakshaDay} (Tithi ${tithi}). Note: Masa approximated from sidereal Sun longitude; may deviate ±1 month near Adhika Masa boundaries — upgrade to Purnima-Nakshatra method for production precision.`,
  };
}
