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

- [ ] 1c. **Log out** (A1.14, M6.10; Q95; scenarios `connections-and-leaving` #17, #33,
  `accounts` #36, #37). **Large.**
  - A logout route deletes the browser's `logins` row (one D1 row); the token stops working at
    once. The client forgets the stored session and goes to the lobby logged out.
  - A guest who logs out leaves the room they are in: in a game it is a `leave_game` (M6.10,
    through the room as the existing leave path does), in a waiting room the same as **Leave
    room**; the lobby releases them ("one thing at a time"). A registered user who logs out is
    only disconnected: the room's sockets for that browser close, the seat stays (M5, M6).
  - Room driver (`connections-and-leaving` #17, #33) and lobby driver (`accounts` #36, #37) gain
    the step `log_out`; `then.seats[].left: false` may need reading in the room driver.

- [ ] 2. **Signup** (A1.3, A1.6, A1.12, A2.1-A2.4; Q93, Q94; scenarios `accounts` #5, #7, #8,
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

- [ ] 3. **Username change** (A2.1-A2.4, A3.5; Q96; scenarios `accounts` #26, #38, #39, and the
  second step of #5). **Small.**
  - A route for a logged-in player (guest or registered): a free, valid name (reuse the A2 checks),
    at most once every 7 days counted from the last change (`username_change_too_soon`); given
    `last_username_change_ms` in the lobby driver. The rooms the player is in keep the name they
    joined with (Q96); the lobby's players-online name may follow at its next report.
  - Step `change_username` in the lobby driver.

- [ ] 4a. **Log in and sign up screens** (S10.1, S12.2, S12.3; design boards "Account: log in",
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

- [ ] 4b. **User menu, account settings and the guest logout warning** (S2.3, S12.5, S12.6,
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

- [ ] 4c. **Busy-day simulator: logins and signups** (B11, B18; exit criteria). **Small.**
  - `tools/simulator/busyDay/BUSY_DAY.ts` gains signups and logins (and failed logins) with their
    rows per action from items 1 and 2; B18 must stay within 5,000.
  - B11: measure the password hash's CPU time in the harness (one hash per login and signup) and
    add it to the B11 measurements; it must stay under 10 ms at the 99th percentile.
  - A test that runs signup, login, a failed login and logout through the routes and checks that
    no console output contains the token, password or email address.

### Finish

- [ ] First finisher run: the 20 scenarios onto `harness/required.yaml`; full check, harness,
  browser tests, budgets.
- [ ] Phase review and fixes.
- [ ] Second finisher run.
- [ ] Release.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 11 | 150k | 55 | done |
| Builder, item 1a | 9 | 100k | 32 | done |
| Builder, item 1b | 15 | 151k | 61 | done |
