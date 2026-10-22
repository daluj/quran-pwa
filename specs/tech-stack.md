# Tech Stack

## Language & Runtime

- **TypeScript 6** — strict mode (`noUncheckedIndexedAccess` on), checked with
  `tsc -b` across two projects: `tsconfig.app.json` (app) and
  `tsconfig.node.json` (build config, scripts, tests)
- **Node.js 20.19+ or 22+** — needed by Vite 8 for development and builds;
  CI uses Node 24
- **tsx** — runs the TypeScript data build script

## Frontend

- **React 19** with **Vite 8** — a client-side single-page app, no server
  rendering and no backend
- **React Router 8** — routes in `src/app/router.tsx`: `/quran/:surah?/:ayah?`,
  `/prayers`, `/prayers/:listId`, `/explore`, `/explore/collections/:listId`,
  `/settings`; unknown paths redirect to `/quran`
- **@tanstack/react-virtual** — window-scrolled virtualization of the
  6,350-row Quran feed (6,236 verses + 114 surah headers)
- **lucide-react** — icons
- **Tailwind CSS 4** (`@tailwindcss/vite`) — utility styling; theme tokens are
  CSS variables in `src/styles/index.css`, switched by `data-theme` on `<html>`
- **KFGQPC Uthmanic Hafs** (`src/assets/fonts/`, the font Quran.com uses) for the
  Arabic, with **Amiri Quran** via `@fontsource/amiri-quran` as the fallback —
  both bundled locally; see `data/raw/SOURCES.md` (Hafs license still to confirm)

## Offline & PWA

- **vite-plugin-pwa** (Workbox, `generateSW`) — precaches the app shell, fonts,
  icons and the Quran JSON (~4 MB); `registerType: 'prompt'` so updates wait
  for the user ("Update" prompt)
- **Word audio** (`audio.qurancdn.com/wbw/`) is not precached: a Workbox
  `CacheFirst` runtime cache (`word-audio`, 1500 files, 30 days) keeps the
  words the user has played. The player downloads each file whole with
  `fetch` and plays it from a blob URL, so the cached response is a plain 200.
- **Offline word audio:** a surah's download (Settings, foreground, 4 parallel
  fetches, resumable) goes into its own `word-audio-offline` cache, which
  nothing trims; the player looks there first. Requests use `cache: 'no-store'`,
  which the runtime route ignores.
- Web app manifest and icons generated from `public/favicon.svg`
  (`npm run icons`)

## Persistence

- **IndexedDB via Dexie 4** (`dexie-react-hooks` for live queries) — schema in
  `src/db/db.ts`
  - Seeded tables: `verses`, `surahs`
  - User tables: `lists`, `listItems`, `bookmarks`, `settings`
  - Downloads: `wordAudioDownloads` (schema version 2): per surah `complete`,
    `partial` or `wanted` (from a backup), words and bytes; never touched by seeding
  - Internal: `meta` (data version, defaults seeded)
- `navigator.storage.persist()` is requested on startup
- Backups are JSON files (`src/db/backup.ts`), validated before restore

## Data Pipeline

- Raw Tanzil files and the two translations (`en.translation.txt`,
  `es.translation.txt`) in `data/raw/` (never edited) →
  `scripts/build-quran-data.ts` (pure logic in `scripts/quran-data.ts`) →
  generated, committed JSON in `src/data/` (`verses.json`, `surahs.json`,
  `meta.json`); each verse carries `translations: { en, es }`, and the
  `translationLanguage` setting picks which one the app shows
- `scripts/verify-word-audio.ts` (`npm run verify:word-audio`, by hand) lists
  the verses whose word count differs from the audio CDN's in
  `src/data/word-audio-exceptions.json`; they get no word audio
- Runs before every production build; fails loudly on invalid data
- The data version is a content hash; a new hash re-seeds verses and surahs
  on next launch without touching user tables
- Default prayer topics and collections: `src/data/default-lists.json`

## Testing

- **Vitest 5** — `npm test`
  - Unit tests: data build, Arabic normalization, references, search, lists,
    bookmarks, backups, settings
  - App tests (`tests/app.test.tsx`): the whole app in **jsdom** with
    **fake-indexeddb** and **Testing Library**, with fakes for layout, scroll,
    `ResizeObserver`, `matchMedia` and `<dialog>`
  - Accessibility: **axe-core** on every page (color contrast is checked in a
    real browser instead)
- Real-browser checks (`npm run build && npm run preview`): far deep links,
  offline mode, update prompt, color contrast

## Tooling

- **ESLint 10** with `typescript-eslint`, `react-hooks` (React Compiler rules)
  and `react-refresh` — `npm run lint`
- **GitHub Actions** (`.github/workflows/ci.yml`) — lint, type-check, tests,
  build, and a check that the generated `src/data/` is committed
- **Claude Code** — `CLAUDE.md`, shared settings in `.claude/settings.json`,
  `/verify` command, and the `feature-spec` and `changelog` skills in
  `.claude/skills/`
- Code style: 2-space indent, no semicolons, single quotes, ~120 columns
  (no formatter configured)

## Hosting

- Static hosting; target is **Cloudflare Pages** (build `npm run build`, output
  `dist`, `NODE_VERSION=22`). Unknown paths must serve `index.html`.

## Gaps / Future Considerations

- **Spanish translation:** machine-made from the Arabic for this project and
  not yet reviewed by a qualified reader of Arabic (Phase 11); Settings says
  so. Both translations are precached (~0.9 MB more).
- **Translation source:** the English translation's name, translator and
  license are placeholders (`data/raw/SOURCES.md`, `src/data/sources.ts`).
  Per the mission, this must be resolved before a public release.
- **Formatter:** no Prettier; style is kept by hand and review.
- **`package.json` engines** says `>=20`, but Vite 8 needs 20.19+ or 22.12+.
- **Bundle size:** the main JS chunk is ~520 KB (164 KB gzipped) and Vite
  warns above 500 KB; routes could be code-split if load time matters.
- **Word audio license:** the Quran.com CDN states no license for the word
  audio; confirm the terms before a public release (`data/raw/SOURCES.md`).
  The audio is also a third-party request (the CDN sees the user's IP).
- **Untested:** installing on real iOS and Android devices; Lighthouse (no
  local Chrome, and Lighthouse 12+ has no PWA category).
