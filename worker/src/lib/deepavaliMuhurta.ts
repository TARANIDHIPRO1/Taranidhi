// DEEPAVALI MAHURAT SCORING LAYER
// Extends professional muhurta with Deepavali-specific bonuses and messaging
//
// Source: DEEPAVALI_MAHURAT_VERIFICATION_AUDIT.md (verified against Muhurta Chintamani)
// Date: Oct 18, 2026
// Categories: 8 Deepavali life event categories
//
// Special Rules:
// 1. Guru Pushya (Gold): Thu + Pushya = +35 bonus (paramount rule)
// 2. Mercury Hora (Vehicle, Business, Education): +20 bonus
// 3. Amrit Kaal (Medical): Score capped at 60% if outside pre-dawn window
// 4. Saptami Rules: Removed from most categories, INCLUDED for legal court cases
// 5. Weak 6th Lord (Medical): Good for medical (disease already there), bad for others

import { NAKSHATRA_NAMES } from "./astro";

export type DeepavaliLabel =
  | "vehicle-purchase"
  | "gold-purchase"
  | "property-purchase"
  | "business-startup"
  | "family-events"
  | "education"
  | "legal"
  | "health";

export interface DeepavaliContext {
  label: DeepavaliLabel;
  displayName: string;
  icon: string;
  house: number;
  specialRules: string[];
  personalizations: string[];
}

export interface DeepavaliBonus {
  label: DeepavaliLabel;
  rule: string;
  bonusPoints: number;
  reason: string;
}

export interface DeepavaliResult {
  deepavaliLabel: DeepavaliLabel;
  context: DeepavaliContext;
  bonusesApplied: DeepavaliBonus[];
  totalBonusPoints: number;
  scoreCapped?: boolean;
  capReason?: string;
  deepavaliMessage: string;
  deepavaliRecommendation: string;
}

// Category mapping: Deepavali → professional category + special rules
const DEEPAVALI_CONTEXTS: Record<DeepavaliLabel, DeepavaliContext> = {
  "vehicle-purchase": {
    label: "vehicle-purchase",
    displayName: "Vehicle Purchase (Car/Motorcycle)",
    icon: "🚗",
    house: 10,
    specialRules: ["Mercury hora = +20", "10th lord strength matters", "No Saptami"],
    personalizations: ["10th lord avastha", "Mercury gochar position", "Dasha for career/commerce"],
  },
  "gold-purchase": {
    label: "gold-purchase",
    displayName: "Gold / Jewelry Purchase",
    icon: "💍",
    house: 2, // Can also be 11 (gains)
    specialRules: ["Guru Pushya (Thu+Pushya) = +35 BONUS", "Panchami tithi strong", "Jupiter hora = +20"],
    personalizations: ["2nd lord strength", "11th lord strength", "Jupiter position (wealth planet)"],
  },
  "property-purchase": {
    label: "property-purchase",
    displayName: "Property / Real Estate Purchase",
    icon: "🏠",
    house: 4,
    specialRules: ["Conservative tithi rules", "Venus hora favorable", "Jupiter expansion energy"],
    personalizations: ["4th lord avastha", "Venus gochar over 4th", "Dasha for property beneficial?"],
  },
  "business-startup": {
    label: "business-startup",
    displayName: "Business Startup / Shop Opening",
    icon: "🏢",
    house: 10,
    specialRules: ["Mercury hora = +20", "Wed/Thu/Fri auspicious", "Mercury commerce lord"],
    personalizations: ["10th lord strength", "Mercury gochar", "Career dasha beneficial?"],
  },
  "family-events": {
    label: "family-events",
    displayName: "Family Events (Wedding/Engagement)",
    icon: "👰",
    house: 7,
    specialRules: ["Venus hora = +20", "Shukla 2,5,7,11 primary", "Navamsha marriage strength"],
    personalizations: ["7th lord avastha", "Venus strength", "Navamsha D-9 analysis"],
  },
  "education": {
    label: "education",
    displayName: "Education / Learning Start",
    icon: "🎓",
    house: 10, // Can also be 5 (intellect)
    specialRules: ["Mercury hora = +20", "Intellectual learning days", "Jupiter wisdom"],
    personalizations: ["Mercury strength (intellect)", "Sun position (teaching authority)", "5th/10th lords"],
  },
  "legal": {
    label: "legal",
    displayName: "Legal / Contracts / Court",
    icon: "⚖️",
    house: 1, // Can also be 8 (secrets/longevity)
    specialRules: [
      "DUAL RULES: Agreements (conservative, no Saptami) vs Court (aggressive, Saptami included)",
      "Mercury hora = +20",
      "Saturn stability",
    ],
    personalizations: ["Mercury strength (contracts)", "8th lord longevity", "1st lord life"],
  },
  "health": {
    label: "health",
    displayName: "Health / Medical / Surgery",
    icon: "🏥",
    house: 6, // 12 is hospital
    specialRules: [
      "Amrit Kaal (pre-dawn 96-48 min) CRITICAL — score capped at 60% outside it",
      "Gulika Kaal MUST be avoided",
      "Moon hora = +20",
      "6th lord WEAK = GOOD (disease already there)",
    ],
    personalizations: ["Moon strength (body)", "6th lord weakness (good here!)", "12th house recovery"],
  },
};

