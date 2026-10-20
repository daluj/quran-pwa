# Validation: Lists and Save Sheets

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] Empty, too-long and duplicate names (same type, any case) are rejected;
      the same name is allowed across types
- [x] Verses append in order without duplicates; removing and re-adding works
- [x] Moving past either end is ignored; positions stay 0..n-1
- [x] Deleting a list removes only its items
- [x] A verse in several lists is reported in each; saved keys are split by type
- [x] From the feed: create a collection in the sheet (verse saved into it),
      duplicate name refused, icon becomes "Saved in collections"
- [x] Topic page: move up, remove, rename, delete (with confirmation)

## Manual Checks

- [x] The sheet is a bottom sheet on mobile and a centered dialog on desktop;
      Esc and the backdrop close it
- [x] Dialogs have a visible edge in dark mode
- [x] Filled icons appear on saved verses in the feed

## Definition of Done

Checks pass, CI is green, and the work is merged to `main`.
