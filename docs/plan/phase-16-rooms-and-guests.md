# Phase 16: Rooms and guests

Status: in progress
Milestone: 3 Playthrough

## Goal

Guests with proper usernames and the human check, and complete rooms: create, join, size, owner,
the waiting room and accepting the game. Replaces phase 04's minimal rooms and guests.

## Depends on

Phase 15. Decision O6 (lobby, presence and global counters) is made in this phase's first step.

## Covers

- Rules: M1.1–M1.6, M1.8–M1.13 (the public list M1.7 comes in phase 17), R4.3, A1.1–A1.2, A1.12
  (human check for guests and rooms), A1.14 (staying logged in; logging out comes in phase 23),
  A2.1–A2.3.
- Screens: S10.5 (create room), S10.6 (join errors), S11.1–S11.3 (waiting room, accept dialog,
  the rejoin message), S12.1 (guest name prompt), the join-with-code part of S10.3. Design boards
  "Lobby: create room", "Lobby: join errors", "Lobby: removed from room", "Waiting room
  1920x940", "Waiting room: not the owner", "Waiting room: accept the game", "Account: guest
  name prompt".

## Builds

1. **First step, O6:** a small experiment compares a lobby Durable Object with D1 for room codes,
   presence, "one thing at a time" and the site-wide daily counters, against B7, B16 and B18. The
   owner approves the choice and any new Durable Object class in `wrangler.jsonc`.
2. **Rooms:** public or private, size 2 to 4 and changing it, owner hand-over, unique codes,
   joining, leaving, the 20-second accept showing who has accepted, the 2-minute rejoin wait,
   removal after 10 seconds disconnected while waiting.
3. **Guests:** generated descriptive names (unique, at most 20 characters), username rules,
   staying logged in for 90 days of use.
4. **Human check:** Cloudflare Turnstile on guest and room creation. The owner creates the site
   and secret keys; the browser tests use Turnstile's published test keys. Turnstile's free use
   is confirmed first (`rules/cloudflare.md`).
5. **Screens** for the above.

## Known gaps after this phase

- No public room list or players online yet (phase 17, phase 27); rooms are joined by code.
- The lobby and the waiting room show only their middle column: no ranked queue (phase 26), no
  room chat (phase 21), and no Game menu, match history, ranking, Log in or Sign up in the top
  bar (phases 23 to 28).
- A guest cannot log out yet (phase 23).

## What you can see when it's done

From the live site: get a guest name, create a room, join it by code from other windows, accept,
and play.

## Exit criteria

- An e2e test goes from the guest name prompt to a started 3-player game.

## Open points

- O6: decided as D26 (Q52), a lobby Durable Object, built in phase 17.

## Waiting for the owner

- Turnstile site and secret keys for `marketlaw.mlawd.workers.dev` (Q53). Until then local runs
  and the browser tests use Cloudflare's published test keys; the deploy waits for the real ones.

## Required scenarios

These 25 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `accounts` #1: joining without being logged in offers a free generated name and creates a guest user
- `accounts` #2: creating a guest user needs the human check
- `accounts` #3: generated names are unique not taken and at most 20 characters
- `accounts` #19: a login lasts until the site has not been used for 90 days
- `accounts` #22: rejects a username with letters outside A to Z
- `accounts` #23: rejects a username shorter than 3 characters
- `accounts` #24: usernames are unique ignoring capital letters
- `accounts` #25: Deleted player cannot be used as a username
- `accounts` #27: rejects a username with two spaces in a row
- `rooms` #2: creating a room needs the human check
- `rooms` #3: rejects a room size other than 2 3 or 4
- `rooms` #5: rejects joining a full room
- `rooms` #6: rejects joining a room whose game has started
- `rooms` #7: rejects an unknown room code
- `rooms` #8: only the owner can change the size and not below the players in the room
- `rooms` #9: rejects a new size below the number of players in the room
- `rooms` #10: when the owner leaves the player who joined next becomes owner
- `rooms` #11: a room with no players left is closed
- `rooms` #12: a full room asks everyone to accept and starts when all accept
- `rooms` #13: every player in the room sees who has accepted so far
- `rooms` #14: a player who does not accept in time is removed and the others keep waiting
- `rooms` #15: a player who declined cannot rejoin the room for 2 minutes
- `rooms` #16: a player who declined can rejoin after 2 minutes
- `rooms` #17: a player disconnected from a waiting room for 10 seconds is removed
- `rooms` #18: a page refresh within 10 seconds keeps the place in a waiting room

## Progress

- [x] 1. O6 decided as D26 (Q52): one lobby Durable Object, built in phase 17 with M1.7 and M2;
  phase 16 needs no new class. Start-of-phase questions Q53 to Q56.
- [x] 2. Rooms: public or private, size and changing it, owner hand-over, joining, leaving, the
  20-second accept with who has accepted, seats in random order, the 2-minute rejoin wait,
  removal after 10 seconds disconnected while waiting. Room actions travel on the socket as a
  new `room` message (protocol version 2). A joining player counts as disconnected until their
  socket says hello, so a join that never connects is removed after 10 s. A new lobby scenario
  driver runs the room and account scenarios. The phase 19 scenario "the room is deleted when the
  last player leaves it" is now run by that driver and reported as failing instead of "not yet",
  because its finished-room state comes in phase 19; it is not required yet.
- [x] 3. Guests: username rules, generated names, staying logged in for 90 days of use. Stored
  players were wiped by migration 0005 (allowed until version 1 is public, D1). Test-room seats
  keep no name key, so their names do not reserve usernames.
- [x] 4. Human check: Turnstile on guest and room creation, with the published test keys in local
  runs and on GitHub. The live site needs the owner's keys (see Waiting for the owner).
- [x] 5. Screens: guest name prompt, create room, join with code and its errors, waiting room,
  accept dialog, the rejoin message. The lobby shows only its middle column for now: players
  online, the public room list, the ranked queue and the room chat come in later phases. The
  browser tests now sign every player in through the username prompt and the real Turnstile test
  widget, with a unique name per test.
