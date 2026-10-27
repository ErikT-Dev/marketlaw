# Phase 07: Drawing and income

Status: approved
Milestone: 3 Playthrough

## Goal

The complete deck and drawing rules, automatic income, and the draw log.

## Depends on

Phase 06.

## Covers

- Rules: R17 complete (fallbacks R17.4 steps 2–5, holding pile, R17.10 by turn), R13, R2.3,
  R5.5 (own deck count), M3.3's draw events.
- Checks: `HARNESS.md` point 7, the statistical tier check (100,000 draws per turn within 1
  percentage point of R17.10).
- Screens: S7.1–S7.2 (the draw log tab; the chat tab comes in phase 21), S4.2's deck count and
  discard pile view. Design boards "Draw log row", the draw log panel of "Game main phase
  1920x940".

## Builds

1. **Drawing** complete in the engine; every draw recorded as a public draw event.
2. **Income** checked after every action (R13.2).
3. **Draw log panel** newest first with turn numbers, and the deck count and discard pile view.

## Known gaps after this phase

- Others' actions still visible at once (phase 09); no market phase (phase 12).

## What you can see when it's done

In a two-window game, income happens by itself when product and distribution meet, and the draw
log lists every draw.

## Exit criteria

- The statistical tier check passes.

## Open points

- None.

## Required scenarios

These 11 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `combos-and-income` #9: income happens by itself when product and distribution are both there and no stat is negative
- `combos-and-income` #11: no income while a stat is negative
- `combos-and-income` #12: no income with product but no distribution
- `drawing` #3: if a tier is empty the nearest other tier is used and the lower one first
- `drawing` #4: tier 3 falls back to tier 2 before tier 1
- `drawing` #5: if the whole sector is gone the top card of the deck is drawn
- `drawing` #6: with an empty deck the discard pile is shuffled in before the top card is drawn
- `drawing` #7: with no cards left at all nothing is drawn
- `drawing` #9: main-phase draws do not use cards sold in the same main phase
- `drawing` #12: a random draw in turn 13 asks for a sector and then a tier
- `drawing` #13: from turn 27 every tier-by-turn draw is tier 3 and no tier is asked for
