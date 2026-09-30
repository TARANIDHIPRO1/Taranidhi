/**
 * dasha-timeline.ts — V6 Phase 3: Dasha Timeline View
 *
 * Route: #/dasha-timeline?kundali_id=<id>
 * API:   GET /kundali/:id/chart
 *
 * Displays the full 120-year Vimshottari Dasha cycle:
 *  1. Janma Nakshatra + starting Dasha lord (header context)
 *  2. 9 Mahadasha blocks (visual timeline bar + card list)
 *     — current one highlighted; past = muted, future = dimmed
 *  3. Antardasha expansion — 9 sub-periods for the selected (or current) Maha
 *     — current Antar highlighted
 *  4. Pratyantar breakdown for the current Antardasha (read-only reference)
 *
 * All computation is done client-side from the chart endpoint data.
 * The same constants as astro.ts are used (Vimshottari: 120-year cycle).
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";
import { getKundaliChart } from "../api";

// ── Vimshottari constants (mirror of astro.ts — must stay in sync) ────────────

const DASHA_SEQ = [
  "Ketu", "Venus", "Sun", "Moon", "Mars",
  "Rahu", "Jupiter", "Saturn", "Mercury",
] as const;

const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Planet glyphs / abbreviations
const PLANET_GLYPH: Record<string, string> = {
  Sun: "☀", Moon: "☽", Mars: "♂", Mercury: "☿", Jupiter: "♃",
  Venus: "♀", Saturn: "♄", Rahu: "☊", Ketu: "☋",
};

// Planet accent colours (CSS custom properties defined below)
const PLANET_COLOR: Record<string, string> = {
  Sun:     "#d97706",
  Moon:    "#6366f1",
  Mars:    "#dc2626",
  Mercury: "#16a34a",
  Jupiter: "#d97706",
  Venus:   "#db2777",
  Saturn:  "#7c3aed",
  Rahu:    "#475569",
  Ketu:    "#92400e",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashaPeriod {
  lord: string;
  start: Date;
  end: Date;
}

interface Antardasha extends DashaPeriod {
  pratyantar?: DashaPeriod[];
}

interface MahadashaPeriod extends DashaPeriod {
  idx: number;       // 0-8 within cycle
  isCurrent: boolean;
  isPast: boolean;
  antars: Antardasha[];
}

// ── Computation ────────────────────────────────────────────────────────────────

/**
 * Build all 9 Mahadashas starting from `firstMahaStart` for `startLord`.
 * Returns periods sorted chronologically.
 */
function buildMahadashas(firstMahaStart: Date, startLordIdx: number): MahadashaPeriod[] {
  const now = Date.now();
  const periods: MahadashaPeriod[] = [];
  let cursor = firstMahaStart.getTime();

  for (let i = 0; i < 9; i++) {
    const seqIdx = (startLordIdx + i) % 9;
    const lord = DASHA_SEQ[seqIdx]!;
    const durMs = DASHA_YEARS[lord]! * 365.25 * 86400000;
    const start = new Date(cursor);
    const end = new Date(cursor + durMs);
    const isCurrent = now >= start.getTime() && now < end.getTime();
    const isPast = now >= end.getTime();

    periods.push({
      lord, start, end,
      idx: i, isCurrent, isPast,
      antars: buildAntardashas({ lord, start, end }),
    });

    cursor += durMs;
  }
  return periods;
}

/**
 * Build 9 Antardashas for a given Mahadasha period.
 * Sub-period formula: (antarLordYears / 120) × mahaYears × 365.25d
 */
