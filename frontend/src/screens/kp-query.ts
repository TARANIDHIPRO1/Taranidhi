/**
 * KP Query Window — Natural Language + Activity Picker
 *
 * Two modes:
 *  1. "Ask" tab  — user types free Hindi/English question → /kp/query-natural
 *  2. "Browse" tab — old category-based dropdown → /kp/query  (fixed field-name bug)
 *
 * PROCEED = green, WAIT = orange/yellow, AVOID = red
 */

import { $app, clear, showToast } from "../dom";
import { navigate } from "../router";
import { listKundalis, kpQuery, kpActivities, kpQueryNatural } from "../api";

// ── Verdict color map ─────────────────────────────────────────────────────────
const VERDICT_STYLE: Record<
  string,
  { bg: string; border: string; text: string; emoji: string; label: string }
> = {
  PROCEED: {
    bg: "rgba(16, 185, 129, 0.1)",
    border: "var(--color-success, #10B981)",
    text: "var(--color-success, #10B981)",
    emoji: "✅",
    label: "PROCEED",
  },
  WAIT: {
    bg: "rgba(245, 158, 11, 0.1)",
    border: "var(--color-warning, #F59E0B)",
    text: "var(--color-warning, #F59E0B)",
    emoji: "⏳",
    label: "WAIT",
  },
  AVOID: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "var(--color-danger, #EF4444)",
    text: "var(--color-danger, #EF4444)",
    emoji: "🚫",
    label: "AVOID",
  },
};

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

        <!-- Kundali selector (shared between modes) -->
        <div class="form-group" id="kundali-group">
          <label for="kundali">Select Kundali *</label>
          <select id="kundali" required>
            <option value="">— Loading kundalis —</option>
          </select>
        </div>

        <!-- Mode tabs -->
        <div style="display:flex; gap:0; margin: var(--space-4) 0 var(--space-5) 0; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow:hidden;">
          <button id="tab-ask" type="button"
            style="flex:1; padding: var(--space-3) var(--space-4); font-size: var(--font-size-sm);
                   font-weight: var(--font-weight-semibold); border:none; cursor:pointer;
                   background: var(--color-primary); color: #fff; border-radius: 0;">
            💬 Ask a Question
          </button>
          <button id="tab-browse" type="button"
            style="flex:1; padding: var(--space-3) var(--space-4); font-size: var(--font-size-sm);
                   font-weight: var(--font-weight-semibold); border:none; cursor:pointer;
                   background: var(--color-bg-secondary); color: var(--color-text-secondary); border-radius: 0;">
            📋 Browse Activities
          </button>
        </div>

        <!-- ── TAB 1: Natural language ── -->
        <div id="panel-ask">
          <div style="background-color: var(--color-primary-light); padding: var(--space-3) var(--space-4);
                      border-radius: var(--radius-md); margin-bottom: var(--space-4);
                      font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            ℹ️ Apna sawaal <strong>Hindi ya English</strong> mein likhein. Jaise:<br>
            <em>"Kya mein aaj interview ke liye ja sakta hoon?"</em><br>
            <em>"Can I sign a contract today?"</em>
          </div>

          <form id="form-ask">
            <div class="form-group">
              <label for="question">Apna Sawaal / Your Question *</label>
              <textarea id="question" rows="3" required
                placeholder="Kya mein aaj interview ke liye ja sakta hoon?..."
                style="width:100%; padding: var(--space-3); border: 1px solid var(--color-border);
                       border-radius: var(--radius-md); font-size: var(--font-size-base);
                       font-family: inherit; resize: vertical; background: var(--color-bg);
                       color: var(--color-text);"></textarea>
            </div>

            <!-- Live auto-match preview -->
            <div id="intent-preview" style="display:none; margin: var(--space-2) 0 var(--space-4) 0;
                 padding: var(--space-2) var(--space-3);
                 background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3);
                 border-radius: var(--radius-sm); font-size: var(--font-size-sm);">
              🎯 Detected: <strong id="intent-label"></strong>
              <span id="intent-confidence" style="color: var(--color-text-secondary); margin-left: var(--space-2);"></span>
            </div>

            <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-secondary" id="btn-cancel-ask">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-ask">
                🔍 Get KP Verdict
              </button>
            </div>
          </form>
        </div>

        <!-- ── TAB 2: Activity picker ── -->
        <div id="panel-browse" style="display:none;">
          <div style="background-color: var(--color-primary-light); padding: var(--space-3) var(--space-4);
                      border-radius: var(--radius-md); margin-bottom: var(--space-4);
                      font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            ℹ️ KP Query is valid for <strong>same-day only</strong> (current moment).
          </div>

          <form id="form-browse">
            <div class="form-group">
              <label for="category">Category</label>
              <select id="category">
                <option value="">— All Categories —</option>
              </select>
            </div>

            <div class="form-group">
              <label for="activity">Activity *</label>
              <select id="activity" required>
                <option value="">— Loading activities —</option>
              </select>
            </div>

            <div class="form-group">
              <label>Current Time (auto-filled)</label>
              <input id="query-time" type="text" disabled
                style="background-color: var(--color-bg-secondary);" />
            </div>

            <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4);">
              <button type="button" class="btn btn-secondary" id="btn-cancel-browse">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btn-browse">
                Check Now
              </button>
            </div>
          </form>
        </div>

        <!-- Error box (shared) -->
        <div id="error-box" style="display:none; margin: var(--space-4) 0;
             padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1);
             border: 1px solid var(--color-danger); border-radius: var(--radius-md);
             color: var(--error-text); font-size: var(--font-size-sm);"></div>

        <!-- Result panel (shared) -->
        <div id="result" style="display:none; margin-top: var(--space-6);"></div>

      </div>
    </div>
  `;

  // ── References ───────────────────────────────────────────────────────────────
  const kundaliSel = document.getElementById("kundali") as HTMLSelectElement;
  const tabAsk = document.getElementById("tab-ask") as HTMLButtonElement;
  const tabBrowse = document.getElementById("tab-browse") as HTMLButtonElement;
  const panelAsk = document.getElementById("panel-ask")!;
  const panelBrowse = document.getElementById("panel-browse")!;
  const questionTA = document.getElementById("question") as HTMLTextAreaElement;
  const intentPreview = document.getElementById("intent-preview")!;
  const intentLabel = document.getElementById("intent-label")!;
  const intentConfidence = document.getElementById("intent-confidence")!;
  const categorySel = document.getElementById("category") as HTMLSelectElement;
  const activitySel = document.getElementById("activity") as HTMLSelectElement;
  const queryTimeInput = document.getElementById("query-time") as HTMLInputElement;
  const errorBox = document.getElementById("error-box")!;
  const resultDiv = document.getElementById("result")!;

  // Store all activities for client-side category filter
  let allActivities: Array<{ category: string; slug: string; label: string; houses: number[] }> = [];

  // ── Tab switching ────────────────────────────────────────────────────────────
  function setTab(tab: "ask" | "browse") {
    if (tab === "ask") {
      panelAsk.style.display = "";
      panelBrowse.style.display = "none";
      tabAsk.style.background = "var(--color-primary)";
      tabAsk.style.color = "#fff";
      tabBrowse.style.background = "var(--color-bg-secondary)";
      tabBrowse.style.color = "var(--color-text-secondary)";
    } else {
      panelAsk.style.display = "none";
      panelBrowse.style.display = "";
      tabAsk.style.background = "var(--color-bg-secondary)";
      tabAsk.style.color = "var(--color-text-secondary)";
      tabBrowse.style.background = "var(--color-primary)";
      tabBrowse.style.color = "#fff";
    }
    errorBox.style.display = "none";
    resultDiv.style.display = "none";
  }

  tabAsk.addEventListener("click", () => setTab("ask"));
  tabBrowse.addEventListener("click", () => setTab("browse"));

  // ── Set current time (Browse tab) ────────────────────────────────────────────
  const now = new Date();
  queryTimeInput.value = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  // ── Load kundalis ─────────────────────────────────────────────────────────────
  try {
    const res = await listKundalis();
    const kundalis = res.ok && Array.isArray(res.data?.kundalis) ? res.data.kundalis : [];

    if (kundalis.length === 0) {
      showToast("Please create a kundali first", true);
      navigate("/kundali-form");
      return;
    }

    kundaliSel.innerHTML = kundalis
      .map((k: any) => `<option value="${k.id}">${k.label || "Unnamed"}</option>`)
      .join("");
  } catch {
    showToast("Failed to load kundalis", true);
  }

  // ── Load activities (FIXED: response is {categories: [{category, activities: [{slug, label}]}]}) ──
  try {
    const res = await kpActivities();
    if (res.ok && Array.isArray(res.data?.categories)) {
      const cats: string[] = [];

      for (const cat of res.data.categories) {
        const catName = cat.category || "Other";
        if (!cats.includes(catName)) cats.push(catName);

        if (Array.isArray(cat.activities)) {
          for (const a of cat.activities) {
            allActivities.push({
              category: catName,
              slug: a.slug ?? a.code ?? "",
              label: a.label ?? a.name ?? a.slug ?? "",
              houses: a.houses ?? [],
            });
          }
        }
      }

      // Populate category filter
      categorySel.innerHTML =
        '<option value="">— All Categories —</option>' +
        cats.map((c) => `<option value="${c}">${c}</option>`).join("");

      // Populate activity list (initial: all)
      populateActivities("");
    } else {
      // Fallback: flat list (old format)
      activitySel.innerHTML = '<option value="">— Could not load —</option>';
    }
  } catch {
    showToast("Failed to load activities", true);
  }

  function populateActivities(catFilter: string) {
    const filtered = catFilter
      ? allActivities.filter((a) => a.category === catFilter)
      : allActivities;

    activitySel.innerHTML =
      '<option value="">— Select Activity —</option>' +
      filtered
        .map((a) => `<option value="${a.slug}">${a.label} (H${a.houses.join(",")})</option>`)
        .join("");
  }

  categorySel.addEventListener("change", () => populateActivities(categorySel.value));

  // ── Cancel buttons ───────────────────────────────────────────────────────────
  document.getElementById("btn-cancel-ask")!.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/dashboard");
  });
  document.getElementById("btn-cancel-browse")!.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("/dashboard");
  });
  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));

  // ── Live intent detection (debounced) ────────────────────────────────────────
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  questionTA.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const q = questionTA.value.trim();

    if (q.length < 3) {
      intentPreview.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(async () => {
      // Client-side keyword preview (lightweight — just check the textarea)
      // We show a preview based on the current kundali + question
      // But to keep this pure client-side and avoid billing, we just show
      // a placeholder "type more to check" message
      // The actual intent runs server-side on submit
      intentLabel.textContent = "Analyzing…";
      intentConfidence.textContent = "";
      intentPreview.style.display = "block";
    }, 400);
  });

  // ── Helper: show verdict result (natural query) ──────────────────────────────
  function renderNaturalResult(data: any) {
    const verdict: string = data.combinedVerdict ?? "WAIT";
    const style = VERDICT_STYLE[verdict] ?? VERDICT_STYLE.WAIT!;
    const hi: string = data.reasoningHindi ?? "";
    const en: string = data.reasoningEnglish ?? "";
    const intent = data.intent ?? {};
    const panchang = data.panchang ?? {};
    const kp = data.kp ?? {};

    resultDiv.innerHTML = `
      <!-- Big verdict box -->
      <div style="border: 2px solid ${style.border}; background: ${style.bg};
           border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;
           margin-bottom: var(--space-4);">
        <div style="font-size: 3rem; margin-bottom: var(--space-2);">${style.emoji}</div>
        <div style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold);
             color: ${style.text}; letter-spacing: 0.05em; margin-bottom: var(--space-3);">
          ${style.label}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);
             margin-bottom: var(--space-4);">
          Activity detected: <strong>${intent.label ?? "—"}</strong>
          ${intent.confidence ? `<span style="color:${style.text}; margin-left: var(--space-2);">${intent.confidence}% match</span>` : ""}
        </div>
      </div>

      <!-- Plain Hindi reasoning -->
      <div style="background: var(--color-bg-secondary); border-radius: var(--radius-md);
           padding: var(--space-4); margin-bottom: var(--space-4); font-size: var(--font-size-sm);
           line-height: 1.7;">
        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          🇮🇳 Hindi
        </div>
        <div style="margin-bottom: var(--space-4);">${hi}</div>
        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          🇬🇧 English
        </div>
        <div>${en}</div>
      </div>

      <!-- Panchang summary strip -->
      <div style="display:flex; flex-wrap:wrap; gap: var(--space-2); margin-bottom: var(--space-4);">
        ${panchang.hora ? `
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Current Hora</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);">
            ${panchang.hora.lord}
            <span style="color: ${panchang.hora.quality === "GOOD" ? "var(--color-success,#10B981)" : panchang.hora.quality === "BAD" ? "var(--color-danger,#EF4444)" : "var(--color-warning,#F59E0B)"};">
              (${panchang.hora.quality})
            </span>
          </div>
        </div>` : ""}

        ${panchang.rahuKaal ? `
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Rahu Kaal</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);
               color: ${panchang.rahuKaal.active ? "var(--color-danger,#EF4444)" : "var(--color-success,#10B981)"};">
            ${panchang.rahuKaal.active ? `⚠️ ACTIVE (ends ${panchang.rahuKaal.endTime ?? ""})` : "✓ Not active"}
          </div>
        </div>` : ""}

        ${panchang.tarabala ? `
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Tarabala</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);
               color: ${panchang.tarabala.isBenefic ? "var(--color-success,#10B981)" : "var(--color-danger,#EF4444)"};">
            ${panchang.tarabala.taraName} (${panchang.tarabala.taraScore})
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
            ${panchang.tarabala.todayNakshatra}
          </div>
        </div>` : ""}
      </div>

      <!-- KP detail (collapsible) -->
      <details style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3);">
        <summary style="cursor:pointer; font-size: var(--font-size-sm);
                  font-weight: var(--font-weight-semibold); padding: var(--space-1) 0;">
          🔬 KP Analysis Details (${kp.verdict ?? "—"})
        </summary>
        <div style="margin-top: var(--space-3); font-size: var(--font-size-xs); line-height: 1.7;
             color: var(--color-text-secondary);">
          <div><strong>Houses analyzed:</strong> ${(kp.houses ?? []).join(", ")}</div>
          ${(kp.houseVerdicts ?? []).map((hv: any) =>
            `<div style="margin-top: var(--space-1);">
              House ${hv.house}: <strong>${hv.verdict}</strong>
              ${hv.reasoning ? `— ${hv.reasoning}` : ""}
            </div>`
          ).join("")}
          ${kp.ayanamsaCaveat ? `<div style="margin-top: var(--space-2); font-style:italic;">${kp.ayanamsaCaveat}</div>` : ""}
        </div>
      </details>

      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);
           text-align:center; margin-top: var(--space-3);">
        Query: ${new Date(data.queryTime ?? Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
      </div>
    `;

    resultDiv.style.display = "block";
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Helper: show classic KP result (Browse tab) ───────────────────────────────
  function renderClassicResult(data: any) {
    // data is from /kp/query — houseVerdicts[], dashaChecks[], combinedVerdict (null)
    // Derive a simple display verdict from houseVerdicts
    const houseVerdicts: any[] = data.houseVerdicts ?? [];
    const hasDenied = houseVerdicts.some((hv: any) => hv.verdict === "DENIED");
    const allPromised = houseVerdicts.every((hv: any) => hv.verdict === "PROMISED");
    const displayVerdict = hasDenied ? "AVOID" : allPromised ? "PROCEED" : "WAIT";
    const style = VERDICT_STYLE[displayVerdict] ?? VERDICT_STYLE.WAIT!;

    resultDiv.innerHTML = `
      <div style="border: 2px solid ${style.border}; background: ${style.bg};
           border-radius: var(--radius-lg); padding: var(--space-5); text-align:center;
           margin-bottom: var(--space-4);">
        <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">${style.emoji}</div>
        <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);
             color: ${style.text}; margin-bottom: var(--space-2);">
          KP: ${displayVerdict}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          Activity: <strong>${data.activitySlug ?? "—"}</strong>
        </div>
      </div>

      <!-- House verdicts -->
      <div style="margin-bottom: var(--space-4);">
        ${houseVerdicts.map((hv: any) => `
          <div style="padding: var(--space-3); border-radius: var(--radius-md);
               background: var(--color-bg-secondary); margin-bottom: var(--space-2);
               font-size: var(--font-size-sm);">
            <strong>House ${hv.house}:</strong>
            <span style="color: ${hv.verdict === "PROMISED" ? "var(--color-success,#10B981)" : hv.verdict === "DENIED" ? "var(--color-danger,#EF4444)" : "var(--color-text-secondary)"};">
              ${hv.verdict}
            </span>
            ${hv.reasoning ? `<div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">${hv.reasoning}</div>` : ""}
          </div>
        `).join("")}
      </div>

      ${data.ayanamsaCaveat ? `
      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);
           font-style: italic; text-align:center; margin-top: var(--space-2);">
        ${data.ayanamsaCaveat}
      </div>` : ""}
    `;
    resultDiv.style.display = "block";
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── FORM 1: Natural language submit ──────────────────────────────────────────
  const formAsk = document.getElementById("form-ask") as HTMLFormElement;
  formAsk.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    resultDiv.style.display = "none";

    const kundaliId = parseInt(kundaliSel.value);
    const question = questionTA.value.trim();

    if (!kundaliId) {
      errorBox.textContent = "Please select a kundali.";
      errorBox.style.display = "block";
      return;
    }
    if (!question || question.length < 3) {
      errorBox.textContent = "Please enter your question (minimum 3 characters).";
      errorBox.style.display = "block";
      return;
    }

    const btnAsk = document.getElementById("btn-ask") as HTMLButtonElement;
    btnAsk.disabled = true;
    btnAsk.textContent = "⏳ Analyzing…";
    intentPreview.style.display = "none";

    try {
      const res = await kpQueryNatural(kundaliId, question);

      if (res.ok) {
        renderNaturalResult(res.data);
      } else {
        const code = res.data?.code ?? "";
        let msg = res.data?.error ?? "Failed to process your query.";
        if (code === "INTENT_UNRECOGNIZED") {
          msg =
            "❓ " + msg +
            "\n\nTry: interview, client milna, shaadi, doctor, court, property, exam, flight, visa, puja, etc.";
        } else if (code === "INSUFFICIENT_BALANCE") {
          msg = "⚠️ Wallet balance insufficient. Please recharge to continue.";
        }
        errorBox.style.whiteSpace = "pre-line";
        errorBox.textContent = msg;
        errorBox.style.display = "block";
      }
    } catch {
      errorBox.textContent = "Network error. Please try again.";
      errorBox.style.display = "block";
    } finally {
      btnAsk.disabled = false;
      btnAsk.textContent = "🔍 Get KP Verdict";
    }
  });

  // ── FORM 2: Classic activity picker submit ────────────────────────────────────
  const formBrowse = document.getElementById("form-browse") as HTMLFormElement;
  formBrowse.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    resultDiv.style.display = "none";

    const kundaliId = parseInt(kundaliSel.value);
    const activity = activitySel.value;

    if (!kundaliId || !activity) {
      errorBox.textContent = "Please select both kundali and activity.";
      errorBox.style.display = "block";
      return;
    }

    const btnBrowse = document.getElementById("btn-browse") as HTMLButtonElement;
    btnBrowse.disabled = true;
    btnBrowse.textContent = "Checking…";

    try {
      const res = await kpQuery(kundaliId, activity);

      if (res.ok) {
        renderClassicResult(res.data);
      } else {
        errorBox.textContent = res.data?.error ?? "Failed to query KP.";
        errorBox.style.display = "block";
      }
    } catch {
      errorBox.textContent = "Network error. Please try again.";
      errorBox.style.display = "block";
    } finally {
      btnBrowse.disabled = false;
      btnBrowse.textContent = "Check Now";
    }
  });
}
