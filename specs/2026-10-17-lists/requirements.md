# Requirements: Lists and Save Sheets

> Backfilled on 2026-10-20 from the original SPEC.md (sections 5, 6, 8,
> phase 3), the code and commits `9d31c3b`, `7c08be5`, `df6987b`, `88b7b82`.

## Scope

Collections and prayer topics: save verses into them from the feed, and view
and manage them like X Lists.

### Included

- **Data model:** `lists` `{ id, name, type: 'prayer' | 'collection', isDefault,
  createdAt, updatedAt }` and `listItems` `{ id, listId, verseKey, position,
  addedAt }`. Both kinds share the tables.
- **Save sheets:** "Save to collection" and "Save to prayers" on each verse
  card open a sheet listing that type's lists with checkboxes (changes apply
  immediately) and a form to create a list, which also saves the verse into it.
  The card's icon is filled when the verse is in any list of that type.
- **Prayers section** (`/prayers`): the topics, each with its verse count, and
  "New topic". A topic page (`/prayers/:listId`) shows its verses as a feed.
- **Collections** use the same pages at `/explore/collections/:listId`.
- On a list page: reorder verses (move up/down), remove a verse, open it in
  the Quran feed, rename the list, delete it (with confirmation).
- A verse can belong to several lists; at most once per list.
- At this phase, first launch created six default topics: Forgiveness,
  Guidance, Protection, Gratitude, Patience, Mercy (replaced in
  [phase 7](../2026-10-18-default-lists/)).

## Decisions

- **Names:** 1–60 characters, whitespace collapsed, unique per type ignoring
  case; clear error messages.
- **Ids** are UUIDs (safe to export and import).
- **Positions** are renumbered 0..n-1 after a reorder.
- **Deleting a list** deletes its items; the verses stay in the Quran.
- **Native `<dialog>`** for sheets and confirmations: focus trap, Esc and an
  inert background from the browser. Bottom sheet on mobile, centered from
  `sm`; X-style blue-grey backdrop and border in dark mode.
- **Defaults are seeded once**; deleted or renamed defaults aren't recreated.
- Reordering with up/down buttons (keyboard accessible) rather than drag and
  drop.

## Context

- X Lists as the interaction model ([mission.md](../mission.md)).
- Shared list UI in `src/features/lists/`; data helpers in `src/db/lists.ts`.
