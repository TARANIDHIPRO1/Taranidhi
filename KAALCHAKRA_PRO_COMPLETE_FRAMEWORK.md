# KAALCHAKRA PRO™ — COMPLETE TOOL FRAMEWORK
## OCCULTVIISION Single-File PWA | September 28, 2026

**Status:** Architecture Ready | **Source:** TaraNidhi Research + Muhurat-Chintamani + BPHS + KP Stellar  
**Total Build:** 4 phases, 12 weeks, 100+ hours

---

## EXECUTIVE OVERVIEW

**What:** Single-file Progressive Web App (PWA) for Vedic muhurat calculation with 3-layer personalization

**Who:** 
- **Free Tier:** General users (Panchanga only, 1-day window, no personalization)
- **Premium Tier:** Serious users (Kundali + Numerology + Pancha Pakshi, 10-min precision, SMS reminders)
- **Enterprise Tier:** Hospitals/B2B (API access, bulk queries, patient integrations)

**Why:** No competitor offers cycle-aware Navtara + numerology + Pancha Pakshi + KP integration. OCCULTVIISION's moat.

**How:** 
- Frontend: React SPA (TypeScript, Tailwind, shadcn/ui)
- Backend: Cloudflare Workers (serverless)
- Database: Cloudflare D1 (SQLite) + Redis cache
- Computation: Swiss Ephemeris for astronomical precision
- Auth: SMS OTP (MSG91 or Interakt)
- Payments: Razorpay

---

## PART 1: SYSTEM ARCHITECTURE

### High-Level Flow

```
User Input (Activity, Date, Birth Details?)
       ↓
Frontend Validation (React UI)
       ↓
Cloudflare Worker API
       ↓
Astronomical Calculation (Swiss Ephemeris)
       ↓
Muhurat Logic Engine (16-step synthesis)
       ↓
Convergence Index Calculation
       ↓
Database Cache (Cloudflare D1)
       ↓
Response → Frontend Rendering
       ↓
User sees: Window + Explanation + Convergence % + Recommendation
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Single-file PWA, fast, offline-capable |
| **Styling** | Tailwind CSS | Responsive, dark mode, fast |
| **Components** | shadcn/ui | Pre-built, accessible, customizable |
| **State** | React Context + zustand | Lightweight, no Redux overhead |
| **Computation** | Swiss Ephemeris (@swisseph/browser) | Precise astronomical calculations |
| **Backend** | Cloudflare Workers | Serverless, global edge, no cold starts |
| **Database** | Cloudflare D1 (SQLite) | Built-in, fast, free tier sufficient |
| **Cache** | Cloudflare Cache API + Redis | Ephemeris results cache, avoid re-calc |
| **Auth** | SMS OTP (MSG91/Interakt) | Low barrier, India-first |
| **Payments** | Razorpay | India standard, familiar to users |
| **Deployment** | Cloudflare Pages | Single git push → live, automatic HTTPS |

### Single-File Strategy

**Why single-file?**
- User downloads once, works offline
- No dependency on internet (except payment/SMS)
- Muhurat data baked into app
- Instant load time
- HIPAA-compliant for hospitals (no cloud)

**File structure:**
```
index.html (1 file, 800KB-1.2MB gzipped)
├─ <script> — React app (bundled)
├─ <script> — Swiss Ephemeris (bundled)
├─ <script> — Muhurat ruleset (baked data)
├─ <style> — Tailwind CSS (minified)
├─ <style> — Dark mode
└─ Service Worker — offline cache
```

**Build process:**
```bash
npm run build:single-file
# Output: dist/index.html (ready to deploy)
```

---

## PART 2: USER JOURNEYS & TIERS

### Tier 1: Free (Panchanga Only)

**User:** Casual users, explorers

**Features:**
- ✅ Select activity type (marriage, property, business, etc.)
- ✅ Pick a date range (7-30 days out)
- ✅ See Panchanga 5 components (Tithi, Vara, Nakshatra, Yoga, Karana)
- ✅ Activity-specific favorable/caution flags
- ✅ 1-day window identification
- ✅ No login required
- ✅ Free forever

**Limitations:**
- ❌ No Kundali personalization
- ❌ No Numerology layer
- ❌ No Pancha Pakshi 10-min precision
- ❌ Generic convergence (not personalized)
- ❌ No SMS reminders
- ❌ Ad banner OR upgrade nag (convertible to premium)

**User Journey:**
```
Open app → Select activity (marriage) → Pick date range → 
See Panchanga analysis for all 30 days → 
Highlight top 3 "auspicious" dates → 
CTA: "Add your birth details for 3-layer precision (Premium)"
```

**Conversion point:** "This date is 76% good. With your kundali it could be 95%"

---

### Tier 2: Premium (Full 3-Layer + Pancha Pakshi)

**User:** Serious users, professionals, businesses, couples

**Price:** ₹999/month OR ₹4,999/year

**Features:**
- ✅ Everything in Free +
- ✅ Add birth date (Gregorian)
- ✅ Add birth time (optional, for Kundali)
- ✅ Add birth location (for Lagna)
- ✅ Layer 1: Kundali personalization → 1-hour window
- ✅ Layer 2: Numerology alignment → refined window
- ✅ Layer 3: Pancha Pakshi → 10-15 minute optimal slot
- ✅ Convergence Index (0-100%) personalized
- ✅ SMS reminders (T-30d, T-7d, T-1d, T-morning)
- ✅ Save up to 5 muhurtas in history
- ✅ Export muhurta as PDF (custom branding)
- ✅ Dark mode
- ✅ Offline access

**Limitations:**
- ❌ No B2B hospital API
- ❌ Single user (not multi-family)
- ❌ No professional branding

**User Journey:**
```
Login (SMS OTP) → Add birth details → Select activity → Pick date → 
See personalized Convergence Index → 
View Pancha Pakshi window (05:23-05:35 AM identified as optimal) → 
Add SMS reminders → 
Export PDF with all details → 
Save to history
```

**Retention mechanics:**
- SMS reminders at T-30d, T-7d create habit
- "Your muhurta is 87% aligned" is emotionally sticky
- PDF export = shareable (word-of-mouth)

---

### Tier 3: Enterprise/Hospital B2B API

**User:** Hospitals, maternity centers, surgical facilities

**Price:** ₹100K-500K/month (per hospital)

**Features:**
- ✅ Everything in Premium +
- ✅ Hospital API endpoint: `/api/hospital/muhurtas`
- ✅ Bulk queries (50-100 candidate windows/month)
- ✅ Integration with hospital's patient management system
- ✅ C-section delivery timing optimization
- ✅ Patient dashboard (shows auspicious windows)
- ✅ Doctor/Matron dashboard (confirms windows, logs outcomes)
- ✅ Research data anonymization + logging
- ✅ Custom branding (hospital logo, terms)
- ✅ Dedicated support channel
- ✅ SLA: 99.9% uptime

**User Journey (Hospital):**
```
Hospital admin signs contract → Gets API key → 
Integrates with OB/GYN patient mgmt system → 

