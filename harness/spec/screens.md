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
  - Left: the opponents overview (S3), and under it the draw log and chat (S7).
  - Middle: the marketplace (S4), the quests table (S5), and your city and combos (S6).
  - Right: your stats and projects, your hand, and the action buttons (S6).
- **S1.3** Panels that can hold more than fits (your hand, your city, combos, the draw log, chat,
  player lists) scroll, and show a scroll bar when they do.
- **S1.4** Pop-ups open over a darkened screen. During a game, pop-ups never stop the clock
  (C1.3); a pop-up that hides the clock repeats the time left.

## S2. Game screen: top bar

- **S2.1** The top bar shows: the **Menu** button (game menu, S14), the **turn number** "Turn 21 of
  40", the **phase** (market phase, main phase or game over), and the **player order** as player
  badges from the first player of the turn, with the first player marked "first player".
- **S2.2** Each badge in the top bar shows the player's username, your own too, and, during the
  main phase, whether they are **done**, **away** or have **left** (R5.4). Players who left are not
  in the player order (R4.5); their badges come after it, by seat number.
- **S2.3** On the right: the **user box** with your username, which opens the user menu (S12.7),
  then your own clock, and **Leave game**. In the main phase the clock shows your
  main-phase time left and your time bank; in the market phase it shows whose go it is and how
  long they have left ("Your go 0:24", "Go: Ann 0:12"), and your time bank.

## S3. Opponents

- **S3.1** The **opponents overview** shows one card per other player: username, status (done,
  away, left), time bank counting down, funds, income, number of cards in hand, cards played per
  sector, and progress on each of the 3 projects. During the main phase it shows them as at the
  start of the main phase, except status and time bank, which are live (R5.4).
- **S3.2** Clicking an opponent card opens their **board**: stats, influence, time bank, cards in
  play by sector, type counts with the bonus types first, combos claimed and what they gained,
  influence actions used, build passes and the price of the next bought pass, completed projects
  and quests, whether they are done, and the number of cards in their hand. It says that it shows
  them as at the start of the main phase.

## S4. Marketplace and market phase

- **S4.1** The **marketplace** panel shows the 8 places in the order of R18.5, each with its place
  name. A filled place shows the card's tier and name; an emptied place shows
  "Empty until next turn".
- **S4.2** The marketplace header also shows the **bonus types** with their point values, the
  number of cards left in the **deck**, and the **discard pile** with a link to view it (R5.5).
- **S4.3** In the market phase, the area of your city shows the **market go panel**:
  - on your market go: option A (click a marketplace card) and option B (one button per sector),
    with what each does, and what happens if your time runs out (R18.11); the marketplace is
    highlighted
  - before your go: whose go it is and how many players go before you
  - after your go: that you have had your go this turn, and that the main phase starts when
    everyone has had theirs
  - when the marketplace is empty: that your turn draw is option B, with the sector buttons
- **S4.4** In the market phase the main-phase actions are not shown; the action area says they open
  when the market phase ends. Quests cannot be completed (R19.5).

## S5. Quests and projects

- **S5.1** Each quest on the table shows its name, tier, turns left, requirement and reward, and
  for every player a line with their progress on each part ("income 3 of 4 · Retail 1 of 1"), or
  "completed".
- **S5.2** A quest you can complete now has a **Complete** button and a green border; a quest you
  completed is shaded green.
- **S5.3** The quests panel has room for 5 quests (R19.1) with 4 players and three-part
  requirements.

## S6. Your city, stats, hand and actions

- **S6.1** **Your city** shows your cards in play grouped by sector. **Combos** lists your combos,
  with the ready ones highlighted, and the panel title says how many are ready.
- **S6.2** **Your stats** shows funds, income, workforce, quality, satisfaction, product,
  distribution, bonus, build passes and influence, each with its icon and name, and your type
  counts with the bonus types first. Names appear as a tooltip when the pointer is over the icon,
  and are the icon's accessible name for screen readers.
- **S6.3** Under the stats, each project shows your progress or "completed", who has completed it,
  and when nobody has, that the first to complete it gets +2 funds (R16.6).
- **S6.4** **Your hand** shows your cards in 2 columns. Each card shows its number, name and its
  **real cost** (R3.8), not the base cost. Cards you got this turn are marked **new** (R18.10).
  Cards you cannot play are marked unplayable.
- **S6.5** Selecting a hand card opens the **big card** next to the hand, with what it costs and
  why ("Base cost 4, plus 3 for the 3 Residential tier 1 cards already in your city"), and
  **Play card** and **Close**.
- **S6.6** The action buttons are: Play card, Undo, Sell cards, Claim all (with the number ready),
  Use influence, Projects and End turn. Buttons for actions you cannot take are disabled.
  Projects and Use influence always open their pop-ups (S8.2, S8.3), where each action is disabled
  when you cannot take it (Q32).
- **S6.7** After **End turn**, the action area says you are done and which players the turn is
  waiting for.
