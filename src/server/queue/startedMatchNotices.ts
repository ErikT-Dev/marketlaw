import type { RoomCode } from "../../shared/RoomCode";
import type { QueueNoticeTo } from "./QueueNoticeTo";
import type { RankedStart } from "./RankedStart";

export function startedMatchNotices(
  start: RankedStart,
  code: RoomCode,
): ReadonlyArray<QueueNoticeTo> {
  return start.players.map((playerId) => ({
    playerId,
    notice: { kind: "match_started", code },
  }));
}
