# Phase 20a: Playthrough fixes

Status: in progress
Milestone: 3 Playthrough

## Goal

Everything the owner's first playthrough found (Q74), so the playthrough version can be accepted
before milestone 4 starts.

## Depends on

Phase 20.

## Covers

- Notes: `docs/playthrough-notes/2026-11-06-first-playthrough.txt`, all 9 findings (Q74).
- Rules: R19.4 (quests need workforce, quality and satisfaction 0 or more), R17.1, R17.6, M3.2 and
  M3.5 (the discard pile is shown only as a number of cards).
- Screens: S1.5, S1.6, S4.2, S4.5, S5.1, S5.4, S6.1, S6.3, S6.5, S8.3, and the
  `quest_needs_not_met` text in S16.3.

## Start

The spec and harness changes for this phase are already written, in a `HARNESS:` commit on the
branch `phase-20a-playthrough-fixes` (Q74). The starter checks out that branch instead of
creating it. On it, `npm run check` fails until items 1 and 2 are built: the harness test still
expects 429 scenarios (there are now 433), and three required scenarios assert `discard_count`
in a view, which the runner does not read yet.

## Builds

1. **Quests need non-negative stats** (R19.4): a quest cannot be completed while workforce,
   quality or satisfaction is negative, rejected with `quest_needs_not_met`. The view's "can
   complete" information, the bots and the quest progress line (S5.1: a negative stat shown as an
   unmet part) follow the rule. The S16.3 text for `quest_needs_not_met` is updated. Small.
2. **The discard pile is a number** (M3.2, R17.1, S4.2): `viewFor` sends only the number of
   cards in the discard pile as the seat sees it (R5.5), never which cards. The "None left"
   marks of the draw table (S8.3) still come from the view, computed on the server per kind and
   tier. The discard pile link and its pop-up go. The scenario runner reads `discard_count` in a
   view and `hides: [discard_cards]` (no discard pile card in the view); the harness test counts
   433 scenarios. The leak test treats discard pile cards as hidden from every player.
3. **The big card** (S6.5, S1.5): its title bar has its sector colour as background, and
   switching cards is instant. The cause of the delay is known (Q74): each card photo (240 files,
   about 40 KB each, up to 90 KB) is first downloaded when its card is selected
   (`loading="lazy"` in `BigCard.tsx`), and the reused `img` keeps showing the old photo until
   the new one arrives. Selecting a card needs no server answer. The fix:
   1. **Load the hand's photos in the background:** once the game screen is shown, download and
      decode the photo of every card in the hand, and of each card that joins it. This runs
      after the first screen, so the first load and the bundle budget are unchanged.
   2. **Switch only when the photo is ready:** the hand's selection highlight, the big card and
      Play card change together, in one step, once the new card's photo is decoded. Until then
      the previously selected card stays, complete, and Play card plays the card shown. After
      300 ms without the photo (slow connection or a failed file), the card is shown anyway with
      its sector colour in the photo area until the photo arrives. There is no loading screen or
      spinner; nothing waits for a photo except the switch.
   3. **Check the photo files:** if they are much larger than 630×478 (twice the 315×239 shown),
      resize them to that size, so every download is smaller.
   4. **Test:** a browser test clicks through several hand cards and checks that each is shown in
      full, with its own photo, within 100 ms of the click; a unit test checks the 300 ms
      fallback with a photo that never loads.
4. **Sector colours in texts** (S1.5, S5.1, S8.3): sector names in quest requirements in their
   sector colour; in the draw table of Use influence, each kind's name on its sector colour.
   Small.
5. **Projects area and help** (S6.3, S5.4): the PROJECTS title; "First to complete gets +2" with
   the funds icon while nobody has completed a project, "Completed by …" only after someone has;
   the **?** buttons with the help texts of S5.4 and S6.3 next to QUESTS and PROJECTS, opened by
   click or keyboard and closed by Escape, a click elsewhere or the button.
