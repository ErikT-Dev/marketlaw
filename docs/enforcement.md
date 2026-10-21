# Enforcement map

Which tool enforces each rule. When a rule moves fully into a tool, shrink its prose in
`rules/*.md` to one line. Rules marked **judgment** or **review** have no automatic check; they are
candidates for the reviewer agent (`.claude/agents/reviewer.md`).

## Tooling to set up

| Tool | Purpose |
|------|---------|
| `tsconfig.json` | strict compiler flags |
| ESLint (`typescript-eslint` strict-type-checked, `sonarjs`, `functional`, `import`, `vitest`, `jsx-a11y`, `react`, `testing-library`, `eslint-comments`) | code rules |
| Prettier | formatting |
| dependency-cruiser | layer boundaries, no cycles |
| knip | unused files, exports, dependencies |
| jscpd | duplicated code |
| Vitest | unit + scenario tests, coverage thresholds |
| Playwright | multi-browser e2e, screenshots, axe |
| size-limit | client bundle budget |
| secretlint | no secrets in the repo |
| Harness runner | scenarios, invariants, simulator, leak test, budgets -> `harness/report.html` |
| Claude Code hooks (`.claude/settings.json`) | PostToolUse: typecheck + lint the edited file; PreToolUse: block protected paths; Stop: `npm run check` |

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
| Dependency direction | architecture | dependency-cruiser |
| Pure rules engine | architecture | dependency-cruiser · ESLint `no-restricted-globals` · simulator |
| One source of truth for state | architecture | dependency-cruiser · review |
| One way out: `viewFor` | architecture | ESLint `no-restricted-syntax` · leak test |
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
| Touch first, large hands | frontend | Playwright screenshots |
| Accessible controls | frontend | `jsx-a11y` · axe |
| Bundle size | frontend | size-limit |
| Testable UI | frontend | `testing-library` ESLint plugin |
