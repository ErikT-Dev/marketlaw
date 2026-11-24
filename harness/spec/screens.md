# MarketLaw screens

Status: spec, 2026-10-27. Written from the Penpot designs, which are frozen and exported to
`design/export/` (local only, not committed).

This file defines what each screen shows and where. The rules themselves are in `game-rules.md`
(R), `multiplayer.md` (M), `accounts.md` (A), `client.md` (C) and `tutorial.md` (T). Everything
the rules list as public (M3.5) is shown somewhere on these screens.

- Every rule has a number, such as S4.2. The design boards are named after the screens below.
- **The spec wins over the design, every time.** The design shows how screens look; these rules
  and the other spec files say what they show and do. Where they contradict each other, the spec
  is followed. Known differences are listed in S17.
- All undecided points are listed under **Open questions** directly below.
- The rules only describe what the screens have and show. Things they do not have are left out
  instead of being mentioned.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

## Open questions

None yet.

## S1. Screen size and layout

- **S1.1** Every screen is designed for a page area of **1920×940**: a 1920×1080 monitor with the
  browser window maximized. Every screen stretches to work from 1280×720 to 2560×1440
  (`rules/frontend.md`, decision D21).
- **S1.2** The game screen shows everything on one table, without tabs or toggles: a top bar
  across the full width, then three columns.
  - Left: the quick summary tables of the other players (S3), and under them the game log and
    chat (S7).
  - Middle: the marketplace (S4), the quests table (S5), and your city and combos (S6).
  - Right: your stats and projects, your hand, and the action buttons (S6).
- **S1.3** Panels that can hold more than fits (your hand, your city, combos, the game log, chat,
  player lists) scroll, and show a scroll bar when they do.
- **S1.4** Pop-ups open over a darkened screen. During a game, pop-ups never stop the clock
  (C1.3); a pop-up that hides the clock repeats the time left.
- **S1.5** **Sector colours:** each sector has one colour from the design tokens. A Public quality
  card and a Public satisfaction card kind use the Public colour.
- **S1.6** **Stats and types are always icons:** wherever a stat (funds, income, workforce,
  quality, satisfaction, product, distribution, influence, build passes) or a card type is
  shown to a player, it is shown as its icon, with its number next to it where there is one, and
  never written out as a word. This holds on every screen, pop-up, table and label, and in all
  running text: rejection messages (S10.9, S16.3), notices, help texts and the rulebook in the
  rules viewer (S14.2). The texts in these rules name stats and types in words only to say which
  icon goes there. The name appears as a tooltip when the pointer is over the icon or the control
  the icon is in has keyboard focus (stat and type icons are not tab stops of their own: a screen
  shows dozens; player icons are, S1.8),
  and is the icon's accessible name for screen readers, as in S6.2 (owner's rule, 2026-11-06).
- **S1.7** **Sorting:** every list of types with their counts, on every screen, is sorted by
  count, most first, and then alphabetically by type name. Where the bonus types are shown first
  (S3.2, S6.2), this order holds inside each of the two parts. Every list of a player's combos
  (S3.2, S6.1, S8.1) is sorted as in S6.1. The combos printed on one card (S6.5, S14.3) are
  sorted by the same keys as far as they apply: type combos first, infinite before one-time,
  fewer needed first, bigger reward first, then reward stat in the order of R2.1; then card-name
  combos by card name.
