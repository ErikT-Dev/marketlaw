import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";
import type { PlayerCountsToday } from "./PlayerCountsToday";

export function withPlayerCountsSet(
  record: LobbyRecord,
  set: PlayerCountsToday,
  now: EpochMs,
): LobbyRecord {
  const counts = countsOn(record, now);
  const others = counts.players.filter((entry) => entry.playerId !== set.playerId);
  return { ...record, today: { ...counts, players: [...others, set] } };
}
