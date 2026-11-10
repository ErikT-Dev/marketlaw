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
const RESET_LINK = /#reset=([0-9a-f]{64})/u;
const LINK_EXPIRED = { status: 400, body: { isOk: false, reason: "link_expired" } };
const OK = { status: 200, body: { isOk: true } };

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

function linkTokenOf(text: string | undefined, link = CONFIRM_LINK): string {
  return link.exec(text ?? "")?.[1] ?? "";
}

async function newestLinkTo(email: string, link = CONFIRM_LINK): Promise<string> {
  return linkTokenOf((await readTestOutbox(server, email)).emails[0]?.text, link);
}

async function confirmedSignup(username: string, email: string): Promise<string> {
  const token = tokenOf(await signUp(username, email));
  await post("/api/email-confirmations", { link: await newestLinkTo(email) });
  return token;
}

async function emailOf(username: string): Promise<unknown> {
  const { results } = await db
    .prepare("SELECT email, is_email_confirmed FROM players WHERE name = ?")
    .bind(username)
    .all();
  return results[0];
}

async function requestReset(email: string, humanCheck = DUMMY_HUMAN_CHECK) {
  return post("/api/reset-emails", { email, humanCheck });
}

async function setPasswordWith(link: string, password: string) {
  return post("/api/password-resets", { link, password });
}

