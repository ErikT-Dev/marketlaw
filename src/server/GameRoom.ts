import { DurableObject } from "cloudflare:workers";
import * as v from "valibot";
import { randomForNextAction } from "../rules/randomForNextAction";
import { EpochMs } from "../shared/EpochMs";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../shared/protocol/parseClientMessage";
import type { ReasonCode } from "../shared/ReasonCode";
import type { RoomCode } from "../shared/RoomCode";
import { ConnectionAttachment } from "./ConnectionAttachment";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import { createRoomRecord } from "./room/createRoomRecord";
import { handleMessage } from "./room/handleMessage";
import type { Identity } from "./room/Identity";
import { joinRoom } from "./room/joinRoom";
import { ROOM_SCHEMA_VERSION } from "./room/ROOM_SCHEMA_VERSION";
import type { RoomRecord } from "./room/RoomRecord";
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
  private record: RoomRecord | null | undefined;

  async createRoom(code: RoomCode, size: 2 | 3 | 4, owner: Identity): Promise<boolean> {
    if ((await this.load()) !== null) {
      return false;
    }
    await this.save(createRoomRecord(code, size, owner));
    return true;
  }

  async joinRoom(joining: Identity): Promise<ReasonCode | null> {
    const record = await this.load();
    if (record === null) {
      return "room_not_found";
    }
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const joined = joinRoom(record, joining, seed);
    if (!joined.isOk) {
      return joined.error;
    }
    if (joined.value !== record) {
      await this.save(joined.value);
      this.updateEveryone(null);
    }
    return null;
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
    const record = await this.load();
    if (record === null) {
      socket.close(1000, "This room no longer exists");
      return;
    }
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const attachment = attachmentOf(socket);
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk ? await this.senderOf(parsed.value.token, attachment) : null;
    const outcome = handleMessage({
      record,
      connection: { identity: attachment.identity, rejectionTimes: attachment.rejectionTimes },
      parsed,
      sender: sender?.identity ?? null,
      now: v.parse(EpochMs, Date.now()),
      randomFor: randomForNextAction,
    });
    if (outcome.shouldSave) {
      await this.save(outcome.record);
    }
    socket.serializeAttachment({
      identity: outcome.connection.identity,
      tokenHash: sender?.tokenHash ?? attachment.tokenHash,
      rejectionTimes: outcome.connection.rejectionTimes,
    });
    socket.send(JSON.stringify(outcome.reply));
    if (outcome.shouldUpdateEveryone) {
      this.updateEveryone(socket);
    }
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
    const record = this.record;
    if (record === null || record === undefined) {
      return;
    }
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      if (socket !== except && identity !== null) {
        socket.send(
          JSON.stringify({
            type: "update",
            protocolVersion: PROTOCOL_VERSION,
            acceptedActionId: null,
            update: updateFor(record, identity.playerId),
          }),
        );
      }
    }
  }

  private async load(): Promise<RoomRecord | null> {
    if (this.record !== undefined) {
      return this.record;
    }
    const stored = await this.ctx.storage.get<RoomRecord>(ROOM_KEY);
    if (stored !== undefined && stored.schemaVersion !== ROOM_SCHEMA_VERSION) {
      await this.ctx.storage.deleteAll();
      for (const socket of this.ctx.getWebSockets()) {
        socket.close(1000, "This room was closed by an update");
      }
    }
    this.record = stored?.schemaVersion === ROOM_SCHEMA_VERSION ? stored : null;
    return this.record;
  }

  private async save(record: RoomRecord): Promise<void> {
    await this.ctx.storage.put(ROOM_KEY, record);
    this.record = record;
  }
}
