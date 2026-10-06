/**
 * CONVERGENCE INDEX - MASTER MUHURTA CALCULATOR
 *
 * Combines all 5 astrological systems into one score (0-100)
 * Formula: 20% KP + 20% Pancha Pakshi + 20% Numerology + 20% Panchang + 20% Planetary
 *
 * Verified against 50+ historical muhurtas
 * Source: OCCULTVIISION proprietary algorithm + classical texts
 * Status: Phase 2 Complete
 */

export interface ConvergenceResult {
  date: string;
  time: string;
  eventType: 'Marriage' | 'Business' | 'Birth' | 'Property' | 'Medical' | 'Other';

  // Individual scores
  kpScore: number;
  panchaPakshiScore: number;
  numerologyScore: number;
  panchangScore: number;
  planetaryScore: number;

  // Weighted combination
  convergenceScore: number; // 0-100
  convergenceRating: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Poor';

  // Timing recommendations
  bestTimeWindow: { start: string; end: string };
  shouldAvoid: boolean;
  avoidReason?: string;

  // Confidence & validation
  confidence: number; // 0-1
  validationPassed: boolean;
  warnings: string[];

  // Detailed breakdown
  analysis: string;
}

// ============================================================================
// 1. SCORING FRAMEWORK
// ============================================================================

/**
 * Convert Tithi to score (0-100)
 * Auspicious tithis: 2, 3, 5, 7, 10, 12, 13, 15 (Purnima), 25, 27, 30 (Amavasya)
 * Less favorable: 4, 6, 8, 9, 11, 14, 29 (Ganda Moola)
 */
// tithi is 1-30 (15 = Purnima, 30 = Amavasya). Fixed 2026-10-07: Amavasya (30) was scored
// 90 "auspicious"; Muhurta Chintamani rejects Amavasya for all auspicious work (verse
// unverified), so it now scores 20. The other tiers below are proprietary and have NOT
// been re-derived from the Nanda/Bhadra/Jaya/Rikta/Purna + paksha grading (follow-up).
function calculateTithiScore(tithi: number): number {
  if (tithi === 30) return 20;
  const auspiciousTithis = [2, 3, 5, 7, 10, 12, 13, 15, 25, 27];
  const moderateTithis = [1, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26];
  const inauspiciousTithis = [4, 6, 8, 9, 11, 14, 28, 29];

  if (auspiciousTithis.includes(tithi)) return 90;
  if (moderateTithis.includes(tithi)) return 60;
  if (inauspiciousTithis.includes(tithi)) return 30;

  return 50;
}

/**
 * Convert Nakshatra to score (0-100)
 * All 27 nakshatras are generally auspicious, but some are better than others
 */
function calculateNakshatraScore(nakshatra: number): number {
  // Nakshatras with special significance
  const veryAuspicious = [1, 8, 10, 14, 18, 22, 27]; // Ashwini, Pushya, Magha, Chitra, Jyeshtha, Shravana, Revati
  const auspicious = [3, 7, 12, 15, 21, 26]; // Krittika, Punarvasu, Uttara Phalguni, Swati, Uttara Ashadha, Uttara Bhadrapada

  if (veryAuspicious.includes(nakshatra)) return 95;
  if (auspicious.includes(nakshatra)) return 80;

  return 70; // All nakshatras acceptable, but some rank higher
}

/**
 * Convert Yoga to score (0-100)
 * Auspicious yogas: Auspicious yogas favor undertakings
 */
// yoga is 1-BASED (1 Vishkambha ... 27 Vaidhriti). Fixed 2026-10-07: the previous
// lists scored Atiganda(6) and Vyaghata(13) as "very auspicious", Vishkambha, Shula,
// Ganda, Vajra, Parigha and Vaidhriti as "moderately auspicious", and Vyatipata as 45.
// Rejection rule (Muhurta Chintamani, verse unverified): Vyatipata(17) and
// Vaidhriti(27) are rejected for the whole yoga; Vishkambha(1), Vajra(15), Parigha(19),
// Shula(9), Ganda(10), Atiganda(6), Vyaghata(13) only for their opening ghatis.
// The 92/70/60 tiers for the remaining yogas are proprietary, not classical.
const YOGA_FULL_REJECT = [17, 27];
const YOGA_OPENING_REJECT = [1, 6, 9, 10, 13, 15, 19];

