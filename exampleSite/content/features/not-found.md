+++
date = '2026-08-30T09:00:00Z'
draft = false
title = 'not-found'
+++

The page a reader lands on when the address is wrong.

<!--more-->

## Whether it is on

It ships **on**. A site changes that in its configuration:

```toml
[params.ff-1.features]
  not-found = false
```

A page may set the same key in its own front matter, and what the page says wins.

## Changing how it looks

It has no stylesheet of its own. What it adds is drawn by the rules the rest of a piece uses.

