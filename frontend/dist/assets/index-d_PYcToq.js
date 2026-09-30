(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();function $(){return document.getElementById("app")}function S(e){e.innerHTML=""}function h(e,a=!1){let t=document.getElementById("ov-toast");t||(t=document.createElement("div"),t.id="ov-toast",document.body.appendChild(t)),t.textContent=e,t.className=`ov-toast show ${a?"error":"ok"}`,setTimeout(()=>t.classList.remove("show"),3e3)}const Je={},Ge=Je?.VITE_API_BASE??"";let ue=localStorage.getItem("ov_session");function Ye(e){ue=e,e?localStorage.setItem("ov_session",e):localStorage.removeItem("ov_session")}async function E(e,a={}){const t={...a.headers??{}};ue&&(t.Authorization=`Bearer ${ue}`),a.body&&typeof a.body=="string"&&(t["Content-Type"]="application/json");const n=await fetch(`${Ge}${e}`,{...a,headers:t});let r;try{r=await n.json()}catch{r=null}return{ok:n.ok,status:n.status,data:r}}const Qe=e=>E("/auth/request-otp",{method:"POST",body:JSON.stringify({phone_number:e})}),Ze=(e,a,t)=>E("/auth/verify-otp",{method:"POST",body:JSON.stringify({phone_number:e,code:a,fingerprint_hash:t})}),ie=()=>E("/kundali"),Xe=e=>E("/kundali",{method:"POST",body:JSON.stringify(e)}),ea=e=>E(`/kundali/${e}`,{method:"DELETE"}),Te=(e,a,t,n)=>{const r=new URLSearchParams({lat:String(e),lon:String(a)});return t&&r.set("purpose",t),n!==void 0&&r.set("kundali_id",String(n)),E(`/muhurta/now?${r}`)},Ce=e=>{const a=new URLSearchParams({lat:String(e.lat),lon:String(e.lon)});return e.purpose&&a.set("purpose",e.purpose),e.kundali_id!==void 0&&a.set("kundali_id",String(e.kundali_id)),e.from&&a.set("from",e.from),e.to&&a.set("to",e.to),e.top_n!==void 0&&a.set("top_n",String(e.top_n)),E(`/muhurta/scan?${a}`)},be=e=>E(`/kundali/${e}/chart`),aa=e=>E(`/kp/chart/${e}`),ta=(e,a)=>E("/kp/query",{method:"POST",body:JSON.stringify({kundali_id:e,activity_slug:a})}),ra=()=>E("/kp/activities"),Me=()=>E("/wallet/balance"),na=()=>E("/referral/code"),sa=()=>E("/admin/stats"),ke=Te;function oa(){const e=$();S(e),e.innerHTML=`
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
  `;let a="";const t=document.getElementById("phone"),n=document.getElementById("btn-otp"),r=document.getElementById("step-phone"),s=document.getElementById("step-otp"),o=document.getElementById("otp-code"),i=document.getElementById("btn-verify"),u=document.getElementById("btn-back"),c=document.getElementById("login-loading");n.addEventListener("click",async()=>{if(a=t.value.trim(),!/^\d{10}$/.test(a)){h("Enter a valid 10-digit phone number",!0);return}n.setAttribute("disabled",""),c.classList.remove("hidden");const d=await Qe(a);c.classList.add("hidden"),n.removeAttribute("disabled"),d.ok?(r.classList.add("hidden"),s.classList.remove("hidden"),o.focus(),h("OTP sent!")):h(d.data?.error??"Failed to send OTP",!0)}),u.addEventListener("click",()=>{s.classList.add("hidden"),r.classList.remove("hidden"),t.focus()}),i.addEventListener("click",async()=>{const d=o.value.trim();if(!/^\d{4,6}$/.test(d)){h("Enter the OTP code",!0);return}i.setAttribute("disabled",""),c.classList.remove("hidden");const l=`pwa-${navigator.userAgent.slice(0,40)}-${screen.width}x${screen.height}`,m=await Ze(a,d,l);c.classList.add("hidden"),i.removeAttribute("disabled"),m.ok&&m.data?.session_token?(Ye(m.data.session_token),h("Logged in!"),b("/dashboard")):h(m.data?.error??"Verification failed",!0)})}function ia(){const e=$();S(e),e.innerHTML=`
    <div class="screen dashboard-screen">
      <header class="app-header">
        <h1>OccultViision</h1>
        <div id="balance-badge" class="badge">...</div>
      </header>

      <div class="card-grid">
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
          <span class="card-icon">❓</span>
          <span class="card-label">KP Query</span>
          <span class="card-desc">Promise / Denied verdict</span>
        </button>

        <button class="card" data-route="/kundali">
          <span class="card-icon">👤</span>
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
  `,Me().then(a=>{const t=document.getElementById("balance-badge");a.ok?t.textContent=`${a.data.balance??0} pts`:t.textContent="—"}),e.querySelectorAll(".card[data-route]").forEach(a=>{a.addEventListener("click",()=>{b(a.dataset.route)})}),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),b("/login"),window.location.reload()})}let U=null;function Be(){if(U)return U;const e=localStorage.getItem("ov_location");if(e)try{return U=JSON.parse(e),U}catch{}return null}function da(e){U=e,localStorage.setItem("ov_location",JSON.stringify(e))}function De(){return new Promise((e,a)=>{if(!navigator.geolocation){a(new Error("Geolocation not supported"));return}navigator.geolocation.getCurrentPosition(t=>{const n={lat:t.coords.latitude,lon:t.coords.longitude};da(n),e(n)},t=>a(t),{enableHighAccuracy:!1,timeout:1e4})})}const ca=[{value:"general",label:"General"},{value:"travel",label:"Travel"},{value:"finance",label:"Finance"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"relationship",label:"Relationship"},{value:"career",label:"Career"},{value:"spiritual",label:"Spiritual"}];function la(){const e=$();S(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${ca.map(t=>`<option value="${t.value}">${t.label}</option>`).join("")}
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
  `,document.getElementById("btn-back").addEventListener("click",()=>b("/dashboard"));const a=Be();a&&(document.getElementById("lat").value=String(a.lat),document.getElementById("lon").value=String(a.lon)),document.getElementById("btn-gps").addEventListener("click",async()=>{try{const t=await De();document.getElementById("lat").value=String(t.lat),document.getElementById("lon").value=String(t.lon),h("Location updated")}catch{h("Could not get location",!0)}}),ie().then(t=>{if(t.ok&&Array.isArray(t.data?.kundalis)){const n=document.getElementById("kundali-select");for(const r of t.data.kundalis){const s=document.createElement("option");s.value=String(r.id),s.textContent=r.label,n.appendChild(s)}}}),document.getElementById("btn-check").addEventListener("click",async()=>{const t=Number(document.getElementById("lat").value),n=Number(document.getElementById("lon").value);if(!Number.isFinite(t)||!Number.isFinite(n)){h("Set your location first",!0);return}const r=document.getElementById("purpose").value,s=document.getElementById("kundali-select").value,o=s?Number(s):void 0,i=document.getElementById("muhurta-loading"),u=document.getElementById("muhurta-result");i.classList.remove("hidden"),u.classList.add("hidden");const c=await Te(t,n,r,o);if(i.classList.add("hidden"),!c.ok){h(c.data?.error??"Request failed",!0);return}const d=c.data;u.classList.remove("hidden"),u.innerHTML=ua(d)})}function ua(e){const a=e.score>=70?"score-good":e.score>=40?"score-mid":"score-bad",t=(e.layers??[]).map(r=>`<div class="layer"><strong>${r.name}</strong>: ${r.detail} (${r.impact})</div>`).join(""),n=[];if(e.panchaka?.active&&n.push(`⚠️ Panchaka Dosha: ${e.panchaka.note}`),e.ganda_moola?.active&&n.push(`⚠️ Ganda Moola: ${e.ganda_moola.note}`),e.combustion?.length)for(const r of e.combustion)n.push(`🔥 ${r.planet} combust (${r.angular_distance.toFixed(1)}°)`);return`
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
      <div class="hora-window">Window: ${we(e.hora_start)} – ${we(e.hora_end)}</div>
    </div>
  `}function we(e){if(!e)return"?";try{return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return e}}async function pa(){const e=$();S(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>b("/dashboard"));const a=document.getElementById("btn-add"),t=document.getElementById("btn-add-empty");a.addEventListener("click",()=>b("/kundali-form")),t&&t.addEventListener("click",()=>b("/kundali-form"));try{const n=await ie(),r=document.getElementById("loading"),s=document.getElementById("list"),o=document.getElementById("empty"),i=n.ok&&Array.isArray(n.data?.kundalis)?n.data.kundalis:[];r.style.display="none",i.length===0?o.style.display="block":(s.style.display="block",va(s,i))}catch(n){console.error("Failed to load kundalis:",n),h("Failed to load kundalis",!0)}}function va(e,a){e.innerHTML=a.map(t=>`
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
  `).join(""),e.querySelectorAll(".view-btn").forEach(t=>{t.addEventListener("click",n=>{const r=n.target.dataset.id;r&&b(`/birth-chart?id=${r}`)})}),e.querySelectorAll(".delete-btn").forEach(t=>{t.addEventListener("click",async n=>{n.stopPropagation();const r=n.target.dataset.id,s=e.querySelector(`[data-id="${r}"]`),o=s?.querySelector("h3")?.textContent||"this kundali";if(confirm(`Delete ${o}? This cannot be undone.`))try{const i=await ea(Number(r));i.ok?(h("Kundali deleted"),s?.remove(),e.querySelectorAll(".kundali-item").length===0&&(e.style.display="none",document.getElementById("empty").style.display="block")):h(i.data?.error??"Failed to delete kundali",!0)}catch(i){console.error("Delete error:",i),h("Error deleting kundali",!0)}})})}const ma=[{value:"Asia/Kolkata",label:"India (IST)"},{value:"Asia/Bangkok",label:"Thailand (ICT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Australia/Sydney",label:"Sydney (AEDT)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"America/New_York",label:"New York (EST/EDT)"},{value:"America/Los_Angeles",label:"Los Angeles (PST/PDT)"},{value:"America/Chicago",label:"Chicago (CST/CDT)"}];async function ba(){const e=$();S(e),e.innerHTML=`
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
          <label>Location</label>
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
            <button type="button" class="btn btn-small" id="btn-gps">📍</button>
          </div>
        </div>

        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" required>
            <option value="">-- Select Timezone --</option>
            ${ma.map(p=>`<option value="${p.value}">${p.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("name"),n=document.getElementById("birth-date"),r=document.getElementById("birth-time"),s=document.getElementById("lat"),o=document.getElementById("lon"),i=document.getElementById("timezone"),u=document.getElementById("btn-gps"),c=document.getElementById("btn-cancel"),d=document.getElementById("error-box"),l=new Date().toISOString().split("T")[0];n.value=l;const m=Be();m&&(s.value=String(m.lat),o.value=String(m.lon)),i.value="Asia/Kolkata",u.addEventListener("click",async p=>{p.preventDefault();try{const v=await De();s.value=String(v.lat),o.value=String(v.lon),h("Location updated")}catch{h("Could not get location",!0)}}),c.addEventListener("click",p=>{p.preventDefault(),b("/kundali")}),a.addEventListener("submit",async p=>{p.preventDefault(),d.style.display="none";const v=t.value.trim(),g=n.value,x=r.value,f=parseFloat(s.value),w=parseFloat(o.value),y=i.value;if(!v||!g||!x||!y||isNaN(f)||isNaN(w)){d.textContent="Please fill in all fields",d.style.display="block";return}if(f<-90||f>90){d.textContent="Latitude must be between -90 and 90",d.style.display="block";return}if(w<-180||w>180){d.textContent="Longitude must be between -180 and 180",d.style.display="block";return}const k=document.getElementById("btn-submit");k.disabled=!0,k.textContent="Creating...";try{const[_,Y,P]=g.split("-"),[V,A]=x.split(":"),C=`${_}-${Y}-${P}T${V}:${A}:00`,fe=new Intl.DateTimeFormat("en-US",{timeZone:y,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),ye=new Date(`${_}-${Y}-${P}T${V}:${A}:00`),N=new Intl.DateTimeFormat("en-US",{timeZone:y,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date),Ve=new Date(parseInt(N.find(L=>L.type==="year")?.value||"2000"),parseInt(N.find(L=>L.type==="month")?.value||"1")-1,parseInt(N.find(L=>L.type==="day")?.value||"1"),parseInt(N.find(L=>L.type==="hour")?.value||"0"),parseInt(N.find(L=>L.type==="minute")?.value||"0"),parseInt(N.find(L=>L.type==="second")?.value||"0")),Ue=ye.getTime()-Ve.getTime(),We=new Date(ye.getTime()-Ue).toISOString().split(".")[0],xe=await Xe({label:v,birth_date:We,latitude:f,longitude:w,timezone:y});if(xe.ok)h("Kundali created successfully"),b("/kundali");else{const L=xe.data?.error||"Failed to create kundali";d.textContent=L,d.style.display="block",k.disabled=!1,k.textContent="Create Kundali"}}catch(_){console.error("Create error:",_),d.textContent="Error creating kundali",d.style.display="block",k.disabled=!1,k.textContent="Create Kundali"}}),document.getElementById("btn-back").addEventListener("click",()=>b("/kundali"))}async function ga(){const e=$();S(e),e.innerHTML=`
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),n=document.getElementById("activity"),r=document.getElementById("query-time"),s=document.getElementById("btn-cancel"),o=document.getElementById("error-box"),i=document.getElementById("result"),u=new Date;r.value=u.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"});try{const c=await ie(),d=c.ok&&Array.isArray(c.data?.kundalis)?c.data.kundalis:[];if(d.length===0){h("Please create a kundali first",!0),b("/kundali-form");return}t.innerHTML=d.map(l=>`<option value="${l.id}">${l.label||"Unnamed"}</option>`).join("")}catch(c){console.error("Failed to load kundalis:",c),h("Failed to load kundalis",!0)}try{const c=await ra(),d=c.ok&&Array.isArray(c.data?.activities)?c.data.activities:[];n.innerHTML='<option value="">-- Select --</option>'+d.map(l=>`<option value="${l.code}">${l.name}</option>`).join("")}catch(c){console.error("Failed to load activities:",c),h("Failed to load activities",!0)}s.addEventListener("click",c=>{c.preventDefault(),b("/dashboard")}),a.addEventListener("submit",async c=>{c.preventDefault(),o.style.display="none",i.style.display="none";const d=parseInt(t.value),l=n.value;if(!d||!l){o.textContent="Please select both kundali and activity",o.style.display="block";return}const m=document.getElementById("btn-submit");m.disabled=!0,m.textContent="Checking...";try{const p=await ta(d,l);if(p.ok){const v=p.data;i.innerHTML=`
          <div class="result-box">
            <div style="text-align: center; margin-bottom: var(--space-6);">
              <div style="font-size: 2.5rem; font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${v.verdict==="PROMISED"?"✅":"❌"}
              </div>
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${v.verdict}
              </div>
              <div style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
                Confidence: <strong>${v.confidence||0}%</strong>
              </div>
            </div>

            <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
              <h3 style="margin-bottom: var(--space-3);">Analysis</h3>
              <div style="font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                <p><strong>House:</strong> ${v.house}</p>
                <p><strong>Cusp Nakshatra:</strong> ${v.cusp_nakshatra||"—"}</p>
                <p><strong>Sub-Lord:</strong> ${v.sub_lord||"—"}</p>
                <p><strong>Dasha Status:</strong> ${v.dasha_status||"—"}</p>
                <p><strong>Tarabala:</strong> ${v.tarabala||"—"}</p>
                <p><strong>Panchaka:</strong> ${v.panchaka?"⚠️ Active":"✓ Absent"}</p>
                ${v.ganda_moola?"<p><strong>Ganda Moola:</strong> ⚠️ Active</p>":""}
              </div>
            </div>

            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
              Query time: ${new Date(v.timestamp).toLocaleTimeString("en-IN")}
            </div>
          </div>
        `,i.style.display="block"}else{const v=p.data?.error||"Failed to query KP";o.textContent=v,o.style.display="block"}}catch(p){console.error("Query error:",p),o.textContent="Error processing query",o.style.display="block"}finally{m.disabled=!1,m.textContent="Check Now"}}),document.getElementById("btn-back").addEventListener("click",()=>b("/dashboard"))}async function ha(){const e=$();S(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>b("/dashboard"));try{const a=await sa(),t=document.getElementById("loading"),n=document.getElementById("stats"),r=document.getElementById("error");if(!a.ok){r.textContent=a.data?.error||"Failed to load stats",r.style.display="block",t.style.display="none";return}const s=a.data;document.getElementById("queries-24h").textContent=String(s.queries_24h||0),document.getElementById("active-users").textContent=String(s.active_users||0),document.getElementById("revenue").textContent=`₹${(s.revenue_estimate||0).toLocaleString("en-IN")}`,document.getElementById("conversion").textContent=`${(s.conversion_rate||0).toFixed(1)}%`;const o=(s.top_activities||[]).map(u=>`<div style="padding: var(--space-2); border-bottom: 1px solid var(--color-border);">
        <strong>${u.name}</strong>: ${u.count} queries
      </div>`).join("");document.getElementById("top-activities").innerHTML=o||"<p>No data</p>";const i=`
      <p><strong>D1 Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>KV Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>Error Rate (24h):</strong> ${(s.error_rate_pct||0).toFixed(2)}%</p>
      <p><strong>Rate Limit Events (24h):</strong> ${s.rate_limit_events||0}</p>
    `;document.getElementById("system-health").innerHTML=i,t.style.display="none",n.style.display="block"}catch(a){console.error("Admin stats error:",a);const t=document.getElementById("error");t.textContent="Error loading stats",t.style.display="block",document.getElementById("loading").style.display="none"}}const fa=[{value:"travel",label:"Travel"},{value:"marriage",label:"Marriage"},{value:"business",label:"Business"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"general",label:"General"}];async function ya(){const e=$();S(e),e.innerHTML=`
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
              ${fa.map(p=>`<option value="${p.value}">${p.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),n=document.getElementById("category"),r=document.getElementById("from-date"),s=document.getElementById("to-date"),o=document.getElementById("top-n"),i=document.getElementById("location"),u=document.getElementById("btn-cancel"),c=document.getElementById("error-box"),d=document.getElementById("results"),l=new Date,m=new Date(l);m.setDate(m.getDate()+30),r.value=l.toISOString().split("T")[0],s.value=m.toISOString().split("T")[0];try{const p=await ie(),v=p.ok&&Array.isArray(p.data?.kundalis)?p.data.kundalis:[];if(v.length===0){h("Please create a kundali first",!0),b("/kundali-form");return}t.innerHTML=v.map(g=>`<option value="${g.id}" data-lat="${g.latitude}" data-lon="${g.longitude}">${g.label||"Unnamed"}</option>`).join(""),t.addEventListener("change",()=>{const g=t.options[t.selectedIndex],x=g.getAttribute("data-lat"),f=g.getAttribute("data-lon");i.value=x&&f?`${x}, ${f}`:""}),t.dispatchEvent(new Event("change"))}catch(p){console.error("Failed to load kundalis:",p),h("Failed to load kundalis",!0)}u.addEventListener("click",p=>{p.preventDefault(),b("/dashboard")}),a.addEventListener("submit",async p=>{p.preventDefault(),c.style.display="none",d.style.display="none";const v=parseInt(t.value),g=n.value,x=r.value,f=s.value,w=parseInt(o.value)||5;if(!v||!g||!x||!f){c.textContent="Please fill all required fields",c.style.display="block";return}if(new Date(x)>new Date(f)){c.textContent="Start date must be before end date",c.style.display="block";return}const y=document.getElementById("btn-submit");y.disabled=!0,y.textContent="Scanning...";try{const k=t.options[t.selectedIndex],_=parseFloat(k.getAttribute("data-lat")||"0"),Y=parseFloat(k.getAttribute("data-lon")||"0"),P=await Ce({lat:_,lon:Y,purpose:g,kundali_id:v,from:x,to:f,top_n:w});if(P.ok){const A=P.data.results||[];A.length===0?d.innerHTML=`
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `:d.innerHTML=`
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${A.length} Auspicious Dates</h3>
              ${A.map((C,fe)=>`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${C.muhurta_pct>70?"#10b981":"#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${fe+1}: ${new Date(C.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${C.muhurta_pct>70?"#d1fae5":"#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${C.muhurta_pct>70?"#047857":"#92400e"}; font-weight: bold;">
                      ${C.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${C.best_time||"All day auspicious"}
                  </p>
                </div>
              `).join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `,d.style.display="block"}else{const V=P.data?.error||"Failed to scan dates";c.textContent=V,c.style.display="block"}}catch(k){console.error("Scan error:",k),c.textContent="Error scanning dates",c.style.display="block"}finally{y.disabled=!1,y.textContent="Scan Dates"}}),document.getElementById("btn-back").addEventListener("click",()=>b("/dashboard"))}async function xa(){const e=$();S(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-refresh"),n=document.getElementById("btn-topup"),r=document.getElementById("balance-amount"),s=document.getElementById("batches-section"),o=document.getElementById("batches-list"),i=document.getElementById("transactions-list"),u=document.getElementById("no-transactions"),c=document.getElementById("error-box");async function d(){c.style.display="none",r.textContent="Loading...",t.disabled=!0,n.disabled=!0;try{const l=await Me();if(l.ok){const m=l.data;r.textContent=String(m.total_points??0);const p=Array.isArray(m.batches)?m.batches:[];p.length>0?(s.style.display="block",o.innerHTML=p.map(g=>{const x=new Date(g.expires_at),f=new Date,w=Math.ceil((x.getTime()-f.getTime())/(24*60*60*1e3)),y=w<=7,k=g.status==="active"?"Active":g.status==="held"?"Held":"Expired";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${y?"#ef4444":"#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${g.source==="free_trial"?"Free Trial":g.source==="subscription"?"Subscription":g.source==="referral"?"Referral":"Top-up"}</strong>
                    <span style="background: ${g.status==="active"?"#d1fae5":g.status==="held"?"#fef3c7":"#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${g.status==="active"?"#047857":g.status==="held"?"#92400e":"#6b7280"}; font-weight: bold;">
                      ${k}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${g.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${x.toLocaleDateString("en-IN")}
                      ${y&&g.status==="active"?` (${w}d left)`:""}
                    </span>
                  </div>
                </div>
              `}).join("")):s.style.display="none";const v=Array.isArray(m.transactions)?m.transactions:[];v.length>0?(u.style.display="none",i.innerHTML=v.slice(0,10).map(g=>{const x=new Date(g.created_at),f=g.type==="debit"?"-":"+",w=g.type==="debit"?"#dc2626":"#10b981",y=g.description||(g.type==="debit"?"Query":"Credit");return`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${w};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${y}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${x.toLocaleDateString("en-IN")} ${x.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${w};">
                      ${f}${g.amount}
                    </div>
                  </div>
                </div>
              `}).join("")):(u.style.display="block",i.innerHTML="")}else{const m=l.data?.error||"Failed to load wallet";c.textContent=m,c.style.display="block",r.textContent="Error"}}catch(l){console.error("Wallet load error:",l),c.textContent="Error loading wallet",c.style.display="block",r.textContent="Error"}finally{t.disabled=!1,n.disabled=!1}}a.addEventListener("click",()=>b("/dashboard")),t.addEventListener("click",d),n.addEventListener("click",()=>{h("Opening payment gateway...",!1),b("/orders")}),d()}async function ka(){const e=$();S(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-copy"),n=document.getElementById("btn-share"),r=document.getElementById("btn-copy-message"),s=document.getElementById("referral-code"),o=document.getElementById("total-earned"),i=document.getElementById("referral-count"),u=document.getElementById("referred-users"),c=document.getElementById("no-referrals"),d=document.getElementById("error-box");let l="";async function m(){d.style.display="none";try{const p=await na();if(p.ok){const v=p.data;l=v.code||"";const g=v.stats||{},x=Array.isArray(v.referred_users)?v.referred_users:[];s.textContent=l||"LOADING...",o.textContent=`₹${g.total_earned??0}`,i.textContent=String(g.referral_count??0),x.length>0?(c.style.display="none",u.innerHTML=x.map(f=>{const w=f.commission_activated_at?new Date(f.commission_activated_at):null,y=f.commission_status==="active"?"Activated":f.commission_status==="held"?"Held":"Pending",k=f.commission_status==="active"?"#10b981":f.commission_status==="held"?"#f59e0b":"#6b7280";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${k};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${f.phone||"Anonymous"}</strong>
                    <span style="background: ${k}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${k}; font-weight: bold;">
                      ${y}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${f.commission_amount||0}</span>
                    <span>${f.referred_at?new Date(f.referred_at).toLocaleDateString("en-IN"):"—"}</span>
                  </div>
                  ${w?`
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${w.toLocaleDateString("en-IN")}
                    </div>
                  `:""}
                </div>
              `}).join("")):(c.style.display="block",u.innerHTML="")}else{const v=p.data?.error||"Failed to load referral data";d.textContent=v,d.style.display="block"}}catch(p){console.error("Referral load error:",p),d.textContent="Error loading referral data",d.style.display="block"}}a.addEventListener("click",()=>b("/dashboard")),t.addEventListener("click",async()=>{if(!l){h("Code not available",!0);return}try{await navigator.clipboard.writeText(l),h("Referral code copied!",!1)}catch{h("Failed to copy code",!0)}}),r.addEventListener("click",async()=>{const p=`Join me on OccultViision! Use my referral code: ${l}

https://www.occultviision.com`;try{await navigator.clipboard.writeText(p),h("Share message copied!",!1)}catch{h("Failed to copy message",!0)}}),n.addEventListener("click",()=>{const p=`Join me on OccultViision! Use my referral code: ${l}

https://www.occultviision.com`,v=`https://wa.me/?text=${encodeURIComponent(p)}`;window.open(v,"_blank")}),m()}function Q(e){const a=Math.floor(e),t=(e-a)*60,n=Math.floor(t),r=Math.round((t-n)*60);return`${a}°${n.toString().padStart(2,"0")}'${r.toString().padStart(2,"0")}"`}function $e(e){try{return new Date(e).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}catch{return e}}function Se(e,a){return`${$e(e)} – ${$e(a)}`}function de(e){return`${e.starLord} → ${e.subLord} → ${e.subSubLord}`}const wa={Sun:"☉",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"};function $a(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}function ce(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return e}}async function Sa(e){const a=$();S(a);let t=e;if(!t){const i=window.location.hash,u=i.includes("?")?i.split("?")[1]:"",d=new URLSearchParams(u).get("id");t=d?parseInt(d,10):void 0}if(!t||isNaN(t)){a.innerHTML=`
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
    `,document.getElementById("btn-back").addEventListener("click",()=>b("/kundali")),document.getElementById("btn-list").addEventListener("click",()=>b("/kundali"));return}a.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>b("/kundali"));const n=await be(t);if(!n.ok){a.innerHTML=`
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
    `,document.getElementById("btn-back2").addEventListener("click",()=>b("/kundali"));return}const{kundali:r,chart:s,meta:o}=n.data;Ea(a,r,s,o)}function Ea(e,a,t,n){const{ascendant:r,planets:s,cusps:o,dasha:i,janmaNakshatra:u,tara:c}=t;e.innerHTML=`
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
          <span class="meta-val">${t.ayanamsa} ${Q(t.ayanamsaDeg)}</span>
        </div>
      </div>

      <!-- ── Ascendant Card ── -->
      <section class="chart-section">
        <h3 class="section-title">Ascendant (Lagna)</h3>
        <div class="asc-card">
          <div class="asc-main">
            <span class="asc-sign">${r.rashiName}</span>
            <span class="asc-deg">${Q(r.deg)}</span>
          </div>
          <div class="asc-detail">
            <span>${r.nakName} Pada ${r.nakPada} | Lord: ${r.nakLord}</span>
          </div>
          <div class="asc-kp">
            <span class="kp-label">KP Sub-lord chain:</span>
            <span class="kp-val">${de(r.kp)}</span>
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
              <div class="dasha-dates">${Se(i.maha.start,i.maha.end)}</div>
            </div>
            <div class="dasha-divider">›</div>
            <div class="dasha-item dasha-antar">
              <div class="dasha-lord">${i.antar.lord}</div>
              <div class="dasha-role">Antar Dasha</div>
              <div class="dasha-dates">${Se(i.antar.start,i.antar.end)}</div>
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
          <div class="tara-card ${$a(c.beneficence)}">
            <div class="tara-num">Tara ${c.number}</div>
            <div class="tara-name">${c.name}</div>
            <div class="tara-moon">Transit Moon: ${c.transitMoonNakName}</div>
            <div class="tara-as-of">as of ${ce(c.asOf)}</div>
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
              ${s.map(d=>`
                <tr>
                  <td><span class="planet-sym">${wa[d.planet]??""}</span> ${d.planet}</td>
                  <td class="text-center">${d.house}</td>
                  <td>${d.rashiName}</td>
                  <td class="mono">${Q(d.degInRashi)}</td>
                  <td>${d.nakName} P${d.nakPada}</td>
                  <td class="kp-chain-cell">${de(d.kp)}</td>
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
              ${o.map(d=>`
                <tr class="${d.house%2===0?"row-alt":""}">
                  <td class="text-center"><strong>${d.house}</strong></td>
                  <td>${d.rashiName}</td>
                  <td class="mono">${Q(d.degInRashi)}</td>
                  <td>${d.nakName} P${d.nakPada}</td>
                  <td class="kp-chain-cell">${de(d.kp)}</td>
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
  `,document.getElementById("btn-back").addEventListener("click",()=>b("/kundali")),document.getElementById("btn-kp").addEventListener("click",()=>b("/kp-query")),document.getElementById("btn-kp-query-bottom").addEventListener("click",()=>b("/kp-query")),document.getElementById("btn-muhurta-bottom").addEventListener("click",()=>b("/muhurta")),document.getElementById("btn-dasha-bottom").addEventListener("click",()=>b(`/dasha-timeline?kundali_id=${a.id}`)),document.getElementById("btn-kp-sublords-bottom").addEventListener("click",()=>b(`/kp-sublords?kundali_id=${a.id}`)),document.getElementById("btn-muhurta-dashboard-bottom").addEventListener("click",()=>b(`/muhurta-dashboard?kundali_id=${a.id}`))}const La=23.2505,za=77.4065,F=60,_e=[{slug:"property",label:"Property",icon:"🏠",priority:"P0"},{slug:"marriage",label:"Marriage",icon:"💍",priority:"P1"},{slug:"business",label:"Business",icon:"📈",priority:"P2"},{slug:"medical",label:"Medical",icon:"🏥",priority:"P3"}],Ia={Sun:"hora-sun",Moon:"hora-moon",Mars:"hora-mars",Mercury:"hora-mercury",Jupiter:"hora-jupiter",Venus:"hora-venus",Saturn:"hora-saturn"},Ta=["","Janma","Sampat","Vipat","Kshema","Pratyak","Sadhana","Naidhana","Mitra","Param Mitra"];function z(e){try{return new Date(e).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!0})}catch{return e}}function Ca(e){try{return new Date(e).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0})}catch{return e}}function re(e){return e>=80?{cls:"grade-a",label:"Excellent"}:e>=65?{cls:"grade-b",label:"Good"}:e>=50?{cls:"grade-c",label:"Moderate"}:e>=35?{cls:"grade-d",label:"Weak"}:{cls:"grade-f",label:"Avoid"}}function Ma(e){return e==="benefic"?"tara-good":e==="malefic"?"tara-bad":"tara-neutral"}let D,ne=La,se=za,Z="Bhopal (default)",X=null,ee=null,H=F;async function Ba(){const e=$();S(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",r=new URLSearchParams(t).get("kundali_id");D=r?parseInt(r,10):void 0,e.innerHTML=Da(D),_a(e);try{await Pa()}catch{}await Pe(e),qa(e)}function Da(e){return`
    <div class="screen muhurta-dashboard">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Muhurta Dashboard</h2>
          <span class="subtitle" id="location-label">Detecting location…</span>
        </div>
        <div class="header-right">
          <span class="refresh-badge" id="refresh-badge">⏱ ${F}s</span>
          ${e?'<button class="btn btn-small btn-ghost" id="btn-chart">Chart</button>':""}
        </div>
      </header>
      <div id="dashboard-body" style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function _a(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{pe(),b(D?`/birth-chart?id=${D}`:"/dashboard")}),e.querySelector("#btn-chart")?.addEventListener("click",()=>{pe(),b(`/birth-chart?id=${D}`)})}async function Pa(){return new Promise(e=>{if(!navigator.geolocation){Z="Bhopal (geoloc unavailable)",e();return}navigator.geolocation.getCurrentPosition(a=>{ne=a.coords.latitude,se=a.coords.longitude,Z=`${ne.toFixed(4)}°N, ${se.toFixed(4)}°E`,e()},()=>{Z="Bhopal (location denied)",e()},{timeout:5e3})})}async function Pe(e){const a=e.querySelector("#dashboard-body"),t=e.querySelector("#location-label");if(t&&(t.textContent=Z),!!a)try{const n=await ke(ne,se,"general",D);if(!n.ok||!n.data){a.innerHTML=Ee(n.data?.error??"Failed to load muhurta data");return}const r=n.data;let s={};try{const o=await Promise.allSettled(_e.map(i=>ke(ne,se,i.slug,D).then(u=>({slug:i.slug,score:u.data?.score?.score??null}))));for(const i of o)i.status==="fulfilled"&&(s[i.value.slug]=i.value.score)}catch{}a.innerHTML=Aa(r,s),H=F}catch(n){console.error("[muhurta-dashboard] load error:",n),a.innerHTML=Ee("Connection error. Will retry automatically.")}}function Aa(e,a){const t=[];return t.push(`
    <div class="md-timestamp">
      <span>As of <strong>${Ca(e.as_of)}</strong> IST</span>
      <span class="md-personalized-badge">${e.personalized?"🔮 Personalized":"🌐 Generic"}</span>
    </div>
  `),t.push(Na(e)),e.pancha_pakshi&&t.push(Ha(e.pancha_pakshi)),t.push(Fa(e)),t.push(Ka(e)),t.push(Ra(e)),e.score&&t.push(ja(e.score)),t.push(Oa(a,e.score)),t.join(`
`)}function Na(e){const a=e.active_hora,t=e.active_uphora,n=a?`
      <div class="md-hora-card ${Ia[a.lord]??""}">
        <div class="hora-lord">${a.lord}</div>
        <div class="hora-meta">
          <span class="hora-badge">${a.is_daytime?"☀️ Day":"🌙 Night"}</span>
          <span class="hora-window">${z(a.start)} → ${z(a.end)}</span>
        </div>
      </div>`:'<div class="md-hora-card hora-unknown"><div class="hora-lord">—</div><div class="hora-meta">No hora data</div></div>',r=t?`
      <div class="md-uphora-card">
        <div class="uphora-label">Uphora (1/8 Hora)</div>
        <div class="uphora-lord">${t.sub}</div>
        <div class="uphora-window">${z(t.start)} → ${z(t.end)}</div>
      </div>`:"";return`
    <section class="md-section">
      <h3 class="md-section-title">⏰ Current Hora</h3>
      <div class="md-hora-row">
        ${n}
        ${r}
      </div>
      <div class="md-sun-row">
        <span>🌅 Sunrise ${z(e.sunrise)}</span>
        <span>🌇 Sunset ${z(e.sunset)}</span>
      </div>
    </section>
  `}function Ha(e){const a=e.favorability_score,{cls:t,label:n}=re(a),r=Math.round(e.confidence*100);return`
    <section class="md-section">
      <h3 class="md-section-title">🦅 Pancha Pakshi</h3>
      <div class="md-pakshi-card">
        <div class="pakshi-bird">${e.bird}</div>
        <div class="pakshi-meta">
          <span class="pakshi-confidence">Confidence: ${r}%</span>
          <span class="pakshi-precision">Precision: ±${e.precision_minutes}m</span>
          <span class="pakshi-window">${z(e.cycle_start)} → ${z(e.cycle_end)}</span>
        </div>
        <div class="md-score-bar-wrap">
          <div class="md-score-bar ${t}" style="width:${a}%"></div>
        </div>
        <div class="pakshi-grade ${t}">${n} (${a}/100)</div>
      </div>
    </section>
  `}function Fa(e){const a=e.rahu_kaal,t=a.active_now?"rk-active":"rk-inactive",n=a.active_now?'<span class="badge badge-danger">⚠ ACTIVE NOW</span>':'<span class="badge badge-ok">✓ Not active</span>';return`
    <section class="md-section">
      <h3 class="md-section-title">🐍 Rahu Kaal</h3>
      <div class="md-rk-card ${t}">
        ${n}
        <span class="rk-window">${z(a.start)} – ${z(a.end)}</span>
        ${a.active_now?'<p class="rk-warning">Avoid new ventures during Rahu Kaal.</p>':""}
      </div>
    </section>
  `}function Ka(e){const a=e.current_nakshatra,t=e.tara;let n='<div class="tara-unavailable">Add a kundali to see personalized Tara</div>';if(t){const r=Ma(t.beneficence),s=Ta[t.number]??t.name,o=t.beneficence==="benefic"?"✅":t.beneficence==="malefic"?"❌":"⚪";n=`
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
  `}function Ra(e){const a=[];if(e.panchaka_dosha?.active&&a.push(`⚠️ <strong>Panchaka Dosha</strong>${e.panchaka_dosha.dosha?` — ${e.panchaka_dosha.dosha}`:""}: Avoid cremation, travel south, construction.`),e.ganda_moola?.active&&a.push(`⚠️ <strong>Ganda Moola</strong>${e.ganda_moola.nakshatra?` (${e.ganda_moola.nakshatra})`:""}: Inauspicious nakshatra — avoid ceremonies.`),e.dishashool?.active&&a.push(`⚠️ <strong>Dishashool</strong>${e.dishashool.direction?` — ${e.dishashool.direction}`:""}: Travel in this direction is inauspicious today.`),e.combustion?.venus?.combust){const t=e.combustion.venus.orb?` (${e.combustion.venus.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Venus Combust</strong>${t}: Marriage muhurtas affected.`)}if(e.combustion?.jupiter?.combust){const t=e.combustion.jupiter.orb?` (${e.combustion.jupiter.orb.toFixed(1)}°)`:"";a.push(`🔥 <strong>Jupiter Combust</strong>${t}: Upanayana, marriage, ceremonies affected.`)}return a.length===0?`
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
  `}function ja(e){const{cls:a,label:t}=re(e.score),n=Math.round(e.score),r=(e.layers??[]).map(o=>{const i=Math.round(o.score),{cls:u}=re(o.score);return`
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
  `}function Oa(e,a){return`
    <section class="md-section">
      <h3 class="md-section-title">🎯 Event Suitability</h3>
      <div class="md-event-grid">${_e.map(n=>{const r=e[n.slug]??null,s=r!==null?Math.round(r):a?Math.round(a.score):null,{cls:o,label:i}=s!==null?re(s):{cls:"grade-na",label:"—"};return`
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
  `}function Ee(e){return`<div class="error-card" style="margin: var(--space-6) 0;"><p>${e}</p></div>`}function qa(e){pe(),ee=setInterval(()=>{H--;const a=e.querySelector("#refresh-badge");a&&(a.textContent=`⏱ ${H}s`),H<=0&&(H=F)},1e3),X=setInterval(async()=>{H=F,await Pe(e)},F*1e3)}function pe(){X&&(clearInterval(X),X=null),ee&&(clearInterval(ee),ee=null)}Va();function Va(){const e="muhurta-dashboard-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const T=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"],R={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17},j={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},O={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#d97706",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"};function Ua(e,a){const t=Date.now(),n=[];let r=e.getTime();for(let s=0;s<9;s++){const o=(a+s)%9,i=T[o],u=R[i]*365.25*864e5,c=new Date(r),d=new Date(r+u),l=t>=c.getTime()&&t<d.getTime(),m=t>=d.getTime();n.push({lord:i,start:c,end:d,idx:s,isCurrent:l,isPast:m,antars:Wa({lord:i,start:c})}),r+=u}return n}function Wa(e){const a=Date.now(),t=T.indexOf(e.lord),n=R[e.lord],r=[];let s=e.start.getTime();for(let o=0;o<9;o++){const i=(t+o)%9,u=T[i],c=R[u]/120*n*365.25*864e5,d=new Date(s),l=new Date(s+c),m=a>=d.getTime()&&a<l.getTime(),p={lord:u,start:d,end:l};m&&(p.pratyantar=Ja({lord:u,start:d,end:l})),r.push(p),s+=c}return r}function Ja(e,a){const t=T.indexOf(e.lord),n=e.end.getTime()-e.start.getTime(),r=120,s=[];let o=e.start.getTime();for(let i=0;i<9;i++){const u=(t+i)%9,c=T[u],l=R[c]/r*n,m=new Date(o),p=new Date(o+l);s.push({lord:c,start:m,end:p}),o+=l}return s}function q(e){return e.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}function I(e){return e.toLocaleDateString("en-IN",{month:"short",year:"numeric"})}function Ae(e,a){const t=(a.getTime()-e.getTime())/315576e5;if(t>=1)return`${t.toFixed(1)}y`;const n=t*12;return n>=1?`${n.toFixed(1)}m`:`${Math.round(t*365)}d`}function Ga(e,a){const t=Date.now();return t<=e.getTime()?0:t>=a.getTime()?100:Math.round((t-e.getTime())/(a.getTime()-e.getTime())*100)}let ve,G=-1;async function Ya(){const e=$();S(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(a).get("kundali_id");if(!n){e.innerHTML=ae("Missing kundali_id parameter.");return}ve=parseInt(n,10),e.innerHTML=Qa(),Ne(e);try{const r=await be(ve);if(!r.ok||!r.data){e.innerHTML=ae(r.data?.error??"Failed to load chart data.");return}const{chart:s,kundali:o}=r.data;He(e,s,o)}catch(r){console.error("[dasha-timeline]",r),e.innerHTML=ae("Connection error. Please try again.")}}function Qa(){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `}function Ne(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{b(`/birth-chart?id=${ve}`)})}function He(e,a,t){const{dasha:n,janmaNakshatra:r}=a;if(!n){e.innerHTML=ae("Dasha calculation unavailable for this chart.");return}const s=r.lord,o=T.indexOf(s),i=new Date(n.maha.start),u=n.maha.lord,c=T.indexOf(u);let d=i.getTime(),l=0;if(o!==-1&&c!==-1){l=(c-o+9)%9;for(let y=0;y<l;y++){const k=T[(o+y)%9];d-=R[k]*365.25*864e5}}const m=Ua(new Date(d),o!==-1?o:c),p=m.findIndex(y=>y.isCurrent);G===-1&&(G=p>=0?p:0);const v=m[0].start,x=m[m.length-1].end.getTime()-v.getTime(),f=m[G],w=f.antars.find(y=>Date.now()>=y.start.getTime()&&Date.now()<y.end.getTime())??null;e.innerHTML=`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>Dasha Timeline</h2>
          <span class="subtitle">${t.label??"Birth Chart"}</span>
        </div>
      </header>
      <div class="dt-body">
        ${Za(r,n)}
        ${Xa(m,v,x)}
        ${et(m)}
        ${at(f,w)}
      </div>
    </div>
  `,Ne(e),rt(e,m,a,t)}function Za(e,a){return`
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
            <span class="dt-lord" style="color:${O[a.maha.lord]??"inherit"}">
              ${j[a.maha.lord]??""} ${a.maha.lord}
            </span>
            <span class="dt-window">${I(new Date(a.maha.start))} → ${I(new Date(a.maha.end))}</span>
          </div>
          <div class="dt-antar-now">
            <span class="dt-label">Antardasha</span>
            <span class="dt-lord" style="color:${O[a.antar.lord]??"inherit"}">
              ${j[a.antar.lord]??""} ${a.antar.lord}
            </span>
            <span class="dt-window">${I(new Date(a.antar.start))} → ${I(new Date(a.antar.end))}</span>
          </div>
        </div>
      </div>
    </section>
  `}function Xa(e,a,t){const n=e.map(s=>{const o=((s.start.getTime()-a.getTime())/t*100).toFixed(2),i=((s.end.getTime()-s.start.getTime())/t*100).toFixed(2),u=O[s.lord]??"#888";return`<div class="${s.isCurrent?"tl-seg current":s.isPast?"tl-seg past":"tl-seg future"}" style="left:${o}%;width:${i}%;background:${u}${s.isPast?"66":s.isCurrent?"":"33"};"
              title="${s.lord}: ${I(s.start)}–${I(s.end)}">
              <span class="tl-seg-label">${s.lord}</span>
            </div>`}).join(""),r=e.length>0?Math.max(0,Math.min(100,(Date.now()-a.getTime())/t*100)).toFixed(2):"0";return`
    <section class="dt-section">
      <h3 class="dt-section-title">⏳ 120-Year Vimshottari Cycle</h3>
      <div class="dt-timeline-bar">
        ${n}
        <div class="tl-now-marker" style="left:${r}%" title="Today"></div>
      </div>
      <div class="dt-timeline-labels">
        <span>${I(e[0]?.start??new Date)}</span>
        <span>Today</span>
        <span>${I(e[e.length-1]?.end??new Date)}</span>
      </div>
    </section>
  `}function et(e){return`
    <section class="dt-section">
      <h3 class="dt-section-title">🪐 Mahadasha Periods <span class="dt-hint">Tap to expand</span></h3>
      <div class="dt-maha-list" id="maha-list">
        ${e.map((t,n)=>{const r=t.isCurrent?Ga(t.start,t.end):t.isPast?100:0,s=O[t.lord]??"#888";return`
      <div class="${t.isCurrent?"maha-card current":t.isPast?"maha-card past":"maha-card future"}${n===G?" selected":""}" data-maha-idx="${n}" style="--planet-color:${s}">
        <div class="maha-left">
          <div class="maha-glyph">${j[t.lord]??""}</div>
          <div class="maha-info">
            <div class="maha-lord">${t.lord}</div>
            <div class="maha-years">${R[t.lord]}y</div>
          </div>
        </div>
        <div class="maha-right">
          <div class="maha-window">${q(t.start)} → ${q(t.end)}</div>
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
  `}function at(e,a){const t=e.antars.map(r=>{const s=Date.now()>=r.start.getTime()&&Date.now()<r.end.getTime(),o=Date.now()>=r.end.getTime(),i=O[r.lord]??"#888";return`
      <div class="${s?"antar-row current":o?"antar-row past":"antar-row future"}">
        <div class="antar-left">
          <span class="antar-glyph" style="color:${i}">${j[r.lord]??""}</span>
          <span class="antar-lord">${r.lord}</span>
          ${s?'<span class="antar-now-badge">NOW</span>':""}
        </div>
        <div class="antar-right">
          <span class="antar-window">${q(r.start)} → ${q(r.end)}</span>
          <span class="antar-dur">${Ae(r.start,r.end)}</span>
        </div>
      </div>
    `}).join(""),n=a?.pratyantar?tt(a):"";return`
    <section class="dt-section">
      <h3 class="dt-section-title">
        🔵 Antardashas — ${j[e.lord]??""} ${e.lord} Maha
        <span class="dt-hint">(${I(e.start)} – ${I(e.end)})</span>
      </h3>
      <div class="dt-antar-list">${t}</div>
      ${n}
    </section>
  `}function tt(e){if(!e.pratyantar?.length)return"";const a=e.pratyantar.map(t=>{const n=Date.now()>=t.start.getTime()&&Date.now()<t.end.getTime(),r=Date.now()>=t.end.getTime(),s=O[t.lord]??"#888";return`
      <div class="${n?"prat-row current":r?"prat-row past":"prat-row"}">
        <span class="prat-glyph" style="color:${s}">${j[t.lord]??""}</span>
        <span class="prat-lord">${t.lord}</span>
        ${n?'<span class="prat-now-badge">NOW</span>':""}
        <span class="prat-window">${q(t.start)} – ${q(t.end)}</span>
        <span class="prat-dur">${Ae(t.start,t.end)}</span>
      </div>
    `}).join("");return`
    <div class="dt-prat-section">
      <h4 class="dt-section-title">🔴 Pratyantar — ${e.lord} Antar</h4>
      <div class="dt-prat-list">${a}</div>
    </div>
  `}function ae(e){return`
    <div class="screen dasha-timeline">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>Dasha Timeline</h2></div>
      </header>
      <div style="padding: var(--space-4);">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function rt(e,a,t,n){e.querySelectorAll(".maha-card").forEach(r=>{r.addEventListener("click",()=>{G=parseInt(r.dataset.mahaIdx??"0",10),He(e,t,n)})})}nt();function nt(){const e="dasha-timeline-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const st={I:"Self, Health, Appearance",II:"Wealth, Family, Speech",III:"Courage, Siblings, Short Trips",IV:"Property, Mother, Happiness",V:"Children, Intelligence, Speculation",VI:"Enemies, Disease, Service",VII:"Marriage, Business Partners",VIII:"Longevity, Hidden, Inheritance",IX:"Luck, Father, Dharma",X:"Career, Status, Authority",XI:"Gains, Desires, Elder Siblings",XII:"Loss, Abroad, Liberation"},ge={Sun:"☀",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋"},he={Sun:"#d97706",Moon:"#6366f1",Mars:"#dc2626",Mercury:"#16a34a",Jupiter:"#b45309",Venus:"#db2777",Saturn:"#7c3aed",Rahu:"#475569",Ketu:"#92400e"},Fe={Aries:"Ar",Taurus:"Ta",Gemini:"Ge",Cancer:"Cn",Leo:"Le",Virgo:"Vi",Libra:"Li",Scorpio:"Sc",Sagittarius:"Sg",Capricorn:"Cp",Aquarius:"Aq",Pisces:"Pi"};let me,te="cusps";async function ot(){const e=$();S(e);const a=window.location.hash.includes("?")?window.location.hash.split("?")[1]:"",n=new URLSearchParams(a).get("kundali_id");if(!n){e.innerHTML=le("Missing kundali_id parameter.");return}me=parseInt(n,10),e.innerHTML=ct(),je(e);try{const r=await aa(me);if(!r.ok||!r.data){e.innerHTML=le(r.data?.error??"Failed to load KP chart.");return}Ke(e,r.data)}catch(r){console.error("[kp-sublords]",r),e.innerHTML=le("Connection error. Please try again.")}}function Ke(e,a){e.innerHTML=`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div>
          <h2>KP Sub-Lords</h2>
          <span class="subtitle">Krishnamurti Paddhati · Placidus Sidereal</span>
        </div>
      </header>

      <div class="kp-tabs" role="tablist">
        <button class="kp-tab${te==="cusps"?" active":""}" data-tab="cusps" role="tab">
          🏠 Bhavas (12)
        </button>
        <button class="kp-tab${te==="planets"?" active":""}" data-tab="planets" role="tab">
          🪐 Planets (${a.planet_sub_lords.length})
        </button>
      </div>

      <div class="kp-body">
        ${te==="cusps"?it(a.house_cusps):dt(a.planet_sub_lords)}
      </div>

      <div class="kp-caveat">${a.ayanamsa_caveat}</div>
    </div>
  `,je(e),lt(e,a)}function it(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the cusp</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Primary significator (KP prime indicator)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (fine-tuning)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const n=st[t.house]??"",r=t.sign??"",s=Fe[r]??r.slice(0,2),o=t.deg_in_sign.toFixed(2);return`
      <div class="kp-row">
        <div class="kp-row-header">
          <div class="kp-house-badge">H${t.house}</div>
          <div class="kp-row-meta">
            <span class="kp-pos">${s} ${o}°</span>
            <span class="kp-theme">${n}</span>
          </div>
        </div>
        <div class="kp-chain">
          ${K("Star",t.star_lord)}
          ${oe()}
          ${K("Sub",t.sub_lord,!0)}
          ${oe()}
          ${K("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Re(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function dt(e){return`
    <div class="kp-legend">
      <span class="kp-legend-item"><strong>Star Lord</strong> — Nakshatra lord of the planet</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub Lord</strong> — Controls planet's results (KP prime)</span>
      <span class="kp-legend-sep">→</span>
      <span class="kp-legend-item"><strong>Sub²</strong> — Sub-sub lord (finer detail)</span>
    </div>
    <div class="kp-rows">${e.map(t=>{const n=t.sign??"",r=Fe[n]??n.slice(0,2),s=t.deg_in_sign.toFixed(2),o=he[t.planet]??"#888",i=ge[t.planet]??"";return`
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
          ${K("Star",t.star_lord)}
          ${oe()}
          ${K("Sub",t.sub_lord,!0)}
          ${oe()}
          ${K("Sub²",t.sub_sub_lord)}
        </div>
        <div class="kp-sign-lord-line">
          Sign lord: ${Re(t.sign_lord)}
        </div>
      </div>
    `}).join("")}</div>
  `}function K(e,a,t=!1){const n=he[a]??"#888",r=ge[a]??"";return`
    <div class="kp-chain-cell${t?" prime":""}">
      <div class="kp-chain-label">${e}</div>
      <div class="kp-chain-lord" style="color:${n}">
        ${r} ${a}
      </div>
    </div>
  `}function oe(){return'<div class="kp-chain-arrow">→</div>'}function Re(e){const a=he[e]??"#888",t=ge[e]??"";return`<span class="lord-chip" style="color:${a}">${t} ${e}</span>`}function ct(){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="spinner" style="margin:40px auto"></div>
      </div>
    </div>
  `}function le(e){return`
    <div class="screen kp-sublords">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>KP Sub-Lords</h2></div>
      </header>
      <div style="padding:var(--space-4)">
        <div class="error-card"><p>${e}</p></div>
      </div>
    </div>
  `}function je(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{b(`/birth-chart?id=${me}`)})}function lt(e,a){e.querySelectorAll(".kp-tab").forEach(t=>{t.addEventListener("click",()=>{te=t.dataset.tab??"cusps",Ke(e,a)})})}ut();function ut(){const e="kp-sublords-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}const Le={property:{slug:"property",label:"Property Purchase",emoji:"🏠",defaultWindowDays:30,color:"#16a34a",scoringNotes:["Moon in 4th house sign (Cancer) or aspecting it = strong for property","4th house sub-lord (KP) must signify 4, 11 — not 8, 12","Venus hora or Jupiter hora preferred (wealth + expansion)","Avoid Panchaka Dosha for property transactions","Vastu direction: prefer East or North muhurta times"],auspiciousHoras:["Venus","Jupiter","Mercury"]},marriage:{slug:"marriage",label:"Marriage Muhurta",emoji:"💍",defaultWindowDays:60,color:"#db2777",scoringNotes:["7th house sub-lord (KP) must signify 1, 2, 7, 11 — not 6, 8, 12","Moon + Venus strong (no combustion, no debilitation)","Venus hora preferred; avoid Saturn hora for auspicious ceremonies","Navpancham / Trikona Tara between bride and groom is ideal","Avoid Ashtama Navamsha (Lagna in 8th part of sign during ceremony)"],auspiciousHoras:["Venus","Jupiter","Moon"]},business:{slug:"business",label:"Business Launch",emoji:"🏢",defaultWindowDays:30,color:"#2563eb",scoringNotes:["10th house sub-lord (KP) must signify 1, 6, 10, 11","Mercury hora for registration/contracts; Sun hora for authority/leadership","Moon in waxing phase (Shukla Paksha) for new ventures","Avoid Rahu hora for business starts (instability, hidden obstacles)","Jupiter must not be in 6, 8, 12 from Lagna (Guru Chandal Dosha check)"],auspiciousHoras:["Mercury","Sun","Jupiter"]},medical:{slug:"medical",label:"Medical / Surgery",emoji:"🏥",defaultWindowDays:14,color:"#dc2626",scoringNotes:["Moon must be strong — not in 8th house, not debilitated (Scorpio), not eclipsed","Avoid Ashtami (8th Tithi) and Krishna Chaturdashi (14th dark fortnight)","8th house sub-lord (KP) must NOT signify 2, 7 (maraka houses)","Sun hora for surgeries involving head/eye; Mars hora for procedures","Avoid Ganda Moola nakshatras — flag shown if active in selected window"],auspiciousHoras:["Sun","Mercury","Jupiter"]}};let B=null,ze="property",W=null,J=null;async function pt(){const e=$();S(e);const a=window.location.hash,t=a.includes("?")?a.split("?")[1]:"",n=new URLSearchParams(t),r=n.get("purpose")??"property";ze=Le[r]?r:"property";const s=n.get("kundali_id");B=s?parseInt(s,10):null;const o=Le[ze];if(e.innerHTML=ht(o),Oe(e),B&&!isNaN(B))try{const i=await be(B);if(i.ok&&i.data){const{kundali:u}=i.data;W=u.latitude,J=u.longitude}}catch{}vt(e,o)}function vt(e,a){const t=new Date().toISOString().slice(0,10),n=new Date(Date.now()+a.defaultWindowDays*864e5).toISOString().slice(0,10),r=W!==null?W.toFixed(4):"",s=J!==null?J.toFixed(4):"",o=W!==null&&J!==null;e.innerHTML=`
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
          📍 Using birth location: ${W.toFixed(4)}°N, ${J.toFixed(4)}°E
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
  `,ft(),Oe(e),mt(e,a)}function mt(e,a){const t=e.querySelector("#btn-scan");t&&t.addEventListener("click",async()=>{const n=document.getElementById("em-error");n.style.display="none";const r=document.getElementById("inp-lat").value,s=document.getElementById("inp-lon").value,o=document.getElementById("inp-from").value,i=document.getElementById("inp-to").value,u=parseFloat(r),c=parseFloat(s);if(!Number.isFinite(u)||u<-90||u>90){M(n,"Latitude must be between -90 and 90.");return}if(!Number.isFinite(c)||c<-180||c>180){M(n,"Longitude must be between -180 and 180.");return}if(!o||!i){M(n,"Please select a date range.");return}const d=new Date(o),l=new Date(i+"T23:59:59");if(l<=d){M(n,"'To' date must be after 'From' date.");return}const m=(l.getTime()-d.getTime())/864e5;if(m>90){M(n,"Date range cannot exceed 90 days.");return}t.disabled=!0,t.textContent="Scanning…";const p=document.getElementById("em-results");p.innerHTML=`
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
        <p style="margin-top:var(--space-3);color:var(--color-text-secondary)">
          Scanning ${Math.ceil(m)} days for auspicious windows…
        </p>
      </div>
    `;try{const v=await Ce({lat:u,lon:c,purpose:a.slug,kundali_id:B??void 0,from:d.toISOString(),to:l.toISOString(),top_n:20});v.ok?bt(p,v.data,a):(M(n,v.data?.error??"Scan failed. Please try again."),p.innerHTML="")}catch{M(n,"Connection error. Please try again."),p.innerHTML=""}finally{t.disabled=!1,t.textContent="Find Best Windows (costs 5 pts)"}})}function M(e,a){e.textContent=a,e.style.display="block"}function bt(e,a,t){const n=a.windows??[];if(n.length===0){e.innerHTML=`
      <div class="em-no-results">
        <p>No auspicious windows found in this range.</p>
        <p>Try a wider date range or different location.</p>
      </div>
    `;return}const r=new Map;for(const o of n){const i=o.timestamp.slice(0,10);r.has(i)||r.set(i,[]),r.get(i).push(o)}const s=Array.from(r.entries()).map(([o,i])=>{const u=new Date(o+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}),c=i[0],d=i.map(l=>{const m=new Date(l.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),p=l.tara?gt(l.tara.beneficence):"",v=[l.panchaka_active?'<span class="em-flag em-flag-warn">⚠ Panchaka</span>':"",l.ganda_moola?'<span class="em-flag em-flag-warn">⚠ Ganda Moola</span>':"",l.dishashool_direction?`<span class="em-flag em-flag-warn">⚠ Dishashool: ${l.dishashool_direction}</span>`:"",t.auspiciousHoras.includes(l.hora_lord)?`<span class="em-flag em-flag-good">✓ ${l.hora_lord} hora</span>`:""].filter(Boolean).join(" ");return`
        <div class="em-window-row">
          <div class="em-window-time">${m} IST</div>
          <div class="em-window-score">
            <div class="em-score-bar" style="width:${Math.min(l.score,100)}%"></div>
            <span>${l.score.toFixed(0)}/100</span>
          </div>
          <div class="em-window-detail">
            <span class="em-hora-chip">${l.hora_lord} hora</span>
            <span class="em-nak">${l.nakshatra}</span>
            ${l.tara?`<span class="em-tara ${p}">Tara ${l.tara.number}: ${l.tara.name}</span>`:""}
          </div>
          ${v?`<div class="em-flags">${v}</div>`:""}
        </div>
      `}).join("");return`
      <div class="em-day-card">
        <div class="em-day-header">
          <span class="em-day-date">${u}</span>
          <span class="em-day-best-score" style="color:var(--purpose-color)">${c.score.toFixed(0)}/100</span>
        </div>
        <div class="em-windows">${d}</div>
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
  `}function gt(e){return e==="benefic"?"em-tara-good":e==="malefic"?"em-tara-bad":"em-tara-neutral"}function ht(e){return`
    <div class="screen event-muhurta-screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <div><h2>${e.emoji} ${e.label}</h2></div>
      </header>
      <div style="padding:var(--space-6);text-align:center">
        <div class="spinner" style="margin:0 auto"></div>
      </div>
    </div>
  `}function Oe(e){e.querySelector("#btn-back")?.addEventListener("click",()=>{b(B?`/birth-chart?id=${B}`:"/dashboard")})}function ft(){const e="event-muhurta-styles";if(document.getElementById(e))return;const a=document.createElement("style");a.id=e,a.textContent=`
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
`,document.head.appendChild(a)}class yt{routes=new Map;constructor(){this.routes.set("/login",oa),this.routes.set("/dashboard",ia),this.routes.set("/muhurta",la),this.routes.set("/kundali",pa),this.routes.set("/kundali-form",ba),this.routes.set("/kp-query",ga),this.routes.set("/scanner",ya),this.routes.set("/wallet",xa),this.routes.set("/referral",ka),this.routes.set("/admin",ha),this.routes.set("/birth-chart",Sa),this.routes.set("/muhurta-dashboard",Ba),this.routes.set("/dasha-timeline",Ya),this.routes.set("/kp-sublords",ot),this.routes.set("/event-muhurta",pt)}currentRoute(){return window.location.hash.slice(1)||"/login"}basePath(a){return a.split("?")[0]??a}async route(){const a=this.currentRoute(),t=this.routes.get(this.basePath(a));if(t)try{await t()}catch(n){console.error(`Route handler error for ${a}:`,n)}else{const n=this.routes.get("/login");n&&await n()}}}function b(e){window.location.hash=e}window.addEventListener("error",e=>{const a=e.error?.message||e.message||"Unknown error";console.error("Global error:",a,e),qe({type:"uncaught-error",message:a,filename:e.filename,lineno:e.lineno,stack:e.error?.stack}),h("An error occurred. Please refresh.",!0)});window.addEventListener("unhandledrejection",e=>{const a=e.reason?.message||String(e.reason)||"Unhandled promise rejection";console.error("Unhandled rejection:",a,e.reason),qe({type:"unhandled-rejection",message:a,stack:e.reason?.stack})});async function qe(e){try{await fetch("/api/log-error",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{console.log("Error log endpoint not available")})}catch{}}function xt(){const e=localStorage.getItem("theme")||"auto",a=document.documentElement;let t=e;e==="auto"&&(t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),a.setAttribute("data-theme",t),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",n=>{if(localStorage.getItem("theme")==="auto"){const r=n.matches?"dark":"light";a.setAttribute("data-theme",r)}})}function kt(){const e=document.documentElement,t=(e.getAttribute("data-theme")||"light")==="light"?"dark":"light";e.setAttribute("data-theme",t),localStorage.setItem("theme",t)}async function wt(){if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",e),e.addEventListener("updatefound",()=>{const a=e.installing;a?.addEventListener("statechange",()=>{a.state==="installed"&&navigator.serviceWorker.controller&&h("Update available — refresh to get the latest version",!1)})})}catch(e){console.error("Service Worker registration failed:",e)}}async function Ie(){xt(),wt(),window.toggleTheme=kt;const e=new yt;window.addEventListener("hashchange",()=>{e.route()}),await e.route(),console.log("OccultViision PWA initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ie):Ie();
