import type { EpochMs } from "../../shared/EpochMs";
import type { Identity } from "./Identity";
import { joinRoom, type JoinRejection } from "./joinRoom";
import { loadRoom } from "./loadRoom";
import type { RoomStorage } from "./RoomStorage";

export function joinRoomIn(
  storage: RoomStorage,
  joining: Identity,
  now: EpochMs,
): JoinRejection | null {
  const record = loadRoom(storage);
  if (record === null) {
    return { reason: "room_not_found", rejoinAt: null };
  }
  const joined = joinRoom(record, joining, now);
  if (!joined.isOk) {
    return joined.error;
  }
  if (joined.value !== record) {
    storage.write(joined.value);
  }
  return null;
}
