import * as v from "valibot";
import { SERVER_MESSAGE_SCHEMA } from "./SERVER_MESSAGE_SCHEMA";
import type { ServerMessage } from "./ServerMessage";

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function parseServerMessage(text: string): ServerMessage | undefined {
  const parsed = v.safeParse(SERVER_MESSAGE_SCHEMA, readJson(text));
  return parsed.success ? parsed.output : undefined;
}
