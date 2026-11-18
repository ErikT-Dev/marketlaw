# The MarketLaw harness

The harness is the owner's definition of how MarketLaw must behave, and the proof that it does.
The game is correct when every check here passes. Nothing in this folder describes how the game
is built; it only describes what the game does.

## Who owns what

- The owner owns everything in `harness/`. Only the owner changes the specs, scenarios,
  invariants, budgets and coverage.
- The coding agent may only add new scenario files in `scenarios/proposed/`, for the owner to
  accept or reject. Accepted scenarios move out of `proposed/`.
- Generated output (`screens/`, `report.html`) is written by the test run, never by hand.

## The files

| File | What it is for |
|---|---|
| `HARNESS.md` | This file: the files, the scenario format, the reason codes, what passing means |
| `spec/overview.md` | The pitch, version 1 at a glance, what is in and out of scope |
| `spec/glossary.md` | The exact meaning of every term |
| `spec/game-rules.md` | How a game is played (rules R1–R21) |
| `spec/cards.json` | The 240 cards |
| `spec/multiplayer.md` | Rooms, connections, leaving, what each player can see (rules M1–M8) |
| `spec/accounts.md` | Accounts, records, ratings, lobby, ranked queue, limits, chat (rules A1–A11) |
| `spec/client.md` | Game menu, rules viewer, card set, tutorial (rules C1–C4) |
| `spec/tutorial.md` | The tutorial script (steps T0–T5) |
| `spec/rulebook.md` | The rulebook players read in the game |
| `scenarios/*.yaml` | Concrete test cases, one file per topic |
| `scenarios/proposed/*.yaml` | Scenarios suggested by the coding agent, waiting for the owner |
| `invariants.yaml` | What must be true after every action in random simulated games |
| `budgets.yaml` | Limits per game and per player, from the Cloudflare Free plan |
| `coverage.md` | Every rule against the scenarios that test it, with gaps flagged; generated, never edited by hand |
| `scenario-format.yaml` | The formal version of the scenario format below; every scenario file must match it |
| `coverage-exceptions.yaml` | Rules the owner approved as checked another way instead of, or as well as, by scenarios |
| `required.yaml` | What must pass now, while version 1 is built phase by phase (see below) |
| `screens/` | Screenshots from the browser tests (generated) |
| `report.html` | The result of the last test run (generated) |

## The scenario format

Every scenario file is a list of scenarios. Every scenario has exactly these parts:

| Part | Meaning |
|---|---|
| `name` | What the scenario shows, as a plain English sentence: `rejects a tier 2 card before turn 5`. Letters, digits, spaces and simple punctuation only. |
| `covers` | The rules and tutorial steps it tests: `[R6.1]`, `[M6.8, A3.1]`. |
| `given` | The starting situation. Only what matters is written; everything else is as at the start of a normal game. |
| `when` | The actions, in order, each by one player. |
| `then` | What must be true afterwards. |

### `given`

