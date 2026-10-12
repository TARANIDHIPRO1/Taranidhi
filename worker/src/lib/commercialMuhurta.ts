/**
 * COMMERCIAL MUHURTA RULES — All 15 Activities + Marriage
 *
 * Classical Verification: TARANIDHI_Classical_Muhurta_Research_eBook (2026-10-12)
 * Sources: Muhurta Chintamani, Brihat Parashara Hora Shastra, Panchanga texts
 *
 * Every activity configured with:
 * - Preferred Tithis (Lunar days) with their tithi-class
 * - Forbidden Tithis (hard blocks)
 * - Preferred Varas (Weekdays) with their planetary rulers
 * - Forbidden Varas
 * - Preferred Nakshatras (27 stars) with classification
 * - Forbidden Nakshatras (malefic for this activity)
 * - Yoga preferences (27 classical Nitya Yogas)
 * - Hora preferences (24 planetary hours)
 * - Tarabala & Chandrabala requirements
 * - Hard blocks (Vyatipata, Vaidhriti, combustion, Rahu Kaal, Amavasya)
 * - Classical source verse references
 */

// Tithi Classes: 5 categories from Panchang
export enum TithiClass {
  NANDA = "Nanda",      // Tithis 1,6,11 — profitable, joyful
  BHADRA = "Bhadra",    // Tithis 2,7,12 — stable, peaceful
  JAYA = "Jaya",        // Tithis 3,8,13 — overcoming, competitive
  RIKTA = "Rikta",      // Tithis 4,9,14 — hollow, completing
  PURNA = "Purna",      // Tithis 5,10,15 — full, fruitful
}

export interface CommercialActivity {
  id: string;
  name: string;
  description: string;

  // Preferred Tithis (1-15 per Paksha)
  preferredTithis: number[];          // 1-15 (lunar days)
  forbiddenTithis: number[];          // Hard blocks
  tithiClassPreference: TithiClass[]; // 5-fold classification

  // Preferred Varas (0=Sunday, 1=Monday, ..., 6=Saturday)
  preferredVaras: number[];
  forbiddenVaras: number[];

  // Preferred Nakshatras (0=Ashwini, 1=Bharani, ..., 26=Revati)
  bestNakshatras: number[];           // Most auspicious
  neutralNakshatras: number[];        // Acceptable
  forbiddenNakshatras: number[];      // Avoid (Ganda Moola, malefic)

  // Yoga preferences (1-27 Nitya Yogas)
  preferredYogas: number[];           // Auspicious combinations
  forbiddenYogas: number[];           // Vyatipata (17), Vaidhriti (27)

  // Hora preferences (24 planetary hours)
  // Format: lord names ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]
  preferredHoraLords: string[];
  forbiddenHoraLords: string[];

  // Tarabala (Nakshatra relationship): 1-9 scale
  // Good: 2,4,6,8,9 | Neutral: 1 (Janma) | Bad: 3,5,7
  tarabalaMust: number[];             // Required (usually 2,4,6,8,9)
  tarabalaAvoid: number[];            // Forbidden (usually 3,5,7)

  // Chandrabala (Moon strength): Moon NOT in 6,8,12 from birth Rashi
  requireStrongChandrabala: boolean;

  // Hard blocks (must be checked before any other criteria)
  hardBlocks: {
    vyatipata: boolean;               // Yoga 17 — burn it
    vaidhriti: boolean;               // Yoga 27 — curse
    amavasya: boolean;                // New Moon — darkness
    rahuKaal: boolean;                // Kaal Sarpa Yoga
    combustion: {
      venus: boolean;                 // Especially for marriage/romance
      jupiter: boolean;               // Especially for marriage/growth
    };
  };

  // Classical source citations
  source: {
    verse: string;
    text: string;                     // Muhurta Chintamani, BPHS, etc.
    verification: string;             // 2026-10-12 reference
  };
}

/**
 * SIDDHA TITHI DETECTION
 * Special tithi-vara combinations that become HIGHLY AUSPICIOUS
 * (can override minor doshas). Example: Saptami on Wednesday (Budha).
 *
 * Source: Muhurta Chintamani Verse 4 (Saptami classification)
 */
export function isSiddha(tithi: number, vara: number): boolean {
  // Saptami (7) on Wednesday (3=Budha) becomes SIDDHA
  if (tithi === 7 && vara === 3) return true;
  // Add more SIDDHA pairs as classical sources are verified
  return false;
}

