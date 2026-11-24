import type { GameState } from "../../rules/GameState";
import { SAVE_SCHEMA_VERSION } from "../../rules/SAVE_SCHEMA_VERSION";
import { withClocksStartedAt } from "../../rules/withClocksStartedAt";
import type { EpochMs } from "../../shared/EpochMs";
import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import { loadRoom } from "./loadRoom";
import { NO_CHAT } from "./NO_CHAT";
import { NO_WAITING } from "./NO_WAITING";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomStorage } from "./RoomStorage";

const PLAYER_COUNTS = [1, 2, 3, 4] as const;
const ROOM_SIZES = [2, 3, 4] as const;

export function startTestRoomIn(
  storage: RoomStorage,
  room: { readonly code: RoomCode; readonly seed: number; readonly now: EpochMs },
  players: ReadonlyArray<Identity>,
  given: GameState,
): boolean {
  const state = withClocksStartedAt(given, room.now);
  const playerCount = PLAYER_COUNTS.find((count) => count === state.seats.length);
  const size = ROOM_SIZES.find((candidate) => candidate === Math.max(2, state.seats.length));
  const isOnePlayerPerSeat = players.length === state.seats.length;
  if (
    loadRoom(storage) !== null ||
    playerCount === undefined ||
    size === undefined ||
    !isOnePlayerPerSeat
  ) {
    return false;
  }
  storage.write({
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: room.code,
    size,
    players,
    isPublic: false,
    waiting: NO_WAITING,
    game: {
      kind: state.kind,
      ratingsBeforeGame: [],
      saved: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        seed: room.seed,
        setup: { players: playerCount, kind: state.kind, startedAt: room.now },
        startingState: state,
        actionLog: [],
        state,
      },
      seats: state.seats.flatMap((seat, index) => {
        const player = players[index];
        return player === undefined
          ? []
          : [
              {
                seat: seat.seat,
                playerId: player.playerId,
                name: player.name,
                icon: player.icon,
                stateVersion: 0,
                acceptedActionIds: [],
              },
            ];
      }),
    },
    chat: NO_CHAT,
  });
  return true;
}
