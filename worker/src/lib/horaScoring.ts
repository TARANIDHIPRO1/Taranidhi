// HORA MATRIX -- the core scoring engine (TaraNidhi's USP).
// Ported from the TaraNidhi Floot prototype's helpers/horaScoring.tsx,
// which is itself explicit that this is a 3-LAYER implementation (Purpose,
// Functional-Nature, Tarabala) and that Chandrabala-Gate, Lagna-Gate, and
// Dasha-Gate are NOT yet ported. Keeping that same honest labeling here --
// see ARCHITECTURE.md's own principle: don't claim more than what's
// verified. Do not present this as the "6-layer" engine until those three
// gates are actually added (tracked in the KP/Muhurta engine backlog).
//
// Server-side port, per ARCHITECTURE.md Section 8: scoring logic must never
// run client-side or be exposed to the client.

import { TARA_NAMES } from "./muhurta";

// Deliberately narrower than the full RealChart from lib/astro.ts -- this
// scoring function only ever needs the Lagna rashi, and callers that already
// have a saved kundali's lagna_rashi_idx (without rebuilding a full chart)
// shouldn't be forced to construct one just to satisfy this type.
export interface LagnaOnlyChart {
  lagnaRashi: number;
}

// Purpose-weight: how favourable each graha is for each purpose (0-10)
export const PURPOSE_WEIGHTS: Record<string, Record<string, number>> = {
  general: { Sun: 6, Moon: 6, Mars: 4, Mercury: 7, Jupiter: 9, Venus: 8, Saturn: 3, Rahu: 2, Ketu: 2 },
  business: { Sun: 7, Moon: 4, Mars: 5, Mercury: 9, Jupiter: 8, Venus: 6, Saturn: 4, Rahu: 5, Ketu: 2 },
  travel: { Sun: 5, Moon: 5, Mars: 4, Mercury: 8, Jupiter: 8, Venus: 7, Saturn: 3, Rahu: 3, Ketu: 2 },
  marriage: { Sun: 4, Moon: 7, Mars: 3, Mercury: 5, Jupiter: 9, Venus: 9, Saturn: 2, Rahu: 2, Ketu: 2 },
  finance: { Sun: 6, Moon: 5, Mars: 4, Mercury: 8, Jupiter: 9, Venus: 7, Saturn: 5, Rahu: 4, Ketu: 2 },
};

// Functional-nature by Lagna -- which planets are Kendra/Trikona
// (benefic-for-this-Lagna) vs Dusthana-lords (malefic-for-this-Lagna), per
// classical Lagna-based functional-benefic rules.
const KENDRA_TRIKONA_LORDS_BY_LAGNA: Record<number, string[]> = {
  0: ["Sun", "Mars", "Jupiter"], 1: ["Venus", "Saturn", "Mercury"],
  2: ["Mercury", "Venus"], 3: ["Moon", "Mars", "Jupiter"],
  4: ["Sun", "Mars", "Jupiter"], 5: ["Mercury", "Venus", "Saturn"],
  6: ["Venus", "Saturn", "Mercury"], 7: ["Mars", "Jupiter", "Moon"],
  8: ["Jupiter", "Mars", "Sun"], 9: ["Saturn", "Venus", "Mercury"],
  10: ["Saturn", "Venus", "Mercury"], 11: ["Jupiter", "Moon", "Mars"],
};
const DUSTHANA_LORDS_BY_LAGNA: Record<number, string[]> = {
  0: ["Mercury"], 1: ["Mars", "Jupiter"], 2: ["Mars", "Jupiter"], 3: ["Mercury", "Venus"],
  4: ["Saturn"], 5: ["Mars", "Jupiter"], 6: ["Mars", "Jupiter"], 7: ["Mercury", "Venus"],
  8: ["Mercury", "Venus"], 9: ["Moon"], 10: ["Sun", "Moon"], 11: ["Mercury", "Venus"],
};

