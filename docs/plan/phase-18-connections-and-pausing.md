# Phase 18: Connections and pausing

Status: in progress
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
