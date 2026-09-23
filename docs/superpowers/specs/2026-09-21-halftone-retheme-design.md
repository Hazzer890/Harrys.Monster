# Halftone retheme

harrys.monster · design spec · v1.2, 21 Sep 2026

Changed from v1.0: the hero was redesigned partway through the build on the owner's instruction, so the dotted wordmark, the tagline and the match13 left/right placement are gone and the nav logo became the monster icon on its own. This version describes what shipped rather than what was proposed.

Changed after v1.1 shipped: the hero's GitHub, LinkedIn and email links and the inner-page header band were dropped on the owner's instruction; the halftone tower SVG is now used on index.html only.

Changed in v1.2: the hero photo became a single sea-and-sky photo pinned behind all 12 pages, moving opposite to the scroll. That is the one motion exception, and it brought a set of rules about what text may sit on a photo. See "Moving background" below. Later in v1.2 the hero graphic became a halftone palm island, with the name and buttons raised level with its top.

## Goal

Remove the rendering lag on phones and low-end machines, cut initial load, and bring the look up to date. The site stays light mode only. The reference is the match13.com home page, and the hero should sit as close to it as we can get.

## Why the site lags now

Four things stack, and each makes the others more expensive:

- `js/background.js` redraws a full-viewport canvas every frame and listens to `mousemove`.
- Three `filter: blur(90px)` blobs animate forever behind the content.
- Seven `backdrop-filter` surfaces (nav, cards, hero panel, the hero one with an SVG distortion filter) re-blur every frame because the layers under them never stop moving.
- `main.js` runs scroll parallax and pointer tilt.

match13 has none of this. Its home page is one static `.webp`, static SVG graphics, system fonts, and a solid white nav.

## Decisions

| Area | Decision |
|---|---|
| Glass | Removed everywhere. No `backdrop-filter`, no SVG filter. |
| Animated background | Canvas, blobs and grain deleted. `js/background.js` deleted. |
| Hero graphic | Halftone palm island, a wide, short graphic built from SVG circles, derived from an AI-generated reference the owner supplied. |
| Hero background | Full-bleed free-licence photo, sky over ocean. |
| Hero content | Plain `<h1>` with the name and three buttons. No tagline and no dotted wordmark. Terminal and mission line deleted. Headshot and description move to the first section below the hero; the contact section further down keeps the social links. |
| Nav | Centred solid white pill, floating and sticky, CV link inside it. The logo is the monster icon on its own, with `aria-label="Harry Cassidy, home"` and the inner SVG hidden from the accessibility tree, on all 12 pages. |
| Surfaces | White cards, hairline border, radius about 16px, shadow on hover only. |
| Fonts | System sans and system mono. Google Fonts links removed from all 12 pages. |
| Colour | Current off-white, navy ink, indigo accent. Cyan and magenta accents retired. |
| Motion | Hover transitions only. Reveals, parallax, tilt, caret and scroll cue deleted. v1.2 adds one exception, the pinned photo, which runs on the compositor. |
| Inner pages | Flat retheme, no header band. The pill nav floats directly over the off-white page background; the page title sits in normal flow below it. The halftone tower SVG is not requested on inner pages. |
| Cleanup | Delete `design-proposals/`, unused tokens, the glass SVG filter from every page. |
| Out of scope | SSH guide videos, guide code block styling, analytics snippet, page copy other than the removed mission line. |

## Hero layout

Photo fills the viewport and the pill nav floats top centre. Everything over the photo is a grid item rather than an absolutely positioned layer, so nothing can overlap however short the viewport gets, the hero just grows past 100svh instead.

- The name sits left, set right-aligned against the island, in white with a soft shadow.
- The halftone palm island is centred, sized by height (50svh, capped at 31vw on tall narrow windows) so the width follows from its 96:65 aspect ratio, and sits low in the block. Its base is the bottom edge of the graphic, crisp, with no mask.
- The name and the three buttons sit level with the top of the island, not its middle.

At 900px and below the hero restacks to one column: name, then buttons, then the island in the slack row, about 38svh tall and never wider than the column.

"Follows match13" now applies to the halftone technique, not to the placement.

## Moving background (v1.2)

One portrait photo of sea and sky, sky over the top 73 per cent, sits pinned behind every page as the first child of `<body>`. At scroll 0 it shows its lower part, the sea and the horizon about 60 per cent down the viewport, and as the page scrolls up the photo slides down, so more and more sky comes into view until the top of the photo is reached. The hero's own `.hero-sky` image is gone, this photo replaces it, which is also why the hero no longer has a background colour of its own.

Two tunables, both on `.bg-sky` in `css/layout.css`. `--sky-start` is where the photo sits at scroll 0, larger means more sea showing. `--sky-travel` is how far you scroll to finish the move, currently 420svh, larger means slower.

This is the only motion on the site besides hover transitions, and it earns the exception because it costs nothing to run. Where the browser has CSS scroll-driven animations the whole thing is one transform on a scroll timeline, so it runs on the compositor with no JavaScript and no main thread work, which is the opposite of the canvas and blur layers v1.0 removed. Firefox and Zen do not have scroll timelines yet, so `js/main.js` carries a ten line fallback behind `CSS.supports('animation-timeline: scroll()')`: a passive scroll listener writing at most one transform per frame through `requestAnimationFrame`, plus a resize handler. It is the only `requestAnimationFrame` on the site. Browsers with the CSS path run none of it, and under `prefers-reduced-motion: reduce` both paths leave the photo pinned at the start position. The numbers in the fallback mirror the custom properties, so the two paths land on the same pixel, and if you change one you change the other.