async function logIn(login: string, password: string) {
  return post("/api/logins", { login, password });
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

describe("the email link routes", () => {
  it(
    "confirms an address once and removes it from the other account that entered it",
    async () => {
      await signUp("Firstenter", "shared.address@example.com");
      await signUp("Secondenter", "Shared.Address+games@example.com");
      const firstLink = await newestLinkTo("shared.address@example.com");
      const secondLink = await newestLinkTo("Shared.Address+games@example.com");
      expect(await post("/api/email-confirmations", { link: secondLink })).toEqual(OK);
      expect(await post("/api/email-confirmations", { link: secondLink })).toEqual(LINK_EXPIRED);
      expect(await post("/api/email-confirmations", { link: firstLink })).toEqual(LINK_EXPIRED);
      expect(await emailOf("Firstenter")).toEqual({ email: null, is_email_confirmed: 0 });
      expect(await emailOf("Secondenter")).toEqual({
        email: "Shared.Address+games@example.com",
        is_email_confirmed: 1,
      });
    },
    STARTING_MS,
  );

  it(
    "refuses a confirmation link that was replaced or has expired",
    async () => {
      const email = "late.confirmer@example.com";
      const token = tokenOf(await signUp("Lateconfirmer", email));
      const replacedLink = await newestLinkTo(email);
      await post("/api/confirmation-emails", { token });
      const newestLink = await newestLinkTo(email);
      expect(await post("/api/email-confirmations", { link: replacedLink })).toEqual(LINK_EXPIRED);
      await db.prepare("UPDATE email_links SET expires_ms = 0 WHERE kind = 'confirm'").run();
      expect(await post("/api/email-confirmations", { link: newestLink })).toEqual(LINK_EXPIRED);
      expect(await emailOf("Lateconfirmer")).toEqual({ email, is_email_confirmed: 0 });
    },
    STARTING_MS,
  );

  it(
    "sends a reset link only for a confirmed address and sets a new password with it",
    async () => {
      const email = "reset.player@example.com";
      const firstLogin = await confirmedSignup("Resetplayer", email);
      await signUp("Neverconfirmed", "never.confirmed@example.com");
      expect(await requestReset("RESET.player+x@example.com", "")).toEqual({
        status: 400,
        body: { isOk: false, reason: "human_check_failed" },
      });
      expect(await requestReset("never.confirmed@example.com")).toEqual({
        status: 400,
        body: { isOk: false, reason: "email_not_confirmed" },
      });
      expect(await requestReset("RESET.player+x@example.com")).toEqual(OK);
      const resetLink = await newestLinkTo(email, RESET_LINK);
      const newPassword = "quiet-harbour-77";
      expect(await setPasswordWith(resetLink, "short")).toEqual({
        status: 400,
        body: { isOk: false, reason: "password_invalid" },
      });
      const answer = await setPasswordWith(resetLink, newPassword);
      expect(answer).toMatchObject({ status: 200, body: { isOk: true, name: "Resetplayer" } });
      const newLogin = tokenOf(answer);
      expect(await setPasswordWith(resetLink, newPassword)).toEqual(LINK_EXPIRED);
      expect(await post("/api/confirmation-emails", { token: firstLogin })).toMatchObject({
        status: 401,
      });
      expect(await post("/api/confirmation-emails", { token: newLogin })).toEqual(OK);
      expect(await logIn("Resetplayer", PASSWORD)).toMatchObject({ status: 400 });
      expect(await logIn("Resetplayer", newPassword)).toMatchObject({ status: 200 });
      const secrets = [resetLink, newPassword, newLogin, email];
      expect(
        loggedLines().filter((line) => secrets.some((secret) => line.includes(secret))),
      ).toEqual([]);
    },
    STARTING_MS,
  );

  it(
    "refuses a reset link that has expired",
    async () => {
      const email = "slow.resetter@example.com";
      await confirmedSignup("Slowresetter", email);
      await post("/api/reset-emails", { email, humanCheck: DUMMY_HUMAN_CHECK });
      await db.prepare("UPDATE email_links SET expires_ms = 0 WHERE kind = 'reset'").run();
      const link = await newestLinkTo(email, RESET_LINK);
      expect(await post("/api/password-resets", { link, password: "fresh-meadow-12" })).toEqual(
        LINK_EXPIRED,
      );
    },
    STARTING_MS,
  );
});

describe("the email change route", () => {
  it(
    "keeps the old address until the new one is confirmed and removes it from the other account",
    async () => {
      const token = await confirmedSignup("Emailchanger", "old.address@example.com");
      const otherToken = tokenOf(await signUp("Otherenterer", "New.Address+x@example.com"));
      const change = { token, email: "new.address@example.com", humanCheck: DUMMY_HUMAN_CHECK };
      expect(await post("/api/email-changes", { ...change, humanCheck: "" })).toEqual({
        status: 400,
        body: { isOk: false, reason: "human_check_failed" },
      });
      await post("/api/email-changes", { ...change, email: "replaced.address@example.com" });
      const replacedLink = await newestLinkTo("replaced.address@example.com");
      expect(await post("/api/email-changes", change)).toEqual(OK);
      const pending = await post("/api/account", { token });
      expect(pending.body).toMatchObject({
        email: {
          address: "old.address@example.com",
          isConfirmed: true,
          pendingAddress: "new.address@example.com",
          wasRemoved: false,
        },
      });
      expect(await post("/api/email-confirmations", { link: replacedLink })).toEqual(LINK_EXPIRED);
      const changeLink = await newestLinkTo("new.address@example.com");
      expect(await post("/api/email-confirmations", { link: changeLink })).toEqual(OK);
      expect((await post("/api/account", { token })).body).toMatchObject({
        email: { address: "new.address@example.com", isConfirmed: true, pendingAddress: null },
      });
      expect((await post("/api/account", { token: otherToken })).body).toMatchObject({
        email: { address: null, isConfirmed: false, pendingAddress: null, wasRemoved: true },
      });
      const readded = { token: otherToken, email: "own.address@example.com" };
      expect(
        await post("/api/email-changes", { ...readded, humanCheck: DUMMY_HUMAN_CHECK }),
      ).toEqual(OK);
    },
    STARTING_MS,
  );

  it(
    "refuses an email change to a guest",
    async () => {
      const guest = await post("/api/guests", {
        name: "Changeguest",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      const change = { email: "guest.change@example.com", humanCheck: DUMMY_HUMAN_CHECK };
      expect(await post("/api/email-changes", { ...change, token: tokenOf(guest) })).toEqual({
        status: 400,
        body: { isOk: false, reason: "not_registered" },
      });
    },
    STARTING_MS,
  );
});
