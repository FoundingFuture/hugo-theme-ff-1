+++
title = 'external-new-tab'
date = 2026-01-25T08:00:00Z
description = 'The fixture page for the external-new-tab feature, which opens a link that leaves the site in a new tab and says so.'
[params.ff-1.features]
  external-new-tab = true
+++

This page exercises the external-new-tab feature. The switch above turns it
on, so the element its manifest declares appears on the page.

<!--more-->

## A link that leaves

[The Hugo documentation](https://gohugo.io/) points at another host, so it
carries `rel="external noopener"`, opens beside this page rather than over
it, and its accessible name says which of those is about to happen.

## A link that stays

[The blockquote page](/kitchen-sink/blockquote/) is on this site. It opens
where the reader is, with no attribute added and nothing said.

## Off state

A page setting the same switch to false keeps the link and drops the
target. The comparison build turns every feature off and has to match the
reference scaffold exactly.
