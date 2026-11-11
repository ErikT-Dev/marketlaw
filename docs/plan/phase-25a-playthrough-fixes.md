# Phase 25a: Playthrough fixes

Status: in progress
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

- None. The owner approved the 5 renamed required scenarios (Q126) on 2026-11-11.

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

## Progress

- [x] 0. Start (2026-11-11): the branch already held the spec and harness changes (Q126). The
  starter found two contradictions and solved them in one `HARNESS:` commit (Q127): R9.6 now
  tells a turn draw sent for a go that has ended (rejected) from the turn draw left open
  (R18.16), and invariant I24 follows each player's own main phase. No other question is open.
  - Until items 1 to 5 are all built, `npm run check` fails in `harness.test.ts` on required
    scenarios that need later items; a builder reports which still fail and why, not a failure
    of its own item. Each builder checks that its own item's scenarios pass (adding them to the
    required list locally, not committed) and fail without the change.
  - **One raise each for the phase**, done by item 1 (the first shape change) and not again:
    `PROTOCOL_VERSION` 16 to 17 (`src/shared/PROTOCOL_VERSION.ts`, Q75) and
    `SAVE_SCHEMA_VERSION` 16 to 17 (`src/rules/SAVE_SCHEMA_VERSION.ts`; rooms saved before
    close on load, D1). Later items change shapes under the same versions, since the phase ships
    together.
  - Items 1, 2a, 2b, 3 and 4 touch the same clock and phase code: build them in that order. 5, 7
    and 8 are independent. 6 needs 2b (what is revealed when the main phase ends). 9 needs 1 to
    3; 11 builds its own view field; 10 and 12 are client only.
  - Scenarios per item (for the local required-list check): `turns-and-time` new and renamed,
    `connections-and-leaving` (except the market-go one), `end-of-game`, and `visibility` "an
    opponent's out of time status is shown live" belong to 1; `marketplace` "a player who has
    had their market go plays a card ...", "rejects a main-phase action from a player still
    waiting ...", "a player's main-phase time starts when their own market go ends" and
    `visibility` "a main-phase action is hidden from a player still waiting ..." to 2; the
    `marketplace` time-out scenarios (no draw, sector later, `out_of_market`, at the action
    limit, "takes option B with a random sector"), `connections-and-leaving` "an away player's
    time runs out on a market go ..." and `visibility` "a turn draw left open is shown ..." to
    3; `combos-and-income` (3) to 4; `quests` "goes back into the quest list" and "cannot fill a
    place in the refill" to 5; the 4 `visibility` log scenarios to 6; `quests` "the quests
    completed in the turn before ..." to 7; `accounts` (3) to 8.

