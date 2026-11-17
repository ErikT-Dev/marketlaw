import type { ReasonCode } from "../ReasonCode";
import type { Result } from "../Result";
import { parseVersionedMessage } from "./parseVersionedMessage";
import { QueueClientMessage } from "./QueueClientMessage";

export function parseQueueClientMessage(text: string): Result<QueueClientMessage, ReasonCode> {
  return parseVersionedMessage(text, QueueClientMessage);
}
