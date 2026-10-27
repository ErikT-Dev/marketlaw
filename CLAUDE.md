# CLAUDE.md

Browser-based, turn-based multiplayer card game with large hidden hands, for desktop browsers.
TypeScript everywhere: a shared pure rules engine, a React client, and an authoritative game
server on Cloudflare Workers + SQLite-backed Durable Objects (one per room), with D1 for data
that outlives a room (match history, players). Target cost: $0/month on the Cloudflare Free plan.

The human owner does not read the code. They work through `harness/` (specs, scenarios,
invariants, budgets) and the harness report. The code must be correct because the checks prove
it, not because someone reviewed it.

## Scope

**Multiplayer only.** Several players in shared rooms over WebSocket. The engine runs in the
room's Durable Object; the browser renders `PlayerView`s through `RemoteGameHost` and sends
intents. There is no offline mode. The only single-player mode is the tutorial, which runs in a
tutorial room on the server like any other game. Every rule in `rules/multiplayer.md` and
`rules/cloudflare.md` applies now. The client is desktop-only (see `rules/frontend.md`).

## Non-negotiables

1. **Done means `npm run check` is green.** Never report a task finished while any check fails,
   and never claim a check passed without running it.
2. **Never edit, delete or weaken any lint/type/test config.** Propose the change in chat and
   wait. **Never change anything in `harness/` without the owner's approval first** (except
   generated output and proposals in `harness/scenarios/proposed/`; see `rules/workflow.md`).
3. **Fix the code, never the check.** No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`,
   `.skip`, `.only`, lowered thresholds or new baseline entries to get green.
4. **The spec is the source of truth.** If code, a scenario and the spec disagree, or the spec is
   ambiguous, stop and ask. Do not pick an interpretation silently. Where the spec and the design
   contradict each other, the spec wins, every time. The spec is never ignored without the owner
   confirming first, and any deviation is written into the spec before it is implemented.
5. **The UI only ever receives a `PlayerView`, never the full game state.** Every view is built
   by `viewFor()`.
6. **The engine and the host decide; the UI only sends intents.** Every intent is validated
   against the authoritative state.
7. **No code comments.** Names and structure carry the meaning. See `rules/typescript.md`.
8. **Do only what was asked.** No unrequested behaviour changes, no drive-by refactors. If the
   ask conflicts with existing behaviour, explain the conflict and ask first.
9. **Reuse first.** Search for an existing helper, type or pattern before adding a new one.
10. **Ask before adding a dependency.**

## Commands

```bash
npm run check        # everything: types, lint, architecture, tests, harness, budgets
npm run test         # unit + scenario tests
npm run harness      # scenarios, invariants, simulator, leak test, budgets -> harness/report.html
npm run e2e          # Playwright tests + screenshots
npm run dev          # local client plus wrangler dev
```

## Rules

@rules/workflow.md
@rules/architecture.md
@rules/typescript.md
@rules/testing.md
@rules/frontend.md
@rules/multiplayer.md
@rules/cloudflare.md
