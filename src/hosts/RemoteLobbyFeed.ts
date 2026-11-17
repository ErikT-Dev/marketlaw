import * as v from "valibot";
import type { LobbyFeed } from "../shared/LobbyFeed";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { LobbyClientMessage } from "../shared/protocol/LobbyClientMessage";
import { LOBBY_SERVER_MESSAGE_SCHEMA } from "../shared/protocol/LOBBY_SERVER_MESSAGE_SCHEMA";
import type { LobbyFeedOptions } from "./LobbyFeedOptions";
import { ReopeningSocket } from "./ReopeningSocket";

function parsedLobbyMessage(text: string) {
  try {
    const parsed = v.safeParse(LOBBY_SERVER_MESSAGE_SCHEMA, JSON.parse(text));
    return parsed.success ? parsed.output : null;
  } catch {
    return null;
  }
}

export class RemoteLobbyFeed implements LobbyFeed {
  private readonly options: LobbyFeedOptions;
  private readonly socket: ReopeningSocket;

  constructor(options: LobbyFeedOptions) {
    this.options = options;
    this.socket = new ReopeningSocket({
      ...options,
      onOpen: options.handlers.onOpen,
      onMessage: (text) => {
        this.receive(text);
      },
    });
  }

  readonly identify = (token: string): boolean => {
    const message: LobbyClientMessage = {
      protocolVersion: PROTOCOL_VERSION,
      type: "identify",
      token,
    };
    return this.socket.send(JSON.stringify(message));
  };

  readonly close = (): void => {
    this.socket.close();
  };

  private receive(text: string): void {
    const message = parsedLobbyMessage(text);
    const { handlers } = this.options;
    switch (message?.type) {
      case "lobby":
        handlers.onLobby(message.publicRooms, message.playersOnline);
        return;
      case "lobby_rejected":
        handlers.onRejected(message.code);
        return;
      case undefined:
        return;
    }
  }
}
