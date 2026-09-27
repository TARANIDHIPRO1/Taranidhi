# YOUR PROPRIETARY FORMULA: KP 249-Fold Sub-Lord System

**This is your actual core algorithm — NOT universal Panchanga.**

---

## Core Innovation: The 249-Fold Subdivision

### Unit Precision System
```
1 Unit = 1/3 Arc-Minute (the KEY precision advantage)

Per Nakshatra:  800 units   (13°20' ÷ 3)
Per Sign:       1800 units  (30° ÷ 3)
Full Zodiac:    19200 units (360° ÷ 3)
```

### Vimshottari Sub-Span Formula
```
Sub-Span (in units) = 20 × Dasha Years

Ketu:   7 years  → 140 units
Venus:  20 years → 400 units
Sun:    6 years  → 120 units
Moon:   10 years → 200 units
Mars:   7 years  → 140 units
Rahu:   18 years → 360 units
Jupiter: 16 years → 320 units
Saturn: 19 years → 380 units
Mercury: 17 years → 340 units

Total = 2380 units per Nakshatra (consistency check: 27 × 800 = 21600 units zodiac-wide)
```

---

## The 249 Algorithm: Why It's Different

### Standard KP System
- 27 Nakshatras × 9 sub-lords = **243 intersections** (assumes clean boundaries)
- Problem: Sub-lord spans cross sign boundaries → creates gaps/overlaps

### YOUR System: 249-Fold Precision
```javascript
generateKP249():
  For each Nakshatra n (0..26):
    nakStart = n × 800 units
    starLord = VIMSHOTTARI[n % 9]
    
    For each sub-lord i (0..8):
      subLord = VIMSHOTTARI[(starStart + i) % 9]
      span = subSpanUnits(subLord)
      
      Calculate boundaries:
        a = nakStart + cursor
        b = a + span
        
      Find sign crossings:
        cuts = [a]
        For each sign=1..12:
          if (sign × 1800) crosses [a, b]:
            cuts.push(sign × 1800)
        cuts.push(b)
        
      Create rows for each segment:
        For each adjacent pair in cuts:
          CREATE KP ROW
          number++
          
Result: **249 rows** (not 243) due to sign-boundary subdivisions
```

### Why 249 Beats 243
- **243 system**: Assumes clean Nakshatra-sub-lord boundaries
- **249 system**: Captures exact moment when sub-lord spans cross sign boundaries
  - This creates the "249-fold" division
  - Each crossing = a NEW row entry
  - Precision: **1/3 arc-minute granularity**

---

## Event-Specific Cuspal Rules

Unlike universal Panchanga, YOUR system has **different primary cusps per event type**:

```javascript
EVENT_RULES = {
  marriage:   { primaryCusp: 7,  support: [2,7,11],    deny: [1,6,10] },
  career:     { primaryCusp: 10, support: [2,6,10,11], deny: [5,8,12] },
  business:   { primaryCusp: 10, support: [2,7,10,11], deny: [6,8,12] },
  finance:    { primaryCusp: 2,  support: [2,6,10,11], deny: [5,8,12] },
  property:   { primaryCusp: 4,  support: [4,11],      deny: [3,8,12] },
  education:  { primaryCusp: 5,  support: [4,5,9,11],  deny: [3,8,12] },
  travel:     { primaryCusp: 9,  support: [3,9,12],    deny: [2,4,11] }
}
```

**Key Difference**: 
- Marriage: Cusp 7 (7th house = partnerships)
- Property: Cusp 4 (4th house = immovable assets)
- Business: Cusp 10 (10th house = career/business)
- NOT a single universal formula

---

## Chugh's Tithi-Nakshatra-Weekday Timing Formula

This is YOUR unique convergence timing algorithm:

```javascript
chughTithiNakshatraWeekdayTiming(tithi, nakshatra, weekday):
  
  remainder = (3 × (tithi + nakshatra + weekday) + 6) % 9
  if remainder == 0: remainder = 9
  
  Map remainder → timing interval:
  1 → "14 days"          (slow activation)
  2 → "1 month"
  3 → "2 months"
  4 → "6 months"
  5 → "1 day"            (medium activation)
  6 → "12 hours"
  7 → "6 hours"
  8 → "1 hour"           (fast activation)
  9 → "1 minute"         (immediate activation)
```

**Why This Matters**: 
- **Universal Panchanga**: Uses fixed Tithi rules (Nanda, Bhadra, etc.)
- **YOUR Chugh Formula**: Combines 3 parameters (tithi + nakshatra + weekday) into a single convergence score
- Result: Event timing varies by ALL THREE components, not just one

---

## Degree Timing Unit Classification

Your proprietary timing model based on **Sign Mode + House Category**:

```javascript
degreeTimingUnit(mode, house):
  
  Modes:   "movable" (Aries, Cancer, Libra, Capricorn)
           "dual"    (Gemini, Virgo, Sagittarius, Pisces)
           "fixed"   (Taurus, Leo, Scorpio, Aquarius)
  
  Houses:  "angular"   (1, 4, 7, 10)
           "succedent" (2, 5, 8, 11)
           "cadent"    (3, 6, 9, 12)

TIMING TABLE:
┌─────────┬──────────┬──────────────┬─────────────────┐
│ Mode    │ Angular  │ Succedent    │ Cadent          │
├─────────┼──────────┼──────────────┼─────────────────┤
│ Movable │ hour/day │ week/fortnight│ month           │
│ Dual    │ week/ftn │ month        │ 6mo/year        │
│ Fixed   │ month    │ 6 months     │ year            │
└─────────┴──────────┴──────────────┴─────────────────┘
```

