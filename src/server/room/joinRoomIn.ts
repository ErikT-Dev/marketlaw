import type { ReasonCode } from "../../shared/ReasonCode";
import type { GameStart } from "./GameStart";
import type { Identity } from "./Identity";
import { joinRoom } from "./joinRoom";
import { loadRoom } from "./loadRoom";
import type { RoomStorage } from "./RoomStorage";

export function joinRoomIn(
  storage: RoomStorage,
  joining: Identity,
  start: GameStart,
): ReasonCode | null {
  const record = loadRoom(storage);
  if (record === null) {
    return "room_not_found";
  }
  const joined = joinRoom(record, joining, start);
  if (!joined.isOk) {
    return joined.error;
  }
  if (joined.value !== record) {
    storage.write(joined.value);
  }
  return null;
}
