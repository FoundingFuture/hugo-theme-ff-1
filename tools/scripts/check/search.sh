#!/usr/bin/env bash
# reads: tools/conformance/public/ours tools/conformance/public/ours-off
# The search index stays small enough to send, and the page works
# without the script.
#
# An index is downloaded whole by every reader who opens the search
# page. A megabyte and a half is already generous. A theme indexing the
# full text of a large site passes it without noticing.
#
# The page listing nothing in its markup is the other fault. Then the
# index is the only way to search, and a reader with the script blocked
# has an empty box.
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

BUDGET_BYTES="${SEARCH_BUDGET_BYTES:-1572864}"
target=tools/conformance/public/ours
[ -d "$target" ] || { echo "SKIP search: no build at $target"; exit 3; }

status=0

# The budget is for a site that publishes an index. ff-1 publishes
# none: the index is the page, and Hugo will not merge a theme's
# outputs into a site's own. So this is a branch, not the gate's first
# word. It used to exit 0 here, which meant no build ever reached the
# checks below and this whole gate passed by saying nothing.
index="$target/index.json"
if [ -f "$index" ]; then
  bytes="$(wc -c < "$index" | tr -d ' ')"
  if [ "$bytes" -gt "$BUDGET_BYTES" ]; then
    printf '%s\n' "$index:1: $bytes bytes, over the $BUDGET_BYTES budget."
    status=1
  fi
  printf '%s\n' "search: index is $bytes bytes, budget $BUDGET_BYTES"
else
  printf '%s\n' "search: no index published. The index is the page."
fi

page="$target/search/index.html"
if [ -f "$page" ]; then
  listed="$(grep -c 'class="search-result"' "$page" || true)"
  if [ "$listed" -lt 1 ]; then
    printf '%s\n' "$page:1: lists no page in its markup. Search needs the script to work."
    status=1
  else
    printf '%s\n' "search: the page lists $listed results without a script"
  fi
fi

# The rail carries the box, on every page rather than only on the one
# that lists the results. conform excludes chrome, so a rail that lost
# its box would fail no other gate. This is the only gate that looks.
#
# The URL is read off the page that was found, not written here. A
# theme names a path once, and the site decides where its search page
# lives.
away="$target/index.html"
if [ -f "$page" ] && [ -f "$away" ]; then
  url="/${page#"$target/"}"
  url="${url%index.html}"
  if grep -q "<form class=\"findbox\"[^>]*action=\"$url\"" "$away"; then
    printf '%s\n' "search: the rail points at $url away from the search page"
  else
    printf '%s\n' "$away:1: the rail carries no search box pointing at $url."
    status=1
  fi
fi

# Off is off. A feature that renders its chrome anyway costs every page
# of a site that switched it off.
off=tools/conformance/public/ours-off
if [ -f "$off/index.html" ] && grep -q 'class="findbox"' "$off/index.html"; then
  printf '%s\n' "$off/index.html:1: the rail box is rendered though search is off."
  status=1
fi

exit $status
