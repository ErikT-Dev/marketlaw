import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

type RawDefaults = {
  readonly token: string;
  readonly stateVersion: number;
  readonly actionId: string;
};

export function rawMessageText(
  raw: Readonly<Record<string, unknown>>,
  defaults: RawDefaults,
): string {
  if (typeof raw["text"] === "string") {
    return raw["text"];
  }
  const message = isRecord(raw["message"]) ? raw["message"] : {};
  const details = Object.fromEntries(
    Object.entries(message).filter(([field]) => field !== "action" && field !== "seat"),
  );
  return JSON.stringify({
    protocolVersion: raw["protocol_version"] ?? PROTOCOL_VERSION,
    token: raw["token"] ?? defaults.token,
    type: "action",
    actionId: raw["action_id"] ?? defaults.actionId,
    stateVersion: raw["state_version"] ?? defaults.stateVersion,
    action: { type: message["action"], ...details },
  });
}
