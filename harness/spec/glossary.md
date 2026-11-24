# MarketLaw glossary

Status: spec, 2026-10-25.

Exact meanings of the terms used in the spec files. Every file uses these terms in exactly these
meanings. The rule where each term is defined is given in brackets.

## Game

| Term | Meaning |
|---|---|
| Action | Anything a player does in the main phase that the server accepts: playing a card, selling, claim all, an influence action, completing a project or quest, undo (R5.1). Each counts toward the action limit of 50 per turn (R5.3); ending the turn does not. For the daily limit (A9.2), market goes and ending the turn count too. |
| Bonus types | The 2 different types picked at random for a game, which score points at the end (R21.6). |
| Build pass | Needed to play a card: every card played uses one (R6.1). Every player gets 1 at the start of every turn, keeps unused ones, and can buy more with influence actions (R6.3, R15). |
| Card | One of the 240 unique cards in `cards.json` (R3). |
| Card-name combo | A combo that needs a named card in the player's own city (R12.3). |
| City | All the cards a player has played. Same as "cards in play" (R1.2). |
| Claim all | The action that claims every combo that is ready (R12.6). |
| Combo | A bonus printed on a card that gives workforce, quality or satisfaction once its need is met (R12). |
| Deck | The one shared, ordered pile of cards that all players draw from (R17.1, R17.2). |
| Detailed summary table | The board that opens when you click another player's quick summary table, with everything about them (S3.2). |
| Discard pile | The shared pile of sold cards and cards removed from the marketplace (R17.1). |
| Distribution | A stat made by Service cards; with product, it becomes income (R13). |
| Done | A player who has ended their turn, or was made done, in the current main phase (R8.1). |
| Draw | Taking a card into a hand from the deck, found by the steps of R17.4. |
| Draw action | An influence action that draws a card of a chosen kind and tier (R15.2). |
| End goal | Income of at least 20 and all 3 projects completed (R1.3). |
| Extra turn | The one more turn a quest stays on the table after the turn it is first completed in (R19.6). |
| First completion | The extra +1 influence for every player who completes a quest in the turn it is first completed (R19.10). |
| First player | The player who goes first in a turn (R4.4). |
| Free time | The first 75 seconds of a player's main phase (165 in turn 1) and the first 5 seconds of a market go, which do not use the time bank; unused main-phase free time goes into the bank (R9.4, R9.15). |
| Game log | The list of public draws, and, after each main phase, what each player did in it (M3.3, M3.7). |
| Funds | Money; a stat that pays for cards, kept in tenths of a fund (R2.1, R2.5). |
| Gain a type | A quest reward that adds 1 to a type count without adding a card (R20.6). |
| Hand | The cards a player holds and has not played. Hidden from other players (M3.2). |
| Holding pile | Where cards sold during a main phase, and the hand of a player who leaves during it, wait until the main phase ends (R17.7). |
| Income | A stat; the funds a player gets at the end of every turn. Also the automatic exchange of 1 product and 1 distribution for +1 income and a card (R13). |
| Infinite combo | A type-count combo that can be claimed again at every multiple of its count (R12.4). |
| Influence | A stat gained at 1 per turn and spent on influence actions (R15). |
| Influence action | One of the optional trades in R15.1. |
| Kind | One of Residential, Industry, Service, Public quality card, Public satisfaction card (R3.7). |
| Kind place | One of the 5 marketplace places that always holds a card of its kind (R18.2). |
| Main phase | The part of a turn in which all players act at the same time (R5). Each player's own main phase starts when their market go ends (R18.15). |
| Market go | A player's one go in the market phase each turn, in which they take their turn draw (R18.6). |
| Market phase | The part of a turn, from turn 2, in which every player takes one market go, one at a time (R18.6). |
| Marketplace | The shared display of 8 face-up cards (R18.1). |
| New | A mark on every card that came into a player's hand this turn, in the market phase or the main phase (R18.10). |
| Open place | One of the 3 marketplace places whose sector is picked at random each time it is filled (R18.4). |
| Paused | A game whose clocks are stopped because a deadline came while no player was connected (R9.12). |
| Place | A player's final position in a game (R21.8, A3.4). |
| Player icon | A circle with the picture a player chose, in their picture colour on their background colour (A2.5, S1.8). |
| Player order | The order of seats in a turn, starting from the first player (R4.5). |
| Product | A stat made by Industry cards; with distribution, it becomes income (R13). |
| Project | One of the 3 goals each player can complete once: 8 quality, 8 satisfaction or 8 workforce (R16). |
| Public quality card / satisfaction card | A Public card with more quality than satisfaction / all other Public cards (R3.6). |
| Quality, satisfaction, workforce | The three stats that cards make and use up; all must be 0 or more for income and projects (R2.3). |
| Quest | A shared task on the quests table that any player can complete once for a reward (R19). |
| Quest list | All quests of `quests.txt` that can be placed on the table (R20.7). |
| Quests table | The shared places, 4 and from turn 20 5, that hold quests (R19.1). |
| Quick summary table | The always visible card for each other player on the game screen (S3.1). |
| Real cost | A card's base cost plus 1 for each card of the same sector and tier already in the player's city (R3.8). |
| Redraw | Putting the starting hand back and getting a new one, up to 3 times in turn 1 before the first action (R17.12). |
| Score | The number computed for each player at the end of the game (R21.4). |
| Seat | A player's fixed number, 1 to N, given at random when the game starts (R4.3). |
| Sector | Residential, Industry, Service or Public (R3.3). |
| Sell | The action of selling cards from the hand for 1 fund each (R5.1). |
| Stats | Funds, income, influence, workforce, quality, satisfaction, product and distribution (R2.1). |
| Stats gain | The tenths of a fund the stats add to funds at the end of every turn (R14). |
| Support | Funds at the start of a turn for a player behind the others in total worth gained: 1 for every full 10 (R11.5). |
| Tier | 1, 2 or 3; higher tiers are stronger and cost more (R3.3). |
| Tier by turn | The rule that picks a random tier, with higher tiers more likely in later turns (R17.10). |
| Time bank | A player's 15 minutes for the whole game, used after the free time (R9.3). |
| Time-out | A player's time running out (R9.10). In the main phase the player is then out of time: they can keep playing until every other player is done or out of time. |
| Total worth gained (F) | All funds a player received, except from selling, plus every card they gained (R2.4). |
| Turn | One round of start of turn, market phase, main phase and end of turn (R4.1). |
| Turn draw | What a player does on their market go: option A or option B (R18.8). |
| Turn number | The number of the current turn, starting at 1 (R2.2). |
| Type | A label on a card, such as Farm or Retail; there are 33 (R3.3). |
| Type count | How many of a type a player has, from their cards in play and from quests (R12.1). |
| Undo | Taking back the player's latest undoable main-phase action (R7). |

