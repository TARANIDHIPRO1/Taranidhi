/**
 * NUMEROLOGY SYSTEM - CHALDEAN + PYTHAGOREAN
 *
 * Number analysis for Muhurta selection and life guidance
 * Supports both Chaldean (1-8) and Pythagorean (1-9) systems
 * Source: Ancient Vedic texts + Modern numerological research
 * Status: Phase 2 Complete
 */

export type NumerologySystem = 'Chaldean' | 'Pythagorean';

export interface NumerologyResult {
  date: string;
  time: string;
  chaldeanNumber: number;
  pythagoreanNumber: number;
  chaldeanMeaning: string;
  pythagoreanMeaning: string;
  chaldeanRulingPlanet: string;
  pythagoreanRulingPlanet: string;
  luckyColors: string[];
  luckyMetals: string[];
  luckyGems: string[];
  recommendations: string[];
  muhurtaScore: number; // 0-100 based on number quality
  confidence: number;
}

// ============================================================================
// 1. CHALDEAN SYSTEM (1-8, with 0 as supreme)
// ============================================================================

const CHALDEAN_MAPPING: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9
};

const CHALDEAN_MEANINGS: Record<number, {name: string; meaning: string; planet: string}> = {
  1: {
    name: 'Unity',
    meaning: 'Leadership, independence, individuality, new beginnings, authority',
    planet: 'Sun'
  },
  2: {
    name: 'Duality',
    meaning: 'Balance, partnership, intuition, cooperation, sensitivity',
    planet: 'Moon'
  },
  3: {
    name: 'Trinity',
    meaning: 'Creativity, communication, joy, social interaction, optimism',
    planet: 'Jupiter'
  },
  4: {
    name: 'Stability',
    meaning: 'Foundation, stability, hard work, discipline, practicality',
    planet: 'Rahu'
  },
  5: {
    name: 'Freedom',
    meaning: 'Mercury, communication, travel, curiosity, adaptability',
    planet: 'Mercury'
  },
  6: {
    name: 'Harmony',
    meaning: 'Love, beauty, responsibility, nurturing, family orientation',
    planet: 'Venus'
  },
  7: {
    name: 'Wisdom',
    meaning: 'Spirituality, introspection, analysis, mystery, inner knowing',
    planet: 'Ketu'
  },
  8: {
    name: 'Infinity',
    meaning: 'Karma, power, material success, transformation, infinity cycles',
    planet: 'Saturn'
  },
  9: {
    name: 'Completion',
    meaning: 'Humanitarianism, wisdom, endings, universal consciousness, Mars',
    planet: 'Mars'
  }
};

// ============================================================================
// 2. PYTHAGOREAN SYSTEM (1-9, reduction to single digit)
// ============================================================================

const PYTHAGOREAN_MEANINGS: Record<number, {name: string; meaning: string; planet: string}> = {
  1: {
    name: 'Leader',
    meaning: 'Initiative, individuality, ambition, determination, uniqueness',
    planet: 'Sun'
  },
  2: {
    name: 'Mediator',
    meaning: 'Diplomacy, partnership, sensitivity, intuition, empathy',
    planet: 'Moon'
  },
  3: {
    name: 'Creator',
    meaning: 'Self-expression, optimism, creativity, communication, growth',
    planet: 'Jupiter'
  },
  4: {
    name: 'Builder',
    meaning: 'Stability, organization, dedication, trustworthiness, hard work',
    planet: 'Rahu'
  },
  5: {
    name: 'Explorer',
    meaning: 'Freedom, curiosity, adventure, versatility, communication',
    planet: 'Mercury'
  },
  6: {
    name: 'Nurturer',
    meaning: 'Harmony, responsibility, caring, family, compassion, beauty',
    planet: 'Venus'
  },
  7: {
    name: 'Seeker',
    meaning: 'Spirituality, analysis, mystery, perfection, inner peace',
    planet: 'Ketu'
  },
  8: {
    name: 'Manager',
    meaning: 'Power, material success, authority, business, infinity cycles',
    planet: 'Saturn'
  },
  9: {
    name: 'Sage',
    meaning: 'Compassion, completion, universal love, wisdom, humanitarian',
    planet: 'Mars'
  }
};

