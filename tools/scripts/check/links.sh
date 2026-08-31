#!/usr/bin/env bash
# No template writes an address to another host into an anchor of its own.
#
# link.html decides what leaving the site means, once, for every link the
# theme writes. A template that writes its own <a href="https://..."> is
# a fourth copy of that decision, and it is the copy that drifts: it gets
# no rel, no target, and none of the words a screen reader needs.
#
# The theme's own demo did exactly that. Its footer override wrote three
# external links by hand, so the site the theme shows itself with
# contradicted the rule the theme documents.
# Only template directories. A built page under exampleSite/public-check
# is output, and the anchors in it are what this rule produced.
# reads: layouts exampleSite features
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

status=0
while IFS= read -r hit; do
  [ -n "$hit" ] || continue
  file="${hit%%:*}"
  rest="${hit#*:}"
  line="${rest%%:*}"
  printf '%s:%s: an anchor to another host, written here rather than by link.html.\n' "$file" "$line"
  status=1
done <<EOF
$(find layouts exampleSite/layouts features -type f -name '*.html' -print0 2>/dev/null \
  | xargs -0 grep -n '<a [^>]*href="http' 2>/dev/null || true)
EOF

if [ "$status" -ne 0 ]; then
  printf '%s\n' "  Pass it through link.html so rel, target and the words it says are decided once:"
  # The dollars are Go template variables, and the quotes keep them so.
  # shellcheck disable=SC2016
  printf '%s\n' '  {{ partial "link.html" (dict "href" $u "text" $name "page" $page) }}'
fi
exit $status
