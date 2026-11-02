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
import { CompressedRoomStore } from "./CompressedRoomStore";
import { ConnectionAttachment } from "./ConnectionAttachment";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import type { AddressedNotice } from "./room/AddressedNotice";
import { alarmChangeFor } from "./room/alarmChangeFor";
import { createRoomIn } from "./room/createRoomIn";
import { fireAlarm } from "./room/fireAlarm";
import type { Identity } from "./room/Identity";
import { joinRoomIn } from "./room/joinRoomIn";
import { loadRoom } from "./room/loadRoom";
import { playersWhoseUpdateChanged } from "./room/playersWhoseUpdateChanged";
import { receiveMessage } from "./room/receiveMessage";
import { startTestRoomIn } from "./room/startTestRoomIn";
import { timeOutNoticesBetween } from "./room/timeOutNoticesBetween";
import { updateFor } from "./room/updateFor";
import { sha256Hex } from "./sha256Hex";

const NO_CONNECTION: ConnectionAttachment = { identity: null, tokenHash: null, rejectionTimes: [] };

type Sender = { readonly identity: Identity; readonly tokenHash: string };

function attachmentOf(socket: WebSocket): ConnectionAttachment {
  const parsed = v.safeParse(ConnectionAttachment, socket.deserializeAttachment());
  return parsed.success ? parsed.output : NO_CONNECTION;
}

export class GameRoom extends DurableObject<Env> {
  private readonly rooms = new CompressedRoomStore(this.ctx.storage.kv, () => {
    for (const socket of this.ctx.getWebSockets()) {
      socket.close(ROOM_GONE_CLOSE_CODE, "This room no longer exists");
    }
  });

  private readonly storage = this.rooms.storage;

  async createRoom(code: RoomCode, size: 2 | 3 | 4, owner: Identity): Promise<boolean> {
    return this.inTurn(async () => {
      const isCreated = createRoomIn(this.storage, { code, size }, owner);
      await this.rooms.save();
      return isCreated;
    });
  }

  async startTestRoom(
    code: RoomCode,
    seed: number,
    players: ReadonlyArray<Identity>,
    state: GameState,
  ): Promise<boolean> {
    return this.inTurn(async () => {
      const now = v.parse(EpochMs, Date.now());
      const isStarted = startTestRoomIn(this.storage, { code, seed, now }, players, state);
      await this.rooms.save();
      await this.syncAlarm();
      return isStarted;
    });
  }

  async joinRoom(joining: Identity): Promise<ReasonCode | null> {
    return this.inTurn(async () => {
      const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
      const before = this.storage.read();
      const now = v.parse(EpochMs, Date.now());
      const reason = joinRoomIn(this.storage, joining, { seed, now });
      await this.rooms.save();
      if (reason === null && this.storage.read() !== before) {
        this.updateEveryone(null);
      }
      await this.syncAlarm();
      return reason;
    });
  }

  override async alarm(): Promise<void> {
    await this.inTurn(async () => {
      const record = loadRoom(this.storage);
      if (record !== null) {
        const fired = fireAlarm(record, v.parse(EpochMs, Date.now()), randomForNextAction);
        if (fired !== record) {
          this.storage.write(fired);
          await this.rooms.save();
          this.updatePlayers(playersWhoseUpdateChanged(record, fired), null);
          this.sendNotices(timeOutNoticesBetween(record, fired));
        }
      }
      await this.syncAlarm(true);
    });
  }

  private async inTurn<T>(handle: () => Promise<T>): Promise<T> {
    return this.ctx.blockConcurrencyWhile(async () => {
      await this.rooms.load();
      return handle();
    });
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
    await this.inTurn(async () => this.receive(socket, message));
  }

  private async receive(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk
      ? await this.senderOf(parsed.value.token, attachmentOf(socket))
      : null;
    const attachment = attachmentOf(socket);
    const recordBefore = loadRoom(this.storage);
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
    await this.rooms.save();
    socket.serializeAttachment({
      identity: outcome.connection.identity,
      tokenHash:
        outcome.connection.identity === null ? null : (sender?.tokenHash ?? attachment.tokenHash),
      rejectionTimes: outcome.connection.rejectionTimes,
    });
    socket.send(JSON.stringify(outcome.reply));
    this.updatePlayers(outcome.playersToUpdate, outcome.reply.type === "rejected" ? null : socket);
    this.sendNotices(timeOutNoticesBetween(recordBefore, loadRoom(this.storage)));
    if (outcome.shouldClose) {
      socket.close(1008, "Too many rejected messages");
    }
    await this.syncAlarm();
  }

  private sendNotices(notices: ReadonlyArray<AddressedNotice>): void {
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      for (const { playerId, notice } of notices) {
        if (identity?.playerId === playerId) {
          const message: ServerMessage = {
            type: "notice",
            protocolVersion: PROTOCOL_VERSION,
            notice,
          };
          socket.send(JSON.stringify(message));
        }
      }
    }
  }

  private async syncAlarm(isFiring = false): Promise<void> {
    const current = isFiring ? null : await this.ctx.storage.getAlarm();
    const change = alarmChangeFor(current, loadRoom(this.storage));
    switch (change.kind) {
      case "keep":
        return;
      case "set":
        await this.ctx.storage.setAlarm(change.at);
        return;
      case "delete":
        await this.ctx.storage.deleteAlarm();
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
          serverNow: v.parse(EpochMs, Date.now()),
        };
        socket.send(JSON.stringify(update));
      }
    }
  }
}
