import * as v from "valibot";
import { OnlineConnection } from "./OnlineConnection";

export function onlineConnectionOfSocket(socket: WebSocket): OnlineConnection | null {
  const parsed = v.safeParse(OnlineConnection, socket.deserializeAttachment());
  return parsed.success ? parsed.output : null;
}
