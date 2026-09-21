# Halftone Retheme Implementation Plan

> **Note, 21 Sep 2026:** the owner changed the hero, wordmark, tagline and nav logo during execution, so parts of this plan describe work that was replaced rather than what shipped. The design spec at v1.1 is the record of the built design.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the animated liquid-glass theme with a static match13-style theme: photo hero with an SVG halftone coast and dotted wordmark on index, flat white surfaces and system fonts everywhere else.

**Architecture:** Plain static HTML/CSS on GitHub Pages, no build step. The `.glass` class name stays in the HTML and is redefined as a flat card, so 13 pages of markup do not need their classes rewritten. One Python script generates the two halftone SVGs once and the output is committed. All motion code is deleted rather than disabled.

**Tech Stack:** HTML, CSS, vanilla JS, Python 3 + Pillow 12 (dev-time only, already installed). No ImageMagick or cwebp on this machine, Pillow does the image work.

**Spec:** `docs/superpowers/specs/2026-09-21-halftone-retheme-design.md`

## Global Constraints

- Light mode only.
- No `backdrop-filter`, no `filter: blur`, no `requestAnimationFrame`, no `fonts.googleapis` anywhere in `css/`, `js/` or `*.html`.
- Zero third-party requests on page load.
- Fonts: system sans, system mono. No font files.
- Motion: hover transitions only.
- Colour: keep `--bg #f5f7fc`, `--ink #111832`, `--accent #3b5bdb`. `--accent-2` and `--accent-3` are retired.
- Do not touch: the analytics `<script>` block in each page `<head>`, `assets/videos/`, guide code block styling (`.guide-content pre`, `.tok-*`), page copy other than the removed hero description placement, terminal and mission line.
- Halftone headland SVG: at most about 3,000 circles. Wordmark: about 1,500.
- Asset cache version goes from `?v=5` to `?v=6` on every page.
- All work happens on branch `retheme`. Never commit to `main`.
- Local preview: `python3 -m http.server 8080` from the repo root, then `http://localhost:8080/`.

## File map

| File | Responsibility after this plan |
|---|---|
| `tools/halftone.py` | Dev-time generator: image or text in, SVG of circles out |
| `tools/test_halftone.py` | Assert-based self-check for the generator |
| `assets/images/hero-sky.webp`, `hero-sky-800.webp` | Hero background photo, desktop and phone widths |
| `assets/images/halftone-coast.svg` | Halftone headland, used by index hero and inner-page band |
| `assets/images/CREDITS.md` | Source URL, author, licence for each downloaded image |
| `css/variables.css` | Tokens, minus glass/blob/glow/accent-2/accent-3/font imports |
| `css/layout.css` | Body, band, pill nav, hero, section scaffolding |
| `css/components.css` | Flat `.glass` card, buttons, cards, forms, reading styles |
| `css/responsive.css` | Breakpoints only |
| `js/main.js` | Footer year, nav toggle, scroll-spy, contact form |
| `docs/superpowers/perf/2026-09-21-retheme.md` | Before/after measurements |

---

### Task 1: Branch and baseline measurements

**Files:**
- Create: `docs/superpowers/perf/2026-09-21-retheme.md`

**Interfaces:**
- Produces: the "Before" table in the perf doc. Task 8 fills the "After" column using the same procedure.

- [ ] **Step 1: Branch**

```bash
git checkout -b retheme
git add docs/superpowers/specs/2026-09-21-halftone-retheme-design.md docs/superpowers/plans/2026-09-21-halftone-retheme.md
git commit -m "Add halftone retheme spec and plan"
```

- [ ] **Step 2: Serve the site**

Run in the background: `python3 -m http.server 8080`

- [ ] **Step 3: Measure index and one guide**

Use the chrome-devtools MCP tools. For each of `http://localhost:8080/index.html` and `http://localhost:8080/guide-to-github.html`:

1. `new_page` with the URL.
2. `emulate` with `viewport: "390x844x3,mobile,touch"`, `cpuThrottlingRate: 6`, `networkConditions: "Slow 4G"`.
3. `performance_start_trace` with `reload: true, autoStop: true`. Record LCP and CLS from the result.
4. `list_network_requests`, count requests whose host is not `localhost`.
5. `evaluate_script` with this function and record its return value:

```js
async () => {
  const run = (ms, scroll) => new Promise(res => {
    const out = { frames: 0, long: 0, worst: 0 };
    let last = performance.now(); const end = last + ms;
    const tick = now => {
      const d = now - last; last = now;
      out.frames++; if (d > 50) out.long++; if (d > out.worst) out.worst = Math.round(d);
      if (scroll) window.scrollBy(0, 40);
      now < end ? requestAnimationFrame(tick) : res(out);
    };
    requestAnimationFrame(tick);
  });
  window.scrollTo(0, 0);
  const idle = await run(5000, false);
  const scroll = await run(5000, true);
  return { idle, scroll };
}
```

`long` is the count of frames over 50 ms. `frames` over 5 s shows achieved frame rate (300 is a clean 60 fps).

- [ ] **Step 4: Write the perf doc**

```markdown
# Halftone retheme, before and after

harrys.monster · 21 Sep 2026

Emulation: 390x844 mobile, 6x CPU throttle, Slow 4G, local server.

| Page | Metric | Before | After |
|---|---|---|---|
| index | LCP (ms) | | |
| index | CLS | | |
| index | Third-party requests | | |
| index | Idle: frames / long / worst ms | | |
| index | Scroll: frames / long / worst ms | | |
| guide-to-github | LCP (ms) | | |
| guide-to-github | CLS | | |
| guide-to-github | Third-party requests | | |
| guide-to-github | Idle: frames / long / worst ms | | |
| guide-to-github | Scroll: frames / long / worst ms | | |
```

Fill the Before column with the recorded numbers.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/perf/2026-09-21-retheme.md
git commit -m "Record pre-retheme performance baseline"
```

---

### Task 2: Halftone generator

**Files:**
- Create: `tools/halftone.py`
- Create: `tools/test_halftone.py`

**Interfaces:**
- Produces: `halftone(shape, tone, cols, rmax=0.5, rmin=0.08) -> (cols, rows, [(cx, cy, r), ...])` and `to_svg(w, h, circles) -> str`.
- Produces CLI: `python3 tools/halftone.py photo SRC OUT.svg --cols N --threshold T [--box L,T,R,B]` and `python3 tools/halftone.py text "STRING" OUT.svg --cols N --font PATH`.

- [ ] **Step 1: Write the failing test**

`tools/test_halftone.py`:

```python
"""Run: python3 tools/test_halftone.py"""
from PIL import Image
from halftone import halftone, to_svg

# Left half solid, right half empty. Tone brightens top to bottom.
shape = Image.new("L", (200, 100), 0)
shape.paste(255, (0, 0, 100, 100))
tone = Image.new("L", (200, 100))
tone.putdata([int(255 * (y / 99)) for y in range(100) for _ in range(200)])

w, h, circles = halftone(shape, tone, cols=20)
assert (w, h) == (20, 10), (w, h)
assert circles, "no circles"
assert all(cx < 11 for cx, _, _ in circles), "dots leaked into the empty half"
top = max(r for _, cy, r in circles if cy < 2)
bottom = max(r for _, cy, r in circles if cy > 8)
assert bottom > top, "brighter tone must give bigger dots"
assert all(0.08 <= r <= 0.5 for _, _, r in circles)

svg = to_svg(w, h, circles)
assert svg.startswith("<svg") and svg.count("<circle") == len(circles)
assert 'viewBox="0 0 20 10"' in svg
print("ok", len(circles), "circles")
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `cd tools && python3 test_halftone.py`
Expected: `ModuleNotFoundError: No module named 'halftone'`

- [ ] **Step 3: Write the generator**

`tools/halftone.py`:

