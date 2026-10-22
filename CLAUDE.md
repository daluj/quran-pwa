# CLAUDE.md

Offline-first Quran reading PWA (React + TypeScript + Vite, Dexie/IndexedDB,
Tailwind, Workbox). No backend, no accounts: everything lives on the device.
The project is spec-driven: [`specs/`](specs/) is the source of truth for what
the app does and why. [README.md](README.md) covers setup and structure.

## Specs

- [`specs/mission.md`](specs/mission.md): purpose, audience, principles.
- [`specs/tech-stack.md`](specs/tech-stack.md): stack, tooling, known gaps.
- [`specs/roadmap.md`](specs/roadmap.md): small phases with checkboxes; each
  links to its spec folder.
- `specs/YYYY-MM-DD-<feature>/`: `requirements.md` (scope, decisions,
  context), `plan.md` (numbered task groups), `validation.md` (checks and
  definition of done).

## Spec-driven workflow

1. **Spec first.** For new work, use the `feature-spec` skill (`/feature-spec`):
   it finds the next roadmap phase, interviews the owner (3 grouped
   questions) and writes the spec folder. Don't write code before the owner
   approves the spec.
2. **Implement** the plan group by group, checking off `[ ]` tasks in
   `plan.md` as they're done.
3. **Keep the spec true.** If a decision changes while implementing, update
   `requirements.md` / `plan.md` first, then the code.
4. **Validate** against `validation.md`: `/verify`, the specific tests, and the
   manual browser checks. Tick each item.
5. **Close the phase:** check it off in `roadmap.md`, update `CHANGELOG.md`
   (`changelog` skill, `## Unreleased`), and update `tech-stack.md`, README or
   this file if the stack or conventions changed.
6. **Hand over:** summarize and suggest a commit message; the owner reviews
   and commits.
7. **Replan** when priorities change: edit `roadmap.md` (keep phases small).

Small fixes that don't change behaviour don't need a spec folder.

## Workflow rules

- **Never commit or push.** Leave changes in the working tree; the owner
  reviews and commits. Suggest a Conventional Commits message instead
  (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
- Before saying a change is done, run `npm run lint`, `npm run typecheck` and
  `npm test` (or `/verify`, which also builds). For UI changes, also check it
  in the browser (`npm run build && npm run preview`).
- Keep `specs/` and README.md in sync when behaviour changes.

## Commands

```bash
npm run dev          # dev server (no service worker)
npm run build        # regenerate data, type-check, production build
npm run preview      # serve dist/ (service worker, offline, install)
npm test             # Vitest: unit, jsdom app tests, axe accessibility
npx vitest run tests/search.test.ts   # one file
npm run lint
npm run typecheck
npm run data         # rebuild src/data/*.json from data/raw/
npm run verify:word-audio  # check word counts against the audio CDN (network, ~6 min)
```

## Architecture

- `scripts/build-quran-data.ts` (+ pure logic in `scripts/quran-data.ts`)
  validates `data/raw/*.txt` and writes `src/data/verses.json`, `surahs.json`,
  `meta.json`. The generated JSON is committed; CI fails if it's stale.
- `src/db/`: Dexie schema (`db.ts`), first-launch seeding (`seed.ts`, `init.ts`),
  lists, bookmarks, settings and backups. Verses/surahs are re-seeded when the
  data hash changes; user tables (`lists`, `listItems`, `bookmarks`,
  `settings`, `wordAudioDownloads`) are never touched by seeding. Downloaded
  word audio lives in Cache Storage (`word-audio-offline`), summarized by
  `wordAudioDownloads`; backups carry the surah numbers, never the audio.
- `src/features/`: `quran/` (virtualized feed), `lists/` (shared list pages and
  save sheet), `prayers/`, `explore/` (search), `settings/`.
- `src/lib/`: Arabic normalization (`arabic.ts`), reference parsing
  (`reference.ts`), search and highlighting (`search.ts`), word splitting and
  audio URLs (`words.ts`), the word audio player (`wordAudio.ts`).
- Providers (in `main.tsx`): `ThemeProvider` → `SettingsProvider` (settings
  load before anything renders) → `DataProvider` (seeding status) → router.

## Conventions and gotchas

- **Surahs are shown by number only** ("Surah 2", "2:255"). Never add surah
  names (transliterated or Arabic) anywhere in the UI or data.
- **Never edit `data/raw/`.** Change the build script and run `npm run data`.
  `normalizeArabic` output is baked into `textArabicPlain`: after touching
  `src/lib/arabic.ts`, `npm run data` must report the same version hash unless
  the change is intended.
- **Default lists** (prayer topics and collections created on first launch)
  live in `src/data/default-lists.json`, one list per line. Tests check every
  verse key exists and isn't repeated within a list.
- **Arabic in code:** write code points in regexes and string literals as
  `\uXXXX` escapes, not literal characters (combining marks are invisible and
  break lint). Some tooling converts escapes to literals when writing files;
  check with `grep -nP '[\x{0600}-\x{06FF}]' src/lib/*.ts` (only comments,
  which may show Arabic examples, should match).
- **Adding a setting:** add it to `Settings` and `DEFAULT_SETTINGS`
  (`src/db/db.ts`), accept it in `validateBackup` (`src/db/backup.ts`, older
  backups must still load), add the control in `SettingsPage.tsx`, and cover
  backups in `tests/backup.test.ts`. Read settings with `useSettings()` /
  `useTextVisibility()`.
- **Quran feed layout:** if something changes a verse card's height, update
  `estimateRowHeight` and the re-measure check in `QuranFeed.tsx`, so deep
  links still land under the header.
- **Accessibility:** icon-only buttons need `aria-label`; when a control has
  visible text, its accessible name must contain it (axe
  `label-content-name-mismatch`). Run the axe tests after UI changes.
- **Style:** 2-space indent, no semicolons, single quotes, ~120 columns.
  Comments explain why, not what.

## Testing notes

- `tests/app.test.tsx` renders the whole app in jsdom with fake IndexedDB and
  fakes for layout (row heights, scroll, `scrollHeight`), `ResizeObserver`,
  `matchMedia` and `<dialog>`. jsdom can't confirm that far deep links land
  exactly; check those in a real browser.
- The service worker only exists in the production build: use
  `npm run build && npm run preview` for offline and update-prompt checks.
- `.claude/launch.json` has a `preview-fresh` server on another port: a new
  origin, so it starts with an empty database (first-launch seeding).
