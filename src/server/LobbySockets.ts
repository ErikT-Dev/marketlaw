import type { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { LobbyRejectedMessage } from "../shared/protocol/LobbyRejectedMessage";
import type { ReasonCode } from "../shared/ReasonCode";
import type { LoginClosing } from "./LoginClosing";
import type { OnlineConnection } from "./lobby/OnlineConnection";
import { onlineConnectionOfSocket } from "./lobby/onlineConnectionOfSocket";
import { openSocketsOf } from "./openSocketsOf";
import type { PlayerRating } from "./records/PlayerRating";

function isLoggingOut(connection: OnlineConnection, closing: LoginClosing): boolean {
  return "tokenHash" in closing
    ? connection.tokenHash === closing.tokenHash
    : connection.playerId === closing.playerId;
}

export class LobbySockets {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  static reject(socket: WebSocket, code: ReasonCode): void {
    const rejected: LobbyRejectedMessage = {
      type: "lobby_rejected",
      protocolVersion: PROTOCOL_VERSION,
      code,
    };
    socket.send(JSON.stringify(rejected));
  }

  connections(except: WebSocket | null = null): ReadonlyArray<OnlineConnection> {
    return this.openSockets(except).flatMap((socket) => {
      const connection = onlineConnectionOfSocket(socket);
      return connection === null ? [] : [connection];
    });
  }

  sendToAll(text: string, except: WebSocket | null = null): void {
    for (const socket of this.openSockets(except)) {
      socket.send(text);
    }
  }

  logOut(closing: LoginClosing): void {
    this.changeConnections((connection) => (isLoggingOut(connection, closing) ? null : connection));
  }

  rename(playerId: PlayerId, username: string): void {
    this.changeConnections((connection) =>
      connection.playerId === playerId ? { ...connection, username } : connection,
    );
  }

  rerate(ratings: ReadonlyArray<PlayerRating>): void {
    this.changeConnections((connection) => {
      const rated = ratings.find(({ playerId }) => playerId === connection.playerId);
      return rated === undefined ? connection : { ...connection, rating: rated.rating };
    });
  }

  private changeConnections(
    change: (connection: OnlineConnection) => OnlineConnection | null,
  ): void {
    for (const socket of this.openSockets(null)) {
      const connection = onlineConnectionOfSocket(socket);
      const changed = connection === null ? null : change(connection);
      if (changed !== connection) {
        socket.serializeAttachment(changed);
      }
    }
  }

  private openSockets(except: WebSocket | null): ReadonlyArray<WebSocket> {
    return openSocketsOf(this.ctx).filter((socket) => socket !== except);
  }
}