- **S1.8** **Player icons:** a player's icon (A2.5) is a circle with their picture drawn in their
  picture colour on their background colour. Where a screen shows an icon instead of a name, the name appears as a tooltip when the pointer is over the icon or it has keyboard
  focus, and is the icon's accessible name. Unlike stat and type icons (S1.6), a player icon is a
  tab stop of its own, since a screen shows only a few and the name is not written anywhere near
  it; clicking it does nothing. Your own icon is named "You", as the rest of the screen names you
  (Q174). Every player icon in one part of a screen (a quest's lines, a list, a panel) has the
  same outer size and the same picture size, whether or not it is marked: a mark, such as the
  orange border of S5.1, is drawn outside the circle and makes neither the circle nor the
  picture smaller (Q188).
- **S1.9** **Whole numbers:** funds, income, total worth gained (F) and every amount of funds
  (card costs, rewards, sale values, influence action costs, Support) are shown as whole numbers
  everywhere, without a decimal place (53, 70), since they are whole (R2.5).
- **S1.10** **Buttons:** every button's background is at most 90% opaque, so the table shows
  through a little. The action buttons (S6.6) and every button of the lobby (S10, the waiting
  room's top bar included) have white text, on backgrounds dark enough for a contrast of at
  least 4.5:1 in every state (normal and highlighted); a disabled button keeps its dimmed look
  (Q188).
- **S1.11** **Browser tab:** every page shows the MarketLaw logo as its icon in the browser tab.
- **S1.12** **Panels:** the background of every panel (the dark blue boxes that mark each area
  of the game screen and the lobby) is 75% opaque, so more of the background picture shows
  through (Q188). A panel that S6.5 makes more transparent stays more transparent than the
  others.

## S2. Game screen: top bar

- **S2.1** The top bar shows: the **Menu** button (game menu, S14), the **turn number** "Turn 21 of
  40", the **phase** (market phase, main phase or game over; it says main phase as soon as your
  own main phase starts, R18.15), and the **player order** as player badges from the first player
  of the turn, with the first player marked "first player".
- **S2.2** Each badge in the top bar shows the player's username, your own too, and, during the
  main phase, whether they are **done**, **out of time** (R9.10), **away** or have **left**
  (R5.4). Players who left are not
  in the player order (R4.5); their badges come after it, by seat number. Your own badge never
  shows you away while this browser is connected to the game, also not when the game starts.
- **S2.3** On the right: the **user box** with your player icon (S1.8) and your username, which
  opens the user menu (S12.7),
  then your own clock, and **Leave game**. In your main phase the clock shows your main-phase time
  left, or **Out of time** once it has run out (R9.10), and your time bank; while other players
  still have their market go, it also shows whose go it is. Before your main phase it shows whose
  go it is and how long they have left ("Your go 0:24", "Go: Ann 0:12"), and your time bank.

## S3. Players

The left panel, and its region, is titled **Players** (Q188). It holds your counts (S3.3) and
the quick summary tables of the other players (S3.1).


- **S3.1** The **quick summary table** shows one card per other player, always visible: the
  player's icon (S1.8) left of their username,
  status (done, out of time, away, left), time bank counting down, funds, income, influence with
  its icon, number of cards in hand, cards played per sector, progress on each of the 3 projects,
  and four counts, each a bold letter in a bordered dark grey box next to its number: **Q**,
  quests they have completed (orange); **T**, the total of their type counts (R12.1): the types
  of the cards in their city, a type a card counts twice counting 2, plus the types they gained
  from quests (indigo); **C**, the combos they have claimed, each
  claim of an infinite combo counting (green); and **F**, their total worth gained (R2.4, red).
  It also shows the 5 types played most in their city, from their type counts with the types
  gained from quests, as icons with their counts, from most to least, ties in alphabetical order (S1.7); a bonus type among them is
  highlighted with a dark green background and a bright green border. During the main phase it
  shows them as at the start of their own main phase, except status and time bank, which are
  live (R5.4).
- **S3.2** Clicking a quick summary table opens that player's **detailed summary table**: stats,
  influence, time bank, cards in play by sector, type counts with the bonus types first (S1.7),
  the bonus types highlighted with a dark green background and a bright green border, combos
  claimed and what they gained (each claimed combo shown only by what it needs and what it gave,
  without the name of the card it is printed on), influence actions used, build passes and the price of the next
  bought pass, completed projects and quests, whether they are done, and the number of cards in
  their hand. It says that it shows them as at the start of their main phase. It also shows the
  **T** and **C** boxes of S3.1. Their five basic stats are shown together:
  workforce, quality and satisfaction in a small table of their own, whose background is red
  while any of the three is negative and neutral otherwise, and product and distribution next to
  it. Clicking a card in their city shows it in a big card (S6.5) inside the detailed summary
  table.
- **S3.3** **Your counts:** above the quick summary tables, a small table shows your player icon
  (S1.8) and your username over your own **Q**, **T**, **C** and **F** boxes, the same bold letters in the same bordered dark grey boxes as
  S3.1, so that you can compare them with the other players' at a glance. One **?** button next
  to them, named "What Q, T, C and F mean", works as in S5.4 and explains: "Q: quests you have
  completed. T: your types, from the cards in your city and from quests. C: combos you have
  claimed, every claim of an infinite combo counting. F: total worth gained, every fund you have
  received and every card you have gained."

## S4. Marketplace and market phase

- **S4.1** The **marketplace** panel shows the 8 places in the order of R18.5, each with its place
  name. A filled place shows the card as a card tile (S6.4) with its tier, and how many turns
  it still stays in the marketplace, counting the current turn's market phase until it ends
  ("2 turns left", "1 turn left", R18.13), or "Leaves next turn" once its last market phase has
  ended; an emptied place shows "Empty until next turn". Clicking a marketplace card, at any time, shows it in the big card
  (S6.5) and never takes it.
- **S4.2** The marketplace header also shows the **bonus types** with their point values, the
  number of cards left in the **deck**, and the number of cards in the **discard pile** (R5.5),
  without which cards they are or anything else about them (M3.2).
- **S4.3** In the market phase, the area of your city shows the **market go panel**:
  - on your market go: option A (select a marketplace card, then press the **Draw** button that
    appears under the selected card in the marketplace) and option B (one button per sector),
    with what each does, and what happens if your time runs out (R18.11); the marketplace is
    highlighted
  - before your go: whose go it is and how many players go before you
  - when the marketplace is empty: that your turn draw is option B, with the sector buttons
- **S4.4** Before your market go ends, the main-phase actions are not shown; the action area says
  they open when your market go ends, and quests cannot be completed (R18.15). As soon as your go
  ends, your city and the main-phase actions are shown, and you can play while later players
  still have their go.
- **S4.5** **Market phase banner:** until your own main phase starts, a banner across the top of
  the middle column, above the marketplace, reads **MARKET PHASE** in large letters with whose go
  it is: on your go it reads "Your go" on a **green** background; on another player's go it
  reads "Ann's go" on the strong background. The phase in the top bar (S2.1) is highlighted the
  same way. Both go back to normal when your own main phase starts.
- **S4.7** **Market countdown:** on your market go, a big red countdown of your time left for the
  go (R18.11) shows in the marketplace panel, besides the clock of S2.3, so you see it while you
  look at the cards. In its last 5 seconds the number pulses and the marketplace border turns
  red; with reduced motion it does not pulse.
- **S4.6** **Turn draw left open:** after a time-out on your market go, the action area shows
  "Your time ran out on your market go. Choose a sector for your 2 cards." with one button per
  sector, until you take it, and says that a random sector is used if you end your turn without
  choosing (R18.16).

## S5. Quests and projects

- **S5.1** Each quest on the table shows its name, tier, turns left, requirement and reward, and
  for every player a line, starting with their player icon (S1.8) instead of their name, with
  their progress on each part ("income 30 of 40 · Retail 1 of 1"), or "completed". In your own line, a negative workforce, quality or satisfaction is shown as a
  part not yet met (R19.4). In another player's line it is shown only when the quest's
  requirement names that stat; their stats are in the quick and detailed summary tables (S3). The
  icon of every other player who could complete the quest now, as you see them (R5.4), has a
  bold orange border, drawn outside the circle, so that it is as big as every other icon in
  the quest's lines (S1.8); the view says who can. In requirements, sector names are
  written in their sector colour (S1.5).
  - **Turns left** is a big number in a rounded box in the quest's top right corner, beside its
    name and tier, with "turns left" ("turn left" at 1) under it; the line under the name shows
    only "Tier N". The number is always the same size; only its colour changes, from the quest's
    full time on the table (R19.7: 6, 5 or 4 turns): **blue** at the full time (it just
    appeared), **green** above half of it, **yellow** from 2 up to half, **red** at 1. A quest in
    its extra turn (R19.6) shows a red 1. The box is named "N turns left" ("1 turn left").
- **S5.2** A quest you can complete now has a **Complete** button and a green border; a quest you
  completed is shaded green.
- **S5.3** The quests panel has room for 5 quests (R19.1) with 4 players and three-part
  requirements.
- **S5.4** The quests panel title **QUESTS** has a **?** button next to it, named "How quests
  work". Clicking it, or Enter or Space on it, opens a small help box next to the title;
  Escape, clicking elsewhere or clicking the button again closes it. Stats in the text are shown
  as their icons (S1.6). The text:
  > Quests are shared goals. In the main phase, complete a quest when you have what it asks for:
  > nothing is used up, and you get the reward at once. Workforce, quality and satisfaction must
  > all be 0 or more. Each player can complete each quest once, and several players can complete
  > the same quest in the same turn. In the turn a quest is first completed, everyone who
  > completes it gets 2 funds more for every tier of the quest. It then stays one more turn for
  > the others, and leaves.
  > A quest nobody completes leaves after 6 turns (tier 1), 5 (tier 2) or 4 (tier 3).
- **S5.5** **Last turn panel:** from turn 2 on, a panel titled "LAST TURN · TURN N" (N the turn
  before) sits in the middle column between the marketplace and the quests, full width, for the
  whole turn. It is a region named "Last turn" with four boxes in one row, each a list named by
  its title:
  1. **Quests completed:** a row per player and quest: the player's icon (S1.8) and name, the
     quest's name and its reward as icons (R19.6), with the extra funds of a first completion
     (R19.10) added to the reward's funds.
  2. **Projects completed:** a row per player and project: icon, name and the project.
  3. **Income gained:** a row per player whose income went up in the turn before, with "+N"
     income.
  4. **Support:** a row per player who got Support at the start of this turn (R11.5), with "+N"
     funds.

  Your own rows say "You". A turn with nothing to show shows only the title and "Nothing new last
  turn.". Everything in it comes from the view (M3.5), and each row is also a line of the game
  log (S7.2).

## S6. Your city, stats, hand and actions

- **S6.1** **Your city** shows your cards in play grouped by sector, as card tiles (S6.4) of
  140 × 94 px. **Combos** is one list of all
  the combos of the cards in your city, and the panel title says how many are ready. In the
  combos list, types and stats are shown as their icons (S1.6), never as words.
  - **Colours:** an infinite combo is blue and a one-time combo brown; a combo that is ready to
    claim is brighter: bright blue when infinite, green when one-time.
  - **What stays:** a one-time combo leaves the list once it is claimed; an infinite combo always
    stays.
  - **Order,** with no headings between the parts:
    1. Combos ready to claim, among themselves in the order of parts 2 and 3.
    2. Combos that need a type, grouped by that type, so all combos for the same type sit
       together. The groups are ordered by how much your city needs the type: first by how many
       infinite combos in the list need it, most first; then by how many one-time combos in the
       list need it, most first; then by type name, alphabetically. The counts take every combo
       in the list, the ready ones of part 1 included. Inside a group: infinite before one-time,
       then fewer needed first, then bigger reward first, then reward stat in the order of R2.1.
    3. Combos that need a card, by the name of that card, alphabetically; combos for the same
       card go infinite first, then bigger reward first.

  Scrolling the list shows at a glance which types your city needs most.
- **S6.2** **Your stats** shows funds, income, workforce, quality, satisfaction, product,
  distribution, build passes and influence, each with its icon and name, and your type counts
  (R12.1), the bonus types first and then the other types, each part
  sorted as S1.7 says, with the bonus types highlighted with a dark green background and a bright
  green border. Names appear as a tooltip when the pointer is over the icon,
  and are the icon's accessible name for screen readers.
- **S6.3** Under the stats, the **projects** area has the title **PROJECTS**, with a **?** button
  named "How projects work" that works as in S5.4. Each project shows your progress or
  "completed". Once another player has completed it, as far as you can see (R5.4), it says who
  has, as "Completed by" and the other players' icons (S1.8). "Completed by" names only the other
  players; your own completion is the "completed" of your progress, so when only you have
  completed it, neither line shows (Q77). The help text, with stats shown as their icons (S1.6):
  > You have 3 projects. In the main phase, complete one when you have 8 of its stat, at least
  > 100 income, and workforce, quality and satisfaction are all 0 or more. It uses up the 8 and
  > gives +10 income, +20 funds, +3 influence and 1 card, every time. The end goal needs all 3
  > projects and income 200.
- **S6.4** **Your hand** shows your cards in 2 columns, sorted by sector (Residential, Industry,
  Service, Public), then tier, lowest first, then card number. Each card shows its number, name
  and its **real cost** (R3.8), not the base cost. Cards you got this turn are marked **new**
  (R18.10). Cards you cannot play now, as the view says, are dimmed.
  - **Card tiles:** hand, city (S6.1) and marketplace (S4.1) cards are card tiles, and so are
    the cards of another player's city in their detailed summary table (S3.2) and the cards of
    the card set (S14.3). A diagonal line splits each tile: the left part has the sector colour
    with the number, name and cost; the right part, about 30% of the tile, shows a small picture
    of the card, made at 200 × 172 pixels and at most 16 KB (B19), which is decorative (no
    accessible name). Every card tile shows its picture (Q188). The line runs from 61% of the width at the top to
    77% at the bottom, the same on every tile, with a thin light line along it. The name wraps
    before the picture starts. Every tile of one kind (hand, city or marketplace) has one fixed
    size, whatever the name (a hand or marketplace tile is as wide as its column at the screen
    size, the same for every tile of that kind); a name too long for it is shown in a smaller font, chosen from its
    length, so that every one of the 240 names fits. The tile's background is the big card's card
    texture (`card-texture.webp`) under its sector colour at 80% of its strength, so the texture
    shows through as on the big card (Q188). A hand card keeps its playable edge on the far right, over the
    picture.
- **S6.5** Selecting a hand card opens the **big card** next to the hand, with what it costs and
  why ("Base cost 40, plus 30 for the 3 Residential tier 1 cards already in your city"), and
  **Play card**, **Sell** and **Close**; **Sell** asks "Sell for 10 funds?" and then sells only that
  card, as one sell action (R5.1). Selecting a marketplace card (S4.1) or a card in your city opens
  the big card in the same place with the card's base cost and **Close** only; selecting a card in
  another player's city shows it the same way inside their detailed summary table (S3.2). Until your own main phase
  starts (S4.4), the big card is shown over your stats and hand instead, so it never covers the
  marketplace, its **Draw** button or the market go panel; closing it keeps the marketplace card
  selected for **Draw** (S4.3). The big card's title bar
  has the same background as its stats bar, both more transparent than other panels, and its
  picture has a thin black border. Its stat numbers show a + before what the card gives and a −
  before what it uses up (R3.4). A type that the card counts twice (R12.1) is shown
  as its icon twice, in every place that shows a card's types (also the card set, S14.3). Selecting another hand card shows that card in full, with its own photo, within 100 ms
  of the click as a rule (the median of the clicks is under 100 ms) and never later than 300 ms
  after it: the photos of the cards in your hand are loaded in the background. The selection
  in the hand, the big card and Play card change together, only once the new card's photo is
  ready, so a card is never shown with a blank or another card's photo; until then the card
  selected before stays, and Play card plays the card shown. If the photo is not ready within
  300 ms, the card is shown anyway, with its sector colour where the photo goes until the photo
  arrives. Nothing else waits for a photo, and there is no loading screen.
- **S6.6** The action buttons are: Play card, Undo, Sell cards, Claim all, Use influence, Projects
  and End turn. **Claim all** shows how many claims pressing it would make now, as "Claim all
  (5)": every ready one-time combo counts 1, and an infinite combo counts once for each time it
  is ready (2 one-time combos and an infinite combo ready 3 times make 5). In turn 1, until your
  first action, a **Redraw hand** button shows how many redraws are left ("Redraw hand (3
  left)"); pressing it redraws at once, without asking (R17.12), and the button goes away after
  your first action or your third redraw. Buttons for actions you cannot take are disabled. Once
  you have played a card this turn, **End turn** is highlighted until you end your turn.
  **Claim all** is highlighted while its number is above 0, and **Projects** while the view says
  you can complete a project now. **Use influence** shows your influence with its icon. Ending
  your turn claims your ready combos for you first (R8.5). Every action button has white text
  (S1.10).
  Projects and Use influence always open their pop-ups (S8.2, S8.3), where each action is disabled
  when you cannot take it (Q32).
- **S6.7** After **End turn**, the action area says you are done and which players the turn is
  waiting for. While you are out of time (R9.10), it says so, and that you can keep playing until
  the other players are done.
- **S6.8** A move waiting for the server is shown faded with "Waiting for the server…". If it is
  rejected it is rolled back and an error message gives the reason (S16.3).
- **S6.9** **Card-name combos on the big card:** for every card the big card shows, from your
  hand, the marketplace or another player's city:
  - when playing it would make card-name combos ready (R12.3), its name is shown in red with a
    "!". These are the combos of cards in your city that need this card, and the combos printed
    on this card that need a card in your city; one-time combos you have already claimed do not
    count. Pointing at the name, or focusing it, shows those combos and the total workforce,
    quality and satisfaction playing the card would give through them, as icons (S1.6).
  - each card-name combo printed on it is highlighted red when the card it needs is in your
    city, and orange when that card is in your hand but not in your city.

  - pointing at a card-name combo's card number, or focusing it, shows the name of the card it
    needs.

  The client works this out from your city, hand and combos in the view (with what each has
  claimed) and the card data; it decides nothing (`rules/frontend.md`).
- **S6.10** **A hand card's combos:** when the big card shows a card from your hand, each combo
  printed on it that playing it would make ready now is highlighted, an infinite one with how
  many times it would be claimed ("×3"). This too is a lookup in the view and the card data.

## S7. Game log and chat in a game

- **S7.1** The game log and the room chat share one panel with two tabs, **Log** and **Chat**. The
  Chat tab shows the
  number of unread messages.
- **S7.2** The **game log** lists every public draw event of M3.3, newest first, each with its turn
  number: who drew, how many, and the sector or kind and tier; turn draws, with the option chosen,
  the marketplace card taken or the sector chosen; and discard shuffles. Once each main phase
  ends, it also lists what each player did in it (M3.7): the cards they played, by name, the
  quests and projects they completed, the influence actions they used, and their redraws of the
  starting hand ("Ann redrew their starting hand 2 times"), with stats as icons (S1.6). At the
  start of every turn from turn 2 on, it lists the rows of the Last turn panel (S5.5): quests and
  projects completed, income gained and Support.
- **S7.3** **Chat** shows the messages since you joined, each with the sender, time and a **Mute**
  link; your own messages are highlighted; joins, leaves and similar events appear as grey lines:
  a player joined the room, left the room or left the game (also after 3 time-outs, R9.11), and
  the game started or ended. Like messages, you see only those since you joined; a room keeps
  its last 200 grey lines.
  Muted players are listed with **Unmute** (A11.7). The input shows the characters used, out of
  200.
- **S7.4** When a chat limit is reached, a message over the input says which limit and when you can
  send again (A11.6): "You can send 1 message every 2 seconds. Try again in N seconds." (counting
  down, "1 second" at the end); "You have sent 100 messages in this room, the most per room.";
  and the site-wide cap's text of S16.1. A message refused for any reason, a limit or another (the
  server did not answer, you are no longer in the room), stays in or goes back into the input, with
  the reason over it. A message over 200
  characters or 800 bytes reads "A message can be at most 200 characters.", and an empty one
  cannot be sent.

