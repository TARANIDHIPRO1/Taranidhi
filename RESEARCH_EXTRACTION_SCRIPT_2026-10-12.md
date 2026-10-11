# RESEARCH EXTRACTION SCRIPT
## For Perplexity AI, Google Gemini, Groq
**Date:** Oct 12, 2026  
**Purpose:** Extract classical muhurta rules from 18 ebooks  
**Output:** Feed results to Claude for verification + integration

---

## **STEP 1: UPLOAD YOUR 18 EBOOKS**

### **Files to upload:**
- Muhurta-Chintamani - Hindi.pdf (104 MB)
- Muhurtha-Chintamani 2 - Hindi.pdf (30.5 MB)
- BPHS (Brihat Parashara Hora Shastra)
- Horary astrology texts
- Nakshatra detailed rules
- Panchanga attributes
- (All 18 from your Google Drive folder)

### **Upload location:**
- **Perplexity:** Drag PDFs into chat
- **Gemini:** Click "+" → "Upload file"
- **Groq:** Paste text content (if PDF not supported)

---

## **PHASE 1: SAPTAMI TITHI RULES** (Currently verifying)

### **SEARCH #1: PERPLEXITY** (PRIMARY EXTRACTION)
```
Prompt to paste:

"You have access to Muhurta Chintamani (Hindi) and BPHS. 

EXTRACT ONLY:
1. Classical definition of Saptami (7th tithi)
2. In which activities is Saptami GOOD?
3. In which activities is Saptami FORBIDDEN?
4. Any verse citations about Saptami + commercial launches
5. Any Tithi-Nakshatra dosha rules involving Saptami

Format output as:
SAPTAMI RULES (MUHURTA CHINTAMANI):
- Good for: [list activities]
- Bad for: [list activities]
- Verse: [exact Sanskrit + translation]

Do NOT summarize. Quote directly from text."
```

**Expected output:** Direct quotes + verse numbers

---

### **SEARCH #2: GOOGLE GEMINI** (CROSS-VERIFY)
```
Prompt to paste:

"I have uploaded BPHS and Muhurta Chintamani texts.

VERIFY:
1. Does BPHS agree with MC on Saptami rules for business launches?
2. Extract BPHS verse on Saptami (if different from MC)
3. Which classical text is MORE restrictive on Saptami use?
4. List 3 activities where Saptami is explicitly FORBIDDEN

Format:
MC says: [rule]
BPHS says: [rule]
Verdict: [which is stricter]"
```

**Expected output:** Comparison + citations

---

### **SEARCH #3: GROQ** (QUICK DIGEST)
```
Prompt to paste:

"Summarize Saptami rules in 5 lines:
1. Classical meaning
2. Good activities
3. Forbidden activities  
4. Key exception (if any)
5. One verse proof

Keep dense — one line per rule."
```

**Expected output:** Condensed reference

---

## **PHASE 2: PANCHAMI TITHI RULES** (For Loan activity)

### **SEARCH #1: PERPLEXITY**
```
"EXTRACT from Muhurta Chintamani + BPHS:

1. Can you LEND MONEY on Panchami (5th tithi)?
2. Exact verse about Panchami + loans
3. Any exceptions to the lending rule?
4. What happens if you violate this rule?

Quote directly. Include verse number & Sanskrit."
```

**Expected output:** Verse + exact rule

---

### **SEARCH #2: GEMINI**
```
"Cross-check: 
- MC rule on Panchami lending
- BPHS rule on Panchami lending
- Are they identical or different?
- Which one is older/more authoritative?"
```

**Expected output:** Comparison + authority ranking

---

### **SEARCH #3: GROQ**
```
"One-line summary: When is it safe to give loans in Vedic muhurta?"
```

---

## **PHASE 3: NAKSHATRA-TITHI DOSHA** (Hora preferences)

### **SEARCH #1: PERPLEXITY**
```
"EXTRACT forbidden Nakshatra-Tithi combinations:

1. Which nakshatras are forbidden on Saptami?
2. Which nakshatras are forbidden on Panchami?
3. Which nakshatras are GOOD on Saptami? (if any)
4. Exact classical verses

Format:
Saptami + Nakshatra combinations:
  FORBIDDEN: [list]
  GOOD: [list]
  Verse: [Sanskrit]

Panchami + Nakshatra combinations:
  FORBIDDEN: [list]"
```

**Expected output:** Detailed dosha list

---

### **SEARCH #2: GEMINI**
```
"Is there any nakshatra that is GOOD on both Saptami AND Panchami?
Or are both tithis universally restrictive for certain nakshatras?
Cite verses."
```

**Expected output:** Exceptions (if any)

---

## **PHASE 4: HORA LORD PREFERENCES** (Mercury, Venus, etc.)

