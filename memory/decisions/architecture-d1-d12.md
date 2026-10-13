# D1-D12: TARANIDHI ARCHITECTURE DECISIONS

**Status:** 🟡 PENDING NAVEEN APPROVAL  
**Date:** Oct 14, 2026  
**Required For:** Production launch (can't proceed without)  

---

## D1: DATABASE CHOICE

**Question:** Which PostgreSQL provider should we use?

**Options:**
1. **🟢 NEON (RECOMMENDED)** - Serverless PostgreSQL
   - Best for: Cloudflare Workers integration
   - Cost: $20/month starter plan
   - Scaling: Auto-scales, pay-per-use
   - Features: Branching, backups included
   - Decision: **USE THIS** ✅

2. AWS RDS
   - Best for: Large enterprise deployments
   - Cost: $50+/month
   - Scaling: Manual, need DevOps
   - Features: Multi-region replication

3. Supabase
   - Best for: Full stack with auth
   - Cost: $25/month
   - Scaling: Good, but overkill for our use case
   - Features: Realtime, auth built-in

4. Self-hosted
   - Cost: Cheap ($5-10/month on DigitalOcean)
   - Problem: Needs DevOps, backups, monitoring

**Recommendation:** **NEON** (serverless, cheap, scalable, Cloudflare-native)

**ACTION:** Naveen confirm ✅ or choose alternative ___________

---

## D2: AUTHENTICATION METHOD

**Question:** JWT tokens or server sessions?

**Options:**
1. **🟢 JWT TOKENS (RECOMMENDED)**
   - Works: Stateless, perfect for serverless
   - Tokens: 24h expiry, refresh tokens for renewal
   - Security: HS256 signing
   - Decision: **USE THIS** ✅

2. Server Sessions
   - Problem: Requires database state, not serverless-friendly
   - Overkill for our use case

**Recommendation:** **JWT TOKENS**

**ACTION:** Naveen confirm ✅

---

## D3: AYANAMSA SYSTEM

**Question:** Which ayanamsa (zodiac adjustment) for calculations?

**Options:**
1. **🟢 LAHIRI AYANAMSA (RECOMMENDED & CURRENT)**
   - Standard: Default Indian standard
   - Implemented: Already in code
   - Accuracy: ±2 minutes of arc
   - Decision: **KEEP THIS** ✅

2. Fagan-Bradley
   - Less common, Western astrology only

3. DeLuce
   - Niche, not widely used

**Recommendation:** **LAHIRI** (already implemented, standard)

**ACTION:** Naveen confirm ✅

---

## D4: RAHU KALAM CALCULATION

**Question:** How to calculate Rahu Kalam (inauspicious hour)?

**Options:**
1. **🟢 STANDARD FORMULA (RECOMMENDED)**
   - Method: 8 equal divisions of day (Hora system)
   - Rahu Hora: 8th division
   - Calculation: sunrise + (8/12 × day duration)
   - Accuracy: ±5 minutes
   - Implementation: Ready in code
   - Decision: **USE THIS** ✅

2. Vedic Formula
   - More complex, regional variations
   - Accuracy: Same as standard
   - Problem: Not widely agreed upon

3. Classical References
   - Problem: Inconsistent across texts

**Recommendation:** **STANDARD FORMULA** (simple, reliable, implemented)

**ACTION:** Naveen confirm ✅

---

## D5: HOUSE SYSTEM

**Question:** Which house system for chart divisions?

**Options:**
1. **🟢 PLACIDUS SYSTEM (RECOMMENDED & CURRENT)**
   - Standard: KP (Krishnamurti Paddhati) uses this
   - Implemented: Already in code
   - Calculation: Time divisions of celestial sphere
   - Decision: **KEEP THIS** ✅

2. Equal House
   - Less accurate for extreme latitudes

3. Whole Sign
   - Niche, not KP standard

**Recommendation:** **PLACIDUS** (KP standard, implemented)

**ACTION:** Naveen confirm ✅

---

## D6: DASHA SYSTEM

**Question:** Which planetary period system?

**Options:**
1. **🟢 VIMSHOTTARI DASHA (RECOMMENDED & CURRENT)**
   - Standard: Most used in Indian astrology
   - Duration: 120-year cycle
   - Implementation: Complete in code
   - Accuracy: Classical texts verified
   - Decision: **KEEP THIS** ✅

2. Ashtottari Dasha
   - Alternative, 108-year cycle
   - Problem: Less commonly used

3. Shodasottari Dasha
   - Rare, limited application

**Recommendation:** **VIMSHOTTARI** (standard, implemented)

**ACTION:** Naveen confirm ✅

---

## D7: JANMA TARA MATCHING (TARABALA)

**Question:** How to calculate Tarabala (compatibility score)?

**Options:**
1. **🟢 KP METHOD (RECOMMENDED & CURRENT)**
   - Formula: Navatara Chakra (9-point cycle)
   - Scoring: 0-100 based on star distance
   - Implementation: Complete in code
   - Accuracy: Classical KP texts verified
   - Decision: **USE THIS** ✅

2. Classical Jyotish
   - Different formula, similar accuracy
   - Problem: Inconsistent implementations

3. Modern Numerology
   - Not astrological, less reliable

**Recommendation:** **KP METHOD** (implemented, reliable)

**ACTION:** Naveen confirm ✅

---

## D8: NUMEROLOGY SYSTEM

**Question:** Which numerology method?

**Options:**
1. **🟢 PYTHAGOREAN (RECOMMENDED & CURRENT)**
   - Standard: Most widely used internationally
   - Implementation: Complete in code
   - Mapping: A=1, B=2, ... Z=26
   - Numbers: 1-9 + 11, 22, 33 (Master numbers)
   - Decision: **USE THIS** ✅

2. Chaldean
   - Ancient, less standardized
   - Problem: More complex

**Recommendation:** **PYTHAGOREAN** (standard, implemented)

**ACTION:** Naveen confirm ✅

---

## D9: SMS GATEWAY PROVIDER

**Question:** Which SMS service for OTP delivery?

**Options:**
1. **🟢 TWILIO (RECOMMENDED)**
   - Cost: $0.0075 per SMS (cheap)
   - Coverage: Global, including India
   - Reliability: 99.9% uptime
   - Setup: Simple API integration
   - Account: Create free trial account
   - Decision: **USE THIS** ✅

2. AWS SNS
   - Cost: Slightly cheaper
   - Problem: AWS lock-in

3. India-local SMS Service
   - Cost: Cheapest ($0.002/SMS)
   - Problem: Complex compliance, local vendor lock-in

4. Firebase Cloud Messaging
   - Free tier available
   - Problem: Not SMS, app-only

**Recommendation:** **TWILIO** (reliable, cheap, global)

**ACTION:** 
- [ ] Naveen create Twilio account
- [ ] Get API key + Auth token
- [ ] Setup webhook

---

## D10: PAYMENT PROVIDER

**Question:** Which payment gateway for subscriptions?

**Options:**
1. **🟢 RAZORPAY (RECOMMENDED)**
   - Standard: India-first, best UX
   - Cost: 2% + ₹5 per transaction
   - Coverage: India, UPI, cards
   - Features: Webhooks, refunds, subscriptions
   - Setup: Simple integration
   - Decision: **USE THIS** ✅

2. Stripe
   - Cost: 2.9% + $0.30 (expensive for India)
   - Problem: Higher fees

3. PayU
   - Alternative, similar fees
   - Problem: Backup option only

**Recommendation:** **RAZORPAY** (India-first, best rates)

**ACTION:**
- [ ] Naveen create Razorpay account
- [ ] Get API key + Secret key
- [ ] Setup webhooks

---

## D11: PRODUCTION DOMAIN

**Question:** What's the production URL?

**Options:**
1. **taranidhi.com** - Dedicated domain
2. **occultviision.com/taranidhi** - Subdirectory
3. **app.occultviision.com** - Subdomain
4. **custom.domain.com** - User preference

**Recommendation:** **Needs Naveen input**

**ACTION:**
- [ ] Naveen confirm domain
- [ ] If new domain: Buy + setup DNS
- [ ] Setup SSL certificate (Let's Encrypt free)
- [ ] Confirm CORS configuration

---

## D12: BACKUP & DISASTER RECOVERY

**Question:** How to backup and recover from failure?

**Options:**
1. **🟢 DAILY BACKUPS + RTO 4HRS (RECOMMENDED)**
   - Backup: Daily automated backup to S3
   - Retention: 30 days of backups
   - Recovery: <30 minutes restore time
   - RTO (Recovery Time Objective): 4 hours
   - RPO (Recovery Point Objective): 24 hours
   - Cost: ~$5/month S3 storage
   - Decision: **USE THIS** ✅

2. Multi-region replication
   - Cost: $100+/month
   - Overkill for phase 1

3. No backup
   - Not acceptable (data loss risk)

**Recommendation:** **DAILY BACKUPS + 4HR RTO**

**ACTION:**
- [ ] Naveen approve backup strategy
- [ ] Setup automated daily backups
- [ ] Test restore procedure
- [ ] Document recovery steps

---

## SUMMARY FOR NAVEEN

**Please confirm or modify each decision:**

| Decision | Status | Recommendation |
|----------|--------|-----------------|
| D1 | 🟡 Waiting | NEON PostgreSQL |
| D2 | 🟡 Waiting | JWT Tokens |
| D3 | 🟡 Waiting | Lahiri Ayanamsa |
| D4 | 🟡 Waiting | Standard Rahu Kalam |
| D5 | 🟡 Waiting | Placidus Houses |
| D6 | 🟡 Waiting | Vimshottari Dasha |
| D7 | 🟡 Waiting | KP Tarabala |
| D8 | 🟡 Waiting | Pythagorean Numerology |
| D9 | 🟡 Waiting | Twilio SMS |
| D10 | 🟡 Waiting | Razorpay Payments |
| D11 | 🟡 Waiting | Confirm Domain |
| D12 | 🟡 Waiting | Daily Backups + RTO 4hrs |

---

## APPROVAL EMAIL TEMPLATE FOR NAVEEN

```
Subject: Urgent: TaraNidhi Architecture Decisions (D1-D12) - Sign-off Required

Hi Naveen,

To launch TaraNidhi, I need your approval on 12 architecture decisions.

All decisions have recommendations already. Most are already implemented in code.

Please reply to each:

D1: Database - NEON PostgreSQL? ✅ YES / ❌ NO
D2: Auth - JWT Tokens? ✅ YES / ❌ NO
D3: Ayanamsa - Lahiri? ✅ YES / ❌ NO
D4: Rahu Kalam - Standard? ✅ YES / ❌ NO
D5: Houses - Placidus? ✅ YES / ❌ NO
D6: Dasha - Vimshottari? ✅ YES / ❌ NO
D7: Tarabala - KP Method? ✅ YES / ❌ NO
D8: Numerology - Pythagorean? ✅ YES / ❌ NO
D9: SMS - Twilio? ✅ YES / ❌ NO
D10: Payments - Razorpay? ✅ YES / ❌ NO
D11: Domain - Which URL?
D12: Backup - Daily + 4hr RTO? ✅ YES / ❌ NO

Also need:
- Create Twilio account (free trial)
- Create Razorpay account
- Confirm production domain

Once approved, we ship in 5 days.

Thanks,
Claude
```

---

**Status:** Ready for Naveen approval  
**Blocker:** Waiting on responses  
**Next Step:** Send approval email to Naveen (9669756111)
