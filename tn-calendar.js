/* TaraNidhi — Utsav Calendar: month grid, year list, day detail (traditional muhurat timings) and
   Traditional vs TaraNidhi vs Personal comparison. Calendar math: tn-panchang-engine.js (astronomy-engine).
   TaraNidhi windows come from GET /muhurta/scan (login required). */
(function () {
  'use strict';
  var API = 'https://occultviision-api.occultviision.workers.dev';
  var root = document.getElementById('tn-cal'); if (!root) return;
  var COL = { festival: '#ffdc83', vrat: '#7fb2ff', holiday: '#ff8a8a', special: '#c79bff', tithi: '#9aa3c7' };
  var LBL = { festival: 'Festival / Utsav', vrat: 'Vrat / Ekadashi / Pradosh', holiday: 'Holiday', special: 'Special period', tithi: 'Tithi (Purnima / Amavasya)' };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var PURPOSES = ['general', 'business', 'travel', 'marriage', 'finance', 'property', 'medical', 'education', 'legal', 'spiritual'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; }
  function place() { try { var p = JSON.parse(ls('tn_place') || 'null'); if (p && isFinite(p.lat) && isFinite(p.lon)) return p; } catch (e) { } return { lat: 23.2599, lon: 77.4126, label: 'Bhopal (default)' }; }
  function tzMin(p) { return (p.lat > 6 && p.lat < 37.5 && p.lon > 68 && p.lon < 98) ? 330 : -new Date().getTimezoneOffset(); }
  function hm(ms, tz, sec) { var d = new Date(ms + tz * 60000), h = d.getUTCHours(), m = d.getUTCMinutes(), s = d.getUTCSeconds(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + (sec ? ':' + ('0' + s).slice(-2) : '') + ' ' + ap; }
  function span(a, tz) { return hm(a[0], tz) + ' – ' + hm(a[1], tz); }
  function p2(n) { return ('0' + n).slice(-2); }

  var st = { y: 0, m: 0, view: 'month', days: [], sel: null, filters: { festival: 1, vrat: 1, holiday: 1, special: 1, tithi: 0 }, kundalis: null };
  var now = new Date(), nowIST = new Date(now.getTime() + 330 * 60000);
  st.y = nowIST.getUTCFullYear(); st.m = nowIST.getUTCMonth() + 1;
  var todayKey = nowIST.getUTCFullYear() + '-' + p2(nowIST.getUTCMonth() + 1) + '-' + p2(nowIST.getUTCDate());

  function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function ready() {
    if (window.TNP) return Promise.resolve();
    return (window.Astronomy ? Promise.resolve() : load('https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js'))
      .then(function () { return load('tn-panchang-engine.js'); });
  }

  /* ---------- data ---------- */
  function computeMonth() {
    var p = place(), tz = tzMin(p), first = new Date(Date.UTC(st.y, st.m - 1, 1)), pad = first.getUTCDay(), n = new Date(Date.UTC(st.y, st.m, 0)).getUTCDate();
    var start = new Date(Date.UTC(st.y, st.m - 1, 1 - pad));
    var total = Math.ceil((pad + n) / 7) * 7;
    st.days = window.TNP.compute(start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), total, { lat: p.lat, lon: p.lon, tzMin: tz });
    st.pad = pad; st.nDays = n; st.tz = tz;
  }
  function visible(ev) { return !!st.filters[ev.type]; }

  /* ---------- views ---------- */
  function header() {
    var p = place();
    return '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">🗓</span><h2>UTSAV CALENDAR</h2></div><span class="pill">' + esc(MONTHS[st.m - 1]) + ' ' + st.y + '</span></div>' +
      '<p class="card-subtitle">Tithi, festivals, vrat, holidays and traditional muhurat timings — calculated from the Sun and Moon for <b>' + esc(p.label) + '</b>. ' +
      '<a href="#" id="cal-gps" class="pill" style="text-decoration:none">📍 Use GPS</a></p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0">' +
      '<button type="button" class="pill" data-nav="-1" aria-label="Previous month">◀</button>' +
      '<select id="cal-m" aria-label="Month">' + MONTHS.map(function (m, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === st.m ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select>' +
      '<input id="cal-y" type="number" min="1900" max="2100" value="' + st.y + '" style="width:84px" aria-label="Year">' +
      '<button type="button" class="pill" data-nav="1" aria-label="Next month">▶</button>' +
      '<button type="button" class="pill" id="cal-today">Today</button>' +
      '<span style="margin-left:auto"></span>' +
      '<button type="button" class="pill" data-view="month" aria-pressed="' + (st.view === 'month') + '">Month</button>' +
      '<button type="button" class="pill" data-view="year" aria-pressed="' + (st.view === 'year') + '">Year list</button></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px">' + Object.keys(LBL).map(function (k) { return '<label style="display:inline-flex;gap:5px;align-items:center;cursor:pointer"><input type="checkbox" data-f="' + k + '"' + (st.filters[k] ? ' checked' : '') + '><span style="width:10px;height:10px;border-radius:50%;background:' + COL[k] + ';display:inline-block"></span>' + LBL[k] + '</label>'; }).join('') + '</div></section>';
  }
  function monthGrid() {
    var cells = '', th = DOW.map(function (d) { return '<div style="text-align:center;font-size:11px;opacity:.8;padding:4px 0">' + d + '</div>'; }).join('');
    st.days.forEach(function (d, i) {
      var inMonth = d.date.slice(0, 7) === st.y + '-' + p2(st.m), evs = (d.events || []).filter(visible), isToday = d.date === todayKey, sel = d.date === st.sel;
      var chips = evs.slice(0, 3).map(function (e) { return '<div title="' + esc(e.name) + '" style="font-size:9.5px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + COL[e.type] + '">● ' + esc(e.name.replace(/ \(.*$/, '').replace(/ — Day.*$/, '')) + '</div>'; }).join('') + (evs.length > 3 ? '<div style="font-size:9px;opacity:.7">+' + (evs.length - 3) + ' more</div>' : '');
      cells += '<button type="button" data-day="' + d.date + '" style="all:unset;box-sizing:border-box;cursor:pointer;min-height:78px;padding:4px;border:1px solid ' + (sel ? '#ffdc83' : '#d9c9ff40') + ';' + (isToday ? 'background:rgba(255,220,131,.14);' : '') + (inMonth ? '' : 'opacity:.4;') + 'border-radius:8px;overflow:hidden;display:block">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px"><b>' + (+d.date.slice(8)) + '</b><span style="opacity:.8;font-size:10px">' + (d.tithi === 15 ? 'Purn' : d.tithi === 30 ? 'Amav' : (d.paksha || ' ')[0] + (d.tithi % 15)) + '</span></div>' + chips + '</button>';
    });
    return '<section class="panel"><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px">' + th + cells + '</div>' +
      '<p class="card-subtitle" style="margin-top:6px">S = Shukla, K = Krishna paksha (tithi number); P = Purnima, A = Amavasya. Tap a day for full details.</p></section>';
  }
  function yearList() {
    var p = place(), tz = tzMin(p), days = window.TNP.compute(st.y, 1, 1, ((st.y % 4 === 0 && st.y % 100 !== 0) || st.y % 400 === 0) ? 366 : 365, { lat: p.lat, lon: p.lon, tzMin: tz });
    var out = '', last = '';
    days.forEach(function (d) {
      var evs = (d.events || []).filter(visible); if (!evs.length) return;
      var mo = +d.date.slice(5, 7); if (mo !== last) { out += '<h3 class="card-title" style="text-align:left;margin:14px 0 4px">' + MONTHS[mo - 1].toUpperCase() + ' ' + st.y + '</h3>'; last = mo; }
      evs.forEach(function (e) { out += '<button type="button" data-day="' + d.date + '" data-y="1" style="all:unset;cursor:pointer;display:grid;grid-template-columns:62px 38px 1fr;gap:8px;padding:6px 2px;border-bottom:1px solid #ffffff1a;font-size:13px;width:100%;box-sizing:border-box"><span>' + (+d.date.slice(8)) + ' ' + MONTHS[mo - 1].slice(0, 3) + '</span><span style="opacity:.7">' + d.vara.slice(0, 3) + '</span><span><b style="color:' + COL[e.type] + '">' + esc(e.name) + '</b>' + (e.note ? '<br><small style="opacity:.8">' + esc(e.note) + '</small>' : '') + '</span></button>'; });
    });
    return '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">📜</span><h2>' + st.y + ' — ALL OBSERVANCES</h2></div></div>' + (out || '<p class="card-subtitle">Nothing selected. Tick a category above.</p>') + '<p class="card-subtitle">Tithi-based dates follow the “tithi at the observance time” rule (sunrise / midday / Pradosh / midnight). Regional almanacs can differ by a day when a tithi spans or skips days. Islamic festivals depend on moon sighting and are not included.</p></section>';
  }
  function slot(label, arr, tz, good, note) { return '<tr><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a">' + (good ? '✅ ' : '⛔ ') + esc(label) + '</td><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a;white-space:nowrap">' + span(arr, tz) + '</td><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a;font-size:11px;opacity:.85">' + esc(note || '') + '</td></tr>'; }
  function segTable(title, segs, tz) {
    return '<h3 class="card-title" style="text-align:left;margin:10px 0 4px">' + title + '</h3>' + segs.map(function (s) { return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:3px 0;border-bottom:1px solid #ffffff14"><span>' + esc(s.name) + '</span><span style="white-space:nowrap;opacity:.9">' + hm(s.from, tz) + ' → ' + hm(s.to, tz) + '</span></div>'; }).join('');
  }
  function dayDetail() {
    if (!st.sel) return '<section class="panel"><p class="card-subtitle">Tap a date to see its tithi, nakshatra, festivals and the traditional muhurat timings.</p></section>';
    var d = st.days.filter(function (x) { return x.date === st.sel; })[0];
    if (!d) { var p0 = place(); d = window.TNP.compute(+st.sel.slice(0, 4), +st.sel.slice(5, 7), +st.sel.slice(8), 1, { lat: p0.lat, lon: p0.lon, tzMin: tzMin(p0) })[0]; }
    var tz = st.tz || tzMin(place()), det = window.TNP.detail(d), evs = d.events || [];
    var ev = evs.length ? evs.map(function (e) { return '<div style="padding:6px 8px;margin:4px 0;border:1px solid ' + COL[e.type] + '66;border-radius:10px"><b style="color:' + COL[e.type] + '">' + esc(e.name) + '</b>' + (e.gazetted ? ' <span class="pill" style="font-size:10px">Gazetted holiday</span>' : '') + (e.note ? '<br><small>' + esc(e.note) + '</small>' : '') + '</div>'; }).join('') : '<p class="card-subtitle">No major festival or vrat on this date.</p>';
    var good = [['Brahma Muhurta', det.brahma, 'Best for sadhana, study'], ['Abhijit Muhurta', det.abhijit, d.dow === 3 ? 'Wednesday: traditionally weaker' : 'Solar noon — most activities'], ['Godhuli', det.godhuli, 'Cow-dust hour — good for travel arrival/vivah (regional)'], ['Pradosh Kaal', det.pradosh, 'Shiva worship, Lakshmi puja'], ['Nishita', det.nishita, 'Midnight — tantra, Shivaratri/Janmashtami puja']]
      .map(function (x) { return slot(x[0], x[1], tz, true, x[2]); }).join('');
    var bad = [slot('Rahu Kaal', det.rahu, tz, false, 'Avoid new beginnings'), slot('Yamaganda', det.yamaganda, tz, false, 'Avoid auspicious starts'), slot('Gulika Kaal', det.gulika, tz, false, 'Repeats — avoid for things you do not want repeated')]
      .concat(det.durmuhurta.map(function (x) { return slot('Durmuhurta', x, tz, false, 'Inauspicious muhurta'); }))
      .concat(det.bhadra.map(function (x) { return slot('Bhadra (Vishti Karana)', x, tz, false, 'Avoid auspicious works; Rakhi/Holika need Bhadra-free time'); })).join('');
    var ch = det.choghadiya.map(function (c) { return '<tr style="' + (c.good === 1 ? 'color:#43f0a2' : c.good ? '' : 'opacity:.75') + '"><td style="padding:5px 4px;border-bottom:1px solid #ffffff14">' + (c.night ? '☾' : '☀') + ' ' + c.name + '</td><td style="padding:5px 4px;border-bottom:1px solid #ffffff14;white-space:nowrap">' + span([c.from, c.to], tz) + '</td><td style="padding:5px 4px;border-bottom:1px solid #ffffff14">' + (c.good === 1 ? 'Good' : c.good ? 'Medium' : 'Avoid') + '</td></tr>'; }).join('');
    var lunar = d.lunar ? d.lunar.month + (d.lunar.adhika ? ' (Adhika)' : '') + ' masa' : '';
    var dt = new Date(Date.UTC(+d.date.slice(0, 4), +d.date.slice(5, 7) - 1, +d.date.slice(8)));
    var h = '<section class="panel" id="cal-detail"><div class="panel-title"><div class="title-left"><span class="round-icon">☀</span><h2>' + (+d.date.slice(8)) + ' ' + MONTHS[+d.date.slice(5, 7) - 1].toUpperCase() + ' ' + d.date.slice(0, 4) + ' · ' + d.vara.toUpperCase() + '</h2></div></div>' +
      '<p class="card-subtitle">' + esc(lunar) + ' · ' + esc(d.paksha) + ' ' + esc(d.tithiName) + ' (at sunrise) · Nakshatra ' + esc(d.nakshatra) + ' · Moon in ' + esc(d.rashi) + ' · Sun in ' + esc(d.suryaRashi) + ' · Sunrise ' + hm(d.sunrise, tz) + ' · Sunset ' + hm(d.sunset, tz) + '</p>' +
      '<h3 class="card-title" style="text-align:left;margin:8px 0 4px">FESTIVALS & OBSERVANCES</h3>' + ev +
      segTable('TITHI', det.tithi, tz) + segTable('NAKSHATRA', det.nakshatra, tz) + segTable('YOGA', det.yoga, tz) + segTable('KARANA', det.karana, tz) +
      '<h3 class="card-title" style="text-align:left;margin:14px 0 4px">TRADITIONAL MUHURAT — FAVOURABLE</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px"><tbody>' + good + '</tbody></table></div>' +
      '<h3 class="card-title" style="text-align:left;margin:14px 0 4px">TRADITIONAL — TO AVOID</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px"><tbody>' + bad + '</tbody></table></div>' +
      '<h3 class="card-title" style="text-align:left;margin:14px 0 4px">CHOGHADIYA</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px"><tbody>' + ch + '</tbody></table></div></section>' + compareShell(d);
    return h;
  }

  /* ---------- Traditional vs TaraNidhi vs Personal ---------- */
  function compareShell(d) {
    return '<section class="panel" id="cmp"><div class="panel-title"><div class="title-left"><span class="round-icon">⚖</span><h2>TRADITIONAL vs TARANIDHI</h2></div></div>' +
      '<p class="card-subtitle"><b>Traditional</b> = fixed panchang rules (Rahu/Yama/Gulika, Durmuhurta, Bhadra, Choghadiya). <b>TaraNidhi</b> = hora/uphora, nakshatra and tithi quality scored for your purpose. <b>Personal</b> = the same scan using your kundali’s Tara (birth-nakshatra) relation. <b>★ Golden</b> = all agree.</p>' +
      '<div class="form-row"><div class="form-group"><label for="cmp-p">Purpose</label><select id="cmp-p">' + PURPOSES.map(function (p) { return '<option value="' + p + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-group"><label for="cmp-k">Birth chart (for Personal)</label><select id="cmp-k"><option value="">— none (universal only) —</option></select></div></div>' +
      '<button type="button" class="submit-btn" id="cmp-go">COMPARE WINDOWS FOR THIS DAY</button><div id="cmp-out" class="result-box" style="display:block;margin-top:10px">Choose purpose and press Compare. Login is required.</div></section>';
  }
  function api(path) {
    var t = ls('tn_session_token'), h = {}; if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + path, { headers: h }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); }).catch(function () { return { ok: false, status: 0, body: {} }; });
  }
  function fillKundalis() {
    var sel = document.getElementById('cmp-k'); if (!sel || !ls('tn_session_token')) return;
    api('/kundali').then(function (r) { if (!r.ok) return; (r.body.kundalis || []).forEach(function (k) { var o = document.createElement('option'); o.value = k.id; o.textContent = (k.label || 'Kundali') + ' — ' + k.birth_date.slice(0, 10); sel.appendChild(o); }); });
  }
  function overlap(a0, a1, b0, b1) { return a0 < b1 && b0 < a1; }
  function runCompare() {
    var out = document.getElementById('cmp-out'), p = place(), tz = st.tz || tzMin(p), key = st.sel;
    var d = st.days.filter(function (x) { return x.date === key; })[0]; if (!d) return;
    var det = window.TNP.detail(d), purpose = document.getElementById('cmp-p').value, kid = document.getElementById('cmp-k').value;
    if (!ls('tn_session_token')) { out.innerHTML = 'Please log in first (sidebar → Log in / Register) to load TaraNidhi windows.'; return; }
    out.textContent = 'Scanning …';
    var from = key + 'T00:00:00' + (tz >= 0 ? '+' : '-') + p2(Math.floor(Math.abs(tz) / 60)) + ':' + p2(Math.abs(tz) % 60);
    var to = new Date(Date.parse(from) + 86400000).toISOString();
    function scan(withK) { return api('/muhurta/scan?lat=' + p.lat + '&lon=' + p.lon + '&purpose=' + purpose + '&from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to) + '&top_n=48' + (withK ? '&kundali_id=' + kid : '')); }
    Promise.all([scan(false), kid ? scan(true) : Promise.resolve(null)]).then(function (rs) {
      var u = rs[0], pe = rs[1];
      if (u.status === 401) { out.textContent = 'Session expired — log in again from the sidebar.'; return; }
      if (!u.ok) { out.textContent = (u.body && u.body.error) || 'Could not load TaraNidhi windows.'; return; }
      var uw = [].concat.apply([], (u.body.results || []).map(function (r) { return r.windows || []; }));
      var pmap = {}; if (pe && pe.ok) [].concat.apply([], (pe.body.results || []).map(function (r) { return r.windows || []; })).forEach(function (w) { pmap[w.timestamp] = w; });
      uw.sort(function (a, b) { return a.timestamp < b.timestamp ? -1 : 1; });
      var bad = [['Rahu Kaal', det.rahu], ['Yamaganda', det.yamaganda], ['Gulika', det.gulika]].concat(det.durmuhurta.map(function (x) { return ['Durmuhurta', x]; })).concat(det.bhadra.map(function (x) { return ['Bhadra', x]; }));
      var rows = '', golden = 0, diff = 0;
      uw.forEach(function (w) {
        var t0 = Date.parse(w.timestamp), t1 = t0 + 30 * 60000, why = [];
        bad.forEach(function (b) { if (overlap(t0, t1, b[1][0], b[1][1])) why.push(b[0]); });
        det.choghadiya.forEach(function (c) { if (overlap(t0, t1, c.from, c.to) && c.good === 0) { if (why.indexOf('Choghadiya ' + c.name) < 0) why.push('Choghadiya ' + c.name); } });
        var pw = pmap[w.timestamp], ps = pw ? pw.score : null, trad = !why.length, high = w.score >= 75, phigh = ps == null ? true : ps >= 75, gold = trad && high && phigh;
        if (gold) golden++; if (trad !== high) diff++;
        if (!gold && !(why.length && high) && !(trad && !high && w.score >= 60)) { if (w.score < 60 && !why.length) return; }
        rows += '<tr style="' + (gold ? 'background:rgba(67,240,162,.14);font-weight:600' : '') + '"><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a;white-space:nowrap">' + (gold ? '★ ' : '') + hm(t0, tz) + '</td><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a">' + w.score + '</td>' +
          (kid ? '<td style="padding:6px 4px;border-bottom:1px solid #ffffff1a">' + (ps == null ? '—' : ps) + (pw && pw.tara ? ' <small>(' + esc((pw.tara.name || pw.tara) + '') + ')</small>' : '') + '</td>' : '') +
          '<td style="padding:6px 4px;border-bottom:1px solid #ffffff1a">' + esc(w.hora_lord) + '</td><td style="padding:6px 4px;border-bottom:1px solid #ffffff1a">' + esc(w.nakshatra) + '</td>' +
          '<td style="padding:6px 4px;border-bottom:1px solid #ffffff1a;font-size:11.5px">' + (trad ? '✅ clear' : '⛔ ' + esc(why.join(', '))) + '</td></tr>';
      });
      var th = 'style="text-align:left;padding:6px 4px;border-bottom:1px solid #d8b86a99;font-size:11px;text-transform:uppercase;white-space:nowrap"';
      out.innerHTML = '<p><b>' + golden + '</b> golden window' + (golden === 1 ? '' : 's') + ' (all rules agree) · <b>' + diff + '</b> slot' + (diff === 1 ? '' : 's') + ' where Traditional and TaraNidhi disagree.</p>' +
        '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px"><thead><tr><th ' + th + '>Slot (30 min)</th><th ' + th + '>TaraNidhi</th>' + (kid ? '<th ' + th + '>Personal</th>' : '') + '<th ' + th + '>Hora</th><th ' + th + '>Nakshatra</th><th ' + th + '>Traditional</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" style="padding:8px">No slot scored 60+ on this day for this purpose.</td></tr>') + '</tbody></table></div>' +
        '<p class="card-subtitle">Where they disagree: TaraNidhi may rate a slot high (good hora/nakshatra) while the traditional table forbids it (e.g. inside Rahu Kaal), or the reverse. Treat ⛔ rows as “high score but traditionally restricted” — use only if your school allows. Personal scores appear when a birth chart is chosen.</p>';
    });
  }

  /* ---------- render / wiring ---------- */
  function render(keepScroll) {
    var y0 = window.scrollY;
    if (st.view === 'month') computeMonth();
    root.innerHTML = header() + (st.view === 'month' ? monthGrid() : yearList()) + dayDetail();
    if (st.sel) fillKundalis();
    if (window.tnLang && window.tnLang.get() === 'hi') window.tnLang.set('hi');
    if (keepScroll) window.scrollTo(0, y0);
  }
  root.addEventListener('click', function (e) {
    var t = e.target;
    var nav = t.closest('[data-nav]'), v = t.closest('[data-view]'), dy = t.closest('[data-day]');
    if (nav) { st.m += +nav.getAttribute('data-nav'); if (st.m < 1) { st.m = 12; st.y--; } if (st.m > 12) { st.m = 1; st.y++; } render(); return; }
    if (t.closest('#cal-today')) { st.y = nowIST.getUTCFullYear(); st.m = nowIST.getUTCMonth() + 1; st.sel = todayKey; render(); return; }
    if (v) { st.view = v.getAttribute('data-view'); render(); return; }
    if (t.closest('#cal-gps')) { e.preventDefault(); if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(function (pos) { ls('tn_place', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'My GPS location', manual: false })); render(); }, function () { alert('GPS is blocked for this site. Allow Location in the browser (lock icon) and retry.'); }); return; }
    if (dy) { st.sel = dy.getAttribute('data-day'); if (dy.getAttribute('data-y')) { st.y = +st.sel.slice(0, 4); st.m = +st.sel.slice(5, 7); st.view = 'month'; } render(); var el = document.getElementById('cal-detail'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (t.closest('#cmp-go')) { runCompare(); return; }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'cal-m') { st.m = +t.value; render(); } else if (t.id === 'cal-y') { var y = parseInt(t.value, 10); if (y >= 1900 && y <= 2100) { st.y = y; render(); } } else if (t.getAttribute && t.getAttribute('data-f')) { st.filters[t.getAttribute('data-f')] = t.checked ? 1 : 0; render(true); }
  });

  root.innerHTML = '<section class="panel"><p class="card-subtitle">Loading the astronomical calendar …</p></section>';
  ready().then(function () { st.sel = todayKey; render(); }).catch(function () { root.innerHTML = '<section class="panel"><p class="card-subtitle">Could not load the calendar engine. Check your internet connection and reload.</p></section>'; });
})();
