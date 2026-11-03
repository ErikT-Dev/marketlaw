import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { fireAlarm } from "./fireAlarm";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import { waitingAlarm } from "./waitingAlarm";
import { withLivePlayers } from "./withLivePlayers";

export function fireRoomAlarm(
  record: RoomRecord,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
  livePlayers: ReadonlyArray<PlayerId>,
): RoomChange {
  if (record.game !== null) {
    return { record: fireAlarm(record, now, randomFor), removals: [] };
  }
  const live = withLivePlayers(record, livePlayers);
  const fired = waitingAlarm(live, now);
  return fired.record === live && live !== record ? { record: live, removals: [] } : fired;
}
