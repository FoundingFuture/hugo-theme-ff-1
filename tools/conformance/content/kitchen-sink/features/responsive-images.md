+++
title = 'responsive-images'
date = 2026-01-25T08:00:00Z
description = 'The fixture page for the responsive-images feature, which serves a picture at the size the screen asks for and in a format that compresses it.'
[params.ff-1.features]
  responsive-images = true
+++

This page exercises the responsive-images feature. The switch above turns
it on, so the element its manifest declares appears on the page.

<!--more-->

## A picture the pipeline can open

![A generated picture, 1600 by 1000](/pictures/wide.png)

The source is 1600px wide, so it is resized once per width the theme asks for
and encoded as both AVIF and WebP. The `img` keeps the original's width
and height, so the page does not jump as the picture lands.

## Off state

A page setting the same switch to false gets the `img` Hugo's own hook
writes, pointing at the source untouched. The comparison build turns
every feature off and has to match the reference scaffold exactly.
