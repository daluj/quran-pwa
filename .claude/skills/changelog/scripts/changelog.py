#!/usr/bin/env python3
"""Create or update CHANGELOG.md from git history, grouped by commit date.

Run from the project root. Sections older than the newest date already in the
file are kept as they are (manual edits survive); the newest date is
regenerated (it may have gained commits) and later dates are added. A
"## Unreleased" section at the top is preserved.
"""

import re
import subprocess
import sys
from collections import OrderedDict
from pathlib import Path

CHANGELOG = Path("CHANGELOG.md")
TITLE = "# Changelog"
DATE_HEADING = re.compile(r"^## (\d{4}-\d{2}-\d{2})\s*$")
UNRELEASED_HEADING = re.compile(r"^## Unreleased\s*$", re.IGNORECASE)
COMMIT_TYPE = re.compile(r"^[a-z]+(\([^)]*\))?!?:\s*")


def commits_by_date():
    """Commit subjects grouped by author date, newest date and commit first."""
    log = subprocess.run(
        ["git", "log", "--no-merges", "--date=short", "--pretty=%ad%x09%s"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    grouped = OrderedDict()
    for line in log.splitlines():
        date, _, subject = line.partition("\t")
        grouped.setdefault(date, []).append(clean(subject))
    return grouped


def clean(subject):
    """'feat: add x' -> 'Add x'."""
    text = COMMIT_TYPE.sub("", subject.strip())
    return text[:1].upper() + text[1:]


def parse(text):
    """Split an existing changelog into the Unreleased lines and dated sections."""
    unreleased = []
    sections = OrderedDict()
    current = None
    for line in text.splitlines():
        if line.strip() == TITLE:
            continue
        if UNRELEASED_HEADING.match(line):
            current = unreleased
            continue
        match = DATE_HEADING.match(line)
        if match:
            current = sections.setdefault(match.group(1), [])
            continue
        if current is not None:
            current.append(line)
    return unreleased, sections


def render(unreleased, sections):
    out = [TITLE, ""]
    body = [line for line in unreleased if line.strip()]
    if body:
        out += ["## Unreleased", "", *body, ""]
    for date in sorted(sections, reverse=True):
        lines = [line for line in sections[date] if line.strip()]
        out += ["## " + date, "", *lines, ""]
    return "\n".join(out)


def main():
    commits = commits_by_date()
    if not commits:
        print("No commits found.")
        return 0

    if not CHANGELOG.exists():
        sections = OrderedDict((d, ["- " + s for s in subjects]) for d, subjects in commits.items())
        CHANGELOG.write_text(render([], sections))
        print("Created CHANGELOG.md with %d dates." % len(sections))
        return 0

    original = CHANGELOG.read_text()
    unreleased, sections = parse(original)
    newest = max(sections) if sections else ""
    for date, subjects in commits.items():
        if date >= newest:
            sections[date] = ["- " + s for s in subjects]

    updated = render(unreleased, sections)
    if updated == original:
        print("CHANGELOG.md is up to date.")
        return 0
    CHANGELOG.write_text(updated)
    print("Updated CHANGELOG.md (dates from %s on)." % (newest or "the beginning"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