```python
#!/usr/bin/env python3
"""Halftone SVG generator for harrys.monster. Run once, commit the output. Needs Pillow."""
import argparse
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


def halftone(shape, tone, cols, rmax=0.5, rmin=0.08):
    """shape and tone are same-size 'L' images: shape is coverage (255 = solid),
    tone is brightness. One circle per grid cell, in grid units. The LANCZOS
    downsample leaves partial coverage at the edges, which feathers the dots."""
    rows = round(cols * shape.height / shape.width)
    s = shape.resize((cols, rows), Image.LANCZOS)
    t = tone.resize((cols, rows), Image.LANCZOS)
    circles = []
    for y in range(rows):
        for x in range(cols):
            r = rmax * (s.getpixel((x, y)) / 255) * (0.35 + 0.65 * t.getpixel((x, y)) / 255)
            if r >= rmin:
                circles.append((x + 0.5, y + 0.5, round(min(r, rmax), 2)))
    return cols, rows, circles


def to_svg(w, h, circles):
    body = "".join(f'<circle cx="{cx:g}" cy="{cy:g}" r="{r:g}"/>' for cx, cy, r in circles)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="#fff">{body}</svg>'


def from_photo(path, threshold, box):
    img = Image.open(path).convert("L")
    if box:
        img = img.crop(box)
    # Land is darker than sky: everything under the threshold is the shape.
    shape = img.point(lambda v: 255 if v < threshold else 0).filter(ImageFilter.GaussianBlur(2))
    return shape, ImageOps.autocontrast(img)


def from_text(text, font_path):
    font = ImageFont.truetype(font_path, 400)
    l, t, r, b = font.getbbox(text)
    shape = Image.new("L", (r - l + 40, b - t + 40), 0)
    ImageDraw.Draw(shape).text((20 - l, 20 - t), text, fill=255, font=font)
    return shape, Image.new("L", shape.size, 255)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["photo", "text"])
    p.add_argument("src", help="image path, or the string in text mode")
    p.add_argument("out")
    p.add_argument("--cols", type=int, default=90)
    p.add_argument("--threshold", type=int, default=110)
    p.add_argument("--box", type=lambda s: tuple(int(v) for v in s.split(",")))
    p.add_argument("--font", default="/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf")
    a = p.parse_args()
    shape, tone = from_text(a.src, a.font) if a.mode == "text" else from_photo(a.src, a.threshold, a.box)
    w, h, circles = halftone(shape, tone, a.cols)
    open(a.out, "w").write(to_svg(w, h, circles))
    print(f"{a.out}: {len(circles)} circles, {w}x{h}")
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd tools && python3 test_halftone.py`
Expected: `ok <n> circles`

- [ ] **Step 5: Commit**

```bash
git add tools/
git commit -m "Add halftone SVG generator"
```

---

### Task 3: Source images and generated assets

**Human gate: Harry picks the photos and approves each download.**

**Files:**
- Create: `assets/images/hero-sky.webp`, `assets/images/hero-sky-800.webp`
- Create: `assets/images/halftone-coast.svg`
- Create: `assets/images/CREDITS.md`
- Scratch only (not committed): the downloaded originals, in the session scratchpad directory

**Interfaces:**
- Consumes: `tools/halftone.py` CLI from Task 2.
- Produces: the three image paths above, exact names, used by Tasks 5 and 6. The wordmark SVG is written to the scratchpad as `wordmark.svg` and inlined into `index.html` in Task 5.

- [ ] **Step 1: Shortlist**

Search Unsplash and Wikimedia Commons for:
- Background: blue sky with cumulus cloud over open ocean, landscape orientation, at least 2400px wide, empty lower-right third (the halftone covers it). Find 3 candidates.
- Halftone source: a WA coastal headland with a lighthouse, shot against bright sky so the land is darker than the sky. Search terms: "Bathurst Lighthouse Rottnest", "Wadjemup Lighthouse", "Cape Leeuwin Lighthouse", "Cape Naturaliste lighthouse". Find 3 candidates.

Only accept the Unsplash Licence, CC0, or public domain. Skip CC BY-SA, the share-alike clause is awkward for a derived graphic.

Show Harry each candidate's page URL, author and licence. If none of the lighthouse candidates has a clean dark-on-bright silhouette, say so and offer the Perth skyline from Kings Park instead (spec fallback).

- [ ] **Step 2: Download the two picks**

Ask Harry before each download, stating filename, source and size. Save originals to the scratchpad as `sky-src.jpg` and `coast-src.jpg`.

- [ ] **Step 3: Make the hero photo**

```bash
python3 - <<'EOF'
from PIL import Image, ImageOps
S = "<scratchpad>/sky-src.jpg"
for w, h, name in [(1920, 1200, "hero-sky.webp"), (800, 1400, "hero-sky-800.webp")]:
    ImageOps.fit(Image.open(S).convert("RGB"), (w, h), centering=(0.5, 0.4)) \
        .save(f"assets/images/{name}", "WEBP", quality=72, method=6)
EOF
ls -l assets/images/hero-sky*.webp
```

Replace `<scratchpad>` with the session scratchpad path. Targets: about 150 KB and about 60 KB. If over by more than a third, drop `quality` to 64 and rerun.

- [ ] **Step 4: Generate the headland**

```bash
python3 tools/halftone.py photo <scratchpad>/coast-src.jpg assets/images/halftone-coast.svg --cols 90 --threshold 110
```

Open the SVG over a blue background to judge it:

```bash
printf '<body style="margin:0;background:#2f7fe0"><img src="/assets/images/halftone-coast.svg" style="width:60vw;position:fixed;right:0;bottom:0">' > preview.html
```

