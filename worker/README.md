# occultviision-worker

The Cloudflare Worker (API layer) for OCCULTVIISION. Lives at `worker/` in the
main repo, alongside `docs/` and `db/`.

## What's implemented so far

- `POST /auth/request-otp` — sends a 6-digit OTP to a phone number
- `POST /auth/verify-otp` — verifies the OTP, creates or logs in the user,
  registers the device fingerprint, grants the one-time 25-point/3-day free
  trial if this phone+device combo has never had one, issues a session token
- `POST /kundali` (requires `Authorization: Bearer <session_token>`) — saves
  a birth chart: validates input, enforces the tier's multi-kundali limit
  (Basic=1, Premium=3, Ultra=unlimited, per ARCHITECTURE.md Section 5),
  computes and stores the Lagna rashi server-side (closed-form, Lahiri,
  verified against Naveen's own chart -- see `src/lib/lagna.ts` header)
- `GET /kundali` (requires auth) — lists the caller's saved kundalis
- `GET /health` — trivial liveness check

Auth came first because every other table (wallet, kundalis, query_logs)
depends on a `user_id`. Kundali came second because everything downstream of
it (wallet spend tied to a chart, query logging, the future Universal KP
Engine) needs a `kundali_id` to attach to.

### The Lagna calculation, specifically

`src/lib/lagna.ts` is a from-scratch TypeScript port of the closed-form
Ascendant formula (Meeus GMST -> LST/RAMC -> tropical Ascendant -> minus
Lahiri ayanamsa) that the earlier single-file artifact already used. It was
tested against Node directly (not inside the Worker) using the same
verification case documented in Session 5: 08/04/1973, 06:15 UTC, Bhopal
(23.2599N, 77.4126E) -> Mithuna (Gemini). It failed on the first attempt (the
textbook-quoted sign convention was 180 degrees off) and passes after the
fix documented in that file's header comment. If you ever touch this file,
rerun that exact check before trusting the result -- it is cheap (a few
lines in `node`) and this is exactly the kind of formula where a subtle sign
error silently produces a plausible-looking but wrong answer for every chart
except the one you happened to test.

### What `POST /kundali` deliberately does NOT do

- **It does not accept local birth time + timezone name.** It requires
  `birth_datetime_utc` as a UTC ISO-8601 string. Converting local time to UTC
  needs an IANA timezone database with DST history, which the earlier
  research (Session 5) flagged as the single most common real-world bug
  source in these calculations. That conversion is left to the caller
  (frontend) for now, not silently attempted here.
- **It does not compute `janma_nakshatra_idx` server-side.** That needs the
  Moon's sidereal longitude at birth, which needs a real ephemeris library
  (`astronomy-engine` or similar) -- a dependency ARCHITECTURE.md Section 4
  explicitly flags as "not yet added." The endpoint requires the caller to
  supply this value and rejects the request if it's missing, rather than
  guessing or defaulting it.

## What is explicitly NOT implemented yet (do not assume it works)

- **The actual SMS gateway call.** `src/lib/otp.ts` -> `sendOtpViaSmsGateway`
  is a deliberate stub that throws a clear error. No provider has been chosen
  yet (ARCHITECTURE.md open decision #4 is about WhatsApp, but SMS/OTP
  gateway is a separate, also-unmade choice). Requesting an OTP will fail
  until this is wired up with a real provider (MSG91 / Twilio / etc.) and its
  API key set via `wrangler secret put OTP_PROVIDER_API_KEY`.
- Any endpoint beyond auth — kundali CRUD, the Universal KP Engine, wallet
  spend/debit, orders/payments, referrals. None of these exist yet.
- The wallet-ledger expiry sweep (a scheduled Worker/cron that flips
  `status='active'` batches to `'expired'` once past `expires_at`). Right now
  `getSpendableBalance` in `src/lib/wallet.ts` defensively excludes expired
  batches on read, but nothing physically sweeps them yet.
- Rate limiting / anti-scraping (ARCHITECTURE.md Section 8) — not yet added
  to any route.

## Local setup

```
npm install
npm run db:migrate:local   # applies db/schema.sql to a local D1 replica
npm run dev                # wrangler dev, runs the Worker locally
```

Test the auth flow locally:

```
curl -X POST http://localhost:8787/auth/request-otp \
  -H "content-type: application/json" \
  -d '{"phone_number": "9876543210"}'
# will currently return 503 OTP_GATEWAY_NOT_CONFIGURED -- expected, see above
```

### Testing the full flow before a real SMS provider is wired up

`DEV_OTP_BYPASS` in `wrangler.toml` is **off by default** (`"false"`). Flip it
to `"true"` (in a local/dev environment only -- never in a production deploy)
to unblock end-to-end testing of auth -> kundali without a real SMS gateway:

```
curl -X POST http://localhost:8787/auth/request-otp \
  -H "content-type: application/json" \
  -d '{"phone_number": "9876543210"}'
# -> { "status": "otp_sent", "dev_bypass_active": true, "dev_bypass_code": "000000" }

curl -X POST http://localhost:8787/auth/verify-otp \
  -H "content-type: application/json" \
  -d '{"phone_number": "9876543210", "code": "000000", "fingerprint_hash": "test-fingerprint-00000000"}'
# -> { "status": "authenticated", "session_token": "...", ... }
```

It is double-gated (see `src/lib/otp.ts`, `isDevOtpBypassActive`): it only
activates when `DEV_OTP_BYPASS="true"` **and** `ENVIRONMENT` is not
`"production"`. **Set `DEV_OTP_BYPASS` back to `"false"` before the real
launch deploy** -- don't rely on the `ENVIRONMENT` gate alone to keep this off
in production.

## Deploying

```
npm run deploy
```

This deploys against the live `occultviision-db` D1 database and
`occultviision-sessions` KV namespace already provisioned on the account
(bindings are in `wrangler.toml`, already pointed at the real resource IDs
created in Session 5). Do not run this against production data without
testing the auth flow against the local/dev environment first.
