# Phase 20: Cost protection and the playthrough version

Status: approved
Milestone: 3 Playthrough

## Goal

The daily limits that keep the site inside the Cloudflare Free plan, every budget measurable so
far within its limit, and a full end-to-end check of the playthrough version.

## Depends on

Phase 19. Decision O5 (game length) is made, and any resulting rule changes are built.

## Covers

- Rules: A9.1–A9.4 for rooms and games (the queue joins them in phase 26).
- Budgets: B1–B5, B9–B18 as far as their features exist, in `npm run harness`; B15 (time from a
  move to the updated view) in the browser tests; B18 in the busy-day simulator with the limits.
- Screens: S16.1 (daily limit notices). Design board "Notices: daily limits", without the ranked
  queue text it shows (`screens.md` S17).

## Builds

1. **Daily counts** per player and for the site, reset at 00:00 UTC; actions added when a game
   ends or the player leaves it; checked when joining a room and again when a game starts.
2. **Budget checks** in the report, each with its measurement and limit.
3. **Full browser tests:** complete games with 2, 3 and 4 players from the lobby to the end
   screen, with screenshots of every key screen in `harness/screens/`.
4. **Playthrough checklist** for the owner: what to try, in which order, with several people.

## Known gaps after this phase

- No chat, votes, rematches, registered accounts, records, ranking, menu or tutorial.

## What you can see when it's done

**The playthrough version:** 2 to 4 people, each on their own computer, play a complete game on
the live site from the lobby to the final score. Invited testers only (D6).

## Exit criteria

- Every measurable budget within its limit.
- Full-game browser tests pass for 2, 3 and 4 players.
- The owner has played at least one complete game with others and accepted the milestone.

## Open points

- Findings from the owner's playthrough become spec changes (with approval) or new phases before
  milestone 4 starts.

## Required scenarios

These 5 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `lobby-queue-and-limits` #24: a player who started 10 games today cannot start another
- `lobby-queue-and-limits` #25: after 50 games start on the site today no more games start
- `lobby-queue-and-limits` #31: the game start limit is checked again when a game starts
- `lobby-queue-and-limits` #32: a guest at 2000 actions today cannot join a room
- `lobby-queue-and-limits` #33: the daily action count resets at midnight UTC for joining a room
