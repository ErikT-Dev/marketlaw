# Tooling setup proposal

Status: approved and set up, 2026-10-27.

## As installed

Differences from the proposal below, forced by compatibility:

- **ESLint 9.39.5**, not 10: the React and accessibility plugins do not support ESLint 10 yet.
- **Vitest 4.1.11**, not 5, and **`@cloudflare/vitest-plugin` 1.4.0** instead of
  `@cloudflare/vitest-pool-workers`, which Cloudflare renamed and deprecated.
- **`eslint.config.js`** and **`.size-limit.js`** instead of `.ts`, so they load without an extra
  dependency; the comment rule is still TypeScript (`eslint-rules/noComments.ts`).
- Added: `.prettierignore` (Prettier formats code only, never the spec, rules or docs),
  `.secretlintignore`, and the hook scripts in `tools/hooks/`, which are protected too.
- knip is told to ignore `valibot`, `@testing-library/react` and `@axe-core/playwright` until the
  first code uses them; remove them from `knip.json` then.
- Playwright's browsers are not downloaded yet (`npx playwright install chromium` before the first
  e2e test).
- `npm audit` reports 0 problems in what players download, and 16 in development tools, mostly
  through the old Wrangler 4.20 and Vite 6.3; they go away with the separate upgrade step.

Upgraded in plan phase 01 (2026-10-27), each to the newest release at least 14 days old:

| Package | Before | Now |
|---|---|---|
| `wrangler` | 4.20.0 | 4.150.0 (Workers `compatibility_date` 2026-10-06, its bundled runtime) |
| `vite` | 6.3.5 | 8.3.4 |
| `@vitejs/plugin-react` | 4.5.2 | 6.1.2 |
| `typescript` | 5.8.3 | 6.0.3, the newest `typescript-eslint` 8.71 supports (below 6.1; TypeScript 7 is out but unsupported) |
| `react`, `react-dom` | 19.1.0 | 19.3.0 (and `@types/react`, `@types/react-dom` 19.3.0) |
| `ajv` | 8.17.1 | 8.20.0, to clear an `npm audit` warning |
| `yaml` | 2.8.0 | 2.9.1, to clear an `npm audit` warning |

`npm audit` after the upgrades: 10 warnings (5 moderate, 5 high), all in development tools,
none in what players download. They remain because no fixed release is 14 days old yet:

- `undici`, `miniflare`, `wrangler`, `zod`, `@cloudflare/vitest-plugin`: fixed in Wrangler
  4.153 and `@cloudflare/vitest-plugin` 1.4.8, released 2026-10-26 and later.
- `vitest`, `@vitest/mocker`, `@vitest/coverage-v8`: fixed in Vitest 4.1.12, released
  2026-10-15.
- `deepmerge-ts` through `eslint-plugin-functional`: no release of the plugin uses the fixed
  `deepmerge-ts` 8 yet. It runs only inside ESLint on our own code.

The proposal as approved:

## Why

`CLAUDE.md` and `rules/*.md` say every rule is enforced by a tool, and that a task is done only
when `npm run check` is green. Today none of those tools exist: there is no `check`, `test`,
`harness` or `e2e` script, no linter, no test runner, no architecture check and no Claude Code
hooks. This step sets them up before any game code is written, so the first line of engine code
is already checked.

This step only adds tooling. It writes no game code and changes no behaviour.

## What needs your approval

Config files and `.claude/` are protected (`rules/workflow.md`), and every dependency needs your
approval. Approve or strike each item:

1. **The dev tools** in "Dependencies" below (all development-only, nothing reaches players).
2. **One runtime library, `valibot`**, for checking every message at the boundary.
3. **Creating the protected config files** listed in "Config files".
4. **Project Claude Code settings** in `.claude/settings.json` (hooks and permissions).
5. **The scripts** in `package.json`.
6. **CI:** run `npm run check` before every deploy.
7. **Housekeeping:** `.gitignore` additions and a Node version in `package.json`.
8. **Rules:** adding the new config files to the protected list in `rules/workflow.md`.

## Dependencies

All are `devDependencies` unless marked. None of them is in the game's download or the Worker.
Exact versions are pinned when installing (`.npmrc` has `save-exact`), each the newest release
that is at least 14 days old and works with the others, so a freshly published, possibly
compromised release is never picked up.

