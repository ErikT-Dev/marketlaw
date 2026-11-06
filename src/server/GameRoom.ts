import { DurableObject } from "cloudflare:workers";
import { acceptedSocketResponse } from "./acceptedSocketResponse";
import type { GameState } from "../rules/GameState";
import { randomForNextAction } from "../rules/randomForNextAction";
import type { PlayerId } from "../shared/PlayerId";
import { parseClientMessage } from "../shared/protocol/parseClientMessage";
import type { RoomCode } from "../shared/RoomCode";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import { attachmentOf } from "./attachmentOf";
import { newGameStart } from "./newGameStart";
import { NO_CONNECTION } from "./NO_CONNECTION";
import { nowMs } from "./nowMs";
import { alarmChangeFor } from "./room/alarmChangeFor";
import { applyAlarmChange } from "./room/applyAlarmChange";
import { isPlayerBusyIn } from "./room/isPlayerBusyIn";
import type { ReplayRecord } from "./replays/ReplayRecord";
import { replayRecordOfRoom } from "./replays/replayRecordOfRoom";
import { CompressedRoomStore } from "./room/CompressedRoomStore";
import { createRoomIn } from "./room/createRoomIn";
import { fireRoomAlarm } from "./room/fireRoomAlarm";
import type { Identity } from "./room/Identity";
import type { JoinRejection } from "./room/JoinRejection";
import { joinRejectionIn } from "./room/joinRejectionIn";
import { joinRoomIn } from "./room/joinRoomIn";
import { loadRoom } from "./room/loadRoom";
import { playersWhoseUpdateChanged } from "./room/playersWhoseUpdateChanged";
import { receiveCheckingGameStart } from "./room/receiveCheckingGameStart";
import type { RoomRecord } from "./room/RoomRecord";
import { startTestRoomIn } from "./room/startTestRoomIn";
import { resumeNoticesBetween } from "./room/resumeNoticesBetween";
import { timeOutNoticesBetween } from "./room/timeOutNoticesBetween";
import { withConnection } from "./room/withConnection";
import { lobbyOf } from "./lobbyOf";
import { reportToLobby } from "./reportToLobby";
import { saveReplayRecordIfEnded } from "./replays/saveReplayRecordIfEnded";
import { RoomSockets } from "./RoomSockets";
import { replyToSocket } from "./replyToSocket";
import { chatTrackingStorage } from "./room/chatTrackingStorage";
import { chatDeliveriesBetween } from "./room/chatDeliveriesBetween";
import { chatListFor } from "./room/chatListFor";
import type { RoomRemoval } from "./room/RoomRemoval";
import type { Sender } from "./Sender";
import { senderOfToken } from "./senderOfToken";
import { leaveRoomIfFreeIn } from "./room/leaveRoomIfFreeIn";

export class GameRoom extends DurableObject<Env> {
  private readonly sockets = new RoomSockets(this.ctx);

  private readonly rooms = new CompressedRoomStore(this.ctx.storage.kv, () => {
    this.sockets.closeAll("This room no longer exists");
  });

  private readonly storage = chatTrackingStorage(this.rooms.storage, () => ({
    messageCount: this.rooms.chat.messages().length,
    now: nowMs(),
  }));

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

  async isPlayerBusy(playerId: PlayerId): Promise<boolean> {
    return this.inTurn(async () =>
      Promise.resolve(isPlayerBusyIn(loadRoom(this.storage), playerId)),
    );
  }

  async replayRecord(): Promise<ReplayRecord | null> {
    return this.inTurn(async () => Promise.resolve(replayRecordOfRoom(loadRoom(this.storage))));
  }

  async leaveIfFree(playerId: PlayerId): Promise<void> {
    await this.inTurn(async () => {
      const before = loadRoom(this.storage);
      if (leaveRoomIfFreeIn(this.storage, playerId)) {
        await this.publishChange(before, [{ playerId, reason: "left", rejoinAt: null }]);
      }
    });
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
      await this.publishChange(before ?? null, removals);
      return rejection;
    });
  }

  private async publishChange(before: RoomRecord | null, removals: ReadonlyArray<RoomRemoval>) {
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
    this.sendChatSince(before, this.rooms.chat.messages().length);
    await this.syncAlarm();
    await this.reportToLobby(before);
  }

  private sendChatSince(
    before: RoomRecord | null,
    messageCount: number,
    hello: { readonly socket: WebSocket; readonly playerId: PlayerId } | null = null,
  ): void {
    const record = loadRoom(this.storage);
    const messages = this.rooms.chat.messages();
    const deliveries = chatDeliveriesBetween({ record: before, messageCount }, record, messages);
    for (const { playerId, message } of deliveries) {
      this.sockets.sendTo([playerId], () => message);
    }
    if (hello !== null && record !== null) {
      hello.socket.send(JSON.stringify(chatListFor(record, messages, hello.playerId)));
    }
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
    this.sendChatSince(record, this.rooms.chat.messages().length);
    await saveReplayRecordIfEnded(this.env.DB, record, fired);
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
      ? await senderOfToken(this.env.DB, parsed.value.token, attachmentOf(socket))
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
    const messageCount = this.rooms.chat.messages().length;
    const now = nowMs();
    const input = {
      connection: { identity: attachment.identity, rejectionTimes: attachment.rejectionTimes },
      parsed,
      sender: sender?.identity ?? null,
      now,
      randomFor: randomForNextAction,
      gameStart: newGameStart(now),
      livePlayers: this.sockets.livePlayers(),
    };
    const outcome = await receiveCheckingGameStart(this.storage, input, async (players) =>
      lobbyOf(this.env).startGame(players, now),
    );
    if (outcome.isRoomGone) {
      socket.close(ROOM_GONE_CLOSE_CODE, "This room no longer exists");
      await this.reportToLobby(recordBefore);
      return;
    }
    const recordAfter = loadRoom(this.storage);
    if (recordAfter !== null) {
      await this.rooms.save(outcome.chatMessage);
      this.sockets.sendRemovals(outcome.removals);
      replyToSocket(
        socket,
        { attachment, outcome, sender },
        { record: recordAfter, livePlayers: this.sockets.livePlayers() },
      );
      const hello =
        parsed.isOk && parsed.value.type === "resync" && sender !== null
          ? { socket, playerId: sender.identity.playerId }
          : null;
      if (hello !== null && recordAfter.game !== null) {
        this.sockets.welcome(recordAfter, hello.playerId, socket);
      }
      this.sendChatSince(recordBefore, messageCount, hello);
      this.sockets.updatePlayers(
        recordAfter,
        outcome.playersToUpdate,
        outcome.reply.type === "rejected" ? null : socket,
      );
      this.sockets.sendNotices([
        ...outcome.notices,
        ...timeOutNoticesBetween(recordBefore, recordAfter),
        ...resumeNoticesBetween(recordBefore, recordAfter),
      ]);
    }
    await this.syncAlarm();
    if (recordAfter !== null) {
      await saveReplayRecordIfEnded(this.env.DB, recordBefore, recordAfter);
    }
    await this.reportToLobby(recordBefore);
  }

  private async reportToLobby(before: RoomRecord | null): Promise<void> {
    await reportToLobby(this.env, before, loadRoom(this.storage));
  }

  private async syncAlarm(isFiring = false): Promise<void> {
    const current = isFiring ? null : await this.ctx.storage.getAlarm();
    await applyAlarmChange(this.ctx.storage, alarmChangeFor(current, loadRoom(this.storage)));
  }
}
