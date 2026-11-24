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
- [x] 1b. **Funds in tenths: screens, bots and the tutorial's states** (S1.6, S1.9, S6.2,
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
  - **Done (2026-11-23).** 1a's commit already took the bonus chip out of `YourStatsPanel` and
    `OpponentStatsBox` and `bonus` out of the fixtures, as it needed to type-check; 1b did the
    rest. One formatter, `src/client/components/tenthsShown.ts` (tenths to one decimal);
    income, whole in the view, is shown as `tenthsShown(fundsInTenths(income))`. Funds, income
    and F show one decimal in your stats, the opponent cards and boards, the count boxes, the
    influence pop-up, the projects pop-up's "you have", the not-enough-funds message, and the
    income column of the end-of-game table and the game record. The bonus stat left
    `StatName`, `STAT_ICONS` (and `BONUS.png`), `statWordParts` and
    `statAndTypeWordsShownIn`. Test fixtures hold funds and F in tenths (`funds: 70`,
    `worthGained: 140`). Bots read no funds, so needed no change. The tutorial's states come
    from the engine and are in tenths already: its turn 1 to 3 scenarios pass; turn 4 is item
    20's, turn 5 item 5's, its texts item 16's.
  - **Readings (no spec change).** A quest's progress ("7/10" income) is a count toward a fixed
    need and stays whole; "funds + hand" in the end-of-game table and the record is a score
    part in whole funds (R21.4) and stays whole until item 7 reworks that table.
  - **For later items.** `e2e/combosAndProjects.spec.ts` expects "Funds 22.1" at turn 2, which
    still holds the first-completion +2; item 3 makes it 20.1. `e2e/gameOver.spec.ts`'s
    "Income 22" is the end goal (item 3). Unit tests still failing, all owned elsewhere and
    failing before 1b: `influenceAndUndo` 20 tiles and `ruleFileTables` influence actions and
    build pass price (19), `quests.test.tsx` and `ruleFileTables` quests (6), `parseRulebook`
    (18), `reportBudgets` B19 (9); required scenarios and the 13 harness:check problems as 1a
    lists them.
- [x] 2. **F exact and Support** (R2.4, R11.5, I28, I30, finding 27, Q177's F rule). **Medium.**
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
  - **Done (2026-11-23).** F was already counted from every source in 1a (starting funds,
    income, positive stats gain, projects, quests, influence actions, draws, marketplace cards;
    selling and redraws add nothing; undo restores the seat). Support is `src/rules/supportOf.ts`
    (per seat) and `withSupport.ts`, applied in `endMainPhase.ts` after the end-of-turn steps,
    the build pass and the first-completion funds of every seat, before the market phase; it
    writes a `support` entry (funds in tenths) to the public log at once, in player order, and
    the view carries `supportThisTurn` (tenths, 0 if none) for every seat, own and others, from
    those log entries (`supportThisTurnOf.ts`). The log reads "<name> got Support: +2.0"
    with the funds icon. I30 is `worthGainedSumViolations.ts`: after each action, each seat's
    F must change by 10 per card gained (new `draw`/`turn_draw` log entries, +1 for a market
    card) plus the funds received (the funds change, plus funds paid for a card, a trade or a
    draw action, minus selling, plus what the zero floor took at a turn change); after an undo
    it must equal the F of the restored point. I30 is in `SIMULATED_INVARIANTS` and found
    nothing in the check's simulated games. The four Support scenarios and the stats gain one
    pass (the two that expect Support failed before).
  - **Differs from the phase file.** `seatsInPlayerOrderOf` now takes only seats and first
    player, so Support can use it before the state is built. Because
    `invariantViolations.test.ts` sat at its 300-line limit, its two I22 tests moved
    unchanged into `gameEndViolations.test.ts`; its tests of made-up transitions now also
    expect the I30 line their states cause.
  - **For later items.** Item 12 reads Support from `supportThisTurn` per seat (or the
    `support` log entries of the current turn) and builds `last_turn`; visibility's "the
    view shows last turn's quests projects income and Support" is still `not_yet` on
    `last_turn`. Item 3: removing the first-completion funds needs no change to Support or
    I30 (both read funds as they are). Item 7: the tie-break scenarios read F; Support
    already counts in it.
- [x] 3. **Projects, end goal and build passes** (R1.3, R16.3, R4.6, R6.3, S6.3, S8.2, findings
  6, 26, 48, 49). **Small.**
  - Delete `firstCompletionFundsOf.ts`, `firstCompletionsOf.ts` and the first-completion state
    (`GameState.ts`, `setUpGame.ts`, `endMainPhase.ts`, `endGame.ts`) and the third-project
    extra; the pop-up's lines go (`ProjectsDialog`, `ProjectProgressList`, test builders
    `botViewWith.ts`, `roomUpdateWith.ts`). End goal income 20 (`gameEndViolations.ts` and the
    ending check). Turn 1 gives 2 build passes (`withTurnBuildPass.ts`).
  - Covers the new `projects` scenarios and "the end goal needs income 20 and all 3 projects";
    setup's "2 build passes" scenario is item 20's name.
  - **Done (2026-11-23).** `firstCompletionFundsOf`, `firstCompletionsOf` and
    `FIRST_COMPLETION_FUNDS` are gone, and `firstCompletions` left the state, the view, both
    schemas, the test builders and the scenario runner (`first_completions`). Every project
    gives income +1, funds +2, influence +3 and 1 card (`completeProject.ts`). `END_GOAL` is
    income 20, also in the end-of-game text. `setUpGame` gives 2 build passes in turn 1. The
    projects area and pop-up lost the first-completion lines and the third-project warning; the
    pop-up's intro and the help text say "every time" and "income 20" (S6.3), and the pop-up no
    longer takes the view or the names. The runner reads `ended.end_goal` (the seats that
    reached the end goal). The three new `projects` scenarios, setup's "2 build passes" and
    "the end goal needs income 20 and all 3 projects" pass (the last run as required locally);
    the first four failed before.
  - **Differs from the phase file.** `projectsThisTurn` stays on the seat (written by
    `completeProject`, cleared at the turn change, read by nothing now): item 12 can use it for
    last turn's projects, or remove it if it builds them from the log.
  - **For later items.** End-of-game's "reaching the end goal ends the game …" now fails only on
    its scores (item 7). Tutorial start's `build_passes` (item 16) is 2 now in the engine; the
    runner's tutorial reader still cannot read it. `e2e/combosAndProjects.spec.ts` expects
    "Funds 20.1" at turn 2 and `e2e/gameOver.spec.ts` "Income 20"; neither was run locally.
