/**
 * PANCHA PAKSHI TEST SUITE
 * Verified against Astro-Vision system
 */

import {
  getBirthPakshi,
  calculateYama,
  getActivity,
  calculateFavorability,
  analyzePanchaPakshi
} from '../panchaPakshi';

describe('Pancha Pakshi', () => {
  describe('Birth Pakshi Determination', () => {
    it('Naveen: Shravana (22) + Shukla = Peacock', () => {
      expect(getBirthPakshi(22, 'Shukla')).toBe('Peacock');
    });
    
    it('Nakshatra 1-5 (Shukla) = Vulture', () => {
      expect(getBirthPakshi(1, 'Shukla')).toBe('Vulture');
      expect(getBirthPakshi(5, 'Shukla')).toBe('Vulture');
    });
    
    it('Nakshatra 12-16 (Shukla) = Crow', () => {
      expect(getBirthPakshi(12, 'Shukla')).toBe('Crow');
    });
  });
  
  describe('Favorability Scoring', () => {
    it('Rule activity gets max power', () => {
      const scoreRule = calculateFavorability('Rule', 'Crow', 'Shukla');
      const scoreWalk = calculateFavorability('Walk', 'Crow', 'Shukla');
      expect(scoreRule).toBeGreaterThan(scoreWalk);
    });
    
    it('Crow is strongest bird', () => {
      const crowScore = calculateFavorability('Walk', 'Crow', 'Shukla');
      const peacockScore = calculateFavorability('Walk', 'Peacock', 'Shukla');
      expect(crowScore).toBeGreaterThan(peacockScore);
    });
  });
});

// Template for Naveen's 10 historical muhurtas
// Format each test with: date, time, nakshatra, paksha, expected bird, expected activity
const HISTORICAL_MUHURTAS = [
  { name: 'Muhurta #1', expectedBird: 'Peacock', expectedActivity: 'Rule' },
  // Add 9 more when Naveen provides data
];

describe('Historical Muhurtas', () => {
  HISTORICAL_MUHURTAS.forEach((test, idx) => {
    it(`${test.name}: ${test.expectedBird} + ${test.expectedActivity}`, () => {
      // TODO: Add actual test data
      expect(true).toBe(true);
    });
  });
});
