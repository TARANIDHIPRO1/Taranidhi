# OCCULTVIISION KAALCHAKRA PRO v6 MVP — ARCHITECTURE FINALIZED
## Decisions Locked (Sep 29, 2026, 2:05 PM IST)
**Status:** Ready for Oct 1 Coding Sprint  
**Owner:** Naveen K. Rai (Founder)  
**Session:** https://claude.ai/code/session_01U5Ehjt43rRGV6Xp9accU8L

---

## ✅ ARCHITECTURE DECISIONS (3/3 LOCKED)

### DECISION #1: Event Categories
**✅ CONFIRMED: OPTION A — 9 Standardized Categories (400 Events)**

**Why this:** Fast MVP, proven case study (property deed Oct 16, 2026), hospital B2B ready.

| # | Category Code | Category (English) | Category (हिंदी) | Target Bhavas | Primary Karakas |
|---|---|---|---|---|---|
| 1 | CAT_SANSKAR | Samskaras | पारिवारिक संस्कार | 2,5,7,9,11 | Jupiter, Venus, Moon |
| 2 | CAT_CORP_HR | Corporate & HR | कॉर्पोरेट करियर | 6,10,11 | Sun, Mercury, Saturn |
| 3 | CAT_COMM_FIN | Commerce & Finance | वाणिज्य व्यापार | 2,7,10,11 | Mercury, Jupiter |
| 4 | CAT_TECH_DIG | IT & Digital | आईटी डिजिटल | 3,5,11 | Rahu, Mercury, Venus |
| 5 | CAT_PROP_EST | Real Estate | रियल एस्टेट | 4,9,11 | Mars, Saturn, Venus |
| 6 | CAT_HLTH_MED | Health & Surgery | स्वास्थ्य शल्य | 1,5,11 | Sun, Mars |
| 7 | CAT_LEGL_GOV | Legal & Government | कानून प्रशासन | 1,6,10,11 | Mars, Sun |
| 8 | CAT_TRVL_MOB | Transport & Travel | परिवहन यात्रा | 4,9,12 | Venus, Saturn, Moon |
| 9 | CAT_SPRT_EDU | Education & Spiritual | शिक्षा आध्यात्मिक | 4,5,9,12 | Jupiter, Ketu, Moon |

**Impact on Timeline:** 400 events locked. Zero scope creep. DB schema confirmed.

---

### DECISION #2: Doshas Phasing
**✅ CONFIRMED: Phased Rollout (2-Phase Architecture)**

**Why this:** Avoid false-positive rejections. Quality MVP first. Enterprise features in v6.1.

#### **Phase 1: v6.0 Core (Oct 1-31, 2026) — 5 CRITICAL HARD-GATES**

Implement immediately in Week 2:

