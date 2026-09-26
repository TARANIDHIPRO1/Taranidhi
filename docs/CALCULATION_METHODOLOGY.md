# OccultViision — Calculation Methodology & Verification Reference

**Version 1.0 — Cross-check verification engine companion document.**
**This file documents every calculation step, its source/authority, inputs,
formula, and expected outputs for reference test cases. Nothing ships without
passing the verification suite that tests against these reference values.**

---

## Reference Chart (Ground Truth)

All verification uses this single reference chart unless otherwise noted:

| Field | Value |
|---|---|
| Name | Naveen K. Rai |
| Date | 08 April 1973 |
| Time | 11:45 IST (06:15 UTC) |
| Place | Bhopal, India |
| Latitude | 23.2505° N |
| Longitude | 77.4065° E |
| Reference tool | onlinejyotish.com KP Horoscope |
| Reference tool 2 | Jagannath Hora (confirmed trustworthy by domain owner) |

**Julian Day for this moment:** JD = 2441779.760416...

### Known limitation
This is a SINGLE reference chart at a SINGLE epoch. A constant-term calibration
(like the Krishnamurti ayanamsa offset) cannot detect a *rate* mismatch that
would only appear at a very different epoch. A second reference chart at a
different date (e.g. a 2020s birth) is needed for full confidence but is not
yet available.

---

## Module 1: Julian Day Conversion

### Formula
```
JD = (Unix timestamp in ms) / 86400000 + 2440587.5
```

