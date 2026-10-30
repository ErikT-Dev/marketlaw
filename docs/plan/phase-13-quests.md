# Phase 13: Quests

Status: done
Milestone: 3 Playthrough

## Goal

The shared quests table: 45 quests, requirements, rewards including gained types, ageing,
refilling, and the 5th place from turn 20.

## Depends on

Phases 11 (undo of quests) and 12 (start of turn).

## Covers

- Rules: R19, R20, R10.2, R11.2, R20.6.
- Invariants: I12 (quests), I15, I16.
- Screens: S5 (quests panel, per-player progress lines, Complete button, completed shading, room
  for 5 quests with 4 players). Design board "Quest card", the quests panel of "Game main phase
  1920x940".

## Builds

1. **Requirements** as data-driven checks: sector and tier counts, type counts, stats, income,
   completed projects.
2. **Rewards,** including gained types that count everywhere type counts count.
3. **Table life cycle:** completed quests leave for good; quests at the end of their 5th turn go
   back to the list; refills by tier by turn with R19.8's tier gates; the 5th place.
4. **Quests panel** with progress for every player.

## Known gaps after this phase

- No clocks yet.

## What you can see when it's done

In a test room near a quest's requirement: see progress for both players, complete it, and see
it leave the table at the end of the turn.

## Exit criteria

- The listed invariants hold over 5,000 games.

## Open points

- D21: rerun `e2e/gameScreenSizes.spec.ts` at 1280×720 with 5 quests and 4 players; if the
  screen cannot fit with 24 px targets, raise the screen sizes with the owner again.

## Required scenarios

These 67 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `quests` #1: rejects a quest whose requirement is not met
- `quests` #2: a requirement means at least that amount and nothing is used up
- `quests` #3: rejects completing the same quest twice
- `quests` #4: rejects a quest that is not on the table
- `quests` #5: rejects completing a quest outside the main phase
- `quests` #6: several players can complete the same quest in the same turn
- `quests` #7: a completed quest leaves the table for good and the place is refilled next turn
- `quests` #8: a quest nobody completed in 5 turns goes back into the quest list
- `quests` #9: a tier 2 quest picked before turn 5 is replaced by a tier 1 quest
- `quests` #10: a tier 3 quest picked before turn 13 is replaced by the nearest allowed tier
- `quests` #11: a tier with no quests left falls back to the nearest tier with quests the lower one first
- `quests` #12: with no quests left in the list empty places stay empty
- `quests` #13: sector counts count only cards in the city
- `quests` #14: a gained type is not a card and does not count for sector counts
- `quests` #15: a type gained from one quest helps complete another
- `quests` #16: completing Working district gives its reward
- `quests` #17: completing Farming industry gives its reward
- `quests` #18: completing Local services gives its reward
- `quests` #19: completing Green city gives its reward
- `quests` #20: completing Countryside gives its reward
- `quests` #21: completing Farmland gives its reward
- `quests` #22: completing Fishing village gives its reward
- `quests` #23: completing Sports town gives its reward
- `quests` #24: completing High street gives its reward
- `quests` #25: completing Mining town gives its reward
- `quests` #26: completing Workers' housing gives its reward
- `quests` #27: completing Tidy streets gives its reward
- `quests` #28: completing Healthy town gives its reward
- `quests` #29: completing Trading post gives its reward
- `quests` #30: completing Supply chain gives its reward
- `quests` #31: completing Growing suburbs gives its reward
- `quests` #32: completing Upmarket homes gives its reward
- `quests` #33: completing Modern industry gives its reward
- `quests` #34: completing Service economy gives its reward
- `quests` #35: completing Culture hub gives its reward
- `quests` #36: completing Factory town gives its reward
- `quests` #37: completing Market town gives its reward
- `quests` #38: completing Industrial zone gives its reward
- `quests` #39: completing Shopping centre gives its reward
- `quests` #40: completing Leisure park gives its reward
- `quests` #41: completing Culture district gives its reward
- `quests` #42: completing Safe streets gives its reward
- `quests` #43: completing Happy residents gives its reward
- `quests` #44: completing Civic pride gives its reward
- `quests` #45: completing Service boom gives its reward
- `quests` #46: completing Penthouses gives its reward
- `quests` #47: completing Heavy industry gives its reward
- `quests` #48: completing Office district gives its reward
- `quests` #49: completing Public institutions gives its reward
- `quests` #50: completing City living gives its reward
- `quests` #51: completing Tech campus gives its reward
- `quests` #52: completing Commuter city gives its reward
- `quests` #53: completing Business district gives its reward
- `quests` #54: completing Media city gives its reward
- `quests` #55: completing Tech industry gives its reward
- `quests` #56: completing Metropolis gives its reward
- `quests` #57: completing Balanced city gives its reward
- `quests` #58: completing Cultural capital gives its reward
- `quests` #59: completing Civic leader gives its reward
- `quests` #60: completing High-tech economy gives its reward
- `quests` #61: tier 1 cards do not count for a tier 2 or 3 card requirement
- `quests` #62: Penthouses needs a tier 3 card among its Residential cards
- `quests` #63: Metropolis needs tier 3 cards in 3 different sectors
- `quests` #64: empty quest places are filled in table order
- `turns-and-time` #32: a 5th quest place is added and filled at the start of turn 20
- `undo` #5: undo takes back completing a quest whose reward draws no card
- `undo` #11: completing a quest whose reward draws a card cannot be undone

