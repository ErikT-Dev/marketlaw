# Phase 30: Version 1 readiness

Status: in progress
Milestone: 7 Launch

## Goal

Everything `harness/HARNESS.md` requires for "the game passes the harness", at every supported
screen size, and the owner's decision to make version 1 public.

## Depends on

All earlier phases, 29c included.

## Covers

- Rules: every rule in `harness/spec/`.
- Scenarios: all 427 on `harness/required.yaml`; the "not yet" allowance of `rules/testing.md`
  ends.
- Invariants: all 30 over the phase-end games of `npm run harness` (D25). Budgets: all 19.
- Checks: every point of "What passing means" in `HARNESS.md`, 0 to 7.
- Screens: every screen at every size decided in O2, with screenshots in `harness/screens/`.

## Builds

1. **Gaps:** whatever the harness report still shows as "not yet", failing or unmeasured.
2. **Screen sizes, accessibility:** every screen at every supported size; keyboard-only run
   through a full game; `prefers-reduced-motion` respected.
3. **Browser tests:** 2–4 players through full games, refreshes, disconnects, a second tab and a
   forced restart, at every size.
4. **Launch preparation:** final data wipe; the save format fixed at a version from which
   migrations are kept (D1); the site lock already removed (D22); the test-room
   tool stays owner-only (D8), with its test passing on the public site; deploy; the owner's final
   playthrough.

## Known gaps after this phase

- None allowed.

## What you can see when it's done

The complete harness report, every line passing, and screenshots of every screen at every size.

## Exit criteria

- The game passes the harness, every point of "What passing means".
- The owner decides to make version 1 public.

## Open points

- Findings from the final playthrough are fixed, or moved to after version 1 with the owner's
  agreement.

## Required scenarios

None by name: phases 03 to 29 together make all 427 scenarios required. This phase checks that `harness/required.yaml` holds every scenario, every invariant and every budget.

## Progress

- [x] 0. Start (2026-11-25). Branch `phase-30-version-1-readiness`. The starter's decisions are
  in Q189. `decisions.md` has nothing open. `npm run harness:check`: 548 scenarios, 0 problems.
  - **Counts.** The phase file's "427" is old: the phase requires all **548** scenarios, all 30
    invariants and all 19 budgets (Q189, 1).
  - **Order.** 1a, then 1b (it fails while anything is off the list). 1c, 2a to 2c and 3 in any
    order. 4a before 4b (the wipe relies on the raise). 5 after the release.
  - **Required scenarios.** The phase has none by name; item 1a puts the last ones on the list,
    so the finisher's step 1 has nothing to add.

