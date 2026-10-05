// ──────────────────────────────────────────────────────────────────────────────
// UPHORA (Sub-Hora) Engine
//
// SOURCE: Classical Muhurta Siddhanta + KP system (7-planet Vimshottari)
//
// SEQUENCE (same as Hora / Chaldean order):
//   Lord = CHRONO[(horaLordIndex + i) % 7]  for i = 0 to 6
//
// DURATION — PROPORTIONAL, NOT EQUAL (Naveen K. Rai correction, Oct 5 2026):
//   Each planet's Uphora is proportional to its Vimshottari period.
//   Classical 7-planet Vimshottari (excluding Rahu/Ketu):
//     Sun=6, Moon=10, Mars=7, Mercury=17, Jupiter=16, Venus=20, Saturn=19
//     Total = 95 units
//   Uphora duration for planet P = (VIMSHOTTARI[P] / 95) × HoraDuration
//
//   Example — within a Sun Hora (60 min):
//     Sun:     6/95 × 60 = 3m 47s
//     Venus:  20/95 × 60 = 12m 38s
//     Mercury:17/95 × 60 = 10m 44s
//     Moon:   10/95 × 60 =  6m 19s
//     Saturn: 19/95 × 60 = 12m 0s
//     Jupiter:16/95 × 60 = 10m 6s
//     Mars:    7/95 × 60 =  4m 25s
//     Total = 60 min ✓
//
// ⚠️  PREVIOUS (WRONG): HoraDuration / 7 (equal parts — kaalchakra_v15.html
//     also had this bug; reference corrected by Naveen 5 Oct 2026)
//
// CLASSICAL BASIS: Same Chaldean sequence as Hora (fastest→slowest apparent
// motion: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars).
// ──────────────────────────────────────────────────────────────────────────────

export type Planet = "Sun" | "Venus" | "Mercury" | "Moon" | "Saturn" | "Jupiter" | "Mars";

// Chaldean sequence — fastest to slowest apparent motion.
// ARCHITECTURE.md Section 4.2: CHRONO = [Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars]
export const CHALDEAN: Planet[] = [
  "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars",
];

// Vimshottari periods for the 7 classical planets (Rahu/Ketu excluded).
// These are the authoritative KP proportions for all sub-period calculations.
// Sun:6 + Moon:10 + Mars:7 + Mercury:17 + Jupiter:16 + Venus:20 + Saturn:19 = 95
export const VIMSHOTTARI_PERIODS: Record<Planet, number> = {
  Sun:     6,
  Moon:   10,
  Mars:    7,
  Mercury: 17,
  Jupiter: 16,
  Venus:   20,
  Saturn:  19,
} as const;

export const VIMSHOTTARI_TOTAL = 95; // sum of all 7 periods

export interface HoraPeriod {
  /** Hora lord (one of the 7 Chaldean planets) */
  lord: Planet;
  /** Index 0-23 within the 24-hora day */
  index: number;
  /** True if this hora falls in the night period (sunset → next sunrise) */
  isNight: boolean;
  /** Hora start time (local) */
  start: Date;
  /** Hora end time (local) */
  end: Date;
}

