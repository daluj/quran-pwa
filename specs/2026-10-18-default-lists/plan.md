# Plan: Default Topics and Collections

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Data

1. [x] Validate the backup exports and supplied keys against `verses.json`
   (all valid; duplicates and the stray space reported).
2. [x] Generate `src/data/default-lists.json` in the backups' creation order,
   adding the supplied verses.
3. [x] Merge the second export: fill empty collections, take supersets, keep
   lists the export had empty.

## Group 2: Seeding

4. [x] `DefaultList` type; `seedDefaultLists(db, defaults, now)` creates lists
   and items in one transaction with ordered timestamps.
5. [x] Skip when either the new or the legacy seed marker exists.

## Group 3: Tests

6. [x] Defaults use only existing verses, once per list, with unique names per
   type.
7. [x] Seeding creates every list with its verses in order; deleted lists
   aren't recreated; legacy installs are left alone.
8. [x] Backup and app tests no longer depend on the old six topics.
