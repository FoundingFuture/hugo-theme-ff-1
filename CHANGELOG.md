# Changelog

## Unreleased

Documentation. Nothing in the theme changed.

- The README says what a page bundle does to an image.
  `responsive-images` serves a raster from the copies it makes, and
  v0.2.8 stopped the theme publishing the source beside them. That only
  reaches an image in `assets/`. Hugo publishes a page resource whether
  or not a template reads it, and no theme can turn that off. An image
  sitting next to the post that uses it still ships twice. The README
  names the cascade a site writes to stop it, and says the feature
  works without it.

## v0.2.9, 2026-08-31

An external address works the same wherever a site puts one. Two things
a reader sees were also wrong, and one of them since v0.1.0.

- A block formula stays inside the column. `overflow` does not clip a
  math element. A formula wider than the reading line painted straight
  through the cap on it. It ran over whatever stood to the right. The
  element was the right width and its contents were not inside it.
  A block formula now sits in a div, which is an ordinary block box and
  does both. MathML is what a site gets unless it asks for KaTeX, so
  this was the common case.
- The line between the menu and the words runs the length of the page.
  It was a border on the menu. The menu is sticky and at most a screen
  tall. On a long page the line gave up a third of the way down. It
  is painted by the body now, which is as tall as the page.
  The body already drew that column's background for the same reason.
- One definition decides what leaving the site means. It was written
  three times in one afternoon. Once for a link in a paragraph. Once for a
  menu entry naming another host. Once for the link to a page's source. Three copies of one rule is one rule that drifts. A reader
  cannot tell which copy wrote the link in front of them.
  `link.html` decides it once. A link in the text, a menu entry, a
  footer entry, an `items` row and the edit link all arrive there.
- The foot of the page carries a menu. There was nowhere in the theme
  to put a licence, a colophon or a link to the source. A site wanting
  one overrode the footer and lost the theme's. `[[menus.footer]]`
  is read the way every Hugo menu is.
- `edit-link` renders. Its fixture page switched the feature on and no
  `editBase` was ever set. The partial found nothing to link and drew
  nothing. Every check passed: they ask whether the fixture page exists,
  not whether the feature drew anything.
- The contents rail marks a hover differently from the reading. Hovering
  changed the colour of a word and nothing else. That reads as a link
  dimming rather than a row answering. It takes the amber in light and the
  indigo in dark. Where a reader is and where they are pointing are two
  colours rather than two strengths of one.
- The contents label takes the inset its links take, rather than
  standing against the edge of the column.

## v0.2.8, 2026-08-31

Five things every theme of this kind ships and this one did not. Found
by reading Hugo's documentation and three themes that do ship them.
Not by waiting for somebody to trip over the absence.

- A site has a page for a wrong address. Hugo writes `404.html` only
  where a template exists, and none did. A reader who mistyped got
  whatever the host had lying about.
- A feed can be found. The theme published `index.xml` and pointed at
  it from nowhere, so no browser and no reader could discover it. The
  line is `.AlternativeOutputFormats`, which Congo, PaperMod and
  hugo-book all write.
- A translation is declared to a search engine. The switcher marked its
  own links with `hreflang`, which tells a reader's browser what it is
  about to open. Nothing said that two pages are one page in two
  languages.
- A reader on a keyboard can get past the menu. Every page opens with
  the whole topic tree. WCAG 2.4.1 asks for a way past a block that
  repeats. A landmark satisfies an automated check, which is why no gate
  here ever said so.
- An SVG says how tall it is beside how wide. It carries its size in
  its own markup, in `width` and `height` or in the `viewBox`. A page
  that reads neither moves under the reader when the file lands.
- A source image is no longer published beside the variants made from
  it. Its address was read before the theme knew whether it could
  process the file. Reading an address is what publishes a file, so
  every original shipped unread. The address is now read on the one
  path that serves it, which is the fallback an SVG takes.
- `removes` is honoured for files. A manifest could already say which
  elements a feature takes off a page. The file comparison never
  consulted it, so a feature replacing a file could not say so.
  responsive-images replaces a source with its variants, and now
  declares that.
- `404.html` is left out of the two comparisons against Hugo's
  scaffold. The scaffold ships no such template and a theme that gives
  a site the page cannot match it. No switch can change that, because
  the template existing is what makes Hugo write the file.

## v0.2.7, 2026-08-30

v0.2.5 broke the build for any page with an SVG in it. This fixes that,
and a second fault from the same rewrite.

- An SVG no longer ends the build. responsive-images meant to skip a
  picture the pipeline cannot open, and its guard compared the media
  subtype against `svg+xml`. That is the spelling inside
  `image/svg+xml`. Hugo reports the subtype as `svg`, so the guard
  never matched, every SVG took the raster path, and the first call to
  `.Width` stopped the build. Repro is one line:
  `![alt](file.svg "caption")`.
  The guard is now `reflect.IsImageResourceProcessable`, which Hugo's
  own error names. It answers the question that matters rather than the
  one about file types. A GIF is processable and still passed through,
  because it may be an animation.
