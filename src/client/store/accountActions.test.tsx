import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { ClientStore } from "./ClientStore";
import { readSession } from "./readSession";
import { writeSession } from "./writeSession";

type SentRequest = { readonly path: string; readonly body: unknown };

const ROOM_CODE = v.parse(RoomCode, "ABCDEF");
const PLAYER_ID = v.parse(PlayerId, "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10");
const IN_ROOM = {
  token: "guest-token",
  playerId: PLAYER_ID,
  name: "Ann",
  isGuest: true,
  roomCode: ROOM_CODE,
  isInTutorial: false,
};

function hostWithEvents() {
  let listener: ((event: HostEvent) => void) | null = null;
  let closeCount = 0;
  const host: GameHost = {
    sendAction: () => null,
    sendRoomAction: () => true,
    sendTutorialAction: () => null,
    requestResync: () => undefined,
    subscribe: (newListener) => {
      listener = newListener;
      return () => undefined;
    },
    close: () => {
      closeCount += 1;
    },
  };
  return {
    host,
    emit: (event: HostEvent) => {
      listener?.(event);
    },
    closes: () => closeCount,
  };
}

function serverAnswers(answerFor: (path: string) => unknown): ReadonlyArray<SentRequest> {
  const sent: SentRequest[] = [];
  vi.stubGlobal("fetch", (path: string, init: { readonly body: string }) => {
    sent.push({ path, body: JSON.parse(init.body) });
    return Promise.resolve(Response.json(answerFor(path)));
  });
  return sent;
}

function loggedInAnswer(path: string): unknown {
  return path === "/api/session"
    ? {
        isLoggedIn: true,
        playerId: "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10",
        name: "Ann",
        isGuest: true,
      }
    : { isLoggedIn: false };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checking the session", () => {
  it("takes the player id, account kind and name from the session answer", async () => {
    writeSession({ ...IN_ROOM, playerId: null });
    serverAnswers(() => ({
      isLoggedIn: true,
      playerId: "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10",
      name: "Ann Rider",
      isGuest: false,
    }));
    const store = new ClientStore(() => hostWithEvents().host);
    const registered = { ...IN_ROOM, name: "Ann Rider", isGuest: false };
    await vi.waitFor(() => {
      expect(store.getSnapshot().session).toEqual(registered);
    });
    expect(readSession()).toEqual(registered);
  });
});

describe("logging out and changing the username", () => {
  it("logs out with the token, leaves the room and forgets the session", async () => {
    writeSession(IN_ROOM);
    const sent = serverAnswers(loggedInAnswer);
    const network = hostWithEvents();
    const store = new ClientStore(() => network.host);
    await store.logOut();
    expect(sent.at(-1)).toEqual({ path: "/api/logout", body: { token: "guest-token" } });
    expect(store.getSnapshot().session).toBeNull();
    expect(store.getSnapshot().notice).toBeNull();
    expect(readSession()).toBeNull();
    expect(network.closes()).toBe(1);
  });

  it("stays logged in with a message when the logout gets no answer", async () => {
    writeSession(IN_ROOM);
    serverAnswers((path) => (path === "/api/logout" ? null : loggedInAnswer(path)));
    const store = new ClientStore(() => hostWithEvents().host);
    await store.logOut();
    expect(store.getSnapshot().session).toEqual(IN_ROOM);
    expect(store.getSnapshot().notice).toBe("Could not log out. Try again in a moment.");
  });

  it("goes to the lobby logged out when the room closes the socket for a logout", () => {
    writeSession(IN_ROOM);
    serverAnswers(loggedInAnswer);
    const network = hostWithEvents();
    const store = new ClientStore(() => network.host);
    network.emit({ type: "connection", status: "logged_out" });
    expect(store.getSnapshot().session).toBeNull();
    expect(store.getSnapshot().notice).toBe("You logged out.");
    expect(readSession()).toBeNull();
  });

  it("stores a changed username and stays in the room", async () => {
    writeSession(IN_ROOM);
    const sent = serverAnswers((path) =>
      path === "/api/username-changes"
        ? {
            isOk: true,
            token: "guest-token",
            playerId: "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10",
            name: "Ann City",
          }
        : loggedInAnswer(path),
    );
    const store = new ClientStore(() => hostWithEvents().host);
    expect(await store.changeUsername("Ann City")).toBeNull();
    expect(sent.at(-1)).toEqual({
      path: "/api/username-changes",
      body: { token: "guest-token", username: "Ann City" },
    });
    expect(store.getSnapshot().session).toEqual({ ...IN_ROOM, name: "Ann City" });
    expect(readSession()).toEqual({ ...IN_ROOM, name: "Ann City" });
  });

  it("returns the reason of a refused username change and keeps the name", async () => {
    writeSession(IN_ROOM);
    serverAnswers((path) =>
      path === "/api/username-changes"
        ? { isOk: false, reason: "username_change_too_soon" }
        : loggedInAnswer(path),
    );
    const store = new ClientStore(() => hostWithEvents().host);
    expect(await store.changeUsername("Ann City")).toBe("username_change_too_soon");
    expect(store.getSnapshot().session).toEqual(IN_ROOM);
  });

  it("loads the account details with the token", async () => {
    writeSession(IN_ROOM);
    const details = {
      isLoggedIn: true,
      name: "Ann",
      usernameWait: null,
      icon: TEST_PLAYER_ICON,
      iconWait: null,
      email: null,
      rating: null,
    };
    const sent = serverAnswers((path) =>
      path === "/api/account" ? details : loggedInAnswer(path),
    );
    const store = new ClientStore(() => hostWithEvents().host);
    expect(await store.loadAccount()).toEqual(details);
    expect(sent.at(-1)).toEqual({ path: "/api/account", body: { token: "guest-token" } });
  });
});
