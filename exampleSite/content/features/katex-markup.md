+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'katex-markup'
[params.ff-1]
  kind = 'demonstration'
  colour = 'indigo'
[params.ff-1.katex]
  output = 'htmlAndMathml'
+++

The same formulas as the [katex](/features/katex/) page, rendered to
KaTeX markup instead of MathML.

<!--more-->

## Set by the page, not the site

This site renders formulas to MathML. This page asks for something else
in its own front matter:

```toml
[params.ff-1.katex]
  output = 'htmlAndMathml'
```

Every other page here is still MathML and links no stylesheet. This one
links the KaTeX stylesheet, because with `html` or `htmlAndMathml` Hugo
needs it to draw the result.

## The same formulas

Mass and energy, \(E = mc^2\), inline.

\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]

\[
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx
\]

## What it costs

The KaTeX stylesheet and twenty woff2 faces, on every page carrying a
formula. That is why this theme allows twice the page weight and twice
the time for a page of mathematics, and why MathML is the default.
