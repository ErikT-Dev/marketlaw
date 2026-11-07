# Phase 22: Abandon vote and rematch

Status: in progress
Milestone: 4 Together

## Goal

Casual games can be abandoned by a unanimous vote, and a finished room can start a rematch.

## Depends on

Phase 20a.

## Covers

- Rules: M7 (including M7.5's answer count; the ranked case comes with ranked games in phase 26),
  M8.4–M8.6.
- Screens: S9.3 (calling, answering, "1 of 2 players answered", the vote failing), S9.5's
  abandoned-by-vote version and the rematch button, S11.4 (the room after a game, the rematch
  dialog). Design boards "Pop-up: call abandon vote", "Pop-up: answer abandon vote", "Game: vote
  failed", "Waiting room: after the game", "Waiting room: rematch asked". Per `screens.md` S17,
  the vote dialogs also show how many players have answered.

## Builds

1. **Abandon vote:** one every 5 turns, one open at a time, 1 minute to answer, no answer counts
   as no, clocks keep running.
2. **Rematch:** at least 2 players in a finished room, everyone accepts within 20 seconds, a new
   casual game from setup in the same room, the deletion time restarts.
3. **Screens** for both.

## Known gaps after this phase

- No accounts, records, ranking, menu or tutorial.

## What you can see when it's done

Call a vote in a three-window game and watch it pass or fail; finish a game and start a rematch.

## Exit criteria

- See "What every phase must meet" in `README.md`.

## Open points

- None.

## Required scenarios

These 16 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `connections-and-leaving` #18: everyone else voting yes abandons a casual game
- `connections-and-leaving` #19: players see how many have answered a vote but not who or how
- `connections-and-leaving` #20: an away player who does not answer counts as voting no
- `connections-and-leaving` #21: timers keep running during a vote
- `connections-and-leaving` #23: a game can have at most one vote every 5 turns
- `connections-and-leaving` #24: a new vote can be called 5 turns after the last one
- `connections-and-leaving` #25: only one vote can be open at a time
- `connections-and-leaving` #26: rejects voting when no vote is open
- `rooms` #23: a rematch starts a new casual game when everyone in the room accepts
- `rooms` #24: every player in the room sees who has accepted a rematch so far
- `rooms` #25: rejects a rematch with fewer than 2 players in the room
- `rooms` #26: a declined rematch leaves the room as it was
- `connections-and-leaving` #28: a vote closes as soon as every player asked has answered (Q84)
- `connections-and-leaving` #29: the player who called a vote cannot answer it (Q84)
- `connections-and-leaving` #30: a player who leaves during a vote is no longer asked (Q84)
- `rooms` #28: a player leaving the room ends a rematch asking (Q85)

## Progress

- [x] 0. Start (2026-11-07): branch `phase-22-abandon-vote-and-rematch` from master `66bc20c`.
  Spec gaps decided and written into the spec first (commit `HARNESS: Abandon vote and rematch
  details (Q84-Q86)`): Q84 (how a vote runs, new rule M7.6, new code `vote_already_answered`),
  Q85 (how a rematch runs, new sentences in M8.4 and M8.5), Q86 (Close on the end screen leads
  to the room after the game, S11.4). Four new scenarios join the phase's list (16 in all).
  Read Q84 to Q86 before building any item; they are the design.
  - All items: scenarios become required only in the finisher's first run; until then check
    them by adding them to `harness/required.yaml` locally without committing.
  - Every message shape change raises `PROTOCOL_VERSION` (now 4) once per item that changes it
    (`proposed-rules.md`); a new `GameState` shape raises `SAVE_SCHEMA_VERSION` (now 14), a new
    room record shape `ROOM_SCHEMA_VERSION` (now 4) (D1: old rooms close themselves).
  - Files at the line limit: `tools/harness-runner/lobby/LobbySession.ts` (309 lines) and
    `src/client/store/ClientStore.ts` (312): split them, do not grow them.
  - `connections-and-leaving` #22 (ranked games refuse votes) is not in this phase (phase 26).

- [x] 1. **Abandon vote in the engine** (M7.1–M7.6; scenarios `connections-and-leaving` #18,
  #19, #21, #23, #24, #25, #26, #28, #29, #30). **Large.**
  - `GameState` gains the open vote (caller, seats asked, answers, deadline) and the turn of the
    last vote called; new player actions `call_vote` and `vote` (`yes`/`no`) in `GameAction.ts`,
    handled through `apply.ts` / `receiveAction.ts` like `leave_game`; rejections
    `vote_too_soon`, `vote_already_open`, `no_vote_open`, `vote_already_answered`, plus the
    existing `not_in_game` and `game_over` (add the new codes to `src/shared/ReasonCode.ts`).
  - Closing: when every seat still asked has answered, at once; at the deadline, through
    `earliestDeadline.ts` and `applyDueTimeOuts.ts` (a system action, so replays and the action
    log keep it). `leaveGame.ts` drops the leaver from the seats asked and closes the vote if the
    rest have all answered. A game that ends otherwise clears the vote.
  - Passing ends the game with a new `GameEnding` `abandoned_by_vote` (`src/shared/GameEnding.ts`;
    `isAbandoned.ts` includes it), via `endGame.ts` as `abandonPausedGame.ts` does. Seat clocks
    are untouched by the vote (#21).
  - View (`viewFor.ts`, `PlayerView.ts`, shared types, each in its own file): the open vote
    (caller seat, deadline, `answered`, `of`, whether this seat still has to answer) and the next
    turn a vote is possible. Never who answered or how (M7.5). The client and the game update
    schema must accept the new fields (`GAME_RESULT_SCHEMA.ts`, `SERVER_MESSAGE_SCHEMA.ts`);
    raise `PROTOCOL_VERSION` and `SAVE_SCHEMA_VERSION`.
  - Engine driver (`tools/harness-runner/engine/`): steps `call_vote` and `vote` in
    `ENGINE_FIELDS.ts` and `actionFromStep.ts`; given `last_vote_turn` (`GIVEN_SCHEMA.ts`,
    `stateFromGiven.ts`); then `vote: open|closed` and `view.vote_answers` (`readEngineThen.ts`,
    `viewThen.ts`). `ended.abandoned` already reads `isAbandoned`.
  - Bots (`src/bots/`) never call or answer votes; the simulator must stay green, and the
    invariants (`invariantViolations.ts`) must accept the new state.
  - The browser tests start rooms from a given state (`src/server/testRooms/GAME_STATE_SCHEMA.ts`):
    it must take the new state fields.
  - Done (2026-11-07): `GameState.vote` (`OpenVote`: caller, asked, ballots, deadline) and
    `lastVoteTurn`; actions `call_vote`, `vote` (`answer: "yes" | "no"`) and the system action
    `close_vote` (seat = the caller), logged when the minute is over through `applyDueTimeOuts`.
    `receiveAction` catches up due deadlines before a vote action and skips the out-of-time
    checks for it (a done or timed-out player can still answer). View: `PlayerView.vote`
    (`VoteView`: caller, deadline, answered, of, hasToAnswer; null for a player who left) and
    `nextVoteTurn`. `PROTOCOL_VERSION` 5, `SAVE_SCHEMA_VERSION` 15. The ten scenarios pass.
  - For later items: `withTimeOutsApplied` raises the state version of a logged action's seat,
    so a vote closing at its deadline raises the caller's version (item 2 decides whether that
    stays). `REJECTION_MESSAGES` has placeholder vote texts; `vote_too_soon` must become "Next
    vote possible in turn N." from `view.nextVoteTurn` (item 4). `gameOverTexts` already has
    the abandoned-by-vote text. A one-seat game (tutorial) would pass a vote at once, since
    nobody is asked.

- [ ] 2. **Abandon vote in the room and protocol** (M7.3, M9.4; scenario
  `connections-and-leaving` #20). **Small.**
  - `ActionIntent.ts` / `ACTION_TYPES.ts`: the two new intents, parsed at the boundary.
  - `acceptAction.ts` / `isChangeVisibleToAll.ts`: a vote call or answer raises only the actor's
    state version (Q84); the others still get the new view, since `playersWhoseUpdateChanged`
    compares views. The room alarm follows `earliestDeadline` through the existing game alarm
    (`fireGameAlarm.ts`, `nextAlarmAt.ts`): check it fires for the vote deadline and that one
    alarm per room still holds.
  - Room driver (`tools/harness-runner/room/ROOM_DRIVER.ts`, 240 lines): steps `call_vote` and
    `vote`, so #20 (given `seats.connected: false`) runs there; it also needs the then fields
    `phase` and `vote` from item 1.
  - Hostile-client unit tests in `src/server/room/` for the new intents (duplicate action id,
    stale version, a seat that left).

- [ ] 3. **Rematch on the server** (M8.4–M8.6, M2.2, A9.2–A9.4; scenarios `rooms` #23, #24,
  #25, #26, #28). **Large.**
  - `RoomIntent.ts`: `ask_rematch`; reason code `rematch_not_possible`. Raise
    `PROTOCOL_VERSION`.
  - Reuse the M1.10 asking: `RoomWaiting.asking` (`RoomAsking.ts`) with
    `ROOM_TIMES.acceptMs`, `accept_game` / `decline_game` in `handleRoomMessage.ts` and the
    acceptance path in `receiveCheckingGameStart.ts`, `startGameWithinLimits.ts`,
    `startRoomGame.ts`. In an ended room a decline or time-out ends the asking with no removal
    and no rejoin block (unlike M1.11); leaving the room (`roomWithout.ts`,
    `leaveRoomIfFreeIn.ts` for M2.2) ends it too. `withAskingIfFull.ts` must not start an asking
    in an ended room.
  - The new game replaces `RoomGame` with every player in the room (Q85), kind `casual`;
    `RoomGame.kind` widens to `"casual" | "ranked"` (`ROOM_SCHEMA_VERSION` + 1 if the stored
    schema changes). `endedRoomDeletionAt.ts` then reads the new game, so M8.6 follows; check
    that `saveReplayRecordIfEnded` does not fire for the rematch start. Chat stays.
  - `RoomView` must let the client show the rematch: `asking` in an ended room (already in the
    view) and the room's deletion time for S11.4 (`endedRoomDeletionAt`).
  - Lobby driver (`tools/harness-runner/lobby/`): step `ask_rematch`; given `room.kind`
    (`LOBBY_GIVEN_SCHEMA.ts`, `lobbyRoomFromGiven.ts`); then `room.accepted` and `game.kind`
    already exist. `LobbySession.ts` is over the limit: split it first.

- [ ] 4. **Vote screens** (S9.3, S9.5 abandoned by vote, S16.3; design boards "Pop-up: call
  abandon vote", "Pop-up: answer abandon vote", "Game: vote failed", "End: game abandoned" in
  `design/export/game-endings-and-votes/contents.md`). **Large.**
  - A button to call a vote beside **Leave game** (`LeaveGameButton.tsx`, `LeaveGameDialog.tsx`
    are the pattern), the confirmation dialog explaining M7, the answer dialog with time left
    and "1 of 2 players answered" (S17: the boards lack the count), the count for the caller
    too, the "vote failed" message with the next vote's turn, and the abandoned-by-vote end
    screen ("All players voted yes, so the game ended with no winner.", no table) in
    `GameOverDialog.tsx` / `gameOverTexts.ts`. Rejection texts in `REJECTION_MESSAGES.ts`.
  - Browser test with three windows (call, answer, pass; call, fail), screenshots at the three
    sizes into `harness/screens/`, axe, click targets at least 24 px.

- [ ] 5. **Room after the game and rematch screens** (S9.5 rematch button, S11.4; design boards
  "Waiting room: after the game", "Waiting room: rematch asked" in
  `design/export/lobby-and-waiting-room/contents.md`). **Large.**
  - Close on the end screen leads to the room after the game (Q86): reuse `WaitingRoomPage.tsx`
    (`WaitingRoomHeader.tsx`, `WaitingPlayers.tsx`) without the size control and free places
    (S17), with the result line and **Show result**, **Ask for a rematch** (disabled with fewer
    than 2 players), **Leave room**, and the deletion time. `GameOverNotice.tsx` (the board's
    Show result) goes away. Also the Ask for a rematch button on the end screen.
  - The rematch dialog reuses `AcceptDialog.tsx` (time left, accepted usernames; the asker is
    not shown as accepted, S17). When the rematch starts, every player sees the new game.
  - Browser test: finish a game (the test rooms in `src/server/testRooms/` can start one near
    its end), ask, accept, see the new game; a decline leaves the room as it was. Screenshots at
    the three sizes, axe.

### Finish

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 14 | 147k | 72 | done |
| Builder, item 1 | 12 | 155k | 64 | done |
