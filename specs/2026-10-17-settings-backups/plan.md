# Plan: Settings, Backups and Polish

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Backups

1. [x] `src/db/backup.ts`: `createBackup`, `backupFileName`, `validateBackup`,
   `parseBackupFile`, `restoreBackup` (one transaction), `summarizeBackup`.

## Group 2: Settings

2. [x] `ARABIC_FONT_SIZE` limits; settings helpers take a database for tests.
3. [x] `SettingsProvider` (load before render); `ThemeProvider` follows the
   stored theme live with an optimistic pending value.
4. [x] `SettingsPage`: appearance, reading, your data (export, import with a
   confirmation dialog, storage status), about.
5. [x] Settings links in the sidebar and the mobile header; `/settings` route.

## Group 3: PWA polish

6. [x] `registerType: 'prompt'`; `PwaStatus` toast (update / offline ready).
7. [x] Page titles from the header.

## Group 4: Accessibility

8. [x] axe tests in jsdom for each page; axe with color contrast in a real
   browser, light and dark.
9. [x] Fix contrast, accessible names and the pills' overflow.

## Group 5: Docs and tests

10. [x] `tests/backup.test.ts`; app tests for settings, export/import and axe.
11. [x] README: features, structure, data handling.
