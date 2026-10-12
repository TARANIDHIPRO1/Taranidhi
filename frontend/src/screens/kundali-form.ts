/**
 * Kundali Form Screen
 * Create or edit a birth chart (name, date, time, location, timezone)
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { createKundali } from "../api";
import { parseWallTime, wallTimeToUtc } from "../birth-time";
import { requestLocation, getCachedLocation } from "../geo";

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Bangkok", label: "Thailand (ICT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
];

export async function renderKundaliForm(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>New Kundali</h2>
      </header>

      <form class="muhurta-form" id="form">
        <div class="form-group">
          <label for="name">Name / Label</label>
          <input
            id="name"
            type="text"
            placeholder="e.g., My Chart, Client Name"
            required
          />
        </div>

        <div class="form-group">
          <label for="birth-date">Birth Date</label>
          <input id="birth-date" type="date" required />
        </div>

        <div class="form-group">
          <label for="birth-time">Birth Time (HH:MM)</label>
          <input id="birth-time" type="time" required />
        </div>

        <div class="form-group">
          <label>Place / City</label>
          <div class="location-row">
            <input
              id="place-search"
              type="text"
              placeholder="e.g. Raghogarh, Vidisha, Mendori, Bhopal"
              style="flex: 1;"
            />
            <button type="button" class="btn btn-small" id="btn-search-place">🔍</button>
            <button type="button" class="btn btn-small" id="btn-gps">📍</button>
          </div>
          <div id="place-results" style="display:none; margin-top:4px; background:#fff8ef; border:1px solid #E8C89A; border-radius:6px; max-height:160px; overflow-y:auto;"></div>
          <div id="place-confirmed" style="display:none; margin-top:4px; font-size:0.78rem; color:var(--accent-agni-text);"></div>
        </div>

        <div class="form-group">
          <label>Coordinates <span style="font-size:0.75rem; color:var(--accent-agni-text);">(auto-filled from city search)</span></label>
          <div class="location-row">
            <input
              id="lat"
              type="number"
              step="any"
              placeholder="Latitude"
              min="-90"
              max="90"
              required
            />
            <input
              id="lon"
              type="number"
              step="any"
              placeholder="Longitude"
              min="-180"
              max="180"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" required>
            <option value="">-- Select Timezone --</option>
            ${TIMEZONES.map((tz) => `<option value="${tz.value}">${tz.label}</option>`).join(
              ""
            )}
          </select>
        </div>

        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
          <button type="button" class="btn btn-secondary" id="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="btn-submit">
            Create Kundali
          </button>
        </div>
      </form>

      <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--error-text);"></div>
    </div>
  `;

  const form = document.getElementById("form") as HTMLFormElement;
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const dateInput = document.getElementById("birth-date") as HTMLInputElement;
  const timeInput = document.getElementById("birth-time") as HTMLInputElement;
  const latInput = document.getElementById("lat") as HTMLInputElement;
  const lonInput = document.getElementById("lon") as HTMLInputElement;
  const tzInput = document.getElementById("timezone") as HTMLSelectElement;
  const btnGps = document.getElementById("btn-gps")!;
  const btnSearchPlace = document.getElementById("btn-search-place")!;
  const placeSearchInput = document.getElementById("place-search") as HTMLInputElement;
  const placeResults = document.getElementById("place-results")!;
  const placeConfirmed = document.getElementById("place-confirmed")!;
  const btnCancel = document.getElementById("btn-cancel")!;
  const errorBox = document.getElementById("error-box")!;

  // Birth date: NO default — user must enter actual birth date
  // (Previously set to today by mistake — caused wrong kundali)

  // Pre-fill location from cache
  const cached = getCachedLocation();
  if (cached) {
    latInput.value = String(cached.lat);
    lonInput.value = String(cached.lon);
  }

  // Default timezone to India
  tzInput.value = "Asia/Kolkata";

  // Place search via Nominatim (OpenStreetMap, no API key)
  async function searchPlace() {
    const query = placeSearchInput.value.trim();
    if (!query) return;
    btnSearchPlace.textContent = "⏳";
    btnSearchPlace.setAttribute("disabled", "true");
    placeResults.style.display = "none";
    placeResults.innerHTML = "";
    try {
      // Primary search: India-biased (countrycodes=in), 10 results, full address details
      // Nominatim supports villages, tehsils, talukas, gram panchayats
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&countrycodes=in`;
      const res = await fetch(url, { headers: { "Accept-Language": "en,hi" } });
      const data = await res.json();

      if (!data.length) {
        // Fallback: try without countrycodes restriction (for NRIs abroad)
        const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " India")}&format=json&limit=10&addressdetails=1`;
        const res2 = await fetch(url2, { headers: { "Accept-Language": "en,hi" } });
        const data2 = await res2.json();
        if (!data2.length) {
          placeResults.innerHTML = `<div style="padding:8px;color:var(--accent-agni-text);font-size:0.82rem;">
            Jagah nahi mili. Try karein:<br>
            • Poora naam likhein (e.g. "Raghogarh Madhya Pradesh")<br>
            • Tehsil ya district add karein (e.g. "Mendori Raisen")<br>
            • Nearest town ka naam try karein
          </div>`;
          placeResults.style.display = "block";
          return;
        }
        renderResults(data2);
        return;
      }
      renderResults(data);
    } catch (err) {
      placeResults.innerHTML = `<div style="padding:8px;color:#cc0000;font-size:0.82rem;">Search failed. Manually latitude/longitude fill karein.</div>`;
      placeResults.style.display = "block";
    } finally {
      btnSearchPlace.textContent = "🔍";
      btnSearchPlace.removeAttribute("disabled");
    }
  }

  function renderResults(data: any[]) {
    placeResults.innerHTML = data.map((item: any, i: number) => {
      // Build a meaningful label: village/town + district + state
      const a = item.address || {};
      const parts: string[] = [];
      // Primary name: village, hamlet, suburb, town, city (whichever exists)
      const primary = a.village || a.hamlet || a.suburb || a.town || a.city || a.municipality || item.display_name.split(",")[0];
      const district = a.county || a.district || a.state_district || "";
      const state = a.state || "";
      if (primary) parts.push(primary.trim());
      if (district && district !== primary) parts.push(district.trim());
      if (state) parts.push(state.trim());
      const display = parts.length >= 2 ? parts.join(", ") : item.display_name.split(",").slice(0, 4).join(", ");
      return `<div class="place-result-item" data-i="${i}" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${display}"
        style="padding:8px 12px;cursor:pointer;font-size:0.82rem;border-bottom:1px solid #E8C89A;color:#3a1a00;"
        onmouseover="this.style.background='#FFF0DC'" onmouseout="this.style.background=''">${display}</div>`;
    }).join("");
    placeResults.style.display = "block";
    placeResults.querySelectorAll(".place-result-item").forEach((el) => {
      el.addEventListener("click", () => {
        const lat = parseFloat((el as HTMLElement).dataset.lat!);
        const lon = parseFloat((el as HTMLElement).dataset.lon!);
        const name = (el as HTMLElement).dataset.name!;
        latInput.value = lat.toFixed(6);
        lonInput.value = lon.toFixed(6);
        placeSearchInput.value = name;
        placeResults.style.display = "none";
        placeConfirmed.textContent = `✓ ${name} (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
        placeConfirmed.style.display = "block";
      });
    });
  }

  btnSearchPlace.addEventListener("click", (e) => { e.preventDefault(); searchPlace(); });
  placeSearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); searchPlace(); } });

  // GPS button
  btnGps.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const pos = await requestLocation();
      latInput.value = String(pos.lat);
      lonInput.value = String(pos.lon);
      showToast("Location updated");
    } catch (error) {
      showToast("Could not get location", true);
    }
  });

  // Cancel button
  btnCancel.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/kundali");
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    // Validate
    const name = nameInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    const tz = tzInput.value;

    if (!name || !date || !time || !tz || isNaN(lat) || isNaN(lon)) {
      errorBox.textContent = "Please fill in all fields";
      errorBox.style.display = "block";
      return;
    }

    if (lat < -90 || lat > 90) {
      errorBox.textContent = "Latitude must be between -90 and 90";
      errorBox.style.display = "block";
      return;
    }

    if (lon < -180 || lon > 180) {
      errorBox.textContent = "Longitude must be between -180 and 180";
      errorBox.style.display = "block";
      return;
    }

    // Disable submit button
    const submitBtn = document.getElementById("btn-submit") as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    try {
      // Birth wall-clock time in the chosen timezone -> UTC instant.
      // (The previous code measured the offset with new Date(), i.e. the
      // moment of submission, so every chart was saved with "now".)
      const wall = parseWallTime(date, time);
      if (!wall) throw new RangeError("Invalid date or time format");
      const birthDateUTC = wallTimeToUtc(wall, tz).toISOString().split(".")[0] + "Z";

      const res = await createKundali({
        label: name,
        birth_date: birthDateUTC,
        latitude: lat,
        longitude: lon,
        timezone: tz,
      });

      if (res.ok) {
        showToast("Kundali created successfully");
        navigate("/kundali");
      } else {
        const error = res.data?.error || "Failed to create kundali";
        errorBox.textContent = error;
        errorBox.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Kundali";
      }
    } catch (error) {
      console.error("Create error:", error);
      errorBox.textContent = "Error creating kundali";
      errorBox.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Kundali";
    }
  });

  // Back button
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/kundali"));
}