| Package | Version now | What it is for | Rules it enforces |
|---|---|---|---|
| `eslint`, `@eslint/js` | 10.x | The linter | Most code rules |
| `typescript-eslint` | 8.x | TypeScript rules: no `any`, no `!`, no casts, exhaustive switches, naming, readonly parameters | No escape hatches, discriminated unions, naming, immutable data |
| `eslint-plugin-sonarjs` | 4.x | Cognitive complexity | Size limits |
| `eslint-plugin-functional` | 10.x | No mutation | Immutable data |
| `eslint-plugin-import-x` | 4.x | Named exports only, no cycles in a file's imports | Style |
| `@eslint-community/eslint-plugin-eslint-comments` | 4.x | Bans `eslint-disable` comments | Fix the code, never the check |
| `@vitest/eslint-plugin` | 1.x | No `.skip`/`.only`, no snapshots in rules and server, ASCII test names | Never weaken tests, test names |
| `eslint-plugin-react`, `eslint-plugin-react-hooks` | 7.x | One component per file, hooks used correctly | Components |
| `eslint-plugin-jsx-a11y` | 6.x | Real buttons, labels, roles | Accessible controls |
| `eslint-plugin-testing-library` | 7.x | Tests select by role and name | Testable UI |
| `prettier` | 3.x | One formatting style | Style |
| `dependency-cruiser` | 18.x | Which folder may import which; no cycles; engine cannot reach the client or server | Dependency direction, pure engine, client renders |
| `knip` | 6.x | Unused files, exports and dependencies | Dependencies, reuse |
| `jscpd` | 5.x | Copy-pasted code | Reuse first |
| `vitest`, `@vitest/coverage-v8` | 5.x | Unit and scenario tests, coverage thresholds on `src/rules/` | Testing rules |
| `@cloudflare/vitest-pool-workers` | 0.23.x | Runs server tests inside the real Workers runtime, with Durable Object storage | Persist before ack, survives eviction, budgets |
| `@testing-library/react`, `jsdom` | 16.x, 30.x | Testing React components without a browser | Testable UI |
| `@playwright/test`, `@axe-core/playwright` | 1.64.x, 4.14.x | 2–4 browser players in one room, screenshots at 3 sizes, accessibility check | Multiplayer e2e, desktop sizes, accessibility |
| `size-limit`, `@size-limit/file` | 14.x | Fails when the first download is over the budget | Bundle size |
| `secretlint`, `@secretlint/secretlint-rule-preset-recommend` | 13.x | No keys or tokens in the repo | Secrets |
| `@types/node` | matching Node 24 | Types for `tools/` and test files, which today are not type-checked at all | Strict compiler |
| **`valibot`** (runtime) | 1.x | Parses every client message and stored state before use | Validate at the boundary |

**Why `valibot` and not `zod`:** both are named in `rules/architecture.md`. Valibot only adds the
pieces actually used, typically 1–3 KB to the download; `zod` adds noticeably more. The
alternative without either is hand-written parsers, like the prototype's `parseClientMessage.ts`,
which grow with every message type and are easy to get subtly wrong.

**Versions kept as they are:** TypeScript stays on 5.8.3, Vite on 6.x and Wrangler on 4.20 for
this step. TypeScript 7 is out, but the lint tools may not support it yet; upgrades are a separate
step you approve on their own.

## Config files

`rules/workflow.md` already protects the `tsconfig`, ESLint, dependency-cruiser, knip, Vitest and
Playwright files. This step adds the others to that list (`eslint-rules/`, `.prettierrc.json`,
`.size-limit.ts`, `.secretlintrc.json`, `.jscpd.json`), so Claude cannot loosen any check.

