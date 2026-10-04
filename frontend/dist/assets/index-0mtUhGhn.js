(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();function z(){return document.getElementById("app")}function I(e){e.innerHTML=""}function y(e,a=!1){let t=document.getElementById("ov-toast");t||(t=document.createElement("div"),t.id="ov-toast",document.body.appendChild(t)),t.textContent=e,t.className=`ov-toast show ${a?"error":"ok"}`,setTimeout(()=>t.classList.remove("show"),3e3)}const Ze={},Xe=Ze?.VITE_API_BASE??"";let pe=localStorage.getItem("ov_session");function ea(e){pe=e,e?localStorage.setItem("ov_session",e):localStorage.removeItem("ov_session")}async function T(e,a={}){const t={...a.headers??{}};pe&&(t.Authorization=`Bearer ${pe}`),a.body&&typeof a.body=="string"&&(t["Content-Type"]="application/json");const n=await fetch(`${Xe}${e}`,{...a,headers:t});let r;try{r=await n.json()}catch{r=null}return{ok:n.ok,status:n.status,data:r}}const aa=e=>T("/auth/request-otp",{method:"POST",body:JSON.stringify({phone_number:e})}),ta=(e,a,t)=>T("/auth/verify-otp",{method:"POST",body:JSON.stringify({phone_number:e,code:a,fingerprint_hash:t})}),de=()=>T("/kundali"),ra=e=>T("/kundali",{method:"POST",body:JSON.stringify(e)}),na=e=>T(`/kundali/${e}`,{method:"DELETE"}),De=(e,a,t,n)=>{const r=new URLSearchParams({lat:String(e),lon:String(a)});return t&&r.set("purpose",t),n!==void 0&&r.set("kundali_id",String(n)),T(`/muhurta/now?${r}`)},Pe=e=>{const a=new URLSearchParams({lat:String(e.lat),lon:String(e.lon)});return e.purpose&&a.set("purpose",e.purpose),e.kundali_id!==void 0&&a.set("kundali_id",String(e.kundali_id)),e.from&&a.set("from",e.from),e.to&&a.set("to",e.to),e.top_n!==void 0&&a.set("top_n",String(e.top_n)),T(`/muhurta/scan?${a}`)},ge=e=>T(`/kundali/${e}/chart`),sa=e=>T(`/kp/chart/${e}`),oa=(e,a)=>T("/kp/query",{method:"POST",body:JSON.stringify({kundali_id:e,activity_slug:a})}),ia=()=>T("/kp/activities"),_e=()=>T("/wallet/balance"),da=()=>T("/referral/code"),la=()=>T("/admin/stats"),Ee=De;function ca(){const e=z();I(e),e.innerHTML=`
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
  `;let a="";const t=document.getElementById("phone"),n=document.getElementById("btn-otp"),r=document.getElementById("step-phone"),s=document.getElementById("step-otp"),o=document.getElementById("otp-code"),i=document.getElementById("btn-verify"),u=document.getElementById("btn-back"),d=document.getElementById("login-loading");n.addEventListener("click",async()=>{if(a=t.value.trim(),!/^\d{10}$/.test(a)){y("Enter a valid 10-digit phone number",!0);return}n.setAttribute("disabled",""),d.classList.remove("hidden");const l=await aa(a);d.classList.add("hidden"),n.removeAttribute("disabled"),l.ok?(r.classList.add("hidden"),s.classList.remove("hidden"),o.focus(),y("OTP sent!")):y(l.data?.error??"Failed to send OTP",!0)}),u.addEventListener("click",()=>{s.classList.add("hidden"),r.classList.remove("hidden"),t.focus()}),i.addEventListener("click",async()=>{const l=o.value.trim();if(!/^\d{4,6}$/.test(l)){y("Enter the OTP code",!0);return}i.setAttribute("disabled",""),d.classList.remove("hidden");const c=`pwa-${navigator.userAgent.slice(0,40)}-${screen.width}x${screen.height}`,v=await ta(a,l,c);d.classList.add("hidden"),i.removeAttribute("disabled"),v.ok&&v.data?.session_token?(ea(v.data.session_token),y("Logged in!"),g("/dashboard")):y(v.data?.error??"Verification failed",!0)})}function ua(){const e=z();I(e),e.innerHTML=`
    <div class="screen dashboard-screen">

      <header class="app-header">
        <div>
          <h1>✦ OccultViision ✦</h1>
          <div style="color:#C8960C;font-size:0.6rem;letter-spacing:2px;opacity:0.75;margin-top:2px;">
            KP · PANCHANG · NUMEROLOGY
          </div>
        </div>
        <div id="balance-badge" class="badge">...</div>
      </header>

      <div class="card-grid">

        <!-- Core Tools -->
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
          <span class="card-icon">☿</span>
          <span class="card-label">KP Query</span>
          <span class="card-desc">Promise / Denied verdict</span>
        </button>

        <button class="card" data-route="/kundali">
          <span class="card-icon">♈</span>
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

        <!-- V6 Advanced (coming soon) -->
        <button class="card card--v6" data-route="/kundali" data-v6-dest="/dasha-timeline">
          <span class="card-icon">🪐</span>
          <span class="card-label">Dasha Timeline</span>
          <span class="card-desc">120-yr Vimshottari cycles</span>
        </button>

        <button class="card card--v6" data-route="/kundali" data-v6-dest="/kp-sublords">
          <span class="card-icon">🔗</span>
          <span class="card-label">KP Sub-Lords</span>
          <span class="card-desc">Cusp &amp; planet KP chains</span>
        </button>

        <button class="card card--v6" data-route="/kundali" data-v6-dest="/muhurta-dashboard">
          <span class="card-icon">📊</span>
          <span class="card-label">Muhurta Dashboard</span>
          <span class="card-desc">Personalised Tara &amp; Hora</span>
        </button>

        <!-- Event Muhurta -->
        <button class="card card--event" data-route="/event-muhurta?purpose=property">
          <span class="card-icon">🏠</span>
          <span class="card-label">Property Muhurta</span>
          <span class="card-desc">Best windows for purchase</span>
        </button>

        <button class="card card--event" data-route="/event-muhurta?purpose=marriage">
          <span class="card-icon">💍</span>
          <span class="card-label">Marriage Muhurta</span>
          <span class="card-desc">Auspicious wedding dates</span>
        </button>

        <button class="card card--event" data-route="/event-muhurta?purpose=business">
          <span class="card-icon">🏢</span>
          <span class="card-label">Business Launch</span>
          <span class="card-desc">Launch &amp; opening muhurta</span>
        </button>

        <button class="card card--event" data-route="/event-muhurta?purpose=medical">
          <span class="card-icon">🏥</span>
          <span class="card-label">Medical / Surgery</span>
          <span class="card-desc">Surgical timing by KP</span>
        </button>

      </div>

      <footer class="app-footer">
        <button id="btn-logout" class="btn-link">Logout</button>
      </footer>

    </div>
  `,_e().then(a=>{const t=document.getElementById("balance-badge");a.ok?t.textContent=`${a.data.balance??0} pts`:t.textContent="—"}),e.querySelectorAll(".card[data-route]").forEach(a=>{a.addEventListener("click",()=>{g(a.dataset.route)})}),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),g("/login"),window.location.reload()})}let G=null;function Ae(){if(G)return G;const e=localStorage.getItem("ov_location");if(e)try{return G=JSON.parse(e),G}catch{}return null}function pa(e){G=e,localStorage.setItem("ov_location",JSON.stringify(e))}function Ne(){return new Promise((e,a)=>{if(!navigator.geolocation){a(new Error("Geolocation not supported"));return}navigator.geolocation.getCurrentPosition(t=>{const n={lat:t.coords.latitude,lon:t.coords.longitude};pa(n),e(n)},t=>a(t),{enableHighAccuracy:!1,timeout:1e4})})}const ma=[{value:"general",label:"General"},{value:"travel",label:"Travel"},{value:"finance",label:"Finance"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"relationship",label:"Relationship"},{value:"career",label:"Career"},{value:"spiritual",label:"Spiritual"}];function va(){const e=z();I(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${ma.map(t=>`<option value="${t.value}">${t.label}</option>`).join("")}
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
  `,document.getElementById("btn-back").addEventListener("click",()=>g("/dashboard"));const a=Ae();a&&(document.getElementById("lat").value=String(a.lat),document.getElementById("lon").value=String(a.lon)),document.getElementById("btn-gps").addEventListener("click",async()=>{try{const t=await Ne();document.getElementById("lat").value=String(t.lat),document.getElementById("lon").value=String(t.lon),y("Location updated")}catch{y("Could not get location",!0)}}),de().then(t=>{if(t.ok&&Array.isArray(t.data?.kundalis)){const n=document.getElementById("kundali-select");for(const r of t.data.kundalis){const s=document.createElement("option");s.value=String(r.id),s.textContent=r.label,n.appendChild(s)}}}),document.getElementById("btn-check").addEventListener("click",async()=>{const t=Number(document.getElementById("lat").value),n=Number(document.getElementById("lon").value);if(!Number.isFinite(t)||!Number.isFinite(n)){y("Set your location first",!0);return}const r=document.getElementById("purpose").value,s=document.getElementById("kundali-select").value,o=s?Number(s):void 0,i=document.getElementById("muhurta-loading"),u=document.getElementById("muhurta-result");i.classList.remove("hidden"),u.classList.add("hidden");const d=await De(t,n,r,o);if(i.classList.add("hidden"),!d.ok){y(d.data?.error??"Request failed",!0);return}const l=d.data;u.classList.remove("hidden"),u.innerHTML=ba(l)})}function ba(e){const a=e.score>=70?"score-good":e.score>=40?"score-mid":"score-bad",t=(e.layers??[]).map(r=>`<div class="layer"><strong>${r.name}</strong>: ${r.detail} (${r.impact})</div>`).join(""),n=[];if(e.panchaka?.active&&n.push(`⚠️ Panchaka Dosha: ${e.panchaka.note}`),e.ganda_moola?.active&&n.push(`⚠️ Ganda Moola: ${e.ganda_moola.note}`),e.combustion?.length)for(const r of e.combustion)n.push(`🔥 ${r.planet} combust (${r.angular_distance.toFixed(1)}°)`);return`
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
      ${n.length?`<div class="warnings">${n.join("<br/>")}</div>`:""}
      <div class="hora-window">Window: ${Le(e.hora_start)} – ${Le(e.hora_end)}</div>
    </div>
  `}function Le(e){if(!e)return"?";try{return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return e}}async function ga(){const e=z();I(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>g("/dashboard"));const a=document.getElementById("btn-add"),t=document.getElementById("btn-add-empty");a.addEventListener("click",()=>g("/kundali-form")),t&&t.addEventListener("click",()=>g("/kundali-form"));try{const n=await de(),r=document.getElementById("loading"),s=document.getElementById("list"),o=document.getElementById("empty"),i=n.ok&&Array.isArray(n.data?.kundalis)?n.data.kundalis:[];r.style.display="none",i.length===0?o.style.display="block":(s.style.display="block",ha(s,i))}catch(n){console.error("Failed to load kundalis:",n),y("Failed to load kundalis",!0)}}function ha(e,a){e.innerHTML=a.map(t=>`
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
  `).join(""),e.querySelectorAll(".view-btn").forEach(t=>{t.addEventListener("click",n=>{const r=n.target.dataset.id;r&&g(`/birth-chart?id=${r}`)})}),e.querySelectorAll(".delete-btn").forEach(t=>{t.addEventListener("click",async n=>{n.stopPropagation();const r=n.target.dataset.id,s=e.querySelector(`[data-id="${r}"]`),o=s?.querySelector("h3")?.textContent||"this kundali";if(confirm(`Delete ${o}? This cannot be undone.`))try{const i=await na(Number(r));i.ok?(y("Kundali deleted"),s?.remove(),e.querySelectorAll(".kundali-item").length===0&&(e.style.display="none",document.getElementById("empty").style.display="block")):y(i.data?.error??"Failed to delete kundali",!0)}catch(i){console.error("Delete error:",i),y("Error deleting kundali",!0)}})})}const fa=[{value:"Asia/Kolkata",label:"India (IST)"},{value:"Asia/Bangkok",label:"Thailand (ICT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Australia/Sydney",label:"Sydney (AEDT)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"America/New_York",label:"New York (EST/EDT)"},{value:"America/Los_Angeles",label:"Los Angeles (PST/PDT)"},{value:"America/Chicago",label:"Chicago (CST/CDT)"}];async function ya(){const e=z();I(e),e.innerHTML=`
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
            ${fa.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("name"),n=document.getElementById("birth-date"),r=document.getElementById("birth-time"),s=document.getElementById("lat"),o=document.getElementById("lon"),i=document.getElementById("timezone"),u=document.getElementById("btn-gps"),d=document.getElementById("btn-search-place"),l=document.getElementById("place-search"),c=document.getElementById("place-results"),v=document.getElementById("place-confirmed"),m=document.getElementById("btn-cancel"),p=document.getElementById("error-box"),h=new Date().toISOString().split("T")[0];n.value=h;const k=Ae();k&&(s.value=String(k.lat),o.value=String(k.lon)),i.value="Asia/Kolkata";async function x(){const b=l.value.trim();if(b){d.textContent="⏳",d.setAttribute("disabled","true"),c.style.display="none",c.innerHTML="";try{const f=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(b)}&format=json&limit=10&addressdetails=1&countrycodes=in`,w=await(await fetch(f,{headers:{"Accept-Language":"en,hi"}})).json();if(!w.length){const $=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(b+" India")}&format=json&limit=10&addressdetails=1`,L=await(await fetch($,{headers:{"Accept-Language":"en,hi"}})).json();if(!L.length){c.innerHTML=`<div style="padding:8px;color:#7a4800;font-size:0.82rem;">
            Jagah nahi mili. Try karein:<br>
            • Poora naam likhein (e.g. "Raghogarh Madhya Pradesh")<br>
            • Tehsil ya district add karein (e.g. "Mendori Raisen")<br>
            • Nearest town ka naam try karein
          </div>`,c.style.display="block";return}E(L);return}E(w)}catch{c.innerHTML='<div style="padding:8px;color:#cc0000;font-size:0.82rem;">Search failed. Manually latitude/longitude fill karein.</div>',c.style.display="block"}finally{d.textContent="🔍",d.removeAttribute("disabled")}}}function E(b){c.innerHTML=b.map((f,B)=>{const w=f.address||{},$=[],M=w.village||w.hamlet||w.suburb||w.town||w.city||w.municipality||f.display_name.split(",")[0],L=w.county||w.district||w.state_district||"",S=w.state||"";M&&$.push(M.trim()),L&&L!==M&&$.push(L.trim()),S&&$.push(S.trim());const _=$.length>=2?$.join(", "):f.display_name.split(",").slice(0,4).join(", ");return`<div class="place-result-item" data-i="${B}" data-lat="${f.lat}" data-lon="${f.lon}" data-name="${_}"
        style="padding:8px 12px;cursor:pointer;font-size:0.82rem;border-bottom:1px solid #E8C89A;color:#3a1a00;"
        onmouseover="this.style.background='#FFF0DC'" onmouseout="this.style.background=''">${_}</div>`}).join(""),c.style.display="block",c.querySelectorAll(".place-result-item").forEach(f=>{f.addEventListener("click",()=>{const B=parseFloat(f.dataset.lat),w=parseFloat(f.dataset.lon),$=f.dataset.name;s.value=B.toFixed(6),o.value=w.toFixed(6),l.value=$,c.style.display="none",v.textContent=`✓ ${$} (${B.toFixed(4)}°N, ${w.toFixed(4)}°E)`,v.style.display="block"})})}d.addEventListener("click",b=>{b.preventDefault(),x()}),l.addEventListener("keydown",b=>{b.key==="Enter"&&(b.preventDefault(),x())}),u.addEventListener("click",async b=>{b.preventDefault();try{const f=await Ne();s.value=String(f.lat),o.value=String(f.lon),y("Location updated")}catch{y("Could not get location",!0)}}),m.addEventListener("click",b=>{b.preventDefault(),g("/kundali")}),a.addEventListener("submit",async b=>{b.preventDefault(),p.style.display="none";const f=t.value.trim(),B=n.value,w=r.value,$=parseFloat(s.value),M=parseFloat(o.value),L=i.value;if(!f||!B||!w||!L||isNaN($)||isNaN(M)){p.textContent="Please fill in all fields",p.style.display="block";return}if($<-90||$>90){p.textContent="Latitude must be between -90 and 90",p.style.display="block";return}if(M<-180||M>180){p.textContent="Longitude must be between -180 and 180",p.style.display="block";return}const S=document.getElementById("btn-submit");S.disabled=!0,S.textContent="Creating...";try{const[_,ye,xe]=B.split("-"),[ke,we]=w.split(":"),zt=`${_}-${ye}-${xe}T${ke}:${we}:00`,It=new Intl.DateTimeFormat("en-US",{timeZone:L,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),$e=new Date(`${_}-${ye}-${xe}T${ke}:${we}:00`),R=new Intl.DateTimeFormat("en-US",{timeZone:L,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date),Je=new Date(parseInt(R.find(C=>C.type==="year")?.value||"2000"),parseInt(R.find(C=>C.type==="month")?.value||"1")-1,parseInt(R.find(C=>C.type==="day")?.value||"1"),parseInt(R.find(C=>C.type==="hour")?.value||"0"),parseInt(R.find(C=>C.type==="minute")?.value||"0"),parseInt(R.find(C=>C.type==="second")?.value||"0")),Ye=$e.getTime()-Je.getTime(),Qe=new Date($e.getTime()-Ye).toISOString().split(".")[0],Se=await ra({label:f,birth_date:Qe,latitude:$,longitude:M,timezone:L});if(Se.ok)y("Kundali created successfully"),g("/kundali");else{const C=Se.data?.error||"Failed to create kundali";p.textContent=C,p.style.display="block",S.disabled=!1,S.textContent="Create Kundali"}}catch(_){console.error("Create error:",_),p.textContent="Error creating kundali",p.style.display="block",S.disabled=!1,S.textContent="Create Kundali"}}),document.getElementById("btn-back").addEventListener("click",()=>g("/kundali"))}async function xa(){const e=z();I(e),e.innerHTML=`
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),n=document.getElementById("activity"),r=document.getElementById("query-time"),s=document.getElementById("btn-cancel"),o=document.getElementById("error-box"),i=document.getElementById("result"),u=new Date;r.value=u.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"});try{const d=await de(),l=d.ok&&Array.isArray(d.data?.kundalis)?d.data.kundalis:[];if(l.length===0){y("Please create a kundali first",!0),g("/kundali-form");return}t.innerHTML=l.map(c=>`<option value="${c.id}">${c.label||"Unnamed"}</option>`).join("")}catch(d){console.error("Failed to load kundalis:",d),y("Failed to load kundalis",!0)}try{const d=await ia(),l=d.ok&&Array.isArray(d.data?.activities)?d.data.activities:[];n.innerHTML='<option value="">-- Select --</option>'+l.map(c=>`<option value="${c.code}">${c.name}</option>`).join("")}catch(d){console.error("Failed to load activities:",d),y("Failed to load activities",!0)}s.addEventListener("click",d=>{d.preventDefault(),g("/dashboard")}),a.addEventListener("submit",async d=>{d.preventDefault(),o.style.display="none",i.style.display="none";const l=parseInt(t.value),c=n.value;if(!l||!c){o.textContent="Please select both kundali and activity",o.style.display="block";return}const v=document.getElementById("btn-submit");v.disabled=!0,v.textContent="Checking...";try{const m=await oa(l,c);if(m.ok){const p=m.data;i.innerHTML=`
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
        `,i.style.display="block"}else{const p=m.data?.error||"Failed to query KP";o.textContent=p,o.style.display="block"}}catch(m){console.error("Query error:",m),o.textContent="Error processing query",o.style.display="block"}finally{v.disabled=!1,v.textContent="Check Now"}}),document.getElementById("btn-back").addEventListener("click",()=>g("/dashboard"))}async function ka(){const e=z();I(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>g("/dashboard"));try{const a=await la(),t=document.getElementById("loading"),n=document.getElementById("stats"),r=document.getElementById("error");if(!a.ok){r.textContent=a.data?.error||"Failed to load stats",r.style.display="block",t.style.display="none";return}const s=a.data;document.getElementById("queries-24h").textContent=String(s.queries_24h||0),document.getElementById("active-users").textContent=String(s.active_users||0),document.getElementById("revenue").textContent=`₹${(s.revenue_estimate||0).toLocaleString("en-IN")}`,document.getElementById("conversion").textContent=`${(s.conversion_rate||0).toFixed(1)}%`;const o=(s.top_activities||[]).map(u=>`<div style="padding: var(--space-2); border-bottom: 1px solid var(--color-border);">
        <strong>${u.name}</strong>: ${u.count} queries
      </div>`).join("");document.getElementById("top-activities").innerHTML=o||"<p>No data</p>";const i=`
      <p><strong>D1 Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>KV Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>Error Rate (24h):</strong> ${(s.error_rate_pct||0).toFixed(2)}%</p>
      <p><strong>Rate Limit Events (24h):</strong> ${s.rate_limit_events||0}</p>
    `;document.getElementById("system-health").innerHTML=i,t.style.display="none",n.style.display="block"}catch(a){console.error("Admin stats error:",a);const t=document.getElementById("error");t.textContent="Error loading stats",t.style.display="block",document.getElementById("loading").style.display="none"}}const wa=[{value:"travel",label:"Travel"},{value:"marriage",label:"Marriage"},{value:"business",label:"Business"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"general",label:"General"}];async function $a(){const e=z();I(e),e.innerHTML=`
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
              ${wa.map(m=>`<option value="${m.value}">${m.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),n=document.getElementById("category"),r=document.getElementById("from-date"),s=document.getElementById("to-date"),o=document.getElementById("top-n"),i=document.getElementById("location"),u=document.getElementById("btn-cancel"),d=document.getElementById("error-box"),l=document.getElementById("results"),c=new Date,v=new Date(c);v.setDate(v.getDate()+30),r.value=c.toISOString().split("T")[0],s.value=v.toISOString().split("T")[0];try{const m=await de(),p=m.ok&&Array.isArray(m.data?.kundalis)?m.data.kundalis:[];if(p.length===0){y("Please create a kundali first",!0),g("/kundali-form");return}t.innerHTML=p.map(h=>`<option value="${h.id}" data-lat="${h.latitude}" data-lon="${h.longitude}">${h.label||"Unnamed"}</option>`).join(""),t.addEventListener("change",()=>{const h=t.options[t.selectedIndex],k=h.getAttribute("data-lat"),x=h.getAttribute("data-lon");i.value=k&&x?`${k}, ${x}`:""}),t.dispatchEvent(new Event("change"))}catch(m){console.error("Failed to load kundalis:",m),y("Failed to load kundalis",!0)}u.addEventListener("click",m=>{m.preventDefault(),g("/dashboard")}),a.addEventListener("submit",async m=>{m.preventDefault(),d.style.display="none",l.style.display="none";const p=parseInt(t.value),h=n.value,k=r.value,x=s.value,E=parseInt(o.value)||5;if(!p||!h||!k||!x){d.textContent="Please fill all required fields",d.style.display="block";return}if(new Date(k)>new Date(x)){d.textContent="Start date must be before end date",d.style.display="block";return}const b=document.getElementById("btn-submit");b.disabled=!0,b.textContent="Scanning...";try{const f=t.options[t.selectedIndex],B=parseFloat(f.getAttribute("data-lat")||"0"),w=parseFloat(f.getAttribute("data-lon")||"0"),$=await Pe({lat:B,lon:w,purpose:h,kundali_id:p,from:k,to:x,top_n:E});if($.ok){const L=$.data.results||[];L.length===0?l.innerHTML=`
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `:l.innerHTML=`
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${L.length} Auspicious Dates</h3>
              ${L.map((S,_)=>`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${S.muhurta_pct>70?"#10b981":"#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${_+1}: ${new Date(S.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${S.muhurta_pct>70?"#d1fae5":"#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${S.muhurta_pct>70?"#047857":"#92400e"}; font-weight: bold;">
                      ${S.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${S.best_time||"All day auspicious"}
                  </p>
                </div>
              `).join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `,l.style.display="block"}else{const M=$.data?.error||"Failed to scan dates";d.textContent=M,d.style.display="block"}}catch(f){console.error("Scan error:",f),d.textContent="Error scanning dates",d.style.display="block"}finally{b.disabled=!1,b.textContent="Scan Dates"}}),document.getElementById("btn-back").addEventListener("click",()=>g("/dashboard"))}async function Sa(){const e=z();I(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-refresh"),n=document.getElementById("btn-topup"),r=document.getElementById("balance-amount"),s=document.getElementById("batches-section"),o=document.getElementById("batches-list"),i=document.getElementById("transactions-list"),u=document.getElementById("no-transactions"),d=document.getElementById("error-box");async function l(){d.style.display="none",r.textContent="Loading...",t.disabled=!0,n.disabled=!0;try{const c=await _e();if(c.ok){const v=c.data;r.textContent=String(v.total_points??0);const m=Array.isArray(v.batches)?v.batches:[];m.length>0?(s.style.display="block",o.innerHTML=m.map(h=>{const k=new Date(h.expires_at),x=new Date,E=Math.ceil((k.getTime()-x.getTime())/(24*60*60*1e3)),b=E<=7,f=h.status==="active"?"Active":h.status==="held"?"Held":"Expired";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${b?"#ef4444":"#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${h.source==="free_trial"?"Free Trial":h.source==="subscription"?"Subscription":h.source==="referral"?"Referral":"Top-up"}</strong>
                    <span style="background: ${h.status==="active"?"#d1fae5":h.status==="held"?"#fef3c7":"#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${h.status==="active"?"#047857":h.status==="held"?"#92400e":"#6b7280"}; font-weight: bold;">
                      ${f}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${h.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${k.toLocaleDateString("en-IN")}
                      ${b&&h.status==="active"?` (${E}d left)`:""}
                    </span>
                  </div>
                </div>
              `}).join("")):s.style.display="none";const p=Array.isArray(v.transactions)?v.transactions:[];p.length>0?(u.style.display="none",i.innerHTML=p.slice(0,10).map(h=>{const k=new Date(h.created_at),x=h.type==="debit"?"-":"+",E=h.type==="debit"?"#dc2626":"#10b981",b=h.description||(h.type==="debit"?"Query":"Credit");return`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${E};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${b}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${k.toLocaleDateString("en-IN")} ${k.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${E};">
                      ${x}${h.amount}
                    </div>
                  </div>
                </div>
              `}).join("")):(u.style.display="block",i.innerHTML="")}else{const v=c.data?.error||"Failed to load wallet";d.textContent=v,d.style.display="block",r.textContent="Error"}}catch(c){console.error("Wallet load error:",c),d.textContent="Error loading wallet",d.style.display="block",r.textContent="Error"}finally{t.disabled=!1,n.disabled=!1}}a.addEventListener("click",()=>g("/dashboard")),t.addEventListener("click",l),n.addEventListener("click",()=>{y("Opening payment gateway...",!1),g("/orders")}),l()}async function Ea(){const e=z();I(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-copy"),n=document.getElementById("btn-share"),r=document.getElementById("btn-copy-message"),s=document.getElementById("referral-code"),o=document.getElementById("total-earned"),i=document.getElementById("referral-count"),u=document.getElementById("referred-users"),d=document.getElementById("no-referrals"),l=document.getElementById("error-box");let c="";async function v(){l.style.display="none";try{const m=await da();if(m.ok){const p=m.data;c=p.code||"";const h=p.stats||{},k=Array.isArray(p.referred_users)?p.referred_users:[];s.textContent=c||"LOADING...",o.textContent=`₹${h.total_earned??0}`,i.textContent=String(h.referral_count??0),k.length>0?(d.style.display="none",u.innerHTML=k.map(x=>{const E=x.commission_activated_at?new Date(x.commission_activated_at):null,b=x.commission_status==="active"?"Activated":x.commission_status==="held"?"Held":"Pending",f=x.commission_status==="active"?"#10b981":x.commission_status==="held"?"#f59e0b":"#6b7280";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${f};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${x.phone||"Anonymous"}</strong>
                    <span style="background: ${f}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${f}; font-weight: bold;">
                      ${b}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${x.commission_amount||0}</span>
                    <span>${x.referred_at?new Date(x.referred_at).toLocaleDateString("en-IN"):"—"}</span>
                  </div>
                  ${E?`
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${E.toLocaleDateString("en-IN")}
                    </div>
                  `:""}
                </div>
              `}).join("")):(d.style.display="block",u.innerHTML="")}else{const p=m.data?.error||"Failed to load referral data";l.textContent=p,l.style.display="block"}}catch(m){console.error("Referral load error:",m),l.textContent="Error loading referral data",l.style.display="block"}}a.addEventListener("click",()=>g("/dashboard")),t.addEventListener("click",async()=>{if(!c){y("Code not available",!0);return}try{await navigator.clipboard.writeText(c),y("Referral code copied!",!1)}catch{y("Failed to copy code",!0)}}),r.addEventListener("click",async()=>{const m=`Join me on OccultViision! Use my referral code: ${c}

https://www.occultviision.com`;try{await navigator.clipboard.writeText(m),y("Share message copied!",!1)}catch{y("Failed to copy message",!0)}}),n.addEventListener("click",()=>{const m=`Join me on OccultViision! Use my referral code: ${c}

https://www.occultviision.com`,p=`https://wa.me/?text=${encodeURIComponent(m)}`;window.open(p,"_blank")}),v()}function Z(e){const a=Math.floor(e),t=(e-a)*60,n=Math.floor(t),r=Math.round((t-n)*60);return`${a}°${n.toString().padStart(2,"0")}'${r.toString().padStart(2,"0")}"`}function ze(e){try{return new Date(e).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}catch{return e}}function Ie(e,a){return`${ze(e)} – ${ze(a)}`}function le(e){return`${e.starLord} → ${e.subLord} → ${e.subSubLord}`}const La={Sun:"☉",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"};function za(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}function ce(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return e}}async function Ia(e){const a=z();I(a);let t=e;if(!t){const i=window.location.hash,u=i.includes("?")?i.split("?")[1]:"",l=new URLSearchParams(u).get("id");t=l?parseInt(l,10):void 0}if(!t||isNaN(t)){a.innerHTML=`
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
    `,document.getElementById("btn-back").addEventListener("click",()=>g("/kundali")),document.getElementById("btn-list").addEventListener("click",()=>g("/kundali"));return}a.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>g("/kundali"));const n=await ge(t);if(!n.ok){a.innerHTML=`
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
    `,document.getElementById("btn-back2").addEventListener("click",()=>g("/kundali"));return}const{kundali:r,chart:s,meta:o}=n.data;Ta(a,r,s,o)}function Ta(e,a,t,n){const{ascendant:r,planets:s,cusps:o,dasha:i,janmaNakshatra:u,tara:d}=t;e.innerHTML=`
    <div class="screen birth-chart-screen">

      <!-- ── Header ── -->
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>${a.label??`Kundali #${a.id}`}</h2>
        <button class="btn btn-small" id="btn-kp">KP Query</button>
      </header>

      <!-- ── Birth Details Banner ── -->
      <div class="chart-meta-banner">
        <div class="chart-meta-item">
          <span class="meta-label">Birth</span>
          <span class="meta-val">${ce(a.birth_date)}</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Lat / Lon</span>
          <span class="meta-val">${a.latitude.toFixed(4)}°N, ${a.longitude.toFixed(4)}°E</span>
        </div>
        <div class="chart-meta-item">
          <span class="meta-label">Ayanamsa</span>
          <span class="meta-val">${t.ayanamsa} ${Z(t.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- ── Ascendant Card ── -->
      <section class="chart-section">
        <h3 class="section-title">Ascendant (Lagna)</h3>
        <div class="asc-card">
          <div class="asc-main">
            <span class="asc-sign">${r.rashiName}</span>
            <span class="asc-deg">${Z(r.deg)}</span>
          </div>
          <div class="asc-detail">
            <span>${r.nakName} Pada ${r.nakPada} | Lord: ${r.nakLord}</span>
          </div>
          <div class="asc-kp">
            <span class="kp-label">KP Sub-lord chain:</span>
            <span class="kp-val">${le(r.kp)}</span>
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
              <div class="dasha-dates">${Ie(i.maha.start,i.maha.end)}</div>
            </div>
            <div class="dasha-divider">›</div>
            <div class="dasha-item dasha-antar">
              <div class="dasha-lord">${i.antar.lord}</div>
              <div class="dasha-role">Antar Dasha</div>
              <div class="dasha-dates">${Ie(i.antar.start,i.antar.end)}</div>
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
          <div class="tara-card ${za(d.beneficence)}">
            <div class="tara-num">Tara ${d.number}</div>
            <div class="tara-name">${d.name}</div>
            <div class="tara-moon">Transit Moon: ${d.transitMoonNakName}</div>
            <div class="tara-as-of">as of ${ce(d.asOf)}</div>
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
                  <td><span class="planet-sym">${La[l.planet]??""}</span> ${l.planet}</td>
                  <td class="text-center">${l.house}</td>
                  <td>${l.rashiName}</td>
                  <td class="mono">${Z(l.degInRashi)}</td>
                  <td>${l.nakName} P${l.nakPada}</td>
                  <td class="kp-chain-cell">${le(l.kp)}</td>
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
                  <td class="mono">${Z(l.degInRashi)}</td>
                  <td>${l.nakName} P${l.nakPada}</td>
                  <td class="kp-chain-cell">${le(l.kp)}</td>
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
          <span>Computed: ${ce(n.computed_at)}</span>
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
  `,document.getElementById("btn-back").addEventListener("click",()=>g("/kundali")),document.getElementById("btn-kp").addEventListener("click",()=>g("/kp-query")),document.getElementById("btn-kp-query-bottom").addEventListener("click",()=>g("/kp-query")),document.getElementById("btn-muhurta-bottom").addEventListener("click",()=>g("/muhurta")),document.getElementById("btn-dasha-bottom").addEventListener("click",()=>g(`/dasha-timeline?kundali_id=${a.id}`)),document.getElementById("btn-kp-sublords-bottom").addEventListener("click",()=>g(`/kp-sublords?kundali_id=${a.id}`)),document.getElementById("btn-muhurta-dashboard-bottom").addEventListener("click",()=>g(`/muhurta-dashboard?kundali_id=${a.id}`))}const Ca=23.2505,Ma=77.4065,K=60,He=[{slug:"property",label:"Property",icon:"🏠",priority:"P0"},{slug:"marriage",label:"Marriage",icon:"💍",priority:"P1"},{slug:"business",label:"Business",icon:"📈",priority:"P2"},{slug:"medical",label:"Medical",icon:"🏥",priority:"P3"}],Ba={Sun:"hora-sun",Moon:"hora-moon",Mars:"hora-mars",Mercury:"hora-mercury",Jupiter:"hora-jupiter",Venus:"hora-venus",Saturn:"hora-saturn"},Da=["","Janma","Sampat","Vipat","Kshema","Pratyak","Sadhana","Naidhana","Mitra","Param Mitra"];function D(e){try{return new Date(e).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return e}}function Pa(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}catch{return e}}function ne(e){return e>=80?{cls:"grade-a",label:"Excellent"}:e>=65?{cls:"grade-b",label:"Good"}:e>=50?{cls:"grade-c",label:"Moderate"}:e>=35?{cls:"grade-d",label:"Weak"}:{cls:"grade-f",label:"Avoid"}}function _a(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}let F,se=Ca,oe=Ma,X="Bhopal (default)",ee=null,ae=null,j=K;async function Aa(){const e=z();I(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",r=new URLSearchParams(t).get("kundali_id");F=r?parseInt(r,10):void 0,e.innerHTML=Na(F),Ha(e);try{await Fa()}catch{}await Fe(e),Ga(e)}function Na(e){return`
    <div class="screen muhurta-dashboard">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Muhurta Dashboard</h2>
          <span class="subtitle" id="location-label">Detecting location…</span>
        </div>
        <div class="header-right">
          <span class="refresh-badge" id="refresh-badge">⏱ ${K}s</span>
          ${e?'<button class="btn btn-small btn-ghost" id="btn-chart">Chart</button>':""}
        </div>
      </header>
      <div id="dashboard-body" style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function Ha(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{me(),g(F?`/birth-chart?id=${F}`:"/dashboard")}),e.querySelector("#btn-chart")?.addEventListener("click",()=>{me(),g(`/birth-chart?id=${F}`)})}async function Fa(){return new Promise(e=>{if(!navigator.geolocation){X="Bhopal (geoloc unavailable)",e();return}navigator.geolocation.getCurrentPosition(a=>{se=a.coords.latitude,oe=a.coords.longitude,X=`${se.toFixed(4)}°N, ${oe.toFixed(4)}°E`,e()},()=>{X="Bhopal (location denied)",e()},{timeout:5e3})})}async function Fe(e){const a=e.querySelector("#dashboard-body"),t=e.querySelector("#location-label");if(t&&(t.textContent=X),!!a)try{const n=await Ee(se,oe,"general",F);if(!n.ok||!n.data){a.innerHTML=Te(n.data?.error??"Failed to load muhurta data");return}const r=n.data;let s={};try{const o=await Promise.allSettled(He.map(i=>Ee(se,oe,i.slug,F).then(u=>({slug:i.slug,score:u.data?.score?.score??null}))));for(const i of o)i.status==="fulfilled"&&(s[i.value.slug]=i.value.score)}catch{}a.innerHTML=Ra(r,s),j=K}catch(n){console.error("[muhurta-dashboard] load error:",n),a.innerHTML=Te("Connection error. Will retry automatically.")}}function Ra(e,a){const t=[];return t.push(`
    <div class="md-timestamp">
      <span>As of <strong>${Pa(e.as_of)}</strong> IST</span>
      <span class="md-personalized-badge">${e.personalized?"🔮 Personalized":"🌐 Generic"}</span>
    </div>
  `),t.push(ja(e)),e.pancha_pakshi&&t.push(Ka(e.pancha_pakshi)),t.push(Oa(e)),t.push(qa(e)),t.push(Va(e)),e.score&&t.push(Ua(e.score)),t.push(Wa(a,e.score)),t.join(`
`)}function ja(e){const a=e.active_hora,t=e.active_uphora,n=a?`
      <div class="md-hora-card ${Ba[a.lord]??""}">
        <div class="hora-lord">${a.lord}</div>
        <div class="hora-meta">
          <span class="hora-badge">${a.is_daytime?"☀️ Day":"🌙 Night"}</span>
          <span class="hora-window">${D(a.start)} → ${D(a.end)}</span>
        </div>
      </div>`:'<div class="md-hora-card hora-unknown"><div class="hora-lord">—</div><div class="hora-meta">No hora data</div></div>',r=t?`
      <div class="md-uphora-card">
        <div class="uphora-label">Uphora (1/8 Hora)</div>
        <div class="uphora-lord">${t.sub}</div>
        <div class="uphora-window">${D(t.start)} → ${D(t.end)}</div>
      </div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">⏰ Current Hora</h3>
      <div class="md-hora-row">
        ${n}
        ${r}
      </div>
      <div class="md-sun-row">
        <span>🌅 Sunrise ${D(e.sunrise)}</span>
        <span>🌇 Sunset ${D(e.sunset)}</span>
      </div>
    </section>
  `}function Ka(e){const a=e.favorability_score,{cls:t,label:n}=ne(a),r=Math.round(e.confidence*100);return`
    <section class="md-section">
      <h3 class="md-section-title">🦅 Pancha Pakshi</h3>
      <div class="md-pakshi-card">
        <div class="pakshi-bird">${e.bird}</div>
        <div class="pakshi-meta">
          <span class="pakshi-confidence">Confidence: ${r}%</span>
          <span class="pakshi-precision">Precision: ±${e.precision_minutes}m</span>
          <span class="pakshi-window">${D(e.cycle_start)} → ${D(e.cycle_end)}</span>
        </div>
        <div class="md-score-bar-wrap">
          <div class="md-score-bar ${t}" style="width:${a}%"></div>
        </div>
        <div class="pakshi-grade ${t}">${n} (${a}/100)</div>
      </div>
    </section>
  `}function Oa(e){const a=e.rahu_kaal,t=a.active_now?"rk-active":"rk-inactive",n=a.active_now?'<span class="badge badge-danger">⚠ ACTIVE NOW</span>':'<span class="badge badge-ok">✓ Not active</span>';return`
    <section class="md-section">
      <h3 class="md-section-title">🐍 Rahu Kaal</h3>
      <div class="md-rk-card ${t}">
        ${n}
        <span class="rk-window">${D(a.start)} – ${D(a.end)}</span>
        ${a.active_now?'<p class="rk-warning">Avoid new ventures during Rahu Kaal.</p>':""}
      </div>
    </section>
  `}function qa(e){const a=e.current_nakshatra,t=e.tara;let n='<div class="tara-unavailable">Add a kundali to see personalized Tara</div>';if(t){const r=_a(t.beneficence),s=Da[t.number]??t.name,o=t.beneficence==="benefic"?"✅":t.beneficence==="malefic"?"❌":"⚪";n=`
      <div class="md-tara-card ${r}">
        <div class="tara-number">Tara ${t.number}</div>
        <div class="tara-name">${o} ${s}</div>
        <div class="tara-beneficence">${t.beneficence.charAt(0).toUpperCase()+t.beneficence.slice(1)}</div>
      </div>
    `}return`
    <section class="md-section">
      <h3 class="md-section-title">⭐ Nakshatra + Tara</h3>
      <div class="md-nak-row">
        <div class="md-nak-card">
          <div class="nak-label">Transit Moon</div>
          <div class="nak-name">${a.name}</div>
          <div class="nak-idx">Nakshatra ${a.idx+1}/27</div>
        </div>
        ${n}
      </div>
    </section>
  `}function Va(e){const a=[];if(e.panchaka_dosha?.active&&a.push(`⚠️ <strong>Panchaka Dosha</strong>${e.panchaka_dosha.dosha?` — ${e.panchaka_dosha.dosha}`:""}: Avoid cremation, travel south, construction.`),e.ganda_moola?.active&&a.push(`⚠️ <strong>Ganda Moola</strong>${e.ganda_moola.nakshatra?` (${e.ganda_moola.nakshatra})`:""}: Inauspicious nakshatra — avoid ceremonies.`),e.dishashool?.active&&a.push(`⚠️ <strong>Dishashool</strong>${e.dishashool.direction?` — ${e.dishashool.direction}`:""}: Travel in this direction is inauspicious today.`),e.combustion?.venus?.combust){const t=e.combustion.venus.orb?` (${e.combustion.venus.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Venus Combust</strong>${t}: Marriage muhurtas affected.`)}if(e.combustion?.jupiter?.combust){const t=e.combustion.jupiter.orb?` (${e.combustion.jupiter.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Jupiter Combust</strong>${t}: Upanayana, marriage, ceremonies affected.`)}return a.length===0?`
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
  `}function Ua(e){const{cls:a,label:t}=ne(e.score),n=Math.round(e.score),r=(e.layers??[]).map(o=>{const i=Math.round(o.score),{cls:u}=ne(o.score);return`
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
        <div class="score-big ${a}">${n}</div>
        <div class="score-grade-label ${a}">${t} ${e.grade?`(${e.grade})`:""}</div>
        <div class="md-score-bar-wrap main-bar">
          <div class="md-score-bar ${a}" style="width:${n}%"></div>
        </div>
        ${e.summary?`<p class="score-summary">${e.summary}</p>`:""}
        ${s}
        ${r?`<div class="score-layers">${r}</div>`:""}
      </div>
    </section>
  `}function Wa(e,a){return`
    <section class="md-section">
      <h3 class="md-section-title">🎯 Event Suitability</h3>
      <div class="md-event-grid">${He.map(n=>{const r=e[n.slug]??null,s=r!==null?Math.round(r):a?Math.round(a.score):null,{cls:o,label:i}=s!==null?ne(s):{cls:"grade-na",label:"—"};return`
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
  `}function Te(e){return`<div class="error-card" style="margin: var(--space-6) 0;"><p>${e}</p></div>`}function Ga(e){me(),ae=setInterval(()=>{j--;const a=e.querySelector("#refresh-badge");a&&(a.textContent=`⏱ ${j}s`),j<=0&&(j=K)},1e3),ee=setInterval(async()=>{j=K,await Fe(e)},K*1e3)}function me(){ee&&(clearInterval(ee),ee=null),ae&&(clearInterval(ae),ae=null)}Ja();function Ja(){const e="muhurta-dashboard-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const A=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"],q={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17},V={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},U={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#d97706",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"};function Ya(e,a){const t=Date.now(),n=[];let r=e.getTime();for(let s=0;s<9;s++){const o=(a+s)%9,i=A[o],u=q[i]*365.25*864e5,d=new Date(r),l=new Date(r+u),c=t>=d.getTime()&&t<l.getTime(),v=t>=l.getTime();n.push({lord:i,start:d,end:l,idx:s,isCurrent:c,isPast:v,antars:Qa({lord:i,start:d})}),r+=u}return n}function Qa(e){const a=Date.now(),t=A.indexOf(e.lord),n=q[e.lord],r=[];let s=e.start.getTime();for(let o=0;o<9;o++){const i=(t+o)%9,u=A[i],d=q[u]/120*n*365.25*864e5,l=new Date(s),c=new Date(s+d),v=a>=l.getTime()&&a<c.getTime(),m={lord:u,start:l,end:c};v&&(m.pratyantar=Za({lord:u,start:l,end:c})),r.push(m),s+=d}return r}function Za(e,a){const t=A.indexOf(e.lord),n=e.end.getTime()-e.start.getTime(),r=120,s=[];let o=e.start.getTime();for(let i=0;i<9;i++){const u=(t+i)%9,d=A[u],c=q[d]/r*n,v=new Date(o),m=new Date(o+c);s.push({lord:d,start:v,end:m}),o+=c}return s}function W(e){return e.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}function P(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function Re(e,a){const t=(a.getTime()-e.getTime())/315576e5;if(t>=1)return`${t.toFixed(1)}y`;const n=t*12;return n>=1?`${n.toFixed(1)}m`:`${Math.round(t*365)}d`}function Xa(e,a){const t=Date.now();return t<=e.getTime()?0:t>=a.getTime()?100:Math.round((t-e.getTime())/(a.getTime()-e.getTime())*100)}let ve,Q=-1;async function et(){const e=z();I(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(a).get("kundali_id");if(!n){e.innerHTML=te("Missing kundali_id parameter.");return}ve=parseInt(n,10),e.innerHTML=at(),je(e);try{const r=await ge(ve);if(!r.ok||!r.data){e.innerHTML=te(r.data?.error??"Failed to load chart data.");return}const{chart:s,kundali:o}=r.data;Ke(e,s,o)}catch(r){console.error("[dasha-timeline]",r),e.innerHTML=te("Connection error. Please try again.")}}function at(){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function je(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{g(`/birth-chart?id=${ve}`)})}function Ke(e,a,t){const{dasha:n,janmaNakshatra:r}=a;if(!n){e.innerHTML=te("Dasha calculation unavailable for this chart.");return}const s=r.lord,o=A.indexOf(s),i=new Date(n.maha.start),u=n.maha.lord,d=A.indexOf(u);let l=i.getTime(),c=0;if(o!==-1&&d!==-1){c=(d-o+9)%9;for(let b=0;b<c;b++){const f=A[(o+b)%9];l-=q[f]*365.25*864e5}}const v=Ya(new Date(l),o!==-1?o:d),m=v.findIndex(b=>b.isCurrent);Q===-1&&(Q=m>=0?m:0);const p=v[0].start,k=v[v.length-1].end.getTime()-p.getTime(),x=v[Q],E=x.antars.find(b=>Date.now()>=b.start.getTime()&&Date.now()<b.end.getTime())??null;e.innerHTML=`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Dasha Timeline</h2>
          <span class="subtitle">${t.label??"Birth Chart"}</span>
        </div>
      </header>
      <div class="dt-body">
        ${tt(r,n)}
        ${rt(v,p,k)}
        ${nt(v)}
        ${st(x,E)}
      </div>
    </div>
  `,je(e),it(e,v,a,t)}function tt(e,a){return`
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
            <span class="dt-lord" style="color:${U[a.maha.lord]??"inherit"}">
              ${V[a.maha.lord]??""} ${a.maha.lord}
            </span>
            <span class="dt-window">${P(new Date(a.maha.start))} → ${P(new Date(a.maha.end))}</span>
          </div>
          <div class="dt-antar-now">
            <span class="dt-label">Antardasha</span>
            <span class="dt-lord" style="color:${U[a.antar.lord]??"inherit"}">
              ${V[a.antar.lord]??""} ${a.antar.lord}
            </span>
            <span class="dt-window">${P(new Date(a.antar.start))} → ${P(new Date(a.antar.end))}</span>
          </div>
        </div>
      </div>
    </section>
  `}function rt(e,a,t){const n=e.map(s=>{const o=((s.start.getTime()-a.getTime())/t*100).toFixed(2),i=((s.end.getTime()-s.start.getTime())/t*100).toFixed(2),u=U[s.lord]??"#888";return`<div class="${s.isCurrent?"tl-seg current":s.isPast?"tl-seg past":"tl-seg future"}" style="left:${o}%;width:${i}%;background:${u}${s.isPast?"66":s.isCurrent?"":"33"};"
              title="${s.lord}: ${P(s.start)}–${P(s.end)}">
              <span class="tl-seg-label">${s.lord}</span>
            </div>`}).join(""),r=e.length>0?Math.max(0,Math.min(100,(Date.now()-a.getTime())/t*100)).toFixed(2):"0";return`
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
  `}function nt(e){return`
    <section class="dt-section">
      <h3 class="dt-section-title">🪐 Mahadasha Periods <span class="dt-hint">Tap to expand</span></h3>
      <div class="dt-maha-list" id="maha-list">
        ${e.map((t,n)=>{const r=t.isCurrent?Xa(t.start,t.end):t.isPast?100:0,s=U[t.lord]??"#888";return`
      <div class="${t.isCurrent?"maha-card current":t.isPast?"maha-card past":"maha-card future"}${n===Q?" selected":""}" data-maha-idx="${n}" style="--planet-color:${s}">
        <div class="maha-left">
          <div class="maha-glyph">${V[t.lord]??""}</div>
          <div class="maha-info">
            <div class="maha-lord">${t.lord}</div>
            <div class="maha-years">${q[t.lord]}y</div>
          </div>
        </div>
        <div class="maha-right">
          <div class="maha-window">${W(t.start)} → ${W(t.end)}</div>
          ${t.isCurrent?`
            <div class="maha-progress-wrap">
              <div class="maha-progress-bar" style="width:${r}%;background:${s}"></div>
            </div>
            <div class="maha-pct">${r}% elapsed</div>
          `:""}
        </div>
        ${t.isCurrent?'<span class="maha-now-badge">NOW</span>':""}
      </div>
    `}).join("")}
      </div>
    </section>
  `}function st(e,a){const t=e.antars.map(r=>{const s=Date.now()>=r.start.getTime()&&Date.now()<r.end.getTime(),o=Date.now()>=r.end.getTime(),i=U[r.lord]??"#888";return`
      <div class="${s?"antar-row current":o?"antar-row past":"antar-row future"}">
        <div class="antar-left">
          <span class="antar-glyph" style="color:${i}">${V[r.lord]??""}</span>
          <span class="antar-lord">${r.lord}</span>
          ${s?'<span class="antar-now-badge">NOW</span>':""}
        </div>
        <div class="antar-right">
          <span class="antar-window">${W(r.start)} → ${W(r.end)}</span>
          <span class="antar-dur">${Re(r.start,r.end)}</span>
        </div>
      </div>
    `}).join(""),n=a?.pratyantar?ot(a):"";return`
    <section class="dt-section">
      <h3 class="dt-section-title">
        🔵 Antardashas — ${V[e.lord]??""} ${e.lord} Maha
        <span class="dt-hint">(${P(e.start)} – ${P(e.end)})</span>
      </h3>
      <div class="dt-antar-list">${t}</div>
      ${n}
    </section>
  `}function ot(e){if(!e.pratyantar?.length)return"";const a=e.pratyantar.map(t=>{const n=Date.now()>=t.start.getTime()&&Date.now()<t.end.getTime(),r=Date.now()>=t.end.getTime(),s=U[t.lord]??"#888";return`
      <div class="${n?"prat-row current":r?"prat-row past":"prat-row"}">
        <span class="prat-glyph" style="color:${s}">${V[t.lord]??""}</span>
        <span class="prat-lord">${t.lord}</span>
        ${n?'<span class="prat-now-badge">NOW</span>':""}
        <span class="prat-window">${W(t.start)} – ${W(t.end)}</span>
        <span class="prat-dur">${Re(t.start,t.end)}</span>
      </div>
    `}).join("");return`
    <div class="dt-prat-section">
      <h4 class="dt-section-title">🔴 Pratyantar — ${e.lord} Antar</h4>
      <div class="dt-prat-list">${a}</div>
    </div>
  `}function te(e){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function it(e,a,t,n){e.querySelectorAll(".maha-card").forEach(r=>{r.addEventListener("click",()=>{Q=parseInt(r.dataset.mahaIdx??"0",10),Ke(e,t,n)})})}dt();function dt(){const e="dasha-timeline-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const lt={I:"Self, Health, Appearance",II:"Wealth, Family, Speech",III:"Courage, Siblings, Short Trips",IV:"Property, Mother, Happiness",V:"Children, Intelligence, Speculation",VI:"Enemies, Disease, Service",VII:"Marriage, Business Partners",VIII:"Longevity, Hidden, Inheritance",IX:"Luck, Father, Dharma",X:"Career, Status, Authority",XI:"Gains, Desires, Elder Siblings",XII:"Loss, Abroad, Liberation"},he={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},fe={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#b45309",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"},Oe={Aries:"Ar",Taurus:"Ta",Gemini:"Ge",Cancer:"Cn",Leo:"Le",Virgo:"Vi",Libra:"Li",Scorpio:"Sc",Sagittarius:"Sg",Capricorn:"Cp",Aquarius:"Aq",Pisces:"Pi"};let be,re="cusps";async function ct(){const e=z();I(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(a).get("kundali_id");if(!n){e.innerHTML=ue("Missing kundali_id parameter.");return}be=parseInt(n,10),e.innerHTML=mt(),Ue(e);try{const r=await sa(be);if(!r.ok||!r.data){e.innerHTML=ue(r.data?.error??"Failed to load KP chart.");return}qe(e,r.data)}catch(r){console.error("[kp-sublords]",r),e.innerHTML=ue("Connection error. Please try again.")}}function qe(e,a){e.innerHTML=`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>KP Sub-Lords</h2>
          <span class="subtitle">Krishnamurti Paddhati · Placidus Sidereal</span>
        </div>
      </header>

      <div class="kp-tabs" role="tablist">
        <button class="kp-tab${re==="cusps"?" active":""}" data-tab="cusps" role="tab">
          🏠 Bhavas (12)
        </button>
        <button class="kp-tab${re==="planets"?" active":""}" data-tab="planets" role="tab">
          🪐 Planets (${a.planet_sub_lords.length})
        </button>
      </div>

      <div class="kp-body">
        ${re==="cusps"?ut(a.house_cusps):pt(a.planet_sub_lords)}
      </div>

      <div class="kp-caveat">${a.ayanamsa_caveat}</div>
    </div>
  `,Ue(e),vt(e,a)}function ut(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the cusp</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Primary significator (KP prime indicator)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (fine-tuning)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const n=lt[t.house]??"",r=t.sign??"",s=Oe[r]??r.slice(0,2),o=t.deg_in_sign.toFixed(2);return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-house-badge">H${t.house}</div>
          <div class="kp-row-meta">
            <span class="kp-pos">${s} ${o}°</span>
            <span class="kp-theme">${n}</span>
          </div>
        </div>
        <div class="kp-chain">
          ${O("Star",t.star_lord)}
          ${ie()}
          ${O("Sub",t.sub_lord,!0)}
          ${ie()}
          ${O("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Ve(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function pt(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the planet</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Controls planet's results (KP prime)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (finer detail)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const n=t.sign??"",r=Oe[n]??n.slice(0,2),s=t.deg_in_sign.toFixed(2),o=fe[t.planet]??"#888",i=he[t.planet]??"";return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-planet-badge" style="color:${o}">
            ${i} ${t.planet}
          </div>
          <div class="kp-row-meta">
            <span class="kp-pos">${r} ${s}°</span>
          </div>
        </div>
        <div class="kp-chain">
          ${O("Star",t.star_lord)}
          ${ie()}
          ${O("Sub",t.sub_lord,!0)}
          ${ie()}
          ${O("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Ve(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function O(e,a,t=!1){const n=fe[a]??"#888",r=he[a]??"";return`
    <div class="kp-chain-cell${t?" prime":""}">
      <div class="kp-chain-label">${e}</div>
      <div class="kp-chain-lord" style="color:${n}">
        ${r} ${a}
      </div>
    </div>
  `}function ie(){return'<div class="kp-chain-arrow">→</div>'}function Ve(e){const a=fe[e]??"#888",t=he[e]??"";return`<span class="lord-chip" style="color:${a}">${t} ${e}</span>`}function mt(){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="spinner" style="margin:40px auto"></div>
      </div>
    </div>
  `}function ue(e){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function Ue(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{g(`/birth-chart?id=${be}`)})}function vt(e,a){e.querySelectorAll(".kp-tab").forEach(t=>{t.addEventListener("click",()=>{re=t.dataset.tab??"cusps",qe(e,a)})})}bt();function bt(){const e="kp-sublords-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const Ce={property:{slug:"property",label:"Property Purchase",emoji:"🏠",defaultWindowDays:30,color:"#16a34a",scoringNotes:["Moon in 4th house sign (Cancer) or aspecting it = strong for property","4th house sub-lord (KP) must signify 4, 11 — not 8, 12","Venus hora or Jupiter hora preferred (wealth + expansion)","Avoid Panchaka Dosha for property transactions","Vastu direction: prefer East or North muhurta times"],auspiciousHoras:["Venus","Jupiter","Mercury"]},marriage:{slug:"marriage",label:"Marriage Muhurta",emoji:"💍",defaultWindowDays:60,color:"#db2777",scoringNotes:["7th house sub-lord (KP) must signify 1, 2, 7, 11 — not 6, 8, 12","Moon + Venus strong (no combustion, no debilitation)","Venus hora preferred; avoid Saturn hora for auspicious ceremonies","Navpancham / Trikona Tara between bride and groom is ideal","Avoid Ashtama Navamsha (Lagna in 8th part of sign during ceremony)"],auspiciousHoras:["Venus","Jupiter","Moon"]},business:{slug:"business",label:"Business Launch",emoji:"🏢",defaultWindowDays:30,color:"#2563eb",scoringNotes:["10th house sub-lord (KP) must signify 1, 6, 10, 11","Mercury hora for registration/contracts; Sun hora for authority/leadership","Moon in waxing phase (Shukla Paksha) for new ventures","Avoid Rahu hora for business starts (instability, hidden obstacles)","Jupiter must not be in 6, 8, 12 from Lagna (Guru Chandal Dosha check)"],auspiciousHoras:["Mercury","Sun","Jupiter"]},medical:{slug:"medical",label:"Medical / Surgery",emoji:"🏥",defaultWindowDays:14,color:"#dc2626",scoringNotes:["Moon must be strong — not in 8th house, not debilitated (Scorpio), not eclipsed","Avoid Ashtami (8th Tithi) and Krishna Chaturdashi (14th dark fortnight)","8th house sub-lord (KP) must NOT signify 2, 7 (maraka houses)","Sun hora for surgeries involving head/eye; Mars hora for procedures","Avoid Ganda Moola nakshatras — flag shown if active in selected window"],auspiciousHoras:["Sun","Mercury","Jupiter"]}};let H=null,Me="property",J=null,Y=null;async function gt(){const e=z();I(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",n=new URLSearchParams(t),r=n.get("purpose")??"property";Me=Ce[r]?r:"property";const s=n.get("kundali_id");H=s?parseInt(s,10):null;const o=Ce[Me];if(e.innerHTML=kt(o),We(e),H&&!isNaN(H))try{const i=await ge(H);if(i.ok&&i.data){const{kundali:u}=i.data;J=u.latitude,Y=u.longitude}}catch{}ht(e,o)}function ht(e,a){const t=new Date().toISOString().slice(0,10),n=new Date(Date.now()+a.defaultWindowDays*864e5).toISOString().slice(0,10),r=J!==null?J.toFixed(4):"",s=Y!==null?Y.toFixed(4):"",o=J!==null&&Y!==null;e.innerHTML=`
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
          ${a.scoringNotes.map(i=>`<li>${i}</li>`).join("")}
        </ul>
        <div class="em-auspicious-horas">
          Preferred Horas: ${a.auspiciousHoras.map(i=>`<span class="hora-chip hora-${i.toLowerCase()}">${i}</span>`).join(" ")}
        </div>
      </section>

      <!-- Search Form -->
      <section class="em-form">
        <div class="em-form-title">Find Auspicious Windows</div>

        ${o?`
        <div class="em-location-confirmed">
          📍 Using birth location: ${J.toFixed(4)}°N, ${Y.toFixed(4)}°E
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
              <input type="date" id="inp-from" class="em-input" value="${t}" min="${t}" />
            </div>
            <div>
              <div class="em-date-label">To</div>
              <input type="date" id="inp-to" class="em-input" value="${n}" min="${t}" />
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
  `,wt(),We(e),ft(e,a)}function ft(e,a){const t=e.querySelector("#btn-scan");t&&t.addEventListener("click",async()=>{const n=document.getElementById("em-error");n.style.display="none";const r=document.getElementById("inp-lat").value,s=document.getElementById("inp-lon").value,o=document.getElementById("inp-from").value,i=document.getElementById("inp-to").value,u=parseFloat(r),d=parseFloat(s);if(!Number.isFinite(u)||u<-90||u>90){N(n,"Latitude must be between -90 and 90.");return}if(!Number.isFinite(d)||d<-180||d>180){N(n,"Longitude must be between -180 and 180.");return}if(!o||!i){N(n,"Please select a date range.");return}const l=new Date(o),c=new Date(i+"T23:59:59");if(c<=l){N(n,"'To' date must be after 'From' date.");return}const v=(c.getTime()-l.getTime())/864e5;if(v>90){N(n,"Date range cannot exceed 90 days.");return}t.disabled=!0,t.textContent="Scanning…";const m=document.getElementById("em-results");m.innerHTML=`
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
        <p style="margin-top:var(--space-3);color:var(--color-text-secondary)">
          Scanning ${Math.ceil(v)} days for auspicious windows…
        </p>
      </div>
    `;try{const p=await Pe({lat:u,lon:d,purpose:a.slug,kundali_id:H??void 0,from:l.toISOString(),to:c.toISOString(),top_n:20});p.ok?yt(m,p.data,a):(N(n,p.data?.error??"Scan failed. Please try again."),m.innerHTML="")}catch{N(n,"Connection error. Please try again."),m.innerHTML=""}finally{t.disabled=!1,t.textContent="Find Best Windows (costs 5 pts)"}})}function N(e,a){e.textContent=a,e.style.display="block"}function yt(e,a,t){const n=a.windows??[];if(n.length===0){e.innerHTML=`
      <div class="em-no-results">
        <p>No auspicious windows found in this range.</p>
        <p>Try a wider date range or different location.</p>
      </div>
    `;return}const r=new Map;for(const o of n){const i=o.timestamp.slice(0,10);r.has(i)||r.set(i,[]),r.get(i).push(o)}const s=Array.from(r.entries()).map(([o,i])=>{const u=new Date(o+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}),d=i[0],l=i.map(c=>{const v=new Date(c.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),m=c.tara?xt(c.tara.beneficence):"",p=[c.panchaka_active?'<span class="em-flag em-flag-warn">⚠ Panchaka</span>':"",c.ganda_moola?'<span class="em-flag em-flag-warn">⚠ Ganda Moola</span>':"",c.dishashool_direction?`<span class="em-flag em-flag-warn">⚠ Dishashool: ${c.dishashool_direction}</span>`:"",t.auspiciousHoras.includes(c.hora_lord)?`<span class="em-flag em-flag-good">✓ ${c.hora_lord} hora</span>`:""].filter(Boolean).join(" ");return`
        <div class="em-window-row">
          <div class="em-window-time">${v} IST</div>
          <div class="em-window-score">
            <div class="em-score-bar" style="width:${Math.min(c.score,100)}%"></div>
            <span>${c.score.toFixed(0)}/100</span>
          </div>
          <div class="em-window-detail">
            <span class="em-hora-chip">${c.hora_lord} hora</span>
            <span class="em-nak">${c.nakshatra}</span>
            ${c.tara?`<span class="em-tara ${m}">Tara ${c.tara.number}: ${c.tara.name}</span>`:""}
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
          Scanned ${a.total_sampled??"—"} time slots ·
          Wallet: ${a.wallet_balance??"—"} pts remaining
        </div>
      </div>
      <div class="em-day-cards">${s}</div>
    </section>
  `}function xt(e){return e==="benefic"?"em-tara-good":e==="malefic"?"em-tara-bad":"em-tara-neutral"}function kt(e){return`
    <div class="screen event-muhurta-screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>${e.emoji} ${e.label}</h2></div>
      </header>
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
      </div>
    </div>
  `}function We(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{g(H?`/birth-chart?id=${H}`:"/dashboard")})}function wt(){const e="event-muhurta-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}class $t{routes=new Map;constructor(){this.routes.set("/login",ca),this.routes.set("/dashboard",ua),this.routes.set("/muhurta",va),this.routes.set("/kundali",ga),this.routes.set("/kundali-form",ya),this.routes.set("/kp-query",xa),this.routes.set("/scanner",$a),this.routes.set("/wallet",Sa),this.routes.set("/referral",Ea),this.routes.set("/admin",ka),this.routes.set("/birth-chart",Ia),this.routes.set("/muhurta-dashboard",Aa),this.routes.set("/dasha-timeline",et),this.routes.set("/kp-sublords",ct),this.routes.set("/event-muhurta",gt)}currentRoute(){return window.location.hash.slice(1)||"/login"}basePath(a){return a.split("?")[0]??a}async route(){const a=this.currentRoute(),t=this.routes.get(this.basePath(a));if(t)try{await t()}catch(n){console.error(`Route handler error for ${a}:`,n)}else{const n=this.routes.get("/login");n&&await n()}}}function g(e){window.location.hash=e}window.addEventListener("error",e=>{const a=e.error?.message||e.message||"Unknown error";console.error("Global error:",a,e),Ge({type:"uncaught-error",message:a,filename:e.filename,lineno:e.lineno,stack:e.error?.stack}),y("An error occurred. Please refresh.",!0)});window.addEventListener("unhandledrejection",e=>{const a=e.reason?.message||String(e.reason)||"Unhandled promise rejection";console.error("Unhandled rejection:",a,e.reason),Ge({type:"unhandled-rejection",message:a,stack:e.reason?.stack})});async function Ge(e){try{await fetch("/api/log-error",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{console.log("Error log endpoint not available")})}catch{}}function St(){const e=localStorage.getItem("theme")||"auto",a=document.documentElement;let t=e;e==="auto"&&(t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),a.setAttribute("data-theme",t),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",n=>{if(localStorage.getItem("theme")==="auto"){const r=n.matches?"dark":"light";a.setAttribute("data-theme",r)}})}function Et(){const e=document.documentElement,t=(e.getAttribute("data-theme")||"light")==="light"?"dark":"light";e.setAttribute("data-theme",t),localStorage.setItem("theme",t)}async function Lt(){if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",e),e.addEventListener("updatefound",()=>{const a=e.installing;a?.addEventListener("statechange",()=>{a.state==="installed"&&navigator.serviceWorker.controller&&y("Update available — refresh to get the latest version",!1)})})}catch(e){console.error("Service Worker registration failed:",e)}}async function Be(){St(),Lt(),window.toggleTheme=Et;const e=new $t;window.addEventListener("hashchange",()=>{e.route()}),await e.route(),console.log("OccultViision PWA initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Be):Be();
