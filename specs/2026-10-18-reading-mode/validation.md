# Validation: Reading Mode

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] In reading mode a verse card has no buttons and no "s:a" title line, and
      shows the verse number, Arabic and translation
- [x] Surah headers are still shown
- [x] Backups restore `readingMode`; older backups load it as off

## Manual Checks (real browser, mobile)

- [x] A deep link to 2:255 lands right under the header in reading mode
- [x] Reading mode with Arabic and English, and with English only, look right
- [x] Settings persist across a reload

## Definition of Done

Checks pass and the work is merged to `main`.
