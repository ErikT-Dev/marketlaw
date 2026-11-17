import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseQueueServerMessage } from "../shared/protocol/parseQueueServerMessage";
import type { QueueIntent } from "../shared/protocol/QueueIntent";
import type { QueueFeed } from "../shared/QueueFeed";
import type { QueueFeedOptions } from "./QueueFeedOptions";
import { ReopeningSocket } from "./ReopeningSocket";

export class RemoteQueueFeed implements QueueFeed {
  private readonly options: QueueFeedOptions;
  private readonly socket: ReopeningSocket;

  constructor(options: QueueFeedOptions) {
    this.options = options;
    this.socket = new ReopeningSocket({
      ...options,
      onOpen: options.handlers.onOpen,
      onMessage: (text) => {
        this.receive(text);
      },
    });
  }

  readonly send = (token: string, intent: QueueIntent): boolean =>
    this.socket.send(JSON.stringify({ ...intent, protocolVersion: PROTOCOL_VERSION, token }));

  readonly close = (): void => {
    this.socket.close();
  };

  private receive(text: string): void {
    const message = parseQueueServerMessage(text);
    const { handlers } = this.options;
    switch (message?.type) {
      case "queue":
        handlers.onView(message.queue, message.serverNow);
        return;
      case "queue_notice":
        handlers.onNotice(message.notice);
        return;
      case "queue_rejected":
        handlers.onRejected(message.code);
        return;
      case undefined:
        return;
    }
  }
}
