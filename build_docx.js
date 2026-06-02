// Build per-grade Word documents from build/data/*.json
// - Rasterises every extracted B&W diagram (build/svg/*.svg -> *.png)
// - Assembles grade10/11/12 .docx with headings, TOC, tables, code blocks,
//   callouts, lists, images and page breaks.
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const sizeOf = require("image-size");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents, VerticalAlign,
} = require("docx");

const ROOT = __dirname;
const DATA = path.join(ROOT, "build", "data");
const SVGDIR = path.join(ROOT, "build", "svg");

// ---- page geometry (A4, 1" margins) ----
const CONTENT_DXA = 11906 - 2 * 1440;        // 9026
const CONTENT_PX = Math.round((CONTENT_DXA / 1440) * 96); // ~602
const MAX_IMG_PX = 560;

const INK = "111111", SOFT = "333333", FAINT = "555555";
const RULE = "CCCCCC", PANEL = "F2F2F2", HEAD = "E8E8E8";
const MONO = "Consolas";

// ---------- rasterise all svgs ----------
function rasterise() {
  const files = fs.readdirSync(SVGDIR).filter(f => f.endsWith(".svg"));
  for (const f of files) {
    const svg = fs.readFileSync(path.join(SVGDIR, f), "utf8");
    const r = new Resvg(svg, { fitTo: { mode: "width", value: 1000 }, background: "white" });
    fs.writeFileSync(path.join(SVGDIR, f.replace(/\.svg$/, ".png")), r.render().asPng());
  }
  console.log("Rasterised " + files.length + " diagrams.");
}

// ---------- inline runs ----------
function runs(arr) {
  const out = [];
  for (const r of arr || []) {
    if (r.br) { out.push(new TextRun({ break: 1 })); continue; }
    const opt = { text: r.t || "" };
    if (r.b) opt.bold = true;
    if (r.i) opt.italics = true;
    if (r.code) { opt.font = MONO; opt.color = SOFT; opt.shading = { type: ShadingType.CLEAR, fill: PANEL }; }
    out.push(new TextRun(opt));
  }
  if (out.length === 0) out.push(new TextRun(""));
  return out;
}

// ---------- borders ----------
const B = (sz, col) => ({ style: BorderStyle.SINGLE, size: sz, color: col });
const cellBorders = { top: B(1, RULE), bottom: B(1, RULE), left: B(1, RULE), right: B(1, RULE) };
const noBorders = {
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
};

// ---------- image ----------
function imgType(src) {
  const e = src.split(".").pop().toLowerCase();
  return e === "jpeg" ? "jpg" : e;
}
function imageParagraphs(block) {
  let src = block.src;
  if (block.kind === "svg") src = block.src; // build/svg/..png
  const abs = path.join(ROOT, src);
  if (!fs.existsSync(abs)) return [new Paragraph({ children: [new TextRun({ text: "[missing image: " + src + "]", italics: true, color: FAINT })] })];
  let w, h;
  try { const d = sizeOf(abs); w = d.width; h = d.height; }
  catch (e) { w = block.w || 600; h = block.h || 400; }
  let dw = Math.min(w, MAX_IMG_PX), dh = Math.round(dw * h / w);
  const out = [new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: block.caption ? 20 : 160 },
    keepLines: true,   // never split the figure across pages
    keepNext: true,    // stay attached to caption / following text
    children: [new ImageRun({
      type: imgType(abs), data: fs.readFileSync(abs),
      transformation: { width: dw, height: dh },
      altText: { title: "diagram", description: src, name: "img" },
    })],
  })];
  if (block.caption) {
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 160 }, keepLines: true, keepNext: true,
      children: [new TextRun({ text: block.caption, italics: true, size: 17, color: FAINT })],
    }));
  }
  return out;
}

