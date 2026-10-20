# Requirements: Surahs by Number Only

> Backfilled on 2026-10-20 from the owner's request after phase 2 and commit
> `640d52c`.

## Scope

Remove surah names from the whole app. Surahs are identified only by number.

### Included

- Generated data: `surahs.json` has `number`, `verseCount`, `bismillah`; no
  `name`. The transliterated names list and its build step are removed.
- UI wording:

  | Place                   | Shows                         |
  | ----------------------- | ----------------------------- |
  | Sticky header (Quran)   | "Surah 2" · "286 verses"      |
  | Surah header in feed    | number badge, "Surah 2", verse count, Bismillah |
  | Verse card title line   | "Surah 2 · 2:255"             |
  | Right column surah list | "Surah 2" · "286 verses"      |
  | Continue pills          | verse key, e.g. "36:58"       |
  | Invalid reference       | "Surah 1 has 7 verses, so 1:8 doesn't exist." |

- Accessible names use numbers too ("Surah 2, verse 255").

## Decisions

- Applies everywhere, now and in future phases: no transliterated or Arabic
  names in the UI, data, exports or messages.
- Changing the generated data changes the data version, so existing installs
  re-seed `surahs`; user data is unaffected.

## Context

- Mission principle "Respectful and simple" ([mission.md](../mission.md)).
- Also recorded in `CLAUDE.md` so agents don't reintroduce names.
