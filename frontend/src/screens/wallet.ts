/**
 * Wallet Screen
 * Displays points balance, batch expiry info, and transaction history
 * Allows topup via Razorpay modal
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { getBalance } from "../api";

export async function renderWallet(): Promise<void> {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Wallet</h2>
      </header>

      <div class="wallet-container">
        <!-- Balance Card -->
        <div class="balance-card">
          <div class="balance-label">Available Points</div>
          <div class="balance-amount" id="balance-amount">—</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2); text-align: center;">
            Points expire per batch
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: var(--space-3); margin: var(--space-6) 0;">
          <button class="btn btn-secondary" style="flex: 1;" id="btn-refresh">
            Refresh
          </button>
          <button class="btn btn-primary" style="flex: 1;" id="btn-topup">
            Top Up
          </button>
        </div>

        <!-- Batch Details Section -->
        <div id="batches-section" style="display: none;">
          <h3 style="font-size: var(--font-size-md); margin-bottom: var(--space-4); color: var(--color-text);">
            Active Batches
          </h3>
          <div id="batches-list" style="display: flex; flex-direction: column; gap: var(--space-3);"></div>
        </div>

        <!-- Transaction History -->
        <div style="margin-top: var(--space-8);">
          <h3 style="font-size: var(--font-size-md); margin-bottom: var(--space-4); color: var(--color-text);">
            Recent Activity
          </h3>
          <div id="transactions-list" style="display: flex; flex-direction: column; gap: var(--space-3);"></div>
          <div id="no-transactions" style="text-align: center; padding: var(--space-6); color: var(--color-text-secondary); font-size: var(--font-size-sm);">
            No transactions yet
          </div>
        </div>

        <!-- Error Box -->
        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
      </div>
    </div>
  `;

  const btnBack = document.getElementById("btn-back")!;
  const btnRefresh = document.getElementById("btn-refresh")!;
  const btnTopup = document.getElementById("btn-topup")!;
  const balanceAmount = document.getElementById("balance-amount")!;
  const batchesSection = document.getElementById("batches-section")!;
  const batchesList = document.getElementById("batches-list")!;
  const transactionsList = document.getElementById("transactions-list")!;
  const noTransactions = document.getElementById("no-transactions")!;
  const errorBox = document.getElementById("error-box")!;

  async function loadBalance(): Promise<void> {
    errorBox.style.display = "none";
    balanceAmount.textContent = "Loading...";
    btnRefresh.disabled = true;
    btnTopup.disabled = true;

    try {
      const res = await getBalance();

      if (res.ok) {
        const data = res.data;

        // Display total balance
        balanceAmount.textContent = String(data.total_points ?? 0);

        // Display batches if available
        const batches = Array.isArray(data.batches) ? data.batches : [];
        if (batches.length > 0) {
          batchesSection.style.display = "block";
          batchesList.innerHTML = batches
            .map((batch: any) => {
              const expiryDate = new Date(batch.expires_at);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              const isExpiring = daysUntilExpiry <= 7;
              const status = batch.status === "active" ? "Active" : batch.status === "held" ? "Held" : "Expired";

              return `
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${isExpiring ? "#ef4444" : "#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${batch.source === "free_trial" ? "Free Trial" : batch.source === "subscription" ? "Subscription" : batch.source === "referral" ? "Referral" : "Top-up"}</strong>
                    <span style="background: ${batch.status === "active" ? "#d1fae5" : batch.status === "held" ? "#fef3c7" : "#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${batch.status === "active" ? "#047857" : batch.status === "held" ? "#92400e" : "#6b7280"}; font-weight: bold;">
                      ${status}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${batch.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${expiryDate.toLocaleDateString("en-IN")}
                      ${isExpiring && batch.status === "active" ? ` (${daysUntilExpiry}d left)` : ""}
                    </span>
                  </div>
                </div>
              `;
            })
            .join("");
        } else {
          batchesSection.style.display = "none";
        }

        // Display transactions if available
        const transactions = Array.isArray(data.transactions) ? data.transactions : [];
        if (transactions.length > 0) {
          noTransactions.style.display = "none";
          transactionsList.innerHTML = transactions
            .slice(0, 10)
            .map((tx: any) => {
              const date = new Date(tx.created_at);
              const type = tx.type === "debit" ? "-" : "+";
              const typeColor = tx.type === "debit" ? "#dc2626" : "#10b981";
              const label = tx.description || (tx.type === "debit" ? "Query" : "Credit");

              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${typeColor};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${label}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${date.toLocaleDateString("en-IN")} ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${typeColor};">
                      ${type}${tx.amount}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("");
        } else {
          noTransactions.style.display = "block";
          transactionsList.innerHTML = "";
        }
      } else {
        const error = res.data?.error || "Failed to load wallet";
        errorBox.textContent = error;
        errorBox.style.display = "block";
        balanceAmount.textContent = "Error";
      }
    } catch (error) {
      console.error("Wallet load error:", error);
      errorBox.textContent = "Error loading wallet";
      errorBox.style.display = "block";
      balanceAmount.textContent = "Error";
    } finally {
      btnRefresh.disabled = false;
      btnTopup.disabled = false;
    }
  }

  // Back button
  btnBack.addEventListener("click", () => navigate("/dashboard"));

  // Refresh button
  btnRefresh.addEventListener("click", loadBalance);

  // Top-up button (opens Razorpay modal)
  btnTopup.addEventListener("click", () => {
    showToast("Opening payment gateway...", false);
    // TODO: Wire up Razorpay modal here
    // For now, just show a placeholder
    navigate("/orders");
  });

  // Initial load
  loadBalance();
}
