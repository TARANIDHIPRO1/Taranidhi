// Professional Muhurta Scoring Engine
// Dual-layer architecture: Universal (40%) + Personal/Kundali (60%)
//
// SPECIFICATION: MUHURTA_PROFESSIONAL_SPECIFICATION.md
// SOURCE: Muhurta Chintamani, Dharmasindhu, Karma Vipak Samhita
//
// Layer 1 (Universal): No kundali needed, ~220 base points across all criteria
// Layer 2 (Personal): Kundali-based adjustments (Tara, Dasha, Gochar, Ashtakwarga)
//
// This engine is category-agnostic: same criteria, different weights by purpose.

import { analyzeGochar, gocharToAdjustmentValue } from "./gochar";

export type ProfessionalCategory =
  | "sampatti-bhumi-kharid"
  | "sampatti-bhumi-puja"
  | "sampatti-griha-pravesh"
  | "sampatti-registry"
  | "sampatti-construction-start"
  | "sampatti-interior-work"
  | "sampatti-office-shop-start"
  | "sampatti-flat-booking"
  | "vyapar-dukan-khol"
  | "vyapar-naya-vyapar"
  | "vyapar-ecommerce-start"
  | "vyapar-partnership-start"
  | "vyapar-trade-agreement"
  | "vyapar-wholesale-start"
  | "vyapar-expansion"
  | "vyapar-franchise-license"
  | "dhan-sona-kharid"
  | "dhan-bank-account"
  | "dhan-loan-lena"
  | "dhan-loan-dana"
  | "dhan-stock-mutual"
  | "dhan-share-trading"
  | "dhan-insurance"
  | "dhan-cryptocurrency"
  | "dhan-property-tax"
  | "dhan-salary-negotiation"
  | "career-govt-job"
  | "career-interview"
  | "career-promotion"
  | "career-resignation"
  | "career-teaching-start"
  | "career-admin-start"
  | "career-tech-job"
  | "career-promotion-interview"
  | "career-relocation-for-job"
  | "career-freelance-start"
  | "vivah-engagement"
  | "vivah-mehendi"
  | "vivah-wedding-day"
  | "vivah-vivah-muhurta"
  | "vivah-reception"
  | "vivah-honeymoon-start"
  | "vivah-wedding-agreement"
  | "vivah-first-night"
  | "samjhauta-kundali-milan"
  | "samjhauta-partnership-deed"
  | "samjhauta-sale-deed"
  | "samjhauta-rental-agreement"
  | "samjhauta-employment-contract"
  | "samjhauta-loan-agreement"
  | "samjhauta-will-signing"
  | "samjhauta-power-of-attorney"
  | "samjhauta-insurance-policy"
  | "samjhauta-shareholders-pact"
  | "chikitsa-surgery"
  | "chikitsa-hospital-admission"
  | "chikitsa-medicine-start"
  | "chikitsa-doctor-appointment"
  | "chikitsa-chemotherapy"
  | "chikitsa-physiotherapy"
  | "chikitsa-vaccination"
  | "chikitsa-dental-work"
  | "chikitsa-ayurvedic-treatment";

export interface UniversalCriteria {
  abhijitMuhurta: { active: boolean; points: number; note: string };
  vijayaMuhurta: { active: boolean; points: number; note: string };
  brahmaMuhurta: { active: boolean; points: number; note: string };
  sarvarthaSiddhi: { active: boolean; points: number; note: string };
  guruRaviPushya: { active: boolean; points: number; note: string };
  pushkaraNavamansha: { active: boolean; points: number; note: string };
  auspiciousTithi: { active: boolean; points: number; note: string };
  auspiciousNakshatra: { active: boolean; points: number; note: string };
  noRahuKaal: { active: boolean; points: number; note: string };
  noYamghanda: { active: boolean; points: number; note: string };
  noGulikaKaal: { active: boolean; points: number; note: string };
  horaMatch: { active: boolean; points: number; note: string };
  noDurmuhurta: { active: boolean; points: number; note: string };
  inauspiciousTithi: { active: boolean; points: number; note: string };
  vishtiKarana: { active: boolean; points: number; note: string };
  panchakaDosha: { active: boolean; points: number; note: string };
}

export interface PersonalAdjustment {
  taraAdjustment: { value: number; reason: string };
  dashaAdjustment: { value: number; reason: string };
  gocharAdjustment: { value: number; reason: string };
  houseLordAvastha: { value: number; reason: string };
  ashtakwargaBindu: { value: number; reason: string };
  navamshaDivisional: { value: number; reason: string };
  totalPersonalAdjustment: number;
}

