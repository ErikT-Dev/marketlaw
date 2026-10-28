# Phase 09: Hidden information and opponents

Status: done
Milestone: 3 Playthrough

## Goal

Everything a player may see about others, and nothing more: other players as at the start of the
main phase, their actions revealed when it ends, per-player state versions, the full leak test,
and the opponents overview.

## Depends on

Phase 08. Closes the visibility gap of phases 03–08.

## Covers

- Rules: M3.1–M3.5, R5.4, R5.5 (others' draws), R5.7 (as far as undo exists, completed in phase
  11), R17.6, R17.8 (others see shuffles when the phase ends), M9.4 per-player state versions.
- Invariants: I23, I24, I25.
- Checks: `HARNESS.md` point 3, the leak test, on every message in every simulated game and
  every e2e test.
- Screens: S3 (opponents overview, opponent's board pop-up), S2.2 (badges with done, away and
  left). Design boards "Opponent card", "Pop-up: opponent's board", "Player badge".

## Builds

1. **`viewFor` complete:** others' main-phase actions revealed only when the phase ends; others
   shown as at the start of the main phase with live status; deck and discard as R5.5 says; what
   is public about draws and marketplace cards (M3.3).
2. **State versions per player** that move only with what that player may see.
3. **Leak test** over every server message.
4. **Opponents overview and opponent's board** (time banks shown once phase 14 adds clocks).

## Known gaps after this phase

- Time banks on opponent cards are static until phase 14.
- The opponent's board shows stats, build passes, influence, time bank, done and the city by
  sector; type counts and combos (phase 10), influence actions used and the next build pass
  price (phase 11), completed projects (phase 10) and quests (phase 13), and project progress on
  the opponent cards (phase 10) come with those phases. "Away" comes with phase 18.
- `visibility` #11 becomes required in phase 18 (Q27).

## What you can see when it's done

In a three-window game, each window shows the other two as at the start of the main phase, with
live done marks, and their actions appear when the phase ends.

## Exit criteria

- The leak test finds nothing in 10,000 games and in the e2e tests.

## Open points

- None.

## Required scenarios

These 6 scenarios are added to `harness/required.yaml` in this phase, by file and number
(`visibility` #11 moved to phase 18, Q27):

- `drawing` #8: other players see only the sector and tier asked for when a fallback is used
- `hostile-client` #14: another player's hidden action does not change my state version
- `visibility` #3: another player's main-phase actions stay hidden until the phase ends
- `visibility` #4: whether another player is done is shown during the main phase
- `visibility` #5: main-phase actions are revealed when the main phase ends
- `visibility` #12: no player receives the random seed or the deck order

## Progress

- [x] 1. `viewFor` complete for what exists: the state keeps a snapshot of the start of the main
  phase; during it, other players are shown from the snapshot with live done, left and time bank;
  the deck count and discard pile are as at the start minus the viewer's own draws plus the
  viewer's own shuffles (R5.5, R17.8); others' draw log entries appear when the phase ends (M3.3).
  Save version 4.
- [x] 2. State versions per player: already in place since phase 04 (only the actor's version
  moves, everyone's on a phase change); the room driver now runs game steps, so
  `hostile-client` #14 checks it.
- [x] 3. Leak test: the simulator checks every update every seat could get, after every message,
  for cards hidden from it and the seed (I23), for others shown as at the start of the main phase
  (I24) and for state versions (I25); the browser tests check every message for other players'
  hands. Two deliberate breaks (others shown live; another hand sent) were caught in every game.
  The harness takes about 1.5 minutes and `npm run check` about 4.
- [x] 4. Opponents overview and opponent's board, with what exists so far (see Known gaps). Stat
  numbers got a light tint and the sector chips a darker shade, for contrast.

## Report

**What was built.**
- **Hidden main phase (M3.2, R5.4, R5.5, R17.8):** during the main phase you see the others as at
  its start, with live done, left and time bank; your deck and discard pile are the start's, with
  only your own draws and shuffles applied (Q28); others' draw log entries appear when the phase
  ends. The room no longer sends you anything when another player makes a hidden move, so not even
  its timing shows.
- **State versions (M9.4):** already per player; now checked by `hostile-client` #14 through real
  messages.
- **Leak test (HARNESS.md point 3, I23–I25):** after every message in the 10,000 simulated games,
  the simulator checks what each seat is sent: no hidden card or seed, others as at the start, the
  deck and discard of R5.5, no update that carries no change, and state versions. Deliberate breaks
  of each kind were caught. Every multi-player browser test checks the frames for other players'
  hands.
- **Opponents (S3, S2.2):** a card per opponent and their board, with what exists so far.
- **Required:** 6 scenarios of the phase (`visibility` #11 moved to phase 18, Q27) and I23, I24,
  I25.

**What to try (after the merge).** Open the game in three windows. In one, sell a card and end your
turn: the others see you as done but still with 7 cards; when everyone has ended the turn, they see
6. Open "See …'s board" on an opponent card.

**Differences from the phase file.** `visibility` #11 waits for phase 18 (Q27); the board shows
what exists so far (Known gaps). During this phase the owner removed the site lock (D22).

**Decisions:** Q27, Q28, Q29, D22 (owner).

**Phase review findings and what happened to each:**
1. **Other players learned the timing and number of hidden moves** from empty update frames.
   Fixed: only players whose view changed are updated; the simulator flags an update without a
   change.
2. **The deck count shown could go below 0, and a card show in hand and discard.** Fixed with Q28,
   written into R5.5 and I24 first; seats remember their draws this phase. Save version 5.
3. **The I24 check ignored the deck and discard.** Fixed: checked against R5.5 independently, with
   a direct test, since simulated players rarely draw in the main phase before phase 12.
4. **`visibility` #12 could not fail.** Fixed: it looks for deck cards and a seed field.
5. **The leak scan skipped every start-of-phase discard card.** Fixed: only the discard actually
   shown is skipped.
6. **The browser leak check was not in every test and checks final hands only.** Partly fixed: every
   multi-player browser test runs it (test rooms open one window). It still checks final hands,
   because a card held earlier can later become public (sold, then discarded); every message is
   checked in the simulator.
7. **Fallback shuffles show the fallback tier.** Answered with Q29, written into R17.6: the discard
   pile is public, so the shuffle shows the tier shuffled.
8. **Test rooms took the snapshot from the caller.** Fixed: the server builds it.
9. **A weak assertion.** Fixed, and the reshuffled-draw case has a test.

Also found: `npm run check` ran the 10,000-game harness twice (once in `npm run test`); it now
runs it once and takes about 2.7 minutes.
