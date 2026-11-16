import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import { QueueSocket } from "./QueueSocket.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import { RoomSocket } from "./RoomSocket.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "copper-lantern-41";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;
const CONFIRM_LINK = /#confirm=([0-9a-f]{64})/u;
const ONE_GAME_A_DAY = { TEST_SITE_GAMES_PER_DAY: "1" };

let server: TestHarness;
let serverUrl: URL;
const openSockets: Array<QueueSocket | RoomSocket> = [];

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

async function confirmedToken(name: string): Promise<string> {
  const token = await newGuestToken(name);
  const email = `${name}@example.com`;
  await post("/api/signups", { token, email, password: PASSWORD, humanCheck: DUMMY_HUMAN_CHECK });
  const text = (await readTestOutbox(server, email)).emails[0]?.text ?? "";
  await post("/api/email-confirmations", { link: CONFIRM_LINK.exec(text)?.[1] ?? "" });
  return token;
}

async function startRoomGame(ownerToken: string, joiningToken: string): Promise<void> {
  const created = await post("/api/rooms", {
    token: ownerToken,
    size: 2,
    isPublic: false,
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  const { code } = created.body;
  if (typeof code !== "string") {
    throw new Error(`The room was not created: ${String(created.status)}`);
  }
  await post(`/api/rooms/${code}/join`, { token: joiningToken });
  const sockets = [
    await RoomSocket.open(serverUrl, code, ownerToken),
    await RoomSocket.open(serverUrl, code, joiningToken),
  ];
  openSockets.push(...sockets);
  const [watcher] = sockets;
  await vi.waitFor(() => {
    expect(watcher?.latestUpdate()?.room.asking).not.toBeNull();
  }, WAITING_MS);
  for (const socket of sockets) {
    socket.send({ type: "room", action: { type: "accept_game" } });
  }
  await vi.waitFor(() => {
    expect(watcher?.latestUpdate()?.game).not.toBeNull();
  }, WAITING_MS);
}

beforeAll(async () => {
  server = await startRouteTestServer(ONE_GAME_A_DAY);
  serverUrl = (await server.listen()).url;
}, STARTING_MS);

afterAll(async () => {
  for (const socket of openSockets) {
    socket.close();
  }
  await server.close();
});

describe("the site game limit reached by a room game", () => {
  it(
    "tells the players in the ranked queue at once that the site game limit is reached",
    async () => {
      const ann = await confirmedToken("Limitann");
      const annSocket = await QueueSocket.open(serverUrl);
      openSockets.push(annSocket);
      annSocket.send(ann, { type: "join_queue", sizes: [2] });
      await vi.waitFor(() => {
        expect(annSocket.latestView()?.own).toEqual({ kind: "waiting", sizes: [2] });
      }, WAITING_MS);
      expect(annSocket.latestView()?.isSiteGameLimitReached).toBe(false);

      await startRoomGame(await newGuestToken("Limitbea"), await newGuestToken("Limitcat"));
      await vi.waitFor(() => {
        expect(annSocket.latestView()?.isSiteGameLimitReached).toBe(true);
      }, WAITING_MS);
      expect(annSocket.latestView()?.own).toEqual({ kind: "waiting", sizes: [2] });
    },
    STARTING_MS,
  );
});
