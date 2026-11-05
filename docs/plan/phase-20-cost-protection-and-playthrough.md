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
- [ ] 6. **Budget checks in the report** (B1–B5, B9–B18; Q70).
  - The report's budget section (`tools/harness-runner/reportSimulation.ts`, `buildReport.ts`,
    `MEASURED_BUDGET_LIMITS.ts`, `highestMeasured.ts`) lists every budget in
    `harness/budgets.yaml` with its limit, measurement and where it is measured: the value for
    harness-measured ones; the enforcing tool for B10 (browser tests), B14 (size-limit) and B15
    (browser tests, item 7); the later phase for B6, B7, B8.
  - Add B11 to the budgets in `harness/required.yaml` if it is within its limit (`HARNESS:`
    commit, note it in Q70). Check B16 and B18 again with the lobby reads and writes of items
    2 to 4.
- [ ] 7. **Full browser tests** (B15; Q70). May need two parts: 7a the 2-player game and the
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
- [ ] 8. **Playthrough checklist** (Q71): `docs/playthrough.md`, for the owner and invited
  testers: who is needed (2 to 4 people, each on their own computer, invited through Cloudflare
  Access, D6), what to try in which order (guest names, lobby, create and join rooms, accept,
  the market and main phases, cards, combos, projects, quests, influence, undo, clocks and
  time-outs, refresh and reconnect, a second tab, leaving, the end screen, the daily limit
  notices), and what to write down (problems, and how many turns each game took, for D24).

### Finish

- [ ] Scenarios added to `harness/required.yaml`.
- [ ] `npm run check` and `npm run harness` (1,000 games) green locally.
- [ ] Browser tests.
- [ ] Phase review run, findings fixed or answered.
- [ ] Checks run again after the fixes.
- [ ] Report written, merged, deploy watched, live site checked; the playthrough written under
  **Waiting for the owner** and the phase marked **waiting for the owner** (Q71).
