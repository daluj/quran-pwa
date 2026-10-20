# Plan: English Only

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Setting

1. [x] `englishOnly` in `Settings` and `DEFAULT_SETTINGS`; accepted by
   `validateBackup`.
2. [x] `textVisibility` and `useTextVisibility`.

## Group 2: Settings page

3. [x] Reusable `Switch` (label, hint, disabled); the two translation switches.

## Group 3: Displays

4. [x] `VerseCard` (`showArabic` / `showEnglish`), `SurahHeader` (optional
   Bismillah), `QuranFeed` (height estimates and re-measure).
5. [x] `ListDetailPage` and `SearchResults` (matched text always shown).

## Group 4: Tests

6. [x] `tests/settings.test.ts` for the visibility rule.
7. [x] Backup tests: field restored; older backups default it to off.
8. [x] App test: English only in the feed and headers; Arabic search still
   shows Arabic.
