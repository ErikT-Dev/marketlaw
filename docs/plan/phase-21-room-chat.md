# Phase 21: Room chat

Status: in progress
Milestone: 4 Together

## Goal

One chat per room, in the waiting room, during the game and after it, with limits and muting.

## Depends on

Phase 20a.

## Covers

- Rules: A11, A9.6's chat cap, M8.2's "chat deleted with the room", M6.7 and M2.2's chat parts.
- Budgets: B7 (one row per chat message, including the site-wide count, as designed in O6); B4,
  B5 and B18 still within limits with chat in use.
- Screens: S7.1 (chat tab with unread count), S7.3, S7.4, the chat column of S11.1. Design boards
  "Game: chat", "Game: chat limit", "Chat message", the waiting room's chat column.

## Builds

1. **Chat in the room:** saved before shown, seen by everyone who joined before, except players
   who muted the sender; grey lines for joins and leaves; notifications.
2. **Message rules and limits:** one line, 1 to 200 characters as seen, at most 800 bytes; one
   message every 2 seconds; 100 per player per room; the site-wide daily cap.
3. **Mute and unmute,** known only to the player who muted.

## Known gaps after this phase

- No votes, rematches, accounts, records, ranking, menu or tutorial.

## What you can see when it's done

Chat in the waiting room and during a game across several windows; a mute hides that player only
for the one who muted.

## Exit criteria

- B7 within its limit.

## Open points

- None.

## Required scenarios

These 14 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `chat` #1: a message is seen by everyone in the room and notifies the others
- `chat` #2: a player sees only messages sent since they joined
- `chat` #3: spaces at the ends are removed and line breaks become spaces
- `chat` #4: rejects an empty message
- `chat` #5: rejects a message over 200 characters
- `chat` #6: an emoji counts as one character
- `chat` #7: rejects a message over 800 bytes even under 200 characters
- `chat` #8: rejects a second message within 2 seconds
- `chat` #9: rejects the 101st message from a player in one room
- `chat` #10: muting hides a player's messages only for the one who muted
- `chat` #11: after unmuting a player their new messages are shown again
- `chat` #12: chat continues after the game and is deleted with the room
- `connections-and-leaving` #14: a leaver stays in the room and its chat and can join another room straight away
- `lobby-queue-and-limits` #30: after 2000 chat messages on the site today no more messages are sent

## Progress

