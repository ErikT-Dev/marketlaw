# Phase 06: Game screen: hand, actions and moves

Status: in progress
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
