# -*- coding: utf-8 -*-
"""
Build three print-ready, black-and-white booklets for the CAT website:
  cat/booklet-gr10.html
  cat/booklet-gr11.html
  cat/booklet-gr12.html

Pulls <main class="content"> from each content page, strips breadcrumbs
and page-nav chrome, wraps each as a chapter with a page break, then
wraps the whole lot in the same print stylesheet used by the IT booklets.
"""

import os
import re
import io

ROOT    = os.path.dirname(os.path.abspath(__file__))
CAT_DIR = os.path.join(ROOT, "cat")

GRADE_PAGES = {
    "10": {
        "colour": "#0d9488",   # teal-600
        "desc":   "Word Processing, Spreadsheets, HTML, Hardware, Software, Networks, Internet & Social Implications",
        "chapters": [
            ("Practical (P1)", "grade10/practical/word-processing.html", "Word Processing"),
            ("Practical (P1)", "grade10/practical/spreadsheets.html",    "Spreadsheets"),
            ("Practical (P1)", "grade10/practical/html.html",            "HTML & Web Design"),
            ("Practical (P1)", "grade10/practical/presentations.html",   "Presentations (PAT)"),
            ("Theory (P2)",    "grade10/theory/concepts.html",           "Concepts of Computing"),
            ("Theory (P2)",    "grade10/theory/hardware.html",           "Hardware"),
            ("Theory (P2)",    "grade10/theory/software.html",           "Software & Licensing"),
            ("Theory (P2)",    "grade10/theory/networks.html",           "Networks"),
            ("Theory (P2)",    "grade10/theory/internet.html",           "Internet & E-Communication"),
            ("Theory (P2)",    "grade10/theory/social.html",             "Social Implications"),
            ("Year Planner",   "terms-gr10.html",                        "Grade 10 – By Term"),
        ],
    },
    "11": {
        "colour": "#7c3aed",   # violet-600
        "desc":   "Advanced Word, IF functions, Access Databases, HTML tables & links, LAN/WLAN, IoT, 4IR & Social Implications",
        "chapters": [
            ("Practical (P1)", "grade11/practical/word-processing.html", "Word Processing"),
            ("Practical (P1)", "grade11/practical/spreadsheets.html",    "Spreadsheets"),
            ("Practical (P1)", "grade11/practical/databases.html",       "Databases (Access)"),
            ("Practical (P1)", "grade11/practical/html.html",            "HTML & Web Design"),
            ("Theory (P2)",    "grade11/theory/hardware.html",           "Hardware & Processing"),
            ("Theory (P2)",    "grade11/theory/software.html",           "Software & Cloud"),
            ("Theory (P2)",    "grade11/theory/networks.html",           "Networks (LAN/WLAN)"),
            ("Theory (P2)",    "grade11/theory/internet.html",           "Internet, IoT & 4IR"),
            ("Theory (P2)",    "grade11/theory/social.html",             "Social Implications"),
            ("Year Planner",   "terms-gr11.html",                        "Grade 11 – By Term"),
        ],
    },
    "12": {
        "colour": "#b45309",   # amber-700
        "desc":   "Nested IF & VLOOKUP, advanced Access, mail merge, WAN, cybercrime & buying decisions",
        "chapters": [
            ("Practical (P1)", "grade12/practical/word-processing.html", "Word Processing"),
            ("Practical (P1)", "grade12/practical/spreadsheets.html",    "Spreadsheets"),
            ("Practical (P1)", "grade12/practical/databases.html",       "Databases (Access)"),
            ("Practical (P1)", "grade12/practical/html.html",            "HTML & Web Design"),
            ("Theory (P2)",    "grade12/theory/hardware.html",           "Hardware & Buying Decisions"),
            ("Theory (P2)",    "grade12/theory/software.html",           "Software & File Management"),
            ("Theory (P2)",    "grade12/theory/networks.html",           "Networks & WAN"),
            ("Theory (P2)",    "grade12/theory/internet.html",           "Internet & E-Communication"),
            ("Theory (P2)",    "grade12/theory/social.html",             "Social Implications"),
            ("Year Planner",   "terms-gr12.html",                        "Grade 12 – By Term"),
        ],
    },
}

MAIN_RE  = re.compile(r'<main class="content"[^>]*>(.*?)</main>', re.DOTALL)
CRUMB_RE = re.compile(r'<div class="breadcrumb">.*?</div>', re.DOTALL)
PNAV_RE  = re.compile(r'<div class="page-nav">.*?</div>\s*', re.DOTALL)
# Rewrite relative paths so images still resolve when loaded from cat/
IMG_RE   = re.compile(r'((?:\.\./)+)images/')


def extract(path):
    """Read a CAT page and return its <main class="content"> body, stripped of chrome."""
    full = os.path.join(CAT_DIR, path)
    if not os.path.exists(full):
        print("  SKIP (not found): " + path)
        return ""
    with io.open(full, encoding="utf-8") as fh:
        html = fh.read()
    m = MAIN_RE.search(html)
    if not m:
        print("  SKIP (no <main class='content'>): " + path)
        return ""
    body = m.group(1)
    body = CRUMB_RE.sub("", body)
    body = PNAV_RE.sub("", body)
    body = IMG_RE.sub("images/", body)
    return body.strip()


