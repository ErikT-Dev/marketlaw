import type { PublicRoomView } from "../shared/protocol/PublicRoomView";
import type { HostSocket } from "./HostSocket";
import type { SocketHandlers } from "./SocketHandlers";

export type LobbyFeedOptions = {
  readonly url: string;
  readonly openSocket: (url: string, handlers: SocketHandlers) => HostSocket;
  readonly runLater: (delayMs: number, run: () => void) => void;
  readonly onRooms: (rooms: ReadonlyArray<PublicRoomView>) => void;
};
