import type { RoomSummary } from "../lobby/RoomSummary";
import type { RoomRecord } from "./RoomRecord";

export function roomSummaryOf(record: RoomRecord): RoomSummary {
  return {
    code: record.code,
    size: record.size,
    isPublic: record.isPublic,
    isWaiting: record.game === null,
    isOver: record.game?.saved.state.phase === "ended",
    players: record.players.map(({ playerId, name }) => ({ playerId, name })),
  };
}