### **SEARCH #1: PERPLEXITY**
```
"EXTRACT Hora (hour) preferences:

For each activity, which Hora lord is BEST?
- Company / Business Launch
- Website / App Launch  
- Contracts
- Money Transfer
- Property Registration

Format:
ACTIVITY: [name]
Hora lords: [0=Saturn, 1=Jupiter, 2=Mercury, 3=Venus, 4=Mars, 5=Sun, 6=Moon]
Best: [number + name]
Reason: [why this hora lord]
Verse: [if available]"
```

**Expected output:** Hora mapping table

---

### **SEARCH #2: GEMINI**
```
"Verify: Is Mercury (Hora 2) universally good for commercial launches?
Or does it depend on the specific activity?
Cite classical verses."
```

---

## **PHASE 5: VARA (DAY) PREFERENCES**

### **SEARCH #1: PERPLEXITY**
```
"EXTRACT Vara (weekday) preferences for commercial muhurta:

For each day (0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri):
- Which activities is this day GOOD for?
- Which activities is this day BAD for?
- Classical reasoning (planet rulership)

Format:
SATURDAY (0):
  Good for: [list]
  Bad for: [list]
  Planet: Saturn
  
[repeat for all 7 days]"
```

**Expected output:** Complete vara mapping

---

## **RESULTS COLLECTION FORMAT**

### **When you get results, format as:**

```
═════════════════════════════════════════════════════════════
RESEARCH RESULT — [Topic] — [Tool] — [Date]
═════════════════════════════════════════════════════════════

QUESTION:
[What you asked]

CLASSICAL CITATION:
[Exact Sanskrit verse if available]

TRANSLATION:
[English meaning]

CLASSICAL SOURCE:
[Which text: Muhurta Chintamani, BPHS, Brihat Samhita, etc.]

VERSE NUMBER/CHAPTER:
[Location in text]

IMPLICATION FOR TARANIDHI:
[How this affects the commercial muhurta code]

CONFIDENCE LEVEL:
[High / Medium / Low based on source clarity]

═════════════════════════════════════════════════════════════
```

---

## **EXAMPLE: WHAT YOU'LL SEND ME**

```
═════════════════════════════════════════════════════════════
RESEARCH RESULT — Saptami Rules — Perplexity — Oct 12, 2026
═════════════════════════════════════════════════════════════

QUESTION:
Can Saptami be used for commercial business launches?

CLASSICAL CITATION:
"सप्तमीमें जो जो कृत्य द्वि० तृ० पं० ष० में कहे हैं वे सिद्ध होते हैं।"

TRANSLATION:
"On Saptami, only activities mentioned for 2nd, 3rd, 5th, 6th become successful"

CLASSICAL SOURCE:
Muhurta Chintamani

VERSE NUMBER/CHAPTER:
Chapter 8, Verse 12 [example]

IMPLICATION FOR TARANIDHI:
Saptami is SECONDARY-ONLY for business launches. Should NOT be in primary auspicious list.

CONFIDENCE LEVEL:
High (direct classical quote)

═════════════════════════════════════════════════════════════
```

---

## **WORKFLOW**

**YOU:**
1. Open Perplexity → Upload PDFs
2. Copy **SEARCH #1** from Phase 1 → Paste into Perplexity
3. Get result → Format using **RESULTS COLLECTION FORMAT** above
4. Send to me

**ME:**
1. Receive your formatted result
2. Verify against Muhurta Chintamani (already extracted)
3. Update code if conflict found
4. Commit with citation

**YOU (again):**
5. Repeat for SEARCH #2 (Gemini), SEARCH #3 (Groq)
6. Move to Phase 2, 3, 4, 5

---

## **PRIORITY ORDER**

1. **Phase 1 (Saptami)** — CRITICAL (7 errors depend on this)
2. **Phase 2 (Panchami)** — CRITICAL (Loan activity affected)
3. **Phase 3 (Dosha)** — MEDIUM (Cross-validation)
4. **Phase 4 (Hora)** — LOW (Mercury addition validation)
5. **Phase 5 (Vara)** — LOW (Weekday preferences)

---

## **TOTAL TIME ESTIMATE**

- Phase 1: 15 min (Saptami rules)
- Phase 2: 10 min (Panchami rules)
- Phase 3: 15 min (Dosha combos)
- Phase 4: 10 min (Hora lords)
- Phase 5: 10 min (Vara days)

**Total: ~60 minutes for complete research**

---

## **WHEN YOU'RE DONE**

Send me all results in **RESULTS COLLECTION FORMAT**.  
I'll:
- ✅ Cross-verify against Muhurta Chintamani
- ✅ Update CORRECTED_COMMERCIAL_MUHURTA code if needed
- ✅ Commit with full citations
- ✅ You test tonight with bulletproof verification

---

**START NOW?**
1. Open https://www.perplexity.ai
2. Upload your BPHS PDF
3. Copy PHASE 1 SEARCH #1 prompt above
4. Paste into Perplexity
5. Send results to me in the format

🚀 **Ready?**
