# Validation: Daily Checklist

## Automated Tests

- [ ] `npm run lint`, `npm run typecheck` and `npm test` exit 0 (or `/verify`)

### Specific test coverage required

- [ ] `localDateKey` uses the local date (e.g. 23:59 and 00:01 local give different keys)
- [ ] Ticking an item stores today's date; unticking removes it
- [ ] A row with yesterday's date is not counted as done today
- [ ] Ticking one item doesn't change the others
- [ ] Seeding / data-version change leaves `dailyChecks` untouched; opening a v2 database upgrades to v3 without losing lists, bookmarks, settings or word audio downloads
- [ ] `/daily` shows the five labels in order and "0 of 5 done" on a fresh database; ticking updates the summary and survives a remount
- [ ] Items 4 and 5 link to `/quran`; items 1–3 have no link
- [ ] Nav shows a "Daily" entry that opens `/daily`; header title is "Daily"
- [ ] Backups are unchanged: `validateBackup` still accepts old files and exports contain no daily checks
- [ ] axe finds no violations on `/daily`

## Manual Checks (real browser)

`npm run build && npm run preview`

- [ ] Mobile and desktop widths: four bottom tabs fit; page reads well
- [ ] Light and dark mode; axe with color contrast passes
- [ ] Offline: the page loads and ticks work with the network off
- [ ] Ticks persist across reload and app restart
- [ ] Changing the device date (or leaving the tab open past midnight) shows all items unchecked
- [ ] `preview-fresh` (empty database) opens `/daily` with everything unchecked

## Definition of Done

Checks pass, phase 15 is checked off in `roadmap.md`, `CHANGELOG.md` is
updated (changelog skill), and the owner has reviewed and committed the work.
