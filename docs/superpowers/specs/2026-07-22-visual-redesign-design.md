# harrys.monster Visual Redesign — Design Spec

**Date:** 2026-07-22
**Inspiration:** [thei.care (Awwwards)](https://www.awwwards.com/sites/thei-care) — immersive scroll-driven 3D storytelling; [liquid-glass.ybouane.com](https://liquid-glass.ybouane.com/) — frosted glass refraction panels.

## Goal

Replace the current light/blue/Inter design with a distinctive, premium visual identity. Four candidate designs are built as complete demo index pages; Harry picks a winner (or hybrid); the winning design rolls out to every page.

## Constraints

- Vanilla HTML/CSS/JS, no framework, no build step. Static hosting (GitHub Pages).
- Heavier JS (canvas/WebGL, shaders) allowed where a design needs it, with graceful degradation (no-JS and `prefers-reduced-motion` fallbacks).
- Demo pages have full creative freedom over content, copy, and structure — they must still represent Harry accurately (AI strategist / implementation engineer, educator, egalitarian; timeline, guides, case studies, projects, contact exist as destinations).
- Demos live in `design-proposals/<name>/index.html`, fully self-contained (own CSS/JS alongside). Live site untouched until rollout.

## The 4 candidate designs

All four share the liquid-glass / immersive-story DNA; they differ in the identity layered on top.

1. **Liquid Glass** — purest take on the ybouane inspiration. Dark, rich background (gradients/imagery) with frosted refraction panels: `backdrop-filter` + SVG displacement filters, optional WebGL polish, floating glass nav, chromatic-aberration accents. Apple-2025 premium.
2. **Immersive Story** — purest take on thei.care. Scroll-driven narrative, one idea per viewport, large kinetic type, ambient canvas/WebGL 3D element, micro-interactions throughout. The page tells "engineer, educator, egalitarian" as a story.
3. **Editorial Brutalist × Glass** — print-inspired structure (massive display headlines, exposed grid, rules and indexes like a magazine spread) with liquid-glass surfaces layered in: glass panels over bold typographic backdrops, scroll-driven section reveals borrowed from the immersive direction.
4. **Engineer's Desk × Glass** — dark terminal identity (monospace/JetBrains, phosphor accent, command-palette nav, content as sessions/logs/manifests) rendered through glass: frosted terminal windows floating over a live ambient background, story-style scroll pacing between "sessions".

## Process

1. **Build demos** — four parallel agents, one per design, isolated in `design-proposals/`. User-facing UI ⇒ taste-tier models (fable-5 / opus-4.8) per model-selection rules.
2. **Verify** — serve locally, screenshot each at desktop (1440w) and mobile (390w), fix rendering bugs, check reduced-motion/no-JS fallbacks don't break layout.
3. **Review gate** — Harry compares the four pages and picks a winner or hybrid.
4. **Rollout** — extract the winner into the shared `css/`/`js/` structure; apply across index, timeline, guides ×4, case studies ×3, 404, preserving those pages' content. Detailed rollout plan is written only after the winner is known.
5. **Final pass** — favicon/theme-color/OG consistency, accessibility basics (contrast, focus states), Lighthouse sanity check.

## Success criteria

- Four demo pages render cleanly with no console errors at desktop and mobile widths.
- Each is visually distinct and clearly traceable to its stated direction.
- Winning design ships site-wide with no content loss and working fallbacks.

## Winner (decided 2026-07-22)

Hybrid, Liquid Glass base:
- **Base:** liquid-glass proposal (dark base, frosted refraction glass system, floating glass nav, cursor tilt).
- **Background:** immersive-story tech — scroll- and pointer-reactive canvas (flow-field/particles) layered with the gradient blobs, so the backdrop tells the story as you scroll.
- **One terminal window** borrowed from engineers-desk (single glass terminal; placement decided during design).
- **Non-linearity:** layout asymmetry (offset/overlapping panels, off-grid placements) + scroll choreography (pinned/directional entrances, sections that don't just stack).
