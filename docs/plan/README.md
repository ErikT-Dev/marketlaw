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
   reachable screen works for what it shows. The site is open to anyone with the link (D22, which
   replaced the lock of D6), and each phase file lists its known gaps.
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
   the phases in order, one phase per "continue" (D28), and merges and deploys each finished
   phase itself. It solves open points and unclear spec itself, implements the solutions, and records each
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

## Continue and stop

The owner runs the work with two commands, typed in a Claude Code session in this repository
(D28):

- **continue** (or anything like it): picks up exactly where the work left off and runs to the
  end of the current phase, then stops.
- **stop**: ends the work within 10 minutes, keeping everything done so far.

Typing `/clear` before `continue` at the start of a new phase saves tokens; `continue` works
without it too.

### Continue

The session that receives "continue" is the **coordinator**. It finds the work itself:

1. Delete the stop flag `node_modules/.cache/marketlaw/stop-requested`. If no helper of this
   session is running, also delete a leftover helper marker
   `node_modules/.cache/marketlaw/helper-running`.
2. Check git: the current branch, uncommitted changes, the last few commits.
3. Read the **Status** column of the phase table below. It is the one source of truth; each
   phase file's Status line mirrors it. For a phase in progress, read only the **Progress**
   section of its phase file.
4. Pick the next job ("How a phase is built"):
   - **Uncommitted changes on a phase branch:** they belong to that phase, left by a stopped or
     interrupted helper. Run the job the Progress notes name, which picks them up.
   - **A phase in progress:** the first Progress item not ticked off, or the next Finish step.
   - **New playthrough notes:** a file in `docs/playthrough-notes/` that no phase builds yet
     (Q78). Before any other phase is started, a fix phase for it is planned, as 20a was (Q74),
     and built.
   - **A phase waiting for the owner:** whatever the phase can still do without the owner. If
     nothing is left, start the next phase whose dependencies are done, or stop and tell the
     owner what is needed.
   - **Otherwise:** a starter for the first **approved** phase whose dependencies are all
     **done**.
5. Say in one line which phase and which step the work continues from, then run jobs until the
   phase is done. After a phase is done, the coordinator stops and tells the owner, rather than
   starting the next one.

Statuses move in this order: **approved** → **in progress** (branch created) → **done** (review
done, report written, merged and deployed). A phase blocked on something only the owner can do is
**waiting for the owner**, with the reason in its file. The helpers update the table and the phase
file's Status line at each change, and commit that with the phase's work.

### Stop

When the owner says "stop" (or anything like it) while a helper runs, the coordinator:

1. Creates the stop flag `node_modules/.cache/marketlaw/stop-requested` and tells the owner the
   work is stopping.
2. Starts a background timer of 9 minutes (a background shell command that ends when the time is
   up).
3. Waits. Every helper checks the flag before each step and each long command
   (`phase-helpers.md`, "Watch for stop"). It commits what passes, writes where it stopped into
   Progress, and reports **stopped**, normally within 5 minutes.
4. If the helper has not reported when the timer ends, stops it with `TaskStop`. Its work stays
   on disk, uncommitted, and the next "continue" picks it up.
5. Deletes the helper marker and tells the owner in two lines where the work stopped. If the
   Stop hook then reports a failing check on the stopped helper's uncommitted work, it says so
   and ends anyway; the hook lets the second attempt through, and "continue" picks the work up.

If no helper is running, the coordinator only confirms that nothing is running. Pressing Esc
does not stop a helper; closing the terminal does, at once, and leaves its work uncommitted for
the next "continue".

## How a phase is built

Every phase follows the same steps (D17): start, a loop once per Builds item, stop rules, and a
fixed finish. Since D28 a **coordinator** runs them through **helpers**, fresh agents that each
do one job and end, so no conversation grows large. What each helper does is in
`phase-helpers.md`.

