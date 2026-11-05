# MarketLaw accounts, records and lobby

Status: spec, 2026-10-25.

This file defines accounts, usernames, game records, match history, ELO ratings, the lobby, the
ranked queue, daily limits and chat. How the game itself is played is in `game-rules.md`
(rules `R…`). Rooms, connections, leaving and what each player can see in a game are in
`multiplayer.md` (rules `M…`).

- Every rule has a number, such as A3.2. Scenarios and other files refer to rules by number.
- All undecided points are listed under **Open questions** directly below. Each one says what
  the rules currently state and what the alternatives are.
- The rules are written as final. To change one, point to its number.
- The rules only describe what the game has and does. Features the game does not have are left
  out instead of being mentioned.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

## Open questions

1. **Email provider** (A1.3–A1.10). Currently: confirmation and password-reset emails are sent
   to any address. This needs an outside email-sending service with a secret key, which is a new
   dependency. Alternative: a different provider, or leaving email confirmation and password
   reset out until one is chosen. To be decided before accounts are built.
2. **Password hashing** (A1.5, A1.6). Currently: registered users log in with a password, which
   the server stores as a secure hash. The free plan allows about 10 ms of computing time per
   request, and a secure hash may take longer. To be measured before accounts are built; if it
   does not fit, the login method may need to change.

## A1. Accounts

- **A1.1** Every player has an **account with a unique username** (A2). There are two kinds of
  account:
  - A **guest user** is any account that has not completed the signup flow. It has a username
    but no password, and only works in the browser where it was made. A guest account that has
    not been used for 90 days is deleted, its username becomes free, and its game records show
    "Deleted player".
  - A **registered user** has completed the signup flow, and can log in from any browser.
- **A1.2** **Joining without being logged in:** a player who is not logged in is asked for a
  username when they join a game. The field is prefilled with a randomly generated descriptive
  name, for example "Busy Harbour Mayor", that is unique, not yet taken and at most 20 characters
  long, so it can be used as it is. The player can change it to any other username that is not
  taken. This creates a guest user, which needs the human check (A1.12).
- **A1.3** **Signing up:** a guest user can complete the signup flow at any time, during a game or
  afterwards. Signup asks for an **email address** and a **password**, and they can keep their
  username or change it; a change made during signup does not count toward the limit on changing
  usernames (A2.4). Signup needs the human check. If the address is already confirmed on another
  account, signup looks exactly the same as with a free address; only the email sent to that
  address says it is already in use. Their account becomes a registered user, keeping everything
  they have done as a guest, including their seat in a game in progress.
- **A1.4** **Email verification:** after signup the player is sent a link to confirm their email
  address. Until they confirm it they can play and log in as normal, but cannot reset their
  password.
- **A1.5** **Logging in:** a registered user logs in with their username or email address, plus
  their password.
- **A1.6** **Passwords:** a password is 8 to 64 characters.
- **A1.7** **Forgotten password:** a registered user with a confirmed email address can ask for a
  reset link, which is sent to that address. The request needs the human check.
- **A1.8** **Use of email addresses:** an email address is used only for confirming it and for
  password resets. Email addresses are hidden information: never shown to other players.
- **A1.9** **Email limits:** at most 3 emails per day are sent for each account, and at most 3 per
  day to each address, counting confirmation, email-change and reset emails together.
- **A1.10** **Changing email address:** a registered user can change their email address. The new
  address must be confirmed; until it is, the old address stays on the account. The change needs
  the human check. A registered user whose address was removed (A1.11) can add a new one the same
  way.
- **A1.11** **One account per email address:** an unconfirmed email address reserves nothing. The
  first account to confirm an address keeps it, and the address is removed from any other account
  that entered it. Two addresses count as the same if they differ only in capital letters or in a
  part starting with "+" just before the "@" (`name+1@example.com` is the same as
  `name@example.com`). `googlemail.com` counts as `gmail.com`, and for those addresses dots
  before the "@" are also ignored (`j.ohn@googlemail.com` is the same as `john@gmail.com`).
- **A1.12** **Human check:** a check that the player is a person, not a script (Cloudflare
  Turnstile), is shown when a guest user is created, when a room is created (M1.2), on signup,
  email changes and password-reset requests, and after failed logins (A1.13).
