# Phase 25a: Playthrough fixes

Status: approved
Milestone: 5 Accounts and ranking

## Goal

Everything the owner's playthrough of 2026-11-10 found (Q126): each player starts their main
phase as soon as their own market go is over, players who run out of time keep playing, more
time per turn, a fuller game log, more about opponents on screen, every card can be looked at,
and the smaller fixes. Built before the ranked queue, so ranked games start with these rules.

## Depends on

Phase 25.

## Covers

- Notes: `docs/playthrough-notes/2026-11-10-playthrough.txt`, all 12 findings (Q126).
- Rules: R4.1, R5.4, R5.5, R8.5 (new), R9.1, R9.2, R9.4, R9.6, R9.10, R9.11, R9.13, R10.2,
  R11.2, R17.7, R17.8, R18.11, R18.15 (new), R18.16 (new), R19.6, R19.7; M3.3, M3.5, M3.7 (new),
  M5.3, M5.4, M6.10; A2.4.
- Screens: S2.1, S2.2, S2.3, S3.1, S3.2, S4.1, S4.3, S4.4, S4.5, S4.6 (new), S5.1, S5.5 (new),
  S6.5, S6.6, S6.7, S7.1, S7.2, S9.4, S12.5, S16.3 (`username_change_too_soon`, `out_of_market`
  texts), S16.4 (new); the rulebook's turn, time, ending, marketplace and quest sections, as
  shown in the rules viewer.

## Start

The spec and harness changes for this phase are already written, in `HARNESS:` commits on the
branch `phase-25a-playthrough-fixes` (Q126). The starter checks out that branch instead of
creating it. On it, `npm run check` fails only in `tools/harness-runner/harness.test.ts`, until
the items below are built:

- the harness test still expects 459 scenarios (there are now 486);
- 24 required scenarios do not pass yet. 15 cannot run yet, because they use fields the runner
  does not read: seat `out_of_time` and `turn_draw_pending`, `kind` in a scenario the engine
  driver runs, and the account's `username_changes_ms`. 9 fail, because the code still has the
  old times (45 seconds of free time, market goes of 45 and 30 seconds, the old main-phase
  limit) and still makes a player done when their time runs out.

The 27 new scenarios are not on the required list yet; the finisher adds them (see Required
scenarios). They fail now for the same two reasons, or because the behaviour is not built.

## Builds

1. **Time per turn and players out of time** (R9.1, R9.2, R9.4, R9.6, R9.10, R9.11, R9.13,
   M5.3, M5.4, M6.10): the main-phase limit 210 + (turn − 1) × 120 ÷ 19 seconds, at most 330;
   75 seconds of free time; 40 seconds for every market go. A player whose main-phase time runs
   out is **out of time**: the time-out is applied and recorded as now, their actions are still
   accepted, and they are made done only once every other player still in the game is done or
   out of time (all at that moment, in player order). Only a turn draw after a market-go
   deadline is rejected with `out_of_time`. The 3-time-outs leaving rule and its "This was N of
   3" notice hold in ranked games only; in a casual game the `timed_out` notice says the player
   can keep playing. The view carries each seat's out-of-time status (public, live). The
   scenario runner reads seat and view `out_of_time`, `kind` in engine-driven scenarios and the
   notice's `keep_playing`; the harness test counts 486 scenarios. Large.
2. **Each player's own main phase** (R4.1, R5.4, R5.5, R17.7, R17.8, R18.15, M3.2): a player's
   main phase starts when their own market go ends; before that, main-phase actions are rejected
   with `wrong_phase`. Their main-phase limit and free time count from then, so each seat has its
   own main-phase start and deadline (one alarm for the room still, B3). What others see of a
   player is them as at the start of their own main phase; the deck and discard pile each seat
   sees follow R5.5 (from the seat's own start, minus later market-go draws, plus own draws and
   shuffles; a seat still waiting sees them as at the turn's first main-phase start plus the
   market goes since). Market-go draws use the real deck and stay public at once; their discard
   shuffles too. The leak test, the shown-piles and what-seats-see checks of the simulator, and
   the bots (a bot acts in its main phase as soon as its go is over) follow. Large; split it if
   it runs over three commits (for example clocks and phases first, then what each seat sees).
