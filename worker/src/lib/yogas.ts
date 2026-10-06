/**
 * yogas.ts — Nitya Yoga (the 27 Panchang Yogas), computed from real
 * sidereal Sun + Moon longitudes (lib/astro.ts, Lahiri).
 *
 * Formula: yogaIndex = floor(((SunLon + MoonLon) mod 360) / (360/27)), i.e. each
 * Yoga spans 13°20'. This is the standard Panchang definition.
 *
 * Nature classification below is the commonly accepted Panchang grouping
 * (9 inauspicious: Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra,
 * Vyatipata, Parigha, Vaidhriti). STATUS: pending FACT_CHECK_ENGINE sign-off
 * against Muhurta Chintamani / the user's own reference text. No verse numbers
 * are cited here on purpose -- none have been verified.
 *
 * NOT IMPLEMENTED (deliberately, no verified rule yet):
 *  - "Reach/Publicity" and "Financial" campaign yogas (Pushkara, Lakshmi, Dhana
 *    etc. as proposed in the spec). These need Naveen's classical definitions;
 *    do not approximate them with heuristics.
 */
import { julianDayFromUtc, trueSiderealLongitude } from "./astro";

export const NITYA_YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

const INAUSPICIOUS = new Set([
  "Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata",
  "Vajra", "Vyatipata", "Parigha", "Vaidhriti",
]);

const SPAN = 360 / 27; // 13.3333...°

export interface NityaYogaResult {
  index: number; // 1-27
  name: string;
  nature: "auspicious" | "inauspicious";
  sumDeg: number;
  degreesIntoYoga: number;
  verified: false; // flips to true only after FACT_CHECK sign-off
}

export function calcNityaYoga(sunLon: number, moonLon: number): NityaYogaResult {
  const sum = (((sunLon + moonLon) % 360) + 360) % 360;
  const idx = Math.floor(sum / SPAN);
  const name = NITYA_YOGAS[idx]!;
  return {
    index: idx + 1,
    name,
    nature: INAUSPICIOUS.has(name) ? "inauspicious" : "auspicious",
    sumDeg: sum,
    degreesIntoYoga: sum - idx * SPAN,
    verified: false,
  };
}

export function nityaYogaAt(date: Date): NityaYogaResult {
  const jd = julianDayFromUtc(date);
  return calcNityaYoga(trueSiderealLongitude("Sun", jd), trueSiderealLongitude("Moon", jd));
}