## S8. Main-phase pop-ups

- **S8.1** **Claim all combos** lists each ready combo and its reward, and the total workforce,
  quality and satisfaction you will get, before you confirm. Needs, rewards and totals show their
  types and stats as icons (S1.6).
- **S8.2** **Projects** shows each project with its picture, its need (8 of its stat and at least
  100 income, R16.2), what you have, its reward, and a **Complete** button when you can complete
  it.
- **S8.3** **Use influence** shows your influence and funds; every influence action of
  `influence-actions.txt` that is not a draw action as a tile, in the order of the file, with its
  costs and gains as written there, its uses left, "unlimited uses", "used", or what you are
  missing. A tile's background shows its limit: actions with `no limit` have one background and
  limited actions (`1 per game`, `N per game`) another; and its colours also show whether you can
  take it now or not, besides its disabled state (colours from the design tokens); and the draw
  actions as a table of 5 kinds by the tiers the file has draw actions for,
  with their costs, showing "None left" for kinds and tiers not in the deck or
  discard pile as you see them (R15.3). Every stat in the pop-up (in trades, costs, what you are
  missing, and your influence and funds) is shown as its icon (S1.6), never as a word. In the draw
  table, each kind's name has its sector colour as background (S1.5).
- **S8.4** When you have taken 50 actions in the main phase, a message says so and every action
  except End turn is disabled (R5.3).

