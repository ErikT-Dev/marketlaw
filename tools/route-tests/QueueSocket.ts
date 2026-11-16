import { parseQueueServerMessage } from "../../src/shared/protocol/parseQueueServerMessage.ts";
import type { QueueServerMessage } from "../../src/shared/protocol/QueueServerMessage.ts";
import { PROTOCOL_VERSION } from "../../src/shared/PROTOCOL_VERSION.ts";

export class QueueSocket {
  readonly messages: QueueServerMessage[] = [];
  closeCode: number | null = null;
  private readonly socket: WebSocket;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener("message", ({ data }) => {
      this.receive(data);
    });
    socket.addEventListener("close", ({ code }) => {
      this.closeCode = code;
    });
  }

  private receive(data: unknown): void {
    const message = typeof data === "string" ? parseQueueServerMessage(data) : undefined;
    if (message !== undefined) {
      this.messages.push(message);
    }
  }

  static async open(serverUrl: URL): Promise<QueueSocket> {
    const url = new URL("/api/queue/socket", serverUrl);
    url.protocol = "ws:";
    const socket = new WebSocket(url);
    const queueSocket = new QueueSocket(socket);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return queueSocket;
  }

  send(token: string, message: Readonly<Record<string, unknown>>): void {
    this.sendText(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token, ...message }));
  }

  sendText(text: string): void {
    this.socket.send(text);
  }

  latestView() {
    const views = this.messages.flatMap((message) =>
      message.type === "queue" ? [message.queue] : [],
    );
    return views.at(-1) ?? null;
  }

  notices() {
    return this.messages.flatMap((message) =>
      message.type === "queue_notice" ? [message.notice] : [],
    );
  }

  rejections() {
    return this.messages.flatMap((message) =>
      message.type === "queue_rejected" ? [message.code] : [],
    );
  }

  close(): void {
    this.socket.close();
  }
}