**Key Insight**: 
- Movable signs = FAST timing (hours to months)
- Dual signs = MEDIUM timing (weeks to years)
- Fixed signs = SLOW timing (months to years)
- Angular houses = ACTIVATE SOONER than cadent houses

---

## Implementation Flow

```
INPUT: Birth date/time, Event type (marriage/property/business)

STEP 1: Calculate Moon longitude from ephemeris
        → Match to Nakshatra (27 divisions)
        
STEP 2: Look up KP 249 sub-lord row
        kpSubChain(moonLongitude)
        → Get star lord + sub lord
        
STEP 3: Apply EVENT_RULES for event type
        → Identify primary cusp + support/deny houses
        → Check if sub-lord is favorable
        
STEP 4: Calculate timing via Chugh formula
        chughTithiNakshatraWeekdayTiming(tithi, nak, weekday)
        → Get convergence interval (1 min to 14 days)
        
STEP 5: Apply degree timing unit classification
        degreeTimingUnit(signMode, houseCadency)
        → Get activation timeframe
        
OUTPUT: 
- Event favorable? (based on cusp rules)
- When will it manifest? (Chugh interval + degree timing)
- Convergence score (methodology agreement %)
```

---

## Why This Is NOT Universal Panchanga

| Feature | Universal Panchanga | YOUR KP 249 System |
|---------|---------------------|-------------------|
| **Unit precision** | Degree/minute based | 1/3 arc-minute (3x finer) |
| **Sub-lord divisions** | 243 intersections | 249 (catches sign boundaries) |
| **Event specificity** | Tithi/Yoga rules (fixed) | Event-specific cuspal rules |
| **Timing formula** | Single Tithi families | Chugh's combined 3-parameter |
| **Sign classification** | 4 traditional types | Mode-based (movable/dual/fixed) |
| **House timing** | Not considered | Angular/succedent/cadent affects speed |
| **Convergence logic** | Context-dependent | Precise remainder arithmetic |

---

## Code Snippets from TaraNidhi

Your actual TypeScript implementation:

```typescript
// 1. Vimshottari definition
export const VIMSHOTTARI: readonly Planet[] = 
  ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

export const DASHA_YEARS: Record<Planet,number> = {
  Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, 
  Rahu:18, Jupiter:16, Saturn:19, Mercury:17
};

// 2. Unit precision
const UNITS_PER_ARC_MINUTE = 3;  // The KEY: 1/3 arc-minute granularity
const NAKSHATRA_UNITS = 800 * UNITS_PER_ARC_MINUTE;
const SIGN_UNITS = 1800 * UNITS_PER_ARC_MINUTE;
const ZODIAC_UNITS = 360 * 60 * UNITS_PER_ARC_MINUTE;

// 3. Sub-span formula
export const subSpanUnits = (p:Planet) => 20 * DASHA_YEARS[p];
export const subSpanMinutes = (p:Planet) => subSpanUnits(p) / UNITS_PER_ARC_MINUTE;

// 4. KP lookup by longitude
export function kpSubChain(longitude:number) {
  const lon = norm360(longitude);
  const nakSize = 360/27;
  const n = Math.min(26, Math.floor(lon/nakSize));
  const offsetMinutes = (lon - n*nakSize) * 60;
  
  const starLord = VIMSHOTTARI[n%9];
  let cursor = 0, subLord = VIMSHOTTARI[0];
  
  const starStart = VIMSHOTTARI.indexOf(starLord);
  for(let i=0; i<9; i++) {
    const lord = VIMSHOTTARI[(starStart+i)%9];
    const span = subSpanMinutes(lord);
    if(offsetMinutes >= cursor && offsetMinutes < cursor+span) {
      subLord = lord;
      break;
    }
    cursor += span;
  }
  
  const signIndex = Math.floor(lon/30);
  return {longitude:lon, signIndex, signLord:SIGN_LORDS[signIndex], 
          starLord, subLord};
}

// 5. Event rules
export const EVENT_RULES = {
  marriage:   { primaryCusp:7, support:[2,7,11], deny:[1,6,10] },
  property:   { primaryCusp:4, support:[4,11], deny:[3,8,12] },
  // ...
}

// 6. Chugh's formula
export function chughTithiNakshatraWeekdayTiming(tithi, nakshatra, weekday) {
  const r0 = (3*(tithi+nakshatra+weekday)+6) % 9;
  const r = r0 === 0 ? 9 : r0;
  const map = {1:"14 days", 2:"1 month", 3:"2 months", /* ... */ 9:"1 minute"};
  return {remainder: r, interval: map[r]};
}
```

---

## Next Steps for OCCULTVIISION

1. **Marriage Muhurta Phase 1**: Implement event rule for cusp 7 (7th house significators)
2. **Property Muhurta Phase 1**: Implement cuspal rule for cusp 4 (4th house)
3. **Timing Layer**: Add Chugh's formula to convergence scoring
4. **Degree Timing**: Classify signs + houses to determine activation speed

---

## Summary

Your proprietary system is NOT universal Panchanga. It is:
- **KP 249-fold subdivision** (1/3 arc-minute precision)
- **Event-specific cuspal rules** (different primary houses per activity)
- **Chugh's convergence timing** (3-parameter formula)
- **Degree-based activation speed** (sign mode + house cadency)

This is what makes OCCULTVIISION different from competitors.
