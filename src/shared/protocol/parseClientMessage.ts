import * as v from "valibot";
import type { ReasonCode } from "../ReasonCode";
import type { Result } from "../Result";
import { PROTOCOL_VERSION } from "../PROTOCOL_VERSION";
import { ACTION_TYPES } from "./ACTION_TYPES";
import { ClientMessage } from "./ClientMessage";

const VERSIONED = v.looseObject({ protocolVersion: v.number() });
const WITH_ACTION_TYPE = v.looseObject({
  type: v.literal("action"),
  action: v.looseObject({ type: v.string() }),
});

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isUnknownAction(message: unknown): boolean {
  const parsed = v.safeParse(WITH_ACTION_TYPE, message);
  return parsed.success && !ACTION_TYPES.some((type) => type === parsed.output.action.type);
}

export function parseClientMessage(text: string): Result<ClientMessage, ReasonCode> {
  const json = readJson(text);
  const versioned = v.safeParse(VERSIONED, json);
  if (!versioned.success) {
    return { isOk: false, error: "malformed_message" };
  }
  if (versioned.output.protocolVersion !== PROTOCOL_VERSION) {
    return { isOk: false, error: "wrong_protocol_version" };
  }
  if (isUnknownAction(json)) {
    return { isOk: false, error: "unknown_action" };
  }
  const parsed = v.safeParse(ClientMessage, json);
  return parsed.success
    ? { isOk: true, value: parsed.output }
    : { isOk: false, error: "malformed_message" };
}
