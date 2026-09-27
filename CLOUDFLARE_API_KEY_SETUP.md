# How to Generate Cloudflare API Key

---

## Step 1: Login to Cloudflare

1. Go to https://dash.cloudflare.com
2. Login with your account
3. You should see your domains listed

---

## Step 2: Create API Token

### Option A: Create a Scoped Token (Recommended for Security)

1. Click your **Profile icon** (top right) → **My Profile**
2. In left sidebar, click **API Tokens**
3. Click **Create Token**
4. Under "Create Custom Token", click **Get Started**

### Fill in:
- **Token name:** `occultviision-worker-deploy`
- **Permissions:**
  - Account → Cloudflare Workers → Edit
  - Account → Cloudflare Workers KV → Edit
  - Account → Cloudflare D1 → Edit
  - Zone → Cloudflare Workers Routes → Edit

5. **Zone Resources:** Select your zone (occultviision.com)
6. Click **Continue to Summary**
7. Click **Create Token**

---

## Step 3: Copy Your Token

A yellow box will appear with your API token:
```
abc123xyz...
```

**⚠️ IMPORTANT:** Copy this NOW. You won't be able to see it again.

---

## Step 4: Set Environment Variable

On your computer, add this to your shell profile (~/.bashrc, ~/.zshrc, or ~/.bash_profile):

```bash
export CLOUDFLARE_API_TOKEN="abc123xyz..."
```

Then reload:
```bash
source ~/.bashrc
# or
source ~/.zshrc
```

Verify it's set:
```bash
echo $CLOUDFLARE_API_TOKEN
```

You should see your token printed.

---

## Step 5: Deploy TaraNidhi

Once the token is set, run:

```bash
cd /home/claude/occultviision/worker
npx wrangler deploy
```

You should see:
```
✓ Uploaded 1 worker script
✓ Deployed to occultviision-api.occultviision.workers.dev
```

---

## Option B: Use Global API Key (Less Secure)

If you prefer, you can use your Global API Key instead:

1. Click **Profile icon** → **My Profile**
2. Left sidebar: **API Tokens**
3. Scroll down to **Global API Key**
4. Click **View** next to your email

Copy that key and set:
```bash
export CLOUDFLARE_API_TOKEN="your_global_api_key"
```

---

## Troubleshooting

**"ERROR: Invalid API token"**
- Check: Did you copy the full token?
- Check: Is the environment variable set? (`echo $CLOUDFLARE_API_TOKEN`)
- Check: Is it the right type of token?

**"ERROR: Not authorized"**
- Your token doesn't have enough permissions
- Regenerate with Option A (Scoped Token) above

---

## What happens after deploy?

Once deployed:
1. Your Worker runs on `occultviision-api.occultviision.workers.dev` (Cloudflare-assigned domain)
2. Then we configure your custom domain: `www.occultviision.com` → points to this Worker
3. TaraNidhi is live! 🚀

---

**Next:** Once you have the token set, tell me and I'll deploy immediately.
