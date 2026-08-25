# Tier 1 Screenshot Plan

Each entry: **what to capture** → exact file/section to insert after → suggested filename → alt text.
Save all screenshots as `.png`, cropped tight to the relevant UI (not full-screen), light theme, same Office build throughout.

---

## Word

### 1. Ribbon overview, tabs labelled
- **Capture:** Full ribbon with Home tab active; if easy, annotate tab names (Home, Insert, Design, Layout, References, Mailings, Review, View, Developer)
- **Insert into:** `cat/grade10/practical/word-processing.html`, after `<h2>The Word Interface</h2>` (line 36)
- **Filename:** `word-ribbon-overview.png`
- **Alt:** "Microsoft Word ribbon showing all tabs"

### 2. Paragraph dialog → Line and Page Breaks (widow/orphan control)
- **Capture:** Paragraph dialog box open on the "Line and Page Breaks" tab, with Widow/Orphan control checkbox visible
- **Insert into:** `cat/grade12/practical/word-processing.html`, in the `<h2>Line Breaks and Pagination</h2>` section (line 184)
- **Filename:** `word-widow-orphan-control.png`
- **Alt:** "Paragraph dialog box, Line and Page Breaks tab, showing Widow/Orphan control"

### 3. Mail Merge wizard — Step 1 pane
- **Capture:** The Mail Merge task pane (Mailings → Start Mail Merge → Step-by-Step Mail Merge Wizard) showing the 6-step list
- **Insert into:** `cat/grade11/practical/word-processing.html`, in `<h2>Mail Merge</h2>` (line 175)
- **Filename:** `word-mailmerge-wizard.png`
- **Alt:** "Word Mail Merge step-by-step wizard pane"

### 4. Content Control / Legacy Tools ribbon group
- **Capture:** Developer tab ribbon showing the Controls group (Content Controls + Legacy Tools dropdown open)
- **Insert into:** `cat/grade12/practical/word-processing.html`, in `<h2>Content Controls & Form Fields</h2>` (line 64)
- **Filename:** `word-developer-controls.png`
- **Alt:** "Word Developer tab Controls group with Legacy Tools dropdown open"

### 5. Track Changes with visible markup
- **Capture:** A document with Track Changes on — show insertions underlined, deletions struck through, in a reviewer colour, plus the vertical change bar in the margin
- **Insert into:** `cat/grade12/practical/word-processing.html`, in `<h2>Tracking Changes</h2>` (line 166)
- **Filename:** `word-track-changes.png`
- **Alt:** "Word document with Track Changes showing insertions and deletions"

### 6. Table of Contents / Table of Figures dialog
- **Capture:** References → Table of Contents (or Table of Figures) dialog box
- **Insert into:** `cat/grade12/practical/word-processing.html`, near the Table of Figures content (search "Table of Figures", added recently around line ~150s — check current heading)
- **Filename:** `word-toc-dialog.png`
- **Alt:** "Word Table of Contents dialog box"

---

## Excel

### 7. Worksheet with Name Box + Formula Bar labelled
- **Capture:** A worksheet with a formula in the active cell, Name Box showing the cell reference, Formula Bar showing the formula
- **Insert into:** `cat/grade10/practical/spreadsheets.html`, replacing/supplementing the existing SVG `<figure>` in `<h2>The Excel Workspace</h2>` (lines 31–76)
- **Filename:** `excel-workspace-namebox-formulabar.png`
- **Alt:** "Excel worksheet with Name Box and Formula Bar labelled"

### 8. Conditional Formatting → Highlight Cells Rules menu
- **Capture:** Home → Conditional Formatting dropdown, hovering Highlight Cells Rules to show the flyout submenu
- **Insert into:** `cat/grade11/practical/spreadsheets.html`, in `<h2>Conditional Formatting</h2>` (line 54)
- **Filename:** `excel-conditional-formatting-menu.png`
- **Alt:** "Excel Conditional Formatting menu with Highlight Cells Rules submenu"

### 9. Format Cells dialog (Number tab)
- **Capture:** Format Cells dialog open on the Number tab, showing category list (General, Number, Currency, Percentage, Date…)
- **Insert into:** `cat/grade10/practical/spreadsheets.html`, in `<h2>Formatting Cells</h2>` (line 157)
- **Filename:** `excel-format-cells-number.png`
- **Alt:** "Excel Format Cells dialog box, Number tab"

