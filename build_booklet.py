# -*- coding: utf-8 -*-
"""
Build a single print-ready, black-and-white booklet (booklet.html) from all the
content pages of the Ms Coetzee IT website.

- Pulls the <main class="content"> body out of every page (in the canonical
  nav.js order), drops the web chrome (top nav, sidebar, breadcrumb, prev/next).
- Rewrites ../images/ paths so they resolve from the repo root.
- Wraps each page as a chapter with a page break before it.
- Adds a cover page and a grouped table of contents.
- Ships a light, B&W print stylesheet that also recolours the inline dark-theme
  SVG diagrams to dark-on-white so they print cleanly.
"""

import os
import re
import io

ROOT = os.path.dirname(os.path.abspath(__file__))

# (group label, subgroup label, relative path, chapter title)  -- order = nav.js
PAGES = [
    ("Grade 10", "Practical", "grade10/practical/algorithms.html",        "Algorithms & Problem Solving"),
    ("Grade 10", "Practical", "grade10/practical/delphi-intro.html",      "Introduction to Delphi"),
    ("Grade 10", "Practical", "grade10/practical/delphi-components.html", "Delphi Components & Events"),
    ("Grade 10", "Practical", "grade10/practical/data-types.html",        "Data Types & Variables"),
    ("Grade 10", "Practical", "grade10/practical/operators.html",         "Operators & Functions"),
    ("Grade 10", "Practical", "grade10/practical/decisions.html",         "Decision Making (IF / CASE)"),
    ("Grade 10", "Practical", "grade10/practical/loops.html",             "Loops"),
    ("Grade 10", "Practical", "grade10/practical/strings.html",           "String Manipulation"),
    ("Grade 10", "Theory",    "grade10/theory/digital-tech.html",         "Digital Technologies & ICT"),
    ("Grade 10", "Theory",    "grade10/theory/hardware.html",             "Hardware"),
    ("Grade 10", "Theory",    "grade10/theory/software.html",             "Software & Licensing"),
    ("Grade 10", "Theory",    "grade10/theory/data-representation.html",  "Data Representation"),
    ("Grade 10", "Theory",    "grade10/theory/networks.html",             "Networks"),
    ("Grade 10", "Theory",    "grade10/theory/internet.html",             "Internet & WWW"),
    ("Grade 10", "Theory",    "grade10/theory/internet-services.html",    "Internet Services"),
    ("Grade 10", "Theory",    "grade10/theory/e-communication.html",      "E-Communication"),
    ("Grade 10", "Theory",    "grade10/theory/management.html",           "Computer Management & Security"),

    ("Grade 11", "Practical", "grade11/practical/arrays.html",            "1D Arrays"),
    ("Grade 11", "Practical", "grade11/practical/text-files.html",        "Text Files"),
    ("Grade 11", "Practical", "grade11/practical/methods.html",           "Procedures & Functions"),
    ("Grade 11", "Practical", "grade11/practical/databases-delphi.html",  "Databases in Delphi"),
    ("Grade 11", "Theory",    "grade11/theory/hardware-gr11.html",        "Motherboard & Hardware"),
    ("Grade 11", "Theory",    "grade11/theory/processing.html",           "Processing Techniques"),
    ("Grade 11", "Theory",    "grade11/theory/databases.html",            "Database Management"),
    ("Grade 11", "Theory",    "grade11/theory/networks-gr11.html",        "Networks & Protocols"),
    ("Grade 11", "Theory",    "grade11/theory/mobile-tech.html",          "Mobile Technology"),
    ("Grade 11", "Theory",    "grade11/theory/computer-management.html",  "Computer Management"),
    ("Grade 11", "Theory",    "grade11/theory/e-communications-gr11.html","E-Communications"),
    ("Grade 11", "Theory",    "grade11/theory/internet-gr11.html",        "Internet & Multimedia"),
    ("Grade 11", "Theory",    "grade11/theory/internet-services-gr11.html","Internet Services"),
    ("Grade 11", "Theory",    "grade11/theory/social-gr11.html",          "Social Implications"),

    ("Grade 12", "Practical", "grade12/sql.html",                         "SQL"),
    ("Grade 12", "Practical", "grade12/sql-join.html",                    "SQL - Joining Tables"),
    ("Grade 12", "Practical", "grade12/oop.html",                         "OOP"),
    ("Grade 12", "Practical", "grade12/arrays-2d.html",                   "2D Arrays"),
    ("Grade 12", "Practical", "grade12/recursion.html",                   "Recursion"),
    ("Grade 12", "Theory",    "grade12/data-management.html",             "Data Collection & Warehousing"),
    ("Grade 12", "Theory",    "grade12/relational-db.html",               "Relational Databases & Normalisation"),
    ("Grade 12", "Theory",    "grade12/hardware-gr12.html",               "Hardware & Performance"),
    ("Grade 12", "Theory",    "grade12/cloud-vr-ar.html",                 "Cloud Computing, AI, VR & AR"),
    ("Grade 12", "Theory",    "grade12/internet-tech.html",               "Internet Technologies"),
    ("Grade 12", "Theory",    "grade12/networks-gr12.html",               "Networks & Remote Access"),
    ("Grade 12", "Theory",    "grade12/communication-tech.html",          "Communication Technologies"),
    ("Grade 12", "Theory",    "grade12/cybercrime.html",                  "Cybercrime & Safeguards"),
    ("Grade 12", "Theory",    "grade12/social-gr12.html",                 "Social Implications"),

    ("Study Tools", "Term Planners", "terms-gr10.html",  "Grade 10 - By Term"),
    ("Study Tools", "Term Planners", "terms-gr11.html",  "Grade 11 - By Term"),
    ("Study Tools", "Term Planners", "terms-gr12.html",  "Grade 12 - By Term"),
    ("Study Tools", "Exam Resources","exam-extras.html", "Exam Extras (Out-of-CAPS)"),
]

