# Phase 18: Connections and pausing

Status: done
Milestone: 3 Playthrough

## Goal

Real-world connections: one tab at a time, away players, and pausing when everyone is away.

## Depends on

Phase 17.

## Covers

- Rules: M5.1–M5.3, M5.5, R9.12–R9.13 (pause and resume; abandoning after 24 hours comes in
  phase 19).
- Screens: S2.2's away badges, S9.4 (resumed after a pause), S16.2 (game open in another tab with
  "Play here instead", connection lost and reconnecting with actions disabled, a new version with
  "Reload"). Design boards "Game: resumed after pause", "Notices: game opened in another tab",
  "Notices: connection lost", "Notices: new version".

## Builds

1. **One tab per game,** the old tab told.
2. **Away status** for everyone; time runs as normal while away.
3. **Pause and resume** when a deadline comes and nobody is connected, with free time again on
   resume.
4. **Notices** for the above.
5. **Browser tests:** refresh mid-game, disconnect and rejoin, a second tab, and a forced room
   restart mid-game.

## Known gaps after this phase

- Leaving a game, abandoning after 24 hours and room cleanup come in phase 19.

## What you can see when it's done

Close a window mid-game and watch the others show that player as away; open the game in a second
tab; close every window and come back to a paused game.

## Exit criteria

- The four connection browser tests pass.

## Open points

- None.

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `visibility` #11: everything about another player except the hand is public (moved here from
  phase 09, Q27)
- `connections-and-leaving` #1: opening the game in a second tab moves it there
- `connections-and-leaving` #2: a disconnected player is shown as away to everyone
- `connections-and-leaving` #3: an away player keeps their seat and their time runs as normal
- `connections-and-leaving` #4: an away player's time runs out on a market go as for any player
- `turns-and-time` #23: a deadline while nobody is connected pauses the game instead
- `turns-and-time` #24: a paused game goes on when a player reconnects and the timed-out player gets free time again
- `turns-and-time` #25: after the extra free time the paused player times out as normal
- `turns-and-time` #35: a market go can be paused and the player gets their free time again

## Progress

- [x] 1. One tab per game, the old tab told: a hello on a new socket sends the player's older
  sockets `opened_elsewhere` and closes them with their own code, so they do not reconnect.
- [x] 2. Away status for everyone; time runs as normal while away. Away comes from the room's open
  sockets, is added to every game update and pushed when it changes, with no write (Q59).
- [x] 3. Pause and resume when a deadline comes and nobody is connected, with free time again on
  resume: logged `pause_game` and `resume_game` actions (save format 12). Other players' influence
  uses and completed quests are now in the view, which `visibility` #11 needed (Q27).
- [x] 4. Notices for the above: away badges, "Game resumed", "This game is open in another tab"
  with Play here instead, "Connection lost. Reconnecting…" with the game inert, and "A new version
  is available" with Reload.
- [x] 5. Browser tests: refresh mid-game, disconnect and rejoin, a second tab, and a forced room
  restart mid-game (a test-only route, guarded by the test-room secret, resets the room's object).

## Report

**Built.** A game is open in one tab at a time; opening it in another tab moves it there, and the
old tab offers "Play here instead". A player without a connection is shown as away to everyone and
keeps their seat, and their time runs as normal. When a deadline comes and no player still in the
game is connected, the game pauses instead: all clocks stop. The first player back resumes it, and
every player whose time would have run out gets their free time again (45 s in the main phase, 5 s
on a market go) without using their bank; the bank they used before the pause stays used. Notices:
away badges, "Game resumed", "This game is open in another tab", "Connection lost. Reconnecting…"
(the game is inert until reconnected) and "A new version is available" with Reload.

**What to try.** Play a game in two windows and close one: the other shows that player as away.
Open the game in a second tab: the first tab says so and can take it back. Close every window and
wait past the time limit, then come back: the game goes on and the timed-out players get their
free time again.

**Checks.** `npm run check` green (316 tests). `npm run harness` green, with this phase's 9
scenarios and 2 new ones required (429 scenarios in all). The four connection browser tests pass at
every size: refresh mid-game, disconnect and rejoin, a second tab, and a room restart mid-game (a
move made before the restart survives it).

**Differences from the phase file.** Other players' influence uses and completed quests were added
to the view, which `visibility` #11 needed (Q27). A test-only route, guarded by the test-room
secret, restarts a room for the restart test. Save format 13.

**Decisions.** Q59: pausing as logged engine actions, away from open sockets without writes, one
tab per game once it has started, and the readings added after the review.

**Review findings and what happened to each.**
1. Only one of several seats due at once got free time again: fixed, a pause covers every seat due
   at that moment; new required scenario.
2. A paused player got back the bank used before the pause: fixed, the pause charges it; new
   required scenario.
3. A second pause erased another seat's unfinished grace: fixed, grace is kept per seat and moved
   on by each pause.
4. Away and tab scenarios passed without production code: the driver now reads away through
   `withAwaySeats` and decides which tabs close with `otherTabsOf`, which the room uses too.
5. Two pause scenarios could not tell grace from no grace: a given paused game is now paused at its
   first deadline, through the engine's own `pauseGame`.
6. One tab per game also fired in waiting rooms: now only once the game has started.
7. Away in the top bar outside the main phase: now only in the main phase (S2.2); opponent cards
   show it always (M5.2), recorded in Q59.
8. Screenshots not committed: committed.
9. Player actions while paused: refused with `not_this_step`.
10. The pause time is the alarm's time, not the deadline: kept; a late alarm costs the other
    players' clocks only that delay, which the platform's alarm timing makes small.
11. Notice texts differ slightly from the boards: kept ("Game resumed" and a shorter other-tab
    text); the spec does not fix the wording.
12. Browser tests lacked the leak check and a move before the restart: both added.
13. The restart route can restart any room: kept; it needs the test-room secret, which the live
    site does not accept from players.
14. No `webSocketError` handler: not added. Whether every abnormal drop reaches `webSocketClose`
    is not verified; the browser test covers a closed tab. Worth a check in phase 19, which builds
    leaving.
15. The new view fields are not shown yet: they come with the opponent board details (S3.2).
