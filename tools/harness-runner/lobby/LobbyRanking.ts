import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import { rankingOf } from "../../../src/server/ratings/rankingOf.ts";
import type { RankingViewer } from "../../../src/server/ratings/RankingViewer.ts";
import type { RankingPage } from "../../../src/shared/api/RankingPage.ts";
import type { RankingResponse } from "../../../src/shared/api/RankingResponse.ts";
import { givenRankingRatingsOf } from "./givenRankingRatingsOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { memoryReadStatementOf } from "./memoryReadStatementOf.ts";

const MIGRATIONS = new URL("../../../migrations/", import.meta.url);

type RankingAccount = { readonly id: string; readonly name: string; readonly kind: string };

function migratedDatabase(): DatabaseSync {
  const sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync(MIGRATIONS).sort()) {
    sqlite.exec(readFileSync(new URL(file, MIGRATIONS), "utf8"));
  }
  return sqlite;
}

function rankingAccountsOf(accounts: ReadonlyMap<string, LobbyAccount>) {
  return new Map<string, RankingAccount>(
    [...accounts.values()].map(({ identity, registration }) => [
      identity.name,
      {
        id: identity.playerId,
        name: identity.name,
        kind: registration === null ? "guest" : "registered",
      },
    ]),
  );
}

export class LobbyRanking {
  opened: RankingResponse | null = null;
  viewerName: string | null = null;
  private readonly given: LobbyGiven;

  constructor(given: LobbyGiven) {
    this.given = given;
  }

  async open(
    accounts: ReadonlyMap<string, LobbyAccount>,
    viewer: { readonly name: string | null; readonly ranking: RankingViewer },
    page: RankingPage,
  ): Promise<void> {
    const sqlite = this.databaseFor(accounts);
    this.viewerName = viewer.name;
    this.opened = await rankingOf(
      { prepare: (query) => memoryReadStatementOf(sqlite, query, []) },
      viewer.ranking,
      page,
    );
  }

  private databaseFor(accounts: ReadonlyMap<string, LobbyAccount>): DatabaseSync {
    const sqlite = migratedDatabase();
    const players = rankingAccountsOf(accounts);
    const addPlayer = sqlite.prepare(
      "INSERT INTO players (id, name, name_key, created_ms, kind) VALUES (?, ?, ?, 0, ?)",
    );
    const addRating = sqlite.prepare(
      "INSERT INTO ratings (player_id, rating, ranked_games, highest_rating) VALUES (?, ?, ?, ?)",
    );
    for (const rated of givenRankingRatingsOf(this.given)) {
      const player = rated.isFixture
        ? { id: randomUUID(), name: rated.name, kind: "registered" }
        : players.get(rated.name);
      if (player !== undefined) {
        players.set(player.name, player);
        const highest = Math.max(rated.rating, NEW_PLAYER_RATING.highestRating);
        addRating.run(player.id, rated.rating, rated.rankedGames, highest);
      }
    }
    for (const { id, name, kind } of players.values()) {
      addPlayer.run(id, name, nameKeyOf(name), kind);
    }
    return sqlite;
  }
}
