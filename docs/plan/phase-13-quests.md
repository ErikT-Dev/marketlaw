# Phase 13: Quests

Status: in progress
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
