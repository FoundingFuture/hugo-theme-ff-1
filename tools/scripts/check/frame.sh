#!/usr/bin/env bash
# The page frame stops at the cap the stylesheet names, at every width.
# reads: tools/conformance/public/ours
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

command -v node >/dev/null 2>&1 || { echo "SKIP frame: node not installed"; exit 3; }

# node resolves a module from the directory it runs in, and a global
# install is nowhere near this one.
if [ -z "${NODE_PATH:-}" ] && command -v npm >/dev/null 2>&1; then
  NODE_PATH="$(npm root -g 2>/dev/null || true)"
  export NODE_PATH
fi

node tools/conformance/scripts/frame.js
