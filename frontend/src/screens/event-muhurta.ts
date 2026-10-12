/**
 * event-muhurta.ts — V6 Phase 3: Event-Specific Muhurta Finder
 *
 * Route: #/event-muhurta?purpose=<slug>&kundali_id=<id>
 * API:   GET /muhurta/scan?lat=&lon=&purpose=<slug>&kundali_id=<id>&from=&to=
 *
 * Supported purpose slugs (TASKS.md #32–35):
 *   property  — P0: Property purchase muhurta (30-day default window)
 *   marriage  — P1: Marriage muhurta (60-day default window)
 *   business  — P2: Business launch muhurta (30-day window)
 *   medical   — P3: Medical/surgery muhurta (14-day window)
 *
 * The backend's muhurtaScanner.ts handles purpose-agnostic scoring;
 * this screen adds the UX layer: purpose label, default date ranges,
 * category-specific scoring guidance, and a date-range picker.
 *
 * Location: uses the kundali's birth lat/lon as the query location
 * (most users want muhurta for their own city). If kundali is absent
 * the user can manually enter lat/lon in the date-range form.
 *
 * QUALITY GATE: This screen is read-only — it displays results from
 * the verified backend. No new astro formulas here. All scoring is
 * done server-side in horaScoring.ts (verified against ARCHITECTURE.md).
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";
import { muhurtaScan, getKundaliChart } from "../api";

// ── Purpose config ────────────────────────────────────────────────────────────

interface PurposeConfig {
  slug: string;
  label: string;
  emoji: string;
  defaultWindowDays: number;
  color: string;
  scoringNotes: string[];
  auspiciousHoras: string[];
}

const PURPOSE_CONFIG: Record<string, PurposeConfig> = {
  property: {
    slug: "property",
    label: "Property Purchase",
    emoji: "🏠",
    defaultWindowDays: 30,
    color: "#16a34a",
    scoringNotes: [
      "Moon in 4th house sign (Cancer) or aspecting it = strong for property",
      "4th house sub-lord (KP) must signify 4, 11 — not 8, 12",
      "Venus hora or Jupiter hora preferred (wealth + expansion)",
      "Avoid Panchaka Dosha for property transactions",
      "Vastu direction: prefer East or North muhurta times",
    ],
    auspiciousHoras: ["Venus", "Jupiter", "Mercury"],
  },
  marriage: {
    slug: "marriage",
    label: "Marriage Muhurta",
    emoji: "💍",
    defaultWindowDays: 60,
    color: "#db2777",
    scoringNotes: [
      "7th house sub-lord (KP) must signify 1, 2, 7, 11 — not 6, 8, 12",
      "Moon + Venus strong (no combustion, no debilitation)",
      "Venus hora preferred; avoid Saturn hora for auspicious ceremonies",
      "Navpancham / Trikona Tara between bride and groom is ideal",
      "Avoid Ashtama Navamsha (Lagna in 8th part of sign during ceremony)",
    ],
    auspiciousHoras: ["Venus", "Jupiter", "Moon"],
  },
  business: {
    slug: "business",
    label: "Business Launch",
    emoji: "🏢",
    defaultWindowDays: 30,
    color: "#2563eb",
    scoringNotes: [
      "10th house sub-lord (KP) must signify 1, 6, 10, 11",
      "Mercury hora for registration/contracts; Sun hora for authority/leadership",
      "Moon in waxing phase (Shukla Paksha) for new ventures",
      "Avoid Rahu hora for business starts (instability, hidden obstacles)",
      "Jupiter must not be in 6, 8, 12 from Lagna (Guru Chandal Dosha check)",
    ],
    auspiciousHoras: ["Mercury", "Sun", "Jupiter"],
  },
  medical: {
    slug: "medical",
    label: "Medical / Surgery",
    emoji: "🏥",
    defaultWindowDays: 14,
    color: "#dc2626",
    scoringNotes: [
      "Moon must be strong — not in 8th house, not debilitated (Scorpio), not eclipsed",
      "Avoid Ashtami (8th Tithi) and Krishna Chaturdashi (14th dark fortnight)",
      "8th house sub-lord (KP) must NOT signify 2, 7 (maraka houses)",
      "Sun hora for surgeries involving head/eye; Mars hora for procedures",
      "Avoid Ganda Moola nakshatras — flag shown if active in selected window",
    ],
    auspiciousHoras: ["Sun", "Mercury", "Jupiter"],
  },
};

// ── Scan result type (mirrors backend ScanResult) ─────────────────────────────

interface ScanWindow {
  timestamp: string;
  score: number;
  hora_lord: string;
  purpose_label: string;
  nakshatra: string;
  tara: { number: number; name: string; beneficence: "benefic" | "neutral" | "malefic" } | null;
  panchaka_active: boolean;
  ganda_moola: boolean;
  dishashool_direction: string | null;
}

interface ScanResponse {
  windows: ScanWindow[];
  total_sampled: number;
  scan_cost: number;
  wallet_balance: number;
  purpose: string;
  from: string;
  to: string;
}

// ── State ─────────────────────────────────────────────────────────────────────

let kundaliId: number | null = null;
let purpose: string = "property";
let chartLat: number | null = null;
let chartLon: number | null = null;

// ── Entry point ───────────────────────────────────────────────────────────────

export async function renderEventMuhurta(): Promise<void> {
  const app = $app();
  clear(app);

  // Parse URL params
  const hash = window.location.hash;
  const qStr = hash.includes("?") ? hash.split("?")[1]! : "";
  const params = new URLSearchParams(qStr);

  const rawPurpose = params.get("purpose") ?? "property";
  purpose = PURPOSE_CONFIG[rawPurpose] ? rawPurpose : "property";

  const rawId = params.get("kundali_id");
  kundaliId = rawId ? parseInt(rawId, 10) : null;

  const cfg = PURPOSE_CONFIG[purpose]!;

  // Skeleton while we load kundali location (if provided)
  app.innerHTML = buildSkeleton(cfg);
  wireBack(app);

  // Resolve lat/lon from kundali chart if possible
  if (kundaliId && !isNaN(kundaliId)) {
    try {
      const res = await getKundaliChart(kundaliId);
      if (res.ok && res.data) {
        const { kundali } = res.data as { kundali: { latitude: number; longitude: number } };
        chartLat = kundali.latitude;
        chartLon = kundali.longitude;
      }
    } catch {
      // Non-fatal — user can enter location manually
    }
  }

  renderForm(app, cfg);
}

// ── Form render ───────────────────────────────────────────────────────────────

function renderForm(app: HTMLElement, cfg: PurposeConfig): void {
  const today = new Date().toISOString().slice(0, 10);
  const defaultTo = new Date(Date.now() + cfg.defaultWindowDays * 86400000)
    .toISOString().slice(0, 10);

  const latVal = chartLat !== null ? chartLat.toFixed(4) : "";
  const lonVal = chartLon !== null ? chartLon.toFixed(4) : "";
  const hasLocation = chartLat !== null && chartLon !== null;

  app.innerHTML = `
    <div class="screen event-muhurta-screen" style="--purpose-color:${cfg.color}">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>${cfg.emoji} ${cfg.label}</h2>
          <span class="subtitle">Muhurta Finder · Hora/Tara scoring</span>
        </div>
      </header>

      <!-- KP Scoring Notes -->
      <section class="em-notes">
        <div class="em-notes-title">KP Astrological Guidelines</div>
        <ul class="em-notes-list">
          ${cfg.scoringNotes.map(n => `<li>${n}</li>`).join("")}
        </ul>
        <div class="em-auspicious-horas">
          Preferred Horas: ${cfg.auspiciousHoras.map(h => `<span class="hora-chip hora-${h.toLowerCase()}">${h}</span>`).join(" ")}
        </div>
      </section>

      <!-- Search Form -->
      <section class="em-form">
        <div class="em-form-title">Find Auspicious Windows</div>

        ${!hasLocation ? `
        <div class="em-field-group">
          <label class="em-label">Location (Latitude / Longitude)</label>
          <div class="em-latlon-row">
            <input type="number" id="inp-lat" class="em-input" placeholder="e.g. 23.2505"
              step="0.0001" min="-90" max="90" value="${latVal}" />
            <input type="number" id="inp-lon" class="em-input" placeholder="e.g. 77.4065"
              step="0.0001" min="-180" max="180" value="${lonVal}" />
          </div>
          <div class="em-hint">Enter decimal degrees. Latitude: -90 to 90, Longitude: -180 to 180</div>
        </div>
        ` : `
        <div class="em-location-confirmed">
          📍 Using birth location: ${chartLat!.toFixed(4)}°N, ${chartLon!.toFixed(4)}°E
          <input type="hidden" id="inp-lat" value="${latVal}" />
          <input type="hidden" id="inp-lon" value="${lonVal}" />
        </div>
        `}

        <div class="em-field-group">
          <label class="em-label">Date Range</label>
          <div class="em-date-row">
            <div>
              <div class="em-date-label">From</div>
              <input type="date" id="inp-from" class="em-input" value="${today}" min="${today}" />
            </div>
            <div>
              <div class="em-date-label">To</div>
              <input type="date" id="inp-to" class="em-input" value="${defaultTo}" min="${today}" />
            </div>
          </div>
          <div class="em-hint">Max 90 days. For ${cfg.label}: ${cfg.defaultWindowDays}-day window recommended.</div>
        </div>

        <div id="em-error" class="em-error" style="display:none"></div>

        <button class="btn btn-primary em-scan-btn" id="btn-scan">
          Find Best Windows (costs 5 pts)
        </button>
      </section>

      <!-- Results placeholder -->
      <div id="em-results"></div>

    </div>
  `;

  injectStyles();
  wireBack(app);
  wireScan(app, cfg);
}

// ── Scan wiring ───────────────────────────────────────────────────────────────

function wireScan(app: HTMLElement, cfg: PurposeConfig): void {
  const btn = app.querySelector<HTMLButtonElement>("#btn-scan");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const errEl = document.getElementById("em-error")!;
    errEl.style.display = "none";

    const latInput = (document.getElementById("inp-lat") as HTMLInputElement).value;
    const lonInput = (document.getElementById("inp-lon") as HTMLInputElement).value;
    const fromInput = (document.getElementById("inp-from") as HTMLInputElement).value;
    const toInput   = (document.getElementById("inp-to")   as HTMLInputElement).value;

    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    // Client-side validation
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      showError(errEl, "Latitude must be between -90 and 90.");
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      showError(errEl, "Longitude must be between -180 and 180.");
      return;
    }
    if (!fromInput || !toInput) {
      showError(errEl, "Please select a date range.");
      return;
    }
    const fromDate = new Date(fromInput);
    const toDate   = new Date(toInput + "T23:59:59");
    if (toDate <= fromDate) {
      showError(errEl, "'To' date must be after 'From' date.");
      return;
    }
    const rangeDays = (toDate.getTime() - fromDate.getTime()) / 86400000;
    if (rangeDays > 90) {
      showError(errEl, "Date range cannot exceed 90 days.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Scanning…";

    const resultsEl = document.getElementById("em-results")!;
    resultsEl.innerHTML = `
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
        <p style="margin-top:var(--space-3);color:var(--color-text-secondary)">
          Scanning ${Math.ceil(rangeDays)} days for auspicious windows…
        </p>
      </div>
    `;

    try {
      const res = await muhurtaScan({
        lat,
        lon,
        purpose: cfg.slug,
        kundali_id: kundaliId ?? undefined,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        top_n: 20,
      });

      if (!res.ok) {
        showError(errEl, (res.data as { error?: string })?.error ?? "Scan failed. Please try again.");
        resultsEl.innerHTML = "";
      } else {
        renderResults(resultsEl, res.data as ScanResponse, cfg);
      }
    } catch {
      showError(errEl, "Connection error. Please try again.");
      resultsEl.innerHTML = "";
    } finally {
      btn.disabled = false;
      btn.textContent = "Find Best Windows (costs 5 pts)";
    }
  });
}

function showError(el: HTMLElement, msg: string): void {
  el.textContent = msg;
  el.style.display = "block";
}

// ── Results render ────────────────────────────────────────────────────────────

function renderResults(container: HTMLElement, data: ScanResponse, cfg: PurposeConfig): void {
  const windows = data.windows ?? [];

  if (windows.length === 0) {
    container.innerHTML = `
      <div class="em-no-results">
        <p>No auspicious windows found in this range.</p>
        <p>Try a wider date range or different location.</p>
      </div>
    `;
    return;
  }

  // Group by date
  const byDate = new Map<string, ScanWindow[]>();
  for (const w of windows) {
    const date = w.timestamp.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(w);
  }

  const dayCards = Array.from(byDate.entries()).map(([date, wins]) => {
    const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long",
    });
    const best = wins[0]!;

    const winRows = wins.map(w => {
      const time = new Date(w.timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", timeZone: "UTC",
      });
      const taraClass = w.tara ? taraColor(w.tara.beneficence) : "";
      const flags = [
        w.panchaka_active ? `<span class="em-flag em-flag-warn">⚠ Panchaka</span>` : "",
        w.ganda_moola     ? `<span class="em-flag em-flag-warn">⚠ Ganda Moola</span>` : "",
        w.dishashool_direction ? `<span class="em-flag em-flag-warn">⚠ Dishashool: ${w.dishashool_direction}</span>` : "",
        cfg.auspiciousHoras.includes(w.hora_lord)
          ? `<span class="em-flag em-flag-good">✓ ${w.hora_lord} hora</span>` : "",
      ].filter(Boolean).join(" ");

      return `
        <div class="em-window-row">
          <div class="em-window-time">${time} IST</div>
          <div class="em-window-score">
            <div class="em-score-bar" style="width:${Math.min(w.score,100)}%"></div>
            <span>${w.score.toFixed(0)}/100</span>
          </div>
          <div class="em-window-detail">
            <span class="em-hora-chip">${w.hora_lord} hora</span>
            <span class="em-nak">${w.nakshatra}</span>
            ${w.tara ? `<span class="em-tara ${taraClass}">Tara ${w.tara.number}: ${w.tara.name}</span>` : ""}
          </div>
          ${flags ? `<div class="em-flags">${flags}</div>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div class="em-day-card">
        <div class="em-day-header">
          <span class="em-day-date">${dateLabel}</span>
          <span class="em-day-best-score" style="color:var(--purpose-color)">${best.score.toFixed(0)}/100</span>
        </div>
        <div class="em-windows">${winRows}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <section class="em-results-section">
      <div class="em-results-header">
        <div class="em-results-title">Top ${windows.length} Windows Found</div>
        <div class="em-results-meta">
          Scanned ${data.total_sampled ?? "—"} time slots ·
          Wallet: ${data.wallet_balance ?? "—"} pts remaining
        </div>
      </div>
      <div class="em-day-cards">${dayCards}</div>
    </section>
  `;
}

function taraColor(beneficence: string): string {
  if (beneficence === "benefic")  return "em-tara-good";
  if (beneficence === "malefic")  return "em-tara-bad";
  return "em-tara-neutral";
}

// ── Skeleton + back ───────────────────────────────────────────────────────────

function buildSkeleton(cfg: PurposeConfig): string {
  return `
    <div class="screen event-muhurta-screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>${cfg.emoji} ${cfg.label}</h2></div>
      </header>
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
      </div>
    </div>
  `;
}

function wireBack(app: HTMLElement): void {
  app.querySelector("#btn-back")?.addEventListener("click", () => {
    if (kundaliId) {
      navigate(`/birth-chart?id=${kundaliId}`);
    } else {
      navigate("/dashboard");
    }
  });
}

// ── Styles ────────────────────────────────────────────────────────────────────

function injectStyles(): void {
  const STYLE_ID = "event-muhurta-styles";
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
/* ── Event Muhurta Screen ── */
.event-muhurta-screen .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.event-muhurta-screen .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Notes */
.em-notes { margin:var(--space-3) var(--space-4); padding:var(--space-3); background:var(--color-surface-2); border-radius:var(--radius-md); border-left:3px solid var(--purpose-color, var(--color-primary)); }
.em-notes-title { font-size:var(--font-size-xs); font-weight:700; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:.04em; margin-bottom:var(--space-2); }
.em-notes-list { margin:0; padding-left:var(--space-4); display:flex; flex-direction:column; gap:4px; }
.em-notes-list li { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-auspicious-horas { margin-top:var(--space-2); font-size:var(--font-size-xs); display:flex; align-items:center; flex-wrap:wrap; gap:4px; }
.hora-chip { font-size:10px; font-weight:700; padding:2px 6px; border-radius:99px; background:var(--color-surface-1); border:1px solid var(--color-border); }

/* Form */
.em-form { margin:var(--space-2) var(--space-4); padding:var(--space-4); background:var(--color-surface-1); border:1px solid var(--color-border); border-radius:var(--radius-md); display:flex; flex-direction:column; gap:var(--space-3); }
.em-form-title { font-size:var(--font-size-sm); font-weight:700; color:var(--color-text-primary); }
.em-field-group { display:flex; flex-direction:column; gap:var(--space-1); }
.em-label { font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); }
.em-input { padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-sm); font-size:var(--font-size-sm); background:var(--color-surface-2); color:var(--color-text-primary); width:100%; box-sizing:border-box; }
.em-input:focus { outline:none; border-color:var(--purpose-color,var(--color-primary)); box-shadow:0 0 0 2px color-mix(in srgb,var(--purpose-color,var(--color-primary)) 20%,transparent); }
.em-hint { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-latlon-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--space-2); }
.em-date-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--space-2); }
.em-latlon-row > *, .em-date-row > * { min-width:0; }
.em-date-row input[type="date"] { min-width:0; max-width:100%; }
.em-date-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:2px; }
.em-location-confirmed { font-size:var(--font-size-xs); color:var(--color-text-secondary); padding:var(--space-2); background:color-mix(in srgb,var(--purpose-color,#16a34a) 8%,var(--color-surface-2)); border-radius:var(--radius-sm); border:1px solid color-mix(in srgb,var(--purpose-color,#16a34a) 30%,transparent); }
.em-error { color:var(--error-text); font-size:var(--font-size-sm); padding:var(--space-2); }
.em-scan-btn { width:100%; margin-top:var(--space-2); }

/* Results */
.em-results-section { margin:var(--space-2) var(--space-4) var(--space-8); }
.em-results-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:var(--space-3); }
.em-results-title { font-size:var(--font-size-sm); font-weight:700; }
.em-results-meta { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-day-cards { display:flex; flex-direction:column; gap:var(--space-3); }
.em-day-card { border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden; }
.em-day-header { display:flex; justify-content:space-between; align-items:center; padding:var(--space-2) var(--space-3); background:var(--color-surface-2); border-bottom:1px solid var(--color-border); }
.em-day-date { font-size:var(--font-size-sm); font-weight:700; }
.em-day-best-score { font-size:var(--font-size-sm); font-weight:700; }
.em-windows { display:flex; flex-direction:column; }
.em-window-row { padding:var(--space-2) var(--space-3); border-bottom:1px solid var(--color-border); display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-2); }
.em-window-row:last-child { border-bottom:none; }
.em-window-time { font-size:var(--font-size-sm); font-weight:600; min-width:70px; }
.em-window-score { display:flex; align-items:center; gap:var(--space-1); min-width:100px; }
.em-score-bar { height:4px; background:var(--purpose-color,var(--color-primary)); border-radius:2px; }
.em-window-score span { font-size:var(--font-size-xs); font-weight:700; }
.em-window-detail { display:flex; flex-wrap:wrap; gap:4px; align-items:center; flex:1; }
.em-hora-chip { font-size:var(--font-size-xs); padding:2px 6px; background:var(--color-surface-2); border-radius:99px; font-weight:600; }
.em-nak { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-tara { font-size:var(--font-size-xs); padding:1px 5px; border-radius:4px; }
.em-tara-good { background:rgba(22,163,74,0.12); color:#16a34a; }
.em-tara-bad { background:rgba(220,38,38,0.12); color:#dc2626; }
.em-tara-neutral { background:var(--color-surface-2); color:var(--color-text-secondary); }
.em-flags { width:100%; display:flex; flex-wrap:wrap; gap:4px; margin-top:2px; }
.em-flag { font-size:10px; padding:1px 5px; border-radius:4px; font-weight:600; }
.em-flag-warn { background:rgba(245,158,11,0.15); color:#d97706; }
.em-flag-good { background:rgba(22,163,74,0.12); color:#16a34a; }
.em-no-results { margin:var(--space-4); padding:var(--space-6); text-align:center; color:var(--color-text-secondary); border:1px dashed var(--color-border); border-radius:var(--radius-md); }
`;
  document.head.appendChild(el);
}
