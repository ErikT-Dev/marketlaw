# Phase 15: End of the game and scoring

Status: done
Milestone: 3 Playthrough

## Goal

Games end after the turn in which a player reaches the end goal, or after turn 40. Every player
gets a score and a place, and the end-of-game screen shows the result. The simulator now plays
complete games, which makes the game-length checkpoint possible.

## Depends on

Phases 13 and 14: the score uses every stat, type and turn rule.

## Covers

- Rules: R1.1, R1.3, R21, R16.6 in the final turn.
- Invariants: I21, I22, and every game-rule invariant over complete games.
- Budgets: B4, B5, B9, B13, B16, B17 over complete simulated games played by the legal bot.
- Screens: S9.5 for "end goal reached" and "turn limit" (casual; the ranked columns come in phase
  27). Design boards "End: end goal reached", "End: turn limit, ranked" without the rating
  columns.

## Builds

1. **End conditions and scoring;** no end-of-turn steps in the final turn.
2. **Ended phase:** every action is rejected with `game_over`; the room keeps the result.
3. **End-of-game screen** with places, results, scores and stats.
4. **Simulator on complete games:** 5,000 per `npm run harness`, all invariants.
5. **Game-length report** for O5: turns per game, scores, funds over time, rows written per game,
   and how often each end condition is reached, by game size, with a note on how far bot numbers
   can be trusted.

## Known gaps after this phase

- Rooms and guests are still phase 04's minimal version (phases 16–17).
- Players who left are placed after everyone still in the game, but among themselves by score,
  not by the order they left (A3.4), since nothing records that order yet. Nobody can leave a
  game until phase 19, which closes this (Q49).

## What you can see when it's done

- A test room near the end goal played to the end, with the end-of-game screen.
- The game-length report, for the O5 review with the owner.

## Exit criteria

- All game-rule invariants hold over 5,000 complete games; the listed budgets within limits.
- The owner has seen the game-length report (O5 review).

## Open points

- O5: rule changes after the review go into the spec first and are built before phase 20 ends.

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `end-of-game` #1: reaching the end goal ends the game after that main phase without end-of-turn steps
- `end-of-game` #2: the game goes on until the main phase ends after the end goal is reached
- `end-of-game` #4: the game ends after the main phase of turn 40 and is scored with the formula
- `end-of-game` #5: the score is computed exactly before rounding down
- `end-of-game` #6: bonus types score their point value for every count in the type counts including gained types
- `end-of-game` #7: equal scores are broken by who became done earlier in the final turn
- `end-of-game` #8: players made done at the same moment in the final turn are placed in player order
- `end-of-game` #9: players who left come after every player still in the game
- `hostile-client` #13: rejects any action after the game has ended

## Progress

- [x] 1. End conditions and scoring: after the main phase in which a player still in the game has
  income 22 and all 3 projects, or after turn 40, the game ends without end-of-turn steps
  (first-completion rewards still given); scores in hundredths, rounded down; places by score,
  then done order, then player order, players who left last. The state keeps the result.
- [x] 2. Ended phase: every action rejected with `game_over`; no clocks; views carry the result.
  Built in the same commit as item 1.
- [x] 3. End-of-game screen (S9.5) for "end goal reached" and "turn limit".
- [x] 4. Simulator on complete games: 5,000 per `npm run harness`; I21, I22; B4, B5, B9, B13, B16,
  B17 measured. Legal-bot games are played to the end, chaos-bot games until turn 10 (Q46). Rooms
  are stored compressed so B13 is measured on the stored bytes (Q47). Views are built once per
  room state, which keeps `npm run check` under 5 minutes.
- [x] 5. Game-length report for O5: a "Game length (O5)" section in `harness/report.html`.

## Report

**What was built.**
- **End of the game (R1.1, R1.3, R21.1, R21.2, R16.6):** the game ends after the main phase in
  which a player still in the game has income 22 and all 3 projects, or after the main phase of
  turn 40. The final turn has no end-of-turn steps; first-completion rewards are still given, and
  cards sold in it join the discard pile.
