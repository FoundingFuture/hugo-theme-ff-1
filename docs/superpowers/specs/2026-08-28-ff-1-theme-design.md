# ff-1, a Hugo theme

Design, 2026-08-28.

## What this is

`hugo-theme-ff-1` holds a bare Hugo 0.165.0 scaffold and a large
verification pipeline generated from `hugo-theme-template`. This design
turns it into **ff-1**, the second generation of the theme published from
`theme-hugo-ff1` as "FoundingFuture I".

The relationship is evolution, not translation. `theme-hugo-ff1` supplies
the identity: a colour-coded topic tree of arbitrary depth, small caps for
what opens, six self-hosted faces, and a reading layer built for a lot of
text. The scaffold supplies the architecture: every optional element is a
manifest-declared feature in a slot, and every change is measured against
Hugo's own scaffold output.

Where the two disagree, the identity decides what the theme looks like and
the architecture decides how it is built.

## Terminology

- **`theme-hugo-ff1`** — the existing repository, the source being evolved
  from. Publishes as "FoundingFuture I", installs as `foundingfuture-i`.
- **ff-1** — the theme built here, in `hugo-theme-ff-1`.

## Identity

| Key | Value |
|---|---|
| `theme.toml` `name` | `ff-1` |
| `theme.toml` `homepage` | `https://foundingfuture.com/software/ff-1/` |
| slug (derived from `homepage`) | `ff-1` |
| a site writes | `theme = "ff-1"` |
| installs into | `themes/ff-1/` |
| module path | `github.com/FoundingFuture/hugo-theme-ff-1`, unchanged |

`tools/scripts/slug.sh` derives the slug from the **last path segment of
`homepage`**, not from `name`. Pointing `homepage` at the product page is
therefore what makes a site write `theme = "ff-1"` rather than the
repository name. `theme-hugo-ff1` did the same thing, which is how it came
to install as `foundingfuture-i`.

`theme-hugo-ff1` is **removed altogether** once ff-1 ships. It is not
maintained in parallel and no site stays on `foundingfuture-i`. The one
site running it, foundingfuture.com, moves to ff-1, and carries no real
content yet.

Nothing therefore needs a migration path, a compatibility shim or a
deprecation cycle. This is what makes the breaking decisions below free:
namespacing every parameter, dropping `params.extraNav`, and letting a
defined menu replace the section tree all cost nothing, because there is
no installed base to carry.

## Compliance

ff-1 is submitted to themes.gohugo.io, so it meets that directory's rules.
`theme.toml`'s mandatory set — `name`, `license`, `licenselink`,
`description`, `homepage`, `tags`, `features`, `min_version` — is already
enforced by `tools/scripts/check/metadata.py`, structurally from the first
commit and completely at release. `images/screenshot.png` at 1500x1000 and
`images/tn.png` at 900x600 are enforced there too, and match what
`theme-hugo-ff1` ships.

The gap is `exampleSite/`, which this pipeline does not mention anywhere.
See "The example site" below.

## Architecture

### Layout translation

`theme-hugo-ff1` uses Hugo's pre-0.146 layout convention. ff-1 uses
0.165's, which the scaffold already follows.

| `theme-hugo-ff1` | ff-1 |
|---|---|
| `_default/baseof.html` | `baseof.html` |
| `index.html` | `home.html` |
| `_default/single.html` | `page.html` |
| `_default/list.html` | `section.html` |
| `_default/terms.html`, `_default/term.html` | `taxonomy.html`, `term.html` |
| `_default/_markup/*` | `_markup/*` |
| `partials/*` | `_partials/*` |
| `shortcodes/*` | `_shortcodes/*` |

Three partials dissolve into the feature system rather than moving:
`crumb.html` becomes the `breadcrumbs` feature, `toc.html` the `toc`
feature, and `index-rows.html` is shared by the new `further-down` and
`kind-label` features.

`_partials/menu.html` is deleted and its recursive walk is absorbed into
`topictree.html`. See "Navigation" below.

### One change to the scaffold's machinery

