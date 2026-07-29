# WARES Brand Case Study Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `wares.html` to harrys.monster — a brand case study of WARES (West Australian Robotics Education Specialists, warobotics.education) — and link it from the index projects section.

**Architecture:** One static page copying the shell of `single-use-software.html` (same head/nav/background/footer/CSS links), with a scoped `<style>` block for the WARES red/cream sections. Content comes from an interview with Harry (Task 1) and web-optimized assets (Task 2). No new CSS files, no new JS.

**Tech Stack:** Vanilla HTML/CSS. Python3 + PIL for image prep. Playwright CLI for screenshots and verification.

**Spec:** `docs/superpowers/specs/2026-07-29-wares-case-study-design.md`

## Global Constraints

- No new CSS or JS files; page-specific styles live in one `<style>` block in `wares.html`.
- Reuse the exact shell of `single-use-software.html`: head structure, `?v=4` CSS/JS links, SVG filter defs, background mount, header/nav, footer.
- WARES palette (extracted from `WARES Logos-01.png`): red `#991b1e`, cream `#fefaf8`. Mono variants exist (03 white/black, 04 black/white).
- All images land in `assets/wares/`, longest edge ≤ 1600px, photos as WebP quality 80, flat-color logo art as PNG.
- Every `<img>` has meaningful alt text; applications section uses self-contained `<figure>` blocks (spec step 6: future updates are copy-a-block-and-swap-the-image).
- Accessibility floor: one `h1`, ordered headings, WCAG AA text contrast, visible focus states (inherited from site CSS).
- Zero console errors when loaded in Chromium.
- Prose rules: run the stop-slop skill on all copy drafted in Task 1.

## Research checklist (drives page structure — already done, encoded here)

Strong brand case studies: lead with a one-line outcome; then context/brief; then the identity system presented as *decisions with reasons* (mark, type, color); then the brand applied in the real world (photos of use beat logo renders); then outcome + learnings. 800–1500 words total. Sources: Format, Toptal, Wix Playground, Ramotion, memorable.design case-study guides.

Page section order for `wares.html`:
1. Head/hero: title, one-line outcome, meta pills, hero logo figure
2. The brief (what WARES is, why it needed a brand, audience, constraints)
3. The identity (mark rationale, logo variant strip, type, color swatches)
4. In the wild (applications grid: bumpers, shipping labels, Kitbot microsite, docs site, storefront)
5. Outcome (where the brand lives now, results, learnings)

---

### Task 1: Interview Harry and draft the copy

**REQUIRES USER — run inline in the main session, not via subagent.**

**Files:**
- Create: `docs/superpowers/plans/2026-07-29-wares-copy.md`

**Interfaces:**
- Produces: `2026-07-29-wares-copy.md` with these exact section headers, each holding final approved prose: `## Outcome line`, `## The brief`, `## The identity`, `## In the wild` (one short caption per application, listed as `- bumpers:`, `- shipping:`, `- kitbot:`, `- docs:`, `- store:`), `## Outcome`, `## Meta pills` (3–5 short labels).

- [ ] **Step 1: Ask Harry these questions (one message, numbered):**

1. What is WARES in one sentence, and who is it for? (feeds The brief)
2. What existed before the brand, and what was the brief you set yourself? Any constraints (budget, print methods, existing materials)?
3. The mark reads as a torx/star socket inside a wrench-like C — what's the actual story and reasoning behind it?
4. Why the chunky retro type, and what typeface/lettering process was used?
5. Why red? Was `#991b1e`/cream chosen against anything (competitors, FIRST branding, print costs)?
6. What did "production" cover end-to-end (logo, print, labels, web, packaging…), and what tools did you use?
7. Where does the brand live today, and any results worth claiming (sales, teams reached, recognition)?
8. What would you repeat or change?

- [ ] **Step 2: Draft the copy** into `docs/superpowers/plans/2026-07-29-wares-copy.md` under the exact headers listed in Interfaces. Use the stop-slop skill. Total length 800–1500 words. Every design choice gets its reason from Harry's answers — no invented rationale.

