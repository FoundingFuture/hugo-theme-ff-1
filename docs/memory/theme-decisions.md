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

Sixteen features on, seven off. It showed a date and said nothing else
about a piece before it was read, so `reading-time` and `word-count`
were off. Eddie asked for both on (2026-08-29): a reader deciding
whether to start a long piece is owed its length. `last-modified` stays
off, because when a page was edited is the author's business and not
the reader's.

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

**The tail gradient is ruled.** It was heavy, and it only ever appeared
where a piece left space above the footer. It is now a cue that an
article is ending: the last 300px of the text block fade to
`--tail-end`, on any page length. `main::after` keeps the older job of
filling leftover space, in the same colour.

It sits on the text block rather than on `main` because the bands after
an article -- related, tags, the pager -- carry their own grounds, and a
fade behind them showed through the prose then stopped dead at the first
band. The measure moved from the block to its children (less the block's
inset, so the line is unchanged at 765.2px) because a background on a
capped block ends where the cap does and reads as a panel.

Both weights are held to what body text reads against at full strength,
since the fade now runs behind text: 5.38 to 1 in light, 6.72 in dark.
The 45% it began with measured 3.33 under that test. Dark stops much
earlier than light — it lifts off the ground rather than sinking into
it, and only 1.7 times as far as the surface it rises from.

## Still undecided

Nothing outstanding on the look. `output/visual` still has no baseline
until a release writes one.

## Decisions taken on 2026-08-30 and 31

Each of these was put to the owner and answered. A later session that
finds them odd should ask before changing them.

**The theme ships static/favicon.ico.** It is the file `hugo new theme`
writes, byte for byte, and no template references it. Hugo merges a
theme's `static/` into the site's on file level. So it lands at the root
of every site that installs this one. Kept on purpose. `output/conform`
compares our published files against the reference scaffold, and the
scaffold publishes it, so removing it breaks that comparison.

**404.html is exempt from the scaffold comparison.** By name, in both
`conform.sh` and `skeleton.py`. Hugo writes `404.html` wherever a
template exists and the scaffold ships none. A theme that gives a site
the page publishes one file the scaffold cannot. No switch changes
that. Every other file is still compared.

**A title takes the measure, not a character count.** It was `22ch`.
That is 648px in the display face, and no relation to anything else. `ch` is
the width of a zero, 29.4px, and the letters average 36.7px. The number
never meant 22 characters. A title now ends where the paragraphs
end, and `text-wrap:balance` evens the lines when it wraps.

**The measure is declared on main.** Not on the body part. The head is
that part's sibling, so a title could not reach a value declared below
it. main carries the same font size and padding, so the number is
unchanged.

**The open topic carries dark ink in dark mode.** White on the four
lifted palette colours is 2.20 to 2.61 against AA's 4.5. On `--paper`
the same four read 6.91 to 8.20. The ink is tied to the fill with
`:not(:hover)`. The dark hover rule outranks `details[open]` on the
background, so the fill goes pale under the pointer.

**The contents rail marks hover in its own colour.** Amber in light,
indigo in dark, through `--toc-hover`. Amber on a dark ground is the
warmest thing on the page. It would pull harder than the reading marker
beside it.

**Maths output resolves per page.** `math-output.html` reads the site
first and the page second. Every other switch here resolves that way
and this one did not. A site was MathML or KaTeX markup end to end.

**One partial decides what leaving the site means.** `link.html`. The
rule was written three times in an afternoon before that. A link in the
text, a menu entry, a footer entry, an `items` row and the edit link all
arrive there.
