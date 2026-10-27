# Enforcement map

Which tool enforces each rule. When a rule moves fully into a tool, shrink its prose in
`rules/*.md` to one line. Rules marked **judgment** or **review** have no automatic check; they are
checked by the phase review (`.claude/agents/phase-reviewer.md`, plan decision D16) at the end of
every phase.

## Tooling

Set up on 2026-10-27 (`docs/tooling-setup-proposal.md`). `npm run check` runs every row marked
"in check".

| Tool | Purpose | Status |
|------|---------|--------|
| `tsconfig.*.json` (engine, client, server, tools) | strict compiler flags; the engine has no browser or Node types | in check |
| ESLint (`typescript-eslint` strict-type-checked, `sonarjs`, `functional`, `import-x`, `@vitest/eslint-plugin`, `jsx-a11y`, `react`, `react-hooks`, `testing-library`, `eslint-comments`, project rule `eslint-rules/noComments.ts`) | code rules | in check |
| Prettier | formatting | in check |
| dependency-cruiser | layer boundaries, no cycles | in check |
| knip | unused files, exports, dependencies | in check |
| jscpd | duplicated code | in check |
| Vitest (engine: Node; server: Workers runtime via `@cloudflare/vitest-plugin`; client: jsdom) | unit + scenario tests, coverage thresholds on `src/rules/` (95% lines, statements, functions; 90% branches) | in check; no tests yet |
| Playwright | multi-browser e2e at 1280×720, 1920×1080, 2560×1440, screenshots, axe | `npm run e2e`; no tests yet; browsers not installed yet |
| size-limit | client bundle budget, read from `harness/budgets.yaml` B14 | in check |
| secretlint | no secrets in the repo | in check |
| Harness runner | scenarios, invariants, simulator, leak test, budgets -> `harness/report.html` | only `harness:check` so far; the rest is built with the engine |
| Claude Code hooks (`.claude/settings.json`, `tools/hooks/`) | PreToolUse: deny protected configs and generated output, ask before `harness/` and `wrangler.jsonc`; PostToolUse: lint the edited file; Stop: `npm run check` when code or harness changed | active |

Not yet enforced by a tool, because what they check does not exist yet: scenario tests, the
simulator and invariants, the leak test, the budget checks B1–B13 and B15–B18, hostile client
tests, replay determinism, state fixture tests and the restart e2e test. Until each exists, the
rules that rely on it are enforced by review only.

## Rule -> enforcement

| Rule | File | Enforced by |
|------|------|-------------|
| Done means check is green | workflow | Stop hook |
| Protected files | workflow | PreToolUse hook |
| Fix the code, never the check | workflow | ESLint `eslint-comments/no-use`, `ban-ts-comment`, `vitest/no-disabled-tests` |
| Spec wins, contradictions are questions | workflow | judgment |
| Scope discipline | workflow | judgment |
| Reuse first | workflow | jscpd · review |
| Dependencies | workflow | `.npmrc save-exact` · knip · judgment |
| Never edit generated output | workflow | PreToolUse hook |
| Harness changes only with the owner's approval | workflow | PreToolUse hook (asks) · judgment |
| Dependency direction | architecture | dependency-cruiser |
| Pure rules engine | architecture | dependency-cruiser · ESLint `no-restricted-globals` · simulator |
| One source of truth for state | architecture | dependency-cruiser · review |
| One way out: `viewFor` | architecture | leak test · review |
| Thin server | architecture | review · coverage |
| Validate at the boundary | architecture | types · hostile client scenarios |
| Versioned protocol and state | architecture | state fixture tests |
| One export per file | architecture | ESLint `max-lines` · review |
| Strict compiler | typescript | `tsconfig.json` |
| No escape hatches | typescript | `typescript-eslint` |
| No comments | typescript | ESLint custom rule |
| Discriminated unions, exhaustive switch | typescript | `switch-exhaustiveness-check` |
| Expected failures are values | typescript | review · scenarios |
| Immutable data | typescript | `functional/immutable-data` · `prefer-readonly-parameter-types` |
| Honest nullability | typescript | review |
| Branded ids | typescript | types · review |
| Naming | typescript | `naming-convention` · review |
| Size limits | typescript | `max-lines-per-function`, `max-lines`, `max-params`, `complexity`, `max-depth`, `sonarjs/cognitive-complexity` |
| Style | typescript | ESLint · Prettier |
| UTC time | typescript | types · review |
| Scenario per behaviour change | testing | coverage · judgment |
| Deterministic tests | testing | purity rules · simulator |
| Invariants under simulation | testing | harness |
| Leak test | testing | harness · e2e |
| Hostile client tests | testing | scenarios |
| Never weaken tests | testing | ESLint · protected paths |
| No snapshots for logic | testing | `vitest/no-restricted-matchers` |
| ASCII test names | testing | `vitest/valid-title` |
| Never trust the client | multiplayer | hostile client scenarios |
| Hidden info stays on server | multiplayer | leak test |
| Persist before ack | multiplayer | restart e2e · review |
| Idempotent, ordered actions | multiplayer | scenarios |
| Full resync | multiplayer | e2e |
| Unguessable tokens | multiplayer | forged-token scenario · review |
| Replays | multiplayer | replay determinism test |
| Budgets | cloudflare | harness budget check |
| Hibernation API only | cloudflare | ESLint `no-restricted-syntax` |
| Survives eviction | cloudflare | restart e2e |
| One write per action, one alarm per room | cloudflare | budget check |
| Free-plan features only | cloudflare | protected `wrangler.jsonc` · judgment |
| Secrets | cloudflare | secretlint |
| Client renders, server decides | frontend | dependency-cruiser |
| Desktop first, large hands | frontend | Playwright screenshots at 1280×720, 1920×1080, 2560×1440 |
| Accessible controls | frontend | `jsx-a11y` · axe |
| Bundle size | frontend | size-limit |
| Testable UI | frontend | `testing-library` ESLint plugin |
