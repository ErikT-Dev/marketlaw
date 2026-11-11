import type { PlayerId } from "../../shared/PlayerId";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { StoredGameRecord } from "./StoredGameRecord";

export function playerIdAtSeat(record: StoredGameRecord, seat: SeatNumber): PlayerId {
  const player = record.players.find((recorded) => recorded.seat === seat);
  if (player === undefined) {
    throw new Error(`the game record has no player at seat ${String(seat)}`);
  }
  return player.playerId;
}