## S9. Game states and endings

- **S9.1** **Leave game** asks for confirmation and says that you cannot come back or win, what
  happens to your city and hand, and that you stay in the room and its chat (M6).
- **S9.2** A player who left a game in progress sees "You left the game", the room chat and **Exit
  to lobby**; the result appears when the game ends (M6.7).
- **S9.3** **Abandon vote:** calling a vote asks for confirmation and explains M7; the other
  players get a dialog with the time left to answer; every player still in the game sees how many
  players have answered so far, as "1 of 2 players answered" (M7.5); when the vote fails, a
  message says the game goes on and when the next vote is possible.
- **S9.4** Messages: your time ran out in the main phase (R9.10): in a ranked game with how many
  time-outs in a row you have had out of 3, as "This was 1 of 3" (R9.11), and in a casual game
  that you can keep playing until the other players are done; the game continues
  after a pause, and who gets free time (R9.13).
- **S9.5** The **end-of-game screen** has a version for each ending: end goal reached, turn limit,
  last player left (M6.8), and abandoned. It shows the winner and why the game ended, and a table
  of every player: place, result, score, end goal reached, the Q, T, C and F boxes (S3.1), and
  in a ranked game the rating before and after. Each player's score is explained part by part,
  as in R21.4: income, workforce, quality, satisfaction, product, distribution, funds, cards in
  hand, and bonus-type points, each with its points, adding up to the score. A line under the
  table says how places are decided (R21.8, R21.9). A player who left is shown with the score of
  their values when they left (A3.3). An abandoned game shows no table.
  Buttons: Exit to lobby, Ask for a rematch (when possible) and Close.

