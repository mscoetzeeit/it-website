/* ── Ms Coetzee CAT ── shared JS ── */

/* ---------- LANGUAGE TOGGLE (EN / AF) ----------
   Any element with a data-af="..." attribute can be flipped between its
   original (English) content and the Afrikaans version stored in that
   attribute. Elements with data-af-placeholder swap their placeholder text
   instead (used for the search box). Preference is remembered per browser. */
(function () {
  function applyLang(lang) {
    document.querySelectorAll('[data-af]').forEach(function (el) {
      if (el.dataset.enText === undefined) el.dataset.enText = el.innerHTML;
      el.innerHTML = lang === 'af' ? el.getAttribute('data-af') : el.dataset.enText;
    });
    document.querySelectorAll('[data-af-placeholder]').forEach(function (el) {
      if (el.dataset.enPlaceholder === undefined) el.dataset.enPlaceholder = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', lang === 'af' ? el.getAttribute('data-af-placeholder') : el.dataset.enPlaceholder);
    });
    document.documentElement.setAttribute('lang', lang === 'af' ? 'af' : 'en');
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'af' ? 'EN' : 'AF';
      btn.title = lang === 'af' ? 'Switch to English' : 'Wissel na Afrikaans';
    }
  }

  var saved = localStorage.getItem('lang') || 'en';
  applyLang(saved);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('#lang-toggle');
    if (!btn) return;
    var current = localStorage.getItem('lang') === 'af' ? 'af' : 'en';
    var next = current === 'af' ? 'en' : 'af';
    localStorage.setItem('lang', next);
    applyLang(next);
  });
})();

/* ---------- DROPDOWN MENUS ---------- */
document.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const li = btn.closest('li');
    const wasOpen = li.classList.contains('open');
    document.querySelectorAll('.topnav-links li.open').forEach(el => el.classList.remove('open'));
    if (!wasOpen) li.classList.add('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.topnav-links li.open').forEach(el => el.classList.remove('open'));
  document.getElementById('search-results')?.classList.remove('open');
});

/* ---------- ACTIVE SIDEBAR LINK ---------- */
const currentPath = window.location.pathname.replace(/\\/g, '/');
document.querySelectorAll('.sidebar a').forEach(a => {
  const href = a.getAttribute('href');
  if (href && currentPath.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
    a.classList.add('active');
  }
});

/* ---------- MOBILE NAV DRAWER ---------- */
(function buildMobileDrawer() {
  const menuToggle = document.getElementById('menu-toggle');
  if (!menuToggle) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-backdrop';
  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  const navLinks = document.querySelector('.topnav-links');
  if (navLinks) {
    const lbl = document.createElement('div');
    lbl.className = 'drawer-label';
    lbl.textContent = 'Browse';
    drawer.appendChild(lbl);
    drawer.appendChild(navLinks.cloneNode(true));
  }
  const sb = document.querySelector('.sidebar');
  if (sb) {
    const lbl = document.createElement('div');
    lbl.className = 'drawer-label';
    lbl.textContent = 'On this page';
    drawer.appendChild(lbl);
    drawer.appendChild(sb.cloneNode(true));
  }
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);
  function openDrawer() { drawer.classList.add('open'); backdrop.classList.add('open'); document.body.classList.add('drawer-open'); }
  function closeDrawer() { drawer.classList.remove('open'); backdrop.classList.remove('open'); document.body.classList.remove('drawer-open'); }
  menuToggle.addEventListener('click', e => { e.stopPropagation(); drawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.nav-dropdown-btn').forEach(btn => { btn.addEventListener('click', e => { e.stopPropagation(); btn.closest('li').classList.toggle('open'); }); });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) closeDrawer(); });
})();

/* ---------- COPY CODE BUTTONS ---------- */
document.querySelectorAll('pre').forEach(pre => {
  const wrapper = pre.closest('.code-block') || pre;
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 1500);
    });
  });
  if (wrapper === pre) { pre.style.position = 'relative'; pre.appendChild(btn); }
  else { wrapper.style.position = 'relative'; wrapper.appendChild(btn); }
});

