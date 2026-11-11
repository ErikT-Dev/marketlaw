import { describe, expect, it } from "vitest";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { PublicRoomView } from "../shared/protocol/PublicRoomView";
import { RemoteLobbyFeed } from "./RemoteLobbyFeed";
import type { SocketHandlers } from "./SocketHandlers";

function openFeed() {
  const opened: SocketHandlers[] = [];
  const received: Array<ReadonlyArray<PublicRoomView>> = [];
  const delays: number[] = [];
  const feed = new RemoteLobbyFeed({
    url: "ws://test/api/lobby/socket",
    openSocket: (url, handlers) => {
      opened.push(handlers);
      return {
        send: () => true,
        close: () => {
          handlers.onClose(1000);
        },
      };
    },
    runLater: (delay, run) => {
      delays.push(delay);
      run();
    },
    onRooms: (rooms) => received.push(rooms),
  });
  return { feed, opened, received, delays };
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

describe("RemoteLobbyFeed", () => {
  it("passes on each public room list and ignores messages it cannot read", () => {
    const { opened, received } = openFeed();
    opened[0]?.onMessage(
      JSON.stringify({ type: "lobby", protocolVersion: PROTOCOL_VERSION, publicRooms: ROOMS }),
    );
    opened[0]?.onMessage("not json");
    expect(received).toEqual([ROOMS]);
  });

  it("reconnects after a dropped connection but not after it was closed", () => {
    const { feed, opened, delays } = openFeed();
    opened[0]?.onClose(1006);
    expect(opened).toHaveLength(2);
    expect(delays).toEqual([1000]);
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
      onRooms: () => undefined,
    });
    opened[0]?.onClose(1006);
    feed.close();
    waiting.forEach((run) => {
      run();
    });
    expect(opened).toHaveLength(1);
  });
});
