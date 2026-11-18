import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import type { RouteAnswer } from "./RouteAnswer.ts";
import { RoomSocket } from "./RoomSocket.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;
const FOUR_TUTORIALS_A_DAY = { TEST_SITE_TUTORIALS_PER_DAY: "4" };

type Guest = { readonly token: string; readonly playerId: string };

let server: TestHarness;
let serverUrl: URL;
const openSockets: RoomSocket[] = [];

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuest(name: string): Promise<Guest> {
  const answer = await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK });
  const { playerId } = answer.body;
  if (typeof playerId !== "string") {
    throw new Error(`The guest was not created: ${String(answer.status)}`);
  }
  return { token: tokenOf(answer), playerId };
}

async function createRoom(token: string): Promise<RouteAnswer> {
  return post("/api/rooms", { token, size: 2, isPublic: true, humanCheck: DUMMY_HUMAN_CHECK });
}

async function startTutorial(token: string): Promise<RouteAnswer> {
  return post("/api/tutorials", { token });
}

beforeAll(async () => {
  server = await startRouteTestServer(FOUR_TUTORIALS_A_DAY);
  serverUrl = (await server.listen()).url;
}, STARTING_MS);

afterAll(async () => {
  for (const socket of openSockets) {
    socket.close();
  }
  await server.close();
});

describe("starting the tutorial from the lobby", () => {
  it("rejects a forged token", async () => {
    expect(await startTutorial("f".repeat(64))).toEqual({
      status: 401,
      body: { isOk: false, reason: "invalid_token" },
    });
  });

  it("keeps a player in the tutorial out of rooms", async () => {
    const ann = await newGuest("Tutorial Ann");
    expect(await startTutorial(ann.token)).toEqual({ status: 200, body: { isOk: true } });
    expect((await createRoom(ann.token)).body).toMatchObject({ reason: "busy_elsewhere" });
  });

  it("refuses the tutorial to a player waiting in a room", async () => {
    const bea = await newGuest("Tutorial Bea");
    expect((await createRoom(bea.token)).status).toBe(200);
    expect(await startTutorial(bea.token)).toEqual({
      status: 409,
      body: { isOk: false, reason: "busy_elsewhere" },
    });
  });

  it("frees the player when they leave the tutorial", async () => {
    const cat = await newGuest("Tutorial Cat");
    expect((await startTutorial(cat.token)).status).toBe(200);
    const socket = await RoomSocket.openAt(
      serverUrl,
      `/api/tutorials/${cat.playerId}/socket`,
      cat.token,
    );
    openSockets.push(socket);
    socket.send({
      type: "tutorial",
      actionId: "leave-1",
      stateVersion: 0,
      action: { type: "leave_tutorial" },
    });
    await vi.waitFor(() => {
      expect(socket.messages.some((message) => message.type === "removed")).toBe(true);
    }, WAITING_MS);
    await vi.waitFor(async () => {
      expect((await createRoom(cat.token)).status).toBe(200);
    }, WAITING_MS);
  });

  it("counts a start again from the tutorial and refuses starts over the daily cap", async () => {
    const dan = await newGuest("Tutorial Dan");
    expect((await startTutorial(dan.token)).status).toBe(200);
    expect((await startTutorial(dan.token)).status).toBe(200);
    expect(await startTutorial(dan.token)).toEqual({
      status: 409,
      body: { isOk: false, reason: "site_daily_cap" },
    });
  });
});