- [x] 4. **Undo for selling** (R7.2, R7.3, R7.4, finding 24). **Small.**
  - `sellCards.ts` becomes an undo point (`withUndoHistory.ts`, `undoLatest.ts`); undo moves the
    cards from the holding pile back to the hand and takes back the funds; F unchanged both ways.
  - Covers `undo`'s "undo takes back selling and puts the cards back in the hand".
  - **Done (2026-11-23).** `sell` is in `withUndoHistory`'s undoable actions. Undo is
    `src/rules/undoLatestAction.ts`: it restores the seat from its latest undo point (`undoLatest`,
    unchanged) and takes the cards that left the hand, other than those now in the city, back out
    of the holding pile (the last copy of each, so another player's sale of the same card stays).
    Funds and F come back with the seat. The undo scenario passes (it failed before); two unit
    tests in `undo.test.ts` cover a same-named sale by another player and an undone play after a
    sale.
  - **Differs from the phase file.** The required R7.4 scenario "nothing before an action that
    cannot be undone can be undone" used selling as the action that cannot be undone; a
    `HARNESS:` commit (recorded in Q178) puts a tier 1 draw action in its place, name kept.
  - **For later items.** Still failing after 3 and 4, none of them theirs: required scenarios of
    items 5 (the quest that leaves after its extra turn, the quests completed in the turn before,
    visibility's log scenario, tutorial turn 5), 6b (the 45 "completing … gives its reward" and
    "a type gained from one quest helps complete another"), 7 (the five score and tie-break
    scenarios of `end-of-game`, the three of `records-and-ratings`) and 16 (tutorial start's
    `build_passes`, which the runner cannot read yet); unit tests of items 9 (`reportBudgets`
    B19), 18 (`parseRulebook`, two) and 19 (`influenceAndUndo`, `ruleFileTables`, two).
- [x] 5. **Quests on the table** (R10.2, R19.3, R19.5 to R19.11, R20.9, I15, I16, findings 11,
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
  - **Done (2026-11-23).** `QuestOnTable` has `isInExtraTurn`; `QUEST_TABLE_RULES` has
    `turnsOnTableOfTier` (6, 5, 4), read through `turnsOnTableOf(quest)`. A quest is first
    completed this turn when it is not in its extra turn and some seat's `questsCompleted`
    names it (`isFirstCompletedThisTurn`), so undoing a completion needs nothing on the table.
    `endTurnForQuests`: an extra-turn quest leaves for good; a first-completed one gets its extra
    turn, or leaves for good in its last turn; an uncompleted one in its last turn goes back to
    the list after the refill. `completeQuest` adds +1 influence unless the quest is in its extra
    turn. `questsCompletedThisTurnOf` reads the turn's `completed_quest` log entries, so an
    extra-turn quest names only that turn's completers. The income gate is
    `src/shared/ruleFiles/incomeToPlaceQuestOf.ts` (the income some player needs: N − 2 for
    `income N`, 8 for projects) with `isQuestPlaceable` and `highestIncomeInGameOf`; refills
    and the starting table pick only placeable quests, and a tier whose quests are all held
    back counts as empty. None of this names a quest, so it holds for any `quests.txt` (6b).
    The view's quest places carry `isInExtraTurn` and `turnsLeft` by tier (1 in the extra
    turn). I16 also checks that no quest stays past its extra turn and that no quest was
    placed while held back (`questPlacementViolations.ts`). The rule file check counts only
    tier 1 quests placeable at starting income 3. The runner reads and writes `extra_turn`.
    Every `quests` scenario passes, the 45 reward scenarios, "a type gained …", visibility's
    two quest ones and tutorial turn 5 too; unit tests in `questsHeldBack.test.ts` use quests
    found by their needs, not by name.
  - **Differs from the phase file.** A `HARNESS:` commit (Q178) changes six `quests.yaml`
    scenarios that contradicted R19.7, R19.10 or R18.8 (names kept) and drops `HARNESS.md`'s
    unused given field `completed_this_turn`. `questTable.test.ts`'s Trading post now completes
    in its last turn (it relied on a completed quest leaving at once), and
    `applyTutorialAction.test.ts` expects influence 7 after T5.3, as T5.3 says.
  - **For later items.** Item 13: `QuestPlaceView.isInExtraTurn` and `turnsLeft` are ready.
    Item 6b: the quest code reads only kinds `income` and `projects` for the gate; any new
    requirement kind goes into `incomeToPlaceQuestOf`'s switch (the compiler asks for it).
    Still failing, none of them item 5's: required scenarios of items 7 (the five score and
    tie-break scenarios of `end-of-game`, the three of `records-and-ratings`) and 16 (tutorial
    start's `build_passes`); unit tests of items 9 (`reportBudgets` B19), 18 (`parseRulebook`,
    two) and 19 (`influenceAndUndo`, `ruleFileTables`, two). E2e tests not run locally.
