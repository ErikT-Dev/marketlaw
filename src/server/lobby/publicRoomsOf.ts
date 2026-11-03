import type { PublicRoomView } from "../../shared/protocol/PublicRoomView";
import type { LobbyRecord } from "./LobbyRecord";

export function publicRoomsOf(record: LobbyRecord): ReadonlyArray<PublicRoomView> {
  return record.rooms
    .filter((room) => room.isPublic && room.isWaiting)
    .map((room) => ({
      code: room.code,
      size: room.size,
      ownerName: room.players[0]?.name ?? "",
      playerNames: room.players.map(({ name }) => name),
    }));
}