MAIN_RE  = re.compile(r'<main class="content">(.*?)</main>', re.DOTALL)
CRUMB_RE = re.compile(r'<div class="breadcrumb">.*?</div>', re.DOTALL)
PNAV_RE  = re.compile(r'<div class="page-nav">.*?</div>\s*', re.DOTALL)
IMG_RE   = re.compile(r'((?:\.\./)+)images/')


def extract(path):
    with io.open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        html = fh.read()
    m = MAIN_RE.search(html)
    if not m:
        raise RuntimeError("no <main class='content'> in " + path)
    body = m.group(1)
    body = CRUMB_RE.sub("", body)
    body = PNAV_RE.sub("", body)
    body = IMG_RE.sub("images/", body)          # ../../images/ -> images/
    return body.strip()


def build():
    chapters = []
    toc_rows = []
    last_group = None
    last_sub = None

    for i, (group, sub, path, title) in enumerate(PAGES):
        cid = "ch%02d" % i
        body = extract(path)

        if group != last_group:
            toc_rows.append('<li class="toc-group">%s</li>' % group)
            last_group = group
            last_sub = None
        if sub != last_sub:
            toc_rows.append('<li class="toc-sub">%s</li>' % sub)
            last_sub = sub
        toc_rows.append('<li class="toc-item"><a href="#%s">%s</a></li>' % (cid, title))

        tag = group + (" &middot; " + sub if sub else "")
        chapters.append(
            '<section class="chapter" id="%s">\n'
            '  <div class="chapter-tag">%s</div>\n%s\n</section>' % (cid, tag, body)
        )

    toc_html = "\n".join(toc_rows)
    chapters_html = "\n\n".join(chapters)

    out = TEMPLATE.replace("{{TOC}}", toc_html).replace("{{CHAPTERS}}", chapters_html)
    with io.open(os.path.join(ROOT, "booklet.html"), "w", encoding="utf-8") as fh:
        fh.write(out)
    print("Wrote booklet.html with %d chapters." % len(PAGES))


