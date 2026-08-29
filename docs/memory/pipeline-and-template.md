# This repository and hugo-theme-template

`ff-1` was generated from `../hugo-theme-template` and carries a copy of
its `tools/`. Both are on `main`, both pushed, both green.

## What flows which way

A fix to the **pipeline** belongs in both. Several started here and were
carried back: the reference shortcode stubs, the slot machinery, the
namespacing, `go.mod`, the example site, and the glyph gate.

Some divergence is **deliberate and must not be "fixed"**:

| Here | There | Why |
|---|---|---|
| no `features/` | search, embeds, katex as components | ff-1 retired the component tier |
| `ours-config.sh` mounts nothing | mounts each component | same |
| `install.sh` builds once | one build per component | same |
| `[params.ff-1]` in the fixture | `[params.privacyEmbeds]` | namespacing |
| shorter comments in a few scripts | the originals | prose rewritten for a linter since removed; cosmetic only |

The template also has an `enable-katex` branch and commits of Eddie's
own. Check its `main` before assuming this copy is newer.

## The gates, and the two that are new

`./c check` runs static, build and output. `release` runs only when
asked, which is why two faults in it went unseen for so long.

Two gates were added during this work:

- **`build/example`** builds `exampleSite/` the way a downloader does:
  the artefact unzipped into `themes/<slug>`, under `--panicOnWarning`.
  It also fails if the example site's `theme` key disagrees with
  `slug.sh`.
- **`static/glyphs`** checks every mark the theme draws exists in a face
  that can draw it. The shipped woff2 are subsets; asking one for a
  character it lacks falls back silently to the reader's system. It
  reads the stylesheet rather than a list, needs `fontTools`, and skips
  `*.min.css` because a vendored library brings its own faces.

## Faults found in the pipeline itself

`release/module` had **never passed** for any theme: it wrote its
replacement as an `[[module.replacements]]` table where Hugo wants a
string under `[module]`.

`slug.sh` returned the checkout's directory name whenever `homepage`
ended in a slash.

The template derived the slug **twice**, from the theme name and from
the homepage, which disagree whenever the repository is not named after
the theme.

## The example site

`./c init` generates it: `hugo new site`, seeded with the scaffold's own
sample content, then `tools/scripts/example-content.py` adds depth via
`hugo new content` so every page comes through the archetype. It is
deterministic — pinned dates, seeded lorem — and `keep`, not `ship`: a
downloader unzipping into `themes/ff-1/` has no use for a nested Hugo
site.

Section `_index.md` files get a one-paragraph intro, not an article, or
the listing is pushed off the screen. Sections carry weights ten apart.
Every section has a body, because a bodyless one is drawn muted as a
container and reads as a fault among topics that are not.
