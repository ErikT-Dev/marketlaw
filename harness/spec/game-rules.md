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
   (income 22 and 3 projects) may take noticeably longer. To be checked with the game simulator
   once the engine exists; the end goal, time bank or turn limit may need adjusting then. The
   quest thresholds in R20 were set from the same simulation and should be rechecked with it too.
   Since marketplace cards are free (R18.8), funds are spent only on playing cards, build passes
   and influence; the simulation should also check whether funds pile up and whether the
   starting funds, income or real costs need adjusting.

## R1. Goal

- **R1.1** Each player builds their own city by playing cards. When the game ends, the player
  with the highest score wins (R21).
- **R1.2** Your **city** is all the cards you have played. "In your city" and "your cards in
  play" mean the same thing throughout these rules.
- **R1.3** A player reaches the **end goal** when they have **income of at least 22** and all
  **3 projects completed** (R16). The game ends after the main phase of the turn in which a
  player reaches it (R21.1).
- **R1.4** All players play the **same turn at the same time** (R4). A main phase ends once every
  player is done or out of time (R8, R9), so a quicker player may wait for the others.

## R2. Stats

- **R2.1** Each player has their own stats, starting at these values:

  | Stat | Starts at | What it does |
  |---|---|---|
  | Funds | 7 | Money. Pays for cards. |
  | Income | 3 | Funds gained at the end of every turn. 22 is part of the end goal. |
  | Influence | 0 | +1 every turn. Spent on influence actions (R15). |
  | Workforce | 0 | Made by Residential cards, used up by the other sectors. |
  | Quality | 0 | Made by Public cards, used up by the other sectors. |
  | Satisfaction | 0 | Made by Public cards, used up by the other sectors. |
  | Product | 0 | Made by Industry cards. Turned into income (R13). |
  | Distribution | 0 | Made by Service cards. Turned into income (R13). |
  | Bonus | 0 | Builds up each turn and turns into extra funds (R14). |

- **R2.2** The **turn number** starts at 1 and goes up by 1 at the end of every turn (R10.3). It
  is the same for all players.
- **R2.3** Workforce, quality and satisfaction can go below zero. While any of them is negative
  you cannot gain income (R13) or complete projects (R16).

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
  2. **Main phase** (R5): all players act at the same time, each in their own city.
  3. **End of the turn** (R10).
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
  players' actions are revealed when the main phase ends. Until then you see every other player
  as they were at the start of the main phase, plus, live, whether each player is done, away
  (M5.2) or has left (M6), and their time bank (R5.6).
- **R5.5** During the main phase, the deck and the discard pile are shown to you as they were at
  the start of the main phase, minus the cards you drew yourself, plus any discard shuffles you
  caused. A card you drew that is still shown in the discard pile (because another player shuffled
  it into the deck) is taken off the discard pile shown to you, not off the deck.
- **R5.6** Every player's time bank is shown live during the main phase (R9.9).
- **R5.7** Only the final result of each player's main phase is revealed; actions they undid are
  never shown.

## R6. Playing a card

- **R6.1** You can play a card only if all of these are true:
  - you have at least its real cost in funds (R3.8)
  - it is tier 1, or it is turn 5 or later
  - you have not played a card yet this turn, or you have a **build pass** left (one pass is
    used up per extra card)
  - you have not used "skip build" this turn (R15)
- **R6.2** When you play it:
  - you pay the real cost
  - the card is added to your city
  - the stat changes from R3.4 are applied
  - its types are added to your type counts (R12.1)
  - its combos become available to you (R12)

## R7. Undo

- **R7.1** You can undo your own main-phase actions one at a time, latest first. Undoing an
  action puts back everything it changed, including the price of the next bought build pass
  (R15.1).
- **R7.2** Only these actions can be undone, and only if neither they nor anything they cause
  draws a card:
  - playing a card
  - claim all
  - influence actions that do not draw a card (trades, build passes, skip build)
  - completing a quest whose reward does not draw a card

  An action after which income is taken (R13) counts as drawing a card, even when no card is
  left to draw.
- **R7.3** All other actions cannot be undone: selling, completing a project, draw actions and
  ending your turn.
- **R7.4** Once an action that cannot be undone has happened, nothing before it can be undone
  either.

## R8. Ending your turn

