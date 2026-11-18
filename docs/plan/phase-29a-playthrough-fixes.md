# Phase 29a: Playthrough fixes

Status: in progress
Milestone: 6 Learning

## Goal

Everything the owner's notes of 2026-11-17 ask for (Q169): build passes for every card with one
new pass each turn, 30-second market goes, a free redraw of the starting hand in a longer turn 1,
unused free time back into the bank, projects only from 10 income, a new total worth gained (F),
quests and influence actions in two rule files the owner edits, a clearer combos list, more about
every player in the stats and summary tables, player icons, and card-name combo hints on the big
card. Built before phase 30, so version 1 starts with these rules.

## Depends on

Phase 29.

## Covers

- Notes: `docs/feedback-notes/2026.11.17 - ready.txt`, all 18 findings (Q169).
- Rules: R2.4 (new), R4.6, R6.1, R6.2, R6.3 (new), R7.2, R7.3, R9.1, R9.2, R9.4, R9.13, R9.15
  (new), R10.1, R11.4 (new), R15.1, R15.2, R15.5 (new), R15.6 (new), R16.2, R17.12 (new),
  R18.11, R19.2, R19.4, R20.7, R20.8 (new), R20.9 (new); M3.3, M3.5, M3.7; A2.5 (new); T0.7
  (new), T0.8 (new), T1.3 and T5.4 texts.
- Rule files: `harness/spec/quests.txt` and `harness/spec/influence-actions.txt` (new), and
  their check in `npm run check` (`HARNESS.md`, "Checking the harness itself").
- Screens: S1.7 (new), S1.8 (new), S3.1, S3.2, S5.1, S5.5, S6.1, S6.2, S6.3, S6.6, S6.9 (new),
  S7.2, S8.2, S8.3, S13.4, S14.2, S16.3; the rulebook's goal, playing a card, time, start of
  every turn, influence, projects, drawing and quest list sections, as shown in the rules
  viewer.
- Invariants: I6 and I19 (changed), I28 and I29 (new). Budgets: B2 (a redraw is saved like an
  action).

## Start

The spec and harness changes for this phase are already written, in `HARNESS:` commits on the
branch `phase-29a-playthrough-fixes` (Q169). The starter checks out that branch instead of
creating it. On it, `npm run check` fails until the items below are built:

- `npm run harness:check` fails (465 problems): it still reads the quest names from the old
  tables of `game-rules.md` R20.7 and the influence trades from the old list in `HARNESS.md`,
  which are now in the two rule files (item 1); and the 6 skip-build scenarios that wait for the
  owner (see Waiting for the owner) use a field, a trade and reason codes that no longer exist.
- `tools/harness-runner/harness.test.ts` still expects 490 scenarios (there are now 513), and
  35 required scenarios now assert the new rules: 24 run in turn 2 instead of turn 1, because
  turn 1 has more time now; 7 that complete a project give the player 10 income; 4 count the
  new build pass of each turn.

The 23 new scenarios are not on the required list yet; the finisher adds them (see Required
scenarios). The 11 required scenarios of "Waiting for the owner" are left exactly as they were
until the owner answers.

## Builds

1. **The rule files and their check** (R15.5, R15.6, R20.7, R20.8, R20.9, T0.7, `HARNESS.md`):
   one reader in `src/shared/` turns `quests.txt` and `influence-actions.txt` into the quest
   list and the influence actions, at build time for the client and the Worker, so there is one
   copy only; the code copies of both lists go (for example `QUEST_TERMS_TIER_*`,
   `QUEST_NAMES_BY_TIER`, `TRADES`, `DRAW_ACTION_COSTS`). `npm run harness:check` reads both
   files, takes the quest and trade names from them, and fails with the file, line number and
   wrong word on every format error, an unknown sector, type or stat, a missing limit, a
   duplicate name, an empty or broken line, fewer than 4 tier 1 quests, a changed tutorial quest
   (T0.7), two draw actions for one tier, and "needs new code" naming an action of an unknown
   kind. Tests of the check cover each failure. Large; split it if it runs over three commits
   (for example the reader and the check first, then every user of the lists).
2. **Build passes** (R6.1, R6.2, R6.3, R4.6, R11.4, R10.1, R7.2, I6, S16.3): every player gets
   1 build pass at the start of every turn, turn 1 included; every card played uses one; passes
   carry over with no limit; skip build is gone everywhere (the influence action, the state's
   skipped-build flag, the view field, the reason codes `build_skipped` and
   `skip_build_after_play`, the log, the bots). The scenario runner's default seat has 1 build
   pass. Medium.
3. **Time** (R9.1, R9.2, R9.4, R9.13, R9.15, R18.11, I19): 30 seconds for every market go;
   turn 1 has a 5-minute limit and 165 seconds of free time; ending the turn adds the unused
   main-phase free time to the bank, never above 15 minutes, and never free time given again
   after a pause. Browser tests that wait for the old times follow. Small.
4. **Redrawing the starting hand** (R17.12, M3.3, M3.7, S6.6, S7.2, S16.3, T0.8, I29, B2): the
   `redraw_hand` message, up to 3 times in turn 1 before the player's first action, not a
   main-phase action, rejected as `redraw_too_late` or `no_redraw_left`; the log entry when the
   main phase ends; the **Redraw hand (N left)** button; not offered in the tutorial. The
   scenario runner reads `redraws_used` and the log item `redrew`. Medium.
5. **Projects need 10 income** (R16.2, S6.3, S8.2, S16.3, T5.4): the rule, the projects help
   text, the pop-up's need and the rejection text; the tutorial's T5.4 text. Small.
