# Quran PWA — Project Spec

## 1. Goal
Build an offline-first Progressive Web App for reading the Quran, saving verses into personal collections, and organizing verses used in prayer (du'a) by topic. The interface follows the layout and interaction patterns of X.com (feed, lists, explore), with its own branding (no X logos, names or assets).

## 2. Tech stack
- **Framework:** React + TypeScript, built with Vite
- **PWA:** `vite-plugin-pwa` (Workbox) — precache the app shell, fonts and all Quran data so the app works fully offline after the first load
- **Storage:** IndexedDB via Dexie.js
- **Styling:** Tailwind CSS, with light/dark themes via CSS variables
- **Routing:** React Router
- **List virtualization:** `@tanstack/react-virtual`
- **Icons:** `lucide-react`
- **Testing:** Vitest for logic (search, reference parsing, DB layer), plus app-level tests in jsdom (Testing Library, `fake-indexeddb`) and accessibility checks with axe-core
- Node.js 20.19+ or 22+.
- No backend. No user accounts. Everything is local to the device.

## 3. Quran data
- **Source:** Tanzil.net Uthmani text, bundled as static JSON in the repo
- **Translation:** one English translation shown under each verse
  - **Input format:** Tanzil's "Text (with aya numbers)" format — a plain UTF-8 `.txt` file with exactly one line per verse (6,236 lines), each line `surah|ayah|text`, e.g.:
    ```
    1|1|In the name of God, the Almighty, the Merciful.
    1|2|Praise be to God, Lord of the Worlds.
    ```
  - Same format for the Arabic Uthmani text from Tanzil, so both files can be merged line by line.
  - Raw files live in `data/raw/` (`quran-uthmani.txt`, `en.translation.txt`) and are never edited by hand after import. Lines starting with `#` (Tanzil's license footer) are ignored.
  - A build script (`scripts/build-quran-data.ts`) parses both files, validates them (6,236 verses, 114 surahs, no missing or duplicate `surah:ayah`, no empty text, same verse keys in both files) and generates the bundled JSON in `src/data/` (`verses.json`, `surahs.json`, `meta.json`). The script fails loudly if validation fails. It runs before every production build.
  - Tanzil prefixes the Bismillah to verse 1 of every surah except 1 (where it is verse 1) and 9 (which has none). The build script removes that prefix (matched ignoring diacritics) so the Bismillah is shown once, in the surah header, and the Arabic matches the translation's verse boundaries.
  - Keep the translation's name, translator and source/license in `data/raw/SOURCES.md` (and `src/data/sources.ts`, shown in Settings). **The translation's details are still placeholders.**
- On first launch, load the bundled JSON into IndexedDB. The data version is a content hash in `meta.json`; when it changes, verses and surahs are re-seeded on the next launch. User data is never touched by re-seeding.
- Arabic text: right-to-left, rendered with Amiri Quran (bundled locally through `@fontsource/amiri-quran`).
- Each verse record: `surah`, `ayah`, `key` ("2:255"), `textArabic`, `textArabicPlain` (no diacritics, normalized for search), `translation`.
- Surah metadata: number, verse count, and whether the header shows the Bismillah.
- **Surahs are identified by number only** ("Surah 2"). The app shows no surah names, transliterated or Arabic.

## 4. Layout (X.com-style)
- **Desktop:** left sidebar with the three nav items, Settings and a theme toggle (icons only below the `xl` breakpoint, icons and labels from `xl`); centered main column (~600px); right column (from `lg`) with a search box and the list of surahs by number. The right column's search box is hidden on Explore, which has its own.
- **Mobile:** bottom tab bar with the three nav items; sticky top header with the current surah number (in the Quran section) or the section title, and a Settings button.
- Three main sections:
  1. **Quran**
  2. **Prayers**
  3. **Explore**
- **Settings** is a separate page (`/settings`), reached from the sidebar or the mobile header.
- Light and dark mode. Default follows the system setting; user can override and the choice is saved. The theme is applied before first paint (no flash).
- Browser tab titles follow the page header (e.g. "Surah 2 · Quran").

## 5. Quran section
- Verses shown as a vertical feed, one "post-like" card per verse, grouped by surah with a surah header (number, verse count, Bismillah where appropriate).
- Use list virtualization (`@tanstack/react-virtual`, window scrolling) — 6,236 verses must scroll smoothly. Row heights are estimated, then measured; when the column width, Arabic size or visible texts change, rows are re-measured and the top verse stays in place.
- Each verse card shows the verse number on the left, a "Surah N · s:a" line, the Arabic, the translation (per settings) and an action bar (like X's reply/repost/like row):
  1. **Save to collection** — opens a sheet to pick one or more of the user's collections, or create a new one.
  2. **Save to prayers** — opens a sheet to pick one or more prayer topics, or create a new one.
  3. **Mark as last read** — stores this verse as the reading bookmark (only one at a time; tapping it again clears it).
  4. **Mark as last recited** — stores this verse as the recitation bookmark (only one at a time; tapping it again clears it).
- Icons show filled/active state when the verse is already saved or bookmarked.
- **Reading mode** (setting): verse cards show only the verse number on the left and the text; no "Surah N · s:a" line and no action bar. Surah headers stay.
- The sticky header has quick actions "Continue reading" and "Continue reciting" (shortened to "Reading"/"Reciting" on phones), jumping to the respective bookmark, or "not set".
- Deep-linkable route: `/quran/:surah/:ayah` scrolls to the verse just below the sticky header and briefly highlights it; `/quran/:surah` opens the surah. Verse 1 scrolls to the surah header. A reference that doesn't exist shows a message.
- The header shows the number of the surah at the top of the viewport.
- Remember scroll position when switching tabs.

## 6. Prayers section
- Works like X Lists: a list of **prayer topics**; tapping one shows its verses as a feed.
- **Default topics** (created on first launch, with their verses, can be renamed or deleted): Forgiveness, Guidance, Protection, Gratitude, Patience, Provisions, Knowledge. Their verses are defined in `src/data/default-lists.json`.
- User can create, rename, delete topics (deleting asks for confirmation), and reorder verses within a topic (move up / move down).
- Topic names: 1–60 characters, unique per type (ignoring case).
- Each verse inside a topic can be removed from it or opened in its place in the Quran section.
- A verse can belong to several topics.
- Defaults are created only once: renamed or deleted defaults are not recreated, and installs that already have lists are left as they are.

## 7. Explore section
- **Search bar** at the top (in the sticky header). The query is kept in the URL (`/explore?q=…`).
  - Reference search: `25:43`, `25 43`, `25.43`, `25/43`, `25-43`, `25` (whole surah), with Arabic-Indic digits too → a "Go to" result; pressing Enter goes straight to `/quran/25/43`. Validate ranges and show a message if the reference doesn't exist.
  - Full-text search in Arabic and in the translation (Arabic queries search the Arabic, others the translation). A verse matches when it contains all the words; results are in Quran order, 30 at a time with "Show more".
  - Arabic search ignores diacritics and normalizes letter variants (alif forms, ta marbuta / ha, alif maqsura / ya). It also tolerates Uthmani spelling: a typed alif matches a dagger alif and hamza seats are optional (so "العالمين" finds "ٱلْعَٰلَمِينَ"), while a typed alif must still be there ("قال" doesn't match "قل").
  - Translation search is case- and accent-insensitive.
  - Results shown as verse cards with the match highlighted (whole words for Arabic); tapping opens the verse in the Quran section. Results always show the text that matched, whatever the reading settings.
- **Collections** list below the search (when the search box is empty): the user's own collections (separate from prayer topics), with the same list UI as Prayers.
- **Default collections** (created on first launch, with their verses, from `src/data/default-lists.json`): At Dawn, At Night, Servants of God, Behaviour, Believers, Righteousness, Blessed Book, Zakat, Fasting, Hajj, Animal Offering, Beautiful Names.

## 8. Data model (IndexedDB)
- `verses` — Quran text (seeded)
- `surahs` — metadata (seeded)
- `lists` — `{ id, name, type: 'prayer' | 'collection', isDefault, createdAt, updatedAt }` (ids are UUIDs)
- `listItems` — `{ id, listId, verseKey, position, addedAt }` (a verse appears at most once per list)
- `bookmarks` — `{ type: 'lastRead' | 'lastRecited', verseKey, updatedAt }`
- `settings` — key/value rows: `theme`, `showTranslation`, `englishOnly`, `readingMode`, `arabicFontSize`
- `meta` — internal bookkeeping (data version, defaults seeded); not exported

Prayer topics and collections share the same tables, distinguished by `type`.

## 9. Settings
- **Appearance:** theme — System, Light or Dark.
- **Reading:**
  - Show English translation (on/off).
  - Only show English translation: hides the Arabic (and the Arabic Bismillah in surah headers). While on, "Show English translation" stays on and locked.
  - Reading mode (see section 5).
  - Arabic text size: 20–48px in steps of 2 (default 28), with a live preview.
- **Your data:** Export / Import backup (section 10), and whether the browser granted persistent storage.
- **About:** data sources and licenses, app version and data version.

## 10. Data safety
- Call `navigator.storage.persist()` so the browser doesn't evict user data.
- **Export** downloads `quran-pwa-backup-YYYY-MM-DD.json`: `{ app: 'quran-pwa', format: 1, exportedAt, lists, listItems, bookmarks, settings }`. The Quran text isn't included.
- **Import** validates the whole file first (shape, ids, list references, verse keys, duplicates), shows a summary and asks before replacing all lists, bookmarks and settings in one transaction: either everything is restored or nothing changes. Missing or invalid settings fall back to defaults, so older backups still load.

## 11. Non-functional requirements
- Fully usable offline after first visit; installable on Android, iOS and desktop.
- App updates are offered with an "Update" prompt instead of reloading on their own; the first install shows "Ready to work offline".
- Accessibility: keyboard navigable; proper ARIA labels on icon buttons; accessible names contain the visible text; no axe violations (color contrast included) in light and dark mode. (Lighthouse 12+ no longer has a PWA category; installability is covered by the manifest, icons, service worker and offline loading.)
- Adjustable Arabic font size.
- Interface language: English.

## 12. Out of scope for v1
Audio recitation, tafsir, user accounts, cloud sync, prayer times, sharing, surah names.

## 13. How it was built
Built in phases, each reviewed before the next. All five are done:
1. Project setup, PWA config, data seeding into IndexedDB, layout shell with navigation and themes. Git and GitHub (`daluj/quran-pwa`), README, LICENSE, CI (lint, type-check, tests, build).
2. Quran feed with virtualization, surah headers, deep links, bookmarks.
3. Lists system (collections + prayer topics) and the save sheets.
4. Explore: reference parsing, Arabic-normalized search, collections view.
5. Settings, export/import, offline testing, polish.

Later additions: surahs shown by number only, default topics and collections with verses, the "Only show English translation" setting, reading mode.

**Working rules:** commits follow Conventional Commits (`feat:`, `fix:`, `docs:`…). The project owner reviews and makes every commit; Claude leaves changes uncommitted (see `CLAUDE.md`).
