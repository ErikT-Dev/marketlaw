# Phase 20: Cost protection and the playthrough version

Status: in progress
Milestone: 3 Playthrough

## Goal

The daily limits that keep the site inside the Cloudflare Free plan, every budget measurable so
far within its limit, and a full end-to-end check of the playthrough version.

## Depends on

Phase 19. Decision O5 (game length) is made, and any resulting rule changes are built.

## Covers

- Rules: A9.1–A9.4 for rooms and games (the queue joins them in phase 26).
- Budgets: B1–B5, B9–B18 as far as their features exist, in `npm run harness`; B15 (time from a
  move to the updated view) in the browser tests; B18 in the busy-day simulator with the limits.
- Screens: S16.1 (daily limit notices). Design board "Notices: daily limits", without the ranked
  queue text it shows (`screens.md` S17).

## Builds

1. **Daily counts** per player and for the site, reset at 00:00 UTC; actions added when a game
   ends or the player leaves it; checked when joining a room and again when a game starts.
2. **Budget checks** in the report, each with its measurement and limit.
3. **Full browser tests:** complete games with 2, 3 and 4 players from the lobby to the end
   screen, with screenshots of every key screen in `harness/screens/`.
4. **Playthrough checklist** for the owner: what to try, in which order, with several people.

## Known gaps after this phase

- No chat, votes, rematches, registered accounts, records, ranking, menu or tutorial.

## What you can see when it's done

**The playthrough version:** 2 to 4 people, each on their own computer, play a complete game on
the live site from the lobby to the final score. Invited testers only (D6).

## Exit criteria

- Every measurable budget within its limit.
- Full-game browser tests pass for 2, 3 and 4 players.
- The owner has played at least one complete game with others and accepted the milestone.

## Open points

- Findings from the owner's playthrough become spec changes (with approval) or new phases before
  milestone 4 starts.

## Required scenarios

These 5 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `lobby-queue-and-limits` #24: a player who started 10 games today cannot start another
- `lobby-queue-and-limits` #25: after 50 games start on the site today no more games start
- `lobby-queue-and-limits` #31: the game start limit is checked again when a game starts
- `lobby-queue-and-limits` #32: a guest at 2000 actions today cannot join a room
- `lobby-queue-and-limits` #33: the daily action count resets at midnight UTC for joining a room

## Progress

- [x] 1. Start: branch `phase-20-cost-protection-and-playthrough`; O5 was already decided (D24).
  Decisions Q67 (where the counts live, what counts), Q68 (a game that cannot start), Q69 (the
  local site limit for browser tests), Q70 (budgets in the report, full browser games), Q71 (how
  the phase ends). Spec: `accounts.md` A9.2–A9.4 and `screens.md` S16.1 (commit `HARNESS: Daily
  limits ...`).
