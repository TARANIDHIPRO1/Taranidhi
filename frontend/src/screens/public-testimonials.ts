/**
 * Reviews page (#/testimonials)
 *  - Lists testimonials an admin has approved (GET /public/testimonials).
 *  - Lets anyone submit feedback (POST /public/testimonials). Submissions are
 *    stored as 'pending' and appear only after approval in Admin → Reviews.
 *  - Consent to publish is required; the phone number is private and is never
 *    shown. Names are shown as "First L.".
 */

import { wrapPublicPage } from "./public-layout";
import { esc } from "../dom";
import { listPublicTestimonials, submitTestimonial } from "../api";

export interface PublicTestimonial {
  id: number;
  name: string;
  city: string;
  service: string;
  rating: number | null;
  quote: string;
}

export const SERVICE_LABELS: Record<string, string> = {
  muhurta: "Muhurta",
  kundali: "Birth Chart / KP",
  numerology: "Numerology",
  vastu: "Vastu",
  app: "TaraNidhi App",
  other: "Consultation",
};

export function renderTestimonialCards(items: PublicTestimonial[]): string {
  return items
    .map((t) => {
      const stars = t.rating
        ? `<div class="pub-testi-stars" aria-label="${t.rating} out of 5 stars">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</div>`
        : "";
      const meta = [SERVICE_LABELS[t.service] ?? "Consultation", t.city].filter(Boolean).map(esc).join(" · ");
      return `
        <figure class="pub-testi">
          ${stars}
          <blockquote class="pub-testi-quote">${esc(t.quote)}</blockquote>
          <figcaption class="pub-testi-author">
            <span class="pub-testi-name">${esc(t.name)}</span>
            <span class="pub-testi-role">${meta}</span>
          </figcaption>
        </figure>`;
    })
    .join("");
}

