import { applyDueTimeOuts } from "../../rules/applyDueTimeOuts";
import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { RoomRecord } from "./RoomRecord";
import { withTimeOutsApplied } from "./withTimeOutsApplied";

export function fireAlarm(
  record: RoomRecord,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
): RoomRecord {
  if (record.game === null) {
    return record;
  }
  const caughtUp = applyDueTimeOuts(record.game.saved, now, randomFor);
  return caughtUp === record.game.saved
    ? record
    : { ...record, game: withTimeOutsApplied(record.game, caughtUp) };
}
