/**
 * muhurta-dashboard.ts — V6 Phase 2 Muhurta Dashboard
 *
 * Route: #/muhurta-dashboard?kundali_id=<id>
 * API:   GET /muhurta/now?lat=<lat>&lon=<lon>&kundali_id=<id>&purpose=<slug>
 *
 * Sections:
 *  1. Live header bar — current IST time + auto-refresh countdown
 *  2. Hora / Uphora cards — lord, window start→end, daytime/night badge
 *  3. Pancha Pakshi — bird, confidence, favorability score, precision
 *  4. Rahu Kaal — active or next window indicator
 *  5. Personalized Tara — Janma Nak → current Nak → tara number + name (colour-coded)
 *  6. Panchaka Dosha / Ganda Moola / Dishashool — warning flags
 *  7. Venus + Jupiter combustion warnings
 *  8. Convergence score — 0-100 bar with layer breakdown (score.layers)
 *  9. Event suitability — Property | Marriage | Business | Medical ratings
 * 10. Nakshatra — current transit nakshatra
 *
 * Auto-refreshes every 60 seconds (Hora windows change on the hour / sub-hour).
 * Geolocation via browser navigator.geolocation. Falls back to Bhopal default.
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { getMuhurtaNow } from "../api";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_LAT = 23.2505; // Bhopal
const DEFAULT_LON = 77.4065;
const REFRESH_SECONDS = 60;

// Event purposes for the event suitability grid
const EVENT_PURPOSES = [
  { slug: "property",    label: "Property",  icon: "🏠", priority: "P0" },
  { slug: "marriage",    label: "Marriage",  icon: "💍", priority: "P1" },
  { slug: "business",    label: "Business",  icon: "📈", priority: "P2" },
  { slug: "medical",     label: "Medical",   icon: "🏥", priority: "P3" },
] as const;

// Hora lords → CSS class for colour-coding
const HORA_LORD_CLASS: Record<string, string> = {
  Sun:     "hora-sun",
  Moon:    "hora-moon",
  Mars:    "hora-mars",
  Mercury: "hora-mercury",
  Jupiter: "hora-jupiter",
  Venus:   "hora-venus",
  Saturn:  "hora-saturn",
};

// Tara names (1-indexed: tara.number 1-9)
const TARA_NAMES = [
  "", // placeholder — tara.number starts at 1
  "Janma",        // 1
  "Sampat",       // 2
  "Vipat",        // 3
  "Kshema",       // 4
  "Pratyak",      // 5
  "Sadhana",      // 6
  "Naidhana",     // 7
  "Mitra",        // 8
  "Param Mitra",  // 9
];

// ── Type definitions (matching /muhurta/now response) ─────────────────────────

interface HoraWindow {
  lord: string;
  start: string;
  end: string;
  is_daytime: boolean;
}

interface UphloraWindow {
  sub: string;
  start: string;
  end: string;
}

interface TaraResult {
  number: number;
  name: string;
  beneficence: "benefic" | "neutral" | "malefic";
}

interface ScoreLayer {
  name: string;
  score: number;
  weight: number;
  reason?: string;
}

interface ScoreResult {
  score: number;
  grade: string;
  layers?: ScoreLayer[];
  warnings?: string[];
  summary?: string;
}

interface PanchaPakshi {
  bird: string;
  confidence: number;
  cycle_start: string;
  cycle_end: string;
  precision_minutes: number;
  favorability_score: number;
}

interface MuhurtaResponse {
  as_of: string;
  location: { lat: number; lon: number };
  sunrise: string;
  sunset: string;
  active_hora: HoraWindow | null;
  active_uphora: UphloraWindow | null;
  pancha_pakshi: PanchaPakshi | null;
  rahu_kaal: { start: string; end: string; active_now: boolean };
  current_nakshatra: { idx: number; name: string };
  tara: TaraResult | null;
  panchaka_dosha: { active: boolean; dosha?: string; note?: string } | null;
  ganda_moola: { active: boolean; nakshatra?: string } | null;
  dishashool: { active: boolean; direction?: string } | null;
  combustion: {
    venus: { combust: boolean; orb?: number } | null;
    jupiter: { combust: boolean; orb?: number } | null;
  };
  score: ScoreResult | null;
  personalized: boolean;
}

// ── Formatting helpers ─────────────────────────────────────────────────────────

function toIST(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function toISTFull(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function scoreGrade(score: number): { cls: string; label: string } {
  if (score >= 80) return { cls: "grade-a", label: "Excellent" };
  if (score >= 65) return { cls: "grade-b", label: "Good" };
  if (score >= 50) return { cls: "grade-c", label: "Moderate" };
  if (score >= 35) return { cls: "grade-d", label: "Weak" };
  return { cls: "grade-f", label: "Avoid" };
}

function taraClass(beneficence: string): string {
  if (beneficence === "benefic") return "tara-good";
  if (beneficence === "malefic") return "tara-bad";
  return "tara-neutral";
}

// ── State ─────────────────────────────────────────────────────────────────────

let kundaliId: number | undefined;
let lat = DEFAULT_LAT;
let lon = DEFAULT_LON;
let locationLabel = "Bhopal (default)";
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let secondsLeft = REFRESH_SECONDS;

// ── Main render ───────────────────────────────────────────────────────────────

export async function renderMuhurtaDashboard(): Promise<void> {
  const app = $app();
  clear(app);

  // Parse kundali_id from hash
  const hash = window.location.hash;
  const qStr = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(qStr);
  const rawId = params.get("kundali_id");
  kundaliId = rawId ? parseInt(rawId, 10) : undefined;

  // Show skeleton immediately
  app.innerHTML = buildSkeleton(kundaliId);
  wireNavigation(app);

  // Request geolocation, then load
  try {
    await resolveLocation();
  } catch {
    // defaulted to Bhopal — continue
  }

  await loadAndRender(app);
  startTimers(app);
}

function buildSkeleton(kid?: number): string {
  return `
    <div class="screen muhurta-dashboard">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Muhurta Dashboard</h2>
          <span class="subtitle" id="location-label">Detecting location…</span>
        </div>
        <div class="header-right">
          <span class="refresh-badge" id="refresh-badge">⏱ ${REFRESH_SECONDS}s</span>
          ${kid ? `<button class="btn btn-small btn-ghost" id="btn-chart">Chart</button>` : ""}
        </div>
      </header>
      <div id="dashboard-body" style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `;
}

function wireNavigation(app: HTMLElement): void {
  app.querySelector("#btn-back")?.addEventListener("click", () => {
    clearTimers();
    navigate(kundaliId ? `/birth-chart?id=${kundaliId}` : "/dashboard");
  });
  app.querySelector("#btn-chart")?.addEventListener("click", () => {
    clearTimers();
    navigate(`/birth-chart?id=${kundaliId}`);
  });
}

// ── Location resolution ───────────────────────────────────────────────────────

async function resolveLocation(): Promise<void> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      locationLabel = "Bhopal (geoloc unavailable)";
      resolve();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        locationLabel = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
        resolve();
      },
      () => {
        locationLabel = "Bhopal (location denied)";
        resolve();
      },
      { timeout: 5000 }
    );
  });
}

// ── Data fetch + render ───────────────────────────────────────────────────────

async function loadAndRender(app: HTMLElement): Promise<void> {
  const body = app.querySelector<HTMLElement>("#dashboard-body");
  const locEl = app.querySelector<HTMLElement>("#location-label");
  if (locEl) locEl.textContent = locationLabel;

  if (!body) return;

  try {
    const res = await getMuhurtaNow(lat, lon, "general", kundaliId);
    if (!res.ok || !res.data) {
      body.innerHTML = errorCard(res.data?.error ?? "Failed to load muhurta data");
      return;
    }

    const d = res.data as MuhurtaResponse;

    // Fetch all 4 event scores in parallel (best-effort: non-critical)
    let eventScores: Record<string, number | null> = {};
    try {
      const eventResults = await Promise.allSettled(
        EVENT_PURPOSES.map(e =>
          getMuhurtaNow(lat, lon, e.slug, kundaliId)
            .then(r => ({ slug: e.slug, score: (r.data?.score?.score as number) ?? null }))
        )
      );
      for (const r of eventResults) {
        if (r.status === "fulfilled") eventScores[r.value.slug] = r.value.score;
      }
    } catch {
      // event scores optional — skip
    }

    body.innerHTML = buildDashboard(d, eventScores);
    secondsLeft = REFRESH_SECONDS;

  } catch (err) {
    console.error("[muhurta-dashboard] load error:", err);
    body.innerHTML = errorCard("Connection error. Will retry automatically.");
  }
}

// ── Dashboard HTML builder ────────────────────────────────────────────────────

function buildDashboard(d: MuhurtaResponse, eventScores: Record<string, number | null>): string {
  const sections: string[] = [];

  // 1. Timestamp
  sections.push(`
    <div class="md-timestamp">
      <span>As of <strong>${toISTFull(d.as_of)}</strong> IST</span>
      <span class="md-personalized-badge">${d.personalized ? "🔮 Personalized" : "🌐 Generic"}</span>
    </div>
  `);

  // 2. Hora + Uphora
  sections.push(buildHoraSection(d));

  // 3. Pancha Pakshi
  if (d.pancha_pakshi) sections.push(buildPakshiSection(d.pancha_pakshi));

  // 4. Rahu Kaal
  sections.push(buildRahuKaalSection(d));

  // 5. Current Nakshatra + Tara
  sections.push(buildNakshatraTaraSection(d));

  // 6. Combustion + doshas
  sections.push(buildWarningsSection(d));

  // 7. Convergence score
  if (d.score) sections.push(buildScoreSection(d.score));

  // 8. Event suitability grid
  sections.push(buildEventGrid(eventScores, d.score));

  return sections.join("\n");
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildHoraSection(d: MuhurtaResponse): string {
  const hora = d.active_hora;
  const uphora = d.active_uphora;

  const horaCard = hora
    ? `
      <div class="md-hora-card ${HORA_LORD_CLASS[hora.lord] ?? ""}">
        <div class="hora-lord">${hora.lord}</div>
        <div class="hora-meta">
          <span class="hora-badge">${hora.is_daytime ? "☀️ Day" : "🌙 Night"}</span>
          <span class="hora-window">${toIST(hora.start)} → ${toIST(hora.end)}</span>
        </div>
      </div>`
    : `<div class="md-hora-card hora-unknown"><div class="hora-lord">—</div><div class="hora-meta">No hora data</div></div>`;

  const uphoraCard = uphora
    ? `
      <div class="md-uphora-card">
        <div class="uphora-label">Uphora (1/8 Hora)</div>
        <div class="uphora-lord">${uphora.sub}</div>
        <div class="uphora-window">${toIST(uphora.start)} → ${toIST(uphora.end)}</div>
      </div>`
    : "";

  return `
    <section class="md-section">
      <h3 class="md-section-title">⏰ Current Hora</h3>
      <div class="md-hora-row">
        ${horaCard}
        ${uphoraCard}
      </div>
      <div class="md-sun-row">
        <span>🌅 Sunrise ${toIST(d.sunrise)}</span>
        <span>🌇 Sunset ${toIST(d.sunset)}</span>
      </div>
    </section>
  `;
}

function buildPakshiSection(pp: PanchaPakshi): string {
  const score = pp.favorability_score;
  const { cls, label } = scoreGrade(score);
  const confidencePct = Math.round(pp.confidence * 100);

  return `
    <section class="md-section">
      <h3 class="md-section-title">🦅 Pancha Pakshi</h3>
      <div class="md-pakshi-card">
        <div class="pakshi-bird">${pp.bird}</div>
        <div class="pakshi-meta">
          <span class="pakshi-confidence">Confidence: ${confidencePct}%</span>
          <span class="pakshi-precision">Precision: ±${pp.precision_minutes}m</span>
          <span class="pakshi-window">${toIST(pp.cycle_start)} → ${toIST(pp.cycle_end)}</span>
        </div>
        <div class="md-score-bar-wrap">
          <div class="md-score-bar ${cls}" style="width:${score}%"></div>
        </div>
        <div class="pakshi-grade ${cls}">${label} (${score}/100)</div>
      </div>
    </section>
  `;
}

function buildRahuKaalSection(d: MuhurtaResponse): string {
  const rk = d.rahu_kaal;
  const cls = rk.active_now ? "rk-active" : "rk-inactive";
  const badge = rk.active_now
    ? `<span class="badge badge-danger">⚠ ACTIVE NOW</span>`
    : `<span class="badge badge-ok">✓ Not active</span>`;

  return `
    <section class="md-section">
      <h3 class="md-section-title">🐍 Rahu Kaal</h3>
      <div class="md-rk-card ${cls}">
        ${badge}
        <span class="rk-window">${toIST(rk.start)} – ${toIST(rk.end)}</span>
        ${rk.active_now ? `<p class="rk-warning">Avoid new ventures during Rahu Kaal.</p>` : ""}
      </div>
    </section>
  `;
}

function buildNakshatraTaraSection(d: MuhurtaResponse): string {
  const nak = d.current_nakshatra;
  const tara = d.tara;

  let taraHtml = `<div class="tara-unavailable">Add a kundali to see personalized Tara</div>`;
  if (tara) {
    const cls = taraClass(tara.beneficence);
    const name = TARA_NAMES[tara.number] ?? tara.name;
    const icon = tara.beneficence === "benefic" ? "✅" : tara.beneficence === "malefic" ? "❌" : "⚪";
    taraHtml = `
      <div class="md-tara-card ${cls}">
        <div class="tara-number">Tara ${tara.number}</div>
        <div class="tara-name">${icon} ${name}</div>
        <div class="tara-beneficence">${tara.beneficence.charAt(0).toUpperCase() + tara.beneficence.slice(1)}</div>
      </div>
    `;
  }

  return `
    <section class="md-section">
      <h3 class="md-section-title">⭐ Nakshatra + Tara</h3>
      <div class="md-nak-row">
        <div class="md-nak-card">
          <div class="nak-label">Transit Moon</div>
          <div class="nak-name">${nak.name}</div>
          <div class="nak-idx">Nakshatra ${nak.idx + 1}/27</div>
        </div>
        ${taraHtml}
      </div>
    </section>
  `;
}

function buildWarningsSection(d: MuhurtaResponse): string {
  const warnings: string[] = [];

  if (d.panchaka_dosha?.active) {
    warnings.push(`⚠️ <strong>Panchaka Dosha</strong>${d.panchaka_dosha.dosha ? ` — ${d.panchaka_dosha.dosha}` : ""}: Avoid cremation, travel south, construction.`);
  }
  if (d.ganda_moola?.active) {
    warnings.push(`⚠️ <strong>Ganda Moola</strong>${d.ganda_moola.nakshatra ? ` (${d.ganda_moola.nakshatra})` : ""}: Inauspicious nakshatra — avoid ceremonies.`);
  }
  if (d.dishashool?.active) {
    warnings.push(`⚠️ <strong>Dishashool</strong>${d.dishashool.direction ? ` — ${d.dishashool.direction}` : ""}: Travel in this direction is inauspicious today.`);
  }
  if (d.combustion?.venus?.combust) {
    const orb = d.combustion.venus.orb ? ` (${d.combustion.venus.orb.toFixed(1)}°)` : "";
    warnings.push(`🔥 <strong>Venus Combust</strong>${orb}: Marriage muhurtas affected.`);
  }
  if (d.combustion?.jupiter?.combust) {
    const orb = d.combustion.jupiter.orb ? ` (${d.combustion.jupiter.orb.toFixed(1)}°)` : "";
    warnings.push(`🔥 <strong>Jupiter Combust</strong>${orb}: Upanayana, marriage, ceremonies affected.`);
  }

  if (warnings.length === 0) {
    return `
      <section class="md-section">
        <h3 class="md-section-title">🛡 Dosha Status</h3>
        <div class="md-clear-card">✓ No active doshas or combustion warnings</div>
      </section>
    `;
  }

  return `
    <section class="md-section">
      <h3 class="md-section-title">⚠️ Active Warnings (${warnings.length})</h3>
      <ul class="md-warnings-list">
        ${warnings.map(w => `<li class="md-warning-item">${w}</li>`).join("")}
      </ul>
    </section>
  `;
}

function buildScoreSection(score: ScoreResult): string {
  const { cls, label } = scoreGrade(score.score);
  const pct = Math.round(score.score);

  const layersHtml = (score.layers ?? []).map(l => {
    const layerPct = Math.round(l.score);
    const { cls: lCls } = scoreGrade(l.score);
    return `
      <div class="score-layer">
        <span class="layer-name">${l.name}</span>
        <div class="layer-bar-wrap">
          <div class="layer-bar ${lCls}" style="width:${layerPct}%"></div>
        </div>
        <span class="layer-score">${layerPct}</span>
        ${l.reason ? `<span class="layer-reason">${l.reason}</span>` : ""}
      </div>
    `;
  }).join("");

  const warningsHtml = (score.warnings ?? []).length > 0
    ? `<div class="score-warnings">${score.warnings!.map(w => `<span class="score-warn-tag">${w}</span>`).join("")}</div>`
    : "";

  return `
    <section class="md-section">
      <h3 class="md-section-title">📊 Convergence Score</h3>
      <div class="md-score-card">
        <div class="score-big ${cls}">${pct}</div>
        <div class="score-grade-label ${cls}">${label} ${score.grade ? `(${score.grade})` : ""}</div>
        <div class="md-score-bar-wrap main-bar">
          <div class="md-score-bar ${cls}" style="width:${pct}%"></div>
        </div>
        ${score.summary ? `<p class="score-summary">${score.summary}</p>` : ""}
        ${warningsHtml}
        ${layersHtml ? `<div class="score-layers">${layersHtml}</div>` : ""}
      </div>
    </section>
  `;
}

function buildEventGrid(eventScores: Record<string, number | null>, baseScore: ScoreResult | null): string {
  const cards = EVENT_PURPOSES.map(ev => {
    const s = eventScores[ev.slug] ?? null;
    const display = s !== null ? Math.round(s) : (baseScore ? Math.round(baseScore.score) : null);
    const { cls, label } = display !== null ? scoreGrade(display) : { cls: "grade-na", label: "—" };

    return `
      <div class="md-event-card ${cls}">
        <div class="event-icon">${ev.icon}</div>
        <div class="event-label">${ev.label}</div>
        <div class="event-priority">${ev.priority}</div>
        <div class="event-score">${display !== null ? display : "—"}</div>
        <div class="event-grade">${label}</div>
      </div>
    `;
  }).join("");

  return `
    <section class="md-section">
      <h3 class="md-section-title">🎯 Event Suitability</h3>
      <div class="md-event-grid">${cards}</div>
      ${!Object.keys(eventScores).length ? `<p class="md-note">Scores shown are general. Add a kundali for personalized event ratings.</p>` : ""}
    </section>
  `;
}

function errorCard(msg: string): string {
  return `<div class="error-card" style="margin: var(--space-6) 0;"><p>${msg}</p></div>`;
}

// ── Auto-refresh timers ───────────────────────────────────────────────────────

function startTimers(app: HTMLElement): void {
  clearTimers();

  // Countdown badge
  countdownTimer = setInterval(() => {
    secondsLeft--;
    const badge = app.querySelector<HTMLElement>("#refresh-badge");
    if (badge) badge.textContent = `⏱ ${secondsLeft}s`;
    if (secondsLeft <= 0) secondsLeft = REFRESH_SECONDS;
  }, 1000);

  // Data refresh
  refreshTimer = setInterval(async () => {
    secondsLeft = REFRESH_SECONDS;
    await loadAndRender(app);
  }, REFRESH_SECONDS * 1000);
}

function clearTimers(): void {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
}

// Styles injected once into <head>
injectStyles();

function injectStyles(): void {
  const STYLE_ID = "muhurta-dashboard-styles";
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
/* ── Muhurta Dashboard Layout ── */
.muhurta-dashboard .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.muhurta-dashboard .header-right { margin-left:auto; display:flex; align-items:center; gap:var(--space-2); }
.muhurta-dashboard .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.refresh-badge { font-size:var(--font-size-xs); background:var(--color-surface-2); padding:2px 8px; border-radius:99px; }

