+++
title = 'prose'
date = 2026-01-27T08:00:00Z
description = 'The fixture page for the prose feature, which turns the switch on so that what the manifest declares can be seen.'
[params.ff-1]
  colour = 'indigo'
[params.ff-1.features]
  prose = true
+++

This page exercises the prose feature. The switch above turns it on, so
the elements its manifest declares appear on the page.

<!--more-->

{{< lead >}}An opening statement, set large.{{< /lead >}}

{{< pull >}}A line lifted out of the text.{{< /pull >}}

{{< columns >}}
Running text in two columns, with a rule between them. It is meant for a
passage that reads better narrow than wide.

A second paragraph, so the rule has something to sit between.
{{< /columns >}}

{{< items >}}
First thing | tag | what it does
Second thing | tag | what it does | /kitchen-sink/
{{< /items >}}

## Off state

A page setting the same switch to false shows none of it. The comparison
build turns every feature off and has to match the reference scaffold.

The gallery needs pictures of its own, so it is exercised on a page that
carries some.
