# MarketLaw version 1: development plan

Status: approved by the owner, 2026-10-27 (D15), after the plan review the same day.

This is the overview. Each phase has its own file in this folder. Decisions made while planning
and building are in `decisions.md`.

## Goal

Build version 1 as defined by `harness/spec/`, until the game passes the harness as defined in
`harness/HARNESS.md` ("What passing means"), and the owner decides to make it public.

## Ground rules for the plan

1. **Structure.** This overview, one file per phase, and `decisions.md`. The overview holds only
   the phase list, the order, the dependencies and each phase's status.
2. **Every phase deploys on its own.** Each phase is built on its own branch and merged to
   master, which deploys, only when the phase is done and the owner accepts it (D7). At that
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
6. **Approval: once up front, then one go-ahead per phase.** The owner approved the whole plan
   at once (D15). That approves the dependencies, secrets, protected-file changes and
   `harness/required.yaml` additions each phase file names. Claude then works through the phases
   in order without asking before each one. When a phase is done, Claude reports what was built,
   what to try, and anything that differed from the phase file; the owner gives the go-ahead, the
   branch is merged and deployed, and the next phase starts. Claude asks in between only for
   the open decisions, for anything a phase file does not name (a new dependency, secret,
   protected-file or harness change), and when the spec is unclear or contradicts itself.
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
- Claude has reported the phase (what was built, what to try, any difference from the phase
  file, and the review's findings with what happened to each) and the owner has given the go-ahead; then the branch is merged and deployed.

## Where to continue

When the owner says "continue implementing" (or anything like it), Claude finds the work itself
(D18):

1. Check git: the current branch and any uncommitted changes. Uncommitted work on a phase branch
   belongs to that phase; commit or finish it first.
2. Read the **Status** column of the phase table below. It is the one source of truth; each phase
   file's Status line mirrors it.
   - A phase **awaiting go-ahead**: do not start anything else. Remind the owner what is waiting
     (the phase report in short) and ask to confirm the merge.
   - A phase **in progress**: switch to its branch, read its Progress checklist, and continue with
     the first item not ticked off.
   - Otherwise: start the first **approved** phase in the table whose dependencies are all
     **done**, following "How a phase is built".
3. Say in one line which phase and which step the work continues from, then work.

Statuses move in this order: **approved** → **in progress** (branch created) → **awaiting
go-ahead** (review done, report given) → **done** (merged and deployed). Claude updates the table
and the phase file's Status line at each change, and commits that with the phase's work.

## How a phase is built

Every phase follows these steps (D17).

**1. Start**

- Create the branch `phase-NN-name` from master.
- Read the phase file, `decisions.md`, every spec rule under Covers, and the phase's scenarios.
- List anything unclear or contradictory in the spec, and any open decision the phase needs; ask
  the owner about all of them in one message before building.
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

- The spec is unclear or contradicts itself: stop and ask; never pick an interpretation.
- A check still fails after 3 real attempts: stop and report what was tried; never weaken a check.
- Something the phase file does not name is needed (a dependency, secret, protected-file or
  harness change): stop and ask.

**4. Finish**

1. Add the phase's scenarios to `harness/required.yaml` in one edit.
2. Run the full `npm run check`, the browser tests and the budget checks.
3. Update `docs/enforcement.md` if a check now applies that did not before.
4. Run the phase review (D16); fix or answer every finding; run the checks again.
5. Report to the owner: what was built, what to try, differences from the phase file, the
   review's findings and what happened to each.
6. Ask the owner to confirm the merge. Only after confirmation: merge to master, watch the
   deploy, and check that the live site works.

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
| 01 | [Toolchain and clean slate](phase-01-toolchain-and-clean-slate.md) | 1 Foundations | – | approved |
| 02 | [Scenario runner and card data](phase-02-scenario-runner-and-card-data.md) | 1 Foundations | 01 | approved |
| 03 | [Engine core: setup and the first turn](phase-03-engine-core.md) | 1 Foundations | 02 | approved |
| 04 | [Thin slice: one turn on the live server](phase-04-thin-slice.md) | 2 Slice | 03 | approved |
| 05 | [Game screen: layout and components](phase-05-game-screen-layout.md) | 3 Playthrough | 04 | approved |
| 06 | [Game screen: hand, actions and moves](phase-06-game-screen-hand-and-actions.md) | 3 Playthrough | 05 | approved |
| 07 | [Drawing and income](phase-07-drawing-and-income.md) | 3 Playthrough | 06 | approved |
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
| O2 Screen sizes in version 1 | decided during 05 |
| O4 Password hashing within the free plan | measured in 04, decided before 23 |
| O9 Durable Object awake time (budget B12) | measured in 04 |
| O5 Game length, after simulation | reviewed after 15, decided before 20 |
| O6 Lobby, presence and global counters | 16 |
| O8 Scheduled jobs and where replay records live | 19 |
| O3 Email provider | 24 |
| O7 Privacy notice text in the spec | 24 |
