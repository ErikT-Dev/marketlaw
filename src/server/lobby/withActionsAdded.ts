import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";
import type { PlayedActions } from "./PlayedActions";

export function withActionsAdded(
  record: LobbyRecord,
  played: ReadonlyArray<PlayedActions>,
  now: EpochMs,
): LobbyRecord {
  if (played.length === 0) {
    return record;
  }
  const counts = countsOn(record, now);
  const added = played.map(({ playerId, actions }) => {
    const before = counts.players.find((entry) => entry.playerId === playerId);
    return {
      playerId,
      actions: (before?.actions ?? 0) + actions,
      gameStarts: before?.gameStarts ?? 0,
    };
  });
  const others = counts.players.filter(
    (entry) => !played.some(({ playerId }) => playerId === entry.playerId),
  );
  return { ...record, today: { ...counts, players: [...others, ...added] } };
}