- [x] 7. **Places and score** (R21.4, R21.5, R21.8, R21.9, A3.3, A3.4, S9.5, I22, findings 25,
  28). **Medium.** After 2.
  - `scoreOf.ts`, `SCORE_HUNDREDTHS.ts`, `cardsInHandScoredOf.ts`, `scoredEndingOf.ts`: no 870
    base and no turns part, whole funds only (tenths ÷ 10, rounded down). Places by end goal
    reached, score, F, player order of the final turn; players who left last (A3.4); R8.3's done
    order is still recorded but no longer breaks ties (`leavingPlaces.test.ts`, `endGame.ts`).
  - The end-of-game table shows each score part by part (view and screen, S9.5).
  - Covers the new `end-of-game` scenarios and the required score scenarios of `end-of-game`
    and `records-and-ratings`.
  - **Done (2026-11-24).** `SCORE_HUNDREDTHS` lost its base and turns part; `scorePartsOf`
    gives each part of R21.4 in hundredths (`ScorePartsInHundredths` in `src/shared/`) and
    `scoreOf` adds them up and rounds down. `PlaceResult` (and `GAME_RESULT_SCHEMA`) carries
    `scorePartsInHundredths`; a leaver's parts use their values when they left (A3.3). Places
    (`gameResultOf`): still in the game first, then end goal reached, score, F, the final turn's
    player order; leavers last, the first to leave last. `doneOrder` is still kept but breaks no
    tie. I22 (`gameEndViolations`) checks the same order without the base and turns. The
    end-of-game screen has a second table, "How each score adds up" (each part's points, the
    exact total), "The score is the total rounded down", and a line under the places table on
    how places are decided. All four new `end-of-game` scenarios (run as required locally) and
    the eight required score scenarios of `end-of-game` and `records-and-ratings` pass; they
    failed before. `e2e/gameOver.spec.ts` passes locally at all three sizes.
  - **Differs from the phase file.** The places table (now named "Places") lost its income,
    funds + hand and bonus-type columns, which S9.5 does not list; those values are in the score
    table as points. `PlaceResult` keeps `income`, `fundsAndHand` and `bonusTypePoints` for
    the game record. Browser tests counting the dialog's rows (`gameOver.spec.ts`,
    `leaving.spec.ts`, `playFullGame.ts`) now count the Places table's rows.
  - **For later items.** Item 11 adds Q, T, C, F to the Places table (`GameOverTable.tsx`), not
    to the score table. Client test fixtures build a `PlaceResult`'s parts with
    `src/client/testing/scorePartsAddingUpTo.ts`. Still failing in `npm run check`, none of
    them item 7's: tutorial start's `build_passes` (16); unit tests of items 9 (`reportBudgets`
    B19), 18 (`parseRulebook`, two) and 19 (`influenceAndUndo`, `ruleFileTables`, two).
- [x] 8. **Player icons** (A2.5, A2.6, A12.1, S1.8, S12.5, S12.8, B18, finding 22, Q175).
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
  - **Partial (2026-11-24), server done.** The folder is `player-icons/<artist>/<name>.svg` with
    `license.txt` at the top of the repository; a picture is named `delapouite/bat` (Q180, A2.5
    amended). `npm run harness:check` checks the folder (`checkPlayerIconFolder.ts`, tested on bad
    files) and writes `src/shared/playerIcons/PLAYER_ICON_PICTURES.ts` from it, failing once when
    it differed. Migration `0015_player_icons.sql` (`icon`, `icon_changes_ms`); new accounts get
    `randomPlayerIcon()`, older ones `iconOfOlderAccount(playerId)` (Q181). `Identity` and
    `SeatPlayer` carry `icon`, so rooms, ranked rooms and tutorials keep the icon a player joined
    with (`ROOM_SCHEMA_VERSION` 6, `TUTORIAL_SCHEMA_VERSION` 2). `POST /api/icon-changes`
    (`IconChangeRequest`, `IconChangeResponse`, `decideIconChange`: picture, contrast, then
    `ICON_CHANGE_LIMIT`; the username limit now shares `changeAllowedAtUnder`/`changesWithUnder`)
    and `/api/account` returns `icon` and `iconWait`. B18's busy day counts 200 icon changes
    (4,394 rows of 5,000). The five new `accounts` scenarios pass (run as required locally) and
    failed before ("cannot run yet").
  - **Next (client, a fresh builder).** Views: `RoomView.playerIconColors` and the tutorial's
    `playerIconColor` become each seat's `PlayerIconChoice` from the room's `SeatPlayer.icon` /
    `record.player.icon` (`updateFor.ts`, `tutorialUpdateFor.ts`, `SERVER_MESSAGE_SCHEMA`,
    `HostEvent`, `RemoteGameHost`, `ClientState`, `PlayerIconColors` context); then remove
    `src/server/room/playerIconColorOf.ts`, `PLAYER_ICON_COLOR_COUNT` and the letter
    (`playerIconLetterOf`). `PlayerIcon` draws the picture as a CSS mask in the picture colour on
    the background colour, loading the SVG only when shown (`import.meta.glob` over
    `player-icons/*/*.svg` with `?url`). The picker in `AccountSettingsDialog` (S12.5: every
    picture as a button named by the picture, two colour inputs, a preview, Save disabled with
    "These colours are too alike." under 3:1 from `areIconColorsTooAlike`, and the next allowed
    time from `iconWait`), posting to `/api/icon-changes`; rejection texts are in
    `REJECTION_MESSAGES`. Credits on the privacy notice (S12.8) from `playerIconArtistsOf` and
    `player-icons/license.txt?raw`. Browser tests for the picker and the privacy page.
  - Stopped (2026-11-24): done so far nothing more (the stop request was set when the client
    builder started); next the client part as in Next above; uncommitted changes: no.
  - **Done (2026-11-24), client.** `RoomView.playerIcons` and the tutorial update's `playerIcon`
    carry each seat's `PlayerIconChoice` (`PROTOCOL_VERSION` 29); the letter, the 12 colour
    tokens, `playerIconColorOf` and `PLAYER_ICON_COLOR_COUNT` are gone. `PlayerIcon` draws the
    picture as a CSS mask (`PlayerIconFace`, URL from `playerIconPictureUrl` with Vite's
    `new URL` pattern, so a picture loads only when shown). Account settings has a "Player icon"
    part with **Change icon** opening the picker (`IconSetting`, `IconPicker`); picture buttons
    are named "Bat by Delapouite" (Q182, two artists share file names). The privacy notice has
    "Picture credits" before "Your choices" (`PictureCredits`, `PLAYER_ICON_ARTISTS` from the
    licence, only artists with a picture). Unit tests `iconSettings.test.tsx`,
    `pictureCredits.test.tsx`; browser test `e2e/playerIcon.spec.ts` (also fetches the picture
    URL from the built bundle) and `privacyNotice.spec.ts` now expects "Picture credits"; both
    pass locally at all three sizes. The user box in the top bar still shows a letter: S2.3 does
    not call it a player icon.
  - **For later items.** Run `npm run db:migrate:local` before local browser tests (0015 is new;
    without it guest creation answers "The server did not answer"). Still failing in
    `npm run check`, none of them item 8's: tutorial start's `build_passes` (16); unit tests
    of items 9 (`reportBudgets` B19), 18 (`parseRulebook`, two) and 19 (`influenceAndUndo`,
    `ruleFileTables`, two).
