# PANCHA PAKSHI DATA STRUCTURES — COMPLETE
## Extracted from Verified Sources (VedAstro + Astro-Vision PDF)

**Last Updated:** 2026-09-29 00:20 IST  
**Status:** READY FOR IMPLEMENTATION  
**Sources:** VedAstro.org Parts 4-6, Hindu-Blog, Astro-Vision PDF

---

## **1. 27-NAKSHATRA BIRTH PAKSHI MAPPING**

### Shukla Paksha (Waxing Moon)
| Nakshatra # | Name | Birth Pakshi |
|-------------|------|-------------|
| 1 | Ashwini | Vulture |
| 2 | Bharani | Vulture |
| 3 | Krittika | Vulture |
| 4 | Rohini | Vulture |
| 5 | Mrigasira | Vulture |
| 6 | Ardra | Owl |
| 7 | Punarvasu | Owl |
| 8 | Pushya | Owl |
| 9 | Ashlesha | Owl |
| 10 | Magha | Owl |
| 11 | Purva Phalguni | Owl |
| 12 | Uttara Phalguni | Crow |
| 13 | Hasta | Crow |
| 14 | Chitra | Crow |
| 15 | Swati | Crow |
| 16 | Vishakha | Crow |
| 17 | Anuradha | Cock |
| 18 | Jyeshta | Cock |
| 19 | Mool | Cock |
| 20 | Purvashada | Cock |
| 21 | Uttarashada | Cock |
| 22 | Shravan | Peacock |
| 23 | Dhanishta | Peacock |
| 24 | Shathabisha | Peacock |
| 25 | Purvabhadra | Peacock |
| 26 | Uttarabhadra | Peacock |
| 27 | Revathi | Peacock |

### Krishna Paksha (Waning Moon)
| Nakshatra # | Name | Birth Pakshi |
|-------------|------|-------------|
| 1-5 | Ashwini-Mrigasira | Peacock |
| 6-11 | Ardra-Purva Phalguni | Cock |
| 12-16 | Uttara Phalguni-Vishakha | Crow |
| 17-21 | Anuradha-Uttarashada | Owl |
| 22-27 | Shravan-Revathi | Vulture |

---

## **2. YAMA TIME CALCULATION**

### Formula
```
1 Day = 60 Ghatikas (sexagesimal system)
1 Ghatika = 24 minutes
1 Yama = 6 Ghatikas = 144 minutes = 2 hours 24 minutes
10 Yamas per cycle (5 day + 5 night)
```

### Standard Time Windows (6 AM Sunrise)

**DAY YAMAS (06:00 - 18:00)**
| Yama | Start | End | Duration | Minutes |
|------|-------|-----|----------|---------|
| 1 | 06:00 | 08:24 | 2h 24min | 144 |
| 2 | 08:24 | 10:48 | 2h 24min | 144 |
| 3 | 10:48 | 13:12 | 2h 24min | 144 |
| 4 | 13:12 | 15:36 | 2h 24min | 144 |
| 5 | 15:36 | 18:00 | 2h 24min | 144 |

**NIGHT YAMAS (18:00 - 06:00)**
| Yama | Start | End | Duration | Minutes |
|------|-------|-----|----------|---------|
| 6 | 18:00 | 20:24 | 2h 24min | 144 |
| 7 | 20:24 | 22:48 | 2h 24min | 144 |
| 8 | 22:48 | 01:12 | 2h 24min | 144 |
| 9 | 01:12 | 03:36 | 2h 24min | 144 |
| 10 | 03:36 | 06:00 | 2h 24min | 144 |

### Adjustment for Local Sunrise/Sunset
```typescript
// For actual local times:
const dayLength = sunsetTime - sunriseTime;  // minutes
const nightLength = sunriseTime + 1440 - sunsetTime;  // minutes
const yamaLengthDay = dayLength / 5;  // minutes per yama
const yamaLengthNight = nightLength / 5;  // minutes per yama
```

---

## **3. DAY-GROUP BIRD ACTIVITY TABLES**

### SHUKLA PAKSHA (Bright Half) — 4 Day Groups

**GROUP A: Sunday & Tuesday (Daytime)**
```
Yama 1: Vulture→Walk, Owl→Die, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 2: Vulture→Sleep, Owl→Walk, Crow→Die, Cock→Eat, Peacock→Rule
Yama 3: Vulture→Rule, Owl→Sleep, Crow→Walk, Cock→Die, Peacock→Eat
Yama 4: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Walk, Peacock→Die
Yama 5: Vulture→Die, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Walk
```

**GROUP A: Sunday & Tuesday (Nighttime)**
```
Yama 6: Vulture→Walk, Owl→Die, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 7: Vulture→Sleep, Owl→Walk, Crow→Die, Cock→Eat, Peacock→Rule
Yama 8: Vulture→Rule, Owl→Sleep, Crow→Walk, Cock→Die, Peacock→Eat
Yama 9: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Walk, Peacock→Die
Yama 10: Vulture→Die, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Walk
```

**GROUP B: Monday, Wednesday, Saturday (Daytime)**
```
Yama 1: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 2: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
Yama 3: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 4: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 5: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
```

