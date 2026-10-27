# Phase 02: Scenario runner and card data

Status: in progress
Milestone: 1 Foundations

## Goal

Make all 425 scenarios executable, track what must pass in `harness/required.yaml`, and show rule
by rule what passes in `harness/report.html`. Load and check the card data every later phase
uses.

## Depends on

Phase 01.

## Covers

- Rules: R3.1, R3.2, R3.5 (the card-data check approved in `coverage-exceptions.yaml`).
- Checks: `HARNESS.md` point 7, the card-data check.
- Scenarios: none required yet; all run and show as "not yet".

## Builds

1. **Card and quest catalogue in `src/shared/`**, so both the engine and the client can use it:
   `cards.json` read through a `valibot` schema into typed cards (sector, tier, base cost, stat
   numbers, types counted once or twice, combos with needs and the infinite flag, photo file
   name), the quest list of R20.7 and the type points of R21.7. Card, quest and type names are
   branded ids.
2. **Card-data check** (R3.2, R3.5): 240 cards, every field present, base costs and product or
   distribution per tier as in R3.5.
3. **Scenario runner** (`tools/harness-runner/`, run by Vitest):
   - reads every file in `harness/scenarios/`, reusing the format check of
     `tools/harness-check/`;
   - runs each scenario through a **driver** interface: one method per `given` field group, one
     per `when` step, one reading each `then` field. Phase 03 adds the engine driver, phase 04
     the room driver that later phases extend;
   - supplies scripted random results from `random` in order and fails a scenario that does not
     list every random result the rules ask for;
   - compares every `then` field exactly; fields not mentioned are not checked.
4. **`harness/required.yaml`** (D11): three lists, `scenarios` (by file and name), `invariants`
   and `budgets`, empty in this phase. The runner fails on a listed name that does not exist.
   `HARNESS.md` gets a short section explaining the file (approved with this phase). Adding names
   asks for the owner's approval, because the file is in `harness/`.
5. **Report:** `npm run harness` writes `harness/report.html`: per rule, its scenarios and
   whether each passes, fails, is "not yet", or "passes, not yet required"; the checks; later the
   invariants and budgets. `npm run harness` runs inside `npm run check`. GitHub keeps the report
   as a downloadable result of every run.

## Known gaps after this phase

- No game exists; every scenario is "not yet".

## What you can see when it's done

`harness/report.html` in a browser, also downloadable from the GitHub run: every rule of R, M, A,
C and T with its scenarios, all "not yet", and the card-data check passing.

## Exit criteria

- The runner reads all 425 scenarios without errors.
- A test proves that a failing scenario on the required list fails the check, and that an
  unknown name on the list fails the check.
- The card-data check passes.

## Open points

- None.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.

## Progress

- [x] 1. Card and quest catalogue in `src/shared/catalogue/`: `CARDS` (parsed by `parseCards`
  through a valibot schema; a combo's need is a type when it is one of the 33 types, otherwise a
  card name), `QUESTS` and `TYPE_POINTS`; branded `CardId`, `CardName`, `TypeName`, `QuestName`;
  `Result` in `src/shared/`. Quests hold name and tier only: requirements and rewards as data are
  phase 13, item 1, which designs them for the checks.
- [x] 2. Card-data check (`tools/harness-runner/checkCardData.ts`): the schema (every field
  present, known types, complete combos), 240 cards with 20 per sector and tier, unique names and
  ids, R3.5 base costs and product or distribution per tier.
- [x] 3. Scenario runner (`tools/harness-runner/`). Differs from the phase file: a driver gets the
  whole `given` at once (`startSession`) instead of one method per field group, because setup
  needs the fields together; it declares the given fields, steps and then fields it handles, and
  a scenario using anything it does not handle is "not yet". Then fields are read with the
  expected value, so a driver returns only the seats asked for; objects compare only the keys the
  scenario mentions, lists compare exactly. Random results come from `ScriptedRandom`; the driver
  says whether it asks for setup or play, and only setup may go past the listed results. Unused
  listed results fail the scenario (Q4).
- [x] 4. `harness/required.yaml` (Q3), empty; `HARNESS.md` section "What must pass now".
- [x] 5. `npm run harness` = `harness:check` + `tools/harness-runner/harness.test.ts`, which
  writes `harness/report.html` and fails on any problem with the required list. The harness test
  also runs in `npm run test`, so `npm run check` runs it twice; it takes about a second.
  GitHub uploads the report as the `harness-report` artifact of every check run.
