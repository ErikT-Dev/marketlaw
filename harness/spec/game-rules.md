# MarketLaw game rules

Status: spec, 2026-10-25.

This file defines how a game of MarketLaw is played. Rooms, connections, leaving and what each
player can see are in `multiplayer.md` (rules `M…`). Accounts, records, ratings, the lobby and
chat are in `accounts.md` (rules `A…`). The card data is `cards.json`.

- Every rule has a number, such as R6.2. Scenarios and other files refer to rules by number.
- All undecided points are listed under **Open questions** directly below. Each one says what
  the rules currently state and what the alternatives are.
- The rules are written as final. To change one, point to its number.
- The rules only describe what the game has and does. Features the game does not have are left
  out instead of being mentioned.
- Every rule applies to every player in a game unless it says otherwise.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

## Open questions

1. **Game length** (R9, R21). Currently: the time bank (15 minutes) and the turn limit
   (40 turns) assume a game of about 25 turns. A first simulation suggests reaching the end goal
   (then income 22 and 3 projects; now income 20, R1.3) may take noticeably longer. To be
   checked with the game simulator
   once the engine exists; the end goal, time bank or turn limit may need adjusting then. The
   quest thresholds in R20 were set from the same simulation and should be rechecked with it too.
   Since marketplace cards are free (R18.8), funds are spent only on playing cards, build passes
   and influence; the simulation should also check whether funds pile up and whether the
   starting funds, income or real costs need adjusting.
   Simulator, phase 15: random legal-bot games last about 39 turns and reach the end goal in
   about 62% of games; average funds are about 12 at turn 20, 23 at turn 30 and 67 to 91 at
   turn 40. No change until games by real players can be measured (Q48).

## R1. Goal

- **R1.1** Each player builds their own city by playing cards. When the game ends, the player
  with the highest score wins (R21).
- **R1.2** Your **city** is all the cards you have played. "In your city" and "your cards in
  play" mean the same thing throughout these rules.
- **R1.3** A player reaches the **end goal** when they have **income of at least 20** and all
  **3 projects completed** (R16). The game ends after the main phase of the turn in which a
  player reaches it (R21.1).
- **R1.4** All players play the **same turn at the same time** (R4). A main phase ends once every
  player is done or out of time (R8, R9), so a quicker player may wait for the others.

## R2. Stats

- **R2.1** Each player has their own stats, starting at these values:

  | Stat | Starts at | What it does |
  |---|---|---|
  | Funds | 7 | Money. Pays for cards. |
  | Income | 3 | Funds gained at the end of every turn. 20 is part of the end goal. |
  | Influence | 0 | +1 every turn. Spent on influence actions (R15). |
  | Workforce | 0 | Made by Residential cards, used up by the other sectors. |
  | Quality | 0 | Made by Public cards, used up by the other sectors. |
  | Satisfaction | 0 | Made by Public cards, used up by the other sectors. |
  | Product | 0 | Made by Industry cards. Turned into income (R13). |
  | Distribution | 0 | Made by Service cards. Turned into income (R13). |

- **R2.2** The **turn number** starts at 1 and goes up by 1 at the end of every turn (R10.3). It
  is the same for all players.
- **R2.3** Workforce, quality and satisfaction can go below zero. While any of them is negative
  you cannot gain income (R13) or complete projects (R16).
- **R2.4** **Total worth gained (F):** each player also has a running count of everything of
  worth they have received in the game, kept in tenths of a fund like funds (R2.5). At every
  moment it equals exactly the sum of:
  - every fund they have received, however they got it: the starting funds, income, a positive
    stats gain (R14), Support (R11.5), and funds from projects, quests, influence actions and any
    other source; not funds from selling cards
  - 1 fund for every card they have gained: the starting hand, every card drawn, and every card
    taken from the marketplace, which counts as drawn

  It starts at 14 (7 funds and 7 cards). Selling a card does not change it: the card was already
  counted as 1 and its fund replaces it. Playing a card, a negative stats gain and a redraw of
  the starting hand (R17.12) do not change it either, so it only goes up; undoing an action takes
  back exactly what that action added (R7.1). Every player sees every other player's F as at the
  start of that player's own main phase, like their other stats (R5.4). It is used for Support
  (R11.5) and to break equal scores (R21.9).
- **R2.5** **Funds in tenths:** funds and income are kept in tenths of a fund, and so is every
  amount of funds the game gives or takes. These rules write amounts in whole funds (7 funds, a
  real cost of 5, +2 funds), each 10 tenths; only the stats gain (R14) gives amounts that are not
  whole. Income always stays a whole number of funds. Screens show funds, income and total worth
  gained with one decimal (5.3, 7.0).

## R3. Cards

