# Phase 24: Accounts: email, deletion and privacy

Status: in progress
Milestone: 5 Accounts and ranking

## Goal

Email confirmation, password resets and email changes, deleting accounts, removing unused
guests, and the privacy notice.

## Depends on

Phase 23. Decisions O3 (email provider) and O7 (privacy notice text in the spec) are made first.

## Covers

- Rules: A1.3's emails, A1.4, A1.7–A1.11, A1.15, A1.1's guest removal after 90 days, A6.3's
  hidden email addresses, M6.10 (deleting an account during a game counts as leaving), the
  privacy notice once it is in the spec (O7).
- Screens: S12.3's "check your email", S12.4 (email links), S12.5 (email address, pending change,
  removed address), S12.6 (deleting an account, also during a game). Design boards "Account: check
  your email", "Account: forgot password", "Account: email confirmed", "Account: set a new
  password", "Account: link expired", "Account: settings, email removed", "Account: delete
  account", "Account: delete account during a game".

## Builds

1. **Email provider** (O3): a new dependency and secret, approved before use.
2. **Email flows:** confirmation, change and reset links with expiry, the daily limits per
   account and per address, one account per address with A1.11's matching.
3. **Deleting an account:** email and password removed, username freed, records show "Deleted
   player"; during a game it counts as leaving.
4. **Guest removal** after 90 days unused, through the scheduled job of phase 19.
5. **Privacy notice** page, linked from signup and account settings.

## Known gaps after this phase

- No game records yet, so "Deleted player" appears from phase 25. `accounts` #20 and #21 (guest
  removal and deletion shown in records) stay "not yet" until then.
- Emails are sent from a Gmail address through Brevo's free plan, so they may land in spam and
  carry a Brevo footer (Q104, D30).

## What you can see when it's done

Confirm an email, reset a password, change the email address, delete an account, read the
privacy notice.

## Exit criteria

- No email address appears in any log or any other player's message.

## Open points

- O3, O7: decided at the start (D30, D31; Q104, Q105).

## Waiting for the owner

Nothing. The owner chose Brevo with the game's Gmail address `mlaw.support@gmail.com` (Q104,
D30, 2026-11-10), verified it as a Brevo sender, set the secret `BREVO_API_KEY` on the live
Worker and turned off Brevo's IP blocking (Authorised IPs). The live test send is done by the
releaser after the merge (item 10).

## Required scenarios

These 15 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #4: a guest user can sign up during a game and keeps their seat and history
- `accounts` #6: signing up with an address already confirmed elsewhere looks the same
- `accounts` #9: confirming the email address lets a registered user reset their password
- `accounts` #10: an unconfirmed address cannot be used to reset the password
- `accounts` #15: at most 3 emails a day are sent for one account
- `accounts` #16: changing the email address keeps the old one until the new one is confirmed
- `accounts` #17: the first account to confirm an address keeps it and it is removed from the other
- `accounts` #18: dots in gmail addresses do not make a different address
- `accounts` #28: at most 3 emails a day are sent to one address
- `accounts` #29: googlemail addresses count as gmail addresses
- `accounts` #43: a confirmation link no longer works after 24 hours (added at the start, Q106)
- `accounts` #44: a reset link sets a new password (added at the start, Q106)
- `accounts` #45: deleting an account needs its password (added at the start, Q107)
- `accounts` #46: at most 90 emails a day are sent on the whole site (added at the start, Q106)
- `connections-and-leaving` #16: deleting the account during a game counts as leaving it

## Progress