## S10. Lobby

- **S10.1** The top bar shows the game title, **Game menu**, **My match history**, **ELO ranking**,
  and the user box with your player icon (S1.8), your username and your rating: "Rating 1043" for a registered user, "Guest"
  for a guest user, who cannot play ranked games (A8.1; Q154). Logged out, it shows **Log in** and
  **Sign up** instead.
- **S10.2** **Players online** lists every player online with their badge: username, rating once
  they have played a ranked game, and status online or in a game (A7.2), with the total count, as
  "Players online · 37". Players are listed by username in alphabetical order, each once however
  many tabs they have open (Q152).
- **S10.3** **Public rooms** lists each public room's players and free places, with **Join**, plus
  the room-code field with **Join with code**, and **Create room**.
- **S10.4** **Ranked queue** shows how many players are in it in total and for each game size
  (A8.4), how ranked games work, your rating and number of ranked games, the **game sizes** as
  three toggles (2, 3 and 4 players; A8.2), and **Join the ranked queue**. In the queue it shows
  **Leave the queue**, the game-size toggles stay changeable (A8.3), and joining rooms is
  disabled. For logged-out players, guests and unconfirmed email addresses the button is
  disabled with the reason (A8.1). The last chosen game size cannot be turned off (A8.2, A8.3).
  Texts (Q137):
  - Out of the queue: "A ranked game starts as soon as enough players for one of your game sizes
    are in the queue. Ranked games change ELO ratings."
  - In the queue: the title "You are in the queue" and "N players are in the queue, including
    you. A match starts as soon as enough players for one of your game sizes are in it. You can
    change your game sizes while you wait. You cannot join a room while you wait."
  - While confirming a match (behind the **Match found** dialog of S10.7): the counts and the
    out-of-the-queue text, since a confirming player is not counted in the queue (A8.7, Q146),
    with **Leave the queue**.
  - Times shown in the lobby (the confirm time left, a rejoin wait) are counted on the server's
    clock, from the server time each queue view carries (Q147).
  - Logged out: "Log in or sign up to play ranked games."
  - Guest user: "Sign up and confirm your email address to play ranked games."
  - Unconfirmed email address: "Confirm your email address to play ranked games. We sent you a
    link." with **Send it again** (A1.4).
  - Rejoin wait (A8.9): the button is disabled with "You can join the ranked queue again in
    M:SS." The page shows the wait and the player's own daily limits also after a reload, and
    after **Confirm** a reloaded page still shows the confirmed dialog (Q144).
  - A player's own daily limits: the texts of S16.1, with the button disabled.
  - While no match can be made (A9.4): "Daily game limit reached, try again after 00:00 UTC",
    shown to everyone in the queue.
  - A rejected **Join the ranked queue** with `not_registered` or `email_not_confirmed` shows the
    matching reason above instead of the S10.9 text.
- **S10.5** **Create room** asks for public or private, and size 2, 3 or 4, with the human check.
- **S10.6** Join errors are shown under the room-code field: code not found, room full, game
  already started, rejoin wait with the time left, a player in the room with the same username,
  and busy elsewhere (M1, M2).
- **S10.7** **Match found** shows the game size and asks you to confirm within the time shown,
  without naming the other players (A8.7), and says what happens if you decline. Texts (Q137):
  the title "N-player match found!", "A ranked game with N players is ready. Confirm that you
  will play.", "M:SS left to confirm. If you decline or do not confirm in time, you leave the
  queue and can join again after 2 minutes.", and **Decline** and **Confirm**. The dialog has no
  other way to close. After **Confirm** it shows "Confirmed. Waiting for the other players." with
  the time left, without saying how many have confirmed. When the game starts, the game screen
  opens. When the match does not start (A8.9, A9.4), the lobby shows a notice:
  - to a player who confirmed: "The match did not start because a player did not confirm. You
    are back at the front of the queue.", or the site-wide text of S16.1 when the site game limit
    stopped it, or "The match did not start because a player has reached a daily limit. You are
    back at the front of the queue." when another player's own daily limit (A9.2, A9.3) stopped
    it (Q145);
  - to every player of a confirmed match for which no room could be made: "No room could be made
    for the match. Join the ranked queue again." (Q145);
  - to a player whose own daily limit stopped it: the text of S16.1 for that limit;
  - to a player who did not confirm: "You did not confirm the match and left the queue. You can
    join it again in M:SS."
