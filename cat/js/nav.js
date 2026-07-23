/* ── Ms Coetzee CAT — dynamic navigation ──
   Injected into every page via <div id="topnav"></div>. */

/* Apply saved theme immediately to avoid flash */
(function () {
  var saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

(function () {
  var path = window.location.pathname.replace(/\\/g, '/');
  var segs = path.split('/').filter(Boolean);

  var hasSubfolder = /^(practical|theory)$/.test(segs[segs.length - 2] || '');
  var hasGradeFolder = /^grade\d+$/.test(segs[segs.length - 2] || '') ||
                       /^grade\d+$/.test(segs[segs.length - 3] || '') ||
                       (segs[segs.length - 2] || '') === 'exam-practice' ||
                       (segs[segs.length - 2] || '') === 'skills';
  var depth = 0;
  if (hasSubfolder) depth = 2;
  else if (hasGradeFolder) depth = 1;

  var r = depth === 0 ? './' : depth === 1 ? '../' : '../../';

  /* Helper: wraps a label so the language toggle can swap it without
     touching sibling icons/chevrons. */
  function t(en, af) {
    return '<span class="i18n" data-af="' + af + '">' + en + '</span>';
  }

  var html = '<nav class="topnav">'
    + '<button class="menu-toggle" id="menu-toggle">&#9776;</button>'
    + '<a class="topnav-brand" href="' + r + 'index.html">Ms Coetzee <span>CAT</span></a>'
    + '<ul class="topnav-links">'

    // ── GRADE 10 ──
    + '<li><button class="nav-dropdown-btn gr10">' + t('Grade 10', 'Graad 10') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Practical (P1)', 'Prakties (V1)') + '</div>'
    + '<a href="' + r + 'grade10/practical/word-processing.html">' + t('Word Processing', 'Woordverwerking') + '</a>'
    + '<a href="' + r + 'grade10/practical/spreadsheets.html">' + t('Spreadsheets', 'Sigblaaie') + '</a>'
    + '<a href="' + r + 'grade10/practical/html.html">' + t('HTML &amp; Web Design', 'HTML &amp; Webontwerp') + '</a>'
    + '<a href="' + r + 'grade10/practical/presentations.html">' + t('Presentations (PAT)', 'Aanbiedinge (PAT)') + '</a>'
    + '<div class="dropdown-section">' + t('Theory (P2)', 'Teorie (V2)') + '</div>'
    + '<a href="' + r + 'grade10/theory/concepts.html">' + t('Concepts of Computing (T1)', 'Konsepte van Rekenaars (K1)') + '</a>'
    + '<a href="' + r + 'grade10/theory/hardware.html">' + t('Hardware (T1&ndash;T2)', 'Hardeware (K1&ndash;K2)') + '</a>'
    + '<a href="' + r + 'grade10/theory/software.html">' + t('Software &amp; Licensing (T1&ndash;T2)', 'Sagteware &amp; Lisensiëring (K1&ndash;K2)') + '</a>'
    + '<a href="' + r + 'grade10/theory/networks.html">' + t('Networks (T2&ndash;T3)', 'Netwerke (K2&ndash;K3)') + '</a>'
    + '<a href="' + r + 'grade10/theory/internet.html">' + t('Internet &amp; E-Communication (T3)', 'Internet &amp; E-Kommunikasie (K3)') + '</a>'
    + '<a href="' + r + 'grade10/theory/social.html">' + t('Social Implications (T1, T3&ndash;T4)', 'Maatskaplike Implikasies (K1, K3&ndash;K4)') + '</a>'
    + '</div></li>'

    // ── GRADE 11 ──
    + '<li><button class="nav-dropdown-btn gr11">' + t('Grade 11', 'Graad 11') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Practical (P1)', 'Prakties (V1)') + '</div>'
    + '<a href="' + r + 'grade11/practical/word-processing.html">' + t('Word Processing', 'Woordverwerking') + '</a>'
    + '<a href="' + r + 'grade11/practical/spreadsheets.html">' + t('Spreadsheets', 'Sigblaaie') + '</a>'
    + '<a href="' + r + 'grade11/practical/databases.html">' + t('Databases (Access)', 'Databasisse (Access)') + '</a>'
    + '<a href="' + r + 'grade11/practical/html.html">' + t('HTML &amp; Web Design', 'HTML &amp; Webontwerp') + '</a>'
    + '<div class="dropdown-section">' + t('Theory (P2)', 'Teorie (V2)') + '</div>'
    + '<a href="' + r + 'grade11/theory/hardware.html">' + t('Hardware &amp; Processing (T1&ndash;T2)', 'Hardeware &amp; Verwerking (K1&ndash;K2)') + '</a>'
    + '<a href="' + r + 'grade11/theory/software.html">' + t('Software &amp; Cloud (T3)', 'Sagteware &amp; Wolkdiens (K3)') + '</a>'
    + '<a href="' + r + 'grade11/theory/networks.html">' + t('Networks (LAN/WLAN) (T2)', 'Netwerke (LAN/WLAN) (K2)') + '</a>'
    + '<a href="' + r + 'grade11/theory/internet.html">' + t('Internet, IoT &amp; 4IR (T3&ndash;T4)', 'Internet, IoT &amp; 4IR (K3&ndash;K4)') + '</a>'
    + '<a href="' + r + 'grade11/theory/social.html">' + t('Social Implications (T1&ndash;T4)', 'Maatskaplike Implikasies (K1&ndash;K4)') + '</a>'
    + '</div></li>'

    // ── GRADE 12 ──
    + '<li><button class="nav-dropdown-btn gr12">' + t('Grade 12', 'Graad 12') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Practical (P1)', 'Prakties (V1)') + '</div>'
    + '<a href="' + r + 'grade12/practical/word-processing.html">' + t('Word Processing', 'Woordverwerking') + '</a>'
    + '<a href="' + r + 'grade12/practical/spreadsheets.html">' + t('Spreadsheets', 'Sigblaaie') + '</a>'
    + '<a href="' + r + 'grade12/practical/databases.html">' + t('Databases (Access)', 'Databasisse (Access)') + '</a>'
    + '<a href="' + r + 'grade12/practical/html.html">' + t('HTML &amp; Web Design', 'HTML &amp; Webontwerp') + '</a>'
    + '<div class="dropdown-section">' + t('Theory (P2)', 'Teorie (V2)') + '</div>'
    + '<a href="' + r + 'grade12/theory/hardware.html">' + t('Hardware &amp; Buying Decisions (T1)', 'Hardeware &amp; Aankoopbesluite (K1)') + '</a>'
    + '<a href="' + r + 'grade12/theory/software.html">' + t('Software &amp; File Management (T1, T3)', 'Sagteware &amp; Lêerbestuur (K1, K3)') + '</a>'
    + '<a href="' + r + 'grade12/theory/networks.html">' + t('Networks &amp; WAN (T2)', 'Netwerke &amp; WAN (K2)') + '</a>'
    + '<a href="' + r + 'grade12/theory/internet.html">' + t('Internet &amp; E-Communication (T3)', 'Internet &amp; E-Kommunikasie (K3)') + '</a>'
    + '<a href="' + r + 'grade12/theory/social.html">' + t('Social Implications (T1&ndash;T3)', 'Maatskaplike Implikasies (K1&ndash;K3)') + '</a>'
    + '</div></li>'

    // ── EXAM PRACTICE ──
    + '<li><button class="nav-dropdown-btn" style="color:#fbbf24">' + t('Exam Practice', 'Eksamenoefening') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Question Banks &amp; Memos', 'Vraebanke &amp; Memorandums') + '</div>'
    + '<a href="' + r + 'exam-practice/index.html">&#128221; ' + t('Exam Practice Home', 'Eksamenoefening Tuisblad') + '</a>'
    + '<a href="' + r + 'exam-practice/grade10.html">&#9999;&#65039; ' + t('Grade 10 Questions', 'Graad 10 Vrae') + '</a>'
    + '<a href="' + r + 'exam-practice/grade11.html">&#9999;&#65039; ' + t('Grade 11 Questions', 'Graad 11 Vrae') + '</a>'
    + '<a href="' + r + 'exam-practice/grade12.html">&#9999;&#65039; ' + t('Grade 12 Questions', 'Graad 12 Vrae') + '</a>'
    + '<a href="' + r + 'exam-practice/exam-skills.html">&#127919; ' + t('Exam Technique &amp; Verbs', 'Eksamentegniek &amp; Werkwoorde') + '</a>'
    + '<a href="' + r + 'exam-practice/common-mistakes.html">&#10060; ' + t('Common Exam Mistakes', 'Algemene Eksamenfoute') + '</a>'
    + '</div></li>'

    // ── SKILLS & PAT ──
    + '<li><button class="nav-dropdown-btn" style="color:#60a5fa">' + t('Skills &amp; PAT', 'Vaardighede &amp; PAT') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Core Skills', 'Kernvaardighede') + '</div>'
    + '<a href="' + r + 'skills/file-management.html">&#128193; ' + t('File &amp; Data Management', 'Lêer- &amp; Databestuur') + '</a>'
    + '<a href="' + r + 'skills/information-management.html">&#128202; ' + t('Information Management (PAT)', 'Inligtingsbestuur (PAT)') + '</a>'
    + '</div></li>'

    // ── STUDY TOOLS ──
    + '<li><button class="nav-dropdown-btn" style="color:#4ade80">' + t('Study Tools', 'Studiehulpmiddels') + ' <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">' + t('Reference', 'Verwysing') + '</div>'
    + '<a href="' + r + 'glossary.html">&#128218; ' + t('Glossary &amp; Acronyms', 'Woordelys &amp; Akronieme') + '</a>'
    + '<div class="dropdown-section">' + t('Year Planner', 'Jaarbeplanner') + '</div>'
    + '<a href="' + r + 'terms-gr10.html">&#128197; ' + t('Grade 10 &mdash; Year Planner', 'Graad 10 &mdash; Jaarbeplanner') + '</a>'
    + '<a href="' + r + 'terms-gr11.html">&#128197; ' + t('Grade 11 &mdash; Year Planner', 'Graad 11 &mdash; Jaarbeplanner') + '</a>'
    + '<a href="' + r + 'terms-gr12.html">&#128197; ' + t('Grade 12 &mdash; Year Planner', 'Graad 12 &mdash; Jaarbeplanner') + '</a>'
    + '</div></li>'

    + '</ul>'
    + '<div class="topnav-search">'
    + '<span class="search-icon">&#128269;</span>'
    + '<input type="text" id="search-input" placeholder="Search topics&hellip;" data-af-placeholder="Soek onderwerpe&hellip;">'
    + '<div id="search-results"></div>'
    + '</div>'
    + '<button class="lang-toggle" id="lang-toggle" title="Wissel na Afrikaans / Switch to English">AF</button>'
    + '<button class="theme-toggle" id="theme-toggle" title="Toggle dark / light mode"></button>'
    + '</nav>';

  var el = document.getElementById('topnav');
  if (el) el.outerHTML = html;

  /* Theme toggle logic */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function isDark() {
      var th = document.documentElement.getAttribute('data-theme');
      if (th === 'dark') return true;
      if (th === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function updateBtn() {
      btn.textContent = isDark() ? '☀' : '☽';  /* ☀ sun / ☽ crescent */
      btn.title = isDark() ? 'Switch to light mode' : 'Switch to dark mode';
    }
    updateBtn();

    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateBtn();
    });
  });
})();
