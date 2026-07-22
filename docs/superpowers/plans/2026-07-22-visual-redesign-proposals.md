# Visual Redesign Proposals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four complete, self-contained candidate index pages under `design-proposals/`, verify each renders cleanly, and gate on Harry picking a winner before any rollout.

**Architecture:** Each candidate is an isolated static page (`design-proposals/<name>/index.html` + sibling `style.css`/`main.js` as needed) that never touches the live site's `css/`/`js/`. A tiny gallery page links the four for side-by-side review. Rollout is planned separately after the winner is chosen (per spec).

**Tech Stack:** Vanilla HTML/CSS/JS. `backdrop-filter` + SVG displacement filters for glass; `<canvas>` (2D or WebGL) for ambient/3D effects; no frameworks, no build step.

**Spec:** `docs/superpowers/specs/2026-07-22-visual-redesign-design.md`

## Global Constraints

- Vanilla HTML/CSS/JS only. No frameworks, no build step, no CDN JS libraries (Google Fonts allowed).
- Each proposal is fully self-contained in its own folder: `design-proposals/<name>/index.html`, optional `style.css` and `main.js` in the same folder. It must NOT link to the site's shared `/css/` or `/js/`.
- Asset reuse allowed via relative paths: headshot at `../../assets/images/headshot.jpg` (and `.webp` variants), CV at `../../assets/cv.pdf`.
- Every proposal must degrade gracefully: `<noscript>` keeps all content visible; `@media (prefers-reduced-motion: reduce)` disables continuous/scroll-driven animation.
- Accessibility floor: visible focus states, WCAG AA text contrast, semantic landmarks (`header/main/footer`, one `h1`), alt text on the headshot.
- Zero console errors when loaded in Chromium.
- **Model rule (orchestrator):** each design task is user-facing UI — dispatch to a taste-tier agent (fable-5 or opus-4.8), per CLAUDE.md model table.

### Content inventory (facts every proposal must represent; copy/structure is free)

- Name: **Harry Cassidy** ("Harry"). Identity: AI strategist & implementation engineer, educator, egalitarian. Tagline today: "I build AI systems and teach people to use them." / "Communication and Education will change the world."
- Skills: 3D Design (Autodesk, Solidworks, Onshape), C & C++, Python, Microsoft Suite, Microcontrollers, Git, Claude & OpenAI APIs, Agentic systems, TypeScript, AI-assisted analytics.
- Projects / case studies (link with `../../<file>` from proposal folders):
  1. **Agentic model tuning** — agentic loop on the Claude API proposing hyperparameters, running training, reading metrics, iterating; top marks in ML units at Curtin → `agentic-tuning.html`
  2. **Single-use software** — Curtin Festival of AI talk + practice: deterministic disposable tools built with AI for non-technical professionals → `single-use-software.html`
  3. **Building web products with AI** — WARES storefront and Robotics West site built end-to-end with AI tooling → `ai-web-products.html`
  4. **How I work** — daily multi-model agent orchestration: cost-aware routing, custom skill libraries, cross-model review loops → `how-i-work.html`
- Destinations: Experience timeline → `../../timeline.html`, Guides → `../../guides.html`, CV download → `../../assets/cv.pdf`.
- Contact: form POST to `https://formspree.io/f/mkopqyqa` (fields: name, email, message) OR a prominent `mailto:harrycassidy@protonmail.com`; socials GitHub `https://github.com/Hazzer890`, LinkedIn `https://www.linkedin.com/in/harry-cassidy/`.
- `<title>`, meta description, canonical, OG tags, and the existing SVG monogram favicon (copy from live `index.html:20`) on every proposal.

### Shared verification recipe (referenced by every design task)

1. Serve the repo root once: `python -m http.server 8901` (run in background from repo root).
2. Screenshot both widths (from repo root; install browsers once with `npx -y playwright install chromium` if missing):
   - `npx -y playwright screenshot --viewport-size=1440,900 --full-page "http://localhost:8901/design-proposals/<name>/" "$SHOTS/<name>-desktop.png"`
   - `npx -y playwright screenshot --viewport-size=390,844 --full-page "http://localhost:8901/design-proposals/<name>/" "$SHOTS/<name>-mobile.png"`

   where `$SHOTS` is the session scratchpad directory (or any writable temp dir the executor prefers) — record the actual path used so Task 6 can present the images.
   (Browser MCP tools — playwright or chrome-devtools — are an acceptable substitute; also read console messages while there.)
3. Inspect both screenshots with the Read tool. Fail the step if: layout overflow/horizontal scroll on mobile, unreadable contrast, overlapping text, or a section missing.
4. Check console: zero errors (warnings acceptable).
5. Fix and re-screenshot until clean.

---

### Task 1: Liquid Glass proposal

**Files:**
- Create: `design-proposals/liquid-glass/index.html`
- Create: `design-proposals/liquid-glass/style.css`
- Create: `design-proposals/liquid-glass/main.js`

