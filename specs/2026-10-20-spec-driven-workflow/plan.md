# Plan: Spec-Driven Workflow

## Group 1: Agent setup (2026-10-18)

1. [x] `CLAUDE.md` with commands, architecture, conventions and workflow rules.
2. [x] `.claude/settings.json`: allow checks; deny `git commit`, `git push`
   and `.env` reads. `.gitignore` keeps only personal files out.
3. [x] `/verify` command.

## Group 2: Research and interview

4. [x] Read the course page, its companion repository (constitution, feature
   specs, skills, prompts) and map them onto this project.
5. [x] Interview the owner: audience, next phases, past work, `SPEC.md`.

## Group 3: Constitution

6. [x] `specs/mission.md` (purpose, audience, principles, success, out of
   scope).
7. [x] `specs/tech-stack.md` (stack, offline, persistence, data pipeline,
   testing, tooling, hosting, gaps).
8. [x] `specs/roadmap.md` (phases 1–9 complete, this phase, audio phases
   11–13).

## Group 4: Backfilled feature specs

9. [x] One folder per completed phase with `requirements.md`, `plan.md`,
   `validation.md`, from the old `SPEC.md`, the code and the commits.

## Group 5: Skills and changelog

10. [x] `.claude/skills/feature-spec/SKILL.md`.
11. [x] `.claude/skills/changelog/SKILL.md` and `scripts/changelog.py`.
12. [x] Generate `CHANGELOG.md`; re-running it changes nothing.

## Group 6: Docs

13. [x] Remove `SPEC.md`; update links in `README.md` and `CLAUDE.md`.
14. [x] `CLAUDE.md`: spec-driven workflow section; `specs/` as the source of
    truth.
15. [x] `README.md`: project structure and the workflow.

## Group 7: Validation

16. [x] Lint, type-check, tests and build pass; no broken links to `SPEC.md`.
17. [ ] Owner reviews and commits.