6. **Icons instead of words** (S1.6, S6.1, S8.3): every stat in the Use influence pop-up as its
   icon; "unlimited uses" instead of "unlimited"; types and stats in the combos list as icons.
   Each icon has its name as tooltip and accessible name.
7. **Market phase banner** (S4.5): the MARKET PHASE banner over the marketplace with whose go it
   is, and the phase in the top bar highlighted the same way, during the market phase only.

## Known gaps after this phase

- The same as after phase 20: no chat, votes, rematches, accounts, records, ranking, menu or
  tutorial.

## What you can see when it's done

All 9 findings from your first playthrough, on the live site: the big card switches at once and
has its sector colour; sector names are coloured; PROJECTS and QUESTS have a title and a **?**
help; quests cannot be completed with a negative workforce, quality or satisfaction; the influence
pop-up and the combos list use icons; the discard pile is only a number; the market phase is
impossible to miss.

## Exit criteria

- Every scenario of this phase passes; the leak test passes with discard pile cards hidden.
- Screenshots of the big card, the projects area with its help open, the quests panel with its
  help open, the Use influence pop-up, the combos list and the market phase banner in
  `harness/screens/`.
- The owner has played the fixed version and accepted milestone 3 ("Playthrough").

## Open points

- None.

## Waiting for the owner

- **Accept milestone 3.** After the release, play the fixed version on the live site and either
  accept milestone 3 ("Playthrough") or put new notes in `docs/playthrough-notes/` as a new dated
  file. Milestone 4 starts only after you accept.

## Required scenarios

These 4 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `quests` #65: rejects a quest while workforce is negative
- `quests` #66: rejects a quest while quality is negative
- `quests` #67: rejects a quest while satisfaction is negative
- `visibility` #16: the discard pile is shown only as a number of cards

These 3 required scenarios now assert `discard_count` instead of the discard pile's cards (Q74)
and must pass again:

- `drawing` #10: a discard shuffle in the main phase is shown to others only when the phase ends
- `drawing` #11: the player who caused a discard shuffle sees it straight away
- `visibility` #15: a card I drew that another player's hidden shuffle left in my discard pile is
  taken off that pile

## Progress

- [x] 0. Start: the branch `phase-20a-playthrough-fixes` already held the spec and harness changes
  (Q74, commits `HARNESS: Quests need non-negative stats ...` and `HARNESS: The big card switches
  ...`). No spec question was open; small screen choices are in the item notes below.
  Until items 1 and 2 are both built, `npm run check` fails on the scenario count (429 vs 433) and
  the 3 required scenarios that read `discard_count`; a builder of item 1 alone reports that, not
  a failure of its item.
