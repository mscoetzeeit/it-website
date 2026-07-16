/* ── Ms Coetzee IT ── shared JS ── */

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

/* ---------- MOBILE NAV DRAWER ----------
   Builds one off-canvas drawer that contains BOTH the grade navigation
   and (if present) the current page's sidebar links, so the hamburger
   gives full access to the site on phones — including the home page. */
(function buildMobileDrawer() {
  const menuToggle = document.getElementById('menu-toggle');
  if (!menuToggle) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-backdrop';

  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';

  // 1. Clone the grade-level navigation
  const navLinks = document.querySelector('.topnav-links');
  if (navLinks) {
    const lbl = document.createElement('div');
    lbl.className = 'drawer-label';
    lbl.textContent = 'Browse';
    drawer.appendChild(lbl);
    const navClone = navLinks.cloneNode(true);
    drawer.appendChild(navClone);
  }

  // 2. Clone the page sidebar (topic links) if this page has one
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

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('drawer-open');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('drawer-open');
  }

  menuToggle.addEventListener('click', e => {
    e.stopPropagation();
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  backdrop.addEventListener('click', closeDrawer);

  // Accordion behaviour for the cloned grade dropdowns
  drawer.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.closest('li').classList.toggle('open');
    });
  });

  // Close the drawer when any link is tapped
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  // Tidy up if the viewport grows to desktop while the drawer is open
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => {
    if (e.matches) closeDrawer();
  });
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
  if (wrapper === pre) {
    pre.style.position = 'relative';
    pre.appendChild(btn);
  } else {
    wrapper.style.position = 'relative';
    wrapper.appendChild(btn);
  }
});