- [x] 9. **Card tiles** (S4.1, S6.1, S6.4, B19, findings 14, 19, 29, 33). **Large.**
  - Small WebP pictures (about 100 px wide, at most 6 KB each, B19) made from the 240 photos in
    `src/client/assets/cards/` (11 MB; never ship them on tiles) by a build step or committed
    files, placed as `design/sketches/14-card-pictures/APPROVED.md` says, on hand, city and
    marketplace tiles. Fixed tile sizes, smaller text for long names, a test that all 240 names
    fit; 80% backgrounds. The hand sorted by sector, tier, card number (`useHandChoice`, the
    sorting of `src/client/sorting/`); unplayable hand cards dimmed from the view's mark;
    market cards show their turns left (Q178: counting the current market phase).
  - Any new dependency for the pictures goes into `open-questions.md` (CLAUDE.md 10).
  - **Done (2026-11-24).** Committed pictures in `src/client/assets/card-tiles/` (100 × 86 WebP,
    largest 4.2 KB, made by `npm run design:card-tiles` with the Chromium of `playwright-core`,
    no new dependency); B19 is checked by `tools/design-export/cardTilePictures.test.ts` (Q183).
    `CardTilePicture` on hand, city (also the opponent's detailed table) and marketplace tiles;
    `cardTileBackground` (80%); `cardNameSizeOf` picks 14, 12 or 11 px per kind from the name's
    length. Hand tiles 102 px high, city 140 × 94, marketplace 84 px high; hand and marketplace
    tiles are as wide as their column (S6.4 amended, Q183). The hand is sorted in the client
    (`handInListOrder`), unplayable cards dimmed with a filter. Marketplace cards show "2 turns
    left", "1 turn left" or "Leaves next turn" under the tile (S4.1 amended);
    `MARKET_PHASES_SHOWN` moved to `src/shared/`. Browser test `e2e/cardTiles.spec.ts` (all 240
    names in hand, city and marketplace tiles fit, one size per kind, screenshot `card-tiles`)
    passes locally at all three sizes, as do `marketPhase`, `handAndActionsScreens` and
    `gameScreenSizes`.
  - **For later items.** Hand and marketplace tiles are taller, so at 1280 × 720 the hand shows
    fewer rows while the stats panel still holds the Q, T, C, F boxes (item 11 moves them).
    Playwright's Chromium does not hyphenate (no dictionary), so long words break without a
    hyphen in screenshots; a browser with the dictionary hyphenates them.
- [x] 10. **The big card** (S6.5, S6.9, S6.10, findings 5, 9, 13, 20, 45, 47). **Medium.**
  - `BigCardBesideHand` and its parts: title bar in the stats bar's colour, more transparent;
    thin black image border; + and − signs per R3.4; Sell for the shown card with "Sell for
    1 fund?" as one sell action; a card-name combo's number names the card on pointing; the
    combos playing the hand card would make ready are highlighted, infinite ones with "×N"
    (from the view, never computed in the client; add to the view if missing).
  - **Done (2026-11-24).** The title bar and stats bar share the new `--color-sector-<sector>-bar`
    tokens (the sector colour at 55%; other panels are 80%); the photo has a 1 px
    `--color-big-card-photo-border`. Stat numbers are signed from `SECTOR_STAT_EFFECTS` (moved
    from `screens/cardSet/` to `components/` so `BigCard` can use it): "+5", "−3" (U+2212), also
    in the accessible names ("Workforce +5"). `SelectedCardButtons` adds **Sell** (disabled by the
    view's `sellRejection`); it asks "Sell for [funds 1]?" with **Keep card** and **Sell**, then
    sends `sell` with only that card. A card-name combo's number is a button, `NeededCardNumber`
    ("Card #183"), whose tooltip names the card, on every big card and in the card set.
  - **Differs from the note above:** S6.10 is worked out in the client (`combosReadyOnPlayOf`:
    the view's type counts plus the card's own types, minus the times already claimed), as S6.10
    itself says ("a lookup in the view and the card data"), like S6.9; no view or protocol
    change. Type-count combos that would be ready get S6.1's claimable colours (green; bright blue
    with "×N" when infinite); card-name ones keep S6.9's red. Unit tests
    `bigCardActions.test.tsx` and `cards.test.tsx`; browser test `e2e/cardNameCombos.spec.ts`
    (number tooltip, selling after asking) passes locally at all three sizes, as do
    `lookingAtCards` and `handAndActionsScreens`.
  - **For later items.** The big card now holds more buttons (the combo numbers): a test that
    counts the selected card's buttons must leave them out. `npm run check` still fails only on
    items 16, 18 and 19, as before.
- [x] 11. **Your counts and the tables** (S3.1, S3.2, S6.2, S9.5, S13.2, A3.2, findings 3, 17,
  21, 23). **Medium.** After 2.
  - A small "Your counts" table (Q, T, C, F and one "?" explaining them) above the opponents'
    quick summary tables; those boxes leave `YourStatsPanel`. T and the 5 most played types
    count types gained from quests for every viewer, others from the next turn (R5.4;
    `visibility`'s new scenario). Q, T, C, F in the end-of-game table and the game record
    (`records-and-ratings`' new scenario; `GameRecordSummary`).
  - **Done (2026-11-24).** "Your counts" (`OwnCountBoxes`) is the first thing in the Opponents
    panel, with the help button "What Q, T, C and F mean" (S3.3's text, `COUNTS_HELP`); the
    boxes left Your stats. T everywhere is the total of the view's type counts
    (`typeTotalOf`), so it and the 5 most played types include the types gained from quests;
    the view already held them back to the next turn for other players, so `visibility`'s new
    scenario passed before the change. The boxes are named "Quests completed", "Types", "Combos
    claimed" and "Total worth gained" everywhere (`SummaryCountBoxes`, `summaryCountEntriesOf`).
    The engine puts the counts (`SummaryCounts`, `summaryCountsOf`) into each `PlaceResult`
    at the game's end and `gameRecordOf` copies them into `SeatRecord.counts` (Q184); the
    end-of-game table has a "Q, T, C, F" column and the game record a "Q, T, C, F" row, "not
    recorded" for records saved before (counts `null`). No protocol or save version raise
    beyond the phase's one (the phase ships together). `records-and-ratings`' new scenario passes
    (run as required locally) and failed before ("got nothing"). Unit tests in
    `statsAndSummaryTables`, `opponents`, `gameOver`, `records` and `gameRecordOf`; browser
    test `countsAndPlayerIcons.spec.ts` (Your counts inside Opponents, its help, the screen
    `your-counts`) passes locally at all three sizes, as do `gameOver`, `matchHistory` and
    `gameScreenSizes`.
  - **For later items.** `combosClaimedCountOf` moved to `src/shared/`; test fixtures of a
    `PlaceResult` need `counts` (`NO_SUMMARY_COUNTS` in `src/shared/testing/`). The finisher
    adds the new screen `your-counts` to `docs/enforcement.md`. `npm run check` still fails only
    on items 16, 18 and 19.
- [x] 12. **The Last turn panel** (S5.5, S7.2, M3.5, M3.7, S16.4, finding 46, Q177's addition).
  **Medium.** After 2 and 5.
  - As `design/sketches/46-turn-notifications/APPROVED.md`: quests (with reward), projects,
    income gains and Support of the turn before, all from the view, with log lines. It replaces
    `QuestsCompletedLastTurnTable` and `useIncomeRiseNotice`. Covers `visibility`'s "the view
    shows last turn's quests projects income and Support"; leak test passes.
  - **Done (2026-11-24).** When the main phase ends, each income rise (income now minus income
    at the start of the player's main phase) becomes a public log line `income_gained` of the
    new turn, before the Support lines (`incomeGainEntriesOf`). `PlayerView.lastTurn` (quests,
    projects, income gains, Support; `LAST_TURN_SCHEMA`) is read from the log by `lastTurnOf`;
    `GameState.questsCompletedLastTurn` and `questsCompletedThisTurnOf` are gone. `LastTurnPanel`
    sits between the marketplace and the quests from turn 2 on (market and main phase), a region
    "Last turn" with four lists; empty turns say "Nothing new last turn.". The income notice and
    the completed-last-turn table are gone. The log line "Ann gained income: +1.0"; Support now
    "+1", a whole number (S1.9). The runner reads `view.last_turn` and `income_gained` log
    entries. `visibility`'s new scenario passes (run as required locally) and could not run
    before ("then view.last_turn").
  - **Differs from the note above (Q185):** the Projects completed title has no icon (each row
    has the project's stat icon); below 800 px of window height the panel is compact (about
    85 px; boxes scroll inside), so at 1280 × 720 the quests and the city keep about 110 and
    95 px. Unit tests `lastTurnPanel.test.tsx`, `mainPhaseLog.test.ts` (income lines); the
    income notice test now checks that no notice shows. Browser tests: `quests.spec.ts` checks
    the panel (screenshot `last-turn`) and now plays turn 4 before the quest leaves (it stays its
    extra turn since item 5, so the test failed before this item); `incomeNotice.spec.ts` became
    `endTurnHighlight.spec.ts`. Both pass locally at all three sizes. The screens
    `income-notice` and `quests-completed-last-turn` are removed from `harness/screens/`.
  - **For later items.** The finisher adds the screen `last-turn` to `docs/enforcement.md` if
    screens are listed there. `npm run check` still fails only on items 16, 18 and 19.
- [x] 13. **Quest turns left and the market countdown** (S5.1, S4.7, findings 15, 16).
  **Small.** After 5.
  - The big coloured number of `design/sketches/15-quest-turns-left/APPROVED.md` on
    `QuestCard` (red 1 in the extra turn); the big red countdown in `MarketplacePanel` during
    your market go, pulsing in the last 5 seconds (not with reduced motion), red border.
  - **Done (2026-11-24).** `QuestTurnsLeftBox` (an image named "3 turns left", "1 turn left")
    sits beside the quest's name and "Tier N"; its colour comes from `questTurnsLeftLookOf`
    (turns left and the quest's full time) and four `--color-quest-turns-left-*` tokens. The
    full time per tier moved to `src/shared/QUEST_TURNS_ON_TABLE_OF_TIER.ts` and
    `turnsOnTableOf` to `src/shared/`, so the client reads it (the engine reads the same).
    `MarketCountdown` (a timer named "Your market go 0:27 left", `clockText`, 32 px red) is in
    the marketplace header on your own market go only; in its last 5 seconds it pulses (only
    without reduced motion) and the marketplace outline turns red (`:has()`). Unit tests
    `questTurnsLeft.test.tsx` (all three tiers), `quests.test.tsx`, `clocks.test.tsx`; browser
    test `marketPhase.spec.ts` checks the countdown on your go and none on the other player's;
    it and `quests.spec.ts` pass locally at all three sizes.
  - **For later items.** At 1280 × 720 the marketplace header takes two rows while the
    countdown shows (30 seconds of your go); the second row of places needed scrolling there
    already.
- [x] 14. **Buttons and highlights** (S1.10, S6.1, S6.6, S3.2, findings 7, 18, 30, 31, 34).
  **Small.**
  - Claimed combos without card names; the Projects button highlighted while the view says a
    project can be completed, Claim all while its number is above 0; "Use influence" with the
    influence icon and amount; every button background at most 90% opaque (tokens).
  - **Done (2026-11-24).** The detailed summary table's claimed combos show only need and gain
    (`ComboNeed` takes an `owner`, `ComboOwner`); a claimed card-name combo reads "Farmers
    Market in their city" (Q186). **Claim all** is highlighted ("You have combos ready to
    claim") while its number is above 0, **Projects** ("You can complete a project now") while
    any of the view's `projectRejections` is null, both through `Button`'s `highlightReason`
    like End turn. **Use influence** shows the influence icon with your influence (named "Use
    Influence 3"). Every button with a background of its own mixes its colour at
    `--opacity-button-background` (90%, `tokens.css`); player icons and card tiles are left as
    they are (Q186). Unit tests in `combosAndProjects`, `combosList`, `iconsEverywhere`,
    `influenceAndUndo`; browser tests `combosAndProjects`, `influenceAndUndo`,
    `tooltipsOnFocus`, `handAndActionsScreens` and `cardNameCombos` pass locally at all three
    sizes.
  - **For later items.** Item 19: `InfluenceDialog.module.css`'s tile and draw backgrounds now
    use the 90% mix; keep it for the new tile colours. A unit test opening the influence pop-up
    names the button with the amount ("Use Influence 4").
- [x] 15. **Pictures and the browser tab** (S6.3, S8.2, S1.2, findings 1, 2). **Small.**
  - Project pictures from `design/assets/projects/` at about 600 px wide, at most about 80 KB
    each, in `ProjectsDialog` (lazy, not in the first screen's bundle); the logo of
    `design/assets/logo/` as the tab icon. Check the bundle budget.
  - **Done (2026-11-24).** No spec rule named the tab icon, so S1.11 is new (Q187). The
    pictures are committed 600 × 400 WebP files in `src/client/assets/projects/` (24 to 73 KB),
    made by `npm run design:project-pictures` (`makeProjectPictures.ts`, the card tiles' way);
    `projectPictures.test.ts` keeps each at 80 KB or less. `ProjectsDialog` shows each at
    150 × 100 px left of the project's text, an image named by the project's title, loaded
    lazily (`projectPictureUrl`). The tab icon is `src/client/assets/logo/logo192.png` linked
    from `index.html`. Initial download 199.37 kB of 300 (B14). Browser tests:
    `combosAndProjects.spec.ts` checks the three pictures load, `lobby.spec.ts` the tab icon;
    both pass locally at all three sizes. `npm run check` still fails only on items 16, 18
    and 19.
- [x] 16. **Tutorial messages and texts** (S15.2, T1.3 to T5.4, finding 8). **Medium.** After
  1b and 3.
  - Each message beside the area it highlights, with an arrow; the rest dimmed a little while
    it waits for Continue (`TutorialPage`). `TUTORIAL_TEXTS.ts` in tenths, without bonus, with
    2 build passes. The required `tutorial` scenarios pass (turn 4's name is item 20's).
  - **Done (2026-11-24).** The engine already started the tutorial with 2 build passes; only the
    runner's tutorial driver could not read `build_passes` (now in its seat fields), so tutorial
    start passes and every `tutorial` scenario passes. `TUTORIAL_TEXTS.ts` follows `tutorial.md`
    (T1.3 "You start with 2", T1.4 and T4.3 the end-of-turn gain in place of bonus, T5.3 the first
    completer's +1 influence, T5.4 income 20). `TutorialMessage` places the text box beside the
    highlighted parts (`useTutorialMessageLayout`, `tutorialMessagePlacementOf`): left of the
    column the part is in, and left of a big card shown beside the hand, its middle level with the
    part, inside the window, with an arrow (`TutorialArrow`) to it; with nothing highlighted
    (T5.4) it stays in the left column. While a step waits for Continue or Finish, the rest of
    the screen is dimmed except the highlighted parts (`TutorialDimmer`, an SVG with holes,
    `--color-board-tutorial-dim`). It reads the frames by `data-highlight-frame`, the big card by
    `data-big-card` and the columns by `data-tutorial-column`. Unit test
    `tutorialMessagePlacement.test.tsx`; `e2e/tutorial.spec.ts` checks the dimming on step 1 only,
    and the message, arrow and highlight side by side on steps 1 to 3; it passes locally at all
    three sizes (the screenshot `tutorial` shows the message with its arrow).
  - **For later items.** Locally the tutorial browser test failed once at 1280 × 720 under three
    workers with step 1 still shown after Continue, and passed in the three runs after; watch
    for it in the branch check.
- [x] 17. **Away at the start** (S2.2, finding 32). **Small.**
  - Find why your own badge shows away when a game starts (a bug of the code, Q178), fix it,
    with a browser test.
  - **Done (2026-11-24).** The cause: `publishReceived` read the room's live players before
    `replyToSocket` stored the sender's identity on its socket, so the answer to a newly opened
    socket's first message (the resync on connect) listed the sender among the away seats; the
    badge stayed "away" until the next update. `replyToSocket` now reads the live players after
    storing the identity. Browser test `connections.spec.ts`, "your own badge never shows you
    away when you open the game" (only seat 1 opens: Seat 2 shows away, Seat 1 does not),
    failed before at all three sizes and passes now, as does the rest of `connections.spec.ts`.
- [x] 18. **Rulebook** (rulebook, S14.2). **Small.**
  - The changed sections of `harness/spec/rulebook.md` show in the rules viewer
    (`PARSED_RULEBOOK.ts`, `statWordParts.ts`): no bonus, funds tenths, Support, projects,
    quests, ending, score. Mostly tests that the viewer shows them.
  - **Done (2026-11-24).** No code change was needed: the viewer already read the new
    `rulebook.md` (the bonus stat had left `statWordParts` in item 1b). `parseRulebook.test.tsx`
    expected the old stats table (a bonus row) and the old score formula; it now expects 8 stats
    ending with distribution and the new formula (income 6.5, quality 0.55, whole funds 0.2).
    New `rulebookChangedSections.test.tsx` opens the changed sections in the viewer and checks
    their text and icons: the goal (income 20, 3 projects), Your stats (no bonus, tenths, F),
    Stats gain and Support, Projects (8 of a stat, 10 income, the same reward every time),
    Quests (5 from turn 20, extra turn, Be first, turns by tier) and The end of the game (turn
    40, the score formula with its stat icons, whole funds, places by end goal and F).
- [x] 19. **Influence actions** (R15.1, S8.3, items 51, 52). **Small.**
  - `influence to fund` already is in `influence-actions.txt`: check it works with no new code
    (`influence`'s new scenario); the pop-up's tile counts in tests follow
    (`influenceAndUndo.test.tsx` expects 19 tiles). Tiles get one background for `no limit` and
    another for limited actions, and colours that show whether the action can be taken now,
    from the design tokens (`InfluenceDialog`, `TradeTile`).
  - **Done (2026-11-24).** `influence to fund` works from the file with no new code: the
    `influence` scenario "3 influence buy 1 fund as often as the player likes" passes (not yet
    required). The tests that counted the old list follow it: the pop-up has 20 tiles with
    "3 influence → 1 fund, unlimited uses" (`influenceAndUndo.test.tsx`), and the rulebook's
    influence table has it as row 2 (`ruleFileTables.test.tsx`). Tiles of limited actions have
    a blue background (`--color-board-trade-limited`, `-limited-off` when disabled), `no limit`
    ones keep the violet one (`--color-board-trade`, `-off`), both mixed at 90%; a tile you can
    take now has a green bar on its left (`--color-board-trade-ready`), besides its disabled
    state (`TradeTile` classes `limited` and `ready`; unit test "colours a tile by its limit
    and by whether it can be taken now"). `e2e/influenceAndUndo.spec.ts` passes locally at all
    three sizes with one worker (with two workers, two sizes timed out at different steps).
- [x] 20. **The 14 required names** (Waiting for the owner, Q178). **Small.** Only after the
  owner's answer.
  - One `HARNESS:` commit, recorded in Q178: the 6 renames (the scenario changed to the new rule
    under the new name, in its file and in `harness/required.yaml`) and the 8 replacements (old
    scenario deleted, the new one already written takes its place on the list), as the owner
    approves them. `npm run harness:check` then has no problems; lower the count in
    `harness.test.ts` by the deleted scenarios.
  - **Done (2026-11-23).** `npm run harness:check`: 537 scenarios, 0 problems;
    `harness.test.ts` counts 537. Renamed and passing now: turns-and-time's end-of-turn
    scenario (funds 10.2), tutorial turn 4 (funds 4.5), I10 (its text now states the lower bound
    1a's code checks). The two replacements of `turns-and-time` pass.
  - **Differs from the phase file.** The quests rename needed more than a name: the scenario now
    plays the extra turn (turn 4, with both turn draws and their random tiers) and expects the
    refill at turn 5.
  - **For later items.** Required scenarios of item 20's changes that still fail, each owned by
    the item that builds its rule: setup's "2 build passes" and the 3 project replacements
    (item 3); "undo takes back selling …" (item 4); quests' "leaves the table for good after its
    extra turn …" (item 5: the engine still refills at turn 4); the leaver's score 40 and the 2
    end-of-game tie-break replacements (item 7). Locally, the 3 `tools/route-tests/` files
    sometimes fail in the full check with "fetch failed: bad port"; they pass when run alone.
- [x] 6. **The new quest list** (R20.7, finding 10). **Small.** Only after the owner approves
  `docs/plan/phase-29b-quest-list-proposal.md` (or edits it).
  - Write the owner's list into `quests.txt` if it differs; then the "completing … gives its
    reward" scenarios (with the +1 influence of R19.10) and other scenarios naming quest
    contents follow it in a `HARNESS:` commit recorded in Q178; tests naming old quest values
    follow. If the owner changes Trading post, the tutorial (T0.7) follows too.
  - **Done (2026-11-23).** The owner approved the list unchanged, and `quests.txt` already held
    it, so it and the tutorial are unchanged. `quests.yaml` follows it (Q178): every reward
    scenario now differs from the engine only by the +1 influence; "tier 1 cards do not count
    …" and "Penthouses needs …" pass again. `quests.test.tsx` (Penthouses' need, Growing
    suburbs' row) and `ruleFileTables`' Market town row follow the new list and pass.
  - **For later items.** Item 5: the 45 "completing … gives its reward" scenarios and "a type
    gained from one quest helps complete another" fail only on influence (the +1 of R19.10);
    building R19.10 makes them pass. `e2e/quests.spec.ts`'s five-quest test needs no change
    (every quest there still has three parts).

- [x] 6b. **The final quest list** (R20.7, R20.8, finding 10, Q178). **Medium.** The owner replaced the approved list on 2026-11-23 with 51 quests: `docs/plan/phase-29b-quest-list-final.md` is the brief (the list, the owner's requirements and the format changes). Write the spec first (`HARNESS:` commit, R20.8: `N tier T <sector> cards` means exactly tier T and replaces the "tier 2 or 3" and "tier 3" forms; `N product` and `N distribution` become stat requirements), then `quests.txt`, the rule file check, the requirement code, the quest scenarios (new quests, the changed requirements; required names stay), the tutorial check T0.7 (its four quests are unchanged) and the screens and rulebook that show requirements. Run after item 5.
  - **Done (2026-11-23).** `quests.txt` holds the 51 quests in the owner's order (the 6 new
    ones last). `QuestNeed`'s `cards` kind has `tier: Tier | "any"` (was `lowestTier`) and
    `questNeedHave` counts exactly that tier; the `stat` kind reads `QuestStat` (workforce,
    quality, satisfaction, product, distribution). `questNeedsOf` reads `tier T` and rejects a
    tier outside 1 to 3; `questNeedLabel` writes "tier 2 Residential cards". Every `quests`
    scenario passes (87), and `undo`'s draw-reward one; T0.7's check is unchanged and passes.
  - **Differs from the phase file.** The rulebook's quest tables are per tier, so
    `ruleFileTables.test.tsx` expects the file's quests grouped by tier (the new tier 1 quests
    come after Supply chain there). `e2e/quests.spec.ts`'s five-quest test uses Penthouses in
    place of Public institutions, which now has two parts; not run locally.
    `harness.test.ts` counts 545 scenarios.
  - **For later items.** A quest requirement can now be `product` or `distribution`: screens
    showing need icons get them from `STAT_ICONS` (items 9, 13). Still failing in `npm run check`,
    the same as after item 5 and none of them 6b's: required scenarios of items 7 (five
    `end-of-game`, three `records-and-ratings`) and 16 (tutorial start's `build_passes`); unit
    tests of items 9 (`reportBudgets` B19), 18 (`parseRulebook`, two) and 19 (`influenceAndUndo`,
    `ruleFileTables`, two).
- [ ] Finish. The finisher adds the new scenarios of "Required scenarios" (not the 8
  replacements, which item 20 adds) and I30 to `harness/required.yaml`, then follows
  `phase-helpers.md`.
  - **Finisher (2026-11-24).** Added 30 scenarios and I30 to `harness/required.yaml` (the
    `projects` ones were already on it); `harness:check`: 545 scenarios, 0 problems. Local
    `npm run check` and `npm run harness` passed. GitHub run 45405672973: `check` and 6 of 7
    browser jobs passed (tutorial and `influenceAndUndo` specs included); screenshots copied into
    `harness/screens/`, `docs/enforcement.md` updated.
  - [x] **F1.** `browser-tests (full games, 2 players)` fails twice (run, then `gh run rerun
    --failed`): the 1280x720 game passes in 60 s, then the job hangs until the 15 minute action
    limit (no failure line is printed; the 1920x1080 or 2560x1440 game does not finish). 3 and 4
    player games pass at all sizes. Locally the same test shows the first test failing at 0 ms and
    then hanging. A fixer must find where the 2 player game stalls (run it with one size and a
    trace).
    - **Fixed (2026-11-24), a test bug.** No game stall: the game reached turn 40, and the
      screen check `expectScreenFits` waited for every image on the page to be complete. Card
      tiles (`CardTilePicture`, new in item 4) and project pictures load lazily, so a tile far
      below the view in a long hand (seen at y 4400 at 1920 x 1080) never loads, and the wait,
      which has no time-out of its own, ran until the 15 minute limit. The check now waits for
      every image that is not lazy or that is in the view, which are all the screenshot shows.
      Locally the 2 player game passes at all three sizes (3.1 min, one worker).
  - **Phase review (2026-11-24).** Ready after fixes; `npm run check` and `npm run harness` pass,
    no spec deviation in the engine. Findings (besides F1):
    - [ ] R1. No icon picker screenshot (an exit criterion): `e2e/playerIcon.spec.ts` should call
      `expectScreenFits(..., "icon-picker", testInfo)` with the picker open; screens from the
      branch run into `harness/screens/icon-picker/`; name it in `docs/enforcement.md`.
    - [ ] R2. `projectsThisTurn` in `SeatState` is dead state (written in `completeProject`,
      `endMainPhase`, `newSeat`, read only by tests): remove it (the save version is already
      raised for this phase).
    - [ ] R3. `PROTOCOL_VERSION` raised twice (27 → 28 by 1a, → 29 by item 8) though the phase
      ships as one deploy: set it back to 28, or correct the 1a note.
    - [ ] R4. `src/rules/undo.test.ts:52-64` puts "Pub" in two hands (R3.1: cards are unique):
      replace with two players selling different cards, the undo restoring only the undoer's card,
      asserting the exact holding pile and funds in tenths.
  - **Fixers.** Fixer 1: F1. Fixer 2: R1 to R4.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Planner | Opus, medium | 20 | 343,427 | 123 | blocked (owner answers) |
| Starter | Opus, medium | 3 | 97,090 | 23 | done |
| Builder 1a | Opus, medium | 20 | 203,436 | 89 | done |
| Builder 1b | Opus, medium | 21 | 144,132 | 78 | done |
| Builder 20 and 6 | Opus, medium | 18 | 163,483 | 67 | done |
| Builder 2 | Opus, medium | 18 | 198,477 | 108 | done |
| Builder 3 and 4 | Opus, medium | 23 | 163,360 | 91 | done |
| Builder 5 | Opus, medium | 20 | 182,764 | 97 | done |
| Builder 6b | Opus, medium | 14 | 162,084 | 82 | done |
| Builder 7 | Opus, medium | 14 | 142,701 | 61 | done |
| Builder 8 (part 1) | Opus, medium | 33 | 253,963 | 133 | partial |
| Builder 8 (client) | Opus, medium | 1 | – | – | stopped |
| Builder 8 (client) | Opus, medium | 25 | 179,426 | 103 | done |
| Builder 9 | Opus, medium | 24 | 201,107 | 123 | done |
| Builder 10 | Opus, medium | 21 | 176,425 | 111 | done |
| Builder 11 | Opus, medium | 26 | 183,004 | 101 | done |
| Builder 12 | Opus, medium | 25 | 222,059 | 125 | done |
| Builder 13 and 14 | Opus, medium | 27 | 196,501 | 111 | done |
| Builder 15 and 17 | Opus, medium | 17 | 137,505 | 72 | done |
| Builder 16 | Opus, medium | 32 | 166,083 | 99 | done |
| Builder 18 and 19 | Opus, medium | 14 (after a usage-limit pause) | 131,150 (after the pause) | 41 | done |
| Finisher | Sonnet, medium | 66 | 81,447 | 43 | partial (F1) |
| Phase reviewer | Opus, medium | 14 | 167,515 | 67 | done (4 findings) |
