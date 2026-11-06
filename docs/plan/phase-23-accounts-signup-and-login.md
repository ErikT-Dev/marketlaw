# Phase 23: Accounts: signup and login

Status: approved
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

- O4.

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #5: changing the username during signup does not count toward the 7-day limit
- `accounts` #7: signup needs the human check
- `accounts` #8: rejects a password shorter than 8 or longer than 64 characters
- `accounts` #11: a registered user logs in with username or email and password
- `accounts` #12: a wrong password is rejected
- `accounts` #13: after 3 failed logins in 15 minutes further logins need the human check but the account is not locked
- `accounts` #14: after 3 failed logins a login without the human check is rejected
- `accounts` #26: a username can be changed at most once every 7 days
- `connections-and-leaving` #17: a guest who logs out during a game leaves it