- [x] 0. Start (2026-11-10): branch `phase-24-accounts-email-deletion-privacy` from master
  `39f938c`. O3 decided (Q104, D30: Resend over `fetch`, at most 90 emails a day), O7 decided
  (Q105, D31: rule A12.1, page S12.8). Spec gaps decided and written into the spec first (commit
  `HARNESS: Email links, limits, deletion and the privacy notice (Q104-Q107)`): Q106 (new rule
  A1.16 email links; A1.4, A1.7, A1.9, A1.10, A9.6's email cap) and Q107 (A1.15 deleting). Four
  new scenarios join the phase's list (15 in all). Read Q104 to Q107 before building any item;
  they are the design.
  - `tools/harness-runner/harness.test.ts` now counts 457 scenarios.
  - All items: scenarios become required only in the finisher's first run; until then check them
    by adding them to `harness/required.yaml` locally without committing.
  - Every message shape change raises `PROTOCOL_VERSION` once per item that changes it; a new room
    record shape raises `ROOM_SCHEMA_VERSION` (D1). New D1 tables and columns go in new
    migrations, `migrations/0010_...sql` onwards; stored data may be wiped (D1).
  - New reason codes (`password_wrong`, `link_expired`, and the first use of
    `email_not_confirmed`, `email_limit_reached`, `not_registered`) go into
    `src/shared/ReasonCode.ts` and `REJECTION_MESSAGES.ts` with the texts of `screens.md`'s
    message table, by the item whose route first returns them.
  - Files at the line limit: `src/server/GameRoom.ts` (300 non-blank lines): split it, do not
    grow it. `tools/harness-runner/lobby/LOBBY_DRIVER.ts` (252) and
    `src/client/store/ClientStore.ts` (254) are near it.
  - Reuse: the phase 23 account code (`src/server/accounts/`, `SignupAccount.ts`,
    `insertRegisteredUser.ts`, `unclaimedEmailOf.ts` with `accounts/emailKeyOf.ts` for A1.11,
    `newSessionToken.ts` and `sha256Hex.ts` for link tokens, stored only as hashes,
    `verifyHumanCheck.ts`, `verifyPassword.ts`/`hashPassword.ts`, `deleteLogin.ts`,
    `leaveAsLoggedOutGuest.ts` for leaving rooms, `api/signupRoute.ts` as the route pattern),
    the lobby driver's account steps (`tools/harness-runner/lobby/`, `signUpInLobby.ts`,
    `logInVisitor.ts`, `countsTodayFromGiven.ts`), the site-wide daily counters of the Lobby
    (`lobby/siteChatLimitOf.ts`, `grantChatQuota.ts`, D26) for the 90-a-day cap, and
    `tools/route-tests/accountRoutes.test.ts` for the log check.
  - Never log a token, password or email address; no email address in any message to another
    player (exit criteria, A6.3). Emails go to the address only; the reply to the browser never
    says whether an address is confirmed elsewhere (A1.3).

