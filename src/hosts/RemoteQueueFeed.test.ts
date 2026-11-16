import { describe, expect, it } from "vitest";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { QueueNotice } from "../shared/protocol/QueueNotice";
import type { QueueView } from "../shared/protocol/QueueView";
import type { ReasonCode } from "../shared/ReasonCode";
import { RemoteQueueFeed } from "./RemoteQueueFeed";
import type { SocketHandlers } from "./SocketHandlers";

const VIEW: QueueView = {
  counts: { total: 1, bySize: { 2: 0, 3: 1, 4: 0 } },
  own: { kind: "waiting", sizes: [3] },
  isSiteGameLimitReached: false,
};

function openFeed() {
  const opened: SocketHandlers[] = [];
  const sentTexts: string[] = [];
  const views: Array<{ readonly view: QueueView; readonly serverNow: number }> = [];
  const notices: QueueNotice[] = [];
  const rejections: ReasonCode[] = [];
  let opens = 0;
  const feed = new RemoteQueueFeed({
    url: "ws://test/api/queue/socket",
    openSocket: (url, handlers) => {
      opened.push(handlers);
      return {
        send: (text) => {
          sentTexts.push(text);
          return true;
        },
        close: () => {
          handlers.onClose(1000);
        },
      };
    },
    runLater: (delay, run) => {
      run();
    },
    handlers: {
      onOpen: () => {
        opens += 1;
      },
      onView: (view, serverNow) => views.push({ view, serverNow }),
      onNotice: (notice) => notices.push(notice),
      onRejected: (code) => rejections.push(code),
    },
  });
  return { feed, opened, sentTexts, views, notices, rejections, opens: () => opens };
}

function message(body: Readonly<Record<string, unknown>>): string {
  return JSON.stringify({ protocolVersion: PROTOCOL_VERSION, ...body });
}

describe("RemoteQueueFeed", () => {
  it("passes on views, notices and rejections and ignores messages it cannot read", () => {
    const { opened, views, notices, rejections } = openFeed();
    opened[0]?.onMessage(message({ type: "queue", queue: VIEW, serverNow: 1_761_436_800_000 }));
    opened[0]?.onMessage(
      message({ type: "queue_notice", notice: { kind: "match_found", size: 3 } }),
    );
    opened[0]?.onMessage(message({ type: "queue_rejected", code: "not_in_queue" }));
    opened[0]?.onMessage("not json");
    expect(views).toEqual([{ view: VIEW, serverNow: 1_761_436_800_000 }]);
    expect(notices).toEqual([{ kind: "match_found", size: 3 }]);
    expect(rejections).toEqual(["not_in_queue"]);
  });

  it("sends intents with the protocol version and token only while connected", () => {
    const { feed, opened, sentTexts } = openFeed();
    expect(feed.send("ann-token", { type: "leave_queue" })).toBe(false);
    opened[0]?.onOpen();
    expect(feed.send("ann-token", { type: "join_queue", sizes: [2] })).toBe(true);
    expect(JSON.parse(sentTexts[0] ?? "")).toEqual({
      type: "join_queue",
      sizes: [2],
      protocolVersion: PROTOCOL_VERSION,
      token: "ann-token",
    });
  });

  it("reconnects after a dropped connection and tells the store it opened again", () => {
    const { feed, opened, opens } = openFeed();
    opened[0]?.onOpen();
    opened[0]?.onClose(1006);
    opened[1]?.onOpen();
    expect(opens()).toBe(2);
    feed.close();
    expect(opened).toHaveLength(2);
  });
});
