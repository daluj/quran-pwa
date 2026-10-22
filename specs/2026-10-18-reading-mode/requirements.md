# Requirements: Reading Mode

> Backfilled on 2026-10-20 from the owner's request and commit `4a4c4c3`.

## Scope

A setting for a distraction-free Quran feed: each verse shows only its number
(on the left) and its text.

### Included

- **Reading mode on:** verse cards drop the "Surah N · s:a" line and the action
  bar (save, last recited). The "Mark as last read" button stays, under the
  verse number, so the reader can save where they left off. The text follows the translation settings (Arabic and
  English, Arabic only, or English only).
- **Still shown:** surah headers, the sticky header with the surah number and
  the Continue pills, deep-link highlighting.

### Not included

- List pages and search results keep their layout (they're for managing and
  finding verses, not reading).

## Decisions

- **New setting `readingMode`** (default off); included in backups, older
  backups load it as off.
- While it's on, verses can't be saved to lists or marked as last recited from
  the feed (the user turns it off to do that), but can be marked as last read.
- Card padding adjusts (no action bar, but the card is at least as tall as the number circle plus the button); height estimates and the re-measure
  check include reading mode so the feed keeps its place when it's toggled.

## Context

- Mission: "nothing that distracts from reading" ([mission.md](../mission.md)).
- Code: `src/db/db.ts`, `SettingsPage.tsx`, `VerseCard`, `QuranFeed`.
