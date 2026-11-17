import { describe, expect, it } from "vitest";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { PlayerOnlineView } from "../shared/protocol/PlayerOnlineView";
import type { PublicRoomView } from "../shared/protocol/PublicRoomView";
import type { ReasonCode } from "../shared/ReasonCode";
import { RemoteLobbyFeed } from "./RemoteLobbyFeed";
import type { SocketHandlers } from "./SocketHandlers";

type Received = {
  readonly publicRooms: ReadonlyArray<PublicRoomView>;
  readonly playersOnline: ReadonlyArray<PlayerOnlineView>;
};

function openFeed() {
  const opened: SocketHandlers[] = [];
  const sent: string[] = [];
  const received: Received[] = [];
  const rejected: ReasonCode[] = [];
  const delays: number[] = [];
  let openCount = 0;
  const feed = new RemoteLobbyFeed({
    url: "ws://test/api/lobby/socket",
    openSocket: (url, handlers) => {
      opened.push(handlers);
      return {
        send: (text) => {
          sent.push(text);
          return true;
        },
        close: () => {
          handlers.onClose(1000);
        },
      };
    },
    runLater: (delay, run) => {
      delays.push(delay);
      run();
    },
    handlers: {
      onOpen: () => {
        openCount += 1;
      },
      onLobby: (publicRooms, playersOnline) => received.push({ publicRooms, playersOnline }),
      onRejected: (code) => rejected.push(code),
    },
  });
  return { feed, opened, sent, received, rejected, delays, openCount: () => openCount };
}

const ROOMS = [
  {
    code: "K7QR2P",
    size: 3,
    ownerName: "Ann",
    playerNames: ["Ann"],
    playerIds: ["5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13"],
  },
];

const PLAYERS_ONLINE = [
  {
    playerId: "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13",
    username: "Ann",
    rating: 1043,
    status: "in_game",
  },
];

describe("RemoteLobbyFeed", () => {
  it("passes on the public rooms and players online and ignores messages it cannot read", () => {
    const { opened, received } = openFeed();
    opened[0]?.onMessage(
      JSON.stringify({
        type: "lobby",
        protocolVersion: PROTOCOL_VERSION,
        publicRooms: ROOMS,
        playersOnline: PLAYERS_ONLINE,
      }),
    );
    opened[0]?.onMessage("not json");
    expect(received).toEqual([{ publicRooms: ROOMS, playersOnline: PLAYERS_ONLINE }]);
  });

  it("passes on a rejection with its reason", () => {
    const { opened, rejected } = openFeed();
    opened[0]?.onMessage(
      JSON.stringify({
        type: "lobby_rejected",
        protocolVersion: PROTOCOL_VERSION,
        code: "invalid_token",
      }),
    );
    expect(rejected).toEqual(["invalid_token"]);
  });

  it("identifies with the token only once the socket is open", () => {
    const { feed, opened, sent, openCount } = openFeed();
    expect(feed.identify("ann-token")).toBe(false);
    opened[0]?.onOpen();
    expect(openCount()).toBe(1);
    expect(feed.identify("ann-token")).toBe(true);
    expect(sent.map((text): unknown => JSON.parse(text))).toEqual([
      { protocolVersion: PROTOCOL_VERSION, type: "identify", token: "ann-token" },
    ]);
  });

  it("reconnects after a dropped connection but not after it was closed", () => {
    const { feed, opened, delays } = openFeed();
    opened[0]?.onClose(1006);
    expect(opened).toHaveLength(2);
    expect(delays).toEqual([1000]);
    expect(feed.identify("ann-token")).toBe(false);
    feed.close();
    expect(opened).toHaveLength(2);
  });

  it("does not reconnect when it was closed while a reconnect was waiting", () => {
    const opened: SocketHandlers[] = [];
    const waiting: Array<() => void> = [];
    const feed = new RemoteLobbyFeed({
      url: "ws://test/api/lobby/socket",
      openSocket: (url, handlers) => {
        opened.push(handlers);
        return { send: () => true, close: () => undefined };
      },
      runLater: (delay, run) => {
        waiting.push(run);
      },
      handlers: { onOpen: () => undefined, onLobby: () => undefined, onRejected: () => undefined },
    });
    opened[0]?.onClose(1006);
    feed.close();
    waiting.forEach((run) => {
      run();
    });
    expect(opened).toHaveLength(1);
  });
});
