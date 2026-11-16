import type { ReasonCode } from "../../../shared/ReasonCode";
import type { IconText } from "../../components/IconText";
import { clockText } from "../../components/clockText";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { RANKED_STANDING_TEXTS } from "./RANKED_STANDING_TEXTS";

const QUEUE_REJECTION_TEXTS: Partial<Readonly<Record<ReasonCode, IconText>>> = {
  not_registered: RANKED_STANDING_TEXTS.guest,
  email_not_confirmed: RANKED_STANDING_TEXTS.email_not_confirmed,
  invalid_game_sizes: "Something went wrong.",
};

export function rankedRejectionText(
  code: ReasonCode,
  rejoinAt: number | null,
  now: number,
): IconText {
  if (code === "rejoin_too_soon") {
    return `You can join the ranked queue again in ${clockText((rejoinAt ?? now) - now)}.`;
  }
  return QUEUE_REJECTION_TEXTS[code] ?? REJECTION_MESSAGES[code];
}
