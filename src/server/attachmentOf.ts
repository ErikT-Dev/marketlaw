import * as v from "valibot";
import { ConnectionAttachment } from "./ConnectionAttachment";
import { NO_CONNECTION } from "./NO_CONNECTION";

export function attachmentOf(socket: WebSocket): ConnectionAttachment {
  const parsed = v.safeParse(ConnectionAttachment, socket.deserializeAttachment());
  return parsed.success ? parsed.output : NO_CONNECTION;
}
