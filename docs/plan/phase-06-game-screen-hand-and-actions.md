# Phase 06: Game screen: hand, actions and moves

Status: approved
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

## What you can see when it's done

The two-window game now looks like the design boards above: select a card, see its real cost
explained, play it, sell cards, end the turn; a move that fails rolls back with a message.

## Exit criteria

- The rejected-move e2e test passes.

## Open points

- None.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.
