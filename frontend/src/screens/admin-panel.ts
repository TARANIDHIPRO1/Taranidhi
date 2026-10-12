/**
 * Admin Panel (#/admin) — requires users.is_admin = 1 on the server.
 *
 * Tabs:
 *   Activate  — find a client by phone, set plan, credit points (activation tool)
 *   Messages  — contact-form enquiries; mark contacted / closed / spam
 *   Reviews   — approve or reject submitted testimonials
 *   Settings  — WhatsApp number, phone, email shown on the website
 *   Overview  — usage stats
 *
 * Everything that came from the public (names, messages, reviews) is escaped
 * with esc() before it is placed in the page.
 */

import { $app, clear, esc, showToast } from "../dom";
import { navigate } from "../router";
import {
  adminStats,
  adminListContacts,
  adminSetContactStatus,
  adminListTestimonials,
  adminReviewTestimonial,
  adminGetAppSettings,
  adminUpdateAppSettings,
  adminLookupUser,
  adminActivateUser,
} from "../api";
import { resetSiteConfig, formatIndianPhone } from "../site-config";
import { SERVICE_LABELS } from "./public-testimonials";

type Tab = "activate" | "messages" | "reviews" | "settings" | "overview";
const TABS: { id: Tab; label: string }[] = [
  { id: "activate", label: "Activate" },
  { id: "messages", label: "Messages" },
  { id: "reviews", label: "Reviews" },
  { id: "settings", label: "Settings" },
  { id: "overview", label: "Overview" },
];

const TOPIC_LABELS: Record<string, string> = {
  "muhurta-property": "Muhurta — Property",
  "muhurta-marriage": "Muhurta — Marriage",
  "muhurta-business": "Muhurta — Business",
  "muhurta-medical": "Muhurta — Medical",
  kundali: "Birth Chart / KP",
  numerology: "Numerology",
  vastu: "Vastu",
  subscription: "Subscription / Billing",
  b2b: "B2B / Corporate",
  other: "Other",
};