// ---------- table ----------
function buildTable(block) {
  const rows = block.rows;
  const ncols = rows.reduce((m, r) => Math.max(m, r.length), 1);
  const colW = Math.floor(CONTENT_DXA / ncols);
  const widths = Array(ncols).fill(colW);
  widths[ncols - 1] = CONTENT_DXA - colW * (ncols - 1);
  const trs = rows.map((cells, ri) => {
    const isHead = block.header && ri === 0;
    const tcs = [];
    for (let ci = 0; ci < ncols; ci++) {
      const cell = cells[ci] || [];
      tcs.push(new TableCell({
        width: { size: widths[ci], type: WidthType.DXA },
        borders: cellBorders,
        shading: isHead ? { type: ShadingType.CLEAR, fill: HEAD } : undefined,
        margins: { top: 60, bottom: 60, left: 110, right: 110 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: runs(cell).map(r => r),
        })],
      }));
    }
    return new TableRow({ children: tcs, tableHeader: isHead, cantSplit: true });
  });
  return new Table({
    width: { size: CONTENT_DXA, type: WidthType.DXA },
    columnWidths: widths,
    rows: trs,
  });
}

// ---------- callout (1-cell shaded box, thick left rule) ----------
function buildCallout(block) {
  const kids = [];
  if (block.title) kids.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: block.title.toUpperCase(), bold: true, size: 17, color: SOFT })],
  }));
  for (const b of block.body) kids.push(...renderBlock(b));
  const cell = new TableCell({
    width: { size: CONTENT_DXA, type: WidthType.DXA },
    borders: {
      top: B(1, RULE), bottom: B(1, RULE), right: B(1, RULE),
      left: { style: BorderStyle.SINGLE, size: 24, color: INK },
    },
    shading: { type: ShadingType.CLEAR, fill: "F6F6F6" },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    children: kids.length ? kids : [new Paragraph("")],
  });
  return new Table({
    width: { size: CONTENT_DXA, type: WidthType.DXA }, columnWidths: [CONTENT_DXA],
    rows: [new TableRow({ children: [cell], cantSplit: true })],
  });
}

// ---------- code box ----------
function buildCode(block) {
  const inner = [];
  if (block.label) inner.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text: block.label, font: MONO, size: 15, color: FAINT })],
  }));
  const lines = block.text.split("\n");
  for (const ln of lines) {
    inner.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 240 },
      children: [new TextRun({ text: ln.length ? ln : " ", font: MONO, size: 18, color: INK })],
    }));
  }
  const cell = new TableCell({
    width: { size: CONTENT_DXA, type: WidthType.DXA }, borders: cellBorders,
    shading: { type: ShadingType.CLEAR, fill: PANEL },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: inner,
  });
  return new Table({
    width: { size: CONTENT_DXA, type: WidthType.DXA }, columnWidths: [CONTENT_DXA],
    rows: [new TableRow({ children: [cell], cantSplit: true })],
  });
}

// ---------- card grid (hardware tiles) ----------
function buildCardGrid(block) {
  const cards = block.cards.filter(Boolean);
  if (!cards.length) return [];
  const ncols = Math.min(4, cards.length);
  const colW = Math.floor(CONTENT_DXA / ncols);
  const widths = Array(ncols).fill(colW);
  widths[ncols - 1] = CONTENT_DXA - colW * (ncols - 1);
  const cellPx = Math.round((colW / 1440) * 96) - 24;
  const rows = [];
  for (let i = 0; i < cards.length; i += ncols) {
    const slice = cards.slice(i, i + ncols);
    const tcs = [];
    for (let c = 0; c < ncols; c++) {
      const card = slice[c];
      const kids = [];
      if (card) {
        if (card.src) {
          const abs = path.join(ROOT, card.src);
          if (fs.existsSync(abs)) {
            let w, h; try { const d = sizeOf(abs); w = d.width; h = d.height; } catch (e) { w = 1; h = 1; }
            let dw = Math.min(w, cellPx, 120), dh = Math.round(dw * h / w);
            kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 },
              children: [new ImageRun({ type: imgType(abs), data: fs.readFileSync(abs),
                transformation: { width: dw, height: dh },
                altText: { title: card.name, description: card.name, name: "card" } })] }));
          }
        }
        kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 },
          children: [new TextRun({ text: card.name, bold: true, size: 17 })] }));
        if (card.desc) kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
          children: [new TextRun({ text: card.desc, size: 15, color: FAINT })] }));
      }
      tcs.push(new TableCell({ width: { size: widths[c], type: WidthType.DXA }, borders: cellBorders,
        verticalAlign: VerticalAlign.TOP, margins: { top: 80, bottom: 80, left: 80, right: 80 },
        children: kids.length ? kids : [new Paragraph("")] }));
    }
    rows.push(new TableRow({ children: tcs, cantSplit: true }));
  }
  return [new Table({ width: { size: CONTENT_DXA, type: WidthType.DXA }, columnWidths: widths, rows })];
}