/**
 * CHANDRABALA VALIDATION
 * Moon must be strong (NOT in 6, 8, 12 from birth Rashi)
 * Source: Muhurta Chintamani (Chandrabala section)
 */
export function validateChandrabala(moonRashi: number, janmaRashi: number): boolean {
  const offset = (moonRashi - janmaRashi + 12) % 12;
  return ![5, 7, 11].includes(offset); // Avoid 6th, 8th, 12th
}

/**
 * TARABALA SCORING (Nakshatra relationship)
 * Measures beneficence between Janma Nakshatra and questioned Nakshatra.
 * 9-point scale: 2,4,6,8,9=good | 1=neutral(Janma) | 3,5,7=bad
 *
 * Source: Muhurta Chintamani (Tara Prakarana)
 */
export function calculateTarabala(janmaNakIdx: number, questionNakIdx: number): number {
  const diff = (questionNakIdx - janmaNakIdx + 27) % 27;
  // Tara formula: position from Janma determines beneficence
  const taraPosition = Math.floor(diff / 3) + 1; // 1-9
  return Math.min(Math.max(taraPosition, 1), 9); // Clamp to 1-9
}

/**
 * DAGDHA TITHI-VARA YOGA DETECTION
 * Specific burnt (inauspicious) combinations to absolutely avoid.
 *
 * Source: Muhurta Chintamani Verses 26-27 (Panchami restrictions)
 */
export function isDagdhaTithiVara(tithi: number, vara: number): boolean {
  const dagdhaMap: Record<number, number[]> = {
    5: [1, 2],   // Panchami forbidden on Monday, Tuesday
    4: [2],      // Chaturthi forbidden on Tuesday
    14: [6],     // Chaturdashi forbidden on Saturday
  };
  return dagdhaMap[tithi]?.includes(vara) ?? false;
}

// ============================================================================
// ALL 15 COMMERCIAL ACTIVITIES + MARRIAGE (16 total)
// ============================================================================