6. **Total worth gained** (R2.4, M3.5, I28): the state counts it as R2.4 says, the view carries
   it for every seat (others as at the start of their own main phase, R5.4); the runner reads
   `worth_gained`. Small.
7. **Player icons** (A2.5, S1.8, S5.1, S6.3): the server picks each account's icon colour from
   its id, out of 12 icon colours in the design tokens, and the view carries it per seat; the
   quests display and the projects display show icons instead of names, with the name as
   tooltip and accessible name; the orange "could complete now" mark becomes an orange border.
   Small.
8. **Combos list and Claim all** (S6.1, S6.6, S1.7, S8.1): one list with the colours, what stays,
   and the order of S6.1; the same order in the claim pop-up and in the detailed summary table;
   Claim all shows the number of claims it would make. Medium.
9. **Stats and summary tables** (S3.1, S3.2, S6.2, S1.7, S13.4): Q, T, C and F boxes in your
   stats; T, C and F boxes and the 5 most played types in the quick summary table; type counts
   sorted by count then name, bonus types first where S3.2 and S6.2 say, highlighted green; the
   names "quick summary table" and "detailed summary table" on screen and in tests. Medium.
10. **Quests completed last turn** (S5.5): each with its requirement and reward. Small.
11. **Card-name combos on the big card** (S6.9): the red name with "!", its tooltip with the
    combos and their total reward, and the red and orange combo highlights, for hand, marketplace
    and other players' city cards. Medium.
12. **Rulebook and tutorial texts** (S14.2, T1.3, T5.4, rulebook): the rules viewer fills
    `{influence-actions.txt}` and `{quests.txt}` in `rulebook.md` with tables made from the
    files; the changed rulebook sections and the tutorial's T1.3 text show. Small.
13. **Sorting everywhere** (S1.7, finding 15): every remaining list of types with counts, and
    every list of a player's combos or of one card's combos (big card, card set), follows S1.7.
    Small.

Every item that changes a message's shape raises `PROTOCOL_VERSION` (Q75); one raise for the
phase is enough, as the items ship together; the state's shape change raises
`SAVE_SCHEMA_VERSION` once (D1). A scenario that turns out to contradict the new spec is changed
in a `HARNESS:` commit and recorded in Q169; one that only disagrees with the code is not.

## Known gaps after this phase

- None beyond phase 29's. Uploading a picture as player icon is not part of it (finding 16).

## What you can see when it's done

All 18 findings of your notes of 2026-11-17, on the live site: you get a build pass every turn and
each card uses one, so saved passes let you play several cards in a turn, and skip build is gone;
every market go has 30 seconds; in turn 1 you can redraw your starting hand up to 3 times and
have 5 minutes; free time you don't use refills your bank; projects need 10 income; quests and
influence actions come from your two text files, and `npm run check` tells you exactly what is
wrong in them; the combos list is coloured and ordered by what your city needs; your stats and
the quick and detailed summary tables show Q, T, C and F and sorted, highlighted types; Claim
all shows how many claims it makes; the quests and projects displays show player icons; the
completed-last-turn table shows requirements and rewards; and the big card marks card-name
combos you can complete.

## Exit criteria

- Every scenario of this phase passes, and the 35 required scenarios that now assert the new
  rules pass again; the 11 the owner approved on 2026-11-18 under their new names.
- `npm run check` fails with a clear message on each kind of broken line in the two rule files
  (tested), and passes on the files as the owner leaves them.
- The leak test passes with redraws (the cards put back and drawn stay hidden).
- The budget checks pass, B2 with redraws included.
- Screenshots in `harness/screens/` of the combos list, your stats with Q, T, C and F, a quick
  and a detailed summary table, the quests panel with player icons, the projects display with
  an icon, the completed-last-turn table, the big card with a red name and its tooltip, the
  Redraw hand button, and the Use influence pop-up made from the file.

## Open points

- None.

## Waiting for the owner

- The 11 required scenario names of Q169 (5 renamed, 6 skip-build scenarios replaced): the owner
  approved all 11 on 2026-11-18 ("approve all 11"); they are changed in the scenario files and in
  `harness/required.yaml` together.
- **Your review of the quest list, before the release (finding 10).** When every item is built
  and the checks pass, and before the releaser merges and deploys, the phase stops and you go
  over `harness/spec/quests.txt` (and `influence-actions.txt` if you like) and edit it. Then the
  scenarios that check specific quests or actions are updated to your edits in `HARNESS:`
  commits recorded in Q169, `npm run check` must pass on your files, and the release goes on. If
  an edit removes or renames a quest that a required scenario name mentions (the
  "completing … gives its reward" scenarios of `quests.yaml`), that name change needs your
  approval too.

## Required scenarios

These 23 scenarios are added to `harness/required.yaml` in this phase, by file and name
(6 of them, in place of the skip-build scenarios, are on it since the owner's approval of
2026-11-18; the finisher adds the other 17):

- `setup`: every player starts turn 1 with 1 build pass; a new game starts every player with
  14 total worth gained
- `turns-and-time`: every player gets 1 build pass at the start of every turn; unused build
  passes carry over to later turns with no limit; the main-phase time limit in turn 1 is
  5 minutes; the first 165 seconds of the main phase in turn 1 do not use the time bank; unused
  free time is added to the time bank when the player ends their turn; unused free time of
  turn 1 is added to the time bank; the time bank never grows above 15 minutes; free time given
  again after a pause is not added to the time bank
