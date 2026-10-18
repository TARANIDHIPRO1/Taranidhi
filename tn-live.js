/* TaraNidhi — live pages: NOW, Panchang, Hora & Lagna, Star Time.
   All values come from GET /muhurta/now on the OCCULTVIISION API. Nothing is computed or invented here.
   Location: the viewer's current place (GPS or city search) — this is correct for Panchang/Hora.
   (Kundali birth charts use the BIRTH city instead; see tn-kundali.js.) */
(function () {
  'use strict';
  var API = 'https://occultviision-api.occultviision.workers.dev';
  var TOKEN_KEY = 'tn_session_token', PHONE_KEY = 'tn_session_phone', PLACE_KEY = 'tn_place';
  var root = document.getElementById('tn-live');
  if (!root) return;
  var PAGE = root.getAttribute('data-page');
  var TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function $(id) { return document.getElementById(id); }
  var fmtT = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  function T(iso) { return iso ? fmtT.format(new Date(iso)).toUpperCase() : '—'; }
  function span(a, b) { return T(a) + ' – ' + T(b); }

  /* ---------- API ---------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' }, t = load(TOKEN_KEY);
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(API + path, { method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); })
      .catch(function () { return { ok: false, status: 0, body: { error: 'Could not reach the server. Check your internet connection.' } }; });
  }
  function fingerprint() {
    var raw = [navigator.userAgent, screen.width + 'x' + screen.height, navigator.language, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|');
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 0; for (var i = 0; i < raw.length; i++) { h = ((h << 5) - h + raw.charCodeAt(i)) | 0; }
    return Promise.resolve('fp' + Math.abs(h).toString(16) + raw.length + '00000000');
  }
  function normPhone(s) { return String(s || '').replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, ''); }

  /* ---------- layout shell ---------- */
  root.innerHTML = '<div id="tn-place"></div><div id="tn-body" aria-live="polite"></div>';
  var placeBox = $('tn-place'), body = $('tn-body');

  function msgPanel(title, html) {
    return '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">ℹ</span><h2>' + esc(title) + '</h2></div></div>' + html + '</section>';
  }
  function loading(t) { body.innerHTML = msgPanel('PLEASE WAIT', '<p class="card-subtitle">' + esc(t) + '</p>'); }

  /* ---------- place (viewer's current location: GPS or city search) ---------- */
  function getPlace() { try { return JSON.parse(load(PLACE_KEY) || 'null'); } catch (e) { return null; } }
  function setPlace(p) { store(PLACE_KEY, JSON.stringify(p)); }
  function geocode(q) {
    return fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&format=json&name=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (j) { var b = (j.results || [])[0]; return b ? { lat: b.latitude, lon: b.longitude, label: [b.name, b.admin1, b.country].filter(Boolean).join(', ') } : null; })
      .catch(function () { return null; });
  }
  function reverseLabel(lat, lon) {
    return fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en&latitude=' + lat + '&longitude=' + lon)
      .then(function (r) { return r.json(); })
      .then(function (j) { var s = [j.city || j.locality, j.principalSubdivision, j.countryName].filter(Boolean).join(', '); return s ? s + ' (GPS)' : 'My GPS location'; })
      .catch(function () { return 'My GPS location'; });
  }
  /* GPS fix -> save place (not manual) -> redraw -> recalc. say(text) shows progress in the place bar. */
  function gpsFix(say, opts) {
    opts = opts || {};
    if (!navigator.geolocation) { say('GPS is not available in this browser. Type a city instead.'); return Promise.resolve(false); }
    say('Detecting your GPS location …');
    return new Promise(function (resolve) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude, lon = pos.coords.longitude;
        reverseLabel(lat, lon).then(function (label) { setPlace({ lat: lat, lon: lon, label: label, manual: false, ts: Date.now() }); drawPlace(); run(); resolve(true); });
      }, function (err) {
        var denied = err && err.code === 1;
        say(denied ? 'GPS is blocked for this site. Click the lock icon next to the address bar, set Location to Allow, then press USE MY GPS LOCATION. Until then, type a city.' : 'GPS could not get a fix (' + ((err && err.message) || 'unknown') + '). Try again or type a city.');
        resolve(false);
      }, { enableHighAccuracy: true, timeout: opts.timeout || 20000, maximumAge: opts.maxAge == null ? 120000 : opts.maxAge });
    });
  }
  function drawPlace() {
    var p = getPlace();
    placeBox.innerHTML = '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">📍</span><h2>YOUR LOCATION</h2></div><button type="button" class="pill" id="tn-refresh" style="cursor:pointer">REFRESH ↻</button></div>' +
      '<p class="card-subtitle" id="tn-place-label">' + (p ? esc(p.label) + ' · ' + p.lat.toFixed(4) + ', ' + p.lon.toFixed(4) : 'Location not set. Detecting GPS … or type a city.') + '</p>' +
      '<div class="form-row"><div class="form-group"><label for="tn-city">City</label><input id="tn-city" placeholder="e.g. Bhopal, India"></div></div>' +
      '<button type="button" class="submit-btn" id="tn-setcity" style="margin-bottom:10px">SET CITY</button>' +
      '<button type="button" class="submit-btn" id="tn-gps" style="background:linear-gradient(140deg,rgba(67,240,162,.8),rgba(43,240,162,.6));margin-bottom:6px">📍 USE MY GPS LOCATION</button>' +
      '<div class="result-box" id="tn-place-msg"></div></section>';
    function say(t) { var m = $('tn-place-msg'); m.textContent = t; m.classList.toggle('show', !!t); }
    $('tn-setcity').addEventListener('click', function () {
      var q = $('tn-city').value.trim(); if (!q) { say('Type a city name.'); return; }
      say('Finding ' + q + ' …');
      geocode(q).then(function (pl) { if (!pl) { say('Could not find "' + q + '".'); return; } pl.manual = true; setPlace(pl); drawPlace(); run(); });
    });
    $('tn-gps').addEventListener('click', function () { gpsFix(say, { maxAge: 0 }); });
    $('tn-refresh').addEventListener('click', function () { run(); });
  }

  /* ---------- login ---------- */
  function loginPanel() {
    body.innerHTML = msgPanel('LOGIN TO SEE LIVE DATA',
      '<p class="card-subtitle">Enter your mobile number to get an OTP. Your Panchang and Hora are calculated live for your location.</p>' +
      '<div class="form-group"><label for="tn-phone">Mobile *</label><input id="tn-phone" type="tel" inputmode="numeric" placeholder="10-digit mobile" value="' + esc(load(PHONE_KEY) || '') + '"></div>' +
      '<button type="button" class="submit-btn" id="tn-otp-send">SEND OTP</button>' +
      '<div id="tn-otp-step" hidden><div class="form-group"><label for="tn-otp">OTP *</label><input id="tn-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code"></div><button type="button" class="submit-btn" id="tn-otp-go">VERIFY &amp; CONTINUE</button></div>' +
      '<div class="result-box" id="tn-otp-msg"></div>');
    function say(t) { var m = $('tn-otp-msg'); m.textContent = t; m.classList.toggle('show', !!t); }
    var phone = '';
    $('tn-otp-send').addEventListener('click', function () {
      phone = normPhone($('tn-phone').value);
      if (!/^[6-9]\d{9}$/.test(phone)) { say('Enter a valid 10-digit Indian mobile number.'); return; }
      say('Sending OTP …');
      api('/auth/request-otp', { method: 'POST', body: { phone_number: phone } }).then(function (r) {
        if (!r.ok) { say(r.body.error || 'OTP could not be sent.'); return; }
        say(r.body.dev_bypass_active ? 'Test mode is on: the OTP is ' + r.body.dev_bypass_code + '.' : 'Enter the 6-digit OTP sent to +91 ' + phone + '.');
        $('tn-otp-step').hidden = false; $('tn-otp').focus();
      });
    });
    $('tn-otp-go').addEventListener('click', function () {
      var code = $('tn-otp').value.trim();
      if (!/^\d{6}$/.test(code)) { say('Enter the 6-digit code.'); return; }
      say('Verifying …');
      fingerprint().then(function (fp) { return api('/auth/verify-otp', { method: 'POST', body: { phone_number: phone, code: code, fingerprint_hash: fp } }); }).then(function (v) {
        if (!v.ok) { say(v.body.error || 'Verification failed.'); return; }
        var tok = v.body.token || v.body.session_token || v.body.access_token;
        if (!tok) { say('Login succeeded but no session token came back.'); return; }
        store(TOKEN_KEY, tok); store(PHONE_KEY, phone); run();
      });
    });
  }

  /* ---------- fetch ---------- */
  var cache = null;
  var horaPurpose = 'general';
  function fetchNow(force) {
    var p = getPlace();
    if (!p) { body.innerHTML = msgPanel('SET YOUR LOCATION', '<p class="card-subtitle">Press "Use my GPS location" or type a city above.</p>'); return Promise.resolve(null); }
    if (!load(TOKEN_KEY)) { loginPanel(); return Promise.resolve(null); }
    var ckey = p.lat + ',' + p.lon + ',' + horaPurpose;
    if (!force && cache && cache.key === ckey && Date.now() - cache.at < 30000) return Promise.resolve(cache.data);
    loading('Calculating the live sky for ' + p.label + ' …');
    return api('/muhurta/now?lat=' + encodeURIComponent(p.lat) + '&lon=' + encodeURIComponent(p.lon) + (PAGE === 'hora' ? '&purpose=' + encodeURIComponent(horaPurpose) : '')).then(function (r) {
      if (r.status === 401) { store(TOKEN_KEY, null); loginPanel(); return null; }
      if (r.status === 402) { body.innerHTML = msgPanel('POINTS NEEDED', '<p class="card-subtitle">Your points balance is 0, so a live lookup cannot run. Recharge points or upgrade your plan, then press REFRESH.</p>'); return null; }
      if (!r.ok) { body.innerHTML = msgPanel('COULD NOT LOAD', '<p class="card-subtitle">' + esc(r.body.error || 'Server error') + ' Press REFRESH to try again.</p>'); return null; }
      cache = { key: ckey, at: Date.now(), data: r.body };
      return r.body;
    });
  }

  /* ---------- small view helpers ---------- */
  function card(icon, title, main, sub) {
    return '<div class="card"><div class="card-icon">' + icon + '</div><h3 class="card-title">' + esc(title) + '</h3><p class="card-subtitle"><b>' + esc(main) + '</b>' + (sub ? '<br>' + esc(sub) : '') + '</p></div>';
  }
  function panel(icon, title, inner, pill) {
    return '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">' + icon + '</span><h2>' + esc(title) + '</h2></div>' + (pill ? '<span class="pill">' + esc(pill) + '</span>' : '') + '</div>' + inner + '</section>';
  }
  function infoBox(label, value, note) {
    return '<div class="info-box"><div class="info-label">' + esc(label) + '</div><p class="info-value">' + esc(value) + '</p>' + (note ? '<p style="font-size:11px;opacity:.85">' + esc(note) + '</p>' : '') + '</div>';
  }
  var tbl = 'style="width:100%;border-collapse:collapse;font-size:12px"', th = 'style="text-align:left;padding:6px 4px;border-bottom:1px solid #d8b86a66"', td = 'style="padding:6px 4px;border-bottom:1px solid #ffffff1a"';
  function tithiText(d) {
    var mp = d.masa_paksha || {}, day = mp.pakshaDay, n = TITHI[(day || 1) - 1];
    if (day === 15) n = mp.paksha === 'Shukla' ? 'Purnima' : 'Amavasya';
    return (mp.paksha ? mp.paksha + ' ' : '') + (n || 'Tithi ' + d.tithi.number);
  }
  function nakText(d) { return d.current_nakshatra ? d.current_nakshatra.name : '—'; }
  function yogaText(d) { return d.nitya_yoga ? d.nitya_yoga.name : '—'; }
  function horaRows(d, nowMs) {
    return (d.all_horas || []).map(function (h) {
      var cur = nowMs >= Date.parse(h.start) && nowMs < Date.parse(h.end);
      return '<tr' + (cur ? ' style="background:#ffd76a22;font-weight:700"' : '') + '><td ' + td + '>' + h.hora_number + '</td><td ' + td + '>' + esc(h.lord) + (cur ? ' ◀ now' : '') + '</td><td ' + td + '>' + esc(span(h.start, h.end)) + '</td><td ' + td + '>' + esc(h.nature) + (h.is_daytime ? ' · day' : ' · night') + '</td></tr>';
    }).join('');
  }
  function horaTable(d) {
    return '<div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>#</th><th ' + th + '>Lord</th><th ' + th + '>Time</th><th ' + th + '>Nature</th></tr></thead><tbody>' + horaRows(d, Date.now()) + '</tbody></table></div>';
  }
  function upcomingHoras(d, n) {
    var now = Date.now();
    return (d.all_horas || []).filter(function (h) { return Date.parse(h.end) > now; }).slice(0, n);
  }
  function timeline(list) {
    return '<div class="timeline">' + list.map(function (h) {
      return '<div class="timeline-item"><div class="timeline-ball"></div><strong>' + esc(h.lord) + '</strong><small>' + esc(span(h.start, h.end)) + '</small></div>';
    }).join('') + '</div>';
  }
  function kaal(label, k) { return k ? '<tr><td ' + td + '>' + esc(label) + '</td><td ' + td + '>' + esc(span(k.start, k.end)) + '</td><td ' + td + '>' + (k.active_now ? '<b>ACTIVE NOW</b>' : '') + '</td></tr>' : ''; }
  function updated(d) { return '<p class="card-subtitle">Calculated ' + esc(new Date(d.as_of).toLocaleString('en-IN')) + ' by the OCCULTVIISION engine for the location above.</p>'; }

  /* ---------- pages ---------- */

  var TOOLS = [
    ['✧', 'NOW', 'index.html', 'Live moment: best window, panchang, star time'],
    ['▦', 'Today', 'today.html', 'Today at a glance with daily guidance'],
    ['📊', 'Kundali', 'kundali.html', 'Birth chart from birth place, time and date'],
    ['📋', 'Panchang', 'panchang.html', 'Tithi, nakshatra, yoga, karana, vara, kaal'],
    ['◷', 'Hora & Uphora', 'hora-lagna.html', 'Planetary hours and sub-hours, lagna now'],
    ['⭐', 'Star Time', 'star-time.html', 'Planetary timeline for the day'],
    ['✦', 'Moment', 'moment.html', 'Best time for a purpose on a chosen day'],
    ['🗓', 'Muhurta Finder', 'muhurta.html', 'Auspicious windows by activity, with classical rules'],
    ['🔮', 'Astrological Query', 'query.html', 'KP + Parashari answer from your kundali'],
    ['♙', 'My Cosmos', 'my-cosmos.html', 'Lagna, dasha, nakshatra and tara of your chart']
  ];
  function toolsPanel() {
    return panel('🧭', 'ALL TOOLS', '<div class="card-grid">' + TOOLS.map(function (t) {
      return '<a class="card" href="' + t[2] + '" style="text-decoration:none;color:inherit"><div class="card-icon">' + t[0] + '</div><h3 class="card-title">' + esc(t[1]) + '</h3><p class="card-subtitle">' + esc(t[3]) + '</p></a>';
    }).join('') + '</div>');
  }

  var views = {
    now: function (d) {
      var best = d.active_hora && d.active_hora.quality && d.active_hora.quality.recommended_for_purpose ? d.active_hora : null;
      var bestLine = best ? 'Now · ' + best.lord + ' hora' : (d.next_good_hora ? d.next_good_hora.lord + ' hora' : '—');
      var bestTime = best ? span(best.start, best.end) : (d.next_good_hora ? span(d.next_good_hora.starts_at, d.next_good_hora.ends_at) : '');
      var ci = d.convergence_index || {};
      var hero = panel('✧', 'YOUR COSMIC MOMENT',
        '<div class="grid-two"><div><div style="font:700 clamp(48px,9vw,76px) \'Cormorant Garamond\';color:#ffe294;text-shadow:0 0 18px #ffcf5a44">NOW</div>' +
        '<p>' + esc(d.vara ? d.vara.name : '') + '</p>' + infoBox('Today', new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date()), tithiText(d) + ' · ' + nakText(d)) + '</div>' +
        '<div>' + infoBox('Best window', bestLine, bestTime) + infoBox('Moment score', (ci.convergence_score != null ? ci.convergence_score + '/100 · ' + (ci.convergence_rating || '') : '—'), d.score && d.score.verdict ? d.score.verdict : '') + '</div></div>', 'LIVE');
      var snap = panel('📋', 'PANCHANG SNAPSHOT', '<div class="module-list">' +
        card('☾', 'Tithi', tithiText(d), d.tithi ? d.tithi.type + (d.tithi.auspicious ? ' · auspicious' : ' · caution') : '') +
        card('⭐', 'Nakshatra', nakText(d), d.current_nakshatra && d.current_nakshatra.nature ? d.current_nakshatra.nature.nature : '') +
        card('☀', 'Yoga', yogaText(d), d.nitya_yoga ? d.nitya_yoga.quality : '') +
        card('🔄', 'Karana', d.karana ? d.karana.name : '—', d.karana && d.karana.isInauspicious ? 'inauspicious' : '') +
        card('📅', 'Vara', d.vara ? d.vara.name : '—', d.vara ? 'Lord: ' + d.vara.lord : '') + '</div>');
      var star = panel('◷', 'STAR TIME', timeline(upcomingHoras(d, 5)) + '<p class="card-subtitle"><a class="pill" href="star-time.html">FULL DAY ↗</a></p>');
      var warn = panel('⚠', 'RIGHT NOW',
        '<div class="module-list">' +
        card('◷', 'Hora', d.active_hora ? d.active_hora.lord : '—', d.active_hora ? d.active_hora.quality.nature + ' · till ' + T(d.active_hora.end) : '') +
        card('🌈', 'Choghadiya', d.choghadiya ? d.choghadiya.current.type : '—', d.choghadiya ? d.choghadiya.current.start_ist + '–' + d.choghadiya.current.end_ist + ' IST' : '') +
        card('⛔', 'Rahu Kaal', d.rahu_kaal && d.rahu_kaal.active_now ? 'ACTIVE NOW' : 'Not active', d.rahu_kaal ? span(d.rahu_kaal.start, d.rahu_kaal.end) : '') +
        card('✨', 'Abhijit', d.abhijit_muhurta && d.abhijit_muhurta.active_now ? 'ACTIVE NOW' : 'Not active', d.abhijit_muhurta ? span(d.abhijit_muhurta.start, d.abhijit_muhurta.end) : '') + '</div>' + updated(d));
      return hero + '<div class="grid-two">' + snap + star + '</div>' + warn + toolsPanel();
    },

    panchang: function (d) {
      var el = panel('📋', 'PANCHANG ELEMENTS', '<div class="card-grid">' +
        card('🌙', 'Tithi', tithiText(d), (d.tithi ? d.tithi.type + ' — ' + d.tithi.note : '')) +
        card('⭐', 'Nakshatra', nakText(d), d.current_nakshatra && d.current_nakshatra.nature ? d.current_nakshatra.nature.nature + ' nakshatra' : '') +
        card('☀️', 'Yoga', yogaText(d), d.nitya_yoga ? d.nitya_yoga.note : '') +
        card('🔄', 'Karana', d.karana ? d.karana.name : '—', d.karana ? d.karana.note : '') +
        card('📅', 'Vara', d.vara ? d.vara.name : '—', d.vara ? d.vara.note : '') + '</div>', '5 ELEMENTS');
      var mp = d.masa_paksha || {};
      var more = panel('🌅', 'DAY DETAILS', '<div class="module-list">' +
        card('🌅', 'Sunrise', T(d.sunrise)) + card('🌇', 'Sunset', T(d.sunset)) +
        card('☀', 'Sun sign', d.surya_rashi ? d.surya_rashi.name : '—') + card('☾', 'Moon sign', d.chandra_rashi ? d.chandra_rashi.name : '—') +
        card('📆', 'Masa · Paksha', (mp.masa || '—') + ' · ' + (mp.paksha || '—'), mp.note) + '</div>');
      var kaals = panel('⏳', 'AUSPICIOUS & INAUSPICIOUS TIMES', '<div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>Period</th><th ' + th + '>Time</th><th ' + th + '></th></tr></thead><tbody>' +
        kaal('Rahu Kaal', d.rahu_kaal) + kaal('Yamghanda', d.yamghanda_kaal) + kaal('Gulika', d.gulika_kaal) + kaal('Abhijit Muhurta', d.abhijit_muhurta) +
        '</tbody></table></div><p class="card-subtitle">' + esc(d.durmuhurta && d.durmuhurta.note) + '</p>' +
        '<p class="card-subtitle">' + esc(d.sarvartha_siddhi_yoga && d.sarvartha_siddhi_yoga.note) + '</p>' +
        '<p class="card-subtitle">' + esc(d.amrit_siddhi_yoga && d.amrit_siddhi_yoga.note) + '</p>' +
        '<p class="card-subtitle">' + esc(d.panchaka_dosha && d.panchaka_dosha.note) + '</p>' +
        '<p class="card-subtitle">' + esc(d.dishashool && d.dishashool.note) + '</p>');
      var ch = d.choghadiya ? panel('🌈', 'CHOGHADIYA', '<div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>Name</th><th ' + th + '>Planet</th><th ' + th + '>Time (IST)</th></tr></thead><tbody>' +
        (d.choghadiya.day_segments || []).map(function (s) { return '<tr><td ' + td + '>' + esc(s.type) + (s.is_auspicious ? ' ✓' : '') + '</td><td ' + td + '>' + esc(s.planet) + '</td><td ' + td + '>' + esc(s.start_ist + ' – ' + s.end_ist) + '</td></tr>'; }).join('') +
        '</tbody></table></div>') : '';
      return el + more + kaals + ch + updated(d);
    },

    hora: function (d) {
      var ah = d.active_hora, up = d.active_uphora, pp = d.pancha_pakshi || {}, nowMs = Date.now();
      var lagnaSign = d.muhurta_validation && d.muhurta_validation.stage5_sav ? SIGNS[d.muhurta_validation.stage5_sav.lagna_sign] : null;
      var CHRONO = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
      var purposeOpts = ['general', 'business', 'travel', 'marriage', 'finance', 'property', 'medical', 'education', 'legal', 'spiritual'].map(function (p) { return '<option value="' + p + '"' + (p === horaPurpose ? ' selected' : '') + '>' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>'; }).join('');
      var ctl = panel('🎯', 'HORA FOR YOUR PURPOSE', '<div class="form-group"><label for="h-purpose">Purpose</label><select id="h-purpose">' + purposeOpts + '</select></div>' +
        (d.next_good_hora ? '<p class="card-subtitle">Next hora good for <b>' + esc(horaPurpose) + '</b>: <b>' + esc(d.next_good_hora.lord) + '</b> · ' + esc(span(d.next_good_hora.starts_at, d.next_good_hora.ends_at)) + '</p>' : '<p class="card-subtitle">No good hora left in the current window for this purpose.</p>'));
      var cur = panel('◷', 'CURRENT HORA', infoBox('Planetary hour', ah ? ah.lord + ' hora' : '—', ah ? span(ah.start, ah.end) + ' · #' + ah.hora_number + (ah.is_daytime ? ' (day)' : ' (night)') : '') +
        (up ? infoBox('Current Uphora (sub-hour)', up.sub, span(up.start, up.end)) : '') +
        (d.next_hora ? '<p class="card-subtitle">Next hora: <b>' + esc(d.next_hora.lord) + '</b> at ' + esc(T(d.next_hora.starts_at)) + '</p>' : ''));
      var str = panel('⚖', 'HORA STRENGTH', infoBox('Nature for ' + horaPurpose, ah ? ah.quality.nature : '—', ah ? ah.quality.note : '') +
        '<p class="card-subtitle">' + (ah && ah.quality.recommended_for_purpose ? '✅ Recommended for this purpose.' : '⚠ Not specifically recommended for this purpose.') + '</p>');
      var lag = panel('🌅', 'LAGNA (NOW)', infoBox('Rising sign right now', lagnaSign || '—', d.muhurta_validation && d.muhurta_validation.stage4_lagna_shudhi ? d.muhurta_validation.stage4_lagna_shudhi.note : '') +
        '<p class="card-subtitle">Sky ascendant at this moment and place. For a birth ascendant use the Kundali page.</p>');
      // Full day: each hora expands into its 7 uphoras (same rule as the engine: sub-lords follow the Chaldean sequence from the hora lord)
      var rows = (d.all_horas || []).map(function (h, idx) {
        var hs = Date.parse(h.start), he = Date.parse(h.end), cur2 = nowMs >= hs && nowMs < he, dur = (he - hs) / 7, base = CHRONO.indexOf(h.lord), subs = '';
        for (var k = 0; k < 7; k++) {
          var a = hs + k * dur, b = hs + (k + 1) * dur, on = nowMs >= a && nowMs < b;
          subs += '<tr' + (on ? ' style="background:#ffd76a22;font-weight:700"' : '') + '><td ' + td + '>' + (k + 1) + '</td><td ' + td + '>' + esc(CHRONO[(base + k) % 7]) + (on ? ' ◀ now' : '') + '</td><td ' + td + '>' + esc(new Date(a).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase() + ' – ' + new Date(b).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()) + '</td></tr>';
        }
        return '<details' + (cur2 ? ' open' : '') + ' style="border-bottom:1px solid #ffffff1a;padding:6px 0"><summary style="cursor:pointer;font-size:13px;' + (cur2 ? 'font-weight:700;color:#ffd76a' : '') + '">' + h.hora_number + ' · ' + esc(h.lord) + ' · ' + esc(span(h.start, h.end)) + ' · ' + esc(h.nature) + (h.is_daytime ? ' · day' : ' · night') + (cur2 ? ' ◀ now' : '') + '</summary>' +
          '<table ' + tbl + '><thead><tr><th ' + th + '>Uphora</th><th ' + th + '>Sub-lord</th><th ' + th + '>Time</th></tr></thead><tbody>' + subs + '</tbody></table></details>';
      }).join('');
      var bird = panel('🕊', 'PANCHA PAKSHI', infoBox('Bird now', pp.bird || '—', pp.cycle_start ? 'Yama ' + pp.yama_number + ' · ' + span(pp.cycle_start, pp.cycle_end) : '') + '<p class="card-subtitle">' + esc(pp.note) + '</p>');
      return ctl + '<div class="grid-three">' + lag + cur + str + '</div>' + bird +
        panel('📋', 'HORA & UPHORA — FULL DAY', '<p class="card-subtitle">Tap an hora to see its 7 uphoras. Sunrise ' + esc(T(d.sunrise)) + ' · Sunset ' + esc(T(d.sunset)) + '.</p>' + rows) + updated(d);
    },

    today: function (d) {
      var v = d.vara || {}, t = d.tithi || {};
      var glance = panel('▦', 'TODAY AT A GLANCE', '<div class="grid-three">' +
        infoBox('Vara', v.name || '—', v.lord ? 'Lord: ' + v.lord : '') +
        infoBox('Nakshatra', nakText(d), d.current_nakshatra && d.current_nakshatra.nature ? d.current_nakshatra.nature.nature : '') +
        infoBox('Yoga', yogaText(d), d.nitya_yoga ? d.nitya_yoga.quality : '') + '</div>' +
        '<div class="grid-three">' + infoBox('Tithi', tithiText(d), t.type || '') + infoBox('Karana', d.karana ? d.karana.name : '—', d.karana && d.karana.isInauspicious ? 'inauspicious' : '') +
        infoBox('Sun · Moon sign', (d.surya_rashi ? d.surya_rashi.name : '—') + ' · ' + (d.chandra_rashi ? d.chandra_rashi.name : '—'), '') + '</div>',
        new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date()));
      var rk = d.rahu_kaal;
      var rah = panel('⛔', 'RAHU KAAL', infoBox('Status', rk && rk.active_now ? 'ACTIVE NOW — avoid new starts' : 'Not active now', rk ? span(rk.start, rk.end) : '') +
        infoBox('Yamghanda · Gulika', (d.yamghanda_kaal ? span(d.yamghanda_kaal.start, d.yamghanda_kaal.end) : '—') + ' · ' + (d.gulika_kaal ? span(d.gulika_kaal.start, d.gulika_kaal.end) : '—'), ''));
      var li = function (a) { return (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); };
      var guide = panel('🧭', 'DAILY GUIDANCE (FROM CLASSICAL RULES)',
        '<p class="card-subtitle"><b>' + esc(v.name || '') + '</b> — ' + esc(v.note || '') + '</p>' +
        (v.auspicious_for ? '<p class="card-subtitle"><b>Good for:</b></p><ul style="font-size:12px;line-height:1.6">' + li(v.auspicious_for) + '</ul>' : '') +
        (v.avoid ? '<p class="card-subtitle"><b>Avoid:</b></p><ul style="font-size:12px;line-height:1.6">' + li(v.avoid) + '</ul>' : '') +
        (t.note ? '<p class="card-subtitle"><b>Tithi:</b> ' + esc(t.note) + '</p>' : '') +
        (d.sarvartha_siddhi_yoga && d.sarvartha_siddhi_yoga.active ? '<p class="card-subtitle"><b>' + esc(d.sarvartha_siddhi_yoga.note) + '</b></p>' : '') +
        (d.abhijit_muhurta ? '<p class="card-subtitle">Abhijit Muhurta: ' + esc(span(d.abhijit_muhurta.start, d.abhijit_muhurta.end)) + '</p>' : '') +
        (d.dishashool ? '<p class="card-subtitle">' + esc(d.dishashool.note) + '</p>' : ''));
      return glance + '<div class="grid-two">' + rah + guide + '</div>' + updated(d);
    },

    star: function (d) {
      var ah = d.active_hora;
      return panel('◷', 'PLANETARY TIMELINE', timeline(upcomingHoras(d, 8)) + infoBox('Current planetary hour', ah ? ah.lord + ' · ' + span(ah.start, ah.end) : '—', ah ? ah.quality.note : '')) +
        panel('📋', 'FULL DAY (24 HORAS)', horaTable(d)) + updated(d);
    }
  };


  /* ---------- pages that need their own inputs ---------- */
  var NAKS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var YOGAS = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var GROUPS = [
    { id: 'vyapar', label: 'Business', icon: '💼', purpose: 'business' },
    { id: 'sampatti', label: 'Property', icon: '🏠', purpose: 'property' },
    { id: 'dhan', label: 'Money', icon: '💰', purpose: 'finance' },
    { id: 'career', label: 'Career', icon: '🎯', purpose: 'general' },
    { id: 'vivah', label: 'Marriage', icon: '💍', purpose: 'marriage' },
    { id: 'samjhauta', label: 'Agreements', icon: '📜', purpose: 'legal' },
    { id: 'chikitsa', label: 'Medical', icon: '⚕️', purpose: 'medical' },
    { id: 'education', label: 'Education', icon: '📚', purpose: 'education' },
    { id: 'travel', label: 'Travel', icon: '🧳', purpose: 'travel' },
    { id: 'spiritual', label: 'Spiritual', icon: '🕉', purpose: 'spiritual' }
  ];
  var CATS = 'sampatti-bhumi-kharid,sampatti-bhumi-puja,sampatti-griha-pravesh,sampatti-registry,sampatti-construction-start,sampatti-interior-work,sampatti-office-shop-start,sampatti-flat-booking,vyapar-dukan-khol,vyapar-naya-vyapar,vyapar-ecommerce-start,vyapar-partnership-start,vyapar-trade-agreement,vyapar-wholesale-start,vyapar-expansion,vyapar-franchise-license,dhan-sona-kharid,dhan-bank-account,dhan-loan-lena,dhan-loan-dana,dhan-stock-mutual,dhan-share-trading,dhan-insurance,dhan-cryptocurrency,dhan-property-tax,dhan-salary-negotiation,career-govt-job,career-interview,career-promotion,career-resignation,career-teaching-start,career-admin-start,career-tech-job,career-promotion-interview,career-relocation-for-job,career-freelance-start,vivah-engagement,vivah-mehendi,vivah-wedding-day,vivah-vivah-muhurta,vivah-reception,vivah-honeymoon-start,vivah-wedding-agreement,vivah-first-night,samjhauta-kundali-milan,samjhauta-partnership-deed,samjhauta-sale-deed,samjhauta-rental-agreement,samjhauta-employment-contract,samjhauta-loan-agreement,samjhauta-will-signing,samjhauta-power-of-attorney,samjhauta-insurance-policy,samjhauta-shareholders-pact,chikitsa-surgery,chikitsa-hospital-admission,chikitsa-medicine-start,chikitsa-doctor-appointment,chikitsa-chemotherapy,chikitsa-physiotherapy,chikitsa-vaccination,chikitsa-dental-work,chikitsa-ayurvedic-treatment'.split(',');
  var COMMERCIAL = 'company,website,contract,legal,money,property,movie,brand,product,press,political,ipo,partner,loan,social,vivah'.split(',');
  function pretty(slug) { return slug.split('-').slice(1).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' '); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  function opts(list, sel) { return list.map(function (o) { return '<option value="' + esc(o.v) + '"' + (o.v === sel ? ' selected' : '') + '>' + esc(o.t) + '</option>'; }).join(''); }
  function deg(x) { var d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return d + '°' + ('0' + m).slice(-2) + '′'; }
  function dstr(iso) { return iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function resultBox(id) { return '<div class="result-box" id="' + id + '" role="status"></div>'; }
  function say(id, t, err) { var m = $(id); if (!m) return; m.textContent = t || ''; m.classList.toggle('show', !!t); m.style.borderColor = err ? '#ff7b7b' : ''; }
  // one API call with the standard failure messages; resolves {ok,status,body} or null when login is needed
  function call(path, o) {
    return api(path, o).then(function (r) {
      if (r.status === 401) { store(TOKEN_KEY, null); loginPanel(); return null; }
      return r;
    });
  }
  function failText(r) {
    if (r.status === 402) return 'Your points balance is too low for this lookup. Recharge points or upgrade your plan.';
    if (r.status === 403 && r.body && r.body.error) return r.body.error;
    return (r.body && r.body.error) || 'Something went wrong. Please try again.';
  }
  function loadKundalis() { return call('/kundali').then(function (r) { return r && r.ok ? (r.body.kundalis || []) : (r ? [] : null); }); }
  function kundaliOpts(list, none) { return (none ? [{ v: '', t: none }] : []).concat(list.map(function (k) { return { v: String(k.id), t: (k.label || 'Kundali') + ' · ' + String(k.birth_date).slice(0, 10) }; })); }

  function windowsHtml(scan) {
    var rows = [];
    (scan.results || []).forEach(function (day) {
      (day.windows || []).forEach(function (w) { rows.push({ day: day.date, w: w }); });
    });
    rows.sort(function (a, b) { return b.w.score - a.w.score || Date.parse(a.w.timestamp) - Date.parse(b.w.timestamp); });
    if (!rows.length) return '<p class="card-subtitle">No suitable window found in this range. Try another date or activity.</p>';
    return '<div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>When</th><th ' + th + '>Score</th><th ' + th + '>Hora</th><th ' + th + '>Nakshatra</th><th ' + th + '>Notes</th></tr></thead><tbody>' +
      rows.map(function (x) {
        var w = x.w, flags = [];
        if (w.panchaka_active) flags.push('Panchaka'); if (w.ganda_moola) flags.push('Ganda Moola'); if (w.tara && w.tara.name) flags.push('Tara ' + w.tara.name); if (w.dishashool_direction) flags.push('Avoid travel ' + w.dishashool_direction);
        return '<tr><td ' + td + '>' + esc(new Date(w.timestamp).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })) + '</td><td ' + td + '><b>' + esc(w.score) + '</b></td><td ' + td + '>' + esc(w.hora_lord) + '</td><td ' + td + '>' + esc(w.nakshatra) + '</td><td ' + td + '>' + esc(flags.join(' · ')) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function scanQuery(p, purpose, from, to, topN, kid) {
    return '/muhurta/scan?lat=' + encodeURIComponent(p.lat) + '&lon=' + encodeURIComponent(p.lon) + '&purpose=' + encodeURIComponent(purpose) +
      '&from=' + encodeURIComponent(from.toISOString()) + '&to=' + encodeURIComponent(to.toISOString()) + '&top_n=' + topN + (kid ? '&kundali_id=' + encodeURIComponent(kid) : '');
  }
  function fromDate(val) {
    var now = new Date(); if (!val || val === ymd(now)) return now;
    var p = val.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 0, 0, 0);
  }

  var custom = {};

  custom.moment = function () {
    var pl = getPlace();
    if (!pl) { body.innerHTML = msgPanel('SET YOUR LOCATION', '<p class="card-subtitle">Press "Use my GPS location" or type a city above.</p>'); return; }
    if (!load(TOKEN_KEY)) { loginPanel(); return; }
    var purposes = GROUPS.map(function (g) { return { v: g.purpose + '|' + g.id, t: g.label }; }).filter(function (o, i, a) { return a.findIndex(function (x) { return x.v.split('|')[0] === o.v.split('|')[0]; }) === i; });
    var today = ymd(new Date()), min = ymd(new Date(Date.now() - 30 * 864e5)), max = ymd(new Date(Date.now() + 364 * 864e5));
    body.innerHTML = panel('✦', 'ALIGN YOUR MOMENT',
      '<div class="form-group"><label for="m-purpose">Purpose *</label><select id="m-purpose">' + opts([{ v: 'general', t: 'General' }].concat(purposes.map(function (o) { return { v: o.v.split('|')[0], t: o.t }; }).filter(function (o) { return o.v !== 'general'; }))) + '</select></div>' +
      '<div class="form-group"><label for="m-date">Date *</label><input type="date" id="m-date" value="' + today + '" min="' + min + '" max="' + max + '"></div>' +
      '<div class="form-group"><label for="m-kid">Personalise for a saved kundali</label><select id="m-kid"><option value="">None (general)</option></select></div>' +
      '<button type="button" class="submit-btn" id="m-go">FIND BEST TIME</button>' + resultBox('m-msg')) +
      '<div id="m-out"></div>';
    loadKundalis().then(function (l) { if (l && l.length) $('m-kid').innerHTML = opts(kundaliOpts(l, 'None (general)')); });
    $('m-go').addEventListener('click', function () {
      var purpose = $('m-purpose').value, from = fromDate($('m-date').value), to = new Date(from.getTime() + 864e5);
      say('m-msg', 'Scanning ' + from.toLocaleDateString('en-IN') + ' for ' + purpose + ' …');
      call(scanQuery(pl, purpose, from, to, 8, $('m-kid').value)).then(function (r) {
        if (!r) return; if (!r.ok) { say('m-msg', failText(r), true); return; }
        say('m-msg', '');
        var best = null; (r.body.results || []).forEach(function (d) { (d.windows || []).forEach(function (w) { if (!best || w.score > best.score) best = w; }); });
        var kpi = best ? '<div class="kpi-row"><div class="kpi"><small>Time window</small><strong>' + esc(new Date(best.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })) + '</strong><span>' + esc(best.hora_lord) + ' hora</span></div><div class="kpi"><small>Score</small><strong>' + esc(best.score) + '</strong><span>out of 100</span></div><div class="kpi"><small>Purpose</small><strong>' + esc(cap(purpose)) + '</strong><span>' + esc(best.nakshatra) + '</span></div></div>' : '';
        $('m-out').innerHTML = panel('📊', 'ALIGNMENT RESULT', kpi + windowsHtml(r.body) + '<p class="card-subtitle">' + esc(pl.label) + ' · ' + esc(r.body.samples_evaluated) + ' moments evaluated.</p>');
      });
    });
  };

  custom.muhurta = function () {
    var pl = getPlace();
    if (!pl) { body.innerHTML = msgPanel('SET YOUR LOCATION', '<p class="card-subtitle">Press "Use my GPS location" or type a city above.</p>'); return; }
    if (!load(TOKEN_KEY)) { loginPanel(); return; }
    var cards = GROUPS.map(function (g) { return '<div class="card" role="button" tabindex="0" data-g="' + g.id + '" aria-pressed="false"><div class="card-icon">' + g.icon + '</div><h3 class="card-title">' + esc(g.label) + '</h3></div>'; }).join('');
    body.innerHTML = panel('🗓', 'CHOOSE YOUR ACTIVITY', '<div class="card-grid" id="g-cards">' + cards + '</div>') +
      panel('🔎', 'SEARCH CONTEXT',
        '<div class="form-group"><label for="u-cat">Specific activity</label><select id="u-cat"><option value="">Choose a group above</option></select></div>' +
        '<div class="form-row"><div class="form-group"><label for="u-date">Search from (optional)</label><input type="date" id="u-date" min="' + ymd(new Date(Date.now() - 30 * 864e5)) + '" max="' + ymd(new Date(Date.now() + 364 * 864e5)) + '"></div>' +
        '<div class="form-group"><label for="u-days">Days to scan</label><select id="u-days"><option value="7">7 days</option><option value="14" selected>14 days</option><option value="30">30 days</option></select></div></div>' +
        '<div class="form-group"><label for="u-kid">Personalise for a saved kundali</label><select id="u-kid"><option value="">None (general)</option></select></div>' +
        '<button type="button" class="submit-btn" id="u-go">FIND MUHURTA</button>' + resultBox('u-msg')) +
      '<div id="u-out"></div>' +
      panel('📖', 'BUSINESS & LEGAL RULES (MUHURTA CHINTAMANI)',
        '<div class="form-group"><label for="c-act">Activity</label><select id="c-act">' + opts(COMMERCIAL.map(function (c) { return { v: c, t: cap(c) }; })) + '</select></div><button type="button" class="submit-btn" id="c-go">SHOW CLASSICAL RULES</button>' + resultBox('c-msg') + '<div id="c-out"></div>');
    var group = null;
    function pick(id) {
      group = GROUPS.filter(function (g) { return g.id === id; })[0];
      Array.prototype.forEach.call(document.querySelectorAll('#g-cards .card'), function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-g') === id)); c.style.outline = c.getAttribute('data-g') === id ? '2px solid #ffd76a' : ''; });
      var list = CATS.filter(function (c) { return c.split('-')[0] === id; });
      $('u-cat').innerHTML = list.length ? opts([{ v: '', t: 'Any ' + group.label.toLowerCase() + ' activity' }].concat(list.map(function (c) { return { v: c, t: pretty(c) }; }))) : '<option value="">General ' + esc(group.label.toLowerCase()) + ' muhurta</option>';
    }
    $('g-cards').addEventListener('click', function (e) { var c = e.target.closest('[data-g]'); if (c) pick(c.getAttribute('data-g')); });
    $('g-cards').addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('data-g')) { e.preventDefault(); pick(e.target.getAttribute('data-g')); } });
    loadKundalis().then(function (l) { if (l && l.length) $('u-kid').innerHTML = opts(kundaliOpts(l, 'None (general)')); });
    $('u-go').addEventListener('click', function () {
      if (!group) { say('u-msg', 'Choose an activity group first.', true); return; }
      var from = fromDate($('u-date').value), to = new Date(from.getTime() + Number($('u-days').value) * 864e5), cat = $('u-cat').value, kid = $('u-kid').value;
      say('u-msg', 'Searching the best times …');
      var calls = [call(scanQuery(pl, group.purpose, from, to, 10, kid))];
      if (cat) calls.push(call('/muhurta/professional?lat=' + encodeURIComponent(pl.lat) + '&lon=' + encodeURIComponent(pl.lon) + '&category=' + encodeURIComponent(cat) + (kid ? '&kundali_id=' + encodeURIComponent(kid) : '')));
      Promise.all(calls).then(function (rs) {
        if (!rs[0]) return; if (!rs[0].ok) { say('u-msg', failText(rs[0]), true); return; }
        say('u-msg', '');
        var html = '';
        if (rs[1] && rs[1].ok) {
          var sc = rs[1].body.scoring || {};
          html += panel('⚡', 'RIGHT NOW · ' + (rs[1].body.category_name || pretty(cat)).toUpperCase(),
            '<div class="kpi-row"><div class="kpi"><small>Score now</small><strong>' + esc(sc.final_score) + '</strong><span>' + esc(sc.verdict) + '</span></div></div><p class="card-subtitle">' + esc(sc.recommendation) + '</p>');
        } else if (rs[1]) { html += msgPanel('RIGHT-NOW SCORE', '<p class="card-subtitle">' + esc(failText(rs[1])) + '</p>'); }
        html += panel('🌟', 'BEST WINDOWS · ' + group.label.toUpperCase(), windowsHtml(rs[0].body) + '<p class="card-subtitle">' + esc(pl.label) + ' · scan ' + esc(dstr(rs[0].body.scan_range.from)) + ' to ' + esc(dstr(rs[0].body.scan_range.to)) + '.</p>');
        $('u-out').innerHTML = html;
        $('u-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    $('c-go').addEventListener('click', function () {
      say('c-msg', 'Loading rules …');
      call('/muhurta/commercial?activity=' + encodeURIComponent($('c-act').value)).then(function (r) {
        if (!r) return; if (!r.ok) { say('c-msg', failText(r), true); return; }
        say('c-msg', ''); var b = r.body, ru = b.rules || {};
        var names = function (a, arr, off) { return (a || []).map(function (i) { return arr[i + (off || 0)] || i; }).join(', ') || '—'; };
        var row = function (k, v) { return '<tr><td ' + td + '><b>' + esc(k) + '</b></td><td ' + td + '>' + esc(v) + '</td></tr>'; };
        var hb = ru.hardBlocks ? Object.keys(ru.hardBlocks).filter(function (k) { return ru.hardBlocks[k] === true; }).join(', ') : '';
        $('c-out').innerHTML = '<p class="card-subtitle"><b>' + esc(b.activity.name) + '</b> — ' + esc(b.activity.description) + '</p><div style="overflow-x:auto"><table ' + tbl + '><tbody>' +
          row('Preferred tithis', (ru.preferredTithis || []).join(', ')) + row('Avoid tithis', (ru.forbiddenTithis || []).join(', ')) +
          row('Preferred days', names(ru.preferredVaras, VARAS)) + row('Avoid days', names(ru.forbiddenVaras, VARAS)) +
          row('Best nakshatras', names(ru.bestNakshatras, NAKS)) + row('Avoid nakshatras', names(ru.forbiddenNakshatras, NAKS)) +
          row('Preferred yoga numbers (1 = Vishkambha … 27 = Vaidhriti)', (ru.preferredYogas || []).join(', ')) + row('Avoid yoga numbers', (ru.forbiddenYogas || []).join(', ')) +
          row('Preferred hora', (ru.preferredHoraLords || []).join(', ')) + row('Strong Chandrabala needed', ru.requireStrongChandrabala ? 'Yes' : 'No') + row('Hard blocks', hb) +
          '</tbody></table></div><ol style="font-size:12px;line-height:1.6">' + (b.recommendations || []).map(function (x) { return '<li>' + esc(x.replace(/^\d+\.\s*/, '')) + '</li>'; }).join('') + '</ol>' +
          (b.source ? '<p class="card-subtitle">Source: ' + esc(b.source.verse) + ' — ' + esc(b.source.text) + '</p>' : '');
      });
    });
  };

  custom.query = function () {
    if (!load(TOKEN_KEY)) { loginPanel(); return; }
    loading('Loading your kundalis and activities …');
    Promise.all([loadKundalis(), call('/kp/activities')]).then(function (rs) {
      var ks = rs[0], ac = rs[1];
      if (ks === null || !ac) return;
      if (!ks.length) { body.innerHTML = msgPanel('CREATE A KUNDALI FIRST', '<p class="card-subtitle">Astrological queries are answered from your birth chart.</p><a class="submit-btn" href="kundali.html" style="display:block;text-align:center">OPEN KUNDALI</a>'); return; }
      if (!ac.ok) { body.innerHTML = msgPanel('COULD NOT LOAD', '<p class="card-subtitle">' + esc(failText(ac)) + '</p>'); return; }
      var cats = ac.body.categories || [];
      body.innerHTML = panel('🔮', 'ASTROLOGICAL QUERY (KP)',
        '<div class="form-group"><label for="q-k">Kundali *</label><select id="q-k">' + opts(kundaliOpts(ks)) + '</select></div>' +
        '<div class="form-group"><label for="q-c">Category *</label><select id="q-c">' + opts(cats.map(function (c, i) { return { v: String(i), t: c.category }; })) + '</select></div>' +
        '<div class="form-group"><label for="q-a">Your question *</label><select id="q-a"></select></div>' +
        '<button type="button" class="submit-btn" id="q-go">🔮 GET ANALYSIS</button>' + resultBox('q-msg')) + '<div id="q-out"></div>';
      function fillAct() { var c = cats[Number($('q-c').value)]; $('q-a').innerHTML = opts((c ? c.activities : []).map(function (a) { return { v: a.slug, t: a.label }; })); }
      $('q-c').addEventListener('change', fillAct); fillAct();
      $('q-go').addEventListener('click', function () {
        say('q-msg', 'Analysing the chart …');
        call('/kp/query', { method: 'POST', body: { kundali_id: Number($('q-k').value), activity_slug: $('q-a').value } }).then(function (r) {
          if (!r) return; if (!r.ok) { say('q-msg', failText(r), true); return; }
          say('q-msg', ''); var b = r.body, par = (b.parashari && b.parashari.houseAnalysis) || [], dc = b.dashaChecks || [];
          var cardsH = (b.houseVerdicts || []).map(function (h, i) {
            var chain = h.cuspChain || {}, sg = h.subLordSignificance || {}, d = dc[i], p = par[i] || {};
            return '<div class="card"><h3 class="card-title">House ' + esc(h.house) + ' — ' + esc(String(h.verdict).toUpperCase()) + '</h3><p class="card-subtitle">' +
              'Cusp sub-lord: <b>' + esc(h.cuspSubLord) + '</b> (star lord ' + esc(chain.starLord) + ', ' + esc(chain.nakshatraName) + ')<br>' +
              'Signifies houses: ' + esc((sg.allSignifiedHouses || []).join(', ')) + '<br>' +
              'Favourable ' + esc(h.favorableCount) + ' · Unfavourable ' + esc(h.unfavorableCount) + (h.navtara ? '<br>Navtara: ' + esc(h.navtara.name) + ' (' + esc(h.navtara.beneficence) + ')' : '') +
              (d ? '<br>Dasha ' + esc(d.mahaLord) + '–' + esc(d.antarLord) + ': <b>' + esc(d.support) + '</b> support' : '') +
              (p.parasharivVerdict ? '<br>Parashari: ' + esc(p.parasharivVerdict) + ' (house lord ' + esc(p.houseLord) + ', ' + esc(p.houseLordDignity) + ')' : '') + '</p></div>';
          }).join('');
          $('q-out').innerHTML = panel('📋', 'ANALYSIS', '<div class="card-grid">' + cardsH + '</div>' +
            '<p class="card-subtitle">KP says whether the matter is promised for each house; Parashari adds the strength. No single combined yes/no is given — read each house.</p>' +
            (b._multi_house_warning ? '<p class="card-subtitle">' + esc(b._multi_house_warning) + '</p>' : '') +
            (b.ayanamsaCaveat ? '<p class="card-subtitle">' + esc(b.ayanamsaCaveat) + '</p>' : ''));
          $('q-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    });
  };

  custom.cosmos = function () {
    if (!load(TOKEN_KEY)) { loginPanel(); return; }
    loading('Loading your cosmic blueprint …');
    loadKundalis().then(function (ks) {
      if (ks === null) return;
      if (!ks.length) { body.innerHTML = panel('♙', 'PERSONAL BLUEPRINT', '<p class="card-subtitle">No birth details saved yet.</p><a href="kundali.html" class="submit-btn" style="display:block;text-align:center">REGISTER BIRTH DETAILS</a>', 'BIRTH DETAILS REQUIRED'); return; }
      function show(id) {
        $('cs-out').innerHTML = '<p class="card-subtitle">Calculating …</p>';
        call('/kundali/' + id + '/chart').then(function (r) {
          if (!r) return; if (!r.ok) { $('cs-out').innerHTML = '<p class="card-subtitle">' + esc(failText(r)) + '</p>'; return; }
          var c = r.body.chart, k = r.body.kundali, moon = c.planets.filter(function (p) { return p.planet === 'Moon'; })[0] || {};
          $('cs-out').innerHTML = '<div class="grid-two">' +
            infoBox('Lagna Gate', c.ascendant.rashiName + ' ' + deg(c.ascendant.degInRashi), c.ascendant.nakName ? c.ascendant.nakName + ' ' + (c.ascendant.nakPada || '') : '') +
            infoBox('Dasha Summary', c.dasha.maha.lord + ' – ' + c.dasha.antar.lord, 'Antar until ' + dstr(c.dasha.antar.end) + ' · Maha until ' + dstr(c.dasha.maha.end)) +
            infoBox('Moon · Janma Nakshatra', (moon.rashiName || '—') + ' · ' + c.janmaNakshatra.name + ' pada ' + c.janmaNakshatra.pada, '') +
            infoBox('Tara today', c.tara ? c.tara.number + ' · ' + c.tara.name + ' (' + c.tara.beneficence + ')' : '—', '') + '</div>' +
            '<p class="card-subtitle">Born ' + esc(k.birth_date) + ' · ' + esc(k.latitude) + ', ' + esc(k.longitude) + ' · ' + esc(k.timezone) + ' · ' + esc(c.ayanamsa) + ' ayanamsha</p>' +
            '<a href="kundali.html" class="submit-btn" style="display:block;text-align:center">OPEN FULL CHART</a>';
        });
      }
      body.innerHTML = panel('♙', 'PERSONAL BLUEPRINT', '<div class="form-group"><label for="cs-k">Kundali</label><select id="cs-k">' + opts(kundaliOpts(ks)) + '</select></div><div id="cs-out"></div>', 'FROM YOUR BIRTH CHART');
      $('cs-k').addEventListener('change', function () { show($('cs-k').value); });
      show($('cs-k').value);
    });
  };

  function run(force) {
    if (custom[PAGE]) { custom[PAGE](); return; }
    fetchNow(force).then(function (d) {
      if (!d) return;
      body.innerHTML = views[PAGE](d);
      var hp = $('h-purpose'); if (hp) hp.addEventListener('change', function () { horaPurpose = hp.value; run(true); });
    });
  }

  var NEEDS_PLACE = PAGE !== 'query' && PAGE !== 'cosmos';
  if (NEEDS_PLACE) drawPlace();
  var p0 = getPlace();
  function bootMsg(t) { var m = $('tn-place-msg'); if (m) { m.textContent = t; m.classList.toggle('show', !!t); } }
  if (NEEDS_PLACE) {
    // GPS is the default on every visit; a city the user typed by hand is respected (press USE MY GPS to switch back).
    var useGps = !p0 || !p0.manual;
    if (p0) run();            // show data for the last known place immediately
    if (useGps) { gpsFix(bootMsg, { maxAge: 120000 }).then(function (ok) { if (!ok && !p0) run(); }); }
    else if (!p0) { run(); }
  } else { run(); }
})();