- **S10.8** Empty lists say so: no public rooms, only you online.
- **S10.9** A rejected lobby or room action shows the text for its reason code, in the place where
  the player acted (under the room-code field, in the dialog, or as an alert in the waiting room).
  Codes that only a broken or forged client can cause show "Something went wrong" as in S16.3.

  | Reason code | Message |
  |---|---|
  | `room_not_found` | No room has the code CODE. Check the code and try again. |
  | `room_full` | This room is full. |
  | `room_not_waiting` | The game in this room has already started. |
  | `rejoin_too_soon` | You can join this room again in M:SS. From the ranked queue: You can join the ranked queue again in M:SS. |
  | `username_in_room` | A player in this room has the same username as you. Join another room. |
  | `busy_elsewhere` | You are already in a room, the ranked queue or a game. Leave it first. |
  | `invalid_room_size` | Choose a room size of 2, 3 or 4 players. |
  | `not_room_owner` | Only the owner can change the room size. |
  | `room_size_too_small` | The room cannot be smaller than the number of players in it. |
  | `not_in_room` | You are not in this room. |
  | `not_asking` | Nobody is being asked to accept the game right now. |
  | `human_check_failed` | The human check did not pass. Try it again. |
  | `username_invalid` | Use 3 to 20 letters, digits, spaces, - or _, without spaces at the start or end or two spaces in a row. |
  | `username_taken` | That username is taken. Choose another one. |
  | `username_reserved` | That username cannot be used. Choose another one. |
  | `login_failed` | Wrong username, email or password. |
  | `email_invalid` | Enter a whole email address, such as name@example.com. |
  | `password_invalid` | Use 8 to 64 characters for the password. |
  | `username_change_too_soon` | You can change your username at most 4 times in 7 days. |
  | `unknown_icon` | That picture is not one of the player icons. |
  | `icon_colors_too_alike` | These colours are too alike. Choose colours with more contrast. |
  | `icon_change_too_soon` | You can change your icon at most 10 times in 24 hours. |
  | `email_not_confirmed` | No account has confirmed this email address. |
  | `email_limit_reached` | No more emails can be sent for this account or to this address today. Try again after 00:00 UTC. |
  | `password_wrong` | Wrong password. |
  | `link_expired` | This link no longer works. |
  | `not_registered` | Sign up first. |
  | `no_free_room_code` | No room could be created right now. Try again. |
  | `no_answer` | The server did not answer. Try again. |
  | `not_in_queue` | You are not in the ranked queue. |
  | `no_match_to_confirm` | This match is no longer waiting for you. |

  `invalid_game_sizes` can only come from a broken or forged client, since the last chosen game
  size cannot be turned off (S10.4), and shows "Something went wrong".

## S11. Waiting room

- **S11.1** The waiting room keeps the lobby's top bar and players online list, and shows the room
  in the middle and the room chat on the right. The room chat is the Chat of S7.3 and S7.4,
  without the tabs; the waiting room and the game show the same conversation.
- **S11.2** The room shows its code, public or private, who the owner is, **Copy room code**, **Leave
  room**, the size control (enabled only for the owner, and not below the players present), the
  players with the owner marked, the free places, and how the game starts.
- **S11.3** When the room is full, every player gets the **accept** dialog with the time left and
  the usernames of the players who have accepted (M1.10). A player who declined or ran out of time
  sees a message in the lobby with when they can rejoin.
- **S11.4** After a game, the room keeps the top bar, the players online list and the room chat
  of S11.1 (Q152), and shows the result, the players still in it, **Ask for a rematch**, **Leave
  room**, and when the room will be deleted (M8). The rematch dialog shows the time left and who
  has accepted (M8.4). **Close** on the end-of-game screen (S9.5) leads here;
  the result line has **Show result**, which opens the end-of-game screen again.

## S12. Accounts

- **S12.1** Joining without an account asks for a username, prefilled with a generated name, with
  the human check (A1.2).
- **S12.2** **Log in** asks for username or email, and password, with links to forgotten password
  and sign up. After repeated failures it shows the human check and why (A1.13).
- **S12.3** **Sign up** asks for username (prefilled), email and password, with the human check,
  and says what is kept (A1.3). Afterwards a notice asks the player to confirm their email, with
  **Send it again**, and says to look in the spam folder if no email arrives (A1.4).
- **S12.4** Email links open: email confirmed, set a new password (password twice, with **Set
  password**; afterwards the player is logged in), or link expired (A1.16), which offers **Send
  it again** to a logged-in player whose address is still unconfirmed and **Forgot password** to
  everyone else. **Forgot password** (from Log in, S12.2) asks for the email address with the
  human check, then says to check that email and its spam folder (A1.7).
- **S12.5** **Account settings** shows the username (disabled, with the next allowed date, after
  4 changes in 7 days, A2.4), the player icon with **Change icon** (A2.6), which opens a picker:
  every picture of the folder as a button named by the picture, a background colour and a
  picture colour, a preview, and **Save**, disabled with "These colours are too alike." while
  the contrast is under 3:1, and with the time of the next allowed change after 10 changes in
  24 hours; the email address with its confirmation, a pending change, **Change email address**,
  **Log out** and **Delete account**. Guests see **Sign up** instead of email. A removed email
  address is explained, with **Add an email address** (A1.11). An unconfirmed address offers
  **Send it again**. Signup and account settings link to the privacy notice (S12.8).
- **S12.6** Warnings before: a guest logs out (cannot log back in; leaves a game in progress);
  deleting an account (with password); deleting during a game (counts as leaving).
- **S12.7** The user menu holds Account settings, My match history and Log out, and for guests
  **Sign up to keep your account** first. It is the same in the lobby, a waiting room and a game.
  Opening it, or anything in it, during a game does not pause anything (C1.3); a guest who logs
  out gets the warning of S12.6 first.
- **S12.8** The **privacy notice** page shows the text of A12.1 with the contact address, the
  picture credits with each artist's name and the licence, and a way back to where the player
  came from. Anyone can open it, also when not logged in.

## S13. Records

- **S13.1** **Match history** lists games newest first: date, casual or ranked, result, place
  ("2nd of 4"), score, winner and winner's score, number of players and turns. Clicking a game opens
  its record; clicking a username opens that player's match history. With no games, it says so.
  It shows the 50 newest games, and **Show older games** adds the next 50. A match history whose
  account no longer exists says so: "This player's account no longer exists." Dates are the
  date the game ended, in the viewer's local time.
- **S13.2** The **game record** shows when the game started and ended, how long it took, the turns,
  the winner, the bonus types and casual or ranked, and a column per player with every value of
  A3.2, the Q, T, C and F counts as the boxes of S3.1. Deleted accounts show "Deleted player". A player who left shows the turn they left in
  ("left (turn 20)"), with their values at that moment (A3.3). Times are the viewer's local time.
- **S13.3** The **ELO ranking** shows 50 players per page with place, username, rating and ranked
  games, page buttons, and **Jump to me**. Your row is highlighted whenever it is on the shown
  page, not only after Jump to me (Q153). Players not in the table see why, and Jump to me is
  disabled. It opens at page 1 as a page over the current screen with
  **Back**, like a match history (S13.4); usernames open match histories (A6.1). Texts (Q153):
  - Above the table: "Every registered player with at least 1 ranked game, highest rating first.
    Equal ratings: more ranked games first, then by username."
  - Pager: "‹ Previous", "Page 3 of 9 · places 101–150", "Next ›".
  - Logged out: "Log in to find your place in the ranking."
  - Guest user: "You are not in the ranking: it lists registered players who have played at least
    1 ranked game. Sign up to play ranked games."
  - Registered user without a ranked game: "You are not in the ranking yet: it lists registered
    players who have played at least 1 ranked game. Join the ranked queue from the lobby."
  - An empty table: "Nobody is in the ranking yet."
