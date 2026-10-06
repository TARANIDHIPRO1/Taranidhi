import { describe, it, expect } from "vitest";
import {
  buildRealChart,
  getCurrentDasha,
  NAKSHATRA_NAMES,
} from "../astro";

describe("Amitabh Bachchan Chart - 11 Oct 1942, 16:00 IST", () => {
  const birthUtc = new Date("1942-10-11T10:30:00Z"); // 16:00 IST = 10:30 UTC
  const latitude = 25.4358;   // Allahabad
  const longitude = 81.8463;

  it("builds complete chart", () => {
    const chart = buildRealChart(birthUtc, latitude, longitude);
    
    console.log("\n🎯 AMITABH BACHCHAN — COMPLETE PANCHANG");
    console.log("Birth: 11 October 1942, 16:00 IST (Allahabad)");
    console.log("═══════════════════════════════════════════════════════");
    
    console.log("\n📊 LAGNA:");
    const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    console.log(`  Degree: ${chart.ascDeg.toFixed(2)}°`);
    console.log(`  Rashi: ${RASHIS[chart.lagnaRashi]}`);
    console.log(`  Nakshatra: ${NAKSHATRA_NAMES[chart.janmaNakIdx]}`);
    
    console.log("\n🪐 PLANETARY POSITIONS (SIDEREAL DEGREES):");
    console.log("────────────────────────────────────────────────────");
    
    chart.planets.forEach(p => {
      const nak = NAKSHATRA_NAMES[p.nakIdx] ?? 'Unknown';
      const rashi = RASHIS[p.rashi] ?? 'Unknown';
      console.log(`${p.planet.padEnd(10)} ${p.deg.toFixed(2).padEnd(8)}° | ${rashi.padEnd(12)} ${p.degInRashi.toFixed(2).padEnd(6)}° | ${nak}`);
    });
    
    console.log("\n🌙 JANMA NAKSHATRA:");
    const moonPos = chart.planets.find(p => p.planet === 'Moon');
    console.log(`  ${NAKSHATRA_NAMES[chart.janmaNakIdx]}`);
    console.log(`  Moon Degree: ${moonPos?.deg.toFixed(2)}°`);
    console.log(`  Moon Rashi: ${RASHIS[moonPos?.rashi ?? 0]}`);
    
    // Get current dasha as of today
    const dasha = getCurrentDasha(chart, new Date());
    console.log("\n📅 DASHA (as of Oct 7, 2026):");
    if (dasha) {
      console.log(`  Mahadasha: ${dasha.maha.lord}`);
      console.log(`  Antardasha: ${dasha.antar.lord}`);
    }
    
    expect(chart).toBeDefined();
    expect(chart.planets.length).toBe(9);
    expect(moonPos?.deg).toBeGreaterThan(0);
  });
});
