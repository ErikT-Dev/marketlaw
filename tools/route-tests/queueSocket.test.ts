import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { LOGGED_OUT_CLOSE_CODE } from "../../src/shared/LOGGED_OUT_CLOSE_CODE.ts";
import { postToRoute } from "./postToRoute.ts";
import { QueueSocket } from "./QueueSocket.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "quiet-harbour-77";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;
const CLOSED_LEAVE_MS = 10_000;
const CLOSED_LEAVE_WAITING_MS = 20_000;
const SHORTER_THAN_CLOSED_LEAVE_MS = 5_000;
const FORGED_TOKEN = "0123456789abcdef0123456789abcdef";
const CONFIRM_LINK = /#confirm=([0-9a-f]{64})/u;
const EMPTY_COUNTS = { total: 0, bySize: { 2: 0, 3: 0, 4: 0 } };

let server: TestHarness;
let serverUrl: URL;
const openSockets: QueueSocket[] = [];

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

async function registeredToken(name: string, isEmailConfirmed: boolean): Promise<string> {
  const token = await newGuestToken(name);
  const email = `${name}@example.com`;
  await post("/api/signups", { token, email, password: PASSWORD, humanCheck: DUMMY_HUMAN_CHECK });
  if (isEmailConfirmed) {
    const text = (await readTestOutbox(server, email)).emails[0]?.text ?? "";
    await post("/api/email-confirmations", { link: CONFIRM_LINK.exec(text)?.[1] ?? "" });
  }
  return token;
}

async function queueSocket(): Promise<QueueSocket> {
  const socket = await QueueSocket.open(serverUrl);
  openSockets.push(socket);
  await vi.waitFor(() => {
    expect(socket.latestView()).not.toBeNull();
  }, WAITING_MS);
  return socket;
}

async function rejectionsAfter(socket: QueueSocket, send: () => void): Promise<unknown> {
  const before = socket.rejections().length;
  send();
  await vi.waitFor(() => {
    expect(socket.rejections().length).toBe(before + 1);
  }, WAITING_MS);
  return socket.rejections().at(-1);
}

beforeAll(async () => {
  server = await startRouteTestServer();
  serverUrl = (await server.listen()).url;
}, STARTING_MS);

afterAll(async () => {
  for (const socket of openSockets) {
    socket.close();
  }
  await server.close();
});

describe("the ranked queue socket refuses hostile messages", () => {
  it(
    "rejects malformed messages, forged tokens and intents out of place and changes nothing",
    async () => {
      const guest = await newGuestToken("Queueguest");
      const unconfirmed = await registeredToken("Queueunconfirmed", false);
      const socket = await queueSocket();
      expect(socket.latestView()).toEqual({
        counts: EMPTY_COUNTS,
        own: { kind: "out", rejoinAt: null, dailyLimit: null },
        isSiteGameLimitReached: false,
      });
      expect(
        await rejectionsAfter(socket, () => {
          socket.sendText("not json");
        }),
      ).toBe("malformed_message");
      expect(
        await rejectionsAfter(socket, () => {
          socket.sendText(JSON.stringify({ protocolVersion: 1, type: "resync", token: guest }));
        }),
      ).toBe("wrong_protocol_version");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(guest, { type: "join_queue", sizes: "2" });
        }),
      ).toBe("malformed_message");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(FORGED_TOKEN, { type: "join_queue", sizes: null });
        }),
      ).toBe("invalid_token");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(guest, { type: "join_queue", sizes: null });
        }),
      ).toBe("not_registered");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(unconfirmed, { type: "join_queue", sizes: [3] });
        }),
      ).toBe("email_not_confirmed");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(unconfirmed, { type: "leave_queue" });
        }),
      ).toBe("not_in_queue");
      expect(
        await rejectionsAfter(socket, () => {
          socket.send(unconfirmed, { type: "confirm_match" });
        }),
      ).toBe("no_match_to_confirm");
      const sentAt = Date.now();
      socket.send(unconfirmed, { type: "resync" });
      await vi.waitFor(() => {
        expect(socket.messages.at(-1)?.type).toBe("queue");
      }, WAITING_MS);
      expect(socket.latestView()?.counts).toEqual(EMPTY_COUNTS);
      const latest = socket.messages.at(-1);
      expect(latest?.type === "queue" ? latest.serverNow : 0).toBeGreaterThanOrEqual(sentAt);
    },
    STARTING_MS,
  );
});

