# Word-by-Word Audio: Offline — Validation

## Automated Tests

```bash
npm run lint
npm run typecheck
npm test
```

(or `/verify`, which also builds)

### Specific test coverage required

- The word list of surah 1 has 29 entries (words of the 7 verses); a surah
  containing an exceptions verse (e.g. 37, 2) skips that verse's words
  (surah 2 has 6,103 words with audio).
- `estimateBytes` is words × 55 KB; `formatBytes` prints KB, MB and GB.
- `downloadWarning` gives a reason for 150 MB, for an estimate above the free quota, and
  with Data Saver or a cellular connection; nothing for 20 MB on a normal one.
- A download of a small surah fetches every word once (4 at a time), stores
  each in `word-audio-offline`, reports progress from 0 to the total, writes a
  `complete` row with the summed bytes.
- Cancelling mid-download keeps the cached words, writes a `partial` row, and
  Resume fetches only the missing words.
- A word that fails twice then succeeds is retried; one that fails 3 times
  stops the download with an error and a `partial` row.
- A quota error stops the download, keeps what was saved, and shows the
  "Not enough storage" message.
- Removing a download deletes its cached files and its row.
- Repair: a `complete` row whose cache entries are gone becomes `partial` or
  disappears.
- The player plays a word found only in `word-audio-offline` without calling
  `fetch`.
- Backup: `wordAudioSurahs` lists every row (complete, partial and wanted); an older backup
  without it loads; entries like `0`, `115`, `'2'`, `2.5` and duplicates are
  ignored; restoring adds `wanted` rows only for surahs not already complete,
  and leaves existing downloads alone.
- Opening a version 1 database upgrades to version 2 keeping lists,
  bookmarks and settings; re-seeding leaves `wordAudioDownloads` alone.
- App: the section opens, lists 114 rows by number ("Surah 1" … "Surah 114",
  no names), Download → progress → Downloaded → Remove works; a surah over
  100 MB asks for confirmation first.
- axe passes on Settings with the section open (progress bar and buttons have
  accessible names that contain their visible text).

## Manual Checks (real browser)

`npm run build && npm run preview`

- Download a small surah (e.g. 112): progress moves, it ends as "Downloaded"
  with a size close to the estimate; DevTools → Application → Cache Storage
  shows `word-audio-offline` with one file per word.
- Go offline (DevTools → Network → Offline), reload, open the surah in the
  feed: every word plays. A word in a surah that wasn't downloaded shows the
  "can't be played" notice.
- Cancel part-way, then Resume: only the missing words are fetched (check the
  Network tab); finish and confirm every word plays offline.
- Download a large surah (2): the warning shows the size and free space;
  Cancel does nothing; confirming starts. Cancel part-way and Remove: space
  drops back (Application → Storage).
- Navigate to another page during a download: it keeps going and the section
  shows the right progress on return. Closing the tab mid-download leaves the
  surah partial with Resume on the next launch.
- Clear the `word-audio-offline` cache by hand: reopening the section shows
  the surah as partial or not downloaded.
- Export a backup with two downloaded surahs, clear site data, import it: both
  appear as "In your backup · not on this device"; Download restores them.
- Check on a phone width, light and dark; the 114-row list scrolls without
  horizontal overflow; axe with color contrast on Settings, light and dark.
- Safari/iOS (or WebKit): a download and offline playback work; note the
  storage limits if it fails.

## Definition of Done

- Lint, type-check and tests pass; the manual checks above are ticked.
- Phase 14 is checked off in `specs/roadmap.md`.
- `CHANGELOG.md` is updated (changelog skill, `## Unreleased`).
- README, `tech-stack.md` and `CLAUDE.md` are updated.
- The owner has reviewed and committed the work.
