# Phase 29: Tutorial

Status: in progress
Milestone: 6 Learning

## Goal

The guided one-player tutorial of `tutorial.md`, played on the server in a tutorial room, offered
from the game menu.

## Depends on

Phases 27 (no rating change) and 28 (the menu).

## Covers

- Rules: C4, C1.2's Tutorial entry, T0–T5, A9.5, A9.6's tutorial cap, M2.1 for the tutorial.
- Budgets: B6; B18 with tutorials in the busy-day simulator.
- Screens: S15, S14.1's Tutorial entry. Design boards "Menu: game menu in the lobby" (without its
  old ranked text, S17), "Tutorial base 1920x940" and "Tutorial: …" (all 7).

## Builds

1. **Tutorial room:** one seat, fixed deck, marketplace, quests and random sequence; no time
   limits; no record; deleted when left or after 30 minutes without a connection.
2. **Steps:** only the step's action is accepted, anything else rejected with `not_this_step`;
   texts exactly as in `tutorial.md`.
3. **Screens:** text box with "Step N of 21", highlights, Continue, Restart, complete, leave.

## Known gaps after this phase

- Whatever phase 30 finds.

## What you can see when it's done

Start the tutorial from the menu as a new visitor, play all 5 turns, and finish it.

## Exit criteria

- B6 within its limit.

## Open points

- None.

## Required scenarios

These 17 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `client` #1: the game menu offers rules card set and tutorial in the lobby
- `client` #10: a visitor who is not logged in becomes a guest before the tutorial starts
- `client` #11: in the tutorial any action other than the step's action is rejected
- `client` #12: the tutorial has no time limits
- `client` #13: finishing the tutorial creates no game record and changes no rating
- `client` #14: leaving the tutorial deletes its room and it can start again from the beginning
- `client` #15: a player in the tutorial cannot join a room or the queue
- `client` #17: a tutorial room whose player has been away for 30 minutes is deleted
- `lobby-queue-and-limits` #28: the tutorial does not count toward the daily limits
- `lobby-queue-and-limits` #29: after 100 tutorials start on the site today no more tutorials start
- `tutorial` #1: the tutorial starts with the fixed hand quests and bonus types
- `tutorial` #2: tutorial turn 1 teaches playing selling and ending the turn
- `tutorial` #3: tutorial turn 2 teaches the market and combos
- `tutorial` #4: tutorial turn 3 teaches drawing from the deck and real cost
- `tutorial` #5: tutorial turn 4 teaches product and the first bonus fund
- `tutorial` #6: tutorial turn 5 teaches income and quests and then ends
- `tutorial` #7: the tutorial rejects playing a different card than the step asks for

## Progress

- [x] 0. Start (2026-11-17): branch `phase-29-tutorial`. Spec gaps decided and written into the
  spec first (commit `HARNESS: Tutorial text box, restart and after the last step settled (S15,
  C1.2, C4.8, A9.6; Q161-Q164)`): Q161 (19 steps, "Step N of 19"; the text box shows the previous
  step's text after its action, the step's text and its action line; the "waiting for" words of
  every step are the table in S15.7), Q162 (Restart and Play it again restart from T1.1 without
  asking and count as a tutorial start for A9.6's cap), Q163 (after Finish the player stays in
  the ended tutorial with Tutorial complete until they leave or C4.10 deletes it; opening the
  site brings a player in a tutorial back to it; dialog texts in S15.4), Q164 (the menu place
  `game_over` **offers** Tutorial, unlike phase 28's note: C1.2 with M2.2 and M6.7; starting it
  takes the player out of the room). Read them and S15 before building any item.
  - The spec's numbers were checked against `cards.json` for T1.2 to T5.2 (costs, stats, real
    cost); they agree.
  - Every message shape change raises `PROTOCOL_VERSION` (now 25) once in the phase, in the
    first item that changes a message (`proposed-rules.md`); a changed saved shape raises its
    schema version (`ROOM_SCHEMA_VERSION` 5, `SAVE_SCHEMA_VERSION` 17); no migration (D1).
  - Rules stay in the engine (`rules/architecture.md`, Thin server): which action a step
    accepts (C4.4), the fixed setup (T0) and the step order are pure code in `src/rules/`
    (suggested `src/rules/tutorial/`); the room only orchestrates.
  - Scenarios: `given.tutorial: {player, step}` is reached by playing the tutorial's own steps
    from T1.1 up to that step. A driver is chosen by field names (`runScenario.ts`,
    `missingFor`), so one driver must list every given, step and then field its scenarios use.
    All items: scenarios become required only in the finisher's run; check them by adding them
    to `harness/required.yaml` locally without committing.
  - Files at the line limit (300 non-blank lines): `src/server/GameRoom.ts` (288),
    `tools/harness-runner/room/RoomSession.ts` (282), `tools/harness-runner/room/ROOM_DRIVER.ts`
    (269). Split them before growing them, or keep the tutorial out of them.
  - Order: 1, 2, 3, 4 in order. 5 and 6a after 3; 6b after 6a.

