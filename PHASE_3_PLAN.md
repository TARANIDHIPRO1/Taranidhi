# OCCULTVIISION Phase 3 — SMS Gateway Testing & Event Categories
## Implementation Plan | September 28, 2026

---

## PHASE 3 OVERVIEW

**Goal:** Test SMS/gateway integration end-to-end BEFORE full Cloudflare deployment. Build 4 event categories in parallel.

**Duration:** 
- SMS Testing: 3-5 days (blocked on Naveen decision)
- Event Category Dev: 4 weeks (28 hours total)
- Total Phase 3: 5-6 weeks

**Success Criteria:**
- ✅ SMS OTP flow tested (signup → delivery → verify)
- ✅ Property muhurat fully implemented (P0)
- ✅ Marriage muhurat fully implemented (P1)
- ✅ All event categories live with 5-layer scoring
- ✅ 0 critical bugs in integration tests

---

## PART 1: SMS GATEWAY TESTING

### Prerequisites (Naveen Action Items)

| Item | Deadline | Impact |
|------|----------|--------|
| SMS Provider Decision | ASAP | Blocks all OTP flow testing |
| Test Credentials | +1 day after decision | Blocks SMS testing |
| Production Credentials | +2 days | Needed for Cloudflare deploy |

**SMS Provider Options:**

**Option A: MSG91** (Recommended for India)
- Cost: ₹1-2 per SMS
- Setup time: 1 hour
- Features: OTP templates, retry logic, bulk SMS
- Pros: India-focused, fast delivery, trusted
- Cons: Limited global reach
- Account: https://msg91.com

**Option B: Interakt**
- Cost: ₹2-5 per message (WhatsApp + SMS)
- Setup time: 2 hours
- Features: WhatsApp + SMS, API-driven, modern
- Pros: Dual channel, emerging market leader
- Cons: Higher cost, newer platform
- Account: https://www.interakt.ai

**Recommendation:** MSG91 (lower cost, faster OTP delivery, India-first)

---

### SMS Testing Checklist

**Setup Phase (1 day):**
```
[ ] MSG91 account created + verified
[ ] API credentials obtained (auth_key, sender_id)
[ ] OTP template configured (validity: 10 min, resend: 30s)
[ ] Test phone number registered (Naveen's mobile)
[ ] worker/src/lib/sms.ts updated with credentials
[ ] worker/env.d.ts updated with SMS_PROVIDER, SMS_AUTH_KEY
```

**Test Case 1: Basic OTP Signup** (2 hours)
```typescript
Scenario: New user registers
Input: User clicks "Sign Up", enters phone +91-XXXXXXXXXX
Expected:
  1. POST /auth/signup → Creates user (tier="free", unverified)
  2. SMS gateway called: sendOtp(phone, otp_token, template="SIGNUP")
  3. SMS logged to query_logs table (status="pending")
  4. Response: { message: "OTP sent", phone_masked: "+91-****7890" }
  
Verify:
  [ ] OTP received on test phone within 30s
  [ ] OTP is 6 digits, valid for 10 min
  [ ] query_logs row created: { user_id, phone, query_type="otp_sent", status="pending" }
  [ ] POST /auth/verify?otp=XXXXXX → succeeds, user.verified=true
  [ ] Subsequent OTP requests (same session) return 429 rate limit
```

**Test Case 2: Muhurat Reminder SMS** (3 hours)
```typescript
Scenario: User saves muhurat event, SMS sent at T-7d and T-1d
Setup:
  1. User logged in, has kundali saved
  2. POST /muhurta/save-event → saves property muhurat for 2026-10-15
  3. Trigger set: SMS reminders at 2026-10-08 (T-7d) and 2026-10-14 (T-1d)

Expected:
  1. At 2026-10-08 10:00 IST: Scheduled task fires
  2. SMS sent: "🏠 Property muhurat reminder: Oct 15, 2:15-3:45 PM IST. Confirm?"
  3. SMS logged to query_logs: { muhurta_event_id, status="sent", delivery_at }
  
Verify:
  [ ] Scheduled task created in Cloudflare Workers
  [ ] SMS delivered to user's phone
  [ ] Retry logic works: if SMS fails, retry after 60s
  [ ] query_logs shows 2 SMS rows: T-7d sent, T-1d sent
```

