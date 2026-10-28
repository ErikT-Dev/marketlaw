# Phase 09: Hidden information and opponents

Status: approved
Milestone: 3 Playthrough

## Goal

Everything a player may see about others, and nothing more: other players as at the start of the
main phase, their actions revealed when it ends, per-player state versions, the full leak test,
and the opponents overview.

## Depends on

Phase 08. Closes the visibility gap of phases 03–08.

## Covers

- Rules: M3.1–M3.5, R5.4, R5.5 (others' draws), R5.7 (as far as undo exists, completed in phase
  11), R17.6, R17.8 (others see shuffles when the phase ends), M9.4 per-player state versions.
- Invariants: I23, I24, I25.
- Checks: `HARNESS.md` point 3, the leak test, on every message in every simulated game and
  every e2e test.
- Screens: S3 (opponents overview, opponent's board pop-up), S2.2 (badges with done, away and
  left). Design boards "Opponent card", "Pop-up: opponent's board", "Player badge".

## Builds

1. **`viewFor` complete:** others' main-phase actions revealed only when the phase ends; others
   shown as at the start of the main phase with live status; deck and discard as R5.5 says; what
   is public about draws and marketplace cards (M3.3).
2. **State versions per player** that move only with what that player may see.
3. **Leak test** over every server message.
4. **Opponents overview and opponent's board** (time banks shown once phase 14 adds clocks).

## Known gaps after this phase

- Time banks on opponent cards are static until phase 14.

## What you can see when it's done

In a three-window game, each window shows the other two as at the start of the main phase, with
live done marks, and their actions appear when the phase ends.

## Exit criteria

- The leak test finds nothing in 10,000 games and in the e2e tests.

## Open points

- None.

## Required scenarios

These 6 scenarios are added to `harness/required.yaml` in this phase, by file and number
(`visibility` #11 moved to phase 18, Q27):

- `drawing` #8: other players see only the sector and tier asked for when a fallback is used
- `hostile-client` #14: another player's hidden action does not change my state version
- `visibility` #3: another player's main-phase actions stay hidden until the phase ends
- `visibility` #4: whether another player is done is shown during the main phase
- `visibility` #5: main-phase actions are revealed when the main phase ends
- `visibility` #12: no player receives the random seed or the deck order
