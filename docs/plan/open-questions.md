# Open questions and their solutions

The questions Claude would have stopped to ask the owner before decision D19: unclear or
contradictory spec, cases the spec does not cover, the open decisions in `decisions.md`, harness
and spec changes, and new dependencies. Claude now solves each one itself, implements the
solution and records it here (`README.md`, "Deciding without the owner"). Everyday choices, tool
quirks and platform problems do not belong here; they go into commit messages, the phase file's
Progress notes, or `proposed-rules.md`. The owner reviews this log when version 1 is done.

Newest last. Each entry: the question, where it came from, the options, the solution and why, and
where it was implemented. An entry that is still being worked on says **Status: in progress**;
one that needs the owner says **Status: waiting for the owner** and is also listed in the phase
file.

---

## Q1. Where does the design's font come from?

- **Phase:** 01, item 3.
- **Question:** the design uses Source Sans Pro, but the project had no copy of it, and the phase
  file did not say how to get it.
- **Options:** commit the font files; the `@fontsource/source-sans-3` npm package; a Google Fonts
  link; no font file, only a system fallback.
- **Solution:** commit the files. Answered by the owner, 2026-10-27, before D19.
- **Why:** no dependency, no outside request from players' browsers, works offline in tests.
- **Implemented:** `src/client/assets/fonts/` (Source Sans 3, one 29 KB variable file for both
  weights, with its OFL licence), `src/client/tokens.css`.

## Q2. Which audit warnings can be cleared beyond the four named upgrades?

- **Phase:** 01, item 1.
- **Question:** after the named upgrades, 12 `npm audit` warnings remained. The phase's goal is to
  clear them, but it names only Wrangler, Vite, TypeScript and React.
- **Options:** upgrade other development tools too; leave them and list them.
- **Solution:** upgraded `ajv` to 8.20.0 and `yaml` to 2.9.1 (both at least 14 days old); listed
  the 10 that remain, whose fixes are newer than 14 days or do not exist yet.
- **Implemented:** `package.json`, `docs/tooling-setup-proposal.md` ("As installed").


## Q3. What shape does `harness/required.yaml` take?

- **Phase:** 02, item 4.
- **Question:** the phase file asks for three lists (scenarios by file and name, invariants,
  budgets) but not their exact form, and `HARNESS.md` needed a section explaining the file.
- **Options:** scenarios as a flat list of `{file, name}`; as a map from file to names; by file
  and number.
- **Solution:** a map from scenario file (named without `.yaml`) to exact scenario names, plus
  lists of invariant and budget ids. Names, not numbers, so inserting a scenario cannot shift
  which ones are required; the runner fails on any name that does not exist. New section "What
  must pass now: `required.yaml`" in `HARNESS.md`, and a row in its file table.
- **Why:** readable for the owner, and a renamed scenario cannot drop out silently.
- **Implemented:** `harness/required.yaml`, `harness/HARNESS.md`, `tools/harness-runner/`
  (phase 02).

## Q4. Does a scenario fail when it lists random results the rules never ask for?

- **Phase:** 02, item 3.
- **Question:** `HARNESS.md` says a scenario must list every random result the rules ask for, in
  order, or it fails. It does not say what happens to listed results the rules never ask for.
- **Options:** ignore them; fail the scenario.
- **Solution:** fail the scenario, naming how many were never asked for. A listed result of
  another kind than the one asked for also fails it.
- **Why:** a listed result that is never used means the scenario expects the rules to ask for
  something they do not; ignoring it would hide that disagreement.
- **Implemented:** `harness/HARNESS.md` ("Random results"), `tools/harness-runner/ScriptedRandom.ts`
  (phase 02). The spec sentence was added after the code, found by the phase review.

## Q5. How exactly are `then` fields compared?

- **Phase:** 02, item 3, found by the phase review.
- **Question:** `HARNESS.md` says every `then` field must match exactly and fields not mentioned
  are not checked, but not whether that holds inside nested objects, or how lists compare.
- **Options:** "not mentioned" only at the top level; at every depth. Lists exact and in order;
  lists as sets; lists as "contains".
- **Solution:** "not mentioned" at every depth for objects; lists compared whole, in order and with
  their length. `seats` lists only the seats a scenario checks, so the driver returns those seats.
- **Why:** scenarios write `seats: [{seat: 1, stats: {funds: 10}}]` to check one stat; lists such as
  `deck` and `done_order` are orders, so their order is part of what is checked.
- **Implemented:** `harness/HARNESS.md` (`then`), `tools/harness-runner/findMismatches.ts` (phase 02).

## Q6. Must scenario names be unique within a file?

- **Phase:** 02, found by the phase review.
- **Question:** `required.yaml` names scenarios by file and name, but nothing stopped two scenarios
  in one file from sharing a name, which would make both required at once.
- **Options:** match by number instead; check that names are unique.
- **Solution:** `npm run harness:check` fails when two scenarios in one file have the same name;
  listed under "Checking the harness itself" in `HARNESS.md`. No scenario breaks it today.
- **Implemented:** `harness/HARNESS.md`, `tools/harness-check/checkUniqueNames.ts` (phase 02).

## Q7. Branded ids against read-only parameters in `src/rules/`

- **Phase:** 03, start.
- **Question:** `rules/typescript.md` asks for branded ids, and ESLint's
  `prefer-readonly-parameter-types` in `src/rules/` must pass. That rule reports every parameter
  holding a branded string (`string & {brand}`), a `Map` or a `Set`, because it counts their
  methods as writable. Engine state full of card names could not be passed to any function.
- **Options:** ask the owner to set `treatMethodsAsReadonly` in the protected ESLint config;
  wrap ids in objects; use literal unions for names that come from fixed lists.
- **Solution:** literal unions. `CardName` is the union of the 240 names (`CARD_NAMES`, checked
  against `cards.json`), `TypeName` the 33 types of R21.7, `QuestName` the 45 quests of R20.7.
  They are stricter than brands (only real names compile) and pass the rule. The engine uses
  arrays and records instead of `Map` and `Set`. The phase 02 `CardId` was dropped: card names are
  unique, and nothing used the id. Random ids (players, rooms, tokens) are not in `src/rules/` and
  stay branded.
- **Why:** it keeps both rules without a config change, and makes ids stricter.
- **Implemented:** `src/shared/catalogue/` (phase 03, first commit). A clarification of the
  branded-ids rule is proposed in `proposed-rules.md`.

## Q8. Which rule-specific code wins when several apply to playing a card?

- **Phase:** 03, start.
- **Question:** `HARNESS.md` ranks reason codes in groups. `tier_not_allowed`, `no_build_pass` and
  `build_skipped` are all in group 9 ("every other rule-specific code"), so a card that breaks
  more than one of them has no defined code.
- **Options:** any fixed order.
- **Solution:** the order of R6.1's list: `tier_not_allowed`, then `no_build_pass`, then
  `build_skipped`. `not_enough_funds` stays last (group 10).
- **Why:** it follows the spec's own order. No scenario combines them.
- **Implemented:** `HARNESS.md` reason-code order, point 9; `src/rules/` (phase 03).

## Q9. Do players who left count when the main phase waits for everyone to be done?

- **Phase:** 03, start.
- **Question:** R8.2 says the main phase ends once every player is done. R4.5 and R10.1 skip
  players who left, but R8.2 does not say whether a player who left must be done.
- **Options:** wait only for players still in the game; treat leaving as being done.
- **Solution:** the main phase ends once every player still in the game is done. Players who
  left are never waited for.
- **Why:** a player who left can take no action (I18), so waiting for them would stall the game.
  `turns-and-time` #30 gives the leaver `done: true` either way.
- **Implemented:** `game-rules.md` R8.2; `src/rules/` (phase 03).

## Q10. Is Cloudflare Access free for the site lock (D6)?

- **Phase:** 04, item 8.
- **Question:** D6 locks the live site to the owner and invited testers with Cloudflare Access,
  after confirming it is free (`rules/cloudflare.md`, Free-plan features only).
