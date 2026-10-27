import type { HostSocket } from "./HostSocket";
import type { SocketHandlers } from "./SocketHandlers";

export function openBrowserSocket(url: string, handlers: SocketHandlers): HostSocket {
  const socket = new WebSocket(url);
  socket.addEventListener("open", handlers.onOpen);
  socket.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
      handlers.onMessage(event.data);
    }
  });
  socket.addEventListener("close", (event) => {
    handlers.onClose(event.code);
  });
  return {
    send: (text) => {
      if (socket.readyState !== WebSocket.OPEN) {
        return false;
      }
      socket.send(text);
      return true;
    },
    close: () => {
      socket.close();
    },
  };
}
