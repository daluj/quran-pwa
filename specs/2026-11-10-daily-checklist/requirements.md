# Requirements: Daily Checklist

## Scope

A new "Daily" tab with a fixed checklist of five things to do today. The user
ticks each one off; the next day starts unchecked. Nothing is recorded beyond
today.

### Included

| # | Item (fixed English label)     | Link               |
| - | ------------------------------ | ------------------ |
| 1 | Salat Fajr                     | none               |
| 2 | Salat Al Wusta                 | none               |
| 3 | Salat Isha                     | none               |
| 4 | Quran at Dawn                  | opens `/quran`     |
| 5 | Meditate with Quran at Night   | opens `/quran`     |

- `/daily` page: the five items in order, each a checkbox row that toggles
  between done and not done; a "n of 5 done" summary.
- New "Daily" entry in the sidebar and bottom tabs, between Prayers and Explore.
- Items 4 and 5 also have an "Open Quran" link that goes to the Quran feed
  (which already offers the Continue shortcuts for last read / last recited).
- The checks reset at local midnight. If the app stays open past midnight the
  page switches to the new day without a reload.

### Not included

- History, streaks, scores or any per-day record (mission: no gamification).
- Reminders, notifications or prayer times (out of scope in the mission).
- Adding, renaming, reordering or removing items; Spanish labels.
- Backups: the ticks are daily, throwaway state and are not exported.
- Tracking *what* was read (the links only open the feed).

## Decisions

- **Day = the device's local calendar date** (`YYYY-MM-DD`), computed from the
  local clock, not UTC.
- **Storage:** a new Dexie table `dailyChecks` (schema version 3), keyed by
  item id, with the `date` it was ticked. An item is done only if its `date`
  equals today, so there is no reset job and no pruning: yesterday's rows are
  simply ignored and overwritten. Items are code constants
  (`src/features/daily/items.ts`) so ids are stable.
- **No setting** is added, so the "Adding a setting" checklist in `CLAUDE.md`
  does not apply. `dailyChecks` is a user table: seeding never touches it.
- **Rollover while open:** recompute "today" on `visibilitychange`/focus and
  with a timer set for the next midnight.
- **Navigation:** `NAV_ITEMS` gets a fourth entry (`/daily`, label "Daily",
  lucide `ListChecks`); `sectionTitle` works unchanged. Add the route in
  `router.tsx`.
- **No new dependencies.**
- **Accessibility:** native checkboxes with visible label text (accessible name
  contains the label); links have text, so no label mismatch for axe.

## Context

- [mission.md](../mission.md): offline-first, private, simple. [tech-stack.md](../tech-stack.md): Dexie user tables, routes.
- Patterns to follow: `src/features/prayers/PrayersPage.tsx` (page shell),
  `src/db/bookmarks.ts` and `dexie-react-hooks` live queries, `src/components/layout/nav.ts`.
- Docs to touch: `tech-stack.md` (route, table), `README.md` structure/features,
  `CHANGELOG.md`.
