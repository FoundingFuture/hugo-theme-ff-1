#!/usr/bin/env bash
# The demo is the fixture built against the theme, under /demo/.
# reads: tools/conformance theme.toml
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

tools/scripts/reference.sh || exit 1
tools/scripts/configs.sh >/dev/null || { echo "demo: the configs could not be written."; exit 1; }

( cd tools/conformance && hugo --config hugo.toml,config/ours/hugo.toml -d public/demo \
    --baseURL "${DEMO_URL:-https://example.org/demo/}" \
    --panicOnWarning --logLevel warn --gc ) >/dev/null 2>&1 || {
  echo "conformance:1: the demo build failed."
  exit 1
}
demosite="$(sed -n 's/^ *demosite *= *"\([^"]*\)".*/\1/p' theme.toml | head -1)"
[ -n "$demosite" ] || { echo "theme.toml:1: demosite is empty, so the demo has no address."; exit 1; }

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
"$PY_BIN" tools/scripts/check/demo-links.py tools/conformance/public/demo \
  "${DEMO_URL:-https://example.org/demo/}" || exit 1
exit 0
