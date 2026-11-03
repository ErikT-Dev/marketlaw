# Replay records

Every room keeps the record needed to replay its game exactly: the random seed, the setup and
every action with its time, including every hand (M4). Only the people who run the game can get
it (M4.1), with the same secret as test rooms (`docs/test-rooms.md`).

## Export a replay

From any room, at any time, also while its game is running (M4.2):

- Local server: `npm run replay-export -- K7QR2P`
- Live site: `TEST_ROOM_SECRET=<the secret> npm run replay-export -- K7QR2P https://marketlaw.mlawd.workers.dev`

The command saves `replay-K7QR2P.json` in the project folder (never committed). Without the
secret, or for a room whose record is gone, the site answers "Not found".

## How long records are kept

- While the room exists, the export comes from the room itself.
- When a game ends, its record is also saved separately from the room and kept for 30 days
  (M4.3), so it can still be exported after the room is deleted.
- After 30 days it can no longer be exported, and a daily job deletes it.

## Replaying

`seed`, `setup` and `startingState` (only for test rooms) give the start of the game; applying
each entry of `actionLog` through the engine at its time gives every later state exactly. The
harness checks this on every run (the replay export check).