- **S6.8** A move waiting for the server is shown faded with "Waiting for the server…". If it is
  rejected it is rolled back and an error message gives the reason (S16.3).

## S7. Draw log and chat in a game

- **S7.1** The draw log and the room chat share one panel with two tabs. The Chat tab shows the
  number of unread messages.
- **S7.2** The **draw log** lists every public draw event of M3.3, newest first, each with its turn
  number: who drew, how many, and the sector or kind and tier; turn draws, with the option chosen,
  the marketplace card taken or the sector chosen; and discard shuffles.
- **S7.3** **Chat** shows the messages since you joined, each with the sender, time and a **Mute**
  link; your own messages are highlighted; joins, leaves and similar events appear as grey lines.
  Muted players are listed with **Unmute** (A11.7). The input shows the characters used, out of
  200.
- **S7.4** When a chat limit is reached, a message over the input says which limit and when you can
  send again (A11.6).

## S8. Main-phase pop-ups

- **S8.1** **Claim all combos** lists each ready combo and its reward, and the total workforce,
  quality and satisfaction you will get, before you confirm.
- **S8.2** **Projects** shows each project with its need, what you have, and a **Complete** button
  when you can complete it; whether the first-completion bonus is still possible; and when it
  would be your 3rd project, the extra income and card.
- **S8.3** **Use influence** shows your influence and funds; all trades of R15.1 as tiles with uses
  left, "unlimited", "used", or what you are missing; and the draw actions as a table of 5 kinds by
  3 tiers with their costs, showing "None left" for kinds and tiers not in the deck or discard pile
  as you see them (R15.3).
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
- **S9.4** Messages: your time ran out in the main phase (made done; R9.10), with how many
  time-outs in a row you have had out of 3, as "This was 1 of 3" (R9.11); the game continues
  after a pause, and who gets free time (R9.13).
- **S9.5** The **end-of-game screen** has a version for each ending: end goal reached, turn limit,
  last player left (M6.8), and abandoned. It shows the winner and why the game ended, and a table
  of every player: place, result, score, end goal reached, income, funds plus hand, bonus-type
  points, and in a ranked game the rating before and after. An abandoned game shows no table.
  Buttons: Exit to lobby, Ask for a rematch (when possible) and Close.

## S10. Lobby

- **S10.1** The top bar shows the game title, **Game menu**, **My match history**, **ELO ranking**,
  and the user box with your username and rating. Logged out, it shows **Log in** and **Sign up**
  instead.
- **S10.2** **Players online** lists every player online with their badge: username, rating once
  they have played a ranked game, and status online or in a game (A7.2), with the total count.
- **S10.3** **Public rooms** lists each public room's players and free places, with **Join**, plus
  the room-code field with **Join with code**, and **Create room**.
- **S10.4** **Ranked queue** shows how many players are in it in total and for each game size
  (A8.4), how ranked games work, your rating and number of ranked games, the **game sizes** as
  three toggles (2, 3 and 4 players; A8.2), and **Join the ranked queue**. In the queue it shows
  **Leave the queue**, the game-size toggles stay changeable (A8.3), and joining rooms is
  disabled. For logged-out players, guests and unconfirmed email addresses the button is
  disabled with the reason (A8.1).
- **S10.5** **Create room** asks for public or private, and size 2, 3 or 4, with the human check.
- **S10.6** Join errors are shown under the room-code field: code not found, room full, game
  already started, rejoin wait with the time left, and busy elsewhere (M1, M2).
- **S10.7** **Match found** shows the game size and asks you to confirm within the time shown,
  without naming the other players (A8.7), and says what happens if you decline.
- **S10.8** Empty lists say so: no public rooms, only you online.
- **S10.9** A rejected lobby or room action shows the text for its reason code, in the place where
  the player acted (under the room-code field, in the dialog, or as an alert in the waiting room).
  Codes that only a broken or forged client can cause show "Something went wrong" as in S16.3.

  | Reason code | Message |
  |---|---|
  | `room_not_found` | No room has the code CODE. Check the code and try again. |
  | `room_full` | This room is full. |
  | `room_not_waiting` | The game in this room has already started. |
  | `rejoin_too_soon` | You can join this room again in M:SS. |
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
  | `no_free_room_code` | No room could be created right now. Try again. |
  | `no_answer` | The server did not answer. Try again. |

## S11. Waiting room

- **S11.1** The waiting room keeps the lobby's top bar and players online list, and shows the room
  in the middle and the room chat on the right.
- **S11.2** The room shows its code, public or private, who the owner is, **Copy room code**, **Leave
  room**, the size control (enabled only for the owner, and not below the players present), the
  players with the owner marked, the free places, and how the game starts.
- **S11.3** When the room is full, every player gets the **accept** dialog with the time left and
  the usernames of the players who have accepted (M1.10). A player who declined or ran out of time
  sees a message in the lobby with when they can rejoin.
