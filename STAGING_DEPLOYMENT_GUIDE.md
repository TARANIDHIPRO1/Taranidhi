# Staging Deployment & Testing Guide — TaraNidhi
**Purpose:** Test before production (Oct 17)  
**Timeline:** Oct 16-17 (24 hours)  
**Status:** Ready to deploy

---

## Test Environment Setup

### Option 1: Cloudflare Workers Preview (FASTEST - 5 minutes)
```bash
# Deploy to preview URL (no DNS needed)
wrangler publish --env staging

# Test URL: https://occultviision-staging.workers.dev
# (or custom preview URL from Cloudflare)
```

### Option 2: Staging Subdomain (RECOMMENDED - 10 minutes)
```
staging.taranidhi.occultviision.com
test.occultviision.com
```

**DNS Setup (CNAME):**
```
staging.taranidhi.occultviision.com → occultviision-staging.workers.dev
test.occultviision.com → occultviision-staging.workers.dev
```

### Option 3: Local Testing + Ngrok (OFFLINE - 2 minutes)
```bash
# Start local server
npm run dev

# Expose via ngrok
ngrok http 8787

# Test URL: https://[random].ngrok.io
```

---

## I RECOMMEND: Option 2 (Staging Subdomain)

**Why:**
- ✅ Realistic production environment
- ✅ Full DNS + SSL working
- ✅ Can share link with team
- ✅ Easy switch to production (just change CNAME)

**Staging Domain:**
```
test.taranidhi.occultviision.com  (or test.occultviision.com)
```

---

## Deployment Steps (15 minutes)

### Step 1: Build Staging Version
```bash
cd /home/claude/occultviision/worker

# Create staging config
cp wrangler.toml wrangler.staging.toml

# Update in wrangler.staging.toml:
# [env.staging]
# name = "occultviision-staging"
# route = "staging.taranidhi.occultviision.com/*"

# Deploy to staging
wrangler publish --env staging
```

### Step 2: Configure DNS (5 minutes)
```
Provider: Spaceship (your domain registrar)
Domain: occultviision.com

Add CNAME Record:
Name: test.taranidhi
Type: CNAME
Value: occultviision-staging.workers.dev
TTL: 300 (5 minutes)
```

### Step 3: Verify DNS (2-3 minutes)
```bash
# Check DNS propagation
dig test.taranidhi.occultviision.com

# Should return:
# test.taranidhi.occultviision.com. 300 IN CNAME occultviision-staging.workers.dev
```

### Step 4: Test Deploy
```bash
# Open in browser
https://test.taranidhi.occultviision.com/

# Should load TaraNidhi PWA
```

---

## Testing Checklist (QA Protocol)

### Frontend Tests
- [ ] Page loads without errors
- [ ] Dashboard renders (6 event tiles visible)
- [ ] Hinglish selector works (English, Hindi, Hinglish)
- [ ] Dark/Light theme toggle works
- [ ] Mobile responsive (test on phone)
- [ ] Navigation (Desk, Clock, Ask, Account) works

### Muhurta Calculation Tests
- [ ] Vehicle Muhurta: Returns GO/WAIT/NOT verdict ✓
- [ ] Property Muhurta: Shows next auspicious date ✓
- [ ] Gold Purchase: Avoids Amavasya ✓
- [ ] Electronics: Nakshatra verified ✓
- [ ] Marriage: Returns score 0-100 ✓
- [ ] Business: Shows window duration ✓

### "Ask" Feature Tests (Natural Language)
- [ ] English: "Should I buy a car this week?" → Verdict + Window
- [ ] Hinglish: "Kya main gaadi khareed sakta hu?" → GO/WAIT/NOT
- [ ] Hindi: "क्या मैं सोना खरीद सकता हूँ?" → Verdict + Reason

### Choghadiya Clock Tests
- [ ] 96-cell grid renders ✓
- [ ] Color coding shows (green/amber/red) ✓
- [ ] Rahu, Abhijit, Brahma marked ✓
- [ ] Hover shows time + period name ✓

### Performance Tests
- [ ] Page load < 2 seconds ✓
- [ ] Muhurta calculation < 500ms ✓
- [ ] No console errors (F12 → Console) ✓
- [ ] Network tab shows all assets loaded ✓

### Integration Tests (When Ready)
- [ ] Database migrations applied (0006, 0007) ✓
- [ ] User events table working ✓
- [ ] Saved muhurtas table working ✓

