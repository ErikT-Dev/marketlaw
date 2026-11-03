# Phase 19: Leaving, cleanup and replay records

Status: in progress
Milestone: 3 Playthrough

## Goal

Leaving a game in every way the rules allow, abandoned games, rooms that clean themselves up,
and replay records for debugging.

## Depends on

Phase 18. Decision O8 (scheduled jobs, where replay records live) is made in this phase's first
step.

## Covers

- Rules: M6.1–M6.9, M6.10 (time-outs; deleting an account and logging out come in phases 23 and
  24), R9.11 (leaving after 3 time-outs), R9.14 (abandoned after 24 hours paused), M8.1–M8.3
  (rooms deleted when empty or 24 hours after the game), M4 (replay records kept 30 days, export
  for the owner), `rules/cloudflare.md` "Clean up rooms".
- Checks: `HARNESS.md` point 7, the replay export check.
- Screens: S9.1 (leave game), S9.2 ("You left the game"), S9.5 "last player left" and
  "abandoned" (without the vote, which comes in phase 22), S16.2 "room not found". Design boards
  "Pop-up: leave game", "Game: you left the game", "End: last player left", "End: game
  abandoned", "Notices: room not found or closed".

## Builds

1. **First step, O8:** confirm Cron Triggers are free, decide where replay records live, and add
   the trigger to `wrangler.jsonc` (approval).
2. **Leaving:** done at once, hand to the discard (holding pile during a main phase), skipped in
   player order, the last player wins, everyone leaving abandons the game.
3. **Cleanup:** rooms through their one alarm; replay records after 30 days through the
   scheduled job.
4. **Replay export** for a running or ended room, protected by the owner's secret.
5. **Screens** for the above.

## Known gaps after this phase

- No daily limits yet (phase 20).
- The game record that counts a leaver's hand before it is discarded (M6.5, A3) comes with game
  records in phase 25.

## What you can see when it's done

Leave a game and see the result arrive later; leave until one player is left; export a replay.

## Exit criteria

- The replay export check passes.

## Open points

- O8.
- Q49: leaving records the order in which players left, and the places put the one who left first
  last (A3.4); I22 checks it.

## Required scenarios

These 15 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `connections-and-leaving` #5: a player who leaves is done straight away and keeps their city
- `connections-and-leaving` #6: a player who left cannot act again
- `connections-and-leaving` #7: a leaver's main-phase actions this turn are kept and revealed at the end of the phase
- `connections-and-leaving` #8: a leaver's hand waits in the holding pile during a main phase
- `connections-and-leaving` #9: a leaver's hand goes straight to the discard pile outside the main phase
- `connections-and-leaving` #10: a leaver takes no more market goes and is skipped in player order
- `connections-and-leaving` #12: players who leave at the same moment leave in player order
- `connections-and-leaving` #13: if every player leaves at the same moment the game is abandoned
- `connections-and-leaving` #15: a leaver no longer sees the game but sees the result when it ends
- `connections-and-leaving` #27: a player who leaves during their own market go is skipped and the next player goes
- `end-of-game` #3: an end goal reached by a player who then leaves does not end the game
- `rooms` #22: the room is deleted when the last player leaves it
- `turns-and-time` #18: three main-phase time-outs in a row count as leaving the game
- `visibility` #13: the replay record is kept for 30 days after the game ends
- `visibility` #14: the replay record is removed after 30 days

## Progress

- [x] 1. O8 decided as D27 (Q60): replay records in D1, removed by one daily Cron Trigger.
- [x] 2. Leaving: done at once, hand to the discard (holding pile during a main phase), skipped in
  player order, the last player wins, everyone leaving abandons the game. Also R9.14 (abandoned
  after 24 hours paused) as a logged system action; results say how the game ended; the chaos
  bot leaves now and then (Q61).
- [x] 3. Cleanup: rooms through their one alarm; replay records after 30 days through the
  scheduled job. Also leaving a room after leaving its game or after it ended; records older than
  30 days count as removed before the daily job deletes them (Q62).
- [x] 4. Replay export for a running or ended room, protected by the owner's secret. The
  test-room secret, which the live site already has; `npm run replay-export`; the replay export
  check in the harness (Q63).
- [ ] 5. Screens for the above.
