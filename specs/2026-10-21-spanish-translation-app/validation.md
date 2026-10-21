# Spanish Translation in the App — Validation

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0 (or `/verify`,
  which also builds)
- [x] `npm run data` is idempotent: a second run leaves `src/data/` unchanged,
  and CI's "generated data is committed" check passes

### Specific test coverage required

- [x] Build: `buildDataset` fills `translations.en` and `translations.es` for
  all 6236 verses; a missing, duplicate or extra verse in either file fails
  with a message naming the file
- [x] Data: `es.translation.txt` has no text in brackets or parentheses
  (guideline 6) and keeps 1:1 as the Bismillah
- [x] Backup: `translationLanguage` is exported and restored; an older backup
  loads as `'en'`; an unknown value (`'fr'`, a number) falls back to `'en'`
- [x] Settings: default is `'en'`; `getSettings` returns a stored `'es'`
- [x] Search: with `'es'`, `oracion` finds verses whose Spanish text has
  *oración*, case and accents ignored; with `'en'` the same query searches the
  English; Arabic queries return the same results in both languages
- [x] Search highlighting marks the matched Spanish words, including accented
  letters
- [x] App test: switching to Spanish in Settings changes the text in the feed
  (e.g. 1:2), a list page and search results; switching back restores English
- [x] App test: with "Only show translation" on and Spanish selected, the feed
  shows Spanish and no Arabic
- [x] App test: Spanish translation paragraphs carry `lang="es"`
- [x] Seeding: an install with the previous data version re-seeds once and
  keeps lists, bookmarks and settings
- [ ] axe passes on Settings (select has an accessible name that contains its
  visible text) and on the feed in Spanish

## Manual Checks (real browser)

Run `npm run build && npm run preview`.

- [ ] First launch (`preview-fresh`): English by default; choosing Español
  switches the feed, a prayer topic and Explore results without a reload
- [ ] Existing profile (`preview`, with lists and a last-read bookmark): after
  the update prompt, lists, bookmarks and settings are intact and the language
  is English
- [ ] Offline (DevTools offline, reload): Spanish still works, and the offline
  precache includes the larger `verses.json`
- [x] Deep link `/quran/2/255` in Spanish lands under the header with the
  verse highlighted; the feed doesn't jump when the language changes
- [ ] Settings shows the unreviewed-translation note only while Spanish is
  selected, and the credited English source otherwise
- [ ] Export a backup in Spanish, change to English, import: Spanish is back
- [ ] Mobile and desktop widths, light and dark mode; axe with color contrast
  on Settings and the feed
- [ ] Spanish `¿` `¡` `«»` and accents render correctly in the feed font

## Definition of Done

All checks above pass, the roadmap Phase 12 is checked off, `CHANGELOG.md` is
updated (changelog skill), README and `tech-stack.md` match the code, and the
owner has reviewed and committed the work.
