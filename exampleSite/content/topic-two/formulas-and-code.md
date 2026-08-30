+++
date = '2025-01-12T09:00:00Z'
draft = false
categories = ['reference']
tags = ['blue']
title = 'Formulas and code'
+++

Two things a theme cannot switch on for you, shown working. Both need a
line in `hugo.toml`, because Hugo merges a theme's params but not its
`markup`.

<!--more-->

## Mathematics

Inline, in the middle of a sentence: the mass-energy equivalence \(E = mc^2\)
sits on the line without disturbing it.

Set on its own:

\[
\int_{0}^{1} x^{2} \, dx = \frac{1}{3}
\]

And a longer one, to show a formula the width of the measure:

$$
\hat{H}\Psi = i\hbar\frac{\partial}{\partial t}\Psi
$$

Without `[markup.goldmark.extensions.passthrough]` the backslashes above
are read as escapes and eaten before the theme sees them. The build
still succeeds. The formulas simply come out as ordinary text with the
delimiters missing, which is worse than an error.

## Code

```python
def measure(band, offset):
    """Return how far an anchored heading misses the band by."""
    slack = offset - band
    return "clear" if slack >= 0 else f"{-slack:.1f}px behind"
```

```css
.strip:has(.langs) {
  min-block-size: var(--band-langs);
}
```

Code blocks need `noClasses = false` under `[markup.highlight]`. With the
default, Chroma writes its own colours into the markup as inline styles,
the theme's stylesheet has nothing to colour, and dark mode has nothing
to remap.