- [x] 1. **Time per turn and players out of time** (R9.1, R9.2, R9.4, R9.6, R9.10, R9.11, R9.13,
  R8.4, M5.3, M5.4, M6.10). **Large.**
  - Done (2026-11-11). Every item-1 scenario passes, except two that need item 3's open turn
    draw (`turns-and-time` "a message received at the deadline ...", which reads seat
    `turn_draw_pending`) and "a game paused for 24 hours is abandoned" (reads `ratings`, phase
    26). Still failing required scenarios after item 1: those of items 3 and 8 only.
  - As built: `GameKind` (`src/shared/GameKind.ts`) is in `GameSetup` and also in `GameState`
    (`state.kind`, copied by `setUpGame`), because the engine and the scenario runner work on
    the state. Seat field `isOutOfTime` (reset at the turn start); `endMainPhaseIfAllDone`
    first makes out-of-time seats done in player order once nobody plays with time left, so End
    turn, a time-out and leaving all reach it. `endTurn` lost its `isTimeOut` option. The
    `timed_out` notice is `TimedOutNotice` with `gameKind: "ranked"` (counts) or `"casual"`;
    the room sends the casual one when a seat becomes out of time. The test room reads an
    optional `kind` and `isOutOfTime`.
  - `connections-and-leaving` "ranked games cannot be abandoned by vote" (phase 26, not
    required) now runs, because the room runner reads `kind: ranked`, and fails instead of
    "not yet".
  - Browser tests: `clocks.spec.ts` is now the casual "keeps playing" test; the 3-time-outs
    abandonment test in `leaving.spec.ts` runs a ranked test room.
  - For later items: `receiveAction` rejects `out_of_time` only when the sender's own time-out
    is due on its market go (`marketGoOf`); item 2a must change that test to "the seat is on its
    go". `hasTimedOutThisDecision` now only blocks in the market phase.
  - Times: `src/rules/TIME_RULES.ts` (main free time 75 s; one go limit of 40 s replacing
    `firstGoLimitMs` and `goLimitMs`; main limit 210 to 330 s), `mainPhaseLimitMs.ts`. The
    free time again after a pause is the new main free time (R9.13, `ClockGrace.ts`).
  - Out of time: a seat field, set by `timeOut.ts` in the main phase instead of making the seat
    done; `dueTimeOuts.ts` and `earliestDeadline.ts` skip seats out of time. After each accepted
    action and time-out, seats out of time are made done, in player order, once no other seat
    still in the game is playing with time left (a seat still waiting for its market go counts
    as playing). Reuse `endMainPhaseIfAllDone.ts` and the done-order code (R8.4).
  - `receiveAction.ts`: a message that triggers its own seat's time-out is rejected
    `out_of_time` only on a market go; in the main phase the time-out is applied and the action
    then taken as normal (R9.6; `caughtUp` keeps the time-out, I27). `hasTimedOutThisDecision.ts`
    no longer blocks main-phase actions (item 3 handles the turn draw left open, Q127).
  - Game kind: the engine needs it (the 3-time-outs rule is ranked only). Add `kind: "casual" |
    "ranked"` to `GameSetup.ts`; the room passes `RoomGame.kind` (every live game is casual until
    phase 26); the engine driver reads the scenario's `kind`. In casual games `timeoutsInARow`
    is not counted. Ending the turn after running out does not reset the count; only ending in
    time does (R9.11).
  - Notice: the `timed_out` notice (`src/shared/Notice.ts`) gets its casual form
    (`keep_playing`); `timeOutText.ts` for both forms (S9.4 wording; the rest of the screen is
    item 9).
  - View: each seat's out-of-time status, public and live (`seatShownTo.ts`, the server message
    schema). Runner: seat and view `out_of_time`, `kind` in engine-driven scenarios, notice
    `keep_playing` (`tools/harness-runner/engine/GIVEN_SCHEMA.ts`, `seatFromGiven.ts`,
    `seatThen.ts`, `viewThen.ts`); `harness.test.ts` counts 486 scenarios.
  - Bots and simulator: a bot out of time keeps acting or ends its turn; B3 must still hold.
  - Browser tests that wait for the old times: `e2e/clocks.spec.ts`, `e2e/leaving.spec.ts`
    (`FREE_TIME_MS` 75 000; leaving after 3 time-outs is ranked only now, so a casual test of it
    becomes "keeps playing"), `e2e/playMarketPhase.ts` (`LONGEST_GO_WAIT_MS` 40 000),
    `e2e/timeMove.ts`.