.md-section { margin-bottom:var(--space-5); }
.md-section-title { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); letter-spacing:.04em; text-transform:uppercase; margin-bottom:var(--space-3); }
.md-timestamp { display:flex; justify-content:space-between; align-items:center; font-size:var(--font-size-sm); margin-bottom:var(--space-4); }
.md-personalized-badge { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; background:var(--color-surface-2); }

/* Hora */
.md-hora-row { display:flex; gap:var(--space-3); flex-wrap:wrap; }
.md-hora-card { flex:1; min-width:140px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.md-hora-card .hora-lord { font-size:var(--font-size-xl); font-weight:700; }
.md-hora-card .hora-meta { margin-top:var(--space-2); display:flex; flex-direction:column; gap:2px; font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.hora-badge { display:inline-block; }
.hora-window { }
.md-uphora-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface-2); text-align:center; }
.uphora-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-1); }
.uphora-lord { font-size:var(--font-size-lg); font-weight:600; }
.uphora-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:4px; }
.md-sun-row { display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:var(--space-3); }

/* Hora lord colours */
.hora-sun     { background:#fff8e1; border-color:#f9a825; }
.hora-moon    { background:#e3f2fd; border-color:#1565c0; }
.hora-mars    { background:#fce4ec; border-color:#c62828; }
.hora-mercury { background:#e8f5e9; border-color:#2e7d32; }
.hora-jupiter { background:#fff3e0; border-color:#e65100; }
.hora-venus   { background:#fce4ec; border-color:#ad1457; }
.hora-saturn  { background:#ede7f6; border-color:#4527a0; }
@media (prefers-color-scheme:dark) {
  .hora-sun     { background:#3e2a00; border-color:#f9a825; }
  .hora-moon    { background:#0d1b2a; border-color:#1565c0; }
  .hora-mars    { background:#3b0a14; border-color:#c62828; }
  .hora-mercury { background:#0a1f0c; border-color:#2e7d32; }
  .hora-jupiter { background:#2a1500; border-color:#e65100; }
  .hora-venus   { background:#2d0a18; border-color:#ad1457; }
  .hora-saturn  { background:#160e2b; border-color:#4527a0; }
}

/* Pakshi */
.md-pakshi-card { padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); }
.pakshi-bird { font-size:var(--font-size-lg); font-weight:700; margin-bottom:var(--space-2); }
.pakshi-meta { display:flex; flex-wrap:wrap; gap:var(--space-3); font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-3); }

/* Rahu Kaal */
.md-rk-card { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); flex-wrap:wrap; }
.rk-active { border-color:#c62828; background:#fce4ec; }
.rk-inactive { border-color:var(--color-border); }
@media (prefers-color-scheme:dark) { .rk-active { background:#3b0a14; } }
.rk-window { font-size:var(--font-size-sm); }
.rk-warning { font-size:var(--font-size-xs); color:#c62828; margin:0; }
.badge { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; font-weight:600; }
.badge-danger { background:#c62828; color:#fff; }
.badge-ok { background:#2e7d32; color:#fff; }

/* Nakshatra + Tara */
.md-nak-row { display:flex; gap:var(--space-3); flex-wrap:wrap; }
.md-nak-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.nak-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.nak-name { font-size:var(--font-size-lg); font-weight:700; margin:var(--space-1) 0; }
.nak-idx { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.md-tara-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:2px solid; text-align:center; }
.md-tara-card.tara-good { border-color:#2e7d32; background:#e8f5e9; }
.md-tara-card.tara-bad  { border-color:#c62828; background:#fce4ec; }
.md-tara-card.tara-neutral { border-color:var(--color-border); }
@media (prefers-color-scheme:dark) {
  .md-tara-card.tara-good { background:#0a1f0c; }
  .md-tara-card.tara-bad  { background:#3b0a14; }
}
.tara-number { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.tara-name { font-size:var(--font-size-lg); font-weight:700; margin:var(--space-1) 0; }
.tara-beneficence { font-size:var(--font-size-sm); font-weight:600; }
.tara-unavailable { padding:var(--space-4); font-size:var(--font-size-sm); color:var(--color-text-secondary); text-align:center; flex:1; }

/* Warnings */
.md-warnings-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:var(--space-2); }
.md-warning-item { padding:var(--space-3); border-radius:var(--radius-md); background:#fff3e0; border-left:3px solid #e65100; font-size:var(--font-size-sm); }
@media (prefers-color-scheme:dark) { .md-warning-item { background:#2a1500; } }
.md-clear-card { padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); background:#e8f5e9; border:1px solid #2e7d32; font-size:var(--font-size-sm); color:#2e7d32; }
@media (prefers-color-scheme:dark) { .md-clear-card { background:#0a1f0c; } }

/* Score */
.md-score-card { padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); }
.score-big { font-size:3rem; font-weight:800; line-height:1; }
.score-grade-label { font-size:var(--font-size-sm); font-weight:600; margin-top:4px; margin-bottom:var(--space-3); }
.md-score-bar-wrap { background:var(--color-surface-2); border-radius:99px; height:8px; overflow:hidden; margin-bottom:var(--space-3); }
.md-score-bar { height:8px; border-radius:99px; transition:width 0.6s ease; }
.main-bar .md-score-bar { height:12px; }
.score-summary { font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-3); }
.score-warnings { display:flex; flex-wrap:wrap; gap:var(--space-2); margin-bottom:var(--space-3); }
.score-warn-tag { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; background:#fff3e0; border:1px solid #e65100; color:#e65100; }
@media (prefers-color-scheme:dark) { .score-warn-tag { background:#2a1500; } }
.score-layers { display:flex; flex-direction:column; gap:var(--space-3); border-top:1px solid var(--color-border); padding-top:var(--space-3); }
.score-layer { display:grid; grid-template-columns:120px 1fr 40px; align-items:center; gap:var(--space-2); font-size:var(--font-size-xs); }
.layer-name { color:var(--color-text-secondary); }
.layer-bar-wrap { background:var(--color-surface-2); border-radius:99px; height:6px; overflow:hidden; }
.layer-bar { height:6px; border-radius:99px; }
.layer-score { text-align:right; font-weight:600; }
.layer-reason { grid-column:1/-1; color:var(--color-text-secondary); font-style:italic; }

/* Grade colours */
.grade-a { color:#2e7d32; } .grade-a.md-score-bar { background:#2e7d32; } .grade-a.layer-bar { background:#2e7d32; }
.grade-b { color:#558b2f; } .grade-b.md-score-bar { background:#558b2f; } .grade-b.layer-bar { background:#558b2f; }
.grade-c { color:#f57f17; } .grade-c.md-score-bar { background:#f57f17; } .grade-c.layer-bar { background:#f57f17; }
.grade-d { color:#e65100; } .grade-d.md-score-bar { background:#e65100; } .grade-d.layer-bar { background:#e65100; }
.grade-f { color:#c62828; } .grade-f.md-score-bar { background:#c62828; } .grade-f.layer-bar { background:#c62828; }
.grade-na { color:var(--color-text-secondary); }
.pakshi-grade { font-size:var(--font-size-sm); font-weight:600; }

/* Event grid */
.md-event-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--space-3); }
@media (min-width:500px) { .md-event-grid { grid-template-columns:repeat(4,1fr); } }
.md-event-card { padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.event-icon { font-size:1.5rem; }
.event-label { font-size:var(--font-size-sm); font-weight:600; margin:4px 0 2px; }
.event-priority { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2); }
.event-score { font-size:1.5rem; font-weight:800; }
.event-grade { font-size:var(--font-size-xs); font-weight:600; margin-top:2px; }
.md-event-card.grade-a { border-color:#2e7d32; background:#e8f5e9; }
.md-event-card.grade-b { border-color:#558b2f; background:#f1f8e9; }
.md-event-card.grade-c { border-color:#f57f17; background:#fff8e1; }
.md-event-card.grade-d { border-color:#e65100; background:#fff3e0; }
.md-event-card.grade-f { border-color:#c62828; background:#fce4ec; }
@media (prefers-color-scheme:dark) {
  .md-event-card.grade-a { background:#0a1f0c; }
  .md-event-card.grade-b { background:#0d2200; }
  .md-event-card.grade-c { background:#221600; }
  .md-event-card.grade-d { background:#2a1500; }
  .md-event-card.grade-f { background:#3b0a14; }
}
.md-note { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:var(--space-2); text-align:center; }
`;
  document.head.appendChild(el);
}
