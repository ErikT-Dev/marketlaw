import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import { EpochMs } from "../../shared/EpochMs";
import type { QueueIntent } from "../../shared/protocol/QueueIntent";
import type { QueueFeedHandlers } from "../../shared/QueueFeedHandlers";
import { RoomCode } from "../../shared/RoomCode";
import { OUT_OF_QUEUE } from "../testing/testRankedQueue";
import { ClientStore } from "./ClientStore";
import { writeSession } from "./writeSession";

function idleHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function storeInLobby() {
  writeSession({ token: "ann-token", playerId: null, name: "Ann", isGuest: false, roomCode: null });
  const sent: Array<{ readonly token: string; readonly intent: QueueIntent }> = [];
  const feeds: QueueFeedHandlers[] = [];
  const closed = vi.fn();
  const openHost = vi.fn(() => idleHost());
  const store = new ClientStore(
    openHost,
    () => ({ close: () => undefined }),
    (handlers) => {
      feeds.push(handlers);
      return {
        send: (token, intent) => {
          sent.push({ token, intent });
          return true;
        },
        close: closed,
      };
    },
  );
  return { store, sent, feeds, closed, openHost };
}

afterEach(() => {
  localStorage.clear();
});

describe("the ranked queue in the client store", () => {
  it("asks for its own queue state with the token when the queue socket opens", () => {
    const { sent, feeds } = storeInLobby();
    feeds[0]?.onOpen();
    expect(sent).toEqual([{ token: "ann-token", intent: { type: "resync" } }]);
  });

  it("keeps the latest queue view and sends queue intents with the token", () => {
    const { store, sent, feeds } = storeInLobby();
    feeds[0]?.onView(OUT_OF_QUEUE, v.parse(EpochMs, Date.now()));
    store.sendQueueIntent({ type: "join_queue", sizes: [2, 3] });
    expect(store.getSnapshot().queue).toEqual(OUT_OF_QUEUE);
    expect(sent.at(-1)).toEqual({
      token: "ann-token",
      intent: { type: "join_queue", sizes: [2, 3] },
    });
  });

  it("keeps the server clock offset of the latest queue view", () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const { store, feeds } = storeInLobby();
    feeds[0]?.onView(OUT_OF_QUEUE, v.parse(EpochMs, 7_000));
    expect(store.getSnapshot().serverClockOffsetMs).toBe(-3_000);
    vi.useRealTimers();
  });

  it("shows rejections and notices and clears them on the next intent", () => {
    const { store, feeds } = storeInLobby();
    feeds[0]?.onRejected("not_in_queue");
    expect(store.getSnapshot().queueRejection).toBe("not_in_queue");
    const rejoinAt = v.parse(EpochMs, 1_761_436_920_000);
    feeds[0]?.onNotice({ kind: "match_missed", rejoinAt });
    expect(store.getSnapshot().queueNotice).toEqual({ kind: "match_missed", rejoinAt });
    store.sendQueueIntent({ type: "leave_queue" });
    expect(store.getSnapshot().queueRejection).toBeNull();
    expect(store.getSnapshot().queueNotice).toBeNull();
  });

  it("opens the ranked room when the match starts and closes the queue socket", () => {
    const { store, feeds, closed, openHost } = storeInLobby();
    feeds[0]?.onNotice({ kind: "match_started", code: v.parse(RoomCode, "K7QR2P") });
    expect(store.getSnapshot().session?.roomCode).toBe("K7QR2P");
    expect(openHost).toHaveBeenCalledWith("K7QR2P", "ann-token");
    expect(closed).toHaveBeenCalled();
    expect(store.getSnapshot().queue).toBeNull();
  });

  it("asks for a reload when the server speaks a newer protocol", () => {
    const { store, feeds } = storeInLobby();
    feeds[0]?.onRejected("wrong_protocol_version");
    expect(store.getSnapshot().isOutdated).toBe(true);
  });
});
