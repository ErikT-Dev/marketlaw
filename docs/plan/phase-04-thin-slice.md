# Phase 04: Thin slice: one turn on the live server

Status: approved
Milestone: 2 Slice

## Goal

Two people in two browsers play turn 1 together on the live site: create a room, join it by
code, play cards, sell, end the turn and see the result. Every layer is real, every screen is
bare. The site is locked to the owner and testers from now on, and the Cloudflare budgets are
measured on the real platform.

## Depends on

Phase 03.

## Covers

- Rules: M9 (protocol version, session token, action ids, state versions, malformed and unknown
  messages, M9.6's rejected-message limit), and from `rules/multiplayer.md` "persist before
  acknowledging", "full resync" and "identity". Minimal parts of M1 (create a room, join by code)
  without the lobby, human check or accepting, which come in phases 16–17.
- Budgets: B1, B2, B10, B11 measured from now on.

## Builds

1. **Room logic in two parts:** a room core in `src/server/` that validates intents, calls the
   engine, decides what to save and which views to send, against a storage interface and an
   injected clock; and the `GameRoom` Durable Object as a thin adapter (SQLite storage, WebSocket
   Hibernation API, per-socket data in `serializeAttachment`). The scenario runner's **room
   driver** uses the room core with in-memory storage that counts rows written.
2. **Protocol** in `src/shared/` as `valibot` schemas (protocol version, session token, action
   id, state version); every inbound message is parsed before any logic. `valibot` leaves knip's
   ignore list (approved with this phase).
3. **Saving:** one row per accepted action, state and action-log entry together; views are sent
   only after the write. A room whose saved `schemaVersion` is not current closes itself on load
   (D1).
4. **Guest identity, minimal:** a typed name gives a guest account with a random 128-bit session
   token kept in the browser; only a hash is stored (D1 `players` table). Username rules,
   generated names and the human check come in phase 16.
5. **Rooms, minimal:** create a room of 2 to 4 and get a code; join with it; the game starts when
   full.
6. **`RemoteGameHost`** in `src/hosts/` and one client store; resync on connect, reconnect and
   version gaps.
7. **Bare screens:** start page (name, create, join), waiting page with the code, game page
   (your hand and stats, others' hand counts and stats, Play, Sell, End turn), with accessible
   names.
8. **Site lock (D6):** Cloudflare Access in front of the site for the owner and invited testers,
   after confirming it is free; set up by the owner in the Cloudflare dashboard with
   instructions from this phase.
9. **Browser tests on GitHub:** Playwright's Chromium installed; a GitHub job runs the e2e tests
   against `wrangler dev` on every branch and must pass before master deploys. The first test
   runs two browser contexts through turn 1, and checks every message for hidden card ids (first
   version of the leak test).
10. **Measurements on the live platform:** computing time per message (B11) and how long a room
    stays awake during play (O9), from Cloudflare's dashboard or `wrangler tail`; a one-hour
    password-hashing experiment (O4); and whether Workers Logs on the free plan give enough error
    logs, plus a daily usage check the owner can open. Results go into `decisions.md`.

## Known gaps after this phase

- Bare screens; no market phase; no clocks; other players' actions visible at once.

## What you can see when it's done

Log in through the site lock, open two browser windows (one private), create a room in one, join
with the code in the other, play a card and end the turn in both, and see the end-of-turn result
in both. Refreshing a window reloads the same game.

## Exit criteria

- B1, B2, B10 and B11 within limits in the report; B11 and awake time also measured live.
- The e2e test passes on GitHub; the leak check finds no hidden card ids.
- Someone not invited cannot open the site.

## Open points

- O4 and O9 results; if B12 looks unreachable, the owner decides the budget question now.

## Required scenarios

These 10 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `hostile-client` #1: rejects a message that cannot be read
- `hostile-client` #2: rejects a message with a missing field
- `hostile-client` #3: rejects an unknown action
- `hostile-client` #4: rejects a message with an old protocol version
- `hostile-client` #5: rejects a forged player token
- `hostile-client` #6: a room code is not proof of identity
- `hostile-client` #7: rejects an action based on an older state version
- `hostile-client` #8: a repeated action id returns the original result and changes nothing more
- `hostile-client` #9: rejects an action from a player who is not in the game
- `hostile-client` #15: a connection that sends 30 rejected messages within a minute is closed
