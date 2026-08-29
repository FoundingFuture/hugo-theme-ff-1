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

- **stylelint, eslint, pa11y, Lighthouse and html5validator have never
  run here.** CI meets them first, over roughly a thousand lines of CSS.
- **`output/visual` has no baseline** until a release writes one.
- **The tail gradient** is undecided. See `theme-decisions.md`.
- The narrow layout has been rendered once, at 430px, and matches the
  original. Nothing between 34rem and 60rem has been looked at.
