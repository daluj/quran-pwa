# Plan: Daily Checklist

## Group 1: Data

1. [x] Add `DailyCheck { itemId, date }` and the `dailyChecks` table
   (`&itemId`) as Dexie schema version 3 in `src/db/db.ts`; no other table changes.
2. [x] `src/db/dailyChecks.ts`: `localDateKey(now)`, `setChecked(itemId, checked, now)`
   (ticking writes today's date; unticking deletes the row), and a hook
   returning today's checked item ids via `useLiveQuery`.

## Group 2: Logic

3. [x] `src/features/daily/items.ts`: the five items (`id`, `label`, optional `to`).
4. [x] `useToday()` hook: current date key, refreshed on `visibilitychange`/focus
   and by a timer at the next local midnight.

## Group 3: UI

5. [x] `DailyPage.tsx`: checkbox rows, "n of 5 done" summary, "Open Quran" links on items 4 and 5; light/dark and mobile layout like the Prayers page.
6. [x] Route `/daily` in `router.tsx`; "Daily" entry in `NAV_ITEMS` (icon `ListChecks`); check that four bottom tabs fit on narrow phones.

## Group 4: Docs

7. [x] `specs/tech-stack.md` (route list, `dailyChecks` table, schema version 3), README features/structure.
8. [x] Roadmap phase 15 checked off; `CHANGELOG.md` `## Unreleased` via the changelog skill.

## Group 5: Tests

9. [x] `tests/dailyChecks.test.ts` for the data layer and date logic.
10. [x] App test for the page and navigation; axe test for `/daily`.
