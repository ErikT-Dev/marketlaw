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

1. **Done 2026-10-27.** Turn on the site lock (D6, Q10). In the Cloudflare dashboard: Workers & Pages, open the
   `marketlaw` Worker, Settings, Domains & Routes. Next to the workers.dev address, click
   **Enable Cloudflare Access**. Then click **Manage Cloudflare Access** and list the email
   addresses allowed in: yours and each tester's. If Cloudflare asks you to choose a Zero Trust
   plan, choose **Free** (up to 50 users, $0). Check it by opening
   https://marketlaw.mlawd.workers.dev in a private window: it should ask for an email code.
2. **Tell Claude the testers' email addresses**, or add them yourself in step 1.
3. **A protected config change (approved with this phase, but only the owner may make it):** in
   `knip.json`, remove `"valibot"` from `ignoreDependencies`. It is used now, and knip prints a
   hint about it. Nothing fails without the change.

## Progress

- [x] 1. Room logic in `src/server/room/` over a synchronous `RoomStorage` (`loadRoom`,
  `createRoomIn`, `joinRoomIn`, `receiveMessage`); the clock and the random sequence are passed in.
  `GameRoom` is the thin Durable Object adapter (Hibernation API, `serializeAttachment` per socket,
  the synchronous key-value storage). The room driver (`tools/harness-runner/room/`) runs raw
  messages through the same logic with an in-memory store that counts its writes (B1, B2), and
  times each message (B11). Seats follow the join order; random seats (R4.3) come with rooms in
  phase 16. Reworked after the phase review (Q15).
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
- [x] 8. Site lock: the owner turned on Cloudflare Access for the whole Worker (scope: all
  traffic; policy: members of the owner's Cloudflare account; testers will be added by email).
  Checked 2026-10-27: a request without a login, to the page and to the API, is redirected to
  Cloudflare's login (302).
- [x] 9. Browser tests: a GitHub job runs them on every branch, and the deploy runs them before
  deploying. The test runs two browsers through turn 1 at all three sizes, with the accessibility
  check, a refresh, and the first leak check (no frame to a player holds a card of the other's
  hand). `playwright-core` pinned (Q13).
- [ ] 10. Measurements: O4 done (`decisions.md`); Workers Logs on (Q14). B11 and awake time (O9)
  need the live room, so they are measured right after the merge, which waits for the site lock.

## Report

Written before the merge; the live measurements (B11 CPU time and awake time, O9) are added after
it.

**What was built.**
- **Server:** guests (D1 `players`, token hashes only), rooms created and joined by code, and the
  `GameRoom` Durable Object that runs the engine. It saves each accepted move before replying or
  updating anyone.
- **Protocol:** versioned messages with session tokens, action ids and state versions. Unreadable,
  unknown, outdated, forged, stale and repeated messages are rejected or answered as `HARNESS.md`
  says. A connection is closed after 30 rejected messages in a minute.
- **Browser:** `RemoteGameHost` reconnects and resyncs on its own; bare start, room, waiting and
  game screens; a "please use a larger screen" message below 1280 px.
- **Browser tests:** they run on GitHub on every branch and before every deploy.

**What to try (after the merge).** Behind the site lock: open two windows (one private), create a
room in one and join with its code in the other, sell or play a card and end the turn in both,
and see turn 2 in both. Refreshing reloads the same game.

**Differences from the phase file.**
- Seats follow the join order. Random seats (R4.3) come with rooms in phase 16.
- `valibot` stays in knip's ignore list until the owner changes the protected `knip.json`.
- B11 and awake time are measured on the live site after the merge.

**Decisions:** Q10 (Access is free), Q11 (repeated action ids), Q12 (B1 and B2 required), Q13
(`playwright-core` pinned), Q14 (Workers Logs on, tokens only in bodies), Q15 (room storage and the
lost-move race), Q16 (non-members and waiting rooms), Q17 (rooms and sessions that are gone). O4 was
measured (`decisions.md`): PBKDF2 is capped at 100,000 iterations in Workers.

**Phase review findings and what happened to each:**
1. **Blocker: a confirmed move could be lost** while the room waited for D1. Fixed (Q15): the
   sender is looked up first, and loading, handling and saving run with no wait in between.
2. **Blocker: a browser whose room was gone reconnected forever.** Fixed (Q17): close code 4404,
   no reconnect, back to the room choice or start page; the backoff resets only after an update.
3. **B10 and B11 were not measured.** Fixed: an idle-client browser test (B10); the room driver's
   time per message is shown in the report (B11, highest 1 ms); live CPU time follows the merge.
   Q12 corrected.
4. **There was no storage interface, so B1 could not fail.** Fixed (Q15): `RoomStorage`, and the
   driver counts real writes.
5. **valibot was still in knip's ignore list.** Answered: `knip.json` is protected, so the change
   is listed for the owner.
6. **The saved game's schema version was not checked.** Fixed: both versions are checked on load.
7. **There were no tests for joining or the room logic.** Fixed: room tests in the Workers runtime
   (creating with a taken code, full and started rooms, joining twice, seat order, writes per
   message, non-member resync, old saves). Answered for the worker's HTTP routes: they need D1
   migrations inside the Workers test pool, which needs a change to the protected
   `vitest.config.ts`; the browser tests cover them for now.
8. **Progress and enforcement docs were behind.** Fixed: Progress was updated while the review
   ran, and `enforcement.md` now.
9. **Anyone with a token could watch a room's names.** Fixed (Q16): non-members get `not_in_game`.
10. **The room driver dropped `seat` and `room_code` without saying so.** Answered: recorded in
    Q16.
11. **Smaller items.** Fixed: the error when no free code is found; `/join` accepts POST only;
    the leak check now also covers the turn-1 hands during turn 1; an action that cannot be sent
    is reported instead of left pending; pending actions are cleared on disconnect; the waiting
    list's keys. Answered: a shared host contract suite comes when a second host exists.

