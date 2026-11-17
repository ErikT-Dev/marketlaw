# MarketLaw client features

Status: spec, 2026-10-25.

This file defines the game menu, the rules viewer, the card set and the tutorial. How the game is
played is in `game-rules.md` (rules `R…`), rooms and connections in `multiplayer.md` (rules
`M…`), and accounts and the lobby in `accounts.md` (rules `A…`).

- Every rule has a number, such as C2.1. Scenarios and other files refer to rules by number.
- All undecided points are listed under **Open questions** directly below.
- The rules are written as final. To change one, point to its number.
- The rules only describe what the game has and does. Features the game does not have are left
  out instead of being mentioned.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

## Open questions

None yet.

## C1. Game menu

- **C1.1** The **game menu** can be opened from the lobby, from a waiting room and during a game.
- **C1.2** It holds **Rules** (C2), **Card set** (C3) and **Tutorial** (C4). Tutorial is offered
  only when the player is not waiting in a room, in the ranked queue or in a game (M2). A player
  whose game has ended, or who has left a game, is no longer in it (M2.2, M6.7): the menu offers
  them Tutorial, and starting it takes them out of the room (Q164).
- **C1.3** Opening the menu, the rules or the card set during a game does not pause anything. The
  player's clock keeps running (R9).

## C2. Rules viewer

- **C2.1** **Rules** shows the **rulebook**: `rulebook.md`, a plain-language explanation of how a
  game is played, with examples. It covers only the game rules (`game-rules.md`), not accounts,
  rooms or other multiplayer rules.
- **C2.2** The rulebook has a table of contents, and its sections link to each other.
- **C2.3** Anyone on the site can open it, logged in or not.
- **C2.4** The rulebook explains every section R1–R21 of `game-rules.md`, and says nothing that
  contradicts them. When a game rule changes, the rulebook changes with it.

## C3. Card set

- **C3.1** **Card set** shows all 240 cards of `cards.json`.
- **C3.2** The cards can be filtered by sector, tier and type, and searched by card name.
- **C3.3** Opening a card shows everything about it: name, sector, tier, base cost, stat numbers,
  types (including types it counts twice) and combos (including which are infinite).
- **C3.4** Anyone on the site can open it, logged in or not.

## C4. Tutorial

- **C4.1** The **tutorial** is a guided one-player game that teaches the first turns, up to the
  player's first income and their first completed quest. Its steps and texts are in
  `tutorial.md`.
- **C4.2** It is played on the server, in a **tutorial room** with one seat. The game rules
  (`game-rules.md`) apply, with the differences in C4.3–C4.6. The room rules of M1, and M6.8 and
  M6.9 about the last players left, do not apply to a tutorial room; it ends only as C4.6, C4.8
  and C4.10 say.
- **C4.3** The tutorial uses a fixed deck order, marketplace, quests table and random sequence, so
  every player gets the same tutorial (`tutorial.md`).
- **C4.4** At each step the player can only take the action the step asks for. Any other action
  is rejected with the reason `not_this_step` and changes nothing.
- **C4.5** The tutorial has no time limits: R9 does not apply.
- **C4.6** The tutorial ends after its last step (`tutorial.md`). It creates no game record (A3),
  does not change ratings (A10) and does not count toward the daily limits (A9).
- **C4.7** Anyone can play the tutorial. A player who is not logged in becomes a guest user first,
  as when joining a game (A1.2).
- **C4.8** The player can leave the tutorial at any time, and can start it again from the
  beginning at any time. Leaving deletes the tutorial room. After the last step the player stays
  in the tutorial, with **Tutorial complete** (S15.4), until they leave it or it is deleted
  (C4.10). Until then, opening the site brings the player back to their tutorial (Q163).
- **C4.9** Starting the tutorial counts as being in a game for M2 (one thing at a time).
- **C4.10** A tutorial room whose player has not been connected for 30 minutes is deleted.

## C5. Test rooms

- **C5.1** The owner can start a **test room** from a scenario's starting situation (plan decision
  D8). Starting one needs the site's test-room secret; without it, the site answers as if the
  address did not exist.
- **C5.2** A test room gives each seat a new guest user and a **seat link**. Opening a seat link
  signs that browser in as the seat's guest, but only after the server confirms the link belongs
  to a test-room seat; any other link is ignored with a message.
- **C5.3** If the browser already has a different account, opening a seat link first asks whether
  to switch, and warns that a guest user who is switched away from cannot log back in (A1.14).
