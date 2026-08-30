#!/usr/bin/env bash
# The band's height against the offset that clears it, at every width.
# reads: tools/conformance/public/ours
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

command -v node >/dev/null 2>&1 || { echo "SKIP band: node not installed"; exit 3; }

# node resolves a module from the directory it runs in, and a global
# install is nowhere near this one. Without this the gate reports
# playwright missing while it is installed, here and in CI.
if [ -z "${NODE_PATH:-}" ] && command -v npm >/dev/null 2>&1; then
  NODE_PATH="$(npm root -g 2>/dev/null || true)"
  export NODE_PATH
fi

node tools/conformance/scripts/band.js