def build_grade(grade, info):
    chapters  = []
    toc_rows  = []
    last_sub  = None

    for i, (sub, path, title) in enumerate(info["chapters"]):
        cid  = "ch%02d" % i
        body = extract(path)
        if not body:
            continue

        if sub != last_sub:
            toc_rows.append('<li class="toc-sub">%s</li>' % sub)
            last_sub = sub
        toc_rows.append('<li class="toc-item"><a href="#%s">%s</a></li>' % (cid, title))

        chapters.append(
            '<section class="chapter" id="%s">\n'
            '  <div class="chapter-tag">Grade %s &middot; %s</div>\n%s\n</section>'
            % (cid, grade, sub, body)
        )

    toc_html      = "\n".join(toc_rows)
    chapters_html = "\n\n".join(chapters)

    out = (TEMPLATE
           .replace("{{GRADE}}",    grade)
           .replace("{{COLOUR}}",   info["colour"])
           .replace("{{DESC}}",     info["desc"])
           .replace("{{TOC}}",      toc_html)
           .replace("{{CHAPTERS}}", chapters_html))

    out_name = "booklet-gr%s.html" % grade
    out_path = os.path.join(CAT_DIR, out_name)
    with io.open(out_path, "w", encoding="utf-8") as fh:
        fh.write(out)
    print("Wrote cat/%s  (%d chapters)" % (out_name, len(chapters)))


def build():
    for grade in ("10", "11", "12"):
        build_grade(grade, GRADE_PAGES[grade])


TEMPLATE = u"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ms Coetzee CAT - Grade {{GRADE}} Study Reference (Printable Booklet)</title>
<style>
/* ============ B&W PRINTABLE BOOKLET - GRADE {{GRADE}} ============ */
:root{ --ink:#111; --soft:#333; --faint:#555; --line:#888; --rule:#ccc; --panel:#f4f4f4; --head:#eaeaea; --grade:{{COLOUR}}; }
*,*::before,*::after{ box-sizing:border-box; margin:0; padding:0; }
html{ font-size:11.5pt; }
body{
  background:#fff; color:var(--ink);
  font-family:'Segoe UI', system-ui, Arial, sans-serif;
  line-height:1.55;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
a{ color:var(--ink); text-decoration:none; }

@page{
  size:A4;
  margin:18mm 16mm 16mm 16mm;
  @bottom-center{ content:counter(page); font-family:Arial,sans-serif; font-size:9pt; color:#555; }
}

.sheet{ max-width:760px; margin:0 auto; padding:24px; }

/* ---- COVER ---- */
.cover{ text-align:center; padding-top:22vh; page-break-after:always; break-after:page; }
.cover .brand{ font-size:14pt; letter-spacing:.25em; text-transform:uppercase; color:var(--faint); }
.cover .gradenum{ font-size:64pt; font-weight:800; color:var(--grade); line-height:1; margin:.3em 0 .1em; }
.cover h1{ font-size:30pt; font-weight:800; letter-spacing:-.02em; line-height:1.1; margin:.1em 0 .3em; }
.cover .sub{ font-size:13pt; color:var(--soft); max-width:30em; margin:0 auto 2.5em; }
.cover .grades{ font-size:11pt; color:var(--faint); border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); display:inline-block; padding:.6em 1.4em; }
.cover .foot{ margin-top:3em; font-size:9.5pt; color:var(--faint); }

/* ---- TOC ---- */
.toc{ page-break-after:always; break-after:page; }
.toc h2{ font-size:20pt; border-bottom:2px solid var(--grade); padding-bottom:.3em; margin-bottom:1em; }
.toc ul{ list-style:none; }
.toc-sub{ font-weight:700; font-size:9.5pt; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); margin:1em 0 .3em; border-bottom:1px solid var(--rule); padding-bottom:.2em; }
.toc-item{ margin:.12em 0 .12em 1.2em; font-size:10.5pt; }
.toc-item a{ color:var(--ink); }
.toc-item a::before{ content:"\\2022"; color:var(--line); margin-right:.6em; }

/* ---- CHAPTER ---- */
.chapter{ page-break-before:always; break-before:page; }
.chapter-tag{ font-size:8.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--grade); margin-bottom:.4em; }

h1,h2,h3,h4,h5,h6{ break-after:avoid-page; break-inside:avoid-page; page-break-after:avoid; page-break-inside:avoid; }
h1{ font-size:21pt; font-weight:800; letter-spacing:-.01em; line-height:1.15; margin-bottom:.35em; }
h2{ font-size:15pt; font-weight:700; margin:1.4em 0 .5em; padding-bottom:.25em; border-bottom:1px solid var(--grade); }
h3{ font-size:12.5pt; font-weight:700; margin:1em 0 .35em; }
h4{ font-size:11pt; font-weight:700; margin:.9em 0 .3em; }

