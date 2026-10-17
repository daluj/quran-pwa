# Quran PWA — Project Spec
## 1. Goal
Build an offline-first Progressive Web App for reading the Quran, saving verses into personal collections, and organizing verses used in prayer (du'a) by topic. The interface follows the layout and interaction patterns of X.com (feed, lists, explore), with its own branding (no X logos, names or assets).

## 2. Tech stack
- **Framework:** React + TypeScript, built with Vite
- **PWA:** `vite-plugin-pwa` (Workbox) — precache the app shell, fonts and all Quran data so the app works fully offline after the first load
- **Storage:** IndexedDB via Dexie.js
- **Styling:** Tailwind CSS, with light/dark themes via CSS variables
- **Routing:** React Router
- **Testing:** Vitest for logic (search, reference parsing, DB layer)
- No backend. No user accounts. Everything is local to the device.

## 3. Quran data
- **Source:** Tanzil.net Uthmani text, bundled as static JSON in the repo
- **Translation:** one English translation shown under each verse
  - **Input format:** Tanzil's "Text (with aya numbers)" format — a plain UTF-8 `.txt` file with exactly one line per verse (6,236 lines), each line `surah|ayah|text`, e.g.:
    ```
    1|1|In the name of Allah, the Entirely Merciful, the Especially Merciful.
    1|2|[All] praise is [due] to Allah, Lord of the worlds -
    ```
  - Same format for the Arabic Uthmani text from Tanzil, so both files can be merged line by line.
  - Raw files live in `data/raw/` (e.g. `quran-uthmani.txt`, `en.translation.txt`) and are never edited by hand after import. Lines starting with `#` (Tanzil's license footer) are ignored.
  - A build script (`scripts/build-quran-data.ts`) parses both files, validates them (6,236 verses, 114 surahs, no missing or duplicate `surah:ayah`, no empty text) and generates the bundled JSON in `src/data/`. The script fails loudly if validation fails.
  - Keep the translation's name, translator and source/license in `data/raw/SOURCES.md`.
- On first launch, load the bundled JSON into IndexedDB. Track a data version so future updates can re-seed.
- Arabic text: right-to-left, rendered with a proper Quranic font (e.g. KFGQPC Uthmani or Amiri Quran), bundled locally.
- Each verse record: `surah`, `ayah`, `key` ("2:255"), `textArabic`, `textArabicPlain` (no diacritics, for search), `translation`.
- Surah metadata: number, verse count.

## 4. Layout (X.com-style)
- **Desktop:** left sidebar with the three nav items and theme toggle; centered main column (~600px); optional right column (e.g. surah list or search box).
- **Mobile:** bottom tab bar with the three nav items; top header with the current surah name.
- Three main sections:
  1. **Quran**
  2. **Prayers**
  3. **Explore**
- Light and dark mode. Default follows the system setting; user can override and the choice is saved.

## 5. Quran section
- Verses shown as a vertical feed, one "post-like" card per verse, grouped by surah with a surah header (number, verse count, Bismillah where appropriate).
- Use list virtualization (e.g. `@tanstack/react-virtual`) — 6,236 verses must scroll smoothly.
- Each verse card has an action bar (like X's reply/repost/like row):
  1. **Save to collection** — opens a sheet to pick one or more of the user's collections, or create a new one.
  2. **Save to prayers** — opens a sheet to pick a prayer topic, or create a new one.
  3. **Mark as last read** — stores this verse as the reading bookmark (only one at a time).
  4. **Mark as last recited** — stores this verse as the recitation bookmark (only one at a time).
- Icons show filled/active state when the verse is already saved or bookmarked.
- The Quran section has quick actions to "Continue reading" and "Continue reciting", jumping to the respective bookmark.
- Deep-linkable route: `/quran/:surah/:ayah` scrolls to and briefly highlights the verse.
- Remember scroll position when switching tabs.

## 6. Prayers section
- Works like X Lists: a list of **prayer topics**; tapping one shows its verses as a feed.
- **Default topics** (created on first launch, can be renamed or deleted): Forgiveness, Guidance, Protection, Gratitude, Patience, Mercy.
- User can create, rename, delete topics, and reorder verses within a topic.
- Each verse inside a topic can be removed from it or opened in its place in the Quran section.
- A verse can belong to several topics.

## 7. Explore section
- **Search bar** at the top:
  - Reference search: `25:43`, `25 43`, `25` (whole surah) → navigate to `/quran/25/43`. Validate ranges and show a message if the reference doesn't exist.
  - Full-text search in Arabic and in the translation. Arabic search ignores diacritics and normalizes letter variants (alif forms, ta marbuta, ya/alif maqsura).
  - Results shown as verse cards with the match highlighted; tapping opens the verse in the Quran section.
- **Collections** list below the search: the user's own collections (separate from prayer topics), with the same list UI as Prayers.

## 8. Data model (IndexedDB)
- `verses` — Quran text (seeded)
- `surahs` — metadata (seeded)
- `lists` — `{ id, name, type: 'prayer' | 'collection', isDefault, createdAt, updatedAt }`
- `listItems` — `{ id, listId, verseKey, position, addedAt }`
- `bookmarks` — `{ type: 'lastRead' | 'lastRecited', verseKey, updatedAt }`
- `settings` — theme, translation on/off, font size

Prayer topics and collections share the same tables, distinguished by `type`.

## 9. Data safety
- Call `navigator.storage.persist()` so the browser doesn't evict user data.
- Settings screen with **Export** (download JSON of lists, bookmarks, settings) and **Import** (restore from that JSON).

## 10. Non-functional requirements
- Fully usable offline after first visit; installable on Android, iOS and desktop.
- Lighthouse PWA and accessibility checks pass; keyboard navigable; proper ARIA labels on icon buttons.
- Adjustable Arabic font size.
- Interface language: English

## 11. Out of scope for v1
Audio recitation, tafsir, user accounts, cloud sync, prayer times, sharing.

## 12. How to build it
Work in phases. At the end of each phase, stop, summarize what was done, and wait for my confirmation.
1. Project setup, PWA config, data seeding into IndexedDB, layout shell with navigation and themes.
   - **Git & GitHub first:** `git init` with `main` as the default branch, a `.gitignore` for Node/Vite (`node_modules/`, `dist/`, `.env*`, OS files), a `README.md` (what the app is, how to run it, data sources) and a `LICENSE`.
   - Create the GitHub repository (with the `gh` CLI: `gh repo create`, private by default) and push the initial commit.
   - Commit in small, meaningful steps with clear messages (Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`…). At minimum one commit per completed phase, pushed to GitHub before asking for my confirmation.
   - Optional: a GitHub Actions workflow that runs lint, type-check, tests and build on every push.
2. Quran feed with virtualization, surah headers, deep links, bookmarks.
3. Lists system (collections + prayer topics) and the save sheets.
4. Explore: reference parsing, Arabic-normalized search, collections view.
5. Settings, export/import, offline testing, polish.

Before writing code in phase 1, propose the folder structure, the repository name and visibility, and confirm the data source (Arabic text and English translation) with me.
