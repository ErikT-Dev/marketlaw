import { dueTimeOuts } from "../../rules/dueTimeOuts";
import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { fireAlarm } from "./fireAlarm";
import { isAnyPlayerConnected } from "./isAnyPlayerConnected";
import type { RoomRecord } from "./RoomRecord";
import { withSystemAction } from "./withSystemAction";

export function fireGameAlarm(
  record: RoomRecord,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
  livePlayers: ReadonlyArray<PlayerId>,
): RoomRecord {
  const { game } = record;
  if (game === null) {
    return record;
  }
  const [firstDue] = dueTimeOuts(game.saved.state, now);
  if (firstDue === undefined || isAnyPlayerConnected(game, livePlayers)) {
    return fireAlarm(record, now, randomFor);
  }
  return {
    ...record,
    game: withSystemAction(game, { type: "pause_game", seat: firstDue }, now, randomFor),
  };
}
