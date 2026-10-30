# Sleep model: how long a room stays awake (B12)

Budget B12 limits how long a room is in memory per game: 600 seconds on average over 3-player
games. The simulator cannot measure Cloudflare's billing, so it estimates awake time with this
model.

## What the room does

- The room uses the WebSocket Hibernation API (`ctx.acceptWebSocket`, `webSocketMessage`,
  `webSocketClose`). Open connections do not keep it in memory.
- The room keeps no timers in memory. Its one alarm (`setAlarm`) is set to the earliest deadline
  and wakes it only when a deadline is reached.
- So the room is woken by two kinds of events: a message from a player and its alarm. Between
  events it can hibernate, however long players think.

## The live measurement behind it

On 2026-10-28 (phase 04, decision D20) a 2-player room on the live site was created, joined and
dealt; both players played turn 1; one refreshed; then both idled for several minutes. Cloudflare
billed the room 0.7 seconds of active time (0.093 GB-s) for the whole session, a few dozen
events. That is about 20 to 30 milliseconds per event, and nothing while players thought.

## The model

- Every event (each message the simulator sends, each alarm that fires) keeps the room awake for
  50 milliseconds: about twice the measured cost per event.
- Time between events costs nothing.
- The simulator plays games until turn 10. The awake time per turn of its 3-player games is
  multiplied by 40, the turn limit, to estimate a whole game.

The harness report shows the estimate under "Simulation" and judges it against B12. In phase 14
it was about 60 seconds for a 40-turn 3-player game.

## When to measure again

The model rests on one live session. Measure again on the live site (Cloudflare dashboard, Workers
& Pages, `marketlaw`, Durable Objects) when a later phase adds events that run much longer than a
game action (for example, writing a game record at the end of a game, phase 25), or if the daily
duration in the dashboard grows faster than the number of games played.
