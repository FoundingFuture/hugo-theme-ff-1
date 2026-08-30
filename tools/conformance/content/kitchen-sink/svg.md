+++
title = 'An SVG in Markdown'
date = 2026-01-25T08:00:00Z
description = 'A page whose picture is an SVG, which is an image resource the pipeline cannot resize.'
+++

An SVG written the plain Markdown way. It has no pixels to resize, so
responsive-images passes it through untouched rather than asking it for
a width it has not got.

<!--more-->

![A square beside a larger square](/pictures/squaring.svg "Squaring")

The same file with no caption, which is the other way Markdown writes
one.

![A square beside a larger square](/pictures/squaring.svg)
