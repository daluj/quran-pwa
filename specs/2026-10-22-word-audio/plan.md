# Word-by-Word Audio — Plan

## 1. Data

1. [x] `wordAudioUrl(surah, ayah, position)` and `splitWords(textArabic)` in
   `src/lib/words.ts` (zero-padded URL, pure, no DOM).
2. [x] `scripts/verify-word-audio.ts` + `npm run verify:word-audio`: for each
   verse, HEAD the last word and the word after it (with limited concurrency
   and retries); write mismatching verse keys to
   `src/data/word-audio-exceptions.json`; print a summary.
3. [x] Run the script, review the exceptions, commit the JSON.
4. [x] `data/raw/SOURCES.md` (new "Word audio" entry) and `src/data/sources.ts`:
   provider, URL pattern, date checked, terms; mark license "to confirm" if
   not found.

## 2. Logic

5. [x] `src/lib/wordAudio.ts`: one shared `Audio` element, each word downloaded with `fetch` and played from a blob URL, `playWord(key,
   position)`, `stopWord()`, a store with the playing `{ key, position }` and a
   status (`idle` | `loading` | `playing` | `error`), `useWordAudio()`
   (`useSyncExternalStore`). Tapping the playing word stops it; tapping
   another stops the first. Errors set a message; stops on `ended`.
6. [x] `vite.config.ts`: `workbox.runtimeCaching` for
   `https://audio.qurancdn.com/wbw/` (CacheFirst, `word-audio`, 1500 entries,
   30 days, cacheable status 200).
7. [x] Stop playback when leaving the Quran page or hiding the app.

## 3. UI

8. [x] `VerseCard`: render each word as a `<button>` with the displayed word as
   its text, separated by spaces; skip verses in the exceptions list; mark the
   playing word with `aria-pressed` and a highlight class.
9. [x] `src/styles/index.css`: unstyled word buttons (inherit font, no layout
   change), playing highlight in both themes, focus ring.
10. [x] Error/offline message in a polite live region near the feed (or a
    toast, whichever the app already uses); text says the word isn't saved
    offline yet.
11. [x] Check card heights against `estimateRowHeight` / the re-measure check in
    `QuranFeed.tsx`; adjust only if needed.
12. [x] Reading mode and translation-only: words are tappable in reading mode;
    nothing changes when the Arabic is hidden.

## 4. Docs

13. [x] `README.md`: mention word audio and the verification script.
14. [x] `specs/tech-stack.md`: runtime audio cache under Offline & PWA, the
    verification script under Data Pipeline, update the Gaps list.
15. [x] `specs/mission.md`: note that word audio exists and recitation audio
    was dropped from the roadmap.
16. [x] `CLAUDE.md`: add `npm run verify:word-audio` to Commands.

## 5. Tests

17. [x] `tests/words.test.ts`: URL padding, splitting, positions of known
    verses (2:101 has 22 words, last is `.../002_101_022.mp3`).
18. [x] `tests/wordAudio.test.ts`: fake `Audio`; one-at-a-time playback, state
    changes, error message, stop on unmount.
19. [x] `tests/app.test.tsx`: words render as buttons with the right names,
    tapping calls the player with the right key and position, exception
    verses render plain text, axe still passes.
