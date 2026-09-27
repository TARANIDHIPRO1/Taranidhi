(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const u of r.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();function S(){return document.getElementById("app")}function L(e){e.innerHTML=""}function v(e,a=!1){let t=document.getElementById("ov-toast");t||(t=document.createElement("div"),t.id="ov-toast",document.body.appendChild(t)),t.textContent=e,t.className=`ov-toast show ${a?"error":"ok"}`,setTimeout(()=>t.classList.remove("show"),3e3)}const Q={},J=Q?.VITE_API_BASE??"";let M=localStorage.getItem("ov_session");function Y(e){M=e,e?localStorage.setItem("ov_session",e):localStorage.removeItem("ov_session")}async function w(e,a={}){const t={...a.headers??{}};M&&(t.Authorization=`Bearer ${M}`),a.body&&typeof a.body=="string"&&(t["Content-Type"]="application/json");const o=await fetch(`${J}${e}`,{...a,headers:t});let n;try{n=await o.json()}catch{n=null}return{ok:o.ok,status:o.status,data:n}}const Z=e=>w("/auth/request-otp",{method:"POST",body:JSON.stringify({phone:e})}),X=(e,a,t)=>w("/auth/verify-otp",{method:"POST",body:JSON.stringify({phone:e,code:a,device_fingerprint:t})}),N=()=>w("/kundali"),ee=e=>w("/kundali",{method:"POST",body:JSON.stringify(e)}),te=e=>w(`/kundali/${e}`,{method:"DELETE"}),ae=(e,a,t,o)=>{const n=new URLSearchParams({lat:String(e),lon:String(a)});return t&&n.set("purpose",t),o!==void 0&&n.set("kundali_id",String(o)),w(`/muhurta/now?${n}`)},ne=e=>{const a=new URLSearchParams({lat:String(e.lat),lon:String(e.lon)});return e.purpose&&a.set("purpose",e.purpose),e.kundali_id!==void 0&&a.set("kundali_id",String(e.kundali_id)),e.from&&a.set("from",e.from),e.to&&a.set("to",e.to),e.top_n!==void 0&&a.set("top_n",String(e.top_n)),w(`/muhurta/scan?${a}`)},oe=(e,a)=>w("/kp/query",{method:"POST",body:JSON.stringify({kundali_id:e,activity_slug:a})}),re=()=>w("/kp/activities"),K=()=>w("/wallet/balance"),se=()=>w("/referral/code"),ie=()=>w("/admin/stats");function le(){const e=S();L(e),e.innerHTML=`
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
  `;let a="";const t=document.getElementById("phone"),o=document.getElementById("btn-otp"),n=document.getElementById("step-phone"),r=document.getElementById("step-otp"),u=document.getElementById("otp-code"),p=document.getElementById("btn-verify"),y=document.getElementById("btn-back"),s=document.getElementById("login-loading");o.addEventListener("click",async()=>{if(a=t.value.trim(),!/^\d{10}$/.test(a)){v("Enter a valid 10-digit phone number",!0);return}o.setAttribute("disabled",""),s.classList.remove("hidden");const i=await Z(a);s.classList.add("hidden"),o.removeAttribute("disabled"),i.ok?(n.classList.add("hidden"),r.classList.remove("hidden"),u.focus(),v("OTP sent!")):v(i.data?.error??"Failed to send OTP",!0)}),y.addEventListener("click",()=>{r.classList.add("hidden"),n.classList.remove("hidden"),t.focus()}),p.addEventListener("click",async()=>{const i=u.value.trim();if(!/^\d{4,6}$/.test(i)){v("Enter the OTP code",!0);return}p.setAttribute("disabled",""),s.classList.remove("hidden");const m=`pwa-${navigator.userAgent.slice(0,40)}-${screen.width}x${screen.height}`,b=await X(a,i,m);s.classList.add("hidden"),p.removeAttribute("disabled"),b.ok&&b.data?.session_token?(Y(b.data.session_token),v("Logged in!"),f("/dashboard")):v(b.data?.error??"Verification failed",!0)})}function de(){const e=S();L(e),e.innerHTML=`
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
      </div>

      <footer class="app-footer">
        <button id="btn-logout" class="btn-link">Logout</button>
      </footer>
    </div>
  `,K().then(a=>{const t=document.getElementById("balance-badge");a.ok?t.textContent=`${a.data.balance??0} pts`:t.textContent="—"}),e.querySelectorAll(".card[data-route]").forEach(a=>{a.addEventListener("click",()=>{f(a.dataset.route)})}),document.getElementById("btn-logout").addEventListener("click",()=>{localStorage.removeItem("ov_session"),f("/login"),window.location.reload()})}let z=null;function R(){if(z)return z;const e=localStorage.getItem("ov_location");if(e)try{return z=JSON.parse(e),z}catch{}return null}function ce(e){z=e,localStorage.setItem("ov_location",JSON.stringify(e))}function j(){return new Promise((e,a)=>{if(!navigator.geolocation){a(new Error("Geolocation not supported"));return}navigator.geolocation.getCurrentPosition(t=>{const o={lat:t.coords.latitude,lon:t.coords.longitude};ce(o),e(o)},t=>a(t),{enableHighAccuracy:!1,timeout:1e4})})}const ue=[{value:"general",label:"General"},{value:"travel",label:"Travel"},{value:"finance",label:"Finance"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"relationship",label:"Relationship"},{value:"career",label:"Career"},{value:"spiritual",label:"Spiritual"}];function pe(){const e=S();L(e),e.innerHTML=`
    <div class="screen">
      <header class="screen-header">
        <button class="btn-back" id="btn-back">←</button>
        <h2>Muhurta Now</h2>
      </header>

      <div class="form-group">
        <label>Purpose</label>
        <select id="purpose">
          ${ue.map(t=>`<option value="${t.value}">${t.label}</option>`).join("")}
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
  `,document.getElementById("btn-back").addEventListener("click",()=>f("/dashboard"));const a=R();a&&(document.getElementById("lat").value=String(a.lat),document.getElementById("lon").value=String(a.lon)),document.getElementById("btn-gps").addEventListener("click",async()=>{try{const t=await j();document.getElementById("lat").value=String(t.lat),document.getElementById("lon").value=String(t.lon),v("Location updated")}catch{v("Could not get location",!0)}}),N().then(t=>{if(t.ok&&Array.isArray(t.data?.kundalis)){const o=document.getElementById("kundali-select");for(const n of t.data.kundalis){const r=document.createElement("option");r.value=String(n.id),r.textContent=n.label,o.appendChild(r)}}}),document.getElementById("btn-check").addEventListener("click",async()=>{const t=Number(document.getElementById("lat").value),o=Number(document.getElementById("lon").value);if(!Number.isFinite(t)||!Number.isFinite(o)){v("Set your location first",!0);return}const n=document.getElementById("purpose").value,r=document.getElementById("kundali-select").value,u=r?Number(r):void 0,p=document.getElementById("muhurta-loading"),y=document.getElementById("muhurta-result");p.classList.remove("hidden"),y.classList.add("hidden");const s=await ae(t,o,n,u);if(p.classList.add("hidden"),!s.ok){v(s.data?.error??"Request failed",!0);return}const i=s.data;y.classList.remove("hidden"),y.innerHTML=ve(i)})}function ve(e){const a=e.score>=70?"score-good":e.score>=40?"score-mid":"score-bad",t=(e.layers??[]).map(n=>`<div class="layer"><strong>${n.name}</strong>: ${n.detail} (${n.impact})</div>`).join(""),o=[];if(e.panchaka?.active&&o.push(`⚠️ Panchaka Dosha: ${e.panchaka.note}`),e.ganda_moola?.active&&o.push(`⚠️ Ganda Moola: ${e.ganda_moola.note}`),e.combustion?.length)for(const n of e.combustion)o.push(`🔥 ${n.planet} combust (${n.angular_distance.toFixed(1)}°)`);return`
    <div class="muhurta-card">
      <div class="score-circle ${a}">${e.score}</div>
      <div class="verdict">${e.verdict??""}</div>
      <div class="hora-info">
        <span>Hora: <strong>${e.hora_lord??"?"}</strong></span>
        <span>Nakshatra: <strong>${e.nakshatra??"?"}</strong></span>
      </div>
      ${e.tara?`<div class="tara">Tara: ${e.tara.name} (#${e.tara.number}) — ${e.tara.isBenefic?"✅ Benefic":"❌ Malefic"}</div>`:""}
      ${e.dishashool?`<div class="dishashool">Dishashool: ${e.dishashool.direction}</div>`:""}
      <div class="layers">${t}</div>
      ${o.length?`<div class="warnings">${o.join("<br/>")}</div>`:""}
      <div class="hora-window">Window: ${q(e.hora_start)} – ${q(e.hora_end)}</div>
    </div>
  `}function q(e){if(!e)return"?";try{return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return e}}async function me(){const e=S();L(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>f("/dashboard"));const a=document.getElementById("btn-add"),t=document.getElementById("btn-add-empty");a.addEventListener("click",()=>f("/kundali-form")),t&&t.addEventListener("click",()=>f("/kundali-form"));try{const o=await N(),n=document.getElementById("loading"),r=document.getElementById("list"),u=document.getElementById("empty"),p=o.ok&&Array.isArray(o.data?.kundalis)?o.data.kundalis:[];n.style.display="none",p.length===0?u.style.display="block":(r.style.display="block",be(r,p))}catch(o){console.error("Failed to load kundalis:",o),v("Failed to load kundalis",!0)}}function be(e,a){e.innerHTML=a.map(t=>`
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
          View
        </button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${t.id}">
          Delete
        </button>
      </div>
    </div>
  `).join(""),e.querySelectorAll(".view-btn").forEach(t=>{t.addEventListener("click",o=>{o.target.dataset.id})}),e.querySelectorAll(".delete-btn").forEach(t=>{t.addEventListener("click",async o=>{o.stopPropagation();const n=o.target.dataset.id,r=e.querySelector(`[data-id="${n}"]`),u=r?.querySelector("h3")?.textContent||"this kundali";if(confirm(`Delete ${u}? This cannot be undone.`))try{const p=await te(Number(n));p.ok?(v("Kundali deleted"),r?.remove(),e.querySelectorAll(".kundali-item").length===0&&(e.style.display="none",document.getElementById("empty").style.display="block")):v(p.data?.error??"Failed to delete kundali",!0)}catch(p){console.error("Delete error:",p),v("Error deleting kundali",!0)}})})}const ge=[{value:"Asia/Kolkata",label:"India (IST)"},{value:"Asia/Bangkok",label:"Thailand (ICT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Australia/Sydney",label:"Sydney (AEDT)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"America/New_York",label:"New York (EST/EDT)"},{value:"America/Los_Angeles",label:"Los Angeles (PST/PDT)"},{value:"America/Chicago",label:"Chicago (CST/CDT)"}];async function ye(){const e=S();L(e),e.innerHTML=`
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
            ${ge.map(l=>`<option value="${l.value}">${l.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("name"),o=document.getElementById("birth-date"),n=document.getElementById("birth-time"),r=document.getElementById("lat"),u=document.getElementById("lon"),p=document.getElementById("timezone"),y=document.getElementById("btn-gps"),s=document.getElementById("btn-cancel"),i=document.getElementById("error-box"),m=new Date().toISOString().split("T")[0];o.value=m;const b=R();b&&(r.value=String(b.lat),u.value=String(b.lon)),p.value="Asia/Kolkata",y.addEventListener("click",async l=>{l.preventDefault();try{const d=await j();r.value=String(d.lat),u.value=String(d.lon),v("Location updated")}catch{v("Could not get location",!0)}}),s.addEventListener("click",l=>{l.preventDefault(),f("/kundali")}),a.addEventListener("submit",async l=>{l.preventDefault(),i.style.display="none";const d=t.value.trim(),c=o.value,h=n.value,g=parseFloat(r.value),x=parseFloat(u.value),E=p.value;if(!d||!c||!h||!E||isNaN(g)||isNaN(x)){i.textContent="Please fill in all fields",i.style.display="block";return}if(g<-90||g>90){i.textContent="Latitude must be between -90 and 90",i.style.display="block";return}if(x<-180||x>180){i.textContent="Longitude must be between -180 and 180",i.style.display="block";return}const k=document.getElementById("btn-submit");k.disabled=!0,k.textContent="Creating...";try{const[B,D,T]=c.split("-"),[_,C]=h.split(":"),$=`${B}-${D}-${T}T${_}:${C}:00`,P=new Intl.DateTimeFormat("en-US",{timeZone:E,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),O=new Date(`${B}-${D}-${T}T${_}:${C}:00`),A=new Intl.DateTimeFormat("en-US",{timeZone:E,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date),W=new Date(parseInt(A.find(I=>I.type==="year")?.value||"2000"),parseInt(A.find(I=>I.type==="month")?.value||"1")-1,parseInt(A.find(I=>I.type==="day")?.value||"1"),parseInt(A.find(I=>I.type==="hour")?.value||"0"),parseInt(A.find(I=>I.type==="minute")?.value||"0"),parseInt(A.find(I=>I.type==="second")?.value||"0")),V=O.getTime()-W.getTime(),G=new Date(O.getTime()-V).toISOString().split(".")[0],H=await ee({label:d,birth_date:G,latitude:g,longitude:x,timezone:E});if(H.ok)v("Kundali created successfully"),f("/kundali");else{const I=H.data?.error||"Failed to create kundali";i.textContent=I,i.style.display="block",k.disabled=!1,k.textContent="Create Kundali"}}catch(B){console.error("Create error:",B),i.textContent="Error creating kundali",i.style.display="block",k.disabled=!1,k.textContent="Create Kundali"}}),document.getElementById("btn-back").addEventListener("click",()=>f("/kundali"))}async function fe(){const e=S();L(e),e.innerHTML=`
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),o=document.getElementById("activity"),n=document.getElementById("query-time"),r=document.getElementById("btn-cancel"),u=document.getElementById("error-box"),p=document.getElementById("result"),y=new Date;n.value=y.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"});try{const s=await N(),i=s.ok&&Array.isArray(s.data?.kundalis)?s.data.kundalis:[];if(i.length===0){v("Please create a kundali first",!0),f("/kundali-form");return}t.innerHTML=i.map(m=>`<option value="${m.id}">${m.label||"Unnamed"}</option>`).join("")}catch(s){console.error("Failed to load kundalis:",s),v("Failed to load kundalis",!0)}try{const s=await re(),i=s.ok&&Array.isArray(s.data?.activities)?s.data.activities:[];o.innerHTML='<option value="">-- Select --</option>'+i.map(m=>`<option value="${m.code}">${m.name}</option>`).join("")}catch(s){console.error("Failed to load activities:",s),v("Failed to load activities",!0)}r.addEventListener("click",s=>{s.preventDefault(),f("/dashboard")}),a.addEventListener("submit",async s=>{s.preventDefault(),u.style.display="none",p.style.display="none";const i=parseInt(t.value),m=o.value;if(!i||!m){u.textContent="Please select both kundali and activity",u.style.display="block";return}const b=document.getElementById("btn-submit");b.disabled=!0,b.textContent="Checking...";try{const l=await oe(i,m);if(l.ok){const d=l.data;p.innerHTML=`
          <div class="result-box">
            <div style="text-align: center; margin-bottom: var(--space-6);">
              <div style="font-size: 2.5rem; font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${d.verdict==="PROMISED"?"✅":"❌"}
              </div>
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">
                ${d.verdict}
              </div>
              <div style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
                Confidence: <strong>${d.confidence||0}%</strong>
              </div>
            </div>

            <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
              <h3 style="margin-bottom: var(--space-3);">Analysis</h3>
              <div style="font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                <p><strong>House:</strong> ${d.house}</p>
                <p><strong>Cusp Nakshatra:</strong> ${d.cusp_nakshatra||"—"}</p>
                <p><strong>Sub-Lord:</strong> ${d.sub_lord||"—"}</p>
                <p><strong>Dasha Status:</strong> ${d.dasha_status||"—"}</p>
                <p><strong>Tarabala:</strong> ${d.tarabala||"—"}</p>
                <p><strong>Panchaka:</strong> ${d.panchaka?"⚠️ Active":"✓ Absent"}</p>
                ${d.ganda_moola?"<p><strong>Ganda Moola:</strong> ⚠️ Active</p>":""}
              </div>
            </div>

            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
              Query time: ${new Date(d.timestamp).toLocaleTimeString("en-IN")}
            </div>
          </div>
        `,p.style.display="block"}else{const d=l.data?.error||"Failed to query KP";u.textContent=d,u.style.display="block"}}catch(l){console.error("Query error:",l),u.textContent="Error processing query",u.style.display="block"}finally{b.disabled=!1,b.textContent="Check Now"}}),document.getElementById("btn-back").addEventListener("click",()=>f("/dashboard"))}async function he(){const e=S();L(e),e.innerHTML=`
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
  `,document.getElementById("btn-back").addEventListener("click",()=>f("/dashboard"));try{const a=await ie(),t=document.getElementById("loading"),o=document.getElementById("stats"),n=document.getElementById("error");if(!a.ok){n.textContent=a.data?.error||"Failed to load stats",n.style.display="block",t.style.display="none";return}const r=a.data;document.getElementById("queries-24h").textContent=String(r.queries_24h||0),document.getElementById("active-users").textContent=String(r.active_users||0),document.getElementById("revenue").textContent=`₹${(r.revenue_estimate||0).toLocaleString("en-IN")}`,document.getElementById("conversion").textContent=`${(r.conversion_rate||0).toFixed(1)}%`;const u=(r.top_activities||[]).map(y=>`<div style="padding: var(--space-2); border-bottom: 1px solid var(--color-border);">
        <strong>${y.name}</strong>: ${y.count} queries
      </div>`).join("");document.getElementById("top-activities").innerHTML=u||"<p>No data</p>";const p=`
      <p><strong>D1 Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>KV Status:</strong> <span style="color: var(--color-success);">✓ Operational</span></p>
      <p><strong>Error Rate (24h):</strong> ${(r.error_rate_pct||0).toFixed(2)}%</p>
      <p><strong>Rate Limit Events (24h):</strong> ${r.rate_limit_events||0}</p>
    `;document.getElementById("system-health").innerHTML=p,t.style.display="none",o.style.display="block"}catch(a){console.error("Admin stats error:",a);const t=document.getElementById("error");t.textContent="Error loading stats",t.style.display="block",document.getElementById("loading").style.display="none"}}const ke=[{value:"travel",label:"Travel"},{value:"marriage",label:"Marriage"},{value:"business",label:"Business"},{value:"health",label:"Health"},{value:"education",label:"Education"},{value:"general",label:"General"}];async function Ee(){const e=S();L(e),e.innerHTML=`
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
              ${ke.map(l=>`<option value="${l.value}">${l.label}</option>`).join("")}
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
  `;const a=document.getElementById("form"),t=document.getElementById("kundali"),o=document.getElementById("category"),n=document.getElementById("from-date"),r=document.getElementById("to-date"),u=document.getElementById("top-n"),p=document.getElementById("location"),y=document.getElementById("btn-cancel"),s=document.getElementById("error-box"),i=document.getElementById("results"),m=new Date,b=new Date(m);b.setDate(b.getDate()+30),n.value=m.toISOString().split("T")[0],r.value=b.toISOString().split("T")[0];try{const l=await N(),d=l.ok&&Array.isArray(l.data?.kundalis)?l.data.kundalis:[];if(d.length===0){v("Please create a kundali first",!0),f("/kundali-form");return}t.innerHTML=d.map(c=>`<option value="${c.id}" data-lat="${c.latitude}" data-lon="${c.longitude}">${c.label||"Unnamed"}</option>`).join(""),t.addEventListener("change",()=>{const c=t.options[t.selectedIndex],h=c.getAttribute("data-lat"),g=c.getAttribute("data-lon");p.value=h&&g?`${h}, ${g}`:""}),t.dispatchEvent(new Event("change"))}catch(l){console.error("Failed to load kundalis:",l),v("Failed to load kundalis",!0)}y.addEventListener("click",l=>{l.preventDefault(),f("/dashboard")}),a.addEventListener("submit",async l=>{l.preventDefault(),s.style.display="none",i.style.display="none";const d=parseInt(t.value),c=o.value,h=n.value,g=r.value,x=parseInt(u.value)||5;if(!d||!c||!h||!g){s.textContent="Please fill all required fields",s.style.display="block";return}if(new Date(h)>new Date(g)){s.textContent="Start date must be before end date",s.style.display="block";return}const E=document.getElementById("btn-submit");E.disabled=!0,E.textContent="Scanning...";try{const k=t.options[t.selectedIndex],B=parseFloat(k.getAttribute("data-lat")||"0"),D=parseFloat(k.getAttribute("data-lon")||"0"),T=await ne({lat:B,lon:D,purpose:c,kundali_id:d,from:h,to:g,top_n:x});if(T.ok){const C=T.data.results||[];C.length===0?i.innerHTML=`
            <div class="result-box">
              <p style="text-align: center; color: var(--color-text-secondary);">
                No highly auspicious dates found in this range. Try expanding the date range or changing the category.
              </p>
            </div>
          `:i.innerHTML=`
            <div class="result-box">
              <h3 style="margin-bottom: var(--space-4);">Top ${C.length} Auspicious Dates</h3>
              ${C.map(($,P)=>`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-3); border-left: 4px solid ${$.muhurta_pct>70?"#10b981":"#f59e0b"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>#${P+1}: ${new Date($.date).toLocaleDateString("en-IN")}</strong>
                    <span style="background: ${$.muhurta_pct>70?"#d1fae5":"#fef3c7"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-sm); color: ${$.muhurta_pct>70?"#047857":"#92400e"}; font-weight: bold;">
                      ${$.muhurta_pct}%
                    </span>
                  </div>
                  <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                    Time: ${$.best_time||"All day auspicious"}
                  </p>
                </div>
              `).join("")}
              <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-6); text-align: center;">
                Scores based on Muhurta analysis (100% = perfectly auspicious)
              </p>
            </div>
          `,i.style.display="block"}else{const _=T.data?.error||"Failed to scan dates";s.textContent=_,s.style.display="block"}}catch(k){console.error("Scan error:",k),s.textContent="Error scanning dates",s.style.display="block"}finally{E.disabled=!1,E.textContent="Scan Dates"}}),document.getElementById("btn-back").addEventListener("click",()=>f("/dashboard"))}async function xe(){const e=S();L(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-refresh"),o=document.getElementById("btn-topup"),n=document.getElementById("balance-amount"),r=document.getElementById("batches-section"),u=document.getElementById("batches-list"),p=document.getElementById("transactions-list"),y=document.getElementById("no-transactions"),s=document.getElementById("error-box");async function i(){s.style.display="none",n.textContent="Loading...",t.disabled=!0,o.disabled=!0;try{const m=await K();if(m.ok){const b=m.data;n.textContent=String(b.total_points??0);const l=Array.isArray(b.batches)?b.batches:[];l.length>0?(r.style.display="block",u.innerHTML=l.map(c=>{const h=new Date(c.expires_at),g=new Date,x=Math.ceil((h.getTime()-g.getTime())/(24*60*60*1e3)),E=x<=7,k=c.status==="active"?"Active":c.status==="held"?"Held":"Expired";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${E?"#ef4444":"#10b981"};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${c.source==="free_trial"?"Free Trial":c.source==="subscription"?"Subscription":c.source==="referral"?"Referral":"Top-up"}</strong>
                    <span style="background: ${c.status==="active"?"#d1fae5":c.status==="held"?"#fef3c7":"#f3f4f6"}; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${c.status==="active"?"#047857":c.status==="held"?"#92400e":"#6b7280"}; font-weight: bold;">
                      ${k}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--font-size-sm);">${c.points_available} pts available</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                      Expires: ${h.toLocaleDateString("en-IN")}
                      ${E&&c.status==="active"?` (${x}d left)`:""}
                    </span>
                  </div>
                </div>
              `}).join("")):r.style.display="none";const d=Array.isArray(b.transactions)?b.transactions:[];d.length>0?(y.style.display="none",p.innerHTML=d.slice(0,10).map(c=>{const h=new Date(c.created_at),g=c.type==="debit"?"-":"+",x=c.type==="debit"?"#dc2626":"#10b981",E=c.description||(c.type==="debit"?"Query":"Credit");return`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background-color: var(--color-bg); border-radius: var(--radius-md); border-left: 3px solid ${x};">
                  <div>
                    <div style="font-size: var(--font-size-sm); font-weight: 500;">${E}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
                      ${h.toLocaleDateString("en-IN")} ${h.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${x};">
                      ${g}${c.amount}
                    </div>
                  </div>
                </div>
              `}).join("")):(y.style.display="block",p.innerHTML="")}else{const b=m.data?.error||"Failed to load wallet";s.textContent=b,s.style.display="block",n.textContent="Error"}}catch(m){console.error("Wallet load error:",m),s.textContent="Error loading wallet",s.style.display="block",n.textContent="Error"}finally{t.disabled=!1,o.disabled=!1}}a.addEventListener("click",()=>f("/dashboard")),t.addEventListener("click",i),o.addEventListener("click",()=>{v("Opening payment gateway...",!1),f("/orders")}),i()}async function Ie(){const e=S();L(e),e.innerHTML=`
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
  `;const a=document.getElementById("btn-back"),t=document.getElementById("btn-copy"),o=document.getElementById("btn-share"),n=document.getElementById("btn-copy-message"),r=document.getElementById("referral-code"),u=document.getElementById("total-earned"),p=document.getElementById("referral-count"),y=document.getElementById("referred-users"),s=document.getElementById("no-referrals"),i=document.getElementById("error-box");let m="";async function b(){i.style.display="none";try{const l=await se();if(l.ok){const d=l.data;m=d.code||"";const c=d.stats||{},h=Array.isArray(d.referred_users)?d.referred_users:[];r.textContent=m||"LOADING...",u.textContent=`₹${c.total_earned??0}`,p.textContent=String(c.referral_count??0),h.length>0?(s.style.display="none",y.innerHTML=h.map(g=>{const x=g.commission_activated_at?new Date(g.commission_activated_at):null,E=g.commission_status==="active"?"Activated":g.commission_status==="held"?"Held":"Pending",k=g.commission_status==="active"?"#10b981":g.commission_status==="held"?"#f59e0b":"#6b7280";return`
                <div style="background-color: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid ${k};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <strong>${g.phone||"Anonymous"}</strong>
                    <span style="background: ${k}20; padding: 4px 8px; border-radius: 4px; font-size: var(--font-size-xs); color: ${k}; font-weight: bold;">
                      ${E}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    <span>Commission: ₹${g.commission_amount||0}</span>
                    <span>${g.referred_at?new Date(g.referred_at).toLocaleDateString("en-IN"):"—"}</span>
                  </div>
                  ${x?`
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">
                      Activated: ${x.toLocaleDateString("en-IN")}
                    </div>
                  `:""}
                </div>
              `}).join("")):(s.style.display="block",y.innerHTML="")}else{const d=l.data?.error||"Failed to load referral data";i.textContent=d,i.style.display="block"}}catch(l){console.error("Referral load error:",l),i.textContent="Error loading referral data",i.style.display="block"}}a.addEventListener("click",()=>f("/dashboard")),t.addEventListener("click",async()=>{if(!m){v("Code not available",!0);return}try{await navigator.clipboard.writeText(m),v("Referral code copied!",!1)}catch{v("Failed to copy code",!0)}}),n.addEventListener("click",async()=>{const l=`Join me on OccultViision! Use my referral code: ${m}

https://www.occultviision.com`;try{await navigator.clipboard.writeText(l),v("Share message copied!",!1)}catch{v("Failed to copy message",!0)}}),o.addEventListener("click",()=>{const l=`Join me on OccultViision! Use my referral code: ${m}

https://www.occultviision.com`,d=`https://wa.me/?text=${encodeURIComponent(l)}`;window.open(d,"_blank")}),b()}class we{routes=new Map;constructor(){this.routes.set("/login",le),this.routes.set("/dashboard",de),this.routes.set("/muhurta",pe),this.routes.set("/kundali",me),this.routes.set("/kundali-form",ye),this.routes.set("/kp-query",fe),this.routes.set("/scanner",Ee),this.routes.set("/wallet",xe),this.routes.set("/referral",Ie),this.routes.set("/admin",he)}currentRoute(){return window.location.hash.slice(1)||"/login"}async route(){const a=this.currentRoute(),t=this.routes.get(a);if(t)try{await t()}catch(o){console.error(`Route handler error for ${a}:`,o)}else{const o=this.routes.get("/login");o&&await o()}}}function f(e){window.location.hash=e}window.addEventListener("error",e=>{const a=e.error?.message||e.message||"Unknown error";console.error("Global error:",a,e),U({type:"uncaught-error",message:a,filename:e.filename,lineno:e.lineno,stack:e.error?.stack}),v("An error occurred. Please refresh.",!0)});window.addEventListener("unhandledrejection",e=>{const a=e.reason?.message||String(e.reason)||"Unhandled promise rejection";console.error("Unhandled rejection:",a,e.reason),U({type:"unhandled-rejection",message:a,stack:e.reason?.stack})});async function U(e){try{await fetch("/api/log-error",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).catch(()=>{console.log("Error log endpoint not available")})}catch{}}function Se(){const e=localStorage.getItem("theme")||"auto",a=document.documentElement;let t=e;e==="auto"&&(t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),a.setAttribute("data-theme",t),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",o=>{if(localStorage.getItem("theme")==="auto"){const n=o.matches?"dark":"light";a.setAttribute("data-theme",n)}})}function Le(){const e=document.documentElement,t=(e.getAttribute("data-theme")||"light")==="light"?"dark":"light";e.setAttribute("data-theme",t),localStorage.setItem("theme",t)}async function $e(){if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});console.log("Service Worker registered:",e),e.addEventListener("updatefound",()=>{const a=e.installing;a?.addEventListener("statechange",()=>{a.state==="installed"&&navigator.serviceWorker.controller&&v("Update available — refresh to get the latest version",!1)})})}catch(e){console.error("Service Worker registration failed:",e)}}async function F(){Se(),$e(),window.toggleTheme=Le;const e=new we;window.addEventListener("hashchange",()=>{e.route()}),await e.route(),console.log("OccultViision PWA initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F):F();
