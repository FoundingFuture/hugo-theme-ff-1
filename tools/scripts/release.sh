#!/usr/bin/env bash
# Run the release gate, refresh the snapshots, tag, and push.
#
# The snapshots are committed to the tag. The next branch is then
# compared against what was released, rather than against whatever
# happened to be built last.
set -euo pipefail
cd "$(dirname "$0")/../.." || exit 1

version="${1:-}"
[ -n "$version" ] || { echo "usage: ./c release v=1.2.0" >&2; exit 2; }
case "$version" in v*) tag="$version" ;; *) tag="v$version" ;; esac

[ -z "$(git status --porcelain)" ] || { echo "the working tree is dirty." >&2; exit 1; }
git rev-parse "$tag" >/dev/null 2>&1 && { echo "$tag already exists." >&2; exit 1; }

RELEASE_TAG="$tag" export RELEASE_TAG

# The gates run first, while the snapshot in the tree is still the one
# the last release wrote. output/visual and output/conform both read it,
# and both are answering the same question: what changed since the thing
# people are running. Refreshing before they run replaces that baseline
# with the build they are about to be handed, so each compares a build
# with itself and reports no difference. It cannot fail, which is not
# the same as passing.
tools/scripts/check/run.sh static || exit 1
tools/scripts/check/run.sh build  || exit 1
tools/scripts/check/run.sh output || exit 1
tools/scripts/check/run.sh release || exit 1

# Then the baseline moves to this release, so the next branch is
# compared against what was shipped rather than against whatever was
# built last.
./c snapshot
git add tools/conformance/snapshots
if ! git diff --cached --quiet; then
  git commit -q -m "Refresh the conformance snapshots for $tag"
fi

# static again, over the files the snapshot just wrote. It is the only
# gate that reads the tree rather than the build, and the reason for
# the second pass: v0.1.0 shipped three screenshots over the megabyte
# static/metadata refuses, because nothing looked at them after they
# were written. CI then failed on a commit whose own release had passed
# every check.
tools/scripts/check/run.sh static || exit 1

body="$(awk -v want="## $tag," '
  index($0, want) == 1 { found = 1; next }
  found && /^## / { exit }
  found { print }
' CHANGELOG.md)"

git tag -a "$tag" -m "$tag

$body"
git push origin HEAD
git push origin "$tag"
printf '%s\n' "tagged $tag and pushed"
