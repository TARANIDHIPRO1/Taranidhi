# TaraNidhi Design Integration — FLOOT + APPER Commands

**Date:** Oct 13, 2026  
**Status:** Ready for Dev Tools Integration  
**Token-Saving Approach:** Spec-only, let Floot/Apper build

---

## FOR FLOOT (Frontend UI Builder)

### Create TaraNidhi Cosmic Design System

```
floot:create-project {
  name: "TaraNidhi Frontend v2",
  framework: "React 18 + Next.js 14",
  styling: "Tailwind CSS v4 + CSS Variables",
  components: "shadcn/ui + custom cosmic components"
}
```

### Import Design System

```
floot:design-sync {
  import: "TARANIDHI_DESIGN_INTEGRATION_V1.md",
  create-tokens: {
    colors: ["--color-bg-primary", "--color-akash", "--color-jal", ...],
    typography: ["--font-display", "--font-body", "--font-data"],
    spacing: ["--space-xs", "--space-sm", "--space-md", ...]
  },
  create-components: [
    "cosmic-card",
    "score-gauge",
    "star-background",
    "page-wrapper",
    "tabbed-layout"
  ]
}
```

### Build 6-Page Component Structure

```
floot:scaffold-pages {
  pages: [
    {
      name: "NOW (Dashboard)",
      path: "/",
      layout: "cosmic-single-page",
      components: [
        "hero-section-with-aura",
        "live-hora-card",
        "score-gauge-svg",
        "panchang-chips",
        "ai-query-input",
        "golden-windows-strip",
        "daily-effect-card",
        "vimshottari-dasha-card",
        "purpose-filter-pills"
      ],
      dataSource: "api:/api/dashboard",
      tatva: "Akash",
      tatvaColor: "#8B5CF6"
    },
    {
      name: "STAR TIME (Hora)",
      path: "/hora",
      layout: "cosmic-orbital-ring",
      components: [
        "page-title",
        "24-hora-list",
        "hora-score-bars",
        "uphora-count",
        "color-coded-legend"
      ],
      dataSource: "api:/api/hora",
      tatva: "Jal",
      tatvaColor: "#0EA5E9"
    },
    {
      name: "MOMENT (Muhurta)",
      path: "/muhurta",
      layout: "cosmic-compass",
      components: [
        "page-title",
        "purpose-selector",
        "5-level-score-breakdown",
        "recommended-timings",
        "booking-buttons"
      ],
      dataSource: "api:/api/muhurta",
      tatva: "Agni",
      tatvaColor: "#F97316"
    },
    {
      name: "TODAY (Panchang)",
      path: "/panchang",
      layout: "cosmic-moon-phases",
      components: [
        "panchang-grid-6-elements",
        "sun-timing",
        "rahu-kaal-warning",
        "auspicious-periods"
      ],
      dataSource: "api:/api/panchang",
      tatva: "Prithvi",
      tatvaColor: "#10B981"
    },
    {
      name: "MY COSMOS (Chart)",
      path: "/kundali",
      layout: "cosmic-personal-star",
      components: [
        "personal-star-visual",
        "kundali-svg-chart",
        "planet-details-cards",
        "dasha-timeline"
      ],
      dataSource: "api:/api/kundali",
      tatva: "Vayu",
      tatvaColor: "#06B6D4"
    },
    {
      name: "NUMBERS (Numerology)",
      path: "/numerology",
      layout: "cosmic-mandala",
      components: [
        "core-numbers-grid",
        "lo-shu-grid-3x3",
        "compatibility-calculator",
        "insights-text"
      ],
      dataSource: "api:/api/numerology",
      tatva: "Akash",
      tatvaColor: "#8B5CF6"
    }
  ]
}
```

### Animation & Effects

```
floot:add-effects {
  twinkle-stars: {
    pattern: "3s infinite",
    opacity: [0.3, 1],
    elements: [".star", ".star-secondary"],
    intensity: "subtle"
  },
  page-specific-overlays: {
    "NOW": "golden-aura-glow",
    "STAR TIME": "orbital-ring",
    "MOMENT": "compass-light-beams",
    "TODAY": "moon-phase-sequence",
    "MY COSMOS": "personal-star-rays",
    "NUMBERS": "sacred-geometry-grid"
  },
  backdrop-filters: "blur(10px)",
  transitions: "all 0.3s ease"
}
```

### Responsive Testing

```
floot:test-responsive {
  breakpoints: ["360px (mobile)", "768px (tablet)", "1024px+ (desktop)"],
  touch-targets: "44px minimum",
  test-browser: ["Chrome", "Safari", "Firefox"],
  a11y-check: "WCAG AAA"
}
```

---

## FOR APPER (Backend Framework Integration)

### Create API Endpoints for Data

