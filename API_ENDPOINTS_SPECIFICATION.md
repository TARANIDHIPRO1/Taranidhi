# OCCULTVIISION KAALCHAKRA PRO — API ENDPOINT SPECIFICATIONS
## Contract Specification v1.0
**Status:** Final (Sep 29, 2026)  
**Owner:** Claude  
**Frontend Priority:** Pending Decision #3  
**Backend Status:** astro.ts ✓, kp.ts ✓, muhurta.ts 60%, horaScoring.ts 70%

---

## DESIGN PRINCIPLES

1. **Immutable Request/Response:** Once defined, contract does NOT change. Frontend + Backend both hold this.
2. **Precision First:** All degrees are float64 (±0.0001°). Seconds are integer (Unix timestamp + nanoseconds where needed).
3. **Validation on Backend:** Input validation is the backend's responsibility. Frontend trusts responses.
4. **Error Responses:** All 400/500 errors return `{ error: string, details?: object, code: string }`
5. **Timezone:** All times are in UTC+0 (ISO 8601). Frontend converts to user's timezone for display.

---

## ENDPOINT 1: `/api/v1/kundali` (Birth Chart)

**Purpose:** Return complete birth chart for given date/time/location  
**Method:** GET  
**Auth:** Optional (public endpoint, but preferably authed for analytics)

### Request Parameters

```typescript
interface KundaliRequest {
  // Birth details (ISO 8601 timestamps preferred, but also accept YY-MM-DD HH:MM:SS)
  date: string;              // "1973-04-08" or "1973-04-08T11:45:00Z"
  time: string;              // "11:45" or "11:45:30" (IST, unless timezone field below)
  timezone?: string;         // "UTC+5:30" or "Asia/Kolkata"; default: UTC+5:30 (IST)
  
  // Location (WGS-84 coordinates)
  latitude: number;          // 23.2505 (Bhopal)
  longitude: number;         // 77.4065
  
  // Calculation preferences
  ayanamsha?: "lahiri" | "kkp_new";  // default: "lahiri"
  house_system?: "placidus" | "porphyry";  // default: "placidus" (KP standard)
  
  // Optional: Precision/caching
  speed_category?: "fast" | "accurate";  // default: "accurate"
}
```

### Response

```typescript
interface KundaliResponse {
  success: true;
  
  birth_data: {
    timestamp_utc: number;  // Unix timestamp (milliseconds)
    date_isl: string;       // "1973-04-08" (ISO)
    time_isl: string;       // "11:45:30" (HH:MM:SS in IST)
    timezone: string;       // "UTC+5:30"
    location: {
      latitude: number;
      longitude: number;
      name?: string;        // "Bhopal" (optional geocoding)
    };
  };
  
  ayanamsha: {
    name: string;           // "Lahiri" | "KP New"
    value_degrees: number;  // 23.3757 (ayanamsha offset)
    year: number;           // 1973
  };
  
  ascendant: {
    sign: string;           // "Gemini"
    degree: number;         // 82.9708 (Lahiri)
    degree_sayana: number;  // 106.2465 (pre-ayanamsha)
    nakshatra: string;      // "Ardra"
    nakshatra_pada: number; // 1-4
    lord: string;           // Nakshatra lord (Mercury for Ardra)
    sub_lord: string;       // CSL sub-lord
  };
  
  house_cusps: {
    // Houses 1-12 (Placidus or Porphyry)
    cusps: [
      { house: 1, sign: string, degree: number, nakshatra: string, sub_lord: string },
      // ... houses 2-12
    ];
    system: string;  // "Placidus" | "Porphyry"
  };
  
  planets: [
    {
      name: string;         // "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
      sign: string;         // "Aries" - "Pisces"
      degree: number;       // 0-30 (within sign)
      full_degree: number;  // 0-360 (absolute zodiac position)
      nakshatra: string;    // "Ashwini" - "Revati"
      nakshatra_pada: number; // 1-4
      lord: string;         // Nakshatra lord
      sub_lord: string;     // CSL sub-lord (243-fold division)
      motion: string;       // "Direct" | "Retrograde"
      speed_dpm: number;    // Degrees per minute (for Rahu/Ketu, negative)
    }
  ];
  
  dasha: {
    current_maha_dasha: string;  // "Jupiter" (major planetary period)
    start_date: string;          // "1994-06-15" (ISO)
    end_date: string;            // "2010-06-15"
    years_remaining: number;     // 16.2
    
    current_antar_dasha: string; // "Saturn" (sub-period)
    sub_start: string;           // "2024-01-20"
    sub_end: string;             // "2025-03-15"
    
    timeline: [
      { dasha: string, start: string, end: string, duration_years: number }
      // Next 10 major dashas
    ];
  };
  
  tara: {
    // Birth star relative to query moment
    birth_nakshatra: string;     // "Ardra"
    query_nakshatra: string;     // "Uttara Phalguni" (for given time, if different)
    tara_type: string;           // "Sampath" | "Vipat" | "Kshema" | "Prarabdha" | "Sadhaka" | "Vadha" | "Mitra" | "Param_Mitra"
    stars_distance: number;      // 0-26 (star jump from birth to query)
    karma_vipak_classification: string; // "Neutral" (for Ardra per research)
  };
  
  ashtakavarga: {
    // SAV (Shadbala Ashtakavarga) for decision-making
    sun_av: number;        // 0-8
    moon_av: number;       // 0-8
    mars_av: number;       // 0-8
    mercury_av: number;    // 0-8
    jupiter_av: number;    // 0-8
    venus_av: number;      // 0-8
    saturn_av: number;     // 0-8
    total_av: number;      // 0-56
  };
  
  metadata: {
    calculation_engine: string;   // "astro.ts v1.0"
    precision_mode: string;       // "accurate" | "fast"
    computed_at: string;          // ISO 8601 timestamp of computation
  };
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;           // "Invalid date/time"
  details?: {
    field?: string;        // "latitude"
    message?: string;      // "Latitude must be between -90 and 90"
  };
  code: string;            // "INVALID_INPUT" | "CALCULATION_ERROR" | "LOCATION_ERROR"
}
```