| Field | Meaning | If left out |
|---|---|---|
| `players` | Number of seats, 1 to 4 (1 only for the tutorial) | 2 |
| `kind` | `casual`, `ranked` or `tutorial` | `casual` |
| `turn` | The turn number | 1 |
| `phase` | `new_game` (not started yet), `market`, `main` or `ended` | `main` |
| `first_player` | Seat number of this turn's first player | as R4.4 |
| `market_go` | In the market phase: whose go it is | the first player's go |
| `seats` | Per seat: `stats`, `hand`, `city`, `gained_types`, `build_passes`, `build_passes_bought`, `influence_uses`, `projects`, `quests_completed`, `combos_claimed`, `played_this_turn`, `redraws_used` (redraws of the starting hand so far, R17.12), `worth_gained` (total worth gained, R2.4), `actions_this_turn`, `done`, `left`, `connected`, `time_bank_ms`, `timeouts_in_a_row` (counted in ranked games only, R9.11), `out_of_time` (their main-phase time has run out and they are not done yet, R9.10), `turn_draw_pending` (their turn draw is still open after a time-out on their market go, R18.16), `market` (`in` before their market go this turn, `out` after it, when their own main phase has started, R18.15), `new_cards`, `state_version`, `actions_this_game` (accepted actions in this game so far, for A9.2), `player` (the account in that seat) | starting values (R2.1), 1 build pass (R6.3), total worth gained 14 (R2.4), empty hand and city, nothing used, claimed or redrawn, connected |
| `deck` | The deck, top first, as card names | all cards not placed elsewhere, in `cards.json` order |
| `discard` | The discard pile, as card names | empty |
| `marketplace` | Each `place` and its `card`, plus `phases_shown`: how many market phases it has been on display | empty; `phases_shown` 0 |
| `quests` | Each quest on the table, and `turns_on_table` so far | empty; `turns_on_table` 1 |
| `quest_list` | Quests still in the quest list | all quests not on the table |
| `bonus_types` | The 2 bonus types | the first 2 types in R21.7 |
| `random` | The random results the rules will ask for, in the order they are asked. Each entry is one of `sector`, `tier`, `shuffle` (the resulting order), `quest`, `type` (a bonus type), `seats` (accounts in seat order) or `generated_name` | none; see below |
| `clock_ms` | The server time at the start, in milliseconds | 0 |
| `first_completions` | Projects someone has already completed in an earlier turn (R16.6) | none |
| `paused`, `last_vote_turn` | Whether the game is paused (R9.12); the turn of the last abandon vote (M7.2) | not paused; no vote yet |
| `room`, `other_rooms` | A room's `code`, `size`, `public`, `owner`, `players`, `state` (`waiting`, `accepting`, `playing`, `ended`), `kind` of its last game, `chat`, `messages_sent` per player, `ended_ms` | none |
| `accounts` | Each account's `name`, `kind` (`guest` or `registered`), `email`, `email_confirmed`, `pending_email`, `password`, `rating`, `ranked_games`, `highest_rating`, `games` (how many game records), `online`, `in_game`, `ranking_place`, `last_used_ms`, `username_changes_ms` (the times of their username changes, oldest first, A2.4), and today's counts `actions_today`, `games_started_today`, `emails_today` | none |
| `email_counts` | Emails sent to each address today (A1.9) | none |
| `queue`, `match`, `queue_count` | Players in the ranked queue in order, each a name (game size 3 only) or `{player, sizes}`; a match being confirmed; the queue count, a total or `{total, by_size}` | empty |
| `tutorial` | A player in the tutorial, at the start of a step; the state is the one `tutorial.md` gives for that step | none |
| `site_games_today` | Games started on the site today (A9.4) | 0 |
| `ranked_accounts`, `records` | How many accounts are in the ranking table (A5.4); saved game records (A3) | none |
| `site_counts_today` | Site-wide counts for today: `tutorials`, `chat_messages`, `emails` (A9.6) | 0 |

Cards are always named exactly as in `cards.json`. Stats are written as numbers, for example
`stats: {funds: 10, workforce: -1}`; the stat names are `funds`, `income`, `influence`, `workforce`,
`quality`, `satisfaction`, `product`, `distribution` and `bonus`.

Random results: a random pick with only one possible result (for example the tier in turn 1) is
not asked for and takes no entry in `random`. A shuffle is given as the resulting order of the
whole deck, top first, for example `{shuffle: [Orchard, Pub, Library]}`. A scenario must list
every random result the rules ask for, in order, or it fails, with one exception: when a game is
set up during the scenario (`start_game`, everyone accepting a game or a rematch, or a match
being confirmed), setup results the scenario does not list may be anything, as long as `then`
checks nothing that depends on them. A scenario that lists any setup result lists all of them
up to the last one it needs. A listed result the rules never ask for, or one of another kind than the
rules ask for at that point, also fails the scenario. In a new game, `deck` is the order after
the starting shuffle. Marketplace places are named `residential`, `industry`, `service`,
`public_quality`, `public_satisfaction`, `open_1`, `open_2` and `open_3`.

### `when`

Each step is one of:

- `seat: 1` with an `action` and its details, for example `{seat: 1, action: play_card, card: Row House}`
- `player: Ann` with an `action`, for room, account, lobby, chat and tutorial actions by an account
- `visitor: v1` with an `action`, for someone on the site who is not logged in
- `start_game`: a game in phase `new_game` is set up and starts
- `wait_ms: 30000`: the server clock moves on and every deadline reached fires; with
  `alarm_fires: false` the deadline has passed but its alarm is late (R9.6)
- `disconnect: 2` or `reconnect: 2` (a seat or a player name): a connection closes or opens
- `raw: …`: an exact message from a client, for hostile-client scenarios (malformed, forged,
  duplicated or stale messages)

