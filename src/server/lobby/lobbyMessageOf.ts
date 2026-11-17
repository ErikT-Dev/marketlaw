import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { LobbyMessage } from "../../shared/protocol/LobbyMessage";
import type { LobbyRecord } from "./LobbyRecord";
import type { OnlineConnection } from "./OnlineConnection";
import { playersOnlineOf } from "./playersOnlineOf";
import { publicRoomsOf } from "./publicRoomsOf";

export function lobbyMessageOf(
  record: LobbyRecord,
  connections: ReadonlyArray<OnlineConnection>,
): LobbyMessage {
  return {
    type: "lobby",
    protocolVersion: PROTOCOL_VERSION,
    publicRooms: publicRoomsOf(record).map((room) => ({
      ...room,
      playerNames: [...room.playerNames],
      playerIds: [...room.playerIds],
    })),
    playersOnline: [...playersOnlineOf(record, connections)],
  };
}
