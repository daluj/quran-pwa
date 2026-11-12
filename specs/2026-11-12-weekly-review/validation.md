# Validation: Weekly Review

## Automated Tests

- [ ] `npm run lint`, `npm run typecheck` and `npm test` exit 0 (or `/verify`)

### Specific test coverage required

- [ ] `weekStartKey` returns the Sunday on or before the date: a Sunday returns itself, a Saturday returns the Sunday six days earlier, also across a month and year boundary
- [ ] `weekDateKeys` gives seven consecutive local dates starting on Sunday
- [ ] Ticking stores one row per item per day; unticking deletes only today's row; other days and items are untouched
- [ ] `pruneBefore` deletes only rows earlier than this week's Sunday; this week's rows stay, including Saturday's, and on Sunday last Saturday's row is deleted
- [ ] Grid model: past days not ticked are "not done", future days are "upcoming" and don't count toward the possible total; per-item and total counts are right (e.g. on Wednesday the total is out of 20)
- [ ] Upgrading a version 3 database moves `dailyChecks` rows into `dailyTicks`, removes `dailyChecks`, and keeps lists, bookmarks, settings and word audio downloads
- [ ] `/daily` shows the grid with 7 day headers (Sun to Sat) and five item rows; ticking today's item updates its cell and the counts; past days have no checkboxes
- [ ] Backups are unchanged and contain no ticks
- [ ] axe finds no violations on `/daily`

## Manual Checks (real browser)

`npm run build && npm run preview`

- [ ] Mobile and desktop widths: the seven columns fit without horizontal scrolling
- [ ] Light and dark mode; axe with color contrast passes; done, not done and upcoming are distinguishable without color
- [ ] Offline: the grid loads and today's ticks update it
- [ ] Set the device date to a Saturday, then to the next Sunday: the previous week is gone and every cell is empty
- [ ] Leave the tab open past midnight into Sunday: the grid restarts without a reload
- [ ] Upgrade from the Phase 15 build in the same browser profile: today's ticks are still there

## Definition of Done

Checks pass, phase 16 is checked off in `roadmap.md`, `CHANGELOG.md` is updated
(changelog skill), and the work is committed and pushed to the working branch.
