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
