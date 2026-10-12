/**
 * Referral Screen
 * Displays user's referral code, commission tracking, and referred users
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { referralCode } from "../api";

export async function renderReferral(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Referral Program</h2>
      </header>

      <div class="referral-container">
        <!-- Info Banner -->
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--text-primary);">
          ℹ️ Earn 20% commission on each referral's first purchase. Commissions are held for 30 days (chargeback window), then activated.
        </div>

        <!-- Your Referral Code -->
        <div style="background-color: var(--color-bg); padding: var(--space-6); border-radius: var(--radius-md); border: 2px solid var(--color-primary); margin-bottom: var(--space-6); text-align: center;">
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2);">
            Your Referral Code
          </div>
          <div id="referral-code" style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: var(--primary-text); margin-bottom: var(--space-4); font-family: monospace;">
            Loading...
          </div>
          <button class="btn btn-secondary" id="btn-copy" style="width: 100%;">
            📋 Copy Code
          </button>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6);">
          <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid #10b981;">
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-2);">
              Total Earned
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #10b981;" id="total-earned">
              ₹0
            </div>
          </div>

          <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid #f59e0b;">
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-2);">
              Referrals
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #f59e0b;" id="referral-count">
              0
            </div>
          </div>
        </div>

        <!-- Referred Users -->
        <div>
          <h3 style="font-size: var(--font-size-md); margin-bottom: var(--space-4); color: var(--color-text);">
            Referred Users
          </h3>
          <div id="referred-users" style="display: flex; flex-direction: column; gap: var(--space-3);"></div>
          <div id="no-referrals" style="text-align: center; padding: var(--space-6); color: var(--color-text-secondary); font-size: var(--font-size-sm);">
            No referrals yet. Share your code to start earning!
          </div>
        </div>

        <!-- Share Section -->
        <div style="margin-top: var(--space-8); padding: var(--space-4); background-color: var(--color-bg); border-radius: var(--radius-md);">
          <h3 style="font-size: var(--font-size-md); margin-bottom: var(--space-4); color: var(--color-text);">
            Share Your Code
          </h3>
          <button class="btn btn-primary" id="btn-share" style="width: 100%; margin-bottom: var(--space-3);">
            Share on WhatsApp
          </button>
          <button class="btn btn-secondary" id="btn-copy-message" style="width: 100%;">
            Copy Share Message
          </button>
        </div>

        <!-- Error Box -->
        <div id="error-box" style="display: none; margin-top: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--error-text);"></div>
      </div>
    </div>
  `;

  const btnBack = document.getElementById("btn-back")!;
  const btnCopy = document.getElementById("btn-copy")!;
  const btnShare = document.getElementById("btn-share")!;
  const btnCopyMessage = document.getElementById("btn-copy-message")!;
  const referralCodeElem = document.getElementById("referral-code")!;
  const totalEarned = document.getElementById("total-earned")!;
  const referralCount = document.getElementById("referral-count")!;
  const referredUsers = document.getElementById("referred-users")!;
  const noReferrals = document.getElementById("no-referrals")!;
  const errorBox = document.getElementById("error-box")!;

  let currentCode = "";

  async function loadReferralData(): Promise<void> {
    errorBox.style.display = "none";

    try {
      const res = await referralCode();

      if (res.ok) {
        const data = res.data;
        currentCode = data.code || "";
        const stats = data.stats || {};
        const users = Array.isArray(data.referred_users) ? data.referred_users : [];

        // Display code
        referralCodeElem.textContent = currentCode || "LOADING...";

        // Display stats
        totalEarned.textContent = `₹${stats.total_earned ?? 0}`;
        referralCount.textContent = String(stats.referral_count ?? 0);

        // Display referred users
        if (users.length > 0) {
          noReferrals.style.display = "none";
          referredUsers.innerHTML = users
            .map((user: any) => {
              const activatedDate = user.commission_activated_at ? new Date(user.commission_activated_at) : null;
              const status = user.commission_status === "active" ? "Activated" : user.commission_status === "held" ? "Held" : "Pending";
              const statusColor = user.commission_status === "active" ? "#10b981" : user.commission_status === "held" ? "#f59e0b" : "#6b7280";

              return `
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${statusColor};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${user.phone || "Anonymous"}</strong>
                    <span style="background: ${statusColor}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${statusColor}; font-weight: bold;">
                      ${status}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${user.commission_amount || 0}</span>
                    <span>${user.referred_at ? new Date(user.referred_at).toLocaleDateString("en-IN") : "—"}</span>
                  </div>
                  ${activatedDate ? `
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${activatedDate.toLocaleDateString("en-IN")}
                    </div>
                  ` : ""}
                </div>
              `;
            })
            .join("");
        } else {
          noReferrals.style.display = "block";
          referredUsers.innerHTML = "";
        }
      } else {
        const error = res.data?.error || "Failed to load referral data";
        errorBox.textContent = error;
        errorBox.style.display = "block";
      }
    } catch (error) {
      console.error("Referral load error:", error);
      errorBox.textContent = "Error loading referral data";
      errorBox.style.display = "block";
    }
  }

  // Back button
  btnBack.addEventListener("click", () => navigate("/dashboard"));

  // Copy referral code
  btnCopy.addEventListener("click", async () => {
    if (!currentCode) {
      showToast("Code not available", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(currentCode);
      showToast("Referral code copied!", false);
    } catch (e) {
      showToast("Failed to copy code", true);
    }
  });

  // Copy share message
  btnCopyMessage.addEventListener("click", async () => {
    const message = `Join me on OccultViision! Use my referral code: ${currentCode}\n\nhttps://www.occultviision.com`;
    try {
      await navigator.clipboard.writeText(message);
      showToast("Share message copied!", false);
    } catch (e) {
      showToast("Failed to copy message", true);
    }
  });

  // Share on WhatsApp
  btnShare.addEventListener("click", () => {
    const message = `Join me on OccultViision! Use my referral code: ${currentCode}\n\nhttps://www.occultviision.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });

  // Initial load
  loadReferralData();
}