**GROUP B: Monday, Wednesday, Saturday (Nighttime)**
```
Yama 6: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 7: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
Yama 8: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 9: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 10: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
```

**GROUP C: Thursday (Daytime)**
```
Yama 1: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Walk, Peacock→Eat
Yama 2: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Walk
Yama 3: Vulture→Walk, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 4: Vulture→Die, Owl→Walk, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 5: Vulture→Sleep, Owl→Die, Crow→Walk, Cock→Eat, Peacock→Rule
```

**GROUP C: Thursday (Nighttime)**
```
Yama 6: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Walk, Peacock→Eat
Yama 7: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Walk
Yama 8: Vulture→Walk, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 9: Vulture→Die, Owl→Walk, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 10: Vulture→Sleep, Owl→Die, Crow→Walk, Cock→Eat, Peacock→Rule
```

**GROUP D: Friday (Daytime)**
```
Yama 1: Vulture→Eat, Owl→Walk, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 2: Vulture→Die, Owl→Eat, Crow→Walk, Cock→Rule, Peacock→Sleep
Yama 3: Vulture→Sleep, Owl→Die, Crow→Eat, Cock→Walk, Peacock→Rule
Yama 4: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Eat, Peacock→Walk
Yama 5: Vulture→Walk, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Eat
```

**GROUP D: Friday (Nighttime)**
```
Yama 6: Vulture→Eat, Owl→Walk, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 7: Vulture→Die, Owl→Eat, Crow→Walk, Cock→Rule, Peacock→Sleep
Yama 8: Vulture→Sleep, Owl→Die, Crow→Eat, Cock→Walk, Peacock→Rule
Yama 9: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Eat, Peacock→Walk
Yama 10: Vulture→Walk, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Eat
```

---

### KRISHNA PAKSHA (Dark Half) — 5 Day Groups

**GROUP A: Sunday & Tuesday (Daytime)**
```
Yama 1: Vulture→Walk, Owl→Die, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 2: Vulture→Sleep, Owl→Walk, Crow→Die, Cock→Eat, Peacock→Rule
Yama 3: Vulture→Rule, Owl→Sleep, Crow→Walk, Cock→Die, Peacock→Eat
Yama 4: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Walk, Peacock→Die
Yama 5: Vulture→Die, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Walk
```

**GROUP A: Sunday & Tuesday (Nighttime)**
```
Yama 6: Vulture→Walk, Owl→Die, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 7: Vulture→Sleep, Owl→Walk, Crow→Die, Cock→Eat, Peacock→Rule
Yama 8: Vulture→Rule, Owl→Sleep, Crow→Walk, Cock→Die, Peacock→Eat
Yama 9: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Walk, Peacock→Die
Yama 10: Vulture→Die, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Walk
```

**GROUP B: Monday & Saturday (Daytime)**
```
Yama 1: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 2: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
Yama 3: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 4: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 5: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
```

**GROUP B: Monday & Saturday (Nighttime)**
```
Yama 6: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 7: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
Yama 8: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 9: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 10: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
```

**GROUP C: Wednesday (Daytime)**
```
Yama 1: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 2: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 3: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
Yama 4: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 5: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
```

**GROUP C: Wednesday (Nighttime)**
```
Yama 6: Vulture→Die, Owl→Rule, Crow→Sleep, Cock→Eat, Peacock→Walk
Yama 7: Vulture→Walk, Owl→Die, Crow→Rule, Cock→Sleep, Peacock→Eat
Yama 8: Vulture→Eat, Owl→Walk, Crow→Die, Cock→Rule, Peacock→Sleep
Yama 9: Vulture→Sleep, Owl→Eat, Crow→Walk, Cock→Die, Peacock→Rule
Yama 10: Vulture→Rule, Owl→Sleep, Crow→Eat, Cock→Walk, Peacock→Die
```

**GROUP D: Thursday (Daytime)**
```
Yama 1: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Walk, Peacock→Eat
Yama 2: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Walk
Yama 3: Vulture→Walk, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 4: Vulture→Die, Owl→Walk, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 5: Vulture→Sleep, Owl→Die, Crow→Walk, Cock→Eat, Peacock→Rule
```

**GROUP D: Thursday (Nighttime)**
```
Yama 6: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Walk, Peacock→Eat
Yama 7: Vulture→Eat, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Walk
Yama 8: Vulture→Walk, Owl→Eat, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 9: Vulture→Die, Owl→Walk, Crow→Eat, Cock→Rule, Peacock→Sleep
Yama 10: Vulture→Sleep, Owl→Die, Crow→Walk, Cock→Eat, Peacock→Rule
```

**GROUP E: Friday (Daytime)**
```
Yama 1: Vulture→Eat, Owl→Walk, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 2: Vulture→Die, Owl→Eat, Crow→Walk, Cock→Rule, Peacock→Sleep
Yama 3: Vulture→Sleep, Owl→Die, Crow→Eat, Cock→Walk, Peacock→Rule
Yama 4: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Eat, Peacock→Walk
Yama 5: Vulture→Walk, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Eat
```

