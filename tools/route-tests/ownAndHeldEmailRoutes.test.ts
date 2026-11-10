import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const CONFIRM_LINK = /#confirm=([0-9a-f]{64})/u;
const OK = { status: 200, body: { isOk: true } };
const ALREADY_IN_USE = "MarketLaw: This email address is already in use";

let server: TestHarness;

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function signUp(username: string, email: string): Promise<string> {
  const password = "steady-pier-41";
  return tokenOf(
    await post("/api/signups", { username, email, password, humanCheck: HUMAN_CHECK }),
  );
}

async function newestLinkTo(email: string): Promise<string> {
  const text = (await readTestOutbox(server, email)).emails[0]?.text ?? "";
  return CONFIRM_LINK.exec(text)?.[1] ?? "";
}

async function confirmedSignup(username: string, email: string): Promise<string> {
  const token = await signUp(username, email);
  await post("/api/email-confirmations", { link: await newestLinkTo(email) });
  return token;
}

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("an address confirmed on another account", () => {
  it(
    "is kept unconfirmed at signup and Send it again says it is already in use",
    async () => {
      const entered = "Held.Address+2@example.com";
      await confirmedSignup("Addressholder", "held.address@example.com");
      const token = await signUp("Addresstaker", entered);
      expect((await post("/api/account", { token })).body).toMatchObject({
        email: { address: entered, isConfirmed: false, pendingAddress: null, wasRemoved: false },
      });
      expect(await post("/api/confirmation-emails", { token })).toEqual(OK);
      const sent = await readTestOutbox(server, entered);
      expect(sent.emails.map(({ subject }) => subject)).toEqual([ALREADY_IN_USE, ALREADY_IN_USE]);
    },
    STARTING_MS,
  );
});

describe("an email change to the account's own confirmed address", () => {
  it(
    "changes nothing, sends nothing and drops a pending change",
    async () => {
      const token = await confirmedSignup("Ownchanger", "own.confirmed@example.com");
      const change = { token, humanCheck: HUMAN_CHECK };
      await post("/api/email-changes", { ...change, email: "own.pending@example.com" });
      const pendingLink = await newestLinkTo("own.pending@example.com");
      const sameAddress = "Own.Confirmed+1@example.com";
      expect(await post("/api/email-changes", { ...change, email: sameAddress })).toEqual(OK);
      expect((await post("/api/account", { token })).body).toMatchObject({
        email: { address: "own.confirmed@example.com", isConfirmed: true, pendingAddress: null },
      });
      expect((await readTestOutbox(server, sameAddress)).emails).toEqual([]);
      expect(await post("/api/email-confirmations", { link: pendingLink })).toEqual({
        status: 400,
        body: { isOk: false, reason: "link_expired" },
      });
    },
    STARTING_MS,
  );
});
