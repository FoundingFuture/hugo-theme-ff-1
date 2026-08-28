+++
title = 'heading-anchors'
date = 2026-01-25T08:00:00Z
description = 'The fixture page for the heading-anchors feature, which turns the switch on so that what the manifest declares can be seen.'
[params.ff-1.features]
  heading-anchors = true
+++

This page exercises the heading-anchors feature. The switch above turns it on,
so the element its manifest declares appears on the page.

<!--more-->

## Off state

A page setting the same switch to false shows none of it. The
comparison build turns every feature off and has to match the reference
scaffold exactly.
