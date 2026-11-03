import { openBrowserSocket } from "../hosts/openBrowserSocket";
import { RemoteLobbyFeed } from "../hosts/RemoteLobbyFeed";
import type { LobbyFeed } from "../shared/LobbyFeed";
import type { PublicRoomView } from "../shared/protocol/PublicRoomView";

export function openLobbyFeed(onRooms: (rooms: ReadonlyArray<PublicRoomView>) => void): LobbyFeed {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new RemoteLobbyFeed({
    url: `${protocol}//${window.location.host}/api/lobby/socket`,
    openSocket: openBrowserSocket,
    runLater: (delayMs, run) => {
      window.setTimeout(run, delayMs);
    },
    onRooms,
  });
}
