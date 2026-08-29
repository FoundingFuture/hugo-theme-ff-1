+++
title = 'toc-rail'
date = 2026-01-31T08:00:00Z
description = 'The fixture page for the toc-rail feature, which puts the contents of a piece in a column beside it where the screen has the room.'
[params]
  # The column is an aside, which the page-shape comparison does not
  # read, so what this page can be held to is the heading it carries.
  expect = ['Article contents']
[params.features]
  toc-rail = true
+++

This page exercises the toc-rail feature. It needs three headings before
either contents renders, and it carries four.

<!--more-->

## What it adds

The fragments of the piece, from the second heading level to the third,
in a column of their own. The same list the fold-out carries.

## Where it appears

Only above 80rem, where a third column does not take room the words
need. Below that it is not rendered at all, so it never becomes a grid
item in a layout that has no place for it.

## What follows the reading

A rectangle behind the entry whose heading was last passed. The script
draws it, so a page whose script never runs has a list of working links
and nothing pointing at the wrong one.

## Off state

With the feature off there is no column and no script, and the fold-out
above the piece is the only contents.
