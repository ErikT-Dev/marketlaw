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
- Screens: S1.5, S1.6 (every screen and text, owner's rule of 2026-11-06), S4.2, S4.5, S5.1,
  S5.4, S6.1, S6.3, S6.5, S8.1, S8.3, and the
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
8. **Icons in the Claim all pop-up** (S8.1, S1.6): each combo's need and reward and the totals
   show types and stats as icons. Small.
9. **Icons everywhere** (S1.6, owner's rule of 2026-11-06): sweep every screen, pop-up, table,
   label and text built so far for a stat or type written as a word, and show it as its icon
   with the name as tooltip (hover and keyboard focus) and accessible name. At least: the
   opponents overview and boards (S3), quest requirements and progress lines ("income 3 of
   4"), the projects pop-up (S8.2), the end-of-game table (S9.5), messages (S9.4), rejection
   messages (S10.9, S16.3, e.g. "You need N funds"), notices (S16) and the help texts (S5.4,
   S6.3). Reuse `StatChip` and `TypeChip`; a text with icons inside it is built from parts, not
   from a string. A test finds no stat or type name as visible text on the main game screens
   and pop-ups (for example with `textWithIconNames.ts`). Large.

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
    The e2e tests check only hands (`e2e/hiddenCardsSentToOthers.ts`, no card in another
    player's hand in a frame); the discard pile is checked by the simulator only (corrected
    after review finding 6).
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
- [x] 6. **Icons instead of words** (S1.6, S6.1, S8.3). **Small.**
  - Use influence pop-up (`InfluenceDialog.tsx`, `TradeTile.tsx`, `tradeLabel.ts`,
    `tradeStatusText.ts`): every stat as its icon with tooltip and accessible name (as
    `StatChip` / `QuestPart` do); "unlimited" becomes "unlimited uses".
  - Combos list (`CombosPanel.tsx`, `comboTexts.ts`, `ComboLabel.tsx`): types (`TypeChip`) and
    stats as icons.
  - Screenshots: the Use influence pop-up and the combos list.
  - Done in one commit. `components/StatAmountsIcons.tsx` shows stat amounts as `StatChip`s joined by " + "; `TradeIcons.tsx` draws each tile (build pass as the build pass icon), `tradeMissingAmounts.ts` gives "need …" as icons, the intro and the draw table costs use `StatChip`. Each trade button keeps its spoken name ("4 influence → 2 funds"), so the browser tests did not change their selectors. Combos list: `ComboNeedAndGain.tsx` (type as `TypeChip`, gain as `StatChip` "+1"); `comboTexts.ts` stays for the Claim all pop-up, which S6.1 does not cover. Tests read icons as `[Name value]` with `src/client/testing/textWithIconNames.ts`. New screenshot `combos-list` (`combosAndProjects.spec.ts`); `use-influence` changed.
  - For later items: `getByRole("img", { name: "Influence 8" })` now also matches the Use influence pop-up; scope it to the dialog or the stats panel.
- [x] 7. **Market phase banner** (S4.5). **Small.**
  - Banner above the marketplace in the middle column (`MiddleColumn.tsx`) during the market
    phase, "MARKET PHASE" with "Your go" or "Ann's go" (whose go: `marketGoStateOf.ts`); the
    phase in `GameTopBar.tsx` highlighted the same way. Screenshot of the banner (the market
    screens are in `e2e/marketPhase.spec.ts`).
  - Done in one commit. `MarketPhaseBanner.tsx` (a region named "MARKET PHASE", 24px letters on a strong amber background, with "Your go" or "Ann's go" from `marketGoText.ts`, which reads `view.marketGo`) is the first row of the middle column in the market phase only; the top bar's phase chip uses the same colours (`--color-board-market-phase` and `-text`, added to `tools/design-export/BOARD_VALUES.ts`, `tokens.css` regenerated). Tests: `marketPhase.test.tsx` (other's go, your go, gone in the main phase); `e2e/marketPhase.spec.ts` checks both players' banners, that it is gone in the main phase, and takes the new screenshot `market-phase-banner`. The other `market-*` screenshots changed.
  - For later items: the full-game screenshots (`full-game-*-turn-1` and others taken in the market phase) will change with the banner when the finisher runs them.

- [x] 8. **Icons in the Claim all pop-up** (S8.1, S1.6). **Small.** Added 2026-11-06 at the
  owner's request, after the finisher's first run (Q74). `comboTexts.ts` still writes the
  Claim all pop-up's stats as words (item 6's note).
  - Done in one commit. `ComboNeed.tsx` (the need, type as `TypeChip`) is shared by the combos
    list (`ComboNeedAndGain.tsx`) and the Claim all pop-up; each ready row is `ReadyComboRow.tsx`
    (gain as `StatChip` "+1", then " ×2" when ready more than once); the totals are three
    `StatChip`s "+0" joined by " · ". `comboTexts.ts` is gone. The ready rows are a list named
    "Ready combos". Tests: `combosAndProjects.test.tsx` reads the row and the totals with
    `textWithIconNames`; `e2e/combosAndProjects.spec.ts` checks the icons. The `claim-all`
    screenshots changed.
- [x] 9. **Icons everywhere** (S1.6). **Large.** Added 2026-11-06: the owner made icons-only a
  rule for every screen and all text, prose included (Q74). Trade buttons may keep their
  spoken names (accessible names), as item 6 did.
  - Done in two CLIENT commits and one HARNESS commit. Text with icons is `IconText` (a string, or
    parts: text, `{ stat, value? }`, `{ type, count? }`; `components/IconTextPart.ts`, the old
    `HelpTextPart`) drawn by `components/TextWithIcons.tsx` with `StatChip` / `TypeChip`.
    `REJECTION_MESSAGES` is `Record<ReasonCode, IconText>` (S16.3 words, stats as icons), and so
    are `rejectionMessage`, `tradeStatusText`, `noticeToastOf`, `gameOverTexts` (`why`),
    `drawLogText` (the "(income)" cause) and the lobby texts; `Toast`, `Modal` (title),
    `TextInput` (error) and the lobby error props take `IconText`. Changed screens: big card
    "Costs [funds]", sell-mode notice (`SellingNotice.tsx`), "Use [influence]" button and pop-up
    title (named "Use Influence" now), the Projects pop-up (intro, "Needs [8] · you have [n]",
    first-completion and 3rd-project lines, `DialogNote.tsx`), the end-of-game table headers and
    why-text, the draw log. Opponents, quests, combos, help texts and type counts already used
    icons. Tooltips also show while the control around an icon has keyboard focus (CSS
    `:focus-visible`); S1.6 was changed for that (icons cannot be tab stops, lint), Q76. Q76 also
    records the words that stay words: "bonus types", "bonus-type points", "first-completion
    bonus", the kind names "Public quality/satisfaction card", tier and cost. Test:
    `iconsEverywhere.test.tsx` with `src/client/testing/statAndTypeWordsShownIn.ts` (game screen,
    the Projects, Use Influence, Claim all and board pop-ups, help texts, big card, sell mode, the
    5 stat rejection messages, end-of-game screen). The harness runner's `lobbyMessageThen.ts`
    writes icon parts as text. e2e selectors changed in `handAndActionsScreens`, `drawLog`,
    `gameOver`, `influenceAndUndo`; these 6 specs pass (two load flakes at two workers passed
    alone). Screenshots with these screens changed.
  - For later items: the button and pop-up are "Use Influence" (capital I, the icon's name). Any
    new player-facing text with a stat or type is an `IconText`; add its screen to
    `iconsEverywhere.test.tsx`.

### Finish

- [x] Add the 4 required scenarios to `harness/required.yaml`; full check, harness, browser tests.
  - Coordinator note for the finisher and the phase reviewer: item 2 changed the view sent to
    the browser (discard pile cards became a count) without raising `PROTOCOL_VERSION` (still 2).
    Check against M9.1 and `rules/architecture.md` ("Versioned protocol") whether it must go up.
  - First run (2026-11-06): `quests` #65–67 and `visibility` #16 are on the required list.
    `PROTOCOL_VERSION` raised to 3 (Q75): a tab with the old client would send version 2, be
    accepted and fail to read the new views; now it is told to reload. `npm run check` green
    (with the new version), `npm run harness` green (phase-end games, budgets). Browser tests:
    shard 1/2 54 passed; shard 2/2 50 passed and 1 failed with `ERR_CONNECTION_RESET` loading the
    page (`opponents.spec.ts` at 2560x1440), passed on its own; 2 players 3 passed; 3 players 2
    passed and 1 failed at 1280x720 waiting for Turn 1 at the start, passed on its own; 4 players
    3 passed. Both are the known local two-worker load problem; GitHub judges the full suite.
    The screenshots changed as expected (the market banner, new deals); every exit-criteria
    screen is in `harness/screens/` (`card-selected`, `projects-help`, `quests-help`,
    `use-influence`, `combos-list`, `market-phase-banner`). `docs/enforcement.md` names the
    discard pile in the leak test and I24.
- [x] Finisher again, after items 8 and 9: full check, harness, browser tests, screenshots.
  - Second run (2026-11-06): `npm run check` green (before and after the fix below), `npm run
    harness` green (phase-end games, budgets). Browser tests: shard 1/2 49 passed, 5 failed;
    `testRooms.spec.ts` "income happens by itself" was a real miss of item 8, which changed the
    draw log to "(Income)" in `drawLog.spec.ts` but not here; fixed (b35e398) and passed at all
    three sizes. The other four (`gameScreenSizes`, `handAndActionsScreens`, `bigCardSwitch`,
    `turnOne`: room heading not visible, a hand card still shown) passed on their own: the
    known two-worker load problem. Shard 2/2 51 passed. 2 players 2 passed and 1 failed at
    1920x1080 (room heading not visible), passed on its own; 3 players 3 passed; 4 players 3
    passed. 123 screenshots changed as expected (icons for stats and types, "Use Influence");
    every exit-criteria screen is still in `harness/screens/`. `docs/enforcement.md`: no new
    check.

- [x] Phase review (2026-11-06): ready after fixes, no blockers. Findings:
  1. Should fix: at 1280x720 the PROJECTS title and its ? push the project lines out of view in
     Your stats (`ProjectProgressList.tsx`, `YourStatsPanel.module.css`); all 3 must be visible
     (S6.3, `rules/frontend.md`).
  2. Should fix: `:focus-visible .chip .tooltip` (`Chip.module.css`) and `.part`
     (`QuestsPanel.module.css:108-110`) match any focused ancestor, so a focused scrollable panel
     body (`Panel.tsx:38`, tabIndex 0) shows all its tooltips; limit to real controls (S1.6, Q76).
  3. Should fix: "Completed by" naming only the other players (and showing neither line when only
     you completed it) is not in `open-questions.md`; record it, and in S6.3 if it adds behaviour.
  4. Suggestion: test the big card title bar's sector colour (S6.5).
  5. Suggestion: propose Q75's standing rule (any message shape change raises
     `PROTOCOL_VERSION`) in `docs/plan/proposed-rules.md`.
  6. Suggestion: correct item 2's note on browser leak checks (`e2e/hiddenCardsSentToOthers.ts`
     exists, hands only) or extend it to the discard pile; `statAndTypeWordsShownIn.ts` skips all
     of `role="img"`, including QuestParts with word labels.
  7. Suggestion: negative-stat parts in `QuestProgressLine.tsx` use lowercase names
     ("workforce"); `StatChip` uses "Workforce".
