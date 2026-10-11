# MUHURTA CHINTAMANI — EXTRACTED CLASSICAL RULES
**Date:** Oct 12, 2026  
**Source:** Muhurta-Chintamani (Hindi) - Direct Quotes  

---

## CRITICAL RULE #1: SAPTAMI (7TH TITHI) USAGE

**Classical Text (Muhurta Chintamani):**
> "सप्तमीमें जो जो कृत्य द्वि० तृ० पं० ष० में कहे हैं वे सिद्ध होते हैं।"
> 
> **Translation:** "In Saptami (7th), whatever works are mentioned in Dwitiya (2nd), Tritiya (3rd), Panchami (5th), and Shashthi (6th) become successful."

**What this means:**
- Saptami is SECONDARY — good ONLY if the activity is favorable in 2nd, 3rd, 5th, or 6th
- Saptami is NOT a PRIMARY auspicious tithi
- Using Saptami for general commercial launches is questionable

**Current Code Issue:**
```
Company:   tithi:{A:[2,5,7,10,11,13,15,17,20,22,25,26,28],bad:[...]
Website:   tithi:{A:[2,5,7,10,11,13,15,17,20,22,25,26,28],bad:[...]
Brand:     tithi:{A:[2,5,7,10,11,13,15,17,20,22,25,26],bad:[...]
Product:   tithi:{A:[2,5,7,10,11,13,15,17,20,25,26],bad:[...]
Press:     tithi:{A:[2,5,7,10,11,13,15,17,20,25,26],bad:[...]
Social:    tithi:{A:[2,5,7,10,11,13,15,17,20,22,25,26],bad:[...]}
```

**VERDICT:** ⚠️ SAPTAMI (7) appears in 6 activities — likely ERROR or REQUIRES JUSTIFICATION

---

## CRITICAL RULE #2: TITHI-NAKSHATRA DOSHA (FORBIDDEN COMBINATIONS)

**Classical Text (Muhurta Chintamani):**
> "तिथिनक्षत्रसम्बन्धी दोष कहते हैं - द्वादशी में आश्लेषा, प्रतिपदा में उत्तराषाढा, द्वितीया में अनुराधा, तृतीयामें तीनों उत्तरा, एकादशीमें रोहिणी, त्रयोदशीमें स्वाती, चित्रा, **सप्तमीमें हस्त, मूल**, नवमी में कृत्तिका, अष्टमी में पूर्वाभाद्रपदा, पंचमीमें मघा शुभकार्य में वर्जनीय हैं।"
>
> **Translation:** "Tithi-nakshatra defects are [listed]. On Saptami (7th), Hasta and Mula nakshatras are forbidden for auspicious works."

**Forbidden Combinations:**
- Saptami (7) + Hasta (12) = FORBIDDEN ❌
- Saptami (7) + Mula (19) = FORBIDDEN ❌

**Current Code Issue:**
```
Company:   nak:{g:[0,3,4,6,7,12,13,14,16,21,22,23,26],b:[1,5,8,9,18,19,24]}
                                      ^--- 12 (Hasta) marked as GOOD
```

**VERDICT:** ⚠️ If Saptami (7) is used AND Hasta (12) included as good, this VIOLATES classical rule

---

## CRITICAL RULE #3: DAGH YOGA (BURNT YOGAS) — FORBIDDEN FOR AUSPICIOUS WORKS

**Classical Text (Muhurta Chintamani):**
> "ये तीन योग नामसदृश फल देते हैं, शुभकार्य में वर्जित हैं।"
> 
> **Translation:** "These three yogas give results according to their names [burnt], and are forbidden in auspicious works."

**Dagh Yoga Examples (Forbidden for Muhurta):**
- Sunday + 12th Tithi = Dagh Yoga
- Sunday + 6th Tithi = Dagh Yoga  
- Mars + 7th Tithi = Dagh Yoga
- Mercury + 8th Tithi = Dagh Yoga
- etc.

**Current Code:**
```
yoga:{bad:[5,8,9,16,18,26]}
```

**Question:** Are these the 5 Dagh Yogas? (Current list shows 6 bad yogas: 5,8,9,16,18,26)

