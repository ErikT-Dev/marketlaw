# Decisions

Decisions made while planning and building version 1. Open points are listed under **Open**,
each with what it affects and a recommendation. A decided point moves to **Decided** with the
date, the decision and the reason.

## Decided

**D1. The site is not public before version 1; data may be wiped.** (2026-10-27, owner)
Until the owner makes version 1 public, only the owner and invited testers use the live site.
Rooms, games, accounts and records may be deleted between phases.
*Why:* early phases would otherwise have to migrate saves and accounts nobody needs.
*Effect:* `rules/architecture.md` "One save format" says so: until then a room whose saved
`schemaVersion` is not current closes itself on load. Migrations are required from the first
public deploy on.

**D2. Core playthrough first.** (2026-10-27, owner)
A complete casual game for 2 to 4 guests comes before chat, votes, rematches, registered
accounts, records, ranking, the rules viewer, the card set and the tutorial.

**D3. Guest identity, cost protection and the human check are core.** (2026-10-27, owner)
A guest username and session token (A1.2), the daily limits on actions, game starts and games
per day (A9.1–A9.4) and the human check (A1.12) for guests and rooms are part of the playthrough
version.

**D4. A thin end-to-end slice before the rules are filled in.** (2026-10-27, owner)
Phase 04 runs turn 1 on the live server with a bare screen.

**D5. Plan structure.** (2026-10-27, owner)
One overview, one file per phase, this decisions file.

**D6. The live site is locked until launch.** (2026-10-27, owner)
From phase 04 until phase 30, only the owner and invited testers can open the site, through
Cloudflare Access in front of the workers.dev address. Phase 04 first confirms that this is free
for a small team; if it is not, the owner decides on another lock before phase 04 ends.

**D7. One branch per phase.** (2026-10-27, owner)
Each phase is built on its own branch; GitHub runs the checks on it. The branch is merged to
master, which deploys, only when the phase is done and accepted. The live site always shows a
finished phase.

**D8. An owner-only test-room tool.** (2026-10-27, owner)
From phase 08, the owner can start a live room from a scenario's starting situation (for example
a game near the end goal), protected by a secret. It stays owner-only after launch, and a test
checks that the public site cannot reach it.
*Why:* projects, quests and the end of the game otherwise take dozens of turns to try.

**D9. A smaller simulator set for the Stop hook, if needed.** (2026-10-27, owner)
If `npm run check` cannot finish in 5 minutes even with games run in parallel, the Stop hook may
run a smaller seeded set; `npm run harness` and GitHub always run at least 10,000 games. Written
into `rules/testing.md`.

**D10. Hidden information right after drawing.** (2026-10-27, owner)
Phase 09 builds the final player views, per-player state versions and the opponents overview,
so every screen built after it uses the final view.

**D11. The required-scenarios list lives in `harness/required.yaml`.** (2026-10-27, owner)
Every addition asks for the owner's approval; each phase file names its scenarios in advance.
`rules/testing.md` allows "not yet" scenarios until phase 30 as the only form of skipping.

**D12. Too many rejected messages close the connection.** (2026-10-27, owner)
New rule M9.6: 30 rejected messages within one minute close the connection. Built in phase 04.

**D13. Card photos and backgrounds can be published.** (2026-10-27, owner)
All photos in `design/assets/` are from Unsplash, whose licence allows use in the game without
attribution. Phase 05 converts them to WebP at the largest size the design shows them (about
30–50 KB each, about 10 MB in total), and commits them with the icons and backgrounds under
`src/client/assets/`; card photos load only when a card is shown. The conversion tool is a new
development dependency, asked for in phase 05. (Was open point O1.)

**D14. Three scenarios added for core rules.** (2026-10-27, owner)
`lobby-queue-and-limits.yaml` #32 and #33 (A9.2 and A9.1 with rooms) and `rooms.yaml` #27 (M2.1
with rooms), so the playthrough version proves its daily limit and "one thing at a time" without
the ranked queue.

