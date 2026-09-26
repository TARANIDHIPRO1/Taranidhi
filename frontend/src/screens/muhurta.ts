import { $app, clear, showToast } from "../dom";
import { muhurtaNow, listKundalis } from "../api";
import { navigate } from "../router";
import { requestLocation, getCachedLocation } from "../geo";

const PURPOSES = [
  { value: "general", label: "General" },
  { value: "travel", label: "Travel" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "relationship", label: "Relationship" },
  { value: "career", label: "Career" },
  { value: "spiritual", label: "Spiritual" },
];

export function renderMuhurta() {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${PURPOSES.map((p) => `<option value="${p.value}">${p.label}</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Kundali (optional — for personalized scoring)</label>
        <select id="kundali-select">
          <option value="">None (generic)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Location</label>
        <div class="location-row">
          <input id="lat" type="number" step="any" placeholder="Lat" />
          <input id="lon" type="number" step="any" placeholder="Lon" />
          <button id="btn-gps" class="btn-small">📍</button>
        </div>
      </div>

      <button id="btn-check" class="btn-primary">Check Now</button>

      <div id="muhurta-result" class="result-box hidden"></div>
      <div id="muhurta-loading" class="hidden"><div class="spinner"></div></div>
    </div>
  `;

  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));

  // Pre-fill location
  const loc = getCachedLocation();
  if (loc) {
    (document.getElementById("lat") as HTMLInputElement).value = String(loc.lat);
    (document.getElementById("lon") as HTMLInputElement).value = String(loc.lon);
  }

  // GPS button
  document.getElementById("btn-gps")!.addEventListener("click", async () => {
    try {
      const pos = await requestLocation();
      (document.getElementById("lat") as HTMLInputElement).value = String(pos.lat);
      (document.getElementById("lon") as HTMLInputElement).value = String(pos.lon);
      showToast("Location updated");
    } catch {
      showToast("Could not get location", true);
    }
  });

  // Load kundalis
  listKundalis().then((res) => {
    if (res.ok && Array.isArray(res.data?.kundalis)) {
      const sel = document.getElementById("kundali-select") as HTMLSelectElement;
      for (const k of res.data.kundalis) {
        const opt = document.createElement("option");
        opt.value = String(k.id);
        opt.textContent = k.label;
        sel.appendChild(opt);
      }
    }
  });

  // Check
  document.getElementById("btn-check")!.addEventListener("click", async () => {
    const lat = Number((document.getElementById("lat") as HTMLInputElement).value);
    const lon = Number((document.getElementById("lon") as HTMLInputElement).value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      showToast("Set your location first", true);
      return;
    }
    const purpose = (document.getElementById("purpose") as HTMLSelectElement).value;
    const kundaliVal = (document.getElementById("kundali-select") as HTMLSelectElement).value;
    const kundaliId = kundaliVal ? Number(kundaliVal) : undefined;

    const loading = document.getElementById("muhurta-loading")!;
    const resultBox = document.getElementById("muhurta-result")!;
    loading.classList.remove("hidden");
    resultBox.classList.add("hidden");

    const res = await muhurtaNow(lat, lon, purpose, kundaliId);
    loading.classList.add("hidden");

    if (!res.ok) {
      showToast(res.data?.error ?? "Request failed", true);
      return;
    }

    const d = res.data;
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = renderMuhurtaResult(d);
  });
}

function renderMuhurtaResult(d: any): string {
  const scoreClass = d.score >= 70 ? "score-good" : d.score >= 40 ? "score-mid" : "score-bad";
  const layers = (d.layers ?? [])
    .map((l: any) => `<div class="layer"><strong>${l.name}</strong>: ${l.detail} (${l.impact})</div>`)
    .join("");

  const warnings: string[] = [];
  if (d.panchaka?.active) warnings.push(`⚠️ Panchaka Dosha: ${d.panchaka.note}`);
  if (d.ganda_moola?.active) warnings.push(`⚠️ Ganda Moola: ${d.ganda_moola.note}`);
  if (d.combustion?.length) {
    for (const c of d.combustion) warnings.push(`🔥 ${c.planet} combust (${c.angular_distance.toFixed(1)}°)`);
  }

  return `
    <div class="muhurta-card">
      <div class="score-circle ${scoreClass}">${d.score}</div>
      <div class="verdict">${d.verdict ?? ""}</div>
      <div class="hora-info">
        <span>Hora: <strong>${d.hora_lord ?? "?"}</strong></span>
        <span>Nakshatra: <strong>${d.nakshatra ?? "?"}</strong></span>
      </div>
      ${d.tara ? `<div class="tara">Tara: ${d.tara.name} (#${d.tara.number}) — ${d.tara.isBenefic ? "✅ Benefic" : "❌ Malefic"}</div>` : ""}
      ${d.dishashool ? `<div class="dishashool">Dishashool: ${d.dishashool.direction}</div>` : ""}
      <div class="layers">${layers}</div>
      ${warnings.length ? `<div class="warnings">${warnings.join("<br/>")}</div>` : ""}
      <div class="hora-window">Window: ${formatTime(d.hora_start)} – ${formatTime(d.hora_end)}</div>
    </div>
  `;
}

function formatTime(iso: string | undefined): string {
  if (!iso) return "?";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
