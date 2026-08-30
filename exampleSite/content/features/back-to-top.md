+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'back-to-top'
+++

A control that returns the reader to the head of a long piece.

<!--more-->

## Whether it is on

It ships **off**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  back-to-top = true
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/back-to-top.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

## The words it shows

It says `backToTop`. Every string the theme shows is in `i18n/en.toml`, and a site translating the theme copies the keys it wants.