View `http://localhost:8080/preview.html` and take a screenshot. Tune until the lighthouse and dune line read at a glance:
- Sky showing as dots: lower `--threshold`.
- Land missing: raise `--threshold`.
- Wrong framing: add `--box L,T,R,B` (pixel coordinates in the source) so the tower sits in the right third and the land fills the bottom.
- Circle count printed over 3,000: lower `--cols`.

Delete `preview.html` when done.

- [ ] **Step 5: Generate the wordmark**

```bash
python3 tools/halftone.py text "Harry Cassidy" <scratchpad>/wordmark.svg --cols 150
```

Expected: about 1,000 to 1,500 circles, around 150x22.

- [ ] **Step 6: Credits**

`assets/images/CREDITS.md`:

```markdown
# Image credits

| File | Source | Author | Licence |
|---|---|---|---|
| hero-sky.webp, hero-sky-800.webp | <page URL> | <author> | <licence> |
| halftone-coast.svg (derived from) | <page URL> | <author> | <licence> |
```

Fill every cell from the pages Harry approved.

- [ ] **Step 7: Commit**

```bash
git add assets/images/hero-sky.webp assets/images/hero-sky-800.webp assets/images/halftone-coast.svg assets/images/CREDITS.md
git commit -m "Add hero photo and halftone coast assets"
```

---

### Task 4: Shared CSS and JS — tokens, flat surfaces, pill nav, no motion

After this task every page renders flat and static. Index still has its old hero markup (fixed in Task 5), so expect index to look unfinished.

**Files:**
- Modify: `css/variables.css`, `css/layout.css`, `css/components.css`, `css/responsive.css`, `css/reset.css`
- Modify: `js/main.js`

**Interfaces:**
- Produces: `.glass` = flat white card. `body.home` opts a page out of the header band. Tokens `--card`, `--line` are new; `--glass-brd` is kept as an alias of `--line` because about 40 rules use it.

- [ ] **Step 1: Retire the secondary accents**

```bash
sed -i -E 's/var\(--accent-[23]\)/var(--accent)/g' css/*.css
grep -c "accent-[23]" css/components.css css/layout.css css/responsive.css
```

Expected: `0` for each.

- [ ] **Step 2: `css/variables.css`**

Replace the three font tokens:

```css
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-heading: var(--font-body);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

Change radii: `--radius: 16px;` and `--radius-lg: 16px;`.

Delete these tokens: `--term-bg`, `--glass-fill`, `--glass-fill-strong`, `--glass-rim`, `--glass-rim-2`, `--accent-2`, `--accent-3`, `--btn-solid` (gradient), `--bg-glow-1`, `--bg-glow-2`, `--blob-1`, `--blob-2`, `--blob-3`, `--blob-opacity`.

Replace `--glass-brd` and add, in the light theme block:

```css
  --card: #ffffff;
  --line: rgba(23, 34, 77, 0.12);
  --glass-brd: var(--line); /* legacy name, ~40 rules use it */
  --btn-solid: var(--accent);
```

Update the file's header comment to: `Design tokens — flat light theme. Guide code blocks stay dark.`

- [ ] **Step 3: `css/reset.css`**

Delete the line `scroll-behavior: smooth;` (line 11).

- [ ] **Step 4: `css/layout.css` — body, band, background mount**

Replace the `body` rule's `background:` declaration with `background: var(--bg);`.

Replace `::selection` with: `::selection { background: color-mix(in srgb, var(--accent) 25%, transparent); color: var(--ink); }`

Delete everything from the `/* ---------- Background mount ----------` comment through the `.glass-defs` rule (the `#field`, `.backdrop`, `.blob*`, `.grain`, three `@keyframes drift-*`, `.glass-defs`). In its place:

```css
/* ---------- Inner-page header band ----------
   Indigo strip behind the floating nav with a crop of the hero halftone.
   index.html opts out with <body class="home">. */