- `playing-cards`: a player with saved build passes can play several cards in one turn; selling
  or playing a card does not change total worth gained
- `influence`: a bought build pass can be used straight away; funds received and cards drawn
  add to total worth gained
- `undo`: undo takes back a build pass bought with influence
- `projects`: rejects a project with less than 10 income
- `drawing`: a player can redraw their starting hand in turn 1; a player can redraw their
  starting hand at most 3 times; rejects a redraw after the player's first action; rejects a
  redraw after turn 1; another player's redraw is hidden until the main phase ends
- `visibility`: the log shows a redraw of the starting hand once the main phase ends
- `tutorial`: the tutorial does not offer a redraw of the starting hand

Invariants I28 and I29 are added to the required list.

These 35 required scenarios now assert the new rules (Q169) and must pass again:

- `turns-and-time`, now in turn 2: the time bank runs after the free time until the player ends
  their turn; with an empty bank a player only has the free time; a player out of time is not
  made done while another player still has time; a player out of time is made done once every
  other player is done; a player out of time is made done when the last player with time left
  runs out too; a main-phase action after the player's time ran out is accepted while another
  player is still playing; a message received just before the deadline is accepted; banks are
  shown rounded down to whole seconds; every player sees every other player's bank counting
  down during the main phase; three main-phase time-outs in a row count as leaving the game; a
  player whose time runs out is told how many time-outs in a row out of 3; in a casual game
  time-outs in a row do not count as leaving the game; in a casual game a player whose time runs
  out is told they can keep playing; a deadline while nobody is connected pauses the game
  instead; a paused game goes on when a player reconnects and the timed-out player gets free time
  again; after the extra free time the paused player times out as normal; when two players' time
  would run out together while nobody is connected both get their free time again; a paused
  player's bank used before the pause stays used
