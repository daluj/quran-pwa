# Plan: Weekly Review

## Group 1: Data

1. [x] `DailyTick { date, itemId }` and the `dailyTicks` table (`&[date+itemId], date`)
   in `src/db/db.ts`, schema version 4; the upgrade copies `dailyChecks` rows
   into `dailyTicks` and the table is dropped (`dailyChecks: null`).
2. [x] Replace `src/db/dailyChecks.ts` with `src/db/dailyTicks.ts` (or keep the
   name): `weekStartKey(date)` (the Sunday on or before), `weekDateKeys(date)`
   (seven keys), `setChecked(itemId, checked, today)`, `getWeekTicks(weekStart)`
   and `pruneBefore(weekStart)`; hooks `useWeekTicks(weekStart)`.

## Group 2: Logic

3. [x] `src/features/daily/week.ts`: build the grid model from the ticks and
   `today` (cell state: done, not done, upcoming; per-item and total counts,
   total possible = items x days up to and including today).
4. [x] Prune when the Daily page opens and when `useToday()` changes day.

## Group 3: UI

5. [x] Today's checklist uses the new data layer (behaviour unchanged).
6. [x] `WeekGrid.tsx`: accessible table (row headers = items, column headers =
   days, today marked), cell text/labels, total and per-item counts; fits a
   phone width without scrolling; light and dark.

## Group 4: Docs

7. [x] `specs/tech-stack.md` (table `dailyTicks`, schema version 4, week rule),
   README Daily section, CLAUDE.md user-table list.
8. [x] Roadmap phase 16 checked off; `CHANGELOG.md` `## Unreleased`.

## Group 5: Tests

9. [x] Unit tests for week math, pruning, ticking and the version 3 to 4 upgrade.
10. [x] App and axe tests for the grid on `/daily`.
