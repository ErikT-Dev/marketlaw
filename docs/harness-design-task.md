# Task: Design the test harness for a multiplayer card game

You are designing the **harness**: the human-owned, human-readable definition of how the game
must behave. A separate coding agent will later implement the game and a test runner that
executes this harness. The project owner does not read code; the harness is how they control and
verify the game. **Do not write implementation or test code.**

## Context
- Browser-based, turn-based multiplayer card game with large hidden hands.
- TypeScript; authoritative server (one Cloudflare Durable Object per room) on the Cloudflare Free plan.
- Coding rules the implementation will follow are in this repository (`CLAUDE.md`,
  `rules/*.md`). Read them so the harness matches them (especially `rules/testing.md`,
  `rules/multiplayer.md`, `rules/cloudflare.md`).
- Game logic files from the owner:
  - `harness/spec/game-rules.md`: the reviewed rules of the game, drafted from the old
    single-player game (backend in `D:\03. Code\Marek`, frontend in `D:\03. Code\marek-web`)
  - `harness/spec/cards.json`: the card data, a copy of the old game's
    `MarekData.json` with one name's trailing space removed
  - `docs/screens-draft.md`: what each screen shows (still a draft)

## Process
1. Read the game logic files and the rules folder.
2. **Before writing anything, list every ambiguity, contradiction and missing case** you find
   (empty deck, no legal move, ties, simultaneous effects, disconnects, ...), and ask me to
   resolve them. Never invent a rule. Anything still unresolved goes under `## Open questions`
   in the relevant spec file. `game-rules.md` has already been through three reviews; splitting
   and numbering it must not change any rule.
3. Then produce the files below.

## Deliverables (in `harness/`)
- `HARNESS.md`: what each file is for, the scenario format, who owns what (the owner owns
  everything here; the coding agent may only add to `scenarios/proposed/`), and what "passing" means.
- `spec/glossary.md`: exact definitions of every game term. Use these terms consistently everywhere.
- `spec/overview.md`: the pitch, player count, game length, what is out of scope for version 1.
- `spec/cards.json`: every card as data (id, name, sector, tier, cost, stat numbers, types,
  combos). Already exists; changes only with the owner's approval.
- `spec/game-rules.md`: setup, turn structure, phases, legal plays, effects, scoring, game end,
  tie-breaks and edge cases. **Every rule numbered** (`R4.2`).
- `spec/multiplayer.md`: room size, joining, turn order, timers, being away, abandonment,
  rematch, and what each player can and cannot see. Numbered rules (`M2.1`).
- `spec/accounts.md`: guest and registered users, usernames, email, logins, game records, match
  history, ELO rating and ranking table, lobby, ranked queue, daily limits and chat. Numbered
  rules (`A2.1`).
- `spec/client.md`: the game menu, rules viewer, card set and tutorial. Numbered rules (`C2.1`).
- `spec/rulebook.md`: the plain-language rulebook players read in the rules viewer. It explains
  every section of `game-rules.md` and nothing else; no rule numbers.
- `spec/tutorial.md`: the tutorial script, step by step, with the fixed setup and the state after
  every step. Numbered steps (`T2.1`).
- `spec/screens.md`: what each screen shows, moved from `docs/screens-draft.md` once it is
  final. Numbered rules (`S2.1`). Checked by the Playwright screenshots.
- `scenarios/*.yaml`: concrete Given/When/Then cases grouped by topic. Each has `name`,
  `covers: [R4.2]` (or `M`, `A`, `C`, `S` rules and `T` tutorial steps), `given` (minimal explicit state), `when` (actions by player),
  `then` (expected state, rejection reason code, or what a specific player's view contains/hides).
  Cover every numbered rule, every edge case, and hostile-client cases (out of turn, card not
  held, duplicate or stale action, malformed input).
- `invariants.yaml`: properties that must hold after every action in random simulated games
  (card conservation, no duplicates, game terminates, no hidden information in any player's
  view, ...).
- `budgets.yaml`: limits per game and per client (Durable Object rows written, incoming messages,
  initial bundle MB, move latency ms), with a one-line justification each, derived from the
  Cloudflare Free plan limits and the expected game length.
- `coverage.md`: a table of each numbered rule against the scenarios that cover it; flag any gaps.

## Format rules
- Plain Markdown and YAML only. Short, precise, readable by a non-programmer in minutes per file.
- Define one YAML scenario schema in `HARNESS.md` and use it exactly, everywhere.
- Use a fixed seed or a fully explicit deck order wherever randomness matters.
- Rejections use named reason codes (`not_your_turn`, `card_not_in_hand`, ...); list them all in
  `HARNESS.md`.
- Describe behaviour, never implementation (no function names, classes or endpoints).

## Finish with
A short summary: the files created, the number of rules and scenarios, the coverage gaps, and
the open questions still waiting for my decision.
