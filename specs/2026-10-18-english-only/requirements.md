# Requirements: English Only

> Backfilled on 2026-10-20 from the owner's request and commit `78094c0`.

## Scope

A setting to read only the English translation, alongside the existing
"Show English translation" switch.

### Included

| Show English translation | Only show English translation | Verses show            |
| ------------------------ | ----------------------------- | ---------------------- |
| On                       | Off                           | Arabic and English     |
| Off                      | Off                           | Arabic only            |
| On (locked)              | On                            | English only           |

- Applies to the Quran feed (including the Arabic Bismillah in surah headers),
  list pages and search results.
- Search results always show the text that matched: an Arabic search shows the
  Arabic even in English-only mode.

## Decisions

- **New setting `englishOnly`** (default off) rather than a three-way choice,
  as requested ("in addition to" the translation switch).
- **One visibility rule** (`textVisibility`): Arabic unless English-only;
  English when the translation is on or English-only is on. Display code reads
  it through `useTextVisibility()`.
- **While English-only is on,** the translation switch shows on and is locked,
  with a note, so the user can't end up with no text.
- The Arabic size slider stays enabled (it applies when the Arabic is shown).
- Included in backups; older backups load with it off.
- The feed re-measures rows when visibility changes and keeps the top verse.

## Context

- Mission: readers who rely on the translation ([mission.md](../mission.md)).
- Code: `src/db/settings.ts`, `SettingsPage.tsx`, `VerseCard`, `QuranFeed`,
  `ListDetailPage`, `SearchResults`.
