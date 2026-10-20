# Requirements: Project Setup

> Backfilled on 2026-10-20 from the original SPEC.md (phase 1), the code and
> commits `7d14c40`…`a30f590`.

## Scope

An installable, offline-capable app shell with all the Quran data loaded into
IndexedDB, and the three sections reachable from an X-style layout.

### Included

- Git repository on GitHub (`daluj/quran-pwa`, public), `main` branch,
  `.gitignore`, README, MIT LICENSE, GitHub Actions CI.
- Vite + React + TypeScript + Tailwind project with ESLint and Vitest.
- **Data build** (`scripts/build-quran-data.ts`): parse `data/raw/quran-uthmani.txt`
  and `data/raw/en.translation.txt` (Tanzil "Text (with aya numbers)":
  `surah|ayah|text`, `#` lines ignored), validate, and write `src/data/`:

  | File          | Content                                                                 |
  | ------------- | ----------------------------------------------------------------------- |
  | `verses.json` | `{ surah, ayah, key, textArabic, textArabicPlain, translation }` × 6,236 |
  | `surahs.json` | `{ number, verseCount, bismillah }` × 114                               |
  | `meta.json`   | `{ version, verseCount, surahCount, bismillah }`                        |

  Validation: 6,236 verses, 114 surahs, ayahs numbered 1..n without gaps, no
  duplicates, no empty text, the same keys in both files. Fails loudly.
- **IndexedDB** (Dexie): tables `verses`, `surahs`, `lists`, `listItems`,
  `bookmarks`, `settings`, `meta`. Seed verses and surahs on first launch;
  re-seed only when the data version changes.
- **Layout:** desktop left sidebar (Quran, Prayers, Explore, theme toggle),
  ~600px main column, right column; mobile bottom tab bar and sticky header.
- **Themes:** light/dark via CSS variables; default follows the system; the
  user's choice is saved and applied before first paint.
- **PWA:** manifest, icons, Workbox precache of the shell, font and Quran JSON.
- **Font:** Amiri Quran, bundled locally.

### Not included

Feed, lists, search and settings pages (later phases); placeholder pages only.

## Decisions

- **Strip Tanzil's Bismillah prefix** from verse 1 of surahs 2–114 (except 9)
  in the build script, matched ignoring diacritics (surahs 95 and 97 spell it
  with an extra shadda). The Bismillah shows once, in the surah header, and the
  Arabic matches the translation's verse boundaries. The raw file is untouched.
- **Data version = content hash** of the generated data, so any change to the
  text triggers a re-seed; user tables are never touched by seeding.
- **Generated JSON is committed** (reviewable diffs, one record per line) and
  regenerated before every build.
- **`textArabicPlain`** is the diacritic-free, letter-normalized Arabic used by
  search.
- **Verses JSON is fetched by URL** (not imported into the JS bundle) and
  precached; Workbox's size limit is raised to 8 MB.
- **Theme mirror in localStorage** only to avoid a flash before IndexedDB is
  read; IndexedDB is the source of truth.

## Context

- Mission: offline-first and private; faithful, credited text
  (see [mission.md](../mission.md)).
- Stack: see [tech-stack.md](../tech-stack.md).
- Sources and licenses: `data/raw/SOURCES.md` (Tanzil CC BY 3.0; translation
  details still placeholders).