`slot.html` resolves a feature's state inline: manifest `default`, then
`site.Params.features`, then `page.Params.features`, with
`site.Params.featuresoff` outranking all three for the conformance
reference build.

Two ff-1 features render from markup hooks rather than slots, and a hook
cannot reach that logic. So the resolution moves into
`_partials/feature-on.html`, returning a bool. `slot.html` calls it in its
loop; `render-heading.html` and `render-image.html` call it directly.

This is safe because `tools/conformance/scripts/features.py` reads every
manifest's `[skeleton]` table **regardless of `slot`**. The `slot` field is
consumed only by `slot.html`, so a hook-driven feature is a legal citizen
of the system as long as it declares what it adds.

### Navigation

The menu is the feature the theme exists for, and it is built on Hugo's
own semantics rather than beside them.

**One recursive walker, two sources.** `rail.html` chooses the source and
`topictree.html` renders a node, source-agnostic:

```
site.Menus.main defined?  -> walk it recursively, full Hugo semantics
                    else  -> walk site.Home.Sections recursively
```

A defined menu **replaces** the derived tree rather than being appended
below it, because defining a menu is a site saying what its menu is.
`params.extraNav` is dropped: Hugo menu entries already do exactly what it
did, and a non-section page joins the menu with `[[menus.main]]` or with
`menus: main` in its front matter like anywhere else.

Walking a menu honours `.Children`, `.Identifier` with `T` for a
translated name, `.Params`, and `.IsMenuCurrent` / `.HasMenuCurrent`. This
is Hugo's documented walk partial, which the scaffold already ships
verbatim as `menu.html`. `theme-hugo-ff1` rendered `site.Menus.main` as a
flat list and honoured none of it, so a nested menu arrived flattened.

Both sources normalise to one node shape before rendering: `name`, `url`,
`children`, `colour`, `count`, `active`, `ancestor`. The normalisation is
required rather than tidy, because `.IsMenuCurrent` exists only on real
menu entries; a derived section computes the same state with
`eq $page $s` and `$page.IsDescendant $s`.

Colour comes from the menu entry's `.Params.colour`, or a section's
`params.colour`, or the palette cycled by index. Putting it on
`[menus.main.params]` means colour-coding rides Hugo's own structure
rather than a parallel one.

**A trap, to be documented rather than outwitted.** `sectionPagesMenu =
'main'` populates `site.Menus.main` with **top-level sections only**. A
site that sets it flips to the menu branch and silently loses every level
below the first, which is the whole point of the theme. The entries are
indistinguishable from hand-written ones, so no template can detect it.
It is called out in the theme's `hugo.toml`, beside the `disableKinds`
warning, and in the README.

### What a theme may extend

Hugo merges map configuration values from a theme into the project, and
**cannot merge slice values** — top-level slice keys, and map keys whose
values are slices. Two consequences shape this design:

- **A theme cannot contribute menu entries.** `[[menus.main]]` is a slice,
  so the derived section tree can never become real menu entries. The
  adapter above is the only available shape, not a shortcut.
- **A theme cannot add an output format.** `[outputs]` is a map of slices.
  This is why search reads the DOM rather than publishing `index.json`,
  and why `theme-hugo-ff1` reached for `resources.FromString`.

What ff-1 does extend, all through documented points:

| Point | Use |
|---|---|
| markup render hooks | heading anchors, image figures, link resolution and external `rel` |
| shortcodes | six; `youtube` and `vimeo` override built-ins |
| menu entry `.Params` | `colour`, so colour-coding rides Hugo's menu structure |
| front matter under `params` | namespaced: `params.ff-1.*` (see below); `kind` is also reserved at top level |
| `[params]`, `[related]`, `[taxonomies]` in theme `hugo.toml` | maps, so they merge; the site always wins |
| `data/` | the feature manifests, namespaced (see below) |
| `i18n` | merged key by key, so a site changes one word |
| partial overriding | the theme offers it: a site drops in its own `wordmark.html` or `footer.html` |

### Hugo mechanics

Verified against the Hugo documentation rather than inherited from
`theme-hugo-ff1`, which predates some of it. Each of these is a deliberate
departure from the source.

