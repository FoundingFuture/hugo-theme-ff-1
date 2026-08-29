# Changelog

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
