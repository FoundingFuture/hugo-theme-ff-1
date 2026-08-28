#!/usr/bin/env bash
# Print the config for the build against the theme.
#
# The theme is consumed the way a downloader consumes it. A directory
# under a themes directory, named by the theme key. The reference
# build reads the scaffold the same way. Both sides of the comparison
# are then read as a theme, rather than as mounts into a repository.
#
# Everything the theme carries is part of the theme. A site adopts it
# by naming it, and mounts nothing.
set -euo pipefail
cd "$(dirname "$0")/../.." || exit 1

slug="$(tools/scripts/slug.sh)"
printf '%s\n' "# Written by conform.sh. Do not edit."
printf 'theme = "%s"\n' "$slug"
printf 'themesDir = "../../dist"\n'

# Search publishes no index. The page is the index, so a site adds
# nothing to its outputs and there is nothing here to add either.

printf '%s\n' "[module]"
# The content and the words the fixture supplies, as any site does.
for dir in content assets i18n static; do
  [ -d "tools/conformance/$dir" ] || continue
  printf '  [[module.mounts]]\n    source = "%s"\n    target = "%s"\n' "$dir" "$dir"
done
