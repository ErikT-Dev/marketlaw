import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";

export function endedRoomDeletionAt(record: RoomRecord): number | null {
  const state = record.game?.saved.state;
  return state?.phase === "ended" ? state.clockStartedAt + ROOM_TIMES.endedRoomKeptMs : null;
}
