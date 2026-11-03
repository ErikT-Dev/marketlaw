import * as v from "valibot";
import type { LobbyFeed } from "../shared/LobbyFeed";
import { LobbyMessage } from "../shared/protocol/LobbyMessage";
import type { HostSocket } from "./HostSocket";
import { Reconnector } from "./Reconnector";
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
  private readonly reconnector: Reconnector;

  constructor(options: LobbyFeedOptions) {
    this.options = options;
    this.reconnector = new Reconnector(options.runLater);
    this.connect();
  }

  readonly close = (): void => {
    this.reconnector.close();
    this.socket?.close();
  };

  private connect(): void {
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.reconnector.connected();
      },
      onMessage: (text) => {
        const rooms = parsedRooms(text);
        if (rooms !== null) {
          this.options.onRooms(rooms);
        }
      },
      onClose: () => {
        this.socket = null;
        this.reconnector.afterDrop(() => {
          this.connect();
        });
      },
    });
  }
}
