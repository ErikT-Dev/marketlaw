# Phase 14: Clocks and the time bank

Status: approved
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
