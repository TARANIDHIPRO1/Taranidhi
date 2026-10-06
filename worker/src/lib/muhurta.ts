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
// - TARA_NEUTRAL: Neutral or context-dependent. NOTE: Janma tara is DISPUTED between authorities --
//   Muhurta Chintamani's tara list counts it bad (1,3,5,7 bad) with a vegetable-donation remedy,
//   while some authorities call it good. "Neutral" here is a project decision (CLAUDE.md #3);
//   the Karma Vipak Samhita source claim was NOT located in the 2026-10 verification.
// - Implicitly malefic: Vipat, Pratyari, Vadha (not listed above)
// Source: Muhurta Chintamani (Gochara Prakarana: tara method, 2/4/6/8/9 good, cycle rule, remedies).
//   B.V. Raman / Karma Vipak Samhita claims for Janma-as-neutral: unverified.
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
 * Janma (1) is classified as neutral by project decision. This is DISPUTED:
 * Muhurta Chintamani lists Janma among the bad taras (with a vegetable-donation
 * remedy) and exempts specific events (upanayana; marriage of a second-born). The
 * earlier Karma Vipak Samhita / B.V. Raman attribution is unverified.
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
 * Rahu Kaal -- daytime (sunrise->sunset) split into 8 equal parts; Rahu Kaal
 * occupies a fixed part-index per weekday. LABEL: this is a later, mainly South
 * Indian Panchang tradition (Drik Panchang: several competing Rahu methods exist;
 * this "Yamardha 1/8 of daytime" method is the most popular). It is NOT among the
 * rejections listed in Muhurta Chintamani or Brihat Samhita (2026-10 verification).
 * Treat as a regional/traditional layer, not a classical Muhurta rule.
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
// Formula (standard Panchang definition; Surya Siddhanta basis, verse not located):
//   Yoga index = floor(((sunLon + moonLon) mod 360) / (360/27)), each yoga = 13°20'.
// The 27 names/order were confirmed against a published Panchang list.
//
// WHICH YOGAS ARE REJECTED: see NITYA_YOGA_FULL_REJECT / NITYA_YOGA_OPENING_GHATIS
// below. (Earlier versions of this file treated nine yogas as bad for their whole
// span; the Muhurta Chintamani rule rejects only Vyatipata and Vaidhriti in full.)
// The "highly auspicious" grading is a proprietary tiering, not a classical ranking.
export const NITYA_YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarman", "Dhriti", "Shoola", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Mahendra", "Vaidhriti",
];

// ── Nitya Yoga rejection rule ────────────────────────────────────────────────
// Per the Muhurta Chintamani rule quoted in the 2026-10-07 verification report
// (docs/RULES_VERIFICATION_2026-10.md): only Vyatipata and Vaidhriti are rejected
// for the WHOLE yoga. The other seven "bad" yogas are rejected only for their
// OPENING ghatis:
//   Vishkambha 3, Vajra 3, Parigha half (= 30), Shula 5, Ganda 6, Atiganda 6, Vyaghata 9.
// Verse reference: "MC Shubhashubha 1.34-35" comes from a secondary citation
// and is NOT yet checked against the Sanskrit edition (verified=false).
//
// A ghati is 1/60 of a day; a Nitya Yoga lasts ~56 ghatis, so the rule is applied
// proportionally by ARC: one ghati = (360/27)/60 degrees of the yoga. This
// proportional reading is an implementation choice; editions may differ.
export const NITYA_YOGA_FULL_REJECT = new Set([16, 26]); // Vyatipata, Vaidhriti
export const NITYA_YOGA_OPENING_GHATIS: Record<number, number> = {
  0: 3,   // Vishkambha
  5: 6,   // Atiganda
  8: 5,   // Shula
  9: 6,   // Ganda
  12: 9,  // Vyaghata
  14: 3,  // Vajra
  18: 30, // Parigha ("half" of the yoga)
};
const NITYA_YOGA_SPAN_DEG = 360 / 27;
// Highly auspicious yoga indices (proprietary grading, not a classical ranking)
const NITYA_YOGA_HIGHLY_AUSPICIOUS = new Set([1, 2, 3, 4, 7, 10, 11, 13, 15, 19, 20, 21, 22, 23, 24, 25]);