/**
 * Apply Deepavali-specific bonuses to professional muhurta score
 * Called AFTER professional scoring; modifies finalScore based on special rules
 */
export function applyDeepavaliBonus(
  deepavaliLabel: DeepavaliLabel,
  baseScore: number,
  universalParams: {
    activeHora: string | null;
    currentNakIndex: number;
    currentTithi: number;
    sunrise: Date;
    dow: number;
  },
  amritKaalWindow?: { start: Date; end: Date }
): DeepavaliResult {
  const context = DEEPAVALI_CONTEXTS[deepavaliLabel];
  const bonuses: DeepavaliBonus[] = [];
  let totalBonus = 0;
  let scoreCapped = false;
  let capReason = "";

  // ────────────────────────────────────────────────────────────────────────
  // SPECIAL RULE: Guru Pushya for Gold Purchase
  // ────────────────────────────────────────────────────────────────────────
  if (deepavaliLabel === "gold-purchase") {
    // Pushya = nakshatra index 8 (0-26 system)
    // Thu = weekday 4
    if (universalParams.currentNakIndex === 8 && universalParams.dow === 4) {
      bonuses.push({
        label: "gold-purchase",
        rule: "Guru Pushya (Thursday + Pushya Nakshatra)",
        bonusPoints: 35,
        reason: "Most auspicious for gold purchase. Classical rule from Muhurta Chintamani.",
      });
      totalBonus += 35;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // SPECIAL RULE: Mercury Hora for Vehicle, Business, Education
  // ────────────────────────────────────────────────────────────────────────
  if (
    ["vehicle-purchase", "business-startup", "education"].includes(deepavaliLabel) &&
    universalParams.activeHora === "Mercury"
  ) {
    bonuses.push({
      label: deepavaliLabel,
      rule: "Mercury Hora (Commerce, Communication, Commerce)",
      bonusPoints: 20,
      reason: "Mercury is lord of commerce, commerce, communication. Active hora boosts commerce/learning activities.",
    });
    totalBonus += 20;
  }

  // ────────────────────────────────────────────────────────────────────────
  // SPECIAL RULE: Venus Hora for Family Events
  // ────────────────────────────────────────────────────────────────────────
  if (deepavaliLabel === "family-events" && universalParams.activeHora === "Venus") {
    bonuses.push({
      label: "family-events",
      rule: "Venus Hora (Marriage, Partnership, Relationships)",
      bonusPoints: 20,
      reason: "Venus is marriage goddess. Active hora is optimal for wedding/engagement timing.",
    });
    totalBonus += 20;
  }

  // ────────────────────────────────────────────────────────────────────────
  // SPECIAL RULE: Amrit Kaal Cap for Health/Medical
  // ────────────────────────────────────────────────────────────────────────
  let adjustedScore = baseScore + totalBonus;
  if (deepavaliLabel === "health" && amritKaalWindow) {
    const now = new Date();
    const inAmritKaal = now.getTime() >= amritKaalWindow.start.getTime() &&
                        now.getTime() < amritKaalWindow.end.getTime();

    if (!inAmritKaal) {
      scoreCapped = true;
      capReason = "NOT in Amrit Kaal (pre-dawn 96-48 min before sunrise). Medical procedures ideal in Amrit Kaal only. Score capped at 60%.";
      adjustedScore = Math.min(adjustedScore, 60);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Generate Deepavali-specific messages
  // ────────────────────────────────────────────────────────────────────────
  const deepavaliMessage = generateDeepavaliMessage(deepavaliLabel, adjustedScore, bonuses, scoreCapped);
  const deepavaliRecommendation = generateDeepavaliRecommendation(deepavaliLabel, adjustedScore);

  return {
    deepavaliLabel,
    context,
    bonusesApplied: bonuses,
    totalBonusPoints: totalBonus,
    scoreCapped,
    capReason,
    deepavaliMessage,
    deepavaliRecommendation,
  };
}

/**
 * Generate Deepavali-specific messaging based on category and score
 */
function generateDeepavaliMessage(
  label: DeepavaliLabel,
  score: number,
  bonuses: DeepavaliBonus[],
  capped: boolean
): string {
  let base = "";

  switch (label) {
    case "vehicle-purchase":
      if (score >= 80) {
        base = "🚗 **Excellent time to purchase your vehicle during Deepavali!** Mercury hora active + favorable astrological alignment.";
      } else if (score >= 60) {
        base = "🚗 **Good timing for vehicle purchase.** Acceptable alignment, though not perfect.";
      } else {
        base = "🚗 Vehicle purchase timing is below ideal. Consider alternative dates if possible.";
      }
      break;

    case "gold-purchase":
      if (bonuses.some((b) => b.bonusPoints === 35)) {
        base = "💍 **GURU PUSHYA MUHURTA! ⭐ Most auspicious for gold purchase.** This convergence is rare and paramount.";
      } else if (score >= 75) {
        base = "💍 **Excellent timing for gold purchase.** Strong planetary alignment for wealth acquisition.";
      } else if (score >= 60) {
        base = "💍 **Acceptable timing for gold purchase.** You can proceed, though not as ideal as other windows.";
      } else {
        base = "💍 Gold purchase timing is challenging. Reschedule if possible.";
      }
      break;

    case "property-purchase":
      if (score >= 75) {
        base = "🏠 **Excellent timing for property purchase during Deepavali.** Jupiter expansion + Venus comforts strongly placed.";
      } else if (score >= 60) {
        base = "🏠 **Good timing for property booking/agreement.** Conservative alignment ensures stability.";
      } else {
        base = "🏠 Property purchase timing is below ideal. Consult for alternative dates.";
      }
      break;

    case "business-startup":
      if (score >= 80) {
        base = "🏢 **Excellent timing for business launch!** Mercury hora + favorable nakshatra = strong commerce energy.";
      } else if (score >= 65) {
        base = "🏢 **Good timing for business startup.** Communications and growth factors favorable.";
      } else {
        base = "🏢 Business startup timing is challenging. Consider alternative windows.";
      }
      break;

    case "family-events":
      if (score >= 80) {
        base = "👰 **Excellent timing for family celebration!** Venus energy strong + partnership alignment ideal.";
      } else if (score >= 65) {
        base = "👰 **Good timing for family events.** Relationships and partnerships favorably placed.";
      } else {
        base = "👰 Family event timing is below optimal. Consult for better windows.";
      }
      break;

    case "education":
      if (score >= 75) {
        base = "🎓 **Excellent timing for educational start!** Mercury intellect + Jupiter wisdom powerfully placed.";
      } else if (score >= 60) {
        base = "🎓 **Good timing for learning/education start.** Intellectual factors favorable.";
      } else {
        base = "🎓 Education start timing is challenging. Look for alternative dates.";
      }
      break;

    case "legal":
      if (score >= 75) {
        base = "⚖️ **Excellent timing for legal proceedings!** Mercury precision + proper house lord alignment.";
      } else if (score >= 60) {
        base = "⚖️ **Acceptable timing for contracts/agreements.** Proceed with caution; consider remedies if score < 65.";
      } else {
        base = "⚖️ Legal timing is unfavorable. Reschedule if possible; consult for remedies.";
      }
      break;

    case "health":
      if (capped) {
        base = "🏥 **⚠️ Not in Amrit Kaal.** Medical procedures are IDEALLY done during pre-dawn hours (96-48 min before sunrise). Proceed only if medically necessary.";
      } else if (score >= 75) {
        base = "🏥 **Excellent timing for medical procedure!** Amrit Kaal active + Moon/Jupiter support strong.";
      } else if (score >= 60) {
        base = "🏥 **Acceptable timing for medical procedures.** Proceed if necessary; Moon strength moderate.";
      } else {
        base = "🏥 Medical timing is below ideal. Reschedule if possible.";
      }
      break;
  }

  return base;
}

/**
 * Generate Deepavali-specific recommendations
 */
function generateDeepavaliRecommendation(label: DeepavaliLabel, score: number): string {
  if (score >= 75) {
    return "✅ **Recommendation:** Proceed with confidence. Timing is auspicious. Make the purchase/event during the calculated window.";
  } else if (score >= 60) {
    return "⚠️ **Recommendation:** You may proceed if necessary. For optimal results, consider a remedial puja or consultation with an astrologer.";
  } else {
    return "❌ **Recommendation:** Consider alternative dates if possible. If you must proceed, consult an astrologer for remedies.";
  }
}

/**
 * Get Amrit Kaal window for a given sunrise time
 * Amrit Kaal = 96-48 min before sunrise
 */
export function getAmritKaal(sunrise: Date): { start: Date; end: Date } {
  const start = new Date(sunrise.getTime() - 96 * 60000); // 96 min before
  const end = new Date(sunrise.getTime() - 48 * 60000);   // 48 min before
  return { start, end };
}