TEMPLATE = u"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ms Coetzee IT - Study Reference (Printable Booklet)</title>
<style>
/* ============ B&W PRINTABLE BOOKLET ============ */
:root{ --ink:#111; --soft:#333; --faint:#555; --line:#888; --rule:#ccc; --panel:#f4f4f4; --head:#eaeaea; }
*,*::before,*::after{ box-sizing:border-box; margin:0; padding:0; }
html{ font-size:11.5pt; }
body{
  background:#fff; color:var(--ink);
  font-family:'Segoe UI', system-ui, Arial, sans-serif;
  line-height:1.55;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
a{ color:var(--ink); text-decoration:none; }

/* ---- page geometry + footer page numbers (print) ---- */
@page{
  size:A4;
  margin:18mm 16mm 16mm 16mm;
  @bottom-center{ content:counter(page); font-family:Arial, sans-serif; font-size:9pt; color:#555; }
}

.sheet{ max-width:760px; margin:0 auto; padding:24px; }

/* ---- COVER ---- */
.cover{ text-align:center; padding-top:24vh; page-break-after:always; }
.cover .brand{ font-size:14pt; letter-spacing:.25em; text-transform:uppercase; color:var(--faint); }
.cover h1{ font-size:34pt; font-weight:800; letter-spacing:-.02em; line-height:1.1; margin:.5em 0 .3em; }
.cover .sub{ font-size:13pt; color:var(--soft); max-width:30em; margin:0 auto 2.5em; }
.cover .grades{ font-size:11pt; color:var(--faint); border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); display:inline-block; padding:.6em 1.4em; }
.cover .foot{ margin-top:3em; font-size:9.5pt; color:var(--faint); }

/* ---- TABLE OF CONTENTS ---- */
.toc{ page-break-after:always; }
.toc h2{ font-size:20pt; border-bottom:2px solid var(--ink); padding-bottom:.3em; margin-bottom:1em; }
.toc ul{ list-style:none; }
.toc-group{ font-weight:800; font-size:13pt; margin:1.1em 0 .3em; border-bottom:1px solid var(--rule); padding-bottom:.2em; }
.toc-sub{ font-weight:700; font-size:9.5pt; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); margin:.7em 0 .2em; }
.toc-item{ margin:.12em 0 .12em 1.2em; font-size:10.5pt; }
.toc-item a{ color:var(--ink); }
.toc-item a::before{ content:"\\2022"; color:var(--line); margin-right:.6em; }

/* ---- CHAPTER ---- */
.chapter{ page-break-before:always; }
.chapter-tag{ font-size:8.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--faint); margin-bottom:.4em; }

h1{ font-size:21pt; font-weight:800; letter-spacing:-.01em; line-height:1.15; margin-bottom:.35em; page-break-after:avoid; }
h2{ font-size:15pt; font-weight:700; margin:1.4em 0 .5em; padding-bottom:.25em; border-bottom:1px solid var(--ink); page-break-after:avoid; }
h3{ font-size:12.5pt; font-weight:700; margin:1em 0 .35em; page-break-after:avoid; }
h4{ font-size:11pt; font-weight:700; margin:.9em 0 .3em; page-break-after:avoid; }
p{ margin-bottom:.7em; }
ul,ol{ margin:.4em 0 .8em 1.4em; }
li{ margin-bottom:.2em; }
strong{ font-weight:700; }

.grade-badge{ font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border:1px solid var(--line); padding:.12em .45em; border-radius:3px; vertical-align:middle; margin-left:.4em; color:var(--soft); white-space:nowrap; }

.page-intro{ font-size:11.5pt; color:var(--soft); margin-bottom:1.2em; padding-bottom:.8em; border-bottom:1px solid var(--rule); }