### Examples

```bash
# Request
curl -X GET "https://api.occultviision.com/api/v1/kundali?date=1973-04-08&time=11:45&latitude=23.2505&longitude=77.4065&ayanamsha=lahiri"

# Response (simplified)
{
  "success": true,
  "birth_data": { ... },
  "ascendant": {
    "sign": "Gemini",
    "degree": 82.9708,
    "nakshatra": "Ardra",
    "sub_lord": "Venus"
  },
  "planets": [ ... ],
  "dasha": { ... }
}
```

---

## ENDPOINT 2: `/api/v1/muhurta` (Muhurta Dashboard + 6-Stage Filter)

**Purpose:** Return golden slots for an event (6-stage verification with MPI scoring)  
**Method:** POST  
**Auth:** Required (premium feature; returns MPI scores + predictions)

### Request Body

```typescript
interface MuhurtaRequest {
  // Event details
  event_id?: string;       // Internal ref (e.g., "PROPERTY_DEED_001")
  event_type: string;      // "Property Deed" | "Marriage" | "Business" | etc.
  event_category: string;  // "Property" | "Marriage" | "Business" | "Medical" | ...
  
  // Date range to query
  start_date: string;      // "2026-10-01" (ISO)
  end_date: string;        // "2026-10-31"
  duration_hours?: number; // Event duration (affects Hora check); default: 1
  
  // Birth chart (for personalized filter)
  birth_data: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  
  // Calculation preferences
  include_doshas?: boolean;     // default: true (check 21 doshas)
  doshas_tier?: "critical" | "full";  // "critical" = 3 only; "full" = all 21
  include_uphora?: boolean;     // default: true (check 2nd hour)
  include_tara?: boolean;       // default: true (personalized Tara)
  include_sv?: boolean;         // default: true (Ashtakavarga)
  
  // Output preferences
  max_slots?: number;      // default: 10 (return top N golden slots)
  include_details?: boolean;    // default: true (full 6-stage breakdown for each)
}
```

### Response

