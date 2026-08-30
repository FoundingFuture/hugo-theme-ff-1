+++
title = 'prose'
date = 2026-08-30T09:00:00Z
description = 'Every element Markdown can put in a piece, drawn the way this theme draws it.'
tags = ['reference']
+++

Everything below is plain Markdown. Nothing here is a shortcode, and
nothing needed configuring. It is on this site so that what the theme
draws can be looked at rather than described.

<!--more-->

## Headings

Six levels, and the last three matter as much as the first three. A
reference page goes deep, and a heading that comes out smaller than the
paragraph under it has stopped being a heading.

### Level three

#### Level four

##### Level five

###### Level six

## Lists

- A bulleted item.
- Another, long enough to wrap so the hanging indent can be seen against
  the paragraphs above it.
  - One nested inside it.
  - And a second.

1. A numbered item.
2. A second, which is where an ordered list starts to look wrong if
   nobody has styled it.

- [x] A task that is done.
- [ ] One that is not.

## A rule between passages

Above the rule.

---

Below it. The browser's own rule is an inset 3D border in a colour no
theme chose, which is why this one is drawn instead.

## Quotations and definitions

> A quotation sits inside a rule on its left, at the body colour rather
> than a lighter one, because it is text to read and not a caption.

Term
: The definition of the term, in a definition list.

Another term
: Its definition.

## A table

| Element | Drawn since | Notes |
|:---|---:|:---|
| `blockquote` | v0.1.0 | one of the first |
| `table` | v0.2.5 | it was the browser's until then |
| `hr` | v0.2.5 | so was this |

## A picture

![A generated picture, 1800 by 1125](/pictures/wide.jpg "The caption a title becomes")

The source is 1800px wide. It is resized to the widths the reading
measure asks for, encoded as AVIF and WebP, and given the width and
height of the source so the page does not move as it lands.

## A link that leaves

The [Hugo documentation](https://gohugo.io/) is on another host, so it
opens beside this page rather than over it, and its accessible name says
so. A link to [another page here](/topic-two/) does neither.

## A note at the foot

A claim worth a source carries one.[^1]

[^1]: The note itself, at the foot of the piece, in a block set smaller
    than the text it belongs to.