- [x] 2a. **Each player's own main phase: clocks and phases** (R4.1, R18.15, R9.1, R9.4, R17.7).
  **Large.**
  - Done (2026-11-11). `marketplace` "a player who has had their market go plays a card ..." and
    "rejects a main-phase action from a player still waiting ..." pass. "a player's main-phase
    time starts when their own market go ends" needs item 3: seat 1's go times out during the
    76 seconds and today still draws (random sector and tiers the scenario does not list); with
    those three random values added locally it passes, so the clock part is right.
  - As built: seat field `mainPhaseStartedAt` (`number | null`; set by `setUpGame` in turn 1 and
    by `takeTurnDraw` when the seat's go ends, null at the turn start). `isInOwnMainPhase.ts`
    (game phase `main`, or `market` and `hasHadMarketGo`); `decisionOf.ts` gives each seat's
    current decision (start, free time, limit), used by `decisionClockOf.ts`, by `resumeGame.ts`
    (moves every seat's start by the pause; free time again per seat's decision) and by
    `apply.ts` (a grace entry is kept while that seat's decision is the same, no longer cleared
    for everyone when the go changes). `timeOut.ts` and `seatsLeavingAt.ts` treat only the seat
    on its go as a market go. `turnRejectionOf.ts` accepts main-phase actions after the go.
    `leaveGame.ts`: a seat in its own main phase leaving puts its hand in the holding pile; the
    last seat leaving on its go ends the main phase if everyone else is done. I2 now means
    outside every seat's main phase. `viewFor` shows `phase: main` to a seat in its own main
    phase (`phaseShownTo.ts`); the client already opens the main-phase screen from that (S4.4),
    so `e2e/marketPhase.spec.ts` now expects the main phase right after the go.
    `hasTimedOutThisDecision.ts` no longer blocks a seat in its own main phase. `takeTurnDraw`
    empties the seat's `drawnThisPhase` at its go's end (an undo after the go would otherwise
    bring back the turn draw cards); `endMarketPhase` still empties it for everyone.
  - Scenario runner and test rooms: `withClocksStartedAt.ts` sets `clockStartedAt` and the start
    of every seat already in its main phase (`stateFromGiven.ts`, `startTestRoomIn.ts`);
    `GAME_STATE_SCHEMA` reads an optional `mainPhaseStartedAt`.
  - Differs from the phase file: **bots still wait until the market phase is over**
    (`legalBot` decides by `view.marketGo`). With them acting at once, the simulator broke I23
    (a waiting seat was sent a hidden card) and I24, because views during the market phase are
    still live; that is item 2b's work.
  - For later items: 2b switches `legalBot` back to `view.phase` once views follow R5.4/R5.5,
    and should then rerun the simulator. The `resumed` notice still carries one free time by
    game phase (`resumeNoticesBetween.ts`), wrong only when a pause catches a go and a main
    phase together. The market-phase screen for a seat after its go ("You have had your go this
    turn") is no longer reached; item 9 owns the screens.
  - The scenarios keep the game's `phase: market` while earlier players already act; the game
    phase becomes `main` when the last go ends. A seat is in its main phase once it has had its
    market go (`hasHadMarketGo`, R18.15); main-phase actions before that are rejected
    `wrong_phase` (`turnRejectionOf.ts`). In turn 1 every seat starts at once.
  - Each seat has its own main-phase start time, replacing the shared `clockStartedAt` for
    main-phase clocks: `decisionClockOf.ts`, `mainPhaseLimitMs.ts`, `dueTimeOuts.ts`,
    `earliestDeadline.ts`, `PausedClock.ts`, `pauseGame.ts`, `resumeGame.ts`. Still one room
    alarm, at the earliest deadline (B3: market goes + players + 2 per turn).
  - Cards sold in a seat's main phase go to the holding pile while market goes still draw from
    the real deck and discard pile (R17.7, R18.15). Invariant I2 (holding pile empty outside the
    main phase) then means outside every seat's main phase.
  - Bots act in their main phase as soon as their go ends (`src/bots/legalBot.ts`,
    `chaosBot.ts`, `ownSeatOf.ts`; they read the view, so the view says the seat's own phase).
  - The view's phase for the viewer (S2.1, the top bar shows your own phase; the screen is
    item 9).

- [x] 2b. **Each player's own main phase: what each seat sees** (R5.4, R5.5, R17.7, R17.8, M3.2,
  M3.3; invariants I23 and I24 as reworded in Q127). **Large.**
  - Done (2026-11-11). `visibility` "a main-phase action is hidden from a player still waiting
    ..." passes (and fails without the change); the two item-2a `marketplace` scenarios still
    pass. Bots act in their main phase as soon as their go ends (`legalBot` by `view.phase`);
    the simulator (50 games in the check, 1,000 in `npm run harness`) finds no violation.
  - As built: `MainPhaseStart` is `{ seats, piles, marketGos }`: `seats` and `piles`
    (`SeatPilesAtStart`) hold each seat's state and the real piles when its own main phase
    started, in start order, so `piles[0]` is the turn's first main-phase start;
    `marketGos` (`MarketGoDraws`) records each go's draw-log range and the cards it drew.
    `withOwnMainPhaseStart` adds one seat (`takeTurnDraw` at the go's end; `endMarketPhase`
    for seats not started yet, such as left seats); `withMainPhaseStart` starts every seat
    already in its own main phase (empty at a turn's start). `pilesStartShownTo` picks the
    viewer's own start or else the first; `pilesShownTo`, `kindTiersLeftAsSeenBy` and
    `cardsDrawnSinceStart` follow R5.5. `endMarketPhase` no longer empties `drawnThisPhase`
    of seats already in their main phase.
  - Room: `isChangeVisibleToAll` counts a market-phase change as public only when the market go
    moves (I25), no longer every market-phase change.
  - The `resumed` notice carries each paused seat's own free time
    (`seats: [{ seat, freeMs }]`, `SeatFreeTime`; `resumedNoticeText.ts`).
  - Differs from the phase file: R5.5 now also says where a market-go draw of a card still shown
    in the discard pile comes off (Q128, `HARNESS:` commit).
  - For later items: item 3's time-out on a go that draws nothing must still call
    `withOwnMainPhaseStart` for the seat (as `takeTurnDraw` does); an open turn draw in the main
    phase is a `turn_draw` entry outside every `marketGos` range, so it is already hidden from
    others until the main phase ends. Item 6's log entries can use `mainPhaseStart.seats` as each
    seat's state at its own start.
  - `MainPhaseStart.ts` and `withMainPhaseStart.ts` become per seat: each seat's snapshot at its
    own main-phase start, and the piles as at the turn's first main-phase start. A seat on or
    before its go is shown live (`seatShownTo.ts`).
  - Piles (`pilesShownTo.ts`, `kindTiersLeftAsSeenBy.ts`): from the viewer's own start, minus
    later market-go draws, plus own draws and shuffles, plus market-go shuffles; a waiting seat
    sees the turn's first main-phase start plus the goes since (R5.5). Market-go draws and their
    shuffles are public at once in the draw log, also to seats in their main phase.
  - Simulator checks: `tools/simulator/shownPilesViolations.ts`, `whatSeatsSeeViolations.ts`,
    `shownPiles.test.ts`; the leak test (I23) with players in their main phase while others
    still have their go. I25: a seat's state version moves with the market-go draws it sees.

- [x] 3. **Turn draw left open** (R18.11, R18.16, R8.5, M3.3, R9.6 as in Q127). **Large.**
  - Done (2026-11-11). Every item-3 scenario passes (checked with them on the required list
    locally), as do `marketplace` "a player's main-phase time starts when their own market go
    ends" and `turns-and-time` "a message received at the deadline ..."; they failed without the
    change. Only `accounts` "at most 4 times in 7 days" (item 8) still fails in
    `harness.test.ts`.
  - As built: seat field `isTurnDrawOpen` (runner: `turn_draw_pending`; reset at the turn
    start). `endOwnMarketGo.ts` ends a seat's go (shared by `takeTurnDraw` and the go time-out in
    `timeOut.ts`, which draws nothing and opens the draw). `takeTurnDraw` takes an open draw as a
    plain option-B deck draw (no go recorded, no clock change, kept in `drawnThisPhase`).
    `turnRejectionOf` accepts `turn_draw` while open, in any phase and at the action limit;
    `rejectionOf` answers option A `out_of_market`. `withUndoHistory` blocks undo after an open
    draw. The view needs no new field: the own seat's `turnDrawRejection` is null while the draw
    is open and `marketCardRejection` is `out_of_market`; `legalBot` takes it first in its main
    phase. `MiddleColumn` highlights the marketplace only before the go. The `out_of_market`
    text follows S16.3.
  - "On becoming done": `settleBeforeDone.ts` (open draw with a random sector), called by
    `endTurn` and for each seat made done in `endMainPhaseIfAllDone` (player order). Item 4 adds
    the combos there, after the draw.
  - Differs from the phase file: the runner read `then.marketplace` as all 8 places, so two
    item-3 scenarios that list one place could not match; it now reads it like `given` (Q129).
  - For later items: item 9's open-turn-draw screen (S4.6) can use `hasHadMarketGo` together
    with `turnDrawRejection === null`.
  - A time-out on a market go draws nothing (`timeOut.ts`, which today takes option B with a
    random sector through `takeTurnDraw.ts`); the go passes on (`marketGoOf.ts`), the seat's
    main phase starts (item 2a), and a seat field marks the turn draw open (runner: seat
    `turn_draw_pending`).
  - `turn_draw` option B is accepted in that seat's main phase while open: not counted in
    `actionsThisTurn`, allowed at `ACTION_LIMIT`, cannot be undone (draws block undo,
    `withUndoHistory.ts`), hidden from others until the main phase ends like a main-phase draw
    (its shuffle as R17.8 says). Option A is rejected `out_of_market`.
  - Q127: a turn draw that itself triggers the go's time-out stays `out_of_time`; one based on a
    state version from before a time-out the alarm applied is `stale_state` in the room
    (`src/server/room/handleMessage.ts`); no engine change is needed for that.
  - When the seat becomes done with it still open (End turn or made done), it is drawn with a
    random sector at that moment, before item 4's combos; not for a seat that leaves. Put the
    "on becoming done" steps in one helper that item 4 extends.
  - Bots take an open turn draw in their main phase.

- [ ] 4. **Combos claimed on ending** (R8.5, R12.6, R13). **Small.**
  - In item 3's "on becoming done" helper, after the open turn draw: every ready combo claimed as
    by claim all (`claimAll.ts`, `readyCombosOf.ts`), with its income (`takeIncome.ts`); no
    action counted, also at the limit; never for a seat that leaves (`leaveGame.ts`). Both End
    turn (`endTurn.ts`) and being made done (item 1).

- [ ] 5. **Expired quests not drawn straight back** (R19.7, R10.2, R11.2). **Small.**
  - `endMainPhase.ts` calls `refillQuests(endTurnForQuests(state), ...)`, and
    `endTurnForQuests.ts` puts expired quests into `questList` before the refill. Return them
    after `refillQuests` instead. Both happen in one transition, so I15 (each quest in one
    place) holds after every action; in the final turn the game ends instead of starting a new
    turn, so no quest is left nowhere.

- [ ] 6. **The game log** (M3.7, R5.7, S7.1, S7.2). **Large.**
  - State: new log entry kinds beside `src/shared/DrawLogEntry.ts` (card played, quest
    completed, project completed, influence action: trade, build pass or skip build), each with
    turn and seat, written per seat in player order when the main phase ends
    (`endMainPhase.ts`), so undone actions never appear (from the turn's accepted actions minus
    the undone ones, or from the seat's changes since its main-phase start). Draw actions stay
    draws.
  - View: the entries are written when the main phase ends, so nobody sees them before. Runner:
    log items `played`, `completed_quest`, `completed_project`, `influence`
    (`tools/harness-runner/engine/matchingLogEntries.ts`, `absentLogItems.ts`).
  - Client: the tab is **Log**, the panel the **game log** (`DrawLogAndChatPanel.tsx`,
    `DrawLogList.tsx`, `drawLogRows.ts`, `drawLogText.ts`), stats as icons (S1.6).
    `e2e/drawLog.spec.ts` follows the rename.
  - Budgets: B13 (saved room size) and B11 must still pass; Q126 measured about 4 KB more.

- [ ] 7. **Quests completed last turn** (R19.6, M3.5, S5.5). **Small.**
  - At the end of each turn the state keeps the quests completed that turn, with tier and the
    seats that completed them (read before `endTurnForQuests.ts` removes them); the view carries
    it as is (public). Runner: view `quests_completed_last_turn`.
  - Client: a small table next to `QuestsPanel.tsx`, shown only when the list is not empty.

- [ ] 8. **Four username changes in 7 days** (A2.4, S12.5, S16.3). **Small.**
  - D1 migration `migrations/0013_...sql` replacing `players.username_changed_ms` with the times
    of the recent changes, in the same row (for example a JSON text column of at most the last 4
    times), so a change is still one row written. `src/server/renamePlayer.ts` (its conditional
    `UPDATE` becomes "fewer than 4 in the 7 days before"), `findRenameAccount.ts`,
    `RenameAccount.ts`, `api/usernameChangeRoute.ts`, `api/accountRoute.ts` (`usernameWaitOf`:
    the next allowed date only after 4 changes).
  - Runner: account `username_changes_ms` replaces `last_username_change_ms`
    (`tools/harness-runner/lobby/LOBBY_GIVEN_SCHEMA.ts`, `LOBBY_NESTED_FIELDS.ts`,
    `LobbySession.ts`). Client: account settings (S12.5) and the `username_change_too_soon`
    text (S16.3); `e2e/usernames.spec.ts` and `e2e/accountSettings.spec.ts` follow.

- [ ] 9. **Market phase screens** (S2.1, S2.2, S2.3, S4.3, S4.4, S4.5, S4.6, S6.7, S9.4).
  **Large.**
  - `MarketPhaseBanner.tsx` and `GameTopBar.tsx` (phase green on your go, your own phase);
    `MarketplacePanel.tsx`, `MarketSlot.tsx`, `MarketGoPanel.tsx`: a click selects, **Draw**
    under the selected card takes it (S4.3); `ActionsPanel.tsx` and the city open when your go
    ends (S4.4); the open turn draw's sector buttons and text (S4.6, reuse `SectorButtons.tsx`);
    `YourClock.tsx`, `orderBadgesOf.ts`, `OpponentCard.tsx` for out of time (S2.2, S2.3, S3.1,
    S6.7); `timeOutText.ts` and `GameNotices.tsx` for the ranked and casual notices (S9.4).
    `e2e/marketPhase.spec.ts` and `e2e/playMarketPhase.ts` click **Draw**.
  - Screenshots: the market banner on your go, a marketplace card selected with **Draw**, the
    open turn draw, a player out of time.

- [ ] 10. **Every card in the big card** (S4.1, S6.5, S3.2, S14.3). **Large.**
  - Marketplace cards, your city and another player's board open the big card (base cost and
    Close only; inside `OpponentBoardDialog.tsx` for another city). Reuse phase 20a's big card
    switch (`SelectedCardPanel.tsx`, `BigCard.tsx`, `HandSwitch.ts`, `bigCardSwitch.test.tsx`);
    it must stay within its 100 ms browser budget (`e2e/bigCardSwitch.spec.ts`).
  - A doubled type (`doubleType1` in the card data) shown as its icon twice, on the big card and
    in the card set (S6.5). Screenshot: the big card showing a city card with a doubled type.

- [ ] 11. **Opponents and quests** (S3.1, S3.2, S5.1, R19.4). **Large.**
  - View: per quest place, which other seats could complete it now, decided on the server from
    the same check as `questRejection.ts` (in `questPlacesShownTo.ts`, beside
    `completeRejection`), judged on what the viewer may see of them (their shown state, R5.4).
  - Client: `OpponentCard.tsx` orange **Q** box and influence; `OpponentBoardDialog.tsx` indigo
    **T** (types of their cards in play, a doubled type twice, not quest-gained types; Q126) and
    green **C** (combos claimed, each claim of an infinite combo counts), the five basic stats
    with the workforce, quality and satisfaction table red while any is negative;
    `QuestsPanel.tsx` and `QuestProgressLine.tsx`: another player's negative stat only when the
    quest names it (your own line unchanged, Q126), bold orange names of the players who could
    complete it.
  - Screenshots: an opponent's board with the new boxes and stats, the quests panel with an
    orange name.

- [ ] 12. **End turn highlight and income notice** (S6.6, S16.4). **Small.**
  - End turn highlighted once you have played a card this turn (`hasPlayedThisTurn` in the
    view) until you end the turn. "Your [income icon] has increased!" with a close button,
    closing after 3 seconds, whenever your income rises between views (in the store or a hook,
    as `useFailedVoteNotice.ts` does). Screenshots: the income notice, and the
    completed-last-turn table (item 7) and the game log (item 6) if those items did not take
    them.

- [ ] 13. **Finish.** Finisher (first run adds the 27 scenarios to `harness/required.yaml`),
  review, fixes, finisher again, release.

### Finish

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Planner (findings into the spec, phase file; Q126) | 34 | 292k | 133 | done |
| Starter | 7 | 130k | 53 | done |
| Builder, item 1 | 26 | 211k | 100 | done |
| Builder, item 2a | 51 | 202k | 85 | done |
| Builder, item 2b | 27 | 182k | 81 | done |
| Builder, item 3 | 14 | 160k | 65 | done |
