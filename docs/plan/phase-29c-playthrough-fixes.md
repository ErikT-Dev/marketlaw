# Phase 29c: Playthrough fixes

Status: in progress
Milestone: 6 Learning

## Goal

Everything the owner's notes of 2026-11-24 ask for (Q188): funds, income, total worth gained (F)
and every amount of funds multiplied by 10, so that no number on screen has a decimal place,
with a score that does not change; the first completers of a quest get 2 funds for every tier
of the quest instead of 1 influence; the chosen player icon instead of the letter in the user
box; sharper card tile pictures, on every small card tile (the card set too) and over the
card texture of the big card; white text on the action and lobby buttons; player icons of one
size in the quests; the left panel titled **Players**, with your name and icon over your counts
and icons beside the other players' names; and lighter panel backgrounds. Built before
phase 30, so version 1 starts with these rules.

## Depends on

Phase 29b.

## Covers

- Notes: `docs/feedback-notes/2026.11.24 - ready.txt`, points 1 to 10 (Q188).
- Rules: R1.3, R2.1, R2.4, R2.5 (rewritten: whole funds), R3.2, R3.8, R5.1, R11.5, R13.1,
  R14.1, R14.2, R15.5, R16.2, R16.3, R19.10, R19.11, R20.8, R20.9, R21.4, R21.5, and the
  numbers of the game-rules open question 1; A2.5 (the user box shows your icon); T0.1, T0.7,
  T1 to T5 (every amount of funds and income, and T5.3's first-completion text).
- Rule files: `harness/spec/cards.json` (every `cost` × 10), `quests.txt` (every `income N`
  requirement and `+N fund(s)` and `+N income` reward × 10), `influence-actions.txt` (every
  amount of funds × 10, the rising build pass `10 more each time`), and their checks (R15.5,
  R20.8: numbers up to 999 in `quests.txt`; R20.9: at most income 50).
- Screens: S1.8 (every player icon of a screen part the same size, marked or not), S1.9
  (rewritten: whole numbers), S1.10 (white text on action and lobby buttons), S1.12 (new: panel
  backgrounds), S2.3 and S10.1 (the user box with your icon), S3 (titled Players), S3.1 (icons
  beside names), S3.3 (your name and icon over your counts), S5.1, S5.5, S6.3 (help text), S6.4
  (card tiles: sharper pictures, the card texture), S6.5 ("Sell for 10 funds?"), S6.6, S8.2,
  S8.3, S14.3 (card set tiles with pictures), S15.2 (tutorial texts); the rulebook's stats,
  real cost, selling, end of the turn, Support, projects, quests, influence and end of the game
  sections.
- Invariants: I8, I16, I28 and I30 (their statements follow the new amounts; names unchanged).
  Budgets: B19 (limit 16 KB, point 2).

## Start

The starter creates the branch `phase-29c-playthrough-fixes` from master and, before the
Progress checklist, writes the spec changes of Q188 into `harness/spec/` (game rules, screens,
accounts, tutorial, glossary, rulebook) in `HARNESS:` commits, the spec first (D19). The rule
files, scenarios, invariants and the budget follow in item 1. From the first spec commit on,
`npm run check` fails until the items below are built. The owner approved the 18 required
names of "Answered by the owner" on 2026-11-24 (Q188).

## Builds

1. **The harness in the new amounts** (Q188, points 4 and 5): `cards.json` costs × 10;
   `quests.txt` and `influence-actions.txt` amounts × 10 and their checks (R15.5's fixed words
   `10 more each time`, R20.8's numbers up to 999, R20.9's income 50); the scenario format reads
   funds as whole numbers (`HARNESS.md`, `scenario-format.yaml`); every scenario's funds,
   income, F, costs, prices, sale values, Support and score follow the new amounts, names kept
   except the 18 of "Answered by the owner"; the first-completion scenarios expect 2 funds per
   tier and no influence; I8, I16, I28, I30 and B19 follow; the new scenarios of "Required
   scenarios". `HARNESS:` commits only, recorded in Q188. Large; split it by scenario file if it
   runs over three commits.
2. **Funds × 10 in the engine** (R2.1, R2.4, R2.5, R3.8, R5.1, R11.5, R13.1, R14, R16, R19.11,
   R21.4, R21.5, point 5): the fund unit becomes the old tenth, so `TENTHS_PER_FUND`,
   `fundsInTenths` and the runner's `FUNDS_IN_TENTHS` go and the rule files' amounts are used as
   written; income is kept ×10 (starts at 30, +10 per product and distribution, +10 per
   project, the end goal 200, projects need 100, the quest gate N − 20 and 80); F counts 10 per
   card gained and starts at 140; Support gives 10 funds for every full 100 behind; the score
   uses 0.65 × income and 0.02 × funds with 0.2 × cards in hand; bots and the simulator follow.
   Raises `PROTOCOL_VERSION` and `SAVE_SCHEMA_VERSION` once for the phase. Large; split it if
   it runs over three commits (for example the engine and runner first, then bots, simulator
   and records).
3. **First completion gives funds** (R19.10, S5.5, point 4): every first completer of a quest
   gets 2 funds per tier of the quest (2, 4 or 6) instead of +1 influence, counted in F and
   taken back by undo; the Last turn panel, the log and the quest's help text say so. Small.
4. **Whole numbers on screen** (S1.9, S6.3, S6.5, S8.2, S8.3, S9.5, S13.2, S15.2, rulebook,
   point 5): every screen shows funds, income and F without a decimal; the help texts, the
   Sell question, the tutorial texts and the rulebook show the new amounts; the client's tenths
   helpers go. Medium.
5. **Your icon in the user box** (S2.3, S10.1, A2.5, point 1): the user box shows your player
   icon (S1.8) instead of the first letter of your name, on every screen that has it; the lobby
   gets your icon from your account. Small.
6. **Card tiles** (S6.4, S14.3, S3.2, B19, points 2, 3 and 6): card tile pictures at 200 × 172
   (twice the pixels of Q183), each at most 16 KB; every small card tile (hand, city,
   marketplace, another player's city in their detailed summary table, the card set) shows its
   picture; every tile shows the big card's texture (`card-texture.webp`, made from
   `dana-devolk-E0BdstzaO8E-unsplash.jpg`, already in the repository) under its 80% sector
   colour. Medium.
7. **Buttons and panels** (S1.10, S1.12, S6.6, S10, points 7 and 10): white text on every
   action button (S6.6) and every lobby button (S10, the waiting room's top bar included), with
   backgrounds dark enough for 4.5:1 in every state (normal, highlighted); panel backgrounds at
   75% instead of 92%. Small.
8. **Player icons of one size** (S1.8, S5.1, point 8): every icon in a quest's lines has the
   same outer size and picture size; the orange mark of a player who can complete it is drawn
   outside the circle and shrinks nothing, with a browser test that compares their sizes.
   Small.
9. **The Players panel** (S3, S3.1, S3.3, point 9): the left panel is titled **Players** (its
   region name too; the tests follow); your counts table shows your username and your icon;
   each quick summary table shows the player's icon left of their username. Small.

Every item that changes a message's shape raises `PROTOCOL_VERSION` (Q75); one raise for the
phase is enough, as the items ship together; the state's change of units raises
`SAVE_SCHEMA_VERSION` once (D1). A scenario that turns out to contradict the new spec is changed
in a `HARNESS:` commit and recorded in Q188; one that only disagrees with the code is not.

## Known gaps after this phase

- Game records saved before this phase keep the amounts they were saved with (income and funds
  in the old units); they are not converted (D1: stored data may be wiped before version 1).
- The players online list (S10.2) shows names without icons, as before (Q188, point 1).

## What you can see when it's done

All points of your notes of 2026-11-24, on the live site: funds, income and F are whole numbers,
ten times the old ones (you start with 70 funds and 30 income, a card costs 40 instead of 4, the
end goal is income 200), and a game scores the same as before; the first to complete a quest
get 2, 4 or 6 funds by its tier instead of an influence; your animal icon sits in the user box;
every small card, the card set included, shows a sharper picture on the big card's texture; the
action and lobby buttons have white text; the icons in the quests are all one size; the left
panel is titled Players, with your name and icon over your counts and icons beside the other
players' names; and the panels let more of the background show.

## Exit criteria

- Every scenario of this phase passes, and the required scenarios that now assert the new
  amounts pass again; the 18 of "Answered by the owner" under their approved names.
- `npm run check` fails with a clear message when `influence-actions.txt` uses the old fixed
  words `1 more each time`, or `quests.txt` a number over 999 (tested), and passes on the files
  as the owner leaves them.
- Invariants I8, I16, I28 and I30 hold in every simulated game with the new amounts.
- The budget checks pass, B19 at 16 KB.
- Screenshots in `harness/screens/` of the game screen with whole numbers, the Players panel
  with icons and your name, the quests with icons of one size, the hand, city and marketplace
  tiles on the texture, the card set with pictures, the lobby with white button text and your
  icon in the user box.

## Open points

- None.

## Waiting for the owner

- Nothing.

## Answered by the owner

- **18 required names approved (2026-11-24, Q188).** Points 4 and 5 make these names on
  `harness/required.yaml` untrue; the owner approved every rename below (the scenario is
  changed to the new rule under the new name). Item 1b makes them:
  - `playing-cards`: "real cost adds 1 for each card of the same sector and tier already in the
    city" → "real cost adds 10 for each card of the same sector and tier already in the city"
  - `projects`: "rejects a project with less than 10 income" → "rejects a project with less
    than 100 income"
  - `setup`: "a new game starts every player with 14 total worth gained" → "a new game starts
    every player with 140 total worth gained"
  - `turns-and-time`: "the stats gain is added to funds in tenths of a fund" → "the stats gain
    adds 1 fund for every point"
  - `turns-and-time`: "Support gives 1 fund for every full 10 total worth gained behind the
    highest other player" → "Support gives 10 funds for every full 100 total worth gained behind
    the highest other player"
  - `turns-and-time`: "a player less than 10 total worth gained behind gets no Support" → "a
    player less than 100 total worth gained behind gets no Support"
  - `influence`: "4 influence buys 2 funds once per game" → "4 influence buys 20 funds once per
    game"
  - `influence`: "1 fund buys 1 influence any number of times" → "10 funds buy 1 influence any
    number of times"
  - `influence`: "a bought build pass costs 1 more fund each time" → "a bought build pass costs
    10 more funds each time"
  - `influence`: "3 influence buy 1 fund as often as the player likes" → "3 influence buy
    10 funds as often as the player likes"
  - `undo`: "undo takes back the extra influence of completing a quest first" → "undo takes back
    the extra funds of completing a quest first"
  - `quests`: "everyone who completes a quest in the first turn anyone does gets 1 more
    influence" → "everyone who completes a quest in the first turn anyone does gets 2 funds for
    every tier of the quest"
  - `quests`: "completing a quest during its extra turn gives no extra influence" → "completing
    a quest during its extra turn gives no extra funds"
  - `quests`: "a quest needing income is placed only once some player has that income minus 2"
    → "a quest needing income is placed only once some player has that income minus 20"
  - `quests`: "a quest needing income is placed once some player has that income minus 2" → "a
    quest needing income is placed once some player has that income minus 20"
  - `quests`: "a quest needing completed projects is placed only once some player has 8 income"
    → "a quest needing completed projects is placed only once some player has 80 income"
  - `end-of-game`: "the end goal needs income 20 and all 3 projects" → "the end goal needs
    income 200 and all 3 projects"
  - `end-of-game`: "the score counts whole funds only" → "the score counts 0.02 points for every
    fund"

  One `HARNESS:` commit makes these changes in the scenario files and in
  `harness/required.yaml` together (item 1b).

## Required scenarios

These new scenarios are added to `harness/required.yaml` in this phase, by file and name (the
finisher adds them; the 18 renames stay on it under their new names once approved):

- `quests`: a tier 3 quest's first completion gives 6 extra funds; the extra funds of a first
  completion add to total worth gained
- `end-of-game`: the score counts 0.65 points for every income

These required scenarios keep their names and now assert the new amounts (Q188) and must pass
again: every scenario whose given or expected state names funds, income, F, a real cost, a
price, a sale, Support or a score (setup's starting stats and income's +10 among them; in
`setup`, `playing-cards`, `combos-and-income`,
`turns-and-time`, `projects`, `influence`, `undo`, `quests`, `end-of-game`,
`records-and-ratings`, `visibility`, `hostile-client` and `tutorial`), and the quest reward
scenarios, which expect the first completers' funds instead of influence.

## Progress

- [x] 0. Start (2026-11-24). The spec of Q188 is written in `63ca4744 HARNESS: Spec for the
  2026-11-24 notes (Q188)`: `game-rules.md`, `screens.md`, `accounts.md`, `tutorial.md`,
  `glossary.md`, `multiplayer.md`, `rulebook.md`. The rule files (`cards.json`, `quests.txt`,
  `influence-actions.txt`) are not touched yet: they are item 1a's. The starter's decisions are
  in Q188 ("Starter's decisions"): the score's funds and cards in hand are two parts (S9.5) and
  two record values (A3.2); the tutorial's new numbers; S1.8, S1.12, S3, S6.4 and S14.3 as
  written. `decisions.md` has nothing open for this phase.
  - **The owner approved the 18 renames** (2026-11-24, "Answered by the owner"); item 1b makes
    them in one `HARNESS:` commit together with `harness/required.yaml`.
  - **The owner asked** (2026-11-24, Q188) that the ×10 reaches `cards.json`, `quests.txt`,
    `influence-actions.txt` (item 1a) and the projects' reward and need wherever they are
    written. The project reward (+10 income, +20 funds, +3 influence) and need (100 income) are
    written in: `src/rules/completeProject.ts` (income +1 and `PROJECT_FUNDS_REWARD`; item 2a);
    `src/shared/PROJECT_INCOME_NEED.ts` (10; item 2a); `src/client/screens/game/ProjectsDialog.tsx`
    (reward chips +1 and +2, and the income "you have"; item 4);
    `src/client/screens/game/PROJECTS_HELP.ts` (S6.3; item 4);
    `src/client/screens/game/REJECTION_MESSAGES.ts` (`project_needs_not_met`, S16.3; item 4);
    `src/client/screens/tutorial/TUTORIAL_TEXTS.ts` (T5.2 "+1 income", T5.4 "10 income" and
    "income 20"; item 4); the rulebook (`harness/spec/rulebook.md`, done by the starter; its
    client tests `rulebookChangedSections.test.tsx` and `combosAndProjects.test.tsx` expect the
    old words; item 4); `harness/scenarios/projects.yaml` (items 1b and 1c); invariant I8
    (item 1a).
  - **Counts now.** `npm run harness:check`: 545 scenarios, 0 problems.
    `tools/harness-runner/harness.test.ts` expects 545; item 1b adds 3 scenarios (the 2 of
    `quests` and the 1 of `end-of-game` in "Required scenarios") and sets it to 548.
  - From the spec commit on, `npm run check` fails (the rulebook's client tests among others)
    until the items are built. Items 1a to 1d change the harness before the engine, so their
    scenarios fail until item 2a. A builder of item 1 checks each number by hand against the
    spec; the builder of 2a makes them pass, and a scenario that turns out to contradict the
    spec is fixed in a `HARNESS:` commit recorded in Q188. Every builder reports which failures
    remain and whose item they belong to.
  - **One raise each for the phase**, by item 2a and not again: `PROTOCOL_VERSION` 28 to 29
    (`src/shared/PROTOCOL_VERSION.ts`, Q75) and `SAVE_SCHEMA_VERSION` 19 to 20
    (`src/rules/SAVE_SCHEMA_VERSION.ts`, D1). If an item that changes a message shape (5) is
    built before 2a, it raises `PROTOCOL_VERSION` and notes it here, and 2a does not.
  - **Order.** 1a, 1b, 1c, 1d, 2a, 2b, 3, 4, in this order (each builds on the units of the one
    before). 5 to 9 do not touch the amounts and can go in any order, before or after; 5 and 9
    both touch your icon and name, 7 and 8 both styles, so they pair well.

- [ ] 1a. **Rule files, their checks, the format, invariants and budget** (R3.2, R15.5, R20.8,
  R20.9, T0.7, I8, I16, I28, I30, B19, points 4 and 5). **Large.**
  - `harness/spec/cards.json`: every `cost` × 10 (only `cost`; stat numbers stay). `quests.txt`:
    every `income N` requirement and every `+N fund(s)` and `+N income` reward × 10 (influence,
    other stats, types and draws stay). `influence-actions.txt`: every amount of funds × 10
    (`pay 20 funds, 10 more each time`; influence and other stats stay); every number stays
    within R15.5's 1 to 99.
  - Readers and checks: R15.5's fixed words become `10 more each time`, a price 10 funds higher
    each time (`src/shared/ruleFiles/influenceCostsOf.ts` and
    `readInfluenceActionFile.test.ts`); `1 more each time` fails with a clear message, and a
    `quests.txt` number over 999 fails (both tested in
    `tools/harness-check/checkRuleFiles.test.ts`, exit criteria); numbers up to 999 pass
    (R20.8); R20.9's starting-table check uses income 50; T0.7's line in
    `tools/harness-check/TUTORIAL_TRADING_POST_LINE.ts` becomes
    `Tier 1 | Trading post | income 40, 1 Retail | +10 funds, +2 influence`.
  - `harness/HARNESS.md` (the line on one decimal, `funds: 5.3`) and `scenario-format.yaml`:
    funds, income and `worth_gained` are whole numbers.
  - `invariants.yaml`: I8 (income at least 30), I16 (the income gate, if it names numbers), I28
    (F at least 140), I30 (F in funds, 10 per card, no tenths). `budgets.yaml` B19: limit 16,
    its `why` naming 200 × 172 pictures.
  - `HARNESS:` commits recorded in Q188 (code in `src/shared/` goes in its own `RULES:` commit).
    Until item 2a the code still multiplies the files' amounts by 10 (`fundsInTenths`), so
    amounts are 10 times too big at run time in between; that is expected.

- [ ] 1b. **The 18 renames, the first-completion scenarios, `quests` and `end-of-game`** (R19.10,
  R19.11, R21.4, R21.5, point 4). **Large.**
  - One `HARNESS:` commit: the 18 renames of "Answered by the owner", each scenario changed to
    the new rule under its new name, in `playing-cards`, `projects`, `setup`, `turns-and-time`,
    `influence`, `undo`, `quests` and `end-of-game`, with `harness/required.yaml` in the same
    commit.
  - Then the rest of `quests.yaml` (first completers get 2 funds per tier and no influence; the
    gates N − 20 and 80; rewards from the new `quests.txt`) and `end-of-game.yaml` (0.65 ×
    income, 0.02 × funds, 0.2 × cards in hand; funds and cards in hand as two score parts where
    a scenario names the parts), and the 3 new scenarios of "Required scenarios" (not on the
    required list yet; the finisher adds them). Set the count in
    `tools/harness-runner/harness.test.ts` to 548.

- [ ] 1c. **Scenarios of turns, cards, projects, influence, undo, setup and combos** (R2.1, R2.4,
  R3.8, R5.1, R11.5, R13.1, R14, R15, R16.2, R16.3). **Large.**
  - Every other funds, income, `worth_gained`, cost, price, sale and Support value in
    `turns-and-time`, `playing-cards`, `projects`, `influence`, `undo`, `setup` and
    `combos-and-income` × 10, names kept. The stats gain is 1 fund a point (a gain of 23 is
    +23), Support 10 per full 100 behind, F starts at 140 and counts 10 per card; projects need
    income 100 and give +10 income and +20 funds.
  - `HARNESS:` commits (one or two), recorded in Q188.

- [ ] 1d. **Scenarios of records, visibility, hostile client, tutorial and the rest.** **Small.**
  - `records-and-ratings`, `visibility`, `hostile-client`, `tutorial`, `drawing`, `client`:
    every amount of funds and income × 10; records hold funds and cards in hand as two values
    where a scenario names "funds plus cards in hand" (A3.2, Q188); `tutorial.yaml` follows the
    new numbers of `tutorial.md`. Then search every scenario file once more for old values of
    `funds`, `income`, `worth_gained`, costs and scores. `HARNESS:` commit, recorded in Q188.

- [ ] 2a. **Funds × 10 in the engine and the runner** (R2.1, R2.4, R2.5, R3.8, R5.1, R11.5,
  R13.1, R14, R16, R19.11, R21.4, R21.5, point 5). **Large.**
  - Remove `TENTHS_PER_FUND`, `fundsInTenths`, `amountsInTenths` and `wholeFundsOf`
    (`src/shared/`) and the runner's one-decimal reading and writing
    (`tools/harness-runner/engine/FUNDS_IN_TENTHS.ts`, `fundsWritten.ts`, `statsWritten.ts`):
    the rule files' amounts are used as written. Income: starts at 30 (`STARTING_STATS.ts`),
    +10 per product and distribution, +10 per project (`completeProject.ts`), end goal 200
    (`END_GOAL.ts`), projects need 100 (`src/shared/PROJECT_INCOME_NEED.ts`), quest gate N − 20
    and 80. F: 10 per card, starting at 140. Support 10 per full 100. Stats gain 1 fund a point.
  - Score (`src/rules/SCORE_HUNDREDTHS.ts`, `scorePartsOf.ts`, `gameResultOf.ts`): income 65
    hundredths, funds 2, cards in hand 20, as two parts `funds` and `cardsInHand` instead of
    `fundsAndHand` (`src/shared/PlaceResult.ts`, `protocol/GAME_RESULT_SCHEMA.ts`).
  - Raise both versions (Start). Every commit type-checks on its own: where removing a shared
    helper breaks the client, make the smallest client change and leave the texts to item 4.
  - Split if it runs over three commits: the engine and runner here, the rest in 2b.

- [ ] 2b. **Bots, simulator and records** (A3.2, A3.3, R21.4). **Large.**
  - Bots (`src/bots/`) and the simulator follow the units (fund and income thresholds × 10).
  - Records: `src/shared/api/RecordedSeat.ts` and `src/rules/gameRecordOf.ts` hold `funds` and
    `cardsInHand` instead of `fundsAndHand`; a record saved before still reads (keep
    `fundsAndHand` optional, as `counts` was kept, and show it as before; Q188). The record
    screen (`src/client/screens/records/GAME_RECORD_ROWS.tsx`) and the end-of-game table
    (`src/client/screens/game/ScorePartsTable.tsx`) show funds and cards in hand as two rows.
  - Run `npm run harness` (simulated games, I8, I16, I28, I30, budgets).

- [ ] 3. **First completion gives funds** (R19.5, R19.10, S5.4, S5.5, point 4). **Small.**
  - 2 funds per tier of the quest (2, 4, 6) instead of +1 influence, counted in F and taken back
    by undo; the Last turn panel adds them to the reward's funds; the log; the quests help text
    (S5.4). Covers 1b's `quests` scenarios (the renamed ones and the 2 new ones).

- [ ] 4. **Whole numbers on screen and the new texts** (S1.9, S6.3, S6.5, S8.2, S8.3, S9.5,
  S13.2, S15.2, S16.3, rulebook, point 5). **Large.**
  - Remove `src/client/components/tenthsShown.ts` and its uses (`summaryCountEntriesOf.ts`,
    `InfluenceDialog.tsx`, `LastTurnRowParts.tsx`, `mainPhaseLogText.ts`, `OpponentCard.tsx`,
    `OpponentStatsBox.tsx`, `ProjectsDialog.tsx`, `rejectionMessage.ts`, `YourStatsPanel.tsx`,
    `GAME_RECORD_ROWS.tsx`).
  - The project texts listed under Start; "Sell for 10 funds?" and the big card's cost reason
    ("Base cost 40, plus 30 …", S6.5); `TUTORIAL_TEXTS.ts` with every text of `tutorial.md`
    (10 funds a sale, 1 fund a point, 10 more a card, Public Playground 50 not 40, 4 funds a
    product, +10 income, Trading post income 40 and "2 funds more", 100 income, income 200).
  - Client tests that expect the old words (`rulebookChangedSections.test.tsx`,
    `combosAndProjects.test.tsx`, `parseRulebook.test.tsx`, the tutorial's) follow the spec.

- [ ] 5. **Your icon in the user box** (S2.3, S10.1, A2.5, point 1). **Small.**
  - Reuse `src/client/components/PlayerIcon.tsx`; the user box is in
    `src/client/screens/account/UserMenu.tsx` (lobby and game top bar); the lobby gets your icon
    from your account (`AccountBinding.ts`). If the account data the client holds lacks the
    icon, add it to the existing account response (see Start on the protocol raise).

- [ ] 6. **Card tiles** (S6.4, S14.3, S3.2, B19, points 2, 3 and 6). **Large.**
  - Pictures at 200 × 172: `tools/design-export/makeCardTilePictures.ts` (`TILE_PICTURE_SIZE` is
    100 × 86), each at most 16 KB (lower the quality, never the budget); its test
    `cardTilePictures.test.ts`. Every tile shows its picture: `HandCard.tsx`, `PlayedCard.tsx`,
    `MarketCardFace.tsx`, another player's city in the detailed summary table, and the card set
    (`src/client/screens/cardSet/CardSetGrid.tsx`); reuse `CardTileFace.tsx` and
    `CardTilePicture.tsx`. Every tile's background: `card-texture.webp`
    (`src/client/icons/CARD_TEXTURE_URL.ts`, as `BigCard.module.css` uses it) under the sector
    colour at 80%.

- [ ] 7. **Buttons and panels** (S1.10, S1.12, S6.6, S10, points 7 and 10). **Small.**
  - White text on every action button and every lobby button (the waiting room's top bar too),
    backgrounds dark enough for 4.5:1 normal and highlighted, at most 90% opaque; disabled ones
    keep their dimmed look. Panel backgrounds 75% instead of 92%
    (`src/client/components/Panel.module.css`, and the panels with their own background:
    `LastTurnPanel.module.css`, `GameLogAndChatPanel.module.css`, `RoomChatSection.module.css`,
    `Lobby.module.css`); the big card's bars stay more transparent. Check the screenshots'
    readability by eye (axe cannot measure text over the photo, `proposed-rules.md`).

- [ ] 8. **Player icons of one size** (S1.8, S5.1, point 8). **Small.**
  - The orange mark (`src/client/screens/game/QuestPlayerName.tsx`, `PlayerIcon.tsx`) is drawn
    outside the circle (an outline or ring, not a border inside the box), so a marked icon's
    circle and picture are as big as an unmarked one's; a browser test compares a marked and an
    unmarked icon's sizes in one quest.

- [ ] 9. **The Players panel** (S3, S3.1, S3.3, point 9). **Small.**
  - `src/client/screens/game/OpponentsPanel.tsx`: title and region **Players**; the tests that
    find the region "Opponents" follow (`opponents.test.tsx`, `combosList.test.tsx`,
    `statsAndSummaryTables.test.tsx`, `e2e/connections.spec.ts`, `countsAndPlayerIcons.spec.ts`,
    `gameScreenSizes.spec.ts`, `matchHistory.spec.ts`, `opponents.spec.ts`). Your counts table
    shows your icon and username over your Q, T, C and F; each quick summary table shows the
    player's icon left of their username (reuse `PlayerIcon.tsx`).

### Finish

Filled in by the finisher.