- [x] Fixer A: findings 1, 2 and 7 (screen and tooltips).
  - 1 fixed: the right column's Your stats row is at least as tall as its content
    (`minmax(min-content, 300fr)` in `GamePage.module.css`), so the hand gets the rest. At
    1280x720 all 3 project lines show, also with type counts (`combos-list`, `game-table`); the
    hand is shorter there and scrolls. Test: `e2e/expectAllProjectsInView.ts` in
    `gameScreenSizes` and `combosAndProjects` (each project line fully in view).
  - 2 fixed: the focus rule for tooltips is `:is(button, a[href]):focus-visible` in
    `Chip.module.css` and `QuestsPanel.module.css` (every focusable control in the client is a
    button or a link; the panel body is the only other tab stop). Test:
    `e2e/tooltipsOnFocus.spec.ts` (a focused Opponents body shows no tooltip, the focused Use
    Influence button shows its own); it fails with the old rule.
  - 7 fixed: negative-stat parts use the icon's name ("Workforce"), as `StatChip` does.
  - For later items: other 1280x720 screenshots of the game screen change (taller Your stats,
    shorter hand); only those of the specs above were retaken.
- [x] Fixer B: findings 3, 4, 5 and 6 (records and tests).
  - 3 fixed: recorded as Q77; S6.3 now says "Completed by" names only the other players and
    neither line shows when only you have completed a project (`HARNESS:` commit). No code
    change: `ProjectProgressList.tsx` already does this.
  - 4 fixed: `cards.test.tsx` checks the big card's title bar background and text colour for
    one card of each sector.
  - 5 fixed: proposed in `proposed-rules.md` (For `rules/architecture.md`).
  - 6 fixed: item 2's note corrected (the e2e leak check covers hands, the simulator the
    discard pile). `statAndTypeWordsShownIn.ts` now skips only icons (`role="img"` with an
    image inside), so the words of QuestParts without an icon are checked; the
    `iconsEverywhere` tests still pass.
- [ ] Finisher after the fixes.

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens
are each helper's conversation size at its end.

| Job | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|
| Starter and builder, item 1 | 9 | 117k | 58 | done |
| Builder, item 2 | 7 | 94k | 36 | done |
| Builder, item 3 | 18 | 143k | 69 | done |
| Builder, item 4 | 6 | 88k | 28 | done |
| Builder, item 5 | 9 | 117k | 47 | done |
| Builder, items 6 and 7 | 14 | 134k | 66 | done |
| Finisher, first run | 30 | 91k | 38 | done |
| Builder, item 8 | 7 | 86k | 22 | done |
| Builder, item 9 | 26 | 197k | 119 | done |
| Finisher, second run | 35 | 78k | 33 | done |
| Phase reviewer | 11 | 197k | 62 | ready after fixes |
| Fixer A, findings 1, 2, 7 | 11 | 98k | 43 | done |
