import type { HistoryCursor } from "../../shared/api/HistoryCursor";
import type { MatchHistoryResponse } from "../../shared/api/MatchHistoryResponse";
import type { PlayerId } from "../../shared/PlayerId";
import { historyEntryOf } from "./historyEntryOf";
import { playerIdAtSeat } from "./playerIdAtSeat";
import type { RecordReadDatabase } from "./RecordReadDatabase";
import { readMatchHistoryPage } from "./readMatchHistoryPage";
import type { UsernameLookup } from "./UsernameLookup";

export async function matchHistoryOf(
  db: RecordReadDatabase,
  usernamesOf: UsernameLookup,
  playerId: PlayerId,
  before: HistoryCursor | null,
): Promise<MatchHistoryResponse> {
  const { games, older } = await readMatchHistoryPage(db, playerId, before);
  const winners = games.map(({ record }) => playerIdAtSeat(record, record.winner));
  const usernames = await usernamesOf([playerId, ...winners]);
  const username = usernames.get(playerId);
  return username === undefined
    ? { kind: "account_gone" }
    : {
        kind: "found",
        username,
        games: games.map((game) => historyEntryOf(game, playerId, usernames)),
        older,
      };
}
