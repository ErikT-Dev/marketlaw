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

- [ ] 1a. **Queue membership and matching** (A8.1 to A8.6, A6.3, A9.1 to A9.4 for joining and
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

- [ ] 1b. **Confirming and starting a ranked game** (A8.7 to A8.11, A9.3 and A9.4 at the start;
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

- [ ] 1c. **The `RankedQueue` Durable Object** (the server side of 1a and 1b; M2.1 across rooms and
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

- [ ] 3a. **Screens** (S10.4, S10.7, S10.9, S16.1; Q137, Q138; design boards "Lobby: in the
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

- [ ] 3b. **The busy day with queue use** (B18; Q139). **Small.**
  - `tools/simulator/busyDay/` runs Q139's queue use through the `src/server/queue/` functions
    and the lobby's, counting every queue and lobby row and alarm change; update B18's `where`
    text in `tools/harness-runner/BUDGET_CHECKS.ts`. B18 must stay within 5,000 (exit
    criterion). `simulateBusyDay.ts` has 264 lines: put the queue part in its own file.

- [ ] 4. **Deleting an account leaves the ranked queue** (A1.15, Q111). **Small.**
  - `src/server/api/accountDeletionRoute.ts`: before the rows are deleted, take the player out of
    the queue (a match they are confirming counts as declined) and free the lobby's busy entry,
    next to `logOutOfRooms`. Add a test like the one for leaving a room on deletion, and let the
    lobby driver's `deleteAccountInLobby` leave the queue too.

- [ ] Finish: finisher (required list, full check, harness, branch check, screenshots), review,
  fixes, releaser.

### Finish

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end. Test builders (Q133) work in their own worktree and
are never merged.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter | Opus, medium | 8 | 164k | 63 | done |
| Test builder, item 2 (worktree) | Sonnet, medium | 14 | 80k | 43 | done |
| Builder, item 2 | Opus, medium | 5 | 70k | 21 | done |
| Test comparer, item 2 | Opus, medium | – | – | – | Sonnet nearly matched: same code, missed the PROTOCOL_VERSION raise (Q75) |
