import type { ReasonCode } from "../ReasonCode";
import type { Result } from "../Result";
import { parseVersionedMessage } from "./parseVersionedMessage";
import { TutorialClientMessage } from "./TutorialClientMessage";

export function parseTutorialClientMessage(
  text: string,
): Result<TutorialClientMessage, ReasonCode> {
  return parseVersionedMessage(text, TutorialClientMessage);
}