- A captioned picture no longer repeats its caption as a tooltip.
  v0.2.5 built one `img` for both branches. So a caption arrived as a
  `figcaption` and as a `title` on the image inside it. The same words
  landed in the accessible name and in a tooltip. v0.2.4 wrote the two
  branches separately and did not have this.
- The fixture carries an SVG, captioned and not. None ever did. The
  theme draws SVG in its own templates for icons and never met one in a
  piece of content. So nothing here could fail on it. The demo shows one
  too, on the page that already said an SVG is passed through.
- A title wraps when it will not fit, and not before. It was held to
  22ch, which is 648px in this face and no relation to anything else on
  the page. A title needing 689px broke after one word and left the
  last alone on a second line. `ch` is the width of a zero, 29.4px
  here, while those letters average 36.7px, so the number never meant
  22 characters either.
  A title now takes the measure, the line the paragraphs keep. It ends
  where the text ends. `text-wrap:balance` evens the lines when it does
  wrap. The measure moved to `main`: the head is the body part's
  sibling, and could not reach a value declared below it.
- The example site's processed images are no longer tracked. Nothing
  needed them. Every gate builds in a work directory or renders to
  memory. None writes there, and none reads what is there. They came
  from a development server, and the two other sites here already have
  their `_gen` ignored.

## v0.2.6, 2026-08-30

The demo is the site people look at before they install anything. It
had generic topics and nothing else. Whether a feature appeared at all
depended on whether some page happened to use one.

- The demo has a page per feature, named for it. Each says what the
  feature is for and whether it ships on. Each says how a site or a
  page turns it off. Each names the stylesheet that draws it.
  The pages are generated from the theme's own manifests rather than a
  list kept beside them. So a feature cannot arrive without its page.
  The features gate already applies that rule to a manifest, a partial,
  a stylesheet, its words and a fixture page.
- Every manifest carries a `summary`, and `features.py` requires it. A
  feature with nothing to say about itself gets an empty page. Nobody
  notices that until a reader arrives.
- Which markup a formula is rendered to can be set by a page. It was
  read from `site.Params` in two templates and nowhere else. So a site
  was MathML or KaTeX markup from end to end. A demo showing both could
  not be built. Neither could one page that needed the other mode.
  Every other switch here resolves site first and page second. This one
  now does too, through `math-output.html`. Two templates reading one
  setting is a setting that drifts.
- The demo takes Hugo's default, MathML, which needs no stylesheet and
  no script. One page asks for KaTeX markup in its own front matter. So
  both paths are exercised by the demo, and each page shows what it
  says it shows.
- New section, `elements`. A table, a heading, a list and a rule are
  not features. They are what a page is made of. They have pages of
  their own now, showing what the theme draws and how to change it.
- New gate, `release/showcase`. A feature declares the elements it puts
  on a page. So the question has a checkable answer: does the built
  demo contain one. It found two features on by default and drawn
  nowhere.
  Six cannot be drawn by a site sitting still. Each is exempt with its
  reason written beside it.

## v0.2.5, 2026-08-30

What a browser draws by default is valid, structured and legible. It is
not this theme. Four things had been left to it, and one of them since
v0.1.0.

- A table is drawn. The theme styled `pre`, `blockquote` and `dl` and
  never `table`, so a table arrived with the browser's defaults: no
  rules, no padding, cells touching. A header row over a heavier rule,
  a line between rows, figures set in tabular numerals, and the first
  column on the text's own left edge. A table wider than the line the
  text keeps scrolls inside it. That is the answer `pre` and a display
  formula already use. A column that declares its alignment in Markdown
  keeps it.
- Headings four, five and six are drawn. They fell to the browser at
  15.5px, 12.9px and 10.4px against a 15.5px body. Five and six came out
  smaller than the paragraphs they head. They take the display face now,
  and none goes under the body size.
- Lists, rules, footnotes and a `details` block are drawn. So are the
  markers of a task list.
- A formula is held to the line the text keeps, in MathML as well.
  A formula arrives wrapped in a span. `max-width` does not apply to an
  inline box, so the measure on it was inert. The formula filled the
  body's content box instead, 964px against a 765px paragraph. A short
  one then centred itself out to the right of the words. v0.2.3 fixed
  this for KaTeX markup and MathML kept the fault, which is what makes
  it look like a regression. MathML is what a site gets unless it asks
  for KaTeX, so this was the common case.
- New gate, `output/prose`. It asks two questions of every page. Did a
  rule the theme wrote match this element, named for it. Does anything
  reach past the line the text keeps. Neither question is taste. Both
  are facts. Every gate before this one passed a bare table in silence.
  It found two faults in itself before it found any in the theme. It
  also found one in a feature written the same hour. A `picture` is an
  inline element, so its cap was inert. It reached 99px past the text,
  which is the same trap as the formula, in new code.
