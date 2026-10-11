# TaraNidhi — Page Architecture Audit
**Date:** 2026-10-11  
**Status:** Production app live at https://taranidhi-kp.floot.app  
**Backend:** Cloudflare Worker `occultviision-api` at https://occultviision-api.workers.dev  
**Issue addressed:** User critique — "architecture design nhi Kiya pehle, kis page per kya dena hai pata nhi tha"

---

## Architecture Overview

```
User Device (Browser / PWA)
       │
       ▼
Floot Frontend Pages (taranidhi-kp.floot.app)
  pages/*.tsx  — React/TS UI screens
       │
       ▼ fetch() calls
Floot Serverless Endpoints (same origin)
  endpoints/**/*_GET.ts / *_POST.ts
       │
       ▼ fetch() proxy calls  [OR direct from page]
Cloudflare Worker Backend (occultviision-api.workers.dev)
  /kundali, /muhurta/*, /numerology, /kp/*, etc.
       │
       ├─ D1 Database (user charts, query logs)
       ├─ KV Namespace (sessions, rate limits)
       └─ Ephemeris calculations (astronomy-engine)
```

**Key constraint:** Floot pages call relative `/api/...` endpoints on Floot,
which then proxy to the Cloudflare Worker. Or they call the Worker directly
via absolute URL. Need to verify per-page once build limit resets.

---

## Page-by-Page Specification

### 1. `/panchang` — Daily Panchang 🌙

**Purpose:** Show today's Vedic almanac data  
**User need:** Priest, practitioner, or devotee checks daily auspiciousness  

**Must display:**
- Current date + time (user's timezone)
- Tithi (lunar day 1–30, waxing/waning)
- Vara (weekday + ruling planet)
- Nakshatra (birth star of Moon + deity)
- Yoga (27-fold auspiciousness score)
- Karana (half-tithi, 11 types)
- Sunrise / Sunset times
- Moonrise / Moonset times
- Rahu Kaal (inauspicious period)
- Gulika Kaal (inauspicious period)
- Abhijit Muhurta (auspicious midday window)

**Backend call needed:** None ideal — panchang = pure ephemeris calculation  
**Actual implementation:** Should call Floot endpoint → Worker or compute locally  
**Status:** ✅ Built Days 1-3 | ⚠️ Need to verify all fields display correctly

---

### 2. `/hora` — Hora·Lagna ⏳

**Purpose:** Show current planetary hour (Hora) and upcoming schedule  
**User need:** Find auspicious hour for action today  

**Must display:**
- Current Hora (which planet rules this hour)
- Hora ruling planet's significations (what it's good for)
- Today's full Hora schedule (sunrise to sunrise, 24 horas)
- Highlighted current + next 2-3 horas
- Lagna (ascendant sign) for current hora
- Upagraha (sub-planets for the hora)

**Backend call needed:** GET /hora/now?lat=&lon= (need to add to Worker)  
**OR:** Pure client-side calculation using Hora formula:  
  - Day hora starts at sunrise, night hora starts at sunset  
  - Lord sequence: Sun/Venus/Mercury/Moon/Saturn/Jupiter/Mars (7-day cycle)  
**Status:** ✅ Built Day 3-4 | ⚠️ Need to verify Hora calculation accuracy

---

### 3. `/muhurta` — Muhurta Finder ⏰

**Purpose:** Find the best auspicious time for a planned event  
**User need:** Marriage date, property purchase, business start, surgery, travel  

**Must display:**
- Event type selector (8 categories minimum)
- Date range picker (from/to)
- Location input (for sunrise/sunset)
- "Find Muhurta" button
- Results: Ranked list of auspicious windows with:
  - Date + time window
  - Score (0-100)
  - Tarabala rating
  - Chandrabala rating  
  - Tithi + Vara + Nakshatra at that time
  - Warnings (Rahu Kaal overlap, Ganda Moola, etc.)

**Backend call:** GET /muhurta/scan?from=&to=&type=&lat=&lon=  
**Worker route:** ✅ `handleMuhurtaScan` exists in worker/src/routes/muhurtaScanner.ts  
**Status:** 🔴 "Failed to fetch" — URL mismatch or endpoint error  

---

### 4. `/kundali` — Birth Chart 🔮

**Purpose:** Create and view KP birth chart  
**User need:** Astrologer or client views planetary positions, houses, sub-lords  

**Must display (Form view):**
- Name, date, time, place of birth inputs
- Geocoding (lat/lon from place name)
- Submit button → save to account

**Must display (Chart view):**
- Ascendant sign + degree
- All 12 houses with cusp degrees
- Planet positions (sign, nakshatra, sub-lord)
- KP sub-lord table (12 houses × sub-lord)
- Dasha running (current Mahadasha / Antardasha)
- Chart wheel (optional visual)

**Backend calls:**
- POST /kundali — save birth data, get kundali_id
- GET /kundali/:id/chart — full computed chart
- GET /kundali — list saved charts

**Worker routes:** ✅ All exist in worker/src/routes/kundali.ts + kundaliChart.ts  
**Status:** 🔴 "Failed to fetch" — URL mismatch or auth issue  

---

### 5. `/numerology` — Numerology Report 🔢

**Purpose:** Compute numerology profile from name + date of birth  
**User need:** Life path number, destiny number, soul urge, personality  

**Must display:**
- Name input (full birth name)
- Date of birth input
- System selector (Chaldean / Pythagorean)
- Results:
  - Life Path Number + meaning
  - Destiny Number + meaning
  - Soul Urge Number + meaning
  - Personality Number + meaning
  - Lucky numbers, lucky days
  - Compatibility overview