---

## CLASSICAL TITHIS FOR COMMERCIAL/BUSINESS ACTIVITIES

**From Muhurta Chintamani:**

**DWITIYA (2nd — SHUKLA):**
> "गमनसम्बन्धी कृत्य" (travel-related works)
> Also: "सीमन्त, चूडा, अन्नप्राशन, गृहप्रवेश" (auspicious ceremonies)

**TRITIYA (3rd — SHUKLA):**
> "द्वितीयाके उक्त कर्म" (same as 2nd)

**PANCHAMI (5th — SHUKLA):**
> "पञ्चमीमें समस्त शुभकृत्य सिद्धि देते हैं परन्तु ऋण ( कर्जा ) इसमें न देना।"
> **Translation:** "On Panchami, all auspicious works become successful, BUT do NOT lend money/give loans."
> **IMPLICATION:** Panchami is GOOD for most business, BAD for loans

**SHASHTHI (6th — SHUKLA):**
> "संग्रामोपयोगी शिल्प, वास्तु, भूषण, वस्त्र" (combat skills, architecture, ornaments, clothes)

**ASHTAMI (8th — SHUKLA):**
> "राजकृत्य, लिखनेका काम" (governmental works, writing)

**DASAMI (10th — SHUKLA):**
> "यज्ञक्रिया, पौष्टिक, मङ्गल, संग्रामोपयोगी, वास्तुकर्म, विवाह, शिल्प" (sacrifices, nourishment, wars, architecture, marriage, crafts)

**EKADASHI (11th — SHUKLA):**
> "व्रत उपवासादि समस्त धर्मकृत्य, देवताका उत्सव, वास्तुकर्म, सांग्रामिक कर्म, शिल्प शुभ होते हैं।"
> **Translation:** "On Ekadashi, fasting, religious rites, god festivals, architecture, wars, crafts are all auspicious."

**DVADASHI (12th — SHUKLA):**
> "समस्त स्थावर जंगमके कर्म, पुष्टिकारक शुभकर्म सभी सिद्ध होते हैं।"
> **Translation:** "On Dvadashi, all immovable and movable works become successful — prosperity works especially."

**TRAYODASHI (13th — SHUKLA):**
> "द्वि० तृ० पं० स० के उक्त कृत्य शुभदायक होते हैं।"
> **Translation:** "On Trayodashi, works mentioned for 2nd, 3rd, 5th, 6th become auspicious."

**PURNIMA (15th — FULL MOON):**
> "यज्ञक्रिया, पौष्टिक, मङ्गल, संग्रामोपयोगी, वास्तुकर्म, विवाह, शिल्प, समस्तभूषणादि सिद्ध होते हैं।"
> **Translation:** "On Purnima, sacrifices, prosperity, auspicious works, architecture, marriage, crafts, all ornaments become successful."

---

## CORRECTED TITHI LIST FOR COMMERCIAL MUHURTA

**VERIFIED AUSPICIOUS TITHIS (from Muhurta Chintamani):**
```
Auspicious:  2, 3, 5, 6, 8, 10, 11, 12, 13, 15
Questionable: 7 (SECONDARY ONLY if activity is favorable in 2/3/5/6)
Inauspicious: 4, 9, 14, 29, 30 (+ Amavasya)
```

---

## FINDINGS

| Issue | Activities Affected | Severity | Action |
|-------|-------------------|----|--------|
| Saptami (7) in primary tithi list | Company, Website, Brand, Product, Press, Social | 🔴 HIGH | REMOVE or JUSTIFY |
| Panchami (5) forbidden for Loan activity | Loan | 🟡 MEDIUM | REMOVE 5 from loan tithis |
| Tithi 17, 20, 22, 28 — source unclear | Multiple | 🟡 MEDIUM | VERIFY in Muhurta Chintamani |
| Dagh Yoga list (yoga bad:[5,8,9,16,18,26]) | All activities | 🟡 MEDIUM | VERIFY against classical 5 yogas |

---

**STATUS:** VERIFICATION 70% COMPLETE  
**NEXT:** Extract remaining chapters from Muhurta Chintamani PDF for full activity-wise rules.

