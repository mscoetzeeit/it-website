# Bible Story Book: handoff

A pocket website of 155 Bible stories, Genesis to Acts, in order. Each story has a longer retelling in my own words, people chips, a "why it matters" note, a question, and a link to the passage in YouVersion.

## What's here
- `index.html` and `data.js`: the finished site, live at https://mscoetzeeit.co.za/bible/ (this `bible/` folder of the it-website repo, published by GitHub Pages). Plain static files, no build step.
- `source/`: how data.js was made. `build.js` merges `src-old.html` (the original 108 story summaries) with `long-1..11.js` (long text plus 47 new stories) and writes data.js. Edit the long-N.js files and rerun `node build.js` from inside `source/` (it reads src-old.html and writes data.js; copy the result up into this `bible/` folder, then commit and push).

## Details worth knowing
- data.js defines `const STORIES = [{e, t, r, p, s, w, q, l:[paragraphs], id}]` where e = era key, t = title, r = reference, p = people ("A; B"), s = summary, w = why it matters, q = question.
- Bible links: `https://www.bible.com/bible/{versionId}/{BOOK}.{chapter}.{verse}.{ABBR}`. A dropdown picks the version: NIV 111, NLT 116, ESV 59, NKJV 114, Afrikaans 1983 = 6, Afrikaans 1933/53 = 5. Compound references like "Acts 11:19-30; 13:1-3" are split into separate links. Tested at phone width on 2026-11-10: chapter links in all six versions and verse ranges open the right passage; a cross-chapter range (e.g. Exodus 3:1-4:17) opens the first chapter.
- "Mark as read" is saved in localStorage (keys bsb-read, bsb-hide, bsb-ver), per browser only.
- Keep the retellings in my own words with short quotes only. Long verbatim NIV text got blocked by a content filter earlier; the YouVersion links carry the real text.
- Fonts are Gloock and Literata from Google Fonts; light and dark themes follow the phone setting.
- Live preview (private claude.ai artifact): https://claude.ai/artifact/FDyoNyoV8rDHatMMt87QYy

