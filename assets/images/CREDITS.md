# Image credits

| File | Source | Author | Licence |
|---|---|---|---|
| sea-sky.webp, sea-sky-800.webp | https://unsplash.com/photos/blue-sky-and-white-clouds-crAfJNZRKRE | Kseniia Ilinykh | Unsplash License |
| halftone-island.svg (derived from island-ref.png) | island-ref.png, an AI-generated image supplied by the owner | Harry Cassidy | No third-party licence |

## How sea-sky.webp was made

The Unsplash download is a 2400x3600 portrait. Both files are plain Pillow
resizes of it at WebP quality 62, which is the lowest quality that leaves no
visible banding in the flat sky:

```
im = Image.open("sky-src.jpg").convert("RGB")
im.resize((1600, 2400), Image.LANCZOS).save("sea-sky.webp", quality=62, method=6)
im.resize((800, 1200), Image.LANCZOS).save("sea-sky-800.webp", quality=62, method=6)
```

## How halftone-island.svg was made

`island-ref.png` is the owner's AI-generated reference, a palm tree on a small island. `tools/island.py` thresholds it, enlarges the island under the tree, and halftones the result on a 96-column grid with `tools/halftone.py`:

```
python3 tools/island.py assets/images/island-ref.png assets/images/halftone-island.svg
```

That writes 1,714 circles on a 96x65 grid. The dots are white with no background, and the island's base is the bottom edge of the graphic.
