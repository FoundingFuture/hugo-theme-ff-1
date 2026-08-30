# Changelog

## v0.2.2, 2026-08-30

Two things the theme needs a site to declare. It never told anyone to
declare them. And a gate that reads the theme the way a stranger does.

- `katex` needs `[markup.goldmark.extensions.passthrough]`. Without it,
  Goldmark reads the backslash before a bracket as an escape and eats
  it. A formula written as `\(E = mc^2\)` reached the page as
  `(E = mc^2)`. A `$$...$$` block arrived as literal text. The build
  succeeded and said nothing. The formula was not missing. It was
  quietly wrong.
- The code colours need `noClasses = false` under `[markup.highlight]`.
  Without it, Chroma writes its own palette into the markup as inline
  styles. The theme's code colours then have nothing to colour. One of
  Chroma's defaults fails AA contrast, and dark mode cannot remap any
  of it.
- Both are now in the README, beside `figure-captions`. That feature
  has the same requirement and was the only one documented. Both are
  set in `exampleSite`, which also carries a page of formulas and code.
  The demo shows them working rather than claiming it.
- New gate, `release/downstream`. It does not read a site in this
  repository. It writes one from the configuration blocks the README
  publishes. Then it adds content that exercises them, builds against
  the artefact, and reads the result.

Every site the gates read was set up the way the theme wants. So
anything the theme needed a site to declare was already declared, and
could not fail. That is why none of this was caught here. It was caught
by somebody building a site.

## v0.2.1, 2026-08-30

- The demo is the example site, built against the packaged theme. It
  was the conformance fixture. That fixture is a thing the gates
  measure, not a site. It is titled Conformance. Its front page is a checklist
  of one page per feature. Its tagline is there to make the band grow so
  a gate can read it. All of that was the site the theme showed itself
  with. The tagline went up on it reading `A fixture line long enough
  to make the band grow`.
- The demo is built from `dist/<slug>` rather than from the sources.
  That is the one path a downloader takes. A demo built from the sources
  can pass while the artefact people download is broken.
- `demosite` points at the demo. It named the template repository this
  one was made from, which is a different site about a different thing.

## v0.2.0, 2026-08-30

The menu holds its width and the page is laid over it. The line across
the top is set to the room it has. The geometry both of those depend on
is measured by a gate rather than remembered.

- The menu keeps its 16rem at every width. Where the window has no room
  for both it and the words, the column shows less of it. The page
  covers the rest. Bring the pointer to what is left and the whole menu
  comes back over the page. Past the point where a fifth of it is all
  that shows, the column becomes an edge. The edge carries the menu's
  own marks.
  The menu then slides in from the left. The reading line stays inside
  its measure at every width, either way.
- The edge is the desktop's last state. A window has a floor it cannot
  be dragged below, and that floor is above what the edge needs. So the
  top bar dropdown is now the touch layout rather than the narrow one.
  The two are separate rules, each chosen for what it serves.
- The line across the top is set to the width it has. It was drawn at
  two thirds of that at every size, which rendered it at 8px on a 545px
  screen. Calibrated by rendering rather than by arithmetic, over 115
  widths and two lengths of line.
- The languages read `Languages` in small capitals rather than naming
  themselves in full. The row is set small and tucked under the line.
  The band's tallest is 4.8rem, and the offset that clears it is that
  same number.
- The theme switch sits beside the established line instead of over the
  corner of the slab. The reserve it needed under the last line is gone.
  With it goes the tallest link in the chain that set the band's height.
- A language link announces the code it shows. Naming it `Nederlands`
  over a link reading `NL` left speech control nothing to say. The two
  share no letters. This shipped in v0.1.1. The audit that catches it
  carries no weight in the score the gate reads, so the gate never saw
  it.
- New gate, `output/band`. It measures the band at 115 widths. It fails
  when the anchor offset does not clear the band, or clears it by more
  than 40px. That number has been wrong three times, each time found by
  hand and late. The gate runs in three seconds.
- `./c release` runs the gates before refreshing the snapshots. It then
  runs the static gate again, over what the refresh wrote. Refreshing
  first meant `output/visual` compared a build against a baseline made
  from that same build. That was the run where it matters most.

## v0.1.1, 2026-08-29

- `items` resolves the address in a row's fourth field instead of
  printing it as written. A site served from a subdirectory, which every
  GitHub project page is, had those rows linking to nothing: a path
  written `/topic/` is `/prefix/topic/` there, and Hugo does not rewrite
  a path a person typed. An address that names a host is untouched.

## v0.1.0, 2026-08-29

The theme itself. What came before was the scaffold Hugo generates and
the pipeline that measures it.

- The frame: a colour-coded topic tree of any depth, small capitals for
  what opens, six self-hosted faces, and a reading column built for a
  lot of text on one page.
- Navigation from either source. A site that defines `menus.main` gets
  that menu, walked to whatever depth its parent keys describe. A site
  that defines none gets its own folders, with nothing to configure.
- Twenty-two features, fourteen of them on. The trail, the date, the
  contents, the pager, what sits near a piece, the topics underneath,
  what lies further down, a label for a title that cannot say what a
  piece is, narrowing by tag, sources, heading anchors and captions.
- Search whose index is the page, ranked by where a word appears.
- Embeds that fetch a poster while the site builds and reach no other
  host until a reader presses play, across YouTube, Vimeo and
  SoundCloud.
- Five shortcodes for a piece: `lead`, `pull`, `columns`, `items` and
  `gallery`.
- Mathematics, rendered while the site builds. A formula becomes
  MathML, which every current browser draws with no stylesheet and no
  script. A site wanting KaTeX markup instead sets
  `params.ff-1.katex.output`, and only then is the KaTeX stylesheet
  linked, and only on a page carrying a formula.
- Everything under one namespace, `ff-1`, in both `data` and `params`,
  so a site's own keys cannot collide with the theme's.
- A search box at the head of the menu, on every page. It finds the
  search page by its layout, so the theme never writes the URL down, and
  it is a plain form: the page it reaches reads the query from the URL,
  so nothing here needs a script.
- A dark theme, chosen by a sun and a moon in the corner of the brand
  cell and remembered in the browser. It is applied before the first
  paint, so a reader who chose it never sees a white page turn over.
  With nothing chosen the page follows the system setting. The palette
  is the theme's own custom properties given other values, so a site
  that has restyled the theme gets its own dark mode from the same
  overrides.
- An article ends by fading out, over its last 300px, whatever its
  length.
- Every colour the theme sets meets WCAG AA on every ground it lands
  on, checked rather than assumed.
