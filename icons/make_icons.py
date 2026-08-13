#!/usr/bin/env python3
"""Generate RegCompass app icons (compass mark on a blue gradient tile).

Run from the icons/ directory:  python3 make_icons.py
Produces: icon-32/180/192/512.png, icon-512-maskable.png, icon-256.png (Electron).
"""
from PIL import Image, ImageDraw

BASE = 1024  # draw large, downscale for crisp edges

TOP = (29, 111, 196)     # #1d6fc4
BOTTOM = (15, 64, 118)   # #0f4076
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rounded_mask(size, radius):
    m = Image.new('L', (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def gradient_tile(size):
    img = Image.new('RGB', (size, size))
    px = img.load()
    for y in range(size):
        row = lerp(TOP, BOTTOM, y / (size - 1))
        for x in range(size):
            px[x, y] = row
    return img


def draw_compass(img, cx, cy, r):
    d = ImageDraw.Draw(img)
    ring_w = int(r * 0.15)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=ring_w)
    # needle (N-S diamond)
    n = r * 0.82
    w = r * 0.26
    d.polygon([(cx, cy - n), (cx + w, cy), (cx, cy + n), (cx - w, cy)], fill=WHITE)
    # shaded east half of the north tip
    d.polygon([(cx, cy - n), (cx + w, cy), (cx, cy)], fill=(168, 205, 240, 255))
    # hub
    hub = r * 0.16
    d.ellipse([cx - hub, cy - hub, cx + hub, cy + hub], fill=BOTTOM, outline=WHITE, width=int(r * 0.05))


def make(size, out, maskable=False):
    tile = gradient_tile(BASE).convert('RGBA')
    # compass smaller on maskable icons (safe zone = inner 80%)
    r = int(BASE * (0.26 if maskable else 0.32))
    draw_compass(tile, BASE // 2, BASE // 2, r)
    if maskable:
        canvas = tile  # full-bleed square, launcher applies its own mask
    else:
        canvas = Image.new('RGBA', (BASE, BASE), (0, 0, 0, 0))
        canvas.paste(tile, (0, 0), rounded_mask(BASE, int(BASE * 0.22)))
    canvas.resize((size, size), Image.LANCZOS).save(out)
    print('wrote', out)


if __name__ == '__main__':
    for s in (32, 180, 192, 256, 512):
        make(s, f'icon-{s}.png')
    make(512, 'icon-512-maskable.png', maskable=True)