export function renderPublicTestimonials(): void {
  const html = `
    <section class="pub-section">
      <div class="pub-container">
        <h1 class="pub-section-title">Client Reviews</h1>
        <p class="pub-section-sub">
          Feedback shared by clients, published with their permission.
        </p>
        <div class="pub-testimonials" id="testi-list" aria-busy="true">
          <p class="pub-testi-empty">Loading reviews…</p>
        </div>
      </div>
    </section>

    <section class="pub-section pub-section--alt" id="share">
      <div class="pub-container pub-testi-form-container">
        <h2 class="pub-section-title">Share Your Experience</h2>
        <p class="pub-section-sub">
          Your review is checked before it appears. Only your first name, the first
          letter of your surname and your city are shown. Your phone number is never published.
        </p>
        <div id="testi-form-wrap">
          <form class="pub-contact-form" id="testi-form" novalidate>
            <div class="pub-form-field">
              <label for="tf-name">Your Name *</label>
              <input type="text" id="tf-name" maxlength="80" autocomplete="name" required aria-describedby="tf-name-err" />
              <p class="pub-form-error" id="tf-name-err" hidden></p>
            </div>
            <div class="pub-form-field">
              <label for="tf-phone">Phone (private, for verification) *</label>
              <div class="pub-form-phone-row">
                <span class="pub-form-phone-prefix">+91</span>
                <input type="tel" id="tf-phone" maxlength="10" inputmode="numeric" autocomplete="tel-national"
                       pattern="[6-9][0-9]{9}" required aria-describedby="tf-phone-err" />
              </div>
              <p class="pub-form-error" id="tf-phone-err" hidden></p>
            </div>
            <div class="pub-form-field">
              <label for="tf-city">City</label>
              <input type="text" id="tf-city" maxlength="60" autocomplete="address-level2" />
            </div>
            <div class="pub-form-field">
              <label for="tf-service">Service used</label>
              <select id="tf-service">
                <option value="muhurta">Muhurta</option>
                <option value="kundali">Birth Chart / KP</option>
                <option value="numerology">Numerology</option>
                <option value="vastu">Vastu</option>
                <option value="app">TaraNidhi App</option>
                <option value="other" selected>Other consultation</option>
              </select>
            </div>
            <fieldset class="pub-form-field pub-rating">
              <legend>Rating (optional)</legend>
              <div class="pub-rating-options">
                ${[5, 4, 3, 2, 1].map((n) => `
                  <label class="pub-rating-opt">
                    <input type="radio" name="tf-rating" value="${n}" />
                    <span>${n} ★</span>
                  </label>`).join("")}
              </div>
            </fieldset>
            <div class="pub-form-field">
              <label for="tf-quote">Your review * <span class="pub-form-hint">(20–600 characters)</span></label>
              <textarea id="tf-quote" rows="5" maxlength="600" required aria-describedby="tf-quote-err tf-quote-count"></textarea>
              <p class="pub-form-hint" id="tf-quote-count">0 / 600</p>
              <p class="pub-form-error" id="tf-quote-err" hidden></p>
            </div>
            <div class="pub-hp" aria-hidden="true">
              <label for="tf-website">Website</label>
              <input type="text" id="tf-website" tabindex="-1" autocomplete="off" />
            </div>
            <div class="pub-form-field">
              <label class="pub-consent">
                <input type="checkbox" id="tf-consent" aria-describedby="tf-consent-err" />
                <span>I agree that OCCULTVIISION may publish this review on its website
                  with my first name, surname initial and city.</span>
              </label>
              <p class="pub-form-error" id="tf-consent-err" hidden></p>
            </div>
            <div class="pub-form-actions">
              <button type="submit" class="pub-btn pub-btn--primary pub-btn--full" id="tf-submit">Submit Review</button>
              <p class="pub-form-status" id="tf-status" role="status" aria-live="polite"></p>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;

  wrapPublicPage("#/testimonials", html);
  void loadList();
  wireForm();
}

async function loadList(): Promise<void> {
  const list = document.getElementById("testi-list");
  if (!list) return;
  try {
    const res = await listPublicTestimonials();
    const items: PublicTestimonial[] = res.ok ? res.data?.testimonials ?? [] : [];
    list.innerHTML = items.length
      ? renderTestimonialCards(items)
      : `<p class="pub-testi-empty">No reviews published yet. Be the first to
           <a href="#/testimonials" id="testi-jump">share your experience</a>.</p>`;
    document.getElementById("testi-jump")?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("share")?.scrollIntoView({ behavior: "smooth" });
      (document.getElementById("tf-name") as HTMLInputElement | null)?.focus({ preventScroll: true });
    });
  } catch {
    list.innerHTML = `<p class="pub-testi-empty">Reviews could not be loaded right now.</p>`;
  } finally {
    list.setAttribute("aria-busy", "false");
  }
}

function wireForm(): void {
  const form = document.getElementById("testi-form") as HTMLFormElement | null;
  if (!form) return;
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
  const setErr = (id: string, msg: string) => {
    const el = document.getElementById(`${id}-err`);
    if (el) { el.textContent = msg; el.hidden = !msg; }
    document.getElementById(id)?.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const quote = document.getElementById("tf-quote") as HTMLTextAreaElement;
  const count = document.getElementById("tf-quote-count")!;
  quote.addEventListener("input", () => { count.textContent = `${quote.value.trim().length} / 600`; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = val("tf-name").trim();
    const phone = val("tf-phone").replace(/\D/g, "");
    const text = quote.value.trim();
    const consent = (document.getElementById("tf-consent") as HTMLInputElement).checked;
    const ratingEl = form.querySelector<HTMLInputElement>('input[name="tf-rating"]:checked');

    const errs: [string, string][] = [
      ["tf-name", name.length < 2 ? "Please enter your name." : ""],
      ["tf-phone", /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number."],
      ["tf-quote", text.length < 20 ? "Please write at least 20 characters." : ""],
      ["tf-consent", consent ? "" : "Please tick the box so we can publish your review."],
    ];
    errs.forEach(([id, msg]) => setErr(id, msg));
    const first = errs.find(([, msg]) => msg);
    if (first) { (document.getElementById(first[0]) as HTMLElement | null)?.focus(); return; }

    const btn = document.getElementById("tf-submit") as HTMLButtonElement;
    const status = document.getElementById("tf-status")!;
    btn.disabled = true;
    btn.textContent = "Submitting…";
    status.textContent = "";

    try {
      const res = await submitTestimonial({
        name, phone, city: val("tf-city").trim(), service: val("tf-service"),
        rating: ratingEl ? Number(ratingEl.value) : null,
        quote: text, consent: true, website: val("tf-website"),
      });
      if (res.ok) {
        document.getElementById("testi-form-wrap")!.innerHTML = `
          <div class="pub-contact-success" role="status">
            <h3 tabindex="-1">Thank you, ${esc(name)}.</h3>
            <p>Your review has been received and will appear here once it is approved.</p>
          </div>`;
        (document.querySelector("#testi-form-wrap h3") as HTMLElement | null)?.focus();
        return;
      }
      const f = res.data?.field;
      const map: Record<string, string> = { name: "tf-name", phone: "tf-phone", quote: "tf-quote", consent: "tf-consent" };
      if (f && map[f]) setErr(map[f], res.data.error);
      else status.textContent = res.data?.error ?? "Could not submit your review. Please try again.";
    } catch {
      status.textContent = "No internet connection, or the server could not be reached.";
    }
    btn.disabled = false;
    btn.textContent = "Submit Review";
  });
}