**Test Case 3: Retry Logic on Failure** (2 hours)
```typescript
Scenario: SMS gateway temporarily fails, auto-retry succeeds
Setup:
  1. Simulate SMS gateway returning 503 (temporarily unavailable)
  2. User requests OTP (via signup)
  
Expected:
  1. First attempt fails → logged as status="failed_retry_1"
  2. Auto-retry after 30s → succeeds → logged as status="sent"
  3. Total time: <60s from initial request
  4. User still receives ONE SMS (no duplicates)
  
Verify:
  [ ] query_logs shows both attempts
  [ ] User receives SMS once (no duplicates)
  [ ] Max 3 retries before giving up (don't spam gateway)
  [ ] Error response to user: "Sending OTP... (retry 1 of 3)"
```

**Test Case 4: Rate Limiting** (1 hour)
```typescript
Scenario: User or attacker tries rapid OTP requests
Setup:
  1. User clicks "Send OTP" 5 times in 60 seconds
  
Expected:
  1. Request 1: 200 OK, SMS sent
  2. Requests 2-5: 429 TOO MANY REQUESTS
  3. Error: "OTP sent recently. Try again in 45s."
  4. query_logs shows only 1 SMS (not 5)
  
Verify:
  [ ] Rate limiter enforced: max 1 OTP per 60s per phone
  [ ] No duplicate SMS sent
  [ ] Rate limit response is clear to user
```

**Test Case 5: SMS Delivery Logging & Analytics** (1 hour)
```typescript
Scenario: All SMS events logged for analytics
Setup:
  1. Run all 4 test cases above
  
Expected:
  1. query_logs table has rows for:
     - SMS sent (OTP)
     - SMS sent (muhurat reminder)
     - SMS failed + retry
     - SMS rate limited
  
Verify:
  [ ] SELECT COUNT(*) FROM query_logs WHERE query_type='sms_*' → matches test count
  [ ] Each row has: { user_id, phone, query_type, status, sent_at, delivery_at }
  [ ] No sensitive data in logs (phone masked, OTP not stored)
```

---

### SMS Testing Timeline

**Day 1: Setup**
- Naveen creates MSG91 account + provides credentials
- Claude updates worker code with SMS credentials
- Deploy to staging (Cloudflare Workers staging)

**Day 2-3: Run Test Cases**
- Test 1: Basic OTP (2h)
- Test 2: Muhurat Reminder (3h)
- Test 3: Retry Logic (2h)
- Test 4: Rate Limit (1h)
- Test 5: Logging (1h)

**Day 4: Bug Fixes (if any)**
- Fix any issues found in testing
- Re-run failed test cases

**Day 5: Production Deploy**
- Swap staging credentials for production
- Final smoke test: signup → OTP → verify
- Document SMS provider setup in RUNBOOK.md

---

## PART 2: EVENT CATEGORY IMPLEMENTATION

### Architecture Recap

Each event category uses the **5-layer scoring engine** from `horaScoring.ts`:

1. **Purpose Weight** — How favorable each planet is for this event
2. **Functional Nature** — Lagna-based benefic/malefic classification
3. **Tarabala Gate** — Birth star alignment (Janma Tara now neutral)
4. **Chandrabala Gate** — Transiting Moon rashi position
5. **Dasha Gate** — Running Mahadasha/Antardasha reinforcement

### Event Category Definitions

#### P0: Property Purchase Muhurat (⏳ 8 hours)

**User Goal:** Find auspicious date to sign property papers / take possession

**Key Rules:**
- **Nakshatra Window:** Avoid Ganda Moola nakshatras (Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati)
- **Tithi Window:** Avoid dark moon (Amavasya), full moon (Purnima) for property deals
- **Vara:** Avoid Saturday (Shani rules obstacles), Thursday (Jupiter rules finance — can be mixed)
- **Direction Check:** Property direction should not match Dishashool (inauspicious direction of day)
- **Moon Strength:** Moon in Exaltation (Taurus) or own sign (Cancer) favorable
- **Vastu Notes:** North-East facing property, open layout, good light

**Scoring Adjustments:**
```typescript
PURPOSE_WEIGHTS.property_purchase = {
  Sun: 6,    // Authority for registration
  Moon: 7,   // Stability, nurturing (home)
  Mars: 5,   // Energy for new venture
  Mercury: 6, // Paperwork, contracts
  Jupiter: 9, // Expansion, fortune (highest)
  Venus: 7,   // Wealth, luxury
  Saturn: 4,  // Long-term stability (but caution)
  Rahu: 3,    // Unusual properties, speculation risk
  Ketu: 2     // Uncertain outcomes
};
```

**UI Screens:**
1. **Input Screen:**
   - Property address (for direction check via compass)
   - Budget range (₹20L-500L+)
   - Preferred date range (3 months window)
   - Buyer's kundali (optional, for personalization)

