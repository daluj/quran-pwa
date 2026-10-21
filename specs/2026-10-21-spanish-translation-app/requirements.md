# Spanish Translation in the App — Requirements

## Scope

The app can show either the English or the Spanish translation. A new
"Translation language" setting chooses which one every screen uses. The Spanish
text is `data/raw/es.translation.txt` (see
[2026-10-21-spanish-translation](../2026-10-21-spanish-translation/)); the app's
own labels stay in English.

### Included

- **Data:** the build script reads both translation files, validates them
  against the Arabic, and writes both into every verse of `verses.json`.
- **Setting:** `translationLanguage` (`'en'` | `'es'`, default `'en'`), in
  Settings, backups and the settings table.
- **Displays:** the feed, list pages and search results show the chosen
  translation.
- **Search:** a Latin-script query searches the chosen translation (accents and
  case ignored, so `oracion` finds *oración*). Arabic queries are unchanged.
- **Settings page:** the translation switches become language-neutral, and the
  Sources section credits the chosen translation, labelling the Spanish one as
  an unreviewed machine translation.

| Where | Before | After |
| --- | --- | --- |
| Switch | Show English translation | Show translation |
| Switch | Only show English translation | Only show translation |
| Lock note | Always shown while only the English is shown. | Always shown while only the translation is shown. |
| New select | — | Translation language: English / Español |

### Not included

- Translating the app's interface (buttons, settings, messages) into Spanish.
- A third language, or showing both translations at once.
- Renaming the stored keys `showTranslation` / `englishOnly` (see Decisions).
- Reviewing the Spanish text (still open in Phase 11).
- Spanish names for default prayer topics and collections.

## Decisions

- **Both translations in every verse, precached.** `Verse.translation: string`
  becomes `Verse.translations: { en: string; es: string }`. One seed, instant
  switching, works offline with no extra download logic. The precache grows by
  about 0.9 MB (the Spanish text, before compression), and the data hash
  changes, so every install re-seeds once; user tables are untouched. The
  alternative (a separate lazy-loaded table) was rejected as more code and a
  schema migration for little saving.
- **No Dexie schema change.** `verses` is indexed by `key`, `surah` and
  `[surah+ayah]` only, so the new field needs no version bump.
- **Setting keys keep their names.** `showTranslation` and `englishOnly` are
  stored in IndexedDB and in backup files; renaming them would need a
  migration for no user-visible gain. Only the labels change, and a comment on
  `englishOnly` records that it now means "translation only".
- **Language validated by one list.** `TRANSLATION_LANGUAGES` (`en`, `es`
  with their display names) is used by the build script's types, the setting,
  `validateBackup` and the select, so a new language is one entry plus a file.
- **Display names are in their own language** ("English", "Español"), so the
  select is readable whichever is active.
- **Selectable, labelled, English by default.** The Spanish text has no
  external source or license (it was made for this project) and is unreviewed.
  Per the mission it must not look authoritative: Settings shows the status
  note while Spanish is selected, and `SOURCES.md` records it.
- **`lang` attribute.** Translation paragraphs get `lang="es"` when Spanish is
  chosen (screen readers, hyphenation). The page language stays `en`.
- **Search normalization is reused.** `normalizeLatin` already lowercases and
  strips accents, which fits Spanish; `ñ` therefore matches `n`. Accepted: it
  only widens matches.
- **Search index per language.** The cached index in `useSearch` is keyed by
  feed and language, so switching rebuilds it once (a few ms).
- **Row height estimate** in `QuranFeed.tsx` uses the length of the chosen
  translation. Spanish text is about the same length as the English (the files
  differ by under 1%), so the estimate constants stay; the re-measure check
  must also run when the language changes.
- **Older backups** load with `translationLanguage: 'en'`; an unknown value in
  a backup falls back to the default.

## Context

- [mission.md](../mission.md): Spanish readers; faithful, credited text.
- [tech-stack.md](../tech-stack.md): data pipeline and the Gaps list (the
  translation-source gap already covers the English placeholder).
- Code: `scripts/quran-data.ts` (`buildDataset`), `scripts/build-quran-data.ts`,
  `src/data/types.ts`, `src/data/sources.ts`, `src/db/db.ts`,
  `src/db/settings.ts`, `src/db/backup.ts`, `src/lib/search.ts`,
  `src/features/explore/useSearch.ts`, `SearchResults.tsx`, `VerseCard.tsx`,
  `QuranFeed.tsx`, `ListDetailPage.tsx`, `SettingsPage.tsx`.
- Pattern to follow: [2026-10-18-english-only](../2026-10-18-english-only/)
  (a setting threaded through the feed, lists and search).