3. **Turn draw left open** (R18.11, R18.16, R8.5, M3.3): a time-out on a market go draws
   nothing; the go passes on, the player's main phase starts and their turn draw stays open as
   option B. The `turn_draw` action with option B is accepted in that player's main phase while
   it is open (not an action, allowed at the action limit, cannot be undone, revealed to others
   when the main phase ends); option A is rejected with `out_of_market`. If the player becomes
   done with it still open, it is drawn with a random sector at that moment, before the combos
   of item 4. The runner reads seat `turn_draw_pending`. Large.
4. **Combos claimed on ending** (R8.5): when a player becomes done, by End turn or by being made
   done, every ready combo is claimed first, as by claim all, with any income it brings; not an
   action, also at the action limit; nothing for a player who leaves. Small.
5. **Expired quests not drawn straight back** (R19.7, R10.2, R11.2): a quest that leaves after
   5 turns joins the quest list only after the start-of-turn refill. Small.
6. **The game log** (M3.7, S7.1, S7.2): when the main phase ends, the state's log gets, per
   player in player order, each card played, quest and project completed and influence action
   used (trades, build passes, skip build; draw actions stay draws), with the turn; undone
   actions never appear, and nobody sees the entries before the main phase ends. The panel tab is
   **Log**, the panel the **game log**, with stats as icons. The runner reads log items
   `played`, `completed_quest`, `completed_project` and `influence`. The budget measures stay
   within limits (Q126: about 4 KB more saved room, no extra rows or messages). Large.
7. **Quests completed last turn** (R19.6, M3.5, S5.5): the state keeps which quests were
   completed in the turn before and by whom; the view carries them; a small table next to the
   quests panel shows them, with tier, only when there are any. The runner reads view
   `quests_completed_last_turn`. Small.
8. **Four username changes in 7 days** (A2.4, S12.5, S16.3): accounts keep the times of their
   recent username changes (a D1 migration replacing the last-change time; still one row per
   change); a change is allowed while fewer than 4 were made in the 7 days before it; account
   settings shows the next allowed date only after 4; the new rejection text. The runner reads
   the account's `username_changes_ms`. Small.
9. **Market phase screens** (S2.1, S2.2, S2.3, S4.3, S4.4, S4.5, S4.6, S6.7, S9.4): the banner and
   the top bar's phase green on your go; a marketplace card is taken only with the **Draw**
   button under the selected card; the main-phase actions and your city open as soon as your go
   ends; the open turn draw's sector buttons and text; your clock and the badges show out of
   time; the time-out messages for ranked and casual games. Large.
10. **Every card in the big card** (S4.1, S6.5, S3.2, S14.3): clicking a marketplace card, a card
    in your city or a card in another player's board shows it in the big card (base cost and
    Close only; inside the board for another player's city); a type a card counts twice is shown
    as its icon twice, on the big card and in the card set. Large.
11. **Opponents and quests** (S3.1, S3.2, S5.1): the overview's orange **Q** box and influence;
    the board's indigo **T** and green **C** boxes and the five basic stats with the red/neutral
    workforce, quality and satisfaction table; in the quests panel, another player's negative
    stats only when the quest names them, and bold orange usernames of the other players who
    could complete the quest now, from a per-player "can complete" the server puts in the view.
    Large.
12. **End turn highlight and income notice** (S6.6, S16.4): End turn highlighted once you have
    played a card this turn; "Your [income icon] has increased!" with a close button, closing
    after 3 seconds, whenever your income goes up. Small.

Every item that changes a message's shape raises `PROTOCOL_VERSION` (Q75); one raise for the
phase is enough if the items ship together. Browser tests that wait for the old times (for
example `e2e/clocks.spec.ts`, `e2e/leaving.spec.ts`, `e2e/playMarketPhase.ts`) follow the new
rules. A scenario that turns out to contradict the new spec is changed in a `HARNESS:` commit
and recorded in Q126; one that only disagrees with the code is not.

## Known gaps after this phase

- The same as after phase 25: no ranked queue, ratings, ranking table, players online, menu,
  rules viewer, card set or tutorial yet; the rulebook changes show once phase 28 builds the
  rules viewer.

## What you can see when it's done

All 12 findings from your playthrough of 2026-11-10, on the live site: after your market go you
play at once, while the others still take theirs; the market banner is green on your go and a
marketplace card is taken only with **Draw**; a market go that runs out lets you choose the
sector yourself later; every turn has 30 seconds more, and running out of time no longer ends
your turn while others still play, nor throws you out of a casual game; End turn lights up after
you play a card and claims your combos for you; "Your income has increased!" appears; any card on
the table can be opened in the big card, with doubled types shown twice; the opponents show
quests, influence, types, combos and stats, and the quests show who could complete them; the log
shows cards played, quests, projects and influence; the quests completed last turn are listed;
an expired quest no longer comes straight back; you can change your username 4 times a week.