Action details: `kind` for a draw action (`Residential`, `Industry`, `Service`, `Public quality
card` or `Public satisfaction card`), `option` (`A` or `B`) for a turn draw, `human_check` (`passed` or `missing`),
`login` (a username or email address), `username` for a new or changed username, `text` for a chat message, or `text_length`,
`text_bytes` and `text_kind` (for example `emoji`) to describe a long message without writing
it out, `player_to_mute` for a mute and `player_to_unmute` for an unmute.

### `then`

| Field | Meaning |
|---|---|
| `rejected` | The last step was rejected with this reason code (see below) |
| `unchanged` | `true`: the rejected step changed nothing at all |
| `seats` | Per seat, any of the `given` fields, with their expected values |
| `deck`, `deck_count`, `discard`, `holding_pile`, `marketplace`, `quests`, `quest_list`, `turn`, `phase`, `first_player`, `market_go`, `paused`, `done_order`, `first_completions` | Expected values; `market_go` can include `time_left_ms` |
| `type_counts`, `new_cards` (inside `seats`) | A seat's type counts (R12.1) and cards marked new (R18.10) |
| `quest_list_excludes` | Quests that must not be in the quest list |
| `away`, `out_of_time`, `time_bank_shown`, `known_in_hand` (inside `view`) | Whether a seat is shown as away or out of time (R9.10), a bank as shown in whole seconds, and marketplace cards known to be in a hand (M3.3) |
| `quests_completed_last_turn` (inside `view`) | Each quest completed in the turn before, with the `seats` that completed it (R19.6) |
| `vote_answers` (inside `view`) | During an abandon vote: `answered` and `of`, the only things the view holds about other players' answers (M7.5) |
| Marker values | `none` (no game record), `kept` and `removed` (a replay record), `closed` and `deleted` (a room), `ended` (the tutorial), `unchanged` (ratings), `open` and `closed` (a vote) |
| `room` (in `then`) | Besides the `given` room fields: `code_format` (the allowed characters) and `chat_last` (the last chat message) |
| `tutorial_room`, `generated_name`, `connected_tab`, `chat_count`, `view_chat`, `view_lobby`, `ranking_page`, `record_usernames`, `replay_record` (`kept` or `removed`), `saved_before_shown`, `rules_viewer`, `rulebook_covers` | The tutorial room, a generated username, which tab holds the game, chat as stored and as one player sees it, the lobby as one player sees it, a page of the ranking table, usernames shown in records, whether a replay record exists, chat saved before shown, the rules viewer, and the R sections the rulebook covers |
| `room`, `game`, `lobby_rooms`, `queue`, `match`, `accounts`, `players_online`, `chat`, `notified`, `emails_sent`, `logged_in`, `match_history`, `ranking`, `menu`, `card_set`, `card_detail` | The expected state of rooms, accounts, the lobby and client screens |
| `view` | What one seat's view shows: `{seat: 2, of_seat: 1, stats: {...}, hand_count: 5, contains: [...], hides: [...]}` |
| `message_to` | That a seat or player was sent a particular notice or text; the `timed_out` notice has `in_a_row` and `of` in a ranked game, and `keep_playing: true` in a casual game (R9.11) |
| `log_contains`, `log_excludes` (inside `view`) | Public game-log entries that must or must not appear: draws (M3.3), and what a player did in a main phase (M3.7) as `played` (a card), `completed_quest`, `completed_project`, `influence` (a trade) or `redrew` (how many redraws of the starting hand, R17.12), each with `seat` and optionally `turn` |
| `discard_count` (inside `view`) | The number of cards in the discard pile as the seat sees it (R5.5); the view never holds which cards they are (M3.2), checked with `hides: [discard_cards]` |
| `ended` | The game has ended: `winner`, `places` (seats, 1st first), `scores`, `bonus_type_points`, or `abandoned: true` |
| `record` | The saved game record (A3) |
| `ratings` | ELO ratings after the game (A10) |
| `tutorial_step` | The tutorial step the player is on (T…) |

A scenario passes when every field in `then` matches exactly. Fields not mentioned are not
checked, at any depth: inside an object, only the keys the scenario writes are compared. A list
is compared whole, in order and with its length; `seats` lists only the seats it checks.

### Example