```typescript
interface MuhurtaResponse {
  success: true;
  
  event_info: {
    event_type: string;
    event_category: string;
    date_range: {
      start: string;
      end: string;
      days: number;
    };
  };
  
  query_birth_chart: {
    // Simplified birth chart (Ascendant, Moon for Tara)
    ascendant: { sign: string, degree: number, sub_lord: string };
    moon: { sign: string, degree: number, nakshatra: string };
  };
  
  golden_slots: [
    {
      slot_id: string;                    // "2026-10-16T14:30:00Z"
      date: string;                       // "2026-10-16" (ISO)
      time_start: string;                 // "14:30" (IST)
      time_end?: string;                  // "15:30" (if duration provided)
      
      // 6-Stage Verification Results
      stage_1_panchang_shudhi: {
        passed: boolean;
        tithi: string;                    // "Krishna Chaturthi"
        tithi_quality: string;             // "Favorable" | "Neutral" | "Unfavorable"
        vara: string;                      // "Thursday"
        nakshatra: string;                 // "Uttara Phalguni"
        yoga: string;                      // "Siddha"
        yoga_quality: string;              // "Excellent"
        karana: string;                    // "Balava"
      };
      
      stage_2_doshas: {
        passed: boolean;
        total_doshas_triggered: number;    // 0-21
        critical_doshas: [
          { name: "Panchaka", triggered: boolean, penalty_weight: 0.20 }
        ];
        all_doshas?: [
          { name: string, triggered: boolean, severity: "critical" | "major" | "minor", penalty_weight: number }
        ];
      };
      
      stage_3_personal_filter: {
        passed: boolean;
        tara: string;                      // "Sampath" | "Vipat" | ...
        tara_quality: string;              // "Favorable" | "Neutral" | "Unfavorable"
        tara_logic: string;                // "Birth nakshatra + event nakshatra = Sampath (7 stars distance)"
      };
      
      stage_4_ascendant_purity: {
        passed: boolean;
        csl_degree: number;                // 45.2345 (Cuspal Sub-Lord degree)
        csl_destructive_houses: boolean;   // true if CSL in 6, 8, 12
        csl_house: number;                 // House where CSL falls
        csl_quality: string;               // "Pure" | "Compromised"
      };
      
      stage_5_ashtakavarga: {
        passed: boolean;
        total_av: number;                  // 0-56
        av_quality: string;                // "Strong" | "Average" | "Weak"
        threshold_met: boolean;            // true if AV >= 28 (typical threshold)
      };
      
      stage_6_kp_sub_lord_veto: {
        passed: boolean;
        csl_sub_lord: string;              // Sub-sub-lord (nano-timing)
        ssl_degree: number;                // Degree of SSL
        ssl_window_seconds: number;        // 8-88 seconds
        ssl_quality: string;               // "Excellent" | "Good" | "Adequate"
      };
      
      // Comprehensive Scoring
      mpi_score: {
        overall: number;                   // 0-100 (Muhurta Power Index)
        breakdown: {
          csl_weight: number;              // 30% of score
          ssl_weight: number;              // 15%
          uphora_weight: number;           // 15%
          panchang_weight: number;         // 15%
          tara_weight: number;             // 10%
          sv_weight: number;               // 8%
          digbala_weight: number;          // 7%
        };
        confidence: string;                // "Very High" (>90) | "High" (70-90) | "Medium" (50-70) | "Low" (<50)
      };
      
      // Interpretation
      recommendation: {
        status: "PASS" | "CONDITIONAL" | "REJECT";
        reason: string;                    // Plain-English summary
        severity_blocked_by?: string[];    // ["Ganda Moola", "CSL in 6th"] if rejected
        approval_required?: boolean;       // true if CONDITIONAL (manual review needed)
      };
    }
    // ... remaining slots sorted by MPI score (descending)
  ];
  
  summary: {
    total_days_queried: number;
    total_slots_checked: number;          // 24+ per day (Hora-based)
    golden_slots_found: number;           // Count of PASS + CONDITIONAL
    best_slot_mpi: number;                // Highest MPI among results
    median_mpi: number;                   // 50th percentile
  };
  
  metadata: {
    calculation_engine: string;           // "muhurta.ts v1.0"
    doshas_included: number;              // 3 | 21
    computed_at: string;                  // ISO 8601
  };
}
```

### Error Response

```typescript
{
  "success": false,
  "error": "Invalid event type",
  "code": "INVALID_EVENT_TYPE"
}
```

---

## ENDPOINT 3: `/api/v1/events` (400 Event Categories + Search)

**Purpose:** Search 400 life events by category, return signification rules + optimal CSL requirements  
**Method:** GET  
**Auth:** Optional

### Request Parameters

```typescript
interface EventsRequest {
  // Search
  search?: string;           // Free-text search (e.g., "wedding")
  category?: string;         // "Property" | "Marriage" | "Business" | ...
  sub_category?: string;     // (optional) e.g., "Deed Registration" (under Property)
  
  // Filters
  bhavas?: number[];         // [7, 11] (search by signification houses)
  karakas?: string[];        // ["Venus", "Jupiter"] (search by Karaka planets)
  
  // Output
  limit?: number;            // default: 20
  offset?: number;           // default: 0 (pagination)
}
```

### Response

