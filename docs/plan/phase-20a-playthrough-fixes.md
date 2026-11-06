# Phase 20a: Playthrough fixes

Status: approved
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
