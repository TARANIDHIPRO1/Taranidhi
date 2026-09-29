# JIRA TICKET TEMPLATES — KAALCHAKRA PRO v6 MVP
## Sprint Planning Structure (Oct 1-31, 2026)
**Status:** Ready for import (Sep 29, 2026)  
**Format:** Markdown → Bulk import via JIRA CSV/API  
**Total Tickets:** 50-60 (depends on Decision #2)

---

## TEMPLATE 1: BACKEND MODULE TASK

```
Title: Implement {MODULE_NAME} ({FEATURE})

Description:
Implement {MODULE_NAME} to handle {FEATURE}.

Requirements:
- {REQUIREMENT_1}
- {REQUIREMENT_2}
- {REQUIREMENT_3}

Acceptance Criteria:
✓ {CRITERION_1}
✓ {CRITERION_2}
✓ Unit tests pass (95% coverage min)
✓ No TypeScript errors
✓ Code review approved

Technical Notes:
- File: src/{module_path}.ts
- Related: {related_ticket_ids}
- Reference: {research_file_reference}

Estimated Hours: {4-8h based on complexity}
Dependencies: {ticket_ids if any}
```

### Sample Backend Tickets (Week 1-2)

**Ticket 1: Backend - Implement `/api/v1/kundali` Endpoint**
```
Title: Implement Birth Chart API Endpoint (/api/v1/kundali)

Description:
Create REST endpoint to return complete birth chart (ascendant, planets, houses, dasha).

Requirements:
- Accept date, time, latitude, longitude as query params
- Call astro.ts for planet calculations
- Call kp.ts for CSL sub-lord calculations
- Return JSON matching API_ENDPOINTS_SPECIFICATION.md

Acceptance Criteria:
✓ GET /api/v1/kundali?date=1973-04-08&time=11:45&latitude=23.25&longitude=77.41 returns 200 OK
✓ Response matches Naveen's chart: Lahiri Asc 82.9708°, KP Asc 82.8743°
✓ Latency <200ms (cached)
✓ All 9 planets returned with sign, degree, nakshatra, CSL
✓ Input validation rejects invalid dates/coords
✓ Error handling returns 400/500 with standardized error code

Technical Notes:
- Use Express.js route handler
- Add Redis caching (TTL: 24h per user_id)
- astro.ts is 100% complete; kp.ts is 100%
- Test with onlinejyotish.com reference (22/22 sub-lords match)

Estimated Hours: 6
Dependencies: Backend framework setup (Ticket X)
```

**Ticket 2: Backend - Implement `/api/v1/muhurta` Endpoint (6-Stage Filter)**
```
Title: Implement Muhurta Endpoint with 6-Stage Verification

Description:
Implement POST /api/v1/muhurta to calculate golden slots for events.

Requirements:
- Accept event_type, date_range (start-end), birth_data as JSON body
- Run 6-stage filter (Panchang → Doshas → Tara → CSL → SAV → SSL)
- Calculate MPI score (weights: 0.30-0.15-0.15-0.15-0.10-0.08-0.07)
- Return top 10 golden slots sorted by MPI

6-Stage Filter:
Stage 1 (Panchang): tithi, vara, nakshatra, yoga, karana → passed: boolean
Stage 2 (Doshas): Check 3 or 21 doshas → penalty_weight if triggered
Stage 3 (Tara): Calculate birth tara vs event tara → tara_type (Sampath/Vipat/etc.)
Stage 4 (CSL): Verify CSL not in 6/8/12 houses → csl_quality
Stage 5 (SAV): Ashtakavarga score → av_quality
Stage 6 (SSL): Sub-lord veto window (8-88 seconds) → ssl_quality

Acceptance Criteria:
✓ POST /api/v1/muhurta with 30-day range returns <10s latency
✓ Property Deed case (Oct 16, 2026): Best MPI ≥75% (referenced case: 81%)
✓ Doshas tier = "critical" = 3 only; "full" = 21
✓ MPI score range: 0-100
✓ Returns exactly 6 stages per slot (no missing data)
✓ PASS/CONDITIONAL/REJECT status correct per stage 2 hard gates

Technical Notes:
- muhurta.ts is 60% complete (Stage 1-3 done)
- horaScoring.ts is 70% complete (Stage 4-5 need integration)
- kp.ts has SSL calculation (Stage 6)
- Use Hora calculation to iterate 24+ slots per day
- Backend: ~720 checks per 30-day range (5-10s computation)

Estimated Hours: 8
Dependencies: astro.ts ✓, kp.ts ✓, muhurta.ts finalization
```

---

## TEMPLATE 2: FRONTEND SCREEN TASK

```
Title: Build {SCREEN_NAME} React Component

Description:
Create React component for {SCREEN_NAME} using shadcn/ui + Tailwind.

Requirements:
- Use TypeScript (no `any` types)
- Call {API_ENDPOINT} and display results
- Responsive (mobile 320px → desktop 1920px)
- WCAG 2.1 AA accessibility
- Light + dark mode support

Acceptance Criteria:
✓ Component renders without errors
✓ API call made and data displayed
✓ Mobile responsive tested (width: 320px, 768px, 1024px, 1920px)
✓ All interactions working (hover, click, keyboard)
✓ Accessibility: ARIA labels, keyboard nav, color contrast 4.5:1
✓ Performance: <3.5s TTI, <0.1 CLS
✓ TypeScript: 0 errors

Technical Notes:
- Reference: FRONTEND_WIREFRAMES_SPECIFICATION.md
- State: React Context API (or Zustand if needed)
- Styling: Tailwind CSS + shadcn/ui components
- Charts: Recharts or D3.js
- Testing: React Testing Library (unit tests)

Estimated Hours: {6-12h depending on complexity}
Dependencies: {API endpoint must be ready}
```

### Sample Frontend Tickets (Week 1-3, depends on Decision #3)

**Ticket 3: Frontend - Build Birth Chart Screen (React Component)**
```
Title: Build Birth Chart Display Screen (React)

Description:
Create React component to display user's natal chart with 12-house circle, planets, nakshatras.

Requirements:
- Call GET /api/v1/kundali (cached, 200ms)
- Display 12-house SVG circle with planets + house cusps
- Show planet table: Sign, Degree, Nakshatra, CSL, Sub-Lord
- Show current dasha timeline
- Show personalized Tara classification
- Print-friendly PDF output

Acceptance Criteria:
✓ Birth chart renders for Naveen's chart (Apr 8, 1973, 11:45 IST, Bhopal)
✓ SVG circle shows: 12 houses, planet glyphs (☀ ☾ ♂ ♀ ♃ ♄ ☊ ☋), nakshatras
✓ Planet table accurate to 0.0001° (Lahiri: 82.9708° shown as "82.9708°")
✓ House cusps table: 12 rows, all 12 houses
✓ Dasha timeline: Current Maha + Antar, years remaining
✓ Tara: Birth nakshatra + classification (Neutral for Ardra per research)
✓ Toggle Ayanamsha: Switch Lahiri ↔ KP New (82.8743°)
✓ Print button: Generates PDF (no interactive elements)
✓ Mobile responsive: Stacks chart + tables vertically at 768px
✓ Keyboard nav: Tab through all interactive elements
✓ Color contrast: Text on background ≥4.5:1
✓ <3.5s TTI, <0.1 CLS

Technical Notes:
- Use React + TypeScript
- SVG chart: React component or Recharts
- State: User birth chart from Context (user_id passed via URL)
- API call: const chart = await fetch(`/api/v1/kundali?...`)
- Reference: FRONTEND_WIREFRAMES_SPECIFICATION.md → Screen 1
- Test: Compare rendered output vs onlinejyotish.com

Estimated Hours: 10
Dependencies: 
  - Backend /api/v1/kundali endpoint ready
  - React setup + TypeScript configured
  - shadcn/ui components installed
```

**Ticket 4: Frontend - Build Muhurta Dashboard Screen (React Component)**
```
Title: Build Muhurta Dashboard with 6-Stage Golden Slots

Description:
Create React component for muhurta finder with real-time slot calculation.

Requirements:
- Event type dropdown: call GET /api/v1/events
- Date range picker: max 30 days
- Doshas toggle: 3 critical ↔ all 21
- Real-time progress bar (while backend computes 5-10s)
- Display golden slots sorted by MPI (top 10)
- Each slot shows: 6 stages, MPI score, PASS/CONDITIONAL/REJECT status

Acceptance Criteria:
✓ Event dropdown populated from /api/v1/events
✓ Date range picker: max 30 days enforced
✓ POST /api/v1/muhurta called with correct params
✓ Progress bar: updates % as backend calculates (5-10s latency)
✓ Golden slots displayed: 5+ slots returned for property deed
✓ MPI score visualized (color: Green 75+, Yellow 50-75, Red <50)
✓ 6 stages expandable: click slot card to show all 6 stages
✓ Oct 16, 2026 property deed case: best MPI ≥75%
✓ Mobile responsive: filters collapsible at 768px
✓ <3.5s TTI, <0.1 CLS
✓ Keyboard accessible: Tab, Enter, Esc work

Technical Notes:
- Use React + TypeScript
- State: useContext for user birth chart, useState for query
- API: POST /api/v1/muhurta with event_type, date_range, birth_data
- Progress: WebSocket or polling (check status until complete)
- UI: shadcn/ui Card, Button, Tabs, Progress bar
- Reference: FRONTEND_WIREFRAMES_SPECIFICATION.md → Screen 2
- Test property deed case: Oct 16 2:30 PM IST should show ~81% MPI

Estimated Hours: 12
Dependencies:
  - Backend /api/v1/muhurta endpoint ready
  - Backend /api/v1/events endpoint ready
  - React setup complete
```

---

## TEMPLATE 3: DATABASE TASK

```
Title: Create {TABLE_NAME} Table Schema

Description:
Create database table {TABLE_NAME} with specified columns and indexes.

Requirements:
- Create table with {N} columns
- Add {N} indexes for query optimization
- Create foreign keys to {RELATED_TABLES}
- Add audit columns (created_at, updated_at)

Acceptance Criteria:
✓ Table created in development database
✓ All columns with correct types (INT, VARCHAR, DECIMAL, etc.)
✓ Indexes created and query plan optimized
✓ Foreign keys reference existing tables
✓ Sample data inserted (if applicable)
✓ Migrations tracked in version control

Technical Notes:
- Reference: DATABASE_SCHEMA_DESIGN.md
- ORM: Sequelize or TypeORM (if used)
- Migrations: Knex.js or Sequelize migrations

Estimated Hours: 2-3
```

### Sample Database Tickets (Week 1)

**Ticket 5: Database - Create `events` Table (400 Events)**
```
Title: Create events Table and Load 400 Events

Description:
Create events table with 400 events (from research files).

Requirements:
- 400 rows: event_id, event_name, category, karakas, muhurta_requirements
- Indexes: idx_category, idx_event_id, idx_search (FULLTEXT)
- Reference: DATABASE_SCHEMA_DESIGN.md → TABLE 2

Acceptance Criteria:
✓ CREATE TABLE events executed
✓ 400 rows loaded (9 categories: Property, Marriage, Business, etc.)
✓ Primary key: event_id (unique)
✓ Indexes created: category, event_id, FULLTEXT(event_name, description)
✓ Foreign key ready for event_dosha_rules junction
✓ SELECT * FROM events LIMIT 1 returns correct columns

Technical Notes:
- Load from staged_events_v1 (CSV/JSON)
- Insert via: INSERT INTO events ... SELECT * FROM staged_events_v1
- 9 categories: Property (55), Marriage (45), Business (65), Medical (35), IT/Tech (45), Government (40), HR (40), Travel (40), Education (35) = 400 total

Estimated Hours: 3
```

---

## TEMPLATE 4: TESTING TASK

```
Title: Write & Run Tests for {FEATURE}

Description:
Write unit tests + integration tests for {FEATURE}.

Requirements:
- Test happy path: {TEST_1}
- Test edge case: {TEST_2}
- Test error handling: {TEST_3}
- Target: 95% code coverage

Acceptance Criteria:
✓ All tests pass (npm test)
✓ Coverage: ≥95% for {MODULE}
✓ No linting errors (eslint)
✓ No TypeScript errors

Technical Notes:
- Test framework: Jest + React Testing Library
- Reference: TEST_CASE_DESIGN.md (if created)
- Test user: Naveen's chart (Apr 8, 1973, 11:45 IST)

Estimated Hours: {4-6h}
```

### Sample Testing Tickets (Week 4)

**Ticket 6: Testing - Test Property Deed Case (Oct 16, 2026, MPI ≥75%)**
```
Title: Test Property Deed Muhurta Case (Oct 16, 2026)

Description:
Test muhurta calculation against known property deed case.

Requirements:
- Case: Oct 16, 2026, 2:30 PM IST, Property Deed
- Expected: MPI ≥75% (reference: 81%)
- Verify: All 6 stages pass, Tara = Sampath, CSL = 1st House

Acceptance Criteria:
✓ POST /api/v1/muhurta with Oct 16, 2:30 PM returns MPI ≥75%
✓ Stage 1 (Panchang): Tithi + Vara + Nakshatra + Yoga all pass
✓ Stage 2 (Doshas): Panchaka & Ganda Moola both NOT triggered
✓ Stage 3 (Tara): Sampath classification (7 stars)
✓ Stage 4 (CSL): CSL in 1st house (not 6/8/12)
✓ Stage 5 (SAV): AV ≥28
✓ Stage 6 (SSL): Sub-lord Venus (benefic)
✓ Final status: ✅ PASS

Technical Notes:
- Reference data from COMPLETE_DEEP_EXTRACTION_FILES_1-16.md
- Case study: Oct 16, 2026, 2:30 PM IST, Bhopal, Property Deed
- Buyer A: PASS 81% MPI (matches expected)
- Buyer B: REJECT Vadha Tara (control group)

Estimated Hours: 4
Dependencies: Backend /api/v1/muhurta fully implemented
```

---

## TICKET BREAKDOWN BY WEEK

### Week 1 (Oct 1-7): Foundation Backend
- Tickets 1-2: API endpoints (/kundali, /muhurta)
- Tickets 5: Database table setup
- Estimate: 15-20 hours

### Week 2 (Oct 8-14): Events + Remaining Backend
- Tickets: /events, /doshas endpoints
- Tickets: Load 400 events into DB
- Estimate: 12-15 hours

### Week 3 (Oct 15-21): Frontend Screens (Depends on Decision #3)
- Tickets 3-4: Frontend screens (priority TBD)
- Estimate: 16-24 hours (two of three screens)

### Week 4 (Oct 22-31): Testing + Deployment
- Tickets 6: Integration testing
- Tickets: Admin endpoints + health check
- Estimate: 12-15 hours

**Total: 55-74 hours (Fits in 4-week MVP window)**

---

## TICKET IMPORT (Bulk)

### Via CSV:
```
Summary,Description,Issue Type,Priority,Estimate (hours),Component
"Implement /api/v1/kundali Endpoint","Create REST endpoint...",Task,High,6,"Backend"
"Create events Table","Load 400 events...",Task,High,3,"Database"
...
```

### Via JIRA API:
```bash
curl -X POST https://jira.occultviision.com/rest/api/3/issue/bulk \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @tickets.json
```

---

**Next:** Refine tickets based on Naveen's questionnaire answers (architecture decisions will adjust hour estimates).

