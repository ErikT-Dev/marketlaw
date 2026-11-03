import type { LobbyFeed } from "./LobbyFeed";
import type { PublicRoomView } from "./protocol/PublicRoomView";

export type OpenLobbyFeed = (onRooms: (rooms: ReadonlyArray<PublicRoomView>) => void) => LobbyFeed;
