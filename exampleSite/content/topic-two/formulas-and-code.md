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

Set on its own, with the `\[ \]` pair:

\[
\int_{0}^{1} x^{2} \, dx = \frac{1}{3}
\]

And with `$$`, which Goldmark treats the same way once passthrough names
both:

$$
\hat{H}\Psi = i\hbar\frac{\partial}{\partial t}\Psi
$$

A formula wider than the column it sits in scrolls inside its own box
rather than pushing the page sideways:

$$
\begin{aligned}
\mathcal{L}(\theta) &= \sum_{i=1}^{n} \Big[ y_i \log \sigma(\theta^{\top} x_i) + (1 - y_i)\log\big(1 - \sigma(\theta^{\top} x_i)\big) \Big] - \frac{\lambda}{2}\lVert\theta\rVert_2^2 + \gamma \sum_{j=1}^{p} \lvert \theta_j \rvert
\end{aligned}
$$

And one longer than any window, which scrolls rather than spilling:

$$
\mathcal{F}\{f\}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx
\quad\Longleftrightarrow\quad
f(x) = \int_{-\infty}^{\infty} \mathcal{F}\{f\}(\xi)\, e^{2\pi i x \xi}\, d\xi
\quad\text{with}\quad
\lVert f \rVert_2^2 = \int_{-\infty}^{\infty} \lvert f(x) \rvert^2 dx = \int_{-\infty}^{\infty} \lvert \mathcal{F}\{f\}(\xi) \rvert^2 d\xi
\quad\text{and}\quad
\mathcal{F}\{f * g\}(\xi) = \mathcal{F}\{f\}(\xi) \cdot \mathcal{F}\{g\}(\xi)
\quad\text{so}\quad
(f * g)(x) = \int_{-\infty}^{\infty} f(\tau)\, g(x - \tau)\, d\tau
$$

Without `[markup.goldmark.extensions.passthrough]` the backslashes above
are read as escapes and eaten before the theme sees them. The build
still succeeds. The formulas come out as ordinary text with the
delimiters missing, which is worse than an error.

### Which markup KaTeX writes

`params.ff-1.katex.output` picks it. The default is `mathml`, which
every current browser draws with no stylesheet at all. This page takes
that default, so nothing here links a stylesheet for it.

A page may ask for something else in its own front matter, and
[katex-markup](/features/katex-markup/) does. With `html` or
`htmlAndMathml` the page links KaTeX's own stylesheet, twenty faces
come with it, and the theme's `--math-scale` applies to the result.

## Code

Chroma writes classes rather than a palette, so the theme owns these
colours and dark mode can remap them. Four grammars, to show the palette
across more than one kind of token:

```python
def measure(band, offset):
    """Return how far an anchored heading misses the band by."""
    slack = offset - band
    return "clear" if slack >= 0 else f"{-slack:.1f}px behind"
```

```go
func Ratio(fg, bg Colour) float64 {
    hi, lo := math.Max(fg.Lum(), bg.Lum()), math.Min(fg.Lum(), bg.Lum())
    return (hi + 0.05) / (lo + 0.05)
}
```

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

```sh
./c check gate=release   # the gates a release runs and a check does not
./c release v=0.2.3
```

The button in the corner of each block is the `code-copy` feature, off
by default and switched on here. It shares the requirement above: with
Chroma writing inline styles there is nothing for the theme to colour,
and nothing for dark mode to remap.

## A table

Markdown writes one, and the theme draws it. A column says how it wants
to be set, and the header row keeps its own weight.

| Symbol | Reads as | Units | Typical value |
|:---|:---|:---:|---:|
| `c` | the speed of light in vacuum | m/s | 299792458 |
| `h` | the Planck constant | J s | 0.000000000000000000000000000000000662607 |
| `k` | the Boltzmann constant | J/K | 0.0000000000000000000000138 |
| `N` | the Avogadro constant | 1/mol | 602214076000000000000000 |

A table wider than the line the text keeps scrolls inside it. It does
not widen the page, for the same reason a long formula does not.