- [x] 1. **Quests need non-negative stats** (R19.4, S5.1, S16.3; scenarios `quests` #65–67).
  **Small.**
  - Engine: `src/rules/questRejection.ts` returns `quest_needs_not_met` while workforce, quality or
    satisfaction is negative. The same check is written out in `projectRejection.ts`,
    `takeIncome.ts` and `stateInvariantViolations.ts`; reuse one helper in `src/rules/` (at least
    for the quest and the project) instead of a fourth copy.
  - The view's "can complete" (`completeRejection` in `questPlacesShownTo.ts`) and the bots
    (`legalBot.ts` reads `completeRejection`) follow from `rejectionOf` without change.
  - S5.1 progress line: the client must not decide what is unmet. Add to `QuestProgress`
    (`src/shared/QuestProgress.ts`, schema in `SERVER_MESSAGE_SCHEMA.ts`) the seat's negative
    stats among workforce, quality and satisfaction, computed in `questPlacesShownTo.ts` from the
    seat as shown (`seatShownTo`, R5.4). `QuestProgressLine.tsx` shows each as one more
    `QuestPart` (for example "-1/0" with the stat's icon, spoken "workforce -1 of 0"), only while
    the quest is not completed. Update the test fixtures that build a `QuestProgress`.
  - S16.3: `REJECTION_MESSAGES.ts` text for `quest_needs_not_met`, word for word from S16.3.
  - Done: `src/rules/negativeStatsOf.ts` (used by `questRejection.ts`, `projectRejection.ts` and
    `questPlacesShownTo.ts`; `takeIncome.ts` and the invariant left as they were). Each progress
    entry carries `negativeStats: [{stat, value}]` (`src/shared/NegativeStat.ts`, stat typed as
    `ProjectName`, the same three stats), in the order quality, satisfaction, workforce; the line
    shows each as "-1/0" with its icon. `quests` #65–67 pass (checked by adding them to the
    required list locally, not committed). The full check still fails only on the scenario count
    and the 3 `discard_count` scenarios, as expected until item 2.
  - For later items: whoever builds a `QuestProgress` in a test now adds `negativeStats: []`.
- [x] 2. **The discard pile is a number** (M3.2, M3.5, R17.1, R17.6, S4.2, S8.3; scenarios
  `visibility` #16, and `drawing` #10, #11, `visibility` #15 again). **Large.**
  - Done in one commit. `PlayerView.discardCount` is `pilesShownTo(...).discard.length`;
    `pilesShownTo` keeps the cards internally for R5.5. "None left" comes from
    `kindTiersLeftAsSeenBy` and was not changed. The marketplace header shows "Deck N" and
    "Discard N" as plain text; `DiscardPileDialog.tsx`, its styles, tests and the `discard-pile`
    screenshots are gone. `turnOne.spec.ts` now checks there is no discard button and that Ann is
    never sent the card Bea sold. The simulator's I24 check (`shownPilesViolations.ts`) compares
    the discard count instead of the cards (its "own card in the discard pile" check has nothing
    left to check); the leak test (`whatSeatsSeeViolations.ts`) hides `state.discard` from every
    seat. `visibility` #16 passes (checked by adding it to the required list locally, and that it
    fails with a wrong count). The `market-*` screenshots changed with the header.
  - For later items: `npm run check` is green on the branch from here on.
  - `PlayerView.discard` (cards) becomes `discardCount` (number): `src/shared/PlayerView.ts`,
    `viewFor.ts` (from `pilesShownTo`, which keeps R5.5), `SERVER_MESSAGE_SCHEMA.ts`,
    `src/client/testing/roomUpdateWith.ts`. The saved state keeps its discard cards
    (`src/server/testRooms/GAME_STATE_SCHEMA.ts` is state, not view).
  - "None left" (S8.3) already comes from the server (`drawActionStatusesOf.ts`, `isAnyLeft`);
    check it still uses the piles as the seat sees them.
  - Client: `DeckAndDiscard.tsx` shows the count only; delete `DiscardPileDialog.tsx`, the link,
    and their tests; the e2e screenshot `discard-pile` (`e2e/turnOne.spec.ts`) goes, and its
    folder in `harness/screens/`. Check `MarketplacePanel.tsx`, `InfluenceDialog.tsx`,
    `LeaveGameDialog.tsx` and `drawLogText.ts` for other uses.
  - Runner: `tools/harness-runner/engine/viewThen.ts` returns `discard_count` and handles
    `hides: [discard_cards]` in `isHidden` (no card of `state.discard` in the view's text); check
    `ENGINE_FIELDS.ts` lists `discard_count`. `tools/harness-runner/harness.test.ts` expects 433.
  - Leak test: `hiddenFrom` in `tools/simulator/whatSeatsSeeViolations.ts` adds `state.discard`
    (card names are unique, all 240, so a name never appears elsewhere at the same time).
    The e2e tests have no leak check of their own (`hiddenFrom` is only in the simulator).
- [x] 3. **The big card** (S6.5, S1.5). **Large.** About three commits:
  1. Title bar on its sector colour (`BigCard.tsx`, `BigCard.module.css`, `sectorColor.ts`; the
     header is the `header` div). Text contrast on the solid colour must pass axe
     (`proposed-rules.md`, "Text colours are checked on solid backgrounds").
  2. Background loading and the switch: a hook in the client that, once the game screen shows,
     decodes the photo (`photoUrl.ts`) of every hand card and every card that joins the hand,
     and a selection that changes (hand highlight, big card, Play card together) only when the
     new photo is decoded or after 300 ms, with the sector colour in the photo area until it
     arrives. Selection lives in `useHandChoice.ts` / `HandChoice.ts` / `SelectedCardPanel.tsx`;
     keep it in the one store or hook that already holds it. Remove `loading="lazy"`. Inject the
     timer and the image decoder so the unit test can use a photo that never loads.
  3. Step 3 of the phase file needs no work: all 240 photos in `src/client/assets/cards/` are
     554×478 WebP, not larger than 630×478 (checked by the starter). Say so in the tick note.
  - Tests: browser test, several hand cards each shown in full with its own photo within 100 ms;
    unit test of the 300 ms fallback. Screenshot of the big card (`card-selected` exists, in
     `e2e/handAndActionsScreens.spec.ts`).
  - Done in two commits. Title bar: the sector colours with alpha are not measurable by axe over
    the card texture, so `tools/design-export/BOARD_VALUES.ts` adds opaque `--color-sector-*-solid`
    (the base colours without alpha) and `-solid-text` (white; dark on Service, 4.85:1, where white
    would be 3.2:1); `sectorColor(sector, "solid")`. The same solid colour sits behind the photo,
    an `img` keyed by card, so an old photo never stays on a new card. Switch: `useHandChoice`
    keeps the shown choice and the wanted card (`HandSwitch`); `useReadyPhotos` decodes the card
    texture and the photo of each hand card once, also of cards that join. The loader (decode and
    timer) is injected through the `PhotoLoading` context (`BROWSER_PHOTO_LOADER` by default,
    `src/client/testing/photoLoaderThatDecodes.ts` in tests). Pressing the selected card again,
    Close and sell mode change at once. Step 3: no work, all 240 photos are 554×478 WebP, not
    larger than 630×478. Tests: `bigCardSwitch.test.tsx` (300 ms fallback with a photo that never
    loads), `e2e/bigCardSwitch.spec.ts` (waits until the hand's photos are downloaded, then 4
    cards each shown in full with its own decoded photo in under 100 ms, measured in the page).
  - For later items: a unit test that clicks a hand card and expects the big card at once renders
    inside `<PhotoLoading value={photoLoaderThatDecodes(() => true)}>` and awaits one
    `act(async () => Promise.resolve())` first (see `handAndActions.test.tsx`).
- [x] 4. **Sector colours in texts** (S1.5, S5.1, S8.3). **Small.**
  - Quest requirements: `questNeedLabel.ts` builds the label as a string; the sector part of a
    `cards` need must be rendered coloured (in `QuestPart.tsx` or a new small component), with
    `sectorColor(sector, ...)` and a light enough shade to read on the panel.
  - Draw table: in `InfluenceDialog.tsx`, each kind's name cell on its sector colour; a kind maps
    to a sector as `Kind` names do (the two Public kinds use the Public colour, S1.5).
  - Done in one commit. `BOARD_VALUES.ts` adds `--color-sector-*-light` (the solid colour mixed
    40% with white, 5.2:1 or more on the quest panel) and `sectorColor(sector, "light")`. `QuestPart`
    takes a `sector` (from `questNeedSector`, only for a `cards` need) and `SectorNamedText` colours
    the sector word, in the requirement and in each progress line. `sectorOfKind.ts` maps a kind to
    its sector; each kind name cell of `DrawActionTable` is on `solid` with `solid-text`. The
    `quests-table` and `use-influence` screenshots changed.
  - For later items: every `QuestPart` now needs `sector={null}` unless it names a sector.
- [x] 5. **Projects area and help** (S6.3, S5.4). **Large.**
  - One help button component for both panels (a real `button` named "How quests work" / "How
    projects work", `aria-expanded`, opens on click, Enter or Space; closes on Escape, a click
    elsewhere or the button). `Modal.tsx` has the only Escape handling to look at. Texts word for
    word from S5.4 and S6.3, with the stats as icons (`StatChip` or the `STAT_ICONS` pattern).
  - `ProjectProgressList.tsx`: the PROJECTS title; "First to complete gets +2" with the funds
    icon while nobody has completed it as you see it (`view.firstCompletions` and the seats'
    `projects`, both shown as of R5.4); "Completed by Ann, Bob" once someone has. Starter's
    choice (S6.3 does not say): "Completed by" names the other players who completed it; your
    own completion is your line's "completed", so when only you have completed a project the
    line shows neither the +2 nor "Completed by".
  - Screenshots: projects area with its help open, quests panel with its help open.
  - Done in one commit. `components/HelpButton.tsx` (a `?` button named "How quests work" /
    "How projects work", `aria-expanded`; the box is a region of the same name, position fixed
    under the button so the scrolling panel body does not clip it, and it follows the button on
    scroll and resize); Escape and a pointer press outside close it (`useHelpBoxDismissal.ts`).
    The texts are `QUESTS_HELP.ts` and `PROJECTS_HELP.ts`, word for word, each named stat as an
    icon (`HelpText.tsx`). `StatChip` now takes an optional value: without one it is the icon
    alone, named after the stat. `Panel` takes an optional `help` shown next to the title. The
    projects area has an h3 PROJECTS with its help; lines read "· First to complete gets +2" with
    the funds icon, or "· Completed by Ann, Cy" (others only, the starter's choice); your own
    completion stays "· you completed ✓". Tests: `projectsAreaAndHelp.test.tsx`; e2e
    `quests.spec.ts` (Enter opens, a click elsewhere closes, screenshot `quests-help`) and
    `combosAndProjects.spec.ts` (screenshot `projects-help`, Escape closes).
  - For later items: item 6 can use `<StatChip stat="..." />` without a value for an icon-only
    stat. In Playwright, `getByRole("button", { name: "Projects" })` now also matches "How projects
    work"; use `exact: true`.
- [ ] 6. **Icons instead of words** (S1.6, S6.1, S8.3). **Small.**
  - Use influence pop-up (`InfluenceDialog.tsx`, `TradeTile.tsx`, `tradeLabel.ts`,
    `tradeStatusText.ts`): every stat as its icon with tooltip and accessible name (as
    `StatChip` / `QuestPart` do); "unlimited" becomes "unlimited uses".
  - Combos list (`CombosPanel.tsx`, `comboTexts.ts`, `ComboLabel.tsx`): types (`TypeChip`) and
    stats as icons.
  - Screenshots: the Use influence pop-up and the combos list.
- [ ] 7. **Market phase banner** (S4.5). **Small.**
  - Banner above the marketplace in the middle column (`MiddleColumn.tsx`) during the market
    phase, "MARKET PHASE" with "Your go" or "Ann's go" (whose go: `marketGoStateOf.ts`); the
    phase in `GameTopBar.tsx` highlighted the same way. Screenshot of the banner (the market
    screens are in `e2e/marketPhase.spec.ts`).

### Finish

- [ ] Add the 4 required scenarios to `harness/required.yaml`; full check, harness, browser tests.
  - Coordinator note for the finisher and the phase reviewer: item 2 changed the view sent to
    the browser (discard pile cards became a count) without raising `PROTOCOL_VERSION` (still 2).
    Check against M9.1 and `rules/architecture.md` ("Versioned protocol") whether it must go up.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter and builder, item 1 | 9 | 117k | 58 | done |
| Builder, item 2 | 7 | 94k | 36 | done |
| Builder, item 3 | 18 | 143k | 69 | done |
| Builder, item 4 | 6 | 88k | 28 | done |
