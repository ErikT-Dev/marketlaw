import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import { RoomCode } from "../../shared/RoomCode";
import { ClientStore } from "./ClientStore";
import { readSession } from "./readSession";
import { SESSION_KEY } from "./SESSION_KEY";
import { writeSession } from "./writeSession";

type SentRequest = { readonly path: string; readonly body: unknown };

function fakeHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function serverAnswers(answer: unknown): ReadonlyArray<SentRequest> {
  const sent: SentRequest[] = [];
  vi.stubGlobal("fetch", (path: string, init: { readonly body: string }) => {
    sent.push({ path, body: JSON.parse(init.body) });
    return Promise.resolve(Response.json(answer));
  });
  return sent;
}

const ACCOUNT = {
  isOk: true,
  token: "new-token",
  playerId: "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10",
  name: "Bea",
};
const SIGNUP = {
  username: "Bea",
  email: "bea@example.com",
  password: "long enough",
  humanCheck: "x",
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("logging in and signing up", () => {
  it("stores the session of a successful login as a registered user", async () => {
    const store = new ClientStore(() => fakeHost());
    const sent = serverAnswers(ACCOUNT);
    expect(await store.logIn({ login: "Bea", password: "long enough" })).toBeNull();
    expect(sent).toEqual([
      { path: "/api/logins", body: { login: "Bea", password: "long enough" } },
    ]);
    const session = {
      token: "new-token",
      playerId: ACCOUNT.playerId,
      name: "Bea",
      isGuest: false,
      roomCode: null,
    };
    expect(store.getSnapshot().session).toEqual(session);
    expect(readSession()).toEqual(session);
  });

  it("returns the reason of a refused login and stores nothing", async () => {
    const store = new ClientStore(() => fakeHost());
    serverAnswers({ isOk: false, reason: "login_failed" });
    expect(await store.logIn({ login: "Bea", password: "wrong one" })).toBe("login_failed");
    expect(store.getSnapshot().session).toBeNull();
    expect(readSession()).toBeNull();
  });

  it("signs up without a token when not logged in", async () => {
    const store = new ClientStore(() => fakeHost());
    const sent = serverAnswers(ACCOUNT);
    expect(await store.signUp(SIGNUP)).toBeNull();
    expect(sent).toEqual([{ path: "/api/signups", body: SIGNUP }]);
    expect(store.getSnapshot().session?.isGuest).toBe(false);
  });

  it("signs up a guest with their token and keeps the room they are in", async () => {
    const roomCode = v.parse(RoomCode, "ABCDEF");
    writeSession({ token: "guest-token", playerId: null, name: "Ann", isGuest: true, roomCode });
    const sent = serverAnswers({ ...ACCOUNT, token: "guest-token" });
    const store = new ClientStore(() => fakeHost());
    expect(await store.signUp(SIGNUP)).toBeNull();
    expect(sent.at(-1)).toEqual({
      path: "/api/signups",
      body: { ...SIGNUP, token: "guest-token" },
    });
    expect(store.getSnapshot().session).toEqual({
      token: "guest-token",
      playerId: ACCOUNT.playerId,
      name: "Bea",
      isGuest: false,
      roomCode,
    });
  });

  it("reads a session stored before registered users as a guest", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: "t", name: "Ann", roomCode: null }));
    expect(readSession()).toEqual({
      token: "t",
      playerId: null,
      name: "Ann",
      isGuest: true,
      roomCode: null,
    });
  });
});
