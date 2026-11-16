# Phase 26: Ranked queue

Status: in progress
Milestone: 5 Accounts and ranking

## Goal

Registered players with a confirmed email join the ranked queue with their chosen game sizes and
are matched into 2-, 3- or 4-player ranked games.

## Depends on

Phases 25 and 25a.

## Covers

- Rules: A8, A6.3 (who is in the queue is hidden), A9.1–A9.4 for the queue, M2 for the queue,
  M7.1 (no vote in ranked games).
- Screens: S10.4 (ranked panel with game-size toggles and counts per size), S10.7 (match found
  with the game size). Design boards "Lobby: in the ranked queue", "Lobby: match found", "Lobby:
  ranked locked".

## Builds

1. **Ranked queue** in one Durable Object (a new class in `wrangler.jsonc`, approved with this
   phase): game sizes per player, matching as a pure function on every queue change and at 00:00
   UTC, a 20-second confirmation without names, failure handling, the 2-minute rejoin wait.
2. **Ranked games** started in a new room; no abandon vote.
3. **Screens** for the above. The busy-day simulator adds queue use (B18).
4. Deleting an account (A1.15) leaves the ranked queue too: add it to
   `src/server/api/accountDeletionRoute.ts` (phase 24, Q111).

## Known gaps after this phase

- Ranked games are played, but ratings change from phase 27.
- The ranked queue panel (S10.4) shows no rating or number of ranked games until phase 27 adds
  ratings (Q138).

## What you can see when it's done

With several registered test accounts: choose game sizes, get matched, confirm, and play a ranked
game.

## Exit criteria

- B18 within its limit with the queue in use.

## Open points

- None.

## Required scenarios

These 28 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `connections-and-leaving` #22: ranked games cannot be abandoned by vote
- `lobby-queue-and-limits` #2: only registered users with a confirmed email can join the ranked queue
- `lobby-queue-and-limits` #3: guest users cannot join the ranked queue
- `lobby-queue-and-limits` #4: joining the queue without choosing game sizes means 3 players only
- `lobby-queue-and-limits` #5: a player can join the queue with several game sizes
- `lobby-queue-and-limits` #6: rejects joining the queue with no game size
- `lobby-queue-and-limits` #7: rejects a game size other than 2 3 or 4
- `lobby-queue-and-limits` #8: changing game sizes keeps the place in the queue
- `lobby-queue-and-limits` #9: rejects changing to no game size while in the queue
- `lobby-queue-and-limits` #10: changing game sizes can make a match straight away
- `lobby-queue-and-limits` #11: the queue count is public per game size and members see only themselves
- `lobby-queue-and-limits` #12: three players in the queue are matched and asked to confirm without seeing each other
- `lobby-queue-and-limits` #13: the longest waiting player is matched first even into a smaller game
- `lobby-queue-and-limits` #14: a larger game size is tried before a smaller one
- `lobby-queue-and-limits` #15: four players who chose 4 are matched into a 4 player game
- `lobby-queue-and-limits` #16: when all three confirm a ranked game starts in a new room
- `lobby-queue-and-limits` #17: when both players of a 2 player match confirm a ranked 2 player game starts
- `lobby-queue-and-limits` #18: a player who does not confirm leaves the queue and the others go back to the front
- `lobby-queue-and-limits` #19: a player who declined a match cannot rejoin the queue for 2 minutes
- `lobby-queue-and-limits` #20: a player can leave the queue and a closed connection for 10 seconds leaves it
- `lobby-queue-and-limits` #21: a player at 2000 actions today cannot join a new game
- `lobby-queue-and-limits` #22: the daily action count resets at midnight UTC
- `lobby-queue-and-limits` #23: a player's actions in a game are added to the daily count when the game ends
- `lobby-queue-and-limits` #26: the ranked queue makes no match while the site game limit is reached
- `lobby-queue-and-limits` #27: the ranked queue makes its matches at midnight UTC after the site game limit
- `records-and-ratings` #8: email addresses and queue members are never shown to other players
- `rooms` #19: a player in a room cannot join another room or the queue
- `rooms` #20: after a game ends joining the queue takes the player out of the finished room

## Progress

