# Phase 27: Ratings, ranking and players online

Status: in progress
Milestone: 5 Accounts and ranking

## Goal

ELO ratings change after ranked games, the ranking table lists everyone who has played one, and
the lobby shows players online with their ratings.

## Depends on

Phase 26.

## Covers

- Rules: A10, A5, A7, R9.14's "ratings stay the same".
- Checks: `HARNESS.md` point 7, the rating calculation check (+2.5 → +3, −2.5 → −3).
- Screens: S13.3 (ELO ranking with Jump to me), S10.1's "ELO ranking", S10.2 (players online),
  S9.5's ranked columns, ratings in players online and the user box (Q154). Design boards
  "Records: ELO ranking", "Records: not in the ranking yet", "End: turn limit, ranked", the
  players online list of "Lobby 1920x940" and the waiting room.

## Builds

1. **ELO** updated for all players at once from the ratings before the game, with A10.4's k rules.
2. **Ranking table,** 50 per page, Jump to me.
3. **Players online** with status and rating.

## Known gaps after this phase

- No menu, rules viewer, card set or tutorial.

## What you can see when it's done

Play a ranked game with test accounts and see ratings change on the end screen, in the ranking
table and in players online.

## Exit criteria

- The rating calculation check passes.

## Open points

- None.

## Required scenarios

These 12 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `lobby-queue-and-limits` #1: anyone can see the players online with their status and rating
- `records-and-ratings` #6: the ranking table lists registered users with a ranked game by rating
- `records-and-ratings` #7: the ranking table shows 50 players per page and can jump to the player's position
- `records-and-ratings` #9: three new players change rating by 20 0 and minus 20
- `records-and-ratings` #10: rating changes use each player's own k and the ratings before the game
- `records-and-ratings` #11: a rating difference over 400 counts as 400
- `records-and-ratings` #12: a player who ever reached 2400 uses k 5
- `records-and-ratings` #13: two new players in a 2 player ranked game change rating by 20 and minus 20
- `records-and-ratings` #14: four new players in a 4 player ranked game change rating by 20 7 minus 7 and minus 20
- `records-and-ratings` #15: a player who left is placed below the players who stayed for ratings
- `records-and-ratings` #16: an abandoned game leaves ratings unchanged
- `turns-and-time` #26: a game paused for 24 hours is abandoned

## Progress

- [x] 0. Start (2026-11-17): branch `phase-27-ratings-ranking-and-players-online`. Spec gaps
  decided and written into the spec first (commit `HARNESS: Ratings, ranking and players online
  settled (A7, A10.7, S10.1, S10.2, S13.3; Q151-Q155)`): Q151 (the `ratings` table, ratings taken
  at the start of a ranked room, changes added in the game record's D1 batch, B8), Q152 (who is
  online: the lobby socket on every screen, identified by a first message; statuses; order),
  Q153 (ranking places, order, paging and texts), Q154 (where ratings are shown; not on the
  game's badges, which corrects this file's Covers) and Q155 (the rating calculation check).
  Read them before building any item; they are the design.
  - Every message shape change raises `PROTOCOL_VERSION` (now 23) once per item that changes
    it; a new room record shape raises `ROOM_SCHEMA_VERSION` (now 4), a new save shape
    `SAVE_SCHEMA_VERSION` (D1). New D1 tables go in a new migration (`migrations/0014_…`; the
    last is `0013_username_changes.sql`).
  - Scenario numbers in the list above are by the phase plan; the names are what counts. All
    items: scenarios become required only in the finisher's run; until then check them by adding
    them to `harness/required.yaml` locally without committing.
  - Files near the line limit (300 non-blank lines): `tools/harness-runner/lobby/LobbySession.ts`
    (294), `tools/harness-runner/lobby/LOBBY_DRIVER.ts` (284), `src/server/GameRoom.ts` (284),
    `src/client/store/ClientStore.ts` (269), `tools/harness-runner/room/ROOM_DRIVER.ts` (257),
    `tools/harness-runner/room/RoomSession.ts` (257). Split them, do not grow them past the
    limit.
  - Order: 1, then 2 (needs 1), then 3 (needs 2). 4a, 5a and 6 need 2's `ratings` table; 4b
    needs 4a, 5b needs 5a. Items 4a/4b and 5a/5b can go in either order after 2.