- **R8.1** When you end your turn you are marked as **done**. Done is final: you can take no more
  main-phase actions this turn.
- **R8.2** The main phase ends once **every** player still in the game is done.
- **R8.3** The order in which players became done is recorded; it breaks ties at the end of the
  game (R21.8).
- **R8.4** Players who are made done at the same moment (R9.10) become done in player order
  (R4.5).

## R9. Time limits

- **R9.1** **Main-phase limit:** each player has a time limit for the main phase, in seconds:

  180 + (turn number − 1) × 120 ÷ 19, rounded to the nearest second, and at most 300

  That is 3 minutes in turn 1, about 6 seconds more each turn, and 5 minutes from turn 20 on.

  | Turn | 1 | 5 | 10 | 15 | 20+ |
  |---|---|---|---|---|---|
  | Time limit | 3:00 | 3:25 | 3:57 | 4:28 | 5:00 |

- **R9.2** **Market-go limit:** 30 seconds per market go; the first player of the turn has
  45 seconds (R18.11).
- **R9.3** **Time bank:** every player has a personal **time bank of 15 minutes** for the whole
  game.
- **R9.4** Each decision has some **free time** that does not use the bank: the first
  **45 seconds** of each main phase, and the first **5 seconds** of each market go.
- **R9.5** After the free time, the clock runs from the player's bank. In the main phase it runs
  until the player ends their turn; on a market go it runs until they make their choice for that
  go. It stops earlier if the main-phase or market-go limit is reached.
- **R9.6** All time is measured by the server, at the moment it receives a player's message. A
  message received at or after the player's deadline is rejected as out of time, and the
  time-out is applied at that moment. Every time-out is recorded in the game's action log.
- **R9.7** Banks are kept in milliseconds and shown rounded down to whole seconds.
- **R9.8** When a player's bank is empty, they only have the free time.
- **R9.9** Every player can see their own and every other player's bank, counting down live,
  also during the main phase.
- **R9.10** **Running out of time:** when a player's time runs out in the main phase, they are
  made done automatically. When it runs out on a market go, R18.11 applies.
- **R9.11** A player whose time runs out in the main phase in 3 turns in a row is treated as
  having left the game (M6). Each time their time runs out in the main phase, they are told how
  many times in a row it has happened, out of 3.
- **R9.12** **Paused game:** if any player's time would run out while no player still in the game
  is connected, the game is **paused** instead: all clocks stop and nobody runs out of time.
- **R9.13** A paused game goes on as soon as any player still in the game reconnects. The player
  whose time would have run out then gets their free time again (45 seconds in the main phase,
  5 seconds on a market go), without using their bank, before their time runs out.
- **R9.14** A game that stays paused for 24 hours is abandoned: it ends with no winner, and
  ratings stay the same.

## R10. End-of-turn steps

After the main phase, in this order:

- **R10.1** For each player still in the game: influence +1; funds + income; bonus is added and
  turned into funds (R14); first-completion project rewards are given (R16.6); "played a card
  this turn" and "skipped build this turn" are reset (unused build passes are kept). Players who
  left get no end-of-turn steps.
- **R10.2** Quests completed this turn leave the table for good. Quests at the end of their 5th
  turn on the table that nobody completed go back into the quest list (R19.7).
- **R10.3** The turn number goes up by 1.

## R11. Start of a turn

At the start of every turn from turn 2 on, in this order:

- **R11.1** The marketplace removes cards that have been on display during 2 market phases and
  refills its empty places (R18.14).
- **R11.2** At the start of turn 20, a 5th quest place is added. The empty quest places are
  refilled (R19.8).
- **R11.3** The **market phase** takes place, which includes every player's turn draw (R18).

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

## R14. Bonus

- **R14.1** At the end of every turn, bonus goes up by:

  workforce + quality + satisfaction + 4 × product + 3 × distribution

- **R14.2** Negative stats lower it, and the bonus can go below zero.
- **R14.3** Then, for every full 10 bonus, 10 bonus is turned into 1 fund.

## R15. Influence actions

