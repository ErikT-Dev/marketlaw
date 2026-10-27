# MarketLaw overview

Status: spec, 2026-10-25.

## Open questions

None yet.

## The pitch

MarketLaw is a multiplayer card game for desktop browsers. Each player is the mayor of a new
city. They play cards to build homes, industry, services and public places, keep their workforce,
quality and satisfaction in balance, and turn product and distribution into income. Everyone
plays the same turn at the same time, competing for the shared marketplace, quests and first
project completions. The highest score wins.

## Version 1 at a glance

| | |
|---|---|
| Players per game | 2 to 4 in casual rooms; 2 to 4 in ranked games, by each player's chosen game sizes; 1 in the tutorial |
| Game length | About 25 turns expected, at most 40 turns (Open question 1 in `game-rules.md`) |
| Time per turn | 3 to 5 minutes per main phase, plus a 15-minute time bank per player |
| Cards | 240 unique cards in 4 sectors and 3 tiers (`cards.json`) |
| Platform | Desktop and laptop browsers, 1280×720 up to 2560×1440 |
| Hosting | Cloudflare Workers Free plan, $0 per month |

## What version 1 includes

- The full game: `game-rules.md`.
- Casual game rooms, public and private, with rematches: `multiplayer.md`.
- Guest and registered accounts, game records, match history, the ranked queue, ELO ratings and
  the ranking table, the players-online list and room chat: `accounts.md`.
- The game menu with the rulebook, the card set and the tutorial: `client.md`, `rulebook.md`,
  `tutorial.md`.
- The screens: `screens.md`. The design in `design/export/` shows how they look; where it and the
  spec files contradict each other, the spec files win.

## Out of scope for version 1

Confirmed by the owner on 2026-10-25. Requests for these are out of scope until the owner adds
them to the spec:

- spectators
- friends lists
- private messages
- bots in live games
- game modes other than the standard game
- phone and tablet layouts
- languages other than English

## The spec files

| File | Rules | Contents |
|---|---|---|
| `glossary.md` | | Exact meanings of all terms |
| `game-rules.md` | R | How a game is played |
| `cards.json` | | The card data |
| `multiplayer.md` | M | Rooms, connections, leaving, what each player can see |
| `accounts.md` | A | Accounts, records, ratings, lobby, ranked queue, limits, chat |
| `client.md` | C | Game menu, rules viewer, card set, tutorial |
| `tutorial.md` | T | The tutorial script |
| `screens.md` | S | What each screen shows and where |
| `rulebook.md` | | The rulebook players read |