/** D1 datetime ("2026-10-12 13:49:27", UTC) -> "12 Oct 2026, 7:19 pm" IST */
export function formatDbTime(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v.includes("T") ? v : v.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return esc(v);
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export async function renderAdminPanel(): Promise<void> {
  const app = $app();
  clear(app);
  const initial = (new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("tab") as Tab) || "activate";
  const active: Tab = TABS.some((t) => t.id === initial) ? initial : "activate";

  app.innerHTML = `
    <div class="screen admin-screen">
      <div class="admin-sticky">
        <header class="screen-header">
          <button class="btn-back" id="btn-back" aria-label="Back to dashboard">←</button>
          <h2>Admin Panel</h2>
        </header>
        <nav class="admin-tabs" role="tablist" aria-label="Admin sections">
          ${TABS.map((t) => `
            <button class="admin-tab" role="tab" id="tab-${t.id}" data-tab="${t.id}"
                    aria-selected="${t.id === active}" aria-controls="admin-body">${t.label}</button>`).join("")}
        </nav>
      </div>
      <div class="admin-body" id="admin-body" role="tabpanel"></div>
    </div>
  `;

  document.getElementById("btn-back")!.addEventListener("click", () => navigate("/dashboard"));
  document.querySelectorAll<HTMLButtonElement>(".admin-tab").forEach((b) =>
    b.addEventListener("click", () => selectTab(b.dataset.tab as Tab))
  );
  selectTab(active);
}

function selectTab(tab: Tab): void {
  document.querySelectorAll<HTMLButtonElement>(".admin-tab").forEach((b) =>
    b.setAttribute("aria-selected", String(b.dataset.tab === tab))
  );
  const body = document.getElementById("admin-body")!;
  body.setAttribute("aria-labelledby", `tab-${tab}`);
  body.innerHTML = `<p class="admin-muted">Loading…</p>`;
  window.scrollTo({ top: 0 });
  const render = { activate: renderActivate, messages: renderMessages, reviews: renderReviews, settings: renderSettings, overview: renderOverview }[tab];
  void render(body);
}

function apiError(res: { status: number; data: any }): string {
  if (res.status === 403) return "This account does not have admin access.";
  return res.data?.error ?? `Request failed (${res.status}).`;
}

// ── Activate ──────────────────────────────────────────────────────────────

async function renderActivate(body: HTMLElement): Promise<void> {
  body.innerHTML = `
    <section class="card admin-card">
      <h3>Find client</h3>
      <form id="lookup-form" class="admin-row" novalidate>
        <label class="sr-only" for="lk-phone">Client mobile number</label>
        <div class="pub-form-phone-row admin-grow">
          <span class="pub-form-phone-prefix">+91</span>
          <input id="lk-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="Client mobile number" />
        </div>
        <button class="btn-primary" type="submit">Find</button>
      </form>
      <div id="lookup-result" aria-live="polite"></div>
    </section>

    <section class="card admin-card">
      <h3>Activate plan / credit points</h3>
      <p class="admin-muted">If the number has never logged in, an account is created. The client then logs in with OTP on the same number.</p>
      <form id="act-form" class="admin-form" novalidate>
        <label for="act-phone">Mobile number *</label>
        <div class="pub-form-phone-row">
          <span class="pub-form-phone-prefix">+91</span>
          <input id="act-phone" type="tel" inputmode="numeric" maxlength="10" required />
        </div>
        <label for="act-tier">Plan</label>
        <select id="act-tier">
          <option value="">Keep current plan</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="ultra">Ultra</option>
        </select>
        <label for="act-points">Points to credit</label>
        <input id="act-points" type="number" inputmode="numeric" min="1" max="100000" step="1" placeholder="e.g. 100" />
        <label for="act-days">Points valid for (days)</label>
        <input id="act-days" type="number" inputmode="numeric" min="1" max="730" step="1" value="365" />
        <label for="act-source">Reason</label>
        <select id="act-source">
          <option value="subscription_package">Plan / subscription</option>
          <option value="purchased_topup">Paid top-up</option>
          <option value="free_trial">Free trial / goodwill</option>
        </select>
        <label for="act-note">Note (e.g. payment reference)</label>
        <input id="act-note" type="text" maxlength="200" placeholder="UPI ref, cash, etc." />
        <div id="act-confirm" class="admin-confirm" hidden></div>
        <button class="btn-primary" type="submit" id="act-submit">Review &amp; activate</button>
      </form>
    </section>
  `;

  const lookupForm = document.getElementById("lookup-form") as HTMLFormElement;
  lookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = (document.getElementById("lk-phone") as HTMLInputElement).value.replace(/\D/g, "");
    const out = document.getElementById("lookup-result")!;
    if (!/^[6-9]\d{9}$/.test(phone)) { out.innerHTML = `<p class="admin-error">Enter a valid 10-digit number.</p>`; return; }
    out.innerHTML = `<p class="admin-muted">Searching…</p>`;
    const res = await adminLookupUser(phone);
    if (!res.ok) { out.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`; return; }
    out.innerHTML = res.data.found
      ? userSummary(res.data)
      : `<p>No account for +91 ${esc(phone)} yet. Use the form below to create and activate it.</p>`;
    (document.getElementById("act-phone") as HTMLInputElement).value = phone;
  });

  const form = document.getElementById("act-form") as HTMLFormElement;
  const confirmBox = document.getElementById("act-confirm")!;
  const submit = document.getElementById("act-submit") as HTMLButtonElement;
  let pending: Record<string, unknown> | null = null;

  // Any edit cancels a pending confirmation, so what is confirmed is what is sent.
  form.addEventListener("input", () => {
    pending = null; confirmBox.hidden = true; submit.textContent = "Review & activate";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
    const phone = get("act-phone").replace(/\D/g, "");
    const tier = get("act-tier");
    const pointsRaw = get("act-points");
    const daysRaw = get("act-days");
    const points = pointsRaw ? Number(pointsRaw) : 0;
    const days = daysRaw ? Number(daysRaw) : 365;

    const problems: string[] = [];
    if (!/^[6-9]\d{9}$/.test(phone)) problems.push("Enter a valid 10-digit mobile number.");
    if (pointsRaw && (!Number.isInteger(points) || points < 1 || points > 100000)) problems.push("Points must be a whole number from 1 to 100000.");
    if (points && (!Number.isInteger(days) || days < 1 || days > 730)) problems.push("Validity must be 1–730 days.");
    if (!tier && !points) problems.push("Choose a plan, points, or both.");
    if (problems.length) {
      confirmBox.hidden = false;
      confirmBox.innerHTML = problems.map((p) => `<p class="admin-error">${esc(p)}</p>`).join("");
      return;
    }

    const payload: Record<string, unknown> = {
      phone, tier: tier || undefined, points: points || undefined,
      validity_days: points ? days : undefined, source: get("act-source"), note: get("act-note"),
    };

    if (!pending) {
      // Step 1: show exactly what will happen; a second tap confirms.
      pending = payload;
      const expiry = new Date(Date.now() + days * 86400000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
      confirmBox.hidden = false;
      confirmBox.innerHTML = `
        <p><strong>Please confirm:</strong> +91 ${esc(phone)}</p>
        <ul>
          ${tier ? `<li>Plan → <strong>${esc(tier)}</strong></li>` : ""}
          ${points ? `<li>Credit <strong>${points}</strong> points, valid until about <strong>${esc(expiry)}</strong></li>` : ""}
        </ul>`;
      submit.textContent = "Confirm activation";
      return;
    }

    submit.disabled = true;
    submit.textContent = "Activating…";
    const res = await adminActivateUser(pending);
    submit.disabled = false;
    pending = null;
    submit.textContent = "Review & activate";
    if (!res.ok) {
      confirmBox.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`;
      return;
    }
    confirmBox.innerHTML = `<p class="admin-ok">Done.</p>${userSummary(res.data)}`;
    showToast("Activation saved");
    (document.getElementById("act-points") as HTMLInputElement).value = "";
    (document.getElementById("act-note") as HTMLInputElement).value = "";
  });
}