export interface ProfessionalMuhurtaResult {
  category: ProfessionalCategory;
  categoryDomain: string; // sampatti, vyapar, dhan, etc
  categoryName: string; // Human-readable name
  queryDate: string; // ISO date of query
  location: { lat: number; lon: number };

  // Layer 1: Universal scoring
  universalScore: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    criteria: UniversalCriteria;
  };

  // Layer 2: Personal scoring (if kundali provided)
  personalAdjustment: PersonalAdjustment | null;

  // Combined result
  finalScore: number; // 0-100
  verdict: string; // Excellent / Good / Acceptable / Caution / Poor / Avoid
  verdictEmoji: string; // 🟢 🟡 🔴 etc
  recommendation: string; // Action text

  // Transparency
  methodology: {
    universalWeight: number; // 40%
    personalWeight: number; // 60%
    formula: string;
  };
}

export interface UniversalParams {
  activeHora: string | null; // Planet lord name or null
  currentNakIndex: number; // 0-26
  currentTithi: number | null; // 1-30 or null
  inRahuKaal: boolean;
  inYamghanda?: boolean;
  inGulikaKaal?: boolean;
  inDurmuhurta?: boolean;
  inVishtiKarana?: boolean;
  panchakaActive?: boolean;
  inAuspiciousTithi?: boolean;
  inAuspiciousNakshatra?: boolean;
}

export interface PersonalParams {
  kundaliId: number | null;
  janmaNakIndex: number | null;
  taraNumber: number | null; // 1-9
  taraBeneficence: "benefic" | "neutral" | "malefic" | null;
  mahadashLord: string | null;
  antardashLord: string | null;
  natalMoonRashi: number | null;
  currentMoonRashi: number | null;
  /** Transit rashis (0–11) for each classical planet at query time.
   *  Supply as many as available; missing planets are skipped in Gochar scoring.
   *  Source: calculatePlanetaryPositions() → Math.floor(longitude / 30)
   *  Minimum required: currentMoonRashi (backward compat); fuller data = richer score. */
  transitPlanetRashis?: Partial<Record<"Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn", number>>;
  ashtakwargaBindu: number | null; // 0-8
  navamshaHouseLord: string | null;
}

// Nakshatra names (index 0-26) -- copied from astro.ts to avoid circular import.
// Keep in sync with astro.ts NAKSHATRA_NAMES array.
const NAKSHATRA_NAMES_LOCAL = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

// Inauspicious tithis per Muhurta Chintamani (Rikta: 4, 9, 14; Amavasya: 30; Chaturdashi: 14)
// Classical sources: Dharmasindhu, Muhurta Chintamani
const INAUSPICIOUS_TITHIS = new Set([4, 8, 9, 14, 30]);

// Category definitions with house associations
const CATEGORY_DEFS: Record<
  ProfessionalCategory,
  {
    domain: string;
    name: string;
    primaryHouse: number; // 1-12
    planet: string; // Governing planet
    beneficHora: string[];
    beneficNakshatra: string[];
    beneficTithi: number[];
  }
