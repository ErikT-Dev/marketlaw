# Phase 28: Game menu, rules viewer and card set

Status: in progress
Milestone: 6 Learning

## Goal

The game menu from the lobby, a waiting room and a game, with the rulebook and the browsable card
set.

## Depends on

Phases 20a and 25a.

Stats and types in the rulebook's prose, the card set and card details are shown as icons, never
as words (S1.6, owner's rule of 2026-11-06, Q74).

## Covers

- Rules: C1 (the Tutorial entry comes in phase 29), C2, C3.
- Screens: S14, S2.1's Menu button. Design boards "Menu: game menu during a game", "Rules: rules
  viewer", "Rules: opened during a game", "Card set: grid", "Card set: card detail". Per
  `screens.md` S17, the rules viewer shows `rulebook.md` as it is, ignoring the board's old text.

## Builds

1. **Game menu** with Rules and Card set; opening anything during a game does not stop the clock.
2. **Rules viewer:** `rulebook.md` with contents, links between sections, previous and next,
   loaded only when opened. Rendering Markdown likely needs a library: a new dependency, named
   and approved with this phase, or a small project renderer if the owner prefers none.
3. **Card set:** all 240 cards as tiles, filters by sector, tier and type, name search, the
   matching count, and the card detail with every combo.

## Known gaps after this phase

- The menu shows no Tutorial entry until phase 29.

## What you can see when it's done

Open the menu from the lobby and a game; read the rules; filter the card set and open a card.

## Exit criteria

- B14 still within its limit.

## Open points

- The Markdown dependency: decided, none; a small project renderer (Q156).

## Required scenarios

These 9 scenarios are added to `harness/required.yaml` in this phase, by file and number:

- `client` #2: during a game the menu offers rules and card set but not the tutorial
- `client` #3: opening the menu during a game does not stop the clock
- `client` #4: anyone can open the rulebook with its table of contents
- `client` #5: the rulebook explains every section of the game rules
- `client` #6: anyone can open the card set and see all 240 cards
- `client` #7: the card set filters by sector tier and type and searches by name
- `client` #8: searching the card set by name finds matching cards
- `client` #9: opening a card shows everything about it
- `client` #16: the menu in a waiting room does not offer the tutorial

## Progress

- [x] 0. Start (2026-11-17): branch `phase-28-menu-rules-and-card-set`. Spec gaps decided and
  written into the spec first (commit `HARNESS: Game menu, rules viewer and card set settled
  (S14.1, S14.2, S14.3; Q156-Q159)`): Q156 (no Markdown dependency: a small project renderer
  for the subset `rulebook.md` uses, loaded lazily), Q157 (which rulebook words become icons:
  stats by word, types written as inline code in `rulebook.md`, section titles stay words),
  Q158 ("See also" from a section's own links; C2.4 checked by the 21 sections matching R1–R21
  in order), Q159 (the menu lists only entries the player can open, no Tutorial entry until
  phase 29; clock lines only during a game; the client steps send nothing). Read them and
  S14.1 to S14.3 before building any item; they are the design.
  - Nothing here changes a message, the save or the room record: no `PROTOCOL_VERSION` (25),
    schema or migration change is expected. If one turns out to be needed, raise it as
    `proposed-rules.md` says.
  - B14 (initial download, 300 kB): the rules viewer, the rulebook text, the card set and the
    card detail are lazy chunks, as `src/client/screens/records/LazyRecordsPage.tsx` and
    `src/client/screens/privacy/LazyPrivacyNoticePage.tsx` are. Only the menu button and the
    menu itself go in the first screen. Check `npm run size` in every item that adds client
    code.
  - Scenarios: the 9 required ones run through a new **client driver**
    (`tools/harness-runner/client/CLIENT_DRIVER.ts`, added to `DRIVERS.ts`; tools may import
    `src/client/`, as `lobby/lobbyMessageThen.ts` does) built on the pure client functions,
    except `client` #3 (the clock), which needs the room driver (Q159). The client driver
    accepts the `given` of #2 and #16 (`seats`, `accounts`, `room`) as context only. A driver
    is chosen by field names (`runScenario.ts`, `missingFor`), so it must list every given,
    step and then field a scenario uses. All items: scenarios become required only in the
    finisher's run; until then check them by adding them to `harness/required.yaml` locally
    without committing.
  - Pages open by hash, as the ranking does (`RANKING_HASH`, `RankingButton.tsx`,
    `recordPageOf.ts`, `useRecordPage.ts`, `keepRecordPageInsideApp.ts`; `useOverlayPage.ts`
    for focus, Escape and Back). Suggested hashes: `#rules` (`#rules/<section-anchor>` for a
    section) and `#card-set` (`#card-set/<card name>` for a card); the builder of item 2
    settles them and later items follow.
  - During a game (S14.2, S14.3, S1.4): the page opens below the game's top bar and shows "Your
    clock keeps running while the rules are open." (the card set: "… while the card set is
    open.") with the time left as the game shows it; reuse the game screen's clock text and
    live clock (`YourClock.tsx`, `LiveBankChip.tsx`, `clockText.ts`, `useServerNow.ts`).
  - Icons (S1.6): reuse `StatChip`, `TypeChip` (with `count` 2 for a doubled type),
    `TextWithIcons`, `IconText`/`IconTextPart`, `STAT_ICONS`, `typeIconFile.ts`. Cards:
    `CardTileFace.tsx`, `BigCard.tsx`, `ComboLabel.tsx`, `sectorColor.ts`, `photoUrl.ts`. Card
    data: `src/shared/catalogue/CARDS.ts`, `Card.ts`, `Combo.ts`, `TYPE_NAMES.ts`.
  - Files near the line limit (300 non-blank lines): `tools/harness-runner/room/RoomSession.ts`
    (282), `tools/harness-runner/room/ROOM_DRIVER.ts` (264). Split them, do not grow them past
    the limit.
  - Order: 1, then 2 (needs 1's parser). 3, then 4 (needs 3's page). 5 last (it opens the pages
    of 2, 3 and 4). Items 3 and 4 may go before or after 1 and 2.

- [x] 1. **Rulebook parser, type markup and checks** (C2.1, C2.2, C2.4, S1.6, S14.2; Q156, Q157,
  Q158; scenarios `client` #4, #5). **Large.**
  - Done (2026-11-17). The type check reads the types from `cards.json` (`collectKnownNames`,
    as the other harness checks do) rather than `TYPE_NAMES`, since `tools/harness-check/` runs
    under plain Node; `catalogueMatchesSpec` keeps the two equal. `headingAnchor` moved to
    `src/client/screens/rules/headingAnchor.ts` and `checkRulebookLinks` imports it. A line
    "2. Types gained …" inside a paragraph is paragraph text, as in CommonMark (only "1. " starts
    a list there). Q157 records two details: "bonus types" stays words; link text in the prose
    gets stat icons.
  - For later items: `parseRulebook(text)` returns `Result<Rulebook, problems>`; `Rulebook` has
    `title`, `introduction`, `contents` (title, anchor), `sections` (title, anchor, blocks,
    `related`). Inline parts are `IconTextPart` (string, `{ stat }`, `{ type }`) or `{ kind:
    "bold" | "italic", parts }` / `{ kind: "link", anchor, parts }`; blocks are paragraph, list
    (`isOrdered`, items), table (header, rows of cells), preformatted (lines of `IconTextPart`).
    `linkAnchorsIn(blocks)` lists link anchors. The client driver is
    `tools/harness-runner/client/CLIENT_DRIVER.ts` (step `open_rules`, then `rules_viewer`,
    `rulebook_covers`); later items add their steps and fields there. `client` #4 and #5 pass
    with them added to `required.yaml` locally.
  - `HARNESS:` commit first: in `harness/spec/rulebook.md`, write every type name meant as a
    type as inline code (`` `Farm` ``, `` `Low Wealth` ``; the quest list and the bonus types
    table too; not "Service" as a sector, not card, quest or project names). Add a harness
    check beside `tools/harness-check/checkRulebookLinks.ts` that every inline code span names
    a type (`TYPE_NAMES`). Add the markup and the check to Q157's Implemented line. Run
    `npm run harness:check`.
  - A pure parser in `src/client/screens/rules/` from the rulebook text to its title, contents
    and sections: title, anchor (as `checkRulebookLinks`'s `headingAnchor` makes it), blocks
    (paragraph, list, table, preformatted block) and inline parts (text, bold, italic, link,
    stat icon, type icon), and each section's related sections (Q158). A unit test parses the
    whole `rulebook.md` and fails on any syntax the parser does not know. Stat words become
    `{ stat }` parts by Q157's list (`buildPasses` for build pass or passes); section titles
    stay words.
  - Start the client driver: step `open_rules` (`visitor`), then `rules_viewer` (`source`,
    `contents` 21, `links_work`: every link points to a section) and `rulebook_covers` (one
    section per listed R rule, in order, matched against `game-rules.md`'s `## R<n>.`
    headings; Q158).

- [x] 2. **Rules viewer page** (C2.1 to C2.3, S14.2; Q156, Q158). **Large.**
  - Done (2026-11-17). Hashes settled: `#rules` (opens the first section) and
    `#rules/<section-anchor>`; an unknown anchor shows the first section. Links between
    sections, the contents, "See also" and previous/next replace the history entry
    (`location.replace`), so Back and Escape close the rules in one step wherever the reader
    went. The rulebook's introduction is shown above the first section. Section links carry an
    absolute URL, since axe's skip-link rule fails `#…` links scrolled out of view. The page is
    rendered by `App.tsx` (like the records pages); during a game (`runningGameClockOf`: a game
    without a result, own seat not left) it starts below the 56 px top bar.
  - For later items: reuse `screens/game/RunningGameClock.ts`, `runningGameClockOf(update,
    offset)` and `ClockKeepsRunningNote` (text + the game's `YourClock`, role `note`) for the
    card set; open the rules with `RULES_HASH` (`screens/rules/RULES_HASH.ts`). The browser
    spec file is `e2e/rulesAndCardSet.spec.ts` (opens pages by setting `location.hash`).
  - The lazy page: contents on the left, the current section on the right with its text, "See
    also" links, previous and next buttons (none before the first or after the last section),
    links between sections, Back and Escape as on the other overlay pages. Rendered from item
    1's parse result as React elements, never as inserted HTML. Anyone can open it, logged in
    or not (C2.3), so it needs no session.
  - Opened during a game: below the top bar, with the clock line (see Start). The menu comes in
    item 5, so tests open the page by its hash.
  - Component tests: contents, a link, previous and next, icons with accessible names in the
    text (S1.6). A browser test (a new spec file, for example `e2e/rulesAndCardSet.spec.ts`) at
    the three sizes with `expectScreenFits` screenshots `rules-viewer` (from the lobby) and
    `rules-during-game`.

- [ ] 3. **Card set grid, filters and search** (C3.1, C3.2, C3.4, S14.3; scenarios `client` #6,
  #7, #8). **Large.**
  - Pure functions: the matching cards for a sector, tier, type (any of `type1`–`type5` and the
    double types) and name text (case-insensitive part of the card name: #8 expects "row house"
    to find "Tall Row Houses"), in `cards.json` order. Client driver steps `open_card_set`,
    `filter_cards` (`sector`, `tier`, `type`) and `search_cards` (`text`), and then `card_set`
    (`count`, `cards` by name).
  - The lazy page: tiles (reuse `CardTileFace`), the three filters (each with an "all" choice),
    the name search and the number of matching cards; photos load lazily (`loading="lazy"`) so
    240 photos do not load at once. Filters and search work by keyboard. During a game: below
    the top bar with the clock line.
  - Component tests, and a browser test with the screenshot `card-set` at the three sizes.

- [ ] 4. **Card detail** (C3.3, S14.3; scenario `client` #9). **Small.**
  - Clicking a tile opens the detail: the big card (`BigCard`), sector and tier, base cost, what
    it gives and uses up (stat icons with numbers), the types with a doubled type shown as
    elsewhere (`TypeChip` count 2), and every combo with "infinite" marked (`ComboLabel`). Back
    returns to the grid with the filters kept.
  - Client driver step `open_card` (`card`), then `card_detail` (name, sector, tier, base_cost,
    the stat numbers, types, double_types, combos with needs, gives and infinite).
  - Component test, and the screenshot `card-detail` at the three sizes.

- [ ] 5. **Game menu** (C1.1 to C1.3, S2.1, S10.1, S14.1; Q159; scenarios `client` #2, #3,
  #16). **Large.**
  - The **Game menu** button in the lobby top bar (S10.1; `LobbyTopBar.tsx`, like
    `RankingButton`) and in the waiting room (`WaitingRoomHeader.tsx` or `RoomPageFrame.tsx`),
    and the **Menu** button in the game's top bar (`GameTopBar.tsx`, S2.1). The menu: Rules and
    Card set with S14.1's lines (the clock lines only during a game) and no Tutorial entry
    (known gap, Q159). It opens the pages of items 2 and 3, closes on Escape and an outside
    click, and works by keyboard (real buttons, an accessible name for the menu).
  - Client driver: step `open_menu` (`from`: `lobby`, `waiting_room`, `game`), then `menu` (the
    entry labels). Room driver: `open_menu`, `open_rules` and `open_card_set` are client steps
    that send nothing (Q159), so `client` #3 checks the room's clock (885000 ms after 90 s: the
    first 75 s are free time, R9.4). Keep `ROOM_DRIVER.ts` under the line limit.
  - A client test: opening the menu and the rules during a game sends no message and the clock
    keeps counting (C1.3).
  - Browser tests: open the menu from the lobby, a waiting room and a game; screenshots
    `game-menu-lobby` and `game-menu-game`. Then check B14 (`npm run size`).

## Finish

- [ ] Finisher: the 9 scenarios into `harness/required.yaml`, the full check and harness, the
  branch check, screenshots, `docs/enforcement.md` (the rulebook type markup check), B14 still
  within its limit (exit criterion).

### Helper log

Filled in by the coordinator afterwards, from the helpers' completion notices (Q73). Tokens are
each helper's conversation size at its end.

| Job | Model, effort | Minutes | Tokens | Tool calls | Result |
|---|---|---|---|---|---|
| Starter | Opus, medium | 7 | 141k | 63 | done |
| Builder, item 1 | Opus, medium | 14 | 145k | 62 | done |
