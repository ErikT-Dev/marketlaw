import type { PlayerOnlineView } from "./protocol/PlayerOnlineView";
import type { PublicRoomView } from "./protocol/PublicRoomView";
import type { ReasonCode } from "./ReasonCode";

export type LobbyFeedHandlers = {
  readonly onOpen: () => void;
  readonly onLobby: (
    publicRooms: ReadonlyArray<PublicRoomView>,
    playersOnline: ReadonlyArray<PlayerOnlineView>,
  ) => void;
  readonly onRejected: (code: ReasonCode) => void;
};
