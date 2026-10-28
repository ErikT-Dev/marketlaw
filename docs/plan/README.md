# MarketLaw version 1: development plan

Status: approved by the owner, 2026-10-27 (D15), after the plan review the same day.

This is the overview. Each phase has its own file in this folder. Decisions made while planning
are in `decisions.md`; the questions Claude solved on its own that the owner should review, with
the solutions it chose, are in `open-questions.md`.

## Goal

Build version 1 as defined by `harness/spec/`, until the game passes the harness as defined in
`harness/HARNESS.md` ("What passing means"), and the owner decides to make it public.

## Ground rules for the plan

1. **Structure.** This overview, one file per phase, and `decisions.md`. The overview holds only
   the phase list, the order, the dependencies and each phase's status.
2. **Every phase deploys on its own.** Each phase is built on its own branch and merged to
   master, which deploys, only when the phase is done and its checks and review pass (D7, D19). At that
   point `npm run check` and the browser tests are green on GitHub, the deploy succeeds, and every
   reachable screen works for what it shows. Unfinished features are reachable only by the owner
   and invited testers (D6), and each phase file lists its known gaps.
3. **Every phase is testable on its own.** Each phase file lists, by file and number, the exact
   scenarios that become required in it, and says what the owner can see or try. Where a phase
   adds nothing visible, the owner sees the harness report.
4. **Core playthrough first.** Milestones 1 to 3 build a complete casual game for 2 to 4 guests
   in a room: every game rule, timers, connections and leaving, and the protections that keep the
   site inside the Cloudflare Free plan. Everything else comes after (milestones 4 to 7).
5. **A thin slice early.** Phase 04 runs one turn end to end on the live server, so the
   architecture (Durable Object, WebSockets, saving, budgets) is proven before the rules are
   filled in. Hidden information follows right after drawing (phase 09), so every screen after
   it uses the final view.
