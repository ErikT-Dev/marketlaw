import * as v from "valibot";
import { LobbyMessage } from "../../src/shared/protocol/LobbyMessage.ts";
import { PROTOCOL_VERSION } from "../../src/shared/PROTOCOL_VERSION.ts";

const LOBBY_REJECTED = v.object({ type: v.literal("lobby_rejected"), code: v.string() });

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export class LobbySocket {
  readonly messages: LobbyMessage[] = [];
  readonly rejections: string[] = [];
  private readonly socket: WebSocket;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener("message", ({ data }) => {
      this.receive(typeof data === "string" ? readJson(data) : undefined);
    });
  }

  private receive(json: unknown): void {
    const message = v.safeParse(LobbyMessage, json);
    if (message.success) {
      this.messages.push(message.output);
    }
    const rejected = v.safeParse(LOBBY_REJECTED, json);
    if (rejected.success) {
      this.rejections.push(rejected.output.code);
    }
  }

  static async open(serverUrl: URL): Promise<LobbySocket> {
    const url = new URL("/api/lobby/socket", serverUrl);
    url.protocol = "ws:";
    const socket = new WebSocket(url);
    const lobbySocket = new LobbySocket(socket);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return lobbySocket;
  }

  identify(token: string): void {
    this.sendText(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, type: "identify", token }));
  }

  sendText(text: string): void {
    this.socket.send(text);
  }

  playersOnline() {
    return (this.messages.at(-1)?.playersOnline ?? []).map(({ username, rating, status }) => ({
      username,
      rating,
      status,
    }));
  }

  close(): void {
    this.socket.close();
  }
}
