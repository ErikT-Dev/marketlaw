import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { LOGIN_TIMES } from "../../src/server/accounts/LOGIN_TIMES.ts";
import { gameRecordRowsOf } from "../../src/server/records/gameRecordRowsOf.ts";
import { GameRecordResponse } from "../../src/shared/api/GameRecordResponse.ts";
import { MatchHistoryResponse } from "../../src/shared/api/MatchHistoryResponse.ts";
import { GameId } from "../../src/shared/GameId.ts";
import { PlayerId } from "../../src/shared/PlayerId.ts";
import { fixtureGameRecordOf } from "../harness-runner/lobby/fixtureGameRecordOf.ts";
import { getFromRoute } from "./getFromRoute.ts";
import { postToRoute } from "./postToRoute.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";
import { routeTestDatabaseOf } from "./routeTestDatabaseOf.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "quiet-harbour-71";
const WRONG_PASSWORD = "loud-harbour-17";
const EMAIL = "Route.Tester+logs@example.com";
const STARTING_MS = 30_000;
const ONE_MINUTE_MS = 60_000;
const LOGGED_LINE = v.looseObject({ message: v.string() });
const NEW_PASSWORD = "still-harbour-93";
const FIRST_EMAIL = "First.Logger@example.com";
const SECOND_EMAIL = "Second.Logger@example.com";
const RESENT_EMAIL = "Resent.Logger@example.com";
const ANY_EMAIL_ADDRESS = /[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}/iu;
const LINK_TOKEN = /#(?:confirm|reset)=([0-9a-f]{64})/u;

let server: TestHarness;

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

function loggedMessages(): ReadonlyArray<string> {
  const logs: ReadonlyArray<unknown> = server.getLogs();
  return logs.map((log) => v.parse(LOGGED_LINE, log).message);
}

function logsShowing(secrets: ReadonlyArray<string>): ReadonlyArray<string> {
  const lowerCaseSecrets = secrets.map((secret) => secret.toLowerCase());
  return loggedMessages().filter((message) =>
    lowerCaseSecrets.some((secret) => message.toLowerCase().includes(secret)),
  );
}

async function signUpWith(username: string, email: string): Promise<string> {
  const signup = await post("/api/signups", {
    username,
    email,
    password: PASSWORD,
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  return tokenOf(signup);
}

async function newestLinkTokenTo(email: string): Promise<string> {
  const text = (await readTestOutbox(server, email)).emails[0]?.text ?? "";
  const linkToken = LINK_TOKEN.exec(text)?.[1];
  if (linkToken === undefined) {
    throw new Error("No link in the newest email");
  }
  return linkToken;
}

async function lastUsedAt(db: RouteTestDatabase, name: string, lastUsedMs: number) {
  await db.prepare("UPDATE players SET created_ms = ? WHERE name = ?").bind(lastUsedMs, name).run();
  await db
    .prepare(
      "UPDATE logins SET last_used_ms = ? WHERE player_id IN (SELECT id FROM players WHERE name = ?)",
    )
    .bind(lastUsedMs, name)
    .run();
}

async function accountRowsNamed(db: RouteTestDatabase, name: string) {
  return (await db.prepare("SELECT id FROM players WHERE name = ?").bind(name).all()).results;
}

async function guestPlayerId(db: RouteTestDatabase, name: string): Promise<PlayerId> {
  await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK });
  return v.parse(v.tuple([v.object({ id: PlayerId })]), await accountRowsNamed(db, name))[0].id;
}

async function saveGames(db: RouteTestDatabase, winner: PlayerId, loser: PlayerId) {
  const ids = Array.from({ length: 52 }, () => v.parse(GameId, crypto.randomUUID()));
  for (const [index, id] of ids.entries()) {
    const endedMs = 1_000_000 + Math.min(index, 49) * ONE_MINUTE_MS;
    const record = fixtureGameRecordOf(endedMs, 25, [
      { playerId: winner, place: 1, score: 800 + index, result: "won" },
      { playerId: loser, place: 2, score: 700, result: "lost" },
    ]);
    for (const { query, values } of gameRecordRowsOf(id, record)) {
      await db
        .prepare(query)
        .bind(...values)
        .run();
    }
  }
  return ids;
}

