# Phase 25: Game records and match history

Status: in progress
Milestone: 5 Accounts and ranking

## Goal

Every finished game is saved as a game record, and every player has a match history that anyone
can open.

## Depends on

Phases 22 (abandoned games save no record) and 24 (deleted accounts).

## Covers

- Rules: A3, A4, A6.1–A6.2, A6.4, M8.3 (records kept when the room is deleted).
- Budgets: B8 (rows written per finished game outside the room).
- Screens: S13.1, S13.2, usernames open match histories everywhere, S10.1's "My match history".
  Design boards "Records: match history", "Records: game record", "Records: match history empty",
  "Records: another player's match history".

## Builds

1. **Game records in D1,** written once when a game finishes or the last player is left.
2. **Match history** pages and the full record view.
3. **Current usernames** in records; "Deleted player" for deleted accounts and removed guests.
   Deleting an account (phase 24, Q111) and removing a guest remove the account row, so a
   record's player id without an account row is "Deleted player".

## Known gaps after this phase

- No ranked games or ratings yet.

## What you can see when it's done

Finish a game, open your match history and the game's record; click another player's name to
see theirs.

## Exit criteria

- B8 within its limit.

## Open points

- None.

## Required scenarios

These 10 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #20: a guest account not used for 90 days is deleted and shows as Deleted player
- `accounts` #21: deleting a registered account frees the username and shows Deleted player in records
- `connections-and-leaving` #11: when only one player is left the game ends and that player wins
- `records-and-ratings` #1: a finished game saves a game record with every player's result and values
- `records-and-ratings` #2: a player who left is recorded with their values when they left
- `records-and-ratings` #3: an abandoned game saves no game record
- `records-and-ratings` #4: game records always show the current username
- `records-and-ratings` #5: the match history lists games newest first with a short overview
- `rooms` #21: after a game the room stays and is deleted 24 hours after the game ended
- `records-and-ratings`, new (Q120): a player who left in an earlier turn is scored with the turn
  they left

## Progress

