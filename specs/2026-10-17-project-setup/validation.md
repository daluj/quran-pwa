# Validation: Project Setup

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0
- [x] `npm run build` prints `Quran data OK: 6236 verses, 114 surahs, version …`

### Specific test coverage required

- [x] `parseTanzil` accepts a valid file (BOM, CRLF, `#` lines) and rejects
      missing, duplicate, empty, malformed and out-of-range verses
- [x] `stripBismillah` removes the prefix from surahs 2–114 (except 9), keeps
      1:1 and 9:1, and fails if the prefix is missing
- [x] The real dataset has 6,236 verses and 114 surahs with the known lengths
      (1 → 7, 2 → 286, 9 → 129, 114 → 6)
- [x] Seeding loads all verses, skips when the version is unchanged, re-seeds
      on a new version while keeping user data, and rejects incomplete data
- [x] The app redirects `/` to `/quran` and navigates between the sections

## Manual Checks

- [x] Production preview serves the app, manifest, service worker and icons
- [x] The service worker precaches the shell, Amiri Quran font and verses JSON
- [x] Light and dark themes switch without a flash on reload

## Definition of Done

Checks pass, CI is green, and the work is merged to `main`.