| File | What it holds |
|---|---|
| `eslint.config.ts` | The rules above, with stricter rules in `src/rules/` (no `Date`, `Math.random` or globals; readonly parameters) and in `src/server/` (no `ws.accept()`, no `setInterval`). Limits: 60 lines per function, 300 per file, 6 parameters, complexity 14, cognitive complexity 15, nesting 3. |
| `eslint-rules/noComments.ts` | A small project rule that rejects every code comment (no ESLint rule does this out of the box). |
| `.dependency-cruiser.cjs` | `rules/` imports only `shared/`; `bots/` and `hosts/` only `shared/`; `client/` only `shared/` and `hosts/`; `server/` may use `rules/`, `bots/`, `shared/`; no cycles. |
| `knip.json` | Entry points: the Worker, the client, the tools, the tests. |
| `vitest.config.ts` | Three test groups: engine and tools (Node), server (Workers runtime), client (jsdom). Coverage thresholds on `src/rules/`. |
| `playwright.config.ts` | Starts `wrangler dev`; desktop Chrome at 1280×720, 1920×1080 and 2560×1440; screenshots to `harness/screens/`. |
| `.size-limit.ts` | Reads the bundle budget from `harness/budgets.yaml`, so the number lives in one place. |
| `.prettierrc.json` | Formatting settings (2 spaces, double quotes, width 100, matching the current code). |
| `.secretlintrc.json` | The recommended preset. |
| `.jscpd.json` | Scans `src/` and `tools/`; fails on any duplicate block of 10 lines or more. |
| `tsconfig.engine.json` | `src/rules`, `src/bots`, `src/shared`: no browser and no Node types, so the engine cannot touch either. |
| `tsconfig.client.json` (changed) | Adds `src/hosts`. |
| `tsconfig.tools.json` | `tools/`, `eslint-rules/` and all test files, with Node types. |

## Scripts

| Script | Runs |
|---|---|
| `npm run typecheck` | Every `tsconfig` (engine, client, server, tools) |
| `npm run lint` | ESLint and Prettier check |
| `npm run arch` | dependency-cruiser |
| `npm run unused` | knip |
| `npm run dupes` | jscpd |
| `npm run secrets` | secretlint |
| `npm run test` | All Vitest tests, with coverage |
| `npm run harness` | `harness:check`, the scenario tests, and, once they exist, the simulator, invariants, leak test and budget check, writing `harness/report.html` |
| `npm run size` | Build, then size-limit |
| **`npm run check`** | All of the above, in that order; stops at the first failure |
| `npm run e2e` | Playwright (separate from `check`: it is slow and needs a running server) |

The `harness` runner itself (simulator, invariants, leak test, budgets) is game code and is built
during development. Until then `npm run harness` runs what exists, and says so in the report.

## Claude Code settings (`.claude/settings.json`)

| Setting | Effect |
|---|---|
| Deny writing the protected config files and `.claude/` | Claude cannot edit them at all; it can only propose. |
| Ask before writing anything in `harness/` | Every harness edit stops for your approval, which is the rule you set today. Generated files (`report.html`, `screens/`, `coverage.md`) and `harness/scenarios/proposed/` are allowed. |
| Deny writing `dist/`, `.wrangler/`, `coverage/` | Generated output is never edited. |
| PostToolUse hook | After Claude edits a `.ts`/`.tsx` file, ESLint checks that file and reports problems straight back. |
| Stop hook | When Claude finishes a turn in which `src/`, `tools/` or `harness/` changed, `npm run check` runs; if it fails, Claude is told and keeps working instead of reporting done. Turns with no such change skip it, so plain conversation stays fast. |

The deny and ask rules cover Claude's file tools; a shell command could still write a file, so
the rule "never edit protected files" also stays a written rule.

## CI

`.github/workflows/deploy.yml` runs `npm run check` before deploying, instead of only
`typecheck`. A red check means nothing is deployed. `e2e` is added to CI once the game has
screens to test.

## Housekeeping

- `.gitignore`: all of `design/` (the 189 MB `design/assets` is unprotected today),
  `harness/report.html`, `playwright-report/`, `test-results/`.
- `package.json`: `"engines": { "node": ">=24" }`, since the tools run TypeScript directly.
- `tools/harness-check/` and `tools/design-export/` get committed with this step, and are
  type-checked from now on.

## Order of work

1. Install the approved packages; record the exact versions.
2. Add the config files, scripts and `.claude/settings.json`.
3. Run `npm run check` on the current prototype and fix what it reports in `src/` and `tools/`
   (formatting, missing types). No behaviour changes.
4. Update `docs/enforcement.md` to match what is now really enforced.
5. Commit as `INFRA: Checks, tests and Claude Code hooks`.

## Not in this step

- Replacing the press-counter prototype (`CounterRoom`, press history, the `press_log` D1
  migration). That is the first development task, and needs a `wrangler.jsonc` change to remove
  the old Durable Object class, which you approve then.
- Upgrading TypeScript, Vite or Wrangler.
