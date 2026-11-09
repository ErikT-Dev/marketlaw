import { parseServerMessage } from "../../src/shared/protocol/parseServerMessage.ts";
import type { ServerMessage } from "../../src/shared/protocol/ServerMessage.ts";
import { PROTOCOL_VERSION } from "../../src/shared/PROTOCOL_VERSION.ts";

export class RoomSocket {
  readonly messages: ServerMessage[] = [];
  closeCode: number | null = null;
  private readonly socket: WebSocket;
  private readonly token: string;

  private constructor(socket: WebSocket, token: string) {
    this.socket = socket;
    this.token = token;
    socket.addEventListener("message", (event) => {
      const message = typeof event.data === "string" ? parseServerMessage(event.data) : undefined;
      if (message !== undefined) {
        this.messages.push(message);
      }
    });
    socket.addEventListener("close", (event) => {
      this.closeCode = event.code;
    });
  }

  static async open(serverUrl: URL, code: string, token: string): Promise<RoomSocket> {
    const url = new URL(`/api/rooms/${code}/socket`, serverUrl);
    url.protocol = "ws:";
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    const roomSocket = new RoomSocket(socket, token);
    roomSocket.send({ type: "resync" });
    return roomSocket;
  }

  send(message: Readonly<Record<string, unknown>>): void {
    this.socket.send(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: this.token, ...message }),
    );
  }

  latestUpdate() {
    const updates = this.messages.flatMap((message) =>
      message.type === "update" ? [message.update] : [],
    );
    return updates.at(-1) ?? null;
  }

  close(): void {
    this.socket.close();
  }
}
