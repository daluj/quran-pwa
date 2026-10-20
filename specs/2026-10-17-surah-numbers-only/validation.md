# Validation: Surahs by Number Only

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0
- [x] `surahs.json` records are exactly `{ number, verseCount, bismillah }`

## Manual Checks

- [x] No surah name appears in the feed, headers, right column, pills, search
      results or messages (desktop and mobile)
- [x] Re-seeding after the data change keeps bookmarks and lists

## Definition of Done

Checks pass and the work is merged to `main`.
