# Visual Redesign Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the winning hybrid design (Liquid Glass base + story background + one terminal window + asymmetric scroll choreography) across the whole site with no content loss.

**Architecture:** Rebuild the shared design system in place — same five CSS filenames (`css/reset.css`, `variables.css`, `layout.css`, `components.css`, `responsive.css`) plus `js/main.js` and a new `js/background.js` — so interior pages inherit the new shell by keeping their existing `<link>`/`<script>` tags. The new `index.html` defines the canonical shell (head block, nav, background mount, footer); interior pages adopt that shell around their preserved content. Source material is already in-repo: `design-proposals/liquid-glass/` (glass system, tilt, blobs), `design-proposals/immersive-story/main.js` (flow-field canvas, reveal choreography), `design-proposals/engineers-desk/` (terminal window chrome).

**Tech Stack:** Vanilla HTML/CSS/JS, no build step. Canvas 2D flow-field; `backdrop-filter` + SVG displacement glass; IntersectionObserver choreography.

**Spec:** `docs/superpowers/specs/2026-07-22-visual-redesign-design.md` (see "Winner" section)

## Global Constraints

- Vanilla HTML/CSS/JS only; no frameworks, no build step, no CDN JS (Google Fonts allowed).
- Branch: `visual-redesign-proposals`. Nothing merges or pushes without Harry's explicit approval at the final gate.
- **The hybrid, precisely:** liquid-glass proposal is the visual base (dark `#0a0e1a`-family background, frosted glass panels with inner light rim + chromatic edge, `@supports` fallback to translucent fills, floating pill glass nav, pointer-fine cursor tilt, SVG `feDisplacementMap` refraction on the hero panel). Background upgraded to immersive-story tech: a fixed full-viewport canvas flow-field/particle layer that reacts to scroll progress and pointer, layered with the drifting gradient blobs. Exactly ONE terminal window on the whole site (engineers-desk chrome: traffic-light dots + `harry@monster:~/…` title bar on a glass panel; placement chosen during index design — hero, skills, or contact). Non-linearity: asymmetric layout (offset/overlapping panels, off-grid placements, elements crossing section boundaries) and scroll choreography (directional entrances, at least one pinned or parallax moment; sections must not read as a plain centered stack).
- Interior pages keep their existing content verbatim — headings, prose, links, images, forms, structured data. Only shell and styling change. If a page's HTML must be re-classed to adopt the new components, the rendered text content must be diff-identical (verify with the text-extraction check in the recipe below).
- Fallbacks everywhere: content visible by default with zero JS (hidden states gated on an `html.js` class); `prefers-reduced-motion` stops canvas, blobs, tilt, typing, and scroll choreography; `backdrop-filter` feature-detected.
- Accessibility floor: WCAG AA contrast, `:focus-visible` rings (including form fields), semantic landmarks, one `h1` per page, alt text preserved.
- Zero console errors on every page.
- Shared shell must be identical across pages: same head block (fonts, favicon, theme-color `#0a0e1a`), same nav (Home, About, Experience, Guides, Projects, Contact + CV), same footer, same background mount.
- **Model rule (orchestrator):** Task 1 is the flagship design synthesis — dispatch on fable-5. Tasks 2–5 apply an established system — opus-4.8. Task reviews opus-4.8; final whole-branch review fable-5.

### Page inventory (rollout targets)

`index.html` (rebuilt in Task 1); `timeline.html`; `guides.html`; guide articles `guide-to-github.html`, `guide-to-msp430.html`, `guide-to-ssh-curtin.html`; case studies `agentic-tuning.html`, `single-use-software.html`, `ai-web-products.html`, `how-i-work.html`; `404.html`.

### Shared verification recipe

