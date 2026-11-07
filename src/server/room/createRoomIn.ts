import type { EpochMs } from "../../shared/EpochMs";
import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import { loadRoom } from "./loadRoom";
import { NO_CHAT } from "./NO_CHAT";
import { NO_WAITING } from "./NO_WAITING";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomStorage } from "./RoomStorage";

export function createRoomIn(
  storage: RoomStorage,
  room: { readonly code: RoomCode; readonly size: 2 | 3 | 4; readonly isPublic: boolean },
  owner: Identity,
  now: EpochMs,
): boolean {
  if (loadRoom(storage) !== null) {
    return false;
  }
  storage.write({
    schemaVersion: ROOM_SCHEMA_VERSION,
    ...room,
    players: [owner],
    waiting: { ...NO_WAITING, disconnected: [{ playerId: owner.playerId, since: now }] },
    game: null,
    chat: NO_CHAT,
  });
  return true;
}
