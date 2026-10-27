# Phase 03: Engine core: setup and the first turn

Status: approved
Milestone: 1 Foundations

## Goal

A pure rules engine that sets up a game and plays the main phase: playing and selling cards,
using build passes, ending the turn, and the end-of-turn steps. The scenario runner drives it.

## Depends on

Phase 02.

## Covers

- Rules: R1.2, R1.4, R2, R3.3–R3.8, R4.2, R4.6, R5.1 (play, sell), R5.2, R5.3, R6 (playing,
  using a build pass, the skip-build block; buying passes and skip build itself come in phase 11),
  R8.1–R8.2, R10.1 and R10.3 (not quests), R12.1 (type counts only), R14, R17.1–R17.5 and
  R17.9–R17.10 (the draw procedure as setup needs it), R17.7 (holding pile for sold cards), R18.5
  and R19.3 (filling the marketplace and quests table at setup), R21.6.
- Invariants: written as checks in `src/rules/` (I1, I5, I6, I7, I10, I17, I18, I27) for phase
  08's simulator; unit tests call them now.

## Builds

1. **Game state and actions** as discriminated unions, readonly, with branded ids. One save
   shape: `{ schemaVersion, seed, setup, actionLog, state }`. Seats can be marked as left (the
   leaving action itself comes in phase 19), so player order and end-of-turn steps skip them.
2. **Seeded random sequence** passed into every transition, with a scripted version for
   scenarios. No `Date` or `Math.random` (lint-enforced in `src/rules/`).
3. **Setup** in the order of R4.6.
4. **`apply(state, action, rng)`** returning `Result<State, Rejection>` with the reason codes of
   `HARNESS.md` in their priority order. Actions: play card, sell, end turn.
5. **End of turn** (R10.1, R10.3) and bonus (R14).
6. **`viewFor(state, seat)`**, first version: own hand, others' hand counts, public stats; never
   the seed or deck order.
7. **Engine driver** for the scenario runner.

## Known gaps after this phase

- No market phase until phase 12: turns from 2 on continue with main phases only.
- Other players' main-phase actions are visible at once until phase 09 (R5.4).

## What you can see when it's done

The harness report shows the setup, playing-card and end-of-turn scenarios below passing.

## Exit criteria

- `dependency-cruiser` confirms `src/rules/` imports only `src/shared/`.
- Coverage on `src/rules/` meets the thresholds.

## Open points

- None.

## Required scenarios

These 35 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `hostile-client` #10: rejects selling a card another player holds
- `hostile-client` #11: rejects selling the same card twice in one message
- `playing-cards` #1: playing a Residential card pays its cost and applies its stats and types
- `playing-cards` #2: playing an Industry card gives product and uses workforce quality and satisfaction
- `playing-cards` #3: playing a Service card gives distribution
- `playing-cards` #4: playing a Public card gives quality and satisfaction and uses workforce
- `playing-cards` #5: a card that counts a type twice adds 2 to that type count
- `playing-cards` #6: real cost adds 1 for each card of the same sector and tier already in the city
- `playing-cards` #7: cards of another tier do not raise the real cost
- `playing-cards` #8: rejects a card the player cannot afford at its real cost
- `playing-cards` #9: rejects a tier 2 card before turn 5
- `playing-cards` #10: a tier 2 card can be played from turn 5
- `playing-cards` #11: rejects a second card in a turn without a build pass
- `playing-cards` #12: a build pass allows a second card and is used up
- `playing-cards` #13: rejects playing a card after skip build even with a build pass
- `playing-cards` #14: rejects a card that is not in the hand
- `playing-cards` #15: selling several cards is one action and puts them in the holding pile
- `playing-cards` #17: rejects any action after the 50th main-phase action but still allows ending the turn
- `playing-cards` #18: a player at the action limit can end their turn
- `setup` #1: a new game gives every player the starting stats and time bank
- `setup` #2: starting hands are dealt from the top of the deck one player at a time in seat order
- `setup` #3: the marketplace is filled after the hands in the fixed place order
- `setup` #4: the quests table starts with 4 random tier 1 quests and 2 different bonus types are picked
- `setup` #5: after setup the deck holds every card not dealt or on display
- `setup` #6: turn 1 starts with the main phase and every player can act
- `turns-and-time` #5: ending the turn marks the player done and further actions are rejected
- `turns-and-time` #6: the main phase ends only when every player is done
- `turns-and-time` #7: the order in which players become done is recorded
- `turns-and-time` #27: end-of-turn steps pay influence income and bonus and keep build passes
- `turns-and-time` #28: negative stats lower the bonus and a negative bonus gives no funds
- `turns-and-time` #29: every full 10 bonus becomes 1 fund
- `turns-and-time` #30: players who left get no end-of-turn steps
- `turns-and-time` #34: skip build is reset at the end of the turn
- `visibility` #1: other players' hands are shown only as a number of cards
- `visibility` #2: a player sees their own hand
