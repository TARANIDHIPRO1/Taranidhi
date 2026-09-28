# ERROR PREVENTION PROMPT
## Production Code Quality Safeguards

**मंत्र:** "Laparwahi नहीं। हर लाइन, हर formula, हर calculation - सब verified और tested होगा।"

---

## **BEFORE WRITING ANY CODE - CHECKLIST**

### **Phase 1: Research (कभी assumption मत करो)**

```
❌ WRONG:
  "Pancha Pakshi 4.8 hours है, मुझे पता है, code लिख देता हूँ"
  
✅ RIGHT:
  "Pancha Pakshi 4.8 hours का claim क्या है?
   - कौन सा classical source कहता है?
   - क्या 5 sources agree करते हैं?
   - क्या test cases से verify हुआ?
   → तब ही code लिखूँ"
```

**Mandatory Research Steps:**

```
□ Classical source खोज:
  └─ "यह formula कहाँ से आया?"
  └─ Direct classical या modern interpretation?
  └─ Authority rating (⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐ / etc.)?

□ Conflicting sources identify:
  └─ क्या different sources अलग-अलग कहते हैं?
  └─ हम किस को follow करेंगे? क्यों?
  
□ Test case data gather:
  └─ कम से कम 10 known results चाहिए
  └─ Historical muhuratas या verified predictions
  
□ Precision requirements define:
  └─ कितना decimal places matter करेंगे?
  └─ Rounding rule क्या होगा?
  └─ Edge cases कौन से हैं?
```

**Result:** FACT_CHECK_ENGINE.md में entry add हो जाता है

---

### **Phase 2: Algorithm Design (पहले logic, फिर code)**

```
❌ WRONG:
  "Code लिख दूँ, देखते हैं क्या होगा"
  
✅ RIGHT:
  "पहले pseudo-code लिखूँ:
   
   INPUT: Moon longitude 295.5°
   STEP 1: Divide 295.5 by 13.333 = 22.125
   STEP 2: Floor(22.125) = 22
   OUTPUT: Nakshatra 22
   
   क्या यह logic सही है?
   → Yes, proceed to actual code"
```

**Mandatory Algorithm Steps:**

```
□ Pseudo-code लिखो:
  └─ Exact steps लिखो (Hindi में भी चल सकता है)
  └─ Variables define करो
  └─ Edge cases mention करो

□ Test पर run करो:
  └─ Pseudo-code से manually calculate करो
  └─ Expected output क्या आना चाहिए?
  
□ Code से compare करो:
  └─ क्या code exactly pseudo-code follow करता है?
  
Example:

  PSEUDO-CODE:
  ```
  Function: calculateNakshatra(moonDegree)
    nakashtaNumber = floor(moonDegree / 13.333)
    if nakashtaNumber == 0:
      nakashtaNumber = 27
    return nakashtaNumber
  ```

  TEST:
  Input: 295.5
  Manual: floor(295.5 / 13.333) = floor(22.125) = 22 ✅
  
  CODE:
  ```javascript
  function calculateNakshatra(moonDegree) {
    let nakashtaNumber = Math.floor(moonDegree / 13.333);
    if (nakashtaNumber === 0) {
      nakashtaNumber = 27;
    }
    return nakashtaNumber;
  }
  ```
  
  MATCH: ✅ Exact
```

---

### **Phase 3: Code Implementation (हर line safe होगा)**

#### **Rule 1: No Magic Numbers**

```
❌ WRONG:
  let divisor = 13.333;  // क्या है यह?
  
✅ RIGHT:
  // Nakshatra span = 360° / 27 nakshatras = 13.333°
  const DEGREES_PER_NAKSHATRA = 360 / 27;
  let divisor = DEGREES_PER_NAKSHATRA;
```

#### **Rule 2: Input Validation**

```
❌ WRONG:
  function calculateNakshatra(moonDegree) {
    return Math.floor(moonDegree / 13.333);
  }
  // क्या negative होगा? > 360?

✅ RIGHT:
  function calculateNakshatra(moonDegree) {
    // Validate input
    if (moonDegree === null || moonDegree === undefined) {
      throw new Error("Moon degree cannot be null");
    }
    if (typeof moonDegree !== 'number') {
      throw new Error("Moon degree must be a number");
    }
    if (moonDegree < 0 || moonDegree > 360) {
      throw new Error("Moon degree must be between 0 and 360");
    }
    
    // Main logic
    let nakashtaNumber = Math.floor(moonDegree / 13.333);
    if (nakashtaNumber === 0) nakashtaNumber = 27;
    
    return nakashtaNumber;
  }
```

#### **Rule 3: Edge Case Handling**

