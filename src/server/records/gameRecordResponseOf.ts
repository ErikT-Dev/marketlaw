import * as v from "valibot";
import type { GameRecordResponse } from "../../shared/api/GameRecordResponse";
import { GameRecordView } from "../../shared/api/GameRecordView";
import type { GameId } from "../../shared/GameId";
import { playerIdAtSeat } from "./playerIdAtSeat";
import type { RecordReadDatabase } from "./RecordReadDatabase";
import { readStoredGameRecord } from "./readStoredGameRecord";
import { recordNameOf } from "./recordNameOf";
import type { UsernameLookup } from "./UsernameLookup";

export async function gameRecordResponseOf(
  db: RecordReadDatabase,
  usernamesOf: UsernameLookup,
  gameId: GameId,
): Promise<GameRecordResponse> {
  const stored = await readStoredGameRecord(db, gameId);
  if (stored === null) {
    return { kind: "not_found" };
  }
  const { players, startedMs, endedMs, ...record } = stored;
  const usernames = await usernamesOf(players.map(({ playerId }) => playerId));
  const view = {
    ...record,
    gameId,
    startedAt: startedMs,
    endedAt: endedMs,
    seats: record.seats.map((seat) => ({
      ...seat,
      player: recordNameOf(playerIdAtSeat(stored, seat.seat), usernames),
    })),
  };
  return { kind: "found", record: v.parse(GameRecordView, view) };
}