function buildAntardashas(maha: DashaPeriod): Antardasha[] {
  const now = Date.now();
  const mahaLordIdx = DASHA_SEQ.indexOf(maha.lord as typeof DASHA_SEQ[number]);
  const mahaDurYears = DASHA_YEARS[maha.lord]!;
  const periods: Antardasha[] = [];
  let cursor = maha.start.getTime();

  for (let i = 0; i < 9; i++) {
    const antarSeqIdx = (mahaLordIdx + i) % 9;
    const lord = DASHA_SEQ[antarSeqIdx]!;
    const durMs = (DASHA_YEARS[lord]! / 120) * mahaDurYears * 365.25 * 86400000;
    const start = new Date(cursor);
    const end = new Date(cursor + durMs);
    const isCurrent = now >= start.getTime() && now < end.getTime();

    const antar: Antardasha = { lord, start, end };

    // Pratyantar for current antardasha only (to keep payload small)
    if (isCurrent) {
      antar.pratyantar = buildPratyantardashas({ lord, start, end }, maha.lord);
    }

    periods.push(antar);
    cursor += durMs;
  }
  return periods;
}

/**
 * Build 9 Pratyantardashas for the current Antardasha.
 * Sub-sub formula: (pratLordYears / 120) × antarDurDays
 */
function buildPratyantardashas(antar: DashaPeriod, mahaLord: string): DashaPeriod[] {
  const antarLordIdx = DASHA_SEQ.indexOf(antar.lord as typeof DASHA_SEQ[number]);
  const antarDurMs = antar.end.getTime() - antar.start.getTime();
  const totalYears = 120;
  const periods: DashaPeriod[] = [];
  let cursor = antar.start.getTime();

  for (let i = 0; i < 9; i++) {
    const seqIdx = (antarLordIdx + i) % 9;
    const lord = DASHA_SEQ[seqIdx]!;
    const fraction = DASHA_YEARS[lord]! / totalYears;
    const durMs = fraction * antarDurMs;
    const start = new Date(cursor);
    const end = new Date(cursor + durMs);
    periods.push({ lord, start, end });
    cursor += durMs;
  }
  return periods;
}

// ── Formatting helpers ─────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    month: "short", year: "numeric",
  });
}

function durationLabel(start: Date, end: Date): string {
  const years = (end.getTime() - start.getTime()) / (365.25 * 86400000);
  if (years >= 1) return `${years.toFixed(1)}y`;
  const months = years * 12;
  if (months >= 1) return `${months.toFixed(1)}m`;
  return `${Math.round(years * 365)}d`;
}

/** How far through the period (0-100) */
function progressPct(start: Date, end: Date): number {
  const now = Date.now();
  if (now <= start.getTime()) return 0;
  if (now >= end.getTime()) return 100;
  return Math.round((now - start.getTime()) / (end.getTime() - start.getTime()) * 100);
}

// ── State ──────────────────────────────────────────────────────────────────────

let kundaliId: number;
let selectedMahaIdx: number = -1; // -1 = current maha

// ── Main render ────────────────────────────────────────────────────────────────

export async function renderDashaTimeline(): Promise<void> {
  const app = $app();
  clear(app);

  // Parse kundali_id from hash
  const qStr = window.location.hash.includes("?")
    ? window.location.hash.split("?")[1]!
    : "";
  const params = new URLSearchParams(qStr);
  const rawId = params.get("kundali_id");
  if (!rawId) {
    app.innerHTML = errorPage("Missing kundali_id parameter.");
    return;
  }
  kundaliId = parseInt(rawId, 10);

  app.innerHTML = buildSkeleton();
  wireBack(app);

  try {
    const res = await getKundaliChart(kundaliId);
    if (!res.ok || !res.data) {
      app.innerHTML = errorPage(res.data?.error ?? "Failed to load chart data.");
      return;
    }

    const { chart, kundali } = res.data;
    render(app, chart, kundali);
  } catch (err) {
    console.error("[dasha-timeline]", err);
    app.innerHTML = errorPage("Connection error. Please try again.");
  }
}

function buildSkeleton(): string {
  return `
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `;
}

function wireBack(app: HTMLElement): void {
  app.querySelector("#btn-back")?.addEventListener("click", () => {
    navigate(`/birth-chart?id=${kundaliId}`);
  });
}

// ── Main render ────────────────────────────────────────────────────────────────

