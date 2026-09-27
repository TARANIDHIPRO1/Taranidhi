/**
 * Kundali Form Screen
 * Create or edit a birth chart (name, date, time, location, timezone)
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { createKundali } from "../api";
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
          <label>Location</label>
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
            <button type="button" class="btn btn-small" id="btn-gps">📍</button>
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

      <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
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
  const btnCancel = document.getElementById("btn-cancel")!;
  const errorBox = document.getElementById("error-box")!;

  // Set today as default birth date
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  // Pre-fill location from cache
  const cached = getCachedLocation();
  if (cached) {
    latInput.value = String(cached.lat);
    lonInput.value = String(cached.lon);
  }

  // Default timezone to India
  tzInput.value = "Asia/Kolkata";

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
      // Combine date + time into local ISO string
      const [year, month, day] = date.split("-");
      const [hours, minutes] = time.split(":");
      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

      // Convert local time to UTC using the timezone
      // We create a date string, pass it through Intl to understand the timezone offset
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Create a UTC date from the local time parts
      const localDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

      // Get the offset between UTC and the specified timezone
      // by comparing what the formatter thinks the UTC time is vs actual local time
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(new Date());

      const tzDate = new Date(
        parseInt(parts.find((p) => p.type === "year")?.value || "2000"),
        parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1,
        parseInt(parts.find((p) => p.type === "day")?.value || "1"),
        parseInt(parts.find((p) => p.type === "hour")?.value || "0"),
        parseInt(parts.find((p) => p.type === "minute")?.value || "0"),
        parseInt(parts.find((p) => p.type === "second")?.value || "0")
      );

      const offsetMs = localDate.getTime() - tzDate.getTime();
      const utcTime = new Date(localDate.getTime() - offsetMs);
      const birthDateUTC = utcTime.toISOString().split(".")[0]; // Remove milliseconds

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
