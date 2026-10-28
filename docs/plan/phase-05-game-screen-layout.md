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
  and Played card share `CardTileFace`. Client tests unmount by hand (`proposed-rules.md`,
  "Client tests clean up only when told to").
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
- [ ] 6. Bundle check (`.size-limit.js`, protected: owner). `vite.config.ts` now writes Vite's
  manifest, so the check can count the entry script, its stylesheet and every chunk they
  import, and nothing loaded later.
- [ ] 7. Accessibility check on every screenshot (`knip.json`, protected: owner). Axe already
  runs in both browser tests that take or check the game screen.


## Waiting for the owner

1. **Items 6 and 7 edit protected files** (`.size-limit.js`, `knip.json`), approved with this
   phase but blocked for Claude by the protected-path hook. A script makes both changes:
   `.size-limit.js` measures only the first screen's files from Vite's manifest, and knip's
   ignore list drops `@axe-core/playwright` and `@testing-library/react`, which are now used.

Done by the owner, 2026-10-28: `tsconfig.tools.json` loads `vite/client` types, so client
tests that import CSS modules type-check; `eslint.config.js` lets a labelled `group` take
`tabIndex`, so a scrolling panel is reachable by keyboard (axe `scrollable-region-focusable`);
`vitest.config.ts` runs `src/client/testing/cleanUpAfterEachTest.ts` before client tests; the
owner also formatted `eslint.config.js` with Prettier.
