#!/usr/bin/env python
# Generate glossary.html (root level) from build/data/glossary.json
# plus hand-curated / NSC-memo supplements in build/data/glossary_extra.json.
# A curated entry ALWAYS wins over the textbook entry of the same key (the owner
# trusts NSC memo wording over the textbooks). An optional "override" field names
# a differently-spelled textbook term to remove (e.g. rename "key" -> "primary
# key"). An optional "source" field records provenance (e.g. "NSC P2 2023").
import json, html, string, os, re

data = json.load(open('build/data/glossary.json', encoding='utf-8'))

def _norm_key(term):
    k = term.lower()
    k = re.sub(r'\(.*?\)', '', k)
    k = k.replace('/', ' ')
    k = re.sub(r'[^a-z0-9 ]', '', k)
    return re.sub(r'\s+', ' ', k).strip()

for d in data:
    d.setdefault('source', 'textbook')

_extra = 'build/data/glossary_extra.json'
if os.path.exists(_extra):
    for e in json.load(open(_extra, encoding='utf-8')):
        key = _norm_key(e['term'])
        if not key:
            continue
        drop = {key}
        ov = e.get('override')
        if ov:
            for o in ([ov] if isinstance(ov, str) else ov):
                drop.add(_norm_key(o))
        data = [d for d in data if d['sort'] not in drop]
        data.append({'term': e['term'], 'definition': e['definition'],
                     'grades': e['grades'], 'kinds': e.get('kinds', ['Curated']),
                     'sort': key, 'source': e.get('source', 'curated')})
    data.sort(key=lambda e: e['sort'])

# Bucket by first character of the sort key (A-Z, else '#')
def bucket(e):
    c = (e['sort'][:1] or '#').upper()
    return c if c in string.ascii_uppercase else '#'

letters = ['#'] + list(string.ascii_uppercase)
buckets = {L: [] for L in letters}
for e in data:
    buckets[bucket(e)].append(e)
for L in buckets:
    buckets[L].sort(key=lambda e: e['sort'])

GB = {'Gr10': ('gb10', '10'), 'Gr11': ('gb11', '11'), 'Gr12': ('gb12', '12')}

def esc(s):
    return html.escape(s, quote=True)

def badges(grades):
    out = []
    for g in grades:
        cls, lbl = GB[g]
        out.append(f'<span class="gb {cls}" title="Grade {lbl}">{lbl}</span>')
    return ''.join(out)

# Build A-Z jump bar
az = []
for L in letters:
    if buckets[L]:
        az.append(f'<a href="#L{L if L!="#" else "num"}">{L}</a>')
    else:
        az.append(f'<span class="az-empty">{L}</span>')
az_bar = '\n'.join(az)

# Build sections
sections = []
for L in letters:
    items = buckets[L]
    if not items:
        continue
    anchor = 'Lnum' if L == '#' else f'L{L}'
    rows = []
    for e in items:
        term = esc(e['term'])
        _d = e['definition'].strip()
        if _d:
            _d = _d[0].upper() + _d[1:]      # sentence-case the definition
        defn = esc(_d)
        grades = ' '.join(e['grades'])
        search = esc((e['term'] + ' ' + e['definition']).lower())
        src = e.get('source', '')
        srcpill = (f'<span class="gsrc" title="Definition based on {esc(src)}">NSC</span>'
                   if src.startswith('NSC') else '')
        rows.append(
            f'<div class="gentry" data-s="{search}" data-g="{grades}">'
            f'<dt class="gterm">{term}<span class="gbs">{badges(e["grades"])}{srcpill}</span></dt>'
            f'<dd class="gdef">{defn}</dd></div>'
        )
    sections.append(
        f'<section class="gsec" id="{anchor}" data-letter="{L}">'
        f'<h2 class="gletter">{L}</h2><dl class="glist">{"".join(rows)}</dl></section>'
    )
sections_html = '\n'.join(sections)

total = len(data)

PAGE = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IT Glossary &middot; Ms Coetzee IT</title>
<link rel="stylesheet" href="css/style.css">
<style>
.gloss-wrap{{max-width:980px;margin:0 auto;padding:2.5rem 2rem 4rem;width:100%}}
.gloss-intro{{color:var(--muted);margin-bottom:1.25rem;max-width:70ch}}
.gloss-toolbar{{position:sticky;top:56px;z-index:5;background:var(--bg);
  padding:.75rem 0 .5rem;border-bottom:1px solid var(--border);margin-bottom:1rem}}
.gloss-search{{display:flex;align-items:center;gap:.5rem;background:var(--surface);
  border:1px solid var(--border);border-radius:8px;padding:.55rem .8rem}}
.gloss-search input{{border:0;background:transparent;outline:0;flex:1;
  font-size:.95rem;color:var(--text)}}
.gloss-search .si{{color:var(--muted)}}
.gloss-controls{{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;
  margin-top:.6rem;font-size:.8rem;color:var(--muted)}}
.gfilter{{display:inline-flex;gap:.3rem}}
.gchip{{cursor:pointer;user-select:none;border:1px solid var(--border);
  border-radius:999px;padding:.15rem .6rem;background:var(--surface);color:var(--muted)}}
