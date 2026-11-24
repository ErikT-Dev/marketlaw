# MarketLaw tutorial

Status: spec, 2026-10-25.

The tutorial (C4) is a guided one-player game of 5 turns. The player plays 5 cards, takes turn
draws both ways, claims a combo, gets their first income and completes a quest. Every step
lists the one action the player can take (C4.4), the text they see, and the state afterwards.
All game rules in `game-rules.md` apply, except time limits (C4.5).

- Every step has a number, such as T3.2. Scenarios refer to steps by number.
- The texts are written for players: short, friendly and concrete. Rule numbers are never shown.
- `> Erik:` lines are the owner's comments; they get worked into the text and then removed.

## Open questions

None yet.

## T0. Setup

- **T0.1** Starting stats as in R2.1: funds 7.0, income 3, influence 0, all other stats 0, and
  2 build passes (R4.6).
- **T0.2** Starting hand (7 cards): Row House, Stone Quarry, Liquor Shop, Library, Cottage, Pub,
  Hiking Trail.
- **T0.3** Quests table: Trading post, Working district, Green city, Fishing village.
- **T0.4** Bonus types: Retail and Safety.
- **T0.5** The marketplace, using the place names of R18.5:

  | Place | Turn 2 | Turn 3 | Turn 4 | Turn 5 |
  |---|---|---|---|---|
  | Residential | Farm House | Farm House | Log House | Log House |
  | Industry | Metal Mining | Metal Mining | Orchard | Livestock Farm |
  | Service | Dentist | Dentist | Fast Food Restaurant | Fast Food Restaurant |
  | Public quality card | Fire Station | Trauma Center | Trauma Center | Landfill |
  | Public satisfaction card | Basketball Court | Basketball Court | Green Park | Green Park |
  | Open place 1 | Apparel Store | Apparel Store | Gym | Gym |
  | Open place 2 | Clinic | Clinic | Bus Depot | Bus Depot |
  | Open place 3 | Forest Plantation | Forest Plantation | Poultry Farm | Poultry Farm |

  These follow R18.13 and R18.14: the turn 2 cards are placed at setup; Trauma Center fills the
  place emptied in turn 2; the turn 2 cards are removed at the start of turn 4 after 2 market
  phases; Trauma Center is removed at the start of turn 5, and Livestock Farm fills the place
  emptied in turn 4.
- **T0.6** The deck order and the random sequence are fixed so that the marketplace above and
  every draw named in the steps below happen exactly as written, the same for every player.
- **T0.7** **What the tutorial needs from the rule files** (R15.6, R20.9): `quests.txt` must hold
  Working district, Green city and Fishing village as tier 1 quests, and Trading post as a tier 1
  quest with exactly the requirement `income 4, 1 Retail` and the reward
  `+1 fund, +2 influence` (T5.3). The tutorial uses no influence action. `npm run check` fails
  when a file no longer gives the tutorial this.
- **T0.8** The tutorial player never gets the redraw of R17.12: it is not a step (C4.4).

## T1. Turn 1: playing and selling

- **T1.1** Text: "Welcome, Mayor! You build a city by playing cards from your hand. This is your
  hand, and these are your stats." The player continues.
- **T1.2** Action: **play Row House**. Text before: "Residential cards bring workforce, the
  people who staff your city. Play Row House." After: funds 3, workforce 4, quality −2,
  satisfaction −1. Text: "Every card also uses something up. Residents need quality and
  satisfaction, so those dropped below zero. While any of them is negative, you cannot earn
  income."
- **T1.3** Action: **sell Hiking Trail**. Text before: "Every card you play uses a build pass. You
  start with 2, get 1 more every turn and keep the ones you don't use. Cards you don't need can be sold for 1 fund
  each. Sell Hiking Trail." After: funds 4.
- **T1.4** Action: **end your turn**. Text before: "End your turn when you are done." After the
  end-of-turn steps: turn 2, funds 7.1, influence 1. Text: "At the end of every turn you get
  your income in funds, 1 influence, and a little more from your stats: each workforce, quality
  or satisfaction adds 0.1 fund."

## T2. Turn 2: the market and combos

- **T2.1** Text: "From turn 2 on, every turn starts with the market phase. You get one go in it,
  your turn draw: take a free card from the marketplace, plus one card of the same sector from the
  deck. Or skip the market and draw 2 cards of one sector from the deck."
- **T2.2** Action: **take Fire Station** from the marketplace (turn draw option A). The deck draw
  gives Elementary School. Text after: "Fire Station is yours, and you drew Elementary School
  from the deck. Cards marked new arrived this turn."
- **T2.3** Action: **play Fire Station**. Text before: "Public cards bring quality or
  satisfaction. Play Fire Station." After: funds 3.1, workforce 3, quality 0, satisfaction −1.
- **T2.4** Action: **claim all**. Text before: "Cards have combos. Row House gives +1 quality
  when you have a Safety card, and Fire Station is a Safety card. Claim all ready combos." After:
  quality 1.
- **T2.5** Action: **end your turn**. After: turn 3, funds 6.4, influence 2.

## T3. Turn 3: drawing from the deck

- **T3.1** Action: **turn draw option B, sector Public**. Text before: "This time, skip the
  marketplace: choose Public and draw 2 cards from the deck." The draw gives Public Playground
  and Tennis Court.
- **T3.2** Action: **play Public Playground**. Text before: "Each card costs 1 more for every
  card of the same sector and tier already in your city. Public Playground costs 5 now, not 4."
  After: funds 1.4, workforce 3, quality 1, satisfaction 1. Text: "No stat is negative any more."
- **T3.3** Action: **end your turn**. After: turn 4, funds 4.9, influence 3.

## T4. Turn 4: product

- **T4.1** Action: **take Orchard** from the marketplace (turn draw option A). The deck draw
  gives Extensive Wheat Farm.
- **T4.2** Action: **play Orchard**. Text before: "Industry cards make product. Play Orchard."
  After: funds 0.9, workforce 1, quality 1, satisfaction 0, product 1. Text: "Income needs product
  and distribution together. Service cards make distribution."
- **T4.3** Action: **end your turn**. After: turn 5, funds 4.5, influence 4. Text: "Product adds
  the most at the end of a turn: 0.4 fund each, so your stats added 0.6 this time."

## T5. Turn 5: income and quests

- **T5.1** Action: **turn draw option B, sector Service**. The draw gives Cafe and Night Club.
- **T5.2** Action: **play Liquor Shop**. Text before: "Liquor Shop is a Service card. Play it."
  After: income turns on by itself: product 0, distribution 0, income 4, and 1 card is drawn
  (Small Home). Funds 0.5, workforce 0, quality 0, satisfaction 0. Text: "1 product and
  1 distribution became +1 income and a new card. This happens by itself whenever you have both
  and no stat is negative."
- **T5.3** Action: **complete Trading post**. Text before: "Quests on the table give rewards to
  every player who meets them. Trading post needs income 4 and the Retail type. Liquor Shop has
  the Retail type. Complete it." After: funds 1.5, influence 7. Text: "You were the first to
  complete it, so you got 1 influence more. Each quest stays a few turns, and any player can
  complete it once."
- **T5.4** Text: "Two more things to know. Projects: when you collect 8 quality, 8 satisfaction or
  8 workforce and have at least 10 income, you can complete a project for income, funds and
  influence. The game ends after
  the turn in which a player has income 20 and all 3 projects; then the highest score wins. In a
  real game, you play against 1 to 3 other players at the same time, and every turn has a time
  limit. You can read all the rules any time from the menu." The player finishes, and the
  tutorial ends (C4.6).
