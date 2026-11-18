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

type Player = { readonly tokens: readonly [string, string]; readonly playerId: string };

let server: TestHarness;
let serverUrl: URL;
const openSockets: RoomSocket[] = [];

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function registeredPlayer(name: string): Promise<Player> {
  const guest = await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK });
  const { playerId } = guest.body;
  if (typeof playerId !== "string") {
    throw new Error(`The guest was not created: ${String(guest.status)}`);
  }
  const first = tokenOf(guest);
  await post("/api/signups", {
    token: first,
    email: `${name}@example.com`,
    password: PASSWORD,
    humanCheck: DUMMY_HUMAN_CHECK,
  });
  const second = tokenOf(await post("/api/logins", { login: name, password: PASSWORD }));
  return { tokens: [first, second], playerId };
}

async function tutorialSocketOf(player: Player, token: string): Promise<RoomSocket> {
  const socket = await RoomSocket.openAt(
    serverUrl,
    `/api/tutorials/${player.playerId}/socket`,
    token,
  );
  openSockets.push(socket);
  await vi.waitFor(() => {
    expect(socket.messages.some(({ type }) => type === "tutorial_update")).toBe(true);
  }, WAITING_MS);
  return socket;
}

async function inTutorial(name: string): Promise<Player> {
  const player = await registeredPlayer(name);
  expect((await post("/api/tutorials", { token: player.tokens[0] })).status).toBe(200);
  return player;
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

describe("logging out during the tutorial", () => {
  it(
    "closes that login's tutorial socket and keeps the tutorial for the other login",
    async () => {
      const player = await inTutorial("Tutoriallogout");
      const browser = await tutorialSocketOf(player, player.tokens[0]);

      await post("/api/logout", { token: player.tokens[0] });
      await vi.waitFor(() => {
        expect(browser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
      }, WAITING_MS);
      const otherLogin = await tutorialSocketOf(player, player.tokens[1]);
      expect(otherLogin.closeCode).toBeNull();
    },
    STARTING_MS,
  );
});

describe("deleting the account during the tutorial", () => {
  it(
    "closes the tutorial socket of every login",
    async () => {
      const player = await inTutorial("Tutorialdeleter");
      const browser = await tutorialSocketOf(player, player.tokens[1]);

      expect(
        await post("/api/account-deletions", { token: player.tokens[0], password: PASSWORD }),
      ).toEqual({ status: 200, body: { isOk: true } });
      await vi.waitFor(() => {
        expect(browser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
      }, WAITING_MS);
    },
    STARTING_MS,
  );
});
