# KP 249-FOLD VERIFICATION PLAN
## Table Validation + Sign-Boundary Crossing Logic

**Status:** 🟢 READY TO START (Sept 28, 2026)
**Priority:** HIGH (core KP system)
**Timeline:** 5 business days
**Authority:** ⭐⭐⭐⭐⭐ (Officially recognized K.P. variant)

---

## **WHAT WE'RE VERIFYING**

```
CLAIM: KP 249-Fold System generates 249 sub-lord rows (not standard 243)

How it works:
  Standard KP: 27 nakshatras × 9 sub-lords = 243 rows
  KP 249: When a sub-lord division CROSSES sign boundary = 2 entries
  Result: 243 + 6 sign-boundary rows = 249 total

VERIFICATION NEEDED:
  ✅ Source: KundliGPT, Jagannath Hora, KP Astrology Learning
  ✅ Mechanism: Sign-boundary crossing logic
  ✅ Implementation: Our 249-row table matches official
  ✅ Test cases: 10 known KP horary numbers (1-249)
  
STATUS: Already researched + approved ✅
NEXT: Verify table accuracy + test with 10 known cases
```

---

## **RESEARCH FINDINGS (Already Done)**

```
✅ CONFIRMED: KP 249 is official K.P. system variant
✅ CONFIRMED: Used in KP horary practice (horary numbers 1-249)
✅ CONFIRMED: Sign-boundary crossing creates 6 extra rows
✅ SOURCES: KundliGPT, Jagannath Hora, KP learning communities
✅ AUTHORITY: ⭐⭐⭐⭐⭐ (Official K.P. variant)

No further source hunting needed - proceed to verification
```

---

## **TASK 1: Table Verification (Day 1-2)**

### **Step 1.1: Get Reference Table**

```
Sources to check:
  □ KundliGPT KP reference: https://kundligpt.com/kp-astrology/
  □ Jagannath Hora software (professional KP app)
  □ KP Astrology Learning communities
  □ Our TaraNidhi implementation (kpHorary249.ts)

For each source:
  □ Verify 27 nakshatras listed
  □ Verify 9 sub-lords per nakshatra
  □ Identify which rows are "sign-boundary crossings"
  □ Count total rows (should be 249)
  
EXPECTED:
  Base rows: 27 × 9 = 243
  Sign-boundary additions: 6
  Total: 249
```

### **Step 1.2: Compare Our Implementation**

```
File: src/kp249.ts (or similar)

For each of 249 rows in our table:
  □ Column A: Nakshatra (1-27)
  □ Column B: Sub-lord (1-9)
  □ Column C: Start degree
  □ Column D: End degree
  □ Column E: Sign (1-12)
  □ Column F: Sign-boundary crossing? (Y/N)

Compare against reference:
  □ Do degree ranges match?
  □ Are sign boundaries correctly detected?
  □ Are all 249 rows present?
  □ Any discrepancies documented?
```

### **Step 1.3: Verify Sign-Boundary Logic**

```
Sign-boundary crossing example:

Normal row:
  Nakshatra 22 (Shravana), Sub-lord 5 (Mars)
  Starts: 293.33° (Capricorn)
  Ends: 300° (Capricorn)
  Sign: Capricorn (same throughout)
  Count: 1 row

Sign-boundary row:
  Nakshatra 26, Sub-lord 7 (Saturn)
  Starts: 348° (Pisces)
  Ends: 360.67° (would be Aries at 0°)
  Sign change: Pisces → Aries
  Count: 2 rows (one for each sign)

Verify this logic is correctly implemented in our code
```

---

## **TASK 2: Unit Precision Verification (Day 2)**

### **Precision Requirements**

```
CLAIM: 1 unit = 1/3 arc-minute

Verification:
  □ 1 arc-minute = 1/60 degree = 0.01667°
  □ 1/3 arc-minute = 0.00556°
  □ 1 unit should = 0.00556°
  
  □ Check our implementation:
    - Is every degree divided into 180 units?
    - 30° (1 sign) = 180 × 180 = 32,400 units
    - 1 unit = 30/32400 = 0.000926° ✓
    
  □ Test precision:
    - Can we distinguish ±1/3 arc-minute?
    - Are floating-point errors < ±1 unit?
    - Is rounding consistent?
```

---

## **TASK 3: Test Cases (Day 3-5)**

### **Step 3.1: Find 10 Known KP Cases**

```
Need: 10 historical muhuratas with documented K.P. sub-lord analysis

Where to find:
  □ KP practitioner case studies
  □ K.P. Institute archives
  □ Published KP books with worked examples
  □ Research papers on KP sub-lord accuracy
  □ Naveen's own practice records (if available)

For each case:
  ├─ Date + time + location
  ├─ Actual sub-lord predicted (from classical KP analysis)
  ├─ Our calculated sub-lord
  └─ Match? ✅ or ❌
```

