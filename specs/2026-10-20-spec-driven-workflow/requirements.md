# Requirements: Spec-Driven Workflow

> Written on 2026-10-20. Covers the Claude Code setup of 2026-10-18 (commit
> `391542b`) and the move to spec-driven development.

## Scope

Organize the project for spec-driven development with coding agents, following
the DeepLearning.AI / JetBrains course "Spec-Driven Development with Coding
Agents" and its companion repository
(`https-deeplearning-ai/sc-spec-driven-development-files`).

### Included

- **Constitution** in `specs/`: `mission.md`, `tech-stack.md`, `roadmap.md`
  (small phases with checkboxes, each linking to its spec folder).
- **Feature specs:** one dated folder per phase,
  `specs/YYYY-MM-DD-<feature>/` with `requirements.md` (scope, decisions,
  context), `plan.md` (numbered task groups) and `validation.md` (automated and
  manual checks, definition of done). Phases 1–9 backfilled.
- **Skills** in `.claude/skills/`: `feature-spec` (next phase → interview →
  spec folder) and `changelog` (CHANGELOG.md from git history).
- **`CHANGELOG.md`** in the project root, grouped by date.
- **Retire `SPEC.md`:** its content now lives in `specs/` (git history keeps
  the old file).
- **Agent setup:** `CLAUDE.md` (commands, architecture, conventions, the
  workflow), `.claude/settings.json` (allowed checks; `git commit` and
  `git push` blocked), `/verify` command.

### Not included

- Changes to app code or behaviour.
- `TODO.md` and `backlog/` from the course: the roadmap already holds the
  upcoming phases. Research notes can go in `backlog/` when a phase needs them.

## Decisions

- **Audience** (from the owner): Muslims, as a free public app. This makes a
  verified translation source a release requirement (mission and tech-stack
  gaps), though it isn't a roadmap phase yet.
- **Next phases** (from the owner): audio recitation, split into three small
  phases (play a verse, continuous playback, offline audio).
- **Backfill** every completed phase as a spec folder, dated by its commits,
  marked "Backfilled on 2026-10-20".
- **Remove `SPEC.md`** so `specs/` is the single source of truth.
- **No commits by agents:** the course's skill creates a branch and commits at
  merge; here the owner commits, so the `feature-spec` skill only proposes a
  branch and never commits, and `.claude/settings.json` blocks `git commit`
  and `git push`.
- **Skills live in `.claude/skills/`** (project skills for Claude Code). The
  specs themselves are plain Markdown, so any agent can follow them.

## Context

- Course workflow: constitution → feature spec (interview first, 3 grouped
  questions) → implement task groups → validate → mark the phase done →
  replan; legacy projects get a constitution rebuilt from existing docs.
- [mission.md](../mission.md), [tech-stack.md](../tech-stack.md),
  [roadmap.md](../roadmap.md).