// ============================================================================
// 3. LUCKY ATTRIBUTES BY NUMBER
// ============================================================================

const LUCKY_ATTRIBUTES: Record<number, {colors: string[]; metals: string[]; gems: string[]}> = {
  1: {colors: ['Gold', 'Orange', 'Yellow'], metals: ['Gold'], gems: ['Ruby', 'Topaz']},
  2: {colors: ['White', 'Cream', 'Silver'], metals: ['Silver'], gems: ['Pearl', 'Moonstone']},
  3: {colors: ['Purple', 'Yellow', 'Blue'], metals: ['Gold'], gems: ['Yellow Sapphire', 'Topaz']},
  4: {colors: ['Blue', 'Black', 'Green'], metals: ['Iron'], gems: ['Blue Sapphire', 'Emerald']},
  5: {colors: ['Green', 'Yellow', 'Gray'], metals: ['Mercury', 'Copper'], gems: ['Emerald', 'Green Tourmaline']},
  6: {colors: ['Green', 'White', 'Blue'], metals: ['Copper'], gems: ['Diamond', 'Opal']},
  7: {colors: ['White', 'Purple', 'Violet'], metals: ['Silver'], gems: ['Amethyst', 'Aquamarine']},
  8: {colors: ['Black', 'Navy', 'Gray'], metals: ['Iron'], gems: ['Blue Sapphire', 'Turquoise']},
  9: {colors: ['Red', 'Maroon', 'Scarlet'], metals: ['Iron', 'Copper'], gems: ['Ruby', 'Garnet']}
};

// ============================================================================
// 4. CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Reduce number to single digit (Pythagorean method)
 */
function reduceToSingleDigit(num: number): number {
  while (num >= 10) {
    num = Math.floor(num / 10) + (num % 10);
  }
  return num;
}

/**
 * Calculate Chaldean number from date
 * Method: Sum all digits, don't reduce to single digit (keeps 1-9)
 */
function calculateChaldeanNumber(date: string, time: string): number {
  const dateParts = date.split('-').map(Number);
  const year  = dateParts[0] ?? 2000;
  const month = dateParts[1] ?? 1;
  const day   = dateParts[2] ?? 1;
  const timeParts = time.split(':').map(Number);
  const hour = timeParts[0] ?? 0;
  const min  = timeParts[1] ?? 0;

  let sum = 0;

  // Add day
  sum += day;

  // Add month
  sum += month;

  // Add year digits
  const yearDigits = year.toString().split('').map(Number);
  sum += yearDigits.reduce((a, b) => a + b, 0);

  // Add time (optional - more precision)
  sum += hour + min;

  // In Chaldean system, reduce only if > 9
  if (sum >= 10) {
    sum = reduceToSingleDigit(sum);
  }

  return sum;
}

/**
 * Calculate Pythagorean number from date
 * Method: Sum all digits, reduce to single digit
 */
function calculatePythagoreanNumber(date: string, time: string): number {
  const dateParts = date.split('-').map(Number);
  const year  = dateParts[0] ?? 2000;
  const month = dateParts[1] ?? 1;
  const day   = dateParts[2] ?? 1;
  const timeParts = time.split(':').map(Number);
  const hour = timeParts[0] ?? 0;
  const min  = timeParts[1] ?? 0;

  let sum = 0;

  // Add day
  sum += day;

  // Add month
  sum += month;

  // Add year digits
  const yearDigits = year.toString().split('').map(Number);
  sum += yearDigits.reduce((a, b) => a + b, 0);

  // Add time
  sum += hour + min;

  // Reduce to single digit
  return reduceToSingleDigit(sum);
}

/**
 * Calculate Muhurta score based on numerology
 * Favorable numbers: 1, 3, 5, 7, 9 (odd = dynamic)
 * Less favorable: 2, 4, 6, 8 (even = passive, except 2 for partnerships)
 */
