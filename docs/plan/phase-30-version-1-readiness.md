# Phase 30: Version 1 readiness

Status: approved
Milestone: 7 Launch

## Goal

Everything `harness/HARNESS.md` requires for "the game passes the harness", at every supported
screen size, and the owner's decision to make version 1 public.

## Depends on

All earlier phases, 29c included.

## Covers

- Rules: every rule in `harness/spec/`.
- Scenarios: all 427 on `harness/required.yaml`; the "not yet" allowance of `rules/testing.md`
  ends.
- Invariants: all 30 over the phase-end games of `npm run harness` (D25). Budgets: all 19.
- Checks: every point of "What passing means" in `HARNESS.md`, 0 to 7.
- Screens: every screen at every size decided in O2, with screenshots in `harness/screens/`.

## Builds

1. **Gaps:** whatever the harness report still shows as "not yet", failing or unmeasured.
2. **Screen sizes, accessibility:** every screen at every supported size; keyboard-only run
   through a full game; `prefers-reduced-motion` respected.
3. **Browser tests:** 2–4 players through full games, refreshes, disconnects, a second tab and a
   forced restart, at every size.
4. **Launch preparation:** final data wipe; the save format fixed at a version from which
   migrations are kept (D1); the site lock already removed (D22); the test-room
   tool stays owner-only (D8), with its test passing on the public site; deploy; the owner's final
   playthrough.

## Known gaps after this phase

- None allowed.

## What you can see when it's done

The complete harness report, every line passing, and screenshots of every screen at every size.

## Exit criteria

- The game passes the harness, every point of "What passing means".
- The owner decides to make version 1 public.

## Open points

- Findings from the final playthrough are fixed, or moved to after version 1 with the owner's
  agreement.

## Required scenarios

None by name: phases 03 to 29 together make all 427 scenarios required. This phase checks that `harness/required.yaml` holds every scenario, every invariant and every budget.
