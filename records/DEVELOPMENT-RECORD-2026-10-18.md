# TaraNidhi / OCCULTVIISION — Development & Research Record

**Prepared:** 18 Oct 2026 (IST), from the Claude Code session, its git history, and the working summary of earlier context.
**Client/owner:** Naveen K. Rai, OCCULTVIISION™, Bhopal.
**Scope:** everything Claude did for the TaraNidhi app, its backend, and the Diwali muhurat research, from the start to this point.

## 0. How to read this file — limits

- This is a **structured record**, not a verbatim transcript. The verbatim log for the current Claude Code session is in `records/claude-code-session-cf6129a7-2026-10-18.jsonl` (secrets redacted).
- Work before the current session's log (Oct 4–17) is recorded here from the working summary and from the claude.ai chats. Its verbatim text is **not** in this sandbox. Claude.ai "TaraNidhi project session 3" must be exported separately and added as `records/session3-claude-ai-export.md`.
- Where a fact is not verified, it is marked **[unverified]**.

---

## 1. Systems & where things live

| Item | Value |
|---|---|
| Frontend repo | `TARANIDHIPRO1/Taranidhi` (branch `main`, private) |
| Frontend live | https://taranidhi-pro1.occultviision.workers.dev/ |
| Deploy | GitHub Actions → `wrangler deploy` (static assets, `.assetsignore`), about 1–2 min after push |
| Backend Worker | `occultviision-api` — https://occultviision-api.occultviision.workers.dev |
| D1 database | `occultviision-db`, id `481b2745-1558-4018-925b-4f8dbc62d4d5` |
| Support contact (config) | WhatsApp/phone 919669756111, email info@occultviision.com |
| Old PRIMARY Panchang app | `occultviision-code/occultviision` (V14 single-file PWA) — **not merged**, kept as separate backup |
| Calculation source | astronomy-engine (Sun/Moon positions), Lahiri ayanamsha, sunrise/sunset via SearchRiseSet |

## 2. Timeline of work (git, 18 Oct 2026)

Newest first (from `git log`):

| Commit | What changed |
|---|---|
| a1ea6bd, 854718a | Session record added (tokens redacted) |
| 67d8357 | `docs/`: Google Apps Script, WhatsApp templates, session 3 archive note |
| 0e20691 | Utsav Calendar (`calendar.html`, `tn-calendar.js`), Astrologer & Enquiry page, sidebar shell, Hindi/English toggle, panchang engine |
| f3e1593 | Hora & Uphora: aligned Day/Night tables, expandable Uphora sub-tables, benefic/malefic badges |
| f173e6d | Laptop / Tablet / Mobile view switcher (framed responsive view) |
| 83f353e | Location pages: GPS auto-activates, reverse-geocoded place name, manual city respected |
| 83e8ecc | Kundali delete: inline two-tap confirm, visible messages |
| f04138b | Kundali date entry: fixed doubled separators (`08//04/197` bug) |
| 9209032 | Kundali: explicit DD/MM/YYYY and 12-hour time entry with live confirmation |
| e4e45f2 | Kundali: North & South Indian charts, Gochar (transit) chart and table, Sade Sati status |
| f1ba0b7 | Hora & Uphora full tool; GPS only on location pages; unified nav + logout; duplicate variant pages removed |
| e2650b9 | Today, Moment, Muhurta, Query, My Cosmos connected to live API |
| 534f47c | NOW, Panchang, Hora & Lagna, Star Time live from `/muhurta/now` |
| 0ccc244 | Kundali birth place → coordinates from city (GPS not required) |
| 6a91c6f | Kundali connected to live API; Cloudflare deploy fixed |
| 454ce68 | NOW script error fixed; Advertisement logo overflow on mobile fixed |
| d13ce9b | Removed unnecessary Kundali validation message |

(18 commits in total on `main`.)

## 3. Frontend features status

| Feature | Status |
|---|---|
| Kundali (form, save, list, delete) | Working. Delete bug fixed on frontend; **backend FK bug still open** (see §5) |
| North & South Indian charts, Gochar | Built and rendered. **Chart values of the 1973 test chart not yet verified by Naveen** |
| Hora & Uphora (Day/Night tables) | Built; Uphora = 7 equal sub-periods, Chaldean sub-lords from hora lord |
| NOW / Panchang / Star Time / Hora & Lagna | Live from `/muhurta/now` |
| Utsav Calendar | Built, local test passed. Festivals from engine: Durga Ashtami 18 Oct 2026 (Ashtami from 08:29 IST) |
| Traditional vs TaraNidhi comparison | Built; needs login and `/muhurta/scan` |
| Astrologer & Enquiry | Built; form posts to `/public/contact` (D1). Google Sheet not connected |
| Sidebar (Theme, Language, Device view, Account, Support) | Built; social/YouTube links appear only when set in config |
| Language Hindi/English | UI labels and astro names only; backend sentences English |
| Advertisement, About, Offers | **Old versions; not developed** |
| Festival banner on NOW/Today/Panchang | **Not built** |
| Diwali purchase muhurat (property, gold, vehicle, new/used car) | **Not built**. See §4 |

