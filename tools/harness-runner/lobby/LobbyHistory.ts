import { randomUUID } from "node:crypto";
import * as v from "valibot";
import { RESERVED_USERNAME } from "../../../src/server/accounts/RESERVED_USERNAME.ts";
import { gameRecordResponseOf } from "../../../src/server/records/gameRecordResponseOf.ts";
import { matchHistoryOf } from "../../../src/server/records/matchHistoryOf.ts";
import { readMatchHistoryPage } from "../../../src/server/records/readMatchHistoryPage.ts";
import { saveGameRecord } from "../../../src/server/records/saveGameRecord.ts";
import type { StoredGameRecord } from "../../../src/server/records/StoredGameRecord.ts";
import type { UsernameLookup } from "../../../src/server/records/UsernameLookup.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { MatchHistoryResponse } from "../../../src/shared/api/MatchHistoryResponse.ts";
import { GameId } from "../../../src/shared/GameId.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { SeatNumber } from "../../../src/shared/SeatNumber.ts";
import { fixtureGameRecordOf } from "./fixtureGameRecordOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";

type AccountGame = { readonly gameId: GameId; readonly seat: SeatNumber };

function usernamesIn(accounts: ReadonlyMap<string, LobbyAccount>): UsernameLookup {
  return async (playerIds) =>
    Promise.resolve(
      new Map(
        [...accounts.values()]
          .filter(({ identity }) => playerIds.includes(identity.playerId))
          .map(({ identity }) => [identity.playerId, identity.name]),
      ),
    );
}

function givenRecordsOf(given: LobbyGiven, identityNamed: (name: string) => Identity) {
  return (given.records ?? []).map(({ date, turns, players }) =>
    fixtureGameRecordOf(
      Date.parse(`${date}T12:00:00Z`),
      turns,
      players.map(({ username, ...player }) => ({
        ...player,
        playerId: identityNamed(username).playerId,
      })),
    ),
  );
}

function accountGamesOf(given: LobbyGiven, identityNamed: (name: string) => Identity) {
  return (given.accounts ?? []).flatMap((account) =>
    Array.from({ length: account.games ?? 0 }, () => {
      const opponent = { playerId: v.parse(PlayerId, randomUUID()), place: 2, score: 0 };
      return fixtureGameRecordOf(1, 20, [
        { playerId: identityNamed(account.name).playerId, place: 1, score: 0, result: "won" },
        { ...opponent, result: "lost" },
      ]);
    }),
  );
}

export class LobbyHistory {
  readonly seats: ReadonlyArray<{ readonly seat: number; readonly playerId: PlayerId }>;
  opened: MatchHistoryResponse | null = null;
  private readonly records = memoryGameRecordDatabase();
  private readonly accountGames: ReadonlyArray<AccountGame>;
  private readonly saved: Promise<void>;

  constructor(given: LobbyGiven, identityNamed: (name: string) => Identity) {
    this.seats = (given.seats ?? []).map(({ seat, player }) => ({
      seat,
      playerId: identityNamed(player).playerId,
    }));
    const accountGames = accountGamesOf(given, identityNamed).map((record) => ({
      gameId: v.parse(GameId, randomUUID()),
      record,
    }));
    this.accountGames = accountGames.map(({ gameId }) => ({ gameId, seat: 1 }));
    this.saved = this.saveAll([
      ...accountGames,
      ...givenRecordsOf(given, identityNamed).map((record) => ({
        gameId: v.parse(GameId, randomUUID()),
        record,
      })),
    ]);
  }

  async gamesOf(playerId: PlayerId): Promise<number> {
    await this.saved;
    return (await readMatchHistoryPage(this.records.reader, playerId, null)).games.length;
  }

  async open(accounts: ReadonlyMap<string, LobbyAccount>, playerId: PlayerId): Promise<void> {
    await this.saved;
    this.opened = await matchHistoryOf(this.records.reader, usernamesIn(accounts), playerId, null);
  }

  async accountGameUsernames(
    accounts: ReadonlyMap<string, LobbyAccount>,
  ): Promise<ReadonlyArray<string>> {
    await this.saved;
    return Promise.all(
      this.accountGames.map(async ({ gameId, seat }) => {
        const answer = await gameRecordResponseOf(
          this.records.reader,
          usernamesIn(accounts),
          gameId,
        );
        if (answer.kind === "not_found") {
          return "no game record";
        }
        const player = answer.record.seats.find((recorded) => recorded.seat === seat)?.player;
        return player?.kind === "player" ? player.username : RESERVED_USERNAME;
      }),
    );
  }

  private async saveAll(
    games: ReadonlyArray<{ readonly gameId: GameId; readonly record: StoredGameRecord }>,
  ): Promise<void> {
    for (const { gameId, record } of games) {
      await saveGameRecord(this.records.database, gameId, record);
    }
  }
}
