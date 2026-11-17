import type { RankedGameSize } from "../../shared/RankedGameSize";
import type { RoomCode } from "../../shared/RoomCode";
import type { GameStart } from "./GameStart";
import { loadRoom } from "./loadRoom";
import { NO_CHAT } from "./NO_CHAT";
import { NO_WAITING } from "./NO_WAITING";
import type { RankedPlayer } from "./RankedPlayer";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomStorage } from "./RoomStorage";
import { startRoomGame } from "./startRoomGame";

export function startRankedRoomIn(
  storage: RoomStorage,
  room: {
    readonly code: RoomCode;
    readonly size: RankedGameSize;
    readonly playersInQueueOrder: ReadonlyArray<RankedPlayer>;
  },
  start: Omit<GameStart, "limitRejectionFor">,
): boolean {
  if (loadRoom(storage) !== null || room.playersInQueueOrder.length !== room.size) {
    return false;
  }
  const waitingRoom = {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: room.code,
    size: room.size,
    isPublic: false,
    players: room.playersInQueueOrder.map(({ playerId, name }) => ({ playerId, name })),
    waiting: NO_WAITING,
    game: null,
    chat: NO_CHAT,
  };
  const started = startRoomGame(waitingRoom, start, "ranked");
  storage.write({
    ...started,
    game:
      started.game === null
        ? null
        : {
            ...started.game,
            ratingsBeforeGame: room.playersInQueueOrder.map(
              ({ playerId, rating, rankedGames, highestRating }) => ({
                playerId,
                rating,
                rankedGames,
                highestRating,
              }),
            ),
          },
  });
  return true;
}
