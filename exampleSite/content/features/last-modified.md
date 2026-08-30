+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'last-modified'
+++

When a piece was last changed, where that differs from its date.

<!--more-->

## Whether it is on

It ships **off**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  last-modified = true
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/last-modified.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

## The words it shows

It says `lastModified`. Every string the theme shows is in `i18n/en.toml`, and a site translating the theme copies the keys it wants.

