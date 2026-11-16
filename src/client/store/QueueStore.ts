import type { OpenQueueFeed } from "../../shared/OpenQueueFeed";
import type { QueueIntent } from "../../shared/protocol/QueueIntent";
import type { QueueNotice } from "../../shared/protocol/QueueNotice";
import type { QueueFeed } from "../../shared/QueueFeed";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { RoomCode } from "../../shared/RoomCode";
import type { ClientState } from "./ClientState";
import { EmailAccountStore } from "./EmailAccountStore";

export abstract class QueueStore extends EmailAccountStore {
  private readonly openQueue: OpenQueueFeed;
  private queueFeed: QueueFeed | null = null;

  constructor(initial: ClientState, openQueue: OpenQueueFeed) {
    super(initial);
    this.openQueue = openQueue;
  }

  protected abstract enterRankedRoom(code: RoomCode): void;

  protected watchQueue(): void {
    this.queueFeed ??= this.openQueue({
      onOpen: () => {
        this.resyncQueue();
      },
      onView: (queue, serverNow) => {
        this.change({ queue, serverClockOffsetMs: serverNow - Date.now() });
      },
      onNotice: (notice) => {
        this.receiveQueueNotice(notice);
      },
      onRejected: (code) => {
        this.receiveQueueRejection(code);
      },
    });
  }

  protected stopWatchingQueue(): void {
    this.queueFeed?.close();
    this.queueFeed = null;
    this.change({ queue: null, queueRejection: null });
  }

  readonly resyncQueue = (): void => {
    const token = this.state.session?.token;
    if (token !== undefined) {
      this.queueFeed?.send(token, { type: "resync" });
    }
  };

  readonly sendQueueIntent = (intent: QueueIntent): void => {
    const token = this.state.session?.token;
    const isSent = token !== undefined && this.queueFeed?.send(token, intent) === true;
    this.change({ queueRejection: isSent ? null : "no_answer", queueNotice: null });
  };

  readonly dismissQueueNotice = (): void => {
    this.change({ queueNotice: null });
  };

  private receiveQueueNotice(notice: QueueNotice): void {
    switch (notice.kind) {
      case "match_found":
        this.change({ queueNotice: null, queueRejection: null });
        return;
      case "match_started":
        this.enterRankedRoom(notice.code);
        return;
      case "match_not_started":
      case "match_missed":
      case "site_game_limit":
      case "daily_limit":
        this.change({ queueNotice: notice });
        return;
    }
  }

  private receiveQueueRejection(code: ReasonCode): void {
    if (code === "wrong_protocol_version") {
      this.change({ isOutdated: true });
      return;
    }
    this.change({ queueRejection: code });
  }
}
