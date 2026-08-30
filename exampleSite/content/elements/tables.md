+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'tables'
[params.ff-1]
  sources = [
    'GitHub Flavored Markdown, section 4.10, Tables',
    'CSS Tables Level 3',
  ]
+++

Markdown writes a table and the theme draws it: a header over a heavier
rule, a line between rows, and the first column on the text's own left
edge.

<!--more-->

## A plain one

| Element | Drawn since |
|:---|:---|
| `blockquote` | v0.1.0 |
| `table` | v0.2.5 |

## Columns that say how they are set

A column declares its alignment in the row of dashes under the header.
Left is the default, `---:` is right, and `:---:` is centred. Figures
are set in tabular numerals, so a column of them lines up whatever the
digits are.

| Face | Bytes | Codepoints | Licence |
|:---|---:|---:|:---:|
| bricolage-grotesque | 76901 | 226 | OFL 1.1 |
| bricolage-smallcaps-700 | 37236 | 527 | OFL 1.1 |
| instrument-sans-latin | 30092 | 208 | OFL 1.1 |
| roboto-condensed-caps | 25660 | 328 | OFL 1.1 |
| ibm-plex-mono-400 | 14708 | 229 | OFL 1.1 |

## Wider than the line

A table with more columns than the reading measure holds scrolls inside
itself. It does not widen the page, for the same reason a long formula
does not.

| Face | Bytes | Codepoints | Licence | Fingerprint | Weight | Style |
|:---|---:|---:|:---:|:---|---:|:---|
| bricolage-grotesque | 76901 | 226 | OFL 1.1 | `1173a0f1c53bad80fc5ef94fac23613d21f4f6c4bcf5d4a0594f33f74f2b5ab3` | 800 | normal |
| instrument-sans-latin | 30092 | 208 | OFL 1.1 | `b56585db4f3d606865e5bca9bf34674829f81d66144eb1a0e830390ff3edc567` | 400 | normal |

## Changing how they look

The rules are in `assets/css/components/piece.css` in the theme, under
`[data-part="body"] table`. To change them, write your own in
`assets/css/custom.css` in your site. It is bundled after the theme's,
so setting a property again changes it:

```css
[data-part="body"] th,
[data-part="body"] td{
  padding:.6rem 1rem;                 /* roomier rows */
}

[data-part="body"] tbody tr:nth-child(even){
  background:color-mix(in oklab, var(--ink) 4%, transparent);
}
```