- `turns-and-time`: end-of-turn steps pay influence income and bonus and keep build passes (2
  passes after the new turn's pass)
- `client`, `connections-and-leaving`, `records-and-ratings`, `visibility`, now in turn 2:
  opening the menu during a game does not stop the clock; an away player keeps their seat and
  their time runs as normal; if every player leaves at the same moment the game is abandoned;
  timers keep running during a vote; an abandoned game leaves ratings unchanged; an opponent's
  out of time status is shown live
- `projects`, with 10 income: completing a project uses up 8 of the stat and gives income funds
  influence and a card; rejects a project without enough of the stat; rejects a project while
  another stat is negative; rejects completing the same project twice; everyone who completes a
  project in the first turn anyone does gets 2 extra funds at the end of the turn; a project
  completed in a later turn gives no first-completion funds
- `undo`: completing a project cannot be undone (10 income); undoing a bought build pass makes the
  next one cost the same again (2 passes)
- `influence`: a bought build pass costs 1 more fund each time (4 passes); 5 influence buys
  1 build pass once per game (2 passes)

## Progress

- [x] 0. Start (2026-11-18): the branch already held the spec and harness changes (Q169), and
  the owner approved the 11 required names the same day (`HARNESS:` cdeee649, `PLAN:` 028f4f73).
  The starter found no contradiction in the spec and no open decision (`decisions.md` has none
  open); the readings below are everyday choices, not questions.
  - **Counts now.** 507 scenarios (513 less the 6 deleted skip-build ones):
    `tools/harness-runner/harness.test.ts` still expects 490; item 1a sets it to 507 (and any
    item that adds a scenario raises it). `npm run harness:check` has 450 problems, all item 1's
    (quest names read from R20.7's old tables, trade names from the old list in `HARNESS.md`).
    Of the 23 new scenarios, 6 are already on `harness/required.yaml` (the approved
    replacements); the finisher adds the other 17 and I28, I29.
  - Until every item is built, `npm run check` fails on required scenarios of later items; a
    builder reports which still fail and why, and checks that its own item's scenarios pass
    (added to the required list locally, not committed) and fail without the change.
  - **One raise each for the phase**, by item 2 (the first shape change) and not again:
    `PROTOCOL_VERSION` 26 to 27 (`src/shared/PROTOCOL_VERSION.ts`, Q75) and
    `SAVE_SCHEMA_VERSION` 17 to 18 (`src/rules/SAVE_SCHEMA_VERSION.ts`, D1).
  - **Order.** 1a, 2, 1b (item 2 removes skip build before the trades come from the file, which
    has no skip-build line); then 3, 4, 6 (the clock, then the redraw, then worth gained, which a
    redraw must not change); 5, 7 and 10 any time; 8 and 9 before 11 and 13 (they reuse the
    sorting); 12 after 1b.

- [x] 1a. **The rule file reader and the harness check** (R15.5, R20.8, T0.7, `HARNESS.md`,
  "Checking the harness itself"). **Large.**
  - One reader in `src/shared/` (pure; text in, a `Result` out, with file, line number and wrong
    word for each problem) turns `harness/spec/quests.txt` and `influence-actions.txt` into the
    quest list and the influence actions. `tools/harness-check/` uses the same reader:
    `collectKnownNames.ts` (`collectQuestNames` reads R20.7 today; the trades come from
    `HARNESS.md`) takes the names from the files, and every error kind of item 1 in Builds is a
    problem, each tested in `tools/harness-check/`. Set the count in `harness.test.ts` to 507.
  - Names: an influence action's name with underscores for spaces is its message and scenario
    name (`influence to build pass` is `influence_to_build_pass`), so the existing trade names
    stay (Q169, 6). Quest parts use the old tables' words (`Service type`,
    `1 tier 3 Residential card`). A plain trade is `pay … | get …`; the keywords are
    `1 more each time` and `draw a tier N card of a chosen kind`; any other third part is
    "needs new code" with the action's name (Q169, 8).
  - Reuse: `src/shared/catalogue/` (`TYPE_NAMES`, `Sector`, `Kind`, `QuestNeed`, `QuestReward`,
    `QuestTerms`), the `Trade` shape of `src/shared/TRADES.ts`, the stat names of R2.1.
  - Done when `npm run harness:check` passes.
  - Done (2026-11-18). `npm run harness:check` passes (507 scenarios, 0 problems). Still failing
    required scenarios after 1a: 11 of item 2 (build passes) and the 2 market-go ones of item 3
    (30 seconds); nothing of 1a.
  - As built: the reader is `src/shared/ruleFiles/`: `readQuestFile` gives `QuestLine`s (`tier`,
    `name`, `terms` as `QuestTerms`), `readInfluenceActionFile` gives `InfluenceAction`s
    (`trade`: `costs`, `gains`, `buildPasses` as a count, `isPriceRising`, `limitPerGame`;
    `draw`: `costs`, `tier`, `limitPerGame`); names are plain strings, an action's name already
    with underscores. Both return a `Result` with every `RuleFileProblem` (`line`, `word`,
    `message`). Their tests compare the real files with `QUEST_TERMS`/`QUESTS` and
    `TRADES`/`DRAW_ACTION_COSTS`: equal today. The tier 1 count and T0.7 are checked in
    `tools/harness-check/checkRuleFiles.ts` and `checkTutorialQuests.ts` (names from
    `TUTORIAL_SETUP.quests`, Trading post compared with `TUTORIAL_TRADING_POST_LINE`).
  - Differs: `src/shared/` imports have no `.ts` extension, which plain Node cannot run, so
    `npm run harness:check` now bundles the check with Vite first, as the replay export does
    (`tools/harness-check/harnessCheckTool.ts` builds `checkHarnessEntry.ts`; about 2 seconds).
    Trade names come from the file, no longer from `HARNESS.md` (`KnownNames.trades`).
    Decided: a quest reward gaining more than 1 type fails with "needs new code" (Q170, R20.8).
  - For later items: 1b deletes the code copies, so it also rewrites the comparisons with them
    in `readQuestFile.test.ts`, `readInfluenceActionFile.test.ts` and
    `tools/harness-runner/catalogueMatchesSpec.test.ts` (its quest test). A draw action's costs
    may be any stats in the file, but the engine charges influence only (`DRAW_ACTION_COSTS`):
    1b either applies any cost or makes other costs "needs new code". Getting more than 1 build
    pass is a valid plain trade (R15.5), which `Trade.doesGiveBuildPass` cannot hold.

- [x] 1b. **Every user of the lists reads the files** (R15.6, R20.7, R20.9). **Large.**
  - The code copies go: `QUEST_TERMS*.ts`, `QUEST_NAMES_BY_TIER.ts` (and what is built on it:
    `QUESTS.ts`, `QuestName`, `QuestNameOfTier`), `TRADES.ts`, `DRAW_ACTION_COSTS.ts`. Users:
    `src/rules/` (`useDrawAction.ts`, `drawActionRejection.ts`, `progressViolations.ts`, the
    trade code), the client (`TradeIcons.tsx`, `tradeLabel.ts`, `tradeMissingAmounts.ts`,
    `tradeStatusText.ts`, `mainPhaseLogText.ts`, `DrawActionTable.tsx`,
    `statAndTypeWordsShownIn.ts`) and the bots.
  - Read when the app is built (Q169, 6). The client already imports `rulebook.md?raw` (Vite);
    the Worker is bundled by wrangler, whose esbuild must take the files as text too: check with
    `npx wrangler deploy --dry-run --outdir <scratchpad>` that the bundle holds the quest text.
    Once names come from a file, a literal union of names may no longer be possible
    (proposed rule "Ids from fixed lists"); the reader is then the validated boundary
    (`rules/typescript.md`, casts only at schema-validated boundaries).
  - A plain trade is applied and shown from its parsed parts, with no code per trade (R15.6,
    S8.3).
  - Done (2026-11-18). Still failing required scenarios: the 2 market-go ones of item 3.
  - As built: `src/shared/ruleFiles/QUEST_LINES.ts` and `INFLUENCE_ACTIONS.ts` import the files
    as `?raw` text (Vite for the client, tests and tools; wrangler's esbuild takes the same
    import, checked with `wrangler deploy --dry-run`: the bundle holds both texts) and throw on a
    broken file. `ruleFileText.d.ts` declares `*.txt?raw` for the engine and server configs
    (`export =`, since default exports fail lint). `INFLUENCE_TRADES`, `INFLUENCE_DRAWS`,
    `questOf`, `tradeOf`, `influenceDrawOfTier` look things up. `QuestName` and `TradeName` stay
    as the validated boundary (picklists of the files' names; their type is now `string`).
    `Trade` is the parsed trade (`buildPasses`, `isPriceRising`); `buy_build_pass` is no longer
    named in code: the rising price, `buildPassesBought` and `buildPassPrice`
    (`src/rules/buildPassPriceOf.ts`) follow `isPriceRising`. A draw action pays every cost on
    its line, and a tier without a line has no draw actions (Q171).
  - Differs: the reader tests compare the real files' names line by line, no longer with code
    copies; `QUESTS.test.ts` went with `QUESTS`.
  - For later items: 12 builds its tables from `QUEST_LINES` and `INFLUENCE_ACTIONS`.
  - Fixed afterwards (2026-11-18, the browser tests' loading of item 3): `e2e/startTestRoom.ts`
    builds the test room's state from a Vite bundle of `e2e/testRoomRequestOf.ts`
    (`tools/bundleForNode.ts`, once per Playwright worker), so the browser tests load again
    (`BUG FIX:` a0e8263b). Run locally: `clocks`, `combosAndProjects`, `influenceAndUndo` and
    `quests` pass. That run found two more: `combosAndProjects` expected turn 2's funds of the
    old income (now 22, 8335960d), and 1b's draw actions were refused to a player below zero in
    a stat they do not cost (`drawActionRejection.ts`, 8cc356b3, unit test
    `drawActionCosts.test.ts`). The other browser specs were not run locally.

- [x] 2. **Build passes** (R6.1, R6.2, R6.3, R4.6, R11.4, R10.1, R7.2, I6, S16.3). **Large.**
  - Scenarios: `setup` "every player starts turn 1 with 1 build pass"; `turns-and-time` "every
    player gets 1 build pass at the start of every turn", "unused build passes carry over …",
    "end-of-turn steps … keep build passes"; `playing-cards` "rejects a card when the player has
    no build pass left", "playing a card uses up 1 build pass", "a player with saved build
    passes can play several cards in one turn"; `influence` "a bought build pass can be used
    straight away", "a bought build pass costs 1 more fund each time", "5 influence buys 1 build
    pass once per game"; `undo` "undo takes back a build pass bought with influence", "undoing a
    bought build pass makes the next one cost the same again".
  - Skip build goes: `hasSkippedBuild` (`SeatState.ts`, `newSeat.ts`, `endOfTurnSteps.ts`,
    `rejectionOf.ts`, `invariantViolations.ts`), the `skip_build` trade (`TRADES.ts`,
    `tradeRejection.ts`, the client trade files, `REJECTION_MESSAGES.ts`,
    `src/bots/chaosBot.ts`), the reason codes `build_skipped` and `skip_build_after_play`
    (`src/shared/ReasonCode.ts`), the view field and the log text. `hasPlayedThisTurn` stays
    (R10.1 still resets it; End turn's highlight in S6 uses it). The turn's pass is the first
    start-of-turn step, before the marketplace (Q169, 9); turn 1's comes after setup (R4.6,
    `setUpGame.ts`). The scenario runner's default seat has 1 build pass (`HARNESS.md`, seats
    row). Raises both versions (see 0).
  - Done (2026-11-18). The 11 build-pass scenarios pass; still failing required scenarios: the
    2 market-go ones of item 3 (30 seconds). `PROTOCOL_VERSION` is 27 and `SAVE_SCHEMA_VERSION`
    18 now; later items do not raise them again.
  - As built: `src/rules/withTurnBuildPass.ts` gives a seat still in the game its pass; used by
    `setUpGame.ts` (after setup), `endMainPhase.ts` (first start-of-turn step) and the scenario
    runner's default seat (`seatFromGiven.ts`, so `startTestRoom` in `e2e/` starts with 1 pass
    too). `newSeat` still has 0 passes. Every card uses a pass (`playCard.ts`, `rejectionOf.ts`,
    I6). The `no_build_pass` text follows S16.3. The Use influence pop-up has 19 trades
    (`influenceAndUndo.test.tsx`); `e2e/influenceAndUndo.spec.ts` now expects 2 passes after
    buying one (not run locally; the branch check runs it).
  - For later items: `Trade.doesGiveBuildPass` is unchanged (1b replaces `TRADES`).

- [x] 3. **Time** (R9.1, R9.2, R9.4, R9.13, R9.15, R18.11, I19). **Small.**
  - `src/rules/TIME_RULES.ts`: `goLimitMs` 30 000; turn 1's main free time 165 s and limit 300 s
    (210 + 90, R9.1), used by `mainPhaseLimitMs.ts`, `decisionOf.ts` and the free time again
    after a pause (`ClockGrace.ts`: that turn's free time, R9.13). R9.15: End turn adds the
    unused main free time to the bank, at most up to 15 minutes; never the pause's free time or
    a market go's. I19 in `invariantViolations.ts` allows that growth.
  - Scenarios: `turns-and-time` "the first player's market go has 30 seconds", "every later
    market go also has 30 seconds", "from turn 2 the first 75 seconds …", "the main-phase time
    limit in turn 1 is 5 minutes", "the first 165 seconds …", the 4 new ones on unused free time
    and the 15-minute cap; and the 24 moved to turn 2. Browser tests that wait for 40-second
    goes or the old turn-1 times follow (`e2e/`, for example `clocks.spec.ts`).
  - Done (2026-11-18). Every item 3 scenario passes and `npm run check` is green (no required
    scenario fails any more).
  - As built: `TIME_RULES` gains `mainFreeFirstTurnMs` and `mainLimitFirstTurnExtraSeconds`
    (`mainLimitFirstTurnSeconds` is now `mainLimitBaseSeconds`); `mainPhaseFreeMs.ts` gives a
    turn's free time; `bankAfterEndingTurn.ts` adds the unused free time on End turn, capped at
    `TIME_BANK_MS`, and nothing while the seat has free time again after a pause (`grace`). I19
    allows growth on the player's own `end_turn` up to that turn's free time (the transition
    carries no time), unless the seat had free time again.
  - Differs: one more required scenario waited 75 seconds in turn 1 (`combos-and-income`, "a
    player made done when time runs out also gets their ready combos claimed"); it now waits
    165 seconds (`HARNESS:` commit, recorded in Q169). `e2e/clocks.spec.ts` and the abandoned
    test of `e2e/leaving.spec.ts` run in turn 2 (75 seconds of free time), not turn 1.
  - For later items: the browser tests could not be run locally: since 1b every spec that
    imports `e2e/startTestRoom.ts` fails to load, because it imports the scenario runner's
    `stateFromGiven`, which reaches `src/shared/ruleFiles/` and its `?raw` imports, which
    Playwright's loader parses as JavaScript ("quests.txt: Missing semicolon"). This is 1b's,
    and the branch check will fail on it until it is fixed (for example by bundling
    `stateFromGiven` with `tools/bundleForNode.ts`, as `npm run test-room` does).

- [x] 4. **Redrawing the starting hand** (R17.12, M3.3, M3.7, S6.6, S7.2, S16.3, T0.8, I29, B2).
  **Large.**
  - The `redraw_hand` message in the intent schema (`src/shared/`) carries the action id and
    state version like any action (M9.4) and moves only the redrawer's own version. Only an
    accepted main-phase action (End turn included) ends the window; a rejected one does not.
    New reason codes `redraw_too_late` and `no_redraw_left`; the tutorial room rejects it as
    `not_this_step` (T0.8). Deal as R17.9 does (reuse the setup's dealing); one saved row (B2).
  - Log item `redrew` with the count when the main phase ends (reuse the main-phase log
    reveal); the leak test must pass (the cards put back and drawn stay hidden). The runner reads
    `redraws_used` and the log item `redrew`. Client: the **Redraw hand (N left)** button
    (S6.6), from data in the view.
  - Scenarios: `drawing`, the 5 redraw ones; `visibility` "the log shows a redraw …";
    `tutorial` "the tutorial does not offer a redraw …".
  - Done (2026-11-18). 6 of the 7 scenarios pass (checked on the required list locally, not
    committed); "a player can redraw their starting hand in turn 1" also expects
    `worth_gained: 14`, which the runner reads only after item 6; without that line it passes.
    `npm run check` is green.
  - As built: `SeatState.redrawsUsed`; `redrawRejection.ts` (`redraw_too_late` outside turn 1
    or once `actionsThisTurn` > 0, which every accepted main-phase action raises, undo and End
    turn included, then `no_redraw_left` at `REDRAW_LIMIT` 3); `redrawStartingHand.ts` shuffles
    the hand into the deck and deals with `dealStartingHand` (R17.9), and moves the redrawer's
    own `mainPhaseStart.piles` counts by the cards put back and drawn, so their draw actions see
    the deck as it is while others see nothing (unit tests in `redrawStartingHand.test.ts`).
    No undo point, not counted toward the action limit; the log entry `redrew` (`times`) is
    replaced on each redraw. View: `redrawsLeft`, `redrawRejection` (the tutorial view sets
    `not_this_step`, T0.8). Client: `RedrawHandButton.tsx` shows only while
    `redrawRejection` is null. I29 in `redrawViolations.ts`, simulated. Bots redraw now and then
    (`influenceOrUndoMove.ts`). `apply.ts` groups the actions that take income, to stay under
    the complexity limit.
  - Differs: the log reads "Ann redrew their starting hand 2 times" (Q172, S7.2 changed first).
    Browser tests were not run for this item; in turn 1 test rooms the button now shows in the
    Actions panel, which the branch check's screen-fit tests will judge.
  - For later items: 6 adds `worth_gained` and must leave it unchanged by a redraw.

- [x] 5. **Projects need 10 income** (R16.2, S6.3, S8.2, S16.3, T5.4). **Small.**
  - `src/rules/projectRejection.ts`, reason `project_needs_not_met`, whose text names the income
    (no new code, Q169, 4); `REJECTION_MESSAGES.ts`, the projects help text and pop-up, the
    tutorial's T5.4 text. Scenarios: `projects` "rejects a project with less than 10 income" and
    the 7 with 10 income. The bots must not try a project below 10 income (`bots.test.ts`).
  - Done (2026-11-18). All 8 project scenarios pass; `npm run check` is green.
  - As built: `src/shared/PROJECT_INCOME_NEED.ts` (10), used by `projectRejection.ts` and the
    Projects pop-up, whose need line reads "Needs [stat 8] and at least [income 10] · you have
    [stat] and [income]" (S8.2 "what you have" taken as both). The `project_needs_not_met`
    text, the projects help (S6.3) and the tutorial's T5.4 text follow the spec. The bots
    already choose projects from the view's `projectRejections`, so they needed no change.
  - Differs: `e2e/combosAndProjects.spec.ts` gives the player 10 income (not run locally: see
    item 3, the browser tests do not load since 1b).

- [x] 6. **Total worth gained** (R2.4, M3.5, I28). **Small.**
  - A seat count, 14 at setup, raised where funds are received (not selling) and cards gained;
    undo takes back what its action added; a redraw changes nothing. In the view for every seat,
    others' as at the start of their own main phase (R5.4; reuse how their other stats are held
    back). The runner reads `worth_gained`. Scenarios: `setup` "a new game starts every player
    with 14 total worth gained", `playing-cards` "selling or playing a card does not change
    total worth gained", `influence` "funds received and cards drawn add to total worth gained".
    The F boxes on screen are item 9's.
  - Done (2026-11-18). The 4 worth scenarios (with the turn-1 redraw one) and I28 pass (checked
    on the required list locally, not committed); `npm run check` is green.
  - As built: `SeatState.worthGained`, from `STARTING_WORTH_GAINED` (14) in `newSeat`; raised in
    `cardsIntoHand` (every draw), `takeTurnDraw` (a marketplace card), `endOfTurnSteps` (income
    and bonus funds), `endMainPhase` and `endGame` (first-completion funds), `completeProject`,
    `completeQuest` and `useTrade` (the funds a trade gives). Dealing (setup, redraw) and selling
    do not touch it; undo restores it with the seat. View: `worthGained` on own and other seats
    (others' through `seatShownTo`, R5.4), in `SEAT_COMMON` of the view schema. I28 in
    `worthGainedViolations.ts` (down only on the seat's own undo), simulated. Unit tests in
    `worthGained.test.ts` (income at the next turn; another player's held-back value).
  - For later items: 9 shows `worthGained` in the F boxes.

- [x] 7. **Player icons** (A2.5, S1.8, S5.1, S6.3). **Small.**
  - Usernames reach the client in the room's view (`playerNames` in
    `src/shared/protocol/RoomView.ts`, built in `src/server/room/updateFor.ts`), not in the
    engine's state, so the icon colour goes beside them, per seat, as an index 0 to 11 that
    `src/server/` picks from the account id; the client maps it to 12 icon colour tokens added
    to `src/client/tokens.css`. The engine stays player-type agnostic. The quests and projects
    displays show icons with the name as tooltip and accessible name; "could complete now"
    becomes an orange border.
  - Done (2026-11-18). Unit tests in `quests.test.tsx`, `projectsAreaAndHelp.test.tsx` and
    `src/server/room/playerIconColorOf.test.ts`; `e2e/quests.spec.ts` passes locally;
    `npm run check` is green.
  - As built: `src/server/room/playerIconColorOf.ts` hashes the account id to 0 to 11
    (`PLAYER_ICON_COLOR_COUNT`); `RoomView.playerIconColors` (beside `playerNames`, per seat) and,
    for the tutorial room, `playerIconColor` on the `tutorial_update` message (kept in the store
    as `tutorialPlayerIconColor`). Tokens `--color-player-icon-0` to `-11` in `tokens.css` (white
    text at 5.3:1 or more). `src/client/components/PlayerIcon.tsx`: the first character in upper
    case (`playerIconLetterOf`, grapheme-safe), tooltip and accessible name, orange border when
    marked. The colours reach the quests and projects displays through a context
    (`PlayerIconColors`, provided in `GameBoard` and `TutorialPage`), not through props.
  - Differs: the icon is a `button` that does nothing on click, since lint allows keyboard focus
    (S1.8's tooltip on focus) only on interactive elements. Your own icon in a quest line shows
    your username's letter and is named "You", as the rest of the screen names you. The old
    "could complete it now" text stays as hidden text for screen readers.
  - For later items: 10 keeps usernames (Q169, 16); any later display of icons reuses
    `PlayerIcon` and `PlayerIconColors`.

- [x] 8. **Combos list and Claim all** (S6.1, S6.6, S1.7, S8.1). **Large.**
  - One coloured list in the order of S6.1 (group counts include ready combos; the stat order of
    R2.1; fewer cards needed is the smaller type count, Q169, 2); the same order in the claim
    pop-up and in the detailed summary table; **Claim all (N)**, N being 1 per ready one-time
    combo plus each time an infinite combo is ready (Q169, 11), from the view. The S6.1 order is
    one pure client function that items 11 and 13 reuse.
  - Done (2026-11-18). Unit tests in `src/client/screens/game/combosList.test.tsx` (order, what
    stays, Claim all (5), the pop-up's order, the detailed summary table's list); `npm run check`
    is green.
  - As built: `src/client/sorting/`: `combosInListOrder(entries, isReady)` (S6.1, for any entries
    with `card` and `combo`), `compareCombosOfOneCard(combo, other)` (S1.7's order for the
    combos printed on one card: type combos first, infinite first, fewer needed, bigger reward,
    R2.1 stat order, then card-name combos by card name) and `compareAlphabetically`.
    `combosListOf` drops claimed one-time combos and sorts; the combos panel colours each combo
    (tokens `--color-combo-*`), the Claim all pop-up keeps the list's order, and
    `claimAllCountOf` sums `readyTimes`. The panel title still counts ready combos.
  - Differs: the detailed summary table had no list of claimed combos (S3.2), only the C box; it
    now has one under the T and C boxes (`ClaimedCombosList.tsx`, "Combos claimed by Di",
    ×times when claimed more than once), sorted with `combosInListOrder`.
  - For later items: 11 and 13 sort one card's combos with `compareCombosOfOneCard`; 9 sorts
    type names with `compareAlphabetically` (its type sorter can go in `src/client/sorting/`).
    `e2e/combosAndProjects.spec.ts` (Claim all (1), the combos-list screenshot) still matches.

- [x] 9. **Stats and summary tables** (S3.1, S3.2, S6.2, S1.7, S13.4). **Large.**
  - Q, T, C and F boxes in your stats (T counts the city's card types, a doubled type twice,
    Q169, 3); T, C, F and the 5 most played types in the quick summary table (count order only,
    Q169, 5); type counts by count, then name, with bonus types first and highlighted green. One
    pure S1.7 type sorter, which 13 reuses. The names "quick summary table" and "detailed
    summary table" on screen and in tests. Reuse `OpponentStatsBox.tsx` and `StatChip.tsx`.
  - Done (2026-11-18). Unit tests in `src/client/screens/game/statsAndSummaryTables.test.tsx`
    (your Q, T, C and F boxes and sorted, highlighted type counts; the quick table's T, C, F and
    5 most played types; the detailed table's type counts) and a view assertion in
    `hiddenDuringMainPhase.test.ts`; `npm run check` is green.
  - As built: `src/client/sorting/typesInListOrder(typeCounts, firstTypes)` (S1.7: count, most
    first, then name, inside the `firstTypes` part and the rest; `[]` for one part).
    `TypeCountsList` takes the ordered types and marks bonus types (`bonusType` class, tokens
    `--color-board-bonus-type` and `-border`). `CountBox` has F (token
    `--color-board-worth-count`, a light red readable on the dark box). `OwnCountBoxes` in your
    stats; `cityTypeCountsOf` counts the city's types for the quick table's top 5. Names: the
    quick table is the article "Quick summary table of Di", its button "Detailed summary table ›"
    (accessible name "Detailed summary table of Di"), the dialog "Detailed summary table of Di";
    unit and browser tests use them. The screenshot name `opponent-board` is unchanged.
  - Differs: the own seat's view had no completed quests, so `questsCompleted` moved into the
    common part of the seat view (own seats too, within the phase's one protocol raise). The
    detailed summary table had no type counts (S3.2); it now shows them, bonus types first.
  - For later items: 13 sorts type lists with `typesInListOrder` and shows them with
    `TypeCountsList`.

- [x] 10. **Quests completed last turn** (S5.5). **Small.**
  - Each quest with its requirement and reward as icons (S1.6), reusing how the quests table
    shows them; usernames stay in this table (Q169, 16).
  - Done (2026-11-19). Unit test in `quests.test.tsx` (columns, each quest's requirement and
    reward parts); `e2e/quests.spec.ts` passes locally; `npm run check` is green.
  - As built: the table has Quest, Tier, Requirement, Reward and Completed by columns; the
    requirement parts come from `QuestNeedParts.tsx` (taken out of `QuestNeedsLine`), the reward
    from `QuestRewardParts`. The table column is at most half the quests panel
    (`fit-content(50%)`), so the quest cards stay readable at 1280x720 and the cells wrap.

- [ ] 11. **Card-name combos on the big card** (S6.9). **Large.**
  - `src/client/components/BigCard*`: the red name with "!" (both directions, Q169, 18), its
    tooltip with those combos and the total stats as icons, the red and orange highlights, for
    hand, marketplace and other players' city cards. A pure lookup from the view and the card
    data; no new view field.

- [x] 12. **Rulebook and tutorial texts** (S14.2, T1.3, T5.4, rulebook). **Small.**
  - `src/client/screens/rules/PARSED_RULEBOOK.ts` fills `{influence-actions.txt}` (rulebook.md
    line 271) and `{quests.txt}` (line 380) with tables made by 1a's reader; the tutorial's T1.3
    text. Needs 1b.
  - Done (2026-11-19). Unit tests in `src/client/screens/rules/ruleFileTables.test.tsx` (the
    influence table, the 3 quest tables, no placeholder left) and `tutorialTextBox.test.tsx`
    (T1.3); `rulesAndCardSet` and `tutorial` browser specs pass locally at 1920 and 2560;
    `npm run check` is green.
  - As built: `rulebookWithRuleFileTables` replaces each placeholder line with Markdown tables
    before `parseRulebook`, so stats and types become icons as in the rest of the rulebook
    (`influenceActionsTableText`: Action, Times per game, reusing `tradeLabel` and
    `amountsText`; `questTablesText`: a bold Tier N line and a Quest, Needs, Reward table per
    tier, reusing `questNeedLabel`). T5.4 already matched the spec (item 5).
  - For later items: `e2e/tutorial.spec.ts` at 1280x720 fails locally at step 3 (the
    highlighted Hiking Trail is 90% in view, line 48), at this item's start commit too, so it
    comes from an earlier item (the taller stats panel of 9 most likely); GitHub's run decides.

- [ ] 13. **Sorting everywhere** (S1.7, finding 15). **Small.**
  - Every remaining list of types with counts, and every list of a player's or one card's combos
    (big card, card set: type combos first, then card-name combos by card name, Q169, 15), uses
    the sorters of 8 and 9.

- [ ] Finish. The finisher adds the 17 remaining new scenarios and I28 and I29 to
  `harness/required.yaml`. Then the owner's quest review (Waiting for the owner, finding 10)
  comes before the releaser.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Planner (stopped by the owner) | Opus, medium | 1 | 107k | 19 | stopped |
| Planner | Opus, medium | 22 | 326k | 124 | blocked (11 names, approved) |
| Renames and starter | Opus, medium | 6 | 125k | 39 | done |
| Builder, item 1a | Opus, medium | 15 | 166k | 66 | done |
| Builder, item 2 | Opus, medium | 22 | 127k | 57 | done |
| Builder, item 1b | Opus, medium | 12 | 173k | 59 | done |
| Builder, items 3 and 5 | Opus, medium | 24 | 150k | 89 | done |
| Builder, e2e loading fix and item 4 (resumed after a usage limit) | Opus, medium | 41 | 228k | 152 | done |
| Builder, items 6 and 7 | Opus, medium | 32 | 207k | 112 | done |
| Builder, item 8 | Opus, medium | 11 | 133k | 54 | done |
| Builder, item 9 | Opus, medium | 12 | 146k | 66 | done |
| Builder, items 10 and 12 | Opus, medium | 20 | 132k | 66 | done |