```
❌ WRONG:
  // Assume moonDegree is always perfect
  
✅ RIGHT:
  // Handle all edge cases explicitly
  
  Edge Case 1: moonDegree = 0
    Expected: Nakshatra 27 (Revati, last)? या 1 (Ashwini, first)?
    Decision: "Start of zodiac = Ashwini (1)"
    Code: if (nakashtaNumber === 0) nakashtaNumber = 1;
  
  Edge Case 2: moonDegree = 360
    Expected: Same as 0? या different?
    Decision: "360° wraps to 0° = treat as 0"
    Code: moonDegree = moonDegree % 360;
  
  Edge Case 3: moonDegree = 359.9
    Expected: Nakshatra 27 (Revati)
    Test: floor(359.9 / 13.333) = 26.99... → 26 ❌
    Issue: Last nakshatra boundary wrong!
    Fix: if (nakashtaNumber === 26) nakashtaNumber = 27;
```

#### **Rule 4: Precision Handling**

```
❌ WRONG:
  let offset = 130.2;  // Floating point error?
  
✅ RIGHT:
  // Define precision requirement
  // Requirement: ±0.5 minute (30 arc-seconds)
  // 1 arc-minute = 1/60 degree
  // 1 arc-second = 1/3600 degree = 0.000278°
  
  const PRECISION_MINUTES = 0.5;
  const PRECISION_DEGREES = PRECISION_MINUTES / 60;
  
  // Calculate with high precision
  let offset = 130.2;
  
  // Round to required precision
  offset = Math.round(offset / PRECISION_MINUTES) * PRECISION_MINUTES;
  
  // Verify within tolerance
  if (Math.abs(offset - EXPECTED_OFFSET) > PRECISION_MINUTES) {
    throw new Error("Precision lost beyond tolerance");
  }
```

#### **Rule 5: Error Messages**

```
❌ WRONG:
  throw new Error("Invalid input");  // कौन सा input?
  
✅ RIGHT:
  throw new Error(
    `Invalid Moon degree: ${moonDegree}. ` +
    `Expected: number between 0 and 360 degrees. ` +
    `Got: ${typeof moonDegree} = ${moonDegree}`
  );
```

#### **Rule 6: Comments का Rule**

```
❌ WRONG:
  // Calculate nakshatra
  let n = Math.floor(m / 13.333);
  
✅ RIGHT:
  // Determine which of 27 nakshatras the Moon is in
  // Each nakshatra spans 360° / 27 = 13.333°
  // Example: Moon at 295.5° → 295.5 / 13.333 = 22.125 → floor = 22 (Shravana)
  // Classical source: BPHS Nakshatra definition
  const DEGREES_PER_NAKSHATRA = 360 / 27; // 13.333°
  let nakashtaNumber = Math.floor(moonDegree / DEGREES_PER_NAKSHATRA);
  
  // Handle edge case: 0° should be 27th nakshatra (Revati)
  // unless we're treating 0° as start (Ashwini = 1)
  if (nakashtaNumber === 0) {
    nakashtaNumber = 27; // Revati
  }
```

---

### **Phase 4: Testing (Code लिखने के तुरंत बाद)**

```
❌ WRONG:
  "Code लिख दिया, अब deployment करते हैं"
  
✅ RIGHT:
  "Code लिखा → IMMEDIATELY TEST
   → All tests pass → Then deployment"
```

**Testing Workflow:**

```javascript
// TEST FILE: __tests__/nakshatra.test.js

describe('calculateNakshatra', () => {
  
  // Test 1: Normal case
  test('Moon at 295.5° should be Nakshatra 22 (Shravana)', () => {
    const result = calculateNakshatra(295.5);
    expect(result).toBe(22);
  });

  // Test 2: Boundary - start
  test('Moon at 0° should be Nakshatra 1 or 27 (edge case)', () => {
    const result = calculateNakshatra(0);
    expect([1, 27]).toContain(result);
  });

  // Test 3: Boundary - end
  test('Moon at 359.9° should be Nakshatra 27', () => {
    const result = calculateNakshatra(359.9);
    expect(result).toBe(27);
  });

  // Test 4: Invalid - negative
  test('Negative degree should throw error', () => {
    expect(() => {
      calculateNakshatra(-10);
    }).toThrow('Moon degree must be between 0 and 360');
  });

  // Test 5: Invalid - > 360
  test('Degree > 360 should throw error', () => {
    expect(() => {
      calculateNakshatra(400);
    }).toThrow('Moon degree must be between 0 and 360');
  });

  // Test 6: Invalid - null
  test('Null input should throw error', () => {
    expect(() => {
      calculateNakshatra(null);
    }).toThrow('Moon degree cannot be null');
  });

  // Test 7: Invalid - string
  test('String input should throw error', () => {
    expect(() => {
      calculateNakshatra('295.5');
    }).toThrow('Moon degree must be a number');
  });

  // Test 8: Decimal precision
  test('Decimal handling should be correct', () => {
    const result = calculateNakshatra(295.5555555);
    expect(result).toBe(22);
  });
});

// RUN TESTS
// npm test
// Expected: 8/8 PASS
```