- [x] 2. **Daily counts in the lobby and the join check** (A9.1, A9.2, A9.3; scenarios
  `lobby-queue-and-limits` #24, #32, #33).
  - Q67: the counts live in the lobby record (`src/server/lobby/LobbyRecord.ts`,
    `LOBBY_RECORD_SCHEMA.ts`, `EMPTY_LOBBY.ts`): the UTC day number and, for today only, each
    player's actions and game starts, and the site's game starts. A record from an earlier day
    reads as zeros; no alarm, no write for the reset. The lobby has no clock yet: pass `now` in
    (the server uses `Date.now()` at the boundary; the lobby driver its scenario clock).
  - Check A9.2 (actions >= 2,000) and A9.3 (starts >= 10) in the same lobby step that claims the
    player (`Lobby.claim`, `src/server/lobby/claimPlayer.ts`), for joining
    (`src/server/api/joinRoomRoute.ts`) and creating (`createRoomRoute.ts`,
    `createInFreeRoom.ts`; creating counts as joining, A9.3). Reason codes `daily_action_limit`
    and `daily_game_start_limit` go into `src/shared/ReasonCode.ts`; a rejected claim must say
    which reason, not only "busy".
  - Harness: the lobby driver (`tools/harness-runner/lobby/`) needs the given fields
    `accounts[].actions_today`, `accounts[].games_started_today`, `site_games_today`, and
    `clock_ms` / `wait_ms` if it lacks them; `unchanged: true` in #32.
  - Keep `src/server/Lobby.ts` thin; new logic in files under `src/server/lobby/`.
  - Done: `LobbyRecord.today` (`CountsToday`: day, players with actions and gameStarts,
    siteGameStarts); `countsOn(record, now)` reads an earlier day as zeros; `dayOf`,
    `DAILY_PLAYER_LIMITS`, `dailyLimitRejection`. `claimPlayer` and `Lobby.claim` take `now`;
    `Lobby.claim` returns a `ClaimRejection` or null; `createInFreeRoom` returns a `Result`.
    A player already claimed for the same room is not checked again. A lobby record saved before
    this phase parses with empty counts (schema default), so live rooms keep their claims.
  - Differs: the two texts of S16.1 for a player's own limits are already in
    `REJECTION_MESSAGES.ts` (the compiler needs a text for every reason code), so the lobby shows
    them for a rejected join or create; item 5 only adds tests and the waiting-room notices. The
    lobby driver's `create_room` now claims the player in the lobby like the server does.
  - For later items: write counts by mapping `countsOn(record, now)` (never `record.today`
    directly, or yesterday's counts carry over). The lobby driver takes `clock_ms` and
    `accounts[].actions_today` / `games_started_today`; #31 now runs in it and fails until item 3
    (not required). `site_games_today` is not in the driver yet.
- [x] 3. **The check when a game starts** (A9.3, A9.4; scenarios #25, #31; Q68, Q69).
  - When the last player accepts (`src/server/room/roomActionOutcome.ts` calls
    `startRoomGame.ts`), the room asks the lobby, in one call, to check every player (A9.2,
    A9.3) and the site (A9.4) and, if all pass, count the start for the site and each player.
    The room then starts the game; otherwise it ends the asking (`RoomAsking`) as Q68 says: a
    player over their own limit is removed without a rejoin wait and gets the reason; at the
    site limit everyone stays, everyone gets `site_game_limit`, and the room asks again only the
    next time it becomes full (`withAskingIfFull.ts`).
  - The site limit is 50 unless the environment sets `TEST_SITE_GAMES_PER_DAY` (Q69). Set it to
    1000000 in the local `.dev.vars` (gitignored; append a line, never print the file's secrets)
    and in the `.dev.vars` step of `.github/workflows/check.yml` and `deploy.yml`. Follow how
    `TEST_ROOM_SECRET` is typed (`worker-configuration.d.ts`, `wrangler types`). Never put it in
    `wrangler.jsonc`.
  - Test rooms (`src/server/room/startTestRoomIn.ts`) do not count (Q67).
  - `src/server/GameRoom.ts` is about 320 lines, at the file limit: put the new code in files
    under `src/server/room/`.
  - Done: `Lobby.startGame(players, now)` checks and counts in one call (`countGameStart`:
    players first, then the site; `siteGameLimitOf(env)`). `GameStart.limitRejectionFor` is
    asked when the last player accepts (`startGameWithinLimits`). The room cannot wait for the
    lobby inside the pure message handling, so `receiveCheckingGameStart` first runs an
    `accept_game` message on a storage that keeps nothing to learn whether it starts a game, asks
    the lobby, then handles it for real with the answer. Removal reasons `daily_action_limit` and
    `daily_game_start_limit` (no rejoin wait); at the site limit the last accepter gets
    `rejected: site_game_limit` and the others a `site_game_limit` notice; everyone is updated.
    `MessageOutcome` now carries `removals` (other players removed by a room action) and
    `notices`. `nowMs` moved out of `GameRoom.ts` to keep it under 300 lines.
  - Differs: the compiler needs texts for the new notice and removal reasons, so
    `noticeToastOf.ts` and `removalText.ts` already show the S16.1 texts (from
    `REJECTION_MESSAGES`); item 5 still adds the waiting-room toast (the waiting room does not
    show game notices yet) and the tests. The lobby driver checks `message_to.text` through those
    client functions and reads a daily-limit removal as `rejected`.
  - For later items: the busy-day simulator and the simulator still pass
    `limitRejectionFor: () => null` (`tools/simulator/gameStartInJoinOrder.ts`); item 4 must
    count the start writes in the lobby for B18 (one `Lobby.startGame` write per game start).
- [x] 4. **Actions added when a game ends or a player leaves** (A9.2; Q67; B18).
  - A player's actions are the accepted actions with their seat in the game's action log
    (`SavedGame.actionLog`), except `time_out`, `pause_game` and `resume_game`. `leave_game` is
    the player's own move and counts. Added for every seat still in the game when it ends
    (including abandoned, M6, R9.14), and for a player when they leave (Leave game or 3 time-outs,
    R9.11). `SeatPlayer.acceptedActionIds` is capped, so do not count from it.
  - One lobby call per game end and per leaver; the room already reports to the lobby
    (`GameRoom.reportToLobby`) and writes the replay record when a game ends
    (`replays/saveReplayRecordIfEnded.ts`): reuse those points, do not add a second path.
  - The busy-day simulator (`tools/simulator/busyDay/`) plays 50 games through the room and
    lobby code: it must now count the start, end and leave writes in the lobby under B18 (limit
    5,000). Scenario #23 (queue, phase 26) is not required but shows the expected count.
  - Done: `actionsAddedBetween(before, after)` (`src/server/room/`) lists the seats that were in
    the running game before and are not after (left, or the game ended), each with its moves in
    the action log except system actions (`isSystemAction`: time-out, pause, resume, abandon).
    `GameRoom.reportToLobby` moved to `src/server/reportToLobby.ts` and passes them to
    `Lobby.roomChanged(code, summary, { played, now })`, which applies `withRoomSummary` and
    `withActionsAdded` (`src/server/lobby/`) in one write. A game started from a given state
    (`startingState`, a test room) adds nothing (Q67).
  - Differs: the busy-day simulator never started a game: the owner's page refresh after the
    room was full let the asking run out and the room closed. The refresh now happens while the
    room waits for players. It now counts the start in the lobby (`countGameStart`), the last
    joiner leaves the game, then the game ends; the game action and the end are not counted as
    room rows (`BusyDayCounter.gameStorage`, they belong to B4). Busy day: room 597, alarm 448,
    lobby 631, database 450, total 2,126 (limit 5,000).
  - For later items: scenario "a player's actions in a game are added ..." needs the queue
    (phase 26); the lobby driver does not add actions yet.
- [x] 5. **Notices for the daily limits** (S16.1; design board "Notices: daily limits", without
  its ranked queue text, S17).
  - The texts are in `screens.md` S16.1 (Q68). Lobby: a rejected join or create shows the text
    (`src/client/screens/lobby/joinErrorText.ts`, `src/client/store/JoinError.ts`). Waiting
    room: a player removed for their own limit sees it as a removal notice
    (`removalText.ts`, `RemovalNotice.ts`); a site-limit failure shows the warning toast to
    everyone in the room. Reuse the existing toast and notice components.
  - Client unit tests cover all three texts (the site one only here, Q69). One browser test
    shows a player's own limit notice: a test route under the test-room secret
    (`src/server/testRooms/`, `hasTestRoomSecret.ts`) sets that player's counts for today; it
    must not touch the site count or other players.
  - Done: the waiting room shows the warning toast "The game did not start" with the site text
    (`SITE_GAME_LIMIT_TOAST`, shared with `noticeToastOf`) to the last accepter (rejected
    `site_game_limit`) and to the others (the `site_game_limit` notice), from
    `waitingRoomNoticesOf`; the last accepter no longer also gets the red line. The waiting room
    moved out of `CurrentScreen.tsx` into `WaitingRoomScreen.tsx` (function length). Test route
    `POST /api/test-daily-counts` (`setTestDailyCounts`, `TestDailyCountsRequest`: token, actions,
    gameStarts; 404 without the test-room secret) calls `Lobby.setCountsForTest`
    (`withPlayerCountsSet`). Browser test `e2e/dailyLimits.spec.ts`: a guest set to 10 starts
    sees the A9.3 text in the create dialog; screenshots `harness/screens/daily-limit/`.
  - Differs: axe found the lobby's error line (`.error` in `Lobby.module.css`, the create and
    guest dialogs and the waiting room) at 2.7:1 contrast on the dialog; it now uses the light red
    token `--color-board-trade-missing`.
  - For later items: `/api/test-daily-counts` can put any player at a limit in browser tests
    (item 7, the playthrough checklist's daily limit notices).
- [x] 6. **Budget checks in the report** (B1–B5, B9–B18; Q70).
  - The report's budget section (`tools/harness-runner/reportSimulation.ts`, `buildReport.ts`,
    `MEASURED_BUDGET_LIMITS.ts`, `highestMeasured.ts`) lists every budget in
    `harness/budgets.yaml` with its limit, measurement and where it is measured: the value for
    harness-measured ones; the enforcing tool for B10 (browser tests), B14 (size-limit) and B15
    (browser tests, item 7); the later phase for B6, B7, B8.
  - Add B11 to the budgets in `harness/required.yaml` if it is within its limit (`HARNESS:`
    commit, note it in Q70). Check B16 and B18 again with the lobby reads and writes of items
    2 to 4.
  - Done: `reportBudgets` lists every budget in `budgets.yaml` (`readBudgetEntries`: id, name,
    limit, unit) with its limit, the measured value and where it is measured, from
    `BUDGET_CHECKS` (`by`: harness, other check or not built). B10 and B14 show the badge
    "other check" (`e2e/idleClient.spec.ts`, size-limit); B6, B7, B8 and B15 "not yet". A unit
    test checks that every budget in `budgets.yaml` has an entry. B11 is required (3 ms, limit 10;
    `HARNESS:` commit, Q70).
  - B16: the busy-day simulator now also counts rows read outside the games (`BusyDayCount`:
    `written` and `rowsRead`): every room storage read, one lobby read per lobby call, and the
    token lookups and lobby checks of each page load, create and join request (constants in
    `simulateBusyDay.ts`). B16 = room reads per 3-player game + busy-day reads per room:
    573 + 56 = 629 (limit 50,000). B18 unchanged: 2,126 (limit 5,000).
  - For later items: item 7 changes B15 in `tools/harness-runner/BUDGET_CHECKS.ts` to
    `by: "other check"` once the full-game browser tests assert it.
- [x] 7. **Full browser tests** (B15; Q70). May need two parts: 7a the 2-player game and the
  helpers, 7b the 3- and 4-player games and screenshots.
  - Complete games with 2, 3 and 4 players from the lobby to the end screen: create, join,
    accept (reuse `e2e/startGame.ts`, `startFourPlayerGame.ts`, `openLobby.ts`), some real moves
    in the first turns (`cardsHeldOnce.ts` when picking a card by name), then every player takes
    the market go and ends the turn until turn 40 ends (R21), then the end screen.
  - B15: measure each move from click to updated view; assert the 95th percentile is at most
    500 ms.
  - Screenshots of every key screen passed through to `harness/screens/` (see how
    `gameScreenSizes.spec.ts` and `gameOver.spec.ts` save them).
  - Locally run with `--workers=2` and restart the dev server after client changes
    (`proposed-rules.md`).
  - Done in one part: `e2e/fullGames.spec.ts` plays a whole game with 2, 3 and 4 players at each
    screen size (`playFullGame`: `startGame`, every player sells a card held once in turn 1,
    takes a marketplace card in turn 2 and draws 2 cards of a sector in the other turns
    (`playMarketPhase`), ends the turn (`endTurnForEveryone`) until turn 40, then the end
    screen on every page: "... wins!", the turn-limit text and one row per player). B15:
    `timeMove` takes the time in the page from the click to the first frame where the move's
    control is gone (the "Your go" heading, or the End turn button and its "Waiting for the
    server…" label), so optimistic display does not count; the 95th percentile per game is
    asserted against the limit read from `budgets.yaml` (`budgetLimitOf`) and written as a
    test annotation. Locally about 75–120 ms (single moves up to 10 s while two workers load the
    local server). B15 is `by: "other check"` in `BUDGET_CHECKS.ts`. Screenshots
    `harness/screens/full-game-{2,3,4}-players-{turn-1,turn-40,game-over}/`. A game takes about
    1 to 2.5 minutes; the test timeout is `FULL_GAME_TEST_MS` (15 minutes).
  - Differs: no leak check in these games: by turn 40 almost every card name has been public in
    the marketplace or the discard pile, so a name-based check says nothing there (turn 1 is
    checked in `turnOne.spec.ts`; the harness leak test covers whole games).
  - For later items: the Finisher should add the full games and B15 to the Playwright row of
    `docs/enforcement.md` (and drop B15 from "not yet enforced"). Once, at turn 40 at 1920x1080,
    axe reported a scrollable panel without keyboard access (`scrollable-region-focusable`);
    it did not come back in 13 later games. If it recurs, find which `Panel` it is
    (`useIsScrollable` only watches its own and its content's size). Other local failures were
    the known two-worker load: a guest dialog still "Continuing" after 5 s, or a turn-1 sale
    still "Waiting for the server…"; each passed when run again alone.
- [x] 8. **Playthrough checklist** (Q71): `docs/playthrough.md`, for the owner and invited
  testers: who is needed (2 to 4 people, each on their own computer, invited through Cloudflare
  Access, D6), what to try in which order (guest names, lobby, create and join rooms, accept,
  the market and main phases, cards, combos, projects, quests, influence, undo, clocks and
  time-outs, refresh and reconnect, a second tab, leaving, the end screen, the daily limit
  notices), and what to write down (problems, and how many turns each game took, for D24).
  - Done: `docs/playthrough.md` in four parts: lobby and rooms (guest names, create, join by code
    and from the public list, size, leave, refresh and the 10-second removal, accept and decline
    with the 2-minute rejoin wait), a full game (turn 1, undo, market phase, combos, influence,
    projects, quests, income, clocks, refresh, away, a second tab, the end screen), short games
    for time-outs, pause and leaving, and the daily limits. A note template per game: room code
    (for a replay export), turn the game ended in and why, length, problems.
  - Differs: the site lock was removed (D22, replaces D6), so the checklist says to share the
    link only with testers instead of inviting them through Cloudflare Access (noted in Q71).
    Of the daily limits, only the 10 games per player can be reached by hand on the live site
    (10 quick 2-player games); the 2,000 actions and the site's 50 games are left to the browser
    and unit tests.
  - For later items: the releaser's **Waiting for the owner** entry can point to
    `docs/playthrough.md`; it needs no secret or command.

### Finish

- [x] Scenarios added to `harness/required.yaml`: `lobby-queue-and-limits` #24, #25, #31, #32,
  #33 (`HARNESS:` commit).
- [x] `npm run check` and `npm run harness` (1,000 games) green locally. The first check failed
  on B11 ("measured 21, over its limit of 10"), and the Stop hook's check, run while the browser
  tests loaded the computer, on 14: the room driver took the single slowest message, so one message
  slowed by the load decided it (3 ms otherwise). `budgets.yaml` defines B11 as the 99th
  percentile, so it is now the 99th percentile over every message the room scenarios handle
  (`percentileOf`, `highestMeasured`; recorded in Q70). Then green, also with two test runs at
  once. `npm run harness` with 1,000 games green (5.8 min).
- [x] Browser tests: all 111 green with `--workers=2`, in two runs: everything but the full games
  (102 passed, 7.7 min) and `e2e/fullGames.spec.ts` (9 passed, 9.6 min; 2-player games about
  1.0 to 1.4 min, 4-player about 2 min). No reruns needed. `docs/enforcement.md`: the full games
  and B15 in the Playwright row, phase 20 in the harness runner row, B15 out of "not yet
  enforced". Screenshots in `harness/screens/` regenerated.
- [x] Phase review run (answers: the B18 rise and B11 at the 99th percentile are correct
  measurements, not loosened tests; `GameRoom.ts` counts 289 lines without blank lines). Its
  findings, to fix or answer next:
  1. A failed lobby call at game start (`receiveCheckingGameStart` in `GameRoom.receive`) is not
     caught: it resets the room and the last accepter gets no reply. Catch it, decide the outcome
     (refuse with `no_answer` keeping the asking, or start without counting), record in Q68, unit
     test in `gameStartLimits.test.ts` with a rejecting checker.
     Fixed: a lobby call that fails becomes the refusal `no_answer` (`GameStartRefusal`,
     `receiveCheckingGameStart`): the last accepter gets "The server did not answer. Try again.",
     the room is left as it was (asking, timer and the other acceptances kept, nothing counted),
     and accepting again starts the game. Recorded in Q68; unit test "refuses the last acceptance
     with no_answer and keeps the asking when the lobby does not answer".
  2. B18 leaves out the rows of a room's end: the D1 replay record and its index row, its 30-day
     delete, the room's cleanup alarm and storage delete, the lobby report when the room goes.
     Count them in the busy day (or under B8, said in `BUDGET_CHECKS.ts`); update
     `simulateBusyDay.test.ts` and Q70.
     Fixed: the busy day now plays each room to its end (`closeEndedRoom`): the replay record
     (3 D1 rows: the table and its two indexes), the 30-day delete of an older one (3 rows), the
     cleanup alarm's storage delete and the lobby report, counted under B18 (said in
     `BUDGET_CHECKS.ts`); setting the cleanup alarm stays in B4. B18 2,126 -> 2,526 of 5,000,
     B16 629 -> 632. `simulateBusyDay.test.ts` and Q70 updated.
  3. No leak check in the full browser games (`rules/testing.md` Leak test): add
     `hiddenCardsSentToOthers` after `startGame` in `e2e/playFullGame.ts`, and record in
     `open-questions.md` why later turns are left to the harness leak test.
     Fixed: `playFullGame` checks `hiddenCardsSentToOthers` once the game has started, before any
     move; why later turns are left to the harness leak test is recorded in Q70.
     `e2e/fullGames.spec.ts` with `--workers=2`: 8 of 9 passed; the 2-player game at 1920x1080
     timed out in the human check while the game was being set up, before the new check, and passed
     on its own rerun.
  4. `docs/enforcement.md` describes B11 as the longest single message; it is the 99th percentile.
     Fixed: the phase 20 entry in `docs/enforcement.md` now describes B11 as the 99th
     percentile over every room-scenario message on the production path, and adds B18's room ends.
  5. Suggestion: the site-limit toast title "The game did not start" is in neither spec nor design
     (design: "Daily game limit reached"); use the design title or write the chosen one into
     S16.1 and Q68.
     Fixed: the toast title is now the design's "Daily game limit reached"
     (`SITE_GAME_LIMIT_TOAST`, `lobby.test.tsx`), written into S16.1 and Q68 (`HARNESS:` commit).
  6. Suggestion: `e2e/percentile95.ts` duplicates `tools/harness-runner/percentileOf.ts`; reuse it.
     Fixed: `fullGames.spec.ts` takes the B15 percentile with `percentileOf`; `e2e/percentile95.ts`
     is removed (Q70).
  7. Suggestion: B11 is not measured on the production path (`RoomSession.ts` skips
     `receiveCheckingGameStart`); drive room scenarios through it with an immediate checker.
     Fixed: `RoomSession.sendRaw` sends every message through `receiveCheckingGameStart` with a
     lobby that answers at once, and times the call until it returns (room scenarios never start a
     game, so it never waits); driver steps may be asynchronous (`DriverSession`,
     `runScenario`). B11 measured 5 ms of 10 in `npm run check`, 4 ms in `npm run harness` (1,000 games, green). Recorded in Q70.
  8. Suggestion: scenario #31 (`lobby-queue-and-limits.yaml`) does not check that the player over
     the limit is removed; add `room: {players: [Bea]}` in a recorded `HARNESS:` commit.
     Fixed: #31 now checks `room: {players: [Bea], state: waiting}` (`HARNESS:` commit, recorded in
     Q68); it passes, and fails with `[Ann]`, so the check is live.
- [x] Fix or answer the findings.
- [x] Checks run again after the fixes. `npm run check` green (379 tests; B11 at 99th percentile).
  `npm run harness` with 1,000 games green (5.8 min; B11 measured 4 of 10). Browser tests with
  `--workers=2` in two runs: everything but the full games 97 of 102 passed (8.3 min), and the
  5 failures (a guest dialog still open, turn 1 not shown, axe finding no main landmark on an
  unloaded page) passed on their rerun (2.2 min); `e2e/fullGames.spec.ts` 8 of 9 passed
  (8.4 min), the 2-player game at 1280x720 failed in setup with the "Choose a username" dialog
  still visible and passed on its rerun alone. That setup failure in a 2-player full game came
  back (at 1920x1080 in the fixers' run), both times while other work loaded the computer: here
  the Stop hook's `npm run check` ran alongside, and its B11 measured 11 of 10 under that load;
  the same check run alone afterwards was green. Screenshots in `harness/screens/` retaken.
- [ ] Report written, merged, deploy watched, live site checked; the playthrough written under
  **Waiting for the owner** and the phase marked **waiting for the owner** (Q71).
  - Report written and pushed (`PLAN: Phase 20 report`). The branch check on GitHub (run
    42055452656) was cancelled: `check` passed in 4 min, but `browser-tests` hit the job's
    `timeout-minutes: 20` in `.github/workflows/check.yml`. GitHub runs the 111 tests with 1
    worker; after 16 min 78 had run (one failed, `F`, unknown which: the results are kept only on
    failure, not on cancel) and 33 were left, including the 9 full games (about 1 to 2.5 min each).
    A rerun cannot fit in 20 min, so it was not rerun. `deploy.yml` has the same 20-min browser
    job, so a merge would not deploy. Not merged. Next: decide how the browser job fits (a longer
    job timeout in both workflows, or shards), then find the failing test.

## Report

**Built.** The site now keeps the daily limits that hold it inside the Cloudflare Free plan
(A9.1–A9.4). The lobby counts, per UTC day, each player's game actions and game starts and the
site's game starts; the counts reset at 00:00 UTC without any write. A player with 2,000 actions
today, or 10 games started today, cannot join or create a room, and sees why. When the last
player accepts, the room checks everyone again together with the site's 50 games a day: a player
over their own limit is removed with the reason; at the site limit everyone stays and gets the
notice "Daily game limit reached". A player's actions are added when their game ends or when they
leave it. The harness report lists every budget with its limit, its measurement and where it is
measured; the busy-day simulator now plays 50 games from start to room cleanup. Browser tests play
complete games with 2, 3 and 4 players from the lobby to the end screen at every screen size,
measure the time from a move to the updated view (B15) and take screenshots of turn 1, turn 40
and the end screen. `docs/playthrough.md` is the checklist for the owner's playthrough.

**What to try.** Follow `docs/playthrough.md` with 2 to 4 people, each on their own computer:
lobby and rooms, a full game, short games for time-outs, pause and leaving, and the daily limits.
The one limit reachable by hand is 10 games per player: after 10 quick 2-player games, creating
or joining a room shows "You have started 10 games today, the most per day. Try again after
00:00 UTC."

**Checks.** `npm run check` green; `npm run harness` green with 1,000 simulated games and this
phase's 5 scenarios required (B11 4 ms of 10 at the 99th percentile, B16 632 of 50,000, B18 2,526
of 5,000). All browser tests passed with `--workers=2`, some only on a rerun while the computer
was under load (a guest dialog still open, a 2-player full game still at "Choose a username").

**Differences from the phase file.** The site lock was removed earlier (D22, replaces D6), so
testers get the link instead of a Cloudflare Access invitation. The full browser games check for
leaks once the game starts; later turns are left to the harness leak test (Q70). B11 is the 99th
percentile over every room-scenario message on the production path, as `budgets.yaml` defines it.
The phase ends **waiting for the owner**, not done, until the owner has played and accepted the
milestone (Q71).

**Decisions.** Q67: the counts live in the lobby record, read as zeros from an earlier day; what
counts as an action. Q68: what a room does when a game cannot start (removal, site-limit notice,
a lobby that does not answer gives `no_answer`). Q69: `TEST_SITE_GAMES_PER_DAY` lifts the site
limit for local and GitHub browser tests only. Q70: the budgets in the report, the full browser
games, B11 at the 99th percentile, B18 with room ends. Q71: how the phase ends with the owner's
playthrough.

**Review findings and what happened to each.**
1. A lobby call failing at game start reset the room: fixed, it is refused with `no_answer` and
   the room keeps its asking (Q68).
2. B18 left out the rows of a room's end: fixed, the busy day plays each room to its end; B18
   2,526 of 5,000 (Q70).
3. No leak check in the full browser games: fixed, checked once the game starts (Q70).
4. `docs/enforcement.md` described B11 wrongly: fixed.
5. The site-limit toast title was in neither spec nor design: now "Daily game limit reached",
   written into S16.1 and Q68.
6. `e2e/percentile95.ts` duplicated `percentileOf`: removed, reused.
7. B11 was not measured on the production path: fixed, room scenarios go through
   `receiveCheckingGameStart` (Q70).
8. Scenario #31 did not check the removal: fixed (`HARNESS:` commit, Q68).
