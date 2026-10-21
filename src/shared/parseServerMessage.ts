import type { ServerMessage } from "./ServerMessage";
import { PROTOCOL_VERSION } from "./PROTOCOL_VERSION";
import { parseJsonObject } from "./parseJsonObject";

export function parseServerMessage(raw: string): ServerMessage | null {
  const candidate = parseJsonObject(raw);
  if (candidate === null || candidate["protocolVersion"] !== PROTOCOL_VERSION) {
    return null;
  }
  const version = candidate["version"];
  const pressCount = candidate["pressCount"];
  if (candidate["type"] !== "pressCount" || !Number.isSafeInteger(version) || !Number.isSafeInteger(pressCount)) {
    return null;
  }
  return {
    protocolVersion: PROTOCOL_VERSION,
    type: "pressCount",
    version: Number(version),
    pressCount: Number(pressCount),
  };
}
