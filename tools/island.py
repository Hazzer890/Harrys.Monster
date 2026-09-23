#!/usr/bin/env python3
"""Palm island halftone for the index hero, from the owner's reference image.
Usage: python3 tools/island.py assets/images/island-ref.png assets/images/halftone-island.svg"""
import sys
from PIL import Image, ImageDraw, ImageFilter
from halftone import halftone, to_svg

THRESHOLD = 118      # luminance below this is shape: tree and island are dark on pale sky and sea
SX, SY = 1.7, 2.2    # island enlarged relative to the tree (owner asked for a bigger island)
CAP = 48             # most rows of the island band to keep; below it is the paler reflection

SRC, OUT = sys.argv[1:3]
src = Image.open(SRC).convert("L"); src = src.crop((6, 22, src.width - 6, src.height - 6))  # drop the border
big = src.resize((src.width * 4, src.height * 4), Image.LANCZOS)
mask = big.point(lambda v: 255 if v < THRESHOLD else 0)
W, H = mask.size
px = mask.load()
rows = [sum(px[x, y] > 0 for x in range(0, W, 4)) for y in range(H)]
# island = widest dark band in the lower part; its bottom edge is where the width collapses
lo = int(H * 0.6)
top_i = next(y for y in range(lo, H) if rows[y] * 4 > 0.25 * W)
bot_i = min(next((y for y in range(top_i, H) if rows[y] * 4 < 0.12 * W), H), top_i + CAP)
tree = mask.crop((0, 0, W, top_i))
island = mask.crop((0, top_i, W, bot_i))
bb = island.getbbox(); island = island.crop(bb)
island = island.resize((int(island.width * SX), int(island.height * SY)), Image.LANCZOS)
cw = max(W, island.width) + 40
canvas = Image.new("L", (cw, top_i + island.height), 0)
canvas.paste(tree, ((cw - W) // 2, 0))
cx_tree = (bb[0] + bb[2]) // 2 + (cw - W) // 2
canvas.paste(island, (cx_tree - island.width // 2, top_i - 10))
canvas = canvas.filter(ImageFilter.GaussianBlur(2))
bb = canvas.getbbox(); canvas = canvas.crop((bb[0] - 10, bb[1] - 10, bb[2] + 10, bb[3] + 10))
# tone: fronds mid, island brighter at the base
tone = Image.new("L", canvas.size, 185)
ImageDraw.Draw(tone).rectangle([0, canvas.height - island.height, canvas.width, canvas.height], fill=245)
w, h, circles = halftone(canvas, tone.filter(ImageFilter.GaussianBlur(4)), 96, rmax=0.46, rmin=0.07)
circles = [c for c in circles if not (c[0] > 85 and c[1] < 12)]  # two stray dots from the source's vignette corner
open(OUT, "w").write(to_svg(w, h, circles))
print(len(circles), "circles,", w, "x", h)
