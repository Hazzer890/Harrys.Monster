# Content expansion: design

24 Nov 2026 · branch `content` · approved by Harry from the Projects page mock ("looks good, proceed").

## Why

The site shows about a fifth of Harry's work. It never names Team 4788, has no awards or press, and the timeline has two entries. The research sweep (LinkedIn, GitHub, FIRST records, this machine) found the rest. The site should read as a mechatronics engineer who teaches and builds, with AI as one tool, for someone deciding whether to hire or work with him.

## Goals

- Every substantial piece of work has a write-up or a place on a roundup page.
- The timeline carries the full role history, awards and press.
- Every claim on the site is one Harry can back. Team awards are labelled as team awards.

## Non-goals

- No visual redesign. The Sept 2026 retheme decisions stand (light only, system fonts, no header band, white cards on the photo).
- No FTC Inserter page (Harry left it out of this round).
- No build step. The site stays static HTML with a nav block repeated per page.

## Anti-goals

- Claims that outrun the evidence: "top marks", "led for ten seasons", 4788 as 2018 national winners, placeholder Robotics West stats, the prepared 70/70 Festo ledger.
- Naming school students, or publishing student data from the preseason folders.
- Copy that reads as AI. All prose goes through the harry-voice skill.

## Approaches

1. **Projects page plus a featured five on the homepage (picked).** New `projects.html` with three groups. The homepage mosaic keeps five cards, which is what its layout is built for.
2. Everything on the homepage. Rejected: 13 cards bury the contact form and break the five-card mosaic.
3. One page per item (about 17 pages). Rejected: eight of them would be thin. One-offs share two roundup pages instead.

## Structure

`projects.html`, three groups:

- **Robots and people:** FRC Team 4788 (`team-4788.html`), Power the Town (`power-the-town.html`), Robotics West (`robotics-west.html`), WARES (`wares.html`, expanded).
- **Mechatronics:** Robot arm cannon (`robot-arm.html`), Festo production line (`festo-line.html`), Hardware builds (`hardware-builds.html`: LED scoreboard wall, badge PCB, FTC field riser).
- **AI and software:** Agentic model tuning (rewritten with the BLEVE numbers), Single-use software, Software builds (`software-builds.html`: WebFab, pcb-viewer, Thunderbird restyle, cleanshot-linux, local LLM benchmarks), Tools (`tools.html`: the subdomain tools), Building web products with AI, How I work.

Homepage: mosaic of five featured cards, "All projects" goes to `projects.html`, rail count updated, intro kept. Nav Projects menu lists the same five plus "All projects".

Timeline: roles in reverse order. Birth card stays (his joke), month dropped. Harry dropped the separate awards and press panel after seeing it (24 Nov).

New pages reuse the existing case-study template (`case-main`, `case-head`, `case-body glass`) and card classes. New CSS is limited to the group heading tile and the two-column card grid from the mock.

## Decisions Harry made

- Delete `assets/cv.pdf`.
- History wording: student on Team 5663, then lead mentor of 4788.
- Scope: groups 1, 2, 4, 5, 6, 7, 8, 9 from the research list.
- Structure and batch order as mocked.

## My calls (correct any of these)

- Lead mentor "since 2021", from the LinkedIn coordinator date. Joined in 2016, from the old CV.
- Degree dates 2021 to 2028, from LinkedIn and the academic record.
- Robert Lewis and Allyzain Mohammed named as project partners, as in the mock.
- Unit marks quoted only where strong and on record (96 for MXEN3005). No assignment-level claims.
- WARES turnover figure left off the site (it is on LinkedIn, but a portfolio does not need it).
- Featured five until batch 2 lands: Team 4788, Robotics West, WARES, agentic tuning, single-use software. After batch 2: Team 4788, Power the Town, agentic tuning, robot arm, WARES.

## Batches

1. **Structure and people:** `projects.html`, nav on every page, homepage, timeline, `team-4788.html`, `robotics-west.html`, WARES expansion, sitemap, CV removal.
2. **Builds:** `power-the-town.html`, `robot-arm.html`, `festo-line.html`, `hardware-builds.html`, `software-builds.html`, `tools.html`, agentic tuning rewrite, final featured five.

## Check

A link checker over every root page (no dead internal links, nav identical across pages), plus screenshots at desktop and phone width for Harry to judge by eye.

## Batch 3: backup drive and background pages (24 Nov 2026)

Added after Harry mounted an old backup drive and asked for explainer pages.

- Two case studies from coursework on the drive: `maze-robot.html` (2022) and `number-recognition.html` (2025).
- Two explainers, `what-is-first.html` and `what-is-frc.html`, listed under a fourth "Background" group on `projects.html` and linked from the Team 4788 page and the timeline.
- Team 4788 page: four photos in `assets/team/` (robots and parts only, no people), a section on the January 2024 alpha robot, the training site, and 2021 and 2024 results.
- `.case-figs` in `css/components.css` is the shared figure grid for case pages.
- Left out: photos with students in them, collaborator names on the two new case studies, the STEM Officer contract title.
