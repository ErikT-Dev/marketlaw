# Phase 17: Lobby and one thing at a time

Status: done
Milestone: 3 Playthrough

## Goal

The lobby with its public room list, and "one thing at a time" across rooms and games.

## Depends on

Phase 16.

## Covers

- Rules: M1.7 (public rooms listed), M2.1 for rooms and games (the queue and tutorial join it in
  phases 26 and 29), S10.1 (top bar; My match history and ELO ranking hidden until phases 25 and
  27), S10.3 (public rooms list), S10.8 (empty lists).
- Budgets: B18 measured by a first **busy-day simulator** (rooms and lobby use for a day with 50
  games), extended in phases 20, 21, 23, 26 and 29.
- Design boards: "Lobby 1920x940", "Lobby: logged out", "Lobby: empty lists". The ranked panel
  and players online are not shown until phases 26 and 27.

## Builds

1. **Public room list** with players and free places, joined with one click.
2. **One thing at a time:** a player waiting in a room or playing a game cannot join another
   room, enforced by the authority chosen in O6.
3. **Lobby screen** as designed, without the parts of later phases.
4. **Busy-day simulator** for B18.

## Known gaps after this phase

- No players online, ranked panel or records buttons in the lobby yet.

## What you can see when it's done

The lobby lists public rooms; join one with a click; a second room cannot be joined while
waiting in one.

## Exit criteria

- B18 within its limit in the busy-day simulator.

## Open points

- None.

## Required scenarios

These 3 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `rooms` #1: a player creates a public room with a chosen size and becomes its owner
- `rooms` #4: a private room is not listed in the lobby but can be joined with its code
- `rooms` #27: a player waiting in a room cannot join another room

## Progress

- [x] 1. Public room list with players and free places, joined with one click. Rooms report a
  summary to the lobby Durable Object (D26) whenever it changes; lobby screens get the list
  pushed over a hibernating socket, which is open only while the player is in the lobby.
- [x] 2. One thing at a time: creating or joining a room first claims the player in the lobby,
  and is rejected with `busy_elsewhere` while they are in another room or a game that has not
  ended. A failed join releases the claim; a game that ends frees its players (M2.2's first
  half; leaving the finished room comes in phase 19).
- [x] 3. Lobby screen: "Public rooms · N" with each room's players, free places and Join, and the
  empty-list text (S10.8). The Game menu, match history, ranking, players online, the ranked
  queue and Log in / Sign up stay hidden until their phases.
- [x] 4. Busy-day simulator for B18: 50 rooms of 2 to 4 players, each with a join that leaves
  again, a page refresh and everyone accepting, plus 100 new guests and 50 returning players.
  It writes 1,844 rows (498 room, 398 alarm changes, 498 lobby, 450 database, counting D1 index
  writes) against the limit of 5,000. Players arrive 30 seconds apart, so the waiting-room
  timers fire as they would live (Q58).

## Report

**Built.** The lobby lists public rooms that are still waiting, with their players and free
places, and joins one with a click; the list is pushed by the lobby Durable Object (D26) while the
player is in the lobby, with no polling. A player waiting in a room or playing a game cannot create
or join another room (`busy_elsewhere`); a game that ends frees its players. The busy-day
simulator measures B18.

**What to try.** On the live site, create a public room in one window: it appears at once in the
lobby of another window, which joins it with Join. A private room never appears in the list. One
thing at a time is enforced by the server: in the browser a player in a room always sees that
room, so it shows only when two tabs act at once; the browser tests check it through the API.

**Checks.** `npm run check` green (311 tests). `npm run harness` green with the phase's scenarios
and B18 required: 1,844 rows on the busy day against 5,000. Browser tests at all three sizes:
a listed room joined with one click, a busy player refused, and the empty list (S10.8).

**Differences from the phase file.** None in scope. The top bar shows only the title and the user
box: the Game menu, match history, ranking, players online, the ranked queue and Log in / Sign up
come in their phases (known gaps).

**Decisions.** D26 (Q52) built. Q58: when a game counts as over, a room asking for acceptance
stays listed with Join disabled, the list heading, the busy message (new S10.9 row), how an out of
date lobby repairs itself, and D1 index rows in B18.

**Review findings and what happened to each.**
1. Rooms that close without telling the lobby left players locked out: fixed. Before refusing a
   busy player the route asks the room the lobby names and forgets the entry if the player is not
   there; a listed room that no longer exists is dropped when someone tries to join it.
2. A failed lobby call broke the room and left claims behind: fixed. The room sets its alarm
   first and ignores a failed lobby call; routes release a claim when the room call fails. A lost
   report is not retried; the checks of finding 1 repair what it would have changed (Q58).
3. A room report dropped a pending claim, letting one player into two rooms: fixed, a report
   drops only players who left that room; unit test added.
4. B18 was undercounted: fixed. Realistic waits fire the waiting-room alarms, the game start is
   reported, a refused join is included, and D1 index rows are counted: 1,844 rows.
5. Refused joins wrote two lobby rows: fixed, the room checks the join first, so a refused join
   writes nothing.
6. The busy text was not in the spec and no questions were recorded: S10.9 row and Q58.
7. The lobby feed (and the game host) could reconnect after being closed: fixed in a shared
   `Reconnector`, with a test whose reconnect waits.
8. No browser test for S10.8: added at all three sizes.
9. The driver rebuilt the lobby every step and copied the routes: it now keeps one lobby record
   across steps and updates it as the lobby does; the routes' own order (check, claim, join,
   release) is covered by the browser tests, not by `npm run check`.
10. The busy-day test proved nothing: it asserts the exact counts.
11. Two files exported two types each: split.
12. The lobby schema and type could drift: the schema's parsed output is returned as a
    `LobbyRecord`, so the compiler fails if they no longer match; no change.
13. A busy race returned `no_free_room_code`: fixed, it returns `busy_elsewhere`.
14. Test rooms are not reported to the lobby: kept; test-room seats are made for browser tests and
    never belong to real players.
15. A failed create still reported to the lobby: fixed.
16. Every listed player showed an online dot: removed.
