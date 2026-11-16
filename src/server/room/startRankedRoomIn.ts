import type { RankedGameSize } from "../../shared/RankedGameSize";
import type { RoomCode } from "../../shared/RoomCode";
import type { GameStart } from "./GameStart";
import type { Identity } from "./Identity";
import { loadRoom } from "./loadRoom";
import { NO_CHAT } from "./NO_CHAT";
import { NO_WAITING } from "./NO_WAITING";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomStorage } from "./RoomStorage";
import { startRoomGame } from "./startRoomGame";

export function startRankedRoomIn(
  storage: RoomStorage,
  room: {
    readonly code: RoomCode;
    readonly size: RankedGameSize;
    readonly playersInQueueOrder: ReadonlyArray<Identity>;
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
    players: room.playersInQueueOrder,
    waiting: NO_WAITING,
    game: null,
    chat: NO_CHAT,
  };
  storage.write(startRoomGame(waitingRoom, start, "ranked"));
  return true;
}
