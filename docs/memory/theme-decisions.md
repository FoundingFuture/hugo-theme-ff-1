# Decisions, and why they went that way

Settled with Eddie during the build. Not derivable from the code.

## Identity

The theme is **ff-1**. `hugo-theme-ff-1` is the repository. They are not
the same name.

`theme.toml`'s `homepage` points at the product page, because
`slug.sh` reads the slug from its **last path segment**. That is what
makes a site write `theme = "ff-1"` rather than the repository's name.
The module path lives in `go.mod`, where Hugo puts it, and never in
`homepage`.

`theme-hugo-ff1`, which published as *FoundingFuture I*, is **retired**.
No site stays on `foundingfuture-i`, so nothing here needs a migration
path. That is what makes the breaking choices free.

## What ff-1 believes

Fourteen features on, nine off. It shows a date and says nothing else
about a piece before it is read, so `reading-time`, `word-count` and
`last-modified` are off.

**Navigation.** A site that defines `menus.main` gets that menu, walked
with Hugo's semantics. A site that defines none gets its own folders,
any depth, no configuration. A defined menu *replaces* the tree rather
than being appended to. `params.extraNav` was dropped: a Hugo menu
entry already does it.

A theme **cannot** contribute menu entries. `[[menus.main]]` is a slice
and Hugo merges maps from a theme, never slices. The same wall stops a
theme adding an `[outputs]` format, which is why search reads the DOM.

`sectionPagesMenu = 'main'` fills that menu with **top-level sections
only**. A site setting it flips to the menu branch and silently loses
every level below the first. No template can detect it; it is written
down in `hugo.toml` and the README.

**Search.** The index is the page. Every piece is a real row carrying
its signals in data attributes, ranked with the original's weights:
title-start 12, title 8, tags 6, section 3, description 2, body 1, and
every term must appear. Nothing is fetched.

**Embeds.** Poster and play button, click-to-load, across YouTube,
Vimeo and SoundCloud. Hugo's `youtube` and `vimeo` are overridden
because `output/external` forbids their iframes.

**Ordering** is Hugo's default: weight ascending, then date descending.
Unweighted sections sort by date, which reads as no order at all. The
theme does not override it — `weight` is the lever every Hugo user
knows.

**`rail-pages`** lists a topic's pieces in the menu. Measured at about
**15 bytes a row gzipped**, so a few hundred pieces cost a few
kilobytes and a few thousand cost thirty. It is a feature for that
reason; a very large site turns it off.

## Settled on 2026-08-29

**Search is reachable.** The rail opens with a search box, first child of
`nav.rail` at every width. It finds the search page by `Layout ==
"search"` through `partialCached "find-page.html"` keyed on the
language, so the URL is never written in the theme. It is a plain GET;
`search.js` already read `?q=` on arrival, so the box needs no script.
Its class is `findbox` and **not** `search-form`: `search.js` binds the
first `.search-form` it finds and the rail stands before `main`, so
sharing the class would hand it the rail's box and leave the real form
dead.

**The footer spans both columns.** `.side` ends at row 3 rather than
`-1`, because a sticky item paints over a static one and a sidebar still
spanning to the last row covered the footer's left end once the page was
scrolled to the bottom.

**An anchor clears the band.** `.strip` is sticky at `top:0`, so a
heading whose anchor was followed landed underneath it. `--band` is the
height the band asks for and `--band-seen` the height it gets: between 34
and 60rem the brand cell spans two rows and the grid stretches it.
Raising `--band` there feeds straight back into the row and grows it
again, which is why they are two names.

**Dark mode.** A sun and a moon in the corner of the brand cell, written
to `localStorage`, applied from the head before first paint. With nothing
chosen the page follows `prefers-color-scheme`; an explicit choice wins
either way. The palette is the theme's own custom properties given other
values, so a site that restyled the theme gets its own dark mode free.
`--brand-bg` and `--brand-fg` exist because the slab must **not** invert:
painted with `--ink` it would become the brightest thing on a dark page.

**`--muted` is `#5A6874`.** The old `#78868F` failed WCAG AA on all three
grounds. See `linters-and-browser-support.md`.

## Still undecided

The **tail gradient**: `main::after` fills the space between the last
content and the footer, fading white into grey. Faithful to the
original, and heavy on a short page. Eddie has seen it and not ruled.
