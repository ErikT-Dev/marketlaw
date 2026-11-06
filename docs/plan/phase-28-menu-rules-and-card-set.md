# Phase 28: Game menu, rules viewer and card set

Status: approved
Milestone: 6 Learning

## Goal

The game menu from the lobby, a waiting room and a game, with the rulebook and the browsable card
set.

## Depends on

Phase 20a.

Stats and types in the rulebook's prose, the card set and card details are shown as icons, never
as words (S1.6, owner's rule of 2026-11-06, Q74).

## Covers

- Rules: C1 (the Tutorial entry comes in phase 29), C2, C3.
- Screens: S14, S2.1's Menu button. Design boards "Menu: game menu during a game", "Rules: rules
  viewer", "Rules: opened during a game", "Card set: grid", "Card set: card detail". Per
  `screens.md` S17, the rules viewer shows `rulebook.md` as it is, ignoring the board's old text.

## Builds

1. **Game menu** with Rules and Card set; opening anything during a game does not stop the clock.
2. **Rules viewer:** `rulebook.md` with contents, links between sections, previous and next,
   loaded only when opened. Rendering Markdown likely needs a library: a new dependency, named
   and approved with this phase, or a small project renderer if the owner prefers none.
3. **Card set:** all 240 cards as tiles, filters by sector, tier and type, name search, the
   matching count, and the card detail with every combo.

## Known gaps after this phase

- The menu shows no Tutorial entry until phase 29.

## What you can see when it's done

Open the menu from the lobby and a game; read the rules; filter the card set and open a card.

## Exit criteria

- B14 still within its limit.

## Open points

- The Markdown dependency.

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `client` #2: during a game the menu offers rules and card set but not the tutorial
- `client` #3: opening the menu during a game does not stop the clock
- `client` #4: anyone can open the rulebook with its table of contents
- `client` #5: the rulebook explains every section of the game rules
- `client` #6: anyone can open the card set and see all 240 cards
- `client` #7: the card set filters by sector tier and type and searches by name
- `client` #8: searching the card set by name finds matching cards
- `client` #9: opening a card shows everything about it
- `client` #16: the menu in a waiting room does not offer the tutorial