function render(app: HTMLElement, chart: any, kundali: any): void {
  const { dasha, janmaNakshatra } = chart;
  if (!dasha) {
    app.innerHTML = errorPage("Dasha calculation unavailable for this chart.");
    return;
  }

  // Reconstruct the full 120-year sequence from current maha data
  const startLord = janmaNakshatra.lord as string;
  const startLordIdx = DASHA_SEQ.indexOf(startLord as typeof DASHA_SEQ[number]);

  // currentMaha.start is the beginning of this maha period
  const currentMahaStart = new Date(dasha.maha.start);
  const currentMahaLord = dasha.maha.lord as string;
  const currentMahaLordIdx = DASHA_SEQ.indexOf(currentMahaLord as typeof DASHA_SEQ[number]);

  // Walk backward from currentMahaStart to find firstMahaStart
  let firstMahaStart = currentMahaStart.getTime();
  let stepsBack = 0;
  if (startLordIdx !== -1 && currentMahaLordIdx !== -1) {
    // How many steps from startLord to currentMahaLord?
    stepsBack = ((currentMahaLordIdx - startLordIdx) + 9) % 9;
    for (let i = 0; i < stepsBack; i++) {
      const lord = DASHA_SEQ[(startLordIdx + i) % 9]!;
      firstMahaStart -= DASHA_YEARS[lord]! * 365.25 * 86400000;
    }
  }

  const mahas = buildMahadashas(new Date(firstMahaStart), startLordIdx !== -1 ? startLordIdx : currentMahaLordIdx);

  const currentMahaSeqIdx = mahas.findIndex(m => m.isCurrent);
  if (selectedMahaIdx === -1) selectedMahaIdx = currentMahaSeqIdx >= 0 ? currentMahaSeqIdx : 0;

  // Total timeline span
  const timelineStart = mahas[0]!.start;
  const timelineEnd = mahas[mahas.length - 1]!.end;
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();

  const selectedMaha = mahas[selectedMahaIdx]!;
  const currentAntar = selectedMaha.antars.find(a =>
    Date.now() >= a.start.getTime() && Date.now() < a.end.getTime()
  ) ?? null;

  app.innerHTML = `
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Dasha Timeline</h2>
          <span class="subtitle">${kundali.label ?? "Birth Chart"}</span>
        </div>
      </header>
      <div class="dt-body">
        ${buildJanmaCard(janmaNakshatra, dasha)}
        ${buildTimelineBar(mahas, timelineStart, totalMs)}
        ${buildMahaList(mahas)}
        ${buildAntarSection(selectedMaha, currentAntar)}
      </div>
    </div>
  `;

  wireBack(app);
  wireMahaCards(app, mahas, chart, kundali);
}

// ── Section builders ───────────────────────────────────────────────────────────