Doctor plans C-section for 2026-10-15 → 
System queries: POST /api/hospital/muhurtas {date: ..., mother_dob: ...} → 
Returns: "Auspicious windows: 05:23-05:35 AM, 02:45-02:55 PM (92% Convergence)" → 
Doctor confirms time: 05:30 AM → 
Patient gets SMS: "Your delivery is scheduled at the most auspicious time" → 
Outcome logged to research database
```

**Revenue model:**
- Base: ₹100K/month (up to 50 queries)
- Per-query: ₹500 above limit
- Enterprise: ₹500K/month (unlimited, custom integrations)
- TAM: 500+ hospitals × ₹200K avg = ₹100Cr+ market

---

## PART 3: FEATURE MATRIX (PHASE 1-4)

### PHASE 1 (Weeks 1-4): MVP — Marriage, Property, Business

**Time:** 20 hours
**Release:** Free + Premium tiers

| Feature | Status | Notes |
|---|---|---|
| React SPA scaffold | ✅ Done | Existing codebase |
| Free tier UI | 🔄 In Progress | Activity picker, date range |
| Panchanga calculation | ✅ Done | 5 components |
| Activity-specific rules | 🔄 Building | Marriage, Property, Business |
| Convergence Index (free) | 🔄 Building | Simple rule agreement |
| Premium signup (SMS OTP) | ⏳ Blocked | MSG91 account needed |
| Kundali input form | 🟢 Ready | Birth date, time, location |
| Numerology layer | 🟢 Ready | Gregorian date calculation |
| Pancha Pakshi precision | 🟢 Ready | 10-min windows |
| Convergence Index (premium) | 🟢 Ready | Weighted scoring |
| SMS reminder system | ⏳ Blocked | MSG91 integration |
| Database schema | ✅ Done | D1 tables |

**Output:** 3 event categories working, free users can see Panchanga, premium users get full 3-layer

---

### PHASE 2 (Weeks 5-8): Extended Features — 4 More Events + Advanced

**Time:** 16 hours
**Release:** Both tiers

| Feature | Status |
|---|---|
| Medical/Surgery muhurta | 🟢 Ready |
| Travel muhurta | 🟢 Ready |
| Education muhurta | 🟢 Ready |
| Interview/Job muhurta | 🟢 Ready |
| Hora calculation | 🟢 Ready |
| Choghadiya (8-fold) | 🟢 Ready |
| Rahu Kalam avoidance | 🟢 Ready |
| Panchaka detection | 🟢 Ready |
| PDF export (premium) | 🟢 Ready |
| History/saved muhurtas | 🟢 Ready |
| Dark mode | 🟢 Ready |
| Offline service worker | 🟢 Ready |

**Output:** 7 event categories, all features for consumer market

---

### PHASE 3 (Weeks 9-12): Hospital B2B + Payment

**Time:** 20 hours
**Release:** Enterprise tier (Razorpay)

| Feature | Status |
|---|---|
| Hospital signup flow | 🟢 Ready |
| API documentation | 🟢 Ready |
| `/api/hospital/muhurtas` endpoint | 🟢 Ready |
| Hospital patient dashboard | 🟢 Ready |
| Doctor confirmation UI | 🟢 Ready |
| Research data logging | 🟢 Ready |
| Razorpay integration | ⏳ Needs Naveen account |
| Invoice generation | 🟢 Ready |
| SLA monitoring | 🟢 Ready |

**Output:** Enterprise tier live, first hospital partnerships possible

---

### PHASE 4 (Weeks 13+): Advanced Features

| Feature | Time | Purpose |
|---|---|---|
| Shadbala integration | 8h | Planetary strength (optional advanced) |
| Real-time notifications | 4h | Push notifications (FCM) |
| Couple compatibility muhurta | 6h | Marriage enhancement (compare 2 kundalis) |
| Astrologer verification badge | 4h | Professional users / credibility |
| AI-generated explanations | 4h | Longer prose explanations (Claude API) |
| Research dashboard | 8h | Anonymous outcome tracking |
| Multi-language support | 6h | Hindi, English, Marathi, Gujarati |

---

## PART 4: DATABASE SCHEMA

### Core Tables (D1/SQLite)

```sql
-- Users (Premium + Enterprise)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  tier TEXT ('free', 'premium', 'enterprise'),
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  birth_lat REAL,
  birth_lon REAL,
  janma_nakshatra INT,
  janma_rashi TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  payment_status TEXT ('active', 'paused', 'cancelled')
);

