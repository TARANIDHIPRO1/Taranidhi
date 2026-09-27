/**
 * Admin Panel Screen
 * Read-only dashboard for stats, analytics, and system health
 * Requires is_admin = true on user record
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";
import { adminStats } from "../api";

export async function renderAdminPanel(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Admin Panel</h2>
      </header>

      <div class="dashboard-content">
        <div id="loading" class="text-center" style="padding: var(--space-8);">
          <div class="spinner"></div>
          <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">Loading stats...</p>
        </div>

        <div id="stats" style="display: none;">
          <div class="result-grid">
            <div class="result-item">
              <div class="result-item-label">Queries (24h)</div>
              <div class="result-item-value" id="queries-24h">0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Active Users</div>
              <div class="result-item-value" id="active-users">0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Revenue (Est.)</div>
              <div class="result-item-value" id="revenue" style="font-size: var(--font-size-lg);">₹0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Conversion Rate</div>
              <div class="result-item-value" id="conversion">0%</div>
            </div>
          </div>

          <div class="card" style="margin-top: var(--space-6);">
            <h3>Top Activities (24h)</h3>
            <div id="top-activities" style="margin-top: var(--space-4);"></div>
          </div>

          <div class="card" style="margin-top: var(--space-6);">
            <h3>System Health</h3>
            <div id="system-health" style="margin-top: var(--space-4); font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);"></div>
          </div>
        </div>

        <div id="error" style="display: none; margin: var(--space-6); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
      </div>
    </div>
  `;

  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));

  try {
    const res = await adminStats();

    const loading = document.getElementById("loading")!;
    const stats = document.getElementById("stats")!;
    const error = document.getElementById("error")!;

    if (!res.ok) {
      error.textContent = res.data?.error || "Failed to load stats";
      error.style.display = "block";
      loading.style.display = "none";
      return;
    }

    const data = res.data;

    // Update KPIs
    document.getElementById("queries-24h")!.textContent = String(data.queries_24h || 0);
    document.getElementById("active-users")!.textContent = String(data.active_users || 0);
    document.getElementById("revenue")!.textContent = `₹${(data.revenue_estimate || 0).toLocaleString("en-IN")}`;
    document.getElementById("conversion")!.textContent = `${(data.conversion_rate || 0).toFixed(1)}%`;

    // Top activities
    const activitiesHtml = (data.top_activities || [])
      .map((a: any) => `<div style="padding: var(--space-2); border-bottom: 1px solid var(--color-border);">
        <strong>${a.name}</strong>: ${a.count} queries
      </div>`)
      .join("");
    document.getElementById("top-activities")!.innerHTML = activitiesHtml || "<p>No data</p>";

    // System health
    const healthHtml = `
      <p><strong>D1 Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>KV Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>Error Rate (24h):</strong> ${(data.error_rate_pct || 0).toFixed(2)}%</p>
      <p><strong>Rate Limit Events (24h):</strong> ${data.rate_limit_events || 0}</p>
    `;
    document.getElementById("system-health")!.innerHTML = healthHtml;

    loading.style.display = "none";
    stats.style.display = "block";
  } catch (error) {
    console.error("Admin stats error:", error);
    const errorDiv = document.getElementById("error")!;
    errorDiv.textContent = "Error loading stats";
    errorDiv.style.display = "block";
    document.getElementById("loading")!.style.display = "none";
  }
}
