import type { PlayerId } from "../../shared/PlayerId";
import { isPlayerBusyIn } from "./isPlayerBusyIn";
import { loadRoom } from "./loadRoom";
import { roomWithout } from "./roomWithout";
import type { RoomStorage } from "./RoomStorage";

export function leaveRoomIfFreeIn(storage: RoomStorage, playerId: PlayerId): boolean {
  const record = loadRoom(storage);
  const isInRoom = record?.players.some((player) => player.playerId === playerId) === true;
  if (record === null || !isInRoom || isPlayerBusyIn(record, playerId)) {
    return false;
  }
  const remaining = roomWithout(record, [playerId]);
  if (remaining === null) {
    storage.remove();
  } else {
    storage.write(remaining);
  }
  return true;
}
