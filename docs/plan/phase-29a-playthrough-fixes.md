# Phase 29a: Playthrough fixes

Status: approved
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
  rules pass again; the 11 of "Waiting for the owner" as the owner decides.
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
(6 of them take the place of the skip-build scenarios above once the owner approves):

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
