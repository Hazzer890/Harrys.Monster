"""Run: python3 tools/test_halftone.py"""
from PIL import Image
from halftone import halftone, to_svg

# Left half solid, right half empty. Tone brightens top to bottom.
shape = Image.new("L", (200, 100), 0)
shape.paste(255, (0, 0, 100, 100))
tone = Image.new("L", (200, 100))
tone.putdata([int(255 * (y / 99)) for y in range(100) for _ in range(200)])

w, h, circles = halftone(shape, tone, cols=20)
assert (w, h) == (20, 10), (w, h)
assert circles, "no circles"
assert all(cx < 11 for cx, _, _ in circles), "dots leaked into the empty half"
top = max(r for _, cy, r in circles if cy < 2)
bottom = max(r for _, cy, r in circles if cy > 8)
assert bottom > top, "brighter tone must give bigger dots"
assert all(0.08 <= r <= 0.5 for _, _, r in circles)

svg = to_svg(w, h, circles)
assert svg.startswith("<svg") and svg.count("<circle") == len(circles)
assert 'viewBox="0 0 20 10"' in svg
print("ok", len(circles), "circles")
