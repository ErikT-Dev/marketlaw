import type { RoomCode } from "../../shared/RoomCode";
import type { LobbyRecord } from "./LobbyRecord";
import type { RoomSummary } from "./RoomSummary";

function isIn(players: RoomSummary["players"], playerId: string): boolean {
  return players.some((player) => player.playerId === playerId);
}

export function withRoomSummary(
  record: LobbyRecord,
  code: RoomCode,
  summary: RoomSummary | null,
): LobbyRecord {
  const busyHere = summary === null || summary.isOver ? [] : summary.players;
  const wasHere = record.rooms.find((room) => room.code === code)?.players ?? [];
  const left = wasHere.filter(({ playerId }) => !isIn(busyHere, playerId));
  const kept = record.busy.filter(
    (entry) =>
      !isIn(busyHere, entry.playerId) &&
      !(entry.code === code && left.some(({ playerId }) => playerId === entry.playerId)),
  );
  return {
    rooms: [
      ...record.rooms.filter((room) => room.code !== code),
      ...(summary === null || summary.isOver ? [] : [summary]),
    ],
    busy: [...kept, ...busyHere.map(({ playerId }) => ({ playerId, code }))],
    staying: [
      ...record.staying.filter((entry) => entry.code !== code),
      ...(summary?.freePlayers ?? []).map((playerId) => ({ playerId, code })),
    ],
  };
}
