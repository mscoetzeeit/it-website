/* ── Ms Coetzee CAT — dynamic navigation ──
   Injected into every page via <div id="topnav"></div>. */

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

  var html = '<nav class="topnav">'
    + '<button class="menu-toggle" id="menu-toggle">&#9776;</button>'
    + '<a class="topnav-brand" href="' + r + 'index.html">Ms Coetzee <span>CAT</span></a>'
    + '<ul class="topnav-links">'

    // ── GRADE 10 ──
    + '<li><button class="nav-dropdown-btn gr10">Grade 10 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical (P1)</div>'
    + '<a href="' + r + 'grade10/practical/word-processing.html">Word Processing</a>'
    + '<a href="' + r + 'grade10/practical/spreadsheets.html">Spreadsheets</a>'
    + '<a href="' + r + 'grade10/practical/html.html">HTML &amp; Web Design</a>'
    + '<a href="' + r + 'grade10/practical/presentations.html">Presentations (PAT)</a>'
    + '<div class="dropdown-section">Theory (P2)</div>'
    + '<a href="' + r + 'grade10/theory/concepts.html">Concepts of Computing</a>'
    + '<a href="' + r + 'grade10/theory/hardware.html">Hardware</a>'
    + '<a href="' + r + 'grade10/theory/software.html">Software &amp; Licensing</a>'
    + '<a href="' + r + 'grade10/theory/networks.html">Networks</a>'
    + '<a href="' + r + 'grade10/theory/internet.html">Internet &amp; E-Communication</a>'
    + '<a href="' + r + 'grade10/theory/social.html">Social Implications</a>'
    + '</div></li>'

    // ── GRADE 11 ──
    + '<li><button class="nav-dropdown-btn gr11">Grade 11 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical (P1)</div>'
    + '<a href="' + r + 'grade11/practical/word-processing.html">Word Processing</a>'
    + '<a href="' + r + 'grade11/practical/spreadsheets.html">Spreadsheets</a>'
    + '<a href="' + r + 'grade11/practical/databases.html">Databases (Access)</a>'
    + '<a href="' + r + 'grade11/practical/html.html">HTML &amp; Web Design</a>'
    + '<div class="dropdown-section">Theory (P2)</div>'
    + '<a href="' + r + 'grade11/theory/hardware.html">Hardware &amp; Processing</a>'
    + '<a href="' + r + 'grade11/theory/software.html">Software &amp; Cloud</a>'
    + '<a href="' + r + 'grade11/theory/networks.html">Networks (LAN/WLAN)</a>'
    + '<a href="' + r + 'grade11/theory/internet.html">Internet, IoT &amp; 4IR</a>'
    + '<a href="' + r + 'grade11/theory/social.html">Social Implications</a>'
    + '</div></li>'

    // ── GRADE 12 ──
    + '<li><button class="nav-dropdown-btn gr12">Grade 12 <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Practical (P1)</div>'
    + '<a href="' + r + 'grade12/practical/word-processing.html">Word Processing</a>'
    + '<a href="' + r + 'grade12/practical/spreadsheets.html">Spreadsheets</a>'
    + '<a href="' + r + 'grade12/practical/databases.html">Databases (Access)</a>'
    + '<a href="' + r + 'grade12/practical/html.html">HTML &amp; Web Design</a>'
    + '<div class="dropdown-section">Theory (P2)</div>'
    + '<a href="' + r + 'grade12/theory/hardware.html">Hardware &amp; Buying Decisions</a>'
    + '<a href="' + r + 'grade12/theory/software.html">Software &amp; File Management</a>'
    + '<a href="' + r + 'grade12/theory/networks.html">Networks &amp; WAN</a>'
    + '<a href="' + r + 'grade12/theory/internet.html">Internet &amp; E-Communication</a>'
    + '<a href="' + r + 'grade12/theory/social.html">Social Implications</a>'
    + '</div></li>'

    // ── EXAM PRACTICE ──
    + '<li><button class="nav-dropdown-btn" style="color:#fbbf24">Exam Practice <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Question Banks &amp; Memos</div>'
    + '<a href="' + r + 'exam-practice/index.html">&#128221; Exam Practice Home</a>'
    + '<a href="' + r + 'exam-practice/grade10.html">&#9999;&#65039; Grade 10 Questions</a>'
    + '<a href="' + r + 'exam-practice/grade11.html">&#9999;&#65039; Grade 11 Questions</a>'
    + '<a href="' + r + 'exam-practice/grade12.html">&#9999;&#65039; Grade 12 Questions</a>'
    + '<a href="' + r + 'exam-practice/exam-skills.html">&#127919; Exam Technique &amp; Verbs</a>'
    + '</div></li>'

    // ── SKILLS & PAT ──
    + '<li><button class="nav-dropdown-btn" style="color:#60a5fa">Skills &amp; PAT <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Core Skills</div>'
    + '<a href="' + r + 'skills/file-management.html">&#128193; File &amp; Data Management</a>'
    + '<a href="' + r + 'skills/information-management.html">&#128202; Information Management (PAT)</a>'
    + '</div></li>'

    // ── STUDY TOOLS ──
    + '<li><button class="nav-dropdown-btn" style="color:#4ade80">Study Tools <span class="chevron"></span></button>'
    + '<div class="dropdown">'
    + '<div class="dropdown-section">Term Planners</div>'
    + '<a href="' + r + 'terms-gr10.html">&#128197; Grade 10 &mdash; By Term</a>'
    + '<a href="' + r + 'terms-gr11.html">&#128197; Grade 11 &mdash; By Term</a>'
    + '<a href="' + r + 'terms-gr12.html">&#128197; Grade 12 &mdash; By Term</a>'
    + '</div></li>'

    + '</ul>'
    + '<div class="topnav-search">'
    + '<span class="search-icon">&#128269;</span>'
    + '<input type="text" id="search-input" placeholder="Search topics&hellip;">'
    + '<div id="search-results"></div>'
    + '</div>'
    + '</nav>';

  var el = document.getElementById('topnav');
  if (el) el.outerHTML = html;
})();
