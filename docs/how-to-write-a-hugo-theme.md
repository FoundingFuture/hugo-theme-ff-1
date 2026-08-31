# How to write a Hugo theme

What ff-1 got wrong, what other themes do instead, and what Hugo decides
for you. Every number here was measured, and the source is named.

## Contents

- [Two widths, not one](#two-widths-not-one)
- [A capped body needs a background on html](#a-capped-body-needs-a-background-on-html)
- [What a theme cannot configure](#what-a-theme-cannot-configure)
- [What a site can change without forking](#what-a-site-can-change-without-forking)
- [When a resource is published](#when-a-resource-is-published)
- [An SVG that follows the theme](#an-svg-that-follows-the-theme)
- [Centring type in a band](#centring-type-in-a-band)
- [What the fixture never renders](#what-the-fixture-never-renders)
- [What Hugo ships](#what-hugo-ships)

## Two widths, not one

A theme needs two caps. One holds the line of text. One holds the page.

ff-1 shipped only the first. `--measure` held every paragraph to 765px,
and the column holding it was `minmax(0,1fr)`, which has no ceiling.

That stays invisible until a site writes the ordinary thing. A figure
asking for `max-width:100%` took 4464px on a 5000px window. 100% of an
unbounded column is unbounded.

Every comparable theme bounds its outer container:

| theme | page cap | text cap |
|---|---|---|
| Congo | `max-w-7xl`, 80rem | `max-w-prose`, 65ch |
| hugo-book | `--container-max-width: 90rem` | |
| PaperMod | `--nav-width: 1024px` | `--main-width: 720px` |

Congo carries both, which is the shape to copy. Name the page cap as a
custom property so a check can read it back:

```css
:root{ --frame:90rem }
body{ max-width:var(--frame); margin-inline:auto }
```

A site can then say `100%` and get a number the theme chose.

## A capped body needs a background on html

A body with no background on `html` hands its own to the canvas. The
canvas paints the whole window, not the body's box.

So capping the body without touching `html` stretches the body's
background across ground the frame does not cover. Set one on `html` and
the propagation stops:

```css
html{ background:var(--paper) }
```

## What a theme cannot configure

Hugo merges `params` and other maps from a theme. It does not merge
these, so only the site can write them:

- `markup`, which decides Goldmark's parser and Chroma's output
- `outputs`, which adds an output format
- `menus`, which adds a menu entry
- `cascade`, including `_build.publishResources`

The cascade case is worth stating because it looks like it should work.
A `[[cascade]]` block in a theme's own `hugo.toml` is ignored. Verified
on a bare site with a theme carrying nothing else.

Document every line the site has to write. Set them in the exampleSite
as well. A site started from the demo then has them.

## What a site can change without forking

Three seams let a site extend a theme without editing the download.

`resources.Get` reads the union of the theme's assets and the site's. A
theme that bundles `css/custom.css` last, and ships no such file, gives
every site an override point that needs no configuration.

A site's own `data/` wins a collision with the theme's. A theme reading
its features from `data/<theme>/features/` gains an extension point. A
site registers a feature of its own there, without touching a theme
file.

Hugo's template lookup prefers the site's copy. A partial the theme
expects a site to replace, such as a wordmark, needs no setting at all.
Say so in the partial's own comment.

## When a resource is published

Reading `.RelPermalink` is what publishes a resource. Read it before
knowing whether the pipeline can process the file. The original then
ships beside every variant made from it.

Read the address on the path that serves it, and nowhere else.

A page bundle is the exception, and no theme can change it. Hugo
publishes a page resource whether or not a template reads it. An image
sitting next to the post that uses it ships twice. It ships once as the
source and once as the variants.

Only the site can stop that:

```toml
[[cascade]]
  [cascade._build]
    publishResources = false
```

Document it. A theme that resizes images and then serves the copies
leaves an unread original on the layout it encourages.

## An SVG that follows the theme

An SVG referenced by `<img src>` is a separate document. Page CSS does
not cross into it. `currentColor` and `var(--ink)` never see the theme,
and the file cannot read the `data-theme` attribute a switch sets.

A reader on a light system presses the dark button. The figure stays in
light values on a dark page.

Inlining is the remedy. Hugo ships no shortcode for it, so a theme
writes its own:

```go-html-template
{{- with .Page.Resources.GetMatch $src -}}
  {{- $svg := replaceRE `(?s)\A.*?<svg` "<svg" .Content -}}
  {{ $svg | safeHTML }}
{{- end -}}
```

The prolog goes because an XML declaration is not allowed part way
through an HTML document. Inline SVG carries no `alt`, so add `role` and
`aria-label` to the root element.

Hugo's own diagram support does not cover this. GoAT renders ASCII
diagrams through an embedded codeblock render hook. Mermaid needs a hook
you write. Neither inlines a file you generated.

## Centring type in a band

`align-items:center` centres the em box a face declares. A face does not
draw its ink in the middle of that box.

Asimovian declares 1em above the baseline and .3em below, so the box's
middle sits .35em over it. The middle of its ink sits .2675em over it.
A line centred by the box lands .0825em low.

At a size that fills the band that is a descender against the rule with
a gap above the capitals. Measure the ink and paint the difference:

```css
.band p{ position:relative; top:-.0825em }
```

Paint it rather than lay it out. The line's box does not move, so a
height the rest of the page depends on stays what it was.

## What the fixture never renders

A fixture exercises one branch per switch. The other branch is rendered
by no check at all.

ff-1's fixture publishes two languages. Its band is therefore always the
column layout. The centred row a one-language site gets was drawn by no
gate. Most sites have one language.

Read the switches your fixture sets. For each, name what the other
setting would render, and whether anything measures it.

## What Hugo ships

Hugo's embedded shortcodes are Details, Figure, Highlight, Instagram,
Param, QR, Ref, Relref, Vimeo, X and YouTube.

The `figure` shortcode emits `<figure><img></figure>` and takes a
`class` argument. The class is whatever the author passes. Hugo defines
no standard class names for content, figures or images, so a theme names
its own and documents them.

## Sources

- Congo, `layouts/single.html` and `layouts/baseof.html`:
  <https://github.com/jpanther/congo>
- hugo-book, `assets/styles/variables.css`:
  <https://github.com/alex-shpak/hugo-book>
- PaperMod, `assets/css/core/theme-vars.css`:
  <https://github.com/adityatelange/hugo-PaperMod>
- Hugo embedded shortcodes:
  <https://gohugo.io/content-management/shortcodes/>
- Hugo figure shortcode: <https://gohugo.io/shortcodes/figure/>
- Hugo diagrams: <https://gohugo.io/content-management/diagrams/>
- Tailwind max-width: <https://v3.tailwindcss.com/docs/max-width>