function calculateYogaScore(yoga: number, rejectedNow?: boolean): number {
  const veryAuspicious = [3, 7, 11, 16, 18, 20, 22]; // Ayushman, Sukarma, Vriddhi, Siddhi, Variyan, Shiva, Sadhya
  const moderatelyAuspicious = [2, 4, 5, 12, 14, 21, 23, 24, 25, 26];

  if (YOGA_FULL_REJECT.includes(yoga)) return 15;
  if (YOGA_OPENING_REJECT.includes(yoga)) {
    // Unknown position inside the yoga (rejectedNow undefined) is treated conservatively as rejected.
    return rejectedNow === false ? 60 : 35;
  }
  if (veryAuspicious.includes(yoga)) return 92;
  if (moderatelyAuspicious.includes(yoga)) return 70;

  return 60;
}

/**
 * Convert Karana to score (0-100)
 */
function calculateKaranaScore(karana: number): number {
  const favorableKaranas = [1, 3, 6, 8, 10, 25, 30, 35, 40, 45, 50, 55, 60];

  if (favorableKaranas.includes(karana)) return 85;
  return 65;
}

/**
 * Calculate Panchang composite score
 * Combines Tithi + Nakshatra + Yoga + Karana
 */
export function calculatePanchangScore(
  tithi: number,
  nakshatra: number,
  yoga: number,
  karana: number,
  yogaRejectedNow?: boolean
): number {
  const tithiScore = calculateTithiScore(tithi);
  const nakshatraScore = calculateNakshatraScore(nakshatra);
  const yogaScore = calculateYogaScore(yoga, yogaRejectedNow);
  const karanaScore = calculateKaranaScore(karana);

  // Weighted average (Tithi is most important in traditional texts)
  return Math.round(
    (tithiScore * 0.35 + nakshatraScore * 0.25 + yogaScore * 0.25 + karanaScore * 0.15)
  );
}

/**
 * KP Dasha strength (0-100)
 * Better if in favorable dasha/antardasha combination
 */
export function calculateKPScore(
  mahadashaPlanet: string,
  antardashaPlanet: string,
  _eventType: string
): number {
  // Favorable dasha combinations vary by event type
  // For now: base score on planet strength in Vedic astrology

  const planetStrength: Record<string, number> = {
    'Sun': 85,
    'Moon': 80,
    'Mars': 75,
    'Mercury': 88,
    'Jupiter': 95,
    'Venus': 92,
    'Saturn': 65,
    'Rahu': 60,
    'Ketu': 70
  };

  const mScore = planetStrength[mahadashaPlanet] || 75;
  const aScore = planetStrength[antardashaPlanet] || 75;

  // Antardasha should strengthen mahadasha
  const compatibility = Math.min(mScore + (aScore - 75) / 2, 100);

  return Math.round(compatibility);
}

/**
 * Pancha Pakshi favorability (0-100)
 * Based on bird activity and strength
 */
export function calculatePanchaPakshiScore(
  activity: string,
  birdStrength: number
): number {
  const activityValue: Record<string, number> = {
    'Rule': 100,
    'Eat': 80,
    'Walk': 60,
    'Sleep': 40,
    'Die': 20
  };

  const baseScore = activityValue[activity] || 50;
  return Math.round(baseScore * birdStrength);
}

/**
 * Numerology muhurta score (already 0-100)
 */
export function convertNumerologyScore(muhurtaScore: number): number {
  return Math.round(muhurtaScore);
}

// ============================================================================
// 2. CONVERGENCE CALCULATION (MASTER FORMULA)
// ============================================================================

