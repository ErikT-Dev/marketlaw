# Architecture

## Layout

```
src/
├── rules/     pure game engine: state, actions, validation, transitions, views
├── shared/    intent and view types, schemas, the GameHost interface
├── bots/      bot players for the simulator and tests: PlayerView in, intent out
├── hosts/     RemoteGameHost: the browser's GameHost, over WebSocket to the room
├── client/    React UI
└── server/    Worker router + GameRoom Durable Object
```

### Dependency direction
`rules/` imports nothing from the project except `shared/`. `bots/` and `hosts/` import only
`shared/` (never `rules/`). `server/` may import `rules/`, `bots/` and `shared/`. `client/`
imports `shared/` and `hosts/` only. `client/` and `server/` never import each other. No
circular imports.
**Why:** the engine must run identically on the server, in the simulator and in tests; the
browser, bots and the UI must not be able to reach the full state.
**Enforced by:** dependency-cruiser.

### The rules engine is pure
Every transition is `apply(state, action, rng) => Result<State, Rejection>`. No I/O, no
`Date.now()`, no `Math.random()`, no globals, no mutation of the input. Time and randomness are
passed in.
**Why:** determinism makes games replayable, simulatable and testable, and lets the same engine
run on the server, in the simulator and in tests.
**Enforced by:** dependency-cruiser · ESLint `no-restricted-globals` / `no-restricted-properties`
in `src/rules/` · invariant simulator.

### The engine is player-count and player-type agnostic
The engine knows seats, not humans or bots. Nothing in `rules/` branches on whether a seat is a
human, a bot, local or remote. Any rule about player count comes from the spec.
**Why:** live games and simulator games played by bots must all be the same game. Bots never take
seats in live games.
**Enforced by:** review · bot-vs-bot simulator games.

### The UI talks to a `GameHost`, never to the engine
`GameHost` (in `shared/`) is the only interface the UI uses: send an intent, receive
`PlayerView` updates, request a resync, receive rejections and connection status.
`RemoteGameHost` implements it over a WebSocket to the room and must pass the host contract tests.
**Why:** the UI can be tested against a fake host, and the transport can change without
touching the UI.
**Enforced by:** dependency-cruiser (client cannot import `rules/`) · host contract tests.

### One source of truth for state
The authoritative `GameState` lives only in the room's Durable Object. The UI and bots hold
`PlayerView`s, never a `GameState`, and never derive rules outcomes themselves.
**Why:** two places computing rules will eventually disagree.
**Enforced by:** dependency-cruiser · review.

### One way out: `viewFor`
Every view sent over the network or to a bot is built by `viewFor(state, seatId)`. Nothing else
exposes game state outside the room.
**Why:** hidden-information leaks happen when a second path out appears.
**Enforced by:** `GameHost` types only carry `PlayerView` · leak test.

### Thin server
The Worker and the room do orchestration only: validate the intent, call the engine, save,
publish views. No game rules in `hosts/` or `server/`.
**Why:** rules outside the engine cannot be tested by the scenario runner or simulator.
**Enforced by:** review · coverage on `rules/`.

### Validate at the boundary
Every intent is parsed with a schema (`zod` or `valibot`) in `shared/` before it reaches any
logic on the server.
**Why:** malformed or malicious input must fail in one predictable place.
**Enforced by:** typed host signatures accepting only parsed types · scenario tests for bad input.

### One save format
A saved game is `{ schemaVersion, seed, setup, actionLog, state }`, stored in the room's Durable
Object. Loading an older `schemaVersion` goes through an explicit migration function.
**Why:** saves, replays and debug exports share one format, and rooms saved by an older deploy
must load in new code.
**Enforced by:** tests that load fixtures of every previous save version.

### Versioned protocol
Intents and views carry a protocol version.
**Why:** after a deploy, browser tabs still running the old client keep talking to the new
server; the version lets it recognise them instead of misreading their messages.
**Enforced by:** schema tests.

### File structure
One exported type, class, component or main function per file, named after the file. Small
private helpers used only by that file may live in it. Never nest one type definition inside
another; each type gets its own file.
**Why:** finding things by filename is how agents (and people) navigate; large mixed files grow.
**Enforced by:** ESLint `max-lines` · review.
