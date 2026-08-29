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

## Still undecided

The **tail gradient**: `main::after` fills the space between the last
content and the footer, fading white into grey. Faithful to the
original, and heavy on a short page. Eddie has seen it and not ruled.
