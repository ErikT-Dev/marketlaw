import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import { loadRoom } from "./loadRoom";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomStorage } from "./RoomStorage";

export function createRoomIn(
  storage: RoomStorage,
  room: { readonly code: RoomCode; readonly size: 2 | 3 | 4 },
  owner: Identity,
): boolean {
  if (loadRoom(storage) !== null) {
    return false;
  }
  storage.write({ schemaVersion: ROOM_SCHEMA_VERSION, ...room, players: [owner], game: null });
  return true;
}
