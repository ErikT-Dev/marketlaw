# CLAUDE.md

Browser-based, turn-based card game with large hidden hands. TypeScript everywhere: a shared pure
rules engine, a React client, and (in phase 2) an authoritative game server on Cloudflare
Workers + SQLite-backed Durable Objects (one per room). Target cost: $0/month on the Cloudflare
Free plan.

The human owner does not read the code. They work through `harness/` (specs, scenarios,
invariants, budgets) and the harness report. The code must be correct because the checks prove
it, not because someone reviewed it.

## Phases

- **Phase 1 (current): single-player.** A solo game: one player tries to finish the game as fast
  as possible. No opponents and no bots. Runs entirely in the browser: the engine runs behind
  `LocalGameHost`, and games are saved to browser storage. Deployed as a static site on
  Cloudflare Pages. No server code.
- **Phase 2: multiplayer.** Several players in shared rooms over WebSocket. The same engine runs
  behind `RemoteGameHost` in a Durable Object.

**Design every part for phase 2, build only phase 1.** Do not create `src/server/`, Workers,
Durable Objects, lobby or networking code until the owner starts phase 2. Rules in
`rules/multiplayer.md` and `rules/cloudflare.md` marked *phase 2* are design constraints now and
build requirements later.

## Non-negotiables

1. **Done means `npm run check` is green.** Never report a task finished while any check fails,
   and never claim a check passed without running it.
2. **Never edit, delete or weaken anything in `harness/`** (except generated `screens/` and
   `report.html`) **or any lint/type/test config.** Propose the change in chat and wait.
3. **Fix the code, never the check.** No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`,
   `.skip`, `.only`, lowered thresholds or new baseline entries to get green.
4. **The spec is the source of truth.** If code, a scenario and the spec disagree, or the spec is
   ambiguous, stop and ask. Do not pick an interpretation silently.
5. **The UI only ever receives a `PlayerView`, never the full game state**, in phase 1 as well
   (the deck order stays hidden even in a solo game). Every view is built by `viewFor()`.
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
npm run dev          # local client (phase 2: plus wrangler dev)
```

## Rules

@rules/workflow.md
@rules/architecture.md
@rules/typescript.md
@rules/testing.md
@rules/frontend.md
@rules/multiplayer.md
@rules/cloudflare.md
