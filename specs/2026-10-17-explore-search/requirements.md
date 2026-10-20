# Requirements: Explore Search

> Backfilled on 2026-10-20 from the original SPEC.md (section 7, phase 4), the
> code and commits `85356b1`, `0f1a6c1`, `3443b79`.

## Scope

Find verses from the Explore section by reference or by text, with
highlighted results; show the user's collections below the search.

### Included

- **Search box** in the Explore header; the query is kept in the URL
  (`/explore?q=…`, debounced) so back/forward and links work.
- **References:** `25:43`, `25 43`, `25.43`, `25/43`, `25-43`, `25` (whole
  surah), Arabic-Indic digits too. A valid one shows "Go to 25:43"; Enter goes
  straight there. An invalid one explains why ("Surah 114 has 6 verses…").
- **Full-text search:** Arabic queries search the Arabic, everything else the
  translation. A verse matches when it contains every word. Results are in
  Quran order, 30 at a time with "Show more", with a count.
- **Arabic matching** ignores diacritics and unifies alif forms (أ إ آ ٱ → ا),
  ta marbuta / ha (ة → ه) and alif maqsura / ya (ى → ي).
- **Uthmani spelling:** a typed alif also matches a dagger alif, and hamza
  marks are optional, so "العالمين" finds "ٱلْعَٰلَمِينَ" and "يسألونك"
  finds "يَسْـَٔلُونَكَ".
- **Translation matching** is case- and accent-insensitive.
- **Highlights** mark the match in the original text (whole words in Arabic);
  each result opens the verse in the Quran feed.
- **Collections** list below the search when the box is empty.
- The right-column search box is hidden on Explore and jumps straight to valid
  references elsewhere.

## Decisions

- **Character-by-character normalization with an index map** back to the
  original text, so highlights land on the right characters;
  `normalizeArabic` is defined through the same map (the generated data stayed
  byte-identical, same data version).
- **Dagger alif and hamzas become an "optional letter" placeholder;** search
  patterns let a typed alif match it and let it appear between typed letters.
  A typed alif must still match something, so "قال" doesn't match "قل".
  (Dropping alifs entirely was rejected for that reason.)
- **Arabic highlights widen to whole words:** marking part of a word would
  split its joined letters and diacritics. Marks change only the background.
- **Search runs in memory** over a normalized index built once per feed.
- **Arabic code points are written as `\uXXXX` escapes** in code.

## Context

- Mission: "Search finds a verse whether it's typed in everyday or Uthmani
  spelling" ([mission.md](../mission.md)).
- Code: `src/lib/arabic.ts`, `src/lib/reference.ts`, `src/lib/search.ts`,
  `src/features/explore/`.
