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

- [x] 2a. **Every screen at every size** (S1.1, D21, HARNESS.md point 6). **Large.**
  - Compare every screen and state `harness/spec/screens.md` describes (S1 to S16, the tutorial
    included) with the folders in `harness/screens/` (110 now, each with 1280x720, 1920x1080,
    2560x1440); add a screenshot test for any screen without one, using the existing
    `expectScreenFits.ts` and the screenshot helpers of the specs.
  - Fix 29a's F1 (Q189, 4b): late in a game with many types, Your stats wraps until the hand
    at 1280x720 is shorter than one card; a test room with many types at 1280x720 checks the
    hand keeps at least one card's height (`e2e/gameScreenSizes.spec.ts`).
  - Done (2026-11-25). F1: Your stats and Your hand share a grid (`.statsAndHand` in
    `GamePage.module.css`) in which Your stats is at most the column minus one hand card, so it
    scrolls instead of pushing the hand lower; a test room with all 33 types at turn 35 checks
    the hand panel at every size (fails without the fix). New screenshots (Q190): connection-lost,
    new-version (`connectionNotices.spec.ts`, through `routeWebSocket`), game-resumed (a test
    room can now start paused), leave-tutorial, card-set-during-game, game-over-ranked,
    lobby-match-declined, lobby-match-did-not-start, match-history-deleted-account,
    market-final-seconds. Text-only variants of screenshotted states are covered by those and
    by unit tests (Q190, 1). The connection-lost screen failed axe (no main landmark, since
    `main` was inert); `TableContent` now makes the columns inert instead.
  - For later items: the 10 new screenshot folders are not committed; the finisher's copy from
    the GitHub run adds them at all three sizes. Local runs with 2 workers still lose test-room
    requests ("Network connection lost"); single tests pass alone.

- [x] 2b. **A keyboard-only full game** (`rules/frontend.md` "Accessible controls"; Q189, 5).
  **Large.**
  - In the 2-player game of `e2e/fullGames.spec.ts` (`e2e/playFullGame.ts`), Ann plays every
    action from the lobby to the end screen with the keyboard only (Tab, Shift+Tab, Enter,
    Space, arrows, Escape; no `click`). Keep the test title: `check.yml` picks the full games
    by "play a whole game from the lobby". Whatever cannot be reached by keyboard is a bug to
    fix in the client. Run it locally at one size only; GitHub runs all three.
  - Done (2026-11-25). Every move of the full-game helpers goes through `activate`
    (`e2e/activate.ts`): a click, or for a keyboard-only player Tab until the target has focus, then Enter
    (`tabTo.ts`, `pressWithKeyboard.ts`); the username is typed (`enterText.ts`). `Player` has
    `isKeyboardOnly`; `fullGames.spec.ts` makes Ann keyboard-only in the 2-player game, and
    `playFullGame` fails if any pointer event reached her page. Everything was reachable by Tab
    and Enter; no client change was needed (arrows and Escape were not needed either). It passed
    locally at 1280x720 and 1920x1080 (3.9 minutes each).
  - For later items: the keyboard game adds no job; the 2-player full game on GitHub is its run
    at all three sizes. A new browser test can make a player keyboard-only with `openLobby`'s
    fourth argument and move through `activate`.

- [x] 2c. **`prefers-reduced-motion`** (Q189, 6). **Small.**
  - A browser test with `reducedMotion: "reduce"` checks `document.getAnimations()` is empty
    after the actions that animate on the game screen and the lobby. Today only
    `Button.module.css` and `Marketplace.module.css` animate, both behind
    `prefers-reduced-motion: no-preference`; check scripted motion too (`scrollIntoView` with
    `behavior: "smooth"` and the like).
  - Done (2026-11-25). `e2e/reducedMotion.spec.ts`: with reduced motion, no animation after
    hovering and focusing a lobby button, nor in the market's last seconds (S1 screens.md line
    168: the countdown does not pulse) after hovering a marketplace card and the menu, and the
    page's `scroll-behavior` stays `auto`; a third test checks the countdown does pulse without
    reduced motion, so the check can see an animation. Scripted motion: the only
    `scrollIntoView` (`HighlightFrame.tsx`) has no smooth behaviour and nothing sets
    `scroll-behavior: smooth`; the tutorial's `requestAnimationFrame` only measures. No client
    change was needed. `FULL_MARKETPLACE` moved to `e2e/FULL_MARKETPLACE.ts` (shared with
    `marketPhase.spec.ts`). All three tests pass locally at all three sizes.

