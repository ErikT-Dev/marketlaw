import { describe, expect, it } from "vitest";
import type { HostEvent } from "../shared/HostEvent";
import { RemoteGameHost } from "./RemoteGameHost";
import type { SocketHandlers } from "./SocketHandlers";

type FakeNetwork = {
  host: RemoteGameHost;
  sent: unknown[];
  events: HostEvent[];
  delays: number[];
  handlers: () => SocketHandlers;
  connects: () => number;
};

function connectedHost(): FakeNetwork {
  const sent: unknown[] = [];
  const events: HostEvent[] = [];
  const delays: number[] = [];
  const opened: SocketHandlers[] = [];
  let nextId = 1;
  const host = new RemoteGameHost({
    url: SOCKET_URL,
    token: "secret-token",
    openSocket: (url, handlers) => {
      opened.push(handlers);
      return {
        send: (text) => sent.push({ ...JSON.parse(text), url }),
        close: () => {
          handlers.onClose();
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
  return { host, sent, events, delays, handlers, connects: () => opened.length };
}

const ROOM_UPDATE_TEXT = JSON.stringify({
  type: "update",
  protocolVersion: 1,
  acceptedActionId: null,
  update: { room: { code: "K7QR2P", size: 2, playerNames: ["Ann"], mySeat: null }, game: null },
});

const SOCKET_URL = "ws://test/api/rooms/K7QR2P/socket";

describe("RemoteGameHost", () => {
  it("asks for the full view as soon as the connection opens", () => {
    const network = connectedHost();
    network.handlers().onOpen();
    expect(network.sent).toEqual([
      { protocolVersion: 1, token: "secret-token", type: "resync", url: SOCKET_URL },
    ]);
    expect(network.events).toEqual([{ type: "connection", status: "open" }]);
  });

  it("sends an action with a new action id and the last state version", () => {
    const network = connectedHost();
    network.handlers().onOpen();
    const actionId = network.host.sendAction({ type: "end_turn" });
    expect(actionId).toBe("id-1");
    expect(network.sent.at(-1)).toEqual({
      protocolVersion: 1,
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
    network
      .handlers()
      .onMessage(
        JSON.stringify({
          type: "rejected",
          protocolVersion: 1,
          actionId: "id-1",
          code: "stale_state",
        }),
      );
    expect(network.events.map((event) => event.type)).toEqual(["update", "rejected"]);
    expect(network.sent).toEqual([
      { protocolVersion: 1, token: "secret-token", type: "resync", url: SOCKET_URL },
    ]);
  });

  it("ignores messages it cannot read", () => {
    const network = connectedHost();
    network.handlers().onMessage("{not json");
    expect(network.events).toEqual([]);
  });

  it("reconnects with a growing delay until the player closes it", () => {
    const network = connectedHost();
    network.handlers().onClose();
    network.handlers().onClose();
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
});
