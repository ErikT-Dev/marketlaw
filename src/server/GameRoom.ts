import { DurableObject } from "cloudflare:workers";
import * as v from "valibot";
import type { GameState } from "../rules/GameState";
import { randomForNextAction } from "../rules/randomForNextAction";
import { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../shared/protocol/parseClientMessage";
import type { ServerMessage } from "../shared/protocol/ServerMessage";
import type { ReasonCode } from "../shared/ReasonCode";
import type { RoomCode } from "../shared/RoomCode";
import { ConnectionAttachment } from "./ConnectionAttachment";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import { createRoomIn } from "./room/createRoomIn";
import type { Identity } from "./room/Identity";
import { joinRoomIn } from "./room/joinRoomIn";
import { loadRoom } from "./room/loadRoom";
import { receiveMessage } from "./room/receiveMessage";
import { startTestRoomIn } from "./room/startTestRoomIn";
import type { RoomRecord } from "./room/RoomRecord";
import type { RoomStorage } from "./room/RoomStorage";
import { updateFor } from "./room/updateFor";
import { sha256Hex } from "./sha256Hex";

const ROOM_KEY = "room";
const NO_CONNECTION: ConnectionAttachment = { identity: null, tokenHash: null, rejectionTimes: [] };

type Sender = { readonly identity: Identity; readonly tokenHash: string };

function attachmentOf(socket: WebSocket): ConnectionAttachment {
  const parsed = v.safeParse(ConnectionAttachment, socket.deserializeAttachment());
  return parsed.success ? parsed.output : NO_CONNECTION;
}

export class GameRoom extends DurableObject<Env> {
  private readonly storage: RoomStorage = {
    read: () => this.ctx.storage.kv.get<RoomRecord>(ROOM_KEY),
    write: (record) => {
      this.ctx.storage.kv.put(ROOM_KEY, record);
    },
    remove: () => {
      this.ctx.storage.kv.delete(ROOM_KEY);
      for (const socket of this.ctx.getWebSockets()) {
        socket.close(ROOM_GONE_CLOSE_CODE, "This room no longer exists");
      }
    },
  };

  createRoom(code: RoomCode, size: 2 | 3 | 4, owner: Identity): boolean {
    return createRoomIn(this.storage, { code, size }, owner);
  }

  startTestRoom(
    code: RoomCode,
    seed: number,
    players: ReadonlyArray<Identity>,
    state: GameState,
  ): boolean {
    return startTestRoomIn(this.storage, { code, seed }, players, state);
  }

  joinRoom(joining: Identity): ReasonCode | null {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const before = this.storage.read();
    const reason = joinRoomIn(this.storage, joining, seed);
    if (reason === null && this.storage.read() !== before) {
      this.updateEveryone(null);
    }
    return reason;
  }

  override fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket", { status: 426 });
    }
    const [client, server] = Object.values(new WebSocketPair());
    if (client === undefined || server === undefined) {
      return new Response("Could not open a WebSocket", { status: 500 });
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(NO_CONNECTION);
    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk
      ? await this.senderOf(parsed.value.token, attachmentOf(socket))
      : null;
    const attachment = attachmentOf(socket);
    const outcome = receiveMessage(this.storage, {
      connection: { identity: attachment.identity, rejectionTimes: attachment.rejectionTimes },
      parsed,
      sender: sender?.identity ?? null,
      now: v.parse(EpochMs, Date.now()),
      randomFor: randomForNextAction,
    });
    if (outcome.isRoomGone) {
      socket.close(ROOM_GONE_CLOSE_CODE, "This room no longer exists");
      return;
    }
    socket.serializeAttachment({
      identity: outcome.connection.identity,
      tokenHash:
        outcome.connection.identity === null ? null : (sender?.tokenHash ?? attachment.tokenHash),
      rejectionTimes: outcome.connection.rejectionTimes,
    });
    socket.send(JSON.stringify(outcome.reply));
    this.updatePlayers(outcome.playersToUpdate, socket);
    if (outcome.shouldClose) {
      socket.close(1008, "Too many rejected messages");
    }
  }

  private async senderOf(token: string, attachment: ConnectionAttachment): Promise<Sender | null> {
    const tokenHash = await sha256Hex(token);
    if (attachment.identity !== null && attachment.tokenHash === tokenHash) {
      return { identity: attachment.identity, tokenHash };
    }
    const identity = await findPlayerByTokenHash(this.env.DB, tokenHash);
    return identity === null ? null : { identity, tokenHash };
  }

  private updateEveryone(except: WebSocket | null): void {
    const record = loadRoom(this.storage);
    if (record !== null) {
      this.updatePlayers(
        record.players.map(({ playerId }) => playerId),
        except,
      );
    }
  }

  private updatePlayers(playerIds: ReadonlyArray<PlayerId>, except: WebSocket | null): void {
    const record = loadRoom(this.storage);
    if (record === null || playerIds.length === 0) {
      return;
    }
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      if (socket !== except && identity !== null && playerIds.includes(identity.playerId)) {
        const update: ServerMessage = {
          type: "update",
          protocolVersion: PROTOCOL_VERSION,
          acceptedActionId: null,
          update: updateFor(record, identity.playerId),
        };
        socket.send(JSON.stringify(update));
      }
    }
  }
}