- **A1.13** **Failed logins:** after 3 failed login attempts on an account within 15 minutes,
  every further login attempt on that account in the next 15 minutes needs the human check. An
  account is never locked.
- **A1.14** **Staying logged in:** a login lasts until the player has not used the site for
  90 days in that browser, or until the player logs out. The last use is noted at most once a
  day, so a login can last up to one day longer than 90 days without use, never shorter. Every player can log out. A guest user
  who logs out cannot log back in, and is warned of this first. A guest user who logs out during
  a game leaves that game (M6).
- **A1.15** **Deleting an account:** a registered user can delete their account. Their email
  address and password are removed, their username becomes free, and their game records show
  "Deleted player". Deleting an account during a game counts as leaving it (M6).

## A2. Usernames

- **A2.1** A username is 3 to 20 characters: the letters A–Z and a–z, digits, spaces, hyphens and
  underscores. It cannot start or end with a space or contain two spaces in a row.
- **A2.2** Uniqueness ignores capital letters ("Mayor" and "mayor" are the same name).
- **A2.3** "Deleted player" is reserved and cannot be used.
- **A2.4** **Changing username:** any player, guest or registered, can change their username to
  another username that is not taken, at most once every 7 days.

## A3. Game records

- **A3.1** A **game record** is saved when:
  - a game **finishes**, because a player reached the end goal or the turn limit was reached
    (R21), or
  - a game ends because only one player is left (M6.8). That player's result is **won**.
- **A3.2** A game record is kept for good, separately from the room. It holds:
  - when the game started and ended, and how long it lasted
  - the number of turns played: the turn number of the last turn
  - the winner
  - the 2 bonus types of that game
  - whether it was a **ranked** game (A8)
  - for every player who took part:
    - their username
    - in a ranked game, their ELO rating before the game and how much it changed (A10)
    - their result: **won**, **lost** or **left** (they left the game before it ended)
    - their place among all players who took part (A3.4)
    - their score, and whether they reached the end goal
    - their final income, funds plus cards in hand, workforce, quality, satisfaction, product,
      distribution and influence
    - their bonus-type points
    - their completed projects and how many quests they completed
    - the total workforce, quality and satisfaction they gained from combos
    - their type counts
- **A3.3** For a player who left, the record holds their values at the moment they left, and their
  score is the score formula (R21.4) applied to those values, using the turn number at the moment
  they left.
- **A3.4** **Places:** players who stayed are ranked by score (R21.8, R21.9), and players who left
  come after them, the one who left first last.
- **A3.5** Usernames in game records always show the player's current username, so a username
  change updates every record.

## A4. Match history

- **A4.1** Every player has a **match history**: a list of all their games that have a game
  record, newest first, as a concise overview. Each game in the list shows:
  - the date
  - the result (won, lost or left) and their place, for example "2nd of 3"
  - their score
  - the winner and the winner's score
  - the number of players and the number of turns
- **A4.2** Opening a game from the list shows the full game record (A3) for every player in it.
- **A4.3** A guest user's games are kept on their account and stay with it when they sign up
  (A1.3).

## A5. ELO ranking table

- **A5.1** The **ELO ranking table** lists every registered user who has played at least 1 ranked
  game, by ELO rating, highest first (A10).
- **A5.2** Players with the same rating are ordered by more ranked games played first, then by
  username in alphabetical order.
- **A5.3** Each entry shows the player's place in the table, their username, their ELO rating and
  the number of ranked games they have played.
- **A5.4** It is shown 50 players per page, and every player can jump to their own position.

## A6. Who can see what

- **A6.1** Every player can see every player's match history, and every game record opened from
  it. Clicking a username anywhere on the site opens that player's match history. A game record
  includes every player in that game.
- **A6.2** Every player can see the ELO ranking table.
- **A6.3** **Hidden information outside a game:** email addresses (never shown), who is in the
  ranked queue (A8.4), and who you are matched with while confirming a ranked match (A8.7).
- **A6.4** What each player can see inside a game is in M3.

## A7. Players online

- **A7.1** Anyone on the site, logged in or not, can see the list of **players online**: every
  logged-in player, guest or registered, who currently has the site open.
- **A7.2** For each player the list shows their username, their ELO rating (A10) once they have
  played at least 1 ranked game, and their status: **online** or **in a game**.
- **A7.3** The number of players in the ranked queue is shown separately (A8.4).

## A8. Ranked queue

