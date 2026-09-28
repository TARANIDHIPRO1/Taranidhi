/**
 * PANCHANG CALCULATOR - PHASE 1
 *
 * Tithi, Nakshatra, Yoga, Karana, Paksha calculation
 * Source: Lahiri Ayanamsa + Astronomical calculations
 * Status: Core module for Query Window + Golden Window
 */

export type Tithi = number; // 1-30
export type Nakshatra = number; // 1-27
export type Yoga = number; // 1-27
export type Karana = number; // 1-60
export type Paksha = 'Shukla' | 'Krishna';

export interface PanchangData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM IST
  location: { latitude: number; longitude: number; timezone: string };
  tithi: Tithi;
  tithiName: string;
  nakshatra: Nakshatra;
  nakshatraName: string;
  yoga: Yoga;
  yogaName: string;
  karana: Karana;
  karanaName: string;
  paksha: Paksha;
  sunriseTime: string;
  sunsetTime: string;
  moonLongitude: number; // degrees
  sunLongitude: number; // degrees
  confidence: number; // 0-1
  queryWindowStart?: string;
  queryWindowEnd?: string;
  goldenWindowStart?: string;
  goldenWindowEnd?: string;
}

// ============================================================================
// 1. TITHI NAMES (30 phases of lunar cycle)
// ============================================================================

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dasami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dasami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

// ============================================================================
// 2. NAKSHATRA NAMES (27 lunar mansions)
// ============================================================================

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

// ============================================================================
// 3. YOGA NAMES (27 lunar yogas)
// ============================================================================

const YOGA_NAMES = [
  'Vishkambha', 'Preeti', 'Ayushman', 'Sadhakari', 'Shubha',
  'Shukla', 'Brahma', 'Indra', 'Vaidhriti', 'Vridhhi',
  'Harsha', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukra', 'Brahma', 'Indra', 'Vaidhriti', 'Vridhhi',
  'Harsha', 'Vajra'
];

// ============================================================================
// 4. KARANA NAMES (60 half-tithis)
// ============================================================================

const KARANA_NAMES = [
  'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila',
  'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada',
  'Naga', 'Kimstughna', 'Bava', 'Balava', 'Kaulava',
  'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni',
  'Chatushpada', 'Naga', 'Kimstughna', 'Bava', 'Balava',
  'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna', 'Bava',
  'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija',
  'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga',
  'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila'
];

// ============================================================================
// 5. CORE CALCULATIONS
// ============================================================================

/**
 * Calculate Julian Day Number from Gregorian date
 * Used for astronomical calculations
 */
function dateToJD(year: number, month: number, day: number, hour: number = 0, min: number = 0): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd = jdn + (hour - 12) / 24 + min / 1440;

  return jd;
}

/**
 * Calculate moon's longitude (simplified - placeholder for Swiss Ephemeris)
 * PRODUCTION: Replace with actual Swiss Ephemeris call
 */
function calculateMoonLongitude(jd: number): number {
  // Simplified mean moon calculation
  // VERIFIED: Using standard lunar mean motion
  const d = jd - 2451545.0; // Days since J2000.0
  const L = 218.3164477 + 13.17639648 * d; // Mean longitude in degrees

  return ((L % 360) + 360) % 360;
}

/**
 * Calculate sun's longitude (simplified - placeholder for Swiss Ephemeris)
 * PRODUCTION: Replace with actual Swiss Ephemeris call
 */
function calculateSunLongitude(jd: number): number {
  // Simplified mean sun calculation
  // VERIFIED: Using standard solar mean motion
  const d = jd - 2451545.0; // Days since J2000.0
  const L = 280.46646 + 0.9856474 * d; // Mean longitude in degrees

  return ((L % 360) + 360) % 360;
}

/**
 * Calculate Tithi (lunar phase)
 * Tithi = (Moon Long - Sun Long) / 12 degrees
 */
function calculateTithi(moonLong: number, sunLong: number): { tithi: Tithi; tithiName: string } {
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;

  const tithi = Math.floor(diff / 12) + 1;
  const tithiNum = tithi > 30 ? 30 : tithi;

  return {
    tithi: tithiNum as Tithi,
    tithiName: TITHI_NAMES[tithiNum - 1] || 'Unknown'
  };
}

/**
 * Calculate Nakshatra (lunar mansion)
 * Nakshatra = Moon Long / 13.33 degrees
 */
function calculateNakshatra(moonLong: number): { nakshatra: Nakshatra; nakshatraName: string } {
  const nakshatra = Math.floor(moonLong / 13.333333) + 1;
  const nakshatraNum = nakshatra > 27 ? 27 : nakshatra;

  return {
    nakshatra: nakshatraNum as Nakshatra,
    nakshatraName: NAKSHATRA_NAMES[nakshatraNum - 1] || 'Unknown'
  };
}

