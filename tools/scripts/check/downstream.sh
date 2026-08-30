#!/usr/bin/env bash
# A site built from what the README says, not from a site in this repo.
# reads: README.md dist
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

command -v node >/dev/null 2>&1 || { echo "SKIP downstream: node not installed"; exit 3; }
command -v hugo >/dev/null 2>&1 || { echo "SKIP downstream: hugo not installed"; exit 3; }

node tools/conformance/scripts/downstream.js
