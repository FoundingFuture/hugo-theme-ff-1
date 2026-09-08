#!/usr/bin/env bash
# A rule written in a pseudo-element the theme cannot assume is guarded.
#
# ::details-content is what makes a closed <details> paint its contents.
# Safari gained it in 18.4. An engine without it drops the rule, and a
# theme that also hid the <summary> has then hidden the only way in.
#
# That is what happened. frame.css hid .railwrap>summary unconditionally
# and forced the panel visible through the pseudo, so on an iPad too old
# to update there was no menu and no button to open one. rail.css was
# already guarding the same pseudo one file away.
#
# The rule: every ::details-content declaration sits inside
# @supports selector(::details-content). What the guard protects is a
# fallback, so the guard is what makes the fallback reachable.
# reads: assets/css
set -uo pipefail
cd "$(dirname "$0")/../../.." || exit 1

PY_BIN="$(tools/scripts/python.sh 2>/dev/null || echo python3)"
"$PY_BIN" - <<'PY'
import io, glob, re, sys

FEATURE = "::details-content"
GUARD = "@supports selector(::details-content)"
bad = []
seen = 0

for path in sorted(glob.glob("assets/css/**/*.css", recursive=True)):
    if "katex" in path:
        continue
    text = io.open(path, encoding="utf-8").read()
    if FEATURE not in text:
        continue
    # Comments name the feature to explain it. Blank them, keeping the
    # newlines so a report still points at the right line.
    text = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)
    depth = 0
    guards = []
    for number, line in enumerate(text.split("\n"), 1):
        opens_guard = GUARD in line
        if FEATURE in line and not opens_guard:
            seen += 1
            if not guards:
                bad.append((path, number, line.strip()))
        if opens_guard:
            guards.append(depth)
        depth += line.count("{") - line.count("}")
        guards = [g for g in guards if g < depth]

for path, number, line in bad:
    print(f"{path}:{number}: {FEATURE} outside {GUARD}.")
    print(f"  {line[:68]}")

if bad:
    print(f"  An engine without the pseudo drops these. Where one of them is")
    print(f"  what paints the menu, the reader is left with no menu at all.")
    sys.exit(1)

print(f"supports: {seen} {FEATURE} rules, every one of them guarded")
PY
