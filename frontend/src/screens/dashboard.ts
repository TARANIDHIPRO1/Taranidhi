/**
 * Dashboard — Time Intelligence Hub
 *
 * Design principle: Birth chart is the FOUNDATION.
 * New users → onboarding (setup birth profile first).
 * Returning users → personalized intelligence dashboard.
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";
import { listKundalis, getKundaliChart, muhurtaNow } from "../api";

// Rashi names
const RASHI = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

export async function renderDashboard() {
  const app = $app();
  clear(app);

  // Show skeleton while loading
  app.innerHTML = `
    <div class="screen ti-screen">
      <div class="ti-loading">
        <div class="ti-logo">OCCULTVIISION</div>
        <div class="ti-tagline">Loading your time intelligence…</div>
      </div>
    </div>
  `;

  // Fetch user's kundalis
  const res = await listKundalis();
  const kundalis = res.ok ? (res.data.kundalis ?? []) : [];
  const primaryKundali = kundalis[0] ?? null;

  if (!primaryKundali) {
    renderOnboarding(app);
  } else {
    renderIntelligenceDashboard(app, primaryKundali, kundalis);
  }
}

// ── ONBOARDING (no birth chart yet) ────────────────────────────────────────

function renderOnboarding(app: HTMLElement) {
  app.innerHTML = `
    <div class="screen ti-screen">
      <header class="ti-header">
        <div class="ti-brand">
          <span class="ti-brand-name">OCCULTVIISION</span>
          <span class="ti-brand-tag">TIME INTELLIGENCE</span>
        </div>
        <button id="btn-logout" class="ti-logout">Sign out</button>
      </header>

      <div class="ti-onboarding">
        <div class="ti-onboard-hero">
          <div class="ti-onboard-icon">◉</div>
          <h2 class="ti-onboard-title">Set Up Your Time Profile</h2>
          <p class="ti-onboard-sub">
            Every insight is personalised to your birth chart.<br>
            Create it once — unlock intelligence for life.
          </p>
          <button class="ti-cta-primary" id="btn-create-chart">
            Create Birth Profile →
          </button>
        </div>

        <div class="ti-feature-grid">
          <div class="ti-feature">
            <div class="ti-feature-icon">◈</div>
            <div class="ti-feature-label">Personalised Muhurta</div>
            <div class="ti-feature-desc">Right timing for every decision — career, property, launch</div>
          </div>
          <div class="ti-feature">
            <div class="ti-feature-icon">◎</div>
            <div class="ti-feature-label">Dasha Intelligence</div>
            <div class="ti-feature-desc">Know exactly which planetary cycle you're in & what it means</div>
          </div>
          <div class="ti-feature">
            <div class="ti-feature-icon">◇</div>
            <div class="ti-feature-label">KP Precision</div>
            <div class="ti-feature-desc">Sub-lord analysis — promise or denial for any question</div>
          </div>
          <div class="ti-feature">
            <div class="ti-feature-icon">◆</div>
            <div class="ti-feature-label">Live Hora Feed</div>
            <div class="ti-feature-desc">Real-time planetary hour scoring, updated every minute</div>
          </div>
        </div>
      </div>

      <footer class="ti-footer">
        <span>Powered by KP Astrology · Lahiri Ayanamsa · Placidus Houses</span>
      </footer>
    </div>
  `;

  document.getElementById("btn-create-chart")!.addEventListener("click", () => navigate("/kundali/new"));
  document.getElementById("btn-logout")!.addEventListener("click", () => {
    localStorage.removeItem("ov_session");
    window.location.reload();
  });
}

// ── INTELLIGENCE DASHBOARD (has birth chart) ────────────────────────────────

async function renderIntelligenceDashboard(app: HTMLElement, primaryKundali: any, kundalis: any[]) {
  // Fetch chart data
  const chartRes = await getKundaliChart(primaryKundali.id);
  const chart = chartRes.ok ? chartRes.data.chart : null;

  // Fetch live muhurta (use Bhopal as fallback if no location)
  const muhurtaRes = await muhurtaNow(23.2585, 77.402, undefined, primaryKundali.id);
  const live = muhurtaRes.ok ? muhurtaRes.data : null;

  // Parse chart data
  const asc = chart?.ascendant;
  const dasha = chart?.dasha;
  const janmaNak = chart?.janmaNakshatra;
  const tara = chart?.tara;

  // Format dasha dates
  const mahaEnd = dasha ? new Date(dasha.maha.end).getFullYear() : "—";
  const antarEnd = dasha ? formatDate(new Date(dasha.antar.end)) : "—";

  // Live hora
  const horaLord = live?.hora?.lord ?? "—";
  const horaScore = live?.score ?? "—";
  const horaUntil = live?.hora?.end ? formatTime(new Date(live.hora.end)) : "—";

  // Tara beneficence
  const taraColor = tara?.beneficence === "benefic" ? "#4ade80" : tara?.beneficence === "malefic" ? "#f87171" : "#fbbf24";
  const taraLabel = tara ? `${tara.name} (${tara.number})` : "—";

  app.innerHTML = `
    <div class="screen ti-screen">

      <!-- Header -->
      <header class="ti-header">
        <div class="ti-brand">
          <span class="ti-brand-name">OCCULTVIISION</span>
          <span class="ti-brand-tag">TIME INTELLIGENCE</span>
        </div>
        <div class="ti-header-right">
          <span class="ti-live-dot"></span>
          <span class="ti-live-label">LIVE</span>
          <button id="btn-logout" class="ti-logout">Sign out</button>
        </div>
      </header>

      <!-- Live Time Strip -->
      <div class="ti-live-strip">
        <div class="ti-live-item">
          <div class="ti-live-value">${horaLord}</div>
          <div class="ti-live-key">Current Hora</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${horaScore}/100</div>
          <div class="ti-live-key">Muhurta Score</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value" style="color:${taraColor}">${tara?.number ?? "—"}</div>
          <div class="ti-live-key">Tara Now</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${horaUntil}</div>
          <div class="ti-live-key">Hora Until</div>
        </div>
      </div>

      <!-- Birth Profile Card -->
      <div class="ti-section-label">YOUR TIME PROFILE</div>
      <div class="ti-profile-card" id="btn-open-chart">
        <div class="ti-profile-left">
          <div class="ti-profile-name">${primaryKundali.label ?? "My Chart"}</div>
          <div class="ti-profile-lagna">
            ${asc ? `${asc.rashiName} Ascendant · ${asc.nakName} Pada ${asc.nakPada}` : "—"}
          </div>
          <div class="ti-profile-nak">
            Moon: ${janmaNak ? `${janmaNak.name} · Lord ${janmaNak.lord}` : "—"}
          </div>
        </div>
        <div class="ti-profile-right">
          <div class="ti-dasha-block">
            <div class="ti-dasha-lord">${dasha?.maha.lord ?? "—"}</div>
            <div class="ti-dasha-label">Maha Dasha · ends ${mahaEnd}</div>
          </div>
          <div class="ti-dasha-block" style="margin-top:6px">
            <div class="ti-dasha-lord ti-dasha-antar">${dasha?.antar.lord ?? "—"}</div>
            <div class="ti-dasha-label">Antar Dasha · until ${antarEnd}</div>
          </div>
        </div>
        <div class="ti-profile-arrow">›</div>
      </div>

      <!-- Intelligence Actions -->
      <div class="ti-section-label">INTELLIGENCE TOOLS</div>
      <div class="ti-action-grid">

        <button class="ti-action-card ti-action-primary" data-route="/muhurta">
          <div class="ti-action-icon">◉</div>
          <div class="ti-action-body">
            <div class="ti-action-title">Muhurta Now</div>
            <div class="ti-action-desc">Live planetary hour & score</div>
          </div>
          <div class="ti-action-arrow">›</div>
        </button>

        <button class="ti-action-card" data-route="/scanner">
          <div class="ti-action-icon">◈</div>
          <div class="ti-action-body">
            <div class="ti-action-title">Date Scanner</div>
            <div class="ti-action-desc">Find your best windows ahead</div>
          </div>
          <div class="ti-action-arrow">›</div>
        </button>

        <button class="ti-action-card" data-route="/kp-query">
          <div class="ti-action-icon">◎</div>
          <div class="ti-action-body">
            <div class="ti-action-title">KP Analysis</div>
            <div class="ti-action-desc">Promise / Denied for any question</div>
          </div>
          <div class="ti-action-arrow">›</div>
        </button>

        <button class="ti-action-card" data-route="/dasha-timeline">
          <div class="ti-action-icon">◇</div>
          <div class="ti-action-body">
            <div class="ti-action-title">Dasha Timeline</div>
            <div class="ti-action-desc">120-yr Vimshottari map</div>
          </div>
          <div class="ti-action-arrow">›</div>
        </button>

      </div>

      <!-- Decision Muhurta -->
      <div class="ti-section-label">DECISION INTELLIGENCE</div>
      <div class="ti-decision-row">
        <button class="ti-decision-btn" data-route="/event-muhurta?purpose=property">
          <span class="ti-decision-icon">⬡</span>
          <span>Property</span>
        </button>
        <button class="ti-decision-btn" data-route="/event-muhurta?purpose=career">
          <span class="ti-decision-icon">⬡</span>
          <span>Career</span>
        </button>
        <button class="ti-decision-btn" data-route="/event-muhurta?purpose=business">
          <span class="ti-decision-icon">⬡</span>
          <span>Launch</span>
        </button>
        <button class="ti-decision-btn" data-route="/event-muhurta?purpose=marriage">
          <span class="ti-decision-icon">⬡</span>
          <span>Marriage</span>
        </button>
        <button class="ti-decision-btn" data-route="/event-muhurta?purpose=medical">
          <span class="ti-decision-icon">⬡</span>
          <span>Medical</span>
        </button>
      </div>

      <!-- Secondary tools -->
      <div class="ti-secondary-row">
        <button class="ti-secondary-btn" data-route="/kp">KP Chart</button>
        <button class="ti-secondary-btn" data-route="/kp-sublords">Sub-Lords</button>
        <button class="ti-secondary-btn" data-route="/muhurta-dashboard">Muhurta Dashboard</button>
        <button class="ti-secondary-btn" data-route="/wallet">Wallet</button>
        <button class="ti-secondary-btn" data-route="/kundali">All Charts</button>
      </div>

      <footer class="ti-footer">
        <span>KP · Lahiri Ayanamsa · Placidus Houses · Vimshottari Dasha</span>
      </footer>

    </div>
  `;

  // Open chart
  document.getElementById("btn-open-chart")!.addEventListener("click", () => {
    navigate(`/kundali/${primaryKundali.id}/chart`);
  });

  // Action cards
  app.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", () => navigate((el as HTMLElement).dataset.route!));
  });

  // Logout
  document.getElementById("btn-logout")!.addEventListener("click", () => {
    localStorage.removeItem("ov_session");
    window.location.reload();
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
