import type { LobbyFeed } from "../../shared/LobbyFeed";
import type { OpenLobbyFeed } from "../../shared/OpenLobbyFeed";
import type { OpenQueueFeed } from "../../shared/OpenQueueFeed";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { ClientState } from "./ClientState";
import { QueueStore } from "./QueueStore";

export abstract class LobbyFeedStore extends QueueStore {
  private readonly lobbyFeed: LobbyFeed;
  private identifiedToken: string | null = null;

  constructor(initial: ClientState, openLobby: OpenLobbyFeed, openQueue: OpenQueueFeed) {
    super(initial, openQueue);
    this.lobbyFeed = openLobby({
      onOpen: () => {
        this.identifyOnLobbyFeed();
      },
      onLobby: (publicRooms, playersOnline) => {
        this.change({ publicRooms, playersOnline });
      },
      onRejected: (code) => {
        this.receiveLobbyRejection(code);
      },
    });
  }

  protected override change(changes: Partial<ClientState>): void {
    super.change(changes);
    if ((this.state.session?.token ?? null) !== this.identifiedToken) {
      this.identifyOnLobbyFeed();
    }
  }

  private identifyOnLobbyFeed(): void {
    const token = this.state.session?.token ?? null;
    this.identifiedToken = token;
    if (token !== null) {
      this.lobbyFeed.identify(token);
    }
  }

  private receiveLobbyRejection(code: ReasonCode): void {
    const session = this.state.session;
    if (code === "wrong_protocol_version") {
      this.change({ isOutdated: true });
    } else if (code === "invalid_token" && session !== null) {
      void this.checkSession(session);
    }
  }
}
