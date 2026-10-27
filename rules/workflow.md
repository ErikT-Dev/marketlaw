# Workflow

### Definition of done
A task is done when `npm run check` passes, every scenario touched by the change passes, and the
change does exactly what was asked.
**Why:** the owner does not read code; a green check is the only evidence of correctness.
**Enforced by:** Claude Code Stop hook runs `npm run check`.

### Report outcomes faithfully
If a check fails, say so and show the output. If a step was skipped, say which and why. Never
summarise a partial result as success.
**Why:** a false "done" is invisible to an owner who does not read code, and compounds.
**Enforced by:** judgment.

### The spec wins; contradictions are questions
`harness/spec/` and `harness/scenarios/` define behaviour. When the request, the spec and the
scenarios disagree, or a case is not covered, that is a question. Until version 1 is done (plan
decision D19), Claude solves it itself and records the question and the solution in
`docs/plan/open-questions.md` before implementing it.
- Where the spec and the design (`design/export/`) contradict each other, the spec wins, every
  time.
- The spec is never ignored or worked around silently.
- Any deviation from the spec is first written into the spec, and only then implemented.
**Why:** silently chosen interpretations turn into behaviour nobody asked for, and a spec that
the code no longer matches stops being the owner's view of the game.
**Enforced by:** judgment.

### Protected files
Never create, edit or delete `tsconfig*.json`, `eslint.config.*`, `eslint-rules/`,
`.dependency-cruiser.*`, `knip.*`, `vitest.config.*`, `playwright.config.*`, `.prettierrc*`,
`.prettierignore`, `.size-limit.*`, `.secretlint*`, `.jscpd.*`, `tools/hooks/` or `.claude/`.
Propose changes in chat.
**Why:** the agent must not be able to grade its own work by moving the goalposts.
**Enforced by:** Claude Code PreToolUse hook (`tools/hooks/guardProtectedPaths.ts`) blocks writes
to these paths with the file tools.

### The harness changes only on the record
Until version 1 is done (D19), Claude may create, edit or delete anything in `harness/` (specs,
scenarios, invariants, budgets, format files), each change in its own `HARNESS:` commit and
recorded in `docs/plan/open-questions.md`. A scenario is changed only when it contradicts the
spec, never because the code disagrees with it; names leave `harness/required.yaml` only with the
owner's approval.
**Why:** the harness is the owner's view of the game and the measure of the code; every change to
it must be visible to the owner when they review version 1.
**Enforced by:** judgment · the phase review.

### Fix the code, never the check
Never add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `as any`, `.skip`, `.only`,
`test.todo` in place of a failing test, raised budgets or lowered coverage thresholds. If a rule
is genuinely wrong for a case, stop and explain why.
**Why:** each suppression is a hole in the only safety net the project has.
**Enforced by:** ESLint (`eslint-comments/no-use`, `@typescript-eslint/ban-ts-comment`,
`vitest/no-focused-tests`, `vitest/no-disabled-tests`).

### Scope discipline
Change only what the task needs. No drive-by refactors, renames or reformatting of unrelated
code. Never change existing behaviour (rules, timings, limits, message shapes) beyond the ask;
if the ask requires it, explain the conflict and ask first.
**Why:** small diffs are reviewable by checks and easy to roll back; unrequested changes break
scenarios the owner did not expect to revisit.
**Enforced by:** judgment.

### Reuse first
Before writing a helper, type, component or pattern, search the codebase for an existing one and
use it. Introduce a new pattern only when no existing one fits, and say so.
**Why:** duplicated logic drifts apart and produces inconsistent rules.
**Enforced by:** judgment · `jscpd` duplication check.

### Dependencies
Until version 1 is done (D19), Claude may add, remove or upgrade a dependency, recording what it
is for, its size impact on the client bundle and the alternative without it in
`docs/plan/open-questions.md`. Pin exact versions, each release at least 14 days old.
**Why:** every dependency costs bundle size, Worker size limits and supply-chain risk.
**Enforced by:** `save-exact=true` in `.npmrc` · knip (unused dependencies).

### Never edit generated output
Do not edit anything under `dist/`, `.wrangler/`, `coverage/` or other generated directories.
Change the source and regenerate.
**Why:** generated files are overwritten on the next build.
**Enforced by:** `.gitignore` · PreToolUse hook.

### Commits
While building a plan phase, Claude commits to that phase's branch as it goes (`docs/plan/README.md`,
"How a phase is built"). Until version 1 is done (D19), Claude merges a finished phase into master,
which deploys, itself, once its checks and the phase review pass. Outside plan phases, commits are made by the owner unless asked otherwise. Commit
messages use `<AREA>: <description>` where AREA is 1-3 ALL-CAPS words (`RULES`, `SERVER`,
`CLIENT`, `HARNESS`, `INFRA`, `BUG FIX`, `REFACTOR`). One logical change per commit.
**Why:** a readable history is how the owner audits change without reading code.
**Enforced by:** judgment.

### Self-improvement
When the owner corrects you, or you discover non-obvious project behaviour (a tool quirk, a
platform limit, a trap), propose a short addition to the relevant `rules/*.md` file so the next
session does not repeat it. Do not edit rules files without approval; until version 1 is done,
write the proposals into `docs/plan/proposed-rules.md` and read that file at the start of a
session.
**Why:** lessons that are not written down are relearned every session.
**Enforced by:** judgment.
