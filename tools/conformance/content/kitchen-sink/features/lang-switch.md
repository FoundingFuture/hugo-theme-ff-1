+++
title = 'lang-switch'
date = 2026-02-01T08:00:00Z
description = 'The fixture page for the lang-switch feature, which names the languages a site publishes in the band across the top.'
[params]
  # The band is a header, which the page-shape comparison does not read,
  # so the gate that can hold this feature to anything is this one. The
  # label is real text, unlike the marks the theme draws from CSS, and
  # the codes are Hugo's own language keys.
  #
  # The label reads Languages rather than naming itself in full: it is
  # set in small capitals beside codes that are not, and the lettering
  # says the rest.
  expect = ['Languages', 'EN', 'NL']
[params.features]
  lang-switch = true
+++

This page exercises the lang-switch feature. The fixture publishes two
languages, so the band carries both.

<!--more-->

## What it adds

Every language the site publishes, named by its code, under the line
across the top. A site with one language gets nothing: there is no
choice to offer.

## Where a language goes

To this page in that language when there is one. To that language's home
when there is not, because Hugo builds each language as its own site and
that home lists what the language has.

## Off state

With the feature off the band carries the site's line alone, and a
reader has no way from one language to another.
