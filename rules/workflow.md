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
scenarios disagree, or a case is not covered, stop and ask. After the owner decides, the owner
updates the spec, then you implement.
**Why:** silently chosen interpretations turn into behaviour nobody asked for.
**Enforced by:** judgment.

### Protected files
Never create, edit or delete files under `harness/` (except `harness/screens/` and
`harness/report.html`), nor `tsconfig*.json`, `eslint.config.*`, `.dependency-cruiser.*`,
`knip.*`, `vitest.config.*`, `playwright.config.*`, `.claude/`. Propose changes in chat.
You may add new scenarios only in `harness/scenarios/proposed/`, for the owner to accept.
**Why:** the agent must not be able to grade its own work by moving the goalposts.
**Enforced by:** Claude Code PreToolUse hook blocks writes to these paths.

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
Ask before adding, removing or upgrading a dependency. State what it is for, its size impact on
the client bundle, and the alternative without it. Pin exact versions.
**Why:** every dependency costs bundle size, Worker size limits and supply-chain risk.
**Enforced by:** `save-exact=true` in `.npmrc` · knip (unused dependencies).

### Never edit generated output
Do not edit anything under `dist/`, `.wrangler/`, `coverage/` or other generated directories.
Change the source and regenerate.
**Why:** generated files are overwritten on the next build.
**Enforced by:** `.gitignore` · PreToolUse hook.

### Commits
Commits are made by the owner unless asked otherwise. When asked to write a commit message, use
`<AREA>: <description>` where AREA is 1-3 ALL-CAPS words (`RULES`, `SERVER`, `CLIENT`,
`HARNESS`, `INFRA`, `BUG FIX`, `REFACTOR`). One logical change per commit.
**Why:** a readable history is how the owner audits change without reading code.
**Enforced by:** judgment.

### Self-improvement
When the owner corrects you, or you discover non-obvious project behaviour (a tool quirk, a
platform limit, a trap), propose a short addition to the relevant `rules/*.md` file so the next
session does not repeat it. Do not edit rules files without approval.
**Why:** lessons that are not written down are relearned every session.
**Enforced by:** judgment.
