import type { PressHistory } from "./PressHistory";
import type { RecentPress } from "./RecentPress";
import { PROTOCOL_VERSION } from "./PROTOCOL_VERSION";
import { parseJsonObject } from "./parseJsonObject";

export function parsePressHistory(raw: string): PressHistory | null {
  const candidate = parseJsonObject(raw);
  const entries = candidate?.["recentPresses"];
  if (candidate?.["protocolVersion"] !== PROTOCOL_VERSION || !Array.isArray(entries)) {
    return null;
  }
  const recentPresses = entries.map(parseRecentPress);
  if (recentPresses.some((press) => press === null)) {
    return null;
  }
  return {
    protocolVersion: PROTOCOL_VERSION,
    recentPresses: recentPresses.filter((press) => press !== null),
  };
}

function parseRecentPress(entry: unknown): RecentPress | null {
  if (typeof entry !== "object" || entry === null) {
    return null;
  }
  const fields: Readonly<Record<string, unknown>> = Object.fromEntries(Object.entries(entry));
  const pressNumber = fields["pressNumber"];
  const pressedAtEpochMs = fields["pressedAtEpochMs"];
  if (!Number.isSafeInteger(pressNumber) || !Number.isSafeInteger(pressedAtEpochMs)) {
    return null;
  }
  return { pressNumber: Number(pressNumber), pressedAtEpochMs: Number(pressedAtEpochMs) };
}
