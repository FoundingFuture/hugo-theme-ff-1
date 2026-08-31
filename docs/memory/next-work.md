# What is queued, and what was decided about it

Work agreed but not started, with the reasoning that produced it. A
plan in a chat log is a plan nobody can find.

## Print styles, with a control on the page

Owner, 2026-08-31: a small printer icon a reader can press, which
produces a proper printed layout.

The theme has no `@media print` rule at all. A long-form reading theme
that prints as-is sends the menu, the search box and the theme switch
to paper. The reading column goes at its screen width.

Shape agreed so far:

- A feature, on by default, like everything else. It needs a manifest,
  a partial, a stylesheet, an i18n key and a fixture page.
  `static/features` refuses a feature that arrives in pieces.
- The control sits in a slot. `page.meta` or `page.footer` are the
  candidates. It is a button that calls `window.print()`, so the
  feature carries script. The theme keeps script inline and small.
- The stylesheet is the substance. Chrome off. The piece at a paper
  measure. Backgrounds dropped and the tail gradient gone. A link
  printed with its address, where the address is not obvious.
- A page that prints is a page a reader keeps. So the trail and the
  date matter more on paper than on screen, not less.

A link is the part that changes most on paper. `link.html` decides what
leaving the site means. On paper that answer changes. A new tab means
nothing, and the address means everything, because a reader cannot press
it. The convention is `a[href^="http"]::after{content:" (" attr(href) ")"}`,
and it belongs in the file that already knows a link is external.

Open questions for that session:

- Whether the icon prints itself. It should not.
- What happens to a formula and to a wide table, both of which scroll
  on screen and cannot on paper.
- Whether `output/prose` should grow a print reading, since a rule that
  exists only inside `@media print` is invisible to every gate here.

## Pagination

No template touches `.Paginator`, so a section renders every page it
holds at once. The scale fixture is 204 pages, so this is measurable
rather than theoretical.

Congo ships `layouts/_partials/pagination.html`. PaperMod and hugo-book
both paginate their list templates. Hugo has an internal template as
well.

The constraint to work within: `output/conform` compares the theme with
every feature off against Hugo's scaffold. The scaffold does not
paginate. So pagination is a feature with a manifest, or it changes the
shape of every list and the comparison fails.

## The contents marker moves late, by design

Asked on 2026-08-31 and left as it is. `toc-rail.js` marks the heading
you are under, which is the last one that has passed the top. The line
is the sticky band plus 4px, about 81px down.

So a heading can be on screen for most of a screenful before the marker
reaches it. That is the rule, not lag.

The alternative is a line partway down the viewport, around a third:
`band() + (window.innerHeight - band()) * 0.3`. It tracks reading more
closely. It also means the last heading on a short page may never become
current. Handle that case before making the change.

## A tested nginx note

Offered on 2026-08-31 and declined for then. Hugo documents no web
server configuration at all. `host-and-deploy` lists managed targets and
three CLI methods. It says nothing about nginx or Apache.

What the build's shape implies, if it is ever wanted as `docs/nginx.md`,
served from the real `dist/demo` and verified rather than recommended:
pretty URLs need `try_files $uri $uri/ =404`, the 404 needs
`error_page 404 /404.html`, fingerprinted assets can be immutable for a
year while HTML must not be, and older `mime.types` files have no entry
for `image/avif`, which the theme now emits.

## Two techniques worth taking from Congo

Read while comparing themes on 2026-08-30, in
`layouts/_partials/picture.html`:

- A placeholder while a picture loads. `(.Resize "20x webp q20").Content
  | base64Encode`, inlined as a background. A reader sees the shape and
  the colours before the file arrives.
- A `?2x=true` query on an image destination. A page uses it to say a
  picture is a retina asset, drawn at half its pixel width.
