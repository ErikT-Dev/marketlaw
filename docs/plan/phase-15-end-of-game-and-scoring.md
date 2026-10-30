# Phase 15: End of the game and scoring

Status: in progress
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

- [ ] 1. End conditions and scoring: after the main phase in which a player still in the game has
  income 22 and all 3 projects, or after turn 40, the game ends without end-of-turn steps
  (first-completion rewards still given); scores in hundredths, rounded down; places by score,
  then done order, then player order, players who left last. The state keeps the result.
- [ ] 2. Ended phase: every action rejected with `game_over`; no clocks; views carry the result.
- [ ] 3. End-of-game screen (S9.5) for "end goal reached" and "turn limit".
- [ ] 4. Simulator on complete games: 5,000 per `npm run harness`; I21, I22; B4, B5, B9, B13, B16,
  B17 measured.
- [ ] 5. Game-length report for O5.
