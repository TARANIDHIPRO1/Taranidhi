(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=a(r);fetch(r.href,s)}})();function E(){return document.getElementById("app")}function L(e){e.innerHTML=""}function k(e,t=!1){let a=document.getElementById("ov-toast");a||(a=document.createElement("div"),a.id="ov-toast",document.body.appendChild(a)),a.textContent=e,a.className=`ov-toast show ${t?"error":"ok"}`,setTimeout(()=>a.classList.remove("show"),3e3)}const Ye={},Qe=Ye?.VITE_API_BASE??"";let ve=localStorage.getItem("ov_session");function Ze(e){ve=e,e?localStorage.setItem("ov_session",e):localStorage.removeItem("ov_session")}async function T(e,t={}){const a={...t.headers??{}};ve&&(a.Authorization=`Bearer ${ve}`),t.body&&typeof t.body=="string"&&(a["Content-Type"]="application/json");const n=await fetch(`${Qe}${e}`,{...t,headers:a});let r;try{r=await n.json()}catch{r=null}return{ok:n.ok,status:n.status,data:r}}const Xe=e=>T("/auth/request-otp",{method:"POST",body:JSON.stringify({phone_number:e})}),et=(e,t,a)=>T("/auth/verify-otp",{method:"POST",body:JSON.stringify({phone_number:e,code:t,fingerprint_hash:a})}),Q=()=>T("/kundali"),tt=e=>T("/kundali",{method:"POST",body:JSON.stringify(e)}),at=e=>T(`/kundali/${e}`,{method:"DELETE"}),he=(e,t,a,n)=>{const r=new URLSearchParams({lat:String(e),lon:String(t)});return a&&r.set("purpose",a),n!==void 0&&r.set("kundali_id",String(n)),T(`/muhurta/now?${r}`)},Be=e=>{const t=new URLSearchParams({lat:String(e.lat),lon:String(e.lon)});return e.purpose&&t.set("purpose",e.purpose),e.kundali_id!==void 0&&t.set("kundali_id",String(e.kundali_id)),e.from&&t.set("from",e.from),e.to&&t.set("to",e.to),e.top_n!==void 0&&t.set("top_n",String(e.top_n)),T(`/muhurta/scan?${t}`)},le=e=>T(`/kundali/${e}/chart`),rt=e=>T(`/kp/chart/${e}`),nt=(e,t)=>T("/kp/query",{method:"POST",body:JSON.stringify({kundali_id:e,activity_slug:t})}),st=()=>T("/kp/activities"),ot=()=>T("/wallet/balance"),it=()=>T("/referral/code"),dt=()=>T("/admin/stats"),Ee=he;function lt(){const e=E();L(e),e.innerHTML=`
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
  `;let t="";const a=document.getElementById("phone"),n=document.getElementById("btn-otp"),r=document.getElementById("step-phone"),s=document.getElementById("step-otp"),o=document.getElementById("otp-code"),i=document.getElementById("btn-verify"),u=document.getElementById("btn-back"),d=document.getElementById("login-loading");n.addEventListener("click",async()=>{if(t=a.value.trim(),!/^\d{10}$/.test(t)){k("Enter a valid 10-digit phone number",!0);return}n.setAttribute("disabled",""),d.classList.remove("hidden");const l=await Xe(t);d.classList.add("hidden"),n.removeAttribute("disabled"),l.ok?(r.classList.add("hidden"),s.classList.remove("hidden"),o.focus(),k("OTP sent!")):k(l.data?.error??"Failed to send OTP",!0)}),u.addEventListener("click",()=>{s.classList.add("hidden"),r.classList.remove("hidden"),a.focus()}),i.addEventListener("click",async()=>{const l=o.value.trim();if(!/^\d{4,6}$/.test(l)){k("Enter the OTP code",!0);return}i.setAttribute("disabled",""),d.classList.remove("hidden");const c=`pwa-${navigator.userAgent.slice(0,40)}-${screen.width}x${screen.height}`,m=await et(t,l,c);d.classList.add("hidden"),i.removeAttribute("disabled"),m.ok&&m.data?.session_token?(Ze(m.data.session_token),k("Logged in!"),h("/dashboard")):k(m.data?.error??"Verification failed",!0)})}async function ct(){const e=E();L(e),e.innerHTML=`
    <div class="screen ti-screen">
      <div class="ti-loading">
        <div class="ti-logo">OCCULTVIISION</div>
        <div class="ti-tagline">Loading your time intelligence…</div>
      </div>
    </div>
  `;const t=await Q(),n=(t.ok?t.data.kundalis??[]:[])[0]??null;n?pt(e,n):ut(e)}function ut(e){e.innerHTML=`
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
  `,document.getElementById("btn-create-chart").addEventListener("click",()=>h("/kundali/new")),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),window.location.reload()})}async function pt(e,t,a){const n=await le(t.id),r=n.ok?n.data.chart:null,s=await he(23.2585,77.402,void 0,t.id),o=s.ok?s.data:null,i=r?.ascendant,u=r?.dasha,d=r?.janmaNakshatra,l=r?.tara,c=u?new Date(u.maha.end).getFullYear():"—",m=u?vt(new Date(u.antar.end)):"—",v=o?.hora?.lord??"—",p=o?.score??"—",g=o?.hora?.end?mt(new Date(o.hora.end)):"—",x=l?.beneficence==="benefic"?"#4ade80":l?.beneficence==="malefic"?"#f87171":"#fbbf24";l&&`${l.name}${l.number}`,e.innerHTML=`
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
          <div class="ti-live-value">${v}</div>
          <div class="ti-live-key">Current Hora</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${p}/100</div>
          <div class="ti-live-key">Muhurta Score</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value" style="color:${x}">${l?.number??"—"}</div>
          <div class="ti-live-key">Tara Now</div>
        </div>
        <div class="ti-live-divider"></div>
        <div class="ti-live-item">
          <div class="ti-live-value">${g}</div>
          <div class="ti-live-key">Hora Until</div>
        </div>
      </div>

      <!-- Birth Profile Card -->
      <div class="ti-section-label">YOUR TIME PROFILE</div>
      <div class="ti-profile-card" id="btn-open-chart">
        <div class="ti-profile-left">
          <div class="ti-profile-name">${t.label??"My Chart"}</div>
          <div class="ti-profile-lagna">
            ${i?`${i.rashiName} Ascendant · ${i.nakName} Pada ${i.nakPada}`:"—"}
          </div>
          <div class="ti-profile-nak">
            Moon: ${d?`${d.name} · Lord ${d.lord}`:"—"}
          </div>
        </div>
        <div class="ti-profile-right">
          <div class="ti-dasha-block">
            <div class="ti-dasha-lord">${u?.maha.lord??"—"}</div>
            <div class="ti-dasha-label">Maha Dasha · ends ${c}</div>
          </div>
          <div class="ti-dasha-block" style="margin-top:6px">
            <div class="ti-dasha-lord ti-dasha-antar">${u?.antar.lord??"—"}</div>
            <div class="ti-dasha-label">Antar Dasha · until ${m}</div>
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
  `,document.getElementById("btn-open-chart").addEventListener("click",()=>{h(`/kundali/${t.id}/chart`)}),e.querySelectorAll("[data-route]").forEach(y=>{y.addEventListener("click",()=>h(y.dataset.route))}),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),window.location.reload()})}function vt(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function mt(e){return e.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0})}let W=null;function Pe(){if(W)return W;const e=localStorage.getItem("ov_location");if(e)try{return W=JSON.parse(e),W}catch{}return null}function bt(e){W=e,localStorage.setItem("ov_location",JSON.stringify(e))}function _e(){return new Promise((e,t)=>{if(!navigator.geolocation){t(new Error("Geolocation not supported"));return}navigator.geolocation.getCurrentPosition(a=>{const n={lat:a.coords.latitude,lon:a.coords.longitude};bt(n),e(n)},a=>t(a),{enableHighAccuracy:!1,timeout:1e4})})}const gt=[{value:"general",label:"General"},{value:"travel",label:"Travel"},{value:"finance",label:"Finance"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"relationship",label:"Relationship"},{value:"career",label:"Career"},{value:"spiritual",label:"Spiritual"}];function ht(){const e=E();L(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${gt.map(a=>`<option value="${a.value}">${a.label}</option>`).join("")}
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
  `,document.getElementById("btn-back").addEventListener("click",()=>h("/dashboard"));const t=Pe();t&&(document.getElementById("lat").value=String(t.lat),document.getElementById("lon").value=String(t.lon)),document.getElementById("btn-gps").addEventListener("click",async()=>{try{const a=await _e();document.getElementById("lat").value=String(a.lat),document.getElementById("lon").value=String(a.lon),k("Location updated")}catch{k("Could not get location",!0)}}),Q().then(a=>{if(a.ok&&Array.isArray(a.data?.kundalis)){const n=document.getElementById("kundali-select");for(const r of a.data.kundalis){const s=document.createElement("option");s.value=String(r.id),s.textContent=r.label,n.appendChild(s)}}}),document.getElementById("btn-check").addEventListener("click",async()=>{const a=Number(document.getElementById("lat").value),n=Number(document.getElementById("lon").value);if(!Number.isFinite(a)||!Number.isFinite(n)){k("Set your location first",!0);return}const r=document.getElementById("purpose").value,s=document.getElementById("kundali-select").value,o=s?Number(s):void 0,i=document.getElementById("muhurta-loading"),u=document.getElementById("muhurta-result");i.classList.remove("hidden"),u.classList.add("hidden");const d=await he(a,n,r,o);if(i.classList.add("hidden"),!d.ok){k(d.data?.error??"Request failed",!0);return}const l=d.data;u.classList.remove("hidden"),u.innerHTML=ft(l)})}function ft(e){const t=e.score>=70?"score-good":e.score>=40?"score-mid":"score-bad",a=(e.layers??[]).map(r=>`<div class="layer"><strong>${r.name}</strong>: ${r.detail} (${r.impact})</div>`).join(""),n=[];if(e.panchaka?.active&&n.push(`⚠️ Panchaka Dosha: ${e.panchaka.note}`),e.ganda_moola?.active&&n.push(`⚠️ Ganda Moola: ${e.ganda_moola.note}`),e.combustion?.length)for(const r of e.combustion)n.push(`🔥 ${r.planet} combust (${r.angular_distance.toFixed(1)}°)`);return`
    <div class="muhurta-card">
      <div class="score-circle ${t}">${e.score}</div>
      <div class="verdict">${e.verdict??""}</div>
      <div class="hora-info">
        <span>Hora: <strong>${e.hora_lord??"?"}</strong></span>
        <span>Nakshatra: <strong>${e.nakshatra??"?"}</strong></span>
      </div>
      ${e.tara?`<div class="tara">Tara: ${e.tara.name} (#${e.tara.number}) — ${e.tara.beneficence==="benefic"?"✅ Benefic":e.tara.beneficence==="neutral"?"⚖️ Neutral (context-dependent)":"❌ Malefic"}</div>`:""}
      ${e.dishashool?`<div class="dishashool">Dishashool: ${e.dishashool.direction}</div>`:""}
      <div class="layers">${a}</div>
      ${n.length?`<div class="warnings">${n.join("<br/>")}</div>`:""}
      <div class="hora-window">Window: ${Le(e.hora_start)} – ${Le(e.hora_end)}</div>
    </div>
  `}function Le(e){if(!e)return"?";try{return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return e}}async function yt(){const e=E();L(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>h("/dashboard"));const t=document.getElementById("btn-add"),a=document.getElementById("btn-add-empty");t.addEventListener("click",()=>h("/kundali-form")),a&&a.addEventListener("click",()=>h("/kundali-form"));try{const n=await Q(),r=document.getElementById("loading"),s=document.getElementById("list"),o=document.getElementById("empty"),i=n.ok&&Array.isArray(n.data?.kundalis)?n.data.kundalis:[];r.style.display="none",i.length===0?o.style.display="block":(s.style.display="block",kt(s,i))}catch(n){console.error("Failed to load kundalis:",n),k("Failed to load kundalis",!0)}}function kt(e,t){e.innerHTML=t.map(a=>`
    <div class="kundali-item" data-id="${a.id}">
      <div class="kundali-info">
        <h3>${a.label||"Unnamed Kundali"}</h3>
        <p>
          ${new Date(a.birth_date).toLocaleDateString("en-IN")}
          ${a.birth_time?` at ${a.birth_time}`:""}
        </p>
      </div>
      <div class="kundali-actions">
        <button class="btn btn-secondary btn-small view-btn" data-id="${a.id}">
          View Chart
        </button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${a.id}">
          Delete
        </button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".view-btn").forEach(a=>{a.addEventListener("click",n=>{const r=n.target.dataset.id;r&&h(`/birth-chart?id=${r}`)})}),e.querySelectorAll(".delete-btn").forEach(a=>{a.addEventListener("click",async n=>{n.stopPropagation();const r=n.target.dataset.id,s=e.querySelector(`[data-id="${r}"]`),o=s?.querySelector("h3")?.textContent||"this kundali";if(confirm(`Delete ${o}? This cannot be undone.`))try{const i=await at(Number(r));i.ok?(k("Kundali deleted"),s?.remove(),e.querySelectorAll(".kundali-item").length===0&&(e.style.display="none",document.getElementById("empty").style.display="block")):k(i.data?.error??"Failed to delete kundali",!0)}catch(i){console.error("Delete error:",i),k("Error deleting kundali",!0)}})})}const xt=[{value:"Asia/Kolkata",label:"India (IST)"},{value:"Asia/Bangkok",label:"Thailand (ICT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Australia/Sydney",label:"Sydney (AEDT)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"America/New_York",label:"New York (EST/EDT)"},{value:"America/Los_Angeles",label:"Los Angeles (PST/PDT)"},{value:"America/Chicago",label:"Chicago (CST/CDT)"}];async function wt(){const e=E();L(e),e.innerHTML=`
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
          <div id="place-confirmed" style="display:none; margin-top:4px; font-size:0.78rem; color:#7a4800;"></div>
        </div>

        <div class="form-group">
          <label>Coordinates <span style="font-size:0.75rem; color:#7a4800;">(auto-filled from city search)</span></label>
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
            ${xt.map(f=>`<option value="${f.value}">${f.label}</option>`).join("")}
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

      <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
    </div>
  `;const t=document.getElementById("form"),a=document.getElementById("name"),n=document.getElementById("birth-date"),r=document.getElementById("birth-time"),s=document.getElementById("lat"),o=document.getElementById("lon"),i=document.getElementById("timezone"),u=document.getElementById("btn-gps"),d=document.getElementById("btn-search-place"),l=document.getElementById("place-search"),c=document.getElementById("place-results"),m=document.getElementById("place-confirmed"),v=document.getElementById("btn-cancel"),p=document.getElementById("error-box"),g=Pe();g&&(s.value=String(g.lat),o.value=String(g.lon)),i.value="Asia/Kolkata";async function x(){const f=l.value.trim();if(f){d.textContent="⏳",d.setAttribute("disabled","true"),c.style.display="none",c.innerHTML="";try{const b=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(f)}&format=json&limit=10&addressdetails=1&countrycodes=in`,$=await(await fetch(b,{headers:{"Accept-Language":"en,hi"}})).json();if(!$.length){const S=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(f+" India")}&format=json&limit=10&addressdetails=1`,I=await(await fetch(S,{headers:{"Accept-Language":"en,hi"}})).json();if(!I.length){c.innerHTML=`<div style="padding:8px;color:#7a4800;font-size:0.82rem;">
            Jagah nahi mili. Try karein:<br>
            • Poora naam likhein (e.g. "Raghogarh Madhya Pradesh")<br>
            • Tehsil ya district add karein (e.g. "Mendori Raisen")<br>
            • Nearest town ka naam try karein
          </div>`,c.style.display="block";return}y(I);return}y($)}catch{c.innerHTML='<div style="padding:8px;color:#cc0000;font-size:0.82rem;">Search failed. Manually latitude/longitude fill karein.</div>',c.style.display="block"}finally{d.textContent="🔍",d.removeAttribute("disabled")}}}function y(f){c.innerHTML=f.map((b,w)=>{const $=b.address||{},S=[],C=$.village||$.hamlet||$.suburb||$.town||$.city||$.municipality||b.display_name.split(",")[0],I=$.county||$.district||$.state_district||"",M=$.state||"";C&&S.push(C.trim()),I&&I!==C&&S.push(I.trim()),M&&S.push(M.trim());const z=S.length>=2?S.join(", "):b.display_name.split(",").slice(0,4).join(", ");return`<div class="place-result-item" data-i="${w}" data-lat="${b.lat}" data-lon="${b.lon}" data-name="${z}"
        style="padding:8px 12px;cursor:pointer;font-size:0.82rem;border-bottom:1px solid #E8C89A;color:#3a1a00;"
        onmouseover="this.style.background='#FFF0DC'" onmouseout="this.style.background=''">${z}</div>`}).join(""),c.style.display="block",c.querySelectorAll(".place-result-item").forEach(b=>{b.addEventListener("click",()=>{const w=parseFloat(b.dataset.lat),$=parseFloat(b.dataset.lon),S=b.dataset.name;s.value=w.toFixed(6),o.value=$.toFixed(6),l.value=S,c.style.display="none",m.textContent=`✓ ${S} (${w.toFixed(4)}°N, ${$.toFixed(4)}°E)`,m.style.display="block"})})}d.addEventListener("click",f=>{f.preventDefault(),x()}),l.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),x())}),u.addEventListener("click",async f=>{f.preventDefault();try{const b=await _e();s.value=String(b.lat),o.value=String(b.lon),k("Location updated")}catch{k("Could not get location",!0)}}),v.addEventListener("click",f=>{f.preventDefault(),h("/kundali")}),t.addEventListener("submit",async f=>{f.preventDefault(),p.style.display="none";const b=a.value.trim(),w=n.value,$=r.value,S=parseFloat(s.value),C=parseFloat(o.value),I=i.value;if(!b||!w||!$||!I||isNaN(S)||isNaN(C)){p.textContent="Please fill in all fields",p.style.display="block";return}if(S<-90||S>90){p.textContent="Latitude must be between -90 and 90",p.style.display="block";return}if(C<-180||C>180){p.textContent="Longitude must be between -180 and 180",p.style.display="block";return}const M=document.getElementById("btn-submit");M.disabled=!0,M.textContent="Creating...";try{const[z,Z,ke]=w.split("-"),[xe,we]=$.split(":"),Ca=`${z}-${Z}-${ke}T${xe}:${we}:00`,Ma=new Intl.DateTimeFormat("en-US",{timeZone:I,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),$e=new Date(`${z}-${Z}-${ke}T${xe}:${we}:00`),F=new Intl.DateTimeFormat("en-US",{timeZone:I,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date),We=new Date(parseInt(F.find(D=>D.type==="year")?.value||"2000"),parseInt(F.find(D=>D.type==="month")?.value||"1")-1,parseInt(F.find(D=>D.type==="day")?.value||"1"),parseInt(F.find(D=>D.type==="hour")?.value||"0"),parseInt(F.find(D=>D.type==="minute")?.value||"0"),parseInt(F.find(D=>D.type==="second")?.value||"0")),Ge=$e.getTime()-We.getTime(),Je=new Date($e.getTime()-Ge).toISOString().split(".")[0],Se=await tt({label:b,birth_date:Je,latitude:S,longitude:C,timezone:I});if(Se.ok)k("Kundali created successfully"),h("/kundali");else{const D=Se.data?.error||"Failed to create kundali";p.textContent=D,p.style.display="block",M.disabled=!1,M.textContent="Create Kundali"}}catch(z){console.error("Create error:",z),p.textContent="Error creating kundali",p.style.display="block",M.disabled=!1,M.textContent="Create Kundali"}}),document.getElementById("btn-back").addEventListener("click",()=>h("/kundali"))}async function $t(){const e=E();L(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>KP Query Window</h2>
      </header>

      <div class="muhurta-form">
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          ℹ️ KP Query is valid for <strong>same-day only</strong> (current moment). Use your question as context.
        </div>

        <form id="form">
          <div class="form-group">
            <label for="kundali">Select Kundali *</label>
            <select id="kundali" required>
              <option value="">-- Loading kundalis --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="activity">Your Question / Activity *</label>
            <select id="activity" required>
              <option value="">-- Select from list --</option>
            </select>
          </div>

          <div class="form-group">
            <label>Current Time (auto-filled)</label>
            <input id="query-time" type="text" disabled style="background-color: var(--color-bg-secondary);" />
          </div>

          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-8);">
            <button type="button" class="btn btn-secondary" id="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit">
              Check Now
            </button>
          </div>
        </form>

        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>

        <div id="result" style="display: none; margin-top: var(--space-6);"></div>
      </div>
    </div>
  `;const t=document.getElementById("form"),a=document.getElementById("kundali"),n=document.getElementById("activity"),r=document.getElementById("query-time"),s=document.getElementById("btn-cancel"),o=document.getElementById("error-box"),i=document.getElementById("result"),u=new Date;r.value=u.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"});try{const d=await Q(),l=d.ok&&Array.isArray(d.data?.kundalis)?d.data.kundalis:[];if(l.length===0){k("Please create a kundali first",!0),h("/kundali-form");return}a.innerHTML=l.map(c=>`<option value="${c.id}">${c.label||"Unnamed"}</option>`).join("")}catch(d){console.error("Failed to load kundalis:",d),k("Failed to load kundalis",!0)}try{const d=await st(),l=d.ok&&Array.isArray(d.data?.activities)?d.data.activities:[];n.innerHTML='<option value="">-- Select --</option>'+l.map(c=>`<option value="${c.code}">${c.name}</option>`).join("")}catch(d){console.error("Failed to load activities:",d),k("Failed to load activities",!0)}s.addEventListener("click",d=>{d.preventDefault(),h("/dashboard")}),t.addEventListener("submit",async d=>{d.preventDefault(),o.style.display="none",i.style.display="none";const l=parseInt(a.value),c=n.value;if(!l||!c){o.textContent="Please select both kundali and activity",o.style.display="block";return}const m=document.getElementById("btn-submit");m.disabled=!0,m.textContent="Checking...";try{const v=await nt(l,c);if(v.ok){const p=v.data;i.innerHTML=`
          <div class="result-box">
            <div style="text-align: center; margin-bottom: var(--space-6);">
              <div style="font-size: 2.5rem; font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${p.verdict==="PROMISED"?"✅":"❌"}
              </div>
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${p.verdict}
              </div>
              <div style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
                Confidence: <strong>${p.confidence||0}%</strong>
              </div>
            </div>

            <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
              <h3 style="margin-bottom: var(--space-3);">Analysis</h3>
              <div style="font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                <p><strong>House:</strong> ${p.house}</p>
                <p><strong>Cusp Nakshatra:</strong> ${p.cusp_nakshatra||"—"}</p>
                <p><strong>Sub-Lord:</strong> ${p.sub_lord||"—"}</p>
                <p><strong>Dasha Status:</strong> ${p.dasha_status||"—"}</p>
                <p><strong>Tarabala:</strong> ${p.tarabala||"—"}</p>
                <p><strong>Panchaka:</strong> ${p.panchaka?"⚠️ Active":"✓ Absent"}</p>
                ${p.ganda_moola?"<p><strong>Ganda Moola:</strong> ⚠️ Active</p>":""}
              </div>
            </div>

            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
              Query time: ${new Date(p.timestamp).toLocaleTimeString("en-IN")}
            </div>
          </div>
        `,i.style.display="block"}else{const p=v.data?.error||"Failed to query KP";o.textContent=p,o.style.display="block"}}catch(v){console.error("Query error:",v),o.textContent="Error processing query",o.style.display="block"}finally{m.disabled=!1,m.textContent="Check Now"}}),document.getElementById("btn-back").addEventListener("click",()=>h("/dashboard"))}async function St(){const e=E();L(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Admin Panel</h2>
      </header>

      <div class="dashboard-content">
        <div id="loading" class="text-center" style="padding: var(--space-8);">
          <div class="spinner"></div>
          <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">Loading stats...</p>
        </div>

        <div id="stats" style="display: none;">
          <div class="result-grid">
            <div class="result-item">
              <div class="result-item-label">Queries (24h)</div>
              <div class="result-item-value" id="queries-24h">0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Active Users</div>
              <div class="result-item-value" id="active-users">0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Revenue (Est.)</div>
              <div class="result-item-value" id="revenue" style="font-size: var(--font-size-lg);">₹0</div>
            </div>
            <div class="result-item">
              <div class="result-item-label">Conversion Rate</div>
              <div class="result-item-value" id="conversion">0%</div>
            </div>
          </div>

          <div class="card" style="margin-top: var(--space-6);">
            <h3>Top Activities (24h)</h3>
            <div id="top-activities" style="margin-top: var(--space-4);"></div>
          </div>

          <div class="card" style="margin-top: var(--space-6);">
            <h3>System Health</h3>
            <div id="system-health" style="margin-top: var(--space-4); font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);"></div>
          </div>
        </div>

        <div id="error" style="display: none; margin: var(--space-6); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
      </div>
    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>h("/dashboard"));try{const t=await dt(),a=document.getElementById("loading"),n=document.getElementById("stats"),r=document.getElementById("error");if(!t.ok){r.textContent=t.data?.error||"Failed to load stats",r.style.display="block",a.style.display="none";return}const s=t.data;document.getElementById("queries-24h").textContent=String(s.queries_24h||0),document.getElementById("active-users").textContent=String(s.active_users||0),document.getElementById("revenue").textContent=`₹${(s.revenue_estimate||0).toLocaleString("en-IN")}`,document.getElementById("conversion").textContent=`${(s.conversion_rate||0).toFixed(1)}%`;const o=(s.top_activities||[]).map(u=>`<div style="padding: var(--space-2); border-bottom: 1px solid var(--color-border);">
        <strong>${u.name}</strong>: ${u.count} queries
      </div>`).join("");document.getElementById("top-activities").innerHTML=o||"<p>No data</p>";const i=`
      <p><strong>D1 Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>KV Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>Error Rate (24h):</strong> ${(s.error_rate_pct||0).toFixed(2)}%</p>
      <p><strong>Rate Limit Events (24h):</strong> ${s.rate_limit_events||0}</p>
    `;document.getElementById("system-health").innerHTML=i,a.style.display="none",n.style.display="block"}catch(t){console.error("Admin stats error:",t);const a=document.getElementById("error");a.textContent="Error loading stats",a.style.display="block",document.getElementById("loading").style.display="none"}}const Et=[{value:"travel",label:"Travel"},{value:"marriage",label:"Marriage"},{value:"business",label:"Business"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"general",label:"General"}];async function Lt(){const e=E();L(e),e.innerHTML=`
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
              ${Et.map(v=>`<option value="${v.value}">${v.label}</option>`).join("")}
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

        <div id="error-box" style="display: none; margin: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>

        <div id="results" style="display: none; margin-top: var(--space-6);"></div>
      </div>
    </div>
  `;const t=document.getElementById("form"),a=document.getElementById("kundali"),n=document.getElementById("category"),r=document.getElementById("from-date"),s=document.getElementById("to-date"),o=document.getElementById("top-n"),i=document.getElementById("location"),u=document.getElementById("btn-cancel"),d=document.getElementById("error-box"),l=document.getElementById("results"),c=new Date,m=new Date(c);m.setDate(m.getDate()+30),r.value=c.toISOString().split("T")[0],s.value=m.toISOString().split("T")[0];try{const v=await Q(),p=v.ok&&Array.isArray(v.data?.kundalis)?v.data.kundalis:[];if(p.length===0){k("Please create a kundali first",!0),h("/kundali-form");return}a.innerHTML=p.map(g=>`<option value="${g.id}" data-lat="${g.latitude}" data-lon="${g.longitude}">${g.label||"Unnamed"}</option>`).join(""),a.addEventListener("change",()=>{const g=a.options[a.selectedIndex],x=g.getAttribute("data-lat"),y=g.getAttribute("data-lon");i.value=x&&y?`${x}, ${y}`:""}),a.dispatchEvent(new Event("change"))}catch(v){console.error("Failed to load kundalis:",v),k("Failed to load kundalis",!0)}u.addEventListener("click",v=>{v.preventDefault(),h("/dashboard")}),t.addEventListener("submit",async v=>{v.preventDefault(),d.style.display="none",l.style.display="none";const p=parseInt(a.value),g=n.value,x=r.value,y=s.value,f=parseInt(o.value)||5;if(!p||!g||!x||!y){d.textContent="Please fill all required fields",d.style.display="block";return}if(new Date(x)>new Date(y)){d.textContent="Start date must be before end date",d.style.display="block";return}const b=document.getElementById("btn-submit");b.disabled=!0,b.textContent="Scanning...";try{const w=a.options[a.selectedIndex],$=parseFloat(w.getAttribute("data-lat")||"0"),S=parseFloat(w.getAttribute("data-lon")||"0"),C=await Be({lat:$,lon:S,purpose:g,kundali_id:p,from:x,to:y,top_n:f});if(C.ok){const M=C.data.results||[];M.length===0?l.innerHTML=`
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `:l.innerHTML=`
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${M.length} Auspicious Dates</h3>
              ${M.map((z,Z)=>`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${z.muhurta_pct>70?"#10b981":"#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${Z+1}: ${new Date(z.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${z.muhurta_pct>70?"#d1fae5":"#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${z.muhurta_pct>70?"#047857":"#92400e"}; font-weight: bold;">
                      ${z.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${z.best_time||"All day auspicious"}
                  </p>
                </div>
              `).join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `,l.style.display="block"}else{const I=C.data?.error||"Failed to scan dates";d.textContent=I,d.style.display="block"}}catch(w){console.error("Scan error:",w),d.textContent="Error scanning dates",d.style.display="block"}finally{b.disabled=!1,b.textContent="Scan Dates"}}),document.getElementById("btn-back").addEventListener("click",()=>h("/dashboard"))}async function It(){const e=E();L(e),e.innerHTML=`
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
  `;const t=document.getElementById("btn-back"),a=document.getElementById("btn-refresh"),n=document.getElementById("btn-topup"),r=document.getElementById("balance-amount"),s=document.getElementById("batches-section"),o=document.getElementById("batches-list"),i=document.getElementById("transactions-list"),u=document.getElementById("no-transactions"),d=document.getElementById("error-box");async function l(){d.style.display="none",r.textContent="Loading...",a.disabled=!0,n.disabled=!0;try{const c=await ot();if(c.ok){const m=c.data;r.textContent=String(m.total_points??0);const v=Array.isArray(m.batches)?m.batches:[];v.length>0?(s.style.display="block",o.innerHTML=v.map(g=>{const x=new Date(g.expires_at),y=new Date,f=Math.ceil((x.getTime()-y.getTime())/(24*60*60*1e3)),b=f<=7,w=g.status==="active"?"Active":g.status==="held"?"Held":"Expired";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${b?"#ef4444":"#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${g.source==="free_trial"?"Free Trial":g.source==="subscription"?"Subscription":g.source==="referral"?"Referral":"Top-up"}</strong>
                    <span style="background: ${g.status==="active"?"#d1fae5":g.status==="held"?"#fef3c7":"#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${g.status==="active"?"#047857":g.status==="held"?"#92400e":"#6b7280"}; font-weight: bold;">
                      ${w}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${g.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${x.toLocaleDateString("en-IN")}
                      ${b&&g.status==="active"?` (${f}d left)`:""}
                    </span>
                  </div>
                </div>
              `}).join("")):s.style.display="none";const p=Array.isArray(m.transactions)?m.transactions:[];p.length>0?(u.style.display="none",i.innerHTML=p.slice(0,10).map(g=>{const x=new Date(g.created_at),y=g.type==="debit"?"-":"+",f=g.type==="debit"?"#dc2626":"#10b981",b=g.description||(g.type==="debit"?"Query":"Credit");return`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${f};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${b}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${x.toLocaleDateString("en-IN")} ${x.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${f};">
                      ${y}${g.amount}
                    </div>
                  </div>
                </div>
              `}).join("")):(u.style.display="block",i.innerHTML="")}else{const m=c.data?.error||"Failed to load wallet";d.textContent=m,d.style.display="block",r.textContent="Error"}}catch(c){console.error("Wallet load error:",c),d.textContent="Error loading wallet",d.style.display="block",r.textContent="Error"}finally{a.disabled=!1,n.disabled=!1}}t.addEventListener("click",()=>h("/dashboard")),a.addEventListener("click",l),n.addEventListener("click",()=>{k("Opening payment gateway...",!1),h("/orders")}),l()}async function zt(){const e=E();L(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Referral Program</h2>
      </header>

      <div class="referral-container">
        <!-- Info Banner -->
        <div style="background-color: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          ℹ️ Earn 20% commission on each referral's first purchase. Commissions are held for 30 days (chargeback window), then activated.
        </div>

        <!-- Your Referral Code -->
        <div style="background-color: var(--color-bg); padding: var(--space-6); border-radius: var(--radius-md); border: 2px solid var(--color-primary); margin-bottom: var(--space-6); text-align: center;">
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2);">
            Your Referral Code
          </div>
          <div id="referral-code" style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: var(--color-primary); margin-bottom: var(--space-4); font-family: monospace;">
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
        <div id="error-box" style="display: none; margin-top: var(--space-4); padding: var(--space-4); background-color: rgba(220, 38, 38, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);"></div>
      </div>
    </div>
  `;const t=document.getElementById("btn-back"),a=document.getElementById("btn-copy"),n=document.getElementById("btn-share"),r=document.getElementById("btn-copy-message"),s=document.getElementById("referral-code"),o=document.getElementById("total-earned"),i=document.getElementById("referral-count"),u=document.getElementById("referred-users"),d=document.getElementById("no-referrals"),l=document.getElementById("error-box");let c="";async function m(){l.style.display="none";try{const v=await it();if(v.ok){const p=v.data;c=p.code||"";const g=p.stats||{},x=Array.isArray(p.referred_users)?p.referred_users:[];s.textContent=c||"LOADING...",o.textContent=`₹${g.total_earned??0}`,i.textContent=String(g.referral_count??0),x.length>0?(d.style.display="none",u.innerHTML=x.map(y=>{const f=y.commission_activated_at?new Date(y.commission_activated_at):null,b=y.commission_status==="active"?"Activated":y.commission_status==="held"?"Held":"Pending",w=y.commission_status==="active"?"#10b981":y.commission_status==="held"?"#f59e0b":"#6b7280";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${w};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${y.phone||"Anonymous"}</strong>
                    <span style="background: ${w}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${w}; font-weight: bold;">
                      ${b}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${y.commission_amount||0}</span>
                    <span>${y.referred_at?new Date(y.referred_at).toLocaleDateString("en-IN"):"—"}</span>
                  </div>
                  ${f?`
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${f.toLocaleDateString("en-IN")}
                    </div>
                  `:""}
                </div>
              `}).join("")):(d.style.display="block",u.innerHTML="")}else{const p=v.data?.error||"Failed to load referral data";l.textContent=p,l.style.display="block"}}catch(v){console.error("Referral load error:",v),l.textContent="Error loading referral data",l.style.display="block"}}t.addEventListener("click",()=>h("/dashboard")),a.addEventListener("click",async()=>{if(!c){k("Code not available",!0);return}try{await navigator.clipboard.writeText(c),k("Referral code copied!",!1)}catch{k("Failed to copy code",!0)}}),r.addEventListener("click",async()=>{const v=`Join me on OccultViision! Use my referral code: ${c}

https://www.occultviision.com`;try{await navigator.clipboard.writeText(v),k("Share message copied!",!1)}catch{k("Failed to copy message",!0)}}),n.addEventListener("click",()=>{const v=`Join me on OccultViision! Use my referral code: ${c}

https://www.occultviision.com`,p=`https://wa.me/?text=${encodeURIComponent(v)}`;window.open(p,"_blank")}),m()}function X(e){const t=Math.floor(e),a=(e-t)*60,n=Math.floor(a),r=Math.round((a-n)*60);return`${t}°${n.toString().padStart(2,"0")}'${r.toString().padStart(2,"0")}"`}function Ie(e){try{return new Date(e).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}catch{return e}}function ze(e,t){return`${Ie(e)} – ${Ie(t)}`}function ce(e){return`${e.starLord} → ${e.subLord} → ${e.subSubLord}`}const Tt={Sun:"☉",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"};function Ct(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}function ue(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return e}}async function Mt(e){const t=E();L(t);let a=e;if(!a){const i=window.location.hash,u=i.includes("?")?i.split("?")[1]:"",l=new URLSearchParams(u).get("id");a=l?parseInt(l,10):void 0}if(!a||isNaN(a)){t.innerHTML=`
      <div class="screen">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">←</button>
          <h2>Birth Chart</h2>
        </header>
        <div style="padding: var(--space-6); text-align: center; color: var(--color-danger);">
          No kundali selected. Please choose a kundali first.
          <br/><br/>
          <button class="btn btn-primary" id="btn-list">Go to My Kundalis</button>
        </div>
      </div>
    `,document.getElementById("btn-back").addEventListener("click",()=>h("/kundali")),document.getElementById("btn-list").addEventListener("click",()=>h("/kundali"));return}t.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Birth Chart</h2>
      </header>
      <div style="padding: var(--space-8); text-align: center;">
        <div class="spinner"></div>
        <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">
          Computing chart…
        </p>
      </div>
    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>h("/kundali"));const n=await le(a);if(!n.ok){t.innerHTML=`
      <div class="screen">
        <header class="screen-header">
          <button class="btn-back2" id="btn-back2">←</button>
          <h2>Birth Chart</h2>
        </header>
        <div style="padding: var(--space-6); text-align: center; color: var(--color-danger);">
          Failed to load chart (${n.status}).
          <br/>${n.data?.error??""}
        </div>
      </div>
    `,document.getElementById("btn-back2").addEventListener("click",()=>h("/kundali"));return}const{kundali:r,chart:s,meta:o}=n.data;Dt(t,r,s,o)}function Dt(e,t,a,n){const{ascendant:r,planets:s,cusps:o,dasha:i,janmaNakshatra:u,tara:d}=a;e.innerHTML=`
    <div class="screen birth-chart-screen">

      <!-- ── Header ── -->
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>${t.label??`Kundali #${t.id}`}</h2>
        <button class="btn btn-small" id="btn-kp">KP Query</button>
      </header>

      <!-- ── Birth Details Banner ── -->
      <div class="chart-meta-banner">
        <div class="chart-meta-item">
          <span class="meta-label">Birth</span>
          <span class="meta-val">${ue(t.birth_date)}</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Lat / Lon</span>
          <span class="meta-val">${t.latitude.toFixed(4)}°N, ${t.longitude.toFixed(4)}°E</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Ayanamsa</span>
          <span class="meta-val">${a.ayanamsa} ${X(a.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- ── Ascendant Card ── -->
      <section class="chart-section">
        <h3 class="section-title">Ascendant (Lagna)</h3>
        <div class="asc-card">
          <div class="asc-main">
            <span class="asc-sign">${r.rashiName}</span>
            <span class="asc-deg">${X(r.deg)}</span>
          </div>
          <div class="asc-detail">
            <span>${r.nakName} Pada ${r.nakPada} | Lord: ${r.nakLord}</span>
          </div>
          <div class="asc-kp">
            <span class="kp-label">KP Sub-lord chain:</span>
            <span class="kp-val">${ce(r.kp)}</span>
          </div>
        </div>
      </section>

      <!-- ── Dasha ── -->
      ${i?`
      <section class="chart-section">
        <h3 class="section-title">Vimshottari Dasha (Current)</h3>
        <div class="dasha-card">
          <div class="dasha-row">
            <div class="dasha-item dasha-maha">
              <div class="dasha-lord">${i.maha.lord}</div>
              <div class="dasha-role">Maha Dasha</div>
              <div class="dasha-dates">${ze(i.maha.start,i.maha.end)}</div>
            </div>
            <div class="dasha-divider">›</div>
            <div class="dasha-item dasha-antar">
              <div class="dasha-lord">${i.antar.lord}</div>
              <div class="dasha-role">Antar Dasha</div>
              <div class="dasha-dates">${ze(i.antar.start,i.antar.end)}</div>
            </div>
          </div>
        </div>
      </section>`:""}

      <!-- ── Janma Nakshatra + Tara ── -->
      <section class="chart-section">
        <h3 class="section-title">Janma Nakshatra & Tara</h3>
        <div class="nak-tara-row">
          <div class="nak-card">
            <div class="nak-name">${u.name}</div>
            <div class="nak-detail">
              Lord: <strong>${u.lord}</strong>
              ${u.pada?` | Pada ${u.pada}`:""}
            </div>
          </div>
          <div class="tara-card ${Ct(d.beneficence)}">
            <div class="tara-num">Tara ${d.number}</div>
            <div class="tara-name">${d.name}</div>
            <div class="tara-moon">Transit Moon: ${d.transitMoonNakName}</div>
            <div class="tara-as-of">as of ${ue(d.asOf)}</div>
          </div>
        </div>
      </section>

      <!-- ── Planets Table ── -->
      <section class="chart-section">
        <h3 class="section-title">Planets (Lahiri Sidereal)</h3>
        <div class="table-scroll">
          <table class="chart-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>House</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>Nakshatra</th>
                <th>KP: Star → Sub → SubSub</th>
              </tr>
            </thead>
            <tbody>
              ${s.map(l=>`
                <tr>
                  <td><span class="planet-sym">${Tt[l.planet]??""}</span> ${l.planet}</td>
                  <td class="text-center">${l.house}</td>
                  <td>${l.rashiName}</td>
                  <td class="mono">${X(l.degInRashi)}</td>
                  <td>${l.nakName} P${l.nakPada}</td>
                  <td class="kp-chain-cell">${ce(l.kp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── KP Cusps ── -->
      <section class="chart-section">
        <h3 class="section-title">KP House Cusps (Placidus · Krishnamurti)</h3>
        <div class="table-scroll">
          <table class="chart-table">
            <thead>
              <tr>
                <th>House</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>Nakshatra</th>
                <th>KP: Star → Sub → SubSub</th>
              </tr>
            </thead>
            <tbody>
              ${o.map(l=>`
                <tr class="${l.house%2===0?"row-alt":""}">
                  <td class="text-center"><strong>${l.house}</strong></td>
                  <td>${l.rashiName}</td>
                  <td class="mono">${X(l.degInRashi)}</td>
                  <td>${l.nakName} P${l.nakPada}</td>
                  <td class="kp-chain-cell">${ce(l.kp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Engine Info ── -->
      <section class="chart-section">
        <div class="meta-footer">
          <span>Engine: ${n.engine}</span>
          <span>Computed: ${ue(n.computed_at)}</span>
        </div>
      </section>

      <!-- ── Bottom Nav ── -->
      <div class="bottom-nav bottom-nav--wrap">
        <button class="btn btn-secondary" id="btn-kp-query-bottom">KP Query →</button>
        <button class="btn btn-outline"   id="btn-muhurta-bottom">Muhurta →</button>
        <button class="btn btn-outline"   id="btn-dasha-bottom">Dasha →</button>
        <button class="btn btn-outline"   id="btn-kp-sublords-bottom">Sub-Lords →</button>
        <button class="btn btn-outline"   id="btn-muhurta-dashboard-bottom">Dashboard →</button>
      </div>

    </div>
  `,document.getElementById("btn-back").addEventListener("click",()=>h("/kundali")),document.getElementById("btn-kp").addEventListener("click",()=>h("/kp-query")),document.getElementById("btn-kp-query-bottom").addEventListener("click",()=>h("/kp-query")),document.getElementById("btn-muhurta-bottom").addEventListener("click",()=>h("/muhurta")),document.getElementById("btn-dasha-bottom").addEventListener("click",()=>h(`/dasha-timeline?kundali_id=${t.id}`)),document.getElementById("btn-kp-sublords-bottom").addEventListener("click",()=>h(`/kp-sublords?kundali_id=${t.id}`)),document.getElementById("btn-muhurta-dashboard-bottom").addEventListener("click",()=>h(`/muhurta-dashboard?kundali_id=${t.id}`))}const Bt=23.2505,Pt=77.4065,j=60,Ae=[{slug:"property",label:"Property",icon:"🏠",priority:"P0"},{slug:"marriage",label:"Marriage",icon:"💍",priority:"P1"},{slug:"business",label:"Business",icon:"📈",priority:"P2"},{slug:"medical",label:"Medical",icon:"🏥",priority:"P3"}],_t={Sun:"hora-sun",Moon:"hora-moon",Mars:"hora-mars",Mercury:"hora-mercury",Jupiter:"hora-jupiter",Venus:"hora-venus",Saturn:"hora-saturn"},At=["","Janma","Sampat","Vipat","Kshema","Pratyak","Sadhana","Naidhana","Mitra","Param Mitra"];function B(e){try{return new Date(e).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return e}}function Nt(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}catch{return e}}function se(e){return e>=80?{cls:"grade-a",label:"Excellent"}:e>=65?{cls:"grade-b",label:"Good"}:e>=50?{cls:"grade-c",label:"Moderate"}:e>=35?{cls:"grade-d",label:"Weak"}:{cls:"grade-f",label:"Avoid"}}function Ht(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}let H,oe=Bt,ie=Pt,ee="Bhopal (default)",te=null,ae=null,R=j;async function Ft(){const e=E();L(e);const t=window.location.hash,a=t.includes("?")?t.split("?")[1]:"",r=new URLSearchParams(a).get("kundali_id");H=r?parseInt(r,10):void 0,e.innerHTML=Rt(H),jt(e);try{await Ot()}catch{}await Ne(e),Qt(e)}function Rt(e){return`
    <div class="screen muhurta-dashboard">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Muhurta Dashboard</h2>
          <span class="subtitle" id="location-label">Detecting location…</span>
        </div>
        <div class="header-right">
          <span class="refresh-badge" id="refresh-badge">⏱ ${j}s</span>
          ${e?'<button class="btn btn-small btn-ghost" id="btn-chart">Chart</button>':""}
        </div>
      </header>
      <div id="dashboard-body" style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function jt(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{me(),h(H?`/birth-chart?id=${H}`:"/dashboard")}),e.querySelector("#btn-chart")?.addEventListener("click",()=>{me(),h(`/birth-chart?id=${H}`)})}async function Ot(){return new Promise(e=>{if(!navigator.geolocation){ee="Bhopal (geoloc unavailable)",e();return}navigator.geolocation.getCurrentPosition(t=>{oe=t.coords.latitude,ie=t.coords.longitude,ee=`${oe.toFixed(4)}°N, ${ie.toFixed(4)}°E`,e()},()=>{ee="Bhopal (location denied)",e()},{timeout:5e3})})}async function Ne(e){const t=e.querySelector("#dashboard-body"),a=e.querySelector("#location-label");if(a&&(a.textContent=ee),!!t)try{const n=await Ee(oe,ie,"general",H);if(!n.ok||!n.data){t.innerHTML=Te(n.data?.error??"Failed to load muhurta data");return}const r=n.data;let s={};try{const o=await Promise.allSettled(Ae.map(i=>Ee(oe,ie,i.slug,H).then(u=>({slug:i.slug,score:u.data?.score?.score??null}))));for(const i of o)i.status==="fulfilled"&&(s[i.value.slug]=i.value.score)}catch{}t.innerHTML=Kt(r,s),R=j}catch(n){console.error("[muhurta-dashboard] load error:",n),t.innerHTML=Te("Connection error. Will retry automatically.")}}function Kt(e,t){const a=[];return a.push(`
    <div class="md-timestamp">
      <span>As of <strong>${Nt(e.as_of)}</strong> IST</span>
      <span class="md-personalized-badge">${e.personalized?"🔮 Personalized":"🌐 Generic"}</span>
    </div>
  `),a.push(qt(e)),e.pancha_pakshi&&a.push(Ut(e.pancha_pakshi)),a.push(Vt(e)),a.push(Wt(e)),a.push(Gt(e)),e.score&&a.push(Jt(e.score)),a.push(Yt(t,e.score)),a.join(`
`)}function qt(e){const t=e.active_hora,a=e.active_uphora,n=t?`
      <div class="md-hora-card ${_t[t.lord]??""}">
        <div class="hora-lord">${t.lord}</div>
        <div class="hora-meta">
          <span class="hora-badge">${t.is_daytime?"☀️ Day":"🌙 Night"}</span>
          <span class="hora-window">${B(t.start)} → ${B(t.end)}</span>
        </div>
      </div>`:'<div class="md-hora-card hora-unknown"><div class="hora-lord">—</div><div class="hora-meta">No hora data</div></div>',r=a?`
      <div class="md-uphora-card">
        <div class="uphora-label">Uphora (1/8 Hora)</div>
        <div class="uphora-lord">${a.sub}</div>
        <div class="uphora-window">${B(a.start)} → ${B(a.end)}</div>
      </div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">⏰ Current Hora</h3>
      <div class="md-hora-row">
        ${n}
        ${r}
      </div>
      <div class="md-sun-row">
        <span>🌅 Sunrise ${B(e.sunrise)}</span>
        <span>🌇 Sunset ${B(e.sunset)}</span>
      </div>
    </section>
  `}function Ut(e){const t=e.favorability_score,{cls:a,label:n}=se(t),r=Math.round(e.confidence*100);return`
    <section class="md-section">
      <h3 class="md-section-title">🦅 Pancha Pakshi</h3>
      <div class="md-pakshi-card">
        <div class="pakshi-bird">${e.bird}</div>
        <div class="pakshi-meta">
          <span class="pakshi-confidence">Confidence: ${r}%</span>
          <span class="pakshi-precision">Precision: ±${e.precision_minutes}m</span>
          <span class="pakshi-window">${B(e.cycle_start)} → ${B(e.cycle_end)}</span>
        </div>
        <div class="md-score-bar-wrap">
          <div class="md-score-bar ${a}" style="width:${t}%"></div>
        </div>
        <div class="pakshi-grade ${a}">${n} (${t}/100)</div>
      </div>
    </section>
  `}function Vt(e){const t=e.rahu_kaal,a=t.active_now?"rk-active":"rk-inactive",n=t.active_now?'<span class="badge badge-danger">⚠ ACTIVE NOW</span>':'<span class="badge badge-ok">✓ Not active</span>';return`
    <section class="md-section">
      <h3 class="md-section-title">🐍 Rahu Kaal</h3>
      <div class="md-rk-card ${a}">
        ${n}
        <span class="rk-window">${B(t.start)} – ${B(t.end)}</span>
        ${t.active_now?'<p class="rk-warning">Avoid new ventures during Rahu Kaal.</p>':""}
      </div>
    </section>
  `}function Wt(e){const t=e.current_nakshatra,a=e.tara;let n='<div class="tara-unavailable">Add a kundali to see personalized Tara</div>';if(a){const r=Ht(a.beneficence),s=At[a.number]??a.name,o=a.beneficence==="benefic"?"✅":a.beneficence==="malefic"?"❌":"⚪";n=`
      <div class="md-tara-card ${r}">
        <div class="tara-number">Tara ${a.number}</div>
        <div class="tara-name">${o} ${s}</div>
        <div class="tara-beneficence">${a.beneficence.charAt(0).toUpperCase()+a.beneficence.slice(1)}</div>
      </div>
    `}return`
    <section class="md-section">
      <h3 class="md-section-title">⭐ Nakshatra + Tara</h3>
      <div class="md-nak-row">
        <div class="md-nak-card">
          <div class="nak-label">Transit Moon</div>
          <div class="nak-name">${t.name}</div>
          <div class="nak-idx">Nakshatra ${t.idx+1}/27</div>
        </div>
        ${n}
      </div>
    </section>
  `}function Gt(e){const t=[];if(e.panchaka_dosha?.active&&t.push(`⚠️ <strong>Panchaka Dosha</strong>${e.panchaka_dosha.dosha?` — ${e.panchaka_dosha.dosha}`:""}: Avoid cremation, travel south, construction.`),e.ganda_moola?.active&&t.push(`⚠️ <strong>Ganda Moola</strong>${e.ganda_moola.nakshatra?` (${e.ganda_moola.nakshatra})`:""}: Inauspicious nakshatra — avoid ceremonies.`),e.dishashool?.active&&t.push(`⚠️ <strong>Dishashool</strong>${e.dishashool.direction?` — ${e.dishashool.direction}`:""}: Travel in this direction is inauspicious today.`),e.combustion?.venus?.combust){const a=e.combustion.venus.orb?` (${e.combustion.venus.orb.toFixed(1)}°)`:"";t.push(`🔥 <strong>Venus Combust</strong>${a}: Marriage muhurtas affected.`)}if(e.combustion?.jupiter?.combust){const a=e.combustion.jupiter.orb?` (${e.combustion.jupiter.orb.toFixed(1)}°)`:"";t.push(`🔥 <strong>Jupiter Combust</strong>${a}: Upanayana, marriage, ceremonies affected.`)}return t.length===0?`
      <section class="md-section">
        <h3 class="md-section-title">🛡 Dosha Status</h3>
        <div class="md-clear-card">✓ No active doshas or combustion warnings</div>
      </section>
    `:`
    <section class="md-section">
      <h3 class="md-section-title">⚠️ Active Warnings (${t.length})</h3>
      <ul class="md-warnings-list">
        ${t.map(a=>`<li class="md-warning-item">${a}</li>`).join("")}
      </ul>
    </section>
  `}function Jt(e){const{cls:t,label:a}=se(e.score),n=Math.round(e.score),r=(e.layers??[]).map(o=>{const i=Math.round(o.score),{cls:u}=se(o.score);return`
      <div class="score-layer">
        <span class="layer-name">${o.name}</span>
        <div class="layer-bar-wrap">
          <div class="layer-bar ${u}" style="width:${i}%"></div>
        </div>
        <span class="layer-score">${i}</span>
        ${o.reason?`<span class="layer-reason">${o.reason}</span>`:""}
      </div>
    `}).join(""),s=(e.warnings??[]).length>0?`<div class="score-warnings">${e.warnings.map(o=>`<span class="score-warn-tag">${o}</span>`).join("")}</div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">📊 Convergence Score</h3>
      <div class="md-score-card">
        <div class="score-big ${t}">${n}</div>
        <div class="score-grade-label ${t}">${a} ${e.grade?`(${e.grade})`:""}</div>
        <div class="md-score-bar-wrap main-bar">
          <div class="md-score-bar ${t}" style="width:${n}%"></div>
        </div>
        ${e.summary?`<p class="score-summary">${e.summary}</p>`:""}
        ${s}
        ${r?`<div class="score-layers">${r}</div>`:""}
      </div>
    </section>
  `}function Yt(e,t){return`
    <section class="md-section">
      <h3 class="md-section-title">🎯 Event Suitability</h3>
      <div class="md-event-grid">${Ae.map(n=>{const r=e[n.slug]??null,s=r!==null?Math.round(r):t?Math.round(t.score):null,{cls:o,label:i}=s!==null?se(s):{cls:"grade-na",label:"—"};return`
      <div class="md-event-card ${o}">
        <div class="event-icon">${n.icon}</div>
        <div class="event-label">${n.label}</div>
        <div class="event-priority">${n.priority}</div>
        <div class="event-score">${s!==null?s:"—"}</div>
        <div class="event-grade">${i}</div>
      </div>
    `}).join("")}</div>
      ${Object.keys(e).length?"":'<p class="md-note">Scores shown are general. Add a kundali for personalized event ratings.</p>'}
    </section>
  `}function Te(e){return`<div class="error-card" style="margin: var(--space-6) 0;"><p>${e}</p></div>`}function Qt(e){me(),ae=setInterval(()=>{R--;const t=e.querySelector("#refresh-badge");t&&(t.textContent=`⏱ ${R}s`),R<=0&&(R=j)},1e3),te=setInterval(async()=>{R=j,await Ne(e)},j*1e3)}function me(){te&&(clearInterval(te),te=null),ae&&(clearInterval(ae),ae=null)}Zt();function Zt(){const e="muhurta-dashboard-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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
`,document.head.appendChild(t)}const _=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"],K={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17},q={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},U={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#d97706",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"};function Xt(e,t){const a=Date.now(),n=[];let r=e.getTime();for(let s=0;s<9;s++){const o=(t+s)%9,i=_[o],u=K[i]*365.25*864e5,d=new Date(r),l=new Date(r+u),c=a>=d.getTime()&&a<l.getTime(),m=a>=l.getTime();n.push({lord:i,start:d,end:l,idx:s,isCurrent:c,isPast:m,antars:ea({lord:i,start:d})}),r+=u}return n}function ea(e){const t=Date.now(),a=_.indexOf(e.lord),n=K[e.lord],r=[];let s=e.start.getTime();for(let o=0;o<9;o++){const i=(a+o)%9,u=_[i],d=K[u]/120*n*365.25*864e5,l=new Date(s),c=new Date(s+d),m=t>=l.getTime()&&t<c.getTime(),v={lord:u,start:l,end:c};m&&(v.pratyantar=ta({lord:u,start:l,end:c})),r.push(v),s+=d}return r}function ta(e,t){const a=_.indexOf(e.lord),n=e.end.getTime()-e.start.getTime(),r=120,s=[];let o=e.start.getTime();for(let i=0;i<9;i++){const u=(a+i)%9,d=_[u],c=K[d]/r*n,m=new Date(o),v=new Date(o+c);s.push({lord:d,start:m,end:v}),o+=c}return s}function V(e){return e.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}function P(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function He(e,t){const a=(t.getTime()-e.getTime())/315576e5;if(a>=1)return`${a.toFixed(1)}y`;const n=a*12;return n>=1?`${n.toFixed(1)}m`:`${Math.round(a*365)}d`}function aa(e,t){const a=Date.now();return a<=e.getTime()?0:a>=t.getTime()?100:Math.round((a-e.getTime())/(t.getTime()-e.getTime())*100)}let be,Y=-1;async function ra(){const e=E();L(e);const t=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(t).get("kundali_id");if(!n){e.innerHTML=re("Missing kundali_id parameter.");return}be=parseInt(n,10),e.innerHTML=na(),Fe(e);try{const r=await le(be);if(!r.ok||!r.data){e.innerHTML=re(r.data?.error??"Failed to load chart data.");return}const{chart:s,kundali:o}=r.data;Re(e,s,o)}catch(r){console.error("[dasha-timeline]",r),e.innerHTML=re("Connection error. Please try again.")}}function na(){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function Fe(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{h(`/birth-chart?id=${be}`)})}function Re(e,t,a){const{dasha:n,janmaNakshatra:r}=t;if(!n){e.innerHTML=re("Dasha calculation unavailable for this chart.");return}const s=r.lord,o=_.indexOf(s),i=new Date(n.maha.start),u=n.maha.lord,d=_.indexOf(u);let l=i.getTime(),c=0;if(o!==-1&&d!==-1){c=(d-o+9)%9;for(let b=0;b<c;b++){const w=_[(o+b)%9];l-=K[w]*365.25*864e5}}const m=Xt(new Date(l),o!==-1?o:d),v=m.findIndex(b=>b.isCurrent);Y===-1&&(Y=v>=0?v:0);const p=m[0].start,x=m[m.length-1].end.getTime()-p.getTime(),y=m[Y],f=y.antars.find(b=>Date.now()>=b.start.getTime()&&Date.now()<b.end.getTime())??null;e.innerHTML=`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Dasha Timeline</h2>
          <span class="subtitle">${a.label??"Birth Chart"}</span>
        </div>
      </header>
      <div class="dt-body">
        ${sa(r,n)}
        ${oa(m,p,x)}
        ${ia(m)}
        ${da(y,f)}
      </div>
    </div>
  `,Fe(e),ca(e,m,t,a)}function sa(e,t){return`
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
            <span class="dt-lord" style="color:${U[t.maha.lord]??"inherit"}">
              ${q[t.maha.lord]??""} ${t.maha.lord}
            </span>
            <span class="dt-window">${P(new Date(t.maha.start))} → ${P(new Date(t.maha.end))}</span>
          </div>
          <div class="dt-antar-now">
            <span class="dt-label">Antardasha</span>
            <span class="dt-lord" style="color:${U[t.antar.lord]??"inherit"}">
              ${q[t.antar.lord]??""} ${t.antar.lord}
            </span>
            <span class="dt-window">${P(new Date(t.antar.start))} → ${P(new Date(t.antar.end))}</span>
          </div>
        </div>
      </div>
    </section>
  `}function oa(e,t,a){const n=e.map(s=>{const o=((s.start.getTime()-t.getTime())/a*100).toFixed(2),i=((s.end.getTime()-s.start.getTime())/a*100).toFixed(2),u=U[s.lord]??"#888";return`<div class="${s.isCurrent?"tl-seg current":s.isPast?"tl-seg past":"tl-seg future"}" style="left:${o}%;width:${i}%;background:${u}${s.isPast?"66":s.isCurrent?"":"33"};"
              title="${s.lord}: ${P(s.start)}–${P(s.end)}">
              <span class="tl-seg-label">${s.lord}</span>
            </div>`}).join(""),r=e.length>0?Math.max(0,Math.min(100,(Date.now()-t.getTime())/a*100)).toFixed(2):"0";return`
    <section class="dt-section">
      <h3 class="dt-section-title">⏳ 120-Year Vimshottari Cycle</h3>
      <div class="dt-timeline-bar">
        ${n}
        <div class="tl-now-marker" style="left:${r}%" title="Today"></div>
      </div>
      <div class="dt-timeline-labels">
        <span>${P(e[0]?.start??new Date)}</span>
        <span>Today</span>
        <span>${P(e[e.length-1]?.end??new Date)}</span>
      </div>
    </section>
  `}function ia(e){return`
    <section class="dt-section">
      <h3 class="dt-section-title">🪐 Mahadasha Periods <span class="dt-hint">Tap to expand</span></h3>
      <div class="dt-maha-list" id="maha-list">
        ${e.map((a,n)=>{const r=a.isCurrent?aa(a.start,a.end):a.isPast?100:0,s=U[a.lord]??"#888";return`
      <div class="${a.isCurrent?"maha-card current":a.isPast?"maha-card past":"maha-card future"}${n===Y?" selected":""}" data-maha-idx="${n}" style="--planet-color:${s}">
        <div class="maha-left">
          <div class="maha-glyph">${q[a.lord]??""}</div>
          <div class="maha-info">
            <div class="maha-lord">${a.lord}</div>
            <div class="maha-years">${K[a.lord]}y</div>
          </div>
        </div>
        <div class="maha-right">
          <div class="maha-window">${V(a.start)} → ${V(a.end)}</div>
          ${a.isCurrent?`
            <div class="maha-progress-wrap">
              <div class="maha-progress-bar" style="width:${r}%;background:${s}"></div>
            </div>
            <div class="maha-pct">${r}% elapsed</div>
          `:""}
        </div>
        ${a.isCurrent?'<span class="maha-now-badge">NOW</span>':""}
      </div>
    `}).join("")}
      </div>
    </section>
  `}function da(e,t){const a=e.antars.map(r=>{const s=Date.now()>=r.start.getTime()&&Date.now()<r.end.getTime(),o=Date.now()>=r.end.getTime(),i=U[r.lord]??"#888";return`
      <div class="${s?"antar-row current":o?"antar-row past":"antar-row future"}">
        <div class="antar-left">
          <span class="antar-glyph" style="color:${i}">${q[r.lord]??""}</span>
          <span class="antar-lord">${r.lord}</span>
          ${s?'<span class="antar-now-badge">NOW</span>':""}
        </div>
        <div class="antar-right">
          <span class="antar-window">${V(r.start)} → ${V(r.end)}</span>
          <span class="antar-dur">${He(r.start,r.end)}</span>
        </div>
      </div>
    `}).join(""),n=t?.pratyantar?la(t):"";return`
    <section class="dt-section">
      <h3 class="dt-section-title">
        🔵 Antardashas — ${q[e.lord]??""} ${e.lord} Maha
        <span class="dt-hint">(${P(e.start)} – ${P(e.end)})</span>
      </h3>
      <div class="dt-antar-list">${a}</div>
      ${n}
    </section>
  `}function la(e){if(!e.pratyantar?.length)return"";const t=e.pratyantar.map(a=>{const n=Date.now()>=a.start.getTime()&&Date.now()<a.end.getTime(),r=Date.now()>=a.end.getTime(),s=U[a.lord]??"#888";return`
      <div class="${n?"prat-row current":r?"prat-row past":"prat-row"}">
        <span class="prat-glyph" style="color:${s}">${q[a.lord]??""}</span>
        <span class="prat-lord">${a.lord}</span>
        ${n?'<span class="prat-now-badge">NOW</span>':""}
        <span class="prat-window">${V(a.start)} – ${V(a.end)}</span>
        <span class="prat-dur">${He(a.start,a.end)}</span>
      </div>
    `}).join("");return`
    <div class="dt-prat-section">
      <h4 class="dt-section-title">🔴 Pratyantar — ${e.lord} Antar</h4>
      <div class="dt-prat-list">${t}</div>
    </div>
  `}function re(e){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function ca(e,t,a,n){e.querySelectorAll(".maha-card").forEach(r=>{r.addEventListener("click",()=>{Y=parseInt(r.dataset.mahaIdx??"0",10),Re(e,a,n)})})}ua();function ua(){const e="dasha-timeline-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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
`,document.head.appendChild(t)}const pa={I:"Self, Health, Appearance",II:"Wealth, Family, Speech",III:"Courage, Siblings, Short Trips",IV:"Property, Mother, Happiness",V:"Children, Intelligence, Speculation",VI:"Enemies, Disease, Service",VII:"Marriage, Business Partners",VIII:"Longevity, Hidden, Inheritance",IX:"Luck, Father, Dharma",X:"Career, Status, Authority",XI:"Gains, Desires, Elder Siblings",XII:"Loss, Abroad, Liberation"},fe={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},ye={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#b45309",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"},je={Aries:"Ar",Taurus:"Ta",Gemini:"Ge",Cancer:"Cn",Leo:"Le",Virgo:"Vi",Libra:"Li",Scorpio:"Sc",Sagittarius:"Sg",Capricorn:"Cp",Aquarius:"Aq",Pisces:"Pi"};let ge,ne="cusps";async function va(){const e=E();L(e);const t=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(t).get("kundali_id");if(!n){e.innerHTML=pe("Missing kundali_id parameter.");return}ge=parseInt(n,10),e.innerHTML=ga(),qe(e);try{const r=await rt(ge);if(!r.ok||!r.data){e.innerHTML=pe(r.data?.error??"Failed to load KP chart.");return}Oe(e,r.data)}catch(r){console.error("[kp-sublords]",r),e.innerHTML=pe("Connection error. Please try again.")}}function Oe(e,t){e.innerHTML=`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>KP Sub-Lords</h2>
          <span class="subtitle">Krishnamurti Paddhati · Placidus Sidereal</span>
        </div>
      </header>

      <div class="kp-tabs" role="tablist">
        <button class="kp-tab${ne==="cusps"?" active":""}" data-tab="cusps" role="tab">
          🏠 Bhavas (12)
        </button>
        <button class="kp-tab${ne==="planets"?" active":""}" data-tab="planets" role="tab">
          🪐 Planets (${t.planet_sub_lords.length})
        </button>
      </div>

      <div class="kp-body">
        ${ne==="cusps"?ma(t.house_cusps):ba(t.planet_sub_lords)}
      </div>

      <div class="kp-caveat">${t.ayanamsa_caveat}</div>
    </div>
  `,qe(e),ha(e,t)}function ma(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the cusp</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Primary significator (KP prime indicator)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (fine-tuning)</span>
    </div>
    <div class="kp-rows">${e.map(a=>{const n=pa[a.house]??"",r=a.sign??"",s=je[r]??r.slice(0,2),o=a.deg_in_sign.toFixed(2);return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-house-badge">H${a.house}</div>
          <div class="kp-row-meta">
            <span class="kp-pos">${s} ${o}°</span>
            <span class="kp-theme">${n}</span>
          </div>
        </div>
        <div class="kp-chain">
          ${O("Star",a.star_lord)}
          ${de()}
          ${O("Sub",a.sub_lord,!0)}
          ${de()}
          ${O("Sub²",a.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Ke(a.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function ba(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the planet</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Controls planet's results (KP prime)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (finer detail)</span>
    </div>
    <div class="kp-rows">${e.map(a=>{const n=a.sign??"",r=je[n]??n.slice(0,2),s=a.deg_in_sign.toFixed(2),o=ye[a.planet]??"#888",i=fe[a.planet]??"";return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-planet-badge" style="color:${o}">
            ${i} ${a.planet}
          </div>
          <div class="kp-row-meta">
            <span class="kp-pos">${r} ${s}°</span>
          </div>
        </div>
        <div class="kp-chain">
          ${O("Star",a.star_lord)}
          ${de()}
          ${O("Sub",a.sub_lord,!0)}
          ${de()}
          ${O("Sub²",a.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Ke(a.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function O(e,t,a=!1){const n=ye[t]??"#888",r=fe[t]??"";return`
    <div class="kp-chain-cell${a?" prime":""}">
      <div class="kp-chain-label">${e}</div>
      <div class="kp-chain-lord" style="color:${n}">
        ${r} ${t}
      </div>
    </div>
  `}function de(){return'<div class="kp-chain-arrow">→</div>'}function Ke(e){const t=ye[e]??"#888",a=fe[e]??"";return`<span class="lord-chip" style="color:${t}">${a} ${e}</span>`}function ga(){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="spinner" style="margin:40px auto"></div>
      </div>
    </div>
  `}function pe(e){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function qe(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{h(`/birth-chart?id=${ge}`)})}function ha(e,t){e.querySelectorAll(".kp-tab").forEach(a=>{a.addEventListener("click",()=>{ne=a.dataset.tab??"cusps",Oe(e,t)})})}fa();function fa(){const e="kp-sublords-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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
`,document.head.appendChild(t)}const Ce={property:{slug:"property",label:"Property Purchase",emoji:"🏠",defaultWindowDays:30,color:"#16a34a",scoringNotes:["Moon in 4th house sign (Cancer) or aspecting it = strong for property","4th house sub-lord (KP) must signify 4, 11 — not 8, 12","Venus hora or Jupiter hora preferred (wealth + expansion)","Avoid Panchaka Dosha for property transactions","Vastu direction: prefer East or North muhurta times"],auspiciousHoras:["Venus","Jupiter","Mercury"]},marriage:{slug:"marriage",label:"Marriage Muhurta",emoji:"💍",defaultWindowDays:60,color:"#db2777",scoringNotes:["7th house sub-lord (KP) must signify 1, 2, 7, 11 — not 6, 8, 12","Moon + Venus strong (no combustion, no debilitation)","Venus hora preferred; avoid Saturn hora for auspicious ceremonies","Navpancham / Trikona Tara between bride and groom is ideal","Avoid Ashtama Navamsha (Lagna in 8th part of sign during ceremony)"],auspiciousHoras:["Venus","Jupiter","Moon"]},business:{slug:"business",label:"Business Launch",emoji:"🏢",defaultWindowDays:30,color:"#2563eb",scoringNotes:["10th house sub-lord (KP) must signify 1, 6, 10, 11","Mercury hora for registration/contracts; Sun hora for authority/leadership","Moon in waxing phase (Shukla Paksha) for new ventures","Avoid Rahu hora for business starts (instability, hidden obstacles)","Jupiter must not be in 6, 8, 12 from Lagna (Guru Chandal Dosha check)"],auspiciousHoras:["Mercury","Sun","Jupiter"]},medical:{slug:"medical",label:"Medical / Surgery",emoji:"🏥",defaultWindowDays:14,color:"#dc2626",scoringNotes:["Moon must be strong — not in 8th house, not debilitated (Scorpio), not eclipsed","Avoid Ashtami (8th Tithi) and Krishna Chaturdashi (14th dark fortnight)","8th house sub-lord (KP) must NOT signify 2, 7 (maraka houses)","Sun hora for surgeries involving head/eye; Mars hora for procedures","Avoid Ganda Moola nakshatras — flag shown if active in selected window"],auspiciousHoras:["Sun","Mercury","Jupiter"]}};let N=null,Me="property",G=null,J=null;async function ya(){const e=E();L(e);const t=window.location.hash,a=t.includes("?")?t.split("?")[1]:"",n=new URLSearchParams(a),r=n.get("purpose")??"property";Me=Ce[r]?r:"property";const s=n.get("kundali_id");N=s?parseInt(s,10):null;const o=Ce[Me];if(e.innerHTML=Sa(o),Ue(e),N&&!isNaN(N))try{const i=await le(N);if(i.ok&&i.data){const{kundali:u}=i.data;G=u.latitude,J=u.longitude}}catch{}ka(e,o)}function ka(e,t){const a=new Date().toISOString().slice(0,10),n=new Date(Date.now()+t.defaultWindowDays*864e5).toISOString().slice(0,10),r=G!==null?G.toFixed(4):"",s=J!==null?J.toFixed(4):"",o=G!==null&&J!==null;e.innerHTML=`
    <div class="screen event-muhurta-screen" style="--purpose-color:${t.color}">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>${t.emoji} ${t.label}</h2>
          <span class="subtitle">Muhurta Finder · Hora/Tara scoring</span>
        </div>
      </header>

      <!-- KP Scoring Notes -->
      <section class="em-notes">
        <div class="em-notes-title">KP Astrological Guidelines</div>
        <ul class="em-notes-list">
          ${t.scoringNotes.map(i=>`<li>${i}</li>`).join("")}
        </ul>
        <div class="em-auspicious-horas">
          Preferred Horas: ${t.auspiciousHoras.map(i=>`<span class="hora-chip hora-${i.toLowerCase()}">${i}</span>`).join(" ")}
        </div>
      </section>

      <!-- Search Form -->
      <section class="em-form">
        <div class="em-form-title">Find Auspicious Windows</div>

        ${o?`
        <div class="em-location-confirmed">
          📍 Using birth location: ${G.toFixed(4)}°N, ${J.toFixed(4)}°E
          <input type="hidden" id="inp-lat" value="${r}" />
          <input type="hidden" id="inp-lon" value="${s}" />
        </div>
        `:`
        <div class="em-field-group">
          <label class="em-label">Location (Latitude / Longitude)</label>
          <div class="em-latlon-row">
            <input type="number" id="inp-lat" class="em-input" placeholder="e.g. 23.2505"
              step="0.0001" min="-90" max="90" value="${r}" />
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
              <input type="date" id="inp-from" class="em-input" value="${a}" min="${a}" />
            </div>
            <div>
              <div class="em-date-label">To</div>
              <input type="date" id="inp-to" class="em-input" value="${n}" min="${a}" />
            </div>
          </div>
          <div class="em-hint">Max 90 days. For ${t.label}: ${t.defaultWindowDays}-day window recommended.</div>
        </div>

        <div id="em-error" class="em-error" style="display:none"></div>

        <button class="btn btn-primary em-scan-btn" id="btn-scan">
          Find Best Windows (costs 5 pts)
        </button>
      </section>

      <!-- Results placeholder -->
      <div id="em-results"></div>

    </div>
  `,Ea(),Ue(e),xa(e,t)}function xa(e,t){const a=e.querySelector("#btn-scan");a&&a.addEventListener("click",async()=>{const n=document.getElementById("em-error");n.style.display="none";const r=document.getElementById("inp-lat").value,s=document.getElementById("inp-lon").value,o=document.getElementById("inp-from").value,i=document.getElementById("inp-to").value,u=parseFloat(r),d=parseFloat(s);if(!Number.isFinite(u)||u<-90||u>90){A(n,"Latitude must be between -90 and 90.");return}if(!Number.isFinite(d)||d<-180||d>180){A(n,"Longitude must be between -180 and 180.");return}if(!o||!i){A(n,"Please select a date range.");return}const l=new Date(o),c=new Date(i+"T23:59:59");if(c<=l){A(n,"'To' date must be after 'From' date.");return}const m=(c.getTime()-l.getTime())/864e5;if(m>90){A(n,"Date range cannot exceed 90 days.");return}a.disabled=!0,a.textContent="Scanning…";const v=document.getElementById("em-results");v.innerHTML=`
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
        <p style="margin-top:var(--space-3);color:var(--color-text-secondary)">
          Scanning ${Math.ceil(m)} days for auspicious windows…
        </p>
      </div>
    `;try{const p=await Be({lat:u,lon:d,purpose:t.slug,kundali_id:N??void 0,from:l.toISOString(),to:c.toISOString(),top_n:20});p.ok?wa(v,p.data,t):(A(n,p.data?.error??"Scan failed. Please try again."),v.innerHTML="")}catch{A(n,"Connection error. Please try again."),v.innerHTML=""}finally{a.disabled=!1,a.textContent="Find Best Windows (costs 5 pts)"}})}function A(e,t){e.textContent=t,e.style.display="block"}function wa(e,t,a){const n=t.windows??[];if(n.length===0){e.innerHTML=`
      <div class="em-no-results">
        <p>No auspicious windows found in this range.</p>
        <p>Try a wider date range or different location.</p>
      </div>
    `;return}const r=new Map;for(const o of n){const i=o.timestamp.slice(0,10);r.has(i)||r.set(i,[]),r.get(i).push(o)}const s=Array.from(r.entries()).map(([o,i])=>{const u=new Date(o+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}),d=i[0],l=i.map(c=>{const m=new Date(c.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),v=c.tara?$a(c.tara.beneficence):"",p=[c.panchaka_active?'<span class="em-flag em-flag-warn">⚠ Panchaka</span>':"",c.ganda_moola?'<span class="em-flag em-flag-warn">⚠ Ganda Moola</span>':"",c.dishashool_direction?`<span class="em-flag em-flag-warn">⚠ Dishashool: ${c.dishashool_direction}</span>`:"",a.auspiciousHoras.includes(c.hora_lord)?`<span class="em-flag em-flag-good">✓ ${c.hora_lord} hora</span>`:""].filter(Boolean).join(" ");return`
        <div class="em-window-row">
          <div class="em-window-time">${m} IST</div>
          <div class="em-window-score">
            <div class="em-score-bar" style="width:${Math.min(c.score,100)}%"></div>
            <span>${c.score.toFixed(0)}/100</span>
          </div>
          <div class="em-window-detail">
            <span class="em-hora-chip">${c.hora_lord} hora</span>
            <span class="em-nak">${c.nakshatra}</span>
            ${c.tara?`<span class="em-tara ${v}">Tara ${c.tara.number}: ${c.tara.name}</span>`:""}
          </div>
          ${p?`<div class="em-flags">${p}</div>`:""}
        </div>
      `}).join("");return`
      <div class="em-day-card">
        <div class="em-day-header">
          <span class="em-day-date">${u}</span>
          <span class="em-day-best-score" style="color:var(--purpose-color)">${d.score.toFixed(0)}/100</span>
        </div>
        <div class="em-windows">${l}</div>
      </div>
    `}).join("");e.innerHTML=`
    <section class="em-results-section">
      <div class="em-results-header">
        <div class="em-results-title">Top ${n.length} Windows Found</div>
        <div class="em-results-meta">
          Scanned ${t.total_sampled??"—"} time slots ·
          Wallet: ${t.wallet_balance??"—"} pts remaining
        </div>
      </div>
      <div class="em-day-cards">${s}</div>
    </section>
  `}function $a(e){return e==="benefic"?"em-tara-good":e==="malefic"?"em-tara-bad":"em-tara-neutral"}function Sa(e){return`
    <div class="screen event-muhurta-screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>${e.emoji} ${e.label}</h2></div>
      </header>
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
      </div>
    </div>
  `}function Ue(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{h(N?`/birth-chart?id=${N}`:"/dashboard")})}function Ea(){const e="event-muhurta-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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
.em-latlon-row { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-2); }
.em-date-row { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-2); }
.em-date-label { font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:2px; }
.em-location-confirmed { font-size:var(--font-size-xs); color:var(--color-text-secondary); padding:var(--space-2); background:color-mix(in srgb,var(--purpose-color,#16a34a) 8%,var(--color-surface-2)); border-radius:var(--radius-sm); border:1px solid color-mix(in srgb,var(--purpose-color,#16a34a) 30%,transparent); }
.em-error { color:var(--color-danger,#dc2626); font-size:var(--font-size-sm); padding:var(--space-2); }
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
`,document.head.appendChild(t)}class La{routes=new Map;constructor(){this.routes.set("/login",lt),this.routes.set("/dashboard",ct),this.routes.set("/muhurta",ht),this.routes.set("/kundali",yt),this.routes.set("/kundali-form",wt),this.routes.set("/kp-query",$t),this.routes.set("/scanner",Lt),this.routes.set("/wallet",It),this.routes.set("/referral",zt),this.routes.set("/admin",St),this.routes.set("/birth-chart",Mt),this.routes.set("/muhurta-dashboard",Ft),this.routes.set("/dasha-timeline",ra),this.routes.set("/kp-sublords",va),this.routes.set("/event-muhurta",ya)}currentRoute(){return window.location.hash.slice(1)||"/login"}basePath(t){return t.split("?")[0]??t}async route(){const t=this.currentRoute(),a=this.routes.get(this.basePath(t));if(a)try{await a()}catch(n){console.error(`Route handler error for ${t}:`,n)}else{const n=this.routes.get("/login");n&&await n()}}}function h(e){window.location.hash=e}window.addEventListener("error",e=>{const t=e.error?.message||e.message||"Unknown error";console.error("Global error:",t,e),Ve({type:"uncaught-error",message:t,filename:e.filename,lineno:e.lineno,stack:e.error?.stack}),k("An error occurred. Please refresh.",!0)});window.addEventListener("unhandledrejection",e=>{const t=e.reason?.message||String(e.reason)||"Unhandled promise rejection";console.error("Unhandled rejection:",t,e.reason),Ve({type:"unhandled-rejection",message:t,stack:e.reason?.stack})});async function Ve(e){try{await fetch("/api/log-error",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{console.log("Error log endpoint not available")})}catch{}}function Ia(){const e=localStorage.getItem("theme")||"auto",t=document.documentElement;let a=e;e==="auto"&&(a=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),t.setAttribute("data-theme",a),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",n=>{if(localStorage.getItem("theme")==="auto"){const r=n.matches?"dark":"light";t.setAttribute("data-theme",r)}})}function za(){const e=document.documentElement,a=(e.getAttribute("data-theme")||"light")==="light"?"dark":"light";e.setAttribute("data-theme",a),localStorage.setItem("theme",a)}async function Ta(){if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",e),e.addEventListener("updatefound",()=>{const t=e.installing;t?.addEventListener("statechange",()=>{t.state==="installed"&&navigator.serviceWorker.controller&&k("Update available — refresh to get the latest version",!1)})})}catch(e){console.error("Service Worker registration failed:",e)}}async function De(){Ia(),Ta(),window.toggleTheme=za;const e=new La;window.addEventListener("hashchange",()=>{e.route()}),await e.route(),console.log("OccultViision PWA initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",De):De();