-- Muhurta Queries (every calculation logged)
CREATE TABLE muhurta_queries (
  id TEXT PRIMARY KEY,
  user_id TEXT FOREIGN KEY,
  activity_type TEXT ('marriage', 'property', 'business', 'medical', etc),
  candidate_date DATE,
  candidate_time TIME,
  candidate_location TEXT,
  candidate_lat REAL,
  candidate_lon REAL,
  
  -- Panchanga
  tithi INT,
  tithi_name TEXT,
  vara INT,
  vara_name TEXT,
  nakshatra INT,
  nakshatra_name TEXT,
  yoga INT,
  yoga_name TEXT,
  karana TEXT,
  
  -- Personal (if premium)
  kundali_match_score FLOAT,
  numerology_score FLOAT,
  pancha_pakshi_window TEXT,
  
  -- Result
  convergence_index INT (0-100),
  favorable_factors TEXT (JSON array),
  caution_factors TEXT (JSON array),
  recommendation TEXT ('auspicious', 'caution', 'unsuitable'),
  explanation TEXT (prose),
  
  created_at TIMESTAMP,
  calculated_at TIMESTAMP
);

-- Premium Subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT FOREIGN KEY,
  plan TEXT ('monthly', 'yearly'),
  price_paise INT (999999 = ₹9,999),
  razorpay_subscription_id TEXT,
  status TEXT ('active', 'paused', 'cancelled'),
  start_date DATE,
  next_billing_date DATE,
  created_at TIMESTAMP
);

-- SMS Log (tracking OTP + reminders)
CREATE TABLE sms_log (
  id TEXT PRIMARY KEY,
  user_id TEXT FOREIGN KEY,
  phone TEXT,
  msg_type TEXT ('otp', 'reminder', 'confirmation'),
  muhurta_id TEXT FOREIGN KEY,
  content TEXT,
  status TEXT ('sent', 'failed', 'delivered'),
  msg91_id TEXT,
  created_at TIMESTAMP,
  delivered_at TIMESTAMP
);

