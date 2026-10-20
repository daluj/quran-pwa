# Validation: Settings, Backups and Polish

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] Export contains lists, saved verses, bookmarks and settings
- [x] Restore after wiping brings everything back; the Quran text is untouched
- [x] Non-backup files, unknown formats and ten kinds of broken content are
      rejected with a clear message
- [x] Unusable settings fall back to defaults
- [x] A restore that fails midway leaves the data unchanged
- [x] Settings: translation switch, Arabic size (feed follows), theme radios
- [x] Export → change data → import with confirmation restores it; a non-backup
      file shows an error and no dialog
- [x] axe finds no violations on `/quran`, `/prayers`, `/explore?q=…`,
      `/settings`

## Manual Checks (real browser)

- [x] Service worker installs; "Ready to work offline" shows once
- [x] With the server stopped: deep link, font, Arabic search, topics and
      settings all work
- [x] axe with color contrast: no violations on 7 pages in light and dark mode
- [x] Settings page on mobile has no horizontal scroll

## Definition of Done

Checks pass, CI is green, README updated, and the work is merged to `main`.
