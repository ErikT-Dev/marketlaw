# Cloudflare (Free plan)

The project must run on the Cloudflare Free plan. Daily limits reset at 00:00 UTC; exceeding one
makes operations fail until the reset. Budgets in `harness/budgets.yaml` are the contract.

### Stay within the budgets
Design every feature against `harness/budgets.yaml` (rows written per game, requests per game,
bundle size). If a feature cannot fit, stop and explain the cost before building it.
**Why:** going over the free limits takes the game offline for the rest of the day.
**Enforced by:** budget check in `npm run harness`.

### WebSocket Hibernation API only
Use `ctx.acceptWebSocket()` and the `webSocketMessage` / `webSocketClose` handlers. Never the
non-hibernating `ws.accept()` with event listeners. No in-memory timers that keep an object awake.
**Why:** non-hibernating objects bill duration while players are just thinking.
**Enforced by:** ESLint `no-restricted-syntax` on `.accept()` and `setInterval` in `server/`.

### Room state survives eviction
Assume the Durable Object can be evicted between any two messages. Everything needed to continue
lives in storage; in-memory fields are only a cache rebuilt from storage, and per-socket data
goes in `serializeAttachment`.
**Why:** hibernation and deploys discard memory.
**Enforced by:** e2e test that forces a restart mid-game.

### One write per accepted action
Persist the room's state as one row (or one transaction) per accepted action. No writes for
reads, views, connects or animations.
**Why:** rows written is the binding free-tier limit (100,000/day).
**Enforced by:** budget check counts writes per simulated game.

### One alarm per room
A room holds at most one alarm, rescheduled only when the next deadline changes (turn change,
grace period, cleanup). Each `setAlarm`/`deleteAlarm` counts as a row written.
**Why:** per-action alarms halve capacity.
**Enforced by:** budget check.

### No client heartbeats
Do not send application-level pings from the client. Rely on the platform's WebSocket handling
and on resync after reconnect.
**Why:** every incoming message counts toward the daily request limit.
**Enforced by:** review · budget check.

### Clean up rooms
Finished and abandoned rooms delete their storage after the spec-defined retention, via the
room's alarm.
**Why:** total storage is capped at 5 GB on the free plan.
**Enforced by:** scenario for room cleanup.

### Free-plan features only
Use only features available on the Workers Free plan. Before using any Cloudflare product or
binding not already in `wrangler.jsonc`, stop and confirm it is free.
**Why:** one paid-only binding turns the whole project into a paid project.
**Enforced by:** protected `wrangler.jsonc` · judgment.

### Configuration and secrets
Configuration lives in `wrangler.jsonc`. Secrets go through `wrangler secret`, never into the
repo or into client code.
**Why:** anything in the client bundle is public.
**Enforced by:** `secretlint` · `.gitignore` for `.dev.vars`.
