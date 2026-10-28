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

### No pause between phases
When a phase is merged, deployed and the live site checked, start the next phase in the same
session with a one-line status; do not end the turn to report and wait for "continue".
**Why:** the owner asked for this after phase 02 (2026-10-27), when Claude stopped after the merge.
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

## For `rules/testing.md`

### Client tests clean up only when told to
Vitest runs without globals here, so React Testing Library does not unmount between tests, while
`testing-library/no-manual-cleanup` forbids calling `cleanup`. Until `vitest.config.ts` (protected)
gets a client `setupFiles` entry that calls `cleanup` after each test, a client test that renders
something another test in the same file also renders ends with `view.unmount()`.
**Why:** found in phase 05; the card tests found two "Loft" buttons from earlier tests.
**Enforced by:** judgment · proposed config change for the owner.