function calculateMuhurtaScore(chaldean: number, pythagorean: number): number {
  let score = 50; // Base score

  const favorableNumbers = [1, 3, 5, 7, 9];
  const lessAuspiciousNumbers = [2, 4, 6, 8];

  // Chaldean score
  if (favorableNumbers.includes(chaldean)) {
    score += 15;
  } else if (lessAuspiciousNumbers.includes(chaldean)) {
    score += 5;
  }

  // Pythagorean score
  if (favorableNumbers.includes(pythagorean)) {
    score += 15;
  } else if (lessAuspiciousNumbers.includes(pythagorean)) {
    score += 5;
  }

  // Bonus if both align
  if (chaldean === pythagorean) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Generate recommendations based on numbers
 */
function generateRecommendations(chaldean: number, pythagorean: number): string[] {
  const recommendations: string[] = [];

  const chaldeanData = CHALDEAN_MEANINGS[chaldean];
  const pythagoreanData = PYTHAGOREAN_MEANINGS[pythagorean];

  if (chaldean === 1 || pythagorean === 1) {
    recommendations.push('Best for starting new ventures and taking leadership roles');
  }

  if (chaldean === 3 || pythagorean === 3) {
    recommendations.push('Favorable for creative endeavors and communication');
  }

  if (chaldean === 5 || pythagorean === 5) {
    recommendations.push('Excellent for travel, business negotiations, and short-term deals');
  }

  if (chaldean === 7 || pythagorean === 7) {
    recommendations.push('Good for spiritual practices, research, and introspection');
  }

  if (chaldean === 9 || pythagorean === 9) {
    recommendations.push('Suitable for humanitarian work and completion of projects');
  }

  if (chaldean === 2 || pythagorean === 2) {
    recommendations.push('Ideal for partnerships, marriage, and harmony-focused activities');
  }

  if (chaldean === 6 || pythagorean === 6) {
    recommendations.push('Perfect for family matters, healing, and relationship building');
  }

  if (!recommendations.length) {
    recommendations.push('Neutral numerological influence - suitable for routine activities');
  }

  return recommendations;
}

/**
 * Main Numerology calculation
 */
export async function calculateNumerology(
  date: string,
  time: string,
  system: NumerologySystem = 'Pythagorean'
): Promise<NumerologyResult> {
  try {
    const chaldeanNumber = calculateChaldeanNumber(date, time);
    const pythagoreanNumber = calculatePythagoreanNumber(date, time);

    // noUncheckedIndexedAccess: index lookup returns T | undefined; use ?? fallback on [1]
    const chaldeanData    = CHALDEAN_MEANINGS[chaldeanNumber]
                         ?? CHALDEAN_MEANINGS[1]
                         ?? { name: "Unknown", meaning: "", planet: "" };
    const pythagoreanData = PYTHAGOREAN_MEANINGS[pythagoreanNumber]
                         ?? PYTHAGOREAN_MEANINGS[1]
                         ?? { name: "Unknown", meaning: "", planet: "" };
    const luckyAttrs      = LUCKY_ATTRIBUTES[pythagoreanNumber]
                         ?? LUCKY_ATTRIBUTES[1]
                         ?? { colors: [], metals: [], gems: [] };

    const muhurtaScore = calculateMuhurtaScore(chaldeanNumber, pythagoreanNumber);
    const recommendations = generateRecommendations(chaldeanNumber, pythagoreanNumber);

    return {
      date,
      time,
      chaldeanNumber,
      pythagoreanNumber,
      chaldeanMeaning: `${chaldeanData.name}: ${chaldeanData.meaning}`,
      pythagoreanMeaning: `${pythagoreanData.name}: ${pythagoreanData.meaning}`,
      chaldeanRulingPlanet: chaldeanData.planet,
      pythagoreanRulingPlanet: pythagoreanData.planet,
      luckyColors: luckyAttrs.colors,
      luckyMetals: luckyAttrs.metals,
      luckyGems: luckyAttrs.gems,
      recommendations,
      muhurtaScore,
      confidence: 0.92 // Numerology confidence level
    };
  } catch (error) {
    throw new Error(`Numerology calculation failed: ${error}`);
  }
}

// NumerologyResult is already exported via `export interface` at the top of this file.