## 4. Research record

### 4.1 Diwali purchase muhurat (17 Oct, session 3, turns 1985–1990)
- A chat produced a nested category tree: Property (Flat, Duplex, Farm House, Bungalow, Mansion, Raw Land, Commercial), Vehicle (New/Used Car, Bike, Commercial, Fleet), Gold/Precious, Business, Family (Child Birth Planning, Marriage, Griha Pravesh, Namakarana, Annaprashana, Upanayana, Engagement, Adoption, Separation filing), Education, Legal, Health, Travel.
- **Warning:** the thresholds (e.g. Gold 70+, Property 80+) and planet lists in that chat are **not from a classical source and not computed by the engine**. Tarabala is the 9-tara cycle (Janma → Ati-Mitra), not a 0–100 score. Treat as placeholders.
- Errors in that chat: "Oct 18 = Friday" (it is **Sunday**); Ganda Moola/Ekadashi dates were not computed.
- No procedure for vehicle inspection or second-hand purchase was found in that chat.

### 4.2 Research ZIP — `Taranidhi-main3.zip` (memory note, 18 Oct)
- Reported to contain `MUHURTA_PROFESSIONAL_SPECIFICATION.md` (7 categories: Sampatti, Vyapar, Dhan, Career, Vivah, Samjhauta, Chikitsa; dual-layer score Universal 40% + Personal 60%), `CORRECTED_COMMERCIAL_MUHURTA_2026-10-12.js`, `MUHURAT_COMPLETE_FORMULAS_AND_CALCULATIONS.md`, `KP249_HORA_UPHORA_PANCHA_PAKSHI_TEST.md`, `CLASSICAL_RULES_EXTRACTED_2026-10-12.md`, `FACT_CHECK_ENGINE.md`.
- **Status: not in this sandbox, not in the repo.** These must be attached by Naveen. Claims of "verified" in the memory note are **[unverified]** until read.

### 4.3 Classical sources cited in earlier sessions
- Muhurta Chintamani (Ram Daivagya, c. 1600), Dharmasindhu, Hora Ratna, BPHS, Phaladeepika, B.V. Raman's muhurta writing, K.N. Rao's KP texts (source citations as stated in chats; not re-verified here).

### 4.4 Engine verification done in this session
- Sun, Moon, sunrise, sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit, Choghadiya compared with backend output; festival dates (23) checked.
- Known difference: a regional panchang can differ by one day for tithi-based festivals.

## 5. Open bugs & decisions

| # | Item | Owner |
|---|---|---|
| 1 | DELETE `/kundali/{id}` fails on FK when `query_logs` / `kp_queries` reference it. Fix belongs in the Worker (null `query_logs.kundali_id`, delete `kp_queries`). Source repo for the Worker not available here. | Backend |
| 2 | OTP dev bypass `000000` still active. Disable before launch. | Backend |
| 3 | Live Panchang "incomplete" complaint (Naveen, 18 Oct) — specific gaps not yet listed by him | Naveen to list |
| 4 | Architecture decisions D1–D12 pending Naveen sign-off (memory, 13 Oct) | Naveen |
| 5 | Google Sheet / Apps Script URL not set | Naveen |
| 6 | WhatsApp/SMS/Email provider keys | Naveen |
| 7 | Payment gateway (Razorpay) — not connected | Naveen |
| 8 | Social & YouTube URLs | Naveen |
| 9 | Festival banner on NOW/Today/Panchang | Claude (next) |
| 10 | Advertisement, About, Offers pages | Claude (after Naveen confirms content) |
| 11 | Diwali purchase muhurat section | Waiting for research file (§4.2) |

## 6. Security — action required

Plaintext API tokens were pasted in earlier chats and tool calls (Cloudflare and a GitHub personal access token). The copies in `records/` and in the repo are redacted, but **the original chats still contain them**.
**Rotate:** the Cloudflare API tokens and the GitHub token. Create new ones, then delete the old ones.

## 7. Mistakes Claude made (for the record)

- Gave wrong "live" links early (numerology app vs Panchang); deploy confusion between Pages and Workers.
- Stated "Diwali research not found" for an earlier, narrower search than the full chat.
- Several muhurat thresholds were presented as if authoritative; they are placeholders.
- A UI claim that all pages were live was made before every page was tested.
- Documentation claimed "Ready to ship" while blockers (D1–D12, bugs, credentials) were open.

## 8. Next steps (in order)

1. Attach `Taranidhi-main3.zip` → Claude reads, extracts rules, adds `research/` in repo.
2. Export session 3 from claude.ai → `records/session3-claude-ai-export.md`.
3. Naveen lists the Live Panchang gaps.
4. Claude builds festival banner, then Advertisement / About / Offers.
5. Diwali purchase muhurat built only from verified rules, with source per rule.
6. Rotate tokens (§6).
