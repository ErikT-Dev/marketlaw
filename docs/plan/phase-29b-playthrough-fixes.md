# Phase 29b: Playthrough fixes

Status: approved
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

Filled in by the starter.
