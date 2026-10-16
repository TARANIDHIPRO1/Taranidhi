# Mahurta AI — Competitive Analysis vs TaraNidhi
**Date:** Oct 16, 2026 | **Analysis Depth:** Complete Feature & Technique Breakdown

---

## Executive Summary

**Mahurta AI (muhuratai.com)** is a mobile-first Muhurta advisory app focused on:
- **Simplicity:** 6 major event types + daily tiles
- **Accessibility:** Hinglish natural language queries ("Ask" feature)
- **Speed:** Color-coded verdict system (GO/WAIT/NOT)
- **Personalization:** Birth star + Lagna-based refinement
- **Reach:** Mobile app (iOS/Android) + web; family sharing

**TaraNidhi (planned)** is positioned to go deeper:
- **Precision:** KP 249-fold sub-lord system vs. simple choghadiya
- **Scope:** 12+ event types (vehicles, property, gold, electronics, marriage, business, etc.)
- **Methodology:** Classical KP + Lahiri ayanamsa vs. simplified Vedic rules
- **Professional:** B2B hospital partnerships, corporate event timing
- **Advanced:** Vimshottari Dasha, Tarabala scoring, detailed auspiciousness analysis

---

## Mahurta AI — Complete Feature Breakdown

### 1. Core Event Types (6 Major)
| Event | Calculation | Window | Verdict |
|-------|------------|--------|---------|
| Griha Pravesh | Tithi, Nakshatra, Disha Shool | 12 months | GO/WAIT/NOT |
| Wedding | Lagna, Nakshatra, Tara (star compat) | 12 months | GO/WAIT/NOT |
| New Business | Tithi, Nakshatra, Abhijit | 12 months | GO/WAIT/NOT |
| Vehicle | Disha Shool, Nakshatra | 12 months | GO/WAIT/NOT |
| Gold | Tithi (avoid Amavasya) | 12 months | GO/WAIT/NOT |
| Property | Tithi, Nakshatra, Disha Shool | 12 months | GO/WAIT/NOT |

**Plus:** Daily tiles (Travel, Pooja, Driving, SIP, Bohni)

---

### 2. Calculation Methods (Detailed)

#### Time-Based Exclusions
```typescript
const EXCLUSIONS = {
  rahu_kaal: true,        // 8-hour recurring daily period
  yamaganda: true,        // 3-hour daily period
  bhadra: true,          // Tithi-based (Panchang rule)
};
```

#### Favorable Windows (Inclusions)
```typescript
const FAVORABLE = {
  abhijit_muhurat: "12:00-13:00 daily",   // Sun at zenith
  brahma_muhurat: "04:00-06:00 daily",    // Brahmin's hour
  amrit_period: "variable by tithi",      // Auspicious phases
  shubh_labh: "tithi-nakshatra combo"     // Good day combinations
};
```

#### Personalization Rules
```typescript
const PERSONALIZATION = {
  city_only: "Choghadiya + Rahu + Bhadra",
  birth_date: "+ Tithi + Nakshatra",
  full_birth: "+ Lagna (ascendant rule)",
  birth_star: "Tara check (9-star compatibility)"
};
```

#### Special Overlays
- **Festivals:** Gudi Padwa, Akshaya Tritiya, Dhanteras, Pushya, etc.
- **Lunar Events:** Amavasya (flagged for caution on money)
- **Direction-Based:** Disha Shool (4 directions × weekly rotation)

---

### 3. Verdict System & Confidence Grades

#### Verdicts
```
GO     → Clean window, start now. Shows duration (e.g., "Next 2 hours clean")
WAIT   → Usable but not clean. Names next good window or date.
NOT    → Inauspicious (e.g., Rahu Kaal). Shows next available window.
```

#### Confidence Grades
```
CITY   → Only current location. Used for guests. Lowest confidence.
MOON   → Birth date added. Enables "aapke liye" (personalized) messaging.
LAGNA  → Full birth data (date, time, place). Highest confidence. 
         Shown only when Lagna rule actually applied.
```

