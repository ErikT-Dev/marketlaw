# Testing

### Every behaviour change has a scenario
Any change to game rules or protocol comes with scenarios that cover it. If the owner's
scenarios do not cover the change, add proposals in `harness/scenarios/proposed/` and say so.
**Why:** scenarios are the owner's only view of what the game does.
**Enforced by:** judgment · coverage on `src/rules/`.

### Test behaviour, not implementation
Tests drive the public API (`apply`, `viewFor`, the socket protocol, the UI) and assert on
observable results. Do not test private helpers or mock internal modules.
**Why:** implementation tests break on every refactor and prove nothing about behaviour.
**Enforced by:** review.

### Deterministic tests
All randomness goes through a seeded RNG; all time through an injected clock. A failing test
prints the seed and the action log needed to replay it.
**Why:** flaky tests teach everyone to ignore failures.
**Enforced by:** `src/rules/` purity rules · simulator.

### Invariants under simulation
The simulator plays seeded random games and checks every invariant in
`harness/invariants.yaml` after every action, in `npm run check` (the Stop hook and GitHub) and in `npm run harness`,
which runs at the end of every phase. The game counts live only in `tools/harness-runner/SIMULATED_GAMES.ts`
(plan decision D25).
A violation produces a minimal reproducing seed.
**Why:** random play finds the rare states that hand-written cases miss.
**Enforced by:** `npm run harness`.

### Leak test
Every server-to-client message in the simulator and e2e tests is checked: no message to player A
may contain any card id that is hidden from A.
**Why:** a hidden-information leak breaks the game and is invisible in normal play.
**Enforced by:** `npm run harness` · `npm run e2e`.

### Hostile client tests
The protocol is tested with out-of-turn actions, cards not held, replayed and duplicated
messages, stale state versions, malformed payloads and forged player tokens. Each must be
rejected with a typed reason and leave state unchanged.
**Why:** anything the browser can send, a cheater can send.
**Enforced by:** scenario tests.

### Multiplayer e2e
Playwright runs 2-4 browser contexts in one room: full game, refresh mid-game, disconnect and
rejoin, second tab for the same player. Screenshots of key screens go to `harness/screens/`.
**Why:** the realtime path is where unit tests stop proving anything.
**Enforced by:** `npm run e2e`.

### Never weaken tests
Do not delete, skip, loosen assertions in, or rewrite a failing test to match broken behaviour.
If a test is genuinely wrong, stop and explain. Until version 1 is done (plan phase 30),
scenarios not on the required list (`harness/required.yaml`) do not fail the check; this is the
only allowed form of skipping, and names leave that list only with the owner's approval.
**Why:** a test changed to pass is a test that no longer tests.
**Enforced by:** ESLint `vitest/no-disabled-tests`, `vitest/no-focused-tests` · protected paths.

### No snapshots for logic
Do not use snapshot tests for rules or protocol; assert explicit values. Visual screenshots are
fine for UI.
**Why:** snapshot updates get accepted without reading them.
**Enforced by:** ESLint `vitest/no-restricted-matchers` (`toMatchSnapshot`) in `rules/` and `server/`.

### Test names
Test names are ASCII-only sentences describing behaviour: `rejects a card the player does not
hold`.
**Why:** non-ASCII names break some CI report generators; sentences read as a spec.
**Enforced by:** ESLint `vitest/valid-title` with a pattern.