export const COMMERCIAL_ACTIVITIES: Record<string, CommercialActivity> = {
  // 1. COMPANY REGISTRATION / BUSINESS LAUNCH
  company: {
    id: "company",
    name: "Company Registration",
    description: "Company incorporation, business registration, startup launch",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],        // Bhadra, Jaya, Purna primary
    forbiddenTithis: [4, 9, 14, 15],                  // Rikta (hollow), Amavasya
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA, TithiClass.PURNA],
    preferredVaras: [0, 4, 5],                        // Sun, Jupiter, Venus
    forbiddenVaras: [6],                              // Saturday(Saturn) weak for growth
    bestNakshatras: [7, 3, 16, 20, 12, 26, 11],       // Pushya, Rohini, Anuradha, Uttara Ashadha, Hasta, Revati, Uttara Phalguni
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],       // Krittika, Ardra, Ashlesha, Mula, Purva Ashadha, Purva Bhadrapada
    preferredYogas: [1, 2, 4, 6, 11, 12, 13, 14, 15], // Auspicious yogas
    forbiddenYogas: [17, 27, 23],                     // Vyatipata, Vaidhriti, Parigha
    preferredHoraLords: ["Jupiter", "Mercury", "Venus"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 1-50",
      text: "Muhurta Chintamani: Business launch on Bhadra/Jaya tithis with strong Jupiter hora",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 2. WEBSITE / DIGITAL LAUNCH
  website: {
    id: "website",
    name: "Website Launch",
    description: "Website launch, app deployment, digital platform go-live",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA, TithiClass.JAYA],
    preferredVaras: [3, 4, 5],                        // Mercury(tech), Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 4, 7, 12, 16, 20, 26],        // Rohini, Mrigashira, Pushya, Hasta, Anuradha, Uttara Ashadha, Revati
    neutralNakshatras: [1, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Mercury", "Jupiter", "Venus"], // Mercury=code/tech; Jupiter=expansion
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44, BPHS Ch.40",
      text: "Digital platforms require Mercury hora (intellectual dissemination, code) + supportive Nakshatra",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 3. CONTRACT SIGNING
  contract: {
    id: "contract",
    name: "Contract Signing",
    description: "Business contract, partnership agreement, major legal agreement",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA, TithiClass.PURNA],
    preferredVaras: [3, 4, 5],                        // Mercury(documents), Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 12, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Mercury", "Jupiter", "Venus"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 3-5 (Legal/Documents section)",
      text: "Contracts require Mercury (communication, binding terms) + stable Tithi+Vara",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 4. LEGAL FILING
  legal: {
    id: "legal",
    name: "Legal Filing",
    description: "Court filing, legal document submission, lawsuit initiation",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA],
    preferredVaras: [3, 4, 5],                        // Mercury(law), Jupiter(justice), Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 12, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Mercury", "Jupiter", "Sun"],  // Sun=law/authority
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 60 (Litigation section)",
      text: "Legal matters favor Mercury (documents), Jupiter (justice), with stable Bhadra/Jaya Tithis",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 5. MONEY / LOAN APPLICATION
  money: {
    id: "money",
    name: "Loan / Finance",
    description: "Loan application, financial transaction, borrowing",
    preferredTithis: [2, 5, 7, 10, 11, 13],           // Bhadra, Purna primary (Panchami conditional)
    forbiddenTithis: [4, 9, 14, 15],                  // Rikta, Amavasya
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [0, 4, 5],                        // Sun, Jupiter, Venus
    forbiddenVaras: [6],                              // Saturday(Saturn) weak
    bestNakshatras: [7, 3, 16, 20, 12, 26, 11],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 11, 12, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Mercury"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 26-27",
      text: "Lending/borrowing: Panchami (5) conditional — allowed except Wednesday (na cha budhe deyam). Avoid Dagdha combinations.",
      verification: "2026-10-12 TARANIDHI eBook — Panchami verified as Purna (fruitful), lending allowed with restrictions",
    },
  },

  // 6. PROPERTY PURCHASE / GRIHA PRAVESH
  property: {
    id: "property",
    name: "Property Purchase / Griha Pravesh",
    description: "Real estate purchase, property registration, housewarming, griha pravesh",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA, TithiClass.PURNA],
    preferredVaras: [0, 5],                           // Sun, Venus (Venus=property, comfort)
    forbiddenVaras: [6],
    bestNakshatras: [3, 12, 20, 26],                  // Rohini, Hasta, Uttara Ashadha, Uttara Bhadrapada (fixed stars for permanence)
    neutralNakshatras: [1, 4, 7, 13, 16, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Saturn"], // Saturn=property/land (BPHS)
    forbiddenHoraLords: ["Mars"],                    // Mars=destruction
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "BPHS Ch.40 (Property section)",
      text: "Property benefits from Fixed Nakshatras (Rohini, Hasta, Uttara Ashadha, Uttara Bhadrapada) + Saturn hora acceptable",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 7. MOVIE / FILM RELEASE
  movie: {
    id: "movie",
    name: "Movie Release",
    description: "Film/movie premiere, theatrical release, production launch",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA, TithiClass.JAYA],
    preferredVaras: [0, 5],                           // Sun(visibility), Venus(arts/creativity)
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 11, 12, 14, 16, 20, 26],   // Rohini, Pushya, Uttara Phalguni, Hasta, Chitra, Anuradha, Uttara Ashadha, Revati
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 12, 13, 14, 15],     // Saraswati Yoga for media
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Sun", "Venus", "Mercury"],  // Sun=visibility; Venus=arts; Mercury=media
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44-45 (Entertainment/Reach Yogas)",
      text: "Film releases: Saraswati Yoga + Chandra/Guru combinations + Sun hora for visibility",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 8. BRAND REBRANDING / LAUNCH
  brand: {
    id: "brand",
    name: "Brand / Rebranding",
    description: "Brand launch, rebranding campaign, logo introduction",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [0, 4, 5],                        // Sun, Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 11, 12, 14, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 12, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Sun", "Venus", "Mercury", "Jupiter"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44 (Reach/Publicity Yogas)",
      text: "Brand identity: Mercury + Jupiter + Venus combinations favor public reach",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 9. PRODUCT LAUNCH
  product: {
    id: "product",
    name: "Product Launch",
    description: "Product release, market launch, new offering introduction",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA, TithiClass.JAYA],
    preferredVaras: [4, 5],                           // Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [7, 3, 12, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Mercury"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44-45",
      text: "Product launches: Jupiter (expansion, commerce) + Venus (desire) + strong Nakshatra",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 10. PRESS RELEASE / MEDIA ANNOUNCEMENT
  press: {
    id: "press",
    name: "Press Release / Media",
    description: "Press conference, media announcement, public statement",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [0, 3, 4],                        // Sun(publicity), Mercury(media), Jupiter
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 12, 14, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 12, 13, 14, 15],     // Saraswati for communication
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Sun", "Mercury", "Jupiter"], // Sun=visibility; Mercury=communication
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44 (Reach Yogas)",
      text: "Media/press: Saraswati Yoga + Mercury hora for clear communication + public reach",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 11. POLITICAL CAMPAIGN / ELECTION
  political: {
    id: "political",
    name: "Political Campaign",
    description: "Election campaign launch, political announcement, rally",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA],
    preferredVaras: [0, 4],                           // Sun(authority), Jupiter(law)
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 10, 12, 16, 20, 26],       // Rohini, Pushya, Purva Phalguni, Hasta, Anuradha, Uttara Ashadha, Revati
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 12, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Sun", "Jupiter"],           // Sun=state power; Jupiter=law/expansion
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44-45 (Political/State Yogas)",
      text: "Political campaigns: Sun hora (state power, authority) + Jupiter (law, expansion) + Jaya Tithi",
      verification: "2026-10-12 TARANIDHI eBook — Sun (5) hora added per Verse 44",
    },
  },

  // 12. IPO / PUBLIC OFFERING
  ipo: {
    id: "ipo",
    name: "IPO / Public Offering",
    description: "Initial public offering, share market launch, public offering",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [0, 4, 5],                        // Sun, Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [7, 3, 12, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Mercury"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44 (Financial/Growth Yogas)",
      text: "IPO/Public offering: Jupiter (expansion, gain) + Venus (wealth, desire) + strong Nakshatra",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 13. PARTNERSHIP / COLLABORATION
  partner: {
    id: "partner",
    name: "Partnership",
    description: "Business partnership, joint venture, collaboration agreement",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.JAYA, TithiClass.PURNA],
    preferredVaras: [3, 4, 5],                        // Mercury(contracts), Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 12, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Mercury", "Jupiter", "Venus"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 3-5 (Partnership section)",
      text: "Partnership: Mercury (binding agreement) + Jupiter (mutual benefit) + Venus (harmony)",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 14. LOAN / BORROWING
  loan: {
    id: "loan",
    name: "Loan / Borrowing",
    description: "Loan origination, debt initiation, borrowing",
    preferredTithis: [2, 5, 7, 10, 11, 13],           // Bhadra, Purna primary
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [0, 4, 5],
    forbiddenVaras: [6],
    bestNakshatras: [7, 3, 16, 20, 12, 26, 11],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Mercury"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 26-27",
      text: "Loan/Borrowing: Same as Lending (Panchami conditional), avoid Dagdha combinations",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 15. SOCIAL MEDIA / DIGITAL PRESENCE
  social: {
    id: "social",
    name: "Social Media Launch",
    description: "Social media campaign, social platform launch, influencer partnership",
    preferredTithis: [2, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 9, 14, 15],
    tithiClassPreference: [TithiClass.BHADRA, TithiClass.PURNA],
    preferredVaras: [3, 4, 5],                        // Mercury(communication), Jupiter, Venus
    forbiddenVaras: [6],
    bestNakshatras: [3, 7, 12, 14, 16, 20, 26],
    neutralNakshatras: [1, 4, 13, 23],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],
    preferredYogas: [1, 2, 4, 6, 12, 13, 14, 15],     // Saraswati for communication
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Mercury", "Jupiter", "Venus"],
    forbiddenHoraLords: ["Saturn", "Mars"],
    tarabalaMust: [2, 4, 6, 8, 9],
    tarabalaAvoid: [3, 5, 7],
    requireStrongChandrabala: true,
    hardBlocks: {
      vyatipata: true, vaidhriti: true, amavasya: true,
      rahuKaal: true,
      combustion: { venus: false, jupiter: false },
    },
    source: {
      verse: "MC 44 (Reach/Publicity Yogas)",
      text: "Social media: Mercury (communication, networks) + Saraswati Yoga (knowledge dissemination)",
      verification: "2026-10-12 TARANIDHI eBook",
    },
  },

  // 16. MARRIAGE / VIVAH (BONUS — Special rules apply)
  vivah: {
    id: "vivah",
    name: "Marriage / Vivah",
    description: "Marriage ceremony, wedding, union of partners",
    preferredTithis: [2, 3, 5, 7, 10, 11, 13],        // Shukla Paksha primary (Nanda, Bhadra, Jaya, Purna)
    forbiddenTithis: [4, 9, 14, 15],                  // Rikta, Amavasya absolute NO
    tithiClassPreference: [TithiClass.NANDA, TithiClass.BHADRA, TithiClass.JAYA, TithiClass.PURNA],
    preferredVaras: [0, 3, 4, 5],                     // Sun, Wed, Thu, Fri (Mon/Sat avoided)
    forbiddenVaras: [1, 6],                           // Monday(weak), Saturday(inauspicious)
    bestNakshatras: [3, 4, 5, 7, 12, 20, 26, 23, 10, 11, 16],  // Rohini, Mrigashira, Uttara Phalguni, Haste, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati
    neutralNakshatras: [1, 13],
    forbiddenNakshatras: [2, 6, 9, 18, 19, 25],       // Bharani, Ardra, Ashlesha, Mula, Purva Ashadha, Purva Bhadrapada
    preferredYogas: [1, 2, 4, 6, 11, 12, 13, 14, 15],
    forbiddenYogas: [17, 27],
    preferredHoraLords: ["Jupiter", "Venus", "Moon"],  // Venus=marriage; Jupiter=blessing
    forbiddenHoraLords: ["Saturn", "Mars"],           // Mars=conflict; Saturn=delay
    tarabalaMust: [2, 4, 6, 8, 9],                    // Strong Tarabala ESSENTIAL
    tarabalaAvoid: [3, 5, 7],                         // Malefic Tara STRICTLY AVOIDED
    requireStrongChandrabala: true,                   // Moon MUST be strong
    hardBlocks: {
      vyatipata: true,
      vaidhriti: true,
      amavasya: true,
      rahuKaal: true,
      combustion: { venus: true, jupiter: true },     // ABSOLUTE blocks
    },
    source: {
      verse: "MC Ch.5-6 (Vivah Prakarana), BPHS Ch.40",
      text: "Marriage: Shukla Paksha, Nanda/Bhadra/Jaya/Purna Tithis, best Nakshatras, strong Tarabala & Chandrabala, NEVER combust Venus/Jupiter, NEVER Vyatipata/Vaidhriti/Amavasya",
      verification: "2026-10-12 TARANIDHI eBook — Complete verification from research",
    },
  },
};