.gchip.on.c10{{border-color:var(--gr10);color:var(--gr10)}}
.gchip.on.c11{{border-color:var(--gr11);color:var(--gr11)}}
.gchip.on.c12{{border-color:var(--gr12);color:var(--gr12)}}
.gchip.off{{opacity:.45;text-decoration:line-through}}
.gcount{{margin-left:auto}}
.az-bar{{display:flex;flex-wrap:wrap;gap:.15rem;margin:.6rem 0 0}}
.az-bar a,.az-bar span{{font-size:.78rem;font-weight:600;width:1.55rem;height:1.55rem;
  display:flex;align-items:center;justify-content:center;border-radius:5px;text-decoration:none}}
.az-bar a{{color:var(--accent);background:var(--surface)}}
.az-bar a:hover{{background:var(--surface2)}}
.az-bar .az-empty{{color:var(--border)}}
.gsec{{margin-top:1.5rem;scroll-margin-top:140px}}
.gletter{{font-size:1.5rem;font-weight:700;color:var(--accent);
  border-bottom:2px solid var(--border);padding-bottom:.2rem;margin-bottom:.6rem}}
.glist{{margin:0}}
.gentry{{padding:.6rem 0;border-bottom:1px solid var(--border)}}
.gterm{{font-weight:700;color:var(--text);font-size:1rem;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}}
.gdef{{margin:.2rem 0 0;color:var(--text);line-height:1.5}}
.gbs{{display:inline-flex;gap:.25rem}}
.gb{{font-size:.62rem;font-weight:700;border-radius:3px;padding:.05rem .3rem;
  border:1px solid currentColor;line-height:1.4}}
.gb.gb10{{color:var(--gr10)}}.gb.gb11{{color:var(--gr11)}}.gb.gb12{{color:var(--gr12)}}
.gsrc{{font-size:.58rem;font-weight:700;letter-spacing:.04em;border-radius:3px;
  padding:.05rem .3rem;color:#15803d;border:1px solid #15803d}}
[data-theme="dark"] .gsrc,html:not([data-theme="light"]) .gsrc{{color:#4ade80;border-color:#4ade80}}
.gloss-none{{color:var(--muted);font-style:italic;padding:2rem 0}}
:root{{--grade-color:#4ade80}}
@media print{{
  #topnav,.gloss-toolbar{{display:none!important}}
  .gloss-wrap{{max-width:none;padding:0}}
  .gentry{{break-inside:avoid}}
  *{{color:#000!important;background:#fff!important}}
  .gb,.gsrc{{border:1px solid #000!important}}
}}
</style>
</head>
<body>
<div id="topnav"></div>
<main style="flex:1">
<div class="gloss-wrap">
  <div class="breadcrumb"><a href="index.html">Home</a><span class="breadcrumb-sep">&rsaquo;</span><span>IT Glossary</span></div>
  <h1>IT Glossary</h1>
  <p class="gloss-intro">Key Information Technology terms from the official DBE/MTN learner books (Grades 10&ndash;12, Theory &amp; Practical), refined and expanded with wording from NSC exam memos, in one searchable list of <strong>{total}</strong> terms. Grade badges show where a term is introduced; a green <span class="gsrc">NSC</span> tag marks definitions taken from national marking guidelines. Type to filter, or jump by letter.</p>

  <div class="gloss-toolbar">
    <div class="gloss-search">
      <span class="si">&#128269;</span>
      <input type="text" id="gsearch" placeholder="Search terms and definitions&hellip;" autocomplete="off">
    </div>
    <div class="gloss-controls">
      <span>Show:</span>
      <span class="gfilter">
        <span class="gchip on c10" data-grade="Gr10">Gr 10</span>
        <span class="gchip on c11" data-grade="Gr11">Gr 11</span>
        <span class="gchip on c12" data-grade="Gr12">Gr 12</span>
      </span>
      <span class="gcount" id="gcount">{total} terms</span>
    </div>
    <nav class="az-bar">{az_bar}</nav>
  </div>

  <div id="glossary">{sections_html}</div>
  <p class="gloss-none" id="gnone" style="display:none">No terms match your search.</p>
</div>
</main>
<script src="./js/nav.js"></script>
<script src="js/main.js"></script>
<script>
(function(){{
  var search=document.getElementById('gsearch');
  var entries=[].slice.call(document.querySelectorAll('.gentry'));
  var secs=[].slice.call(document.querySelectorAll('.gsec'));
  var count=document.getElementById('gcount');
  var none=document.getElementById('gnone');
  var chips=[].slice.call(document.querySelectorAll('.gchip'));
  var active={{Gr10:true,Gr11:true,Gr12:true}};
  function apply(){{
    var q=search.value.trim().toLowerCase();
    var n=0;
    entries.forEach(function(e){{
      var okText=!q||e.dataset.s.indexOf(q)>-1;
      var gs=e.dataset.g.split(' ');
      var okGrade=gs.some(function(g){{return active[g];}});
      var show=okText&&okGrade;
      e.style.display=show?'':'none';
      if(show)n++;
    }});
    secs.forEach(function(s){{
      var any=s.querySelector('.gentry:not([style*="none"])');
      s.style.display=any?'':'none';
    }});
    count.textContent=n+(n===1?' term':' terms');
    none.style.display=n?'none':'';
  }}
  search.addEventListener('input',apply);
  chips.forEach(function(c){{
    c.addEventListener('click',function(){{
      var g=c.dataset.grade;active[g]=!active[g];
      c.classList.toggle('on');c.classList.toggle('off');
      apply();
    }});
  }});
}})();
</script>
</body>
</html>
'''

open('glossary.html', 'w', encoding='utf-8').write(PAGE)
print(f'Wrote glossary.html with {total} terms across {sum(1 for L in letters if buckets[L])} sections')
