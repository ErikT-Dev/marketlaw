import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { countsOn } from "./countsOn";
import { DAILY_PLAYER_LIMITS } from "./DAILY_PLAYER_LIMITS";
import type { LobbyRecord } from "./LobbyRecord";

export function dailyLimitRejection(record: LobbyRecord, playerId: PlayerId, now: EpochMs) {
  const counts = countsOn(record, now).players.find((entry) => entry.playerId === playerId);
  if (counts === undefined) {
    return null;
  }
  if (counts.actions >= DAILY_PLAYER_LIMITS.actions) {
    return "daily_action_limit";
  }
  return counts.gameStarts >= DAILY_PLAYER_LIMITS.gameStarts ? "daily_game_start_limit" : null;
}
