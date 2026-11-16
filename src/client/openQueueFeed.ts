import { openBrowserSocket } from "../hosts/openBrowserSocket";
import { RemoteQueueFeed } from "../hosts/RemoteQueueFeed";
import type { QueueFeed } from "../shared/QueueFeed";
import type { QueueFeedHandlers } from "../shared/QueueFeedHandlers";

export function openQueueFeed(handlers: QueueFeedHandlers): QueueFeed {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new RemoteQueueFeed({
    url: `${protocol}//${window.location.host}/api/queue/socket`,
    openSocket: openBrowserSocket,
    runLater: (delayMs, run) => {
      window.setTimeout(run, delayMs);
    },
    handlers,
  });
}
