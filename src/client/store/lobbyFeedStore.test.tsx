import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import type { LobbyFeedHandlers } from "../../shared/LobbyFeedHandlers";
import { PlayerId } from "../../shared/PlayerId";
import type { PlayerOnlineView } from "../../shared/protocol/PlayerOnlineView";
import { RoomCode } from "../../shared/RoomCode";
import { ClientStore } from "./ClientStore";
import { writeSession } from "./writeSession";

const ANN_ID = v.parse(PlayerId, "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10");
const ANN_ONLINE: PlayerOnlineView = {
  playerId: ANN_ID,
  username: "Ann",
  rating: 1043,
  status: "online",
};

function idleHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function storeWithLobbyFeed() {
  const feeds: LobbyFeedHandlers[] = [];
  const identified: string[] = [];
  let isOpen = false;
  let closeCount = 0;
  const store = new ClientStore(idleHost, (handlers) => {
    feeds.push(handlers);
    return {
      identify: (token) => {
        if (isOpen) {
          identified.push(token);
        }
        return isOpen;
      },
      close: () => {
        closeCount += 1;
      },
    };
  });
  function open(): void {
    isOpen = true;
    feeds[0]?.onOpen();
  }
  return { store, feeds, identified, open, closes: () => closeCount };
}

function answerEveryRequestWith(answer: unknown): void {
  vi.stubGlobal("fetch", () => Promise.resolve(Response.json(answer)));
}

beforeEach(() => {
  localStorage.clear();
  answerEveryRequestWith({ isLoggedIn: true, playerId: ANN_ID, name: "Ann", isGuest: false });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the lobby socket in the client store", () => {
  it("identifies with the session token every time the socket opens", () => {
    writeSession({
      token: "ann-token",
      playerId: ANN_ID,
      name: "Ann",
      isGuest: false,
      roomCode: null,
    });
    const { feeds, identified, open } = storeWithLobbyFeed();
    open();
    open();
    expect(feeds).toHaveLength(1);
    expect(identified).toEqual(["ann-token", "ann-token"]);
  });

  it("stays anonymous while logged out and identifies after a login", async () => {
    const { store, identified, open } = storeWithLobbyFeed();
    open();
    expect(identified).toEqual([]);
    answerEveryRequestWith({ isOk: true, token: "new-token", playerId: ANN_ID, name: "Ann" });
    expect(await store.logIn({ login: "Ann", password: "long enough" })).toBeNull();
    expect(identified).toEqual(["new-token"]);
  });

  it("keeps the socket open in a room and keeps the players online up to date", () => {
    const code = v.parse(RoomCode, "K7QR2P");
    writeSession({
      token: "ann-token",
      playerId: ANN_ID,
      name: "Ann",
      isGuest: false,
      roomCode: code,
    });
    const { store, feeds, identified, open, closes } = storeWithLobbyFeed();
    open();
    feeds[0]?.onLobby([], [ANN_ONLINE]);
    expect(identified).toEqual(["ann-token"]);
    expect(closes()).toBe(0);
    expect(store.getSnapshot().playersOnline).toEqual([ANN_ONLINE]);
  });

  it("asks for a reload when the lobby speaks a newer protocol", () => {
    const { store, feeds } = storeWithLobbyFeed();
    feeds[0]?.onRejected("wrong_protocol_version");
    expect(store.getSnapshot().isOutdated).toBe(true);
  });

  it("checks the session again when the lobby rejects its token", async () => {
    writeSession({
      token: "old-token",
      playerId: ANN_ID,
      name: "Ann",
      isGuest: false,
      roomCode: null,
    });
    const { store, feeds } = storeWithLobbyFeed();
    answerEveryRequestWith({ isLoggedIn: false });
    feeds[0]?.onRejected("invalid_token");
    await vi.waitFor(() => {
      expect(store.getSnapshot().session).toBeNull();
    });
  });
});
