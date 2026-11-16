import { DurableObject } from "cloudflare:workers";
import * as v from "valibot";
import type { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { parseQueueClientMessage } from "../shared/protocol/parseQueueClientMessage";
import type { QueueClientMessage } from "../shared/protocol/QueueClientMessage";
import { acceptedSocketResponse } from "./acceptedSocketResponse";
import { isReallyBusy } from "./api/isReallyBusy";
import { leaveFinishedRooms } from "./api/leaveFinishedRooms";
import { attachmentOf } from "./attachmentOf";
import { findEmailAccount } from "./email/findEmailAccount";
import type { LobbyRecord } from "./lobby/LobbyRecord";
import { RANKED_QUEUE_PLACE } from "./lobby/RANKED_QUEUE_PLACE";
import { siteGameLimitOf } from "./lobby/siteGameLimitOf";
import { lobbyOf } from "./lobbyOf";
import { NO_CONNECTION } from "./NO_CONNECTION";
import { nowMs } from "./nowMs";
import { EMPTY_QUEUE } from "./queue/EMPTY_QUEUE";
import { isInQueue } from "./queue/isInQueue";
import { nextQueueAlarmAt } from "./queue/nextQueueAlarmAt";
import { QUEUE_RECORD_SCHEMA } from "./queue/QUEUE_RECORD_SCHEMA";
import type { QueueContext } from "./queue/QueueContext";
import type { QueueOperation } from "./queue/QueueOperation";
import type { QueueRecord } from "./queue/QueueRecord";
import type { QueueRejection } from "./queue/QueueRejection";
import type { QueueState } from "./queue/QueueState";
import { queueOperationOf } from "./queueOperationOf";
import { alarmChangeTo } from "./room/alarmChangeTo";
import { applyAlarmChange } from "./room/applyAlarmChange";
import { QueueSockets } from "./QueueSockets";
import type { Sender } from "./Sender";
import { senderOfToken } from "./senderOfToken";
import { startRankedRooms } from "./startRankedRooms";

const QUEUE_KEY = "queue";

export class RankedQueue extends DurableObject<Env> {
  private readonly sockets = new QueueSockets(this.ctx);

  override async fetch(request: Request): Promise<Response> {
    const state = await this.state();
    return acceptedSocketResponse(request, (server) => {
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(NO_CONNECTION);
      this.sockets.sendView(server, state, this.context(nowMs()));
    });
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseQueueClientMessage(text);
    if (!parsed.isOk) {
      this.sockets.reject(socket, parsed.error);
      return;
    }
    const sender = await senderOfToken(this.env.DB, parsed.value.token, attachmentOf(socket));
    if (sender === null) {
      this.sockets.reject(socket, "invalid_token");
      return;
    }
    socket.serializeAttachment({ ...attachmentOf(socket), ...sender });
    await this.inTurn(async () => this.receive(socket, parsed.value, sender));
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
    const { identity } = attachmentOf(socket);
    if (identity !== null) {
      await this.inTurn(async () => this.markClosed(identity.playerId, socket));
    }
  }

  override async alarm(): Promise<void> {
    await this.inTurn(async () => {
      await this.change({ kind: "alarm" }, true);
    });
  }

  async isQueued(playerId: PlayerId): Promise<boolean> {
    return this.inTurn(async () => Promise.resolve(isInQueue(this.read(), playerId)));
  }

  async logOut(login: {
    readonly sender: Sender;
    readonly isLeaving: boolean;
    readonly isEndingEveryLogin: boolean;
  }) {
    const { identity, tokenHash } = login.sender;
    const { playerId } = identity;
    await this.inTurn(async () => {
      this.sockets.closeLogins(login.isEndingEveryLogin ? { playerId } : { tokenHash });
      if (login.isLeaving && isInQueue(this.read(), playerId)) {
        await this.change({ kind: "leave", playerId }, false);
        return;
      }
      await this.markClosed(playerId, null);
    });
  }

  async siteGameLimitReached(): Promise<void> {
    await this.inTurn(async () => {
      const state = await this.state();
      const context = this.context(nowMs());
      await this.syncAlarm(state, context, false);
      this.sockets.sendViews(state, context);
    });
  }

  private async receive(socket: WebSocket, message: QueueClientMessage, sender: Sender) {
    const { playerId } = sender.identity;
    if (this.read().closedConnections.some((closed) => closed.playerId === playerId)) {
      await this.change({ kind: "connection", playerId, isConnected: true }, false);
    }
    if (message.type === "resync") {
      this.sockets.sendView(socket, await this.state(), this.context(nowMs()));
      return;
    }
    const operation = await this.operationOf(message, sender);
    const rejection =
      typeof operation === "string" ? operation : await this.change(operation, false);
    if (rejection !== null) {
      this.sockets.reject(socket, rejection);
      return;
    }
    if (message.type === "join_queue") {
      await leaveFinishedRooms(this.env, playerId, RANKED_QUEUE_PLACE);
    }
  }

  private async operationOf(
    message: Exclude<QueueClientMessage, { readonly type: "resync" }>,
    sender: Sender,
  ): Promise<QueueOperation | QueueRejection | "invalid_token"> {
    if (message.type !== "join_queue") {
      return queueOperationOf(message, sender.identity.playerId);
    }
    const { playerId } = sender.identity;
    if (await isReallyBusy(this.env, playerId, RANKED_QUEUE_PLACE)) {
      return "busy_elsewhere";
    }
    const account = await findEmailAccount(this.env.DB, sender.tokenHash, nowMs());
    if (account === null) {
      return "invalid_token";
    }
    const standing = account.isGuest
      ? "guest"
      : account.confirmedEmail === null
        ? "email_not_confirmed"
        : "email_confirmed";
    return { kind: "join", joiner: { playerId, standing }, sizes: message.sizes };
  }

  private async markClosed(playerId: PlayerId, closing: WebSocket | null): Promise<void> {
    if (!this.sockets.isConnected(playerId, closing) && isInQueue(this.read(), playerId)) {
      await this.change({ kind: "connection", playerId, isConnected: false }, false);
    }
  }

  private async change(
    operation: QueueOperation,
    isAlarmFiring: boolean,
  ): Promise<QueueRejection | null> {
    const before = this.read();
    const now = nowMs();
    const outcome = await lobbyOf(this.env).changeQueue(before, operation, now);
    const { queue, lobby, notices, starts } = outcome.change;
    if (JSON.stringify(queue) !== JSON.stringify(before)) {
      this.ctx.storage.kv.put(QUEUE_KEY, queue);
    }
    const startNotices = await startRankedRooms(this.env, starts, now);
    const state = starts.length === 0 ? { queue, lobby } : await this.state();
    const context = this.context(now);
    await this.syncAlarm(state, context, isAlarmFiring);
    this.sockets.sendNotices([...notices, ...startNotices]);
    this.sockets.sendViews(state, context);
    return outcome.rejection;
  }

  private async syncAlarm(state: QueueState, context: QueueContext, isAlarmFiring: boolean) {
    const current = isAlarmFiring ? null : await this.ctx.storage.getAlarm();
    await applyAlarmChange(
      this.ctx.storage,
      alarmChangeTo(current, nextQueueAlarmAt(state, context)),
    );
  }

  private async inTurn<T>(handle: () => Promise<T>): Promise<T> {
    return this.ctx.blockConcurrencyWhile(handle);
  }

  private async state(): Promise<QueueState> {
    const lobby: LobbyRecord = await lobbyOf(this.env).readRecord();
    return { queue: this.read(), lobby };
  }

  private context(now: EpochMs): QueueContext {
    return { now, siteGamesPerDay: siteGameLimitOf(this.env) };
  }

  private read(): QueueRecord {
    const parsed = v.safeParse(QUEUE_RECORD_SCHEMA, this.ctx.storage.kv.get(QUEUE_KEY));
    return parsed.success ? parsed.output : EMPTY_QUEUE;
  }
}
