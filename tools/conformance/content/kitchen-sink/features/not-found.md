+++
title = 'not-found'
date = 2026-01-25T08:00:00Z
description = 'The fixture page for the not-found feature, which gives a site the page a wrong address lands on.'
[params.ff-1.features]
  not-found = true
+++

This page exercises the not-found feature. The switch above turns it on,
so the file its manifest declares is published.

<!--more-->

## What it writes

Hugo writes `404.html` where a template exists and nowhere else. The
reference scaffold ships no such template, so this feature publishes a
file the comparison build does not, which is what the manifest's `files`
key is for.

## Off state

A page setting the same switch to false changes nothing here: the file
is the site's, not the page's. The comparison build turns every feature
off and has to match the reference scaffold exactly.
