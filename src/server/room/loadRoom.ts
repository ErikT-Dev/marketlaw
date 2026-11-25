import { migratedRoomRecord } from "./migratedRoomRecord";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

export function loadRoom(storage: RoomStorage): RoomRecord | null {
  const stored = storage.read();
  if (stored === undefined) {
    return null;
  }
  const room = migratedRoomRecord(stored);
  if (room === null) {
    storage.remove();
  }
  return room;
}
