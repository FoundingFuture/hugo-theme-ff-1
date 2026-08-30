+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'dateline'
+++

The date a piece carries, set under its title.

<!--more-->

## Whether it is on

It ships **on**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  dateline = false
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

Its rules are in `assets/css/features/dateline.css` in the theme. To change them, write your own in `assets/css/custom.css` in your site: that file is bundled after the theme's, so setting a property again changes it.

