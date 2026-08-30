#!/usr/bin/env bash
# Every feature the theme ships is drawn by the site that shows it off.
# reads: data/ff-1/features dist/demo
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

PY_BIN="$(tools/scripts/python.sh 2>/dev/null || echo python3)"
"$PY_BIN" tools/conformance/scripts/showcase.py