**Gate:** All tests must pass before moving forward.

---

### **Phase 5: Code Review (Self-Review पहले)**

```
Before pushing to git:

□ Did I write too much code in one commit?
  └─ Best: Small, focused commits
  └─ Each commit = one feature or one fix
  
□ Are there console.log() statements left?
  └─ Remove all debug logs before production
  
□ Did I follow the naming conventions?
  └─ Variables: camelCase
  └─ Constants: UPPER_CASE
  └─ Functions: descriptiveNames (not f1, f2)
  
□ Is the code readable?
  └─ Can someone else understand it?
  └─ Comments on complex logic?
  
□ Are there any security issues?
  └─ Input validation done?
  └─ No SQL injection risk?
  └─ No XSS risk?
  
□ Performance OK?
  └─ No infinite loops?
  └─ No unnecessary calculations?
  └─ Response time < benchmark?
  
□ No hardcoded values?
  └─ All magic numbers → constants
  
□ Test coverage?
  └─ Critical paths covered?
  └─ 80%+ code coverage?
```

---

## **DEPLOYMENT FINAL CHECKLIST**

Before any code goes to production:

```
Code Quality:
  ✅ All unit tests pass (100%)
  ✅ All integration tests pass (100%)
  ✅ No security issues
  ✅ No performance issues
  ✅ Code follows conventions
  ✅ Comments clear

Testing:
  ✅ Unit tests: 8/8 pass
  ✅ Integration tests: 10/10 pass
  ✅ Edge cases: 8/10 pass (gaps documented)
  ✅ Real data: 8/10 match classical
  ✅ Regression: 100% pass

Verification:
  ✅ Formula verified against classical source
  ✅ Algorithm matches pseudo-code
  ✅ Precision requirements met
  ✅ Known test cases match

Documentation:
  ✅ Code commented
  ✅ Function documentation complete
  ✅ FACT_CHECK_ENGINE.md entry complete
  ✅ Known limitations documented

Approval:
  ✅ Naveen approved
  ✅ Claude verified
  
ONLY THEN: Deploy to production

If any ❌: STOP and fix before deployment.
```

---

## **RUNTIME ERROR HANDLING**

```javascript
// Example: Safe calculation with error handling

function computeConvergenceIndex(inputs) {
  try {
    // Step 1: Validate all inputs
    if (!validateInputs(inputs)) {
      throw new Error('Invalid inputs provided');
    }
    
    // Step 2: Calculate each component
    const panchanga = calculatePanchanga(inputs);
    const kp = calculateKP(inputs);
    const hora = calculateHora(inputs);
    
    // Step 3: Verify components
    if (!verifyComponents({panchanga, kp, hora})) {
      throw new Error('Component verification failed');
    }
    
    // Step 4: Calculate convergence
    const convergence = 
      (0.2 * panchanga.score) +
      (0.2 * kp.score) +
      (0.2 * hora.score) +
      // ... more components
      
    // Step 5: Verify result is reasonable
    if (convergence < 0 || convergence > 100) {
      throw new Error(`Convergence ${convergence} out of range [0,100]`);
    }
    
    return {
      success: true,
      convergence: convergence,
      breakdown: {panchanga, kp, hora},
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Log error with full context
    console.error('Convergence calculation failed:', {
      error: error.message,
      inputs: inputs,
      timestamp: new Date().toISOString()
    });
    
    // Return safe fallback
    return {
      success: false,
      error: error.message,
      convergence: null,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## **MISTAKES TRACKING**

```
हर mistake को track करेंगे:

Date: 2026-09-28
Feature: KP 249 calculation
Error: Boundary condition wrong (line 45)
Impact: 0 clients (not deployed yet)
Fix: Added if (nakashtaNumber === 26) guard

---

Date: [future]
Feature: [feature name]
Error: [what went wrong]
Impact: [how many clients/queries affected]
Fix: [what we did]
Root cause analysis: [why did we miss this?]
Prevention: [how to prevent similar errors]
```

This log becomes our wisdom database.

---

## **THE PROMISE**

अब से:

✅ कोई भी formula बिना verification के नहीं लिखा जाएगा
✅ कोई भी code बिना testing के production में नहीं जाएगा
✅ कोई भी mistake को ignore नहीं किया जाएगा
✅ हर गलती से सीख लेंगे और prevent करेंगे अगली बार
✅ Panchanga की accuracy 100% होगी (या limitation explicitly documented)

**यह OCCULTVIISION का principle है। Laparwahi नहीं।**
