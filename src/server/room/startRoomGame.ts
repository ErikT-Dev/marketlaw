import { startSavedGame } from "../../rules/startSavedGame";
import { iconOfOlderAccount } from "../accounts/iconOfOlderAccount";
import type { PlayerId } from "../../shared/PlayerId";
import type { Identity } from "./Identity";
import type { GameKind } from "../../shared/GameKind";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { GameStart } from "./GameStart";
import { NO_WAITING } from "./NO_WAITING";
import type { RoomRecord } from "./RoomRecord";
import { roomSizeOf } from "./roomSizeOf";

const SEAT_NUMBERS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function identityOf(record: RoomRecord, playerId: PlayerId): Identity {
  return (
    record.players.find((player) => player.playerId === playerId) ?? {
      playerId,
      name: "",
      icon: iconOfOlderAccount(playerId),
    }
  );
}

export function startRoomGame(
  record: RoomRecord,
  start: Omit<GameStart, "limitRejectionFor">,
  kind: GameKind,
): RoomRecord {
  const seatOrder = start.seatOrder(record.players.map(({ playerId }) => playerId));
  return {
    ...record,
    waiting: NO_WAITING,
    game: {
      kind,
      ratingsBeforeGame: [],
      saved: startSavedGame(
        {
          players: roomSizeOf(record.players.length) ?? record.size,
          kind,
          startedAt: start.now,
        },
        start.seed,
      ),
      seats: seatOrder.map((playerId, index) => ({
        seat: SEAT_NUMBERS[index] ?? 1,
        playerId,
        name: identityOf(record, playerId).name,
        icon: identityOf(record, playerId).icon,
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}
