#!/usr/bin/env bash
# The slug: the directory name a downloader unzips the theme into.
# It is also the name a site writes in the theme key.
#
# The last segment of theme.toml's homepage. A renamed checkout
# directory carries a different name. So the name is read from the
# file, never from the filesystem.
set -euo pipefail
cd "$(dirname "$0")/../.." || exit 1

# A trailing slash is ordinary in a URL. The pattern that read the last
# segment directly returned nothing for one. The slug then fell back to
# the checkout's directory name. That name is whatever somebody cloned
# into, and not the theme's.
slug=""
if [ -f theme.toml ]; then
  home="$(sed -n 's|^ *homepage *= *"\{0,1\}\([^"]*\)"\{0,1\} *$|\1|p' theme.toml | head -1)"
  home="${home%/}"
  slug="${home##*/}"
fi
[ -n "$slug" ] || slug="$(basename "$PWD")"
printf '%s\n' "$slug"