## Rooms and connections

| Term | Meaning |
|---|---|
| Abandoned | A game that ended with no winner, by vote, by a 24-hour pause, or because no player is left (M7, R9.14, M6.9). |
| Away | A player in a game who is not connected (M5.2). |
| Casual game | A game started from a room or a rematch; it does not change ratings (M1.13, M8.5). |
| Leave the game | Stop playing a game for good (M6). |
| Public information | Everything about a game that every player can see (M3.5). |
| Hidden information | What a player cannot see: other players' hands, and other players' main-phase actions until the phase ends (M3.2); outside a game, see A6.3. |
| Rematch | A new casual game in the same room after a game ends (M8.4). |
| Replay record | The seed and every action of a game, enough to replay it exactly (M4.1). |
| Room | Where a game is played; it has 2 to 4 players (M1.1). |
| Room code | The 6-character code for joining a room (M1.5). |
| Room owner | The player who created the room, or who took over when the owner left (M1.3). |
| Waiting room | A room whose game has not started yet (M1.4). |

## Accounts and lobby

| Term | Meaning |
|---|---|
| ELO rating | A player's strength number, changed only by ranked games (A10). |
| ELO ranking table | The list of registered users who played a ranked game, by rating (A5). |
| Game record | The saved result of a game (A3). |
| Game sizes | The numbers of players (2, 3 and/or 4) a player in the ranked queue is willing to play with (A8.2). |
| Guest user | An account without a completed signup; no password, one browser (A1.1). |
| Human check | Cloudflare Turnstile's check that the player is a person (A1.12). |
| Match history | A player's list of games with a game record (A4). |
| Players online | The list of logged-in players who have the site open (A7). |
| Ranked game | A 2-, 3- or 4-player game started from the ranked queue; it changes ratings (A8.11). |
| Ranked queue | Where registered users wait to be matched into a ranked game (A8). |
| Registered user | An account that completed signup with an email address and password (A1.1). |
| Username | A player's unique public name (A2). |

## Client

| Term | Meaning |
|---|---|
| Card set | The viewer of all 240 cards (C3). |
| Game menu | The menu with Rules, Card set and Tutorial (C1). |
| Rulebook | The plain-language explanation of the game rules, `rulebook.md` (C2.1). |
| Tutorial | The guided one-player game of `tutorial.md` (C4). |
| Tutorial room | The one-seat room the tutorial is played in (C4.2). |
