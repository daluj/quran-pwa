# Quran PWA

An offline-first Progressive Web App for reading the Quran, saving verses into
personal collections, and organizing verses used in prayer (du'a) by topic. The
layout follows the feed / lists / explore patterns of X.com, with its own
branding.

Everything runs on the device: no backend, no accounts. After the first visit
the app works fully offline and can be installed on Android, iOS and desktop.

The project is built spec-first: [specs/](specs/) holds the mission, tech
stack, roadmap and a spec for every feature (see
[Spec-driven development](#spec-driven-development)).

## Features

- **Quran:** all 6,236 verses as a virtualized feed with surah headers and
  the Bismillah. Surahs are identified by number ("Surah 2"). Each verse can
  be saved to collections or prayer topics and marked as last read or last
  recited, with "Continue reading/reciting" shortcuts. Deep links
  (`/quran/2/255`) scroll to the verse and highlight it. The scroll position
  is kept when switching tabs. Tap an Arabic word to hear it (word-by-word
  audio from Quran.com's CDN); tap it again to stop. Words you have played
  keep working offline, and Settings can download a whole surah's word audio
  (progress, cancel, resume, remove) so every word works without a connection.
- **Prayers:** prayer topics holding verses that can be reordered, removed or
  opened in the Quran. Seven topics come with verses (Forgiveness, Guidance,
  Protection, Gratitude, Patience, Provisions, Knowledge); all can be renamed
  or deleted.
- **Explore:** go to a reference (`25:43`, `25 43`, `25`) or search the
  Arabic (ignoring diacritics, alif forms, ta marbuta / ha, alif maqsura / ya,
  and Uthmani spelling differences) or the translation, with matches
  highlighted. Collections are listed below; twelve come with verses.
- **Settings:** theme (system / light / dark), translation language (English
  or Spanish), translation on/off, translation only (hides the Arabic), reading mode (only the verse number, text and the last-read bookmark),
  Arabic text size, and JSON backup export/import.

## Tech stack

React + TypeScript (Vite), `vite-plugin-pwa` (Workbox), Dexie.js (IndexedDB),
Tailwind CSS, React Router, `@tanstack/react-virtual`, Vitest.

## Getting started

Requires Node.js 20.19+ or 22+.

```bash
npm install
npm run dev
```

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Start the dev server                                            |
| `npm run build`     | Regenerate Quran data, type-check and build for production      |
| `npm run preview`   | Serve the production build (use this to test offline / install) |
| `npm run data`      | Rebuild `src/data/*.json` from `data/raw/`                      |
| `npm run verify:word-audio` | Check word counts against the audio CDN (network, ~6 min) |
| `npm test`          | Run unit, component and accessibility (axe) tests               |
| `npm run lint`      | Lint                                                            |
| `npm run typecheck` | Type-check                                                      |
| `npm run icons`     | Regenerate PWA icons from `public/favicon.svg`                  |

The service worker only runs in the production build: use `npm run build`
and `npm run preview` to try offline mode and installation. When a new
version is deployed, the app shows an "Update" prompt instead of reloading
on its own.

CI (GitHub Actions) runs lint, type-check, tests and the build on every push,
and fails if the generated `src/data/` is out of date.

## Deploying

It's a static site. On Cloudflare Pages (or any static host):

| Setting                | Value           |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Node version           | 22 (`NODE_VERSION=22` on Cloudflare Pages) |

Unknown paths must serve `index.html` (single-page app). Cloudflare Pages does
this automatically when the output has no `404.html`.

## Project structure

```
specs/               Mission, tech stack, roadmap, and a spec folder per feature
data/raw/            Raw Tanzil files (never edited) and SOURCES.md
scripts/             build-quran-data.ts: parses, validates, writes src/data/;
                     verify-word-audio.ts: checks word audio against the CDN
src/
  app/               Router, root layout, data loading
  components/        Layout (sidebar, tab bar, header), dialog, shared bits
  data/              Generated Quran JSON, default lists, types, sources
  db/                Dexie schema, seeding, lists, bookmarks, settings, backups
  features/          quran/, prayers/, explore/, lists/, settings/
  lib/               Arabic normalization, reference parsing, search, word audio
                     (player, surah downloads)
  styles/            Tailwind and theme tokens
  theme/             Light/dark theme provider
tests/               Vitest tests
.claude/             Shared Claude Code settings, commands and skills
CLAUDE.md            Instructions for Claude Code
CHANGELOG.md         Changes by date
```

## Data

- **Arabic:** [Tanzil Project](https://tanzil.net) Uthmani text (v1.1),
  CC BY 3.0 — `data/raw/quran-uthmani.txt`
- **English translation:** `data/raw/en.translation.txt`
  (**source and license still to be filled in** in `data/raw/SOURCES.md` and
  `src/data/sources.ts`)
- **Spanish translation:** `data/raw/es.translation.txt`, made from the Arabic
  for this project (machine translation, not yet reviewed by a qualified
  reader of Arabic); guidelines and decisions in
  `specs/2026-10-21-spanish-translation/`

`scripts/build-quran-data.ts` validates all three files (6,236 verses, 114 surahs,
no gaps, duplicates or empty text), removes the Bismillah that Tanzil prefixes
to verse 1 of surahs 2–114 (except 9), and writes `src/data/` with both translations in every verse (`translations.en`,
`translations.es`). A content hash
is stored as the data version; when it changes, the app re-seeds IndexedDB on
the next launch without touching user data.

The default prayer topics and collections, with their verses, are defined in
`src/data/default-lists.json` and created on first launch. Tests check that
every verse in it exists.

- **Word audio:** one MP3 per word from Quran.com's CDN
  (`audio.qurancdn.com/wbw/`), played on demand and cached in the browser;
  license still to confirm in `data/raw/SOURCES.md`. Downloaded surahs are kept
  in their own cache (`word-audio-offline`); backups remember which surahs
  were downloaded, not the audio. Six verses whose word
  count differs from the audio are in `src/data/word-audio-exceptions.json`.

User data (lists, bookmarks, settings) lives only in the browser's IndexedDB.
The app asks the browser for persistent storage, and Settings offers backup
export and import.

## Spec-driven development

The project follows spec-driven development as taught in DeepLearning.AI's
[Spec-Driven Development with Coding Agents](https://www.deeplearning.ai/courses/spec-driven-development-with-coding-agents):
specs in Markdown say what to build before any code is written, so coding
agents implement the intended behaviour and the context survives between
sessions.

```
specs/
  mission.md                    Why the app exists, for whom, principles
  tech-stack.md                 Stack, tooling, known gaps
  roadmap.md                    Small phases with checkboxes, linking to their specs
  YYYY-MM-DD-<feature>/
    requirements.md             Scope, decisions, context
    plan.md                     Numbered task groups
    validation.md               Automated and manual checks, definition of done
```

The cycle for each roadmap phase:

1. **Spec:** `/feature-spec` in Claude Code picks the next phase, asks three
   questions (scope, decisions, context) and writes the spec folder.
2. **Implement** the plan's task groups, keeping the spec up to date.
3. **Validate** with `validation.md` (`/verify` plus manual browser checks).
4. **Close:** check the phase off in the roadmap, update
   [CHANGELOG.md](CHANGELOG.md) (`/changelog`), review and commit.
5. **Replan** the roadmap when priorities change.

Phases 1–9 were built before this workflow; their specs were backfilled from
the original spec and the commits.

## Working with Claude Code

[CLAUDE.md](CLAUDE.md) gives Claude Code the project's commands, architecture,
conventions (surahs by number only, never editing `data/raw/`, Arabic
escapes, how to add a setting) and the spec-driven workflow.

- `.claude/settings.json` allows the usual checks and blocks `git commit` /
  `git push`: changes are left for review and committed by hand.
- `/verify` runs lint, type-check, tests, build and a stale-data check.
- Skills: `feature-spec` (start the next phase from a spec) and `changelog`
  (update `CHANGELOG.md` from git history).
- Personal overrides go in `.claude/settings.local.json` or `CLAUDE.local.md`
  (both git-ignored).

## License

Application code: [MIT](LICENSE). The Quran text and translation keep their own
licenses (see `data/raw/SOURCES.md`).