- [x] 0. Start (2026-11-06): branch `phase-21-room-chat` from master `f9224ba`. Spec gaps decided
  and written into the spec first (commit `HARNESS: Chat format, notifications, grey lines, limit
  texts and B7 rows`): Q79 (storage in chat blocks of 20, the lobby's quota blocks, mute rows,
  "since they joined", a new chat server message, `PROTOCOL_VERSION` 4) and Q80 (graphemes,
  control characters, notifications, grey line kinds, limit texts, the waiting room's chat).
  Read Q79 and Q80 before building any item; they are the design.
  - All items: the 14 scenarios run in the **lobby driver** (`tools/harness-runner/lobby/`;
    given `accounts` and `room`). Add the steps `send_chat`, `mute`, `unmute` and, for
    `connections-and-leaving` #14, `leave_game`; the given fields `site_counts_today`,
    `room.chat` and `room.messages_sent`; and the then fields `chat`, `notified`, `view_chat`,
    `chat_count`, `saved_before_shown`, `room.chat_last` and `message_to.hides`. They are already
    in `harness/scenario-format.yaml`. `LobbySession.ts` is at the 300-line limit and
    `src/client/store/ClientStore.ts` at 297: split them, do not grow them.
  - Scenarios become required only in the finisher's first run; until then check them by adding
    them to `harness/required.yaml` locally without committing, as phase 20a did.

- [x] 1. **Chat on the server** (A11.1–A11.4, A11.8, A11.9, M8.1, M8.2, M6.7, M2.2; scenarios
  `chat` #1, #2, #12, `connections-and-leaving` #14). **Large.**
  - Protocol: room intents `send_chat` (a text with a generous parse cap such as 4,000 UTF-16
    units; longer is `malformed_message`), `mute` and `unmute` (item 3 builds their effect; add
    them to the schema once, here) in `src/shared/protocol/RoomIntent.ts`. A new `ServerMessage`
    for chat entries (the full list on connect and resync, one entry when new) in
    `ServerMessage.ts` and `SERVER_MESSAGE_SCHEMA.ts`; `PROTOCOL_VERSION` 3 to 4 (Q75). Entries
    are messages (sender name, text, time, own or not) and grey lines (the S7.3 kinds, Q80).
  - Storage: a chat store beside `CompressedRoomStore` (`src/server/room/`), keys `chat:<n>` of
    20 messages each, read on load, the newest block rewritten per message (Q79). Removing the
    room deletes the chat blocks too (A11.9). The room record gains, per player, the chat
    position at their join, and the grey lines with their positions; a new record shape needs
    `ROOM_SCHEMA_VERSION` + 1 (D1: old rooms close themselves).
  - Order: save the chat block, then reply and broadcast (A11.8, `rules/multiplayer.md` "Persist
    before acknowledging"); the scenarios' `saved_before_shown` checks it.
  - Who may send and see: the players in the room record, including one who left the game but
    not the room (M6.7); a player taken out by joining elsewhere (Q64, `leaveRoomIfFreeIn.ts`) is
    gone. Each sees only entries from their join position on.
  - Reuse: `handleRoomMessage.ts` and `receiveMessage.ts` for the room intents, the
    `deliverRoomOutcome.ts` pattern in the lobby driver, `GameRoom.ts` for sending to sockets.
  - Chat never changes a player's state version and is never part of `viewFor`; the leak test
    still passes (chat carries no card ids).
  - Done (2026-11-06). The 4 scenarios pass in the lobby driver (checked locally, not yet on the
    required list). How it is built:
    - The room record has `chat` (`RoomChat`: `readers` with each player's `messageFrom` and
      `lineFrom`, the grey `lines` with their message position, `lineCount`).
      `withChatEvents` diffs the record before and after each write and adds readers and grey
      lines; `chatTrackingStorage` wraps a `RoomStorage` so every write goes through it
      (`GameRoom` and `LobbySession` use it; other harness storages do not and their players
      see no chat). `ROOM_SCHEMA_VERSION` 4, `PROTOCOL_VERSION` 4.
    - Messages: `ChatBlockStore` (`chat:<n>`, 20 per block, JSON bytes) inside
      `CompressedRoomStore`; `rooms.chat` reads them, `rooms.save(chatMessage)` appends and
      writes the newest block with the record; `storage.remove()` deletes the blocks too.
    - `handleChatIntent` (from `handleRoomMessage`, before the waiting-only room actions) returns
      `chatMessage` in `MessageOutcome`; a non-member gets `not_in_room`. An accepted
      `send_chat` is answered with the usual room `update`; the entry itself reaches every
      player, the sender included (`isOwn`), in a `chat` server message from
      `chatDeliveriesBetween`. A resync gets `chatListFor` (`isFullList: true`) after the reply.
    - Differs: `mute`/`unmute` (`playerName`) are in the schema and accepted with no effect yet.
      A room keeps its last 200 grey lines (Q81, spec S7.3). `connections-and-leaving` #15 now
      also runs in the lobby driver and passes. `GameRoom.reply` moved to `replyToSocket.ts`
      and the simulator's room record to `simulatedRoomOf.ts` to stay within 300 lines.
  - For later items: `LobbySession.ts` is at 287 lines; chat state of the driver is in
    `LobbyChat.ts` (saved messages, `notified`, `saved_before_shown`), the then fields in
    `lobbyChatThen.ts`. `send_chat` steps pass their fields straight into the intent
    (`ROOM_ACTIONS`), so item 2 must turn `text_length`/`text_kind`/`text_bytes` into a text.
    Item 2's limits need the saved messages in `MessageInput`: `rooms.chat.messages()` in
    `GameRoom`, `chat.storage.messages()` in the driver. The client ignores `chat` messages
    until item 5a (`RemoteGameHost.receive`).

- [x] 2. **Message rules and limits** (A11.5, A11.6, A9.6; scenarios `chat` #3 to #9,
  `lobby-queue-and-limits` #30). **Large.**
  - One shared function in `src/shared/` (item 5a's input counter uses it too): line breaks, tabs
    and other control characters become spaces, then trim, count graphemes with
    `Intl.Segmenter`, count UTF-8 bytes (Q80). New reason codes in `src/shared/ReasonCode.ts`:
    `message_empty`, `message_too_long` (over 200 graphemes or 800 bytes), `chat_too_fast`,
    `chat_room_limit`, `site_daily_cap` (phase 29's tutorial cap uses the same code).
  - Per player: 2 seconds since their last saved message and 100 saved messages in the room, both
    read from the chat blocks (Q79). A refused message is not saved and counts toward nothing.
    The rejection carries when they can send again (none for the room limit).
  - Site cap: the lobby (`src/server/Lobby.ts`, `src/server/lobby/`, `CountsToday.ts`) grants
    chat quota blocks of up to 20 for today, 1 lobby row per block; the room keeps what is left
    in its newest chat block (Q79). Follow the room-to-lobby call of
    `receiveCheckingGameStart.ts` (a trial first, then ask the lobby, `no_answer` if it fails).
    `countsTodayFromGiven.ts` reads `site_counts_today.chat_messages`.
  - Chat rejections count toward M9.6 like any rejected message.
  - Done (2026-11-06). The 8 scenarios pass in the lobby driver (checked locally, not yet on the
    required list). How it is built:
    - `measureChatText` and `CHAT_TEXT_LIMITS` in `src/shared/` (item 5a's counter uses them);
      bytes are counted by code point, as the engine has no `TextEncoder`.
    - `newChatMessageOf` (from `handleChatIntent`) checks in the order of Q82: text, 100 in the
      room, 2 seconds, site cap. `MessageInput.chat` is a `ChatContext` (saved messages, the
      room's `ChatQuota` `{ day, left }`, `grantQuota`); `NO_CHAT_CONTEXT` for callers without
      chat. An accepted message is a `NewChatMessage` (`message` and the quota after it) in
      `MessageOutcome.chatMessage`; every chat block stores the quota, the newest one counts.
    - Site cap: `grantChatQuota` in `src/server/lobby/` and `Lobby.grantChatQuota(now)` grant up
      to 20 of 2,000 per UTC day (`today.siteChatMessages`, read with a default of 0 so the
      deployed lobby record still parses). `receiveAskingLobby` (called by `GameRoom` through
      `receiveAskingLobbyFor`) runs a trial and asks the lobby only when an otherwise accepted
      message finds no quota left; a failed call is `no_answer`.
  - Differs: the `rejected` server message gains `sendAgainAt` (Q82; null except for
    `chat_too_fast`). `REJECTION_MESSAGES` has the S7.4 texts without the countdown.
  - For later items: the lobby driver turns `text_length`/`text_kind`/`text_bytes` into a text
    (`chatTextOfStep.ts`) and reads `messages_sent` and `site_counts_today`. `LobbySession.ts` is
    at 295 lines without blank lines (limit 300) and `GameRoom.ts` at 290: move code out before
    adding to either. The client still ignores `sendAgainAt` (`RemoteGameHost.receive`); item 5b
    needs it in `HostEvent`. The busy-day simulator (item 4) passes `NO_CHAT_CONTEXT` today.

- [x] 3. **Mute and unmute** (A11.7; scenarios `chat` #10, #11). **Small.**
  - The room record keeps who muted whom (1 row per change, B7). Each saved message records the
    players who had muted its sender at that moment; they never receive it, then or on resync,
    and get no notification. Unmuting shows only later messages. The muted player is never
    told: nothing sent to them mentions it (`message_to.hides: [muted]`).
  - A player's own mute list (S7.3, "Muted players are listed with Unmute") goes with the chat
    entries to that player only.
  - Done (2026-11-06). Scenarios `chat` #10 and #11 pass in the lobby driver (checked locally,
    not yet on the required list). How it is built:
    - `RoomChat.mutes` (`ChatMute`: `by`, `muted`, `mutedName`) in the room record;
      `chatAfterMute` (from `handleChatIntent`) adds or removes one, saved as the record's 1 row.
      Each `ChatMessage` has `hiddenFrom` (in the chat blocks too); `chatEntriesFor` leaves
      those messages out for those players, so they never get them, on resync either, and are not
      notified.
    - Every `chat` server message carries `mutedNames`, the receiver's own list
      (`mutedNamesOf`); `chatDeliveriesBetween` also sends the muter an empty-entry `chat`
      message when their list changes.
  - Differs: Q83. Muting oneself, an unknown name or a player not in the room is refused with the
    new code `player_not_in_room` (text in `REJECTION_MESSAGES`); repeated mutes and unmutes of
    nobody are accepted and write no row. Mutes stay when either player leaves. Scenario `chat`
    #11 now waits 2 seconds between Bea's messages (it contradicted A11.6). The lobby driver
    maps `player_to_mute`/`player_to_unmute` to `playerName` and checks `message_to.hides`
    against the string values of the messages sent (not their keys).
  - For later items: item 5a/5b read `mutedNames` from the `chat` message for the S7.3 muted
    list and send `{ type: "mute" | "unmute", playerName }`.

- [x] 4. **Budgets with chat** (B7, B18, B4, B5, B13; exit criterion "B7 within its limit").
  **Small.**
  - B7: measure room rows per accepted chat message, mute and unmute in the scenarios (as
    `tools/harness-runner/room/RoomSession.ts` counts rows for B1 and B2), set B7 in
    `BUDGET_CHECKS.ts` to `harness` and add it to `MEASURED_BUDGET_LIMITS.ts` (1).
  - B18: the busy-day simulator (`tools/simulator/busyDay/`) sends 2,000 chat messages across its
    rooms and counts the lobby's quota blocks and the chat blocks deleted with the rooms (Q79).
    B4, B5 and B13 must not change: chat never touches the game's row.
  - Done (2026-11-06). How it is built:
    - B7: the lobby driver counts the rows of each accepted `send_chat`, `mute` and `unmute`
      (room record writes plus the newest chat block, `LobbyChat.rowsPerChatIntent`) and reports
      them as B7 measurements; the most is 1. `BUDGET_CHECKS` B7 is `harness`,
      `MEASURED_BUDGET_LIMITS` B7 is 1. `reportBudgets.test.ts` now uses B6 as its example of a
      budget not built yet.
    - B18: after each game the busy-day simulator sends 40 chat messages per room (2,000 in all,
      `BUSY_DAY.chatMessages`) through `receiveMessage` with a real chat context
      (`busyDayChatContext`: the room's `ChatBlockStore`, the lobby's `grantChatQuota`). The
      lobby writes 100 quota blocks and the rooms delete 100 chat blocks: B18 2,526 to 2,726 of
      5,000. Rows read on the busy day 2,938 to 7,188 (B16 adds them per game). B4, B5 and B13 are
      unchanged (the games are untouched).
  - Differs: the lobby driver's alarm loop moved to `fireAlarmsUntil.ts` to make room in
    `LobbySession.ts` (284 non-blank lines now).
  - For later items: B7 is measured but becomes enforced only when it is on the required budget
    list; the finisher adds `B7` to `harness/required.yaml` budgets with the 14 scenarios
    (checked locally: measured 1 of 1).

- [x] 5a. **Chat on the screens** (S7.1, S7.3, S11.1, S9.2, M6.7, A11.4; design boards "Game:
  chat", "Chat message" and the waiting room's chat column). **Large.**
  - One chat component in three places: the Chat tab beside the draw log
    (`src/client/screens/game/LeftColumn.tsx`, `DrawLogPanel.tsx`; `Tab.tsx` already shows a
    count, spoken "Chat, 2 new"), the waiting room's right column
    (`src/client/screens/lobby/WaitingRoomPage.tsx`), and the "You left the game" page
    (`LeftGamePage.tsx`); it stays after the game ends.
  - Messages with sender, local time (`EpochMs` turned into local time only for display) and a
    Mute link on others' messages; own messages highlighted as "You"; grey lines; the input
    "Message the room…" with "N / 200" from the shared count function; the unread count while
    the tab is not open. Chat entries live in the one client store (`rules/frontend.md`) and are
    sent through `GameHost.sendRoomAction` (`src/hosts/RemoteGameHost.ts`).
  - Browser test: two or three players chat in the waiting room and in a game, in separate
    browser contexts; screenshots to `harness/screens/` for "Game: chat" and the waiting room's
    chat; sizes, 24×24 targets and axe as every S rule needs.
  - Done (2026-11-07). How it is built:
    - `HostEvent` has a `chat` event (`RemoteGameHost.receive` passes the `chat` message on).
      The store keeps `ClientState.chat` (`RoomChat`: entries, `mutedNames`, `unreadCount`) via
      `roomChatAfter`: new entries are appended, a full list replaces them; others' messages add
      to `unreadCount` (a full list adds only the messages it has beyond the old list, none on a
      fresh load); `markChatRead` clears it; entering or leaving a room empties the chat. The
      store's initial state moved to `initialClientState.ts`.
    - One `RoomChatPanel` (`src/client/screens/chat/`, entries oldest first, kept at the bottom by
      `column-reverse`, Mute button `Mute <name>` on others' messages, "You" on own, grey lines from
      `chatLineText`, local `HH:MM` from `chatTimeText`, input "Message the room…" with
      "N / 200" from `measureChatText`; Enter sends the trimmed text and clears the input; an
      empty text is never sent). It marks the chat read while it is on screen. Used by
      `DrawLogAndChatPanel` (game, tabs "Draw log" / "Chat, N new"), `RoomChatSection`
      ("Room chat", the waiting room's right column and `LeftGamePage`). Components get a
      `ChatBinding` from `chatBindingOf` (`send_chat` / `mute` through `sendRoomAction`).
    - Browser test `e2e/chat.spec.ts` (3 players); screenshots `waiting-room-chat`, `game-chat`.
  - Differs: the draw log is now a tab panel; `DrawLogPanel` became `DrawLogList`, and
    `drawLog.spec.ts` / `gameScreenSizes.spec.ts` find it as the tabpanel "Draw log" in the region
    "Draw log and chat". Chat colours are new board values in `BOARD_VALUES.ts` / `tokens.css`
    (`--color-board-chat-*`).
  - For later items (5b): the input clears on send even when the message is refused, and a chat
    rejection shows as the generic "Move rejected" toast (game) or alert (waiting room); 5b keeps
    the text and shows the S7.4 limit message over the input. `mutedNames` is in the store but not
    shown yet. The browser test spaces each player's messages more than 2 seconds apart (a player's
    second message right after the game starts was refused as `chat_too_fast`). Locally, rooms saved
    by item 1's build (record without `chat.mutes`, same `ROOM_SCHEMA_VERSION` 4) make the dev
    server log `mutedNamesOf` errors from their alarms; clearing `.wrangler/state` stops them;
    nothing deployed has version 4.

- [x] 5b. **Mute and limits on the screens** (S7.3 muted list, S7.4; design board "Game: chat
  limit"). **Small.**
  - Mute and Unmute links, "You muted Ann" rows with Unmute; the limit message over the input with
    the S7.4 texts and a countdown from the rejection's time; the refused text stays in the input.
    Browser test: a mute hides messages in one window only; a fast second message shows the limit
    message. Screenshot for "Game: chat limit".
  - Done (2026-11-07). How it is built:
    - `HostEvent` `rejected` carries `sendAgainAt`. The store's `RoomChat` gains
      `unansweredTexts` (texts sent and not yet answered, `chatAfterSending`; an own message in a
      new-entries `chat` event answers the oldest, a full list clears them) and `refused`
      (`RefusedChatMessage`: code, `sendAgainAt`, text). A rejection with one of
      `CHAT_LIMIT_CODES` (`message_empty`, `message_too_long`, `chat_too_fast`,
      `chat_room_limit`, `site_daily_cap`) becomes `refused` with the oldest unanswered text
      (`chatAfterRefusal`) instead of a rejected move, so no toast or alert; the next send clears it.
    - `RoomChatPanel`: `MutedPlayersList` ("Muted players", rows "You muted Ann" with a button
      `Unmute Ann`, `ChatBinding.onUnmute` sends `unmute`) above the messages; `ChatLimitMessage`
      (role `status`) directly over the input with `chatLimitText`: the `REJECTION_MESSAGES` text,
      for `chat_too_fast` plus "Try again in N seconds." / "1 second." from `useServerNow`, and gone
      when the time is up. `ChatInput` puts the refused text back when the field is empty.
      `GamePage` gives `LeftGamePage` the server clock offset too.
    - Browser test `e2e/chat.spec.ts` "a mute hides messages in one window only ..." (3 players in
      a game); screenshot `game-chat-limit`. New board colours `--color-board-chat-muted`,
      `-limit`, `-limit-text` (from the board) in `BOARD_VALUES.ts` / `tokens.css`.
  - Differs: the design board puts the limit message above the tabs; S7.4 says over the input,
    so it is there (spec wins). A mute refused as `player_not_in_room` still shows as the generic
    rejection. The Mute link stays on a muted player's earlier messages (muting again is a no-op).
  - For later items: local `.wrangler/state` cleared means `npm run db:migrate:local` before the
    browser tests (guest sign-in fails otherwise).

### Finish

- [x] Add the 14 required scenarios to `harness/required.yaml`; full check, harness, browser
  tests, budgets (B7 within its limit).
  - First run (2026-11-07): commit `b8e6c7e` (`HARNESS:`) adds the 14 scenarios (a new `chat`
    section with #1 to #12, `connections-and-leaving` #14, `lobby-queue-and-limits` #30) and B7
    to the required budgets. `npm run check` green (455 tests, client 145.22 kB of 300 kB
    gzipped). `npm run harness` green: 433 scenarios, 1,000 simulated games, B7 measured 1 of 1,
    B18 2,726 of 5,000. Browser tests: shard 1/2 59 passed; shard 2/2 54 passed and 1 failed
    (`roomsAndGuests` "guests get a name ..." at 1920x1080, the username prompt did not appear in
    time, the known two-worker load problem), which passed on its own rerun; the whole games with
    2, 3 and 4 players passed at all three sizes. Screenshots from these runs committed.
    `docs/enforcement.md` lists the phase's harness checks (chat steps, B7, B18 with chat) and
    browser tests.

- [x] Review findings (phase reviewer, 2026-11-07; no blocker). One fixer takes all five.
  1. Should fix: `saved_before_shown` cannot fail. `tools/harness-runner/lobby/LobbyChat.ts`
     63-81 saves in the driver's own storage, then checks its own order, so it never tests
     `GameRoom.receive` (save, then `replyToSocket`, then `sendChatSince`). Make a test fail if
     a message is shown before its chat block is put (for example a recording kv under
     `CompressedRoomStore` with the GameRoom sequence, or a GameRoom test with a recording socket).
     - fixed (`6a6c14a`): GameRoom's steps after a received message moved into
       `src/server/publishReceived.ts` (and `sendChatSince.ts`), which GameRoom calls; the new
       `publishReceived.test.ts` runs it over a `CompressedRoomStore` on a recording kv with
       recording sockets and fails if the sender is answered or anyone is shown the message
       before its chat block is put (checked by moving the save after the reply). The harness
       step `saved_before_shown` still checks only the driver's own order; the server test is
       the real guard.
  2. Should fix: `src/server/room/roomChat.test.ts` 197-204 "shows only messages sent after an
     unmute" passes when unmute does nothing (the later message is Cat's). After the unmute,
     advance 2 seconds, let Bea send "second" and expect `["second"]` for Ann.
     - fixed (`5436000`): the test room has a clock; the test does exactly that.
  3. Suggestion: `src/shared/measureChatText.ts` line 3 turns CRLF into two spaces; A11.5 calls
     it one line break. Turn `\r\n` into one space first (update the tests that lock in
     `"good  game"`), or record the choice in Q80 and the spec.
     - fixed (`30f96a4`): CR LF becomes one space; both tests now expect `"good game"`;
       recorded in Q80 (the spec already says a line break becomes a space).
  4. Suggestion: `src/client/store/chatAfterRefusal.ts` 16-18 and `ChatInput.tsx` 30: a
     `send_chat` refused with a code outside `CHAT_LIMIT_CODES` (`no_answer`, `not_in_room`)
     leaves its text in `unansweredTexts`, so later answers pair with the wrong text, and the
     refused text is lost (S7.4 "A refused message stays in the input", A11.6 "for any reason").
     Remove the oldest unanswered text on every `send_chat` refusal and put it back in the input.
     - fixed (`956dfb2`): `CHAT_LIMIT_CODES` became `CHAT_REFUSAL_CODES` with `not_in_room` and
       `no_answer`; such a refusal takes the oldest unanswered text back into the input, with
       its reason over it. Those two codes also answer other room intents, so they count as a
       chat refusal only while a message is unanswered (Q80). Store test added; chat browser
       test green.
  5. Note: room intents carry no action id, so a resent `send_chat` over 2 seconds later would be
     saved twice (`rules/multiplayer.md` "Idempotent, ordered actions"). Record it as a known
     limit in Q79; no resend exists today.
     - answered (`811d3f4`): recorded as a known limit in Q79.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 8 | 157k | 65 | done |
| Builder, item 1 | 25 | 228k | 107 | done |
| Builder, item 2 | 20 | 187k | 103 | done |
| Builder, items 3 and 4 | 21 | 180k | 91 | done |
| Builder, item 5a | 29 | 220k | 105 | done |
| Builder, item 5b | 12 | 128k | 49 | done |
| Finisher | 29 | 95k | 40 | done |
| Phase reviewer | 9 | 157k | 58 | done, 5 findings |
| Fixer, findings 1 to 5 | 15 | 133k | 73 | done |
