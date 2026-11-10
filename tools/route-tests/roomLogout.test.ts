import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { TestHarness } from "wrangler";
import { LOGGED_OUT_CLOSE_CODE } from "../../src/shared/LOGGED_OUT_CLOSE_CODE.ts";
import { postToRoute } from "./postToRoute.ts";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";
import { routeTestDatabaseOf } from "./routeTestDatabaseOf.ts";
import { RoomSocket } from "./RoomSocket.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const PASSWORD = "harbour-lights-58";
const STARTING_MS = 30_000;
const WAITING_MS = 10_000;

let server: TestHarness;
let serverUrl: URL;
let db: RouteTestDatabase;
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

async function startGame(watcher: RoomSocket, accepting: ReadonlyArray<RoomSocket>) {
  await vi.waitFor(() => {
    expect(watcher.latestUpdate()?.room.asking).not.toBeNull();
  }, WAITING_MS);
  for (const socket of accepting) {
    socket.send({ type: "room", action: { type: "accept_game" } });
  }
  await vi.waitFor(() => {
    expect(watcher.latestUpdate()?.game).not.toBeNull();
  }, WAITING_MS);
}

async function playerIdNamed(name: string): Promise<string> {
  const { results } = await db.prepare("SELECT id FROM players WHERE name = ?").bind(name).all();
  return v.parse(v.tuple([v.object({ id: v.string() })]), results)[0].id;
}

async function rowCountsOf(playerId: string): Promise<unknown> {
  const { results } = await db
    .prepare(
      "SELECT (SELECT COUNT(*) FROM players WHERE id = ?1) AS players, (SELECT COUNT(*) FROM logins WHERE player_id = ?1) AS logins, (SELECT COUNT(*) FROM email_links WHERE player_id = ?1) AS links",
    )
    .bind(playerId)
    .all();
  return results[0];
}

async function deleteAccount(token: string) {
  return post("/api/account-deletions", { token, password: PASSWORD });
}

beforeAll(async () => {
  server = await startRouteTestServer();
  serverUrl = (await server.listen()).url;
  db = await routeTestDatabaseOf(server);
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
      await startGame(watcher, [firstBrowser, watcher]);

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
        const update = watcher.latestUpdate();
        const loggingOutSeat = (update?.room.playerNames ?? []).indexOf("Roomlogout") + 1;
        expect(update?.game?.awaySeats).toEqual([loggingOutSeat]);
      }, WAITING_MS);
      expect(watcher.closeCode).toBeNull();
      expect(watcher.latestUpdate()?.room.playerNames).toContain("Roomlogout");
    },
    STARTING_MS,
  );
});

describe("deleting an account in a room", () => {
  it(
    "leaves the game, closes every login and removes the account and its links",
    async () => {
      const [firstLogin, secondLogin] = await registeredTokens("Roomdeleter");
      await post("/api/email-changes", {
        token: firstLogin,
        email: "Roomdeleter-new@example.com",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      const playerId = await playerIdNamed("Roomdeleter");
      expect(await rowCountsOf(playerId)).toEqual({ players: 1, logins: 2, links: 2 });
      const otherPlayer = await newGuestToken("Deletewatcher");
      const code = await roomCodeOf(firstLogin, otherPlayer);
      const firstBrowser = await socketTo(code, firstLogin);
      const secondBrowser = await socketTo(code, secondLogin);
      const watcher = await socketTo(code, otherPlayer);
      await startGame(watcher, [firstBrowser, watcher]);

      expect(await deleteAccount(firstLogin)).toEqual({ status: 200, body: { isOk: true } });
      await vi.waitFor(() => {
        expect(firstBrowser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
        expect(secondBrowser.closeCode).toBe(LOGGED_OUT_CLOSE_CODE);
        expect(watcher.latestUpdate()?.game?.view.result).not.toBeNull();
      }, WAITING_MS);
      expect(watcher.closeCode).toBeNull();
      expect(await rowCountsOf(playerId)).toEqual({ players: 0, logins: 0, links: 0 });
      expect(await post("/api/session", { token: secondLogin })).toEqual({
        status: 200,
        body: { isLoggedIn: false },
      });
      const reused = await post("/api/guests", {
        name: "Roomdeleter",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      expect(reused.status).toBe(200);
    },
    STARTING_MS,
  );

  it(
    "leaves a room the player is waiting in",
    async () => {
      const [owner] = await registeredTokens("Waitdeleter");
      const otherPlayer = await newGuestToken("Waitwatcher");
      const code = await roomCodeOf(owner, otherPlayer);
      const watcher = await socketTo(code, otherPlayer);
      await vi.waitFor(() => {
        expect(watcher.latestUpdate()?.room.playerNames).toContain("Waitdeleter");
      }, WAITING_MS);

      expect(await deleteAccount(owner)).toEqual({ status: 200, body: { isOk: true } });
      await vi.waitFor(() => {
        expect(watcher.latestUpdate()?.room.playerNames).toEqual(["Waitwatcher"]);
      }, WAITING_MS);
    },
    STARTING_MS,
  );
});