- **S13.4** Match histories and game records open as pages over the current screen, each with
  **Back** to where the player came from; during a game nothing pauses (C1.3). A username opens
  that player's match history wherever it stands on its own: the player badges (S2.2), the
  quick and detailed summary tables (S3), the room's player list (S11), the end-of-game table (S9),
  chat (S7.3), the public rooms (S10.3), match histories and game records. Clicking the username
  in a quick summary table opens the match history; clicking the rest of it opens the detailed
  summary table (S3.2).
  Usernames inside sentences (the draw log, messages, dialogs) and your own user box (S12.7) do
  not open a match history.

## S14. Game menu, rules and card set

- **S14.1** The **game menu** lists Rules, Card set and Tutorial with one line about each. During a
  game, a room or the ranked queue, Tutorial is disabled with the reason, and Rules and Card set say
  that the clock keeps running (C1). The lines: Rules "How to play, with examples", Card set "All
  240 cards, with filters and search", Tutorial "A guided one-player game that teaches the first
  turns", disabled "Not available while you are in a game, a room or the ranked queue". Only
  during a game, where a clock runs, do Rules and Card set say "Your clock keeps running while
  you read" and "… while you look" instead; in a waiting room or the ranked queue they keep their
  lobby lines (Q159). In the tutorial, which has no clock (C4.5), Rules and Card set keep their
  lobby lines and Tutorial is disabled with the reason (Q168).
