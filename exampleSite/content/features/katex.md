+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'katex'
+++

Mathematics rendered while the site builds, to MathML or to KaTeX markup.

<!--more-->

## Whether it is on

It ships **on**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  katex = false
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/katex.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

## A formula in the line

Mass and energy, \(E = mc^2\), set inline so it sits in the sentence
rather than beside it.

## A formula of its own

\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]

\[
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx
\]

Both are MathML. No stylesheet was linked for this page and no script
runs in the browser: the markup is the drawing. That is Hugo's default,
and this theme's.

## Wider than the line

A formula too wide for the reading measure scrolls inside it rather than
widening the page.

\[
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6} \quad\text{and}\quad
\prod_{p} \left(1 - p^{-2}\right)^{-1} = \frac{\pi^2}{6} \quad\text{and}\quad
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
\]

## The other mode

[KaTeX markup](/features/katex-markup/) renders the same formulas the
other way, on a page that asks for it in its own front matter.
