# Phase 29b: Playthrough fixes

Status: in progress
Milestone: 6 Learning

## Goal

Everything the owner's notes of 2026-11-20 ask for (Q178), as the owner's answers in Q175, Q176
and Q177 read them: funds counted in tenths instead of the bonus stat, Support for players who
fall behind in total worth gained (F), F kept exact, quests that stay one extra turn after their
first completion with +1 influence for the first ones, quest times by tier and quests held back
until someone's income allows them, a new quest list, end goal income 20, projects without
first-completion or third-project rewards, places by end goal then score then F, a score without
base or turns, 2 build passes in turn 1, undo for selling, chosen animal player icons, card
pictures on card tiles, the Last turn panel, and the screen findings. Built before phase 30, so
version 1 starts with these rules.

## Depends on

Phase 29a.

## Covers

- Notes: `docs/feedback-notes/2026.11.20 - ready.txt`, findings 1 to 34 and 45 to 50, with Q175,
  Q176 and Q177, and the owner's items 51 and 52 of 2026-11-23 (Q178).
- Rules: R1.3, R2.1, R2.4, R2.5 (new), R4.6, R6.3, R7.2, R7.3, R7.4, R8.3, R10.1, R10.2, R11.2,
  R11.5 (new), R14 (rewritten), R15.5, R16.3, R16.4 and R16.6 (removed), R19.3, R19.5, R19.6,
  R19.7, R19.8, R19.10 (new), R19.11 (new), R20.8, R20.9, R21.2, R21.4, R21.5, R21.8, R21.9;
  M3.1, M3.5, M3.7; A2.5 (rewritten), A2.6 (new), A3.2, A3.3, A3.4, A12.1; T0.1, T1.3, T1.4,
  T2.5, T3.3, T4.3, T5.2, T5.3, T5.4.
- Rule files: `harness/spec/quests.txt` (the new list, after the owner's approval) and its check
  (R20.9: enough tier 1 quests for the starting table); `influence-actions.txt` gains
  `influence to fund` (item 51); the player icon folder and its check (A2.5).
- Screens: S1.6, S1.8, S1.9 (new), S1.10 (new), S2.2, S3.1, S3.2, S3.3 (new), S4.1, S4.7 (new), S5.1, S5.4,
  S5.5 (replaced by the Last turn panel), S6.1, S6.2, S6.3, S6.4, S6.5, S6.6, S6.9, S6.10 (new),
  S7.2, S8.1, S8.2, S8.3, S9.5, S12.5, S12.8, S13.2, S15.2, S16.3, S16.4 (removed); the rulebook's
  goal, stats, turn, undo, ending, end and start of every turn, bonus (removed), projects,
  quests and end of the game sections.
- Invariants: I10 (renamed, waiting for the owner), I15, I16, I22 and I28 (changed), I30 (new).
  Budgets: B18 (icon changes), B19 (new: card pictures on tiles).

## Start

The spec and harness changes for this phase are already written, in `HARNESS:` commits on the
branch `phase-29b-playthrough-fixes` (Q178). The starter checks out that branch instead of
creating it. On it, `npm run check` fails until the items below are built:

- `npm run harness:check` fails with 13 problems (545 scenarios), all from 8 of the required
  scenarios of "Waiting for the owner": they still use the `bonus` stat and `first_completions`,
  which the format no longer has, and cover R16.4 and R16.6, which are gone. They clear when the
  owner's answer is applied. The rule file check does not yet know the new failure of R20.9 (too
  few tier 1 quests for the starting table), nor the player icon folder check (item 8).
- `tools/harness-runner/harness.test.ts` still expects 507 scenarios (there are now 545), and
  required scenarios now assert the new rules: funds with tenths, 2 build passes in turn 1, the end goal
  at income 20, the score without base or turns, quests that stay their extra turn.
- `quests.txt` holds the proposed new quest list (item 6), which the required "completing …
  gives its reward" scenarios of `quests.yaml` do not follow yet: they are changed to it only
  once the owner approves the list. They also do not yet expect the +1 influence of a first
  completion (R19.10), which every one of them is; item 6 adds it with the list. Until then item
  5's builder runs them with the +1 locally to check, and reports them as item 6's.
- Support (R11.5) is new in every turn change: a required scenario that ends a turn with two
  players 10 or more apart in F now also gives Support. The scenarios written for this phase
  include it; a builder who finds an older one that did not is facing a scenario that
  contradicts the spec, and changes it on the record (Q178).

The new scenarios are not on the required list yet; the finisher adds them (see Required
scenarios). The 14 required names of "Waiting for the owner" are left exactly as they were until
the owner answers.

## Builds

