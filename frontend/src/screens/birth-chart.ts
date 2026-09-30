/**
 * Birth Chart Screen — V6 Phase 1
 *
 * Displays the full computed birth chart from GET /kundali/:id/chart.
 * Layers shown:
 *   1. Header — kundali label, birth details, ayanamsa
 *   2. Ascendant card — sign, nakshatra, KP sub-lord chain
 *   3. Planets table — all 9 planets with house, sign, nakshatra, KP chain, dignity
 *   4. KP Cusps — all 12 house cusps with sub-lord chain
 *   5. Vimshottari Dasha — Maha + Antar lords with dates
 *   6. Janma Nakshatra + current Tara (Tarabala)
 *   7. Parashari summary — yogas detected + bhava strength per house
 *
 * Called from: router.ts → #/birth-chart?id=<kundali_id>
 * API: GET /kundali/:id/chart  (kundaliChart.ts)
 *      POST /kp/query with parashari layer (kpQuery.ts)
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { getKundaliChart } from "../api";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtDeg(deg: number): string {
  const d = Math.floor(deg);
  const mRaw = (deg - d) * 60;
  const m = Math.floor(mRaw);
  const s = Math.round((mRaw - m) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'${s.toString().padStart(2, "0")}"`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateRange(start: string, end: string): string {
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

/** KP sub-lord chain as "Star Lord → Sub Lord → Sub-Sub Lord" */
function kpChain(kp: { starLord: string; subLord: string; subSubLord: string }): string {
  return `${kp.starLord} → ${kp.subLord} → ${kp.subSubLord}`;
}

/** Planet symbol map */
const PLANET_SYMBOL: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mars: "♂", Mercury: "☿", Jupiter: "♃",
  Venus: "♀", Saturn: "♄", Rahu: "☊", Ketu: "☋",
};

/** Tara colour coding */
function taraClass(beneficence: string): string {
  if (beneficence === "benefic") return "tara-good";
  if (beneficence === "malefic") return "tara-bad";
  return "tara-neutral";
}

/** Parashari verdict colour */
function verdictClass(v: string): string {
  if (v === "strong")   return "verdict-strong";
  if (v === "moderate") return "verdict-moderate";
  return "verdict-weak";
}

