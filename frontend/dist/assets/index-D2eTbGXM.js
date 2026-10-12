(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();const ka=["en","hi"],Se="en",Re="language";async function xa(){if(!window.i18next){console.error("[i18n] i18next library not loaded");return}const e=localStorage.getItem(Re)||Se;try{await window.i18next.use(window.i18nextHttpBackend).use(window.i18nextBrowserLanguageDetector).init({fallbackLng:Se,lng:e,supportedLngs:ka,ns:["common"],defaultNS:"common",backend:{loadPath:"/docs/{{lng}}-{{ns}}.json",addPath:"/docs/{{lng}}-{{ns}}.json"},detection:{order:["localStorage","navigator"],caches:["localStorage"]},interpolation:{escapeValue:!1}}),console.log(`[i18n] Initialized with language: ${window.i18next.language}`),window.i18next.on("languageChanged",a=>{localStorage.setItem(Re,a),document.documentElement.lang=a,window.dispatchEvent(new CustomEvent("i18n-language-changed",{detail:{language:a}}))})}catch(a){console.error("[i18n] Initialization failed:",a),window.i18next.changeLanguage(Se)}}function $a(){if(!window.i18next){console.error("[i18n] i18next not initialized");return}const e=window.i18next.language,a=e==="en"?"hi":"en";window.i18next.changeLanguage(a),console.log(`[i18n] Language toggled: ${e} → ${a}`)}function Ee(){if(!window.i18next){console.warn("[i18n] i18next not initialized, skipping DOM translation");return}const e=document.querySelectorAll("[data-i18n]");e.forEach(a=>{const t=a.getAttribute("data-i18n");if(t){if(typeof window.i18next.exists=="function"&&!window.i18next.exists(t))return;const i=window.i18next.t(t);if(!i||i===t)return;a.tagName==="INPUT"||a.tagName==="TEXTAREA"?a.placeholder=i:a.textContent=i}}),console.log(`[i18n] Translated ${e.length} DOM elements`)}function N(){return document.getElementById("app")}function B(e){e.innerHTML=""}function k(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function x(e,a=!1){let t=document.getElementById("ov-toast");t||(t=document.createElement("div"),t.id="ov-toast",document.body.appendChild(t)),t.textContent=e,t.className=`ov-toast show ${a?"error":"ok"}`,setTimeout(()=>t.classList.remove("show"),3e3)}function Sa(){const e=document.documentElement,a=localStorage.getItem("theme");a==="dark"||a==="light"?e.setAttribute("data-theme",a):window.matchMedia("(prefers-color-scheme: dark)").matches?e.setAttribute("data-theme","dark"):e.setAttribute("data-theme","light")}function Ea(){const e=document.documentElement,t=(e.getAttribute("data-theme")||"light")==="dark"?"light":"dark";e.setAttribute("data-theme",t),localStorage.setItem("theme",t);const i=document.getElementById("btn-theme-toggle");if(i){const n=i.querySelector("span");n&&(n.textContent=t==="dark"?"☀️":"🌙")}}const Ia={},Ta=Ia?.VITE_API_BASE??"";let Ce=localStorage.getItem("ov_session");function Ze(e){Ce=e,e?localStorage.setItem("ov_session",e):localStorage.removeItem("ov_session")}async function C(e,a={}){const t={...a.headers??{}};Ce&&(t.Authorization=`Bearer ${Ce}`),a.body&&typeof a.body=="string"&&(t["Content-Type"]="application/json");const i=await fetch(`${Ta}${e}`,{...a,headers:t});let n;try{n=await i.json()}catch{n=null}return i.status===401&&(Ze(null),E("/login")),{ok:i.ok,status:i.status,data:n}}const La=e=>C("/auth/request-otp",{method:"POST",body:JSON.stringify({phone_number:e})}),Ca=(e,a,t)=>C("/auth/verify-otp",{method:"POST",body:JSON.stringify({phone_number:e,code:a,fingerprint_hash:t})}),se=()=>C("/kundali"),Pa=e=>C("/kundali",{method:"POST",body:JSON.stringify(e)}),Xe=e=>C(`/kundali/${e}`,{method:"DELETE"}),De=(e,a,t,i)=>{const n=new URLSearchParams({lat:String(e),lon:String(a)});return t&&n.set("purpose",t),i!==void 0&&n.set("kundali_id",String(i)),C(`/muhurta/now?${n}`)},ea=e=>{const a=new URLSearchParams({lat:String(e.lat),lon:String(e.lon)});return e.purpose&&a.set("purpose",e.purpose),e.kundali_id!==void 0&&a.set("kundali_id",String(e.kundali_id)),e.from&&a.set("from",e.from),e.to&&a.set("to",e.to),e.top_n!==void 0&&a.set("top_n",String(e.top_n)),C(`/muhurta/scan?${a}`)},$e=e=>C(`/kundali/${e}/chart`),Aa=e=>C(`/kp/chart/${e}`),za=(e,a)=>C("/kp/query",{method:"POST",body:JSON.stringify({kundali_id:e,activity_slug:a})}),Ma=()=>C("/kp/activities"),Na=(e,a)=>C("/kp/query-natural",{method:"POST",body:JSON.stringify({kundali_id:e,question:a})}),Ba=()=>C("/wallet/balance"),Da=e=>C("/wallet/recharge",{method:"POST",body:JSON.stringify({amount_paise:e})}),_a=()=>C("/referral/code"),qa=()=>C("/public/config"),Ha=e=>C("/public/contact",{method:"POST",body:JSON.stringify(e)}),Ra=e=>C("/public/testimonials",{method:"POST",body:JSON.stringify(e)}),aa=()=>C("/public/testimonials"),Oa=(e="new")=>C(`/admin/contact-messages?status=${encodeURIComponent(e)}`),Ka=(e,a)=>C(`/admin/contact-messages/${e}/status`,{method:"POST",body:JSON.stringify({status:a})}),Fa=(e="pending")=>C(`/admin/testimonials?status=${encodeURIComponent(e)}`),ja=(e,a)=>C(`/admin/testimonials/${e}/review`,{method:"POST",body:JSON.stringify({status:a})}),Va=()=>C("/admin/app-settings"),Ua=e=>C("/admin/app-settings",{method:"POST",body:JSON.stringify(e)}),Wa=e=>C(`/admin/users/lookup?phone=${encodeURIComponent(e)}`),Ga=e=>C("/admin/users/activate",{method:"POST",body:JSON.stringify(e)}),Ya=()=>C("/admin/stats"),Oe=De,ee={whatsapp_number:"919669756111",contact_phone:"919669756111",contact_email:"info@occultviision.com"};let V=null,oe=null;function Ja(){return V??ee}function Pe(){return V?Promise.resolve(V):(oe||(oe=qa().then(e=>{const a=e.ok&&e.data?e.data:{};return V={whatsapp_number:/^91[6-9]\d{9}$/.test(a.whatsapp_number)?a.whatsapp_number:ee.whatsapp_number,contact_phone:/^91[6-9]\d{9}$/.test(a.contact_phone)?a.contact_phone:ee.contact_phone,contact_email:typeof a.contact_email=="string"&&a.contact_email.includes("@")?a.contact_email:ee.contact_email},V}).catch(()=>ee).finally(()=>{oe=null})),oe)}function Qa(){V=null}function ta(e){const a=e.replace(/^91/,"");return`+91 ${a.slice(0,5)} ${a.slice(5)}`}function na(e,a=Ja()){return`https://wa.me/${a.whatsapp_number}${e?`?text=${encodeURIComponent(e)}`:""}`}function Za(e,a){e.querySelectorAll("[data-cfg]").forEach(t=>{const i=t.dataset.cfg;i==="phone"?(t.textContent=ta(a.contact_phone),t instanceof HTMLAnchorElement&&(t.href=`tel:+${a.contact_phone}`)):i==="email"?(t.textContent=a.contact_email,t instanceof HTMLAnchorElement&&(t.href=`mailto:${a.contact_email}`)):i==="whatsapp"&&t instanceof HTMLAnchorElement&&(t.href=na(void 0,a))})}function Xa(e){const a=[{label:"Features",route:"#/features"},{label:"Pricing",route:"#/pricing"},{label:"Blog",route:"#/blog"},{label:"Reviews",route:"#/testimonials"},{label:"Contact",route:"#/contact"}];return`
    <nav class="pub-nav">
      <a href="#/home" class="pub-nav-brand">
        <span class="pub-nav-logo">☉</span>
        <span class="pub-nav-name">OCCULTVIISION</span>
      </a>
      <div class="pub-nav-links">${a.map(i=>`
      <a href="${i.route}"
         class="pub-nav-link ${e===i.route?"pub-nav-link--active":""}">
        ${i.label}
      </a>`).join("")}</div>
      <a href="#/login" class="pub-nav-cta">Enter App →</a>
      <button class="pub-nav-hamburger" id="pub-nav-hamburger" aria-label="Menu">☰</button>
    </nav>
    <div class="pub-nav-mobile-menu" id="pub-nav-mobile-menu">
      ${a.map(i=>`<a href="${i.route}" class="pub-nav-mobile-link">${i.label}</a>`).join("")}
      <a href="#/login" class="pub-nav-mobile-link pub-nav-mobile-cta">Enter App →</a>
    </div>
  `}function et(){return`
    <footer class="pub-footer">
      <div class="pub-footer-inner">
        <div class="pub-footer-brand">
          <span class="pub-footer-logo">☉</span>
          <span class="pub-footer-name">OCCULTVIISION</span>
          <p class="pub-footer-tagline">
            Vedic Astrology &amp; KP System — Precise timing for life's decisions.
          </p>
          <p class="pub-footer-credit">
            By Naveen K. Rai · Astronumerologist &amp; Vastu Consultant
          </p>
        </div>

        <div class="pub-footer-links">
          <div class="pub-footer-col">
            <h4>Product</h4>
            <a href="#/features">Features</a>
            <a href="#/pricing">Pricing</a>
            <a href="#/login">Login</a>
          </div>
          <div class="pub-footer-col">
            <h4>Learn</h4>
            <a href="#/blog">Blog &amp; Articles</a>
            <a href="#/blog#kp">KP System Guide</a>
            <a href="#/blog#muhurta">Muhurta Basics</a>
          </div>
          <div class="pub-footer-col">
            <h4>Contact</h4>
            <a href="tel:+919669756111" data-cfg="phone">+91 96697 56111</a>
            <a href="mailto:info@occultviision.com" data-cfg="email">info@occultviision.com</a>
            <a href="#/contact">Send a Message</a>
            <a href="#/testimonials">Share Your Experience</a>
          </div>
        </div>
      </div>
      <div class="pub-footer-bottom">
        <span>© ${new Date().getFullYear()} OCCULTVIISION™. All rights reserved.</span>
        <span>Bhopal, Madhya Pradesh, India</span>
      </div>
    </footer>
  `}function Z(e,a){const t=N();B(t),t.innerHTML=`
    <div class="pub-page">
      ${Xa(e)}
      <main class="pub-main">${a}</main>
      ${et()}
    </div>
  `;const i=document.getElementById("pub-nav-hamburger"),n=document.getElementById("pub-nav-mobile-menu");i?.addEventListener("click",()=>{n?.classList.toggle("pub-nav-mobile-menu--open")});const s=t.querySelector(".pub-page");s&&Pe().then(r=>Za(s,r)),n?.querySelectorAll("a").forEach(r=>{r.addEventListener("click",()=>n.classList.remove("pub-nav-mobile-menu--open"))})}const ia={muhurta:"Muhurta",kundali:"Birth Chart / KP",numerology:"Numerology",vastu:"Vastu",app:"TaraNidhi App",other:"Consultation"};function sa(e){return e.map(a=>{const t=a.rating?`<div class="pub-testi-stars" aria-label="${a.rating} out of 5 stars">${"★".repeat(a.rating)}${"☆".repeat(5-a.rating)}</div>`:"",i=[ia[a.service]??"Consultation",a.city].filter(Boolean).map(k).join(" · ");return`
        <figure class="pub-testi">
          ${t}
          <blockquote class="pub-testi-quote">${k(a.quote)}</blockquote>
          <figcaption class="pub-testi-author">
            <span class="pub-testi-name">${k(a.name)}</span>
            <span class="pub-testi-role">${i}</span>
          </figcaption>
        </figure>`}).join("")}function at(){const e=`
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
                ${[5,4,3,2,1].map(a=>`
                  <label class="pub-rating-opt">
                    <input type="radio" name="tf-rating" value="${a}" />
                    <span>${a} ★</span>
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
  `;Z("#/testimonials",e),tt(),nt()}async function tt(){const e=document.getElementById("testi-list");if(e)try{const a=await aa(),t=a.ok?a.data?.testimonials??[]:[];e.innerHTML=t.length?sa(t):`<p class="pub-testi-empty">No reviews published yet. Be the first to
           <a href="#/testimonials" id="testi-jump">share your experience</a>.</p>`,document.getElementById("testi-jump")?.addEventListener("click",i=>{i.preventDefault(),document.getElementById("share")?.scrollIntoView({behavior:"smooth"}),document.getElementById("tf-name")?.focus({preventScroll:!0})})}catch{e.innerHTML='<p class="pub-testi-empty">Reviews could not be loaded right now.</p>'}finally{e.setAttribute("aria-busy","false")}}function nt(){const e=document.getElementById("testi-form");if(!e)return;const a=s=>document.getElementById(s).value,t=(s,r)=>{const o=document.getElementById(`${s}-err`);o&&(o.textContent=r,o.hidden=!r),document.getElementById(s)?.setAttribute("aria-invalid",r?"true":"false")},i=document.getElementById("tf-quote"),n=document.getElementById("tf-quote-count");i.addEventListener("input",()=>{n.textContent=`${i.value.trim().length} / 600`}),e.addEventListener("submit",async s=>{s.preventDefault();const r=a("tf-name").trim(),o=a("tf-phone").replace(/\D/g,""),d=i.value.trim(),l=document.getElementById("tf-consent").checked,m=e.querySelector('input[name="tf-rating"]:checked'),u=[["tf-name",r.length<2?"Please enter your name.":""],["tf-phone",/^[6-9]\d{9}$/.test(o)?"":"Enter a valid 10-digit mobile number."],["tf-quote",d.length<20?"Please write at least 20 characters.":""],["tf-consent",l?"":"Please tick the box so we can publish your review."]];u.forEach(([f,g])=>t(f,g));const v=u.find(([,f])=>f);if(v){document.getElementById(v[0])?.focus();return}const c=document.getElementById("tf-submit"),p=document.getElementById("tf-status");c.disabled=!0,c.textContent="Submitting…",p.textContent="";try{const f=await Ra({name:r,phone:o,city:a("tf-city").trim(),service:a("tf-service"),rating:m?Number(m.value):null,quote:d,consent:!0,website:a("tf-website")});if(f.ok){document.getElementById("testi-form-wrap").innerHTML=`
          <div class="pub-contact-success" role="status">
            <h3 tabindex="-1">Thank you, ${k(r)}.</h3>
            <p>Your review has been received and will appear here once it is approved.</p>
          </div>`,document.querySelector("#testi-form-wrap h3")?.focus();return}const g=f.data?.field,y={name:"tf-name",phone:"tf-phone",quote:"tf-quote",consent:"tf-consent"};g&&y[g]?t(y[g],f.data.error):p.textContent=f.data?.error??"Could not submit your review. Please try again."}catch{p.textContent="No internet connection, or the server could not be reached."}c.disabled=!1,c.textContent="Submit Review"})}function it(){Z("#/home",`
    <!-- ── Hero ── -->
    <section class="pub-hero">
      <div class="pub-hero-inner">
        <div class="pub-hero-badge">Krishnamurti Paddhati · Lahiri Ayanamsa</div>
        <h1 class="pub-hero-title">
          Know the <em>exact</em> moment<br>
          to act — before you act.
        </h1>
        <p class="pub-hero-sub">
          OccultViision combines KP astrology, Muhurta timing, and Vedic numerology
          into one precision tool — verified against classical texts, not guesswork.
        </p>
        <div class="pub-hero-actions">
          <a href="#/login" class="pub-btn pub-btn--primary">Start for Free →</a>
          <a href="#/features" class="pub-btn pub-btn--ghost">See How It Works</a>
        </div>
        <div class="pub-hero-proof">
          <span>✓ 22/22 sub-lord matches verified</span>
          <span>✓ KP + Panchanga + Hora integrated</span>
          <span>✓ No subscription required to start</span>
        </div>
      </div>
      <div class="pub-hero-visual" aria-hidden="true">
        <div class="pub-chart-preview">
          <div class="pub-chart-ring pub-chart-ring--1"></div>
          <div class="pub-chart-ring pub-chart-ring--2"></div>
          <div class="pub-chart-ring pub-chart-ring--3"></div>
          <div class="pub-chart-center">☉</div>
          <div class="pub-chart-label pub-chart-label--n">Muhurta</div>
          <div class="pub-chart-label pub-chart-label--e">KP Sub-Lords</div>
          <div class="pub-chart-label pub-chart-label--s">Numerology</div>
          <div class="pub-chart-label pub-chart-label--w">Tarabala</div>
        </div>
      </div>
    </section>

    <!-- ── Value Props ── -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <h2 class="pub-section-title">Five systems. One answer.</h2>
        <p class="pub-section-sub">
          Most apps give you one system. OccultViision layers five,
          weighted and cross-verified to give a single confidence score.
        </p>
        <div class="pub-props-grid">
          <div class="pub-prop-card pub-prop-card--akash">
            <div class="pub-prop-icon">♈</div>
            <h3>KP Sub-Lords</h3>
            <p>243-fold subdivision of the zodiac. The most precise timing
               system in Vedic astrology — verified against Krishnamurti's
               original tables.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--agni">
            <div class="pub-prop-icon">⏱</div>
            <h3>Muhurta Timing</h3>
            <p>8-layer confidence index: Panchanga, Hora, Dosha, Tarabala,
               Chandrabala, Gochar, Dasha, and Ashtakavarga — all scored
               and weighted.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--jal">
            <div class="pub-prop-icon">🔢</div>
            <h3>Numerology</h3>
            <p>Pythagorean, Chaldean, and Kabalah methods applied to name,
               birth date, and business queries. Cross-checked for consistency.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--vayu">
            <div class="pub-prop-icon">⭐</div>
            <h3>Tarabala & Hora</h3>
            <p>Birth-star compatibility scored against the query star.
               Hora chart for money, business, and deal-timing questions.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--prithvi">
            <div class="pub-prop-icon">🏠</div>
            <h3>Birth Chart (Kundali)</h3>
            <p>Full KP chart with Placidus houses, Lahiri ayanamsa,
               Dasha timeline, and sub-lord table for all 12 houses.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--neutral">
            <div class="pub-prop-icon">📊</div>
            <h3>Event Categories</h3>
            <p>Dedicated scoring for Property, Marriage, Business, and
               Medical decisions — each with domain-specific rules and
               classical references.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How It Works ── -->
    <section class="pub-section">
      <div class="pub-container">
        <h2 class="pub-section-title">From birth details to confident timing</h2>
        <div class="pub-steps">
          <div class="pub-step">
            <div class="pub-step-num">1</div>
            <div class="pub-step-body">
              <h3>Enter your birth chart</h3>
              <p>Date, time, and place of birth. The app calculates your Kundali
                 instantly using Lahiri ayanamsa and Placidus houses.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">2</div>
            <div class="pub-step-body">
              <h3>Ask your question</h3>
              <p>Choose an event category — property, marriage, business, or medical.
                 Specify the window of dates you're considering.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">3</div>
            <div class="pub-step-body">
              <h3>Get the confidence score</h3>
              <p>OccultViision returns a 0–100 score with per-layer breakdown,
                 the best Muhurta within your window, and a plain-language verdict.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">4</div>
            <div class="pub-step-body">
              <h3>Act with confidence</h3>
              <p>Share the report with your consultant, save it to PDF, or
                 use it directly to schedule the signing, ceremony, or launch.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Client reviews (approved submissions only, loaded from the API) ── -->
    <section class="pub-section pub-section--alt" id="home-reviews" hidden>
      <div class="pub-container">
        <h2 class="pub-section-title">What clients say</h2>
        <div class="pub-testimonials" id="home-testi-list"></div>
        <p class="pub-section-more">
          <a href="#/testimonials" class="pub-btn pub-btn--ghost">Read all reviews or share yours</a>
        </p>
      </div>
    </section>
    <section class="pub-section pub-section--alt" id="home-reviews-empty">
      <div class="pub-container pub-cta-inner">
        <h2 class="pub-section-title">Worked with Naveen?</h2>
        <p class="pub-section-sub">Share your experience. Reviews are published only with your permission.</p>
        <a href="#/testimonials" class="pub-btn pub-btn--ghost">Write a review</a>
      </div>
    </section>

    <!-- ── Final CTA ── -->
    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Start free. Upgrade when you need more.</h2>
        <p>No subscription required to begin. New accounts receive trial points
           to explore Muhurta timing, KP queries, and numerology.</p>
        <a href="#/login" class="pub-btn pub-btn--primary pub-btn--lg">
          Create Free Account →
        </a>
        <a href="#/pricing" class="pub-btn pub-btn--ghost">View Plans</a>
      </div>
    </section>
  `),st()}async function st(){try{const e=await aa(),a=e.ok?e.data?.testimonials??[]:[];if(!a.length)return;const t=document.getElementById("home-testi-list"),i=document.getElementById("home-reviews"),n=document.getElementById("home-reviews-empty");if(!t||!i||!n)return;t.innerHTML=sa(a.slice(0,3)),i.hidden=!1,n.hidden=!0}catch{}}const ue="₹99",rt="₹TBD",ot="₹TBD",Ie=15,ra={monthly:{label:"Monthly",price:ue,sub:"per month · introductory price",savings:null},"6month":{label:"6 Months",price:rt,sub:"every 6 months · final price TBD",savings:"Save vs monthly · final price TBD"},yearly:{label:"Yearly",price:ot,sub:"per year · best value · final price TBD",savings:"Save vs monthly · final price TBD"}};function ct(){return`
    <div class="price-period-wrap">
      <div class="price-period-toggle" id="period-toggle">
        ${Object.entries(ra).map(([e,a],t)=>`
          <button
            class="period-btn${t===0?" active":""}"
            data-period="${e}"
            onclick="setPricingPeriod('${e}', this)"
          >${a.label}</button>
        `).join("")}
      </div>
      <div class="price-period-savings" id="period-savings"></div>
    </div>
  `}function lt(){const e=`
    <!-- Intro offer banner -->
    <div class="pricing-intro-banner">
      <span class="pricing-intro-fire">🔥</span>
      <strong>Early-Bird Offer — First ${Ie} Days Only:</strong>
      TaraNidhi Intelligence at <strong>${ue}/month</strong>, locked in forever at sign-up price.
    </div>

    <section class="pub-section pub-pricing-hero">
      <div class="pub-container">
        <h1 class="pub-section-title">Free forever. Intelligent when you upgrade.</h1>
        <p class="pub-section-sub">
          Basic Panchang is <strong>free for everyone</strong>, always.
          Unlock Naveen's proprietary TaraNidhi intelligence engine for KP Astrology, precise Muhurta, and Numerology.
        </p>

        <!-- What's free vs paid -->
        <div class="pricing-split-explain">
          <div class="pricing-split-col pricing-split--free">
            <div class="pricing-split-label">FREE — Always</div>
            <div class="pricing-split-title">Basic Panchang</div>
            <ul>
              <li>✓ Daily Tithi, Nakshatra, Yoga, Karana</li>
              <li>✓ Sunrise / Sunset times</li>
              <li>✓ Rahu Kaal, Gulika Kaal, Abhijit Muhurta</li>
              <li>✓ Auspicious colour, direction of the day</li>
              <li class="note">Ad-supported (like all Panchang apps)</li>
            </ul>
          </div>
          <div class="pricing-split-col pricing-split--paid">
            <div class="pricing-split-label">PAID — TaraNidhi Intelligence</div>
            <div class="pricing-split-title">KP Astrology + Muhurta + Numerology</div>
            <ul>
              <li>✓ Full KP Kundali (22/22 sub-lords, Lahiri, Placidus)</li>
              <li>✓ Precision Muhurta for Property, Marriage, Business, Medical</li>
              <li>✓ 8-layer Confidence Index (KP + Hora + Tara + Panchaka)</li>
              <li>✓ Chaldean + Pythagorean Numerology</li>
              <li>✓ Muhurta Scanner (bulk window scan)</li>
              <li class="highlight">✓ No ads</li>
            </ul>
          </div>
        </div>

      </div>
    </section>

    <section class="pub-section">
      <div class="pub-container">

        ${ct()}

        <div class="pub-tiers">

          <!-- FREE — Basic Panchang -->
          <div class="pub-tier pub-tier--free">
            <div class="pub-tier-badge">Free</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">₹0</span>
              <span class="pub-tier-price-sub">forever free · ad-supported</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Daily Tithi, Nakshatra, Yoga, Karana</li>
              <li>✓ Sunrise/Sunset, Rahu Kaal, Gulika Kaal</li>
              <li>✓ Auspicious colour + direction</li>
              <li>✓ Abhijit Muhurta window</li>
              <li class="pub-tier-no">✗ KP Kundali / birth chart</li>
              <li class="pub-tier-no">✗ Precision Muhurta</li>
              <li class="pub-tier-no">✗ Numerology report</li>
              <li class="pub-tier-no">✗ Muhurta Scanner</li>
              <li>
                <span class="ad-label-inline">Ad-supported</span>
                <span class="ad-label-note">Google AdSense</span>
              </li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--outline pub-btn--full">
              Use Free Panchang
            </a>
          </div>

          <!-- DEMO — Try TaraNidhi -->
          <div class="pub-tier pub-tier--demo">
            <div class="pub-tier-badge">Demo</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">Free</span>
              <span class="pub-tier-price-sub">limited queries · ad-supported</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Free</li>
              <li>✓ 3 Muhurta queries (lifetime demo)</li>
              <li>✓ 1 KP Kundali generation</li>
              <li>✓ 5 Numerology reports</li>
              <li class="pub-tier-no">✗ Muhurta Scanner</li>
              <li class="pub-tier-no">✗ 8-layer Confidence Index</li>
              <li class="pub-tier-no">✗ Unlimited queries</li>
              <li>
                <span class="ad-label-inline">Ad-supported</span>
                <span class="ad-label-note">Splash ad on open</span>
              </li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--ghost pub-btn--full">
              Try Demo Free
            </a>
          </div>

          <!-- TaraNidhi Intelligence — highlighted -->
          <div class="pub-tier pub-tier--taranidhi pub-tier--featured">
            <div class="pub-tier-popular">⭐ Early Bird — First ${Ie} Days</div>
            <div class="pub-tier-badge">TaraNidhi Intelligence</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main" id="tier-main-price">${ue}</span>
              <span class="pub-tier-price-sub" id="tier-price-sub">per month · introductory price</span>
            </div>
            <div class="intro-badge">
              🔒 Price locked at sign-up · Never increases
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Demo, unlimited</li>
              <li>✓ Full KP Kundali (22/22 sub-lords verified)</li>
              <li>✓ Precision Muhurta — Property, Marriage, Business, Medical</li>
              <li>✓ 8-layer Confidence Index</li>
              <li>✓ Chaldean + Pythagorean Numerology</li>
              <li>✓ Muhurta Scanner (bulk time windows)</li>
              <li>✓ Tarabala, Panchaka, Hora Scoring</li>
              <li>✓ Referral programme</li>
              <li class="highlight">✓ <strong>Zero ads</strong></li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--primary pub-btn--full">
              🔥 Get TaraNidhi Intelligence
            </a>
            <div class="tier-no-ads-note">No ads. No interruptions. Pure Vedic intelligence.</div>
          </div>

        </div><!-- /pub-tiers -->

        <!-- What is TaraNidhi Intelligence -->
        <div class="pub-taranidhi-explain">
          <h3>What is TaraNidhi Intelligence?</h3>
          <p>
            <strong>TaraNidhi</strong> (Sanskrit: "Treasure of Stars") is Naveen K. Rai's proprietary Vedic
            intelligence engine built on 20+ years of consultancy and rigorous formula verification.
          </p>
          <p>
            Unlike generic Panchang apps that show only the day's basic parameters, TaraNidhi runs
            the full <strong>Krishnamurti Paddhati (KP)</strong> system — 243-fold sub-lord subdivisions,
            Lahiri ayanamsa, Placidus houses — cross-referenced with Hora scoring, Tarabala star
            strength, and Panchaka warnings, generating an <strong>8-layer Confidence Index</strong> for
            every Muhurta window.
          </p>
          <p>
            Verified against classical texts. Validated on Naveen's own birth chart (22/22 sub-lords
            matched against onlinejyotish.com). <strong>No rounding. No compromises.</strong>
          </p>
        </div>

        <!-- Ad transparency -->
        <div class="pub-ad-transparency">
          <h4>About Ads</h4>
          <p>
            Free and Demo tiers are funded by advertising (Google AdSense / similar).
            A brief splash ad appears when the app opens; the X close button activates after 5 seconds.
            TaraNidhi Intelligence subscribers see <strong>zero ads</strong>.
          </p>
          <p>
            Ad revenue allows us to keep Basic Panchang free for everyone, forever — just like
            every other Panchang app on the market.
          </p>
        </div>

        <!-- FAQ -->
        <div class="pub-faq">
          <h3>Pricing FAQ</h3>
          <div class="pub-faq-item">
            <h4>What is the early-bird price?</h4>
            <p>
              For the first ${Ie} days after launch, TaraNidhi Intelligence is available at
              ${ue}/month. This price is <strong>locked in permanently</strong> for
              everyone who subscribes during this window — your price never increases.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Can I keep Basic Panchang free forever?</h4>
            <p>
              Yes. Basic Panchang is free for everyone, always. It is ad-supported (the same model
              used by every major Panchang app). There is no time limit and no credit system.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>What happens when Demo queries run out?</h4>
            <p>
              The app will show you how many queries remain and prompt you to upgrade to TaraNidhi
              Intelligence. You retain access to Free Basic Panchang regardless.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>
              All major UPI apps, debit cards, credit cards, and net banking via Razorpay.
              100% secure — no card data stored by OccultViision.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>
              Yes. Cancel before the next billing date and you will not be charged again. Your
              TaraNidhi access continues until the end of the paid period. Contact Naveen directly
              at +91 96697 56111 for billing queries.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Is there a B2B / hospital plan?</h4>
            <p>
              Yes — custom pricing for hospitals scheduling surgical procedures, corporate firms
              timing major contracts, and consulting astrologers needing white-label reports.
              <a href="#/contact">Contact us</a> for a quote.
            </p>
          </div>
        </div>

      </div>
    </section>
  `;Z("#/pricing",e),window.setPricingPeriod=(a,t)=>{document.querySelectorAll(".period-btn").forEach(o=>o.classList.remove("active")),t.classList.add("active");const i=ra[a],n=document.getElementById("tier-main-price"),s=document.getElementById("tier-price-sub"),r=document.getElementById("period-savings");n&&(n.textContent=i.price),s&&(s.textContent=i.sub),r&&(r.textContent=i.savings??"")}}function dt(){Z("#/features",`
    <section class="pub-section pub-features-hero">
      <div class="pub-container">
        <h1 class="pub-section-title">Every feature. Every system. One place.</h1>
        <p class="pub-section-sub">
          OccultViision is built around the five classical pillars of Vedic timing science —
          Panchanga, KP, Hora, Tara, and Numerology. Each is implemented from first
          principles, not reverse-engineered from other apps.
        </p>
      </div>
    </section>

    <!-- Kundali / Birth Chart -->
    <section class="pub-section">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--akash">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Birth Chart · Kundali</div>
            <h2>KP-accurate Kundali in seconds</h2>
            <p>Enter birth date, time, and place. OccultViision computes:</p>
            <ul class="pub-feature-list">
              <li>Sidereal longitudes (Lahiri ayanamsa, default app-wide)</li>
              <li>Placidus house cusps — the KP standard</li>
              <li>Planet positions, retrograde status, combustion</li>
              <li>Full sub-lord table for all 12 houses (243-fold subdivision)</li>
              <li>Moon Nakshatra, Pada, Tarabala score</li>
              <li>Ganda Moola flag with classical source citation</li>
            </ul>
            <p class="pub-feature-proof">
              Verified: 22/22 sub-lord matches against onlinejyotish.com
              for reference birth chart (Naveen K. Rai, 08/04/1973, 11:45 IST, Bhopal).
            </p>
          </div>
          <div class="pub-feature-visual pub-feature-visual--chart">
            <div class="pub-mini-chart">
              <div class="pub-mc-grid">
                <div class="pub-mc-cell">12</div><div class="pub-mc-cell">1</div>
                <div class="pub-mc-cell">2</div><div class="pub-mc-cell">3</div>
                <div class="pub-mc-cell">11</div><div class="pub-mc-cell pub-mc-center">☉</div>
                <div class="pub-mc-cell pub-mc-center-r">KP</div><div class="pub-mc-cell">4</div>
                <div class="pub-mc-cell">10</div><div class="pub-mc-cell pub-mc-center-b">⬛</div>
                <div class="pub-mc-cell pub-mc-center-bl">⬜</div><div class="pub-mc-cell">5</div>
                <div class="pub-mc-cell">9</div><div class="pub-mc-cell">8</div>
                <div class="pub-mc-cell">7</div><div class="pub-mc-cell">6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Muhurta -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--agni pub-feature-block--reverse">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Muhurta Timing · Agni</div>
            <h2>8-layer confidence index for every moment</h2>
            <p>OccultViision's Muhurta engine weights eight independent systems
               and returns a single score (0–100) with a CONVERGENT / PARTIAL /
               DIVERGENT convergence grade.</p>
            <div class="pub-feature-layers">
              <div class="pub-layer"><span class="pub-layer-w">22%</span> Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana)</div>
              <div class="pub-layer"><span class="pub-layer-w">15%</span> Tarabala (birth-star compatibility)</div>
              <div class="pub-layer"><span class="pub-layer-w">12%</span> Dosha analysis (Bhadra, Panchaka, Ganda Moola)</div>
              <div class="pub-layer"><span class="pub-layer-w">12%</span> Gochar (transits of malefics/benefics)</div>
              <div class="pub-layer"><span class="pub-layer-w">11%</span> Ashtakavarga (aggregate planetary strength)</div>
              <div class="pub-layer"><span class="pub-layer-w">10%</span> Chandrabala (Moon's position from natal Moon)</div>
              <div class="pub-layer"><span class="pub-layer-w">10%</span> Dasha (ruling period harmony)</div>
              <div class="pub-layer"><span class="pub-layer-w">8%</span>  Hora (planetary hour for the event type)</div>
            </div>
          </div>
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Muhurta Scanner</div>
            <h2>Scan weeks of dates automatically</h2>
            <p>Don't pick a date manually — let the scanner find the best
               Muhurta inside any date window for your event type.</p>
            <ul class="pub-feature-list">
              <li>Property registration, possession, agreement</li>
              <li>Marriage ceremony, engagement, roka</li>
              <li>Business launch, partnership deed, incorporation</li>
              <li>Surgery scheduling (medical)</li>
              <li>Results ranked by confidence score — top 5 returned</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- KP Sub-Lords -->
    <section class="pub-section">
      <div class="pub-container">
        <div class="pub-feature-block">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">KP System · Krishnamurti Paddhati</div>
            <h2>Sub-lord queries with house signification</h2>
            <p>KP works by ruling the 243 sub-divisions of the zodiac.
               OccultViision implements the full system:</p>
            <ul class="pub-feature-list">
              <li>Sub-lord for any house cusp or planet</li>
              <li>Star lord and sub-lord chain (3 levels)</li>
              <li>House signification based on occupant + owner + aspects</li>
              <li>Ruling planets at the moment of query (KP method)</li>
              <li>KP question analysis: "Will the matter come to pass?"</li>
            </ul>
          </div>
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Dasha Timeline</div>
            <h2>Vimsottari Dasha with sub-periods</h2>
            <ul class="pub-feature-list">
              <li>Full 120-year Vimsottari Dasha sequence</li>
              <li>Mahadasha → Antardasha → Pratyantardasha</li>
              <li>Current Dasha highlighted with start/end dates</li>
              <li>Export timeline for any birth chart</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Numerology -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--jal">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Numerology · Jal (Water)</div>
            <h2>Three systems. Cross-verified.</h2>
            <p>Naveen uses Pythagorean, Chaldean, and Kabalah numerology in
               combination. OccultViision computes all three and flags
               where they agree (signal) or diverge (uncertainty).</p>
            <ul class="pub-feature-list">
              <li>Life Path, Destiny, Soul Urge, Personality numbers</li>
              <li>Business name number + compatibility with owner's numbers</li>
              <li>Auspicious dates from numerology (combined with Muhurta)</li>
              <li>Name correction suggestions (Chaldean method)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Accuracy -->
    <section class="pub-section">
      <div class="pub-container">
        <h2 class="pub-section-title">Accuracy is the product</h2>
        <div class="pub-accuracy-grid">
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">22/22</div>
            <div class="pub-accuracy-label">Sub-lord matches vs. reference calculator</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">243</div>
            <div class="pub-accuracy-label">KP sub-divisions implemented</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">8</div>
            <div class="pub-accuracy-label">Muhurta layers scored independently</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">0</div>
            <div class="pub-accuracy-label">TypeScript compilation errors in production build</div>
          </div>
        </div>
        <p class="pub-accuracy-note">
          Every formula is verified against classical sources before code is written.
          See our <a href="#/blog">methodology articles</a> for the source citations.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Ready to try it?</h2>
        <p>Start with trial points. No subscription required.</p>
        <a href="#/login" class="pub-btn pub-btn--primary pub-btn--lg">Create Free Account →</a>
        <a href="#/pricing" class="pub-btn pub-btn--ghost">See Pricing</a>
      </div>
    </section>
  `)}const ut=[{id:"kp",tag:"KP System",title:"What is Krishnamurti Paddhati? The 243-fold zodiac explained.",summary:`KP astrology divides each of the 27 Nakshatras into 9 sub-lords,
      creating 243 micro-zones of the zodiac. This granularity allows timing
      predictions accurate to days — not months. We explain the Star Lord →
      Sub-Lord → Sub-Sub-Lord chain and how OccultViision implements it.`,readTime:"8 min",date:"Oct 2026"},{id:"muhurta",tag:"Muhurta",title:"Why Muhurta matters for property decisions: a practical guide.",summary:`Choosing an auspicious date for a property registration or
      possession isn't superstition — it's timing science. We walk through
      the five Panchanga elements, Tarabala, and Chandrabala and show exactly
      how OccultViision scores a candidate date. Real example included.`,readTime:"10 min",date:"Oct 2026"},{id:"numerology",tag:"Numerology",title:"Pythagorean vs. Chaldean vs. Kabalah: which numerology system to use?",summary:`Naveen uses all three in combination. Each has different letter
      mappings and different strengths. Chaldean is older and considered more
      precise for name analysis; Pythagorean is simpler and widely used in the
      West. We compare all three with worked examples for business names.`,readTime:"7 min",date:"Sep 2026"},{id:"tarabala",tag:"Tara & Hora",title:"Tarabala and Chandrabala: the two overlooked timing factors.",summary:`Most people focus on Tithi and Nakshatra when picking a Muhurta.
      Tarabala (birth-star compatibility with the query star) and Chandrabala
      (Moon's position from natal Moon) are equally important. Here's how to
      read and interpret them — and why OccultViision weights them at 15% and
      10% respectively in the confidence index.`,readTime:"6 min",date:"Sep 2026"}],pt=[{q:"What is the difference between Tropical and Sidereal zodiac?",a:`Western astrology uses the Tropical zodiac, fixed to the Sun's position
        at the March equinox. Vedic astrology uses the Sidereal zodiac, aligned
        to the actual star constellations. The difference is the Ayanamsa —
        currently about 23.9° (Lahiri). OccultViision uses Lahiri Ayanamsa as
        the default for all calculations.`},{q:"What is Ayanamsa and which one should I use?",a:`Ayanamsa is the difference between the Tropical and Sidereal zodiac.
        Lahiri (also called Chitrapaksha) is the official Government of India
        standard and is used by the majority of KP practitioners.
        OccultViision defaults to Lahiri app-wide.`},{q:"What is the Placidus house system?",a:`Placidus divides the houses based on time taken by a degree to travel
        from the horizon to the meridian. It is the KP standard — Krishnamurti
        used Placidus exclusively for cusps. OccultViision uses Placidus for
        all house cusp calculations.`},{q:"How accurate is the birth time required for KP?",a:`KP is sensitive to birth time because house cusps shift quickly — the
        Ascendant moves about 1° every 4 minutes. For reliable sub-lord analysis
        a birth time accurate to within 5–10 minutes is needed. If you don't
        know your exact time, use the Muhurta features (which don't require a
        birth chart) first.`},{q:"What is Ganda Moola?",a:`Ganda Moola (also Gandanta) refers to the six Nakshatras that fall at
        the junction of fire-water Rashi pairs: Ashwini, Ashlesha, Magha, Jyeshtha,
        Moola, and Revati. Birth under these Nakshatras is traditionally considered
        inauspicious for certain events. OccultViision flags Ganda Moola with a
        warning and cites the classical source (Karma Vipak Samhita).`}];function vt(){const e=ut.map(i=>`
    <div class="pub-article-card" id="${i.id}">
      <div class="pub-article-tag">${i.tag}</div>
      <h3 class="pub-article-title">${i.title}</h3>
      <p class="pub-article-summary">${i.summary}</p>
      <div class="pub-article-meta">
        <span>${i.date}</span>
        <span>${i.readTime} read</span>
      </div>
    </div>
  `).join(""),a=pt.map((i,n)=>`
    <div class="pub-faq-item pub-faq-accordion" id="faq-${n}">
      <button class="pub-faq-q" aria-expanded="false" aria-controls="faq-a-${n}">
        ${i.q}
        <span class="pub-faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="pub-faq-a" id="faq-a-${n}" hidden>
        <p>${i.a}</p>
      </div>
    </div>
  `).join(""),t=`
    <section class="pub-section">
      <div class="pub-container">
        <h1 class="pub-section-title">Articles &amp; Guides</h1>
        <p class="pub-section-sub">
          Methodology notes, system explanations, and practical guides
          from the OCCULTVIISION practice.
        </p>
        <div class="pub-articles-grid">
          ${e}
        </div>
      </div>
    </section>

    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <h2 class="pub-section-title">Frequently Asked Questions</h2>
        <div class="pub-faq pub-faq--full">
          ${a}
        </div>
      </div>
    </section>

    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Questions not answered here?</h2>
        <p>Naveen answers personally. Use the contact form or call directly.</p>
        <a href="#/contact" class="pub-btn pub-btn--primary">Contact Naveen →</a>
      </div>
    </section>
  `;Z("#/blog",t),requestAnimationFrame(()=>{document.querySelectorAll(".pub-faq-q").forEach(i=>{i.addEventListener("click",()=>{const n=i.getAttribute("aria-expanded")==="true",s=i.getAttribute("aria-controls"),r=s?document.getElementById(s):null,o=i.querySelector(".pub-faq-icon");i.setAttribute("aria-expanded",String(!n)),r&&(n?r.setAttribute("hidden",""):r.removeAttribute("hidden")),o&&(o.textContent=n?"+":"−")})})})}function mt(){Z("#/contact",`
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
  `),Pe().then(n=>{const s=document.getElementById("cm-phone");s&&(s.href=`tel:+${n.contact_phone}`);const r=document.getElementById("cm-email");r&&(r.href=`mailto:${n.contact_email}`)});const a=document.getElementById("contact-form");if(!a)return;const t=n=>document.getElementById(n),i=(n,s)=>{const r=document.getElementById(`${n}-err`),o=document.getElementById(n);!r||!o||(r.textContent=s,r.hidden=!s,o.setAttribute("aria-invalid",s?"true":"false"))};a.addEventListener("submit",async n=>{n.preventDefault();const s=t("cf-name").value.trim(),r=t("cf-phone").value.replace(/\D/g,""),o=document.getElementById("cf-topic"),d=o.value,l=document.getElementById("cf-message").value.trim(),m=t("cf-website").value;if(i("cf-name",s.length<2?"Please enter your name.":""),i("cf-phone",/^[6-9]\d{9}$/.test(r)?"":"Enter a valid 10-digit mobile number."),s.length<2)return t("cf-name").focus();if(!/^[6-9]\d{9}$/.test(r))return t("cf-phone").focus();const u=d?o.selectedOptions[0]?.text??d:"General enquiry",v=`Hello Naveen,

I'm ${s} (+91 ${r}).
Topic: ${u}
`+(l?`
${l}
`:"")+`
— Sent from occultviision.com`,c=document.getElementById("btn-send"),p=document.getElementById("cf-status");c.disabled=!0,c.textContent="Sending…",p.textContent="";let f=!1,g="";try{const h=await Ha({name:s,phone:r,topic:d,message:l,website:m});f=h.ok,h.ok||((h.data?.field==="name"||h.data?.field==="phone")&&i(h.data.field==="name"?"cf-name":"cf-phone",h.data.error),g=h.data?.error??"Could not save your message.")}catch{g="No internet connection, or the server could not be reached."}const y=await Pe(),$=na(v,y);if(f){const h=document.getElementById("contact-form-wrap");h.innerHTML=`
        <div class="pub-contact-success" role="status">
          <h2>Thank you, ${k(s)}.</h2>
          <p>Your message has been received. Naveen will reply on +91 ${k(r)}.</p>
          <p>For a faster reply, send it on WhatsApp as well:</p>
          <a class="pub-btn pub-btn--primary pub-btn--full" href="${k($)}"
             target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
        </div>`,h.querySelector("h2")?.setAttribute("tabindex","-1"),h.querySelector("h2")?.focus();return}c.disabled=!1,c.textContent="Send Message",p.innerHTML=`${k(g)} You can still reach us directly:
      <a href="${k($)}" target="_blank" rel="noopener noreferrer">send this on WhatsApp</a>.`})}function bt(){const e=N();B(e),e.innerHTML=`
    <div class="screen login-screen">
      <div class="logo">☉</div>
      <h1>OccultViision</h1>
      <p class="subtitle">Vedic Astrology — Muhurta &amp; KP</p>

      <div id="step-phone">
        <label>Phone Number</label>
        <div class="input-row">
          <span class="prefix">+91</span>
          <input id="phone" type="tel" maxlength="10" placeholder="9876543210" inputmode="numeric" />
        </div>
        <button id="btn-otp" class="btn-primary">Send OTP</button>
      </div>

      <div id="step-otp" class="hidden">
        <label>Enter OTP</label>
        <input id="otp-code" type="tel" maxlength="6" placeholder="000000" inputmode="numeric" />
        <button id="btn-verify" class="btn-primary">Verify &amp; Login</button>
        <button id="btn-back" class="btn-link">← Change number</button>
      </div>

      <div id="login-loading" class="hidden">
        <div class="spinner"></div>
      </div>
    </div>
  `;let a="";const t=document.getElementById("phone"),i=document.getElementById("btn-otp"),n=document.getElementById("step-phone"),s=document.getElementById("step-otp"),r=document.getElementById("otp-code"),o=document.getElementById("btn-verify"),d=document.getElementById("btn-back"),l=document.getElementById("login-loading");i.addEventListener("click",async()=>{if(a=t.value.trim(),!/^\d{10}$/.test(a)){x("Enter a valid 10-digit phone number",!0);return}i.setAttribute("disabled",""),l.classList.remove("hidden");const m=await La(a);l.classList.add("hidden"),i.removeAttribute("disabled"),m.ok?(n.classList.add("hidden"),s.classList.remove("hidden"),r.focus(),x("OTP sent!")):x(m.data?.error??"Failed to send OTP",!0)}),d.addEventListener("click",()=>{s.classList.add("hidden"),n.classList.remove("hidden"),t.focus()}),o.addEventListener("click",async()=>{const m=r.value.trim();if(!/^\d{4,6}$/.test(m)){x("Enter the OTP code",!0);return}o.setAttribute("disabled",""),l.classList.remove("hidden");const u=`pwa-${navigator.userAgent.slice(0,40)}-${screen.width}x${screen.height}`,v=await Ca(a,m,u);l.classList.add("hidden"),o.removeAttribute("disabled"),v.ok&&v.data?.session_token?(Ze(v.data.session_token),x("Logged in!"),E("/dashboard")):x(v.data?.error??"Verification failed",!0)})}async function ht(){const e=N();B(e),e.innerHTML=`
    <div class="screen ti-screen">
      <div class="ti-loading">
        <div class="ti-logo">OCCULTVIISION</div>
        <div class="ti-tagline">Loading your time intelligence…</div>
      </div>
    </div>
  `;const a=await se(),i=(a.ok?a.data.kundalis??[]:[])[0]??null;i?ft(e,i):gt(e)}function gt(e){e.innerHTML=`
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
  `,document.getElementById("btn-create-chart").addEventListener("click",()=>E("/kundali-form")),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),window.location.reload()})}async function ft(e,a,t){const i=await $e(a.id),n=i.ok?i.data.chart:null,s=await De(23.2585,77.402,void 0,a.id),r=s.ok?s.data:null,o=n?.ascendant,d=n?.dasha,l=n?.janmaNakshatra,m=n?.tara,u=d?new Date(d.maha.end).getFullYear():"—",v=d?yt(new Date(d.antar.end)):"—",c=r?.hora?.lord??"—",p=r?.score??"—",f=r?.hora?.end?wt(new Date(r.hora.end)):"—",g=m?.beneficence==="benefic"?"var(--tara-benefic)":m?.beneficence==="malefic"?"var(--tara-malefic)":"var(--tara-neutral)";m&&`${m.name}${m.number}`,e.innerHTML=`
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
          <div class="ti-live-value">${c}</div>
          <div class="ti-live-key">Current Hora</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${p}/100</div>
          <div class="ti-live-key">Muhurta Score</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value" style="color:${g}">${m?.number??"—"}</div>
          <div class="ti-live-key">Tara Now</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${f}</div>
          <div class="ti-live-key">Hora Until</div>
        </div>
      </div>

      <!-- Birth Profile Card -->
      <div class="ti-section-label">YOUR TIME PROFILE</div>
      <div class="ti-profile-card" id="btn-open-chart">
        <div class="ti-profile-left">
          <div class="ti-profile-name">${a.label??"My Chart"}</div>
          <div class="ti-profile-lagna">
            ${o?`${o.rashiName} Ascendant · ${o.nakName} Pada ${o.nakPada}`:"—"}
          </div>
          <div class="ti-profile-nak">
            Moon: ${l?`${l.name} · Lord ${l.lord}`:"—"}
          </div>
        </div>
        <div class="ti-profile-right">
          <div class="ti-dasha-block">
            <div class="ti-dasha-lord">${d?.maha.lord??"—"}</div>
            <div class="ti-dasha-label">Maha Dasha · ends ${u}</div>
          </div>
          <div class="ti-dasha-block" style="margin-top:6px">
            <div class="ti-dasha-lord ti-dasha-antar">${d?.antar.lord??"—"}</div>
            <div class="ti-dasha-label">Antar Dasha · until ${v}</div>
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
        <button class="ti-secondary-btn" data-route="/kp-query">KP Chart</button>
        <button class="ti-secondary-btn" data-route="/kp-sublords">Sub-Lords</button>
        <button class="ti-secondary-btn" data-route="/muhurta-dashboard">Muhurta Dashboard</button>
        <button class="ti-secondary-btn" data-route="/wallet">Wallet</button>
        <button class="ti-secondary-btn" data-route="/kundali">All Charts</button>
      </div>

      <footer class="ti-footer">
        <span>KP · Lahiri Ayanamsa · Placidus Houses · Vimshottari Dasha</span>
      </footer>

    </div>
  `,document.getElementById("btn-open-chart").addEventListener("click",()=>{E(`/birth-chart?id=${a.id}`)}),e.querySelectorAll("[data-route]").forEach(y=>{y.addEventListener("click",()=>E(y.dataset.route))}),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),window.location.reload()})}function yt(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function wt(e){return e.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0})}let ae=null;function oa(){if(ae)return ae;const e=localStorage.getItem("ov_location");if(e)try{return ae=JSON.parse(e),ae}catch{}return null}function kt(e){ae=e,localStorage.setItem("ov_location",JSON.stringify(e))}function ca(){return new Promise((e,a)=>{if(!navigator.geolocation){a(new Error("Geolocation not supported"));return}navigator.geolocation.getCurrentPosition(t=>{const i={lat:t.coords.latitude,lon:t.coords.longitude};kt(i),e(i)},t=>a(t),{enableHighAccuracy:!1,timeout:1e4})})}const xt=[{value:"general",label:"General"},{value:"travel",label:"Travel"},{value:"finance",label:"Finance"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"relationship",label:"Relationship"},{value:"career",label:"Career"},{value:"spiritual",label:"Spiritual"}];function $t(){const e=N();B(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${xt.map(t=>`<option value="${t.value}">${t.label}</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Kundali (optional — for personalized scoring)</label>
        <select id="kundali-select">
          <option value="">None (generic)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Location</label>
        <div class="location-row">
          <input id="lat" type="number" step="any" placeholder="Lat" />
          <input id="lon" type="number" step="any" placeholder="Lon" />
          <button id="btn-gps" class="btn-small">📍</button>
        </div>
      </div>

      <button id="btn-check" class="btn-primary">Check Now</button>

      <div id="muhurta-result" class="result-box hidden"></div>
      <div id="muhurta-loading" class="hidden"><div class="spinner"></div></div>
    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard"));const a=oa();a&&(document.getElementById("lat").value=String(a.lat),document.getElementById("lon").value=String(a.lon)),document.getElementById("btn-gps").addEventListener("click",async()=>{try{const t=await ca();document.getElementById("lat").value=String(t.lat),document.getElementById("lon").value=String(t.lon),x("Location updated")}catch{x("Could not get location",!0)}}),se().then(t=>{if(t.ok&&Array.isArray(t.data?.kundalis)){const i=document.getElementById("kundali-select");for(const n of t.data.kundalis){const s=document.createElement("option");s.value=String(n.id),s.textContent=n.label,i.appendChild(s)}}}),document.getElementById("btn-check").addEventListener("click",async()=>{const t=Number(document.getElementById("lat").value),i=Number(document.getElementById("lon").value);if(!Number.isFinite(t)||!Number.isFinite(i)){x("Set your location first",!0);return}const n=document.getElementById("purpose").value,s=document.getElementById("kundali-select").value,r=s?Number(s):void 0,o=document.getElementById("muhurta-loading"),d=document.getElementById("muhurta-result");o.classList.remove("hidden"),d.classList.add("hidden");const l=await De(t,i,n,r);if(o.classList.add("hidden"),!l.ok){x(l.data?.error??"Request failed",!0);return}const m=l.data;d.classList.remove("hidden"),d.innerHTML=St(m)})}function St(e){const a=e.score>=70?"score-good":e.score>=40?"score-mid":"score-bad",t=(e.layers??[]).map(n=>`<div class="layer"><strong>${n.name}</strong>: ${n.detail} (${n.impact})</div>`).join(""),i=[];if(e.panchaka?.active&&i.push(`⚠️ Panchaka Dosha: ${e.panchaka.note}`),e.ganda_moola?.active&&i.push(`⚠️ Ganda Moola: ${e.ganda_moola.note}`),e.combustion?.length)for(const n of e.combustion)i.push(`🔥 ${n.planet} combust (${n.angular_distance.toFixed(1)}°)`);return`
    <div class="muhurta-card">
      <div class="score-circle ${a}">${e.score}</div>
      <div class="verdict">${e.verdict??""}</div>
      <div class="hora-info">
        <span>Hora: <strong>${e.hora_lord??"?"}</strong></span>
        <span>Nakshatra: <strong>${e.nakshatra??"?"}</strong></span>
      </div>
      ${e.tara?`<div class="tara">Tara: ${e.tara.name} (#${e.tara.number}) — ${e.tara.beneficence==="benefic"?"✅ Benefic":e.tara.beneficence==="neutral"?"⚖️ Neutral (context-dependent)":"❌ Malefic"}</div>`:""}
      ${e.dishashool?`<div class="dishashool">Dishashool: ${e.dishashool.direction}</div>`:""}
      <div class="layers">${t}</div>
      ${i.length?`<div class="warnings">${i.join("<br/>")}</div>`:""}
      <div class="hora-window">Window: ${Ke(e.hora_start)} – ${Ke(e.hora_end)}</div>
    </div>
  `}function Ke(e){if(!e)return"?";try{return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return e}}async function Et(){const e=N();B(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>My Kundalis</h2>
        <button class="btn btn-small" id="btn-add">+ Add New</button>
      </header>

      <div class="kundali-list">
        <div id="loading" class="text-center" style="padding: var(--space-6);">
          <div class="spinner"></div>
          <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">Loading kundalis...</p>
        </div>
        <div id="list" style="display: none;"></div>
        <div id="empty" style="display: none; text-align: center; padding: var(--space-8);">
          <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
            No kundalis yet
          </p>
          <button class="btn btn-primary" id="btn-add-empty">Create First Kundali</button>
        </div>
      </div>
    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard"));const a=document.getElementById("btn-add"),t=document.getElementById("btn-add-empty");a.addEventListener("click",()=>E("/kundali-form")),t&&t.addEventListener("click",()=>E("/kundali-form"));try{const i=await se(),n=document.getElementById("loading"),s=document.getElementById("list"),r=document.getElementById("empty"),o=i.ok&&Array.isArray(i.data?.kundalis)?i.data.kundalis:[];n.style.display="none",o.length===0?r.style.display="block":(s.style.display="block",It(s,o))}catch(i){console.error("Failed to load kundalis:",i),x("Failed to load kundalis",!0)}}function It(e,a){e.innerHTML=a.map(t=>`
    <div class="kundali-item" data-id="${t.id}">
      <div class="kundali-info">
        <h3>${t.label||"Unnamed Kundali"}</h3>
        <p>
          ${new Date(t.birth_date).toLocaleDateString("en-IN")}
          ${t.birth_time?` at ${t.birth_time}`:""}
        </p>
      </div>
      <div class="kundali-actions">
        <button class="btn btn-secondary btn-small view-btn" data-id="${t.id}">
          View Chart
        </button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${t.id}">
          Delete
        </button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".view-btn").forEach(t=>{t.addEventListener("click",i=>{const n=i.target.dataset.id;n&&E(`/birth-chart?id=${n}`)})}),e.querySelectorAll(".delete-btn").forEach(t=>{t.addEventListener("click",async i=>{i.stopPropagation();const n=i.target.dataset.id,s=e.querySelector(`[data-id="${n}"]`),r=s?.querySelector("h3")?.textContent||"this kundali";if(confirm(`Delete ${r}? This cannot be undone.`))try{const o=await Xe(Number(n));o.ok?(x("Kundali deleted"),s?.remove(),e.querySelectorAll(".kundali-item").length===0&&(e.style.display="none",document.getElementById("empty").style.display="block")):x(o.data?.error??"Failed to delete kundali",!0)}catch(o){console.error("Delete error:",o),x("Error deleting kundali",!0)}})})}function Fe(e,a){const t=new Intl.DateTimeFormat("en-US",{timeZone:a,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(new Date(e)),i=n=>Number(t.find(s=>s.type===n)?.value);return Date.UTC(i("year"),i("month")-1,i("day"),i("hour"),i("minute"),i("second"))}function Tt(e,a){const{year:t,month:i,day:n,hour:s,minute:r}=e,o=Date.UTC(t,i-1,n,s,r,0),d=new Date(o);if(!Number.isInteger(t)||!Number.isInteger(i)||!Number.isInteger(n)||!Number.isInteger(s)||!Number.isInteger(r)||d.getUTCFullYear()!==t||d.getUTCMonth()!==i-1||d.getUTCDate()!==n||s<0||s>23||r<0||r>59)throw new RangeError(`Invalid date/time: ${t}-${i}-${n} ${s}:${r}`);new Intl.DateTimeFormat("en-US",{timeZone:a}).format(0);let l=o-(Fe(o,a)-o);const m=Fe(l,a)-l;return l=o-m,new Date(l)}function Lt(e,a){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e.trim()),i=/^(\d{2}):(\d{2})(?::\d{2})?$/.exec(a.trim());return!t||!i?null:{year:+t[1],month:+t[2],day:+t[3],hour:+i[1],minute:+i[2]}}const Ct=[{value:"Asia/Kolkata",label:"India (IST)"},{value:"Asia/Bangkok",label:"Thailand (ICT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Australia/Sydney",label:"Sydney (AEDT)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"America/New_York",label:"New York (EST/EDT)"},{value:"America/Los_Angeles",label:"Los Angeles (PST/PDT)"},{value:"America/Chicago",label:"Chicago (CST/CDT)"}];async function Pt(){const e=N();B(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>New Kundali</h2>
      </header>

      <form class="muhurta-form" id="form">
        <div class="form-group">
          <label for="name">Name / Label</label>
          <input
            id="name"
            type="text"
            placeholder="e.g., My Chart, Client Name"
            required
          />
        </div>

        <div class="form-group">
          <label for="birth-date">Birth Date</label>
          <input id="birth-date" type="date" required />
        </div>

        <div class="form-group">
          <label for="birth-time">Birth Time (HH:MM)</label>
          <input id="birth-time" type="time" required />
        </div>

        <div class="form-group">
          <label>Place / City</label>
          <div class="location-row">
            <input
              id="place-search"
              type="text"
              placeholder="e.g. Raghogarh, Vidisha, Mendori, Bhopal"
              style="flex: 1;"
            />
            <button type="button" class="btn btn-small" id="btn-search-place">🔍</button>
            <button type="button" class="btn btn-small" id="btn-gps">📍</button>
          </div>
          <div id="place-results" style="display:none; margin-top:4px; background:#fff8ef; border:1px solid #E8C89A; border-radius:6px; max-height:160px; overflow-y:auto;"></div>
          <div id="place-confirmed" style="display:none; margin-top:4px; font-size:0.78rem; color:var(--accent-agni-text);"></div>
        </div>

        <div class="form-group">
          <label>Coordinates <span style="font-size:0.75rem; color:var(--accent-agni-text);">(auto-filled from city search)</span></label>
          <div class="location-row">
            <input
              id="lat"
              type="number"
              step="any"
              placeholder="Latitude"
              min="-90"
              max="90"
              required
            />
            <input
              id="lon"
              type="number"
              step="any"
              placeholder="Longitude"
              min="-180"
              max="180"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" required>
            <option value="">-- Select Timezone --</option>
            ${Ct.map($=>`<option value="${$.value}">${$.label}</option>`).join("")}
          </select>
        </div>

        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
          <button type="button" class="btn btn-secondary" id="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="btn-submit">
            Create Kundali
          </button>
        </div>
      </form>

      <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--error-text);"></div>
    </div>
  `;const a=document.getElementById("form"),t=document.getElementById("name"),i=document.getElementById("birth-date"),n=document.getElementById("birth-time"),s=document.getElementById("lat"),r=document.getElementById("lon"),o=document.getElementById("timezone"),d=document.getElementById("btn-gps"),l=document.getElementById("btn-search-place"),m=document.getElementById("place-search"),u=document.getElementById("place-results"),v=document.getElementById("place-confirmed"),c=document.getElementById("btn-cancel"),p=document.getElementById("error-box"),f=oa();f&&(s.value=String(f.lat),r.value=String(f.lon)),o.value="Asia/Kolkata";async function g(){const $=m.value.trim();if($){l.textContent="⏳",l.setAttribute("disabled","true"),u.style.display="none",u.innerHTML="";try{const h=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent($)}&format=json&limit=10&addressdetails=1&countrycodes=in`,I=await(await fetch(h,{headers:{"Accept-Language":"en,hi"}})).json();if(!I.length){const P=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent($+" India")}&format=json&limit=10&addressdetails=1`,b=await(await fetch(P,{headers:{"Accept-Language":"en,hi"}})).json();if(!b.length){u.innerHTML=`<div style="padding:8px;color:var(--accent-agni-text);font-size:0.82rem;">
            Jagah nahi mili. Try karein:<br>
            • Poora naam likhein (e.g. "Raghogarh Madhya Pradesh")<br>
            • Tehsil ya district add karein (e.g. "Mendori Raisen")<br>
            • Nearest town ka naam try karein
          </div>`,u.style.display="block";return}y(b);return}y(I)}catch{u.innerHTML='<div style="padding:8px;color:#cc0000;font-size:0.82rem;">Search failed. Manually latitude/longitude fill karein.</div>',u.style.display="block"}finally{l.textContent="🔍",l.removeAttribute("disabled")}}}function y($){u.innerHTML=$.map((h,T)=>{const I=h.address||{},P=[],M=I.village||I.hamlet||I.suburb||I.town||I.city||I.municipality||h.display_name.split(",")[0],b=I.county||I.district||I.state_district||"",S=I.state||"";M&&P.push(M.trim()),b&&b!==M&&P.push(b.trim()),S&&P.push(S.trim());const w=P.length>=2?P.join(", "):h.display_name.split(",").slice(0,4).join(", ");return`<div class="place-result-item" data-i="${T}" data-lat="${h.lat}" data-lon="${h.lon}" data-name="${w}"
        style="padding:8px 12px;cursor:pointer;font-size:0.82rem;border-bottom:1px solid #E8C89A;color:#3a1a00;"
        onmouseover="this.style.background='#FFF0DC'" onmouseout="this.style.background=''">${w}</div>`}).join(""),u.style.display="block",u.querySelectorAll(".place-result-item").forEach(h=>{h.addEventListener("click",()=>{const T=parseFloat(h.dataset.lat),I=parseFloat(h.dataset.lon),P=h.dataset.name;s.value=T.toFixed(6),r.value=I.toFixed(6),m.value=P,u.style.display="none",v.textContent=`✓ ${P} (${T.toFixed(4)}°N, ${I.toFixed(4)}°E)`,v.style.display="block"})})}l.addEventListener("click",$=>{$.preventDefault(),g()}),m.addEventListener("keydown",$=>{$.key==="Enter"&&($.preventDefault(),g())}),d.addEventListener("click",async $=>{$.preventDefault();try{const h=await ca();s.value=String(h.lat),r.value=String(h.lon),x("Location updated")}catch{x("Could not get location",!0)}}),c.addEventListener("click",$=>{$.preventDefault(),E("/kundali")}),a.addEventListener("submit",async $=>{$.preventDefault(),p.style.display="none";const h=t.value.trim(),T=i.value,I=n.value,P=parseFloat(s.value),M=parseFloat(r.value),b=o.value;if(!h||!T||!I||!b||isNaN(P)||isNaN(M)){p.textContent="Please fill in all fields",p.style.display="block";return}if(P<-90||P>90){p.textContent="Latitude must be between -90 and 90",p.style.display="block";return}if(M<-180||M>180){p.textContent="Longitude must be between -180 and 180",p.style.display="block";return}const S=document.getElementById("btn-submit");S.disabled=!0,S.textContent="Creating...";try{const w=Lt(T,I);if(!w)throw new RangeError("Invalid date or time format");const A=Tt(w,b).toISOString().split(".")[0]+"Z",z=await Pa({label:h,birth_date:A,latitude:P,longitude:M,timezone:b});if(z.ok)x("Kundali created successfully"),E("/kundali");else{const D=z.data?.error||"Failed to create kundali";p.textContent=D,p.style.display="block",S.disabled=!1,S.textContent="Create Kundali"}}catch(w){console.error("Create error:",w),p.textContent="Error creating kundali",p.style.display="block",S.disabled=!1,S.textContent="Create Kundali"}}),document.getElementById("btn-back").addEventListener("click",()=>E("/kundali"))}const ce={PROCEED:{bg:"rgba(16, 185, 129, 0.1)",border:"var(--color-success, #10B981)",text:"var(--color-success, #10B981)",emoji:"✅",label:"PROCEED"},WAIT:{bg:"rgba(245, 158, 11, 0.1)",border:"var(--color-warning, #F59E0B)",text:"var(--color-warning, #F59E0B)",emoji:"⏳",label:"WAIT"},AVOID:{bg:"rgba(239, 68, 68, 0.1)",border:"var(--color-danger, #EF4444)",text:"var(--color-danger, #EF4444)",emoji:"🚫",label:"AVOID"}};async function At(){const e=N();B(e),e.innerHTML=`
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
  `;const a=document.getElementById("kundali"),t=document.getElementById("tab-ask"),i=document.getElementById("tab-browse"),n=document.getElementById("panel-ask"),s=document.getElementById("panel-browse"),r=document.getElementById("question"),o=document.getElementById("intent-preview"),d=document.getElementById("intent-label"),l=document.getElementById("intent-confidence"),m=document.getElementById("category"),u=document.getElementById("activity"),v=document.getElementById("query-time"),c=document.getElementById("error-box"),p=document.getElementById("result");let f=[];function g(b){b==="ask"?(n.style.display="",s.style.display="none",t.style.background="var(--color-primary)",t.style.color="#fff",i.style.background="var(--color-bg-secondary)",i.style.color="var(--color-text-secondary)"):(n.style.display="none",s.style.display="",t.style.background="var(--color-bg-secondary)",t.style.color="var(--color-text-secondary)",i.style.background="var(--color-primary)",i.style.color="#fff"),c.style.display="none",p.style.display="none"}t.addEventListener("click",()=>g("ask")),i.addEventListener("click",()=>g("browse"));const y=new Date;v.value=y.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"});try{const b=await se(),S=b.ok&&Array.isArray(b.data?.kundalis)?b.data.kundalis:[];if(S.length===0){x("Please create a kundali first",!0),E("/kundali-form");return}a.innerHTML=S.map(w=>`<option value="${w.id}">${w.label||"Unnamed"}</option>`).join("")}catch{x("Failed to load kundalis",!0)}try{const b=await Ma();if(b.ok&&Array.isArray(b.data?.categories)){const S=[];for(const w of b.data.categories){const A=w.category||"Other";if(S.includes(A)||S.push(A),Array.isArray(w.activities))for(const z of w.activities)f.push({category:A,slug:z.slug??z.code??"",label:z.label??z.name??z.slug??"",houses:z.houses??[]})}m.innerHTML='<option value="">— All Categories —</option>'+S.map(w=>`<option value="${w}">${w}</option>`).join(""),$("")}else u.innerHTML='<option value="">— Could not load —</option>'}catch{x("Failed to load activities",!0)}function $(b){const S=b?f.filter(w=>w.category===b):f;u.innerHTML='<option value="">— Select Activity —</option>'+S.map(w=>`<option value="${w.slug}">${w.label} (H${w.houses.join(",")})</option>`).join("")}m.addEventListener("change",()=>$(m.value)),document.getElementById("btn-cancel-ask").addEventListener("click",b=>{b.preventDefault(),E("/dashboard")}),document.getElementById("btn-cancel-browse").addEventListener("click",b=>{b.preventDefault(),E("/dashboard")}),document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard"));let h=null;r.addEventListener("input",()=>{if(h&&clearTimeout(h),r.value.trim().length<3){o.style.display="none";return}h=setTimeout(async()=>{d.textContent="Analyzing…",l.textContent="",o.style.display="block"},400)});function T(b){const S=b.combinedVerdict??"WAIT",w=ce[S]??ce.WAIT,A=b.reasoningHindi??"",z=b.reasoningEnglish??"",D=b.intent??{},L=b.panchang??{},X=b.kp??{};p.innerHTML=`
      <!-- Big verdict box -->
      <div style="border: 2px solid ${w.border}; background: ${w.bg};
           border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;
           margin-bottom: var(--space-4);">
        <div style="font-size: 3rem; margin-bottom: var(--space-2);">${w.emoji}</div>
        <div style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold);
             color: ${w.text}; letter-spacing: 0.05em; margin-bottom: var(--space-3);">
          ${w.label}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);
             margin-bottom: var(--space-4);">
          Activity detected: <strong>${D.label??"—"}</strong>
          ${D.confidence?`<span style="color:${w.text}; margin-left: var(--space-2);">${D.confidence}% match</span>`:""}
        </div>
      </div>

      <!-- Plain Hindi reasoning -->
      <div style="background: var(--color-bg-secondary); border-radius: var(--radius-md);
           padding: var(--space-4); margin-bottom: var(--space-4); font-size: var(--font-size-sm);
           line-height: 1.7;">
        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          🇮🇳 Hindi
        </div>
        <div style="margin-bottom: var(--space-4);">${A}</div>
        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          🇬🇧 English
        </div>
        <div>${z}</div>
      </div>

      <!-- Panchang summary strip -->
      <div style="display:flex; flex-wrap:wrap; gap: var(--space-2); margin-bottom: var(--space-4);">
        ${L.hora?`
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Current Hora</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);">
            ${L.hora.lord}
            <span style="color: ${L.hora.quality==="GOOD"?"var(--color-success,#10B981)":L.hora.quality==="BAD"?"var(--color-danger,#EF4444)":"var(--color-warning,#F59E0B)"};">
              (${L.hora.quality})
            </span>
          </div>
        </div>`:""}

        ${L.rahuKaal?`
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Rahu Kaal</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);
               color: ${L.rahuKaal.active?"var(--color-danger,#EF4444)":"var(--color-success,#10B981)"};">
            ${L.rahuKaal.active?`⚠️ ACTIVE (ends ${L.rahuKaal.endTime??""})`:"✓ Not active"}
          </div>
        </div>`:""}

        ${L.tarabala?`
        <div style="flex:1; min-width:140px; padding: var(--space-3); border-radius: var(--radius-md);
             background: var(--color-bg-secondary); text-align:center;">
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">Tarabala</div>
          <div style="font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm);
               color: ${L.tarabala.isBenefic?"var(--color-success,#10B981)":"var(--color-danger,#EF4444)"};">
            ${L.tarabala.taraName} (${L.tarabala.taraScore})
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
            ${L.tarabala.todayNakshatra}
          </div>
        </div>`:""}
      </div>

      <!-- KP detail (collapsible) -->
      <details style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3);">
        <summary style="cursor:pointer; font-size: var(--font-size-sm);
                  font-weight: var(--font-weight-semibold); padding: var(--space-1) 0;">
          🔬 KP Analysis Details (${X.verdict??"—"})
        </summary>
        <div style="margin-top: var(--space-3); font-size: var(--font-size-xs); line-height: 1.7;
             color: var(--color-text-secondary);">
          <div><strong>Houses analyzed:</strong> ${(X.houses??[]).join(", ")}</div>
          ${(X.houseVerdicts??[]).map(re=>`<div style="margin-top: var(--space-1);">
              House ${re.house}: <strong>${re.verdict}</strong>
              ${re.reasoning?`— ${re.reasoning}`:""}
            </div>`).join("")}
          ${X.ayanamsaCaveat?`<div style="margin-top: var(--space-2); font-style:italic;">${X.ayanamsaCaveat}</div>`:""}
        </div>
      </details>

      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);
           text-align:center; margin-top: var(--space-3);">
        Query: ${new Date(b.queryTime??Date.now()).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}
      </div>
    `,p.style.display="block",p.scrollIntoView({behavior:"smooth",block:"start"})}function I(b){const S=b.houseVerdicts??[],w=S.some(L=>L.verdict==="DENIED"),A=S.every(L=>L.verdict==="PROMISED"),z=w?"AVOID":A?"PROCEED":"WAIT",D=ce[z]??ce.WAIT;p.innerHTML=`
      <div style="border: 2px solid ${D.border}; background: ${D.bg};
           border-radius: var(--radius-lg); padding: var(--space-5); text-align:center;
           margin-bottom: var(--space-4);">
        <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">${D.emoji}</div>
        <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);
             color: ${D.text}; margin-bottom: var(--space-2);">
          KP: ${z}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          Activity: <strong>${b.activitySlug??"—"}</strong>
        </div>
      </div>

      <!-- House verdicts -->
      <div style="margin-bottom: var(--space-4);">
        ${S.map(L=>`
          <div style="padding: var(--space-3); border-radius: var(--radius-md);
               background: var(--color-bg-secondary); margin-bottom: var(--space-2);
               font-size: var(--font-size-sm);">
            <strong>House ${L.house}:</strong>
            <span style="color: ${L.verdict==="PROMISED"?"var(--color-success,#10B981)":L.verdict==="DENIED"?"var(--color-danger,#EF4444)":"var(--color-text-secondary)"};">
              ${L.verdict}
            </span>
            ${L.reasoning?`<div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">${L.reasoning}</div>`:""}
          </div>
        `).join("")}
      </div>

      ${b.ayanamsaCaveat?`
      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);
           font-style: italic; text-align:center; margin-top: var(--space-2);">
        ${b.ayanamsaCaveat}
      </div>`:""}
    `,p.style.display="block",p.scrollIntoView({behavior:"smooth",block:"start"})}document.getElementById("form-ask").addEventListener("submit",async b=>{b.preventDefault(),c.style.display="none",p.style.display="none";const S=parseInt(a.value),w=r.value.trim();if(!S){c.textContent="Please select a kundali.",c.style.display="block";return}if(!w||w.length<3){c.textContent="Please enter your question (minimum 3 characters).",c.style.display="block";return}const A=document.getElementById("btn-ask");A.disabled=!0,A.textContent="⏳ Analyzing…",o.style.display="none";try{const z=await Na(S,w);if(z.ok)T(z.data);else{const D=z.data?.code??"";let L=z.data?.error??"Failed to process your query.";D==="INTENT_UNRECOGNIZED"?L="❓ "+L+`

Try: interview, client milna, shaadi, doctor, court, property, exam, flight, visa, puja, etc.`:D==="INSUFFICIENT_BALANCE"&&(L="⚠️ Wallet balance insufficient. Please recharge to continue."),c.style.whiteSpace="pre-line",c.textContent=L,c.style.display="block"}}catch{c.textContent="Network error. Please try again.",c.style.display="block"}finally{A.disabled=!1,A.textContent="🔍 Get KP Verdict"}}),document.getElementById("form-browse").addEventListener("submit",async b=>{b.preventDefault(),c.style.display="none",p.style.display="none";const S=parseInt(a.value),w=u.value;if(!S||!w){c.textContent="Please select both kundali and activity.",c.style.display="block";return}const A=document.getElementById("btn-browse");A.disabled=!0,A.textContent="Checking…";try{const z=await za(S,w);z.ok?I(z.data):(c.textContent=z.data?.error??"Failed to query KP.",c.style.display="block")}catch{c.textContent="Network error. Please try again.",c.style.display="block"}finally{A.disabled=!1,A.textContent="Check Now"}})}const je=[{id:"activate",label:"Activate"},{id:"messages",label:"Messages"},{id:"reviews",label:"Reviews"},{id:"settings",label:"Settings"},{id:"overview",label:"Overview"}],zt={"muhurta-property":"Muhurta — Property","muhurta-marriage":"Muhurta — Marriage","muhurta-business":"Muhurta — Business","muhurta-medical":"Muhurta — Medical",kundali:"Birth Chart / KP",numerology:"Numerology",vastu:"Vastu",subscription:"Subscription / Billing",b2b:"B2B / Corporate",other:"Other"};function ge(e){if(!e)return"—";const a=new Date(e.includes("T")?e:e.replace(" ","T")+"Z");return isNaN(a.getTime())?k(e):a.toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}async function Mt(){const e=N();B(e);const a=new URLSearchParams(window.location.hash.split("?")[1]??"").get("tab")||"activate",t=je.some(i=>i.id===a)?a:"activate";e.innerHTML=`
    <div class="screen admin-screen">
      <div class="admin-sticky">
        <header class="screen-header">
          <button class="btn-back" id="btn-back" aria-label="Back to dashboard">←</button>
          <h2>Admin Panel</h2>
        </header>
        <nav class="admin-tabs" role="tablist" aria-label="Admin sections">
          ${je.map(i=>`
            <button class="admin-tab" role="tab" id="tab-${i.id}" data-tab="${i.id}"
                    aria-selected="${i.id===t}" aria-controls="admin-body">${i.label}</button>`).join("")}
        </nav>
      </div>
      <div class="admin-body" id="admin-body" role="tabpanel"></div>
    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard")),document.querySelectorAll(".admin-tab").forEach(i=>i.addEventListener("click",()=>Ve(i.dataset.tab))),Ve(t)}function Ve(e){document.querySelectorAll(".admin-tab").forEach(i=>i.setAttribute("aria-selected",String(i.dataset.tab===e)));const a=document.getElementById("admin-body");a.setAttribute("aria-labelledby",`tab-${e}`),a.innerHTML='<p class="admin-muted">Loading…</p>',window.scrollTo({top:0});const t={activate:Nt,messages:Ae,reviews:ze,settings:Bt,overview:Dt}[e];t(a)}function H(e){return e.status===403?"This account does not have admin access.":e.data?.error??`Request failed (${e.status}).`}async function Nt(e){e.innerHTML=`
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
  `,document.getElementById("lookup-form").addEventListener("submit",async r=>{r.preventDefault();const o=document.getElementById("lk-phone").value.replace(/\D/g,""),d=document.getElementById("lookup-result");if(!/^[6-9]\d{9}$/.test(o)){d.innerHTML='<p class="admin-error">Enter a valid 10-digit number.</p>';return}d.innerHTML='<p class="admin-muted">Searching…</p>';const l=await Wa(o);if(!l.ok){d.innerHTML=`<p class="admin-error">${k(H(l))}</p>`;return}d.innerHTML=l.data.found?Ue(l.data):`<p>No account for +91 ${k(o)} yet. Use the form below to create and activate it.</p>`,document.getElementById("act-phone").value=o});const t=document.getElementById("act-form"),i=document.getElementById("act-confirm"),n=document.getElementById("act-submit");let s=null;t.addEventListener("input",()=>{s=null,i.hidden=!0,n.textContent="Review & activate"}),t.addEventListener("submit",async r=>{r.preventDefault();const o=y=>document.getElementById(y).value.trim(),d=o("act-phone").replace(/\D/g,""),l=o("act-tier"),m=o("act-points"),u=o("act-days"),v=m?Number(m):0,c=u?Number(u):365,p=[];if(/^[6-9]\d{9}$/.test(d)||p.push("Enter a valid 10-digit mobile number."),m&&(!Number.isInteger(v)||v<1||v>1e5)&&p.push("Points must be a whole number from 1 to 100000."),v&&(!Number.isInteger(c)||c<1||c>730)&&p.push("Validity must be 1–730 days."),!l&&!v&&p.push("Choose a plan, points, or both."),p.length){i.hidden=!1,i.innerHTML=p.map(y=>`<p class="admin-error">${k(y)}</p>`).join("");return}const f={phone:d,tier:l||void 0,points:v||void 0,validity_days:v?c:void 0,source:o("act-source"),note:o("act-note")};if(!s){s=f;const y=new Date(Date.now()+c*864e5).toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric"});i.hidden=!1,i.innerHTML=`
        <p><strong>Please confirm:</strong> +91 ${k(d)}</p>
        <ul>
          ${l?`<li>Plan → <strong>${k(l)}</strong></li>`:""}
          ${v?`<li>Credit <strong>${v}</strong> points, valid until about <strong>${k(y)}</strong></li>`:""}
        </ul>`,n.textContent="Confirm activation";return}n.disabled=!0,n.textContent="Activating…";const g=await Ga(s);if(n.disabled=!1,s=null,n.textContent="Review & activate",!g.ok){i.innerHTML=`<p class="admin-error">${k(H(g))}</p>`;return}i.innerHTML=`<p class="admin-ok">Done.</p>${Ue(g.data)}`,x("Activation saved"),document.getElementById("act-points").value="",document.getElementById("act-note").value=""})}function Ue(e){const a=e.user??{},t=e.batches??[];return`
    <div class="admin-user">
      <p><strong>${k(a.phone_number)}</strong> · Plan: <strong>${k(a.tier)}</strong>
         ${a.is_admin?" · admin":""}${a.is_active===0?' · <span class="admin-error">deactivated</span>':""}</p>
      <p>Spendable balance: <strong>${Number(e.balance??0)}</strong> points</p>
      <p class="admin-muted">Account created ${ge(a.created_at)}</p>
      ${t.length?`
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Source</th><th>Granted</th><th>Left</th><th>Expires</th><th>Status</th></tr></thead>
            <tbody>${t.map(i=>`
              <tr><td>${k(i.source)}</td><td>${Number(i.amount_granted)}</td><td>${Number(i.amount_remaining)}</td>
                  <td>${ge(i.expires_at)}</td><td>${k(i.status)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>`:'<p class="admin-muted">No points credited yet.</p>'}
    </div>`}async function Ae(e,a="new"){const t=await Oa(a);if(!t.ok){e.innerHTML=`<p class="admin-error">${k(H(t))}</p>`;return}const i=t.data.messages??[];e.innerHTML=`
    <div class="admin-row">
      <label for="msg-filter">Show</label>
      <select id="msg-filter">
        ${["new","contacted","closed","spam","all"].map(n=>`<option value="${n}" ${n===a?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
    ${i.length?i.map(n=>`
      <article class="card admin-card" data-id="${Number(n.id)}">
        <p><strong>${k(n.name)}</strong> · <a href="tel:+91${k(n.phone)}">+91 ${k(n.phone)}</a>
           · <a href="https://wa.me/91${k(n.phone)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
        <p class="admin-muted">${k(zt[n.topic]??n.topic)} · ${ge(n.created_at)} · ${k(n.status)}</p>
        ${n.message?`<p class="admin-message">${k(n.message)}</p>`:""}
        <div class="admin-actions">
          ${["contacted","closed","spam"].filter(s=>s!==n.status).map(s=>`<button class="btn-secondary" data-act="${s}">Mark ${s}</button>`).join("")}
        </div>
      </article>`).join(""):`<p class="admin-muted">No ${k(a)} messages.</p>`}
  `,document.getElementById("msg-filter").addEventListener("change",n=>Ae(e,n.target.value)),e.querySelectorAll("[data-act]").forEach(n=>n.addEventListener("click",async()=>{const s=Number(n.closest("[data-id]").dataset.id);n.disabled=!0;const r=await Ka(s,n.dataset.act);if(!r.ok){x(H(r),!0),n.disabled=!1;return}x(`Marked ${n.dataset.act}`),Ae(e,a)}))}async function ze(e,a="pending"){const t=await Fa(a);if(!t.ok){e.innerHTML=`<p class="admin-error">${k(H(t))}</p>`;return}const i=t.data.testimonials??[];e.innerHTML=`
    <div class="admin-row">
      <label for="rev-filter">Show</label>
      <select id="rev-filter">
        ${["pending","approved","rejected","all"].map(n=>`<option value="${n}" ${n===a?"selected":""}>${n}</option>`).join("")}
      </select>
    </div>
    <p class="admin-muted">Approved reviews appear on the website as first name + surname initial and city. Phone numbers are never shown publicly.</p>
    ${i.length?i.map(n=>`
      <article class="card admin-card" data-id="${Number(n.id)}">
        <p><strong>${k(n.name)}</strong>${n.city?` · ${k(n.city)}`:""} · ${k(ia[n.service]??n.service)}
           ${n.rating?` · ${"★".repeat(Number(n.rating))}`:""}</p>
        <p class="admin-muted">+91 ${k(n.phone)} · submitted ${ge(n.created_at)} · ${k(n.status)}</p>
        <blockquote class="admin-message">${k(n.quote)}</blockquote>
        <div class="admin-actions">
          ${n.status!=="approved"?'<button class="btn-primary" data-act="approved">Approve</button>':""}
          ${n.status!=="rejected"?'<button class="btn-secondary" data-act="rejected">Reject</button>':""}
        </div>
      </article>`).join(""):`<p class="admin-muted">No ${k(a)} reviews.</p>`}
  `,document.getElementById("rev-filter").addEventListener("change",n=>ze(e,n.target.value)),e.querySelectorAll("[data-act]").forEach(n=>n.addEventListener("click",async()=>{const s=Number(n.closest("[data-id]").dataset.id);n.disabled=!0;const r=await ja(s,n.dataset.act);if(!r.ok){x(H(r),!0),n.disabled=!1;return}x(n.dataset.act==="approved"?"Review published":"Review rejected"),ze(e,a)}))}async function Bt(e){const a=await Va();if(!a.ok){e.innerHTML=`<p class="admin-error">${k(H(a))}</p>`;return}const t=a.data.settings??{},i=n=>String(n??"").replace(/^91/,"");e.innerHTML=`
    <section class="card admin-card">
      <h3>Website contact details</h3>
      <p class="admin-muted">Changes apply to the website immediately. Use this to switch to the business WhatsApp number later.</p>
      <form id="settings-form" class="admin-form" novalidate>
        <label for="st-wa">WhatsApp number (click-to-chat)</label>
        <div class="pub-form-phone-row"><span class="pub-form-phone-prefix">+91</span>
          <input id="st-wa" type="tel" inputmode="numeric" maxlength="10" value="${k(i(t.whatsapp_number))}" /></div>
        <label for="st-phone">Phone number shown on website</label>
        <div class="pub-form-phone-row"><span class="pub-form-phone-prefix">+91</span>
          <input id="st-phone" type="tel" inputmode="numeric" maxlength="10" value="${k(i(t.contact_phone))}" /></div>
        <label for="st-email">Email shown on website</label>
        <input id="st-email" type="email" maxlength="120" value="${k(t.contact_email)}" />
        <p id="st-status" role="status" aria-live="polite"></p>
        <button class="btn-primary" type="submit">Save</button>
      </form>
    </section>`,document.getElementById("settings-form").addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("st-status"),r={},o=document.getElementById("st-wa").value.replace(/\D/g,""),d=document.getElementById("st-phone").value.replace(/\D/g,""),l=document.getElementById("st-email").value.trim();if(o!==i(t.whatsapp_number)&&(r.whatsapp_number=o),d!==i(t.contact_phone)&&(r.contact_phone=d),l!==t.contact_email&&(r.contact_email=l),!Object.keys(r).length){s.textContent="Nothing changed.";return}const m=await Ua(r);if(!m.ok){s.innerHTML=`<span class="admin-error">${k(H(m))}</span>`;return}Qa(),s.innerHTML=`<span class="admin-ok">Saved. WhatsApp: ${k(ta(m.data.settings.whatsapp_number))}</span>`,Object.assign(t,m.data.settings)})}async function Dt(e){const a=await Ya();if(!a.ok){e.innerHTML=`<p class="admin-error">${k(H(a))}</p>`;return}const t=a.data??{};e.innerHTML=`
    <div class="result-grid">
      <div class="result-item"><div class="result-item-label">Queries (24h)</div><div class="result-item-value">${Number(t.queries_24h||0)}</div></div>
      <div class="result-item"><div class="result-item-label">Active users</div><div class="result-item-value">${Number(t.active_users||0)}</div></div>
      <div class="result-item"><div class="result-item-label">Revenue (est.)</div><div class="result-item-value">₹${Number(t.revenue_estimate||0).toLocaleString("en-IN")}</div></div>
      <div class="result-item"><div class="result-item-label">Conversion</div><div class="result-item-value">${Number(t.conversion_rate||0).toFixed(1)}%</div></div>
    </div>
    <section class="card admin-card">
      <h3>Top activities (24h)</h3>
      ${(t.top_activities??[]).length?t.top_activities.map(i=>`<p><strong>${k(i.name)}</strong>: ${Number(i.count)} queries</p>`).join(""):'<p class="admin-muted">No queries in the last 24 hours.</p>'}
    </section>`}const _t=[{value:"travel",label:"Travel"},{value:"marriage",label:"Marriage"},{value:"business",label:"Business"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"general",label:"General"}];async function qt(){const e=N();B(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Scanner</h2>
      </header>

      <div class="muhurta-form">
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          ℹ️ Find auspicious dates for your activity across a date range
        </div>

        <form id="form">
          <div class="form-group">
            <label for="kundali">Select Kundali *</label>
            <select id="kundali" required>
              <option value="">-- Loading kundalis --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Activity Category *</label>
            <select id="category" required>
              <option value="">-- Select category --</option>
              ${_t.map(c=>`<option value="${c.value}">${c.label}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="from-date">Start Date *</label>
            <input id="from-date" type="date" required />
          </div>

          <div class="form-group">
            <label for="to-date">End Date *</label>
            <input id="to-date" type="date" required />
          </div>

          <div class="form-group">
            <label for="top-n">Top N Results (optional)</label>
            <input id="top-n" type="number" min="1" max="20" value="5" placeholder="5" />
          </div>

          <div class="form-group">
            <label for="location">Location (auto-filled from kundali)</label>
            <input id="location" type="text" disabled style="background-color: var(--color-bg-secondary);" />
          </div>

          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
            <button type="button" class="btn btn-secondary" id="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit">
              Scan Dates
            </button>
          </div>
        </form>

        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--error-text);"></div>

        <div id="results" style="display: none; margin-top: var(--space-6);"></div>
      </div>
    </div>
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),i=document.getElementById("category"),n=document.getElementById("from-date"),s=document.getElementById("to-date"),r=document.getElementById("top-n"),o=document.getElementById("location"),d=document.getElementById("btn-cancel"),l=document.getElementById("error-box"),m=document.getElementById("results"),u=new Date,v=new Date(u);v.setDate(v.getDate()+30),n.value=u.toISOString().split("T")[0],s.value=v.toISOString().split("T")[0];try{const c=await se(),p=c.ok&&Array.isArray(c.data?.kundalis)?c.data.kundalis:[];if(p.length===0){x("Please create a kundali first",!0),E("/kundali-form");return}t.innerHTML=p.map(f=>`<option value="${f.id}" data-lat="${f.latitude}" data-lon="${f.longitude}">${f.label||"Unnamed"}</option>`).join(""),t.addEventListener("change",()=>{const f=t.options[t.selectedIndex],g=f.getAttribute("data-lat"),y=f.getAttribute("data-lon");o.value=g&&y?`${g}, ${y}`:""}),t.dispatchEvent(new Event("change"))}catch(c){console.error("Failed to load kundalis:",c),x("Failed to load kundalis",!0)}d.addEventListener("click",c=>{c.preventDefault(),E("/dashboard")}),a.addEventListener("submit",async c=>{c.preventDefault(),l.style.display="none",m.style.display="none";const p=parseInt(t.value),f=i.value,g=n.value,y=s.value,$=parseInt(r.value)||5;if(!p||!f||!g||!y){l.textContent="Please fill all required fields",l.style.display="block";return}if(new Date(g)>new Date(y)){l.textContent="Start date must be before end date",l.style.display="block";return}const h=document.getElementById("btn-submit");h.disabled=!0,h.textContent="Scanning...";try{const T=t.options[t.selectedIndex],I=parseFloat(T.getAttribute("data-lat")||"0"),P=parseFloat(T.getAttribute("data-lon")||"0"),M=await ea({lat:I,lon:P,purpose:f,kundali_id:p,from:g,to:y,top_n:$});if(M.ok){const S=M.data.results||[];S.length===0?m.innerHTML=`
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `:m.innerHTML=`
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${S.length} Auspicious Dates</h3>
              ${S.map((w,A)=>`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${w.muhurta_pct>70?"#10b981":"#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${A+1}: ${new Date(w.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${w.muhurta_pct>70?"#d1fae5":"#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${w.muhurta_pct>70?"#047857":"#92400e"}; font-weight: bold;">
                      ${w.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${w.best_time||"All day auspicious"}
                  </p>
                </div>
              `).join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `,m.style.display="block"}else{const b=M.data?.error||"Failed to scan dates";l.textContent=b,l.style.display="block"}}catch(T){console.error("Scan error:",T),l.textContent="Error scanning dates",l.style.display="block"}finally{h.disabled=!1,h.textContent="Scan Dates"}}),document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard"))}async function Ht(){const e=N();B(e),e.innerHTML=`
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
        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--error-text);"></div>
      </div>
    </div>
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-refresh"),i=document.getElementById("btn-topup"),n=document.getElementById("balance-amount"),s=document.getElementById("batches-section"),r=document.getElementById("batches-list"),o=document.getElementById("transactions-list"),d=document.getElementById("no-transactions"),l=document.getElementById("error-box");async function m(){l.style.display="none",n.textContent="Loading...",t.disabled=!0,i.disabled=!0;try{const v=await Ba();if(v.ok){const c=v.data;n.textContent=String(c.total_points??0);const p=Array.isArray(c.batches)?c.batches:[];p.length>0?(s.style.display="block",r.innerHTML=p.map(g=>{const y=new Date(g.expires_at),$=new Date,h=Math.ceil((y.getTime()-$.getTime())/(24*60*60*1e3)),T=h<=7,I=g.status==="active"?"Active":g.status==="held"?"Held":"Expired";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${T?"#ef4444":"#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${g.source==="free_trial"?"Free Trial":g.source==="subscription"?"Subscription":g.source==="referral"?"Referral":"Top-up"}</strong>
                    <span style="background: ${g.status==="active"?"#d1fae5":g.status==="held"?"#fef3c7":"#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${g.status==="active"?"#064E3B":g.status==="held"?"#78350F":"#374151"}; font-weight: bold;">
                      ${I}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${g.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${y.toLocaleDateString("en-IN")}
                      ${T&&g.status==="active"?` (${h}d left)`:""}
                    </span>
                  </div>
                </div>
              `}).join("")):s.style.display="none";const f=Array.isArray(c.transactions)?c.transactions:[];f.length>0?(d.style.display="none",o.innerHTML=f.slice(0,10).map(g=>{const y=new Date(g.created_at),$=g.type==="debit"?"-":"+",h=g.type==="debit"?"#dc2626":"#10b981",T=g.description||(g.type==="debit"?"Query":"Credit");return`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${h};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${T}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${y.toLocaleDateString("en-IN")} ${y.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${h};">
                      ${$}${g.amount}
                    </div>
                  </div>
                </div>
              `}).join("")):(d.style.display="block",o.innerHTML="")}else{const c=v.data?.error||"Failed to load wallet";l.textContent=c,l.style.display="block",n.textContent="Error"}}catch(v){console.error("Wallet load error:",v),l.textContent="Error loading wallet",l.style.display="block",n.textContent="Error"}finally{t.disabled=!1,i.disabled=!1}}a.addEventListener("click",()=>E("/dashboard")),t.addEventListener("click",m),i.addEventListener("click",async()=>{const v=await u();if(v){i.disabled=!0,x("Initiating payment...",!1);try{const c=await Da(v);if(c.ok&&c.data){const{razorpay_order_id:p,key_id:f,points_on_success:g,amount_paise:y}=c.data;typeof window.Razorpay>"u"&&(x("Loading payment gateway...",!1),await new Promise(I=>{const P=document.createElement("script");P.src="https://checkout.razorpay.com/v1/checkout.js",P.onload=I,document.head.appendChild(P)}));const $=window.Razorpay,h={key:f,order_id:p,amount:y,currency:"INR",name:"OccultViision Kaalchakra Pro",description:`Top up wallet with ${g} points`,handler:async I=>{x("Payment successful! Points will be credited shortly.",!0),m()},prefill:{},theme:{color:"#3399cc"}};new $(h).open()}else{const p=c.data?.error||"Failed to initiate payment";x(p,!1)}}catch(c){console.error("Topup error:",c),x("Error initiating payment. Please try again.",!1)}finally{i.disabled=!1}}});async function u(){const v=prompt(`Enter amount to top up (₹):

Min: ₹1, Max: ₹5000

Popular amounts: 100, 500, 1000, 2000, 5000`,"500");if(!v)return null;const c=Number(v);return isNaN(c)||c<1||c>5e3?(x("Invalid amount. Please enter ₹1 to ₹5000.",!1),null):c*100}m()}async function Rt(){const e=N();B(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-copy"),i=document.getElementById("btn-share"),n=document.getElementById("btn-copy-message"),s=document.getElementById("referral-code"),r=document.getElementById("total-earned"),o=document.getElementById("referral-count"),d=document.getElementById("referred-users"),l=document.getElementById("no-referrals"),m=document.getElementById("error-box");let u="";async function v(){m.style.display="none";try{const c=await _a();if(c.ok){const p=c.data;u=p.code||"";const f=p.stats||{},g=Array.isArray(p.referred_users)?p.referred_users:[];s.textContent=u||"LOADING...",r.textContent=`₹${f.total_earned??0}`,o.textContent=String(f.referral_count??0),g.length>0?(l.style.display="none",d.innerHTML=g.map(y=>{const $=y.commission_activated_at?new Date(y.commission_activated_at):null,h=y.commission_status==="active"?"Activated":y.commission_status==="held"?"Held":"Pending",T=y.commission_status==="active"?"#10b981":y.commission_status==="held"?"#f59e0b":"#6b7280";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${T};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${y.phone||"Anonymous"}</strong>
                    <span style="background: ${T}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${T}; font-weight: bold;">
                      ${h}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${y.commission_amount||0}</span>
                    <span>${y.referred_at?new Date(y.referred_at).toLocaleDateString("en-IN"):"—"}</span>
                  </div>
                  ${$?`
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${$.toLocaleDateString("en-IN")}
                    </div>
                  `:""}
                </div>
              `}).join("")):(l.style.display="block",d.innerHTML="")}else{const p=c.data?.error||"Failed to load referral data";m.textContent=p,m.style.display="block"}}catch(c){console.error("Referral load error:",c),m.textContent="Error loading referral data",m.style.display="block"}}a.addEventListener("click",()=>E("/dashboard")),t.addEventListener("click",async()=>{if(!u){x("Code not available",!0);return}try{await navigator.clipboard.writeText(u),x("Referral code copied!",!1)}catch{x("Failed to copy code",!0)}}),n.addEventListener("click",async()=>{const c=`Join me on OccultViision! Use my referral code: ${u}

https://www.occultviision.com`;try{await navigator.clipboard.writeText(c),x("Share message copied!",!1)}catch{x("Failed to copy message",!0)}}),i.addEventListener("click",()=>{const c=`Join me on OccultViision! Use my referral code: ${u}

https://www.occultviision.com`,p=`https://wa.me/?text=${encodeURIComponent(c)}`;window.open(p,"_blank")}),v()}const Ot=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],la=["Ar","Ta","Ge","Ca","Le","Vi","Li","Sc","Sa","Cp","Aq","Pi"],_e={Sun:"Su",Moon:"Mo",Mars:"Ma",Mercury:"Me",Jupiter:"Ju",Venus:"Ve",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke"},fe=e=>`var(--pc-${String(e).toLowerCase()}, var(--pc-moon))`,Kt=["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima","Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya"],Ft=["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarman","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"],jt=["Ravivar","Somavar","Mangalvar","Budhavar","Guruvar","Shukravar","Shanivar"],Vt=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];function le(e){const a=Math.floor(e),t=(e-a)*60,i=Math.floor(t),n=Math.round((t-i)*60);return`${a}°${i.toString().padStart(2,"0")}'${n.toString().padStart(2,"0")}"`}function de(e){try{return new Date(e).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}catch{return e}}function We(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return e}}function Te(e){return`${e.starLord} → ${e.subLord} → ${e.subSubLord}`}function Ut(e,a,t,i){const s=new Date(e).getUTCDay(),r=jt[s],o=Vt[s],d=(t-a+360)%360,l=Math.floor(d/12)+1,m=l<=15?"Shukla Paksha":"Krishna Paksha",u=Kt[l-1]??`Tithi ${l}`,v=(a+t)%360,c=Math.floor(v/(360/27)),p=Ft[c]??`Yoga ${c+1}`;return{vara:r,varaLord:o,tithi:u,paksha:m,tithiNum:l,yoga:p,yogaNum:c+1,nakshatra:i.name,nakshatraLord:i.lord}}function Wt(e,a){const t=Array.from({length:13},()=>[]);a.forEach(s=>{const r=s.house;if(r>=1&&r<=12){const o=fe(s.planet);t[r].push(`<span style="color:${o}">${_e[s.planet]??s.planet}</span>`)}});const i=s=>{const r=(e+s-1)%12;return la[r]},n=(s,r="")=>{const o=i(s),d=t[s];return`<div class="ni-cell ni-h${s} ${r}">
      <div class="ni-house-num">${s}</div>
      <div class="ni-rashi">${o}${s===1?' <span class="ni-asc">La</span>':""}</div>
      <div class="ni-planets">${d.join(" ")}</div>
    </div>`};return`
    <div class="ni-chart">
      ${n(12)}${n(1)}${n(2)}${n(3)}
      ${n(11)}
      <div class="ni-center">
        <div class="ni-center-text">KUNDALI</div>
        <div class="ni-center-sub">${Ot[e]} Lagna</div>
      </div>
      ${n(4)}
      ${n(10)}
      <div class="ni-center-spacer"></div>
      <div class="ni-center-spacer"></div>
      ${n(5)}
      ${n(9)}${n(8)}${n(7)}${n(6)}
    </div>`}function Gt(e,a){const t=Array.from({length:12},()=>[]);a.forEach(s=>{const r=s.rashi??0;if(r>=0&&r<12){const o=fe(s.planet);t[r].push(`<span style="color:${o}">${_e[s.planet]??s.planet}</span>`)}});const i=s=>(s-e+12)%12+1,n=s=>{const r=s===e,o=i(s),d=t[s];return`<div class="si-cell si-r${s} ${r?"si-asc":""}">
      <div class="si-rashi-name">${la[s]}${r?' <span class="si-la">La</span>':""}</div>
      <div class="si-house-num">${o}</div>
      <div class="si-planets">${d.join(" ")}</div>
    </div>`};return`
    <div class="si-chart">
      ${n(11)}${n(0)}${n(1)}${n(2)}
      ${n(10)}
      <div class="si-center"><div class="si-center-text">KUNDALI</div></div>
      ${n(3)}
      ${n(9)}
      <div class="si-center-sp"></div><div class="si-center-sp"></div>
      ${n(4)}
      ${n(8)}${n(7)}${n(6)}${n(5)}
    </div>`}async function Yt(e){const a=N();B(a);let t=e;if(!t){const b=window.location.hash,S=b.includes("?")?b.split("?")[1]:"",A=new URLSearchParams(S).get("id");t=A?parseInt(A,10):void 0}if(!t||isNaN(t)){a.innerHTML=`<div class="screen"><header class="screen-header">
      <button class="btn-back" id="btn-back">←</button><h2>Birth Chart</h2></header>
      <div style="padding:2rem;text-align:center;color:var(--error-text)">
        No kundali selected.<br><br>
        <button class="btn btn-primary" id="btn-list">Go to My Kundalis</button>
      </div></div>`,document.getElementById("btn-back").addEventListener("click",()=>E("/kundali")),document.getElementById("btn-list").addEventListener("click",()=>E("/kundali"));return}a.innerHTML=`<div class="screen ti-screen"><header class="ti-header">
    <div class="ti-brand"><span class="ti-brand-name">OCCULTVIISION</span></div>
    <button class="ti-logout" id="btn-back">← Back</button>
  </header>
  <div style="padding:2rem;text-align:center"><div class="spinner"></div>
  <p style="margin-top:1rem;color:var(--accent-akash-text)">Computing birth chart…</p></div></div>`,document.getElementById("btn-back").addEventListener("click",()=>E("/kundali"));const i=await $e(t);if(!i.ok){a.innerHTML+=`<div style="padding:2rem;color:#f87171">Failed to load chart (${i.status}).<br>${i.data?.error??""}</div>`;return}const{kundali:n,chart:s,meta:r}=i.data,o=new Date(n.birth_date).getUTCFullYear(),d=new Date().getUTCFullYear(),l=o>=d-1,m=s.planets.find(b=>b.planet==="Sun"),u=s.planets.find(b=>b.planet==="Moon"),v=m&&u?Ut(n.birth_date,m.deg,u.deg,s.janmaNakshatra):null,c=s.ascendant,{dasha:p,tara:f,janmaNakshatra:g}=s,y=Wt(c.rashi,s.planets),$=Gt(c.rashi,s.planets);a.innerHTML=`
    <div class="screen kc-screen">

      <!-- Header -->
      <header class="kc-header">
        <button class="kc-back" id="btn-back" title="Go back">←</button>
        <div class="kc-title">
          <span class="kc-name">${n.label??"Kundali #"+n.id}</span>
          <span class="kc-sub" data-i18n="nav.kundali">Birth Chart</span>
        </div>
        <button class="kc-delete" id="btn-delete" title="Delete chart">🗑</button>
      </header>

      ${l?`
      <div class="kc-warning">
        ⚠️ Birth year shows <strong>${o}</strong> — looks like today's date was used by mistake.
        <button class="kc-warn-btn" id="btn-delete-warn">Delete & Re-enter →</button>
      </div>`:""}

      <!-- Birth Details -->
      <div class="kc-birth-banner">
        <div class="kc-birth-row">
          <span class="kc-birth-label">Birth</span>
          <span class="kc-birth-val">${We(n.birth_date)}</span>
        </div>
        <div class="kc-birth-row">
          <span class="kc-birth-label">Place</span>
          <span class="kc-birth-val">${n.latitude.toFixed(4)}°N, ${n.longitude.toFixed(4)}°E</span>
        </div>
        <div class="kc-birth-row">
          <span class="kc-birth-label">Ayanamsa</span>
          <span class="kc-birth-val">${s.ayanamsa} ${le(s.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- Chart Toggle -->
      <div class="kc-chart-toggle">
        <button class="kc-toggle active" id="btn-ni" data-i18n="chart.northIndian">North Indian</button>
        <button class="kc-toggle" id="btn-si" data-i18n="chart.southIndian">South Indian</button>
      </div>

      <!-- North Indian Chart -->
      <div class="kc-chart-wrap" id="ni-wrap">
        ${y}
      </div>

      <!-- South Indian Chart -->
      <div class="kc-chart-wrap" id="si-wrap" style="display:none">
        ${$}
      </div>

      <!-- Chart Legend -->
      <div class="kc-legend">
        ${Object.entries(_e).map(([b,S])=>`<span class="kc-leg-item" style="color:${fe(b)}">${S}=${b}</span>`).join("")}
      </div>

      <!-- Panchang at Birth -->
      ${v?`
      <section class="kc-section">
        <div class="kc-section-title">PANCHANG AT BIRTH</div>
        <div class="kc-panchang-grid">
          <div class="kc-panch-item">
            <div class="kc-panch-label">Vara (Weekday)</div>
            <div class="kc-panch-val">${v.vara}</div>
            <div class="kc-panch-sub">Lord: ${v.varaLord}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Tithi</div>
            <div class="kc-panch-val">${v.tithi}</div>
            <div class="kc-panch-sub">${v.paksha} · #${v.tithiNum}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Nakshatra</div>
            <div class="kc-panch-val">${v.nakshatra}</div>
            <div class="kc-panch-sub">Lord: ${v.nakshatraLord}</div>
          </div>
          <div class="kc-panch-item">
            <div class="kc-panch-label">Yoga</div>
            <div class="kc-panch-val">${v.yoga}</div>
            <div class="kc-panch-sub">#${v.yogaNum} of 27</div>
          </div>
        </div>
      </section>`:""}

      <!-- Ascendant -->
      <section class="kc-section">
        <div class="kc-section-title">ASCENDANT (LAGNA)</div>
        <div class="kc-asc-card">
          <div class="kc-asc-sign">${c.rashiName}</div>
          <div class="kc-asc-deg">${le(c.deg)}</div>
          <div class="kc-asc-nak">${c.nakName} Pada ${c.nakPada} · Lord ${c.nakLord}</div>
          <div class="kc-kp">KP: ${Te(c.kp)}</div>
        </div>
      </section>

      <!-- Current Dasha -->
      ${p?`
      <section class="kc-section">
        <div class="kc-section-title">VIMSHOTTARI DASHA (CURRENT)</div>
        <div class="kc-dasha-row">
          <div class="kc-dasha-item kc-maha">
            <div class="kc-dasha-planet">${p.maha.lord}</div>
            <div class="kc-dasha-type">Maha Dasha</div>
            <div class="kc-dasha-dates">${de(p.maha.start)} – ${de(p.maha.end)}</div>
          </div>
          <div class="kc-dasha-arrow">›</div>
          <div class="kc-dasha-item kc-antar">
            <div class="kc-dasha-planet">${p.antar.lord}</div>
            <div class="kc-dasha-type">Antar Dasha</div>
            <div class="kc-dasha-dates">${de(p.antar.start)} – ${de(p.antar.end)}</div>
          </div>
        </div>
      </section>`:""}

      <!-- Janma Nakshatra + Tara -->
      <section class="kc-section">
        <div class="kc-section-title">JANMA NAKSHATRA & TARA</div>
        <div class="kc-nak-tara">
          <div class="kc-nak-card">
            <div class="kc-nak-name">${g.name}</div>
            <div class="kc-nak-detail">Lord: <strong>${g.lord}</strong>${g.pada?` · Pada ${g.pada}`:""}</div>
          </div>
          <div class="kc-tara-card ${f.beneficence==="benefic"?"tara-good":f.beneficence==="malefic"?"tara-bad":"tara-mid"}">
            <div class="kc-tara-num">Tara ${f.number}</div>
            <div class="kc-tara-name">${f.name}</div>
            <div class="kc-tara-sub">Transit Moon: ${f.transitMoonNakName}</div>
          </div>
        </div>
      </section>

      <!-- Planets Table -->
      <section class="kc-section">
        <div class="kc-section-title">PLANETS (LAHIRI SIDEREAL)</div>
        <div class="kc-table-wrap">
          <table class="kc-table">
            <thead><tr>
              <th>Planet</th><th>House</th><th>Sign</th>
              <th>°in Sign</th><th>Nakshatra</th><th>KP Chain</th>
            </tr></thead>
            <tbody>
              ${s.planets.map(b=>`<tr>
                <td style="color:${fe(b.planet)}">${b.planet}</td>
                <td class="tc">${b.house}</td>
                <td>${b.rashiName}</td>
                <td class="mono">${le(b.degInRashi)}</td>
                <td>${b.nakName} P${b.nakPada}</td>
                <td class="kp-cell">${Te(b.kp)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- KP Cusps -->
      <section class="kc-section">
        <div class="kc-section-title">KP HOUSE CUSPS (PLACIDUS · KRISHNAMURTI)</div>
        <div class="kc-table-wrap">
          <table class="kc-table">
            <thead><tr>
              <th>H</th><th>Sign</th><th>°in Sign</th><th>Nakshatra</th><th>KP Chain</th>
            </tr></thead>
            <tbody>
              ${s.cusps.map(b=>`<tr class="${b.house%2===0?"row-alt":""}">
                <td class="tc"><strong>${b.house}</strong></td>
                <td>${b.rashiName}</td>
                <td class="mono">${le(b.degInRashi)}</td>
                <td>${b.nakName} P${b.nakPada}</td>
                <td class="kp-cell">${Te(b.kp)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <div class="kc-engine-note">Engine: ${r.engine} · Computed: ${We(r.computed_at)}</div>

      <!-- Bottom Nav -->
      <div class="kc-bottom-nav">
        <button class="kc-nav-btn" id="btn-kp">KP Query</button>
        <button class="kc-nav-btn" id="btn-muhurta">Muhurta</button>
        <button class="kc-nav-btn" id="btn-dasha">Dasha</button>
        <button class="kc-nav-btn" id="btn-sublords">Sub-Lords</button>
      </div>

    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>E("/dashboard"));const h=document.getElementById("ni-wrap"),T=document.getElementById("si-wrap"),I=document.getElementById("btn-ni"),P=document.getElementById("btn-si");I.addEventListener("click",()=>{h.style.display="",T.style.display="none",I.classList.add("active"),P.classList.remove("active")}),P.addEventListener("click",()=>{T.style.display="",h.style.display="none",P.classList.add("active"),I.classList.remove("active")});const M=async()=>{if(!confirm(`Delete "${n.label??"this kundali"}"? This cannot be undone.`))return;const b=await Xe(n.id);b.ok?(x("Kundali deleted"),E("/kundali")):x(b.data?.error??"Delete failed",!0)};document.getElementById("btn-delete").addEventListener("click",M),document.getElementById("btn-delete-warn")?.addEventListener("click",M),document.getElementById("btn-kp").addEventListener("click",()=>E("/kp-query")),document.getElementById("btn-muhurta").addEventListener("click",()=>E("/muhurta")),document.getElementById("btn-dasha").addEventListener("click",()=>E(`/dasha-timeline?kundali_id=${n.id}`)),document.getElementById("btn-sublords").addEventListener("click",()=>E(`/kp-sublords?kundali_id=${n.id}`))}const Jt=23.2505,Qt=77.4065,U=60,da=[{slug:"property",label:"Property",icon:"🏠",priority:"P0"},{slug:"marriage",label:"Marriage",icon:"💍",priority:"P1"},{slug:"business",label:"Business",icon:"📈",priority:"P2"},{slug:"medical",label:"Medical",icon:"🏥",priority:"P3"}],Zt={Sun:"hora-sun",Moon:"hora-moon",Mars:"hora-mars",Mercury:"hora-mercury",Jupiter:"hora-jupiter",Venus:"hora-venus",Saturn:"hora-saturn"},Xt=["","Janma","Sampat","Vipat","Kshema","Pratyak","Sadhana","Naidhana","Mitra","Param Mitra"];function _(e){try{return new Date(e).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return e}}function en(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}catch{return e}}function ye(e){return e>=80?{cls:"grade-a",label:"Excellent"}:e>=65?{cls:"grade-b",label:"Good"}:e>=50?{cls:"grade-c",label:"Moderate"}:e>=35?{cls:"grade-d",label:"Weak"}:{cls:"grade-f",label:"Avoid"}}function an(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}let F,we=Jt,ke=Qt,pe="Bhopal (default)",ve=null,me=null,j=U;async function tn(){const e=N();B(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",n=new URLSearchParams(t).get("kundali_id");F=n?parseInt(n,10):void 0,e.innerHTML=nn(F),sn(e);try{await rn()}catch{}await ua(e),bn(e)}function nn(e){return`
    <div class="screen muhurta-dashboard">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Muhurta Dashboard</h2>
          <span class="subtitle" id="location-label">Detecting location…</span>
        </div>
        <div class="header-right">
          <span class="refresh-badge" id="refresh-badge">⏱ ${U}s</span>
          ${e?'<button class="btn btn-small btn-ghost" id="btn-chart">Chart</button>':""}
        </div>
      </header>
      <div id="dashboard-body" style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function sn(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{Me(),E(F?`/birth-chart?id=${F}`:"/dashboard")}),e.querySelector("#btn-chart")?.addEventListener("click",()=>{Me(),E(`/birth-chart?id=${F}`)})}async function rn(){return new Promise(e=>{if(!navigator.geolocation){pe="Bhopal (geoloc unavailable)",e();return}navigator.geolocation.getCurrentPosition(a=>{we=a.coords.latitude,ke=a.coords.longitude,pe=`${we.toFixed(4)}°N, ${ke.toFixed(4)}°E`,e()},()=>{pe="Bhopal (location denied)",e()},{timeout:5e3})})}async function ua(e){const a=e.querySelector("#dashboard-body"),t=e.querySelector("#location-label");if(t&&(t.textContent=pe),!!a)try{const i=await Oe(we,ke,"general",F);if(!i.ok||!i.data){a.innerHTML=Ge(i.data?.error??"Failed to load muhurta data");return}const n=i.data;let s={};try{const r=await Promise.allSettled(da.map(o=>Oe(we,ke,o.slug,F).then(d=>({slug:o.slug,score:d.data?.score?.score??null}))));for(const o of r)o.status==="fulfilled"&&(s[o.value.slug]=o.value.score)}catch{}a.innerHTML=on(n,s),j=U}catch(i){console.error("[muhurta-dashboard] load error:",i),a.innerHTML=Ge("Connection error. Will retry automatically.")}}function on(e,a){const t=[];return t.push(`
    <div class="md-timestamp">
      <span>As of <strong>${en(e.as_of)}</strong> IST</span>
      <span class="md-personalized-badge">${e.personalized?"🔮 Personalized":"🌐 Generic"}</span>
    </div>
  `),t.push(cn(e)),e.pancha_pakshi&&t.push(ln(e.pancha_pakshi)),t.push(dn(e)),t.push(un(e)),t.push(pn(e)),e.score&&t.push(vn(e.score)),t.push(mn(a,e.score)),t.join(`
`)}function cn(e){const a=e.active_hora,t=e.active_uphora,i=a?`
      <div class="md-hora-card ${Zt[a.lord]??""}">
        <div class="hora-lord">${a.lord}</div>
        <div class="hora-meta">
          <span class="hora-badge">${a.is_daytime?"☀️ Day":"🌙 Night"}</span>
          <span class="hora-window">${_(a.start)} → ${_(a.end)}</span>
        </div>
      </div>`:'<div class="md-hora-card hora-unknown"><div class="hora-lord">—</div><div class="hora-meta">No hora data</div></div>',n=t?`
      <div class="md-uphora-card">
        <div class="uphora-label">Uphora (1/7 Hora)</div>
        <div class="uphora-lord">${t.sub}</div>
        <div class="uphora-window">${_(t.start)} → ${_(t.end)}</div>
      </div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">⏰ Current Hora</h3>
      <div class="md-hora-row">
        ${i}
        ${n}
      </div>
      <div class="md-sun-row">
        <span>🌅 Sunrise ${_(e.sunrise)}</span>
        <span>🌇 Sunset ${_(e.sunset)}</span>
      </div>
    </section>
  `}function ln(e){const a=e.favorability_score,{cls:t,label:i}=ye(a),n=Math.round(e.confidence*100);return`
    <section class="md-section">
      <h3 class="md-section-title">🦅 Pancha Pakshi</h3>
      <div class="md-pakshi-card">
        <div class="pakshi-bird">${e.bird}</div>
        <div class="pakshi-meta">
          <span class="pakshi-confidence">Confidence: ${n}%</span>
          <span class="pakshi-precision">Precision: ±${e.precision_minutes}m</span>
          <span class="pakshi-window">${_(e.cycle_start)} → ${_(e.cycle_end)}</span>
        </div>
        <div class="md-score-bar-wrap">
          <div class="md-score-bar ${t}" style="width:${a}%"></div>
        </div>
        <div class="pakshi-grade ${t}">${i} (${a}/100)</div>
      </div>
    </section>
  `}function dn(e){const a=e.rahu_kaal,t=a.active_now?"rk-active":"rk-inactive",i=a.active_now?'<span class="badge badge-danger">⚠ ACTIVE NOW</span>':'<span class="badge badge-ok">✓ Not active</span>';return`
    <section class="md-section">
      <h3 class="md-section-title">🐍 Rahu Kaal</h3>
      <div class="md-rk-card ${t}">
        ${i}
        <span class="rk-window">${_(a.start)} – ${_(a.end)}</span>
        ${a.active_now?'<p class="rk-warning">Avoid new ventures during Rahu Kaal.</p>':""}
      </div>
    </section>
  `}function un(e){const a=e.current_nakshatra,t=e.tara;let i='<div class="tara-unavailable">Add a kundali to see personalized Tara</div>';if(t){const r=an(t.beneficence),o=Xt[t.number]??t.name,d=t.beneficence==="benefic"?"✅":t.beneficence==="malefic"?"❌":"⚪";i=`
      <div class="md-tara-card ${r}">
        <div class="tara-number">Tara ${t.number}</div>
        <div class="tara-name">${d} ${o}</div>
        <div class="tara-beneficence">${t.beneficence.charAt(0).toUpperCase()+t.beneficence.slice(1)}</div>
      </div>
    `}const n=a.navtara;let s=`
    <div class="navtara-unavailable">
      <div class="navtara-unavail-icon">🌟</div>
      <div>Navatara requires your Janma Nakshatra</div>
      <a href="#/kundali" class="navtara-add-link">Add Kundali →</a>
    </div>`;if(n){const r=n.cycle===1?"1st":n.cycle===2?"2nd":"3rd",o={most_benefic:"navtara-most-benefic",benefic:"navtara-benefic",neutral:"navtara-neutral",mixed:"navtara-mixed",malefic:"navtara-malefic",most_malefic:"navtara-most-malefic"},d={most_benefic:"✅✅ Most Auspicious",benefic:"✅ Auspicious",neutral:"⚪ Neutral",mixed:"🟡 Mixed",malefic:"❌ Inauspicious",most_malefic:"❌❌ Most Inauspicious"},l=o[n.effectiveQuality]??"navtara-neutral",m=d[n.effectiveQuality]??n.effectiveQuality,u=n.rawScore,v=u>=80?"navtara-bar-high":u>=50?"navtara-bar-mid":"navtara-bar-low";s=`
      <div class="md-navtara-card ${l}">
        <div class="navtara-header">
          <div class="navtara-position">
            <span class="navtara-num">Tara ${n.position}</span>
            <span class="navtara-name">${n.name}</span>
          </div>
          <div class="navtara-cycle">${r} Avritti</div>
        </div>
        <div class="navtara-quality">${m}</div>
        <div class="navtara-bar-wrap">
          <div class="navtara-bar ${v}" style="width:${u}%"></div>
          <span class="navtara-bar-pct">${u}%</span>
        </div>
        <div class="navtara-meaning">${n.meaning}</div>
        <div class="navtara-rec">${n.recommendation}</div>
        <div class="navtara-cycle-rule">${n.cycleRule}</div>
      </div>`}return`
    <section class="md-section">
      <h3 class="md-section-title">⭐ Nakshatra + Tara</h3>
      <div class="md-nak-row">
        <div class="md-nak-card">
          <div class="nak-label">Transit Moon</div>
          <div class="nak-name">${a.name}</div>
          <div class="nak-idx">Nakshatra ${a.idx+1}/27</div>
        </div>
        ${i}
      </div>
      <div class="md-navtara-row">
        <h4 class="md-navtara-title">🔯 Navatara (Tarabala)</h4>
        ${s}
      </div>
    </section>
  `}function pn(e){const a=[];if(e.panchaka_dosha?.active&&a.push(`⚠️ <strong>Panchaka Dosha</strong>${e.panchaka_dosha.dosha?` — ${e.panchaka_dosha.dosha}`:""}: Avoid cremation, travel south, construction.`),e.ganda_moola?.active&&a.push(`⚠️ <strong>Ganda Moola</strong>${e.ganda_moola.nakshatra?` (${e.ganda_moola.nakshatra})`:""}: Inauspicious nakshatra — avoid ceremonies.`),e.dishashool?.active&&a.push(`⚠️ <strong>Dishashool</strong>${e.dishashool.direction?` — ${e.dishashool.direction}`:""}: Travel in this direction is inauspicious today.`),e.combustion?.venus?.combust){const t=e.combustion.venus.orb?` (${e.combustion.venus.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Venus Combust</strong>${t}: Marriage muhurtas affected.`)}if(e.combustion?.jupiter?.combust){const t=e.combustion.jupiter.orb?` (${e.combustion.jupiter.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Jupiter Combust</strong>${t}: Upanayana, marriage, ceremonies affected.`)}return a.length===0?`
      <section class="md-section">
        <h3 class="md-section-title">🛡 Dosha Status</h3>
        <div class="md-clear-card">✓ No active doshas or combustion warnings</div>
      </section>
    `:`
    <section class="md-section">
      <h3 class="md-section-title">⚠️ Active Warnings (${a.length})</h3>
      <ul class="md-warnings-list">
        ${a.map(t=>`<li class="md-warning-item">${t}</li>`).join("")}
      </ul>
    </section>
  `}function vn(e){const{cls:a,label:t}=ye(e.score),i=Math.round(e.score),n=(e.layers??[]).map(r=>{const o=Math.round(r.score),{cls:d}=ye(r.score);return`
      <div class="score-layer">
        <span class="layer-name">${r.name}</span>
        <div class="layer-bar-wrap">
          <div class="layer-bar ${d}" style="width:${o}%"></div>
        </div>
        <span class="layer-score">${o}</span>
        ${r.reason?`<span class="layer-reason">${r.reason}</span>`:""}
      </div>
    `}).join(""),s=(e.warnings??[]).length>0?`<div class="score-warnings">${e.warnings.map(r=>`<span class="score-warn-tag">${r}</span>`).join("")}</div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">📊 Convergence Score</h3>
      <div class="md-score-card">
        <div class="score-big ${a}">${i}</div>
        <div class="score-grade-label ${a}">${t} ${e.grade?`(${e.grade})`:""}</div>
        <div class="md-score-bar-wrap main-bar">
          <div class="md-score-bar ${a}" style="width:${i}%"></div>
        </div>
        ${e.summary?`<p class="score-summary">${e.summary}</p>`:""}
        ${s}
        ${n?`<div class="score-layers">${n}</div>`:""}
      </div>
    </section>
  `}function mn(e,a){return`
    <section class="md-section">
      <h3 class="md-section-title">🎯 Event Suitability</h3>
      <div class="md-event-grid">${da.map(i=>{const n=e[i.slug]??null,s=n!==null?Math.round(n):a?Math.round(a.score):null,{cls:r,label:o}=s!==null?ye(s):{cls:"grade-na",label:"—"};return`
      <div class="md-event-card ${r}">
        <div class="event-icon">${i.icon}</div>
        <div class="event-label">${i.label}</div>
        <div class="event-priority">${i.priority}</div>
        <div class="event-score">${s!==null?s:"—"}</div>
        <div class="event-grade">${o}</div>
      </div>
    `}).join("")}</div>
      ${Object.keys(e).length?"":'<p class="md-note">Scores shown are general. Add a kundali for personalized event ratings.</p>'}
    </section>
  `}function Ge(e){return`<div class="error-card" style="margin: var(--space-6) 0;"><p>${e}</p></div>`}function bn(e){Me(),me=setInterval(()=>{j--;const a=e.querySelector("#refresh-badge");a&&(a.textContent=`⏱ ${j}s`),j<=0&&(j=U)},1e3),ve=setInterval(async()=>{j=U,await ua(e)},U*1e3)}function Me(){ve&&(clearInterval(ve),ve=null),me&&(clearInterval(me),me=null)}hn();function hn(){const e="muhurta-dashboard-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
/* ── Muhurta Dashboard Layout ── */
.muhurta-dashboard .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.muhurta-dashboard .header-right { margin-left:auto; display:flex; align-items:center; gap:var(--space-2); }
.muhurta-dashboard .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.refresh-badge { font-size:var(--font-size-xs); background:var(--color-surface-2); padding:2px 8px; border-radius:99px; }

.md-section { margin-bottom:var(--space-5); }
.md-section-title { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); letter-spacing:.04em; text-transform:uppercase; margin-bottom:var(--space-3); }
.md-timestamp { display:flex; justify-content:space-between; align-items:center; font-size:var(--font-size-sm); margin-bottom:var(--space-4); }
.md-personalized-badge { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; background:var(--color-surface-2); }

/* Hora */
.md-hora-row { display:flex; gap:var(--space-3); flex-wrap:wrap; }
.md-hora-card { flex:1; min-width:140px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.md-hora-card .hora-lord { font-size:var(--font-size-xl); font-weight:700; }
.md-hora-card .hora-meta { margin-top:var(--space-2); display:flex; flex-direction:column; gap:2px; font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.hora-badge { display:inline-block; }
.hora-window { }
.md-uphora-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface-2); text-align:center; }
.uphora-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-1); }
.uphora-lord { font-size:var(--font-size-lg); font-weight:600; }
.uphora-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:4px; }
.md-sun-row { display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:var(--space-3); }

