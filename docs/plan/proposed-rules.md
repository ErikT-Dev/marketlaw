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
