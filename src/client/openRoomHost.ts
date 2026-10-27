import { openBrowserSocket } from "../hosts/openBrowserSocket";
import { RemoteGameHost } from "../hosts/RemoteGameHost";
import type { GameHost } from "../shared/GameHost";
import type { RoomCode } from "../shared/RoomCode";

export function openRoomHost(code: RoomCode, token: string): GameHost {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new RemoteGameHost({
    url: `${protocol}//${window.location.host}/api/rooms/${code}/socket`,
    token,
    openSocket: openBrowserSocket,
    newActionId: () => crypto.randomUUID(),
    runLater: (delayMs, run) => {
      window.setTimeout(run, delayMs);
    },
  });
}
