+++
title = 'Math output, set by the page'
date = 2026-01-25T08:00:00Z
description = 'A page that asks for KaTeX markup while the site around it renders MathML, to show that the mode resolves per page.'
[params.ff-1.katex]
  output = 'htmlAndMathml'
+++

The site renders formulas to MathML, which needs no stylesheet. This page
asks for KaTeX markup instead, in its own front matter.

<!--more-->

Inline \(E = mc^2\) and a block:

\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]

Every other page here still gets MathML, and links no stylesheet.
