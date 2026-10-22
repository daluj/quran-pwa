# Plan: Reading Mode

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Setting

1. [x] `readingMode` in `Settings` and `DEFAULT_SETTINGS`; accepted by
   `validateBackup`; "Reading mode" switch with a hint.

## Group 2: Feed

2. [x] `VerseCard` hides the title line and action bar in reading mode.
3. [x] `QuranFeed` passes it on, adjusts `estimateRowHeight`, re-measures on
   change.

## Group 3: Tests

4. [x] Backup tests include the field.
5. [x] App test: only the last-read button and no title line in cards; number and text shown;
   surah headers stay.
