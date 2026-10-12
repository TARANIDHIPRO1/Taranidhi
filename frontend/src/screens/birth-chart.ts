/**
 * Birth Chart Screen — Visual Kundali
 *
 * Shows:
 *  1. Visual North Indian chart (4×4 grid, fixed houses)
 *  2. Visual South Indian chart (4×4 grid, fixed signs)
 *  3. Panchang at birth (Vara, Tithi, Nakshatra, Yoga)
 *  4. Vimshottari Dasha (Maha + Antar)
 *  5. All planets table + KP cusps
 *
 * Route: #/birth-chart?id=<kundali_id>
 * API:   GET /kundali/:id/chart
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { getKundaliChart, deleteKundali } from "../api";

// ── Constants ────────────────────────────────────────────────────────────────

const RASHI_FULL = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
                    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const RASHI_SHORT = ["Ar","Ta","Ge","Ca","Le","Vi","Li","Sc","Sa","Cp","Aq","Pi"];
const RASHI_NUM   = ["1","2","3","4","5","6","7","8","9","10","11","12"];

const PLANET_SHORT: Record<string,string> = {
  Sun:"Su", Moon:"Mo", Mars:"Ma", Mercury:"Me",
  Jupiter:"Ju", Venus:"Ve", Saturn:"Sa", Rahu:"Ra", Ketu:"Ke"
};
// Planet label colours are theme tokens (--pc-*, defined in screens.css) so
// each one keeps AAA contrast on the chart background in both light and dark.
const pcVar = (planet: string): string => `var(--pc-${String(planet).toLowerCase()}, var(--pc-moon))`;

const TITHI_NAMES = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
  "Trayodashi","Chaturdashi","Purnima","Pratipada","Dwitiya","Tritiya","Chaturthi",
  "Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi",
  "Dwadashi","Trayodashi","Chaturdashi","Amavasya"];

const YOGA_NAMES = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda",
  "Sukarman","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana",
  "Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya",
  "Shubha","Shukla","Brahma","Indra","Vaidhriti"];

const VARA_NAMES = ["Ravivar","Somavar","Mangalvar","Budhavar","Guruvar","Shukravar","Shanivar"];
const VARA_LORD  = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];

// North Indian chart: house → [row, col] in a 4×4 grid (0-indexed)
const NI_HOUSE_POS: [number,number][] = [
  [0,0], // placeholder (index 0 unused)
  [0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]
  //  1     2     3     4     5     6     7     8     9    10    11    12
];

// South Indian chart: rashi (0=Ar..11=Pi) → [row, col] in a 4×4 grid
const SI_RASHI_POS: [number,number][] = [
  [0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]
  //Ar    Ta    Ge    Ca    Le    Vi    Li    Sc    Sa    Cp    Aq    Pi
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDeg(deg: number): string {
  const d = Math.floor(deg);
  const mRaw = (deg - d) * 60;
  const m = Math.floor(mRaw);
  const s = Math.round((mRaw - m) * 60);
  return `${d}°${m.toString().padStart(2,"0")}'${s.toString().padStart(2,"0")}"`;
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
  catch { return iso; }
}

function toIST(iso: string): string {
  try { return new Date(iso).toLocaleString("en-IN",{
    timeZone:"Asia/Kolkata", day:"numeric", month:"short",
    year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true
  }); } catch { return iso; }
}

function kpChain(kp: {starLord:string;subLord:string;subSubLord:string}): string {
  return `${kp.starLord} → ${kp.subLord} → ${kp.subSubLord}`;
}

// ── Panchang Calculations ────────────────────────────────────────────────────

interface Panchang {
  vara: string; varaLord: string;
  tithi: string; paksha: string; tithiNum: number;
  yoga: string; yogaNum: number;
  nakshatra: string; nakshatraLord: string;
}

function calcPanchang(
  birthDate: string,
  sunDeg: number,
  moonDeg: number,
  janmaNak: { name: string; lord: string }
): Panchang {
  // Vara
  const d = new Date(birthDate);
  const dayIdx = d.getUTCDay();
  const vara = VARA_NAMES[dayIdx];
  const varaLord = VARA_LORD[dayIdx];

  // Tithi
  const diff = ((moonDeg - sunDeg) + 360) % 360;
  const tithiNum = Math.floor(diff / 12) + 1; // 1–30
  const paksha = tithiNum <= 15 ? "Shukla Paksha" : "Krishna Paksha";
  const tithiName = TITHI_NAMES[tithiNum - 1] ?? `Tithi ${tithiNum}`;

  // Yoga
  const yogaSum = (sunDeg + moonDeg) % 360;
  const yogaIdx = Math.floor(yogaSum / (360 / 27));
  const yoga = YOGA_NAMES[yogaIdx] ?? `Yoga ${yogaIdx + 1}`;

  return {
    vara, varaLord,
    tithi: tithiName, paksha, tithiNum,
    yoga, yogaNum: yogaIdx + 1,
    nakshatra: janmaNak.name, nakshatraLord: janmaNak.lord,
  };
}

// ── North Indian Chart ───────────────────────────────────────────────────────

function buildNIChart(ascRashi: number, planets: any[]): string {
  // For each house 1–12, determine rashi and planets
  const housePlanets: string[][] = Array.from({length:13}, () => []);
  planets.forEach(p => {
    const h = p.house;
    if (h >= 1 && h <= 12) {
      const color = pcVar(p.planet);
      housePlanets[h].push(`<span style="color:${color}">${PLANET_SHORT[p.planet] ?? p.planet}</span>`);
    }
  });

  // Build cells: houses 1–12 at fixed grid positions
  // Grid layout (row,col → house):
  // (0,0)=12  (0,1)=1  (0,2)=2  (0,3)=3
  // (1,0)=11  ctr      ctr      (1,3)=4
  // (2,0)=10  ctr      ctr      (2,3)=5
  // (3,0)=9   (3,1)=8  (3,2)=7  (3,3)=6

  const houseRashi = (house: number): string => {
    const rashiIdx = (ascRashi + house - 1) % 12;
    return RASHI_SHORT[rashiIdx];
  };

  const cell = (house: number, extraClass: string = ""): string => {
    const rashi = houseRashi(house);
    const pts = housePlanets[house];
    const hasLagna = house === 1;
    return `<div class="ni-cell ni-h${house} ${extraClass}">
      <div class="ni-house-num">${house}</div>
      <div class="ni-rashi">${rashi}${hasLagna ? ' <span class="ni-asc">La</span>' : ''}</div>
      <div class="ni-planets">${pts.join(" ")}</div>
    </div>`;
  };

  return `
    <div class="ni-chart">
      ${cell(12)}${cell(1)}${cell(2)}${cell(3)}
      ${cell(11)}
      <div class="ni-center">
        <div class="ni-center-text">KUNDALI</div>
        <div class="ni-center-sub">${RASHI_FULL[ascRashi]} Lagna</div>
      </div>
      ${cell(4)}
      ${cell(10)}
      <div class="ni-center-spacer"></div>
      <div class="ni-center-spacer"></div>
      ${cell(5)}
      ${cell(9)}${cell(8)}${cell(7)}${cell(6)}
    </div>`;
}

// ── South Indian Chart ───────────────────────────────────────────────────────

function buildSIChart(ascRashi: number, planets: any[]): string {
  // For each rashi 0–11, collect planets
  const rashiPlanets: string[][] = Array.from({length:12}, () => []);
  planets.forEach(p => {
    const r = p.rashi ?? 0;
    if (r >= 0 && r < 12) {
      const color = pcVar(p.planet);
      rashiPlanets[r].push(`<span style="color:${color}">${PLANET_SHORT[p.planet] ?? p.planet}</span>`);
    }
  });

  // House number for each rashi = distance from ascendant
  const rashiHouse = (rashi: number): number => ((rashi - ascRashi + 12) % 12) + 1;

  // Build cells in fixed grid order (SI reading order: Pi, Ar, Ta, Ge, Aq, ..., Sa, Sc, Li, Vi)
  // Row 0: Pi(11), Ar(0), Ta(1), Ge(2)
  // Row 1: Aq(10), ctr, ctr, Ca(3)
  // Row 2: Cp(9), ctr, ctr, Le(4)
  // Row 3: Sa(8), Sc(7), Li(6), Vi(5)

  const siCell = (rashi: number): string => {
    const isAsc = rashi === ascRashi;
    const house = rashiHouse(rashi);
    const pts = rashiPlanets[rashi];
    return `<div class="si-cell si-r${rashi} ${isAsc ? 'si-asc' : ''}">
      <div class="si-rashi-name">${RASHI_SHORT[rashi]}${isAsc ? ' <span class="si-la">La</span>' : ''}</div>
      <div class="si-house-num">${house}</div>
      <div class="si-planets">${pts.join(" ")}</div>
    </div>`;
  };

  return `
    <div class="si-chart">
      ${siCell(11)}${siCell(0)}${siCell(1)}${siCell(2)}
      ${siCell(10)}
      <div class="si-center"><div class="si-center-text">KUNDALI</div></div>
      ${siCell(3)}
      ${siCell(9)}
      <div class="si-center-sp"></div><div class="si-center-sp"></div>
      ${siCell(4)}
      ${siCell(8)}${siCell(7)}${siCell(6)}${siCell(5)}
    </div>`;
}

// ── Types ────────────────────────────────────────────────────────────────────

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
interface ChartResponse {
  kundali: { id: number; label: string | null; birth_date: string; latitude: number; longitude: number; timezone: string; };
  chart: {
    ayanamsa: string; ayanamsaDeg: number;
    ascendant: AscData; planets: PlanetData[]; cusps: CuspData[];
    dasha: { maha: { lord:string; start:string; end:string; }; antar: { lord:string; start:string; end:string; }; } | null;
    janmaNakshatra: { idx: number; name: string; lord: string; pada: number | null; };
    tara: { number: number; name: string; beneficence: string; transitMoonNakName: string; asOf: string; };
  };
  meta: { computed_at: string; engine: string; };
}

// ── Screen Entry Point ───────────────────────────────────────────────────────

export async function renderBirthChart(kundaliId?: number): Promise<void> {
  const app = $app();
  clear(app);

  let id = kundaliId;
  if (!id) {
    const hash = window.location.hash;
    const qStr = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(qStr);
    const raw = params.get("id");
    id = raw ? parseInt(raw, 10) : undefined;
  }

  if (!id || isNaN(id)) {
    app.innerHTML = `<div class="screen"><header class="screen-header">
      <button class="btn-back" id="btn-back">←</button><h2>Birth Chart</h2></header>
      <div style="padding:2rem;text-align:center;color:var(--error-text)">
        No kundali selected.<br><br>
        <button class="btn btn-primary" id="btn-list">Go to My Kundalis</button>
      </div></div>`;
    document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));
    document.getElementById("btn-list")!.addEventListener("click", () => navigate("/kundali"));
    return;
  }

  app.innerHTML = `<div class="screen ti-screen"><header class="ti-header">
    <div class="ti-brand"><span class="ti-brand-name">OCCULTVIISION</span></div>
    <button class="ti-logout" id="btn-back">← Back</button>
  </header>
  <div style="padding:2rem;text-align:center"><div class="spinner"></div>
  <p style="margin-top:1rem;color:var(--accent-akash-text)">Computing birth chart…</p></div></div>`;
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));

  const res = await getKundaliChart(id);
  if (!res.ok) {
    app.innerHTML += `<div style="padding:2rem;color:#f87171">Failed to load chart (${res.status}).<br>${res.data?.error ?? ""}</div>`;
    return;
  }

  const { kundali, chart, meta } = res.data as ChartResponse;

  // Check for suspicious birth year (current year = likely wrong)
  const birthYear = new Date(kundali.birth_date).getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const isWrongYear = birthYear >= currentYear - 1;

  // Find Sun & Moon degrees for Panchang
  const sunPlanet  = chart.planets.find(p => p.planet === "Sun");
  const moonPlanet = chart.planets.find(p => p.planet === "Moon");
  const panchang: Panchang | null = (sunPlanet && moonPlanet)
    ? calcPanchang(kundali.birth_date, sunPlanet.deg, moonPlanet.deg, chart.janmaNakshatra)
    : null;

  const asc = chart.ascendant;
  const { dasha, tara, janmaNakshatra } = chart;

  // Build NI and SI chart HTML
  const niHtml = buildNIChart(asc.rashi, chart.planets);
  const siHtml = buildSIChart(asc.rashi, chart.planets);

  app.innerHTML = `
    <div class="screen kc-screen">

      <!-- Header -->
      <header class="kc-header">
        <button class="kc-back" id="btn-back" title="Go back">←</button>
        <div class="kc-title">
          <span class="kc-name">${kundali.label ?? "Kundali #" + kundali.id}</span>
          <span class="kc-sub" data-i18n="nav.kundali">Birth Chart</span>
        </div>
        <button class="kc-delete" id="btn-delete" title="Delete chart">🗑</button>
      </header>

      ${isWrongYear ? `
      <div class="kc-warning">
        ⚠️ Birth year shows <strong>${birthYear}</strong> — looks like today's date was used by mistake.
        <button class="kc-warn-btn" id="btn-delete-warn">Delete & Re-enter →</button>
      </div>` : ""}

      <!-- Birth Details -->
      <div class="kc-birth-banner">
        <div class="kc-birth-row">
          <span class="kc-birth-label">Birth</span>
          <span class="kc-birth-val">${toIST(kundali.birth_date)}</span>
        </div>
        <div class="kc-birth-row">
          <span class="kc-birth-label">Place</span>
          <span class="kc-birth-val">${kundali.latitude.toFixed(4)}°N, ${kundali.longitude.toFixed(4)}°E</span>
        </div>
        <div class="kc-birth-row">
          <span class="kc-birth-label">Ayanamsa</span>
          <span class="kc-birth-val">${chart.ayanamsa} ${fmtDeg(chart.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- Chart Toggle -->
      <div class="kc-chart-toggle">
        <button class="kc-toggle active" id="btn-ni" data-i18n="chart.northIndian">North Indian</button>
        <button class="kc-toggle" id="btn-si" data-i18n="chart.southIndian">South Indian</button>
      </div>

      <!-- North Indian Chart -->
      <div class="kc-chart-wrap" id="ni-wrap">
        ${niHtml}
      </div>

      <!-- South Indian Chart -->
      <div class="kc-chart-wrap" id="si-wrap" style="display:none">
        ${siHtml}
      </div>

      <!-- Chart Legend -->
      <div class="kc-legend">
        ${Object.entries(PLANET_SHORT).map(([full, abbr]) =>
          `<span class="kc-leg-item" style="color:${pcVar(full)}">${abbr}=${full}</span>`
        ).join("")}
      </div>

      <!-- Panchang at Birth -->
      ${panchang ? `
      <section class="kc-section">
        <div class="kc-section-title">PANCHANG AT BIRTH</div>
        <div class="kc-panchang-grid">
          <div class="kc-panch-item">
            <div class="kc-panch-label">Vara (Weekday)</div>
            <div class="kc-panch-val">${panchang.vara}</div>
            <div class="kc-panch-sub">Lord: ${panchang.varaLord}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Tithi</div>
            <div class="kc-panch-val">${panchang.tithi}</div>
            <div class="kc-panch-sub">${panchang.paksha} · #${panchang.tithiNum}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Nakshatra</div>
            <div class="kc-panch-val">${panchang.nakshatra}</div>
            <div class="kc-panch-sub">Lord: ${panchang.nakshatraLord}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Yoga</div>
            <div class="kc-panch-val">${panchang.yoga}</div>
            <div class="kc-panch-sub">#${panchang.yogaNum} of 27</div>
          </div>
        </div>
      </section>` : ""}

      <!-- Ascendant -->
      <section class="kc-section">
        <div class="kc-section-title">ASCENDANT (LAGNA)</div>
        <div class="kc-asc-card">
          <div class="kc-asc-sign">${asc.rashiName}</div>
          <div class="kc-asc-deg">${fmtDeg(asc.deg)}</div>
          <div class="kc-asc-nak">${asc.nakName} Pada ${asc.nakPada} · Lord ${asc.nakLord}</div>
          <div class="kc-kp">KP: ${kpChain(asc.kp)}</div>
        </div>
      </section>

      <!-- Current Dasha -->
      ${dasha ? `
      <section class="kc-section">
        <div class="kc-section-title">VIMSHOTTARI DASHA (CURRENT)</div>
        <div class="kc-dasha-row">
          <div class="kc-dasha-item kc-maha">
            <div class="kc-dasha-planet">${dasha.maha.lord}</div>
            <div class="kc-dasha-type">Maha Dasha</div>
            <div class="kc-dasha-dates">${fmtDate(dasha.maha.start)} – ${fmtDate(dasha.maha.end)}</div>
          </div>
          <div class="kc-dasha-arrow">›</div>
          <div class="kc-dasha-item kc-antar">
            <div class="kc-dasha-planet">${dasha.antar.lord}</div>
            <div class="kc-dasha-type">Antar Dasha</div>
            <div class="kc-dasha-dates">${fmtDate(dasha.antar.start)} – ${fmtDate(dasha.antar.end)}</div>
          </div>
        </div>
      </section>` : ""}

      <!-- Janma Nakshatra + Tara -->
      <section class="kc-section">
        <div class="kc-section-title">JANMA NAKSHATRA & TARA</div>
        <div class="kc-nak-tara">
          <div class="kc-nak-card">
            <div class="kc-nak-name">${janmaNakshatra.name}</div>
            <div class="kc-nak-detail">Lord: <strong>${janmaNakshatra.lord}</strong>${janmaNakshatra.pada ? ` · Pada ${janmaNakshatra.pada}` : ""}</div>
          </div>
          <div class="kc-tara-card ${tara.beneficence === 'benefic' ? 'tara-good' : tara.beneficence === 'malefic' ? 'tara-bad' : 'tara-mid'}">
            <div class="kc-tara-num">Tara ${tara.number}</div>
            <div class="kc-tara-name">${tara.name}</div>
            <div class="kc-tara-sub">Transit Moon: ${tara.transitMoonNakName}</div>
          </div>
        </div>
      </section>

      <!-- Planets Table -->
      <section class="kc-section">
        <div class="kc-section-title">PLANETS (LAHIRI SIDEREAL)</div>
        <div class="kc-table-wrap">
          <table class="kc-table">
            <thead><tr>
              <th>Planet</th><th>House</th><th>Sign</th>
              <th>°in Sign</th><th>Nakshatra</th><th>KP Chain</th>
            </tr></thead>
            <tbody>
              ${chart.planets.map(p => `<tr>
                <td style="color:${pcVar(p.planet)}">${p.planet}</td>
                <td class="tc">${p.house}</td>
                <td>${p.rashiName}</td>
                <td class="mono">${fmtDeg(p.degInRashi)}</td>
                <td>${p.nakName} P${p.nakPada}</td>
                <td class="kp-cell">${kpChain(p.kp)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- KP Cusps -->
      <section class="kc-section">
        <div class="kc-section-title">KP HOUSE CUSPS (PLACIDUS · KRISHNAMURTI)</div>
        <div class="kc-table-wrap">
          <table class="kc-table">
            <thead><tr>
              <th>H</th><th>Sign</th><th>°in Sign</th><th>Nakshatra</th><th>KP Chain</th>
            </tr></thead>
            <tbody>
              ${chart.cusps.map(cu => `<tr class="${cu.house % 2 === 0 ? 'row-alt' : ''}">
                <td class="tc"><strong>${cu.house}</strong></td>
                <td>${cu.rashiName}</td>
                <td class="mono">${fmtDeg(cu.degInRashi)}</td>
                <td>${cu.nakName} P${cu.nakPada}</td>
                <td class="kp-cell">${kpChain(cu.kp)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <div class="kc-engine-note">Engine: ${meta.engine} · Computed: ${toIST(meta.computed_at)}</div>

      <!-- Bottom Nav -->
      <div class="kc-bottom-nav">
        <button class="kc-nav-btn" id="btn-kp">KP Query</button>
        <button class="kc-nav-btn" id="btn-muhurta">Muhurta</button>
        <button class="kc-nav-btn" id="btn-dasha">Dasha</button>
        <button class="kc-nav-btn" id="btn-sublords">Sub-Lords</button>
      </div>

    </div>
  `;

  // ── Event Handlers ───────────────────────────────────────────────────────

  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));

  // Chart toggle
  const niWrap = document.getElementById("ni-wrap")!;
  const siWrap = document.getElementById("si-wrap")!;
  const btnNI  = document.getElementById("btn-ni")!;
  const btnSI  = document.getElementById("btn-si")!;
  btnNI.addEventListener("click", () => {
    niWrap.style.display = ""; siWrap.style.display = "none";
    btnNI.classList.add("active"); btnSI.classList.remove("active");
  });
  btnSI.addEventListener("click", () => {
    siWrap.style.display = ""; niWrap.style.display = "none";
    btnSI.classList.add("active"); btnNI.classList.remove("active");
  });

  // Delete
  const deleteFn = async () => {
    if (!confirm(`Delete "${kundali.label ?? "this kundali"}"? This cannot be undone.`)) return;
    const r = await deleteKundali(kundali.id);
    if (r.ok) { showToast("Kundali deleted"); navigate("/kundali"); }
    else showToast(r.data?.error ?? "Delete failed", true);
  };
  document.getElementById("btn-delete")!.addEventListener("click", deleteFn);
  document.getElementById("btn-delete-warn")?.addEventListener("click", deleteFn);

  // Nav
  document.getElementById("btn-kp")!.addEventListener("click",       () => navigate("/kp-query"));
  document.getElementById("btn-muhurta")!.addEventListener("click",  () => navigate("/muhurta"));
  document.getElementById("btn-dasha")!.addEventListener("click",    () => navigate(`/dasha-timeline?kundali_id=${kundali.id}`));
  document.getElementById("btn-sublords")!.addEventListener("click", () => navigate(`/kp-sublords?kundali_id=${kundali.id}`));
}
