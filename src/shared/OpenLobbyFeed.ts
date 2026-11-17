import type { LobbyFeed } from "./LobbyFeed";
import type { LobbyFeedHandlers } from "./LobbyFeedHandlers";

export type OpenLobbyFeed = (handlers: LobbyFeedHandlers) => LobbyFeed;
