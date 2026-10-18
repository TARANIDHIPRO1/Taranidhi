/* TaraNidhi — screen view switcher (Laptop / Tablet / Mobile).
   Shown only on wide screens. Tablet/Mobile load the same page inside a frame of that width, so the
   page's own responsive layout is what you see - exactly as on a real device. */
(function () {
  'use strict';
  var KEY = 'tn_view', MODES = { laptop: 0, tablet: 820, mobile: 412 };
  function get() { try { var v = localStorage.getItem(KEY); return MODES.hasOwnProperty(v) ? v : 'laptop'; } catch (e) { return 'laptop'; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { } }
  var inFrame = false; try { inFrame = window.top !== window.self; } catch (e) { inFrame = true; }
  if (inFrame) return;                         // inside the preview frame: nothing to do
  var wide = Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth : 0) >= 900;
  if (!wide) return;                           // real phone / small window: no switcher
  var mode = get();

  var CSS = '#tn-vsw{position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;gap:2px;padding:3px;border:1px solid rgba(214,181,102,.7);border-radius:999px;background:rgba(8,12,38,.92);backdrop-filter:blur(6px);font:600 12px/1 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.45)}' +
    '#tn-vsw button{all:unset;cursor:pointer;padding:8px 11px;border-radius:999px;color:#e8dcae;white-space:nowrap}' +
    '#tn-vsw button[aria-pressed="true"]{background:linear-gradient(140deg,#d6b566,#b8893a);color:#1a1405}' +
    '#tn-vsw button:focus-visible{outline:2px solid #fff;outline-offset:1px}';
  function bar() {
    return '<div id="tn-vsw" role="group" aria-label="Screen view">' +
      ['laptop:💻 Laptop', 'tablet:📟 Tablet', 'mobile:📱 Mobile'].map(function (s) { var p = s.split(':'); return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (p[0] === mode) + '">' + p[1] + '</button>'; }).join('') + '</div>';
  }
  function wire(root, frame) {
    root.querySelectorAll('#tn-vsw button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v'); set(v);
        var url = location.href;
        try { if (frame && frame.contentWindow) url = frame.contentWindow.location.href; } catch (e) { }
        if (url === location.href) location.reload(); else location.href = url;
      });
    });
  }

  if (mode === 'laptop') {
    document.addEventListener('DOMContentLoaded', function () {
      var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      var w = document.createElement('div'); w.innerHTML = bar(); document.body.appendChild(w.firstChild); wire(document);
    });
    return;
  }

  // Tablet / Mobile: open the framed wrapper page with this page inside it.
  var here = location.pathname + location.search + location.hash;
  location.replace('/tn-frame.html?p=' + encodeURIComponent(here));
})();
