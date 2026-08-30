# Working notes

Things that cost time here, and how the work is actually verified.

## Traps

**`./c package` detaches the running server.** It recreates
`dist/<slug>`, so `hugo server --themesDir ../dist` keeps serving the
old build with no warning. Restart it after packaging. Two "fixed"
screenshots were stale before this was understood.

**`timeout` is not on macOS.** Two builds reported success having run
nothing at all.

**`css.Build` resolves `url()`.** Fonts must be assets, not `static/`,
and a stylesheet in `components/` reaches them at `../../fonts`, not
`../fonts`. esbuild emits each face content-hashed beside the bundle.

**Specificity beats media queries.** `body>main` (0-0-2) silently
overrode every `main` (0-0-1) rule in the narrow blocks, so the entire
narrow layout never applied at any width. Keep the wide placement at the
same weight the narrow ones use.

**`display:contents` promotes every child to a grid item.** Below 60rem
`.side` is `display:contents`, so its children become grid items of
`body` directly. Anything added to `baseof.html` at the top level needs
a `grid-column` in **both** narrow blocks; a child without one
auto-places into the wordmark's narrow column and reads as a styling
fault rather than a placement one. `main` spans both columns, and a
spanning item hands part of its max-content to every track it covers,
so the wordmark's column is `minmax(0,13rem)` and must never be `auto`.

**The words gate ends a template comment at the first inner `}}`.** Put
prose *above* any `@example` line or it is read as markup.

**A visible string in markup fails `static/i18n`.** Marks are drawn from
CSS instead: the heading anchor's `#`, the trail's separator, the
gallery's close. That also keeps a screen reader from reading them.

**Packaging detaches the watcher, and it will invalidate a test.**
`./c package` does `rm -rf dist/<slug>`, so a server started with
`--themesDir ../dist` loses the directory it is watching and serves the
old copy in silence. This is worse than a stale screenshot: a
before-and-after comparison run across a repack compares a build with
itself and reports no differences, which reads as proof. **Put a sanity
check in any such comparison that must show a difference**, and stop if
it does not.

**The dev loop that avoids all of it.** Point `--themesDir` at a
directory holding a symlink to the repository, and the server reads the
sources. No repack, no restart, and `./c package` cannot pull the ground
out from under it:

```sh
mkdir -p /tmp/devthemes && ln -s "$PWD" /tmp/devthemes/ff-1
cd exampleSite && hugo server --themesDir /tmp/devthemes --port 1313 --noBuildLock
```

**A new feature needs a server restart.** Adding
`data/<slug>/features/<name>.toml` and its stylesheet while the server
runs gets the markup but not the CSS: `head/css.html` assembles the
bundle through `partialCached`, and the resource cache holds the version
built before the file existed. The feature looks broken and is not.

**--band-seen is a ceiling, and it has been wrong every time something
moved.** It is read by `html{scroll-padding-top}` and by the contents
column's `top`, and it has to cover the band's tallest rendering.

It has been wrong three times, each for a different reason. Reserving
room for the theme switch made the brand cell taller, which stretched the
band from 70.4px to 79.6 while the offset still covered 70.4. The
language row was added and three new values were written without
measuring any of them, over-covering by 15 to 31px. Then giving the
language codes a fixed width made the row taller and the number was 6.8px
short again.

The band no longer takes height from the brand cell: `.strip` is
`align-self:start` between 34 and 60rem, and `body::before` spans both
rows to paint what the band stops painting. What remains is the band's
own content, which still grows with the window because the tagline is
sized to fill it.

**So measure, do not reason.** Sweep 320 to 2600 in 20px steps, take the
tallest band, round up. Anything that changes what the band holds needs
the sweep run again: the tagline's size, the language row's size, the
band's padding. A site with no language row keeps `--band`.

**The tagline was drawing across two thirds of the band.** Its size is
`min(cap, Ncqw / var(--len))`, where `--len` is the character count from
the template, because CSS cannot measure text. N was 140, which left a
third of the band's width empty at every width and rendered the line at
8px on a 545px screen. Measured across 545 to 2400, 195 fills 91 percent
and clips nowhere. If the face or the cap changes, re-measure N the same
way: draw the line, compare its width against the band's inner width.