- **S11.4** After a game, the room shows the result, the players still in it, **Ask for a
  rematch**, **Leave room**, and when the room will be deleted (M8). The rematch dialog shows the
  time left and who has accepted (M8.4).

## S12. Accounts

- **S12.1** Joining without an account asks for a username, prefilled with a generated name, with
  the human check (A1.2).
- **S12.2** **Log in** asks for username or email, and password, with links to forgotten password
  and sign up. After repeated failures it shows the human check and why (A1.13).
- **S12.3** **Sign up** asks for username (prefilled), email and password, with the human check,
  and says what is kept (A1.3). Afterwards a notice asks the player to confirm their email, with
  **Send it again**.
- **S12.4** Email links open: email confirmed, set a new password, or link expired.
- **S12.5** **Account settings** shows the username (disabled with the next allowed date during the
  7-day wait), the email address with its confirmation, a pending change, **Change email address**,
  **Log out** and **Delete account**. Guests see **Sign up** instead of email. A removed email
  address is explained, with **Add an email address** (A1.11).
- **S12.6** Warnings before: a guest logs out (cannot log back in; leaves a game in progress);
  deleting an account (with password); deleting during a game (counts as leaving).
- **S12.7** The user menu holds Account settings, My match history and Log out, and for guests
  **Sign up to keep your account** first. It is the same in the lobby, a waiting room and a game.
  Opening it, or anything in it, during a game does not pause anything (C1.3); a guest who logs
  out gets the warning of S12.6 first.

## S13. Records

- **S13.1** **Match history** lists games newest first: date, casual or ranked, result, place
  ("2nd of 4"), score, winner and winner's score, number of players and turns. Clicking a game opens
  its record; clicking a username opens that player's match history. With no games, it says so.
- **S13.2** The **game record** shows when the game started and ended, how long it took, the turns,
  the winner, the bonus types and casual or ranked, and a column per player with every value of
  A3.2. Deleted accounts show "Deleted player".
- **S13.3** The **ELO ranking** shows 50 players per page with place, username, rating and ranked
  games, page buttons, and **Jump to me** with your row highlighted. Players not in the table see
  why, and Jump to me is disabled.

## S14. Game menu, rules and card set

- **S14.1** The **game menu** lists Rules, Card set and Tutorial with one line about each. During a
  game, a room or the ranked queue, Tutorial is disabled with the reason, and Rules and Card set say
  that the clock keeps running (C1).
- **S14.2** The **rules viewer** shows the rulebook's table of contents on the left, the current
  section on the right, links to related sections, and previous and next buttons. Opened during a
  game, it leaves the top bar visible and repeats the time left.
- **S14.3** The **card set** shows cards as tiles, with filters for sector, tier and type, a name
  search, and the number of matching cards. Clicking a card opens its detail: the big card, sector
  and tier, base cost, what it gives and uses up, types including any counted twice, and every
  combo, including whether it is infinite.

## S15. Tutorial

- **S15.1** The tutorial uses the game screen without opponents, timers or chat. The top bar shows
  "Tutorial · turn N" and **Leave tutorial**.
- **S15.2** The left column shows the **tutorial text box**: "Step N of 21", the step's text from
  `tutorial.md`, the action asked for, **Continue** on text-only steps, and **Restart**. The part of
  the screen the step is about is highlighted, and every other action is disabled.
- **S15.3** Any other action shows "Not this step" with what the tutorial is waiting for (C4.4).
- **S15.4** After the last step, **Tutorial complete** offers Read the rules, Play it again and Go to
  the lobby. Leaving asks for confirmation.

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
  | `no_build_pass` | You already played a card this turn. A build pass lets you play another. |
  | `build_skipped` | You skipped build this turn, so you cannot play a card. |
  | `nothing_to_claim` | No combo is ready to claim. |
  | `trade_limit_reached` | You have used this influence action as often as allowed. |
  | `cannot_afford_trade` | You do not have enough for this trade. |
  | `skip_build_after_play` | You can only skip build before playing a card. |
  | `no_card_of_kind` | No card of that kind and tier is left in the deck or discard pile. |
  | `project_already_completed` | You already completed this project. |
  | `project_needs_not_met` | You need 8 of the stat, and no negative workforce, quality or satisfaction. |
  | `quest_not_on_table` | That quest is no longer on the table. |
  | `quest_already_completed` | You already completed this quest. |
  | `quest_needs_not_met` | You do not meet this quest's requirement yet. |
  | `nothing_to_undo` | There is nothing to undo. |
  | `cannot_undo` | That action cannot be undone, because it drew a card or came after one that did. |
  | `out_of_market` | You already had your market go this turn. |
  | `card_not_in_marketplace` | That card was just taken. |
  | `marketplace_empty` | The marketplace is empty: choose a sector. |
  | `vote_not_allowed` | Ranked games cannot be abandoned. |
  | `vote_too_soon` | Next vote possible in turn N. |
  | `vote_already_open` | A vote is already open. |
  | `no_vote_open` | There is no vote to answer. |
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