-- Hospital API Keys (B2B)
CREATE TABLE hospital_api_keys (
  id TEXT PRIMARY KEY,
  hospital_name TEXT,
  hospital_contact_email TEXT,
  api_key TEXT UNIQUE,
  tier TEXT ('starter', 'professional', 'enterprise'),
  query_limit INT (50 for starter, unlimited for enterprise),
  queries_used INT,
  status TEXT ('active', 'paused'),
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Hospital Queries (B2B logging)
CREATE TABLE hospital_queries (
  id TEXT PRIMARY KEY,
  hospital_id TEXT FOREIGN KEY,
  patient_dob DATE,
  procedure_type TEXT ('c-section', 'surgery', 'treatment'),
  candidate_date DATE,
  candidate_time TIME,
  
  convergence_index INT,
  doctor_confirmed BOOLEAN,
  confirmed_time DATETIME,
  
  outcome_recorded BOOLEAN,
  outcome_notes TEXT,
  recorded_at TIMESTAMP
);

-- Cache (Ephemeris results, avoid re-calc)
CREATE TABLE ephemeris_cache (
  id TEXT PRIMARY KEY,
  date DATE,
  time TIME,
  location_hash TEXT,
  
  sun_lon REAL,
  sun_lat REAL,
  moon_lon REAL,
  moon_lat REAL,
  mars_lon REAL,
  mercury_lon REAL,
  jupiter_lon REAL,
  venus_lon REAL,
  saturn_lon REAL,
  rahu_lon REAL,
  ketu_lon REAL,
  
  lagna_sign TEXT,
  lagna_degree REAL,
  
  computed_at TIMESTAMP,
  accessed_count INT,
  last_accessed TIMESTAMP
);
```

---

## PART 5: API ENDPOINTS

### Consumer API (React SPA → Workers)

```
POST /api/calculate-muhurta
├─ Input: {
│   activity: 'marriage',
│   date: '2026-10-15',
│   location: 'Bhopal',
│   user_birth?: {dob, time, location}
│ }
└─ Output: {
    panchanga: {tithi, vara, nakshatra, yoga, karana},
    convergence_index: 87,
    favorable_factors: [...],
    caution_factors: [...],
    recommendation: 'auspicious',
    explanation: 'strong muhurta...'
  }

POST /api/premium/pancha-pakshi
├─ Input: {date, time, janma_nakshatra}
└─ Output: {
    optimal_window: {start: '05:23', end: '05:35'},
    bird_cycle: 'Peacock',
    strength: 'high'
  }

POST /api/auth/send-otp
├─ Input: {phone}
└─ Output: {otp_id, retry_after}

POST /api/auth/verify-otp
├─ Input: {phone, otp}
└─ Output: {token, user}

GET /api/user/history
├─ Output: [{muhurta_id, activity, date, convergence}, ...]

POST /api/user/save-muhurta
├─ Input: {muhurta_id, label, notes}
└─ Output: {saved: true}

POST /api/premium/export-pdf
├─ Input: {muhurta_id}
└─ Output: {pdf_url}
```

### Hospital API (B2B)

```
POST /api/hospital/muhurtas
├─ Headers: {Authorization: 'Bearer API_KEY'}
├─ Input: {
│   patient_dob: '1995-05-12',
│   procedure: 'c-section',
│   candidate_dates: ['2026-10-15', '2026-10-16'],
│   location: 'Delhi'
│ }
└─ Output: {
    candidates: [
      {date, time_windows: [{start, end, convergence}], recommendation},
      ...
    ]
  }

POST /api/hospital/confirm-muhurta
├─ Headers: {Authorization: 'Bearer API_KEY'}
├─ Input: {procedure_id, confirmed_time}
└─ Output: {confirmed: true, patient_sms_sent: true}

GET /api/hospital/usage
├─ Output: {queries_used: 45, queries_limit: 50, reset_date: '2026-10-01'}
```

---

## PART 6: UI/UX STRUCTURE

### Main Screens (Single-File PWA)

**Screen 1: Home / Activity Picker**
```
┌─────────────────────────────────────┐
│  OCCULTVIISION Kaalchakra Pro      │
│                                     │
│  What would you like to plan?       │
│                                     │
│  [Marriage]  [Property]  [Business] │
│  [Medical]   [Travel]    [Education]│
│  [Interview] [Vehicle]   [Ritual]   │
│                                     │
│  + 7 more...                        │
│                                     │
│  [← Go back]                        │
└─────────────────────────────────────┘
```

**Screen 2: Date Range Picker**
```
┌─────────────────────────────────────┐
│  Planning a Marriage                │
│                                     │
│  When would you like to marry?      │
│  (Select 30-day range)              │
│                                     │
│  From: [Oct 15, 2026] ▼             │
│  To:   [Nov 15, 2026] ▼             │
│                                     │
│  [Where will it be?]                │
│  Location: [Bhopal........] ▼       │
│                                     │
│  [Calculate Muhurtas →]             │
└─────────────────────────────────────┘
```

**Screen 3: Results (Free Tier)**
```
┌─────────────────────────────────────┐
│  ← Back to Activity                 │
│                                     │
│  BEST MARRIAGE DATES: Oct-Nov 2026  │
│                                     │
│  ✓ Oct 18 (Friday)                  │
│    • Tithi: Shukla Tritiya (good)   │
│    • Nakshatra: Rohini (auspicious) │
│    • Yoga: Vridhi (expansion)       │
│    • Convergence: 82%               │
│    └─ Premium: Add your birth date  │
│       for 98% accuracy             │
│                                     │
│  ✓ Oct 25 (Friday)                  │
│    • Tithi: Shukla Dashami          │
│    • Nakshatra: Magha (caution*)    │
│    • Yoga: Sadhaka (good)           │
│    • Convergence: 74%               │
│                                     │
│  [ → Upgrade to Premium for 3-layer]│
└─────────────────────────────────────┘
```

**Screen 4: Results (Premium Tier)**
```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  OCT 18, 2026 — YOUR IDEAL WINDOW   │
│  Convergence: 94% (STRONG)          │
│                                     │
│  📍 Time: 05:47 AM - 06:02 AM       │
│  (Pancha Pakshi optimal window)     │
│                                     │
│  Panchanga:                         │
│  • Tithi: Shukla Tritiya (Venus-ruled)│
│  • Vara: Friday (Venus day = love)  │
│  • Nakshatra: Rohini (fertility)    │
│  • Yoga: Vridhi (expansion)         │
│  • Karana: Balava (good)            │
│                                     │
│  Your Kundali:                      │
│  • Janma Nakshatra: Ashwini         │
│  • Tara Bala: Mitra (8/9 - excellent)│
│  • Numerology: 7+8 = 15 = 6 (repeat)│
│    (date resonates with birth #6)   │
│                                     │
│  ⚠️ Cautions:                       │
│  • Avoid 07:00-08:00 (Rahu Kalam)  │
│  • Strong morning window preferred  │
│                                     │
│  Why 94%?                           │
│  8/8 rule families favorable        │
│  • Panchanga ✓  • Kundali ✓         │
│  • Numerology ✓  • KP ✓             │
│  • No avoidance ✓  • Hora ✓        │
│  • Yoga ✓         • Tara ✓          │
│                                     │
│  [🔔 Set SMS Reminder]              │
│  [📥 Save to History]               │
│  [📄 Export as PDF]                 │
└─────────────────────────────────────┘
```

**Screen 5: Premium Login (SMS OTP)**
```
┌─────────────────────────────────────┐
│  Unlock 3-Layer Precision           │
│                                     │
│  Enter your phone:                  │
│  [+91 ____________]                 │
│                                     │
│  [Send OTP →]                       │
│                                     │
│  Already a member?                  │
│  [Continue with OTP]                │
└─────────────────────────────────────┘

↓ (after SMS)

┌─────────────────────────────────────┐
│  Verification Code                  │
│                                     │
│  Enter 6-digit code sent to 9669... │
│                                     │
│  [_ _ _ _ _ _]                      │
│                                     │
│  Didn't get it? [Resend in 45s]     │
└─────────────────────────────────────┘

↓ (after OTP verified)

┌─────────────────────────────────────┐
│  Your Birth Details                 │
│                                     │
│  For 3-layer personalization:       │
│                                     │
│  Date of Birth:  [12 May 1995]  ▼   │
│  Time of Birth:  [11:45 AM]    ▼    │
│  Location:       [Bhopal]      ▼    │
│                                     │
│  [Save & Continue →]                │
│                                     │
│  Don't have birth time?             │
│  [Skip for now]                     │
└─────────────────────────────────────┘
```

**Screen 6: History / Saved Muhurtas**
```
┌─────────────────────────────────────┐
│  📚 Your Muhurtas                   │
│                                     │
│  Wedding - Niharika & Arjun         │
│  Oct 18, 2026 | 05:47 AM            │
│  Convergence: 94% | 🔔 Reminder set│
│  [View Full] [Edit] [Share]         │
│                                     │
│  Office Inauguration                │
│  Sep 29, 2026 | 09:15 AM            │
│  Convergence: 87% | 📄 PDF saved   │
│  [View Full] [Edit] [Share]         │
│                                     │
│  [← Back to Home]                   │
└─────────────────────────────────────┘
```

---

## PART 7: BUSINESS LOGIC FLOWS

### Calculation Flow (16-Step)

```javascript
async function calculateMuhurta(input) {
  // 1. Validate input
  validateInput(input);
  
  // 2. Check cache (avoid re-calc)
  cached = await getEphemerisCache(input.date, input.location);
  if (cached) return useCached(cached);
  
  // 3. Astronomical calculation
  planets = await computeEphemeris(input.date, input.time, input.location);
  
  // 4. Panchanga (5 components)
  panchanga = calculatePanchanga(planets, input.location);
  
  // 5. Advanced context
  context = calculateContext(input.date, planets);
  
  // 6. Personal Layer 1 (if kundali)
  kundaliMatch = input.birth ? calculateKundali(input.birth, planets) : null;
  
  // 7. Personal Layer 2 (numerology)
  numerology = calculateNumerology(input.birth, input.date);
  
  // 8. Personal Layer 3 (Pancha Pakshi)
  pancha = calculatePanchaPakshi(input.janma_nakshatra, panchanga.nakshatra);
  
  // 9. Hora
  hora = calculateHora(input.date, input.location);
  
  // 10. Avoidance windows
  avoidance = calculateAvoidanceWindows(input.date, input.location);
  
  // 11. Panchaka & Bhadra
  panchaka = detectPanchaka(panchanga);
  
  // 12. Activity-specific rules
  activityRules = applyActivityRules(input.activity, panchanga, kundaliMatch);
  
  // 13. KP layer
  kpScore = calculateKPDecision(planets, input.activity);
  
  // 14. Shadbala (if enabled)
  shadbala = input.advanced ? calculateShadbala(planets) : null;
  
  // 15. Source exceptions
  exceptions = getSourceExceptions(panchanga, input.activity);
  
  // 16. Convergence + explanation
  convergence = calculateConvergence(
    panchanga, kundaliMatch, numerology, kpScore, 
    activityRules, avoidance, panchaka, hora
  );
  
  return {
    panchanga,
    context,
    kundaliMatch,
    numerology,
    pancha,
    convergence_index: convergence.index,
    favorable_factors: convergence.favorable,
    caution_factors: convergence.caution,
    recommendation: convergence.recommendation,
    explanation: generateExplanation(convergence)
  };
}
```

### Subscription Flow

```
User clicks [Upgrade to Premium]
  ↓
System checks: already premium?
  ├─ Yes → show "Already premium" 
  └─ No → proceed
  ↓
[Sign up with phone]
  ↓
Send SMS OTP (MSG91)
  ↓
User enters OTP
  ↓
[Ask for Razorpay payment]
  ↓
Razorpay → Payment page
  ↓
User pays ₹999 (1 month) or ₹4,999 (1 year)
  ↓
Razorpay webhook → success
  ↓
Create subscription record
  ↓
Update user tier to "premium"
  ↓
Show: "Welcome! You now have 3-layer personalization"
  ↓
Auto-redirect to calculation page
```

### Hospital B2B Flow

```
Hospital admin @ "City Hospital, Delhi"
  ↓
[Signup page]
  ↓
Fill: Hospital name, contact email, phone
  ↓
Razorpay invoice: ₹200,000/month (subscription)
  ↓
Payment confirmed
  ↓
System generates: API Key: abc123def456...
  ↓
Hospital dev gets:
  - API documentation
  - Sample cURL requests
  - Patient dashboard login
  - Doctor confirmation interface
  ↓
Hospital integrates:
  POST to /api/hospital/muhurtas
  ├─ Patient DOB
  ├─ Procedure type (C-section)
  └─ Candidate dates
  ↓
System returns auspicious windows
  ↓
Doctor confirms timing
  ↓
Patient gets SMS: "Your delivery is at the most auspicious time"
  ↓
Outcome tracked (anonymized)
  ↓
Research database grows
```

---

## PART 8: INTEGRATION POINTS

### MSG91 / Interakt SMS Gateway

**Purpose:** OTP verification, reminders

**Integration:**
```javascript
// Send OTP
async function sendOTP(phone) {
  const otp = generateOTP(6);
  const msg = `Your OCCULTVIISION verification code: ${otp}`;
  
  const response = await fetch('https://api.msg91.com/apiv5/flow/', {
    method: 'POST',
    headers: {'authkey': process.env.MSG91_AUTH_KEY},
    body: JSON.stringify({
      route: 'otp',
      recipients: [phone],
      message: msg
    })
  });
  
  // Store in DB
  await db.insert('sms_log', {
    phone, otp_hash: hash(otp), status: 'sent'
  });
  
  return {otp_id: uuid(), retry_after: 30};
}

// Send reminder
async function sendReminder(user, muhurta) {
  const msg = `📅 ${muhurta.activity} muhurta: ${muhurta.date} @ ${muhurta.time}. Auspicious! (${muhurta.convergence_index}% match)`;
  
  await sendSMS(user.phone, msg);
}
```

**Account setup:** Naveen to create MSG91 account, get API key, add to `.env`

---

### Razorpay Payments

**Purpose:** Premium subscriptions, hospital billing

**Integration:**
```javascript
// Create subscription
async function createSubscription(user, plan) {
  const subscription = await razorpay.subscriptions.create({
    plan_id: plan === 'monthly' ? PLAN_MONTHLY_ID : PLAN_YEARLY_ID,
    customer_notify: 1,
    customer: {
      email: user.email,
      contact: user.phone
    }
  });
  
  // Store in DB
  await db.insert('subscriptions', {
    user_id: user.id,
    razorpay_subscription_id: subscription.id,
    plan,
    status: 'active'
  });
  
  return subscription;
}

// Webhook handler
async function handleRazorpayWebhook(event) {
  if (event.event === 'subscription.activated') {
    const subscription = event.payload.subscription.entity;
    await db.update('subscriptions', 
      {razorpay_subscription_id: subscription.id}, 
      {status: 'active'}
    );
  }
}
```

**Account setup:** Naveen to create Razorpay account, configure plans, get API keys

---

### Cloudflare Pages & Workers

**Purpose:** Deployment, serverless backend, caching

**Deployment:**
```bash
# Push to GitHub → Automatic:
# 1. Build: npm run build:single-file
# 2. Deploy to Cloudflare Pages
# 3. Workers bound to D1 database
# 4. Redis cache initialized

# Manual: 
wrangler publish
```

**Workers endpoint:**
```javascript
// wrangler.toml
[env.production]
vars = {MSG91_AUTH_KEY = "..."}
d1_databases = [{binding = "DB", database_id = "..."}]
r2_buckets = [{binding = "PDF_BUCKET", bucket_name = "occultviision-pdfs"}]

// src/index.js
export default {
  async fetch(request, env) {
    const {pathname} = new URL(request.url);
    
    if (pathname === '/api/calculate-muhurta') {
      const body = await request.json();
      const result = await calculateMuhurta(body, env.DB);
      return new Response(JSON.stringify(result), {
        headers: {'Content-Type': 'application/json'}
      });
    }
    
    // ... more routes
  }
};
```

---

## PART 9: DEPLOYMENT STRATEGY

### Pre-Launch Checklist

```
Week 0 (This Week):
  ☐ Naveen confirms SMS provider (MSG91/Interakt)
  ☐ Naveen creates MSG91 account, gets API key
  ☐ Naveen creates Razorpay account, configures plans
  ☐ Domain: www.occultviision.com DNS pointed to Cloudflare
  ☐ SSL certificate auto-provisioned
  ☐ GitHub repo set up (done ✓)

Week 1-4 (Phase 1):
  ☐ Phase 1 coding (Marriage, Property, Business)
  ☐ SMS gateway integration tested
  ☐ Razorpay sandbox testing
  ☐ Database schema finalized
  ☐ Offline service worker working
  ☐ Dark mode implemented
  ☐ 5 beta users test free tier

Week 5 (Before Phase 2):
  ☐ Phase 1 → Production deployment
  ☐ www.occultviision.com live
  ☐ Monitor: error logs, performance, SMS success rate
  ☐ Collect beta feedback

Week 5-8 (Phase 2):
  ☐ Phase 2 coding (4 more event types)
  ☐ Continuous deployment (dev → staging → prod)
  ☐ Monitoring dashboard live

Week 9 (Before Phase 3):
  ☐ Phase 2 → Production
  ☐ First paid users convert
  ☐ Monitor: churn, retention, LTV

Week 9-12 (Phase 3):
  ☐ Hospital B2B API finalized
  ☐ Hospital contracts signed
  ☐ Enterprise tier → Production

Week 13+:
  ☐ Phase 4 features
  ☐ Marketing/growth
  ☐ Scaling infrastructure
```

### Monitoring & Alerts

**Metrics to track:**
- Free tier users (daily/weekly/monthly)
- Premium conversion rate
- Premium churn rate
- SMS delivery rate (should be >95%)
- API response time (<200ms)
- Calculation accuracy (against real muhurtas)
- Hospital queries/month
- Error rate (<0.1%)

**Alerts:**
- SMS delivery <90% → alert Naveen
- API response time >500ms → investigate
- Error rate >1% → rollback
- Database query >5s → optimize

---

## PART 10: REVENUE MODEL & TAM

### Pricing Tiers

| Tier | Price | Users | Monthly Revenue | Annual Revenue |
|---|---|---|---|---|
| **Free** | $0 | 100K (goal Y1) | $0 | $0 |
| **Premium** | ₹999/mo OR ₹4,999/yr | 5K (goal Y1) | ₹50L | ₹6Cr |
| **Hospital API** | ₹200K/mo | 50 hospitals (goal Y2) | ₹1Cr | ₹12Cr |

### TAM Analysis

**Consumer (Free → Premium):**
- 30K weddings/day × 365 = 11M/year (India)
- 5% adopt OCCULTVIISION = 550K users
- 5% premium conversion = 27.5K paid users × ₹999 avg = ₹27.5Cr annual

**Enterprise (Hospitals):**
- 500K surgeries/year in India
- 500+ hospitals × ₹200K = ₹100Cr TAM
- Realistic capture: 50 hospitals × ₹200K = ₹10Cr (Year 2-3)

**Total Y3 Potential:** ₹27.5Cr + ₹10Cr = **₹37.5Cr**

---

## PART 11: SUCCESS METRICS

### Phase 1 Success (4 weeks)
- ✅ 0 compilation errors
- ✅ 3 event types working (marriage, property, business)
- ✅ Free tier usable without login
- ✅ SMS OTP working (test flow)
- ✅ 5+ beta users testing
- ✅ 95%+ SMS delivery (test mode)
- ✅ Convergence Index matching manual calculations

### Phase 2 Success (8 weeks)
- ✅ 7 event types live
- ✅ 100+ free users
- ✅ 5+ premium subscribers
- ✅ <0.1% error rate
- ✅ <200ms API response
- ✅ PDF export working
- ✅ SMS reminders delivered correctly

### Phase 3 Success (12 weeks)
- ✅ Hospital B2B contracts signed
- ✅ 3+ hospitals in pilot
- ✅ ₹3-5L monthly MRR (revenue)
- ✅ 500+ premium users
- ✅ <1% hospital API failure rate
- ✅ Hospital dashboard live
- ✅ Research database logging outcomes

### Year 1 Success
- ✅ 50K+ total users
- ✅ 5K premium subscribers
- ✅ ₹5Cr+ annual revenue
- ✅ 10+ hospital partnerships
- ✅ Zero major bugs in production
- ✅ 99.9% uptime SLA met

---

## PART 12: CRITICAL DECISIONS BEFORE CODE

**Must decide BEFORE Phase 1 starts:**

1. ✅ **Framework:** React PWA (confirmed)
2. ⏳ **SMS Gateway:** MSG91 or Interakt?
3. ⏳ **Domain:** www.occultviision.com ready?
4. ⏳ **Razorpay:** Account created?
5. 🔴 **Event priority:** Which 3 first? (Marriage recommended)
6. 🔴 **Kundali requirement:** Optional or mandatory for premium?
7. 🔴 **Data retention:** How long to keep queries? (privacy)
8. 🔴 **Hospital contract:** Any signed already?

---

**Framework complete.** All architecture, flows, business logic, database schema, API endpoints, UI screens documented.

**Ready to code Phase 1 the moment blockers are cleared.**

**Next: Confirm SMS + domain + Razorpay. Then → BUILD.**

---

**Document created:** September 28, 2026 | **Status:** Architecture Complete | **Build time remaining:** 12 weeks
