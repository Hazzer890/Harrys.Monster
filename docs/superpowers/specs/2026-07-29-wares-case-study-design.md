# WARES brand case study page — design spec

Date: 2026-07-29
Status: approved pending user review

## Goal

Add one static page to harrys.monster presenting the production of the WARES
brand (West Australian Robotics Education Specialists, warobotics.education)
as a design case study. Link it from the index projects section.

## Decisions made

- **Angle:** brand case study. The page tells the design-process story:
  brief, identity development, applications, outcome.
- **Narrative source:** interview. Harry answers ~6 questions (the brief, the
  torx-socket mark, the type choice, the red, what production covered, where
  the brand lives now). I draft copy from the answers; Harry corrects it.
- **Visual treatment:** hybrid. The page keeps the harrys.monster shell
  (nav, light glass, Space Grotesk / JetBrains Mono) and uses the WARES
  red/cream palette inside the case-study sections.

## Source material

- `~/Documents/WARES/logos/` — 4 logo PNG variants plus the `.ai` source
- `~/Documents/WARES/BUMPERS/` — 4 photos of the brand on robot bumpers
- `~/Documents/WARES/Shipping Labels/` and `~/Downloads/WARES_ShipToPit_DDU.*`
  — shipping-label designs
- `~/Documents/WARES/KitbotInstructions2026/` — instructions microsite
  (kitbot.warobotics.education)
- `~/Documents/claudeTest/` — docs.warobotics.education Jekyll site
- https://warobotics.education — current live WordPress site
- https://staging.warobotics.education — theme rework in progress. The case
  study screenshots the staging theme as the current state of the brand's web
  presence; the old live site can appear as a before/after if useful.

## Plan

1. **Research.** Web research on how agencies and designers structure brand
   case studies (agency portfolio pages, Behance-style case studies,
   portfolio-writing guidance). Output: a section checklist that fixes the
   page structure before any layout work. Expected shape: hero, context and
   brief, identity system, applications in the wild, outcome.
2. **Interview.** Ask the ~6 narrative questions listed above. Draft the copy
   from the answers.
3. **Asset prep.** Optimize images for web into `assets/wares/`: logo
   variants, bumper photos, shipping label, Kitbot screenshots, a live-site
   screenshot. No new design work; the existing assets are the content.
4. **Build.** One page, `wares.html`, following the structure of
   `single-use-software.html`: same head, nav, background, and CSS files.
   WARES red/cream applied through a few scoped custom properties on the
   case-study sections. Add a project card linking to it on `index.html`.
5. **Verify.** Preview locally in the browser; check responsive layout and
   basic accessibility (alt text, contrast, heading order).
6. **Update pass (after the reworked site ships).** When the staging theme
   goes live and Harry supplies more brand content, refresh the page:
   re-screenshot warobotics.education on the new theme, drop new material
   into the applications grid, and extend the outcome section. To keep this
   cheap, the build in step 4 makes the applications section an additive
   grid: each application is one self-contained figure (image + caption), so
   an update is copy-a-block-and-swap-the-image, no restructuring.

## Out of scope

- New CSS files or JS (existing system covers it)
- Any build step or CMS
- Changes to other pages beyond the index card
- Redesigning WARES assets

## Success criteria

- Page reads as a coherent case study a stranger can follow
- Every image has a caption or surrounding text explaining its role
- Page passes the responsive and a11y checks in step 5
- Index links to it; nav and styling match the rest of the site
