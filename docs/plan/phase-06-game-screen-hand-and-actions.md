# Phase 06: Game screen: hand, actions and moves

Status: done
Milestone: 3 Playthrough

## Goal

The hand, the big card, the action buttons and the handling of pending and rejected moves, as
designed, for everything the engine can do so far.

## Depends on

Phase 05.

## Covers

- Rules: S6.4–S6.8 (hand with real cost and "new" marks, big card with the cost explanation,
  action buttons for what exists, done state, pending and rejected moves), S8.4 (action limit),
  S16.3 (the messages for the reason codes that exist so far), `rules/frontend.md` "optimistic UI
  is explicit".
- Design boards: "Game: card selected", "Game: sell mode", "Game: you are done", "Game: move
  pending", "Game: move rejected", "Game: action limit reached".

## Builds

1. **Hand** in 2 columns, real cost, "new" marks (shown once phase 12 sets them), unplayable
   marks from data in the view.
2. **Big card** with what it costs and why, Play card and Close.
3. **Actions:** Play card, Sell mode, End turn; buttons for later actions are not shown yet.
4. **Done state:** which players the turn is waiting for.
5. **Pending and rejected moves:** faded with "Waiting for the server…", rolled back on rejection
   with the S16.3 message; `stale_state` reloads quietly. An e2e test covers a rejected move.
6. **Component tests** with `@testing-library/react`, which leaves knip's ignore list (approved
   with this phase).

## Known gaps after this phase

- No market phase, clocks, combos, influence, quests or opponents overview yet.
- The action limit (S8.4) is tested with component tests only; a browser test needs a game at
  50 actions, which the test rooms of phase 08 can set up.
- Hand cards are never marked "new" until phase 12 sets the marks.

## What you can see when it's done

The two-window game now looks like the design boards above: select a card, see its real cost
explained, play it, sell cards, end the turn; a move that fails rolls back with a message.

## Exit criteria

- The rejected-move e2e test passes.

## Open points

- None.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.

## Progress

- [x] 1. Hand in 2 columns: real cost and unplayable marks from the view. The engine adds
  `handDetails` to the own seat view: each card's real cost, the cards of its sector and tier
  already in the city, and `playRejection`, the reason code a play would get now (from the same
  check `apply` uses). "New" marks wait for phase 12, which sets them.
- [x] 2. Big card next to the hand with "Costs N funds", the S6.5 explanation, the reason when it
  cannot be played (its S16.3 text), and Close and Play card.
- [x] 3. Actions: Play card (the selected card), Sell cards and End turn. The engine also sends
  `sellRejection` and `endTurnRejection`, so buttons are disabled from view data (S6.6).
  Sell mode: the button says "Sell N cards", or "Cancel selling" when nothing is marked; the
  price per card is the shared `FUNDS_PER_SOLD_CARD`. At the action limit, the action area
  shows the S16.3 text and only End turn stays enabled (S8.4).
- [x] 4. Done state: "You are done for this turn" and the players still playing, by name.
- [x] 5. Pending and rejected moves: the store keeps each pending move's intent; a pending card is
  faded with "Waiting for the server…", a pending End turn says it on its button, and no other
  move can be sent meanwhile. A rejection shows "Move rejected" with its S16.3 text (Q21 adds
  `not_this_step` and the room codes); `stale_state` shows nothing. `e2e/rejectedMove.spec.ts`
  swaps the card in a play message on the socket and checks the rollback and the message.
- [x] 6. Component tests: 11 tests of the hand, big card, actions, done state, pending and
  rejected moves; the browser tests find the selected card, sell mode and done state by role and
  name at all three sizes, with screenshots in `harness/screens/`. The "move pending" and
  "action limit reached" boards are covered by component tests only: a pending move lasts
  milliseconds, and turn 1 cannot reach 50 actions without test rooms (phase 08).

## Report

**What was built.**
- **Engine:** the own seat's view now holds each hand card's real cost, the cards of its sector
  and tier already in the city, and the reason a play would be rejected now, plus whether
  selling and ending the turn would be accepted. All of it comes from the same checks a move goes
  through, so the screen never offers a move the room refuses.
- **Hand (S6.4):** two columns, real cost on each card, unplayable cards marked (also in their
  accessible description).
- **Big card (S6.5):** opens next to the hand with "Costs N funds", the explanation ("Base cost 4,
  plus 2 for the 2 Residential tier 1 cards already in your city."), the reason a card cannot be
  played, and Close and Play card.
- **Actions (S6.6, S8.4):** Play card, Sell cards (sell mode marks cards and sells them in one
  action) and End turn, disabled from view data; at the action limit only End turn works and the
  action area says why.
- **Done (S6.7):** "You are done for this turn" and who the turn is waiting for.
- **Pending and rejected moves (S6.8, S16.3):** a move waiting for the server is faded with
  "Waiting for the server…" and blocks other moves; a rejection rolls it back and shows "Move
  rejected" with its S16.3 text; `stale_state` stays silent; codes that promise a reload resync.
- **Tests:** 11 screen tests, 5 store tests, 2 engine tests; browser tests at all three sizes for
  the selected card, sell mode, done state, a pending move and a rejected move (both made on the
  socket), each with a screenshot, axe, 24 px targets and the leak check.

**What to try (after the merge).** In a 2-player game: click a hand card to see its cost
explained, play it, then select a tier 2 card to see why it cannot be played. Press Sell cards,
mark two cards and sell them. End your turn and see who the turn waits for. Screenshots:
`harness/screens/card-selected/`, `sell-mode/`, `you-are-done/`, `move-pending/`,
`move-rejected/`; compare them with your local boards "Game: card selected", "Game: sell mode",
"Game: you are done", "Game: move pending" and "Game: move rejected".

**Differences from the phase file.**
- Messages follow S16.3, not the design boards' longer texts ("You need 9 funds to play Loft…").
- The design's peach Play card button has dark text, for contrast.
- In sell mode with nothing marked, the sell button reads "Cancel selling".
- Known gaps: the action limit has no browser test yet (phase 08 adds it); no "new" marks until
  phase 12.

**Decisions:** Q21 (messages for `not_this_step` and the room codes), Q22 (`invalid_token`, and a
funds rejection without the card's cost).

**Phase review findings and what happened to each:**
1. **S6.8 and S8.4 had no browser test.** Fixed for S6.8: a test holds the play message on the
   socket and checks the pending state at every size. S8.4 is listed as a known gap and added to
   phase 08's open points, because turn 1 cannot reach 50 actions without test rooms.
2. **"The page reloads your game" but nothing reloaded.** Fixed: those codes resync (Q22).
3. **The store's rollback had no tests.** Fixed: 5 store tests with a fake host.
4. **`invalid_token` differed from S16.3.** Answered: S16.3 now has the Q17 behaviour as its own
   row (Q22).
5. **No scenario for the new view fields.** Answered: the scenario format cannot express them, and
   the rules behind them (R3.8 real cost, the play rejections) are covered by `playing-cards`
   scenarios; the view reports the result of the same check, tested in `handDetails.test.ts`.
6. **Cancel selling could be disabled.** Fixed.
7. **No test of the action limit on hand cards.** Fixed, in the engine and on the screen.
8. **The done banner had text S6.7 does not ask for.** Fixed: removed.
9. **Q21 next to S15.3.** Fixed: `not_this_step` follows S15.3; Q21 corrected.
10. **Tidy-ups.** Fixed: the funds message without a known cost (Q22), one `.right` rule, one
    player-name helper.
11. **No leak check in the new browser tests.** Fixed: every new browser test runs it.
