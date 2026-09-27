# TaraNidhi Deployment Checklist

**Status:** Ready for launch  
**Date:** Sept 27, 2026  
**Owner:** Naveen K. Rai + Claude (Dev)  
**Contact:** 9669756111 (WhatsApp integration)

---

## Phase 1: Infrastructure Setup (Claude)

### 1.1 Cloudflare Worker Deployment
- [ ] Verify Cloudflare account is connected
- [ ] Set environment variables in wrangler.toml:
  - `FRONTEND_ORIGIN=https://www.occultviision.com`
  - `RAZORPAY_KEY_ID=<pending from Naveen>`
  - `RAZORPAY_SECRET=<pending from Naveen>`
  - `MSG91_API_KEY=<pending from Naveen>`
  - `MSG91_SENDER_ID=<pending from Naveen>`
- [ ] Run: `wrangler deploy`
- [ ] Verify worker is live at Cloudflare URL
- [ ] Configure custom domain: www.occultviision.com → Worker

### 1.2 Database Migration
- [ ] Run: `npm run db:migrate:remote`
- [ ] Verify D1 database schema is applied
- [ ] Check 15 indexes are created

### 1.3 Service Worker & PWA
- [ ] Verify Service Worker registers at `/sw.js`
- [ ] Test offline capability (disable network, reload)
- [ ] Check app can be installed on mobile

---

## Phase 2: Integrations (Split)

### 2.1 WhatsApp Integration (Claude)
**Status:** Ready, waiting for Naveen's number

- [ ] Create WhatsApp Business account (or use existing)
- [ ] Get WhatsApp API credentials
- [ ] Wire API endpoint in Worker (`/auth/send-otp` to use WhatsApp instead of SMS91)
- [ ] Test message sending to 9669756111
- [ ] Fallback: If WhatsApp fails, route to SMS (once MSG91 ready)

**Blocker Status:** Waiting for Naveen to confirm number + activate

### 2.2 Razorpay Integration (Claude)
**Status:** Pending Razorpay API keys

- [ ] Receive Key ID + Key Secret from Naveen
- [ ] Add to wrangler.toml environment
- [ ] Wire payment gateway in `/orders` endpoint
- [ ] Test payment flow (create order → open Razorpay modal → success/failure)
- [ ] Verify webhook for payment confirmation

**Blocker Status:** Waiting for Naveen to provide API keys + check account status

### 2.3 MSG91 (SMS) Integration (Claude)
**Status:** Pending sender ID approval from Naveen

- [ ] Receive MSG91 API key + Sender ID from Naveen
- [ ] Add to wrangler.toml environment
- [ ] Wire SMS endpoint in `/auth/request-otp`
- [ ] Test OTP sending to test number
- [ ] Verify OTP verification flow

**Blocker Status:** Waiting for Naveen's MSG91 sender ID approval (time-consuming, can proceed without)

---

## Phase 3: Testing (Naveen)

### 3.1 Functionality Testing
- [ ] User signup/login flow (OTP)
- [ ] Create kundali (birth chart)
- [ ] Muhurta scanner (date range search)
- [ ] Wallet balance display
- [ ] Referral code generation
- [ ] Admin panel access

### 3.2 Accuracy Testing
- [ ] Verify KP calculations (sub-lord accuracy)
- [ ] Verify muhurta scores (0-100%)
- [ ] Verify tarabala scoring
- [ ] Test with your own birth chart (08/04/1973, 11:45 IST, Bhopal)
- [ ] Cross-check with manual calculations

### 3.3 Flow Testing
- [ ] Payment flow (Razorpay)
- [ ] OTP delivery (WhatsApp or SMS)
- [ ] Referral sharing
- [ ] Data persistence (charts saved correctly)

### 3.4 Performance Testing
- [ ] Load time on first visit
- [ ] Offline mode functionality
- [ ] Mobile responsiveness (all screens)
- [ ] Rate limiting (try exceeding limits, should get 429)

---

## Phase 4: Blockers & Timeline

### Blocker 1: WhatsApp Integration
**Owner:** Naveen  
**Action:** Confirm personal number is 9669756111  
**Timeline:** Immediate  
**Impact:** OTP delivery via WhatsApp (fallback to SMS once MSG91 ready)

### Blocker 2: Razorpay Keys
**Owner:** Naveen  
**Action:** Check Razorpay account status, provide Key ID + Secret  
**Timeline:** Check ASAP  
**Impact:** Payment processing cannot work without this

### Blocker 3: MSG91 Sender ID Approval
**Owner:** Naveen  
**Action:** Create MSG91 account, request sender ID approval  
**Timeline:** 1-3 days (approval process)  
**Impact:** SMS fallback for OTP (not critical if WhatsApp works)

---

## Phase 5: Deployment Order

**Today (Sept 27):**
1. Claude: Deploy Cloudflare Worker (1 hour)
2. Claude: Integrate WhatsApp API (1 hour, ready to test when Naveen confirms number)
3. Claude: Prepare Razorpay integration (ready to wire when keys arrive)
4. Naveen: Verify WhatsApp number + Razorpay account status

**Once Keys Arrive:**
1. Claude: Wire Razorpay + complete testing
2. Naveen: Full end-to-end testing (3-4 hours recommended)
3. Naveen: Verify accuracy of calculations
4. Claude: Minor fixes based on feedback
5. Launch!

---

## Phase 6: Post-Launch

- [ ] Monitor error logs
- [ ] Track user signups
- [ ] Gather feedback from initial users
- [ ] Setup nightly audits (automated)
- [ ] Document API for future integrations

---

## Quick Reference: What You Need to Provide

| Item | What | When |
|------|------|------|
| WhatsApp | Confirm 9669756111 is correct | Now |
| Razorpay | Key ID + Secret | ASAP |
| MSG91 | API key + Sender ID | After approval (1-3 days) |

---

## Quick Reference: Commands

```bash
# Deploy to Cloudflare
cd /home/claude/occultviision/worker
wrangler deploy

# View logs
wrangler tail

# Migrate database
npm run db:migrate:remote

# Test locally
npm run dev
```

---

**Status:** 🟢 Ready. Waiting for Naveen's go-ahead on WhatsApp number + Razorpay keys.