> = {
  "sampatti-bhumi-kharid": {
    domain: "Sampatti",
    name: "Land Purchase",
    primaryHouse: 4,
    planet: "Jupiter",
    beneficHora: ["Jupiter", "Venus"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadra", "Shravana", "Anuradha", "Pushya"],
    beneficTithi: [2, 3, 5, 7, 10, 11, 13],
  },
  "sampatti-bhumi-puja": {
    domain: "Sampatti",
    name: "Foundation Ceremony",
    primaryHouse: 4,
    planet: "Jupiter",
    beneficHora: ["Jupiter", "Venus"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadra", "Shravana"],
    beneficTithi: [2, 5, 7, 11],
  },
  "sampatti-griha-pravesh": {
    domain: "Sampatti",
    name: "House Entry / Inauguration",
    primaryHouse: 4,
    planet: "Venus",
    beneficHora: ["Venus", "Moon"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadra"],
    beneficTithi: [2, 5, 7, 11],
  },
  "sampatti-registry": {
    domain: "Sampatti",
    name: "Property Deed / Registry",
    primaryHouse: 4,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Punarvasu", "Hasta", "Anuradha"],
    beneficTithi: [2, 3, 5, 7],
  },
  "sampatti-construction-start": {
    domain: "Sampatti",
    name: "Breaking Ground / Construction",
    primaryHouse: 4,
    planet: "Mars",
    beneficHora: ["Mars"],
    beneficNakshatra: ["Rohini", "Ashwini", "Krittika"],
    beneficTithi: [2],
  },
  "sampatti-interior-work": {
    domain: "Sampatti",
    name: "Interior Work / Renovation",
    primaryHouse: 4,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha"],
    beneficTithi: [2, 5, 7],
  },
  "sampatti-office-shop-start": {
    domain: "Sampatti",
    name: "Office / Shop Purchase",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Hastā", "Chitra", "Swati"],
    beneficTithi: [2, 3, 5, 7],
  },
  "sampatti-flat-booking": {
    domain: "Sampatti",
    name: "Flat Booking / Advance",
    primaryHouse: 4,
    planet: "Jupiter",
    beneficHora: ["Jupiter", "Venus"],
    beneficNakshatra: ["Rohini", "Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },

  // VYAPAR (Business)
  "vyapar-dukan-khol": {
    domain: "Vyapar",
    name: "Shop Opening",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta", "Shravana", "Punarvasu"],
    beneficTithi: [2, 3, 5, 7],
  },
  "vyapar-naya-vyapar": {
    domain: "Vyapar",
    name: "New Business Launch",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Punarvasu", "Hasta", "Shravana"],
    beneficTithi: [2, 3, 5, 7],
  },
  "vyapar-ecommerce-start": {
    domain: "Vyapar",
    name: "E-commerce Business",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta", "Swati"],
    beneficTithi: [2, 5],
  },
  "vyapar-partnership-start": {
    domain: "Vyapar",
    name: "Business Partnership",
    primaryHouse: 7,
    planet: "Mercury",
    beneficHora: ["Mercury", "Venus"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "vyapar-trade-agreement": {
    domain: "Vyapar",
    name: "Trade / Import Export",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Punarvasu", "Hasta"],
    beneficTithi: [2, 5],
  },
  "vyapar-wholesale-start": {
    domain: "Vyapar",
    name: "Wholesale Business",
    primaryHouse: 10,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Rohini", "Punarvasu", "Shravana"],
    beneficTithi: [2, 3, 5, 7],
  },
  "vyapar-expansion": {
    domain: "Vyapar",
    name: "Business Expansion",
    primaryHouse: 10,
    planet: "Jupiter",
    beneficHora: ["Jupiter", "Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Shravana"],
    beneficTithi: [2, 5],
  },
  "vyapar-franchise-license": {
    domain: "Vyapar",
    name: "Franchise Agreement",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta"],
    beneficTithi: [2],
  },

  // DHAN (Finance) — Simplified for space
  "dhan-sona-kharid": {
    domain: "Dhan",
    name: "Gold / Jewelry Purchase",
    primaryHouse: 2,
    planet: "Venus",
    beneficHora: ["Venus", "Jupiter"],
    beneficNakshatra: ["Rohini", "Pushya", "Shravana", "Hasta"],
    beneficTithi: [2, 5, 7],
  },
  "dhan-bank-account": {
    domain: "Dhan",
    name: "Bank Account Opening",
    primaryHouse: 2,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "dhan-loan-lena": {
    domain: "Dhan",
    name: "Taking Loan",
    primaryHouse: 2,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Punarvasu", "Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "dhan-loan-dana": {
    domain: "Dhan",
    name: "Giving Loan",
    primaryHouse: 2,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "dhan-stock-mutual": {
    domain: "Dhan",
    name: "Stock / Mutual Fund",
    primaryHouse: 11,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Hasta", "Shravana"],
    beneficTithi: [2, 5],
  },
  "dhan-share-trading": {
    domain: "Dhan",
    name: "Share Trading",
    primaryHouse: 11,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 5],
  },
  "dhan-insurance": {
    domain: "Dhan",
    name: "Insurance Policy",
    primaryHouse: 2,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha", "Shravana"],
    beneficTithi: [2, 3, 5, 7],
  },
  "dhan-cryptocurrency": {
    domain: "Dhan",
    name: "Cryptocurrency Investment",
    primaryHouse: 11,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 5],
  },
  "dhan-property-tax": {
    domain: "Dhan",
    name: "Property Tax Payment",
    primaryHouse: 2,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha"],
    beneficTithi: [2, 3, 5, 7],
  },
  "dhan-salary-negotiation": {
    domain: "Dhan",
    name: "Salary Negotiation",
    primaryHouse: 2,
    planet: "Mercury",
    beneficHora: ["Mercury", "Jupiter"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 5],
  },

  // CAREER — Simplified
  "career-govt-job": {
    domain: "Career",
    name: "Government Job Start",
    primaryHouse: 10,
    planet: "Sun",
    beneficHora: ["Sun"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Shravana"],
    beneficTithi: [2, 3, 5, 7],
  },
  "career-interview": {
    domain: "Career",
    name: "Job Interview",
    primaryHouse: 10,
    planet: "Sun",
    beneficHora: ["Sun", "Jupiter"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [3, 5],
  },
  "career-promotion": {
    domain: "Career",
    name: "Promotion / Raise",
    primaryHouse: 10,
    planet: "Sun",
    beneficHora: ["Sun", "Jupiter"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni", "Uttara Ashadha"],
    beneficTithi: [2, 5, 7],
  },
  "career-resignation": {
    domain: "Career",
    name: "Resignation",
    primaryHouse: 10,
    planet: "Rahu",
    beneficHora: [],
    beneficNakshatra: [],
    beneficTithi: [3, 6, 8, 9, 12, 14, 15],
  },
  "career-teaching-start": {
    domain: "Career",
    name: "Teaching Job",
    primaryHouse: 10,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Punarvasu", "Shravana", "Dhanishshtha"],
    beneficTithi: [2, 5, 7],
  },
  "career-admin-start": {
    domain: "Career",
    name: "Administrative Role",
    primaryHouse: 10,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Anuradha", "Jyeshtha", "Uttara Ashadha"],
    beneficTithi: [2],
  },
  "career-tech-job": {
    domain: "Career",
    name: "Tech Role Start",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta"],
    beneficTithi: [2, 5],
  },
  "career-promotion-interview": {
    domain: "Career",
    name: "Promotion Interview",
    primaryHouse: 10,
    planet: "Sun",
    beneficHora: ["Sun", "Jupiter"],
    beneficNakshatra: ["Rohini", "Uttara Phalguni"],
    beneficTithi: [3, 5],
  },
  "career-relocation-for-job": {
    domain: "Career",
    name: "Job Transfer / Relocation",
    primaryHouse: 3,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Punarvasu"],
    beneficTithi: [2, 5],
  },
  "career-freelance-start": {
    domain: "Career",
    name: "Freelance / Independent Work",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta"],
    beneficTithi: [2, 5, 7],
  },

  // VIVAH (Marriage) — Simplified
  "vivah-engagement": {
    domain: "Vivah",
    name: "Engagement",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha", "Swati"],
    beneficTithi: [2, 5, 7, 11],
  },
  "vivah-mehendi": {
    domain: "Vivah",
    name: "Mehendi Function",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus", "Moon"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [2, 5, 7],
  },
  "vivah-wedding-day": {
    domain: "Vivah",
    name: "Wedding Day",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha", "Swati"],
    beneficTithi: [2, 5, 7, 11],
  },
  "vivah-vivah-muhurta": {
    domain: "Vivah",
    name: "Wedding Muhurta (Precise)",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [2, 5, 7, 11],
  },
  "vivah-reception": {
    domain: "Vivah",
    name: "Wedding Reception",
    primaryHouse: 7,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Rohini", "Punarvasu", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "vivah-honeymoon-start": {
    domain: "Vivah",
    name: "Honeymoon Start",
    primaryHouse: 5,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [2, 5, 7],
  },
  "vivah-wedding-agreement": {
    domain: "Vivah",
    name: "Wedding Agreement",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta"],
    beneficTithi: [2, 5, 7],
  },
  "vivah-first-night": {
    domain: "Vivah",
    name: "First Night",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus", "Moon"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [5, 7, 11],
  },

  // SAMJHAUTA (Agreements) — Simplified
  "samjhauta-kundali-milan": {
    domain: "Samjhauta",
    name: "Horoscope Matching",
    primaryHouse: 7,
    planet: "Venus",
    beneficHora: ["Venus"],
    beneficNakshatra: ["Rohini", "Hasta", "Anuradha"],
    beneficTithi: [2, 5, 7],
  },
  "samjhauta-partnership-deed": {
    domain: "Samjhauta",
    name: "Partnership Deed",
    primaryHouse: 1,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-sale-deed": {
    domain: "Samjhauta",
    name: "Property Sale Deed",
    primaryHouse: 4,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-rental-agreement": {
    domain: "Samjhauta",
    name: "Rental / Tenancy",
    primaryHouse: 4,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-employment-contract": {
    domain: "Samjhauta",
    name: "Employment Contract",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury", "Sun"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-loan-agreement": {
    domain: "Samjhauta",
    name: "Loan Document",
    primaryHouse: 2,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Punarvasu", "Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "samjhauta-will-signing": {
    domain: "Samjhauta",
    name: "Will / Testament",
    primaryHouse: 8,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-power-of-attorney": {
    domain: "Samjhauta",
    name: "Power of Attorney",
    primaryHouse: 8,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-insurance-policy": {
    domain: "Samjhauta",
    name: "Insurance Policy",
    primaryHouse: 2,
    planet: "Saturn",
    beneficHora: ["Saturn"],
    beneficNakshatra: ["Pushya", "Anuradha"],
    beneficTithi: [2, 3, 5, 7],
  },
  "samjhauta-shareholders-pact": {
    domain: "Samjhauta",
    name: "Shareholder Agreement",
    primaryHouse: 10,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Mrigashira", "Hasta"],
    beneficTithi: [2, 3],
  },

  // CHIKITSA (Medical)
  "chikitsa-surgery": {
    domain: "Chikitsa",
    name: "Surgery",
    primaryHouse: 6,
    planet: "Moon",
    beneficHora: ["Moon", "Jupiter"],
    beneficNakshatra: ["Rohini", "Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-hospital-admission": {
    domain: "Chikitsa",
    name: "Hospital Admission",
    primaryHouse: 12,
    planet: "Moon",
    beneficHora: ["Moon"],
    beneficNakshatra: ["Rohini", "Pushya", "Hasta"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-medicine-start": {
    domain: "Chikitsa",
    name: "Medicine / Treatment",
    primaryHouse: 6,
    planet: "Jupiter",
    beneficHora: ["Jupiter", "Moon"],
    beneficNakshatra: ["Pushya", "Shravana", "Uttara Ashadha"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-doctor-appointment": {
    domain: "Chikitsa",
    name: "Doctor Consultation",
    primaryHouse: 6,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Punarvasu", "Pushya", "Shravana"],
    beneficTithi: [2, 3, 5, 7],
  },
  "chikitsa-chemotherapy": {
    domain: "Chikitsa",
    name: "Chemotherapy",
    primaryHouse: 6,
    planet: "Mars",
    beneficHora: ["Moon", "Jupiter"],
    beneficNakshatra: ["Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-physiotherapy": {
    domain: "Chikitsa",
    name: "Physiotherapy",
    primaryHouse: 6,
    planet: "Mars",
    beneficHora: ["Mars"],
    beneficNakshatra: ["Rohini", "Pushya", "Uttara Ashadha"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-vaccination": {
    domain: "Chikitsa",
    name: "Vaccination / Injection",
    primaryHouse: 6,
    planet: "Moon",
    beneficHora: ["Moon"],
    beneficNakshatra: ["Pushya", "Rohini", "Hasta"],
    beneficTithi: [2, 5, 7],
  },
  "chikitsa-dental-work": {
    domain: "Chikitsa",
    name: "Dental Procedure",
    primaryHouse: 6,
    planet: "Mercury",
    beneficHora: ["Mercury"],
    beneficNakshatra: ["Rohini", "Hasta", "Chitra"],
    beneficTithi: [2, 3, 5, 7],
  },
  "chikitsa-ayurvedic-treatment": {
    domain: "Chikitsa",
    name: "Ayurvedic Therapy",
    primaryHouse: 6,
    planet: "Jupiter",
    beneficHora: ["Jupiter"],
    beneficNakshatra: ["Punarvasu", "Pushya", "Shravana"],
    beneficTithi: [2, 5, 7],
  },
};

/**
 * Score universal criteria (Layer 1: 40% of final score)
 * Returns points earned out of ~220 maximum possible points
 */
export function scoreUniversalLayer(category: ProfessionalCategory, params: UniversalParams): UniversalCriteria {
  const def = CATEGORY_DEFS[category];

  // Tithi checks -- computed from currentTithi against benefic/inauspicious lists.
  // Bug fix: previously used params.inAuspiciousTithi which was always null (never set).
  const currentTithiName = params.currentTithi !== null ? `Tithi ${params.currentTithi}` : "unknown";
  const tithiAuspicious = params.currentTithi !== null && def.beneficTithi.includes(params.currentTithi);
  const tithiInauspicious = params.currentTithi !== null && INAUSPICIOUS_TITHIS.has(params.currentTithi);

  // Nakshatra check -- corrected.
  // Bug fix: previously checked `currentNakIndex >= 0` which is always true (0-26 are all valid).
  // Now correctly checks if the current nakshatra name is in the category's beneficNakshatra list.
  const currentNakName = params.currentNakIndex >= 0 && params.currentNakIndex < 27
    ? NAKSHATRA_NAMES_LOCAL[params.currentNakIndex]!
    : "";
  const nakAuspicious = currentNakName !== "" && def.beneficNakshatra.includes(currentNakName);

  const criteria: UniversalCriteria = {
    abhijitMuhurta: { active: false, points: 0, note: "Calculation pending (needs time-based window)" },
    vijayaMuhurta: { active: false, points: 0, note: "Calculation pending (needs time-based window)" },
    brahmaMuhurta: { active: false, points: 0, note: "Calculation pending (needs sunrise time)" },
    sarvarthaSiddhi: { active: false, points: 0, note: "Calculation pending (needs weekday×nakshatra table)" },
    guruRaviPushya: { active: false, points: 0, note: "Calculation pending (needs Pushya nakshatra check)" },
    pushkaraNavamansha: { active: false, points: 0, note: "Calculation pending (needs Navamsha division)" },
    auspiciousTithi: {
      active: tithiAuspicious,
      points: tithiAuspicious ? 15 : 0,
      note: tithiAuspicious
        ? `${currentTithiName} is auspicious for this category`
        : params.currentTithi !== null
          ? `${currentTithiName} is not in benefic list for this category`
          : "Tithi not calculated",
    },
    auspiciousNakshatra: {
      active: nakAuspicious,
      points: nakAuspicious ? 10 : 0,
      note: nakAuspicious
        ? `${currentNakName} is benefic for this category`
        : currentNakName !== ""
          ? `${currentNakName} is not in benefic list for this category`
          : "Nakshatra unknown",
    },
    noRahuKaal: { active: !params.inRahuKaal, points: params.inRahuKaal ? -15 : 15, note: params.inRahuKaal ? "Active Rahu Kaal" : "Clear of Rahu" },
    noYamghanda: { active: !(params.inYamghanda ?? false), points: params.inYamghanda ? -10 : 10, note: params.inYamghanda ? "Active Yamghanda" : "Clear of Yamghanda" },
    noGulikaKaal: { active: !(params.inGulikaKaal ?? false), points: params.inGulikaKaal ? -10 : 10, note: params.inGulikaKaal ? "Active Gulika" : "Clear of Gulika" },
    horaMatch: {
      active: params.activeHora !== null && def.beneficHora.includes(params.activeHora),
      points: params.activeHora !== null && def.beneficHora.includes(params.activeHora) ? 20 : 0,
      note: params.activeHora ? `${params.activeHora} Hora` : "No active hora",
    },
    noDurmuhurta: { active: !(params.inDurmuhurta ?? false), points: params.inDurmuhurta ? -10 : 10, note: params.inDurmuhurta ? "Durmuhurta active" : "Clear of Durmuhurta" },
    // Bug fix: previously fired whenever inAuspiciousTithi===false (which includes null === false → always false, but also
    // explicit false). Now correctly fires only when the tithi is in the classical inauspicious set.
    inauspiciousTithi: {
      active: tithiInauspicious,
      points: tithiInauspicious ? -30 : 0,
      note: tithiInauspicious
        ? `${currentTithiName} (Rikta/Amavasya) — classically inauspicious`
        : params.currentTithi !== null
          ? `${currentTithiName} is not an inauspicious tithi`
          : "Tithi not calculated",
    },
    vishtiKarana: { active: params.inVishtiKarana ?? false, points: params.inVishtiKarana ? -20 : 0, note: params.inVishtiKarana ? "Vishti Karana (Bhadra) active" : "No Vishti Karana" },
    panchakaDosha: { active: params.panchakaActive ?? false, points: params.panchakaActive ? -25 : 0, note: params.panchakaActive ? "Panchaka Dosha active" : "No Panchaka Dosha" },
  };

  // Placeholder for Abhijit, Vijaya, Brahma (would need time-based calculation)
  // Sarvartha Siddhi (would need weekday + nakshatra matching)
  // Guru/Ravi Pushya (would need specific date checks)
  // Pushkara Navamsha (would need detailed calculation)

  return criteria;
}

/**
 * Score personal/kundali layer (Layer 2: 60% of final score)
 * Returns adjustments from -50% to +50%
 */
export function scorePersonalLayer(params: PersonalParams): PersonalAdjustment {
  const adjustments: PersonalAdjustment = {
    taraAdjustment: { value: 0, reason: "No Tara data" },
    dashaAdjustment: { value: 0, reason: "No Dasha data" },
    gocharAdjustment: { value: 0, reason: "No Gochar data" },
    houseLordAvastha: { value: 0, reason: "No Avastha data" },
    ashtakwargaBindu: { value: 0, reason: "No Ashtakwarga data" },
    navamshaDivisional: { value: 0, reason: "No Navamsha data" },
    totalPersonalAdjustment: 0,
  };

  // Tara adjustment
  if (params.taraBeneficence !== null) {
    if (params.taraBeneficence === "benefic") {
      adjustments.taraAdjustment = { value: 40, reason: `Benefic Tara (${params.taraNumber})` };
    } else if (params.taraBeneficence === "neutral") {
      adjustments.taraAdjustment = { value: 0, reason: "Neutral Tara (context-dependent)" };
    } else {
      adjustments.taraAdjustment = { value: -40, reason: "Malefic Tara" };
    }
  }

  // Dasha adjustment
  if (params.mahadashLord !== null) {
    const beneficLords = ["Sun", "Moon", "Jupiter", "Venus", "Mercury"];
    if (beneficLords.includes(params.mahadashLord)) {
      adjustments.dashaAdjustment = { value: 20, reason: `Benefic Mahadasha: ${params.mahadashLord}` };
    } else {
      adjustments.dashaAdjustment = { value: -30, reason: `Challenging Mahadasha: ${params.mahadashLord}` };
    }
  }

  // ── Gochar (Transit) Analysis ──────────────────────────────────────────────
  // Real 7-planet classical Gochar scoring replacing the flat +20/-25 stub.
  // Source: Phaladeepika Ch.26 (Mantresvara) — favorable house tables per planet.
  // Special conditions: Sade Sati (Saturn 12/1/2), Guru Gochar (Jupiter 5/9),
  //   Ashtama Guru (Jupiter 8), Kantaka/Ashtama Shani (Saturn 4/8),
  //   Ashtama Chandra (Moon 8).
  // Partial Vedha: Jupiter in 11th gives relief during Sade Sati (Sarvartha Chintamani).
  if (params.natalMoonRashi !== null) {
    // Build transit rashi map: use explicit transitPlanetRashis if provided,
    // fall back to currentMoonRashi for backward compatibility.
    const transitMap: Record<string, number> = {};
    if (params.transitPlanetRashis) {
      Object.assign(transitMap, params.transitPlanetRashis);
    } else if (params.currentMoonRashi !== null) {
      // Legacy: only Moon transit was passed
      transitMap.Moon = params.currentMoonRashi;
    }
    if (params.currentMoonRashi !== null && !transitMap.Moon) {
      transitMap.Moon = params.currentMoonRashi;
    }

    if (Object.keys(transitMap).length > 0) {
      const gocharResult = analyzeGochar(params.natalMoonRashi, transitMap);
      const adjValue = gocharToAdjustmentValue(gocharResult);
      adjustments.gocharAdjustment = {
        value: adjValue,
        reason: gocharResult.summary,
      };
    }
  }

  // Ashtakwarga bindu (0-8, Chandrashtakavarga for current transit Moon sign)
  // Source: BPHS Ashtakavarga chapter. ≥5 bindus = strong transit; ≤2 = weak.
  if (params.ashtakwargaBindu !== null) {
    if (params.ashtakwargaBindu >= 5) {
      adjustments.ashtakwargaBindu = { value: 15, reason: `Strong Chandrashtakavarga (${params.ashtakwargaBindu}/8 bindus)` };
    } else if (params.ashtakwargaBindu <= 2) {
      adjustments.ashtakwargaBindu = { value: -15, reason: `Weak Chandrashtakavarga (${params.ashtakwargaBindu}/8 bindus)` };
    } else {
      adjustments.ashtakwargaBindu = { value: 0, reason: `Neutral Chandrashtakavarga (${params.ashtakwargaBindu}/8 bindus)` };
    }
  }

  // Navamsha (D9) lord of natal Moon -- benefic lord improves quality of dasha period.
  // Source: BPHS, Shodasavarga chapter; Jataka Parijata (Navamsha commentary).
  // Benefic lords: Jupiter (guru), Venus (shukra), Mercury (budh), Moon (chandra)
  // Malefic lords: Saturn (shani), Mars (mangal), Sun (ravi), Rahu, Ketu
  if (params.navamshaHouseLord !== null) {
    const navamshaBenefics = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
    const navamshaMalefics = new Set(["Saturn", "Mars", "Sun", "Rahu", "Ketu"]);
    if (navamshaBenefics.has(params.navamshaHouseLord)) {
      adjustments.navamshaDivisional = {
        value: 10,
        reason: `Natal Moon in benefic Navamsha (${params.navamshaHouseLord} lord)`,
      };
    } else if (navamshaMalefics.has(params.navamshaHouseLord)) {
      adjustments.navamshaDivisional = {
        value: -10,
        reason: `Natal Moon in malefic Navamsha (${params.navamshaHouseLord} lord)`,
      };
    }
  }

  adjustments.totalPersonalAdjustment =
    adjustments.taraAdjustment.value +
    adjustments.dashaAdjustment.value +
    adjustments.gocharAdjustment.value +
    adjustments.houseLordAvastha.value +
    adjustments.ashtakwargaBindu.value +
    adjustments.navamshaDivisional.value;

  return adjustments;
}

/**
 * Combine universal and personal scores into final 0-100 score
 * Formula: (UNIVERSAL × 0.4) + (PERSONAL × 0.6)
 */
export function calculateFinalScore(universalPercentage: number, personalAdjustment: number): { score: number; verdict: string; emoji: string } {
  // Personal adjustment is ±50%, so convert to 0-100 scale
  // Adjustment of +50 means add 50 to base 50 = 100
  // Adjustment of -50 means add -50 to base 50 = 0
  const personalScore = Math.max(0, Math.min(100, 50 + personalAdjustment));

  const finalScore = universalPercentage * 0.4 + personalScore * 0.6;

  let verdict: string;
  let emoji: string;

  if (finalScore >= 90) {
    verdict = "EXCELLENT — Proceed immediately";
    emoji = "🟢";
  } else if (finalScore >= 75) {
    verdict = "GOOD — Highly auspicious";
    emoji = "🟢";
  } else if (finalScore >= 60) {
    verdict = "ACCEPTABLE — Favorable but not perfect";
    emoji = "🟡";
  } else if (finalScore >= 40) {
    verdict = "CAUTION — Mixed factors";
    emoji = "🟠";
  } else if (finalScore >= 20) {
    verdict = "POOR — Avoid if possible";
    emoji = "🔴";
  } else {
    verdict = "AVOID — Inauspicious";
    emoji = "🔴";
  }

  return { score: Math.round(finalScore), verdict, emoji };
}

/**
 * Main scoring function: combines both layers
 */
export function scoreProfessionalMuhurta(
  category: ProfessionalCategory,
  universalParams: UniversalParams,
  personalParams: PersonalParams,
  queryDate: string,
  location: { lat: number; lon: number }
): ProfessionalMuhurtaResult {
  const categoryDef = CATEGORY_DEFS[category];
  const universal = scoreUniversalLayer(category, universalParams);
  const personal = personalParams.kundaliId !== null ? scorePersonalLayer(personalParams) : null;

  // Calculate universal score percentage
  const universalPoints = Object.values(universal).reduce((sum, c) => sum + (c.points > 0 ? c.points : 0), 0);
  const universalPercentage = (universalPoints / 220) * 100;

  // Calculate final score
  const personalAdjustment = personal ? personal.totalPersonalAdjustment : 0;
  const { score: finalScore, verdict, emoji } = calculateFinalScore(universalPercentage, personalAdjustment);

  return {
    category,
    categoryDomain: categoryDef.domain,
    categoryName: categoryDef.name,
    queryDate,
    location,
    universalScore: {
      totalPoints: universalPoints,
      maxPoints: 220,
      percentage: Math.round(universalPercentage),
      criteria: universal,
    },
    personalAdjustment: personal,
    finalScore,
    verdict,
    verdictEmoji: emoji,
    recommendation: `${emoji} ${verdict}. ${personalParams.kundaliId ? "Personal adjustments applied." : "Add kundali for personalized scoring."}`,
    methodology: {
      universalWeight: 40,
      personalWeight: 60,
      formula: "(UNIVERSAL × 0.4) + (PERSONAL × 0.6)",
    },
  };
}