```yaml
- name: rejects a tier 3 card before turn 5
  covers: [R6.1]
  given:
    turn: 4
    seats:
      - seat: 1
        stats: {funds: 20}
        hand: [Small Apartment, Garden Skyscraper]
  when:
    - {seat: 1, action: play_card, card: Garden Skyscraper}
  then:
    rejected: tier_not_allowed
    unchanged: true
```

## Actions

| Action | Details | Rule |
|---|---|---|
| `play_card` | `card` | R6 |
| `sell` | `cards` (one or more) | R5.1 |
| `claim_all` | | R12.6 |
| `influence` | `trade` (one of the names below), and for the draw actions `draw_tier_1` to `draw_tier_3` also `kind` | R15 |
| `complete_project` | `project`: `quality`, `satisfaction` or `workforce` | R16 |
| `complete_quest` | `quest` | R19.5 |
| `undo` | | R7 |
| `end_turn` | | R8 |
| `turn_draw` | `option: A` with `card`, or `option: B` with `sector` | R18.8 |
| `redraw_hand` | | R17.12 |
| `leave_game` | | M6 |
| `call_vote`, `vote` | `vote`: `yes` or `no` | M7 |
| `create_room`, `join_room`, `leave_room`, `change_size`, `accept_game`, `decline_game`, `ask_rematch` | room details | M1, M8 |
| `join_queue`, `change_sizes`, `leave_queue`, `confirm_match`, `decline_match` | `sizes` for joining and changing: a list of 2, 3 and 4 (joining without it means 3 only) | A8 |
| `create_guest`, `sign_up`, `confirm_email`, `log_in`, `log_out`, `reset_password`, `set_new_password`, `change_email`, `change_username`, `delete_account` | account details. `confirm_email` opens the newest confirmation link sent for the player; `set_new_password` opens the newest reset link in that visitor's browser and sets `password`; `delete_account` without `password` gives the account's own | A1, A2 |
| `send_chat`, `mute`, `unmute` | `text`, `player_to_mute`, `player_to_unmute` | A11 |
| `start_tutorial`, `leave_tutorial`, `continue` | | C4, T |
| `open_site`, `open_lobby`, `open_game`, `open_menu`, `open_rules`, `open_card_set`, `open_card`, `filter_cards`, `search_cards`, `open_match_history`, `open_ranking`, `ask_generated_name` | screen details: `from` (where the menu is opened), `tab`, `card`, `sector`, `tier`, `type`, `text`, `of` (whose history), `jump_to_me` | A4–A7, C1–C3, M5.1 |

Influence trades are the names of the lines of `spec/influence-actions.txt` with their spaces
written as underscores (R15.5), in the order of the file: `influence_to_funds`, `buy_build_pass`,
`draw_tier_1` and so on. A draw action also takes `kind`. A scenario that names a trade the file
no longer has fails the harness check.

## Reason codes

Every rejected action gives exactly one of these codes and changes nothing, except `out_of_time`,
which also applies the player's time-out (R9.6).

When several codes apply, the first one in this order wins:

1. `malformed_message`, `unknown_action`, `wrong_protocol_version`
2. `invalid_token`, `stale_state`
3. `not_in_game` (including a player who left), `game_over`
4. `not_this_step`
5. `out_of_time`
6. `wrong_phase`, `out_of_market`, `not_your_go`, `already_done`
7. `action_limit_reached`, the daily limits, `rejoin_too_soon`, `busy_elsewhere`, `human_check_failed`
8. whether the thing exists or is free: `card_not_in_hand` (also for the same card named twice),
   `card_not_in_marketplace`, `marketplace_empty`, `quest_not_on_table`, `room_not_found`,
   `room_full`, `room_not_waiting`, `no_vote_open`, `nothing_to_undo`, `nothing_to_claim`; for
   option A of a turn draw, `marketplace_empty` before `card_not_in_marketplace`
9. every other rule-specific code; for playing a card, in the order of R6.1: `tier_not_allowed`,
   `no_build_pass`; for influence actions, `trade_limit_reached` before `no_card_of_kind`; for a
   redraw, `redraw_too_late` before `no_redraw_left`
10. `not_enough_funds`, `cannot_afford_trade`

**Messages and identity**

| Code | When |
|---|---|
| `malformed_message` | The message cannot be read, or a field is missing or of the wrong kind |
| `unknown_action` | The action name does not exist |
| `wrong_protocol_version` | The client speaks an older or unknown protocol version |
| `invalid_token` | The player token is unknown or forged |
| `stale_state` | The action was based on an older state version for that player |
| `not_in_game` | The player has no seat in this game, or has left it |

