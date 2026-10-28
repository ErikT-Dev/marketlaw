# Phase 10: Types, combos and projects

Status: in progress
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
- Simulated games rarely complete projects (52 in the 10,000 games, never a third project): before
  influence (phase 11) and the market phase (phase 12) a player gets few cards in 10 turns, so 8 of
  a stat is rarely reached. I12 and the third-project and first-completion paths are proven by the
  scenarios and a deliberate-break unit test. The simulation report now counts accepted actions by
  type, so later phases show the number rising.

## What you can see when it's done

In a test room (D8) set up with ready combos and 8 quality: claim combos with the pop-up showing
totals, complete a project, and see the first-completion funds at the end of the turn.

## Exit criteria

- The listed invariants hold over 10,000 games.

## Open points

- None.

## Required scenarios

These 16 scenarios are added to `harness/required.yaml` in this phase, by file and number
(`projects` #6 moved to phase 12, Q30):

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
- `projects` #7: everyone who completes a project in the first turn anyone does gets 2 extra funds at the end of the turn
- `projects` #8: a project completed in a later turn gives no first-completion funds

## Progress

- [x] 1. Combos: card-name and type-count combos, infinite ones at every multiple, claimed with
  claim all in one action; type counts include gained types, so quests (phase 13) will count.
  Views carry type counts, combos and whether claim all would be accepted. Save version 6.
- [x] 2. Projects: use up 8 of the stat, give income, funds, influence and a card; the third
  gives one more income and card; first-completion funds at the end of the turn. `projects` #6
  needs the market phase and moved to phase 12 (Q30). I12 and I14 are checked after every action,
  I13 by the simulator.
- [x] 3. Screens: city by sector, combos panel with the ready count, claim all and projects
  pop-ups, type chips and project progress (S6.1–S6.3, S8.1, S8.2), with a browser test in a test
  room and screenshots.

## Report

**What was built.**
- **Combos (R12):** card-name and type-count combos; infinite ones are claimed again at every
  multiple of the count; Claim all claims every ready combo in one action. Types gained from
  quests (phase 13) already count.
- **Projects (R16, R10.1, R2.3):** a project uses up 8 of its stat and gives +1 income, +2 funds,
  +3 influence and a card; the third gives one more income and card; everyone who completes a
  project in the first turn anyone completes it gets +2 funds at the end of that turn. A project
  needs no negative workforce, quality or satisfaction.
- **Screens (S6.1, S6.3, S6.6, S8.1, S8.2):** your city by sector, the combos panel with the ready
  count, type chips, project progress, and the Claim all and Projects pop-ups.
- **Checks:** I12 and I14 after every action, I13 in the simulator; 16 scenarios required
  (`projects` #6 waits for phase 12, Q30). Save version 6.

**What to try (after the merge).** Start a test room (`docs/test-rooms.md`) with Row House and
Fire Station in seat 1's city and 8 quality: Claim all (1) shows the combo and +1 quality in
total; Projects lets you complete "Clean up the streets"; when both players end the turn, the
first-completion funds arrive (funds 15).

**Differences from the phase file.** `projects` #6 moved to phase 12 (Q30). The Projects button
always opens its pop-up (Q32, written into S6.6).

**Decisions:** Q30, Q31, Q32.

**Phase review findings and what happened to each:**
1. **Nothing checked that first completions are recorded.** Fixed: `then.first_completions` in the
   scenario format, checked at the end of `projects` #7 (Q31). Dropping the record now fails #7.
2. **The simulation barely completed projects.** Partly fixed: the legal bot aims at the open
   project closest to 8 half the time, raising completions from about 30 to 52 per 10,000 games,
   and the report counts accepted actions by type. Still rare until phases 11 and 12 (Known gaps).
3. **The project row contradicted itself after you completed a project this turn.** Fixed: it shows
   "you completed ✓" in place of the progress, without the first-completion note; a client test
   covers it.
4. **The Projects button was never disabled, chosen silently.** Answered with Q32, written into
   S6.6: it opens the pop-up, whose Complete buttons are disabled when the room would reject them.
5. **Weak assertions in the claim-all tests.** Fixed: exact totals, combo rows, and quality after
   the claim and after the project in the browser test.
6. **The project list and the need of 8 were defined in five places.** Fixed: one copy in
   `shared/`, derived from the project name schema.
7. **A disabled Complete button gave no reason.** Fixed: the pop-up shows the S16.3 message.
8. **Naming and bot tests.** Fixed: no placeholder parameter name; the legal bot's claim, project
   and aiming choices have unit tests.

Also found: browser tests could fail when the hand held two copies of the card they picked (random
deals); they now pick a card held once.
