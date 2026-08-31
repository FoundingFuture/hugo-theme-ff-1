# Where things stand

Written 2026-08-31, at the end of a long session. Read this first.

## The theme

v0.2.9 is tagged, pushed and published on GitHub. The working tree is
clean and nothing is unpushed. Seven versions went out that day, v0.2.3
through v0.2.9.

`./c check` runs 33 checks in three gates. `./c check gate=release` runs
7 more, and `./c check` does not include them. A full run takes about
four minutes. `./c release v=0.2.9` gates, refreshes the snapshots,
tags and pushes. GitHub then builds the zip, which takes seven to nine
minutes. The release is not done until `gh release list` shows it.

## How to work here

Write a failing check before the fix, the way `band`, `downstream`,
`contrast`, `prose` and `showcase` were each built. Falsify a new gate
by breaking the thing it watches and confirming it complains.

Run `tools/scripts/check/css.sh` after a stylesheet edit. It takes a
second. Three findings come up again and again: the blank line before a
comment, the shorthand, and the duplicate selector.

Run `./c docs` after adding a feature or an i18n key. `static/contract`
fails on a stale `contract.toml` and says so.

Every `.md` file, comment and commit body goes through the docs-style
checker in `~/.claude/skills/synced/*/docs-style/scripts/check_docs.py`.
It counts a sentence across a whole bullet. It reports the finding
against the block's first line, not the sentence's.

## Three gates that did not exist before that day

`output/contrast` reads every run of text on every page. Both themes,
and it divides. Colours are resolved through a canvas, because nothing else
resolves `oklab()` and `color-mix()`. It found a code palette at 1.38 to
1 that `output/a11y` and `output/perf` had both passed.

`output/prose` asks two questions of every page. Did a rule the theme
wrote match this element, named for it. Does anything reach past the
line the text keeps.

`release/showcase` asks whether each feature that ships on is drawn
somewhere in the built demo. Six cannot be, and each is exempt with its
reason written beside it.

## The lesson under all of it

Not one bug found that day was a mistake in the code as written. Each
was a case no fixture had. No table, no SVG, no site stylesheet, no
picture wider than the column, no external menu entry, no `editBase`.

Every gate read a site set up the way the theme wanted. A requirement
that is always met can never fail. When something is reported from
outside, ask first which fixture was missing.

## What the conformance gate will not let you do

`output/conform` builds the theme with every feature off. It requires
the same file list and page shape as Hugo's own scaffold. That rule has
quietly vetoed things a reviewer would ask for.

The ways through it, in order of preference:

- Chrome is excluded. `nav`, `header`, `footer` and `aside` are not
  compared. That is why the skip link sits inside the aside.
- A feature manifest may declare what it adds. `text`, `links`,
  `images`, `headings` for elements, `files` for what it publishes,
  `removes` for what it stops publishing.
- A name may be excluded from the comparison, with its reason written
  where the exclusion is. `404.html` is the only one.

## Things that will trip you

The example site's `resources/_gen` is ignored now. It is written only
by a development server, never by a gate. `demo.sh` copies the site to a
work directory excluding resources. `example.sh` renders to memory.

A development server may be running on port 1313, serving `exampleSite`
through a symlink in the session scratchpad. It live-reloads the theme
sources. Do not edit a template without checking the build. A parse
error takes the whole site down while somebody is looking at it.

`{{ else if }}` inside a `with` is rejected by Hugo's parser. Use a
nested `if`.

`overflow` does not clip a `math` element. A block formula needs a real
block box around it, which is what `.mathblock` is.

An empty `CSSRuleList` is an object, so it is truthy. Since CSS nesting
shipped, every style rule has one.
