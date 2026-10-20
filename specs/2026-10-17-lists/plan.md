# Plan: Lists and Save Sheets

> Backfilled on 2026-10-20. All tasks are complete.

## Group 1: Data layer

1. [x] `src/db/lists.ts`: `createList`, `renameList`, `deleteList`,
   `addVerse`, `removeVerse`, `setVerseInList`, `moveVerse`,
   `getVerseListIds`, `getSavedVerseKeys`, `getListCounts`; `ListError`.
2. [x] `src/db/listHooks.ts`: `useLists`, `useList`, `useListEntries`,
   `useVerseListIds`, `useSavedVerseKeys`.

## Group 2: Sheets

3. [x] `Dialog` (native `<dialog>`) and shared button styles.
4. [x] `NewListForm` with validation errors; `SaveSheet` with checkboxes.
5. [x] Enable the feed's save buttons, filled when saved; one sheet per feed.

## Group 3: List pages

6. [x] `ListIndex` (rows with counts, "New …" dialog) for Prayers and Explore.
7. [x] `ListDetailPage`: verses, move up/down, remove, open in Quran, rename
   and delete dialogs; missing-list message.
8. [x] Routes `/prayers/:listId` and `/explore/collections/:listId`; header
   back link and actions.

## Group 4: Tests

9. [x] `tests/lists.test.ts`: create/rename/delete, name rules, ordering,
   duplicates, reorder, membership.
10. [x] App tests: save into a new collection from the feed, save into several
    topics, reorder/remove/rename/delete a topic, missing topic.
