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
