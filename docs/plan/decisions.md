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

## Open

From D19 on, Claude solves these itself when the phase that needs them starts, records the
solution in `open-questions.md`, and moves the point to Decided.

**O3. Email provider.** Needed before phase 24. (`accounts.md` open question 1)
*Recommendation:* compare free tiers against A1.9 at the start of phase 24.

**O4. Password hashing within the free plan.** Measured in phase 04, decided before phase 23.
(`accounts.md` open question 2)
*Recommendation:* a one-hour experiment in phase 04 measures a secure hash on the live Worker. If
it does not fit, the owner decides on another login method before rooms and accounts are built.
*Measured 2026-10-27 (phase 04):* a temporary Worker on the Free plan hashed a password with
PBKDF2-SHA256 (Web Crypto, the only built-in slow hash). CPU time per hash, from `wrangler tail`:
1,000 iterations 0-1 ms; 10,000 3-4 ms; 50,000 8-16 ms; 100,000 15-19 ms (still accepted,
although over the 10 ms limit). Above 100,000 the runtime refuses: "Pbkdf2 failed: iteration
counts above 100000 are not supported". OWASP asks for 600,000 iterations of PBKDF2-SHA256, so a
hash that strong is impossible in a Worker. Options for phase 23: PBKDF2 at 100,000 iterations
(about 6 times weaker than OWASP, and over B11 for each login), a hash in WebAssembly (still
limited by the 10 ms CPU limit), or a login without passwords (an emailed sign-in link). The probe
Worker was deleted after the measurement.

**O5. Game length.** Reviewed after phase 15, decided before phase 20.
(`game-rules.md` open question 1)
*Recommendation:* the simulator reports turns per game, scores, funds over time, rows written per
game (B4 and B5 allow 1,600; a 40-turn game may come close) and how often each end condition is
reached, by game size. Rule changes go into the spec first.

**O6. Lobby, presence and global counters.** Needed before phase 16.
"One thing at a time" (M2) needs one authority across rooms, the queue and the tutorial; the
lobby lists rooms and players online; the site-wide daily counters (A9.4, A9.6) must not cost a
row per chat message (B7). *Recommendation:* a small experiment at the start of phase 16
compares a single lobby Durable Object with D1, against B16, B18 and B7; the owner approves the
choice and any new Durable Object class in `wrangler.jsonc`.

**O7. Privacy notice.** Needed before phase 24.
A short notice: what is stored (username, email, password hash, game records), why, how long,
and how to delete it. Drafted into the spec (owner's approval) before phase 24 builds it.

**O8. Scheduled jobs and replay records.** Needed before phase 19.
A room's alarm ends with the room, so replay records kept 30 days (M4.3) and guests unused for
90 days (A1.1) need something else to delete them, most likely a scheduled job (Cron Trigger).
*Recommendation:* phase 19 confirms Cron Triggers are free, decides where replay records live,
and adds the trigger to `wrangler.jsonc` (owner's approval).