p,li,td{ orphans:3; widows:3; }
ul,ol{ margin:.4em 0 .8em 1.4em; }
li{ margin-bottom:.2em; }
strong{ font-weight:700; }
em{ font-style:italic; }

.grade-badge{ font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border:1px solid var(--line); padding:.12em .45em; border-radius:3px; vertical-align:middle; margin-left:.4em; color:var(--soft); white-space:nowrap; }

.page-intro{ font-size:11.5pt; color:var(--soft); margin-bottom:1.2em; padding-bottom:.8em; border-bottom:1px solid var(--rule); }

/* ---- TERM TAGS ---- */
.term-tag{ display:inline-block; font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:.1em .5em; border-radius:3px; border:1px solid var(--line); color:var(--soft); margin-bottom:.6em; }

/* ---- CALLOUTS ---- */
.callout{ border:1px solid var(--rule); border-left:3px solid var(--grade); background:var(--panel); padding:.6em .9em; margin:.9em 0; border-radius:0 4px 4px 0; page-break-inside:avoid; break-inside:avoid-page; }
.callout-title{ font-size:8.5pt; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:var(--soft); margin-bottom:.3em; }
.callout p,.callout ul{ margin:0; }
.callout ul{ margin-left:1.2em; margin-top:.3em; }

/* ---- TABLES ---- */
.tbl-wrap{ margin:.9em 0; overflow:visible; }
table{ width:100%; border-collapse:collapse; font-size:9.5pt; page-break-inside:avoid; break-inside:avoid-page; }
th{ background:var(--head); text-align:left; padding:.4em .6em; font-size:8.5pt; text-transform:uppercase; letter-spacing:.04em; color:var(--soft); border:1px solid var(--rule); }
td{ padding:.4em .6em; border:1px solid var(--rule); vertical-align:top; }

/* ---- DEFINITION GRID ---- */
.def-grid{ display:grid; grid-template-columns:max-content 1fr; gap:.3em 1.2em; margin:.8em 0; }
.def-term{ font-weight:700; }

/* ---- CODE ---- */
code{ font-family:'Consolas','Courier New',monospace; background:var(--panel); border:1px solid var(--rule); padding:0 .25em; border-radius:3px; font-size:.9em; }
pre{ background:var(--panel); border:1px solid var(--rule); border-radius:4px; padding:.7em .9em; overflow:visible; white-space:pre-wrap; word-wrap:break-word; font-size:9pt; line-height:1.45; font-family:'Consolas','Courier New',monospace; margin:.9em 0; page-break-inside:avoid; break-inside:avoid-page; }

/* ---- IMAGES ---- */
img{ max-width:100%; height:auto; }

/* ---- TERM PLANNER ---- */
.term-block{ border:1px solid var(--rule); border-radius:6px; margin-bottom:1.1em; overflow:hidden; page-break-inside:avoid; break-inside:avoid-page; }
.term-header{ padding:.6em .9em; display:flex; align-items:center; gap:.8em; border-bottom:1px solid var(--rule); background:var(--panel); }
.term-num{ font-size:15pt; font-weight:800; min-width:2em; color:var(--grade); }
.term-title{ font-size:10.5pt; font-weight:700; }
.term-subtitle{ font-size:8.5pt; color:var(--faint); margin-top:.1em; }
.term-body{ display:grid; grid-template-columns:1fr 1fr; }
.term-col{ padding:.7em .9em; }
.term-col:first-child{ border-right:1px solid var(--rule); }
.term-col-title{ font-size:8pt; text-transform:uppercase; letter-spacing:.07em; color:var(--faint); margin-bottom:.4em; font-weight:700; }
.term-links{ list-style:none; margin:0; padding:0; }
.term-links li{ margin-bottom:.2em; font-size:9pt; }

/* ---- MISC ---- */
.badge,.extra-tag{ display:inline-block; font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:.1em .45em; border:1px solid var(--line); border-radius:3px; color:var(--soft); }

/* Hide web-only chrome that got through the strip */
.topnav,.sidebar,.breadcrumb,.page-nav,.prev-next-nav{ display:none !important; }

/* SVG diagrams -> dark-on-white for print */
svg{ max-width:100%; height:auto; }
svg text{ fill:#111 !important; }
svg [fill]{ fill:#fff; }
svg [stroke]{ stroke:#222; }
svg rect,svg polygon,svg ellipse,svg circle,svg path,svg line,svg polyline{ stroke:#333; }
svg,figure{ break-inside:avoid-page; page-break-inside:avoid; }

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
    <div class="brand">Ms Coetzee &middot; Computer Applications Technology</div>
    <div class="gradenum">{{GRADE}}</div>
    <h1>Grade {{GRADE}} Study Reference</h1>
    <p class="sub">{{DESC}}</p>
    <div class="grades">Practical (P1) &nbsp;&bull;&nbsp; Theory (P2) &nbsp;&bull;&nbsp; Year Planner</div>
    <div class="foot">CAPS-aligned &middot; Printable booklet edition</div>
  </section>

  <!-- TABLE OF CONTENTS -->
  <section class="toc">
    <h2>Contents &mdash; Grade {{GRADE}}</h2>
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