- [ ] **Step 3: Show Harry the draft, apply corrections until approved.**

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-07-29-wares-copy.md
git commit -m "Add approved WARES case study copy"
```

---

### Task 2: Prepare web assets

**Files:**
- Create: `assets/wares/logo-red.png`, `logo-cream.png`, `logo-mono.png` (from `~/Documents/WARES/logos/WARES Logos-0{1,2,4}.png`)
- Create: `assets/wares/bumpers-1.webp`, `bumpers-2.webp` (best two of `~/Documents/WARES/BUMPERS/*.webp` — pick the sharpest showing the logo on a robot)
- Create: `assets/wares/shipping-label.png` (from `~/Downloads/WARES_ShipToPit_DDU.png`)
- Create: `assets/wares/site-kitbot.webp`, `site-docs.webp`, `site-store.webp` (fresh screenshots)

**Interfaces:**
- Produces: the eight files above; Task 3's HTML references them by these exact names.

- [ ] **Step 1: Copy and resize stills with PIL**

```bash
mkdir -p assets/wares
python3 - <<'EOF'
from PIL import Image
from pathlib import Path
jobs = [
    ("/home/harry/Documents/WARES/logos/WARES Logos-01.png", "assets/wares/logo-red.png", "PNG"),
    ("/home/harry/Documents/WARES/logos/WARES Logos-02.png", "assets/wares/logo-cream.png", "PNG"),
    ("/home/harry/Documents/WARES/logos/WARES Logos-04.png", "assets/wares/logo-mono.png", "PNG"),
    ("/home/harry/Downloads/WARES_ShipToPit_DDU.png", "assets/wares/shipping-label.png", "PNG"),
]
# ponytail: pick bumper shots by eye afterwards; start with the two largest files
bumpers = sorted(Path("/home/harry/Documents/WARES/BUMPERS").glob("*.webp"),
                 key=lambda p: p.stat().st_size, reverse=True)[:2]
jobs += [(str(p), f"assets/wares/bumpers-{i+1}.webp", "WEBP") for i, p in enumerate(bumpers)]
for src, dst, fmt in jobs:
    im = Image.open(src)
    im.thumbnail((1600, 1600))
    im.save(dst, fmt, quality=80)
    print(dst, im.size)
EOF
```

- [ ] **Step 2: Open the two bumper picks and confirm by eye they clearly show the WARES logo in use** (Read tool on the two `assets/wares/bumpers-*.webp`). If a rejected candidate is better, swap it in by editing the `bumpers` line and rerunning.

- [ ] **Step 3: Screenshot the three live sites**

```bash
npx -y playwright screenshot --viewport-size=1440,900 "https://staging.warobotics.education" assets/wares/site-store.png
npx -y playwright screenshot --viewport-size=1440,900 "https://kitbot.warobotics.education" assets/wares/site-kitbot.png
npx -y playwright screenshot --viewport-size=1440,900 "https://docs.warobotics.education" assets/wares/site-docs.png
python3 - <<'EOF'
from PIL import Image
for n in ("store", "kitbot", "docs"):
    im = Image.open(f"assets/wares/site-{n}.png")
    im.save(f"assets/wares/site-{n}.webp", "WEBP", quality=80)
    print(n, im.size)
EOF
rm assets/wares/site-*.png
```

(If `docs.` or `kitbot.` subdomains fail to resolve, screenshot the local copies instead: serve `~/Documents/WARES/KitbotInstructions2026` with `python3 -m http.server 8902` and screenshot `http://localhost:8902`; skip the docs shot and drop its figure from Task 3.)

- [ ] **Step 4: Check sizes and commit** — every file in `assets/wares/` should be under ~400 KB (`du -h assets/wares/*`). Re-save with `quality=70` any that exceed it.

```bash
git add assets/wares
git commit -m "Add WARES case study web assets"
```

---

### Task 3: Build wares.html

**Files:**
- Create: `wares.html`
- Read: `single-use-software.html` (shell source), `docs/superpowers/plans/2026-07-29-wares-copy.md` (copy)

**Interfaces:**
- Consumes: copy sections from Task 1 (exact headers listed there); asset filenames from Task 2.
- Produces: `wares.html` at repo root, linked target for Task 4's card.

- [ ] **Step 1: Create `wares.html`** by copying the entire shell of `single-use-software.html` (lines 1–99 head/nav and 125–133 footer/scripts verbatim), changing only: `<title>WARES | Harry Cassidy</title>`, meta description/OG title/description/canonical+og:url to `https://harrys.monster/wares.html`, and OG description to the copy's Outcome line.

- [ ] **Step 2: Add the scoped style block** just before `</head>`:

```html
<style>
  /* WARES case study palette — scoped, no site CSS touched */
  .wares { --wares-red: #991b1e; --wares-cream: #fefaf8; }
  .wares-panel { background: var(--wares-red); color: var(--wares-cream); border-radius: 16px; padding: 0; overflow: hidden; }
  .wares-panel img { display: block; width: 100%; height: auto; }
  .wares-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
  .wares-grid figure { margin: 0; background: var(--wares-cream); border: 1px solid rgba(153,27,30,.15); border-radius: 12px; overflow: hidden; }
  .wares-grid img { display: block; width: 100%; height: auto; }
  .wares-grid figcaption { padding: .75rem 1rem; font-size: .85rem; color: #4a1516; }
  .wares-swatches { display: flex; gap: .75rem; margin: 1rem 0; flex-wrap: wrap; }
  .wares-swatches span { font-family: "JetBrains Mono", monospace; font-size: .75rem; padding: 1.5rem 1rem .5rem; border-radius: 8px; min-width: 7.5rem; }
</style>
```

- [ ] **Step 3: Write the main content** inside `<main class="case-main wares">`, replacing each `{{…}}` token with the matching section from `2026-07-29-wares-copy.md`:

```html
<main class="case-main wares">
  <div class="case-head" data-reveal="left">
    <h1 class="case-title">WARES</h1>
    <p class="case-lede">{{Outcome line}}</p>
    <div class="case-meta">
      <!-- one tech-pill per label in copy.md "Meta pills" -->
      <span class="tech-pill">{{pill}}</span>
    </div>
  </div>

  <figure class="wares-panel" data-reveal="right">
    <img src="assets/wares/logo-red.png" alt="WARES logo: chunky cream retro wordmark with a star-socket mark, on brand red" width="1250" height="521">
  </figure>

  <div class="case-body glass" data-reveal="right">
    <h2>The brief</h2>
    {{The brief — as <p> paragraphs}}

    <h2>The identity</h2>
    {{The identity — as <p> paragraphs}}
    <div class="wares-grid">
      <figure><img src="assets/wares/logo-cream.png" alt="WARES logo, red on cream" loading="lazy"><figcaption>Primary lockup on cream</figcaption></figure>
      <figure><img src="assets/wares/logo-mono.png" alt="WARES logo, white on black" loading="lazy"><figcaption>Mono for single-colour print</figcaption></figure>
    </div>
    <div class="wares-swatches" aria-label="Brand colours">
      <span style="background:#991b1e;color:#fefaf8">#991B1E</span>
      <span style="background:#fefaf8;color:#991b1e;border:1px solid rgba(153,27,30,.3)">#FEFAF8</span>
    </div>

    <h2>In the wild</h2>
    <!-- To add an application later (spec step 6): copy one <figure> block below,
         swap src/alt/caption. Nothing else needs touching. -->
    <div class="wares-grid">
      <figure><img src="assets/wares/bumpers-1.webp" alt="WARES logo on FRC robot bumpers" loading="lazy"><figcaption>{{caption: bumpers}}</figcaption></figure>
      <figure><img src="assets/wares/bumpers-2.webp" alt="WARES-branded bumpers on a competition robot" loading="lazy"><figcaption>{{caption: bumpers}}</figcaption></figure>
      <figure><img src="assets/wares/shipping-label.png" alt="WARES ship-to-pit shipping label design" loading="lazy"><figcaption>{{caption: shipping}}</figcaption></figure>
      <figure><img src="assets/wares/site-store.webp" alt="warobotics.education storefront in the WARES brand" loading="lazy"><figcaption>{{caption: store}}</figcaption></figure>
      <figure><img src="assets/wares/site-kitbot.webp" alt="Kitbot build instructions microsite" loading="lazy"><figcaption>{{caption: kitbot}}</figcaption></figure>
      <figure><img src="assets/wares/site-docs.webp" alt="docs.warobotics.education documentation site" loading="lazy"><figcaption>{{caption: docs}}</figcaption></figure>
    </div>
    {{In the wild — any connecting prose}}

    <h2>Outcome</h2>
    {{Outcome — as <p> paragraphs}}
  </div>

  <a href="index.html#projects" class="case-back btn btn-ghost">&larr; All work</a>
</main>
```

Note: if `.case-lede` doesn't exist in `css/components.css` (check with grep), use a plain `<p>` inside `.case-head` — the site type styles cover it.

- [ ] **Step 4: Render check** — serve and eyeball both widths:

```bash
python3 -m http.server 8901 &
npx -y playwright screenshot --viewport-size=1440,900 --full-page "http://localhost:8901/wares.html" /tmp/claude-1000/-home-harry-Downloads-harrys-monster/540009f4-0048-4672-8504-637ffd1d5972/scratchpad/wares-desktop.png
npx -y playwright screenshot --viewport-size=390,844 --full-page "http://localhost:8901/wares.html" /tmp/claude-1000/-home-harry-Downloads-harrys-monster/540009f4-0048-4672-8504-637ffd1d5972/scratchpad/wares-mobile.png
```

Read both screenshots. Fix anything broken (overflow, missing images, unreadable text) before committing.

- [ ] **Step 5: Commit**

```bash
git add wares.html
git commit -m "Add WARES brand case study page"
```

---

### Task 4: Link from index

**Files:**
- Modify: `index.html` — projects list (`#projects` section, after the card with `card-index` 04) and `projects-rail-count`

**Interfaces:**
- Consumes: `wares.html` from Task 3; Outcome line + pills from Task 1.

- [ ] **Step 1: Add card 05** after the last `project-wrap` in `#projects`, matching the existing card markup exactly:

```html
<div class="project-wrap" data-reveal="right">
  <article class="card glass">
    <p class="card-index">05</p>
    <h3 class="card-title">WARES</h3>
    <p class="card-body">
      {{one-sentence card blurb derived from the Outcome line}}
    </p>
    <div class="tags">
      <span>Brand identity</span>
      <span>Print &amp; web</span>
    </div>
    <a href="wares.html" class="card-link">Read the case study <span aria-hidden="true">&rarr;</span></a>
  </article>
</div>
```

- [ ] **Step 2: Update the rail count** — change `<span class="projects-rail-count">04 case studies</span>` to `05 case studies`.

- [ ] **Step 3: Verify the index renders** (server from Task 3 still running):

```bash
npx -y playwright screenshot --viewport-size=1440,900 --full-page "http://localhost:8901/index.html" /tmp/claude-1000/-home-harry-Downloads-harrys-monster/540009f4-0048-4672-8504-637ffd1d5972/scratchpad/index-desktop.png
```

Read it; confirm card 05 appears and the layout holds.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Link WARES case study from index projects"
```

---

### Task 5: Final verification

**Files:** none (checks only)

- [ ] **Step 1: Console check** — load `http://localhost:8901/wares.html` in Chromium via Playwright and assert zero console errors:

```bash
node -e '
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = [];
  p.on("console", m => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", e => errs.push(String(e)));
  await p.goto("http://localhost:8901/wares.html", { waitUntil: "networkidle" });
  await b.close();
  if (errs.length) { console.error("CONSOLE ERRORS:", errs); process.exit(1); }
  console.log("clean");
})();'
```

Expected: `clean`. (Run from a dir where playwright is installed: `npm ls playwright || npx -y playwright --version` first; simplest is `cd "$(npm root -g)/.." || npx` — if node resolution fights back, fall back to checking the browser devtools by hand and say so.)

- [ ] **Step 2: A11y pass on wares.html** — grep-level checks:
  - exactly one `<h1>`; `h2`s in document order match the section list
  - every `<img>` has non-empty `alt`
  - contrast: body text on cream/glass uses site defaults (already AA); red-on-cream only for large text/captions ≥ AA (`#991b1e` on `#fefaf8` ≈ 6.9:1 — passes)

- [ ] **Step 3: Kill the server, review screenshots with Harry, apply visual feedback.**

- [ ] **Step 4: Push** (only if Harry says to publish — the site deploys from `main`).

---

## Post-launch update pass (spec step 6 — not scheduled now)

When the staging theme ships and Harry supplies more brand content: re-run Task 2 Step 3 against `https://warobotics.education`, add new `<figure>` blocks per the HTML comment in the In-the-wild grid, extend the Outcome copy, bump any changed asset filenames. No structural work.
