# MarketLaw multiplayer rules

Status: spec, 2026-10-25.

This file defines rooms, connections, leaving, abandoning and what each player can see. How the
game itself is played is in `game-rules.md` (rules `R…`). Accounts, records, ratings, the lobby,
the ranked queue and chat are in `accounts.md` (rules `A…`).

- Every rule has a number, such as M3.2. Scenarios and other files refer to rules by number.
- All undecided points are listed under **Open questions** directly below.
- The rules are written as final. To change one, point to its number.
- The rules only describe what the game has and does. Features the game does not have are left
  out instead of being mentioned.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

Defined elsewhere: turn order and seats (R4.3–R4.5), time limits, the time bank and pausing (R9),
and the game's end (R21).

## Open questions

None yet.

## M1. Game rooms

- **M1.1** A game is played in a **game room**. A room has **2 to 4 players**.
- **M1.2** Any player can **create a game room**. They choose whether it is **public** or
  **private**, and its size: **2, 3 or 4 players**. Creating a room needs the human check (A1.12).
- **M1.3** The player who created the room is its **owner**. If the owner leaves, the player who
  joined next becomes the owner.
- **M1.4** While the room is waiting, only the owner can change its size to 2, 3 or 4, as long as
  the new size is at least the number of players already in the room.
- **M1.5** Every room has a **room code** of 6 characters, made of the capital letters A–Z and
  digits, leaving out look-alike characters (O, 0, I, 1 and L). No two rooms that exist at the
  same time have the same code.
- **M1.6** Any player can join a room with its code while it is waiting for players and not full.
- **M1.7** **Public rooms** are also listed in the lobby, where anyone can see them and join with
  one click. The list shows the players in each room and how many places are free.
- **M1.8** **Private rooms** can only be joined with the room code.
- **M1.9** While waiting, any player can leave the room. A room with no players left is closed.
- **M1.10** **Starting:** as soon as the room is full, every player in it is asked to accept the
  game, and has 20 seconds to do so. Every player in the room sees the usernames of the players
  who have accepted so far. If all accept, the game starts automatically.
- **M1.11** If anyone declines, or does not accept within the 20 seconds, the game does not
  start and the asking ends at once. Players who declined or let their 20 seconds run out are
  removed from the room; they can join it again after 2 minutes, while there is a free place.
  Everyone else, whether they had accepted or not yet answered, stays in the room and keeps
  waiting. Asking is part of waiting: a player who leaves (M1.9), or whose place is freed by a
  larger size (M1.4) or by M1.12, also ends the asking at once, without a rejoin wait.
- **M1.12** A player whose connection to a waiting room has been closed for 10 seconds is removed
  from it. A page refresh within 10 seconds keeps their place.
- **M1.13** Games started from a room are **casual**. Only ranked games (A8) change ELO ratings
  (A10).

## M2. One thing at a time

- **M2.1** A player can be in only one of these at a time: waiting in a room, in the ranked queue
  (A8), or in a game.
- **M2.2** Once a game has ended, the players in its room are free to join the ranked queue or
  another room; doing so takes them out of the finished room.

## M3. What each player can see

- **M3.1** Players affect each other through the shared deck and discard pile, the marketplace,
  the quests table and the first-completion project rewards.
- **M3.2** **Hidden information in a game:** two things are hidden:
  - which cards are in another player's hand. You see your own hand; of other players you only
    see how many cards they hold.
  - during the main phase, what other players have done in it so far. It is revealed when the
    main phase ends (R5.4).
- **M3.3** **What is public about cards going into a hand:**
  - for every draw: who drew, how many cards, and the sector or kind and tier asked for
    (main-phase draws are revealed when the main phase ends)
  - when discard cards are shuffled into the deck: which sector or kind and tier, and how many
    cards (R17.8)
  - which marketplace card a player took. That card is then known to be in their hand until they
    play or sell it.
  - the option and sector a player chose for their turn draw (R18.8)
- **M3.4** Which card a player got from the deck is hidden. Because of the public information in
  M3.3, the sectors and tiers of the cards in every hand can largely be worked out, and a fallback
  draw (R17.4) can show that another player drew the last cards of a tier during the main phase.
  Both are part of the game; what stays hidden is which exact cards are in a hand.
- **M3.5** **Everything else is public** and available to every player, including each player's
  stats, cards in play, type counts, combos, influence action uses, build passes, completed
  projects and quests, time bank, whether they are away (M5.2) and whether they are done with the
  turn; the marketplace, the quests table, the bonus types, the discard pile and the number of
  cards left in the deck (during the main phase, as described in R5.5). How this is shown on
  screen is described in `screens.md`.
- **M3.6** Hidden information outside a game is listed in A6.

## M4. Replays

- **M4.1** The record needed to replay a game exactly (its random seed and every action,
  including every hand) is available only to the people who run the game.
