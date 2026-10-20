# Requirements: Default Topics and Collections

> Backfilled on 2026-10-20 from the owner's requests (two backup exports plus
> a list of verses) and commits `07fd217`, `52de176`.

## Scope

New installs start with curated prayer topics and collections that already
contain verses.

### Included

Defined in `src/data/default-lists.json` (one list per line, in this order):

| Type       | Lists (verses)                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Prayer     | Forgiveness (25), Guidance (23), Protection (21), Gratitude (10), Patience (2), Provisions (5), Knowledge (4) |
| Collection | At Dawn (1), At Night (3), Servants of God (16), Behaviour (132), Believers (89), Righteousness (60), Blessed Book (3), Zakat (16), Fasting (5), Hajj (28), Animal Offering (3), Beautiful Names (62) |

508 verses in all.

## Decisions

- **Source:** the owner's backup exports (lists and their order), plus verse
  lists the owner supplied for Believers, Righteousness and Beautiful Names.
  The backups' bookmarks and settings were not used as defaults.
- **Beautiful Names** was given as 80 keys with repeats (57:3, 59:23, 59:24…);
  a list holds each verse once, so each repeated verse keeps its first
  position (62 verses).
- **"2: 278"** in the Believers list was read as 2:278.
- **The second export** filled Behaviour, Zakat, Fasting, Hajj and Animal
  Offering and added 17:53 to Servants of God. Its empty Believers,
  Righteousness and Beautiful Names were ignored (that browser never had them).
- **All seeded lists are marked `isDefault`;** users can rename or delete them.
- **Seeded once:** a `defaultListsSeeded` marker; installs that already ran the
  older six-topic seed (`defaultTopicsSeeded`) are left untouched, so nothing
  is duplicated. Those installs can import a backup or clear site data.
- Mercy is no longer a default topic.

## Context

- Mission: ready for daily use from the first launch ([mission.md](../mission.md)).
- Code: `src/db/seed.ts` (`seedDefaultLists`), `src/data/default-lists.json`.
