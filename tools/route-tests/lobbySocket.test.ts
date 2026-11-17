import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { LobbySocket } from "./LobbySocket.ts";
import { postToRoute } from "./postToRoute.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;
const FORGED_TOKEN = "0123456789abcdef0123456789abcdef";

let server: TestHarness;
let serverUrl: URL;
const openSockets: LobbySocket[] = [];

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await postToRoute(server, "/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

async function lobbySocket(): Promise<LobbySocket> {
  const socket = await LobbySocket.open(serverUrl);
  openSockets.push(socket);
  await vi.waitFor(() => {
    expect(socket.messages.length).toBeGreaterThan(0);
  }, WAITING_MS);
  return socket;
}

async function expectOnline(socket: LobbySocket, expected: unknown): Promise<void> {
  await vi.waitFor(() => {
    expect(socket.playersOnline()).toEqual(expected);
  }, WAITING_MS);
}

async function rejectionAfter(socket: LobbySocket, send: () => void): Promise<string | undefined> {
  const before = socket.rejections.length;
  send();
  await vi.waitFor(() => {
    expect(socket.rejections.length).toBe(before + 1);
  }, WAITING_MS);
  return socket.rejections.at(-1);
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

describe("the lobby socket lists the players online", () => {
  it("lists each identified player once by username until they log out or leave", async () => {
    const zoe = await newGuestToken("Onlinezoe");
    const amy = await newGuestToken("Onlineamy");
    const watcher = await lobbySocket();
    expect(watcher.playersOnline()).toEqual([]);
    const zoeTab = await lobbySocket();
    const zoeSecondTab = await lobbySocket();
    const amyTab = await lobbySocket();
    zoeTab.identify(zoe);
    zoeSecondTab.identify(zoe);
    amyTab.identify(amy);
    const both = [
      { username: "Onlineamy", rating: null, status: "online" },
      { username: "Onlinezoe", rating: null, status: "online" },
    ];
    await expectOnline(watcher, both);
    zoeTab.close();
    await expectOnline(amyTab, both);
    zoeSecondTab.close();
    await expectOnline(watcher, [{ username: "Onlineamy", rating: null, status: "online" }]);
    await postToRoute(server, "/api/logout", { token: amy });
    await expectOnline(watcher, []);
    await expectOnline(amyTab, []);
    expect(amyTab.rejections).toEqual([]);
  });

  it("shows a changed username to everyone", async () => {
    const token = await newGuestToken("Oldname");
    const watcher = await lobbySocket();
    const tab = await lobbySocket();
    tab.identify(token);
    await expectOnline(watcher, [{ username: "Oldname", rating: null, status: "online" }]);
    await postToRoute(server, "/api/username-changes", { token, username: "Newname" });
    await expectOnline(watcher, [{ username: "Newname", rating: null, status: "online" }]);
    expect(tab.rejections).toEqual([]);
    tab.close();
    await expectOnline(watcher, []);
  });

  it("rejects unreadable messages and forged tokens and lists nobody for them", async () => {
    const socket = await lobbySocket();
    expect(
      await rejectionAfter(socket, () => {
        socket.sendText("not json");
      }),
    ).toBe("malformed_message");
    expect(
      await rejectionAfter(socket, () => {
        socket.sendText(JSON.stringify({ protocolVersion: 1, type: "identify", token: "x" }));
      }),
    ).toBe("wrong_protocol_version");
    expect(
      await rejectionAfter(socket, () => {
        socket.identify(FORGED_TOKEN);
      }),
    ).toBe("invalid_token");
    expect(socket.playersOnline()).toEqual([]);
  });
});
