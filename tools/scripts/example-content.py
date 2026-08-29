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

import datetime
import os
import shutil
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
# Every section here has words of its own. A section without them is a
# container: the theme draws it muted, because it groups rather than
# says anything, and one sitting among topics that do speak reads as a
# fault rather than a distinction.
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
    "topic-three": {
        "sections": {"subtopic-one": {"pages": ["page-one"]}},
    },
}

TAGS = ["blue", "green", "red", "yellow"]


def hugo_new(path):
    """Ask Hugo for a content file, through the site's archetype."""
    # The site names the theme, and Hugo refuses to load a site whose
    # theme it cannot find. At init there is no theme key yet and this
    # is ignored. Later, run by hand, it finds the packaged artefact.
    result = subprocess.run(
        ["hugo", "new", "content", path, "--themesDir", "../dist"],
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


def fill(path, rng, tags, intro=False, weight=0):
    """Undraft the page Hugo wrote, tag it, and give it a body.

    A section gets an introduction rather than an article. What sits
    under a topic is listed after the topic's own words, so a section
    that reads like a piece pushes its own contents off the screen.

    Hugo's archetype marks a new page a draft. That is right for a
    person writing one. It is wrong for a page generated to be
    published.
    """
    with open(path, encoding="utf-8") as handle:
        text = handle.read()

    text = re.sub(r"^draft = true$", "draft = false", text, flags=re.MULTILINE)
    # Hugo's default order is weight, then date descending. Without a
    # weight the dates decide, and a menu ordered by when a topic was
    # written reads as no order at all.
    if weight:
        text = text.replace("draft = false", "draft = false\nweight = %d" % weight, 1)
    # Hugo stamps the day the file was written. A demo regenerated in a
    # month would then carry a month's newer dates and read as a
    # different site, so the day is pinned and only spread.
    day = rng.randrange(0, 900)
    stamp = (datetime.date(2024, 1, 1) + datetime.timedelta(days=day)).isoformat()
    text = re.sub(r"^date = '[^']*'$", "date = '%sT09:00:00Z'" % stamp,
                  text, flags=re.MULTILINE)
    if tags:
        listed = ", ".join("'%s'" % tag for tag in tags)
        text = text.replace("draft = false", "draft = false\ntags = [%s]" % listed, 1)

    body = paragraphs(rng, 1 if intro else rng.randint(4, 6))
    # A summary divider after the first paragraph. Without one a list
    # page repeats whatever ids the opening words carry. Two such pages
    # on one list are two elements sharing an id.
    if intro:
        text = text.rstrip() + "\n\n" + body[0] + "\n"
        open(path, "w", encoding="utf-8").write(text)
        return
    rest = body[1:]
    # Three headings or more is what the table of contents asks for, so
    # a page long enough to want one is written with them. A shorter
    # page keeps its plain shape, which is the case worth showing too.
    if len(rest) >= 2:
        titled = []
        for index, para in enumerate(rest):
            titled.append("## " + " ".join(
                rng.sample(WORDS, 2)).capitalize())
            titled.append(para)
        while len([line for line in titled if line.startswith("## ")]) < 3:
            titled.append("## " + " ".join(rng.sample(WORDS, 2)).capitalize())
            titled.append(" ".join(paragraphs(rng, 1)))
        rest = titled
    text = text.rstrip() + "\n\n" + body[0] + "\n\n<!--more-->\n\n" + "\n\n".join(rest) + "\n"

    with open(path, "w", encoding="utf-8") as handle:
        handle.write(text)


def build(node, prefix, rng):
    for index, (name, spec) in enumerate(node.items(), start=1):
        here = "%s/%s" % (prefix, name) if prefix else name

        if spec.get("body", True):
            hugo_new("%s/_index.md" % here)
            fill(os.path.join(SITE, "content", here, "_index.md"), rng, [],
                 intro=True, weight=index * 10)
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


# Pages that show one thing each, rather than filling the tree. Every
# one is still written by hugo new content, and only its body is
# appended here.
EXTRAS = [
    ("search.md",
     "layout = 'search'\n",
     "Type a word. The list below is the index, so it narrows as you\n"
     "type and nothing is fetched.\n"),
    ("a-video.md", "",
     "A video, as a picture and a play button, both served from this\n"
     "domain. The player arrives when you press it.\n\n"
     '{{< embed at="youtube" id="aqz-KE-bpKQ" title="A video" >}}\n'),
]

# The gallery needs pictures of its own, and the fixture already holds
# two that are nobody's photograph.
PICTURES = "tools/conformance/content/kitchen-sink/bundle"


def extras(rng):
    for name, front, body in EXTRAS:
        hugo_new(name)
        path = os.path.join(SITE, "content", name)
        text = open(path, encoding="utf-8").read()
        text = re.sub(r"^draft = true$", "draft = false", text, flags=re.MULTILINE)
        if front:
            text = text.replace("draft = false", "draft = false\n" + front.rstrip("\n"), 1)
        open(path, "w", encoding="utf-8").write(text.rstrip() + "\n\n" + body)

    # A page bundle, so the gallery has resources to cut thumbnails from.
    hugo_new("pictures/index.md")
    folder = os.path.join(SITE, "content", "pictures")
    for picture in ("a.png", "b.png"):
        source = os.path.join(PICTURES, picture)
        if os.path.exists(source):
            shutil.copyfile(source, os.path.join(folder, picture))
    path = os.path.join(folder, "index.md")
    text = open(path, encoding="utf-8").read()
    text = re.sub(r"^draft = true$", "draft = false", text, flags=re.MULTILINE)
    open(path, "w", encoding="utf-8").write(
        text.rstrip() + "\n\n"
        "Thumbnails that open full size when clicked. No script: a\n"
        "thumbnail is a link to a fragment, and back closes the picture.\n\n"
        "{{< gallery >}}\n"
        "a.png | A grey square\n"
        "b.png | Another grey square\n"
        "{{< /gallery >}}\n")


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

    rng = random.Random(20260828)
    build(TREE, "", rng)
    extras(rng)

    # Hugo's own sample section sorts among the generated ones, so it
    # carries a weight as well and lands after them.
    posts = os.path.join(SITE, "content", "posts", "_index.md")
    if os.path.exists(posts):
        text = open(posts, encoding="utf-8").read()
        if "weight" not in text:
            text = text.replace("draft = false", "draft = false\nweight = 90", 1)
            open(posts, "w", encoding="utf-8").write(text)
    made = sum(len(files) for _, _, files in os.walk(os.path.join(SITE, "content")))
    print("example-content: the example site holds %d content files" % made)
    return 0


if __name__ == "__main__":
    sys.exit(main())
