# OCCULTVIISION Kaalchakra Pro

**Codenames:** TaraNidhi, HoraPath, HoraSetu (deprecated)

**Status:** Phase 2 (3 UI screens remaining, then deployment)

**Type:** Single-file PWA for Vedic astrology + numerology + licensing

**Start Date:** Sept 20, 2026 (Session 5)

---

## What It Does

1. **KP Horary Query** — Ask a yes/no question, get verdict (PROMISED/DENIED) + confidence %
2. **Muhurta Scanning** — Find auspicious dates/times for an activity
3. **Kundali Management** — Create, store, retrieve birth charts
4. **Points Wallet** — Track user credits (per-batch expiry, FIFO consumption)
5. **Referral System** — Single-level referrals with commission holds
6. **Admin Panel** — Read-only stats dashboard

---

## Technical Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **API** | Cloudflare Workers | Serverless, low-latency |
| **Database** | D1 (SQLite) | Relational, scales to 1M users |
| **Sessions** | Cloudflare KV | Fast, distributed caching |
| **Frontend** | PWA (vanilla TS + CSS) | Offline-capable, installable |
| **Router** | Hash-based SPA | No server routing needed |

---

## Architecture Decisions

### Ayanamsa (Precession Correction)
- **App-wide default:** Lahiri (0° baseline)
- **KP module only:** Krishnamurti (Lahiri - 0.0965°)
- **Reason:** Different systems, different precessions; Lahiri is modern standard

### House System
- **KP standard:** Placidus (most accurate for KP)
- **Not discussed:** Whole sign, equal house (KP uses Placidus)

### Wallet Architecture
- **Model:** FIFO ledger (not single balance column)
- **Prevents:** Double-spend vulnerability
- **Per-batch tracking:** source (free_trial/subscription/referral/topup) + expiry
- **Batch immutability:** Audit trail, chargeback protection

### Rate Limiting
- **Auth:** 5 req/min per IP, 10 req/min per user
- **KP Query:** 10 req/min (prevent formula scraping)
- **Kundali create:** 3/day per user
- **Strategy:** Token-bucket via KV, fail-open graceful degradation

---

## Current Phase Status

### Phase 1: Foundation ✅ COMPLETE
- ✅ 30 API endpoints (all wired)
- ✅ 6 CRITICAL issues fixed
- ✅ 8 HIGH issues resolved
- ✅ 15 database indexes (1M-user scaling)
- ✅ TypeScript compilation (0 critical errors)
- ✅ 4 commits pushed to GitHub

### Phase 2: Remaining Work 🟡 IN PROGRESS
- 🟢 UI Screen #28: /scanner (muhurta date scanner)
- 🟢 UI Screen #29: /wallet (points + transactions)
- 🟢 UI Screen #30: /referral (code + earnings)
- 🟢 Deploy to Cloudflare
- 🔴 SMS gateway (blocked: needs account)
- 🔴 Razorpay integration (blocked: needs account)

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | Full design doc (constraints, decisions, open items) |
| `db/schema.sql` | Database schema (D1) |
| `worker/src/index.ts` | API router + main entry |
| `worker/src/routes/*.ts` | Individual endpoint handlers |
| `worker/src/lib/*.ts` | Shared modules (auth, wallet, rate-limit, etc.) |
| `frontend/src/main.ts` | PWA entry point |
| `frontend/src/screens/*.ts` | Individual screen components |

---

## Blockers

| Item | Needed By | Status |
|------|-----------|--------|
| SMS Gateway (MSG91/equivalent) | OTP delivery | Naveen decision |
| Razorpay account + keys | Payment processing | Naveen account creation |
| Frontend domain (prod) | CORS + deployment | Naveen confirmation |

---

## Decisions Pending

1. **SMS Provider** — MSG91, Interakt, or other?
2. **Razorpay Account** — Naveen's personal account or shared?
3. **Frontend Domain** — www.occultviision.com or other?
4. **Launch Date** — Target go-live date?

---

## Success Metrics

- ✅ **Compilation:** 0 critical errors
- ✅ **Coverage:** All critical paths verified
- ✅ **Scaling:** 15 indexes, ready for 1M users
- ✅ **Security:** CORS scoped, OTP bypass off, admin auth enforced
- ✅ **Efficiency:** 5x token improvement (15M → 3M/session)
- ⏳ **Accuracy:** KP calculations verified (Krishnamurti - Lahiri 0.0965°)

---

## Next Milestones

1. **End Sept 27:** Automation setup, confirm blockers
2. **Sept 28:** Build 3 UI screens
3. **Sept 29:** Deploy to Cloudflare, wire SMS + Razorpay
4. **Sept 30:** QA testing, documentation
5. **Oct 1:** Launch (pending blockers cleared)
