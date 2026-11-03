import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";

export function roomWithout(
  record: RoomRecord,
  playerIds: ReadonlyArray<PlayerId>,
): RoomRecord | null {
  const players = record.players.filter(({ playerId }) => !playerIds.includes(playerId));
  if (players.length === 0) {
    return null;
  }
  return {
    ...record,
    players,
    waiting: {
      ...record.waiting,
      asking: null,
      disconnected: record.waiting.disconnected.filter(
        ({ playerId }) => !playerIds.includes(playerId),
      ),
    },
  };
}
