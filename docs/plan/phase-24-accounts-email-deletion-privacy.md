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
- Until the owner has done "Waiting for the owner", the live site sends no emails (item 10).

## What you can see when it's done

Confirm an email, reset a password, change the email address, delete an account, read the
privacy notice.

## Exit criteria

- No email address appears in any log or any other player's message.

## Open points

- O3, O7: decided at the start (D30, D31; Q104, Q105).

## Waiting for the owner

Everything except the live sending (item 10) is built and tested without these. Only you can do
them, because they need an account with an outside service and a secret.

1. **A domain to send email from.** Emails must come from a domain you control (the site's
   `workers.dev` address cannot be used). If you have none, register one (a yearly payment,
   your choice of registrar; Cloudflare Registrar sells at cost) and add it to your Cloudflare
   account (free DNS). If you would rather not have a domain, say so: Claude then switches to
   Brevo with a single sender address, which needs no domain but whose emails often land in
   spam (Q104).
2. **A free Resend account.** Sign up at https://resend.com (Free plan, no card). Under
   **Domains**, add a sending subdomain such as `mail.<your domain>` and add the DNS records
   Resend shows (with Cloudflare DNS, Resend offers to add them for you). Wait until the domain
   shows **Verified**.
3. **The API key.** Under **API Keys**, create a key with **Sending access**, limited to that
   domain. In the project folder run `npx wrangler secret put RESEND_API_KEY` and paste the key.
   Do not paste it into the chat or any file.
4. **Two addresses, not secret:** tell Claude in the chat (a) the sender, for example
   `MarketLaw <noreply@mail.<your domain>>`, and (b) the contact address for the privacy notice
   (A12.1), which players may write to.

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

- [ ] 1. **Sending emails and the signup confirmation** (A1.3, A1.4, A1.8, A1.9, A1.11, A9.6;
  Q104, Q106; scenarios `accounts` #4, #6, #18, #28, #29, #46). **Large.**
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

- [ ] 2. **Confirming an address and resetting a password** (A1.4, A1.7, A1.11, A1.12, A1.16;
  Q106; scenarios `accounts` #9, #10, #15, #17, #43, #44). **Large.**
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

- [ ] 3. **Changing and adding an email address** (A1.10, A1.11, A1.12, A1.16; Q106; scenario
  `accounts` #16). **Small.**
  - Route with the human check, registered users only (`not_registered`): stores the pending
    address (a newer change replaces it), sends `change_confirm` or `already_in_use`, under the
    limits. Confirming replaces the old address and applies A1.11 to the new one. A user whose
    address was removed (A1.11) adds one the same way. The account view (`api/accountRoute.ts`)
    shows the address, whether it is confirmed, the pending address and whether it was removed,
    to the account holder only (A6.3).

- [ ] 4. **Deleting an account** (A1.15, M6.10, A2.3; Q107; scenarios `connections-and-leaving`
  #16, `accounts` #45; #21 stays "not yet" until records exist in phase 25). **Large.**
  - Route: registered users only, the account's password (`password_wrong`, one hash as in
    Q90). Removes email, pending email, password hash, every login and every link; frees the
    username (the account row becomes a deleted marker or is removed; whatever phase 25 needs to
    show "Deleted player" for its records, decide and note it for phase 25). Per-address email
    counts stay (A1.9).
  - In a room: during a game it is leaving (M6.10, reuse the logged-out guest path of phase 23,
    `leaveAsLoggedOutGuest.ts`); waiting in a room, the player leaves it. The ranked queue does
    not exist yet (phase 26): note it there.
  - B18: a few deletions on the busy day.

- [ ] 5. **Removing unused guests** (A1.1, A1.14; D27). **Small.**
  - The daily Cron Trigger (`worker.ts` `scheduled`) deletes guest accounts whose logins have all
    gone unused for 90 days (`LOGIN_TIMES.ts`, Q55: last use is noted at most once a day), with
    their logins, so the username is free. Within the cron's 10 ms CPU: one or a few D1
    statements, no per-row loop in the Worker. `accounts` #20 stays "not yet" (records, phase
    25); test it with a unit or route test.

- [ ] 6a. **Email screens: check your email, forgotten password, email links** (S12.2, S12.3,
  S12.4; design boards "Account: check your email", "Account: forgot password", "Account: email
  confirmed", "Account: set a new password", "Account: link expired"). **Large.**
  - After signup the notice of S12.3 with **Send it again**; the Log in form's forgotten
    password link opens the request form with the human check; opening an email link shows the
    confirmed, set a new password or link expired screen (S12.4), and a set password logs the
    browser in. Browser tests read the link from the test outbox (item 1). Screenshots next to
    the boards, at every supported size; axe; 24 px targets.

- [ ] 6b. **Account settings: email and deleting** (S12.5, S12.6; design boards "Account:
  settings, email removed", "Account: delete account", "Account: delete account during a
  game"). **Large.**
  - Settings show the address with its confirmation, a pending change, **Change email address**
    (dialog with the human check), **Send it again** for an unconfirmed address, the removed
    address explained with **Add an email address**; **Delete account** asks for the password,
    and during a game warns that it counts as leaving. Reuse the account settings and the guest
    logout warning of phase 23 item 4b. Browser tests and screenshots as 6a.

- [ ] 7. **Privacy notice page** (A12.1, S12.8; Q105). **Small.**
  - A page open to everyone with the parts of A12.1 as headings, the contact address from a
    `wrangler.jsonc` var (`PRIVACY_CONTACT`, served to the client; until the owner gives it, a
    clearly marked placeholder value in `vars`, replaced in item 10), and a way back. Linked from
    signup (S12.3) and account settings (S12.5). Lazy-loaded if it would grow the first-screen
    bundle (`harness/budgets.yaml`). The browser test of the coverage exception finds each part
    by its heading.

- [ ] 8. **No email address in logs or other players' messages** (exit criteria, A1.8, A6.3).
  **Small.**
  - Extend `tools/route-tests/accountRoutes.test.ts` to every new route (send again, confirm,
    reset request, set password, change email, delete) and fail on any console line containing
    an address, a password or a link token. Check the leak test or a room test: no view or
    message to another player carries an address.

- [ ] 9. **The Resend sender** (Q104, D30). **Small.**
  - `fetch` to `https://api.resend.com/emails` with `Authorization: Bearer <RESEND_API_KEY>`,
    JSON `{ from, to, subject, text }`; `from` from the `EMAIL_FROM` var. Any non-2xx or network
    error is a failed send (not counted, A1.9) and is logged by status only, never with the
    address. Unit tests against a fake `fetch`. No npm package (record in Q104 if that changes).
    Without the key it is not used (item 1's test double), so nothing changes live yet.

- [ ] 10. **Live sending** (waits for the owner: "Waiting for the owner" 1 to 4). **Small.**
  - When the owner has set `RESEND_API_KEY` and given the two addresses: put `EMAIL_FROM` and
    `PRIVACY_CONTACT` into `wrangler.jsonc` `vars`, deploy with the phase, and on the live site
    sign up with a test address the owner names, receive the confirmation, open the link, and
    request a reset. Record the result here and in Q104. If the owner has not done it when
    everything else is done, the phase is **waiting for the owner**.

### Finish

- [ ] First finisher run: the 15 scenarios onto `harness/required.yaml`; full check, harness,
  browser tests, budgets.
- [ ] Phase review.
- [ ] Second finisher run.
- [ ] Release.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter | 11 | 153k | 55 | done |
