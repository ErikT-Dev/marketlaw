# Phase 27: Ratings, ranking and players online

Status: approved
Milestone: 5 Accounts and ranking

## Goal

ELO ratings change after ranked games, the ranking table lists everyone who has played one, and
the lobby shows players online with their ratings.

## Depends on

Phase 26.

## Covers

- Rules: A10, A5, A7, R9.14's "ratings stay the same".
- Checks: `HARNESS.md` point 7, the rating calculation check (+2.5 → +3, −2.5 → −3).
- Screens: S13.3 (ELO ranking with Jump to me), S10.1's "ELO ranking", S10.2 (players online),
  S9.5's ranked columns, ratings on player badges. Design boards "Records: ELO ranking", "Records:
  not in the ranking yet", "End: turn limit, ranked", the players online list of "Lobby
  1920x940" and the waiting room.

## Builds

1. **ELO** updated for all players at once from the ratings before the game, with A10.4's k rules.
2. **Ranking table,** 50 per page, Jump to me.
3. **Players online** with status and rating.

## Known gaps after this phase

- No menu, rules viewer, card set or tutorial.

## What you can see when it's done

Play a ranked game with test accounts and see ratings change on the end screen, in the ranking
table and in players online.

## Exit criteria

- The rating calculation check passes.

## Open points

- None.

## Required scenarios

These 12 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `lobby-queue-and-limits` #1: anyone can see the players online with their status and rating
- `records-and-ratings` #6: the ranking table lists registered users with a ranked game by rating
- `records-and-ratings` #7: the ranking table shows 50 players per page and can jump to the player's position
- `records-and-ratings` #9: three new players change rating by 20 0 and minus 20
- `records-and-ratings` #10: rating changes use each player's own k and the ratings before the game
- `records-and-ratings` #11: a rating difference over 400 counts as 400
- `records-and-ratings` #12: a player who ever reached 2400 uses k 5
- `records-and-ratings` #13: two new players in a 2 player ranked game change rating by 20 and minus 20
- `records-and-ratings` #14: four new players in a 4 player ranked game change rating by 20 7 minus 7 and minus 20
- `records-and-ratings` #15: a player who left is placed below the players who stayed for ratings
- `records-and-ratings` #16: an abandoned game leaves ratings unchanged
- `turns-and-time` #26: a game paused for 24 hours is abandoned
