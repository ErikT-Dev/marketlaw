# Phase 14: Clocks and the time bank

Status: done
Milestone: 3 Playthrough

## Goal

Every time limit of R9 except pausing: the main-phase limit, market-go limits, free time, the
time bank, time-outs, all measured by the server with one alarm per room.

## Depends on

Phase 12.

## Covers

- Rules: R9.1–R9.10, R9.11's count and message (leaving after 3 comes in phase 19), R8.3–R8.4,
  R18.11, R5.6.
- Invariants: I19.
- Budgets: B3 (alarm changes per turn), B12 (room awake time per game).
- Screens: S2.3 (your clock, market-go countdown, time bank), S3.1's live banks, S9.4 "your time
  ran out" with "This was 1 of 3". Design boards "Timer chip", "Game: out of time".

## Builds

1. **Deadlines in the engine** from injected time: per-player main-phase deadlines, market-go
   deadlines, free time, bank use in milliseconds, rejection at or after the deadline with the
   time-out applied (R9.6).
2. **One alarm per room, always set to the earliest pending deadline.** Every later timer (accept
   and rematch windows, waiting-room removal, vote, pause, cleanup, tutorial timeout) plugs into
   the same mechanism. No in-memory timers.
3. **Time-outs:** made done in the main phase; option B with a random sector on a market go.
4. **Clocks on screen** from server times, rounded down to whole seconds.
5. **Sleep model:** a short note in `docs/` on how the simulator estimates awake time (B12), using
   phase 04's live measurements.

## Known gaps after this phase

- Three time-outs in a row do not yet count as leaving (phase 19); no pause when everyone is away
  (phase 18).

## What you can see when it's done

In a two-window game, clocks count down; letting one window run out ends its turn with the "Your
time ran out" message and the count.

## Exit criteria

- I19 holds over 5,000 games; B3 and B12 within limits per the sleep model.

## Open points

- None.

## Required scenarios

These 16 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `marketplace` #9: a time-out on the market go takes option B with a random sector
- `marketplace` #10: the market time beyond the first 5 seconds of a go comes from the bank
- `turns-and-time` #8: players made done at the same moment become done in player order
- `turns-and-time` #9: the main-phase time limit in turn 10 is 3 minutes 57 seconds
- `turns-and-time` #10: reaching the main-phase limit makes the player done
- `turns-and-time` #11: the first 45 seconds of a main phase do not use the time bank
- `turns-and-time` #12: the time bank runs after the free time until the player ends their turn
- `turns-and-time` #13: with an empty bank a player only has the free time
- `turns-and-time` #14: a message received at the deadline is rejected and the time-out is applied
- `turns-and-time` #15: a message received just before the deadline is accepted
- `turns-and-time` #16: banks are shown rounded down to whole seconds
- `turns-and-time` #17: every player sees every other player's bank counting down during the main phase
- `turns-and-time` #19: a player whose time runs out is told how many time-outs in a row out of 3
- `turns-and-time` #20: ending the turn in time resets the time-out count
- `turns-and-time` #21: the first player's market go has 45 seconds
- `turns-and-time` #22: other market goes have 30 seconds

## Progress

- [x] 1. Deadlines in the engine. Every action carries the server's receive time; the action log
  keeps `{ action, at }`. The state keeps when the main phase or the current market go started,
  and each seat's time-outs in a row; deadlines are worked out from them. Before a message is
  handled, every time-out already due is applied as a logged `time_out` action at that moment, in
  player order (R8.4, R9.6); a message from a player among them is rejected `out_of_time`. Banks
  are charged when a player ends their turn, makes their market choice or times out. Save
  version 10.
- [x] 2. One alarm per room at the earliest deadline; the alarm applies due time-outs and updates
  everyone; rows for alarm changes are counted (B3).
- [x] 3. Time-outs: done in the main phase (count in a row, "timed out" notice with "of 3"); option
  B with a random sector on a market go. The simulator runs clocks.
- [x] 4. Clocks on screen (S2.3, S3.1, S9.4) from server times, rounded down to whole seconds.
- [x] 5. Sleep model note in `docs/` and B12 in the simulator.

