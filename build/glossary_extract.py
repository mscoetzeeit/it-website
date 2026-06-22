#!/usr/bin/env python
# Extract glossary entries from DBE/MTN IT learner books.
# Strategy: pdfplumber word extraction with font names.
#   - Term words   = font contains 'NeueLTStd-Md'  (medium/bold)
#   - Def words    = font contains 'NeueLTStd-Roman'
#   - Everything else (AvantGarde headers, section letters, footers) = skipped
#   - Ligature fragments are glued by merging adjacent words whose x-gap < 1.0
#   - Two-column pages handled by splitting at the page mid-gutter
import sys, json, re
import pdfplumber

BASE = r'C:/Users/maric/OneDrive - Bellville High School/Handboeke/IT/DBE MTN Textbooks/'

BOOKS = {
    'G10 Theory':  ('10/10 IT Learner Books & Data/Gr10 IT Theory.pdf', 'Gr10', 'Theory', range(168,174)),
    'G10 Prac':    ('10/10 IT Learner Books & Data/Gr10 IT Practical.pdf', 'Gr10', 'Practical', range(284,286)),
    'G11 Theory':  ('11/11 IT Learner Books & Data/Gr11_IT-Theory-LB-PRINT.pdf', 'Gr11', 'Theory', range(171,176)),
    'G11 Prac':    ('11/11 IT Learner Books & Data/Gr11_IT-Practical-LB-HiRes.pdf', 'Gr11', 'Practical', range(249,251)),
    'G12 Theory':  ('12/12 IT Learner Books & Data/Gr12_IT-Theory-LB-PRINT.pdf', 'Gr12', 'Theory', range(145,147)),
    'G12 Prac':    ('12/12 IT Learner Books & Data/Gr12_IT-Practical-LB–HiRes.pdf', 'Gr12', 'Practical', range(178,180)),
}

def classify(font):
    if 'NeueLTStd-Md' in font:   return 'TERM'
    if 'NeueLTStd-Roman' in font: return 'DEF'
    return 'SKIP'

def merge_ligatures(words):
    """Glue word tokens whose gap to the previous token is < 1.0 (ligature splits)."""
    out = []
    for w in words:
        if out and (w['x0'] - out[-1]['x1']) < 1.0 and abs(w['top'] - out[-1]['top']) < 3:
            out[-1]['text'] += w['text']
            out[-1]['x1'] = w['x1']
        else:
            out.append(dict(w))
    return out

def page_words_in_order(page):
    """Return words in reading order. use_text_flow preserves the PDF's content
    stream order, which matches true reading order (incl. column order) for these
    books; ligature fragments are then glued by the <1.0 x-gap rule."""
    words = page.extract_words(extra_attrs=['fontname'], use_text_flow=True)
    return merge_ligatures(words)

def clean(t):
    t = t.replace(' ', ' ')
    t = t.replace('’', "'").replace('‘', "'")
    t = t.replace('“', '"').replace('”', '"')
    t = t.replace('–', '-').replace('—', '-')
    t = re.sub(r'\s+', ' ', t).strip()
    return t

FOOTER = re.compile(r'(IT-(Theory|Practical)-LB|\.indb|INFORMATION TECHNOLOGY|GRADE 1[012])', re.I)

def parse_glossary(path, pages):
    entries = []
    cur_term, cur_def = [], []
    def flush():
        if cur_term:
            term = clean(' '.join(cur_term))
            defn = clean(' '.join(cur_def))
            if term:
                entries.append((term, defn))
    with pdfplumber.open(path) as pdf:
        for pno in pages:
            page = pdf.pages[pno-1]
            for w in page_words_in_order(page):
                cls = classify(w['fontname'])
                txt = w['text']
                if cls == 'SKIP':
                    continue
                if FOOTER.search(txt):
                    continue
                if cls == 'TERM':
                    # a TERM word after we've started a definition => new entry
                    if cur_def:
                        flush(); cur_term, cur_def = [], []
                    cur_term.append(txt)
                else:  # DEF
                    cur_def.append(txt)
    flush()
    return entries

def norm_key(term):
    k = term.lower()
    k = re.sub(r'\(.*?\)', '', k)            # drop parenthetical expansions
    k = k.replace('/', ' ')
    k = re.sub(r'[^a-z0-9 ]', '', k)
    k = re.sub(r'\s+', ' ', k).strip()
    return k

def run_one(name):
    rel, grade, kind, pages = BOOKS[name]
    return parse_glossary(BASE + rel, list(pages)), grade, kind

def aggregate():
    merged = {}   # key -> {term, def, grades:set, kinds:set, variants:set}
    per_book = {}
    for name in BOOKS:
        ents, grade, kind = run_one(name)
        per_book[name] = len(ents)
        for term, defn in ents:
            if len(defn) < 2:      # drop junk with no real definition
                continue
            key = norm_key(term)
            if not key:
                continue
            rec = merged.get(key)
            if rec is None:
                merged[key] = {'term': term, 'def': defn,
                               'grades': {grade}, 'kinds': {kind},
                               'variants': {term}}
            else:
                rec['grades'].add(grade); rec['kinds'].add(kind)
                rec['variants'].add(term)
                # prefer the most complete (longest) definition
                if len(defn) > len(rec['def']):
                    rec['def'] = defn
                # prefer a term variant that includes a parenthetical expansion
                if '(' in term and '(' not in rec['term']:
                    rec['term'] = term
                elif len(term) > len(rec['term']) and '(' not in rec['term']:
                    rec['term'] = term
    out = []
    GORDER = {'Gr10': 0, 'Gr11': 1, 'Gr12': 2}
    for key, rec in merged.items():
        out.append({
            'term': rec['term'],
            'definition': rec['def'],
            'grades': sorted(rec['grades'], key=lambda g: GORDER[g]),
            'kinds': sorted(rec['kinds']),
            'sort': key,
        })
    out.sort(key=lambda e: e['sort'])
    return out, per_book

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'all':
        data, per_book = aggregate()
        with open('build/data/glossary.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        print('Per book:', per_book)
        print('Total raw:', sum(per_book.values()), '| Unique merged:', len(data))
    else:
        name = sys.argv[1] if len(sys.argv) > 1 else 'G12 Theory'
        pages = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else list(BOOKS[name][3])
        ents = parse_glossary(BASE + BOOKS[name][0], pages)
        print(f'{name}: {len(ents)} entries')
        for t, d in ents:
            print(f'  [{t}] :: {d}')