### Browser Compatibility
- [ ] Chrome (latest) ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓
- [ ] Mobile Safari (iPhone) ✓
- [ ] Chrome Mobile (Android) ✓

---

## Error Logging (What to Check)

**Browser Console (F12):**
```javascript
// Should be CLEAN (no red errors)
// Check for:
// ❌ TypeError: calculateMuhurta is not defined
// ❌ CORS error: No 'Access-Control-Allow-Origin'
// ❌ 404: File not found
// ✅ All green or info logs only
```

**Network Tab (F12 → Network):**
```
All requests should show:
✅ 200 OK (success)
✅ 304 Not Modified (cached)

❌ 404 Not Found
❌ 500 Server Error
❌ 403 Forbidden
```

**Backend Logs:**
```bash
# Check Cloudflare Workers logs
wrangler tail --env staging

# Should show:
✅ GET /muhurta → 200
✅ POST /ask → 200
✅ GET /choghadiya-clock → 200
```

---

## Test Scenarios (Real-World)

### Scenario 1: General User (No Birth Data)
1. Open test.taranidhi.occultviision.com
2. See 6 event tiles (Vehicle, Property, Gold, etc)
3. All show CITY-level confidence
4. Each shows GO/WAIT/NOT verdict

**Expected:** All tiles load, verdicts shown ✓

### Scenario 2: User with Birth Date
1. Enter birth date: 08/04/1973
2. Tiles update to MOON-level confidence
3. Personalized messaging ("Aapke liye…")

**Expected:** Personalization works ✓

### Scenario 3: User with Full Birth Chart
1. Enter: Date, Time, Place of birth
2. Tiles update to LAGNA-level confidence
3. Lagna rule applied (if applicable)

**Expected:** Full kundali calculations work ✓

### Scenario 4: "Ask" Feature (Hinglish)
1. Click "Ask" tab
2. Type: "Kya main kal gaadi khareed sakta hu?"
3. Get: Verdict + Window + Reason + Grade

**Expected:** NL parsing + Muhurta + Output ✓

### Scenario 5: Clock View
1. Click "Clock" tab
2. See 96-cell grid (sunrise to sunrise)
3. Cells colored by choghadiya
4. Rahu/Abhijit/Brahma marked

**Expected:** Clock renders, colors correct ✓

---

## Sign-Off Report

After testing, create this report:

```
TEST REPORT — TaraNidhi Staging
Date: Oct 16, 2026
Tester: [Name]

✅ PASSED: 12/15 tests
⚠️ WARNINGS: 2 (non-blocking)
❌ FAILED: 1 (blocking)

Blocking Issue:
- Mahurta calculation returns null on Vehicle query
  Root: Missing location data in API call
  Fix: Pass default location (Delhi 28.6139, 77.2090)
  Status: FIXED ✓

Non-Blocking Issues:
- Dark mode: Toggle button label unclear
  Fix: Change "Theme" → "Dark/Light"
  Status: Can fix in v1.1

Overall Assessment: READY FOR PRODUCTION ✓
Go-Live Date: Oct 17, 2026

Signed: [Naveen K. Rai]
```

---

## Deployment to Production (After Testing)

Once all tests pass:

```bash
# 1. Just change DNS CNAME
# From: test.taranidhi.occultviision.com → staging
# To:   taranidhi.occultviision.com → production

# 2. Deploy to production
wrangler publish --env production

# 3. Verify live
curl https://taranidhi.occultviision.com/health
# Should return: { "status": "OK", "version": "1.0.0" }
```

---

## Timeline

```
Oct 16, 17:30 — Deploy to staging
Oct 16, 17:45 — Run full test checklist
Oct 16, 18:00 — Fix any blocking issues
Oct 16, 18:30 — Sign off & approve
Oct 17, 09:00 — Switch DNS to production
Oct 17, 09:15 — Deploy to production
Oct 17, 09:30 — Verify live link
Oct 17, 10:00 — GO LIVE for Deepawali 🪔
```

---

## What I Need From You (To Start)

1. ✅ **Staging subdomain:** `test.taranidhi.occultviision.com` OK?
2. ✅ **DNS access:** Can you add CNAME record to Spaceship?
3. ✅ **Test duration:** How long can you test (1-2 hours)?
4. ✅ **Razorpay status:** Need this for payment testing
5. ✅ **Twilio status:** Need this for SMS testing

**Answer these 5 → Staging deployment starts NOW.** 🚀

