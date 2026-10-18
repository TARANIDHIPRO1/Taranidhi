/* TaraNidhi — Panchang / Utsav engine (runs in the browser and in Node).
   Everything here is computed from astronomy-engine (Sun & Moon positions) — nothing is typed in by hand except the festival RULES
   (month + paksha + tithi + observance time). Months are amanta (new-moon to new-moon), Lahiri ayanamsha, adhika masa handled.
   Festival dates follow the common "tithi prevailing at the observance time" rule; regional almanacs can differ by a day
   (e.g. when a tithi spans two days or is skipped). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('astronomy-engine'));
  else root.TNP = factory(root.Astronomy);
})(typeof self !== 'undefined' ? self : this, function (A) {
  'use strict';
  var MIN = 60000, HOUR = 3600000, DAY = 86400000;
  var MASA = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
  var TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  var NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  var VARA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DEVI = ['Shailputri', 'Brahmacharini', 'Chandraghanta', 'Kushmanda', 'Skandamata', 'Katyayani', 'Kalaratri', 'Mahagauri', 'Siddhidatri'];
  var EKADASHI = { 0: ['Papmochani', 'Kamada'], 1: ['Varuthini', 'Mohini'], 2: ['Apara', 'Nirjala'], 3: ['Yogini', 'Devshayani'], 4: ['Kamika', 'Shravana Putrada'], 5: ['Aja', 'Parivartini'], 6: ['Indira', 'Papankusha'], 7: ['Rama', 'Dev Uthani'], 8: ['Utpanna', 'Mokshada'], 9: ['Saphala', 'Pausha Putrada'], 10: ['Shattila', 'Jaya'], 11: ['Vijaya', 'Amalaki'] };

  function mod(a, n) { return ((a % n) + n) % n; }
  function asDate(t) { return t instanceof Date ? t : (t && t.date ? t.date : new Date(t)); }
  /* Lahiri ayanamsha, mean value (accurate to ~0.005 deg, enough for sign-at-new-moon and nakshatra at the day level) */
  function ayanamsa(t) { var y = (asDate(t).getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY); return 23.8531 + 0.013972 * y; }
  function sunLon(t) { return A.SunPosition(asDate(t)).elon; }
  function elong(t) { return A.MoonPhase(asDate(t)); }                       // moon - sun, 0..360
  function moonLon(t) { return mod(sunLon(t) + elong(t), 360); }
  function sunSid(t) { return mod(sunLon(t) - ayanamsa(t), 360); }
  function moonSid(t) { return mod(moonLon(t) - ayanamsa(t), 360); }
  function tithiNo(t) { return Math.floor(elong(t) / 12) + 1; }               // 1..30
  function tithiName(n) { if (n === 15) return 'Purnima'; if (n === 30) return 'Amavasya'; return TITHI[(n - 1) % 15]; }
  function paksha(n) { return n <= 15 ? 'Shukla' : 'Krishna'; }

  /* ---- lunations ---- */
  function lunations(fromMs, toMs) {
    var out = [], t = A.SearchMoonPhase(0, new Date(fromMs - 40 * DAY), 45);
    while (t && t.date.getTime() < toMs + 45 * DAY) { out.push(t.date.getTime()); t = A.SearchMoonPhase(0, new Date(t.date.getTime() + 20 * DAY), 20); }
    var L = [];
    for (var i = 0; i < out.length - 1; i++) {
      var s0 = Math.floor(sunSid(new Date(out[i] + 60000)) / 30), s1 = Math.floor(sunSid(new Date(out[i + 1] - 60000)) / 30);
      L.push({ start: out[i], end: out[i + 1], sign: s0, month: (s0 + 1) % 12, adhika: s0 === s1 });
    }
    return L;
  }
  function lunationAt(L, ms) { for (var i = 0; i < L.length; i++) if (ms >= L[i].start && ms < L[i].end) return L[i]; return null; }

  /* ---- sun / moon rise & set ---- */
  function observer(lat, lon) { return new A.Observer(lat, lon, 0); }
  function rise(body, obs, dir, fromMs) { var r = A.SearchRiseSet(body, obs, dir, new Date(fromMs), 1.2); return r ? r.date.getTime() : null; }

  /* ---- choghadiya / kaal tables ---- */
  var CH_DAY = [['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit'], ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh'], ['Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh'], ['Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal'], ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal']];
  var CH_NIGHT = [['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], ['Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal'], ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal'], ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg'], ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog'], ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh']];
  var CH_GOOD = { Amrit: 1, Shubh: 1, Labh: 1, Chal: 0.5 };
  var RAHU_PART = [8, 2, 7, 5, 6, 4, 3], YAMA_PART = [5, 4, 3, 2, 1, 7, 6], GULI_PART = [7, 6, 5, 4, 3, 2, 1];   // Sun..Sat, 1-based eighth of the day
  function eighth(sr, ss, part) { var d = (ss - sr) / 8; return [sr + (part - 1) * d, sr + part * d]; }

  /* ---- tithi / karana segments inside [t0, t1] ---- */
  function segments(fn, t0, t1, stepMin) {            // fn(ms) -> integer state; returns [{v, from, to}]
    var out = [], step = (stepMin || 15) * MIN, cur = fn(t0), from = t0, t = t0;
    while (t < t1) {
      var nx = Math.min(t + step, t1), v = fn(nx);
      if (v !== cur) {
        var lo = t, hi = nx; while (hi - lo > 30000) { var mid = (lo + hi) / 2; if (fn(mid) === cur) lo = mid; else hi = mid; }
        out.push({ v: cur, from: from, to: hi }); cur = v; from = hi;
      }
      t = nx;
    }
    out.push({ v: cur, from: from, to: t1 }); return out;
  }
  function karanaNo(ms) { return Math.floor(elong(new Date(ms)) / 6) + 1; }   // 1..60
  function karanaName(k) {
    if (k === 1) return 'Kimstughna'; if (k >= 58) return ['Shakuni', 'Chatushpada', 'Naga'][k - 58];
    return ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'][(k - 2) % 7];
  }

  /* ---- festival rules: [name, type, masaIndex, tithi(1..30), kala, note, gazetted] ---- */
  var F = [
    ['Ugadi / Gudi Padwa (Hindu New Year)', 'festival', 0, 1, 'sunrise', 'Chaitra Shukla Pratipada; Chaitra Navratri begins', 0],
    ['Ram Navami', 'festival', 0, 9, 'madhyahna', 'Birth of Shri Ram', 1],
    ['Mahavir Jayanti', 'festival', 0, 13, 'sunrise', 'Jain festival', 1],
    ['Hanuman Jayanti', 'festival', 0, 15, 'sunrise', 'Chaitra Purnima', 0],
    ['Akshaya Tritiya', 'festival', 1, 3, 'madhyahna', 'Imperishable-merit day; very auspicious for new beginnings', 0],
    ['Buddha Purnima', 'festival', 1, 15, 'sunrise', 'Vaishakha Purnima', 1],
    ['Ganga Dussehra', 'festival', 2, 10, 'sunrise', '', 0],
    ['Vat Savitri (Amavasya)', 'vrat', 2, 30, 'sunrise', 'Jyeshtha Amavasya', 0],
    ['Jagannath Rath Yatra', 'festival', 3, 2, 'sunrise', '', 0],
    ['Guru Purnima (Vyasa Purnima)', 'festival', 3, 15, 'sunrise', 'Ashadha Purnima', 0],
    ['Hariyali Teej', 'festival', 4, 3, 'sunrise', '', 0],
    ['Nag Panchami', 'festival', 4, 5, 'sunrise', '', 0],
    ['Raksha Bandhan', 'festival', 4, 15, 'madhyahna', 'Shravana Purnima (avoid Bhadra for the ritual)', 0],
    ['Janmashtami', 'festival', 4, 23, 'nishita', 'Krishna Ashtami at midnight (Nishita)', 1],
    ['Hartalika Teej', 'vrat', 5, 3, 'sunrise', '', 0],
    ['Ganesh Chaturthi', 'festival', 5, 4, 'madhyahna', 'Vinayaka Chaturthi (Madhyahna)', 0],
    ['Anant Chaturdashi', 'festival', 5, 14, 'sunrise', 'Ganesh Visarjan', 0],
    ['Sarva Pitru Amavasya (Mahalaya)', 'festival', 5, 30, 'sunrise', 'Last day of Pitru Paksha', 0],
    ['Durga Ashtami (Maha Ashtami)', 'festival', 6, 8, 'purvahna', 'Mahagauri worship; Sandhi Puja. Highly auspicious day (Ashtami in the forenoon)', 0],
    ['Maha Navami', 'festival', 6, 9, 'madhyahna', 'Siddhidatri; Ayudha Puja', 0],
    ['Vijayadashami (Dussehra)', 'festival', 6, 10, 'aparahna', 'Victory of dharma; Shastra Puja', 1],
    ['Sharad Purnima (Kojagiri)', 'festival', 6, 15, 'sunrise', 'Moon at fullest', 0],
    ['Karwa Chauth', 'vrat', 6, 19, 'moonrise', 'Krishna Chaturthi — fast broken at moonrise', 0],
    ['Ahoi Ashtami', 'vrat', 6, 23, 'moonrise', '', 0],
    ['Dhanteras (Dhantrayodashi)', 'festival', 6, 28, 'pradosh', 'Krishna Trayodashi in Pradosh', 0],
    ['Naraka Chaturdashi (Choti Diwali)', 'festival', 6, 29, 'sunrise', '', 0],
    ['Diwali — Lakshmi Puja', 'festival', 6, 30, 'pradosh', 'Amavasya in Pradosh', 1],
    ['Govardhan Puja (Annakut)', 'festival', 7, 1, 'sunrise', '', 0],
    ['Bhai Dooj', 'festival', 7, 2, 'madhyahna', '', 0],
    ['Chhath Puja (main day)', 'festival', 7, 6, 'pradosh', 'Shashthi at sunset', 0],
    ['Gopashtami', 'festival', 7, 8, 'sunrise', '', 0],
    ['Tulsi Vivah', 'festival', 7, 12, 'pradosh', '', 0],
    ['Kartik Purnima / Dev Diwali / Guru Nanak Jayanti', 'festival', 7, 15, 'sunrise', '', 1],
    ['Dattatreya Jayanti', 'festival', 8, 15, 'sunrise', '', 0],
    ['Kalabhairav Jayanti', 'festival', 8, 23, 'nishita', '', 0],
    ['Vasant Panchami (Saraswati Puja)', 'festival', 10, 5, 'madhyahna', '', 0],
    ['Ratha Saptami', 'festival', 10, 7, 'sunrise', '', 0],
    ['Magha Purnima', 'festival', 10, 15, 'sunrise', '', 0],
    ['Maha Shivaratri', 'festival', 10, 29, 'nishita', 'Krishna Chaturdashi at midnight (Nishita)', 0],
    ['Holika Dahan', 'festival', 11, 15, 'pradosh', 'Phalguna Purnima in Pradosh', 0],
    ['Holi (Dhulandi)', 'festival', 0, 16, 'sunrise', 'Colours — day after Holika Dahan', 1]
  ];
  // Holi is Phalguna Purnima + 1 day: handled specially below (month rule above is a placeholder)
  F = F.filter(function (f) { return f[0] !== 'Holi (Dhulandi)'; });

  /* observance windows -> sample instants; a rule matches when the tithi is current at ANY sample */
  function kalaSamples(kala, sr, ss, nsr, obs) {
    var dl = ss - sr;
    switch (kala) {
      case 'purvahna': return [sr + 0.25 * dl];
      case 'madhyahna': return [sr + dl / 2];
      case 'aparahna': return [sr + 0.6 * dl + 10 * MIN, sr + 0.8 * dl - 10 * MIN];
      case 'pradosh': return [ss + 10 * MIN, ss + 134 * MIN];
      case 'nishita': { var m = ss + (nsr - ss) / 2; return [m - 24 * MIN, m + 24 * MIN]; }
      case 'moonrise': { var mr = rise(A.Body.Moon, obs, +1, ss - 3 * HOUR); return [mr && mr > ss - 3 * HOUR ? mr + 5 * MIN : ss + 2 * HOUR]; }
      default: return [sr + 5 * MIN];
    }
  }
  function udayaOk(T, sr, ss, nsr) {
    var tsr = tithiNo(new Date(sr + 5 * MIN)), tmd = tithiNo(new Date(sr + (ss - sr) / 2)), tnx = tithiNo(new Date((nsr || sr + DAY) + 5 * MIN));
    return tsr === T || (tmd === T && tsr !== T && tnx !== T);
  }

  /* ---- Gregorian fixed days & computus ---- */
  function easter(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return [mo, da]; }
  function fixed(y) {
    var o = {}; function add(m, d, e) { var k = String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); (o[k] = o[k] || []).push(e); }
    add(1, 1, { name: "New Year's Day", type: 'holiday', note: 'Public observance', gazetted: 0 });
    add(1, 26, { name: 'Republic Day', type: 'holiday', note: 'National holiday', gazetted: 1 });
    add(4, 14, { name: 'Dr. Ambedkar Jayanti', type: 'holiday', note: 'Gazetted holiday', gazetted: 1 });
    add(8, 15, { name: 'Independence Day', type: 'holiday', note: 'National holiday', gazetted: 1 });
    add(10, 2, { name: 'Gandhi Jayanti', type: 'holiday', note: 'National holiday', gazetted: 1 });
    add(12, 25, { name: 'Christmas', type: 'holiday', note: 'Gazetted holiday', gazetted: 1 });
    var e = easter(y), gf = new Date(Date.UTC(y, e[0] - 1, e[1] - 2)); add(gf.getUTCMonth() + 1, gf.getUTCDate(), { name: 'Good Friday', type: 'holiday', note: 'Gazetted holiday', gazetted: 1 });
    return o;
  }

  function sankranti(sign, y) {
    var n = RASHI[sign] + ' Sankranti', note = 'Sun enters ' + RASHI[sign] + ' (sidereal)';
    if (sign === 9) { n = 'Makar Sankranti (Pongal / Uttarayan / Lohri next-day)'; note = 'Sun enters Makara — Uttarayana begins; sacred bath & daan'; }
    if (sign === 0) { n = 'Mesha Sankranti (Baisakhi / Vishu / Puthandu)'; note = 'Sun enters Mesha — solar new year'; }
    return { name: n, type: sign === 9 || sign === 0 ? 'festival' : 'tithi', note: note, gazetted: 0 };
  }

  /* ---- main: compute a whole date range ---- */
  function p2(n) { return String(n).padStart(2, '0'); }
  function compute(fromY, fromM, fromD, nDays, o) {
    o = o || {}; var lat = o.lat == null ? 23.2599 : o.lat, lon = o.lon == null ? 77.4126 : o.lon, tz = o.tzMin == null ? 330 : o.tzMin, obs = observer(lat, lon);
    var start0 = Date.UTC(fromY, fromM - 1, fromD) - tz * MIN;
    var L = lunations(start0, start0 + nDays * DAY), days = [], fx = {}, lastFired = {};
    for (var i = 0; i < nDays; i++) {
      var mid = start0 + i * DAY, loc = new Date(mid + tz * MIN), y = loc.getUTCFullYear(), mo = loc.getUTCMonth() + 1, d = loc.getUTCDate();
      var sr = rise(A.Body.Sun, obs, +1, mid), ss = rise(A.Body.Sun, obs, -1, sr || mid), nsr = rise(A.Body.Sun, obs, +1, (sr || mid) + 6 * HOUR);
      if (!sr || !ss) { days.push({ date: y + '-' + p2(mo) + '-' + p2(d), error: 'no sunrise' }); continue; }
      if (!fx[y]) fx[y] = fixed(y);
      var key = y + '-' + p2(mo) + '-' + p2(d), dow = loc.getUTCDay();
      var lu = lunationAt(L, sr + 5 * MIN), tn = tithiNo(new Date(sr + 5 * MIN));
      var day = { date: key, dow: dow, vara: VARA[dow], sunrise: sr, sunset: ss, nextSunrise: nsr,
        tithi: tn, tithiName: tithiName(tn), paksha: paksha(tn), masa: lu ? MASA[lu.month] : null, adhika: !!(lu && lu.adhika),
        nakshatra: NAK[Math.floor(moonSid(new Date(sr + 5 * MIN)) / (360 / 27))], rashi: RASHI[Math.floor(moonSid(new Date(sr + 5 * MIN)) / 30)],
        yoga: YOGA[Math.floor(mod(sunSid(new Date(sr + 5 * MIN)) + moonSid(new Date(sr + 5 * MIN)), 360) / (360 / 27))],
        suryaRashi: RASHI[Math.floor(sunSid(new Date(sr + 5 * MIN)) / 30)], events: [] };
      // fixed holidays
      (fx[y][p2(mo) + '-' + p2(d)] || []).forEach(function (e) { day.events.push(e); });
      // Sankranti: Sun enters a new sidereal rashi between this sunrise and the next (before sunset -> today, after sunset -> tomorrow's date)
      var s0 = Math.floor(sunSid(new Date(sr)) / 30), s1 = Math.floor(sunSid(new Date(ss)) / 30);
      if (s0 !== s1) day.events.push(sankranti(s1, y));
      var prev = days.length ? days[days.length - 1] : null;
      if (prev && prev._pendingSankranti != null) { day.events.push(sankranti(prev._pendingSankranti, y)); }
      var s2 = Math.floor(sunSid(new Date(nsr || sr + DAY)) / 30);
      if (s1 !== s2) day._pendingSankranti = s2;
      // tithi-based festivals
      F.forEach(function (f) {
        var smp = kalaSamples(f[4], sr, ss, nsr || sr + DAY, obs), l2 = lunationAt(L, f[4] === 'sunrise' ? sr + (ss - sr) / 2 : smp[0]);
        if (!l2 || l2.adhika || l2.month !== f[2]) return;
        if (f[0] === 'Raksha Bandhan') {                                     // Purnima at Aparahna and not under Bhadra (Vishti); else the next morning's Purnima
          var pur = smp.some(function (t) { return tithiNo(new Date(t)) === 15; }), clean = smp.some(function (t) { return tithiNo(new Date(t)) === 15 && karanaName(karanaNo(t)) !== 'Vishti'; });
          var prevB = days.length && days[days.length - 1]._rbBhadra;
          day._rbBhadra = pur && !clean;
          if (!(clean || (prevB && tithiNo(new Date(sr + 5 * MIN)) === 15))) return;
        } else if (f[0] === 'Holika Dahan') {                                // Purnima in Pradosh, avoiding Bhadra; if Bhadra covers the whole Pradosh, the next evening
          var purH = smp.some(function (t) { return tithiNo(new Date(t)) === 15; }), cleanH = smp.some(function (t) { return tithiNo(new Date(t)) === 15 && karanaName(karanaNo(t)) !== 'Vishti'; });
          var prevH = days.length && days[days.length - 1]._holBhadra;
          day._holBhadra = purH && !cleanH;
          if (!(cleanH || (prevH && tithiNo(new Date(sr + 5 * MIN)) === 15))) return;
        } else if (f[4] === 'sunrise' ? !udayaOk(f[3], sr, ss, nsr) : !smp.some(function (t) { return tithiNo(new Date(t)) === f[3]; })) return;
        if (lastFired[f[0]] === i - 1) return;                          // tithi present at the kala on two days: first one
        lastFired[f[0]] = i; day.events.push({ name: f[0], type: f[1], note: f[5], gazetted: f[6] });
      });
      // Holi = day after Phalguna Purnima (Holika Dahan)
      if (days.length && days[days.length - 1].events.some(function (e) { return e.name === 'Holika Dahan'; })) day.events.push({ name: 'Holi (Dhulandi)', type: 'festival', note: 'Festival of colours', gazetted: 1 });
      // general vrat / tithi observances
      var nm = lu ? lu.month : null;
      if (lu) {
        var ad = lu.adhika ? ' (Adhika)' : '';
        var ek = udayaOk(11, sr, ss, nsr) ? 11 : (udayaOk(26, sr, ss, nsr) ? 26 : 0), ekPrev = days.length && days[days.length - 1]._ek === ek;
        day._ek = ek;
        if (ek && !ekPrev) day.events.push({ name: (EKADASHI[nm] ? EKADASHI[nm][ek === 11 ? 1 : 0] : '') + ' Ekadashi' + ad, type: 'vrat', note: (ek === 11 ? 'Shukla' : 'Krishna') + ' Ekadashi — fasting day (Vaishnava date may be next day)', gazetted: 0 });
        if (tn === 15) day.events.push({ name: 'Purnima' + ad, type: 'tithi', note: 'Full moon — Satyanarayan Katha, charity', gazetted: 0 });
        if (tn === 30) day.events.push({ name: 'Amavasya' + ad, type: 'tithi', note: 'New moon — Pitru tarpan, charity', gazetted: 0 });
      }
      var n13 = tithiNo(new Date(kalaSamples('pradosh', sr, ss, nsr || sr + DAY, obs)[0]));
      if (n13 === 13 || n13 === 28) day.events.push({ name: 'Pradosh Vrat', type: 'vrat', note: (n13 === 13 ? 'Shukla' : 'Krishna') + ' Trayodashi in Pradosh — Shiva worship', gazetted: 0 });
      var tnn = tithiNo(new Date(kalaSamples('nishita', sr, ss, nsr || sr + DAY, obs)[0]));
      if (tnn === 29 && !day.events.some(function (e) { return e.name === 'Maha Shivaratri'; })) day.events.push({ name: 'Masik Shivaratri', type: 'vrat', note: 'Krishna Chaturdashi at midnight', gazetted: 0 });
      var tmr = tithiNo(new Date(kalaSamples('moonrise', sr, ss, nsr || sr + DAY, obs)[0]));
      if (tmr === 19 && !day.events.some(function (e) { return /Karwa/.test(e.name); })) day.events.push({ name: 'Sankashti Chaturthi', type: 'vrat', note: 'Ganesh fast, broken at moonrise', gazetted: 0 });
      if (tn === 4 && !day.events.some(function (e) { return /Ganesh/.test(e.name); })) day.events.push({ name: 'Vinayaka Chaturthi', type: 'tithi', note: 'Shukla Chaturthi — Ganesh worship', gazetted: 0 });
      // Navratri days (tithi based) and Pitru Paksha
      var mdT = sr + (ss - sr) / 2, luM = lunationAt(L, mdT) || lu, tnM = tithiNo(new Date(mdT));
      if (luM && !luM.adhika && (luM.month === 6 || luM.month === 0) && tnM >= 1 && tnM <= 9) day.events.push({ name: (luM.month === 6 ? 'Sharad' : 'Chaitra') + ' Navratri — Day ' + tnM + ' (' + DEVI[tnM - 1] + ')', type: 'special', note: 'Nine nights of Devi', gazetted: 0 });
      if (lu && !lu.adhika && lu.month === 5 && (tn === 15 || tn > 15)) day.events.push({ name: 'Pitru Paksha — Shraddha of ' + (tn === 15 ? 'Purnima' : tithiName(tn)) + ' tithi', type: 'special', note: 'Ancestor rites fortnight', gazetted: 0 });
      if (lu && lu.adhika) day.events.push({ name: 'Adhika ' + MASA[lu.month] + ' Masa (Purushottam Maas)', type: 'special', note: 'Extra lunar month — no weddings/major new starts', gazetted: 0 });
      day.lunar = lu ? { month: MASA[lu.month], adhika: lu.adhika } : null;
      days.push(day);
    }
    return days;
  }

  /* ---- detail for one day: tithi / nakshatra / karana segments + traditional muhurat timings ---- */
  function detail(day, o) {
    o = o || {}; var sr = day.sunrise, ss = day.sunset, nsr = day.nextSunrise || sr + DAY, dow = day.dow, dd = (ss - sr) / 8, nd = (nsr - ss) / 8;
    var tseg = segments(function (ms) { return tithiNo(new Date(ms)); }, sr, nsr, 15).map(function (s) { return { name: paksha(s.v) + ' ' + tithiName(s.v), from: s.from, to: s.to }; });
    var nseg = segments(function (ms) { return Math.floor(moonSid(new Date(ms)) / (360 / 27)); }, sr, nsr, 30).map(function (s) { return { name: NAK[s.v], from: s.from, to: s.to }; });
    var kseg = segments(karanaNo, sr, nsr, 15).map(function (s) { return { name: karanaName(s.v), from: s.from, to: s.to }; });
    var yseg = segments(function (ms) { return Math.floor(mod(sunSid(new Date(ms)) + moonSid(new Date(ms)), 360) / (360 / 27)); }, sr, nsr, 30).map(function (s) { return { name: YOGA[s.v], from: s.from, to: s.to }; });
    var noon = sr + (ss - sr) / 2, nis = ss + (nsr - ss) / 2, ch = [];
    for (var i = 0; i < 8; i++) { var n1 = CH_DAY[dow][i]; ch.push({ name: n1, from: sr + i * dd, to: sr + (i + 1) * dd, good: CH_GOOD[n1] || 0, night: false }); }
    for (var j = 0; j < 8; j++) { var n2 = CH_NIGHT[dow][j]; ch.push({ name: n2, from: ss + j * nd, to: ss + (j + 1) * nd, good: CH_GOOD[n2] || 0, night: true }); }
    var rk = eighth(sr, ss, RAHU_PART[dow]), ym = eighth(sr, ss, YAMA_PART[dow]), gk = eighth(sr, ss, GULI_PART[dow]);
    var DUR = { 0: [14], 1: [8, 12], 2: [4, 11], 3: [6], 4: [8, 12], 5: [4, 9], 6: [1, 2] };   // classical Durmuhurta slots (muhurta of 1/15 day), 1-based
    var m15 = (ss - sr) / 15;
    return {
      tithi: tseg, nakshatra: nseg, karana: kseg, yoga: yseg,
      brahma: [sr - 96 * MIN, sr - 48 * MIN], abhijit: [noon - 24 * MIN, noon + 24 * MIN], godhuli: [ss - 24 * MIN, ss + 24 * MIN], pradosh: [ss, ss + 144 * MIN], nishita: [nis - 24 * MIN, nis + 24 * MIN],
      rahu: rk, yamaganda: ym, gulika: gk, durmuhurta: DUR[dow].map(function (k) { return [sr + (k - 1) * m15, sr + k * m15]; }),
      choghadiya: ch, bhadra: kseg.filter(function (k) { return k.name === 'Vishti'; }).map(function (k) { return [k.from, k.to]; })
    };
  }

  return { compute: compute, detail: detail, tithiNo: tithiNo, tithiName: tithiName, elong: elong, MASA: MASA, NAK: NAK, YOGA: YOGA, RASHI: RASHI, VARA: VARA, DEVI: DEVI, ayanamsa: ayanamsa, sunSid: sunSid, moonSid: moonSid, lunations: lunations };
});
