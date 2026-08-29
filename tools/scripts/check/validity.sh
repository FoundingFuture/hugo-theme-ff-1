#!/usr/bin/env bash
# The markup is valid, and every link inside the site resolves.
# reads: tools/conformance/public/ours
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

# Git Bash has python and not python3, and the manifests need a reader
# that parses TOML. tools/scripts/python.sh answers both questions.
PY_BIN="$(tools/scripts/python.sh 2>/dev/null || echo python3)"


target=tools/conformance/public/ours
[ -d "$target" ] || { echo "SKIP validity: no build at $target. Run ./c theme=ours."; exit 3; }

# A redirect stub carries a meta refresh and nothing else. Handing one
# to a validator asks it to judge a page that is not one.
list=tools/conformance/public/readable.txt
mkdir -p tools/conformance/public
"$PY_BIN" tools/scripts/check/pages.py "$target" > "$list"
pages="$(wc -l < "$list" | tr -d ' ')"
if [ "$pages" -eq 0 ]; then
  printf '%s\n' "$target:1: no readable page to validate."
  exit 1
fi
printf '%s\n' "validity: $pages readable pages, redirects left out"

bin="$(tools/scripts/tools.sh html5validator 2>/dev/null)" && PATH="$bin:$PATH"
bin="$(tools/scripts/tools.sh htmltest 2>/dev/null)" && PATH="$bin:$PATH"
status=0
ran=0
if command -v html5validator >/dev/null 2>&1; then
  ran=1
  # One message ignored, and only that one.
  #
  # name on details is the exclusive accordion: siblings sharing a name
  # close one another, which is how the topic tree and the taxonomies
  # behave. It entered the HTML standard in 2023. The validator bundled
  # with html5validator 0.4.2, its newest release, is vnu 20.6.30 --
  # June 2020 -- so it predates the attribute by three years and calls
  # valid markup an error.
  #
  # Checked rather than assumed: the jar rejects a four-line document
  # containing nothing else. Every other message still fails the gate.
  #
  # --ignore takes a list, so it must come last: given it before the
  # files, argparse reads every path as another pattern to ignore, the
  # validator is left with nothing to check, and it falls back to walking
  # the working directory. It then reported errors from a stale built
  # demo that is not part of this gate at all.
  # shellcheck disable=SC2046
  html5validator --also-check-css $(cat "$list") \
    --ignore 'Attribute “name” not allowed on element “details”' || status=1
fi
if command -v htmltest >/dev/null 2>&1; then
  ran=1
  htmltest -c tools/scripts/check/htmltest.yml "$target" || status=1
fi
if [ "$ran" -eq 0 ]; then
  echo "SKIP validity: neither html5validator nor htmltest is installed. ./c setup fetches them"
  exit 3
fi
# The h1 and the description belong to head.sh, which runs beside this
# in the same gate. A second copy lived here and drifted.
#
# It counted only the content, so a site title in the header read as no
# h1 at all. It also judged the redirect stubs as pages.
exit $status
