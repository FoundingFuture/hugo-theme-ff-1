#!/usr/bin/env python3
"""Every feature the theme ships is shown by the site that shows it off.

The demo had generic topics and nothing else. Whether a feature appeared
anywhere depended on whether some page happened to use it, and four
shipped without ever being drawn on the site people look at. A reader
asking what a feature looks like had to guess which page carried one.

A feature declares, in its manifest, the elements it puts on a page. So
the question has an answer that can be checked: does the built demo
contain one. Not whether it looks right, which is taste. Whether it is
there at all, which is a fact.

An exemption is a decision, so each one is written down with its reason.
"""

import fnmatch
import glob
import os
import re
import sys

try:
    import tomllib
except ModuleNotFoundError:  # 3.10 and older
    tomllib = None

MANIFESTS = "data/ff-1/features"
DEMO = "dist/demo"

# A feature that cannot be drawn by a site sitting still, and why.
EXEMPT = {
    "search": "its results need a reader's query, and a built page has none",
    "tag-narrowing": "it draws when a list is narrowed to a tag, which is a query",
    "edit-link": "it needs a repository to point at, which the demo has not got",
    "last-modified": "it needs a page changed after it was written, which a"
                     " generated demo has not got",
    "code-copy": "the button is written by a script when the page loads, so it"
                 " is not in the markup a build produces",
    "back-to-top": "the control appears once a reader has scrolled",
}


def selectors(manifest):
    """Every element the feature says it adds."""
    table = manifest.get("skeleton", {})
    out = []
    for key in ("text", "links", "images", "headings"):
        out.extend(table.get(key, []))
    return out


def pattern(selector):
    """A regex for one simple selector: tag, .class, or tag.class."""
    tag, _, cls = selector.partition(".")
    tag = tag or "[a-zA-Z][a-zA-Z0-9]*"
    if not cls:
        return re.compile(r"<%s[\s/>]" % tag)
    return re.compile(r"<%s\b[^>]*class=[\"'][^\"']*\b%s\b" % (tag, re.escape(cls)))


def main():
    if tomllib is None:
        print("SKIP showcase: no toml reader")
        return 3
    if not os.path.isdir(DEMO):
        print("SKIP showcase: no demo at %s. release/demo builds it" % DEMO)
        return 3

    pages = []
    for folder, _, names in os.walk(DEMO):
        for name in names:
            if name.endswith(".html"):
                with open(os.path.join(folder, name), encoding="utf-8",
                          errors="replace") as handle:
                    pages.append(handle.read())
    if not pages:
        print("%s:1: the demo has no pages." % DEMO)
        return 1

    findings = []
    shown = 0
    for path in sorted(glob.glob(os.path.join(MANIFESTS, "*.toml"))):
        with open(path, "rb") as handle:
            manifest = tomllib.load(handle)
        name = manifest["name"]
        if not manifest.get("default"):
            continue
        if name in EXEMPT:
            continue
        wanted = selectors(manifest)
        if not wanted:
            continue
        found = any(pattern(one).search(page) for one in wanted for page in pages)
        if found:
            shown += 1
        else:
            findings.append(
                "%s:1: %s is on by default and appears nowhere in the demo."
                % (path, name))
            findings.append("  It declares %s. The demo is the site people look"
                            % ", ".join(wanted))
            findings.append("  at before they install anything.")

    print("showcase: %d feature(s) drawn somewhere in %d demo pages"
          % (shown, len(pages)))
    if EXEMPT:
        print("showcase: %d cannot be drawn by a site sitting still: %s"
              % (len(EXEMPT), " ".join(sorted(EXEMPT))))
    for line in findings:
        print(line)
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
