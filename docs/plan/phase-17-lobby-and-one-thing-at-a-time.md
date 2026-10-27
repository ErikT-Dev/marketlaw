# Phase 17: Lobby and one thing at a time

Status: approved
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
