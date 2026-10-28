# Phase 08: Bots, simulator, replays and test rooms

Status: done
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
- Simulated players get cards only from their starting hands until the market phase (phase 12),
  so income, and with it I8 and I9, is rarely reached in simulation; a mutation check showed the
  simulator catches a lost card (I1) in every game. Phases 10 and 12 widen this.
- The live site has no test-room secret until the owner sets one (see Waiting for the owner).

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

## Progress

- [x] 1. Two bots in `src/bots/`: the legal bot plays only cards its view marks playable,
  preferring the kind that fixes its weakest stat, sells sometimes, and ends its turn; the chaos
  bot also sends illegal, stale and malformed messages.
- [x] 2. Simulator (`tools/simulator/`): 10,000 seeded games with 2, 3 and 4 seats, half per bot,
  through the room core (`receiveMessage` with counting storage), until turn 10. After every
  message it checks the invariants (the engine's check for accepted moves; for rejected and
  repeated ones, that no view or state version changed, I27) and counts rows written (B1, B2). A
  failure names the shortest failing game: seed, seats, bot and every message. I2, I8 and I9 were
  added to the engine's check. The 12 invariants are now required (Q24).
- [x] 3. Run time: one worker per core, from a Vite bundle; 10,000 games take about 40 seconds on
  8 cores and `npm run check` about 2 minutes, so the smaller Stop-hook set of D9 is not needed.
- [x] 4. Replay check (I26): every game is replayed from its seed and action log, comparing the
  state after every action.
- [x] 5. Test rooms as a command (Q25): `npm run test-room -- <file> <number> [site]`, a
  secret-protected `POST /api/test-rooms` that answers "Not found" without the secret, and seat
  links that sign a browser in. Server tests check the secret; browser tests check the 404 and use
  test rooms for real income and the action limit (the follow-ups from phases 06 and 07), with
  screenshots. Guide: `docs/test-rooms.md`.

## Waiting for the owner

1. **The live test-room secret.** Run `npx wrangler secret put TEST_ROOM_SECRET` and enter a long
   random value. Until then the live site answers "Not found" to every test-room request, so
   nothing is exposed; only starting a test room on the live site waits for it. Test rooms work
   locally and in the browser tests without it.

## Report

**What was built.**
- **Bots (`src/bots/`):** a legal bot that only sends moves its view allows and plays the kind of
  card that fixes its weakest stat, and a chaos bot that also sends illegal moves, legal moves with
  an old state version, repeated messages and malformed text.
- **Simulator (`tools/simulator/`):** 10,000 seeded games on every harness run, with 2, 3 and 4
  seats and both bots, through the real room code until turn 10, on one worker per core (about 40
  seconds). After every message it checks the 12 required invariants; it counts rows written (1 per
  accepted action, 0 for anything else: B1 and B2); and it replays every game from its seed (I26).
  A failure names the shortest failing game and its messages up to the failure; a crash names its
  seed. The full check runs in about 2 minutes, so D9's smaller set is not needed.
- **Test rooms:** `npm run test-room -- <file> <number> [site]` starts a live room from a
  scenario's starting situation and prints a link per seat (`docs/test-rooms.md`). Without the
  secret the site answers "Not found"; seat links work only for test-room seats and ask before
  replacing an account (C5).
- **Browser tests in test rooms:** real income, the action limit, and the 404 without the secret.

**What to try (after the merge).** Locally: `npm run dev`, then
`npm run test-room -- combos-and-income 9`, open the two links in two windows, play Liquor Shop in
seat 1 and watch income and the draw log. Open `harness/report.html` and read the Simulation
section. On the live site, after setting the secret (below), the same command with the site's
address.

**Differences from the phase file.**
- The test-room tool is a command, not a page (Q25).
- Simulated players only have their starting hands until phase 12, so income (I8, I9) is rarely
  reached; a stored game that loses a card is caught by a test (I1).

**Decisions:** Q24 (the 12 invariants are required), Q25 (a command, not a page), Q26 (seat links
and test-room replays; C5 in the spec).

**Phase review findings and what happened to each:**
1. **A link could silently replace any visitor's account.** Fixed (Q26, C5): only confirmed
   test-room seats are accepted, and the browser asks before switching.
2. **Stale versions were only sent with illegal moves.** Fixed: they carry legal moves.
3. **Repeated messages were never sent.** Fixed: the chaos bot repeats; accepted means the action
   log grew.
4. **The failing action list was the whole game.** Fixed: it stops at the first violation.
5. **The test-room tool dropped scenario fields silently.** Fixed: it refuses and names them.
6. **Test rooms could not be replayed.** Fixed: saves keep the starting state (save version 3).
7. **A crash gave no seed; a dead worker could hang.** Fixed.
8. **No test showed a real violation reaching the report.** Fixed with a stored-game seam test.
9. **Unseeded player ids.** Fixed: ids come from the seed.
10. **Duplicated header and secret reader; schema place; duplicate cards accepted.** Header and
    reader shared. The game-state schema stays in `src/server/testRooms/` because only the
    server uses it; duplicates are not checked because only the secret holder can send a state.
11. **Bundle folders piled up.** Fixed: one folder per tool, reused.