### 10. Freeze Panes with grey divider line
- **Capture:** A worksheet scrolled right/down with frozen rows/columns, showing the thin grey boundary line
- **Insert into:** `cat/grade12/practical/spreadsheets.html`, in `<h2>Freezing Multiple Rows or Columns</h2>` (line 263)
- **Filename:** `excel-freeze-panes.png`
- **Alt:** "Excel worksheet with frozen panes showing the grey divider line"

### 11. XLOOKUP formula in the Formula Bar
- **Capture:** A cell with `=XLOOKUP(...)` visible in the Formula Bar, and the returned value showing in the cell
- **Insert into:** `cat/grade12/practical/spreadsheets.html`, in `<h3>XLOOKUP</h3>` (line 117)
- **Filename:** `excel-xlookup-formula.png`
- **Alt:** "Excel Formula Bar showing an XLOOKUP formula"

### 12. Data → Subtotal dialog
- **Capture:** The Subtotal dialog box (Data tab → Subtotal) with "At each change in", "Use function", and "Add subtotal to" fields visible
- **Insert into:** `cat/grade12/practical/spreadsheets.html`, in `<h2>Subtotal Feature</h2>` (line 291)
- **Filename:** `excel-subtotal-dialog.png`
- **Alt:** "Excel Subtotal dialog box"

### 13. Finished chart with title, axis labels, legend
- **Capture:** A column or line chart with a clear title, labelled axes, data labels, and legend visible
- **Insert into:** `cat/grade10/practical/spreadsheets.html`, in `<h2>Charts and Graphs (Term 4)</h2>` (line 219)
- **Filename:** `excel-chart-labelled.png`
- **Alt:** "Excel chart with title, axis labels and legend"

---

## Access

### 14. Table Design View — Field Name / Data Type / Field Properties
- **Capture:** Table in Design View, Field Name and Data Type columns filled in, Field Properties panel visible at the bottom (General tab)
- **Insert into:** `cat/grade11/practical/databases.html`, in `<h2>Field Properties</h2>` (line 96)
- **Filename:** `access-table-design-view.png`
- **Alt:** "Access Table Design View showing Field Properties panel"

### 15. Query Design View with Criteria filled in
- **Capture:** Query Design grid — field row, table row, Show checkbox, Criteria row with a value typed in
- **Insert into:** `cat/grade11/practical/databases.html`, in `<h2>Creating Queries</h2>` (line 170)
- **Filename:** `access-query-design-criteria.png`
- **Alt:** "Access Query Design View with criteria entered"

### 16. Relationships window with two linked tables
- **Capture:** Database Tools → Relationships, showing two tables joined by a line between their primary/foreign key fields
- **Insert into:** `cat/grade11/practical/databases.html`, in `<h2>Designing a Database for a Specific Purpose</h2>` (line 231) — this is the natural home since it discusses linking tables with a common field
- **Filename:** `access-relationships-window.png`
- **Alt:** "Access Relationships window showing two linked tables"

### 17. Report in Design View — Header/Detail/Footer bands
- **Capture:** A report open in Design View with the Report Header, Page Header, Detail, Page Footer and Report Footer bands all visible and labelled
- **Insert into:** `cat/grade12/practical/databases.html`, in `<h3>Report Structure with Groups</h3>` (line 99)
- **Filename:** `access-report-design-bands.png`
- **Alt:** "Access Report Design View showing header, detail and footer bands"

---

## Browser / HTML

### 18. Rendered HTML page next to its Notepad++ source
- **Capture:** Side-by-side (or two stacked screenshots) — Notepad++ showing the raw HTML on one side, the same page rendered in a browser on the other
- **Insert into:** `cat/grade10/practical/html.html`, in `<h2>What is HTML?</h2>` (line 31) or `<h2>Basic HTML Page Structure</h2>` (line 76)
- **Filename:** `html-source-vs-rendered.png`
- **Alt:** "HTML source code in Notepad++ next to the same page rendered in a browser"

---

## Once you have a batch ready

Send me the files (or a folder) and I'll:
1. Save them into a new `cat/images/` directory with consistent naming
2. Wire each one into its exact spot above using an `<img>` tag styled to match the site (`.img-center` class, bordered, max-width constrained)
3. Add matching `alt` text and an `.img-caption` where useful
4. Rebuild the booklets so the screenshots appear there too (note: booklet print CSS already has image handling built in)
