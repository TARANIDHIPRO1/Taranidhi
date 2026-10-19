/* TaraNidhi — app shell.
   Wide screens: one fixed left sidebar (pages, theme, device view, language, account, plan, support, social).
   Narrow screens: existing drawer layout stays; a small language button is added to the header. */
(function () {
  'use strict';
  var API = 'https://occultviision-api.occultviision.workers.dev';
  var TOKEN_KEY = 'tn_session_token', PHONE_KEY = 'tn_session_phone';
  var PAGES = [
    ['index.html', '✧', 'NOW'], ['today.html', '▦', 'Today'], ['calendar.html', '🗓', 'Utsav Calendar'], ['kundali.html', '▦', 'Kundali'],
    ['panchang.html', '▤', 'Panchang'], ['hora-lagna.html', '◷', 'Hora & Uphora'], ['star-time.html', '◉', 'Star Time'], ['moment.html', '◌', 'Moment'],
    ['muhurta.html', '✦', 'Muhurta Finder'], ['query.html', '?', 'Astrological Query'], ['my-cosmos.html', '♙', 'My Cosmos'],
    ['astrologer.html', '☸', 'Astrologer & Enquiry'], ['vehicle.html', '🚗', 'Vehicle Number & Colour'], ['advertisement.html', '▣', 'Advertisement'], ['offer.html', '✧', 'Offers'],
    ['offers.html', '✧', 'Special Offers'], ['personal-branding.html', '♙', 'My Brand'], ['about.html', 'ℹ', 'About']
  ];
  var DEVICES = [['laptop', '💻', 'Laptop'], ['tablet', '📟', 'Tablet'], ['mobile', '📱', 'Mobile']];
  var THEMES = [['cosmic-blue', 'Cosmic Blue', '#171b5a'], ['emerald', 'Dark Emerald', '#06452f'], ['cream-maroon', 'Cream + Maroon', '#f5efdf'], ['cream-coffee', 'Cream + Coffee', '#f4eddf'], ['divine-vermilion', 'Cream + Vermilion', '#fff0d8']];
  var SOCIAL = { youtube_url: ['▶', 'YouTube'], instagram_url: ['◎', 'Instagram'], facebook_url: ['f', 'Facebook'], x_url: ['𝕏', 'X'], telegram_url: ['✈', 'Telegram'], website_url: ['🌐', 'Website'] };

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; }
  function api(path, opts) {
    opts = opts || {}; var h = { 'Content-Type': 'application/json' }, t = ls(TOKEN_KEY); if (t) h.Authorization = 'Bearer ' + t;
    return fetch(API + path, { method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); })
      .catch(function () { return { ok: false, status: 0, body: {} }; });
  }
  var here = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  function isHere(f) { return f.replace(/\.html$/, '') === (here === '' ? 'index' : here); }

  var wide = (window.innerWidth || 0) >= 900 && window.top === window.self;

  var CSS = '' +
    '#tn-side{position:fixed;top:0;left:0;bottom:0;width:264px;z-index:1000;display:flex;flex-direction:column;gap:2px;padding:12px 10px 14px;overflow-y:auto;background:#0a0f33;color:#f3ecd8;border-right:1px solid #d9c9ff55;font:500 13px/1.3 "DM Sans",system-ui,sans-serif;box-sizing:border-box}' +
    '#tn-side .sd-logo{display:block;margin:0 auto 8px;width:170px;height:78px}#tn-side .sd-logo img{width:100%;height:100%;object-fit:contain}' +
    '#tn-side a.sd-link{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;color:inherit;text-decoration:none;border:1px solid transparent}' +
    '#tn-side a.sd-link:hover{border-color:#d9c9ff55}#tn-side a.sd-link[aria-current="page"]{background:linear-gradient(140deg,#ffdc83,#f6b83f);color:#1a1405;font-weight:700}' +
    '#tn-side .sd-ic{width:18px;text-align:center}' +
    '#tn-side h4{margin:12px 6px 4px;font:700 10px/1 inherit;letter-spacing:.14em;text-transform:uppercase;color:#ffdc83;opacity:.9}' +
    '#tn-side .sd-row{display:flex;flex-wrap:wrap;gap:4px;padding:0 4px}' +
    '#tn-side .sd-btn{all:unset;box-sizing:border-box;cursor:pointer;padding:7px 9px;border-radius:999px;border:1px solid #d9c9ff55;font-size:12px;white-space:nowrap}' +
    '#tn-side .sd-btn[aria-pressed="true"]{background:linear-gradient(140deg,#ffdc83,#f6b83f);color:#1a1405;font-weight:700;border-color:transparent}' +
    '#tn-side .sd-btn:focus-visible,#tn-side a:focus-visible{outline:2px solid #ffdc83;outline-offset:1px}' +
    '#tn-side .sd-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;border:1px solid #8884;vertical-align:-1px}' +
    '#tn-side .sd-card{margin:2px 4px;padding:9px 10px;border:1px solid #d9c9ff55;border-radius:12px;font-size:12px}' +
    '#tn-side .sd-card b{display:block;font-size:13px}#tn-side .sd-muted{opacity:.8}' +
    '#tn-side .sd-cta{all:unset;box-sizing:border-box;display:block;text-align:center;cursor:pointer;margin:6px 4px 0;padding:9px;border-radius:10px;background:linear-gradient(140deg,#ffdc83,#f6b83f);color:#1a1405;font-weight:700}' +
    '#tn-side .sd-ghost{all:unset;box-sizing:border-box;display:block;text-align:center;cursor:pointer;margin:6px 4px 0;padding:8px;border-radius:10px;border:1px solid #d9c9ff55}' +
    '#tn-side .sd-btn,#tn-side a,#tn-side .sd-ghost,#tn-side .sd-card,#tn-side h4{color:#f3ecd8!important}#tn-side .sd-btn[aria-pressed="true"],#tn-side .sd-cta,#tn-side a.sd-link[aria-current="page"],#tn-side a.sd-cta{color:#1a1405!important}#tn-side h4{color:#ffdc83!important}' +
    'html[data-theme^="cream"] .submit-btn,html[data-theme="divine-vermilion"] .submit-btn{color:#fff!important}' +
    'body.tn-has-side{padding-left:264px}' +
    'body.tn-has-side .header,body.tn-has-side .theme-picker,body.tn-has-side .bottom-nav,body.tn-has-side .nav-tabs,body.tn-has-side .tn-drawer-backdrop{display:none!important}' +
    '#tn-modal{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '#tn-modal .box{width:min(380px,100%);background:#0a0f33;color:#f3ecd8;border:1px solid #d9c9ff55;border-radius:16px;padding:18px;font:14px/1.4 system-ui,sans-serif}' +
    '#tn-modal input{width:100%;box-sizing:border-box;padding:10px;margin:6px 0 10px;border-radius:10px;border:1px solid #d9c9ff55;background:transparent;color:inherit;font-size:15px}' +
    '#tn-lang-mini{all:unset;cursor:pointer;margin-left:auto;margin-right:8px;padding:7px 10px;border-radius:999px;border:1px solid #d9c9ff55;font:600 12px system-ui,sans-serif;color:inherit}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  function setTheme(id) { var b = document.querySelector('.theme-choice[data-theme-choice="' + id + '"]'); if (b) b.click(); else { document.documentElement.dataset.theme = id; document.body.dataset.theme = id; ls('taranidhi-public-theme', id); } syncPressed(); }
  function curTheme() { return ls('taranidhi-public-theme') || 'cosmic-blue'; }
  function curDevice() { var v = ls('tn_view'); return /^(tablet|mobile)$/.test(v || '') ? v : 'laptop'; }
  function curLang() { return ls('tn_lang') === 'hi' ? 'hi' : 'en'; }
  function setLang(l) { ls('tn_lang', l); if (window.tnLang) window.tnLang.set(l); syncPressed(); var m = $('#tn-lang-mini'); if (m) m.textContent = l === 'hi' ? 'EN' : 'हिं'; }
  function syncPressed() {
    var s = $('#tn-side'); if (!s) return;
    s.querySelectorAll('[data-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme') === curTheme())); });
    s.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === curLang())); });
    s.querySelectorAll('[data-dev]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-dev') === curDevice())); });
  }

  /* ---------- account / plan ---------- */
  var cfg = {};
  function accountHtml() {
    var phone = ls(PHONE_KEY), tok = ls(TOKEN_KEY);
    if (!tok) return '<div class="sd-card"><b>Not logged in</b><span class="sd-muted">Log in with your mobile to save kundalis and use all tools.</span></div><button type="button" class="sd-cta" id="sd-login">Log in / Register</button>';
    return '<div class="sd-card" id="sd-acct"><b>+91 ' + esc(phone || '') + '</b><span class="sd-muted" id="sd-plan">Plan: …</span><br><span class="sd-muted" id="sd-wallet">Wallet: …</span></div>' +
      '<a class="sd-cta" id="sd-upgrade" href="astrologer.html#plans" style="text-decoration:none">Upgrade / Add points</a><button type="button" class="sd-ghost" id="sd-logout">Log out</button>';
  }
  function loadAcct() {
    if (!ls(TOKEN_KEY)) return;
    api('/wallet/balance').then(function (r) {
      var w = $('#sd-wallet'); if (!w) return;
      if (r.status === 401) { ls(TOKEN_KEY, null); renderAcct(); return; }
      if (r.ok) w.textContent = 'Wallet: ' + (r.body.balance == null ? '—' : r.body.balance) + ' points';
    });
    api('/kundali').then(function (r) { var p = $('#sd-plan'); if (p && r.ok) p.textContent = 'Saved kundalis: ' + ((r.body.kundalis || []).length); });
  }
  function renderAcct() { var h = $('#sd-account'); if (!h) return; h.innerHTML = accountHtml(); wireAcct(); loadAcct(); }
  function wireAcct() {
    var li = $('#sd-login'), lo = $('#sd-logout');
    if (li) li.addEventListener('click', loginModal);
    if (lo) lo.addEventListener('click', function () { ls(TOKEN_KEY, null); ls(PHONE_KEY, null); location.reload(); });
  }
  function loginModal() {
    var m = document.createElement('div'); m.id = 'tn-modal';
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-label="Log in"><h3 style="margin:0 0 8px">Log in / Register</h3><label>Mobile (10-digit)</label><input id="lm-phone" type="tel" inputmode="numeric" maxlength="14" value="' + esc(ls(PHONE_KEY) || '') + '"><button type="button" class="sd-cta" id="lm-send">SEND OTP</button>' +
      '<div id="lm-step" hidden><label>OTP</label><input id="lm-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><button type="button" class="sd-cta" id="lm-go">VERIFY</button></div><p id="lm-msg" style="min-height:18px;font-size:12px"></p><button type="button" class="sd-ghost" id="lm-x">Close</button></div>';
    document.body.appendChild(m);
    function say(t) { $('#lm-msg', m).textContent = t; }
    function norm(s) { return String(s || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, ''); }
    var phone = '';
    $('#lm-x', m).onclick = function () { m.remove(); };
    $('#lm-send', m).onclick = function () {
      phone = norm($('#lm-phone', m).value); if (!/^[6-9]\d{9}$/.test(phone)) { say('Enter a valid 10-digit Indian mobile number.'); return; }
      say('Sending OTP …'); api('/auth/request-otp', { method: 'POST', body: { phone_number: phone } }).then(function (r) { if (!r.ok) { say(r.body.error || 'Could not send OTP.'); return; } $('#lm-step', m).hidden = false; say('OTP sent. Enter it below.'); $('#lm-otp', m).focus(); });
    };
    $('#lm-go', m).onclick = function () {
      var code = $('#lm-otp', m).value.trim(); if (!/^\d{4,8}$/.test(code)) { say('Enter the OTP.'); return; }
      var fp = 'web-' + (navigator.userAgent || '').length + '-' + screen.width + 'x' + screen.height;
      (crypto.subtle ? crypto.subtle.digest('SHA-256', new TextEncoder().encode(fp)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }) : Promise.resolve('0'.repeat(64)))
        .then(function (h) { return api('/auth/verify-otp', { method: 'POST', body: { phone_number: phone, code: code, fingerprint_hash: h } }); })
        .then(function (v) { if (!v.ok || !v.body.session_token) { say(v.body.error || 'Wrong or expired OTP.'); return; } ls(TOKEN_KEY, v.body.session_token); ls(PHONE_KEY, phone); location.reload(); });
    };
  }

  /* ---------- build ---------- */
  function supportHtml() {
    var wa = cfg.whatsapp_number, ph = cfg.contact_phone, em = cfg.contact_email, out = '';
    if (wa) out += '<a class="sd-link" href="https://wa.me/' + esc(String(wa).replace(/\D/g, '')) + '?text=' + encodeURIComponent('Namaste, I need help with TaraNidhi.') + '" target="_blank" rel="noopener"><span class="sd-ic">💬</span>WhatsApp support</a>';
    if (ph) out += '<a class="sd-link" href="tel:+' + esc(String(ph).replace(/\D/g, '')) + '"><span class="sd-ic">📞</span>+' + esc(String(ph).replace(/^91(\d{5})(\d{5})$/, '91 $1 $2')) + '</a>';
    if (em) out += '<a class="sd-link" href="mailto:' + esc(em) + '"><span class="sd-ic">✉</span>' + esc(em) + '</a>';
    var soc = ''; Object.keys(SOCIAL).forEach(function (k) { if (cfg[k]) soc += '<a class="sd-btn" href="' + esc(cfg[k]) + '" target="_blank" rel="noopener" style="text-decoration:none" aria-label="' + SOCIAL[k][1] + '">' + SOCIAL[k][0] + ' ' + SOCIAL[k][1] + '</a>'; });
    return out + (soc ? '<div class="sd-row" style="margin-top:4px">' + soc + '</div>' : '');
  }
  function build() {
    if (!wide) { narrow(); return; }
    document.body.classList.add('tn-has-side');
    var logo = $('.header .logo img'), s = document.createElement('aside'); s.id = 'tn-side'; s.setAttribute('aria-label', 'TaraNidhi menu');
    s.innerHTML = '<a class="sd-logo" href="index.html" aria-label="TaraNidhi home">' + (logo ? '<img src="' + logo.src + '" alt="TaraNidhi">' : '') + '</a>' +
      '<nav aria-label="Pages">' + PAGES.map(function (p) { return '<a class="sd-link" href="' + p[0] + '"' + (isHere(p[0]) ? ' aria-current="page"' : '') + '><span class="sd-ic">' + p[1] + '</span><span>' + esc(p[2]) + '</span></a>'; }).join('') + '</nav>' +
      '<h4>Color Theme</h4><div class="sd-row">' + THEMES.map(function (t) { return '<button type="button" class="sd-btn" data-theme="' + t[0] + '" aria-pressed="false"><span class="sd-dot" style="background:' + t[2] + '"></span>' + t[1] + '</button>'; }).join('') + '</div>' +
      '<h4>Language / भाषा</h4><div class="sd-row"><button type="button" class="sd-btn" data-lang="en" aria-pressed="false">English</button><button type="button" class="sd-btn" data-lang="hi" aria-pressed="false">हिन्दी</button></div>' +
      '<h4>Device view</h4><div class="sd-row">' + DEVICES.map(function (d) { return '<button type="button" class="sd-btn" data-dev="' + d[0] + '" aria-pressed="false">' + d[1] + ' ' + d[2] + '</button>'; }).join('') + '</div>' +
      '<h4>Account</h4><div id="sd-account">' + accountHtml() + '</div>' +
      '<h4>Support</h4><div id="sd-support"></div>';
    document.body.appendChild(s);
    s.addEventListener('click', function (e) {
      var t = e.target.closest('[data-theme]'), l = e.target.closest('[data-lang]'), d = e.target.closest('[data-dev]');
      if (t) setTheme(t.getAttribute('data-theme'));
      if (l) setLang(l.getAttribute('data-lang'));
      if (d && window.tnSetView) window.tnSetView(d.getAttribute('data-dev'));
    });
    wireAcct(); loadAcct(); syncPressed();
    setTimeout(syncPressed, 400);
  }
  function narrow() {
    var h = $('.header'); if (!h || $('#tn-lang-mini')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'tn-lang-mini'; b.setAttribute('aria-label', 'Change language');
    b.textContent = curLang() === 'hi' ? 'EN' : 'हिं'; b.onclick = function () { setLang(curLang() === 'hi' ? 'en' : 'hi'); };
    var trig = h.querySelector('.page-menu-trigger'); h.insertBefore(b, trig || null);
  }
  function loadCfg() {
    return fetch(API + '/public/config').then(function (r) { return r.json(); }).then(function (j) { cfg = j || {}; var el = $('#sd-support'); if (el) el.innerHTML = supportHtml(); }).catch(function () { });
  }

  function start() {
    // wait for the page's own scripts (theme picker / drawer) to have run
    setTimeout(function () { build(); loadCfg(); if (window.tnLang) window.tnLang.set(curLang()); }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
