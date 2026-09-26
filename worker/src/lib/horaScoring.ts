// HORA MATRIX -- the core scoring engine (TaraNidhi's USP).
// Originally ported from the TaraNidhi Floot prototype's helpers/horaScoring.tsx
// as a 3-layer implementation (Purpose, Functional-Nature, Tarabala-Gate).
// This file now adds a 4th and 5th layer: Chandrabala-Gate and Dasha-Gate.
// A 6th, "Lagna-Gate", is NOT added -- ARCHITECTURE.md Section 4 lists it as
// part of the eventual 6-layer matrix but never actually defines what it
// checks that Functional-Nature (already Lagna-based: Kendra/Trikona/
// Dusthana LORDSHIP from the Lagna) doesn't already cover. Rather than
// invent a distinct rule with no cited source -- exactly what
// ARCHITECTURE.md's Karyesh-Bala note warns against -- this is left
// explicitly unimplemented pending a clarification from the domain owner on
// what Lagna-Gate is meant to check beyond Functional-Nature. Still call
// this "5-layer", not "6-layer" or "complete", until that's resolved.
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

// Chandrabala-Gate -- ARCHITECTURE.md Section 4: rashi-count check, the
// transiting Moon's rashi counted from the natal Moon's rashi.
// 1,2,3,5,7,9,10,11 = present (favorable); 4,6,8,12 = absent.
// 8th position ("Ashtama Chandra") is the worst placement.
//
// NOT implemented: the documented exception -- "for women, marriage on
// one's own janma nakshatra is considered auspicious" (a narrow override of
// the general rule for a specific gender + specific purpose + specific
// nakshatra condition). This function always applies the general rule.
// Flagging rather than silently guessing how to encode that exception,
// since ARCHITECTURE.md gives no further detail on how it should interact
// with Chandrabala specifically (it's actually a Tarabala note in the
// source research, not stated as a Chandrabala exception -- do not conflate
// the two when this gets revisited).
const CHANDRABALA_PRESENT = new Set([1, 2, 3, 5, 7, 9, 10, 11]);

export function getChandrabalaGate(natalMoonRashi: number, currentMoonRashi: number) {
  const count = ((currentMoonRashi - natalMoonRashi + 12) % 12) + 1;
  const present = CHANDRABALA_PRESENT.has(count);
  const isAshtama = count === 8;
  let cap = 100;
  let note = "";
  if (present) {
    cap = 100;
    note = `Chandrabala present (position ${count}) -- favorable`;
  } else if (isAshtama) {
    cap = 40;
    note = "Ashtama Chandra (8th position) -- most unfavorable Chandrabala placement";
  } else {
    cap = 70;
    note = `Chandrabala absent (position ${count}) -- exercise caution`;
  }
  return { count, present, isAshtama, cap, note };
}

// Dasha-Gate -- ARCHITECTURE.md Section 4: "Dasha determines what is
// PROMISED; transit (Gochar, including Hora) can only trigger what the
// dasha framework already permits -- a favorable transit cannot produce a
// result the dasha doesn't support." The qualitative hierarchy itself is
// classical and well-documented. The SPECIFIC numeric bonus below is NOT --
// ARCHITECTURE.md Section 4 explicitly says a proposed numeric split
// ("30%/50%/20%") could not be found in any researched source, and that if
// one is used it "must be labeled explicitly as an OccultVIISION
// proprietary weighting in code comments, not presented as a classical
// rule." So: this IS an OccultVIISION proprietary weighting, not a
// classical formula. The classical part is only the qualitative direction
// (the active Hora's planet being the same as the running Mahadasha/
// Antardasha lord reinforces the promise; being unrelated does not).
export function getDashaGate(horaLord: string, mahaLord: string | null, antarLord: string | null) {
  if (antarLord && horaLord === antarLord) {
    return { relation: "antardasha_lord" as const, bonus: 12, note: "Hora lord = running Antardasha lord -- dasha reinforces this Hora (OccultVIISION proprietary weighting)" };
  }
  if (mahaLord && horaLord === mahaLord) {
    return { relation: "mahadasha_lord" as const, bonus: 6, note: "Hora lord = running Mahadasha lord -- dasha reinforces this Hora (OccultVIISION proprietary weighting)" };
  }
  return { relation: "unrelated" as const, bonus: 0, note: "Hora lord unrelated to running Dasha -- no dasha reinforcement" };
}

export interface ScoreResult {
  score: number;
  layers: { name: string; detail: string; impact: string }[];
  verdict: string;
}

export interface DashaContext {
  mahaLord: string | null;
  antarLord: string | null;
}

export interface ChandrabalaContext {
  natalMoonRashi: number;
  currentMoonRashi: number;
}

/**
 * Main scoring function -- combines Purpose + Functional-Nature + Tarabala +
 * Chandrabala + Dasha (5 of the eventual 6 layers -- see file header on why
 * Lagna-Gate is not included). dashaContext and chandrabalaContext are
 * optional so existing callers without that data still work (the
 * corresponding layer is then reported as unavailable, not silently
 * skipped) -- see routes/muhurta.ts for how they're supplied.
 */
export function scoreHora(
  planet: string,
  purpose: string,
  chart: LagnaOnlyChart | null,
  janmaNakIdx: number | null,
  currentNakIdx: number,
  currentNakDeg: number,
  dashaContext: DashaContext | null = null,
  chandrabalaContext: ChandrabalaContext | null = null
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

  if (dashaContext) {
    const dashaGate = getDashaGate(planet, dashaContext.mahaLord, dashaContext.antarLord);
    score += dashaGate.bonus;
    layers.push({ name: "Dasha Gate", detail: dashaGate.relation, impact: dashaGate.bonus > 0 ? `+${dashaGate.bonus}` : "0" });
  } else {
    layers.push({ name: "Dasha Gate", detail: "No Dasha data available", impact: "n/a" });
  }

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

  if (chandrabalaContext) {
    const cGate = getChandrabalaGate(chandrabalaContext.natalMoonRashi, chandrabalaContext.currentMoonRashi);
    if (score > cGate.cap) score = cGate.cap;
    layers.push({ name: "Chandrabala Gate", detail: `Position ${cGate.count}`, impact: cGate.note });
  } else {
    layers.push({
      name: "Chandrabala Gate",
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
