import * as v from "valibot";
import type { LobbyFeed } from "../shared/LobbyFeed";
import { LobbyMessage } from "../shared/protocol/LobbyMessage";
import type { HostSocket } from "./HostSocket";
import { reconnectDelayMs } from "./reconnectDelayMs";
import type { LobbyFeedOptions } from "./LobbyFeedOptions";

function parsedRooms(text: string) {
  try {
    const parsed = v.safeParse(LobbyMessage, JSON.parse(text));
    return parsed.success ? parsed.output.publicRooms : null;
  } catch {
    return null;
  }
}

export class RemoteLobbyFeed implements LobbyFeed {
  private readonly options: LobbyFeedOptions;
  private socket: HostSocket | null = null;
  private failedConnects = 0;
  private isClosedByPlayer = false;

  constructor(options: LobbyFeedOptions) {
    this.options = options;
    this.connect();
  }

  readonly close = (): void => {
    this.isClosedByPlayer = true;
    this.socket?.close();
  };

  private connect(): void {
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.failedConnects = 0;
      },
      onMessage: (text) => {
        const rooms = parsedRooms(text);
        if (rooms !== null) {
          this.options.onRooms(rooms);
        }
      },
      onClose: () => {
        this.socket = null;
        if (!this.isClosedByPlayer) {
          const delay = reconnectDelayMs(this.failedConnects);
          this.failedConnects += 1;
          this.options.runLater(delay, () => {
            this.connect();
          });
        }
      },
    });
  }
}
