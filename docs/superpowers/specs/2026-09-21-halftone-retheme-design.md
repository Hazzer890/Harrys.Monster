# Halftone retheme

harrys.monster · design spec · v1.0, 21 Sep 2026

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
| Hero graphic | Halftone WA coastal headland with a lighthouse, built from SVG circles. Falls back to the Perth skyline if no suitable free-licence source turns up. |
| Hero background | Full-bleed free-licence photo, sky over ocean. |
| Hero content | Dotted "Harry Cassidy" wordmark, tagline, three buttons. Terminal and mission line deleted. Headshot and description move to the first section below the hero. |
| Wordmark | Static SVG of dots. A real `<h1>` stays in the markup for screen readers and search. |
| Nav | Centred solid white pill, floating and sticky, CV link inside it. |
| Surfaces | White cards, hairline border, radius about 16px, shadow on hover only. |
| Fonts | System sans and system mono. Google Fonts links removed from all 13 pages. |
| Colour | Current off-white, navy ink, indigo accent. Cyan and magenta accents retired. |
| Motion | Hover transitions only. Reveals, parallax, tilt, caret and scroll cue deleted. |
| Inner pages | Flat retheme plus a short indigo header band with a crop of the halftone. The band sits behind the floating nav, the page title starts below it on the flat background so the ink colour stays readable. |
| Cleanup | Delete `design-proposals/`, unused tokens, the glass SVG filter from every page. |
| Out of scope | SSH guide videos, guide code block styling, analytics snippet, page copy other than the removed mission line. |

## Hero layout

Follows match13:

- Photo fills the viewport. The pill nav floats top centre.
- Tagline and buttons sit left, around a third of the way down, where match13 has its search box.
- The wordmark sits right of centre, directly above the halftone graphic.
- The halftone headland rises from the bottom-right corner, large dots at the base fading to small dots at the top edge.
- GitHub, LinkedIn and email links sit small at the bottom-left, where match13 has Privacy, Terms and Legal.

On phones the wordmark, tagline and buttons stack at the top, and the halftone fills the lower half.

## Halftone implementation

Approach B: SVG circles, the same technique as match13.

- `tools/halftone.py` takes a source image, samples luminance on a grid, and writes one `<circle>` per cell with radius proportional to brightness (the dots are white). Output is a static `.svg`. The script runs once on a dev machine and its output is committed, the site has no build step.
- Grid capped at roughly 3,000 circles for the headland so the file and the paint stay small. Radii rounded to two decimals.
- The headland SVG is referenced as a file (`<img>` on index, `background-image` on the inner-page band) so one cached download serves all 13 pages and the circles stay out of each page's DOM.
- The wordmark SVG is small (about 1,500 circles) and is inlined on index so it paints with the HTML.

## Files

- Changed: `css/variables.css`, `css/components.css`, `css/layout.css`, `css/responsive.css`. Mostly deletions.
- Changed: all 13 HTML pages. Each loses the font links, the SVG filter, the canvas and blob markup, and gains the header band. `index.html` gets the new hero.
- Changed: `js/main.js`, reduced to the nav toggle and scroll-spy.
- Deleted: `js/background.js`, `design-proposals/`.
- Added: `tools/halftone.py`, `assets/images/hero-sky.webp` (plus a phone-width variant), `assets/images/halftone-coast.svg`, the inline wordmark.
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
3. Write `tools/halftone.py`, generate the headland and wordmark.
4. Shared CSS: tokens, surfaces, nav pill, fonts, motion removal.
5. `index.html` hero and the section below it.
6. Inner pages: strip old markup, add the header band.
7. Delete dead files, bump cache version.
8. Re-measure and compare.
