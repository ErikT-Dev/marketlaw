import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { endedRoomDeletionAt } from "./endedRoomDeletionAt";
import { fireGameAlarm } from "./fireGameAlarm";
import { isEndedRoomDue } from "./isEndedRoomDue";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import { waitingAlarm } from "./waitingAlarm";
import { withRematchTimedOut } from "./withRematchTimedOut";
import { withLivePlayers } from "./withLivePlayers";

export function fireRoomAlarm(
  record: RoomRecord,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
  livePlayers: ReadonlyArray<PlayerId>,
): RoomChange {
  if (isEndedRoomDue(record, now)) {
    return { record: null, removals: [] };
  }
  if (endedRoomDeletionAt(record) !== null) {
    return { record: withRematchTimedOut(record, now), removals: [] };
  }
  if (record.game !== null) {
    return { record: fireGameAlarm(record, now, randomFor, livePlayers), removals: [] };
  }
  const live = withLivePlayers(record, livePlayers);
  const fired = waitingAlarm(live, now);
  return fired.record === live && live !== record ? { record: live, removals: [] } : fired;
}
