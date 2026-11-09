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
  iteration from the live measurements: 8 ms. The live measurement after the phase 23 merge goes
  here.

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
