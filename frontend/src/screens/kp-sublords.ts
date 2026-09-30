/**
 * kp-sublords.ts — V6 Phase 3: KP Sub-Lord Chain Display
 *
 * Route: #/kp-sublords?kundali_id=<id>
 * API:   GET /kp/chart/:id
 *
 * Displays the Krishnamurti Paddhati (KP) sub-lord tables:
 *  1. 12 Bhava (house) cusps with full 3-tier chain (Star Lord → Sub Lord → Sub-Sub Lord)
 *  2. 9 Planets with their KP chains
 *
 * KP Principle: the Sub Lord of a cusp/planet is the prime significator
 * for its house promises. This screen is the analyst's reference table.
 *
 * All data comes from the backend (solvePlacidusCusps + getSubLordChain),
 * verified 22/22 against onlinejyotish.com for Naveen's chart.
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";
import { kpChart } from "../api";

// ── Constants ──────────────────────────────────────────────────────────────────

const HOUSE_NUMERALS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

const HOUSE_THEMES: Record<string, string> = {
  "I":   "Self, Health, Appearance",
  "II":  "Wealth, Family, Speech",
  "III": "Courage, Siblings, Short Trips",
  "IV":  "Property, Mother, Happiness",
  "V":   "Children, Intelligence, Speculation",
  "VI":  "Enemies, Disease, Service",
  "VII": "Marriage, Business Partners",
  "VIII":"Longevity, Hidden, Inheritance",
  "IX":  "Luck, Father, Dharma",
  "X":   "Career, Status, Authority",
  "XI":  "Gains, Desires, Elder Siblings",
  "XII": "Loss, Abroad, Liberation",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☀", Moon: "☽", Mars: "♂", Mercury: "☿", Jupiter: "♃",
  Venus: "♀", Saturn: "♄", Rahu: "☊", Ketu: "☋",
};

const PLANET_COLOR: Record<string, string> = {
  Sun:     "#d97706", Moon:    "#6366f1", Mars:    "#dc2626",
  Mercury: "#16a34a", Jupiter: "#b45309", Venus:   "#db2777",
  Saturn:  "#7c3aed", Rahu:    "#475569", Ketu:    "#92400e",
};

const SIGN_ABBR: Record<string, string> = {
  Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Cn",
  Leo: "Le", Virgo: "Vi", Libra: "Li", Scorpio: "Sc",
  Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface CuspRow {
  house: string;
  sign: string;
  deg_in_sign: number;
  sign_lord: string;
  star_lord: string;
  sub_lord: string;
  sub_sub_lord: string;
}

interface PlanetRow {
  planet: string;
  sign: string;
  deg_in_sign: number;
  sign_lord: string;
  star_lord: string;
  sub_lord: string;
  sub_sub_lord: string;
}

interface KpChartResponse {
  kundali_id: number;
  ayanamsa_caveat: string;
  house_cusps: CuspRow[];
  planet_sub_lords: PlanetRow[];
}

// ── State ──────────────────────────────────────────────────────────────────────

let kundaliId: number;
type ActiveTab = "cusps" | "planets";
let activeTab: ActiveTab = "cusps";

// ── Main render ────────────────────────────────────────────────────────────────

export async function renderKpSublords(): Promise<void> {
  const app = $app();
  clear(app);

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
    const res = await kpChart(kundaliId);
    if (!res.ok || !res.data) {
      app.innerHTML = errorPage(res.data?.error ?? "Failed to load KP chart.");
      return;
    }
    render(app, res.data as KpChartResponse);
  } catch (err) {
    console.error("[kp-sublords]", err);
    app.innerHTML = errorPage("Connection error. Please try again.");
  }
}

// ── Render ─────────────────────────────────────────────────────────────────────

function render(app: HTMLElement, data: KpChartResponse): void {
  app.innerHTML = `
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>KP Sub-Lords</h2>
          <span class="subtitle">Krishnamurti Paddhati · Placidus Sidereal</span>
        </div>
      </header>

      <div class="kp-tabs" role="tablist">
        <button class="kp-tab${activeTab === "cusps" ? " active" : ""}" data-tab="cusps" role="tab">
          🏠 Bhavas (12)
        </button>
        <button class="kp-tab${activeTab === "planets" ? " active" : ""}" data-tab="planets" role="tab">
          🪐 Planets (${data.planet_sub_lords.length})
        </button>
      </div>

      <div class="kp-body">
        ${activeTab === "cusps"
          ? buildCuspsTab(data.house_cusps)
          : buildPlanetsTab(data.planet_sub_lords)
        }
      </div>

      <div class="kp-caveat">${data.ayanamsa_caveat}</div>
    </div>
  `;

  wireBack(app);
  wireTabs(app, data);
}

// ── Cusps tab ──────────────────────────────────────────────────────────────────

function buildCuspsTab(cusps: CuspRow[]): string {
  const rows = cusps.map((c) => {
    const theme = HOUSE_THEMES[c.house] ?? "";
    const sign = c.sign ?? "";
    const abbr = SIGN_ABBR[sign] ?? sign.slice(0, 2);
    const deg = c.deg_in_sign.toFixed(2);

    return `
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-house-badge">H${c.house}</div>
          <div class="kp-row-meta">
            <span class="kp-pos">${abbr} ${deg}°</span>
            <span class="kp-theme">${theme}</span>
          </div>
        </div>
        <div class="kp-chain">
          ${chainCell("Star", c.star_lord)}
          ${chainArrow()}
          ${chainCell("Sub", c.sub_lord, true)}
          ${chainArrow()}
          ${chainCell("Sub²", c.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${lordChip(c.sign_lord)}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the cusp</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Primary significator (KP prime indicator)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (fine-tuning)</span>
    </div>
    <div class="kp-rows">${rows}</div>
  `;
}

// ── Planets tab ────────────────────────────────────────────────────────────────

function buildPlanetsTab(planets: PlanetRow[]): string {
  const rows = planets.map((p) => {
    const sign = p.sign ?? "";
    const abbr = SIGN_ABBR[sign] ?? sign.slice(0, 2);
    const deg = p.deg_in_sign.toFixed(2);
    const color = PLANET_COLOR[p.planet] ?? "#888";
    const glyph = PLANET_GLYPH[p.planet] ?? "";

    return `
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-planet-badge" style="color:${color}">
            ${glyph} ${p.planet}
          </div>
          <div class="kp-row-meta">
            <span class="kp-pos">${abbr} ${deg}°</span>
          </div>
        </div>
        <div class="kp-chain">
          ${chainCell("Star", p.star_lord)}
          ${chainArrow()}
          ${chainCell("Sub", p.sub_lord, true)}
          ${chainArrow()}
          ${chainCell("Sub²", p.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${lordChip(p.sign_lord)}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the planet</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Controls planet's results (KP prime)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (finer detail)</span>
    </div>
    <div class="kp-rows">${rows}</div>
  `;
}

// ── Chain helpers ──────────────────────────────────────────────────────────────

function chainCell(label: string, lord: string, prime = false): string {
  const color = PLANET_COLOR[lord] ?? "#888";
  const glyph = PLANET_GLYPH[lord] ?? "";
  return `
    <div class="kp-chain-cell${prime ? " prime" : ""}">
      <div class="kp-chain-label">${label}</div>
      <div class="kp-chain-lord" style="color:${color}">
        ${glyph} ${lord}
      </div>
    </div>
  `;
}

function chainArrow(): string {
  return `<div class="kp-chain-arrow">→</div>`;
}

function lordChip(lord: string): string {
  const color = PLANET_COLOR[lord] ?? "#888";
  const glyph = PLANET_GLYPH[lord] ?? "";
  return `<span class="lord-chip" style="color:${color}">${glyph} ${lord}</span>`;
}

// ── Skeleton + error ───────────────────────────────────────────────────────────

function buildSkeleton(): string {
  return `
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="spinner" style="margin:40px auto"></div>
      </div>
    </div>
  `;
}

function errorPage(msg: string): string {
  return `
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="error-card"><p>${msg}</p></div>
      </div>
    </div>
  `;
}

// ── Event wiring ───────────────────────────────────────────────────────────────

function wireBack(app: HTMLElement): void {
  app.querySelector("#btn-back")?.addEventListener("click", () => {
    navigate(`/birth-chart?id=${kundaliId}`);
  });
}

function wireTabs(app: HTMLElement, data: KpChartResponse): void {
  app.querySelectorAll<HTMLElement>(".kp-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      activeTab = (tab.dataset.tab as ActiveTab) ?? "cusps";
      render(app, data);
    });
  });
}

// ── Styles ─────────────────────────────────────────────────────────────────────

injectStyles();

function injectStyles(): void {
  const STYLE_ID = "kp-sublords-styles";
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
/* ── KP Sub-Lords screen ── */
.kp-sublords .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.kp-sublords .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Tabs */
.kp-tabs { display:flex; border-bottom:1px solid var(--color-border); padding:0 var(--space-4); gap:var(--space-2); }
.kp-tab { background:none; border:none; padding:var(--space-3) var(--space-4); font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .15s, border-color .15s; }
.kp-tab.active { color:var(--color-primary,#2563eb); border-bottom-color:var(--color-primary,#2563eb); }
.kp-tab:hover:not(.active) { color:var(--color-text-primary); }

/* Body */
.kp-body { padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-3); }

/* Legend */
.kp-legend { display:flex; flex-wrap:wrap; align-items:center; gap:4px var(--space-3); padding:var(--space-3); background:var(--color-surface-2); border-radius:var(--radius-sm); font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2); }
.kp-legend-sep { font-weight:600; }

