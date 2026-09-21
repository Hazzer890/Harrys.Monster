# Image credits

| File | Source | Author | Licence |
|---|---|---|---|
| sea-sky.webp, sea-sky-800.webp | https://unsplash.com/photos/blue-sky-and-white-clouds-crAfJNZRKRE | Kseniia Ilinykh | Unsplash License |
| halftone-coast.svg (derived from) | https://www.pexels.com/photo/the-wadjemup-lighthouse-in-rottnest-island-australia-6604878/ | Happy Donut | Pexels Licence |

## How sea-sky.webp was made

The Unsplash download is a 2400x3600 portrait. Both files are plain Pillow
resizes of it at WebP quality 62, which is the lowest quality that leaves no
visible banding in the flat sky:

```
im = Image.open("sky-src.jpg").convert("RGB")
im.resize((1600, 2400), Image.LANCZOS).save("sea-sky.webp", quality=62, method=6)
im.resize((800, 1200), Image.LANCZOS).save("sea-sky-800.webp", quality=62, method=6)
```

## How halftone-coast.svg was made

The source is the Pexels photo of the Wadjemup lighthouse above, saved as `coast-src.jpg`.

`tools/halftone.py` expects the subject to be darker than the background, because it takes everything under a luminance threshold as the shape. This photo is the reverse, a white tower against a dark blue sky, so the photo gets a preprocessing pass first that separates on chroma rather than luminance. Per pixel, `pre = 128 - R + B` (clamped to 0-255), which makes the saturated blue sky bright and leaves the neutral tower, sand and grass dark. In Pillow that is `ImageChops.subtract(b, r, offset=128)` over the split channels. Save the result as `coast-pre.png`.

Then:

```
python3 tools/halftone.py coast-pre.png halftone-coast.svg --cols 84 --threshold 200 --box 0,230,1950,2755
```

That writes 2,944 circles on an 84x109 grid, which covers the tower and the strip of ground it stands on. Only the tower is ever shown, so the committed file drops every circle with `cy > 88` and carries `viewBox="46 0 29 88"`, leaving 1,406 circles. The dots are white and the file has no background, so it sits over the hero photo and over the indigo band on the inner pages.