1. Server already runs at `http://localhost:8901` (repo root). Screenshot each changed page at 1440×900 and 390×844 full-page into the session scratchpad `shots/` dir (`npx playwright screenshot --viewport-size=… --full-page URL OUT.png`), then LOOK at both with the Read tool: no horizontal overflow, no overlap, readable contrast, nothing missing.
2. Console: zero errors (quick playwright script or browser MCP).
3. Content preservation (interior pages only): dump the page's visible text before and after editing with `.superpowers/sdd/textdump.py` (written once in Task 2; stdlib `html.parser`, strips script/style/noscript, normalizes whitespace) and `diff` the dumps. Whitespace-only differences acceptable; any word-level difference is a failure.
4. Fallback checks per changed page: grep that hidden states are `.js`-gated; reduced-motion block present.

---

### Task 1: Hybrid design system + new index

**Files:**
- Modify: `index.html` (full rebuild, content facts preserved — same sections/links/copy as current index, layout free)
- Modify: `css/variables.css`, `css/layout.css`, `css/components.css`, `css/responsive.css` (full rewrite for the new system; keep filenames)
- Keep: `css/reset.css` (extend only if needed)
- Modify: `js/main.js` (nav, reveals, tilt, choreography)
- Create: `js/background.js` (blob + flow-field canvas layer, scroll/pointer reactive)

**Interfaces:**
- Consumes: `design-proposals/liquid-glass/` (glass tokens/panels/tilt — lift code directly), `design-proposals/immersive-story/main.js` (flow-field + reveal patterns), `design-proposals/engineers-desk/` (terminal window chrome CSS/HTML).
- Produces: the canonical shell for Tasks 2–5 — head block, `<header>` nav markup, background mount (`js/background.js` + its container element), footer markup, and the component class vocabulary (glass panel, section, reveal, terminal) as they appear in the new `index.html`. Later tasks copy the shell verbatim from `index.html` and reuse component classes from `css/components.css`.

**Steps:**

- [ ] **Step 1:** Build the new design system and index per the hybrid definition in Global Constraints. Reuse proposal code rather than rewriting (the glass system and flow-field already exist and were reviewed). Keep all current index content facts (hero identity/taglines/CTAs, about + headshot + 10 skills, 4 project cards with case-study links, experience/guides links, contact form `https://formspree.io/f/mkopqyqa` + socials + mailto, favicon/OG/canonical). Place the single terminal window where it lands best; document the choice in the report.
- [ ] **Step 2:** Interior-page smoke check: load `timeline.html` and `guide-to-github.html` (which now pull the new CSS via shared filenames) and confirm they don't render broken/illegible — cosmetic mismatch is expected until Tasks 2–4, unreadable/unusable is not. Note findings in the report for Task 2–4 implementers.
- [ ] **Step 3:** Run the shared verification recipe on `http://localhost:8901/` (index) — screenshots both widths, console clean, fallback greps.
- [ ] **Step 4:** Commit: `git add index.html css js && git commit -m "Rebuild index with hybrid liquid-glass design system"`

---

### Task 2: Hub pages — timeline + guides index

**Files:**
- Create: `.superpowers/sdd/textdump.py` (visible-text extractor for the preservation check)
- Modify: `timeline.html`, `guides.html`

**Interfaces:**
- Consumes: shell + component classes from Task 1's `index.html` / `css/components.css`.
- Produces: `textdump.py` used by Tasks 3–5: `python3 .superpowers/sdd/textdump.py <file.html> > out.txt` prints visible text (scripts/styles stripped, whitespace normalized).

**Steps:**

- [ ] **Step 1:** Write `textdump.py` (stdlib `html.parser`; skip `script/style/noscript`, collapse whitespace). Dump both pages' text BEFORE editing.
- [ ] **Step 2:** Re-shell both pages: swap in the Task-1 head block, nav, background mount, footer; re-class timeline entries and guide cards onto the new glass components (timeline entries as offset glass panels riding the asymmetric grid). Content verbatim.
- [ ] **Step 3:** Preservation check: re-dump text, `diff` against before — word-identical required.
- [ ] **Step 4:** Shared verification recipe on both pages (screenshots both widths, console, fallback greps).
- [ ] **Step 5:** Commit: `git add timeline.html guides.html .superpowers/sdd/textdump.py && git commit -m "Apply hybrid design to timeline and guides pages"`

