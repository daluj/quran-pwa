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

## Phase 11: Audio Recitation — Play a Verse

**Goal:** Listen to a single verse recited.

- [ ] Choose a recitation source and reciter with a clear license (record it in `data/raw/SOURCES.md`)
- [ ] Decide how audio is fetched and cached (it can't all be precached)
- [ ] Add a play/stop control to verse cards (respecting reading mode)
- [ ] Explain clearly when a verse's audio isn't available offline

---

## Phase 12: Audio Recitation — Continuous Playback

**Goal:** Recite a surah verse after verse, following along in the feed.

- [ ] Play from a verse to the end of its surah
- [ ] Scroll to and highlight the verse being recited
- [ ] Pause/resume, and stop when leaving the Quran section

---

## Phase 13: Audio Recitation — Offline Audio

**Goal:** Choose surahs to keep offline.

- [ ] Download a surah's audio for offline use, with progress
- [ ] Show which surahs are downloaded and how much space they use
- [ ] Remove downloads; include the choice (not the audio) in backups