- **A8.1** Any registered user with a **confirmed email address** (A1.4) can join the **ranked
  queue**.
- **A8.2** **Game sizes:** when joining, a player chooses which game sizes they will play: **2, 3
  and/or 4 players**. At least one must be chosen. By default only **3 players** is chosen. The
  site remembers a player's last choice in that browser and offers it the next time.
- **A8.3** A player in the queue can change their game sizes at any time, without losing their
  place in the queue. At least one must stay chosen.
- **A8.4** Everyone on the site can see how many players are in the ranked queue right now, in
  total and for each game size; a player who chose several sizes is counted for each of them.
  Who is in the queue is not shown; each player sees only whether they themselves are in it.
- **A8.5** **Matching:** a match is looked for every time the queue changes: a player joins,
  changes their game sizes, or goes back to the queue after a match that did not start (A8.9),
  and at 00:00 UTC. No match is made while the site's daily game limit is reached (A9.4).
  1. The players are taken in queue order, the one who has waited longest first.
  2. For that player, their chosen game sizes are tried from largest to smallest. A size works
     when at least that many players in the queue, counting this player, chose it.
  3. The first size that works makes a **match**: this player and the players who come first
     in queue order among the others who chose that size, as many as the size needs. They leave
     the queue.
  4. If no size works for this player, the next player in queue order is tried.
  5. Steps 1 to 4 are repeated until no match can be made.
- **A8.6** **Examples:**
  - Ann (2) has waited longest, then Bea (3) and Cat (3). Dan joins with 2 and 3. Ann is tried
    first, and size 2 works with Dan: Ann and Dan play a 2-player game. Bea and Cat keep waiting.
  - Ann (2 and 3) and Bea (3) are waiting. Cat joins with 2 and 3. Ann is tried first; size 3
    works before size 2: Ann, Bea and Cat play a 3-player game. Had Cat chosen only 2, Ann and Cat
    would have played a 2-player game.
- **A8.7** **Confirming the match:** each matched player is asked to confirm that they will play,
  and has 20 seconds to do so. While confirming, a player sees that a match was found and its
  game size, but not who the other players are.
- **A8.8** If every matched player confirms, the game starts automatically, in a new room made
  for it.
- **A8.9** If any player does not confirm in time, or declines, the game does not start. Players
  who did not confirm leave the queue, and can join it again after 2 minutes. Players who
  confirmed go back to the queue, at the front, in their earlier order, with their game sizes.
- **A8.10** A player can leave the queue at any time before their game starts. A player whose
  connection has been closed for 10 seconds while in the queue leaves it.
- **A8.11** Games started from the ranked queue are **ranked**: they change ELO ratings (A10).
  Ranked games cannot be abandoned by vote (M7.1).

## A9. Daily limits

- **A9.1** Days run from 00:00 to 00:00 UTC.
- **A9.2** **Actions per player:** each player can take at most **2,000 accepted game actions per
  day**, across all games. Market goes and ending the turn count as game actions. A player's actions in a game are added to their daily count when that
  game ends or they leave it. A player who has reached the limit cannot join a room, the ranked
  queue or a new game until the next day. Only moves the player makes count: time-outs, and a game
  pausing or resuming, do not.
- **A9.3** **Game starts per player:** each player can start at most **10 games per day**,
  counting every game they take part in from the start. It is checked when they join a room or
  the ranked queue, and again when a game starts. Creating a room counts as joining it, for A9.2
  and A9.3. When a game cannot start because a player in it has reached A9.2 or A9.3, the asking
  (M1.10) ends at once, that player is removed from the room without a rejoin wait and told why,
  and everyone else stays and keeps waiting.
- **A9.4** **Games per day:** at most **50 games can start per day** on the whole site. Once that
  many have started, players who try to start a game are told "Daily game limit reached, try
  again after 00:00 UTC". Games already in progress are not affected. In a room, the asking
  (M1.10) ends at once, everyone stays and keeps waiting and is told, and the room asks again the
  next time it becomes full. The ranked queue makes no matches until 00:00 UTC; players can join
  it, stay in it and leave it as normal, and everyone in it sees the same message.
- **A9.5** The tutorial does not count toward A9.2–A9.4 (C4.6).
- **A9.6** **Site-wide caps:** at most **100 tutorials can start per day** and at most **2,000 chat
  messages can be sent per day** on the whole site. Once a cap is reached, players are told
  "Daily limit reached, try again after 00:00 UTC"; tutorials and chats already going on are not
  ended, but no more tutorials start and no more messages are sent until the next day.