1. **Funds in tenths** (R2.1, R2.5, R10.1, R14, R15.5, R21.4, S1.6, S1.9, S6.2, I10, finding 4):
   the bonus stat goes everywhere (state, view, log, rule file stats, screens, bots, the
   tutorial's states); funds, income and every amount of funds are kept in tenths, costs and
   rewards ×10; the end-of-turn gain goes into funds in tenths, never below 0; screens show
   funds, income and F with one decimal; the scenario runner reads funds with one decimal.
   Raises `PROTOCOL_VERSION` and `SAVE_SCHEMA_VERSION` once for the phase. Large; split it if
   it runs over three commits (for example the engine and runner first, then the screens).
2. **F exact and Support** (R2.4, R11.5, I28, I30, findings 27 and Q177's F rule): F in tenths
   from every source of funds and every card gained; Support at the start of every turn from
   turn 2; the log line and the view's Support per seat. Medium.
3. **Projects, end goal and build passes** (R1.3, R16.3, R4.6, R6.3, S6.3, S8.2, findings 6, 26,
   48, 49): no first-completion funds and no third-project extra, the first-completion state and
   its screen lines go; the end goal at income 20; 2 build passes in turn 1. Small.
4. **Undo for selling** (R7.2, R7.3, R7.4, finding 24): selling becomes an undo point; undo puts
   the cards back in the hand from the holding pile and takes back the funds. Small.
5. **Quests on the table** (R10.2, R19.3, R19.5 to R19.11, R20.9, I15, I16, findings 11, 12,
   50): the quest's time by tier (6, 5, 4), the extra turn after the first completion, +1
   influence for the first completers (undone with the quest), the income gate for the refill
   and the starting table, the rule file check for enough tier 1 quests at the start. Large.
6. **The new quest list** (R20.7, finding 10): only after the owner approves
   `docs/plan/phase-29b-quest-list-proposal.md` (Waiting for the owner). Then the "completing …
   gives its reward" scenarios and the other scenarios that name quest contents follow the list
   in a `HARNESS:` commit recorded in Q178; tests that name old quest values follow it. Small.
7. **Places and score** (R21.4, R21.5, R21.8, R21.9, A3.3, A3.4, S9.5, I22, findings 25 and
   28): score without 870 and turns, with whole funds; places by end goal, score, F, player
   order; the end-of-game table shows each player's score part by part. Medium.
8. **Player icons** (A2.5, A2.6, A12.1, S1.8, S12.5, S12.8, B18, finding 22, Q175): copy
   `design/assets/playericons/` with its licence into the repository as the folder
   `player-icons/` (the builder picks the place the client and the Worker can both read, as the
   rule files are read with `?raw`); the folder check in `npm run check`; the account's icon
   (picture, background, picture colour) in D1 with a random default for every account; the
   `change_icon` request with `unknown_icon`, `icon_colors_too_alike`,
   `icon_change_too_soon`; the icon kept per room; the picker in account settings with a
   preview; credits on the privacy notice; every player icon shows the picture. Large.
9. **Card tiles** (S4.1, S6.1, S6.4, B19, findings 14, 19, 29, 33): small pictures (about
   100 px wide WebP made from `src/client/assets/cards/`, never the full photos) on hand, city
   and marketplace tiles as `design/sketches/14-card-pictures/APPROVED.md` says; fixed tile
   sizes with smaller text for long names (a test that all 240 names fit); 80% backgrounds; the
   hand sorted by sector, tier, card number; unplayable hand cards dimmed; market cards show
   their turns left. Large.
10. **The big card** (S6.5, S6.9, S6.10, findings 5, 9, 13, 20 and 45, 47): title bar in the
    stats bar's colour, more transparent; a thin black border on the image; + and − signs on
    the stat numbers; Sell with "Sell for 1 fund?"; a card-name combo's card number names the
    card on pointing; a hand card's combos that playing it would make ready are highlighted,
    infinite ones with "×N". Medium.
11. **Your counts and the tables** (S3.1, S3.2, S6.2, S9.5, S13.2, A3.2, findings 3, 17, 21,
    23): the small "Your counts" table with your Q, T, C, F and one "?" above the opponents'
    quick summary tables (those four boxes leave your stats board); T and the 5 most played
    types count gained types for every viewer; Q, T, C, F in the end-of-game table and the game
    record. Medium.
12. **The Last turn panel** (S5.5, S7.2, M3.5, M3.7, S16.4, finding 46 and Q177's addition):
    the panel of `design/sketches/46-turn-notifications/APPROVED.md` with quests (and reward),
    projects, income gains and Support of the turn before, from the view; log lines; it
    replaces the completed-last-turn table and the income notice. Medium.
13. **Quest turns left and the market countdown** (S5.1, S4.7, findings 15, 16): the big
    coloured number of `design/sketches/15-quest-turns-left/APPROVED.md` (red 1 in the extra
    turn); the big red countdown in the marketplace during your market go, pulsing in the last
    5 seconds (none with reduced motion) with a red marketplace border. Small.
14. **Buttons and highlights** (S1.10, S6.1, S6.6, S3.2, findings 7, 18, 30, 31, 34): the
    claimed combos list without card names; the Projects button highlighted when a project can
    be completed and Claim all when its number is above 0; Use influence shows your influence;
    every button background at most 90% opaque. Small.
15. **Pictures and the browser tab** (S6.3, S8.2, S1.2, findings 1, 2): the project pictures of
    `design/assets/projects/` made small (about 600 px wide, at most about 80 KB each) and shown
    in the Projects pop-up; the logo of `design/assets/logo/` as the tab icon. Small.
16. **Tutorial messages and texts** (S15.2, T1.3 to T5.4, finding 8): each message beside the
    area it highlights with an arrow, the rest of the screen dimmed a little while it waits for
    Continue; the tutorial's texts and states in tenths, without bonus, with 2 build passes.
    Medium.
17. **Away at the start** (S2.2, finding 32): find why your own badge shows away when a game
    starts, fix it, with a browser test. Small.
18. **Rulebook** (rulebook, S14.2): the changed sections show in the rules viewer: stats
    without bonus, the funds tenths, Support, projects, quests, the end of the game and the
    score. Small.
19. **Influence actions** (R15.1, S8.3, items 51 and 52): the new line
    `influence to fund | pay 3 influence | get 1 fund | no limit` works from the file with no
    new code (R15.6; the Use influence pop-up and the tests that count its tiles follow); the
    pop-up's tiles get one background for actions with `no limit` and another for limited ones,
    and colours that show whether you can take the action now, besides its disabled state, from
    the design tokens (the builder picks them; a sketch only if the owner asks). Small.

Every item that changes a message's shape raises `PROTOCOL_VERSION` (Q75); one raise for the
phase is enough, as the items ship together; the state's shape change raises
`SAVE_SCHEMA_VERSION` once (D1). A scenario that turns out to contradict the new spec is changed
in a `HARNESS:` commit and recorded in Q178; one that only disagrees with the code is not.

## Known gaps after this phase

- None beyond phase 29a's, except: the end-of-turn gain can no longer take funds below 0
  (Q178), which the old bonus never did either.

## What you can see when it's done

All findings of your notes of 2026-11-20, on the live site: funds show tenths and the bonus stat
is gone; players far behind in F get Support at the start of a turn; quests stay one turn more
after someone completes them, the first ones get +1 influence, tier 1, 2, 3 quests stay 6, 5, 4
turns with a big coloured number, and income quests wait until someone is close; the new quest
list; the end goal is income 20; projects give the same reward every time; places go by end goal,
then score, then F, and the end screen explains each score; you start with 2 build passes and
can undo selling; you choose your animal icon and its colours; cards show small pictures, the
hand is sorted and dims what you cannot play, market cards show their turns left; the big card
has signs, a Sell button and combo hints; your Q, T, C, F sit above the opponents'; the Last
turn panel tells what happened last turn; the market countdown is big and red; project pictures
and the tab icon show; tutorial messages sit next to what they point at; and you no longer see
yourself away at the start.

## Exit criteria

- Every scenario of this phase passes, and the required scenarios that now assert the new rules
  pass again; the 14 of "Waiting for the owner" under the names the owner approves.
- `npm run check` fails with a clear message when `quests.txt` has too few tier 1 quests for the
  starting table, or when the player icon folder holds a file that is not a clean SVG or an
  artist the licence file does not name (tested), and passes on the files as the owner leaves
  them.
- Invariant I30 holds in every simulated game; the leak test passes with the Last turn panel and
  Support.
- The budget checks pass, B18 with icon changes and B19 for the card pictures.
- Screenshots in `harness/screens/` of the hand, city and marketplace with pictures, the big card
  with signs, Sell and combo highlights, the quests with turns-left numbers, the Last turn
  panel, Your counts above the quick summary tables, the market countdown, the Projects pop-up
  with pictures, the end-of-game table with score parts and Q, T, C, F, the icon picker, and a
  tutorial message with its arrow.

## Open points

- None.

## Waiting for the owner

Answered by the owner on 2026-11-23: the quest list is approved as proposed, and the 14 required names below are approved (Q178). Items 6 and 20 no longer wait. Nothing else waits for the owner.

- **Approve the new quest list (finding 10, Q176).** The proposed list is in
  `docs/plan/phase-29b-quest-list-proposal.md` and, on the branch, in `harness/spec/quests.txt`.
  It keeps every quest name, so no required scenario name changes. Item 6 waits for your answer;
  every other item goes on without it. Your edits to the list are welcome instead of an approval.
- **Approve 14 required names (Q178).** Findings 4, 6, 11, 24, 25, 28, 48 and 49 make these names
  on `harness/required.yaml` untrue. Names leave the list only with your approval, so they are
  left unchanged until you answer; until then the check cannot go green. Proposed:
  - Renamed (the scenario is changed to the new rule under the new name):
    - `setup`: "every player starts turn 1 with 1 build pass" → "every player starts turn 1 with
      2 build passes"
    - `turns-and-time`: "end-of-turn steps pay influence income and bonus and keep build passes"
      → "end-of-turn steps pay influence income and the stats gain and keep build passes"
    - `quests`: "a completed quest leaves the table for good and the place is refilled next
      turn" → "a completed quest leaves the table for good after its extra turn and the place
      is refilled"
    - `records-and-ratings`: "a player who left in an earlier turn is scored with the turn they
      left" → "a player who left in an earlier turn is scored with their values when they left"
    - `tutorial`: "tutorial turn 4 teaches product and the first bonus fund" → "tutorial turn 4
      teaches product and the funds the stats add"
    - invariant I10: "bonus is turned into funds at the end of every turn" → "the stats gain goes
      into funds at the end of every turn"
  - Replaced (the old scenario is deleted and the new one, already written, takes its place on
    the list):
    - `turns-and-time`: "negative stats lower the bonus and a negative bonus gives no funds" →
      "negative stats lower the funds gained at the end of the turn"
    - `turns-and-time`: "every full 10 bonus becomes 1 fund" → "the stats gain is added to funds
      in tenths of a fund"
    - `projects`: "the third project gives an extra income and an extra card" → "the third
      project gives the same reward as the others"
    - `projects`: "everyone who completes a project in the first turn anyone does gets 2 extra
      funds at the end of the turn" → "completing a project first gives no extra funds"
    - `projects`: "a project completed in a later turn gives no first-completion funds" →
      "a project completed in a later turn gives the same reward"
    - `undo`: "selling cannot be undone" → "undo takes back selling and puts the cards back in
      the hand"
    - `end-of-game`: "equal scores are broken by who became done earlier in the final turn" →
      "equal scores are broken by total worth gained"
    - `end-of-game`: "players made done at the same moment in the final turn are placed in
      player order" → "equal scores and total worth gained are broken by player order"

  Everything else in the phase goes on without the answer. Once you approve, one `HARNESS:`
  commit makes these changes in the scenario files and in `harness/required.yaml` together.

## Required scenarios

These new scenarios are added to `harness/required.yaml` in this phase, by file and name (the 8
replacements of "Waiting for the owner" go on it with the owner's approval; the finisher adds
the others; the 6 renames stay on it under their new names):

- `turns-and-time`: the stats gain is added to funds in tenths of a fund; negative stats lower
  the funds gained at the end of the turn; the stats gain never takes funds below 0; a positive
  stats gain adds to total worth gained and a negative one does not lower it; Support gives
  1 fund for every full 10 total worth gained behind the highest other player; a player less
  than 10 total worth gained behind gets no Support; players who left do not count for Support;
  Support adds to total worth gained
- `projects`: the third project gives the same reward as the others; completing a project
  first gives no extra funds; a project completed in a later turn gives the same reward
- `undo`: undo takes back selling and puts the cards back in the hand; undo takes back the
  extra influence of completing a quest first
- `quests`: another player can complete a quest during its extra turn; a quest completed during
  its extra turn does not stay longer; a quest completed in its last turn on the table leaves
  at the end of that turn; everyone who completes a quest in the first turn anyone does gets
  1 more influence; completing a quest during its extra turn gives no extra influence; a tier 1
  quest stays on the table for 6 turns; a tier 3 quest stays on the table for 4 turns; a quest
  needing income is placed only once some player has that income minus 2; a quest needing
  completed projects is placed only once some player has 8 income; a quest needing income is
  placed once some player has that income minus 2
- `end-of-game`: the end goal needs income 20 and all 3 projects; a player who reached the end
  goal places above a player with a higher score who did not; equal scores are broken by total
  worth gained; equal scores and total worth gained are broken by player order; the score has
  no base and no part for turns; the score counts whole funds only
- `records-and-ratings`: the game record holds every player's Q T C and F counts
- `accounts`: a new account gets a random animal icon and colours; a player can change their
  icon at most 10 times in 24 hours; rejects an icon whose colours are too alike; rejects an
  icon picture that is not in the icon folder; a room keeps the icon a player had when they
  joined
- `visibility`: the view shows last turn's quests projects income and Support; another player's
  type counts show types gained from quests from the next turn
- `influence`: 3 influence buy 1 fund as often as the player likes

Invariant I30 is added to the required list.

These required scenarios keep their names and now assert the new rules (Q178) and must pass
again: every scenario whose stats name funds with the old bonus (setup's starting stats,
visibility's held-back stats, the tutorial turns), the end-goal scenarios of `end-of-game`
(income 20), the score scenarios of `end-of-game` and `records-and-ratings` (no base, no turns),
the quest scenarios that wait for a quest to leave ("a quest nobody completed in 5 turns goes
back into the quest list" and "a quest that leaves after 5 turns cannot fill a place in the
refill straight after", now with a tier 2 quest, which stays 5 turns), and, after the owner's
approval of the list, the quest scenarios that name quest contents.

## Progress

- [x] 0. Start (2026-11-23): the branch already held the spec and harness changes (Q178).
  The starter found no contradiction in the spec and no open decision (`decisions.md` has none
  open; Q178 already decides every point the owner's answers left open); the readings below are
  everyday choices, not questions.
  - **Counts now.** `npm run harness:check`: 545 scenarios, 13 problems, all from the old
    required scenarios of "Waiting for the owner" (`bonus`, `first_completions`, R16.4, R16.6);
    item 20 clears them. `tools/harness-runner/harness.test.ts` still expects 507; item 1a sets
    it to 545 (and any item that adds a scenario raises it).
  - Until every item is built, and until the owner answers, `npm run check` fails on required
    scenarios of later items and on the 13 problems above. A builder reports which still fail
    and why, and checks that its own item's scenarios pass (added to the required list locally,
    not committed) and fail without the change. The 8 replacement scenarios already exist under
    their new names beside the old ones: the builder of the item they belong to makes the new
    one pass; the old one is item 20's.
  - **The proposed quest list is already live.** The code reads `harness/spec/quests.txt`
    (29a item 1b), which now holds the proposed list, so the "completing … gives its reward"
    scenarios of `quests.yaml` (old values, no +1 influence) fail until item 6. That failure is
    item 6's, not a regression of any other item. All 15 tier 1 quests of the proposed list
    are allowed on the starting table (none needs income above 5 or a project), and Trading post
    is unchanged, so the tutorial's quest check (T0.7) still passes.
  - **One raise each for the phase**, by item 1a (the first shape change) and not again:
    `PROTOCOL_VERSION` 27 to 28 (`src/shared/PROTOCOL_VERSION.ts`, Q75) and
    `SAVE_SCHEMA_VERSION` 18 to 19 (`src/rules/SAVE_SCHEMA_VERSION.ts`, D1).
  - **Order.** Everything that does not wait for the owner comes first: 1a, 1b, 2, 3, 4, 5, 7
    (rules, in this order: tenths first, as every later rule counts in them; F and Support on
    the tenths; 7 after 2, as places use F); then the screens 8 to 19 in any order, except 12
    after 2 and 5 (it shows Support and the quests' +1), 11 after 2 (F) and 16 after 1b and 3
    (the tutorial's states). Last, the two that wait for the owner: 20 (the 14 required names)
    and 6 (the quest list), in whichever order the answers come.

- [x] 1a. **Funds in tenths: engine, protocol and runner** (R2.1, R2.5, R10.1, R14, R15.5,
  R21.4, I10, I7, finding 4). **Large.**
  - The `bonus` stat leaves `Stats` (`src/shared/Stats.ts`, `STAT_KEYS.ts`,
    `protocol/STATS_SCHEMA.ts`), `STARTING_STATS.ts`, `endOfTurnSteps.ts` and
    `invariantViolations.ts`. Funds, income and every amount of funds (card costs and rewards,
    sale values, build pass prices, influence action costs and gains, quest and project rewards,
    starting funds) are kept in tenths: the rules and the rule files keep writing whole funds,
    and the code multiplies by 10 where it reads them (one helper, reused; do not edit the card
    data or rule files). The end-of-turn gain of R14 goes into funds in tenths, never below 0.
  - F (`STARTING_WORTH_GAINED`, `worthGained*`) counts in the same tenths here (1 card = 10);
    item 2 makes it exact and adds Support.
  - The scenario runner (`tools/harness-runner/`) reads and compares funds and income written
    with one decimal (`funds: 5.3`), per `scenario-format.yaml`. Raise both versions (Start).
    Set the scenario count in `harness.test.ts` to 545. Bots follow the type change.
  - Covers the new `turns-and-time` scenarios "the stats gain is added to funds in tenths of a
    fund", "negative stats lower the funds gained at the end of the turn", "the stats gain never
    takes funds below 0", and the required ones whose stats name funds (setup, visibility).
  - Split from Builds item 1: 1a is everything up to the view; 1b the client.
  - **Done (2026-11-23).** One helper set in `src/shared/`: `TENTHS_PER_FUND`,
    `fundsInTenths` (whole funds as written to tenths), `amountsInTenths` (a rule file's
    `StatAmounts` with funds in tenths) and `wholeFundsOf` (tenths to whole funds, rounded
    down). The stats gain is `src/rules/statsGainOf.ts`. `PROTOCOL_VERSION` is 28 and
    `SAVE_SCHEMA_VERSION` 19; neither is raised again in this phase. The scenario runner reads
    funds and `worth_gained` with one decimal (`tools/harness-runner/engine/FUNDS_IN_TENTHS.ts`)
    and writes them back the same way (`fundsWritten.ts`, `statsWritten.ts`). The four new
    stats gain scenarios of `turns-and-time` pass (run as required locally), and so do setup's and
    visibility's required ones.
  - **Differs from the phase file.** Only funds and F are stored in tenths; income stays a whole
    number in the state and the view, since R2.5 keeps it whole, and the end-of-turn steps add it
    as `fundsInTenths(income)`. Every comparison and rule that reads income (end goal, projects,
    quests, score, I8) is unchanged that way. Fixed amounts in the view (`realCost`,
    `buildPassPrice`, trade costs from the rule file) stay whole funds; the engine converts them
    where it pays or compares. The score already uses whole funds (`wholeFundsOf` in
    `scoreOf.ts`, `gameResultOf.ts` and I22's check), so item 7 only removes the base and
    turns. I10 now checks that after every turn change each player still in the game has at
    least max(0, funds + income + stats gain) of the turn before; a lower bound, so Support
    (item 2) needs no change to it. Its name in `invariants.yaml` still waits for the owner
    (item 20). To type-check, the bonus chip left `YourStatsPanel` and `OpponentStatsBox`
    and `bonus` left the client test fixtures; everything else of the client is 1b's.
  - **For later items.** Until 1b, screens show funds and F as raw tenths ("Funds 70"), so
    browser tests naming funds (`combosAndProjects.spec.ts`, `handAndActionsScreens.spec.ts`)
    and `gameScreenSizes.spec.ts` (which lists "Bonus") fail; 1b fixes them. Engine tests that
    set funds write tenths (`funds: 90`) or `fundsInTenths(9)`. Still failing after 1a, none
    of them 1a's: required scenarios of items 3 (end goal income 20), 5 (tutorial turn 5's +1
    influence; the random quest of "the quests completed in the turn before can be seen" and
    visibility's log scenario), 6 (every "completing … gives its reward", "a type gained from
    one quest helps complete another", "tier 1 cards do not count …", "Penthouses needs …"),
    7 (the four score scenarios of `end-of-game` and `records-and-ratings`), 16 (tutorial
    start's `build_passes`) and 20 (the three bonus scenarios of `turns-and-time`, tutorial
    turn 4, the 13 harness:check problems); unit tests of items 6 (`quests.test.tsx`,
    `ruleFileTables` quests), 9 (`reportBudgets`: B19), 18 (`parseRulebook`) and 19
    (`influenceAndUndo`: 20 tiles, `ruleFileTables` influence actions), all failing before 1a.
- [ ] 1b. **Funds in tenths: screens, bots and the tutorial's states** (S1.6, S1.9, S6.2,
  R21.4). **Large.**
  - Screens show funds, income and F with one decimal ("5.3", "7.0"); fixed amounts (costs,
    rewards, sale values, trade costs) stay whole as written (S1.9). The bonus stat goes from
    `src/client/icons/StatName.ts`, `STAT_ICONS.ts`, `YourStatsPanel`, `OpponentStatsBox`,
    `ProjectsDialog`, `GameRecordSummary`, `rules/statWordParts.ts` and the test helpers
    (`roomUpdateWith.ts`, `statAndTypeWordsShownIn.ts`, `OWN_SEAT_VIEW.ts`). One formatter for
    tenths, reused everywhere.
  - The tutorial's states (stats, costs) in tenths without bonus; its texts are item 16's.
  - Decide in Progress whether 1a's commits already needed some of this to type-check (every
    commit must type-check on its own, `proposed-rules.md`).
- [ ] 2. **F exact and Support** (R2.4, R11.5, I28, I30, finding 27, Q177's F rule). **Medium.**
  - F in tenths from every source of funds (starting funds, income, the positive stats gain,
    projects, quests, influence actions, Support) and every card gained (starting hand, draws,
    marketplace cards); selling does not change it; undo takes back exactly what it added.
    Invariant I30 checks the exact sum after every simulated action (`invariantViolations.ts`,
    `worthGainedViolations.ts`).
  - Support from turn 2, right after the turn's build pass (`withTurnBuildPass.ts`) and before
    the marketplace: compare with the highest F of the other players still in the game, all
    taken before any Support is given; 10 tenths per full 100 tenths behind; fewer than 2
    players in the game, none. Public at once; a log line; the view's Support per seat (for
    item 12). Leak test must pass.
  - Covers the `turns-and-time` Support scenarios and "a positive stats gain adds to total worth
    gained and a negative one does not lower it".
- [ ] 3. **Projects, end goal and build passes** (R1.3, R16.3, R4.6, R6.3, S6.3, S8.2, findings
  6, 26, 48, 49). **Small.**
  - Delete `firstCompletionFundsOf.ts`, `firstCompletionsOf.ts` and the first-completion state
    (`GameState.ts`, `setUpGame.ts`, `endMainPhase.ts`, `endGame.ts`) and the third-project
    extra; the pop-up's lines go (`ProjectsDialog`, `ProjectProgressList`, test builders
    `botViewWith.ts`, `roomUpdateWith.ts`). End goal income 20 (`gameEndViolations.ts` and the
    ending check). Turn 1 gives 2 build passes (`withTurnBuildPass.ts`).
  - Covers the new `projects` scenarios and "the end goal needs income 20 and all 3 projects";
    setup's "2 build passes" scenario is item 20's name.
- [ ] 4. **Undo for selling** (R7.2, R7.3, R7.4, finding 24). **Small.**
  - `sellCards.ts` becomes an undo point (`withUndoHistory.ts`, `undoLatest.ts`); undo moves the
    cards from the holding pile back to the hand and takes back the funds; F unchanged both ways.
  - Covers `undo`'s "undo takes back selling and puts the cards back in the hand".
- [ ] 5. **Quests on the table** (R10.2, R19.3, R19.5 to R19.11, R20.9, I15, I16, findings 11,
  12, 50). **Large.**
  - Time by tier 6, 5, 4 (`QUEST_TABLE_RULES.ts`); the extra turn after the first completion
    and the leaving rules of R19.6 (`endTurnForQuests.ts`, `QuestTable.ts`); +1 influence for
    everyone completing it in the first turn anyone does, undone with the quest
    (`completeQuest.ts`, `questsCompletedThisTurnOf.ts`); the income gate of R19.11 for the
    refill and the starting table (`refillQuests.ts`, `pickStartingQuests.ts`), a fully held
    back tier counts as empty (R19.8). The rule file check (`tools/harness-check/
    checkRuleFiles.ts`) fails with a clear message under 4 allowed tier 1 quests, tested.
  - The view needs each quest's turns left and whether it is in its extra turn (item 13).
  - Covers the new `quests` scenarios, `undo`'s "+1 influence" one, and the two required ones
    now using a tier 2 quest. Run the "completing … gives its reward" scenarios with the +1
    locally and report them as item 6's (Start).
- [ ] 7. **Places and score** (R21.4, R21.5, R21.8, R21.9, A3.3, A3.4, S9.5, I22, findings 25,
  28). **Medium.** After 2.
  - `scoreOf.ts`, `SCORE_HUNDREDTHS.ts`, `cardsInHandScoredOf.ts`, `scoredEndingOf.ts`: no 870
    base and no turns part, whole funds only (tenths ÷ 10, rounded down). Places by end goal
    reached, score, F, player order of the final turn; players who left last (A3.4); R8.3's done
    order is still recorded but no longer breaks ties (`leavingPlaces.test.ts`, `endGame.ts`).
  - The end-of-game table shows each score part by part (view and screen, S9.5).
  - Covers the new `end-of-game` scenarios and the required score scenarios of `end-of-game`
    and `records-and-ratings`.
- [ ] 8. **Player icons** (A2.5, A2.6, A12.1, S1.8, S12.5, S12.8, B18, finding 22, Q175).
  **Large.**
  - Copy `design/assets/playericons/` (one artist folder `ffffff` and `license.txt`) into the
    repository as `player-icons/`, in a place the client bundle and the Worker can both read
    (as `src/shared/ruleFiles/INFLUENCE_ACTIONS.ts` reads with `?raw`); load pictures only when
    shown. The folder check in `npm run check` (only SVG, `viewBox`, no script or outside
    reference, at most 20 KB, every artist named in the licence), tested on bad files.
  - The icon in D1 (a new migration after `0014_ratings.sql`), a random default for new and
    existing accounts; `change_icon` with `unknown_icon`, `icon_colors_too_alike` (3:1),
    `icon_change_too_soon` (10 in 24 hours: reuse the username change limit of
    `0013_username_changes.sql` and `UsernameSetting`). Kept per room as A2.4 keeps usernames.
  - The picker with a preview in account settings (`AccountSettingsDialog`), credits on the
    privacy notice, `PlayerIcon` and `PlayerIconColors` show the picture everywhere.
  - Covers the new `accounts` scenarios; B18 with icon changes. Likely 3 or more commits:
    split it if it runs over (server first, then the client).
- [ ] 9. **Card tiles** (S4.1, S6.1, S6.4, B19, findings 14, 19, 29, 33). **Large.**
  - Small WebP pictures (about 100 px wide, at most 6 KB each, B19) made from the 240 photos in
    `src/client/assets/cards/` (11 MB; never ship them on tiles) by a build step or committed
    files, placed as `design/sketches/14-card-pictures/APPROVED.md` says, on hand, city and
    marketplace tiles. Fixed tile sizes, smaller text for long names, a test that all 240 names
    fit; 80% backgrounds. The hand sorted by sector, tier, card number (`useHandChoice`, the
    sorting of `src/client/sorting/`); unplayable hand cards dimmed from the view's mark;
    market cards show their turns left (Q178: counting the current market phase).
  - Any new dependency for the pictures goes into `open-questions.md` (CLAUDE.md 10).
- [ ] 10. **The big card** (S6.5, S6.9, S6.10, findings 5, 9, 13, 20, 45, 47). **Medium.**
  - `BigCardBesideHand` and its parts: title bar in the stats bar's colour, more transparent;
    thin black image border; + and − signs per R3.4; Sell for the shown card with "Sell for
    1 fund?" as one sell action; a card-name combo's number names the card on pointing; the
    combos playing the hand card would make ready are highlighted, infinite ones with "×N"
    (from the view, never computed in the client; add to the view if missing).
- [ ] 11. **Your counts and the tables** (S3.1, S3.2, S6.2, S9.5, S13.2, A3.2, findings 3, 17,
  21, 23). **Medium.** After 2.
  - A small "Your counts" table (Q, T, C, F and one "?" explaining them) above the opponents'
    quick summary tables; those boxes leave `YourStatsPanel`. T and the 5 most played types
    count types gained from quests for every viewer, others from the next turn (R5.4;
    `visibility`'s new scenario). Q, T, C, F in the end-of-game table and the game record
    (`records-and-ratings`' new scenario; `GameRecordSummary`).
- [ ] 12. **The Last turn panel** (S5.5, S7.2, M3.5, M3.7, S16.4, finding 46, Q177's addition).
  **Medium.** After 2 and 5.
  - As `design/sketches/46-turn-notifications/APPROVED.md`: quests (with reward), projects,
    income gains and Support of the turn before, all from the view, with log lines. It replaces
    `QuestsCompletedLastTurnTable` and `useIncomeRiseNotice`. Covers `visibility`'s "the view
    shows last turn's quests projects income and Support"; leak test passes.
- [ ] 13. **Quest turns left and the market countdown** (S5.1, S4.7, findings 15, 16).
  **Small.** After 5.
  - The big coloured number of `design/sketches/15-quest-turns-left/APPROVED.md` on
    `QuestCard` (red 1 in the extra turn); the big red countdown in `MarketplacePanel` during
    your market go, pulsing in the last 5 seconds (not with reduced motion), red border.
- [ ] 14. **Buttons and highlights** (S1.10, S6.1, S6.6, S3.2, findings 7, 18, 30, 31, 34).
  **Small.**
  - Claimed combos without card names; the Projects button highlighted while the view says a
    project can be completed, Claim all while its number is above 0; "Use influence" with the
    influence icon and amount; every button background at most 90% opaque (tokens).
- [ ] 15. **Pictures and the browser tab** (S6.3, S8.2, S1.2, findings 1, 2). **Small.**
  - Project pictures from `design/assets/projects/` at about 600 px wide, at most about 80 KB
    each, in `ProjectsDialog` (lazy, not in the first screen's bundle); the logo of
    `design/assets/logo/` as the tab icon. Check the bundle budget.
- [ ] 16. **Tutorial messages and texts** (S15.2, T1.3 to T5.4, finding 8). **Medium.** After
  1b and 3.
  - Each message beside the area it highlights, with an arrow; the rest dimmed a little while
    it waits for Continue (`TutorialPage`). `TUTORIAL_TEXTS.ts` in tenths, without bonus, with
    2 build passes. The required `tutorial` scenarios pass (turn 4's name is item 20's).
- [ ] 17. **Away at the start** (S2.2, finding 32). **Small.**
  - Find why your own badge shows away when a game starts (a bug of the code, Q178), fix it,
    with a browser test.
- [ ] 18. **Rulebook** (rulebook, S14.2). **Small.**
  - The changed sections of `harness/spec/rulebook.md` show in the rules viewer
    (`PARSED_RULEBOOK.ts`, `statWordParts.ts`): no bonus, funds tenths, Support, projects,
    quests, ending, score. Mostly tests that the viewer shows them.
- [ ] 19. **Influence actions** (R15.1, S8.3, items 51, 52). **Small.**
  - `influence to fund` already is in `influence-actions.txt`: check it works with no new code
    (`influence`'s new scenario); the pop-up's tile counts in tests follow
    (`influenceAndUndo.test.tsx` expects 19 tiles). Tiles get one background for `no limit` and
    another for limited actions, and colours that show whether the action can be taken now,
    from the design tokens (`InfluenceDialog`, `TradeTile`).
- [ ] 20. **The 14 required names** (Waiting for the owner, Q178). **Small.** Only after the
  owner's answer.
  - One `HARNESS:` commit, recorded in Q178: the 6 renames (the scenario changed to the new rule
    under the new name, in its file and in `harness/required.yaml`) and the 8 replacements (old
    scenario deleted, the new one already written takes its place on the list), as the owner
    approves them. `npm run harness:check` then has no problems; lower the count in
    `harness.test.ts` by the deleted scenarios.
- [ ] 6. **The new quest list** (R20.7, finding 10). **Small.** Only after the owner approves
  `docs/plan/phase-29b-quest-list-proposal.md` (or edits it).
  - Write the owner's list into `quests.txt` if it differs; then the "completing … gives its
    reward" scenarios (with the +1 influence of R19.10) and other scenarios naming quest
    contents follow it in a `HARNESS:` commit recorded in Q178; tests naming old quest values
    follow. If the owner changes Trading post, the tutorial (T0.7) follows too.

- [ ] Finish. The finisher adds the new scenarios of "Required scenarios" (not the 8
  replacements, which item 20 adds) and I30 to `harness/required.yaml`, then follows
  `phase-helpers.md`.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Planner | Opus, medium | 20 | 343,427 | 123 | blocked (owner answers) |
| Starter | Opus, medium | 3 | 97,090 | 23 | done |
| Builder 1a | Opus, medium | 20 | 203,436 | 89 | done |
