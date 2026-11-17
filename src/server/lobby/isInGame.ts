import type { PlayerId } from "../../shared/PlayerId";
import type { LobbyRecord } from "./LobbyRecord";

export function isInGame(record: LobbyRecord, playerId: PlayerId): boolean {
  const busyIn = record.busy.find((entry) => entry.playerId === playerId)?.code;
  return record.rooms.some(
    (room) =>
      room.code === busyIn &&
      !room.isWaiting &&
      room.players.some((player) => player.playerId === playerId),
  );
}
