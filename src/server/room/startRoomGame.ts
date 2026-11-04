import { startSavedGame } from "../../rules/startSavedGame";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { GameStart } from "./GameStart";
import { NO_WAITING } from "./NO_WAITING";
import type { RoomRecord } from "./RoomRecord";

const SEAT_NUMBERS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function nameOf(record: RoomRecord, playerId: string): string {
  return record.players.find((player) => player.playerId === playerId)?.name ?? "";
}

export function startRoomGame(record: RoomRecord, start: GameStart): RoomRecord {
  const seatOrder = start.seatOrder(record.players.map(({ playerId }) => playerId));
  return {
    ...record,
    waiting: NO_WAITING,
    game: {
      kind: "casual",
      saved: startSavedGame({ players: record.size, startedAt: start.now }, start.seed),
      seats: seatOrder.map((playerId, index) => ({
        seat: SEAT_NUMBERS[index] ?? 1,
        playerId,
        name: nameOf(record, playerId),
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}