- **R3.1** There are 240 cards: 4 sectors × 3 tiers × 20 cards. Each card is unique.
- **R3.2** The full list of 240 cards, with every card's sector, tier, cost, stat numbers, types
  and combos, is part of these rules: `harness/spec/cards.json`, taken from the old game's
  `MarekData.json` with one card name corrected (a trailing space removed from "Timber Harvesting
  Industry"). In that file, the field "sales" is distribution.
- **R3.3** Every card has:
  - a **sector**: Residential, Industry, Service or Public
  - a **tier**: 1, 2 or 3 (stronger and more expensive at higher tiers)
  - a **base cost** in funds
  - **stat numbers** (workforce, quality, satisfaction, product, distribution)
  - 1 to 5 **types**, such as Farm, Low Wealth or Retail. Some cards count a type twice.
  - up to 4 **combos** (R12)
- **R3.4** What the stat numbers do when the card is played depends on its sector:

  | Sector | Gives | Uses up |
  |---|---|---|
  | Residential | workforce | quality, satisfaction |
  | Industry | product | workforce, quality, satisfaction |
  | Service | distribution | workforce, quality, satisfaction |
  | Public | quality, satisfaction | workforce |

- **R3.5** In the card list:

  | | Tier 1 | Tier 2 | Tier 3 |
  |---|---|---|---|
  | Base cost | 3–6 | 7–9 | 11–13 |
  | Product (Industry) or distribution (Service) | 1 | 2 | 3 |

- **R3.6** Public cards are either **quality cards** (more quality than satisfaction) or
  **satisfaction cards** (all others).
- **R3.7** **Kinds:** there are 5 kinds of card: Residential, Industry, Service, Public quality
  card and Public satisfaction card. Draw actions (R15) and kind places of the marketplace (R18)
  use kinds.
- **R3.8** **Real cost:** a card's real cost = its base cost + 1 for every card **you already
  have in play with the same sector and tier**. For example, your third tier 1 Industry card
  costs 2 more than printed.

## R4. A turn and player order

- **R4.1** Every turn from turn 2 on goes like this:
  1. **Start of the turn** (R11): the marketplace and the quests table are refreshed, then the
     **market phase** (R18), where each player in turn takes their turn draw, from the
     marketplace or the deck.
  2. **Main phase** (R5): all players act at the same time, each in their own city. Each
     player's own main phase starts as soon as their own market go ends, while later players
     still have their goes (R18.15).
  3. **End of the turn** (R10), once every player is done (R8.2).
- **R4.2** Turn 1 starts straight with the main phase: it has no market phase and no turn draws,
  because every player starts with a full hand (R17.9).
- **R4.3** **Seats:** when the game starts, the players are given seats numbered 1 to N in a
  random order, where N is the number of players.
- **R4.4** **First player:** the first player of turn *n* is the player in seat
  ((*n* − 1) mod N) + 1, counting the seats of players who left. If that player has left the
  game, the next seat number whose player is still in the game goes first; after the highest seat
  comes seat 1.
- **R4.5** **Player order** in a turn starts from its first player and goes up by seat number,
  round and round. Players who left are skipped.
- **R4.6** **Setup order:** when a game starts, these happen in this order: seats are given
  (R4.3), the deck is shuffled (R17.2), starting hands are dealt (R17.9), the marketplace is
  filled (R18.5), the quests table is filled (R19.3), and the bonus types are picked (R21.6).
  Then every player gets the **2 build passes** of turn 1 (R6.3).

## R5. The main phase

- **R5.1** During the main phase you may do any of these, as often as allowed and in any order:
  1. **Play a card** from your hand (R6).
  2. **Sell** any number of cards from your hand for 1 fund each, in one action. Sold cards go
     to the holding pile, and join the discard pile when the main phase ends (R17.7).
  3. **Claim all combos** that are ready, in one action (R12).
  4. **Use influence actions** (R15).
  5. **Complete projects** (R16).
  6. **Complete quests** (R19).
  7. **Undo** (R7).
- **R5.2** Then you **end your turn** (R8).
- **R5.3** **Action limit:** each player can take at most **50 main-phase actions per turn**.
  Undo counts as an action. Ending the turn does not count and is always allowed. A player who
  reaches the limit is told so.
- **R5.4** **What you see during the main phase:** you see your own actions straight away. Other
  players' main-phase actions are revealed when the main phase ends. Until then you see every
  other player as they were when their own main phase started (R18.15): live while they wait for
  or take their market go, which is public, and after it as they were at the end of their go.
  You also see, live, whether each player has had their market go, is done, is out of time
  (R9.10), is away (M5.2) or has left (M6), and their time bank (R5.6).
- **R5.5** During your main phase, the deck and the discard pile are shown to you as they were
  when your own main phase started, minus the cards drawn on later market goes (R18.15), minus
  the cards you drew yourself, plus any discard shuffles you caused or a later market go caused:
  such a shuffle moves the cards it takes from the discard pile shown to you into the deck shown
  to you. A player still waiting for their market go after the turn's first main phase has
  started sees them as they were when that first main phase started, minus the cards drawn on
  market goes since, plus the discard shuffles those goes caused. A card you drew, or a card
  drawn on a later market go, that is still shown in the discard pile (because another player
  shuffled it into the deck) is taken off the discard pile shown to you, not off the deck.
- **R5.6** Every player's time bank is shown live during the main phase (R9.9).
- **R5.7** Only the final result of each player's main phase is revealed; actions they undid are
  never shown.

## R6. Playing a card

- **R6.1** You can play a card only if all of these are true:
  - you have at least its real cost in funds (R3.8)
  - it is tier 1, or it is turn 5 or later
  - you have at least 1 **build pass** (R6.3); every card you play uses up 1, the first card of
    the turn too
- **R6.2** When you play it:
  - you pay the real cost and use up 1 build pass
  - the card is added to your city
  - the stat changes from R3.4 are applied
  - its types are added to your type counts (R12.1)
  - its combos become available to you (R12)
- **R6.3** **Build passes:** every player starts turn 1 with **2 build passes** (R4.6), and at
  the start of every later turn every player still in the game gets **1 build pass** (R11.4). Unused passes are kept for later turns, with no
  limit, so a player who saves passes can play several cards in one turn. Passes can also be
  bought with influence actions (R15); a bought pass can be used straight away.

## R7. Undo

- **R7.1** You can undo your own main-phase actions one at a time, latest first. Undoing an
  action puts back everything it changed, including the price of the next bought build pass
  (R15.1).
- **R7.2** Only these actions can be undone, and only if neither they nor anything they cause
  draws a card:
  - playing a card
  - selling cards: the sold cards go back into the hand from the holding pile, and the funds
    they gave are taken back
  - claim all
  - influence actions that do not draw a card (trades and build passes)
  - completing a quest whose reward does not draw a card

  An action after which income is taken (R13) counts as drawing a card, even when no card is
  left to draw.
- **R7.3** All other actions cannot be undone: completing a project, draw actions and ending
  your turn. A redraw of the starting hand (R17.12) is not an action and cannot be undone
  either.
- **R7.4** Once an action that cannot be undone has happened, nothing before it can be undone
  either.

## R8. Ending your turn

- **R8.1** When you end your turn you are marked as **done**. Done is final: you can take no more
  main-phase actions this turn.
- **R8.2** The main phase ends once **every** player still in the game is done.
- **R8.3** The order in which players became done is recorded in the game's action log.
- **R8.4** Players who are made done at the same moment (R9.10) become done in player order
  (R4.5).
- **R8.5** **Nothing is lost by ending:** when a player becomes done, by ending their turn or by
  being made done (R9.10), first their turn draw is taken if it is still open (R18.16), then
  every combo that is ready is claimed for them, as by claim all (R12.6), with any income it
  brings (R13). Neither counts as an action (R5.3), and both happen even at the action limit. A
  player who leaves the game (M6) gets neither.

## R9. Time limits

- **R9.1** **Main-phase limit:** each player has a time limit for the main phase, in seconds:

  210 + (turn number − 1) × 120 ÷ 19, rounded to the nearest second, and at most 330; in
  turn 1, 90 seconds more

  That is 5 minutes in turn 1, which has 90 extra seconds for redrawing the starting hand
  (R17.12); 3 minutes 36 seconds in turn 2, about 6 seconds more each turn, and 5 minutes
  30 seconds from turn 20 on. It counts from the moment the player's own main phase starts
  (R18.15).

  | Turn | 1 | 2 | 5 | 10 | 15 | 20+ |
  |---|---|---|---|---|---|---|
  | Time limit | 5:00 | 3:36 | 3:55 | 4:27 | 4:58 | 5:30 |

- **R9.2** **Market-go limit:** 30 seconds for every market go (R18.11).
- **R9.3** **Time bank:** every player has a personal **time bank of 15 minutes** for the whole
  game.
- **R9.4** Each decision has some **free time** that does not use the bank: the first
  **75 seconds** of each main phase (**165 seconds** in turn 1), counted from the start of the
  player's own main phase (R18.15), and the first **5 seconds** of each market go.
- **R9.5** After the free time, the clock runs from the player's bank. In the main phase it runs
  until the player ends their turn; on a market go it runs until they make their choice for that
  go. It stops earlier if the main-phase or market-go limit is reached.
- **R9.6** All time is measured by the server, at the moment it receives a player's message. A
  time-out is applied at the player's deadline; a message received at or after the deadline is
  handled after the time-out. On a market go, a turn draw received at or after the deadline is
  rejected as out of time (`out_of_time`): it was sent for the go that has ended. A turn draw
  the player sends after being shown the time-out is their turn draw left open (R18.16). In the
  main phase a time-out does not end the
  player's turn (R9.10), so their action is then taken as normal. Every time-out is recorded in
  the game's action log.
- **R9.7** Banks are kept in milliseconds and shown rounded down to whole seconds.
- **R9.8** When a player's bank is empty, they only have the free time.
- **R9.9** Every player can see their own and every other player's bank, counting down live,
  also during the main phase.
- **R9.10** **Running out of time:** when a player's time runs out in the main phase, they are
  **out of time**: their clock stops, and they can still take main-phase actions. They are made
  done automatically only once no other player still in the game is playing with time left,
  that is, once every other player is done or out of time. Players made done at that moment
  become done in player order (R8.4). When a player's time runs out on a market go, R18.11
  applies.
- **R9.11** In a **ranked** game (A8), a player whose time runs out in the main phase in 3 turns
  in a row is treated as having left the game (M6), at the moment of the third time-out. Each
  time their time runs out in the main phase, they are told how many times in a row it has
  happened, out of 3. In a **casual** game (M1.13), time-outs in a row are not counted and
  nobody leaves because of them; a player whose time runs out in the main phase is told that
  they can keep playing until the other players are done.
- **R9.12** **Paused game:** if any player's time would run out while no player still in the game
  is connected, the game is **paused** instead: all clocks stop and nobody runs out of time.
- **R9.13** A paused game goes on as soon as any player still in the game reconnects. The player
  whose time would have run out then gets their free time again (that turn's main-phase free
  time of R9.4 in the main phase, 5 seconds on a market go), without using their bank, before
  their time runs out.
- **R9.14** A game that stays paused for 24 hours is abandoned: it ends with no winner, and
  ratings stay the same.
- **R9.15** **Unused free time goes into the bank:** when a player ends their turn (R8.1), the
  part of that turn's main-phase free time (R9.4) they have not used is added to their time
  bank. The bank never goes above its starting 15 minutes, so saved time only refills time
  already used. Free time given again after a pause (R9.13) and the free time of market goes are
  never added, and a player made done (R9.10) has no free time left to add.

## R10. End-of-turn steps

After the main phase, in this order:

- **R10.1** For each player still in the game: influence +1; funds + income; then the stats gain
  is added to funds (R14); "played a card this turn" is reset (unused build passes are kept,
  R6.3). Players who left get no end-of-turn steps.
- **R10.2** Quests leave the table: a quest whose extra turn this was (R19.6), a quest first
  completed this turn in its last turn on the table, and a quest at the end of its last turn on
  the table (R19.7) that nobody completed. Completed quests leave for good; quests nobody
  completed go back into the quest list only after the start-of-turn refill (R19.7, R11.2).
- **R10.3** The turn number goes up by 1.

## R11. Start of a turn

At the start of every turn from turn 2 on, in this order:

- **R11.1** The marketplace removes cards that have been on display during 2 market phases and
  refills its empty places (R18.14).
- **R11.2** At the start of turn 20, a 5th quest place is added. The empty quest places are
  refilled (R19.8). Then the quests that left the table uncompleted at the end of the turn before
  go back into the quest list (R19.7).
- **R11.3** The **market phase** takes place, which includes every player's turn draw (R18).
- **R11.4** Before R11.1, at the very start of the turn, every player still in the game gets
  1 build pass (R6.3).
- **R11.5** **Support:** right after R11.4, every player still in the game compares their total
  worth gained (R2.4) with the highest total worth gained among the other players still in the
  game, and gets **1 fund for every full 10** they are behind (behind by 23.5: +2 funds). Every
  player is compared as they were before any Support of that turn. With fewer than 2 players
  still in the game, nobody gets Support. Support counts toward total worth gained, and is
  public as soon as it is given (M3.5).

## R12. Types and combos

- **R12.1** You have a running count of each type across all your own cards in play (a card that
  counts a type twice adds 2), plus any types gained from quests (R20.6). There are 33 types.
- **R12.2** Each card has up to 4 combos. A combo becomes available to you once that card is in
  your city.
- **R12.3** Each combo needs one of:
  - **a card name**, for example "Stone Quarry". It can be claimed once, when that card is in
    your city, regardless of whether this card or the named card was played first.
  - **a type count**, for example "2 Farm". Your type counts include types from your cards in
    play and types gained from quests. It can be claimed once when you have that many.
- **R12.4** A type-count combo marked **infinite** can be claimed again each time the count
  reaches the next multiple of the combo's count: for "2 Farm" at 2, 4, 6 and so on; for
  "1 Grain" at 1, 2, 3 and so on.
- **R12.5** A combo gives +1 or more workforce, quality or satisfaction.
- **R12.6** Combos are claimed with one action, **claim all**, which claims every combo that is
  ready. An infinite combo is claimed as many times as your type count allows (for example twice
  for "2 Farm" when you have 4 Farm and have not claimed it yet).

## R13. Income

- **R13.1** Whenever you have **at least 1 product and at least 1 distribution**, and workforce,
  quality and satisfaction are all **0 or more**, then automatically:
  - 1 product and 1 distribution are used up
  - income +1
  - you draw 1 card of a random sector, tier by turn (R17.10)
- **R13.2** This repeats as long as it is still possible. It is checked after every action you
  take.

## R14. Stats gain

- **R14.1** At the end of every turn, after income (R10.1), funds go up by the **stats gain**, in
  tenths of a fund (R2.5):

  workforce + quality + satisfaction + 4 × product + 3 × distribution

  A stats gain of 23 is +2.3 funds.
- **R14.2** Negative stats lower it, and it can be below zero: funds then go down by that many
  tenths, but never below 0.
- **R14.3** A positive stats gain counts toward total worth gained (R2.4); a negative one does
  not lower it.

## R15. Influence actions

- **R15.1** Influence actions are optional trades. Some can only be used a limited number of
  times per game. You need enough of everything an action costs. The influence actions are
  exactly the lines of **`harness/spec/influence-actions.txt`**, which is part of these rules:
  the game has every action written there and no other (R15.5). Its order is the order in which
  the actions are listed on screen.
- **R15.2** Each draw action is for one **kind** (R3.7) and the one tier its line names. Each
  draw line therefore gives 5 separate draw actions, one per kind.
- **R15.3** A draw action can only be used while the deck or the discard pile, as you see them
  (R5.5), holds a card of that kind and tier. The card is then found with the steps of R17.4.
- **R15.4** If other players drew the last cards of that kind and tier earlier in the same main
  phase, the draw action gives a card of another tier (R17.4 step 3); the influence stays spent.
- **R15.5** **The format of `influence-actions.txt`:** one action per line, nothing else in the
  file, no empty lines. Each line has four parts separated by ` | `:

  `name | pay costs | what you get | limit`

  - **name:** lower-case letters, digits and spaces, different from every other line's name.
    With its spaces written as underscores it is the action's name in messages and scenarios
    (`influence to funds` is `influence_to_funds`).
  - **pay costs:** `pay ` and one or more costs separated by `, `. A cost is a whole number from
    1 to 99 and a stat of R2.1 (`fund` or `funds`, `income`, `influence`, `workforce`,
    `quality`, `satisfaction`, `product`, `distribution`), for example
    `pay 2 influence, 1 quality`.
  - **what you get:** either `get ` and one or more gains separated by `, `, each a whole number
    from 1 to 99 and a stat of R2.1 or `build pass` (`build passes`), for example
    `get 1 distribution, 1 satisfaction`; or the fixed words
    `draw a tier N card of a chosen kind`, with N 1, 2 or 3 (a draw action, R15.2).
  - **limit:** `1 per game`, `N per game` with N from 2 to 99, or `no limit`.
  - **The rising build pass:** a line that pays only funds and gets 1 build pass may add the
    fixed words `1 more each time` as its last cost (`pay 2 funds, 1 more each time`): its price
    goes up by 1 fund each time the player buys it, and undo puts the price back (R7.1).

  A line whose third part is neither `get …` nor the draw words, or whose fixed words are not
  those above, is an action the game has no rules for: it needs new code before it can be
  played (R15.6). At most one line may be a draw action for each tier. A draw line's limit is
  `no limit`, and at most one line may add `1 more each time`: the game counts no uses of draw
  actions and keeps one build pass price, so a draw line with another limit, or a second line
  with `1 more each time`, also needs new code (R15.6).
- **R15.6** The game, the screens, the rulebook and the tutorial all take the influence actions
  from this file; no other list of them exists. `npm run check` fails, naming the line and the
  wrong word, when a line breaks R15.5, and fails with "needs new code" naming the action when
  the game or the screen has no code for a line (HARNESS.md, "Checking the harness itself"). A
  plain trade (stats or build passes for stats or build passes) needs no new code: the game and
  the screen show and apply it from the file.

## R16. Projects

- **R16.1** Each player has their own 3 projects. Each can be completed once by each player:

  | Project | Needs |
  |---|---|
  | Clean up the streets | 8 quality |
  | Culture campaign | 8 satisfaction |
  | Help the homeless | 8 workforce |

- **R16.2** To complete one you need the required amount, **at least 10 income**, and workforce,
  quality and satisfaction must all be 0 or more.
- **R16.3** Completing it:
  - uses up the 8 of that stat
  - gives income +1, funds +2, influence +3
  - draws 1 card of a random sector, tier by turn (R17.10)
- **R16.5** Completing a project is a main-phase action. Every completion gives the reward of
  R16.3, the third project and the first completion of a project by anyone included.

## R17. The deck and drawing cards

- **R17.1** All players draw from **one shared deck**, which starts with all 240 cards. There is
  also a shared **discard pile**, which starts empty. Sold cards and cards removed from the
  marketplace go to the discard pile. A hand can hold any number of cards. Players see only how
  many cards the discard pile holds, not which cards (M3.2).
- **R17.2** The deck is an **ordered pile**, shuffled when the game starts. Every random result in
  the game (shuffles, random sectors, tiers and bonus types) comes from the game's seeded random
  sequence.
- **R17.3** **Every draw is for one sector or kind, and one tier.** Draw actions (R15) and kind
  places of the marketplace (R18.2) use a kind; all other draws use a sector. The sector is
  either named by the draw or picked at random (each sector equally likely). The tier is either
  named by the draw or set by the **tier by turn** rule (R17.10). When both are random, the
  sector is picked before the tier. A draw of several cards picks for each card in turn.
- **R17.4** The card is found like this:
  1. The first card of that sector or kind and tier from the top of the deck.
  2. If the deck has none, all cards of that sector or kind and tier in the discard pile are
     added to the deck, the whole deck is shuffled, and step 1 is repeated.
  3. If there are still none, steps 1 and 2 are repeated for the same sector or kind with the
     nearest other tier, the lower one first: tier 1 → 2 → 3, tier 2 → 1 → 3, tier 3 → 2 → 1.
  4. If there are still none, the top card of the deck, of any sector and tier. If the deck is
     empty, the whole discard pile is first added to the deck and shuffled.
  5. If there are no cards left at all, nothing is drawn.
- **R17.5** R17.4 applies to every draw: turn draws, income, projects, quests, draw actions and
  marketplace refills (a kind place never takes step 4; R18.3).
- **R17.6** When step 3 or 4 is used, other players only see the sector or kind and tier that was
  asked for. A discard shuffle that the fallback causes is still shown with the sector or kind and
  tier of the cards shuffled, because discard shuffles are public (M3.3).
- **R17.7** During the main phase, draws happen in the order the actions arrive. Cards sold during
  the main phase, and the hand of a player who leaves during it (M6.5), go to a **holding pile**
  and join the discard pile when the main phase ends, so main-phase draws only use the discard
  pile as it was when the turn's first main phase started (R18.15), apart from discard
  shuffles. Market goes after that use the same discard pile.
- **R17.8** A discard shuffle caused by a main-phase draw, or by a turn draw left open
  (R18.16), is shown to the player who caused it straight away, and to other players when the
  main phase ends. A discard shuffle caused by a market go is shown to everyone straight away,
  also while some players are in their main phase. Turn draws happen in the market phase, in
  player order (R18).
- **R17.9** **Starting hands (7 cards each):** dealt to one player at a time, in seat order from
  seat 1 (R4.3). Each player gets one tier 1 card of each sector, one tier 1 card of a random
  sector, one card of a random sector that is tier 1 or 2 (equal chance), and one card of a
  random sector and any tier (equal chance).
- **R17.10** **Tier by turn:** the later the turn, the more likely higher tiers are. With *t* =
  the number of the turn in which the draw happens, minus 1:
  - tier 1 chance = 1 − t/14 (0 from turn 15 on)
  - tier 3 chance = t/17 − 0.52 (0 up to turn 9, 0.9% in turn 10, 100% from turn 27 on)
  - tier 2 = the rest

  | Turn | Tier 1 | Tier 2 | Tier 3 |
  |---|---|---|---|
  | 1 | 100% | 0% | 0% |
  | 5 | 71% | 29% | 0% |
  | 9 | 43% | 57% | 0% |
  | 13 | 14% | 67% | 19% |
  | 17 | 0% | 58% | 42% |
  | 21 | 0% | 34% | 66% |
  | 25 | 0% | 11% | 89% |
  | 29 | 0% | 0% | 100% |

- **R17.11** The turn draws belong to the turn that is starting, so they use its number.
- **R17.12** **Redrawing the starting hand:** in turn 1, until their first main-phase action of
  any kind (playing a card, selling, claim all, an influence action, a project, a quest, undo or
  ending their turn), each player may redraw their starting hand up to **3 times**. A redraw puts
  the whole hand back into the deck, shuffles the whole deck, and deals a new hand of the same
  size exactly as R17.9 deals a starting hand, with the deck as it really is (R17.7). It is free
  and is not a main-phase action: it does not count toward the action limit (R5.3), cannot be
  undone (R7.3), and does not change total worth gained (R2.4). Players redraw on their own, at
  the same time, without waiting for each other; the player keeps the hand they have at the end.
  A redraw after the player's first action, in a later turn, or after their third redraw is
  rejected (`redraw_too_late`, `no_redraw_left`). Others see it as a main-phase draw: it is
  revealed when the main phase ends, as "redrew their starting hand" with how many times
  (M3.3); the cards put back and drawn stay hidden.

## R18. The marketplace

- **R18.1** The marketplace is a shared display of **8 face-up cards** that every player can see.
  It has 8 places: 5 kind places and 3 open places.
- **R18.2** **Kind places:** one for each kind (R3.7). A kind place always holds a card of its
  kind.
- **R18.3** **Filling a kind place:** it is filled with a card of its kind, tier by turn, using the
  steps of R17.4, but never with a card of another kind. If no card of that kind is left in the
  deck or the discard pile, the place stays empty until the next start-of-turn refill, when it is
  tried again.
- **R18.4** **Open places:** each time an open place is filled, the sector is picked at random.
- **R18.5** The marketplace is filled from the deck when the game starts, after the starting hands
  are dealt. Every marketplace card is drawn tier by turn (R17.10), so early on it shows mostly
  lower tiers and later mostly higher tiers. Empty places are always filled in this order:
  Residential, Industry, Service, Public quality card, Public satisfaction card, then open
  places 1, 2 and 3. For each place, its sector (open places) is picked before its tier.
- **R18.6** **Market phase:** at the start of every turn from turn 2 on (R11.3), every player
  still in the game gets exactly **one market go**, one at a time, in player order starting from
  that turn's first player (R4.5).
- **R18.7** The market phase ends when every player still in the game has had their market go.
- **R18.8** **Your market go** is your **turn draw**. You choose one of:
  - **(A) Take a market card.** It goes into your hand for free, and you immediately draw 1 card
    of **the same sector** from the deck, tier by turn (R17.10). Its tier does not have to match
    the market card's, and for a Public card it can be either a quality or a satisfaction card.
  - **(B) Draw from the deck.** Choose a sector and draw **2 cards** of that sector from the
    deck, tier by turn.
- **R18.9** If the marketplace is empty when your market go comes, you take option (B).
- **R18.10** Every card you get from the marketplace or the deck goes into your hand; you still
  pay its real cost when you play it. Every card that comes into your hand during a turn, in the
  market phase or the main phase (from income, projects, quests or draw actions), is marked
  **new** until the end of that turn.
- **R18.11** **Time:** you have 30 seconds for your market go. Time beyond the first 5 seconds
  of a go comes from your time bank (R9). If time runs out, your go ends without a draw and the
  next player's go starts. Your own main phase starts (R18.15), and your turn draw stays open as
  option (B) only (R18.16).
- **R18.12** **Refills:** a place emptied by taking a card stays empty until the start of the next
  turn.
- **R18.13** A card stays in the marketplace for at most **2 market phases**. At the end of every
  market phase, each card still in the marketplace has been on display during one more market
  phase. Cards placed when the game starts are first on display in turn 2's market phase.
- **R18.14** **Start of every turn from turn 2 on:** every card that has already been on display
  during 2 market phases goes to the discard pile. Then every empty place is refilled.
- **R18.15** **Your own main phase:** your main phase starts as soon as your market go ends, by
  your choice or by your time running out, while later players still have their goes. Before
  your market go has ended, main-phase actions are rejected (`wrong_phase`). Market goes do not
  wait for anyone's main phase, and main-phase actions do not change the marketplace. Draws on
  market goes stay public as they happen (M3.3), and come from the deck as it really is, like
  main-phase draws (R17.7).
- **R18.16** **A turn draw left open:** after a time-out on your market go, you can no longer
  take a marketplace card (`out_of_market`), but at any time in your main phase you can take
  your turn draw as option (B): choose a sector and draw 2 cards of it from the deck, tier by
  turn. It is not a main-phase action: it does not count toward the action limit (R5.3) and is
  allowed at the limit. Like every draw it cannot be undone (R7.3, R7.4), and others see it as a
  main-phase draw (M3.3, R17.8). If you become done without having taken it, it is taken for
  you at that moment with a random sector (R8.5). A player who leaves the game (M6) does not
  get it.

## R19. Quests

- **R19.1** The **quests table** is shared by all players and has **4 places** for quests. At the
  start of turn 20 a 5th place is added and filled like any empty place.
- **R19.2** The quest list holds the quests of `quests.txt` (R20.7), each of tier 1, 2 or 3.
  Higher-tier quests are harder and give bigger rewards.
- **R19.3** When the game starts, the table gets 4 random tier 1 quests, out of those R19.11
  allows with every player's starting income of 3.
- **R19.4** Each quest has a **requirement**: something you must have at that moment, such as an
  amount of a stat, a count of a type, or a number of cards of a sector or tier in your city.
  Nothing is used up. To complete a quest, workforce, quality and satisfaction must also all be
  0 or more (R2.3).
- **R19.5** Completing a quest is a main-phase action. Each player can complete each quest on the
  table once. The **reward** is given straight away, with +1 influence more in the turn the quest
  is first completed (R19.10). Any number of players can complete the same quest in the same
  turn.
- **R19.6** **Extra turn:** after the turn in which a quest is first completed, it stays on the
  table for one more turn, its **extra turn**, so that other players can still complete it; at
  the end of its extra turn it leaves the table for good. A quest completed again during its
  extra turn does not stay longer. A quest first completed in its last turn on the table (R19.7)
  gets no extra turn and leaves for good at the end of that turn. During the next turn, every
  player can still see which quests were completed in the turn before and by whom (M3.5).
- **R19.7** A quest stays on the table for at most **6 turns** if it is tier 1, **5 turns** if
  tier 2 and **4 turns** if tier 3, the turn it was placed in counting as its first. At the end
  of its last turn on the table, if nobody completed it, it leaves the table. It goes back into
  the quest list only after the empty places have been refilled at the start of the next turn
  (R11.2, R19.8), so it cannot come straight back.
- **R19.8** At the start of the next turn, the empty places are filled one at a time, in table
  order (place 1 first, the 5th place last), each with a random quest from the list that
  R19.11 allows. A tier is
  picked only while the list still has quests. Its tier is set by the tier by turn rule (R17.10), but tier 2 quests can only be placed
  from turn 5 and tier 3 quests only from turn 13. If the tier picked is not allowed yet or has
  no quests left, the nearest allowed tier that still has quests is used, the lower one first.
  If no allowed tier has quests left, the place stays empty until the next turn.
- **R19.9** When the list has no quests left, empty places stay empty until quests go back into
  it.
- **R19.10** **First completion of a quest:** every player who completes a quest in the turn it
  is first completed gets **+1 influence** on top of its reward, straight away. Completing it
  during its extra turn (R19.6) gives only the reward. Undoing the completion takes back the
  +1 too (R7.1).
- **R19.11** **Quests held back:** a quest whose requirement names an income N can be placed on
  the table (R19.3, R19.8) only while at least one player still in the game has income of at
  least N − 2; a quest whose requirement names completed projects only while at least one
  player still in the game has income of at least 8. Incomes are taken as they are at that
  moment. A quest held back stays in the quest list and is skipped by the pick; a tier whose
  quests in the list are all held back counts as a tier with no quests left (R19.8).

## R20. Quest list

How requirements and rewards are read:

- **R20.1** Every requirement means at least that amount.
- **R20.2** A **sector count** such as "3 Residential cards" counts cards in your city.
- **R20.3** A **type requirement** such as "1 Low Wealth" or "2 Beautification" is a type count
  (R12.1). Types gained from quests count exactly like types from cards, so a type gained from
  one quest can help complete another.
- **R20.4** Card counts and type requirements are checked separately: "2 Service cards and
  1 Service type" needs 2 Service cards in your city and a Service type count of at least 1, from
  any card or quest.
- **R20.5** A **"draw"** reward draws cards tier by turn (R17.10), with a new random sector picked
  for each card.
- **R20.6** A **"gain a type"** reward, such as "gain 1 Farm", adds 1 to your Farm type count, as
  if one more card in your city had that type. It counts everywhere type counts count: type
  combos (including infinite ones), bonus-type points at the end of the game, and type
  requirements of quests. It is not a card: it does not count as a card in your city, and does
  not count for card-name combos or sector counts.
- **R20.7** The quests are exactly the lines of **`harness/spec/quests.txt`**, which is part of
  these rules: the game has every quest written there and no other. The order of the lines is
  the order of the quest list, which the random picks of R19.3 and R19.8 use.
- **R20.8** **The format of `quests.txt`:** one quest per line, nothing else in the file, no empty
  lines. Each line has four parts separated by ` | `:

  `Tier N | name | requirement | reward`

  - **Tier N:** `Tier 1`, `Tier 2` or `Tier 3`.
  - **name:** letters, digits, spaces, apostrophes and hyphens, starting with a capital letter,
    different from every other quest's name (capital letters ignored). It is the quest's name on
    screen, in messages and in scenarios.
  - **requirement:** one or more parts separated by `, `; all must be met (R20.1). N is a whole
    number from 1 to 99, a sector is `Residential`, `Industry`, `Service` or `Public`, a type is
    one of the 33 types of R21.7, and `card` or `cards`, `project` or `projects` may be
    singular or plural:
    - `N <sector> cards`: cards of that sector in your city (R20.2)
    - `N tier 2 or 3 <sector> cards`, `N tier 3 <sector> cards`: cards of that sector and those
      tiers in your city
    - `N cards of each sector`: at least N cards of every sector in your city
    - `N sectors with a tier 3 card`: a tier 3 card in your city in each of N different sectors
    - `N <type>`: a type count (R20.3); the Service type is written `Service type`, so that it
      is not read as a sector
    - `N workforce`, `N quality`, `N satisfaction`: that much of the stat
    - `income N`: income of at least N
    - `N completed projects`: projects you have completed (R16)
  - **reward:** one or more parts separated by `, `, given together:
    - `+N <stat>`: that much of a stat of R2.1 (`fund` or `funds` and so on)
    - `gain N <type>`: a gained type (R20.6), the Service type again written `Service type`
    - `draw N cards`: N cards, tier by turn, each of a random sector (R20.5)

  A reward that gains more than 1 type (`gain N` with N above 1, or two `gain` parts) is one the
  game has no rules for yet: it needs new code, and the check fails with "needs new code"
  (Q170). Parts that give the same stat or draws add up, and `card`, `fund` and the other words
  may be singular or plural whatever the number.
- **R20.9** The game, the rules viewer and rulebook, the menus and the tutorial all take the
  quests from this file; no other list of them exists. `npm run check` fails, naming the line
  and the wrong word, when a line breaks R20.8, when two quests have the same name, when the
  file has fewer than 4 tier 1 quests that R19.11 allows at the start of a game (needing at most
  income 5 and no completed project; R19.3 needs 4 to fill the starting table), or when a
  quest the tutorial needs (T0.7) is missing or changed (HARNESS.md, "Checking the harness
  itself").

## R21. End of the game and score

- **R21.1** The game ends after the main phase of the turn in which any player reaches the end
  goal (R1.3) and is still in the game when that main phase ends.
- **R21.2** The end-of-turn steps (R10) are not carried out for that turn: no influence, income
  or stats gain, and the turn number stays as it is. Then every player gets a score.
- **R21.3** **Turn limit:** if no player has reached the end goal in turn 40, the game ends after
  that turn's main phase anyway, in the same way, and is scored as normal.
- **R21.4** **Score:** computed exactly, in hundredths of a point, then rounded down to a whole
  number; a negative score is rounded down too, so −3.5 becomes −4:

  ```
  6.5  × income
  + 0.7  × workforce
  + 0.55 × quality
  + 0.5  × satisfaction
  + 2.75 × product
  + 2.25 × distribution
  + 0.2  × (whole funds + cards in hand)
  + bonus-type points
  ```

- **R21.5** **Whole funds** are funds without their tenths (R2.5): 5.9 funds count as 5. Income
  is always whole. The score has no base and no part for the turn number, so how long a game
  lasted changes no score.
- **R21.6** **Bonus types:** when a game starts, 2 different types of the 33 are picked at random
  as bonus types for that game, the same for every player.
- **R21.7** Each type has a point value of 2, 3 or 4. At the end, each player gets that value for
  every count of the bonus types in their type counts (R12.1).

  | Points | Types |
  |---|---|
  | 2 | Suburban Housing, Low Wealth, Town Housing, Luxury, City Housing, Light Industry, Heavy Industry, High Tech, Service, Leisure, Retail, Culture, Office |
  | 3 | Raw Material, Forestry, Farm, Power Plant, Mine, Food, Sea, Utility, Mass Transit, Health, Mercantile, Beautification, Safety, Education |
  | 4 | Alcohol, Grain, Petroleum, Mass Media, Finance, Rental Space |

- **R21.8** **Places:** all players still in the game are placed first, and players who left
  after them (A3.4). Among the players still in the game, every player who has reached the end
  goal (R1.3) when the game ends places above every player who has not, whatever their scores;
  inside each of these two groups, players are ranked by score, highest first. The player in 1st
  place is the **winner**.
- **R21.9** If several players in the same group have the same score, the one with the higher
  total worth gained (R2.4) is placed higher. If that is also the same, the one who comes earlier
  in the final turn's player order (R4.5) is placed higher.