```typescript
interface EventsResponse {
  success: true;
  
  events: [
    {
      event_id: string;                   // "PROPERTY_DEED_001"
      event_name: string;                 // "Property Deed Registration"
      category: string;                   // "Property"
      sub_category?: string;
      
      signification: {
        primary_bhavas: number[];         // [2, 4, 7, 8] (Bhavas for property: 2=wealth, 4=property, 7=partner, 8=longevity)
        karakas: string[];                // ["Venus", "Mercury", "Saturn"]
        timing_lord: string;              // Major dasha lord to favor
        timing_sub_lord?: string;         // Antar dasha for best results
      };
      
      muhurta_requirements: {
        favorable_tithi: string[];        // ["Shukla Paksha"] (crescent moon period)
        favorable_vara: string[];         // ["Wednesday", "Friday"]
        favorable_nakshatra: string[];    // ["Rohini", "Hasta", "Uttara Phalguni"]
        unfavorable_yoga?: string[];      // ["Parivraya"]
        
        // KP System Requirements
        csl_house_requirement: string;    // "1st, 2nd, 4th, 10th, 11th (avoid 6,8,12)"
        csl_sub_lord: string;             // Ideal sub-lord (e.g., "Benefic planets")
        
        // Doshas to avoid
        critical_doshas: string[];        // ["Panchaka", "Mrityu Bana"]
        major_doshas: string[];           // ["Chandra Ashtam", "Ravi Ashtam"]
      };
      
      mpi_threshold: {
        minimum_mpi: number;              // e.g., 60 (recommended minimum)
        ideal_mpi: number;                // e.g., 75
        exceptional_mpi: number;          // e.g., 85+
      };
      
      description: string;                // Long-form explanation
      notes?: string;                     // Additional context (e.g., "Avoid during Sade Sati")
      
      reference_case?: {
        date: string;
        time: string;
        mpi_score: number;
        outcome: "Success" | "Partial" | "Failure" | "Unknown";
        notes?: string;
      };
    }
    // ... up to 400 events
  ];
  
  pagination: {
    total_count: number;                  // Total events matching filter
    limit: number;
    offset: number;
    has_more: boolean;
  };
  
  metadata: {
    search_engine: string;                // "events-db v1.0"
    categories_available: number;         // 9 (or 8 if reorganized)
    computed_at: string;
  };
}
```

---

## ENDPOINT 4: `/api/v1/doshas/:dosha_id` (Dosha Details)

**Purpose:** Return detailed penalty weight + veto rules for a single dosha  
**Method:** GET  
**Auth:** Optional

### Request

```typescript
// :dosha_id = "panchaka" | "ganda_moola" | "mrityu_bana" | ... (kebab-case)
```

### Response

```typescript
interface DoshaResponse {
  success: true;
  
  dosha: {
    id: string;                           // "panchaka"
    name: string;                         // "Panchaka"
    tier: "critical" | "major" | "minor"; // Critical = hard gate (reject); Major = penalty; Minor = note
    
    definition: string;                   // Classical Jyotish definition
    detection_rule: string;               // How muhurta.ts detects it (pseudocode or formula)
    
    penalty_weight: number;               // 0-1.0 (weight in MPI calculation)
    hard_gate?: boolean;                  // true = auto-reject slot (not just penalty)
    
    mitigation: {
      possible?: boolean;                 // true = can be overcome
      methods?: string[];                 // ["Jupiter association", "Ascendant purity", ...]
    };
    
    classical_reference: {
      source: string;                     // "Lagadha" | "Varahamihira" | "Modern Jyotish"
      citation: string;                   // Book/shloka reference
    };
  };
  
  examples: [
    {
      date: string;
      time: string;
      triggered: boolean;
      reason: string;
    }
  ];
}
```

---

## ENDPOINT 5: `/api/v1/user/preferences` (User Settings)

**Purpose:** Persist user preferences (birth chart, Tara type, doshas tier, etc.)  
**Method:** POST (save) / GET (retrieve)  
**Auth:** Required

### POST Request Body

```typescript
interface UserPreferencesRequest {
  user_id: string;                        // Unique identifier
  
  birth_chart: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
  };
  
  preferences: {
    ayanamsha: "lahiri" | "kkp_new";     // default: "lahiri"
    house_system: "placidus" | "porphyry";
    display_timezone: string;             // "Asia/Kolkata" (for frontend display)
    
    muhurta_settings: {
      doshas_tier: "critical" | "full";
      include_tara: boolean;
      include_uphora: boolean;
      mpi_threshold: number;              // Minimum acceptable MPI
    };
    
    language: "en" | "hi";                // (for v6.1)
    currency: string;                     // "INR" (for payment, v6.1)
  };
}
```

### GET Response

```typescript
interface UserPreferencesResponse {
  success: true;
  user_id: string;
  birth_chart: { ... };
  preferences: { ... };
  last_updated: string;                   // ISO 8601
}
```

---

## ENDPOINT 6: `/api/v1/admin/events` (Admin: Load 400 Events)

