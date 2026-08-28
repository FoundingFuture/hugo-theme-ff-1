# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools", "brotli"]
# ///
"""Cut a real small-capitals face from variable Bricolage Grotesque.

A browser makes small capitals by scaling the capitals, which thins their
strokes by the same factor and leaves them pale beside a full letter.
A drawn small capital is shorter and very slightly lighter, and it is
wider for its height. A variable font can give all three.

Height comes from HEIGHT. Stroke comes from WEIGHT, as a fraction of the
capital's own stroke, by taking the letters from a heavier instance and
letting the scaling bring them back. Width then follows from that
instance rather than being invented, because a heavier cut is wider.

Every character the font has is kept. Anything with an uppercase form
gets the small capital, and everything else is left alone.

One cut per weight it has to stand beside, because a small capital is
calibrated against the capital next to it. The menu sets 500, a page
title sets 800.

    uv run scripts/build-smallcaps.py            both weights
    uv run scripts/build-smallcaps.py 800        just one
"""

import sys
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCE = Path("scripts/BricolageGrotesque.ttf")


HEIGHT = 0.85      # of cap height
WEIGHT = 0.92      # of the capital's stroke
# Titles only. The menu keeps the face it always had.
#
# 800 is the top of the axis, so a cut calibrated there has nowhere
# heavier to take its capitals from and lands at 0.85, which is what a
# browser already does for free. 700 leaves the headroom the method needs.
WEIGHTS = (700,)
OPSZ = 24
FAMILY = "Bricolage Small Caps"
AUTHOR = "Eddie Niese"
FOUNDRY = "FoundingFuture"
SITE = "https://foundingfuture.com/"


def instance(path, wght):
    """A static cut of the variable font at one weight."""
    font = TTFont(path)
    return instantiateVariableFont(
        font, {"wght": wght, "wdth": 100, "opsz": OPSZ}, inplace=True)


def stem(font):
    """The vertical stem, measured off the I rather than assumed."""
    glyph_name = font.getBestCmap()[ord("I")]
    glyf = font["glyf"][glyph_name]
    return glyf.xMax - glyf.xMin


def find_weight(path, want):
    """The weight whose stem, once scaled, lands on the one we want."""
    low, high = 200.0, 800.0
    for _ in range(24):
        mid = (low + high) / 2
        if stem(instance(path, mid)) * HEIGHT < want:
            low = mid
        else:
            high = mid
    return round((low + high) / 2, 1)


def cut(target):
    """One small-capitals face, calibrated against one weight."""
    out = Path(f"static/fonts/bricolage-smallcaps-{target}.woff2")
    base = instance(SOURCE, target)
    want = stem(base) * WEIGHT      # the stroke we are after
    source_wght = find_weight(SOURCE, want)
    caps = instance(SOURCE, source_wght)

    cap_stem = stem(base)
    got = stem(caps) * HEIGHT
    print(f"  capital stem {cap_stem} at wght {target}")
    print(f"  small capital wants {want:.1f}, taken from wght {source_wght} "
          f"and scaled to {got:.1f}")

    cmap = base.getBestCmap()
    cap_cmap = caps.getBestCmap()
    cap_glyphs = caps.getGlyphSet()
    scale = Transform().scale(HEIGHT, HEIGHT)

    done = 0
    for code, name in sorted(cmap.items()):
        upper = chr(code).upper()
        if len(upper) != 1 or ord(upper) == code:
            continue                       # no uppercase form, or already one
        cap_name = cap_cmap.get(ord(upper))
        if cap_name is None:
            continue
        pen = TTGlyphPen(base.getGlyphSet())
        cap_glyphs[cap_name].draw(TransformPen(pen, scale))
        base["glyf"][name] = pen.glyph()
        width, lsb = caps["hmtx"][cap_name]
        base["hmtx"][name] = (round(width * HEIGHT), round(lsb * HEIGHT))
        done += 1

    # Named for what it is. The source's own name said 96pt ExtraBold,
    # which this is not: it is one cut, at one optical size and one weight.
    slug = FAMILY.replace(" ", "")
    style = "Regular" if target < 600 else "Bold"
    for nid, value in ((1, FAMILY), (2, style), (3, f"{slug}-{style}-2026"),
                       (4, f"{FAMILY} {style}"), (6, f"{slug}-{style}"),
                       (16, FAMILY), (17, style)):
        base["name"].setName(value, nid, 3, 1, 0x409)

    # The original notice stays, because the licence says so and because it
    # is true. Ours is added beside it, for the cut rather than the letters.
    original = base["name"].getDebugName(0) or ""
    base["name"].setName(
        f"{original} Small capitals cut 2026 {AUTHOR} for {FOUNDRY}, {SITE}",
        0, 3, 1, 0x409)
    designers = base["name"].getDebugName(9) or "Ateliers Mathieu Triay"
    base["name"].setName(f"{designers}. Small capitals by {AUTHOR}.", 9, 3, 1, 0x409)
    base["name"].setName(FOUNDRY, 8, 3, 1, 0x409)     # who made this cut
    base["name"].setName(SITE, 11, 3, 1, 0x409)       # vendor
    base["name"].setName(SITE, 12, 3, 1, 0x409)       # designer

    # the licence travels with the font, which the licence itself requires
    licence = Path("static/fonts/OFL.txt")
    if not licence.exists():
        print(f"  WARNING: {licence} is missing. The OFL has to ship beside it.")

    base["OS/2"].usWeightClass = target
    base.flavor = "woff2"
    out.parent.mkdir(parents=True, exist_ok=True)
    base.save(out)
    print(f"  {done} characters cut, {out.name} is {out.stat().st_size // 1024}KB")


def main():
    if not SOURCE.exists():
        print(f"no font at {SOURCE}. Fetch the variable Bricolage first.")
        return 1
    if not Path("static/fonts/OFL.txt").exists():
        print("  WARNING: static/fonts/OFL.txt is missing. It has to ship.")
    for target in ([int(a) for a in sys.argv[1:]] or list(WEIGHTS)):
        cut(target)
    return 0


if __name__ == "__main__":
    sys.exit(main())