/**
 * QUICK REFERENCE: Best Nakshatras by Use Case
 * Source: TARANIDHI eBook Chapter 4
 */
export const NAKSHATRA_BEST_BY_USE = {
  overall: [7, 3, 12, 16, 20, 26, 11, 17],           // Pushya, Rohini, Hasta, Anuradha, Uttara Ashadha, Revati, Uttara Phalguni, Anuradha
  marriage: [3, 4, 5, 7, 12, 20, 26, 23, 10, 11, 16], // Rohini, Mrigashira, Uttara Phalguni, Haste, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati
  business: [7, 12, 1, 15, 17, 3],                   // Pushya, Hasta, Ashwini, Swati, Anuradha, Rohini
  property: [3, 12, 20, 26],                         // Rohini, Hasta, Uttara Ashadha, Uttara Bhadrapada (FIXED group for permanence)
  avoid_soft_starts: [1, 6, 9, 10, 20, 21, 25],      // Bharani, Ardra, Ashlesha, Magha, Purva Ashadha, Purva Bhadrapada, Jyeshtha, Mula
};

/**
 * CLASSICAL APPLICATION PRIORITY (Practical selection order)
 * Source: TARANIDHI eBook Chapter 5
 *
 * 1. Eliminate HARD BLOCKS (Vyatipata, Vaidhriti, combustion, Rahu Kaal, Amavasya)
 * 2. Check Tarabala & Chandrabala for native(s)
 * 3. Select supportive Nakshatra for activity type
 * 4. Prefer auspicious Yoga, Tithi, Vara
 * 5. Confirm Lagna strong, free from major afflictions
 * 6. Use Hora as final polish
 *
 * Note: Perfect muhurta is rare; choose best available window rather than postponing indefinitely.
 */
