import type { RecordReadDatabase } from "../records/RecordReadDatabase";
import { readRankedPlayers } from "../ratings/readRankedPlayers";
import { shownRatingOf } from "../ratings/shownRatingOf";
import type { Sender } from "../Sender";
import type { OnlineConnection } from "./OnlineConnection";

export async function onlineConnectionOf(
  db: RecordReadDatabase,
  { identity, tokenHash }: Sender,
): Promise<OnlineConnection> {
  const ranked = (await readRankedPlayers(db, [identity.playerId])).get(identity.playerId);
  return {
    playerId: identity.playerId,
    username: identity.name,
    tokenHash,
    rating: ranked === undefined ? null : shownRatingOf(ranked),
  };
}
