# Phase 29: Tutorial

Status: approved
Milestone: 6 Learning

## Goal

The guided one-player tutorial of `tutorial.md`, played on the server in a tutorial room, offered
from the game menu.

## Depends on

Phases 27 (no rating change) and 28 (the menu).

## Covers

- Rules: C4, C1.2's Tutorial entry, T0–T5, A9.5, A9.6's tutorial cap, M2.1 for the tutorial.
- Budgets: B6; B18 with tutorials in the busy-day simulator.
- Screens: S15, S14.1's Tutorial entry. Design boards "Menu: game menu in the lobby" (without its
  old ranked text, S17), "Tutorial base 1920x940" and "Tutorial: …" (all 7).

## Builds

1. **Tutorial room:** one seat, fixed deck, marketplace, quests and random sequence; no time
   limits; no record; deleted when left or after 30 minutes without a connection.
2. **Steps:** only the step's action is accepted, anything else rejected with `not_this_step`;
   texts exactly as in `tutorial.md`.
3. **Screens:** text box with "Step N of 21", highlights, Continue, Restart, complete, leave.

## Known gaps after this phase

- Whatever phase 30 finds.

## What you can see when it's done

Start the tutorial from the menu as a new visitor, play all 5 turns, and finish it.

## Exit criteria

- B6 within its limit.

## Open points

- None.

## Required scenarios

These 17 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `client` #1: the game menu offers rules card set and tutorial in the lobby
- `client` #10: a visitor who is not logged in becomes a guest before the tutorial starts
- `client` #11: in the tutorial any action other than the step's action is rejected
- `client` #12: the tutorial has no time limits
- `client` #13: finishing the tutorial creates no game record and changes no rating
- `client` #14: leaving the tutorial deletes its room and it can start again from the beginning
- `client` #15: a player in the tutorial cannot join a room or the queue
- `client` #17: a tutorial room whose player has been away for 30 minutes is deleted
- `lobby-queue-and-limits` #28: the tutorial does not count toward the daily limits
- `lobby-queue-and-limits` #29: after 100 tutorials start on the site today no more tutorials start
- `tutorial` #1: the tutorial starts with the fixed hand quests and bonus types
- `tutorial` #2: tutorial turn 1 teaches playing selling and ending the turn
- `tutorial` #3: tutorial turn 2 teaches the market and combos
- `tutorial` #4: tutorial turn 3 teaches drawing from the deck and real cost
- `tutorial` #5: tutorial turn 4 teaches product and the first bonus fund
- `tutorial` #6: tutorial turn 5 teaches income and quests and then ends
- `tutorial` #7: the tutorial rejects playing a different card than the step asks for
