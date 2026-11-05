import { DurableObject } from "cloudflare:workers";
import { acceptedSocketResponse } from "./acceptedSocketResponse";
import * as v from "valibot";
import type { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { LobbyMessage } from "../shared/protocol/LobbyMessage";
import type { RoomCode } from "../shared/RoomCode";
import type { ClaimRejection } from "./lobby/ClaimRejection";
import { claimPlayer } from "./lobby/claimPlayer";
import { countGameStart } from "./lobby/countGameStart";
import { EMPTY_LOBBY } from "./lobby/EMPTY_LOBBY";
import { forgetPlayer } from "./lobby/forgetPlayer";
import type { GameStartRejection } from "./lobby/GameStartRejection";
import { LOBBY_RECORD_SCHEMA } from "./lobby/LOBBY_RECORD_SCHEMA";
import type { LobbyRecord } from "./lobby/LobbyRecord";
import { publicRoomsOf } from "./lobby/publicRoomsOf";
import { releasePlayer } from "./lobby/releasePlayer";
import { siteGameLimitOf } from "./lobby/siteGameLimitOf";
import type { PlayedActions } from "./lobby/PlayedActions";
import type { PlayerCountsToday } from "./lobby/PlayerCountsToday";
import type { RoomSummary } from "./lobby/RoomSummary";
import { withActionsAdded } from "./lobby/withActionsAdded";
import { withPlayerCountsSet } from "./lobby/withPlayerCountsSet";
import { withRoomSummary } from "./lobby/withRoomSummary";

const LOBBY_KEY = "lobby";

export class Lobby extends DurableObject<Env> {
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
    await this.change((record) => {
      const counted = countGameStart(record, players, {
        now,
        siteGamesPerDay: siteGameLimitOf(this.env),
      });
      rejection = counted.isOk ? null : counted.error;
      return counted.isOk ? counted.value : null;
    });
    return rejection;
  }

  busyRoomOf(playerId: PlayerId): RoomCode | null {
    return this.read().busy.find((entry) => entry.playerId === playerId)?.code ?? null;
  }

  stayingRoomsOf(playerId: PlayerId): ReadonlyArray<RoomCode> {
    return this.read()
      .staying.filter((entry) => entry.playerId === playerId)
      .map(({ code }) => code);
  }

  async forget(playerId: PlayerId, code: RoomCode): Promise<void> {
    await this.change((record) => forgetPlayer(record, playerId, code));
  }

  async release(playerId: PlayerId, code: RoomCode): Promise<void> {
    await this.change((record) => releasePlayer(record, playerId, code));
  }

  async roomChanged(
    code: RoomCode,
    summary: RoomSummary | null,
    ended: { readonly played: ReadonlyArray<PlayedActions>; readonly now: EpochMs },
  ): Promise<void> {
    await this.change((record) =>
      withActionsAdded(withRoomSummary(record, code, summary), ended.played, ended.now),
    );
  }

  async setCountsForTest(counts: PlayerCountsToday, now: EpochMs): Promise<void> {
    await this.change((record) => withPlayerCountsSet(record, counts, now));
  }

  override fetch(request: Request): Response {
    return acceptedSocketResponse(request, (server) => {
      this.ctx.acceptWebSocket(server);
      server.send(JSON.stringify(this.messageFor(this.read())));
    });
  }

  override webSocketMessage(): void {
    return undefined;
  }

  private async change(apply: (record: LobbyRecord) => LobbyRecord | null): Promise<boolean> {
    return this.ctx.blockConcurrencyWhile(async () => {
      const before = this.read();
      const after = apply(before);
      if (after === null) {
        return false;
      }
      if (JSON.stringify(after) !== JSON.stringify(before)) {
        this.ctx.storage.kv.put(LOBBY_KEY, after);
        this.broadcastIfListChanged(before, after);
      }
      return Promise.resolve(true);
    });
  }

  private read(): LobbyRecord {
    const parsed = v.safeParse(LOBBY_RECORD_SCHEMA, this.ctx.storage.kv.get(LOBBY_KEY));
    return parsed.success ? parsed.output : EMPTY_LOBBY;
  }

  private messageFor(record: LobbyRecord): LobbyMessage {
    return {
      type: "lobby",
      protocolVersion: PROTOCOL_VERSION,
      publicRooms: publicRoomsOf(record).map((room) => ({
        ...room,
        playerNames: [...room.playerNames],
      })),
    };
  }

  private broadcastIfListChanged(before: LobbyRecord, after: LobbyRecord): void {
    const message = JSON.stringify(this.messageFor(after));
    if (message === JSON.stringify(this.messageFor(before))) {
      return;
    }
    for (const socket of this.ctx.getWebSockets()) {
      socket.send(message);
    }
  }
}
