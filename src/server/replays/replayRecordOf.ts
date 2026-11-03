import type { SavedGame } from "../../rules/SavedGame";
import type { ReplayRecord } from "./ReplayRecord";

export function replayRecordOf(saved: SavedGame): ReplayRecord {
  const { schemaVersion, seed, setup, startingState, actionLog } = saved;
  return { schemaVersion, seed, setup, startingState, actionLog };
}