- [x] 0. Start (2026-11-16): branch `phase-26-ranked-queue` (holds `3e655bf`, the Q133 process
  changes, on top of master). Spec gaps decided and written into the spec first (commit
  `HARNESS: Ranked queue confirming, ranked rooms, limits and texts (Q134-Q139)`): Q134 (a
  confirming player: out of the counts, still busy for M2.1, leaving declines, a closed
  connection changes nothing; A8.10 with several tabs, no rejoin wait), Q135 (the ranked room:
  private, unlisted, owner the longest waiting, starts at once), Q136 (a confirmed match stopped
  by a daily limit), Q137 (all queue texts and reason codes; S10.4, S10.7, S10.9), Q138 (no
  rating line in S10.4 until phase 27, a known gap) and Q139 (B18's queue use). Read them before
  building any item; they are the design.
  - Design, for every item: the queue's logic is pure functions in a new `src/server/queue/`
    (as `src/server/lobby/` is for the lobby), so the lobby scenario driver runs them without a
    Durable Object, and a thin `RankedQueue` Durable Object (item 1c) holds one record
    (`QUEUE_RECORD_SCHEMA`, read with `v.safeParse`, empty on failure, like `Lobby.ts`), one
    alarm and the hibernating sockets. The `Lobby` stays the one place that knows where each
    player is (M2.1): its `busy` list gains the queue as a place besides room codes, so
    `claimPlayer`, `isReallyBusy` and `releasePlayer` keep working in both directions; the
    daily counts (A9.2 to A9.4) stay in the `Lobby` (`dailyLimitRejection`, `countGameStart`,
    `siteGameLimitOf`).
  - Reason codes added by this phase: `invalid_game_sizes`, `not_in_queue`,
    `no_match_to_confirm`, `vote_not_allowed` (`src/shared/ReasonCode.ts`). Every message shape
    change raises `PROTOCOL_VERSION` (now 17) once per item that changes it; a new room record
    shape raises `ROOM_SCHEMA_VERSION`, a new save shape `SAVE_SCHEMA_VERSION` (D1).
  - Scenario numbers in the list above are by the phase plan; the names are what counts. All
    items: scenarios become required only in the finisher's run; until then check them by adding
    them to `harness/required.yaml` locally without committing.
  - Files near the line limit (300 non-blank lines): `tools/harness-runner/lobby/LobbySession.ts`
    (297: split it before adding anything), `src/server/GameRoom.ts` (271),
    `tools/simulator/busyDay/simulateBusyDay.ts` (264), `tools/harness-runner/room/ROOM_DRIVER.ts`
    (257), `src/client/store/ClientStore.ts` (255), `tools/harness-runner/lobby/LOBBY_DRIVER.ts`
    (248). Split them, do not grow them past the limit.
  - Order: 2 can go first (it touches only the engine and its message). Then 1a, 1b, 1c; 3a, 3b
    and 4 need 1c.

- [x] 1a. **Queue membership and matching** (A8.1 to A8.6, A6.3, A9.1 to A9.4 for joining and
  matching, M2.1, M2.2; scenarios `lobby-queue-and-limits` #2 to #15, #21, #22, #23, #26, #27,
  `rooms` #19, #20, `records-and-ratings` #8). **Large.**
  - Pure functions in `src/server/queue/`: the queue record (entries in queue order with player
    id and game sizes; the matches being confirmed; rejoin waits); join (a registered user with a
    confirmed email, else `not_registered` / `email_not_confirmed`; sizes default `[3]`; empty, or
    anything but 2, 3 and 4, is `invalid_game_sizes`; daily limits through the lobby's
    `dailyLimitRejection`; `busy_elsewhere` when waiting in a room or in a game, M2.1; from a
    finished room it leaves that room, M2.2, as `leaveFinishedRooms` does for rooms); change
    sizes (keeps the place; `not_in_queue`); leave; and matching exactly as A8.5 (per player in
    queue order, largest size first, repeated until no match can be made). Matching runs after
    every change and at 00:00 UTC, and not while the site game limit is reached (A9.4: the
    joining player and everyone in the queue get the site-wide message). A match leaves the
    queue in state confirming and sends each matched player a `match_found` notice with the size
    only.
  - Counts per size and in total for everyone (A8.4); a player sees only whether they are in it
    (A6.3, #11 `view_lobby`). Who is in the queue never reaches a client (`records-and-ratings`
    #8).
  - The lobby driver gains `given.queue` (names, or `{player, sizes}`), `given.match`, the steps
    `join_queue`, `change_sizes`, `leave_queue`, then `queue`, `match` and `view_lobby`, and
    `message_to` with `notice: match_found` and `hides`. #23 plays a game through the driver's
    `leave_game` and then joins the queue (actions added when the game ends, A9.2). #27 is
    reached by `wait_ms` across 00:00 UTC (`fireAlarmsUntil`).
  - Reuse: `claimPlayer`, `dailyLimitRejection`, `dayOf`, `siteGameLimitOf`, the view-building
    style of `publicRoomsOf`, `Result`, `EpochMs`.
  - Partial (2026-11-16): done: `src/server/queue/` (`QueueRecord` with entries, matches with
    `deadline` and `confirmed`, `rejoinWaits`; `joinQueue`, `changeQueueSizes`, `leaveQueue`,
    `matchQueue`, `queueViewFor`, `nextQueueAlarmAt`, unit tests in `queue.test.ts`); the lobby's
    `busy` list holds `RANKED_QUEUE_PLACE` as a place (`BusyPlace`; `staying` is now
    `StayingPlayer`, room codes only; `Lobby.busyRoomOf` renamed `busyPlaceOf`; `isReallyBusy`
    treats the queue place as busy without asking anyone yet, `logOutOfRooms` skips it); shared
    types `RankedGameSize`, `QueueView`, `QueueCounts`, `OwnQueueState`, `QueueNotice` (types
    only, no schemas yet); reason codes `invalid_game_sizes`, `not_in_queue` with texts;
    `PROTOCOL_VERSION` 19. Lobby driver: `given.queue`, `given.match`, steps `join_queue`,
    `change_sizes`, `leave_queue`, then `queue`, `match`, `view_lobby`, `message_to` with queue
    notices, `size`, the site-limit text and `hides: [queue_members]`; `wait_ms` fires the
    queue's midnight alarm (`waitWithQueue`). Passing when added to the required list locally:
    `lobby-queue-and-limits` #2-#15, #21, #22, #26, #27, `rooms` #19, #20 and
    `records-and-ratings` "email addresses and queue members are never shown to other players"
    (it is #9, not #8). Decision Q140 (changing sizes while confirming keeps them).
  - Next (rest of 1a): `lobby-queue-and-limits` #23. Missing in the lobby driver: `given.players`
    with `given.seats[].actions_this_game` (a playing room whose seat has that many non-system
    actions in its log), adding `actionsAddedBetween` to the lobby when a game ends in
    `LobbySession.send` (`withActionsAdded`), and `then.accounts[].actions_today`. Trap:
    `then.accounts` compares the full account list, and #23 lists only Ann while Bea is an
    account too: either the scenario gains `{name: Bea}` (a `HARNESS:` change, recorded) or the
    driver needs another reading; do not make `then.accounts` ignore unlisted accounts, which
    would weaken the deletion scenarios.
  - Done (2026-11-16): #23. The lobby driver gains `given.players` with
    `given.seats[].actions_this_game` (`givenRoomRecordOf.ts`: a playing room whose seats have
    that many `end_turn` entries in the log), steps by `seat`, the actions added to the lobby
    when a game ends in `LobbySession.send` (`actionsAddedBetween`, `withActionsAdded`), and
    `then.accounts[].actions_today`. The scenario now also lists Bea under `then.accounts`
    (Q141, `HARNESS:` commit); `then.accounts` still compares the full list. No other
    scenario changed status.
  - For later items: `leaveQueue` returns `not_in_queue` for a confirming player; 1b makes it
    decline the match. `LobbySession.ts` is at 294 non-blank lines (queue code lives in
    `runQueueStep.ts`, `waitWithQueue.ts`, `lobbyQueueThen.ts`, `queueSentTo.ts`); the next
    protocol change raises `PROTOCOL_VERSION` from 19.

- [x] 1b. **Confirming and starting a ranked game** (A8.7 to A8.11, A9.3 and A9.4 at the start;
  Q134, Q135, Q136; scenarios `lobby-queue-and-limits` #16 to #20). **Large.**
  - Pure functions in `src/server/queue/`: confirm and decline (`no_match_to_confirm` when the
    match is gone); the 20-second deadline (a confirmation at the deadline is too late); a failed
    match (A8.9: those who did not confirm leave with a 2-minute wait, `rejoin_too_soon` on
    joining; those who confirmed go back to the front in their earlier order with their sizes,
    then matching runs again, #18); leaving the queue, also while confirming, which declines;
    and the 10-second closed-connection leave without a wait (A8.10, from the last connection
    closed).
  - When all confirm: count the start in the lobby (`countGameStart`: A9.3, A9.4; a rejection as
    Q136 says) and start the game in a new room as Q135 says, with seats drawn (`newGameStart`;
    the scenarios' `random: [{seats: ...}]`) and `kind: "ranked"` (A8.11, #16, #17). Reuse
    `createRoomIn`, `withFreeRoomCode`, the room's game start path and `RoomGame.kind`; the room
    must not ask M1.10. The lobby's busy entries move from the queue to the room code.
  - The driver's `then.game` already reads `kind` and `seats` (`lobbyGameThen`).
  - Done (2026-11-16): `src/server/queue/` gains `confirmMatch`, `declineMatch`,
    `fireQueueAlarm` (expired matches, the 10-second leaves, pruned rejoin waits, then matching),
    `withQueueConnection` (`QueueRecord.closedConnections`, recorded only for queue members;
    reopening clears it), `startConfirmedMatch` (`countGameStart`; Q136 both ways),
    `withMatchUndone`, `rematched`, `startedMatchNotices`. `leaveQueue` now takes the context,
    returns a `QueueChange` and declines while confirming. `QueueChange` gains `starts`
    (`RankedStart`: players in queue order, size). `nextQueueAlarmAt` is the earliest of the
    confirm deadlines, the 10-second leaves of waiting players and midnight while held back.
    `QueueNotice` gains `match_started` (room code), `match_not_started`, `match_missed`
    (`rejoinAt`), `site_game_limit`, `daily_limit`; reason code `no_match_to_confirm` with its
    text; `PROTOCOL_VERSION` 20. Room side: `startRoomGame` takes the `GameKind` (rooms and
    rematches pass `casual`), `startRankedRoomIn` writes a private room, owner first, game
    started at once with `kind: "ranked"`; `movedToRoom` (lobby) moves busy entries from the
    queue place to the room code. Lobby driver: `confirm_match`, `decline_match`, disconnect and
    reconnect tell the queue (`connectInQueue`), `wait_ms` fires every queue alarm up to the end
    (`waitWithQueue`), starts create the room (`startRankedRoomsInLobby`). Scenarios #16-#20
    pass when added to the required list locally. Decision Q142 (a decline ends the match at
    once; only the decliner gets the wait), written into A8.9 first.
  - For later items: 1c must (a) run `fireQueueAlarm` before an intent when the alarm is due,
    since `confirmMatch`/`declineMatch` refuse a match past its deadline; (b) know each queued
    player's name to build the room (`startRankedRoomIn` takes `Identity`s; queue entries hold
    only ids), e.g. from D1 or by storing it in the record; (c) create the room with
    `withFreeRoomCode` and `newGameStart`, then apply `movedToRoom` in the Lobby and send
    `startedMatchNotices`; (d) call `withQueueConnection` only when a player's last socket
    closes or the first reopens. 3a: the notice text after a start stopped by a player's own
    daily limit (`match_not_started` to the others) says "a player did not confirm" in S10.7;
    word it or add a kind when building the screen. The next protocol change raises
    `PROTOCOL_VERSION` from 20.

- [x] 1c. **The `RankedQueue` Durable Object** (the server side of 1a and 1b; M2.1 across rooms and
  the queue; `rules/cloudflare.md`). **Large.**
  - `wrangler.jsonc`: binding `QUEUE`, class `RankedQueue`, migration `v5` with
    `new_sqlite_classes` (approved with this phase; SQLite Durable Objects are on the Free plan,
    like `GameRoom` and `Lobby`). One write per accepted queue change, none for reads or
    connects, at most one alarm (the earliest of the confirm deadline, the 10-second leaves, and
    00:00 UTC while the site limit holds matches back), hibernating sockets only.
  - A socket `/api/queue/socket` that every lobby page opens: without a token it gets the counts;
    with the session token (checked as the room socket checks it, `senderOfToken`,
    `identityOf`) it also gets the player's own queue state and notices, and takes the queue
    intents, each parsed with a schema in `src/shared/`. Malformed messages, forged tokens and
    intents out of place are rejected with a typed reason and change nothing (hostile client
    tests in `src/server/`, as for rooms). A registered user who logs out is a closed connection
    (A1.14, A8.10).
  - `joinRoomRoute` and room creation reject a player in the queue or confirming with
    `busy_elsewhere` through the lobby's `busy` list; `isReallyBusy` asks the queue, as it asks a
    room, before trusting a stale entry.
  - Done (2026-11-16): `wrangler.jsonc` binding `QUEUE`, class `RankedQueue`, migration `v5`.
    `src/server/RankedQueue.ts` holds the queue record (`QUEUE_RECORD_SCHEMA`), one alarm
    (`nextQueueAlarmAt`, changed only when it differs) and hibernating sockets (`QueueSockets`).
    Because the queue functions change the lobby record too (busy list, daily counts), every queue
    change runs inside the `Lobby` as one `QueueOperation` (`Lobby.changeQueue` →
    `applyQueueOperation`, which first fires a due alarm, so an expired match ends before the
    intent); the Lobby writes its record, then the queue writes its own (at most one row each).
    Starts: `startRankedRooms` reads the names from D1 (`readUsernames`), creates the room with
    `withFreeRoomCode` and `GameRoom.startRankedRoom` (`newGameStart`), then `Lobby.moveToRoom`;
    if no room can be made the players are released and get `match_not_started`. Protocol
    (`PROTOCOL_VERSION` 21): `/api/queue/socket`; on open it sends `{type: "queue", queue:
    QueueView}` with `own: out`; client messages `QueueClientMessage` (`resync`, `join_queue`
    with `sizes` or null, `change_sizes`, `leave_queue`, `confirm_match`, `decline_match`, each
    with `token`), parsed by `parseQueueClientMessage`; replies `queue`, `queue_notice`,
    `queue_rejected` (`QueueServerMessage`, `parseQueueServerMessage`). A valid token identifies
    the socket; a player's last socket closing (or logging out, `logOutOfRooms` now calls
    `RankedQueue.logOut`) records the closed connection; any message from them reopens it.
    `isReallyBusy` asks `RankedQueue.isQueued` and forgets a stale queue entry; joining the queue
    runs `isReallyBusy` and `leaveFinishedRooms` (both now take a `BusyPlace`). When room games
    reach the site limit, `Lobby.startGame` tells the queue to resend its views and set its
    midnight alarm. Tests: `src/server/queue/queueOperation.test.ts`,
    `tools/route-tests/queueSocket.test.ts` (hostile messages, a 2-player match into a ranked
    room, `busy_elsewhere` on room creation, the 10-second leave, logout closing the socket).
  - For later items: 3a builds the client feed on `QueueServerMessage`/`QueueClientMessage`
    (a lobby page opens the socket, then sends `resync` with the token to get its own state);
    the next protocol change raises `PROTOCOL_VERSION` from 21. 4: `logOutOfRooms` already
    closes the deleted player's queue sockets (which would only leave after 10 seconds); item 4
    still has to take the player out at once with a `leave` operation (a `RankedQueue` method
    calling `change({kind: "leave"})`, which declines a match being confirmed).

- [x] 2. **No abandon vote in ranked games** (M7.1, A8.11; scenario `connections-and-leaving`
  #22). **Small.**
  - `callRejection` in `src/rules/voteRejectionOf.ts` returns `vote_not_allowed` when
    `state.kind === "ranked"`, checked first (the scenario expects nothing changed). Add the code
    to `ReasonCode`, and its text "Ranked games cannot be abandoned." (S16.3) to
    `src/client/screens/game/REJECTION_MESSAGES.ts`. The engine driver already takes
    `given.kind: ranked`. Independent of every other item.
  - Done (2026-11-16): as planned; `PROTOCOL_VERSION` raised to 18 (the new code changes the
    server message schema). The scenario passes when added to the required list locally.
  - For later items: the next item that changes a message shape raises `PROTOCOL_VERSION` from
    18.

- [x] 3a. **Screens** (S10.4, S10.7, S10.9, S16.1; Q137, Q138; design boards "Lobby: in the
  ranked queue", "Lobby: match found", "Lobby: ranked locked"). **Large.**
  - The ranked queue panel in the lobby and the match-found dialog with the texts written into
    S10.4 and S10.7, the notices after a match that did not start, and the queue texts of S10.9.
    No rating line (Q138). The game sizes are three toggles; the last chosen one cannot be turned
    off; the choice is remembered in that browser (`localStorage`, A8.2). Joining rooms is
    disabled while in the queue or confirming. A started match opens the game screen.
  - The queue feed goes into the one client store like the lobby feed
    (`src/hosts/RemoteLobbyFeed.ts`, `src/client/openLobbyFeed.ts`); the UI shows only what the
    server sends.
  - Browser tests by role and name at every size, with registered accounts whose email is
    confirmed through the test outbox (`e2e/emailLinks.spec.ts`, `readTestOutbox`): join with
    sizes, change sizes, a 2-player match found and confirmed into a ranked game, a decline with
    its wait, the disabled reasons. Screenshots of the three boards' screens.
  - Done (2026-11-16): decisions Q144 (the queue view's own state carries `rejoinAt` and
    `dailyLimit` when out, `isConfirmed` when confirming; the email standing comes from
    `/api/account`, reloaded after an email link or a rejected join) and Q145
    (`match_not_started` carries `reason`: `not_confirmed`, `player_daily_limit`, `no_room`,
    each with its S10.7 text), both written into S10.4/S10.7 first; `PROTOCOL_VERSION` 22.
    Client: `RemoteQueueFeed` (`src/hosts/`, `QueueFeed`, `OpenQueueFeed`, `QueueIntent` in
    `src/shared/`), `QueueStore` between `EmailAccountStore` and `ClientStore` (opened and
    closed with the lobby feed; resync on open and on login; `match_started` opens the room),
    `RankedQueueSection`/`ShownRankedQueue`/`RankedQueuePanel`/`GameSizeToggles`/
    `MatchFoundDialog`/`LobbyToasts` in `src/client/screens/lobby/`; sizes remembered under
    `marketlaw.rankedGameSizes`; room joining and creating disabled in the queue. Browser tests
    `e2e/rankedQueue.spec.ts` (screens `lobby-ranked-locked`, `lobby-in-the-ranked-queue`,
    `lobby-match-found`) pass locally at every size. The queue is one per site, so the spec's
    queue part runs under a file lock across workers (`e2e/withRankedQueueLock.ts`); a match
    between players of two sizes' runs would otherwise break both.
  - For later items: the finisher copies the three new screen folders from the branch check.
    The match-found countdown uses the room clock offset (none in the lobby), so a browser with
    a wrong clock shows a wrong M:SS; the server's deadline still decides. The next protocol
    change raises `PROTOCOL_VERSION` from 22.

- [x] 3b. **The busy day with queue use** (B18; Q139). **Small.**
  - `tools/simulator/busyDay/` runs Q139's queue use through the `src/server/queue/` functions
    and the lobby's, counting every queue and lobby row and alarm change; update B18's `where`
    text in `tools/harness-runner/BUDGET_CHECKS.ts`. B18 must stay within 5,000 (exit
    criterion). `simulateBusyDay.ts` has 264 lines: put the queue part in its own file.
  - Done (2026-11-16): of the busy day's 50 games, 30 are room games as before and 20 are ranked
    games matched through `applyQueueOperation` (`BusyDayQueue`: the queue record's rows in a new
    `queue` count, the lobby's through `changeLobby`, the queue alarm as `RankedQueue` sets it),
    started with `startRankedRoomIn` and `movedToRoom`, then played to the end like the room games
    (`finishGame`, the 2,000 chat messages still spread over all 50). Each ranked player joins with
    a size that cannot match yet and changes to the game's size; the first 5 matches are declined
    by their last player, who joins again after the 2-minute wait; 30 more players join and leave
    (15 by a closed connection, left by the queue alarm). B18 is now 3,794 rows (was 3,846: ranked
    rooms skip the waiting room's joins), 262 of them the queue's; rows read 7,539 (B16).
    `simulateBusyDay.ts` is at 290 non-blank lines (`busyDayPlayer`, `busyDayRoomCode`,
    `startBusyDayRankedRoom`, `matchThroughQueue`, `useQueueWithoutGames` split out). Not run:
    `npm run harness` (the finisher runs it).

- [x] 4. **Deleting an account leaves the ranked queue** (A1.15, Q111). **Small.**
  - `src/server/api/accountDeletionRoute.ts`: before the rows are deleted, take the player out of
    the queue (a match they are confirming counts as declined) and free the lobby's busy entry,
    next to `logOutOfRooms`. Add a test like the one for leaving a room on deletion, and let the
    lobby driver's `deleteAccountInLobby` leave the queue too.
  - Done (2026-11-16): the route itself is unchanged; `logOutOfRooms` already calls
    `RankedQueue.logOut`, which now takes `isLeaving` and, for a leaving login (account
    deletion, or a guest logging out, who is never queued) that is in the queue or confirming,
    runs `change({kind: "leave"})` instead of recording a closed connection; the leave releases
    the lobby's busy entry and declines a match being confirmed. The lobby driver's
    `deleteAccountInLobby` runs `leaveQueue` first. Decision Q143 (written into A1.15 first)
    with two new scenarios in `accounts.yaml`: "deleting an account in the ranked queue takes it
    out of the queue at once" and "deleting an account while confirming a ranked match declines
    it" (add them to the required list with the phase's others; `harness.test.ts` now counts
    490 scenarios). Route tests in `tools/route-tests/queueSocket.test.ts`.

- [ ] Finish: finisher (required list, full check, harness, branch check, screenshots), review,
  fixes, releaser.

### Finish

- Finisher (2026-11-16): the 28 scenarios of the phase list plus the two account deletion scenarios of
  item 4 (Q143) are in `harness/required.yaml` (`HARNESS:` commit `82af6120`; the harness check
  reads 490 scenarios, 0 problems). Local `npm run check`: passed (3 min 19 s, bundle 163.25 kB
  gzipped of 300). Local `npm run harness`: passed (the phase-end simulated games, 3 tests, 430 s;
  scenario report: 0 fail).
- Branch check, run 43912746323 (push of `82af6120`): conclusion success, all 7 jobs (check, other
  tests 1 to 3 of 3, full games with 2, 3 and 4 players), no rerun needed.
- Screenshots of that run copied into `harness/screens/`, including the three new folders
  `lobby-ranked-locked`, `lobby-in-the-ranked-queue`, `lobby-match-found`. Note for the process:
  `gh run download <id> --pattern "screens*"` works, but the artifacts hold the screen folders
  directly (`screens (<job name>)/<screen>/<file>.png`), with no `harness/screens/` folder inside,
  so each part's contents are copied over `harness/screens/` itself. All 6 browser jobs
  upload a screens artifact (the download takes over 2 minutes; copy only after it ends). Existing screenshots changed (re-rendered).
- `docs/enforcement.md`: the Playwright row gains the phase 26 browser tests.
- Findings: none.

- Phase review (2026-11-16): ready after fixes. Item 1c's extras are in scope; the five
  `PROTOCOL_VERSION` raises are fine (Q75). Findings:
  - **F1 (should fix, S10.4):** `RankedQueuePanel.tsx` 120-131 and `ShownRankedQueue.tsx` treat
    `confirming` as in the queue, so behind the match-found dialog the panel says "You are in
    the queue" and "0 players are in the queue, including you" (A8.7, Q134 leave a confirming
    player out of the counts; see `lobby-match-found-1280x720.png`). Use the in-queue texts only
    for `waiting`; add a unit test for confirming.
    Fixed: while confirming, the panel shows the counts and the out-of-the-queue text with
    **Leave the queue** (Q146, written into S10.4 first); unit test in `rankedQueue.test.tsx`. `e2e/rankedQueue.spec.ts`: the second player to
    join goes straight to confirming, so joining now waits for **Leave the queue**; the first
    player still checks "You are in the queue", and the panel behind the dialog no longer says
    "including you". The `lobby-match-found` screenshots change with the next branch check.
  - **F2 (should fix):** the site-limit path `Lobby.startGame` -> `RankedQueue.siteGameLimitReached`
    (A9.4) has no test. Add a route test: a queued player, the site one game below the limit
    (`setTestDailyCounts`), start a room game, expect a view with `isSiteGameLimitReached: true`.
    Fixed: `tools/route-tests/queueSiteLimit.test.ts` starts its own route test server with a
    site limit of one game (`startRouteTestServer` now takes test limits, passed as secrets), so
    `setTestDailyCounts`, which sets only a player's counts, is not needed: a queued player sees
    `isSiteGameLimitReached: true` once a room game starts, and stays waiting.
  - **F3 (should fix, rules/cloudflare.md):** each queue change writes two rows in two Durable
    Objects (Lobby, then RankedQueue), not on the record. `startRankedRooms` (D1
    `readUsernames`, room calls) runs after the Lobby commits but before the queue record is
    saved; a throw from `readUsernames` leaves the start counted while the queue still holds the
    match. Record the two-row design in open-questions; persist the queue record before
    `startRankedRooms`; turn any start failure, the D1 read included, into the `no_room` path.
    Fixed: the two rows are on the record (Q148); `RankedQueue.change` saves the queue record
    before `startRankedRooms`, and `startRankedRoom` turns any failure while making the room,
    `readUsernames` included, into the `no_room` path.
  - **F4 (should fix):** the match-found countdown and rejoin wait use the browser clock
    (`ShownRankedQueue.tsx` 77, `rankedLockOf.ts`; no server offset in the lobby). Add the
    server time to the queue messages as the lobby's clock offset, or at least list it under
    Known gaps.
    Fixed: each `queue` message carries `serverNow`; `QueueStore` sets `serverClockOffsetMs`
    from it and `CurrentScreen` gives the lobby the `ServerClockOffset`, so the confirm time,
    the rejoin wait and the join errors count on the server's clock (Q147, S10.4).
    `PROTOCOL_VERSION` 23; the next protocol change raises it from 23.
  - **F5 (suggestion):** a `no_room` match keeps its counted game starts
    (`startRankedRooms.ts` 23-29); A8/A9 do not say. Record the decision or reverse the count.
    Fixed: reversed (Q149, written into A9.4 first). `Lobby.undoRankedStart` (was
    `releaseFromQueue`) releases the players and returns the counted start in one write, only on
    the same UTC day (`withGameStartReturned`, unit test in `dailyLimits.test.ts`); after any
    start the queue re-reads the Lobby before sending views.
  - **F6 (suggestion):** the logout route test uses Dan, who never joined the queue. Join
    first, log out, expect the player counted at once and gone after 10 s (A1.14, A8.10).
    Fixed: Dan joins first; after logout he is still counted, and leaves no sooner than 10 s
    after it.
  - **F7 (suggestion, reuse):** `RankedQueue.ts` 176-187 repeats `room/alarmChangeFor` and
    `applyAlarmChange`; reuse them with a queue keep/set/delete decision.
    Fixed: `room/alarmChangeTo` (current, wanted) holds the keep/set/delete decision;
    `alarmChangeFor` and `RankedQueue.syncAlarm` both use it with `applyAlarmChange`.
### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end. Test builders (Q133) work in their own worktree and
are never merged.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter | Opus, medium | 8 | 164k | 63 | done |
| Test builder, item 2 (worktree) | Sonnet, medium | 14 | 80k | 43 | done |
| Builder, item 2 | Opus, medium | 5 | 70k | 21 | done |
| Test comparer, item 2 | Opus, medium | 0.5 | 53k | 4 | Sonnet nearly matched: same code, missed the PROTOCOL_VERSION raise (Q75) |
| Builder, item 1a | Opus, medium | 21 | 216k | 106 | partial (#23 left) |
| Builder, item 1a rest | Opus, medium | 8 | 119k | 47 | done |
| Builder, item 1b (resumed after the usage limit) | Opus, medium | 8 after resume | 168k | 30 after resume | done |
| Builder, item 1c | Opus, medium | 19 | 192k | 62 | done |
| Test builder, item 4 (worktree) | Opus, low | 11 | 110k | 47 | done |
| Builder, item 4 | Opus, medium | 8 | 103k | 43 | done |
| Test comparer, item 4 | Opus, medium | 1 | 62k | 5 | Opus at low nearly matched: spec not written first, fewer and weaker tests |
| Builder, item 3a | Opus, medium | 28 | 266k | 121 | done |
| Builder, item 3b | Opus, medium | 9 | 132k | 37 | done |
| Finisher | Sonnet, medium | 22 | 111k | 79 | done |
| Phase reviewer | Opus, medium | 6 | 173k | 47 | done (F1-F7) |
| Fixer, F1 and F4 | Opus, medium | 19 | 129k | 51 | done |
