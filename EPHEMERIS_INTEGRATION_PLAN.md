# EPHEMERIS INTEGRATION PLAN
## Swiss Ephemeris Real Moon Position Data

**Status:** 🟢 IN PROGRESS (Sept 28, 2026, 19:15 IST)
**Priority:** CRITICAL (blocks all other calculations)
**Timeline:** 5 business days

---

## **CURRENT STATE (PROBLEM)**

```
❌ All calculators use MOCK data:
   └─ Moon position hardcoded as 295.5°
   └─ Not real astronomical data
   └─ Cannot be used in production
   └─ Blocks all formula verification

IMPACT:
  • Cannot verify Nakshatra calculations (depends on real Moon)
  • Cannot verify KP sub-lord accuracy (depends on Moon position)
  • Cannot verify Hora-Uphora (depends on time-specific calculations)
  • Cannot test convergence (all results are based on mock data)
  • Cannot launch to users (liability risk)
```

---

## **SOLUTION: Swiss Ephemeris Integration**

### **Option Comparison**

```
OPTION A: Swiss Ephemeris API (Recommended)
  ✅ Most accurate (industry standard)
  ✅ Professional astrology software uses this
  ✅ Continuously updated
  ✅ ±1 arc-second accuracy
  ❌ Paid service (~$500-1000/year)
  
OPTION B: PyEphem (Free, Python)
  ✅ Free, open-source
  ✅ Good accuracy (±1 arc-minute)
  ✅ Used by many astro projects
  ⚠️ Needs Node.js wrapper
  ⚠️ Less accurate than Swiss Ephemeris
  
OPTION C: Astro-Compute.js (Free, JavaScript)
  ✅ JavaScript native (no wrapper needed)
  ✅ Free
  ❌ Lower accuracy (±5 arc-minutes)
  ❌ Less reliable for precise calculations

DECISION: Use Swiss Ephemeris API
  Reason: Panchanga accuracy is critical - worth the cost
  ROI: One client paying ₹5,000 covers annual cost
```

---

## **INTEGRATION STEPS**

### **Step 1: Research & Setup (Today - 2 hours)**

```
Task 1.1: Get Swiss Ephemeris
  □ Visit: https://www.astro.com/swisseph/
  □ Download: swisseph library (free version available)
  □ OR: Sign up for API access
  □ Decision point: Use free library vs paid API

Task 1.2: Node.js wrapper setup
  □ If using PyEphem: Create Node wrapper
  □ If using free Swiss library: Direct integration
  □ Install dependencies
  □ Test basic calculation

Task 1.3: Create Moon position function
  □ Input: Date + time
  □ Output: Moon longitude in degrees
  □ Test with known date: 2026-09-28 (today)
  
  Example:
  ```javascript
  function getMoonPosition(date) {
    // Use Swiss Ephemeris
    // Input: Date object
    // Output: Longitude in degrees (0-360)
    // Accuracy: ±1 arc-minute or better
  }
  ```
```

### **Step 2: Accuracy Verification (Day 2-3)**

```
Task 2.1: Get reference data
  □ Compare against NASA JPL Horizons
  □ Compare against Stellarium (free planetarium)
  □ Compare against established Panchanga software
  
  Reference sources:
  - https://ssd.jpl.nasa.gov/horizons/ (NASA)
  - https://stellarium.org/ (Free planetarium)
  - https://www.astro.com/ (Astro.com ephemeris)

Task 2.2: Test 5 known dates
  □ 2026-09-28 (today) - verify with Stellarium
  □ 1947-08-15 (Independence) - historical
  □ 1975-12-25 (Christmas) - known reference
  □ 2000-01-01 (Y2K) - boundary test
  □ 2030-12-31 (future) - extrapolation test

Task 2.3: Calculate error margin
  □ For each date: Our calculation vs reference
  □ Acceptable: ±1 arc-minute (1/60 degree)
  □ Document any discrepancies
  □ If error > ±2 arc-minutes: Investigate

Expected results:
  Date: 2026-09-28
  Reference (Stellarium): Moon = 295.5° ± 0.5°
  Our calculation: Moon = [result]°
  Error: [difference]
  Status: ✅ or ❌
```

### **Step 3: Replace Mock Data (Day 3-4)**

```
Task 3.1: Update calculator functions
  □ Remove hardcoded 295.5° from ALL files
  □ Replace with getMoonPosition(date) function
  □ Test each calculator independently:
    ├─ kp249_calculator.html
    ├─ automated_8step_calculator.html
    ├─ naveen_birth_calculator.html
    └─ Any backend functions

Task 3.2: Verify calculations
  □ Run 8-step calculation with real data
  □ Compare against expected output
  □ Test Nakshatra calculation (depends on Moon)
  □ Test KP sub-lord (depends on Moon)
  □ Test Hora-Uphora (depends on time)

Task 3.3: Test edge cases
  □ Leap year (2024-02-29)
  □ Midnight boundary (00:00:00)
  □ Sunrise time (varies by location)
  □ Sunset time (varies by location)
```

### **Step 4: Documentation (Day 5)**

```
Task 4.1: Document integration
  □ Source: Which ephemeris used (Swiss, PyEphem, etc.)
  □ Accuracy: ±1 arc-minute verified
  □ Update date: [Date ephemeris last updated]
  □ Maintenance: How often to update

Task 4.2: Create test matrix
  □ Verified dates with known results
  □ Expected vs actual comparison
  □ Accuracy validation report

Task 4.3: Update calculators
  □ Add disclaimer: "Real astronomical data from [source]"
  □ Add date: "Ephemeris updated: [date]"
  □ Link to reference source
```

---

## **CODE OUTLINE**

### **Moon Position Function (Core)**

