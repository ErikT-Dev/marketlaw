import type { OwnQueueState } from "../../../shared/protocol/OwnQueueState";
import { clockText } from "../../components/clockText";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { RANKED_STANDING_TEXTS } from "./RANKED_STANDING_TEXTS";
import type { RankedLock } from "./RankedLock";
import type { RankedStanding } from "./RankedStanding";

function standingLockOf(standing: RankedStanding): RankedLock | null {
  switch (standing) {
    case "logged_out":
    case "guest":
      return { text: RANKED_STANDING_TEXTS[standing], canSendConfirmationAgain: false };
    case "email_not_confirmed":
      return { text: RANKED_STANDING_TEXTS[standing], canSendConfirmationAgain: true };
    case "checking":
      return { text: null, canSendConfirmationAgain: false };
    case "email_confirmed":
      return null;
  }
}

export function rankedLockOf(
  standing: RankedStanding,
  own: OwnQueueState | null,
  now: number,
): RankedLock | null {
  const lock = standingLockOf(standing);
  if (lock !== null || own?.kind !== "out") {
    return lock;
  }
  if (own.dailyLimit !== null) {
    return { text: REJECTION_MESSAGES[own.dailyLimit], canSendConfirmationAgain: false };
  }
  if (own.rejoinAt !== null && own.rejoinAt > now) {
    return {
      text: `You can join the ranked queue again in ${clockText(own.rejoinAt - now)}.`,
      canSendConfirmationAgain: false,
    };
  }
  return null;
}
