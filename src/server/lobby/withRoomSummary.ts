import type { RoomCode } from "../../shared/RoomCode";
import type { LobbyRecord } from "./LobbyRecord";
import type { RoomSummary } from "./RoomSummary";

export function withRoomSummary(
  record: LobbyRecord,
  code: RoomCode,
  summary: RoomSummary | null,
): LobbyRecord {
  const busyHere = summary === null || summary.isOver ? [] : summary.players;
  const others = record.busy.filter(
    (entry) =>
      entry.code !== code && !busyHere.some((player) => player.playerId === entry.playerId),
  );
  return {
    rooms: [
      ...record.rooms.filter((room) => room.code !== code),
      ...(summary === null || summary.isOver ? [] : [summary]),
    ],
    busy: [...others, ...busyHere.map(({ playerId }) => ({ playerId, code }))],
  };
}
