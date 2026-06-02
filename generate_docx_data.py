# -*- coding: utf-8 -*-
"""
Parse the IT website content pages into per-grade structured block lists (JSON)
for the Word-document builder, and extract every inline SVG diagram as a
standalone black-and-white .svg file (recoloured to dark-on-white for print).

Outputs:
  build/data/grade10.json, grade11.json, grade12.json
  build/svg/<key>__<n>.svg   (one per inline diagram)

A companion Node script (build_docx.js) rasterises the .svg files to .png and
assembles the .docx files.
"""

import os, re, json, io
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(ROOT, "build", "svg")
DATA_DIR = os.path.join(ROOT, "build", "data")
os.makedirs(SVG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# ---- page order (subgroup, path, chapter title) ----
G10 = [
    ("Practical", "grade10/practical/algorithms.html",        "Algorithms & Problem Solving"),
    ("Practical", "grade10/practical/delphi-intro.html",      "Introduction to Delphi"),
    ("Practical", "grade10/practical/delphi-components.html", "Delphi Components & Events"),
    ("Practical", "grade10/practical/data-types.html",        "Data Types & Variables"),
    ("Practical", "grade10/practical/operators.html",         "Operators & Functions"),
    ("Practical", "grade10/practical/decisions.html",         "Decision Making (IF / CASE)"),
    ("Practical", "grade10/practical/loops.html",             "Loops"),
    ("Practical", "grade10/practical/strings.html",           "String Manipulation"),
    ("Theory",    "grade10/theory/digital-tech.html",         "Digital Technologies & ICT"),
    ("Theory",    "grade10/theory/hardware.html",             "Hardware"),
    ("Theory",    "grade10/theory/software.html",             "Software & Licensing"),
    ("Theory",    "grade10/theory/data-representation.html",  "Data Representation"),
    ("Theory",    "grade10/theory/networks.html",             "Networks"),
    ("Theory",    "grade10/theory/internet.html",             "Internet & WWW"),
    ("Theory",    "grade10/theory/internet-services.html",    "Internet Services"),
    ("Theory",    "grade10/theory/e-communication.html",      "E-Communication"),
    ("Theory",    "grade10/theory/management.html",           "Computer Management & Security"),
    ("Term Planner", "terms-gr10.html",                       "Grade 10 - Study by Term"),
]
G11 = [
    ("Practical", "grade11/practical/arrays.html",            "1D Arrays"),
    ("Practical", "grade11/practical/text-files.html",        "Text Files"),
    ("Practical", "grade11/practical/methods.html",           "Procedures & Functions"),
    ("Practical", "grade11/practical/databases-delphi.html",  "Databases in Delphi"),
    ("Theory",    "grade11/theory/hardware-gr11.html",        "Motherboard & Hardware"),
    ("Theory",    "grade11/theory/processing.html",           "Processing Techniques"),
    ("Theory",    "grade11/theory/databases.html",            "Database Management"),
    ("Theory",    "grade11/theory/networks-gr11.html",        "Networks & Protocols"),
    ("Theory",    "grade11/theory/mobile-tech.html",          "Mobile Technology"),
    ("Theory",    "grade11/theory/computer-management.html",  "Computer Management"),
    ("Theory",    "grade11/theory/e-communications-gr11.html","E-Communications"),
    ("Theory",    "grade11/theory/internet-gr11.html",        "Internet & Multimedia"),
    ("Theory",    "grade11/theory/internet-services-gr11.html","Internet Services"),
    ("Theory",    "grade11/theory/social-gr11.html",          "Social Implications"),
    ("Term Planner", "terms-gr11.html",                       "Grade 11 - Study by Term"),
]
G12 = [
    ("Practical", "grade12/sql.html",                         "SQL"),
    ("Practical", "grade12/sql-join.html",                    "SQL - Joining Tables"),
    ("Practical", "grade12/oop.html",                         "OOP"),
    ("Practical", "grade12/arrays-2d.html",                   "2D Arrays"),
    ("Practical", "grade12/recursion.html",                   "Recursion"),
    ("Theory",    "grade12/data-management.html",             "Data Collection & Warehousing"),
    ("Theory",    "grade12/relational-db.html",               "Relational Databases & Normalisation"),
    ("Theory",    "grade12/hardware-gr12.html",               "Hardware & Performance"),
    ("Theory",    "grade12/cloud-vr-ar.html",                 "Cloud Computing, AI, VR & AR"),
    ("Theory",    "grade12/internet-tech.html",               "Internet Technologies"),
    ("Theory",    "grade12/networks-gr12.html",               "Networks & Remote Access"),
    ("Theory",    "grade12/communication-tech.html",          "Communication Technologies"),
    ("Theory",    "grade12/cybercrime.html",                  "Cybercrime & Safeguards"),
    ("Theory",    "grade12/social-gr12.html",                 "Social Implications"),
    ("Term Planner", "terms-gr12.html",                       "Grade 12 - Study by Term"),
]
# Exam Extras applies across all grades; appended to each booklet as an appendix.
EXAM = ("Appendix", "exam-extras.html", "Exam Extras (Out-of-CAPS)")

GRADES = [
    ("grade10", "Grade 10", G10),
    ("grade11", "Grade 11", G11),
    ("grade12", "Grade 12", G12),
]

SHAPE_TAGS = {"rect", "polygon", "circle", "ellipse", "path", "g"}

SVG_RE = re.compile(r"<svg\b.*?</svg>", re.DOTALL)
XML_ENTITIES = {"amp", "lt", "gt", "quot", "apos"}
_ENT_RE = re.compile(r"&([a-zA-Z][a-zA-Z0-9]*);")
_OLD_ENTITIES = {
    "&nbsp;": " ", "&middot;": "·", "&ndash;": "–", "&mdash;": "—",
    "&times;": "×", "&rarr;": "→", "&larr;": "←", "&hellip;": "…",
    "&deg;": "°", "&le;": "≤", "&ge;": "≥", "&ne;": "≠",
}


def sanitise_xml(s):
    # SVG <text> can carry HTML named entities (&harr; &infin; ...) undefined in
    # XML. Resolve them to literal characters, keeping the five XML-defined
    # entities intact so the markup stays well-formed for xml.etree.
    from html.entities import html5

    def repl(m):
        name = m.group(1)
        if name in XML_ENTITIES:
            return m.group(0)
        ch = html5.get(name + ";") or html5.get(name)
        return ch if ch is not None else m.group(0)

    return _ENT_RE.sub(repl, s)


def localname(tag):
    return tag.split("}")[-1]


# ---------- SVG recolour: dark-theme -> dark-on-white ----------
def recolour_svg(svg_str):
    # ET needs a single root; svg_str starts with <svg ...>...</svg>
    root = ET.fromstring(sanitise_xml(svg_str))

    # nodes that live inside <defs>/<marker> (arrowhead glyphs) stay dark-filled
    defs_nodes = set()
    for node in root.iter():
        if localname(node.tag) in ("defs", "marker"):
            for sub in node.iter():
                defs_nodes.add(sub)

    for node in root.iter():
        tag = localname(node.tag)
        fill = node.get("fill")
        stroke = node.get("stroke")

        if tag in ("text", "tspan"):
            node.set("fill", "#111111")
        elif node in defs_nodes:
            if fill is not None and fill != "none":
                node.set("fill", "#333333")
        elif tag in ("line", "polyline"):
            pass  # zero-area; only stroke matters
        else:
            if fill is None:
                if tag in SHAPE_TAGS:
                    node.set("fill", "#ffffff")
            elif fill != "none":
                node.set("fill", "#ffffff")

        if stroke is not None and stroke != "none":
            node.set("stroke", "#333333")

    # explicit intrinsic size from viewBox so .svg is standalone + rasteriser-friendly
    vb = root.get("viewBox")
    w = h = None
    if vb:
        nums = re.split(r"[ ,]+", vb.strip())
        if len(nums) == 4:
            w = float(nums[2]); h = float(nums[3])
    if w and h:
        root.set("width", str(w))
        root.set("height", str(h))
    else:
        try:
            w = float(re.sub(r"[^0-9.]", "", root.get("width", "")) or 0) or None
            h = float(re.sub(r"[^0-9.]", "", root.get("height", "")) or 0) or None
        except ValueError:
            w = h = None
    root.set("xmlns", "http://www.w3.org/2000/svg")

    out = ET.tostring(root, encoding="unicode")
    return out, (w or 600.0), (h or 400.0)


# ---------- inline runs ----------
def norm_ws(s):
    return re.sub(r"\s+", " ", s)


def runs_from(el, base=None):
    base = base or {}
    runs = []
    for node in el.children:
        if isinstance(node, NavigableString):
            txt = norm_ws(str(node))
            if txt:
                r = dict(base); r["t"] = txt; runs.append(r)
        elif isinstance(node, Tag):
            n = node.name
            if n in ("strong", "b"):
                runs += runs_from(node, dict(base, b=True))
            elif n in ("em", "i"):
                runs += runs_from(node, dict(base, i=True))
            elif n == "code":
                runs += runs_from(node, dict(base, code=True))
            elif n == "br":
                runs.append({"br": True})
            else:  # a, span, sub, sup, etc -> inline text
                runs += runs_from(node, base)
    return runs


def trim_runs(runs):
    # drop leading/trailing whitespace-only padding
    out = [r for r in runs]
    while out and out[0].get("t", "x").strip() == "" and "br" not in out[0]:
        out.pop(0)
    while out and out[-1].get("t", "x").strip() == "" and "br" not in out[-1]:
        out.pop()
    if out and "t" in out[0]:
        out[0]["t"] = out[0]["t"].lstrip()
    if out and "t" in out[-1]:
        out[-1]["t"] = out[-1]["t"].rstrip()
    return out


def fix_img_src(src):
    src = re.sub(r"^(\.\./)+", "", src)
    return src  # -> images/...


def has_class(el, cls):
    return el.has_attr("class") and cls in el["class"]


# ---------- block parsing ----------
class Parser:
    def __init__(self, page_key, raw_svgs):
        self.page_key = page_key
        self.svg_count = 0
        self.svgs = []  # (filename, w, h)
        self.raw_svgs = raw_svgs  # case-preserved markup, document order
        self.raw_i = 0

    def emit_svg(self, svg_tag):
        # use the raw (case-preserved) markup, not the bs4-lowercased tag
        if self.raw_i < len(self.raw_svgs):
            raw = self.raw_svgs[self.raw_i]
            self.raw_i += 1
        else:
            raw = str(svg_tag)
        try:
            out, w, h = recolour_svg(raw)
        except ET.ParseError as e:
            print("  ! SVG parse error in %s: %s" % (self.page_key, e))
            return None
        fn = "%s__%d.svg" % (self.page_key, self.svg_count)
        self.svg_count += 1
        with io.open(os.path.join(SVG_DIR, fn), "w", encoding="utf-8") as fh:
            fh.write(out)
        self.svgs.append((fn, w, h))
        return {"type": "image", "kind": "svg", "src": "build/svg/" + fn[:-4] + ".png", "w": w, "h": h}

    def list_block(self, el, ordered):
        items = []
        for li in el.find_all("li", recursive=False):
            # nested list inside li -> append as sub-items (one level)
            sub = li.find(["ul", "ol"], recursive=False)
            runs = trim_runs(runs_from(li))
            items.append({"runs": runs, "level": 0})
            if sub:
                for sli in sub.find_all("li", recursive=False):
                    items.append({"runs": trim_runs(runs_from(sli)), "level": 1})
        return {"type": "list", "ordered": ordered, "items": items}

    def table_block(self, table):
        rows = []
        header = False
        for i, tr in enumerate(table.find_all("tr", recursive=False) or table.find_all("tr")):
            cells = []
            is_head = False
            for cell in tr.find_all(["th", "td"], recursive=False):
                if cell.name == "th":
                    is_head = True
                cells.append(trim_runs(runs_from(cell)))
            if i == 0 and is_head:
                header = True
            rows.append(cells)
        return {"type": "table", "header": header, "rows": rows}

    def callout_block(self, el):
        title = ""
        t = el.find(class_="callout-title")
        if t:
            title = t.get_text(" ", strip=True)
        body = []
        for child in el.children:
            if isinstance(child, Tag):
                if has_class(child, "callout-title"):
                    continue
                if child.name == "p":
                    body.append({"type": "p", "runs": trim_runs(runs_from(child))})
                elif child.name in ("ul", "ol"):
                    body.append(self.list_block(child, child.name == "ol"))
        if not body:  # callout with bare text
            body.append({"type": "p", "runs": trim_runs(runs_from(el))})
        return {"type": "callout", "title": title, "body": body}

    def code_block(self, el):
        label = ""
        lab = el.find(class_="code-label")
        if lab:
            label = lab.get_text(" ", strip=True)
        pre = el.find("pre")
        text = pre.get_text() if pre else el.get_text()
        text = text.replace("\r\n", "\n").rstrip("\n")
        return {"type": "code", "label": label, "text": text}

    def hw_grid(self, el):
        cards = []
        for c in el.find_all(class_="hw-card", recursive=False):
            img = c.find("img")
            name_el = c.find(class_=re.compile(r"hw-(card-)?name"))
            desc_el = c.find(class_=re.compile(r"hw-(card-)?desc"))
            cards.append({
                "src": fix_img_src(img["src"]) if img and img.has_attr("src") else None,
                "name": name_el.get_text(" ", strip=True) if name_el else "",
                "desc": desc_el.get_text(" ", strip=True) if desc_el else "",
            })
        return {"type": "cardgrid", "cards": cards}

    def def_grid(self, el):
        pairs = []
        kids = [k for k in el.children if isinstance(k, Tag)]
        i = 0
        while i < len(kids):
            if has_class(kids[i], "def-term"):
                term = kids[i].get_text(" ", strip=True)
                desc = ""
                if i + 1 < len(kids) and has_class(kids[i + 1], "def-desc"):
                    desc = trim_runs(runs_from(kids[i + 1]))
                    i += 1
                pairs.append({"term": term, "desc": desc})
            i += 1
        return {"type": "defgrid", "pairs": pairs}

    def term_block(self, el):
        num = (el.find(class_="term-num") or {})
        num = num.get_text(" ", strip=True) if hasattr(num, "get_text") else ""
        title_el = el.find(class_="term-title")
        sub_el = el.find(class_="term-subtitle")
        title = title_el.get_text(" ", strip=True) if title_el else ""
        subtitle = sub_el.get_text(" ", strip=True) if sub_el else ""
        cols = []
        for col in el.find_all(class_="term-col"):
            ct = col.find(class_="term-col-title")
            col_title = ct.get_text(" ", strip=True) if ct else ""
            items = []
            ul = col.find(class_="term-links")
            if ul:
                for li in ul.find_all("li", recursive=False):
                    items.append(li.get_text(" ", strip=True))
            cols.append({"title": col_title, "items": items})
        return {"type": "termblock", "num": num, "title": title, "subtitle": subtitle, "cols": cols}

    def extras_grid(self, el):
        cards = []
        for c in el.find_all(class_="extra-card"):
            tag = c.find(class_="extra-tag")
            h = c.find(["h3", "h4"])
            p = c.find("p")
            cards.append({
                "tag": tag.get_text(" ", strip=True) if tag else "",
                "title": h.get_text(" ", strip=True) if h else "",
                "desc": trim_runs(runs_from(p)) if p else [],
            })
        return {"type": "extras", "cards": cards}

    def image_block(self, img, caption=None):
        return {"type": "image", "kind": "raster", "src": fix_img_src(img["src"]),
                "caption": caption or ""}

    def walk(self, container, blocks, skip):
        kids = [k for k in container.children if isinstance(k, Tag)]
        for idx, el in enumerate(kids):
            if id(el) in skip:
                continue
            name = el.name

            if has_class(el, "breadcrumb") or has_class(el, "page-nav"):
                continue
            if name in ("script", "style"):
                continue

            if name == "h1":
                badge = ""
                b = el.find(class_="grade-badge")
                if b:
                    badge = b.get_text(" ", strip=True)
                    b.extract()
                blocks.append({"type": "h1", "text": el.get_text(" ", strip=True), "badge": badge})
            elif name in ("h2", "h3", "h4"):
                blocks.append({"type": name, "text": el.get_text(" ", strip=True)})
            elif name == "p" and has_class(el, "page-intro"):
                blocks.append({"type": "intro", "runs": trim_runs(runs_from(el))})
            elif name == "p" and has_class(el, "img-caption"):
                continue  # consumed alongside its image
            elif name == "p":
                runs = trim_runs(runs_from(el))
                if runs:
                    blocks.append({"type": "p", "runs": runs})
            elif name in ("ul", "ol"):
                blocks.append(self.list_block(el, name == "ol"))
            elif name == "pre":
                blocks.append({"type": "code", "label": "", "text": el.get_text().rstrip("\n")})
            elif name == "table":
                blocks.append(self.table_block(el))
            elif name == "img":
                cap = ""
                # caption may follow as sibling p.img-caption
                if idx + 1 < len(kids) and kids[idx + 1].name == "p" and has_class(kids[idx + 1], "img-caption"):
                    cap = kids[idx + 1].get_text(" ", strip=True)
                    skip.add(id(kids[idx + 1]))
                blocks.append(self.image_block(el, cap))
            elif name == "svg":
                b = self.emit_svg(el)
                if b:
                    blocks.append(b)
            elif name == "div":
                if has_class(el, "callout"):
                    blocks.append(self.callout_block(el))
                elif has_class(el, "tbl-wrap"):
                    t = el.find("table")
                    if t:
                        blocks.append(self.table_block(t))
                elif has_class(el, "code-block"):
                    blocks.append(self.code_block(el))
                elif has_class(el, "hw-grid"):
                    blocks.append(self.hw_grid(el))
                elif has_class(el, "def-grid"):
                    blocks.append(self.def_grid(el))
                elif has_class(el, "delphi-panel"):
                    img = el.find("img")
                    lab = el.find(class_="dp-label")
                    cap = lab.get_text(" ", strip=True) if lab else ""
                    if img and img.has_attr("src"):
                        blocks.append(self.image_block(img, cap))
                elif has_class(el, "term-block"):
                    blocks.append(self.term_block(el))
                elif has_class(el, "extras-grid"):
                    blocks.append(self.extras_grid(el))
                elif el.find("svg", recursive=True) and not el.find(["p", "table", "ul"], recursive=True):
                    # wrapper div whose payload is one or more svgs
                    for s in el.find_all("svg", recursive=True):
                        b = self.emit_svg(s)
                        if b:
                            blocks.append(b)
                else:
                    # generic wrapper -> recurse
                    self.walk(el, blocks, skip)


def parse_page(path, chapter_title, subgroup):
    page_key = re.sub(r"[^a-zA-Z0-9]+", "_", path[:-5])
    with io.open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        text = fh.read()
    soup = BeautifulSoup(text, "html.parser")
    main = soup.find("main", class_="content")
    raw_svgs = SVG_RE.findall(text)
    p = Parser(page_key, raw_svgs)
    blocks = []
    p.walk(main, blocks, set())
    # ensure chapter has a heading even if page lacked h1
    if not blocks or blocks[0].get("type") != "h1":
        blocks.insert(0, {"type": "h1", "text": chapter_title, "badge": ""})
    return {"subgroup": subgroup, "title": chapter_title, "blocks": blocks}


def build():
    for key, gtitle, pages in GRADES:
        chapters = []
        for entry in list(pages) + [EXAM]:
            subgroup, path, title = entry
            chapters.append(parse_page(path, title, subgroup))
        doc = {"grade": gtitle, "chapters": chapters}
        with io.open(os.path.join(DATA_DIR, key + ".json"), "w", encoding="utf-8") as fh:
            json.dump(doc, fh, ensure_ascii=False)
        nsvg = len([f for f in os.listdir(SVG_DIR)])
        print("%s: %d chapters" % (gtitle, len(chapters)))
    print("Total SVG files: %d" % len(os.listdir(SVG_DIR)))


if __name__ == "__main__":
    build()
