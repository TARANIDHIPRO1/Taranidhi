// Upaya (remedies) catalogue -- PRIMARY-SOURCE ONLY.
// Source: Muhurta Chintamani (Hindi edition, Naveen's upload), Gocharaprakarana
// v.10-13, book pp.70-71 (PDF pp.79-80). Checked 2026-10-07.
// Offered as a PREMIUM-package feature. Do not add an entry without a book page cite.
// Entries are traditional practice, not guaranteed outcomes; clients see the source line.

export type UpayaTier = "premium";

export interface Upaya {
  id: string;
  appliesTo: string;       // what dosha/condition triggers it
  action: string;          // what to give / do
  source: string;
  tier: UpayaTier;
}

// Tara index (1..9 from birth star): 1 Janma 2 Sampat 3 Vipat 4 Kshema 5 Pratyari 6 Sadhaka 7 Vadha 8 Maitra 9 Atimaitra.
export const TARA_DOSHA_UPAYA: Record<number, Upaya> = {
  1: { id: "tara-janma", appliesTo: "Janma Tara (1st)", action: "Donate vegetables (shaka)", source: "MC Gochara v.13, pp.70-71", tier: "premium" },
  3: { id: "tara-vipat", appliesTo: "Vipat Tara (3rd)", action: "Donate jaggery (gud)", source: "MC Gochara v.13, pp.70-71", tier: "premium" },
  5: { id: "tara-pratyari", appliesTo: "Pratyari Tara (5th)", action: "Donate salt (lavan)", source: "MC Gochara v.13, pp.70-71", tier: "premium" },
  7: { id: "tara-vadha", appliesTo: "Vadha/Mrityu Tara (7th)", action: "Donate sesame (til) with gold", source: "MC Gochara v.13, pp.70-71", tier: "premium" },
};

// Planet-pleasing substitutes when the precious gem is unavailable (MC v.10-11, as read in the Hindi tika).
export const PLANET_SUBSTITUTE: Record<string, Upaya> = {
  Sun:     { id: "gem-sun", appliesTo: "Sun", action: "Wear coral (praval) as substitute", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Moon:    { id: "gem-moon", appliesTo: "Moon", action: "Wear silver (raupya)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Mars:    { id: "gem-mars", appliesTo: "Mars", action: "Wear coral (praval)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Mercury: { id: "gem-mercury", appliesTo: "Mercury", action: "Wear gold (suvarna)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Jupiter: { id: "gem-jupiter", appliesTo: "Jupiter", action: "Wear pearl (mukta)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Venus:   { id: "gem-venus", appliesTo: "Venus", action: "Wear silver (raupya)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Saturn:  { id: "gem-saturn", appliesTo: "Saturn", action: "Wear iron (loha)", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Rahu:    { id: "gem-rahu", appliesTo: "Rahu", action: "Wear lajavart", source: "MC Gochara v.10-11, p.70", tier: "premium" },
  Ketu:    { id: "gem-ketu", appliesTo: "Ketu", action: "Wear lajavart", source: "MC Gochara v.10-11, p.70", tier: "premium" },
};

/** Remedy for a Tara number (1..9); null when the tara has no remedy in MC. */
export function getTaraUpaya(taraNumber: number): Upaya | null {
  return TARA_DOSHA_UPAYA[taraNumber] ?? null;
}

import { calculateNavtara } from "./muhurta";

export interface TaraUpayaResult {
  tara: { position: number; name: string; cycle: number; effectiveQuality: string };
  upaya: Upaya | null;
  note: string;
}

/**
 * Remedy for the tara between a birth nakshatra and a day's nakshatra (0..26 each).
 * Book: Vipat/Pratyari/Vadha are wholly bad only in cycle 1; cycle 2 is partly bad; cycle 3 wholly good
 * (v.13), so cycle-3 gets no remedy. Janma carries its remedy in every cycle (v.13).
 */
export function getUpayaForTara(birthNakIdx: number, queryNakIdx: number): TaraUpayaResult {
  const t = calculateNavtara(birthNakIdx, queryNakIdx);
  const tara = { position: t.position, name: t.name, cycle: t.cycle, effectiveQuality: t.effectiveQuality };
  let upaya = getTaraUpaya(t.position);
  let note = upaya ? "Traditional remedy per Muhurta Chintamani." : "This tara needs no remedy.";
  if (upaya && t.cycle === 3 && t.position !== 1) {
    upaya = null;
    note = "Third cycle: this tara is wholly favourable (MC Gochara v.13); no remedy needed.";
  } else if (upaya && t.cycle === 2 && t.position !== 1) {
    note += " Second cycle: only part of the nakshatra is adverse; remedy advised if the Moon is in the adverse part.";
  }
  return { tara, upaya, note };
}

// PARIHARA (exemptions) from MC Shubhashubha v.42 (book p.20, PDF p.29) -- not remedies to perform.
export const PARIHARA_AFTER_MIDDAY = {
  items: ["Bhadra (Vishti)", "Mangalvara", "Vyatipata", "Vaidhriti", "Pratyari tara", "Janma nakshatra"],
  rule: "These become shubha after madhyahna (midday).",
  source: "MC Shubhashubha v.42, p.20",
  tier: "premium" as UpayaTier,
};

// Mula/Ashlesha births: MC prescribes shanti (propitiatory rite) without naming materials (v.52-54, pp.49-50).
export const MULA_SHANTI = {
  appliesTo: "Birth in Mula / Jyeshtha-end (abhuktamula) and Ashlesha",
  action: "Perform shanti; with shanti all four padas turn shubha",
  source: "MC Nakshatraprakarana v.54, p.50",
  tier: "premium" as UpayaTier,
};