**D15. The whole plan approved at once; one go-ahead per phase.** (2026-10-27, owner)
The owner approved all 30 phases, including the dependencies, secrets, protected-file changes and
required-list additions each names. Claude works through the phases in order; after each, the
owner gives one go-ahead before it is merged and the next starts. Claude asks in between only for
open decisions, for anything a phase file does not name, and for unclear or contradictory spec.
*Why:* less reviewing for the owner, with control kept at every phase boundary.

**D16. A fresh-context review at the end of every phase.** (2026-10-27, owner)
When a phase is done and green, Claude runs the `phase-reviewer` agent
(`.claude/agents/phase-reviewer.md`), a separate Claude with an empty context that reviews the
branch against the phase file, the spec and `rules/`. Claude fixes or answers every finding, runs
the checks again, and includes the findings and their outcome in the phase report.
*Why:* the session that built a phase reviews it with what it meant to build in mind; a fresh
reviewer sees only the documents and the code.

**D17. How a phase is built; commits and merges.** (2026-10-27, owner)
Every phase follows the steps in `README.md`, "How a phase is built": start, a loop per Builds
item with tests first, stop rules, and a fixed finish. Claude commits to the phase branch as it
goes; merging into master, which deploys, happens only after the owner confirms. Written into
`rules/workflow.md` (Commits).
*Why:* a phase spans several sessions; a fixed loop keeps quality even, and small commits make
each step reviewable, resumable and easy to roll back.

**D18. "Continue implementing" needs no phase number.** (2026-10-27, owner)
Claude finds the phase and step itself from git and the Status column of the phase table, as
`README.md` "Where to continue" describes, and says in one line where it continues from. A phase
awaiting go-ahead blocks the next one until the owner confirms the merge.

**D19. Claude builds version 1 on its own.** (2026-10-27, owner)
From phase 02 until version 1 is done, Claude works through the phases without the owner: it
merges and deploys each finished phase itself and starts the next. It solves unclear or
contradictory spec, missing cases and the open decisions below itself, implements the
solutions, and records each question it would otherwise have asked the owner, with its solution,
in `open-questions.md`, for the owner to review at the end. It may change
`harness/` (each change its own `HARNESS:` commit), the spec, `wrangler.jsonc` (Free plan only)
and dependencies (pinned, at least 14 days old). It never changes the protected check configs,
never weakens a check, and never removes a name from `harness/required.yaml`. It stops for the
owner only for secrets, API keys, outside accounts, payments, dashboard settings, protected
config changes, a check that fails after 3 real attempts, and paid-only Cloudflare features.
Rule lessons go to `proposed-rules.md`. The PreToolUse hook no longer asks before writes to
`harness/` and `wrangler.jsonc`; it still denies protected configs and generated output.
*Why:* the owner wants version 1 built without waiting on them, and to review the decisions at
the end instead of one by one. Replaces the per-phase go-ahead of D15, D17 and D18 and the asking
parts of D7 and D11.
*Effect:* `README.md` ("Deciding without the owner", "Waiting for the owner"), `CLAUDE.md`,
`rules/workflow.md`, `rules/cloudflare.md`, `tools/hooks/protectionOf.ts`.

**D20. Durable Object awake time is within B12 (was O9).** (2026-10-28, measured in phase 04)
On the live site, a 2-player room was created, joined and dealt; both players played turn 1; one
refreshed; then both idled for several minutes. Cloudflare's analytics billed the room 0.7 s of
active time and 0.093 GB-s of duration for the whole session. CPU time per message was 0-2 ms
(`wrangler tail`), 6 ms for the join that deals the game (B11 limit 10 ms). Idle clients sent
nothing. With the Hibernation API, a room costs only while it handles messages, so a 25-turn
game should stay far below B12's 600 s, and 50 games a day far below the Free plan's 13,000 GB-s.
*Effect:* B12 stays as it is; the simulator measures it per game from phase 08.

**D21. Screen sizes in version 1 (was O2).** (2026-10-28, owner, phase 05)
Every screen supports sizes from 1280×720 to 2560×1440, as `rules/frontend.md` says. Phase 05's
size test passed at all three test sizes with a 4-player table. Phase 13 reruns it at 1280×720
with 5 quests and 4 players and raises the question again if the screen cannot fit there.
*Effect:* `harness/spec/screens.md` S1.1, `open-questions.md` Q19, phase 13's Open points.

