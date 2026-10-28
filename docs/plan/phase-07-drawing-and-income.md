# Phase 07: Drawing and income

Status: done
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

- Others' actions still visible at once (phase 09): every player sees other players' income
  draws, discard shuffles and the deck count straight away, not when the main phase ends
  (M3.3, R17.8, R5.5).
- No market phase (phase 12); marketplace refills and starting hands write no draw log entries
  yet (Q23).
- The draw log panel has a title instead of the Draw log and Chat tabs of S7.1 (chat comes in
  phase 21).
- No browser test reaches real income; the draw log is checked in the browser with entries
  added on the socket. Phase 08's test rooms add a real one.

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

## Progress

- [x] 1. Drawing complete in the engine. R17.4 was already built in phase 03; `drawCard` now also
  reports the discard shuffles it causes. Every income draw and the shuffles it causes go into a public draw log in
  the game state and the view, with who drew, how many, and the sector or kind and tier asked
  for, never the card (M3.3, R17.6). The save version went to 2. The statistical tier check runs
  in `npm run harness` (100,000 draws per turn, turns 1 to 40, within 1 percentage point of
  R17.10), and the engine driver can now check `log_contains`, so `drawing` #8 also passes.
- [x] 2. Income (R13) after every play and every sale, repeated while possible; End turn changes
  no stats, so it needs no check.
- [x] 3. Draw log panel, newest first with turn numbers, in the left column (the Chat tab comes
  with phase 21, so the panel has a title instead of tabs); the marketplace header shows the
  deck count and opens the discard pile. Browser tests find both at every size and screenshot
  the discard pile.

## Report

**What was built.**
- **Income (R13, R2.3):** after every play and every sale, while you have product and
  distribution and no negative workforce, quality or satisfaction, 1 of each is used up, income
  goes up by 1 and you draw a card of a random sector, tier by turn. It repeats while possible.
- **Drawing (R17):** the fallbacks of R17.4 were already in place; every draw now also reports
  the discard shuffles it causes, and main-phase draws leave sold cards in the holding pile.
- **Draw log (M3.3, S7.2):** who drew, how many, and the sector or kind and tier asked for, never
  the card; newest first with the turn number, in the left column.
- **Deck and discard (S4.2):** the marketplace header shows the deck count and opens the discard
  pile in a dialog.
- **Statistical check (HARNESS.md point 7):** 100,000 draws per turn for turns 1 to 40, within 1
  percentage point of R17.10; it runs in every `npm run harness` and shows in the report.
- **Required:** the 11 scenarios of this phase, all passing; `drawing` #8 passes too.

**What to try (after the merge).** Play a 2-player game for a few turns; once a Service card
gives distribution and an Industry card gives product (with no negative stat), income rises by
itself and the draw log shows "… drew 1 card: …, tier 1 (income)". After selling cards, end the
turn and open "Discard N · view ›" to see them. Screenshots: `harness/screens/draw-log/` and
`discard-pile/`; compare with your local boards "Draw log row" and "Game main phase 1920x940".

**Differences from the phase file.**
- The draw log panel has a title, not the S7.1 tabs; the Chat tab comes in phase 21.
- Only income draws are logged yet; turn draws and refills come with the market phase (Q23).
- The browser draw log test adds entries on the socket; a real income test waits for phase 08.
- The save version went to 2.

**Decisions:** Q23 (which draws are logged before the market phase).

**Phase review findings and what happened to each:**
1. **No browser test of a filled draw log.** Fixed: a browser test at every size adds entries to
   the room's updates on the socket and checks the rows, axe, 24 px targets and a screenshot. A
   real income test is added to phase 08's open points, and listed under Known gaps.
2. **The Progress note claimed every draw was logged.** Fixed; Q23 records starting hands and
   refill shuffles, and phase 12's open points pick them up.
3. **The draw log was not tested through `apply`.** Fixed: 3 tests through `apply` and `viewFor`
   with exact entries (a draw, a matching-discard shuffle, a whole-pile shuffle).
4. **The turn label used `aria-label` on a plain span.** Fixed: hidden text "Turn N".
5. **The deck count is found by text.** Answered: it is plain text in a named region
   ("Marketplace"), which the test finds by role and name first; giving static text a role would
   mislabel it (`status` would announce every draw).
6. **Known gaps not specific.** Fixed.
7. **Closing the discard pile lost focus; Escape did nothing.** Fixed in `Modal` and the dialog.

Also found while fixing: screenshots were taken before the stat icons loaded (icons became files
in phase 05); the screen check now waits for every image.