The body background is `#0d4f8d`, sampled from the top of the photo, so there is no white flash before it decodes.

### Text on a photo

What sits behind a given element changes as the page scrolls, so the rule is that only display type is left out on the photo. Page titles (`.hero-name`, `.case-title`) are white with the soft halo the hero name has always used, held in `--shadow-text`. Everything at body size sits on a surface instead:

- Page intro paragraphs on guides, timeline and wares became their own card, `p.glass`.
- The index about intro and the Projects rail became cards, which also makes the rail a proper heading tile in the mosaic.
- The footer line is too small to read over bright water and too short to deserve a card, so it gets a navy plate of its own.
- The tinted `--surface-*` fills are right inside a white card and wrong over the photo, where three per cent navy just reads as sea. The three that sit outside a card, the guide table of contents, the case-study meta pills and the "All work" button, are solid white.
- Focus rings follow the same split: white on the photo, the usual indigo inside a card.

The contrast target is 4.5:1 for body-size text against the worst background it can scroll over, and every body-size element clears it by construction now that it is on a surface. Display type does not, and cannot on a photo this bright: over a lit cloud a white title measures about 1.9:1 at desktop widths. That matches the hero treatment that shipped in v1.1 and it is a deliberate call, the alternative is darkening the photo far enough to flatten the clouds.

## Halftone implementation

Approach B: SVG circles, the same technique as match13.

- `tools/halftone.py` takes a source photo, samples luminance on a grid, and writes one `<circle>` per cell with radius proportional to brightness (the dots are white). Output is a static `.svg`. The script runs once on a dev machine and its output is committed, the site has no build step. Photo is the only mode.
- The source photo is a white tower against a dark sky, the reverse of what a luminance threshold expects, so it gets a chroma preprocessing pass first (`pre = 128 - R + B` per pixel) that makes the sky bright and the tower dark. The formula and the exact generator command are recorded in `assets/images/CREDITS.md`.
- The generated grid covers the tower and the ground it stands on. Only the tower is ever shown, so the committed file is cropped to it: circles below the base dropped, `viewBox="46 0 29 88"`, 1,406 circles. Radii rounded to two decimals.
- The tower SVG is referenced as a file (`<img>` on index.html's hero only) so the circles stay out of the page's DOM.

## Files

- Changed: `css/variables.css`, `css/components.css`, `css/layout.css`, `css/responsive.css`. Mostly deletions.
- Changed: all 12 HTML pages. Each loses the font links, the SVG filter, the canvas and blob markup, and gains the icon-only nav logo. `index.html` gets the new hero.
- Changed: `js/main.js`, reduced to the nav toggle and scroll-spy.
- Deleted: `js/background.js`, `design-proposals/`.
- Added: `tools/halftone.py` and `tools/test_halftone.py`, `assets/images/halftone-coast.svg`.
- Asset cache version bumped to v6.

v1.2 on top of that:

- Added: `assets/images/sea-sky.webp` (1600x2400, 157 KB) and `assets/images/sea-sky-800.webp` (800x1200, 48 KB), both WebP quality 62, the lowest quality with no visible banding in the flat sky.
- Deleted: `assets/images/hero-sky.webp` and `hero-sky-800.webp`.
- Changed: all 12 pages gain the `.bg-sky` image as the first child of `<body>`; `js/main.js` gains the fallback; `css/layout.css` and `css/components.css` gain the photo rules.
- Asset cache version bumped to v7.
- Added: `assets/images/halftone-island.svg`, its reference `island-ref.png` and `tools/island.py`. Deleted: `assets/images/halftone-coast.svg`.

## Images and licensing

Candidates come from Unsplash and Wikimedia Commons (CC0 or equivalent). Harry picks from a shortlist before anything is downloaded. The source URL, author and licence for each image go in `assets/images/CREDITS.md`.

Hero photo target: about 150 KB at 1920px wide, about 60 KB at 800px, served with `srcset`, `fetchpriority="high"` and a preload.

## Verification

Baseline first, on the current site, for `index.html` and one guide:

- Lighthouse mobile run.
- Performance trace with 6x CPU throttle, idle for 5 s, then scroll the page.

Same again after the change. Targets:

- No long animation frames while idle or scrolling.
- LCP under 2.5 s on throttled mobile.
- Zero third-party requests.
- `grep -rE "backdrop-filter|blur\(|requestAnimationFrame|fonts.googleapis" css js *.html` returns nothing.
- Every page checked at 375px and 1440px for layout breaks, and the nav toggle works on each.

Known risk: the hero photo becomes the LCP element, where today it is text. The preload and the phone-width variant are there to cover that, and the before/after numbers will show whether they do.

## Order of work

1. Record baseline measurements.
2. Shortlist photos, Harry picks.
3. Write `tools/halftone.py`, generate the lighthouse tower.
4. Shared CSS: tokens, surfaces, nav pill, fonts, motion removal.
5. `index.html` hero and the section below it.
6. Inner pages: strip old markup, add the header band.
7. Delete dead files, bump cache version.
8. Re-measure and compare.
