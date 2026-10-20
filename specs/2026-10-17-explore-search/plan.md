# Plan: Explore Search

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: References

1. [x] `src/lib/reference.ts`: `parseReference` (separators, Arabic-Indic
   digits, validation via `resolveVerseTarget`).

## Group 2: Normalization and search

2. [x] `src/lib/arabic.ts`: per-character normalization with an index map
   (Arabic, Arabic search skeleton, Latin); `containsArabic`.
3. [x] Confirm `npm run data` reports the same data version.
4. [x] `src/lib/search.ts`: `parseQuery`, Uthmani-tolerant term patterns,
   `buildSearchIndex`, `searchVerses`, `highlightRanges` (merged, whole-word
   for Arabic).

## Group 3: UI

5. [x] `Highlighted` component; `useSearch` hook with a cached index.
6. [x] `SearchResults`: "Go to" row, error message, count, result cards,
   "Show more".
7. [x] `ExplorePage`: search box in the header, URL-synced query, Enter on a
   reference, collections when empty.
8. [x] Right column: hidden on Explore; references go straight to the verse.

## Group 4: Tests

9. [x] `tests/reference.test.ts`, `tests/search.test.ts`.
10. [x] App tests: go to a reference (link and Enter), invalid reference,
    translation search with highlight, Arabic search with highlight, no results
    and clearing back to collections.
