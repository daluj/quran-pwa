# Word-by-Word Audio — Validation

## Automated Tests

```bash
npm run lint
npm run typecheck
npm test
```

(or `/verify`, which also builds)

### Specific test coverage required

- `wordAudioUrl(2, 101, 1)` is `https://audio.qurancdn.com/wbw/002_101_001.mp3`;
  `wordAudioUrl(114, 6, 20)` pads to `114_006_020`.
- `splitWords` of 2:101 gives 22 words; the sum over all verses is 77,433.
- Playing a word then another leaves exactly one playing; the store reports the
  right `{ key, position }`.
- Tapping the playing word stops it (status `idle`); tapping it again plays it
  from the start.
- A load error sets the error status and message; the next tap clears it.
- The player stops when the Quran page unmounts.
- A verse in the exceptions list renders its Arabic with no word buttons.
- Words are buttons whose accessible name is the word; the playing one has
  `aria-pressed="true"`; axe passes on `/quran` in light and dark.
- Copying a verse's text (via `textContent`) still equals the displayed verse.

## Manual Checks (real browser)

`npm run build && npm run preview`

- Tap a word in 1:2, 2:101 and the last verse of 114: the right word is heard
  and highlighted; tapping another word stops the first; tapping the playing word stops it.
- Spot-check 10 verses across the Quran, including long ones (2:282) and the
  first and last words, for the right word being played.
- Verses on the exceptions list (if any) show no tappable words.
- Mobile and desktop widths, light and dark: the Arabic looks the same as
  before; the highlight and focus ring are visible; line breaks and card
  heights are unchanged; deep links (`/quran/2/282`) still land under the
  header.
- Reading mode and translation-only mode behave as before.
- Play a few words online, go offline (DevTools → Network → Offline): they
  play again from the cache; an unplayed word shows the "not available
  offline" message. Check Application → Cache Storage → `word-audio`.
- Safari/iOS (or WebKit) plays a word, online and from the cache.
- Keyboard: Tab reaches words, Enter/Space plays, focus is visible.
- Screen reader announces each word as a button and the error message.
- Axe with color contrast in a real browser, light and dark.
- `npm run verify:word-audio` finishes and the exceptions file is committed.

## Definition of Done

- Lint, type-check and tests pass; the manual checks above are ticked.
- `SOURCES.md` records the audio source, date and terms (license "to confirm"
  is allowed for development, not for a public release).
- Phase 13 is checked off in `specs/roadmap.md`.
- `CHANGELOG.md` is updated (changelog skill, `## Unreleased`).
- README, `tech-stack.md`, `mission.md` and `CLAUDE.md` are updated.
- The owner has reviewed and committed the work.
