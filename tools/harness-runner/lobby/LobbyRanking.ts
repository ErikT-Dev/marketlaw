import { rankingOf } from "../../../src/server/ratings/rankingOf.ts";
import type { RankingViewer } from "../../../src/server/ratings/RankingViewer.ts";
import type { RankingPage } from "../../../src/shared/api/RankingPage.ts";
import type { RankingResponse } from "../../../src/shared/api/RankingResponse.ts";
import { givenRatingsDatabaseOf } from "./givenRatingsDatabaseOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { memoryReadStatementOf } from "./memoryReadStatementOf.ts";

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
    const sqlite = givenRatingsDatabaseOf(this.given, accounts);
    this.viewerName = viewer.name;
    this.opened = await rankingOf(
      { prepare: (query) => memoryReadStatementOf(sqlite, query, []) },
      viewer.ranking,
      page,
    );
  }
}
