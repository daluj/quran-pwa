# Spanish Translation in the App — Plan

## 1. Data

1. [x] `TRANSLATION_LANGUAGES` and `TranslationLanguage` in `src/data/types.ts`
   (`en` → English, `es` → Español); `Verse.translations: Record<TranslationLanguage, string>`
   replaces `Verse.translation`.
2. [x] `buildDataset` takes both translation files, validates each with
   `parseTanzil` (named `en.translation.txt` / `es.translation.txt`) and
   against the Arabic, and fills `translations`.
3. [x] `scripts/build-quran-data.ts` reads `es.translation.txt`; run
   `npm run data` and commit the regenerated `src/data/` (new version hash).
4. [x] `SOURCES` in `src/data/sources.ts` becomes per-language
   (`translations: { en, es }`); `data/raw/SOURCES.md`: drop "Not used by the
   app yet" from the Spanish entry.

## 2. Setting

5. [x] `translationLanguage` in `Settings` and `DEFAULT_SETTINGS` (`'en'`);
   comment on `englishOnly` noting it now means "translation only".
6. [x] `validateBackup` accepts a known language, ignores anything else;
   older backups default to `'en'`.
7. [x] Display code reads `verse.translations[translationLanguage]` from
   `useSettings()` (no helper: only a few call sites).

## 3. Search

8. [x] `buildSearchIndex(verses, language)` indexes the chosen translation.
9. [x] `useSearch` caches the index per feed and language.

## 4. UI

10. [x] `VerseCard`, `ListDetailPage` and `SearchResults` show the chosen
    translation (with `lang`), including highlighting; the "in the
    translation" message stays correct.
11. [x] `QuranFeed`: height estimate uses the chosen translation, and the
    re-measure check runs when the language changes (keeps the top verse).
12. [x] `SettingsPage`: "Translation language" select; switches renamed to
    "Show translation" / "Only show translation" with the new lock note.
13. [x] Sources section shows the chosen translation's name, translator and
    license, plus, for Spanish, the status note: made for this project by
    Claude from the Arabic; machine translation, not yet reviewed by a
    qualified reader of Arabic.

## 5. Docs

14. [x] `README.md`: Spanish translation and language setting; data pipeline
    now reads two translations.
15. [x] `specs/tech-stack.md`: Data Pipeline (two translations,
    `translations` per verse), Testing, and Gaps (Spanish unreviewed;
    precache size).
16. [x] `CLAUDE.md`: architecture line about the pipeline if it mentions one
    translation; setting checklist unchanged.
17. [x] `specs/roadmap.md`: tick Phase 12; `CHANGELOG.md` via the `changelog`
    skill.

## 6. Tests

18. [x] Update fixtures and tests that use `verse.translation`
    (`tests/quran-data.test.ts`, `search.test.ts`, `seed.test.ts`,
    `app.test.tsx`).
19. [x] New tests listed in [`validation.md`](validation.md).
