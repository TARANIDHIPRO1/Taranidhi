import { $app, clear } from "../dom";
import { navigate } from "../router";
import { walletBalance } from "../api";

export function renderDashboard() {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen dashboard-screen">
      <header class="app-header">
        <h1>OccultViision</h1>
        <div id="balance-badge" class="badge">...</div>
      </header>

      <div class="card-grid">
        <button class="card" data-route="/muhurta">
          <span class="card-icon">☉</span>
          <span class="card-label">Muhurta Now</span>
          <span class="card-desc">Current hora &amp; score</span>
        </button>

        <button class="card" data-route="/scanner">
          <span class="card-icon">📅</span>
          <span class="card-label">Date Scanner</span>
          <span class="card-desc">Find best muhurta windows</span>
        </button>

        <button class="card" data-route="/kp">
          <span class="card-icon">🔮</span>
          <span class="card-label">KP Chart</span>
          <span class="card-desc">Placidus cusps &amp; sub-lords</span>
        </button>

        <button class="card" data-route="/kp-query">
          <span class="card-icon">❓</span>
          <span class="card-label">KP Query</span>
          <span class="card-desc">Promise / Denied verdict</span>
        </button>

        <button class="card" data-route="/kundali">
          <span class="card-icon">👤</span>
          <span class="card-label">My Kundalis</span>
          <span class="card-desc">Manage birth charts</span>
        </button>

        <button class="card" data-route="/wallet">
          <span class="card-icon">💰</span>
          <span class="card-label">Wallet</span>
          <span class="card-desc">Balance &amp; history</span>
        </button>

        <button class="card" data-route="/referral">
          <span class="card-icon">🤝</span>
          <span class="card-label">Refer &amp; Earn</span>
          <span class="card-desc">Share your referral code</span>
        </button>

        <button class="card card--v6" data-route="/kundali">
          <span class="card-icon">🪐</span>
          <span class="card-label">Dasha Timeline</span>
          <span class="card-desc">120-yr Vimshottari cycles</span>
        </button>

        <button class="card card--v6" data-route="/kundali">
          <span class="card-icon">🔗</span>
          <span class="card-label">KP Sub-Lords</span>
          <span class="card-desc">Cusp &amp; planet KP chains</span>
        </button>

        <button class="card card--v6" data-route="/kundali">
          <span class="card-icon">📊</span>
          <span class="card-label">Muhurta Dashboard</span>
          <span class="card-desc">Personalised Tara &amp; Hora</span>
        </button>
      </div>

      <footer class="app-footer">
        <button id="btn-logout" class="btn-link">Logout</button>
      </footer>
    </div>
  `;

  // Load balance
  walletBalance().then((res) => {
    const badge = document.getElementById("balance-badge")!;
    if (res.ok) {
      badge.textContent = `${res.data.balance ?? 0} pts`;
    } else {
      badge.textContent = "—";
    }
  });

  // Card navigation
  app.querySelectorAll(".card[data-route]").forEach((card) => {
    card.addEventListener("click", () => {
      navigate((card as HTMLElement).dataset.route!);
    });
  });

  // Logout
  document.getElementById("btn-logout")!.addEventListener("click", () => {
    localStorage.removeItem("ov_session");
    navigate("/login");
    window.location.reload();
  });
}
