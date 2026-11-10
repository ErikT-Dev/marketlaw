# Phase 25: Game records and match history

Status: approved
Milestone: 5 Accounts and ranking

## Goal

Every finished game is saved as a game record, and every player has a match history that anyone
can open.

## Depends on

Phases 22 (abandoned games save no record) and 24 (deleted accounts).

## Covers

- Rules: A3, A4, A6.1–A6.2, A6.4, M8.3 (records kept when the room is deleted).
- Budgets: B8 (rows written per finished game outside the room).
- Screens: S13.1, S13.2, usernames open match histories everywhere, S10.1's "My match history".
  Design boards "Records: match history", "Records: game record", "Records: match history empty",
  "Records: another player's match history".

## Builds

1. **Game records in D1,** written once when a game finishes or the last player is left.
2. **Match history** pages and the full record view.
3. **Current usernames** in records; "Deleted player" for deleted accounts and removed guests.
   Deleting an account (phase 24, Q111) and removing a guest remove the account row, so a
   record's player id without an account row is "Deleted player".

## Known gaps after this phase

- No ranked games or ratings yet.

## What you can see when it's done

Finish a game, open your match history and the game's record; click another player's name to
see theirs.

## Exit criteria

- B8 within its limit.

## Open points

- None.

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #20: a guest account not used for 90 days is deleted and shows as Deleted player
- `accounts` #21: deleting a registered account frees the username and shows Deleted player in records
- `connections-and-leaving` #11: when only one player is left the game ends and that player wins
- `records-and-ratings` #1: a finished game saves a game record with every player's result and values
- `records-and-ratings` #2: a player who left is recorded with their values when they left
- `records-and-ratings` #3: an abandoned game saves no game record
- `records-and-ratings` #4: game records always show the current username
- `records-and-ratings` #5: the match history lists games newest first with a short overview
- `rooms` #21: after a game the room stays and is deleted 24 hours after the game ended