**Render hooks resolve through `.PageInner`.** Hugo's own embedded link and
image hooks use `.PageInner`, not `.Page`. The two differ when a render
hook fires while an included page is being rendered: `.Page` is the
included page, `.PageInner` the parent. `.PageInner` falls back to `.Page`
and always returns a value, so it is correct in both cases.
`theme-hugo-ff1` uses `.Page.Resources.Get` and `.Page.GetPage`, which
misresolve resources under any include-style shortcode. ff-1 uses
`.PageInner`.

**The table of contents is built by the theme, not the site.**
`.TableOfContents` obeys `[markup.tableOfContents]`, which belongs to the
site and which the theme cannot pin. `.Fragments.ToHTML 2 3 false` takes
the start level, end level and list type as arguments, so the TOC renders
the same whatever a site configures. ff-1 uses it.

**The heading count excludes description terms.**
`.Fragments.Identifiers` holds the id of every heading *and, when so
configured, of every `dt` element*. ff-1 styles Markdown definition lists,
so a page with a `<dl>` and two headings could pass a threshold counted
that way. The "three headings or more" test counts `.Fragments.Headings`
instead.

**A failed poster fetch is reported.** `try` does not classify a 404 as an
error, returning nil, and an unhandled error fails the build.
`theme-hugo-ff1`'s embed reads `.Value` and never `.Err`, so a network
failure silently becomes a poster-less embed. ff-1 checks `.Err` and calls
`warnf`, so the condition is visible without breaking a build that has no
network.

**`[related]` is all or nothing.** Adding a `related` block requires a full
configuration; individual defaults cannot be overridden. The theme's block
therefore replaces Hugo's defaults entirely, which is intended — tags
first, recency as a tie-break — and a site's own block replaces the
theme's just as completely. Documented, not worked around.

**The manifests are namespaced.** Data directories from themes merge into
the site's, and the site's takes precedence, so an un-namespaced
`data/features/` is silently overridden by a site that happens to have one.
The manifests move to `data/ff-1/features/`, read with
`index hugo.Data "ff-1" "features"`. `index` rather than dot notation
because Hugo documents it as the way to reach a key that is not a valid
template identifier, and the slug contains a hyphen. Using the slug
verbatim keeps the template generic: no theme has to sanitise its own
name, whatever it is.

This is a fault in `hugo-theme-template` rather than in ff-1, so it is
fixed there too: the template writes `data/<slug>/features/` at `./c init`,
and every theme it generates is namespaced. The rename touches
`_partials/slot.html`, `tools/conformance/scripts/features.py`,
`tools/scripts/contract.py`, `tools/scripts/check/features.py`,
`tools/scripts/install-features.sh` and `tools/scripts/feature.sh`, and
lands in phase one before any feature depends on it.

**Site and page parameters are namespaced.** Hugo's guidance is explicit:
"To avoid naming conflicts, especially when developing modules or themes,
it is recommended to namespace custom parameters." The scaffold reads
`params.features`, `params.featuresoff` and `params.editBase` at the top
level, and ff-1 would have added `palette`, `tagline` and `privacyEmbeds`
beside them. All of them move under `[params.ff-1]`, in site config and in
front matter alike.

Templates read the namespace once into a variable, which is the pattern
the documentation itself shows:

```go-html-template
{{ $cfg := index site.Params "ff-1" }}
{{ $cfg.palette }}
```

`index` rather than dot notation, for the same reason as the data
directory: the slug has a hyphen in it. This is a fault in
`hugo-theme-template` as much as in ff-1, and is fixed in both.

**The module path lives in `go.mod`.** *(Done in the template.)* Neither repository has one, so
neither theme resolves through `hugo mod get`, which is the documented way
to consume a theme as a module. `hugo mod init
github.com/FoundingFuture/hugo-theme-ff-1` writes it.

This also resolves a conflict the identity decision created.
`tools/scripts/check/module.sh` derives the module path by matching a
`https://github.com/...` homepage in `theme.toml`, and `slug.sh` derives
the install directory from the last segment of that same field. Pointing
`homepage` at the product page gives the right slug and leaves
`module.sh` with an empty path, failing `release/module` outright.