- [x] 3. **Browser tests: 2 to 4 players, refreshes, disconnects, second tab, restart**
  (HARNESS.md point 6). **Small.**
  - They exist: `fullGames.spec.ts` (2, 3, 4 players), `connections.spec.ts` (refresh, away and
    back, second tab, "the game goes on after its room restarts mid-game"), all run at every
    size by `playwright.config.ts`. Check each runs at all three sizes on the last GitHub run of
    master and that none is skipped by size; add what is missing (for example a refresh or a
    restart in a 3- or 4-player room). Update `docs/enforcement.md` if a check now applies.
  - Done (2026-11-25). Master's last deploy (run 45503101935) used the branch Check run
    45501725247 of phase 29c: the 3 full games and the 5 connection tests passed at all three
    sizes (24 of 24), none skipped; no browser test in `e2e/` skips by size. All connection
    tests were 2-player, so `connections.spec.ts` gains "in a four-player room a refresh, a
    disconnect and a room restart mid-game keep the game going" (one seat refreshes, one closes
    and rejoins after the restart, one ends its turn before it; the turn ends for all four, no
    hidden card leaks). It passes locally at all three sizes. `docs/enforcement.md` lists it.

- [x] 4a. **The save format fixed** (D1, `rules/architecture.md` "One save format"; Q189, 7).
  **Large.**
  - `SAVE_SCHEMA_VERSION` 20 to 21 (`src/rules/SAVE_SCHEMA_VERSION.ts`), with a new
    `FIRST_PUBLIC_SAVE_SCHEMA_VERSION` = 21. `src/server/room/loadRoom.ts`: below it, the room
    closes itself as now; from it on, an older version goes through a migration function (one
    step per version, none yet). The same for `ROOM_SCHEMA_VERSION` and the replay record
    (`src/server/replays/`). Committed fixtures of version 21 saves (a running and an ended
    game) load and replay (`src/rules/savedGame.test.ts`, `roomStorage.test.ts`).
  - No message shape changes, so `PROTOCOL_VERSION` stays.
  - Done (2026-11-25). Save 21 and room 7 are the first public versions
    (`FIRST_PUBLIC_SAVE_SCHEMA_VERSION`, `FIRST_PUBLIC_ROOM_SCHEMA_VERSION`); each record has an
    empty list of migration steps (`SAVE_MIGRATION_STEPS`, `ROOM_MIGRATION_STEPS`,
    `REPLAY_MIGRATION_STEPS`) run by `src/shared/migratedRecord.ts`, and a test checks first
    public version + steps = current version. `loadRoom` migrates the room and its saved game
    (`migratedRoomRecord`) or removes the room. The replay record uses the save version; the
    export of a stored replay record now goes through `keptReplayRecord` (was
    `keptReplayRecordText`), which parses and migrates it and answers 404 below version 21.
    Fixtures: `src/rules/fixtures/savedGameVersion21{Running,Ended}.json` and
    `src/server/room/fixtures/roomVersion7{Running,Ended}.json` (simulated games, seeds 1 and 2).
    The tutorial record (`TUTORIAL_SCHEMA_VERSION`) is not named by the item and is unchanged.
  - For later items (4b): the kept ranked games' stored moves (`replay_records` rows) are save
    version 20, so after this deploy the export reads them as too old (404). The shape did not
    change from 20 to 21, so 4b's migration can keep them readable by raising their version in
    the same SQL (`UPDATE replay_records SET record = json_set(record, '$.schemaVersion', 21)`
    for the kept rows). `game_records` rows carry no save version and are unaffected.

