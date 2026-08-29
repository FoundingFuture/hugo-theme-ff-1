# What conform actually compares, and what it forces

`output/conform` is the gate that shapes this theme. Its rules are
stricter and wider than the README's summary, and every one of them was
learned by tripping over it.

## The comparison

The fixture is built three times: against Hugo's own scaffold (the
reference), against this theme with every feature off, and against this
theme with the defaults. **With every feature off the theme must match
the reference exactly.** No manifest can excuse a difference there.
Only the on-build may differ, and only in what a manifest declares.

## What the skeleton records

`tools/conformance/scripts/skeleton.py` reduces a page to:

- the `h1`, and the heading outline
- links and images, each with the **nearest classed ancestor** as its
  container
- a count of `table dl ul ol figure blockquote pre`
- **every classed element**, with the text it carries

## The five rules that shaped the markup

**It records elements before `<main>`.** `in_content()` is true while
`main_depth` is set *or* `main` has not been seen yet. So a classed
wrapper above the content counts. This is why the grid is `body` with
no class, and why every wrapper before `main` is a chrome element.

**Chrome is excluded.** `nav header footer aside`, and everything
inside them. The whole rail, brand cell and footer are invisible to the
gate. Nothing there is ever checked, which is also why a fault in the
rail can only be found by looking at it.

**A link or heading is allowed where its container was declared.** An
element with no classed ancestor counts as "the content itself", which
the gate refuses. That is why `heading-anchors` puts a class on the
heading, and why every feature that adds a list wraps it in a classed
section.

**The classed stack is popped by tag name.** A bare `<section>`
closing inside `section.further-down` closes that one too, and
everything after it reads as content. A row inside a feature's block is
an `<article>` for that reason alone.

**An `aria-hidden` subtree is skipped whole.** Presentation is not page
shape. The contents' chevron is hidden that way and is not declared.

## What is therefore invisible, and free

Unclassed wrappers. `data-` attributes and `id`s. Plain text. A `<time>`
element. An `<iframe>`. MathML. Anything inside chrome.

This is why the theme's own bands carry `data-part` rather than a
class, why the tag page's facet handles cost nothing, and why the
`youtube`, `vimeo` and `katex` overrides can render *nothing* when
switched off rather than reproducing Hugo's markup.
