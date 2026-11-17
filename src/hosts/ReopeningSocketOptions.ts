import type { HostSocket } from "./HostSocket";
import type { SocketHandlers } from "./SocketHandlers";

export type ReopeningSocketOptions = {
  readonly url: string;
  readonly openSocket: (url: string, handlers: SocketHandlers) => HostSocket;
  readonly runLater: (delayMs: number, run: () => void) => void;
  readonly onOpen: () => void;
  readonly onMessage: (text: string) => void;
};
