import { DurableObject } from "cloudflare:workers";
import { acceptedSocketResponse } from "./acceptedSocketResponse";
import * as v from "valibot";
import type { GameState } from "../rules/GameState";
import { randomForNextAction } from "../rules/randomForNextAction";
import { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { parseClientMessage } from "../shared/protocol/parseClientMessage";
import type { RoomCode } from "../shared/RoomCode";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import { attachmentOf } from "./attachmentOf";
import type { ConnectionAttachment } from "./ConnectionAttachment";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import { newGameStart } from "./newGameStart";
import { NO_CONNECTION } from "./NO_CONNECTION";
import { alarmChangeFor } from "./room/alarmChangeFor";
import { CompressedRoomStore } from "./room/CompressedRoomStore";
import { createRoomIn } from "./room/createRoomIn";
import { fireRoomAlarm } from "./room/fireRoomAlarm";
import type { Identity } from "./room/Identity";
import type { JoinRejection } from "./room/JoinRejection";
import { joinRejectionIn } from "./room/joinRejectionIn";
import { joinRoomIn } from "./room/joinRoomIn";
import { loadRoom } from "./room/loadRoom";
import { playersWhoseUpdateChanged } from "./room/playersWhoseUpdateChanged";
import { receiveMessage } from "./room/receiveMessage";
import type { RoomRecord } from "./room/RoomRecord";
import { startTestRoomIn } from "./room/startTestRoomIn";
import { resumeNoticesBetween } from "./room/resumeNoticesBetween";
import { timeOutNoticesBetween } from "./room/timeOutNoticesBetween";
import { withAwaySeats } from "./room/withAwaySeats";
import { withConnection } from "./room/withConnection";
import { lobbyOf } from "./lobbyOf";
import { roomSummaryOf } from "./room/roomSummaryOf";
import { RoomSockets } from "./RoomSockets";
import { sha256Hex } from "./sha256Hex";

type Sender = { readonly identity: Identity; readonly tokenHash: string };

function nowMs(): EpochMs {
  return v.parse(EpochMs, Date.now());
}

export class GameRoom extends DurableObject<Env> {
  private readonly sockets = new RoomSockets(this.ctx);

  private readonly rooms = new CompressedRoomStore(this.ctx.storage.kv, () => {
    this.sockets.closeAll("This room no longer exists");
  });

  private readonly storage = this.rooms.storage;

  async createRoom(
    room: { readonly code: RoomCode; readonly size: 2 | 3 | 4; readonly isPublic: boolean },
    owner: Identity,
  ): Promise<boolean> {
    return this.inTurn(async () => {
      const isCreated = createRoomIn(this.storage, room, owner, nowMs());
      await this.rooms.save();
      await this.syncAlarm();
      if (isCreated) {
        await this.reportToLobby(null);
      }
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
      const isStarted = startTestRoomIn(this.storage, { code, seed, now: nowMs() }, players, state);
      await this.rooms.save();
      await this.syncAlarm();
      return isStarted;
    });
  }

  restartForTest(): void {
    this.ctx.abort("Restarted by a browser test");
  }

  async hasPlayer(playerId: PlayerId): Promise<boolean> {
    return this.inTurn(async () =>
      Promise.resolve(
        loadRoom(this.storage)?.players.some((player) => player.playerId === playerId) === true,
      ),
    );
  }

  async joinRejection(joining: Identity): Promise<JoinRejection | null> {
    return this.inTurn(async () =>
      Promise.resolve(joinRejectionIn(this.storage, joining, nowMs(), this.sockets.livePlayers())),
    );
  }

  async joinRoom(joining: Identity): Promise<JoinRejection | null> {
    return this.inTurn(async () => {
      const before = this.storage.read();
      const { rejection, removals } = joinRoomIn(
        this.storage,
        joining,
        nowMs(),
        this.sockets.livePlayers(),
      );
      await this.rooms.save();
      this.sockets.sendRemovals(removals);
      const record = loadRoom(this.storage);
      if (record !== null && record !== before) {
        this.sockets.updatePlayers(
          record,
          record.players.map(({ playerId }) => playerId),
          null,
        );
      }
      await this.syncAlarm();
      await this.reportToLobby(before ?? null);
      return rejection;
    });
  }

  override async alarm(): Promise<void> {
    await this.inTurn(async () => {
      const record = loadRoom(this.storage);
      if (record !== null) {
        await this.applyAlarm(record);
      }
      await this.syncAlarm(true);
      await this.reportToLobby(record);
    });
  }

  private async applyAlarm(record: RoomRecord): Promise<void> {
    const { record: fired, removals } = fireRoomAlarm(
      record,
      nowMs(),
      randomForNextAction,
      this.sockets.livePlayers(),
    );
    if (fired === null) {
      this.sockets.sendRemovals(removals);
      this.storage.remove();
      return;
    }
    if (fired === record) {
      return;
    }
    this.storage.write(fired);
    await this.rooms.save();
    this.sockets.sendRemovals(removals);
    this.sockets.updatePlayers(
      fired,
      fired.game === null
        ? fired.players.map(({ playerId }) => playerId)
        : playersWhoseUpdateChanged(record, fired),
      null,
    );
    this.sockets.sendNotices(timeOutNoticesBetween(record, fired));
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
    const { identity } = attachmentOf(socket);
    if (identity === null || this.sockets.isConnectedElsewhere(identity.playerId, socket)) {
      return;
    }
    await this.inTurn(async () => {
      const record = loadRoom(this.storage);
      const marked =
        record === null
          ? null
          : withConnection(record, identity.playerId, { isConnected: false, at: nowMs() });
      if (marked !== null && marked !== record) {
        this.storage.write(marked);
        await this.rooms.save();
        await this.syncAlarm();
      }
      if (record !== null) {
        this.sockets.updateOthers(record, socket);
      }
    });
  }

  private async inTurn<T>(handle: () => Promise<T>): Promise<T> {
    return this.ctx.blockConcurrencyWhile(async () => {
      await this.rooms.load();
      return handle();
    });
  }

  override fetch(request: Request): Response {
    return acceptedSocketResponse(request, (server) => {
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(NO_CONNECTION);
    });
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseClientMessage(text);
    const sender = parsed.isOk
      ? await this.senderOf(parsed.value.token, attachmentOf(socket))
      : null;
    await this.inTurn(async () => this.receive(socket, parsed, sender));
  }

  private async receive(
    socket: WebSocket,
    parsed: ReturnType<typeof parseClientMessage>,
    sender: Sender | null,
  ): Promise<void> {
    const attachment = attachmentOf(socket);
    const recordBefore = loadRoom(this.storage);
    const now = nowMs();
    const outcome = receiveMessage(this.storage, {
      connection: { identity: attachment.identity, rejectionTimes: attachment.rejectionTimes },
      parsed,
      sender: sender?.identity ?? null,
      now,
      randomFor: randomForNextAction,
      gameStart: newGameStart(now),
      livePlayers: this.sockets.livePlayers(),
    });
    if (outcome.isRoomGone) {
      socket.close(ROOM_GONE_CLOSE_CODE, "This room no longer exists");
      await this.reportToLobby(recordBefore);
      return;
    }
    const recordAfter = loadRoom(this.storage);
    if (recordAfter !== null) {
      await this.rooms.save();
      this.sockets.sendRemovals(outcome.removals);
      this.reply(socket, { attachment, outcome, sender });
      if (parsed.isOk && parsed.value.type === "resync" && sender !== null) {
        this.sockets.welcome(recordAfter, sender.identity.playerId, socket);
      }
      this.sockets.updatePlayers(
        recordAfter,
        outcome.playersToUpdate,
        outcome.reply.type === "rejected" ? null : socket,
      );
      this.sockets.sendNotices([
        ...timeOutNoticesBetween(recordBefore, recordAfter),
        ...resumeNoticesBetween(recordBefore, recordAfter),
      ]);
    }
    await this.syncAlarm();
    await this.reportToLobby(recordBefore);
  }

  private reply(
    socket: WebSocket,
    sent: {
      readonly attachment: ConnectionAttachment;
      readonly outcome: Extract<ReturnType<typeof receiveMessage>, { readonly isRoomGone: false }>;
      readonly sender: Sender | null;
    },
  ): void {
    const { attachment, outcome, sender } = sent;
    socket.serializeAttachment({
      identity: outcome.connection.identity,
      tokenHash:
        outcome.connection.identity === null ? null : (sender?.tokenHash ?? attachment.tokenHash),
      rejectionTimes: outcome.connection.rejectionTimes,
    });
    socket.send(
      JSON.stringify(
        withAwaySeats(outcome.reply, loadRoom(this.storage), this.sockets.livePlayers()),
      ),
    );
    if (outcome.shouldClose) {
      socket.close(1008, "Too many rejected messages");
    }
  }

  private async reportToLobby(before: RoomRecord | null): Promise<void> {
    const after = loadRoom(this.storage);
    const summaryBefore = before === null ? null : roomSummaryOf(before);
    const summaryAfter = after === null ? null : roomSummaryOf(after);
    const code = after?.code ?? before?.code;
    if (code !== undefined && JSON.stringify(summaryBefore) !== JSON.stringify(summaryAfter)) {
      await lobbyOf(this.env)
        .roomChanged(code, summaryAfter)
        .catch(() => undefined);
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
}