- [x] 1. **Sending emails and the signup confirmation** (A1.3, A1.4, A1.8, A1.9, A1.11, A9.6;
  Q104, Q106; scenarios `accounts` #4, #6, #18, #28, #29, #46). **Large.**
  - Done (2026-11-10), Q108 has the details: `src/server/email/` (`EmailSender`, `emailSenderOf`,
    `testOutboxSender`, `accountEmailOf`, `reserveAccountEmail`, `sendAccountEmail`,
    `findEmailAccount`, `removeOldEmailRecords`), migration `0010_email_links_and_counts.sql`
    (`email_links`, `email_counts`, `test_outbox`), the Lobby's `takeEmailQuota` and
    `returnEmailQuota` (`siteEmails` in its daily counts), `POST /api/confirmation-emails`
    (Send it again) and `POST /api/test-outbox`. `PROTOCOL_VERSION` 11 (`email_limit_reached`,
    `not_registered`). The six scenarios pass with them added to `required.yaml` locally.
    Route test `tools/route-tests/emailRoutes.test.ts`. B18 measures 3,396.
  - Differs: the test outbox stores only where `TEST_ROOM_SECRET` is set; elsewhere (the live
    site until item 9) every send fails, so nothing is stored or counted. Send it again for an
    account with no unconfirmed address answers OK and sends nothing (Q108).
  - For later items: send an email with `reserveAccountEmail` (before writing anything) then
    `sendAccountEmail` (kinds `confirm`, `change_confirm`, `reset`, `already_in_use`); give the
    site email back with `lobbyOf(env).returnEmailQuota(now)` if the action then fails. Links are
    in `email_links` by (`player_id`, `kind`), `token_hash` = `sha256Hex(token)`, `address` set
    only for `change_confirm`, `expires_ms`; replacing is automatic. Fragments: `#confirm=`,
    `#reset=`, `#forgot-password` (client, item 6a). Browser tests read emails with
    `POST /api/test-outbox` `{ to }` and the test room secret header (route test helper
    `tools/route-tests/readTestOutbox.ts`); `.dev.vars` needs `TEST_SITE_EMAILS_PER_DAY=1000000`
    (added locally and in both workflows). Item 9 adds the Resend branch to `emailSenderOf`.
    The lobby driver's email state is `LobbyEmails` (`session.emails`); `LobbySession.ts` is at
    294 of 300 lines, add to the helper classes instead. `GameRoom.ts` was not touched.
  - An `EmailSender` interface in `src/server/` (send one email: to, subject, text, and a
    result that says sent or failed) and a test double that keeps what was sent, readable by the
    lobby driver (`emails_sent`), unit tests and, through a test route guarded by
    `TEST_ROOM_SECRET` like `src/server/testRooms/`, the browser tests (they need the link). The
    Worker uses the test double whenever `RESEND_API_KEY` is not set (local, browser tests); the
    Resend sender itself is item 9.
  - The emails: kinds `confirm`, `already_in_use`, `change_confirm` (item 3) and `reset`
    (item 2). Plain text, English, short: what the link does, how long it works (A1.16), "if this
    was not you, ignore this email"; `already_in_use` says the address already belongs to an
    account and points to the forgotten-password link. Links use the site's address and a `#`
    fragment like the seat links (`src/client/store/sessionFromLink.ts`).
  - A D1 migration for email links (hashed token, account, kind, address for changes, expiry;
    one live link per account and kind, A1.16) and the daily counts per account and per address
    (the address only as a hash of its email key; kept 2 days, removed by the daily cron,
    `removeForgottenLoginFailures.ts` as pattern). The site-wide count (90 a day, A9.6) in the
    Lobby's counters; `site_counts_today.emails` in the lobby driver.
  - Signup sends `confirm`, or `already_in_use` when the address is confirmed elsewhere
    (`unclaimedEmailOf`), after checking the limits: over a limit the signup is refused
    (`email_limit_reached`, `site_daily_cap`) and nothing changes (#28, #46). A failed send does
    not refuse the signup and does not count. **Send it again** route (no human check, the same
    limits).
  - B18: count the rows written by the busy day's emails (links, counts) in the busy-day
    simulator (Q102's pattern).

- [x] 2. **Confirming an address and resetting a password** (A1.4, A1.7, A1.11, A1.12, A1.16;
  Q106; scenarios `accounts` #9, #10, #15, #17, #43, #44). **Large.**
  - Done (2026-11-10), Q109 has the details: `POST /api/email-confirmations` `{ link }`,
    `POST /api/reset-emails` `{ email, humanCheck }`, `POST /api/password-resets`
    `{ link, password }` (`src/server/api/confirmEmailRoute.ts`, `resetEmailRoute.ts`,
    `newPasswordRoute.ts`; `src/server/email/confirmEmailWithLink.ts`, `confirmedAccountOf.ts`,
    `resetLinkAccountOf.ts`, `setPasswordWithLink.ts`). Reason codes `email_not_confirmed` and
    `link_expired`, `PROTOCOL_VERSION` 12. Lobby driver steps `confirm_email`,
    `reset_password`, `set_new_password` (`confirmEmailInLobby.ts`, `requestResetInLobby.ts`,
    `setNewPasswordInLobby.ts`; links in `LobbyEmails`). The six scenarios pass when added to
    `required.yaml` locally. Route tests in `tools/route-tests/emailRoutes.test.ts`, hostile ones
    in `hostileAccountRoutes.test.ts` (added to the existing files, no new wrangler server).
  - Differs: nothing from the phase file. B18 does not count confirmations or resets (the phase
    file asks for none); the finisher can add them if the busy day should.
  - For later items: the confirm route handles only kind `confirm`; item 3 extends
    `confirmEmailWithLink` to `change_confirm` (the address comes from `email_links.address`)
    and must record "removed" for the A1.11 removal there (`REMOVE_FROM_OTHER_ACCOUNTS`, no
    column for it yet). The lobby driver's `LobbyEmails.send(playerId, email, now)` now makes the
    link; `lobbyEmailRejection.ts` and `accountConfirmingEmail.ts` are shared by the driver's
    email steps. Item 6a's client calls the three routes above; the set-password answer is a
    `GuestResponse` like login.
  - Confirm route: opens a confirmation link; the first account to confirm keeps the address,
    and it is removed from every other account with the same email key (#17); a used, expired,
    replaced or meanwhile-claimed link gives `link_expired` (#43).
  - Forgotten password route: human check, address must be confirmed by some account, else
    `email_not_confirmed` whether or not any account entered it (#10); limits (#15); sends
    `reset` (#9).
  - Set new password route: from a live reset link; new password (A1.6), ends every login of the
    account, clears failed logins, makes a new login for this browser and returns its token
    (#44).
  - Hostile tests for the new routes next to `tools/route-tests/hostileAccountRoutes.test.ts`
    (forged and reused link tokens, malformed bodies).

- [x] 3. **Changing and adding an email address** (A1.10, A1.11, A1.12, A1.16; Q106; scenario
  `accounts` #16). **Small.**
  - Done (2026-11-10), Q110 has the details: `POST /api/email-changes` `{ token, email, humanCheck }`
    (`src/server/api/emailChangeRoute.ts`, `email/savePendingEmail.ts`), `confirmEmailWithLink`
    opens `change_confirm` links too, migration `0011_pending_and_removed_email.sql`
    (`pending_email`, `pending_email_key`, `is_email_removed`), `/api/account` answers `email`
    (`shared/api/AccountEmail.ts`, `email/accountEmailDetailsOf.ts`), `PROTOCOL_VERSION` 13. Lobby
    driver step `change_email` (`changeEmailInLobby.ts`). `accounts` #16 (and #17, #43 and the
    other email scenarios) pass when added to `required.yaml` locally. Route tests in
    `emailRoutes.test.ts` and `hostileAccountRoutes.test.ts`.
  - Differs: nothing from the phase file. B18 does not count changes (the phase file asks for
    none). `GameRoom.ts` and `LobbySession.ts` were not touched.
  - For later items: deleting an account (item 4) must also clear `pending_email`,
    `pending_email_key` and `is_email_removed`. Item 6b reads `AccountResponse.email` (null for
    guests) and calls `/api/email-changes` (`EmailResponse`, 429 over a limit); Send it again
    covers only the unconfirmed address, not a pending change (Q110). Item 8: add
    `/api/email-changes` to the log check.
  - Route with the human check, registered users only (`not_registered`): stores the pending
    address (a newer change replaces it), sends `change_confirm` or `already_in_use`, under the
    limits. Confirming replaces the old address and applies A1.11 to the new one. A user whose
    address was removed (A1.11) adds one the same way. The account view (`api/accountRoute.ts`)
    shows the address, whether it is confirmed, the pending address and whether it was removed,
    to the account holder only (A6.3).

- [x] 4. **Deleting an account** (A1.15, M6.10, A2.3; Q107; scenarios `connections-and-leaving`
  #16, `accounts` #45; #21 stays "not yet" until records exist in phase 25). **Large.**
  - Done (2026-11-10), Q111 has the details: `POST /api/account-deletions` `{ token, password }`
    (`src/server/api/accountDeletionRoute.ts`, `src/server/deletion/`), reason `password_wrong`,
    `PROTOCOL_VERSION` 14. Leaving rooms is shared with logout (`src/server/logOutOfRooms.ts`;
    `GameRoom.logOut` takes `isLeaving` and `isEndingEveryLogin`, `RoomSockets.closeLogins`).
    `GameRoom.ts` was split (`applyRoomAlarm.ts`), now 269 lines. Lobby driver step
    `delete_account` (`deleteAccountInLobby.ts`), room driver step `delete_account`.
    `connections-and-leaving` #16 and `accounts` #45 pass when added to `required.yaml`
    locally; #21 is "not yet" (`record_usernames`). Route tests in `roomLogout.test.ts` (during
    a game, waiting in a room) and `hostileAccountRoutes.test.ts`. B18 measures 3,446.
  - Differs: the account row is removed, not kept as a marker (Q111); phase 25 and 26 files
    have notes. `LobbySession.ts` was not touched.
  - For later items: item 6b calls `/api/account-deletions` (`EmailResponse`; 503 if a room did
    not answer); after it every socket of the account closes with the logged-out code. Item 8:
    add `/api/account-deletions` to the log check. Item 5 removes guest rows the same way
    (`players`, `logins`; guests have no links).
  - Route: registered users only, the account's password (`password_wrong`, one hash as in
    Q90). Removes email, pending email, password hash, every login and every link; frees the
    username (the account row becomes a deleted marker or is removed; whatever phase 25 needs to
    show "Deleted player" for its records, decide and note it for phase 25). Per-address email
    counts stay (A1.9).
  - In a room: during a game it is leaving (M6.10, reuse the logged-out guest path of phase 23,
    `leaveAsLoggedOutGuest.ts`); waiting in a room, the player leaves it. The ranked queue does
    not exist yet (phase 26): note it there.
  - B18: a few deletions on the busy day.

- [x] 5. **Removing unused guests** (A1.1, A1.14; D27). **Small.**
  - Done (2026-11-10), Q112 has the details: `src/server/deletion/removeUnusedGuests.ts` (one D1
    batch, two statements) runs in `worker.ts` `scheduled`. A guest goes when its newest login
    is expired (more than 91 days, `LOGIN_TIMES`); a logged-out guest counts from its creation.
    Route test in `tools/route-tests/accountRoutes.test.ts` (dispatches the scheduled event).
    B18 counts 100 removals a day, measures 3,846.
  - Differs: nothing from the phase file.
  - For later items: nothing new; `accounts` #20 stays "not yet" (phase 25).
  - The daily Cron Trigger (`worker.ts` `scheduled`) deletes guest accounts whose logins have all
    gone unused for 90 days (`LOGIN_TIMES.ts`, Q55: last use is noted at most once a day), with
    their logins, so the username is free. Within the cron's 10 ms CPU: one or a few D1
    statements, no per-row loop in the Worker. `accounts` #20 stays "not yet" (records, phase
    25); test it with a unit or route test.

- [x] 6a. **Email screens: check your email, forgotten password, email links** (S12.2, S12.3,
  S12.4; design boards "Account: check your email", "Account: forgot password", "Account: email
  confirmed", "Account: set a new password", "Account: link expired"). **Large.**
  - Done (2026-11-10), Q113 has the details: `src/client/screens/email/` (`EmailDialogIfOpen`
    rendered by `App`, one dialog per screen, `useEmailRequest`), `store/EmailAccountStore.ts`
    (between `AccountSessionStore` and `ClientStore`; `ClientState.emailDialog`),
    `store/emailLinkFrom.ts` read in `main.tsx`, `api/requestEmailAction.ts` (parses an
    `EmailResponse` into a reason code or null). Signup opens "check your email"; Log in has
    **Forgot your password?**. Unit tests `screens/email/emailScreens.test.tsx`,
    `store/emailLinkFrom.test.tsx`; browser test `e2e/emailLinks.spec.ts` (screens
    `check-your-email`, `email-confirmed`, `link-expired`, `forgot-password`, `set-new-password`
    at the three sizes, axe and 24 px targets). No protocol change.
  - Differs: the boards' address on "email confirmed", "Go to the lobby", "Send a new link" and
    "Save and log in" are not used (`screens.md` S17, Q113).
  - For later items: after signing up in a browser test, close "Check your email" (**OK**)
    before clicking anything behind it (`e2e/userMenu.spec.ts` does). The local D1 needed
    `npm run db:migrate:local` for migrations 0010 and 0011 before the browser tests (signup
    answered "The server did not answer" without them); item 6b reuses `EmailProblem`,
    `useEmailRequest` and `store.sendConfirmationAgain` for Send it again in the settings.
  - After signup the notice of S12.3 with **Send it again**; the Log in form's forgotten
    password link opens the request form with the human check; opening an email link shows the
    confirmed, set a new password or link expired screen (S12.4), and a set password logs the
    browser in. Browser tests read the link from the test outbox (item 1). Screenshots next to
    the boards, at every supported size; axe; 24 px targets.

- [x] 6b. **Account settings: email and deleting** (S12.5, S12.6; design boards "Account:
  settings, email removed", "Account: delete account", "Account: delete account during a
  game"). **Large.**
  - Done (2026-11-10), Q114 has the details: `screens/account/` `EmailSetting` (with
    `EmailAddressLine`, `EmailNote`), `ChangeEmailDialog` (change and add, human check),
    `DeleteAccountDialog` (`DeleteAccountWarning`; during a game "Leave the game and delete"),
    `AccountChangeDialog`; settings load `/api/account` once (`useAccountDetails`, replacing
    `useUsernameWait`). Store: `EmailAccountStore.changeEmail` and `deleteAccount` (forgets the
    login on success). `AccountBinding` gained `isInGame` (game running without a result),
    `onChangeEmail`, `onSendConfirmationAgain`, `onDeleteAccount`. Unit tests
    `screens/account/accountEmailSettings.test.tsx`; browser test `e2e/accountSettings.spec.ts`
    (screens `change-email`, `account-settings-email`, `account-settings-email-removed`,
    `delete-account`, `delete-account-during-a-game`); e2e helpers `signUpInLobby`,
    `newestLinkSentTo`, `openLink` taken out of `emailLinks.spec.ts`. No protocol change.
  - Differs: the removed address is not named and the address is text, not a field
    (`screens.md` S17, Q114). Guests get no **Delete account** (A1.15).
  - For later items: item 7 links the privacy notice from `AccountSettingsDialog` (and signup).
    The `TextInput` error colour (#ef4444 on the modal) fails axe contrast, so screenshots with
    axe must be taken without a field error showing (the delete dialog clears its error on
    typing).
  - Settings show the address with its confirmation, a pending change, **Change email address**
    (dialog with the human check), **Send it again** for an unconfirmed address, the removed
    address explained with **Add an email address**; **Delete account** asks for the password,
    and during a game warns that it counts as leaving. Reuse the account settings and the guest
    logout warning of phase 23 item 4b. Browser tests and screenshots as 6a.

- [x] 7. **Privacy notice page** (A12.1, S12.8; Q105). **Small.**
  - Done (2026-11-10): `src/client/screens/privacy/` (`PrivacyNoticePage` with
    `PrivacyNoticeParts`, lazy-loaded by `LazyPrivacyNoticePage`, so B14 does not grow by its
    text). The page opens at `#privacy` (`PrivacyNoticeLink`, a real link, in **Sign up** and
    **Account settings**; `usePrivacyNoticeOpen` follows the address), covers the app (made
    `inert`, so a form behind it keeps what was typed) and goes back with **Back**, Escape or the
    browser's back button; opened directly, `keepPrivacyNoticeInsideApp` puts the lobby behind it.
    Contact address: `GET /api/privacy-contact` (`privacyContactRoute`, `PrivacyContactResponse`)
    from the `PRIVACY_CONTACT` var, now the placeholder "PLACEHOLDER: the owner has not given the
    contact address yet". Browser test `e2e/privacyNotice.spec.ts` (the five parts by heading,
    from signup, settings and a direct link; screen `privacy-notice` at three sizes, axe). The
    guest note of the settings moved to `GuestSignUpNote` (function length). No protocol change.
  - Differs: nothing from the phase file.
  - For later items: item 10 replaces the placeholder in `wrangler.jsonc` and the expected text in
    `e2e/privacyNotice.spec.ts`. Screenshots of signup and account settings now show the link.
  - A page open to everyone with the parts of A12.1 as headings, the contact address from a
    `wrangler.jsonc` var (`PRIVACY_CONTACT`, served to the client; until the owner gives it, a
    clearly marked placeholder value in `vars`, replaced in item 10), and a way back. Linked from
    signup (S12.3) and account settings (S12.5). Lazy-loaded if it would grow the first-screen
    bundle (`harness/budgets.yaml`). The browser test of the coverage exception finds each part
    by its heading.

- [x] 8. **No email address in logs or other players' messages** (exit criteria, A1.8, A6.3).
  **Small.**
  - Done (2026-11-10): `tools/route-tests/accountRoutes.test.ts` has a test that calls send again,
    confirm (signup and change links), reset request, set password, change email and delete, then
    fails on any logged line with one of their tokens, passwords, link tokens or addresses, or with
    anything shaped like an email address (checked by adding a log of the address to the reset
    route: the test failed). `tools/route-tests/roomLogout.test.ts` has a room test: two
    registered players, one with a pending change, play a game; no message to either socket holds
    an `@`. No product code changed.
  - Differs: nothing from the phase file. The three addresses differ before the `+` and `@`,
    since plus-addresses share one daily email count (A1.9, A1.11).
  - For later items: item 9's Resend sender logs failures by status only; this log test does not
    reach it (the route tests use the test outbox), so item 9's unit tests check its log lines.
  - Extend `tools/route-tests/accountRoutes.test.ts` to every new route (send again, confirm,
    reset request, set password, change email, delete) and fail on any console line containing
    an address, a password or a link token. Check the leak test or a room test: no view or
    message to another player carries an address.

- [x] 9. **The Brevo sender** (Q104, D30; was Resend). **Small.**
  - Changed to Brevo (2026-11-10, owner's choice: no domain, $0): `brevoSenderOf.ts` and
    `brevoKeysOf.ts` replace the Resend files. `POST https://api.brevo.com/v3/smtp/email`,
    header `api-key: <BREVO_API_KEY>`, JSON `{ sender: { name: "MarketLaw", email: EMAIL_FROM },
    to: [{ email }], subject, textContent }` (checked against Brevo's API reference). Used only
    when `BREVO_API_KEY` and `EMAIL_FROM` are both set, else the test outbox. Logs "Sending an
    email failed: Brevo answered <status>" or "... Brevo could not be reached", nothing else.
    `brevoSenderOf.test.ts` on a fake `fetch` as before. The notes below are the Resend
    version, kept as history.
  - Done (2026-11-10): `src/server/email/resendSenderOf.ts` (keys parsed by `resendKeysOf.ts`
    from `RESEND_API_KEY` and `EMAIL_FROM`); `emailSenderOf` uses it when both are set, else the
    test outbox as before, so nothing changes live yet. A non-2xx answer logs
    "Sending an email failed: Resend answered <status>", a network error "... Resend could not be
    reached"; both are `"failed"` (not counted, the site email given back). Unit tests
    `resendSenderOf.test.ts` against a fake `fetch`: request shape, 422 and offline fail, and no
    log line holds an `@`, the key, the link token or a URL. No protocol change.
  - Differs: nothing from the phase file.
  - For later items: item 10 adds `EMAIL_FROM` to `wrangler.jsonc` `vars` (then `wrangler types`
    adds it to `Env`) and sets the secret with `wrangler secret put RESEND_API_KEY`; the sender
    needs both. Live, `TEST_ROOM_SECRET` is unset, so before that every send still fails.
  - `fetch` to `https://api.resend.com/emails` with `Authorization: Bearer <RESEND_API_KEY>`,
    JSON `{ from, to, subject, text }`; `from` from the `EMAIL_FROM` var. Any non-2xx or network
    error is a failed send (not counted, A1.9) and is logged by status only, never with the
    address. Unit tests against a fake `fetch`. No npm package (record in Q104 if that changes).
    Without the key it is not used (item 1's test double), so nothing changes live yet.

- [ ] 10. **Live sending** (Q104, D30). **Small.**
  - Done before release (2026-11-10): `wrangler.jsonc` `vars` has `EMAIL_FROM` and
    `PRIVACY_CONTACT`, both `mlaw.support@gmail.com` (the owner's address for the game);
    `e2e/privacyNotice.spec.ts` expects that address. The secret `BREVO_API_KEY` is set on the
    live Worker by the owner. Locally and in the browser tests `BREVO_API_KEY` is not set, so
    the test outbox still sends.
  - Left, for the releaser after the merge: on the live site sign up with a test address,
    receive the confirmation (look in spam too), open the link, and request a reset. Record the
    result here and in Q104. If the send fails, read the Worker log line ("Brevo answered
    <status>") and Brevo's transactional log.

### Finish

- [x] First finisher run: the 15 scenarios onto `harness/required.yaml`; full check, harness,
  browser tests, budgets.
  - Done (2026-11-10): the 15 scenarios are required (`HARNESS:` commit). `npm run check` green
    (111 test files, 643 tests; B14 157.5 kB of 300). `npm run harness` green: 457 scenarios, 382
    pass, 0 fail, 75 not yet (none required); 1,000 simulated games; every budget passes, B18
    measures 3,846 of 5,000. Browser tests (`--workers=2`, five parts): shard 1/2 73 passed and
    3 failed, shard 2/2 71 passed, two and three players 3 passed each, four players 2 passed and
    1 failed. Rerun alone: `bigCardSwitch` and `accountSettings` passed at all three sizes (load);
    four players passed (3 of 3); `userMenu.spec.ts` had a real failure, fixed below, and then
    passed at all three sizes (one 2560 run dropped a connection on logout, "Network connection
    lost", and passed on its own).
  - Fixed: `e2e/userMenu.spec.ts` clicked `Change` in Account settings, which since item 6b also
    matches **Change email address**; it now matches the name exactly.
  - Item 6b's note, decided: fixed here. Field errors (`TextInput`) use a new token
    `--color-board-field-error-text` (#fca5a5, about 6.9:1 on the dialog's #392a4a, the light red
    the other error texts on boards use) instead of #ef4444 (about 3.5:1). The token is in
    `tools/design-export/BOARD_VALUES.ts` and `tokens.css`. For the reviewer: item 6b's
    `--color-board-email-pending*` and `--color-board-email-removed*` (and earlier phases'
    `account-link`, `guest-log-out`, `guest-note`) are in `tokens.css` only, not in
    `BOARD_VALUES.ts`, so `npm run design:tokens` would drop them.
  - `docs/enforcement.md`: no new check applies.
- [x] Phase review (phase-reviewer, 2026-11-10): ready after fixes. Findings:
  - [x] R1 (blocker). The per-account and per-address limits of 3 emails a day are not atomic
    (`reserveAccountEmail.ts:11` reads, `sendAccountEmail.ts:57-59` writes after the send);
    parallel Send it again requests bypass them and can use up the site's 90-a-day cap. Take
    the counts atomically before sending and give them back on a failed send; route test with
    about 5 parallel requests expecting exactly 2 more emails. Fixer group A.
    - Fixed: `reserveAccountEmail` takes the counts with one D1 batch of conditional upserts
      (`takeEmailCounts`, raised only while below 3, checked by `meta.changes`) before the
      Lobby's site email; a partly taken reservation, a site cap refusal, a failed send and a
      lost username give them back (`returnEmailCounts`, `returnAccountEmail`). A signup without
      a guest counts the new account after the send, with the link. Route test
      `tools/route-tests/emailLimitRace.test.ts` (5 parallel Send it again: 2 sent, 3 refused,
      3 emails in all). Q108 updated.
  - [x] R2. A password reset does not close the account's room sockets (A1.7); call
    `logOutOfRooms` with `isEndingEveryLogin: true` after `setPasswordWithLink`; route test in
    `roomLogout.test.ts`. Fixer group A.
    - Fixed: `newPasswordRoute` calls `logOutOfRooms` (`isEndingEveryLogin: true`, not leaving)
      after the new password is saved; the logins are already gone from D1, so a room that does
      not answer does not fail the reset. Route test "resetting the password in a room" in
      `roomLogout.test.ts` (both logins' sockets closed, the seat kept and shown away).
  - [ ] R3. The log check's email regex in `tools/route-tests/accountRoutes.test.ts:23` lost its
    backslashes; use `/[^s@"'<>]+@[^s@"'<>]+.[a-z]{2,}/iu`. Fixer group B.
  - [ ] R4. After signing up with an address confirmed elsewhere, Account settings show no
    address and Add an email address, unlike a free address (A1.3 "looks exactly the same").
    Decide, record in open-questions.md, and implement. Fixer group B.
  - [ ] R5. Seven tokens in `src/client/tokens.css` are missing from
    `tools/design-export/BOARD_VALUES.ts` (email-pending, -pending-text, -removed,
    -removed-text, account-link, guest-log-out, guest-note); add them. Fixer group B.
  - [x] R6 (suggestion). Account deletion allows unlimited password guesses with a session
    token; count failures as logins do, or record that it is accepted. Fixer group A.
    - Answered: accepted, recorded as Q115 (the login token already opens everything the
      password would; counting would break A1.15 "changes nothing").
  - [ ] R7 (suggestion). Changing the email to the account's own confirmed address sends
    "already in use" and leaves a pending change that never confirms; treat it as no change or
    refuse it, and record the decision. Fixer group B.
- [ ] Second finisher run.
- [ ] Release.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 11 | 153k | 55 | done |
| Builder, item 1 | 23 | 206k | 104 | done |
| Builder, item 2 | 14 | 170k | 73 | done |
| Builder, item 3 | 13 | 152k | 61 | done |
| Builder, item 4 | 14 | 165k | 93 | done |
| Builder, item 5 | 7 | 98k | 33 | done |
| Builder, item 6a | 19 | 191k | 74 | done |
| Builder, item 6b | 37 | 184k | 85 | done |
| Builder, items 7 and 8 (stopped once by the usage limit, resumed) | 17 | 153k | 49 | done |
| Builder, item 9 | 5 | 80k | 15 | done |
| Finisher, first run | 44 | 113k | 57 | done |
| Builder, switch to Brevo (owner's choice) | 6 | 87k | 28 | done |
| Phase reviewer | 19 | 153k | 47 | ready after fixes (R1-R7) |
