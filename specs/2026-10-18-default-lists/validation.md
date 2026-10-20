# Validation: Default Topics and Collections

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] Every verse in `default-lists.json` exists; none repeats within a list;
      names are unique per type
- [x] First launch creates all 19 lists, in order, with their verses in order
- [x] Lists the user deleted aren't recreated
- [x] Installs with the legacy marker get no new lists

## Manual Checks (real browser, fresh origin)

- [x] Prayers shows the 7 topics with the expected counts
- [x] Explore shows the 12 collections with the expected counts
- [x] Beautiful Names starts 3:18, 87:1, 13:9, 22:60

## Definition of Done

Checks pass and the work is merged to `main`.
