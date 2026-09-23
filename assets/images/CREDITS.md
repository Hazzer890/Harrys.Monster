# Image credits

| File | Source | Author | Licence |
|---|---|---|---|
| sky.webp, sky-1000.webp, sea.webp, sea-1000.webp | https://unsplash.com/photos/blue-sky-and-white-clouds-crAfJNZRKRE | Kseniia Ilinykh | Unsplash License |
| halftone-island.svg (derived from island-ref.png) | island-ref.png, an AI-generated image supplied by the owner | Harry Cassidy | No third-party licence |

## How sky.webp and sea.webp were made

The Unsplash download (`?w=3000`) is a 3000x4500 portrait. The horizon is 73.5 per cent of the way down, found from the brightness drop between sky and sea. Each size is a Pillow LANCZOS resize split at that row. The sky is WebP quality 80, where the cloud texture still matches the source at 1:1. The sea is quality 62, which is indistinguishable from lossless because the water texture hides the loss:

```
im = Image.open("sky-src.jpg").convert("RGB")      # 3000x4500
for w, suffix in ((2400, ""), (1000, "-1000")):
    h = w * 3 // 2
    cut = round(h * 0.735)                           # horizon row
    big = im.resize((w, h), Image.LANCZOS)
    big.crop((0, 0, w, cut)).save("sky%s.webp" % suffix, quality=80, method=6)
    big.crop((0, cut, w, h)).save("sea%s.webp" % suffix, quality=62, method=6)
```

## How halftone-island.svg was made

`island-ref.png` is the owner's AI-generated reference, a palm tree on a small island. `tools/island.py` thresholds it, enlarges the island under the tree, and halftones the result on a 96-column grid with `tools/halftone.py`:

```
python3 tools/island.py assets/images/island-ref.png assets/images/halftone-island.svg
```

That writes 1,714 circles on a 96x65 grid. The dots are white with no background, and the island's base is the bottom edge of the graphic.
