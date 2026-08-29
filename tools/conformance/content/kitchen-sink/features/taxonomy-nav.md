+++
title = 'taxonomy-nav'
date = 2026-01-30T08:00:00Z
description = 'The fixture page for the taxonomy-nav feature, which lists the taxonomies a site defines in the menu beneath its topics.'
[params]
  # The menu is chrome and the comparison does not read it, so what this
  # page can be held to is that the feature adds no word to the page
  # itself. The names in the menu are Hugo's, not the theme's.
  reject = ['#categories', '#tags']
[params.features]
  taxonomy-nav = true
+++

This page exercises the taxonomy-nav feature. What it adds is in the
menu, which is chrome, so nothing it renders is part of this page's
shape.

<!--more-->

## What it adds

Every taxonomy the site defines, listed under the topics, each opening
to its terms. A term links to its own page, which Hugo gives it.

## What it does not add

Any name of its own. Hugo names a taxonomy and counts it, so a site
that defines its own gets them listed without configuring anything, and
a site that defines none gets nothing.
