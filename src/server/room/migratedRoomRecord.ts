import { migratedSavedGame } from "../../rules/migratedSavedGame";
import { migratedRecord } from "../../shared/migratedRecord";
import { FIRST_PUBLIC_ROOM_SCHEMA_VERSION } from "./FIRST_PUBLIC_ROOM_SCHEMA_VERSION";
import { ROOM_MIGRATION_STEPS } from "./ROOM_MIGRATION_STEPS";
import type { RoomRecord } from "./RoomRecord";

export function migratedRoomRecord(stored: RoomRecord): RoomRecord | null {
  const room = migratedRecord(stored, FIRST_PUBLIC_ROOM_SCHEMA_VERSION, ROOM_MIGRATION_STEPS);
  if (room === null || room.game === null) {
    return room;
  }
  const saved = migratedSavedGame(room.game.saved);
  if (saved === null) {
    return null;
  }
  return saved === room.game.saved ? room : { ...room, game: { ...room.game, saved } };
}