/* ---- CALLOUTS ---- */
.callout{ border:1px solid var(--rule); border-left:3px solid var(--ink); background:var(--panel); padding:.6em .9em; margin:.9em 0; border-radius:0 4px 4px 0; page-break-inside:avoid; }
.callout-title{ font-size:8.5pt; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:var(--soft); margin-bottom:.3em; }
.callout p{ margin:0; }

/* ---- TABLES ---- */
.tbl-wrap{ margin:.9em 0; overflow:visible; }
table{ width:100%; border-collapse:collapse; font-size:9.5pt; page-break-inside:avoid; }
th{ background:var(--head); text-align:left; padding:.4em .6em; font-size:8.5pt; text-transform:uppercase; letter-spacing:.04em; color:var(--soft); border:1px solid var(--rule); }
td{ padding:.4em .6em; border:1px solid var(--rule); vertical-align:top; }

/* ---- DEFINITION GRID ---- */
.def-grid{ display:grid; grid-template-columns:max-content 1fr; gap:.3em 1.2em; margin:.8em 0; }
.def-term{ font-weight:700; }

/* ---- CODE ---- */
.code-block{ margin:.9em 0; page-break-inside:avoid; }
.code-label{ display:inline-block; background:var(--head); border:1px solid var(--rule); border-bottom:none; padding:.18em .6em; font-size:8pt; color:var(--soft); border-radius:4px 4px 0 0; font-family:'Consolas','Courier New',monospace; }
pre{ background:var(--panel); border:1px solid var(--rule); border-radius:0 4px 4px 4px; padding:.7em .9em; overflow:visible; white-space:pre-wrap; word-wrap:break-word; font-size:9pt; line-height:1.45; font-family:'Consolas','Courier New',monospace; }
pre.no-label{ border-radius:4px; }
code{ font-family:'Consolas','Courier New',monospace; }
p code,li code,td code,th code{ background:var(--panel); border:1px solid var(--rule); padding:0 .25em; border-radius:3px; font-size:.92em; color:var(--ink); }
/* syntax tokens -> monochrome */
.kw,.kw2,.sql-kw{ color:var(--ink); font-weight:700; }
.str,.num,.fn,.cls,.sql-fn{ color:var(--ink); }
.cmt{ color:var(--faint); font-style:italic; }

/* ---- BADGES / TAGS ---- */
.badge,.extra-tag{ display:inline-block; font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:.1em .45em; border:1px solid var(--line); border-radius:3px; color:var(--soft); }

/* ---- IMAGES ---- */
img{ max-width:100%; height:auto; }
.img-float-right{ float:right; margin:0 0 .8em 1em; max-width:200px; border:1px solid var(--rule); padding:4px; border-radius:4px; }
.img-float-left{ float:left; margin:0 1em .8em 0; max-width:200px; border:1px solid var(--rule); padding:4px; border-radius:4px; }
.img-center{ display:block; margin:.8em auto; max-width:100%; border:1px solid var(--rule); padding:4px; border-radius:4px; }
.img-caption{ text-align:center; font-size:8.5pt; color:var(--faint); margin:.2em 0 .9em; }

.hw-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:.7em; margin:.9em 0; page-break-inside:avoid; }
.hw-card{ border:1px solid var(--rule); border-radius:6px; padding:.5em; text-align:center; page-break-inside:avoid; }
.hw-card img{ width:100%; max-height:100px; object-fit:contain; margin-bottom:.3em; }
.hw-card-name,.hw-card .hw-name{ font-size:9pt; font-weight:700; margin-bottom:.15em; }
.hw-card-desc,.hw-card .hw-desc{ font-size:8pt; color:var(--faint); line-height:1.35; }