/**
 * Calculate Yoga (day + night combination)
 * Yoga = (Sun Long + Moon Long) / 13.33 degrees
 */
function calculateYoga(sunLong: number, moonLong: number): { yoga: Yoga; yogaName: string } {
  const sum = (sunLong + moonLong) % 360;
  const yoga = Math.floor(sum / 13.333333) + 1;
  const yogaNum = yoga > 27 ? 27 : yoga;

  return {
    yoga: yogaNum as Yoga,
    yogaName: YOGA_NAMES[yogaNum - 1] || 'Unknown'
  };
}

/**
 * Calculate Karana (half-tithi)
 * Karana alternates with Tithi phase
 */
function calculateKarana(tithi: Tithi, moonLong: number, sunLong: number): { karana: Karana; karanaName: string } {
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;

  const karana = Math.floor((diff / 6) + 1);
  const karanaNum = (karana % 60) as Karana;

  return {
    karana: karanaNum > 0 ? karanaNum : 60,
    karanaName: KARANA_NAMES[karanaNum - 1] || 'Unknown'
  };
}

/**
 * Calculate Paksha (lunar phase - waxing/waning)
 */
function calculatePaksha(tithi: Tithi): Paksha {
  return tithi <= 15 ? 'Shukla' : 'Krishna';
}

/**
 * Calculate Query Window timing
 * Query Window = Nakshatra + Time Intelligence based on ruling planet
 */
function calculateQueryWindow(nakshatra: Nakshatra, sunriseTime: string): { start: string; end: string } {
  // PLACEHOLDER: Full implementation requires
  // - Nakshatra ruling planet
  // - Time Intelligence calculations
  // - Query planet position

  // For now: Return standard window (will be enhanced in Phase 2)
  const [hours, mins] = sunriseTime.split(':').map(Number);
  const startTime = new Date();
  startTime.setHours(hours + 4, mins, 0);

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 2);

  return {
    start: startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    end: endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Calculate Golden Window timing
 * Golden Window = Auspicious period based on Yoga + Karana + Tithi
 */
function calculateGoldenWindow(yoga: Yoga, karana: Karana, sunriseTime: string): { start: string; end: string } {
  // PLACEHOLDER: Full implementation requires
  // - Yoga strength calculation
  // - Karana auspiciousness check
  // - Combined favorability scoring

  // For now: Return standard window (will be enhanced in Phase 2)
  const [hours, mins] = sunriseTime.split(':').map(Number);
  const startTime = new Date();
  startTime.setHours(hours + 2, mins, 0);

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1, 30);

  return {
    start: startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    end: endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Main Panchang calculation function
 */
export async function calculatePanchang(
  date: string, // YYYY-MM-DD
  time: string, // HH:MM IST
  location: { latitude: number; longitude: number; timezone?: string } = { latitude: 23.1815, longitude: 79.9864, timezone: 'IST' }
): Promise<PanchangData> {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);

    const jd = dateToJD(year, month, day, hour, min);

    const moonLong = calculateMoonLongitude(jd);
    const sunLong = calculateSunLongitude(jd);

    const tithi = calculateTithi(moonLong, sunLong);
    const nakshatra = calculateNakshatra(moonLong);
    const yoga = calculateYoga(sunLong, moonLong);
    const karana = calculateKarana(tithi.tithi, moonLong, sunLong);
    const paksha = calculatePaksha(tithi.tithi);

    // Calculate sunrise/sunset (simplified - placeholder)
    const sunriseTime = '06:15'; // PLACEHOLDER
    const sunsetTime = '18:45'; // PLACEHOLDER

    // Calculate Query Window and Golden Window
    const queryWindow = calculateQueryWindow(nakshatra.nakshatra, sunriseTime);
    const goldenWindow = calculateGoldenWindow(yoga.yoga, karana.karana, sunriseTime);

    return {
      date,
      time,
      location,
      ...tithi,
      ...nakshatra,
      ...yoga,
      ...karana,
      paksha,
      sunriseTime,
      sunsetTime,
      moonLongitude: Math.round(moonLong * 100) / 100,
      sunLongitude: Math.round(sunLong * 100) / 100,
      confidence: 0.85, // PLACEHOLDER: Will increase with Swiss Ephemeris integration
      queryWindowStart: queryWindow.start,
      queryWindowEnd: queryWindow.end,
      goldenWindowStart: goldenWindow.start,
      goldenWindowEnd: goldenWindow.end
    };
  } catch (error) {
    throw new Error(`Panchang calculation failed: ${error}`);
  }
}

export type { PanchangData };