- **S14.2** The **rules viewer** shows the rulebook's table of contents on the left, the current
  section on the right, links to related sections, and previous and next buttons. Opened during a
  game, it leaves the top bar visible and repeats the time left ("Your clock keeps running while
  the rules are open." with the time left as the game shows it). The related sections are the
  sections the current section links to, in the order they first appear, shown as "See also"
  under the text. Section titles, in the contents, the headings, "See also" and the previous and
  next buttons, are written as words, since they name sections. In the rulebook's text, tables
  and score formula, every stat name (fund or funds, income, influence, workforce, quality,
  satisfaction, product, distribution, build pass or build passes) is shown as its icon
  (S1.6), and every type is shown as its icon; `rulebook.md` writes each type name meant as a
  type as inline code (`` `Farm` ``), since a type name is also a sector name (Service) or part
  of a card or quest name (Q157). The influence action table and the quest list tables are made
  from `influence-actions.txt` and `quests.txt` where `rulebook.md` marks them (R15.6, R20.9),
  in the rulebook's table layout.
- **S14.3** The **card set** shows cards as card tiles with their pictures (S6.4), with filters for sector, tier and type, a name
  search, and the number of matching cards. Clicking a card opens its detail: the big card, sector
  and tier, base cost, what it gives and uses up, types including any counted twice, and every
  combo, including whether it is infinite. Opened during a game, it leaves the top bar visible
  and repeats the time left, as the rules viewer does (S1.4).

## S15. Tutorial

- **S15.1** The tutorial uses the game screen without opponents, timers or chat. The top bar shows
  "Tutorial · turn N" and **Leave tutorial**.
- **S15.2** The **tutorial text box** shows "Step N of 19", the step's text from
  `tutorial.md`, the action asked for, **Continue** on text-only steps (**Finish** on the last),
  and **Restart**, as S15.5 to S15.7 say. The part of the screen the step is about is
  highlighted (a card, a button, a sector or a quest; the hand and the stats on T1.1, the
  marketplace and the market go on T2.1). The step's message is shown right next to the
  highlighted part, with an arrow pointing at it; while a message waits for **Continue**, the
  rest of the screen is greyed out a little. The side of the table the step is not on cannot be
  used: on a hand, action or claim step only the hand and actions side, on a marketplace,
  sector or quest step only the middle, on a text step neither. Another choice on the side
  that can be used is answered with Not this step (S15.3). **Restart** starts the tutorial
  again from T1.1 without asking; it counts as starting a tutorial (A9.6) (Q161, Q162, Q167).
- **S15.3** Any other action shows "Not this step" with what the tutorial is waiting for (C4.4):
  "The tutorial is waiting for you to *waiting for*. Nothing changed." (S15.7).
- **S15.4** After the last step, **Tutorial complete** says "You played your first turns, got your
  first income and completed your first quest." and "The tutorial creates no game record and does
  not change your rating.", and offers **Read the rules**, **Play it again** and **Go to the
  lobby**. Play it again restarts the tutorial as Restart does; Read the rules and Go to the
  lobby leave it (C4.8). **Leave tutorial** asks "Leave the tutorial?" with "Your progress in the
  tutorial is lost. You can start it again from the beginning any time from the game menu.",
  **Stay** and **Leave tutorial** (Q163).
- **S15.5** The steps are numbered in the order of `tutorial.md`, T1.1 to T5.4: 19 steps. The text
  box shows "Step N of 19".
- **S15.6** A step's text box shows, in this order: the text after the step before it, if that
  step has one; the step's own text; and its action line. Where the step's own text ends with
  the sentence of its action line, that sentence is shown once, as the action line. T1.1 and T2.1
  show **Continue** and T5.4 shows **Finish** instead of an action line.
- **S15.7** Each step's action line, and what "Not this step" says the tutorial is waiting for
  (S15.3), come from the table below. The action line is the *waiting for* words with a capital
  letter and a full stop.

  | Step | Waiting for | Step | Waiting for |
  |---|---|---|---|
  | T1.1 | press Continue | T3.1 | draw 2 Public cards from the deck |
  | T1.2 | play Row House | T3.2 | play Public Playground |
  | T1.3 | sell Hiking Trail | T3.3 | end your turn |
  | T1.4 | end your turn | T4.1 | take Orchard from the marketplace |
  | T2.1 | press Continue | T4.2 | play Orchard |
  | T2.2 | take Fire Station from the marketplace | T4.3 | end your turn |
  | T2.3 | play Fire Station | T5.1 | draw 2 Service cards from the deck |
  | T2.4 | claim all ready combos | T5.2 | play Liquor Shop |
  | T2.5 | end your turn | T5.3 | complete Trading post |
  |  |  | T5.4 | press Finish |

## S16. Notices and messages

- **S16.1** Daily limits use the texts of A9; the site-wide ones read "Daily game limit reached,
  try again after 00:00 UTC" and "Daily limit reached, try again after 00:00 UTC". A player's own
  limits read "You have used your 2,000 game actions for today. You can join rooms, the ranked
  queue and new games again after 00:00 UTC." (A9.2) and "You have started 10 games today, the
  most per day. Try again after 00:00 UTC." (A9.3). When the site game limit stops a game in a
  waiting room, everyone in it gets a notice titled "Daily game limit reached" with the site-wide
  text (Q68).
- **S16.2** Other notices: the game is open in another tab, with **Play here instead** (M5.1);
  connection lost and reconnecting, with actions disabled; a new version is available, with
  **Reload** (M9.1); and room not found.
- **S16.3** A rejected game move is rolled back and shown in an error message with the text for
  its reason code. `stale_state` shows no message: the view reloads quietly. Codes that only a
  broken or forged client can cause share one message.

  | Reason code | Message |
  |---|---|
  | `out_of_time` | Your time ran out before your move arrived. |
  | `wrong_phase` | You cannot do that in this phase. |
  | `not_your_go` | Wait for your go in the market phase. |
  | `already_done` | You are done for this turn. |
  | `action_limit_reached` | You have used all 50 actions this turn. You can still end your turn. |
  | `game_over` | The game has ended. |
  | `not_in_game` | You are not playing in this game. |
  | `card_not_in_hand` | That card is not in your hand any more. |
  | `not_enough_funds` | You need N funds; you have M. |
  | `tier_not_allowed` | Tier 2 and 3 cards can be played from turn 5. |
  | `no_build_pass` | You have no build pass left. You get 1 every turn, and can buy more with Use influence. |
  | `nothing_to_claim` | No combo is ready to claim. |
  | `trade_limit_reached` | You have used this influence action as often as allowed. |
  | `cannot_afford_trade` | You do not have enough for this trade. |
  | `no_card_of_kind` | No card of that kind and tier is left in the deck or discard pile. |
  | `project_already_completed` | You already completed this project. |
  | `project_needs_not_met` | You need 8 of the stat, at least 100 income, and no negative workforce, quality or satisfaction. |
  | `quest_not_on_table` | That quest is no longer on the table. |
  | `quest_already_completed` | You already completed this quest. |
  | `quest_needs_not_met` | You do not meet this quest's requirement yet, or workforce, quality or satisfaction is negative. |
  | `nothing_to_undo` | There is nothing to undo. |
  | `cannot_undo` | That action cannot be undone, because it drew a card or came after one that did. |
  | `out_of_market` | Your market go is over for this turn. |
  | `redraw_too_late` | You can only redraw your starting hand in turn 1, before your first action. |
  | `no_redraw_left` | You have already redrawn your starting hand 3 times. |
  | `card_not_in_marketplace` | That card was just taken. |
  | `marketplace_empty` | The marketplace is empty: choose a sector. |
  | `vote_not_allowed` | Ranked games cannot be abandoned. |
  | `vote_too_soon` | Next vote possible in turn N. |
  | `vote_already_open` | A vote is already open. |
  | `no_vote_open` | There is no vote to answer. |
  | `vote_already_answered` | You already answered this vote. |
  | `rematch_not_possible` | A rematch needs a finished game, at least 2 players in the room and no other rematch being asked. |
  | `not_this_step` | Not this step, with what the tutorial is waiting for (S15.3). |
  | `invalid_token` | Your guest session has ended. Enter your name again. (The start page opens.) |
  | `malformed_message`, `unknown_action`, and any other code a game move cannot get (`room_not_found`, `room_full`, `room_not_waiting`, `invalid_room_size`) | Something went wrong. The page reloads your game. |
  | `wrong_protocol_version` | A new version is available: reload. |

## S17. Known differences in the design

The design was frozen before these rule changes reached every board. Where a board shows any of
these, the spec is followed:

- **Market buying is gone (R18.8).** Marketplace cards on most game boards show "Buy 3" or
  "Buy 4" price tags, and draw logs show "Ann bought Gym from the marketplace for …". Marketplace
  cards show no price (S4.1), and the draw log shows turn draws as in S7.2.
- **The rules viewer** board shows the old option (B) text with "You are out of the market phase
  for this turn". The rules viewer shows `rulebook.md` as it is.
- **The ranked queue** on the boards "Menu: game menu in the lobby" and "Notices: daily limits"
  says ranked games have exactly 3 players. The ranked queue is as S10.4 and A8.
- **The rejected move messages** board lists `turn_draw_first` and an old `out_of_market` text. The
  messages are those of S16.3.
- **The top bar** on the market boards shows "Main phase". In the market phase it shows the market
  phase (S2.1).
- **The game's top bar** has no user box on any board. It has one, as in the lobby (S2.3, S12.7).
- **The abandon vote dialogs** do not show how many players have answered. They do (S9.3).
- **The rematch dialog** shows the player who asked as already accepted. The player who asked
  accepts like everyone else (M8.4).
- **The room after the game** shows the room size control and a free place. A room takes no
  new players and cannot change its size once its game has started (M1.4, M1.6), so neither is
  shown (S11.4).
- **The email screens** show the address on "Account: email confirmed", "Go to the lobby" on it and
  on "Account: link expired", "Send a new link" on "Account: link expired" and "Save and log in"
  on "Account: set a new password". Email confirmed shows no address and closes with OK; link
  expired offers Close and **Send it again** or **Forgot password** (S12.4); the new password is
  saved with **Set password** (S12.4, Q113).
- **Account settings** on "Account: settings, email removed" names the removed address, and the
  boards show the address in a text field. The removed address is explained without naming it
  (the account no longer holds it, A1.11), and the address is shown as text with its
  confirmation (Q114).
- **The card set** board "Card set: grid" filters types with an "Any type" dropdown, and "Card
  set: card detail" writes stats, types and combos as words ("1 Farm → +1 workforce", "None of
  them is infinite"). Types and stats are always icons (S1.6), so the type filter is a row of
  type icon buttons, and the detail shows stats and types as icons and marks an infinite combo
  with its infinite mark (S14.3, Q160).
- **The tutorial boards** count "Step N of 21". The tutorial has 19 steps, and the box shows
  "Step N of 19" (S15.5, Q161).