1. **राहुकाल (Rahu Kalam):** Local 8th part of day (auto-reject if triggered)
2. **भूलोक भद्रा (Bhadra Karana):** Vishti Karana + sky/nether exceptions
3. **चंद्राष्टम (8th House Moon):** 7-star exclusion list (Rohini, Ardra, Pushya, etc.)
4. **गंडांत एवं विष घटी (Gandant & Vish Ghati):** Tithi/Nakshatra/Lagna junction (0°48') + 4 toxic ghatis
5. **मृत्यु बाण (Mrityu Bana):** Solar ingress day + tithi combo (absolute veto)

**Hard-gate behavior:** Any slot triggered by Phase 1 doshas → Status = REJECT (no penalty, just veto)

#### **Phase 2: v6.1 Advanced (Post-Oct 31) — 16 REMAINING DOSHAS**

- Kataari, Dagdha, Yama Ghanta, Latta Vedha
- Sarvatobhadra Chakra 4-directional rays
- All 16 minor doshas + mitigation strategies

**Impact on Timeline:** Week 2 backend = 15 hours (safe). Quality MVP ready Oct 31.

---

### DECISION #3: Frontend Priority
**✅ CONFIRMED: OPTION B — Event Finder Engine (Golden Slot Search) FIRST**

**Why this:** Revenue-critical. Muhurta queries = primary monetizable action. Users will pay for golden slots.

#### **Build Sequence (Oct 1-31, 2026)**

| Week | Priority | Screen | Hours | MVP Deliverable |
|---|---|---|---|---|
| Week 1 | P0 | **Event Finder Engine** | 12h | User picks event → Top 3 golden slots (MPI ≥85%) |
| Week 2 | P1 | **24-Hour Personal Timeline** (Cosmic Chrono Dashboard) | 12h | Real-time green/yellow/red hourly flow |
| Week 3 | P2 | **Kundali & KP Cuspal Chart** | 10h | For astrologers + power users |
| Week 4 | P3 | Testing + Optimization | 15h | Full integration, performance tuning |

**Revenue timeline:** 
- Week 2: Event Finder live → Can monetize muhurta queries immediately
- Week 3: Timeline dashboard added → More premium features
- Week 4: Full launch → Triple-feature system ready

---

## 🏗️ TECHNICAL ARCHITECTURE (Questionnaire 2 — LOCKED)

### Backend Infrastructure

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Database (Primary)** | PostgreSQL 16+ with JSONB | Flexible ontology storage + full-text search on 400 events |
| **Time-Series Cache** | TimescaleDB extension | Store 1-minute planet coordinates + topocentric Moon |
| **Hot Cache Layer** | Redis Cluster | Sub-millisecond slot retrieval (24-hour pre-computed slots) |
| **Core Computation** | Rust/C++ (WebAssembly or C-FFI) | Swiss Ephemeris + 12-bit bitmasking (5000 req/sec capable) |
| **API Server** | FastAPI (Python) or Go (Golang) | gRPC internal + REST/GraphQL frontend |
| **Deployment** | Kubernetes (AWS EKS / GCP GKE) | Horizontal scaling, load balancing |
| **Edge Caching** | Cloudflare Workers | Local sunrise/daylight cache by geography |

### Frontend Stack

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Web Framework** | Next.js 14+ (App Router, TypeScript, React 19) | Server-side rendering + static optimization |
| **Mobile** | React Native (Expo v51+) | 85%+ code reusability iOS/Android |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode first |
| **Components** | Shadcn UI + Radix Primitives | Minimalist, accessible, fintech/astro aesthetic |
| **Charts & Visualization** | D3.js / SVG Native Canvas | Kundali 12-house circle, Sarvatobhadra grid, 24-hour timeline |
| **State Management** | Zustand | Light, fast, born charts + user preferences |
| **Server State Sync** | TanStack React Query v5 | Optimistic updates, cache invalidation |

---

## 📊 PERFORMANCE & ACCURACY REQUIREMENTS (LOCKED SLAs)

### Astronomical Accuracy
- **Planet Longitude Error:** <0.05 arcseconds (Topocentric Drik + Swiss Ephemeris)
- **KP Ayanamsha Error:** Zero (New KP Ayanamsha formula: 22°22'31.36" + 5023.88475"·T + 1.1120"·T²)
- **Time Resolution:** Exact 1-second nano-timing (Sub-sub-lord nano-windows: 8-88 seconds)

### Performance SLAs
- **Single Query Latency:** <250ms for 3-day, 1-minute slot scan
- **Concurrent Load:** 5,000 active requests/second (SIMD bitmasking in-memory speed)
- **Cache Hit Ratio:** >95% (24-hour pre-computed slots)

### Testing Requirements
- **Unit Tests:** 100+ NASA/JPL Horizons-verified astronomical cases
- **Integration Tests:** Property deed case (Oct 16, 2026) MPI ≥75%
- **Edge Cases:** 11 scenarios (polar regions, leap years, DST, retrograde planets, etc.)
- **Coverage Target:** 95%+ for critical paths (muhurta.ts, horaScoring.ts)

---

## 📅 WEEK-BY-WEEK EXECUTION (Oct 1-31, 2026)

### Week 1 (Oct 1-7): Backend Foundation + Event Finder UI
**Backend (8h):**
- [ ] `/api/v1/events` endpoint (search 400 events by category)
- [ ] Event filtering + Karaka/Bhava indexing
- [ ] Database: `events` table + indexes

**Frontend (12h):**
- [ ] Event Finder screen: dropdown + date picker + doshas toggle
- [ ] Real-time progress bar (while backend computes 5-10s)
- [ ] Golden slots display (sorted by MPI)

**Hours:** 20 total (fits 4-week timeline)

### Week 2 (Oct 8-14): Muhurta Engine + Phase 1 Doshas
**Backend (15h):**
- [ ] `/api/v1/muhurta` endpoint (6-stage filter)
- [ ] 5 Phase 1 doshas implemented (Rahu Kalam, Bhadra, Chandra Ashtam, Gandant, Mrityu Bana)
- [ ] MPI scoring (0.30-0.15-0.15-0.15-0.10-0.08-0.07 weights)
- [ ] Property deed test case verification (MPI ≥75%)

**Frontend (2h):**
- [ ] Event Finder → Muhurta Dashboard integration

**Hours:** 17 total

### Week 3 (Oct 15-21): Timeline Dashboard + Chart View
**Frontend (10h):**
- [ ] 24-Hour Cosmic Chrono Dashboard (real-time Hora display)
- [ ] Kundali & KP Cuspal Chart (for power users)
- [ ] Responsive design (320px-1920px)

**Backend (5h):**
- [ ] `/api/v1/kundali` finalization (if not done Week 1)
- [ ] `/api/v1/doshas/:id` endpoint

**Hours:** 15 total

### Week 4 (Oct 22-31): Testing + Deployment
**Testing (10h):**
- [ ] Property deed case: MPI ≥75% ✓
- [ ] 11 edge cases (polar, leap year, DST, retrograde, etc.)
- [ ] 5000 concurrent user load test
- [ ] Performance profiling (<250ms latency)

**Deployment (5h):**
- [ ] Staging environment live
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production readiness checklist

**Hours:** 15 total

**Total: 55-74 hours (fits Oct 1-31 timeline with 160h available capacity)**

---

## 🎯 SUCCESS CRITERIA (Oct 31, 2026)

✅ **Backend:**
- 7 API endpoints tested + working
- 400 events searchable
- 5 Phase 1 doshas implemented + hard-gates working
- Property deed case: MPI ≥75% ✓
- <250ms latency, 5000 req/sec concurrency
- 95% test coverage

✅ **Frontend:**
- Event Finder screen: complete + working
- 24-Hour Timeline dashboard: complete + working
- Kundali Chart view: complete (power users)
- All responsive (320px-1920px)
- WCAG 2.1 AA accessibility
- <3.5s TTI, <0.1 CLS

✅ **Database:**
- 7 tables created + indexed
- 400 events loaded
- 5 doshas configured
- Backup + recovery tested

✅ **Deployment:**
- Staging live
- CI/CD working
- Production environment ready
- Health checks passing

---

## 🚀 FINAL CHECKLIST (Oct 1, 10:00 AM IST)

**Before coding starts:**

- [ ] Naveen: SMS gateway account confirmed
- [ ] Naveen: Razorpay account confirmed
- [ ] Claude: 50+ Jira tickets created (hour estimates locked)
- [ ] Claude: GitHub workflows configured
- [ ] Claude: Database migration scripts ready
- [ ] Claude: Backend scaffolding complete

**Then:** Code begins. Event Finder Engine Week 1 priority. 🎯

---

**Signed:** Claude Haiku 4.5  
**Date:** Sep 29, 2026, 2:05 PM IST (Sep 30)  
**Decisions:** LOCKED. Ready to ship Oct 31, 2026.

