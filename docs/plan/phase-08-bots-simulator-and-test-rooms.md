# Phase 08: Bots, simulator, replays and test rooms

Status: approved
Milestone: 3 Playthrough

## Goal

The simulator that plays thousands of seeded games and checks every invariant after every
action, the replay check, and the owner-only test-room tool.

## Depends on

Phase 07.

## Covers

- Invariants: I1, I2, I5, I6, I7, I8, I9, I10, I17, I18, I26, I27 in the simulator.
- Budgets: B1 and B2 over all simulated games.
- `rules/testing.md` "Invariants under simulation", `rules/multiplayer.md` "Replays", D8, D9.

## Builds

1. **Two bots** in `src/bots/`, each taking a `PlayerView` and returning an intent: a **legal
   bot** that only sends moves its view allows, used for budgets and game-length numbers; and a
   **chaos bot** that also sends illegal and malformed moves, used for invariants and rejections.
2. **Simulator:** at least 10,000 seeded games with 2, 3 and 4 seats through the room core,
   every implemented invariant after every action, and on a failure the shortest seed and action
   list that reproduces it. Games run in parallel. Until phase 15 a game stops at a fixed turn.
3. **Run time:** `npm run check` finishes in under 5 minutes locally. If that cannot be met with
   parallel games, the Stop hook runs a smaller seeded set (D9); `npm run harness` and GitHub
   always run 10,000.
4. **Replay check** (I26): every simulated game replays exactly from its seed and action log.
5. **Test rooms (D8):** an owner-only page, protected by a secret set with `wrangler secret`,
   that starts a live room from any scenario's `given`, so later phases can be tried without
   playing dozens of turns. A test checks that the page refuses requests without the secret.

## Known gaps after this phase

- Simulated games stop at a fixed turn until phase 15.

## What you can see when it's done

- The harness report shows the invariants holding over 10,000 games and the replay check.
- The owner starts a test room from a scenario on the live site.

## Exit criteria

- All listed invariants hold over 10,000 games; the replay check passes; `npm run check` runs in
  under 5 minutes locally (or D9 applies).

## Open points

- From phase 06: add a browser test of the action limit (S8.4) at every size, using a test room
  that starts a player at 49 actions, with a screenshot ("action-limit-reached").
- From phase 07: add a browser test that reaches real income in a test room (product and
  distribution ready) and finds the income draw in the draw log at every size.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.