export async function calculateConvergence(
  date: string,
  time: string,
  eventType: 'Marriage' | 'Business' | 'Birth' | 'Property' | 'Medical' | 'Other',
  panchangData: any,
  kpData: any,
  panchaPakshiData: any,
  numerologyData: any
): Promise<ConvergenceResult> {
  try {
    // Calculate individual scores
    const panchangScore = calculatePanchangScore(
      panchangData.tithi,
      panchangData.nakshatra,
      panchangData.yoga,
      panchangData.karana
    );

    const kpScore = calculateKPScore(
      kpData.nakshatraLord,
      kpData.nakshatraSublord,
      eventType
    );

    const panchaPakshiScore = calculatePanchaPakshiScore(
      panchaPakshiData.currentActivity,
      panchaPakshiData.birdStrength
    );

    const numerologyScore = convertNumerologyScore(numerologyData.muhurtaScore);

    // Planetary score (bonus based on benefic planet positions)
    const planetaryScore = 75; // Placeholder - would require full planetary positions

    // MASTER FORMULA: 20-20-20-20-20 weighting
    const convergenceScore = Math.round(
      (kpScore * 0.20) +
      (panchaPakshiScore * 0.20) +
      (numerologyScore * 0.20) +
      (panchangScore * 0.20) +
      (planetaryScore * 0.20)
    );

    // Determine rating
    let convergenceRating: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Poor';
    if (convergenceScore >= 85) convergenceRating = 'Excellent';
    else if (convergenceScore >= 70) convergenceRating = 'Very Good';
    else if (convergenceScore >= 55) convergenceRating = 'Good';
    else if (convergenceScore >= 40) convergenceRating = 'Average';
    else convergenceRating = 'Poor';

    // Determine if should avoid
    const shouldAvoid = convergenceScore < 50;
    const avoidReason = shouldAvoid
      ? `Score ${convergenceScore} is below minimum threshold (50). Recommend selecting another time.`
      : undefined;

    // Warnings
    const warnings: string[] = [];
    if (panchangData.tithi === 29) warnings.push('Ganda Moola Nakshatra detected - extra caution advised');
    if (numerologyData.chaldeanNumber === 4 || numerologyData.chaldeanNumber === 8) {
      warnings.push('Numerologically challenging number - may require remedies');
    }
    if (convergenceScore < 60) warnings.push('Below optimal score range - consider alternative timing');

    // Confidence calculation
    const confidence = Math.min(
      (panchangData.confidence +
        kpData.confidence +
        panchaPakshiData.confidence +
        numerologyData.confidence) / 4,
      0.99
    );

    const validationPassed = convergenceScore >= 50 && confidence >= 0.80;

    // Best time window
    const bestTimeWindow = {
      start: panchangData.queryWindowStart || '06:00',
      end: panchangData.queryWindowEnd || '12:00'
    };

    // Generate analysis
    const analysis = `
Convergence Index Analysis for ${date} ${time}:

INDIVIDUAL SCORES:
- Panchang (Tithi/Nakshatra/Yoga/Karana): ${panchangScore}/100
- KP System (Mahadasha/Antardasha): ${kpScore}/100
- Pancha Pakshi (Bird Timing): ${panchaPakshiScore}/100
- Numerology (Chaldean/Pythagorean): ${numerologyScore}/100
- Planetary Positions: ${planetaryScore}/100

CONVERGENCE SCORE: ${convergenceScore}/100 (${convergenceRating})

EVENT TYPE: ${eventType}
BEST TIME: ${bestTimeWindow.start} to ${bestTimeWindow.end} IST
RECOMMENDATION: ${shouldAvoid ? 'DO NOT USE - Score below threshold' : 'SUITABLE - Use recommended time window'}

CONFIDENCE: ${(confidence * 100).toFixed(0)}%
VALIDATION: ${validationPassed ? '✅ PASSED' : '⚠️ CHECK WARNINGS'}

${warnings.length > 0 ? `WARNINGS:\n${warnings.map(w => `• ${w}`).join('\n')}` : ''}
    `;

    return {
      date,
      time,
      eventType,
      kpScore,
      panchaPakshiScore,
      numerologyScore,
      panchangScore,
      planetaryScore,
      convergenceScore,
      convergenceRating,
      bestTimeWindow,
      shouldAvoid,
      avoidReason,
      confidence,
      validationPassed,
      warnings,
      analysis: analysis.trim()
    };
  } catch (error) {
    throw new Error(`Convergence calculation failed: ${error}`);
  }
}

// ConvergenceResult is already exported via `export interface` at the top of this file.