### **Step 3.2: Test Matrix**

```
Test Case 1: [Historical muhurat name]
  Date: [date + time]
  Location: [place]
  Moon degree: [calculated]
  Our sub-lord: [row #] → [planet]
  Expected: [from KP reference]
  Match: ✅ / ❌

Test Case 2: [Next case]
  ...

[Repeat for 10 cases]
```

### **Step 3.3: Accuracy Analysis**

```
After 10 test cases:
  ✅ Results: X/10 match expected
  
  If 10/10 match:
    Status: 🟢 VERIFIED
    Confidence: 100%
    Ready for: Production code
  
  If 9/10 match:
    Status: 🟡 INVESTIGATE
    Issue: Which case doesn't match? Why?
    Action: Review that specific calculation
  
  If <9/10 match:
    Status: 🔴 PROBLEM
    Action: Re-examine table or algorithm
    May need: Revised approach or source
```

---

## **CODE OUTLINE**

### **KP 249 Table Lookup Function**

```javascript
// File: src/kp249.js

/**
 * KP 249-Fold table (27 nakshatras × 9 sub-lords + 6 sign-boundary)
 * Each row: { nakshatra, subLord, startDegree, endDegree, sign, notes }
 */
const KP249_TABLE = [
  // Row 1: Nakshatra 1 (Ashwini), Sub-lord 1 (Ketu)
  { nakshatra: 1, subLord: 1, startDeg: 0, endDeg: 3.33, sign: 1, boundary: false },
  // Row 2: Nakshatra 1, Sub-lord 2 (Venus)
  { nakshatra: 1, subLord: 2, startDeg: 3.33, endDeg: 6.67, sign: 1, boundary: false },
  // ... continue for all 249 rows
  
  // Example of sign-boundary crossing row (6 of these):
  // Row 246: Nakshatra 26, Sub-lord 7 (Saturn) - Pisces part
  { nakshatra: 26, subLord: 7, startDeg: 348, endDeg: 353.33, sign: 12, boundary: true },
  // Row 247: Nakshatra 26, Sub-lord 7 (Saturn) - Aries part
  { nakshatra: 26, subLord: 7, startDeg: 353.33, endDeg: 360, sign: 1, boundary: true },
];

/**
 * Find sub-lord for given Moon degree
 * @param {number} moonDegree - Moon longitude (0-360)
 * @returns {object} - {nakshatra, subLord, sign, row_number}
 */
function findSubLord(moonDegree) {
  // Normalize to 0-360 range
  let deg = moonDegree % 360;
  
  // Search table for matching degree range
  for (let i = 0; i < KP249_TABLE.length; i++) {
    const row = KP249_TABLE[i];
    
    // Check if degree falls in this row's range
    if (deg >= row.startDeg && deg < row.endDeg) {
      return {
        rowNumber: i + 1,
        nakshatra: row.nakshatra,
        subLord: row.subLord,
        sign: row.sign,
        boundary: row.boundary
      };
    }
  }
  
  // If no match found, return null
  return null;
}

module.exports = { KP249_TABLE, findSubLord };
```

### **Test Suite**

```javascript
// File: tests/kp249.test.js

const { findSubLord } = require('../src/kp249');

describe('KP 249-Fold System', () => {
  
  test('Moon at 295.5° should give sub-lord #XXX', () => {
    const result = findSubLord(295.5);
    
    // Expected from KP reference
    expect(result.nakshatra).toBe(22); // Shravana
    expect(result.subLord).toBe(5);    // Mars or appropriate lord
    expect(result.sign).toBe(10);      // Capricorn
  });
  
  test('Sign-boundary crossing detected', () => {
    // Test a degree that crosses from one sign to another
    const result = findSubLord(353.5); // Near Pisces/Aries boundary
    expect(result.boundary).toBe(true);
  });
  
  // Test 8 more known cases...
});
```

---

## **DELIVERABLES**

```
Day 1-2: ✅ Table verification (compare against KP reference)
Day 2: ✅ Unit precision validated (1/3 arc-minute = 0.00556°)
Day 3-4: ✅ 10 test cases collected + tested
Day 5: ✅ Accuracy report (X/10 match)

FINAL: KP 249 system verified and production-ready
       Table accuracy: 90%+ (8/10 or better)
       Sign-boundary logic working correctly
       Ready for full 8-step calculator integration
```

---

## **SUCCESS CRITERIA**

```
Phase complete when:

✅ Our 249-row table matches reference table
✅ Unit precision verified (±0.00556°)
✅ 10 known cases tested
✅ 8/10 or better accuracy achieved
✅ Sign-boundary crossing logic working
✅ Documentation complete
✅ Naveen approval: ✅

THEN: Ready for production code with KP 249 integration
```

---

**Status: 🟢 READY TO START**

Sources already verified ✅
Next: Verify table accuracy against reference
