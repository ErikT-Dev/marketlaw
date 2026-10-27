# Phase 24: Accounts: email, deletion and privacy

Status: approved
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

- No game records yet, so "Deleted player" appears from phase 25.

## What you can see when it's done

Confirm an email, reset a password, change the email address, delete an account, read the
privacy notice.

## Exit criteria

- No email address appears in any log or any other player's message.

## Open points

- O3, O7.

## Required scenarios

These 11 scenarios are added to `harness/required.yaml` in this phase, by file and number:

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
- `connections-and-leaving` #16: deleting the account during a game counts as leaving it
