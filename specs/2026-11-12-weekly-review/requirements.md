# Requirements: Weekly Review

## Scope

The Daily page keeps this week's ticks (Sunday to Saturday, local time) and shows
them in a grid, so the user can review how the week went, especially on
Saturday. When a new Sunday starts, the old week is dropped and the record
starts again. This changes Phase 15's "no history" decision: the current week
is now kept, nothing older.

### Included

- A "This week" section on `/daily`, under today's checklist: a grid with the
  five items as rows and Sunday to Saturday as columns.
  - Each cell is done, not done (past or today), or upcoming (future days of
    this week, shown neutral, never as missed).
  - A total ("n of 35 done", counting only days up to today as possible) and a
    count per item (e.g. "Salat Fajr 5 of 7").
  - Today's column is marked.
- Today's checklist works as before; ticking updates the grid at once.
- Past days of the week are read-only in the grid.
- The week restarts on Sunday: rows from before this week's Sunday are deleted
  (on opening the page and when the day rolls over).
- Existing Phase 15 ticks for today carry over (database migration).

### Not included

- Editing earlier days, previous weeks, a week picker, or any history beyond
  the current week.
- Streaks, scores, summary sentences, reminders or notifications.
- Backups (the week is short-lived data, like today's ticks).
- A configurable first day of the week (it is always Sunday).

## Decisions

- **Week = Sunday 00:00 to Saturday 23:59 in the device's local time**, from
  `Date#getDay()` (0 = Sunday). The grid shows all seven days; days after
  today are "upcoming".
- **Storage:** a new table `dailyTicks` (Dexie schema version 4), primary key
  `[date+itemId]`, one row per item per day ticked. Phase 15's `dailyChecks`
  keyed one row per item, so it cannot hold several days; the version 4
  upgrade copies its rows into `dailyTicks` and then drops `dailyChecks`.
- **Pruning:** `pruneBefore(weekStart)` deletes rows with an earlier date. It
  runs when the Daily page opens and when `useToday()` reports a new day, so
  data never outlives its week. No background job.
- **Unticking** deletes the row for today. Only today can be changed.
- **Not in backups, no setting** (so the "Adding a setting" checklist does not
  apply). `dailyTicks` is a user table and seeding never touches it; update the
  CLAUDE.md list of user tables.
- **Layout:** the grid is a real `<table>` with row and column headers
  (accessible), seven narrow columns that fit a phone without horizontal
  scrolling. Day headers use short names (Sun, Mon, ...), cells carry text or
  an accessible label ("Done", "Not done", "Upcoming"), not color alone.
- **No new dependencies.**

## Context

- [mission.md](../mission.md): private and simple; no gamification, so no
  streaks or scores beyond plain counts. [tech-stack.md](../tech-stack.md).
- Builds on [2026-11-10-daily-checklist](../2026-11-10-daily-checklist/):
  `src/db/dailyChecks.ts`, `src/features/daily/` (`DailyPage`, `items`,
  `useToday`).