A repeated action id is not rejected: it returns the original result again.

**Timing and phases**

| Code | When |
|---|---|
| `wrong_phase` | The action is not possible in the current phase |
| `not_your_go` | In the market phase, it is another player's go |
| `already_done` | The player is already done this main phase |
| `out_of_time` | The message arrived at or after the player's deadline (R9.6) |
| `action_limit_reached` | The player already took 50 main-phase actions this turn (R5.3) |
| `game_over` | The game has ended |

**Playing cards and selling**

| Code | When |
|---|---|
| `card_not_in_hand` | The card is not in the player's hand |
| `not_enough_funds` | The player cannot pay the real cost |
| `tier_not_allowed` | A tier 2 or 3 card before turn 5 |
| `no_build_pass` | A card played with no build pass left (R6.1) |
| `redraw_too_late` | A redraw of the starting hand after turn 1 or after the player's first action (R17.12) |
| `no_redraw_left` | A fourth redraw of the starting hand (R17.12) |

**Combos, influence, projects, quests and undo**

| Code | When |
|---|---|
| `nothing_to_claim` | Claim all with no combo ready |
| `trade_limit_reached` | The influence action was used as often as allowed |
| `cannot_afford_trade` | The player lacks something the trade costs |
| `no_card_of_kind` | No card of that kind and tier in the deck or discard pile as the player sees them |
| `project_already_completed` | The player already completed this project |
| `project_needs_not_met` | Not enough of the stat, less than 10 income, or a negative stat (R16.2) |
| `quest_not_on_table` | The quest is not on the quests table |
| `quest_already_completed` | The player already completed this quest |
| `quest_needs_not_met` | The requirement is not met |
| `nothing_to_undo` | No action to undo |
| `cannot_undo` | The latest action cannot be undone (R7.2–R7.4) |

**Market phase**

| Code | When |
|---|---|
| `out_of_market` | The player has already had their market go this turn |
| `card_not_in_marketplace` | The card is not in the marketplace |
| `marketplace_empty` | Option A when the marketplace is empty |

**Votes, rooms and rematches**

| Code | When |
|---|---|
| `vote_not_allowed` | A vote in a ranked game |
| `vote_too_soon` | A vote within 5 turns of the last one |
| `vote_already_open` | A vote while another is open |
| `no_vote_open` | Voting when no vote is open |
| `vote_already_answered` | Answering a vote twice, or the caller answering their own vote (M7.6) |
| `room_not_found` | No room has that code |
| `room_full` | The room has no free place |
| `room_not_waiting` | The room's game has already started |
| `not_room_owner` | Only the owner can do this |
| `room_size_too_small` | The new size is less than the players in the room |
| `invalid_room_size` | A size other than 2, 3 or 4 |
| `invalid_game_sizes` | No game size chosen for the ranked queue, or a size other than 2, 3 or 4 (A8.2, A8.3) |
| `not_asking` | Accepting or declining when no game start or rematch is being asked (M1.10, M8.4) |
| `rejoin_too_soon` | Rejoining within 2 minutes of not accepting (M1.11, A8.9) |
| `username_in_room` | Joining a room where a player has the same username, capital letters ignored (M1.6) |
| `busy_elsewhere` | The player is already waiting in a room, in the queue or in a game (M2) |
| `rematch_not_possible` | Fewer than 2 players in the room, its game has not ended, or a rematch is already being asked |

**Limits, accounts and chat**

| Code | When |
|---|---|
| `daily_action_limit` | The player reached 2,000 actions today (A9.2) |
| `daily_game_start_limit` | The player started 10 games today (A9.3) |
| `site_game_limit` | 50 games started on the site today (A9.4) |
| `site_daily_cap` | A site-wide daily cap on tutorials, chat messages or emails is reached (A9.6) |
| `human_check_failed` | The human check is missing or failed (A1.12) |
| `username_taken` | The username is in use |
| `username_invalid` | The username breaks A2.1 |
| `username_reserved` | "Deleted player" (A2.3) |
| `username_change_too_soon` | A change within 7 days of the last (A2.4) |
| `email_invalid` | Not an email address |
| `password_invalid` | Shorter than 8 or longer than 64 characters |
| `login_failed` | Wrong username, email or password |
| `email_not_confirmed` | The action needs a confirmed email address |
| `email_limit_reached` | 3 emails today for this account or address (A1.9) |
| `not_registered` | The action needs a registered user |
| `password_wrong` | Deleting an account with a password that is not the account's (A1.15) |
| `link_expired` | An email link that expired, was replaced or used, or whose address another account confirmed (A1.16) |
| `message_empty` | An empty chat message |
| `message_too_long` | Over 200 characters or 800 bytes |
| `chat_too_fast` | Within 2 seconds of the player's last message |
| `chat_room_limit` | The player already sent 100 messages in this room |
| `player_not_in_room` | Muting someone who is not another player in the room (A11.7) |
| `not_this_step` | In the tutorial, an action other than the one the step asks for (C4.4) |

