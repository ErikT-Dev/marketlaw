# Phase 22: Abandon vote and rematch

Status: approved
Milestone: 4 Together

## Goal

Casual games can be abandoned by a unanimous vote, and a finished room can start a rematch.

## Depends on

Phase 20a.

## Covers

- Rules: M7 (including M7.5's answer count; the ranked case comes with ranked games in phase 26),
  M8.4–M8.6.
- Screens: S9.3 (calling, answering, "1 of 2 players answered", the vote failing), S9.5's
  abandoned-by-vote version and the rematch button, S11.4 (the room after a game, the rematch
  dialog). Design boards "Pop-up: call abandon vote", "Pop-up: answer abandon vote", "Game: vote
  failed", "Waiting room: after the game", "Waiting room: rematch asked". Per `screens.md` S17,
  the vote dialogs also show how many players have answered.

## Builds

1. **Abandon vote:** one every 5 turns, one open at a time, 1 minute to answer, no answer counts
   as no, clocks keep running.
2. **Rematch:** at least 2 players in a finished room, everyone accepts within 20 seconds, a new
   casual game from setup in the same room, the deletion time restarts.
3. **Screens** for both.

## Known gaps after this phase

- No accounts, records, ranking, menu or tutorial.

## What you can see when it's done

Call a vote in a three-window game and watch it pass or fail; finish a game and start a rematch.

## Exit criteria

- See "What every phase must meet" in `README.md`.

## Open points

- None.

## Required scenarios

These 12 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `connections-and-leaving` #18: everyone else voting yes abandons a casual game
- `connections-and-leaving` #19: players see how many have answered a vote but not who or how
- `connections-and-leaving` #20: an away player who does not answer counts as voting no
- `connections-and-leaving` #21: timers keep running during a vote
- `connections-and-leaving` #23: a game can have at most one vote every 5 turns
- `connections-and-leaving` #24: a new vote can be called 5 turns after the last one
- `connections-and-leaving` #25: only one vote can be open at a time
- `connections-and-leaving` #26: rejects voting when no vote is open
- `rooms` #23: a rematch starts a new casual game when everyone in the room accepts
- `rooms` #24: every player in the room sees who has accepted a rematch so far
- `rooms` #25: rejects a rematch with fewer than 2 players in the room
- `rooms` #26: a declined rematch leaves the room as it was