| Step | Job (`phase-helpers.md`) | Runs |
|---|---|---|
| 1. Start | Starter | once: branch, decisions, Progress checklist |
| 2. Loop | Builder | once per Progress item (again if a builder ends with **partial**) |
| 4. Finish: checks | Finisher | after the last item |
| 4. Finish: review | Phase reviewer (D16) | once |
| 4. Finish: fixes | Fixer | once per group of related findings |
| 4. Finish: checks again | Finisher | after the fixes |
| 4. Finish: release | Releaser | report, merge, deploy, live check, phase done |

**3. Stop rules.** These hold for every helper (`phase-helpers.md`, "Stop rules"):

- The spec is unclear or contradicts itself: decide and record it ("Deciding without the owner");
  never pick an interpretation silently.
- A check still fails after 3 real attempts: stop and tell the owner what was tried; never weaken
  a check.
- A protected check config needs a change, or something only the owner can do is needed (a
  secret, an API key, an account, a payment, a Cloudflare dashboard setting): see "Waiting for
  the owner".
- A new dependency or a harness change is needed: make it and record it in `open-questions.md`
  (D19).

### The coordinator

The coordinator only plans, starts helpers and checks their results. It never reads code, specs,
diffs or test output and never looks at screenshots, so its own conversation stays small for the
whole phase.