export interface UphoraPeriod {
  /** Sub-hora lord */
  lord: Planet;
  /** Position within the hora (0-indexed, 0–6) */
  position: number;
  /** Uphora start time */
  start: Date;
  /** Uphora end time */
  end: Date;
  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Build all 24 horas for a given day.
 *
 * @param weekday  0=Sunday … 6=Saturday (JS Date.getDay() value)
 * @param sunrise  Astronomical sunrise (Date, local observer)
 * @param sunset   Astronomical sunset  (Date, local observer)
 * @param nextSunrise Next day's sunrise (Date, local observer)
 * @returns Array of 24 HoraPeriod objects (12 day + 12 night)
 */
export function buildHoras(
  weekday: number,
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date
): HoraPeriod[] {
  // Day lord = first hora lord for that weekday
  // WEEKDAY_LORD = [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  // → [Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn]
  const WEEKDAY_LORD: Planet[] = [
    "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn",
  ];
  const dayLord = WEEKDAY_LORD[weekday]!;
  const startIdx = CHALDEAN.indexOf(dayLord);

  const srMs = sunrise.getTime();
  const ssMs = sunset.getTime();
  const nsrMs = nextSunrise.getTime();
  const dayDur = (ssMs - srMs) / 12;   // each day-hora duration
  const ngtDur = (nsrMs - ssMs) / 12;  // each night-hora duration

  return Array.from({ length: 24 }, (_, i) => {
    const isNight = i >= 12;
    const lord = CHALDEAN[(startIdx + i) % 7]!;
    const start = isNight
      ? new Date(ssMs + (i - 12) * ngtDur)
      : new Date(srMs + i * dayDur);
    const end = isNight
      ? new Date(ssMs + (i - 11) * ngtDur)
      : new Date(srMs + (i + 1) * dayDur);
    return { lord, index: i, isNight, start, end };
  });
}

/**
 * Build the 7 Uphoras (sub-horas) for a given hora period.
 *
 * SEQUENCE: Chaldean order starting from the hora lord.
 *   lord = CHALDEAN[(horaLordIndex + i) % 7]  for i = 0..6
 *
 * DURATION: Proportional to each planet's Vimshottari period (not equal).
 *   duration_i = (VIMSHOTTARI[lord_i] / 95) × HoraDuration
 *
 * This ensures each planet occupies its classical share of the Hora.
 * Muhurta Siddhanta: "ek second ki bhi galti nahi kar sakte" — exact timing.
 *
 * @param hora  A HoraPeriod (from buildHoras)
 * @returns     Array of 7 UphoraPeriod objects, durations proportional to Vimshottari
 */
export function buildUphoras(hora: HoraPeriod): UphoraPeriod[] {
  const base = CHALDEAN.indexOf(hora.lord);
  const totalMs = hora.end.getTime() - hora.start.getTime();

  // Compute proportional durations using Vimshottari ratios
  // Each planet's share = (its_period / 95) * totalMs
  // Use floating point internally for precision; boundaries are exact sums
  const uphoras: UphoraPeriod[] = [];
  let offsetMs = 0;

  for (let i = 0; i < 7; i++) {
    const lord = CHALDEAN[(base + i) % 7]!;
    const durationMs = (VIMSHOTTARI_PERIODS[lord] / VIMSHOTTARI_TOTAL) * totalMs;
    const start = new Date(hora.start.getTime() + offsetMs);
    // For the last uphora, force end = hora.end to avoid any floating-point drift
    const end = i === 6
      ? hora.end
      : new Date(hora.start.getTime() + offsetMs + durationMs);
    uphoras.push({ lord, position: i, start, end, durationMs });
    offsetMs += durationMs;
  }

  return uphoras;
}

/**
 * Find which hora is active at a given moment.
 *
 * @param horas  Full 24-hora array from buildHoras()
 * @param asOf   Query time (Date); defaults to now
 * @returns      The active HoraPeriod, or null if asOf is outside the 24-hora window
 */
export function getCurrentHora(horas: HoraPeriod[], asOf?: Date): HoraPeriod | null {
  const t = (asOf ?? new Date()).getTime();
  return horas.find(h => t >= h.start.getTime() && t < h.end.getTime()) ?? null;
}

/**
 * Find which uphora is active at a given moment within a hora.
 *
 * @param uphoras  Array of 7 UphoraPeriod from buildUphoras()
 * @param asOf     Query time (Date); defaults to now
 * @returns        The active UphoraPeriod, or null if outside this hora's window
 */
export function getCurrentUphora(uphoras: UphoraPeriod[], asOf?: Date): UphoraPeriod | null {
  const t = (asOf ?? new Date()).getTime();
  return uphoras.find(u => t >= u.start.getTime() && t < u.end.getTime()) ?? null;
}

/**
 * Convenience: get current hora + uphora in one call.
 *
 * @param weekday      0-6 (JS weekday)
 * @param sunrise      Today's sunrise
 * @param sunset       Today's sunset
 * @param nextSunrise  Tomorrow's sunrise
 * @param asOf         Query time (defaults to now)
 */
export function getCurrentHoraUphora(
  weekday: number,
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  asOf?: Date
): { hora: HoraPeriod | null; uphora: UphoraPeriod | null; allHoras: HoraPeriod[] } {
  const allHoras = buildHoras(weekday, sunrise, sunset, nextSunrise);
  const hora = getCurrentHora(allHoras, asOf);
  const uphora = hora ? getCurrentUphora(buildUphoras(hora), asOf) : null;
  return { hora, uphora, allHoras };
}