async function historyAt(path: string) {
  const { status, body } = await getFromRoute(server, path);
  const history = v.parse(MatchHistoryResponse, body);
  return { status, page: history.kind === "found" ? history : null, history };
}

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the account routes", () => {
  it(
    "send again, confirm, reset, set a password, change the address and delete without logging a token, password, link or email address",
    async () => {
      const resenderToken = await signUpWith("Emailresender", RESENT_EMAIL);
      expect(await post("/api/confirmation-emails", { token: resenderToken })).toMatchObject({
        status: 200,
      });
      const resentLink = await newestLinkTokenTo(RESENT_EMAIL);
      const signupToken = await signUpWith("Emaillogger", FIRST_EMAIL);
      const confirmLink = await newestLinkTokenTo(FIRST_EMAIL);
      expect(await post("/api/email-confirmations", { link: confirmLink })).toMatchObject({
        status: 200,
      });
      const resetRequest = { email: FIRST_EMAIL, humanCheck: DUMMY_HUMAN_CHECK };
      expect(await post("/api/reset-emails", resetRequest)).toMatchObject({ status: 200 });
      const resetLink = await newestLinkTokenTo(FIRST_EMAIL);
      const reset = await post("/api/password-resets", { link: resetLink, password: NEW_PASSWORD });
      const resetToken = tokenOf(reset);
      const change = await post("/api/email-changes", {
        token: resetToken,
        email: SECOND_EMAIL,
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(change).toMatchObject({ status: 200 });
      const changeLink = await newestLinkTokenTo(SECOND_EMAIL);
      expect(await post("/api/email-confirmations", { link: changeLink })).toMatchObject({
        status: 200,
      });
      const deletion = { token: resetToken, password: NEW_PASSWORD };
      expect(await post("/api/account-deletions", deletion)).toMatchObject({ status: 200 });
      const tokens = [resenderToken, signupToken, resetToken];
      const links = [resentLink, confirmLink, resetLink, changeLink];
      const passwords = [PASSWORD, NEW_PASSWORD];
      const addresses = [RESENT_EMAIL, FIRST_EMAIL, SECOND_EMAIL];
      expect(logsShowing([...tokens, ...links, ...passwords, ...addresses])).toEqual([]);
      expect(loggedMessages().filter((message) => ANY_EMAIL_ADDRESS.test(message))).toEqual([]);
    },
    STARTING_MS,
  );

  it(
    "sign up, log in, fail a login, rename and log out without logging a token, password or email address",
    async () => {
      const guest = await post("/api/guests", {
        name: "Routetester",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      const guestToken = tokenOf(guest);
      const asGuest = await post("/api/session", { token: guestToken });
      expect(asGuest.body).toMatchObject({ isLoggedIn: true, isGuest: true });
      const signup = await post("/api/signups", {
        token: guestToken,
        email: EMAIL,
        password: PASSWORD,
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(signup).toMatchObject({ status: 200, body: { isOk: true, token: guestToken } });
      const asRegistered = await post("/api/session", { token: guestToken });
      expect(asRegistered.body).toMatchObject({ isLoggedIn: true, isGuest: false });
      const byName = await post("/api/logins", { login: "routetester", password: PASSWORD });
      expect(byName).toMatchObject({ status: 200, body: { isOk: true, name: "Routetester" } });
      const failed = await post("/api/logins", { login: EMAIL, password: WRONG_PASSWORD });
      expect(failed).toEqual({ status: 400, body: { isOk: false, reason: "login_failed" } });
      const byEmail = await post("/api/logins", { login: EMAIL, password: PASSWORD });
      const emailToken = tokenOf(byEmail);
      const renamed = await post("/api/username-changes", {
        token: emailToken,
        username: "Routerunner",
      });
      expect(renamed).toMatchObject({ status: 200, body: { isOk: true, name: "Routerunner" } });
      const account = await post("/api/account", { token: emailToken });
      expect(account).toMatchObject({
        status: 200,
        body: { isLoggedIn: true, name: "Routerunner" },
      });
      const logout = await post("/api/logout", { token: emailToken });
      expect(logout).toEqual({ status: 200, body: { isLoggedIn: false } });
      const afterLogout = await post("/api/account", { token: emailToken });
      expect(afterLogout.body).toEqual({ isLoggedIn: false });
      const secrets = [guestToken, tokenOf(byName), emailToken, PASSWORD, WRONG_PASSWORD, EMAIL];
      expect(logsShowing(secrets)).toEqual([]);
    },
    STARTING_MS,
  );

  it(
    "the daily job removes guests unused for 90 days with their logins and frees their usernames",
    async () => {
      const now = Date.now();
      const longUnused = now - LOGIN_TIMES.expireAfterMs - ONE_MINUTE_MS;
      const oldGuest = tokenOf(
        await post("/api/guests", { name: "Oldguest", humanCheck: DUMMY_HUMAN_CHECK }),
      );
      const recentGuest = tokenOf(
        await post("/api/guests", { name: "Recentguest", humanCheck: DUMMY_HUMAN_CHECK }),
      );
      const oldMember = tokenOf(
        await post("/api/guests", { name: "Oldmember", humanCheck: DUMMY_HUMAN_CHECK }),
      );
      await post("/api/signups", {
        token: oldMember,
        email: "Old.Member@example.com",
        password: PASSWORD,
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      const db = await routeTestDatabaseOf(server);
      await lastUsedAt(db, "Oldguest", longUnused);
      await lastUsedAt(db, "Oldmember", longUnused);
      await lastUsedAt(db, "Recentguest", longUnused + 2 * ONE_MINUTE_MS);
      const run: unknown = await server.getWorker().scheduled({ scheduledTime: new Date(now) });
      expect(run).toMatchObject({ outcome: "ok" });
      expect(await accountRowsNamed(db, "Oldguest")).toEqual([]);
      expect(
        (
          await db
            .prepare("SELECT * FROM logins WHERE player_id NOT IN (SELECT id FROM players)")
            .all()
        ).results,
      ).toEqual([]);
      expect((await post("/api/session", { token: oldGuest })).body).toEqual({ isLoggedIn: false });
      expect(await accountRowsNamed(db, "Oldmember")).toHaveLength(1);
      expect(await accountRowsNamed(db, "Recentguest")).toHaveLength(1);
      expect((await post("/api/session", { token: recentGuest })).body).toMatchObject({
        isLoggedIn: true,
        isGuest: true,
      });
      const sameName = await post("/api/guests", {
        name: "Oldguest",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(sameName).toMatchObject({ status: 200, body: { isOk: true, name: "Oldguest" } });
    },
    STARTING_MS,
  );
});

describe("the match history and game record routes", () => {
  it(
    "list a player's games newest first 50 at a time and show a deleted player as Deleted player",
    async () => {
      const db = await routeTestDatabaseOf(server);
      const ann = await guestPlayerId(db, "Historyann");
      const bea = await guestPlayerId(db, "Historybea");
      const games = await saveGames(db, bea, ann);
      const first = await historyAt(`/api/players/${ann}/history`);
      expect(first.history).toMatchObject({ kind: "found", username: "Historyann" });
      expect(first.page?.games).toHaveLength(50);
      expect(first.page?.games[0]).toMatchObject({
        kind: "casual",
        result: "lost",
        place: 2,
        players: 2,
      });
      expect(first.page?.games[0]?.winner).toEqual({
        kind: "player",
        playerId: bea,
        username: "Historybea",
      });
      const older = first.page?.older;
      const cursor = `before_ms=${String(older?.endedAt)}&before_game=${String(older?.gameId)}`;
      const second = await historyAt(`/api/players/${ann}/history?${cursor}`);
      expect(second.page?.older).toBeNull();
      const listed = [...(first.page?.games ?? []), ...(second.page?.games ?? [])];
      expect(listed.map(({ gameId }) => gameId).sort()).toEqual([...games].sort());
      const endings = listed.map(({ endedAt }) => endedAt);
      expect(endings).toEqual([...endings].sort((a, b) => b - a));
      await db.prepare("DELETE FROM logins WHERE player_id = ?").bind(bea).run();
      await db.prepare("DELETE FROM players WHERE id = ?").bind(bea).run();
      const record = await getFromRoute(server, `/api/records/${String(games[0])}`);
      const found = v.parse(GameRecordResponse, record.body);
      expect(found.kind === "found" ? found.record.seats.map(({ player }) => player) : []).toEqual([
        { kind: "deleted" },
        { kind: "player", playerId: ann, username: "Historyann" },
      ]);
      const gone = await historyAt(`/api/players/${bea}/history`);
      expect(gone).toMatchObject({ status: 404, history: { kind: "account_gone" } });
    },
    STARTING_MS,
  );

  it("answers bad and unknown ids as not found and refuses a bad cursor", async () => {
    const badPlayer = await getFromRoute(server, "/api/players/not-a-player/history");
    expect(badPlayer).toEqual({ status: 404, body: { kind: "account_gone" } });
    const badGame = await getFromRoute(server, "/api/records/not-a-game");
    expect(badGame).toEqual({ status: 404, body: { kind: "not_found" } });
    const unknownGame = await getFromRoute(server, `/api/records/${crypto.randomUUID()}`);
    expect(unknownGame).toEqual({ status: 404, body: { kind: "not_found" } });
    const history = `/api/players/${crypto.randomUUID()}/history?`;
    const game = `before_game=${crypto.randomUUID()}`;
    const badCursors = ["before_ms=soon", game, `before_ms=&${game}`, "before_ms=1&before_game="];
    const answers = await Promise.all(
      badCursors.map(async (at) => getFromRoute(server, history + at)),
    );
    expect(answers.map(({ status }) => status)).toEqual([400, 400, 400, 400]);
    expect((await post(`/api/records/${crypto.randomUUID()}`, {})).status).toBe(405);
  });
});
