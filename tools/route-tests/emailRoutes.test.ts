import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";
import { routeTestDatabaseOf } from "./routeTestDatabaseOf.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "bright-quay-58";
const STARTING_MS = 30_000;
const LOGGED_LINE = v.looseObject({ message: v.string() });
const CONFIRM_LINK = /#confirm=([0-9a-f]{64})/u;

let server: TestHarness;
let db: RouteTestDatabase;

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function signUp(username: string, email: string) {
  return post("/api/signups", {
    username,
    email,
    password: PASSWORD,
    humanCheck: DUMMY_HUMAN_CHECK,
  });
}

function linkTokenOf(text: string | undefined): string {
  return CONFIRM_LINK.exec(text ?? "")?.[1] ?? "";
}

function loggedLines(): ReadonlyArray<string> {
  const logs: ReadonlyArray<unknown> = server.getLogs();
  return logs.map((log) => v.parse(LOGGED_LINE, log).message.toLowerCase());
}

beforeAll(async () => {
  server = await startRouteTestServer();
  db = await routeTestDatabaseOf(server);
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the email routes", () => {
  it(
    "sends a confirmation link at signup and again on request until 3 emails a day",
    async () => {
      const email = "Mail.Tester+one@example.com";
      const signup = await signUp("Mailtester", email);
      expect(signup).toMatchObject({ status: 200, body: { isOk: true } });
      const token = tokenOf(signup);
      const first = await readTestOutbox(server, email);
      expect(first.emails).toHaveLength(1);
      expect(first.emails[0]?.subject).toBe("MarketLaw: Confirm your email address");
      const firstLink = linkTokenOf(first.emails[0]?.text);
      expect(firstLink).not.toBe("");
      expect(await post("/api/confirmation-emails", { token })).toEqual({
        status: 200,
        body: { isOk: true },
      });
      await post("/api/confirmation-emails", { token });
      const third = await readTestOutbox(server, email);
      expect(third.emails).toHaveLength(3);
      expect(linkTokenOf(third.emails[0]?.text)).not.toBe(firstLink);
      expect(await post("/api/confirmation-emails", { token })).toEqual({
        status: 429,
        body: { isOk: false, reason: "email_limit_reached" },
      });
      expect((await readTestOutbox(server, email)).emails).toHaveLength(3);
      const { results } = await db
        .prepare("SELECT counted_key, emails FROM email_counts ORDER BY counted_key")
        .all();
      expect(results.map((row) => JSON.stringify(row)).join(" ")).not.toContain("example.com");
      const links = await db.prepare("SELECT token_hash FROM email_links").all();
      expect(JSON.stringify(links.results)).not.toContain(firstLink);
      const secrets = [token, firstLink, PASSWORD, email.toLowerCase(), "mail.tester"];
      expect(
        loggedLines().filter((line) => secrets.some((secret) => line.includes(secret))),
      ).toEqual([]);
    },
    STARTING_MS,
  );

  it(
    "refuses a signup to an address that has had 3 emails today and changes nothing",
    async () => {
      const email = "counted.address@example.com";
      await signUp("Countone", email);
      await signUp("Counttwo", "COUNTED.address+2@example.com");
      await signUp("Countthree", email);
      expect(await signUp("Countfour", email)).toEqual({
        status: 429,
        body: { isOk: false, reason: "email_limit_reached" },
      });
      const { results } = await db
        .prepare("SELECT name FROM players WHERE name = ?")
        .bind("Countfour")
        .all();
      expect(results).toEqual([]);
    },
    STARTING_MS,
  );

  it(
    "refuses Send it again to a guest and to a token that logs nobody in",
    async () => {
      const guest = await post("/api/guests", { name: "Mailguest", humanCheck: DUMMY_HUMAN_CHECK });
      expect(await post("/api/confirmation-emails", { token: tokenOf(guest) })).toEqual({
        status: 400,
        body: { isOk: false, reason: "not_registered" },
      });
      expect(await post("/api/confirmation-emails", { token: "0".repeat(64) })).toEqual({
        status: 401,
        body: { isOk: false, reason: "invalid_token" },
      });
      expect(await post("/api/confirmation-emails", { token: 7 })).toEqual({
        status: 400,
        body: { isOk: false, reason: "malformed_message" },
      });
    },
    STARTING_MS,
  );
});