- [x] 1. **Tutorial engine** (T0–T5, C4.1, C4.3, C4.4, C4.5; Q161; scenarios `tutorial` #1–#7,
  `client` #11, #12). **Large.**
  - A pure tutorial in `src/rules/`: the fixed setup of T0 (stats R2.1, the 7-card hand, quests
    T0.3, bonus types T0.4, the turn 2 marketplace) and a fixed deck order plus a fixed `Random`
    (T0.6), so every draw and marketplace refill of T0.5 and the steps happens as written. Draws
    take a sector from `random.pickSector()` and a tier from `pickTier` (`drawRandomCard.ts`,
    `drawIntoHand.ts`), then the deck; the marketplace refills through `fillMarketplace.ts`.
    Read how R18.13 and R18.14 remove and refill places before arranging the deck.
  - The steps T1.1 to T5.4 in order, each with the one action it accepts (text steps accept a
    `continue`; T5.4's continue is Finish and ends the tutorial, C4.6). Any other action,
    including undo, is rejected with `not_this_step` (already in `ReasonCode.ts`) and changes
    nothing; the accepted action goes through the normal `apply`. No time-outs (C4.5): no clock
    deadlines (`dueTimeOuts.ts`, `TIME_RULES.ts`). Choose between a `GameKind` "tutorial" and a
    tutorial state wrapping `GameState`, and say which in the note.
  - Restart (Q162) returns to the T1.1 state. The step id and its number (1 to 19) go into the
    player's view so the client can show S15.5 to S15.7 (the words stay in the client).
  - Scenarios through a new tutorial driver (`tools/harness-runner/tutorial/`, added to
    `DRIVERS.ts`), reusing the engine driver's `seatThen.ts`, `viewThen.ts` and
    `actionFromStep.ts` where they fit. Item 2 moves the driver onto the room.
  - Test first: unit tests for `not_this_step` on every step kind (a card, a draw option, a
    sector, claim all, end turn, continue).
  - Done (2026-11-17): a tutorial state wrapping `GameState` (no new `GameKind`).
    `src/rules/tutorial/`: `TutorialState` `{ stage, game }` (stage a step id or `"complete"`);
    `startTutorial(at)` (also Restart); `applyTutorialAction(tutorial, action, at)` takes a
    `GameAction` or `{ type: "continue" }`, and anything but the step's action, or anything after
    completion, is `not_this_step`; `tutorialViewFor` gives `TutorialView` `{ progress, game }`,
    progress `{ kind: "step", step, number }` or `{ kind: "complete" }`. `TUTORIAL_STEPS` lists
    each step's action and the cards it draws; the deck starts with those cards in that order,
    and each step's `Random` (`tutorialRandomFor`) answers sector and tier from them (no seed).
    Shared: `TUTORIAL_STEP_IDS`, `TutorialStepId`, `TutorialStage`, `TutorialProgress`,
    `TutorialView`. Driver `tools/harness-runner/tutorial/` (last in `DRIVERS.ts`) passes the 9
    item scenarios. No message changed yet, so `PROTOCOL_VERSION` is still 25.
  - For later items: the state at a step is fully determined by the step, so the room can save
    `TutorialState` as it is. The engine never applies time-outs to a tutorial; the room must not
    schedule time-out alarms (`earliestDeadline`) for it. `client` #12 passes trivially in the
    engine-level driver; item 2 makes it pass through the room. The driver maps a step's
    `player` to seat 1.

- [x] 2. **Tutorial room** (C4.2, C4.5, C4.6, C4.8, C4.10; B6; scenarios `client` #12, #13, #14,
  #17; the item 1 scenarios through the room). **Large.**
  - Done (2026-11-17), Q165: a new SQLite Durable Object class `TutorialRoom` (`v6`, binding
    `TUTORIAL`), one per player (`idFromName(playerId)`), socket `/api/tutorials/<playerId>/socket`;
    pure handling in `src/server/tutorial/` (`receiveTutorialMessage`, `startTutorialIn`,
    `TutorialRecord`). Messages `resync`, `action`, and `tutorial` (`continue`,
    `restart_tutorial`, `leave_tutorial`, versioned); answer `tutorial_update` (`TutorialView`),
    leave answers `removed` and deletes the storage. `GameHost.sendTutorialAction`, `HostEvent`
    `tutorial_update` (ClientStore ignores it for now). `PROTOCOL_VERSION` 26. One alarm: set at
    start and when the last socket closes (30 min, `ROOM_TIMES.tutorialAwayMs`); firing with no
    socket open deletes the room. B6 measured by the tutorial driver: 21 rows (limit 60).
    `acceptRoomSocket` now shared by `GameRoom` and `TutorialRoom` (jscpd).
  - The tutorial driver now runs through the room (`TutorialSession`): given steps are played as
    messages; `start_tutorial` calls `startTutorialIn` directly.
  - For later items: nothing calls `TutorialRoom.start(player)` yet; item 3 adds the lobby start
    route (cap, busy places) and must also count Restart (`restart_tutorial` reaches only the room
    today) and release the player when the room is left or deleted by its alarm (the room does
    not report to the lobby yet). Item 3 should move the driver's `start_tutorial` onto the lobby
    path. Finisher: add B6 to `required.yaml` budgets with the scenarios. Item 6a: the store
    must handle `tutorial_update` and open a `RemoteGameHost` on the tutorial socket URL.
  - One seat, no record (A3), no rating (A10), no chat, no asking, no votes; deleted when left
    (C4.8) and by its one alarm 30 minutes after its last connection closed (C4.10; one alarm per
    room, `rules/cloudflare.md`). Persist before acknowledging, one write per accepted action
    (`continue` included). Restart resets in place (Q162).
  - Choose between a new SQLite Durable Object class (a `v6` migration in `wrangler.jsonc`, free
    as the other classes are) named per player with `idFromName`, and a mode of `GameRoom` (288
    lines, would need splitting). Reuse the socket and publishing pieces (`RoomSockets.ts`,
    `PublishingRoom.ts`, `PublishingSockets.ts`, `attachmentOf.ts`,
    `acceptedSocketResponse.ts`, `applyRoomAlarm.ts`, `ROOM_TIMES.ts`), `viewFor`, and the
    intent schemas in `src/shared/`. Record the choice in the note.
  - Intents: start, continue, restart, leave, and the game intents the steps use; the view adds
    the tutorial step (raise `PROTOCOL_VERSION`). `RemoteGameHost` must reach the tutorial room
    and pass the host contract tests.
  - B6 (60 rows for T0 to T5): replace `B6: { by: "not built", … }` in
    `tools/harness-runner/BUDGET_CHECKS.ts` with a real measurement (rows written while playing
    T1.1 to T5.4 once) and update its case in `reportBudgets.test.ts`.
  - Scenario fields `record`, `ratings`, `disconnect`, `wait_ms`: reuse `recordThen.ts`,
    `ratingsThen.ts`, `givenRatingsOf.ts` (room driver) and `fireAlarmsUntil.ts` (lobby driver).

- [x] 3. **Tutorial in the lobby: one thing at a time, limits and the cap** (C4.6, C4.7, C4.9,
  M2.1, A9.5, A9.6; Q162, Q163, Q164; scenarios `client` #10, #15, `lobby-queue-and-limits` #28,
  #29). **Large.**
  - The lobby's busy places (`BusyPlace.ts`, `claimPlayer.ts`, `releasePlayer.ts`,
    `isReallyBusy.ts`) gain the tutorial: a player in a tutorial gets `busy_elsewhere` when
    joining a room or the queue (`joinRoomRoute.ts`, `createRoomRoute.ts`, `joinQueue.ts`), and
    a player waiting in a room or the queue, or in a game, gets `busy_elsewhere` when starting
    the tutorial. Starting from a finished or left game takes the player out of that room
    (`leaveFinishedRooms.ts`, Q164). Leaving or deleting the tutorial releases the player.
  - Starting skips A9.2 to A9.4 (A9.5) and counts a site tutorial start in `CountsToday` (1 row;
    Q52 counted game and tutorial starts at 1 row each); at 100 it is refused with
    `site_daily_cap` and "Daily limit reached, try again after 00:00 UTC" (already in
    `REJECTION_MESSAGES.ts`). Restart counts too (Q162). The lobby given `site_counts_today:
    {tutorials}` is already in `LOBBY_GIVEN_SCHEMA.ts`.
  - A visitor becomes a guest first (C4.7, A1.2), as when joining a game: reuse that flow
    (`createGuestRoute.ts`; `logInVisitor.ts` in the lobby driver).
  - Opening the site while in a tutorial goes back to it (Q163): do what is done for a player in
    a game (`isInGame.ts`, `sessionRoute.ts`).
  - Done (2026-11-18), Q166: `POST /api/tutorials` (`startTutorialRoute`, body `{ token }`,
    answer `TutorialStartResponse` `{ isOk: true }` or `{ isOk: false, reason }`): `isReallyBusy`
    (now asks `TutorialRoom.isPlayerBusy` for the place `TUTORIAL_PLACE`), then
    `Lobby.startTutorial` (`countTutorialStart`: `busy_elsewhere` or `site_daily_cap`, else
    claims the tutorial place and counts `siteTutorialStarts`), then `TutorialRoom.start`, then
    `leaveFinishedRooms`. Restart: `TutorialRoom` asks `Lobby.startTutorial` before a restart it
    would accept (`restartingPlayerOf`) and passes the refusal in `TutorialInput.restartRefusal`.
    Leaving and the alarm's deletion call `Lobby.release(player, TUTORIAL_PLACE)`. The site cap
    reads `TEST_SITE_TUTORIALS_PER_DAY` (`.dev.vars`, `check.yml`, `deploy.yml`: 1000000).
    No message shape changed (`PROTOCOL_VERSION` still 26). Route test
    `tools/route-tests/tutorialStartRoute.test.ts`.
  - Driver: `TutorialSession` starts and restarts through `countTutorialStart` on a lobby record
    (its own, or the lobby driver's through `TutorialSessionLinks`). The lobby driver now runs
    `given.tutorial`, `start_tutorial` (player, and visitor through `visitorAwaits` before
    `create_guest`), `tutorial_step` and `tutorial_room` (`lobbyTutorialSteps.ts`), so it also
    takes `client` #12 and #17; the tutorial driver keeps the rest.
  - Differs from the phase file: opening the site in a tutorial is client work (a game's return
    is the stored session, not `sessionRoute`), left to item 6a. A player stays busy in an ended
    tutorial until they leave it (Q166).
  - For later items: item 4 counts a tutorial start as `countTutorialStart` (1 lobby row) plus
    the room's rows; item 5 starts the tutorial with `POST /api/tutorials` and shows the
    rejection through `REJECTION_MESSAGES`; item 6a must bring a player back to their tutorial
    when the site opens (store it in the session as `roomCode` is for games) and handle a
    rejected Restart (`site_daily_cap`).

- [x] 4. **Busy day with tutorials** (B18). **Small.**
  - `tools/simulator/busyDay/`: add the day's 100 tutorials (start, play, leave) through the
    lobby code, counting their lobby rows and alarm changes in B18; their room rows are B6's
    and stay out of B18 (the budget's text). Update B18's `where` text in `BUDGET_CHECKS.ts`.
  - Done (2026-11-18): `playBusyDayTutorials.ts` plays 100 tutorials after the queue use, each
    through the lobby and tutorial room code: `countTutorialStart` on the busy day's lobby,
    `startTutorialIn`, `leave_tutorial` through `receiveTutorialMessage`, then `releasePlayer`.
    Differs from the phase file: the 19 steps are not played in the busy day. Their rows are B6's
    and change nothing B18 counts, and playing them made the busy-day test time out under the
    check's load (about 0.4 s more per run); without them a run costs about 0.1 s more. Per tutorial B18 gains 2 lobby
    rows (start, release), 1 alarm change (the alarm delete on leaving) and 1 room row (the storage delete on leaving): B6 stops at the end of T5.4, so the leave is
    counted here, as a game room's cleanup delete is. Busy day 3,794 -> 4,194 rows (limit 5,000);
    reads 7,539 -> 8,039.

- [x] 5. **Tutorial in the game menu** (C1.2, S14.1, Q159, Q164; scenario `client` #1).
  **Small.**
  - `gameMenuEntriesOf` (`src/client/screens/menu/`) adds Tutorial, "A guided one-player game
    that teaches the first turns", which starts the tutorial (item 3's start). In
    `waiting_room` and `game`, and while the player is in the ranked queue, it is shown disabled
    with "Not available while you are in a game, a room or the ranked queue" and is not listed
    in a scenario's `menu` (Q159). `game_over` offers it (Q164). `GameMenuPlace` has no queue
    case yet (`lobby`, `waiting_room`, `game`, `game_over`): add one, or let the lobby pass
    whether the player is queued (`LobbyTopBar.tsx`).
  - `e2e/gameMenu.spec.ts` line 24 expects no Tutorial button; change it to the disabled entry
    with its reason and add the lobby entry. The client driver's `open_menu` stays as it is.
  - Done (2026-11-18): `GameMenuEntry` now has a `choice` (`page` with its hash, or `tutorial`);
    `gameMenuEntriesOf` lists the entries a player can open (Tutorial in `lobby` and `game_over`),
    and `gameMenuItemsOf` adds the disabled Tutorial (`aria-disabled`, the reason as its line)
    everywhere else. `GameMenuPlace` gained `ranked_queue`: the lobby passes it while the player
    is waiting or confirming in the queue. The menu starts the tutorial through the
    `TutorialStart` context: `TutorialStartingScreen` (around `CurrentScreen` in `App`) provides
    `ClientStore.startTutorial` (`POST /api/tutorials`, `requestTutorialStart`), and `LobbyPage`
    wraps it in its flow, so a visitor chooses a guest name first (`LobbyIntent` `tutorial`). A
    refusal is kept as `ClientState.tutorialRefusal` and shown by `TutorialRefusalToast` ("The
    tutorial did not start" with the `REJECTION_MESSAGES` text) until closed. A started tutorial
    shows nothing yet.
  - For later items: item 6a opens the tutorial after `requestTutorialStart` answers `isOk` (in
    `ClientStore.requestTutorial`; `ClientStore.ts` has 273 non-blank lines, so put the tutorial
    host handling in its own store layer). Starting from `game_over` leaves the room on the server
    (Q164) but the client still shows the room until 6a switches screens.

- [ ] 6a. **Tutorial screen: start, top bar, text box, leave and restart** (S15.1, S15.2,
  S15.5–S15.7, S15.4's leave dialog, C4.8; Q161, Q162). **Large.**
  - The game screen (`src/client/screens/game/`, `GameScreen.tsx`, `GamePage.tsx`) without
    opponents, timers or chat; top bar "Tutorial · turn N" and Leave tutorial (with the S15.4
    confirmation). Left column: the tutorial text box (S15.2, S15.5–S15.7), texts exactly as in
    `tutorial.md`, kept in one client file keyed by step id; Continue, Finish, Restart.
  - Design boards: `design/export/tutorial/contents.md` ("Tutorial base 1920x940", "Tutorial:
    …"); they say "of 21" (S17). Reuse the existing modal and toast components.
  - Lazy-load the tutorial screen if it adds much to the first screen (B14, `npm run size`).

- [ ] 6b. **Tutorial screen: highlights, Not this step, Tutorial complete, browser test**
  (S15.2's highlights and disabled actions, S15.3, S15.4; "What you can see when it's done").
  **Large.**
  - Each step highlights the part of the screen it is about (the boards' "Highlight" rect) and
    disables every other action; "Not this step" shows "The tutorial is waiting for you to …
    Nothing changed." (S15.7; `rejectionMessage.ts`, `REJECTION_MESSAGES.ts`).
  - Tutorial complete (S15.4) with Read the rules, Play it again and Go to the lobby.
  - A browser test (`e2e/tutorial.spec.ts`) starts the tutorial from the lobby menu as a new
    visitor, plays all 19 steps and finishes; screenshots of the tutorial screens at the three
    sizes, axe, no horizontal scroll, `getByRole` selectors. Locally run only this spec file
    with `--workers=2`.

## Finish

- [ ] Finisher: the phase's scenarios into `harness/required.yaml`, the full check and harness,
  the branch check, screenshots, `docs/enforcement.md`.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter | Opus, medium | 8 | 151k | 78 | done |
| Builder, item 1 | Opus, medium | 13 | 160k | 53 | done |
| Builder, item 2 (finish and commit) | Opus, medium | 17 | 85k | 19 | done |
| Builder, item 3 | Opus, medium | 19 | 221k | 96 | done |
