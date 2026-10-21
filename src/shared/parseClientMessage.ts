import type { ClientMessage } from "./ClientMessage";
import { PROTOCOL_VERSION } from "./PROTOCOL_VERSION";
import { parseJsonObject } from "./parseJsonObject";

export function parseClientMessage(raw: string): ClientMessage | null {
  const candidate = parseJsonObject(raw);
  if (candidate === null || candidate["protocolVersion"] !== PROTOCOL_VERSION) {
    return null;
  }
  const type = candidate["type"];
  if (type === "press" || type === "resync") {
    return { protocolVersion: PROTOCOL_VERSION, type };
  }
  return null;
}
