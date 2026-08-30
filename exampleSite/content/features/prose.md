+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'prose'
+++

Five shortcodes a piece can use: a lead, a pull quote, columns, a list of items and a gallery.

<!--more-->

## Whether it is on

It ships **on**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  prose = false
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/prose.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

## The words it shows

It says `galleryClose`, `galleryPrevious`, `galleryNext`. Every string the theme shows is in `i18n/en.toml`, and a site translating the theme copies the keys it wants.

