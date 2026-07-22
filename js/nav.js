/* ── Ms Coetzee IT — dynamic navigation ──
   Injected into every page via <div id="topnav"></div>.
   Depth is auto-detected from the URL so relative paths always resolve. */

/* Apply saved theme immediately to avoid flash */
(function () {
  var saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

(function () {
  var path = window.location.pathname.replace(/\\/g, '/');
  var segs = path.split('/').filter(Boolean);

  // Depth = number of folder levels below the IT_website root
  // grade10/practical/foo.html → 2 levels deep → root = '../../'
  // grade12/foo.html           → 1 level deep  → root = '../'
  // index.html                 → 0 levels deep  → root = './'
  var hasSubfolder = /^(practical|theory)$/.test(segs[segs.length - 2] || '');
  var hasGradeFolder = /^grade\d+$/.test(segs[segs.length - 2] || '') ||
                       /^grade\d+$/.test(segs[segs.length - 3] || '') ||
                       (segs[segs.length - 2] || '') === 'exam-practice';
  var depth = 0;
  if (hasSubfolder) depth = 2;
  else if (hasGradeFolder) depth = 1;

  var r = depth === 0 ? './' : depth === 1 ? '../' : '../../';

  var html = '<nav class="topnav">'
    + '<button class="menu-toggle" id="menu-toggle">&#9776;</button>'
    + '<a class="topnav-brand" href="' + r + 'index.html">Ms Coetzee <span>IT</span></a>'
    + '<ul class="topnav-links">'

    // ── GRADE 10 ──
    + '<li><button class="nav-dropdown-btn gr10">Grade 10 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical (T1–T3)</div>'
    + '<a href="' + r + 'grade10/practical/algorithms.html">Algorithms &amp; Problem Solving</a>'
    + '<a href="' + r + 'grade10/practical/delphi-intro.html">Introduction to Delphi</a>'
    + '<a href="' + r + 'grade10/practical/delphi-components.html">Delphi Components &amp; Events</a>'
    + '<a href="' + r + 'grade10/practical/data-types.html">Data Types &amp; Variables</a>'
    + '<a href="' + r + 'grade10/practical/operators.html">Operators &amp; Functions</a>'
    + '<a href="' + r + 'grade10/practical/decisions.html">Decision Making (IF / CASE)</a>'
    + '<a href="' + r + 'grade10/practical/loops.html">Loops</a>'
    + '<a href="' + r + 'grade10/practical/strings.html">String Manipulation</a>'
    + '<div class="dropdown-section">Theory</div>'
    + '<a href="' + r + 'grade10/theory/digital-tech.html">Digital Technologies &amp; ICT</a>'
    + '<a href="' + r + 'grade10/theory/hardware.html">Hardware</a>'
    + '<a href="' + r + 'grade10/theory/software.html">Software &amp; Licensing</a>'
    + '<a href="' + r + 'grade10/theory/data-representation.html">Data Representation</a>'
    + '<a href="' + r + 'grade10/theory/networks.html">Networks</a>'
    + '<a href="' + r + 'grade10/theory/internet.html">Internet &amp; WWW</a>'
    + '<a href="' + r + 'grade10/theory/internet-services.html">Internet Services</a>'
    + '<a href="' + r + 'grade10/theory/e-communication.html">E-Communication</a>'
    + '<a href="' + r + 'grade10/theory/management.html">Computer Management &amp; Security</a>'
    + '</div></li>'

    // ── GRADE 11 ──
    + '<li><button class="nav-dropdown-btn gr11">Grade 11 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical</div>'
    + '<a href="' + r + 'grade11/practical/arrays.html">1D Arrays (T1)</a>'
    + '<a href="' + r + 'grade11/practical/text-files.html">Text Files (T2)</a>'
    + '<a href="' + r + 'grade11/practical/methods.html">Procedures &amp; Functions (T2)</a>'
    + '<a href="' + r + 'grade11/practical/databases-delphi.html">Databases in Delphi (T3)</a>'
    + '<div class="dropdown-section">Theory</div>'
    + '<a href="' + r + 'grade11/theory/hardware-gr11.html">Motherboard &amp; Hardware (T1)</a>'
    + '<a href="' + r + 'grade11/theory/processing.html">Processing Techniques (T1)</a>'
    + '<a href="' + r + 'grade11/theory/databases.html">Database Management (T2&ndash;T3)</a>'
    + '<a href="' + r + 'grade11/theory/networks-gr11.html">Networks &amp; Protocols (T1)</a>'
    + '<a href="' + r + 'grade11/theory/mobile-tech.html">Mobile Technology (T2)</a>'
    + '<a href="' + r + 'grade11/theory/computer-management.html">Computer Management (T1)</a>'
    + '<a href="' + r + 'grade11/theory/e-communications-gr11.html">E-Communications (T2)</a>'
    + '<a href="' + r + 'grade11/theory/internet-gr11.html">Internet &amp; Multimedia (T4)</a>'
    + '<a href="' + r + 'grade11/theory/internet-services-gr11.html">Internet Services (T4)</a>'
    + '<a href="' + r + 'grade11/theory/social-gr11.html">Social Implications (T1&ndash;T4)</a>'
    + '</div></li>'

    // ── GRADE 12 ──
    + '<li><button class="nav-dropdown-btn gr12">Grade 12 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical</div>'
    + '<a href="' + r + 'grade12/sql.html">SQL (T1&ndash;T3)</a>'
    + '<a href="' + r + 'grade12/sql-join.html">SQL &mdash; Joining Tables (T1)</a>'
    + '<a href="' + r + 'grade12/oop.html">OOP (T2&ndash;T3)</a>'
    + '<a href="' + r + 'grade12/arrays-2d.html">2D Arrays (T2&ndash;T3)</a>'
    + '<a href="' + r + 'grade12/recursion.html">Recursion (T3)</a>'
    + '<div class="dropdown-section">Theory</div>'
    + '<a href="' + r + 'grade12/data-management.html">Data Collection &amp; Warehousing (T1)</a>'
    + '<a href="' + r + 'grade12/relational-db.html">Relational Databases &amp; Normalisation (T1)</a>'
    + '<a href="' + r + 'grade12/hardware-gr12.html">Hardware &amp; Performance (T1)</a>'
    + '<a href="' + r + 'grade12/cloud-vr-ar.html">Cloud Computing, AI, VR &amp; AR (T2)</a>'
    + '<a href="' + r + 'grade12/internet-tech.html">Internet Technologies (T3)</a>'
    + '<a href="' + r + 'grade12/networks-gr12.html">Networks &amp; Remote Access (T3)</a>'
    + '<a href="' + r + 'grade12/communication-tech.html">Communication Technologies (T3)</a>'
    + '<a href="' + r + 'grade12/cybercrime.html">Cybercrime &amp; Safeguards (T2)</a>'
    + '<a href="' + r + 'grade12/social-gr12.html">Social Implications (T1&ndash;T3)</a>'
    + '</div></li>'

    // ── STUDY TOOLS ──
    + '<li><button class="nav-dropdown-btn" style="color:#4ade80">Study Tools <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Quick Reference</div>'
    + '<a href="' + r + 'quick-reference.html">&#128203; Programming Recap (all grades)</a>'
    + '<a href="' + r + 'quick-ref-gr10.html">&#128203; Grade 10 — Programming</a>'
    + '<a href="' + r + 'quick-ref-gr11.html">&#128203; Grade 11 — Programming</a>'
    + '<a href="' + r + 'quick-ref-gr12.html">&#128203; Grade 12 — Programming</a>'
    + '<div class="dropdown-section">Year Planner</div>'
    + '<a href="' + r + 'terms-gr10.html">&#128197; Grade 10 — Year Planner</a>'
    + '<a href="' + r + 'terms-gr11.html">&#128197; Grade 11 — Year Planner</a>'
    + '<a href="' + r + 'terms-gr12.html">&#128197; Grade 12 — Year Planner</a>'
    + '<div class="dropdown-section">Reference</div>'
    + '<a href="' + r + 'glossary.html">&#128214; IT Glossary (A&ndash;Z)</a>'
    + '<div class="dropdown-section">Exam Resources</div>'
    + '<a href="' + r + 'exam-practice/index.html">&#128221; Exam Practice (Q &amp; memos)</a>'
    + '<a href="' + r + 'exam-extras.html">&#9889; Exam Extras (Out-of-CAPS)</a>'
    + '</div></li>'

    + '</ul>'
    + '<div class="topnav-search">'
    + '<span class="search-icon">&#128269;</span>'
    + '<input type="text" id="search-input" placeholder="Search topics&hellip;">'
    + '<div id="search-results"></div>'
    + '</div>'
    + '<button class="theme-toggle" id="theme-toggle" title="Toggle dark / light mode"></button>'
    + '</nav>';

  var el = document.getElementById('topnav');
  if (el) el.outerHTML = html;

  /* Theme toggle logic */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function isDark() {
      var t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark') return true;
      if (t === 'light') return false;
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
