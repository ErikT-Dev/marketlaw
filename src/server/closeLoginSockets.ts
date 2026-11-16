import { LOGGED_OUT_CLOSE_CODE } from "../shared/LOGGED_OUT_CLOSE_CODE";
import { attachmentOf } from "./attachmentOf";
import type { LoginClosing } from "./LoginClosing";

export function closeLoginSockets(sockets: ReadonlyArray<WebSocket>, closing: LoginClosing): void {
  for (const socket of sockets) {
    const attachment = attachmentOf(socket);
    const isClosing =
      "tokenHash" in closing
        ? attachment.tokenHash === closing.tokenHash
        : attachment.identity?.playerId === closing.playerId;
    if (isClosing) {
      socket.close(LOGGED_OUT_CLOSE_CODE, "Logged out");
    }
  }
}
