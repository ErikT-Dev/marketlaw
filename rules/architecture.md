# Architecture

## Layout

```
src/
├── rules/     pure game engine: state, actions, validation, transitions, views
├── shared/    intent and view types, schemas, the GameHost interface
├── bots/      bot players: PlayerView in, intent out
├── hosts/     LocalGameHost (phase 1); RemoteGameHost (phase 2)
├── client/    React UI
└── server/    phase 2 only: Worker router + GameRoom Durable Object
```

### Dependency direction
`rules/` imports nothing from the project except `shared/`. `bots/` imports only `shared/`
(never `rules/`). `hosts/` and `server/` may import `rules/`, `bots/` and `shared/`. `client/`
imports `shared/` and `hosts/` only. `client/` and `server/` never import each other. No
circular imports.
**Why:** the engine must run identically in the browser, the server, the simulator and tests;
bots and the UI must not be able to reach the full state.
**Enforced by:** dependency-cruiser.

### The rules engine is pure
Every transition is `apply(state, action, rng) => Result<State, Rejection>`. No I/O, no
`Date.now()`, no `Math.random()`, no globals, no mutation of the input. Time and randomness are
passed in.
**Why:** determinism makes games replayable, simulatable and testable, and lets the same engine
run locally and on the server.
**Enforced by:** dependency-cruiser · ESLint `no-restricted-globals` / `no-restricted-properties`
in `src/rules/` · invariant simulator.

### The engine is player-count and player-type agnostic
The engine knows seats, not humans or bots. Nothing in `rules/` branches on whether a seat is a
human, a bot, local or remote. Any rule about player count comes from the spec.
**Why:** single-player, multiplayer and bot-filled seats must all be the same game.
**Enforced by:** review · bot-vs-bot simulator games.

### The UI talks to a `GameHost`, never to the engine
`GameHost` (in `shared/`) is the only interface the UI uses: send an intent, receive
`PlayerView` updates, request a resync, receive rejections and connection status. Phase 1
implements it as `LocalGameHost` (engine and bots in the browser); phase 2 adds `RemoteGameHost`
(WebSocket to the server). Both must pass the same host contract tests.
**Why:** switching to multiplayer must not require changing the UI.
**Enforced by:** dependency-cruiser (client cannot import `rules/`) · host contract tests.

### One source of truth for state
The authoritative `GameState` lives only inside the host: `LocalGameHost` in phase 1, the room's
Durable Object in phase 2. The UI and bots hold `PlayerView`s, never a `GameState`, and never
derive rules outcomes themselves.
**Why:** two places computing rules will eventually disagree.
**Enforced by:** dependency-cruiser · review.

### One way out: `viewFor`
Every view sent to the UI, a bot or (in phase 2) the network is built by
`viewFor(state, seatId)`. Nothing else exposes game state outside the host.
**Why:** hidden-information leaks happen when a second path out appears.
**Enforced by:** `GameHost` types only carry `PlayerView` · leak test.

### Thin hosts
Hosts do orchestration only: validate the intent, call the engine, save, publish views, ask bots
for their moves. No game rules in `hosts/` or `server/`.
**Why:** rules outside the engine cannot be tested by the scenario runner or simulator.
**Enforced by:** review · coverage on `rules/`.

### Validate at the boundary
Every intent is parsed with a schema (`zod` or `valibot`) in `shared/` before it reaches any
logic, in `LocalGameHost` as well as on the server.
**Why:** malformed or malicious input must fail in one predictable place, and phase 2 must not
introduce a new validation path.
**Enforced by:** typed host signatures accepting only parsed types · scenario tests for bad input.

### One save format
A saved game is `{ schemaVersion, seed, setup, actionLog, state }`. Phase 1 stores it in browser
storage; phase 2 stores the same structure in the Durable Object. Loading an older
`schemaVersion` goes through an explicit migration function.
**Why:** saves, replays and debug exports must work identically in both phases, and old saves
must load in new code.
**Enforced by:** tests that load fixtures of every previous save version.

### Versioned protocol
Intents and views carry a protocol version from phase 1, even though they do not cross a network
yet.
**Why:** phase 2 then only adds a transport, not a protocol.
**Enforced by:** schema tests.

### File structure
One exported type, class, component or main function per file, named after the file. Small
private helpers used only by that file may live in it. Never nest one type definition inside
another; each type gets its own file.
**Why:** finding things by filename is how agents (and people) navigate; large mixed files grow.
**Enforced by:** ESLint `max-lines` · review.
