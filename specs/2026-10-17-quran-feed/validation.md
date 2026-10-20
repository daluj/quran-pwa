# Validation: Quran Feed

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] The feed has 6,236 verse rows and 114 header rows, each header right
      before its first verse
- [x] `scrollRowFor` targets the header for verse 1 and the verse otherwise
- [x] `resolveVerseTarget` accepts valid references and rejects out-of-range,
      zero, padded and non-numeric ones
- [x] Bookmarks: one per type, toggling the same verse clears it, types are
      independent
- [x] A deep link renders and highlights the verse; an invalid one shows the
      message
- [x] Marking a verse as last read enables "Continue reading", which navigates
      to it
- [x] Switching to Prayers and back restores the same scroll position

## Manual Checks (real browser)

- [x] Far deep links (2:255, 18:10, 36:58, 9:1, 2:282) land within a few pixels
      under the sticky header, on desktop and mobile widths
- [x] The header shows the surah at the top while scrolling
- [x] Resizing between mobile and desktop keeps the top verse in place
- [x] Scrolling stays smooth; only a few dozen cards are in the DOM

## Definition of Done

Checks pass, CI is green, and the work is merged to `main`.
