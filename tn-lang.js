/* TaraNidhi — English / Hindi UI switcher.
   Translates interface labels and astrological names (planets, signs, tithis, nakshatras, yogas, karanas, weekdays, months).
   Long explanatory sentences returned by the calculation engine stay in English. */
(function () {
  'use strict';
  var D = {"NOW": "अभी", "Today": "आज", "Utsav Calendar": "उत्सव पंचांग कैलेंडर", "Kundali": "कुंडली", "Panchang": "पंचांग", "Hora & Uphora": "होरा एवं उपहोरा", "Star Time": "नक्षत्र समय", "Moment": "क्षण", "Muhurta Finder": "मुहूर्त खोजक", "Muhurta": "मुहूर्त", "Astrological Query": "ज्योतिष प्रश्न", "Query": "प्रश्न", "My Cosmos": "मेरा ब्रह्मांड", "Astrologer & Enquiry": "ज्योतिषी एवं पूछताछ", "Advertisement": "विज्ञापन", "Offers": "ऑफ़र", "Special Offers": "विशेष ऑफ़र", "My Brand": "मेरा ब्रांड", "About": "परिचय", "All Pages": "सभी पेज", "Pages": "पेज", "Close": "बंद करें", "Log out": "लॉग आउट", "Log in / Register": "लॉग इन / रजिस्टर", "Color Theme": "रंग थीम", "Language": "भाषा", "Device view": "डिवाइस व्यू", "Laptop": "लैपटॉप", "Tablet": "टैबलेट", "Mobile": "मोबाइल", "Account": "खाता", "Support": "सहायता", "WhatsApp support": "व्हाट्सऐप सहायता", "Upgrade / Add points": "अपग्रेड / पॉइंट जोड़ें", "YOUR LOCATION": "आपका स्थान", "REFRESH ↻": "रीफ़्रेश ↻", "City": "शहर", "SET CITY": "शहर सेट करें", "📍 USE MY GPS LOCATION": "📍 मेरा GPS स्थान उपयोग करें", "PANCHANG ELEMENTS": "पंचांग के अंग", "5 ELEMENTS": "5 अंग", "Tithi": "तिथि", "Nakshatra": "नक्षत्र", "Yoga": "योग", "Karana": "करण", "Vara": "वार", "DAY DETAILS": "दिन का विवरण", "Sunrise": "सूर्योदय", "Sunset": "सूर्यास्त", "Sun sign": "सूर्य राशि", "Moon sign": "चंद्र राशि", "Masa · Paksha": "मास · पक्ष", "AUSPICIOUS & INAUSPICIOUS TIMES": "शुभ एवं अशुभ समय", "Period": "समय-खंड", "Time": "समय", "Rahu Kaal": "राहु काल", "Yamghanda · Gulika": "यमघंट · गुलिक", "Abhijit Muhurta": "अभिजित मुहूर्त", "Durmuhurta": "दुर्मुहूर्त", "Choghadiya": "चौघड़िया", "YOUR COSMIC MOMENT": "आपका ब्रह्मांडीय क्षण", "LIVE": "लाइव", "BEST WINDOW": "सर्वोत्तम समय", "MOMENT SCORE": "क्षण स्कोर", "PANCHANG SNAPSHOT": "पंचांग झलक", "STAR TIME": "नक्षत्र समय", "CURRENT HORA": "वर्तमान होरा", "HORA STRENGTH": "होरा बल", "LAGNA (NOW)": "लग्न (अभी)", "PANCHA PAKSHI": "पंच पक्षी", "HORA FOR YOUR PURPOSE": "आपके उद्देश्य के लिए होरा", "Purpose": "उद्देश्य", "General": "सामान्य", "Business": "व्यापार", "Travel": "यात्रा", "Marriage": "विवाह", "Finance": "धन", "Property": "संपत्ति", "Medical": "चिकित्सा", "Education": "शिक्षा", "Legal": "कानूनी", "Spiritual": "आध्यात्मिक", "HORA & UPHORA — FULL DAY": "होरा एवं उपहोरा — पूरा दिन", "DAY HORAS (1–12)": "दिन के होरा (1–12)", "NIGHT HORAS (13–24)": "रात के होरा (13–24)", "Hora lord": "होरा स्वामी", "Planetary hour": "ग्रह होरा", "Current Uphora (sub-hour)": "वर्तमान उपहोरा", "Sub-lord": "उप-स्वामी", "Nature": "स्वभाव", "No.": "क्रम", "From": "से", "To": "तक", "Tap any hora to open its 7 uphoras.": "किसी भी होरा पर टैप करें, उसके 7 उपहोरा खुलेंगे।", "▲ Benefic": "▲ शुभ", "▼ Malefic": "▼ अशुभ", "● Neutral": "● सम", "BIRTH DETAILS": "जन्म विवरण", "GENERATE KUNDALI": "कुंडली बनाएँ", "🔮 GENERATE KUNDALI": "🔮 कुंडली बनाएँ", "Date of Birth * (DD/MM/YYYY)": "जन्म तिथि * (DD/MM/YYYY)", "Time of Birth * (hh:mm)": "जन्म समय * (hh:mm)", "Jatak Ka Nam (Name) *": "जातक का नाम *", "State *": "राज्य *", "Country *": "देश *", "City *": "शहर *", "Mobile Number *": "मोबाइल नंबर *", "CHART PREVIEW": "चार्ट पूर्वावलोकन", "RASHI CHART (JANMA KUNDALI)": "राशि चार्ट (जन्म कुंडली)", "GOCHAR (TRANSIT NOW)": "गोचर (वर्तमान)", "NORTH INDIAN": "उत्तर भारतीय", "SOUTH INDIAN": "दक्षिण भारतीय", "PLANETS": "ग्रह", "HOUSE CUSPS (KP)": "भाव संधि (KP)", "SAVED KUNDALIS": "सहेजी कुंडलियाँ", "Lagna": "लग्न", "Moon": "चंद्र", "Janma Nakshatra": "जन्म नक्षत्र", "Dasha now": "वर्तमान दशा", "Tara today": "आज की तारा", "Planet": "ग्रह", "Sign": "राशि", "House": "भाव", "KP sub": "KP उप", "View": "देखें", "Delete": "हटाएँ", "Sun": "सूर्य", "Mars": "मंगल", "Mercury": "बुध", "Jupiter": "गुरु", "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु", "Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन", "Cancer": "कर्क", "Leo": "सिंह", "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक", "Sagittarius": "धनु", "Capricorn": "मकर", "Aquarius": "कुम्भ", "Pisces": "मीन", "Mesha": "मेष", "Vrishabha": "वृषभ", "Mithuna": "मिथुन", "Karka": "कर्क", "Simha": "सिंह", "Kanya": "कन्या", "Tula": "तुला", "Vrischika": "वृश्चिक", "Dhanu": "धनु", "Makara": "मकर", "Kumbha": "कुम्भ", "Meena": "मीन", "Ravivar (Sunday)": "रविवार", "Somvar (Monday)": "सोमवार", "Mangalvar (Tuesday)": "मंगलवार", "Budhvar (Wednesday)": "बुधवार", "Guruvar (Thursday)": "गुरुवार", "Shukravar (Friday)": "शुक्रवार", "Shanivar (Saturday)": "शनिवार", "Sunday": "रविवार", "Monday": "सोमवार", "Tuesday": "मंगलवार", "Wednesday": "बुधवार", "Thursday": "गुरुवार", "Friday": "शुक्रवार", "Saturday": "शनिवार", "Shukla": "शुक्ल", "Krishna": "कृष्ण", "Pratipada": "प्रतिपदा", "Dwitiya": "द्वितीया", "Tritiya": "तृतीया", "Chaturthi": "चतुर्थी", "Panchami": "पंचमी", "Shashthi": "षष्ठी", "Saptami": "सप्तमी", "Ashtami": "अष्टमी", "Navami": "नवमी", "Dashami": "दशमी", "Ekadashi": "एकादशी", "Dwadashi": "द्वादशी", "Trayodashi": "त्रयोदशी", "Chaturdashi": "चतुर्दशी", "Purnima": "पूर्णिमा", "Amavasya": "अमावस्या", "Ashwini": "अश्विनी", "Bharani": "भरणी", "Krittika": "कृत्तिका", "Rohini": "रोहिणी", "Mrigashira": "मृगशिरा", "Ardra": "आर्द्रा", "Punarvasu": "पुनर्वसु", "Pushya": "पुष्य", "Ashlesha": "आश्लेषा", "Magha": "मघा", "Purva Phalguni": "पूर्वा फाल्गुनी", "Uttara Phalguni": "उत्तरा फाल्गुनी", "Hasta": "हस्त", "Chitra": "चित्रा", "Swati": "स्वाति", "Vishakha": "विशाखा", "Anuradha": "अनुराधा", "Jyeshtha": "ज्येष्ठा", "Mula": "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", "Shravana": "श्रावण", "Dhanishtha": "धनिष्ठा", "Shatabhisha": "शतभिषा", "Purva Bhadrapada": "पूर्वा भाद्रपद", "Uttara Bhadrapada": "उत्तरा भाद्रपद", "Revati": "रेवती", "Vishkambha": "विष्कम्भ", "Priti": "प्रीति", "Ayushman": "आयुष्मान", "Saubhagya": "सौभाग्य", "Shobhana": "शोभन", "Atiganda": "अतिगंड", "Sukarma": "सुकर्मा", "Dhriti": "धृति", "Shula": "शूल", "Ganda": "गंड", "Vriddhi": "वृद्धि", "Dhruva": "ध्रुव", "Vyaghata": "व्याघात", "Harshana": "हर्षण", "Vajra": "वज्र", "Siddhi": "सिद्धि", "Vyatipata": "व्यतीपात", "Variyana": "वरीयान", "Parigha": "परिघ", "Shiva": "शिव", "Siddha": "सिद्ध", "Sadhya": "साध्य", "Shubha": "शुभ", "Brahma": "ब्रह्म", "Indra": "इंद्र", "Vaidhriti": "वैधृति", "Bava": "बव", "Balava": "बालव", "Kaulava": "कौलव", "Taitila": "तैतिल", "Gara": "गर", "Vanija": "वणिज", "Vishti": "विष्टि", "Shakuni": "शकुनि", "Chatushpada": "चतुष्पाद", "Naga": "नाग", "Kimstughna": "किंस्तुघ्न", "Chaitra": "चैत्र", "Vaishakha": "वैशाख", "Ashadha": "आषाढ़", "Bhadrapada": "भाद्रपद", "Ashwin": "आश्विन", "Ashwija": "आश्विन", "Kartika": "कार्तिक", "Margashirsha": "मार्गशीर्ष", "Pausha": "पौष", "Phalguna": "फाल्गुन", "Benefic": "शुभ", "Malefic": "अशुभ", "Neutral": "सम", "neutral": "सम", "benefic": "शुभ", "malefic": "अशुभ", "day": "दिन", "night": "रात", "Now": "अभी", "Excellent": "उत्तम", "Good": "अच्छा", "Fair": "सामान्य", "Poor": "कमज़ोर", "Login": "लॉगिन", "SEND OTP": "OTP भेजें", "VERIFY & CONTINUE": "सत्यापित करें और आगे बढ़ें", "LOGIN TO SEE LIVE DATA": "लाइव डेटा देखने के लिए लॉगिन करें", "SET YOUR LOCATION": "अपना स्थान सेट करें", "Mobile *": "मोबाइल *", "Festivals": "त्योहार", "Holidays": "अवकाश", "National holidays": "राष्ट्रीय अवकाश", "Vrat & Tithi": "व्रत एवं तिथि", "Traditional Muhurat": "पारंपरिक मुहूर्त", "TaraNidhi Window": "तारानिधि विंडो", "Month": "माह", "Name": "नाम", "Phone": "फ़ोन", "Message": "संदेश", "Email": "ईमेल", "Submit": "भेजें", "Business enquiry": "व्यापार पूछताछ", "January": "जनवरी", "February": "फ़रवरी", "March": "मार्च", "April": "अप्रैल", "May": "मई", "June": "जून", "July": "जुलाई", "August": "अगस्त", "September": "सितंबर", "October": "अक्टूबर", "November": "नवंबर", "December": "दिसंबर", "hora": "होरा", "uphora": "उपहोरा", "Uphora": "उपहोरा", "Hora": "होरा", "Gulika": "गुलिक"};
  var SKIP_TOKEN = /^(from|to|time|name|nature|house|sign|day|night|good|fair|poor|city|close|about|query|account|support|message|email|phone|submit|month|period|status|score|login|general|business|travel|property|medical|education|legal|finance|marriage|spiritual|mobile|tablet|laptop|view|delete|planet|language|pages|offers|kundali|moon)$/i;
  var map = {}, tokens = [];
  Object.keys(D).forEach(function (k) { map[k.toLowerCase()] = D[k]; if (/^[A-Za-z ]+$/.test(k) && k.length >= 3 && !SKIP_TOKEN.test(k)) tokens.push(k); });
  tokens.sort(function (a, b) { return b.length - a.length; });
  var TOKEN_RE = tokens.length ? new RegExp('\\b(' + tokens.join('|') + ')\\b', 'g') : null;
  var lang = 'en', orig = new Map(), obs = null, busy = false;
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 0, NOSCRIPT: 1 };

  function tr(s) {
    var t = s.trim(); if (!t) return s;
    var hit = map[t.toLowerCase()];
    if (hit) return s.replace(t, hit);
    if (t.length <= 110 && TOKEN_RE) { var out = s.replace(TOKEN_RE, function (m) { return map[m.toLowerCase()] || m; }); return out; }
    return s;
  }
  function okNode(n) { var p = n.parentNode; while (p && p.nodeType === 1) { if (SKIP_TAG[p.tagName] || p.hasAttribute('data-notrans')) return false; p = p.parentNode; } return true; }
  function doText(n) {
    if (!okNode(n)) return;
    var cur = n.nodeValue, o = orig.get(n);
    if (o && o.out === cur) return;            // already translated by us
    var out = tr(cur); if (out !== cur) { orig.set(n, { src: cur, out: out }); n.nodeValue = out; }
  }
  var ATTRS = ['placeholder', 'aria-label', 'title'];
  function doAttrs(el) {
    ATTRS.forEach(function (a) { var v = el.getAttribute && el.getAttribute(a); if (!v) return; var key = '__tn_' + a; var o = el[key]; if (o && o.out === v) return; var out = tr(v); if (out !== v) { el[key] = { src: v, out: out }; el.setAttribute(a, out); } });
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP_TAG[root.tagName]) return;
    doAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else if (!SKIP_TAG[n.tagName]) doAttrs(n); }
  }
  function restore() {
    orig.forEach(function (o, n) { if (n.isConnected && n.nodeValue === o.out) n.nodeValue = o.src; });
    orig.clear();
    document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function (el) { ATTRS.forEach(function (a) { var o = el['__tn_' + a]; if (o && el.getAttribute(a) === o.out) el.setAttribute(a, o.src); delete el['__tn_' + a]; }); });
  }
  function start() {
    if (obs) return;
    obs = new MutationObserver(function (muts) {
      if (lang !== 'hi' || busy) return; busy = true;
      try { muts.forEach(function (m) { if (m.type === 'characterData') doText(m.target); else m.addedNodes.forEach(walk); if (m.type === 'attributes') doAttrs(m.target); }); } finally { busy = false; }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function set(l) {
    lang = l === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = lang;
    if (lang === 'hi') { busy = true; walk(document.body); busy = false; start(); } else { restore(); }
  }
  window.tnLang = { set: set, get: function () { return lang; } };
  function init() { var l = null; try { l = localStorage.getItem('tn_lang'); } catch (e) { } if (l === 'hi') setTimeout(function () { set('hi'); }, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
