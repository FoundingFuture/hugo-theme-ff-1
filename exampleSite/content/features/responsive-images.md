+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'responsive-images'
+++

A picture resized to the widths the reading measure asks for, in AVIF and WebP.

<!--more-->

## Whether it is on

It ships **on**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  responsive-images = false
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/responsive-images.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

## A picture

![A generated picture, 1800 by 1125](/pictures/wide.jpg "The source is 1800px wide")

The source is a single JPEG. What reaches the reader is whichever of
these the browser prefers and the screen needs.

## What the theme wrote

```html
<picture>
  <source type="image/avif" srcset="...480w, ...768w, ...1530w" sizes="...">
  <source type="image/webp" srcset="...480w, ...768w, ...1530w" sizes="...">
  <img src="..." srcset="..." sizes="..." width="1800" height="1125"
       loading="lazy" decoding="async" alt="...">
</picture>
```

The widths are the ones the reading measure asks for. `width` and
`height` are the source's, so the browser knows the shape before a byte
of the picture arrives and the page does not jump as it lands. The first
picture on a page loads eagerly and the rest wait.

## What it does not touch

An SVG has no pixels to resize. A GIF may be an animation, and resizing
would flatten it to its first frame. Both are passed through as they
are:

![A square beside a larger square](/pictures/squaring.svg "An SVG, passed through untouched")

That picture is the same Markdown as the one above it. It reaches the
page as a plain `img` pointing at the file, with no variants and no
width asked of it, because Hugo says it is an image that cannot be
processed and the theme asks Hugo rather than guessing from the file
name.