- **R15.1** Influence actions are optional trades. Some can only be used a limited number of
  times per game. You need enough of everything an action costs.

  | Action | Limit per game |
  |---|---|
  | 4 influence → 2 funds | 1 |
  | 4 influence → 1 quality | 1 |
  | 4 influence → 1 satisfaction | 1 |
  | 6 influence → 1 workforce | 1 |
  | 1 fund → 1 influence | unlimited |
  | 2 funds → 1 build pass; costs 1 more fund each time it is bought | unlimited |
  | 5 influence → 1 build pass | 1 |
  | Skip build (only if you have not played a card this turn): you cannot play a card for the rest of this turn, but you gain 1 build pass to use later | 3 |
  | 1 influence + 1 quality → 1 satisfaction | 1 |
  | 1 influence + 1 satisfaction → 1 quality | 1 |
  | 2 influence + 1 product → 1 distribution + 1 satisfaction | 1 |
  | 2 influence + 1 distribution + 1 satisfaction → 1 product | 1 |
  | 2 influence + 1 quality → 1 workforce | 1 |
  | 2 influence + 1 satisfaction → 1 workforce | 1 |
  | 1 workforce → 1 satisfaction | 1 |
  | 1 workforce → 1 quality | 1 |
  | 2 quality → 1 satisfaction | unlimited |
  | 2 satisfaction → 1 quality | unlimited |
  | 4 quality → 1 workforce | unlimited |
  | 4 satisfaction → 1 workforce | unlimited |
  | 3 influence → draw a tier 1 card of a chosen kind | unlimited |
  | 4 influence → draw a tier 2 card of a chosen kind | unlimited |
  | 5 influence → draw a tier 3 card of a chosen kind | unlimited |

- **R15.2** Each draw action is for one **kind** (R3.7) and one tier. That makes 5 kinds ×
  3 tiers = 15 separate draw actions.
- **R15.3** A draw action can only be used while the deck or the discard pile, as you see them
  (R5.5), holds a card of that kind and tier. The card is then found with the steps of R17.4.
- **R15.4** If other players drew the last cards of that kind and tier earlier in the same main
  phase, the draw action gives a card of another tier (R17.4 step 3); the influence stays spent.

## R16. Projects

- **R16.1** Each player has their own 3 projects. Each can be completed once by each player:

  | Project | Needs |
  |---|---|
  | Clean up the streets | 8 quality |
  | Culture campaign | 8 satisfaction |
  | Help the homeless | 8 workforce |

- **R16.2** To complete one you need the required amount, and workforce, quality and satisfaction
  must all be 0 or more.
- **R16.3** Completing it:
  - uses up the 8 of that stat
  - gives income +1, funds +2, influence +3
  - draws 1 card of a random sector, tier by turn (R17.10)
- **R16.4** Completing your third project gives an extra income +1 and draws 1 more card.
- **R16.5** Completing a project is a main-phase action.
- **R16.6** **First completion:** for each project, in the first turn in which any player
  completes it, every player who completes it in that turn also gets **+2 funds**, at the end of
  the turn. In later turns, that project gives only the normal reward.

## R17. The deck and drawing cards

- **R17.1** All players draw from **one shared deck**, which starts with all 240 cards. There is
  also a shared **discard pile**, which starts empty. Sold cards and cards removed from the
  marketplace go to the discard pile. A hand can hold any number of cards.
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
  tier of the cards shuffled (M3.3), because the discard pile is public.
- **R17.7** During the main phase, draws happen in the order the actions arrive. Cards sold during
  the main phase, and the hand of a player who leaves during it (M6.5), go to a **holding pile**
  and join the discard pile when the main phase ends, so main-phase draws only use the discard
  pile as it was at the start of the phase.
- **R17.8** A discard shuffle during the main phase is shown to the player who caused it straight
  away, and to other players when the main phase ends. Turn draws happen in the market phase, in
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
- **R18.11** **Time:** you have 30 seconds for your market go; the first player of the turn has
  45 seconds. Time beyond the first 5 seconds of a go comes from your time bank (R9). If time
  runs out, you take option (B) with a random sector.
- **R18.12** **Refills:** a place emptied by taking a card stays empty until the start of the next
  turn.
- **R18.13** A card stays in the marketplace for at most **2 market phases**. At the end of every
  market phase, each card still in the marketplace has been on display during one more market
  phase. Cards placed when the game starts are first on display in turn 2's market phase.
- **R18.14** **Start of every turn from turn 2 on:** every card that has already been on display
  during 2 market phases goes to the discard pile. Then every empty place is refilled.

