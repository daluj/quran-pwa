# Roadmap

Phases are intentionally small: each should be implementable and reviewable in
one focused session. Every phase gets a dated spec folder under `specs/`
(`requirements.md`, `plan.md`, `validation.md`), created with the
`feature-spec` skill. A phase is complete when its `validation.md` passes and
the owner has reviewed and committed the work.

Phases 1–9 were built before this workflow existed; their spec folders were
backfilled on 2026-10-20 from the original SPEC.md, the code and the commits.

---

## Phase 1: Project Setup (Complete)

**Goal:** An installable, offline-capable app shell with the Quran data in
IndexedDB. Spec: [2026-10-17-project-setup](2026-10-17-project-setup/)

- [x] Git repository, README, LICENSE, CI
- [x] Vite + React + TypeScript + Tailwind scaffold
- [x] Data build script that validates the Tanzil files and generates JSON
- [x] Dexie schema and first-launch seeding with a data version
- [x] X-style layout (sidebar, bottom tabs, header), light/dark themes, Amiri Quran font
- [x] PWA manifest, icons and offline precaching

---

## Phase 2: Quran Feed (Complete)

**Goal:** Read the whole Quran in a smooth feed and come back to where you
were. Spec: [2026-10-17-quran-feed](2026-10-17-quran-feed/)

- [x] Virtualized feed of verse cards with surah headers and the Bismillah
- [x] Deep links `/quran/:surah/:ayah` that scroll to and highlight a verse
- [x] Last read / last recited bookmarks with "Continue" shortcuts
- [x] Scroll position kept across tab switches

---

## Phase 3: Surahs by Number Only (Complete)

**Goal:** Refer to surahs only by number, everywhere.
Spec: [2026-10-17-surah-numbers-only](2026-10-17-surah-numbers-only/)

- [x] Remove surah names from the generated data and the UI

---

## Phase 4: Lists and Save Sheets (Complete)

**Goal:** Save verses to collections and prayer topics, and manage those
lists. Spec: [2026-10-17-lists](2026-10-17-lists/)

- [x] Lists data layer shared by collections and prayer topics
- [x] Save sheets from the feed, with "create new"
- [x] Prayer topic and collection pages: reorder, remove, open in Quran, rename, delete

---

## Phase 5: Explore Search (Complete)

**Goal:** Find any verse by reference or by text.
Spec: [2026-10-17-explore-search](2026-10-17-explore-search/)

- [x] Reference parsing (`25:43`, `25 43`, `25`) with validation
- [x] Arabic search tolerant of diacritics, letter variants and Uthmani spelling
- [x] Translation search; highlighted results; collections below the search

---

## Phase 6: Settings, Backups and Polish (Complete)

**Goal:** User control over appearance and data, and a finished offline app.
Spec: [2026-10-17-settings-backups](2026-10-17-settings-backups/)

- [x] Settings page: theme, translation, Arabic size
- [x] Backup export and validated import
- [x] Update prompt, offline-ready notice, page titles
- [x] Offline test and accessibility fixes (axe, light and dark)

---

## Phase 7: Default Topics and Collections (Complete)

**Goal:** New users start with curated prayer topics and collections, with
verses. Spec: [2026-10-18-default-lists](2026-10-18-default-lists/)

- [x] 7 prayer topics and 12 collections (508 verses) seeded on first launch
- [x] Existing installs left untouched

---

## Phase 8: English Only (Complete)

**Goal:** Read the translation without the Arabic.
Spec: [2026-10-18-english-only](2026-10-18-english-only/)

- [x] "Only show English translation" setting applied to the feed, lists and search

---

## Phase 9: Reading Mode (Complete)

**Goal:** A distraction-free feed: verse number and text only.
Spec: [2026-10-18-reading-mode](2026-10-18-reading-mode/)

- [x] "Reading mode" setting for the Quran feed

---

## Phase 10: Spec-Driven Workflow

**Goal:** Work on the project through specs, with agents.
Spec: [2026-10-20-spec-driven-workflow](2026-10-20-spec-driven-workflow/)

- [x] Claude Code setup: `CLAUDE.md`, shared settings, `/verify`
- [x] Constitution: `mission.md`, `tech-stack.md`, `roadmap.md`
- [x] Backfilled spec folders for phases 1–9; `SPEC.md` retired
- [x] `feature-spec` and `changelog` skills; `CHANGELOG.md`
- [ ] Reviewed and committed by the owner

---

## Phase 11: Spanish Translation (data)

**Goal:** A complete Spanish (Spain) translation made from the Arabic, with
its guidelines and decisions recorded.
Spec: [2026-10-21-spanish-translation](2026-10-21-spanish-translation/)

- [x] Owner's guidelines and terminology decisions recorded
- [x] `data/raw/es.translation.txt`: all 114 surahs, 6236 verses
- [x] Contested verses listed for review
- [ ] Reviewed by a qualified reader of Arabic
- [x] Reviewed and committed by the owner

---

## Phase 12: Spanish Translation in the App

**Goal:** Choose between the English and Spanish translations.
Spec: [2026-10-21-spanish-translation-app](2026-10-21-spanish-translation-app/)

- [x] Build script reads `es.translation.txt` (data model with more than one translation)
- [x] Language setting, included in backups
- [x] Search and "only show translation" work with the chosen language

---

## Phase 13: Word-by-Word Audio

**Goal:** Tap an Arabic word in the feed to hear that word pronounced.

Words are served by the Quran.com CDN as one MP3 per word:
`https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3`, with surah, ayah and word
position zero-padded to three digits. For example `002_101_001.mp3` is the
first word of 2:101.
Spec: [2026-10-22-word-audio](2026-10-22-word-audio/)

- [ ] Confirm the audio source's license and terms (recorded in `data/raw/SOURCES.md` as "to confirm")
- [x] Split each verse's Arabic text into tappable words, with positions that match the CDN's numbering (six verses differ from the CDN and have no word audio)
- [x] Tap a word to play its audio; tapping another word stops the current one
- [x] Show which word is playing (highlight) and keep selection, copy and the verse-card actions working
- [x] Respect reading mode and the language setting (only when the Arabic is shown)
- [x] Decide how audio is cached: fetch on demand and cache what was played (Workbox runtime caching with a size limit), since precaching ~77k words is not an option
- [x] Explain clearly when a word's audio isn't available offline or fails to load
- [x] Update `estimateRowHeight` / re-measure check in `QuranFeed.tsx` if word markup changes the card height
- [x] Accessibility: words are keyboard-focusable with an accessible name, and the axe tests still pass
- [x] Tests for word splitting and numbering, and for playback behaviour

---

## Phase 14: Word-by-Word Audio — Offline Audio

**Goal:** Choose surahs whose word audio is kept offline, so tapping any word
works without a connection. Builds on the on-demand cache from phase 13.
Spec: [2026-10-22-word-audio-offline](2026-10-22-word-audio-offline/)

- [x] Download the word audio of a whole surah for offline use, with progress, cancel and resume after a failure
- [x] Store downloaded audio so the browser doesn't evict it (persistent storage request) and so it is separate from the size-limited on-demand cache
- [x] Show which surahs are downloaded and how much space they use
- [x] Remove a download; free the space
- [x] Include the choice of downloaded surahs (not the audio) in backups; older backups must still load
- [x] Estimate the size before downloading and warn on low storage or a metered connection
- [x] Tests for download, progress, removal and backup validation