/** Format UTC ISO to IST display */
function toIST(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ── Screen entry point ───────────────────────────────────────────────────────

export async function renderBirthChart(kundaliId?: number): Promise<void> {
  const app = $app();
  clear(app);

  // Resolve kundali ID — from param or from URL hash query string
  let id = kundaliId;
  if (!id) {
    const hash = window.location.hash; // e.g. "#/birth-chart?id=5"
    const qStr = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(qStr);
    const raw = params.get("id");
    id = raw ? parseInt(raw, 10) : undefined;
  }

  if (!id || isNaN(id)) {
    app.innerHTML = `
      <div class="screen">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">←</button>
          <h2>Birth Chart</h2>
        </header>
        <div style="padding: var(--space-6); text-align: center; color: var(--color-danger);">
          No kundali selected. Please choose a kundali first.
          <br/><br/>
          <button class="btn btn-primary" id="btn-list">Go to My Kundalis</button>
        </div>
      </div>
    `;
    document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));
    document.getElementById("btn-list")!.addEventListener("click", () => navigate("/kundali"));
    return;
  }

  // Loading state
  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Birth Chart</h2>
      </header>
      <div style="padding: var(--space-8); text-align: center;">
        <div class="spinner"></div>
        <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">
          Computing chart…
        </p>
      </div>
    </div>
  `;
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));

  // Fetch chart
  const res = await getKundaliChart(id);
  if (!res.ok) {
    app.innerHTML = `
      <div class="screen">
        <header class="screen-header">
          <button class="btn-back2" id="btn-back2">←</button>
          <h2>Birth Chart</h2>
        </header>
        <div style="padding: var(--space-6); text-align: center; color: var(--color-danger);">
          Failed to load chart (${res.status}).
          <br/>${res.data?.error ?? ""}
        </div>
      </div>
    `;
    document.getElementById("btn-back2")!.addEventListener("click", () => navigate("/kundali"));
    return;
  }

  const { kundali, chart, meta } = res.data as ChartResponse;
  renderChart(app, kundali, chart, meta);
}

// ── Types mirroring kundaliChart.ts response ─────────────────────────────────

interface KpChain { starLord: string; subLord: string; subSubLord: string; }

interface PlanetData {
  planet: string; deg: number; rashi: number; rashiName: string; rashiLord: string;
  degInRashi: number; nakIdx: number; nakName: string; nakLord: string;
  nakPada: number; house: number; kp: KpChain;
}

interface CuspData {
  house: number; deg: number; rashi: number; rashiName: string; rashiLord: string;
  degInRashi: number; nakIdx: number; nakName: string; nakLord: string;
  nakPada: number; kp: KpChain;
}

interface AscData extends PlanetData { ayanamsaDeg: number; }

interface DashaData {
  maha: { lord: string; start: string; end: string; };
  antar: { lord: string; start: string; end: string; };
}

interface TaraData {
  number: number; name: string; beneficence: string;
  transitMoonNakIdx: number; transitMoonNakName: string;
  transitMoonDeg: number; asOf: string;
}

interface JanmaNakData { idx: number; name: string; lord: string; pada: number | null; }

interface ChartResponse {
  kundali: {
    id: number; label: string | null; birth_date: string;
    latitude: number; longitude: number; timezone: string;
  };
  chart: {
    ayanamsa: string; ayanamsaDeg: number;
    ascendant: AscData; planets: PlanetData[]; cusps: CuspData[];
    dasha: DashaData | null; janmaNakshatra: JanmaNakData; tara: TaraData;
  };
  meta: { computed_at: string; engine: string; kp_ayanamsa: string; lahiri_ayanamsa: string; };
}

// ── Main render ──────────────────────────────────────────────────────────────

function renderChart(
  app: HTMLElement,
  k: ChartResponse["kundali"],
  c: ChartResponse["chart"],
  meta: ChartResponse["meta"]
): void {
  const { ascendant: asc, planets, cusps, dasha, janmaNakshatra, tara } = c;

  app.innerHTML = `
    <div class="screen birth-chart-screen">

      <!-- ── Header ── -->
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>${k.label ?? `Kundali #${k.id}`}</h2>
        <button class="btn btn-small" id="btn-kp">KP Query</button>
      </header>

      <!-- ── Birth Details Banner ── -->
      <div class="chart-meta-banner">
        <div class="chart-meta-item">
          <span class="meta-label">Birth</span>
          <span class="meta-val">${toIST(k.birth_date)}</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Lat / Lon</span>
          <span class="meta-val">${k.latitude.toFixed(4)}°N, ${k.longitude.toFixed(4)}°E</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Ayanamsa</span>
          <span class="meta-val">${c.ayanamsa} ${fmtDeg(c.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- ── Ascendant Card ── -->
      <section class="chart-section">
        <h3 class="section-title">Ascendant (Lagna)</h3>
        <div class="asc-card">
          <div class="asc-main">
            <span class="asc-sign">${asc.rashiName}</span>
            <span class="asc-deg">${fmtDeg(asc.deg)}</span>
          </div>
          <div class="asc-detail">
            <span>${asc.nakName} Pada ${asc.nakPada} | Lord: ${asc.nakLord}</span>
          </div>
          <div class="asc-kp">
            <span class="kp-label">KP Sub-lord chain:</span>
            <span class="kp-val">${kpChain(asc.kp)}</span>
          </div>
        </div>
      </section>

      <!-- ── Dasha ── -->
      ${dasha ? `
      <section class="chart-section">
        <h3 class="section-title">Vimshottari Dasha (Current)</h3>
        <div class="dasha-card">
          <div class="dasha-row">
            <div class="dasha-item dasha-maha">
              <div class="dasha-lord">${dasha.maha.lord}</div>
              <div class="dasha-role">Maha Dasha</div>
              <div class="dasha-dates">${fmtDateRange(dasha.maha.start, dasha.maha.end)}</div>
            </div>
            <div class="dasha-divider">›</div>
            <div class="dasha-item dasha-antar">
              <div class="dasha-lord">${dasha.antar.lord}</div>
              <div class="dasha-role">Antar Dasha</div>
              <div class="dasha-dates">${fmtDateRange(dasha.antar.start, dasha.antar.end)}</div>
            </div>
          </div>
        </div>
      </section>` : ""}

      <!-- ── Janma Nakshatra + Tara ── -->
      <section class="chart-section">
        <h3 class="section-title">Janma Nakshatra & Tara</h3>
        <div class="nak-tara-row">
          <div class="nak-card">
            <div class="nak-name">${janmaNakshatra.name}</div>
            <div class="nak-detail">
              Lord: <strong>${janmaNakshatra.lord}</strong>
              ${janmaNakshatra.pada ? ` | Pada ${janmaNakshatra.pada}` : ""}
            </div>
          </div>
          <div class="tara-card ${taraClass(tara.beneficence)}">
            <div class="tara-num">Tara ${tara.number}</div>
            <div class="tara-name">${tara.name}</div>
            <div class="tara-moon">Transit Moon: ${tara.transitMoonNakName}</div>
            <div class="tara-as-of">as of ${toIST(tara.asOf)}</div>
          </div>
        </div>
      </section>

      <!-- ── Planets Table ── -->
      <section class="chart-section">
        <h3 class="section-title">Planets (Lahiri Sidereal)</h3>
        <div class="table-scroll">
          <table class="chart-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>House</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>Nakshatra</th>
                <th>KP: Star → Sub → SubSub</th>
              </tr>
            </thead>
            <tbody>
              ${planets.map(p => `
                <tr>
                  <td><span class="planet-sym">${PLANET_SYMBOL[p.planet] ?? ""}</span> ${p.planet}</td>
                  <td class="text-center">${p.house}</td>
                  <td>${p.rashiName}</td>
                  <td class="mono">${fmtDeg(p.degInRashi)}</td>
                  <td>${p.nakName} P${p.nakPada}</td>
                  <td class="kp-chain-cell">${kpChain(p.kp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── KP Cusps ── -->
      <section class="chart-section">
        <h3 class="section-title">KP House Cusps (Placidus · Krishnamurti)</h3>
        <div class="table-scroll">
          <table class="chart-table">
            <thead>
              <tr>
                <th>House</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>Nakshatra</th>
                <th>KP: Star → Sub → SubSub</th>
              </tr>
            </thead>
            <tbody>
              ${cusps.map(cu => `
                <tr class="${cu.house % 2 === 0 ? "row-alt" : ""}">
                  <td class="text-center"><strong>${cu.house}</strong></td>
                  <td>${cu.rashiName}</td>
                  <td class="mono">${fmtDeg(cu.degInRashi)}</td>
                  <td>${cu.nakName} P${cu.nakPada}</td>
                  <td class="kp-chain-cell">${kpChain(cu.kp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Engine Info ── -->
      <section class="chart-section">
        <div class="meta-footer">
          <span>Engine: ${meta.engine}</span>
          <span>Computed: ${toIST(meta.computed_at)}</span>
        </div>
      </section>

      <!-- ── Bottom Nav ── -->
      <div class="bottom-nav">
        <button class="btn btn-secondary" id="btn-kp-query-bottom">Run KP Query →</button>
        <button class="btn btn-outline" id="btn-muhurta-bottom">Muhurta →</button>
      </div>

    </div>
  `;

  // Event handlers
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));
  document.getElementById("btn-kp")!.addEventListener("click", () => navigate("/kp-query"));
  document.getElementById("btn-kp-query-bottom")!.addEventListener("click", () => navigate("/kp-query"));
  document.getElementById("btn-muhurta-bottom")!.addEventListener("click", () => navigate("/muhurta"));
}
