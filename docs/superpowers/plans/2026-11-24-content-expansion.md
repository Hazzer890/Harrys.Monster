# Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the missing work, roles, awards and press to harrys.monster, behind a new Projects page.

**Architecture:** Static HTML, no build step. New pages copy the head, nav and footer of `agentic-tuning.html`. One script owns the Projects menu so the nav stays identical across pages, and one script checks links, nav and sitemap.

**Tech Stack:** HTML, CSS, Python 3 standard library for the two tools.

**Spec:** `docs/superpowers/specs/2026-11-24-content-expansion-design.md`

## Global Constraints

- Light mode only, system fonts, white cards on the photo, no header band. No visual redesign.
- All prose through the harry-voice skill: first person, comma-joined sentences, Australian spelling, no em dashes, no hype words.
- Team awards are labelled as the team's. No "top marks", no "ten seasons", no 4788 as 2018 national winners, no Robotics West placeholder stats, no 70/70 Festo ledger.
- No school students named, no student data.
- History wording: student on Team 5663 from 2016, lead mentor of 4788 since 2021.
- `assets/cv.pdf` stays deleted and unreferenced.

## Review Focus

- A page links to a batch 2 page that does not exist yet: the checker must fail on any dead internal link.
- The nav drifts between pages after a hand edit: the checker compares every page's nav after normalising the active state.
- A new page is missing from `sitemap.xml`: the checker fails.
- A card grid with an odd number of cards, or one card, at phone width: screenshot check at 390 px.
- A reader lands on a roundup page from a homepage card and cannot get back: every case page keeps the "All work" link, now pointing at `projects.html`.

---

### Task 1: Site checker

**Files:** Create `tools/check_site.py`.

- [ ] Write `tools/check_site.py`, run as `python3 tools/check_site.py`, exit 1 with one line per failure. It checks, over every `*.html` in the repo root:
  - every internal `href` and `src` resolves to a file, and every `page.html#id` has that id in the target
  - the `<ul class="nav-links">` block is identical on every page once `active`, `aria-current` and the homepage's bare `#hero`, `#projects`, `#contact` forms are normalised
  - every page except `404.html` is in `sitemap.xml`
  - no page references `cv.pdf`
- [ ] Run it on the untouched site. Expected: PASS (it must not flag the current site).

### Task 2: Projects menu script

**Files:** Create `tools/nav.py`. Modify every root `*.html`.

- [ ] Write `tools/nav.py` with a `FEATURED` list of `(href, icon, label)` and a `PROJECT_PAGES` set. It rewrites the `menu-projects` block on every root page, ends the menu with "All projects" pointing at `projects.html`, sets `aria-current="page"` on the tile for the current page, and puts `active` on the Projects button for every page in `PROJECT_PAGES`.
- [ ] Batch 1 `FEATURED`: Team 4788, Robotics West, WARES, Agentic tuning, Single-use software.
- [ ] Run `python3 tools/nav.py && python3 tools/check_site.py`. Expected: fails only on the pages not written yet.

### Task 3: Projects page and its CSS

**Files:** Create `projects.html`. Modify `css/layout.css`, `css/responsive.css`, `sitemap.xml`.

- [ ] Move the mock's `.group-head` and `.card-grid` rules into `layout.css` and the phone rule into `responsive.css`. Bump the `?v=` on both stylesheets on every page.
- [ ] Build `projects.html` from the approved mock. Batch 1 lists only pages that exist; batch 2 adds its cards.
- [ ] Every case page's back link goes to `projects.html`.

### Task 4: Team 4788, Robotics West, WARES

**Files:** Create `team-4788.html`, `robotics-west.html`. Modify `wares.html`, `ai-web-products.html`, `sitemap.xml`.

- [ ] `team-4788.html`: the team, my role, how I mentor, the team's results by year (2022 to 2026, labelled as the students'), what I built for the team (Spring Season 2026, Skills Library, team4788.com), the Woodie Flowers nomination, the Examiner quote with a link.
- [ ] `robotics-west.html`: why it exists, the incorporation (lodged 8 Apr 2026, two rounds of regulator feedback, approved 11 Aug 2026), brand and site with the collaboration stated.
- [ ] `wares.html`: add a section on the business ahead of the brand work (what it supplies, my part, the move to outsourced production, docs site and kitbot instructions).
- [ ] `ai-web-products.html`: the "state of play" section says what is live now.

### Task 5: Timeline and homepage

**Files:** Modify `timeline.html`, `index.html`.

- [ ] Timeline roles, newest first: Lebob mentor (Aug 2026), Robotics West Chairperson (Mar 2026), WARES co-founder (2024), lab demonstrator (Feb 2023, rewritten with the survey figures and their respondent counts), Curtin Engineers Club VP (2023), Curtin Robotics Club Secretary (2022), Altronics (2022 to 2023), iLearn instructor (2021 to 2022), STEM Outreach FIRST Robotics Coordinator (Jun 2021), degree (2021 to 2028), FLL Head Referee (2021), Fremantle Commercial Diving (2018 to 2019), student on Team 5663 (2016), birth (2002, month dropped).
- [ ] ~~New "Awards and press" section~~ Dropped by Harry after seeing it.
- [ ] About text: "ten seasons" replaced with the agreed wording.
- [ ] Homepage: five featured cards, rail note and count rewritten, "All projects" link, em dashes removed from copy I touch.

### Task 6: Verify batch 1

- [ ] `python3 tools/check_site.py` passes.
- [ ] Screenshots of `index.html`, `projects.html`, `timeline.html`, `team-4788.html`, `robotics-west.html`, `wares.html` at 1300 px and 390 px, opened for Harry.

### Batch 2 (after Harry has seen batch 1)

`power-the-town.html`, `robot-arm.html`, `festo-line.html`, `hardware-builds.html`, `software-builds.html`, `tools.html`, agentic tuning rewrite, their cards on `projects.html`, final `FEATURED` list (Team 4788, Power the Town, Agentic tuning, Robot arm, WARES), same checks.
