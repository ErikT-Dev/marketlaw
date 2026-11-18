import type { PlayerId } from "../../shared/PlayerId";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { TutorialClientMessage } from "../../shared/protocol/TutorialClientMessage";
import type { Identity } from "../room/Identity";
import type { TutorialRecord } from "./TutorialRecord";

export function restartingPlayerOf(
  record: TutorialRecord | undefined,
  parsed: Result<TutorialClientMessage, ReasonCode>,
  sender: Identity | null,
): PlayerId | null {
  if (!parsed.isOk || record === undefined || sender?.playerId !== record.player.playerId) {
    return null;
  }
  const message = parsed.value;
  const isRestart =
    message.type === "tutorial" &&
    message.action.type === "restart_tutorial" &&
    message.stateVersion === record.stateVersion &&
    !record.acceptedActionIds.includes(message.actionId);
  return isRestart ? sender.playerId : null;
}
