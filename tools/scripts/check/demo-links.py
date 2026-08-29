#!/usr/bin/env python3
"""Every address the demo prints must exist where the demo is served.

The demo is the one build whose address comes from outside it. Every
other build is read from the directory it was written to, so its baseURL
cannot disagree with its location. This one is built with a baseURL the
workflow supplies and then served from wherever the deploy action puts
it, and nothing compared the two.

They disagreed. The baseURL named public/demo, the deploy uploads the
contents of public/demo as the site root, and so every page asked for
its stylesheet one directory below the site. The build succeeded, the
markup was valid, the links were internally consistent, and the
published page had no styling at all.

Given the directory and the baseURL it was built with, this takes the
path off every absolute reference and asks whether the file is there.
"""

import os
import re
import sys
from urllib.parse import urlsplit, unquote

REF = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"', re.I)


def wanted(html, prefix):
    """Absolute references that should resolve inside the built site."""
    for raw in REF.findall(html):
        url = raw.split("#", 1)[0].split("?", 1)[0]
        if not url or url.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:")):
            continue
        if not url.startswith("/"):
            continue                      # relative: resolves by position
        if not url.startswith(prefix):
            yield url, None               # outside the site's own path
            continue
        yield url, url[len(prefix):]


def main():
    root = sys.argv[1]
    base = sys.argv[2]
    prefix = urlsplit(base).path or "/"
    if not prefix.endswith("/"):
        prefix += "/"

    seen, findings = set(), []
    for folder, _, files in os.walk(root):
        for name in files:
            if not name.endswith(".html"):
                continue
            page = os.path.join(folder, name)
            with open(page, encoding="utf-8", errors="replace") as handle:
                html = handle.read()
            for url, rest in wanted(html, prefix):
                if url in seen:
                    continue
                seen.add(url)
                where = os.path.relpath(page, root)
                if rest is None:
                    findings.append(
                        "%s:1: %s is outside %s, which is where this site is served."
                        % (where, url, prefix))
                    continue
                target = os.path.join(root, unquote(rest))
                if os.path.isdir(target):
                    target = os.path.join(target, "index.html")
                elif rest.endswith("/") or not os.path.splitext(rest)[1]:
                    target = os.path.join(target, "index.html")
                if not os.path.exists(target):
                    findings.append(
                        "%s:1: %s is asked for and is not in the build." % (where, url))

    for finding in findings[:12]:
        print(finding)
    if len(findings) > 12:
        print("... and %d more" % (len(findings) - 12))
    print("demo: %d addresses checked against %s" % (len(seen), prefix))
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
