import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";
import type { LobbyRecord } from "./LobbyRecord";

export function forgetPlayer(record: LobbyRecord, playerId: PlayerId, code: RoomCode): LobbyRecord {
  return {
    ...record,
    rooms: record.rooms.map((room) =>
      room.code === code
        ? { ...room, players: room.players.filter((player) => player.playerId !== playerId) }
        : room,
    ),
    busy: record.busy.filter((entry) => entry.playerId !== playerId || entry.code !== code),
  };
}
