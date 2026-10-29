# Phase 12: The market phase

Status: in progress
Milestone: 3 Playthrough

## Goal

Turns from turn 2 on start with the marketplace refresh and the market phase, where each player
in player order takes one market go.

## Depends on

Phase 09. Closes phase 03's gap: turns now follow R4.1.

## Covers

- Rules: R4.1, R4.4, R4.5, R11.1, R11.3, R18 (except R18.11's time limits, phase 14), R17.11,
  M3.3 (option and sector chosen, marketplace cards known to be in a hand).
- Invariants: I3, I4, I20.
- Screens: S2.1 (phase and player order with "first player"), S4 (marketplace panel, market go
  panel in all its states, main-phase actions hidden in the market phase), S6.4's "new" marks.
  Design boards "Market: your turn draw", "Market: before your go", "Market: you had your go",
  "Market: marketplace empty", "Market slot". Per `screens.md` S17, the top bar shows the market
  phase and marketplace cards show no price.

## Builds

1. **Start of turn:** removal of cards shown in 2 market phases, refills in R18.5's order.
2. **Market phase:** one go per player still in the game, from the turn's first player; option
   A and option B; option B when the marketplace is empty.
3. **"New" marks** on every card that came into a hand this turn.
4. **Screens** for the market phase.

## Known gaps after this phase

- No clocks: a player who never takes their go holds up the game (phase 14).

## What you can see when it's done

In a two-window game, turn 2 opens with the market phase: one window takes a marketplace card
while the other waits for its go, then both play the main phase.

## Exit criteria

- The listed invariants hold over 5,000 games.

## Open points

- Q23: log turn draws and marketplace refill draws and shuffles in the draw log; decide how a
  refill shuffle that no player caused is shown.

## Required scenarios

These 25 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `projects` #6: rejects a project outside the main phase (moved here from phase 10, Q30)
- `combos-and-income` #14: a card drawn in the main phase is marked new
- `drawing` #14: turn draws use the number of the turn that is starting
- `hostile-client` #12: rejects a main-phase action during the market phase
- `marketplace` #1: option A takes a free market card and draws one card of the same sector from the deck
- `marketplace` #2: option B draws 2 cards of a chosen sector from the deck
- `marketplace` #3: a player whose market go comes with an empty marketplace must take option B
- `marketplace` #4: rejects a market action when it is another player's go
- `marketplace` #5: rejects a second market go in the same turn
- `marketplace` #6: rejects taking a card that is not in the marketplace
- `marketplace` #7: after the last marketplace card is taken the next player still gets their market go
- `marketplace` #8: the market phase ends when every player has had their market go
- `marketplace` #11: new marks last until the end of the turn
- `marketplace` #12: a kind place with no card of its kind left stays empty
- `marketplace` #13: a kind place falls back to another tier of its kind
- `marketplace` #14: option A with no cards left of that sector draws the top card of the deck
- `playing-cards` #16: sold cards join the discard pile when the main phase ends
- `turns-and-time` #1: the first player moves one seat on each turn
- `turns-and-time` #2: the first player in turn 3 of a 3-player game is seat 3
- `turns-and-time` #3: if the first player has left the next seat still in the game goes first
- `turns-and-time` #4: player order wraps from the highest seat to seat 1 and skips players who left
- `turns-and-time` #31: at the start of a turn old marketplace cards are removed and places refilled in order
- `turns-and-time` #33: the market phase follows the start-of-turn steps
- `visibility` #9: the draw log shows who drew how many and what was asked for but not the card
- `visibility` #10: a marketplace card taken is known to be in that player's hand

## Progress

- [x] 1. Start of turn: cards shown in 2 market phases go to the discard pile after the sold cards,
  then empty places refill in R18.5's order. The first player is set when the turn starts (R4.4)
  and kept in the state, as `HARNESS.md` lets a scenario give it. A refill shuffle is logged with
  no seat (Q38, closes Q23). Save version 8.
- [x] 2. Market phase: one go per player still in the game, in player order; option A, option B,
  and option B when the marketplace is empty (`marketplace_empty` first, Q39). A taken card is
  known to be in that hand until played or sold (M3.3); every market go changes every player's
  state version, since all of it is public. The bots take turn draws; the simulator plays the
  market phase; the leak test treats taken cards as known.
- [x] 3. "New" marks on every card that came into a hand this turn, cleared when the main phase
  ends; I3, I4 and I20 are checked.
- [ ] 4. Screens for the market phase.
