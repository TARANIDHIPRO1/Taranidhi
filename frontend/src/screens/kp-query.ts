/**
 * KP Query Screen
 * Same-day KP Horary question: verdict + confidence
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { listKundalis, kpQuery, kpActivities } from "../api";

export async function renderKpQuery(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>KP Query Window</h2>
      </header>

      <div class="muhurta-form">
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          ℹ️ KP Query is valid for <strong>same-day only</strong> (current moment). Use your question as context.
        </div>

        <form id="form">
          <div class="form-group">
            <label for="kundali">Select Kundali *</label>
            <select id="kundali" required>
              <option value="">-- Loading kundalis --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="activity">Your Question / Activity *</label>
            <select id="activity" required>
              <option value="">-- Select from list --</option>
            </select>
          </div>

          <div class="form-group">
            <label>Current Time (auto-filled)</label>
            <input id="query-time" type="text" disabled style="background-color: var(--color-bg-secondary);" />
          </div>

          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
            <button type="button" class="btn btn-secondary" id="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit">
              Check Now
            </button>
          </div>
        </form>

        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>

        <div id="result" style="display: none; margin-top: var(--space-6);"></div>
      </div>
    </div>
  `;

  const form = document.getElementById("form") as HTMLFormElement;
  const kundaliSel = document.getElementById("kundali") as HTMLSelectElement;
  const activitySel = document.getElementById("activity") as HTMLSelectElement;
  const queryTimeInput = document.getElementById("query-time") as HTMLInputElement;
  const btnCancel = document.getElementById("btn-cancel")!;
  const errorBox = document.getElementById("error-box")!;
  const resultDiv = document.getElementById("result")!;

  // Set current time (read-only)
  const now = new Date();
  queryTimeInput.value = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

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
      .map((k: any) => `<option value="${k.id}">${k.label || "Unnamed"}</option>`)
      .join("");
  } catch (error) {
    console.error("Failed to load kundalis:", error);
    showToast("Failed to load kundalis", true);
  }

  // Load activities
  try {
    const res = await kpActivities();
    const activities = (res.ok && Array.isArray(res.data?.activities)) ? res.data.activities : [];

    activitySel.innerHTML =
      '<option value="">-- Select --</option>' +
      activities
        .map((a: any) => `<option value="${a.code}">${a.name}</option>`)
        .join("");
  } catch (error) {
    console.error("Failed to load activities:", error);
    showToast("Failed to load activities", true);
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
    resultDiv.style.display = "none";

    const kundaliId = parseInt(kundaliSel.value);
    const activity = activitySel.value;

    if (!kundaliId || !activity) {
      errorBox.textContent = "Please select both kundali and activity";
      errorBox.style.display = "block";
      return;
    }

    const submitBtn = document.getElementById("btn-submit") as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = "Checking...";

    try {
      const res = await kpQuery(kundaliId, activity);

      if (res.ok) {
        const data = res.data;
        resultDiv.innerHTML = `
          <div class="result-box">
            <div style="text-align: center; margin-bottom: var(--space-6);">
              <div style="font-size: 2.5rem; font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${data.verdict === "PROMISED" ? "✅" : "❌"}
              </div>
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${data.verdict}
              </div>
              <div style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
                Confidence: <strong>${data.confidence || 0}%</strong>
              </div>
            </div>

            <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
              <h3 style="margin-bottom: var(--space-3);">Analysis</h3>
              <div style="font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                <p><strong>House:</strong> ${data.house}</p>
                <p><strong>Cusp Nakshatra:</strong> ${data.cusp_nakshatra || "—"}</p>
                <p><strong>Sub-Lord:</strong> ${data.sub_lord || "—"}</p>
                <p><strong>Dasha Status:</strong> ${data.dasha_status || "—"}</p>
                <p><strong>Tarabala:</strong> ${data.tarabala || "—"}</p>
                <p><strong>Panchaka:</strong> ${data.panchaka ? "⚠️ Active" : "✓ Absent"}</p>
                ${data.ganda_moola ? '<p><strong>Ganda Moola:</strong> ⚠️ Active</p>' : ""}
              </div>
            </div>

            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
              Query time: ${new Date(data.timestamp).toLocaleTimeString("en-IN")}
            </div>
          </div>
        `;
        resultDiv.style.display = "block";
      } else {
        const error = res.data?.error || "Failed to query KP";
        errorBox.textContent = error;
        errorBox.style.display = "block";
      }
    } catch (error) {
      console.error("Query error:", error);
      errorBox.textContent = "Error processing query";
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Check Now";
    }
  });

  // Back button
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));
}
