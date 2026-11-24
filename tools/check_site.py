#!/usr/bin/env python3
"""Check the static site: dead links, nav drift, sitemap gaps. Exit 1 on any failure.

Run from anywhere: python3 tools/check_site.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob("*.html"))
NAV = re.compile(r'<ul class="nav-links">.*?</ul>', re.S)


def nav_of(html):
    """The nav list with per-page state stripped, so every page should match."""
    m = NAV.search(html)
    if not m:
        return None
    nav = m.group(0)
    nav = nav.replace(' aria-current="page"', "").replace(" active", "")
    # The homepage links to its own sections with bare fragments.
    nav = nav.replace('href="#hero"', 'href="index.html"')
    return re.sub(r'href="#(\w+)"', r'href="index.html#\1"', nav)


def main():
    fails = []
    text = {p.name: p.read_text() for p in PAGES}
    ids = {name: set(re.findall(r'\bid="([^"]+)"', html)) for name, html in text.items()}
    sitemap = (ROOT / "sitemap.xml").read_text()
    navs = {}

    for name, html in text.items():
        if "cv.pdf" in html:
            fails.append(f"{name}: references cv.pdf")
        for ref in re.findall(r'\b(?:href|src)="([^"]+)"', html):
            if re.match(r"(https?:|mailto:|tel:|data:|//)", ref):
                continue
            path, _, frag = ref.partition("#")
            path = path.split("?")[0]
            target = name if not path else path.lstrip("/")
            if not (ROOT / target).exists():
                fails.append(f"{name}: dead link {ref}")
            elif frag and target in ids and frag not in ids[target]:
                fails.append(f"{name}: no #{frag} in {target}")
        if name != "404.html":
            loc = "https://harrys.monster/" + ("" if name == "index.html" else name)
            if f"<loc>{loc}</loc>" not in sitemap:
                fails.append(f"{name}: missing from sitemap.xml")
        navs[name] = nav_of(html)
        if navs[name] is None:
            fails.append(f"{name}: no nav found")

    want = navs.get("index.html")
    for name, nav in navs.items():
        if nav and nav != want:
            fails.append(f"{name}: nav differs from index.html")

    print("\n".join(fails) if fails else f"ok: {len(PAGES)} pages")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