## Exit criteria

- Every scenario of this phase passes, and the 5 renamed required scenarios pass under their new
  names.
- The leak test passes with each player's own main phase (players in their main phase while
  others still have their market go).
- The budget checks pass, B3 (alarm changes per turn) and B13 (saved room size) included.
- Screenshots in `harness/screens/` of the market banner on your go, a marketplace card selected
  with **Draw**, the open turn draw, a player out of time, an opponent's board with the new
  boxes and stats, the quests panel with an orange name, the completed-last-turn table, the game
  log, the big card showing a city card with a doubled type, and the income notice.

## Open points

- None.

## Waiting for the owner

- **Confirm the 5 renamed required scenarios (Q126).** Findings 1, 7 and 9 change the numbers
  their names contained, so they were renamed together in the scenario files and in
  `harness/required.yaml`; the requirement itself stays. Nothing in this phase waits for the
  answer; if you disagree, say so and the names go back with the scenarios adjusted.

## Required scenarios

These 27 scenarios are added to `harness/required.yaml` in this phase, by file and name:

- `accounts`: a username can be changed 4 times in a row; a fifth username change is allowed
  once the first of the last 4 is 7 days old
- `combos-and-income`: ending the turn claims every ready combo first; ready combos are claimed
  at the end of the turn even at the action limit; a player made done when time runs out also
  gets their ready combos claimed
- `marketplace`: a time-out on the market go passes the go to the next player without a draw; a
  player whose market go timed out chooses a sector later and draws 2 cards; rejects taking a
  marketplace card after the market go timed out; a turn draw left open is allowed at the action
  limit and is not an action; a player who has had their market go plays a card while later
  players still have their go; rejects a main-phase action from a player still waiting for
  their market go; a player's main-phase time starts when their own market go ends
- `quests`: a quest that leaves after 5 turns cannot fill a place in the refill straight after;
  the quests completed in the turn before can be seen during the next turn
- `turns-and-time`: a player out of time is not made done while another player still has time;
  a player out of time is made done once every other player is done; a player out of time is
  made done when the last player with time left runs out too; a main-phase action after the
  player's time ran out is accepted while another player is still playing; in a casual game
  time-outs in a row do not count as leaving the game; in a casual game a player whose time runs
  out is told they can keep playing
- `visibility`: the log shows the cards each player played once the main phase ends; a card
  played in the main phase is not in the log before the main phase ends; an undone card play
  never appears in the log; the log shows the quests completed and influence actions used once
  the main phase ends; a main-phase action is hidden from a player still waiting for their market
  go; a turn draw left open is shown to other players when the main phase ends; an opponent's out
  of time status is shown live

These 5 required scenarios were renamed (Q126) and must pass under their new names:

- `turns-and-time`: the main-phase time limit in turn 10 is 4 minutes 27 seconds; the first
  75 seconds of a main phase do not use the time bank; the first player's market go has
  40 seconds; every later market go also has 40 seconds
- `accounts`: a username can be changed at most 4 times in 7 days

These 24 required scenarios now assert the new rules (Q126) and must pass again:

- `turns-and-time`: players made done at the same moment become done in player order; reaching
  the main-phase limit makes the player done; the time bank runs after the free time until the
  player ends their turn; with an empty bank a player only has the free time; a message received
  at the deadline is rejected and the time-out is applied; a message received just before the
  deadline is accepted; banks are shown rounded down to whole seconds; every player sees every
  other player's bank counting down during the main phase; three main-phase time-outs in a row
  count as leaving the game; a player whose time runs out is told how many time-outs in a row
  out of 3; ending the turn in time resets the time-out count; a deadline while nobody is
  connected pauses the game instead; a paused game goes on when a player reconnects and the
  timed-out player gets free time again; after the extra free time the paused player times out
  as normal; when two players' time would run out together while nobody is connected both get
  their free time again; a paused player's bank used before the pause stays used
- `connections-and-leaving`: an away player keeps their seat and their time runs as normal; an
  away player's time runs out on a market go as for any player; players who leave at the same
  moment leave in player order; if every player leaves at the same moment the game is abandoned;
  timers keep running during a vote
- `marketplace`: a time-out on the market go takes option B with a random sector
- `end-of-game`: players made done at the same moment in the final turn are placed in player
  order
- `quests`: a quest nobody completed in 5 turns goes back into the quest list