---

### 4. User Interface & Experience

#### Tile System
```
┌─────────────────────────────────────┐
│  Griha Pravesh   │  Wedding        │
│  🟢 GO           │  🟡 WAIT        │
│  Next 6 hours    │  Oct 22 onwards │
├─────────────────────────────────────┤
│  New Business    │  Vehicle        │
│  🔴 NOT (Rahu)   │  🟢 GO          │
│  Oct 19 @ 10am   │  Next 4 hours   │
├─────────────────────────────────────┤
│  Gold            │  Property       │
│  🟢 GO           │  🟡 WAIT        │
│  Avoid Amavasya  │  Oct 21 onwards │
└─────────────────────────────────────┘
```

#### Clock View
- **96 cells:** Sunrise to sunrise grid
- **Choghadiya color-coding:** 8 periods × 8 colors
- **Overlays:** Rahu, Abhijit, Brahma, Bhadra marked

#### "Ask" Feature
- Natural language input: Hinglish, Hindi, English
- Output: Verdict + Time limit + Next window + Grade + Reason (1 line)
- Example: "Kya aaj gaadi khareed sakte hain?" → "🟢 GO, next 4 hours clean, Disha shool nahi hai"

#### Navigation (Bottom Bar)
```
[Desk] [Clock] [+Add] [Ask] [Account]
```

#### Themes
- Light & dark modes
- Mobile-first responsive design
- Persona-based event filtering

---

### 5. Personas & Customization

Users select at sign-up:
- Student, Doctor, Farmer, Fisherman, NRI, Gig Worker, etc.

**Seeds:**
- Custom tiles (e.g., Farmer → Sowing, Harvest)
- Festival calendar (regional festivals)
- "Never skip" events (personal holidays)

**Add-on Categories (10):**
Daily, Child (Naamkaran, Vidyarambh, Annaprashan), Marriage, Home, Money, Job, Travel, Vrat, Health, Maharashtra

---

### 6. Premium Plans

#### Nitya (Free → Rs 299/month)
- 7-day best-dates board
- Unlimited "Ask" queries
- Free first month, then auto-renew
- UPI Autopay or card

#### Shubh (Added features)
- 30-day best-dates lookahead (vs. 7 days)
- Reminders
- Family file sharing

**Payment:** UPI Autopay or card; cancel anytime; no debit until day 31

---

## TaraNidhi vs. Mahurta AI — Key Differences

| Aspect | Mahurta AI | TaraNidhi |
|--------|-----------|-----------|
| **Astrological System** | Simplified Vedic (Tithi, Nakshatra, Choghadiya) | KP 249-fold sub-lord (advanced) |
| **Ayanamsa** | Not stated (likely Lahiri) | Krishnamurti (Lahiri - 0.0965°) |
| **Event Scope** | 6 major + daily tiles | 12+ (vehicles, property, gold, electronics, marriage, business, etc.) |
| **Calculation Depth** | Surface-level (Rahu, Bhadra, Tithi) | Deep: Dasha, Tarabala, sub-lord chains, 249 divisions |
| **Personalization** | Birth date + star + Lagna | Birth chart (full kundali) + Dasha analysis |
| **Verdict Style** | GO/WAIT/NOT (binary) | Auspiciousness score (0-100 scale) + detailed reasons |
| **Target User** | General public (advisory) | Professionals, B2B (hospitals, businesses) |
| **Confidence Grade** | CITY/MOON/LAGNA | Implicit in score & methodology |
| **Natural Language** | Yes ("Ask" feature) | Not core feature |
| **Mobile App** | iOS/Android (coming soon) | Web-first PWA (mobile-capable) |
| **Family Sharing** | Yes (Shubh plan) | Not planned (single-user) |
| **Pricing Model** | Freemium (Nitya/Shubh) | Not finalized (licensing planned) |

---

