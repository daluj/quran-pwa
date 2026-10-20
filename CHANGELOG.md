# Changelog

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
