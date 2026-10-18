/* TaraNidhi — Kundali page: connects the form to the live OCCULTVIISION API.
   Flow: mobile OTP login -> POST /kundali -> GET /kundali/{id}/chart -> render.
   No chart value is computed or invented here; everything shown comes from the API. */
(function () {
  'use strict';
  var API = 'https://occultviision-api.occultviision.workers.dev';
  var TOKEN_KEY = 'tn_session_token', PHONE_KEY = 'tn_session_phone';
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
  // South Indian layout: sign index per grid cell (null = centre)
  var GRID = [11, 0, 1, 2, 10, null, null, 3, 9, null, null, 4, 8, 7, 6, 5];

  var form = document.getElementById('kundali-form');
  var app = document.getElementById('kundali-app');
  if (!form || !app) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function f(name) { return form.elements[name]; }
  function val(name) { var el = f(name); return el ? String(el.value || '').trim() : ''; }

  function status(msg, kind) {
    var box = form.querySelector('.result-box');
    if (!box) return;
    box.textContent = msg || '';
    box.classList.toggle('show', !!msg);
    box.style.borderColor = kind === 'error' ? '#ff7b7b' : '';
    box.setAttribute('role', 'status');
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var t = load(TOKEN_KEY);
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(API + path, { method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); })
      .catch(function () { return { ok: false, status: 0, body: { error: 'Could not reach the server. Check your internet connection and try again.' } }; });
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

  /* ---------- place + timezone (Open-Meteo, free, no key) ---------- */
  function geocodeOnce(q, state, country) {
    var url = 'https://geocoding-api.open-meteo.com/v1/search?count=10&language=en&format=json&name=' + encodeURIComponent(q);
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var list = j.results || [];
      if (!list.length) return null;
      function n(a) { return String(a || '').toLowerCase().replace(/[^a-z]/g, ''); }
      function m(a, b) { return n(a) && n(b) && n(a).indexOf(n(b)) !== -1; }
      var inCountry = list.filter(function (x) { return !country || m(x.country, country) || m(x.country_code, country); });
      var best = inCountry.filter(function (x) { return !state || m(x.admin1, state) || m(x.admin2, state); })[0] || inCountry[0] || list[0];
      return { lat: best.latitude, lon: best.longitude, tz: best.timezone, label: [best.name, best.admin1, best.country].filter(Boolean).join(', ') };
    });
  }
  function geocode(city, state, country) {
    return geocodeOnce(city, state, country).catch(function () { return null; }).then(function (r) {
      return r || geocodeOnce(String(city).split(',')[0].trim(), '', country).catch(function () { return null; });
    });
  }
  function tzForCoords(lat, lon) {
    return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&timezone=auto&forecast_days=1&current=temperature_2m')
      .then(function (r) { return r.json(); }).then(function (j) { return j.timezone || null; });
  }
  // UTC offset (in minutes) of an IANA zone for a local wall-clock time
  function offsetMinutes(tz, y, mo, d, h, mi) {
    var guess = Date.UTC(y, mo - 1, d, h, mi);
    function localAsUtc(ts) {
      var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(new Date(ts)).forEach(function (x) { p[x.type] = +x.value; });
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    }
    var off = localAsUtc(guess) - guess;
    off = localAsUtc(guess - off) - (guess - off);
    return Math.round(off / 60000);
  }
  function isoWithOffset(date, time, tz) {
    var d = date.split('-').map(Number), t = time.split(':').map(Number);
    var off = offsetMinutes(tz, d[0], d[1], d[2], t[0], t[1] || 0);
    var sign = off < 0 ? '-' : '+', a = Math.abs(off);
    function p(n) { return ('0' + n).slice(-2); }
    return date + 'T' + p(t[0]) + ':' + p(t[1] || 0) + ':00' + sign + p(Math.floor(a / 60)) + ':' + p(a % 60);
  }

  /* ---------- login ---------- */
  function normPhone(s) { return String(s || '').replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, ''); }
  function validPhone(s) { return /^[6-9]\d{9}$/.test(normPhone(s)); }

  function ensureLogin(phone) {
    if (load(TOKEN_KEY)) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var p = normPhone(phone);
      status('Sending OTP to +91 ' + p + ' …');
      api('/auth/request-otp', { method: 'POST', body: { phone_number: p } }).then(function (r) {
        if (!r.ok) { status(r.body.error || 'OTP could not be sent.', 'error'); return resolve(false); }
        status('');
        var hint = r.body.dev_bypass_active ? '<p class="card-subtitle">Test mode is on: the OTP is <b>' + esc(r.body.dev_bypass_code) + '</b>.</p>' : '<p class="card-subtitle">Enter the 6-digit OTP sent to +91 ' + esc(p) + '.</p>';
        app.innerHTML = '<section class="panel" id="otp-panel"><div class="panel-title"><div class="title-left"><span class="round-icon">🔐</span><h2>VERIFY MOBILE</h2></div></div>' + hint +
          '<div class="form-group"><label for="otp-code">OTP *</label><input id="otp-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code"></div>' +
          '<button type="button" class="submit-btn" id="otp-go">VERIFY &amp; CONTINUE</button><div class="result-box" id="otp-msg"></div></section>';
        var msg = document.getElementById('otp-msg'), go = document.getElementById('otp-go'), inp = document.getElementById('otp-code');
        inp.focus();
        function say(t) { msg.textContent = t; msg.classList.add('show'); }
        go.addEventListener('click', function () {
          var code = inp.value.trim();
          if (!/^\d{6}$/.test(code)) { say('Please enter the 6-digit code.'); return; }
          go.disabled = true; say('Verifying …');
          fingerprint().then(function (fp) { return api('/auth/verify-otp', { method: 'POST', body: { phone_number: p, code: code, fingerprint_hash: fp } }); }).then(function (v) {
            go.disabled = false;
            if (!v.ok) { say(v.body.error || 'Verification failed.'); return; }
            store(TOKEN_KEY, v.body.session_token); store(PHONE_KEY, p);
            app.innerHTML = ''; resolve(true);
          });
        });
      });
    });
  }

  /* ---------- chart rendering ---------- */
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return iso; } }
  function deg(x) { var d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return d + '°' + ('0' + m).slice(-2) + '′'; }

  function southChart(chart) {
    var bySign = {}; for (var i = 0; i < 12; i++) bySign[i] = [];
    bySign[chart.ascendant.rashi].push('<b>Asc</b>');
    chart.planets.forEach(function (p) { bySign[p.rashi].push(esc(ABBR[p.planet] || p.planet)); });
    var cells = GRID.map(function (s) {
      if (s === null) return '<div style="border:0"></div>';
      return '<div style="border:1px solid var(--tn-border,#b89b55);min-height:64px;padding:4px;font-size:11px;line-height:1.35"><div style="opacity:.7;font-size:9px">' + SIGNS[s].slice(0, 3) + '</div>' + bySign[s].join(' ') + '</div>';
    }).join('');
    return '<div role="img" aria-label="South Indian style birth chart" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;max-width:420px;margin:8px auto">' + cells + '</div>';
  }

  function renderChart(data) {
    var k = data.kundali, c = data.chart, moon = c.planets.filter(function (p) { return p.planet === 'Moon'; })[0];
    var rows = c.planets.map(function (p) {
      return '<tr><td>' + esc(p.planet) + '</td><td>' + esc(p.rashiName) + ' ' + deg(p.degInRashi) + '</td><td>' + esc(p.nakName) + ' ' + esc(p.nakPada) + '</td><td>' + esc(p.house) + '</td><td>' + esc((p.kp || {}).subLord || '') + '</td></tr>';
    }).join('');
    var cusps = (c.cusps || []).map(function (x) { return '<tr><td>' + esc(x.house) + '</td><td>' + esc(x.rashiName) + ' ' + deg(x.degInRashi) + '</td><td>' + esc(x.nakName) + ' ' + esc(x.nakPada) + '</td><td>' + esc((x.kp || {}).subLord || '') + '</td></tr>'; }).join('');
    var th = 'style="text-align:left;padding:5px 6px;border-bottom:1px solid var(--tn-border,#b89b55)"';
    var tbl = 'style="width:100%;border-collapse:collapse;font-size:12px"';
    app.innerHTML =
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">📊</span><h2>' + esc(k.label || 'KUNDALI') + '</h2></div><span class="pill">' + esc(c.ayanamsa) + ' ayanamsha</span></div>' +
      '<p class="card-subtitle">Born ' + esc(k.birth_date) + ' · ' + esc(k.latitude) + ', ' + esc(k.longitude) + ' · ' + esc(k.timezone) + '</p>' +
      '<div class="card-grid">' +
      '<div class="card"><h3 class="card-title">Lagna</h3><p class="card-subtitle">' + esc(c.ascendant.rashiName) + ' ' + deg(c.ascendant.degInRashi) + '</p></div>' +
      '<div class="card"><h3 class="card-title">Moon</h3><p class="card-subtitle">' + esc(moon.rashiName) + '</p></div>' +
      '<div class="card"><h3 class="card-title">Janma Nakshatra</h3><p class="card-subtitle">' + esc(c.janmaNakshatra.name) + ' pada ' + esc(c.janmaNakshatra.pada) + '</p></div>' +
      '<div class="card"><h3 class="card-title">Dasha now</h3><p class="card-subtitle">' + esc(c.dasha.maha.lord) + ' – ' + esc(c.dasha.antar.lord) + '<br>until ' + esc(fmtDate(c.dasha.antar.end)) + '</p></div>' +
      '<div class="card"><h3 class="card-title">Tara today</h3><p class="card-subtitle">' + esc(c.tara.number) + ' · ' + esc(c.tara.name) + ' (' + esc(c.tara.beneficence) + ')</p></div>' +
      '</div></section>' +
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">▦</span><h2>RASHI CHART</h2></div></div>' + southChart(c) + '</section>' +
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">☉</span><h2>PLANETS</h2></div></div><div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>Planet</th><th ' + th + '>Sign</th><th ' + th + '>Nakshatra</th><th ' + th + '>House</th><th ' + th + '>KP sub</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">⌂</span><h2>HOUSE CUSPS (KP)</h2></div></div><div style="overflow-x:auto"><table ' + tbl + '><thead><tr><th ' + th + '>House</th><th ' + th + '>Sign</th><th ' + th + '>Nakshatra</th><th ' + th + '>Sub-lord</th></tr></thead><tbody>' + cusps + '</tbody></table></div><p class="card-subtitle">Calculated by ' + esc(data.meta.engine) + '.</p></section>';
    var ph = document.getElementById('kundali-placeholder'); if (ph) ph.hidden = true;
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showChart(id) {
    status('Calculating chart …');
    return api('/kundali/' + id + '/chart').then(function (r) {
      if (r.status === 401) { store(TOKEN_KEY, null); status('Session expired. Press the button again to log in.', 'error'); return; }
      if (!r.ok) { status(r.body.error || 'Chart could not be loaded.', 'error'); return; }
      status(''); renderChart(r.body);
    });
  }

  /* ---------- saved kundalis (tier limit aware) ---------- */
  function renderSaved(note) {
    return api('/kundali').then(function (r) {
      if (!r.ok) return;
      var list = r.body.kundalis || [];
      if (!list.length) { return; }
      var items = list.map(function (x) {
        return '<div class="timeline-item" style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><strong>' + esc(x.label || 'Kundali #' + x.id) + '</strong><br><small>' + esc(x.birth_date) + '</small></span><span><button type="button" class="pill" data-view="' + x.id + '">View</button> <button type="button" class="pill" data-del="' + x.id + '">Delete</button></span></div>';
      }).join('');
      var wrap = document.getElementById('saved-kundalis');
      if (!wrap) { wrap = document.createElement('section'); wrap.className = 'panel'; wrap.id = 'saved-kundalis'; app.parentNode.insertBefore(wrap, app.nextSibling); }
      wrap.innerHTML = '<div class="panel-title"><div class="title-left"><span class="round-icon">🗂</span><h2>SAVED KUNDALIS</h2></div><button type="button" class="pill" id="tn-logout">Log out</button></div>' + (note ? '<p class="card-subtitle">' + esc(note) + '</p>' : '') + items;
      wrap.onclick = function (e) {
        var v = e.target.closest('[data-view]'), d = e.target.closest('[data-del]'), lo = e.target.closest('#tn-logout');
        if (v) showChart(v.getAttribute('data-view'));
        if (lo) { store(TOKEN_KEY, null); store(PHONE_KEY, null); wrap.remove(); app.innerHTML = ''; status('Logged out.'); }
        if (d && window.confirm('Delete this saved kundali?')) {
          api('/kundali/' + d.getAttribute('data-del'), { method: 'DELETE' }).then(function (x) {
            if (!x.ok) { status(x.body.error || 'Could not delete.', 'error'); return; }
            wrap.remove(); renderSaved(); status('Deleted. You can now generate a new kundali.');
          });
        }
      };
    });
  }

  /* ---------- find BIRTH-PLACE coordinates (not device GPS) ---------- */
  var findBtn = document.getElementById('get-location-btn');
  if (findBtn) findBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!val('city')) { status('Enter the birth city first.', 'error'); return; }
    findBtn.disabled = true; status('Finding ' + val('city') + ' …');
    geocode(val('city'), val('state'), val('country')).then(function (pl) {
      findBtn.disabled = false;
      if (!pl) { status('Could not find "' + val('city') + '". Check the spelling.', 'error'); return; }
      f('lat').value = pl.lat; f('lon').value = pl.lon; f('lat').dataset.auto = '1';
      status('Found: ' + pl.label + ' (' + pl.lat + ', ' + pl.lon + ', ' + pl.tz + '). Birth place is used, not your current location.');
    });
  });

  ['city', 'state', 'country'].forEach(function (n) {
    f(n).addEventListener('input', function () { if (f('lat').dataset.auto) { f('lat').value = ''; f('lon').value = ''; delete f('lat').dataset.auto; } });
  });

  /* ---------- submit ---------- */
  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    if (!form.reportValidity()) return;
    if (!validPhone(val('mobile'))) { status('Enter a valid 10-digit Indian mobile number.', 'error'); f('mobile').focus(); return; }
    busy = true;
    var btn = form.querySelector('button.submit-btn:not([type="button"])'); if (btn) btn.disabled = true;
    function done() { busy = false; if (btn) btn.disabled = false; }

    var lat = parseFloat(val('lat')), lon = parseFloat(val('lon')), hasGps = isFinite(lat) && isFinite(lon);
    var place;
    status(hasGps ? 'Reading the time zone …' : 'Finding ' + val('city') + ' …');
    place = hasGps ? tzForCoords(lat, lon).then(function (tz) { return tz ? { lat: lat, lon: lon, tz: tz, label: val('city') } : null; })
      : geocode(val('city'), val('state'), val('country'));
    place.catch(function () { return null; }).then(function (pl) {
      if (!pl) { status(hasGps ? 'Could not determine the time zone for these coordinates.' : 'Could not find "' + val('city') + '" automatically. Check the spelling or the internet connection and try again. Coordinates are optional; use them only if the city is not found.', 'error'); done(); return null; }
      var iso;
      try { iso = isoWithOffset(val('dob'), val('tob'), pl.tz); } catch (err) { status('Date or time of birth is not valid.', 'error'); done(); return null; }
      return ensureLogin(val('mobile')).then(function (ok) {
        if (!ok) { done(); return; }
        status('Saving birth details …');
        return api('/kundali', { method: 'POST', body: { birth_date: iso, latitude: pl.lat, longitude: pl.lon, timezone: pl.tz, label: val('name') } }).then(function (r) {
          if (r.status === 401) { store(TOKEN_KEY, null); status('Session expired. Press the button again to log in.', 'error'); done(); return; }
          if (r.status === 403 && r.body.code === 'KUNDALI_LIMIT_REACHED') {
            status(r.body.error, 'error'); renderSaved('Delete one saved kundali to add a new one, or view an existing one.'); done(); return;
          }
          if (!r.ok) { status(r.body.error || 'Could not save the kundali.', 'error'); done(); return; }
          return showChart(r.body.id).then(function () { renderSaved(); done(); });
        });
      });
    });
  });

  if (load(TOKEN_KEY)) renderSaved();
})();