- **M4.2** They can export it from any room at any time, including a game in progress.
- **M4.3** After a game ends, the record is kept for 30 days, separately from the room.

## M5. Connections

- **M5.1** **One tab at a time:** a player can have a game open in only one browser tab at a time.
  Opening it in a new tab moves the game there; the old tab shows that the game was opened
  somewhere else.
- **M5.2** **Away:** a player who is not connected is **away**, and every player can see this.
- **M5.3** While away, a player keeps their seat and their time runs as normal (R9): in the market
  phase their time runs out as described in R18.11, and in the main phase they are made done when
  their time runs out (R9.10).
- **M5.4** A player whose time runs out in the main phase in 3 turns in a row is treated as having
  left the game (R9.11, M6).
- **M5.5** **Everyone away:** the game is paused, as described in R9.12–R9.14.

## M6. Leaving the game

- **M6.1** Any player can leave the game at any time. They cannot come back and cannot win. The
  game goes on without them.
- **M6.2** A player who leaves is done straight away, including in the current turn, and in every
  following turn. In a market phase in progress they take no more goes.
- **M6.3** Their main-phase actions in the current turn are kept, and are revealed when the main
  phase ends.
- **M6.4** Their city stays. They get no end-of-turn steps (R10.1).
- **M6.5** Their hand goes to the discard pile; during a main phase it goes to the holding pile
  first (R17.7). Their game record counts their hand before it is discarded (A3).
- **M6.6** In player order they are skipped (R4.5).
- **M6.7** They stay in the room and its chat until they leave the room, and can join the ranked
  queue or another room straight away (M2). Instead of the game, they see that they left it, the
  room chat and an exit to the lobby, which takes them out of the room. If they are still in the
  room when the game ends, they see its result.
- **M6.8** If only one player is left, the game ends immediately and that player wins.
- **M6.9** Players who leave at the same moment all leave before M6.8 is checked; among
  themselves they leave in player order (R4.5), which sets their places (A3.4). If no player is
  left, the game is abandoned: it ends with no winner, and ratings stay the same.
- **M6.10** These also count as leaving the game: deleting your account during a game (A1.15), a
  guest user logging out during a game (A1.14), and running out of time in the main phase in
  3 turns in a row (M5.4).

## M7. Abandon by vote

- **M7.1** In a game that is not ranked, any player can call a vote to abandon the game.
- **M7.2** A game can have at most one vote every 5 turns, and only one vote open at a time.
- **M7.3** Every other player still in the game, connected or away, has 1 minute to answer; a
  player who does not answer counts as voting no. All timers keep running during a vote.
- **M7.4** If all of them vote yes, the game is abandoned: it ends with no winner. Otherwise it
  goes on.
- **M7.5** While a vote is open, every player still in the game sees how many players have
  answered so far, out of how many. Who has answered, and how, is not shown.

## M8. After the game

- **M8.1** After a game ends, players can stay in its room and keep chatting (A11).
- **M8.2** The room is deleted when the last player leaves it, or 24 hours after the game ended,
  whichever comes first. A room's chat history is deleted with it.
- **M8.3** The game record of a game (A3) is kept when the room is deleted.
- **M8.4** **Rematch:** after a game ends, any player still in its room can ask for a rematch,
  as long as at least 2 players are in the room. Every player in the room is then asked to
  accept, and has 20 seconds to do so. Every player in the room sees the usernames of the
  players who have accepted so far.
- **M8.5** If all accept, a new casual game (M1.13) starts in the same room with those players,
  as a new game from setup. A rematch of a ranked game is casual. If anyone does not accept in
  time, or declines, no game starts and the room stays as it was.
- **M8.6** When a rematch starts, the 24-hour deletion time of M8.2 no longer applies; it starts
  again when the new game ends. The chat history stays.

## M9. Messages

- **M9.1** Every message from a client carries a protocol version. A message with an older or
  unknown version is rejected with `wrong_protocol_version`.
- **M9.2** Every message carries the player's session token (`rules/multiplayer.md`, Identity). A
  message with an unknown or forged token is rejected with `invalid_token`. A room code is never
  proof of identity.
- **M9.3** Every action carries an action id chosen by the client. An action with an id already
  used by that player gets the original result again and changes nothing more.
- **M9.4** Every action carries the player's state version it was based on. A player's state
  version changes only with their own accepted actions and with changes they are allowed to see
  (phase changes and reveals), never with another player's hidden actions. An action based on an
  older version is rejected with `stale_state`.
- **M9.5** A message that cannot be read, or lacks a field, is rejected with `malformed_message`;
  an unknown action with `unknown_action`.
- **M9.6** A connection that has sent 30 rejected messages within one minute, for any reason, is
  closed. The player can connect again.
