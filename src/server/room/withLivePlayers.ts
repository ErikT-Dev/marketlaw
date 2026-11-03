import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";

export function withLivePlayers(
  record: RoomRecord,
  livePlayers: ReadonlyArray<PlayerId>,
): RoomRecord {
  const disconnected = record.waiting.disconnected.filter(
    ({ playerId }) => !livePlayers.includes(playerId),
  );
  return disconnected.length === record.waiting.disconnected.length
    ? record
    : { ...record, waiting: { ...record.waiting, disconnected } };
}
