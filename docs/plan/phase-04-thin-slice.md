# Phase 04: Thin slice: one turn on the live server

Status: in progress
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

## Waiting for the owner

1. **Turn on the site lock (D6, Q10).** In the Cloudflare dashboard: Workers & Pages, open the
   `marketlaw` Worker, Settings, Domains & Routes. Next to the workers.dev address, click
   **Enable Cloudflare Access**. Then click **Manage Cloudflare Access** and list the email
   addresses allowed in: yours and each tester's. If Cloudflare asks you to choose a Zero Trust
   plan, choose **Free** (up to 50 users, $0). Check it by opening
   https://marketlaw.mlawd.workers.dev in a private window: it should ask for an email code.
2. **Tell Claude the testers' email addresses**, or add them yourself in step 1.

## Progress

- [x] 1. Room core in `src/server/room/` (`handleMessage`, `joinRoom`, `createRoomRecord`): pure
  functions over a `RoomRecord` that say what to save, what to reply and whom to update; the clock
  and the random sequence are passed in. `GameRoom` is the thin Durable Object adapter
  (Hibernation API, `serializeAttachment` per socket, key-value storage of the record). The room
  driver (`tools/harness-runner/room/`) runs raw messages through the same core and counts the
  rows each would write (B1, B2). Seats follow the join order; random seats (R4.3) come with rooms
  in phase 16.
- [x] 2. Protocol in `src/shared/protocol/` and `src/shared/api/` as valibot schemas; messages are
  parsed in `parseClientMessage` before any logic, in the reason-code order of `HARNESS.md`.
  `valibot` cannot leave knip's ignore list: `knip.json` is protected (Waiting for the owner).
- [x] 3. Saving: the record (game, action log and state versions) is one key, written once per
  accepted action and per membership change, before replies and updates. A record with another
  schema version is deleted on load and its sockets closed (D1). Repeated action ids: Q11.
- [x] 4. Guest identity: `POST /api/guests` with a name gives a 256-bit token from
  `crypto.getRandomValues`; D1 `players` keeps only its SHA-256 hash. Tokens travel only in
  bodies and WebSocket messages (Q14).
- [x] 5. Rooms: `POST /api/rooms` (size 2-4) returns a code of 6 characters (M1.5); `POST
  /api/rooms/{code}/join`; the game starts when the room is full.
- [x] 6. `RemoteGameHost` in `src/hosts/` (resync on open, on a version gap and after
  `stale_state`; reconnects with growing delays; no heartbeats, B10) with host contract tests;
  one `ClientStore` in the client.
- [x] 7. Bare screens: start, room choice, waiting with the code, game page with Play, Sell and End
  turn per card; a "please use a larger screen" message below 1280 px.
- [ ] 8. Site lock: waiting for the owner (see above).
- [x] 9. Browser tests: a GitHub job runs them on every branch, and the deploy runs them before
  deploying. The test runs two browsers through turn 1 at all three sizes, with the accessibility
  check, a refresh, and the first leak check (no frame to a player holds a card of the other's
  hand). `playwright-core` pinned (Q13).
- [ ] 10. Measurements: O4 done (`decisions.md`); Workers Logs on (Q14). B11 and awake time (O9)
  need the live room, so they are measured right after the merge, which waits for the site lock.