- [x] 1. **Rating calculation** (A10.2 to A10.8, A10.10 to A10.12; `HARNESS.md` point 7; Q151,
  Q155). **Small.**
  - Pure functions in a new `src/server/ratings/` (as `src/server/queue/` is for the queue): from
    each seat's place (A3.4, A10.8 and A10.10 come with the record's places), rating before,
    ranked games before and highest rating before, and the number of players (counting those
    who left), the change per seat: per-pair expected result with the difference capped at 400
    (A10.3), the lowest applying k of A10.4 times 2 ÷ (players − 1), the total rounded to 6
    decimals, then to a whole number with .5 away from zero (A10.6). Unit tests: A10.11, A10.12
    and the numbers of `records-and-ratings` #9 to #14 (Ann 1188, Bea 1022, Cat 895 in #10).
  - The rating calculation check (Q155): a `checkRatings` beside `checkCardData`,
    `checkTierShares` and `checkReplayExport` in `tools/harness-runner/`, run in `runHarness.ts`
    and shown in the report; remove "Rating calculation check (A10)" from `CHECKS_NOT_BUILT` in
    `buildReport.ts`. Look in `docs/enforcement.md` and `harness/coverage.md` for where the
    check is listed as not built.
  - Done (2026-11-17, by the starter): `src/server/ratings/` (`ratingChangesOf` from `RatedSeat`s
    (`RatingBeforeGame` plus seat and place) to `SeatRatingChange`s; `expectedResultOf`,
    `kFactorOf`, `roundedTotalChange`, `RATING_RULES`), unit tests in `ratings.test.ts`;
    `tools/harness-runner/checkRatings.ts` (A10.11, A10.12, the scenarios' cases and the totals
    of Q155) in `HarnessRun.ratingProblems`, judged and shown in the report.
    `docs/enforcement.md` does not list the check yet: the finisher adds it (step 5).
  - For later items: item 2 builds `RatedSeat`s from the stored record's places and the
    ratings kept in the room record (`RatingBeforeGame` is the shape to keep per seat).

