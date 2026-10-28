# Phase 05: Game screen: layout and components

Status: in progress
Milestone: 3 Playthrough

## Goal

The design system and the game screen's layout: tokens, assets, the shared components, and the
three-column table at every candidate screen size, so the owner can decide the supported sizes
(O2).

## Depends on

Phase 04.

## Covers

- Rules: S1 (layout, scrolling panels), S2.1–S2.2 (top bar without clocks), S6.2 (your stats),
  `rules/frontend.md` (desktop sizes, "please use a larger screen" below 1280 wide, accessible
  controls, styling from tokens, bundle size).
- Design boards: "Game main phase 1920x940", "Page shell 1920x940", "Game: loading", "Game: hover
  a stat icon", the library boards "Colours", "Icons", "Backgrounds" and the components listed
  below.
- Budgets: B14 (first download).

## Builds

1. **Design tokens:** `design/export/tokens.json` becomes `src/client/tokens.css`, the one source
   of styling values.
2. **Assets (D13):** card photos converted to WebP and committed with the type icons and
   backgrounds under `src/client/assets/`, loaded only when shown. Approving this phase approves
   one development dependency for the one-time conversion, named in the phase before it is
   installed.
3. **Components**, one per file with typed `Props`: Button, Button loading labels, Modal, Modal
   backdrop, Toast, Stat chip, Hand card, Big card, Played card, Player badge, Type chip, Type
   tooltip, Pending marker, Tab, Text input, Timer chip (static until phase 14).
4. **Game screen layout** (S1.2): top bar, three columns, scrolling panels, built to stretch.
   The top bar's Menu button is not shown until phase 28.
5. **Size test for O2:** the game screen at 1280×720, 1920×1080 and 2560×1440 with the densest
   content the design allows (5 quests with 4 players, a long hand), checked for 24 px targets and
   no horizontal scrolling. The owner decides O2 from the screenshots.
6. **Bundle check:** `.size-limit.js` changed to measure only what the first screen loads
   (approved with this phase; the file is protected).
7. **Accessibility check:** `@axe-core/playwright` runs on every screenshot; it leaves knip's
   ignore list (approved with this phase).

## Known gaps after this phase

- The hand and actions still use phase 04's bare controls inside the new layout (phase 06).
- The opponents panel shows phase 04's bare text for each opponent (phase 09).
- The Marketplace (phase 12), Quests (phase 13), Combos (phase 10) and Draw log (phase 07)
  panels are empty, and Your city lists card names as text (phase 06).
- Your stats has no type counts yet (S6.2; phase 10 puts them in the view).
- Top-bar badges never show "away" (phase 18), and there is no "Game: loading" screen yet:
  the waiting page shows until the first game update arrives.

## What you can see when it's done

The two-window game inside the real table: top bar, columns, stats with icons and tooltips.
Screenshots at three sizes next to the design board, for the O2 decision.

## Exit criteria

- O2 decided and written into `rules/frontend.md` or `screens.md` S1.1 (approval).
- B14 within its limit.

## Open points

- O2.

## Required scenarios

None. This phase adds no scenarios to `harness/required.yaml`.

## Progress