## R19. Quests

- **R19.1** The **quests table** is shared by all players and has **4 places** for quests. At the
  start of turn 20 a 5th place is added and filled like any empty place.
- **R19.2** There are 45 quests in the quest list (R20): 15 each of tier 1, 2 and 3. Higher-tier
  quests are harder and give bigger rewards.
- **R19.3** When the game starts, the table gets 4 random tier 1 quests.
- **R19.4** Each quest has a **requirement**: something you must have at that moment, such as an
  amount of a stat, a count of a type, or a number of cards of a sector or tier in your city.
  Nothing is used up.
- **R19.5** Completing a quest is a main-phase action. Each player can complete each quest on the
  table once. The **reward** is given straight away. Any number of players can complete the same
  quest in the same turn.
- **R19.6** At the end of a turn, every quest that at least one player completed leaves the table
  for good.
- **R19.7** A quest stays on the table for at most **5 turns**. At the end of its 5th turn on the
  table, if nobody completed it, it leaves the table and goes back into the quest list.
- **R19.8** At the start of the next turn, the empty places are filled one at a time, in table
  order (place 1 first, the 5th place last), each with a random quest from the list. A tier is
  picked only while the list still has quests. Its tier is set by the tier by turn rule (R17.10), but tier 2 quests can only be placed
  from turn 5 and tier 3 quests only from turn 13. If the tier picked is not allowed yet or has
  no quests left, the nearest allowed tier that still has quests is used, the lower one first.
  If no allowed tier has quests left, the place stays empty until the next turn.
- **R19.9** When the list has no quests left, empty places stay empty until quests go back into
  it.

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
- **R20.7** The quests are:

  **Tier 1**

  | Name | Requirement | Reward |
  |---|---|---|
  | Working district | 3 Residential cards and 1 Low Wealth | +1 quality |
  | Farming industry | 2 Industry cards and 1 Farm | +1 workforce |
  | Local services | 2 Service cards and 1 Service type | +1 satisfaction |
  | Green city | 3 Public cards and 2 Beautification | +3 funds |
  | Countryside | 1 Suburban Housing and 1 Farm | gain 1 Suburban Housing |
  | Farmland | 1 Farm and 2 Food | gain 1 Farm |
  | Fishing village | 1 Sea and 2 Food | gain 1 Sea, +1 fund |
  | Sports town | 1 Leisure and 1 Health | gain 1 Health |
  | High street | 2 Retail and 1 Suburban Housing | +1 satisfaction, +1 fund |
  | Mining town | 1 Mine and 1 Low Wealth | gain 1 Mine |
  | Workers' housing | 5 workforce and 1 Low Wealth | +1 fund, +3 influence |
  | Tidy streets | 5 quality and 1 Beautification | +1 workforce |
  | Healthy town | 4 satisfaction and 1 Health | +1 workforce |
  | Trading post | Income of 4 and 1 Retail | +1 fund, +2 influence |
  | Supply chain | Income of 5 and 1 Raw Material | draw 1 card |

  **Tier 2**

  | Name | Requirement | Reward |
  |---|---|---|
  | Growing suburbs | 2 Town Housing and 1 Low Wealth | +2 quality |
  | Upmarket homes | 2 tier 2 or 3 Residential cards and 1 Luxury | +2 satisfaction |
  | Modern industry | 2 tier 2 or 3 Industry cards and 1 Light Industry | +2 workforce |
  | Service economy | 2 tier 2 or 3 Service cards and 1 Service type | +2 satisfaction |
  | Culture hub | 3 tier 2 or 3 Public cards and 1 Culture | gain 1 Culture, +3 influence |
  | Factory town | 2 Town Housing and 1 Light Industry | gain 1 Light Industry, +1 quality |
  | Market town | 1 Town Housing, 1 Retail and 1 Food | gain 1 Retail, draw 1 card |
  | Industrial zone | 2 Light Industry and 1 Raw Material | +4 funds |
  | Shopping centre | 2 Retail, 1 Service type and 1 Leisure | +2 satisfaction |
  | Leisure park | 2 Leisure and 1 Beautification | gain 1 Beautification, +2 funds |
  | Culture district | 2 Culture and 1 Education | gain 1 Culture, +1 satisfaction |
  | Safe streets | 6 quality and 1 Safety | +2 workforce |
  | Happy residents | 6 satisfaction and 1 Leisure | +1 workforce, +1 quality |
  | Civic pride | 1 completed project and 2 Beautification | +2 funds, +3 influence |
  | Service boom | Income of 7 and 1 Service type | draw 2 cards |

  **Tier 3**

  | Name | Requirement | Reward |
  |---|---|---|
  | Penthouses | 3 tier 2 or 3 Residential cards, at least 1 of them tier 3, and 1 City Housing | +3 quality |
  | Heavy industry | 3 tier 2 or 3 Industry cards and 1 Heavy Industry | +3 workforce |
  | Office district | 3 tier 2 or 3 Service cards and 1 Office | +3 satisfaction |
  | Public institutions | 4 tier 2 or 3 Public cards, 1 Safety and 1 Education | +2 quality, +3 influence |
  | City living | 2 City Housing and 1 Luxury | gain 1 City Housing, +2 quality |
  | Tech campus | 2 High Tech and 1 Education | gain 1 High Tech, draw 1 card |
  | Commuter city | 1 City Housing and 1 Mass Transit | gain 1 Mass Transit, +1 quality |
  | Business district | 2 Office and 1 Finance | +4 funds, +4 influence |
  | Media city | 1 Mass Media, 1 Office and 1 Culture | gain 1 Mass Media, +2 satisfaction |
  | Tech industry | 1 High Tech and 1 Heavy Industry | draw 2 cards |
  | Metropolis | 1 tier 3 card in each of 3 different sectors | draw 3 cards |
  | Balanced city | 3 cards of each sector and 1 Mass Transit | +4 funds, draw 2 cards |
  | Cultural capital | 8 satisfaction and 1 Culture | +3 workforce |
  | Civic leader | 2 completed projects and 1 Safety | +2 quality, +2 satisfaction |
  | High-tech economy | Income of 10 and 1 High Tech | draw 3 cards |

