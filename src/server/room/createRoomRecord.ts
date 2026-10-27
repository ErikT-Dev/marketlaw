import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomRecord } from "./RoomRecord";

export function createRoomRecord(code: RoomCode, size: 2 | 3 | 4, owner: Identity): RoomRecord {
  return { schemaVersion: ROOM_SCHEMA_VERSION, code, size, players: [owner], game: null };
}
