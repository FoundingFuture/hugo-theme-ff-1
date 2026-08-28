#!/usr/bin/env python3
"""Give the example site the depth Hugo's sample content has not got.

Hugo's scaffold ships one section and three posts. That is enough to
style a page. It is not enough to show a menu. A theme whose navigation
is the content tree demonstrates nothing with it.

Every page is written by `hugo new content`, through the site's own
archetype. The shape of the tree and the words in the body are chosen
below. Hugo decides what a content file looks like. Content
nobody generated is content that drifts from what Hugo writes today.

The words are the scaffold's own lorem ipsum. The names say what each
section is for and nothing more. An example site is read by people
whose subject is not ours.

Deterministic: the same tree and the same words on every run. A gate
comparing one build against another needs its input to hold still.
"""

import os
import random
import re
import subprocess
import sys

SITE = "exampleSite"

# The vocabulary Hugo's own sample content is written in. An added page
# then reads as one of the scaffold's rather than as an intruder.
WORDS = (
    "laborum voluptate pariatur ex culpa magna nostrud est incididunt "
    "fugiat do dolor ipsum enim consequat tempor non id anim excepteur "
    "qui irure ullamco tempor exercitation ad adipisicing aliquip nisi "
    "ea occaecat nulla quis dolore esse velit officia minim cillum sint "
    "elit aliqua labore ut duis reprehenderit lorem eiusmod amet in "
    "consectetur proident sunt veniam mollit deserunt sit aute"
).split()

# The tree. A section holding sections is a branch. One holding only
# pages is a leaf. Both shapes matter to a menu, so both are here.
#
# A section with no body of its own is here too. A menu has to decide
# whether such a section opens as a page or only groups.
TREE = {
    "topic-one": {
        "pages": ["page-one", "page-two"],
        "sections": {
            "subtopic-one": {
                "pages": ["page-one"],
                "sections": {
                    "deeper-one": {"pages": ["page-one", "page-two"]},
                },
            },
            "subtopic-two": {"pages": ["page-one"]},
        },
    },
    "topic-two": {"pages": ["page-one", "page-two", "page-three"]},
    # No body. Only what is under it.
    "topic-three": {
        "body": False,
        "sections": {"subtopic-one": {"pages": ["page-one"]}},
    },
}

TAGS = ["blue", "green", "red", "yellow"]


def hugo_new(path):
    """Ask Hugo for a content file, through the site's archetype."""
    result = subprocess.run(
        ["hugo", "new", "content", path],
        cwd=SITE, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise SystemExit("hugo new content failed for %s" % path)


def paragraphs(rng, count):
    out = []
    for _ in range(count):
        sentences = []
        for _ in range(rng.randint(3, 5)):
            words = rng.sample(WORDS, rng.randint(8, 16))
            sentences.append(words[0].capitalize() + " " + " ".join(words[1:]) + ".")
        out.append(" ".join(sentences))
    return out


def fill(path, rng, tags):
    """Undraft the page Hugo wrote, tag it, and give it a body.

    Hugo's archetype marks a new page a draft. That is right for a
    person writing one. It is wrong for a page generated to be
    published.
    """
    with open(path, encoding="utf-8") as handle:
        text = handle.read()

    text = re.sub(r"^draft = true$", "draft = false", text, flags=re.MULTILINE)
    if tags:
        listed = ", ".join("'%s'" % tag for tag in tags)
        text = text.replace("draft = false", "draft = false\ntags = [%s]" % listed, 1)

    body = paragraphs(rng, rng.randint(2, 4))
    # A summary divider after the first paragraph. Without one a list
    # page repeats whatever ids the opening words carry. Two such pages
    # on one list are two elements sharing an id.
    text = text.rstrip() + "\n\n" + body[0] + "\n\n<!--more-->\n\n" + "\n\n".join(body[1:]) + "\n"

    with open(path, "w", encoding="utf-8") as handle:
        handle.write(text)


def build(node, prefix, rng):
    for name, spec in node.items():
        here = "%s/%s" % (prefix, name) if prefix else name

        if spec.get("body", True):
            hugo_new("%s/_index.md" % here)
            fill(os.path.join(SITE, "content", here, "_index.md"), rng, [])
        else:
            # A section Hugo knows about, with nothing of its own to say.
            folder = os.path.join(SITE, "content", here)
            os.makedirs(folder, exist_ok=True)
            with open(os.path.join(folder, "_index.md"), "w", encoding="utf-8") as handle:
                handle.write("+++\ntitle = '%s'\ndraft = false\n+++\n"
                             % name.replace("-", " ").title())

        for page in spec.get("pages", []):
            hugo_new("%s/%s.md" % (here, page))
            fill(os.path.join(SITE, "content", here, page + ".md"),
                 rng, rng.sample(TAGS, rng.randint(1, 2)))

        build(spec.get("sections", {}), here, rng)


def main():
    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(os.path.join(root, "..", ".."))

    if not os.path.isdir(SITE):
        print("example-content: no %s, so there is nothing to deepen" % SITE)
        return 0

    # Already deepened. Running twice asks Hugo to overwrite pages it
    # has written, and it refuses.
    if os.path.isdir(os.path.join(SITE, "content", "topic-one")):
        print("example-content: the example site already has its sections")
        return 0

    build(TREE, "", random.Random(20260828))
    made = sum(len(files) for _, _, files in os.walk(os.path.join(SITE, "content")))
    print("example-content: the example site holds %d content files" % made)
    return 0


if __name__ == "__main__":
    sys.exit(main())
