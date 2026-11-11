# Proposed rule additions

Lessons Claude learned while building version 1, proposed as additions to `rules/*.md`
(`rules/workflow.md`, Self-improvement). Until version 1 is done, Claude collects them here
instead of editing the rules files (D19); the owner reviews them at the end.

## For `rules/cloudflare.md`

### Deleting a Durable Object class takes two deploys
Deploy the `deleted_classes` migration with no Durable Object bindings at all, then add any new
class and its binding in the next deploy.
**Why:** Cloudflare rejects a delete while the same deploy has a binding (code 10061), and the
deploy workflow has already run the D1 migrations by then (phase 01 merge, 2026-10-27).
**Enforced by:** judgment.

## For `rules/workflow.md`

### One phase per "continue", no pause inside it
"continue" runs the current phase to its end without stopping to report inside it. When the
phase is merged, deployed and the live site checked, stop and tell the owner; the next phase
starts only with the next "continue" (D28).
**Why:** the owner asked for no pauses inside or between phases (2026-10-27, 2026-11-03), then
chose one phase per "continue" with fresh helpers to cut token use (2026-11-04, D28).
**Enforced by:** judgment.

## For `rules/typescript.md`

### Ids from fixed lists are literal unions
"Branded ids" applies to ids made at run time (players, rooms, tokens). Names from a fixed list
(cards, types, quests, seats) are literal unions of the allowed values. In `src/rules/`, use
arrays and records, never `Map` or `Set`.
**Why:** `prefer-readonly-parameter-types` reports branded strings, `Map` and `Set` as writable
(Q7, phase 03). Literal unions are stricter than brands.
**Enforced by:** `@typescript-eslint/prefer-readonly-parameter-types` · types.

## For `rules/workflow.md`

### Keep the shell in the project root
Do not leave the shell inside a subfolder (`cd src/rules`). The PostToolUse lint hook looks for
ESLint relative to the shell's working directory, and from a subfolder every file write reports
"Cannot find module .../node_modules/eslint".
**Why:** found in phase 03; the errors looked like lint failures but were not.
**Enforced by:** judgment.

### Stop `wrangler dev` by its process, not its task
On Windows, stopping a background `npm run dev` leaves `wrangler dev` (node) and its `workerd`
running on port 8787, and Playwright's `reuseExistingServer` then tests the old code. Before
browser tests, check that nothing listens on 8787, and stop the `wrangler ... dev` node process
first, then `workerd`.
**Why:** found in phase 04; the browser tests failed against a stale server.
**Enforced by:** judgment.

## For `rules/frontend.md`

### Text colours are checked on solid backgrounds
Stat colours from the design (funds red, workforce green and others) are too dark for text on the
dark panels; stat numbers use a light tint of their colour, and the icon carries the full colour.
Axe cannot measure text over the semi-transparent panels on the background photo and passes it,
so contrast problems show up only where a background is solid.
**Why:** found in phase 09, when the opponent cards' solid background revealed 3.5:1 contrast.
**Enforced by:** axe in the browser tests · judgment for text over the photo.

## For `rules/workflow.md`

### Restart the dev server after client changes
`npm run dev` builds the client once and then serves that build. After changing client code,
stop the server (see "Stop `wrangler dev` by its process") before the browser tests, or they test
the old build.
**Why:** found in phase 09; a fixed contrast problem kept failing against the stale build.
**Enforced by:** judgment.

## For `rules/testing.md`

### A hand can hold two copies of a card
Card names in a hand are not unique. A browser test that finds a hand card by its name picks a
card held once (`e2e/cardsHeldOnce.ts`), or its locator matches two buttons and fails in strict
mode on some random deals.
**Why:** found in phase 10; `rejectedMove.spec.ts` failed at one screen size on a deal with two
Stone Houses.
**Enforced by:** judgment.

## For `rules/workflow.md`

### No pause at the end of a phase either
The phase review, report, merge and deploy follow the checks without asking the owner; only the
"Waiting for the owner" cases stop a phase.
**Why:** after phase 11's checks went green Claude asked whether to go on with the review; the
owner had already said not to (2026-10-29).
**Enforced by:** judgment.

## For `rules/testing.md`

### Vitest's `--mode` does not reach inline projects
Projects defined inline in `vitest.config.ts` keep the mode `test` whatever `--mode` says. Pass
run options to a test through an environment variable set by a Node launcher (as
`tools/harness-runner/runPhaseEndHarness.ts` does), since npm scripts run in `cmd` on Windows and
`sh` on GitHub.
**Why:** found in phase 11 (D23): `npm run harness --mode harness` silently simulated 500 games.
**Enforced by:** the harness test "simulates every game it was asked for".

