# Test rooms

A test room starts a live game from any scenario's `given`, so you can try a situation without
playing dozens of turns (plan decision D8, Q25).

## On your computer (the local server)

1. Start the local server: `npm run dev`.
2. Start a room from a scenario, by file and number, for example the income scenario:
   `npm run test-room -- combos-and-income 9`
3. The command prints one link per seat. Open each link in its own browser window (one normal and
   one private window, or two browsers); each window plays that seat.

A seat link works only for a test-room seat: the site checks it first and ignores any other link.
If the browser already has a different account, it asks before switching, because a guest account
that is switched away from cannot be got back (C5).

The local secret is in `.dev.vars` (never committed).

## On the live site

The live site needs its own secret once: `npx wrangler secret put TEST_ROOM_SECRET`, then type a
long random value (at least 16 characters). To start a room there:

`TEST_ROOM_SECRET=<that value> npm run test-room -- combos-and-income 9 https://marketlaw.mlawd.workers.dev`

Without the secret, the site answers "Not found", exactly as for any address that does not exist.

Scenarios whose `given` needs more than the engine knows yet (rooms, accounts, quests, clocks)
cannot start a test room until a later phase builds that part.
