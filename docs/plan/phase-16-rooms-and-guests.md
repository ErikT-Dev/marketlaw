# Phase 16: Rooms and guests

Status: done
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

- Nothing. The owner gave the Turnstile site key and set the secret key on 2026-11-03 (Q53).

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
  last player leaves it" is claimed by that driver but cannot pass until finished rooms exist
  (phase 19); it is not required yet.
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

## Report

**Built.** Rooms are public or private, size 2 to 4. Only the owner changes the size, never below
the players present, and the next player to join becomes owner when the owner leaves. Room codes
are unique. A full room asks everyone to accept within 20 seconds and shows who has accepted; the
game starts when all accept, with seats in random order, and it is casual. A player who declines
or runs out of time is removed and can rejoin after 2 minutes. A player disconnected from a
waiting room for 10 seconds is removed, and a page refresh keeps the place. Guests choose a
username prefilled with a free generated name, checked against A2.1 to A2.3. Guest and room
creation need the Turnstile human check. A login lasts until 90 days without use (Q55).

**What to try.** On the live site: Create room, keep or change the offered username, pass the
human check, choose the size and create. From other browser windows, type the room code and Join
with code, each choosing a username. When the room is full, everyone gets the accept dialog; when
all accept, the game starts. Try a wrong code, a full room, declining (and rejoining at once,
which shows the time left), changing the size as owner and as another player, and Leave room.

**Checks.** `npm run check` green (298 tests). `npm run harness` green: 1,000 simulated games
(D25), every required invariant, and all required scenarios including this phase's 25. Browser
tests green on GitHub at all three screen sizes, including the exit criterion (guest name prompt
to a started 3-player game) and a decline with its rejoin wait.

**Differences from the phase file.**
- The lobby and waiting room show only their middle column (known gaps).
- Room actions travel on the room's socket as a new `room` message; the protocol version is now 2.
- Stored players were wiped (migration 0005); old guest logins end and choose a username again.
- The browser tests sign players in through the real Turnstile test widget, with a unique name per
  test, since usernames are now unique.

**Decisions.** D26 (Q52, O6): one lobby Durable Object, in phase 17. Q53: Turnstile is free; the
owner's keys are set. Q54: the asking is part of waiting (`multiplayer.md` M1.11 sentence). Q55:
the last use is noted at most once a day (`accounts.md` A1.14 sentence). Q56: generated names.
Q57: waiting-room connections write only on a close; seat order is drawn by the room. Harness
changes: M1.11 and A1.14 sentences, new rule S10.9 (lobby and room messages), the 25 scenarios on
`required.yaml`.

**Review findings and what happened to each.**
1. Removals were sent before the room was saved on an alarm: fixed, saved first.
2. An accept after 20 s or a reconnect after 10 s could still count before a late alarm: fixed,
   overdue removals are applied before every message and join; unit tests added.
3. The generated-name scenario check could never fail and used `Math.random`: fixed, it fails on a
   missing or forbidden name and draws deterministically.
4. The idle-client browser test installed the fake clock too late: fixed, installed before the page
   loads, with the guest and room made through the API.
5. The 91-day login was not in the spec and expiry was untested: A1.14 amended; unit test added.
6. Waiting-room connects wrote rows: fixed, only a close writes (Q57).
7. A creator who never connected was never removed: fixed, counted as not yet connected and the
   alarm set on creation.
8. The lobby messages were not in the spec: added as S10.9; S16.3 stays for game moves.
9. The lobby driver bypassed some production paths: it now uses `createRoomIn` and `joinRoomIn`;
   Turnstile failure paths have unit tests, and a browser test checks case-insensitive usernames
   against the real database.
10. Hook types shared files with their hooks: moved to their own files.
11. Rejected room actions were silent: the waiting room shows them. Leaving while offline still
    leaves at once; the room removes the player after 10 s.
12. "Game already started" wording: now "The game in this room has already started."
13. Seat order drawn outside the engine: recorded in Q57; it is stored in the room record.
14. Two commits did not type-check on their own: they are pushed, so not rewritten; a proposed rule
    in `proposed-rules.md` prevents it.
15. The phase note on the phase 19 scenario was out of date: corrected.
16. The production secret: confirmed set with `wrangler secret list` before the merge.