## For `rules/typescript.md`

### Times in the engine are plain numbers
"Time": inside `src/rules/`, timestamps are plain UTC epoch milliseconds (`number`); they are
branded `EpochMs` everywhere else, and seat clocks leave the engine branded.
**Why:** `prefer-readonly-parameter-types` reports branded numbers as writable, like branded
strings (Q7, Q42, phase 14).
**Enforced by:** `@typescript-eslint/prefer-readonly-parameter-types` · types.

## For `rules/testing.md`

### Run the browser tests locally with two workers
On the 4-core development machine, `npm run e2e` with Playwright's default worker count makes the
local `workerd` drop connections ("Network connection lost", "recovered on attempt 2 after a
dropped connection to the UserWorker"), and several tests time out. `npx playwright test
--workers=2` passes. GitHub runs the suite as configured and is the judge.
**Why:** found in phase 15; the same failures appeared at the commit before the phase's server
changes, so they came from load, not from the code.
**Enforced by:** judgment.

## For `rules/workflow.md`

### Every commit type-checks on its own
Before committing part of the work, check that the staged files compile without the unstaged
ones (`git stash --keep-index`, then the type check). A shared type or interface change goes in
the same commit as its first user, or before it.
**Why:** found in the phase 16 review: a CLIENT commit used a host interface change that was only
committed afterwards, so the commit in between did not type-check, which breaks bisecting and
rolling back to it.
**Enforced by:** judgment.

## For `rules/cloudflare.md`

### Nothing runs at a Worker module's top level
Do not create a `Response`, `Request` or anything that does I/O, timers or randomness in a module
constant in `src/server/`; build it inside a function. The Workers runtime refuses to start
("Disallowed operation called within global scope"), and `wrangler dev` fails before any test.
**Why:** found in phase 19, when a shared `new Response("Not found")` constant stopped the local
server; type checks and unit tests did not notice.
**Enforced by:** browser tests (the server does not start) · judgment.

## For `rules/testing.md`

### Reopening a link in a browser test needs a real navigation
`page.goto` to a link that differs from the current address only after `#` does not reload the
page, so the app never reads the link again. Go to `about:blank` first.
**Why:** found in phase 19's room-not-found test, which reopened a seat link after the room was
deleted.
**Enforced by:** judgment.

## For `rules/architecture.md`

### Every message shape change raises the protocol version
Any change to the shape of a message in either direction, a view included (a field added,
removed or changed in type), raises `PROTOCOL_VERSION` in the same change.
**Why:** a tab still running the old client keeps sending the old version; if it is accepted,
it fails to read the new views. With the version raised, the server rejects it with
`wrong_protocol_version` and the client asks for a reload (Q75, phase 20a).
**Enforced by:** judgment · the phase review.

## For `rules/testing.md`

### A wall-clock budget needs repeated runs, not reruns
B11 (computing time per message, 99th percentile, limit 10 ms) is measured with the wall clock,
which counts other processes' load, and over only 55 messages, so its 99th percentile is the
slowest one. Since phase 24 the harness runs the room scenarios three times and keeps each
message's fastest time (Q118), so a load spike no longer fails it. A B11 failure is now a real
regression: do not rerun past it. Never raise the budget for a load spike.
**Why:** found in the phase 22 review (finding R4) and again in phase 24, where one
`npm run check` measured 12 ms; alone the slowest message takes 1 to 3 ms.
**Enforced by:** `tools/harness-runner/buildSteadyScenarioRuns.ts`.

### Tests that start the Worker must not need a built client
`wrangler.jsonc` serves `./dist/client` as assets, and wrangler's `createTestHarness` refuses to
start when that folder is missing. Locally it always exists from an earlier build, but GitHub's
Check job runs the tests before `npm run size` builds the client. A test that starts the Worker
creates the folder first (`tools/route-tests/startRouteTestServer.ts`).
**Why:** found at the phase 23 release: the route tests passed in every local run and failed on
the first branch check, which ran only at the release because the branch was first pushed then.
**Enforced by:** GitHub's branch check.

### Never force-remove a worktree that shares node_modules
A git worktree whose `node_modules` is a junction to the main checkout's must have the junction
removed first; `git worktree remove --force` follows it and empties the main `node_modules`
(including `node_modules/.cache/marketlaw/`). Restore with `npm ci`.
**Why:** found in the phase 25 timing fix, which compared master and the branch in a worktree.
**Enforced by:** judgment.
