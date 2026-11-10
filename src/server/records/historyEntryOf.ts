import * as v from "valibot";
import { MatchHistoryEntry } from "../../shared/api/MatchHistoryEntry";
import type { PlayerId } from "../../shared/PlayerId";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { KeptGameRecord } from "./KeptGameRecord";
import { playerIdAtSeat } from "./playerIdAtSeat";
import { recordNameOf } from "./recordNameOf";
import type { StoredGameRecord } from "./StoredGameRecord";

function seatRecordAt(record: StoredGameRecord, seat: SeatNumber | undefined) {
  const seatRecord = record.seats.find((recorded) => recorded.seat === seat);
  if (seatRecord === undefined) {
    throw new Error(`the game record has no seat ${String(seat)}`);
  }
  return seatRecord;
}

export function historyEntryOf(
  { gameId, record }: KeptGameRecord,
  playerId: PlayerId,
  usernames: ReadonlyMap<PlayerId, string>,
): MatchHistoryEntry {
  const own = seatRecordAt(
    record,
    record.players.find((player) => player.playerId === playerId)?.seat,
  );
  return v.parse(MatchHistoryEntry, {
    gameId,
    endedAt: record.endedMs,
    result: own.result,
    place: own.place,
    players: record.seats.length,
    score: own.score,
    turns: record.turns,
    winner: recordNameOf(playerIdAtSeat(record, record.winner), usernames),
    winnerScore: seatRecordAt(record, record.winner).score,
  });
}
