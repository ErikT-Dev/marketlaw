import type { PublicRoomView } from "./protocol/PublicRoomView";

export type LobbyFeed = {
  readonly close: () => void;
};

export type OpenLobbyFeed = (onRooms: (rooms: ReadonlyArray<PublicRoomView>) => void) => LobbyFeed;
