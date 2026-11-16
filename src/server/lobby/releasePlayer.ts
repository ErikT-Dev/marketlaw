import type { PlayerId } from "../../shared/PlayerId";
import type { BusyPlace } from "./BusyPlace";
import type { LobbyRecord } from "./LobbyRecord";

export function releasePlayer(record: LobbyRecord, playerId: PlayerId, code: BusyPlace) {
  const isClaimed = record.busy.some((entry) => entry.playerId === playerId && entry.code === code);
  const isInRoom = record.rooms.some(
    (room) => room.code === code && room.players.some((player) => player.playerId === playerId),
  );
  return !isClaimed || isInRoom
    ? record
    : {
        ...record,
        busy: record.busy.filter((entry) => entry.playerId !== playerId || entry.code !== code),
      };
}