- [x] 0. Start (2026-11-10): branch `phase-25-game-records-and-match-history` from master
  `b43762f`. Spec gaps decided and written into the spec first (commit `45f5af6 HARNESS: Game
  records, leaving values and opening match histories (Q119-Q121)`): Q119 (D1 tables, when a
  record is written, current usernames, B8), Q120 (a left player's hand and turn, A3.3) and Q121
  (how histories open, who can open them, which usernames link, paging; A6.1, S13.1, S13.2, new
  S13.4). Read Q119 to Q121 before building any item; they are the design. One new scenario joins
  the phase's list (10 in all).
  - Scenario numbers in the list above are by the phase plan; the names are what counts. By
    position in `accounts.yaml` the two account scenarios are the 21st and 22nd.
  - A6.2 (ELO ranking table) and S10.1's **ELO ranking** button come with phase 27; ranked games,
    `ranked: true` and ratings in records with phases 26 and 27. This phase records every game
    as casual.
  - All items: scenarios become required only in the finisher's first run; until then check them
    by adding them to `harness/required.yaml` locally without committing.
  - Every message shape change raises `PROTOCOL_VERSION` (now 14) once per item that changes it
    (`proposed-rules.md`); a new room record shape raises `ROOM_SCHEMA_VERSION` (D1). New D1
    tables go in a new migration, `migrations/0012_...sql`.
  - Files near the line limit (300 non-blank lines): `tools/harness-runner/lobby/LOBBY_DRIVER.ts`
    (286), `src/server/GameRoom.ts` (271), `tools/harness-runner/room/RoomSession.ts` (256),
    `src/client/store/ClientStore.ts` (254), `tools/harness-runner/room/ROOM_DRIVER.ts` (244).
    Split them, do not grow them past the limit.
  - Stats and types are always icons, names only on hover (S1.6), also in the record's type
    counts and values; the design's text labels are a visual reference only.

- [x] 1. **The game record in the engine** (A3.1 to A3.4, R21.4, R21.8, M6.8; Q119, Q120;
  scenarios `records-and-ratings` #1, #2, #3 and the new one, `connections-and-leaving` #11).
  **Large.**
  - Done (2026-11-10). `SeatState` keeps `hasLeft` and gains `departure: {turn, cardsInHand} |
    null`, set by `leaveGame`; `scoreOf`, `gameResultOf` and invariant I22 use it.
    `PlaceResult.hasLeft` is replaced by `leftInTurn: number | null` (the S9 table still shows
    "left"). `PROTOCOL_VERSION` 15, `SAVE_SCHEMA_VERSION` 16. `gameRecordOf(saved)` in
    `src/rules/` returns `GameRecord | null` (`src/shared/records/`: `GameRecord`, `SeatRecord`,
    `RecordResult`, `ComboGains`), seats in place order; combo gains by `comboGainsOf`. The room
    driver reads `record` (`tools/harness-runner/room/recordThen.ts`, usernames from seat names,
    `ranked` from `RoomGame.kind`) and takes `given.kind: casual`. The new scenario is
    `records-and-ratings` #3 by position ("a player who left in an earlier turn is scored with the
    turn they left"), so the abandoned one is now #4 and the later ones move down by one.
  - For later items: the record has seats, not player ids or usernames; item 2 adds player ids
    (`RoomGame.seats`), kind and the start and end times around `gameRecordOf`. `rooms` #21 still
    needs `record: kept` in the lobby driver. `ROOM_DRIVER.ts` is now 259 non-blank lines.
  - Leaving (`src/rules/leaveGame.ts`) keeps the seat's turn and cards in hand at that moment
    (Q120); `gameResultOf.ts` scores a seat that left with them, so the end-of-game table (S9)
    changes too. `PlaceResult` (`src/shared/`) gains what the view needs (the turn they left):
    raise `PROTOCOL_VERSION`. The seat state changes shape, so raise `SAVE_SCHEMA_VERSION` (15,
    `src/rules/`; D1: older rooms close themselves).
  - A pure function in `src/rules/` builds the record by seat from the ended `SavedGame`: turns
    (`state.turn`), winner, `bonusTypes`, and per seat result (won, lost, left), place, score,
    reached end goal, income, funds plus hand, workforce, quality, satisfaction, product,
    distribution, influence, bonus-type points, completed projects, quests completed, workforce,
    quality and satisfaction gained from combos (from `combosClaimed` and the catalogue's combo
    rewards; reuse what `claimAll.ts` applies) and type counts (`typeCountsOf.ts`). It returns
    nothing for the abandoned endings (`src/shared/isAbandoned.ts`). The record type goes in
    `src/shared/` (the client shows it in item 4).
  - The scenario driver learns the `record` then-key (`record: none`, the full record,
    `record: {results: ...}`), for the engine or room driver, whichever runs these scenarios
    now (`tools/harness-runner/DRIVERS.ts`).
  - Add the new scenario (Q120) to `harness/scenarios/records-and-ratings.yaml` in a `HARNESS:`
    commit: a player leaves, the game goes on at least one more turn, and the record shows that
    player's score with the turn they left and their cards in hand then. Raise the count in
    `tools/harness-runner/harness.test.ts` (458).

- [x] 2. **Saving game records in D1** (A3.1, A3.2, M8.3, B8; Q119; scenario `rooms` #21).
  **Large.**
  - Done (2026-11-10). `migrations/0012_game_records.sql`. `src/server/records/`:
    `storedGameRecordOf(RoomGame)` gives `StoredGameRecord` (the `GameRecord` plus `kind`,
    `startedMs`, `endedMs` and `players: {seat, playerId}[]` in seat order; no usernames),
    `gameRecordRowsOf` the insert rows, `saveGameRecord` one `batch`, `saveGameRecordIfEnded` with
    a new `GameId` (`src/shared/GameId.ts`, a UUID). `GameRoom` and `applyRoomAlarm` call
    `saveRecordsIfEnded` (replay and game record), so neither file grew. The lobby driver reads
    `record: kept` (`gameRecordThen.ts`, in-memory `memoryGameRecordDatabase.ts`; the statement
    helper is now shared, `memoryStatementOf.ts`). B8 is measured by the simulator
    (`gameRecordRows`, 5 in 4-player games). The route tests' `accountTablesOf` reads no record
    tables, so it is unchanged. `LOBBY_DRIVER.ts` is now 290 non-blank lines.
  - For later items: read records with `SELECT record FROM game_records WHERE id = ?` and a
    history with `SELECT game_id, ended_ms FROM game_record_players WHERE player_id = ? ORDER BY
    ended_ms DESC, game_id DESC` (the key order); `memoryGameRecordDatabase.ts` is the harness
    store to extend for `given.records`.
  - Migration `0012` with `game_records` and `game_record_players`, both `WITHOUT ROWID`, no
    other index (Q119).
  - Write in one `batch` next to `saveReplayRecordIfEnded` (`src/server/replays/`), called from
    `src/server/GameRoom.ts` and `src/server/applyRoomAlarm.ts`; reuse `endedGameOf.ts`. Player
    ids from `RoomGame.seats` (`SeatPlayer`), kind from `RoomGame.kind`, start from
    `saved.setup.startedAt`, end from `saved.state.clockStartedAt` (as the replay record does).
    Catch and log a failure as `saveReplayRecordIfEnded` does; never log tokens or addresses.
  - The lobby driver's in-memory D1 for replay records (`memoryReplayRecordDatabase.ts`,
    `MemoryReplayRecords.ts`) is the pattern for an in-memory game record store; `rooms` #21's
    `record: kept` reads it after the room is deleted.
  - B8: count the rows of the record write per finished simulated game in the harness and set
    `tools/harness-runner/BUDGET_CHECKS.ts` B8 to `by: "harness"` with where it is measured.
    Expect at most 5.
  - Add the new tables to the route tests' D1 schema if they read it
    (`tools/route-tests/accountTablesOf.ts`).

- [x] 3. **Reading match histories and records with current usernames** (A3.5, A4.1 to A4.3,
  A6.1, A1.1, A1.15; Q119, Q121; scenarios `records-and-ratings` #4, #5, `accounts` "a guest
  account not used for 90 days is deleted and shows as Deleted player" and "deleting a
  registered account frees the username and shows Deleted player in records"). **Large.**
  - Done (2026-11-10). `GET /api/players/<player id>/history[?before_ms=&before_game=]` and
    `GET /api/records/<game id>` (`src/server/api/recordRoute.ts`, `matchHistoryRoute.ts`,
    `gameRecordRoute.ts`). Answers in `src/shared/api/`: `MatchHistoryResponse` (`found` with
    `username`, `games: MatchHistoryEntry[]`, `older: HistoryCursor | null`; or `account_gone`,
    404) and `GameRecordResponse` (`found` with `record: GameRecordView`, seats
    `GameRecordSeat` = `RecordedSeat` plus `player`; or `not_found`, 404). Every username is a
    `RecordName`: `{kind: "player", playerId, username}` or `{kind: "deleted"}` (no id). A
    malformed id answers like an unknown one (404); a bad cursor is a plain 400; other methods
    405. The logic is in `src/server/records/` (`matchHistoryOf`, `gameRecordResponseOf`, with a
    `UsernameLookup`; `readUsernames` is the D1 one), so the lobby driver runs the same code on
    its in-memory store with names from its accounts. One read of 51 rows tells whether older
    games exist.
  - Differs: the guest scenario waits 91 days and 1 second, not 90 days (Q122, spec A1.1: Q112
    deletes after more than 91 days of noted last use). The lobby driver now deletes expired
    guests after every `wait_ms` (`removeUnusedGuestsInLobby.ts`). `given.accounts[].games`
    now saves that many real 2-player records (the account wins at seat 1 against an id with no
    account), and `then.accounts[].games` counts the history; `record_usernames` is the
    username each of those records shows for that account's seat. Route tests are a second
    `describe` in `accountRoutes.test.ts` (now 293 non-blank lines, full). `LOBBY_DRIVER.ts`
    is 248 lines (nested fields moved to `LOBBY_NESTED_FIELDS.ts`).
  - For later items: the client fetches the two routes and parses with the schemas above;
    "Show older games" sends `before_ms=older.endedAt&before_game=older.gameId`. Ordinal places
    ("2nd of 3") and the date are formatted in the client (the driver's `matchHistoryThen.ts`
    does the same for the scenario). "Deleted player" is `RESERVED_USERNAME` on the server;
    the client needs its own text. Fixture records for tests: `fixtureGameRecordOf` in
    `tools/harness-runner/lobby/`.
  - Two GET routes in `src/server/api/`, registered in `src/server/worker.ts`: a player's
    history (newest first, 50 at a time, with a cursor for **Show older games**; each entry the
    overview of A4.1 and the game id) and one record (every player, A4.2). No login needed
    (Q121). Usernames joined from `players` at read; no row is "Deleted player" and has no
    player id in the answer. A history of an id with no account row answers so (the page says
    "This player's account no longer exists.").
  - Response types and their valibot schemas in `src/shared/api/`, like the other routes.
  - The lobby driver learns `given.records`, `given.accounts[].games`, the
    `open_match_history` step and the `match_history` and `record_usernames` then-keys.
    Account deletion and the 90-day guest removal (`src/server/deletion/`) need no change: they
    already remove the account row (Q111, Q112).
  - Route tests for both routes beside `tools/route-tests/accountRoutes.test.ts`, with bad ids
    and a deleted player.

- [x] 4. **Match history and game record pages** (S13.1, S13.2, S13.4, S10.1, S12.7; Q121;
  design boards "Records: match history", "Records: game record", "Records: match history
  empty", "Records: another player's match history"). **Large.**
  - Stopped once (2026-11-10) before any code, by the owner.
  - Done (2026-11-11). `MatchHistoryEntry` gains `kind`. `StoredSession` and `AccountBinding`
    gain `playerId: PlayerId | null` (from every account answer and the session check; older
    stored sessions and seat links start with none, and a seat link now runs the session check
    after entering the room). Pages in `src/client/screens/records/`: `#history/<id>` and
    `#record/<id>` (`recordPageOf`, `useRecordPage`, `keepRecordPageInsideApp` in `main.tsx`),
    `LazyRecordsPage` in `App.tsx` keyed by the hash (the app is `inert` under it), `RecordsPage`
    with **Back** and Escape. The privacy notice now shares `goBack`, `useOverlayPage` and
    `subscribeToHash` (`src/client/components/`). **My match history** works in the user menu
    and in the lobby's top bar when logged in (`LoggedInLobbyBar.tsx`); it is disabled while the
    player id is unknown. Record rows use stat icons (S1.6); "(you)" marks the viewer's column;
    winners show their username. Browser test `e2e/matchHistory.spec.ts` (a 2-player test room,
    one leaves), screenshots `match-history` and `game-record`.
  - For later items: `UsernameLink` (`src/client/screens/records/UsernameLink.tsx`, a link to
    `#history/<player id>`) and `RecordNameLink` (adds "Deleted player" as plain text) are the
    shared username link for item 5. Local browser tests need `npm run db:migrate:local` once for
    migration 0012, or saving records fails with "no such table: game_records".
  - Pages over the current screen by link (`#history/<player id>`, `#record/<game id>`), lazy
    loaded, with **Back**: reuse the privacy notice's pattern (`src/client/screens/privacy/`,
    `usePrivacyNoticeOpen.ts`, `keepPrivacyNoticeInsideApp.ts`, `LazyPrivacyNoticePage.tsx`,
    `App.tsx` making the app `inert` under it).
  - Enable **My match history** in `src/client/screens/account/UserMenuItems.tsx` (now disabled)
    and add it to `src/client/screens/lobby/LobbyTopBar.tsx` when logged in (S10.1).
  - Usernames in the pages are links to the history; "Deleted player" is plain text. The
    viewer's own column may be marked "(you)" as in the design; winners show their username.
  - Unit tests by role, a browser test that finishes a game (reuse the fastest existing
    full-game or test-room path) and opens the history and the record, screenshots to
    `harness/screens/`, axe.

- [x] 5. **Usernames open match histories everywhere** (A6.1, S13.4; Q121). **Large.**
  - Done (2026-11-11). `PROTOCOL_VERSION` 16. `RoomView` gains `playerIds` (by seat, beside
    `playerNames`) and `idsInRoom` (beside `namesInRoom`), `PublicRoomView` `playerIds`, a chat
    message `fromId`; all built by `updateFor`, `publicRoomsOf` and `chatEntriesFor`. The player
    view (`viewFor`) has no names, so it is unchanged. `UsernameLink` and `matchHistoryHash`
    moved to `src/client/components/`; `PlayerNameLink` shows a link or, without an id, the plain
    name. Links in `PlayerBadge` (top bar order and opponent cards), `OpponentBoardDialog` (a
    username link at the top of the stats box), `GameOverTable`, `ChatEntryItem`,
    `PublicRoomsList` and `WaitingPlayers`; "You" is never a link. The opponent card keeps its
    **See X's board** button for the board. Unit tests `src/client/screens/usernameLinks.test.tsx`;
    browser test in `e2e/matchHistory.spec.ts` clicks an opponent's name in a game and comes back.
  - For later items: locally, `e2e/chat.spec.ts` "players chat in the waiting room and in the
    game" failed twice at 1920x1080 in a run of several files with "dropped connection to the
    UserWorker" warnings, and passed when run alone; the finisher should rerun it and let GitHub
    judge.
  - Views gain each player's id where a username stands on its own: room players and seats, the
    game's player badges and opponents, the end-of-game result, chat senders, public rooms.
    Built only by `viewFor` and the room's view code; raise `PROTOCOL_VERSION`. The leak test
    is about card ids and is unchanged; player ids are not secret (Q121).
  - One shared link component for a username, used by `PlayerBadge.tsx` (top bar),
    `OpponentCard.tsx` (the username its own button; the rest of the card still opens
    `OpponentBoardDialog.tsx`, S3.2), the board, `GameOverTable.tsx`, `ChatEntryItem.tsx`,
    `PublicRoomsList.tsx`, the waiting room and room-after-game player lists, and item 4's
    pages. Not the user box, not names inside sentences.
  - Unit tests by role for each place; one browser test that clicks an opponent's name in a
    game.

- [ ] 6. **Finish.** Finisher (first run adds the 10 scenarios to `harness/required.yaml`),
  review, fixes, finisher again, release.

### Finish

- [x] First finisher run: the 10 scenarios onto `harness/required.yaml`; full check, harness,
  browser tests, budgets.
  - Done (2026-11-11): the 10 scenarios are required, in a new `records-and-ratings` section for
    six of them, and B8 joins the required budgets (an exit criterion, measured since item 2; one
    `HARNESS:` commit). `npm run check` green (119 test files, 673 tests; B14 158.5 kB of 300).
    `npm run harness` green: 459 scenarios, 393 pass, 0 fail, 66 not yet (none required); 1,000
    simulated games; every budget passes, B8 measures 5 of 12, B18 3,846 of 5,000. Browser tests
    (`--workers=2`, five parts): shard 1/2 76 passed and 2 failed (`bigCardSwitch`,
    `accountSettings` at 1920x1080), shard 2/2 75 passed, two and four players 3 passed each,
    three players 2 passed and 1 failed (1920x1080, Turn 1 heading not shown within 5 s at the
    start). Rerun with `--workers=1`: `bigCardSwitch`, `accountSettings` and `chat.spec.ts`
    (item 5's note) 15 of 15 passed at all three sizes; three players at 1920x1080 passed. All
    failures were load; GitHub judges the full suite.
  - `docs/enforcement.md` lists the lobby driver's record and match history checks and B8.
    Screenshots from these runs committed.
  - GitHub run 43001983089 (`303973a`): check and six browser jobs green; "other tests 3 of 3"
    failed once on `bigCardSwitch.spec.ts` at 2560x1440 (107 ms against 100, a timing miss) and
    passed on the rerun of the failed job, so the run is green.

- [x] Phase review (2026-11-11, `phase-reviewer`): ready after fixes, no blockers. Findings:
  1. Should fix: the boards "Records: another player's match history" and "Records: match
     history empty" have no browser check or screenshot (`e2e/matchHistory.spec.ts` 48-51,
     66-71). Add `expectScreenFits` for another player's history (`match-history-other-player`)
     and for the history opened from a name in a game, and a test where a fresh seat opens
     **My match history** before any game ends ("No games yet", `match-history-empty`).
     Fixed: screenshots `match-history-other-player` and `match-history-from-game` (the
     opponent's empty history, "Finished games appear here."), and a new test where seat 1 of 3
     leaves a game that goes on, exits to the lobby and opens **My match history** ("No games
     yet", "Games you finish, or leave, appear here.", `match-history-empty`).
  2. Should fix: `record: kept` (`tools/harness-runner/lobby/gameRecordThen.ts` 8-20) builds and
     writes the record at check time, so it passes even if no record was saved or the room's
     deletion removed it. Save the record into the session's `memoryGameRecordDatabase` when the
     ended room is set up (`saveGameRecordIfEnded`), and read it back after the wait and the
     deletion (`readStoredGameRecord` or `gameRecordResponseOf`), with every seat's player id.
     The replay check (`replayRecordThen.ts`) has the same pattern.
     Fixed: `EndedRoomRecords` saves both records through `saveReplayRecordIfEnded` and
     `saveGameRecordIfEnded` (now typed on the record database, not all of D1) when the session
     is set up; `record: kept` reads every seat's match history after the wait and needs the same
     one game in each and `readStoredGameRecord` to find it; `replay_record` only runs the
     cleanup and reads back.
  3. Suggestion: a half-given history cursor (`before_game` without `before_ms`, or
     `before_ms=`) answers 200 with no games instead of 400 (`src/server/api/matchHistoryRoute.ts`
     16). Refuse unless both are present and non-empty; add the case to "refuses a bad cursor".
     Fixed: 400 unless both are present and non-empty; the route test checks four bad cursors.
  4. Suggestion: `SeatState` keeps `hasLeft` and `departure`, the same fact twice
     (`src/rules/SeatState.ts` 32-33). Derive "has left" from `departure`.
     Fixed: `SeatState.hasLeft` is gone; the engine, server and harness read
     `departure !== null`. Views keep `hasLeft` (built from `departure` in `viewFor`). No save
     version change: `departure` came in this phase with save version 16, not yet deployed.
- [x] Fixes: one fixer, findings 1 to 4 (2026-11-11). `npm run check` green;
  `e2e/matchHistory.spec.ts` passes at all three sizes with `--workers=1`.
- [ ] Second finisher run.
  - Done (2026-11-11): `npm run check` green (119 test files, 673 tests; B14 158.5 kB of 300).
    `npm run harness` green: 459 scenarios, 393 pass, 0 fail, 66 not yet (none required); 1,000
    simulated games; every budget passes, B8 measures 5 of 12, B18 3,846 of 5,000. Browser tests
    (`--workers=2`, five parts): shard 1/2 76 passed and 3 failed at 1920x1080
    (`accountSettings` twice, `bigCardSwitch`), shard 2/2 77 passed, three and four players 3
    passed each, two players 1 passed and 2 failed (1280x720 and 1920x1080, the room heading not
    shown within 5 s after Create room). Rerun with `--workers=1`: two players 3 of 3 passed;
    `accountSettings.spec.ts` and `bigCardSwitch.spec.ts` 9 of 9 passed. All failures were
    load; GitHub judges the full suite. No new check, so `docs/enforcement.md` is unchanged.
    Screenshots from these runs committed.
  - GitHub run 43014962411 (`57d8f75`): check and six browser jobs green; "other tests 3 of 3"
    failed in all three attempts at 2560x1440: twice `dailyLimits.spec.ts` (axe: the Create
    room button's white text on the disabled grey, 2.53:1) and once `bigCardSwitch.spec.ts`
    (109 ms against 100, a timing miss). The daily limit failure is a race in the test: after the
    rejection the dialog starts a new human check, so the button is disabled and then enabled
    again with a 120 ms background transition, and the screen check could land mid-transition.
    The test now waits for the button to be enabled again (`BUG FIX` commit, no product change).
  - GitHub run 43021506649 (`17ba5e5`): the daily limit test passed; "other tests 3 of 3"
    failed at 2560x1440 on `bigCardSwitch.spec.ts` (115.7 ms) and on `userMenu.spec.ts` (the same
    grey button mid-transition after a human check). Every screen check
    (`e2e/expectScreenFits.ts`) now waits for running CSS transitions to end before axe
    (`BUG FIX` commit); `dailyLimits` and `userMenu` pass locally at all three sizes and
    `npm run check` is green. `bigCardSwitch` at 2560x1440 on GitHub missed 100 ms in three of
    six job attempts this phase (107, 109, 115.7 ms; it passes locally); the release should
    watch it, and if it keeps failing, check whether phase 25 slowed the hand card switch.
  - GitHub run 43024546881 (`38ae6f4`): no contrast failure any more; check, the three full
    game jobs and "other tests 1 of 3" green; `bigCardSwitch.spec.ts` failed in both other jobs
    (1920x1080 exactly 100 ms, 2560x1440 over 100 ms). It now misses its 100 ms limit (screens.md,
    the selected card) on GitHub in four of eight job attempts this phase, now at two sizes.
    Next: a fixer finds out whether phase 25 slowed the hand card switch (item 5's
    name buttons and the records code touch the game screen; compare the click-to-render time on
    master and on the branch, for example with React's profiler or a rerendering count) and
    fixes the code; never raise the 100 ms limit. Second finisher run not finished until then.
  - Fixer (big card switch): no slowdown from phase 25. Phase 25 changed nothing on the path
    of a hand card click: the selection is local state in `RightColumn`, and the name links and
    `playerIds` sit outside it. Master and the branch measured the same at 2560x1440 with 6x CPU
    throttling (21 clicks each: 19-59 ms on the branch, 24-78 ms on master). The test already
    missed in phase 24 (161 ms). The GitHub traces show the misses on the first click (three
    runs: 107, 109, 115.7 ms) or the third (100, 108.9 ms), with the other clicks at 30-54 ms,
    so it is spikes from a busy 2-core runner, not one slow step. A click costs the React
    re-render of the whole right column and a repaint of the right column's tiles, and each
    repaint also redrew the scaled game background photo (one big layer for the whole page).
    Fixes: the background photo is on its own layer (`.page::before`, `will-change`), so a
    switch no longer redraws it; hand cards (`HandPanelCard`, `memo`, stable `pressCard`) and
    the stats panel (`memo`) do not re-render on a switch. Measured with the browser limited to
    1 CPU core and 3x throttling, 32 clicks each: median 18.9 to 11.0 ms, 90th percentile 41.9
    to 32.4 ms, slowest 77.6 to 43.4 ms. The 100 ms limit and the test are unchanged; GitHub
    decides on the next push.
  - For later items: never remove a `git worktree` whose `node_modules` is a junction to the
    main one; `git worktree remove --force` empties the main `node_modules` (needed `npm ci`).
  - Rerun after the fix (2026-11-11, `17a80af`): `npm run check` green (119 test files, 673
    tests; B14 158.6 kB of 300). `npm run harness` green: 459 scenarios, 393 pass, 0 fail, 66 not
    yet; every budget passes, B8 5 of 12. Browser tests (`--workers=2`): shard 1/2 79 passed,
    shard 2/2 75 passed and 2 failed at 2560x1440 (`accountSettings`, the settings dialog not
    shown within 5 s; `bigCardSwitch`, the card photos not loaded within 5 s, before any timing),
    three and four players 3 passed each, two players 2 passed and 1 failed at 1920x1080
    (`ERR_EMPTY_RESPONSE` loading the page). Rerun with `--workers=1`: `accountSettings` and
    `bigCardSwitch` 9 of 9, two players 3 of 3. All failures were load; GitHub judges the full
    suite. `docs/enforcement.md` unchanged. Screenshots from these runs committed.
- [ ] Release.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 9 | 153k | 79 | done |
| Builder, item 1 | 15 | 165k | 94 | done |
| Builder, item 2 (stopped once by the usage limit, resumed; numbers of the resumed part) | 5 | 107k | 17 | done |
| Builder, item 3 | 20 | 186k | 99 | done |
| Builder, item 4 | 3 | 118k | 34 | stopped by the owner before building |
| Builder, item 4 (again) | 29 | 220k | 116 | done |
| Builder, item 5 | 29 | 199k | 132 | done |
| Finisher | 69 | 102k | 51 | done |
| Phase reviewer | 10 | 195k | 87 | done: ready after fixes, 2 should fix, 2 suggestions |
| Fixer, findings 1 to 4 | 14 | 115k | 61 | done |
| Finisher, second run | 121 | 126k | 106 | failed: big card switch over 100 ms on GitHub |
| Fixer, big card switch timing | 46 | 186k | 101 | done |