- [x] 4b. **The final data wipe** (D1; Q189, 8; the owner's change Q191). **Small.**
  - A D1 migration (`migrations/0016_...sql`) keeps the finished ranked game records and every
    account that played one of them, with their logins, ratings, settings and the stored moves
    of those games; it deletes every other game record and its moves, every account that never
    played a ranked game (guests included) with everything that belongs to it, and the daily
    counts (Q191). A test proves what is kept and what goes. The lobby's and the queue's stored state (`src/server/lobby/`, `src/server/queue/`)
    is cleared once on the first load after the deploy. It runs at the merge
    (`npm run db:migrate:remote` in `deploy.yml`). Not run against the live database by hand.
  - Done (2026-11-25). `migrations/0016_final_data_wipe.sql` keeps the `game_records` rows whose
    kind is ranked and their `game_record_players` rows; keeps the `replay_records` rows of those
    games (matched by end time and start time, since the two tables share no id) and raises the
    version 20 ones to 21; keeps `players`, `logins`, `email_links` and `ratings` of every
    account in a kept game; deletes everything else, and every row of `email_counts`,
    `unknown_login_failures` and `test_outbox`. Replay rows below version 20 are kept as they
    are (the export already answers 404 for them, and they expire after 30 days).
    `tools/database-migrations/finalDataWipe.test.ts` applies migrations 0001 to 0015 to an
    in-memory SQLite database (`node:sqlite`), adds pre-launch rows, applies 0016 and checks
    what is kept and what goes. The lobby and the queue now store their record under a new key
    (`launched-lobby`, `launched-queue`) and delete the old key (`lobby`, `queue`) when the
    object starts, so they start empty after the deploy.
  - For later items (5): the wipe runs at the merge, by `npm run db:migrate:remote`.

- [ ] 5. **Release checks and the owner's decision** (D8, D22; Q189, 9). For the releaser.
  - On the live site after the deploy: the site loads without a login (D22); the test-room
    endpoint answers 404 without the secret (`e2e/testRooms.spec.ts`'s first test, against the
    live address); the wipe took effect (an old room link shows "Room not found").
  - Then write under **Waiting for the owner**: the owner's final playthrough and the decision
    to make version 1 public. The phase is **waiting for the owner**, not done, until then.

### Finish

- Finisher (2026-11-25). Step 1: nothing to add; item 1a put every scenario, invariant and budget on
  `harness/required.yaml`. Local `npm run check` passed; local `npm run harness` passed (548
  scenarios, 0 problems, phase-end simulated games). GitHub run 45614426230 on the branch: first
  attempt failed two jobs on time-outs (quests.spec.ts four-player test, 30 s at 2560x1440;
  playerIcon.spec.ts at 1920x1080), both passed on one rerun of the failed jobs; all 7 jobs
  green. Screenshots of that run copied into `harness/screens/` (120 folders, 10 new from 2a).
  `docs/enforcement.md` already lists the phase 30 checks.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter + builder 1a | Opus, medium | 18 | 139,741 | 78 | done |
| Builder 1b + 1c | Opus, medium | 29 | 146,871 | 87 | done |
| Builder 2a | Opus, medium | 34 | 239,058 | 150 | done |
| Builder 2b | Opus, medium | 16 | 95,954 | 33 | done |
| Builder 2c + 3 | Opus, medium | 14 | 97,838 | 49 | done |
| Builder 4a | Opus, medium | 17 | 115,742 | 54 | done |
| Builder 4b | Opus, medium | 8 | 99,297 | 29 | done |
| Finisher | Sonnet, medium | 78 | 83,835 | 39 | done |