**D22. The site lock is removed now (replaces D6).** (2026-10-28, owner, during phase 09)
The owner turns off Cloudflare Access on the workers.dev address, so anyone with the link can
play; the link has not been shared. Known risks until later phases close them: until phase 09
ends, other players' main-phase actions reach the browser before the phase ends; until phase 20,
nothing limits how much one visitor can use, so the Free plan's daily limits could be used up;
until phase 19, abandoned rooms and guests are not cleaned up. The test-room tool stays behind
its secret (D8, C5).
*Effect:* `README.md` principle 2, phase 30 item 4; Claude checks after each deploy that the
live site loads without a login.

**D23 (replaced by D25). 500 simulated games per check, 5,000 at the end of a phase (replaces D9).** (2026-10-29,
owner, during phase 11)
`npm run check`, and so the Stop hook and GitHub, simulates 500 games; `npm run harness` simulates
5,000 and runs at the end of every phase, before the phase review. Measured on phase 11: the other
223 tests take about 20 s, the 10,000 games about 295 s, so the game count alone decided whether
the check stayed under 5 minutes. 500 games still find, 95% of the time, a broken invariant that
shows in 1 game in 170; 5,000 games, one that shows in 1 game in 1,700.
*Effect:* `rules/testing.md` "Invariants under simulation", `harness/HARNESS.md` point 2,
`README.md` "How a phase is built" step 4.2, the "hold over 10,000 games" criteria of phases 11 to
15 and 30.

**D24. Game length stays as the spec has it (was O5).** (2026-11-02, Claude under D19, phase 15)
The end goal, the turn limit of 40 and the time bank stay unchanged until games by real players
can be measured. Over 2,500 complete legal-bot games, the bot reaches the end goal in about 62% of
games at every size, in about turn 39 on average; rows written per game are 484, 712 and 928 for
2, 3 and 4 players (B4 and B5 allow 1,600). The bot plays at random, so its games are an upper
bound for game length.
*Effect:* `open-questions.md` Q48; `game-rules.md` open question 1 keeps the recheck with real
games (phase 20 testers).

**D25. 50 simulated games per check, 1,000 at the end of a phase (replaces D23).** (2026-11-03,
owner, after phase 15)
`npm run check`, and so the Stop hook and GitHub, simulates 50 games; `npm run harness` simulates
1,000 and runs at the end of every phase, before the phase review. Measured after phase 15 on an
8-core PC: the 500 games took about 170 s of the check's 4 minutes and the rest of the tests about
20 s; on GitHub's 2-core runners the check took 10 to 12 minutes. 50 games still find, 95% of the
time, a broken invariant that shows in 1 game in 17; 1,000 games, one that shows in 1 game in 334.
*Effect:* the counts live only in `tools/harness-runner/SIMULATED_GAMES.ts`; `rules/testing.md`,
`harness/HARNESS.md` point 2, `README.md` step 4.2, `docs/enforcement.md` and the phase 30 file
refer to it instead of repeating the numbers, so the next change is one edit there plus a
decision here. Phase files 11 to 15 keep their 5,000-game results.

**D26. One lobby Durable Object for the lobby, presence and the site-wide counters (was O6).**
(2026-11-03, Claude under D19, phase 16)
A single SQLite-backed Durable Object class `Lobby` holds the public room list, players online,
"one thing at a time" and the daily site counters, and pushes changes to lobby screens over
hibernating WebSockets. D1 keeps players and usernames, and later records and ratings. Rooms
reserve chat quota in blocks so a chat message never costs a lobby row. Built in phase 17.
*Effect:* `open-questions.md` Q52; `wrangler.jsonc` in phase 17.

