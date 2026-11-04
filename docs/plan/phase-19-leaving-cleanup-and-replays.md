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
- "You left the game" shows no room chat yet; chat comes in phase 21. "Room not found" has no
  **My match history** button until match histories exist (phase 25), and the end screen offers
  no rematch until phase 22.
- Until the room chat exists (phase 21), the driver of `connections-and-leaving` #15 counts the
  chat as shown to a player still in the room; phase 21 makes it read the chat (Q65).

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
- [x] 5. Screens for the above: Leave game in the top bar with its confirmation (S9.1), "You
  left the game" (S9.2), the last-player and abandoned end screens (S9.5) and "Room not found"
  (S16.2); Exit to lobby now also leaves the room. Abandoned endings say why (Q61).

### Finish (in progress, 2026-11-04)

- [x] Scenarios added to `harness/required.yaml`.
- [x] `npm run check` and `npm run harness` (1,000 games) green locally.
- [x] Browser tests: the full suite passed except 4 tests (rejected move, rooms and guests, test
  room income, clocks) that timed out loading pages at 1280×720 and 1920×1080; all 4 passed on a
  re-run. This is the known local load problem (two workers), not a code failure. GitHub judges.
- [x] Phase review run. Its findings, to fix or answer next:
  1. The D1 replay-record write in `GameRoom` (after save, before the reply) has no error
     handling: a D1 failure loses the reply to the last move, the deletion alarm and the record.
     Catch it, or write after reply and alarm.
     Fixed: the record is written after the reply, the updates and the alarm, and a D1 failure is
     logged instead of thrown (Q64).
  2. "You left the game" shows no `ConnectionNotices` and no reason after 3 time-outs (R9.11,
     S9.4); the time-out text says "made done" even for 3 of 3.
     Fixed: "You left the game" shows the time-out message and the connection notices; the third
     time-out says the player left instead of "made done" (Q66).
  3. `visibility` #13/#14 copy the cutoff condition in the lobby driver instead of going through
     the real save/read/remove code; `removeOldReplayRecords` has no test.
     Fixed: the scenarios save, remove and read the record through the real functions on an
     in-memory SQLite database built from the D1 migration; `replayRecordRetention.test.ts`
     tests the cutoff directly (Q65).
  4. Scenario #15's driver reports `room_chat` and `exit_to_lobby` whenever the player is in the
     room; list as a known gap or read a real field.
     Fixed and answered: Exit to lobby is read from the seat having left or the result, as the
     client shows it; the room chat is listed as a known gap until phase 21 (Q65).
  5. M2.2's second half (joining another room takes the player out of the finished room, deferred
     to this phase by Q58) is not built: build it in `isReallyBusy`, or list it as a gap.
     Fixed: built after a successful join or create rather than in `isReallyBusy` (the lobby
     forgets free players, so it never asked their room): the lobby now remembers which rooms
     free players are still in, and joining or creating a room takes them out of those rooms,
     deleting a room when its last player goes (Q64). The queue uses the same step in phase 26.
  6. No tests for `leave_room` during a running game (accepted after leaving, `room_not_waiting`
     while still in it) or for a leaver being free to join elsewhere.
     Fixed: `src/server/room/leavingRoom.test.ts`, also covering finding 5.
  7. Suggestion: B17 should measure `replayRecordOf(saved)`.
     Fixed: the simulator measures `replayRecordOf(saved)`.
  8. Suggestion: Leave game should be disabled while the connection is lost.
     Fixed: disabled while the connection is not open (Q66).
  9. Minor: the badge's fixed inline colour should be a CSS class.
     Fixed: the "left" status colour comes from `Badge.module.css` (Q66).
- [x] Fix or answer the findings (Q64, Q65, Q66).
- [x] Run the checks again (2026-11-04, after the review fixes): `npm run check` and `npm run harness`
  (1,000 games) green; browser tests with two workers: all 99 passed on the first run.
- [ ] Write the Report, merge, watch the deploy (new D1 migration 0006 and the Cron Trigger),
  check the live site including `npm run replay-export`.
