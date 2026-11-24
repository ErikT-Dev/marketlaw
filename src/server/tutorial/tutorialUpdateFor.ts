import { tutorialViewFor } from "../../rules/tutorial/tutorialViewFor";
import type { EpochMs } from "../../shared/EpochMs";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { TutorialUpdateMessage } from "../../shared/protocol/TutorialUpdateMessage";
import type { TutorialRecord } from "./TutorialRecord";

export function tutorialUpdateFor(
  record: TutorialRecord,
  acceptedActionId: string | null,
  now: EpochMs,
): TutorialUpdateMessage {
  return {
    type: "tutorial_update",
    protocolVersion: PROTOCOL_VERSION,
    acceptedActionId,
    stateVersion: record.stateVersion,
    view: tutorialViewFor(record.tutorial),
    playerIcon: record.player.icon,
    serverNow: now,
  };
}