**D27. Replay records in D1, removed by one daily Cron Trigger (was O8).** (2026-11-03, Claude
under D19, phase 19)
When a game ends, its room writes the replay record (seed, setup, action log, result) to a D1
table, so the record outlives the room, which is deleted 24 hours after the game. One Cron Trigger
a day deletes replay records older than 30 days (M4.3) and, from phase 23 on, guests unused for 90
days (A1.1). Cron Triggers are on the Free plan: 5 per account, 10 ms of CPU per run
(https://developers.cloudflare.com/workers/platform/limits/, checked 2026-11-03); the deletes run
in D1.
*Effect:* `open-questions.md` Q60; `wrangler.jsonc` `triggers`.

**D28. A coordinator and fresh helpers; one phase per "continue".** (2026-11-04, owner)
The owner has two commands. "continue" picks up exactly where the work left off and runs to the
end of the current phase, then stops; "stop" ends the work within 10 minutes, keeping what is
done. The session the owner talks to is a coordinator: it starts one fresh helper agent per job
(starter, one builder per Progress item, finisher, the phase reviewer, fixers, releaser) and
only checks their short reports against git. Helpers follow `phase-helpers.md`, hand knowledge
on through the Progress notes, run the full `npm run check` before an item's last commit, and
end early at a committed, green point when an item turns out large. Stop works through a flag
file every helper checks before each step, with a 9-minute hard stop. A Stop-hook change (skip
while a helper marker exists, the marker expiring after 3 hours) and a new SubagentStop hook
running the same check are applied by the owner, since `tools/hooks/` and `.claude/` are
protected.
*Why:* measured on phases 16 to 19, 80 to 90% of the tokens went to re-reading a conversation
that grew to 460k to 790k tokens per phase; fresh helpers keep every conversation short, which
cuts a phase by roughly half without dropping a check, and every item now gets the full check.
Replaces "starts the next one" of D19 and the "Where to continue" steps of D18.
*Effect:* `README.md` ("Continue and stop", "How a phase is built", ground rule 6),
`phase-helpers.md`, `CLAUDE.md`, `tools/hooks/checkBeforeStop.ts`, `.claude/settings.json`.

**D29. Passwords hashed with PBKDF2-SHA256 at 10,000 iterations (was O4).** (2026-11-09, Claude
under D19, phase 23)
Web Crypto's PBKDF2-SHA256 with a random 16-byte salt per password and 20,000 iterations, about
6-8 ms of CPU, within B11. The stored value names the method and the count, so the count can be
raised later. Phase 04 measured 100,000 at 15-19 ms and the runtime refuses more; OWASP's 600,000
is impossible in a Worker. The human check after failed logins (A1.13) guards against online
guessing; the lower count only matters if the database leaks. B11 counts the hash as the
iteration count times 400 ns, the live Worker's highest measured cost per iteration (8 ms), not
as local CPU time, which measured the build computer's load (phase 23 review R1, Q102).
*Changed after the live measurement (2026-11-10, Claude under D19, phase 23 release):* 10,000
iterations, not 20,000. The live Worker took 6-14 ms for a 20,000-iteration login (99th
percentile 13 ms), up to 700 ns per iteration; B11 stays at 10 ms, the Free plan's CPU limit per
request, and now counts 700 ns per iteration: 7 ms of hash, about 8 ms with the request's other
work (about 1 ms). The trade-off: if the database leaks, each password is half as costly to
guess as at 20,000, and about 60 times cheaper than OWASP's 600,000; online guessing is still
held off by the human check (A1.13). Hashes stored at 20,000 keep their count and still verify
(Q90). Measured live at 10,000: 2-9 ms per login, 99th percentile 8 ms; B11 now counts 900 ns per
iteration (the highest call, other work included), 9 ms of 10 (Q90, Q102).
*Effect:* `open-questions.md` Q90; `accounts.md` open question 2 removed; built in phase 23.

## Open

From D19 on, Claude solves these itself when the phase that needs them starts, records the
solution in `open-questions.md`, and moves the point to Decided.

**O3. Email provider.** Needed before phase 24. (`accounts.md` open question 1)
*Recommendation:* compare free tiers against A1.9 at the start of phase 24.

**O7. Privacy notice.** Needed before phase 24.
A short notice: what is stored (username, email, password hash, game records), why, how long,
and how to delete it. Drafted into the spec (owner's approval) before phase 24 builds it.
