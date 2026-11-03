import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";

export function withConnection(
  record: RoomRecord,
  playerId: PlayerId,
  connection:
    { readonly isConnected: true } | { readonly isConnected: false; readonly at: EpochMs },
): RoomRecord {
  const isMember = record.players.some((player) => player.playerId === playerId);
  const others = record.waiting.disconnected.filter((entry) => entry.playerId !== playerId);
  const isListed = others.length !== record.waiting.disconnected.length;
  if (record.game !== null || !isMember || (connection.isConnected && !isListed)) {
    return record;
  }
  return {
    ...record,
    waiting: {
      ...record.waiting,
      disconnected: connection.isConnected
        ? others
        : [...others, { playerId, since: connection.at }],
    },
  };
}
