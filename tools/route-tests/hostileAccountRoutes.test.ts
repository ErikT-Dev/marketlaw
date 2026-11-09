import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { accountTablesOf } from "./accountTablesOf.ts";
import { postToRoute } from "./postToRoute.ts";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";
import { routeTestDatabaseOf } from "./routeTestDatabaseOf.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "steady-lantern-42";
const STARTING_MS = 30_000;
const UNKNOWN_TOKEN = "0123456789abcdef0123456789abcdef";
const MALFORMED = { unexpected: true };
const INVALID_TOKEN = { status: 401, body: { isOk: false, reason: "invalid_token" } };
const LOGGED_OUT = { status: 200, body: { isLoggedIn: false } };
const LOGIN_FAILED = { status: 400, body: { isOk: false, reason: "login_failed" } };
const MINUTE_MS = 60_000;

let server: TestHarness;
let db: RouteTestDatabase;
const tokens = { guest: "", registered: "", expiredGuest: "", expiredRegistered: "" };

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

async function expireLogin(token: string): Promise<void> {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.prepare("UPDATE logins SET last_used_ms = 0 WHERE token_hash = ?").bind(tokenHash).run();
}

function signupWith(token: string, username: string) {
  return { token, username, email: `${username}@example.com`, password: PASSWORD, humanCheck: "" };
}

async function expectNothingChangedBy(send: () => Promise<unknown>): Promise<void> {
  const before = await accountTablesOf(db);
  await send();
  expect(await accountTablesOf(db)).toEqual(before);
}

beforeAll(async () => {
  server = await startRouteTestServer();
  db = await routeTestDatabaseOf(server);
  tokens.guest = await newGuestToken("Hostileguest");
  const registered = await newGuestToken("Hostileuser");
  await post("/api/signups", {
    ...signupWith(registered, "Hostileuser"),
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  tokens.registered = registered;
  tokens.expiredGuest = await newGuestToken("Expiredguest");
  await expireLogin(tokens.expiredGuest);
  const expiredLogin = await post("/api/logins", { login: "Hostileuser", password: PASSWORD });
  tokens.expiredRegistered = tokenOf(expiredLogin);
  await expireLogin(tokens.expiredRegistered);
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the account routes refuse hostile requests", () => {
  it("rejects a malformed body on every account route and changes nothing", async () => {
    await expectNothingChangedBy(async () => {
      const malformedMessage = { status: 400, body: { isOk: false, reason: "malformed_message" } };
      expect(await post("/api/signups", MALFORMED)).toEqual(malformedMessage);
      expect(await post("/api/logins", MALFORMED)).toEqual(malformedMessage);
      expect(await post("/api/username-changes", MALFORMED)).toEqual(malformedMessage);
      expect(await post("/api/logout", MALFORMED)).toEqual({ ...LOGGED_OUT, status: 400 });
      expect(await post("/api/account", MALFORMED)).toEqual({ ...LOGGED_OUT, status: 400 });
    });
  });

  it("refuses a signup with an unknown, a registered or an expired guest login", async () => {
    await expectNothingChangedBy(async () => {
      expect(await post("/api/signups", signupWith(UNKNOWN_TOKEN, "Newname"))).toEqual(
        INVALID_TOKEN,
      );
      expect(await post("/api/signups", signupWith(tokens.registered, "Newname"))).toEqual(
        INVALID_TOKEN,
      );
      expect(await post("/api/signups", signupWith(tokens.expiredGuest, "Newname"))).toEqual(
        INVALID_TOKEN,
      );
    });
  });

  it("refuses a username change with an unknown or expired login", async () => {
    await expectNothingChangedBy(async () => {
      const unknown = await post("/api/username-changes", {
        token: UNKNOWN_TOKEN,
        username: "Newname",
      });
      expect(unknown).toEqual(INVALID_TOKEN);
      const expired = await post("/api/username-changes", {
        token: tokens.expiredRegistered,
        username: "Newname",
      });
      expect(expired).toEqual(INVALID_TOKEN);
    });
  });

  it("answers logged out for the account of an unknown or expired login", async () => {
    await expectNothingChangedBy(async () => {
      expect(await post("/api/account", { token: UNKNOWN_TOKEN })).toEqual(LOGGED_OUT);
      expect(await post("/api/account", { token: tokens.expiredRegistered })).toEqual(LOGGED_OUT);
    });
  });

  it("answers logged out to a logout with an unknown login and changes nothing", async () => {
    await expectNothingChangedBy(async () => {
      expect(await post("/api/logout", { token: UNKNOWN_TOKEN })).toEqual(LOGGED_OUT);
    });
  });

  it("answers username_taken with 409 when the name is taken between the check and the write", async () => {
    const token = await newGuestToken("Racerone");
    await db
      .prepare(
        "CREATE TRIGGER lose_name_race BEFORE UPDATE OF name_key ON players WHEN NEW.name_key = 'racewinner' BEGIN SELECT RAISE(IGNORE); END",
      )
      .run();
    const usernameTaken = { status: 409, body: { isOk: false, reason: "username_taken" } };
    await expectNothingChangedBy(async () => {
      const renamed = await post("/api/username-changes", { token, username: "Racewinner" });
      expect(renamed).toEqual(usernameTaken);
      const signedUp = await post("/api/signups", {
        ...signupWith(token, "Racewinner"),
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(signedUp).toEqual(usernameTaken);
    });
    await db.prepare("DROP TRIGGER lose_name_race").run();
  });

  it("asks for the human check after 3 failed logins with an unknown username", async () => {
    const attempt = { login: "Nobodyhere", password: "wrong-password-1" };
    expect(await post("/api/logins", attempt)).toEqual(LOGIN_FAILED);
    expect(await post("/api/logins", attempt)).toEqual(LOGIN_FAILED);
    expect(await post("/api/logins", attempt)).toEqual(LOGIN_FAILED);
    expect(await post("/api/logins", attempt)).toEqual({
      status: 400,
      body: { isOk: false, reason: "human_check_failed" },
    });
    const { unknownLoginFailures } = await accountTablesOf(db);
    expect(unknownLoginFailures).toHaveLength(1);
    expect(JSON.stringify(unknownLoginFailures).toLowerCase()).not.toContain("nobodyhere");
    const scheduledTime = new Date(Date.now() + 16 * MINUTE_MS);
    await server.getWorker().scheduled({ cron: "17 3 * * *", scheduledTime });
    expect((await accountTablesOf(db)).unknownLoginFailures).toEqual([]);
  });
});