- [x] 1. Design tokens: `npm run design:tokens` writes `src/client/tokens.css` from the export
- [x] 2. Assets: `npm run design:assets` (52 tinted icons from the Penpot library; 240 photos
  at 554x478 and 2 backgrounds as WebP through Playwright's Chromium, so no new dependency)
- [x] 3. Components, one per file, with tests by role and name. Type tooltip is part of Type chip
  and Stat chip; Button loading labels are Button's `loadingLabel`. Differences: hand cards also
  get an accessible description (number, real cost, "new", "cannot be played"), because the
  design marks these only by colour; the Tab's unread count is now part of its name; Hand card
  and Played card share `CardTileFace`. Client tests clean up after each test through
  `vitest.config.ts` `setupFiles` (owner change, see below).
- [x] 4. Game screen layout (S1.2): top bar, three columns, scrolling panels. Each column is its
  own grid with the design's height ratios; the side columns keep a minimum width (280 and 400
  px) and the middle one takes the rest. Differences: the engine now puts the turn's player order
  in every view (R4.4, R4.5, pulled forward from phase 12 so the client never works it out);
  players who left come after the order (Q18). Your stats show the ten S6.2 stats as icons with
  their names as tooltips; type counts wait for phase 10, which puts them in the view. Success
  and danger buttons use the darker shade from the tokens and warning buttons dark text, because
  the design's white-on-colour text fails the 4.5:1 contrast the axe check needs. No user box or
  Leave game yet (S2.3 is not in this phase). A scrolling panel's scroll area takes keyboard
  focus while its content overflows (after the owner's config change below).
- [x] 5. Size test for O2: `e2e/gameScreenSizes.spec.ts` starts a 4-player game with the longest
  names and, at each of the three sizes, saves a screenshot to `harness/screens/gameScreenSizes/`,
  checks there is no horizontal scrolling, that every button, link, input and tab is at least
  24×24 px, and runs axe. All pass. Difference: "the densest content the design allows" cannot be
  shown yet. Quests appear in phase 13, a long hand needs later turns or the test rooms of phase
  08, and the hand and opponents are still phase 04's bare content. The screenshots show the
  table, top bar and stats at full density for 4 players; the test reruns them as panels fill.
- [x] 6. Bundle check (`.size-limit.js`, applied by the owner). The first screen is 143.6 KB of 300 (B14). `vite.config.ts` now writes Vite's
  manifest, so the check can count the entry script, its stylesheet and every chunk they
  import, and nothing loaded later.
- [x] 7. Accessibility check on every screenshot (`knip.json`, applied by the owner: axe and
  Testing Library left the ignore list). Axe already
  runs in both browser tests that take or check the game screen.


## Waiting for the owner

Nothing at the moment.

Done by the owner, 2026-10-28: `tsconfig.tools.json` loads `vite/client` types, so client
tests that import CSS modules type-check; `eslint.config.js` lets a labelled `group` take
`tabIndex`, so a scrolling panel is reachable by keyboard (axe `scrollable-region-focusable`);
`vitest.config.ts` runs `src/client/testing/cleanUpAfterEachTest.ts` before client tests; the
owner also formatted `eslint.config.js` with Prettier, and applied items 6 and 7
(`.size-limit.js`, `knip.json`).

## Report

**What was built.**
- **Design system:** `tokens.css` generated from the design export (plus the few raw values the
  boards used, from `tools/design-export/BOARD_VALUES.ts`); card photos, icons and backgrounds as
  files that load only when shown.
- **Components:** the 16 listed, one per file, each tested by role and accessible name.
- **Game table (S1.2):** top bar with the turn ("Turn 1 of 40"), the phase and the player order
  from the first player, marked "first player" (S2.1, S2.2); three columns of panels in the
  design's proportions that scroll and take keyboard focus when they overflow (S1.3); Your stats
  with the 10 stats of S6.2 as icons, names as tooltips.
- **Engine:** every view now holds the turn's player order (R4.4, R4.5), so the browser never
  works it out.
- **Checks:** a browser size test at 1280×720, 1920×1080 and 2560×1440 with 4 players and the
  longest names (screenshots, role and name checks, no horizontal scrolling, 24 px targets, axe,
  leak check); the bundle check counts only the first screen: 83.0 KB of 300 (B14).

**What to try (after the merge).** Behind the site lock, start a game with 2 to 4 windows and
look at the table: the order in the top bar, the first-player mark, the stat icons (hover one for
its name), and a window narrower than 1280 px. Compare `harness/screens/gameScreenSizes/` with
your local board `design/export/library/images/Game main phase 1920x940.png` (the design export
is not committed, so the screenshots cannot sit next to it in the repo).

**Differences from the phase file.**
- The player order was pulled forward from phase 12 into the engine.
- Button colours that failed the 4.5:1 contrast check use the darker token shade.
- "The densest content the design allows" cannot be shown yet; phase 13 reruns the size test
  (D21).
- Known gaps are listed above.

**Decisions:** Q18 (players who left come after the order), Q19 and D21 (screen sizes, answered by
the owner), Q20 (own badge shows the username, statuses only in the main phase, stat names as
tooltips). The owner made the protected config changes listed under **Waiting for the owner**.

**Phase review findings and what happened to each:**
1. **The browser test did not find the screen's elements by role and name.** Fixed: the size test
   finds the player order and its badges, the first-player mark, all 9 panels and the 10 stats.
2. **The 4-player browser test had no leak check.** Fixed: it checks every message each player
   got against the other three hands; shared helpers with `turnOne.spec.ts`.
3. **Your badge showed "You" instead of your username.** Fixed (Q20, S2.2); the size test now
   measures the longest name.
4. **All 52 icons were inlined in the first script.** Fixed: `assetsInlineLimit: 0` in
   `vite.config.ts`; the first screen went from 143.6 KB to 83.0 KB.
5. **Hard-coded colours.** Fixed: generated into `tokens.css` from one list.
6. **Type counts missing but not listed as a gap.** Fixed: Known gaps lists them and the other
   empty panels.
7. **Stat names only as hover tooltips, not recorded; tooltips might be clipped.** Recorded (Q20,
   S6.2); the tooltip now opens below the icon, inside the panel. A focusable icon was left out
   (not a control).
8. **A Progress note pointed to a missing proposal.** Fixed, and the stray blank line removed.
9. **No screenshots next to the design boards.** Answered: the design export is local only;
   "What to try" names the screenshots and the board to compare.
10. **"Left" shown after the main phase.** Fixed: statuses only in the main phase; S2.2 reworded.
11. **Small points.** TextInput and Your stats have their own stylesheets; the stats list's
    extra label was removed. The section and its scroll area keep the same name, because the
    focusable scroll area needs one. "New" versus "selected" is phase 06's.
12. **The size test never closed its browsers.** Fixed.
