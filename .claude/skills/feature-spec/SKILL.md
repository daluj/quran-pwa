---
name: feature-spec
description: Starts the next Quran PWA feature the spec-driven way. Finds the next incomplete phase in specs/roadmap.md, interviews the user about scope, decisions and context, and writes a dated spec folder under specs/ with requirements.md, plan.md and validation.md. Use when the user says "feature spec", "next phase", "start the next feature", "spec this feature", or invokes /feature-spec.
---

# Feature Spec

Write the spec before any code. Never commit, merge or push: the owner reviews
and commits everything.

## Workflow

### 1. Find the phase

Read `specs/roadmap.md`. The next phase is the first one with unchecked `[ ]`
items. If the user named a feature that isn't on the roadmap, add it as a new
small phase (with a goal and a few `[ ]` items) and confirm with the user.

Derive a kebab-case feature name from the phase title, e.g.
"Audio Recitation — Play a Verse" → `audio-play-verse`.

### 2. Branch (optional)

Propose the branch name `phase-N-<feature-name>`. Create it with
`git switch -c` only if the user agrees; otherwise stay on the current branch.

### 3. Read the guidance

Read `specs/mission.md`, `specs/tech-stack.md`, `CLAUDE.md`, and the two most
recent spec folders under `specs/` (for format and level of detail). Look at
the code the phase will touch.

### 4. Interview the user, before writing any file

Use `AskUserQuestion` with exactly **3 questions in one call**, each with
concrete options drawn from the code and the roadmap item:

| Header        | Question focus                                                                 |
| ------------- | ------------------------------------------------------------------------------ |
| **Scope**     | What the feature does and doesn't do: screens, data, settings, edge cases      |
| **Decisions** | Key choices: storage, offline behaviour, UI pattern, defaults, new dependencies |
| **Context**   | Constraints: sources and licenses, accessibility, mobile/desktop, open questions |

Do not write files until all three are answered. Ask follow-ups if an answer
leaves a decision open.

### 5. Write the spec folder

`specs/YYYY-MM-DD-<feature-name>/`, using today's date.

#### `requirements.md`

- `## Scope`: one-paragraph summary, then `### Included` and `### Not included`.
  Use tables for settings, fields or wording.
- `## Decisions`: each choice and why (from the answers).
- `## Context`: links to `../mission.md` and `../tech-stack.md`, existing code
  and patterns to follow.

#### `plan.md`

- Numbered task groups, each with numbered `[ ]` tasks, usually in this order:
  Data → Logic → UI → Docs → Tests. Each group should be implementable and
  checkable on its own.
- Docs: update `README.md`, `specs/tech-stack.md` or `CLAUDE.md` if the feature
  changes setup, stack or conventions.

#### `validation.md`

- `## Automated Tests`: `npm run lint`, `npm run typecheck`, `npm test` (or
  `/verify`), then `### Specific test coverage required` with concrete
  assertions.
- `## Manual Checks (real browser)`: `npm run build && npm run preview`; mobile
  and desktop widths, light and dark mode, offline when relevant, axe with
  color contrast for UI changes.
- `## Definition of Done`: checks pass, the roadmap phase is checked off,
  `CHANGELOG.md` is updated (changelog skill), and the owner has reviewed and
  committed the work.

### 6. Link and stop

Add `Spec: [YYYY-MM-DD-<feature-name>](YYYY-MM-DD-<feature-name>/)` under the
phase's goal in `specs/roadmap.md`. Then summarize the spec and stop: don't
implement until the user approves it.

## Project constraints

- Offline-first, no backend, no accounts; user data stays on the device.
- Surahs by number only; no surah names anywhere.
- Never edit `data/raw/`; generated data comes from `npm run data`.
- New settings follow the checklist in `CLAUDE.md` (Settings, defaults,
  `validateBackup`, tests).
- Every text or audio source needs a credited source and license in
  `data/raw/SOURCES.md` before it ships.
- No new dependencies without the user's approval.
