# Changelog

## 2026-10-22

- Keep the "Mark as last read" button in reading mode, under the verse number, so you can still save where you left off

## 2026-10-22

- Add offline word audio: download a whole surah's word audio from Settings (progress, cancel, resume, remove), kept in its own cache; backups remember which surahs were downloaded

## 2026-10-22

- Add word-by-word audio: tap an Arabic word in the Quran feed to hear it, tap again to stop; words you have played work offline
- Add `npm run verify:word-audio`, which lists the six verses whose word count differs from the audio, and credit the audio in Settings and `SOURCES.md`

## 2026-10-22

- Show the Arabic in the KFGQPC Uthmanic Hafs font (as Quran.com does), fixing misplaced marks in verses such as 2:104

## 2026-10-21

- Add a translation language setting (English or Spanish) that applies to the feed, lists and search, included in backups
- Rename the translation switches to "Show translation" and "Only show translation"
- Credit the chosen translation in Settings, noting that the Spanish one is unreviewed

## 2026-10-21

- Add a Spanish (Spain) translation made from the Arabic (`data/raw/es.translation.txt`), with its guidelines, decisions and contested verses in `specs/2026-10-21-spanish-translation/`; not shown in the app yet

## 2026-10-20

- Adopt spec-driven development: constitution (mission, tech stack, roadmap) and a spec folder per phase in `specs/`
- Add `feature-spec` and `changelog` skills and this changelog
- Retire `SPEC.md` in favour of `specs/`

## 2026-10-18

- Add CLAUDE.md and shared Claude Code settings; update SPEC and README
- Add a reading mode setting
- Add an option to show only the English translation
- Fill the empty default collections
- Ship default prayer topics and collections with their verses

## 2026-10-17

- Describe features, structure and data handling in the README
- Fix accessibility issues found by axe in the browser
- Ask before applying app updates; load settings before first render
- Add settings page with theme, translation, Arabic size and backups
- Add backup export, validation and restore
- Add Explore search with references, highlighted results and collections
- Write Arabic code points in regexes as escapes
- Add verse reference parsing and Arabic-normalized search engine
- Give dialogs a visible edge and X-style backdrop in dark mode
- Add prayer topic and collection pages with editing
- Add save sheets for collections and prayer topics
- Add lists data layer for collections and prayer topics
- Show surahs by number only, removing surah names
- Cover feed rendering, deep links, bookmarks and scroll restore
- Virtualized Quran feed with surah headers, deep links and bookmarks
- Add bookmark helpers and Quran feed model with deep-link validation
- Add transliterated surah names to generated surah metadata
- Add app shell smoke test and dedupe precache entries
- Add GitHub Actions workflow for lint, type-check, tests and build
- Fix lint: escaped BOM in the parser and its test
- Configure PWA manifest, icons and offline precaching
- Add X-style layout shell with navigation, light/dark themes and Amiri Quran font
- Add IndexedDB schema and first-launch seeding with Dexie
- Add Quran data build script with validation and tests
- Scaffold Vite + React + TypeScript project with tooling
- Initialize repository with spec, raw Quran data, README and license
