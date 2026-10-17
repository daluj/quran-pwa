# Quran PWA

An offline-first Progressive Web App for reading the Quran, saving verses into
personal collections, and organizing verses used in prayer (du'a) by topic. The
layout follows the feed / lists / explore patterns of X.com, with its own
branding.

Everything runs on the device: no backend, no accounts. After the first visit
the app works fully offline and can be installed on Android, iOS and desktop.

See [SPEC.md](SPEC.md) for the full specification.

## Tech stack

React + TypeScript (Vite), `vite-plugin-pwa` (Workbox), Dexie.js (IndexedDB),
Tailwind CSS, React Router, Vitest.

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

| Script               | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Start the dev server                                            |
| `npm run build`      | Regenerate Quran data, type-check and build for production      |
| `npm run preview`    | Serve the production build (use this to test offline / install) |
| `npm run data`       | Rebuild `src/data/*.json` from `data/raw/`                      |
| `npm test`           | Run unit tests                                                  |
| `npm run lint`       | Lint                                                            |
| `npm run typecheck`  | Type-check                                                      |

## Data sources

- **Arabic:** [Tanzil Project](https://tanzil.net) Uthmani text (v1.1),
  CC BY 3.0 — `data/raw/quran-uthmani.txt`
- **English translation:** `data/raw/en.translation.txt`

Details and licenses are in [data/raw/SOURCES.md](data/raw/SOURCES.md). Raw
files are never edited by hand; `scripts/build-quran-data.ts` parses and
validates them and generates the bundled JSON in `src/data/`.

## License

Application code: [MIT](LICENSE). The Quran text and translation keep their own
licenses (see `data/raw/SOURCES.md`).
