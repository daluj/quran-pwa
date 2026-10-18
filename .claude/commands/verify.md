---
description: Run every check this project expects before a change is done
allowed-tools: Bash(npm run lint), Bash(npm run typecheck), Bash(npm test), Bash(npm run build), Bash(git status:*), Bash(git diff:*)
---

Run these in order and stop at the first failure, showing its output:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build` (it regenerates `src/data/` first)
5. `git status --short -- src/data` must print nothing. If the generated data
   changed, say which files and why (a change to `data/raw/`, the build
   script or `src/lib/arabic.ts`), and whether that was intended.

Then report a one-line result for each step. Don't commit anything.
