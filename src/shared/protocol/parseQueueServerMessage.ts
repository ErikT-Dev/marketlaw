import * as v from "valibot";
import { QUEUE_SERVER_MESSAGE_SCHEMA } from "./QUEUE_SERVER_MESSAGE_SCHEMA";
import type { QueueServerMessage } from "./QueueServerMessage";

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function parseQueueServerMessage(text: string): QueueServerMessage | undefined {
  const parsed = v.safeParse(QUEUE_SERVER_MESSAGE_SCHEMA, readJson(text));
  return parsed.success ? parsed.output : undefined;
}