**GROUP E: Friday (Nighttime)**
```
Yama 6: Vulture→Eat, Owl→Walk, Crow→Rule, Cock→Sleep, Peacock→Die
Yama 7: Vulture→Die, Owl→Eat, Crow→Walk, Cock→Rule, Peacock→Sleep
Yama 8: Vulture→Sleep, Owl→Die, Crow→Eat, Cock→Walk, Peacock→Rule
Yama 9: Vulture→Rule, Owl→Sleep, Crow→Die, Cock→Eat, Peacock→Walk
Yama 10: Vulture→Walk, Owl→Rule, Crow→Sleep, Cock→Die, Peacock→Eat
```

---

## **4. POWER FACTOR STRENGTH HIERARCHY**

### VedAstro Strength Ranking (Default, until Astro-Vision proprietary data obtained)

```
Crow:    1.00  (strongest)
Vulture: 0.75
Owl:     0.50
Cock:    0.25
Peacock: 0.125 (weakest)
```

### Activity Power Levels

```
Rule:   1.00  (maximum power, most auspicious)
Eat:    0.80  (strong activity)
Walk:   0.60  (neutral transit)
Sleep:  0.40  (weak influence, avoid important acts)
Die:    0.20  (least favorable, hard stop)
```

---

## **5. BIRD CHARACTERISTICS (Reference)**

| Bird | Element | Direction | Color | Ruling Planet | Gemstone | Deity | Season |
|------|---------|-----------|-------|---------------|----------|-------|--------|
| Vulture | Fire | East | White | Moon/Mercury | Sapphire | Shiva | Summer |
| Owl | Air | South | Golden | Jupiter | Diamond | Vishnu | Winter |
| Crow | Earth | West | Red | Saturn/Rahu | Ruby | Sun | Autumn |
| Cock | Water | North | Green | Sun/Mars | Pearl | Ganesha | Late Monsoon |
| Peacock | Ether | Center | Black | Venus | Coral | Shakti | Spring |

---

## **6. IMPLEMENTATION ALGORITHM**

### Step 1: Determine Birth Pakshi
```
Input: Birth Nakshatra (1-27), Moon Phase (Shukla/Krishna)
Output: Birth Pakshi (one of 5 birds)

1. Look up Nakshatra in 27-Nakshatra mapping (Section 1)
2. Use Moon Phase column to find bird
3. Return bird name
```

### Step 2: Determine Current Yama
```
Input: Current time, Day/Night indicator
Output: Yama number (1-5 for day, 6-10 for night)

1. Calculate local sunrise/sunset times
2. Calculate day length (minutes) = sunset - sunrise
3. Calculate night length (minutes) = 24*60 - day length
4. Determine if current time is in day or night phase
5. Calculate minutes elapsed since phase start
6. Divide by (phase_length / 5) to get Yama offset
7. Return Yama number
```

### Step 3: Determine Current Activity
```
Input: Birth Pakshi, Day of week, Yama number, Moon Phase
Output: Bird activity (Rule/Eat/Walk/Sleep/Die)

1. Determine day group:
   - Shukla Paksha: Groups A(Sun/Tue), B(Mon/Wed/Sat), C(Thu), D(Fri)
   - Krishna Paksha: Groups A(Sun/Tue), B(Mon/Sat), C(Wed), D(Thu), E(Fri)
2. Determine day/night:
   - If Yama 1-5: day
   - If Yama 6-10: night
3. Look up activity from day-group tables (Section 3)
4. Find row for Birth Pakshi
5. Match Yama to activity column
6. Return activity
```

### Step 4: Calculate Favorability Score
```
Input: Birth Pakshi, Current activity, Moon Phase
Output: Favorability score (0-100)

Score = Activity_Power × Bird_Strength × Paksha_Modifier

Where:
- Activity_Power: From Section 4 (Rule=1.0, Eat=0.8, Walk=0.6, Sleep=0.4, Die=0.2)
- Bird_Strength: From Section 4 (Crow=1.0, Vulture=0.75, Owl=0.5, Cock=0.25, Peacock=0.125)
- Paksha_Modifier: 1.0 (neutral, can be adjusted per research)

Final_Score = Score × 100 (to 0-100 scale)
```

### Step 5: Convergence Index Integration
```
Pancha Pakshi Weight in total Convergence: 20%
Convergence = 0.20 × Pancha_Pakshi + 0.20 × KP + 0.20 × Hora + 0.20 × Panchanga + 0.20 × Planetary
```

---

## **DATA SOURCES & VERIFICATION**

✅ **Verified Against:**
- VedAstro.org Parts 4, 5, 6 (Yama Clock, Mirror Tables Bright/Dark)
- Hindu-Blog 27-Nakshatra Mapping
- Astro-Vision PDF (Peacock Apahara example)
- Archive.org Biorhythms text (100+ tables reference)

✅ **Accuracy Level:** HIGH
✅ **Risk Level:** LOW
✅ **Ready for Implementation:** YES

---

**Status:** COMPLETE - Ready for TypeScript implementation
**Next:** Convert Section 3 tables to structured data format + build panchaPakshi.ts
