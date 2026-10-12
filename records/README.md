# Development records (archive)

Saved on 2026-10-13 at Naveen K. Rai's request, so the design and concept history is kept in git.
Nothing here is code. Files are copied byte-for-byte from the uploads; checksums are in `UPLOADS_MANIFEST.tsv`.

## Concept of record (Kaalchakra Pro / TaraNidhi engine)

| File | What it is | Status |
|---|---|---|
| `concept-v15/kaalchakra_v15.html` | Single-file engine, v15 (latest). Astronomy, panchang, hora/uphora, scoring, dasha, numerology, licence | Concept of record (proposed, awaiting confirmation) |
| `concept-v15/KAALCHAKRA_CORE_ARCHITECTURE_v15.pdf` | Written spec for v15 (Hindi-English), with formulas and a review table | Concept of record (proposed) |
| `concept-v15/kaalchakra_v14-2.html` | Previous engine version | Older |
| `concept-v15/kaalchakra_v8-1_superseded.html` | "Kaalchakra Pro v5" (Maitri / Navtara model) | Superseded |

## UI/UX (TaraNidhi)

| File | What it is |
|---|---|
| `uiux-2026-10/TaraNidhi_UIUX_Master_Prototype_6_Pages.html` | Six-page visual prototype (NOW, STAR TIME, MOMENT, TODAY, MY COSMOS, NUMBERS). Most values are marked sample data. Contains one embedded PNG. |
| `uiux-2026-10/TaraNidhi_FINAL_Page_Design_Script.pdf` | Image-prompt script for the six page backgrounds (1080×2340, no text, no UI) |

## Architecture and roadmap

| File | What it is |
|---|---|
| `architecture-2026-10/TaraNidhi_App_Architecture_v18_to_v2.pdf` | Feature audit (v18 current, v2.0 target). Self-reported 31/56 features done. Lists accuracy gaps. |

## Index of all uploads

`UPLOADS_MANIFEST.tsv` lists all 188 files in the upload folder with SHA-256 and size. Most are images and duplicate attachments, and they are not committed here, to keep the repo small. Ask and any of them can be added.

## Conflicts noted while archiving (for review, not resolved here)

- The v15 engine uses whole-sign houses and has no KP sub-lords. The repo's engine uses Placidus cusps and KP sub-lords.
- Rahu Kaal part indexing differs: the v15 HTML gives Sunday's 7th part, while the repo gives the 8th part.
- Golden-window threshold: v15 uses 72; the v2.0 architecture says ≥75%.
- Pricing: the architecture's tiers (₹299 / ₹799 / ₹1,499 / ₹4,999) differ from the v15 licence keys (1M / 1Y / 3Y / Lifetime / Enterprise).
- The architecture says the chart uses hardcoded approximations ("Swiss Ephemeris not used"), while v15 uses astronomy-engine.
- The architecture's live URL (`shy-wave-e59f.occultviision.workers.dev`) differs from the repo's Worker name.
