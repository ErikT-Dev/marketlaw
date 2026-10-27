# Phase 02: Scenario runner and card data

Status: done
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
- `QUESTS` holds each quest's name and tier only; requirements and rewards as data come in
  phase 13 (Builds 1 and 2).
- The statistical, rating and replay export checks show as "not yet" until phases 08, 27 and 19
  build them.

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

## Report

**What was built.** The 240 cards, the 45 quests (name and tier) and the type points are now
typed data in `src/shared/catalogue/`, read from `cards.json` through a schema. The card-data
check proves R3.1, R3.2 and R3.5. The scenario runner (`tools/harness-runner/`) reads all 425
scenarios and runs each one through a driver. It supplies the scripted random results and
compares the `then` fields. Because no driver exists yet, every scenario is "not yet".
`harness/required.yaml` lists what must pass; it is empty in this phase. `npm run harness` writes
`harness/report.html`, and GitHub keeps that report with every check run as the `harness-report`
artifact.

**What to try.** Run `npm run harness` and open `harness/report.html`, or download
`harness-report` from any GitHub check run. The verdict says the harness passes, the card-data
check passes, and every rule of R, M, A, C and T lists its scenarios as "not yet".

**Differences from the phase file.** A driver receives the whole `given` at once, not one method
per field group (see Progress, item 3). Quests have no requirements or rewards yet (phase 13).
The harness test also runs inside `npm run test`, so `npm run check` runs it twice; that takes
about a second.

**Decisions** (`open-questions.md`):
- Q3: the shape of `required.yaml`
- Q4: unused or wrong-kind random results fail a scenario
- Q5: how `then` is compared
- Q6: scenario names are unique within a file

**Phase review findings and what happened to each:**
1. Q4 was not written into `HARNESS.md`. Fixed: added to "Random results" (2b0f027).
2. How `then` is compared was not recorded. Fixed: Q5, plus a sentence in `HARNESS.md` (2b0f027).
3. The test for "a required scenario fails the check" did not reach the real link between
   `required.yaml` and the runs. Fixed: `buildScenarioRuns` plus an end-to-end test (30e7262).
4. and 5. Loose assertions. Fixed: every one now asserts exact values (30e7262).
6. Quest names and type order were not checked against the spec. Fixed: exact-order tests, plus
   `catalogueMatchesSpec.test.ts`, which compares the catalogue with the spec (30e7262).
7. Quests are only partly built. Answered: deferred to phase 13 on purpose, and now listed under
   Known gaps.
8. Setup took random results by order only. Fixed: setup no longer uses a listed result of
   another kind, so play results stay for play (30e7262).
9. Nothing kept scenario names unique. Fixed: a harness-check rule (Q6, a67fd64).
10. Nested or repeated types. `{ path, text }`, `{ file, name }` and the outcome type now have
    their own files. Answered: the union members of `Combo` and `Result` stay inline, because that
    is the discriminated-union style `rules/typescript.md` asks for.

The reviewer also said the report's verdict read "fails". That did not reproduce: a fresh run on
the branch gives "The harness passes", with no problems.

**Checks.** `npm run check` is green locally (54 unit tests, 2 harness tests, 0 harness
problems, 68.41 kB client) and on GitHub. `npm run e2e` passes, but there are no browser tests
yet.