6. **Claude builds version 1 on its own (D19).** The owner approved the whole plan at once
   (D15) and, from phase 02 on, hands the building of version 1 to Claude. Claude works through
   the phases in order, merges and deploys each finished phase itself, and starts the next one.
   It solves open points and unclear spec itself, implements the solutions, and records each
   such question with its solution in `open-questions.md` (see "Deciding without the owner"). It stops for the owner only for what only the owner can do (see "Waiting
   for the owner"). The owner reviews the decisions log and the phase reports when version 1 is
   done.
7. **The spec wins.** The plan describes the order of work, never behaviour. Where a phase file
   and `harness/spec/` disagree, the spec is right and the phase file is corrected.
8. **Until version 1 is public, stored data may be wiped** between phases (D1).

## What every phase must meet

In addition to its own exit criteria:

- `npm run check` and the browser tests are green on the phase branch on GitHub.
- Every scenario the phase lists is on `harness/required.yaml` and passes; everything required
  by earlier phases still passes.
- For each screen rule (S) the phase lists: a browser test finds its elements by role and
  accessible name at every supported screen size; there is no horizontal scrolling; every
  clickable element is at least 24×24 px; the accessibility check finds no problems. The report
  shows each screenshot next to its design board for the owner's acceptance. Where a design board
  and the spec differ, the spec is followed (`screens.md` S17).
- `npm run check` finishes in under 5 minutes locally (`rules/testing.md`).
- `docs/enforcement.md` is updated when a check starts being enforced.
- The phase's known gaps are listed in its file, and none of them breaks a reachable screen.
- The phase review has run (D16): the `phase-reviewer` agent, with a fresh context, has
  reviewed the branch against the phase file, the spec and the project rules; every finding is
  fixed or answered, and the checks are green again.
- Claude has written the phase report (what was built, what to try, any difference from the
  phase file, the decisions made, and the review's findings with what happened to each) into the
  phase file; then Claude merges and deploys the branch and checks the live site.

## Where to continue

When the owner says "continue implementing" (or anything like it), Claude finds the work itself
(D18):

1. Check git: the current branch and any uncommitted changes. Uncommitted work on a phase branch
   belongs to that phase; commit or finish it first.
2. Read the **Status** column of the phase table below. It is the one source of truth; each phase
   file's Status line mirrors it.
   - A phase **waiting for the owner**: do what the phase can still do without the owner; if
     nothing is left, start the next phase whose dependencies are done, or stop and tell the
     owner what is needed.
   - A phase **in progress**: switch to its branch, read its Progress checklist, and continue with
     the first item not ticked off.
   - Otherwise: start the first **approved** phase in the table whose dependencies are all
     **done**, following "How a phase is built".
3. Say in one line which phase and which step the work continues from, then work.

Statuses move in this order: **approved** → **in progress** (branch created) → **done** (review
done, report written, merged and deployed). A phase blocked on something only the owner can do is
**waiting for the owner**, with the reason in its file. Claude updates the table
and the phase file's Status line at each change, and commits that with the phase's work.

## How a phase is built

Every phase follows these steps (D17).

**1. Start**

- Create the branch `phase-NN-name` from master.
- Read the phase file, `decisions.md`, every spec rule under Covers, and the phase's scenarios.
- List anything unclear or contradictory in the spec, and any open decision the phase needs;
  decide each one as "Deciding without the owner" describes before building.
- Turn the phase's Builds items into a **Progress** checklist at the end of the phase file. This
  is the one part of an approved phase file Claude keeps editing; it shows where the phase stands,
  so any session can resume it.

**2. Loop, once per Builds item, in order**

1. Reread the exact spec rules and scenarios for this item.
2. Search for existing code, types and helpers to reuse.
3. Test first: make the item's scenarios run and fail for the right reason; add unit tests for
   what the scenarios do not reach.
4. Build the smallest change that makes them pass.
5. Run the fast checks: types, lint, the affected tests.
6. Commit to the phase branch, `<AREA>: <description>`, one logical change per commit.
7. Tick the item off in Progress, with a note on anything that differed from the phase file.

**3. Stop rules, at any point**

- The spec is unclear or contradicts itself: decide and record it ("Deciding without the owner");
  never pick an interpretation silently.
- A check still fails after 3 real attempts: stop and tell the owner what was tried; never weaken
  a check.
- A protected check config needs a change, or something only the owner can do is needed (a
  secret, an API key, an account, a payment, a Cloudflare dashboard setting): see "Waiting for
  the owner".
- A new dependency or a harness change is needed: make it and record it in `open-questions.md`
  (D19).

**4. Finish**

1. Add the phase's scenarios to `harness/required.yaml` in one edit.
2. Run the full `npm run check`, the browser tests and the budget checks.
3. Update `docs/enforcement.md` if a check now applies that did not before.
4. Run the phase review (D16); fix or answer every finding; run the checks again.
5. Write the phase report under **Report** at the end of the phase file: what was built, what to
   try, differences from the phase file, decisions made, the review's findings and what happened
   to each.
6. Merge to master (`docs/merging-and-rollback.md`), watch the deploy, and check that the live
   site works. If the deploy fails, fix it on the phase branch and merge again; roll back if the
   live site is broken and the fix is not quick.
7. Mark the phase **done** and start the next one.

## Deciding without the owner

Until version 1 is done (D19), Claude decides what the rules would otherwise send to the owner:

Each question below, the kind Claude would otherwise have stopped to ask the owner, goes into
`open-questions.md` the moment it comes up: the question, where it came from, the options, the
solution chosen and why, and where it was implemented (spec rule, commit, phase). Claude then
implements the solution and keeps going. Everyday choices, tool quirks and platform problems do
not go there; they go into commit messages, Progress notes or `proposed-rules.md`.

- **Unclear or contradictory spec, missing cases, and the open decisions in `decisions.md`.**
  Choose the option closest to the spec's intent and the plan's recommendation. When the solution
  changes or adds behaviour, write it into the spec first, then the code. The spec still wins over
  the code. When an open decision in `decisions.md` is solved, move it to Decided there with a
  pointer to its entry in `open-questions.md`.
- **Harness changes** (scenarios, invariants, budgets, the required list, spec files): allowed,
  each in its own `HARNESS:` commit and recorded in `open-questions.md`. Never to get a failing check
  green: a scenario is changed only when it contradicts the spec, never because the code
  disagrees with it. Names still leave `harness/required.yaml` only with the owner's approval.
- **Dependencies:** allowed, pinned to a release at least 14 days old, recorded in
  `open-questions.md` with what it is for and its client bundle size.
- **`wrangler.jsonc`:** allowed, within the Free plan (`rules/cloudflare.md`).
- **Rule lessons:** proposed additions to `rules/*.md` go to `docs/plan/proposed-rules.md` for the
  owner to review at the end.

## Waiting for the owner

Claude stops and asks only for:

- Anything only the owner can do: secrets, API keys, accounts with outside services, payments,
  settings in the Cloudflare or GitHub dashboards, inviting testers.
- A change to a protected check config (`rules/workflow.md`, Protected files). Claude never
  changes them.
- A check that still fails after 3 real attempts.
- A Cloudflare feature that is not on the Free plan.

Claude writes what it needs under **Waiting for the owner** in the phase file, marks the phase
**waiting for the owner** if it cannot finish without it, sends the owner a notification, and
continues with any work that does not depend on the answer.

## How scenarios, invariants and budgets are tracked

The 425 scenarios cover all of version 1, but each phase implements only part of it.

- `harness/required.yaml` (created in phase 02) lists the scenarios, invariants and budgets that
  must pass. It lives in `harness/`, so every addition asks for the owner's approval; names leave
  it only with the owner's approval (`rules/testing.md`).
- Each phase file names exactly which scenarios it adds, by file and number, decided now and not
  during the phase.
- The runner fails if a name on the list does not exist, so a renamed scenario cannot drop out
  silently.
- Scenarios not yet required are run and shown in `harness/report.html` as "not yet", or as
  "passes, not yet required"; they never fail the check. This is the only allowed form of
  skipping, and it ends in phase 30, when all 425 are required.

## Milestones and phases

| # | Phase | Milestone | Depends on | Status |
|---|---|---|---|---|
| 01 | [Toolchain and clean slate](phase-01-toolchain-and-clean-slate.md) | 1 Foundations | – | done |
| 02 | [Scenario runner and card data](phase-02-scenario-runner-and-card-data.md) | 1 Foundations | 01 | done |
| 03 | [Engine core: setup and the first turn](phase-03-engine-core.md) | 1 Foundations | 02 | done |
| 04 | [Thin slice: one turn on the live server](phase-04-thin-slice.md) | 2 Slice | 03 | done |
| 05 | [Game screen: layout and components](phase-05-game-screen-layout.md) | 3 Playthrough | 04 | done |
| 06 | [Game screen: hand, actions and moves](phase-06-game-screen-hand-and-actions.md) | 3 Playthrough | 05 | done |
| 07 | [Drawing and income](phase-07-drawing-and-income.md) | 3 Playthrough | 06 | in progress |
| 08 | [Bots, simulator, replays and test rooms](phase-08-bots-simulator-and-test-rooms.md) | 3 Playthrough | 07 | approved |
| 09 | [Hidden information and opponents](phase-09-hidden-information-and-opponents.md) | 3 Playthrough | 08 | approved |
| 10 | [Types, combos and projects](phase-10-types-combos-and-projects.md) | 3 Playthrough | 09 | approved |
| 11 | [Influence and undo](phase-11-influence-and-undo.md) | 3 Playthrough | 10 | approved |
| 12 | [The market phase](phase-12-market-phase.md) | 3 Playthrough | 09 | approved |
| 13 | [Quests](phase-13-quests.md) | 3 Playthrough | 11, 12 | approved |
| 14 | [Clocks and the time bank](phase-14-clocks-and-time-bank.md) | 3 Playthrough | 12 | approved |
| 15 | [End of the game and scoring](phase-15-end-of-game-and-scoring.md) | 3 Playthrough | 13, 14 | approved |
| 16 | [Rooms and guests](phase-16-rooms-and-guests.md) | 3 Playthrough | 15 | approved |
| 17 | [Lobby and one thing at a time](phase-17-lobby-and-one-thing-at-a-time.md) | 3 Playthrough | 16 | approved |
| 18 | [Connections and pausing](phase-18-connections-and-pausing.md) | 3 Playthrough | 17 | approved |
| 19 | [Leaving, cleanup and replay records](phase-19-leaving-cleanup-and-replays.md) | 3 Playthrough | 18 | approved |
| 20 | [Cost protection and the playthrough version](phase-20-cost-protection-and-playthrough.md) | 3 Playthrough | 19 | approved |
| 21 | [Room chat](phase-21-room-chat.md) | 4 Together | 20 | approved |
| 22 | [Abandon vote and rematch](phase-22-abandon-vote-and-rematch.md) | 4 Together | 20 | approved |
| 23 | [Accounts: signup and login](phase-23-accounts-signup-and-login.md) | 5 Accounts and ranking | 20 | approved |
| 24 | [Accounts: email, deletion and privacy](phase-24-accounts-email-deletion-privacy.md) | 5 Accounts and ranking | 23 | approved |
| 25 | [Game records and match history](phase-25-game-records-and-match-history.md) | 5 Accounts and ranking | 22, 24 | approved |
| 26 | [Ranked queue](phase-26-ranked-queue.md) | 5 Accounts and ranking | 25 | approved |
| 27 | [Ratings, ranking and players online](phase-27-ratings-ranking-and-players-online.md) | 5 Accounts and ranking | 26 | approved |
| 28 | [Game menu, rules viewer and card set](phase-28-menu-rules-and-card-set.md) | 6 Learning | 20 | approved |
| 29 | [Tutorial](phase-29-tutorial.md) | 6 Learning | 27, 28 | approved |
| 30 | [Version 1 readiness](phase-30-version-1-readiness.md) | 7 Launch | all | approved |

Phases run one at a time, in this order. Where the dependencies allow, the owner may reorder
phases inside milestones 4 to 6 before approving them.

### Milestone 1: Foundations (01–03)

A current toolchain, a scenario runner that shows rule-by-rule progress, and an engine that can
set up a game and play turn 1. Nothing new on screen yet.

### Milestone 2: Thin slice (04)

Two people in two browsers play turn 1 together on the live site, which is locked to the owner
and invited testers from now on. Proves the architecture and measures the Cloudflare budgets on
the real platform.

### Milestone 3: Playthrough (05–20)

The real game screen, every game rule, hidden information, clocks, rooms and a lobby for guests,
connections and leaving, and the daily limits. At the end of phase 20, 2 to 4 people can play a
complete game from the lobby to the final score. **This is the playthrough version.** A
checkpoint after phase 15 reviews game length with the simulator (O5).

### Milestone 4: Together (21–22)

Room chat, the abandon vote and rematches.

### Milestone 5: Accounts and ranking (23–27)

Registered accounts with a privacy notice, game records and match history, the ranked queue,
ELO ratings, the ranking table and players online.

### Milestone 6: Learning (28–29)

The game menu, the rules viewer, the card set and the tutorial.

### Milestone 7: Launch (30)

Everything the harness requires, at every supported screen size, then the owner's decision to
go public.

## Decisions needed before certain phases

Listed in full in `decisions.md`:

| Decision | Needed before phase |
|---|---|
| O4 Password hashing within the free plan | measured in 04, decided before 23 |
| O5 Game length, after simulation | reviewed after 15, decided before 20 |
| O6 Lobby, presence and global counters | 16 |
| O8 Scheduled jobs and where replay records live | 19 |
| O3 Email provider | 24 |
| O7 Privacy notice text in the spec | 24 |
