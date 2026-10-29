# Phase 11: Influence and undo

Status: done
Milestone: 3 Playthrough

## Goal

All influence actions, buying build passes and skip build, draw actions, and undo.

## Depends on

Phase 10.

## Covers

- Rules: R15 (all trades, limits, draw actions by kind and tier, R15.4's fallback), R6.1's
  bought passes and skip build, R7 (undo), R5.7 (undone actions never shown).
- Invariants: I11, and I6 with bought passes.
- Screens: S8.3 (use influence: trade tiles with uses left, the draw-action table with "None
  left"), the Use influence and Undo buttons of S6.6. Design boards "Pop-up: use influence",
  "Number stepper".

## Builds

1. **Influence actions** with the trade names of `HARNESS.md`.
2. **Build passes** bought at a rising price, with influence, or by skip build.
3. **Draw actions** for 5 kinds × 3 tiers, using the deck and discard as the player sees them.
4. **Undo** for the actions R7.2 lists, latest first, never past an action that drew a card,
   restoring everything including the next pass price.
5. **Screens** for all of the above.

## Known gaps after this phase

- No market phase, quests or clocks yet.

## What you can see when it's done

In a two-window game: trade influence, buy a build pass and play a second card, draw a card of a
chosen kind and tier, and undo a played card.

## Exit criteria

- The listed invariants hold over 5,000 games.

## Open points

- None.

## Required scenarios

These 52 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `combos-and-income` #10: income repeats as long as it is possible
- `drawing` #1: a draw takes the first card of that sector and tier from the top of the deck
- `drawing` #2: if the deck has none the discard pile cards of that sector and tier are shuffled in
- `drawing` #10: a discard shuffle in the main phase is shown to others only when the phase ends
- `drawing` #11: the player who caused a discard shuffle sees it straight away
- `influence` #1: 4 influence buys 2 funds once per game
- `influence` #2: 4 influence buys 1 quality
- `influence` #3: 4 influence buys 1 satisfaction
- `influence` #4: 6 influence buys 1 workforce
- `influence` #5: 1 fund buys 1 influence any number of times
- `influence` #6: a bought build pass costs 1 more fund each time
- `influence` #7: 5 influence buys 1 build pass once per game
- `influence` #8: skip build gives a build pass and blocks playing cards this turn
- `influence` #9: skip build is rejected after playing a card this turn
- `influence` #10: skip build can be used 3 times per game
- `influence` #11: 1 influence and 1 quality buy 1 satisfaction
- `influence` #12: 1 influence and 1 satisfaction buy 1 quality
- `influence` #13: 2 influence and 1 product buy 1 distribution and 1 satisfaction
- `influence` #14: 2 influence 1 distribution and 1 satisfaction buy 1 product
- `influence` #15: 2 influence and 1 quality buy 1 workforce
- `influence` #16: 2 influence and 1 satisfaction buy 1 workforce
- `influence` #17: 1 workforce buys 1 satisfaction once per game
- `influence` #18: 1 workforce buys 1 quality
- `influence` #19: 2 quality buy 1 satisfaction any number of times
- `influence` #20: 2 satisfaction buy 1 quality
- `influence` #21: 4 quality buy 1 workforce
- `influence` #22: 4 satisfaction buy 1 workforce
- `influence` #23: rejects a trade the player cannot afford
- `influence` #24: 3 influence draw a tier 1 card of a chosen kind
- `influence` #25: 4 influence draw a tier 2 card of a chosen kind
- `influence` #26: 5 influence draw a tier 3 card of a chosen kind
- `influence` #27: a draw action for a Public kind draws only that kind
- `influence` #28: rejects a draw action when no card of that kind and tier is left
- `influence` #29: a draw action whose last card another player took this phase gives another tier
- `playing-cards` #19: undo counts toward the action limit
- `undo` #1: undo takes back playing a card
- `undo` #2: undo takes back claim all
- `undo` #3: undo takes back a trade that draws no card
- `undo` #4: undo takes back skip build and the build pass it gave
- `undo` #6: undo takes back the latest action first
- `undo` #7: selling cannot be undone
- `undo` #8: completing a project cannot be undone
- `undo` #9: a draw action cannot be undone
- `undo` #10: playing a card that triggers income cannot be undone because income draws a card
- `undo` #12: nothing before an action that cannot be undone can be undone
- `undo` #13: rejects undo when there is nothing to undo
- `undo` #14: undo is only for the player's own actions
- `undo` #15: undoing a card played with a build pass gives the pass back
- `undo` #16: undoing a bought build pass makes the next one cost the same again
- `visibility` #6: undone actions are never shown to other players
- `visibility` #7: the deck count shown during the main phase leaves out other players' draws
- `visibility` #8: a player's own draws are shown in their deck count straight away

## Progress

- [x] 1. Influence actions: the stat trades and 1 fund → 1 influence, with their limits per game. The trade table is in `shared/` for the pop-up; I11 is checked
  after every action. Save version 7.
- [x] 2. Build passes: bought at a rising price, with influence, or by skip build.
- [x] 3. Draw actions: 5 kinds × 3 tiers, available by the deck and discard as the player sees them.
  Draw actions take R17.4's last step (the top card), kind places of the marketplace do not
  (R17.5). The start of the main phase keeps the deck instead of its count.
- [x] 4. Undo: the actions R7.2 lists, latest first, never past an action that drew a card.
  Income blocks undo too (Q33). Undo #5 and #11 need quests and stay for phase 13.
- [x] 5. Screens: the use influence pop-up (S8.3) and the Undo button (S6.6).
  Use influence always opens, like Projects (Q32). The action buttons got narrower side padding so
  the seven fit two rows, as in the design. Browser test in a test room, with a screenshot.

**Where the phase stands (2026-10-29).** All five items are built; the 52 scenarios and I11 are
required and pass; the browser tests pass (39). The check was over 5 minutes, almost all of it the
10,000 simulated games; by the owner's decision D23 it now simulates 500 games and takes about
75 s, and `npm run harness` simulates 5,000 in about 155 s. Both pass. The phase review is done
and its findings are answered below.

## Report

**What was built.**
- **Influence actions (R15.1):** the stat trades and 1 fund → 1 influence, each with its limit per
  game (I11 after every action).
- **Build passes (R6.1):** bought with funds at a price that rises by 1 with each pass, or by skip
  build (3 per game, not after playing a card).
- **Draw actions (R15.3, R15.4):** a card of a chosen kind and tier for 3, 4 or 5 influence, offered
  by the deck and discard pile as you see them; when none is left the top card is drawn and the
  influence is still spent.
- **Undo (R7, R5.7):** the latest undoable action, again and again, never past one that drew a card
  or raised income (Q33); it restores everything, including the next pass price. Other players
  never see undone actions.
- **Screens (S8.3, S6.6):** the Use influence pop-up with trade tiles and the draw-action table,
  and the Undo button.
- **Checks:** 52 scenarios and I11 required; save version 7. From this phase `npm run check`
  simulates 500 games and `npm run harness` 5,000 (D23).

**What to try (after the merge).** Start a test room (`docs/test-rooms.md`) with Row House and
Cottage in seat 1's hand and 20 funds, 10 influence. Use influence: trade 1 fund for 1 influence,
buy a build pass (the next one then costs 3), play both cards, press Undo and see the second card
go back to the hand and the pass come back; then draw a Residential card of tier 1.

**Differences from the phase file.** Undo #5 and #11 need quests and move to phase 13. Use
influence always opens its pop-up, like Projects (Q32). The "Number stepper" design board is not
used: no S rule asks for an amount to be chosen, each trade is taken once per click. The pop-up
follows S8.3 where the "Pop-up: use influence" board differs: the build-pass tile says "unlimited"
with the price in its label (the board: "next one costs 3 funds"), skip build after a played card
shows the S16.3 text (the board: "you already played a card"), and the pop-up is 1024 px wide (the
board: 1200 px) so it fits at 1280×720.

**Decisions:** Q33, Q34, Q35, Q36, Q37; D23 (the owner: 500 and 5,000 simulated games).

**Phase review findings and what happened to each:**
1. **`docs/enforcement.md` still said 10,000 games.** Fixed: 500 per check, 5,000 per harness run.
2. **The Number stepper board and the differences from the pop-up board were not recorded.**
   Answered above under Differences.
3. **Undo points could push a saved room over B13 (100 KB) late in a game.** Recorded as Q37 for
   phase 15, where B13 becomes required: it measures the worst case and, if a room goes over, undo
   points keep only what each action changed. The largest simulated room is 27 KB today.
4. **At the action limit the draw table lost "None left".** Fixed: each draw status says whether any
   card is left, apart from its rejection; a client test covers it.
5. **Two files exported two functions.** Fixed: `amountsText` and `absentLogItems` have files of
   their own.
6. **Malformed influence, draw action and undo intents were not tested.** Fixed: six malformed
   intents are rejected as `malformed_message`; the parser already did so.
7. **Retaken screenshots were not committed.** Fixed: committed after the fixes.
8. **`HARNESS.md` gave draw actions a `tier` the scenarios never use.** Fixed: the trade name
   carries the tier (Q36).
