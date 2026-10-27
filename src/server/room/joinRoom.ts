import { startSavedGame } from "../../rules/startSavedGame";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";

const SEAT_NUMBERS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function startGame(record: RoomRecord, seed: number): RoomRecord {
  return {
    ...record,
    game: {
      saved: startSavedGame({ players: record.size }, seed),
      seats: record.players.map((player, index) => ({
        seat: SEAT_NUMBERS[index] ?? 1,
        playerId: player.playerId,
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}

export function joinRoom(
  record: RoomRecord,
  joining: Identity,
  seed: number,
): Result<RoomRecord, ReasonCode> {
  if (record.players.some((player) => player.playerId === joining.playerId)) {
    return { isOk: true, value: record };
  }
  if (record.game !== null) {
    return { isOk: false, error: "room_not_waiting" };
  }
  if (record.players.length >= record.size) {
    return { isOk: false, error: "room_full" };
  }
  const joined = { ...record, players: [...record.players, joining] };
  return {
    isOk: true,
    value: joined.players.length === record.size ? startGame(joined, seed) : joined,
  };
}