**Purpose:** Admin endpoint to bulk-load event database  
**Method:** POST  
**Auth:** Admin API key required

### Request Body

```typescript
interface AdminEventsLoadRequest {
  events: [
    {
      event_id: string;
      event_name: string;
      category: string;
      signification: { ... };
      muhurta_requirements: { ... };
      // ... full event object
    }
  ];
  
  action: "upsert" | "replace";           // upsert = merge; replace = overwrite all
}
```

---

## ENDPOINT 7: `/api/v1/health` (Health Check)

**Purpose:** Quick liveness probe for infrastructure  
**Method:** GET  
**Auth:** None

### Response

```typescript
{
  "status": "ok" | "degraded" | "error",
  "uptime_seconds": 12345,
  "services": {
    "astro_engine": "ok",
    "muhurta_engine": "ok",
    "events_database": "ok"
  },
  "timestamp": "2026-09-29T13:00:00Z"
}
```

---

## IMPLEMENTATION CHECKLIST (Backend)

### Phase 1: Core Endpoints (Week 1-2)
- [ ] POST `/api/v1/kundali` (birth chart calculation)
  - [ ] Input validation (date/time/location)
  - [ ] Call astro.ts for planet positions
  - [ ] Call kp.ts for CSL calculations
  - [ ] Format response per spec
  - [ ] Test with Naveen's chart: Lahiri Asc 82.9708°, KP Asc 82.8743°

- [ ] POST `/api/v1/muhurta` (6-stage filter + MPI)
  - [ ] Stage 1: Panchang validation (astro.ts)
  - [ ] Stage 2: Dosha detection (muhurta.ts)
  - [ ] Stage 3: Tara calculation (personalized)
  - [ ] Stage 4: CSL purity (kp.ts)
  - [ ] Stage 5: Ashtakavarga (horaScoring.ts)
  - [ ] Stage 6: Sub-lord veto (kp.ts SSL)
  - [ ] MPI aggregation (weights: 30-15-15-15-10-8-7)
  - [ ] Test with Property Deed case (Oct 16, 2026)

### Phase 2: Search & Events (Week 2-3)
- [ ] GET `/api/v1/events` (search 400 events)
  - [ ] Load event database (SQL)
  - [ ] Implement filters (category, bhavas, karakas)
  - [ ] Pagination (limit/offset)

- [ ] GET `/api/v1/doshas/:dosha_id` (single dosha)
  - [ ] Load dosha definitions
  - [ ] Return detection + penalty rules

### Phase 3: User Persistence (Week 3)
- [ ] POST/GET `/api/v1/user/preferences` (user settings)
  - [ ] Database schema (users table)
  - [ ] Auth check (JWT or session)

### Phase 4: Admin (Week 4)
- [ ] POST `/api/v1/admin/events` (bulk load)
- [ ] GET `/api/v1/health` (liveness)

---

## ERROR CODES (Standardized)

| Code | HTTP | Meaning |
|------|------|---------|
| INVALID_INPUT | 400 | Malformed request (missing field, bad type) |
| CALCULATION_ERROR | 500 | Backend computation failed |
| LOCATION_ERROR | 400 | Invalid coordinates |
| EVENT_NOT_FOUND | 404 | Event ID not in database |
| AUTH_REQUIRED | 401 | Missing or expired auth |
| RATE_LIMIT | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected backend error |

---

## PERFORMANCE TARGETS

| Endpoint | Target Latency | Notes |
|----------|-----------------|-------|
| `/kundali` (single chart) | 200ms | astro.ts + kp.ts cached |
| `/muhurta` (30-day range) | 5-10s | 720+ Hora slots checked |
| `/events` (search) | 50ms | SQL index on category |
| `/doshas/:id` | 10ms | Cached definitions |
| `/health` | <10ms | No DB query |

---

## AUTHENTICATION (v6 MVP)

**Option 1 (Simple):** No auth required (public endpoints)  
**Option 2 (Recommended for Hospital B2B):** API key in header  
```
Authorization: Bearer {api_key}
```

**Option 3 (v6.1):** JWT (if user registration enabled)

---

## VERSIONING

- Current: `v1` (stable, locked for v6 MVP)
- Future: `v2` (after v6 feedback + v7 planning)
- Breaking changes: New major version only
- Deprecation window: 6 months

---

**Next Steps:**
1. Backend team implements Phase 1 endpoints (Week 1-2)
2. Frontend integrates via this contract (no changes to frontend spec)
3. Testing: Property deed case + 10 edge cases (Week 4)
4. Deployment: Staging first, then production