body:not(.home)::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 148px;
  z-index: -1;
  background: var(--accent) url("../assets/images/halftone-coast.svg?v=6") right -40px top / auto 320px no-repeat;
}
body { position: relative; }
```

- [ ] **Step 5: `css/layout.css` — pill nav**

Replace the `.nav` rule, and delete the `.nav::before` rule, the `.nav > *` rule and the `@supports` block that follows them:

```css
.nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 10px 8px 20px;
  border-radius: 999px;
  background: var(--card);
  box-shadow: 0 6px 24px -8px var(--shadow-strong);
}
```

In `.nav-links` change `margin: 0 auto 0 4px;` to `margin: 0 4px;`.

In `.nav-cta` delete the `box-shadow` line and change the transition to `transition: background 0.2s;`. Replace `.nav-cta:hover` with `.nav-cta:hover { background: color-mix(in srgb, var(--accent) 85%, #000); }`.

- [ ] **Step 6: `css/layout.css` — delete the old hero**

Delete from the `/* ---------- Hero: offset panel + overlapping terminal ---------- */` comment through the end of the `.hero-photo img` rule (`.hero`, `.hero-stage`, `.scroll-cue*`, `@keyframes scroll-cue`, `.hero-panel`, `.hero-name`, `.hero-tagline`, `.hero-description`, `.hero-actions`, `.hero-terminal`, `.hero-photo`). Task 5 adds the new hero rules in the same place.

- [ ] **Step 7: `css/components.css` — flat card**

Replace everything from the `/* ---------- Glass panel (base of everything) ---------- */` comment through the last `@supports` block before `/* ---------- Buttons ---------- */` with:

```css
/* ---------- Card surface ----------
   Class is still called .glass so 13 pages of markup did not need editing. */
.glass {
  position: relative;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: box-shadow 0.2s;
}
a.glass:hover,
.card.glass:hover { box-shadow: 0 10px 30px -14px var(--shadow-strong); }
```

Update the file's header comment to `Components — cards, buttons, forms, reading styles`.

- [ ] **Step 8: `css/components.css` — buttons**

Replace `.btn-primary` and its hover:

```css
.btn-primary { color: var(--btn-solid-ink); background: var(--btn-solid); }
.btn-primary:hover { background: color-mix(in srgb, var(--accent) 85%, #000); }
```

In `.btn` change the transition to `transition: background 0.2s;`.

In the `.btn-ghost, .btn-outline` rule delete both `backdrop-filter` lines. Replace its hover rule with `.btn-ghost:hover, .btn-outline:hover { background: var(--surface-hover); }`.

- [ ] **Step 9: `css/components.css` — delete terminal and motion**

Delete from `/* ---------- Terminal window (engineers-desk chrome — the ONE) ---------- */` through `@keyframes blink { ... }`.

Delete the whole `Motion vocabulary` block: from its `/* ====` banner through the `.tilt { ... }` rule.

In `.card` change the transition to `transition: box-shadow 0.2s;`. In `.explore-card` delete the `transition` line. In `.social-link` change the transition to `transition: color 0.2s, background 0.2s;` and in `.social-link:hover` delete `transform: translateY(-2px);`.

- [ ] **Step 10: `css/responsive.css`**

In the `max-width: 900px` block delete the `.hero`, `.scroll-cue`, `.hero-panel`, `.hero-photo` and `.hero-terminal` rules.

In the `max-width: 640px` block:
- Change `.nav { justify-content: space-between; gap: 8px; }` to `.nav { width: 100%; justify-content: space-between; gap: 8px; }`.
- In `.nav-links` change `background: var(--glass-fill-strong);` to `background: var(--card);`.
- Delete the `@supports` block that follows `.nav-links`.
- Delete `.hero-terminal { margin-bottom: -32px; }` and `.terminal { font-size: 0.78rem; }`.
- In `.nav-toggle span` change the transition to `transition: transform 0.2s, opacity 0.2s;`.

Delete the whole `prefers-reduced-motion` block at the bottom, including its banner comment. `reset.css` already has a global reduced-motion rule.

- [ ] **Step 11: `js/main.js`**

Delete these blocks entirely: `var reduceMotion = ...`, "Scroll-choreographed reveals", "Pointer tilt on glass panels", "Light parallax drift", "Scroll cue fades out". Delete the line `root.classList.add('js');` and the `var root` line above it. Keep: footer year, mobile nav toggle, scroll spy, contact form.

- [ ] **Step 12: Verify**

```bash
grep -nE "backdrop-filter|blur\(|requestAnimationFrame|@keyframes|animation:" css/*.css js/main.js
```

Expected: only the `animation-duration` / `animation-iteration-count` lines inside `reset.css`'s reduced-motion rule.

```bash
comm -23 \
  <(grep -hoE "var\(--[a-z0-9-]+" css/*.css | sed 's/var(//' | sort -u) \
  <(grep -oE "^\s*--[a-z0-9-]+" css/variables.css | tr -d ' ' | sort -u)
```

Expected: no output (every `var()` used in CSS is defined). The `--rx`, `--ry` tokens must not appear.

Load `http://localhost:8080/guides.html` and `http://localhost:8080/agentic-tuning.html` at 1440px and 375px. Expected: indigo band with dots behind a white pill nav, white bordered cards, system font, nothing moving. Open and close the mobile menu at 375px.

- [ ] **Step 13: Commit**

```bash
git add css js/main.js
git commit -m "Flatten theme: solid surfaces, pill nav, system fonts, no motion"
```

---

### Task 5: Index hero and about section

**Files:**
- Modify: `index.html` (hero section, lines ~127-181; `<body>` tag; `<head>` preload)
- Modify: `css/layout.css` (new hero rules where Task 4 Step 6 deleted the old ones)
- Modify: `css/responsive.css`
- Modify: `css/reset.css` only if it has no `.sr-only`

**Interfaces:**
- Consumes: `assets/images/hero-sky.webp`, `hero-sky-800.webp`, `halftone-coast.svg`, and `<scratchpad>/wordmark.svg` from Task 3.

- [ ] **Step 1: `<body class="home">`**

Change `<body>` to `<body class="home">` in `index.html`.

- [ ] **Step 2: Preload the hero photo**

In `<head>`, directly above the `<!-- Styles -->` comment:

```html
  <link rel="preload" as="image" type="image/webp" fetchpriority="high"
        href="assets/images/hero-sky.webp"
        imagesrcset="assets/images/hero-sky-800.webp 800w, assets/images/hero-sky.webp 1920w"
        imagesizes="100vw">
```

- [ ] **Step 3: Replace the hero section**

Replace the whole `<section id="hero" class="hero"> ... </section>` with the block below. Paste the full contents of `<scratchpad>/wordmark.svg` where marked, then add `class="hero-wordmark" aria-hidden="true" focusable="false"` to its `<svg>` tag.

```html
    <!-- ===== HERO: photo, halftone coast, dotted wordmark ===== -->
    <section id="hero" class="hero">
      <img class="hero-sky" alt="" width="1920" height="1200" fetchpriority="high" decoding="async"
           src="assets/images/hero-sky.webp"
           srcset="assets/images/hero-sky-800.webp 800w, assets/images/hero-sky.webp 1920w"
           sizes="100vw">
      <img class="hero-coast" alt="" src="assets/images/halftone-coast.svg?v=6" decoding="async">

      <div class="hero-copy">
        <p class="hero-tagline">I build AI systems and teach people to use them.</p>
        <div class="hero-actions">
          <a href="#projects" class="btn btn-primary">View My Work</a>
          <a href="#contact" class="btn btn-ghost">Get In Touch</a>
          <a href="assets/cv.pdf" class="btn btn-ghost" download>Download CV</a>
        </div>
      </div>

      <h1 class="hero-name">
        <span class="sr-only">Harry Cassidy</span>
        <!-- PASTE wordmark.svg HERE -->
      </h1>

      <p class="hero-links">
        <a href="https://github.com/Hazzer890" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/harry-cassidy/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:harrycassidy@protonmail.com">Email</a>
      </p>
    </section>

    <!-- ===== ABOUT: headshot + intro (moved down from the hero) ===== -->
    <section class="section about">
      <div class="about-photo">
        <picture>
          <source type="image/webp" srcset="assets/images/headshot.webp 1x, assets/images/headshot@2x.webp 2x">
          <img src="assets/images/headshot.jpg" alt="Portrait of Harry Cassidy" width="560" height="640" loading="lazy" decoding="async">
        </picture>
      </div>
      <p class="about-intro">On this site you will find a collection of my work, achievements, and thoughts.</p>
    </section>
```

- [ ] **Step 4: `.sr-only`**

Run `grep -n "sr-only" css/*.css`. If there is no match, append to `css/reset.css`:

```css
.sr-only {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
```

- [ ] **Step 5: Hero CSS in `css/layout.css`**

Insert where the old hero rules were (before `/* ---------- About`). Also delete the old `.about-layout` and `.about-panel` rules if `grep -n "about-panel\|about-layout" *.html` shows no page uses them.

```css
/* ---------- Home: nav floats over the hero photo ---------- */
.home .header { position: fixed; left: 0; right: 0; }

/* ---------- Hero: photo + halftone coast + dotted wordmark (after match13) ---------- */
.hero {
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: #2f7fe0; /* shows until the photo decodes */
  color: #fff;
}
.hero-sky {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.hero-coast {
  position: absolute; right: 0; bottom: 0;
  width: min(64vw, 1100px); height: auto;
}
.hero-copy {
  position: absolute;
  left: clamp(24px, 4vw, 64px);
  top: 30%;
  max-width: 440px;
}
.hero-tagline {
  font-size: clamp(1.3rem, 2.4vw, 1.75rem);
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 24px;
  text-shadow: 0 1px 12px rgba(0, 40, 110, 0.45);
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.hero .btn-ghost { background: #fff; border-color: transparent; color: var(--ink); }
.hero .btn-ghost:hover { background: var(--bg-2); }
.hero-name {
  position: absolute;
  right: clamp(24px, 10vw, 180px);
  top: 44%;
  width: min(36vw, 560px);
  margin: 0;
}
.hero-wordmark { display: block; width: 100%; height: auto; }
.hero-links {
  position: absolute;
  left: 16px; bottom: 12px;
  margin: 0;
  display: flex; gap: 14px;
  font-size: 0.8rem;
}
.hero-links a { color: #fff; opacity: 0.85; }
.hero-links a:hover { opacity: 1; text-decoration: underline; }

/* ---------- About: headshot + intro ---------- */
.about {
  display: flex;
  align-items: center;
  gap: clamp(24px, 5vw, 56px);
}
.about-photo {
  flex: 0 0 min(34%, 260px);
  aspect-ratio: 25 / 24;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--line);
}
.about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.about-intro { font-size: clamp(1.1rem, 2.2vw, 1.4rem); color: var(--ink-soft); max-width: 36ch; margin: 0; }
```

- [ ] **Step 6: Phone layout in `css/responsive.css`**

Add inside the `max-width: 900px` block:

```css
  .hero-copy { top: 96px; right: 24px; max-width: none; }
  .hero-name { position: absolute; left: 24px; right: 24px; top: auto; bottom: 46%; width: auto; }
  .hero-coast { width: 130vw; max-width: none; right: -20vw; }
  .about { flex-direction: column; align-items: flex-start; }
  .about-photo { flex-basis: auto; width: min(100%, 260px); }
```

- [ ] **Step 7: Remove the background script tag**

Delete the line `<script src="js/background.js?v=5" defer></script>` from `index.html`.

- [ ] **Step 8: Verify visually**

Load `http://localhost:8080/` and screenshot at 1440x900, 1024x768 and 390x844. Compare the 1440 shot with match13's layout: pill nav top centre, copy at left around a third down, wordmark right of centre above the headland, links bottom-left. Check:
- Tagline and buttons are readable over the photo. If the photo is pale behind the tagline, raise the text-shadow alpha to 0.6.
- The wordmark does not overlap the copy block at 1024px. If it does, change `.hero-name` `top` to `52%`.
- At 390px nothing overlaps and the headland fills the lower half.
- Tab through the page: focus rings are visible on the hero buttons and links.
- With a screen reader tree snapshot (`take_snapshot`), the heading reads "Harry Cassidy".

- [ ] **Step 9: Commit**

```bash
git add index.html css/
git commit -m "Rebuild index hero: photo, halftone coast, dotted wordmark"
```

---

### Task 6: Sweep all pages — strip dead markup, fonts, cache bump

**Files:**
- Modify: all 13 `*.html` in the repo root
- Delete: `js/background.js`, `design-proposals/`

**Interfaces:**
- Consumes: the flat `.glass` and `body:not(.home)::before` band from Task 4.

- [ ] **Step 1: Strip shared dead markup from every page**

```bash
python3 - <<'EOF'
import re, glob
for f in sorted(glob.glob("*.html")):
    s = open(f).read(); o = s
    # Google Fonts block
    s = re.sub(r'\n\s*<!-- Fonts -->\n(?:\s*<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>\n)+', '\n', s)
    # Glass SVG filter
    s = re.sub(r'\n\s*<!-- SVG filter:.*?-->\s*<svg class="glass-defs".*?</svg>\n', '\n', s, flags=re.S)
    # Canvas + blobs
    s = re.sub(r'\n\s*<!-- Background mount:.*?-->\s*<canvas id="field"[^>]*></canvas>\s*<div class="backdrop".*?</div>\n', '\n', s, flags=re.S)
    # background.js
    s = re.sub(r'\n\s*<script src="js/background\.js[^"]*" defer></script>', '', s)
    # Inert motion hooks
    s = re.sub(r'\s+data-reveal(?:="[^"]*")?', '', s)
    s = re.sub(r'\s+data-parallax="[^"]*"', '', s)
    s = re.sub(r'class="([^"]*)"', lambda m: 'class="%s"' % ' '.join(
        c for c in m.group(1).split() if c not in ('reveal', 'reveal--late', 'fade-in', 'glass--hero')), s)
    s = s.replace(' class=""', '')
    # Cache bump
    s = s.replace('?v=5', '?v=6')
    if s != o:
        open(f, 'w').write(s); print("updated", f)
EOF
```

Expected: 13 lines of `updated`.

- [ ] **Step 2: Fix the one hardcoded font**

In `wares.html`'s inline `<style>`, in the `.wares-swatches span` rule, change `font-family: "JetBrains Mono", monospace;` to `font-family: var(--font-mono);`.

- [ ] **Step 3: Delete dead files**

```bash
git rm -q js/background.js
git rm -rq design-proposals
```

- [ ] **Step 4: Verify the constraints**

```bash
grep -rnE "backdrop-filter|blur\(|requestAnimationFrame|fonts\.googleapis|fonts\.gstatic|glass-defs|id=\"field\"|class=\"backdrop\"|background\.js|data-reveal|data-parallax|\?v=5|JetBrains|Space Grotesk" css js *.html
```

Expected: no output.

```bash
for f in *.html; do python3 -c "
import sys, html.parser
class P(html.parser.HTMLParser):
    pass
P().feed(open('$f').read()); print('parsed', '$f')"; done
git diff --stat HEAD -- '*.html' | tail -1
```

Expected: 13 `parsed` lines. Confirm with `git diff HEAD -- guides.html | head -80` that the analytics `<script>` block in `<head>` is unchanged.

- [ ] **Step 5: Check every page in a browser**

For each of the 13 pages at 1440px and 375px: band and pill nav render, the first heading is not hidden under the nav or the band, cards are white with a hairline border, no horizontal scrollbar, mobile menu opens. If a page's first heading collides with the band, add to `css/layout.css`:

```css
body:not(.home) main { padding-top: 56px; }
```

and re-check all inner pages.

Pay attention to `guide-to-github.html` (sticky `.guide-toc` sits at `top: 96px`, must clear the nav) and `404.html` (centred panel).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Strip glass, canvas, fonts and motion hooks from all pages; bump cache to v6"
```

---

### Task 7: Token and CSS dead-code pass

**Files:**
- Modify: `css/variables.css`, `css/layout.css`, `css/components.css`

- [ ] **Step 1: Find unused tokens**

```bash
for t in $(grep -oE "^\s*--[a-z0-9-]+" css/variables.css | tr -d ' ' | sort -u); do
  n=$(grep -rhoE "var\($t[,)]" css *.html | wc -l); [ "$n" = 0 ] && echo "unused $t"; done
```

Delete each reported token from `css/variables.css`. Expected candidates: `--term-green`, `--term-blue`, `--term-amber` only if nothing uses them (the guide `.tok-*` rules and `.form-status.success` do use `--term-green` and `--term-amber`, so those stay).

- [ ] **Step 2: Find unused selectors from the old hero and terminal**

```bash
for c in hero-stage hero-panel hero-description hero-terminal hero-photo terminal-window titlebar cmdline cmdout caret scroll-cue tilt blob grain backdrop glass--hero; do
  grep -ln "$c" css/*.css *.html | sed "s/^/$c still in /"; done
```

Expected: no output. Delete any straggler rule it reports.

- [ ] **Step 3: Commit**

```bash
git add css
git commit -m "Drop unused tokens and selectors"
```

---

### Task 8: Re-measure and close out

**Files:**
- Modify: `docs/superpowers/perf/2026-09-21-retheme.md`

- [ ] **Step 1: Repeat Task 1 Step 3** for both pages with the same emulation settings. Fill the After column.

- [ ] **Step 2: Check the targets**

- Idle and scroll `long` counts are 0 or close to it on both pages.
- LCP under 2,500 ms on both pages.
- Third-party requests: 0.
- CLS no worse than before.

If index LCP misses: confirm in the trace that `hero-sky-800.webp` (not the 1920 file) was the LCP resource on mobile and that the preload fired. If it picked the large file, fix `imagesizes`/`sizes`. If the 800 file is still too slow, re-encode it at `quality=60`.

- [ ] **Step 3: Add a short summary under the table**

Two or three sentences stating which targets were met, which were not, and the transfer size of index (sum from `list_network_requests`).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/perf/2026-09-21-retheme.md
git commit -m "Record post-retheme performance"
```

- [ ] **Step 5: Hand back to Harry**

Report the before/after table and screenshots of index at 1440 and 390. Do not merge or push. Harry reviews on the `retheme` branch.
