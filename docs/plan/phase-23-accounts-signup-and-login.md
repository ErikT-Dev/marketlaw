# Phase 23: Accounts: signup and login

Status: in progress
Milestone: 5 Accounts and ranking

## Goal

Guests can sign up with an email address and password, log in from any browser, log out, and
change their username.

## Depends on

Phase 20a. O4 (password hashing) is decided from phase 04's measurement.

## Covers

- Rules: A1.3 (signup without the email it sends, which comes in phase 24), A1.5, A1.6, A1.12 for
  signup, A1.13 (failed logins), A1.14 (logging out, the guest warning), A2.4, M6.10 (a guest
  logging out during a game leaves it).
- Screens: S12.2 (log in), S12.3 (sign up), S12.5 (account settings without email changes),
  S12.6 (guest logout warning), S12.7 (user menu), S2.3's user box in the game's top bar (not in
  the design; the lobby's user box is reused, S17). Design boards "Account: log in", "Account: log
  in after failed attempts", "Account: sign up", "Account: settings", "Account: settings, guest",
  "Account: guest log out warning", "Account: user menu", "Account: user menu, guest", "Account:
  sign up during a game".

## Builds

1. **Registered accounts in D1:** password hashes (as decided in O4), a new login token at every
   login, invalidated at logout, failed-login counts with the human check.
2. **Signup** from a guest account, keeping everything including a seat in a game.
3. **Username change** once every 7 days; signup changes do not count.
4. **Screens** for the above. The busy-day simulator adds logins and signups (B11, B18).

## Known gaps after this phase

- Email confirmation, resets, email changes and deleting accounts come in phase 24; until then
  the account screens do not show those parts.
- My match history is in the user menu but shown disabled until phase 25 (Q100).

## What you can see when it's done

Sign up from a guest account mid-game and keep your seat, log in from a second browser, log out,
change your username.

## Exit criteria

- B11 and B18 within limits with logins and signups; no token, password or email address in any
  log (`rules/multiplayer.md`).

## Open points

- O4: decided, Q90 and D29.

## Required scenarios

These 20 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #5: changing the username during signup does not count toward the 7-day limit
- `accounts` #7: signup needs the human check
- `accounts` #8: rejects a password shorter than 8 or longer than 64 characters
- `accounts` #11: a registered user logs in with username or email and password
- `accounts` #12: a wrong password is rejected
- `accounts` #13: after 3 failed logins in 15 minutes further logins need the human check but the account is not locked
- `accounts` #14: after 3 failed logins a login without the human check is rejected
- `accounts` #26: a username can be changed at most once every 7 days
- `connections-and-leaving` #17: a guest who logs out during a game leaves it
- `accounts` #30: a successful login clears the failed logins (Q91)
- `accounts` #31: the human check after failed logins ends 15 minutes after the latest failed attempt (Q91)
- `accounts` #32: a login with an unknown username fails like a wrong password (Q91)
- `accounts` #33: logging in by email finds the account that entered the unconfirmed address first (Q92)
- `accounts` #34: rejects an email address without an at sign (Q93)
- `accounts` #35: a player who is not logged in signs up as a registered user at once (Q94)
- `accounts` #36: logging out ends the login only in that browser (Q95)
- `accounts` #37: a guest who logs out while waiting in a room leaves it (Q95)
- `connections-and-leaving` #33: a registered user who logs out during a game keeps their seat (Q95)
- `accounts` #38: a new account can change its username at once (Q96)
- `accounts` #39: a username change keeps the old name inside the room the player is in (Q96)

## Progress

- [x] 0. Start (2026-11-09): branch `phase-23-accounts-signup-and-login` from master `f889453`.
  O4 decided (Q90, D29: PBKDF2-SHA256 at 20,000 iterations). Spec gaps decided and written into
  `accounts.md` first (commit `HARNESS: Signup, login and logout details (Q90-Q96)`): Q91 (failed
  logins, A1.5, A1.13), Q92 (which account an email logs in to, A1.5), Q93 (valid email address,
  new code `email_invalid`, A1.3), Q94 (signup when not logged in; Log in only when not logged
  in; A1.3, A1.5), Q95 (logging out in a room and in other browsers, A1.14), Q96 (when the 7-day
  wait starts; a rename keeps the old name inside the current room, A2.4). Eleven new scenarios
  join the phase's list (20 in all). Read Q90 to Q96 before building any item; they are the
  design.
  - `tools/harness-runner/harness.test.ts` now counts 450 scenarios (raised from 439 with the
    eleven new ones).
  - All items: scenarios become required only in the finisher's first run; until then check them
    by adding them to `harness/required.yaml` locally without committing.
  - Every message shape change raises `PROTOCOL_VERSION` (now 8) once per item that changes it; a
    new room record shape raises `ROOM_SCHEMA_VERSION` (now 4) (D1: old rooms close themselves).
    New D1 tables and columns go in a new migration, `migrations/0007_...sql` onwards; stored
    data may be wiped (D1), so no data has to be carried over, but existing guests should keep
    working if it is cheap.
  - Files at the line limit: `tools/harness-runner/lobby/LobbySession.ts` (309 lines) and
    `src/client/store/ClientStore.ts` (312): split them, do not grow them.
  - Reuse: `src/server/verifyHumanCheck.ts` and `humanCheckKeysOf.ts` (Turnstile keys exist
    since Q53, nothing for the owner), `accounts/usernameProblem.ts`, `accounts/nameKeyOf.ts`,
    `accounts/guestNameDecision.ts`, `newSessionToken.ts`, `sha256Hex.ts`, `insertGuest.ts`,
    `findPlayerByTokenHash.ts` with `accounts/loginStateOf.ts` and `LOGIN_TIMES.ts` (Q55, last use
    at most once a day), `api/bodyOf.ts`, `api/createGuestRoute.ts` as the route pattern, request
    and response schemas in `src/shared/api/`, `src/shared/ReasonCode.ts`, the client session in
    `src/client/store/readSession.ts` / `writeSession.ts`.
  - Never log a token, password or email address (`rules/multiplayer.md`, exit criteria): no
    request bodies or D1 rows in `console` output, and rejections carry reason codes only.
  - Not in this phase: sending emails (confirm, already in use, limits: phase 24, scenarios
    `accounts` #4's `emails_sent`, #6, #28, #29 stay "not yet"); guest removal after 90 days
    (phase 24 item 4, although D27 says "from phase 23 on"; the phase files decide the order).

- [x] 1a. **Logins per browser and password hashes** (A1.1, A1.6, A1.14; D29, Q90, Q95).
  **Large.**
  - A migration adds a `logins` table (token hash, player id, created and last-use times) so a
    registered user can be logged in in several browsers, each with its own token and its own
    90-day last use (A1.14 "in that browser"); `findPlayerByTokenHash.ts` and the guest insert
    move to it. Account columns for later items: kind (guest or registered), password hash,
    email as entered, email key (A1.11 sameness: lower case, "+" part removed, googlemail as
    gmail without dots), when the email was entered, email confirmed (always no until phase 24),
    the times of the latest failed logins, and the time of the last username change (null until
    the first change, Q96).
  - Password hashing as D29 / Q90 says, in its own file with unit tests: hash and verify, the
    stored format with method and count, a dummy verify for unknown accounts, constant-time
    comparison. Password length 8 to 64 characters (A1.6), counted as the player sees them, with
    reason `password_invalid`.
  - The email key function (A1.11) lives here too, with unit tests, since login by email
    (item 1b) and signup (item 2) both use it.
  - Done (2026-11-09): migration `0007_logins_and_registered_accounts.sql` rebuilds `players`
    (SQLite cannot drop the unique `token_hash` column) as a WITHOUT ROWID table and adds
    `logins` (WITHOUT ROWID, `token_hash` key, `player_id` index); existing guests' tokens and
    last uses move to `logins`, so they keep working. A new guest still writes 4 rows (B18
    `rowsPerNewGuest` unchanged), the daily last use 1 row on `logins`. `insertGuest` writes
    both rows in one batch (the login only if the account insert took the name);
    `findPlayerByTokenHash` and `testRooms/isTestRoomSeat` join `logins` to `players`.
    Hashing in `src/server/accounts/`: `hashPassword`, `verifyPassword` (null stored hash =
    unknown account: hashes against `DUMMY_PASSWORD_HASH`, always false; reads the count from the
    stored value, refuses over 100,000; constant-time compare), `PASSWORD_HASHING`,
    `pbkdf2Sha256Bytes`; `passwordProblem` (graphemes, as `measureChatText`) and
    `emailKeyOf`, each with unit tests. Differs from the phase file: nothing.
  - For later items: new `players` columns: `kind` ('guest' | 'registered', default guest),
    `password_hash`, `email` (as entered), `email_key`, `email_entered_ms`,
    `is_email_confirmed` (0/1), `failed_logins_ms` (JSON array text of failure times, default
    '[]'; item 1b decides how many to keep), `username_changed_ms` (null until the first change).
    The partial index `players_email_key (email_key, is_email_confirmed DESC, email_entered_ms)`
    serves Q92's lookup (`ORDER BY is_email_confirmed DESC, email_entered_ms LIMIT 1`); guests
    without an email write no index row. A new login is one `logins` row (2 rows written with its
    `player_id` index); logout deletes it by `token_hash`. `password_invalid`, `email_invalid`
    and `login_failed` are not yet in `src/shared/ReasonCode.ts`: the item whose route first
    returns one adds it there, to `REJECTION_MESSAGES.ts` and to the screens.md message table
    (spec first). `passwordProblem` and `emailKeyOf` are so far used only by their tests.

- [x] 1b. **Log in** (A1.5, A1.12, A1.13; Q91, Q92; scenarios `accounts` #11, #12, #13, #14,
  #30, #31, #32, #33). **Large.**
  - A login route takes username or email, password and an optional human check token; it finds
    the account (username by name key; email by email key, confirmed first, else earliest entered,
    Q92), then applies A1.13 as Q91 says, then verifies the password (one hash per attempt,
    none when the human check is missing). Success makes a new token, a new `logins` row, clears
    the failed logins, and returns the token and the player; failure returns `login_failed`, or
    `human_check_failed` when the check is needed and missing or fails. Each failure writes one
    D1 row (B18).
  - Only registered accounts can log in; a guest name gives `login_failed`.
  - Lobby driver: step `log_in` (visitor), given `accounts` fields `kind: registered`, `email`,
    `email_confirmed`, `password`; then `logged_in: {visitor, as}`. The step `sign_up` of #33
    comes with item 2; until then #33 can be checked only after item 2.
  - Done (2026-11-09): `POST /api/logins` (`api/loginRoute.ts`, body `LoginRequest`
    `{ login, password, humanCheck? }`, answer the `GuestResponse` shape). Q97: `failed_logins_ms`
    keeps at most the last 3 failure times within 15 minutes of each other, and migration
    `0008_login_check_until.sql` adds `players.login_check_until_ms` (when the human check ends),
    since A1.13's "15 minutes from the latest failure" cannot be read from the times alone; a
    successful login clears both (one extra row, only when there were failures). Logins for an
    unknown name or address are not counted and never ask for the human check (written into
    A1.13). Shared logic in `src/server/accounts/`: `decideLogin` (human check only when needed,
    then exactly one password verify, dummy for unknown accounts), `failedLoginsAfter`,
    `isHumanCheckNeededToLogIn`, `loginLookupOf` ("@" means email; usernames cannot hold one);
    D1 in `findLoginAccount`, `recordFailedLogin` (1 row), `insertLogin` (the `logins` row).
    `login_failed` added to screens.md S10.9, `ReasonCode.ts` and `REJECTION_MESSAGES.ts`
    ("Wrong username, email or password.", from the design). `PROTOCOL_VERSION` not raised: the
    new code comes only from the HTTP route, never over a socket. Lobby driver: visitor step
    `log_in` through `decideLogin`; given `accounts` `kind: registered`, `email`,
    `email_confirmed`, `password`; `then.logged_in.visitor`. `LobbyAccount` now has
    `registration: LobbyRegistration | null` instead of `kind`; generated names moved out of
    `LobbySession.ts` into `scriptedGeneratedName.ts` (278 non-blank lines now). Scenarios #11,
    #12, #13, #14, #30, #31, #32 pass when required locally; #33 waits for `sign_up` (item 2).
    Differs from the phase file: the extra column (Q97).
  - For later items: a name file and a function file that differ only in case collide on Windows
    (`LoginDecision.ts` / `logInDecision.ts`), hence `decideLogin`. The login route is not yet
    called by the client (item 4a: parse its answer with `GuestResponse`) nor by a route test
    (item 4c). Item 2's signup sets `kind = 'registered'`, `password_hash` (`hashPassword`),
    `email`, `email_key` (`emailKeyOf`) and `email_entered_ms`; in the lobby driver it sets
    `registration` on the account (`emailEnteredMs: session.now`), which `log_in` and
    `then.accounts.kind` then see. Each failed login writes 1 row, a login 2 (3 after failures).

- [x] 1c. **Log out** (A1.14, M6.10; Q95; scenarios `connections-and-leaving` #17, #33,
  `accounts` #36, #37). **Large.**
  - A logout route deletes the browser's `logins` row (one D1 row); the token stops working at
    once. The client forgets the stored session and goes to the lobby logged out.
  - A guest who logs out leaves the room they are in: in a game it is a `leave_game` (M6.10,
    through the room as the existing leave path does), in a waiting room the same as **Leave
    room**; the lobby releases them ("one thing at a time"). A registered user who logs out is
    only disconnected: the room's sockets for that browser close, the seat stays (M5, M6).
  - Room driver (`connections-and-leaving` #17, #33) and lobby driver (`accounts` #36, #37) gain
    the step `log_out`; `then.seats[].left: false` may need reading in the room driver.
  - Done (2026-11-09): `POST /api/logout` (`api/logoutRoute.ts`, body `SessionRequest`
    `{ token }`, answer always the `SessionResponse` `{ isLoggedIn: false }`, 400 for a malformed
    body) finds the login (`findLogoutAccount`: identity and guest or registered), deletes its
    `logins` row (`deleteLogin`, 1 D1 row) and calls `GameRoom.logOut` in every room the lobby
    lists for the player (busy and staying). A guest leaves there through the normal message path
    (`leaveAsLoggedOutGuest` with `room/guestLogOutIntentIn` and `guestLogOutMessageOf`):
    `leave_game` while still playing (M6.10), then `leave_room`, so the lobby releases them by
    the room's usual report; replies go to `UNHEARD_REPLIES`. For everyone the room then closes
    the sockets of that login (`RoomSockets.closeLogin`, close code `LOGGED_OUT_CLOSE_CODE`
    4401 in `src/shared/`) and marks the player disconnected if no other socket is open
    (`markDisconnected`, taken out of `webSocketClose`). `RoomSockets` and `publishReceived`
    now take any `ReplySocket`. Drivers: lobby `log_out` (player: `logOutPlayer.ts`; visitor:
    ends that visitor's login; `LobbySession.visitorLogins` now holds logins per visitor and
    `then.logged_in.visitor` reads it), room `log_out` (`logOutInRoom.ts`, given
    `accounts[].kind`); the room driver counts a room membership change as accepted for B1/B2
    (B2 allows membership writes). `connections-and-leaving` #17, #33 and `accounts` #36, #37
    pass when required locally. `PROTOCOL_VERSION` not raised: no message shape changed.
    Differs from the phase file: the client part (forget the stored session, go to the lobby
    logged out) moves to item 4b, which adds the only Log out button; without a caller it would
    be unused code (knip).
  - For later items: `GameRoom.ts` is at 300 non-blank lines (the limit); split it before adding
    to it. Item 4b calls `POST /api/logout` with `{ token }`, then `writeSession(null)`, and
    treats close code 4401 on a room socket as logged out (no reconnect). The route has no route
    test yet (item 4c); it logs nothing.

- [x] 2. **Signup** (A1.3, A1.6, A1.12, A2.1-A2.4; Q93, Q94; scenarios `accounts` #5, #7, #8,
  #33, #34, #35, and #4 without its email). **Large.**
  - A signup route: email, password, username (optional; the current one is kept), human check.
    Checks in this order: human check (`human_check_failed`), username (existing
    `usernameProblem` / taken checks), email shape (`email_invalid`, Q93), password
    (`password_invalid`). A refused signup changes nothing (`unchanged: true`).
  - From a guest: the same account becomes registered, same player id and same login, so the
    seat in a running game and everything else stays (A1.3, #4); a username change here does not
    start the 7 days (#5, Q96) and, inside the current room, the seat keeps its old name (Q96).
  - Not logged in (Q94): one step makes the registered account and its first login, the
    username prefilled as in A1.2 (`generatedNameRoute.ts`), one human check.
  - The email is stored unconfirmed; no email is sent in this phase.
  - Lobby driver: step `sign_up` (player or visitor), `then.accounts` fields `kind`, `email`,
    `email_confirmed`.
  - Done (2026-11-09): `POST /api/signups` (`api/signupRoute.ts`, body `SignupRequest`
    `{ token?, username?, email, password, humanCheck }`, answer the `GuestResponse` shape). With
    a guest's token, `registerGuest` turns that row into a registered user in one `UPDATE OR
    IGNORE` (same player id, same login and token, so seats and everything else stay; 1 D1 row
    plus index rows); a token that is unknown or a registered user's gets `invalid_token` (Q98).
    Without a token, `insertRegisteredUser` writes the account and its first login in one batch
    and returns a new token (as `insertGuest`). The username defaults to the guest's own; a
    guest may keep it with other capitals. Checks in `accounts/signupProblem` in the phase
    file's order (human check, username, taken, `emailProblem` (Q93), `passwordProblem`);
    the password is hashed only after they pass. An address already confirmed on another account
    is not stored (`unclaimedEmailOf`, one read; Q98, A1.11). `email_invalid` and
    `password_invalid` added to screens.md S10.9 (spec first, Q98), `ReasonCode.ts` and
    `REJECTION_MESSAGES.ts`. `PROTOCOL_VERSION` not raised (HTTP only). Lobby driver: step
    `sign_up` for a player and a visitor (`signUpInLobby.ts`, through `signupProblem`; a
    visitor without `username` takes the generated name), `then.accounts` reports `email` and
    `email_confirmed`. `accounts` #7, #8, #33, #34, #35 pass when required locally; #5 runs its
    signup and waits for `change_username` (item 3); #4 and #6 wait for `emails_sent` (phase 24).
    `GameRoom.ts` was not touched, so not split. Differs from the phase file: nothing.
  - For later items: a signup with a new username renames the account in D1 only; rooms keep
    their records' names (Q96), but `room/handleChatIntent.ts` names chat lines with the
    sender's current identity name from the token, so after a rename chat in the current room
    would show the new name: item 3 (#39) must handle this for both signup and username change.
    The client calls `POST /api/signups` in item 4a (send `token` only for a guest; store the
    answer's token with `writeSession`). Rows: a guest signup writes 1 `players` row (plus its
    name and email index entries), a signup when not logged in 2 rows as a new guest does plus the
    email index; item 4c counts them. The route has no route test yet (item 4c); it logs nothing.

- [x] 3. **Username change** (A2.1-A2.4, A3.5; Q96; scenarios `accounts` #26, #38, #39, and the
  second step of #5). **Small.**
  - A route for a logged-in player (guest or registered): a free, valid name (reuse the A2 checks),
    at most once every 7 days counted from the last change (`username_change_too_soon`); given
    `last_username_change_ms` in the lobby driver. The rooms the player is in keep the name they
    joined with (Q96); the lobby's players-online name may follow at its next report.
  - Step `change_username` in the lobby driver.
  - Done (2026-11-09): `POST /api/username-changes` (`api/usernameChangeRoute.ts`, body
    `UsernameChangeRequest` `{ token, username }`, answer the `GuestResponse` shape with the
    caller's own token and the new name; `invalid_token` 401 for an unknown or expired login).
    `accounts/decideUsernameChange` (unit tests) checks as Q99 says: the same name exactly is
    `unchanged` (nothing written, the 7 days do not start), then `usernameProblem`, then
    `username_change_too_soon` (`USERNAME_CHANGE_WAIT_MS`, from `username_changed_ms`; null
    = never changed, so signup and new accounts do not count), then taken (the own name in other
    capitals is not taken). D1: `findRenameAccount` (1 read) and `renamePlayer`, one
    `UPDATE OR IGNORE` of `name`, `name_key`, `username_changed_ms` (1 row plus the name
    index entries), guarded by the 7 days; a lost race gives `username_taken` 409. Spec first
    (Q99): the message "You can change your username once every 7 days." in S10.9, the check
    order and the same-name rule in A2.4; `username_change_too_soon` added to `ReasonCode.ts`
    and `REJECTION_MESSAGES.ts`. `PROTOCOL_VERSION` not raised (HTTP only). Q96 inside the
    room needed no room change: chat lines, seats, the player list and mutes are named from the
    room record's `players`, never from the token (`handleChatIntent` reads `record.players`;
    a rejoin by the same player id keeps the record), so item 2's worry did not apply; a unit
    test in `roomChat.test.ts` now proves it. `GameRoom.ts` was not touched, so not split
    (still at the limit). Lobby driver: player step `change_username`
    (`changeUsernameInLobby.ts`, through `decideUsernameChange`), given
    `accounts[].last_username_change_ms`; `LobbyAccount` gained `usernameChangedMs` (signup keeps the
    guest's). `accounts` #5, #26, #38, #39 pass when required locally. Differs from the phase
    file: nothing.
  - For later items: item 4b calls `POST /api/username-changes` and stores the answer with
    `writeSession` like a login; the settings screen needs the next allowed date, which no
    answer carries yet (`players.username_changed_ms` + 7 days): add it to the session answer
    or this route's answer in 4b (an HTTP shape, no protocol raise). The players-online list
    does not exist yet, so nothing in the lobby shows the name. Rows: a change writes 1
    `players` row plus its name index entries (item 4c). The route has no route test yet
    (item 4c); it logs nothing.

- [x] 4a. **Log in and sign up screens** (S10.1, S12.2, S12.3; design boards "Account: log in",
  "Account: log in after failed attempts", "Account: sign up", "Account: sign up during a
  game"). **Large.**
  - Lobby top bar: **Log in** and **Sign up** when not logged in (S10.1). Log in form: username or
    email, password, link to sign up; the forgotten password link is not shown until phase 24.
    After `human_check_failed` it shows the human check and why (A1.13). Sign up form: username
    prefilled, email, password, human check, what is kept (A1.3). The confirm-email notice with
    **Send it again** comes in phase 24.
  - A successful login or signup stores the new session (`writeSession.ts`) and reconnects the
    lobby and any room with it.
  - Browser tests at every supported size, by role and name, with the axe check; screenshots to
    `harness/screens/`.
  - Done (2026-11-09): the lobby top bar (`LobbyTopBar` now takes its right side as children)
    shows **Log in** and **Sign up** (`AccountButtons`) when not logged in, else `UserBox`
    ("Guest" only for guests; nothing for registered users, as 4b says). `LobbyAccount` holds the
    top bar and the dialogs (`useAccountDialogs`, `AccountDialogIfOpen`, closing on success).
    `LogInDialog` (username or email, password, "No account yet? Sign up"; no forgotten password
    link until phase 24) with `useLoginAttempts`: the human check (`LoginHumanCheck`, with the
    A1.13 explanation) appears after the first `human_check_failed` and is sent from then on;
    `login_failed` shows under the password. `SignUpDialog` (username prefilled with the guest's
    name or a generated one, email, password, human check, what is kept; `noValidate` so the
    spec's own email message shows) puts each refusal under its field. Store: `logIn`,
    `signUp` (sends `token` only when the session is a guest's) and `startSession`, which stores
    the answer with `writeSession` and keeps the room only when the token is unchanged (a guest's
    signup); the lobby feed needs no token, so nothing reconnects. `StoredSession` gained
    `isGuest` (sessions stored earlier read as guests). Shared pieces: `api/requestAccount`
    (also used by `requestGuest` now), `DialogButtons` (also in `CreateRoomDialog`, for the
    duplication check), `TextInput` `type` and `autoComplete`, `useSubmitWithHumanCheck` now
    returns the `problem` code too, `ObservableState` (subscribe, snapshot, change) taken out of
    `ClientStore.ts` (284 non-blank lines now), token `--color-board-account-link`. Tests:
    `accountDialogs.test.tsx`, `store/accountSessions.test.tsx`, browser test
    `e2e/accounts.spec.ts` (sign up when not logged in, three failed logins, the human check,
    log in from a second browser; screenshots `sign-up`, `log-in`,
    `log-in-after-failed-attempts`). Differs from the phase file: the board "Account: sign up
    during a game" needs the guest's entry point, the user menu, which is item 4b; the dialog
    already handles a guest (prefilled own name, token sent, room kept).
  - For later items: 4b opens `SignUpDialog` for a guest through `LobbyAccount`'s dialogs (make
    `openSignUp` reachable from the user menu) and must show it in the waiting room and game too.
    `RoomPageFrame` passes `isGuest` as always true to `UserBox` for now: thread the session's
    `isGuest` there in 4b. After a guest signs up with a new name in a room, `session.name` is
    the new name while the room still uses the old one (Q96), and `AcceptDialog` compares
    `myName` with the room's `acceptedNames`: 4b must use the room's own name for the player
    there (or keep the old `myName` while in that room). Locally, apply migrations with
    `npm run db:migrate:local` before browser tests (0008 was missing; GitHub applies them).

- [x] 4b. **User menu, account settings and the guest logout warning** (S2.3, S12.5, S12.6,
  S12.7; design boards "Account: settings", "Account: settings, guest", "Account: guest log out
  warning", "Account: user menu", "Account: user menu, guest"). **Large.**
  - The lobby's user box (`src/client/screens/lobby/LobbyTopBar.tsx`) opens the user menu and is
    reused in the waiting room and the game's top bar (S2.3, S17): **Sign up to keep your
    account** first for guests, then Account settings, My match history (its screen comes in
    phase 25; until then leave it out or disabled, and note which), Log out. Opening it pauses
    nothing (C1.3).
  - Account settings: username with **Change**, disabled with the next allowed date during the
    7 days; for guests **Sign up** instead of the email part; **Log out**. Email changes and
    **Delete account** are phase 24 (Known gaps).
  - A guest's Log out shows the warning of S12.6 first (cannot log back in; leaves a game in
    progress). The user box shows "Guest" or nothing for registered users as the design shows.
  - Browser tests as in 4a, including signing up mid-game and keeping the seat, logging in from a
    second browser context, and logging out.
  - Done (2026-11-09): the user box is now a button (`screens/account/UserMenu`, still labelled
    "Your account") that opens the user menu (`UserMenuItems`, a list "User menu"): **Sign up to
    keep your account** for guests, Account settings, My match history (shown disabled until
    phase 25, Q100), Log out. `UserAccount` holds the menu and its dialogs and is the same in the
    lobby (`LobbyAccount`), the waiting room and the room after a game (`RoomPageFrame`) and the
    game's top bar (`GameTopBar`, before the clock); it takes an `AccountBinding`
    (`accountBindingOf`, passed down like `ChatBinding`). `AccountSettingsDialog`: username with
    **Change** (`UsernameSetting`; disabled with "You changed it on … You can change it again on
    …" during the 7 days), the guest note with **Sign up**, **Log out**, **Close**.
    `GuestLogOutWarning` (S12.6: Cancel, Sign up instead, Log out anyway) comes first for a
    guest's Log out from the menu or settings; a registered user logs out at once. Sign up for a
    guest reuses `SignUpDialog` with the guest's name. Server: read-only `POST /api/account`
    (`api/accountRoute`, `AccountResponse` with `usernameWait`, `accounts/usernameChangeAllowedAt`,
    also used by `decideUsernameChange`); room views carry `myName` (the name in that room, Q96),
    which the room screens now use instead of `session.name` (so `AcceptDialog` and the rest
    compare the room's own name); `PROTOCOL_VERSION` 9. Store: account actions moved into
    `store/AccountSessionStore` (base class of `ClientStore`, now 254 non-blank lines) with
    `logOut` (`POST /api/logout`, then the lobby logged out; no answer keeps the login with a
    message), `changeUsername` and `loadAccount`; `RemoteGameHost` reports close code 4401 as
    connection `logged_out` without reconnecting, and the store then goes to the lobby logged out
    ("You logged out."). `StoredSession.isGuest` now reaches the room's user box. `Modal` text
    wraps inside the game's top bar (`white-space: normal`). Tests: `account/userAccount.test.tsx`,
    `store/accountActions.test.tsx`, host and server unit tests, browser test
    `e2e/userMenu.spec.ts` (a guest signs up mid-game and keeps the seat, changes the username; a
    guest logs out through the warning and leaves the game; the registered user logs out, logs in
    from a second browser and rejoins by code; screenshots `user-menu-guest`,
    `sign-up-during-a-game`, `user-menu`, `account-settings`, `account-settings-guest`,
    `guest-log-out-warning`). Decisions in Q100. Differs from the phase file: nothing.
  - For later items: `POST /api/account` has no route test yet and logs nothing (item 4c); it
    writes no rows. The 1280x720 game screenshots changed because the top bar now holds the user
    box (the player order badges get narrower there). Locally, `e2e/userMenu.spec.ts` with
    `--workers=2` sometimes times out in `openLobby` under load; with one worker it passes.
    Found (2026-11-09): `e2e/chat.spec.ts` "players chat in the waiting room and in the game"
    failing at 1280x720 (a chat message that never shows) was not a 4b regression. Server logging
    showed the room refusing the message with `site_daily_cap`: the local lobby's A9.6 count
    (2,000 chat messages a day, taken by rooms in blocks of 20) is kept between local runs and had
    been used up by the day's browser test runs, so a room whose quota ran out (Cid's first
    in-game message, or Ann's first message in a new room once the count was full) was refused;
    the client shows that refusal at the message box, which the test does not look at. Whether a run
    failed depended only on how much of the day's count was left, not on 4b's code. Fixed as Q69
    did for games (Q101): `lobby/siteChatLimitOf` (spec 2,000) unless the environment sets
    `TEST_SITE_CHAT_MESSAGES_PER_DAY`, which only `.dev.vars` sets (locally and in `check.yml` and
    `deploy.yml`, to 1000000); `siteGameLimitOf` and `siteChatLimitOf` share
    `lobby/configuredLimitOf`; `grantChatQuota` takes the limit. With it the test passed 15 of 15
    in a row (one worker); before it, 3 of 3 failed once the count was full. Locally, add
    `TEST_SITE_CHAT_MESSAGES_PER_DAY=1000000` to `.dev.vars` and restart `wrangler dev`.

- [x] 4c. **Busy-day simulator: logins and signups** (B11, B18; exit criteria). **Small.**
  - `tools/simulator/busyDay/BUSY_DAY.ts` gains signups and logins (and failed logins) with their
    rows per action from items 1 and 2; B18 must stay within 5,000.
  - B11: measure the password hash's CPU time in the harness (one hash per login and signup) and
    add it to the B11 measurements; it must stay under 10 ms at the 99th percentile.
  - A test that runs signup, login, a failed login and logout through the routes and checks that
    no console output contains the token, password or email address.
  - Done (2026-11-09), as Q102 says: `BUSY_DAY_ACCOUNT_ACTIONS` (guest signups, signups when
    not logged in, logins, logins after failures, failed logins, logouts, username changes, each
    with its D1 rows, index entries counted as D1 counts them) adds 300 rows; B18 measures 3,026
    of 5,000. B11: `measurePasswordHashCpuMs` hashes 5 batches of 10 signups and 10 logins and
    records the process CPU time per hash; B11 is the larger of the room messages' and the
    hashes' 99th percentile, measured 8 ms. `tools/route-tests/accountRoutes.test.ts` runs
    guest, signup, login by name, a failed login, login by email, username change, account and
    logout through the real Worker (wrangler's `createTestHarness`, fresh D1 with the
    migrations) and fails if any console line holds a token, the password or the email address;
    checked by adding a `console.log` of the login body, which it caught. Differs from the phase
    file: logouts and username changes are counted too; a logout is 2 rows (the login and its
    index entry), not 1 as item 1c's note says.
  - For later items: the route test needs the network (Turnstile's always-passing test secret,
    passed to the harness, so no `.dev.vars` is needed) and takes about 2 s. It is the place
    for further route tests (`server.getWorker().getEnv()` gives the D1 binding in Node). B11's
    hash measurement is CPU time, so load in `npm run check` barely moves it.

### Finish

- [x] First finisher run: the 20 scenarios onto `harness/required.yaml`; full check, harness,
  browser tests, budgets.
  - Done (2026-11-09): the 20 scenarios are required (`HARNESS:` commit). `npm run check`
    passed (581 tests). `npm run harness` passed: 364 scenarios pass, 0 fail, 86 not yet
    required; B11 measured 9 ms of 10, B18 3,026 of 5,000 rows; every budget within its limit.
    Browser tests (2 workers, against the running `wrangler dev`): shard 1/2 62 passed and 6
    failed at 1280x720 (`ERR_EMPTY_RESPONSE` loading pages and views that never came), shard
    2/2 61 passed and 3 failed (`ERR_CONNECTION_RESET`), the two-player whole game failed at
    1280x720 and 1920x1080 (the room heading never came), three and four players passed. Every
    failed test passed when rerun alone with one worker, so all were the local server's load;
    GitHub judges the full suite. `docs/enforcement.md`: the account browser tests, the lobby
    driver's account steps, B11's password hash, B18's account actions and the route test that
    keeps tokens, passwords and email addresses out of the logs.
- [ ] Phase review (2026-11-09, `phase-reviewer`): not ready; 1 blocker, 5 should fix, 4
  suggestions, 1 note. Fixer groups: A = R1, R10, R11; B = R2, R4, R6, R7; C = R3, R5, R9.
- [x] R1. Blocker (group A). B11 goes over its limit inside `npm run check` (measured 20 and 11
  of 10 ms; 8 alone): `tools/harness-runner/measurePasswordHashCpuMs.ts`, `highestMeasured.ts`,
  `PASSWORD_HASHING.ts`. With 5 batches the 99th percentile is the highest batch; Windows CPU
  time steps 15.6 ms; it measures Node, not workerd. Never lower the limit or loosen the
  measurement silently: lower the iterations (update D29/Q90, `DUMMY_PASSWORD_HASH`) or show
  with numbers the method is wrong and change it on the record. Show both halves of B11 in the
  report. The releaser measures `/api/logins` and `/api/signups` CPU on the live Worker
  (`wrangler tail`) and records it in Q90.
  - Fixed (2026-11-09): the method was wrong, shown with numbers in Q102: on this computer the
    same 20,000-iteration hash costs 7.5-7.9 ms of CPU idle and 14.9-17.2 ms with the other CPUs
    busy, and 100,000 iterations 38 ms against 15-19 ms on the live Worker, so it measured the
    machine's load; passing it would have needed about 5,000 iterations. 20,000 stay (Q90, D29;
    `DUMMY_PASSWORD_HASH` unchanged). B11's hash half is now the iteration count times 400 ns,
    the live Worker's highest measured cost per iteration (`LIVE_PASSWORD_HASH_CPU`): 8 ms; the
    report shows both halves ("room messages: n, password hash: 8"). `budgets.yaml` B11 says so
    (`HARNESS:` commit). Still for the releaser: the live `wrangler tail` measurement into Q90;
    above 400 ns per iteration it replaces the figure.
- [x] R2. Should fix (group B). Q97 reveals whether an email address has an account
  (`src/server/accounts/decideLogin.ts:14-17`), against A1.5, A1.3 and Q91's reason. Count
  failures for unknown login keys too (small D1 table keyed by sha256 of the login key, same
  `failedLoginsAfter`, pruned by the daily cron); reword A1.13 back; update Q97.
  - Fixed (2026-11-09): A1.13 now counts failures for unknown usernames and addresses the same
    way, with two new required scenarios (`HARNESS:` commit, Q97). Table
    `unknown_login_failures` (migration 0009) keyed by the SHA-256 of `unknownLoginKeyOf`;
    `decideLogin` takes the unknown key's failures, one row written per failure; the daily cron
    deletes rows 15 minutes past their latest failure. B18's busy day adds 20 such failures at
    2 rows (write and delete): B18 3,066 of 5,000. Route test checks the 4th attempt asks for the human check, the
    row holds no readable name, and the cron removes it.
- [x] R3. Should fix (group C). After a rename the freed old name can join the same waiting
  room (`src/server/room/joinRoom.ts:8-33`); `AcceptDialog.tsx:36` decides `hasAccepted` by
  name. Record the question, decide it in the spec first, and take the accept state from the
  view rather than comparing names.
  - Fixed (2026-11-09): decided in Q103 and written into M1.6, A2.4, S10.6, S10.9 and
    `HARNESS.md` first (`HARNESS:` commit): a room refuses a join with `username_in_room` while
    a player in it has the same name, capital letters ignored, checked after the other join
    checks. New required scenario `accounts` "a freed username cannot join the room where the
    old holder still shows it" (the harness test now reads 453 scenarios). The asking view
    carries `hasAccepted` for the viewing player and the accept dialog uses it instead of
    comparing names (protocol version 10); the dialogs no longer take `myName`.
- [x] R4. Should fix (group B). The account routes have no hostile-client tests
  (`tools/route-tests/accountRoutes.test.ts`): malformed bodies on all five routes, signup with
  an unknown or registered token, rename/account with an unknown or expired token, logout with
  an unknown token, the 409 `username_taken` race; exact status and body, plus a D1 read that
  nothing changed.
  - Fixed: `tools/route-tests/hostileAccountRoutes.test.ts`, with shared helpers split out of
    `accountRoutes.test.ts`; each case compares the `players`, `logins` and
    `unknown_login_failures` tables before and after. Firing real concurrent requests gave 409
    only sometimes, so the race is made certain with a test-only SQLite trigger that drops the
    name write (`RAISE(IGNORE)`), for both the username change and the guest signup. A trigger
    that inserts the other player does not work: D1's `changes` counts the trigger's insert.
- [x] R5. Should fix (group C). The real room logout for a registered user is never tested
  (`GameRoom.logOut`, `RoomSockets.closeLogin`; scenario `connections-and-leaving` #33 runs the
  driver's own `logOutInRoom.ts`). Add a Workers-pool or route test calling the real `logOut`
  (only that login's sockets close with 4401, another browser stays, the seat shows away); add
  `connected: false` to #33's then.
  - Fixed: `tools/route-tests/roomLogout.test.ts` (with `RoomSocket.ts`) signs up a registered
    user with two logins and a guest, starts a 2-player game over real room sockets, and logs
    out each login through `/api/logout`: the first login's socket closes with 4401 while the
    second browser and the other player stay connected and nobody is away; after the second
    logout the seat shows away to the other player and stays in the game. #33's then has
    `connected: false`, and the room driver's `logOutInRoom.ts` now closes the logged-out
    connection (`HARNESS:` commit, noted under Q95).
- [x] R6. Should fix (group B). Signup accepts an expired guest login
  (`src/server/api/signupRoute.ts:20-24`, `findLogoutAccount`); refuse with `invalid_token` as
  A1.14 says, reusing the expiry check.
  - Fixed: `findLogoutAccount` returns the login's last use and signup refuses an expired guest
    login with `loginStateOf` (401 `invalid_token`); route test in
    `hostileAccountRoutes.test.ts`; noted under Q98.
- [x] R7. Suggestion (group B). Logout deletes the login before leaving the rooms and swallows
  room failures (`src/server/api/logoutRoute.ts:21`, `:38`): leave the rooms first, delete the
  login last.
  - Fixed: the rooms are left first and the login deleted last; if any room fails the login is
    kept and the route answers 503, shown by the client as "Could not log out" (Q100). No test
    makes a room fail; the browser tests and route tests cover the normal logout.
- [x] R8. Note. `src/server/GameRoom.ts` is at 300 non-blank lines; split it before adding to it.
  - Answered: noted; group C's fixes did not touch `GameRoom.ts`, so it stays at 300 lines. The
    next change that adds to it splits it first.
- [x] R9. Suggestion (group C). Whether a session is a guest's is only in `StoredSession.isGuest`
  on the client; after a signup in one tab another tab keeps guest menus. Have the session
  answer carry the account kind.
  - Fixed: `POST /api/session` answers `isGuest` (`findSessionAccount`, which
    `findPlayerByTokenHash` now wraps), and the client takes the account kind and name from
    the answer when a page opens, unless the session changed meanwhile (noted under Q100). A tab
    left open during a signup in another tab still learns it only at its next page load.
- [x] R10. Suggestion (group A). The route test calls the real Turnstile siteverify, so
  `npm run check` needs the network: note it in `docs/enforcement.md`.
  - Fixed: noted in the Vitest row of `docs/enforcement.md`.
- [x] R11. Suggestion (group A). Add "My match history shown disabled until phase 25" (Q100) to
  the phase file's Known gaps.
  - Fixed: added to Known gaps after this phase.
- [x] Second finisher run.
  - Done (2026-11-09): local D1 migrated (0009). `npm run check` passed (594 tests).
    `npm run harness` passed: 453 scenarios, 367 pass, 0 fail, 86 not yet required; B11
    measured 8 of 10 (room messages: 2, password hash: 8), B18 3,066 of 5,000; every budget
    within its limit. Browser tests (2 workers, a fresh `wrangler dev` started by the tests):
    shard 1/2 68 passed; shard 2/2 63 passed and 1 failed (`opponents.spec.ts` at 2560x1440,
    the room heading never came); two players 3 passed; three players 2 passed and 1 failed
    at 1920x1080 (a dialog stayed open past 5 s); four players 3 passed. Both failed tests
    passed when rerun alone with one worker, so both were the local server's load; GitHub
    judges the full suite. No server left on port 8787. `docs/enforcement.md`: the room
    logout route test under Identity.
- [ ] Release.
  - Report pushed (`64f0906`). The first branch check (run 42703156794) failed in `check`: the
    three route tests could not start the Worker on GitHub, because `dist/client` (the assets
    folder in `wrangler.jsonc`) is built only later in `npm run check`; locally it always
    existed. All 6 browser-test parts passed. Fixed: `startRouteTestServer` creates the folder
    first (reproduced locally without `dist`, then 9 route tests pass); `npm run check` passed
    (594 tests). Proposed rule added.
  - Second branch check (run 42705398486, `956b873`) green: `check` and all 6 browser-test
    parts. Merged (`1fe3b93`); Deploy run 42707307440 succeeded (tests skipped, the merged code
    had passed Check) and applied D1 migrations 0007, 0008 and 0009 to the live database
    (`wrangler d1 migrations list --remote`: none left). The live bundle has the new texts
    ("Sign up to keep your account", "Account settings", "My match history", "No account yet",
    `username_in_room`). Live site: the page, a generated name, `/api/account`, `/api/logout` and
    `/api/session` with a forged token answer "not logged in", the lobby socket opens, the
    test-only routes answer 404. Signing up and logging in need the human check in a browser,
    so they are left to the owner (What to try).
  - Live CPU (`wrangler tail`, Q90): 109 logins 6-14 ms, median 8, 99th percentile 13; signups
    refused for the human check 1-3 ms. That is 650-700 ns per iteration, above the 400 ns B11
    assumes, so a login's 99th percentile is over B11's 10 ms. The figure is replaced on the
    record (Q102: 700 ns); `LIVE_PASSWORD_HASH_CPU` is not changed yet, since alone it turns
    `npm run check` red. Still to do before the phase is done: a fix, either fewer iterations
    (about 12,000 fits: 8.4 ms of hash at 700 ns, plus about 1 ms of other work; D29, Q90 and
    `DUMMY_PASSWORD_HASH` change, stored hashes keep their own count) or B11 changed on the
    record, then `LIVE_PASSWORD_HASH_CPU` set to 700 ns and a new release.
  - [x] Fix (2026-11-10, fixer): B11 stays at 10 ms (the Free plan's CPU limit). The count is
    10,000 (`PASSWORD_HASHING`, `DUMMY_PASSWORD_HASH`), `LIVE_PASSWORD_HASH_CPU` is 700 ns, so
    B11's hash half is 7 ms; expected live about 8 ms for the slowest login with the other
    work. 12,000 left under 1 ms of margin. Recorded in D29, Q90 (strength trade-off: half the
    cost of 20,000 for an attacker with a leaked database) and Q102. Hashes stored at 20,000
    keep their count and still verify (about 14 ms each); not rehashed, data may be wiped (D1).
    No spec or harness change: neither names the count. `npm run check` green.
  - [ ] Release again: deploy, measure live login CPU (`wrangler tail`), record it in Q90.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 11 | 150k | 55 | done |
| Builder, item 1a | 9 | 100k | 32 | done |
| Builder, item 1b | 15 | 151k | 61 | done |
| Builder, item 1c | 12 | 165k | 60 | done |
| Builder, item 2 | 9 | 131k | 45 | done |
| Builder, item 3 | 11 | 141k | 67 | done |
| Builder, item 4a | 19 | 180k | 87 | done |
| Builder, item 4b | 73 | 286k | 178 | done, chat browser test flaky |
| Builder, item 4b chat test failure | 38 | 225k | 115 | done (daily chat limit used up locally, Q101) |
| Builder, item 4c | 14 | 157k | 76 | done |
| Finisher, first run | 34 | 105k | 46 | done |
| Phase reviewer | 18 | 198k | 91 | not ready, 1 blocker, 11 findings |
| Fixer, group A (R1, R10, R11) | 13 | 110k | 49 | done |
| Fixer, group B (R2, R4, R6, R7) | 18 | 167k | 84 | done |
| Fixer, group C (R3, R5, R8, R9) | 23 | 178k | 118 | done |
| Finisher, second run | 39 | 91k | 38 | done |
| Releaser | 46 | 131k | 80 | partial (merged and deployed; live hash CPU over B11) |

## Report

**Built.** Guests can now become registered users, and registered users can log in from any
browser. When not logged in, the lobby's top bar has **Log in** and **Sign up**; otherwise it
has the user box, which opens the user menu in the lobby, the waiting room, the room after a game
and the game's top bar: **Sign up to keep your account** (guests), **Account settings**, **My
match history** (shown disabled until phase 25) and **Log out**. Signing up asks for a username
(the guest's own name is prefilled), an email address, a password of 8 to 64 characters and the
human check, and keeps everything, including a seat in a game in progress. Logging in takes the
username or the email address with the password; after 3 failed logins in 15 minutes every
further login needs the human check, but the account is never locked, and an unknown name or
address fails exactly like a wrong password. Every login is a new login for that browser only;
logging out ends it there and nowhere else. A guest who logs out is warned first that they
cannot come back and that they leave any room or game; a registered user who logs out keeps
their seat and shows as away. Account settings change the username at most once every 7 days
(the signup's own name choice does not count), showing the date it can change again. Passwords
are stored as PBKDF2-SHA256 with 20,000 iterations and a random salt (D29). Three D1 migrations
(0007 to 0009) add the logins, registered accounts and failed-login tables. `PROTOCOL_VERSION`
is 10, so a tab with the old client is told to reload; games saved by the old version close
themselves (D1).

**What to try.** On the live site:
1. Open the lobby, create a room and start a game as a guest with a second window.
2. In the game's top bar, open the user menu and choose **Sign up to keep your account**; sign
   up with an email address and a password. The game goes on with your seat.
3. In a different browser (or a private window), press **Log in** and log in with the username
   or the email address and the password. Rejoin the room by its code.
4. Log in with a wrong password three times: the fourth try asks for the human check.
5. Open **Account settings** and change the username; the button is then disabled with the date
   of the next allowed change.
6. Log out in one browser: the other browser stays logged in. As a guest, **Log out** first
   shows the warning.

**Checks.** The second finisher run: `npm run check` green (594 tests), `npm run harness` green
(453 scenarios, 367 required pass, 0 fail), B11 8 of 10 ms (room messages 2, password hash 8),
B18 3,066 of 5,000 rows. Two browser tests timed out locally under two workers and passed alone,
the known local load problem; GitHub's branch check judged the full suite before the merge. The
phase's 20 scenarios are required, plus 3 from the review (23 in all).

**Differences from the phase file.** Failed logins are counted for unknown names and addresses
too, in their own table keyed by a hash, so the human check cannot tell whether an account exists
(Q97, R2). A room refuses a join with `username_in_room` while a player in it shows the same name
(Q103, R3). The logout button and the client's part of logging out came with the user menu
(item 4b), not with the logout itself (item 1c). The busy-day simulator also counts logouts and
username changes; a logout writes 2 rows. B11's password-hash half is computed from the
iteration count and the live Worker's cost per iteration instead of measured on the build
computer (Q102, R1). `POST /api/session` now says whether the account is a guest's (R9).

**Decisions.** Q90: PBKDF2-SHA256, 20,000 iterations, one hash per login including unknown
accounts. Q91: what counts as a failed login and when the human check ends. Q92: which account
an email address logs in to. Q93: what a valid email address is. Q94: signing up and logging in
when not logged in. Q95: logging out ends only that browser's login; guests leave, registered
users keep their seat. Q96: when the 7-day wait starts; a new name shows in a room only after
it. Q97: how failed logins are stored, unknown accounts included. Q98: signup's messages and
whose login can sign up. Q99: a username change's message and check order. Q100: the user
menu's details. Q101: the browser tests' chat limit on one local server. Q102: how B11 and B18
measure logins and signups, and how the logs are checked. Q103: a freed username cannot join a
room where the old holder still shows it.

**Review findings and what happened to each.**
1. B11 went over its limit inside `npm run check`: answered with numbers (Q102), the method
   measured the build computer; 20,000 iterations stay and the hash counts at the live cost.
2. Failed logins revealed whether an email address had an account: fixed, unknown names and
   addresses count too (Q97), with two new required scenarios.
3. A freed username could join the room where the old holder still showed it: fixed (Q103), with
   a new required scenario; the accept dialog takes its state from the view.
4. The account routes had no hostile-client tests: fixed, every route with malformed and forged
   requests, checking that nothing in D1 changed.
5. The real room logout of a registered user was untested: fixed with a route test over real
   room sockets.
6. Signup accepted an expired guest login: fixed, refused with `invalid_token`.
7. Logout deleted the login before leaving the rooms: fixed, rooms first, and a failed room keeps
   the login ("Could not log out").
8. `GameRoom.ts` is at its size limit: noted; the next change that adds to it splits it.
9. Another tab kept guest menus after a signup: fixed at the next page load (the session answer
   carries the account kind).
10. The route test needs the network: noted in `docs/enforcement.md`.
11. Match history shown disabled: added to the known gaps.
