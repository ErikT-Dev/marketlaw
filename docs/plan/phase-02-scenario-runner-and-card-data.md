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

- [ ] 1. Card and quest catalogue in `src/shared/`
- [ ] 2. Card-data check (R3.1, R3.2, R3.5)
- [ ] 3. Scenario runner with the driver interface and scripted random results
- [ ] 4. `harness/required.yaml` and its section in `HARNESS.md`
- [ ] 5. `harness/report.html` from `npm run harness`, kept by GitHub
