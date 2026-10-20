# Plan: Surahs by Number Only

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Data

1. [x] Delete `scripts/surah-names.ts`; drop `name` from `buildDataset` and the
   `Surah` type.
2. [x] Regenerate `src/data/` with `npm run data`.

## Group 2: UI

3. [x] Header title/subtitle, `SurahHeader`, `VerseCard`, `RightColumn`,
   `QuickActions` and the invalid-reference message use numbers.
4. [x] Accessible names updated to "Surah N, verse A".

## Group 3: Tests

5. [x] Data, feed and app tests updated to the number-based labels.
