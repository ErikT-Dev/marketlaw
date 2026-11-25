import { DurableObject } from "cloudflare:workers";
import { acceptedSocketResponse } from "./acceptedSocketResponse";
import * as v from "valibot";
import type { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { parseLobbyClientMessage } from "../shared/protocol/parseLobbyClientMessage";
import type { RoomCode } from "../shared/RoomCode";
import type { BusyPlace } from "./lobby/BusyPlace";
import type { ClaimRejection } from "./lobby/ClaimRejection";
import { claimPlayer } from "./lobby/claimPlayer";
import { countGameStart } from "./lobby/countGameStart";
import { countTutorialStart } from "./lobby/countTutorialStart";
import { EMPTY_LOBBY } from "./lobby/EMPTY_LOBBY";
import { forgetPlayer } from "./lobby/forgetPlayer";
import { grantChatQuota } from "./lobby/grantChatQuota";
import type { GameStartRejection } from "./lobby/GameStartRejection";
import { LOBBY_RECORD_SCHEMA } from "./lobby/LOBBY_RECORD_SCHEMA";
import type { LobbyRecord } from "./lobby/LobbyRecord";
import { lobbyMessageOf } from "./lobby/lobbyMessageOf";
import type { OnlineConnection } from "./lobby/OnlineConnection";
import { connectionOfToken } from "./lobby/connectionOfToken";
import { onlineConnectionOfSocket } from "./lobby/onlineConnectionOfSocket";
import { releasePlayer } from "./lobby/releasePlayer";
import { siteChatLimitOf } from "./lobby/siteChatLimitOf";
import { siteEmailLimitOf } from "./lobby/siteEmailLimitOf";
import { returnSiteEmail } from "./lobby/returnSiteEmail";
import { takeSiteEmail } from "./lobby/takeSiteEmail";
import { siteGameLimitOf } from "./lobby/siteGameLimitOf";
import { siteTutorialLimitOf } from "./lobby/siteTutorialLimitOf";
import type { TutorialStartRejection } from "./lobby/TutorialStartRejection";
import type { PlayedActions } from "./lobby/PlayedActions";
import type { PlayerCountsToday } from "./lobby/PlayerCountsToday";
import type { RoomSummary } from "./lobby/RoomSummary";
import { withActionsAdded } from "./lobby/withActionsAdded";
import { withGameStartReturned } from "./lobby/withGameStartReturned";
import { withPlayerCountsSet } from "./lobby/withPlayerCountsSet";
import { withRoomSummary } from "./lobby/withRoomSummary";
import { movedToRoom } from "./lobby/movedToRoom";
import { RANKED_QUEUE_PLACE } from "./lobby/RANKED_QUEUE_PLACE";
import { applyQueueOperation } from "./queue/applyQueueOperation";
import { isSiteGameLimitReached } from "./queue/isSiteGameLimitReached";
import type { QueueOperation } from "./queue/QueueOperation";
import type { QueueOutcome } from "./queue/QueueOutcome";
import type { QueueRecord } from "./queue/QueueRecord";
import { queueOf } from "./queueOf";
import { LobbySockets } from "./LobbySockets";
import type { LoginClosing } from "./LoginClosing";
import type { PlayerRating } from "./records/PlayerRating";
import { deletePreLaunchRecord } from "./deletePreLaunchRecord";
import { LOBBY_STORAGE_KEYS } from "./lobby/LOBBY_STORAGE_KEYS";

const LOBBY_KEY = LOBBY_STORAGE_KEYS.launched;

export class Lobby extends DurableObject<Env> {
  private readonly sockets = new LobbySockets(this.ctx);

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    deletePreLaunchRecord(ctx.storage.kv, LOBBY_STORAGE_KEYS.preLaunch);
  }

  async claim(playerId: PlayerId, code: RoomCode, now: EpochMs): Promise<ClaimRejection | null> {
    let rejection: ClaimRejection | null = null;
    await this.change((record) => {
      const claimed = claimPlayer(record, playerId, code, now);
      rejection = claimed.isOk ? null : claimed.error;
      return claimed.isOk ? claimed.value : null;
    });
    return rejection;
  }

  async startGame(
    players: ReadonlyArray<PlayerId>,
    now: EpochMs,
  ): Promise<GameStartRejection | null> {
    let rejection: GameStartRejection | null = null;
    const context = { now, siteGamesPerDay: siteGameLimitOf(this.env) };
    const wasLimitReached = isSiteGameLimitReached(this.read(), context);
    await this.change((record) => {
      const counted = countGameStart(record, players, context);
      rejection = counted.isOk ? null : counted.error;
      return counted.isOk ? counted.value : null;
    });
    if (!wasLimitReached && isSiteGameLimitReached(this.read(), context)) {
      await queueOf(this.env)
        .siteGameLimitReached()
        .catch(() => undefined);
    }
    return rejection;
  }

  async startTutorial(playerId: PlayerId, now: EpochMs): Promise<TutorialStartRejection | null> {
    let rejection: TutorialStartRejection | null = null;
    await this.change((record) => {
      const counted = countTutorialStart(record, playerId, {
        now,
        siteTutorialsPerDay: siteTutorialLimitOf(this.env),
      });
      rejection = counted.isOk ? null : counted.error;
      return counted.isOk ? counted.value : null;
    });
    return rejection;
  }

  async grantChatQuota(now: EpochMs): Promise<number> {
    let granted = 0;
    await this.change((record) => {
      const grant = grantChatQuota(record, {
        now,
        siteChatMessagesPerDay: siteChatLimitOf(this.env),
      });
      granted = grant.granted;
      return grant.record;
    });
    return granted;
  }

  async takeEmailQuota(now: EpochMs): Promise<boolean> {
    let isTaken = false;
    await this.change((record) => {
      const taken = takeSiteEmail(record, { now, siteEmailsPerDay: siteEmailLimitOf(this.env) });
      isTaken = taken.isTaken;
      return taken.record;
    });
    return isTaken;
  }

  async returnEmailQuota(now: EpochMs): Promise<void> {
    await this.change((record) => returnSiteEmail(record, now));
  }

  async changeQueue(
    queue: QueueRecord,
    operation: QueueOperation,
    now: EpochMs,
  ): Promise<QueueOutcome> {
    const context = { now, siteGamesPerDay: siteGameLimitOf(this.env) };
    return this.decide((record) => {
      const outcome = applyQueueOperation({ queue, lobby: record }, operation, context);
      return { after: outcome.change.lobby, result: outcome };
    });
  }

  async moveToRoom(players: ReadonlyArray<PlayerId>, code: RoomCode): Promise<void> {
    await this.change((record) => movedToRoom(record, players, RANKED_QUEUE_PLACE, code));
  }

  async undoRankedStart(players: ReadonlyArray<PlayerId>, countedAt: EpochMs): Promise<void> {
    await this.change((record) =>
      withGameStartReturned(
        players.reduce(
          (released, playerId) => releasePlayer(released, playerId, RANKED_QUEUE_PLACE),
          record,
        ),
        players,
        countedAt,
      ),
    );
  }

  readRecord(): LobbyRecord {
    return this.read();
  }

  busyPlaceOf(playerId: PlayerId): BusyPlace | null {
    return this.read().busy.find((entry) => entry.playerId === playerId)?.code ?? null;
  }

  stayingRoomsOf(playerId: PlayerId): ReadonlyArray<RoomCode> {
    return this.read()
      .staying.filter((entry) => entry.playerId === playerId)
      .map(({ code }) => code);
  }

  async forget(playerId: PlayerId, code: BusyPlace): Promise<void> {
    await this.change((record) => forgetPlayer(record, playerId, code));
  }

  async release(playerId: PlayerId, code: BusyPlace): Promise<void> {
    await this.change((record) => releasePlayer(record, playerId, code));
  }

  async roomChanged(
    code: RoomCode,
    summary: RoomSummary | null,
    ended: {
      readonly played: ReadonlyArray<PlayedActions>;
      readonly now: EpochMs;
      readonly ratings: ReadonlyArray<PlayerRating>;
    },
  ): Promise<void> {
    await this.decide(
      (record) => ({
        after: withActionsAdded(withRoomSummary(record, code, summary), ended.played, ended.now),
        result: undefined,
      }),
      () => {
        this.sockets.rerate(ended.ratings);
      },
    );
  }

  logOut(closing: LoginClosing): void {
    this.changeSockets(() => {
      this.sockets.logOut(closing);
    });
  }

  renamePlayer(playerId: PlayerId, username: string): void {
    this.changeSockets(() => {
      this.sockets.rename(playerId, username);
    });
  }

  async setCountsForTest(counts: PlayerCountsToday, now: EpochMs): Promise<void> {
    await this.change((record) => withPlayerCountsSet(record, counts, now));
  }

  override fetch(request: Request): Response {
    return acceptedSocketResponse(request, (server) => {
      this.ctx.acceptWebSocket(server);
      server.send(this.messageText());
    });
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseLobbyClientMessage(text);
    const connection = parsed.isOk
      ? await connectionOfToken(this.env.DB, parsed.value.token)
      : null;
    this.changeSockets(() => {
      socket.serializeAttachment(connection);
    });
    if (!parsed.isOk || connection === null) {
      LobbySockets.reject(socket, parsed.isOk ? "invalid_token" : parsed.error);
    }
  }

  override webSocketClose(socket: WebSocket): void {
    const closing = onlineConnectionOfSocket(socket);
    if (closing !== null) {
      const staying = this.sockets.connections(socket);
      this.sendIfChanged(this.messageText([...staying, closing]), socket);
    }
  }

  private changeSockets(change: () => void): void {
    const before = this.messageText();
    change();
    this.sendIfChanged(before, null);
  }

  private async change(apply: (record: LobbyRecord) => LobbyRecord | null): Promise<boolean> {
    return this.decide((record) => {
      const after = apply(record);
      return { after, result: after !== null };
    });
  }

  private async decide<T>(
    apply: (record: LobbyRecord) => { readonly after: LobbyRecord | null; readonly result: T },
    changeSockets: () => void = () => undefined,
  ): Promise<T> {
    return this.ctx.blockConcurrencyWhile(async () => {
      const before = this.read();
      const textBefore = this.messageText();
      changeSockets();
      const { after, result } = apply(before);
      if (after !== null && JSON.stringify(after) !== JSON.stringify(before)) {
        this.ctx.storage.kv.put(LOBBY_KEY, after);
      }
      this.sendIfChanged(textBefore, null);
      return Promise.resolve(result);
    });
  }

  private read(): LobbyRecord {
    const parsed = v.safeParse(LOBBY_RECORD_SCHEMA, this.ctx.storage.kv.get(LOBBY_KEY));
    return parsed.success ? parsed.output : EMPTY_LOBBY;
  }

  private messageText(
    connections: ReadonlyArray<OnlineConnection> = this.sockets.connections(),
  ): string {
    return JSON.stringify(lobbyMessageOf(this.read(), connections));
  }

  private sendIfChanged(textBefore: string, closing: WebSocket | null): void {
    const textAfter = this.messageText(this.sockets.connections(closing));
    if (textAfter !== textBefore) {
      this.sockets.sendToAll(textAfter, closing);
    }
  }
}
