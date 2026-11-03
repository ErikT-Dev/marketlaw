import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import { fireAlarm } from "./fireAlarm";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import { waitingAlarm } from "./waitingAlarm";

export function fireRoomAlarm(
  record: RoomRecord,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
): RoomChange {
  return record.game === null
    ? waitingAlarm(record, now)
    : { record: fireAlarm(record, now, randomFor), removals: [] };
}