2. **Analysis Screen:**
   - Calendar view: green (auspicious), yellow (neutral), red (caution)
   - Top 5 dates with scores (70-100 range)
   - Detailed breakdown for selected date:
     - Hora lord + planetary positions
     - Panchaka/Ganda Moola warnings
     - Tarabala status (if kundali provided)
     - Suggested time window (±30 min precision)

3. **Booking Screen:**
   - One-click SMS reminder setup (T-7d, T-1d)
   - Print/share muhurat certificate
   - Link to property consultant (affiliate program)

**Testing:**
- [ ] Property muhurat for today (should show score 60-90 range)
- [ ] Property muhurat for next 90 days (should surface 15+ auspicious dates)
- [ ] Ganda Moola filter working (Ashwini should show red/caution)
- [ ] Personalized scoring (with kundali vs without) differs by 10-15 points

**Estimated Time:**
- Backend: 4h (purpose weights, database storage, API endpoint)
- Frontend: 3h (calendar UI, date picker, results display)
- Testing: 1h

---

#### P1: Marriage Muhurat (⏳ 10 hours)

**User Goal:** Find wedding date & time (typically 12-24 months ahead)

**Key Rules:**
- **Month Window:** Avoid Monsoon (rainy season), Chaitra/Vaishakh (summer heat)
- **Nakshatra Compatibility:** Ashwini, Magha, Mula favorable for marriage (all nakshatras workable with remedies)
- **Tithi Preference:** Shukla Pakshas (bright lunar fortnight) preferred over Krishna Pakshas
- **Rahu-Kaal:** MUST avoid (inauspicious for all work)
- **Spouse Compatibility:** If both kundalis available, check Guna Milan (8/36 or higher = good match)
- **Dasha Check:** Avoid maraka dashas (7th, 8th, 12th lords' periods)
- **Venus/Jupiter Position:** Strong Venus (wealth, marriage) + strong Jupiter (expansion of family) favorable

**Scoring Adjustments:**
```typescript
PURPOSE_WEIGHTS.marriage = {
  Sun: 4,     // Authority, officiant
  Moon: 7,    // Emotions, bonding (high)
  Mars: 3,    // Aggression risk (lower)
  Mercury: 5, // Communication, family connections
  Jupiter: 9, // Expansion, auspiciousness (highest)
  Venus: 9,   // Love, marriage, relationships (highest)
  Saturn: 2,  // Restrictions, delays (avoid)
  Rahu: 2,    // Confusion, unexpected changes
  Ketu: 2     // Separation risk
};
```

**UI Screens:**
1. **Input Screen:**
   - Both partners' kundalis (birth date/time/location)
   - Preferred date range (12-36 months from now)
   - Budget (₹5L-50L+ for event)
   - Guestlist size (impacts venue availability)

2. **Compatibility Screen (if 2 kundalis):**
   - Guna Milan score (out of 36)
   - Mangal Dosha check (if applicable)
   - Compatibility interpretation (very compatible → caution required)
   - Remedies if compatibility weak

3. **Date Selection Screen:**
   - Monthly calendar view (next 36 months)
   - Top 10 dates color-coded
   - Detailed breakdown:
     - Muhurat time window (2-4 hours typical)
     - Venus/Jupiter positions
     - Dasha impact (reinforcement bonus/penalty)
     - Guest count accommodation
   - Alternative dates if first choice booked

4. **Booking Screen:**
   - Venue suggestions (via partnership)
   - Priest/pundit referral
   - SMS reminders: T-30d, T-7d, T-1d
   - Wedding checklist (function planning)

**Testing:**
- [ ] Marriage muhurat for 2026-12-15 (should surface dates around diwali season)
- [ ] Guna Milan calculation (test with known compatible + incompatible pairs)
- [ ] Mangal Dosha detection (Aries/Scorpio ascendants)
- [ ] Personalized scoring: kundali-based vs generic differs by 20-30 points
- [ ] SMS reminders trigger correctly (30d, 7d, 1d before date)

**Estimated Time:**
- Backend: 5h (Guna Milan algorithm, Mangal Dosha check, dasha lookup)
- Frontend: 4h (compatibility screen, 36-month calendar, wedding checklist)
- Testing: 1h

---

#### P2: Business Launch Muhurat (⏳ 6 hours)

**User Goal:** Find auspicious date to register company / open shop

**Key Rules:**
- **Mercury Position:** Mercury rules commerce, business (strong Mercury = good day)
- **Sun Position:** Sun rules authority, leadership (favorable for inauguration)
- **Moon Cycle:** Shukla Paksha (bright fortnight) preferred
- **Jupiter Transit:** Jupiter in own/exalted sign = expansion period
- **Rahu-Kaal:** Avoid (unlucky for business)
- **Director's Birth Star:** Director's personal star should have Sampat/Sadhak status (vs Vadha)

**Scoring Adjustments:**
```typescript
PURPOSE_WEIGHTS.business_launch = {
  Sun: 7,     // Leadership, visibility
  Moon: 4,    // Stability (but can be passive)
  Mars: 5,    // Energy, drive
  Mercury: 9, // Commerce, trade (highest)
  Jupiter: 8, // Expansion, fortune
  Venus: 6,   // Wealth, luxury goods
  Saturn: 4,  // Long-term stability
  Rahu: 5,    // Unusual ventures, tech startups
  Ketu: 2     // Abandonment, loss
};
```

**UI Screens:**
1. **Input Screen:**
   - Business type (shop, service, tech, manufacturing)
   - Founder's kundali (birth date/time/location)
   - Preferred launch range (next 6-12 months)
   - Location (for Dishashool direction check)

2. **Analysis Screen:**
   - Top 10 dates with Mercury/Sun positioning
   - Rahu-Kaal times to avoid
   - Director's personal star alignment (Tarabala bonus)
   - Jupiter transit impact (expansion window)

3. **Booking Screen:**
   - Inauguration time (typically 1-2 hours)
   - Priest/pandit coordination
   - Registrar availability check (via partnership)
   - SMS reminders + business calendar integration

**Testing:**
- [ ] Business muhurat for Tech startup (should favor Mercury > Jupiter)
- [ ] Business muhurat for Shop (should favor Venus + Mercury)
- [ ] Rahu-Kaal filter working (no suggestions during Rahu-Kaal)
- [ ] Personalized (with founder's kundali) vs generic differs by 15-25 points

**Estimated Time:**
- Backend: 3h (business type weights, Mercury positioning)
- Frontend: 2h (type selector, business dashboard)
- Testing: 1h

---

#### P3: Medical/Surgery Muhurat (⏳ 4 hours)

**User Goal:** Find auspicious timing for scheduled surgery / fertility treatment

**Key Rules:**
- **Moon Strength:** Strong Moon (Exaltation in Taurus, Bright Lunar Fortnight) = faster recovery
- **Mars Weakness:** Avoid Mars period (injury, blood loss risk)
- **6th House:** Weak planets in 6th house = overcome disease
- **Rahu-Kaal:** MUST avoid (complications, delays)
- **Saturn Aspect:** Saturn aspecting surgery site can delay healing
- **Chandrabala:** Critical for health (8th position worst)

**Scoring Adjustments:**
```typescript
PURPOSE_WEIGHTS.medical_surgery = {
  Sun: 6,     // Vitality, immunity
  Moon: 8,    // Healing, recovery (high)
  Mars: 2,    // Surgery risk, bleeding (avoid)
  Mercury: 5, // Nervous system, communication
  Jupiter: 7, // Immunity, expansion of wellness
  Venus: 4,   // Comfort, beauty (cosmetic surgery)
  Saturn: 3,  // Chronic conditions (need strength)
  Rahu: 2,    // Complications
  Ketu: 1     // Unknown outcomes
};
```

**UI Screens:**
1. **Input Screen:**
   - Surgery type (fertility, cardiac, orthopedic, etc.)
   - Patient's kundali (birth date/time/location)
   - Doctor's availability window (typically 1-2 weeks)
   - Hospital location

2. **Analysis Screen:**
   - Scores for available dates (within doctor's window)
   - Moon strength chart (exaltation, strength, phase)
   - Chandrabala status (critical)
   - Rahu-Kaal warning (if date includes Rahu-Kaal, marked RED)
   - Suggested surgery time (morning = better for most)

3. **Booking Screen:**
   - Hospital integration (API to check surgeon availability)
   - Pre-surgery preparation checklist
   - Post-surgery care recommendations (per Ayurveda)
   - SMS reminders: T-7d, T-3d, T-1d, T-morning-of

**Testing:**
- [ ] Surgery muhurat: Moon in Taurus (exalted) should score 85-95
- [ ] Surgery muhurat: Mars in 8th house should reduce score 20%
- [ ] Rahu-Kaal times shown as unavailable
- [ ] Chandrabala gate enforced (8th position = cap at 50)

**Estimated Time:**
- Backend: 2h (moon strength calc, Chandrabala gate)
- Frontend: 1.5h (surgery type selector, timeline)
- Testing: 0.5h

---

## PART 3: IMPLEMENTATION ROADMAP

### Week 1-2: Property Muhurat (P0)

**Backend (4h):**
```
Day 1: Add PURPOSE_WEIGHTS.property_purchase to horaScoring.ts
Day 1: Add property muhurat endpoint POST /muhurta/events/property
Day 2: Add direction check (Dishashool filter) to muhurta.ts
Day 2: Store muhurta events in DB (muhurta_events table)
```

**Frontend (3h):**
```
Day 1: Create /events/property screen (date picker + calendar)
Day 2: Display muhurta analysis (top 5 dates, scores)
Day 2: Add SMS reminder booking
```

**Testing (1h):**
```
Day 3: Test 5+ dates (including Ganda Moola dates)
Day 3: Verify score ranges (60-100)
```

**Deploy:** Push to staging (Sept 30)

---

### Week 3-4: Marriage Muhurat (P1)

**Backend (5h):**
```
Day 1: Implement Guna Milan algorithm (36-point scale)
Day 2: Add Mangal Dosha detection (Mars in 8/12)
Day 3: Add dasha reinforcement bonus to scoreHora
Day 3: POST /muhurta/events/marriage endpoint
Day 4: Add spouse compatibility to kundali schema (2nd column)
```

**Frontend (4h):**
```
Day 1: Compatibility screen (Guna Milan display)
Day 2: 36-month calendar view
Day 3: Wedding checklist + SMS reminders
```

**Testing (1h):**
```
Day 4: Test with 3 known couples (compatible + incompatible)
Day 4: Verify Guna Milan scores match manual calculation
```

**Deploy:** Push to staging (Oct 7)

---

### Week 5: Business Launch & Medical (P2 + P3)

**Business Launch (6h) — Days 1-3:**
```
Day 1: Add PURPOSE_WEIGHTS.business_launch
Day 2: Business type selector (shop, service, tech, mfg)
Day 3: Director's Tarabala bonus logic
```

**Medical Surgery (4h) — Days 3-4:**
```
Day 3: Add Moon strength calculator
Day 4: Chandrabala gate logic (8th position cap)
```

**Frontend (3.5h) — Days 4-5:**
```
Day 4: Business launch screen + medical selector
Day 5: Surgery date analysis + recovery timeline
```

**Testing (1.5h):**
```
Day 5: Test business dates + medical dates
Day 5: Verify Moon strength + Chandrabala gates
```

**Deploy:** Push to staging (Oct 14)

---

## PART 4: BLOCKERS & DEPENDENCIES

| Item | Status | Owner | Impact |
|------|--------|-------|--------|
| SMS Provider Setup | 🔴 Waiting | Naveen | Blocks entire Phase 3 start |
| Frontend Domain | 🔴 Waiting | Naveen | Blocks CORS for Cloudflare deploy |
| Razorpay Account | 🔴 Waiting | Naveen | Blocks payment flow (Phase 4) |
| Kundali Schema (spouse) | 🟢 Ready | Claude | Needed for marriage muhurat |
| Scheduled Tasks (SMS) | 🟢 Ready | Claude | Needed for reminders |

---

## PART 5: SUCCESS METRICS

**By End of Phase 3:**
- ✅ SMS OTP tested end-to-end (5 test cases passed)
- ✅ Property muhurat live + 10 dates retrieved in <1s
- ✅ Marriage muhurat live + Guna Milan tested on 3 couples
- ✅ Business muhurat live + Mercury positioning verified
- ✅ Medical muhurat live + Chandrabala gate enforced
- ✅ All 4 categories integrated with 5-layer scoring
- ✅ 0 TypeScript errors, all tests passing (101/101)
- ✅ SMS reminders working (verified on test phone)

**Launch Readiness:**
- Cloudflare worker configured (staging)
- Frontend domain confirmed (prod)
- Razorpay credentials ready (post-SMS)
- All event categories deployed to Cloudflare (Oct 20)

---

## DECISION POINTS FOR NAVEEN

**1. SMS Provider (URGENT)**
- [ ] MSG91 (₹1-2/SMS, recommended)
- [ ] Interakt (₹2-5/message, WhatsApp+SMS)
- [ ] Other: _______________

**2. Which Event Category First?**
- [x] Property (P0 — highest value per user)
- [ ] Marriage (P1 — highest volume of searches)

**3. SMS Reminder Frequency?**
- [ ] T-7d, T-1d (recommended)
- [ ] T-30d, T-7d, T-1d (more aggressive)
- [ ] Custom: _______________

---

**Report Generated:** September 28, 2026 | OCCULTVIISION Phase 3 | Ready to Start
