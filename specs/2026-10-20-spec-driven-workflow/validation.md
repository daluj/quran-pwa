# Validation: Spec-Driven Workflow

The phase is complete when all of the following pass.

## Automated Checks

- [x] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` exit 0
      (no app code changed, so nothing should move)
- [x] `git status --short -- src/data` prints nothing
- [x] No file still links to `SPEC.md`
      (`grep -rn "SPEC.md" --exclude-dir=node_modules --exclude-dir=.git .`
      only finds mentions of the retired file)
- [x] `python3 -I .claude/skills/changelog/scripts/changelog.py` run twice:
      the second run reports "up to date"

## Manual Checks

- [x] `specs/` has `mission.md`, `tech-stack.md`, `roadmap.md` and one folder
      per roadmap phase 1–10, each with `requirements.md`, `plan.md`,
      `validation.md`
- [x] Every roadmap phase links to an existing folder, and every relative link
      in `specs/`, README and CLAUDE.md resolves
- [x] The backfilled specs match the app (settings, defaults, search rules,
      backup format)
- [ ] `/feature-spec` is listed as a skill in Claude Code and, when run, starts
      with Phase 11 and asks three questions before writing anything
      (needs a new Claude Code session, which loads project skills at start)
- [x] Nothing was committed by the agent

## Definition of Done

All checks pass, the roadmap's Phase 10 is checked off, and the owner has
reviewed and committed the work.
