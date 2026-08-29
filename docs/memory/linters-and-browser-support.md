# The linters, and what they are allowed to decide

The five linting gates ran for the first time on 2026-08-29. Until then
CI stopped at `static/shellcheck`, which had been red since the tools
were taken from the template, so nothing behind it had ever run. What
follows is what they found and, where a rule was aimed rather than
obeyed, why.

## The rules that are pointed somewhere else

`tools/stylelint.config.mjs` overrides three rules. Each is aimed, not
switched off, so it still fires on anything but the case named.

**`property-no-vendor-prefix`** ignores `text-size-adjust`. Safari
implements only `-webkit-text-size-adjust`. The rule assumes an
autoprefixer step and there is none here, so unprefixing the property
means the declaration does nothing on Safari. The option needs the
**regex** form, `"/text-size-adjust/"`: the documented plain string does
not match on stylelint 17.14.1.

**`media-feature-range-notation`** is set to `"prefix"`. `--fix` had
rewritten both breakpoints to `(width <= 60rem)`, which needs Safari
16.4, Firefox 102 and Chrome 104. Below those the block does not parse
and the **entire narrow layout stops applying**. Setting the rule to
`prefix` keeps one spelling enforced; it just enforces the one that
works.

**`no-descending-specificity`** was already off before any of this.

`tools/eslint.config.mjs` names its browser globals by hand, so
`no-undef` still means something. `URLSearchParams`, `location`,
`history` and `localStorage` are declared because the scripts genuinely
use them.

## The house style bent, once

`declaration-block-single-line-max-declarations` fired 118 times against
the theme's dense one-line rules. The rules were **expanded** rather than
the check disabled, so `assets/css` is now one declaration per line. A
trailing comment stays on the line it annotates: moved to its own line it
reads as a heading for the next property, which is the opposite of what
it says.

## pa11y and Lighthouse disagree, and Lighthouse was right

`output/a11y` passed all 80 pages while `output/perf` failed four on
accessibility. Both run axe. The difference is that axe returns
*incomplete — needs review* for a contrast check it cannot fully
resolve, and pa11y reports only violations. Lighthouse computes the
ratio and fails it.

`--muted` was `#78868F`: 3.75 on white, 3.01 on `--sunk`, 3.24 on
`--paper`, against AA's 4.5 for normal text, at `.7rem` across 33
declarations. It is now `#5A6874` — 5.73 / 4.60 / 4.96.

**When the two disagree, check the arithmetic rather than the tools.**

## Two elements no template can reach

`tools/scripts/check/pa11yci.json` hides exactly two selectors, never a
rule: Goldmark's unlabelled disabled checkbox for a task list, and the
stretchy operator KaTeX renders for an integral, whose scaled glyph axe
cannot measure. Anything else unlabelled or genuinely faint still fails.

## What a theme cannot set

Hugo merges maps from a theme but **not `markup`**. `figure-captions`
renders a standalone Markdown image as a `<figure>`, Goldmark wraps such
an image in a `<p>`, and a figure inside a paragraph closes it — leaving
a stray `</p>` that html5validator fails. The fix is
`wrapStandAloneImageWithinParagraph = false`, and it works only from the
**site's** config. Tested both ways. It is documented in the README, in
`hugo.toml`, and set in `exampleSite/hugo.toml` and the fixture.

This is the same wall that stops a theme adding an `[outputs]` format or
a `menus` entry.