## Progress

- [x] 1. Requirements as data (`QUEST_TERMS`): card counts by sector and lowest tier, tier 3 cards
  in different sectors, type counts, stats, income, completed projects. The `complete_quest`
  action with `quest_not_on_table`, `quest_already_completed` and `quest_needs_not_met`; a seat
  keeps the quests it completed, so undo and the start-of-main-phase view of other players need
  nothing extra.
- [x] 2. Rewards: stats, gained types and draws (R20.5, logged with the cause "quest"); undo
  stops at a quest whose reward drew a card.
- [x] 3. Table life cycle: completed quests leave for good, quests at the end of their 5th turn go
  back to the list, empty places refill in table order with R19.8's tier gates, the 5th place at
  turn 20; I12 (quests), I15, I16; bots complete quests; save version 9.
- [x] 4. Quests panel (S5) with every player's progress, the Complete button, completed shading
  and room for 5 quests with 4 players; the D21 size check at 1280×720.

Note on item 4: at 1920×1080 and up all 5 quests with 4 players fit; at 1280×720 the quests panel
shows about 2 cards and scrolls inside (Q41, for the owner under D21). The view sends "turns
left", so the client does not need the 5-turn rule.

Notes on items 1-3: a quest place with no quest is `null`, as `quests` #12 expects. When the
list still has quests but none of a tier allowed yet, the place stays empty (Q40, written into
R19.8). Quest progress in the view is a count per requirement part, in the order of
`QUEST_TERMS`; the client words it. The chaos bot also tries quests that are not on the table.

**Where the phase stands (2026-10-30).** All four items are built and the review findings are
fixed or recorded. `npm run check` (255 tests), `npm run harness` (5,000 games, about 15 min, up
from 10; bots completed 6,191 quests, every invariant held) and the browser tests (51) pass.
Merged and deployed.

## Report

**What was built.**
- **Requirements (R19.4, R20.1–R20.4):** all 45 quests of R20.7 as data, checked against each
  player's city, type counts (gained types included), stats, income and completed projects.
- **Completing a quest (R19.5):** a main-phase action, once per player per quest, any number of
  players per quest and turn. Rejected with `quest_not_on_table`, `quest_already_completed` or
  `quest_needs_not_met`.
- **Rewards (R20.5, R20.6):** stats, gained types (they count for combos and other quests) and
  card draws, which show in the draw log as "(quest)". Undo takes a quest back unless its reward
  drew a card.
- **The quests table (R10.2, R11.2, R19.6–R19.9):** completed quests leave for good at the end of
  the turn. Quests nobody completed in 5 turns go back into the list. Empty places refill in table
  order at the start of the next turn, with tier 2 from turn 5 and tier 3 from turn 13, and a 5th
  place opens at turn 20.
- **Screens (S5):** each quest shows its tier, turns left, requirement, reward and every player's
  progress ("3/4" with an icon, or "completed"), a Complete button and green border when you can
  complete it, and green shading once you have. Other players' progress shows as at the start of
  the main phase (M3.2).
- **Checks:** 67 scenarios and I15, I16 required (I12 now covers quests); save version 9. Bots
  complete quests in the simulator.

**What to try (after the merge).** Start a test room (`docs/test-rooms.md`) with
`npm run test-room -- quests 6`: both seats can complete Trading post. Complete it in one window
and see "You · completed" there, while the other window still shows that player without
"completed" until the main phase ends. End the turn in both windows: Trading post is gone and a
new quest fills its place.

**Differences from the phase file.** None in what is built. The view sends "turns left" instead of
"turns on the table", so the client does not need the 5-turn rule. Card-count requirements are
written as text ("3 Residential cards"), as on the design board; stats and types are icons with
their names in a tooltip. The harness now takes about 15 minutes.

**Decisions:** Q40 (a place stays empty when no allowed tier has quests; written into R19.8).
**For the owner:** Q41 (at 1280×720 the quests panel shows about 2 of 5 quests and scrolls inside;
everything fits from 1920×1080 up). D21 asks for this to be raised again.

**Phase review findings and what happened to each:**
1. **D21 at 1280×720 was not recorded, and the size test could pass with cards off-screen.**
   Recorded as Q41 for the owner. The test now checks that every card and the Complete button can
   be scrolled into view at every size, and that all 5 cards are in view from 1920×1080 up.
2. **Progress item 4 was not ticked.** Fixed.
3. **"1 tier 3 Residential cards".** Fixed: a requirement of one card is singular; a test covers it.
4. **I16 fell back to tier 1 for a quest not in the catalogue.** Fixed: it reports that quest.
5. **A given quest list kept quests already completed.** Fixed in the scenario runner and test
   rooms; no scenario was affected.