**Interfaces:**
- Consumes: content inventory + assets (Global Constraints).
- Produces: a complete standalone index page at `design-proposals/liquid-glass/`; Task 5 links to it by that path.

**Design brief (build exactly this direction; execute with taste):**
- **Vibe:** Apple-2025 premium. Purest take on https://liquid-glass.ybouane.com/.
- **Background:** deep dark base (`#0a0e1a`-ish) with large, slowly drifting saturated gradient blobs (indigo/cyan/magenta) rendered as blurred CSS radial-gradients or a lightweight canvas — rich enough that glass has something to refract.
- **Glass system:** cards, nav, and buttons are frosted panels: `backdrop-filter: blur(...) saturate(...)`, 1px inner light rim (`box-shadow: inset`), subtle chromatic-aberration edge. Add an SVG `feDisplacementMap` filter layer for genuine refraction wobble on at least the hero panel; feature-detect `backdrop-filter` and fall back to translucent solid fills.
- **Nav:** floating pill-shaped glass bar, detached from top edge.
- **Type:** a contemporary grotesk (e.g. "Instrument Sans" or "Space Grotesk" from Google Fonts) + JetBrains Mono for accents.
- **Sections (free order):** hero (name, tagline, CTAs incl. CV), about + headshot in a glass card, four project cards, experience/guides links, contact.
- **Motion:** blob drift (continuous, killed by reduced-motion), glass panels tilt slightly toward cursor (pointer-fine only), soft entrance fades.

**Steps:**

- [ ] **Step 1:** Write the three files per the brief. Complete page — all content inventory items present.
- [ ] **Step 2:** Run the shared verification recipe for `liquid-glass`; fix until clean at both widths with zero console errors.
- [ ] **Step 3:** Verify fallbacks: reload with JS disabled (playwright `--` or MCP route: check `<noscript>` content visible); confirm `prefers-reduced-motion` CSS block exists and stops the blob drift.
- [ ] **Step 4:** Commit: `git add design-proposals/liquid-glass && git commit -m "Add liquid-glass design proposal"`

---

### Task 2: Immersive Story proposal

**Files:**
- Create: `design-proposals/immersive-story/index.html`
- Create: `design-proposals/immersive-story/style.css`
- Create: `design-proposals/immersive-story/main.js`

**Interfaces:**
- Consumes: content inventory + assets (Global Constraints).
- Produces: standalone page at `design-proposals/immersive-story/`; Task 5 links to it.

**Design brief:**
- **Vibe:** thei.care — award-site scroll narrative. The page tells "engineer, educator, egalitarian" as a story, one idea per viewport.
- **Structure:** full-viewport chapters: (1) name + kinetic headline, (2) "I build AI systems" → morphs into project showcase, (3) "…and teach people to use them" → guides/education, (4) timeline teaser, (5) contact finale. Snap or eased scroll pacing — content still reachable by plain scrolling.
- **Hero centerpiece:** ambient `<canvas>` element (2D is fine): a particle/flow-field system that reacts to scroll progress and pointer; sits behind the type.
- **Type:** oversized display type (e.g. "Unbounded", "Clash-like" Google alternative such as "Anybody" or "Syne") scaling with `clamp()`; kinetic reveals via IntersectionObserver + CSS transforms (letters/words slide, no library).
- **Palette:** near-black canvas, one electric accent (e.g. acid green or electric blue) + warm off-white text.
- **Motion:** scroll-driven progress (CSS `animation-timeline: scroll()` where supported, IO fallback), micro-interactions on every link/button. All continuous motion gated by reduced-motion.

**Steps:**

- [ ] **Step 1:** Write the three files per the brief. All content inventory items present.
- [ ] **Step 2:** Shared verification recipe for `immersive-story`; fix until clean.
- [ ] **Step 3:** Verify fallbacks: JS disabled → all chapters readable as plain stacked sections; reduced-motion stops canvas + kinetic type.
- [ ] **Step 4:** Commit: `git add design-proposals/immersive-story && git commit -m "Add immersive-story design proposal"`

---

### Task 3: Editorial Brutalist × Glass proposal

**Files:**
- Create: `design-proposals/editorial-glass/index.html`
- Create: `design-proposals/editorial-glass/style.css`
- Create: `design-proposals/editorial-glass/main.js`

**Interfaces:**
- Consumes: content inventory + assets (Global Constraints).
- Produces: standalone page at `design-proposals/editorial-glass/`; Task 5 links to it.

**Design brief:**
- **Vibe:** magazine spread meets glass. Print structure — exposed grid, hairline rules, running indexes ("01 / About", "02 / Work"), massive display serif or ultra-condensed headlines (e.g. "Fraunces" or "Archivo Expanded/Condensed" pairing) — with liquid-glass surfaces layered over bold typographic backdrops.
- **Layout:** visible column grid (CSS grid with drawn column rules), asymmetric placements, huge section numerals bleeding off-edge. Headlines set enormous behind frosted glass panels carrying body copy — glass over type is the signature move.
- **Palette:** paper-white or bone background, ink-black type, ONE loud accent (e.g. International Klein Blue or signal red). Glass panels tinted, not gray.
- **Story element:** scroll-driven section reveals (rules draw in, numerals count up via IO) borrowed from the immersive direction — sharp and fast, not floaty.
- **Motion:** entrance reveals only; hover states swap to accent. Reduced-motion → everything static.