- [x] 1a. **Every scenario and budget on the required list** (HARNESS.md points 1 and 4).
  **Small.**
  - `harness/required.yaml`: add the 8 `quests` scenarios that pass but are not required
    (#63 to #68 "completing Grain fields / Timber town / Brewery town / Oil town / Trading
    house / Property market gives its reward", #69 "tier 3 cards do not count for a tier 2 card
    requirement", #70 "a product or distribution requirement needs that much of the stat") and
    budgets B10, B14, B15, B19 (`HARNESS:` commit, Q189).
  - `tools/harness-runner/judgeHarness.ts` (`budgetProblem`) reports "has no check yet" for
    every required budget the harness cannot measure. Q189, 2: a required budget whose
    `BUDGET_CHECKS.ts` entry is `by: "other check"` is checked by that check, a problem only if
    the file its `where` names does not exist; `reportBudgets.ts` shows it as "passes, other
    check". Tests beside them (`reportBudgets.test.ts`, the judge's tests).
  - Done (2026-11-25). `judgeHarness.ts` leaves a required "other check" budget to its check;
    the report keeps showing it as "other check" (not "passes": the harness does not see the
    result; Q189 says so). A unit test in `reportBudgets.test.ts` checks that the file each
    other check names exists. The list now holds all 548 scenarios, 30 invariants and 19 budgets.

- [x] 1b. **The "not yet" allowance ends** (`rules/testing.md`, D11; Q189, 3). **Small.**
  - `npm run harness:check` (`tools/harness-check/`) reports a problem for every scenario,
    invariant or budget that is not on `harness/required.yaml`, with a test. After 1a it
    reports none. `harness/HARNESS.md` and `README.md` ("How scenarios, invariants and budgets
    are tracked") say the allowance has ended (`HARNESS:` commit for HARNESS.md).
    `rules/testing.md` is not edited (protected by judgment, the owner's file): propose the
    wording in `docs/plan/proposed-rules.md`.
  - Done (2026-11-25). `tools/harness-check/checkEverythingRequired.ts` (reusing the runner's
    `readRequiredList`, `readIdentifiedEntries`, `fileKeyOf`) reports "not on
    harness/required.yaml; everything must be required" per missing name, with a test.
    `npm run harness:check`: 548 scenarios, 0 problems.
  - For later items: a new scenario, invariant or budget must go on `harness/required.yaml` in
    the same change, or `npm run harness:check` fails.

- [x] 1c. **Known gaps of earlier phases** (Q189, 4a and 4c; S1.6, S6.4). **Small.**
  - A red card name's tooltip with keyboard focus: the stat icons inside it must not show their
    own name tooltips over its lines (29a known gap; with the mouse it is clean). See
    `e2e/tooltipsOnFocus.spec.ts`.
  - One-word card names too wide for a tile (Telecommunication, Hydroelectricity,
    Slaughterhouse, Pharmaceutical and more; `src/client/components/Card.module.css` line 73,
    `overflow-wrap: anywhere`): write S6.4's hyphenation first (`HARNESS:` commit), then
    hyphenate at a syllable break, checked on the city and card set tiles
    (`e2e/cardTiles.spec.ts`). Remove both from "Known gaps" only in this phase's report.
  - Done (2026-11-25). Tooltip: `Chip.module.css` shows a stat or type icon's name on focus only
    when the icon is not inside a `role="tooltip"`; a new test in `tooltipsOnFocus.spec.ts`
    (fails without the fix). Names: S6.4 says a too-wide word is hyphenated at a syllable break
    (Q189); `CARD_NAME_WORD_SYLLABLES.ts` lists the syllables of every card-name word longer than
    8 letters (a unit test keeps it complete), `hyphenatedCardName` puts soft hyphens there, and
    `.name` uses `hyphens: manual` instead of `auto` (Chromium's own hyphenation broke anywhere).
    `cardTiles.spec.ts` now also fails a name broken between two letters on hand, city,
    marketplace and card set tiles; all its tests pass locally at all three sizes.
  - For the report: both gaps (29a's focus tooltip, 29c's R2) are fixed. Local browser runs lost
    test-room requests ("Network connection lost") under load; they pass on a rerun.

- [ ] 2a. **Every screen at every size** (S1.1, D21, HARNESS.md point 6). **Large.**
  - Compare every screen and state `harness/spec/screens.md` describes (S1 to S16, the tutorial
    included) with the folders in `harness/screens/` (110 now, each with 1280x720, 1920x1080,
    2560x1440); add a screenshot test for any screen without one, using the existing
    `expectScreenFits.ts` and the screenshot helpers of the specs.
  - Fix 29a's F1 (Q189, 4b): late in a game with many types, Your stats wraps until the hand
    at 1280x720 is shorter than one card; a test room with many types at 1280x720 checks the
    hand keeps at least one card's height (`e2e/gameScreenSizes.spec.ts`).

- [ ] 2b. **A keyboard-only full game** (`rules/frontend.md` "Accessible controls"; Q189, 5).
  **Large.**
  - In the 2-player game of `e2e/fullGames.spec.ts` (`e2e/playFullGame.ts`), Ann plays every
    action from the lobby to the end screen with the keyboard only (Tab, Shift+Tab, Enter,
    Space, arrows, Escape; no `click`). Keep the test title: `check.yml` picks the full games
    by "play a whole game from the lobby". Whatever cannot be reached by keyboard is a bug to
    fix in the client. Run it locally at one size only; GitHub runs all three.

- [ ] 2c. **`prefers-reduced-motion`** (Q189, 6). **Small.**
  - A browser test with `reducedMotion: "reduce"` checks `document.getAnimations()` is empty
    after the actions that animate on the game screen and the lobby. Today only
    `Button.module.css` and `Marketplace.module.css` animate, both behind
    `prefers-reduced-motion: no-preference`; check scripted motion too (`scrollIntoView` with
    `behavior: "smooth"` and the like).

- [ ] 3. **Browser tests: 2 to 4 players, refreshes, disconnects, second tab, restart**
  (HARNESS.md point 6). **Small.**
  - They exist: `fullGames.spec.ts` (2, 3, 4 players), `connections.spec.ts` (refresh, away and
    back, second tab, "the game goes on after its room restarts mid-game"), all run at every
    size by `playwright.config.ts`. Check each runs at all three sizes on the last GitHub run of
    master and that none is skipped by size; add what is missing (for example a refresh or a
    restart in a 3- or 4-player room). Update `docs/enforcement.md` if a check now applies.

- [ ] 4a. **The save format fixed** (D1, `rules/architecture.md` "One save format"; Q189, 7).
  **Large.**
  - `SAVE_SCHEMA_VERSION` 20 to 21 (`src/rules/SAVE_SCHEMA_VERSION.ts`), with a new
    `FIRST_PUBLIC_SAVE_SCHEMA_VERSION` = 21. `src/server/room/loadRoom.ts`: below it, the room
    closes itself as now; from it on, an older version goes through a migration function (one
    step per version, none yet). The same for `ROOM_SCHEMA_VERSION` and the replay record
    (`src/server/replays/`). Committed fixtures of version 21 saves (a running and an ended
    game) load and replay (`src/rules/savedGame.test.ts`, `roomStorage.test.ts`).
  - No message shape changes, so `PROTOCOL_VERSION` stays.

- [ ] 4b. **The final data wipe** (D1; Q189, 8). **Small.**
  - A D1 migration (`migrations/0016_...sql`) deletes every row of every table, keeping the
    tables; the lobby's and the queue's stored state (`src/server/lobby/`, `src/server/queue/`)
    is cleared once on the first load after the deploy. It runs at the merge
    (`npm run db:migrate:remote` in `deploy.yml`). Not run against the live database by hand.

- [ ] 5. **Release checks and the owner's decision** (D8, D22; Q189, 9). For the releaser.
  - On the live site after the deploy: the site loads without a login (D22); the test-room
    endpoint answers 404 without the secret (`e2e/testRooms.spec.ts`'s first test, against the
    live address); the wipe took effect (an old room link shows "Room not found").
  - Then write under **Waiting for the owner**: the owner's final playthrough and the decision
    to make version 1 public. The phase is **waiting for the owner**, not done, until then.

### Finish

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter + builder 1a | Opus, medium | 18 | 139,741 | 78 | done |
| Builder 1b + 1c | Opus, medium | 29 | 146,871 | 87 | done |
