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
| Vitest (engine: Node; server: Workers runtime via `@cloudflare/vitest-plugin`; client: jsdom) | unit + scenario tests, coverage thresholds on `src/rules/` (95% lines, statements, functions; 90% branches) | in check; the engine is measured from phase 03 |
| Playwright | multi-browser e2e at 1280×720, 1920×1080, 2560×1440, screenshots, axe | from phase 04: two browsers through turn 1 with the leak check and axe, and an idle client (B10); from phase 05: the game screen with 4 players at each size, saved to `harness/screens/`, with no horizontal scrolling, 24 px targets and axe; from phase 06: the same checks on the selected card, sell mode, done state and a rejected move (the browser test changes a play on the socket); from phase 08: test rooms (404 without the secret, real income, the action limit); from phase 20: complete games with 2, 3 and 4 players from the lobby to the end screen at each size, asserting B15 (95th percentile from a move to the updated view, limit read from `harness/budgets.yaml`) and saving the key screens, and a daily limit notice in the lobby (through the test route for today’s counts); from phase 21: room chat with 3 players in the waiting room and in a game, a mute that hides messages in one window only and the chat limit message, with screenshots; GitHub runs them on every branch and before every deploy |
| size-limit | client bundle budget, read from `harness/budgets.yaml` B14 | in check; from phase 05 only the first screen counts: the entry chunk, its CSS and the chunks it imports, from Vite's manifest |
| secretlint | no secrets in the repo | in check |
| Harness runner (`tools/harness-runner/`, run by Vitest in `npm run harness`) | scenarios through drivers, the required list `harness/required.yaml`, the card-data check, then invariants, simulator, leak test, budgets -> `harness/report.html` (kept by GitHub with every run) | in check since phase 02 (format check, card-data check, required list); phase 03 adds the engine driver; phase 04 the room driver, which counts rows written (B1, B2 required) and shows time per message (B11); phase 07 the statistical tier check (100,000 draws per turn within 1 percentage point of R17.10) and the draw log in view checks (`log_contains`); phase 08 the simulator: bot games (the counts per `npm run check` and per `npm run harness` live only in `tools/harness-runner/SIMULATED_GAMES.ts`, D25) through the room core on one worker per core, every required invariant after every message, the replay check (I26), and rows written for B1 and B2; phase 09 the leak test and view checks in the simulator (I23, I24, I25); phase 10 the project and type-count invariants (I12, I13, I14); phase 12 the market phase in the simulator and the marketplace and first-player invariants (I3, I4, I20), with marketplace cards taken treated as known by the leak test; phase 13 quests in the simulator, I12 for quests and the quests table invariants (I15, I16); phase 14 clocks in the simulator (the room alarm fires as its clock passes; time-outs, I19), alarm changes per turn (B3) and awake time by the sleep model in `docs/sleep-model.md` (B12); phase 15 legal-bot games played to the end (chaos-bot games until turn 10, Q46), the end-of-game invariants (I21, I22), the per-game budgets B4, B5, B9 and B16, the stored room and replay record sizes (B13, B17), and the game-length section for O5; in `npm run check` the harness test runs once, inside `npm run test`; phase 17 the busy-day simulator (`tools/simulator/busyDay/`), which plays a day of 50 rooms through the room and lobby code and measures B18; phase 19 the replay export check (a running and an ended room are exported and replay exactly, M4.2), leaving in chaos-bot games, and the lobby driver for ended rooms and replay records; phase 20 the lobby driver for the daily limits, B11 required (the 99th percentile, over every message the room scenarios send through the production path `receiveCheckingGameStart`, of the time the room takes to handle one message), B16 with the busy-day reads outside the games, and B18 with the rows of each room's end (replay record, its 30-day delete, the room's storage delete and the lobby report), and a budget section in the report that lists every budget with its limit, its measurement and where it is measured; phase 20a the leak test with the discard pile's cards hidden from every seat (M3.2), and I24 comparing the discard count each seat is shown; phase 21 the lobby driver's chat steps (send, mute, unmute, the chat a player sees and is notified of, saved before shown), B7 required (room rows written per accepted chat message, mute or unmute, limit 1), and B18 with 2,000 chat messages across the busy day (the lobby's quota blocks and the chat blocks deleted with the rooms) |
| GitHub Actions (`.github/workflows/check.yml`, `deploy.yml`) | `npm run check` on every branch push; master runs it again, then migrates D1 and deploys (D7, `docs/merging-and-rollback.md`) | active since phase 01 |
| Claude Code hooks (`.claude/settings.json`, `tools/hooks/`) | PreToolUse: deny protected configs and generated output, ask before `harness/` and `wrangler.jsonc`; PostToolUse: lint the edited file; Stop: `npm run check` when code or harness changed | active |

Not yet enforced by a tool, because what they check does not exist yet: scenario tests, the
simulator and invariants, the leak test, the budget checks B1–B13 and B16–B18, hostile client
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