/* Rows */
.kp-rows { display:flex; flex-direction:column; gap:var(--space-2); }
.kp-row { border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-3); background:var(--color-surface-1); }

/* Row header */
.kp-row-header { display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3); }
.kp-house-badge { font-size:var(--font-size-xs); font-weight:700; padding:3px 8px; border-radius:99px; background:var(--color-surface-2); color:var(--color-text-secondary); letter-spacing:.04em; min-width:36px; text-align:center; }
.kp-planet-badge { font-size:var(--font-size-md); font-weight:700; }
.kp-row-meta { flex:1; display:flex; flex-direction:column; }
.kp-pos { font-size:var(--font-size-sm); font-weight:600; }
.kp-theme { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Chain */
.kp-chain { display:flex; align-items:stretch; gap:0; margin-bottom:var(--space-2); }
.kp-chain-cell { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:var(--space-2); background:var(--color-surface-2); border-radius:var(--radius-sm); text-align:center; }
.kp-chain-cell.prime { background:color-mix(in srgb, var(--color-primary,#2563eb) 10%, var(--color-surface-2)); border:1px solid var(--color-primary,#2563eb); }
.kp-chain-arrow { display:flex; align-items:center; padding:0 4px; color:var(--color-text-secondary); font-size:var(--font-size-xs); }
.kp-chain-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:2px; }
.kp-chain-lord { font-size:var(--font-size-sm); font-weight:700; }

/* Sign lord line */
.kp-sign-lord-line { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.lord-chip { font-weight:700; margin-left:4px; }

/* Caveat */
.kp-caveat { font-size:var(--font-size-xs); color:var(--color-text-secondary); padding:var(--space-3) var(--space-4) var(--space-6); line-height:1.5; border-top:1px solid var(--color-border); margin-top:var(--space-2); }
`;
  document.head.appendChild(el);
}