/* ---------- SEARCH ---------- */
const PAGES = [
  // Grade 10 Practical
  { title: 'Word Processing (Gr 10)',      url: 'grade10/practical/word-processing.html', grade: 'Grade 10 · Practical', tags: 'word processing font formatting paragraph tables headers footers page layout styles margins orientation bullets numbering indents tabs columns watermark' },
  { title: 'Spreadsheets (Gr 10)',         url: 'grade10/practical/spreadsheets.html',    grade: 'Grade 10 · Practical', tags: 'spreadsheet excel cell reference range sum average count min max today countif sorting charts graphs pie bar column line formulas functions error' },
  { title: 'HTML & Web Design (Gr 10)',    url: 'grade10/practical/html.html',            grade: 'Grade 10 · Practical', tags: 'html web design tags headings paragraph bold italic underline font body background br hr attributes hyperlink link' },
  { title: 'Presentations / PAT (Gr 10)', url: 'grade10/practical/presentations.html',   grade: 'Grade 10 · Practical', tags: 'powerpoint presentations slides animations transitions hyperlinks PAT design layout' },
  // Grade 10 Theory
  { title: 'Concepts of Computing (Gr 10)',  url: 'grade10/theory/concepts.html',   grade: 'Grade 10 · Theory', tags: 'computing device ICT data information processing cycle input output storage communication GUI desktop laptop tablet smartphone convergence' },
  { title: 'Hardware (Gr 10)',               url: 'grade10/theory/hardware.html',   grade: 'Grade 10 · Theory', tags: 'hardware input output storage processing CPU RAM ROM HDD SSD flash drive peripheral mouse keyboard monitor printer scanner biometric RFID USB HDMI' },
  { title: 'Software & Licensing (Gr 10)',   url: 'grade10/theory/software.html',   grade: 'Grade 10 · Theory', tags: 'software application system operating system Windows Android driver utility proprietary open source freeware shareware license EULA copyright piracy' },
  { title: 'Networks (Gr 10)',               url: 'grade10/theory/networks.html',   grade: 'Grade 10 · Theory', tags: 'network LAN WAN PAN HAN router switch modem ISP wifi bluetooth NFC communication media wired wireless internet access' },
  { title: 'Internet & E-Communication (Gr 10)', url: 'grade10/theory/internet.html', grade: 'Grade 10 · Theory', tags: 'internet WWW browser search engine URL email netiquette social media hyperlink download upload communication OTP authentication' },
  { title: 'Social Implications (Gr 10)',    url: 'grade10/theory/social.html',     grade: 'Grade 10 · Theory', tags: 'ergonomics green computing health posture digital citizenship digital footprint POPIA copyright piracy privacy computer crime identity theft' },
  // Grade 11 Practical
  { title: 'Word Processing (Gr 11)',      url: 'grade11/practical/word-processing.html', grade: 'Grade 11 · Practical', tags: 'word processing templates sections mail merge styles table of contents footnotes endnotes captions bibliography index forms legacy paste special columns themes' },
  { title: 'Spreadsheets (Gr 11)',         url: 'grade11/practical/spreadsheets.html',    grade: 'Grade 11 · Practical', tags: 'spreadsheet conditional formatting absolute reference IF COUNTIF SUMIF ROUND SMALL LARGE charts graphs sheets freeze panes import export' },
  { title: 'Databases (Gr 11)',            url: 'grade11/practical/databases.html',       grade: 'Grade 11 · Practical', tags: 'database access table field record primary key data types query form report validation input mask relationships' },
  { title: 'HTML & Web Design (Gr 11)',    url: 'grade11/practical/html.html',            grade: 'Grade 11 · Practical', tags: 'html tables lists images links anchor href ol ul li img src alt attributes colour web design' },
  // Grade 11 Theory
  { title: 'Hardware & Processing (Gr 11)',  url: 'grade11/theory/hardware.html',  grade: 'Grade 11 · Theory', tags: 'hardware motherboard CPU RAM ROM GPU NIC cloud storage primary secondary storage interpret adverts trackball wearables UPS power biometric' },
  { title: 'Software & Cloud (Gr 11)',       url: 'grade11/theory/software.html',  grade: 'Grade 11 · Theory', tags: 'software cloud G Suite Office 365 SaaS compatibility updates screen reader voice recognition installation file management system requirements' },
  { title: 'Networks LAN/WLAN (Gr 11)',      url: 'grade11/theory/networks.html',  grade: 'Grade 11 · Theory', tags: 'LAN WLAN network components NIC router switch access point UTP fibre wireless wired speed security username password BYOD' },
  { title: 'Internet IoT 4IR (Gr 11)',       url: 'grade11/theory/internet.html',  grade: 'Grade 11 · Theory', tags: 'internet IoT 4IR VoIP video conferencing social networks VR AR augmented reality virtual reality online services banking hotspot 5G bluetooth NFC' },
  { title: 'Social Implications (Gr 11)',    url: 'grade11/theory/social.html',    grade: 'Grade 11 · Theory', tags: 'social engineering phishing pharming malware virus ransomware spyware privacy information accuracy AI big data backup security verification' },
  // Grade 12 Practical
  { title: 'Word Processing (Gr 12)',      url: 'grade12/practical/word-processing.html', grade: 'Grade 12 · Practical', tags: 'word processing mail merge data sources tracking changes bookmark hyperlink cross-reference widow orphan styles advanced layout linking embedding' },
  { title: 'Spreadsheets (Gr 12)',         url: 'grade12/practical/spreadsheets.html',    grade: 'Grade 12 · Practical', tags: 'spreadsheet nested IF AND OR VLOOKUP HLOOKUP COUNTIFS SUMIFS ROUNDUP ROUNDDOWN text functions LEFT RIGHT MID CONCATENATE LEN date time YEAR MONTH subtotal' },
  { title: 'Databases (Gr 12)',            url: 'grade12/practical/databases.html',       grade: 'Grade 12 · Practical', tags: 'database access advanced queries grouping calculations IS Null wildcard reports grouped SUM AVG COUNT data validation changing source scenario' },
  { title: 'HTML & Web Design (Gr 12)',    url: 'grade12/practical/html.html',            grade: 'Grade 12 · Practical', tags: 'html table formatting border cellpadding cellspacing horizontal vertical alignment merge rows columns good web design' },
  // Grade 12 Theory
  { title: 'Hardware & Buying Decisions (Gr 12)', url: 'grade12/theory/hardware.html', grade: 'Grade 12 · Theory', tags: 'hardware buying decisions CPU RAM GPU SSD HDD printer scanner webcam resolution specifications SOHO power user mobile user productivity accessibility' },
  { title: 'Software & File Management (Gr 12)',  url: 'grade12/theory/software.html', grade: 'Grade 12 · Theory', tags: 'software file management metadata read-only hidden attributes operating system utilities antivirus multitasking task manager performance troubleshooting 7-Zip' },
  { title: 'Networks & WAN (Gr 12)',              url: 'grade12/theory/networks.html',  grade: 'Grade 12 · Theory', tags: 'WAN wide area network internet services VoIP streaming downloading ISP fibre throttling shaping bandwidth broadband CAP bundle grid computing cloud' },
  { title: 'Internet & E-Communication (Gr 12)', url: 'grade12/theory/internet.html',  grade: 'Grade 12 · Theory', tags: 'video conferencing browser bookmarks caching extensions incognito private blog vlog podcast GPS geotagging social networks wearables mobile devices' },
  { title: 'Social Implications (Gr 12)',         url: 'grade12/theory/social.html',    grade: 'Grade 12 · Theory', tags: 'cybercrime DDoS malware virus trojan ransomware spyware identity theft fraud social media digital footprint VPN remote access information overload copyright POPIA' },
  // Study Tools
  { title: 'Grade 10 — Study by Term', url: 'terms-gr10.html', grade: 'Study Tools', tags: 'term planner grade 10 what to study schedule word spreadsheet html theory hardware software' },
  { title: 'Grade 11 — Study by Term', url: 'terms-gr11.html', grade: 'Study Tools', tags: 'term planner grade 11 what to study schedule database mail merge IF function LAN' },
  { title: 'Grade 12 — Study by Term', url: 'terms-gr12.html', grade: 'Study Tools', tags: 'term planner grade 12 what to study schedule matric WAN nested IF VLOOKUP advanced' },
  // Exam Practice
  { title: 'Exam Practice — Home', url: 'exam-practice/index.html', grade: 'Exam Practice', tags: 'exam practice past papers questions memo answers paper 1 paper 2 revision how to study' },
  { title: 'Grade 10 — Exam Questions & Memos', url: 'exam-practice/grade10.html', grade: 'Exam Practice', tags: 'exam practice grade 10 questions memo past paper theory practical hardware software networks internet social spreadsheet word html answers' },
  { title: 'Grade 11 — Exam Questions & Memos', url: 'exam-practice/grade11.html', grade: 'Exam Practice', tags: 'exam practice grade 11 questions memo past paper theory practical database IF COUNTIF LAN IoT 4IR malware answers' },
  { title: 'Grade 12 — Exam Questions & Memos', url: 'exam-practice/grade12.html', grade: 'Exam Practice', tags: 'exam practice grade 12 questions memo past paper matric theory practical VLOOKUP nested IF WAN cybercrime answers final' },
  { title: 'Exam Technique & Question Verbs', url: 'exam-practice/exam-skills.html', grade: 'Exam Practice', tags: 'exam technique question verbs command words name state explain discuss motivate distinguish list give two reasons mark allocation how to answer scenario' },
  { title: 'Common Exam Mistakes', url: 'exam-practice/common-mistakes.html', grade: 'Exam Practice', tags: 'common exam mistakes misconceptions wrong right revision RAM ROM virus worm modem router internet WWW HTTP HTTPS cc bcc data information plagiarism VLOOKUP primary key cellpadding cellspacing SSD HDD' },
  { title: 'Glossary & Acronyms', url: 'glossary.html', grade: 'Study Tools', tags: 'glossary dictionary definitions terms acronyms abbreviations meaning RAM ROM CPU ISP LAN WAN WLAN PAN HAN IoT 4IR AI AR VR VPN OTP OCR RFID NFC GUI URL USB SSD HDD SaaS SOHO WYSIWYG DDoS malware phishing POPIA reference' },
  // Skills & PAT
  { title: 'File & Data Management', url: 'skills/file-management.html', grade: 'Skills & PAT', tags: 'file management folder directory copy move rename delete file extension type compress zip extract archive search wildcard attributes read-only hidden backup file path naming convention recycle bin' },
  { title: 'Information Management (PAT)', url: 'skills/information-management.html', grade: 'Skills & PAT', tags: 'information management PAT practical assessment task research process task definition questions sources evaluate reliability bias process data spreadsheet findings conclusions recommendations report bibliography referencing plagiarism survey questionnaire' },
];

function getRoot() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const segs = path.split('/').filter(Boolean);
  const parent = segs[segs.length - 2] || '';
  if (/^(practical|theory)$/.test(parent)) return '../../';
  if (/^grade\d+$/.test(parent)) return '../';
  if (parent === 'exam-practice') return '../';
  if (parent === 'skills') return '../';
  return './';
}

function buildSearchIndex() {
  const root = getRoot();
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove('open'); return; }
    const matches = PAGES.filter(p =>
      p.title.toLowerCase().includes(q) || p.tags.includes(q) || p.grade.toLowerCase().includes(q)
    ).slice(0, 8);
    if (matches.length === 0) {
      results.innerHTML = '<div class="sr-empty">No results found</div>';
    } else {
      results.innerHTML = matches.map(p => `
        <a class="sr-item" href="${root}${p.url}">
          <div class="sr-title">${p.title}</div>
          <div class="sr-grade">${p.grade}</div>
        </a>`).join('');
    }
    results.classList.add('open');
  });
  input.addEventListener('click', e => e.stopPropagation());
  results.addEventListener('click', e => e.stopPropagation());
}
buildSearchIndex();
