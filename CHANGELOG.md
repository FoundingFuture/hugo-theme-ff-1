# Changelog

## Unreleased

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