`homepage` was doing two jobs. It keeps one: it is the project homepage
that themes.gohugo.io shows, and the source of the slug. The module path
moves to `go.mod`, where Hugo puts it, and `module.sh` reads it from
there.

**The extended edition is checked in the template, not declared.** Hugo
disabled the `[module.hugoVersion] extended` check in v0.153.2, and this
theme pins 0.165.0, so the declaration in `hugo.toml` is inert. The real
dependency is narrow: the embed poster is encoded as WebP, which the
standard edition cannot do. A reader on standard Hugo would hit an
encoding failure with nothing explaining it.

So the poster picks its format from `hugo.IsExtended` — WebP where it is
available, JPEG where it is not — and the theme builds on both editions.
The declaration stays for Hugo versions below 0.153.2, where it still
does something.

**The image hook guards with `reflect.IsImageResourceProcessable`.**
`theme-hugo-ff1` uses `reflect.IsImageResourceWithMeta` to avoid measuring
an SVG. `IsImageResourceProcessable` asks the question the hook actually
needs answered: whether this resource can be transformed at all.

**A broken link in a site's content does not fail that site's build.**
`theme-hugo-ff1`'s link hook calls `errorf` on an unresolved `.md`
destination, which stops the build. Hugo's own embedded hook passes an
unresolved destination through. A theme failing a build over the site's
own content is the theme overreaching, so ff-1 calls `warnf`: the fault is
reported on every build and the site owner decides what to do about it.

### The design system

`:root` tokens carried over from `theme-hugo-ff1`'s stylesheet. The palette
is `teal`, `indigo`, `rose`, `amber`, cycled across top-level sections and
overridable by `params.palette`; a section may override its own with
`params.colour`.

Six self-hosted faces, 208 KB in total, largest single file 77 KB — well
inside the 1 MB per-file limit `metadata.py` enforces. `scripts/`, holding
`build-smallcaps.py`, `build-menucaps.py` and the 408 KB Bricolage TTF they
cut from, stays in the repository as provenance and is listed `keep` in
`package.txt`.

### The stylesheet

`theme-hugo-ff1`'s 752 lines divide along their own comment boundaries:

```
assets/css/main.css          tokens, reset, base type, imports
  components/frame.css       the .frame grid and both narrow breakpoints
  components/rail.css        rail, topic tree, colour parity, chevron
  components/header.css      brand cell, wordmark
  components/footer.css      the foot line
  components/index.css       index rows, topic cards, section heads
  components/piece.css       the long read, the two-column body
  features/<name>.css        one per feature, appended only when on
```

Feature stylesheets are appended to the bundle only when their feature is
enabled, so the seven off-by-default features cost a site nothing while
remaining styled and tested.

Two traps are documented in `theme-hugo-ff1`'s `docs/layout.md` and carry
over verbatim, because both produce faults that look like styling errors:

1. Below 60rem, `.side` and `.body` are `display:contents`, which promotes
   **every** child to a grid item of `.frame`. Anything added to
   `baseof.html` at the top level needs a `grid-column` in both narrow
   blocks. There is no correct default.
2. `main` spans both columns, and a spanning grid item hands part of its
   max-content to every track it covers. The wordmark column is
   `minmax(0,13rem)` and must never be `auto`.

That document is carried into `docs/` and read before anything is added to
`baseof.html`.

## Features

Twenty-one features: the scaffold's fourteen, all kept, plus seven ff-1
needs. Fourteen default on, seven off.

### Kept, on by default

| Feature | Slot | Was |
|---|---|---|
| `breadcrumbs` | `page.before-title` | `crumb.html` |
| `dateline` | `page.meta` | the `<p class="dateline">` in `single.html` |
| `toc` | `page.before-body` | `toc.html`, shown at three headings or more |
| `pager` | `page.after-body` w10 | previous / next in section |
| `related` | `page.after-body` w20 | "Near this", first 4 by shared tags |
| `search` | core | the search page |
| `privacy-embeds` | core | the `embed` shortcode |