## R21. End of the game and score

- **R21.1** The game ends after the main phase of the turn in which any player reaches the end
  goal (R1.3) and is still in the game when that main phase ends.
- **R21.2** The end-of-turn steps (R10) are not carried out for that turn: no income, bonus or
  influence, and the turn number stays as it is. First-completion project rewards earned in that
  turn (R16.6) are still given. Then every player gets a score.
- **R21.3** **Turn limit:** if no player has reached the end goal in turn 40, the game ends after
  that turn's main phase anyway, in the same way, and is scored as normal.
- **R21.4** **Score:** computed exactly, in hundredths of a point, then rounded down to a whole
  number; a negative score is rounded down too, so −3.5 becomes −4:

  ```
  870
  − 25   × (turn number − 1)
  + 6.5  × income
  + 0.7  × workforce
  + 0.55 × quality
  + 0.5  × satisfaction
  + 2.75 × product
  + 2.25 × distribution
  + 0.2  × (funds + cards in hand)
  + bonus-type points
  ```

- **R21.5** "Turn number − 1" is the number of completed turns. That part is the same for all
  players in a game. It stays in the formula so that a player's scores can be compared from one
  game to the next.
- **R21.6** **Bonus types:** when a game starts, 2 different types of the 33 are picked at random
  as bonus types for that game, the same for every player.
- **R21.7** Each type has a point value of 2, 3 or 4. At the end, each player gets that value for
  every count of the bonus types in their type counts (R12.1).

  | Points | Types |
  |---|---|
  | 2 | Suburban Housing, Low Wealth, Town Housing, Luxury, City Housing, Light Industry, Heavy Industry, High Tech, Service, Leisure, Retail, Culture, Office |
  | 3 | Raw Material, Forestry, Farm, Power Plant, Mine, Food, Sea, Utility, Mass Transit, Health, Mercantile, Beautification, Safety, Education |
  | 4 | Alcohol, Grain, Petroleum, Mass Media, Finance, Rental Space |

- **R21.8** **Places:** all players still in the game are ranked by score, highest first; players
  who left come after them (A3.4). The player in 1st place is the **winner**.
- **R21.9** If several players have the same score, the one who became done earliest in the final
  turn is placed higher (R8.3). If that is also the same, the one who comes earlier in that
  turn's player order is placed higher.
