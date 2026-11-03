import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";

export function withConnection(
  record: RoomRecord,
  playerId: PlayerId,
  connection:
    { readonly isConnected: true } | { readonly isConnected: false; readonly at: EpochMs },
): RoomRecord {
  const isListed = record.waiting.disconnected.some((entry) => entry.playerId === playerId);
  const isMember = record.players.some((player) => player.playerId === playerId);
  if (record.game !== null || !isMember || isListed !== connection.isConnected) {
    return record;
  }
  return {
    ...record,
    waiting: {
      ...record.waiting,
      disconnected: connection.isConnected
        ? record.waiting.disconnected.filter((entry) => entry.playerId !== playerId)
        : [...record.waiting.disconnected, { playerId, since: connection.at }],
    },
  };
}