- **One helper at a time.** All helpers share one working tree. Each is a fresh
  `general-purpose` agent (never a fork, which would inherit the coordinator's conversation),
  started in the background with a name, on the same model as the coordinator.
- **The helper marker.** Before starting a builder, finisher, fixer or releaser, the coordinator
  writes the current time (epoch ms) to `node_modules/.cache/marketlaw/helper-running`; after
  the helper's report, it deletes it. While the marker exists, the Stop hook leaves the
  helper's unfinished work alone. The SubagentStop hook checks the helper's work when the helper
  ends (D28).
- **The brief** is at most about 10 lines: phase, branch, job, item or finding numbers, "read
  `docs/plan/phase-helpers.md`", and anything from earlier reports the helper needs that is not
  already in Progress.
- **After each report,** it checks the result for itself with short commands: `git status
  --short`, the last commits, and the item's tick in Progress. A report that does not match
  git is treated as **failed**.
- **By result:**
  - **done:** start the next job.
  - **partial:** start a builder for the rest of the item.
  - **stopped:** end, as "Stop" describes.
  - **blocked:** see "Waiting for the owner".
  - **failed:** start one more helper for the same job if the report shows a fixable cause;
    otherwise stop and tell the owner.
- **Review findings.** The coordinator writes the phase reviewer's findings into the Finish part
  of Progress, then groups related findings, one group per fixer. When at most 4 findings need
  a fix, one fixer takes them all.
- **Two small jobs, one helper.** The coordinator may give one helper the starter's job and a
  first item the starter marks **small**, or two **small** items in a row. The helper does
  them one after the other, each with its own commits, tick and full check, and reports both.
- **The helper log.** After each report, the coordinator adds one row to the **Helper log**
  table in the Finish part of Progress (job, minutes, tokens, tool calls, result, from the
  helper's completion notice) and commits it on the phase branch without pushing. The
  releaser's push carries it.
- **At the end of the phase,** after the releaser, it sends the owner a notification and stops.

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

The 427 scenarios cover all of version 1, but each phase implements only part of it.

- `harness/required.yaml` (created in phase 02) lists the scenarios, invariants and budgets that
  must pass. It lives in `harness/`, so every addition asks for the owner's approval; names leave
  it only with the owner's approval (`rules/testing.md`).
- Each phase file names exactly which scenarios it adds, by file and number, decided now and not
  during the phase.
- The runner fails if a name on the list does not exist, so a renamed scenario cannot drop out
  silently.
- Scenarios not yet required are run and shown in `harness/report.html` as "not yet", or as
  "passes, not yet required"; they never fail the check. This is the only allowed form of
  skipping, and it ends in phase 30, when all 427 are required.

## Milestones and phases

| # | Phase | Milestone | Depends on | Status |
|---|---|---|---|---|
| 01 | [Toolchain and clean slate](phase-01-toolchain-and-clean-slate.md) | 1 Foundations | – | done |
| 02 | [Scenario runner and card data](phase-02-scenario-runner-and-card-data.md) | 1 Foundations | 01 | done |
| 03 | [Engine core: setup and the first turn](phase-03-engine-core.md) | 1 Foundations | 02 | done |
| 04 | [Thin slice: one turn on the live server](phase-04-thin-slice.md) | 2 Slice | 03 | done |
| 05 | [Game screen: layout and components](phase-05-game-screen-layout.md) | 3 Playthrough | 04 | done |
| 06 | [Game screen: hand, actions and moves](phase-06-game-screen-hand-and-actions.md) | 3 Playthrough | 05 | done |
| 07 | [Drawing and income](phase-07-drawing-and-income.md) | 3 Playthrough | 06 | done |
| 08 | [Bots, simulator, replays and test rooms](phase-08-bots-simulator-and-test-rooms.md) | 3 Playthrough | 07 | done |
| 09 | [Hidden information and opponents](phase-09-hidden-information-and-opponents.md) | 3 Playthrough | 08 | done |
| 10 | [Types, combos and projects](phase-10-types-combos-and-projects.md) | 3 Playthrough | 09 | done |
| 11 | [Influence and undo](phase-11-influence-and-undo.md) | 3 Playthrough | 10 | done |
| 12 | [The market phase](phase-12-market-phase.md) | 3 Playthrough | 09 | done |
| 13 | [Quests](phase-13-quests.md) | 3 Playthrough | 11, 12 | done |
| 14 | [Clocks and the time bank](phase-14-clocks-and-time-bank.md) | 3 Playthrough | 12 | done |
| 15 | [End of the game and scoring](phase-15-end-of-game-and-scoring.md) | 3 Playthrough | 13, 14 | done |
| 16 | [Rooms and guests](phase-16-rooms-and-guests.md) | 3 Playthrough | 15 | done |
| 17 | [Lobby and one thing at a time](phase-17-lobby-and-one-thing-at-a-time.md) | 3 Playthrough | 16 | done |
| 18 | [Connections and pausing](phase-18-connections-and-pausing.md) | 3 Playthrough | 17 | done |
| 19 | [Leaving, cleanup and replay records](phase-19-leaving-cleanup-and-replays.md) | 3 Playthrough | 18 | done |
| 20 | [Cost protection and the playthrough version](phase-20-cost-protection-and-playthrough.md) | 3 Playthrough | 19 | done |
| 20a | [Playthrough fixes](phase-20a-playthrough-fixes.md) | 3 Playthrough | 20 | done |
| 21 | [Room chat](phase-21-room-chat.md) | 4 Together | 20a | in progress |
| 22 | [Abandon vote and rematch](phase-22-abandon-vote-and-rematch.md) | 4 Together | 20a | approved |
| 23 | [Accounts: signup and login](phase-23-accounts-signup-and-login.md) | 5 Accounts and ranking | 20a | approved |
| 24 | [Accounts: email, deletion and privacy](phase-24-accounts-email-deletion-privacy.md) | 5 Accounts and ranking | 23 | approved |
| 25 | [Game records and match history](phase-25-game-records-and-match-history.md) | 5 Accounts and ranking | 22, 24 | approved |
| 26 | [Ranked queue](phase-26-ranked-queue.md) | 5 Accounts and ranking | 25 | approved |
| 27 | [Ratings, ranking and players online](phase-27-ratings-ranking-and-players-online.md) | 5 Accounts and ranking | 26 | approved |
| 28 | [Game menu, rules viewer and card set](phase-28-menu-rules-and-card-set.md) | 6 Learning | 20a | approved |
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

### Milestone 3: Playthrough (05–20a)

The real game screen, every game rule, hidden information, clocks, rooms and a lobby for guests,
connections and leaving, and the daily limits. At the end of phase 20, 2 to 4 people can play a
complete game from the lobby to the final score. **This is the playthrough version.** A
checkpoint after phase 15 reviews game length with the simulator (O5). Phase 20a builds the
findings of the owner's first playthrough (Q74).

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
| O3 Email provider | 24 |
| O7 Privacy notice text in the spec | 24 |
