---
name: changelog
description: Maintains CHANGELOG.md in the project root from the git commit history, grouped by date. Use when the user invokes /changelog, asks to "update the changelog", or wants to record what changed after finishing a feature. Creates the file if it's missing; otherwise refreshes only the newest dates, keeping older entries and manual edits.
---

# Changelog

## Workflow

1. From the project root, run:

   ```bash
   python3 -I .claude/skills/changelog/scripts/changelog.py
   ```

   - **No `CHANGELOG.md`:** writes every commit, grouped by date.
   - **`CHANGELOG.md` exists:** regenerates the section for its newest date and
     adds sections for later dates. Older sections are kept as they are.
   - Nothing new: it says so and leaves the file alone.

2. **Uncommitted work** isn't in git yet. If the user is about to commit a
   finished feature, add bullets for it under `## Unreleased` at the top
   (from the feature's `specs/…/requirements.md`). The script keeps that
   section; move its bullets under the date once they're committed.

3. Review the wording: one bullet per change, in plain words. Never commit;
   the owner commits `CHANGELOG.md` with their work.

## Format

```markdown
# Changelog

## Unreleased

- Add audio playback for a single verse

## 2026-10-18

- Add a reading mode setting
- Add an option to show only the English translation
```

- One `# Changelog` title; optional `## Unreleased`; then `## YYYY-MM-DD`
  headings, newest first.
- Bullets come from commit subjects with the Conventional Commits type removed
  (`feat: add x` → `Add x`), newest first within a date.
