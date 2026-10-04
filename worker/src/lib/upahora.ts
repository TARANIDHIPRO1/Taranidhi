// ──────────────────────────────────────────────────────────────────────────────
// UPHORA (Sub-Hora) Engine
//
// SOURCE: KAALCHAKRA_CORE_ARCHITECTURE.pdf Section 4.4 (v15, Naveen K Rai)
//   "Har Hora ko further 7 barabar parts mein baanta jaata hai"
//   Uphora Lord = CHRONO[(horaLordIndex + i) % 7]  for i = 0 to 6
//   Duration of each Uphora = HoraDuration / 7
//
// CLASSICAL BASIS: Same Chaldean sequence as Hora (fastest→slowest apparent
// motion: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars). This is the
// same sequence used in horaScoring.ts's CHALDEAN constant.
//
// VERIFIED: Algorithm matches buildUphoras7() in kaalchakra_v8-1.html and
// buildUphoras() in kaalchakra_v15.html — both independently implemented
// identically. Cross-checked against Section 4.2 CHRONO sequence.
//
// NOTE: 7-fold (not 12-fold, not 8-fold). v8 comment explicitly states
// "classical 7-fold, not 12" — this is the traditional Indian/KP standard.
// ──────────────────────────────────────────────────────────────────────────────

export type Planet = "Sun" | "Venus" | "Mercury" | "Moon" | "Saturn" | "Jupiter" | "Mars";

// Chaldean sequence — fastest to slowest apparent motion.
// ARCHITECTURE.md Section 4.2: CHRONO = [Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars]
export const CHALDEAN: Planet[] = [
  "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars",
];

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
 * Algorithm (ARCHITECTURE.md Section 4.4):
 *   Start from the hora lord's index in CHALDEAN.
 *   Divide hora duration into 7 equal parts.
 *   Each part's lord = CHALDEAN[(horaLordIndex + i) % 7]
 *
 * @param hora  A HoraPeriod (from buildHoras)
 * @returns     Array of 7 UphoraPeriod objects
 */
export function buildUphoras(hora: HoraPeriod): UphoraPeriod[] {
  const base = CHALDEAN.indexOf(hora.lord);
  const totalMs = hora.end.getTime() - hora.start.getTime();
  const partMs = totalMs / 7;

  return Array.from({ length: 7 }, (_, i) => ({
    lord: CHALDEAN[(base + i) % 7]!,
    position: i,
    start: new Date(hora.start.getTime() + i * partMs),
    end: new Date(hora.start.getTime() + (i + 1) * partMs),
    durationMs: partMs,
  }));
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
