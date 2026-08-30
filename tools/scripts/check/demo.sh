#!/usr/bin/env bash
# The demo is the example site, built against the packaged theme.
#
# It was the conformance fixture until v0.2.1. That fixture is a test
# harness: it is titled Conformance, its front page is a checklist of
# one page per feature, and its tagline exists to make the band grow so
# a gate can measure it. All of that went up as the site the theme
# shows itself with, and the tagline went up saying what it was for.
#
# exampleSite is the site written to be looked at, and it is also what
# themes.gohugo.io reads. Publishing anything else means the demo and
# the listing show two different themes.
#
# Built from dist/<slug>, not from the sources. That is the one path a
# downloader takes, and it is the path example.sh already tests. A demo
# built from the sources could pass while the artefact people download
# is broken.
#
# reads: dist exampleSite theme.toml
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

[ -d exampleSite ] || { echo "SKIP demo: no exampleSite/"; exit 3; }

slug="$(tools/scripts/slug.sh)"
artefact="dist/$slug"
[ -d "$artefact" ] || { echo "SKIP demo: no artefact at $artefact. ./c package writes it"; exit 3; }

demosite="$(sed -n 's/^ *demosite *= *"\([^"]*\)".*/\1/p' theme.toml | head -1)"
[ -n "$demosite" ] || { echo "theme.toml:1: demosite is empty, so the demo has no address."; exit 1; }

out=dist/demo
work=.demo-build
rm -rf "$work" "$out"
mkdir -p "$work/themes"

# public/ and resources/ are a previous build and a cache. Copying them
# in makes the work directory large and lets a stale file be served.
( cd exampleSite && tar --exclude=./public --exclude=./public-check \
    --exclude=./resources --exclude=./.hugo_build.lock -cf - . ) | ( cd "$work" && tar -xf - )

rm -rf "${work:?}/themes/$slug"
cp -R "$artefact" "$work/themes/$slug"

if ! log="$( ( cd "$work" && hugo -d "../$out" \
    --baseURL "${DEMO_URL:-https://example.org/demo/}" \
    --panicOnWarning --logLevel warn --gc ) 2>&1 )"; then
  echo "exampleSite/hugo.toml:1: the demo build failed."
  printf '%s\n' "$log" | grep -iE 'ERROR|WARN|found no layout' | head -5
  rm -rf "$work"
  exit 1
fi
rm -rf "$work"

pages="$(printf '%s' "$log" | sed -n 's/^ *Pages *│ *\([0-9]*\).*/\1/p' | head -1)"
printf '%s\n' "demo: the example site builds against $artefact, ${pages:-0} pages"

# Every address the demo prints has to exist where the demo is served.
#
# This is the one build whose address comes from outside it. The others
# are read from the directory they were written to, so their baseURL
# cannot disagree with their location; this one is built with a baseURL
# the workflow supplies and served from wherever the deploy action puts
# it, and nothing compared the two.
#
# They disagreed, and v0.1.0 published a page with no stylesheet and no
# script. The build succeeded, the markup validated, htmltest passed on
# a different build, and every gate was green.
PY_BIN="$(tools/scripts/python.sh 2>/dev/null || echo python3)"
"$PY_BIN" tools/scripts/check/demo-links.py "$out" \
  "${DEMO_URL:-https://example.org/demo/}" || exit 1
exit 0