## TaraNidhi's Competitive Advantages

1. **KP Precision:** 249-fold system vs. simple choghadiya
2. **Dasha Integration:** Vimshottari timing + sub-lord exactness
3. **Tarabala Scoring:** 0-100 auspiciousness (not just GO/WAIT/NOT)
4. **B2B Market:** Hospital partnerships, corporate event timing
5. **Hospital Integration:** Critical timing for surgeries, patient discharges
6. **Ayanamsa Accuracy:** Krishnamurti calibrated (reference-verified)
7. **Advanced Filters:** Ganda Moola, Panchaka, directional rules
8. **Depth:** 50+ test cases vs. simplified 6 events

---

## Mahurta AI's Competitive Strengths (TaraNidhi Must Match/Exceed)

1. ✅ **Mobile-first design** → TaraNidhi: Build PWA + mobile responsive
2. ✅ **Hinglish support** → TaraNidhi: Add Hindi/Hinglish i18n
3. ✅ **Natural language queries** → TaraNidhi: Implement "Ask" equivalent
4. ✅ **Simple verdict system** → TaraNidhi: Simplify score output for general users
5. ✅ **Persona filtering** → TaraNidhi: Add user profile/preference system
6. ✅ **Family sharing** → TaraNidhi: Add multi-user/account linking (v2)
7. ✅ **Free tier with limitations** → TaraNidhi: Freemium model post-launch
8. ✅ **Color-coded tiles** → TaraNidhi: Apply to dashboard UI
9. ✅ **Clock view (96-cell grid)** → TaraNidhi: Implement choghadiya overlay
10. ✅ **Sub-hour precision** → TaraNidhi: Add hourly granularity

---

## Implementation Scripts Needed (For TaraNidhi v1.0)

### Phase 1: Feature Parity (v1.0 Launch)
```
[ ] 1. Add Hinglish support (i18n module)
[ ] 2. Implement "Ask" feature (NLP query handler)
[ ] 3. Build persona-based filtering
[ ] 4. Create verdict simplification layer (score → GO/WAIT/NOT)
[ ] 5. Add choghadiya overlay to clock view
[ ] 6. Color-code tiles by verdict
[ ] 7. Hourly granularity for daily events
[ ] 8. Family profile system (basic)
[ ] 9. Mobile-responsive UI refinement
[ ] 10. Free tier with 3-day lookahead
```

### Phase 2: Differentiation (v1.1+)
```
[ ] 1. KP 249-fold explanations (user-friendly)
[ ] 2. Tarabala scoring narrative
[ ] 3. Dasha period warnings
[ ] 4. B2B hospital integration API
[ ] 5. Bulk event timing (for businesses)
[ ] 6. Calendar sync (Google, Outlook)
[ ] 7. Reminder system
[ ] 8. Export reports (PDF)
```

---

## Immediate Action Items (Next 48 Hours)

**To compete effectively with Mahurta AI:**

1. ✅ **Mobile optimization** — Ensure responsive design matches Mahurta's polish
2. ✅ **Hinglish i18n** — Add Hindi + Hinglish support (critical for India market)
3. ✅ **Natural language "Ask"** — Build query parser for casual input
4. ✅ **Verdict simplification** — Score (0-100) → GO/WAIT/NOT for general users
5. ✅ **Choghadiya clock** — Implement 96-cell grid with color overlay
6. ✅ **Persona system** — Let users select profile (Student, Doctor, Farmer, etc.)

---

## Conclusion

**Mahurta AI is strong on UX/accessibility but weak on depth.**
TaraNidhi's advantage is precision (KP) + professional market (hospitals, B2B).

**To capture Deepawali market:**
- Match Mahurta's UX simplicity
- Exceed Mahurta's calculation accuracy (KP vs. basic Vedic)
- Target professional users (hospitals, businesses, events)
- Launch v1.0 with Hinglish + mobile + natural language

**Launch window: Oct 17-18 (Deepawali season urgency)**

