#!/usr/bin/env python3
"""Rewrite the Projects menu on every root page, so the repeated nav stays in step.

Edit FEATURED (and PROJECT_PAGES when a case study is added), then run:
    python3 tools/nav.py && python3 tools/check_site.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (page, icon id in assets/icons.svg, label). "All projects" is added last.
FEATURED = [
    ("team-4788.html", "users", "Team 4788"),
    ("power-the-town.html", "bolt", "Power the Town"),
    ("agentic-tuning.html", "sliders", "Agentic tuning"),
    ("robot-arm.html", "arm", "Robot arm cannon"),
    ("wares.html", "tag", "WARES"),
]
# Pages that light up the Projects button.
PROJECT_PAGES = {
    "projects.html", "team-4788.html", "robotics-west.html", "wares.html",
    "agentic-tuning.html", "single-use-software.html", "ai-web-products.html",
    "how-i-work.html", "power-the-town.html", "robot-arm.html", "festo-line.html",
    "hardware-builds.html", "software-builds.html", "tools.html",
    "maze-robot.html", "number-recognition.html", "what-is-first.html", "what-is-frc.html",
}

MENU = re.compile(
    r'(<button type="button" class="nav-link nav-drop)(?: active)?'
    r'(" aria-expanded="false" aria-controls="menu-projects">.*?'
    r'<div class="nav-menu" id="menu-projects">\n).*?(\n\s*</div></div></li>)',
    re.S,
)


def tile(href, icon, label, current):
    here = ' aria-current="page"' if href == current else ""
    return (
        f'            <a href="{href}" class="nav-tile"{here}><span class="nav-tile-icon">'
        f'<svg aria-hidden="true"><use href="assets/icons.svg#{icon}"/></svg></span>{label}</a>'
    )


def main():
    for page in sorted(ROOT.glob("*.html")):
        tiles = [tile(*item, page.name) for item in FEATURED]
        tiles.append(tile("projects.html", "grid", "All projects", page.name))
        active = " active" if page.name in PROJECT_PAGES else ""
        html, n = MENU.subn(
            lambda m: m.group(1) + active + m.group(2) + "\n".join(tiles) + m.group(3),
            page.read_text(),
        )
        assert n == 1, f"{page.name}: expected one Projects menu, found {n}"
        page.write_text(html)
    print("nav written")


if __name__ == "__main__":
    main()