function userSummary(d: any): string {
  const u = d.user ?? {};
  const batches: any[] = d.batches ?? [];
  return `
    <div class="admin-user">
      <p><strong>${esc(u.phone_number)}</strong> · Plan: <strong>${esc(u.tier)}</strong>
         ${u.is_admin ? " · admin" : ""}${u.is_active === 0 ? ` · <span class="admin-error">deactivated</span>` : ""}</p>
      <p>Spendable balance: <strong>${Number(d.balance ?? 0)}</strong> points</p>
      <p class="admin-muted">Account created ${formatDbTime(u.created_at)}</p>
      ${batches.length ? `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Source</th><th>Granted</th><th>Left</th><th>Expires</th><th>Status</th></tr></thead>
            <tbody>${batches.map((b) => `
              <tr><td>${esc(b.source)}</td><td>${Number(b.amount_granted)}</td><td>${Number(b.amount_remaining)}</td>
                  <td>${formatDbTime(b.expires_at)}</td><td>${esc(b.status)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>` : `<p class="admin-muted">No points credited yet.</p>`}
    </div>`;
}

// ── Messages ──────────────────────────────────────────────────────────────

async function renderMessages(body: HTMLElement, status = "new"): Promise<void> {
  const res = await adminListContacts(status);
  if (!res.ok) { body.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`; return; }
  const msgs: any[] = res.data.messages ?? [];
  body.innerHTML = `
    <div class="admin-row">
      <label for="msg-filter">Show</label>
      <select id="msg-filter">
        ${["new", "contacted", "closed", "spam", "all"].map((s) => `<option value="${s}" ${s === status ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>
    ${msgs.length ? msgs.map((m) => `
      <article class="card admin-card" data-id="${Number(m.id)}">
        <p><strong>${esc(m.name)}</strong> · <a href="tel:+91${esc(m.phone)}">+91 ${esc(m.phone)}</a>
           · <a href="https://wa.me/91${esc(m.phone)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
        <p class="admin-muted">${esc(TOPIC_LABELS[m.topic] ?? m.topic)} · ${formatDbTime(m.created_at)} · ${esc(m.status)}</p>
        ${m.message ? `<p class="admin-message">${esc(m.message)}</p>` : ""}
        <div class="admin-actions">
          ${["contacted", "closed", "spam"].filter((s) => s !== m.status).map((s) =>
            `<button class="btn-secondary" data-act="${s}">Mark ${s}</button>`).join("")}
        </div>
      </article>`).join("") : `<p class="admin-muted">No ${esc(status)} messages.</p>`}
  `;
  (document.getElementById("msg-filter") as HTMLSelectElement).addEventListener("change", (e) =>
    renderMessages(body, (e.target as HTMLSelectElement).value)
  );
  body.querySelectorAll<HTMLButtonElement>("[data-act]").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.closest<HTMLElement>("[data-id]")!.dataset.id);
      b.disabled = true;
      const r = await adminSetContactStatus(id, b.dataset.act!);
      if (!r.ok) { showToast(apiError(r), true); b.disabled = false; return; }
      showToast(`Marked ${b.dataset.act}`);
      void renderMessages(body, status);
    })
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────

async function renderReviews(body: HTMLElement, status = "pending"): Promise<void> {
  const res = await adminListTestimonials(status);
  if (!res.ok) { body.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`; return; }
  const items: any[] = res.data.testimonials ?? [];
  body.innerHTML = `
    <div class="admin-row">
      <label for="rev-filter">Show</label>
      <select id="rev-filter">
        ${["pending", "approved", "rejected", "all"].map((s) => `<option value="${s}" ${s === status ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>
    <p class="admin-muted">Approved reviews appear on the website as first name + surname initial and city. Phone numbers are never shown publicly.</p>
    ${items.length ? items.map((t) => `
      <article class="card admin-card" data-id="${Number(t.id)}">
        <p><strong>${esc(t.name)}</strong>${t.city ? ` · ${esc(t.city)}` : ""} · ${esc(SERVICE_LABELS[t.service] ?? t.service)}
           ${t.rating ? ` · ${"★".repeat(Number(t.rating))}` : ""}</p>
        <p class="admin-muted">+91 ${esc(t.phone)} · submitted ${formatDbTime(t.created_at)} · ${esc(t.status)}</p>
        <blockquote class="admin-message">${esc(t.quote)}</blockquote>
        <div class="admin-actions">
          ${t.status !== "approved" ? `<button class="btn-primary" data-act="approved">Approve</button>` : ""}
          ${t.status !== "rejected" ? `<button class="btn-secondary" data-act="rejected">Reject</button>` : ""}
        </div>
      </article>`).join("") : `<p class="admin-muted">No ${esc(status)} reviews.</p>`}
  `;
  (document.getElementById("rev-filter") as HTMLSelectElement).addEventListener("change", (e) =>
    renderReviews(body, (e.target as HTMLSelectElement).value)
  );
  body.querySelectorAll<HTMLButtonElement>("[data-act]").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.closest<HTMLElement>("[data-id]")!.dataset.id);
      b.disabled = true;
      const r = await adminReviewTestimonial(id, b.dataset.act as "approved" | "rejected");
      if (!r.ok) { showToast(apiError(r), true); b.disabled = false; return; }
      showToast(b.dataset.act === "approved" ? "Review published" : "Review rejected");
      void renderReviews(body, status);
    })
  );
}

// ── Settings ──────────────────────────────────────────────────────────────

async function renderSettings(body: HTMLElement): Promise<void> {
  const res = await adminGetAppSettings();
  if (!res.ok) { body.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`; return; }
  const s = res.data.settings ?? {};
  const ten = (v: string) => String(v ?? "").replace(/^91/, "");
  body.innerHTML = `
    <section class="card admin-card">
      <h3>Website contact details</h3>
      <p class="admin-muted">Changes apply to the website immediately. Use this to switch to the business WhatsApp number later.</p>
      <form id="settings-form" class="admin-form" novalidate>
        <label for="st-wa">WhatsApp number (click-to-chat)</label>
        <div class="pub-form-phone-row"><span class="pub-form-phone-prefix">+91</span>
          <input id="st-wa" type="tel" inputmode="numeric" maxlength="10" value="${esc(ten(s.whatsapp_number))}" /></div>
        <label for="st-phone">Phone number shown on website</label>
        <div class="pub-form-phone-row"><span class="pub-form-phone-prefix">+91</span>
          <input id="st-phone" type="tel" inputmode="numeric" maxlength="10" value="${esc(ten(s.contact_phone))}" /></div>
        <label for="st-email">Email shown on website</label>
        <input id="st-email" type="email" maxlength="120" value="${esc(s.contact_email)}" />
        <p id="st-status" role="status" aria-live="polite"></p>
        <button class="btn-primary" type="submit">Save</button>
      </form>
    </section>`;

  (document.getElementById("settings-form") as HTMLFormElement).addEventListener("submit", async (e) => {
    e.preventDefault();
    const out = document.getElementById("st-status")!;
    const patch: Record<string, string> = {};
    const wa = (document.getElementById("st-wa") as HTMLInputElement).value.replace(/\D/g, "");
    const ph = (document.getElementById("st-phone") as HTMLInputElement).value.replace(/\D/g, "");
    const em = (document.getElementById("st-email") as HTMLInputElement).value.trim();
    if (wa !== ten(s.whatsapp_number)) patch.whatsapp_number = wa;
    if (ph !== ten(s.contact_phone)) patch.contact_phone = ph;
    if (em !== s.contact_email) patch.contact_email = em;
    if (!Object.keys(patch).length) { out.textContent = "Nothing changed."; return; }
    const r = await adminUpdateAppSettings(patch);
    if (!r.ok) { out.innerHTML = `<span class="admin-error">${esc(apiError(r))}</span>`; return; }
    resetSiteConfig();
    out.innerHTML = `<span class="admin-ok">Saved. WhatsApp: ${esc(formatIndianPhone(r.data.settings.whatsapp_number))}</span>`;
    Object.assign(s, r.data.settings);
  });
}