`dateline` defaults **on**: `theme-hugo-ff1` renders a date on every piece,
with `· updated <lastmod>` when it differs. `last-modified` remains a
separate off-by-default feature for sites wanting a standalone line. The
overlap is the honest cost of keeping all fourteen.

### New, on by default

| Feature | Slot / mechanism | Kinds |
|---|---|---|
| `heading-anchors` | `_markup/render-heading.html` | — |
| `figure-captions` | `_markup/render-image.html` | — |
| `subsection-cards` | `list.after` w5 | section |
| `further-down` | `list.after` w20 | section |
| `kind-label` | `list.item` | page |
| `tag-narrowing` | `body.end` + `taxonomy.html` | taxonomy |
| `sources` | `page.footer` | page |

`further-down` is the `complement .RegularPages .RegularPagesRecursive`
listing that stops a topic three levels deep from being a dead end.
`kind-label` renders `params.kind` as a small label in the topic's colour.
`sources` renders `params.sources`, and is inert without the parameter.

### Kept, off by default

`back-to-top`, `code-copy`, `edit-link`, `last-modified`, `reading-time`,
`share`, `word-count`. Each is styled to ff-1, carries a fixture page, and
keeps every gate green whether or not any site enables it.

### Index rows keep their heading

Hugo's scaffold gives each listed page an `<h2>`. `theme-hugo-ff1`'s
`index-rows.html` gives it a `<span class="t">`, which is what makes the
rows the densest thing on the site.

ff-1 renders `<h2 class="t">` instead. The inherited CSS already targets
`.t`, so the rows look identical, while the document outline and the
crawler keep a heading per item.

**Consequence:** no feature in ff-1 declares a `removes`. Every difference
from the scaffold is an addition, which is the stronger position to hold
and the easier one to keep green.

## Components dissolved

`search` and `privacy-embeds` are `level = "component"` in the scaffold: a
site mounts three paths per component to get them. ff-1 moves both into the
theme proper. A site sets `theme = "ff-1"` and nothing else — `layout:
search` makes a search page, `{{< embed >}}` works.

This retires the scaffold's component tier: `level = "component"`, the
missing-partial tolerance in `slot.html`, the `features/` directory, its
entry in `package.txt`, and `build/install`'s per-component README
execution. That last one is a real loss — a component's README was executed
rather than paraphrased, so a drifting README failed the gate — and it is
accepted in exchange for a theme that works on installation.

### Search

The index **is the DOM**. Every page is rendered as a real list row
carrying its signals in data attributes; the script ranks from the DOM
using `theme-hugo-ff1`'s weights: title-start 12, title 8, tags 6, section
3, description 2, body 1, and every term must appear somewhere.

Nothing is fetched. No `index.json` is published, so the site needs no
`[outputs]` block and nothing can fall out of step with the page. This is
the argument `theme-hugo-ff1`'s own `hugo.toml` already makes for the tag
page, applied to search.

Consequences: `files = ["index.json", "*/index.json"]` comes out of the
search manifest; `tools/scripts/check/search.sh`'s size budget goes
unexercised while its "lists no page in its markup" assertion becomes the
gate that matters. A query in the URL (`?q=`) still works, so a search can
be linked to.

The cost is page weight, which scales with the site. The 1.5 MB budget the
gate applies to `index.json` should be re-pointed at the search page's own
HTML.

### Embeds

The poster-and-play-button behaviour from `theme-hugo-ff1`: a poster fetched
once at build time and served from the site's own domain, and a play button
that loads the player in place on a deliberate press. Without JavaScript it
degrades to a plain link out, which is the scaffold's behaviour exactly.

Services: **YouTube, Vimeo, SoundCloud**. YouTube and Vimeo override Hugo's
built-in shortcodes of the same name. SoundCloud has no built-in, so it is
reachable only through `{{< embed at="soundcloud" >}}`.

`output/external` must accept a `data-src` attribute that is not a link.

## The example site