// ---------- def grid ----------
function buildDefGrid(block) {
  const left = Math.round(CONTENT_DXA * 0.32), right = CONTENT_DXA - left;
  const rows = block.pairs.map(p => new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: left, type: WidthType.DXA }, borders: cellBorders,
      shading: { type: ShadingType.CLEAR, fill: "F6F6F6" }, margins: { top: 60, bottom: 60, left: 110, right: 110 },
      children: [new Paragraph({ children: [new TextRun({ text: p.term, bold: true })] })] }),
    new TableCell({ width: { size: right, type: WidthType.DXA }, borders: cellBorders,
      margins: { top: 60, bottom: 60, left: 110, right: 110 },
      children: [new Paragraph({ children: runs(p.desc) })] }),
  ] }));
  return new Table({ width: { size: CONTENT_DXA, type: WidthType.DXA }, columnWidths: [left, right], rows });
}

// ---------- term block ----------
function buildTermBlock(block, bulletRef) {
  const out = [];
  out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: (block.num ? block.num + " — " : "") + block.title })] }));
  if (block.subtitle) out.push(new Paragraph({ spacing: { after: 80 },
    children: [new TextRun({ text: block.subtitle, italics: true, color: FAINT })] }));
  for (const col of block.cols) {
    out.push(new Paragraph({ spacing: { before: 80, after: 20 },
      children: [new TextRun({ text: col.title, bold: true, size: 18, color: SOFT })] }));
    for (const it of col.items) {
      out.push(new Paragraph({ numbering: { reference: bulletRef, level: 0 },
        children: [new TextRun({ text: it })] }));
    }
  }
  return out;
}

// ---------- extras ----------
function buildExtras(block) {
  const out = [];
  for (const c of block.cards) {
    const head = [new TextRun({ text: c.title, bold: true })];
    if (c.tag) head.unshift(new TextRun({ text: "[" + c.tag + "] ", bold: true, color: FAINT, size: 18 }));
    out.push(new Paragraph({ spacing: { before: 120, after: 20 }, children: head }));
    if (c.desc && c.desc.length) out.push(new Paragraph({ spacing: { after: 60 }, children: runs(c.desc) }));
  }
  return out;
}

// ---------- block dispatch ----------
let BULLET_REF = "bullets";
let orderedCounter = 0;
const orderedRefs = [];

function renderBlock(block, opts) {
  opts = opts || {};
  const bind = !!opts.bindNext;  // keep last paragraph with the following block
  switch (block.type) {
    case "h1": {
      const kids = [new TextRun({ text: block.text })];
      return [new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: kids })];
    }
    case "h2": return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: block.text })] })];
    case "h3": return [new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: block.text })] })];
    case "h4": return [new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun({ text: block.text })] })];
    case "intro": return [renderIntro(block, bind)];
    case "p": return [new Paragraph({ spacing: { after: 120 }, keepLines: true, keepNext: bind, children: runs(block.runs) })];
    case "list": {
      let ref = BULLET_REF;
      if (block.ordered) { ref = orderedRefs[orderedCounter++]; }
      const last = block.items.length - 1;
      return block.items.map((it, i) => new Paragraph({
        numbering: { reference: ref, level: it.level || 0 },
        spacing: { after: 20 }, keepLines: true, keepNext: bind && i === last,
        children: runs(it.runs),
      }));
    }
    case "code": return [buildCode(block)];
    case "callout": return [buildCallout(block)];
    case "table": return [buildTable(block)];
    case "defgrid": return [buildDefGrid(block)];
    case "cardgrid": return buildCardGrid(block);
    case "termblock": return buildTermBlock(block, BULLET_REF);
    case "extras": return buildExtras(block);
    case "image": return imageParagraphs(block);
    default: return [];
  }
}