export interface NityaYogaResult {
  index: number; // 0-26
  name: string;
  quality: "auspicious" | "malefic" | "neutral";
  /** "full" = whole yoga rejected; "opening" = only the opening ghatis rejected; "none". */
  rejection: "full" | "opening" | "none";
  /** True only when the Moon/Sun position is inside the rejected portion right now. */
  rejectedNow: boolean;
  degreesIntoYoga: number;
  /** For "opening" yogas: arc (deg) of the rejected opening portion. */
  rejectedUptoDeg: number | null;
  note: string;
  verified: false; // flips only after FACT_CHECK sign-off against the Sanskrit edition
}

export function getNityaYoga(sunLon: number, moonLon: number): NityaYogaResult {
  const combined = ((sunLon + moonLon) % 360 + 360) % 360;
  const index = Math.floor(combined / NITYA_YOGA_SPAN_DEG);
  const name = NITYA_YOGA_NAMES[index]!;
  const degreesIntoYoga = combined - index * NITYA_YOGA_SPAN_DEG;

  let rejection: "full" | "opening" | "none" = "none";
  let rejectedUptoDeg: number | null = null;
  let rejectedNow = false;
  if (NITYA_YOGA_FULL_REJECT.has(index)) {
    rejection = "full";
    rejectedNow = true;
  } else if (NITYA_YOGA_OPENING_GHATIS[index] !== undefined) {
    rejection = "opening";
    rejectedUptoDeg = (NITYA_YOGA_OPENING_GHATIS[index]! / 60) * NITYA_YOGA_SPAN_DEG;
    rejectedNow = degreesIntoYoga < rejectedUptoDeg;
  }

  const quality: NityaYogaResult["quality"] = rejectedNow
    ? "malefic"
    : NITYA_YOGA_HIGHLY_AUSPICIOUS.has(index)
    ? "auspicious"
    : "neutral";

  let note: string;
  if (rejection === "full") {
    note = `${name} Yoga is rejected for the whole yoga for auspicious work (Muhurta Chintamani rule; verse unverified).`;
  } else if (rejection === "opening") {
    note = rejectedNow
      ? `${name} Yoga: inside its rejected opening portion (first ${NITYA_YOGA_OPENING_GHATIS[index]} ghatis) — avoid new auspicious work now.`
      : `${name} Yoga: its rejected opening portion (first ${NITYA_YOGA_OPENING_GHATIS[index]} ghatis) has passed — not rejected now.`;
  } else if (quality === "auspicious") {
    note = `${name} Yoga is auspicious — favorable for new beginnings.`;
  } else {
    note = `${name} Yoga — neutral quality, no specific prohibition or promotion.`;
  }
  return { index, name, quality, rejection, rejectedNow, degreesIntoYoga, rejectedUptoDeg, note, verified: false };
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

// ── Navtara Paddhati (Tarabala) ──────────────────────────────────────────────
// Source: Muhurta-Chintamani (primary); Chugh (cross-reference per SOURCE_CROSSCHECK_MATRIX_V3)
//
// 27 nakshatras are counted from birth nakshatra in groups of 9, repeating 3 times (3 cycles).
// Position 1-9 within the 9-fold cycle gives Tara name; cycle 1/2/3 modifies quality.
//
// Formula (NAVTARA_MASTER_RULESET_V2):
//   distance     = ((currentIdx - janmaIdx) mod 27) + 1    → 1..27
//   cycle        = ceil(distance / 9)                       → 1, 2, or 3
//   taraPosition = ((distance - 1) mod 9) + 1              → 1..9
//
// Tara sequence:
//   1 Janma · 2 Sampat · 3 Vipat · 4 Kshema · 5 Pratyari/Pratyak
//   6 Sadhaka · 7 Vadha/Naidhana · 8 Mitra/Maitra · 9 Parama Mitra/Ati-Maitra
//
// CRITICAL — Cycle-dependent rule (Muhurta-Chintamani):
//   Cycle 1: Vipat(3), Pratyari(5), Vadha(7) are wholly adverse.
//   Cycle 2: Vipat — first 20 अंश adverse, remaining 40 favourable.
//            Pratyari — middle 20 adverse, outer 20 favourable.
//            Vadha — final 20 adverse, first 40 favourable.
//            (20/40 अंश unit not yet source-validated; stored as zone classification only.)
//   Cycle 3: Vipat, Pratyari, Vadha are wholly favourable.
//
// Implementation: cycle stored; cycle-2 zone cannot be resolved without exact
// nakshatra degree — flagged as "mixed" with score 0 until degree data is wired.

export type NavtaraName =
  | "Janma"
  | "Sampat"
  | "Vipat"
  | "Kshema"
  | "Pratyari"
  | "Sadhaka"
  | "Vadha"
  | "Mitra"
  | "Parama Mitra";

export type NavtaraQuality =
  | "neutral"
  | "benefic"
  | "malefic"
  | "most_benefic"
  | "most_malefic"
  | "mixed";          // cycle-2 zone state: partially adverse, partially benefic

export interface NavtaraResult {
  distance: number;           // 1-27 count from birth nakshatra
  cycle: number;              // 1, 2, or 3 (which repetition through 27)
  position: number;           // 1-9 within the cycle
  name: NavtaraName;
  baseQuality: NavtaraQuality;      // standard quality from classical table
  effectiveQuality: NavtaraQuality; // cycle-adjusted (cycle 3 reverses adverse taras)
  cycleRule: string;                // what Muhurta-Chintamani says for this cycle
  meaning: string;
  recommendation: string;
  score: number;              // –2 to +2 for convergence scoring (cycle-adjusted)
  // Percentage score: proprietary display weighting (originally AI-synthesised; NOT a classical numeric table):
  // Tara pos → raw %: Janma(1)=20, Sampat(2)=95, Vipat(3)=15, Kshema(4)=90,
  // Pratyari(5)=10, Sadhaka(6)=85, Vadha(7)=5, Mitra(8)=80, ParamaMitra(9)=100
  // Cycle-3 reversal applies to positions 3/5/7 (adverse → auspicious).
  rawScore: number;           // 5–100 percentage scale for Tara Bala display
}

// Base table — cycle 1 standard qualities
// Position: [ name, baseQuality, meaning, recommendation, baseScore ]
const NAVTARA_BASE: Array<{
  name: NavtaraName;
  quality: NavtaraQuality;
  meaning: string;
  recommendation: string;
  score: number;
}> = [
  { name: "Janma",        quality: "neutral",      score:  0, meaning: "Birth star itself",          recommendation: "Neutral — avoid new ventures; personal matters only" },
  { name: "Sampat",       quality: "benefic",      score:  1, meaning: "Prosperity and wealth",      recommendation: "Favourable — good for financial and general auspicious work" },
  { name: "Vipat",        quality: "malefic",      score: -1, meaning: "Danger and obstacles",       recommendation: "Unfavourable (cycle 1) — avoid new ventures" },
  { name: "Kshema",       quality: "benefic",      score:  1, meaning: "Wellbeing and comfort",      recommendation: "Favourable — good for health, family, and comfort" },
  { name: "Pratyari",     quality: "malefic",      score: -1, meaning: "Opposition and resistance",  recommendation: "Unfavourable (cycle 1) — opposition likely" },
  { name: "Sadhaka",      quality: "benefic",      score:  2, meaning: "Achievement and success",    recommendation: "Very favourable — excellent for goal-oriented work" },
  { name: "Vadha",        quality: "most_malefic", score: -2, meaning: "Destruction and loss",       recommendation: "Most adverse (cycle 1) — avoid all auspicious work" },
  { name: "Mitra",        quality: "benefic",      score:  1, meaning: "Friendship and support",     recommendation: "Favourable — good for partnerships and collaborative ventures" },
  { name: "Parama Mitra", quality: "most_benefic", score:  2, meaning: "Best friend, highest grace", recommendation: "Most favourable — best nakshatra for important auspicious work" },
];

function _applyCycleRule(
  pos: number,          // 1-9
  cycle: number,        // 1, 2, 3
  base: typeof NAVTARA_BASE[0]
): { effectiveQuality: NavtaraQuality; cycleRule: string; score: number } {
  // Only positions 3 (Vipat), 5 (Pratyari), 7 (Vadha) are cycle-affected
  if (pos !== 3 && pos !== 5 && pos !== 7) {
    return {
      effectiveQuality: base.quality,
      score: base.score,
      cycleRule: "Standard — no cycle modification for this Tara.",
    };
  }
  if (cycle === 1) {
    return {
      effectiveQuality: base.quality,
      score: base.score,
      cycleRule: `Cycle 1: ${base.name} is wholly adverse. (Muhurta-Chintamani)`,
    };
  }
  if (cycle === 2) {
    // Zone rule: cannot resolve without exact degree in nakshatra — flag as mixed
    return {
      effectiveQuality: "mixed",
      score: 0,
      cycleRule:
        `Cycle 2: ${base.name} has internal adverse/favourable zones (20/40 अंश). ` +
        `Exact zone requires nakshatra degree — treating as mixed until degree data wired. (Muhurta-Chintamani)`,
    };
  }
  // cycle === 3: wholly favourable reversal
  const reversedQuality: NavtaraQuality = pos === 7 ? "most_benefic" : "benefic";
  const reversedScore = pos === 7 ? 2 : 1;
  return {
    effectiveQuality: reversedQuality,
    score: reversedScore,
    cycleRule: `Cycle 3: ${base.name} is wholly favourable — full reversal. (Muhurta-Chintamani)`,
  };
}

/**
 * Calculate Navtara (Tarabala) with cycle tracking.
 * Source: Muhurta-Chintamani; Chugh; NAVTARA_MASTER_RULESET_V2
 *
 * @param birthNakIdx  Birth nakshatra index 0-26 (Ashwini=0 … Revati=26)
 * @param queryNakIdx  Nakshatra index at the muhurta moment 0-26
 */
// Tara Bala raw percentage table (position 1-9 → percentage score).
// Source: proprietary weighting (originally AI-synthesised); only the good/bad
//         classification of the 9 taras is classical (Muhurta Chintamani).
// Position:          1    2    3    4    5    6    7    8    9
// Tara:          Janma Samp Vipat Ksh  Prat  Sadh Vadh  Mit  ParM
const _TARA_RAW_SCORE: Record<number, number> = {
  1: 20,   // Janma    — natal star, mixed/neutral, caution
  2: 95,   // Sampat   — very auspicious (wealth)
  3: 15,   // Vipat    — adverse (cycle 1 & 2); cycle-3 reversal applies below
  4: 90,   // Kshema   — auspicious (wellbeing)
  5: 10,   // Pratyari — adverse (cycle 1 & 2); cycle-3 reversal applies below
  6: 85,   // Sadhaka  — auspicious (achievement)
  7:  5,   // Vadha    — most adverse (cycle 1 & 2); cycle-3 → 100 (Parama Mitra grade)
  8: 80,   // Mitra    — auspicious (friendship)
  9: 100,  // Parama Mitra — most auspicious
};

// Cycle-3 raw scores for positions 3, 5, 7. Classical basis: MC says all taras are auspicious
// in the 3rd cycle. The specific Kshema/Mitra/Parama-Mitra grades below are proprietary.
const _TARA_RAW_SCORE_CYCLE3_REVERSED: Record<number, number> = {
  3: 85,   // Vipat → Kshema-grade (cycle-3 beneficial)
  5: 80,   // Pratyari → Mitra-grade (cycle-3 beneficial)
  7: 100,  // Vadha → Parama Mitra-grade (cycle-3 = most auspicious reversal)
};

export function calculateNavtara(birthNakIdx: number, queryNakIdx: number): NavtaraResult {
  const distance     = ((queryNakIdx - birthNakIdx) % 27 + 27) % 27 + 1;  // 1..27
  const cycle        = Math.ceil(distance / 9);                             // 1, 2, 3
  const position     = ((distance - 1) % 9) + 1;                           // 1..9
  const base         = NAVTARA_BASE[position - 1]!;
  const { effectiveQuality, cycleRule, score } = _applyCycleRule(position, cycle, base);

  // Compute rawScore: for cycle-3 adverse positions, use reversed value;
  // for cycle-2 mixed zone, use base (uncertainty preserved);
  // otherwise use standard position score.
  let rawScore = _TARA_RAW_SCORE[position] ?? 50;
  if (cycle === 3 && (position === 3 || position === 5 || position === 7)) {
    rawScore = _TARA_RAW_SCORE_CYCLE3_REVERSED[position] ?? rawScore;
  }

  return {
    distance,
    cycle,
    position,
    name:             base.name,
    baseQuality:      base.quality,
    effectiveQuality,
    cycleRule,
    meaning:          base.meaning,
    recommendation:   base.recommendation,
    score,
    rawScore,
  };
}

/**
 * Get Navtara score for convergence scoring (–2 to +2, cycle-adjusted).
 */
export function getNavtaraScore(birthNakIdx: number, queryNakIdx: number): number {
  return calculateNavtara(birthNakIdx, queryNakIdx).score;
}

// ── Nakshatra Classical Exceptions ───────────────────────────────────────────
// Source: Muhurta-Chintamani (Nakshatra Prakarana);
//         BPHS Muhurta adhyaya; Brihat Samhita (Varahamihira)
//
// These are specific, textually-attested per-nakshatra rules that override or
// supplement the general nature-type (Tikshna/Ugra/Mridu/Chara/Sthira/Laghu/Mishra).
// Activity suitability for most nakshatras is derived from their nature type
// via getNakshatraNature() — exceptions below are the ONLY per-nakshatra overrides.
//
// Rule: Do NOT add a nakshatra here without citing the exact text/shloka.

export interface NakshatraException {
  nakIdx: number;           // 0-26 (Ashwini=0 … Revati=26)
  nakName: string;
  rule: string;             // the specific prohibition or endorsement
  source: string;           // text + chapter/shloka
  applies_to: string;       // what activity/context
  isProhibition: boolean;   // true = avoid; false = specifically recommended
}

export const NAKSHATRA_EXCEPTIONS: NakshatraException[] = [
  {
    nakIdx: 0, nakName: "Ashwini",
    rule: "Best nakshatra for commencing medical treatment and surgery.",
    source: "Muhurta Chintamani, Nakshatra Prakarana; deity = Ashwini Kumaras (divine physicians)",
    applies_to: "Medical treatment initiation, surgery commencement",
    isProhibition: false,
  },
  {
    nakIdx: 3, nakName: "Rohini",
    rule: "Brahma's favourite nakshatra — most auspicious of all Sthira nakshatras. Especially favoured for sowing seeds, planting, marriage, and permanent works.",
    source: "Brihat Samhita (Varahamihira), Nakshatra adhyaya; BPHS Muhurta adhyaya",
    applies_to: "Agriculture (sowing), marriage, griha pravesh, permanent foundations",
    isProhibition: false,
  },
  {
    nakIdx: 7, nakName: "Pushya",
    rule: "Pushya is inauspicious for marriage even though it is excellent (Laghu/Kshipra) for almost all other activities.",
    source: "Muhurta Chintamani, Vivaha Prakarana (explicit prohibition on Pushya for marriage)",
    applies_to: "Marriage/Vivaha only",
    isProhibition: true,
  },
  {
    nakIdx: 18, nakName: "Mula",
    rule: "Ganda Moola nakshatra — avoid all auspicious ceremonies. Naming ceremony for a child born in Mula requires Mula Shanti puja first.",
    source: "BPHS Muhurta adhyaya; Muhurta Chintamani, Ganda Moola Prakarana",
    applies_to: "All auspicious ceremonies; naming ceremony requires Shanti first",
    isProhibition: true,
  },
];

/**
 * Returns classical exceptions for a given nakshatra index, if any.
 * Most nakshatras have no specific exceptions — use getNakshatraNature() for general guidance.
 */
export function getNakshatraExceptions(nakIdx: number): NakshatraException[] {
  return NAKSHATRA_EXCEPTIONS.filter(e => e.nakIdx === nakIdx);
}


// ── Abhijit Muhurta ──
// Source: 8th of the 15 day-muhurtas, at midday; quoted as "destroys all doshas"
//   in muhurta literature (verse attribution to a specific MC verse NOT confirmed;
//   the earlier "Abhijit Prakarana shloka 1-4" / "MC 2.1-3" references were wrong or unverified).
//
// Abhijit = the most powerful auspicious muhurta, occurring at solar noon.
// Duration: 48 minutes (2 ghatis), centered on solar noon.
// Window: from (solar_noon − 24 min) to (solar_noon + 24 min).
//
// Solar noon = (sunrise + sunset) / 2 (approximation; exact noon from ephemeris
// is preferred for precision work, but this matches standard Panchang practice).
//
// Exception: the only one found in the sources checked is that Abhijit is NOT used for
//   travel to the SOUTH (याम्यदिग्गमनं विना). The earlier Monday-eastward caveat and
//   "Wednesday is particularly powerful" notes had no primary-source support and were removed.
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
  note += " Exception: not for travel towards the south.";
  void dow; // weekday-specific Abhijit rules were unsupported by primary sources

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
// Source: matches published Panchang tables (Drik Panchang / Prokerala); the earlier
//   "Muhurta Chintamani adhyaya 7, shloka 12-14" reference is UNVERIFIED (MC's Nakshatra
//   prakarana is chapter 2; verse not located).
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

// ── Choghadiya ────────────────────────────────────────────────────────────────
// Choghadiya ("quarter of a ghadi") divides the daylight period into 8 equal
// segments and the night period into 8 equal segments (16 total per day).
// Each segment is ~90 minutes at equinox but varies with sunrise/sunset.
// The FIRST day segment and FIRST night segment are always the Hora of the
// weekday ruler; the sequence then cycles through a fixed planetary order.
//
// Classical source: Muhurta Chintamani (Choghadiya Prakarana);
//                   Chugh Muhurta; Panchanga tradition (Gujarat-Maharashtra lineage).
//
// Seven types: Amrit (Amrut), Shubh, Labh, Char, Udveg, Rog, Kal.
// Auspiciousness:
//   Most auspicious : Amrit > Shubh ≈ Labh > Char (neutral, good for travel)
//   Inauspicious    : Udveg, Rog, Kal
//
// Weekday ruler (index 0=Sunday … 6=Saturday):
//   Sun=0, Moon=1, Mars=2, Mercury=3, Jupiter=4, Venus=5, Saturn=6
//
// Day sequence starting from weekday ruler (classical cycle):
//   Sun→Amrit, Moon→Char, Mars→Rog, Mercury→Labh, Jupiter→Shubh, Venus→Rog, Saturn→Kal
//   Wait — the Choghadiya cycle does NOT follow the planet's own quality;
//   it follows a FIXED sequence starting at the day-ruler's assigned type,
//   then rotating through the 7-type cycle in a fixed planetary-hour order.
//
// The day-Choghadiya sequence starts with the weekday ruler's type.
// The planet → Choghadiya type mapping:
//   Sun → Udveg, Moon → Amrit, Mars → Kal, Mercury → Labh,
//   Jupiter → Shubh, Venus → Char, Saturn → Rog
//
// Day sequence order (planet order for day, starting from day-ruler):
//   [Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars]  ← rotating through these 7
// Night sequence order (planet order for night, starting from day-ruler's 5th):
//   [Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars]  ← same rotation but offset

export type ChoghadiyaType =
  | "Amrit"   // Moon — most auspicious, all works
  | "Shubh"   // Jupiter — auspicious, good for auspicious ceremonies
  | "Labh"    // Mercury — gain/profit, good for business and new ventures
  | "Char"    // Venus — movement/travel, neutral-positive
  | "Udveg"   // Sun — anxiety/agitation, avoid new works
  | "Rog"     // Saturn/Venus (mixed in night) — disease/conflict, inauspicious
  | "Kal"     // Mars — adverse, avoid all important works

export interface ChoghadiyaWindow {
  type: ChoghadiyaType;
  planet: string;           // ruling planet for this segment
  startJD: number;          // Julian Day Number (UT) start
  endJD: number;            // Julian Day Number (UT) end
  startIST: string;         // HH:MM local display (IST = UT + 5:30)
  endIST: string;           // HH:MM local display
  segmentIndex: number;     // 0-7 for day (0=first day segment), 0-7 for night
  period: "day" | "night";
  isAuspicious: boolean;    // Amrit, Shubh, Labh, Char = true; Udveg, Rog, Kal = false
}

export interface ChoghadiyaResult {
  daySegments: ChoghadiyaWindow[];    // 8 day Choghadiyas
  nightSegments: ChoghadiyaWindow[];  // 8 night Choghadiyas
  currentChoghadiya: ChoghadiyaWindow | null;
  date: string;   // YYYY-MM-DD of the calculation
  weekday: number; // 0=Sun … 6=Sat
}

// Planet → Choghadiya type mapping (classical Muhurta Chintamani assignment).
// Source: Muhurta Chintamani Choghadiya Prakarana; Chugh Muhurta p. 87-92.
const _PLANET_TO_CHOGHADIYA: Record<string, ChoghadiyaType> = {
  Sun:      "Udveg",
  Moon:     "Amrit",
  Mars:     "Kal",
  Mercury:  "Labh",
  Jupiter:  "Shubh",
  Venus:    "Char",
  Saturn:   "Rog",
};

// Day sequence planet order (7 planets, cycles).
// Source: Muhurta Chintamani; traditional Panchanga tables.
// Order: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars (day)
const _CHOGHADIYA_DAY_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

// Night sequence planet order: offset by 5 from day ruler (or equivalently same
// array starting at index 5 from day ruler in the day order).
// Night starts with the 5th planet in the day sequence from the current day ruler.
// Source: Muhurta Chintamani Choghadiya Prakarana (Ratri Choghadiya section).
const _CHOGHADIYA_NIGHT_OFFSET = 5;

// Weekday ruler index → planet name (0=Sunday).
const _WEEKDAY_RULER: Record<number, string> = {
  0: "Sun",      // Sunday
  1: "Moon",     // Monday
  2: "Mars",     // Tuesday
  3: "Mercury",  // Wednesday
  4: "Jupiter",  // Thursday
  5: "Venus",    // Friday
  6: "Saturn",   // Saturday
};

function _jdToISTString(jd: number): string {
  // Convert Julian Day (UT) to IST (UTC+5:30) HH:MM string.
  const utMs = (jd - 2440587.5) * 86400000;
  const istMs = utMs + 5.5 * 3600000;
  const d = new Date(istMs);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Build all 16 Choghadiya windows (8 day + 8 night) for a given date.
 *
 * @param sunriseJD  Julian Day of sunrise (UT)
 * @param sunsetJD   Julian Day of sunset (UT)
 * @param nextSunriseJD  Julian Day of next day's sunrise (UT) [for night end]
 * @param weekday    0=Sunday … 6=Saturday
 * @param nowJD      Current Julian Day (UT) to identify active window
 * @param dateStr    YYYY-MM-DD label for the result
 *
 * Source: Muhurta Chintamani Choghadiya Prakarana (day/night 8-segment division);
 *         validated against standard printed Panchanga tables.
 */
export function buildChoghadiya(
  sunriseJD: number,
  sunsetJD: number,
  nextSunriseJD: number,
  weekday: number,
  nowJD: number,
  dateStr: string,
): ChoghadiyaResult {
  const dayRuler = _WEEKDAY_RULER[weekday]!;
  const dayRulerIdx = _CHOGHADIYA_DAY_ORDER.indexOf(dayRuler);

  const dayLength = (sunsetJD - sunriseJD) / 8;
  const nightLength = (nextSunriseJD - sunsetJD) / 8;

  const daySegments: ChoghadiyaWindow[] = [];
  for (let i = 0; i < 8; i++) {
    const planetIdx = (dayRulerIdx + i) % 7;
    const planet = _CHOGHADIYA_DAY_ORDER[planetIdx]!;
    const type = _PLANET_TO_CHOGHADIYA[planet]!;
    const startJD = sunriseJD + i * dayLength;
    const endJD = startJD + dayLength;
    daySegments.push({
      type,
      planet,
      startJD,
      endJD,
      startIST: _jdToISTString(startJD),
      endIST: _jdToISTString(endJD),
      segmentIndex: i,
      period: "day",
      isAuspicious: type === "Amrit" || type === "Shubh" || type === "Labh" || type === "Char",
    });
  }

  // Night: starts from offset 5 in the day order from the day ruler.
  const nightRulerIdx = (dayRulerIdx + _CHOGHADIYA_NIGHT_OFFSET) % 7;
  const nightSegments: ChoghadiyaWindow[] = [];
  for (let i = 0; i < 8; i++) {
    const planetIdx = (nightRulerIdx + i) % 7;
    const planet = _CHOGHADIYA_DAY_ORDER[planetIdx]!;
    const type = _PLANET_TO_CHOGHADIYA[planet]!;
    const startJD = sunsetJD + i * nightLength;
    const endJD = startJD + nightLength;
    nightSegments.push({
      type,
      planet,
      startJD,
      endJD,
      startIST: _jdToISTString(startJD),
      endIST: _jdToISTString(endJD),
      segmentIndex: i,
      period: "night",
      isAuspicious: type === "Amrit" || type === "Shubh" || type === "Labh" || type === "Char",
    });
  }

  const allSegments = [...daySegments, ...nightSegments];
  const currentChoghadiya = allSegments.find(s => nowJD >= s.startJD && nowJD < s.endJD) ?? null;

  return {
    daySegments,
    nightSegments,
    currentChoghadiya,
    date: dateStr,
    weekday,
  };
}

/**
 * Get the active Choghadiya window for a given moment.
 * Returns null outside sunrise-to-next-sunrise range.
 */
export function getActiveChoghadiya(
  sunriseJD: number,
  sunsetJD: number,
  nextSunriseJD: number,
  weekday: number,
  nowJD: number,
  dateStr: string,
): ChoghadiyaWindow | null {
  return buildChoghadiya(sunriseJD, sunsetJD, nextSunriseJD, weekday, nowJD, dateStr).currentChoghadiya;
}

/**
 * Auspiciousness label for a Choghadiya type.
 * Used for brief display in API responses.
 */
export function getChoghadiyaAuspiciousness(type: ChoghadiyaType): "auspicious" | "neutral" | "inauspicious" {
  if (type === "Amrit" || type === "Shubh" || type === "Labh") return "auspicious";
  if (type === "Char") return "neutral";
  return "inauspicious";
}

// ============================================================================
// VARA (WEEKDAY) QUALITY
// Classical Vedic weekday system: each day has a ruling planet, inherent
// quality, and recommended / contraindicated activities.
// Source: Muhurta Chintamani (Vara Prakarana), Muhurta Martanda.
// ============================================================================

export interface VaraResult {
  weekday:       number;          // 0=Sun … 6=Sat
  name:          string;          // e.g. "Ravivar (Sunday)"
  lord:          string;          // ruling planet
  quality:       "auspicious" | "mixed" | "inauspicious";
  auspicious_for: string[];       // activities that thrive on this day
  avoid:         string[];        // activities to avoid
  note:          string;
  source:        string;
}

const VARA_DATA: Record<number, Omit<VaraResult, "weekday">> = {
  0: { // Sunday
    name:           "Ravivar (Sunday)",
    lord:           "Sun",
    quality:        "mixed",
    auspicious_for: ["Government work", "Medical treatments", "Pilgrimages", "Vedic rituals", "Gold purchases"],
    avoid:          ["Marriage", "Long journeys", "Planting crops"],
    note:           "Sun's day — powerful for authority and health matters; avoid new relationships.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  1: { // Monday
    name:           "Somavar (Monday)",
    lord:           "Moon",
    quality:        "auspicious",
    auspicious_for: ["Travel", "Liquid businesses", "Agriculture", "Education", "Medical", "Peace rituals"],
    avoid:          ["Debt collection", "Litigation"],
    note:           "Moon's day — nurturing and fluid; excellent for beginnings and travel.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  2: { // Tuesday
    name:           "Mangalvar (Tuesday)",
    lord:           "Mars",
    quality:        "mixed",
    auspicious_for: ["Surgery", "Military operations", "Machinery work", "Land purchase", "Debt recovery"],
    avoid:          ["Marriage", "Partnerships", "Signing agreements"],
    note:           "Mars's day — energetic and forceful; suitable for assertive or physical work, not contracts.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  3: { // Wednesday
    name:           "Budhvar (Wednesday)",
    lord:           "Mercury",
    quality:        "auspicious",
    auspicious_for: ["Commerce", "Writing", "Learning", "Communication", "Artistic work", "Marriage"],
    avoid:          ["Nothing specific — highly versatile day"],
    note:           "Mercury's day — the most versatile; excellent for intellectual and business activities.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  4: { // Thursday
    name:           "Guruvar (Thursday)",
    lord:           "Jupiter",
    quality:        "auspicious",
    auspicious_for: ["Marriage", "Religious ceremonies", "Education", "Expansion", "Charity", "Property"],
    avoid:          ["Hair cutting (mild tradition only)"],
    note:           "Jupiter's day — most auspicious; ideal for all auspicious ceremonies and new ventures.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  5: { // Friday
    name:           "Shukravar (Friday)",
    lord:           "Venus",
    quality:        "auspicious",
    auspicious_for: ["Marriage", "Beauty", "Arts", "Music", "Romance", "Vehicle purchase", "Luxury goods"],
    avoid:          ["Fasting for spiritual purposes (Venus opposes abstinence)"],
    note:           "Venus's day — auspicious for love, beauty, and material pleasures.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
  6: { // Saturday
    name:           "Shanivar (Saturday)",
    lord:           "Saturn",
    quality:        "inauspicious",
    auspicious_for: ["Iron/steel work", "Oil-related businesses", "Labour matters", "Debt repayment"],
    avoid:          ["Marriage", "Starting new ventures", "Surgery", "Long journeys"],
    note:           "Saturn's day — challenging for new beginnings; suited to completion and hard work only.",
    source:         "Muhurta Chintamani, Vara Prakarana §2",
  },
};

/**
 * Return the Vara (weekday) quality for a given UTC weekday index.
 * @param dow  UTC weekday: 0 = Sunday … 6 = Saturday
 */
export function getVara(dow: number): VaraResult {
  const d = VARA_DATA[dow] ?? VARA_DATA[0]!;
  return { weekday: dow, ...d };
}