export function getFunctionalNature(chart: LagnaOnlyChart | null, planet: string): { label: string; score: number } {
  if (!chart) return { label: "Neutral (no chart)", score: 0 };
  const lagna = chart.lagnaRashi;
  if (KENDRA_TRIKONA_LORDS_BY_LAGNA[lagna]?.includes(planet)) return { label: "Functional Benefic", score: 8 };
  if (DUSTHANA_LORDS_BY_LAGNA[lagna]?.includes(planet)) return { label: "Functional Malefic", score: -6 };
  return { label: "Neutral", score: 2 };
}

// Tarabala-Gate -- Avritti-graded (3rd-avritti = fully auspicious; 1st =
// fully caution; 2nd = degree-zone check). Proven grading from the
// standalone build.
export function getTarabalaGate(janmaNakIdx: number, currentNakIdx: number, currentNakDeg: number) {
  const count = ((currentNakIdx - janmaNakIdx + 27) % 27) + 1;
  const taraNum = ((count - 1) % 9) + 1;
  const avritti = Math.ceil(count / 9);
  const BENEFIC = new Set([2, 4, 6, 8, 9]);
  const good = BENEFIC.has(taraNum);
  let cap = 100;
  let note = "";
  if (avritti === 3) {
    cap = 100;
    note = "3rd Avritti -- most auspicious, no restriction";
  } else if (avritti === 1) {
    cap = good ? 85 : 55;
    note = "1st Avritti -- " + (good ? "auspicious" : "exercise caution");
  } else {
    const zoneWidth = 360 / 27 / 3;
    const zone = Math.floor(currentNakDeg / zoneWidth);
    if (!good && zone === 1) {
      cap = 55;
      note = "2nd Avritti, middle zone -- exercise caution";
    } else {
      cap = good ? 90 : 70;
      note = "2nd Avritti";
    }
  }
  return { taraNum, taraName: TARA_NAMES[taraNum]!, avritti, good, cap, note };
}

export interface ScoreResult {
  score: number;
  layers: { name: string; detail: string; impact: string }[];
  verdict: string;
}

/**
 * Main scoring function -- combines Purpose + Functional-Nature + Tarabala.
 * Chandrabala/Lagna-Gate/Dasha-Gate are NOT yet added -- see file header.
 * This is deliberately still called "3-layer" in comments and should not be
 * marketed as the complete Hora Matrix until those are built.
 */
export function scoreHora(
  planet: string,
  purpose: string,
  chart: LagnaOnlyChart | null,
  janmaNakIdx: number | null,
  currentNakIdx: number,
  currentNakDeg: number
): ScoreResult {
  const layers: ScoreResult["layers"] = [];
  const w = PURPOSE_WEIGHTS[purpose] ?? PURPOSE_WEIGHTS.general!;
  let score = 40 + (w[planet] ?? 5) * 5;
  layers.push({ name: "Purpose Weight", detail: `${planet} for ${purpose}`, impact: `${w[planet] ?? 5}/10` });

  const fn = getFunctionalNature(chart, planet);
  score += fn.score * 2;
  layers.push({
    name: "Functional Nature",
    detail: fn.label,
    impact: fn.score >= 0 ? `+${fn.score * 2}` : `${fn.score * 2}`,
  });

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (janmaNakIdx !== null) {
    const gate = getTarabalaGate(janmaNakIdx, currentNakIdx, currentNakDeg);
    if (score > gate.cap) score = gate.cap;
    layers.push({ name: "Tarabala Gate", detail: `${gate.taraName} (Avritti ${gate.avritti})`, impact: gate.note });
  } else {
    layers.push({
      name: "Tarabala Gate",
      detail: "No chart available",
      impact: "Save a kundali to personalize this score",
    });
  }

  const verdict =
    score >= 80
      ? "Excellent -- good time for important work"
      : score >= 65
        ? "Good -- fine for routine work"
        : score >= 45
          ? "Neutral -- avoid important work if possible"
          : "Caution -- do not start new/important work";

  return { score, layers, verdict };
}