**Steps:**

- [ ] **Step 1:** Write the three files per the brief. All content inventory items present.
- [ ] **Step 2:** Shared verification recipe for `editorial-glass`; fix until clean.
- [ ] **Step 3:** Verify fallbacks: JS disabled → grid and content fully visible; reduced-motion → no reveals.
- [ ] **Step 4:** Commit: `git add design-proposals/editorial-glass && git commit -m "Add editorial-glass design proposal"`

---

### Task 4: Engineer's Desk × Glass proposal

**Files:**
- Create: `design-proposals/engineers-desk/index.html`
- Create: `design-proposals/engineers-desk/style.css`
- Create: `design-proposals/engineers-desk/main.js`

**Interfaces:**
- Consumes: content inventory + assets (Global Constraints).
- Produces: standalone page at `design-proposals/engineers-desk/`; Task 5 links to it.

**Design brief:**
- **Vibe:** dark terminal identity rendered through glass. Frosted terminal windows floating over a live ambient background, story-style scroll pacing between "sessions".
- **Background:** dark desk surface with a subtle animated layer (drifting grid, faint scanlines, or slow particle field on canvas).
- **Windows:** each section is a glass terminal window (traffic-light dots, title bar like `harry@monster:~/about`) using the same backdrop-filter glass treatment as Task 1. Content presented as sessions/logs/manifests: about as `cat about.md` output, projects as a `ls --detail projects/` manifest with expandable entries, contact as an interactive-looking prompt (real form underneath).
- **Type:** JetBrains Mono primary; phosphor accent (green or amber) on dark; secondary sans allowed for long prose inside windows.
- **Signature interaction:** command-palette nav — `Ctrl+K` / click opens a glass palette listing destinations (About, Projects, Timeline, Guides, CV, Contact); plain anchor nav also present for no-JS.
- **Motion:** typed-text effect on the hero prompt line (once, skippable, reduced-motion → instant), window entrance pops between sessions while scrolling.

**Steps:**

- [ ] **Step 1:** Write the three files per the brief. All content inventory items present.
- [ ] **Step 2:** Shared verification recipe for `engineers-desk`; fix until clean.
- [ ] **Step 3:** Verify fallbacks: JS disabled → all windows/content visible, anchor nav works; reduced-motion → no typing/ambient animation.
- [ ] **Step 4:** Commit: `git add design-proposals/engineers-desk && git commit -m "Add engineers-desk design proposal"`

---

### Task 5: Comparison gallery + cross-check

**Files:**
- Create: `design-proposals/index.html`

**Interfaces:**
- Consumes: the four proposal folders from Tasks 1–4.
- Produces: review URL `http://localhost:8901/design-proposals/` for the review gate.

**Steps:**

- [ ] **Step 1:** Write a minimal gallery page: plain list of four links (`liquid-glass/`, `immersive-story/`, `editorial-glass/`, `engineers-desk/`) each with its one-line direction description from the spec. No styling beyond readable defaults — this page is scaffolding, not a fifth design.
- [ ] **Step 2:** Cross-check all four proposals side by side via their desktop screenshots: confirm each is visually distinct and traceable to its brief; confirm every proposal contains all content-inventory items (grep each `index.html` for `formspree.io/f/mkopqyqa|mailto:harrycassidy`, `agentic-tuning.html`, `single-use-software.html`, `ai-web-products.html`, `how-i-work.html`, `timeline.html`, `guides.html`, `cv.pdf`). Fix any gaps in the offending proposal.
- [ ] **Step 3:** Commit: `git add design-proposals/index.html && git commit -m "Add design-proposals gallery page"`

---

### Task 6: Review gate (STOP)

**Steps:**

- [ ] **Step 1:** Present Harry the gallery URL and the eight screenshots (four designs × two widths). Summarize each direction in one line.
- [ ] **Step 2:** STOP. Wait for Harry to pick a winner or specify a hybrid. Do not proceed to rollout without an explicit choice.

---

### Task 7: Rollout planning

**Steps:**

- [ ] **Step 1:** With the winner known, invoke the superpowers:writing-plans skill to write the rollout plan (`docs/superpowers/plans/YYYY-MM-DD-visual-redesign-rollout.md`): extract the winning proposal into shared `css/`/`js/`, apply to index, timeline, guides ×4, case studies ×3, and 404 preserving their content, then the final pass (favicon/OG consistency, a11y, Lighthouse). Rollout detail is deliberately deferred to that plan per the spec — the winning aesthetic dictates the component work.
