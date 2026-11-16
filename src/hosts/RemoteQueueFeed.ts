import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseQueueServerMessage } from "../shared/protocol/parseQueueServerMessage";
import type { QueueIntent } from "../shared/protocol/QueueIntent";
import type { QueueFeed } from "../shared/QueueFeed";
import type { HostSocket } from "./HostSocket";
import type { QueueFeedOptions } from "./QueueFeedOptions";
import { Reconnector } from "./Reconnector";

export class RemoteQueueFeed implements QueueFeed {
  private readonly options: QueueFeedOptions;
  private socket: HostSocket | null = null;
  private isOpen = false;
  private readonly reconnector: Reconnector;

  constructor(options: QueueFeedOptions) {
    this.options = options;
    this.reconnector = new Reconnector(options.runLater);
    this.connect();
  }

  readonly send = (token: string, intent: QueueIntent): boolean => {
    if (this.socket === null || !this.isOpen) {
      return false;
    }
    return this.socket.send(
      JSON.stringify({ ...intent, protocolVersion: PROTOCOL_VERSION, token }),
    );
  };

  readonly close = (): void => {
    this.reconnector.close();
    this.socket?.close();
  };

  private receive(text: string): void {
    const message = parseQueueServerMessage(text);
    const { handlers } = this.options;
    switch (message?.type) {
      case "queue":
        handlers.onView(message.queue);
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

  private connect(): void {
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.isOpen = true;
        this.reconnector.connected();
        this.options.handlers.onOpen();
      },
      onMessage: (text) => {
        this.receive(text);
      },
      onClose: () => {
        this.socket = null;
        this.isOpen = false;
        this.reconnector.afterDrop(() => {
          this.connect();
        });
      },
    });
  }
}
