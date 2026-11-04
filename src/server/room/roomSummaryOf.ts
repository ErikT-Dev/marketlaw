import type { RoomSummary } from "../lobby/RoomSummary";
import { busyPlayersOf } from "./busyPlayersOf";
import type { RoomRecord } from "./RoomRecord";

export function roomSummaryOf(record: RoomRecord): RoomSummary {
  const busy = busyPlayersOf(record);
  return {
    code: record.code,
    size: record.size,
    isPublic: record.isPublic,
    isWaiting: record.game === null,
    isOver: record.game?.saved.state.phase === "ended",
    players: busy.map(({ playerId, name }) => ({ playerId, name })),
    freePlayers: record.players
      .filter(({ playerId }) => !busy.some((player) => player.playerId === playerId))
      .map(({ playerId }) => playerId),
  };
}