- **Answer:** yes. Cloudflare's Zero Trust pricing lists the Free plan at $0, with no time limit,
  for teams under 50 users (https://www.cloudflare.com/plans/sase-zero-trust.md). Since October
  2025, a Worker's workers.dev address can be put behind Access in one click: the Worker's
  Settings, Domains & Routes, "Enable Cloudflare Access" for workers.dev
  (https://developers.cloudflare.com/workers/configuration/cloudflare-access/).
- **Solution:** use it; the owner turns it on in the dashboard and adds the testers' email
  addresses (only the owner can change dashboard settings).
- **Implemented:** phase 04, "Waiting for the owner".

## Q11. What does a repeated action id return when the first try was rejected?

- **Phase:** 04, item 1 (M9.3).
- **Question:** M9.3 says an action whose id was already used gets the original result again.
  Remembering a rejection would cost a row written per rejected message, which B2 forbids (0 rows
  for rejected actions).
- **Options:** store every result (breaks B2); store only accepted results and evaluate a repeated
  rejected action again.
- **Solution:** the room remembers the last 100 accepted action ids per player. A repeat of one of
  them returns the current view and changes nothing. A repeat of a rejected action is evaluated
  again. Because a rejection changes nothing, and the repeat carries the same state version, it
  gets the same result unless the game moved on, in which case it is rejected as `stale_state`.
- **Why:** it keeps M9.3's promise (no action is ever applied twice) within B2.
- **Implemented:** `src/server/room/handleMessage.ts`, `acceptAction.ts` (phase 04).

## Q12. Budgets B1 and B2 on the required list

- **Phase:** 04.
- **Question:** the phase measures B1 and B2 from now on, but its list of required names has only
  scenarios.
- **Solution:** the room driver counts the rows each message would write; B1 (at most 1 per
  accepted action) and B2 (none for anything else) are added to `required.yaml`, so the check
  fails if either is broken. B10 is checked by a browser test (an idle client sends nothing in
  5 minutes, on a fake clock). B11 is shown in the report as the room driver's time per message
  (Node time, so it is shown, not required), and is measured as CPU time on the live site after
  the merge. Corrected after the phase review, which found that B10 and B11 were not measured yet.
- **Implemented:** `harness/required.yaml`, `tools/harness-runner/` (phase 04).

## Q13. New development dependency: `playwright-core` 1.64.0

- **Phase:** 04, item 9.
- **Question:** `@axe-core/playwright` declares `playwright-core` as a peer dependency, and npm
  installed the newest one (1.64.1) next to the 1.64.0 inside `@playwright/test`. The two copies
  have different `Page` types, so the browser test does not compile.
- **Options:** pin `playwright-core` to the version `@playwright/test` uses; drop the accessibility
  check.
- **Solution:** `playwright-core` 1.64.0 as an exact development dependency (published
  2026-10-07, 20 days before it was added), so npm keeps one copy. It is part of `@playwright/test`
  already, so it adds no size anywhere and nothing to the client bundle.
- **Implemented:** `package.json` (phase 04).

## Q14. Workers Logs, and keeping session tokens out of them

- **Phase:** 04, item 10.
- **Question:** are Workers Logs on the Free plan enough for error logs, and can they record
  session tokens, which must never be logged (`rules/multiplayer.md`, Identity)?
- **Answer:** the Free plan keeps 200,000 log events a day for 3 days; past that, Cloudflare logs a
  sample instead of failing (https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
  That is enough for errors. Each logged request records its metadata, which can include headers,
  and the room routes sent the token in an `Authorization` header.
- **Solution:** turn on `observability` in `wrangler.jsonc`, and send the token only in request
  bodies (`CreateRoomRequest`, `JoinRoomRequest`) and WebSocket messages, which are not logged.
  The code itself never logs.
- **Implemented:** `wrangler.jsonc`, `src/server/worker.ts`, `src/shared/api/`, `src/client/api/`
  (phase 04).

## Q15. How the room reads and writes its storage

- **Phase:** 04, phase review findings 1, 4 and 6.
- **Question:** the review found that a move confirmed to one player could be lost. The room read
  its state, then waited for D1 (looking up a session token), during which another message could
  be handled and saved; it then saved its old copy. It also found that the room logic did not run
  against a storage interface, and that only the room's schema version was checked on load.
- **Solution:** the room logic (`loadRoom`, `createRoomIn`, `joinRoomIn`, `receiveMessage` in
  `src/server/room/`) runs against a synchronous `RoomStorage`. `GameRoom` provides it with the
  Durable Object's synchronous key-value API, and the room driver with an in-memory store that
  counts its writes. The sender's identity is looked up first; loading, handling and saving then
  run with no wait in between. A room is kept only when both its own and its saved game's schema
  version are current; otherwise it is removed, and its sockets are closed with code 4404. The
  stored record is the room's own writing, so it is read as a `RoomRecord` after the version check,
  without a full schema.
- **Why:** no other message can run between reading and saving, so no confirmed move is lost.
- **Implemented:** `src/server/room/`, `src/server/GameRoom.ts`, `tools/harness-runner/room/`
  (phase 04).

## Q16. Room messages from players who are not in the room, and room actions before the game

- **Phase:** 04, phase review findings 9 and 10.
- **Question:** what does someone with a valid account but no place in the room get, and what does
  a player in a waiting room get for a game action? In scenario `hostile-client` #6, the raw
  message also names a `seat` and a `room_code`, which the real protocol does not have.
- **Solution:** any message from someone not in the room, including a resync, is rejected with
  `not_in_game`, so they see no names. A game action from a player in a room whose game has not
  started is rejected with `wrong_phase`. The room driver leaves out `seat` and `room_code` when it
  builds the message, because the protocol never trusts a seat named by the client: the seat comes
  from the token.
- **Implemented:** `src/server/room/handleMessage.ts`, `tools/harness-runner/room/rawMessageText.ts`
  (phase 04).

## Q17. What a browser does when its room or its session no longer exists

- **Phase:** 04, phase review finding 2.
- **Question:** stored data may be wiped between phases (D1). A browser that remembered a room that
  no longer existed reconnected about once a second forever (up to 86,400 requests a day), and
  stayed on "Connecting".
- **Solution:** the room closes such a socket with code 4404. The browser then stops reconnecting,
  forgets the room and shows "That room no longer exists" on the room choice page. If its session
  token is no longer valid (`invalid_token`), it forgets the session and shows the start page.
  The reconnect delay grows until the first update arrives, not merely until the socket opens.
- **Implemented:** `src/hosts/RemoteGameHost.ts`, `src/client/store/ClientStore.ts`,
  `src/server/GameRoom.ts` (phase 04).

## Q18. Where do players who left go in the top bar's player order?

- **Phase:** 05, item 4.
- **Question:** S2.2 says each badge in the player order shows whether the player has left, but
  R4.5 skips players who left, so they have no place in the order.
- **Options:** leave them out of the top bar; keep them at their seat's place in the rotation;
  show them after the order.
- **Solution:** the engine's player order (in every `PlayerView`) holds only players still in the
  game, as R4.5 says; the top bar shows players who left after it, by seat number, marked "left".
  Written into S2.2.
- **Why:** the order stays the one the market phase uses (phase 12), and everyone still sees who
  left, as S2.2 asks.
- **Implemented:** `harness/spec/screens.md` S2.2, `src/rules/playerOrderOf.ts`, the game top bar
  (phase 05).

## Q19. Which screen sizes does version 1 support? (O2)

- **Phase:** 05, item 5.
- **Question:** `rules/frontend.md` asks for 1280×720 to 2560×1440, while S1.1 and the design cover
  only 1920×940. O2 left the choice to the owner after the size test.
- **Options:** keep 1280×720 to 2560×1440 and recheck when quests exist; keep it with no recheck;
  support only 1920×1080 and up; decide after phase 13.
- **Solution:** answered by the owner, 2026-10-28: keep 1280×720 to 2560×1440 and recheck in
  phase 13 with 5 quests and 4 players.
- **Why:** the size test passed at all three sizes; the densest content does not exist yet.
- **Implemented:** `harness/spec/screens.md` S1.1, `decisions.md` D21, phase 13's Open points.

## Q20. Your own badge, statuses after the main phase, and stat names as tooltips

- **Phase:** 05, phase review findings 3, 7 and 10.
- **Question:** the design shows your own top-bar badge as "You", but S2.2 asks for usernames. S2.2
  limits statuses to the main phase, but the code showed "left" in every phase. S6.2 asks for
  each stat's "icon and name", and the design shows names only on hover.
- **Options:** for the badge, "You" or the username; for the names, visible text, a hover tooltip,
  or a tooltip that keyboard focus also opens.
- **Solution:** your badge shows your username, as S2.2 says (the size test now measures the
  longest name). Statuses show only in the main phase. Stat names are hover tooltips placed under
  the icon and the icon's accessible name, as in the design;
  written into S2.2 and S6.2. A focusable chip was left out: the icons are not controls, and
  `jsx-a11y` keeps non-interactive elements out of the tab order.
- **Why:** the spec wins over the design; a tooltip keeps the design's dense stats row.
- **Implemented:** `harness/spec/screens.md` S2.2 and S6.2, `orderBadgesOf.ts`,
  `Chip.module.css` (phase 05).

## Q21. Rejection messages for codes S16.3 does not list

- **Phase:** 06, item 5.
- **Question:** S16.3 gives a message for each reason code a game move can get, but has none for
  `not_this_step` (tutorial, C4.4), nor for the room codes (`room_not_found`, `room_full`,
  `room_not_waiting`, `invalid_room_size`), which share the reason-code list.
- **Options:** no message; the shared "Something went wrong" message; a message of their own.
- **Solution:** `not_this_step` shows "Not this step", as S15.3 already says (phase 29 adds what
  the tutorial is waiting for); the room codes share "Something went wrong. The page reloads your
  game.", as only a broken client could get them for a game move, and the game then resyncs.
  Written into S16.3. (Corrected after the phase review, which found that S15.3 already defines
  the tutorial text.)
- **Why:** every rejected move then shows a message, as S16.3 asks.
- **Implemented:** `harness/spec/screens.md` S16.3, `src/client/screens/game/rejectionMessage.ts`
  (phase 06).

## Q22. `invalid_token`, and a funds rejection without the card's cost

- **Phase:** 06, phase review finding 4 and suggestion 10.
- **Question:** S16.3 grouped `invalid_token` with "Something went wrong. The page reloads your
  game.", but since phase 04 (Q17) the browser forgets the session and opens the start page with
  "Your guest session has ended. Enter your name again.", because a reload cannot help with a
  token the server no longer knows. Also, "You need N funds; you have M." needs the card's real
  cost, which is missing if the card has left the hand by the time the rejection arrives.
- **Options:** follow the old row, or write the existing behaviour into S16.3; for the funds text,
  leave out N, or keep the cost from when the move was sent.
- **Solution:** `invalid_token` gets its own S16.3 row with the Q17 text. When the card's cost is
  unknown, the message reads "You do not have enough funds; you have M." The codes that promise a
  reload now resync the game.
- **Why:** a message must say what really happens; the funds case is rare and still gives the
  player the number they can act on.
- **Implemented:** `harness/spec/screens.md` S16.3, `src/client/store/ClientStore.ts`,
  `src/client/screens/game/rejectionMessage.ts` (phase 06).

## Q23. Which draws write draw log entries before the market phase exists

- **Phase:** 07, phase review finding 2.
- **Question:** M3.3 and S7.2 make every draw and discard shuffle public. Starting hands (R17.9)
  and marketplace refills (R18) also draw, but R17.5 does not list starting hands as draws, and a
  refill shuffle is caused by no player, while a draw log entry names one.
- **Options:** log starting hands and refills now; log them when the market phase is built.
- **Solution:** for now only income draws and the shuffles they cause are logged. Starting hands
  stay out of the log: the deal is public by rule (R17.9) and the discard pile is empty then.
  Phase 12, which builds refills and turn draws, decides how a refill shuffle with no player is
  shown, and may make the seat of a shuffle optional.
- **Why:** no place empties and nothing is refilled before phase 12, so no refill shuffle can
  happen yet.
- **Implemented:** `src/rules/takeIncome.ts`, `src/shared/DrawLogEntry.ts`; closed by Q38 (phase 12),
  which logs a refill shuffle with no seat.

## Q24. The phase 08 invariants on the required list

- **Phase:** 08, item 2.
- **Question:** the phase file lists the invariants the simulator checks, and its exit criterion is
  that they hold over 10,000 games, but it adds nothing to `harness/required.yaml`, so a broken
  invariant would show in the report without failing the harness.
- **Options:** leave the list as it is; add the 12 invariants.
- **Solution:** add I1, I2, I5, I6, I7, I8, I9, I10, I17, I18, I26 and I27 to the required list.
  The harness then fails when any simulated game breaks one, or when fewer than 10,000 games
  ran, and names the shortest failing game.
- **Why:** the exit criterion only means something if the check can fail.
- **Implemented:** `harness/required.yaml`, `tools/harness-runner/simulationProblems.ts`
  (phase 08).

## Q25. The test-room tool is a command, not a page

- **Phase:** 08, item 5 (D8).
- **Question:** D8 and the phase file ask for an owner-only page that starts a live room from any
  scenario's `given`. A scenario's `given` is turned into a game by the harness's engine driver,
  which the Worker must not import, and the browser must never build game states.
- **Options:** a page that holds the scenario files and a second copy of the converter in the
  Worker; a command on the owner's computer that converts the `given` and sends the finished state
  to a secret-protected endpoint.
- **Solution:** a command, `npm run test-room -- <scenario file> <number> [site]`. It turns the
  `given` into a state with the harness's own converter and sends it to `POST /api/test-rooms`,
  which answers only with the secret (`TEST_ROOM_SECRET`, set with `wrangler secret`; locally in
  `.dev.vars`) and otherwise says "Not found". The Worker checks the state against a schema,
  creates one guest per seat and prints a sign-in link per seat (`/#session=…`).
- **Why:** one converter, the one the scenarios already prove; nothing about test rooms is
  visible on the public site; the browser tests use the same endpoint.
- **Implemented:** `src/server/testRooms/`, `tools/test-room/`, `docs/test-rooms.md`,
  `e2e/testRooms.spec.ts` (phase 08).

## Q26. Seat links must not replace a visitor's account, and test rooms must replay

- **Phase:** 08, phase review findings 1 and 6.
- **Question:** the first seat links (`/#session=…`) wrote any token over the stored session, so
  anyone could send a link that silently replaced a visitor's guest account (lost for good, A1.14)
  with one whose token the sender knows. Also, a test room's game could not be replayed from its
  seed and setup, which `rules/multiplayer.md` "Replays" asks of every room.
- **Options:** a one-time code exchanged for a token; links only for guests the server marks as
  test-room seats, with a question before replacing an account; for replays, a test-room marker,
  or the starting state kept in the save.
- **Solution:** guests made for a test room are marked in `players`; the browser asks the server
  whether a linked token is a test-room seat and ignores it otherwise, and asks before replacing a
  different account (written as C5). Only the holder of the test-room secret can make such a seat,
  so nobody else can make a working link. Saves keep `startingState` (null for normal games);
  replays start from it. The save version went to 3.
- **Why:** links stay as easy for the owner, and a stranger's link does nothing.
- **Implemented:** `harness/spec/client.md` C5 (checked by tests listed in
  `harness/coverage-exceptions.yaml`), `migrations/0004_test_room_seats.sql`,
  `src/server/testRooms/`, `src/client/store/`, `src/rules/replayStartOf.ts` (phase 08).

## Q27. `visibility` #11 needs features of later phases

- **Phase:** 09, start.
- **Question:** phase 09 lists `visibility` #11 ("everything about another player except the
  hand is public") as required, but the scenario also checks type counts in the view (phase 10),
  influence uses (phase 11), completed projects (phase 10), completed quests (phase 13) and
  whether a player is away (phase 18). It cannot pass before all of them exist.
- **Options:** build stand-ins now; leave it out of the required list until the last of them.
- **Solution:** phase 09 shows everything public that exists so far, and the scenario becomes
  required in phase 18, which adds "away", the last missing part. Phases 10 to 13 add their parts
  to the view as they are built.
- **Why:** a required scenario must pass; stand-ins would be behaviour nobody asked for.
- **Implemented:** the Required scenarios of phases 09 and 18.

## Q28. Your own draw of a card that another player shuffled out of the discard

- **Phase:** 09, phase review finding 2.
- **Question:** R5.5 shows you the deck and discard as at the start of the main phase, minus your
  own draws, plus your own shuffles. If another player shuffles discard cards into the deck and
  you then draw one of them, the literal rule shows a deck count one too low (it can go below 0)
  and the card both in your hand and in the discard.
- **Options:** take the card off the deck count, as the rule's words say; take it off the discard
  shown to you.
- **Solution:** take it off the discard shown to you; the deck count drops only for cards that
  are not shown in the discard. Each player's state remembers the cards they drew in the current
  main phase, so the view knows which ones. Written into R5.5.
- **Why:** you already hold the card, so nothing is revealed; the shown piles stay possible.
- **Implemented:** `harness/spec/game-rules.md` R5.5, `src/rules/pilesShownTo.ts`, the
  simulator's I24 check (phase 09).

## Q29. Which tier a fallback's discard shuffle shows

- **Phase:** 09, phase review finding 7.
- **Question:** R17.6 says other players see only the tier asked for when a fallback (R17.4 step
  3) is used, but M3.3 makes discard shuffles public with their sector or kind and tier. A shuffle
  of tier 2 cards before a tier 1 draw is asked for shows tier 2.
- **Options:** show the shuffle with the tier asked for; show it with the tier shuffled.
- **Solution:** show the tier shuffled. The discard pile is public, so the cards leaving it are
  seen anyway when the main phase ends; the draw entry keeps the tier asked for. Written into
  R17.6.
- **Why:** a shuffle entry that named the wrong tier would contradict the public discard pile.
- **Implemented:** `harness/spec/game-rules.md` R17.6 (phase 09; the code already did this).

## Q30. `projects` #6 needs the market phase

- **Phase:** 10, item 2.
- **Question:** phase 10 lists `projects` #6 ("rejects a project outside the main phase") as
  required, but the scenario starts in the market phase, which phase 12 builds.
- **Options:** a stand-in market phase now; require the scenario in phase 12.
- **Solution:** it becomes required in phase 12. Until then the only phase besides the main phase
  is the end of the game, where a project is rejected with `game_over`.
- **Why:** as in Q27, a required scenario must pass, and stand-ins would be unasked behaviour.
- **Implemented:** the Required scenarios of phases 10 and 12.

## Q31. Scenarios could not check which projects are recorded as completed first

- **Phase:** 10, phase review.
- **Question:** R16.6 gives first-completion funds only in the first turn anyone completes a
  project. The engine records that turn's projects at the end of the turn, but no scenario could
  see the record: `projects` #8 sets it up in `given`, and `then` had no field for it. Dropping the
  record passed every check.
- **Options:** a `then.first_completions` field checked in `projects` #7; a new two-turn scenario;
  an invariant.
- **Solution:** add `first_completions` to `then` (`scenario-format.yaml`, `HARNESS.md`) and check
  `first_completions: [quality]` at the end of `projects` #7. A deliberate break (the record
  dropped) now fails #7.
- **Why:** the smallest change that makes the existing scenario prove the rule; together with #8
  it covers both turns.
- **Implemented:** `harness/scenario-format.yaml`, `harness/HARNESS.md`, `projects` #7 (phase 10).

## Q32. Is the Projects button disabled when no project can be completed?

- **Phase:** 10, phase review.
- **Question:** S6.6 says buttons for actions you cannot take are disabled, and S8.4 disables every
  action but End turn at 50 actions. The Projects button opens the S8.2 pop-up, which also shows
  each project's need, your progress and whether the first-completion bonus is still possible.
- **Options:** disable the button when no project can be completed; keep it enabled and disable
  each project's Complete button inside the pop-up.
- **Solution:** keep it enabled; the action is the Complete button, which is disabled whenever the
  room would reject it, and then says why (S16.3 messages). Written into S6.6.
- **Why:** most of the game no project can be completed, and S8.2's information would then be
  unreachable. Claim all stays disabled when nothing is ready, since its pop-up only confirms the
  claim (S8.1).
- **Implemented:** `harness/spec/screens.md` S6.6; `ProjectsDialog`, `ProgressButtons` (phase 10).
  Phase 11 gives Use influence the same reading: its trades and draw actions are the actions, and
  S8.3's tiles and table are shown whether or not any can be taken.

## Q33. Can an action be undone when it caused income but no card was left to draw?

- **Phase:** 11, item 4.
- **Question:** R7.2 allows undo only when the action and what it causes draw no card. Income
  (R13.1) draws a card, but when the deck and discard pile are empty nothing is drawn.
- **Options:** undoable when no card was actually drawn; never undoable once income was taken.
- **Solution:** never undoable once income was taken. Written into R7.2.
- **Why:** income is a draw by its rule whether or not a card is left, and undoing it would lower
  income, which I8 says never happens.
- **Implemented:** `harness/spec/game-rules.md` R7.2; the engine's undo (phase 11).

## Q34. Which code wins when an influence action breaks two of its rules?

- **Phase:** 11, item 1.
- **Question:** `trade_limit_reached`, `skip_build_after_play` and `no_card_of_kind` are all in
  group 9 of the reason code order, with no order among them.
- **Options:** the limit first; the situation (played a card, no card left) first.
- **Solution:** `trade_limit_reached` first, then `skip_build_after_play` or `no_card_of_kind`;
  `cannot_afford_trade` stays last (group 10). Written into `HARNESS.md`.
- **Why:** a used-up action is the most lasting reason, and the S8.3 tiles show "used" for it.
- **Implemented:** `harness/HARNESS.md` reason code order; the engine (phase 11).

## Q35. How many simulated games does the harness need?

- **Phase:** 11, finish.
- **Question:** `HARNESS.md` point 2 asked for at least 10,000 simulated games, and `npm run check`
  ran them all; that alone took about 295 s, so the check could not stay under 5 minutes.
- **Options:** keep 10,000 everywhere; a smaller set for the Stop hook only (D9); fewer games in
  the check and more at the end of a phase.
- **Solution:** the owner's decision D23: 500 games per `npm run check`, 5,000 per
  `npm run harness` at the end of every phase. Written into `HARNESS.md` point 2.
- **Why:** the other tests take about 20 s; the game count was the whole cost.
- **Implemented:** `harness/HARNESS.md` point 2, `rules/testing.md`; `SIMULATED_GAMES` and
  `runPhaseEndHarness` in `tools/harness-runner/` (phase 11).

## Q36. Do draw actions in scenarios name their tier twice?

- **Phase:** 11, phase review.
- **Question:** `HARNESS.md`'s action table said draw actions take `kind` and `tier`, but the trade
  names `draw_tier_1` to `draw_tier_3` already carry the tier, and every scenario gives only the
  trade and `kind`.
- **Options:** add `tier` to the scenarios; drop it from the table.
- **Solution:** drop it from the table; the trade name gives the tier. Written into `HARNESS.md`.
- **Why:** the scenarios already agree with each other and with the spec; only the table was off.
- **Implemented:** `harness/HARNESS.md` action table (phase 11).

## Q37. Can undo points push a saved room over B13 (100 KB)?

- **Phase:** 11, phase review; decided for phase 15, where B13 becomes required.
- **Question:** each undo point is a full copy of the seat (about 1 KB late in a game). A player can
  take up to 49 undoable actions in a turn, so four such seats could carry about 190 KB of undo
  points. In the simulated games the largest saved room is 27 KB and its undo points 5 KB.
- **Options:** keep full copies and accept the risk; store in each undo point only what the action
  changed (stats, hand, city, passes, uses, combos).
- **Solution:** keep full copies for now. Phase 15 measures B13 with a bot that takes the most
  undoable actions it can; if a room goes over, undo points store only what the action changed.
- **Why:** full copies make undo restore everything with no rule to get wrong, and ordinary play
  stays far below the limit.
- **Implemented:** nothing yet; phase 15 (B13).

## Q38. How is a discard shuffle during a marketplace refill shown (closes Q23)?

- **Phase:** 12, item 1 (Q23's open point).
- **Question:** a refill at the start of a turn can shuffle discard cards into the deck. M3.3 makes
  every shuffle public, but no player caused this one, and a draw log entry names a seat.
- **Options:** leave refill shuffles out of the log; log them with no seat.
- **Solution:** log them with no seat (`seat: null`), in the turn that is starting; the draw log
  shows them as the marketplace's. Refill draws themselves are not logged: the cards go face up into
  the marketplace, not into a hand (M3.3 covers cards going into a hand). Turn draws are logged with
  the option, the card taken (option A) or the sector (option B), and the tier asked for.
- **Why:** the shuffle changes the deck and discard pile every player sees, so hiding it would make
  the shown piles disagree with the log.
- **Implemented:** `src/shared/DrawLogEntry.ts`, `src/rules/endMainPhase.ts`,
  `src/rules/takeTurnDraw.ts` (phase 12).

## Q39. Which code wins for option A when the marketplace is empty?

- **Phase:** 12, item 2.
- **Question:** taking a card from an empty marketplace is both `card_not_in_marketplace` and
  `marketplace_empty`, both in group 8 of the reason code order, with no order between them.
- **Options:** `card_not_in_marketplace` first; `marketplace_empty` first.
- **Solution:** `marketplace_empty` first, as `marketplace` #3 expects. Written into `HARNESS.md`.
- **Why:** it tells the player what to do instead (choose a sector, R18.9).
- **Implemented:** `harness/HARNESS.md` reason code order; `src/rules/rejectionOf.ts` (phase 12).

## Q40. What fills a quest place when the list has quests, but none of an allowed tier?

- **Phase:** 13, item 3.
- **Question:** R19.8 uses "the nearest allowed tier that still has quests", and R19.9 covers an
  empty list. Before turn 5 (or 13) the list can still hold quests, but only of tiers not allowed
  yet, so neither rule says what happens.
- **Options:** place a quest of a tier not allowed yet; leave the place empty until the next turn.
- **Solution:** the place stays empty until the next turn, when it is refilled again. Written into
  R19.8.
- **Why:** the tier gates are the point of R19.8, and I16 says no tier 2 quest is placed before
  turn 5; an empty place for a turn is what R19.9 already does when nothing can be placed.
- **Implemented:** `harness/spec/game-rules.md` R19.8; `src/rules/questTierToPlace.ts`,
  `src/rules/refillQuests.ts` (phase 13).

## Q41. Five quests with four players at 1280×720 (D21, for the owner)

- **Phase:** 13, item 4; D21 asks this phase to raise the screen-size question again if the screen
  cannot fit there.
- **Question:** at 1280×720 the quests panel shows about 2 of 5 quest cards; the rest, other
  players' progress lines and a Complete button can be off-screen until the player scrolls inside
  the panel. At 1920×1080 and 2560×1440 all 5 quests with 4 players fit without scrolling. Nothing
  scrolls sideways, every target is at least 24 px, and axe finds nothing.
- **Options:** keep scrolling inside the quests panel at 1280×720; raise the smallest supported
  size; build a compact quest card for small screens (for example, other players' progress folded
  into one line).
- **Solution for now:** scrolling inside the panel at 1280×720. The browser test checks that every
  quest card and the Complete button can be scrolled into view at every size, and that all 5 fit
  without scrolling from 1920×1080 up. The owner decides whether that is good enough.
- **Why:** the screen is usable at every size; whether a scrolled quests panel is acceptable at the
  smallest size is the owner's call under D21.
- **Implemented:** `src/client/screens/game/QuestsPanel.module.css`, `e2e/quests.spec.ts` (phase 13).

## Q42. Times inside the rules engine

- **Phase:** 14, item 1.
- **Question:** `rules/typescript.md` asks for timestamps as branded `EpochMs`, but ESLint's
  `prefer-readonly-parameter-types` in `src/rules/` reports any parameter holding a branded value
  as writable (the problem of Q7), so a `GameState` holding an `EpochMs` could not be passed to any
  engine function.
- **Options:** ask the owner to change the protected ESLint config; wrap times in objects; keep
  times as plain millisecond numbers inside `src/rules/` and branded everywhere else.
- **Solution:** inside `src/rules/` times are plain UTC epoch milliseconds (`clockStartedAt`, the
  `at` of each logged action). Everything that leaves the engine is branded again: seat clocks in
  views (`SeatClock`), the server and the schemas use `EpochMs`.
- **Why:** as Q7, it keeps both rules without a config change; the engine only adds and compares
  times.
- **Implemented:** `src/rules/` (phase 14, item 1). A clarification of the time rule is proposed in
  `proposed-rules.md`.

## Q43. Two time-out scenarios expected "done" after the main phase had ended

- **Phase:** 14, item 1.
- **Question:** `turns-and-time` #10 waits until the main-phase limit with the default 2 players and
  expects seat 1 `done`; #8 has seat 1 already done and the other two seats time out together, and
  expects `done_order` [1, 3, 2]. In both, every player is then done, so the main phase ends (R8.2)
  and the next turn starts, where nobody is done yet and the done order starts again. Both
  contradict R8.2.
- **Options:** keep "done" and the done order through the market phase (a rules change); change the
  two scenarios so they check what R8.2 leaves to see.
- **Solution:** change the scenarios. #8 leaves seat 1 still deciding (its deadline is later), so
  seats 3 and 2 are made done at the same moment and stay done: `done_order` [3, 2] in player
  order (R8.4). #10 checks that the turn moved on to 11, with the bank charged up to the limit and
  one time-out in a row; it is given a full marketplace, as other scenarios that end a turn are,
  so the start of turn 11 draws nothing.
- **Why:** a scenario is changed when it contradicts the spec; both still test R8.4, R9.1 and R9.10.
- **Implemented:** `harness/scenarios/turns-and-time.yaml` #8 and #10 (phase 14).

## Q44. Which time-outs does a late message apply, and what does a message after a time-out get?

- **Phase:** 14, phase review findings 2 and 5.
- **Question:** R9.6 says a message received at or after the player's deadline is rejected as out of
  time and the time-out is applied then. Two cases are open. Other players can be past their
  deadline at the same moment (the alarm is late); and usually the alarm has already applied the
  time-out, so the player is done (main phase) or past their go (market) when the late message
  comes, which would give `already_done` or `out_of_market`.
- **Options:** apply every due time-out before any message; apply them only when the sender is
  among them; give a late message after its time-out the code its state gives, or `out_of_time`.
- **Solution:** a message from a player past their deadline applies every time-out due at that
  moment, in player order (R8.4), and is rejected `out_of_time`; any other message applies none,
  so its rejection changes nothing (I27). A message from a player whose time-out ended the decision
  they are still in is rejected `out_of_time` too. I27 names the other time-outs.
- **Why:** R9.6 ties the time-out to the player's own late message; due time-outs of others at the
  same moment keep the done order of R8.4; and `out_of_time` tells the player what happened.
- **Implemented:** `harness/invariants.yaml` I27; `src/rules/receiveAction.ts`,
  `src/rules/hasTimedOutThisDecision.ts` (phase 14).

## Q45. How much does a player's own discard shuffle add to the deck shown to them?

- **Phase:** 15, item 4 (found by the simulator on complete games).
- **Question:** R5.5 shows the deck "plus any discard shuffles you caused". The engine added the
  shuffle's real count, but other players' hidden shuffles may already have taken some of those
  discard cards, so the real count can be smaller than the discard pile shown to you. A player
  could then draw more cards than their shown deck held and see a negative deck count (I24).
- **Options:** add the real count; add the cards the shuffle takes from the discard pile shown to
  the player.
- **Solution:** a shuffle you caused moves the cards it takes from the discard pile shown to you
  into the deck shown to you, so the two shown piles always add up and the deck never shows below
  zero. Written into R5.5. The draw log still shows the real count.
- **Why:** it keeps each player's view consistent with itself without revealing other players'
  hidden shuffles.
- **Implemented:** `harness/spec/game-rules.md` R5.5; `src/rules/pilesShownTo.ts`,
  `tools/simulator/shownPilesViolations.ts` (phase 15).

## Q46. Which simulated games are played to the end?

- **Phase:** 15, item 4.
- **Question:** the phase asks for the simulator on complete games, 500 per `npm run check` and
  5,000 per `npm run harness` (D23). Played to turn 40, chaos-bot games send thousands of mostly
  rejected messages; 500 games took 17 minutes, so every check (the Stop hook) and the phase-end
  harness (about 3 hours) would become impractical.
- **Options:** fewer games (D23 is the owner's); play every game to the end; play legal-bot games
  to the end and chaos-bot games until turn 10, as before.
- **Solution:** legal-bot games are played to the end, chaos-bot games until turn 10. I21 is checked
  on games played to the end. The budgets of this phase (B4, B5, B9, B13, B16, B17) are measured on
  legal-bot games, as the phase file says. D23's game counts stay as they are.
- **Why:** the chaos bot's job is hostile input, which it does as well in 10 turns; complete games
  and the budgets are about real play.
- **Implemented:** `tools/simulator/simulateGame.ts`, `tools/simulator/simulateSlice.ts`
  (phase 15).

## Q47. Is B13 the saved size before or after compression?

- **Phase:** 15, item 4.
- **Question:** B13 limits the saved size of one room to 100 KB. Played to the end, a 4-player
  room holds the action log and the state, which as plain JSON comes close to or over 100 KB.
  The budget does not say whether it means the bytes as stored.
- **Options:** shorten what a room keeps (the action log is needed for replays, M-rules); raise
  the budget (not allowed to get a check green); store the room compressed and measure what is
  stored.
- **Solution:** the room is stored as deflate-compressed JSON (`CompressionStream`, built into
  Workers, no new dependency), and B13 is measured on the compressed bytes. The room is read once
  when a message, alarm or call arrives and written once at the end, inside
  `blockConcurrencyWhile`, so it is still one row per accepted action (B1).
- **Why:** the budget is about storage cost and save speed, which depend on the bytes stored.
  Measured over the legal-bot games: largest stored room 21 KB.
- **Implemented:** `src/server/CompressedRoomStore.ts`, `src/server/room/encodeRoomRecord.ts`,
  `src/server/room/decodeRoomRecord.ts`, `tools/simulator/simulateGame.ts` (phase 15).

## Q48. Does the game length need a rule change (O5)?

- **Phase:** 15, item 5 (the O5 review, decided by Claude under D19).
- **Question:** `game-rules.md` open question 1 asks whether the end goal, the time bank or the
  turn limit need changing, because a first simulation suggested the end goal takes more than
  the 25 turns the time bank assumes.
- **Data:** `npm run harness`, 5,000 games, of which 2,500 legal-bot games were played to the end:
  about 39 turns per game at every size, the end goal reached in 64%, 64% and 60% of games with 2,
  3 and 4 players, the rest ending at turn 40. Average funds: 7 at turn 1, about 12 at turn 20, 23 at
  turn 30 and 67 to 91 at turn 40, so funds pile up late in long games. Rows written per game: 484, 712 and 928 (limit 1,600).
- **Options:** shorten the game now (lower end goal, fewer turns, a larger time bank); change
  nothing until real games can be measured.
- **Solution:** change nothing now. The legal bot plays random legal moves and never aims for the
  end goal, so its games are an upper bound; that most of them still reach the end goal before
  turn 40 suggests that players who aim for it will finish well inside the limit. The budgets
  hold even at the bot's length. Funds piling up late is a sign of the bot not spending, and is
  rechecked with the same real games. The spec's open question stays open for a recheck with the
  testers' games after phase 20, with the time bank in view.
- **Implemented:** `decisions.md` D24; `harness/spec/game-rules.md` open question 1 (phase 15).

## Q49. In what order are players who left placed?

- **Phase:** 15, from the phase review.
- **Question:** A3.4 places players who left after everyone else, "the one who left first last".
  The game state does not record when a player left, so phase 15 ranks players who left by
  score, then the done order and player order (R21.9).
- **Options:** add a leave order to the state now, with nothing that can set it; record it when
  leaving is built.
- **Solution:** leave it to phase 19, which builds leaving (M6): it records the order players
  leave in, the places follow A3.4, and I22 checks it. Until then no game can have a player who
  left, so nothing reachable differs from the spec. I22 checks the R21.9 tie-breaks from phase 15.
- **Implemented:** known gap in the phase 15 file; open point in the phase 19 file;
  `src/rules/gameEndViolations.ts` (tie-breaks, phase 15).

## Q50. Scenarios for the R5.5 change (Q45) and the final-turn holding pile

- **Phase:** 15, from the phase review: both changes of commit c8c677d were covered only by the
  simulator invariants.
- **Solution:** two new scenarios: `visibility` #15 (a card I drew that another player's hidden
  shuffle left in the discard pile shown to me is taken off that pile, and the deck shown to me
  stays at its start count) and `end-of-game` #10 (cards sold in the final turn join the discard
  pile when the game ends). Both are added to `harness/required.yaml` with the phase. The review
  also asked for my own shuffle after another player's hidden shuffle; that case cannot happen in
  one main phase, because a hidden shuffle empties the real discard pile and sold cards wait in
  the holding pile until the phase ends (R17.7), so no scenario is written for it.
- **Implemented:** `harness/scenarios/visibility.yaml`, `harness/scenarios/end-of-game.yaml`,
  `harness/required.yaml` (phase 15).

## Q51. How many simulated games do the check and the phase end play?

- **Phase:** between 15 and 16, from the owner.
- **Question:** the 500 simulated games of D23 take most of `npm run check` (about 170 s of 4
  minutes locally, 10 to 12 minutes on GitHub).
- **Solution:** the owner's decision D25: 50 games per `npm run check`, 1,000 per
  `npm run harness`.
- **Implemented:** the counts in `tools/harness-runner/SIMULATED_GAMES.ts` only; `harness/HARNESS.md` point 2
  (HARNESS commit), `rules/testing.md`, `docs/plan/README.md`, `docs/enforcement.md` and the phase
  30 file now refer to that file instead of repeating the numbers.

## Q52. Lobby, presence and global counters: a lobby Durable Object or D1 (O6)?

- **Phase:** 16, item 1 (O6).
- **Question:** "one thing at a time" (M2), the public room list (M1.7), players online (A7) and
  the site-wide daily counters (A9.4, A9.6) need one place that knows about every room. Where?
- **Options:** (a) one lobby Durable Object, SQLite-backed, with hibernating WebSockets for the
  lobby screen; (b) D1 tables, read by every lobby screen; (c) both: D1 for the lists, a counter
  object for the limits.
- **Measured against the budgets (estimate for a busy day, B18 allows 5,000 rows):** a room tells
  the lobby about each change that the list shows (created, joined, left, size, started, ended):
  about 8 changes per game, 1 row each in either option, so 50 games cost about 400 rows. The
  difference is reading. With D1, every lobby screen must ask again to see changes: one poll per
  open screen every 10 s is 8,640 requests per screen per day, against 100,000 Worker requests a
  day and the rule against client heartbeats (`rules/cloudflare.md`). A lobby object pushes each
  change to the open screens over hibernating WebSockets: no polling, no rows read for presence
  (who is online is the set of open sockets, kept in socket attachments, no rows), and the object
  sleeps between changes. Counters: in either option a row per chat message would break B7, so
  the room reserves chat quota from the lobby in blocks of 20 messages (1 row per 20, about 100
  rows on a day at the 2,000 cap); game and tutorial starts cost 1 row each (at most 150 a day).
- **Solution:** (a), one lobby Durable Object, a new SQLite class `Lobby` in `wrangler.jsonc`,
  built in phase 17 where M1.7 and M2 are. D1 keeps players, usernames and, later, records and
  ratings. Phase 16 needs neither: room codes stay unique because each code names its own room
  object (`idFromName`), as since phase 04. No live experiment was run: the deciding factor,
  polling versus pushing, follows from the platform limits above, and SQLite Durable Objects are
  on the Free plan (checked in phase 04).
- **Implemented:** `decisions.md` O6 moved to Decided as D26; the class comes in phase 17.

## Q53. Turnstile on the Free plan, and its keys

- **Phase:** 16, item 4.
- **Question:** `rules/cloudflare.md` asks to confirm a new Cloudflare product is free.
- **Solution:** Turnstile is free on the Free plan, with up to 20 widgets and unlimited checks
  (https://developers.cloudflare.com/turnstile/plans/, checked 2026-11-03). The site key is
  public and goes in `wrangler.jsonc` as `TURNSTILE_SITE_KEY`; the secret key is set by the owner
  with `wrangler secret put TURNSTILE_SECRET_KEY`. Local runs and the browser tests use the
  published test keys (https://developers.cloudflare.com/turnstile/troubleshooting/testing/):
  site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` (always
  passes).
- **Implemented:** phase 16. The owner created the widget and set the secret on 2026-11-03; the
  site key is in `wrangler.jsonc` `vars`, and `.dev.vars` overrides it with the test keys locally.

## Q54. What may a player do in a room while it asks everyone to accept?

- **Phase:** 16, from reading M1.4, M1.9 to M1.12.
- **Question:** M1.4 lets the owner change the size and M1.9 lets anyone leave "while the room is
  waiting". Is a room asking for acceptance (M1.10) still waiting, and what happens to the asking?
- **Options:** forbid both until the asking ends; allow both, and end the asking when the room is
  no longer full.
- **Solution:** the asking is part of waiting, so both are allowed. Leaving ends the asking at
  once, since the room is no longer full; the player who left is not blocked from rejoining,
  because they did not decline. The owner can raise the size during the asking, which ends it the
  same way; lowering is impossible while the room is full (M1.4). A player removed after 10 s
  without a connection (M1.12) also ends the asking. Everyone else stays and keeps waiting, as in
  M1.11. Removal for any reason passes ownership on as M1.3 says for leaving.
- **Implemented:** `multiplayer.md` M1.11 (one added sentence); phase 16, item 2.

## Q55. How is "90 days without use" tracked without a write on every visit?

- **Phase:** 16, item 3 (A1.14).
- **Question:** recording the last use on every request would cost a D1 row each time (B18).
- **Solution:** the last use is recorded at most once a day per account (when the stored time is
  more than a day old), and a login ends when the recorded last use is more than 91 days ago. A
  login therefore never ends sooner than 90 days without use, and at most one day later. Guest
  accounts unused for 90 days are deleted by the scheduled job of phase 19 (O8).
- **Implemented:** phase 16, item 3.

## Q56. Generated names

- **Phase:** 16, item 3 (A1.2).
- **Question:** the spec gives one example, "Busy Harbour Mayor", and asks for unique, free names
  of at most 20 characters.
- **Solution:** three words, an adjective, a place and a title, from fixed lists chosen so that
  every combination is a valid username of at most 20 characters, in the style of the example.
  The server picks at random and tries again while the name is taken (A2.2 ignores capitals).
- **Implemented:** phase 16, item 3.

## Q57. What does tracking connections in a waiting room cost, and where are seats decided?

- **Phase:** 16, from the phase review.
- **Question:** M1.12 needs to know who has been disconnected from a waiting room for 10 seconds,
  even if the room's Durable Object is evicted in between. `rules/cloudflare.md` allows no writes
  for connects. Also, R4.3 seats are random, but the engine only sees the seats it is given.
- **Options:** write on every connect and close; write only on a close, and treat players with an
  open socket as connected when the deadline comes; keep it all in memory (lost on eviction).
- **Solution:** write only on a close: one row when a player's last socket to a waiting room
  closes. Connecting writes nothing. Creating or joining a room records the player as "not yet
  connected" in the same row as the join, so a player who never opens the socket is removed after
  10 s. When a deadline comes, and before any message or join is handled, players with an open
  socket count as connected. On a busy day (B18) this is about one row per page refresh or
  dropped connection in a waiting room, plus one alarm change each, well inside the budget.
  Overdue removals (20-second accept, 10-second disconnect) are applied before every message and
  join, so a late alarm never lets a late accept start a game. Seat order (R4.3) is drawn by the
  room with `crypto` when the game starts and stored in the room record, like the game's seed, so
  replays use the stored order.
- **Implemented:** `src/server/room/caughtUpRoom.ts`, `withLivePlayers.ts`, `GameRoom.ts`;
  phase 16 review fixes.

## Q58. Lobby details the spec leaves open

- **Phase:** 17, from building it and from the phase review.
- **Questions and solutions:**
  - When is a game over for "one thing at a time" (M2.2)? When its phase is `ended` (R21): its
    players are free at once; leaving the finished room comes in phase 19.
  - Is a full room that is asking players to accept still listed (M1.7)? Yes, with 0 free places
    and Join disabled, since it may open up again if someone declines.
  - The list's heading shows the count, "Public rooms · N", as the design does.
  - The "busy elsewhere" text (S10.6) is added to S10.9.
  - A lobby that is out of date must not lock a player out: before refusing a busy player, the
    server asks the room the lobby names, and forgets the entry if the player is not in it; a
    listed room that no longer exists is dropped when someone tries to join it. A room's report
    to the lobby that fails is not retried; these checks repair what it would have changed.
  - The busy day (B18) counts D1 index writes: a new guest writes the row and its three indexes
    (id, token hash, name key), 4 rows (https://developers.cloudflare.com/d1/platform/pricing/,
    checked 2026-11-03). The day writes 1,844 rows of 5,000.
- **Implemented:** `harness/spec/screens.md` S10.9 (HARNESS commit); `src/server/api/isReallyBusy.ts`,
  `joinRoomRoute.ts`; `tools/simulator/busyDay/`; phase 17.

## Q59. How are pausing and being away built?

- **Phase:** 18, start.
- **Question:** R9.12 and R9.13 change the game's clocks, but whether a player is connected is
  known only to the room, and M5.2 asks for "away" to be shown to everyone.
- **Options:** keep connections in the game state (a write for every connect, against
  `rules/cloudflare.md`); keep pausing in the room only (the engine's clocks would not know);
  have the room send the engine logged `pause_game` and `resume_game` actions.
- **Solution:** logged engine actions, so replays stay exact. When a deadline comes and no player
  still in the game has an open connection, the room applies `pause_game` instead of the
  time-out; while paused, no clock runs. The first connection of a player still in the game
  applies `resume_game`: every clock continues from where it stopped, and the player whose time
  would have run out gets their free time again (45 s in the main phase, 5 s on a market go)
  without using their bank. Away is not game state: the room adds the seats without an open
  connection to each update, and sends an update when that changes, without a write. Opening the
  game in a new tab tells the old tab `opened_elsewhere` and closes it (M5.1); this applies only
  once the game has started, since M5.1 is about a game.
- **Readings added after the phase review:**
  - A pause covers every seat whose time would run out at that moment (in the main phase, all
    players with a full bank share one deadline), and each of them gets free time again on resume.
  - The bank a paused player used up to the pause stays used; only the extra free time is free
    (R9.8, R9.13).
  - A seat still in its free time from an earlier pause keeps the rest of it across a new pause.
  - Player actions are refused while a game is paused; a player's message resumes it first.
  - Away shows on the opponent cards in every phase (M5.2), and in the top bar's badges only in
    the main phase, as S2.2 says.
- **Implemented:** phase 18.

## Q60. Where do replay records live, and what removes them (O8)?

- **Phase:** 19, item 1 (O8).
- **Question:** a room's alarm ends with the room, which is deleted 24 hours after its game (M8),
  but replay records are kept 30 days (M4.3).
- **Options:** keep the room alive for 30 days (storage and an alarm per room); write the replay
  record to D1 and remove old ones with a scheduled job; keep records in a single archive
  Durable Object.
- **Solution:** D1, written once when the game ends (1 row plus its index), removed by one daily
  Cron Trigger. Cron Triggers are on the Free plan (5 per account, 10 ms CPU per run); the delete
  is a single D1 statement. Recorded as D27.
- **Implemented:** phase 19.

## Q61. How is leaving built, and what does "at the same moment" mean?

- **Phase:** 19, item 2.
- **Question:** M6 says what leaving does, but not how players who leave "at the same moment"
  (M6.9) are recognised, how a game that ends by leaving or by R9.14 is shown, or how
  `connections-and-leaving` #15 can be checked before room chat exists (phase 21).
- **Options:** for M6.9, treat only the time-outs of one alarm as one moment, or any due
  time-outs at the time of a leave; for the endings, reuse "turn limit", or add endings.
- **Solution:**
  - Leaving is a logged engine action, `leave_game`, accepted from any player still in a game
    that has not ended, also when done or out of actions. The player is made done, their hand
    goes to the holding pile in a main phase and to the discard pile otherwise, and the order of
    leaving is kept in the game state (Q49). It is not added to the done order, which only
    breaks ties between players still in the game.
  - "At the same moment" (M6.9) means the main-phase time-outs due at the same time that each
    make a player leave (R9.11). While one of them is still to be applied, M6.8 waits for it, so
    two last players who both time out abandon the game instead of one of them winning.
  - A game result says how it ended: end goal, turn limit, last player left (M6.8), or
    abandoned because every player left at the same moment (M6.9) or because it stayed paused for
    24 hours (R9.14), so the four versions of the end screen (S9.5) can say why. An abandoned game
    has no winner; I22 checks the winner only in games that are not abandoned.
  - R9.14 is a logged system action, `abandon_game`, applied by the room's one alarm 24 hours
    after the pause began.
  - A player who left is no longer busy in the room (M2, M6.7): the lobby counts only players
    still in the game.
  - For `connections-and-leaving` #15, the room driver reads the elements from the update the
    player would get: `left_game` when their own seat has left, `game_result` when the view has a
    result, and `room_chat` and `exit_to_lobby` while they are still in the room, whose updates
    will carry the chat from phase 21. The screen itself is checked by the browser tests.
  - Leaving is visible to everyone, so it moves every player's state version, like a reveal
    (I25), and the simulator's chaos bot leaves now and then, so the invariants see it.
- **Implemented:** `src/rules/leaveGame.ts`, `seatsLeavingAt.ts`, `abandonPausedGame.ts`,
  `src/shared/GameEnding.ts`, `src/server/room/busyPlayersOf.ts`; phase 19.

## Q62. How do rooms and replay records clean themselves up?

- **Phase:** 19, item 3.
- **Question:** M8.2 deletes a room when its last player leaves it or 24 hours after its game
  ended; M4.3 keeps the replay record 30 days. The spec does not say who may leave a room while
  its game runs, and a daily job cannot remove a record at the exact moment it turns 30 days old.
- **Solution:**
  - A player may leave the room (`leave_room`) once they are no longer in its game: after
    leaving the game (M6.7), or after the game ended (M8.1). A player still in a running game
    must leave the game first. Each seat keeps its player's name, so the other players still see
    who sat there after that player left the room.
  - The room's one alarm is set 24 hours after its game ended; when it fires, or when a message
    arrives after that time, the room is deleted. This adds one alarm row per finished game.
  - When a game ends, the room writes its replay record (seed, setup, starting state for test
    rooms, and the action log) to D1 once: one row and its index entry (B8, B17).
  - A Cron Trigger runs once a day at 03:17 UTC and deletes every record that ended 30 days ago
    or more, with one D1 statement. Cron Triggers are on the Workers Free plan, up to 5 per
    account (https://developers.cloudflare.com/workers/platform/limits/, "Cron Triggers").
  - Until the job has run, a record older than 30 days still exists in D1, so whatever reads
    records (the export, the scenario driver) treats records older than 30 days as removed. The
    record is therefore gone at exactly 30 days for anyone who asks, and deleted from storage
    within a day after.
- **Implemented:** `src/server/room/endedRoomDeletionAt.ts`, `roomActionOutcome.ts`,
  `src/server/replays/`, `migrations/0006_replay_records.sql`, `wrangler.jsonc`; phase 19.

## Q63. Which secret protects the replay export, and what does it return?

- **Phase:** 19, item 4.
- **Question:** M4.1 makes replay records available only to the people who run the game; the
  phase asks for "the owner's secret", and the site has one owner secret already, for test rooms.
- **Options:** a new secret (the owner would have to set it on the live site first); the test-room
  secret, which the owner already set.
- **Solution:** the test-room secret, so the export works on the live site without anything
  from the owner. `GET /api/rooms/<code>/replay` with the secret returns the record from the room
  while it exists, otherwise the stored record of its last game if it ended less than 30 days
  ago, otherwise "Not found", as without the secret. The record is the save format without the
  final state: seed, setup, starting state (test rooms only) and the action log, one format for
  the export and the stored record (`rules/architecture.md`, One save format). `npm run
  replay-export` saves it to a file (`docs/replays.md`).
- **Implemented:** `src/server/api/replayExportRoute.ts`, `tools/replay-export/`,
  `tools/harness-runner/checkReplayExport.ts`; phase 19.

## Q64. When does a player leave a finished room by going elsewhere (M2.2)?

- **Phase:** 19, review findings 1 and 5.
- **Questions and solutions:**
  - M2.2 says joining another room or the ranked queue takes a free player out of the finished
    room; Q58 left this to phase 19. Who counts? Every player who is in a room but no longer
    busy in it (M2.1): everyone once its game has ended, and a player who left a running game
    (M6.7 points to M2). Joining or creating another room takes them out of every such room, as
    leaving it would: the room is deleted when the last player goes (M8.1). The lobby remembers
    which rooms such players are still in; the ranked queue (phase 26) uses the same step.
  - A player who is still in a running game is never taken out this way; they stay busy (M2.1).
  - The replay record is written to D1 after the room has saved, replied and set its alarm. If
    the write fails, the room logs it and carries on: the move, the reply and the deletion alarm
    must not be lost to a D1 error. The room keeps the record until it is deleted, so the export
    still has it for the first 24 hours (Q63).
- **Implemented:** `src/server/api/leaveFinishedRooms.ts`, `src/server/room/leaveRoomIfFreeIn.ts`,
  `src/server/lobby/withRoomSummary.ts`, `src/server/replays/saveReplayRecordIfEnded.ts`;
  phase 19.

## Q65. How do scenarios check replay records and what a leaver sees?

- **Phase:** 19, review findings 3 and 4.
- **Questions and solutions:**
  - `visibility` #13/#14 judged the 30-day cutoff in the lobby driver. They now go through the
    real code: the driver saves the ended game's replay record with `saveReplayRecord` into an
    in-memory SQLite database built from migration `0006_replay_records.sql` (Node's built-in
    `node:sqlite`, no new dependency), runs the daily job `removeOldReplayRecords` at the
    scenario's time and reads the record with the export's `keptReplayRecordText`. "kept" means
    the export finds it and one row is stored; "removed" means neither. The three functions take
    a narrow `ReplayRecordDatabase` type that D1 fits, so the same code runs on both. The
    scenario runner awaits `then` fields, so a driver may read them asynchronously.
  - `connections-and-leaving` #15: Exit to lobby is now reported only when the client shows it,
    from the player's own seat having left or the game's result. The room chat does not exist
    until phase 21; until then the driver counts it as shown while the player is in the room,
    a known gap in the phase 19 file, and phase 21 makes it read the chat field.
- **Implemented:** `src/server/replays/ReplayRecordDatabase.ts`,
  `tools/harness-runner/lobby/replayRecordThen.ts`,
  `tools/harness-runner/lobby/memoryReplayRecordDatabase.ts`,
  `tools/harness-runner/lobby/replayRecordRetention.test.ts`,
  `tools/harness-runner/room/roomMessageContains.ts`, `tools/harness-runner/runScenario.ts`;
  phase 19.

## Q66. What does a player see after their third time-out, and while disconnected?

- **Phase:** 19, review findings 2, 8 and 9.
- **Questions and solutions:**
  - S9.4 says a time-out message says the player was made done (R9.10), but on the third
    time-out in a row the player is not made done: they leave the game (R9.11). That message now
    says "Your time ran out in 3 turns in a row, so you left the game. This was 3 of 3." The
    first and second keep the made-done text.
  - "You left the game" (S9.2) now shows the same messages as the game screen: the time-out
    message, so the player sees why they left, and the connection notices. Like every time-out
    message, it is shown when it happens and is not kept across a reload. The lost-connection
    notice there leaves out "your clock keeps running", which no longer applies to a leaver.
  - Leave game is disabled while the connection is lost, like the rest of the game screen, so
    the confirmation is never shown for a move that cannot be sent.
  - The "left" status colour on player badges comes from the badge's CSS instead of an inline
    style.
- **Implemented:** `src/client/screens/GamePage.tsx`, `src/client/screens/game/timeOutText.ts`,
  `src/client/screens/game/ConnectionNotices.tsx`, `src/client/screens/game/LeaveGameButton.tsx`,
  `src/client/components/PlayerBadge.tsx`; phase 19.

## Q67. Where do the daily counts live, and what counts toward them?

- **Phase:** 20, start (A9.1–A9.4).
- **Questions:** where are a player's daily actions and game starts kept, and the site's game
  starts? What is "an accepted game action"? Does creating a room count as joining it? Do test
  rooms count?
- **Options for the place:** (a) the lobby Durable Object's record, next to "one thing at a time";
  (b) columns on the D1 players table, with the site count in the lobby; (c) a row per player and
  day in the lobby's SQLite.
- **Solution:**
  - (a). D26 already puts the site counters in the lobby, and the lobby is single-threaded, so a
    join can check the counts and claim the player in one step (`claim`), and a game start can
    check every player and the site and count the start in one call, with no race between rooms.
    The record keeps the day number (UTC epoch ms / 86,400,000) and entries for today only: a
    record from an earlier day reads as all zeros, so the reset at 00:00 UTC (A9.1) needs no
    alarm and no write. At most about 200 players can have counts in a day (50 games × 4), so the
    record stays small. Cost: 1 lobby row per game start, 1 per game end and 1 per player who
    leaves a running game, at most about 300 rows on a busy day, measured in the busy-day
    simulator under B18. D1 and B8 are not touched.
  - A player's actions in a game are their accepted moves in its action log: every action with
    their seat except `time_out`, `pause_game` and `resume_game`, which the room makes, not the
    player (spec A9.2, one added sentence). Market goes, ending the turn and undo count, as the
    glossary says. Room messages (accept, decline, size) are not game actions.
  - They are added when the game ends (every seat still in it) or when the player leaves it
    (Leave game, or leaving after 3 time-outs, R9.11). An abandoned game is an ended game.
  - Creating a room counts as joining it for A9.2 and A9.3 (spec A9.3, one added sentence);
    A9.4 is about starting, so creating and joining rooms stay possible at the site limit.
  - Test rooms (the test-room secret, phase 08) do not count: they are a test tool, not a game
    players start, and they never go through the lobby.
- **Implemented:** `accounts.md` A9.2, A9.3; phase 20, items 2 and 3.

## Q68. What happens in a room when a game cannot start because of a daily limit?

- **Phase:** 20, start (A9.3, A9.4, scenarios `lobby-queue-and-limits` #25 and #31).
- **Question:** A9.3 and A9.4 say the limits are checked again when a game starts, but not what
  the room does then. If everyone just stays, a full room asks again at once and fails again.
  A9.2 and A9.3 also have no notice text.
- **Options:** keep everyone and stop asking; remove the player who hit the limit; close the room.
- **Solution:** the check runs when the last player accepts (M1.10). A player who has reached
  A9.2 or A9.3 is removed from the room without a rejoin wait (they cannot join again today
  anyway) and told why; the asking ends and everyone else keeps waiting, as when a player leaves
  (M1.11, Q54). At the site limit (A9.4) nobody is at fault: the asking ends, everyone stays, and
  everyone in the room is told; the room asks again the next time it becomes full. The player
  texts are those of the design board "Notices: daily limits", now in `screens.md` S16.1: "You
  have used your 2,000 game actions for today. You can join rooms, the ranked queue and new games
  again after 00:00 UTC." and "You have started 10 games today, the most per day. Try again after
  00:00 UTC." The reason codes are those of the scenarios: `daily_action_limit`,
  `daily_game_start_limit`, `site_game_limit`. In the client, the same texts are shown for a
  rejected join or create in the lobby and as a notice in the waiting room.
- **Implemented:** `accounts.md` A9.3, A9.4; `screens.md` S16.1; phase 20, items 3 and 4.
- **Review (phase 20, finding 1):** when the room cannot reach the lobby to check the limits at
  game start, the game does not start and is not counted: starting without the check would let
  the limits be passed whenever the lobby fails. The last accepter is refused with `no_answer`
  ("The server did not answer. Try again.", S10) and the room is left as it was: the asking and
  its timer go on, the other acceptances stay, and the last accepter can accept again before
  the time runs out (`receiveCheckingGameStart`, `startGameWithinLimits`).
- **Review (phase 20, finding 5):** the site-limit notice in the waiting room has the title of the
  design board, "Daily game limit reached", with the site-wide text; now written into S16.1.
- **Harness change (review, finding 8):** `lobby-queue-and-limits` "the game start limit is
  checked again when a game starts" (#31) now also checks that Ann, over her own limit, is
  removed and only Bea stays (`room: {players: [Bea], state: waiting}`), as this question
  decides. The code already did so; the scenario did not check it.

## Q69. How can the browser tests start more than 50 games a day on one local server?

- **Phase:** 20, start (A9.4).
- **Question:** one `npm run e2e` run starts well over 50 games on the local server (every full
  game, room and lobby test at three screen sizes), and the local Durable Object storage is kept
  between runs, so A9.4 would make most browser tests fail. `playwright.config.ts` is protected,
  so there is no global setup to reset the count.
- **Options:** (a) a test route under the test-room secret that resets the site count, called by
  every game-starting helper; (b) an optional variable that only local and CI servers set,
  raising the site limit; (c) test rooms for every browser game.
- **Solution:** (b). The limit is the spec's 50 in code. A server whose environment sets
  `TEST_SITE_GAMES_PER_DAY` uses that number instead; only `.dev.vars` sets it (locally and in
  the `.dev.vars` step of `check.yml` and `deploy.yml`, to 1000000), never `wrangler.jsonc` or the
  live site. (a) is fragile: one helper that forgets the reset fails a later test far from the
  cause, and a test that set the site count to the limit would break the tests running beside
  it. (c) would stop the browser tests from testing the lobby. The limit logic itself is proved
  by the scenarios with the real numbers; the browser test for the notices uses a player's own
  limit, set through the test-room secret, which affects no other test; the site notice is tested
  in the client's unit tests.
- **Implemented:** phase 20, item 3 (`siteGameLimitOf`, `.dev.vars`, `check.yml`, `deploy.yml`).

## Q70. Which budgets can the report show, and how are full games played in the browser?

- **Phase:** 20, start (Builds 2 and 3, B1–B5, B9–B18).
- **Questions:** B10, B14 and B15 are measured outside `npm run harness` (browser tests and
  size-limit); B11 is measured but not required; B6, B7 and B8 belong to the tutorial, chat and
  records (phases 29, 21 and 25). How does a browser test play a whole game in reasonable time?
- **Solution:**
  - The report's budget section lists every budget in `budgets.yaml` with its limit, its
    measurement and where it is measured. Those measured by the harness show the value; B10,
    B14 and B15 show the tool that enforces them in `npm run check` or the browser tests (which
    fail when the budget is broken); B6, B7 and B8 show the phase that builds their feature.
    B11 joins the required budgets (`harness/required.yaml`) if it is within its limit; if it is
    not, that is a failing budget to fix, not to leave out.
  - B15 is measured in the full-game browser tests: the time from each click on a move to the
    updated view, 95th percentile at most 500 ms, asserted in the test.
  - The full games (2, 3 and 4 players, each at the three screen sizes Playwright runs) go from
    the lobby through room creation, joining and accepting, play some real moves in the first
    turns, then take the market go and end the turn for every player until the game ends after
    turn 40 (R21), and check the end screen. Screenshots of the key screens they pass through go
    to `harness/screens/`.
- **Implemented:** phase 20, items 5, 6 and 7.
- **Harness change (item 6):** B11 joined the required budgets in `harness/required.yaml`; the
  room scenarios measure it as the longest wall-clock time the room took to handle one message
  (never less than its CPU time), 3 ms against 10. B16 now adds the rows the busy-day simulator
  reads outside the game (room, lobby and D1 token lookups, 56 per room) to the room's reads per
  3-player game: 629 against 50,000. B18 is unchanged at 2,126 against 5,000.
- **Measurement change (finisher):** measured as the longest time for one message, B11 failed
  `npm run check` twice out of four runs (21 ms and 14 ms) while other tests or the browser tests
  loaded the computer, and passed at 3 ms otherwise: one message slowed by the load decided it.
  `budgets.yaml` defines B11 as the 99th percentile, so the room driver now gives the time of every
  message it handles and the harness takes the 99th percentile over all of them, as the budget
  says. The limit (10 ms) and the required list are unchanged.
- **Review fixes (findings 2 and 7):**
  - B18 now counts the end of each room in the busy day, in B18 rather than B8 (B8 is the game
    records of phase 25): the replay record written to D1 (3 rows: the table, its primary-key
    index and the `ended_ms` index), the daily delete of one 30 days old (3 rows; as many records
    end each day as are deleted), the cleanup alarm's delete of the room's storage (1 row) and
    the lobby report when the room goes (1 row). Setting the cleanup alarm is not counted again:
    the game simulator counts it in B4, with the alarm change after the game's last action, and
    the alarm firing writes nothing. B18 rises from 2,126 to 2,526 against 5,000; the room-end
    reads (the room loaded by the alarm, the lobby, the deleted record) raise B16 from 629 to 632.
  - B11 is measured on the production path: the room driver sends every message through
    `receiveCheckingGameStart`, as `GameRoom` does, with a lobby that answers at once. Room
    scenarios never start a game, so the call never waits for the lobby and its whole handling
    runs before it returns; the driver times that part. Driver steps may now be asynchronous.
- **Review fixes (findings 3 and 6):**
  - The full browser games check for leaks at the start of the game, before any move, as the
    other game-screen browser tests do: no card name in one player's hand appears in a message to
    another player (`hiddenCardsSentToOthers`). Later turns are left to the harness leak test,
    which checks every message of every simulated game against the cards hidden from its receiver
    at that moment. The browser check compares a player's current hand with every message the
    others have received, by card name; once cards are sold, built or drawn into the open, and
    since a name can stand for several copies of a card, the same names appear in public messages
    legitimately, so a later browser check would report leaks that are not there.
  - The B15 percentile in the full games uses the harness runner's `percentileOf`; the copy in
    `e2e/` is removed.

## Q71. How does the phase end, given the owner's playthrough?

- **Phase:** 20, start (exit criteria; D6; `game-rules.md` open question 1).
- **Question:** the exit criteria include the owner playing a complete game with others and
  accepting the milestone, and the open points say findings become spec changes or phases before
  milestone 4 starts. Only the owner can invite testers to Cloudflare Access (D6).
- **Solution:** the releaser merges and deploys as usual, then writes the playthrough under
  **Waiting for the owner** in the phase file (invite testers, play with the checklist, accept
  the milestone or report findings) and marks the phase **waiting for the owner** instead of
  done, so milestone 4 does not start before the playthrough. The checklist is
  `docs/playthrough.md`; it asks the testers to note how many turns their games took, for the
  game-length recheck (D24, `game-rules.md` open question 1).
- **Implemented:** phase 20, item 8 (`docs/playthrough.md`) and the release. The site lock
  was removed by D22 (replaces D6), so testers get the link instead of a Cloudflare Access
  invitation.

## Q72. How do the browser tests fit GitHub's 20-minute job limit?

- **Phase:** 20, release (branch check run 42055452656).
- **Question:** GitHub runs the 111 browser tests with 1 worker (the private repository's
  2-core runner). In run 42055452656 the `browser-tests` job hit its `timeout-minutes: 20`
  after 78 tests, with the 9 full games still to come (about 1 to 2.5 min each), so neither
  the branch check nor a deploy could pass. Raising the limit or dropping tests would hide the
  problem; `playwright.config.ts` is protected.
- **Solution:** the 20-minute limit per job stays. `browser-tests` in `check.yml` and
  `deploy.yml` is a matrix of 6 parallel jobs: one per full-game player count
  (`--grep` on the test title, 3 screen sizes each) and the other 102 tests in 3 Playwright
  shards (`--grep-invert` on the full-game titles, `--shard=n/3`). No test is dropped and no
  retries are added. `fail-fast: false` lets every part finish, so one failure does not hide
  another. The test step has its own 15-minute limit and the results upload with
  `if: always()`, so a slow part still leaves its traces; `--reporter=list` names every test in
  the log instead of the dot reporter's `F`. The deploy job needs `browser-tests`, which is
  successful only when all 6 parts are.
- **Effect on Actions minutes** (private repository, 2,000 free minutes a month): the tests
  take the same time, but each of the 6 jobs repeats the setup (install, Chromium, local
  server, about 1.5 min) and GitHub rounds each job up to a whole minute. Measured in branch
  check run 42063791956: the parts took 4.5, 4.6 and 7.6 min (full games with 2, 3 and 4
  players) and about 7 min each (other tests), with `check` 3 min, so a branch check costs
  about 42 minutes instead of about 35 in one job (had it fit). A deploy of already checked
  code still costs about 1 minute, one that tests again about 42. That leaves room for about
  45 branch checks a month. In that run one part spent 11 min installing Chromium (about 20 s
  in the others), a GitHub runner delay; the part still finished in 17.5 min, so a slow
  install can bring a part close to its 20 minutes.
- **Implemented:** phase 20, release fix (`.github/workflows/check.yml`, `deploy.yml`).

## Q73. How are the helpers made cheaper and steadier after phase 20?

- **Phase:** between 20 and 21 (owner's request after the phase 20 analysis).
- **Question:** phase 20, the first phase built only with helpers (D28), used 18 helpers. One
  helper stalled and five ended their turn to wait for a background command. The check hook
  then ran `npm run check` beside their browser tests, because rewritten screenshots count as
  changes, and that load made browser tests and B11 fail. The 2-player full-game setup failed
  three times with "Choose a username" still open. Chromium installs on GitHub hung twice (11
  minutes, then past the 20-minute job limit). Releasers waited for GitHub by calling
  `gh run view` over and over.
- **Solution:** approved by the owner on 2026-11-05.
  - Helpers keep every command under 10 minutes, with the browser tests split into five named
    commands (`phase-helpers.md`, "Keep your context small"), and wait for GitHub with one
    `gh run watch`.
  - The starter marks each item small or large. The coordinator may give one helper two
    small jobs, and one fixer takes all findings when at most 4 need a fix (`README.md`, "The
    coordinator").
  - An item that changes only `docs/` runs Prettier and `npm run harness:check` instead of
    the full check (`phase-helpers.md`, Builder step 6).
  - The coordinator keeps a **Helper log** of each helper's minutes, tokens, tool calls and
    result in the phase file.
  - On GitHub, each Chromium install try stops after 4 minutes, with at most 3 tries.
  - The browser tests' username step waits for the server's answer to `POST /api/guests`
    (with the human check's time limit) before checking that the dialog has closed. The
    check itself is unchanged.
  - The check hook leaves `harness/screens/` out of the changes that start a check. The owner
    applied it, since `tools/hooks/` is protected.
  - A push to master that changes only `docs/`, `tools/hooks/`, `.claude/` or
    `harness/screens/` starts no deploy, since none of them reaches the live site (owner's
    request, 2026-11-05). Deploy can still be started by hand.
  - The GitHub repository stays private, to keep a ready-to-run copy of the game out of reach
    (owner's decision, 2026-11-05; it was public for about 15 minutes, with no forks). The
    2,000 free Actions minutes a month in Q72 still apply; November had used about 940 by
    2026-11-05. If the minutes run out, the owner may make the repository public.
- **Implemented:** `docs/plan/phase-helpers.md`, `docs/plan/README.md`,
  `.github/workflows/check.yml`, `.github/workflows/deploy.yml`, `e2e/becomeGuest.ts`.

## Q74. What happens with the findings of the owner's first playthrough?

- **Phase:** 20, waiting for the owner (Q71); the owner's notes are
  `docs/playthrough-notes/2026-11-06-first-playthrough.txt`. The owner reviewed all 9 findings
  and approved every one for implementing (2026-11-06).
- **Question:** phase 20 says findings become spec changes or new phases before milestone 4.
  Where do the notes live, how do the findings reach the spec, and which phase builds them?
- **Solution:**
  - Playthrough notes go in `docs/playthrough-notes/`, one dated file per round, kept as the
    owner wrote them.
  - Phase 20 is done (the owner played complete games with others). Accepting milestone 3 moves
    to a new phase **20a, Playthrough fixes**, which builds the 9 findings and ends waiting for the
    owner's acceptance. Phases 21, 22, 23 and 28 depend on 20a instead of 20, so milestone 4 does
    not start before it. Phases 21–30 keep their numbers.
  - Two findings change the rules, so they were written into the spec first:
    - Finding 5: a quest can only be completed while workforce, quality and satisfaction are all
      0 or more, as for projects (R19.4, rulebook "Quests" and the stats paragraph, S16.3
      `quest_needs_not_met` text). Scenarios `quests` #65–67 added.
    - Finding 7: the discard pile is shown only as a number of cards. Which cards are in it is now
      hidden information (M3.2, M3.5, R17.1, rulebook "The deck and drawing cards", S4.2), so the
      view carries only the count, not just the screen. Kept public: discard shuffles in the draw
      log, with sector or kind, tier and count (M3.3, R17.6, reworded), and the "None left" marks
      of the draw table (S8.3), which draw actions need (R15.3). Scenario `visibility` #16 added;
      the view field `discard` became `discard_count` in `scenario-format.yaml` and
      `HARNESS.md`, and the 3 scenarios that asserted the view's discard cards (`drawing` #10,
      #11, `visibility` #15) now assert the count. They contradicted the new spec, so they were
      changed (`rules/workflow.md`); their names stay on the required list.
  - The other 7 findings are screen rules: S1.5 (sector colours, Public kinds use the Public
    colour), S1.6 (icons with tooltip and accessible name), S4.5 (market phase banner, a new
    rule; the owner only asked for it to be "very noticeable"), S5.1 (sector names coloured,
    negative stats shown as unmet), S5.4 (the **?** help for quests, with its text), S6.1 (combos
    as icons), S6.3 (PROJECTS title, "First to complete gets +2" with the funds icon, "Completed
    by …" only after someone has, its **?** help text), S6.5 (sector-coloured title bar; the hand's photos loaded in the background, and the
    selection switching only once the new photo is ready, at most 300 ms, so the owner never
    sees a blank or mixed card (owner's choice, 2026-11-06); no loading screen; the next
    card shown within 100 ms, chosen as a measurable "smoother or faster"), S8.3 (stats as icons,
    kind names on sector colours, "unlimited uses").
  - Added on 2026-11-06, after the first finisher run, at the owner's request: stats and types
    are always shown as icons, never as words, on every screen and in all text, prose included
    (the owner chose "everywhere, prose too": messages, notices, help texts and the rulebook in
    the rules viewer). The owner had asked for this during the design (2026-10-25/26), but it
    was only in single screen rules, not a general one, so the code drifted. S1.6 is now the
    general rule; S8.1 names the Claim all pop-up. Phase 20a items 8 and 9 build it; phase 28
    applies it to the rules viewer and card set.
  - The spec and harness changes are one `HARNESS:` commit on the branch
    `phase-20a-playthrough-fixes`, not on master: on their own they turn `npm run check` red
    (the scenario count and the 3 changed required scenarios) until phase 20a items 1 and 2 are
    built.
- **Implemented:** `harness/spec/game-rules.md`, `multiplayer.md`, `rulebook.md`, `screens.md`,
  `harness/scenarios/quests.yaml`, `visibility.yaml`, `drawing.yaml`,
  `harness/scenario-format.yaml`, `harness/HARNESS.md`; `docs/plan/phase-20a-playthrough-fixes.md`,
  `docs/plan/README.md`, phase files 20, 21, 22, 23 and 28.

## Q75. Does the protocol version go up when the view changes shape?

- **Phase:** 20a (finisher, coordinator's note in Progress).
- **Question:** item 2 replaced the view's `discard` (cards) with `discardCount` (a number), and
  item 1 added `negativeStats` to each quest progress entry, without raising `PROTOCOL_VERSION`
  (2). M9.1 only says client messages carry the version and an older one is rejected;
  `rules/architecture.md` ("Versioned protocol") says intents and views carry it so that, after a
  deploy, the server recognises tabs still running the old client instead of misreading their
  messages. Must it go up for a view-only change?
- **Solution:** yes. A tab with the old client would keep sending version 2, be accepted, and
  then fail to read every view (no `discard`, a new required field). Raising the version to 3
  makes the new server reject its messages with `wrong_protocol_version`, and the client shows
  "A new version is available: reload." (S16.3). From here on, any change to the shape of a
  message in either direction raises `PROTOCOL_VERSION`; the spec needs no change, since M9.1
  already rejects older versions.
- **Implemented:** `src/shared/PROTOCOL_VERSION.ts` (3).

## Q76. Which words count as a stat or a type under S1.6?

- **Phase:** 20a, item 9 (Icons everywhere).
- **Question:** S1.6 shows every stat and type as its icon, never as a word, in all text. Some
  names contain a stat word without meaning the stat: "bonus types" and "bonus-type points"
  (R21.6), the "first-completion bonus" (R16.6), and button and pop-up names such as "Use
  influence". Are those words icons too, and how is a stat in a label with a fixed name spoken?
- **Solution:**
  - "Bonus types", "bonus-type points" and "first-completion bonus" are game concepts with their
    own names (glossary), not the bonus stat; they stay words.
  - "Use influence" and "influence action" name the influence stat; they show the influence icon
    ("Use [icon]"). The button and the pop-up are then named "Use Influence" (the icon's name),
    which the tests use.
  - Stats in prose become parts (text and icons, `IconText` in `src/client/components/`), never a
    string; the rejection messages of S16.3 keep their words, with each stat as its icon.
  - "Tier" and "cost" are not stats in S1.6's list; they stay words where they are words.
  - S1.6 said the tooltip shows when "the icon has keyboard focus". Icons are images, and the
    lint rule `jsx-a11y/no-noninteractive-tabindex` (rightly) forbids making them tab stops; a
    screen shows dozens, so a keyboard user would tab through all of them. S1.6 now says the
    tooltip shows when the control the icon is in has keyboard focus, and icons are not tab stops
    of their own (`HARNESS:` commit).
- **Implemented:** `harness/spec/screens.md` S1.6; phase 20a item 9.

## Q77. Whom does "Completed by" name in the projects area?

- **Phase:** 20a (phase review, finding 3).
- **Question:** S6.3 says a project shows "Completed by Ann, Bob" once someone has completed it,
  and that each project shows your progress or "completed". Does "Completed by" name you too,
  and what shows when only you have completed it?
- **Solution:** "Completed by" names only the other players: your own completion already shows
  as "you completed ✓" in your progress, so naming you again would say it twice. When only you
  have completed it, neither "Completed by" nor the +2 line shows (the +2 is gone once anyone
  has completed it, R16.6). The coordinator told the owner of this choice during the phase and
  the owner did not object. S6.3 now says so (`HARNESS:` commit).
- **Implemented:** `harness/spec/screens.md` S6.3; `ProjectProgressList.tsx` (phase 20a item 5)
  and its tests in `projectsAreaAndHelp.test.tsx`.

## Q78. What happens with later playthroughs?

- **Phase:** 20a, waiting for the owner. The owner accepted milestone 3 on 2026-11-06 and said
  they will play more playthroughs later and want those notes addressed, while the work goes on
  now.
- **Question:** milestone 3 is accepted, but more playthrough notes will come during later
  phases. When are they built?
- **Solution:** phase 20a is done and milestone 4 starts. Each later round of notes goes in
  `docs/playthrough-notes/` as a new dated file (Q74). The next "continue" after a phase is done
  finds a notes file that no phase builds yet and, before starting any other phase, plans a fix
  phase for it as 20a was planned: findings into the spec first, then a phase file named after
  the last done phase with the next letter (for example 21a), whose dependents wait for it. A
  phase in progress is finished first.
- **Implemented:** `docs/plan/README.md` ("Continue", step 4, and the phase table);
  `phase-20a-playthrough-fixes.md`.

## Q79. Where is the chat stored, and what does it cost (B7, A9.6)?

- **Phase:** 21, start.
- **Questions:** a room's chat can reach 400 messages of 800 bytes (A11.5, A11.6), about 320 KB.
  Kept in the room record, every game action would rewrite it, against B13 (100 KB) and B11
  (10 ms). Where does it go? How does the site-wide cap of 2,000 messages a day (A9.6) fit B7's
  1 row per message, when the count lives in the lobby (D26)? Does a mute cost a row? How does the
  chat reach the browser?
- **Options for the storage:** (a) in the room record; (b) one row per message; (c) the room's
  own rows of 20 messages each (`chat:0`, `chat:1`, ...), the newest rewritten per message.
- **Solution:**
  - (c). A message rewrites only its block: 1 row (B7), at most about 20 KB. Game actions never
    touch the chat, so B13 and B11 are unchanged. Deleting a room deletes its chat blocks with
    it (A11.9, M8.2): 1 row per 20 messages, counted in B18 with the room's other cleanup.
    (b) would cost a delete per message, up to 2,000 rows a day.
  - The site cap: as Q52 planned, a room reserves quota from the lobby in blocks of 20 messages,
    for the current UTC day only. The lobby grants at most what is left of 2,000 for the day and
    writes 1 row per block (about 100 rows on a day at the cap, in B18). The room keeps what is
    left of its block in its newest chat block, so it is saved with the message and survives
    eviction. A block a room does not use up still counts toward the 2,000, so the site may send
    fewer than 2,000 on a busy day, never more. If the lobby does not answer, the message is
    refused with `no_answer`.
  - A player's count in the room (100) and the time of their last message (2 seconds) are read
    from the saved messages, so they cost nothing extra.
  - Mute and unmute are saved in the room record, 1 row each, counted in B7 like a message
    (budgets.yaml B7's unit). Each message saves the players who had muted its sender when it
    was sent, so unmuting shows only messages sent after it (A11.7).
  - "Since they joined" (A11.2): each player in the room record keeps the number of messages the
    room had when they joined, written with the join. Grey lines (S7.3) are kept in the room
    record with the same position, written with the change they describe, so they cost no row.
  - The browser: chat is not part of the room or game view, so game updates stay small. A new
    server message carries chat entries: everything the player may see on connect and resync,
    and each new entry to the players who see it as it is saved (A11.8). Chat rejections carry
    when the player can send again (S7.4). `send_chat`, `mute` and `unmute` are room intents. The
    message shapes change, so `PROTOCOL_VERSION` goes to 4 (Q75).
  - Known limit (phase 21 review, finding 5): room intents carry no action id, so they are not
    idempotent as `rules/multiplayer.md` "Idempotent, ordered actions" asks of actions. A
    `send_chat` resent more than 2 seconds after the first would be saved twice. Nothing resends
    a room intent today (a send while disconnected is refused in the browser, not queued); a
    later phase that adds resending gives room intents action ids first.
- **Implemented:** `harness/budgets.yaml` B7 and B18; phase 21, items 1 to 4.

## Q80. What counts as a character, a notification and a grey line in the chat?

- **Phase:** 21, start (A11.4, A11.5, S7.3, S7.4).
- **Questions:** A11.5 counts characters "as the player sees them" but does not say how, nor what
  happens to tabs and other control characters. A11.4 asks for a notification without saying
  what it is. S7.3 shows grey lines for "joins, leaves and similar events" without listing them,
  and S7.4 asks for limit messages without texts.
- **Solution:**
  - Characters are grapheme clusters (`Intl.Segmenter`, in browsers and Workers), counted after
    line breaks, tabs and other control characters become spaces and the ends are trimmed; bytes
    are UTF-8 bytes of the same text. One shared function in `src/shared/` does it, so the
    server's check and the input's counter (S7.3) agree. Spec A11.5, one sentence. A Windows
    line break (CR LF, two control characters) is one line break and becomes one space (phase 21
    review, finding 3).
  - A notification is the message appearing in the chat at once, adding to the Chat tab's unread
    count while the chat is not on screen; no sound, as the spec names none elsewhere. Spec A11.4.
  - Grey lines: joined the room, left the room, left the game (including after 3 time-outs), the
    game started, the game ended. The design's "… is done." line is not one of them: the end of a
    turn belongs in the game screen, not the chat. Spec S7.3.
  - Texts: the design board "Game: chat limit" gives "You can send 1 message every 2 seconds.
    Try again in 1 second."; the room limit and the length texts are new; the site cap uses
    S16.1. A refused message stays in the input. Spec S7.4. A refused message is not saved and
    does not count toward any limit (spec A11.6, one sentence).
  - A message refused for a reason that is not a limit (the server did not answer, the player is
    no longer in the room) also goes back into the input, with that reason over it, and the
    browser pairs each refusal with its oldest message not yet answered. Room intents carry no
    action id (Q79), so those two reasons are taken as a chat refusal only while a message is
    unanswered; a `no_answer` to accepting a game sent in that moment would be shown in the chat
    instead (phase 21 review, finding 4).
  - The waiting room's chat column (S11.1) is the same chat without the tabs. Spec S11.1.
- **Implemented:** `harness/spec/accounts.md` A11.4–A11.6, `harness/spec/screens.md` S7.3, S7.4,
  S11.1; phase 21. The Windows line break (A11.5) and the refusal for any reason going back into
  the input (S7.4) were written into the spec after the review (phase 21, second finisher run).

## Q81. How many grey lines does a room keep?

- **Phase:** 21, item 1 (S7.3, B13).
- **Question:** grey lines live in the room record (Q79), and a waiting room whose players come
  and go adds one for every join and leave, without end. S7.3 says each player sees the grey
  lines since they joined, with no limit.
- **Options:** (a) keep every line; (b) keep only the newest lines.
- **Solution:** (b), the last 200 grey lines. A long-lived waiting room can no longer grow its
  record past B13 (100 KB) through joins and leaves; 200 lines is far more than a chat column
  shows. Spec S7.3, one clause.
- **Implemented:** `harness/spec/screens.md` S7.3; `src/server/room/withChatEvents.ts`.

## Q82. Which chat limit is named when several apply, and how does the player learn when to retry?

- **Phase:** 21, item 2 (A11.5, A11.6, A9.6, S7.4).
- **Questions:** a message can break several rules at once (too long and too fast, or the
  101st message sent within 2 seconds). A11.6 says the player is told which limit they reached,
  but not which one when several apply. S7.4 counts down to when the player can send again, but
  no message carries that time. S7.4 gives no text for an empty message, which "cannot be sent".
- **Solution:**
  - The room checks in this order and names the first that applies: the text (empty, then over
    200 characters or 800 bytes), the 100 messages in the room, the 2 seconds, then the site's
    daily cap. The permanent limits come before the passing one, so a player at 100 messages is
    never told to wait 2 seconds; the site cap comes last so a message refused for anything else
    never asks the lobby for quota.
  - The `rejected` server message gains `sendAgainAt`: the time a player refused with
    `chat_too_fast` may send again (their last saved message plus 2 seconds), null for every
    other rejection. The message shape changes within `PROTOCOL_VERSION` 4, which this phase
    has not yet deployed.
  - The input never sends an empty message (S7.4); the server still refuses one with
    `message_empty`, shown with the fallback text "A message cannot be empty."
- **Implemented:** `src/server/room/newChatMessageOf.ts`, `src/shared/protocol/ServerMessage.ts`,
  `src/client/screens/game/REJECTION_MESSAGES.ts`; phase 21, item 2.

## Q83. Whom can a player mute, and how does the muter learn their mute list?

- **Phase:** 21, item 3 (A11.7, S7.3).
- **Questions:** A11.7 lets a player mute "another player in the room" but does not say what
  happens to a mute of themselves, of a name not in the room, of a player already muted, or to an
  unmute of a player not muted. S7.3 lists muted players with Unmute, but no message carries the
  list. Does a mute end when either player leaves the room?
- **Solution:**
  - A mute names another player who is in the room; anything else (themselves, an unknown name,
    someone who left) is refused with the new code `player_not_in_room`. Muting a player already
    muted, or unmuting one who is not muted, is accepted and changes nothing, so it writes no row.
    An unmute names a player in the muter's own list, even one who has since left. Spec A11.7,
    one sentence; `harness/HARNESS.md` reason codes.
  - A mute stays when either player leaves the room and comes back, as A11.7 says: it lasts until
    the unmute or the room's deletion.
  - Every `chat` server message carries `mutedNames`, the receiving player's own mute list, so it
    reaches that player only. A mute or unmute sends the muter a `chat` message with no new
    entries and the new list; the muted player gets nothing.
  - The scenario `chat` #11 sent Bea's two messages with no time between them, which A11.6
    refuses; it now waits 2 seconds before the second, as the spec requires.
- **Implemented:** `harness/spec/accounts.md` A11.7, `harness/HARNESS.md`, `harness/scenarios/chat.yaml` #11; phase 21, item 3.

## Q84. How exactly does an abandon vote run?

- **Phase:** 22, start (M7, S9.3).
- **Questions:** M7 does not say whether the caller answers, when a vote closes (does one no end
  it at once?), what happens to a player who leaves during a vote, from which turn "every 5
  turns" counts, what answering twice gets, whether a vote changes the other players' state
  versions, or how the end screen tells an abandoned-by-vote game from the other abandoned
  endings.
- **Options:** close at the first no, or only when everyone has answered or the minute is over;
  count 5 turns from the vote's call or from its close; raise every player's state version on a
  vote, or only the actor's.
- **Solution:**
  - The caller counts as voting yes and is not asked. A player asked is every other seat still
    in the game when the vote is called; one who leaves during the vote is no longer asked. The
    vote closes when every player still asked has answered (passing if all said yes) or when the
    minute is over (failing unless all said yes). A no does not close it early: with one answer
    out of two shown and the vote then closing, everyone would know how that player voted
    (M7.5). New spec rule M7.6, and scenarios `connections-and-leaving` #28 to #30.
  - The 5 turns count from the turn in which the last vote was called, passed or failed; the
    first vote can be called in any turn. A vote can be called in any phase. Its 1-minute
    deadline is absolute and is one of the room's deadlines (`earliestDeadline`, one alarm).
  - Answering twice, and the caller answering, are refused with the new code
    `vote_already_answered` (S16.3, `HARNESS.md`). A player who left gets `not_in_game`; an ended
    game `game_over`.
  - Calling and answering raise only the actor's state version. The others get a new view (the
    count changes) with their version unchanged, so a vote never makes another player's move
    `stale_state` (M9.4 lists phase changes and reveals). A passed vote ends the game, a phase
    change, which raises everyone's.
  - A passed vote ends the game with the new ending `abandoned_by_vote`: no winner, no game record
    (A3.1), ratings unchanged (A10.9); `isAbandoned` includes it. The view carries the open vote
    (time left, answered, of, whether this player still has to answer) and the next turn a vote
    is possible, which the "vote failed" message (S9.3) and `vote_too_soon` (S16.3) show.
  - Ranked games refusing votes (`vote_not_allowed`, `connections-and-leaving` #22) come with
    ranked games in phase 26. Bots never call or answer votes; simulated games are unchanged.
- **Why:** the closest reading of M7 that keeps M7.5's secrecy and M9.4's per-player versions.
- **Implemented:** `harness/spec/multiplayer.md` M7.6, `harness/spec/screens.md` S16.3,
  `harness/HARNESS.md`, `harness/scenarios/connections-and-leaving.yaml` #28 to #30; phase 22.

## Q85. How exactly does a rematch run?

- **Phase:** 22, start (M8.4–M8.6, S11.4).
- **Questions:** M8.4 does not say whether the asker counts as accepted (the design board shows
  them accepted, but scenarios `rooms` #23 and #24 have the asker accept like the others), whether
  a second rematch can be asked while one is open, what happens when a player leaves the room
  during the asking, whether decliners are removed as in M1.11, whether the daily limits apply,
  or how a rematch of a ranked game is told apart in the room record before ranked games exist.
- **Solution:**
  - A new room intent `ask_rematch`. It reuses the room's accept flow (`accept_game`,
    `decline_game`, 20 seconds, the accepted usernames in `asking`). The asker is asked like
    everyone else and is not counted as accepted (scenarios win over the design; added to S17).
    Only one rematch is asked at a time.
  - Possible when the room's game has ended, at least 2 players are in the room and no rematch is
    being asked; otherwise `rematch_not_possible`. A player not in the room gets `not_in_room`.
  - A decline, a time-out, or a player leaving the room, joining the ranked queue or another room
    (M2.2) ends the asking at once. Nobody is removed or blocked from rejoining, the room stays
    ended and its deletion time does not change; a new rematch can be asked straight away. New
    sentences in M8.4 and M8.5, and scenario `rooms` #28.
  - The new game has every player in the room, including players who left the previous game but
    stayed in the room, in a newly drawn seat order, as a room game start does. The room size is
    unchanged. An ended room takes no new players and its size cannot change (M1.4, M1.6), so the
    after-the-game screen shows neither (S17).
  - The daily limits apply as to any game start (A9.2–A9.4): when one stops the rematch, the
    asking ends, everyone stays in the room and the players concerned get the existing notices.
  - `RoomGame.kind` becomes `"casual" | "ranked"`; every game started in this phase is casual,
    and the lobby driver's given `room.kind` sets the ended game's kind, so `rooms` #23 can check
    that a rematch of a ranked game is casual. Ranked starts come in phase 26.
  - The chat history stays. The ended game's replay record (M4.3) is already stored when it
    ended, so replacing the room's game loses nothing.
- **Why:** follows M8 and the scenarios, and reuses the M1.10 asking instead of a second one.
- **Implemented:** `harness/spec/multiplayer.md` M8.4, M8.5, `harness/spec/screens.md` S16.3,
  S17, `harness/HARNESS.md`, `harness/scenarios/rooms.yaml` #28; phase 22.

## Q86. Where does a player see the room after a game?

- **Phase:** 22, start (S9.5, S11.4).
- **Question:** S11.4 describes the room after a game, and S9.5 gives the end-of-game screen a
  **Close** button, but nothing says how a player gets from one to the other. Until now Close
  showed the final board with a **Show result** button.
- **Options:** keep the board after Close and add a way to the room; Close leads to the room.
- **Solution:** Close leads to the room after the game (S11.4), with the lobby's top bar, the
  room and the room chat, as the design board "Waiting room: after the game" shows. Its result
  line ("Game over · Ann won with 512 points", or the abandoned text) has **Show result**, which
  opens the end-of-game screen again. A player who left the game (S9.2) sees the end-of-game
  screen when the game ends and gets the same room after Close. The rematch dialog appears over
  whichever of the two the player is on; when the rematch starts, everyone in it sees the new
  game.
- **Why:** S11.4 says the room shows the result after a game, which only makes sense if that is
  where a player goes after the end screen; one place for the result is simpler than two.
- **Implemented:** `harness/spec/screens.md` S11.4; phase 22.

## Q87. Whose state version does a vote closing at its deadline raise?

- **Phase:** 22, item 2 (M7.3, M9.4).
- **Question:** Q84 says calling and answering raise only the actor's state version, but not
  what happens when the minute runs out. The room raised the version of every seat in a logged
  system action, so the logged `close_vote` (seat = the caller) raised the caller's. In the
  market phase, where every change raises everyone's version, a vote call or answer would also
  have raised everyone's.
- **Options:** raise the caller's version; raise everyone's; raise nobody's unless the game ends.
- **Solution:** A vote closing at its deadline is nobody's action, so it raises no version by
  itself; the others still get the new view (no vote open). A vote that passes ends the game, a
  phase change, which raises everyone's. Vote calls and answers raise only the actor's version
  in every phase, the market phase included. The answer intent is `{ type: "vote", vote: "yes" |
  "no" }`, the step format of `HARNESS.md`.
- **Why:** M9.4 moves a version only with the player's own actions and changes everyone must see
  before acting again (phase changes, reveals); a failed vote changes neither, and raising the
  caller's version would make the caller's next move `stale_state` for no reason.
- **Implemented:** `src/server/room/withTimeOutsApplied.ts`, `acceptAction.ts`,
  `isChangeVisibleToAll.ts`; phase 22, item 2.

## Q88. What happens to the answer of a player who leaves during a vote?

- **Phase:** 22, review finding R1 (M7.5, M7.6).
- **Question:** Q84 says a player who leaves during a vote is no longer asked, but not what
  happens to an answer they already gave. The engine dropped it, so the shown count of answers
  went down by one, and everyone saw that the leaver had answered, against M7.5.
- **Options:** drop the answer and the leaver from both numbers; keep the answer in the count
  and in the result; keep the numbers shown unchanged and decide the result by the players still
  asked.
- **Solution:** The numbers shown (M7.5) do not change when a player leaves: "answered" counts
  every answer given, a leaver's included, and "of" counts every player asked when the vote was
  called. The vote no longer waits for the leaver, and their answer, if any, no longer counts
  towards the result: the vote closes when every player still in the game and asked has
  answered, and passes if all of them said yes. Written into M7.6.
- **Why:** leaving is seen by everyone, so any change of the numbers at that moment would tell
  whether the leaver had answered; unchanged numbers tell nothing. M7.4 decides by the players
  still in the game.
- **Implemented:** `harness/spec/multiplayer.md` M7.6, scenario `connections-and-leaving` "a player
  who leaves after answering a vote leaves the count shown unchanged"; `src/rules/closeVote.ts`,
  `closeVoteIfAllAnswered.ts`, `seatsStillAsked.ts`; phase 22, review fixes.

## Q89. What happens to a vote when its caller leaves?

- **Phase:** 22, review finding R2 (M7.6).
- **Question:** Neither M7 nor Q84 says what happens when the player who called a vote leaves
  the game while it is open. The engine kept the vote open, and it could still pass.
- **Options:** close the vote as failed; keep it open with the caller's yes no longer needed.
- **Solution:** The vote goes on and passes if every player still asked votes yes; its deadline
  is unchanged and closes it as usual. Written into M7.6.
- **Why:** the same as any other leaver (Q88): the vote is decided by the players still in the
  game, and closing it would take the choice from them for no reason.
- **Implemented:** `harness/spec/multiplayer.md` M7.6, scenario `connections-and-leaving` "a vote
  goes on when the player who called it leaves", tests in `src/rules/abandonVote.test.ts`; phase
  22, review fixes.

## Q90. How are passwords hashed within the free plan (O4)?

- **Phase:** 23, starter (O4, `accounts.md` open question 2, A1.5, A1.6).
- **Question:** phase 04 measured PBKDF2-SHA256 on the live Free plan Worker: 10,000 iterations
  3-4 ms of CPU, 50,000 8-16 ms, 100,000 15-19 ms, and the runtime refuses more than 100,000.
  OWASP asks for 600,000. B11 allows 10 ms of CPU per request (99th percentile). Which hash, and
  how strong?
- **Options:** (a) PBKDF2-SHA256 through Web Crypto at a count that fits B11; (b) PBKDF2 at
  100,000, over B11 on every login and signup; (c) a hash in WebAssembly (bcrypt, Argon2), slower
  per millisecond than the built-in one and limited by the same 10 ms; (d) no passwords, an
  emailed sign-in link, which changes A1.5 and A1.6 and needs the email provider (O3, phase 24).
- **Solution:** (a). PBKDF2-SHA256 from Web Crypto with 20,000 iterations (about 6-8 ms from the
  measurement), a random 16-byte salt per password from `crypto.getRandomValues`, and a 32-byte
  result. The stored value names the method and the count with the salt and the hash
  (`pbkdf2-sha256$20000$<salt>$<hash>`, base64), so the count can be raised later without a
  format change. Every login computes exactly one hash: a login for an unknown username or email
  hashes against a fixed dummy value, so the reply time does not show whether the account
  exists, and a login refused for a missing human check (A1.13) computes none. The derived bytes
  are compared in constant time. No server-side pepper: it would need a new secret that only the
  owner can set.
- **Why:** it keeps the spec's login method (passwords, A1.5) and fits B11 with room for the rest
  of the request. Against online guessing the human check after 3 failures (A1.13) is the
  protection; the iteration count only matters if the D1 database itself leaks, where 20,000 is
  about 30 times cheaper to attack than OWASP's 600,000. That weakness is accepted for the Free
  plan and named here for the owner's review.
- **Implemented:** `decisions.md` O4 moved to Decided as D29; `accounts.md` open question 2
  removed; phase 23, item 1.
- **Kept after the phase review (R1):** 20,000 iterations stay. The local measurement that went
  over B11 measured the build computer's load (Q102); lowering the count to pass it would have
  meant about 5,000 iterations, four times weaker. B11 now counts the hash at 400 ns per
  iteration from the live measurements: 8 ms.
- **Measured live after the phase 23 merge (2026-11-10):** `wrangler tail` on the deployed
  Worker, 109 calls of `POST /api/logins` with unknown usernames (each computes one 20,000-
  iteration hash against the dummy value, then writes one `unknown_login_failures` row): CPU
  time per request 6-14 ms, median 8 ms, 95th percentile 10 ms, 99th percentile 13 ms; all 109
  ended `ok`, none was stopped for CPU. Six `POST /api/signups` refused for the human check
  (no hash) took 1-3 ms, so a request's work besides the hash is about 1 ms. A signup that
  passes the human check could not be sent from a script (Turnstile needs a browser); it
  computes the same one 20,000-iteration hash as a login. Per iteration that is about 350 ns at
  the median and 650-700 ns at the 99th percentile and the highest call, above the 400 ns B11
  assumes: at 20,000 iterations a login's 99th percentile is over B11's 10 ms. The figure is
  replaced in Q102; the fix (fewer iterations, or B11 changed on the record) is open, see
  phase 23's Release note.
- **Changed after the live measurement (2026-11-10):** 10,000 iterations
  (`PASSWORD_HASHING`, `DUMMY_PASSWORD_HASH` `pbkdf2-sha256$10000$...`). B11 stays at 10 ms:
  it is the Free plan's CPU limit per request, not a choice. Expected live CPU at 700 ns per
  iteration: 7 ms of hash plus about 1 ms of other work, about 8 ms for the slowest login, and
  6-7 ms at the 99th percentile (650 ns). 12,000 was considered: 8.4 ms of hash, about 9.4 ms
  with the other work, under 1 ms of margin, which the live spread (6-14 ms at one count) can
  eat; 10,000 leaves about 2 ms. Strength, for the owner: against a leaked database each
  guess costs half of what it did at 20,000, and about 60 times less than OWASP's 600,000 (it
  was about 30 times less); a weak password falls quickly either way, a strong one stays out
  of reach. Online guessing is unchanged: the human check after 3 failures (A1.13) is the
  protection there. Hashes already stored at 20,000 keep their own count: `verifyPassword`
  reads the count from the stored value, so those accounts still log in, at about 14 ms of CPU
  per login (none was stopped live at 20,000). They are not rehashed at login (that would add
  a second hash and a write to every such login); they are only the accounts made since the
  phase 23 deploy, and under D1 the data may be wiped if they become a problem. Raising the
  count later works the same way: new hashes take the new count, old ones keep theirs.
- **Measured live at 10,000 iterations (2026-11-10):** the live Worker serves version
  `1ef35734` (`wrangler deployments status` 100%, and every tail event names it; the 16 events
  of 2026-11-09 that named `4df00578` were not counted). `wrangler tail` caught all 100 calls of
  `POST /api/logins` with unknown usernames (one 10,000-iteration hash against the dummy value
  each, all `400 login_failed`, all ended `ok`), sent one every 1.5 s: CPU time per request
  2-9 ms, median 5 ms, 99th percentile 8 ms, highest 9 ms. Within B11's 10 ms. By Q102's method
  (the highest call over the iteration count, the other work included) that is 900 ns per
  iteration, so `LIVE_PASSWORD_HASH_CPU` is now 900 ns: B11's hash half is 9 ms of 10, and a
  count above about 11,000 fails it.

## Q91. Failed logins: what counts, and when does the human check end (A1.13)?

- **Phase:** 23, starter (A1.13).
- **Question:** A1.13 does not say whether the "next 15 minutes" run from the third failure or
  from each later one, whether a successful login clears the failures, whether an attempt refused
  for a missing human check counts, or what a login for an unknown account says.
- **Options:** the 15 minutes from the third failure only, or from the latest failure; clear on
  success, or let the failures expire; count refused attempts, or not.
- **Solution:** the 15 minutes run from the latest failed attempt; a successful login clears the
  failures; an attempt refused for a missing human check is not a failed attempt (no password was
  checked); a login for an unknown username or email fails with the same `login_failed` as a wrong
  password. Written into A1.5 and A1.13, with the scenarios `accounts` "a successful login clears
  the failed logins", "the human check after failed logins ends 15 minutes after the latest
  failed attempt" and "a login with an unknown username fails like a wrong password".
- **Why:** "every further attempt" needing the check is meant to slow a guesser, so each new
  failure keeps the check on; once the right password is given there is nothing left to slow;
  and the same reply for an unknown account keeps usernames and addresses from being probed.
- **Implemented:** `accounts.md` A1.5, A1.13; phase 23, item 1.

## Q92. Which account does an email address log in to (A1.5, A1.11)?

- **Phase:** 23, starter (A1.5).
- **Question:** an unconfirmed address reserves nothing (A1.11), so several accounts can hold the
  same address, and no address can be confirmed before phase 24. Which account does a login by
  email find?
- **Options:** the account that entered the address first; the one that entered it last; try the
  password on every account with the address (one hash each, over B11).
- **Solution:** the account that has confirmed the address; while none has, the account that
  entered it first. Addresses are compared as A1.11 says. Written into A1.5, with the scenario
  `accounts` "logging in by email finds the account that entered the unconfirmed address first".
- **Why:** a later signup with someone else's address cannot take over their email login, and
  the username always works as well.
- **Implemented:** `accounts.md` A1.5; phase 23, item 1.

## Q93. What is a valid email address (A1.3)?

- **Phase:** 23, starter (A1.3).
- **Question:** signup asks for an email address, but the spec does not say which ones are
  refused.
- **Options:** a full address grammar; a short shape check; none until confirmation.
- **Solution:** at most 254 characters, no spaces, exactly one "@" with something before it, and a
  dot in the part after it with something on both sides; otherwise `email_invalid`. Written into
  A1.3, with the scenario `accounts` "rejects an email address without an at sign".
- **Why:** confirmation (A1.4) is the real test of an address; the shape check only catches typing
  mistakes before they cost an email.
- **Implemented:** `accounts.md` A1.3; phase 23, item 2.

## Q94. Signing up and logging in when not logged in, or as a guest (A1.3, A1.5, S10.1)?

- **Phase:** 23, starter (A1.3, A1.5, S10.1, S12.7).
- **Question:** S10.1 shows **Sign up** to players who are not logged in, but A1.3 describes signup
  only from a guest account. And a guest who logs in to another account would lose the guest
  account without the warning of A1.14.
- **Options:** signup when logged out first makes a guest, then signs up; or it makes a registered
  account at once. Log in offered to guests too (silently dropping the guest), or only to players
  who are not logged in.
- **Solution:** signup when not logged in makes the account a registered user at once, with the
  username prefilled as in A1.2 and one human check. Log in is offered only to players who are not
  logged in (as S10.1 and S12.7 already show); a guest who wants another account logs out first,
  with the warning. Written into A1.3 and A1.5, with the scenario `accounts` "a player who is not
  logged in signs up as a registered user at once".
- **Why:** one form and one human check is what S10.1's button promises, and nobody loses a guest
  account without the warning.
- **Implemented:** `accounts.md` A1.3, A1.5; phase 23, items 2 and 4.

## Q95. What does logging out do in a room, and in other browsers (A1.14, M6.10)?

- **Phase:** 23, starter (A1.14, M6.10).
- **Question:** M6.10 says a guest who logs out during a game leaves it. The spec does not say what
  happens to a guest waiting in a room, to a registered user's seat, or to the same account's
  logins in other browsers.
- **Options:** for a waiting guest, leave the room or stay until the room notices; for a
  registered user, leave or keep the seat; end every login of the account or only this one.
- **Solution:** a guest who logs out leaves the room they are in, waiting or playing. A registered
  user who logs out keeps their seat and place, as if their connection closed (M5, M6 apply as
  usual), and can log back in. Logging out ends the login of that browser only. Written into
  A1.14, with the scenarios `accounts` "logging out ends the login only in that browser", "a guest
  who logs out while waiting in a room leaves it" and `connections-and-leaving` "a registered user
  who logs out during a game keeps their seat".
- **Why:** a guest who logged out can never come back, so keeping their place would only make the
  others wait; a registered user can come back, which is what the disconnect rules are for.
- **Implemented:** `accounts.md` A1.14; phase 23, items 1 and 2.
- **Changed after the phase review (R5):** the scenario "a registered user who logs out during a
  game keeps their seat" also checks that the logged-out connection is closed (`connected:
  false`). The real room logout is tested in `tools/route-tests/roomLogout.test.ts`.

## Q96. When does the 7-day username wait start, and does a change rename a player in a room (A2.4)?

- **Phase:** 23, starter (A2.4, A3.5).
- **Question:** A2.4 does not say whether the name chosen when an account is made starts the
  7 days, nor whether a change shows in a room the player is in. Room records, seats, chat lines
  and mutes hold names as they were at joining.
- **Options:** the 7 days from account creation, or from the last change only. Rename the player
  in their current room (a room and a lobby write, and every place a room keeps the name), or
  keep the old name there until they join another room.
- **Solution:** the 7 days run from the last change only; making the account and signing up do
  not start them. Inside the room the player is in, they keep the name they joined with; the new
  name shows everywhere else at once and in every room they join afterwards. Game records show
  current usernames anyway (A3.5, phase 25). Written into A2.4, with the scenarios `accounts` "a
  new account can change its username at once" and "a username change keeps the old name inside
  the room the player is in".
- **Why:** renaming inside a running room touches the seat, the player list, chat and mutes for a
  change that happens at most once a week; the room is the one place where a stable name helps the
  other players.
- **Implemented:** `accounts.md` A2.4; phase 23, item 3.

## Q97. How are failed logins stored, and are logins for unknown accounts counted (A1.5, A1.13)?

- **Phase:** 23, item 1b (A1.5, A1.13).
- **Question:** A1.13 keeps the human check on for 15 minutes after the latest failed attempt,
  so once it is on, failures more than 15 minutes apart keep it on. The times of the last few
  failures alone cannot tell whether it is on. And failures can be counted only on an account
  that exists; a name or address that no account has has no row to count on, so after 3 failures
  an existing account asks for the human check and an unknown one does not, which A1.5's "whether
  the account exists or not" does not mention.
- **Options:** keep every failure of a run; keep the last 3 failure times plus the time the
  human check ends; for unknown names, count failures in a new table keyed by name or address
  (a row per failure and rows that never belong to anyone), or not count them.
- **Solution:** `players.failed_logins_ms` keeps at most the last 3 failure times within
  15 minutes of each other, and a new column `login_check_until_ms` (migration
  `0008_login_check_until.sql`) holds when the human check ends: a failure that makes 3 within
  15 minutes, or that comes while the check is on, sets it to 15 minutes after that failure. A
  successful login clears both. Logins for an unknown username or address are not counted and
  never ask for the human check; written into A1.13. Two failures at the same moment may count
  as one (read, then write).
- **Why:** two small values give A1.13 exactly with one row written per failure (B18).
  Usernames are public anyway (players online, rooms); for an email address, the difference
  shows only after 3 failed attempts that some registered account entered it, and counting
  unknown names would cost rows for names nobody has.
- **Implemented:** `accounts.md` A1.13; phase 23, item 1b.
- **Changed after the phase review (R2):** not counting unknown names let anyone find out
  whether an email address has a registered account (3 wrong passwords, then the 4th asks for
  the human check or not), against A1.5 ("whether the account exists or not"), A1.3 (signup
  looks the same for a used address) and Q91's reason. Failures for a username or address that
  no registered account has are now counted the same way, in a new D1 table
  `unknown_login_failures` (migration `0009_unknown_login_failures.sql`): one row per login
  key, keyed by the SHA-256 of the key as `loginLookupOf` makes it (`name:` or `email:` and
  the compared form), so no address is stored readably; the same `failed_logins_ms` and
  `login_check_until_ms` as `players`, and `forget_after_ms`, 15 minutes after the latest
  failure, when the row stops mattering. The same `failedLoginsAfter` and
  `isHumanCheckNeededToLogIn` decide it. A failed login for an unknown key writes one row (an
  insert or replace, no secondary index), as a wrong password does; the daily cron deletes the
  rows past `forget_after_ms`, at most one delete per key. B18's busy day adds 20 such failed
  logins at 2 rows each (the write and its share of the delete), 40 rows: 3,066 of 5,000. A key that later
  becomes a registered account's name or address is counted on the account from then on, and
  its old row is forgotten by the cron. The key hash has no secret, so someone holding the
  database could test guessed addresses against it; only addresses typed into a failed login
  are there, for at most a day. A1.13 says so, with the scenarios `accounts` "after 3 failed
  logins with an unknown username further logins need the human check" and "... with an unknown
  email address ...".

## Q98. Signup's messages, and who can sign up with which login (A1.3, S10.9)?

- **Phase:** 23, item 2 (A1.3, A1.6, A1.11, S10.9).
- **Question:** `email_invalid` and `password_invalid` had no message in S10.9's table. The spec
  does not say what signup does for a browser whose login is unknown or already belongs to a
  registered user, nor what a guest stores when the address entered is already confirmed on
  another account (A1.11: the address belongs to that account).
- **Options:** for the login: treat it as not logged in and make a new account, or refuse it. For
  a confirmed address: store it unconfirmed anyway, or store no address.
- **Solution:** messages "Enter a whole email address, such as name@example.com." and "Use 8 to 64
  characters for the password." added to S10.9. A signup that sends a login refuses it with
  `invalid_token` unless the login is a guest's; only a signup without a login makes a new
  account (Q94). An address already confirmed on another account is not stored (the account has
  no email, as A1.11's removal leaves it and scenario `accounts` "signing up with an address
  already confirmed elsewhere looks the same" expects), and the answer looks the same.
- **Why:** a stale or registered login sent to signup is a client mistake, and silently making a
  second account would lose the first; storing an address that another account owns would let
  it log in by that address (Q92) and break A1.11.
- **Implemented:** `screens.md` S10.9; phase 23, item 2.
- **Changed after the phase review (R6):** a guest login unused for longer than A1.14 allows is
  refused too (`invalid_token`), with the same expiry check as every other route
  (`loginStateOf`); signup had accepted it.

## Q99. A username change's message, check order and a change to the same name (A2.4, S10.9)?

- **Phase:** 23, item 3 (A2.4, S10.9).
- **Question:** `username_change_too_soon` had no message in S10.9's table. A2.4 does not say in
  which order a change is checked, nor what a change to the current name, or to it with other
  capital letters, does.
- **Options:** for the same name: refuse it, accept it and start the 7 days, or accept it without
  changing anything. For capitals only: treat it as the same name, or as a change.
- **Solution:** message "You can change your username once every 7 days." added to S10.9. A
  change is checked as the name itself (`username_invalid`, `username_reserved`), then the 7 days,
  then taken (the player's own name, in any capitals, is not taken for them). The same name
  exactly is accepted and changes nothing, so the 7 days do not start; a name that differs only
  in capitals is a change (A2.4 says "another username"). Written into A2.4. The route answers
  the `GuestResponse` shape with the player's own token, so the client stores the new name as it
  stores a login.
- **Why:** checking the name before the wait gives the more useful message first, and the wait
  before the taken check saves a D1 read; capitals are what a player sees, so changing them is a
  real change, while sending the same name is a no-op that should not cost a week.
- **Implemented:** `accounts.md` A2.4, `screens.md` S10.9; phase 23, item 3.

## Q100. The user menu's details: match history, the 7-day date, the name in a room and a failed logout (S12.5, S12.7, A1.14, A2.4)?

- **Phase:** 23, item 4b (S2.3, S12.5, S12.6, S12.7).
- **Question:** S12.7 lists My match history, whose screen comes only in phase 25. S12.5 shows
  the next allowed username change date, which no answer carried. After a guest signs up or
  renames in a room, the client knew only the new name, while the room keeps the old one (Q96).
  Nothing says what the client does when a logout gets no answer, or when another tab of the
  same browser logs out.
- **Options:** leave My match history out or show it disabled; compute the date in the client or
  have the server send it; keep the old name in the stored session or have the room say it.
- **Solution:** My match history is shown disabled until phase 25 (the menu keeps the design's
  shape). A read-only `POST /api/account` answers the username and, during the 7 days, when it
  was changed and when it can be changed again (no rows written); the settings dialog asks it
  when it opens and after a change. Each room view now carries `myName`, the player's own name
  in that room, and the room screens use it (protocol version 9); the user box shows the account
  name. A logout that gets no answer keeps the player logged in with "Could not log out. Try
  again in a moment."; a room socket closed for a logout (close code 4401) takes that tab to the
  lobby logged out with "You logged out." A registered user's Log out acts at once; a guest's
  shows the S12.6 warning first, from the menu and from account settings.
- **Why:** the server decides the 7 days (A2.4) and the room decides its names (Q96), so the
  client only shows them; forgetting a login the server still holds would leave a guest's seat
  in a game without a way back.
- **Implemented:** phase 23, item 4b.
- **Changed after the phase review (R7):** the logout route first logs the player out of their
  rooms and deletes the login last; if a room cannot be reached, the login is kept and the route
  answers 503, which the client shows as the failed logout above, so a guest is never logged out
  while their seat stays in a room they can no longer leave. Trying again logs out of the rooms
  still left.
- **Changed after the phase review (R9):** the session answer (`POST /api/session`, asked when
  a page opens) also says whether the account is a guest, and the client takes the account kind
  and username from it, so a tab opened after a signup or rename elsewhere shows the right menus
  without trusting what the browser stored. A tab that stays open during a signup in another tab
  learns it at its next page load.

## Q101. How can the browser tests send more than 2,000 chat messages a day on one local server?

- **Phase:** 23, item 4b follow-up (A9.6; the same problem as Q69 for chat).
- **Question:** each room takes the site's chat quota from the lobby in blocks of 20, and the
  local Durable Object storage keeps the site count between runs, so a day of local browser test
  runs uses up A9.6's 2,000 messages. From then on every room's first message that needs a block
  is refused with `site_daily_cap`, and `e2e/chat.spec.ts` fails where a message never shows.
  This looked like a regression of item 4b, which changed nothing in chat.
- **Options:** (a) a test route that resets the site chat count; (b) an optional variable that
  only local and CI servers set, raising the site chat limit, as Q69 does for games.
- **Solution:** (b), for the reasons of Q69. The limit is the spec's 2,000 in code
  (`siteChatLimitOf`); a server whose environment sets `TEST_SITE_CHAT_MESSAGES_PER_DAY` uses that
  number instead. Only `.dev.vars` sets it (locally and in the `.dev.vars` step of `check.yml` and
  `deploy.yml`, to 1000000), never `wrangler.jsonc` or the live site. The cap itself stays proved
  by the scenarios and unit tests with the real numbers (the harness runner uses the spec's
  limit). `siteGameLimitOf` and `siteChatLimitOf` share `configuredLimitOf`.
- **Implemented:** phase 23, item 4b follow-up.

## Q102. How are logins and signups measured for B11 and B18, and how are the routes' logs checked?

- **Phase:** 23, item 4c (B11, B18, exit criteria).
- **Question:** B11 is the 99th percentile over every handled message, measured as wall-clock
  time in the room scenarios. A login or signup spends almost all its CPU time in one password
  hash (D29, about 7-8 ms), but there are only a handful of such requests among thousands of
  room messages, so mixing them in would hide a slow hash below the 99th percentile, and wall
  time under the load of `npm run check` adds time the Worker would not bill. B18 does not say
  how many account actions a busy day has. The routes run only in the Workers runtime, so a test
  of their logs needs that runtime.
- **Options:** for B11, (a) add the hash times to the room messages' percentile, or (b) measure
  them as their own group and take the larger of the two 99th percentiles; wall-clock or CPU
  time. For the logs, (a) a browser test against `wrangler dev`, whose output a test cannot
  read, or (b) wrangler's own test harness (`createTestHarness`, wrangler 4.150.0, already a
  dependency), which runs the Worker with its Durable Objects and a fresh D1 and returns the
  Worker's console output.
- **Solution:** B11 (b): the harness hashes 5 batches of 10 signups (`hashPassword`) and 10
  logins (`verifyPassword`) and records each batch's process CPU time per hash (Windows counts
  CPU time in 15 ms steps, hence batches); B11 is the larger of the room messages' 99th
  percentile and the hashes' 99th percentile. Measured: 8 ms. B18: the busy day adds 20 guest
  signups (3 rows: the account and its name and email index entries), 10 signups when not
  logged in (5: account, name and email index, login and its index), 40 logins (2: the login
  and its index), 10 logins after failed ones (3, clearing the failures), 20 failed logins (1),
  20 logouts (2: the login and its index) and 10 username changes (2: account and name index),
  300 rows in all, counted as D1 counts index entries; the day measures 3,026 of 5,000. Reads
  are not counted here (B16 counts room, lobby and token reads only). Logs: (b),
  `tools/route-tests/accountRoutes.test.ts` runs guest, signup, login by name, a failed login,
  login by email, username change, account and logout through the real routes and fails if
  any console line contains a token, the password or the email address. It sends the human
  check to Turnstile with Cloudflare's always-passing test secret, so it needs the network,
  like the browser tests.
- **Implemented:** phase 23, item 4c.
- **Changed after the phase review (R1):** the hash half of B11 went over its limit inside
  `npm run check` (20 and 11 of 10 ms; 8 alone), because the method measured this computer's
  load, not the Worker. Measured on the build computer (8 logical CPUs, Node, process CPU time
  per hash, batches of 20): 20,000 iterations 7.5-7.9 ms idle and 14.9-17.2 ms with the other
  CPUs busy; 10,000 iterations 3.8-4.1 ms idle and 6.3-9.4 ms busy; 100,000 iterations 37.5-39.9
  ms idle, against 15-19 ms on the live Free plan Worker (phase 04). Node here is about twice as
  slow as the Worker when idle and four times when busy, so the number judged the machine, and
  passing it under load would need about 5,000 iterations, four times weaker, for no saving on
  the Worker. New method: the hash half is the iteration count (`PASSWORD_HASHING`) times
  400 ns, the highest CPU time per iteration among the live measurements (10,000 iterations at
  4 ms; 100,000 at 19 ms is 190 ns), times one hash per login or signup: 8 ms at 20,000, and a
  count above 25,000 fails B11. The report shows both halves: the room messages' 99th percentile
  and the password hash. The releaser measures the live `/api/logins` and `/api/signups` CPU
  time (`wrangler tail`) and records it in Q90; a live cost per iteration above 400 ns replaces
  the figure (`tools/harness-runner/LIVE_PASSWORD_HASH_CPU.ts`). `budgets.yaml` B11's
  "measured" says so.
- **Live figure after the merge (2026-11-10):** the live measurement (Q90) gives 700 ns per
  iteration by this method (the highest call, 14 ms for 20,000 iterations; the 99th percentile
  13 ms is 650 ns). This replaces the 400 ns figure. With it, the hash half of B11 is 14 ms at
  20,000 iterations, over the 10 ms limit, and a count above about 14,000 fails B11.
  `LIVE_PASSWORD_HASH_CPU` still says 400 ns: changing it alone would turn `npm run check`
  red, so it changes together with the fix (phase 23, Release note).
- **Fixed (2026-11-10):** `LIVE_PASSWORD_HASH_CPU` is 700 ns and the count is 10,000 (Q90,
  D29), so B11's password-hash half is 7 ms of 10; a count above about 14,000 fails it. The
  harness text is unchanged: `budgets.yaml` B11 already counts the iteration count times the
  live cost per iteration, and names neither figure. The releaser measures the live login CPU
  again after the next deploy and records it in Q90.
- **Measured at 10,000 (2026-11-10):** the highest live login took 9 ms (Q90), 900 ns per
  iteration by this method, above 700 ns, so `LIVE_PASSWORD_HASH_CPU` is 900 ns and B11's
  password-hash half is 9 ms of 10. The figure is higher than at 20,000 because the about 1 ms
  of other work is a larger share of a shorter request; the method keeps counting it, which errs
  on the safe side.

## Q103. Can a freed username join a room where the old holder still shows it (A2.4, M1.6)?

- **Phase:** 23, phase review (R3).
- **Question:** inside a room a player keeps the name they joined with (A2.4, Q96). After they
  change their username, the old name is free, and another player who takes it could join the
  same waiting room, so two players in it would show the same name: in the player list, in
  "accepted so far", in chat, and for mutes, which name the muted player. The spec does not say
  whether that join is allowed.
- **Options:** (a) allow it and tell the two apart some other way (a mark next to one name); (b)
  rename the player in the room after all; (c) refuse the join while a player in the room shows
  the same name, ignoring capital letters (A2.2).
- **Solution:** (c). A room refuses a join with `username_in_room` while a player in it has the
  same name as the joining player's, capital letters ignored; the message is "A player in this
  room has the same username as you. Join another room." It is checked after the room's other
  join checks. Written into M1.6, A2.4, S10.6, S10.9 and the reason codes in `HARNESS.md`, with
  the scenario `accounts` "a freed username cannot join the room where the old holder still
  shows it". Separately, the accept dialog no longer decides "Accepted" by comparing names: the
  room view says whether the viewing player has accepted (`hasAccepted`, protocol version 10).
- **Why:** it can only happen in the minutes after a rename, against the one room the renamed
  player is in, so refusing costs almost nothing, while two equal names in one room would make
  "accepted so far", chat and mutes ambiguous. (b) was turned down in Q96.
- **Implemented:** phase 23, finding R3.

## Q104. Which email provider sends the account emails (O3)?

- **Phase:** 24, starter (O3, `accounts.md` open question 1, A1.3, A1.4, A1.7, A1.9, A1.10).
- **Question:** confirmation, email-change, reset and "already in use" emails need an outside
  service with a secret key. Which one fits A1.9 and the Cloudflare Free plan?
- **Need:** A1.9 allows 3 emails per account and per address a day. The busy day of B18 has 30
  signups; with resends, resets and address changes a busy day sends about 50 emails, so a free
  tier of 100 a day is enough. Sending must be a plain HTTPS call from the Worker (one
  subrequest; the Free plan allows 50 per request).
- **Options (checked 2026-11-10):**
  - (a) **Cloudflare Email Service**: sending to any address needs the Workers Paid plan
    (https://developers.cloudflare.com/email-service/platform/pricing/: "Workers Free: outbound
    sending is not available"; only sends to the account's own verified addresses are free). Not
    allowed (`rules/cloudflare.md`, Free-plan features only).
  - (b) **MailChannels** for Workers: its free Workers service has ended (end-of-life notice on
    support.mailchannels.com); the remaining free tier needs an account and a domain like the
    others.
  - (c) **Resend**: free plan 3,000 emails a month, at most 100 a day, one sending domain; JSON
    HTTPS API (`POST https://api.resend.com/emails`, bearer key), no SDK needed. Needs a domain
    the owner controls, verified with DNS records (SPF and DKIM).
  - (d) **Brevo**: free plan about 300 emails a day, HTTPS API; can send from a single verified
    sender address without a domain of one's own, but then mail is not signed for the sender's
    domain and is likely to land in spam or be refused under Gmail's and Yahoo's sender rules.
  - (e) Others (Mailjet, MailerSend, SMTP2GO, Postmark): similar or smaller free tiers, all
    needing a verified domain; nothing better than (c) for this use.
- **Solution:** (c) Resend, called with `fetch` from `src/server/`, so no npm dependency and
  nothing in the client bundle. The sender sits behind a small interface with a test double (an
  outbox that the scenarios, unit tests, `wrangler dev` and the browser tests read), so all
  behaviour is built and tested without the key; only the live send needs it. The key is the
  secret `RESEND_API_KEY` (`wrangler secret put`); the sender address and the privacy contact
  address are plain `vars` in `wrangler.jsonc`. To stay inside Resend's 100 a day and 3,000 a
  month (90 x 31 = 2,790), the site sends at most 90 emails a day (A9.6, `site_daily_cap`). If
  the owner prefers not to have a domain, (d) Brevo fits behind the same interface with one
  changed sender file, at the cost of delivery.
- **Why:** the only free option with good delivery and a plain HTTPS API; its daily cap is above
  the busy day's need, and the site-wide cap keeps a burst of signups from going over it.
- **Owner's choice (2026-11-10), replaces the solution above:** the owner has no domain and
  wants to stay at $0, so the provider is (d) **Brevo** (free plan, about 300 emails a day),
  sending from a Gmail address the owner made for the game, `mlaw.support@gmail.com`, verified
  as a Brevo sender. `POST https://api.brevo.com/v3/smtp/email` with the header `api-key` and
  JSON `{ sender: { name, email }, to: [{ email }], subject, textContent }`; success is 201
  (format checked against Brevo's API reference, developers.brevo.com/reference/sendtransacemail,
  2026-11-10). Still plain `fetch`, no npm package. The secret is `BREVO_API_KEY` (set by the
  owner on the live Worker); `EMAIL_FROM` (the sender address, sender name "MarketLaw") and
  `PRIVACY_CONTACT` are both `mlaw.support@gmail.com` in `wrangler.jsonc` `vars`. The owner
  has turned off Brevo's IP blocking (Authorised IPs), which Workers' changing IP addresses
  would trip. The site cap of 90 a day (A9.6) stays: well under Brevo's 300, and the scenarios
  and budgets are built on it. Known drawbacks: mail from a Gmail address sent through Brevo is
  not signed for gmail.com, so it may land in spam or be refused by some receivers; and
  free-plan emails carry a Brevo footer. Because of the spam risk the spec now says the notices
  after signup and after Forgot password tell the player to look in the spam folder (A1.4,
  S12.3, S12.4; the client already said so). `accounts.md` A12.1 names no provider ("the
  email service"), so no spec text named Resend.
- **Needs the owner:** nothing more; the live test send is done after release (phase 24, item
  10). **Status: decided** (the live send is checked at release).
- **Implemented:** `decisions.md` O3 moved to Decided as D30; `accounts.md` open question 1
  removed, A9.6's email cap; phase 24, items 1, 9 and 10. Item 9 (2026-11-10), changed to Brevo
  the same day: `src/server/email/brevoSenderOf.ts` posts with plain `fetch`, no npm package; it
  is used only when both `BREVO_API_KEY` and `EMAIL_FROM` are set, otherwise `emailSenderOf`
  keeps the test outbox (which fails every send without `TEST_ROOM_SECRET`). Spec: A1.4, S12.3,
  S12.4 (spam folder), in its own `HARNESS:` commit. Released 2026-11-10 (Worker version
  `72a911d2`, secret `BREVO_API_KEY` present); the live test send was left to the owner,
  since signing up needs a human check an automated browser should not pass (phase 24, item 10).

## Q105. What does the privacy notice say, and where is it (O7)?

- **Phase:** 24, starter (O7).
- **Question:** O7 asks for a short notice of what is stored, why, how long, and how to delete
  it, drafted into the spec.
- **Options:** a rule in `accounts.md` with the notice's content, shown as a page (S12.8); or the
  text only in the client, outside the spec.
- **Solution:** a new section A12 in `accounts.md` gives the notice's parts and facts: who runs
  the site (a contact address, set by the owner as a `wrangler.jsonc` var), what is stored and
  why (account, email, password hash, logins as one-way codes, failed logins, daily counts with
  the address only as a one-way code, chat, replays, game records and ratings), how long (from
  A1.1, A1.14, A1.13, M4.3, M8.2, and a new retention of 2 days for daily counts), who else
  handles data (Cloudflare and Turnstile see the IP address, which MarketLaw does not store;
  Workers logs are kept 3 days on the Free plan,
  https://developers.cloudflare.com/workers/observability/logs/workers-logs/; the email service
  sees the address), and the choices (account settings, deleting, the contact address). S12.8 is
  the page, open to everyone, linked from signup and account settings (S12.5). A12.1 is page
  text, so a coverage exception (`instead`: a browser test finds each part by its heading)
  replaces a scenario.
- **Why:** the spec is the owner's view; the notice states facts the spec already fixes, so it
  stays true as long as the spec does. The legal wording is the owner's to review with version 1.
- **Implemented:** `accounts.md` A12.1; `screens.md` S12.5, S12.8; `coverage-exceptions.yaml`;
  `decisions.md` O7 moved to Decided as D31; phase 24, item 7.

## Q106. Email links, resending, limits and failed sends (A1.4, A1.7, A1.9, A1.10, A9.6)?

- **Phase:** 24, starter.
- **Question:** the spec does not say how long links work, whether older links still work,
  whether **Send it again** needs the human check, what counts toward A1.9, what a reset does to
  other logins, what a reset for an address nobody has confirmed answers, what happens when the
  new address of a change is confirmed elsewhere, or what happens when an email cannot be sent.
- **Options:** for expiry, 24 hours to 7 days for confirmation and 15 minutes to 24 hours for
  resets; older links valid until expiry, or replaced; resending with or without the human
  check; failed sends refusing the action or not.
- **Solution:** new rule A1.16: links work once; confirmation (also of a new address) 24 hours,
  reset 1 hour; a newer link of the same kind replaces the older; an expired, replaced or used
  link, or one whose address another account has confirmed, gives `link_expired`. A1.4: Send it
  again without the human check, under A1.9; a signup whose email cannot be sent still succeeds.
  A1.7: an address nobody has confirmed gives `email_not_confirmed` whether or not an account
  entered it; setting a new password ends every login of the account, clears failed logins and
  logs the player in in that browser. A1.9: "already in use" emails count; addresses compared as
  in A1.11; refused actions change nothing; failed sends do not count; per-address counts survive
  deleting the account (kept as a one-way code for 2 days, A12.1). A9.6: at most 90 emails a day
  site-wide (Q104), `site_daily_cap`. A1.10: a newer change replaces a pending one; a new address
  confirmed elsewhere looks the same and gets the "already in use" email. New messages in
  `screens.md`'s table: `email_not_confirmed`, `email_limit_reached`, `password_wrong`,
  `link_expired`, `not_registered`. Scenarios `accounts` #43 "a confirmation link no longer works
  after 24 hours", #44 "a reset link sets a new password" and #46 "at most 90 emails a day are
  sent on the whole site"; `HARNESS.md` gains `set_new_password`, `site_counts_today.emails` and
  the codes `password_wrong` and `link_expired`.
- **Why:** short reset links limit the window of a stolen mailbox; one live link per kind keeps an
  old email from being used; the limits already stop resend abuse, so a human check there only
  adds friction; treating an unknown address like an unconfirmed one keeps unconfirmed addresses
  from being probed; ending all logins on reset is what a player resetting after a break-in needs.
- **Implemented:** `accounts.md` A1.4, A1.7, A1.9, A1.10, A1.16, A9.6; `screens.md` S12.4,
  S12.5, message table; phase 24, items 1 to 3.

## Q107. Deleting an account: password, logins, rooms and guests (A1.15, M6.10, S12.6)?

- **Phase:** 24, starter (A1.15, S12.6).
- **Question:** S12.6 asks for the password before deleting, but A1.15 says nothing about a wrong
  password, the account's other logins, its links, a waiting room or the ranked queue, or guests.
- **Options:** a wrong password reuses `login_failed` or gets its own code; guests may delete or
  not.
- **Solution:** written into A1.15: a wrong password is `password_wrong` ("Wrong password.") and
  changes nothing; deleting ends every login and every link, and leaves a waiting room and the
  ranked queue as well as a game (M6.10); guests cannot delete (`not_registered`), they are
  removed after 90 days unused (A1.1). Scenario `accounts` #45 "deleting an account needs its
  password"; `delete_account` without `password` in a scenario gives the account's own
  (`HARNESS.md`).
- **Why:** `login_failed` names username and email, which this form does not ask for; a guest
  has no password to confirm with.
- **Implemented:** `accounts.md` A1.15; `HARNESS.md`; phase 24, item 4.

## Q108. How are emails sent, counted and tested before there is a live sender (A1.4, A1.9, A9.6)?

- **Phase:** 24, item 1 (A1.3, A1.4, A1.9, A1.11, A9.6; Q104, Q106).
- **Question:** the spec and Q106 do not say in which order the limits are checked and counted
  when one signup touches D1 and the Lobby, what **Send it again** does for an account with no
  unconfirmed address (A1.3: the signup with an address confirmed elsewhere leaves the account
  without one, `accounts` #6), what the test double does on the live site before item 10, or what
  the links look like.
- **Options:** count before sending and give back on failure, or count only after a sent email;
  **Send it again** without an address refused with a reason code, or answered like a send;
  the test outbox always on, or only where the test room secret is set.
- **Solution:**
  - Order: the request's own checks (human check, fields) first; then the counts per account and
    per address for today (`email_limit_reached`), then the Lobby takes one email of the site's 90
    (`site_daily_cap`); only then is anything written. The site email is given back when the email
    cannot be sent or the signup loses its username to a concurrent one. After a sent email, the
    link is written.
  - Changed after the phase review (R1): the D1 counts are taken, not only read, before sending:
    one D1 batch of conditional upserts that raise each count only while it is below 3, so
    requests at the same moment cannot pass a limit. If one count is full, the other is given
    back and the request gets `email_limit_reached`; when the site cap refuses, the email cannot
    be sent, or the signup loses its username, the counts and the site email are given back. A
    signup without a guest takes only the address count; the new account's count is written
    with the link after the email is sent.
  - Counts per account (`account:<id>`) and per address (`address:<SHA-256 of the email key>`) in
    `email_counts` by UTC day; the daily cron deletes counts older than yesterday and expired
    links. Links are stored only as SHA-256 hashes, one per account and kind.
  - **Send it again** (`POST /api/confirmation-emails`, the login's token): a guest gets
    `not_registered`; an account with no unconfirmed address (none entered, removed by A1.11, or
    already confirmed) gets the same OK as a sent email and nothing is sent or counted, so the
    answer does not tell that the address belongs to another account (A1.3). An unconfirmed
    address confirmed elsewhere meanwhile gets the "already in use" email. Over a limit: HTTP 429
    with the reason code, as signup.
  - The sender is chosen in one place (`emailSenderOf`). Until item 9 it is always the test
    outbox: a D1 table `test_outbox` written only when `TEST_ROOM_SECRET` is set (locally and on
    GitHub); without it the send fails, so the live site stores no address or link and counts
    nothing, and signups still succeed (A1.4). The browser tests read it with
    `POST /api/test-outbox` (`{ to }`, the test room secret header), newest first.
  - Links use the request's origin and a fragment: `/#confirm=<token>` for a confirmation (also of
    a new address), `/#reset=<token>` for a reset, `/#forgot-password` in the "already in use"
    email.
  - The browser tests sign up far more than 90 accounts a day on one local server: like the chat
    cap (Q101), a server whose environment sets `TEST_SITE_EMAILS_PER_DAY` uses that number
    (`.dev.vars` locally and in `check.yml` and `deploy.yml`).
  - Scenarios: the lobby driver keeps the emails sent (`emails_sent`), the counts of `email_counts`
    and `emails_today`, and the site count of `site_counts_today.emails` with the server's own
    limit functions. For `accounts` #4 it keeps the given seats and game counts by player id, so
    they show the signed-up account only if signup kept the guest's player id. The "check your
    email" notice of S12.3 is `message_to.notice: signup_done_confirm_email` after a signup.
  - B18: the busy day's 30 signup emails (the link with its token index and two counts, 4 rows,
    plus the Lobby's count), 10 resends (the link and its token index replaced and two counts, 5
    rows, plus the Lobby's count) and the daily delete of 60 counts and 30 links (2 rows each):
    330 rows; the day measures 3,396 of 5,000.
- **Why:** taking the site email first in the Lobby is the only way to keep the cap exact without
  a second write per email; storing nothing on the live site until the real sender exists keeps
  addresses out of a table nobody reads.
- **Implemented:** phase 24, item 1.

## Q109. Opening confirmation and reset links (A1.7, A1.11, A1.16)?

- **Phase:** 24, item 2 (A1.4, A1.7, A1.11, A1.16; Q106).
- **Question:** the spec does not say whether a refused new password uses up the reset link, to
  which address a reset requested with a variant of the address (`Name+x@...`) is sent, what
  happens to the other browsers' open connections when a reset ends every login, or how the
  scenarios open a confirmation link for an account that is given unconfirmed.
- **Options:** check the password before or after the link; send to the typed or the confirmed
  address; close the other connections or let them run out.
- **Solution:**
  - Routes: `POST /api/email-confirmations` `{ link }` (OK or `link_expired`),
    `POST /api/reset-emails` `{ email, humanCheck }` (the human check, then
    `email_not_confirmed`, then the limits of Q108; OK) and `POST /api/password-resets`
    `{ link, password }` (the answer of a login: token, player id, name).
  - A new password is checked (A1.6) before the link, so a refused password leaves the link
    working. The link, the password, ending the logins, clearing failed logins and the new login
    are one D1 batch whose statements all require the live link, so a link used twice at the same
    moment sets the password once.
  - Confirming is one D1 batch: the account is confirmed only while no account has confirmed the
    address (A1.11), the address is removed from every other account with the same email key, and
    the link is used up whatever the outcome.
  - The reset email goes to the address as the confirming account stored it, counted per account
    and per address as in Q108.
  - Ending every login deletes the account's logins; a connection already open in another browser
    is not closed, it fails at its next login check (a reconnect or a route).
  - Scenarios: an account given as registered with an unconfirmed address has a live
    confirmation link from the scenario's start; `set_new_password` opens the newest reset link
    sent on the site.
- **Why:** a typo in the new password should not cost the player a new email out of three a day;
  one batch keeps a link to one use without a second read.
- **Implemented:** phase 24, item 2.

## Q110. Changing and adding an email address (A1.10, A1.11, A1.16)?

- **Phase:** 24, item 3 (A1.10, A1.11, A1.12, A1.16; Q106, Q108, Q109).
- **Question:** the spec does not say where a pending address is kept, whether a change whose
  address is confirmed elsewhere shows as pending, what happens to a pending change when another
  account confirms that address, how an account knows its address was removed (A1.11), in which
  order the change is checked, or what the account view shows.
- **Options:** keep the pending address only in the link, or on the account; show a pending
  change only when a link was sent, or always; leave other accounts' pending changes, or drop them.
- **Solution:**
  - `POST /api/email-changes` `{ token, email, humanCheck }`: the login (`invalid_token`), a guest
    gets `not_registered`, the address (A1.3, `email_invalid`), the human check, then the limits
    of Q108 (per account and per new address); then the account's `pending_email` (with its email
    key) is written and its older `change_confirm` link deleted in one batch, so a newer change
    always replaces the pending one even when its email cannot be sent. It sends `change_confirm`,
    or `already_in_use` when any account has confirmed the address (it is still stored as pending,
    so the change looks the same). OK whatever the send's outcome, as signup (A1.4).
  - Confirming (`POST /api/email-confirmations`, one batch as Q109) also opens a `change_confirm`
    link: the address comes from `email_links.address` and must still be the pending one; while
    no other account has confirmed it, it replaces the account's address as confirmed and clears
    the pending change and the removed mark. A1.11 then removes the address from every other
    unconfirmed account with the same email key and marks it removed (`is_email_removed`), and
    drops other accounts' pending changes to that address.
  - `POST /api/account` adds `email` (null for a guest): `address`, `isConfirmed`,
    `pendingAddress` and `wasRemoved`, to the account holder only. Migration
    `0011_pending_and_removed_email.sql`; `PROTOCOL_VERSION` 13.
  - **Send it again** stays for the unconfirmed address of the account; a pending change that did
    not arrive is sent again by changing again (with the human check).
  - Scenarios: the lobby driver's `change_email` step; `confirm_email` opens the newer of the
    account's confirmation and change links; `emails_sent` shows a change email as kind
    `confirm`, as `accounts` #16 expects.
- **Why:** keeping the pending address on the account lets the settings show it whatever the
  email did, and the account's own removed mark is the only way the settings can explain A1.11
  without telling who confirmed the address.
- **Implemented:** phase 24, item 3.

## Q111. What does deleting an account remove, and how does it leave rooms (A1.15, M6.10)?

- **Phase:** 24, item 4 (A1.15, M6.10, A2.3; Q107).
- **Question:** the spec does not say in which order the route checks and acts, whether the
  account row stays as a marker for phase 25's "Deleted player", what happens to the account's
  open sockets in other browsers, or what the answer looks like.
- **Options:** keep the account row as a deleted marker (name cleared, kind `deleted`), or remove
  it and show "Deleted player" for any player id without an account; leave rooms before or after
  removing the rows.
- **Solution:**
  - `POST /api/account-deletions` `{ token, password }`, answered like the email routes
    (`EmailResponse`): the login (`invalid_token`, 401), a guest gets `not_registered`, then one
    password hash (Q90; `password_wrong`, nothing changes). Then the account leaves every room the
    Lobby knows it in, as a logged-out guest does (`leaveAsLoggedOutGuest`: during a game it
    leaves the game, M6.10, then the room; waiting in a room it leaves the room), and every socket
    of the account in those rooms is closed as logged out, whichever login opened it. If a room
    does not answer, the answer is 503 and the account stays. Last, one batch deletes the account
    row, every login and every email link. OK `{ isOk: true }`.
  - The account row is removed, not kept as a marker: its email, pending email, removed mark,
    password hash and username go with it, and the username is free at once. Phase 25 shows
    "Deleted player" for a record's player id that has no account row, the same rule as for
    guests removed after 90 days (item 5). Per-address email counts stay (A1.9); the account's
    own count rows expire with the daily cron as before.
  - The ranked queue does not exist yet; phase 26 adds leaving it to the deletion route.
  - `PROTOCOL_VERSION` 14 (`password_wrong`). B18 counts 5 deletions on the busy day, 10 rows
    each (the account and its name and email index entries, two logins with their index entries,
    a link with its token index and leaving a room).
- **Why:** removing the row is the simplest way to be sure no personal data stays (A12.1), and
  the same "no account, Deleted player" rule then covers removed guests; leaving the rooms first
  means a failure leaves a working account that can try again.
- **Implemented:** phase 24, item 4.

## Q112. When is a guest "not used for 90 days", and how is it removed (A1.1, A1.14)?

- **Phase:** 24, item 5 (A1.1, A1.14; D27, Q55).
- **Question:** a guest's last use is noted per login, at most once a day (Q55), and a guest who
  logged out has no login left, so its last use is no longer stored. The spec does not say from
  which time the 90 days count then, nor what removing the guest removes.
- **Options:** count a logged-out guest from its creation time; remove it at the next daily run;
  or store a last-use time on the account.
- **Solution:**
  - The daily Cron Trigger removes a guest account when its newest login's noted last use is more
    than 91 days old (`LOGIN_TIMES.expireAfterMs`), the same moment its login ends (Q55), so a
    guest is never removed before 90 days without use. A guest with no login left counts from the
    time it was made.
  - `removeUnusedGuests` is one D1 batch of two statements (the guests' logins, then the guest
    rows), so the Worker loops over no rows and stays within the cron's 10 ms CPU. The username is
    free at once; phase 25 shows "Deleted player" for a record whose player id has no account row
    (Q111). Guests have no email links or email counts of their own. Registered users are never
    removed by it.
  - B18 counts 100 removals a day (as many as the busy day makes guests), 4 rows each (the
    account, its name index entry, its login and the login's index entry): 3,846.
- **Why:** reusing the login's expiry keeps one rule for "unused"; counting a logged-out guest
  from its creation errs on keeping it, never on removing it early, without a new column.
- **Implemented:** phase 24, item 5.

## Q113. How do the email screens open, and what do their buttons say (S12.3, S12.4)?

- **Phase:** 24, item 6a (S12.2, S12.3, S12.4; Q108, Q109).
- **Question:** S12.4 does not say over which screen an email link opens, what the email
  confirmed and link expired screens close with, what the set-new-password form does with two
  different passwords, or what happens to a game this browser is in when a reset logs it in. The
  boards show the address on "email confirmed" (the confirm route does not return it), "Go to the
  lobby" buttons, "Send a new link" on "link expired" and "Save and log in" on "set a new
  password".
- **Options:** open the link screens as their own page, or as dialogs over whatever the browser
  shows; return the address from the confirm route, or leave it out.
- **Solution:**
  - The client reads `#confirm=`, `#reset=` and `#forgot-password` once at load, removes the
    fragment from the address, and shows the screens as dialogs over the current screen (the
    lobby, a waiting room or a game, which go on behind). The "check your email" notice of S12.3
    opens after every successful signup, from the lobby or the user menu, with the address typed.
  - Email confirmed: no address (the confirm route answers only OK or `link_expired`, so a link
    tells nothing about the account), closed with **OK**. Link expired: **Close**, and **Send it
    again** to a logged-in player whose address is unconfirmed (from `/api/account`), else
    **Forgot password**, as S12.4. Set a new password: **Set password**, as S12.4; two different
    passwords are caught in the browser ("The two passwords are not the same.") and nothing is
    sent; `password_invalid` leaves the link working (Q109); `link_expired` opens the link expired
    screen. After **Set password** the browser holds the new login and shows the lobby, leaving a
    room it was in (the old login has ended, A1.7).
  - A network failure while confirming shows a notice to open the link again instead of the link
    expired screen.
  - `screens.md` S17 lists the board differences.
- **Why:** dialogs keep a game in another part of the page running and reuse the modal pattern
  of every other account screen; the spec's button names win over the boards'.
- **Implemented:** `screens.md` S17; phase 24, item 6a.

## Q114. What do the email and delete parts of account settings show (S12.5, S12.6)?

- **Phase:** 24, item 6b (S12.5, S12.6; Q110, Q111).
- **Question:** no board shows the dialog for **Change email address** or **Add an email
  address**, or an unconfirmed address. The board "Account: settings, email removed" names the
  removed address, which `/api/account` no longer has (Q110). S12.6 does not say when a player
  counts as "during a game", or where a deleted player ends up.
- **Options:** name the removed address (keep it on the account) or explain without it; a page or
  a dialog for the change.
- **Solution:**
  - Settings show the address as text with "✓ confirmed" or "not confirmed"; an unconfirmed one
    has **Send it again** (the confirmation route, Q108; a pending change is not resent, Q110). A
    pending change shows "Waiting for confirmation: …". A removed address is explained without
    naming it, with **Add an email address**. Guests see neither the email part nor **Delete
    account** (A1.15, `not_registered`).
  - **Change email address** and **Add an email address** open a dialog with the new address and
    the human check, **Send link**; when it is sent, settings open again and show the pending
    change. A refusal (`email_limit_reached`, `site_daily_cap`, ...) shows in the dialog.
  - **Delete account** asks for the password. "During a game" means the room's game is running
    and has no result yet; then the dialog is "Delete your account during a game?" with **Leave
    the game and delete**, as the board. `password_wrong` and a server that did not answer (503,
    "The server did not answer. Try again.") keep the account and the dialog. After deleting, the
    browser forgets the login and shows the lobby logged out.
  - `screens.md` S17 lists the board differences.
- **Why:** the account view tells only what the account holds (A6.3); the dialogs reuse the
  forgotten-password form's pattern.
- **Implemented:** `screens.md` S17; phase 24, item 6b.

## Q115. Does deleting an account limit wrong password guesses (A1.13, A1.15)?

- **Phase:** 24, phase review R6 (A1.13, A1.15; Q107, Q111).
- **Question:** the delete route checks the password with a session token, and A1.13 counts
  only failed logins. Should wrong passwords on deletion count, or ask for the human check?
- **Options:** count them as failed logins and ask for the human check in the delete dialog
  after 3; or accept unlimited guesses there.
- **Solution:** accepted, nothing is counted. A guess needs a live login token of the account,
  and that token already gives everything the password would: the account stays logged in for
  90 days and can change the email address and reset the password through it. The password on
  deletion only guards against deleting by mistake or from a borrowed browser. Counting would
  also break A1.15 ("a wrong one ... changes nothing") and need the human check in S12.6.
  Each guess costs a slow password hash, so the route is not cheaper to hammer than a login.
- **Why:** the limit would protect nothing the token does not already open.
- **Implemented:** no change; phase 24, review R6.

## Q116. What does an account hold after signing up with an address confirmed elsewhere (A1.3)?

- **Phase:** 24, phase review R4 (A1.3, A1.4, A1.11; Q108, Q114).
- **Question:** signup stored no address when another account had confirmed it, so Account
  settings showed no address and **Add an email address**, unlike a free address. That breaks
  A1.3 ("looks exactly the same") and tells the player the address belongs to an account.
- **Options:** keep the address on the account as not confirmed, like a free one; or keep
  storing nothing and make the settings pretend.
- **Solution:** the address is kept on the account as not confirmed (an unconfirmed address
  reserves nothing, A1.11; a login by email finds the confirming account first, A1.5). Settings
  show it with "not confirmed" and **Send it again**, which sends the "already in use" email again
  while the other account holds it, through the same limits (`reserveAccountEmail`), and the
  confirmation email once the address is free. Spec A1.3 says so; scenario `accounts` "signing up
  with an address already confirmed elsewhere looks the same" now expects the address, not
  confirmed (it contradicted A1.3).
- **Why:** the only place the difference may show is the email sent to the address.
- **Implemented:** phase 24, review R4.

## Q117. What does changing the email to the account's own confirmed address do (A1.10)?

- **Phase:** 24, phase review R7 (A1.9, A1.10; Q110).
- **Question:** a change to the address the account has already confirmed found it "confirmed
  elsewhere", sent the "already in use" email and left a pending change that could never be
  confirmed.
- **Options:** refuse it with a reason code; or treat it as no change.
- **Solution:** no change. After the login, the address and the human check, a new address with
  the same email key (A1.11) as the account's confirmed address sends nothing and counts nothing
  (A1.9: no email, so no limit), drops a pending change and its link (a newer change replaces a
  pending one), and answers OK. Spec A1.10 says so; new scenario `accounts` "changing the email
  address to the confirmed one already on the account changes nothing" (required).
- **Why:** the player gets what they asked for, their current address, without a new reason code
  or a message on the screens; refusing would need one in `screens.md` for a case that only
  needs nothing to happen.
- **Implemented:** phase 24, review R7.

## Q118. Why did B11 fail `npm run check` under load, and how is it measured reliably?

- **Phase:** 24, second finisher run (B11; Q102, phase 20 finisher).
- **Question:** one `npm run check` failed B11 at 12 ms of 10 with no room code changed, and the
  next run passed. Is it a regression or the load, and how does the check stop depending on it?
- **Finding:** the measurement. The room scenarios send 55 messages, and the 99th percentile of 55
  values is the largest one, so one message decides B11, as it did before phase 20 moved to the
  percentile. The time is the wall clock, which counts the time the operating system gives to
  the other test processes of `npm run check`. Measured alone, the slowest message took 1.2 to
  2.6 ms; with the full test suite running beside it, single messages took up to 6.8 ms while
  the second slowest stayed under 2 ms. Thread CPU time is no fix: on Windows it is counted in
  steps of about 15.6 ms.
- **Solution:** the harness runs the room scenarios three times, one after the other, and keeps
  for each message the fastest of its three times; the results, the other measurements and the
  report come from the first run. A message slowed by the load in one run is measured by another;
  a message that is really slow is slow in all three and still fails. The limit (10 ms), the
  percentile and the required list are unchanged. `budgets.yaml` says how B11 is measured.
- **Why:** a budget that fails on load teaches everyone to rerun past it, which hides a real
  regression; three runs of the room scenarios add about a second to the harness.
- **Implemented:** phase 24, second finisher run (`tools/harness-runner/buildSteadyScenarioRuns.ts`).

## Q119. How are game records stored, written and counted (A3.1, A3.2, M8.3, B8)?

- **Phase:** 25, start (A3, A4, M8.3, B8; Q62 for the replay record, Q111, Q112).
- **Question:** the spec says what a record holds and that it is kept for good, but not where it
  lives, when it is written, which endings write one, how usernames stay current (A3.5), or how
  B8 is measured.
- **Options:** one D1 row per game with every player inside it; one row per player only; a row
  per game plus a row per player for the match history lookup. Usernames stored in the record
  and rewritten on every change, or looked up when the record is read.
- **Solution:**
  - Two new D1 tables, both `WITHOUT ROWID` and with no other index, so each row written is one
    row: `game_records` (`id` a random UUID, `ended_ms`, `record` as JSON) and
    `game_record_players` (`player_id`, `ended_ms`, `game_id`, the primary key of all three, so a
    player's games read newest first straight from the key).
  - The values come from the engine: a pure function in `src/rules/` builds the record from the
    ended `SavedGame` by seat (places, results, scores and every value of A3.2, combo gains and
    type counts included); the room adds the seats' player ids, the kind (casual until phase 26)
    and the start time (`setup.startedAt`). No rules in the server.
  - Written once, in one `batch`, when the room has saved a game that has just ended, at the same
    two places that write the replay record (`GameRoom` and `applyRoomAlarm`), for every ending
    except the abandoned ones (`isAbandoned`: `everyone_left`, `paused_too_long`,
    `abandoned_by_vote`). Test-room games save records too: their seats are guest users (C5.2)
    and the owner can try match histories with them. A failed write is logged without tokens or
    addresses and not retried, as for the replay record.
  - Records hold player ids, never usernames. Reading a record or a history joins `players` and
    shows the current username (A3.5); a player id with no account row is "Deleted player", for
    deleted accounts (Q111) and removed guests (Q112) alike. Deleting an account leaves its
    `game_record_players` rows: the records are kept for good (A3.2) and name nobody.
  - B8 counts, per finished simulated game, the D1 rows the record write makes: 1 plus one per
    player, at most 5 of 12, which leaves 7 for phase 27's ratings. The harness measures it
    (`BUDGET_CHECKS` B8 by harness). A record of a 4-player game is a few kilobytes; at 50 games a
    day that is well under 1 GB a year of the 5 GB cap.
- **Why:** the per-player rows make the match history one key range read without an index
  (indexes cost a row written each, Q62); looking usernames up at read time makes A3.5, A1.1 and
  A1.15 true with no writes at all.
- **Implemented:** phase 25, items 1 and 2.

## Q120. What does a player who left hold in the record (A3.3)?

- **Phase:** 25, start (A3.3, A3.4, R21.4, R21.8).
- **Question:** leaving empties the player's hand into the holding pile or discard (M6), and the
  result is scored at the end with the final turn number, so a player who left was recorded
  with no cards in hand and scored with the wrong turn.
- **Options:** keep a copy of the seat's values at the moment of leaving; or keep only what
  leaving changes (the cards in hand) and the turn.
- **Solution:** when a seat leaves, the engine keeps the turn number and the number of cards in
  hand at that moment. Its other values no longer change after leaving (no income, bonus,
  influence or first-completion funds reach a seat that left), so they are taken as they are.
  The score of a player who left uses those values and that turn (A3.3), on the end-of-game table
  (S9) too, since it shows the same result. The record shows the turn they left in ("left
  (turn 20)", as the design does). Spec A3.3 and S13.2 say so. The place result in the view
  changes shape, so `PROTOCOL_VERSION` is raised. A new scenario covers a player who left in an
  earlier turn than the last one.
- **Why:** only the hand and the turn change after leaving; copying the whole seat would double
  the saved state for nothing (B13).
- **Implemented:** phase 25, item 1.

## Q121. How are match histories opened, by whom, and where do usernames link to them (A4, A6.1, S13)?

- **Phase:** 25, start (A4.1, A4.2, A6.1, S10.1, S12.7, S13.1, S13.2).
- **Question:** A6.1 says clicking a username anywhere opens that player's match history, but not
  which places count, how the history opens during a game, whether a logged-out visitor may
  open one, how a long history is shown, or what a history of a deleted account shows. The
  views carry only names, and a name inside a room can be an old one that another player has
  taken since (A2.4), so a name cannot identify the player.
- **Options:** links by username, or by player id; a full screen replacing the game, or a page
  over it; one long list, or pages.
- **Solution:**
  - Links use the player id, which becomes a public identifier like a room code: it is never
    proof of identity (only the session token is, `rules/multiplayer.md`). The views add each
    player's id where a username stands on its own, which raises `PROTOCOL_VERSION`.
  - Match history and game record open as pages over the current screen, by link
    (`#history/<player id>`, `#record/<game id>`), like the privacy notice (S12.8), each with
    **Back**; during a game nothing pauses (C1.3). They are opened from **My match history** in
    the user menu (S12.7) and in the lobby's top bar when logged in (S10.1), and from usernames.
  - Anyone can open them, also when not logged in (A6.1: every player; they are reads only, with
    no names of hidden things). "Deleted player" is never a link.
  - The places a username opens the history: the player badges, the opponents overview and
    boards, the room's player list, the end-of-game table, chat, the public rooms, match
    histories and game records. Usernames inside sentences (the draw log, messages, dialogs) and
    your own user box do not. On an opponent card the username opens the history and the rest of
    the card the board (S3.2).
  - The list shows the 50 newest games and **Show older games** adds the next 50. A history whose
    account no longer exists says "This player's account no longer exists." Dates are the date
    the game ended, times the viewer's local time.
  - Written into A6.1, S13.1, S13.2 and the new S13.4.
- **Why:** a player id cannot point to the wrong player after a username change; a page over the
  screen keeps the game and its clock as they are, as the rules viewer will (C1.3); 50 at a time
  keeps a read small for a player with many games.
- **Implemented:** phase 25, items 3 to 5.

## Q122. When does the scenario see an unused guest deleted (A1.1, A1.14)?

- **Phase:** 25, item 3 (A1.1, A1.14; Q55, Q112; scenario `accounts` "a guest account not used for
  90 days is deleted and shows as Deleted player").
- **Question:** the scenario waits exactly 90 days after the guest's noted last use and expects
  the account gone. Q112 deletes a guest when its noted last use is more than 91 days old, since
  the last use is noted at most once a day (A1.14), so at exactly 90 days it is still there. A1.1
  said only "not used for 90 days".
- **Options:** delete at 90 days of noted use, which can remove a guest used less than 90 days
  ago; or keep Q112 and let the scenario wait past 91 days.
- **Solution:** Q112 stays. A1.1 now says the guest is deleted up to two days after 90 days
  without use (the noted last use, and the daily run), never sooner. The scenario waits 91 days
  and 1 second; the lobby driver deletes guests whose login has expired (`loginStateOf`) after a
  wait, as the daily run does.
- **Why:** a guest must never lose its account before 90 days without use; the scenario's point
  is that a deleted guest shows as "Deleted player".
- **Implemented:** phase 25, item 3.

## Q123. What happens when the private repository runs out of GitHub Actions minutes?

- **Phase:** 25, second finisher run (asked by the owner, 2026-11-11).
- **Question:** GitHub told the owner that the free Actions minutes of the private repository
  were used up. The branch check and the deploy both run on Actions, so no phase could pass its
  GitHub check or deploy (README, "What every phase must meet").
- **Options:** pause until the owner adds a spending limit or the minutes reset; run the checks
  locally and deploy from this machine with wrangler (GitHub no longer the judge); make the
  repository public, which gives unlimited free minutes.
- **Solution:** the owner chose to make the repository public, after being told that the commit
  history carries their author email address. Claude scanned the whole history for secrets
  first (none found) and changed the visibility with `gh repo edit`. The checks and the deploy
  are unchanged.
- **Why:** keeps GitHub as the judge of every phase at no cost.
- **Implemented:** phase 25 (repository setting, no code change). Decided by the owner.

## Q124. Why can GitHub's browser jobs no longer install Chromium?

- **Phase:** 25, second finisher run.
- **Question:** from 2026-11-11 afternoon every browser job failed at "Install Chromium" with
  "Temporary failure resolving 'archive.ubuntu.com'" (runs 43039971864, three attempts, and
  43046665820). The morning's green run 43001983089 ran on image `ubuntu-24.04`; the failing
  runs ran on `ubuntu-26.04`, because `ubuntu-latest` had moved to it.
- **Options:** pin the runners to `ubuntu-24.04`; install Chromium without system packages
  (a change to the install step, for the owner); wait and rerun.
- **Solution:** pinning was tried first (run 43049006328) and failed the same way on 24.04, so the
  image was not the cause: GitHub's runners could not resolve the Ubuntu package mirrors at all,
  with no incident on githubstatus.com. The pin was undone; the failed jobs are rerun later.
- **Why:** no check changes for an outage outside the project.
- **Implemented:** phase 25; commits "INFRA: GitHub jobs run on Ubuntu 24.04" and its undo.

## Q125. Chromium on GitHub without Ubuntu's packages

- **Phase:** 25, second finisher run (follows Q124). Decided by the owner, 2026-11-11.
- **Question:** GitHub's runners could still not reach Ubuntu's package mirrors, so no browser
  job could install Chromium, and the phase could not pass its GitHub check or deploy.
- **Options:** keep waiting for GitHub; install Chromium without `--with-deps`, so only the
  browser is downloaded from Playwright's own servers and the system libraries already on
  GitHub's Ubuntu images are used.
- **Solution:** the owner approved dropping `--with-deps` from the Chromium install step in
  `check.yml` and `deploy.yml`. No test, limit or other check changes. If a library turns out to
  be missing, the change is undone and the phase waits for GitHub.
- **Why:** takes an outside service that failed out of every browser job.
- **Implemented:** phase 25, commit "INFRA: Chromium installs on GitHub without Ubuntu's packages".

## Q126. What happens with the findings of the owner's playthrough of 2026-11-10?

- **Phase:** 25 is done; the owner's notes are `docs/playthrough-notes/2026-11-10-playthrough.txt`
  (12 findings). As Q78 says, the next "continue" plans a fix phase for them before any other
  phase: **25a, Playthrough fixes**. Phases 26 and 28 now also depend on 25a.
- **Question:** which findings change the rules, the protocol, the screens or the accounts; what
  do findings 4 and 8 ("check if it is a bug") and 6 ("can it be done without a big cost") come
  to; and how do findings that conflict with existing rules (1, 7, 9) reach the spec?
- **Solution:** every finding follows the owner's notes; where it conflicts with a rule, the
  rule is changed in the spec first (D19, `rules/workflow.md`).
  - **1. Market phase per player (rules, screens).** Every market go has 40 seconds, instead of the
    first player's 45 and the others' 30 (R9.2, R18.11). A player's own main phase starts as soon as
    their own market go ends, while later players still have their go (R4.1, new R18.15); their
    main-phase limit and free time count from then (R9.1, R9.4). A time-out on a market go no longer
    draws: the go passes to the next player, the player's main phase starts, and their turn draw
    stays open as option B only; they choose the sector themselves at any time in their main phase
    (new R18.16; a marketplace card is then rejected with `out_of_market`). Decided without the
    owner: if they become done without choosing, the draw is taken for them with a random sector at
    that moment (R8.5), so nobody loses their turn draw, as finding 11 asks for combos; the late
    draw is not an action (no action-limit cost, allowed at the limit), cannot be undone, and is
    revealed to others when the main phase ends like any main-phase draw (M3.3, R17.8). What others
    see follows the existing hiding rules: a player is shown to the others as they were when their
    own main phase started (R5.4); the deck and discard pile as at the start of your own main phase,
    minus later market-go draws, plus your own draws and shuffles (R5.5, R17.7, R17.8). Screens: the
    market banner is green on your go (S4.5), the Draw button of finding 2 takes a marketplace card
    (S4.3), the action area offers the open turn draw (new S4.6), the main-phase actions open when
    your own go ends (S4.4), and the top bar shows your own phase (S2.1, S2.3).
  - **2. Every card can be looked at (screens).** Marketplace cards, your city and other players'
    cities (in their board) open the big card on a click; a click never takes a marketplace card:
    on your go, a **Draw** button appears under the selected marketplace card (S4.1, S4.3, S6.5,
    S3.2).
  - **3. More about opponents (screens, view).** Overview: quests completed as an orange **Q**
    box, influence with its icon (S3.1). Board: total types of the city as an indigo **T** box,
    combos claimed as a green **C** box (infinite claims each count), the five basic stats with
    workforce, quality and satisfaction in a small table that is red while any is negative,
    product and distribution next to it (S3.2). Quests panel: another player's negative stat is
    shown only when the quest names that stat, and the username of every other player who could
    complete the quest now is bold orange; the view says who can, so the client does not
    compute it (S5.1). Decided without the owner: your own line keeps showing a negative stat as
    an unmet part (phase 20a, R19.4), because your Complete button depends on it; "types in
    their city" counts the types of their cards in play, a doubled type twice, not types gained
    from quests.
  - **4. Doubled types (screens; not a rules bug).** Checked: the card data marks Lake Park,
    Central Park and National Park as counting Beautification twice (`doubleType1`), the engine
    adds 2 (scenario "a card that counts a type twice adds 2 to that type count" passes), and
    the big card (`BigCard.tsx`) shows the icon once with a small "2" next to it, which is easy
    to miss. Fix: a type a card counts twice is shown as its icon twice, on the big card and in
    the card set (S6.5).
  - **5. Quests completed last turn (screens, view).** A small table next to the quests panel
    lists the quests completed in the turn before, with tier and who completed them, only when
    there are any (new S5.5, R19.6, M3.5). The view carries them; scenario added.
  - **6. A fuller log (what is public, screens): fits the budgets, included.** At the end of each
    main phase the log gets, per player in player order, the cards played, quests and projects
    completed and influence actions used (new M3.7, S7.2; the draw log becomes the **game log**,
    tab **Log**). Undone actions never appear (R5.7); nobody sees the entries before the main
    phase ends, the player's own included, so the hiding rules are unchanged. Measured with 6
    simulated legal-bot games of 3 and 4 players: today's draw log holds 231–300 entries
    (30–39 KB as JSON) at the end of a game; the new entries add at most about 250 per game
    (88–128 cards played, 21–88 quests, 10–20 trades, 6–12 projects), about 20–25 KB as JSON,
    about 4 KB compressed. Budgets: no extra rows (the entries are part of the one state row,
    B1–B5), no extra incoming messages (B9), the saved room grows from 15–19 KB to about 23 KB
    compressed against B13's 100 KB, the replay record is unchanged (it is the action log,
    B17), and the work per message is a few list entries (B11 measures 1 ms for room messages).
    The view a player receives grows from 55–67 KB to about 90 KB as JSON by the end of a game;
    no budget limits message size.
  - **7. More time, and nobody kicked in casual games (rules).** Every turn gets 30 seconds more:
    the main-phase limit is 210 + (turn − 1) × 120 ÷ 19 seconds, at most 330 (3:30 to 5:30, R9.1),
    and the free time is 75 seconds instead of 45 (R9.4, R9.13), so a player with an empty bank
    also gets the extra time and the bank lasts as long as before. Decided without the owner:
    both, because "add 30 seconds per turn" only reaches a player whose bank is empty through
    the free time, and only reaches a long turn through the limit. A player whose main-phase time
    runs out is now **out of time**: they can keep playing, and are made done only once every
    other player is done or out of time (R9.10, R9.6: their action after the deadline is
    accepted; only a turn draw after a market-go deadline is rejected as `out_of_time`). The
    3-time-outs leaving rule now holds in ranked games only; in casual games time-outs are not
    counted and the player is told they can keep playing (R9.11, M5.3, M5.4, M6.10, S9.4). The
    out-of-time status is public and shown like done (M3.5, S2.2, S2.3, S3.1, S6.7).
  - **8. Quests that come straight back (rules; not a code bug, but a rule that looked like
    one).** Checked: the engine follows R19.7 and R19.8 (no quest is ever on the table for more
    than 5 turns). But a quest that left after 5 turns went back into the quest list before the
    refill of the next turn, so it could be drawn straight back: in 45 simulated legal-bot games
    (2–4 players), 242 of the 1,075 quests that left after 5 turns (22 %) were back on the table
    the next turn, usually in the same place with 5 turns left again, which looks exactly like a
    quest that never leaves and that nobody can complete. Fix: such a quest goes back into the
    list only after the refill (R19.7, R10.2, R11.2, rulebook). The scenario "a quest nobody
    completed in 5 turns goes back into the quest list" drew the same quest straight back; it
    contradicted the new spec and now draws another (name unchanged, still required).
  - **9. Username changes (accounts).** Up to 4 changes in any 7 days instead of 1 (A2.4, S12.5,
    S16.3 text); the account keeps the times of its recent changes (one D1 row per change, as
    now).
  - **10. End turn highlighted (screens).** Once you have played a card this turn, End turn is
    highlighted until you end your turn (S6.6).
  - **11. Combos claimed on ending (rules).** When a player becomes done, by ending their turn or
    by being made done, every ready combo is claimed for them first, with any income it brings;
    not an action, also at the action limit; not for a player who leaves (new R8.5, S6.6,
    rulebook).
  - **12. Income notice (screens).** "Your [income icon] has increased!" with a close button,
    closing by itself after 3 seconds, whenever your income goes up (new S16.4).
  - **Scenarios.** 27 scenarios added (486 now; the harness test still expects 459). Scenarios
    that contradicted the new rules were changed, with their names kept wherever the name stays
    true (time values, `kind: ranked` for the 3-time-outs scenarios, other players done or out
    of time where a player must be made done). Five required names could not stay true, because
    the owner's findings 1, 7 and 9 change exactly the numbers they name; they are **renamed** in
    the scenario files and in `harness/required.yaml` together, so the same requirement stays on
    the list under the new rule and none is dropped. The owner approved them on 2026-11-11:
    "the main-phase time limit in turn 10 is 3 minutes 57 seconds" → "… 4 minutes 27 seconds";
    "the first 45 seconds of a main phase do not use the time bank" → "the first 75 seconds …";
    "the first player's market go has 45 seconds" → "… 40 seconds"; "other market goes have
    30 seconds" → "every later market go also has 40 seconds"; "a username can be changed at
    most once every 7 days" → "a username can be changed at most 4 times in 7 days".
  - New scenario fields, which the runner cannot read until phase 25a builds them: seat
    `out_of_time` and `turn_draw_pending`; view `out_of_time` and `quests_completed_last_turn`;
    log items `played`, `completed_quest`, `influence` (and `completed_project`); the `timed_out`
    notice's `keep_playing`; the account's `username_changes_ms` (replaces
    `last_username_change_ms`). They are explained in `HARNESS.md` and `scenario-format.yaml`.
  - The spec and harness changes are on the branch `phase-25a-playthrough-fixes`, not on
    master, as for 20a (Q74): on their own they turn the check red until 25a builds them.
- **Implemented:** `harness/spec/game-rules.md`, `multiplayer.md`, `accounts.md`, `screens.md`,
  `rulebook.md`, `glossary.md`; `harness/scenarios/turns-and-time.yaml`, `marketplace.yaml`,
  `connections-and-leaving.yaml`, `combos-and-income.yaml`, `visibility.yaml`, `quests.yaml`,
  `accounts.yaml`, `end-of-game.yaml`, `client.yaml`, `records-and-ratings.yaml`;
  `harness/scenario-format.yaml`, `harness/HARNESS.md`, `harness/required.yaml` (the 5 renames);
  `docs/plan/phase-25a-playthrough-fixes.md`, `docs/plan/README.md`, phase files 26 and 28.

## Q127. Which questions did the start of phase 25a leave, and how are they solved?

- **Phase:** 25a, the starter's read of the spec and harness changes of Q126.
- **Question:** (1) R9.6 rejects "a turn draw received at or after the deadline" of a market go
  as `out_of_time`, while R18.16 lets the player take their turn draw left open at any time after
  that time-out: which one holds for a turn draw that arrives after the deadline? (2) Invariant
  I24 still described one shared main phase: everyone shown as at "the start of the phase", with
  only done, away, left and the time bank live. Since R5.4, R5.5 and R18.15 (Q126) each player
  has their own main-phase start, market goes go on during it, and out of time and "has had
  their market go" are live; I24 contradicts the spec.
- **Options for (1):** reject every turn draw after the deadline (makes R18.16 impossible);
  accept any turn draw after the time-out as the open draw (a draw the player sent for the go
  would then be taken as option B, or answered `out_of_market` where R9.6 and the required
  scenario "a message received at the deadline is rejected and the time-out is applied" expect
  `out_of_time`); or tell them apart by what the player had seen when sending.
- **Solution:** (1) A turn draw sent for the go that has ended is rejected: when it is the
  message that applies the time-out, as `out_of_time` (R9.6, as the engine does now); when the
  alarm applied the time-out first, it is based on a state version from before the time-out and
  is rejected as `stale_state` (M9.4). A turn draw sent after the player
  was shown the time-out is the turn draw left open (R18.16): option B is taken, option A is
  rejected as `out_of_market`. R9.6 now says so in one sentence. Either way nothing the player
  sent for the go is taken as a draw they did not choose. (2) I24 is reworded to R5.4 and R5.5:
  it holds from the start of the turn's first main phase until the main phase ends; another
  player is shown live while they wait for or take their go and as at the start of their own
  main phase after it, with market go, done, out of time, away, left and the time bank live; the
  piles follow R5.5, market-go draws and shuffles included.
- **Implemented:** `harness/spec/game-rules.md` R9.6, `harness/invariants.yaml` I24 (one
  `HARNESS:` commit); phase 25a items 1 to 3.
- **Review finding F2 (2026-11-16):** the engine rejected every message that applied its sender's
  own market-go time-out as `out_of_time`, not only a turn draw, so a `leave_game` at the go's
  deadline was refused. Now only a turn draw is; every other message is handled after the
  time-out (R9.6), as the scenario "a player who leaves at the deadline of their market go leaves
  after the time-out" shows. `hasTimedOutThisDecision` is removed: since items 1 to 3 it only
  caught a seat waiting for its market go right after a main-phase time-out of its own had ended
  the main phase, and answered all its messages `out_of_time` until the first go ended, a
  `leave_game` (M6.1, any time) included. R9.6 names no such case: such a message is handled after
  the time-out like any other, so a late End turn is now `wrong_phase` (`roomAlarm.test.ts`
  follows). `src/rules/receiveAction.ts`.

## Q128. Where does a market-go draw of a card still shown in the discard pile come off?

- **Phase:** 25a, item 2b (what each seat sees during each player's own main phase).
- **Question:** R5.5 takes a card *you* drew that is still shown in your discard pile (another
  player shuffled it into the deck during their main phase, hidden from you) off the discard
  pile shown to you, not off the deck. Since market goes now draw while some players are in
  their main phase (R18.15), a market go can draw such a card too. R5.5 does not say where that
  draw comes off; taken off the deck shown, the deck count shown can fall below 0 and the card
  stays counted in the discard pile, against I24.
- **Options:** take every market-go draw off the deck shown (simple, can show a negative deck);
  or treat it like your own draw.
- **Solution:** like your own draw: a card drawn on a later market go that is still shown in your
  discard pile is taken off the discard pile shown to you. It shows nothing hidden: the view
  carries only the two counts, and their sum stays what was really drawn.
- **Implemented:** `harness/spec/game-rules.md` R5.5 (`HARNESS:` commit); phase 25a item 2b
  (`src/rules/pilesShownTo.ts`, `tools/simulator/shownPilesViolations.ts`).

## Q129. How does the scenario runner read a `then.marketplace` that lists only some places?

- **Phase:** 25a, item 3 (turn draw left open).
- **Question:** two scenarios of item 3 ("a message received at the deadline is rejected and the
  time-out is applied", "a time-out on the market go passes the go to the next player without a
  draw") expect `marketplace: [{place: residential, card: Row House}]` after the step, while the
  runner compared `then.marketplace` with all 8 places, so no partial list could ever match.
  `HARNESS.md` says unlisted places in `given.marketplace` are empty, and says nothing for `then`.
- **Options:** list all 8 places in the two scenarios; or read `then.marketplace` like
  `given.marketplace`.
- **Solution:** like `given`: the places listed must match, and every place not listed must be
  empty. A full list of 8 places is checked exactly as before; a shorter list is no weaker,
  because a card in any unlisted place fails the scenario. No scenario changes.
- **Implemented:** `tools/harness-runner/engine/readEngineThen.ts`.

## Q130. Who "could complete the quest now" in the quests panel (S5.1)?

- **Phase:** 25a, item 11 (opponents and quests).
- **Question:** S5.1 writes in bold orange the username of every other player who could complete
  the quest now, as the viewer sees them (R5.4). It does not say whether a player who left the
  game, or one who is done this turn, counts.
- **Options:** the full quest check (R19.4, R19.5: on the table, not completed by them, the
  requirement met, no negative workforce, quality or satisfaction) only; or also leave out
  players who left; or also leave out players who are done.
- **Solution:** the quest check on what the viewer sees of them, leaving out only players who left
  the game: a player who left can never complete a quest again, while a done player still meets
  the requirement and the name tells the viewer the quest is within their reach. The server
  decides it per quest and player (`canCompleteNow` in each progress line of the view).
- **Implemented:** `src/rules/questPlacesShownTo.ts`, `src/client/screens/game/QuestPlayerName.tsx`.

## Q131. Where is the big card shown at 1280×720 during the market phase (finding F1)?

- **Phase:** 25a, finding F1 of the finisher's first run.
- **Question:** S6.5 opens the big card next to the hand, over the middle column, for hand cards
  and for marketplace and city cards alike. At 1280×720 the big card (about 570 px high) reaches
  up over the marketplace: it covers every marketplace column but the first, the **Draw** button
  under the selected card (S4.3) and the market go panel's sector buttons. Closing it also cleared
  the marketplace selection, so a player could not take most marketplace cards on their go. The
  spec says both "the same place" (S6.5) and that the game is fully usable at 1280×720.
- **Options:** make the big card smaller at low heights (too small to read at 720 px); keep the
  place and only keep the selection after **Close** (Draw is still covered while the card is
  shown, and option B's buttons too); or, until the player's own main phase starts, show the big
  card over their stats and hand, which cannot be used before then (S4.4), and keep the
  marketplace selection after **Close**.
- **Solution:** the last. Until your own main phase starts the big card covers your stats and
  hand, never the marketplace, **Draw** or the market go panel; from your main phase on it is
  next to the hand as before. The marketplace selection for **Draw** is kept apart from the card
  being looked at, so closing the big card keeps it. Written into S6.5 first.
- **Implemented:** `src/client/screens/game/BigCardBesideHand.tsx`,
  `SelectedCardPanel.module.css`, `MiddleColumn.tsx`.

## Q132. Does a game that ends during a main phase write that main phase's log (finding F4)?

- **Phase:** 25a, review finding F4.
- **Question:** M3.7 writes a main phase's entries to the game log "when the main phase ends".
  A game can also end during a main phase: the last player left (M6.8), everyone left (M6.9), an
  abandon vote passed (M7.4) or a pause lasted 24 hours (R9.14). Does that end the main phase, so
  that its plays, quests, projects and influence actions show in the log?
- **Options:** leave them out (the log then misses the last turn's actions, though the end
  screens show the cities); or write them as the game ends.
- **Solution:** write them. The game ending ends the main phase too; nothing stays hidden after
  the game, so the log is complete. Written into M3.7 first, with the scenario "the log shows the
  cards played in a main phase the game ended in".
- **Implemented:** `src/rules/endGame.ts` writes the log first (`withMainPhaseLogWritten`).

## Q133. How can building a phase use fewer tokens and less time without losing quality?

- **Phase:** between 25a and 26, asked by the owner (2026-11-16).
- **Question:** phase 25a took about 7.5 hours over 20 helpers, all on Opus at medium effort.
  The finisher spent 70 and 36 minutes, mostly on browser tests that time out under local load
  and that GitHub runs again anyway before the merge (7 parallel jobs, about 7 minutes). Which
  jobs can be made cheaper without losing quality?
- **Options:** keep the process; move the browser suite to GitHub; merge jobs; cheaper models or
  lower effort for mechanical jobs; cheaper builders for small items (risky: builders write the
  code nobody reads); trim the rule files (only with the owner's approval).
- **Solution (owner's choice, lists A and B):**
  - The finisher runs `npm run check` and `npm run harness` locally, then pushes and waits for
    the branch check, which runs every browser test at every size; it copies the screenshots from
    that run (`check.yml` keeps each part's `harness/screens/`, starting without the committed
    ones). Browser tests run locally only for single spec files. Local runs stay as the fallback
    when GitHub Actions do not start.
  - The finisher's second run and the releaser are one job, the releaser.
  - The phase reviewer is pointed to the finisher's results and reruns a check only to verify a
    finding. Its definition (`.claude/agents/phase-reviewer.md`, protected) is unchanged.
  - Fixers check a screen with its spec file only; the branch check covers the rest.
  - Models and effort: starter, builder, fixer and phase reviewer Opus at medium (unchanged);
    finisher Sonnet at medium; releaser Sonnet at low.
  - Two small items share one helper whenever their order allows.
  - A builder model test in phase 26: two small items are also built by a cheaper builder in a
    worktree (Sonnet at medium, then Opus at low), never merged, and compared with the Opus
    builder's work by one Opus helper. Small items move to the cheaper setup from phase 27 on
    only if it matched.
  - Expected saving: about 1 to 1.5 hours and 10 to 15% of the token cost per phase, more if
    the builder test passes.
- **Implemented:** `docs/plan/phase-helpers.md` (Keep your context small, Finisher, Phase
  reviewer, Fixer, Releaser), `docs/plan/README.md` (steps table, The coordinator),
  `.github/workflows/check.yml` (screenshots kept per part).
- **Builder model test result:**
  - Item 2 (no abandon vote in ranked games): Opus at medium 5 min, 70k tokens, 21 tool calls;
    Sonnet at medium 14 min, 80k, 43 (test branch `worktree-agent-a8166e151fdcb0c7c`, 536e38f,
    never merged). The code was identical, but Sonnet missed the `PROTOCOL_VERSION` raise a new
    reason code needs (Q75), which a reviewer would have sent back. Verdict: nearly, not a match;
    and Sonnet took twice the tool calls, so it saved nothing.
  - Item 4 (deleting an account leaves the queue): Opus at medium 8 min, 103k tokens, 43 tool
    calls; Opus at low 11 min, 110k, 47 (test branch `worktree-agent-a06d963078c3f60bc`,
    8a4fa54a, never merged). Both server fixes were correct, but the low-effort builder did not
    write its decision into the spec (A1.15) first, wrote one combined scenario and one route
    test that was never cleanly shown to fail without the fix, where Opus at medium wrote two
    scenarios and two route tests, each proven. Verdict: nearly, not a match; and it saved
    nothing.
  - **Conclusion:** neither cheaper setup matched, and neither used fewer tokens or minutes:
    both took more tool calls. Builders and fixers stay on Opus at medium, small items too.

## Q134. What is a player who is confirming a ranked match, and what ends their confirming?

- **Phase:** 26 (starter).
- **Question:** A8.5 says matched players "leave the queue", while A8.7 gives them 20 seconds to
  confirm. The spec does not say whether a confirming player still counts in the queue (A8.4), is
  still busy for M2.1 (could they join a room meanwhile?), what leaving the queue while
  confirming means, or what a closed connection does then (A8.10). A8.10 also does not say what
  happens with the site open in several tabs, or whether that leaving brings a rejoin wait.
- **Options:** treat a confirming player as out of the queue for everything; or as still in it
  for everything; or out of the counts but still busy.
- **Solution:** out of the counts (A8.4: they no longer wait), but still in the ranked queue for
  M2.1, so they cannot join a room while confirming. Leaving the queue while confirming declines
  the match (with the 2-minute wait of A8.9). A closed connection while confirming changes
  nothing; the 20 seconds decide, as a confirmed player who then disconnects is simply a
  disconnected player in the game (M5). The 10 seconds of A8.10 count from the moment the last
  of the player's connections closed, and leaving that way brings no rejoin wait. A8.7 also says
  that a confirming player is not told how many have confirmed (that would hint at who). Written
  into A8.7 and A8.10 first.
- **Implemented:** phase 26, Progress items 1b and 1c.

## Q135. What is the "new room made for" a ranked game?

- **Phase:** 26 (starter).
- **Question:** A8.8 starts the game "in a new room made for it", but rooms have an owner, are
  public or private, and start with the asking of M1.10 (M1). None of that is said for the
  ranked room.
- **Options:** a public room that waits and asks like any other; or a private room that starts
  at once.
- **Solution:** a private room, not listed in the lobby, of the match's game size, owned by the
  matched player who waited longest, whose game starts at once without the asking of M1.10 (the
  players have just confirmed). After the game it is a finished room like any other (M8), so a
  rematch there is casual (M8.5). Seat order is drawn as in any game. Written into A8.8 first.
- **Implemented:** phase 26, Progress item 1b.

## Q136. What happens to a confirmed match that cannot start because of a daily limit?

- **Phase:** 26 (starter).
- **Question:** A9.4 stops the queue from making matches once 50 games started today, and A9.3
  checks a player's game starts again when a game starts. Between a match being made and all its
  players confirming, room games can reach the site limit. The spec does not say what happens to
  that match. A player's own limits (A9.2, A9.3) cannot grow while they wait in the queue, since
  M2.1 keeps them out of games, but the check when the game starts must still have an outcome.
- **Options:** start the game anyway; or let it fail like a match a player did not confirm (with
  the rejoin wait); or put everyone back without a wait.
- **Solution:** the game does not start, and nobody is to blame: its players go back to the queue
  at the front, in their earlier order, with their game sizes and without a rejoin wait, and see
  the site-wide message of A9.4; the queue then makes no match until 00:00 UTC. Should a matched
  player have reached A9.2 or A9.3, that player leaves the queue without a rejoin wait and is told
  why (as A9.3 does in a room), and the others go back the same way. Written into A9.4 first.
- **Implemented:** phase 26, Progress item 1b.

## Q137. What do the ranked queue panel and the match-found dialog say?

- **Phase:** 26 (starter).
- **Question:** S10.4 asks for the reasons the button is disabled, and S10.7 for what happens if
  you decline, without the texts. Nothing says what a player is told when a match does not start,
  what a rejoin wait in the queue says (the `rejoin_too_soon` text speaks of "this room"), which
  text a rejected join with `email_not_confirmed` shows (S10.9's text is for password resets),
  or which reason codes a change of sizes, leaving or confirming gets when the player is not in
  the queue or the match is gone.
- **Options:** take the design's texts where it has them (boards "Lobby: in the ranked queue",
  "Lobby: match found", "Lobby: ranked locked") and write the rest in the same voice.
- **Solution:** the design's texts where they agree with the spec, the rest written to match;
  all in S10.4, S10.7 and S10.9. New reason codes `not_in_queue` and `no_match_to_confirm` (a
  match can expire while the player clicks). `invalid_game_sizes` only comes from a broken or
  forged client, because the last chosen size cannot be turned off, and shows "Something went
  wrong". The match-found dialog has only **Decline** and **Confirm** (the design's × is not
  used, so the dialog cannot be dismissed by accident).
- **Implemented:** `screens.md` S10.4, S10.7, S10.9; phase 26, Progress item 3a.

## Q138. Does the ranked queue panel show the player's rating in phase 26?

- **Phase:** 26 (starter).
- **Question:** S10.4 shows "your rating and number of ranked games". Ratings (A10) and the
  number of ranked games that changed ratings (A10.5) are built in phase 27; this phase plays
  ranked games without changing ratings.
- **Options:** show 1000 and 0 for everyone (true by A10.1 and A10.5 until phase 27, but a value
  no code computes); or leave the line out until the ratings exist.
- **Solution:** leave it out, as a known gap of phase 26; phase 27 adds it with the ratings, with
  the rating in the top bar (S10.1) and in players online (S10.2).
- **Implemented:** phase 26 Known gaps; phase 27.

## Q139. What "queue use" does the busy day of B18 include?

- **Phase:** 26 (starter).
- **Question:** B18's busy-day simulator must include "queue use", without saying how much.
- **Options:** a few joins only; or a day where a large share of the 50 games come from the queue,
  with the failures and leaving the queue that real use brings.
- **Solution:** 20 of the busy day's 50 games are ranked games from the queue (7 of 2 players, 7
  of 3 and 6 of 4: 59 players). Every one of those players joins the queue once and changes
  their game sizes once; 5 of the matches fail once first because one player declines (who joins
  again after the wait), and 30 more players join the queue and leave it without a game (15 by
  leaving, 15 by a closed connection). Every row the queue and the lobby write for this counts,
  including alarm changes. The other 30 games are room games as before.
- **Implemented:** `tools/simulator/busyDay/`; phase 26, Progress item 3b.

## Q140. Can a player who is confirming a ranked match change their game sizes?

- **Phase:** 26 (builder, item 1a).
- **Question:** A8.3 lets a player in the queue change their game sizes "at any time", and Q134
  keeps a confirming player in the ranked queue for M2.1, but a confirming player no longer
  waits (A8.4). The spec does not say whether a change of sizes while confirming is refused or
  kept.
- **Options:** refuse it with `not_in_queue`; or keep the new sizes for when the player goes back
  to the queue after a match that did not start (A8.9), without matching anew.
- **Solution:** keep them. The change is accepted, makes no new match (the player is not
  waiting), and the player goes back with the new sizes if the match does not start (A8.9 "with
  their game sizes"). A player neither waiting nor confirming gets `not_in_queue`.
- **Implemented:** `src/server/queue/changeQueueSizes.ts`; phase 26, Progress item 1a.

## Q141. Scenario `lobby-queue-and-limits` #23 lists only Ann under `then.accounts`

- **Phase:** 26 (builder, item 1a).
- **Question:** "a player's actions in a game are added to the daily count when the game ends"
  gives two accounts, Ann and Bea, but its `then.accounts` lists only Ann. Every other scenario
  reads `then.accounts` as the full list of accounts, which the deletion and guest-removal
  scenarios depend on, so as written the scenario says Bea's account is gone, which nothing in
  the spec makes happen (A9.2 only adds actions).
- **Options:** make the lobby driver read `then.accounts` as "these accounts, others ignored",
  which would weaken the deletion scenarios; or list Bea in the scenario.
- **Solution:** list Bea: `accounts: [{name: Ann, actions_today: 2005}, {name: Bea}]`. Nothing
  else about the scenario changes. The driver gains `given.players` with
  `given.seats[].actions_this_game` (a playing room whose seat has that many non-system actions
  in its log), seat steps, and `then.accounts[].actions_today`.
- **Implemented:** `harness/scenarios/lobby-queue-and-limits.yaml` (`HARNESS:` commit);
  `tools/harness-runner/lobby/`; phase 26, Progress item 1a.

## Q142. When a player declines a ranked match, what happens to the players who have not confirmed yet?

- **Phase:** 26 (builder, item 1b).
- **Question:** A8.9 says players who did not confirm leave the queue with a 2-minute wait, and
  those who confirmed go back to the front. When one player declines while another has not yet
  answered, that other player "did not confirm" only because the match ended before they could.
  The spec does not say whether the match waits for the 20 seconds, or who gets the wait.
- **Options:** keep the match open until the deadline; end it at once and give everyone who had
  not confirmed the wait; or end it at once and give only the decliner the wait.
- **Solution:** a decline ends the match at once (nobody waits 20 seconds for a game that cannot
  start); only the player who declined leaves with the wait; the others, confirmed or not yet,
  go back to the front in their earlier order and are matched again. When the 20 seconds run
  out, everyone who had not confirmed leaves with the wait, counted from the deadline. When
  several matches fail at once, the players of the earliest match go first. Written into A8.9
  first.
- **Implemented:** `src/server/queue/declineMatch.ts`, `fireQueueAlarm.ts`; phase 26, Progress
  item 1b.

## Q143. Which scenarios cover deleting an account in the ranked queue (A1.15)?

- **Phase:** 26 (builder, item 4).
- **Question:** A1.15 says a player in the ranked queue leaves it when their account is deleted,
  but no scenario covers it, and the spec does not say what happens to a ranked match the player
  is confirming, or whether the leave waits like a closed connection (A8.10).
- **Options:** treat deletion as a closed connection (leave after 10 seconds); or leave at once,
  as `leave_queue` does, which declines a match being confirmed (A8.9, Q142).
- **Solution:** deleting leaves at once, exactly as leaving the queue does: a waiting player is
  out of the queue straight away, and a match they are confirming counts as declined (the others
  go back to the front and are matched again), written into A1.15 first. Two scenarios added to
  `harness/scenarios/accounts.yaml` (`HARNESS:` commit): "deleting an account in the ranked queue
  takes it out of the queue at once" and "deleting an account while confirming a ranked match
  declines it".
- **Implemented:** `src/server/RankedQueue.ts` (`logOut` leaves the queue when the login is
  leaving), `tools/harness-runner/lobby/deleteAccountInLobby.ts`; phase 26, Progress item 4.

## Q144. How does the lobby know why the ranked queue is locked for a player?

- **Phase:** 26 (builder, item 3a).
- **Question:** S10.4 disables **Join the ranked queue** with a reason for logged-out players,
  guests, unconfirmed email addresses, a rejoin wait (A8.9) and the player's own daily limits,
  and S10.7 shows "Confirmed. Waiting for the other players." after **Confirm**. The queue view
  (item 1c) told a player only whether they are out, waiting or confirming, so after a reload the
  page could not show a rejoin wait, a daily limit or a confirmation already given, and nothing
  said where the email standing comes from.
- **Options:** look everything up in D1 for each view the queue sends; or let the queue view
  carry what the queue and the lobby already hold, and take the email standing from the account
  the page already loads.
- **Solution:** the queue view's own state carries, for a player out of the queue, the rejoin
  wait's end and their own daily limit (from the queue and lobby records, no extra reads), and
  for a confirming player whether they have confirmed. Logged out and guest come from the
  session; an unconfirmed email address from the account details (`/api/account`, as the account
  dialog loads them), loaded again after a rejected join with `email_not_confirmed` and after an
  email link is opened. Written into S10.4 first. `PROTOCOL_VERSION` 22.
- **Implemented:** phase 26, Progress item 3a.

## Q145. What does a player of a confirmed match hear when it does not start for another reason?

- **Phase:** 26 (builder, item 3a).
- **Question:** S10.7 tells a player who confirmed "The match did not start because a player did
  not confirm", but a confirmed match can also stop because another matched player reached their
  own daily limit (Q136, the others go back to the front) or because no room could be made
  (item 1c, the players leave the queue). Both got the same notice, whose text is then wrong.
- **Options:** one neutral text for all three; or a reason in the notice with a text each.
- **Solution:** the `match_not_started` notice carries its reason (`not_confirmed`,
  `player_daily_limit`, `no_room`), each with its own text in S10.7, written there first.
- **Implemented:** phase 26, Progress item 3a.