**A feature that restyles shared chrome restyles it for everyone.** The
language switch first set flex-direction on .strip itself. A site with
one language renders no language row, and its band grew anyway, and the
anchor offset then covered less than the band. Scope such a rule to the
thing it adds, with :has, rather than to the container it adds it to.

**A zero-weight Lighthouse audit cannot fail the gate.** `output/perf`
asserts `categories.accessibility >= 1`, and Lighthouse scores a category
as a weighted mean. `label-content-name-mismatch` carries weight 0, so
the theme shipped a real WCAG 2.5.3 failure at a category score of
1.0000: the language links read NL and announced "Nederlands", which
share no letters, leaving speech control nothing to say. It surfaced only
because a second audit with real weight failed beside it. Reading the
category score does not tell you the audits passed. Open
`tools/.lighthouseci/lhr-*.json` and list every audit under
`categories.accessibility.auditRefs` scoring below 1.

**WCAG 2.2 target size is a spacing rule as much as a size one.** A small
target passes when no other target's 24px circle reaches it. The language
codes are about 14 by 13, and widening the gap alone did not fix them:
the codes are not all the same width, so IT beside PT sat 21.9 apart at a
gap holding EN and FR 24.2 apart. Giving every code one cell width makes
the spacing the same wherever the row is read. Check the worst pair by
centre distance across both axes, with the row wrapped, not the size of
one target.

**Two boxes cannot be made to move as one from outside.** transform,
clip-path and opacity are per-element and compose per-element. There is
no way to say "animate these together". You get one box, or a set of
boxes running the same declaration.

The rail was built without a box for the thing that moves. The aside
held the slab, the edge and the menu as three siblings. Nothing said the
slab and the menu are one thing. So they were animated apart. The slab
was uncovered by a travelling clip, the menu slid by a transform. Those
are two kinds of motion rather than two timings. Matching their
durations never made them arrive together. One of them has a left edge
that never moves.

Four symptoms came out of that one gap, over four rounds. The marks
flickered, because hiding them on hover took away the thing being
hovered. The menu began a third of the way down, because the marks were
holding flow space it needed. The marks' ground stopped short, because
the menu still claimed free space it could not use. The menu vanished
rather than leaving. Its height snapped to nothing, and that is not a
change any browser can animate. Each was fixed where it appeared. Each
fix made the next one worse.

**A transform moves what is painted, not what is laid out.** That fact
dissolves all of it. A translated grid item still occupies its grid
area, and still sizes it. So the slab slides off the screen and goes on
setting the height of its row. The edge's black top sits in that same
row. It is therefore exactly as tall as the slab, whatever the wordmark
does. Nothing needs a wrapper, a measured height, or a trip out of flow.

The rule to keep. When a second symptom of the same shape appears, ask
what structure would make all of them impossible. Do not fix the third.

## Verifying visually

Nothing in the pipeline looks at the rail, the frame or the footer:
they are chrome, which conform excludes. Two real faults were found only
by eye. Compare against the original's own screenshots in
`../theme-hugo-ff1/exampleSite/content/screenshots/` — `front.png`,
`depth.png`, `narrow.png`.

```sh
./c package
cd exampleSite && hugo server --themesDir ../dist --port 1313 --noBuildLock
npx --yes playwright@1.49.1 screenshot --viewport-size="1200,800" \
  --wait-for-timeout=2000 http://localhost:1313/topic-one/ /tmp/shot.png
```

For layout questions, drive Playwright as a module and read computed
styles and bounding boxes rather than guessing. That is how the narrow
layout was diagnosed.

## Outstanding

- Every tool now runs locally after `./c setup` and `./c setup full`,
  and `./c check` is **30 passed, 0 failed, 0 skipped**. What they found
  the first time they ran is in `linters-and-browser-support.md`.
- **`output/visual` has no baseline** until a release writes one.
- **The tail gradient** is undecided. See `theme-decisions.md`.
- The narrow layout has been rendered once, at 430px, and matches the
  original. Nothing between 34rem and 60rem has been looked at.