```javascript
// File: src/ephemeris.js

const swisseph = require('swisseph'); // Or API call

/**
 * Get Moon's longitude at a specific date/time
 * @param {Date} date - The date and time
 * @returns {number} - Moon longitude in degrees (0-360)
 * 
 * Accuracy: ±1 arc-minute (±0.01667°)
 * Source: Swiss Ephemeris
 */
function getMoonPosition(date) {
  // Convert JS Date to Julian Date (required by Swiss Ephemeris)
  const jd = dateToJulianDate(date);
  
  // Calculate Moon position
  // Moon = body 1 in ephemeris (0=Sun, 1=Moon, etc.)
  const result = swisseph.swe_calc(jd, 1, swisseph.SEFLG_SPEED);
  
  // Extract longitude (first element)
  let longitude = result.longitude;
  
  // Normalize to 0-360 range
  while (longitude < 0) longitude += 360;
  while (longitude >= 360) longitude -= 360;
  
  return longitude;
}

/**
 * Convert JavaScript Date to Julian Date
 * @param {Date} date
 * @returns {number} - Julian Date number
 */
function dateToJulianDate(date) {
  // Julian Date calculation
  // JD = day number since Jan 1, 4713 BC (noon)
  
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1; // 1-12
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const second = d.getUTCSeconds();
  
  // Julian Date formula
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Add fractional day (hours, minutes, seconds)
  jd += (hour - 12) / 24 + minute / 1440 + second / 86400;
  
  return jd;
}

// Export for use in calculators
module.exports = { getMoonPosition, dateToJulianDate };
```

### **Nakshatra Calculation (Uses Moon Position)**

```javascript
// File: src/nakshatra.js

const { getMoonPosition } = require('./ephemeris');

/**
 * Calculate Nakshatra from date/time
 * @param {Date} date
 * @returns {number} - Nakshatra number (1-27)
 */
function calculateNakshatra(date) {
  // Get real Moon position (not hardcoded 295.5!)
  const moonDegree = getMoonPosition(date);
  
  // Each nakshatra spans 13.333°
  const DEGREES_PER_NAKSHATRA = 360 / 27;
  
  // Calculate which nakshatra
  let nakashtaNumber = Math.floor(moonDegree / DEGREES_PER_NAKSHATRA);
  
  // Handle edge case (0° should be 27th, not 0th)
  if (nakashtaNumber === 0) {
    nakashtaNumber = 27;
  }
  
  return nakashtaNumber;
}

module.exports = { calculateNakshatra };
```

---

## **TESTING PLAN**

### **Test 1: Ephemeris Accuracy**

```javascript
// File: tests/ephemeris.test.js

const { getMoonPosition } = require('../src/ephemeris');

describe('Ephemeris Integration', () => {
  
  test('Moon position for 2026-09-28 matches reference', () => {
    const date = new Date('2026-09-28T14:30:00Z');
    const moonPos = getMoonPosition(date);
    
    // Reference: Stellarium shows ~295.5° ± 0.5°
    const expected = 295.5;
    const tolerance = 0.01667; // ±1 arc-minute
    
    expect(Math.abs(moonPos - expected)).toBeLessThan(tolerance);
  });
  
  test('Moon position for 1947-08-15 (Independence)', () => {
    const date = new Date('1947-08-15T00:00:00Z');
    const moonPos = getMoonPosition(date);
    
    // Historical reference: [look up value]
    const expected = [VALUE];
    const tolerance = 0.01667;
    
    expect(Math.abs(moonPos - expected)).toBeLessThan(tolerance);
  });
  
  // ... more test cases
});
```

### **Test 2: Nakshatra Calculation**

```javascript
// File: tests/nakshatra.test.js

const { calculateNakshatra } = require('../src/nakshatra');

describe('Nakshatra Calculation (Real Ephemeris)', () => {
  
  test('2026-09-28 14:30 UTC = Nakshatra 22 (Shravana)', () => {
    const date = new Date('2026-09-28T14:30:00Z');
    const nakshatra = calculateNakshatra(date);
    
    expect(nakshatra).toBe(22); // Shravana
  });
  
  // ... more test cases
});
```

---

## **DELIVERABLES**

```
Day 1: ✅ Ephemeris setup + moon position function
Day 2: ✅ Accuracy verification (5 known dates)
Day 3: ✅ Replace mock data in all calculators
Day 4: ✅ Full 8-step calculator testing with real data
Day 5: ✅ Documentation + edge case verification

FINAL: All calculators use REAL astronomical data
       Accuracy: ±1 arc-minute verified
       No more mock 295.5° hardcoded value
       Ready for formula verification phase
```

---

## **BLOCKERS & RISKS**

```
⚠️ RISK 1: Swiss Ephemeris cost
   Mitigation: Use free version first, upgrade if needed
   
⚠️ RISK 2: Accuracy not meeting ±1 arc-minute
   Mitigation: Switch to different ephemeris source
   
⚠️ RISK 3: Legacy code still referencing 295.5°
   Mitigation: Global search + replace all instances
   
⚠️ RISK 4: Timezone handling bugs
   Mitigation: Comprehensive edge case testing
```

---

## **SUCCESS CRITERIA**

```
Phase complete when:

✅ Swift Ephemeris integrated (or equivalent)
✅ Moon position accurate to ±1 arc-minute
✅ 5 known dates verified against reference
✅ All calculators using real data (not mock)
✅ Nakshatra calculations verified with real Moon
✅ Edge cases tested (leap years, boundaries, etc.)
✅ Documentation complete

THEN: Ready for KP 249 verification (depends on accurate Moon position)
```

---

**Status: READY TO CODE - Starting immediately**

Next: Clone/setup Swiss Ephemeris library and create moon position function.
