/**
 * Vimshottari sub-period engine: Pratyantar (L3), Sookshma (L4), Prana (L5).
 *
 * Levels 1-2 are delegated to getCurrentDasha() so they are identical to the
 * existing behaviour by construction. Levels 3-5 subdivide the parent period
 * proportionally (child = DASHA_YEARS[child]/120 * parent duration), starting
 * from the parent's own lord and following DASHA_SEQ order. Boundaries are
 * half-open [start, end).
 */
import { DASHA_SEQ, DASHA_YEARS, getCurrentDasha } from "./astro";
import type { DashaPeriod, RealChart } from "./astro";

export type DashaLevel = "maha" | "antar" | "pratyantar" | "sookshma" | "prana";

export interface DashaChainEntry {
  level: DashaLevel;
  lord: string;
  start: Date;
  end: Date;
}

const LEVELS: DashaLevel[] = ["maha", "antar", "pratyantar", "sookshma", "prana"];
const TOTAL_YEARS = 120; // sum of DASHA_YEARS

/**
 * The 9 children of `parent`, in order, tiling it exactly. Boundaries are
 * computed from integer cumulative year-sums (no accumulated float drift),
 * rounded to whole ms; the last child's end is forced to parent.end.
 */
export function listSubPeriods(parent: DashaPeriod): DashaPeriod[] {
  const parentIdx = DASHA_SEQ.indexOf(parent.lord);
  if (parentIdx < 0) throw new Error(`Unknown dasha lord: ${parent.lord}`);
  const startMs = parent.start.getTime();
  const endMs = parent.end.getTime();
  const total = endMs - startMs;

  const out: DashaPeriod[] = [];
  let cumYears = 0;
  let prevMs = startMs;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQ[(parentIdx + i) % 9]!;
    cumYears += DASHA_YEARS[lord]!;
    const nextMs = i === 8 ? endMs : Math.round(startMs + (total * cumYears) / TOTAL_YEARS);
    out.push({ lord, start: new Date(prevMs), end: new Date(nextMs) });
    prevMs = nextMs;
  }
  return out;
}

/**
 * Chain of running periods (maha -> ... -> prana, up to `depth` levels,
 * clamped to 1..5) containing `asOf`. Returns null when asOf is outside the
 * ~120y cycle (same contract as getCurrentDasha).
 */
export function getDashaChain(
  chart: RealChart,
  asOf: Date = new Date(),
  depth = 5
): DashaChainEntry[] | null {
  const base = getCurrentDasha(chart, asOf);
  if (!base) return null;
  const d = Math.max(1, Math.min(5, Math.floor(Number.isFinite(depth) ? depth : 5)));

  const chain: DashaChainEntry[] = [{ level: "maha", ...base.maha }];
  if (d >= 2) chain.push({ level: "antar", ...base.antar });

  const t = asOf.getTime();
  let parent: DashaPeriod = base.antar;
  for (let lvl = 2; lvl < d; lvl++) {
    const child = listSubPeriods(parent).find(
      (c) => t >= c.start.getTime() && t < c.end.getTime()
    );
    // antar (from getCurrentDasha) contains t, children tile it exactly.
    if (!child) return null;
    chain.push({ level: LEVELS[lvl]!, ...child });
    parent = child;
  }
  return chain;
}