## Checking the harness itself

`npm run harness:check` checks the harness files before any game code exists, and regenerates
`coverage.md`. It reports every problem with its file and scenario name, and fails when:

- a YAML file cannot be read
- a scenario does not match `scenario-format.yaml`, or uses a field this file does not explain
- two scenarios in one file have the same name
- a scenario names a card, quest or type that does not exist, or covers a rule that does not exist
- a scenario uses an action, influence trade or reason code not listed in this file
- a link in the rulebook points to a section that does not exist
- a rule has no scenario and no approved exception

The same check reads the two rule files, `spec/quests.txt` (R20.8) and
`spec/influence-actions.txt` (R15.5), and fails, naming the file, the line number and the wrong
word, when:

- a line does not have its four parts, or a part does not follow the format exactly (a typo, a
  missing number or limit, an empty line, a broken line)
- a word names a sector, type or stat that does not exist
- two lines have the same name
- `quests.txt` has fewer than 4 tier 1 quests (R19.3)
- a quest the tutorial needs (T0.7) is missing or no longer has its tier, requirement and reward
- `influence-actions.txt` has two draw actions for the same tier
- an influence action is of a kind the game or the screen has no code for: the message reads
  "needs new code" and names the action (R15.6)
- a quest reward gains more than 1 type: the message reads "needs new code" (R20.8)
- a scenario names a quest or an influence action the files do not have

So a list the game cannot handle can never be deployed: `npm run check` runs before every
merge and deploy.

## What must pass now: `required.yaml`

Version 1 is built phase by phase, and each phase makes part of the harness required.
`required.yaml` lists what must pass now, in three lists:

- `scenarios`: per scenario file (named without `.yaml`), the exact names of its scenarios
- `invariants`: ids from `invariants.yaml`
- `budgets`: ids from `budgets.yaml`

The check fails when anything on the list fails or cannot run yet, or when a name on the list
does not exist. Everything else is still run and shown in `report.html` as "not yet" or "passes,
not yet required", and does not fail the check. Each phase adds the names its phase file lists;
names leave the list only with the owner's approval. When version 1 is done, everything is on the
list.

## What passing means

The game passes the harness when all of these are true:

0. `npm run harness:check` reports no problems.

1. Every scenario in `scenarios/` passes. Scenarios in `scenarios/proposed/` are run and reported
   but do not count until the owner accepts them.
2. Every invariant in `invariants.yaml` holds after every action in the random simulated
   games of `npm run harness` and of `npm run check`; the game counts live only in
   `tools/harness-runner/SIMULATED_GAMES.ts` (decision D25). A failure reports the shortest seed and action list that reproduces it.
3. No message to any player contains a card that is hidden from that player (the leak test).
4. Every budget in `budgets.yaml` is met.
5. Every rule in the spec files is covered by at least one scenario in `coverage.md`, or is
   marked there by the owner as checked another way (for example by a screenshot or a budget).
6. The browser tests run 2–4 players through full games, refreshes, disconnects and a second tab,
   and save screenshots to `screens/`.
7. The checks that `coverage.md` lists instead of scenarios all pass:
   - a card-data check: `cards.json` has 240 cards, each with a sector, tier, cost, stat numbers,
     types and combos, and the costs and product or distribution per tier match R3.5
   - a statistical check: over 100,000 simulated draws per turn, the share of each tier matches
     R17.10 to within 1 percentage point
   - a rating calculation check: the formula of A10 gives the expected totals, including a total
     of exactly +2.5 rounding to +3 and −2.5 to −3
   - a replay export check: a running and an ended room are exported and replay exactly (M4.2)

`report.html` shows the result of each of these after every run.
