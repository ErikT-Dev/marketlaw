import { openBrowserSocket } from "../hosts/openBrowserSocket";
import { RemoteGameHost } from "../hosts/RemoteGameHost";
import type { GameHost } from "../shared/GameHost";

export function openSocketHost(path: string, token: string): GameHost {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new RemoteGameHost({
    url: `${protocol}//${window.location.host}${path}`,
    token,
    openSocket: openBrowserSocket,
    newActionId: () => crypto.randomUUID(),
    runLater: (delayMs, run) => {
      window.setTimeout(run, delayMs);
    },
  });
}
