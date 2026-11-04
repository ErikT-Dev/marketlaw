import type { PlayerId } from "../../shared/PlayerId";
import { busyPlayersOf } from "./busyPlayersOf";
import type { RoomRecord } from "./RoomRecord";

export function isPlayerBusyIn(record: RoomRecord | null, playerId: PlayerId): boolean {
  return record !== null && busyPlayersOf(record).some((player) => player.playerId === playerId);
}
