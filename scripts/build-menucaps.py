# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools[woff]", "brotli"]
# ///
"""Cut the menu face from Roboto Condensed, keeping its real small capitals.

Google's CDN is not an option here. Its subsetter drops layout features a
site is statistically unlikely to want, and small capitals are one of them,
so a font served from fonts.gstatic.com has no smcp table and the browser
falls back to shrinking capitals. Shrunk capitals keep the stroke weight of
full ones, which is what made the first attempt at this menu look wrong.

So the face is cut here, from the upstream variable font, and served from
the theme. Roboto Condensed reserves no font name, so the cut keeps the
family name and only says what was done to it.

    uv run scripts/build-menucaps.py RobotoCondensed[wght].ttf
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

WEIGHT = 400            # what the menu rows are set in
OUT = Path("static/fonts/roboto-condensed-caps.woff2")

# Latin, punctuation and the few marks a menu label can carry. Small capitals
# are pulled in by the feature below rather than by codepoint, because they
# have no codepoints of their own.
UNICODES = (
    "U+0020-007E,"          # basic latin
    "U+00A0-00FF,"          # latin-1, for accented topic names
    "U+0100-017F,"          # latin extended-A
    "U+2018-201D,U+2013,U+2014,U+2026,U+00B7"   # quotes, dashes, ellipsis
)
KEEP = ["smcp", "c2sc", "ccmp", "locl", "liga", "kern", "mark", "mkmk"]


def main(src):
    font = TTFont(src)
    instantiateVariableFont(font, {"wght": WEIGHT}, inplace=True, updateFontNames=False)

    opts = subset.Options()
    opts.layout_features = KEEP
    opts.desubroutinize = True
    opts.drop_tables += ["DSIG"]
    opts.name_IDs = ["*"]
    opts.name_legacy = True
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True

    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)

    # Say what this is. The family name may stay: Roboto Condensed reserves
    # no name, so a modified version is not obliged to rename. What must
    # stay is the copyright, and it does.
    # The attribution the licence carries, not the older line still sitting
    # in the binary: upstream relicensed to the OFL and its OFL.txt names
    # the project authors, while the font's own name table was never updated.
    note = ("Copyright 2011 The Roboto Project Authors "
            "(https://github.com/googlefonts/roboto-classic). "
            f"Weight {WEIGHT} instance, subset to Latin with small capitals "
            "kept, cut for the FoundingFuture I theme.")
    name = font["name"]
    for rec in name.names:
        if rec.nameID == 0:
            name.setName(note, 0, rec.platformID, rec.platEncID, rec.langID)

    font.flavor = "woff2"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUT)

    made = TTFont(OUT, lazy=True)
    feats = sorted({f.FeatureTag for f in made["GSUB"].table.FeatureList.FeatureRecord})
    print(f"  wrote {OUT}  {OUT.stat().st_size // 1024}KB")
    print(f"  glyphs   {len(made.getGlyphOrder())}")
    print(f"  mapped   {len(made.getBestCmap())}")
    print(f"  features {','.join(feats)}")
    print(f"  smcp     {'yes' if 'smcp' in feats else 'MISSING'}")


if __name__ == "__main__":
    main(sys.argv[1])