---

### Task 3: Guide articles ×3

**Files:**
- Modify: `guide-to-github.html`, `guide-to-msp430.html`, `guide-to-ssh-curtin.html`

**Interfaces:**
- Consumes: Task 1 shell + components; Task 2's `textdump.py`.
- Produces: nothing downstream.

**Steps:**

- [ ] **Step 1:** Dump each page's text before editing (`textdump.py`).
- [ ] **Step 2:** Re-shell all three articles. Long-form reading pages: prose sits in a wide glass reading panel; keep line-length and contrast comfortable (reading pages may be calmer than index — subtle background, no pinned choreography mid-article). Preserve any code blocks/anchors/TOC links exactly.
- [ ] **Step 3:** Preservation diff per page — word-identical required.
- [ ] **Step 4:** Shared verification recipe on all three (screenshots both widths, console, fallback greps).
- [ ] **Step 5:** Commit: `git add guide-to-*.html && git commit -m "Apply hybrid design to guide articles"`

---

### Task 4: Case studies ×4

**Files:**
- Modify: `agentic-tuning.html`, `single-use-software.html`, `ai-web-products.html`, `how-i-work.html`

**Interfaces:**
- Consumes: Task 1 shell + components; Task 2's `textdump.py`.
- Produces: nothing downstream.

**Steps:**

- [ ] **Step 1:** Dump each page's text before editing.
- [ ] **Step 2:** Re-shell all four case studies onto the new system (same reading-panel treatment as Task 3; case-study hero/metadata blocks may use the asymmetric offset styling). Preserve head metadata these pages already carry (OG/canonical from commit 227ad83) — update only theme-color/styling-related values to match the new shell.
- [ ] **Step 3:** Preservation diff per page — word-identical required.
- [ ] **Step 4:** Shared verification recipe on all four.
- [ ] **Step 5:** Commit: `git add agentic-tuning.html single-use-software.html ai-web-products.html how-i-work.html && git commit -m "Apply hybrid design to case studies"`

---

### Task 5: 404 + site-wide consistency pass

**Files:**
- Modify: `404.html`
- Possibly touch: any page failing the checks below

**Steps:**

- [ ] **Step 1:** Re-shell `404.html` (small page; glass panel + link home; background layer active).
- [ ] **Step 2:** Site-wide consistency sweep across all 11 pages: identical favicon + `theme-color` (`#0a0e1a`) + font links; nav identical and each page's current-page state correct; footer identical; no page still referencing removed classes (grep for orphaned class names from the old `components.css` — pick 5 old-only class names as probes).
- [ ] **Step 3:** Link check: crawl all internal `href`s resolve 200 on localhost:8901 (small `python3` or `curl` loop over `grep -ho 'href="[^"]*"'` results, deduped, relative URLs resolved per page).
- [ ] **Step 4:** Lighthouse sanity on index (chrome-devtools MCP `lighthouse_audit` or `npx lighthouse`): no accessibility score regression below 90; note performance score in report (canvas background will cost something — that's accepted, but document it).
- [ ] **Step 5:** Shared verification recipe on `404.html`; spot-screenshots of two random interior pages at mobile width.
- [ ] **Step 6:** Commit: `git add -A && git commit -m "Apply hybrid design to 404 and finish consistency pass"`

---

### Task 6: Final review + merge gate (STOP)

**Steps:**

- [ ] **Step 1:** Dispatch the final whole-branch review (fable-5) per superpowers:requesting-code-review with a review package from `git merge-base main HEAD`..HEAD, including the deferred-minors list from `.superpowers/sdd/progress.md` (both plans' entries) for triage.
- [ ] **Step 2:** Fix what the review requires (one fix subagent, complete findings list), re-review.
- [ ] **Step 3:** Present to Harry: before/after screenshots of index + one guide + one case study, the review verdict, and the open question — keep or delete `design-proposals/` before merge. STOP for approval; then use superpowers:finishing-a-development-branch (merge to main; GitHub Pages deploys from main).