function buildJanmaCard(janmaNak: any, dasha: any): string {
  return `
    <section class="dt-section">
      <div class="dt-janma-card">
        <div class="dt-janma-nak">
          <span class="dt-label">Janma Nakshatra</span>
          <span class="dt-nak-name">${janmaNak.name}</span>
          <span class="dt-nak-meta">Pada ${janmaNak.pada ?? "—"} · Lord: <strong>${janmaNak.lord}</strong></span>
        </div>
        <div class="dt-current-dasha">
          <div class="dt-maha-now">
            <span class="dt-label">Mahadasha</span>
            <span class="dt-lord" style="color:${PLANET_COLOR[dasha.maha.lord] ?? "inherit"}">
              ${PLANET_GLYPH[dasha.maha.lord] ?? ""} ${dasha.maha.lord}
            </span>
            <span class="dt-window">${fmtDateShort(new Date(dasha.maha.start))} → ${fmtDateShort(new Date(dasha.maha.end))}</span>
          </div>
          <div class="dt-antar-now">
            <span class="dt-label">Antardasha</span>
            <span class="dt-lord" style="color:${PLANET_COLOR[dasha.antar.lord] ?? "inherit"}">
              ${PLANET_GLYPH[dasha.antar.lord] ?? ""} ${dasha.antar.lord}
            </span>
            <span class="dt-window">${fmtDateShort(new Date(dasha.antar.start))} → ${fmtDateShort(new Date(dasha.antar.end))}</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function buildTimelineBar(mahas: MahadashaPeriod[], timelineStart: Date, totalMs: number): string {
  const bars = mahas.map(m => {
    const left = ((m.start.getTime() - timelineStart.getTime()) / totalMs * 100).toFixed(2);
    const width = ((m.end.getTime() - m.start.getTime()) / totalMs * 100).toFixed(2);
    const color = PLANET_COLOR[m.lord] ?? "#888";
    const cls = m.isCurrent ? "tl-seg current" : m.isPast ? "tl-seg past" : "tl-seg future";
    return `<div class="${cls}" style="left:${left}%;width:${width}%;background:${color}${m.isPast ? "66" : m.isCurrent ? "" : "33"};"
              title="${m.lord}: ${fmtDateShort(m.start)}–${fmtDateShort(m.end)}">
              <span class="tl-seg-label">${m.lord}</span>
            </div>`;
  }).join("");

  const nowPct = mahas.length > 0
    ? Math.max(0, Math.min(100,
        (Date.now() - timelineStart.getTime()) / totalMs * 100
      )).toFixed(2)
    : "0";

  return `
    <section class="dt-section">
      <h3 class="dt-section-title">⏳ 120-Year Vimshottari Cycle</h3>
      <div class="dt-timeline-bar">
        ${bars}
        <div class="tl-now-marker" style="left:${nowPct}%" title="Today"></div>
      </div>
      <div class="dt-timeline-labels">
        <span>${fmtDateShort(mahas[0]?.start ?? new Date())}</span>
        <span>Today</span>
        <span>${fmtDateShort(mahas[mahas.length - 1]?.end ?? new Date())}</span>
      </div>
    </section>
  `;
}

function buildMahaList(mahas: MahadashaPeriod[]): string {
  const cards = mahas.map((m, i) => {
    const pct = m.isCurrent ? progressPct(m.start, m.end) : m.isPast ? 100 : 0;
    const color = PLANET_COLOR[m.lord] ?? "#888";
    const cls = m.isCurrent ? "maha-card current" : m.isPast ? "maha-card past" : "maha-card future";
    const selectedCls = i === selectedMahaIdx ? " selected" : "";

    return `
      <div class="${cls}${selectedCls}" data-maha-idx="${i}" style="--planet-color:${color}">
        <div class="maha-left">
          <div class="maha-glyph">${PLANET_GLYPH[m.lord] ?? ""}</div>
          <div class="maha-info">
            <div class="maha-lord">${m.lord}</div>
            <div class="maha-years">${DASHA_YEARS[m.lord]}y</div>
          </div>
        </div>
        <div class="maha-right">
          <div class="maha-window">${fmtDate(m.start)} → ${fmtDate(m.end)}</div>
          ${m.isCurrent ? `
            <div class="maha-progress-wrap">
              <div class="maha-progress-bar" style="width:${pct}%;background:${color}"></div>
            </div>
            <div class="maha-pct">${pct}% elapsed</div>
          ` : ""}
        </div>
        ${m.isCurrent ? `<span class="maha-now-badge">NOW</span>` : ""}
      </div>
    `;
  }).join("");

  return `
    <section class="dt-section">
      <h3 class="dt-section-title">🪐 Mahadasha Periods <span class="dt-hint">Tap to expand</span></h3>
      <div class="dt-maha-list" id="maha-list">
        ${cards}
      </div>
    </section>
  `;
}

function buildAntarSection(maha: MahadashaPeriod, currentAntar: Antardasha | null): string {
  const rows = maha.antars.map(a => {
    const isCurrent = Date.now() >= a.start.getTime() && Date.now() < a.end.getTime();
    const isPast = Date.now() >= a.end.getTime();
    const color = PLANET_COLOR[a.lord] ?? "#888";
    const cls = isCurrent ? "antar-row current" : isPast ? "antar-row past" : "antar-row future";

    return `
      <div class="${cls}">
        <div class="antar-left">
          <span class="antar-glyph" style="color:${color}">${PLANET_GLYPH[a.lord] ?? ""}</span>
          <span class="antar-lord">${a.lord}</span>
          ${isCurrent ? `<span class="antar-now-badge">NOW</span>` : ""}
        </div>
        <div class="antar-right">
          <span class="antar-window">${fmtDate(a.start)} → ${fmtDate(a.end)}</span>
          <span class="antar-dur">${durationLabel(a.start, a.end)}</span>
        </div>
      </div>
    `;
  }).join("");

  const pratSection = currentAntar?.pratyantar
    ? buildPratSection(currentAntar)
    : "";

  return `
    <section class="dt-section">
      <h3 class="dt-section-title">
        🔵 Antardashas — ${PLANET_GLYPH[maha.lord] ?? ""} ${maha.lord} Maha
        <span class="dt-hint">(${fmtDateShort(maha.start)} – ${fmtDateShort(maha.end)})</span>
      </h3>
      <div class="dt-antar-list">${rows}</div>
      ${pratSection}
    </section>
  `;
}

function buildPratSection(antar: Antardasha): string {
  if (!antar.pratyantar?.length) return "";

  const rows = antar.pratyantar.map(p => {
    const isCurrent = Date.now() >= p.start.getTime() && Date.now() < p.end.getTime();
    const isPast = Date.now() >= p.end.getTime();
    const color = PLANET_COLOR[p.lord] ?? "#888";
    const cls = isCurrent ? "prat-row current" : isPast ? "prat-row past" : "prat-row";

    return `
      <div class="${cls}">
        <span class="prat-glyph" style="color:${color}">${PLANET_GLYPH[p.lord] ?? ""}</span>
        <span class="prat-lord">${p.lord}</span>
        ${isCurrent ? `<span class="prat-now-badge">NOW</span>` : ""}
        <span class="prat-window">${fmtDate(p.start)} – ${fmtDate(p.end)}</span>
        <span class="prat-dur">${durationLabel(p.start, p.end)}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="dt-prat-section">
      <h4 class="dt-section-title">🔴 Pratyantar — ${antar.lord} Antar</h4>
      <div class="dt-prat-list">${rows}</div>
    </div>
  `;
}

function errorPage(msg: string): string {
  return `
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="error-card"><p>${msg}</p></div>
      </div>
    </div>
  `;
}

// ── Event wiring ───────────────────────────────────────────────────────────────

function wireMahaCards(
  app: HTMLElement,
  mahas: MahadashaPeriod[],
  chart: any,
  kundali: any
): void {
  app.querySelectorAll<HTMLElement>(".maha-card").forEach(card => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.mahaIdx ?? "0", 10);
      selectedMahaIdx = idx;
      render(app, chart, kundali);
    });
  });
}

// ── Styles ─────────────────────────────────────────────────────────────────────

injectStyles();

function injectStyles(): void {
  const STYLE_ID = "dasha-timeline-styles";
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
/* ── Dasha Timeline Layout ── */
.dasha-timeline .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.dasha-timeline .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.dt-body { padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-5); }
.dt-section { }
.dt-section-title { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); letter-spacing:.04em; text-transform:uppercase; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2); flex-wrap:wrap; }
.dt-hint { font-size:var(--font-size-xs); font-weight:400; text-transform:none; letter-spacing:0; color:var(--color-text-tertiary,#aaa); }
.dt-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); display:block; margin-bottom:2px; }

/* Janma card */
.dt-janma-card { display:flex; flex-wrap:wrap; gap:var(--space-4); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface-1); }
.dt-janma-nak { flex:1; min-width:140px; }
.dt-nak-name { font-size:var(--font-size-lg); font-weight:700; display:block; }
.dt-nak-meta { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.dt-current-dasha { flex:2; min-width:200px; display:flex; gap:var(--space-4); flex-wrap:wrap; }
.dt-maha-now, .dt-antar-now { flex:1; min-width:100px; }
.dt-lord { font-size:var(--font-size-lg); font-weight:700; display:block; }
.dt-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Timeline bar */
.dt-timeline-bar { position:relative; height:40px; background:var(--color-surface-2); border-radius:var(--radius-sm); overflow:hidden; margin-bottom:var(--space-2); }
.tl-seg { position:absolute; top:0; bottom:0; display:flex; align-items:center; justify-content:center; overflow:hidden; transition:filter .2s; }
.tl-seg.current { filter:brightness(1); }
.tl-seg.past { filter:brightness(0.6); }
.tl-seg.future { filter:brightness(0.7); }
.tl-seg-label { font-size:9px; font-weight:600; color:#fff; text-shadow:0 0 3px #0008; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; padding:0 2px; }
.tl-now-marker { position:absolute; top:0; bottom:0; width:2px; background:#000; opacity:.5; }
@media (prefers-color-scheme:dark) { .tl-now-marker { background:#fff; } }
.dt-timeline-labels { display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Maha list */
.dt-maha-list { display:flex; flex-direction:column; gap:var(--space-2); }
.maha-card { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); cursor:pointer; position:relative; transition:box-shadow .15s; }
.maha-card:hover { box-shadow:0 0 0 2px var(--planet-color); }
.maha-card.selected { border-color:var(--planet-color); box-shadow:0 0 0 2px var(--planet-color); }
.maha-card.current { border-left:3px solid var(--planet-color); }
.maha-card.past { opacity:.65; }
.maha-card.future { opacity:.8; }
.maha-left { display:flex; align-items:center; gap:var(--space-2); min-width:80px; }
.maha-glyph { font-size:1.4rem; color:var(--planet-color); }
.maha-lord { font-weight:700; font-size:var(--font-size-sm); }
.maha-years { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.maha-right { flex:1; }
.maha-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:4px; }
.maha-progress-wrap { background:var(--color-surface-2); border-radius:99px; height:6px; overflow:hidden; margin-bottom:2px; }
.maha-progress-bar { height:6px; border-radius:99px; transition:width .6s ease; }
.maha-pct { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.maha-now-badge { position:absolute; top:var(--space-2); right:var(--space-3); font-size:var(--font-size-xs); font-weight:700; padding:1px 6px; border-radius:99px; background:var(--planet-color); color:#fff; }

/* Antar list */
.dt-antar-list { display:flex; flex-direction:column; gap:1px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--color-border); }
.antar-row { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:var(--color-surface-1); }
.antar-row + .antar-row { border-top:1px solid var(--color-border); }
.antar-row.current { background:var(--color-surface-2); font-weight:600; }
.antar-row.past { opacity:.6; }
.antar-left { display:flex; align-items:center; gap:var(--space-2); min-width:120px; }
.antar-glyph { font-size:1.1rem; }
.antar-lord { font-size:var(--font-size-sm); font-weight:600; }
.antar-now-badge { font-size:var(--font-size-xs); font-weight:700; padding:1px 5px; border-radius:99px; background:#2563eb; color:#fff; }
.antar-right { flex:1; display:flex; justify-content:space-between; align-items:center; }
.antar-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.antar-dur { font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); }

/* Pratyantar */
.dt-prat-section { margin-top:var(--space-4); }
.dt-prat-list { display:flex; flex-direction:column; gap:1px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--color-border); }
.prat-row { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-2) var(--space-4); background:var(--color-surface-1); font-size:var(--font-size-xs); }
.prat-row + .prat-row { border-top:1px solid var(--color-border); }
.prat-row.current { background:var(--color-surface-2); font-weight:600; }
.prat-row.past { opacity:.55; }
.prat-glyph { font-size:1rem; min-width:18px; }
.prat-lord { min-width:70px; font-weight:600; }
.prat-now-badge { font-size:var(--font-size-xs); font-weight:700; padding:1px 5px; border-radius:99px; background:#dc2626; color:#fff; margin-right:4px; }
.prat-window { flex:1; color:var(--color-text-secondary); }
.prat-dur { font-weight:600; color:var(--color-text-secondary); }
`;
  document.head.appendChild(el);
}
