+++
title = 'dark-mode'
date = 2026-01-29T08:00:00Z
description = 'The fixture page for the dark-mode feature, carrying the two buttons that set the theme and the attribute they write.'
[params]
  # Both faces are drawn, and each button's name is an attribute. The
  # gate reads the words a page shows, so what it can hold this feature
  # to is that neither name is one of them: a switch that put its labels
  # on the page would be a visible string the theme does not allow.
  reject = ['Light theme', 'Dark theme']
[params.features]
  dark-mode = true
+++

This page exercises the dark-mode feature. The switch itself is in the
brand cell, which is chrome, so nothing it renders is part of this
page's shape.

<!--more-->

## What it adds

Two buttons in the corner of the brand cell, a sun and a moon. Each
writes `data-theme` on the document element and remembers the choice,
so the next page opens the way this one was left.

## What it does not add

No word. A face is drawn rather than set, so no font has to carry a
glyph for it, and a screen reader is given the name instead.

## Off state

With the feature off there is no switch and no stylesheet. A reader
whose system asks for a dark scheme gets the light theme, because the
rules that answer that question ship with the feature and not with the
theme.
