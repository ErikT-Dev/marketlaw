# Phase helpers

How the helpers that build a phase work (D28). The coordinator, the session the owner talks to,
starts one helper at a time with a short brief; everything else a helper needs is in this file,
the phase file and the repository. `README.md`, "How a phase is built", describes the
coordinator's side.

## For every helper

### Your brief
The coordinator tells you the phase number, the branch, your job (a section below), the
Progress item or finding numbers, and anything earlier helpers reported that you need. You know
nothing else about the phase than what is written down: the phase file (above all its
**Progress** section and its notes), `decisions.md`, `open-questions.md` and git.

### Read first
1. `docs/plan/proposed-rules.md`: lessons from earlier phases.
2. Your section below, and the parts of the phase file your job names.
3. The spec rules and scenarios your job touches, in `harness/spec/` and `harness/scenarios/`.

`CLAUDE.md` and `rules/` are already in your context; they apply to you in full.

### Keep your context small
Your cost grows with everything you read, so read only what the job needs:
- Read the part of a file you need (a section, a function, a line range), not every file in a
  folder.
- Send long command output to a file in your scratchpad and read only the end or the matching
  lines. Never print a passing test log.
- Look at a screenshot only when the job is about that screen.

### Watch for stop
The owner can stop the work at any time (`README.md`, "Continue and stop"). Before every new
step, and before every command that can run for more than a minute (`npm run check`,
`npm run harness`, `npm run e2e`, a deploy), run:

```bash
test -f node_modules/.cache/marketlaw/stop-requested && echo STOP
```

If it prints `STOP`, do not start anything new:
- If the code you changed passes the fast checks (types, lint, the affected tests), commit it.
- Otherwise leave it uncommitted.

Either way, add a line to the item's Progress note: "Stopped (date): done so far …; next …;
uncommitted changes: yes/no". Then reply with your report, result **stopped**. If the stop hook
complains when you finish, reply once more with the same report; the second time it lets you
finish.

### When to end early
End with result **partial** when the item turns out larger than one helper should take. That
is when you have made two or three commits and much is left, or when you have read and run so
much that your conversation is long. Stop only at a point where the checks pass and everything
is committed, and write in the Progress note what is done and what comes next. A fresh helper
continues from there more cheaply and more reliably than you can.

### Stop rules
These are the plan's stop rules (`README.md`, "How a phase is built"), applied to you:
- **The spec is unclear or contradicts itself:** decide and record it as "Deciding without the
  owner" in `README.md` describes, then keep going.
- **A check still fails after 3 real attempts:** stop with result **failed**, saying what you
  tried. Never weaken a check.
- **Something only the owner can do is needed** ("Waiting for the owner" in `README.md`):
  write it under **Waiting for the owner** in the phase file, then end with result **blocked**.

### Your report
Your final message is all the coordinator reads. Keep it under 15 lines, in this form:

```
Result: done | partial | stopped | blocked | failed
Job: <job>, item <n> (or findings <n, m>)
Commits: <short hash> <subject>, one per line, or none
Checks: what you ran last and whether it passed
Uncommitted changes: none | what and why
Differs from the phase file: ... or nothing
Decisions recorded: Qnn ..., or none
For later items: anything the next helpers must know, also written into Progress
Needs the owner: ... or nothing
```

## Jobs

### Starter
For a phase whose status is **approved** and whose dependencies are **done**.
1. Create the branch `phase-NN-name` from master. Set the phase to **in progress** in the
   phase table of `README.md` and on the phase file's Status line.
2. Read the phase file, `decisions.md`, every spec rule under Covers, and the phase's scenarios.
3. List anything unclear or contradictory in the spec, and any open decision the phase needs.
   Decide each as "Deciding without the owner" describes before building.
4. Turn the Builds items into a **Progress** checklist at the end of the phase file. Split an
   item that is too large for one builder (more than about three commits) into numbered parts.
   Under each item, write what a builder needs that the phase file does not say: the rules and
   scenarios it covers, decisions that affect it, and existing code to reuse.
5. Commit (`PLAN: Phase NN started; Progress checklist`) and report.

### Builder
One Progress item, or the rest of a partial one.
1. Read the item, its notes and the notes of earlier items ("For later items"). If git shows
   uncommitted changes, they are a stopped helper's work on this item; read its Progress note,
   check the changes, and finish or redo them.
2. Reread the exact spec rules and scenarios for the item.
3. Search for existing code, types and helpers to reuse.
4. Test first: make the item's scenarios run and fail for the right reason; add unit tests for
   what the scenarios do not reach.
5. Build the smallest change that makes them pass.
6. Run the fast checks: types, lint, the affected tests. Before your last commit, run the full
   `npm run check` (output to a file; read only the failures).
7. Commit to the phase branch, `<AREA>: <description>`, one logical change per commit.
8. Tick the item off in Progress, with a note on anything that differed from the phase file and
   a "For later items" line if later items should know something. Commit that with the work.

### Finisher
After the last Progress item, and again after the review's fixes.
1. First run only: add the phase's scenarios to `harness/required.yaml` in one edit
   (`HARNESS:` commit).
2. Run the full `npm run check`, `npm run harness` (the phase-end simulated games, D25), the
   browser tests and the budget checks. The browser tests have a known local problem: some
   time out loading pages when two workers run. Rerun only the failing tests. If they pass
   then, note it; GitHub judges the full suite.
3. Update `docs/enforcement.md` if a check now applies that did not before.
4. Record the results in the Finish part of Progress, commit, and report.

### Phase reviewer
The `phase-reviewer` agent, unchanged (D16). It only reads. The coordinator writes its findings
into the Finish part of Progress.

### Fixer
One group of related review findings, named by number.
1. Read the findings in Progress, then the code and the spec they point to.
2. Fix each one, or, where a finding is wrong or belongs to a later phase, write why under it
   (as a known gap in the phase file if it is one).
3. Follow the builder's steps 3 to 8 for the fixes. Mark each finding "fixed: …" or
   "answered: …" in Progress.

### Releaser
When the finisher's second run is green.
1. Write the phase report under **Report** at the end of the phase file: what was built, what
   to try, differences from the phase file, decisions made, the review's findings and what
   happened to each.
2. Merge to master as `docs/merging-and-rollback.md` describes and watch the deploy. Check
   that it really deployed: the run's conclusion and the live bundle's text, not only the
   watch command's exit code.
3. Check that the live site works, including anything the phase file says to try.
4. If the deploy fails, fix it on the phase branch and merge again; roll back if the live site
   is broken and the fix is not quick.
5. Mark the phase **done** in the phase table and the phase file, commit, push, and report.