- **Scores and places (R21.4–R21.9):** scores are summed exactly in hundredths and rounded down,
  with bonus-type points; places follow score, then who became done earlier in the final turn,
  then player order, with players who left last. After the end every action is rejected with
  `game_over`, no clock runs, and every view carries the result.
- **End-of-game screen (S9.5):** the winner, why the game ended, and every player's place, score
  and values, for "end goal reached" and "turn limit" (casual columns; ratings come in phase 27).
- **Complete games in the simulator:** legal-bot games are played to the end, chaos-bot games to
  turn 10 (Q46). I21 and I22 are checked over 5,000 games per `npm run harness`, and B4, B5, B9,
  B13, B16 and B17 are measured: 712 and 928 rows written per 3- and 4-player game (limit 1,600),
  562 incoming messages (1,000), 562 rows read (50,000), largest stored room 22 KB (100), largest
  replay record 61 KB (100).
- **Rooms are stored compressed (Q47)** and read and written once per message, alarm or call.
  Each player's update is built once per room state, which kept `npm run check` at about 4
  minutes with complete games.
- **Game-length report (O5):** a "Game length (O5)" section in `harness/report.html` with turns,
  end conditions, scores, funds over time and rows written, by game size.
- **Checks:** 11 scenarios required (the 9 of the phase plus `visibility` #15 and `end-of-game`
  #10 from the review), I21, I22 and B4, B5, B9, B13, B16, B17. Save version 11.

**What to try (after the merge).** `npm run test-room -- end-of-game 1` starts a room one project
away from the end goal; complete the workforce project and end the turn in both windows: the
end-of-game screen shows the winner, places and scores. Open `harness/report.html` for the game
length section.

**Differences from the phase file.**
- Chaos-bot games stop at turn 10 instead of being played to the end (Q46).
- Players who left are placed among themselves by score, not by the order they left (A3.4);
  nobody can leave before phase 19, which closes it (Q49, known gap).
- The exit criterion "the owner has seen the game-length report" waits for the owner's review of
  version 1; O5 was decided under D19 as D24: no rule change until real games can be measured
  (Q48). Random bots end about 62% of games by the end goal, around turn 39, and funds pile up
  late (67 to 91 on average at turn 40).
- Local browser tests need `--workers=2` on this computer (`proposed-rules.md`); GitHub runs
  them as configured and passed.

**Decisions:** Q45, Q46, Q47, Q48 (D24), Q49, Q50.

**Phase review findings and what happened to each:**
1. **Rooms in the old storage format, or unreadable, were never deleted.** Fixed: the store
   deletes such a room on load and closes its sockets, like an outdated save; server tests cover
   both cases.
2. **Players who left were not ordered as A3.4 says, and I22 did not check the R21.9
   tie-breaks.** I22 now checks that equal scores are placed by the done order and then player
   order (unit test). The leave order is a known gap for phase 19 (Q49).
3. **The R5.5 change (Q45) and the final-turn discard fix had no scenario.** Fixed: `visibility`
   #15 and `end-of-game` #10, both required (Q50). The case "my own shuffle after another
   player's hidden shuffle" cannot happen within one main phase, so it has no scenario (Q50).
4. **The simulator skipped the shown-piles and type-count checks for unchanged views.** Fixed:
   they run for every view again; it cost no measurable time.
5. **An exception inside `blockConcurrencyWhile` resets the room.** Fixed: decoding never throws,
   and the D1 token lookup runs before the room is locked.
6. **B11 does not include the cost of compression.** Answered: compressing and decompressing a
   99 KB room takes about 2.3 ms in Node on this computer, inside the 10 ms CPU limit together
   with a message's view building; phase 20 (cost protection) measures CPU per message on the
   live platform.
7. **`STORED_ROOM_SCHEMA` checks almost nothing.** Answered: it is no looser than the
   `kv.get<RoomRecord>` it replaced; the version check in `loadRoom` still removes old saves.
8. **I22 reuses the engine's bonus-type points.** Answered: `end-of-game` #6 checks bonus-type
   points with fixed numbers; the rest of the formula is independent.
9. **B16 counts only Durable Object reads.** Fixed in the report text: it now says the D1 token
   lookups are not counted (one per new connection, far below the limit).