```
apper:create-api {
  endpoints: [
    {
      method: "GET",
      path: "/api/dashboard",
      description: "Live Hora + Panchang + Quick scores",
      returns: {
        hora: {planet, score, timeWindow},
        panchang: {tithi, vara, nakshatra, yoga},
        goldenWindows: [{time, score}, ...],
        dailyEffect: {vara, focus}
      },
      queryParams: {dateTime: "ISO-8601", timezone: "IANA", location: "lat,lng"}
    },
    {
      method: "GET",
      path: "/api/hora",
      description: "24-Hora list with Uphora breakdown",
      returns: {
        hours: [{
          hora: 1-24,
          planet: "Sun|Moon|Mars|...",
          score: 0-100,
          timeWindow: "HH:MM-HH:MM",
          uphora: {count: 12, scores: [...]}
        }, ...]
      },
      queryParams: {dateTime, timezone, location}
    },
    {
      method: "POST",
      path: "/api/muhurta",
      description: "Muhurta scoring for date range + purpose",
      payload: {
        dateRange: {start: "ISO-8601", end: "ISO-8601"},
        purpose: "general|marriage|business|health|travel",
        location: {lat, lng}
      },
      returns: {
        recommendedSlots: [{
          date: "ISO-8601",
          time: "HH:MM-HH:MM",
          score: 0-100,
          breakdown: {panchang, choghadiya, goldenWindow, inauspicious}
        }, ...],
        blockedPeriods: [{reason, timeWindow}, ...]
      }
    },
    {
      method: "GET",
      path: "/api/panchang",
      description: "Today's Panchang (Tithi, Vara, Nakshatra, Yoga, Karana)",
      returns: {
        tithi: {name, phase, endTime},
        vara: {name},
        nakshatra: {name, endTime},
        yoga: {name, endTime},
        karana: {name, endTime},
        sunTiming: {rise, set},
        rahuKaal: {startTime, endTime},
        auspiciousPeriods: [{name, timeWindow}, ...]
      },
      queryParams: {date: "ISO-8601", location: {lat, lng}}
    },
    {
      method: "POST",
      path: "/api/kundali",
      description: "Birth chart calculation + Dasha periods",
      payload: {
        birth: {date: "ISO-8601", time: "HH:MM:SS", location: {lat, lng, timezone}},
        system: "Lahiri|Sayana|KP"
      },
      returns: {
        chart: {lagna: {sign, degree}, planets: [{name, sign, degree, house}, ...]},
        dasha: {current: {period, yearsLeft}, next: {...}},
        ashtakavarga: {total_score, favorable_days}
      }
    },
    {
      method: "POST",
      path: "/api/numerology",
      description: "Numerology calculations (Life Path, Destiny, Soul Urge, etc.)",
      payload: {
        name: "Full name",
        birthDate: "ISO-8601"
      },
      returns: {
        lifePathNumber: 1-9,
        destinyNumber: 1-9,
        soulUrgeNumber: 1-9,
        personalityNumber: 1-9,
        maturityNumber: 1-9,
        personalYearNumber: 1-9,
        birthdayNumber: 1-31,
        loShuGrid: [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
        insights: "Astrological interpretation of numbers"
      }
    }
  ]
}
```

### Database Schema

```
apper:setup-database {
  tables: [
    "users (id, name, birthData, location, timezone)",
    "queries (id, userId, queryType, date, score, savedResult)",
    "saved_muhurtas (id, userId, date, timeWindow, purpose, score)",
    "calculations_cache (id, hash, result, ttl)"
  ],
  indexes: ["userId", "date", "queryType"]
}
```

### Authentication & Rate Limiting

```
apper:add-middleware {
  auth: "JWT + OAuth",
  rateLimiting: {
    free: "5 queries/day",
    premium: "100 queries/day",
    enterprise: "unlimited"
  },
  caching: "Redis with 1h TTL"
}
```

---

## IMPLEMENTATION FLOW

### Phase 1: Floot (Days 1-2)
1. [ ] Create project + import design tokens
2. [ ] Build cosmic components (cards, gauges, backgrounds)
3. [ ] Scaffold 6-page structure with dummy data
4. [ ] Test responsive design + accessibility

### Phase 2: Apper (Days 3-4)
1. [ ] Create API endpoints (backend logic)
2. [ ] Wire database schema
3. [ ] Implement calculation engines (Hora, Muhurta, etc.)
4. [ ] Add authentication + rate limiting

### Phase 3: Integration (Days 5-6)
1. [ ] Connect Floot pages to Apper API
2. [ ] Real data population
3. [ ] End-to-end testing
4. [ ] Performance optimization

### Phase 4: Deployment (Day 7)
1. [ ] Docker containerization
2. [ ] Cloudflare Workers setup
3. [ ] Database migrations
4. [ ] Monitoring + logging

---

## EXACT COMMANDS FOR YOUR TEAM

### Floot UI Builder

```bash
# In Floot console:
floot:init "TaraNidhi"
floot:import-design "docs/TARANIDHI_DESIGN_INTEGRATION_V1.md"
floot:create-pages "docs/FLOOT_APPER_IMPLEMENTATION_COMMANDS.md" --section="FOR FLOOT"
floot:build --target="production" --optimize="true"
```

### Apper Backend

```bash
# In Apper console:
apper:init "TaraNidhi-API"
apper:create-endpoints "docs/FLOOT_APPER_IMPLEMENTATION_COMMANDS.md" --section="FOR APPER"
apper:migrate --create-tables
apper:deploy --env="production"
```

### Verification

```bash
# After both complete:
curl https://api.taranidhi.com/api/dashboard?dateTime=2026-10-13T14:00:00Z
# Should return: {hora, panchang, goldenWindows, dailyEffect}

# Test frontend:
open https://taranidhi.app/
# Should show: "NOW" page with cosmic design + live data
```

---

## TOKEN-SAVING NOTES

✅ **Claude's job:** Specification + architecture  
✅ **Floot's job:** UI/UX implementation (using spec)  
✅ **Apper's job:** Backend/API implementation (using spec)  
✅ **Your job:** Review + verify integration

This division saves ~70% of token usage vs. Claude building everything.

---

**Status:** Ready for Floot + Apper integration  
**Document Version:** 1.0  
**Next Step:** Copy commands above into Floot/Apper consoles

