/**
 * Contact Page — form + direct contact details.
 *
 * Submit flow:
 *   1. Validate in the browser (same rules as the server).
 *   2. POST /public/contact -> saved in D1 (contact_messages), visible to
 *      the admin under Admin → Messages.
 *   3. Show a "Continue on WhatsApp" button with the message pre-filled.
 *      It is a real link the user taps: opening WhatsApp automatically after
 *      an await is blocked as a popup by Safari/Chrome.
 * If saving fails, the WhatsApp button is still offered so no enquiry is lost.
 * Phone, email and WhatsApp number come from GET /public/config.
 */

import { wrapPublicPage } from "./public-layout";
import { esc } from "../dom";
import { submitContact } from "../api";
import { loadSiteConfig, whatsappLink } from "../site-config";

export function renderPublicContact(): void {
  const html = `
    <section class="pub-section">
      <div class="pub-container pub-contact-container">

        <div class="pub-contact-info">
          <h1 class="pub-section-title" style="text-align:left;">Get in Touch</h1>
          <p class="pub-section-sub" style="text-align:left;">
            Questions about a reading, a subscription, or the technology?
            Naveen answers personally.
          </p>

          <div class="pub-contact-methods">
            <a href="tel:+919669756111" class="pub-contact-method" id="cm-phone">
              <span class="pub-contact-method-icon" aria-hidden="true">📞</span>
              <div>
                <div class="pub-contact-method-label">Phone</div>
                <div class="pub-contact-method-value" data-cfg="phone">+91 96697 56111</div>
              </div>
            </a>
            <a href="https://wa.me/919669756111" class="pub-contact-method" data-cfg="whatsapp"
               target="_blank" rel="noopener noreferrer">
              <span class="pub-contact-method-icon" aria-hidden="true">💬</span>
              <div>
                <div class="pub-contact-method-label">WhatsApp</div>
                <div class="pub-contact-method-value">Chat with us</div>
              </div>
            </a>
            <a href="mailto:info@occultviision.com" class="pub-contact-method" id="cm-email">
              <span class="pub-contact-method-icon" aria-hidden="true">✉</span>
              <div>
                <div class="pub-contact-method-label">Email</div>
                <div class="pub-contact-method-value" data-cfg="email">info@occultviision.com</div>
              </div>
            </a>
            <div class="pub-contact-method">
              <span class="pub-contact-method-icon" aria-hidden="true">📍</span>
              <div>
                <div class="pub-contact-method-label">Based in</div>
                <div class="pub-contact-method-value">Bhopal, Madhya Pradesh, India</div>
              </div>
            </div>
          </div>

          <div class="pub-contact-hours">
            <h4>Consultation hours</h4>
            <p>Monday – Saturday · 10:00 AM – 7:00 PM IST</p>
            <p>WhatsApp preferred for first contact.</p>
          </div>

          <div class="pub-contact-use-cases">
            <h4>Common enquiries</h4>
            <ul>
              <li>Personal Muhurta for property / marriage / business</li>
              <li>KP birth chart reading and Dasha analysis</li>
              <li>Business name numerology</li>
              <li>Vastu consultation (Bhopal / online)</li>
              <li>Subscription support (billing, tier upgrade)</li>
              <li>B2B / hospital / corporate partnership (Ultra tier)</li>
            </ul>
          </div>
        </div>

        <div class="pub-contact-form-wrap" id="contact-form-wrap">
          <form class="pub-contact-form" id="contact-form" novalidate>
            <div class="pub-form-field">
              <label for="cf-name">Your Name *</label>
              <input type="text" id="cf-name" name="name" placeholder="Ravi Sharma"
                     autocomplete="name" maxlength="80" required aria-describedby="cf-name-err" />
              <p class="pub-form-error" id="cf-name-err" hidden></p>
            </div>
            <div class="pub-form-field">
              <label for="cf-phone">Phone / WhatsApp *</label>
              <div class="pub-form-phone-row">
                <span class="pub-form-phone-prefix">+91</span>
                <input type="tel" id="cf-phone" name="phone" placeholder="9876543210"
                       maxlength="10" inputmode="numeric" autocomplete="tel-national"
                       pattern="[6-9][0-9]{9}" required aria-describedby="cf-phone-err" />
              </div>
              <p class="pub-form-error" id="cf-phone-err" hidden></p>
            </div>
            <div class="pub-form-field">
              <label for="cf-topic">What do you need help with?</label>
              <select id="cf-topic" name="topic">
                <option value="">Select a topic…</option>
                <option value="muhurta-property">Muhurta — Property</option>
                <option value="muhurta-marriage">Muhurta — Marriage</option>
                <option value="muhurta-business">Muhurta — Business</option>
                <option value="muhurta-medical">Muhurta — Medical</option>
                <option value="kundali">Birth Chart / KP Reading</option>
                <option value="numerology">Business / Name Numerology</option>
                <option value="vastu">Vastu Consultation</option>
                <option value="subscription">Subscription / Billing</option>
                <option value="b2b">B2B / Corporate Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="pub-form-field">
              <label for="cf-message">Message</label>
              <textarea id="cf-message" name="message" rows="4" maxlength="1000"
                        placeholder="Tell Naveen what you're looking for…"></textarea>
            </div>
            <!-- Honeypot: hidden from people, filled in by bots -->
            <div class="pub-hp" aria-hidden="true">
              <label for="cf-website">Website</label>
              <input type="text" id="cf-website" name="website" tabindex="-1" autocomplete="off" />
            </div>
            <div class="pub-form-actions">
              <button type="submit" class="pub-btn pub-btn--primary pub-btn--full" id="btn-send">
                Send Message
              </button>
              <p class="pub-form-note">
                Your name, number and message are saved securely so Naveen can reply,
                and are used only for that. You can then continue on WhatsApp.
              </p>
              <p class="pub-form-status" id="cf-status" role="status" aria-live="polite"></p>
            </div>
          </form>
        </div>

      </div>
    </section>
  `;

  wrapPublicPage("#/contact", html);
  void loadSiteConfig().then((cfg) => {
    const phone = document.getElementById("cm-phone") as HTMLAnchorElement | null;
    if (phone) phone.href = `tel:+${cfg.contact_phone}`;
    const email = document.getElementById("cm-email") as HTMLAnchorElement | null;
    if (email) email.href = `mailto:${cfg.contact_email}`;
  });

  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  if (!form) return;

  const field = (id: string) => document.getElementById(id) as HTMLInputElement;
  const setErr = (id: string, msg: string) => {
    const el = document.getElementById(`${id}-err`);
    const input = document.getElementById(id);
    if (!el || !input) return;
    el.textContent = msg;
    el.hidden = !msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    const name = field("cf-name").value.trim();
    const phone = field("cf-phone").value.replace(/\D/g, "");
    const topicSel = document.getElementById("cf-topic") as HTMLSelectElement;
    const topic = topicSel.value;
    const message = (document.getElementById("cf-message") as HTMLTextAreaElement).value.trim();
    const website = field("cf-website").value;

    setErr("cf-name", name.length < 2 ? "Please enter your name." : "");
    setErr("cf-phone", /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number.");
    if (name.length < 2) return field("cf-name").focus();
    if (!/^[6-9]\d{9}$/.test(phone)) return field("cf-phone").focus();

    const topicLabel = topic ? topicSel.selectedOptions[0]?.text ?? topic : "General enquiry";
    const waText =
      `Hello Naveen,\n\nI'm ${name} (+91 ${phone}).\nTopic: ${topicLabel}\n` +
      (message ? `\n${message}\n` : "") +
      `\n— Sent from occultviision.com`;

    const btn = document.getElementById("btn-send") as HTMLButtonElement;
    const status = document.getElementById("cf-status")!;
    btn.disabled = true;
    btn.textContent = "Sending…";
    status.textContent = "";

    let saved = false;
    let errorMsg = "";
    try {
      const res = await submitContact({ name, phone, topic, message, website });
      saved = res.ok;
      if (!res.ok) {
        if (res.data?.field === "name" || res.data?.field === "phone") {
          setErr(res.data.field === "name" ? "cf-name" : "cf-phone", res.data.error);
        }
        errorMsg = res.data?.error ?? "Could not save your message.";
      }
    } catch {
      errorMsg = "No internet connection, or the server could not be reached.";
    }

    const cfg = await loadSiteConfig();
    const wa = whatsappLink(waText, cfg);

    if (saved) {
      const wrap = document.getElementById("contact-form-wrap")!;
      wrap.innerHTML = `
        <div class="pub-contact-success" role="status">
          <h2>Thank you, ${esc(name)}.</h2>
          <p>Your message has been received. Naveen will reply on +91 ${esc(phone)}.</p>
          <p>For a faster reply, send it on WhatsApp as well:</p>
          <a class="pub-btn pub-btn--primary pub-btn--full" href="${esc(wa)}"
             target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
        </div>`;
      (wrap.querySelector("h2") as HTMLElement | null)?.setAttribute("tabindex", "-1");
      (wrap.querySelector("h2") as HTMLElement | null)?.focus();
      return;
    }

    btn.disabled = false;
    btn.textContent = "Send Message";
    status.innerHTML = `${esc(errorMsg)} You can still reach us directly:
      <a href="${esc(wa)}" target="_blank" rel="noopener noreferrer">send this on WhatsApp</a>.`;
  });
}