/* ---------- SEARCH ---------- */
const PAGES = [
  // Grade 10 Practical
  { title: 'Algorithms & Problem Solving',    url: 'grade10/practical/algorithms.html',         grade: 'Grade 10 · Practical', tags: 'algorithm pseudocode flowchart ipo table problem solving' },
  { title: 'Introduction to Delphi',          url: 'grade10/practical/delphi-intro.html',        grade: 'Grade 10 · Practical', tags: 'delphi ide components properties events form button label showmessage inputbox' },
  { title: 'Delphi Components & Events',      url: 'grade10/practical/delphi-components.html',   grade: 'Grade 10 · Practical', tags: 'combobox listbox spinedit pagecontrol tabsheet timer image progressbar panel radiogroup checkbox' },
  { title: 'Data Types & Variables',          url: 'grade10/practical/data-types.html',          grade: 'Grade 10 · Practical', tags: 'integer real string boolean char variable declaration constant strToInt floatToStr val procedure conversion error code overflow' },
  { title: 'Operators & Functions',           url: 'grade10/practical/operators.html',           grade: 'Grade 10 · Practical', tags: 'mod div arithmetic operators math functions sqrt power round ord chr upcase trim' },
  { title: 'Decision Making (IF/CASE)',       url: 'grade10/practical/decisions.html',           grade: 'Grade 10 · Practical', tags: 'if else case in operator boolean and or not messagedlg radiogroup checkbox' },
  { title: 'Loops',                           url: 'grade10/practical/loops.html',               grade: 'Grade 10 · Practical', tags: 'for while repeat until loop counter increment downto sentinel' },
  { title: 'String Manipulation',             url: 'grade10/practical/strings.html',             grade: 'Grade 10 · Practical', tags: 'string pos copy insert delete length uppercase lowercase trim reverse vowel' },
  { title: 'HTML — Web Design',               url: 'grade10/practical/html.html',                grade: 'Grade 10 · Practical', tags: 'html web design tags heading paragraph list link image table body head doctype href src' },
  // Grade 10 Theory
  { title: 'Digital Technologies & ICT',      url: 'grade10/theory/digital-tech.html',           grade: 'Grade 10 · Theory',    tags: 'digital ict computer data information processing cycle digital divide' },
  { title: 'Hardware',                         url: 'grade10/theory/hardware.html',               grade: 'Grade 10 · Theory',    tags: 'hardware cpu ram rom hdd ssd input output storage motherboard monitor printer' },
  { title: 'Software & Licensing',             url: 'grade10/theory/software.html',               grade: 'Grade 10 · Theory',    tags: 'software operating system freeware shareware open source license proprietary piracy copyright eula' },
  { title: 'Data Representation',              url: 'grade10/theory/data-representation.html',    grade: 'Grade 10 · Theory',    tags: 'binary hex decimal ascii unicode bits bytes number systems conversion' },
  { title: 'Networks (Gr 10)',                 url: 'grade10/theory/networks.html',               grade: 'Grade 10 · Theory',    tags: 'network lan wan pan client server peer topology nic router switch modem' },
  { title: 'Internet & WWW',                   url: 'grade10/theory/internet.html',               grade: 'Grade 10 · Theory',    tags: 'internet www url html browser search engine ip address threats phishing' },
  { title: 'Internet Services (Gr 10)',        url: 'grade10/theory/internet-services.html',      grade: 'Grade 10 · Theory',    tags: 'internet services plug-in plugin web technologies ftp cloud streaming w3c' },
  { title: 'E-Communication',                  url: 'grade10/theory/e-communication.html',        grade: 'Grade 10 · Theory',    tags: 'email communication social media spam phishing etiquette netiquette ergonomics green computing' },
  { title: 'Computer Management & Security',   url: 'grade10/theory/management.html',             grade: 'Grade 10 · Theory',    tags: 'antivirus firewall backup virus malware security housekeeping defrag disk cleanup' },
  // Grade 11 Practical
  { title: '1D Arrays (Gr 11)',                url: 'grade11/practical/arrays.html',              grade: 'Grade 11 · Practical', tags: '1d array linear search binary search bubble sort selection sort parallel arrays date methods isleapyear dynamic array setlength high low unknown length constant' },
  { title: 'Text Files',                       url: 'grade11/practical/text-files.html',          grade: 'Grade 11 · Practical', tags: 'textfile assignfile reset rewrite append writeln readln eof fileexists csv exception handling' },
  { title: 'Procedures & Functions',           url: 'grade11/practical/methods.html',             grade: 'Grade 11 · Practical', tags: 'procedure function parameters return value user defined subroutine value parameter' },
  { title: 'Databases in Delphi (no SQL)',     url: 'grade11/practical/databases-delphi.html',    grade: 'Grade 11 · Practical', tags: 'adotable adoconnection datasource dbgrid database record field navigate insert edit delete post' },
  // Grade 11 Theory
  { title: 'Motherboard & Hardware (Gr 11)',   url: 'grade11/theory/hardware-gr11.html',          grade: 'Grade 11 · Theory',    tags: 'motherboard bus bios ram cache cpu pci sata slot expansion data flow vram' },
  { title: 'Processing Techniques',            url: 'grade11/theory/processing.html',             grade: 'Grade 11 · Theory',    tags: 'multitasking multiprocessing multithreading virtual memory compiler interpreter thrashing' },
  { title: 'Database Management',              url: 'grade11/theory/databases.html',              grade: 'Grade 11 · Theory',    tags: 'database dbms mysql access oracle data integrity records fields primary key foreign key validation' },
  { title: 'Networks & Protocols (Gr 11)',     url: 'grade11/theory/networks-gr11.html',          grade: 'Grade 11 · Theory',    tags: 'network topology star ring voip vpn wlan wimax 4g 5g protocol smtp pop3 imap http https thin thick client' },
  { title: 'Mobile Technology',                url: 'grade11/theory/mobile-tech.html',            grade: 'Grade 11 · Theory',    tags: 'smartphone tablet gps bluetooth wifi 4g 5g iot wearable location based computing lbc nfc' },
  { title: 'Computer Management (Gr 11)',      url: 'grade11/theory/computer-management.html',    grade: 'Grade 11 · Theory',    tags: 'malware virus worm trojan rootkit ransomware spyware antivirus firewall backup 321 rule threat' },
  { title: 'E-Communications (Gr 11)',         url: 'grade11/theory/e-communications-gr11.html',  grade: 'Grade 11 · Theory',    tags: 'blog microblog sms instant messaging voip video conferencing webinar podcast vlogging whatsapp' },
  { title: 'Internet & Multimedia (Gr 11)',    url: 'grade11/theory/internet-gr11.html',          grade: 'Grade 11 · Theory',    tags: 'web 1.0 2.0 3.0 big data streaming download vod iptv compression mp3 jpeg mp4 mpeg lossy lossless' },
  { title: 'Internet Services (Gr 11)',        url: 'grade11/theory/internet-services-gr11.html', grade: 'Grade 11 · Theory',    tags: 'static dynamic website http https mfa otp security token web designer developer career seo' },
  { title: 'Social Implications (Gr 11)',      url: 'grade11/theory/social-gr11.html',            grade: 'Grade 11 · Theory',    tags: 'iot big data 4ir digitalisation cybercrime identity theft blockchain digital footprint crowdsourcing crowdfunding social engineering' },
  // Grade 12 Practical
  { title: 'SQL (Gr 12)',                       url: 'grade12/sql.html',                           grade: 'Grade 12 · Practical', tags: 'sql select from where order by group having insert update delete like between distinct aggregate count sum avg round int format' },
  { title: 'SQL — Joining Tables',              url: 'grade12/sql-join.html',                      grade: 'Grade 12 · Practical', tags: 'sql join tables where clause cartesian product two tables from prefix field' },
  { title: 'OOP (Gr 12)',                       url: 'grade12/oop.html',                           grade: 'Grade 12 · Practical', tags: 'oop class object constructor accessor mutator encapsulation inheritance polymorphism uml private public tostring auxiliary' },
  { title: '2D Arrays (Gr 12)',                 url: 'grade12/arrays-2d.html',                     grade: 'Grade 12 · Practical', tags: '2d array two dimensional rows columns nested loops row total column total' },
  { title: 'Recursion (Delphi)',                url: 'grade12/recursion.html',                     grade: 'Grade 12 · Practical', tags: 'recursion recursive function factorial fibonacci base case stack overflow' },
  // Grade 12 Theory
  { title: 'Data Collection & Warehousing',    url: 'grade12/data-management.html',               grade: 'Grade 12 · Theory',    tags: 'data collection warehouse mining rfid cookie transaction loyalty card static dynamic location' },
  { title: 'Relational Databases & Normalisation', url: 'grade12/relational-db.html',             grade: 'Grade 12',             tags: 'relational database normalisation 1nf 2nf 3nf anomaly referential integrity primary foreign composite key transaction rollback erd entity relationship diagram crows foot one-to-many many-to-many record locking physical logical integrity' },
  { title: 'Hardware & Performance (Gr 12)',   url: 'grade12/hardware-gr12.html',                 grade: 'Grade 12',             tags: 'mobile hardware performance cpu clock speed ram cache ssd hdd gpu nic motivate user requirements' },
  { title: 'Cloud Computing, AI, VR & AR',      url: 'grade12/cloud-vr-ar.html',                   grade: 'Grade 12 · Theory',    tags: 'cloud computing saas virtual reality augmented reality mixed reality virtualisation ai artificial intelligence machine learning' },
  { title: 'Internet Technologies (Gr 12)',    url: 'grade12/internet-tech.html',                 grade: 'Grade 12',             tags: 'seo semantic search css php javascript xml online applications static dynamic ajax cookie' },
  { title: 'Networks & Remote Access (Gr 12)', url: 'grade12/networks-gr12.html',                 grade: 'Grade 12',             tags: 'adsl fibre wimax 4g 5g vpn remote access sharing bittorrent cloud storage permission' },
  { title: 'Communication Technologies',       url: 'grade12/communication-tech.html',            grade: 'Grade 12',             tags: 'adsl wimax 5g vpn encryption ssl otp mfa security token firewall bittorrent remote access' },
  { title: 'Cybercrime & Safeguards',          url: 'grade12/cybercrime.html',                    grade: 'Grade 12',             tags: 'cybercrime hacker cracker ransomware phishing identity theft sql injection ddos popia cybercrimes act safeguards' },
  { title: 'Social Implications (Gr 12)',      url: 'grade12/social-gr12.html',                   grade: 'Grade 12',             tags: 'big data social media privacy digital footprint globalisation 4ir cookies anonymity guid' },
  // Quick Reference
  { title: 'Quick Reference (all grades)',     url: 'quick-reference.html',                       grade: 'Quick Reference',      tags: 'quick reference recap revision cheat sheet summary programming delphi sql one page' },
  { title: 'Grade 10 — Programming Recap',     url: 'quick-ref-gr10.html',                        grade: 'Quick Reference',      tags: 'recap revision cheat sheet data types operators bodmas functions if case loops for while repeat strings formatting errors delphi grade 10' },
  { title: 'Grade 11 — Programming Recap',     url: 'quick-ref-gr11.html',                        grade: 'Quick Reference',      tags: 'recap revision cheat sheet 1d arrays linear binary search bubble selection sort parallel dynamic setlength text files procedures functions dates database adotable grade 11' },
  { title: 'Grade 12 — Programming Recap',     url: 'quick-ref-gr12.html',                        grade: 'Quick Reference',      tags: 'recap revision cheat sheet sql select join group by having aggregate 2d arrays oop class object inheritance encapsulation recursion factorial fibonacci grade 12' },
  // Study Tools
  { title: 'Grade 10 — Study by Term',         url: 'terms-gr10.html',                            grade: 'Study Tools',          tags: 'term planner grade 10 what to study term 1 2 3 4 schedule' },
  { title: 'Grade 11 — Study by Term',         url: 'terms-gr11.html',                            grade: 'Study Tools',          tags: 'term planner grade 11 what to study term 1 2 3 4 schedule' },
  { title: 'Grade 12 — Study by Term',         url: 'terms-gr12.html',                            grade: 'Study Tools',          tags: 'term planner grade 12 what to study term 1 2 3 schedule matric' },
  { title: 'Exam Extras (Out-of-CAPS)',         url: 'exam-extras.html',                           grade: 'Study Tools',          tags: 'exam extras out of caps blockchain ai deep fake dark web steganography stringreplace format random trycatch popia mesh bus topology raid ipv6' },
];

function getRoot() {
  // Mirror the depth detection used in nav.js so links always resolve,
  // regardless of how deep the URL prefix is.
  const path = window.location.pathname.replace(/\\/g, '/');
  const segs = path.split('/').filter(Boolean);
  const parent = segs[segs.length - 2] || '';
  if (/^(practical|theory)$/.test(parent)) return '../../';
  if (/^grade\d+$/.test(parent)) return '../';
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
