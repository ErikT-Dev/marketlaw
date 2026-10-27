# Phase 01: Toolchain and clean slate

Status: in progress
Milestone: 1 Foundations

## Goal

Start development on current tools and an empty, clean project: upgrade the toolchain, remove the
press-counter prototype, set up branch-per-phase deploys, and leave a live site that says the
game is being built.

## Depends on

Nothing. The tooling setup of 2026-10-27 is done.

## Covers

- Rules: none of the spec. `rules/cloudflare.md` (free-plan features, configuration),
  `rules/workflow.md` (dependencies).
- Scenarios, invariants, budgets: none.

## Builds

1. **Upgrades.** Approving this phase approves these dependency changes, each pinned to the
   newest release at least 14 days old that works with the rest:
   - Wrangler (from 4.20) and the Workers `compatibility_date` in `wrangler.jsonc`
   - Vite (from 6.3) and `@vitejs/plugin-react` (from 4.5)
   - TypeScript, to the newest version `typescript-eslint` supports
   - React, if a newer 19.x is out
   The goal is also to clear the 16 `npm audit` warnings in development tools; any that remain
   are listed with the reason.
2. **Remove the prototype:** `CounterRoom`, the press history, `RoomConnection`, `usePressHistory`
   and the client screen. The press-log table is dropped by a new D1 migration
   (`0002_drop_press_log.sql`), since `0001` has already run on the live database.
   `wrangler.jsonc` gets a Durable Object migration that deletes the old class (approved with
   this phase: `wrangler.jsonc` asks for approval).
3. **New skeleton:** `src/server/worker.ts` serves the client and has no game routes yet; an
   empty SQLite-backed `GameRoom` Durable Object is registered for phase 04; the client shows one
   page, "MarketLaw is being built", in the design's colours and fonts; the protocol version
   stays in `src/shared/PROTOCOL_VERSION.ts`.
4. **Branch per phase (D7):** GitHub runs `npm run check` on every branch push; only master
   deploys. A short note in `docs/` says how a phase branch is merged and how a bad deploy is
   rolled back (`wrangler rollback`).
5. **Owner action:** copy `design/export/` and `design/assets/` to a backup outside this
   computer (they exist only here).

## Known gaps after this phase

- The live site has no game yet.

## What you can see when it's done

- The live site shows "MarketLaw is being built".
- The phase report lists the versions now installed and the `npm audit` result.

## Exit criteria

- No prototype code or table is left (knip, and a D1 table listing).
- `docs/tooling-setup-proposal.md` "As installed" lists the new versions.
- A push to a branch runs the checks on GitHub without deploying.

## Open points

- If an upgrade breaks a tool (for example a lint plugin on a new TypeScript), that tool stays on
  its current version and the reason is recorded in `decisions.md`.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.

## Progress

- [x] 1. Upgrades: Wrangler and `compatibility_date`, Vite and `@vitejs/plugin-react`, TypeScript,
  React; `npm audit` result recorded. Also `ajv` and `yaml` (patch-level, to clear audit
  warnings); 10 audit warnings remain, listed in `docs/tooling-setup-proposal.md`.
- [x] 2. Remove the prototype; D1 migration `0002_drop_press_log.sql`; Durable Object migration
  deleting `CounterRoom` (tag `v2`, which also adds `GameRoom` on the same `ROOM` binding).
  Applied locally; the live database and class are changed by the first deploy from master.
- [x] 3. New skeleton: worker serving the client, empty `GameRoom`, "MarketLaw is being built"
  page in the design's colours and font (font files committed, owner's choice 2026-10-27).
  Source Sans 3 is one variable font file (29 KB, both weights) with its OFL licence in
  `src/client/assets/fonts/`. `PROTOCOL_VERSION` got a small schema test so knip does not report
  it as unused now that nothing imports it.
- [x] 4. Branch per phase: checks on every branch push, deploy only from master; merge and
  rollback note in `docs/merging-and-rollback.md`. Checks run in `.github/workflows/check.yml`.
- [ ] 5. Owner action: back up `design/export/` and `design/assets/` (reminded in the report)
