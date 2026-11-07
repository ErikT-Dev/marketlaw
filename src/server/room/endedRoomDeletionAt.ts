import { epochMsAfter } from "../../rules/epochMsAfter";
import type { EpochMs } from "../../shared/EpochMs";
import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";

export function endedRoomDeletionAt(record: RoomRecord): EpochMs | null {
  const state = record.game?.saved.state;
  return state?.phase === "ended"
    ? epochMsAfter(state.clockStartedAt, ROOM_TIMES.endedRoomKeptMs)
    : null;
}
