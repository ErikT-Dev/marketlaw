import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { LOGGED_OUT_CLOSE_CODE } from "../../src/shared/LOGGED_OUT_CLOSE_CODE.ts";
import { postToRoute } from "./postToRoute.ts";
import { RoomSocket } from "./RoomSocket.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "harbour-lights-58";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;

let server: TestHarness;
let serverUrl: URL;
const openSockets: RoomSocket[] = [];

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

async function registeredTokens(name: string): Promise<readonly [string, string]> {
  const first = await newGuestToken(name);
  const email = `${name}@example.com`;
  await post("/api/signups", {
    token: first,
    email,
    password: PASSWORD,
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  const second = tokenOf(await post("/api/logins", { login: name, password: PASSWORD }));
  return [first, second];
}

async function roomCodeOf(ownerToken: string, joiningToken: string): Promise<string> {
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
  return code;
}

async function socketTo(code: string, token: string): Promise<RoomSocket> {
  const socket = await RoomSocket.open(serverUrl, code, token);
  openSockets.push(socket);
  return socket;
}

async function startedGame(watcher: RoomSocket, accepting: ReadonlyArray<RoomSocket>) {
  await vi.waitFor(() => {
    expect(watcher.latestUpdate()?.room.asking).not.toBeNull();
  }, WAITING_MS);
  for (const socket of accepting) {
    socket.send({ type: "room", action: { type: "accept_game" } });
  }
  await vi.waitFor(() => {
    expect(watcher.latestUpdate()?.game).not.toBeNull();
  }, WAITING_MS);
  return watcher.latestUpdate()?.room.mySeat ?? null;
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

describe("logging out of a room as a registered user", () => {
  it(
    "closes only that login's sockets, keeps the seat and shows it away once no login is connected",
    async () => {
      const [firstLogin, secondLogin] = await registeredTokens("Roomlogout");
      const otherPlayer = await newGuestToken("Roomwatcher");
      const code = await roomCodeOf(firstLogin, otherPlayer);
      const firstBrowser = await socketTo(code, firstLogin);
      const secondBrowser = await socketTo(code, secondLogin);
      const watcher = await socketTo(code, otherPlayer);
      const watcherSeat = await startedGame(watcher, [firstBrowser, watcher]);
      const loggingOutSeat = watcherSeat === 1 ? 2 : 1;

      expect(await post("/api/logout", { token: firstLogin })).toEqual({
        status: 200,
        body: { isLoggedIn: false },
      });
      await vi.waitFor(() => {
        expect(firstBrowser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
      }, WAITING_MS);
      expect(secondBrowser.closeCode).toBeNull();
      expect(watcher.closeCode).toBeNull();
      expect(watcher.latestUpdate()?.game?.awaySeats).toEqual([]);

      await post("/api/logout", { token: secondLogin });
      await vi.waitFor(() => {
        expect(secondBrowser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
        expect(watcher.latestUpdate()?.game?.awaySeats).toEqual([loggingOutSeat]);
      }, WAITING_MS);
      expect(watcher.closeCode).toBeNull();
      expect(watcher.latestUpdate()?.room.playerNames).toContain("Roomlogout");
    },
    STARTING_MS,
  );
});
