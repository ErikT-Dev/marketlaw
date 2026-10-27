# Phase 26: Ranked queue

Status: approved
Milestone: 5 Accounts and ranking

## Goal

Registered players with a confirmed email join the ranked queue with their chosen game sizes and
are matched into 2-, 3- or 4-player ranked games.

## Depends on

Phase 25.

## Covers

- Rules: A8, A6.3 (who is in the queue is hidden), A9.1–A9.4 for the queue, M2 for the queue,
  M7.1 (no vote in ranked games).
- Screens: S10.4 (ranked panel with game-size toggles and counts per size), S10.7 (match found
  with the game size). Design boards "Lobby: in the ranked queue", "Lobby: match found", "Lobby:
  ranked locked".

## Builds

1. **Ranked queue** in one Durable Object (a new class in `wrangler.jsonc`, approved with this
   phase): game sizes per player, matching as a pure function on every queue change and at 00:00
   UTC, a 20-second confirmation without names, failure handling, the 2-minute rejoin wait.
2. **Ranked games** started in a new room; no abandon vote.
3. **Screens** for the above. The busy-day simulator adds queue use (B18).

## Known gaps after this phase

- Ranked games are played, but ratings change from phase 27.

## What you can see when it's done

With several registered test accounts: choose game sizes, get matched, confirm, and play a ranked
game.

## Exit criteria

- B18 within its limit with the queue in use.

## Open points

- None.

## Required scenarios

These 28 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `connections-and-leaving` #22: ranked games cannot be abandoned by vote
- `lobby-queue-and-limits` #2: only registered users with a confirmed email can join the ranked queue
- `lobby-queue-and-limits` #3: guest users cannot join the ranked queue
- `lobby-queue-and-limits` #4: joining the queue without choosing game sizes means 3 players only
- `lobby-queue-and-limits` #5: a player can join the queue with several game sizes
- `lobby-queue-and-limits` #6: rejects joining the queue with no game size
- `lobby-queue-and-limits` #7: rejects a game size other than 2 3 or 4
- `lobby-queue-and-limits` #8: changing game sizes keeps the place in the queue
- `lobby-queue-and-limits` #9: rejects changing to no game size while in the queue
- `lobby-queue-and-limits` #10: changing game sizes can make a match straight away
- `lobby-queue-and-limits` #11: the queue count is public per game size and members see only themselves
- `lobby-queue-and-limits` #12: three players in the queue are matched and asked to confirm without seeing each other
- `lobby-queue-and-limits` #13: the longest waiting player is matched first even into a smaller game
- `lobby-queue-and-limits` #14: a larger game size is tried before a smaller one
- `lobby-queue-and-limits` #15: four players who chose 4 are matched into a 4 player game
- `lobby-queue-and-limits` #16: when all three confirm a ranked game starts in a new room
- `lobby-queue-and-limits` #17: when both players of a 2 player match confirm a ranked 2 player game starts
- `lobby-queue-and-limits` #18: a player who does not confirm leaves the queue and the others go back to the front
- `lobby-queue-and-limits` #19: a player who declined a match cannot rejoin the queue for 2 minutes
- `lobby-queue-and-limits` #20: a player can leave the queue and a closed connection for 10 seconds leaves it
- `lobby-queue-and-limits` #21: a player at 2000 actions today cannot join a new game
- `lobby-queue-and-limits` #22: the daily action count resets at midnight UTC
- `lobby-queue-and-limits` #23: a player's actions in a game are added to the daily count when the game ends
- `lobby-queue-and-limits` #26: the ranked queue makes no match while the site game limit is reached
- `lobby-queue-and-limits` #27: the ranked queue makes its matches at midnight UTC after the site game limit
- `records-and-ratings` #8: email addresses and queue members are never shown to other players
- `rooms` #19: a player in a room cannot join another room or the queue
- `rooms` #20: after a game ends joining the queue takes the player out of the finished room
