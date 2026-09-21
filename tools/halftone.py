#!/usr/bin/env python3
"""Halftone SVG generator for harrys.monster. Run once, commit the output. Needs Pillow."""
import argparse
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


def halftone(shape, tone, cols, rmax=0.5, rmin=0.08):
    """shape and tone are same-size 'L' images: shape is coverage (255 = solid),
    tone is brightness. One circle per grid cell, in grid units. The LANCZOS
    downsample leaves partial coverage at the edges, which feathers the dots."""
    rows = round(cols * shape.height / shape.width)
    s = shape.resize((cols, rows), Image.LANCZOS)
    t = tone.resize((cols, rows), Image.LANCZOS)
    circles = []
    for y in range(rows):
        for x in range(cols):
            r = rmax * (s.getpixel((x, y)) / 255) * (0.35 + 0.65 * t.getpixel((x, y)) / 255)
            if r >= rmin:
                circles.append((x + 0.5, y + 0.5, round(min(r, rmax), 2)))
    return cols, rows, circles


def to_svg(w, h, circles):
    body = "".join(f'<circle cx="{cx:g}" cy="{cy:g}" r="{r:g}"/>' for cx, cy, r in circles)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="#fff">{body}</svg>'


def from_photo(path, threshold, box):
    img = Image.open(path).convert("L")
    if box:
        img = img.crop(box)
    # Land is darker than sky: everything under the threshold is the shape.
    shape = img.point(lambda v: 255 if v < threshold else 0).filter(ImageFilter.GaussianBlur(2))
    return shape, ImageOps.autocontrast(img)


def from_text(text, font_path):
    font = ImageFont.truetype(font_path, 400)
    l, t, r, b = font.getbbox(text)
    shape = Image.new("L", (r - l + 40, b - t + 40), 0)
    ImageDraw.Draw(shape).text((20 - l, 20 - t), text, fill=255, font=font)
    return shape, Image.new("L", shape.size, 255)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["photo", "text"])
    p.add_argument("src", help="image path, or the string in text mode")
    p.add_argument("out")
    p.add_argument("--cols", type=int, default=90)
    p.add_argument("--threshold", type=int, default=110)
    p.add_argument("--box", type=lambda s: tuple(int(v) for v in s.split(",")))
    p.add_argument("--font", default="/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf")
    a = p.parse_args()
    shape, tone = from_text(a.src, a.font) if a.mode == "text" else from_photo(a.src, a.threshold, a.box)
    w, h, circles = halftone(shape, tone, a.cols)
    open(a.out, "w").write(to_svg(w, h, circles))
    print(f"{a.out}: {len(circles)} circles, {w}x{h}")