.delphi-panel{ border:1px solid var(--rule); border-radius:6px; overflow:hidden; margin:.8em 0; page-break-inside:avoid; }
.delphi-panel img{ width:100%; display:block; }
.delphi-panel .dp-label{ padding:.35em .6em; font-size:8.5pt; font-weight:700; color:var(--soft); background:var(--head); border-top:1px solid var(--rule); }
.clearfix::after{ content:""; display:table; clear:both; }

/* ---- TERM PLANNER PAGES ---- */
.term-block{ border:1px solid var(--rule); border-radius:6px; margin-bottom:1.1em; overflow:hidden; page-break-inside:avoid; }
.term-header{ padding:.6em .9em; display:flex; align-items:center; gap:.8em; border-bottom:1px solid var(--rule); background:var(--panel); }
.term-num{ font-size:15pt; font-weight:800; min-width:2em; }
.term-title{ font-size:10.5pt; font-weight:700; }
.term-subtitle{ font-size:8.5pt; color:var(--faint); margin-top:.1em; }
.term-body{ display:grid; grid-template-columns:1fr 1fr; }
.term-col{ padding:.7em .9em; }
.term-col:first-child{ border-right:1px solid var(--rule); }
.term-col-title{ font-size:8pt; text-transform:uppercase; letter-spacing:.07em; color:var(--faint); margin-bottom:.4em; font-weight:700; }
.term-links{ list-style:none; margin:0; padding:0; }
.term-links li{ margin-bottom:.2em; }
.term-links a{ font-size:9pt; display:flex; align-items:center; gap:.4em; }
.tl-dot,.tl-plain{ width:5px; height:5px; border-radius:50%; background:var(--ink); flex-shrink:0; }
.tl-plain{ background:var(--line); }

/* ---- EXAM EXTRAS ---- */
.extras-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:.7em; margin:.9em 0; }
.extra-card{ border:1px solid var(--rule); border-left:3px solid var(--ink); border-radius:0 4px 4px 0; padding:.6em .8em; page-break-inside:avoid; }
.extra-card h4{ font-size:9.5pt; margin:.25em 0 .3em; }
.extra-card p{ font-size:8.5pt; color:var(--faint); margin:0; }

/* ---- SVG DIAGRAMS -> dark-on-white ----
   Flatten the dark-theme diagrams to white shapes, dark outlines, dark text.
   Text is forced dark with !important so labels stay readable on the now-white
   shapes (boxes, flowchart diamonds, pyramid levels are all <rect>/<polygon>). */
svg{ max-width:100%; height:auto; }
svg text{ fill:#111 !important; }
svg [fill]{ fill:#fff; }
svg [stroke]{ stroke:#222; }
svg rect,svg polygon,svg ellipse,svg circle,svg path,svg line,svg polyline,svg g{ stroke:#333; }

/* ---- generic break helpers ---- */
h2,h3,h4{ break-after:avoid; }
table,.callout,.code-block,.hw-card,.term-block,.extra-card,figure,svg{ break-inside:avoid; }

@media print{
  .sheet{ max-width:none; padding:0; }
  a{ color:var(--ink) !important; }
}
</style>
</head>
<body>
<div class="sheet">

  <!-- COVER -->
  <section class="cover">
    <div class="brand">Ms Coetzee &middot; Information Technology</div>
    <h1>IT Study Reference</h1>
    <p class="sub">A complete printable guide to Information Technology for Grades 10, 11 &amp; 12 - practical Delphi programming and theory.</p>
    <div class="grades">Grade 10 &nbsp;&bull;&nbsp; Grade 11 &nbsp;&bull;&nbsp; Grade 12 &nbsp;&bull;&nbsp; Study Tools</div>
    <div class="foot">CAPS-aligned &middot; Printable booklet edition</div>
  </section>

  <!-- TABLE OF CONTENTS -->
  <section class="toc">
    <h2>Contents</h2>
    <ul>
{{TOC}}
    </ul>
  </section>

  <!-- CHAPTERS -->
{{CHAPTERS}}

</div>
</body>
</html>
"""

if __name__ == "__main__":
    build()
