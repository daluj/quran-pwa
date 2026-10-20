# Validation: English Only

> Backfilled on 2026-10-20. All checks passed when the phase was merged.

## Automated Tests

- [x] `npm run lint`, `npm run typecheck` and `npm test` exit 0

### Specific test coverage required

- [x] Visibility: default both; translation off → Arabic only; English only →
      English only whatever the translation switch says
- [x] With English only: the translation switch is on and disabled; the feed
      shows no Arabic (cards or headers); an Arabic search shows Arabic
- [x] Backups restore `englishOnly`; older backups load it as off

## Manual Checks (real browser, mobile)

- [x] Settings shows both switches with the lock note
- [x] The feed shows English only, compact cards, no Arabic Bismillah

## Definition of Done

Checks pass and the work is merged to `main`.
