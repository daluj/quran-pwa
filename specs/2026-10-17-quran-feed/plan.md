# Plan: Quran Feed

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Data and bookmarks

1. [x] `src/db/bookmarks.ts`: `getBookmarks`, `toggleBookmark` (set, replace,
   clear), `useBookmarks`.
2. [x] `src/features/quran/feed.ts`: `buildFeed` (rows, verse and header
   indexes), `scrollRowFor`, `resolveVerseTarget` (validation messages).
3. [x] `useFeed`: load verses and surahs once and share the feed.

## Group 2: Components

4. [x] `SurahHeader` and memoized `VerseCard` with the action bar.
5. [x] `QuickActions` pills in the header.

## Group 3: Feed

6. [x] `QuranFeed`: window virtualizer, scroll margin from the list's offset,
   `scrollPaddingStart` = header height, height estimates.
7. [x] Deep-link scroll and highlight; top-surah tracking for the header.
8. [x] Scroll memory across tab switches (`takeSnapshot` + offset).
9. [x] Re-measure on width change, anchored on the last settled top row.

## Group 4: Page and routing

10. [x] `QuranPage` with header, quick actions, invalid-reference banner.
11. [x] Single optional-segment route; other sections scroll to top on
    navigation; manual history scroll restoration.

## Group 5: Tests

12. [x] `tests/bookmarks.test.ts`, `tests/feed.test.ts`.
13. [x] App tests: feed rendering, deep link highlight, invalid reference,
    bookmarks and Continue reading, scroll restore across tabs.
