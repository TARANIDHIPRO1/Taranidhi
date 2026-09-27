# Glossary — Astrology & Project Terms

## Astrology Concepts

### Systems
| Term | Meaning | Status |
|------|---------|--------|
| **KP** | Krishnamurti Paddhati — sub-lord based horoscope system; 243-fold subdivisions | Used in app |
| **Lahiri** | Ayanamsa (precession) method; 0° baseline; modern standard | Default app-wide |
| **Krishnamurti Ayanamsa** | Lahiri - 0.0965° (KP-specific precession) | KP module only |
| **Parashari** | Classical Vedic astrology system | Consulted in reports |
| **Jaimini** | Alternative Vedic approach (karaka method) | Consulted in reports |
| **Bhrigu Nandi Nadi** | Nadi astrology (past-life inference) | Referenced |

### Houses & Timing
| Term | Meaning |
|------|---------|
| **Placidus** | House system (most accurate for KP); standard in app |
| **Sub-Lord** | Micro-subdivision of a house/sign (243-fold detail) |
| **Dasha** | Planetary period system (timing mechanism) |
| **Tribhagi** | 3-equal-part Mahadasha division (Naveen's preference) |
| **Navatara Chakra** | 9-fold division for timing & prediction |
| **Ashtakavarga** | 8-fold strength analysis |

### Birth Chart
| Term | Meaning |
|------|---------|
| **Kundali** | Birth chart / natal chart (main deliverable) |
| **Lagna** | Ascendant (rising sign; defines chart) |
| **Janma Nakshatra** | Birth star/constellation |
| **Rashi** | Sign (12-fold zodiac) |

### Prediction Mechanics
| Term | Meaning |
|------|---------|
| **Muhurta** | Auspicious moment for an action (timing science) |
| **Tarabala** | Star-based score (birth star vs question star) |
| **Ganda Moola** | Inauspicious star constellation (warning flag) |
| **Panchaka** | 5-fold consideration (dangerous period) |
| **Verdict** | KP query result (PROMISED = yes, DENIED = no) |

---

## Project Terms

| Term | Meaning |
|------|---------|
| **TaraNidhi** | Codename for Kaalchakra Pro (internal) |
| **Kaalchakra** | "Time wheel" (Sanskrit); the PWA app itself |
| **PWA** | Progressive Web App (installable, offline-capable) |
| **Phase 1** | Foundation (architecture + core APIs) — ✅ DONE |
| **Phase 2** | UI screens + deployment — 🟡 IN PROGRESS |
| **Kundali CRUD** | Create, read, update, delete birth charts |
| **KP Query** | Ask yes/no question, get verdict + confidence |
| **Muhurta Scan** | Find auspicious dates/times for an activity |
| **Sub-Lord Engine** | Core calculation: 243-fold subdivision lookup |
| **Wallet Ledger** | FIFO points system (prevents double-spend) |
| **Referral Hold** | 30-day commission holding (chargeback protection) |

---

## Acronyms

| Acronym | Full Form |
|---------|-----------|
| **KP** | Krishnamurti Paddhati |
| **JD** | Julian Day (astronomical time unit) |
| **IST** | Indian Standard Time (UTC+5:30) |
| **UTC** | Coordinated Universal Time |
| **D1** | Cloudflare D1 (SQLite database) |
| **KV** | Cloudflare KV (key-value caching) |
| **FIFO** | First-In-First-Out |
| **CORS** | Cross-Origin Resource Sharing |
| **OTP** | One-Time Password |
| **PWA** | Progressive Web App |
| **SPA** | Single-Page Application |
| **CMS** | Content Management System |
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |

---

## Reference Data

### Naveen K. Rai (Reference Chart)
- **Date:** 08/04/1973
- **Time:** 11:45 AM IST
- **Place:** Bhopal (23.2505°N, 77.4065°E)
- **JD:** 2441780.760416666 (verified)
- **Use:** All calculations tested against this chart

### Ayanamsa Offset
- **Lahiri:** 0.0000°
- **Krishnamurti:** -0.0965° (Lahiri - 0.0965°)
- **Applied in:** KP module only

### Time Zones (10 Supported in App)
- Asia/Kolkata (India, default)
- Asia/Bangkok, Asia/Singapore, Asia/Hong_Kong
- Australia/Sydney
- Europe/London, Europe/Paris
- America/New_York, America/Los_Angeles, America/Chicago

---

## Code Patterns

| Pattern | Usage |
|---------|-------|
| **Lazy Cleanup** | Background batch expiry + hold release (on balance check) |
| **Token-Bucket** | Rate limiting (per-endpoint, per-user, per-IP) |
| **Atomic Wallet** | D1 batch() for non-racy deductions |
| **Fail-Open** | KV/API unavailable → degrade gracefully, don't crash |
| **Hash Router** | SPA navigation (#/path), no server routing |
| **Audit Trail** | Ledger-based (immutable batch history) |

---

## Notes

- Krishnamurti ayanamsa = Lahiri ayanamsa - 0.0965°
- This difference is critical for KP accuracy (sub-lord sensitive)
- Placidus houses are standard in app (not Whole Sign or Equal House)
- Referral commissions held 30 days (chargeback window)
- All calculations use UTC; user timezone for display only
