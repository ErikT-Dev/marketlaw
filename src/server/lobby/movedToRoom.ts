import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";
import type { BusyPlace } from "./BusyPlace";
import type { LobbyRecord } from "./LobbyRecord";

export function movedToRoom(
  record: LobbyRecord,
  players: ReadonlyArray<PlayerId>,
  from: BusyPlace,
  code: RoomCode,
): LobbyRecord {
  return {
    ...record,
    busy: record.busy.map((entry) =>
      entry.code === from && players.includes(entry.playerId) ? { ...entry, code } : entry,
    ),
  };
}
