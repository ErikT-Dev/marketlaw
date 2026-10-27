import type { HostSocket } from "./HostSocket";
import type { SocketHandlers } from "./SocketHandlers";

export type RemoteHostOptions = {
  readonly url: string;
  readonly token: string;
  readonly openSocket: (url: string, handlers: SocketHandlers) => HostSocket;
  readonly newActionId: () => string;
  readonly runLater: (delayMs: number, run: () => void) => void;
};
