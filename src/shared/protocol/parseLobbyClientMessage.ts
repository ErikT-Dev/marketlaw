import type { ReasonCode } from "../ReasonCode";
import type { Result } from "../Result";
import { LobbyClientMessage } from "./LobbyClientMessage";
import { parseVersionedMessage } from "./parseVersionedMessage";

export function parseLobbyClientMessage(text: string): Result<LobbyClientMessage, ReasonCode> {
  return parseVersionedMessage(text, LobbyClientMessage);
}
