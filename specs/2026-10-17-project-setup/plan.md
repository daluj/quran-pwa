# Plan: Project Setup

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Repository

1. [x] `git init` on `main`; `.gitignore` for Node/Vite, env and OS files.
2. [x] README (what the app is, how to run it, data sources) and MIT LICENSE
   (code only; data keeps its own licenses).
3. [x] Initial commit with the raw data, pushed to `daluj/quran-pwa`.

## Group 2: Scaffold

4. [x] `package.json` scripts: `dev`, `data`, `build`, `preview`, `test`,
   `lint`, `typecheck`, `icons`.
5. [x] TypeScript project references (`tsconfig.app.json`,
   `tsconfig.node.json`), ESLint config, Vite config with Vitest.

## Group 3: Data build

6. [x] `scripts/quran-data.ts`: `parseTanzil`, `stripBismillah`,
   `buildDataset`, `toJsonLines`.
7. [x] `scripts/build-quran-data.ts` writes `src/data/*.json`; non-zero exit on
   failure.
8. [x] `src/lib/arabic.ts`: diacritic stripping and letter normalization.

## Group 4: Database

9. [x] `src/db/db.ts` schema; `src/db/seed.ts` (`seedQuranData`);
   `src/db/init.ts` (seed on startup, request persistent storage).
10. [x] `DataProvider` and `DataGate` for loading and error states.

## Group 5: Layout and themes

11. [x] `RootLayout` with `Sidebar`, `BottomTabBar`, `Header`, `RightColumn`;
    skip link.
12. [x] `ThemeProvider`, theme tokens in `src/styles/index.css`, inline
    pre-paint script in `index.html`.
13. [x] Placeholder Quran, Prayers and Explore pages.

## Group 6: PWA and CI

14. [x] `vite-plugin-pwa` manifest and precache; icons from `public/favicon.svg`.
15. [x] `.github/workflows/ci.yml`: lint, type-check, test, build, generated
    data committed.

## Group 7: Tests

16. [x] `tests/quran-data.test.ts`: parsing, validation failures, Bismillah
    stripping, real-data dataset.
17. [x] `tests/arabic.test.ts`, `tests/seed.test.ts`, app shell smoke test.