`exampleSite/` is required for a theme whose demo needs its own content
structure, and ff-1 is that case: its identity is nested topics of
arbitrary depth, and the demo content themes.gohugo.io inherits by default
is flat.

It is built from **Hugo's own generated sample content** —
`tools/conformance/content/scaffold/` preserves it: a home page, a `posts`
section, three posts, one a page bundle with an image, tags on each — and
extended with nesting in the same neutral lorem-ipsum register. Sections are
named plainly rather than thematically, so the content stays as generic as
the directory asks.

```
exampleSite/content/
  _index.md              Hugo's
  posts/                 Hugo's, three posts
  topic-a/_index.md
    subtopic/_index.md
      page.md
  topic-b/_index.md
  search.md              layout: search
```

This is also **where ff-1's own shortcodes are exercised**. The conformance
fixture may only call Hugo built-ins, because the reference build renders it
with Hugo's scaffold and an unknown shortcode fails that build. `gallery`,
`columns`, `items`, `lead`, `pull` and `embed at="soundcloud"` have no
built-in to override, so they live and are tested here.

**Done, in `hugo-theme-template`.** `./c init` now runs `hugo new site`,
seeds it with the scaffold's content, and calls
`tools/scripts/example-content.py` for the depth. `package.txt` ships it,
and `tools/scripts/check/example.sh` is a new check in the `build` gate.

The gate builds the example site **the way a downloader would**: the
artefact unzipped into `themes/<slug>`, `theme = '<slug>'`, under
`--panicOnWarning`. Three alternatives were tried and rejected against a
live Hugo:

- `[[module.imports]] path = '../'` and a `replacements` with a relative
  target both fail. Only an absolute module path resolves, and an
  absolute path cannot be committed.
- Mounting `../layouts`, `../i18n` and the rest builds, and is wrong: it
  bypasses the theme mechanism, so the theme's own `hugo.toml` never
  merges and the demo does not behave like an installation.
- A `exampleSite/themes/<slug>` symlink to the root builds, and makes
  `exampleSite/themes/<slug>/exampleSite/themes/<slug>` recurse for ever.

The gate also asserts that `exampleSite/hugo.toml`'s `theme` equals
`slug.sh`, so the two cannot drift.

## Shortcodes

Six, carried over: `gallery`, `embed`, `columns`, `items`, `lead`, `pull`.
`contract.toml` currently declares none and will list all six, generated by
`./c docs` from `layouts/_shortcodes/`.

`lead` renders `<h2 class="lead">`, which is a heading inside `main`. It is
used only in `exampleSite/`, never in the conformance fixture, so it never
reaches the skeleton comparison.

### Two faults found while implementing

Neither was in the plan; both were found by running the pipeline.

**The template derived the slug twice.** `bootstrap.sh` derived one from
the theme's name and `slug.sh` derived another from `theme.toml`'s
homepage. They agree only when the repository is named after the theme,
which for ff-1 it is not: the name gives `ff-1` and the homepage gives
`hugo-theme-ff-1`. `bootstrap.sh` now writes the example site's `theme`
key from `slug.sh`, and `check/example.sh` fails if the two disagree.

**`release/module` had never passed.** `module.sh` wrote its replacement
as `[[module.replacements]]` with a `replacements` key inside it. Hugo
decodes `module.replacements` as a list of strings and got a map, so it
refused the config before resolving anything, and the gate reported an
unresolvable module for every theme the template has produced. It is
invisible because `./c check` runs static, build and output, and reaches
release only when asked. Fixed to the documented form, `replacements` as
a key of `[module]`.

## Build order

Frame first, then one feature per commit. Everything in phase one lives
**outside `main`**, so `output/conform` never sees it and the gates stay
green throughout. When conform does fail later, it names the one feature
that caused it.

1. **Identity and frame** — `theme.toml`, tokens, fonts, typography,
   `baseof`, `rail`, `topictree`, `head`, `footer`, `wordmark`, the CSS
   split, `feature-on.html`, and the two-source menu walker that
   absorbs `menu.html`. With it, the conventions work that lands in
   both repositories: the `data/ff-1/features/` namespace, the
   `[params.ff-1]` namespace, `go.mod`, and `module.sh` reading the
   module path from it.