Notes: inside `src/rules/` times are plain milliseconds, branded again where they leave the engine
(Q42). Two scenarios expected "done" after every player was done, which ends the main phase (R8.2);
they now check what is left to see (Q43). A time-out is told to the player by a `notice` message;
update messages carry the server's time so the client counts down from the seat clocks in the
view. The simulator fires the room's alarm as its clock passes, counts alarm changes per turn (B3)
and estimates awake time with the sleep model (`docs/sleep-model.md`, B12). I19 is checked.

**Where the phase stands (2026-10-30).** All five items are built and the review findings are
fixed or recorded. `npm run check` (266 tests), `npm run harness` (5,000 games, about 16.5 min;
922 time-outs, every invariant held; B1 1 row, B2 0, B3 0 over, B12 about 59 s) and the browser
tests pass. Merged and deployed.

## Report

**What was built.**
- **Time limits (R9.1–R9.5, R18.11):** a main-phase limit from 3:00 in turn 1 to 5:00 from turn 20;
  30 seconds per market go, 45 for the turn's first player; 45 seconds (main phase) and 5 seconds
  (market go) of free time, then the 15-minute time bank. All time is the server's.
- **Time-outs (R9.6, R9.10, R8.4, R18.11):** a player whose time runs out in the main phase is made
  done; on a market go they take option B with a random sector. Players made done at the same
  moment become done in player order. Every time-out is in the action log. A late message is
  rejected "out of time".
- **One alarm per room:** set to the earliest deadline, moved only when that changes; when it
  fires it applies the time-outs and updates the players whose view changed.
- **Screens (S2.3, S3.1, S9.4):** your time left and bank in the top bar; in the market phase whose
  go it is and how long they have; every opponent's bank counting down live; "Your time ran out"
  with "This was 1 of 3".
- **Checks:** 16 scenarios, I19, B3 and B12 required; save version 10. The simulator plays with
  clocks: it fires the room's alarm as its clock passes, checks every time-out, counts alarm
  changes per turn and estimates awake time with the sleep model (`docs/sleep-model.md`).

**What to try (after the merge).** In a two-window game, watch the clock in the top right count
down; after 45 seconds the bank starts running. Start a test room with an empty bank
(`npm run test-room -- turns-and-time 13`) and leave seat 1 alone: after 45 seconds it is made done
and told "Your time ran out … This was 1 of 3".

**Differences from the phase file.** None in what is built. Inside the engine, times are plain
millisecond numbers (Q42). Two scenarios were changed because they contradicted R8.2 (Q43). A
time-out notice reaches only players connected at that moment; one who is away when their time
runs out is not told later (connections and pausing come in phase 18).

**Decisions:** Q42, Q43, Q44.

**For the owner:** `.prettierignore` lists `rules/`, which also matches `src/rules/`, so the engine
is never format-checked (the review found a stray blank line there). Changing it to `/rules/`
would fix this; it is a protected file. `knip` also hints that `valibot` can be removed from
`ignoreDependencies` in `knip.json` (protected).

**Phase review findings and what happened to each:**
1. **After a rejection that applied time-outs, the sender got no update.** Fixed: the sender is
   updated too; a server test covers it.
2. **Any message caught up other players' time-outs, so unrelated rejections changed the game
   (I27).** Fixed: only a message from a player past their deadline applies time-outs (all due at
   that moment, in player order); I27 says so (Q44).
3. **Updates after an alarm skipped the leak test.** Fixed: the simulator runs the leak and version
   checks on them; the room now updates only players whose view changed after an alarm.
4. **The late-message path was never tested on the server.** Fixed: server tests for a message at
   the deadline before the alarm, and after it.
5. **A late message after the alarm got "already done" instead of "out of time".** Fixed: a message
   after the player's time-out in the same decision is rejected `out_of_time` (Q44).
6. **Every seat's version moved on any time-out.** Fixed: as for accepted actions, the timed-out
   seat, and everyone when the phase or turn changes or in the market phase.
7. **The alarm could be lost if it fired early.** Fixed: the alarm handler always sets the next one.
8. **The time-out notice is not kept for a player who is away.** Recorded under Differences, for
   phase 18.
9. **Thin client tests for the notice and no browser test of the market clock.** Fixed: host and
   store tests, and the market clock in the market browser test.
10. **`src/rules/` is not format-checked (`.prettierignore`).** The stray blank line is removed; the
    protected file is raised with the owner above.