// ── Overview ──────────────────────────────────────────────────────────────

async function renderOverview(body: HTMLElement): Promise<void> {
  const res = await adminStats();
  if (!res.ok) { body.innerHTML = `<p class="admin-error">${esc(apiError(res))}</p>`; return; }
  const d = res.data ?? {};
  body.innerHTML = `
    <div class="result-grid">
      <div class="result-item"><div class="result-item-label">Queries (24h)</div><div class="result-item-value">${Number(d.queries_24h || 0)}</div></div>
      <div class="result-item"><div class="result-item-label">Active users</div><div class="result-item-value">${Number(d.active_users || 0)}</div></div>
      <div class="result-item"><div class="result-item-label">Revenue (est.)</div><div class="result-item-value">₹${Number(d.revenue_estimate || 0).toLocaleString("en-IN")}</div></div>
      <div class="result-item"><div class="result-item-label">Conversion</div><div class="result-item-value">${Number(d.conversion_rate || 0).toFixed(1)}%</div></div>
    </div>
    <section class="card admin-card">
      <h3>Top activities (24h)</h3>
      ${(d.top_activities ?? []).length
        ? (d.top_activities as any[]).map((a) => `<p><strong>${esc(a.name)}</strong>: ${Number(a.count)} queries</p>`).join("")
        : `<p class="admin-muted">No queries in the last 24 hours.</p>`}
    </section>`;
}
