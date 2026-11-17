import type { LobbyFeedHandlers } from "../shared/LobbyFeedHandlers";
import type { HostSocket } from "./HostSocket";
import type { SocketHandlers } from "./SocketHandlers";

export type LobbyFeedOptions = {
  readonly url: string;
  readonly openSocket: (url: string, handlers: SocketHandlers) => HostSocket;
  readonly runLater: (delayMs: number, run: () => void) => void;
  readonly handlers: LobbyFeedHandlers;
};