describe("a ranked match through the queue socket", () => {
  it(
    "matches two players without names, keeps them out of rooms and starts a ranked room",
    async () => {
      const ann = await registeredToken("Queueann", true);
      const bea = await registeredToken("Queuebea", true);
      const [annSocket, beaSocket, watcher] = [
        await queueSocket(),
        await queueSocket(),
        await queueSocket(),
      ];
      annSocket.send(ann, { type: "join_queue", sizes: [2] });
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts).toEqual({ total: 1, bySize: { 2: 1, 3: 0, 4: 0 } });
        expect(annSocket.latestView()?.own).toEqual({ kind: "waiting", sizes: [2] });
      }, WAITING_MS);
      const created = await post("/api/rooms", {
        token: ann,
        size: 2,
        isPublic: false,
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(created).toMatchObject({ status: 409, body: { reason: "busy_elsewhere" } });

      beaSocket.send(bea, { type: "join_queue", sizes: [2, 3] });
      await vi.waitFor(() => {
        expect(annSocket.notices()).toEqual([{ kind: "match_found", size: 2 }]);
        expect(beaSocket.notices()).toEqual([{ kind: "match_found", size: 2 }]);
      }, WAITING_MS);
      expect(watcher.latestView()?.counts).toEqual(EMPTY_COUNTS);
      annSocket.send(ann, { type: "confirm_match" });
      beaSocket.send(bea, { type: "confirm_match" });
      await vi.waitFor(() => {
        expect(annSocket.notices().at(-1)?.kind).toBe("match_started");
        expect(beaSocket.notices().at(-1)).toEqual(annSocket.notices().at(-1));
      }, WAITING_MS);
      expect(watcher.notices()).toEqual([]);
      expect(JSON.stringify(watcher.messages)).not.toContain("Queueann");
      expect(annSocket.latestView()?.own).toEqual({
        kind: "out",
        rejoinAt: null,
        dailyLimit: null,
      });
    },
    STARTING_MS,
  );
});

describe("closed connections and logging out in the ranked queue", () => {
  it(
    "takes a player out of the queue 10 seconds after their last socket closed",
    async () => {
      const cat = await registeredToken("Queuecat", true);
      const catSocket = await queueSocket();
      const watcher = await queueSocket();
      catSocket.send(cat, { type: "join_queue", sizes: [4] });
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts.total).toBe(1);
      }, WAITING_MS);
      catSocket.close();
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts).toEqual(EMPTY_COUNTS);
      }, CLOSED_LEAVE_WAITING_MS);
    },
    STARTING_MS,
  );

  it(
    "closes the queue socket of a login that logs out and takes it out of the queue 10 seconds later",
    async () => {
      const dan = await registeredToken("Queuedan", true);
      const danSocket = await queueSocket();
      const watcher = await queueSocket();
      danSocket.send(dan, { type: "join_queue", sizes: [4] });
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts.total).toBe(1);
      }, WAITING_MS);
      const loggedOutAt = Date.now();
      await post("/api/logout", { token: dan });
      await vi.waitFor(() => {
        expect(danSocket.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
      }, WAITING_MS);
      expect(watcher.latestView()?.counts.total).toBe(1);
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts).toEqual(EMPTY_COUNTS);
      }, CLOSED_LEAVE_WAITING_MS);
      expect(Date.now() - loggedOutAt).toBeGreaterThanOrEqual(CLOSED_LEAVE_MS);
    },
    STARTING_MS,
  );
});

describe("deleting an account in the ranked queue", () => {
  it(
    "takes the player out of the queue at once without the 10 second wait",
    async () => {
      const eve = await registeredToken("Queueeve", true);
      const eveSocket = await queueSocket();
      const watcher = await queueSocket();
      eveSocket.send(eve, { type: "join_queue", sizes: [4] });
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts.total).toBe(1);
      }, WAITING_MS);
      expect(await post("/api/account-deletions", { token: eve, password: PASSWORD })).toEqual({
        status: 200,
        body: { isOk: true },
      });
      await vi.waitFor(() => {
        expect(watcher.latestView()?.counts).toEqual(EMPTY_COUNTS);
        expect(eveSocket.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
      }, SHORTER_THAN_CLOSED_LEAVE_MS);
    },
    STARTING_MS,
  );

  it(
    "declines a match the player is confirming and puts the other player back in the queue",
    async () => {
      const fay = await registeredToken("Queuefay", true);
      const gus = await registeredToken("Queuegus", true);
      const [faySocket, gusSocket] = [await queueSocket(), await queueSocket()];
      faySocket.send(fay, { type: "join_queue", sizes: [2] });
      gusSocket.send(gus, { type: "join_queue", sizes: [2] });
      await vi.waitFor(() => {
        expect(gusSocket.notices()).toEqual([{ kind: "match_found", size: 2 }]);
      }, WAITING_MS);
      gusSocket.send(gus, { type: "confirm_match" });
      await post("/api/account-deletions", { token: fay, password: PASSWORD });
      await vi.waitFor(() => {
        expect(gusSocket.notices().at(-1)).toEqual({
          kind: "match_not_started",
          reason: "not_confirmed",
        });
        expect(gusSocket.latestView()?.own).toEqual({ kind: "waiting", sizes: [2] });
      }, WAITING_MS);
    },
    STARTING_MS,
  );
});
