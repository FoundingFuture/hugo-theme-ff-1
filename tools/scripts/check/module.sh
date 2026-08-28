#!/usr/bin/env bash
# The theme installs as a module, by its module path.
#
# The mounts prove the templates. They do not prove the path a user
# takes, which is hugo mod get. This builds a throwaway site that
# imports the theme and asks Hugo to resolve it.
#
# Running the verb in the fixture, which imports nothing, reported
# success without testing anything.
#
# The path is read from go.mod. Hugo writes it there, and nowhere else
# declares it. It used to be inferred from theme.toml's homepage, which
# happened to hold the repository URL. But homepage is the project's
# home page. A theme may point it at a product page. The inference then
# produced nothing, and this gate failed a theme that was sound.
# reads: go.mod
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

command -v go >/dev/null 2>&1 || { echo "SKIP module: go not installed"; exit 3; }

[ -f go.mod ] || { echo "go.mod:1: missing, so the theme cannot be consumed with hugo mod get."; exit 1; }
path="$(sed -n 's|^module  *\([^ ]*\).*|\1|p' go.mod | head -1)"
[ -n "$path" ] || { echo "go.mod:1: no module path."; exit 1; }

work=.module-check
rm -rf "$work"
mkdir -p "$work"
here="$(pwd -P)"
status=0
(
  cd "$work"
  # Resolved from the working tree, so the check does not need the tag
  # to be pushed before it can pass.
  #
  # replacements is a key of [module] holding a string. Written as an
  # [[module.replacements]] table it decodes as a map. Hugo then refuses
  # the config before resolving anything. The gate reported an
  # unresolvable module for every theme rather than testing one.
  cat > hugo.toml <<CONFIG
baseURL = "https://example.org/"
title = "Module check"
[module]
  replacements = "${path} -> ${here}"
  [[module.imports]]
    path = "${path}"
CONFIG
  hugo mod init example.org/module-check >/dev/null 2>&1 || true
  hugo mod graph >/dev/null 2>&1
) || status=1

if [ "$status" -ne 0 ]; then
  echo "go.mod:1: the theme does not resolve as a module at $path."
fi
rm -rf "$work"
exit $status
