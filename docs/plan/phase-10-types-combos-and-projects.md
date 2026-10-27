# Phase 10: Types, combos and projects

Status: approved
Milestone: 3 Playthrough

## Goal

Combos with claim all, and the three projects with first-completion rewards.

## Depends on

Phase 09.

## Covers

- Rules: R12 (combos; type counts exist since phase 03), R16, R10.1's first-completion rewards,
  R2.3 for projects.
- Invariants: I12 (projects), I13, I14.
- Screens: S6.1 (city by sector, combos panel with ready count), S6.3 (project progress, first
  completion), S8.1 (claim all), S8.2 (projects), the Claim all and Projects buttons of S6.6.
  Design boards "Pop-up: claim all with totals", "Pop-up: card-name combo rewards", "Pop-up:
  projects", "Combo button", "Type chip", "Type tooltip".

## Builds

1. **Combos:** card-name and type-count combos, infinite combos at every multiple, claim all in
   one action; gained types (from quests in phase 13) already count.
2. **Projects:** needs, rewards, the third-project bonus, first completion at the end of the turn.
3. **Screens** for both.

## Known gaps after this phase

- No influence, undo, market phase, quests or clocks yet.

## What you can see when it's done

In a test room (D8) set up with ready combos and 8 quality: claim combos with the pop-up showing
totals, complete a project, and see the first-completion funds at the end of the turn.

## Exit criteria

- The listed invariants hold over 10,000 games.

## Open points

- None.

## Required scenarios

These 17 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `combos-and-income` #1: a card-name combo is claimed when the named card is in the city
- `combos-and-income` #2: a card-name combo works whichever card was played first
- `combos-and-income` #3: a card-name combo does not count another player's city
- `combos-and-income` #4: a type-count combo is claimed once
- `combos-and-income` #5: claim all claims an infinite combo as many times as the type count allows
- `combos-and-income` #6: an infinite combo already claimed is claimed again at the next multiple
- `combos-and-income` #7: types gained from quests count for type combos
- `combos-and-income` #8: rejects claim all when no combo is ready
- `combos-and-income` #13: an infinite combo with a count of 1 is claimed once for every count
- `projects` #1: completing a project uses up 8 of the stat and gives income funds influence and a card
- `projects` #2: rejects a project without enough of the stat
- `projects` #3: rejects a project while another stat is negative
- `projects` #4: rejects completing the same project twice
- `projects` #5: the third project gives an extra income and an extra card
- `projects` #6: rejects a project outside the main phase
- `projects` #7: everyone who completes a project in the first turn anyone does gets 2 extra funds at the end of the turn
- `projects` #8: a project completed in a later turn gives no first-completion funds
