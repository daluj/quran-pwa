# Requirements: Settings, Backups and Polish

> Backfilled on 2026-10-20 from the original SPEC.md (sections 9–10, phase 5),
> the code and commits `c859478`…`732f487`.

## Scope

A settings page, backup export/import, offline verification and accessibility
polish.

### Included

- **Settings page** (`/settings`, linked from the sidebar and the mobile
  header):

  | Setting           | Values                         | Default |
  | ----------------- | ------------------------------ | ------- |
  | Theme             | System, Light, Dark            | System  |
  | Show translation  | on/off                         | on      |
  | Arabic text size  | 20–48px, step 2, live preview  | 28      |

  Plus "Your data" (export, import, persistent-storage status) and "About"
  (sources, licenses, app and data versions).
- **Export** downloads `quran-pwa-backup-YYYY-MM-DD.json`:
  `{ app: 'quran-pwa', format: 1, exportedAt, lists, listItems, bookmarks,
  settings }`. The Quran text isn't included.
- **Import** validates the whole file, shows a summary (topics, collections,
  saved verses, bookmarks), and asks before replacing all user data.
- **Updates:** a new version shows an "Update" prompt instead of reloading on
  its own; the first install shows "Ready to work offline".
- **Page titles** follow the header ("Surah 2 · Quran").
- **Offline:** the production build works fully with the server stopped.
- **Accessibility:** no axe violations in light and dark mode, color contrast
  included.

## Decisions

- **Validation before any write;** restore replaces lists, items, bookmarks
  and settings in **one transaction**, so a bad file or a failure changes
  nothing.
- **Unknown or invalid settings fall back to defaults,** so older backups load.
- **Settings load before first render** (`SettingsProvider`), so nothing draws
  with defaults first; the theme follows the stored setting live (a restored
  backup applies its theme).
- **On mobile,** the header's theme toggle became a Settings button; the theme
  is chosen in Settings.
- **axe fixes:** brighter muted grey in dark mode (contrast was 3.9:1); Continue
  pills and search results are named by their visible text (search results use
  a stretched link so the whole card stays clickable); pills fit on one line on
  phones instead of scrolling sideways.
- Lighthouse wasn't run (no local Chrome; Lighthouse 12+ has no PWA category).

## Context

- Mission: private by design, accessible ([mission.md](../mission.md)).
- Code: `src/db/backup.ts`, `src/db/settings.ts`, `src/db/SettingsProvider.tsx`,
  `src/features/settings/`, `src/components/PwaStatus.tsx`.