- New feature, `responsive-images`, on by default. A picture is resized
  to the widths the reading measure asks for. Each width is encoded as
  AVIF and WebP, with the source as the fallback. The `img` carries the
  source's width and height, so the page stops moving as pictures land.
  Only the first picture on a page loads eagerly. An SVG carries no
  pixels to resize and a GIF may be an animation, so both are passed
  through.
  The bare hook still renders what Hugo's own image hook renders, which
  is what `output/conform` compares against. The feature is what
  declares the difference.
- A link that leaves the site opens beside the page rather than over it,
  and says so. `external-new-tab` is on by default. A site turns it off
  with `params.ff-1.features.external-new-tab = false`, and a page can
  override it in its own front matter.
  The words are appended inside the anchor rather than set as an
  `aria-label`. A label replaces the accessible name, and the link's own
  words would go with it. v0.1.1 shipped that fault in the language
  switcher, where `Nederlands` announced over a link reading `NL` left
  speech control nothing to say.
- The page skeleton counts a classed element's text once. It was
  recorded twice. Once under `marked`, against the class that put it
  there, and again inside the text of any link holding it. A link
  carrying an annotation therefore read as a different link. So a
  feature annotating a link without adding one looked like a feature
  adding links it never declared. The gate still fails on a link that is
  genuinely added, which is what it is for.

## v0.2.4, 2026-08-30

A site could not restyle this theme. The README said it could, and had
said so since the theme shipped.

- A site's own stylesheet is loaded. Write `assets/css/custom.css` and
  it is bundled last, after the theme's sheets and every feature's, so
  setting a property again changes it. Nothing needs enabling and the
  theme ships no such file.
  The README had described this since v0.1.0. Nothing implemented it,
  and the section under `Changing what it looks like` documented a
  route that did not exist. The README also never named the file, so
  even the idea was unreachable.
- `release/downstream` writes a site stylesheet and reads the bundle
  the site publishes. It checks that the sheet is there. It checks that
  the sheet comes after the theme's, because one loaded first can
  override nothing. The gate built a site from the README and never
  restyled it. So the claim a reader acts on first was the one claim it
  did not exercise.
- The font terms are published with the site. Six faces are served and
  `assets/fonts/OFL.txt` stayed in `assets/`, where nothing copies it.
  A built site now publishes the licence and the per-face notice at
  `/fonts/`. Every face carries its copyright inside its own name
  table, which the licence allows. A name table is not a thing a reader
  can open.

## v0.2.3, 2026-08-30

Code was unreadable in light mode through three releases. Two gates
read those pages on every run and both passed them. This release is
mostly about what a gate that asks a tool cannot see.

- The code colours are scoped to dark mode. Every token colour in
  `dark-mode.css` was written without its `[data-theme="dark"]` prefix,
  so the dark palette painted code in light mode as well. Identifiers
  sat at 1.38 to 1 on a pale ground, where AA asks 4.5.
- New gate, `output/contrast`. It walks every run of text on every page
  in both themes, resolves the colours through a canvas, and divides.
  6248 readings over 84 pages, in three seconds. The canvas is the
  point: `getComputedStyle` hands back `oklab()` and `color-mix()`
  untouched, and only a paint resolves them.
  `output/a11y` and `output/perf` both run axe, and axe returns
  `incomplete` rather than `violation` for a contrast check it cannot
  fully resolve. With the fault above put back, pa11y-ci reports 0
  errors on the page carrying it.
- The open topic in the menu carries dark ink in dark mode. The four
  topic colours are lifted off the page there. That is what lets them
  read as text, and what stops them carrying white: 2.20 to 2.61 across
  the four, against AA's 4.5. On `--paper` the same four read 6.91 to
  8.20. The new gate found this on its first run.
- Mathematics is set at 1.2 times the text rather than 1.4, and a
  display formula no longer compounds that to 1.96. A formula wider
  than the reading measure now scrolls inside it. It was centring on
  the page and running past the line the text keeps to.
- There is no fade behind the words of a piece. The fade at the end of
  one stays, because that one is the ending. The other was a grey wash
  under everything, most visible on a short section.
- A section that only groups shows its count where every other row
  shows it. Two `margin-left:auto` on one flex line share the free
  space between them rather than one taking it. The number stopped 70px
  short. Such a section is also set two thirds of the way from the
  caption colour to the body's. It was set at the caption colour. Where
  no section carries an introduction, that drew the whole menu in it.
  A menu drawn in the quiet colour reads as a menu switched off.
- exampleSite carries a page of formulas and code, and a section whose
  own page has no prose. The theme draws such a section differently,
  and no fixture had ever had one.
- Lighthouse reads the code page and the formula page. A page that
  renders mathematics is given twice the budget of one that does not.

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