// intro handled simply (avoid the messy ternary above)
function renderIntro(block, keepNext) {
  return new Paragraph({
    spacing: { after: 200 }, keepLines: true, keepNext: !!keepNext,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 8 } },
    children: (block.runs || []).map(r => new TextRun({ text: r.t || "", italics: true, color: FAINT, size: 23 })),
  });
}

// block types that should pull their lead-in paragraph onto the same page
const BIND_TYPES = new Set(["image", "table", "code", "callout", "defgrid", "cardgrid"]);

// ---------- count ordered lists for numbering refs ----------
function countOrdered(chapters) {
  let n = 0;
  for (const ch of chapters) for (const b of ch.blocks) if (b.type === "list" && b.ordered) n++;
  return n;
}

// ---------- build one document ----------
function buildDoc(data, key) {
  orderedCounter = 0;
  orderedRefs.length = 0;
  const nOrdered = countOrdered(data.chapters);
  const numConfig = [
    { reference: BULLET_REF, levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 260 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 920, hanging: 260 } } } },
    ] },
  ];
  for (let i = 0; i < nOrdered; i++) {
    const ref = "num" + i; orderedRefs.push(ref);
    numConfig.push({ reference: ref, levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 520, hanging: 320 } } } },
    ] });
  }

  const children = [];
  // COVER
  children.push(new Paragraph({ spacing: { before: 2600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "INFORMATION TECHNOLOGY", bold: true, size: 28, color: FAINT, characterSpacing: 60 })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: data.grade, bold: true, size: 80 })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [new TextRun({ text: "Study Reference", size: 36, color: SOFT })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
    children: [new TextRun({ text: "Ms Coetzee  ·  CAPS-aligned  ·  Practical & Theory", size: 20, color: FAINT })] }));
  children.push(new Paragraph({ pageBreakBefore: true,
    children: [new TextRun({ text: "Contents", bold: true, size: 40 })] }));
  children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "" })] }));
  children.push(new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-1" }));

  // CHAPTERS
  for (const ch of data.chapters) {
    const blocks = ch.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const nb = blocks[i + 1];
      const bindNext = nb ? BIND_TYPES.has(nb.type) : false;
      if (block.type === "intro") { children.push(renderIntro(block, bindNext)); continue; }
      const rendered = renderBlock(block, { bindNext });
      for (const r of rendered) children.push(r);
    }
  }

  const doc = new Document({
    creator: "Ms Coetzee IT", title: "IT Study Reference — " + data.grade,
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: "Arial", size: 22, color: INK } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 40, bold: true, font: "Arial", color: INK },
          paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0, keepNext: true, keepLines: true,
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: INK, space: 6 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: INK },
          paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1, keepNext: true, keepLines: true,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 4 } } } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 25, bold: true, font: "Arial", color: SOFT },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true, keepLines: true } },
        { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: SOFT },
          paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 3, keepNext: true, keepLines: true } },
      ],
    },
    numbering: { config: numConfig },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "", size: 18, color: FAINT }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: FAINT })] })] }) },
      children,
    }],
  });
  return doc;
}

async function main() {
  rasterise();
  for (const key of ["grade10", "grade11", "grade12"]) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA, key + ".json"), "utf8"));
    const doc = buildDoc(data, key);
    const buf = await Packer.toBuffer(doc);
    const out = path.join(ROOT, "IT_Study_Reference_" + data.grade.replace(/\s+/g, "_") + ".docx");
    fs.writeFileSync(out, buf);
    console.log("Wrote " + path.basename(out) + " (" + (buf.length / 1024 | 0) + " KB)");
  }
}
main().catch(e => { console.error(e); process.exit(1); });
