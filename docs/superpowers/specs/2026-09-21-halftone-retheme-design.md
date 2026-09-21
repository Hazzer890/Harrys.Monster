# Halftone retheme

harrys.monster · design spec · v1.1, 21 Sep 2026

Changed from v1.0: the hero was redesigned partway through the build on the owner's instruction, so the dotted wordmark, the tagline and the match13 left/right placement are gone and the nav logo became the monster icon on its own. This version describes what shipped rather than what was proposed.

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
| Hero graphic | Halftone Wadjemup lighthouse, a portrait tower built from SVG circles, derived from a photo. |
| Hero background | Full-bleed free-licence photo, sky over ocean. |
| Hero content | Plain `<h1>` with the name, three buttons, and GitHub, LinkedIn and email links. No tagline and no dotted wordmark. Terminal and mission line deleted. Headshot and description move to the first section below the hero. |
| Nav | Centred solid white pill, floating and sticky, CV link inside it. The logo is the monster icon on its own, with `aria-label="Harry Cassidy, home"` and the inner SVG hidden from the accessibility tree, on all 12 pages. |
| Surfaces | White cards, hairline border, radius about 16px, shadow on hover only. |
| Fonts | System sans and system mono. Google Fonts links removed from all 12 pages. |
| Colour | Current off-white, navy ink, indigo accent. Cyan and magenta accents retired. |
| Motion | Hover transitions only. Reveals, parallax, tilt, caret and scroll cue deleted. |
| Inner pages | Flat retheme plus a 148px indigo header band. The band sits behind the floating nav, the page title starts below it on the flat background so the ink colour stays readable. Above 900px the band carries the lantern and the top of the tower at the right, clear of the nav pill; at 900px and below it is plain indigo and the SVG is not requested at all. |
| Cleanup | Delete `design-proposals/`, unused tokens, the glass SVG filter from every page. |
| Out of scope | SSH guide videos, guide code block styling, analytics snippet, page copy other than the removed mission line. |

## Hero layout

Photo fills the viewport and the pill nav floats top centre. Everything over the photo is a grid item rather than an absolutely positioned layer, so nothing can overlap however short the viewport gets, the hero just grows past 100svh instead.

- The name sits left, set right-aligned against the tower, in white with a soft shadow.
- The halftone lighthouse is centred, sized by height (62svh) so the width follows from its aspect ratio, and sits low in the block. A mask fades the dots out at its base so the tower dissolves into the sky instead of ending on a ruled line.
- The three buttons sit right, level with the tower's mid-height.
- GitHub, LinkedIn and email links sit small at the bottom-left, in white with the same kind of shadow so they hold up over the brightest part of the sky.

At 900px and below the hero restacks to one column: name, then buttons, then the tower at 44svh in the slack row, then the links.

"Follows match13" now applies to the halftone technique, not to the placement.

## Halftone implementation

Approach B: SVG circles, the same technique as match13.

- `tools/halftone.py` takes a source photo, samples luminance on a grid, and writes one `<circle>` per cell with radius proportional to brightness (the dots are white). Output is a static `.svg`. The script runs once on a dev machine and its output is committed, the site has no build step. Photo is the only mode.
- The source photo is a white tower against a dark sky, the reverse of what a luminance threshold expects, so it gets a chroma preprocessing pass first (`pre = 128 - R + B` per pixel) that makes the sky bright and the tower dark. The formula and the exact generator command are recorded in `assets/images/CREDITS.md`.
- The generated grid covers the tower and the ground it stands on. Only the tower is ever shown, so the committed file is cropped to it: circles below the base dropped, `viewBox="46 0 29 88"`, 1,406 circles. Radii rounded to two decimals.
- The tower SVG is referenced as a file (`<img>` on index, `background-image` on the inner-page band) so one cached download serves all 12 pages and the circles stay out of each page's DOM.

## Files

- Changed: `css/variables.css`, `css/components.css`, `css/layout.css`, `css/responsive.css`. Mostly deletions.
- Changed: all 12 HTML pages. Each loses the font links, the SVG filter, the canvas and blob markup, and gains the header band and the icon-only nav logo. `index.html` gets the new hero.
- Changed: `js/main.js`, reduced to the nav toggle and scroll-spy.
- Deleted: `js/background.js`, `design-proposals/`.
- Added: `tools/halftone.py` and `tools/test_halftone.py`, `assets/images/hero-sky.webp` (plus a phone-width variant), `assets/images/halftone-coast.svg`.
- Asset cache version bumped to v6.

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
