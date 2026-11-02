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
