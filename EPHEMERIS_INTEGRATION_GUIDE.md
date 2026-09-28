# Ephemeris Integration Guide
## NASA JPL Horizons Real Moon Position Data

**Status:** 🟢 IMPLEMENTATION IN PROGRESS  
**Date:** Sept 28, 2026  
**Impact:** Replaces hardcoded 295.5° with real astronomical data  

---

## **CRITICAL DECISION: NASA JPL Horizons (NOT Swiss Ephemeris)**

### Why NOT Swiss Ephemeris?
```
Swiss Ephemeris = AGPL-licensed
  └─ Free only if open-source
  └─ Commercial license required for SaaS: €1,500-5,000/year
  └─ OCCULTVIISION hospital B2B API = clear commercial use
  └─ Astro.com enforces licensing (has enforcement history)
  
RISK: Using AGPL without license = legal liability + potential shutdown
```

### Why NASA JPL Horizons?
```
✅ Government-funded (public domain)
✅ Free, no licensing complications
✅ Production-grade (used by NASA, JPL, space agencies)
✅ ±0.1 arc-minute accuracy (sufficient for Panchanga)
✅ DE440/DE441 ephemeris (latest, most accurate)
✅ No rate limit issues documented (generous for commercial use)
```

---

## **ARCHITECTURE: Ephemeris Module**

### File Structure
```
src/ephemeris.js
├─ getMoonPosition(date)           ← Main entry point
├─ getCachedMoonPosition(date)     ← Optional: cache by hour
└─ verifyAccuracy()                ← Validation tool

tests/ephemeris.test.js            ← Accuracy verification
```

### Integration Points
```
Calculator 1: Nakshatra Calculation
  calculateNakshatra(date)
    └─ getMoonPosition(date)        ← Real Moon data (NOT 295.5°)
    
Calculator 2: KP Sub-lord
  findSubLord(date)
    └─ getMoonPosition(date)
    └─ KP249_TABLE lookup
    
Calculator 3: Hora-Uphora
  getHoraLord(date, location)
    └─ getMoonPosition(date)
    └─ Time-based calculation
```

---

## **QUICK START: Integration Steps**

### Step 1: Replace Mock Data in calculators

**BEFORE (old):**
```javascript
const moonDegree = 295.5; // HARDCODED MOCK DATA ❌
const nakshatra = Math.floor(moonDegree / 13.333);
```

**AFTER (new):**
```javascript
const { getMoonPosition } = require('../src/ephemeris');

async function calculateNakshatra(date) {
  const moonData = await getMoonPosition(date);      // Real data ✅
  const moonDegree = moonData.longitude;
  const nakshatra = Math.floor(moonDegree / 13.333);
  return nakshatra;
}
```

### Step 2: Handle Async Properly

**For Node.js backend:**
```javascript
async function processQuery(userDate, location) {
  const moonData = await getMoonPosition(userDate);
  const nakshatra = await calculateNakshatra(userDate);
  const kpSubLord = findSubLord(moonData.longitude);
  
  return {
    moonPosition: moonData.longitude,
    nakshatra,
    kpSubLord,
    accuracy: moonData.accuracy
  };
}
```

**For browser/PWA (handle network):**
```javascript
async function queryPanchanga(date) {
  try {
    const moonData = await getMoonPosition(date);
    return calculateResults(moonData);
  } catch (error) {
    // Fallback: show error, prompt user
    console.error('Ephemeris unavailable:', error.message);
    return showError('Cannot calculate Panchanga - network issue');
  }
}
```

---

## **API RESPONSE FORMAT**

```javascript
{
  longitude: 295.52,                                    // 0-360 degrees
  accuracy: "±0.1 arc-minute (NASA JPL Horizons DE440/DE441)",
  source: "NASA JPL Horizons API",
  date: "2026-09-28T14:30:00Z",
  timestamp: 1727534400000
}
```

---

## **VERIFICATION: Reference Data (5 Test Dates)**

Before deploying, verify accuracy against:

| Date | Source | Moon Lon | Tolerance | Status |
|------|--------|----------|-----------|--------|
| 2026-09-28 | Stellarium | ~295.5° | ±0.5° | Verify |
| 1947-08-15 | Historical | ? | ±1° | Verify |
| 2000-01-01 | Y2K reference | ? | ±0.5° | Verify |
| 1975-12-25 | Christmas | ? | ±1° | Verify |
| 2030-12-31 | Future | ? | ±1° | Verify |

**How to verify:**
1. Open [NASA Horizons Interactive](https://ssd.jpl.nasa.gov/horizons/)
2. Set COMMAND = Moon, DATE = [test date]
3. Compare our result vs. Horizons output
4. If error ≤ ±1 arc-minute (0.01667°): ✅ PASS

---

## **CACHING STRATEGY (Optional, for B2B API)**

For hospital B2B API with high-volume queries:

```javascript
// Cache Moon position by hour to reduce API calls
const cachedResult = await getCachedMoonPosition(date, useCache=true);
// If same hour queried again, uses cache (1-hour TTL)
```

**Impact:**
- Reduces Horizons API calls by ~90% for hourly aggregation
- Introduces <1 minute time variation (acceptable for Panchanga)
- Critical for cost optimization at scale

---

## **NETWORK ERROR HANDLING**

Horizons API can fail for:
- Network disconnection
- Rate limiting (rare, but possible)
- API temporary outage

**Graceful fallback:**
```javascript
async function getMoonPositionWithFallback(date) {
  try {
    return await getMoonPosition(date);
  } catch (error) {
    // Option A: Use last known cache
    // Option B: Show user-facing error
    // Option C: Use approximation algorithm (less accurate)
    
    console.warn('Horizons API unavailable, using fallback...');
    return calculateMoonPositionApprox(date); // Lower accuracy
  }
}
```

---

## **TESTING CHECKLIST**

- [ ] Deploy ephemeris.js to src/
- [ ] Run tests/ephemeris.test.js (should pass all 5 test suites)
- [ ] Verify accuracy against NASA Horizons reference (5 dates)
- [ ] Update kp249.html to use getMoonPosition()
- [ ] Update automated_8step_calculator.html to use getMoonPosition()
- [ ] Update naveen_birth_calculator.html to use getMoonPosition()
- [ ] Remove all hardcoded 295.5° values
- [ ] Test in browser (handle async, show loading state)
- [ ] Test edge cases: leap years, midnight, DST
- [ ] Document API in README.md

---

## **TIMELINE**

**Day 1-2:** Ephemeris integration (this file)  
**Day 3:** Accuracy verification against reference data  
**Day 4:** Update all calculators to use real data  
**Day 5:** Documentation + edge case testing  

---

## **POST-LAUNCH: Monitoring**

Track:
- Horizons API uptime (monitor failures)
- Response times (should be <500ms per query)
- Cache hit rate (should be >90% for B2B)
- Accuracy drift (re-verify quarterly)

---

## **REFERENCES**

- **NASA JPL Horizons API:** https://ssd-api.jpl.nasa.gov/doc/horizons.html
- **Horizons Lookup Tool:** https://ssd.jpl.nasa.gov/horizons/lookup.html
- **Ephemeris Accuracy:** DE440/DE441 ±0.1 arc-minute for Moon
- **Stellarium (free verification):** https://stellarium.org/

---

**Status:** 🟢 READY FOR IMPLEMENTATION  
**Next:** Begin Day 1-2 integration in calculators  
**Owner:** Claude (Development) + Naveen (Testing)
