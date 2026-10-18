/* TaraNidhi — Astrologer desk: services, plans, enquiry form -> D1 (/public/contact) + optional Google Sheet webhook. */
(function () {
  'use strict';
  var API = 'https://occultviision-api.occultviision.workers.dev', root = document.getElementById('tn-astro'); if (!root) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var TOPICS = [['kundali', 'Kundali reading'], ['muhurta-marriage', 'Muhurta — Marriage'], ['muhurta-property', 'Muhurta — Property'], ['muhurta-business', 'Muhurta — Business'], ['muhurta-medical', 'Muhurta — Medical'], ['numerology', 'Numerology'], ['vastu', 'Vastu'], ['subscription', 'Plans / Subscription'], ['b2b', 'Business / Partnership enquiry'], ['other', 'Other']];
  var PLANS = [['Basic', 'Free', ['Live Panchang & Hora/Uphora', 'Utsav Calendar', '1 saved kundali']], ['Premium', 'Contact for price', ['Unlimited kundalis & charts', 'Muhurta scan with personal Tara', 'KP Prashna & Query windows', 'Priority WhatsApp support']], ['Business', 'Contact for price', ['Muhurta for business & staff', 'Branding & advertisement slots', 'API / bulk access']]];
  var cfg = {};
  function wa(msg) { return 'https://wa.me/' + (cfg.whatsapp_number || '919669756111') + '?text=' + encodeURIComponent(msg); }
  function draw() {
    root.innerHTML =
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">✦</span><h2>CONSULT THE ASTROLOGER</h2></div></div>' +
      '<p class="card-subtitle"><b>OCCULTVIISION</b> — Bhopal. Vedic &amp; KP astrology, muhurta, vastu and numerology. Reply is usually within a working day.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px"><a class="submit-btn" style="text-decoration:none;display:inline-block;width:auto;padding:10px 16px" href="' + wa('Namaste, I want to consult from TaraNidhi.') + '" target="_blank" rel="noopener">💬 WhatsApp</a>' +
      '<a class="pill" href="tel:+' + esc(cfg.contact_phone || '919669756111') + '">📞 +' + esc(cfg.contact_phone || '919669756111') + '</a>' +
      '<a class="pill" href="mailto:' + esc(cfg.contact_email || 'info@occultviision.com') + '">✉ ' + esc(cfg.contact_email || 'info@occultviision.com') + '</a></div></section>' +
      '<section class="panel" id="plans"><div class="panel-title"><div class="title-left"><span class="round-icon">★</span><h2>PLANS</h2></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">' +
      PLANS.map(function (p) { return '<div style="border:1px solid #d9c9ff6b;border-radius:14px;padding:12px"><h3 class="card-title" style="text-align:left;margin:0">' + p[0] + '</h3><div style="color:#ffdc83;margin:4px 0 8px">' + p[1] + '</div><ul style="padding-left:18px;margin:0 0 10px;font-size:13px">' + p[2].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' + (p[0] === 'Basic' ? '' : '<a class="pill" target="_blank" rel="noopener" href="' + wa('I want the ' + p[0] + ' plan on TaraNidhi.') + '">Ask on WhatsApp</a>') + '</div>'; }).join('') +
      '</div><p class="card-subtitle">Online payment is not switched on yet — activation is done on WhatsApp for now.</p></section>' +
      '<section class="panel"><div class="panel-title"><div class="title-left"><span class="round-icon">✉</span><h2>ENQUIRY FORM</h2></div></div>' +
      '<form id="enq" novalidate><div style="position:absolute;left:-9999px" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>' +
      '<div class="form-row"><div class="form-group"><label for="e-n">Name</label><input id="e-n" name="name" required autocomplete="name"></div><div class="form-group"><label for="e-p">Mobile (10-digit)</label><input id="e-p" name="phone" inputmode="numeric" maxlength="14" required autocomplete="tel"></div></div>' +
      '<div class="form-row"><div class="form-group"><label for="e-e">Email (optional)</label><input id="e-e" name="email" type="email" autocomplete="email"></div><div class="form-group"><label for="e-t">Topic</label><select id="e-t" name="topic">' + TOPICS.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="form-row"><div class="form-group"><label for="e-c">Company (business enquiry)</label><input id="e-c" name="company"></div><div class="form-group"><label for="e-ci">City</label><input id="e-ci" name="city"></div></div>' +
      '<div class="form-group"><label for="e-m">Message</label><textarea id="e-m" name="message" rows="4" maxlength="1000"></textarea></div>' +
      '<button class="submit-btn" type="submit">SEND ENQUIRY</button><div id="e-out" class="result-box" style="display:none;margin-top:10px" role="status"></div></form></section>';
    document.getElementById('enq').addEventListener('submit', submit);
  }
  function submit(ev) {
    ev.preventDefault();
    var f = ev.target, out = document.getElementById('e-out'), v = function (n) { return (f.elements[n].value || '').trim(); };
    out.style.display = 'block';
    var ph = v('phone').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (v('name').length < 2) { out.textContent = 'Please enter your name.'; return; }
    if (!/^[6-9]\d{9}$/.test(ph)) { out.textContent = 'Enter a valid 10-digit Indian mobile number.'; return; }
    var extra = [v('company') && 'Company: ' + v('company'), v('city') && 'City: ' + v('city'), v('email') && 'Email: ' + v('email')].filter(Boolean).join(' | ');
    var msg = (extra ? extra + '\n' : '') + v('message');
    out.textContent = 'Sending …'; f.querySelector('button').disabled = true;
    fetch(API + '/public/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v('name'), phone: ph, topic: v('topic'), message: msg.slice(0, 1000), website: v('website') }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        f.querySelector('button').disabled = false;
        if (!r.ok) { out.textContent = r.j.error || 'Could not send. Please use WhatsApp.'; return; }
        if (cfg.sheet_webhook_url) { try { fetch(cfg.sheet_webhook_url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind: 'enquiry', name: v('name'), phone: ph, email: v('email'), topic: v('topic'), company: v('company'), city: v('city'), message: v('message') }) }); } catch (e) { } }
        out.innerHTML = '✅ Enquiry received (ref #' + esc(r.j.id) + '). We will contact you on +91 ' + esc(ph) + '. <a href="' + wa('Hello, I sent enquiry #' + r.j.id + ' from TaraNidhi.') + '" target="_blank" rel="noopener">Message us on WhatsApp</a>';
        f.reset();
      }).catch(function () { f.querySelector('button').disabled = false; out.textContent = 'Network error. Please try again or use WhatsApp.'; });
  }
  draw();
  fetch(API + '/public/config').then(function (r) { return r.json(); }).then(function (c) { cfg = c || {}; draw(); }).catch(function () { });
})();