- [x] 2. **Ratings saved after a ranked game** (A10.1, A10.5, A10.7, A10.9, R9.14, M6.9, A3.2's
  rating fields; Q151; scenarios `records-and-ratings` #9 to #16, `turns-and-time` #26).
  **Large.**
  - Migration: a `ratings` table (`player_id` primary key, `rating`, `ranked_games`,
    `highest_rating`, `WITHOUT ROWID`, no other index). No row means 1000, 0, 1000.
  - At the start of a ranked room, `startRankedRooms` reads the ratings with the usernames (one
    query; extend `readUsernames` or add a reader beside it) and passes them to
    `startRankedRoom`; the room record keeps them per seat for a ranked game
    (`ROOM_SCHEMA_VERSION`). Casual games keep none.
  - When a ranked game ends with a record (not abandoned, `isAbandoned`), the stored record's
    seats gain the rating before and the change (item 1's functions on the record's places), and
    `gameRecordRowsOf` adds one upsert per player: `INSERT … ON CONFLICT(player_id) DO UPDATE`
    adding the change, adding 1 ranked game, and setting `highest_rating` to the larger of it and
    the new rating. Same batch as the record (`saveGameRecord`), at the two places that save
    records (`GameRoom`, `applyRoomAlarm`). Account deletion
    (`src/server/deletion/deleteAccountRows.ts`) deletes the player's `ratings` row (A5.1 lists
    only existing accounts).
  - B8: the simulator plays casual games only (`GameSimulation.ts`, `simulatedRoomOf.ts`), so
    make `gameRecordRowCountOf` count the rows the record would write as a ranked game (record,
    one row per player and one rating row per player: 9 for 4 players), and update B8's `where`
    in `BUDGET_CHECKS.ts`.
  - Room driver: `given.accounts` gains `rating`, `ranked_games` and `highest_rating` (the
    ranked room's ratings before the game and the D1 rows); `then.ratings` is a map of username
    to rating, or `unchanged` (every player's rating as given, or 1000 when not given). The room
    driver needs a memory D1 for the record batch; reuse the lobby driver's
    `memoryGameRecordDatabase` and `memoryStatementOf` if they fit. `turns-and-time` #26 and
    `records-and-ratings` #16 give no accounts: their seats have default ratings.
  - Reuse: `storedGameRecordOf`, `saveGameRecordIfEnded`, `endedGameOf`, `isAbandoned`,
    `readUsernames`.
  - Done (2026-11-17): `migrations/0014_ratings.sql`; `readRankedPlayers` (players joined with
    `ratings`, one query) in `startRankedRooms`, so `startRankedRoomIn` takes `RankedPlayer`s
    (identity plus `RatingBeforeGame`); `RoomGame.ratingsBeforeGame` (per player id, empty for
    casual games; `ROOM_SCHEMA_VERSION` 5); the stored record's `players[]` gain `rating`
    (`{ before, change }` in a ranked game, `null` otherwise; older stored records read as
    `null`), made by `recordPlayersOf`; `gameRecordRowsOf` adds one upsert per rated player;
    account deletion deletes the `ratings` row. B8 counts the simulator's games as ranked (9 rows
    for 4 players). Room driver: `given.accounts` rating fields, `then.ratings`, a memory D1
    (`memoryGameRecordDatabase` now also runs `0014`, with `giveRating` and `ratingOf`) fed by
    `saveGameRecordIfEnded` on every room write. No message shape changed (no
    `PROTOCOL_VERSION` change).
  - Differs: a player with no kept rating (test rooms of a ranked kind, `startTestRoomIn`, keep
    none) counts as a new player (1000, 0, 1000), like a player with no `ratings` row
    (`ratingBeforeGameOf`). The lobby driver and the busy-day simulator start ranked rooms with
    new-player ratings.
  - For later items: item 3 reads the rating before and the change from the stored record's
    `players[].rating` and, for the room's message, from `RoomGame.ratingsBeforeGame` with
    `ratingBeforeGameOf` and `recordPlayersOf`. Item 5a's ratings come from the same
    `ratings` table (`NEW_PLAYER_RATING` when there is no row).

- [x] 3. **Ratings shown after the game** (S9.5's ranked columns, S13.2 and A3.2's rating
  fields; Q154; design board "End: turn limit, ranked"). **Large.**
  - The room's message carries, for an ended ranked game, each seat's rating before and after
    (from the ratings kept in the room record and item 1's functions; public, not hidden
    information); `PROTOCOL_VERSION` once. The end-of-game table (`GameOverTable.tsx`) gains the
    two columns in a ranked game; the casual text in `gameOverTexts.ts` stays for casual games.
  - The game record page (`GameRecordTable.tsx`, `GAME_RECORD_ROWS.tsx`) gains rows for the
    rating before and the change in a ranked game (A3.2, S13.2), from the stored record
    (`gameRecordResponseOf`).
  - Tests: component tests for both tables; a screenshot of a ranked end screen if the browser
    tests already reach one (phase 26's ranked queue tests), else a note for the finisher.
  - Done (2026-11-17): `RoomView.ratings` (`SeatRatingView`s `{ seat, before, after }` for an
    ended ranked game with a record, else `null`; `seatRatingsOf` from `storedGameRecordOf`);
    `PROTOCOL_VERSION` 24. `GameOverDialog`, `GameOverTable` and `gameOverTexts` take the
    ratings: a ranked game says "Ranked game: ratings changed." and adds the design's note "Each
    pair of players counts as one result. A rematch of a ranked game is casual." The game record's
    seats gain `rating` (`RatingChange` `{ before, change }` or `null`; `gameRecordResponseOf`),
    shown as the rows "Rating before" and "Rating change" after "Place and result" in a ranked
    game (`gameRecordRowsOf`). `ratingChangeText` writes +20, 0, −20. New colour tokens
    `--color-board-rating-gain` and `-loss` (`BOARD_VALUES.ts`, `tokens.css`).
  - Differs: the end-of-game table has one "Rating" column, "1000 → 1020 (+20)" coloured by the
    change, as the design board shows, not two columns; it still shows the rating before and
    after (S9.5).
  - For the finisher: no browser test reaches the end of a ranked game (the ranked queue test
    stops after the match starts, `leaving.spec.ts`'s ranked game is abandoned), so there is no
    ranked end-screen screenshot.

- [x] 4a. **Ranking table on the server** (A5.1 to A5.4, A6.2; Q153; scenarios
  `records-and-ratings` #6, #7). **Large.**
  - A route (`src/server/api/rankingRoute.ts`, beside `matchHistoryRoute.ts`): page N (from 1,
    50 per page, A5.4), or Jump to me with the session token (the page holding the player's
    place; reuse `identityOf`). It reads `ratings` joined with `players` where the account is
    registered, ordered by rating, then ranked games, both highest first, then `name_key`. The
    reply has the page, the page count, the entries (place, player id, username, rating, ranked
    games) and the viewer's place, or why they are not in the table (logged out, guest, no
    ranked game). Shared response type and schema in `src/shared/api/`, like the match
    history's.
  - Lobby driver: `given.accounts[]` with `rating`, `ranked_games` and `ranking_place`;
    `given.ranked_accounts` (that many ranked registered fixtures, placed so the named accounts
    get their `ranking_place`); the step `open_ranking` for a `visitor` or a `player`, with
    `jump_to_me`; `then.ranking` (the first page's entries) and `then.ranking_page` (`page`,
    `first_place`, `last_place`, `shows`). Reuse `memoryReadStatementOf` for the D1 reads.
  - Done (2026-11-17): `POST /api/ranking` (`rankingRoute`) with `RankingRequest`
    `{ token: SessionToken | null, page: number from 1 | "mine" }` (a POST so the token stays out
    of the address); reply `RankingResponse` `{ page, pageCount, entries: RankingEntry[],
    standing }`, `RankingStanding` `placed {place}` | `logged_out` | `guest` | `no_ranked_game`
    (all in `src/shared/api/`). `rankingOf` (viewer from `findSessionAccount`, which gives
    guest or registered) and `readRankingRows`: one query (`ROW_NUMBER()` over `ratings` joined
    with registered `players`, `ranked_games > 0`, ordered rating, ranked games, `name_key`)
    returns the shown page and the viewer's own row. A page past the last shows the last page;
    "mine" for a viewer not in the table shows page 1; an empty table is page 1 of 1 with no
    entries. Route test `tools/route-tests/rankingRoute.test.ts` (real D1). Lobby driver:
    `LobbyRanking` (a memory SQLite with every migration, the session's accounts as `players`
    and the given ratings, `givenRankingRatingsOf`), `runRecordsStep` and `recordsThen` (the match
    history step and thens moved there from `LOBBY_DRIVER.ts`, which is at its line limit).
    No socket message changed (no `PROTOCOL_VERSION` change).
  - For later items: 4b posts `{ token, page }` to `/api/ranking` (`token: null` when logged
    out) and shows S13.3's texts from `standing`; the pager's places come from the entries.

- [x] 4b. **Ranking page in the client** (S13.3, S10.1's ELO ranking; design boards "Records: ELO
  ranking" and "Records: not in the ranking yet"). **Large.**
  - S10.1's **ELO ranking** button in the lobby's top bar (also in the waiting room, S11.1)
    opens the ranking as a records page over the current screen with Back (`RecordsPage`,
    `recordPageOf`, `useRecordPage`, `LazyRecordsPage`), with the texts of S13.3, the pager,
    Jump to me with the row highlighted, and usernames that open match histories
    (`RecordNameLink`). Component tests by role and name; a browser test with a screenshot of
    the ranking (copied into `harness/screens/` by the finisher).
  - Done (2026-11-17): the records page `#ranking` (`RecordPage` kind `ranking`, `RANKING_HASH`,
    `RecordPageContent`), `RankingContent` with `useRanking` (`requestRanking(token, page)`; the
    token comes from the store's session through `App` and `LazyRecordsPage`), `RankingPager`
    (Previous, "Page 3 of 9 · places 101–150" from the entries, Next, Jump to me disabled
    unless `standing` is `placed`), `RankingTable` (place, username as `UsernameLink`, rating,
    ranked games; the viewer's row has `aria-current` and the design's highlight) and
    `rankingStandingText` (S13.3's texts). The **ELO ranking** button (`RankingButton`) is in
    the lobby's top bar, logged in and logged out, and in the room pages' top bar
    (`RoomPageFrame`). `RecordTableHead` is shared with the match history. New colour tokens
    `--color-board-ranking-own` and `-standing`. Tests: `ranking.test.tsx`,
    `recordPagesInApp.test.tsx`, browser test `e2e/ranking.spec.ts` (screens `ranking` and
    `ranking-not-in-it-yet`).
  - Differs: the viewer's row is highlighted whenever it is on the shown page, not only after
    Jump to me. With no entries the pager shows no page text and the table is replaced by
    "Nobody is in the ranking yet."
  - For later items: a local D1 made before this phase needs `npm run db:migrate:local` (0014)
    before the browser tests, or `/api/ranking` fails. The finisher copies the `ranking` and
    `ranking-not-in-it-yet` screenshots; the ranking is empty in the browser tests (no test
    ends a ranked game of registered players).

- [ ] 5a. **Players online on the server** (A7.1 to A7.3, A6; Q152; scenario
  `lobby-queue-and-limits` #1). **Large.**
  - The lobby socket (`Lobby.fetch`; today anonymous, and `webSocketMessage` ignores messages)
    accepts one identify message with the session token, shaped and checked like the queue
    socket's first message (`RankedQueue`, `senderOfToken`); the attachment holds the player id,
    username and rating (none before a first ranked game; read from `ratings`). Being online
    writes no row.
  - The lobby message gains `playersOnline` (username, player id, rating or none, status), built
    from the open sockets, one entry per player, sorted by username key, with the status from
    the record (the player's `busy` entry is a room whose game is in progress and they have not
    left it); broadcast when the list changes (beside `broadcastIfListChanged`).
    `PROTOCOL_VERSION` once.
  - Updates: the record save path tells the Lobby the new ratings after a ranked game; a
    username change (`renamePlayer`) and a logout (`closeLoginSockets`, `LoginClosing`) tell it
    too; logging out makes the socket anonymous.
  - Lobby driver: `given.accounts[]` with `online` and `in_game`; `given.queue_count`; the step
    `open_lobby` for a visitor; `then.players_online` and `then.queue_count` (the queue view's
    total). `LobbySession.ts` is at 294 lines: put the new code in files of its own.

- [ ] 5b. **Players online in the client** (S10.2, S11.1; design "Lobby 1920x940" and the waiting
  room). **Large.**
  - The client keeps the lobby feed open on every screen while logged in, identified with the
    token (today `ClientStore.enterRoom` closes it), and anonymous when logged out.
  - A players online panel on the left of the lobby and the waiting room: "Players online · 37"
    and one `PlayerBadge` per player (it already takes a `rating` and the statuses `online` and
    `inGame`), usernames opening match histories. Component tests; the lobby and waiting room
    screenshots change (finisher).

- [ ] 6. **Own rating in the lobby** (S10.1's user box, S10.4's rating line; Q138, Q154).
  **Small.**
  - The account details (`/api/account`, `onLoadAccount`, already read by `useRankedStanding`)
    gain a registered user's rating and ranked games. The user box (`UserMenu.tsx`) shows
    "Rating 1043" under the username for a registered user; the ranked queue panel
    (`RankedQueuePanel.tsx`) shows "Your rating: 1043 · 12 ranked games" (design "Lobby"). Both
    refresh after a ranked game (the `check` key `useRankedStanding` already uses).

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter + builder, item 1 | Opus, medium | 16 | 191k | 81 | done |
| Builder, item 2 | Opus, medium | 13 | 164k | 65 | done |
| Builder, item 3 | Opus, medium | 12 | 150k | 85 | done |
| Builder, item 4a | Opus, medium | 15 | 141k | 53 | done |
