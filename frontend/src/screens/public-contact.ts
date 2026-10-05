/**
 * Contact Page — Form + direct contact details
 * Phone: 9669756111 (Naveen K. Rai)
 *
 * Note: Form submission is client-side only (no backend endpoint yet).
 * On submit, opens WhatsApp / copies message — server-side endpoint
 * can be wired when SMTP / WhatsApp Business API is configured.
 */

import { wrapPublicPage } from "./public-layout";
import { showToast } from "../dom";

export function renderPublicContact(): void {
  const html = `
    <section class="pub-section">
      <div class="pub-container pub-contact-container">

        <!-- Contact Info Column -->
        <div class="pub-contact-info">
          <h1 class="pub-section-title" style="text-align:left;">Get in Touch</h1>
          <p class="pub-section-sub" style="text-align:left;">
            Questions about a reading, a subscription, or the technology?
            Naveen answers personally.
          </p>

          <div class="pub-contact-methods">
            <a href="tel:+919669756111" class="pub-contact-method">
              <span class="pub-contact-method-icon">📞</span>
              <div>
                <div class="pub-contact-method-label">Phone / WhatsApp</div>
                <div class="pub-contact-method-value">+91 96697 56111</div>
              </div>
            </a>
            <a href="mailto:info@occultviision.com" class="pub-contact-method">
              <span class="pub-contact-method-icon">✉</span>
              <div>
                <div class="pub-contact-method-label">Email</div>
                <div class="pub-contact-method-value">info@occultviision.com</div>
              </div>
            </a>
            <div class="pub-contact-method">
              <span class="pub-contact-method-icon">📍</span>
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

        <!-- Contact Form Column -->
        <div class="pub-contact-form-wrap">
          <form class="pub-contact-form" id="contact-form" novalidate>
            <div class="pub-form-field">
              <label for="cf-name">Your Name *</label>
              <input type="text" id="cf-name" name="name" placeholder="Ravi Sharma"
                     autocomplete="name" required />
            </div>
            <div class="pub-form-field">
              <label for="cf-phone">Phone / WhatsApp *</label>
              <div class="pub-form-phone-row">
                <span class="pub-form-phone-prefix">+91</span>
                <input type="tel" id="cf-phone" name="phone"
                       placeholder="9876543210" maxlength="10"
                       inputmode="numeric" pattern="[0-9]{10}" required />
              </div>
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
              <textarea id="cf-message" name="message" rows="4"
                        placeholder="Tell Naveen what you're looking for…"></textarea>
            </div>
            <div class="pub-form-actions">
              <button type="submit" class="pub-btn pub-btn--primary pub-btn--full"
                      id="btn-send-whatsapp">
                Send via WhatsApp
              </button>
              <p class="pub-form-note">
                This opens WhatsApp with your message pre-filled.
                No data is stored by OccultViision from this form.
              </p>
            </div>
          </form>
        </div>

      </div>
    </section>
  `;

  wrapPublicPage("#/contact", html);

  // Wire form → WhatsApp after DOM is ready
  requestAnimationFrame(() => {
    const form = document.getElementById("contact-form") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", (e: Event) => {
      e.preventDefault();

      const name    = (document.getElementById("cf-name")    as HTMLInputElement).value.trim();
      const phone   = (document.getElementById("cf-phone")   as HTMLInputElement).value.trim();
      const topic   = (document.getElementById("cf-topic")   as HTMLSelectElement).value;
      const message = (document.getElementById("cf-message") as HTMLTextAreaElement).value.trim();

      if (!name || !/^\d{10}$/.test(phone)) {
        showToast("Please fill in your name and a valid 10-digit phone number.", true);
        return;
      }

      // Build WhatsApp message
      const topicLabel = topic
        ? (document.getElementById("cf-topic") as HTMLSelectElement)
            .selectedOptions[0]?.text ?? topic
        : "General enquiry";

      const waText = encodeURIComponent(
        `Hello Naveen,\n\nI'm ${name} (+91 ${phone}).\n` +
        `Topic: ${topicLabel}\n` +
        (message ? `\n${message}\n` : "") +
        `\n— Sent from occultviision.com`
      );

      // Naveen's WhatsApp
      const waUrl = `https://wa.me/919669756111?text=${waText}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  });
}
