import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { LOGIN_TIMES } from "../../src/server/accounts/LOGIN_TIMES.ts";
import { postToRoute } from "./postToRoute.ts";
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

let server: TestHarness;

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

function logsShowing(secrets: ReadonlyArray<string>): ReadonlyArray<string> {
  const lowerCaseSecrets = secrets.map((secret) => secret.toLowerCase());
  const logs: ReadonlyArray<unknown> = server.getLogs();
  return logs
    .map((log) => v.parse(LOGGED_LINE, log).message)
    .filter((message) => lowerCaseSecrets.some((secret) => message.toLowerCase().includes(secret)));
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

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the account routes", () => {
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
