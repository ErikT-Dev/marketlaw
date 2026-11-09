import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "quiet-harbour-71";
const WRONG_PASSWORD = "loud-harbour-17";
const EMAIL = "Route.Tester+logs@example.com";
const STARTING_MS = 30_000;
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
      const signup = await post("/api/signups", {
        token: guestToken,
        email: EMAIL,
        password: PASSWORD,
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(signup).toMatchObject({ status: 200, body: { isOk: true, token: guestToken } });
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
});
