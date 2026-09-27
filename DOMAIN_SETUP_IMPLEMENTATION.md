# How to Implement TaraNidhi on www.occultviision.com

---

## Overview

**Goal:** Make TaraNidhi accessible at `https://www.occultviision.com`

**Steps:**
1. Deploy Worker to Cloudflare (already ready)
2. Configure DNS to point domain to Worker
3. Setup HTTPS certificate (automatic)
4. Test it's live

---

## Architecture

```
User visits www.occultviision.com
        ↓
Cloudflare DNS resolves to Worker
        ↓
Worker runs TaraNidhi API + Frontend
        ↓
User sees the PWA
```

---

## Step 1: Verify Your Domain on Cloudflare

1. Go to https://dash.cloudflare.com
2. Click on **occultviision.com**
3. Check that Cloudflare's nameservers are active:
   - Left sidebar: **DNS**
   - You should see your current DNS records
   - If not, update your domain's nameservers at Spaceship (your registrar)

---

## Step 2: Deploy the Worker

Once you have the Cloudflare API token (from CLOUDFLARE_API_KEY_SETUP.md):

```bash
cd /home/claude/occultviision/worker
npx wrangler deploy
```

After this, your Worker runs at:
- `occultviision-api.occultviision.workers.dev` (temporary Cloudflare URL)

---

## Step 3: Connect Custom Domain (www.occultviision.com)

### In Cloudflare Dashboard:

1. Go to **occultviision.com** → **Workers & Pages**
2. Click **Create application** → **Create a Worker**
3. OR click on existing **occultviision-api** worker
4. Click **Settings** → **Domains**
5. Click **Add Custom Domain**
6. Enter: `www.occultviision.com`
7. Click **Add Custom Domain**

**Cloudflare will automatically:**
- Create DNS record for www.occultviision.com
- Point it to your Worker
- Setup SSL/HTTPS certificate

---

## Step 4: Configure Environment Variables

Make sure these are set in `worker/wrangler.toml`:

```toml
[env.production]
vars = { FRONTEND_ORIGIN = "https://www.occultviision.com" }
```

Then redeploy:
```bash
npx wrangler deploy --env production
```

---

## Step 5: Test It's Live

### Test 1: Direct URL
```bash
curl https://www.occultviision.com/health
```

Expected response:
```json
{"status": "ok"}
```

### Test 2: API Endpoint
```bash
curl https://www.occultviision.com/auth/request-otp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone": "9669756111"}'
```

Expected: OTP sent to WhatsApp/SMS

### Test 3: Open in Browser
```
https://www.occultviision.com
```

You should see the TaraNidhi PWA login screen.

---

## Step 6: Setup Frontend (Optional)

If you have a frontend domain separate from API:

1. In `frontend/vite.config.ts`:
```typescript
export default {
  server: {
    proxy: {
      '/api': 'https://www.occultviision.com'
    }
  }
}
```

2. Build the frontend:
```bash
cd /home/claude/occultviision/frontend
npm run build
```

3. Deploy frontend to Cloudflare Pages (or use embedded in Worker)

---

## Architecture After Setup

```
┌─────────────────────────────────────┐
│  www.occultviision.com              │
│  (User visits here)                 │
└──────────────┬──────────────────────┘
               ↓
        Cloudflare DNS
               ↓
┌──────────────────────────────────────┐
│  Cloudflare Worker                   │
│  (occultviision-api)                 │
│                                      │
│  ├─ Frontend (PWA)                   │
│  ├─ API Routes (/auth, /kundali...)  │
│  ├─ Database (D1 SQLite)             │
│  └─ Cache (KV)                       │
└──────────────────────────────────────┘
```

---

## SSL/HTTPS

**Automatic:** Cloudflare automatically provides:
- SSL certificate for www.occultviision.com
- HTTPS encryption
- DDoS protection
- Rate limiting

No manual certificate setup needed.

---

## DNS Records (Reference)

After setup, your DNS should show:

| Type | Name | Content |
|------|------|---------|
| CNAME | www | occultviision-api.occultviision.workers.dev |
| A | @ | 104.21.xxx.xxx (Cloudflare IP) |
| MX | @ | Your mail provider |

(Cloudflare manages these automatically)

---

## Troubleshooting

**"Can't reach www.occultviision.com"**
- Wait 5-10 minutes for DNS propagation
- Check: Is the custom domain added in Cloudflare Workers?
- Check: `curl https://www.occultviision.com/health`

**"SSL certificate error"**
- Wait 30 minutes for certificate generation
- Force refresh browser cache (Ctrl+Shift+R)

**"API returns 403 Forbidden"**
- Check FRONTEND_ORIGIN in wrangler.toml
- Redeploy with: `npx wrangler deploy --env production`

---

## Final Checklist

- [ ] Cloudflare API token generated (CLOUDFLARE_API_KEY_SETUP.md)
- [ ] Worker deployed: `npx wrangler deploy`
- [ ] Custom domain added: www.occultviision.com
- [ ] FRONTEND_ORIGIN set to https://www.occultviision.com
- [ ] Health check passes: `curl https://www.occultviision.com/health`
- [ ] PWA loads in browser: https://www.occultviision.com
- [ ] Login works (OTP via WhatsApp)
- [ ] Test scan, wallet, referral screens
- [ ] Verify accuracy of calculations

---

## You're Done! 🚀

TaraNidhi is now live on www.occultviision.com