## A10. ELO rating

- **A10.1** Every player has an **ELO rating**, a number that shows how strong they are compared
  to other players. Every player starts at **1000**. Only ranked games change it.
- **A10.2** **Results:** a ranked game counts as one result between every pair of players in it,
  based on their final places (R21.8, A3.4). In each pair, the player with the better place
  **beats** the other: result 1 for the better place, 0 for the worse place. So 1st place beats
  2nd and 3rd, and 2nd place beats 3rd.
- **A10.3** **Rating change for one pair.** With *A* and *B* their ratings before the game:
  - A's expected result against B = 1 / (1 + 10^((B − A) / 400)), a number between 0 and 1. A
    rating difference of more than 400 is counted as 400.
  - A's change = *k* × (A's result − A's expected result).
- **A10.4** **k (how fast a rating moves),** per opponent, starts from this table:

  | Player | *k* |
  |---|---|
  | Fewer than 30 ranked games played | 20 |
  | 30 or more ranked games played | 10 |
  | Has ever reached a rating of 2400 | 5 |

  If more than one row applies, the lowest *k* is used. That *k* is then multiplied by
  2 ÷ (number of players in the game − 1), counting players who left: ×2 in a 2-player game, ×1
  in a 3-player game and ×⅔ in a 4-player game. This keeps a win against equal opponents worth
  about the same in every game size. Each player uses their own *k*, so the two players in a
  pair can gain and lose different amounts.
- **A10.5** "Ranked games played" counts every ranked game that changed ratings: finished ranked
  games, and ranked games that ended because only one player was left. It is counted before the
  current game.
- **A10.6** A player's total change is the sum over all their opponents, first rounded to 6 decimal
  places, then rounded to the nearest whole number. A total that ends in exactly .5 is rounded
  away from zero: +2.5 becomes +3, and −2.5 becomes −3.
- **A10.7** All ratings are updated at once, from the ratings before the game.
- **A10.8** **Left the game:** a player who left is placed below every player who stayed. If two
  players left, the one who left first is placed lower.
- **A10.9** **Abandoned games:** ratings stay the same (R9.14, M6.9).
- **A10.10** **Last player left:** the remaining player is 1st.
- **A10.11** **Example:** three new players, all at 1000 (*k* = 20). Every expected result is
  0.5.
  - 1st place: +10 against 2nd and +10 against 3rd, +20 in total.
  - 2nd place: −10 against 1st and +10 against 3rd, 0 in total.
  - 3rd place: −10 against 1st and −10 against 2nd, −20 in total.
- **A10.12** **Example, other game sizes:** new players, all at 1000.
  - 2 players (*k* = 40): 1st +20, 2nd −20.
  - 4 players (*k* = 40/3, so ±6.666667 per opponent): 1st +20, 2nd +6.666667 → +7,
    3rd −6.666667 → −7, 4th −20.

## A11. Chat

- **A11.1** Every room has a **room chat**: one conversation shared by all players in the room,
  while it is waiting for players, during the game and after the game ends.
- **A11.2** Every player in the room can send messages and read every message sent in it since
  they joined. Players who left the room take no further part in its chat.
- **A11.3** All messages in a room are seen by every player in that room, except players who
  muted the sender.
- **A11.4** When a message arrives, every other player in the room gets a notification.
- **A11.5** **Message format:** a message is one line of plain text, 1 to 200 characters, counted
  as the player sees them (an emoji counts as 1), and at most 800 bytes. Line breaks are replaced
  by spaces. Spaces at the start and end are removed, and an empty message cannot be sent.
- **A11.6** **Limits per player:** at most 1 message every 2 seconds, and at most **100 messages
  in one room**. A player who reaches a limit is told which one, and when they can send again.
- **A11.7** **Mute:** any player can mute another player in the room. They stop seeing that
  player's messages and notifications; nobody else is affected, and the muted player is not told.
  A mute lasts until the player unmutes them or the room is deleted. After unmuting, they see the
  messages that player sends from then on.
- **A11.8** **Saving:** every message is saved before it is shown to other players.
- **A11.9** A room's chat history is deleted together with the room (M8.2).
