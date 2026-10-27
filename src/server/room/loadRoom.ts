import { SAVE_SCHEMA_VERSION } from "../../rules/SAVE_SCHEMA_VERSION";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

export function loadRoom(storage: RoomStorage): RoomRecord | null {
  const stored = storage.read();
  if (stored === undefined) {
    return null;
  }
  const isCurrent =
    stored.schemaVersion === ROOM_SCHEMA_VERSION &&
    (stored.game === null || stored.game.saved.schemaVersion === SAVE_SCHEMA_VERSION);
  if (!isCurrent) {
    storage.remove();
    return null;
  }
  return stored;
}
