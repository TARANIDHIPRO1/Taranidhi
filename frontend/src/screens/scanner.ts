/**
 * Muhurta Scanner Screen
 * Find auspicious dates/times for an activity
 * Shows scoring across a date range
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { listKundalis, muhurtaScan } from "../api";

const CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "marriage", label: "Marriage" },
  { value: "business", label: "Business" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "general", label: "General" },
];

export async function renderScanner(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Scanner</h2>
      </header>

      <div class="muhurta-form">
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          ℹ️ Find auspicious dates for your activity across a date range
        </div>

        <form id="form">
          <div class="form-group">
            <label for="kundali">Select Kundali *</label>
            <select id="kundali" required>
              <option value="">-- Loading kundalis --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Activity Category *</label>
            <select id="category" required>
              <option value="">-- Select category --</option>
              ${CATEGORIES.map((cat) => `<option value="${cat.value}">${cat.label}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="from-date">Start Date *</label>
            <input id="from-date" type="date" required />
          </div>

          <div class="form-group">
            <label for="to-date">End Date *</label>
            <input id="to-date" type="date" required />
          </div>

          <div class="form-group">
            <label for="top-n">Top N Results (optional)</label>
            <input id="top-n" type="number" min="1" max="20" value="5" placeholder="5" />
          </div>

          <div class="form-group">
            <label for="location">Location (auto-filled from kundali)</label>
            <input id="location" type="text" disabled style="background-color: var(--color-bg-secondary);" />
          </div>

          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
            <button type="button" class="btn btn-secondary" id="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit">
              Scan Dates
            </button>
          </div>
        </form>

        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>

        <div id="results" style="display: none; margin-top: var(--space-6);"></div>
      </div>
    </div>
  `;

  const form = document.getElementById("form") as HTMLFormElement;
  const kundaliSel = document.getElementById("kundali") as HTMLSelectElement;
  const categorySel = document.getElementById("category") as HTMLSelectElement;
  const fromDateInput = document.getElementById("from-date") as HTMLInputElement;
  const toDateInput = document.getElementById("to-date") as HTMLInputElement;
  const topNInput = document.getElementById("top-n") as HTMLInputElement;
  const locationInput = document.getElementById("location") as HTMLInputElement;
  const btnCancel = document.getElementById("btn-cancel")!;
  const errorBox = document.getElementById("error-box")!;
  const resultsDiv = document.getElementById("results")!;

  // Set default dates (today to 30 days from now)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  fromDateInput.value = today.toISOString().split("T")[0];
  toDateInput.value = thirtyDaysFromNow.toISOString().split("T")[0];

  // Load kundalis
  try {
    const res = await listKundalis();
    const kundalis = (res.ok && Array.isArray(res.data?.kundalis)) ? res.data.kundalis : [];

    if (kundalis.length === 0) {
      showToast("Please create a kundali first", true);
      navigate("/kundali-form");
      return;
    }

    kundaliSel.innerHTML = kundalis
      .map((k: any) => `<option value="${k.id}" data-lat="${k.latitude}" data-lon="${k.longitude}">${k.label || "Unnamed"}</option>`)
      .join("");

    // Set location from first kundali
    kundaliSel.addEventListener("change", () => {
      const selected = kundaliSel.options[kundaliSel.selectedIndex];
      const lat = selected.getAttribute("data-lat");
      const lon = selected.getAttribute("data-lon");
      locationInput.value = lat && lon ? `${lat}, ${lon}` : "";
    });

    // Trigger initial location fill
    kundaliSel.dispatchEvent(new Event("change"));
  } catch (error) {
    console.error("Failed to load kundalis:", error);
    showToast("Failed to load kundalis", true);
  }

  // Cancel button
  btnCancel.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/dashboard");
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    resultsDiv.style.display = "none";

    const kundaliId = parseInt(kundaliSel.value);
    const category = categorySel.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;
    const topN = parseInt(topNInput.value) || 5;

    if (!kundaliId || !category || !fromDate || !toDate) {
      errorBox.textContent = "Please fill all required fields";
      errorBox.style.display = "block";
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      errorBox.textContent = "Start date must be before end date";
      errorBox.style.display = "block";
      return;
    }

    const submitBtn = document.getElementById("btn-submit") as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = "Scanning...";

    try {
      const selected = kundaliSel.options[kundaliSel.selectedIndex];
      const lat = parseFloat(selected.getAttribute("data-lat") || "0");
      const lon = parseFloat(selected.getAttribute("data-lon") || "0");

      const res = await muhurtaScan({
        lat,
        lon,
        purpose: category,
        kundali_id: kundaliId,
        from: fromDate,
        to: toDate,
        top_n: topN,
      });

      if (res.ok) {
        const data = res.data;
        const results = data.results || [];

        if (results.length === 0) {
          resultsDiv.innerHTML = `
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `;
        } else {
          resultsDiv.innerHTML = `
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${results.length} Auspicious Dates</h3>
              ${results
                .map(
                  (r: any, i: number) => `
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${r.muhurta_pct > 70 ? "#10b981" : "#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${i + 1}: ${new Date(r.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${r.muhurta_pct > 70 ? "#d1fae5" : "#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${r.muhurta_pct > 70 ? "#047857" : "#92400e"}; font-weight: bold;">
                      ${r.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${r.best_time || "All day auspicious"}
                  </p>
                </div>
              `
                )
                .join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `;
        }
        resultsDiv.style.display = "block";
      } else {
        const error = res.data?.error || "Failed to scan dates";
        errorBox.textContent = error;
        errorBox.style.display = "block";
      }
    } catch (error) {
      console.error("Scan error:", error);
      errorBox.textContent = "Error scanning dates";
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Scan Dates";
    }
  });

  // Back button
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));
}