**Backend call:** GET /numerology?name=&dob=&system=  
**Worker route:** ✅ `handleGetNumerology` exists in worker/src/routes/numerology.ts  
**Status:** ⚠️ Unknown — not in "Failed to fetch" list, may work or may not be tested

---

### 6. `/festivals` — Parva Calendar 📅

**Purpose:** Hindu festival calendar with EN/HI support  
**User need:** Know upcoming festivals, share with family via WhatsApp  

**Must display:**
- Monthly calendar view or list view
- Filter chips (Shiva, Vishnu, Devi, General, etc.)
- Each festival: name (EN + HI), date, significance (1-2 lines)
- WhatsApp share button per festival
- Language toggle EN / हिं

**Backend call:** NONE — static data hardcoded in the page  
**Status:** ✅ Built Day 8 — should work, 40+ festivals loaded

---

### 7. `/query` — KP Query 🔍

**Purpose:** Natural language query about a saved Kundali  
**User need:** "Will I get a job this year?" → KP analysis of relevant houses  

**Must display:**
- Kundali selector (from saved charts)
- Query text input ("Will I get married in 2027?")
- Query type selector (career, marriage, health, property, etc.)
- Submit button
- Results:
  - KP verdict (Yes/No/Maybe)
  - Relevant houses and their lords
  - Running dasha context
  - Explanation in plain language

**Backend calls:**
- GET /kundali — list saved charts for selector
- POST /kp/query — structured KP query
- OR POST /kp/query-natural — natural language query

**Worker routes:** ✅ Both exist in worker/src/routes/kpQuery.ts + naturalQuery.ts  
**Status:** ⚠️ Unknown — need to verify Floot page is calling correct endpoint

---

## Backend Routes — Complete Map

| Route | Method | Handler | Status | Notes |
|-------|--------|---------|--------|-------|
| /auth/request-otp | POST | handleRequestOtp | ✅ | DEV_OTP_BYPASS=true, 000000 works |
| /auth/verify-otp | POST | handleVerifyOtp | ✅ | Returns session token |
| /kundali | POST | handleCreateKundali | ✅ | Requires auth |
| /kundali | GET | handleListKundalis | ✅ | Requires auth |
| /kundali/:id | GET | handleGetKundali | ✅ | Requires auth |
| /kundali/:id/chart | GET | handleGetKundaliChart | ✅ | Full KP computation |
| /kundali/:id | DELETE | handleDeleteKundali | ✅ | Requires auth |
| /muhurta/now | GET | handleMuhurtaNow | ✅ | Current muhurta score |
| /muhurta/scan | GET | handleMuhurtaScan | ✅ | Date range scan |
| /muhurta/professional | GET | handleMuhurtaProfessional | ✅ | Extended scoring |
| /numerology | GET | handleGetNumerology | ✅ | Name + DOB → report |
| /kp/chart/:id | GET | handleGetKpChart | ✅ | KP sub-lord chart |
| /kp/query | POST | handleKpQuery | ✅ | Structured query |
| /kp/query-natural | POST | handleNaturalQuery | ✅ | NL query |
| /kp/activities | GET | handleListActivities | ✅ | Activity list |
| /wallet/balance | GET | handleGetBalance | ✅ | Points balance |
| /wallet/recharge | POST | handlePostRecharge | ✅ | Razorpay order |
| /referral/code | GET | handleGetReferralCode | ✅ | Referral code |
| /admin/* | various | admin handlers | ✅ | Admin-only |
| /health | GET | inline | ✅ | No auth required |

**Backend verdict: 100% implemented. All routes exist and compile.**

---

## Root Cause of "Failed to fetch"

**NOT CORS** — `FRONTEND_ORIGIN = "*"` in wrangler.toml, wildcard allowed.

**Most likely causes (in order):**
1. Floot endpoints using wrong Worker URL (e.g., `occultviision.workers.dev` instead of `occultviision-api.workers.dev`)
2. Floot page calling endpoint path that doesn't match Worker route (e.g., `/api/kundali` vs `/kundali`)
3. Session token missing → 401 → Floot not handling auth redirect
4. Worker crash on startup (missing required env var like JWT_SIGNING_SECRET)

**To fix:** Read Floot files once build limit resets at 10:00 UTC (approx 90min)

---

## Theme Fix (Pending)

**base.css was updated** in this session:
- Old: `--bg: #070c28` (dark navy blue — user rejected)
- New: `--bg: #0a0710` (deep purple-black, no blue tones)
- Change is in Floot project but NOT yet published (build limit hit)
- Republish after 10:00 UTC

---

## Missing Features (Not Yet Built)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Login screen (OTP) | P0 | Medium | Built but untested |
| User dashboard / home | P0 | Low | Need design |
| Saved charts list | P1 | Low | Backend ready |
| Settings / Profile | P1 | Low | Not built |
| About / Help | P2 | Low | Not built |
| Offline support (PWA) | P2 | Medium | Partial (service worker) |
| Push notifications | P3 | High | Not built |

---

## Action Plan (Post Build Reset)

1. **Read** `pages/kundali.tsx` → find the fetch() call → fix URL/path
2. **Read** `pages/muhurta.tsx` → same investigation  
3. **Read** base.css in Floot → confirm theme update was saved
4. **Fix** API URL in whichever files have wrong endpoint
5. **Publish** all fixes in one batch commit
6. **Test** all 7 screens manually on live app
