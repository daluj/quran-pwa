# Requirements: Quran Feed

> Backfilled on 2026-10-20 from the original SPEC.md (section 5, phase 2), the
> code and commits `bb3e5b8`, `43b0692`, `0b922e8`. Surah names, added in this
> phase, were removed in [phase 3](../2026-10-17-surah-numbers-only/).

## Scope

The Quran section: all verses as a feed of "post-like" cards, grouped by surah,
with bookmarks and deep links.

### Included

- **Feed:** one card per verse and a header per surah (number, verse count,
  Bismillah when the surah has one). Virtualized: all 6,236 verses must scroll
  smoothly.
- **Verse card:** verse number on the left, "Surah N · s:a" line, Arabic,
  translation, and an action bar:
  1. Save to collection (disabled until [phase 4](../2026-10-17-lists/))
  2. Save to prayers (disabled until phase 4)
  3. Mark as last read — one at a time; tapping again clears it
  4. Mark as last recited — one at a time; tapping again clears it
- Active state: filled icons when bookmarked.
- **Quick actions** in the sticky header: "Continue reading" and "Continue
  reciting", jumping to the bookmark, or "not set".
- **Deep links:** `/quran/:surah/:ayah` scrolls the verse to just below the
  sticky header and briefly highlights it; `/quran/:surah` opens the surah;
  verse 1 scrolls to the surah header. Invalid references show a message
  ("Surah 1 has 7 verses, so 1:8 doesn't exist.").
- The header shows the surah at the top of the viewport.
- **Scroll memory:** returning to the Quran tab restores the exact position.

## Decisions

- **Window scrolling** with `@tanstack/react-virtual`, dynamic row measurement,
  and estimated heights from text length, column width and Arabic size.
- **One route** `/quran/:surah?/:ayah?` so the feed stays mounted between
  verses; each navigation re-scrolls (keyed on the location).
- **Scroll memory** keeps the virtualizer's measurements snapshot and offset in
  memory (not storage) across tab switches.
- **Resize anchoring:** when the column width (and later the Arabic size or
  visible texts) changes, rows are re-measured and the last settled top verse
  is kept in place.
- **Bookmarks** live in the `bookmarks` table keyed by type.
- Highlight is a background fade (none with reduced motion).

## Context

- Layout and look: X-style post cards ([mission.md](../mission.md)).
- Patterns: Dexie live queries (`dexie-react-hooks`), feature folder
  `src/features/quran/`.