2. **The reading layer** — the seven kept on-by-default features,
   restyled: `breadcrumbs`, `dateline`, `toc`, `pager`, `related`, and the
   `h2`-bearing index rows.
3. **The seven new features** — each with manifest, partial or hook,
   stylesheet, i18n keys, fixture page, green `./c check`.
4. **The seven off-by-default features** — styled to ff-1, fixtured.
5. **Components into the theme** — search rebuilt on the DOM index, embeds
   rebuilt play-in-place across three services, `features/` retired,
   `package.txt` and `slot.html` updated.
6. **The example site and release** — `exampleSite/`, its gate,
   screenshots, `description`, `tags`, `features`, `demosite`, CHANGELOG.

## Testing

Every phase ends on `./c check` green and a commit. The gates that carry
the most weight here:

- `output/conform` — the fixture built twice, against Hugo's scaffold and
  against ff-1, compared on files published and on the shape of every page
  inside `main`. ff-1 declares only additions.
- `output/features` — three builds: reference, features-off, features-on.
  Features-off must match the reference **exactly**, so the render hooks
  must produce scaffold-identical output when their features are off.
- `static/i18n` — every key defined is said, every key said is defined.
- `output/nojs` — every page resolves with the scripts stripped. Search,
  tag narrowing and embeds each have a no-script path, and this is what
  proves it.
- `output/a11y`, `output/validity`, `output/perf`, `output/visual`.

## What building it changed

The design was written before the gates had been run against it. Eight
things it asserted turned out to be wrong or incomplete, and the theme
follows what the pipeline actually does.

**conform reads more than main.** The plan said shape means the
elements inside `main`, so the frame was free. It is not.
`skeleton.py` records every classed element while `in_content()` holds,
and that is true before `main` is seen. A build with every feature off
must match Hugo's scaffold exactly, so no manifest can excuse a wrapper
of the theme's own. The grid is `body`, carrying no class, and every
wrapper standing before `main` is a chrome element: `nav`, `header`,
`footer` or `aside`.

**Inside main, the theme's own bands carry a data attribute rather
than a class,** for the same reason. They add no content, and the gate
reads them exactly as it reads the unclassed div they replace.

**A link or a heading is allowed where its container was declared.**
An anchor beside a heading has no classed ancestor, so it counted as a
link added to the content itself, which is the whole set the gate keeps
shut. The heading takes a class when the feature is on, and the
manifest names that. Every feature that adds a list wraps it the same
way.

**The skeleton pops its stack of classed elements by tag name.** A bare
`section` closing inside `section.further-down` closed that one too,
and every row after it read as content. A row inside a feature's block
is an `article`.

**The fixture could only call shortcodes Hugo ships,** because the
reference build renders the same content with Hugo's scaffold. The
reference now gets a no-op for each name in `tools/conformance/stubs.txt`,
which is what lets the five prose shortcodes be exercised at all. They
arrive as one feature, `prose`, so the roster is twenty-two rather than
twenty-one.

**The overrides of `youtube` and `vimeo` render nothing when the
feature is off,** rather than reproducing Hugo's iframe. An iframe
carries no class, is neither a link nor an image, and is not a counted
tag, so Hugo's rendering and no rendering at all are the same shape.
Copying it would have meant tracking markup that changes when Hugo
changes it, on a theme built against the newest Hugo every week.

**`css.Build` resolves `url()`.** The plan assumed fonts could stay in
`static/`. esbuild cannot see that directory, so they are assets, and
it emits each face content-hashed beside the bundle. Splitting one
stylesheet into `components/` also moved the font urls a directory
deeper, which is why the rail's two faces are reached at `../../fonts`.

**`exampleSite/` is kept rather than shipped.** themes.gohugo.io reads
it from the repository, and a downloader unzipping into `themes/ff-1/`
has no use for a second Hugo site nested inside the theme, config and
build lock included.

## Open questions

1. Whether `check/search.sh`'s 1.5 MB budget should move from
   `index.json` to the search page's HTML, now that the DOM is the index.
