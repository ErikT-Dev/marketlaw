# Phase 05: Game screen: layout and components

Status: approved
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
