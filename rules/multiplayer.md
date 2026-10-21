# Multiplayer

### Never trust the client
Every inbound action is checked against authoritative state: right room, right player, player's
turn, legal in the current phase, cards actually held. Client-side checks exist only for UX.
**Why:** the browser is under the player's control.
**Enforced by:** hostile client scenarios.

### Hidden information never leaves the server
Hands, deck order, RNG seed and other players' private data are never sent to a client that is
not entitled to them, not even "temporarily" or in debug fields. Other players' hands are sent
as counts.
**Why:** anything sent is visible in the browser dev tools.
**Enforced by:** `viewFor` as the only serialiser · leak test.

### Persist before acknowledging
Apply the action, write the new state to Durable Object storage, then acknowledge and broadcast.
A crash after the ack must never lose an acknowledged move.
**Why:** players must never see a move succeed and then vanish.
**Enforced by:** review · restart test in e2e.

### Idempotent, ordered actions
Each client action carries a client-generated action id and the state version it was based on.
Duplicate action ids return the original result; stale versions are rejected with
`stale_state`, and the client resyncs.
**Why:** reconnects and retries will resend messages.
**Enforced by:** hostile client scenarios.

### Full resync is always available
A client can request its complete current `PlayerView` at any time, and does so on connect,
reconnect and any version gap.
**Why:** incremental updates eventually miss one; resync makes that harmless.
**Enforced by:** e2e reconnect tests.

### Identity
Guests get a random, unguessable player token (128+ bits from `crypto.getRandomValues`) stored
client-side and sent on connect. Room codes are for joining only and are never proof of
identity. Never log tokens.
**Why:** a guessable token lets anyone take over another player's seat.
**Enforced by:** review · forged-token scenario.

### Disconnects are normal
A disconnected player keeps their seat for the spec-defined grace period. Turn timers and
abandonment follow the spec; nothing is decided by "the socket closed".
**Why:** mobile connections drop constantly.
**Enforced by:** e2e disconnect tests · scenarios.

### Replays
Every room keeps its seed and ordered action log, so any game can be replayed exactly through
the engine. Expose a debug export for a finished or broken room.
**Why:** production bugs get debugged from replays, not from the owner's description.
**Enforced by:** replay determinism test in the simulator.
