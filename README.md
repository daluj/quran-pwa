# Quran PWA

An offline-first Progressive Web App for reading the Quran, saving verses into
personal collections, and organizing verses used in prayer (du'a) by topic. The
layout follows the feed / lists / explore patterns of X.com, with its own
branding.

Everything runs on the device: no backend, no accounts. After the first visit
the app works fully offline and can be installed on Android, iOS and desktop.

See [SPEC.md](SPEC.md) for the full specification.

## Features

- **Quran:** all 6,236 verses as a virtualized feed with surah headers and
  the Bismillah. Each verse can be saved to collections or prayer topics and
  marked as last read or last recited, with "Continue reading/reciting"
  shortcuts. Deep links (`/quran/2/255`) scroll to the verse and highlight it.
  The scroll position is kept when switching tabs.
- **Prayers:** prayer topics (six defaults, all editable) holding verses that
  can be reordered, removed or opened in the Quran.
- **Explore:** go to a reference (`25:43`, `25 43`, `25`) or search the
  Arabic (ignoring diacritics, alif forms, ta marbuta / ha, alif maqsura / ya,
  and Uthmani spelling differences) or the translation, with matches
  highlighted. Collections are listed below.
- **Settings:** theme (system / light / dark), translation on/off, Arabic
  text size, and JSON backup export/import.

## Tech stack

React + TypeScript (Vite), `vite-plugin-pwa` (Workbox), Dexie.js (IndexedDB),
Tailwind CSS, React Router, `@tanstack/react-virtual`, Vitest.

## Getting started

Requires Node.js 20 or later.

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
| `npm test`          | Run unit, component and accessibility (axe) tests               |
| `npm run lint`      | Lint                                                            |
| `npm run typecheck` | Type-check                                                      |
| `npm run icons`     | Regenerate PWA icons from `public/favicon.svg`                  |

The service worker only runs in the production build: use `npm run build`
and `npm run preview` to try offline mode and installation. When a new
version is deployed, the app shows an "Update" prompt instead of reloading
on its own.

## Project structure

```
data/raw/            Raw Tanzil files (never edited) and SOURCES.md
scripts/             build-quran-data.ts: parses, validates, writes src/data/
src/
  app/               Router, root layout, data loading
  components/        Layout (sidebar, tab bar, header), dialog, shared bits
  data/              Generated Quran JSON and its types
  db/                Dexie schema, seeding, lists, bookmarks, settings, backups
  features/          quran/, prayers/, explore/, lists/, settings/
  lib/               Arabic normalization, reference parsing, search
  styles/            Tailwind and theme tokens
  theme/             Light/dark theme provider
tests/               Vitest tests
```

## Data

- **Arabic:** [Tanzil Project](https://tanzil.net) Uthmani text (v1.1),
  CC BY 3.0 — `data/raw/quran-uthmani.txt`
- **English translation:** `data/raw/en.translation.txt`
  (**source and license still to be filled in** in `data/raw/SOURCES.md` and
  `src/data/sources.ts`)

`scripts/build-quran-data.ts` validates both files (6,236 verses, 114 surahs,
no gaps, duplicates or empty text), removes the Bismillah that Tanzil prefixes
to verse 1 of surahs 2–114 (except 9), and writes `src/data/`. A content hash
is stored as the data version; when it changes, the app re-seeds IndexedDB on
the next launch without touching user data.

User data (lists, bookmarks, settings) lives only in the browser's IndexedDB.
The app asks the browser for persistent storage, and Settings offers backup
export and import.

## License

Application code: [MIT](LICENSE). The Quran text and translation keep their own
licenses (see `data/raw/SOURCES.md`).