### Source
Standard astronomical Julian Day Number formula (Meeus, "Astronomical
Algorithms"). Unix epoch (1970-01-01T00:00:00Z) = JD 2440587.5.

### Implementation
`astro.ts :: julianDayFromUtc(date: Date)`

### Verification
| Input | Expected JD |
|---|---|
| 1973-04-08T06:15:00Z | 2441779.760416... |
| 2000-01-01T12:00:00Z | 2451545.0 (J2000.0 epoch) |
| 1970-01-01T00:00:00Z | 2440587.5 (Unix epoch) |

### Tolerance
Exact (floating-point precision only, < 1e-10 day = < 0.01 ms).

---

## Module 2: Lahiri Ayanamsa

### Formula
```
T = (JD - 2451545) / 36525   (Julian centuries from J2000.0)
Ayanamsa(arcsec) = 85885.53192 + 5028.796195*T + 1.1054348*T² + 0.00007964*T³
Ayanamsa(deg) = Ayanamsa(arcsec) / 3600
```

### Source
IAE-based polynomial from Pani et al., Orissa Journal of Physics, 2024.
Verified against Swiss Ephemeris to within ~14 arcseconds (claimed in Floot
prototype documentation). The ~14" offset vs SE standard is acceptable for
rashi-level work (30° = 108000") but matters at KP sub-lord boundaries
(narrowest ~40').

### Implementation
`astro.ts :: lahiriAyanamsa(jd: number)`

### Verification
| Input (JD) | Epoch | Expected Ayanamsa (approx) |
|---|---|---|
| 2441779.76 | 1973-04-08 | ~23.46° (exact value from formula) |
| 2451545.0 | 2000-01-01 | ~23.856° (= 85885.53192 / 3600) |
| 2460310.5 | 2024-01-01 | ~24.18° |

### Tolerance
< 0.001° vs own formula (internal consistency); ~14" vs Swiss Ephemeris
(known systematic offset).

---

## Module 3: Krishnamurti Ayanamsa

### Formula
```
KP_Ayanamsa = Lahiri_Ayanamsa - 0.0965°
```

### Source
Calibrated against Naveen's reference KP chart (onlinejyotish.com). The
offset was derived by comparing 6 independent Placidus cusps (Ascendant, MC,
and cusps XI, XII, II, III) — all differed from the reference by the SAME
constant: +0.0965° (5'47"), with ~1.8 arcsec scatter. This uniform offset
confirms (a) the Placidus geometry is correct, and (b) the difference is
purely an ayanamsa-constant discrepancy.

### Implementation
`astro.ts :: krishnamurtiAyanamsa(jd: number)`

### Verification
For the reference chart epoch (JD 2441779.76):
- Lahiri = `lahiriAyanamsa(2441779.76)`
- Krishnamurti = Lahiri - 0.0965°
- After applying KP ayanamsa, Ascendant/cusps should match onlinejyotish.com
  reference to within ~2 arcseconds.

### Known limitation
Single-epoch calibration. A rate mismatch would manifest as a growing offset
at other epochs.

### Tolerance
< 0.01° vs onlinejyotish.com reference at 1973 epoch.

---

## Module 4: Planetary Longitudes (True Sidereal)

### Formula
```
1. Get tropical ecliptic longitude from astronomy-engine (VSOP87/ELP2000)
2. Subtract Lahiri ayanamsa to get sidereal longitude
Sidereal_Lon = Tropical_Lon - lahiriAyanamsa(JD)
```

For Sun: uses `Astronomy.SunPosition(time).elon`
For planets: uses `Astronomy.GeoVector(body, time, true)` → `Astronomy.Ecliptic(vec).elon`

### Source
- astronomy-engine npm package: VSOP87 (planets) + ELP2000 (Moon),
  arcsecond-grade accuracy
- Sidereal conversion: Lahiri polynomial (Module 2)

### Implementation
`astro.ts :: trueSiderealLongitude(planet: string, jd: number)`

### Verification
Reference values for 1973-04-08T06:15:00Z (Lahiri ayanamsa):

| Planet | Expected Rashi | Expected Approx Degree |
|---|---|---|
| Sun | Pisces (11) | ~24-25° Pisces |
| Moon | Cancer (3) | (from janma nakshatra Pushya) ~8-20° Cancer |

Note: EXACT reference longitudes from onlinejyotish.com's natal chart output
are needed for precise verification. The sub-lord chain verification (Module 9)
confirms the longitudes are correct to sub-lord precision (~40' minimum
boundary width), so any longitude error is < 40'.

### Tolerance
< 0.01° vs Swiss Ephemeris; < 40 arcmin confirmed by sub-lord match.

---

## Module 5: Rahu/Ketu (Lunar Nodes)

### Formula (Mean Node)
```
T = (JD - 2451545) / 36525
Omega(tropical) = 125.0445479 - 1934.1362608*T + 0.0020754*T²
Rahu(sidereal) = Omega - lahiriAyanamsa(JD)
Ketu(sidereal) = Rahu + 180°
```

### Source
Standard mean-node formula (Meeus). astronomy-engine's node search is
event-based (not a direct longitude query), so this well-documented formula
is used instead.

### Implementation
`astro.ts :: rahuLongitude(jd: number)`

### Verification
| Input | Expected (approx) |
|---|---|
| 1973-04-08 | Rahu in Sagittarius / Ketu in Gemini (verify against ref chart) |

### Tolerance
< 0.5° (mean node vs true node difference can be up to ~1.5°; this is a
known approximation).

---

## Module 6: Ascendant (Lagna)

### Formula
```
GMST = 280.46061837 + 360.98564736629*(JD-2451545) + 0.000387933*T² - T³/38710000
RAMC = (GMST + longitude) * π/180
Obliquity = (23.439291111 - 0.013004167*T - 0.0000001639*T²) * π/180
Lat_rad = latitude * π/180

Tropical_Asc = atan2(cos(RAMC), -(sin(RAMC)*cos(obliquity) + tan(lat_rad)*sin(obliquity)))
Sidereal_Asc = Tropical_Asc(deg) - lahiriAyanamsa(JD)
Lagna_Rashi = floor(Sidereal_Asc / 30)
```

### Source
Standard closed-form Ascendant formula with atan2 for correct quadrant
handling. Sign convention verified empirically: the negation pattern shown
above (not the textbook-quoted `tan(Asc)` form) is what produced the
verified result.

### Implementation
- `lagna.ts :: getSiderealAscendantDegrees()` — standalone, verified Session 5
- `astro.ts :: buildRealChart()` — identical formula, verified independently
- `kp.ts :: solvePlacidusCusps()` — same formula, Krishnamurti ayanamsa

### Verification
| Input | Expected |
|---|---|
| 1973-04-08T06:15:00Z, Bhopal (23.2599°N, 77.4126°E) | Mithuna (Gemini, rashi index 2) |
| Same with KP ayanamsa | Must match onlinejyotish.com Ascendant degree |

### Tolerance
Rashi must match exactly. Degree within 0.01° of reference after applying
correct ayanamsa.

---

## Module 7: Placidus House Cusps

### Formula
Iterative semi-arc solve:
1. Compute RAMC (same as Ascendant)
2. MC = atan2(sin(RAMC), cos(RAMC)*cos(obliquity))
3. For upper cusps (XI, XII): iterate H = RAMC + fraction*(90 + AD) where
   AD = ascensional difference = asin(tan(lat)*tan(decl))
4. For lower cusps (II, III): iterate H = IC_RA - fraction*(90 - AD)
5. Cusps VII-XII = opposite cusps I-VI + 180°
6. Convert all tropical cusps to sidereal using Krishnamurti ayanamsa

### Source
Standard Placidus algorithm (Dalton, "The Spherical Basis of Astrology").
Structural correctness verified against Naveen's reference KP chart:
all cusps differ by the same constant offset (0.0965°), confirming the
geometry is right and only the ayanamsa differed.

### Implementation
`kp.ts :: solvePlacidusCusps(birthUtc, lat, lon)`

### Verification (after Krishnamurti ayanamsa correction)
All 12 cusps must match onlinejyotish.com's KP Horoscope output for the
reference chart within tolerance.

| Cusp | Expected (from onlinejyotish.com) | Tolerance |
|---|---|---|
| I (Asc) | Match reference | < 0.01° |
| X (MC) | Match reference | < 0.01° |
| XI, XII, II, III | Match reference | < 0.01° |
| IV-IX (derived) | Opposite cusps + 180° | Exact |

---

## Module 8: Nakshatra Computation

### Formula
```
Nakshatra_index = floor(sidereal_longitude / (360/27))
Nakshatra_pada = floor((sidereal_longitude % (360/27)) / (360/27/4)) + 1
```
Each nakshatra spans 13°20' (= 360/27 = 13.3333...°).
Each pada spans 3°20' (= 360/27/4 = 3.3333...°).

### Source
Standard Vedic definition: 27 equal nakshatras starting from 0° Aries
(Ashwini). Universally agreed across all Vedic/KP traditions.

### Implementation
`astro.ts :: buildRealChart()` (planets), inline in multiple files

### Verification
| Longitude | Expected Nakshatra | Expected Pada |
|---|---|---|
| 0.0° | Ashwini (0) | 1 |
| 13.333° | Bharani (1) | 1 |
| 13.334° | Bharani (1) | 1 |
| 120.0° | Pushya (7) | 4 |
| 359.999° | Revati (26) | 4 |

### Tolerance
Exact (integer arithmetic on well-defined boundaries).

---

## Module 9: KP Sub-Lord Chain (243-fold)

### Formula
Each nakshatra (13°20') is divided into 9 parts proportional to Vimshottari
dasha years. Starting lord = nakshatra's own star lord. Cycle through the
fixed sequence: Ketu(7), Venus(20), Sun(6), Moon(10), Mars(7), Rahu(18),
Jupiter(16), Saturn(19), Mercury(17). Total = 120 years.

```
Sub_width = (lord_years / 120) * nakshatra_width
```

Sub-sub-lord: same subdivision applied recursively within each sub-lord's range.

### Source
Standard KP methodology (Krishnamurti, "Reader" series). The 243 = 9 × 27
gives the total number of sub-lord divisions across the zodiac.

### Implementation
`kp.ts :: getSubLordChain(siderealLonDeg: number)`

### Verification
**VERIFIED 22/22** against Naveen's reference KP chart:
- All 9 planets: star-lord, sub-lord, and sub-sub-lord matched exactly
- All 12 house cusps: star-lord, sub-lord, and sub-sub-lord matched exactly
- Reference: onlinejyotish.com's "KP Sub Lords - Planets" and "KP Sub Lords -
  Houses" tables, using the reference chart's own longitude values

### Test cases (boundary checks)
| Longitude | Expected Star Lord | Expected Sub Lord |
|---|---|---|
| 0.0° | Ketu (Ashwini) | Ketu (first sub) |
| 0.777...° | Ketu | Venus (second sub: 7/120 * 13.333 = 0.778°) |
| 13.333° | Venus (Bharani) | Venus (first sub) |

### Tolerance
Exact match (same lord name). If even one planet or cusp mismatches, the
entire sub-lord algorithm is suspect.

---

## Module 10: Vimshottari Dasha

### Formula
```
1. Janma Nakshatra = Moon's nakshatra index
2. Starting Mahadasha lord = SEQ[janma_nak_idx % 9]
3. Fraction elapsed in birth nakshatra = (Moon_deg_in_nakshatra) / nakshatra_width
4. First Mahadasha starts at: birth_time - (fraction * starting_lord_years * 365.25 days)
5. Each subsequent Mahadasha: duration = lord_years * 365.25 days
6. Antardasha within each Mahadasha: starts from Mahadasha lord,
   duration = (antar_lord_years / 120) * maha_lord_years * 365.25 days
```

Sequence: Ketu(7), Venus(20), Sun(6), Moon(10), Mars(7), Rahu(18),
Jupiter(16), Saturn(19), Mercury(17).

### Source
Standard Vimshottari system, universally agreed. The 120-year total and
the lord-year distribution are classical and not subject to interpretation.

### Implementation
`astro.ts :: getCurrentDasha(chart, asOf)`

### Verification
| Input | Expected |
|---|---|
| Reference chart, asOf=today | Must match Jagannath Hora or onlinejyotish.com dasha listing |
| Reference chart, asOf=1973-04-08 | Starting Mahadasha must be the lord of the janma nakshatra |

### Tolerance
Dasha boundaries within ±1 day (due to 365.25 vs actual year length
approximation over decades).

---

## Module 11: Sunrise/Sunset

### Formula
Uses `astronomy-engine :: SearchRiseSet()` with atmospheric refraction
included. Searches backward from noon for sunrise, forward from noon for
sunset.

### Source
astronomy-engine's solar event search (DE430-grade accuracy for the Sun).

### Implementation
`astro.ts :: realSunriseSunset(date, lat, lon)`

### Verification
| Input | Expected (approx) |
|---|---|
| 2024-03-20, Bhopal (equinox) | Sunrise ~06:18 IST, Sunset ~18:24 IST |
| 2024-06-21, Bhopal (solstice) | Sunrise ~05:36 IST, Sunset ~19:06 IST |

Cross-check against Drik Panchang or timeanddate.com for these dates.

### Tolerance
< 1 minute vs published almanac values.

---

## Module 12: Hora Windows

### Formula
```
Day_hora_duration = (sunset - sunrise) / 12
Night_hora_duration = (next_sunrise - sunset) / 12

Hora sequence per weekday (Chaldean order):
  Sunday:    Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
  Monday:    Moon, Saturn, Jupiter, Mars, Sun, Venus, Mercury
  (etc. — each day starts from its ruling planet)

24 horas per day: 12 daytime (from sunrise) + 12 nighttime (from sunset)
```

### Source
Classical Chaldean planetary-hour system. The weekday → starting-lord
mapping is universally agreed across Panchang traditions.

### Implementation
`muhurta.ts :: buildHoraWindows(sunrise, sunset, nextSunrise, date)`

### Verification
| Input | Expected |
|---|---|
| Sunday, sunrise=06:00, sunset=18:00 | 1st hora = Sun (06:00-07:00), 2nd = Venus (07:00-08:00) |
| Monday, sunrise=06:00, sunset=18:00 | 1st hora = Moon |
| Any day | 12 daytime + 12 nighttime horas = 24 total, no gaps |

### Tolerance
Exact (hora lord sequence is deterministic given sunrise/sunset/weekday).

---

## Module 13: Navtara / Tarabala

### Formula
```
count = ((current_nak_idx - janma_nak_idx + 27) % 27) + 1
tara_number = ((count - 1) % 9) + 1
```

Tara names: 1=Janma, 2=Sampat, 3=Vipat, 4=Kshema, 5=Pratyari, 6=Sadhak,
7=Vadha, 8=Mitra, 9=Atimitra.

Benefic taras: {2, 4, 6, 8, 9} (Sampat, Kshema, Sadhak, Mitra, Atimitra).
Malefic taras: {1, 3, 5, 7} (Janma, Vipat, Pratyari, Vadha).

### Avritti grading (for Tarabala Gate scoring)
```
avritti = ceil(count / 9)
```
- 3rd avritti (count 19-27): most auspicious, cap = 100
- 1st avritti (count 1-9): cap = 85 (benefic) or 55 (malefic)
- 2nd avritti (count 10-18): zone-based check for malefic taras

### Source
Standard Vedic Tarabala system. The avritti grading was proven in the
standalone TaraNidhi build.

### Implementation
- `muhurta.ts :: computeTara(janmaNakIdx, currentNakIdx)`
- `horaScoring.ts :: getTarabalaGate(...)`

### Verification
| Janma Nak | Current Nak | Expected Tara | Expected Benefic |
|---|---|---|---|
| 0 (Ashwini) | 0 (Ashwini) | 1 (Janma) | false |
| 0 (Ashwini) | 1 (Bharani) | 2 (Sampat) | true |
| 0 (Ashwini) | 8 (Ashlesha) | 9 (Atimitra) | true |
| 0 (Ashwini) | 9 (Magha) | 1 (Janma, 2nd cycle) | false |
| 7 (Pushya) | 7 (Pushya) | 1 (Janma) | false |
| 7 (Pushya) | 8 (Ashlesha) | 2 (Sampat) | true |
| 7 (Pushya) | 6 (Punarvasu) | 9 (Atimitra) | true |

### Tolerance
Exact (integer arithmetic).

---

## Module 14: Panchaka Dosha

### Formula
Active when: current nakshatra is in the Panchaka window (last 2 padas of
Dhanishtha through end of Revati).
```
Window: nakIdx == 22 AND degInNak >= nakWidth/2,  OR  nakIdx in {23, 24, 25, 26}
```

Weekday variants:
- Sunday: Rog Panchak (inauspicious)
- Monday: Raj Panchak (AUSPICIOUS — exception)
- Tuesday: Agni Panchak (inauspicious)
- Wednesday: no named effect (auspicious)
- Thursday: no named effect (auspicious)
- Friday: Chor Panchak (inauspicious)
- Saturday: Mrityu Panchak (inauspicious)

### Source
ARCHITECTURE.md Section 4 (window definition, Monday exception).
Weekday-variant table from commonly-published Panchang convention (Drik
Panchang). **Weekday names NOT independently confirmed by ARCHITECTURE.md's
own research** — flagged for primary source verification.

### Implementation
`muhurta.ts :: getPanchakaDosha(currentNakIdx, currentNakDeg, dow)`

### Verification
| Nak Idx | Deg in Nak | DOW | Expected Active | Expected Name |
|---|---|---|---|---|
| 21 (Shravana) | any | any | false | (not in window) |
| 22 (Dhanishtha) | 5.0 | 0 (Sun) | false | (only last 2 padas) |
| 22 (Dhanishtha) | 7.0 | 0 (Sun) | true | Rog Panchak |
| 22 (Dhanishtha) | 7.0 | 1 (Mon) | true | Raj Panchak (auspicious!) |
| 26 (Revati) | any | 6 (Sat) | true | Mrityu Panchak |

### Tolerance
Exact (boolean + string match).

---

## Module 15: Ganda Moola

### Formula
Active when current nakshatra index is in: {0, 8, 9, 17, 18, 26}
(Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati).

### Source
ARCHITECTURE.md Section 4 — directly specified. No additional weekday or
degree conditions documented.

### Implementation
`muhurta.ts :: getGandaMoola(currentNakIdx)`

### Verification
| Nak Idx | Expected Active |
|---|---|
| 0 (Ashwini) | true |
| 1 (Bharani) | false |
| 8 (Ashlesha) | true |
| 9 (Magha) | true |
| 17 (Jyeshtha) | true |
| 18 (Mula) | true |
| 26 (Revati) | true |
| 25 (Uttara Bhadrapada) | false |

### Tolerance
Exact (boolean).

---

## Module 16: Dishashool

### Formula
Weekday → inauspicious travel direction:
```
Sunday: West     Monday: East     Tuesday: North
Wednesday: North Thursday: South  Friday: West
Saturday: East
```

### Source
Commonly-published Panchang convention (Drik Panchang). **NOT confirmed by
ARCHITECTURE.md's own research pass** — flagged as unverified-against-primary.

### Implementation
`muhurta.ts :: getDishashool(dow: number)`

### Verification
| DOW | Expected Direction |
|---|---|
| 0 (Sunday) | West |
| 1 (Monday) | East |
| 4 (Thursday) | South |
| 6 (Saturday) | East |

### Tolerance
Exact (string match).

---

## Module 17: Combustion

### Formula
```
angular_distance = |planet_lon - sun_lon|  (shortest arc)
retrograde = (planet_lon_at_jd+0.25 - planet_lon_at_jd) < 0
combust = angular_distance <= orb_for_planet_and_state
```

Orb table:
| Planet | Direct Orb | Retrograde Orb | Source Confidence |
|---|---|---|---|
| Moon | 12° | 12° | Classical (Muhurta Chintamani) |
| Mars | 17° | 17° | Classical |
| Mercury | 12° | 14° | Classical |
| Jupiter | 11° | 11° | Classical |
| Venus | 10° | 8° | **ARCHITECTURE.md confirmed** |
| Saturn | 15° | 15° | Classical |

Only Venus's orbs are confirmed by ARCHITECTURE.md's own research. Others
are commonly-published classical values.

### Implementation
`astro.ts :: getCombustion(planet, jd)`

### Verification
Verify for a known date when a planet is combust (e.g. Venus near superior
conjunction) and when it's not.

### Tolerance
Angular distance < 0.01° accuracy; combust/not-combust boolean must be
correct.

---

## Module 18: Chandrabala Gate

### Formula
```
count = ((current_moon_rashi - natal_moon_rashi + 12) % 12) + 1
Present (favorable): {1, 2, 3, 5, 7, 9, 10, 11}
Absent: {4, 6, 8, 12}
Ashtama Chandra (worst): count == 8
```

Scoring caps:
- Present: cap = 100
- Absent (not 8th): cap = 70
- Ashtama (8th): cap = 40

### Source
ARCHITECTURE.md Section 4. The favorable/unfavorable positions are standard
across Vedic Muhurta traditions.

### Implementation
`horaScoring.ts :: getChandrabalaGate(natalMoonRashi, currentMoonRashi)`

### Verification
| Natal Moon Rashi | Current Moon Rashi | Expected Count | Expected Present |
|---|---|---|---|
| 0 (Aries) | 0 (Aries) | 1 | true |
| 0 (Aries) | 3 (Cancer) | 4 | false |
| 0 (Aries) | 7 (Scorpio) | 8 | false (Ashtama) |
| 3 (Cancer) | 3 (Cancer) | 1 | true |
| 3 (Cancer) | 10 (Aquarius) | 8 | false (Ashtama) |

### Tolerance
Exact (integer arithmetic).

---

## Module 19: Dasha Gate (Hora Scoring)

### Formula
```
If hora_lord == antardasha_lord: bonus = +12
Elif hora_lord == mahadasha_lord: bonus = +6
Else: bonus = 0
```

### Source
Qualitative hierarchy is classical (dasha determines what is promised;
transit can only trigger what dasha permits). The specific +12/+6 numeric
bonus is **OccultVIISION proprietary weighting** — explicitly labeled as such,
NOT a classical formula.

### Implementation
`horaScoring.ts :: getDashaGate(horaLord, mahaLord, antarLord)`

### Verification
| Hora Lord | Maha Lord | Antar Lord | Expected Bonus |
|---|---|---|---|
| "Sun" | "Sun" | "Moon" | +6 (maha match) |
| "Sun" | "Moon" | "Sun" | +12 (antar match) |
| "Sun" | "Sun" | "Sun" | +12 (antar takes priority) |
| "Sun" | "Moon" | "Mars" | 0 (unrelated) |

### Tolerance
Exact.

---

## Module 20: Hora Scoring (5-Layer Matrix)

### Formula
```
1. Base score = 40 + purpose_weight[planet] * 5
2. Add functional_nature_score * 2
3. Add dasha_gate_bonus (0/6/12)
4. Clamp to [0, 100]
5. Apply Tarabala Gate cap
6. Apply Chandrabala Gate cap

Verdict:
  score >= 80: "Excellent"
  score >= 65: "Good"
  score >= 45: "Neutral"
  score < 45: "Caution"
```

### Purpose weights (0-10 per planet)
| | Sun | Moon | Mars | Mercury | Jupiter | Venus | Saturn | Rahu | Ketu |
|---|---|---|---|---|---|---|---|---|---|
| general | 6 | 6 | 4 | 7 | 9 | 8 | 3 | 2 | 2 |
| business | 7 | 4 | 5 | 9 | 8 | 6 | 4 | 5 | 2 |
| travel | 5 | 5 | 4 | 8 | 8 | 7 | 3 | 3 | 2 |
| marriage | 4 | 7 | 3 | 5 | 9 | 9 | 2 | 2 | 2 |
| finance | 6 | 5 | 4 | 8 | 9 | 7 | 5 | 4 | 2 |

### Functional Nature by Lagna (Kendra/Trikona lords are benefic)
Defined per rashi (0-11) in `horaScoring.ts`. Example:
- Aries (0) Lagna: Sun, Mars, Jupiter are Kendra/Trikona lords (benefic)

### Source
Purpose weights: OccultVIISION proprietary (from TaraNidhi prototype).
Functional nature: classical Lagna-based functional-benefic rules.
Gate caps: proven in the standalone TaraNidhi build.

### Implementation
`horaScoring.ts :: scoreHora(...)`

### Verification
| Planet | Purpose | Lagna | Janma Nak | Current Nak | Expected Range |
|---|---|---|---|---|---|
| Jupiter | general | Aries (0) | null | 7 (Pushya) | 85-90 (high base + func benefic) |
| Saturn | general | Aries (0) | null | 7 (Pushya) | 45-55 (low base + func neutral) |
| Jupiter | general | null | null | any | 85 (no gates) |

### Tolerance
Score must be exact given the same inputs (deterministic formula).

---

## Module 21: KP Significator Logic

### Formula
A planet signifies houses through:
1. Houses owned by the planet's star-lord (nakshatra dispositor)
2. House occupied by the planet's star-lord
3. Houses owned by the planet itself
4. House occupied by the planet itself

Sign lordships: Aries=Mars, Taurus=Venus, Gemini=Mercury, Cancer=Moon,
Leo=Sun, Virgo=Mercury, Libra=Venus, Scorpio=Mars, Sagittarius=Jupiter,
Capricorn=Saturn, Aquarius=Saturn, Pisces=Jupiter.
KP co-rules: Rahu co-rules Aquarius, Ketu co-rules Scorpio.

### Source
Standard KP methodology (Krishnamurti).

### Implementation
`kpVerdict.ts :: computeSignificance(...)`

### Verification
For the reference chart: compute significances for each planet and verify
the allSignifiedHouses set matches what Jagannath Hora or onlinejyotish.com
shows in the KP significator table.

### Tolerance
Exact house-set match.

---

## Module 22: KP Promise/Denied Verdict

### Formula
```
1. Find sub-lord of the queried house cusp
2. Get sub-lord's significances (Module 21)
3. favorableCount = count of signified houses in {H, H+4, H+8, H+10} (trikona + 11th)
4. unfavorableCount = count of signified houses in {H+5, H+7, H+11} (dusthana)
5. effectiveFavorable = favorableCount + (signifies_queried_house ? 1 : 0)
6. Verdict:
   - effectiveFavorable > unfavorableCount → "promised"
   - effectiveFavorable < unfavorableCount → "denied"
   - Tie → Navtara benefic ? "promised" : "denied"
```

### Source
KP methodology (Krishnamurti). The favorable/unfavorable house groupings
and the Navtara tie-break are standard KP practice.

### Known limitations
- Multi-house combination logic NOT YET DECIDED (AND vs weighted average)
- Karyesh-Bala reversal NOT implemented
- Confidence labels NOT defined
- Gochar (transit) check NOT yet built

### Implementation
`kpVerdict.ts :: evaluateHouse(...)`

### Verification
For the reference chart, verify selected house verdicts against a manual KP
analysis or Jagannath Hora's verdict for the same birth data and house.

### Tolerance
Verdict must match ("promised" or "denied") when using identical input data
and the same methodology.

---

## Module 23: Muhurta Scanner Aggregation

### Formula
```
1. For each 30-min sample in [from, to] (daytime hours 5am-10pm local):
   a. Compute sunrise/sunset (cached per day)
   b. Build hora windows, find active hora
   c. Compute Moon's sidereal longitude → nakshatra
   d. Score via scoreHora() (5-layer)
   e. Check Panchaka, Ganda Moola, Dishashool
   f. Record result
2. Sort all samples by score descending
3. Return top-N grouped by day
```

### Source
OccultVIISION proprietary (ARCHITECTURE.md Section 4: "Date/Muhurta Scanner").
The scanning strategy and sampling interval are engineering decisions.

### Implementation
`routes/muhurtaScanner.ts :: handleMuhurtaScan(...)`

### Verification
1. Verify that the top-scoring window's hora lord and score match what
   scoreHora() returns for the same inputs when called directly
2. Verify no samples exist outside the 5am-10pm local window
3. Verify day caching works (same sunrise/sunset for all samples on same day)

### Tolerance
Scores must be identical to direct scoreHora() calls with the same inputs.

---

## Appendix A: Cross-Module Consistency Checks

These checks verify that modules work together correctly:

1. **Ayanamsa consistency**: `trueSiderealLongitude("Sun", jd)` must use
   Lahiri; `solvePlacidusCusps()` must use Krishnamurti. Mixing them up
   would produce ~0.1° errors detectable by sub-lord boundary checks.

2. **Nakshatra consistency**: `buildRealChart()` and `getSubLordChain()`
   must agree on the nakshatra index for the same longitude.

3. **Hora lord rotation**: the 24 horas must cover exactly sunrise-to-next-
   sunrise with no gaps and no overlaps.

4. **Dasha cycle coverage**: the 9 Mahadashas must span exactly 120 years
   from the computed start, with no gaps.

5. **Lagna cross-check**: `lagna.ts :: getSiderealAscendantDegrees()` and
   `astro.ts :: buildRealChart().ascDeg` must agree within 0.001° for the
   same inputs (identical formula, different implementations).

---

## Appendix B: Unverified / Flagged Items

These items have been implemented but NOT independently verified against a
primary classical source. They use commonly-published values:

1. **Combustion orbs** (all except Venus 10°/8°) — from Muhurta Chintamani /
   standard Panchang references, not ARCHITECTURE.md's research
2. **Panchaka weekday names** (Rog/Agni/Chor/Mrityu) — Drik Panchang
   convention, only Monday=Raj Panchak confirmed by ARCHITECTURE.md
3. **Dishashool direction table** — Drik Panchang, not in ARCHITECTURE.md
4. **Functional Nature by Lagna tables** — classical, well-documented, but
   specific source not cited in implementation
5. **Purpose weights** — OccultVIISION proprietary from prototype, no
   classical source (by design)

---

## Appendix C: Deliberately Unsupported / Blocked

| Item | Reason |
|---|---|
| Multi-house combination (AND vs average) | BLOCKED: domain owner decision pending |
| Confidence labels | BLOCKED: domain owner specification pending |
| Karyesh-Bala reversal | Flagged but not auto-applied |
| Lagna-Gate (6th scoring layer) | ARCHITECTURE.md never defines what it checks |
| Gochar (transit) for KP | Not yet built |
| Pancha Pakshi | Explicitly out of scope (ARCHITECTURE.md Section 4) |
| KP Horary number (1-249) as Ascendant setter | Implementation exists in routes but does not use the horary-number concept — uses natal chart Ascendant |
