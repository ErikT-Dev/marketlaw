import { describe, expect, it } from "vitest";
import type { HostEvent } from "../shared/HostEvent";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { RemoteGameHost } from "./RemoteGameHost";
import type { SocketHandlers } from "./SocketHandlers";

type FakeNetwork = {
  host: RemoteGameHost;
  sent: unknown[];
  events: HostEvent[];
  delays: number[];
  handlers: () => SocketHandlers;
  connects: () => number;
  goOffline: () => void;
};

function connectedHost(): FakeNetwork {
  const sent: unknown[] = [];
  const events: HostEvent[] = [];
  const delays: number[] = [];
  const opened: SocketHandlers[] = [];
  let nextId = 1;
  let isOpen = true;
  const host = new RemoteGameHost({
    url: SOCKET_URL,
    token: "secret-token",
    openSocket: (url, handlers) => {
      opened.push(handlers);
      return {
        send: (text) => {
          sent.push({ ...JSON.parse(text), url });
          return isOpen;
        },
        close: () => {
          handlers.onClose(1000);
        },
      };
    },
    newActionId: () => `id-${nextId++}`,
    runLater: (delay, run) => {
      delays.push(delay);
      run();
    },
  });
  host.subscribe((event) => events.push(event));
  function handlers(): SocketHandlers {
    const last = opened.at(-1);
    if (last === undefined) {
      throw new Error("no socket was opened");
    }
    return last;
  }
  return {
    host,
    sent,
    events,
    delays,
    handlers,
    connects: () => opened.length,
    goOffline: () => {
      isOpen = false;
    },
  };
}

const ROOM_UPDATE_TEXT = JSON.stringify({
  type: "update",
  protocolVersion: PROTOCOL_VERSION,
  acceptedActionId: null,
  update: {
    room: {
      code: "K7QR2P",
      size: 2,
      isPublic: true,
      ownerName: "Ann",
      playerNames: ["Ann"],
      namesInRoom: ["Ann"],
      myName: "Ann",
      mySeat: null,
      asking: null,
      deletionAt: null,
    },
    game: null,
  },
  serverNow: 5000,
});

const SOCKET_URL = "ws://test/api/rooms/K7QR2P/socket";

describe("RemoteGameHost", () => {
  it("asks for the full view as soon as the connection opens", () => {
    const network = connectedHost();
    network.handlers().onOpen();
    expect(network.sent).toEqual([
      { protocolVersion: PROTOCOL_VERSION, token: "secret-token", type: "resync", url: SOCKET_URL },
    ]);
    expect(network.events).toEqual([{ type: "connection", status: "open" }]);
  });

  it("sends an action with a new action id and the last state version", () => {
    const network = connectedHost();
    network.handlers().onOpen();
    const actionId = network.host.sendAction({ type: "end_turn" });
    expect(actionId).toBe("id-1");
    expect(network.sent.at(-1)).toEqual({
      protocolVersion: PROTOCOL_VERSION,
      token: "secret-token",
      type: "action",
      actionId: "id-1",
      stateVersion: 0,
      action: { type: "end_turn" },
      url: SOCKET_URL,
    });
  });

  it("passes on updates and rejections and asks again after a stale state", () => {
    const network = connectedHost();
    network.handlers().onMessage(ROOM_UPDATE_TEXT);
    network.handlers().onMessage(
      JSON.stringify({
        type: "rejected",
        protocolVersion: PROTOCOL_VERSION,
        actionId: "id-1",
        code: "stale_state",
        sendAgainAt: null,
      }),
    );
    expect(network.events.map((event) => event.type)).toEqual(["update", "rejected"]);
    expect(network.sent).toEqual([
      { protocolVersion: PROTOCOL_VERSION, token: "secret-token", type: "resync", url: SOCKET_URL },
    ]);
  });

  it("passes on a notice and the server time of an update", () => {
    const network = connectedHost();
    network.handlers().onMessage(ROOM_UPDATE_TEXT);
    network.handlers().onMessage(
      JSON.stringify({
        type: "notice",
        protocolVersion: PROTOCOL_VERSION,
        notice: { kind: "timed_out", inARow: 2, of: 3 },
      }),
    );
    expect(network.events).toMatchObject([
      { type: "update", serverNow: 5000 },
      { type: "notice", notice: { kind: "timed_out", inARow: 2, of: 3 } },
    ]);
  });

  it("passes on chat entries with the player's own mute list", () => {
    const network = connectedHost();
    const entry = { kind: "message", from: "Bea", text: "Hi", at: 7000, isOwn: false };
    network.handlers().onMessage(
      JSON.stringify({
        type: "chat",
        protocolVersion: PROTOCOL_VERSION,
        entries: [entry],
        mutedNames: ["Cid"],
        isFullList: true,
      }),
    );
    expect(network.events.at(-1)).toEqual({
      type: "chat",
      entries: [entry],
      mutedNames: ["Cid"],
      isFullList: true,
    });
  });

  it("ignores messages it cannot read", () => {
    const network = connectedHost();
    network.handlers().onMessage("{not json");
    expect(network.events).toEqual([]);
  });

  it("reconnects with a growing delay until the player closes it", () => {
    const network = connectedHost();
    network.handlers().onClose(1006);
    network.handlers().onClose(1006);
    expect(network.delays).toEqual([1000, 2000]);
    network.host.close();
    expect(network.connects()).toBe(3);
  });

  it("stops passing events to a listener that unsubscribed", () => {
    const network = connectedHost();
    const seen: HostEvent[] = [];
    const unsubscribe = network.host.subscribe((event) => seen.push(event));
    unsubscribe();
    network.handlers().onOpen();
    expect(seen).toEqual([]);
  });

  it("stops reconnecting when the room is gone", () => {
    const network = connectedHost();
    network.handlers().onClose(4404);
    expect(network.connects()).toBe(1);
    expect(network.events).toEqual([{ type: "connection", status: "room_gone" }]);
  });

  it("reports a logout and does not reconnect after it", () => {
    const network = connectedHost();
    network.handlers().onClose(4401);
    expect(network.connects()).toBe(1);
    expect(network.events).toEqual([{ type: "connection", status: "logged_out" }]);
  });

  it("returns no action id when the action could not be sent", () => {
    const network = connectedHost();
    network.goOffline();
    expect(network.host.sendAction({ type: "end_turn" })).toBeNull();
  });

  it("sends a room action with the token", () => {
    const network = connectedHost();
    expect(network.host.sendRoomAction({ type: "change_size", size: 3 })).toBe(true);
    expect(network.sent).toEqual([
      {
        protocolVersion: PROTOCOL_VERSION,
        token: "secret-token",
        type: "room",
        action: { type: "change_size", size: 3 },
        url: SOCKET_URL,
      },
    ]);
  });

  it("passes on a removal and does not reconnect after it", () => {
    const network = connectedHost();
    network.handlers().onMessage(
      JSON.stringify({
        type: "removed",
        protocolVersion: PROTOCOL_VERSION,
        reason: "declined",
        rejoinAt: 125_000,
      }),
    );
    network.handlers().onClose(4404);
    expect(network.events).toEqual([
      { type: "removed", reason: "declined", rejoinAt: 125_000 },
      { type: "connection", status: "room_gone" },
    ]);
    expect(network.connects()).toBe(1);
  });
});
