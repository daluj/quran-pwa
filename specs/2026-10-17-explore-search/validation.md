# Validation: Explore Search

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0
- [x] `npm run data` reports the same data version as before the change

### Specific test coverage required

- [x] Every reference format parses; whole-surah input; out-of-range and
      non-reference input handled
- [x] Translation search is case- and accent-insensitive and requires all words
- [x] Arabic search ignores diacritics and letter variants (1:6, 2:157, 2:2)
- [x] Uthmani spelling: "العالمين", "الرحمان", "يسألونك", "آمنوا" find their
      verses; "قال هو الله احد" does not match 112:1
- [x] Highlights map back to the original text, merge adjacent words, and cover
      whole Arabic words with their diacritics

## Manual Checks (real browser)

- [x] Arabic highlights keep letters joined; light and dark mode
- [x] Searching on mobile: the box follows the URL, no horizontal scroll
- [x] Search results work offline

## Definition of Done

Checks pass, CI is green, and the work is merged to `main`.
