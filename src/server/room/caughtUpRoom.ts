import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { isEndedRoomDue } from "./isEndedRoomDue";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import { waitingAlarm } from "./waitingAlarm";
import { withLivePlayers } from "./withLivePlayers";

export function caughtUpRoom(
  record: RoomRecord,
  now: EpochMs,
  livePlayers: ReadonlyArray<PlayerId>,
): RoomChange {
  if (isEndedRoomDue(record, now)) {
    return { record: null, removals: [] };
  }
  if (record.game !== null) {
    return { record, removals: [] };
  }
  const live = withLivePlayers(record, livePlayers);
  const fired = waitingAlarm(live, now);
  return fired.removals.length === 0 ? { record, removals: [] } : fired;
}