/* Hora lord colours */
.hora-sun     { background:#fff8e1; border-color:#f9a825; }
.hora-moon    { background:#e3f2fd; border-color:#1565c0; }
.hora-mars    { background:#fce4ec; border-color:#c62828; }
.hora-mercury { background:#e8f5e9; border-color:#2e7d32; }
.hora-jupiter { background:#fff3e0; border-color:#e65100; }
.hora-venus   { background:#fce4ec; border-color:#ad1457; }
.hora-saturn  { background:#ede7f6; border-color:#4527a0; }
@media (prefers-color-scheme:dark) {
  .hora-sun     { background:#3e2a00; border-color:#f9a825; }
  .hora-moon    { background:#0d1b2a; border-color:#1565c0; }
  .hora-mars    { background:#3b0a14; border-color:#c62828; }
  .hora-mercury { background:#0a1f0c; border-color:#2e7d32; }
  .hora-jupiter { background:#2a1500; border-color:#e65100; }
  .hora-venus   { background:#2d0a18; border-color:#ad1457; }
  .hora-saturn  { background:#160e2b; border-color:#4527a0; }
}

/* Pakshi */
.md-pakshi-card { padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); }
.pakshi-bird { font-size:var(--font-size-lg); font-weight:700; margin-bottom:var(--space-2); }
.pakshi-meta { display:flex; flex-wrap:wrap; gap:var(--space-3); font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-3); }

/* Rahu Kaal */
.md-rk-card { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); flex-wrap:wrap; }
.rk-active { border-color:#c62828; background:#fce4ec; }
.rk-inactive { border-color:var(--color-border); }
@media (prefers-color-scheme:dark) { .rk-active { background:#3b0a14; } }
.rk-window { font-size:var(--font-size-sm); }
.rk-warning { font-size:var(--font-size-xs); color:#c62828; margin:0; }
.badge { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; font-weight:600; }
.badge-danger { background:#c62828; color:#fff; }
.badge-ok { background:#2e7d32; color:#fff; }

/* Nakshatra + Tara */
.md-nak-row { display:flex; gap:var(--space-3); flex-wrap:wrap; }
.md-nak-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.nak-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.nak-name { font-size:var(--font-size-lg); font-weight:700; margin:var(--space-1) 0; }
.nak-idx { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.md-tara-card { flex:1; min-width:120px; padding:var(--space-4); border-radius:var(--radius-md); border:2px solid; text-align:center; }
.md-tara-card.tara-good { border-color:#2e7d32; background:#e8f5e9; }
.md-tara-card.tara-bad  { border-color:#c62828; background:#fce4ec; }
.md-tara-card.tara-neutral { border-color:var(--color-border); }
@media (prefers-color-scheme:dark) {
  .md-tara-card.tara-good { background:#0a1f0c; }
  .md-tara-card.tara-bad  { background:#3b0a14; }
}
.tara-number { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.tara-name { font-size:var(--font-size-lg); font-weight:700; margin:var(--space-1) 0; }
.tara-beneficence { font-size:var(--font-size-sm); font-weight:600; }
.tara-unavailable { padding:var(--space-4); font-size:var(--font-size-sm); color:var(--color-text-secondary); text-align:center; flex:1; }

/* Navatara (Tarabala) */
.md-navtara-row { margin-top:var(--space-4); }
.md-navtara-title { font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); letter-spacing:.04em; text-transform:uppercase; margin:0 0 var(--space-3); }
.md-navtara-card { padding:var(--space-4); border-radius:var(--radius-md); border:2px solid var(--color-border); }
.navtara-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); }
.navtara-position { display:flex; flex-direction:column; gap:2px; }
.navtara-num { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.navtara-name { font-size:var(--font-size-lg); font-weight:800; }
.navtara-cycle { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); }
.navtara-quality { font-size:var(--font-size-sm); font-weight:600; margin-bottom:var(--space-2); }
.navtara-bar-wrap { display:flex; align-items:center; gap:var(--space-2); background:var(--color-surface-2); border-radius:99px; height:8px; overflow:visible; margin-bottom:var(--space-3); position:relative; }
.navtara-bar { height:8px; border-radius:99px; transition:width 0.6s ease; }
.navtara-bar-high { background:#2e7d32; }
.navtara-bar-mid  { background:#f57f17; }
.navtara-bar-low  { background:#c62828; }
.navtara-bar-pct { font-size:var(--font-size-xs); font-weight:700; margin-left:8px; white-space:nowrap; }
.navtara-meaning { font-size:var(--font-size-sm); font-weight:600; margin-bottom:4px; }
.navtara-rec { font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-2); }
.navtara-cycle-rule { font-size:var(--font-size-xs); color:var(--color-text-secondary); font-style:italic; padding-top:var(--space-2); border-top:1px solid var(--color-border); }
/* Navatara quality border + bg */
.navtara-most-benefic { border-color:#2e7d32; background:#e8f5e9; }
.navtara-benefic      { border-color:#558b2f; background:#f1f8e9; }
.navtara-neutral      { border-color:var(--color-border); }
.navtara-mixed        { border-color:#f57f17; background:#fff8e1; }
.navtara-malefic      { border-color:#e65100; background:#fff3e0; }
.navtara-most-malefic { border-color:#c62828; background:#fce4ec; }
@media (prefers-color-scheme:dark) {
  .navtara-most-benefic { background:#0a1f0c; }
  .navtara-benefic      { background:#0d2200; }
  .navtara-mixed        { background:#221600; }
  .navtara-malefic      { background:#2a1500; }
  .navtara-most-malefic { background:#3b0a14; }
}
.navtara-unavailable { padding:var(--space-4); border-radius:var(--radius-md); border:1px dashed var(--color-border); text-align:center; display:flex; flex-direction:column; align-items:center; gap:var(--space-2); color:var(--color-text-secondary); font-size:var(--font-size-sm); }
.navtara-unavail-icon { font-size:1.5rem; }
.navtara-add-link { font-size:var(--font-size-xs); color:var(--primary-text); text-decoration:none; }

/* Warnings */
.md-warnings-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:var(--space-2); }
.md-warning-item { padding:var(--space-3); border-radius:var(--radius-md); background:#fff3e0; border-left:3px solid #e65100; font-size:var(--font-size-sm); }
@media (prefers-color-scheme:dark) { .md-warning-item { background:#2a1500; } }
.md-clear-card { padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); background:#e8f5e9; border:1px solid #2e7d32; font-size:var(--font-size-sm); color:#2e7d32; }
@media (prefers-color-scheme:dark) { .md-clear-card { background:#0a1f0c; } }

/* Score */
.md-score-card { padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); }
.score-big { font-size:3rem; font-weight:800; line-height:1; }
.score-grade-label { font-size:var(--font-size-sm); font-weight:600; margin-top:4px; margin-bottom:var(--space-3); }
.md-score-bar-wrap { background:var(--color-surface-2); border-radius:99px; height:8px; overflow:hidden; margin-bottom:var(--space-3); }
.md-score-bar { height:8px; border-radius:99px; transition:width 0.6s ease; }
.main-bar .md-score-bar { height:12px; }
.score-summary { font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:var(--space-3); }
.score-warnings { display:flex; flex-wrap:wrap; gap:var(--space-2); margin-bottom:var(--space-3); }
.score-warn-tag { font-size:var(--font-size-xs); padding:2px 8px; border-radius:99px; background:#fff3e0; border:1px solid #e65100; color:#e65100; }
@media (prefers-color-scheme:dark) { .score-warn-tag { background:#2a1500; } }
.score-layers { display:flex; flex-direction:column; gap:var(--space-3); border-top:1px solid var(--color-border); padding-top:var(--space-3); }
.score-layer { display:grid; grid-template-columns:120px 1fr 40px; align-items:center; gap:var(--space-2); font-size:var(--font-size-xs); }
.layer-name { color:var(--color-text-secondary); }
.layer-bar-wrap { background:var(--color-surface-2); border-radius:99px; height:6px; overflow:hidden; }
.layer-bar { height:6px; border-radius:99px; }
.layer-score { text-align:right; font-weight:600; }
.layer-reason { grid-column:1/-1; color:var(--color-text-secondary); font-style:italic; }

/* Grade colours */
.grade-a { color:#2e7d32; } .grade-a.md-score-bar { background:#2e7d32; } .grade-a.layer-bar { background:#2e7d32; }
.grade-b { color:#558b2f; } .grade-b.md-score-bar { background:#558b2f; } .grade-b.layer-bar { background:#558b2f; }
.grade-c { color:#f57f17; } .grade-c.md-score-bar { background:#f57f17; } .grade-c.layer-bar { background:#f57f17; }
.grade-d { color:#e65100; } .grade-d.md-score-bar { background:#e65100; } .grade-d.layer-bar { background:#e65100; }
.grade-f { color:#c62828; } .grade-f.md-score-bar { background:#c62828; } .grade-f.layer-bar { background:#c62828; }
.grade-na { color:var(--color-text-secondary); }
.pakshi-grade { font-size:var(--font-size-sm); font-weight:600; }

/* Event grid */
.md-event-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:var(--space-3); }
@media (min-width:500px) { .md-event-grid { grid-template-columns:repeat(4,1fr); } }
.md-event-card { padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center; }
.event-icon { font-size:1.5rem; }
.event-label { font-size:var(--font-size-sm); font-weight:600; margin:4px 0 2px; }
.event-priority { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2); }
.event-score { font-size:1.5rem; font-weight:800; }
.event-grade { font-size:var(--font-size-xs); font-weight:600; margin-top:2px; }
.md-event-card.grade-a { border-color:#2e7d32; background:#e8f5e9; }
.md-event-card.grade-b { border-color:#558b2f; background:#f1f8e9; }
.md-event-card.grade-c { border-color:#f57f17; background:#fff8e1; }
.md-event-card.grade-d { border-color:#e65100; background:#fff3e0; }
.md-event-card.grade-f { border-color:#c62828; background:#fce4ec; }
@media (prefers-color-scheme:dark) {
  .md-event-card.grade-a { background:#0a1f0c; }
  .md-event-card.grade-b { background:#0d2200; }
  .md-event-card.grade-c { background:#221600; }
  .md-event-card.grade-d { background:#2a1500; }
  .md-event-card.grade-f { background:#3b0a14; }
}
.md-note { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:var(--space-2); text-align:center; }
`,document.head.appendChild(a)}const R=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"],G={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17},Y={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},J={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#d97706",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"};function gn(e,a){const t=Date.now(),i=[];let n=e.getTime();for(let s=0;s<9;s++){const r=(a+s)%9,o=R[r],d=G[o]*365.25*864e5,l=new Date(n),m=new Date(n+d),u=t>=l.getTime()&&t<m.getTime(),v=t>=m.getTime();i.push({lord:o,start:l,end:m,idx:s,isCurrent:u,isPast:v,antars:fn({lord:o,start:l})}),n+=d}return i}function fn(e){const a=Date.now(),t=R.indexOf(e.lord),i=G[e.lord],n=[];let s=e.start.getTime();for(let r=0;r<9;r++){const o=(t+r)%9,d=R[o],l=G[d]/120*i*365.25*864e5,m=new Date(s),u=new Date(s+l),v=a>=m.getTime()&&a<u.getTime(),c={lord:d,start:m,end:u};v&&(c.pratyantar=yn({lord:d,start:m,end:u})),n.push(c),s+=l}return n}function yn(e,a){const t=R.indexOf(e.lord),i=e.end.getTime()-e.start.getTime(),n=120,s=[];let r=e.start.getTime();for(let o=0;o<9;o++){const d=(t+o)%9,l=R[d],u=G[l]/n*i,v=new Date(r),c=new Date(r+u);s.push({lord:l,start:v,end:c}),r+=u}return s}function Q(e){return e.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}function q(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function pa(e,a){const t=(a.getTime()-e.getTime())/315576e5;if(t>=1)return`${t.toFixed(1)}y`;const i=t*12;return i>=1?`${i.toFixed(1)}m`:`${Math.round(t*365)}d`}function wn(e,a){const t=Date.now();return t<=e.getTime()?0:t>=a.getTime()?100:Math.round((t-e.getTime())/(a.getTime()-e.getTime())*100)}let Ne,ie=-1;async function kn(){const e=N();B(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",i=new URLSearchParams(a).get("kundali_id");if(!i){e.innerHTML=be("Missing kundali_id parameter.");return}Ne=parseInt(i,10),e.innerHTML=xn(),va(e);try{const n=await $e(Ne);if(!n.ok||!n.data){e.innerHTML=be(n.data?.error??"Failed to load chart data.");return}const{chart:s,kundali:r}=n.data;ma(e,s,r)}catch(n){console.error("[dasha-timeline]",n),e.innerHTML=be("Connection error. Please try again.")}}function xn(){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function va(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{E(`/birth-chart?id=${Ne}`)})}function ma(e,a,t){const{dasha:i,janmaNakshatra:n}=a;if(!i){e.innerHTML=be("Dasha calculation unavailable for this chart.");return}const s=n.lord,r=R.indexOf(s),o=new Date(i.maha.start),d=i.maha.lord,l=R.indexOf(d);let m=o.getTime(),u=0;if(r!==-1&&l!==-1){u=(l-r+9)%9;for(let h=0;h<u;h++){const T=R[(r+h)%9];m-=G[T]*365.25*864e5}}const v=gn(new Date(m),r!==-1?r:l),c=v.findIndex(h=>h.isCurrent);ie===-1&&(ie=c>=0?c:0);const p=v[0].start,g=v[v.length-1].end.getTime()-p.getTime(),y=v[ie],$=y.antars.find(h=>Date.now()>=h.start.getTime()&&Date.now()<h.end.getTime())??null;e.innerHTML=`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Dasha Timeline</h2>
          <span class="subtitle">${t.label??"Birth Chart"}</span>
        </div>
      </header>
      <div class="dt-body">
        ${$n(n,i)}
        ${Sn(v,p,g)}
        ${En(v)}
        ${In(y,$)}
      </div>
    </div>
  `,va(e),Ln(e,v,a,t)}function $n(e,a){return`
    <section class="dt-section">
      <div class="dt-janma-card">
        <div class="dt-janma-nak">
          <span class="dt-label">Janma Nakshatra</span>
          <span class="dt-nak-name">${e.name}</span>
          <span class="dt-nak-meta">Pada ${e.pada??"—"} · Lord: <strong>${e.lord}</strong></span>
        </div>
        <div class="dt-current-dasha">
          <div class="dt-maha-now">
            <span class="dt-label">Mahadasha</span>
            <span class="dt-lord" style="color:${J[a.maha.lord]??"inherit"}">
              ${Y[a.maha.lord]??""} ${a.maha.lord}
            </span>
            <span class="dt-window">${q(new Date(a.maha.start))} → ${q(new Date(a.maha.end))}</span>
          </div>
          <div class="dt-antar-now">
            <span class="dt-label">Antardasha</span>
            <span class="dt-lord" style="color:${J[a.antar.lord]??"inherit"}">
              ${Y[a.antar.lord]??""} ${a.antar.lord}
            </span>
            <span class="dt-window">${q(new Date(a.antar.start))} → ${q(new Date(a.antar.end))}</span>
          </div>
        </div>
      </div>
    </section>
  `}function Sn(e,a,t){const i=e.map(s=>{const r=((s.start.getTime()-a.getTime())/t*100).toFixed(2),o=((s.end.getTime()-s.start.getTime())/t*100).toFixed(2),d=J[s.lord]??"#888";return`<div class="${s.isCurrent?"tl-seg current":s.isPast?"tl-seg past":"tl-seg future"}" style="left:${r}%;width:${o}%;background:${d}${s.isPast?"66":s.isCurrent?"":"33"};"
              title="${s.lord}: ${q(s.start)}–${q(s.end)}">
              <span class="tl-seg-label">${s.lord}</span>
            </div>`}).join(""),n=e.length>0?Math.max(0,Math.min(100,(Date.now()-a.getTime())/t*100)).toFixed(2):"0";return`
    <section class="dt-section">
      <h3 class="dt-section-title">⏳ 120-Year Vimshottari Cycle</h3>
      <div class="dt-timeline-bar">
        ${i}
        <div class="tl-now-marker" style="left:${n}%" title="Today"></div>
      </div>
      <div class="dt-timeline-labels">
        <span>${q(e[0]?.start??new Date)}</span>
        <span>Today</span>
        <span>${q(e[e.length-1]?.end??new Date)}</span>
      </div>
    </section>
  `}function En(e){return`
    <section class="dt-section">
      <h3 class="dt-section-title">🪐 Mahadasha Periods <span class="dt-hint">Tap to expand</span></h3>
      <div class="dt-maha-list" id="maha-list">
        ${e.map((t,i)=>{const n=t.isCurrent?wn(t.start,t.end):t.isPast?100:0,s=J[t.lord]??"#888";return`
      <div class="${t.isCurrent?"maha-card current":t.isPast?"maha-card past":"maha-card future"}${i===ie?" selected":""}" data-maha-idx="${i}" style="--planet-color:${s}">
        <div class="maha-left">
          <div class="maha-glyph">${Y[t.lord]??""}</div>
          <div class="maha-info">
            <div class="maha-lord">${t.lord}</div>
            <div class="maha-years">${G[t.lord]}y</div>
          </div>
        </div>
        <div class="maha-right">
          <div class="maha-window">${Q(t.start)} → ${Q(t.end)}</div>
          ${t.isCurrent?`
            <div class="maha-progress-wrap">
              <div class="maha-progress-bar" style="width:${n}%;background:${s}"></div>
            </div>
            <div class="maha-pct">${n}% elapsed</div>
          `:""}
        </div>
        ${t.isCurrent?'<span class="maha-now-badge">NOW</span>':""}
      </div>
    `}).join("")}
      </div>
    </section>
  `}function In(e,a){const t=e.antars.map(n=>{const s=Date.now()>=n.start.getTime()&&Date.now()<n.end.getTime(),r=Date.now()>=n.end.getTime(),o=J[n.lord]??"#888";return`
      <div class="${s?"antar-row current":r?"antar-row past":"antar-row future"}">
        <div class="antar-left">
          <span class="antar-glyph" style="color:${o}">${Y[n.lord]??""}</span>
          <span class="antar-lord">${n.lord}</span>
          ${s?'<span class="antar-now-badge">NOW</span>':""}
        </div>
        <div class="antar-right">
          <span class="antar-window">${Q(n.start)} → ${Q(n.end)}</span>
          <span class="antar-dur">${pa(n.start,n.end)}</span>
        </div>
      </div>
    `}).join(""),i=a?.pratyantar?Tn(a):"";return`
    <section class="dt-section">
      <h3 class="dt-section-title">
        🔵 Antardashas — ${Y[e.lord]??""} ${e.lord} Maha
        <span class="dt-hint">(${q(e.start)} – ${q(e.end)})</span>
      </h3>
      <div class="dt-antar-list">${t}</div>
      ${i}
    </section>
  `}function Tn(e){if(!e.pratyantar?.length)return"";const a=e.pratyantar.map(t=>{const i=Date.now()>=t.start.getTime()&&Date.now()<t.end.getTime(),n=Date.now()>=t.end.getTime(),s=J[t.lord]??"#888";return`
      <div class="${i?"prat-row current":n?"prat-row past":"prat-row"}">
        <span class="prat-glyph" style="color:${s}">${Y[t.lord]??""}</span>
        <span class="prat-lord">${t.lord}</span>
        ${i?'<span class="prat-now-badge">NOW</span>':""}
        <span class="prat-window">${Q(t.start)} – ${Q(t.end)}</span>
        <span class="prat-dur">${pa(t.start,t.end)}</span>
      </div>
    `}).join("");return`
    <div class="dt-prat-section">
      <h4 class="dt-section-title">🔴 Pratyantar — ${e.lord} Antar</h4>
      <div class="dt-prat-list">${a}</div>
    </div>
  `}function be(e){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function Ln(e,a,t,i){e.querySelectorAll(".maha-card").forEach(n=>{n.addEventListener("click",()=>{ie=parseInt(n.dataset.mahaIdx??"0",10),ma(e,t,i)})})}Cn();function Cn(){const e="dasha-timeline-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
/* ── Dasha Timeline Layout ── */
.dasha-timeline .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.dasha-timeline .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.dt-body { padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-5); }
.dt-section { }
.dt-section-title { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); letter-spacing:.04em; text-transform:uppercase; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2); flex-wrap:wrap; }
.dt-hint { font-size:var(--font-size-xs); font-weight:400; text-transform:none; letter-spacing:0; color:var(--color-text-tertiary,#aaa); }
.dt-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); display:block; margin-bottom:2px; }

/* Janma card */
.dt-janma-card { display:flex; flex-wrap:wrap; gap:var(--space-4); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); background:var(--color-surface-1); }
.dt-janma-nak { flex:1; min-width:140px; }
.dt-nak-name { font-size:var(--font-size-lg); font-weight:700; display:block; }
.dt-nak-meta { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.dt-current-dasha { flex:2; min-width:200px; display:flex; gap:var(--space-4); flex-wrap:wrap; }
.dt-maha-now, .dt-antar-now { flex:1; min-width:100px; }
.dt-lord { font-size:var(--font-size-lg); font-weight:700; display:block; }
.dt-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Timeline bar */
.dt-timeline-bar { position:relative; height:40px; background:var(--color-surface-2); border-radius:var(--radius-sm); overflow:hidden; margin-bottom:var(--space-2); }
.tl-seg { position:absolute; top:0; bottom:0; display:flex; align-items:center; justify-content:center; overflow:hidden; transition:filter .2s; }
.tl-seg.current { filter:brightness(1); }
.tl-seg.past { filter:brightness(0.6); }
.tl-seg.future { filter:brightness(0.7); }
.tl-seg-label { font-size:9px; font-weight:600; color:#fff; text-shadow:0 0 3px #0008; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; padding:0 2px; }
.tl-now-marker { position:absolute; top:0; bottom:0; width:2px; background:#000; opacity:.5; }
@media (prefers-color-scheme:dark) { .tl-now-marker { background:#fff; } }
.dt-timeline-labels { display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Maha list */
.dt-maha-list { display:flex; flex-direction:column; gap:var(--space-2); }
.maha-card { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); border-radius:var(--radius-md); border:1px solid var(--color-border); cursor:pointer; position:relative; transition:box-shadow .15s; }
.maha-card:hover { box-shadow:0 0 0 2px var(--planet-color); }
.maha-card.selected { border-color:var(--planet-color); box-shadow:0 0 0 2px var(--planet-color); }
.maha-card.current { border-left:3px solid var(--planet-color); }
.maha-card.past { opacity:.65; }
.maha-card.future { opacity:.8; }
.maha-left { display:flex; align-items:center; gap:var(--space-2); min-width:80px; }
.maha-glyph { font-size:1.4rem; color:var(--planet-color); }
.maha-lord { font-weight:700; font-size:var(--font-size-sm); }
.maha-years { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.maha-right { flex:1; }
.maha-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:4px; }
.maha-progress-wrap { background:var(--color-surface-2); border-radius:99px; height:6px; overflow:hidden; margin-bottom:2px; }
.maha-progress-bar { height:6px; border-radius:99px; transition:width .6s ease; }
.maha-pct { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.maha-now-badge { position:absolute; top:var(--space-2); right:var(--space-3); font-size:var(--font-size-xs); font-weight:700; padding:1px 6px; border-radius:99px; background:var(--planet-color); color:#fff; }

/* Antar list */
.dt-antar-list { display:flex; flex-direction:column; gap:1px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--color-border); }
.antar-row { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:var(--color-surface-1); }
.antar-row + .antar-row { border-top:1px solid var(--color-border); }
.antar-row.current { background:var(--color-surface-2); font-weight:600; }
.antar-row.past { opacity:.6; }
.antar-left { display:flex; align-items:center; gap:var(--space-2); min-width:120px; }
.antar-glyph { font-size:1.1rem; }
.antar-lord { font-size:var(--font-size-sm); font-weight:600; }
.antar-now-badge { font-size:var(--font-size-xs); font-weight:700; padding:1px 5px; border-radius:99px; background:#2563eb; color:#fff; }
.antar-right { flex:1; display:flex; justify-content:space-between; align-items:center; }
.antar-window { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.antar-dur { font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); }

/* Pratyantar */
.dt-prat-section { margin-top:var(--space-4); }
.dt-prat-list { display:flex; flex-direction:column; gap:1px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--color-border); }
.prat-row { display:flex; align-items:center; gap:var(--space-3); padding:var(--space-2) var(--space-4); background:var(--color-surface-1); font-size:var(--font-size-xs); }
.prat-row + .prat-row { border-top:1px solid var(--color-border); }
.prat-row.current { background:var(--color-surface-2); font-weight:600; }
.prat-row.past { opacity:.55; }
.prat-glyph { font-size:1rem; min-width:18px; }
.prat-lord { min-width:70px; font-weight:600; }
.prat-now-badge { font-size:var(--font-size-xs); font-weight:700; padding:1px 5px; border-radius:99px; background:#dc2626; color:#fff; margin-right:4px; }
.prat-window { flex:1; color:var(--color-text-secondary); }
.prat-dur { font-weight:600; color:var(--color-text-secondary); }
`,document.head.appendChild(a)}const Pn={I:"Self, Health, Appearance",II:"Wealth, Family, Speech",III:"Courage, Siblings, Short Trips",IV:"Property, Mother, Happiness",V:"Children, Intelligence, Speculation",VI:"Enemies, Disease, Service",VII:"Marriage, Business Partners",VIII:"Longevity, Hidden, Inheritance",IX:"Luck, Father, Dharma",X:"Career, Status, Authority",XI:"Gains, Desires, Elder Siblings",XII:"Loss, Abroad, Liberation"},qe={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},He={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#b45309",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"},ba={Aries:"Ar",Taurus:"Ta",Gemini:"Ge",Cancer:"Cn",Leo:"Le",Virgo:"Vi",Libra:"Li",Scorpio:"Sc",Sagittarius:"Sg",Capricorn:"Cp",Aquarius:"Aq",Pisces:"Pi"};let Be,he="cusps";async function An(){const e=N();B(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",i=new URLSearchParams(a).get("kundali_id");if(!i){e.innerHTML=Le("Missing kundali_id parameter.");return}Be=parseInt(i,10),e.innerHTML=Nn(),fa(e);try{const n=await Aa(Be);if(!n.ok||!n.data){e.innerHTML=Le(n.data?.error??"Failed to load KP chart.");return}ha(e,n.data)}catch(n){console.error("[kp-sublords]",n),e.innerHTML=Le("Connection error. Please try again.")}}function ha(e,a){e.innerHTML=`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>KP Sub-Lords</h2>
          <span class="subtitle">Krishnamurti Paddhati · Placidus Sidereal</span>
        </div>
      </header>

      <div class="kp-tabs" role="tablist">
        <button class="kp-tab${he==="cusps"?" active":""}" data-tab="cusps" role="tab">
          🏠 Bhavas (12)
        </button>
        <button class="kp-tab${he==="planets"?" active":""}" data-tab="planets" role="tab">
          🪐 Planets (${a.planet_sub_lords.length})
        </button>
      </div>

      <div class="kp-body">
        ${he==="cusps"?zn(a.house_cusps):Mn(a.planet_sub_lords)}
      </div>

      <div class="kp-caveat">${a.ayanamsa_caveat}</div>
    </div>
  `,fa(e),Bn(e,a)}function zn(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the cusp</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Primary significator (KP prime indicator)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (fine-tuning)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const i=Pn[t.house]??"",n=t.sign??"",s=ba[n]??n.slice(0,2),r=t.deg_in_sign.toFixed(2);return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-house-badge">H${t.house}</div>
          <div class="kp-row-meta">
            <span class="kp-pos">${s} ${r}°</span>
            <span class="kp-theme">${i}</span>
          </div>
        </div>
        <div class="kp-chain">
          ${W("Star",t.star_lord)}
          ${xe()}
          ${W("Sub",t.sub_lord,!0)}
          ${xe()}
          ${W("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${ga(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function Mn(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the planet</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Controls planet's results (KP prime)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (finer detail)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const i=t.sign??"",n=ba[i]??i.slice(0,2),s=t.deg_in_sign.toFixed(2),r=He[t.planet]??"#888",o=qe[t.planet]??"";return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-planet-badge" style="color:${r}">
            ${o} ${t.planet}
          </div>
          <div class="kp-row-meta">
            <span class="kp-pos">${n} ${s}°</span>
          </div>
        </div>
        <div class="kp-chain">
          ${W("Star",t.star_lord)}
          ${xe()}
          ${W("Sub",t.sub_lord,!0)}
          ${xe()}
          ${W("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${ga(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function W(e,a,t=!1){const i=He[a]??"#888",n=qe[a]??"";return`
    <div class="kp-chain-cell${t?" prime":""}">
      <div class="kp-chain-label">${e}</div>
      <div class="kp-chain-lord" style="color:${i}">
        ${n} ${a}
      </div>
    </div>
  `}function xe(){return'<div class="kp-chain-arrow">→</div>'}function ga(e){const a=He[e]??"#888",t=qe[e]??"";return`<span class="lord-chip" style="color:${a}">${t} ${e}</span>`}function Nn(){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="spinner" style="margin:40px auto"></div>
      </div>
    </div>
  `}function Le(e){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function fa(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{E(`/birth-chart?id=${Be}`)})}function Bn(e,a){e.querySelectorAll(".kp-tab").forEach(t=>{t.addEventListener("click",()=>{he=t.dataset.tab??"cusps",ha(e,a)})})}Dn();function Dn(){const e="kp-sublords-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
/* ── KP Sub-Lords screen ── */
.kp-sublords .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.kp-sublords .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Tabs */
.kp-tabs { display:flex; border-bottom:1px solid var(--color-border); padding:0 var(--space-4); gap:var(--space-2); }
.kp-tab { background:none; border:none; padding:var(--space-3) var(--space-4); font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-secondary); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .15s, border-color .15s; }
.kp-tab.active { color:var(--color-primary,#2563eb); border-bottom-color:var(--color-primary,#2563eb); }
.kp-tab:hover:not(.active) { color:var(--color-text-primary); }

/* Body */
.kp-body { padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-3); }

/* Legend */
.kp-legend { display:flex; flex-wrap:wrap; align-items:center; gap:4px var(--space-3); padding:var(--space-3); background:var(--color-surface-2); border-radius:var(--radius-sm); font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2); }
.kp-legend-sep { font-weight:600; }

/* Rows */
.kp-rows { display:flex; flex-direction:column; gap:var(--space-2); }
.kp-row { border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-3); background:var(--color-surface-1); }

/* Row header */
.kp-row-header { display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3); }
.kp-house-badge { font-size:var(--font-size-xs); font-weight:700; padding:3px 8px; border-radius:99px; background:var(--color-surface-2); color:var(--color-text-secondary); letter-spacing:.04em; min-width:36px; text-align:center; }
.kp-planet-badge { font-size:var(--font-size-md); font-weight:700; }
.kp-row-meta { flex:1; display:flex; flex-direction:column; }
.kp-pos { font-size:var(--font-size-sm); font-weight:600; }
.kp-theme { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Chain */
.kp-chain { display:flex; align-items:stretch; gap:0; margin-bottom:var(--space-2); }
.kp-chain-cell { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:var(--space-2); background:var(--color-surface-2); border-radius:var(--radius-sm); text-align:center; }
.kp-chain-cell.prime { background:color-mix(in srgb, var(--color-primary,#2563eb) 10%, var(--color-surface-2)); border:1px solid var(--color-primary,#2563eb); }
.kp-chain-arrow { display:flex; align-items:center; padding:0 4px; color:var(--color-text-secondary); font-size:var(--font-size-xs); }
.kp-chain-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:2px; }
.kp-chain-lord { font-size:var(--font-size-sm); font-weight:700; }

/* Sign lord line */
.kp-sign-lord-line { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.lord-chip { font-weight:700; margin-left:4px; }

/* Caveat */
.kp-caveat { font-size:var(--font-size-xs); color:var(--color-text-secondary); padding:var(--space-3) var(--space-4) var(--space-6); line-height:1.5; border-top:1px solid var(--color-border); margin-top:var(--space-2); }
`,document.head.appendChild(a)}const Ye={property:{slug:"property",label:"Property Purchase",emoji:"🏠",defaultWindowDays:30,color:"#16a34a",scoringNotes:["Moon in 4th house sign (Cancer) or aspecting it = strong for property","4th house sub-lord (KP) must signify 4, 11 — not 8, 12","Venus hora or Jupiter hora preferred (wealth + expansion)","Avoid Panchaka Dosha for property transactions","Vastu direction: prefer East or North muhurta times"],auspiciousHoras:["Venus","Jupiter","Mercury"]},marriage:{slug:"marriage",label:"Marriage Muhurta",emoji:"💍",defaultWindowDays:60,color:"#db2777",scoringNotes:["7th house sub-lord (KP) must signify 1, 2, 7, 11 — not 6, 8, 12","Moon + Venus strong (no combustion, no debilitation)","Venus hora preferred; avoid Saturn hora for auspicious ceremonies","Navpancham / Trikona Tara between bride and groom is ideal","Avoid Ashtama Navamsha (Lagna in 8th part of sign during ceremony)"],auspiciousHoras:["Venus","Jupiter","Moon"]},business:{slug:"business",label:"Business Launch",emoji:"🏢",defaultWindowDays:30,color:"#2563eb",scoringNotes:["10th house sub-lord (KP) must signify 1, 6, 10, 11","Mercury hora for registration/contracts; Sun hora for authority/leadership","Moon in waxing phase (Shukla Paksha) for new ventures","Avoid Rahu hora for business starts (instability, hidden obstacles)","Jupiter must not be in 6, 8, 12 from Lagna (Guru Chandal Dosha check)"],auspiciousHoras:["Mercury","Sun","Jupiter"]},medical:{slug:"medical",label:"Medical / Surgery",emoji:"🏥",defaultWindowDays:14,color:"#dc2626",scoringNotes:["Moon must be strong — not in 8th house, not debilitated (Scorpio), not eclipsed","Avoid Ashtami (8th Tithi) and Krishna Chaturdashi (14th dark fortnight)","8th house sub-lord (KP) must NOT signify 2, 7 (maraka houses)","Sun hora for surgeries involving head/eye; Mars hora for procedures","Avoid Ganda Moola nakshatras — flag shown if active in selected window"],auspiciousHoras:["Sun","Mercury","Jupiter"]}};let K=null,Je="property",te=null,ne=null;async function _n(){const e=N();B(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",i=new URLSearchParams(t),n=i.get("purpose")??"property";Je=Ye[n]?n:"property";const s=i.get("kundali_id");K=s?parseInt(s,10):null;const r=Ye[Je];if(e.innerHTML=Kn(r),ya(e),K&&!isNaN(K))try{const o=await $e(K);if(o.ok&&o.data){const{kundali:d}=o.data;te=d.latitude,ne=d.longitude}}catch{}qn(e,r)}function qn(e,a){const t=new Date().toISOString().slice(0,10),i=new Date(Date.now()+a.defaultWindowDays*864e5).toISOString().slice(0,10),n=te!==null?te.toFixed(4):"",s=ne!==null?ne.toFixed(4):"",r=te!==null&&ne!==null;e.innerHTML=`
    <div class="screen event-muhurta-screen" style="--purpose-color:${a.color}">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>${a.emoji} ${a.label}</h2>
          <span class="subtitle">Muhurta Finder · Hora/Tara scoring</span>
        </div>
      </header>

      <!-- KP Scoring Notes -->
      <section class="em-notes">
        <div class="em-notes-title">KP Astrological Guidelines</div>
        <ul class="em-notes-list">
          ${a.scoringNotes.map(o=>`<li>${o}</li>`).join("")}
        </ul>
        <div class="em-auspicious-horas">
          Preferred Horas: ${a.auspiciousHoras.map(o=>`<span class="hora-chip hora-${o.toLowerCase()}">${o}</span>`).join(" ")}
        </div>
      </section>

      <!-- Search Form -->
      <section class="em-form">
        <div class="em-form-title">Find Auspicious Windows</div>

        ${r?`
        <div class="em-location-confirmed">
          📍 Using birth location: ${te.toFixed(4)}°N, ${ne.toFixed(4)}°E
          <input type="hidden" id="inp-lat" value="${n}" />
          <input type="hidden" id="inp-lon" value="${s}" />
        </div>
        `:`
        <div class="em-field-group">
          <label class="em-label">Location (Latitude / Longitude)</label>
          <div class="em-latlon-row">
            <input type="number" id="inp-lat" class="em-input" placeholder="e.g. 23.2505"
              step="0.0001" min="-90" max="90" value="${n}" />
            <input type="number" id="inp-lon" class="em-input" placeholder="e.g. 77.4065"
              step="0.0001" min="-180" max="180" value="${s}" />
          </div>
          <div class="em-hint">Enter decimal degrees. Latitude: -90 to 90, Longitude: -180 to 180</div>
        </div>
        `}

        <div class="em-field-group">
          <label class="em-label">Date Range</label>
          <div class="em-date-row">
            <div>
              <div class="em-date-label">From</div>
              <input type="date" id="inp-from" class="em-input" value="${t}" min="${t}" />
            </div>
            <div>
              <div class="em-date-label">To</div>
              <input type="date" id="inp-to" class="em-input" value="${i}" min="${t}" />
            </div>
          </div>
          <div class="em-hint">Max 90 days. For ${a.label}: ${a.defaultWindowDays}-day window recommended.</div>
        </div>

        <div id="em-error" class="em-error" style="display:none"></div>

        <button class="btn btn-primary em-scan-btn" id="btn-scan">
          Find Best Windows (costs 5 pts)
        </button>
      </section>

      <!-- Results placeholder -->
      <div id="em-results"></div>

    </div>
  `,Fn(),ya(e),Hn(e,a)}function Hn(e,a){const t=e.querySelector("#btn-scan");t&&t.addEventListener("click",async()=>{const i=document.getElementById("em-error");i.style.display="none";const n=document.getElementById("inp-lat").value,s=document.getElementById("inp-lon").value,r=document.getElementById("inp-from").value,o=document.getElementById("inp-to").value,d=parseFloat(n),l=parseFloat(s);if(!Number.isFinite(d)||d<-90||d>90){O(i,"Latitude must be between -90 and 90.");return}if(!Number.isFinite(l)||l<-180||l>180){O(i,"Longitude must be between -180 and 180.");return}if(!r||!o){O(i,"Please select a date range.");return}const m=new Date(r),u=new Date(o+"T23:59:59");if(u<=m){O(i,"'To' date must be after 'From' date.");return}const v=(u.getTime()-m.getTime())/864e5;if(v>90){O(i,"Date range cannot exceed 90 days.");return}t.disabled=!0,t.textContent="Scanning…";const c=document.getElementById("em-results");c.innerHTML=`
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
        <p style="margin-top:var(--space-3);color:var(--color-text-secondary)">
          Scanning ${Math.ceil(v)} days for auspicious windows…
        </p>
      </div>
    `;try{const p=await ea({lat:d,lon:l,purpose:a.slug,kundali_id:K??void 0,from:m.toISOString(),to:u.toISOString(),top_n:20});p.ok?Rn(c,p.data,a):(O(i,p.data?.error??"Scan failed. Please try again."),c.innerHTML="")}catch{O(i,"Connection error. Please try again."),c.innerHTML=""}finally{t.disabled=!1,t.textContent="Find Best Windows (costs 5 pts)"}})}function O(e,a){e.textContent=a,e.style.display="block"}function Rn(e,a,t){const i=a.windows??[];if(i.length===0){e.innerHTML=`
      <div class="em-no-results">
        <p>No auspicious windows found in this range.</p>
        <p>Try a wider date range or different location.</p>
      </div>
    `;return}const n=new Map;for(const r of i){const o=r.timestamp.slice(0,10);n.has(o)||n.set(o,[]),n.get(o).push(r)}const s=Array.from(n.entries()).map(([r,o])=>{const d=new Date(r+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}),l=o[0],m=o.map(u=>{const v=new Date(u.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),c=u.tara?On(u.tara.beneficence):"",p=[u.panchaka_active?'<span class="em-flag em-flag-warn">⚠ Panchaka</span>':"",u.ganda_moola?'<span class="em-flag em-flag-warn">⚠ Ganda Moola</span>':"",u.dishashool_direction?`<span class="em-flag em-flag-warn">⚠ Dishashool: ${u.dishashool_direction}</span>`:"",t.auspiciousHoras.includes(u.hora_lord)?`<span class="em-flag em-flag-good">✓ ${u.hora_lord} hora</span>`:""].filter(Boolean).join(" ");return`
        <div class="em-window-row">
          <div class="em-window-time">${v} IST</div>
          <div class="em-window-score">
            <div class="em-score-bar" style="width:${Math.min(u.score,100)}%"></div>
            <span>${u.score.toFixed(0)}/100</span>
          </div>
          <div class="em-window-detail">
            <span class="em-hora-chip">${u.hora_lord} hora</span>
            <span class="em-nak">${u.nakshatra}</span>
            ${u.tara?`<span class="em-tara ${c}">Tara ${u.tara.number}: ${u.tara.name}</span>`:""}
          </div>
          ${p?`<div class="em-flags">${p}</div>`:""}
        </div>
      `}).join("");return`
      <div class="em-day-card">
        <div class="em-day-header">
          <span class="em-day-date">${d}</span>
          <span class="em-day-best-score" style="color:var(--purpose-color)">${l.score.toFixed(0)}/100</span>
        </div>
        <div class="em-windows">${m}</div>
      </div>
    `}).join("");e.innerHTML=`
    <section class="em-results-section">
      <div class="em-results-header">
        <div class="em-results-title">Top ${i.length} Windows Found</div>
        <div class="em-results-meta">
          Scanned ${a.total_sampled??"—"} time slots ·
          Wallet: ${a.wallet_balance??"—"} pts remaining
        </div>
      </div>
      <div class="em-day-cards">${s}</div>
    </section>
  `}function On(e){return e==="benefic"?"em-tara-good":e==="malefic"?"em-tara-bad":"em-tara-neutral"}function Kn(e){return`
    <div class="screen event-muhurta-screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>${e.emoji} ${e.label}</h2></div>
      </header>
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
      </div>
    </div>
  `}function ya(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{E(K?`/birth-chart?id=${K}`:"/dashboard")})}function Fn(){const e="event-muhurta-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
/* ── Event Muhurta Screen ── */
.event-muhurta-screen .screen-header { display:flex; align-items:center; gap:var(--space-3); }
.event-muhurta-screen .subtitle { font-size:var(--font-size-xs); color:var(--color-text-secondary); }

/* Notes */
.em-notes { margin:var(--space-3) var(--space-4); padding:var(--space-3); background:var(--color-surface-2); border-radius:var(--radius-md); border-left:3px solid var(--purpose-color, var(--color-primary)); }
.em-notes-title { font-size:var(--font-size-xs); font-weight:700; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:.04em; margin-bottom:var(--space-2); }
.em-notes-list { margin:0; padding-left:var(--space-4); display:flex; flex-direction:column; gap:4px; }
.em-notes-list li { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-auspicious-horas { margin-top:var(--space-2); font-size:var(--font-size-xs); display:flex; align-items:center; flex-wrap:wrap; gap:4px; }
.hora-chip { font-size:10px; font-weight:700; padding:2px 6px; border-radius:99px; background:var(--color-surface-1); border:1px solid var(--color-border); }

/* Form */
.em-form { margin:var(--space-2) var(--space-4); padding:var(--space-4); background:var(--color-surface-1); border:1px solid var(--color-border); border-radius:var(--radius-md); display:flex; flex-direction:column; gap:var(--space-3); }
.em-form-title { font-size:var(--font-size-sm); font-weight:700; color:var(--color-text-primary); }
.em-field-group { display:flex; flex-direction:column; gap:var(--space-1); }
.em-label { font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); }
.em-input { padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-sm); font-size:var(--font-size-sm); background:var(--color-surface-2); color:var(--color-text-primary); width:100%; box-sizing:border-box; }
.em-input:focus { outline:none; border-color:var(--purpose-color,var(--color-primary)); box-shadow:0 0 0 2px color-mix(in srgb,var(--purpose-color,var(--color-primary)) 20%,transparent); }
.em-hint { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-latlon-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--space-2); }
.em-date-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--space-2); }
.em-latlon-row > *, .em-date-row > * { min-width:0; }
.em-date-row input[type="date"] { min-width:0; max-width:100%; }
.em-date-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:2px; }
.em-location-confirmed { font-size:var(--font-size-xs); color:var(--color-text-secondary); padding:var(--space-2); background:color-mix(in srgb,var(--purpose-color,#16a34a) 8%,var(--color-surface-2)); border-radius:var(--radius-sm); border:1px solid color-mix(in srgb,var(--purpose-color,#16a34a) 30%,transparent); }
.em-error { color:var(--error-text); font-size:var(--font-size-sm); padding:var(--space-2); }
.em-scan-btn { width:100%; margin-top:var(--space-2); }

/* Results */
.em-results-section { margin:var(--space-2) var(--space-4) var(--space-8); }
.em-results-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:var(--space-3); }
.em-results-title { font-size:var(--font-size-sm); font-weight:700; }
.em-results-meta { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-day-cards { display:flex; flex-direction:column; gap:var(--space-3); }
.em-day-card { border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden; }
.em-day-header { display:flex; justify-content:space-between; align-items:center; padding:var(--space-2) var(--space-3); background:var(--color-surface-2); border-bottom:1px solid var(--color-border); }
.em-day-date { font-size:var(--font-size-sm); font-weight:700; }
.em-day-best-score { font-size:var(--font-size-sm); font-weight:700; }
.em-windows { display:flex; flex-direction:column; }
.em-window-row { padding:var(--space-2) var(--space-3); border-bottom:1px solid var(--color-border); display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-2); }
.em-window-row:last-child { border-bottom:none; }
.em-window-time { font-size:var(--font-size-sm); font-weight:600; min-width:70px; }
.em-window-score { display:flex; align-items:center; gap:var(--space-1); min-width:100px; }
.em-score-bar { height:4px; background:var(--purpose-color,var(--color-primary)); border-radius:2px; }
.em-window-score span { font-size:var(--font-size-xs); font-weight:700; }
.em-window-detail { display:flex; flex-wrap:wrap; gap:4px; align-items:center; flex:1; }
.em-hora-chip { font-size:var(--font-size-xs); padding:2px 6px; background:var(--color-surface-2); border-radius:99px; font-weight:600; }
.em-nak { font-size:var(--font-size-xs); color:var(--color-text-secondary); }
.em-tara { font-size:var(--font-size-xs); padding:1px 5px; border-radius:4px; }
.em-tara-good { background:rgba(22,163,74,0.12); color:#16a34a; }
.em-tara-bad { background:rgba(220,38,38,0.12); color:#dc2626; }
.em-tara-neutral { background:var(--color-surface-2); color:var(--color-text-secondary); }
.em-flags { width:100%; display:flex; flex-wrap:wrap; gap:4px; margin-top:2px; }
.em-flag { font-size:10px; padding:1px 5px; border-radius:4px; font-weight:600; }
.em-flag-warn { background:rgba(245,158,11,0.15); color:#d97706; }
.em-flag-good { background:rgba(22,163,74,0.12); color:#16a34a; }
.em-no-results { margin:var(--space-4); padding:var(--space-6); text-align:center; color:var(--color-text-secondary); border:1px dashed var(--color-border); border-radius:var(--radius-md); }
`,document.head.appendChild(a)}class jn{routes=new Map;constructor(){this.routes.set("/home",it),this.routes.set("/pricing",lt),this.routes.set("/features",dt),this.routes.set("/blog",vt),this.routes.set("/contact",mt),this.routes.set("/testimonials",at),this.routes.set("/login",bt),this.routes.set("/dashboard",ht),this.routes.set("/muhurta",$t),this.routes.set("/kundali",Et),this.routes.set("/kundali-form",Pt),this.routes.set("/kp-query",At),this.routes.set("/scanner",qt),this.routes.set("/wallet",Ht),this.routes.set("/referral",Rt),this.routes.set("/admin",Mt),this.routes.set("/birth-chart",Yt),this.routes.set("/muhurta-dashboard",tn),this.routes.set("/dasha-timeline",kn),this.routes.set("/kp-sublords",An),this.routes.set("/event-muhurta",_n)}currentRoute(){return window.location.hash.slice(1)||"/home"}basePath(a){return a.split("?")[0]??a}async route(){const a=this.currentRoute(),t=this.routes.get(this.basePath(a));if(window.scrollTo(0,0),t)try{await t()}catch(i){console.error(`Route handler error for ${a}:`,i)}else{const i=this.routes.get("/home");i&&await i()}}}function E(e){window.location.hash=e}window.addEventListener("error",e=>{const a=e.error?.message||e.message||"Unknown error";console.error("Global error:",a,e),wa({type:"uncaught-error",message:a,filename:e.filename,lineno:e.lineno,stack:e.error?.stack}),x("An error occurred. Please refresh.",!0)});window.addEventListener("unhandledrejection",e=>{const a=e.reason?.message||String(e.reason)||"Unhandled promise rejection";console.error("Unhandled rejection:",a,e.reason),wa({type:"unhandled-rejection",message:a,stack:e.reason?.stack})});async function wa(e){try{await fetch("/api/log-error",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{console.log("Error log endpoint not available")})}catch{}}async function Vn(){if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",e),e.addEventListener("updatefound",()=>{const a=e.installing;a?.addEventListener("statechange",()=>{a.state==="installed"&&navigator.serviceWorker.controller&&x("Update available — refresh to get the latest version",!1)})})}catch(e){console.error("Service Worker registration failed:",e)}}async function Qe(){Sa(),await xa(),Vn(),window.toggleTheme=Ea,window.toggleLanguage=$a;const e=new jn;window.addEventListener("hashchange",async()=>{await e.route(),Ee()}),window.addEventListener("i18n-language-changed",()=>{Ee()}),await e.route(),Ee(),console.log("OccultViision PWA initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Qe):Qe();
