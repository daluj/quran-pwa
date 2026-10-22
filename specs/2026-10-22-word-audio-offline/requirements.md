# Word-by-Word Audio: Offline — Requirements

## Scope

The user can keep the word audio of whole surahs on the device, so tapping any
word in those surahs works without a connection. A new "Word audio offline"
section in Settings lists the 114 surahs (by number) with an estimated size;
each can be downloaded, cancelled, resumed after a failure, or removed, and the
section shows the total space used. Downloads run while the app is open.
Backups remember which surahs were downloaded (not the audio); restoring a
backup shows them as "not downloaded yet" so the user can download them again.

Builds on [2026-10-22-word-audio](../2026-10-22-word-audio/): the player, the
URL scheme, the six verses without word audio, and the on-demand `word-audio`
cache.

### Included

- **Settings section "Word audio offline"** (with a "Choose surahs" `<details>` that opens
  on tap, so 114 rows don't bury the other settings): total space used, a
  one-line explanation, then one row per surah.
- **Per-surah row:**

| State | Shows | Action |
| --- | --- | --- |
| Not downloaded | "Surah 2 · 6,117 words · about 330 MB" | Download |
| Downloading | progress bar with "1,240 of 6,117 words" | Cancel |
| Partly downloaded (cancelled or failed) | "1,240 of 6,117 words saved · 70 MB" | Resume, Remove |
| Downloaded | "Surah 2 · 335 MB" (real size) | Remove |
| To download again (after a restore) | "In your backup · not on this device" | Download |

- **Warning dialog before a download** when the estimate is over 100 MB, is
  larger than the free storage the browser reports, or the connection looks
  metered (Data Saver on, or a cellular connection where the browser says so).
  Small surahs on a normal connection start straight away.
- **Resume:** a cancelled or failed download keeps the words already saved;
  Resume fetches only the missing ones.
- **Remove:** deletes that surah's files and its record; the space is freed.
- **Playback uses the downloads:** the player looks in the offline cache first
  and falls back to the network and the on-demand cache.
- **Backups:** `wordAudioSurahs` (list of surah numbers) in the backup file;
  older backups without it still load.
- **Persistent storage:** already requested on startup; the section says
  whether the browser granted it, since otherwise the browser may clear the
  audio when space runs low.

### Not included

- A "Download all" button (the whole Quran is about 4 GB).
- Background downloads when the app is closed (Background Fetch isn't
  supported on iOS/Safari or Firefox).
- Restoring a backup does not start downloads by itself.
- Downloads from the Quran feed or surah headers (Settings only).
- Choosing a reciter or audio quality (the CDN has one set of files).
- Keeping the screen awake during a download.

## Decisions

- **A separate cache, `word-audio-offline`, plus a Dexie table.** Downloaded
  files go in their own Cache Storage cache, so the 1500-file, 30-day limit
  of the on-demand `word-audio` cache can never delete them. A new table
  `wordAudioDownloads` (primary key `surah`) records `status` (`complete`,
  `partial`, `wanted`), `words` saved, `bytes` and `updatedAt`. It is what
  the settings list reads (live query) and what backups use. This needs a
  Dexie schema version 2 that only adds a table; seeding never touches it.
- **The cache is the truth for what is on the device; the table is the
  summary.** On Resume the manager lists the cache to find missing words, so a
  table that is out of date (browser cleared the cache, crash mid-download)
  can be repaired. When the section opens it checks each non-empty row against
  the cache once and fixes the counts.
- **Foreground, 4 parallel fetches.** Same concurrency the verification script
  needed with the CDN. Progress is a store read with `useSyncExternalStore`
  (as in the player). Only one surah downloads at a time: the other
  Download buttons are disabled while one runs (no queue).
- **Progress survives navigating away** (the manager is module-level), but not
  closing the app: the next launch shows the surah as partial with Resume.
- **Size estimate:** words in the surah (excluding verses on the exceptions
  list) times 55 KB, the average of the sampled files (25–120 KB each). Shown
  as "about"; the real size replaces it after downloading. The warning
  threshold is 100 MB: surahs 2 and 3 and a few others trigger it, most
  don't.
- **Storage errors stop the download, not lose it.** A quota error keeps the
  words saved so far, shows the message "Not enough storage" and leaves the
  surah partial.
- **Restore marks, never downloads.** A backup may list gigabytes; the user
  decides. Restoring adds `wanted` rows for listed surahs that aren't
  complete here; it doesn't remove downloads that exist on this device
  (the audio isn't user data and can't be in the file).
- **Surah downloads bypass the on-demand cache.** They fetch with
  `cache: 'no-store'` and the service worker's route ignores those requests,
  so a surah download never fills or trims the `word-audio` cache.
- **Backups list every row** (`complete`, `partial` and `wanted`), so a backup
  exported before re-downloading still remembers the wish.
- **Backup format stays 1.** `wordAudioSurahs` is optional on read; unknown or
  invalid entries (not integers 1–114) are ignored.
- **Words are saved as they came,** the CDN's 200 response, so the player can
  use them like the on-demand cache. Responses that aren't 200 are retried
  3 times and then count as failures.
- **No new dependencies.**

## Context

- [mission.md](../mission.md): offline-first, private (downloads go only to
  the audio CDN, nothing else is sent), every source credited.
- [tech-stack.md](../tech-stack.md): Offline & PWA, Persistence, and the Gaps
  list (the word audio license is still to confirm).
- Code: `src/lib/wordAudio.ts` (player; looks in the offline cache first),
  `src/lib/words.ts` (`wordAudioUrl`, `splitWords`, `hasWordAudio`),
  `src/db/db.ts` (schema), `src/db/backup.ts`, `src/db/init.ts`
  (`navigator.storage.persist()`), `src/features/settings/SettingsPage.tsx`,
  `src/components/Dialog.tsx`.
- Pattern to follow: [2026-10-21-spanish-translation-app](../2026-10-21-spanish-translation-app/)
  for adding to backups while older ones keep loading.
