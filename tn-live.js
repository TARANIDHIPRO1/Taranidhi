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
  function drawPlace() {
    var p = getPlace();
    placeBox.innerHTML = '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">📍</span><h2>YOUR LOCATION</h2></div><button type="button" class="pill" id="tn-refresh" style="cursor:pointer">REFRESH ↻</button></div>' +
      '<p class="card-subtitle" id="tn-place-label">' + (p ? esc(p.label) + ' · ' + p.lat.toFixed(4) + ', ' + p.lon.toFixed(4) : 'Location not set. Use GPS or type a city.') + '</p>' +
      '<div class="form-row"><div class="form-group"><label for="tn-city">City</label><input id="tn-city" placeholder="e.g. Bhopal, India"></div></div>' +
      '<button type="button" class="submit-btn" id="tn-setcity" style="margin-bottom:10px">SET CITY</button>' +
      '<button type="button" class="submit-btn" id="tn-gps" style="background:linear-gradient(140deg,rgba(67,240,162,.8),rgba(43,240,162,.6));margin-bottom:6px">📍 USE MY GPS LOCATION</button>' +
      '<div class="result-box" id="tn-place-msg"></div></section>';
    function say(t) { var m = $('tn-place-msg'); m.textContent = t; m.classList.toggle('show', !!t); }
    $('tn-setcity').addEventListener('click', function () {
      var q = $('tn-city').value.trim(); if (!q) { say('Type a city name.'); return; }
      say('Finding ' + q + ' …');
      geocode(q).then(function (pl) { if (!pl) { say('Could not find "' + q + '".'); return; } setPlace(pl); drawPlace(); run(); });
    });
    $('tn-gps').addEventListener('click', function () {
      if (!navigator.geolocation) { say('GPS is not supported here. Type a city instead.'); return; }
      say('Getting GPS …');
      navigator.geolocation.getCurrentPosition(function (pos) {
        setPlace({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'My GPS location' }); drawPlace(); run();
      }, function () { say('GPS permission was not given. Type a city instead.'); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
    });
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
  function fetchNow(force) {
    var p = getPlace();
    if (!p) { body.innerHTML = msgPanel('SET YOUR LOCATION', '<p class="card-subtitle">Press "Use my GPS location" or type a city above.</p>'); return Promise.resolve(null); }
    if (!load(TOKEN_KEY)) { loginPanel(); return Promise.resolve(null); }
    if (!force && cache && cache.key === p.lat + ',' + p.lon && Date.now() - cache.at < 30000) return Promise.resolve(cache.data);
    loading('Calculating the live sky for ' + p.label + ' …');
    return api('/muhurta/now?lat=' + encodeURIComponent(p.lat) + '&lon=' + encodeURIComponent(p.lon)).then(function (r) {
      if (r.status === 401) { store(TOKEN_KEY, null); loginPanel(); return null; }
      if (r.status === 402) { body.innerHTML = msgPanel('POINTS NEEDED', '<p class="card-subtitle">Your points balance is 0, so a live lookup cannot run. Recharge points or upgrade your plan, then press REFRESH.</p>'); return null; }
      if (!r.ok) { body.innerHTML = msgPanel('COULD NOT LOAD', '<p class="card-subtitle">' + esc(r.body.error || 'Server error') + ' Press REFRESH to try again.</p>'); return null; }
      cache = { key: p.lat + ',' + p.lon, at: Date.now(), data: r.body };
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
      return hero + '<div class="grid-two">' + snap + star + '</div>' + warn;
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
      var ah = d.active_hora, up = d.active_uphora, pp = d.pancha_pakshi || {};
      var lagnaSign = d.muhurta_validation && d.muhurta_validation.stage5_sav ? SIGNS[d.muhurta_validation.stage5_sav.lagna_sign] : null;
      var lag = panel('🌅', 'LAGNA (NOW)', infoBox('Rising sign right now', lagnaSign || '—', d.muhurta_validation && d.muhurta_validation.stage4_lagna_shudhi ? d.muhurta_validation.stage4_lagna_shudhi.note : '') +
        '<p class="card-subtitle">This is the sky\'s ascendant at this moment and place. For a birth ascendant, open the Kundali page.</p>');
      var cur = panel('◷', 'CURRENT HORA', infoBox('Planetary hour', ah ? ah.lord + ' hora' : '—', ah ? span(ah.start, ah.end) : '') +
        (up ? infoBox('Uphora (sub-hour)', up.sub, span(up.start, up.end)) : '') +
        (d.next_hora ? '<p class="card-subtitle">Next: ' + esc(d.next_hora.lord) + ' at ' + esc(T(d.next_hora.starts_at)) + '</p>' : ''));
      var str = panel('⚖', 'HORA STRENGTH', infoBox('Nature', ah ? ah.quality.nature : '—', ah ? ah.quality.note : '') +
        (d.next_good_hora ? '<p class="card-subtitle">Next good hora: <b>' + esc(d.next_good_hora.lord) + '</b> ' + esc(span(d.next_good_hora.starts_at, d.next_good_hora.ends_at)) + '</p>' : ''));
      var bird = panel('🕊', 'PANCHA PAKSHI', infoBox('Bird now', pp.bird || '—', pp.cycle_start ? 'Yama ' + pp.yama_number + ' · ' + span(pp.cycle_start, pp.cycle_end) : '') + '<p class="card-subtitle">' + esc(pp.note) + '</p>');
      return '<div class="grid-three">' + lag + cur + str + '</div>' + bird +
        panel('📋', 'ALL HORAS TODAY', horaTable(d) + '<p class="card-subtitle">Sunrise ' + esc(T(d.sunrise)) + ' · Sunset ' + esc(T(d.sunset)) + '</p>') + updated(d);
    },

    star: function (d) {
      var ah = d.active_hora;
      return panel('◷', 'PLANETARY TIMELINE', timeline(upcomingHoras(d, 8)) + infoBox('Current planetary hour', ah ? ah.lord + ' · ' + span(ah.start, ah.end) : '—', ah ? ah.quality.note : '')) +
        panel('📋', 'FULL DAY (24 HORAS)', horaTable(d)) + updated(d);
    }
  };

  function run(force) {
    fetchNow(force).then(function (d) { if (d) body.innerHTML = views[PAGE](d); });
  }

  drawPlace();
  var p0 = getPlace();
  if (!p0 && navigator.geolocation) {
    // first visit: ask GPS once (viewer's own location is the right basis for Panchang/Hora)
    navigator.geolocation.getCurrentPosition(function (pos) { setPlace({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'My GPS location' }); drawPlace(); run(); }, function () { run(); }, { timeout: 12000, maximumAge: 600000 });
  } else { run(); }
})();
